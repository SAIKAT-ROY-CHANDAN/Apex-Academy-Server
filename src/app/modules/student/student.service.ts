/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import bcrypt from 'bcryptjs';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { deleteImage } from '../../utils/deleteFile';
import {
  calculateFineAmount,
  calculatePeriodFine,
  determineCycleYear,
  MONTH_INDEX_MAP,
} from '../../utils/fineCalculation';
import {
  IStudentAuthLogin,
  IStudentCreate,
  IStudentRegister,
  IStudentUpdate,
} from './student.type';
import { generateToken } from '../../utils/generateToken';
import configs from '../../configs';
import { buildMonthlyBreakdown } from '../feeType/feeType.service';
import {
  resolveFeeEnrollmentId,
  buildEnrollmentScopeFilter,
  filterCollectionItemsByEnrollment,
  resolveFineAnchor,
} from './student.fee.resolver';
import {
  createBkashPayment,
  executeBkashPayment,
} from '../hostel-fee-collection/bkash.service';
import { sendBulkSms } from '../bulkSms/bulkSms.service';
import AppError from '../../errors/AppError';

const studentLoginIntoDB = async (payload: IStudentAuthLogin) => {
  const isValidStudent = await prisma.student.findUnique({
    where: {
      email: payload.email,
    },
    include: {
      studentEnrollments: {
        select: {
          academic_class_id: true,
          batch_id: true,
          shift_id: true,
          academic_section_id: true,
          academic_session_id: true,
        },
      },
    },
  });

  if (!isValidStudent) {
    throw new Error('Student not found with the provided email');
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    isValidStudent.password,
  );

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  if (!isValidStudent.is_active) {
    throw new Error(
      isValidStudent.status === 'PENDING'
        ? 'Your registration is pending approval. Please wait for the admin to approve your account.'
        : 'Your registration was not approved. Please contact the administration.',
    );
  }

  const accessToken = generateToken(
    {
      id: isValidStudent.id,
      email: isValidStudent.email,
      userType: 'student',
      role: 'student',
      class_id: isValidStudent.studentEnrollments?.[0]?.academic_class_id,
      name: isValidStudent.name,
    },
    configs.jwtAccessSecret as string,
    configs.accessTokenExpiration as string,
  );

  const refreshToken = generateToken(
    {
      id: isValidStudent.id,
      email: isValidStudent.email,
      userType: 'student',
      role: 'student',
      class_id: isValidStudent.studentEnrollments?.[0]?.academic_class_id,
      name: isValidStudent.name,
    },
    configs.jwtRefreshSecret as string,
    configs.refreshTokenExpiration as string,
  );

  return {
    user: {
      id: isValidStudent.id,
      email: isValidStudent.email,
      name: isValidStudent.name,
    },
    accessToken,
    refreshToken,
  };
};
const createStudentIntoDB = async (payload: IStudentCreate) => {
  const {
    enrollment,
    studentFeeCollection,
    hostelAllocation,
    hostelFeeCollection,
    ...studentData
  } = payload;

  if (studentData.email) {
    const existingStudentByEmail = await prisma.student.findUnique({
      where: {
        email: studentData.email,
      },
    });

    if (existingStudentByEmail) {
      throw new Error('Student with this email already exists');
    }
  }

  if (studentData.nid_no) {
    const existingStudentByNid = await prisma.student.findUnique({
      where: {
        nid_no: studentData.nid_no,
      },
    });

    if (existingStudentByNid) {
      throw new Error('Student with this NID number already exists');
    }
  }
  const hashedPassword = await bcrypt.hash(studentData.password, 10);

  return prisma.$transaction(async (tx: any) => {
    const newStudent = await tx.student.create({
      data: {
        ...studentData,
        password: hashedPassword,
        is_residential: !!hostelAllocation,
      },
    });

    const createdPayload: {
      student: typeof newStudent;
      enrollment: unknown;
      studentFeeCollection: unknown;
      hostelAllocation: unknown;
      hostelFeeCollection: unknown;
    } = {
      student: newStudent,
      enrollment: null,
      studentFeeCollection: null,
      hostelAllocation: null,
      hostelFeeCollection: null,
    };

    if (enrollment) {
      const {
        password: _enrollmentPassword,
        promotion_status,
        program_id: _programId,
        department_id: _departmentId,
        ...enrollmentRest
      } = enrollment as any;

      const enrollmentData: any = {
        ...enrollmentRest,
        student_id: newStudent.id,
      };
      // legacy `promotion_status` maps to current `enrollment_status`
      if (promotion_status && !enrollmentData.enrollment_status) {
        enrollmentData.enrollment_status = promotion_status;
      }

      createdPayload.enrollment = await tx.studentEnrollment.create({
        data: enrollmentData,
      });
    }

    if (studentFeeCollection) {
      const feeItemIds = studentFeeCollection.items?.map(
        (item) => item.fee_item_id,
      );

      type FeeItemConfig = {
        id: string;
        FeeItemType: string;
        isFine: boolean;
        payment_start_date: number | null;
        last_payment_date: number | null;
        everydayFine_amount: number | null;
        feeStartMonth: string;
        feeEndMonth: string;
        amount: number;
      };

      const feeItems: FeeItemConfig[] = feeItemIds?.length
        ? await tx.feeItem.findMany({
            where: { id: { in: feeItemIds } },
            select: {
              id: true,
              FeeItemType: true,
              isFine: true,
              payment_start_date: true,
              last_payment_date: true,
              everydayFine_amount: true,
              feeStartMonth: true,
              feeEndMonth: true,
              amount: true,
            },
          })
        : [];

      const feeItemMap = new Map(
        feeItems.map((feeItem) => [feeItem.id, feeItem]),
      );

      // Student is newly created, so admission = created_at
      const admissionDate = newStudent.created_at;
      const admissionYear = admissionDate.getFullYear();
      const admissionMonthIdx = admissionDate.getMonth();
      const paymentDate = new Date();

      const createdCollectionItems = [];

      const feeCollection = await tx.studentFeeCollection.create({
        data: {
          fee_type_id: studentFeeCollection.fee_type_id,
          student_id: newStudent.id,
        },
      });

      if (studentFeeCollection.items) {
        for (const item of studentFeeCollection.items) {
          const feeItem = feeItemMap.get(item.fee_item_id);
          const isPaymentTransaction = (item.paid_amount ?? 0) > 0;

          // Use fee_month/fee_year from payload for fine calculation - OneTime has null
          const periodMonthIdx = item.fee_month
            ? (MONTH_INDEX_MAP[item.fee_month] ?? 0)
            : 0;
          const periodYear = item.fee_year ?? 0;

          const isOneTimeItem = feeItem?.FeeItemType === 'OneTime';
          const fineAmount =
            feeItem && isPaymentTransaction && !isOneTimeItem
              ? (() => {
                  const cycleYear = determineCycleYear(
                    periodMonthIdx,
                    feeItem.feeStartMonth
                      ? (MONTH_INDEX_MAP[feeItem.feeStartMonth] ?? 0)
                      : 0,
                    admissionYear,
                    admissionMonthIdx,
                  );
                  const fineEligible =
                    cycleYear > admissionYear ||
                    (cycleYear === admissionYear &&
                      periodMonthIdx > admissionMonthIdx);
                  return calculatePeriodFine({
                    paymentDate,
                    periodYear: cycleYear,
                    periodMonthIdx,
                    fineEligible,
                    isPaymentTransaction: true,
                    isFine: feeItem.isFine,
                    payment_start_date: feeItem.payment_start_date,
                    last_payment_date: feeItem.last_payment_date,
                    everydayFine_amount: feeItem.everydayFine_amount,
                  });
                })()
              : 0;

          const collectionItem = await tx.studentFeeCollectionItem.create({
            data: {
              student_fee_collection_id: feeCollection.id,
              fee_item_id: item.fee_item_id,
              student_enrollment_id:
                (createdPayload.enrollment as any)?.id ?? null,
              fee_month: item.fee_month,
              fee_year: item.fee_year,
              discount_amount: item.discount_amount ?? 0,
              paid_amount: item.paid_amount ?? 0,
              line_total_amount: item.line_total_amount ?? 0,
              fine_amount: fineAmount,
            },
          });

          // Create CollectionInfo for each payment
          if ((item.paid_amount ?? 0) > 0) {
            const paymentMethod =
              item.payment_method ??
              studentFeeCollection.payment_method ??
              'CASH';
            const paymentNote =
              item.payment_note ?? studentFeeCollection.payment_note ?? null;
            await tx.collectionInfo.create({
              data: {
                student_fee_collection_item_id: collectionItem.id,
                payment_method: paymentMethod,
                payment_note: paymentNote,
                paid_amount: item.paid_amount ?? 0,
                collectedBy: 'system',
              },
            });
          }

          createdCollectionItems.push(collectionItem);
        }
      }

      createdPayload.studentFeeCollection = {
        ...feeCollection,
        studentFeeCollectionItems: createdCollectionItems,
      };
    }

    if (hostelAllocation) {
      createdPayload.hostelAllocation = await tx.hostelAllocation.create({
        data: {
          student_id: newStudent.id,
          hostel_room_id: hostelAllocation.hostel_room_id,
          ...(hostelAllocation.allocated_at
            ? { allocated_at: hostelAllocation.allocated_at }
            : {}),
        },
      });
    }

    if (hostelFeeCollection) {
      createdPayload.hostelFeeCollection = await tx.hostelFeeCollection.create({
        data: {
          student_id: newStudent.id,
          collection_date: hostelFeeCollection.collection_date,
          total_amount: hostelFeeCollection.total_amount,
          paid_amount: hostelFeeCollection.paid_amount,
          due_amount: hostelFeeCollection.due_amount,
          hostelFeeCollectionItems: hostelFeeCollection.items
            ? {
                create: hostelFeeCollection.items.map((item) => ({
                  item_name: item.item_name,
                  item_amount: item.item_amount,
                })),
              }
            : undefined,
          mealCollection: hostelFeeCollection.mealCollection
            ? {
                create: {
                  meal_count: hostelFeeCollection.mealCollection.meal_count,
                  meal_rate: hostelFeeCollection.mealCollection.meal_rate,
                  total_amount: hostelFeeCollection.mealCollection.total_amount,
                },
              }
            : undefined,
        },
        include: {
          hostelFeeCollectionItems: true,
          mealCollection: true,
        },
      });
    }

    return createdPayload;
  });
};
const registerStudentIntoDB = async (payload: IStudentRegister) => {
  const { password, ...studentData } = payload;

  if (studentData.email) {
    const existingStudentByEmail = await prisma.student.findUnique({
      where: { email: studentData.email },
    });

    if (existingStudentByEmail) {
      throw new Error('Student with this email already exists');
    }
  }

  if (studentData.nid_no) {
    const existingStudentByNid = await prisma.student.findUnique({
      where: { nid_no: studentData.nid_no },
    });

    if (existingStudentByNid) {
      throw new Error('Student with this NID number already exists');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = await prisma.student.create({
    data: {
      ...studentData,
      password: hashedPassword,
      status: 'PENDING',
      is_active: false,
    },
  });

  return newStudent;
};

const getPendingStudentsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, page, where } = buildPrismaQuery(query, {
    searchFields: [
      'name',
      'father_name',
      'mother_name',
      'email',
      'student_phone',
      'father_phone',
      'mother_phone',
      'nid_no',
    ],
  });

  const finalWhere = {
    ...(where ?? {}),
    status: 'PENDING',
  };

  const [totalItems, students] = await prisma.$transaction([
    prisma.student.count({ where: finalWhere }),
    prisma.student.findMany({
      skip,
      take,
      orderBy,
      where: finalWhere,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: students,
  };
};

const approveStudentIntoDB = async (id: string) => {
  const student = await prisma.student.findUnique({ where: { id } });

  if (!student) {
    throw new Error('Student not found');
  }

  const updated = await prisma.student.update({
    where: { id },
    data: {
      status: 'APPROVED',
      is_active: true,
    },
  });

  return updated;
};

const rejectStudentIntoDB = async (id: string) => {
  const student = await prisma.student.findUnique({ where: { id } });

  if (!student) {
    throw new Error('Student not found');
  }

  const updated = await prisma.student.update({
    where: { id },
    data: {
      status: 'REJECTED',
      is_active: false,
    },
  });

  return updated;
};
const feeCollectionIntoDB = async (
  payload: {
    student_id: string;
    created_at?: string | Date;
    studentFeeCollection: {
      fee_type_id: string;
      payment_method?: string;
      payment_note?: string;
      items: Array<{
        fee_item_id: string;
        fee_month: string;
        fee_year: number;
        discount_amount?: number;
        paid_amount?: number;
        line_total_amount?: number;
        payment_method?: string;
        payment_note?: string;
        student_enrollment_id?: string;
      }>;
    };
  },
  collectedBy: string,
) => {
  const { student_id, studentFeeCollection } = payload;
  const { fee_type_id, items } = studentFeeCollection;

  // Optional payment date from frontend calendar (created_at).
  // Falls back to server now() when not sent.
  const rawPaymentDate = (payload as any).created_at ?? undefined;
  let paymentDateForFine = new Date();
  if (rawPaymentDate !== undefined) {
    const parsed =
      rawPaymentDate instanceof Date
        ? rawPaymentDate
        : new Date(rawPaymentDate);
    if (isNaN(parsed.getTime())) {
      throw new AppError(
        400,
        'Invalid created_at — frontend must send a valid ISO date string',
      );
    }
    paymentDateForFine = parsed;
  }

  // 1. Validate student exists
  const student = await prisma.student.findUnique({
    where: { id: student_id },
    select: {
      id: true,
      name: true,
      created_at: true,
      student_phone: true,
      father_phone: true,
    },
  });
  if (!student) throw new Error('Student not found');

  // ... rest of the function stays the same until the transaction
  // 2. Validate FeeType exists
  const feeType = await prisma.feeType.findUnique({
    where: { id: fee_type_id },
  });
  if (!feeType) throw new Error('Fee type not found');
  // 3. Validate all FeeItems and fetch fine config
  type FeeItemConfig = {
    id: string;
    FeeItemType: string;
    isFine: boolean;
    payment_start_date: number | null;
    last_payment_date: number | null;
    everydayFine_amount: number | null;
    feeStartMonth: string | null;
    feeEndMonth: string | null;
    amount: number;
    amount_every_subject: number | null;
    fee_assign_for: string;
  };

  // NOTE: the same fee_item_id may legitimately appear multiple times (e.g.
  // bulk-paying several months of one monthly item), so uniqueness is
  // required only against DISTINCT ids.
  const uniqueFeeItemIds = [...new Set(items.map((item) => item.fee_item_id))];
  const feeItems: FeeItemConfig[] = await prisma.feeItem.findMany({
    where: { id: { in: uniqueFeeItemIds } },
    select: {
      id: true,
      FeeItemType: true,
      isFine: true,
      payment_start_date: true,
      last_payment_date: true,
      everydayFine_amount: true,
      feeStartMonth: true,
      feeEndMonth: true,
      amount: true,
      amount_every_subject: true,
      fee_assign_for: true,
    },
  });

  if (feeItems.length !== uniqueFeeItemIds.length) {
    throw new Error('One or more fee items are invalid');
  }

  const feeItemMap = new Map(feeItems.map((fi) => [fi.id, fi]));

  // Subject fail counts per enrollment for supplementary (enrollment-aware)
  const supplementaryEnrollmentIds = [
    ...new Set(
      items
        .filter(
          (it) =>
            feeItemMap.get(it.fee_item_id)?.fee_assign_for ===
              'SUPPLEMENTARY' && (it as any).student_enrollment_id,
        )
        .map((it) => (it as any).student_enrollment_id as string),
    ),
  ];
  let supplementFailMap = new Map<string, number>();
  if (supplementaryEnrollmentIds.length) {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        id: { in: supplementaryEnrollmentIds },
        student_id,
        enrollment_type: 'SUPPLEMENTARY',
        enrollment_status: 'WITH_BACKLOG',
      },
      select: { id: true, subject_fail_count: true },
    });
    if (enrollments.length !== supplementaryEnrollmentIds.length)
      throw new Error(
        'One or more supplementary enrollments not found or do not belong to student',
      );
    supplementFailMap = new Map(
      enrollments.map((e) => [e.id, e.subject_fail_count ?? 0]),
    );
  }
  // Fallback latest supplementary for items without explicit enrollment — legacy compatibility
  let fallbackSubjectFailCount = 0;
  const hasSupplementary = feeItems.some(
    (fi) => fi.fee_assign_for === 'SUPPLEMENTARY',
  );
  if (hasSupplementary) {
    if (supplementFailMap.size === 0) {
      const allSupp = await prisma.studentEnrollment.findMany({
        where: {
          student_id,
          enrollment_type: 'SUPPLEMENTARY',
          enrollment_status: 'WITH_BACKLOG',
        },
        select: { subject_fail_count: true },
      });
      if (allSupp.length > 1) {
        // Multiple attempts exist but caller sent no explicit enrollment — require explicit to avoid silent misattribution
        const hasAnyExplicit = items.some(
          (it) => (it as any).student_enrollment_id,
        );
        if (!hasAnyExplicit) {
          throw new Error(
            'Multiple supplementary attempts exist — student_enrollment_id is required to identify the attempt',
          );
        }
      }
      const failedEnrollment = await prisma.studentEnrollment.findFirst({
        where: { student_id, enrollment_type: 'SUPPLEMENTARY' },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        select: { subject_fail_count: true },
      });
      fallbackSubjectFailCount = failedEnrollment?.subject_fail_count ?? 0;
    }
  }

  // 4. Validate payment amounts and calculate fine per item
  // Fine uses the FEE PERIOD month (fee_month/fee_year), NOT the current date.
  // Grace anchor (plan §7.1) = current primary enrollment entry date; falls back
  // to the admission date for legacy students without an enrollment.
  const paymentDate = paymentDateForFine;
  const anchorDate = await resolveFineAnchor(
    prisma,
    student_id,
    student.created_at,
  );
  const anchorYear = anchorDate.getFullYear();
  const anchorMonthIdx = anchorDate.getMonth();

  const itemsWithFine = items.map((item) => {
    const feeItem = feeItemMap.get(item.fee_item_id)!;
    const isPaymentTransaction = (item.paid_amount ?? 0) > 0;
    const isOneTime = feeItem.FeeItemType === 'OneTime';
    const isSupplementary = feeItem.fee_assign_for === 'SUPPLEMENTARY';

    // OneTime items: no fine, no fee_month/fee_year needed, must pay in full
    const fineAmount = isOneTime
      ? 0
      : (() => {
          const periodMonthIdx = MONTH_INDEX_MAP[item.fee_month!] ?? 0;
          const periodYear = item.fee_year!;

          const cycleYear = determineCycleYear(
            periodMonthIdx,
            feeItem.feeStartMonth
              ? (MONTH_INDEX_MAP[feeItem.feeStartMonth] ?? 0)
              : 0,
            anchorYear,
            anchorMonthIdx,
          );
          const fineEligible =
            cycleYear > anchorYear ||
            (cycleYear === anchorYear && periodMonthIdx > anchorMonthIdx);

          return calculatePeriodFine({
            paymentDate,
            periodYear: cycleYear,
            periodMonthIdx,
            fineEligible,
            isPaymentTransaction,
            isFine: feeItem.isFine,
            payment_start_date: feeItem.payment_start_date,
            last_payment_date: feeItem.last_payment_date,
            everydayFine_amount: feeItem.everydayFine_amount,
          });
        })();

    // Calculate line_total_amount for supplementary - enrollment-aware, authoritative server calculation
    let lineTotalAmount = feeItem.amount;
    if (isSupplementary) {
      const explicitId = (item as any).student_enrollment_id as
        | string
        | undefined;
      const failCount = explicitId
        ? (supplementFailMap.get(explicitId) ?? fallbackSubjectFailCount)
        : fallbackSubjectFailCount;
      lineTotalAmount = (feeItem.amount_every_subject ?? 0) * failCount;
      // Do not allow client to override supplementary amount
    } else {
      if (item.line_total_amount != null)
        lineTotalAmount = item.line_total_amount;
    }

    return {
      fee_item_id: item.fee_item_id,
      fee_month: item.fee_month ?? null,
      fee_year: item.fee_year ?? null,
      discount_amount: item.discount_amount ?? 0,
      paid_amount: item.paid_amount ?? 0,
      line_total_amount: lineTotalAmount,
      fine_amount: fineAmount,
      payment_method:
        item.payment_method ?? studentFeeCollection.payment_method ?? 'CASH',
      payment_note:
        item.payment_note ?? studentFeeCollection.payment_note ?? null,
      isOneTime,
      isSupplementary,
      target_enrollment_id: (item as any).student_enrollment_id ?? null,
    };
  });

  // 4b. OneTime items must be paid in full — except SUPPLEMENTARY which supports partial
  for (const item of itemsWithFine) {
    if (item.isOneTime && !item.isSupplementary) {
      const paidTotal = (item.paid_amount ?? 0) + (item.discount_amount ?? 0);
      if (paidTotal < item.line_total_amount) {
        throw new Error(
          `OneTime item must be paid in full (amount: ${item.line_total_amount})`,
        );
      }
    }
    // Supplementary OneTime: allow partial — validate non-negative and not exceeding payable
    if (item.isOneTime && (item as any).isSupplementary) {
      const paidTotal = (item.paid_amount ?? 0) + (item.discount_amount ?? 0);
      if (paidTotal < 0)
        throw new Error('paid_amount/discount_amount must be non-negative');
      if (paidTotal > item.line_total_amount + item.fine_amount)
        throw new Error('paid_amount + discount exceeds payable');
      if (paidTotal <= 0)
        throw new Error('Nothing to collect for supplementary item');
    }
  }

  // 5. Create all records in a transaction (atomic operation)
  // The schema enforces @@unique([student_fee_collection_id, fee_item_id]) —
  // a single collection can never hold the same fee item twice. Bulk payments
  // legitimately repeat a fee item across months (e.g. paying JULY + AUGUST of
  // one monthly item together), so entries are split into batches where every
  // fee_item_id is unique; each batch becomes its own StudentFeeCollection.
  const batches: (typeof itemsWithFine)[] = [];
  const batchItemIds: Set<string>[] = [];
  for (const item of itemsWithFine) {
    let placed = false;
    for (let i = 0; i < batches.length; i++) {
      if (!batchItemIds[i].has(item.fee_item_id)) {
        batches[i].push(item);
        batchItemIds[i].add(item.fee_item_id);
        placed = true;
        break;
      }
    }
    if (!placed) {
      batches.push([item]);
      batchItemIds.push(new Set([item.fee_item_id]));
    }
  }

  // Track payments for SMS notification
  const paymentsForSms: Array<{
    studentName: string;
    phone: string;
    amount: number;
    feeTypeName: string;
    feeItemName: string;
    month?: string;
    year?: number;
    paymentMethod: string;
  }> = [];

  const response = await prisma.$transaction(async (tx: any) => {
    const createdItems: any[] = [];
    let lastFeeCollection: any = null;

    for (const batch of batches) {
      // Create StudentFeeCollection (one per unique-item batch)
      lastFeeCollection = await tx.studentFeeCollection.create({
        data: {
          fee_type_id,
          student_id,
          ...(rawPaymentDate !== undefined
            ? { created_at: paymentDateForFine }
            : {}),
        },
      });
      const feeCollectionId = lastFeeCollection.id;

      for (const item of batch) {
        // Resolve the enrollment this payment belongs to, server-side - supports explicit attempt enrollment
        const resolvedEnrollment = await resolveFeeEnrollmentId(
          tx,
          student_id,
          {
            isSupplementary: item.isSupplementary,
            targetEnrollmentId: (item as any).target_enrollment_id ?? null,
          },
        );

        // ── Double-payment barrier ──────────────────────────────────────────
        // Enrollment-scoped: same enrollment (or legacy NULL) blocks, other
        // enrollments (promoted/repeated sessions) do NOT.
        // OneTime: check only fee_item_id (no month/year).
        // Monthly: check fee_item_id + fee_month + fee_year.
        const whereClause: any = {
          fee_item_id: item.fee_item_id,
          studentFeeCollection: { student_id },
          AND: [buildEnrollmentScopeFilter([resolvedEnrollment.id])],
        };
        if (!item.isOneTime) {
          whereClause.fee_month = item.fee_month;
          whereClause.fee_year = item.fee_year;
        }

        const existingItem = await tx.studentFeeCollectionItem.findFirst({
          where: whereClause,
          include: { collectionInfos: true },
        });

        if (existingItem) {
          const existingPaid =
            existingItem.paid_amount + existingItem.discount_amount;
          const existingTotal =
            existingItem.line_total_amount + (existingItem.fine_amount ?? 0);

          if (existingPaid >= existingTotal) {
            // Fully paid — skip this item, don't create duplicate
            continue;
          }

          // Partially paid — update existing item's paid_amount
          const newPaid = existingItem.paid_amount + item.paid_amount;
          const newDiscount =
            existingItem.discount_amount + item.discount_amount;

          await tx.studentFeeCollectionItem.update({
            where: { id: existingItem.id },
            data: {
              paid_amount: newPaid,
              discount_amount: newDiscount,
            },
          });

          // Create CollectionInfo for the additional payment
          if (item.paid_amount > 0) {
            await tx.collectionInfo.create({
              data: {
                student_fee_collection_item_id: existingItem.id,
                payment_method: item.payment_method,
                payment_note: item.payment_note,
                paid_amount: item.paid_amount,
                collectedBy,
                ...(rawPaymentDate !== undefined
                  ? { created_at: paymentDateForFine }
                  : {}),
              },
            });

            // Track for SMS notification (existing item additional payment)
            const feeItem = await tx.feeItem.findUnique({
              where: { id: item.fee_item_id },
              select: { name: true },
            });
            const feeTypeForSms = await tx.feeType.findUnique({
              where: { id: fee_type_id },
              select: { name: true },
            });

            const phone = student.student_phone ?? student.father_phone;
            if (phone) {
              paymentsForSms.push({
                studentName: student.name,
                phone: phone.trim(),
                amount: item.paid_amount,
                feeTypeName: feeTypeForSms?.name ?? 'Fee',
                feeItemName: feeItem?.name ?? 'Fee Item',
                month: item.fee_month ?? undefined,
                year: item.fee_year ?? undefined,
                paymentMethod: item.payment_method,
              });
            }
          }

          createdItems.push({
            ...existingItem,
            paid_amount: newPaid,
            discount_amount: newDiscount,
          });
          continue;
        }

        // No existing item — create new
        const collectionItem = await tx.studentFeeCollectionItem.create({
          data: {
            student_fee_collection_id: feeCollectionId,
            fee_item_id: item.fee_item_id,
            student_enrollment_id: resolvedEnrollment.id,
            fee_month: item.fee_month,
            fee_year: item.fee_year,
            discount_amount: item.discount_amount,
            paid_amount: item.paid_amount,
            line_total_amount: item.line_total_amount,
            fine_amount: item.fine_amount,
            ...(rawPaymentDate !== undefined
              ? { created_at: paymentDateForFine }
              : {}),
          },
        });

        // Create CollectionInfo for each payment transaction
        if (item.paid_amount > 0) {
          await tx.collectionInfo.create({
            data: {
              student_fee_collection_item_id: collectionItem.id,
              payment_method: item.payment_method,
              payment_note: item.payment_note,
              paid_amount: item.paid_amount,
              collectedBy,
              ...(rawPaymentDate !== undefined
                ? { created_at: paymentDateForFine }
                : {}),
            },
          });

          // Track for SMS notification (outside transaction)
          const feeItem = await tx.feeItem.findUnique({
            where: { id: item.fee_item_id },
            select: { name: true },
          });
          const feeTypeForSms = await tx.feeType.findUnique({
            where: { id: fee_type_id },
            select: { name: true },
          });

          const phone = student.student_phone ?? student.father_phone;
          if (phone) {
            paymentsForSms.push({
              studentName: student.name,
              phone: phone.trim(),
              amount: item.paid_amount,
              feeTypeName: feeTypeForSms?.name ?? 'Fee',
              feeItemName: feeItem?.name ?? 'Fee Item',
              month: item.fee_month ?? undefined,
              year: item.fee_year ?? undefined,
              paymentMethod: item.payment_method,
            });
          }
        }

        createdItems.push(collectionItem);
      }
    }

    return {
      ...lastFeeCollection,
      studentFeeCollectionItems: createdItems,
    };
  });

  // Send SMS notifications after successful transaction
  for (const payment of paymentsForSms) {
    const monthYear =
      payment.month && payment.year
        ? ` for ${payment.month} ${payment.year}`
        : '';
    const message = `Dear ${payment.studentName}, your payment of ${payment.amount} BDT for ${payment.feeTypeName} - ${payment.feeItemName}${monthYear} via ${payment.paymentMethod} has been received. Thank you!`;

    try {
      await sendBulkSms({
        message,
        target: 'MANUAL',
        phoneNumbers: [payment.phone],
      });
    } catch (smsError) {
      console.error('Failed to send payment SMS:', smsError);
      // Don't throw - payment succeeded, SMS is just notification
    }
  }

  return response;
};
const getAllStudentsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [
      'name',
      'father_name',
      'mother_name',
      'email',
      'student_phone',
      'father_phone',
      'mother_phone',
    ],
    relationSearch: [
      {
        relation: 'studentEnrollments',
        mode: 'some',
        fields: ['roll_number', 'registration_number'],
      },
    ],
  });

  const [totalItems, students] = await prisma.$transaction([
    prisma.student.count({ where }),
    prisma.student.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        studentEnrollments: {
          where: { is_primary: true },
          select: {
            registration_number: true,
            roll_number: true,
            academicClass: {
              select: {
                id: true,
                class_name: true,
                department: {
                  select: {
                    department_name: true,
                  },
                },
                program: {
                  select: {
                    program_name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: students,
  };
};

const getStudentsByClassIdAndSectionIdFromDB = async (query: {
  academic_class_id: string;
  academic_section_id?: string;
}) => {
  const response = await prisma.studentEnrollment.findMany({
    where: {
      academic_class_id: query.academic_class_id,
      ...(query.academic_section_id
        ? { academic_section_id: query.academic_section_id }
        : {}),
    },
    include: {
      student: true,
      academicClass: {
        include: {
          department: true,
          program: true,
        },
      },
      academicSection: true,
      shift: true,
      batch: true,
    },
  });

  return response;
};

const sendClassMessageIntoDB = async (payload: {
  academic_class_id: string;
  batch_id?: string;
  message: string;
}) => {
  return sendBulkSms({
    target: 'CLASS',
    targetId: payload.academic_class_id,
    batchId: payload.batch_id,
    message: payload.message,
  });
};

const adminDuePaymentIntoDB = async (
  adminId: string,
  payload: {
    student_fee_collection_item_id: string;
    paid_amount: number;
    discount_amount?: number;
    payment_method?: string;
    payment_note?: string;
  },
) => {
  const fee = await prisma.studentFeeCollectionItem.findUnique({
    where: { id: payload.student_fee_collection_item_id },
    select: {
      id: true,
      fee_item_id: true,
      paid_amount: true,
      discount_amount: true,
      line_total_amount: true,
      fine_amount: true,
    },
  });

  if (!fee) throw new Error('Fee collection item not found');

  const dueAmount =
    (fee.line_total_amount || 0) +
    (fee.fine_amount || 0) -
    (fee.paid_amount || 0) -
    (fee.discount_amount || 0);

  if (dueAmount <= 0) throw new Error('Fee is already fully paid');

  const discountAmount = Math.min(
    Math.max(0, payload.discount_amount ?? 0),
    dueAmount,
  );
  const payAmount = Math.min(
    Math.max(0, payload.paid_amount),
    dueAmount - discountAmount,
  );

  if (payAmount + discountAmount <= 0) {
    throw new Error('Nothing to collect or discount for this fee item');
  }

  // Fetch student and fee details for SMS
  const feeItem = await prisma.feeItem.findUnique({
    where: { id: fee.fee_item_id },
    select: { name: true },
  });
  const feeCollection = await prisma.studentFeeCollection.findFirst({
    where: { studentFeeCollectionItems: { some: { id: fee.id } } },
    select: { student_id: true, fee_type_id: true },
  });
  const student = feeCollection
    ? await prisma.student.findUnique({
        where: { id: feeCollection.student_id },
        select: { name: true, student_phone: true, father_phone: true },
      })
    : null;
  const feeType = feeCollection
    ? await prisma.feeType.findUnique({
        where: { id: feeCollection.fee_type_id },
        select: { name: true },
      })
    : null;

  const response = await prisma.$transaction(async (tx: any) => {
    const updatedItem = await tx.studentFeeCollectionItem.update({
      where: { id: fee.id },
      data: {
        paid_amount: (fee.paid_amount || 0) + payAmount,
        discount_amount: (fee.discount_amount || 0) + discountAmount,
      },
      include: { feeItem: true },
    });

    if (payAmount > 0) {
      await tx.collectionInfo.create({
        data: {
          student_fee_collection_item_id: fee.id,
          payment_method: (payload.payment_method as any) ?? 'CASH',
          payment_note: payload.payment_note ?? null,
          paid_amount: payAmount,
          collectedBy: adminId,
        },
      });
    }

    return updatedItem;
  });

  // Send SMS notification
  if (
    student &&
    (student.student_phone || student.father_phone) &&
    payAmount > 0
  ) {
    const phone = student.student_phone ?? student.father_phone;
    const monthYear = feeCollection?.fee_type_id ? '' : ''; // Could add month/year if available
    const message = `Dear ${student.name}, your payment of ${payAmount} BDT for ${feeType?.name ?? 'Fee'} - ${feeItem?.name ?? 'Fee Item'} via ${payload.payment_method ?? 'CASH'} has been received. Thank you!`;

    console.log('[SMS] Admin due payment - sending SMS:', { phone, message });
    try {
      await sendBulkSms({
        message,
        target: 'MANUAL',
        phoneNumbers: [phone.trim()],
      });
      console.log('[SMS] Admin due payment - SMS sent successfully');
    } catch (smsError) {
      console.error('[SMS] Admin due payment - Failed to send SMS:', smsError);
    }
  } else {
    console.log('[SMS] Admin due payment - No phone or amount:', {
      student: !!student,
      phone: student?.student_phone || student?.father_phone,
      payAmount,
    });
  }

  return response;
};

const getStudentDueFeeFromDB = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      studentEnrollments: {
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          created_at: true,
          academic_class_id: true,
          academic_session_id: true,
          is_primary: true,
          enrollment_type: true,
          subject_fail_count: true,
          academicClass: { select: { id: true, class_name: true } },
          academicSession: { select: { id: true, session_name: true } },
        },
      },
      studentFeeCollections: {
        select: {
          id: true,
          fee_type_id: true,
          student_id: true,
          feeType: {
            select: { id: true, name: true },
          },
          studentFeeCollectionItems: {
            select: {
              id: true,
              student_enrollment_id: true,
              created_at: true,
              paid_amount: true,
              discount_amount: true,
              line_total_amount: true,
              fine_amount: true,
              fee_month: true,
              fee_year: true,
              feeItem: {
                select: {
                  id: true,
                  name: true,
                  amount: true,
                  FeeItemType: true,
                  isFine: true,
                  feeStartMonth: true,
                  feeEndMonth: true,
                  payment_start_date: true,
                  last_payment_date: true,
                  everydayFine_amount: true,
                },
              },
              collectionInfos: {
                select: {
                  id: true,
                  paid_amount: true,
                  payment_method: true,
                  payment_note: true,
                  collectedBy: true,
                  created_at: true,
                },
                orderBy: { created_at: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Find primary enrollment
  const enrollment = student.studentEnrollments.find((e) => e.is_primary);
  const currentClassId = enrollment?.academic_class_id;

  // Entry date: primary enrollment created_at (StudentPromotion table removed in new system)
  const entryDate = enrollment?.created_at ?? student.created_at;

  // Failed (supplementary) enrollments - each is a distinct attempt bucket — deterministic order for legacy NULL fallback
  const failedEnrollments = await prisma.studentEnrollment.findMany({
    where: {
      student_id: studentId,
      enrollment_type: 'SUPPLEMENTARY',
      enrollment_status: 'WITH_BACKLOG',
    },
    orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
    select: { id: true, academic_class_id: true, subject_fail_count: true },
  });

  // Fetch applicable fee types for student's current class (regular fees)
  let applicableFeeTypes: any[] = [];
  if (currentClassId) {
    applicableFeeTypes = await prisma.feeType.findMany({
      where: { class_id: currentClassId },
      include: {
        feeItems: {
          select: {
            id: true,
            name: true,
            amount: true,
            FeeItemType: true,
            isFine: true,
            feeStartMonth: true,
            feeEndMonth: true,
            fee_assign_for: true,
            amount_every_subject: true,
          },
        },
      },
    });
  }

  // Fetch supplementary fee structures for each failed enrollment's class
  const suppClassIds = [
    ...new Set(
      failedEnrollments
        .map((e) => e.academic_class_id)
        .filter(Boolean) as string[],
    ),
  ];
  let suppFeeStructures: any[] = [];
  if (suppClassIds.length) {
    suppFeeStructures = await prisma.feeType.findMany({
      where: { class_id: { in: suppClassIds } },
      include: {
        feeItems: {
          select: {
            id: true,
            name: true,
            amount: true,
            amount_every_subject: true,
            fee_assign_for: true,
            FeeItemType: true,
            isFine: true,
            feeStartMonth: true,
            feeEndMonth: true,
          },
        },
      },
    });
  }
  const suppStructureByClass = suppFeeStructures.reduce<Record<string, any[]>>(
    (acc, ft) => {
      (acc[ft.class_id] ??= []).push(ft);
      return acc;
    },
    {},
  );
  const supplementaryItems: any[] = [];
  for (const fe of failedEnrollments) {
    const fts = suppStructureByClass[fe.academic_class_id] ?? [];
    for (const ft of fts) {
      for (const fi of ft.feeItems) {
        if (fi.fee_assign_for !== 'SUPPLEMENTARY') continue;
        supplementaryItems.push({
          id: fi.id,
          name: fi.name,
          amount: 0,
          amount_every_subject: fi.amount_every_subject ?? 0,
          subject_fail_count: fe.subject_fail_count ?? 0,
          fee_assign_for: 'SUPPLEMENTARY',
          FeeItemType: 'OneTime',
          isFine: fi.isFine,
          feeStartMonth: null,
          feeEndMonth: null,
          source_enrollment_id: fe.id,
          fee_type_id: ft.id,
        });
      }
    }
  }
  // Regular fee types for breakdown (filter REGULAR only)
  const regularApplicableFeeTypes = applicableFeeTypes.map((ft: any) => ({
    ...ft,
    feeItems: ft.feeItems.filter(
      (fi: any) => !fi.fee_assign_for || fi.fee_assign_for === 'REGULAR',
    ),
  }));

  // One-time fees - enrollment-aware for supplementary
  const scopedCollectionItems = filterCollectionItemsByEnrollment(
    student.studentFeeCollections.flatMap(
      (collection) => collection.studentFeeCollectionItems,
    ),
    enrollment?.id ?? null,
    failedEnrollments.map((e) => e.id),
  );
  const billedCompositeIds = new Set(
    scopedCollectionItems
      .map((item) => {
        const fid = (item as any).feeItem?.id;
        if (!fid) return null;
        const enrollKey = (item as any).student_enrollment_id ?? 'NULL';
        return `${enrollKey}:${fid}`;
      })
      .filter((k): k is string => Boolean(k)),
  );
  const billedFeeItemIdsForRegular = new Set(
    scopedCollectionItems
      .map((i: any) => i.feeItem?.id)
      .filter(Boolean) as string[],
  );
  const regularUnbilled = regularApplicableFeeTypes.flatMap((feeType: any) =>
    feeType.feeItems
      .filter(
        (fi: any) =>
          fi.FeeItemType === 'OneTime' &&
          !fi.feeStartMonth &&
          !billedFeeItemIdsForRegular.has(fi.id),
      )
      .map((fi: any) => ({
        id: fi.id,
        name: fi.name,
        amount: fi.amount,
        fee_type_id: feeType.id,
        fee_type_name: feeType.name,
      })),
  );
  const supplementaryUnbilled = supplementaryItems
    .filter((fi) => {
      const composite = `${fi.source_enrollment_id}:${fi.id}`;
      if (billedCompositeIds.has(composite)) return false;
      if (billedCompositeIds.has(`NULL:${fi.id}`)) {
        const firstIdx = supplementaryItems.findIndex(
          (s: any) => s.id === fi.id,
        );
        return supplementaryItems.indexOf(fi) !== firstIdx;
      }
      return true;
    })
    .map((fi) => ({
      id: fi.id,
      name: fi.name,
      amount: (fi.amount_every_subject ?? 0) * (fi.subject_fail_count ?? 0),
      fee_type_id: fi.fee_type_id ?? 'supplementary',
      fee_type_name: 'Supplementary Exam Fees',
      source_enrollment_id: fi.source_enrollment_id,
    }));
  const unbilledOneTimeFees = [...regularUnbilled, ...supplementaryUnbilled];

  // Build breakdown using buildMonthlyBreakdown helper (now enrollment-aware)
  const breakdown = buildMonthlyBreakdown({
    entryDate,
    applicableFeeTypes: regularApplicableFeeTypes,
    collectionItems: scopedCollectionItems as any[],
    supplementaryItems,
  });

  const {
    monthlyBreakdown,
    totalPayable,
    totalPaid,
    totalDiscount,
    totalFine,
    dueAmount,
    billingStartYear,
    billingStartMonth,
    billingMonths,
    monthlyFeeAmount,
  } = breakdown;

  const totalBilled = totalPayable + totalFine;

  // Return the complete student breakdown structure
  return {
    id: student.id,
    name: student.name,
    student_phone: student.student_phone,
    studentEnrollments: student.studentEnrollments,
    studentFeeCollections: student.studentFeeCollections,
    unbilledOneTimeFees,
    feeSummary: {
      classId: currentClassId ?? null,
      sessionId: enrollment?.academic_session_id ?? null,
      billingStartYear,
      billingStartMonth,
      billingMonths,
      monthlyFeeAmount,
      totalPayable,
      totalBilled,
      totalPaid,
      totalDiscount,
      totalLineAmount: totalPayable,
      totalFine,
      dueAmount,
      monthlyBreakdown,
    },
  };
};
const searchStudentsFromDB = async (query: string) => {
  if (!query) {
    return [];
  }

  const students = await prisma.student.findMany({
    where: {
      OR: [
        {
          email: {
            contains: query,
          },
        },
        {
          studentEnrollments: {
            some: {
              OR: [
                {
                  registration_number: {
                    contains: query,
                  },
                },
                {
                  roll_number: {
                    contains: query,
                  },
                },
              ],
            },
          },
        },
      ],
    },
    include: {
      studentEnrollments: {
        select: {
          registration_number: true,
          roll_number: true,
        },
      },
    },
  });

  return students;
};

const getStudentByIdFromDB = async (studentId: string) => {
  const existingStudent = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });

  if (!existingStudent) {
    throw new Error('Student not found');
  }

  return existingStudent;
};

const getMyProfileFromDB = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      student_phone: true,
      father_name: true,
      father_phone: true,
      mother_name: true,
      mother_phone: true,
      gender: true,
      religion: true,
      nid_no: true,
      village_road: true,
      post_office: true,
      sub_district: true,
      district: true,
      created_at: true,
      is_active: true,
      studentEnrollments: {
        orderBy: [{ is_primary: 'desc' }, { created_at: 'desc' }],
        select: {
          is_primary: true,
          registration_number: true,
          batch: { select: { batch_name: true } },
          academicClass: {
            select: {
              class_name: true,
              department: { select: { department_name: true } },
              program: { select: { program_name: true } },
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  return student;
};
const updateStudentFromDB = async (
  studentId: string,
  payload: IStudentUpdate,
) => {
  const existingStudent = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });

  if (!existingStudent) {
    throw new Error('Student not found');
  }

  const updatedStudent = await prisma.student.update({
    where: {
      id: studentId,
    },
    data: payload,
  });

  if (payload?.photo && existingStudent.photo) {
    deleteImage(existingStudent.photo);
  }

  return updatedStudent;
};
const deleteStudentFromDB = async (studentId: string) => {
  const existingStudent = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });

  if (!existingStudent) {
    throw new Error('Student not found');
  }

  if (existingStudent.photo) {
    deleteImage(existingStudent.photo);
  }

  await prisma.student.delete({
    where: {
      id: studentId,
    },
  });
};
const selfStudentFeeCollectionIntoDB = async (
  studentId: string,
  payload: {
    fee_item_id: string;
    fee_month?: string;
    fee_year?: number;
    payment_method?: string;
    payment_note?: string;
    student_enrollment_id?: string;
    paid_amount?: number;
    discount_amount?: number;
  },
) => {
  const { fee_item_id, fee_month, fee_year } = payload;

  // Fetch the fee item to get fee_type_id, amount, and fine configuration
  const feeItem = await prisma.feeItem.findUnique({
    where: { id: fee_item_id },
    select: {
      id: true,
      fee_type_id: true,
      amount: true,
      amount_every_subject: true,
      fee_assign_for: true,
      FeeItemType: true,
      isFine: true,
      payment_start_date: true,
      last_payment_date: true,
      everydayFine_amount: true,
      feeStartMonth: true,
      feeEndMonth: true,
      name: true,
    },
  });

  if (!feeItem) {
    throw new Error('Fee item not found');
  }

  const isOneTime = feeItem.FeeItemType === 'OneTime';
  const isSupplementary = feeItem.fee_assign_for === 'SUPPLEMENTARY';

  // Validate student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      created_at: true,
      name: true,
      student_phone: true,
      father_phone: true,
    },
  });
  if (!student) throw new Error('Student not found');

  // Get subject_fail_count for supplementary fees — enrollment-aware: use explicit enrollment if provided
  let subjectFailCount = 0;
  if (isSupplementary) {
    if ((payload as any).student_enrollment_id) {
      const explicit = await prisma.studentEnrollment.findFirst({
        where: {
          id: (payload as any).student_enrollment_id,
          student_id: studentId,
          enrollment_type: 'SUPPLEMENTARY',
          enrollment_status: 'WITH_BACKLOG',
        },
        select: { subject_fail_count: true },
      });
      if (!explicit)
        throw new Error(
          'Supplementary enrollment not found or does not belong to student',
        );
      subjectFailCount = explicit.subject_fail_count ?? 0;
    } else {
      const suppCount = await prisma.studentEnrollment.count({
        where: {
          student_id: studentId,
          enrollment_type: 'SUPPLEMENTARY',
          enrollment_status: 'WITH_BACKLOG',
        },
      });
      if (suppCount > 1)
        throw new Error(
          'Multiple supplementary attempts exist — student_enrollment_id is required',
        );
      const failedEnrollment = await prisma.studentEnrollment.findFirst({
        where: { student_id: studentId, enrollment_type: 'SUPPLEMENTARY' },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        select: { subject_fail_count: true },
      });
      subjectFailCount = failedEnrollment?.subject_fail_count ?? 0;
    }
  }

  // Fine only for Monthly items
  const paymentDate = new Date();
  // Grace anchor (plan §7.1) = current primary enrollment entry date
  const anchorDate = await resolveFineAnchor(
    prisma,
    studentId,
    student.created_at,
  );
  const anchorYear = anchorDate.getFullYear();
  const anchorMonthIdx = anchorDate.getMonth();

  // Fine only for Monthly items — OneTime items never have fine
  let fineAmount = 0;
  if (!isOneTime && fee_month && fee_year) {
    const periodMonthIdx = MONTH_INDEX_MAP[fee_month] ?? 0;
    const periodYear = fee_year;
    const cycleYear = determineCycleYear(
      periodMonthIdx,
      feeItem.feeStartMonth ? (MONTH_INDEX_MAP[feeItem.feeStartMonth] ?? 0) : 0,
      anchorYear,
      anchorMonthIdx,
    );
    const fineEligible =
      cycleYear > anchorYear ||
      (cycleYear === anchorYear && periodMonthIdx > anchorMonthIdx);

    fineAmount = calculatePeriodFine({
      paymentDate,
      periodYear: cycleYear,
      periodMonthIdx,
      fineEligible,
      isPaymentTransaction: true,
      isFine: feeItem.isFine,
      payment_start_date: feeItem.payment_start_date,
      last_payment_date: feeItem.last_payment_date,
      everydayFine_amount: feeItem.everydayFine_amount,
    });
  }

  // Calculate line_total_amount for supplementary — authoritative server-side
  const lineTotalAmount = isSupplementary
    ? (feeItem.amount_every_subject ?? 0) * subjectFailCount
    : feeItem.amount;

  // Resolve incoming payment amounts — support partial payments
  const rawPaid = (payload as any).paid_amount;
  const rawDiscount = (payload as any).discount_amount;
  let incomingPaid: number;
  let incomingDiscount: number;
  if (rawPaid == null && rawDiscount == null) {
    // Legacy: no amount supplied → full payment (preserve existing behavior)
    incomingPaid = lineTotalAmount;
    incomingDiscount = 0;
  } else {
    incomingPaid = Number(rawPaid ?? 0);
    incomingDiscount = Number(rawDiscount ?? 0);
    if (!Number.isFinite(incomingPaid) || incomingPaid < 0)
      throw new Error('paid_amount must be a non-negative number');
    if (!Number.isFinite(incomingDiscount) || incomingDiscount < 0)
      throw new Error('discount_amount must be a non-negative number');
    if (incomingPaid + incomingDiscount > lineTotalAmount + fineAmount)
      throw new Error('paid_amount + discount_amount exceeds payable amount');
    if (incomingPaid + incomingDiscount <= 0)
      throw new Error('Nothing to collect');
  }

  const paymentMethod = (payload.payment_method as any) ?? 'CASH';
  const paymentNote = payload.payment_note ?? null;

  // Create the fee collection, collection item, and CollectionInfo in a transaction
  const response = await prisma.$transaction(async (tx: any) => {
    // Resolve the enrollment this payment belongs to, server-side - supports explicit attempt enrollment
    const resolvedEnrollment = await resolveFeeEnrollmentId(tx, studentId, {
      isSupplementary,
      targetEnrollmentId: (payload as any).student_enrollment_id ?? null,
    });

    // ── Double-payment barrier ──────────────────────────────────────────
    const whereClause: any = {
      fee_item_id: feeItem.id,
      studentFeeCollection: { student_id: studentId },
      // Enrollment-scoped: same enrollment (or legacy NULL) blocks, other
      // enrollments (promoted/repeated sessions) do NOT.
      AND: [buildEnrollmentScopeFilter([resolvedEnrollment.id])],
    };
    if (!isOneTime) {
      whereClause.fee_month = fee_month;
      whereClause.fee_year = fee_year;
    }

    const existingItem = await tx.studentFeeCollectionItem.findFirst({
      where: whereClause,
    });

    if (existingItem) {
      const existingPaid =
        existingItem.paid_amount + existingItem.discount_amount;
      const existingTotal =
        existingItem.line_total_amount + (existingItem.fine_amount ?? 0);
      const remainingDue = existingTotal - existingPaid;

      if (remainingDue <= 0) {
        throw new Error('This fee item is already fully paid');
      }
      if (incomingPaid + incomingDiscount > remainingDue)
        throw new Error('Payment exceeds remaining due amount');

      // Partially paid — update existing item with actual incoming amounts
      const newPaid = existingItem.paid_amount + incomingPaid;
      const newDiscount = existingItem.discount_amount + incomingDiscount;
      await tx.studentFeeCollectionItem.update({
        where: { id: existingItem.id },
        data: { paid_amount: newPaid, discount_amount: newDiscount },
      });

      if (incomingPaid > 0 || incomingDiscount > 0) {
        await tx.collectionInfo.create({
          data: {
            student_fee_collection_item_id: existingItem.id,
            payment_method: paymentMethod,
            payment_note: paymentNote,
            paid_amount: incomingPaid,
            collectedBy: studentId,
          },
        });
      }

      return {
        ...existingItem,
        paid_amount: newPaid,
        discount_amount: newDiscount,
      };
    }

    const feeCollection = await tx.studentFeeCollection.create({
      data: {
        fee_type_id: feeItem.fee_type_id,
        student_id: studentId,
      },
    });

    const collectionItem = await tx.studentFeeCollectionItem.create({
      data: {
        student_fee_collection_id: feeCollection.id,
        fee_item_id: feeItem.id,
        student_enrollment_id: resolvedEnrollment.id,
        fee_month,
        fee_year,
        discount_amount: incomingDiscount,
        paid_amount: incomingPaid,
        line_total_amount: lineTotalAmount,
        fine_amount: fineAmount,
      },
      include: {
        feeItem: true,
        studentFeeCollection: true,
      },
    });

    // Create CollectionInfo record
    if (incomingPaid > 0) {
      await tx.collectionInfo.create({
        data: {
          student_fee_collection_item_id: collectionItem.id,
          payment_method: paymentMethod,
          payment_note: paymentNote,
          paid_amount: incomingPaid,
          collectedBy: studentId,
        },
      });
    }

    return collectionItem;
  });

  // Send SMS notification
  const phone = student.student_phone ?? student.father_phone;
  const feeType = await prisma.feeType.findUnique({
    where: { id: feeItem.fee_type_id },
    select: { name: true },
  });

  if (phone) {
    const monthYear =
      fee_month && fee_year ? ` for ${fee_month} ${fee_year}` : '';
    const message = `Dear ${student.name}, your payment of ${feeItem.amount} BDT for ${feeType?.name ?? 'Fee'} - ${feeItem.name}${monthYear} via ${paymentMethod} has been received. Thank you!`;

    console.log('[SMS] Self fee collection - sending SMS:', { phone, message });
    try {
      await sendBulkSms({
        message,
        target: 'MANUAL',
        phoneNumbers: [phone.trim()],
      });
      console.log('[SMS] Self fee collection - SMS sent successfully');
    } catch (smsError) {
      console.error(
        '[SMS] Self fee collection - Failed to send SMS:',
        smsError,
      );
    }
  } else {
    console.log('[SMS] Self fee collection - No phone:', {
      student: student.name,
      student_phone: student.student_phone,
      father_phone: student.father_phone,
    });
  }

  return response;
};
const selfStudentDueFeeCollectionIntoDB = async (
  studentId: string,
  payload: {
    fee_item_id: string;
    payment_method?: string;
    payment_note?: string;
  },
) => {
  const fee = await prisma.studentFeeCollectionItem.findFirst({
    where: {
      studentFeeCollection: {
        student_id: studentId,
      },
      id: payload.fee_item_id,
    },
    select: {
      id: true,
      fee_item_id: true,
      fee_month: true,
      fee_year: true,
      paid_amount: true,
      discount_amount: true,
      line_total_amount: true,
      fine_amount: true,
    },
  });

  if (!fee) {
    throw new Error('Student fee collection item not found');
  }

  // Fetch the fee item configuration for fine calculation
  const feeItem = await prisma.feeItem.findUnique({
    where: { id: fee.fee_item_id },
    select: {
      isFine: true,
      payment_start_date: true,
      last_payment_date: true,
      everydayFine_amount: true,
      feeStartMonth: true,
      feeEndMonth: true,
      name: true,
    },
  });

  // Fetch actual student admission date (BUG FIX: was fabricated before)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      created_at: true,
      name: true,
      student_phone: true,
      father_phone: true,
    },
  });
  if (!student) throw new Error('Student not found');

  // Calculate fine using the EXISTING item's fee_month/fee_year as the period
  const paymentDate = new Date();
  const periodMonthIdx = fee.fee_month
    ? (MONTH_INDEX_MAP[fee.fee_month] ?? 0)
    : 0;
  const periodYear = fee.fee_year ?? 0;
  const admissionDate = student.created_at;
  const admissionYear = admissionDate.getFullYear();
  const admissionMonthIdx = admissionDate.getMonth();

  let fineAmount = fee.fine_amount ?? 0;
  if (feeItem) {
    const cycleYear = determineCycleYear(
      periodMonthIdx,
      feeItem.feeStartMonth ? (MONTH_INDEX_MAP[feeItem.feeStartMonth] ?? 0) : 0,
      admissionYear,
      admissionMonthIdx,
    );
    const fineEligible =
      cycleYear > admissionYear ||
      (cycleYear === admissionYear && periodMonthIdx > admissionMonthIdx);

    fineAmount = calculatePeriodFine({
      paymentDate,
      periodYear: cycleYear,
      periodMonthIdx,
      fineEligible,
      isPaymentTransaction: true,
      isFine: feeItem.isFine,
      payment_start_date: feeItem.payment_start_date,
      last_payment_date: feeItem.last_payment_date,
      everydayFine_amount: feeItem.everydayFine_amount,
    });
  }

  const dueAmount =
    (fee.line_total_amount || 0) +
    fineAmount -
    (fee.paid_amount || 0) -
    (fee.discount_amount || 0);

  const paymentMethod = (payload.payment_method as any) ?? 'CASH';
  const paymentNote = payload.payment_note ?? null;

  // Update the collection item and create CollectionInfo in a transaction
  const response = await prisma.$transaction(async (tx: any) => {
    const updatedItem = await tx.studentFeeCollectionItem.update({
      where: {
        id: payload.fee_item_id,
      },
      data: {
        paid_amount: (fee.paid_amount || 0) + dueAmount,
        discount_amount: fee.discount_amount,
        line_total_amount: fee.line_total_amount,
        fine_amount: feeItem?.isFine ? fineAmount : (fee.fine_amount ?? 0),
      },
    });

    // Create CollectionInfo record for this payment
    if (dueAmount > 0) {
      await tx.collectionInfo.create({
        data: {
          student_fee_collection_item_id: payload.fee_item_id,
          payment_method: paymentMethod,
          payment_note: paymentNote,
          paid_amount: dueAmount,
          collectedBy: studentId,
        },
      });
    }

    return updatedItem;
  });

  // Send SMS notification
  const phone = student.student_phone ?? student.father_phone;
  const feeCollection = await prisma.studentFeeCollection.findFirst({
    where: { studentFeeCollectionItems: { some: { id: fee.id } } },
    select: { fee_type_id: true },
  });
  const feeType = feeCollection
    ? await prisma.feeType.findUnique({
        where: { id: feeCollection.fee_type_id },
        select: { name: true },
      })
    : null;

  if (phone && dueAmount > 0) {
    const monthYear =
      fee.fee_month && fee.fee_year
        ? ` for ${fee.fee_month} ${fee.fee_year}`
        : '';
    const message = `Dear ${student.name}, your payment of ${dueAmount} BDT for ${feeType?.name ?? 'Fee'} - ${feeItem?.name ?? 'Fee Item'}${monthYear} via ${paymentMethod} has been received. Thank you!`;

    console.log('[SMS] Self due fee collection - sending SMS:', {
      phone,
      message,
    });
    try {
      await sendBulkSms({
        message,
        target: 'MANUAL',
        phoneNumbers: [phone.trim()],
      });
      console.log('[SMS] Self due fee collection - SMS sent successfully');
    } catch (smsError) {
      console.error(
        '[SMS] Self due fee collection - Failed to send SMS:',
        smsError,
      );
    }
  } else {
    console.log('[SMS] Self due fee collection - No phone or amount:', {
      student: student.name,
      phone: student.student_phone || student.father_phone,
      dueAmount,
    });
  }

  return response;
};

// Calculate total fee due for a student (includes billed + unbilled expectations)
const calculateStudentTotalDue = async (studentId: string): Promise<number> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      studentEnrollments: {
        orderBy: [{ created_at: 'desc' as const }, { id: 'desc' as const }],
        select: {
          academic_class_id: true,
          academic_session_id: true,
          id: true,
          created_at: true,
          is_primary: true,
          enrollment_type: true,
          subject_fail_count: true,
          academicClass: { select: { id: true, class_name: true } },
        },
      },
      studentFeeCollections: {
        select: {
          id: true,
          fee_type_id: true,
          studentFeeCollectionItems: {
            select: {
              id: true,
              student_enrollment_id: true,
              line_total_amount: true,
              fine_amount: true,
              paid_amount: true,
              discount_amount: true,
              fee_month: true,
              fee_year: true,
              feeItem: {
                select: {
                  id: true,
                  name: true,
                  amount: true,
                  FeeItemType: true,
                  isFine: true,
                  feeStartMonth: true,
                  feeEndMonth: true,
                  payment_start_date: true,
                  last_payment_date: true,
                  everydayFine_amount: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) throw new Error('Student not found');

  // Find primary enrollment
  const enrollment = student.studentEnrollments.find((e) => e.is_primary);
  const currentClassId = enrollment?.academic_class_id;

  // Entry date: primary enrollment created_at (StudentPromotion table removed in new system)
  const entryDate = enrollment?.created_at ?? student.created_at;

  // Failed (supplementary) enrollments - each is distinct attempt
  const failedEnrollments = await prisma.studentEnrollment.findMany({
    where: {
      student_id: studentId,
      enrollment_type: 'SUPPLEMENTARY',
      enrollment_status: 'WITH_BACKLOG',
    },
    select: { id: true, academic_class_id: true, subject_fail_count: true },
  });

  // Fetch applicable fee types for current class
  let applicableFeeTypes: any[] = [];
  if (currentClassId) {
    applicableFeeTypes = await prisma.feeType.findMany({
      where: { class_id: currentClassId },
      include: {
        feeItems: {
          select: {
            id: true,
            name: true,
            amount: true,
            FeeItemType: true,
            isFine: true,
            feeStartMonth: true,
            feeEndMonth: true,
            fee_assign_for: true,
            amount_every_subject: true,
          },
        },
      },
    });
  }
  const regularApplicableFeeTypes = applicableFeeTypes.map((ft: any) => ({
    ...ft,
    feeItems: ft.feeItems.filter(
      (fi: any) => !fi.fee_assign_for || fi.fee_assign_for === 'REGULAR',
    ),
  }));
  // Supplementary structures per failed enrollment
  const suppClassIds2 = [
    ...new Set(
      failedEnrollments
        .map((e) => e.academic_class_id)
        .filter(Boolean) as string[],
    ),
  ];
  let suppFeeStructures2: any[] = [];
  if (suppClassIds2.length) {
    suppFeeStructures2 = await prisma.feeType.findMany({
      where: { class_id: { in: suppClassIds2 } },
      include: {
        feeItems: {
          select: {
            id: true,
            name: true,
            amount: true,
            amount_every_subject: true,
            fee_assign_for: true,
            FeeItemType: true,
            isFine: true,
            feeStartMonth: true,
            feeEndMonth: true,
          },
        },
      },
    });
  }
  const suppStructureByClass2 = suppFeeStructures2.reduce<
    Record<string, any[]>
  >((acc, ft) => {
    (acc[ft.class_id] ??= []).push(ft);
    return acc;
  }, {});
  const supplementaryItems2: any[] = [];
  for (const fe of failedEnrollments) {
    const fts = suppStructureByClass2[fe.academic_class_id] ?? [];
    for (const ft of fts) {
      for (const fi of ft.feeItems) {
        if (fi.fee_assign_for !== 'SUPPLEMENTARY') continue;
        supplementaryItems2.push({
          id: fi.id,
          name: fi.name,
          amount: 0,
          amount_every_subject: fi.amount_every_subject ?? 0,
          subject_fail_count: fe.subject_fail_count ?? 0,
          fee_assign_for: 'SUPPLEMENTARY',
          FeeItemType: 'OneTime',
          isFine: fi.isFine,
          feeStartMonth: null,
          feeEndMonth: null,
          source_enrollment_id: fe.id,
          fee_type_id: ft.id,
        });
      }
    }
  }

  // Build breakdown using existing helper (enrollment-scoped)
  const scopedCollectionItems = filterCollectionItemsByEnrollment(
    student.studentFeeCollections.flatMap(
      (collection) => collection.studentFeeCollectionItems,
    ),
    enrollment?.id ?? null,
    failedEnrollments.map((e) => e.id),
  );
  const breakdown = buildMonthlyBreakdown({
    entryDate,
    applicableFeeTypes: regularApplicableFeeTypes,
    collectionItems: scopedCollectionItems as any[],
    supplementaryItems: supplementaryItems2,
  });

  return breakdown.dueAmount;
};

// bKash payment initiation for student fees
const initiateStudentBkashPayment = async (
  studentId: string,
): Promise<{
  bkashURL: string;
  paymentID: string;
  totalDue: number;
}> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Calculate total due including unbilled expectations
  const totalDue = await calculateStudentTotalDue(studentId);

  if (totalDue <= 0) {
    throw new Error('No outstanding fee due');
  }

  const merchantInvoiceNumber = `BKSTU-${Date.now()}`;

  // Explicitly tag callback URL as tuition
  const baseCallback = configs.bkash.callbackUrl as string;
  const separator = baseCallback.includes('?') ? '&' : '?';
  const callbackURL = `${baseCallback}${separator}type=tuition`;

  const { paymentID, bkashURL } = await createBkashPayment({
    amount: totalDue,
    merchantInvoiceNumber,
    callbackURL,
    payerReference: studentId,
  });

  // Track session for ownership verification & idempotency
  await prisma.bkashPaymentSession.create({
    data: {
      payment_id: paymentID,
      student_id: studentId,
      payment_type: 'TUITION',
      amount: totalDue,
      status: 'INITIATED',
    },
  });

  return { bkashURL, paymentID, totalDue };
};

const executeStudentBkashPayment = async (
  paymentID: string,
  studentId: string,
) => {
  const session = await prisma.bkashPaymentSession.findUnique({
    where: { payment_id: paymentID },
  });

  // Security Ownership Check: Prevent IDOR / hijacking
  if (session && session.student_id && session.student_id !== studentId) {
    throw new Error('Unauthorized: This payment does not belong to your account');
  }

  // Idempotency check: If already completed, return existing receipt
  if (session?.status === 'COMPLETED' && session.trx_id) {
    return {
      paidItems: [],
      transactionId: session.trx_id,
      amount: session.amount,
      alreadyPaid: true,
    };
  }

  const executeResult = await executeBkashPayment(paymentID);
  const result = await sweepStudentBkashAllocation(studentId, executeResult);

  if (session) {
    await prisma.bkashPaymentSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        trx_id: executeResult.transactionId,
      },
    });
  } else {
    await prisma.bkashPaymentSession.create({
      data: {
        payment_id: paymentID,
        student_id: studentId,
        payment_type: 'TUITION',
        amount: executeResult.amount,
        status: 'COMPLETED',
        trx_id: executeResult.transactionId,
      },
    });
  }

  return result;
};

/**
 * Plan §8.4 sweep — takes the already-executed gateway result so the
 * materialize + allocate logic is testable offline (fixtures pass a fake
 * executeResult; production wraps this with the real bKash execute call).
 */
export const sweepStudentBkashAllocation = async (
  studentId: string,
  executeResult: { transactionId: string; amount: number },
): Promise<{ paidItems: any[]; transactionId: string; amount: number }> => {
  // Pay all due items proportionally — scoped to current primary + all supplementary attempts + legacy NULL
  const [primaryEnrollment, failedEnrollments, student] = await Promise.all([
    prisma.studentEnrollment.findFirst({
      where: { student_id: studentId, is_primary: true },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: { id: true, created_at: true, academic_class_id: true },
    }),
    prisma.studentEnrollment.findMany({
      where: {
        student_id: studentId,
        enrollment_type: 'SUPPLEMENTARY',
        enrollment_status: 'WITH_BACKLOG',
      },
      select: { id: true, academic_class_id: true, subject_fail_count: true },
    }),
    prisma.student.findUnique({
      where: { id: studentId },
      select: { created_at: true },
    }),
  ]);

  const existingItems: any[] = await prisma.studentFeeCollectionItem.findMany({
    where: {
      studentFeeCollection: { student_id: studentId },
      AND: [
        buildEnrollmentScopeFilter([
          primaryEnrollment?.id,
          ...failedEnrollments.map((e) => e.id),
        ]),
      ],
    },
    select: {
      id: true,
      student_enrollment_id: true,
      line_total_amount: true,
      fine_amount: true,
      paid_amount: true,
      discount_amount: true,
      fee_month: true,
      fee_year: true,
      feeItem: {
        select: {
          id: true,
          FeeItemType: true,
          isFine: true,
          payment_start_date: true,
          last_payment_date: true,
          everydayFine_amount: true,
          feeStartMonth: true,
        },
      },
    },
  });

  // ── Materialize missing enrollment-scoped fee rows (plan §8.4) ─────────────
  // The bKash amount was charged from `calculateStudentTotalDue` (structure-based,
  // enrollment-scoped). Every obligation it counts MUST already exist as a written
  // StudentFeeCollection(Item) row for the resolved enrollment so money is never
  // collected without a matching enrollment-scoped fee record. Periods/OneTime
  // obligations without a stored row are created here (line_total from the same
  // fee config, read-side fine), then the sweep pays them like any existing row.
  const theClassId = primaryEnrollment?.academic_class_id ?? null;
  const entryDate =
    primaryEnrollment?.created_at ?? student?.created_at ?? new Date();

  let applicableFeeTypes: any[] = [];
  if (theClassId) {
    applicableFeeTypes = await prisma.feeType.findMany({
      where: { class_id: theClassId },
      include: {
        feeItems: {
          select: {
            id: true,
            name: true,
            amount: true,
            FeeItemType: true,
            isFine: true,
            feeStartMonth: true,
            feeEndMonth: true,
            payment_start_date: true,
            last_payment_date: true,
            everydayFine_amount: true,
            amount_every_subject: true,
            fee_assign_for: true,
          },
        },
      },
    });
  }
  // Build supplementary items for each failed enrollment (enrollment-aware)
  const suppClassIdsBkash = [
    ...new Set(
      failedEnrollments.map((e: any) => e.academic_class_id).filter(Boolean),
    ),
  ];
  let suppFeeStructuresBkash: any[] = [];
  if (suppClassIdsBkash.length) {
    suppFeeStructuresBkash = await prisma.feeType.findMany({
      where: { class_id: { in: suppClassIdsBkash } },
      include: {
        feeItems: {
          select: {
            id: true,
            name: true,
            amount: true,
            amount_every_subject: true,
            fee_assign_for: true,
            FeeItemType: true,
            isFine: true,
            feeStartMonth: true,
            feeEndMonth: true,
          },
        },
      },
    });
  }
  const suppStructureByClassBkash = suppFeeStructuresBkash.reduce<
    Record<string, any[]>
  >((acc, ft) => {
    (acc[ft.class_id] ??= []).push(ft);
    return acc;
  }, {});
  const supplementaryItemsBkash: any[] = [];
  for (const fe of failedEnrollments as any[]) {
    const fts = suppStructureByClassBkash[fe.academic_class_id] ?? [];
    for (const ft of fts) {
      for (const fi of ft.feeItems) {
        if (fi.fee_assign_for !== 'SUPPLEMENTARY') continue;
        supplementaryItemsBkash.push({
          id: fi.id,
          name: fi.name,
          amount: 0,
          amount_every_subject: fi.amount_every_subject ?? 0,
          subject_fail_count: fe.subject_fail_count ?? 0,
          fee_assign_for: 'SUPPLEMENTARY',
          FeeItemType: 'OneTime',
          isFine: fi.isFine,
          feeStartMonth: null,
          feeEndMonth: null,
          source_enrollment_id: fe.id,
          fee_type_id: ft.id,
        });
      }
    }
  }
  const regularApplicableFeeTypesBkash = applicableFeeTypes.map((ft: any) => ({
    ...ft,
    feeItems: ft.feeItems.filter(
      (fi: any) => !fi.fee_assign_for || fi.fee_assign_for === 'REGULAR',
    ),
  }));

  const breakdown = buildMonthlyBreakdown({
    entryDate,
    applicableFeeTypes: regularApplicableFeeTypesBkash,
    collectionItems: existingItems as any[],
    supplementaryItems: supplementaryItemsBkash,
  });

  const seen = new Map<string, boolean>();
  for (const ci of existingItems) {
    const seenKey =
      ci.fee_month && ci.fee_year != null
        ? `${ci.fee_year}-${MONTH_INDEX_MAP[ci.fee_month] ?? 0}-${ci.feeItem.id}`
        : `NULL-${ci.feeItem.id}`;
    seen.set(seenKey, true);
  }

  const missingRows: Array<{
    fee_type_id: string;
    fee_item_id: string;
    fee_month: string | null;
    fee_year: number | null;
    line_total_amount: number;
    fine_amount: number;
    student_enrollment_id: string | null;
  }> = [];
  for (const period of breakdown.monthlyBreakdown) {
    for (const pi of period.items) {
      if (pi.dueAmount <= 0) continue;
      const seenKey = `${period.year}-${period.monthNumber - 1}-${pi.feeItemId}`;
      if (seen.get(seenKey)) continue;
      missingRows.push({
        fee_type_id: pi.feeTypeId ?? '',
        fee_item_id: pi.feeItemId,
        fee_month: period.month,
        fee_year: period.year,
        line_total_amount: pi.amount,
        fine_amount: pi.fineAmount,
        student_enrollment_id: primaryEnrollment?.id ?? null,
      });
      seen.set(seenKey, true);
    }
  }
  // OneTime regular obligations with no month range
  for (const ft of regularApplicableFeeTypesBkash) {
    for (const fi of ft.feeItems) {
      if (fi.FeeItemType !== 'OneTime' || fi.feeStartMonth) continue;
      if (fi.fee_assign_for === 'SUPPLEMENTARY') continue;
      const seenKey = `NULL-${fi.id}`;
      if (seen.get(seenKey)) continue;
      let paid = 0;
      for (const ci of existingItems) {
        if (ci.feeItem.id !== fi.id || ci.fee_month || ci.fee_year != null)
          continue;
        paid += ci.paid_amount ?? 0;
      }
      if (fi.amount - paid <= 0) continue;
      missingRows.push({
        fee_type_id: ft.id,
        fee_item_id: fi.id,
        fee_month: null,
        fee_year: null,
        line_total_amount: fi.amount,
        fine_amount: 0,
        student_enrollment_id: primaryEnrollment?.id ?? null,
      });
      seen.set(seenKey, true);
    }
  }
  // Supplementary OneTime per-enrollment missing rows
  for (const supp of supplementaryItemsBkash) {
    const seenKey = `SUPP-${supp.source_enrollment_id}:${supp.id}`;
    if (seen.get(seenKey)) continue;
    // Check if already paid for this specific enrollment
    const existsForEnroll = existingItems.some(
      (ci: any) =>
        ci.feeItem.id === supp.id &&
        ci.student_enrollment_id === supp.source_enrollment_id &&
        ci.fee_month == null,
    );
    if (existsForEnroll) {
      seen.set(seenKey, true);
      continue;
    }
    // If not exists, check if due amount >0 for this enrollment (from breakdown's oneTime)
    // The breakdown already indicates due via total, but we need per-supplementary due.
    // Reuse supplementary amount: per subject * fail count
    const suppAmount =
      (supp as any).amount ??
      (supp.amount_every_subject ?? 0) * (supp.subject_fail_count ?? 0);
    // Check paid sum for this enrollment (0 since not exists)
    let paidForSupp = 0;
    for (const ci of existingItems as any[]) {
      if (
        ci.feeItem.id !== supp.id ||
        ci.student_enrollment_id !== supp.source_enrollment_id
      )
        continue;
      paidForSupp += ci.paid_amount ?? 0;
    }
    if (suppAmount - paidForSupp <= 0) continue;
    missingRows.push({
      fee_type_id: supp.fee_type_id ?? '',
      fee_item_id: supp.id,
      fee_month: null,
      fee_year: null,
      line_total_amount: suppAmount,
      fine_amount: 0,
      student_enrollment_id:
        supp.source_enrollment_id ?? primaryEnrollment?.id ?? null,
    });
    seen.set(seenKey, true);
  }

  const feeItemConfigById = new Map<string, any>();
  for (const ft of applicableFeeTypes) {
    for (const fi of ft.feeItems) feeItemConfigById.set(fi.id, fi);
  }
  for (const supp of supplementaryItemsBkash) {
    if (!feeItemConfigById.has(supp.id)) feeItemConfigById.set(supp.id, supp);
  }

  const createdRows = missingRows.length
    ? await prisma.$transaction(async (tx: any) => {
        const created: any[] = [];
        // @@unique([student_fee_collection_id, fee_item_id]) — group rows so each
        // collection holds each fee_item exactly once.
        const batches: (typeof missingRows)[] = [];
        const batchItemIds: Set<string>[] = [];
        for (const row of missingRows) {
          let placed = false;
          for (let i = 0; i < batches.length; i++) {
            if (!batchItemIds[i].has(row.fee_item_id)) {
              batches[i].push(row);
              batchItemIds[i].add(row.fee_item_id);
              placed = true;
              break;
            }
          }
          if (!placed) {
            batches.push([row]);
            batchItemIds.push(new Set([row.fee_item_id]));
          }
        }
        for (const batch of batches) {
          const collection = await tx.studentFeeCollection.create({
            data: { fee_type_id: batch[0].fee_type_id, student_id: studentId },
          });
          for (const row of batch) {
            const item = await tx.studentFeeCollectionItem.create({
              data: {
                student_fee_collection_id: collection.id,
                student_enrollment_id:
                  (row as any).student_enrollment_id ??
                  primaryEnrollment?.id ??
                  null,
                fee_item_id: row.fee_item_id,
                fee_month: row.fee_month,
                fee_year: row.fee_year,
                line_total_amount: row.line_total_amount,
                fine_amount: row.fine_amount,
                discount_amount: 0,
                paid_amount: 0,
              },
            });
            created.push({
              ...item,
              feeItem: feeItemConfigById.get(row.fee_item_id),
            });
          }
        }
        return created;
      })
    : [];

  const items = [...existingItems, ...createdRows];

  let remainingAmount = executeResult.amount;
  const paidItems: any[] = [];

  // Fine grace anchor (plan §7.1) = current primary enrollment entry date
  const bKashAnchorDate =
    primaryEnrollment?.created_at ?? student?.created_at ?? new Date();
  const bKashAnchorYear = bKashAnchorDate.getFullYear();
  const bKashAnchorMonthIdx = bKashAnchorDate.getMonth();

  for (const item of items) {
    if (remainingAmount <= 0) break;
    const lineTotal = item.line_total_amount || 0;
    const paid = item.paid_amount || 0;
    const discount = item.discount_amount || 0;

    // Recalculate fine for this period BEFORE allocating money, so the payment
    // covers the fine it accrues (parity with pre-billed rows whose fine is
    // already stored). Newly materialized rows carry fine 0 until now.
    let fineAmount = 0;
    if (item.fee_month && item.fee_year && item.feeItem) {
      const paymentDate = new Date();
      const periodMonthIdx =
        (item.fee_month ? MONTH_INDEX_MAP[item.fee_month] : 0) ?? 0;
      const periodYear = item.fee_year ?? 0;
      const cycleYear = determineCycleYear(
        periodMonthIdx,
        item.feeItem.feeStartMonth
          ? (MONTH_INDEX_MAP[item.feeItem.feeStartMonth] ?? 0)
          : 0,
        bKashAnchorYear,
        bKashAnchorMonthIdx,
      );
      const fineEligible =
        cycleYear > bKashAnchorYear ||
        (cycleYear === bKashAnchorYear && periodMonthIdx > bKashAnchorMonthIdx);
      fineAmount = calculatePeriodFine({
        paymentDate,
        periodYear: cycleYear,
        periodMonthIdx,
        fineEligible,
        isPaymentTransaction: true,
        isFine: item.feeItem.isFine,
        payment_start_date: item.feeItem.payment_start_date,
        last_payment_date: item.feeItem.last_payment_date,
        everydayFine_amount: item.feeItem.everydayFine_amount,
      });
    }

    const due = Math.max(0, lineTotal + fineAmount - paid - discount);
    if (due <= 0) continue;

    const payAmount = Math.min(due, remainingAmount);
    remainingAmount -= payAmount;

    await prisma.$transaction(async (tx) => {
      const updated = await tx.studentFeeCollectionItem.update({
        where: { id: item.id },
        data: {
          paid_amount: (item.paid_amount || 0) + payAmount,
          discount_amount: item.discount_amount || 0,
          line_total_amount: item.line_total_amount,
          fine_amount: fineAmount,
        },
      });
      await tx.collectionInfo.create({
        data: {
          student_fee_collection_item_id: item.id,
          payment_method: 'BKASH',
          payment_note: `bKash payment - TXN: ${executeResult.transactionId}`,
          paid_amount: payAmount,
          collectedBy: studentId,
        },
      });
      paidItems.push({ ...updated, paid_this: payAmount });
    });
  }

  return {
    paidItems,
    transactionId: executeResult.transactionId,
    amount: executeResult.amount,
  };
};

export const StudentService = {
  createStudentIntoDB,
  registerStudentIntoDB,
  getPendingStudentsFromDB,
  approveStudentIntoDB,
  rejectStudentIntoDB,
  getAllStudentsFromDB,
  searchStudentsFromDB,
  getStudentByIdFromDB,
  getMyProfileFromDB,
  updateStudentFromDB,
  deleteStudentFromDB,
  studentLoginIntoDB,
  feeCollectionIntoDB,
  getStudentDueFeeFromDB,
  selfStudentFeeCollectionIntoDB,
  selfStudentDueFeeCollectionIntoDB,
  adminDuePaymentIntoDB,
  sendClassMessageIntoDB,
  getStudentsByClassIdAndSectionIdFromDB,
  initiateStudentBkashPayment,
  executeStudentBkashPayment,
};

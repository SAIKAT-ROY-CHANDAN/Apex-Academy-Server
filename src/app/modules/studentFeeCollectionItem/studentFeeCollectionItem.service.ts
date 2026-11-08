import prisma from '../../../db/db.config';
import { Fee_Assign_FOR } from '../../../../generated/prisma/enums';
import { resolveFeeEnrollmentId } from '../student/student.fee.resolver';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { calculateFineAmount } from '../../utils/fineCalculation';
import AppError from '../../errors/AppError';
import {
  IStudentFeeCollectionItemCreate,
  IStudentFeeCollectionItemEdit,
  IStudentFeeCollectionItemUpdate,
} from './studentFeeCollectionItem.type';

const createStudentFeeCollectionItemIntoDB = async (
  payload: IStudentFeeCollectionItemCreate,
) => {
  const existingStudentFeeCollectionItem =
    await prisma.studentFeeCollectionItem.findUnique({
      where: {
        student_fee_collection_id_fee_item_id: {
          student_fee_collection_id: payload.student_fee_collection_id,
          fee_item_id: payload.fee_item_id,
        },
      },
    });

  if (existingStudentFeeCollectionItem) {
    throw new Error(
      'This fee item is already added to this student fee collection',
    );
  }

  // Fetch the fee item configuration to calculate the fine amount
  const feeItem = await prisma.feeItem.findUnique({
    where: { id: payload.fee_item_id },
    select: {
      isFine: true,
      payment_start_date: true,
      last_payment_date: true,
      everydayFine_amount: true,
      fee_assign_for: true,
      amount_every_subject: true,
    },
  });

  // A fine should only apply when an actual payment is being made
  // (paid_amount > 0). Creating a fee record without payment does not
  // generate a fine.
  const isPaymentTransaction = (payload.paid_amount ?? 0) > 0;

  const fineAmount = feeItem
    ? calculateFineAmount({
        isFine: feeItem.isFine,
        payment_start_date: feeItem.payment_start_date,
        last_payment_date: feeItem.last_payment_date,
        everydayFine_amount: feeItem.everydayFine_amount,
        isPaymentTransaction,
      })
    : 0;

  // Calculate line_total_amount for supplementary fees and resolve the
  // enrollment this item belongs to (regular -> current primary; supplementary
  // -> the FAILED enrollment that owns subject_fail_count - supports explicit attempt enrollment).
  let lineTotalAmount = payload.line_total_amount ?? 0;
  let studentEnrollmentId: string | null = null;
  if (feeItem) {
    const studentFeeCollection = await prisma.studentFeeCollection.findUnique({
      where: { id: payload.student_fee_collection_id },
      select: { student_id: true },
    });
    if (studentFeeCollection) {
      const isSupplementary =
        feeItem.fee_assign_for === Fee_Assign_FOR.SUPPLEMENTARY;
      const explicitId = (payload as any).student_enrollment_id as
        | string
        | undefined;
      const resolved = await resolveFeeEnrollmentId(
        prisma,
        studentFeeCollection.student_id,
        { isSupplementary, targetEnrollmentId: explicitId ?? null },
      );
      studentEnrollmentId = explicitId ?? resolved.id;
      // If explicit enrollment provided but resolver fell back to latest, still use explicit id for binding
      if (explicitId && !studentEnrollmentId) studentEnrollmentId = explicitId;
      if (isSupplementary) {
        const amountPerSubject = feeItem.amount_every_subject ?? 0;
        lineTotalAmount = amountPerSubject * resolved.subject_fail_count;
      }
    }
  }

  const newStudentFeeCollectionItem =
    await prisma.studentFeeCollectionItem.create({
      data: {
        student_fee_collection_id: payload.student_fee_collection_id,
        fee_item_id: payload.fee_item_id,
        student_enrollment_id: studentEnrollmentId,
        fee_month: payload.fee_month,
        fee_year: payload.fee_year,
        discount_amount: payload.discount_amount,
        paid_amount: payload.paid_amount,
        line_total_amount: lineTotalAmount,
        fine_amount: fineAmount,
      },
    });

  // Create CollectionInfo for each payment
  if ((payload.paid_amount ?? 0) > 0) {
    await prisma.collectionInfo.create({
      data: {
        student_fee_collection_item_id: newStudentFeeCollectionItem.id,
        payment_method: payload.payment_method ?? 'CASH',
        payment_note: payload.payment_note ?? null,
        paid_amount: payload.paid_amount ?? 0,
        collectedBy: 'system',
      },
    });
  }

  return newStudentFeeCollectionItem;
};

const getAllStudentFeeCollectionItemsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, studentFeeCollectionItems] = await prisma.$transaction([
    prisma.studentFeeCollectionItem.count({ where }),
    prisma.studentFeeCollectionItem.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        studentFeeCollection: true,
        feeItem: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: studentFeeCollectionItems,
  };
};

const getStudentFeeCollectionItemsByStudentFromDB = async (
  studentId: string,
  academicClassId?: string,
) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  return prisma.studentFeeCollectionItem.findMany({
    where: {
      studentFeeCollection: {
        student_id: studentId,
      },
      ...(academicClassId
        ? {
            studentEnrollment: {
              academic_class_id: academicClassId,
            },
          }
        : {}),
    },
    orderBy: { created_at: 'desc' },
    include: {
      feeItem: true,
      collectionInfos: true,
      studentFeeCollection: {
        include: {
          feeType: true,
          student: {
            select: {
              id: true,
              name: true,
              student_phone: true,
              father_phone: true,
              mother_phone: true,
              email: true,
            },
          },
        },
      },
      studentEnrollment: {
        include: {
          academicClass: true,
          academicSession: true,
          academicSection: true,
          batch: true,
        },
      },
    },
  });
};

const getStudentFeeCollectionItemByIdFromDB = async (
  studentFeeCollectionItemId: string,
) => {
  const existingStudentFeeCollectionItem =
    await prisma.studentFeeCollectionItem.findUnique({
      where: {
        id: studentFeeCollectionItemId,
      },
      include: {
        studentFeeCollection: true,
        feeItem: true,
      },
    });

  if (!existingStudentFeeCollectionItem) {
    throw new Error('Student fee collection item not found');
  }

  return existingStudentFeeCollectionItem;
};

const updateStudentFeeCollectionItemFromDB = async (
  studentFeeCollectionItemId: string,
  payload: IStudentFeeCollectionItemUpdate,
) => {
  const existingStudentFeeCollectionItem =
    await prisma.studentFeeCollectionItem.findUnique({
      where: {
        id: studentFeeCollectionItemId,
      },
    });

  if (!existingStudentFeeCollectionItem) {
    throw new Error('Student fee collection item not found');
  }

  const updatedStudentFeeCollectionItem =
    await prisma.studentFeeCollectionItem.update({
      where: {
        id: studentFeeCollectionItemId,
      },
      data: payload,
    });

  return updatedStudentFeeCollectionItem;
};

const editStudentFeeCollectionItemFromDB = async (
  studentFeeCollectionItemId: string,
  payload: IStudentFeeCollectionItemEdit,
) => {
  const existingStudentFeeCollectionItem =
    await prisma.studentFeeCollectionItem.findUnique({
      where: { id: studentFeeCollectionItemId },
    });

  if (!existingStudentFeeCollectionItem) {
    throw new AppError(404, 'Student fee collection item not found');
  }

  const paidAmount =
    payload.paid_amount ?? existingStudentFeeCollectionItem.paid_amount;
  const discountAmount =
    payload.discount_amount ?? existingStudentFeeCollectionItem.discount_amount;
  const payableAmount =
    existingStudentFeeCollectionItem.line_total_amount +
    existingStudentFeeCollectionItem.fine_amount;

  if (paidAmount + discountAmount > payableAmount) {
    throw new AppError(
      400,
      'paid_amount + discount_amount exceeds the payable amount',
    );
  }

  return prisma.studentFeeCollectionItem.update({
    where: { id: studentFeeCollectionItemId },
    data: {
      ...(payload.paid_amount !== undefined && {
        paid_amount: payload.paid_amount,
      }),
      ...(payload.discount_amount !== undefined && {
        discount_amount: payload.discount_amount,
      }),
    },
  });
};

const deleteStudentFeeCollectionItemFromDB = async (
  studentFeeCollectionItemId: string,
) => {
  const existingStudentFeeCollectionItem =
    await prisma.studentFeeCollectionItem.findUnique({
      where: {
        id: studentFeeCollectionItemId,
      },
    });

  if (!existingStudentFeeCollectionItem) {
    throw new Error('Student fee collection item not found');
  }

  await prisma.studentFeeCollectionItem.delete({
    where: {
      id: studentFeeCollectionItemId,
    },
  });
};

export const StudentFeeCollectionItemService = {
  createStudentFeeCollectionItemIntoDB,
  getAllStudentFeeCollectionItemsFromDB,
  getStudentFeeCollectionItemsByStudentFromDB,
  getStudentFeeCollectionItemByIdFromDB,
  updateStudentFeeCollectionItemFromDB,
  editStudentFeeCollectionItemFromDB,
  deleteStudentFeeCollectionItemFromDB,
};

import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';

const allFinanceReportsOverview = async () => {
  const response = await prisma.$transaction(async (prisma) => {
    const totalOrganizationExpenses = await prisma.expense.aggregate({
      _sum: {
        total_amount: true,
      },
    });

    const totalOrganizationIncome = await prisma.deposit.aggregate({
      _sum: {
        total_amount: true,
      },
    });

    const totalStudentCollection =
      await prisma.studentFeeCollectionItem.aggregate({
        _sum: {
          paid_amount: true,
        },
      });

    const totalStudentDueAmount =
      await prisma.studentFeeCollectionItem.aggregate({
        _sum: {
          discount_amount: true,
          paid_amount: true,
          line_total_amount: true,
          fine_amount: true,
        },
      });

    const calculateDueAmount =
      (totalStudentDueAmount._sum.line_total_amount || 0) -
      ((totalStudentDueAmount._sum.paid_amount || 0) +
        (totalStudentDueAmount._sum.discount_amount || 0));

    const totalFineAmount = totalStudentDueAmount._sum.fine_amount || 0;

    return {
      totalOrganizationExpenses:
        totalOrganizationExpenses._sum.total_amount || 0,
      totalOrganizationIncome: totalOrganizationIncome._sum.total_amount || 0,
      totalStudentCollection: totalStudentCollection._sum.paid_amount || 0,
      totalStudentDueAmount: calculateDueAmount,
      totalFineAmount: totalFineAmount,
    };
  });

  return response;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORGANIZATIONAL EXPENSES REPORT
// Grouped by month, sorted by date, with day-wise filtering via builder query
// ─────────────────────────────────────────────────────────────────────────────

const getOrganizationalExpensesReport = async (query: QueryParams) => {
  const { take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, expenseGroups] = await prisma.$transaction([
    prisma.expense.count({ where }),
    prisma.expense.groupBy({
      by: ['expense_date'],
      where,
      _sum: {
        total_amount: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        expense_date: 'asc',
      },
    }),
  ]);

  // Group by month (YYYY-MM) and aggregate totals
  const monthMap = new Map<
    string,
    {
      month: string;
      year: number;
      totalAmount: number;
      expenseCount: number;
      days: {
        date: string;
        totalAmount: number;
        expenseCount: number;
      }[];
    }
  >();

  for (const group of expenseGroups) {
    const date = new Date(group.expense_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = date.toISOString().split('T')[0];

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        year: date.getFullYear(),
        totalAmount: 0,
        expenseCount: 0,
        days: [],
      });
    }

    const monthData = monthMap.get(monthKey)!;
    const amount = group._sum?.total_amount || 0;
    const count =
      typeof group._count === 'object' && group._count !== null
        ? group._count._all || 0
        : 0;

    monthData.totalAmount += amount;
    monthData.expenseCount += count;

    // Add day-wise breakdown
    const existingDay = monthData.days.find((d) => d.date === dayKey);
    if (existingDay) {
      existingDay.totalAmount += amount;
      existingDay.expenseCount += count;
    } else {
      monthData.days.push({
        date: dayKey,
        totalAmount: amount,
        expenseCount: count,
      });
    }
  }

  // Sort days within each month by date
  for (const monthData of monthMap.values()) {
    monthData.days.sort((a, b) => a.date.localeCompare(b.date));
  }

  const data = Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ORGANIZATIONAL INCOME REPORT
// Grouped by month, sorted by date, with day-wise filtering via builder query
// ─────────────────────────────────────────────────────────────────────────────

const getOrganizationalIncomeReport = async (query: QueryParams) => {
  const { take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, depositGroups] = await prisma.$transaction([
    prisma.deposit.count({ where }),
    prisma.deposit.groupBy({
      by: ['deposit_date'],
      where,
      _sum: {
        total_amount: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        deposit_date: 'asc',
      },
    }),
  ]);

  // Group by month (YYYY-MM) and aggregate totals
  const monthMap = new Map<
    string,
    {
      month: string;
      year: number;
      totalAmount: number;
      incomeCount: number;
      days: {
        date: string;
        totalAmount: number;
        incomeCount: number;
      }[];
    }
  >();

  for (const group of depositGroups) {
    const date = new Date(group.deposit_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = date.toISOString().split('T')[0];

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        year: date.getFullYear(),
        totalAmount: 0,
        incomeCount: 0,
        days: [],
      });
    }

    const monthData = monthMap.get(monthKey)!;
    const amount = group._sum?.total_amount || 0;
    const count =
      typeof group._count === 'object' && group._count !== null
        ? group._count._all || 0
        : 0;

    monthData.totalAmount += amount;
    monthData.incomeCount += count;

    // Add day-wise breakdown
    const existingDay = monthData.days.find((d) => d.date === dayKey);
    if (existingDay) {
      existingDay.totalAmount += amount;
      existingDay.incomeCount += count;
    } else {
      monthData.days.push({
        date: dayKey,
        totalAmount: amount,
        incomeCount: count,
      });
    }
  }

  // Sort days within each month by date
  for (const monthData of monthMap.values()) {
    monthData.days.sort((a, b) => a.date.localeCompare(b.date));
  }

  const data = Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data,
  };
};



// ─────────────────────────────────────────────────────────────────────────────
// 3. STUDENT COLLECTION REPORT
// Grouped by month with day-wise breakdown, including per-student details
// Filterable by date range, student_id, program, department, academic class
// ─────────────────────────────────────────────────────────────────────────────

const getStudentCollectionReport = async (query: QueryParams) => {
  const searchTerm = query.searchTerm?.trim();
  const parsedFilter =
    typeof query.filter === 'string'
      ? JSON.parse(query.filter || '{}')
      : query.filter || {};

  const {
    program_id,
    department_id,
    academic_class_id,
    student_id,
    from_date,
    to_date,
  } = parsedFilter;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build base where clause (paid items only)
  const baseWhere: any = {
    paid_amount: { gt: 0 },
  };

  // Date range filter on studentFeeCollectionItem.created_at
  if (from_date || to_date) {
    baseWhere.created_at = {};
    if (from_date) baseWhere.created_at.gte = new Date(from_date);
    if (to_date)
      baseWhere.created_at.lte = new Date(to_date + 'T23:59:59.999Z');
  }

  // Direct student_id filter (on studentFeeCollection.student_id)
  if (student_id) {
    baseWhere.studentFeeCollection = {
      ...(baseWhere.studentFeeCollection || {}),
      student_id,
    };
  }

  // Academic filters: program_id, department_id, academic_class_id
  // These go through studentFeeCollection.student.studentEnrollments.academicClass
  const enrollmentConditions: any = {};
  if (academic_class_id) {
    enrollmentConditions.academic_class_id = academic_class_id;
  }
  if (department_id) {
    enrollmentConditions.academicClass = {
      ...(enrollmentConditions.academicClass || {}),
      department_id,
    };
  }
  if (program_id) {
    enrollmentConditions.academicClass = {
      ...(enrollmentConditions.academicClass || {}),
      program_id,
    };
  }

  if (Object.keys(enrollmentConditions).length > 0) {
    // Plan §9.1: academic filters resolve against the ITEM's own enrollment
    // (student_enrollment_id). Legacy NULL rows stay visible via the previous
    // student-level `some` join so unmigrated records still show up.
    const scopedEnrollment = {
      OR: [
        { studentEnrollment: enrollmentConditions },
        {
          student_enrollment_id: null,
          studentFeeCollection: {
            student: {
              studentEnrollments: { some: enrollmentConditions },
            },
          },
        },
      ],
    };
    baseWhere.AND = [
      ...(baseWhere.AND || []),
      scopedEnrollment,
    ];
  }

  // Search filter on student name
  if (searchTerm) {
    baseWhere.studentFeeCollection = {
      ...(baseWhere.studentFeeCollection || {}),
      student: {
        ...(baseWhere.studentFeeCollection?.student || {}),
        name: { contains: searchTerm },
      },
    };
  }

  const [totalItems, collectionItems] = await prisma.$transaction([
    prisma.studentFeeCollectionItem.count({ where: baseWhere }),
    prisma.studentFeeCollectionItem.findMany({
      skip,
      take: limit,
      where: baseWhere,
      include: {
        studentFeeCollection: {
          include: {
            student: {
              include: {
                studentEnrollments: {
                  orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
                  include: {
                    academicClass: true,
                  },
                },
              },
            },
          },
        },
        feeItem: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    }),
  ]);

  // Group by month (YYYY-MM) and aggregate totals
  const monthMap = new Map<
    string,
    {
      month: string;
      year: number;
      totalAmount: number;
      collectionCount: number;
      days: {
        date: string;
        totalAmount: number;
        collectionCount: number;
      }[];
    }
  >();

  const studentMap = new Map<
    string,
    {
      student_id: string;
      student_name: string;
      registration_number: string;
      class_name: string;
      totalAmount: number;
      collectionCount: number;
      lastCollectionDate: string;
    }
  >();

  for (const item of collectionItems) {
    if (!item.created_at) continue;

    const date = new Date(item.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = date.toISOString().split('T')[0];

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        year: date.getFullYear(),
        totalAmount: 0,
        collectionCount: 0,
        days: [],
      });
    }

    const monthData = monthMap.get(monthKey)!;
    const amount = item.paid_amount || 0;

    monthData.totalAmount += amount;
    monthData.collectionCount += 1;

    const existingDay = monthData.days.find((d) => d.date === dayKey);
    if (existingDay) {
      existingDay.totalAmount += amount;
      existingDay.collectionCount += 1;
    } else {
      monthData.days.push({
        date: dayKey,
        totalAmount: amount,
        collectionCount: 1,
      });
    }

    // Aggregate per-student - use primary enrollment deterministically
    const student = item.studentFeeCollection?.student;
    if (student) {
      const enrollment = student.studentEnrollments?.find((e: any) => e.is_primary) ?? student.studentEnrollments?.[0];
      const className = enrollment?.academicClass?.class_name ?? '';

      if (!studentMap.has(student.id)) {
        studentMap.set(student.id, {
          student_id: student.id,
          student_name: student.name,
          registration_number: enrollment?.registration_number ?? '',
          class_name: className,
          totalAmount: 0,
          collectionCount: 0,
          lastCollectionDate: dayKey,
        });
      }

      const studentData = studentMap.get(student.id)!;
      studentData.totalAmount += amount;
      studentData.collectionCount += 1;
      if (dayKey > studentData.lastCollectionDate) {
        studentData.lastCollectionDate = dayKey;
      }
    }
  }

  for (const monthData of monthMap.values()) {
    monthData.days.sort((a, b) => a.date.localeCompare(b.date));
  }

  const data = Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  const detailRecords = collectionItems.map((item) => {
    const enrollment =
      item.studentFeeCollection?.student?.studentEnrollments?.find((e: any) => e.is_primary) ??
      item.studentFeeCollection?.student?.studentEnrollments?.[0];
    return {
      id: item.id,
      student_id: item.studentFeeCollection?.student_id ?? '',
      student_name: item.studentFeeCollection?.student?.name ?? '',
      registration_number: enrollment?.registration_number ?? '',
      class_name: enrollment?.academicClass?.class_name ?? '',
      fee_item_name: item.feeItem?.name ?? '',
      paid_amount: item.paid_amount || 0,
      discount_amount: item.discount_amount || 0,
      line_total_amount: item.line_total_amount || 0,
      fine_amount: item.fine_amount || 0,
      collection_date: item.created_at
        ? new Date(item.created_at).toISOString().split('T')[0]
        : '',
    };
  });

  return {
    meta: calculatePaginationMeta(totalItems, page, limit),
    data: {
      monthly: data,
      students: Array.from(studentMap.values()).sort(
        (a, b) => b.totalAmount - a.totalAmount,
      ),
      records: detailRecords,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. STUDENT DUE AMOUNT REPORT
// Shows which students have outstanding due amounts with a filterable list
// Filterable by program, department, academic_class, date range, and search term
// ─────────────────────────────────────────────────────────────────────────────

const getStudentDueReport = async (query: QueryParams) => {
  const searchTerm = query.searchTerm?.trim();
  const parsedFilter =
    typeof query.filter === 'string'
      ? JSON.parse(query.filter || '{}')
      : query.filter || {};

  const {
    program_id,
    department_id,
    academic_class_id,
    from_date,
    to_date,
  } = parsedFilter;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build base where: items that may still owe money.
  // True due = line_total + fine - paid - discount (matches the payment
  // module's "fully paid" rule: paid + discount >= line_total + fine).
  // An item can owe when line_total > paid (fee unpaid) OR when it carries a
  // fine (fine unpaid even if the fee itself is fully paid). Student-level
  // net-due filtering below drops anything that doesn't actually owe.
  const baseWhere: any = {
    OR: [
      {
        line_total_amount: {
          gt: prisma.studentFeeCollectionItem.fields.paid_amount,
        },
      },
      {
        fine_amount: { gt: 0 },
      },
    ],
  };

  // Date range filter on created_at
  if (from_date || to_date) {
    baseWhere.created_at = {};
    if (from_date) baseWhere.created_at.gte = new Date(from_date);
    if (to_date)
      baseWhere.created_at.lte = new Date(to_date + 'T23:59:59.999Z');
  }

  // Academic filters via studentFeeCollection.student.studentEnrollments.academicClass
  const enrollmentConditions: any = {};
  if (academic_class_id) {
    enrollmentConditions.academic_class_id = academic_class_id;
  }
  if (department_id) {
    enrollmentConditions.academicClass = {
      ...(enrollmentConditions.academicClass || {}),
      department_id,
    };
  }
  if (program_id) {
    enrollmentConditions.academicClass = {
      ...(enrollmentConditions.academicClass || {}),
      program_id,
    };
  }

  if (Object.keys(enrollmentConditions).length > 0) {
    // Plan §9.1: academic filters resolve against the ITEM's own enrollment
    // (student_enrollment_id). Legacy NULL rows stay visible via the previous
    // student-level `some` join so unmigrated records still show up.
    const scopedEnrollment = {
      OR: [
        { studentEnrollment: enrollmentConditions },
        {
          student_enrollment_id: null,
          studentFeeCollection: {
            student: {
              studentEnrollments: { some: enrollmentConditions },
            },
          },
        },
      ],
    };
    baseWhere.AND = [
      ...(baseWhere.AND || []),
      scopedEnrollment,
    ];
  }

  // Fetch all matching items — student-level pagination and the global summary
  // both require the full grouped result set. Search is applied in JS below so
  // it can match name, phone, father phone and registration number.
  const collectionItems = await prisma.studentFeeCollectionItem.findMany({
    where: baseWhere,
    include: {
      studentFeeCollection: {
        include: {
          student: {
            include: {
              studentEnrollments: {
                orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
                include: {
                  academicClass: true,
                  academicSession: true,
                },
              },
            },
          },
        },
      },
      feeItem: true,
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  // Aggregate due amount per student
  const studentMap = new Map<
    string,
    {
      student_id: string;
      student_name: string;
      student_phone: string;
      father_phone: string;
      class_name: string;
      session_name: string;
      registration_number: string;
      totalLineAmount: number;
      totalPaidAmount: number;
      totalDiscountAmount: number;
      totalFineAmount: number;
      dueAmount: number;
      feeItems: {
        fee_item_name: string;
        line_total_amount: number;
        paid_amount: number;
        discount_amount: number;
        fine_amount: number;
        due_amount: number;
      }[];
    }
  >();

  for (const item of collectionItems) {
    const student = item.studentFeeCollection?.student;
    if (!student) continue;

    const studentKey = student.id;
    if (!studentMap.has(studentKey)) {
      const enrollment = student.studentEnrollments?.find((e: any) => e.is_primary) ?? student.studentEnrollments?.[0];
      studentMap.set(studentKey, {
        student_id: student.id,
        student_name: student.name,
        student_phone: student.student_phone ?? '',
        father_phone: student.father_phone ?? '',
        class_name: enrollment?.academicClass?.class_name ?? '',
        session_name: enrollment?.academicSession?.session_name ?? '',
        registration_number: enrollment?.registration_number ?? '',
        totalLineAmount: 0,
        totalPaidAmount: 0,
        totalDiscountAmount: 0,
        totalFineAmount: 0,
        dueAmount: 0,
        feeItems: [],
      });
    }

    const studentData = studentMap.get(studentKey)!;
    const lineTotal = item.line_total_amount || 0;
    const paid = item.paid_amount || 0;
    const discount = item.discount_amount || 0;
    const fine = item.fine_amount || 0;
    // Due includes the fine: the payment module treats line_total + fine as the
    // payable amount, so the outstanding balance is line_total + fine - paid - discount.
    const due = lineTotal + fine - paid - discount;

    studentData.totalLineAmount += lineTotal;
    studentData.totalPaidAmount += paid;
    studentData.totalDiscountAmount += discount;
    studentData.totalFineAmount += fine;
    studentData.dueAmount += due;

    studentData.feeItems.push({
      fee_item_name: item.feeItem?.name ?? '',
      line_total_amount: lineTotal,
      paid_amount: paid,
      discount_amount: discount,
      fine_amount: fine,
      due_amount: due,
    });
  }

  // Filter to students with due amount > 0
  let students = Array.from(studentMap.values()).filter(
    (s) => s.dueAmount > 0,
  );

  // Apply search term filter (by name, phone, registration)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    students = students.filter(
      (s) =>
        s.student_name.toLowerCase().includes(term) ||
        s.student_phone.toLowerCase().includes(term) ||
        s.father_phone.toLowerCase().includes(term) ||
        s.registration_number.toLowerCase().includes(term),
    );
  }

  // Sort by due amount descending
  students.sort((a, b) => b.dueAmount - a.dueAmount);

  // Global summary across ALL matching students (not just the current page)
  const totalDueAmount = students.reduce((sum, s) => sum + s.dueAmount, 0);
  const totalStudentsWithDue = students.length;
  const totalLineAmount = students.reduce(
    (sum, s) => sum + s.totalLineAmount,
    0,
  );
  const totalPaidAmount = students.reduce(
    (sum, s) => sum + s.totalPaidAmount,
    0,
  );

  // Student-level pagination — a student's fee items are never split across pages
  const pagedStudents = students.slice(skip, skip + limit);

  return {
    meta: calculatePaginationMeta(totalStudentsWithDue, page, limit),
    data: {
      summary: {
        totalDueAmount,
        totalStudentsWithDue,
        totalLineAmount,
        totalPaidAmount,
      },
      students: pagedStudents,
    },
  };
};

export const reportService = {
  allFinanceReportsOverview,
  getOrganizationalExpensesReport,
  getOrganizationalIncomeReport,
  getStudentCollectionReport,
  getStudentDueReport,
};

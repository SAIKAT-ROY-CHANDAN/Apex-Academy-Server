import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CalculateTeacherAdvancePayload,
  CalculateStaffAdvancePayload,
  CreateSalaryAdvanceInput,
  UpdateSalaryAdvanceInput,
} from './salaryAdvance.type';

const advanceInclude = {
  teacher: {
    select: {
      id: true,
      full_name: true,
      phone: true,
      email: true,
    },
  },
  staff: {
    select: {
      id: true,
      full_name: true,
      phone: true,
      email: true,
    },
  },
  paid_by_admin: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

const ensureSingleRecipient = (teacherId?: string, staffId?: string) => {
  if (!teacherId && !staffId) {
    throw new AppError(400, 'Either teacher_id or staff_id is required');
  }

  if (teacherId && staffId) {
    throw new AppError(400, 'Provide only one of teacher_id or staff_id');
  }
};

const safeParseJSON = (value: unknown, fallback: any) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const createSalaryAdvanceIntoDB = async (
  payload: CreateSalaryAdvanceInput,
  paidByAdminId?: string,
) => {
  ensureSingleRecipient(payload.teacher_id, payload.staff_id);

  const givenAt = new Date(payload.given_at);
  const month = givenAt.getMonth() + 1;
  const year = givenAt.getFullYear();

  const payrollCycle = await prisma.payrollCycle.findUnique({
    where: {
      month_year: {
        month,
        year,
      },
    },
  });

  if (payrollCycle) {
    if (payload.teacher_id) {
      const alreadyPaid = await prisma.teacherPayroll.findUnique({
        where: {
          payroll_cycle_id_teacher_id: {
            payroll_cycle_id: payrollCycle.id,
            teacher_id: payload.teacher_id,
          },
        },
      });

      if (alreadyPaid) {
        throw new AppError(
          400,
          'This teacher has already been paid for this payroll cycle. Advance for this month is no longer allowed.',
        );
      }
    }

    if (payload.staff_id) {
      const alreadyPaid = await prisma.staffPayroll.findUnique({
        where: {
          payroll_cycle_id_staff_id: {
            payroll_cycle_id: payrollCycle.id,
            staff_id: payload.staff_id,
          },
        },
      });

      if (alreadyPaid) {
        throw new AppError(
          400,
          'This staff member has already been paid for this payroll cycle. Advance for this month is no longer allowed.',
        );
      }
    }
  }

  const response = await prisma.salaryAdvance.create({
    data: {
      ...(payload.teacher_id && {
        teacher: {
          connect: {
            id: payload.teacher_id,
          },
        },
      }),

      ...(payload.staff_id && {
        staff: {
          connect: {
            id: payload.staff_id,
          },
        },
      }),

      ...(paidByAdminId && {
        paid_by_admin: {
          connect: {
            id: paidByAdminId,
          },
        },
      }),

      advance_amount: payload.advance_amount,
      reason: payload.reason,
      given_at: new Date(payload.given_at),
      payment_method: payload.payment_method,
      transaction_id: payload.transaction_id,
      bkash_sender_number: payload.bkash_sender_number,
      bkash_receiver_number: payload.bkash_receiver_number,
      payment_note: payload.payment_note,
      advance_status: payload.advance_status,
    },
    include: advanceInclude,
  });

  return response;
};

const getAllSalaryAdvancesFromDB = async (
  query: QueryParams & {
    teacher_id?: string;
    staff_id?: string;
    month?: string | number;
    year?: string | number;
  },
) => {
  const rawFilter = safeParseJSON(query.filter, {});

  const {
    month: filterMonth,
    year: filterYear,
    teacher_id: filterTeacherId,
    staff_id: filterStaffId,
    ...restFilter
  } = rawFilter;

  const teacher_id = query.teacher_id ?? filterTeacherId;
  const staff_id = query.staff_id ?? filterStaffId;
  const month = query.month ?? filterMonth;
  const year = query.year ?? filterYear;

  const { orderBy, skip, take, where, page } = buildPrismaQuery(
    { ...query, filter: restFilter },
    {
      searchFields: [
        'reason',
        'transaction_id',
        'bkash_sender_number',
        'bkash_receiver_number',
      ],
    },
  );

  const combinedWhere: Record<string, any> = {
    ...where,
    ...(teacher_id && { teacher_id }),
    ...(staff_id && { staff_id }),
  };

  if (month && year) {
    const m = Number(month);
    const y = Number(year);
    if (!Number.isNaN(m) && !Number.isNaN(y)) {
      combinedWhere.given_at = {
        gte: new Date(y, m - 1, 1),
        lt: new Date(y, m, 1),
      };
    }
  } else if (year) {
    const y = Number(year);
    if (!Number.isNaN(y)) {
      combinedWhere.given_at = {
        gte: new Date(y, 0, 1),
        lt: new Date(y + 1, 0, 1),
      };
    }
  }

  const [totalItems, salaryAdvances] = await prisma.$transaction([
    prisma.salaryAdvance.count({ where: combinedWhere }),
    prisma.salaryAdvance.findMany({
      where: combinedWhere,
      orderBy,
      skip,
      take,
      include: advanceInclude,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: salaryAdvances,
  };
};

const getSalaryAdvanceByIdFromDB = async (id: string) => {
  const response = await prisma.salaryAdvance.findUnique({
    where: { id },
    include: advanceInclude,
  });

  return response;
};

const updateSalaryAdvanceByIdIntoDB = async (
  id: string,
  payload: UpdateSalaryAdvanceInput,
) => {
  if (payload.teacher_id || payload.staff_id) {
    ensureSingleRecipient(payload.teacher_id, payload.staff_id);
  }

  const response = await prisma.salaryAdvance.update({
    where: { id },
    data: {
      ...(payload.teacher_id && {
        teacher_id: payload.teacher_id,
        staff_id: null,
      }),
      ...(payload.staff_id && { staff_id: payload.staff_id, teacher_id: null }),
      ...(payload.advance_amount !== undefined && {
        advance_amount: payload.advance_amount,
      }),
      ...(payload.reason !== undefined && { reason: payload.reason }),
      ...(payload.given_at && { given_at: new Date(payload.given_at) }),
      ...(payload.payment_method && { payment_method: payload.payment_method }),
      ...(payload.transaction_id !== undefined && {
        transaction_id: payload.transaction_id,
      }),
      ...(payload.bkash_sender_number !== undefined && {
        bkash_sender_number: payload.bkash_sender_number,
      }),
      ...(payload.bkash_receiver_number !== undefined && {
        bkash_receiver_number: payload.bkash_receiver_number,
      }),
      ...(payload.payment_note !== undefined && {
        payment_note: payload.payment_note,
      }),
      ...(payload.is_deducted !== undefined && {
        is_deducted: payload.is_deducted,
      }),
      ...(payload.advance_status && { advance_status: payload.advance_status }),
    },
    include: advanceInclude,
  });

  return response;
};

const deleteSalaryAdvanceByIdFromDB = async (id: string) => {
  const response = await prisma.salaryAdvance.delete({
    where: { id },
  });

  return response;
};

export const calculateTeacherAdvance = async ({
  teacherId,
  month,
  year,
}: CalculateTeacherAdvancePayload) => {
  // Step 1
  // Get all active advances for this payroll month

  const advances = await prisma.salaryAdvance.findMany({
    where: {
      teacher_id: teacherId,
      advance_status: 'ACTIVE',
      given_at: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  });

  // Step 2
  // Calculate total deduction

  const totalAdvance = advances.reduce(
    (sum, advance) => sum + advance.advance_amount,
    0,
  );

  return {
    amount: totalAdvance,
    advanceIds: advances.map((advance) => advance.id),
  };
};

export const calculateStaffAdvance = async ({
  staffId,
  month,
  year,
}: CalculateStaffAdvancePayload) => {
  const advances = await prisma.salaryAdvance.findMany({
    where: {
      staff_id: staffId,
      advance_status: 'ACTIVE',
      given_at: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  });

  const totalAdvance = advances.reduce(
    (sum, advance) => sum + advance.advance_amount,
    0,
  );

  return {
    amount: totalAdvance,
    advanceIds: advances.map((advance) => advance.id),
  };
};

export const SalaryAdvanceService = {
  createSalaryAdvanceIntoDB,
  getAllSalaryAdvancesFromDB,
  getSalaryAdvanceByIdFromDB,
  updateSalaryAdvanceByIdIntoDB,
  deleteSalaryAdvanceByIdFromDB,
};

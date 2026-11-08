import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { calculateTeacherSalary } from '../salary/salary.service';
import { calculateTeacherAdvance } from '../salaryAdvance/salaryAdvance.service';
import { calculateTeacherOvertime } from '../teacherOvertime/teacherOvertime.service';
import {
  CalculateTeacherPayrollPayload,
  PayTeacherPayrollPayload,
} from './teacherPayroll.types';

export const payTeacherPayroll = async ({
  teacherId,
  month,
  year,
  payment_method,
  transaction_id,
  bkash_sender_number,
  bkash_receiver_number,
  payment_note,
  paid_by_admin_id,
}: PayTeacherPayrollPayload) => {
  return prisma.$transaction(async (tx) => {
    // Find or create payroll cycle
    let payrollCycle = await tx.payrollCycle.findUnique({
      where: {
        month_year: {
          month,
          year,
        },
      },
    });

    if (!payrollCycle) {
      payrollCycle = await tx.payrollCycle.create({
        data: {
          month,
          year,
        },
      });
    }

    // Prevent duplicate payment
    const alreadyPaid = await tx.teacherPayroll.findUnique({
      where: {
        payroll_cycle_id_teacher_id: {
          payroll_cycle_id: payrollCycle.id,
          teacher_id: teacherId,
        },
      },
    });

    if (alreadyPaid) {
      throw new Error(
        'This teacher has already been paid for this payroll cycle.',
      );
    }

    // Calculate payroll
    const calculation = await calculateTeacherPayroll({
      teacherId,
      month,
      year,
    });

    // Create payroll
    const payroll = await tx.teacherPayroll.create({
      data: {
        payroll_cycle_id: payrollCycle.id,
        teacher_id: teacherId,

        net_salary: calculation.netSalary,
        overtime_hours: calculation.overtimeHours,
        overtime_amount: calculation.overtimeAmount,
        advance_deduction: calculation.advanceSalary,
        payable_amount: calculation.payableAmount,

        status: 'PAID',
      },
    });

    // Create payment history
    await tx.payrollPayment.create({
      data: {
        teacher_payroll_id: payroll.id,

        amount: payroll.payable_amount,

        payment_method,

        transaction_id,

        bkash_sender_number,

        bkash_receiver_number,

        payment_note,

        paid_at: new Date(),

        paid_by_admin_id,
      },
    });

    // Mark deducted advances as completed
    await tx.salaryAdvance.updateMany({
      where: {
        teacher_id: teacherId,
        advance_status: 'ACTIVE',
        given_at: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      data: {
        advance_status: 'COMPLETED',
      },
    });

    return await tx.teacherPayroll.findUnique({
      where: {
        id: payroll.id,
      },
      include: {
        teacher: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
        payrollCycle: true,
        payments: true,
      },
    });
  });
};

export const calculateTeacherPayroll = async ({
  teacherId,
  month,
  year,
}: CalculateTeacherPayrollPayload) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      designation: true,
      department: true,
      shift: true,
    },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  // Calculate Base / Net Salary
  const { netSalary } = await calculateTeacherSalary(teacherId);

  // Calculate Advances
  const { amount: advanceSalary } = await calculateTeacherAdvance({
    teacherId,
    month,
    year,
  });

  // Calculate Overtime
  const { hours: overtimeHours, amount: overtimeAmount } =
    await calculateTeacherOvertime({
      teacherId,
      month,
      year,
    });

  const payableAmount = netSalary + overtimeAmount - advanceSalary;

  return {
    teacher,
    netSalary,
    advanceSalary,
    overtimeHours,
    overtimeAmount,
    payableAmount,
  };
};

export const previewPayroll = async (
  month: number,
  year: number,
  query: QueryParams,
) => {
  const { skip, take, where, orderBy, page } = buildPrismaQuery(query, {
    searchFields: ['full_name', 'phone', 'email'],
    relationSearch: [
      {
        relation: 'designation',
        fields: ['name'],
        mode: 'is',
      },
      {
        relation: 'department',
        fields: ['department_name'],
        mode: 'is',
      },
    ],
  });

  const combinedWhere = {
    ...where,
    is_active: true,
    isResigned: false,
  };

  const [teachers, totalItems] = await Promise.all([
    prisma.teacher.findMany({
      where: combinedWhere,
      include: {
        designation: true,
        department: true,
      },
      skip,
      take,
      orderBy,
    }),
    prisma.teacher.count({ where: combinedWhere }),
  ]);

  const cycle = await prisma.payrollCycle.findUnique({
    where: {
      month_year: { month, year },
    },
  });

  const payrolls = cycle
    ? await prisma.teacherPayroll.findMany({
        where: {
          payroll_cycle_id: cycle.id,
          teacher_id: { in: teachers.map((t) => t.id) },
        },
      })
    : [];

  const payrollMap = new Map(payrolls.map((p) => [p.teacher_id, p]));

  const data = await Promise.all(
    teachers.map(async (teacher, index) => {
      const generatedPayroll = payrollMap.get(teacher.id);

      const base = {
        sl: skip + index + 1,
        teacherId: teacher.id,
        name: teacher.full_name,
        designation: teacher.designation.name,
        department: teacher.department?.department_name ?? '-',
      };

      if (generatedPayroll) {
        return {
          ...base,
          netSalary: generatedPayroll.net_salary,
          advanceSalary: generatedPayroll.advance_deduction,
          overtimeHours: generatedPayroll.overtime_hours,
          overtimeAmount: generatedPayroll.overtime_amount,
          payableAmount: generatedPayroll.payable_amount,
          status: generatedPayroll.status,
          generated: true,
        };
      }

      const calculation = await calculateTeacherPayroll({
        teacherId: teacher.id,
        month,
        year,
      });

      return {
        ...base,
        netSalary: calculation.netSalary,
        advanceSalary: calculation.advanceSalary,
        overtimeHours: calculation.overtimeHours,
        overtimeAmount: calculation.overtimeAmount,
        payableAmount: calculation.payableAmount,
        status: 'NOT_GENERATED',
        generated: false,
      };
    }),
  );

  const meta = calculatePaginationMeta(totalItems, page, take);

  return { data, meta };
};

export interface TeacherPayrollHistoryQuery extends QueryParams {
  month?: string;
  year?: string;
  teacherId?: string;
}

export const getTeacherPayrollHistoryIntoDB = async (
  teacherId: string,
  query: QueryParams,
) => {
  const rawFilter =
    typeof query.filter === 'string'
      ? safeParseJSONFilter(query.filter)
      : (query.filter ?? {});

  const { month, year, ...restFilter } = rawFilter;

  const { skip, take, where, orderBy, page } = buildPrismaQuery(
    { ...query, filter: restFilter },
    { searchFields: ['transaction_id', 'bkash_sender_number'] },
  );

  const combinedWhere = {
    teacher_payroll_id: { not: null },
    teacherPayroll: {
      teacher_id: teacherId,
      ...((month || year) && {
        payrollCycle: {
          ...(month ? { month: Number(month) } : {}),
          ...(year ? { year: Number(year) } : {}),
        },
      }),
    },
    ...where,
  };

  // Lifetime totals for this teacher — deliberately NOT scoped by the
  // month/year/search filters above, since this represents "paid to date"
  const teacherLifetimeWhere = {
    teacher_payroll_id: { not: null },
    teacherPayroll: { teacher_id: teacherId },
  };

  const [payments, totalItems, lifetimeSum, distinctMonthsPaid, advanceSum] =
    await Promise.all([
      prisma.payrollPayment.findMany({
        where: combinedWhere,
        include: {
          teacherPayroll: {
            include: {
              teacher: {
                select: {
                  id: true,
                  full_name: true,
                  designation: { select: { name: true } },
                },
              },
              payrollCycle: { select: { month: true, year: true } },
            },
          },
          paid_by_admin: { select: { id: true, name: true } },
        },
        skip,
        take,
        orderBy: orderBy ?? { paid_at: 'desc' },
      }),
      prisma.payrollPayment.count({ where: combinedWhere }),
      prisma.payrollPayment.aggregate({
        where: teacherLifetimeWhere,
        _sum: { amount: true },
      }),
      prisma.payrollPayment.groupBy({
        by: ['teacher_payroll_id'],
        where: teacherLifetimeWhere,
      }),
      prisma.salaryAdvance.aggregate({
        where: { teacher_id: teacherId },
        _sum: { advance_amount: true },
      }),
    ]);

  const data = payments.map((payment, index) => ({
    sl: skip + index + 1,
    paymentId: payment.id,
    teacherId: payment.teacherPayroll?.teacher.id,
    teacherName: payment.teacherPayroll?.teacher.full_name,
    designation: payment.teacherPayroll?.teacher.designation?.name ?? '-',
    month: payment.teacherPayroll?.payrollCycle?.month,
    year: payment.teacherPayroll?.payrollCycle?.year,
    amount: payment.amount,
    paymentMethod: payment.payment_method,
    transactionId: payment.transaction_id,
    bkashSenderNumber: payment.bkash_sender_number,
    bkashReceiverNumber: payment.bkash_receiver_number,
    paymentNote: payment.payment_note,
    paidAt: payment.paid_at,
    paidByAdmin: payment.paid_by_admin?.name,
  }));

  const totalAmountPaid =
    (lifetimeSum._sum.amount ?? 0) + (advanceSum._sum.advance_amount ?? 0);

  return {
    data,
    meta: calculatePaginationMeta(totalItems, page, take),
    summary: {
      totalMonthsPaid: distinctMonthsPaid.length,
      totalAmountPaid,
    },
  };
};

// small helper since query.filter may already be an object or a JSON string
const safeParseJSONFilter = (value: string): Record<string, any> => {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
};
export const TeacherPayrollService = {
  payTeacherPayroll,
  calculateTeacherPayroll,
  previewPayroll,
  getTeacherPayrollHistoryIntoDB,
};

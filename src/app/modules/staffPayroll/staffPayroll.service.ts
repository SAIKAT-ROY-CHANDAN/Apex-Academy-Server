import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { calculateStaffBaseSalary } from '../salary/salary.service';
import { calculateStaffAdvance } from '../salaryAdvance/salaryAdvance.service';
import { calculateStaffOvertime } from '../staffOvertime/staffOvertime.service';
import {
  CalculateStaffPayrollPayload,
  PayStaffPayrollPayload,
} from './staffPayroll.types';

export const payStaffPayroll = async ({
  staffId,
  month,
  year,
  payment_method,
  transaction_id,
  bkash_sender_number,
  bkash_receiver_number,
  payment_note,
  paid_by_admin_id,
}: PayStaffPayrollPayload) => {
  return prisma.$transaction(async (tx) => {
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

    const alreadyPaid = await tx.staffPayroll.findUnique({
      where: {
        payroll_cycle_id_staff_id: {
          payroll_cycle_id: payrollCycle.id,
          staff_id: staffId,
        },
      },
    });

    if (alreadyPaid) {
      throw new Error(
        'This staff member has already been paid for this payroll cycle.',
      );
    }

    const calculation = await calculateStaffPayroll({
      staffId,
      month,
      year,
    });

    const payroll = await tx.staffPayroll.create({
      data: {
        payroll_cycle_id: payrollCycle.id,
        staff_id: staffId,

        net_salary: calculation.netSalary,
        overtime_hours: calculation.overtimeHours,
        overtime_amount: calculation.overtimeAmount,
        advance_deduction: calculation.advanceSalary,
        payable_amount: calculation.payableAmount,

        status: 'PAID',
      },
    });

    await tx.payrollPayment.create({
      data: {
        staff_payroll_id: payroll.id,

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

    await tx.salaryAdvance.updateMany({
      where: {
        staff_id: staffId,
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

    return await tx.staffPayroll.findUnique({
      where: {
        id: payroll.id,
      },
      include: {
        staff: {
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

export const calculateStaffPayroll = async ({
  staffId,
  month,
  year,
}: CalculateStaffPayrollPayload) => {
  const staff = await prisma.staff.findUnique({
    where: {
      id: staffId,
    },
    include: {
      designation: true,
    },
  });

  if (!staff) {
    throw new Error('Staff not found');
  }

  const salary = await calculateStaffBaseSalary(staffId);

  const overtime = await calculateStaffOvertime({
    staffId,
    month,
    year,
  });

  const advance = await calculateStaffAdvance({
    staffId,
    month,
    year,
  });

  const payableAmount = salary.netSalary + overtime.amount - advance.amount;

  return {
    staff,

    netSalary: salary.netSalary,

    overtimeHours: overtime.hours,

    overtimeAmount: overtime.amount,

    advanceSalary: advance.amount,

    payableAmount,
  };
};

export const previewPayroll = async (
  month: number,
  year: number,
  query: QueryParams = {},
) => {
  const { skip, take, where, orderBy, page } = buildPrismaQuery(query, {
    searchFields: ['full_name', 'phone', 'email'], // adjust to actual searchable Staff fields
  });

  const combinedWhere = {
    ...where,
    is_active: true,
    is_resigned: false,
  };

  const [staffs, totalItems] = await Promise.all([
    prisma.staff.findMany({
      where: combinedWhere,
      include: {
        designation: true,
      },
      skip,
      take,
      orderBy,
    }),
    prisma.staff.count({ where: combinedWhere }),
  ]);

  const cycle = await prisma.payrollCycle.findUnique({
    where: {
      month_year: { month, year },
    },
  });

  const payrolls = cycle
    ? await prisma.staffPayroll.findMany({
        where: {
          payroll_cycle_id: cycle.id,
          staff_id: { in: staffs.map((s) => s.id) },
        },
      })
    : [];

  const payrollMap = new Map(payrolls.map((p) => [p.staff_id, p]));

  const data = await Promise.all(
    staffs.map(async (staff, index) => {
      const generatedPayroll = payrollMap.get(staff.id);

      const base = {
        sl: skip + index + 1,
        staffId: staff.id,
        name: staff.full_name,
        designation: staff.designation.name,
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

      const calculation = await calculateStaffPayroll({
        staffId: staff.id,
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

export const getStaffPayrollHistoryIntoDB = async (
  staffId: string,
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
    staff_payroll_id: { not: null },
    staffPayroll: {
      staff_id: staffId,
      ...((month || year) && {
        payrollCycle: {
          ...(month ? { month: Number(month) } : {}),
          ...(year ? { year: Number(year) } : {}),
        },
      }),
    },
    ...where,
  };

  // Lifetime totals for this staff member — deliberately NOT scoped by the
  // month/year/search filters above, since this represents "paid to date"
  const staffLifetimeWhere = {
    staff_payroll_id: { not: null },
    staffPayroll: { staff_id: staffId },
  };

  const [payments, totalItems, lifetimeSum, distinctMonthsPaid, advanceSum] =
    await Promise.all([
    prisma.payrollPayment.findMany({
      where: combinedWhere,
      include: {
        staffPayroll: {
          include: {
            staff: {
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
      where: staffLifetimeWhere,
      _sum: { amount: true },
    }),
    prisma.payrollPayment.groupBy({
      by: ['staff_payroll_id'],
      where: staffLifetimeWhere,
    }),
    prisma.salaryAdvance.aggregate({
      where: { staff_id: staffId },
      _sum: { advance_amount: true },
    }),
  ]);

  const data = payments.map((payment, index) => ({
    sl: skip + index + 1,
    paymentId: payment.id,
    staffId: payment.staffPayroll?.staff.id,
    staffName: payment.staffPayroll?.staff.full_name,
    designation: payment.staffPayroll?.staff.designation?.name ?? '-',
    month: payment.staffPayroll?.payrollCycle?.month,
    year: payment.staffPayroll?.payrollCycle?.year,
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

const safeParseJSONFilter = (value: string): Record<string, any> => {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
};

export const StaffPayrollService = {
  payStaffPayroll,
  calculateStaffPayroll,
  previewPayroll,
  getStaffPayrollHistoryIntoDB,
};

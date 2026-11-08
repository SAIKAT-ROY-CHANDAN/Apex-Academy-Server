// hostelDashboard.service.ts

import prisma from "../../../db/db.config";

export interface HostelDashboardQuery {
  from?: string; // ISO date string
  to?: string;
}

export const getHostelDashboardSummary = async (query: HostelDashboardQuery) => {
  const dateRange =
    query.from || query.to
      ? {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lt: new Date(new Date(query.to).getTime() + 86400000) } : {}), // inclusive of "to" day
        }
      : undefined;

  const revenueWhere = dateRange ? { collection_date: dateRange } : {};
  const expenseWhere = dateRange ? { expense_date: dateRange } : {};

  const [revenueAgg, expenseAgg] = await Promise.all([
    prisma.hostelFeeCollection.aggregate({
      where: revenueWhere,
      _sum: { paid_amount: true, total_amount: true, due_amount: true },
    }),
    prisma.hostelExpense.aggregate({
      where: expenseWhere,
      _sum: { total_amount: true },
    }),
  ]);

  return {
    totalCollection: revenueAgg._sum.paid_amount ?? 0,
    totalBilled: revenueAgg._sum.total_amount ?? 0,
    totalDue: revenueAgg._sum.due_amount ?? 0,
    totalExpense: expenseAgg._sum.total_amount ?? 0,
  };
};

export const HostelDashboardSummaryService = {
  getHostelDashboardSummary,
};
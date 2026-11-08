import prisma from '../../../db/db.config';
import { TExpensePayload, TExpenseUpdatePayload } from './expense.type';

const parseDate = (raw: string | undefined): Date => {
  if (!raw || !raw.trim()) return new Date();
  const trimmed = raw.trim();
  const ddmm = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmm) {
    const [, dd, mm, yyyy] = ddmm;
    const iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return d;
    const local = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(local.getTime())) return local;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;
  return new Date();
};

const createExpenseIntoDB = async (payload: TExpensePayload) => {
  const result = await prisma.$transaction(async (tx) => {
    // Verify expense type exists
    const expenseType = await tx.expenseType.findUnique({
      where: { id: payload.expense_type_id },
    });

    if (!expenseType) {
      throw new Error('Expense type not found');
    }

    const expense = await tx.expense.create({
      data: {
        expense_type_id: payload.expense_type_id,
        expense_date: parseDate(payload.expense_date),
        total_amount: payload.total_amount,
        description: payload.description,
        expenseItems: {
          createMany: {
            data: payload.expenseItems.map((item) => ({
              item_name: item.item_name,
              item_amount: item.item_amount,
              description: item.description,
            })),
          },
        },
      },
      include: {
        expenseType: true,
        expenseItems: true,
      },
    });

    return expense;
  });

  return result;
};

const getAllExpensesFromDB = async () => {
  const expenses = await prisma.expense.findMany({
    include: {
      expenseType: true,
      expenseItems: true,
    },
    orderBy: {
      expense_date: 'desc',
    },
  });

  return expenses;
};

const getExpenseByIdFromDB = async (id: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      expenseType: true,
      expenseItems: true,
    },
  });

  if (!expense) {
    throw new Error('Expense not found');
  }

  return expense;
};

const updateExpenseInDB = async (id: string, payload: TExpenseUpdatePayload) => {
  const result = await prisma.$transaction(async (tx) => {
    const existingExpense = await tx.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    // If expense_type_id is provided, verify it exists
    if (payload.expense_type_id) {
      const expenseType = await tx.expenseType.findUnique({
        where: { id: payload.expense_type_id },
      });

      if (!expenseType) {
        throw new Error('Expense type not found');
      }
    }

    // If expenseItems provided, delete old ones and create new
    if (payload.expenseItems) {
      await tx.expenseItem.deleteMany({
        where: { expense_id: id },
      });

      await tx.expenseItem.createMany({
        data: payload.expenseItems.map((item) => ({
          expense_id: id,
          item_name: item.item_name,
          item_amount: item.item_amount,
          description: item.description,
        })),
      });
    }

    const updatedExpense = await tx.expense.update({
      where: { id },
      data: {
        expense_type_id: payload.expense_type_id,
        expense_date: payload.expense_date ? parseDate(payload.expense_date) : undefined,
        total_amount: payload.total_amount,
        description: payload.description,
      },
      include: {
        expenseType: true,
        expenseItems: true,
      },
    });

    return updatedExpense;
  });

  return result;
};

const deleteExpenseFromDB = async (id: string) => {
  const existingExpense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existingExpense) {
    throw new Error('Expense not found');
  }

  await prisma.expense.delete({
    where: { id },
  });

  return existingExpense;
};

export const expenseService = {
  createExpenseIntoDB,
  getAllExpensesFromDB,
  getExpenseByIdFromDB,
  updateExpenseInDB,
  deleteExpenseFromDB,
};
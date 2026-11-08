import prisma from '../../../db/db.config';
import { TExpenseTypePayload, TExpenseTypeUpdatePayload } from './expenseType.type';

const createExpenseTypeIntoDB = async (payload: TExpenseTypePayload) => {
  const expenseType = await prisma.expenseType.create({
    data: {
      name: payload.name,
    },
  });

  return expenseType;
};

const getAllExpenseTypesFromDB = async () => {
  const expenseTypes = await prisma.expenseType.findMany({
    include: {
      expenses: true,
    },
  });

  return expenseTypes;
};

const getExpenseTypeByIdFromDB = async (id: string) => {
  const expenseType = await prisma.expenseType.findUnique({
    where: { id },
    include: {
      expenses: true,
    },
  });

  if (!expenseType) {
    throw new Error('Expense type not found');
  }

  return expenseType;
};

const updateExpenseTypeInDB = async (
  id: string,
  payload: TExpenseTypeUpdatePayload,
) => {
  const existingExpenseType = await prisma.expenseType.findUnique({
    where: { id },
  });

  if (!existingExpenseType) {
    throw new Error('Expense type not found');
  }

  const updatedExpenseType = await prisma.expenseType.update({
    where: { id },
    data: {
      name: payload.name,
    },
  });

  return updatedExpenseType;
};

const deleteExpenseTypeFromDB = async (id: string) => {
  const existingExpenseType = await prisma.expenseType.findUnique({
    where: { id },
  });

  if (!existingExpenseType) {
    throw new Error('Expense type not found');
  }

  await prisma.expenseType.delete({
    where: { id },
  });

  return existingExpenseType;
};

export const expenseTypeService = {
  createExpenseTypeIntoDB,
  getAllExpenseTypesFromDB,
  getExpenseTypeByIdFromDB,
  updateExpenseTypeInDB,
  deleteExpenseTypeFromDB,
};
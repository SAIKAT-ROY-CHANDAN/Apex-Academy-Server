import prisma from '../../../db/db.config';
import { TDepositTypePayload, TDepositTypeUpdatePayload } from './depositType.type';

const createDepositTypeIntoDB = async (payload: TDepositTypePayload) => {
  const depositType = await prisma.depositType.create({
    data: {
      name: payload.name,
    },
  });

  return depositType;
};

const getAllDepositTypesFromDB = async () => {
  const depositTypes = await prisma.depositType.findMany({
    include: {
      deposits: true,
    },
  });

  return depositTypes;
};

const getDepositTypeByIdFromDB = async (id: string) => {
  const depositType = await prisma.depositType.findUnique({
    where: { id },
    include: {
      deposits: true,
    },
  });

  if (!depositType) {
    throw new Error('Deposit type not found');
  }

  return depositType;
};

const updateDepositTypeInDB = async (
  id: string,
  payload: TDepositTypeUpdatePayload,
) => {
  const existingDepositType = await prisma.depositType.findUnique({
    where: { id },
  });

  if (!existingDepositType) {
    throw new Error('Deposit type not found');
  }

  const updatedDepositType = await prisma.depositType.update({
    where: { id },
    data: {
      name: payload.name,
    },
  });

  return updatedDepositType;
};

const deleteDepositTypeFromDB = async (id: string) => {
  const existingDepositType = await prisma.depositType.findUnique({
    where: { id },
  });

  if (!existingDepositType) {
    throw new Error('Deposit type not found');
  }

  await prisma.depositType.delete({
    where: { id },
  });

  return existingDepositType;
};

export const depositTypeService = {
  createDepositTypeIntoDB,
  getAllDepositTypesFromDB,
  getDepositTypeByIdFromDB,
  updateDepositTypeInDB,
  deleteDepositTypeFromDB,
};
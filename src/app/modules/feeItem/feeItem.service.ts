import prisma from '../../../db/db.config';
import { FeeItemType, Fee_Assign_FOR } from '../../../../generated/prisma/enums';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IFeeItemCreate, IFeeItemUpdate } from './feeItem.type';

const createFeeItemIntoDB = async (payload: IFeeItemCreate) => {
  const isSupplementary = payload.fee_assign_for === Fee_Assign_FOR.SUPPLEMENTARY;
  const isOneTime = payload.FeeItemType === 'OneTime' || isSupplementary;

  const data = {
    ...payload,
    // Supplementary fees are always OneTime, no month range
    feeStartMonth: isOneTime ? null : payload.feeStartMonth ?? null,
    feeEndMonth: isOneTime ? null : payload.feeEndMonth ?? null,
    // For supplementary, amount_every_subject is used instead of amount
    amount: isSupplementary ? 0 : payload.amount,
    amount_every_subject: isSupplementary ? payload.amount_every_subject : null,
    last_payment_date: payload.isFine ? payload.last_payment_date ?? null : null,
    everydayFine_amount: payload.isFine
      ? payload.everydayFine_amount ?? null
      : null,
  };

  const newFeeItem = await prisma.feeItem.create({
    data: data as any,
  });

  return newFeeItem;
};

const getAllFeeItemsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name'],
  });

  const [totalItems, feeItems] = await prisma.$transaction([
    prisma.feeItem.count({ where }),
    prisma.feeItem.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        feeType: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: feeItems,
  };
};

const getFeeItemByIdFromDB = async (feeItemId: string) => {
  const existingFeeItem = await prisma.feeItem.findUnique({
    where: {
      id: feeItemId,
    },
    include: {
      feeType: true,
    },
  });

  if (!existingFeeItem) {
    throw new Error('Fee item not found');
  }

  return existingFeeItem;
};

const updateFeeItemFromDB = async (
  feeItemId: string,
  payload: IFeeItemUpdate,
) => {
  const existingFeeItem = await prisma.feeItem.findUnique({
    where: {
      id: feeItemId,
    },
  });

  if (!existingFeeItem) {
    throw new Error('Fee item not found');
  }

  const isSupplementary = payload.fee_assign_for === Fee_Assign_FOR.SUPPLEMENTARY || 
    (payload.fee_assign_for === undefined && existingFeeItem.fee_assign_for === Fee_Assign_FOR.SUPPLEMENTARY);
  const isOneTime = payload.FeeItemType === 'OneTime' || isSupplementary;

  const data: IFeeItemUpdate = { ...payload };

  // Handle month fields based on fee type
  if (isOneTime) {
    data.feeStartMonth = null;
    data.feeEndMonth = null;
  }

  // Handle amount fields based on fee_assign_for
  if (isSupplementary) {
    data.amount = 0;
    data.amount_every_subject = payload.amount_every_subject ?? existingFeeItem.amount_every_subject;
  } else if (payload.fee_assign_for === Fee_Assign_FOR.REGULAR || 
    (payload.fee_assign_for === undefined && existingFeeItem.fee_assign_for === Fee_Assign_FOR.REGULAR)) {
    data.amount = payload.amount ?? existingFeeItem.amount;
    data.amount_every_subject = null;
  }

  // Handle fine-related field cleanup based on isFine flag
  if (payload.isFine === true) {
    data.last_payment_date = payload.last_payment_date ?? null;
    data.everydayFine_amount = payload.everydayFine_amount ?? null;
  } else if (payload.isFine === false) {
    data.last_payment_date = null;
    data.everydayFine_amount = null;
  }

  const updatedFeeItem = await prisma.feeItem.update({
    where: {
      id: feeItemId,
    },
    data: data as any,
  });

  return updatedFeeItem;
};

const deleteFeeItemFromDB = async (feeItemId: string) => {
  const existingFeeItem = await prisma.feeItem.findUnique({
    where: {
      id: feeItemId,
    },
  });

  if (!existingFeeItem) {
    throw new Error('Fee item not found');
  }

  await prisma.feeItem.delete({
    where: {
      id: feeItemId,
    },
  });
};

const getFeeItemByFeeTypeIdFromDB = async (feeTypeId: string) => {
  const existingFeeItem = await prisma.feeItem.findMany({
    where: {
      fee_type_id: feeTypeId,
    },
  });

  if (!existingFeeItem) {
    throw new Error('Fee item not found');
  }

  return existingFeeItem;
};

export const FeeItemService = {
  createFeeItemIntoDB,
  getAllFeeItemsFromDB,
  getFeeItemByIdFromDB,
  updateFeeItemFromDB,
  deleteFeeItemFromDB,
  getFeeItemByFeeTypeIdFromDB,
};
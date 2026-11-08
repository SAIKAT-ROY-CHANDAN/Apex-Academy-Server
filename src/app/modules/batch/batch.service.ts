import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IBatchCreate, IBatchUpdate } from './batch.type';

const createBatchIntoDB = async (payload: IBatchCreate) => {
  const existingBatch = await prisma.batch.findFirst({
    where: {
      batch_name: payload.batch_name,
    },
  });

  if (existingBatch) {
    throw new Error('Batch with this name already exists');
  }

  const newBatch = await prisma.batch.create({
    data: payload,
  });

  return newBatch;
};

const getAllBatchesFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['batch_name'],
  });

  const [totalItems, batches] = await prisma.$transaction([
    prisma.batch.count({ where }),
    prisma.batch.findMany({
      skip,
      take,
      orderBy,
      where,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: batches,
  };
};

const getBatchByIdFromDB = async (batchId: string) => {
  const existingBatch = await prisma.batch.findUnique({
    where: {
      id: batchId,
    },
  });

  if (!existingBatch) {
    throw new Error('Batch not found');
  }

  return existingBatch;
};

const updateBatchFromDB = async (batchId: string, payload: IBatchUpdate) => {
  const existingBatch = await prisma.batch.findUnique({
    where: {
      id: batchId,
    },
  });

  if (!existingBatch) {
    throw new Error('Batch not found');
  }

  const updatedBatch = await prisma.batch.update({
    where: {
      id: batchId,
    },
    data: payload,
  });

  return updatedBatch;
};

const deleteBatchFromDB = async (batchId: string) => {
  const existingBatch = await prisma.batch.findUnique({
    where: {
      id: batchId,
    },
  });

  if (!existingBatch) {
    throw new Error('Batch not found');
  }

  await prisma.batch.delete({
    where: {
      id: batchId,
    },
  });
};

export const BatchService = {
  createBatchIntoDB,
  getAllBatchesFromDB,
  getBatchByIdFromDB,
  updateBatchFromDB,
  deleteBatchFromDB,
};
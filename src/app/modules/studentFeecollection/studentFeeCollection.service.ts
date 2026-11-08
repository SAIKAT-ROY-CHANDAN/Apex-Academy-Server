import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IStudentFeeCollectionCreate, IStudentFeeCollectionUpdate } from './studentFeeCollection.type';


const createStudentFeeCollectionIntoDB = async (
  payload: IStudentFeeCollectionCreate,
) => {
  const newStudentFeeCollection = await prisma.studentFeeCollection.create({
    data: payload,
  });

  return newStudentFeeCollection;
};

const getAllStudentFeeCollectionsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, studentFeeCollections] = await prisma.$transaction([
    prisma.studentFeeCollection.count({ where }),
    prisma.studentFeeCollection.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        feeType: true,
        student: true,
        studentFeeCollectionItems: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: studentFeeCollections,
  };
};

const getStudentFeeCollectionByIdFromDB = async (
  studentFeeCollectionId: string,
) => {
  const existingStudentFeeCollection =
    await prisma.studentFeeCollection.findUnique({
      where: {
        id: studentFeeCollectionId,
      },
      include: {
        feeType: true,
        student: true,
        studentFeeCollectionItems: true,
      },
    });

  if (!existingStudentFeeCollection) {
    throw new Error('Student fee collection not found');
  }

  return existingStudentFeeCollection;
};

const updateStudentFeeCollectionFromDB = async (
  studentFeeCollectionId: string,
  payload: IStudentFeeCollectionUpdate,
) => {
  const existingStudentFeeCollection =
    await prisma.studentFeeCollection.findUnique({
      where: {
        id: studentFeeCollectionId,
      },
    });

  if (!existingStudentFeeCollection) {
    throw new Error('Student fee collection not found');
  }

  const updatedStudentFeeCollection = await prisma.studentFeeCollection.update(
    {
      where: {
        id: studentFeeCollectionId,
      },
      data: payload,
    },
  );

  return updatedStudentFeeCollection;
};

const deleteStudentFeeCollectionFromDB = async (
  studentFeeCollectionId: string,
) => {
  const existingStudentFeeCollection =
    await prisma.studentFeeCollection.findUnique({
      where: {
        id: studentFeeCollectionId,
      },
    });

  if (!existingStudentFeeCollection) {
    throw new Error('Student fee collection not found');
  }

  await prisma.studentFeeCollection.delete({
    where: {
      id: studentFeeCollectionId,
    },
  });
};

export const StudentFeeCollectionService = {
  createStudentFeeCollectionIntoDB,
  getAllStudentFeeCollectionsFromDB,
  getStudentFeeCollectionByIdFromDB,
  updateStudentFeeCollectionFromDB,
  deleteStudentFeeCollectionFromDB,
};
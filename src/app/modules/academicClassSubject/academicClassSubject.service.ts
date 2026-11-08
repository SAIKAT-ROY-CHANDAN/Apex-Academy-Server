import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IAcademicClassSubjectCreate,
  IAcademicClassSubjectUpdate,
} from './academicClassSubject.type';

const createAcademicClassSubjectIntoDB = async (
  payload: IAcademicClassSubjectCreate,
) => {
  const existingAcademicClassSubject =
    await prisma.academicClassSubject.findUnique({
      where: {
        class_id_subject_id: {
          class_id: payload.class_id,
          subject_id: payload.subject_id,
        },
      },
    });

  if (existingAcademicClassSubject) {
    throw new Error('This subject is already assigned to this class');
  }

  const newAcademicClassSubject = await prisma.academicClassSubject.create({
    data: payload,
  });

  return newAcademicClassSubject;
};

const getAllAcademicClassSubjectsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, academicClassSubjects] = await prisma.$transaction([
    prisma.academicClassSubject.count({ where }),
    prisma.academicClassSubject.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        academicClass: true,
        subject: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: academicClassSubjects,
  };
};

const getAcademicClassSubjectByIdFromDB = async (
  academicClassSubjectId: string,
) => {
  const existingAcademicClassSubject =
    await prisma.academicClassSubject.findUnique({
      where: {
        id: academicClassSubjectId,
      },
      include: {
        academicClass: true,
        subject: true,
      },
    });

  if (!existingAcademicClassSubject) {
    throw new Error('Academic class subject not found');
  }

  return existingAcademicClassSubject;
};

const updateAcademicClassSubjectFromDB = async (
  academicClassSubjectId: string,
  payload: IAcademicClassSubjectUpdate,
) => {
  const existingAcademicClassSubject =
    await prisma.academicClassSubject.findUnique({
      where: {
        id: academicClassSubjectId,
      },
    });

  if (!existingAcademicClassSubject) {
    throw new Error('Academic class subject not found');
  }

  const updatedAcademicClassSubject = await prisma.academicClassSubject.update({
    where: {
      id: academicClassSubjectId,
    },
    data: payload,
  });

  return updatedAcademicClassSubject;
};

const deleteAcademicClassSubjectFromDB = async (
  academicClassSubjectId: string,
) => {
  const existingAcademicClassSubject =
    await prisma.academicClassSubject.findUnique({
      where: {
        id: academicClassSubjectId,
      },
    });

  if (!existingAcademicClassSubject) {
    throw new Error('Academic class subject not found');
  }

  await prisma.academicClassSubject.delete({
    where: {
      id: academicClassSubjectId,
    },
  });
};

export const AcademicClassSubjectService = {
  createAcademicClassSubjectIntoDB,
  getAllAcademicClassSubjectsFromDB,
  getAcademicClassSubjectByIdFromDB,
  updateAcademicClassSubjectFromDB,
  deleteAcademicClassSubjectFromDB,
};
import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IAcademicClassCreate, IAcademicClassUpdate } from './academicClass.type';

const classInclude = {
  program: true,
  department: true,
  academicSections: true,
  subjects: true,
};

const createAcademicClassIntoDB = async (payload: IAcademicClassCreate) => {
  const newAcademicClass = await prisma.academicClass.create({
    data: payload,
    include: classInclude,
  });

  return newAcademicClass;
};

const getAllAcademicClassesFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['class_name'],
  });

  const [totalItems, academicClasses] = await prisma.$transaction([
    prisma.academicClass.count({ where }),
    prisma.academicClass.findMany({
      skip,
      take,
      orderBy,
      where,
      include: classInclude,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: academicClasses,
  };
};

const getAcademicClassByIdFromDB = async (academicClassId: string) => {
  const existingAcademicClass = await prisma.academicClass.findUnique({
    where: {
      id: academicClassId,
    },
    include: {
      program: true,
      department: true,
      studentEnrollments: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!existingAcademicClass) {
    throw new Error('Academic class not found');
  }

  return existingAcademicClass;
};

const getAcademicClassesByDepartmentIdFromDB = async (departmentId: string) => {
  const existingAcademicClass = await prisma.academicClass.findMany({
    where: {
      department: {
        id: departmentId,
      },
    },
    include: classInclude,
  });

  if (!existingAcademicClass) {
    throw new Error('Academic class not found');
  }

  return existingAcademicClass;
};

const updateAcademicClassFromDB = async (
  academicClassId: string,
  payload: IAcademicClassUpdate,
) => {
  const existingAcademicClass = await prisma.academicClass.findUnique({
    where: {
      id: academicClassId,
    },
  });

  if (!existingAcademicClass) {
    throw new Error('Academic class not found');
  }

  const updatedAcademicClass = await prisma.academicClass.update({
    where: {
      id: academicClassId,
    },
    data: payload,
    include: classInclude,
  });

  return updatedAcademicClass;
};

const deleteAcademicClassFromDB = async (academicClassId: string) => {
  const existingAcademicClass = await prisma.academicClass.findUnique({
    where: {
      id: academicClassId,
    },
  });

  if (!existingAcademicClass) {
    throw new Error('Academic class not found');
  }

  await prisma.academicClass.delete({
    where: {
      id: academicClassId,
    },
  });
};

export const AcademicClassService = {
  createAcademicClassIntoDB,
  getAllAcademicClassesFromDB,
  getAcademicClassByIdFromDB,
  updateAcademicClassFromDB,
  deleteAcademicClassFromDB,
  getAcademicClassesByDepartmentIdFromDB,
};

import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IDepartmentCreate, IDepartmentUpdate } from './department.type';

const createDepartmentIntoDB = async (payload: IDepartmentCreate) => {
  const newDepartment = await prisma.department.create({
    data: payload,
  });

  return newDepartment;
};

const getAllDepartmentsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['department_name'],
  });

  const [totalItems, departments] = await prisma.$transaction([
    prisma.department.count({ where }),
    prisma.department.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        institution: true,
        program: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: departments,
  };
};

const getDepartmentByIdFromDB = async (departmentId: string) => {
  const existingDepartment = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
    include: {
      institution: true,
      program: true,
    },
  });

  if (!existingDepartment) {
    throw new Error('Department not found');
  }

  return existingDepartment;
};
const getDepartmentByProgramIdFromDB = async (programId: string) => {
  const existingDepartment = await prisma.department.findFirst({
    where: {
      program_id: programId,
    },
    include: {
      institution: true,
      program: true,
    },
  });

  if (!existingDepartment) {
    throw new Error('Department not found');
  }

  return existingDepartment;
};
const getDepartmentsByProgramIdFromDB = async (programId: string) => {
  const existingDepartment = await prisma.department.findMany({
    where: {
      program_id: programId,
    },
  });

  if (!existingDepartment) {
    throw new Error('Department not found');
  }

  return existingDepartment;
};

const updateDepartmentFromDB = async (
  departmentId: string,
  payload: IDepartmentUpdate,
) => {
  const existingDepartment = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });

  if (!existingDepartment) {
    throw new Error('Department not found');
  }

  const updatedDepartment = await prisma.department.update({
    where: {
      id: departmentId,
    },
    data: payload,
  });

  return updatedDepartment;
};

const deleteDepartmentFromDB = async (departmentId: string) => {
  const existingDepartment = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });

  if (!existingDepartment) {
    throw new Error('Department not found');
  }

  await prisma.department.delete({
    where: {
      id: departmentId,
    },
  });
};

export const DepartmentService = {
  createDepartmentIntoDB,
  getAllDepartmentsFromDB,
  getDepartmentByIdFromDB,
  updateDepartmentFromDB,
  deleteDepartmentFromDB,
  getDepartmentByProgramIdFromDB,
  getDepartmentsByProgramIdFromDB
};

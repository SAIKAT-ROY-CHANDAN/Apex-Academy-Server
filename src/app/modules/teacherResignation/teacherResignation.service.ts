import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateTeacherResignationInput,
  UpdateTeacherResignationInput,
} from './teacherResignation.type';

const createTeacherResignationIntoDB = async (
  payload: CreateTeacherResignationInput,
) => {

  const isExistingResignation = await prisma.teacherResignation.findFirst({
    where: {
      teacher_id: payload.teacher_id,
    },
  });

  if (isExistingResignation) {
    throw new Error('Teacher resignation already exists for this teacher.');
  }
  const response = await prisma.teacherResignation.create({
    data: {
      teacher_id: payload.teacher_id,
      reason: payload.reason,
      resignation_date: new Date(payload.resignation_date),
    },
    include: {
      teacher: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
  });

  return response;
};

const getAllTeacherResignationsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['reason'],
  });

  const [totalItems, resignations] = await prisma.$transaction([
    prisma.teacherResignation.count({ where }),
    prisma.teacherResignation.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        teacher: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: resignations,
  };
};

const getTeacherResignationByIdFromDB = async (id: string) => {
  const response = await prisma.teacherResignation.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
  });

  return response;
};

const getTeacherResignationByTeacherIdFromDB = async (
  teacher_id: string,
  query: QueryParams,
) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['reason'],
  });

  const [totalItems, resignations] = await prisma.$transaction([
    prisma.teacherResignation.count({ where: { ...where, teacher_id } }),
    prisma.teacherResignation.findMany({
      where: { ...where, teacher_id },
      orderBy,
      skip,
      take,
      include: {
        teacher: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: resignations,
  };
};

const updateTeacherResignationByIdIntoDB = async (
  id: string,
  payload: UpdateTeacherResignationInput,
) => {
  const response = await prisma.teacherResignation.update({
    where: { id },
    data: {
      ...(payload.reason && { reason: payload.reason }),
      ...(payload.resignation_date && {
        resignation_date: new Date(payload.resignation_date),
      }),
    },
    include: {
      teacher: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
  });

  return response;
};

const deleteTeacherResignationByIdFromDB = async (id: string) => {
  const response = await prisma.teacherResignation.delete({
    where: { id },
  });

  return response;
};

export const TeacherResignationService = {
  createTeacherResignationIntoDB,
  getAllTeacherResignationsFromDB,
  getTeacherResignationByIdFromDB,
  getTeacherResignationByTeacherIdFromDB,
  updateTeacherResignationByIdIntoDB,
  deleteTeacherResignationByIdFromDB,
};
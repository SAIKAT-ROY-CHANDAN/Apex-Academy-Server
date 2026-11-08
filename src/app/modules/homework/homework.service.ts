import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { CreateHomeworkInput, UpdateHomeworkInput } from './homework.type';

const createHomeworkIntoDB = async (payload: CreateHomeworkInput) => {
  const response = await prisma.homework.create({
    data: {
      ...payload,
      due_date: new Date(payload.due_date),
    },
  });

  return response;
};

const getAllHomeworksFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title', 'description'],
  });

  // Handle program_id / department_id filters through the academicClass relation
  const { program_id, department_id, ...restWhere } = where as Record<string, any>;

  const finalWhere: any = {
    ...restWhere,
    ...(program_id && {
      academicClass: {
        ...(restWhere.academicClass || {}),
        program_id,
      },
    }),
    ...(department_id && {
      academicClass: {
        ...(restWhere.academicClass || {}),
        department_id,
      },
    }),
  };

  const [totalItems, homeworks] = await prisma.$transaction([
    prisma.homework.count({ where: finalWhere }),
    prisma.homework.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take,
      include: {
        academicClass: true,
        academicSection: true,
        subject: true,
        teacher: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: homeworks,
  };
};

const getHomeworkByIdFromDB = async (id: string) => {
  const response = await prisma.homework.findUnique({
    where: {
      id,
    },
    include: {
      academicClass: true,
      academicSection: true,
      subject: true,
      teacher: true,
    },
  });

  return response;
};

const updateHomeworkByIdIntoDB = async (
  id: string,
  payload: UpdateHomeworkInput,
) => {
  const response = await prisma.homework.update({
    where: {
      id,
    },
    data: {
      ...payload,
      ...(payload.due_date && { due_date: new Date(payload.due_date) }),
    },
  });

  return response;
};

const deleteHomeworkByIdFromDB = async (id: string) => {
  const response = await prisma.homework.delete({
    where: {
      id,
    },
  });

  return response;
};

const getHomeworksByStudentId = async (studentId: string, query: QueryParams) => {
  // First get the student's current enrollment to find their class_id
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      student_id: studentId,
    },
    orderBy: { created_at: 'desc' },
    select: { academic_class_id: true },
  });

  if (!enrollment?.academic_class_id) {
    return { meta: { totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 10 }, data: [] };
  }

  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title', 'description'],
  });

  // Filter by student's class_id
  const finalWhere = {
    ...where,
    class_id: enrollment.academic_class_id,
  };

  const [totalItems, homeworks] = await prisma.$transaction([
    prisma.homework.count({ where: finalWhere }),
    prisma.homework.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take,
      include: {
        academicClass: true,
        academicSection: true,
        subject: true,
        teacher: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: homeworks,
  };
};

export const HomeworkService = {
  createHomeworkIntoDB,
  getAllHomeworksFromDB,
  getHomeworkByIdFromDB,
  updateHomeworkByIdIntoDB,
  deleteHomeworkByIdFromDB,
  getHomeworksByStudentId,
};
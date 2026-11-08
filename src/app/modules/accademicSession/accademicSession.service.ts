import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IAcademicSessionCreate, IAcademicSessionUpdate } from './accademicSession.type';


const createAcademicSessionIntoDB = async (
  payload: IAcademicSessionCreate,
) => {
  const newAcademicSession = await prisma.academicSession.create({
    data: payload,
  });

  return newAcademicSession;
};

const getAllAcademicSessionsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['session_name'],
  });

  const [totalItems, academicSessions] = await prisma.$transaction([
    prisma.academicSession.count({ where }),
    prisma.academicSession.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        institution: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: academicSessions,
  };
};

const getAcademicSessionByIdFromDB = async (academicSessionId: string) => {
  const existingAcademicSession = await prisma.academicSession.findUnique({
    where: {
      id: academicSessionId,
    },
    include: {
      institution: true,
    },
  });

  if (!existingAcademicSession) {
    throw new Error('Academic session not found');
  }

  return existingAcademicSession;
};

const updateAcademicSessionFromDB = async (
  academicSessionId: string,
  payload: IAcademicSessionUpdate,
) => {
  const existingAcademicSession = await prisma.academicSession.findUnique({
    where: {
      id: academicSessionId,
    },
  });

  if (!existingAcademicSession) {
    throw new Error('Academic session not found');
  }

  const updatedAcademicSession = await prisma.academicSession.update({
    where: {
      id: academicSessionId,
    },
    data: payload,
  });

  return updatedAcademicSession;
};

const deleteAcademicSessionFromDB = async (academicSessionId: string) => {
  const existingAcademicSession = await prisma.academicSession.findUnique({
    where: {
      id: academicSessionId,
    },
  });

  if (!existingAcademicSession) {
    throw new Error('Academic session not found');
  }

  await prisma.academicSession.delete({
    where: {
      id: academicSessionId,
    },
  });
};

export const AcademicSessionService = {
  createAcademicSessionIntoDB,
  getAllAcademicSessionsFromDB,
  getAcademicSessionByIdFromDB,
  updateAcademicSessionFromDB,
  deleteAcademicSessionFromDB,
};
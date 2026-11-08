import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IProgramCreate, IProgramUpdate } from './program.type';

const createProgramIntoDB = async (payload: IProgramCreate) => {
  const newProgram = await prisma.program.create({
    data: payload,
  });

  return newProgram;
};

const getAllProgramsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['program_name'],
  });

  const [totalItems, programs] = await prisma.$transaction([
    prisma.program.count({ where }),
    prisma.program.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        institution: true,
        departments: {
          include: {
            academicClasses: {
              include: {
                subjects: true,
                academicSections: true,
              }
            }
          }
        },
      },
    }),
  ]);


  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: programs,
  };
};

const getProgramByIdFromDB = async (programId: string) => {
  const existingProgram = await prisma.program.findUnique({
    where: {
      id: programId,
    },
    include: {
      institution: true,
    },
  });

  if (!existingProgram) {
    throw new Error('Program not found');
  }

  return existingProgram;
};

const updateProgramFromDB = async (
  programId: string,
  payload: IProgramUpdate,
) => {
  const existingProgram = await prisma.program.findUnique({
    where: {
      id: programId,
    },
  });

  if (!existingProgram) {
    throw new Error('Program not found');
  }
console.log(payload?.duration_years);

  const updatedProgram = await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      ...payload,
      duration_years: payload.duration_years ? Number(payload.duration_years) : null,
    },
  });

  return updatedProgram;
};

const deleteProgramFromDB = async (programId: string) => {
  const existingProgram = await prisma.program.findUnique({
    where: {
      id: programId,
    },
  });

  if (!existingProgram) {
    throw new Error('Program not found');
  }

  await prisma.program.delete({
    where: {
      id: programId,
    },
  });
};

export const ProgramService = {
  createProgramIntoDB,
  getAllProgramsFromDB,
  getProgramByIdFromDB,
  updateProgramFromDB,
  deleteProgramFromDB,
};
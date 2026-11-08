import prisma from '../../../db/db.config';
import { TGradeSystemPayload, TGradeSystemUpdatePayload } from './gradeSystem.type';

const createGradeSystemIntoDB = async (payload: TGradeSystemPayload) => {
  const gradeSystem = await prisma.gradeSystem.create({
    data: payload
  });

  return gradeSystem;
};

const getAllGradeSystemsFromDB = async () => {
  const gradeSystems = await prisma.gradeSystem.findMany({
    orderBy: {
      grade_point: 'desc',
    },
  });

  return gradeSystems;
};

const getGradeSystemByIdFromDB = async (id: string) => {
  const gradeSystem = await prisma.gradeSystem.findUnique({
    where: { id },
  });

  if (!gradeSystem) {
    throw new Error('Grade system not found');
  }

  return gradeSystem;
};

const updateGradeSystemInDB = async (
  id: string,
  payload: TGradeSystemUpdatePayload,
) => {
  const existingGradeSystem = await prisma.gradeSystem.findUnique({
    where: { id },
  });

  if (!existingGradeSystem) {
    throw new Error('Grade system not found');
  }

  const updatedGradeSystem = await prisma.gradeSystem.update({
    where: { id },
    data: {
      grade_name: payload.grade_name,
      grade_point: payload.grade_point,
      mark_from: payload.mark_from,
      mark_to: payload.mark_to,
      remark: payload.remark,
    },
  });

  return updatedGradeSystem;
};

const deleteGradeSystemFromDB = async (id: string) => {
  const existingGradeSystem = await prisma.gradeSystem.findUnique({
    where: { id },
  });

  if (!existingGradeSystem) {
    throw new Error('Grade system not found');
  }

  await prisma.gradeSystem.delete({
    where: { id },
  });

  return existingGradeSystem;
};

export const gradeSystemService = {
  createGradeSystemIntoDB,
  getAllGradeSystemsFromDB,
  getGradeSystemByIdFromDB,
  updateGradeSystemInDB,
  deleteGradeSystemFromDB,
};
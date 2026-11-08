import prisma from '../../../db/db.config';
import { IAdmitCardLogCreate, IAdmitCardLogUpdate } from './admitCardLog.type';

const createAdmitCardLogIntoDB = async (payload: IAdmitCardLogCreate) => {
  const result = await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { id: payload.student_id },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const examConfig = await tx.examConfig.findUnique({
      where: { id: payload.exam_config_id },
    });

    if (!examConfig) {
      throw new Error('Exam config not found');
    }

    const existingLog = await tx.admitCardLog.findUnique({
      where: {
        student_id_exam_config_id: {
          student_id: payload.student_id,
          exam_config_id: payload.exam_config_id,
        },
      },
    });

    if (existingLog) {
      throw new Error('Admit card already generated for this student and exam');
    }

    const admitCardLog = await tx.admitCardLog.create({
      data: {
        student_id: payload.student_id,
        exam_config_id: payload.exam_config_id,
        status: (payload.status as any) || 'PENDING',
      },
      include: {
        student: true,
        examConfig: true,
      },
    });

    return admitCardLog;
  });

  return result;
};

const getAllAdmitCardLogsFromDB = async () => {
  const logs = await prisma.admitCardLog.findMany({
    include: {
      student: true,
      examConfig: {
        include: {
          academicClass: true,
          program: true,
          department: true,
          batch: true,
        },
      },
    },
    orderBy: {
      generated_at: 'desc',
    },
  });

  return logs;
};

const getAdmitCardLogByIdFromDB = async (id: string) => {
  const log = await prisma.admitCardLog.findUnique({
    where: { id },
    include: {
      student: true,
      examConfig: {
        include: {
          academicClass: true,
          program: true,
          department: true,
          batch: true,
          examSchedules: {
            include: {
              subject: true,
              program: true,
              department: true,
            },
          },
        },
      },
    },
  });

  if (!log) {
    throw new Error('Admit card log not found');
  }

  return log;
};

const updateAdmitCardLogInDB = async (id: string, payload: IAdmitCardLogUpdate) => {
  const existingLog = await prisma.admitCardLog.findUnique({
    where: { id },
  });

  if (!existingLog) {
    throw new Error('Admit card log not found');
  }

  const updatedLog = await prisma.admitCardLog.update({
    where: { id },
    data: {
      status: payload.status as any,
    },
    include: {
      student: true,
      examConfig: true,
    },
  });

  return updatedLog;
};

const deleteAdmitCardLogFromDB = async (id: string) => {
  const existingLog = await prisma.admitCardLog.findUnique({
    where: { id },
  });

  if (!existingLog) {
    throw new Error('Admit card log not found');
  }

  await prisma.admitCardLog.delete({
    where: { id },
  });

  return existingLog;
};

export const admitCardLogService = {
  createAdmitCardLogIntoDB,
  getAllAdmitCardLogsFromDB,
  getAdmitCardLogByIdFromDB,
  updateAdmitCardLogInDB,
  deleteAdmitCardLogFromDB,
};
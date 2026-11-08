/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import { IExamScheduleCreate, IExamScheduleUpdate } from './examSchedule.type';

const parseTimeToDB = (value: string, examDate?: string): Date => {
  if (value.includes('T')) {
    return new Date(value);
  }
  const datePart = examDate || new Date().toISOString().split('T')[0];
  return new Date(`${datePart}T${value}:00.000Z`);
};

const createExamScheduleIntoDB = async (payload: IExamScheduleCreate) => {
  const result = await prisma.$transaction(async (tx) => {
    const examConfig = await tx.examConfig.findUnique({
      where: { id: payload.examConfigId },
    });

    if (!examConfig) {
      throw new Error('Exam config not found');
    }

    const subject = await tx.subject.findUnique({
      where: { id: payload.subjectId },
    });

    if (!subject) {
      throw new Error('Subject not found');
    }

    const examSchedule = await tx.examSchedule.create({
      data: {
        ...payload,
        examDate: new Date(payload.examDate),
        startTime: parseTimeToDB(payload.startTime, payload.examDate),
        endTime: parseTimeToDB(payload.endTime, payload.examDate),
      },
      include: {
        examConfig: true,
        program: true,
        department: true,
        subject: true,
      },
    });

    return examSchedule;
  });

  return result;
};

const getAllExamSchedulesFromDB = async (query?: Record<string, string | string[]>) => {
  // Supports both camelCase and snake_case for backward compat with URL persistence (subject-config uses programId etc.)
  const where: Record<string, unknown> = {};
  const examConfigId = (query as any)?.examConfigId ?? (query as any)?.exam_config_id;
  const subjectId = (query as any)?.subjectId ?? (query as any)?.subject_id;
  const programId = (query as any)?.programId ?? (query as any)?.program_id;
  const departmentId = (query as any)?.departmentId ?? (query as any)?.department_id;
  const yearRaw = (query as any)?.year ?? (query as any)?.levelYear ?? (query as any)?.level_year;
  const examDateRaw = (query as any)?.exam_date ?? (query as any)?.examDate;
  const examTakenYear = (query as any)?.examTakenYear ?? (query as any)?.exam_taken_year;
  const academicClassId = (query as any)?.academicClassId ?? (query as any)?.academic_class_id;
  if (examConfigId) where.examConfigId = String(examConfigId);
  if (subjectId) where.subjectId = String(subjectId);
  if (programId) where.program_id = String(programId);
  if (departmentId) where.department_id = String(departmentId);
  if (yearRaw) where.year = Number(yearRaw);
  if (examTakenYear) where.examTakenYear = Number(examTakenYear);
  if (academicClassId) {
    (where as Record<string, unknown>).examConfig = { academic_class_id: String(academicClassId) };
  }
  if (examDateRaw) {
    const d = new Date(String(examDateRaw));
    if (!isNaN(d.getTime())) {
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(end.getDate()+1);
      (where as any).examDate = { gte: start, lt: end };
    }
  }
  const hasWhere = Object.keys(where).length > 0;
  const examSchedules = await prisma.examSchedule.findMany({
    where: hasWhere ? (where as never) : undefined,
    include: {
      examConfig: true,
      program: true,
      department: true,
      subject: true,
    },
    orderBy: {
      examDate: 'desc',
    },
  });

  return examSchedules;
};

export const getSubjectsWithScheduledExamFromDB = async (filters: {
  academicClassId?: string;
  programId?: string;
  departmentId?: string;
  year?: number;
  examTakenYear?: number;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.academicClassId) {
    (where as Record<string, unknown>).examConfig = { academic_class_id: filters.academicClassId };
  }
  if (filters.programId) where.program_id = filters.programId;
  if (filters.departmentId) where.department_id = filters.departmentId;
  if (filters.year !== undefined) where.year = filters.year;
  if (filters.examTakenYear !== undefined) where.examTakenYear = filters.examTakenYear;

  const schedules = await prisma.examSchedule.findMany({
    where: where as never,
    distinct: ['subjectId'],
    include: { subject: true },
    orderBy: { subjectId: 'asc' },
  });

  // `distinct` may not dedupe correctly on MySQL with include; dedupe manually as fallback
  const seen = new Set<string>();
  const subjects: unknown[] = [];
  for (const s of schedules) {
    const sid = (s as unknown as { subjectId: string }).subjectId;
    if (!seen.has(sid)) {
      seen.add(sid);
      subjects.push((s as unknown as { subject: unknown }).subject);
    }
  }
  return subjects;
};

export const getExamConfigsWithScheduledExamFromDB = async (filters: {
  academicClassId?: string;
  programId?: string;
  departmentId?: string;
  subjectId?: string;
  year?: number;
  examTakenYear?: number;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.academicClassId) {
    (where as Record<string, unknown>).examConfig = { academic_class_id: filters.academicClassId };
  }
  if (filters.programId) where.program_id = filters.programId;
  if (filters.departmentId) where.department_id = filters.departmentId;
  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.year !== undefined) where.year = filters.year;
  if (filters.examTakenYear !== undefined) where.examTakenYear = filters.examTakenYear;

  const schedules = await prisma.examSchedule.findMany({
    where: where as never,
    distinct: ['examConfigId'],
    include: { examConfig: true },
    orderBy: { examConfigId: 'asc' },
  });

  const seen = new Set<string>();
  const configs: unknown[] = [];
  for (const s of schedules) {
    const eid = (s as unknown as { examConfigId: string }).examConfigId;
    if (!seen.has(eid)) {
      seen.add(eid);
      configs.push((s as unknown as { examConfig: unknown }).examConfig);
    }
  }
  return configs;
};

const getExamScheduleByIdFromDB = async (id: string) => {
  const examSchedule = await prisma.examSchedule.findUnique({
    where: { id },
    include: {
      examConfig: {
        include: {
          academicClass: true,
          program: true,
          department: true,
          batch: true,
        },
      },
      program: true,
      department: true,
      subject: true,
    },
  });

  if (!examSchedule) {
    throw new Error('Exam schedule not found');
  }

  return examSchedule;
};

const updateExamScheduleInDB = async (id: string, payload: IExamScheduleUpdate) => {
  const existingExamSchedule = await prisma.examSchedule.findUnique({
    where: { id },
  });

  if (!existingExamSchedule) {
    throw new Error('Exam schedule not found');
  }

  const updatedExamSchedule = await prisma.examSchedule.update({
    where: { id },
    data: {
      ...payload,
      examDate: payload.examDate ? new Date(payload.examDate) : undefined,
      startTime: payload.startTime ? parseTimeToDB(payload.startTime, payload.examDate || existingExamSchedule.examDate.toISOString().split('T')[0]) : undefined,
      endTime: payload.endTime ? parseTimeToDB(payload.endTime, payload.examDate || existingExamSchedule.examDate.toISOString().split('T')[0]) : undefined,
    },
    include: {
      examConfig: true,
      program: true,
      department: true,
      subject: true,
    },
  });

  return updatedExamSchedule;
};

const deleteExamScheduleFromDB = async (id: string) => {
  const existingExamSchedule = await prisma.examSchedule.findUnique({
    where: { id },
  });

  if (!existingExamSchedule) {
    throw new Error('Exam schedule not found');
  }

  await prisma.examSchedule.delete({
    where: { id },
  });

  return existingExamSchedule;
};

export const examScheduleService = {
  createExamScheduleIntoDB,
  getAllExamSchedulesFromDB,
  getSubjectsWithScheduledExamFromDB,
  getExamConfigsWithScheduledExamFromDB,
  getExamScheduleByIdFromDB,
  updateExamScheduleInDB,
  deleteExamScheduleFromDB,
};
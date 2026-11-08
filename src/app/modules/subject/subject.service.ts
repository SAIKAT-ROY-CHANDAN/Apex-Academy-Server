/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { ISubjectCreate, ISubjectUpdate } from './subject.type';

const createSubjectIntoDB = async (payload: ISubjectCreate) => {
  const { class_id, subjects } = payload;

  const uniqueSubjectNames = [...new Set(subjects.map((name) => name.trim()))];

  const existingSubjects = await prisma.subject.findMany({
    where: {
      class_id: class_id,
      name: { in: uniqueSubjectNames },
    },
  });

  if (existingSubjects.length > 0) {
    const existingNames = existingSubjects.map((s) => s.name).join(', ');
    throw new Error(
      `These subjects already exist for this class: ${existingNames}`,
    );
  }

  await prisma.subject.createMany({
    data: uniqueSubjectNames.map((name) => ({
      name,
      class_id: class_id,
    })),
  });

  const newSubjects = await prisma.subject.findMany({
    where: {
      class_id: class_id,
      name: { in: uniqueSubjectNames },
    },
  });

  return newSubjects;
};

const getAllSubjectsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name'],
  });

  // ── Map flat query params to nested academicClass filters ──
  // Canonical Level/Year lives on AcademicClass.year_level (Int) and
  // AcademicClass.class_level. Accept `levelYear` alias used by the
  // subject-config filters (`programId`/`departmentId`/`levelYear`) as well
  // as snake_case variants. Legacy `year` string ("1st Year") is coerced to Int.
  const rawQuery: any = query as any;
  const academicClassWhere: Record<string, any> = {};
  // Holds OR condition when levelYear should match either year_level or class_level
  let levelYearOrCondition: any = null;

  // Preserve an explicit filter.academicClass if the caller already sent one
  if (where.academicClass && typeof where.academicClass === 'object') {
    // Don't mutate if it already has OR
    if (!(where.academicClass as any).OR) {
      Object.assign(academicClassWhere, where.academicClass);
    }
  }

  if (rawQuery.class_id) academicClassWhere.id = rawQuery.class_id;
  // Program aliases: program_id, programId
  const progId = rawQuery.program_id ?? rawQuery.programId;
  if (progId) academicClassWhere.program_id = progId;
  // Department aliases: department_id, departmentId
  const deptId = rawQuery.department_id ?? rawQuery.departmentId;
  if (deptId) academicClassWhere.department_id = deptId;

  // Level/Year aliases: levelYear, level_year, year_level, yearLevel, year
  const rawLevelYear =
    rawQuery.levelYear ??
    rawQuery.level_year ??
    rawQuery.year_level ??
    rawQuery.yearLevel;
  if (rawLevelYear != null && String(rawLevelYear).trim() !== '') {
    const lvl = Number(String(rawLevelYear).trim().replace(/[^0-9\-]/g, ''));
    if (!Number.isNaN(lvl) && String(rawLevelYear).trim().replace(/[^0-9\-]/g, '') !== '') {
      // Match either year_level or class_level so audit view doesn't miss rows
      // where only one of the two is populated. Use OR at the academicClass level.
      levelYearOrCondition = { OR: [{ year_level: lvl }, { class_level: lvl }] };
    }
  } else if (rawQuery.year != null && String(rawQuery.year).trim() !== '') {
    const normalized = String(rawQuery.year).trim();
    const numeric = Number(normalized.replace(/[^0-9\-]/g, ''));
    if (!Number.isNaN(numeric) && normalized.replace(/[^0-9\-]/g, '') !== '') {
      levelYearOrCondition = { OR: [{ year_level: numeric }, { class_level: numeric }] };
    }
  }
  // Explicit class_level override (rare, but keep for completeness)
  if (rawQuery.class_level != null && String(rawQuery.class_level).trim() !== '') {
    const lvl = Number(rawQuery.class_level);
    if (!Number.isNaN(lvl)) academicClassWhere.class_level = lvl;
  }

  const hasDirectWhere = Object.keys(academicClassWhere).length > 0;
  const hasOrCondition = levelYearOrCondition != null;

  if (hasDirectWhere && hasOrCondition) {
    // Combine e.g. { program_id: X, OR: [{year_level:2},{class_level:2}] } is invalid directly;
    // Use AND to combine program/department with the year OR.
    (where as any).academicClass = {
      AND: [academicClassWhere, levelYearOrCondition],
    };
  } else if (hasOrCondition) {
    (where as any).academicClass = levelYearOrCondition;
  } else if (hasDirectWhere) {
    (where as any).academicClass = academicClassWhere;
  }

  const [totalItems, subjects] = await prisma.$transaction([
    prisma.subject.count({ where }),
    prisma.subject.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        academicClass: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: subjects,
  };
};

const getSubjectByIdFromDB = async (subjectId: string) => {
  const existingSubject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
    include: {
      academicClass: true,
    },
  });

  if (!existingSubject) {
    throw new Error('Subject not found');
  }

  return existingSubject;
};

const updateSubjectFromDB = async (
  subjectId: string,
  payload: ISubjectUpdate,
) => {
  const existingSubject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
  });

  if (!existingSubject) {
    throw new Error('Subject not found');
  }

  if (payload.name) {
    const duplicateSubject = await prisma.subject.findFirst({
      where: {
        id: { not: subjectId },
        class_id: payload.class_id ?? existingSubject.class_id,
        name: payload.name,
      },
    });

    if (duplicateSubject) {
      throw new Error('This subject already exists for this class');
    }
  }

  const updatedSubject = await prisma.subject.update({
    where: {
      id: subjectId,
    },
    data: payload,
  });

  return updatedSubject;
};

const deleteSubjectFromDB = async (subjectId: string) => {
  const existingSubject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
  });

  if (!existingSubject) {
    throw new Error('Subject not found');
  }

  await prisma.subject.delete({
    where: {
      id: subjectId,
    },
  });
};

export const SubjectService = {
  createSubjectIntoDB,
  getAllSubjectsFromDB,
  getSubjectByIdFromDB,
  updateSubjectFromDB,
  deleteSubjectFromDB,
};
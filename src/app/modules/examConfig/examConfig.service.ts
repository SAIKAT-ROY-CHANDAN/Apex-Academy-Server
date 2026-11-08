import prisma from '../../../db/db.config';
import { Prisma } from '../../../../generated/prisma/client';
import { createHash } from 'node:crypto';
import AppError from '../../errors/AppError';
import { IExamConfigCreate, IExamConfigUpdate } from './examConfig.type';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';

export const DUPLICATE_EXAM_MESSAGE =
  'An exam with the same name, class, department, program, section and exam date already exists.';

/** Trim + collapse inner whitespace before saving and comparing. */
export const normalizeExamName = (raw: string): string =>
  raw.trim().replace(/\s+/g, ' ');

// ExamConfig has no shift column, so shift is not part of the key.
// Same calendar day is evaluated in Asia/Dhaka (UTC+6), consistent with the
// exam-year filter below.
const getExamDayRange = (input: string): { gte: Date; lt: Date } | null => {
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(input.trim());
  let start: Date;
  if (dayMatch) {
    start = new Date(
      `${dayMatch[1]}-${dayMatch[2]}-${dayMatch[3]}T00:00:00+06:00`,
    );
  } else {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) return null;
    const dhakaDay = new Date(parsed.getTime() + 6 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    start = new Date(`${dhakaDay}T00:00:00+06:00`);
  }
  if (Number.isNaN(start.getTime())) return null;
  return { gte: start, lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};

type DuplicateKey = {
  exam_name: string;
  academic_class_id: string;
  program_id?: string | null;
  department_id?: string | null;
  group?: string | null;
  batch_id?: string | null;
  sectionId?: string | null;
  exam_date: string;
};

// NULL-safe match: NULL/undefined only matches NULL (both empty counts as a match).
const nullSafeEquals = (value: string | null | undefined) =>
  value == null ? { equals: null } : { equals: value };

/**
 * Fixed-size race backstop for the duplicate rule: SHA-256 over the exact
 * duplicate key, stored in `dedupe_key` (unique). NULLs are encoded as empty
 * strings, so "both empty" matches at the DB level too — something MySQL
 * cannot do with a multi-column UNIQUE index (NULLs are distinct there, and
 * the six identifying columns exceed the 3072-byte index limit anyway).
 */
export const buildExamDedupeKey = (
  key: DuplicateKey & { exam_day: string },
): string =>
  createHash('sha256')
    .update(
      [
        normalizeExamName(key.exam_name).toLowerCase(),
        key.program_id ?? '',
        key.department_id ?? '',
        key.academic_class_id,
        key.group ?? '',
        key.batch_id ?? '',
        key.sectionId ?? '',
        key.exam_day,
      ].join('|'),
    )
    .digest('hex');

type ExamTxReader = {
  examConfig: {
    findMany: typeof prisma.examConfig.findMany;
  };
  academicSection: {
    findFirst: typeof prisma.academicSection.findFirst;
  };
};

// Deterministic string for the Dhaka calendar day (UTC instant of the
// day start). Shared by the duplicate lookup and the dedupe-key builder.
export const getExamDayKey = (input: string): string | null => {
  const range = getExamDayRange(input);
  return range ? range.gte.toISOString() : null;
};

const throwIfDuplicateExam = async (
  tx: ExamTxReader,
  key: DuplicateKey,
  excludeId?: string,
): Promise<void> => {
  const normalized = normalizeExamName(key.exam_name);
  if (!normalized) return; // let validation/DB reject empty names
  const range = getExamDayRange(key.exam_date);
  if (!range) return; // unparsable date — let downstream validation fail loudly

  const candidates = await tx.examConfig.findMany({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      academic_class_id: key.academic_class_id,
      program_id: nullSafeEquals(key.program_id),
      department_id: nullSafeEquals(key.department_id),
      group: nullSafeEquals(key.group),
      batch_id: nullSafeEquals(key.batch_id),
      section_id: nullSafeEquals(key.sectionId),
      exam_date: { gte: range.gte, lt: range.lt },
    },
    select: { id: true, exam_name: true },
  });

  const hit = candidates.find(
    (c) =>
      normalizeExamName(c.exam_name).toLowerCase() ===
      normalized.toLowerCase(),
  );
  if (hit) throw new AppError(409, DUPLICATE_EXAM_MESSAGE);
};

// The section must be one of the sections offered for the selected
// program/department/class triple (same source as the filtered-sections
// endpoint options). Rejects foreign or stale section IDs with a 400.
const assertSectionBelongsToTriple = async (
  tx: ExamTxReader,
  sectionId: string,
  academic_class_id: string,
  program_id?: string | null,
  department_id?: string | null,
): Promise<void> => {
  const section = await tx.academicSection.findFirst({
    where: {
      id: sectionId,
      academicClass: {
        id: academic_class_id,
        ...(program_id ? { program_id } : {}),
        ...(department_id ? { department_id } : {}),
      },
    },
    select: { id: true },
  });
  if (!section) {
    throw new AppError(
      400,
      'Selected section does not belong to the selected program, department and class.',
    );
  }
};

const throwIfUniqueViolation = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new AppError(409, DUPLICATE_EXAM_MESSAGE);
  }
  throw error;
};

const createExamConfigIntoDB = async (payload: IExamConfigCreate) => {
  const result = await prisma.$transaction(async (tx) => {
    const academicClass = await tx.academicClass.findUnique({
      where: { id: payload.academic_class_id },
    });

    if (!academicClass) {
      throw new Error('Academic class not found');
    }

    if (payload.batch_id) {
      const batch = await tx.batch.findUnique({
        where: { id: payload.batch_id },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }
    }

    // NOTE: program & department are TOP-LEVEL relations on examConfig,
    // sibling to academicClass — NOT nested inside academicClass.
    // Response shape: { academicClass: {...}, program: {...}, department: {...}, batch: {...}, section: {...} }
    const sectionId = payload.sectionId || undefined;
    if (sectionId) {
      await assertSectionBelongsToTriple(
        tx,
        sectionId,
        payload.academic_class_id,
        payload.program_id,
        payload.department_id,
      );
    }

    const dupeKey: DuplicateKey = {
      exam_name: payload.exam_name,
      academic_class_id: payload.academic_class_id,
      program_id: payload.program_id,
      department_id: payload.department_id,
      group: payload.group,
      batch_id: payload.batch_id,
      sectionId,
      exam_date: payload.exam_date,
    };
    await throwIfDuplicateExam(tx, dupeKey);

    const examDay = getExamDayKey(payload.exam_date);

    let examConfig;
    try {
      examConfig = await tx.examConfig.create({
        data: {
          academic_class_id: payload.academic_class_id,
          program_id: payload.program_id,
          department_id: payload.department_id,
          group: payload.group,
          batch_id: payload.batch_id,
          section_id: sectionId,
          exam_name: normalizeExamName(payload.exam_name),
          exam_date: new Date(payload.exam_date),
          dedupe_key: examDay
            ? buildExamDedupeKey({ ...dupeKey, exam_day: examDay })
            : undefined,
        },
        include: {
          academicClass: true,
          program: true,
          department: true,
          batch: true,
          section: true,
        },
      });
    } catch (error) {
      // Race backstop: two requests passing the check at the same moment hit
      // the dedupe_key unique guard together — report the same 409.
      throwIfUniqueViolation(error);
    }

    return examConfig;
  });

  return result;
};

const getAllExamConfigsFromDB = async (query: QueryParams = {}) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['exam_name'],
  });

  // Build extended where for new filter params (program_id, department_id, academic_class_id, exam_year, section, shift)
  // query may contain direct keys (e.g., ?program_id=xxx) and not only `filter` JSON — handle both.
  const rawQuery = query as unknown as Record<string, unknown>;
  const programId = (rawQuery.program_id ?? rawQuery.programId) as string | undefined;
  const departmentId = (rawQuery.department_id ?? rawQuery.departmentId) as string | undefined;
  const academicClassId = (rawQuery.academic_class_id ?? rawQuery.academicClassId ?? rawQuery.class_id) as string | undefined;
  const examYear = (rawQuery.exam_year ?? rawQuery.examYear) as string | undefined;
  const section = (rawQuery.section ?? rawQuery.sectionId ?? rawQuery.section_id) as string | undefined;
  const sectionName = rawQuery.section_name as string | undefined;
  const sectionValue = section ?? sectionName;

  const extendedWhere: Record<string, unknown> = { ...where };

  if (programId) extendedWhere.program_id = programId;
  if (departmentId) extendedWhere.department_id = departmentId;
  if (academicClassId) extendedWhere.academic_class_id = academicClassId;

  // Exam Year — filter by year of exam_date
  // Bangladesh is UTC+6, so an exam on Jan 1 Dhaka (00:00+06:00 = Dec 31 18:00Z) must not fall into previous year.
  if (examYear) {
    const yearNum = Number(examYear);
    if (!Number.isNaN(yearNum)) {
      const start = new Date(`${yearNum}-01-01T00:00:00+06:00`);
      const end = new Date(`${yearNum + 1}-01-01T00:00:00+06:00`);
      extendedWhere.exam_date = {
        gte: start,
        lt: end,
      };
    }
  }

  // Section — filter via AcademicSection relation (AcademicSection.class_id -> AcademicClass)
  // Section comes from AcademicSection.id (or section_name). Use relation filter on academicClass.academicSections
  if (sectionValue) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sectionValue);
    extendedWhere.academicClass = {
      academicSections: {
        some: isUuid ? { id: sectionValue } : { section_name: sectionValue },
      },
    };
  }

  // Note: shift has no column on ExamConfig; ignored but accepted as query param per spec.

  const [totalItems, examConfigs] = await prisma.$transaction([
    prisma.examConfig.count({ where: extendedWhere as never }),
    prisma.examConfig.findMany({
      skip,
      take,
      orderBy,
      where: extendedWhere as never,
      include: {
        // The SECTION column reads the exam's own section (section_id);
        // academicClass stays for the CLASS/YEAR column.
        academicClass: true,
        program: true,
        department: true,
        batch: true,
        section: true,
        examSchedules: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: examConfigs,
  };
};

export type ExamOptionFilters = {
  programId?: string;
  departmentId?: string;
  classId?: string;
  yearLevel?: number;
};

export type ExamOption = {
  id: string;
  name: string;
  className: string;
  sectionName: string | null;
  examDate: string;
};

/**
 * Lightweight exam options for dependent selects (e.g. the Exam Routine
 * filters). All filters are optional — with none provided, every exam is
 * returned. Sorted by exam date descending, then name.
 */
const getExamOptionsFromDB = async (
  filters: ExamOptionFilters = {},
): Promise<ExamOption[]> => {
  const where: Record<string, unknown> = {};
  if (filters.programId) where.program_id = filters.programId;
  if (filters.departmentId) where.department_id = filters.departmentId;
  if (filters.classId) where.academic_class_id = filters.classId;
  if (filters.yearLevel !== undefined) {
    (where as Record<string, unknown>).academicClass = {
      year_level: filters.yearLevel,
    };
  }

  const exams = await prisma.examConfig.findMany({
    where: where as never,
    select: {
      id: true,
      exam_name: true,
      exam_date: true,
      academicClass: { select: { class_name: true } },
      section: { select: { section_name: true } },
    },
    orderBy: [{ exam_date: 'desc' }, { exam_name: 'asc' }],
  });

  return exams.map((e) => ({
    id: e.id,
    name: e.exam_name,
    className: e.academicClass?.class_name ?? '',
    sectionName: e.section?.section_name ?? null,
    examDate: e.exam_date.toISOString(),
  }));
};

const getExamConfigByIdFromDB = async (id: string) => {
  const examConfig = await prisma.examConfig.findUnique({
    where: { id },
    include: {
      academicClass: true,
      program: true,
      department: true,
      batch: true,
      section: true,
      examSchedules: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!examConfig) {
    throw new Error('Exam config not found');
  }

  return examConfig;
};

const updateExamConfigInDB = async (id: string, payload: IExamConfigUpdate) => {
  return prisma.$transaction(async (tx) => {
    const existingExamConfig = await tx.examConfig.findUnique({
      where: { id },
    });

    if (!existingExamConfig) {
      throw new Error('Exam config not found');
    }

    // Merge payload over the stored row so the duplicate check sees the
    // final values; exclude self so saving without changes still works.
    const pick = <T>(v: T | undefined, fallback: T): T =>
      v !== undefined ? v : fallback;
    const mergedClassId = pick(
      payload.academic_class_id,
      existingExamConfig.academic_class_id,
    );
    const mergedProgramId = pick(
      payload.program_id,
      existingExamConfig.program_id,
    );
    const mergedDepartmentId = pick(
      payload.department_id,
      existingExamConfig.department_id,
    );
    const mergedSectionId =
      pick(payload.sectionId, existingExamConfig.section_id) || undefined;
    if (mergedSectionId) {
      await assertSectionBelongsToTriple(
        tx,
        mergedSectionId,
        mergedClassId,
        mergedProgramId,
        mergedDepartmentId,
      );
    }
    const dupeKey: DuplicateKey = {
      exam_name: pick(payload.exam_name, existingExamConfig.exam_name),
      academic_class_id: mergedClassId,
      program_id: mergedProgramId,
      department_id: mergedDepartmentId,
      group: pick(payload.group, existingExamConfig.group),
      batch_id: pick(payload.batch_id, existingExamConfig.batch_id),
      sectionId: mergedSectionId,
      exam_date: pick(
        payload.exam_date,
        existingExamConfig.exam_date.toISOString(),
      ),
    };
    await throwIfDuplicateExam(tx, dupeKey, id);
    const examDay = getExamDayKey(dupeKey.exam_date);

    try {
      const updatedExamConfig = await tx.examConfig.update({
        where: { id },
        data: {
          academic_class_id: payload.academic_class_id,
          program_id: payload.program_id,
          department_id: payload.department_id,
          group: payload.group,
          batch_id: payload.batch_id,
          section_id: mergedSectionId,
          exam_name:
            payload.exam_name !== undefined
              ? normalizeExamName(payload.exam_name)
              : undefined,
          exam_date: payload.exam_date
            ? new Date(payload.exam_date)
            : undefined,
          dedupe_key: examDay
            ? buildExamDedupeKey({ ...dupeKey, exam_day: examDay })
            : undefined,
          is_published: payload.is_published,
        },
        include: {
          academicClass: true,
          program: true,
          department: true,
          batch: true,
          section: true,
        },
      });

      return updatedExamConfig;
    } catch (error) {
      throwIfUniqueViolation(error);
    }
  });
};

const deleteExamConfigFromDB = async (id: string) => {
  const existingExamConfig = await prisma.examConfig.findUnique({
    where: { id },
  });

  if (!existingExamConfig) {
    throw new Error('Exam config not found');
  }

  await prisma.examConfig.delete({
    where: { id },
  });

  return existingExamConfig;
};

const getDistinctExamYearsFromDB = async (query: QueryParams = {}) => {
  const rawQuery = query as unknown as Record<string, unknown>;
  const programId = (rawQuery.program_id ?? rawQuery.programId) as string | undefined;
  const departmentId = (rawQuery.department_id ?? rawQuery.departmentId) as string | undefined;
  const academicClassId = (rawQuery.academic_class_id ?? rawQuery.academicClassId ?? rawQuery.class_id) as string | undefined;
  const section = (rawQuery.section ?? rawQuery.sectionId ?? rawQuery.section_id ?? rawQuery.section_name) as string | undefined;
  // shift is accepted but has no column on ExamConfig — ignored for year narrowing
  // exam_year is intentionally not used to filter the distinct years list

  const conditions: Prisma.Sql[] = [];
  if (programId) conditions.push(Prisma.sql`program_id = ${programId}`);
  if (departmentId) conditions.push(Prisma.sql`department_id = ${departmentId}`);
  if (academicClassId) conditions.push(Prisma.sql`academic_class_id = ${academicClassId}`);
  if (section) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(section);
    if (isUuid) {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM academic_sections WHERE academic_sections.class_id = exam_configs.academic_class_id AND academic_sections.id = ${section})`,
      );
    } else {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM academic_sections WHERE academic_sections.class_id = exam_configs.academic_class_id AND academic_sections.section_name = ${section})`,
      );
    }
  }

  const whereSql = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

  // Use DATE_ADD +6 HOUR so YEAR is evaluated in Asia/Dhaka (UTC+6) — avoids Jan 1 falling into previous year
  // Table is exam_configs, column exam_date (MySQL/MariaDB via PrismaMariaDb)
  const rows = await prisma.$queryRaw<Array<{ year: number | bigint }>>(
    Prisma.sql`SELECT DISTINCT YEAR(DATE_ADD(exam_date, INTERVAL 6 HOUR)) as year FROM exam_configs ${whereSql} ORDER BY year DESC`,
  );
  const years = rows
    .map((r) => Number(r.year))
    .filter((n) => !Number.isNaN(n) && n > 0);
  return years;
};

export const examConfigService = {
  createExamConfigIntoDB,
  getAllExamConfigsFromDB,
  getDistinctExamYearsFromDB,
  getExamConfigByIdFromDB,
  getExamOptionsFromDB,
  updateExamConfigInDB,
  deleteExamConfigFromDB,
};
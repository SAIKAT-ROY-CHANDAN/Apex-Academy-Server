import prisma from '../../../db/db.config';
import { TGradeRange, TGradeScalePayload, TGradeScaleUpdatePayload, TStudentResult } from './grade.type';

// simple in-memory cache for grade scales (per institutionId)
const gradeScaleCache = new Map<string, { data: TGradeRange[]; timestamp: number }>();
const CACHE_TTL_MS = 60_000;

export const calculatePercentage = (obtainMarks: number, totalMarks: number): number => {
  if (totalMarks <= 0) {
    throw new Error('totalMarks must be greater than 0');
  }
  const raw = (obtainMarks / totalMarks) * 100;
  // round to 2 decimals to avoid floating point boundary bugs (e.g. 59.999999)
  return Math.round(raw * 100) / 100;
};

export const getActiveGradeScale = async (institutionId?: string | null): Promise<TGradeRange[]> => {
  const cacheKey = institutionId ?? '__global__';
  const cached = gradeScaleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const where: Record<string, unknown> = institutionId ? { institutionId } : { institutionId: null };
  let scales = await prisma.gradeScale.findMany({
    where: where as never,
    orderBy: { minPercent: 'desc' },
  });

  // fallback to global if institution-specific empty
  if (scales.length === 0 && institutionId) {
    scales = await prisma.gradeScale.findMany({
      where: { institutionId: null },
      orderBy: { minPercent: 'desc' },
    });
  }

  if (scales.length === 0) {
    // Auto-seed global default scale on first use so teacher POST doesn't 500
    // when admin hasn't run seed-grade-scales yet. This persists to DB so next
    // call is truly DB-driven (spec: must read from GradeScale table).
    const defaults = [
      { minPercent: 80, maxPercent: 100, letterGrade: 'A+', gradePoint: 4.0 },
      { minPercent: 75, maxPercent: 79.99, letterGrade: 'A', gradePoint: 3.75 },
      { minPercent: 70, maxPercent: 74.99, letterGrade: 'A-', gradePoint: 3.5 },
      { minPercent: 65, maxPercent: 69.99, letterGrade: 'B+', gradePoint: 3.25 },
      { minPercent: 60, maxPercent: 64.99, letterGrade: 'B', gradePoint: 3.0 },
      { minPercent: 55, maxPercent: 59.99, letterGrade: 'B-', gradePoint: 2.75 },
      { minPercent: 50, maxPercent: 54.99, letterGrade: 'C+', gradePoint: 2.5 },
      { minPercent: 45, maxPercent: 49.99, letterGrade: 'C', gradePoint: 2.25 },
      { minPercent: 40, maxPercent: 44.99, letterGrade: 'D', gradePoint: 2.0 },
      { minPercent: 0, maxPercent: 39.99, letterGrade: 'F', gradePoint: 0.0 },
    ];
    try {
      const existingCount = await prisma.gradeScale.count({ where: where as never });
      if (existingCount === 0) {
        await prisma.gradeScale.createMany({
          data: defaults.map((d) => ({
            minPercent: d.minPercent,
            maxPercent: d.maxPercent,
            letterGrade: d.letterGrade,
            gradePoint: d.gradePoint,
            institutionId: (where as { institutionId?: string | null }).institutionId ?? null,
          })),
          skipDuplicates: true,
        });
        // re-query after seed
        scales = await prisma.gradeScale.findMany({
          where: where as never,
          orderBy: { minPercent: 'desc' },
        });
        if (scales.length === 0 && institutionId) {
          scales = await prisma.gradeScale.findMany({
            where: { institutionId: null },
            orderBy: { minPercent: 'desc' },
          });
        }
      }
    } catch {
      // if auto-seed fails (e.g. race), fall through to throw
    }
    if (scales.length === 0) {
      throw new Error('No grade scale configured. Please seed GradeScale (npm run seed-grade-scales) or create one via POST /grade');
    }
  }

  const data: TGradeRange[] = scales.map((s) => ({
    minPercent: s.minPercent,
    maxPercent: s.maxPercent,
    letterGrade: s.letterGrade,
    gradePoint: s.gradePoint,
    institutionId: s.institutionId,
  }));

  gradeScaleCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

export const clearGradeScaleCache = (institutionId?: string | null) => {
  if (institutionId) {
    gradeScaleCache.delete(institutionId);
    gradeScaleCache.delete('__global__');
  } else {
    gradeScaleCache.clear();
  }
};

export const getGradeFromPercentage = (
  percentage: number,
  gradeScale: TGradeRange[],
): TGradeRange => {
  const match = gradeScale.find(
    (range) => percentage >= range.minPercent && percentage <= range.maxPercent,
  );

  if (!match) {
    throw new Error(`No grade range found for percentage ${percentage}. Check grade scale configuration for gaps.`);
  }

  return match;
};

export const getResultStatus = (letterGrade: string): "Passed" | "Failed" => {
  return letterGrade === "F" ? "Failed" : "Passed";
};

export const calculateStudentResult = (
  obtainMarks: number,
  totalMarks: number,
  gradeScale: TGradeRange[],
): TStudentResult => {
  if (totalMarks <= 0) {
    throw new Error('totalMarks must be greater than 0');
  }
  if (obtainMarks < 0) {
    throw new Error('obtainMarks must be non-negative');
  }
  if (obtainMarks > totalMarks) {
    throw new Error('obtainMarks cannot exceed totalMarks');
  }

  const percentage = calculatePercentage(obtainMarks, totalMarks);
  const grade = getGradeFromPercentage(percentage, gradeScale);
  const status = getResultStatus(grade.letterGrade);

  return {
    obtainMarks,
    totalMarks,
    percentage,
    letterGrade: grade.letterGrade,
    gradePoint: grade.gradePoint,
    status,
  };
};

// CRUD for GradeScale table
const createGradeScaleIntoDB = async (payload: TGradeScalePayload) => {
  if (payload.minPercent > payload.maxPercent) {
    throw new Error('minPercent cannot exceed maxPercent');
  }
  const created = await prisma.gradeScale.create({
    data: {
      minPercent: payload.minPercent,
      maxPercent: payload.maxPercent,
      letterGrade: payload.letterGrade,
      gradePoint: payload.gradePoint,
      institutionId: payload.institutionId ?? null,
    },
  });
  clearGradeScaleCache(payload.institutionId ?? null);
  return created;
};

const getAllGradeScalesFromDB = async (institutionId?: string | null) => {
  const where: Record<string, unknown> | undefined = institutionId !== undefined ? { institutionId: institutionId ?? null } : undefined;
  const scales = await prisma.gradeScale.findMany({
    where: where as never,
    orderBy: [{ minPercent: 'desc' }],
  });
  return scales;
};

const getGradeScaleByIdFromDB = async (id: string) => {
  const scale = await prisma.gradeScale.findUnique({ where: { id } });
  if (!scale) throw new Error('Grade scale not found');
  return scale;
};

const updateGradeScaleInDB = async (id: string, payload: TGradeScaleUpdatePayload) => {
  const existing = await prisma.gradeScale.findUnique({ where: { id } });
  if (!existing) throw new Error('Grade scale not found');

  const minPercent = payload.minPercent ?? existing.minPercent;
  const maxPercent = payload.maxPercent ?? existing.maxPercent;
  if (minPercent > maxPercent) throw new Error('minPercent cannot exceed maxPercent');

  const updated = await prisma.gradeScale.update({
    where: { id },
    data: {
      minPercent: payload.minPercent,
      maxPercent: payload.maxPercent,
      letterGrade: payload.letterGrade,
      gradePoint: payload.gradePoint,
      institutionId: payload.institutionId,
    },
  });
  clearGradeScaleCache(existing.institutionId);
  if (payload.institutionId !== undefined) clearGradeScaleCache(payload.institutionId ?? null);
  return updated;
};

const deleteGradeScaleFromDB = async (id: string) => {
  const existing = await prisma.gradeScale.findUnique({ where: { id } });
  if (!existing) throw new Error('Grade scale not found');
  await prisma.gradeScale.delete({ where: { id } });
  clearGradeScaleCache(existing.institutionId);
  return existing;
};

export const gradeService = {
  calculatePercentage,
  getActiveGradeScale,
  getGradeFromPercentage,
  getResultStatus,
  calculateStudentResult,
  clearGradeScaleCache,
  createGradeScaleIntoDB,
  getAllGradeScalesFromDB,
  getGradeScaleByIdFromDB,
  updateGradeScaleInDB,
  deleteGradeScaleFromDB,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import { buildPrismaQuery, QueryParams } from '../../builders/prismaBuilderQuery';
import { IStudentExamResultCreate, IStudentExamResultUpdate } from './studentExamResult.type';
import { gradeService } from '../grade/grade.service';

const createStudentExamResultIntoDB = async (payload: IStudentExamResultCreate) => {
  const result = await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { id: payload.student_id },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const examSchedule = await tx.examSchedule.findUnique({
      where: { id: payload.exam_schedule_id },
    });

    if (!examSchedule) {
      throw new Error('Exam schedule not found');
    }

    if (payload.obtained_marks > examSchedule.fullMarks) {
      throw new Error('Obtained marks cannot exceed full marks');
    }

    // Resolve grade via GradeScale (percentage-based). Accept client-provided letterGrade for persistence
    // (real-time calc) but still validate via GradeScale; fallback to server calc if missing.
    let gradeId = payload.grade_id;
    let finalLetterGrade: string | null = (payload as any).letterGrade ?? (payload as any).grade ?? null;
    if (!gradeId) {
      const scale = await gradeService.getActiveGradeScale(payload.institutionId ?? null);
      const calc = gradeService.calculateStudentResult(
        payload.obtained_marks,
        examSchedule.fullMarks,
        scale,
      );
      if (!finalLetterGrade) finalLetterGrade = calc.letterGrade;
      const legacyGrade = await tx.gradeSystem.findFirst({
        where: { grade_name: finalLetterGrade },
      });
      if (legacyGrade) {
        gradeId = legacyGrade.id;
      } else {
        const newLegacy = await tx.gradeSystem.create({
          data: {
            grade_name: finalLetterGrade!,
            grade_point: calc.gradePoint,
            mark_from: calc.percentage,
            mark_to: calc.percentage,
            remark: `auto-created from GradeScale ${calc.letterGrade}`,
          },
        });
        gradeId = newLegacy.id;
      }
    } else {
      const grade = await tx.gradeSystem.findUnique({
        where: { id: gradeId },
      });
      if (!grade) {
        throw new Error('Grade not found');
      }
      if (!finalLetterGrade) {
        const scale = await gradeService.getActiveGradeScale(payload.institutionId ?? null);
        const calc = gradeService.calculateStudentResult(
          payload.obtained_marks,
          examSchedule.fullMarks,
          scale,
        );
        finalLetterGrade = calc.letterGrade;
      }
    }

    const existingResult = await tx.studentExamResult.findUnique({
      where: {
        student_id_exam_schedule_id: {
          student_id: payload.student_id,
          exam_schedule_id: payload.exam_schedule_id,
        },
      },
    });

    if (existingResult) {
      throw new Error('Result already exists for this student and exam schedule');
    }

    const studentExamResult = await tx.studentExamResult.create({
      data: {
        student_id: payload.student_id,
        exam_schedule_id: payload.exam_schedule_id,
        obtained_marks: payload.obtained_marks,
        grade_id: gradeId!,
        letterGrade: finalLetterGrade ?? undefined,
      },
      include: {
        student: true,
        examSchedule: {
          include: {
            subject: true,
          },
        },
        grade: true,
      },
    });

    return studentExamResult;
  });

  return result;
};

const enrichWithGrade = async (
  results: Array<{
    obtained_marks: number;
    examSchedule: { fullMarks: number } | null;
  }>,
  institutionId?: string | null,
): Promise<Map<number, { letterGrade: string; gradePoint: number; percentage: number; status: "Passed" | "Failed" }>> => {
  let scale: Awaited<ReturnType<typeof gradeService.getActiveGradeScale>> | null = null;
  try {
    scale = await gradeService.getActiveGradeScale(institutionId ?? null);
  } catch {
    scale = null;
  }
  const map = new Map<number, { letterGrade: string; gradePoint: number; percentage: number; status: "Passed" | "Failed" }>();
  results.forEach((r, idx) => {
    const full = r.examSchedule?.fullMarks ?? 0;
    const obtain = Number(r.obtained_marks);
    if (!scale || full <= 0 || !Number.isFinite(obtain) || obtain < 0) return;
    try {
      const calc = gradeService.calculateStudentResult(obtain, full, scale);
      map.set(idx, { letterGrade: calc.letterGrade, gradePoint: calc.gradePoint, percentage: calc.percentage, status: calc.status });
    } catch {
      // gaps in scale — leave blank, controller will still return raw result
    }
  });
  return map;
};

const getAllStudentExamResultsFromDB = async (query: Record<string, unknown> & QueryParams = {} as never) => {
  const { where: baseWhere, orderBy, skip, take } = buildPrismaQuery(query as QueryParams);
  // Frontend sends `?exam_schedule_id=xxx` (and sometimes `student_id`) as direct query params,
  // but buildPrismaQuery only parses `filter` JSON. Merge direct params into where so the
  // exam filter is actually applied — otherwise the DB returns unfiltered (stale) results
  // and the table shows previous exam's marks for the same studentId.
  const where: Record<string, unknown> = { ...(baseWhere as Record<string, unknown>) };
  const q = query as Record<string, unknown>;
  const examScheduleId = (q.exam_schedule_id as string) ?? (q.examScheduleId as string) ?? (q.exam_scheduleId as string);
  if (examScheduleId) where.exam_schedule_id = String(examScheduleId);
  if (q.student_id) where.student_id = String(q.student_id);
  if (q.studentId) where.student_id = String(q.studentId);
  // also support filter JSON containing these keys (defense-in-depth)
  const rawFilter = (q.filter as string) ?? "";
  if (typeof rawFilter === "string" && rawFilter) {
    try {
      const parsed = JSON.parse(rawFilter);
      if (parsed.exam_schedule_id) where.exam_schedule_id = String(parsed.exam_schedule_id);
      if (parsed.student_id) where.student_id = String(parsed.student_id);
    } catch {}
  }

  const results = await prisma.studentExamResult.findMany({
    where: where as never,
    skip,
    take,
    orderBy,
    include: {
      student: true,
      examSchedule: {
        include: {
          subject: true,
          program: true,
          department: true,
          examConfig: true,
        },
      },
      grade: true,
    },
  });

  const enriched = await enrichWithGrade(results);
  return results.map((r, idx) => {
    const e = enriched.get(idx);
    const storedLetter = (r as any).letterGrade as string | null;
    const letterGrade = storedLetter ?? e?.letterGrade ?? r.grade?.grade_name ?? null;
    const status = e?.status ?? (letterGrade ? gradeService.getResultStatus(letterGrade) : r.grade?.grade_name ? gradeService.getResultStatus(r.grade.grade_name) : null);
    return {
      ...r,
      percentage: e?.percentage ?? null,
      letterGrade,
      gradePoint: e?.gradePoint ?? r.grade?.grade_point ?? null,
      status,
      computed: e
        ? {
            obtainMarks: Number(r.obtained_marks),
            totalMarks: r.examSchedule?.fullMarks ?? 0,
            percentage: e.percentage,
            letterGrade,
            gradePoint: e.gradePoint,
            status: e.status,
          }
        : null,
    };
  });
};

const getStudentExamResultByIdFromDB = async (id: string) => {
  const result = await prisma.studentExamResult.findUnique({
    where: { id },
    include: {
      student: true,
      examSchedule: {
        include: {
          subject: true,
          program: true,
          department: true,
          examConfig: {
            include: {
              academicClass: true,
              program: true,
              department: true,
            },
          },
        },
      },
      grade: true,
    },
  });

  if (!result) {
    throw new Error('Student exam result not found');
  }

  const enriched = await enrichWithGrade([result]);
  const e = enriched.get(0);
  const storedLetter = (result as any).letterGrade as string | null;
  const letterGrade = storedLetter ?? e?.letterGrade ?? result.grade?.grade_name ?? null;
  const status = e?.status ?? (letterGrade ? gradeService.getResultStatus(letterGrade) : result.grade?.grade_name ? gradeService.getResultStatus(result.grade.grade_name) : null);
  return {
    ...result,
    percentage: e?.percentage ?? null,
    letterGrade,
    gradePoint: e?.gradePoint ?? result.grade?.grade_point ?? null,
    status,
    computed: e
      ? {
          obtainMarks: Number(result.obtained_marks),
          totalMarks: result.examSchedule?.fullMarks ?? 0,
          percentage: e.percentage,
          letterGrade,
          gradePoint: e.gradePoint,
          status: e.status,
        }
      : null,
  };
};

const updateStudentExamResultInDB = async (id: string, payload: IStudentExamResultUpdate) => {
  const existingResult = await prisma.studentExamResult.findUnique({
    where: { id },
    include: {
      examSchedule: true,
    },
  });

  if (!existingResult) {
    throw new Error('Student exam result not found');
  }

  const newObtainMarks = payload.obtained_marks ?? existingResult.obtained_marks;

  if (payload.obtained_marks !== undefined && payload.obtained_marks > existingResult.examSchedule.fullMarks) {
    throw new Error('Obtained marks cannot exceed full marks');
  }

  let gradeIdToSet: string | undefined = payload.grade_id;
  let finalLetterGrade: string | null | undefined = (payload as any).letterGrade ?? (payload as any).grade ?? undefined;

  if ((payload.obtained_marks !== undefined && !payload.grade_id && finalLetterGrade == null) || (payload.obtained_marks !== undefined && finalLetterGrade == null)) {
    // Recalculate grade from percentage when marks change and no explicit grade/letterGrade given.
    const scale = await gradeService.getActiveGradeScale((payload as unknown as { institutionId?: string }).institutionId ?? null);
    const calc = gradeService.calculateStudentResult(
      newObtainMarks,
      existingResult.examSchedule.fullMarks,
      scale,
    );
    finalLetterGrade = calc.letterGrade;
    const legacyGrade = await prisma.gradeSystem.findFirst({
      where: { grade_name: calc.letterGrade },
    });
    if (legacyGrade) {
      gradeIdToSet = legacyGrade.id;
    } else {
      const newLegacy = await prisma.gradeSystem.create({
        data: {
          grade_name: calc.letterGrade,
          grade_point: calc.gradePoint,
          mark_from: calc.percentage,
          mark_to: calc.percentage,
          remark: `auto-created from GradeScale ${calc.letterGrade}`,
        },
      });
      gradeIdToSet = newLegacy.id;
    }
  } else if (finalLetterGrade) {
    // Client provided letterGrade (real-time calc) — ensure grade_id matches
    const legacyGrade = await prisma.gradeSystem.findFirst({
      where: { grade_name: finalLetterGrade },
    });
    if (legacyGrade) {
      gradeIdToSet = legacyGrade.id;
    } else {
      // auto-create legacy if needed for FK
      const scale = await gradeService.getActiveGradeScale((payload as unknown as { institutionId?: string }).institutionId ?? null);
      const calc = gradeService.calculateStudentResult(
        newObtainMarks,
        existingResult.examSchedule.fullMarks,
        scale,
      );
      const fallback = await prisma.gradeSystem.findFirst({ where: { grade_name: calc.letterGrade } });
      if (fallback) gradeIdToSet = fallback.id;
      else {
        const newLegacy = await prisma.gradeSystem.create({
          data: {
            grade_name: finalLetterGrade,
            grade_point: calc.gradePoint,
            mark_from: calc.percentage,
            mark_to: calc.percentage,
            remark: `auto-created from GradeScale ${finalLetterGrade}`,
          },
        });
        gradeIdToSet = newLegacy.id;
      }
    }
  } else if (payload.grade_id) {
    const grade = await prisma.gradeSystem.findUnique({
      where: { id: payload.grade_id },
    });
    if (!grade) {
      throw new Error('Grade not found');
    }
  }

  const updatedResult = await prisma.studentExamResult.update({
    where: { id },
    data: {
      obtained_marks: payload.obtained_marks,
      grade_id: gradeIdToSet,
      letterGrade: finalLetterGrade ?? undefined,
    },
    include: {
      student: true,
      examSchedule: {
        include: {
          subject: true,
        },
      },
      grade: true,
    },
  });

  return updatedResult;
};

const deleteStudentExamResultFromDB = async (id: string) => {
  const existingResult = await prisma.studentExamResult.findUnique({
    where: { id },
  });

  if (!existingResult) {
    throw new Error('Student exam result not found');
  }

  await prisma.studentExamResult.delete({
    where: { id },
  });

  return existingResult;
};

export const studentExamResultService = {
  createStudentExamResultIntoDB,
  getAllStudentExamResultsFromDB,
  getStudentExamResultByIdFromDB,
  updateStudentExamResultInDB,
  deleteStudentExamResultFromDB,
};
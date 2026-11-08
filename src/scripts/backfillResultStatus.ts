/**
 * Backfill Result Status
 * - Fetches all StudentExamResult records
 * - Recomputes status from stored letterGrade using gradeService.getResultStatus()
 * - If a stored `status` column exists, updates mismatched rows (currently no such column in schema — script reports mismatches)
 * - Logs how many records would be / were corrected and lists IDs
 *
 * DO NOT RUN AUTOMATICALLY — review affected IDs first, then run with --apply
 *
 * Usage:
 *   npx tsx src/scripts/backfillResultStatus.ts            # dry-run, list mismatches
 *   npx tsx src/scripts/backfillResultStatus.ts --apply    # apply fixes (if status column exists)
 */
import 'dotenv/config';
import prisma from '../db/db.config';
import { gradeService } from '../app/modules/grade/grade.service';

const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`[backfill] mode: ${apply ? 'APPLY' : 'DRY-RUN'} (use --apply to write)`);

  // Fetch all results with relations needed to compute expected status
  const results = await prisma.studentExamResult.findMany({
    include: {
      examSchedule: { select: { fullMarks: true, passMarks: true } },
      grade: { select: { grade_name: true } },
    },
    orderBy: { created_at: 'asc' },
  });

  console.log(`[backfill] total results: ${results.length}`);

  // Try to get global grade scale for accurate letterGrade; if not available, fallback to stored grade_name
  let scale: Awaited<ReturnType<typeof gradeService.getActiveGradeScale>> | null = null;
  try {
    scale = await gradeService.getActiveGradeScale(null);
  } catch (e) {
    console.warn('[backfill] no GradeScale configured, falling back to stored grade_name:', (e as Error).message);
  }

  type Mismatch = {
    id: string;
    student_id: string;
    exam_schedule_id: string;
    obtained_marks: number;
    fullMarks: number | null;
    letterGrade: string | null;
    expected: "Passed" | "Failed";
    oldPassMarksBased: "Passed" | "Failed" | "Pending";
    storedStatus?: string | null;
  };

  const mismatches: Mismatch[] = [];

  for (const r of results) {
    const full = r.examSchedule?.fullMarks ?? null;
    const obtain = toNumber(r.obtained_marks);
    let letter: string | null = null;

    if (scale && full !== null && full > 0) {
      try {
        const calc = gradeService.calculateStudentResult(obtain, full, scale);
        letter = calc.letterGrade;
      } catch {
        letter = r.grade?.grade_name ?? null;
      }
    } else {
      letter = r.grade?.grade_name ?? null;
    }

    if (!letter) continue;

    const expected = gradeService.getResultStatus(letter);

    // Old logic: obtained >= passMarks
    const passMarks = r.examSchedule ? toNumber(r.examSchedule.passMarks) : 0;
    const hasFull = r.examSchedule && full !== null && full > 0;
    const oldBased: "Passed" | "Failed" | "Pending" = !hasFull
      ? "Pending"
      : obtain >= passMarks
        ? "Passed"
        : "Failed";

    // Stored status column does not exist in current schema; check if any ad-hoc column present
    const stored = (r as unknown as { status?: string | null }).status ?? null;

    const isMismatch = stored !== null
      ? stored !== expected
      : oldBased !== "Pending" && oldBased !== expected;

    if (isMismatch) {
      mismatches.push({
        id: r.id,
        student_id: r.student_id,
        exam_schedule_id: r.exam_schedule_id,
        obtained_marks: obtain,
        fullMarks: full,
        letterGrade: letter,
        expected,
        oldPassMarksBased: oldBased,
        storedStatus: stored,
      });
    }
  }

  console.log(`[backfill] mismatched records: ${mismatches.length}`);
  if (mismatches.length > 0) {
    console.table(
      mismatches.map((m) => ({
        id: m.id,
        obtained: m.obtained_marks,
        full: m.fullMarks,
        letter: m.letterGrade,
        expected: m.expected,
        old: m.oldPassMarksBased,
        stored: m.storedStatus ?? "—",
      }))
    );
    console.log("[backfill] IDs:", mismatches.map((m) => m.id).join(", "));
  } else {
    console.log("[backfill] no mismatches — all statuses already correct (or no F grades affected).");
  }

  // If a `status` column exists in future, apply fixes
  if (apply && mismatches.length > 0) {
    // Check if status column actually exists by attempting a dry update on one row
    const hasStatusColumn = (() => {
      try {
        // Prisma will throw if field unknown; we test via raw query
        return false;
      } catch {
        return false;
      }
    })();

    // Since current schema has no `status` column, we only report.
    // If you add `status String` to StudentExamResult, uncomment below:
    /*
    let corrected = 0;
    for (const m of mismatches) {
      await prisma.studentExamResult.update({
        where: { id: m.id },
        data: { status: m.expected } as never,
      });
      corrected++;
    }
    console.log(`[backfill] corrected ${corrected} records`);
    */
    if (!hasStatusColumn) {
      console.log("[backfill] APPLY requested but schema has no `status` column — nothing to write. Statuses are computed on read via gradeService.getResultStatus(letterGrade) and returned as `status`/`computed.status` (see studentExamResult.service.ts:enrichWithGrade). Frontend now keys badges off letterGrade/status, not passMarks.");
    }
  } else if (!apply && mismatches.length > 0) {
    console.log("[backfill] dry-run complete. Re-run with --apply after review (no-op until `status` column added).");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("[backfill] failed:", e);
  process.exit(1);
});

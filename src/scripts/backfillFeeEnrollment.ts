/**
 * Backfill `StudentFeeCollectionItem.student_enrollment_id`
 *
 * Phase 2 of FEE_ENROLLMENT_REFACTOR_PLAN.md.
 *
 * For every `StudentFeeCollectionItem` whose `student_enrollment_id` is NULL,
 * resolve the enrollment as the MOST RECENT enrollment
 * (`created_at` DESC, tie-break `id` DESC) of the item's student whose
 * `created_at <= item.created_at` (via the item's collection).
 *
 * - Idempotent: only NULL rows are touched; a resolved value is NEVER overwritten.
 * - Rows with no enrollment dated on/before the payment are left NULL (legacy
 *   fallback rule — those rows are still bucketable via Phase 4/5 logic).
 *
 * Usage:
 *   npx tsx src/scripts/backfillFeeEnrollment.ts            # dry-run (default)
 *   npx tsx src/scripts/backfillFeeEnrollment.ts --apply    # write to DB
 */
import 'dotenv/config';
import prisma from '../db/db.config';

type EnrollmentRow = {
  id: string;
  student_id: string;
  enrollment_type: string;
  created_at: Date;
};

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(
    `[backfill-fee-enrollment] mode: ${apply ? 'APPLY' : 'DRY-RUN'} (use --apply to write)`
  );

  const items = await prisma.studentFeeCollectionItem.findMany({
    select: {
      id: true,
      created_at: true,
      student_enrollment_id: true,
      studentFeeCollection: { select: { student_id: true } },
    },
    orderBy: { created_at: 'asc' },
  });

  const enrollments = await prisma.studentEnrollment.findMany({
    select: {
      id: true,
      student_id: true,
      enrollment_type: true,
      created_at: true,
    },
  });

  const byStudent = new Map<string, EnrollmentRow[]>();
  for (const e of enrollments) {
    const list = byStudent.get(e.student_id);
    if (list) list.push(e);
    else byStudent.set(e.student_id, [e]);
  }
  for (const list of byStudent.values()) {
    list.sort((a, b) => {
      const t = a.created_at.getTime() - b.created_at.getTime();
      if (t !== 0) return t;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
  }

  const resolve = (studentId: string, itemAt: Date): EnrollmentRow | null => {
    const list = byStudent.get(studentId);
    if (!list || list.length === 0) return null;
    const at = itemAt.getTime();
    let lo = 0;
    let hi = list.length - 1;
    let hit: EnrollmentRow | null = null;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      const e = list[mid];
      if (e.created_at.getTime() <= at) {
        hit = e;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return hit;
  };

  const pending: Array<{
    itemId: string;
    studentId: string;
    itemAt: Date;
    targetId: string | null;
  }> = [];
  let already = 0;
  let unresolved = 0;

  for (const item of items) {
    if (item.student_enrollment_id) {
      already++;
      continue;
    }
    const studentId = item.studentFeeCollection?.student_id;
    const target = studentId ? resolve(studentId, item.created_at) : null;
    if (target) {
      pending.push({ itemId: item.id, studentId, itemAt: item.created_at, targetId: target.id });
    } else {
      unresolved++;
    }
  }

  console.log(`[backfill-fee-enrollment] items total: ${items.length}`);
  console.log(`[backfill-fee-enrollment] already populated (untouched): ${already}`);
  console.log(`[backfill-fee-enrollment] resolvable (would be written): ${pending.length}`);
  console.log(`[backfill-fee-enrollment] left NULL (no enrollment <= createdAt): ${unresolved}`);

  if (pending.length > 0) {
    const byType = new Map<string, number>();
    for (const p of pending) {
      const t = byStudent.get(p.studentId)?.find((e) => e.id === p.targetId)?.enrollment_type ?? '?';
      byType.set(t, (byType.get(t) ?? 0) + 1);
    }
    console.log('[backfill-fee-enrollment] resolution by enrollment_type:', Object.fromEntries(byType));

    const samples = pending.slice(0, 10);
    console.log('[backfill-fee-enrollment] sample resolutions:');
    for (const s of samples) {
      console.log(
        `  item=${s.itemId} student=${s.studentId} itemCreatedAt=${s.itemAt.toISOString()} -> enrollment=${s.targetId}`
      );
    }
  }

  if (!apply) {
    console.log(
      '[backfill-fee-enrollment] dry-run complete. Re-run with --apply to write. ' +
        'Idempotency: populated/NULL rows are never touched, so a second run writes 0 rows.'
    );
  }

  if (apply) {
    const sorted = [...pending].sort((a, b) => a.itemId.localeCompare(b.itemId));
    let updated = 0;
    for (const p of sorted) {
      await prisma.studentFeeCollectionItem.update({
        where: { id: p.itemId },
        data: { student_enrollment_id: p.targetId },
      });
      updated++;
    }
    console.log(`[backfill-fee-enrollment] APPLIED: ${updated} rows updated.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('[backfill-fee-enrollment] failed:', e);
  process.exit(1);
});
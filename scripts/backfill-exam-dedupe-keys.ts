/**
 * One-time backfill: computes `dedupe_key` for exam_configs rows created
 * before the duplicate-guard migration. New creates/updates always set it.
 * Safe to re-run (only touches rows with a NULL dedupe_key).
 *
 * Run: npx tsx ./scripts/backfill-exam-dedupe-keys.ts
 */
import prisma from '../src/db/db.config';
import {
  buildExamDedupeKey,
  getExamDayKey,
} from '../src/app/modules/examConfig/examConfig.service';

async function main(): Promise<void> {
  const rows = await prisma.examConfig.findMany({
    where: { dedupe_key: null },
  });
  console.log(`rows missing dedupe_key: ${rows.length}`);
  let updated = 0;
  for (const r of rows) {
    const examDay = getExamDayKey(new Date(r.exam_date).toISOString());
    if (!examDay) {
      console.log(`  skip ${r.id}: unparsable date ${r.exam_date}`);
      continue;
    }
    const key = buildExamDedupeKey({
      exam_name: r.exam_name,
      academic_class_id: r.academic_class_id,
      program_id: r.program_id,
      department_id: r.department_id,
      group: r.group,
      batch_id: r.batch_id,
      sectionId: r.section_id,
      exam_date: new Date(r.exam_date).toISOString(),
      exam_day: examDay,
    });
    await prisma.examConfig.update({
      where: { id: r.id },
      data: { dedupe_key: key },
    });
    updated += 1;
  }
  console.log(`backfilled: ${updated}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Backfill failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

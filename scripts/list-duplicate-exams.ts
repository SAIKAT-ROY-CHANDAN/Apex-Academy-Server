/**
 * Read-only audit for the Manage Exam duplicate rule.
 *
 * Lists groups of exams that count as duplicates (same normalized exam name,
 * program, department, class, group, batch, section and same Dhaka calendar day).
 *
 * NEVER deletes anything. Oldest row in each group (by created_at) is the
 * suggested row to keep.
 *
 * Run: npx tsx ./scripts/list-duplicate-exams.ts
 */
import prisma from '../src/db/db.config';

const normalizeExamName = (raw: string): string =>
  raw.trim().replace(/\s+/g, ' ');

const dhakaDayKey = (d: Date): string =>
  new Date(d.getTime() + 6 * 60 * 60 * 1000).toISOString().slice(0, 10);

type ExamRow = {
  id: string;
  exam_name: string;
  academic_class_id: string;
  program_id: string | null;
  department_id: string | null;
  group: string | null;
  batch_id: string | null;
  section_id: string | null;
  exam_date: Date;
  created_at: Date;
  academicClass: { class_name: string } | null;
  program: { program_name: string } | null;
  department: { department_name: string } | null;
  batch: { batch_name: string } | null;
  section: { section_name: string } | null;
};

async function main(): Promise<void> {
  const collation = await prisma.$queryRaw<
    Array<{ COLUMN_NAME: string; COLLATION_NAME: string | null }>
  >`
    SELECT COLUMN_NAME, COLLATION_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'exam_configs'
      AND COLUMN_NAME IN ('exam_name', 'program_id', 'department_id', 'academic_class_id', 'exam_date')
  `;
  console.log('Column collations (exam_configs):');
  for (const c of collation) {
    console.log(`  ${c.COLUMN_NAME}: ${c.COLLATION_NAME ?? '(non-text)'}`);
  }

  const exams = (await prisma.examConfig.findMany({
    include: {
      academicClass: { select: { class_name: true } },
      program: { select: { program_name: true } },
      department: { select: { department_name: true } },
      batch: { select: { batch_name: true } },
      section: { select: { section_name: true } },
    },
    orderBy: { created_at: 'asc' },
  })) as unknown as ExamRow[];

  console.log(`\nTotal exams: ${exams.length}`);

  const groups = new Map<string, ExamRow[]>();
  for (const e of exams) {
    const key = [
      normalizeExamName(e.exam_name).toLowerCase(),
      e.program_id ?? '',
      e.department_id ?? '',
      e.academic_class_id,
      e.group ?? '',
      e.batch_id ?? '',
      e.section_id ?? '',
      dhakaDayKey(new Date(e.exam_date)),
    ].join('|');
    const list = groups.get(key) ?? [];
    list.push(e);
    groups.set(key, list);
  }

  const dupes = [...groups.values()].filter((g) => g.length > 1);
  const extraRows = dupes.reduce((n, g) => n + (g.length - 1), 0);
  console.log(
    `Duplicate groups: ${dupes.length} (${extraRows} extra row(s) beyond the oldest in each group)\n`,
  );

  dupes.forEach((g, i) => {
    console.log(`Group ${i + 1} — ${g.length} rows (KEEP oldest #1):`);
    g.forEach((e, idx) => {
      console.log(
        `  #${idx + 1}${idx === 0 ? ' [KEEP]' : ''} id=${e.id} created=${new Date(e.created_at).toISOString()}`,
      );
      console.log(
        `      name="${e.exam_name}" class="${e.academicClass?.class_name ?? e.academic_class_id}" program="${e.program?.program_name ?? e.program_id ?? ''}" dept="${e.department?.department_name ?? e.department_id ?? ''}" group="${e.group ?? ''}" batch="${e.batch?.batch_name ?? e.batch_id ?? ''}" section="${e.section?.section_name ?? e.section_id ?? ''}" date=${new Date(e.exam_date).toISOString()}`,
      );
    });
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Audit failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

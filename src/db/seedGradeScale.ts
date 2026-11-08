import 'dotenv/config';
import prisma from './db.config';

const defaultScales = [
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

const seedGradeScales = async () => {
  // validate non-overlapping ranges
  for (let i = 0; i < defaultScales.length; i++) {
    for (let j = i + 1; j < defaultScales.length; j++) {
      const a = defaultScales[i];
      const b = defaultScales[j];
      const overlap = !(a.maxPercent < b.minPercent || b.maxPercent < a.minPercent);
      if (overlap) {
        throw new Error(`Overlapping ranges: ${a.letterGrade} [${a.minPercent}-${a.maxPercent}] vs ${b.letterGrade} [${b.minPercent}-${b.maxPercent}]`);
      }
    }
  }

  const existing = await prisma.gradeScale.findMany();
  if (existing.length > 0) {
    console.log(`GradeScale already has ${existing.length} rows - skipping seed (delete manually to re-seed).`);
    return;
  }

  await prisma.gradeScale.createMany({
    data: defaultScales.map((s) => ({
      minPercent: s.minPercent,
      maxPercent: s.maxPercent,
      letterGrade: s.letterGrade,
      gradePoint: s.gradePoint,
      institutionId: null,
    })),
  });

  console.log(`Seeded ${defaultScales.length} GradeScale rows.`);
};

const run = async () => {
  const command = process.argv[2];
  if (command !== 'seed-grade-scales') {
    console.log('Usage: tsx src/db/seedGradeScale.ts seed-grade-scales');
    return;
  }
  await seedGradeScales();
};

if (require.main === module) {
  run()
    .catch((e) => {
      console.error('Seed failed:', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedGradeScales, defaultScales };

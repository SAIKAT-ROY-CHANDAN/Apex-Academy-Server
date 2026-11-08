//  * REGRESSION CHECK — student class routine after promotion
//  *
//  * Bug: "/student-dashboard/class-routine kept showing the 1st Year routine after
//  * the student was promoted to 2nd Year."
//  *
//  * Root cause (fixed): the student branch of GET /class-routine/my-routine
//  * resolved the student's "current year" by `orderBy: { created_at: 'desc' }`
//  * instead of the `is_primary` flag that the promotion flow actually maintains.
//  * When enrollment rows tie on DATETIME(3) precision (or an older-created row is
//  * inserted/backfilled later), the query silently picked the closed (1st-year)
//  * enrollment and served its routine.
//  *
//  * This script verifies the fix end-to-end against the configured database:
//  *   1. seeds a fixture student in "1st Year" with both a 1st-year and a
//  *      2nd-year routine published for the same batch;
//  *   2. promotes the student through the REAL promotion service;
//  *   3. asserts the routine resolver immediately returns the 2nd-year routine
//  *      (never the 1st-year one) — no re-login / cache clearing needed;
//  *   4. makes it adversarial (bumps the closed enrollment's created_at so the
//  *      old `created_at desc` lookup WOULD pick the 1st-year row) and re-asserts
//  *      the fix still resolves the 2nd-year routine.
//  *
//  * Run:  npm run regression:student-routine   (from eims-server)
//  * Requires a reachable DATABASE_URL (see eims-server/.env).
 
import prisma from '../../src/db/db.config';
import { StudentPromotionService } from '../../src/app/modules/student-promotion/student-promotion.service';
import { classRoutineService } from '../../src/app/modules/classRoutine/classRoutine.service';
import {
  EnrollmentStatus,
  EnrollmentType,
  Gender,
  InstitutionType,
} from '../../generated/prisma/enums';

declare const process: {
  exitCode?: number;
  exit(code: number): never;
};

const fail = (message: string): never => {
  console.error(`✗ FAIL — ${message}`);
  process.exitCode = 1;
  throw new Error(message);
};

const assert = (condition: boolean, message: string) => {
  if (!condition) fail(message);
  console.log(`  ✓ ${message}`);
};

const main = async () => {
  console.log('Regression: student class routine after promotion');
  console.log('──────────────────────────────────────────────────');

  const suffix = Date.now().toString(36);
  let institutionId = '';
  let session1Id = '';
  let session2Id = '';
  let batchId = '';
  let class1Id = '';
  let class2Id = '';
  let studentId = '';
  let routine1Id = '';
  let routine2Id = '';

  try {
    // ── Fixtures ────────────────────────────────────────────────────────────
    const institution = await prisma.institutionConfig.create({
      data: {
        mode: InstitutionType.COLLEGE_UNIVERSITY,
        name: `EIMS Regression Fixture ${suffix}`,
      },
    });
    institutionId = institution.id;

    const session1 = await prisma.academicSession.create({
      data: { institution_id: institutionId, session_name: `Regression Y1 ${suffix}` },
    });
    session1Id = session1.id;

    const session2 = await prisma.academicSession.create({
      data: { institution_id: institutionId, session_name: `Regression Y2 ${suffix}` },
    });
    session2Id = session2.id;

    const batch = await prisma.batch.create({
      data: { batch_name: `Regression Batch ${suffix}` },
    });
    batchId = batch.id;

    const class1 = await prisma.academicClass.create({
      data: { class_name: '1st Year', year_level: 1 },
    });
    class1Id = class1.id;
    const class2 = await prisma.academicClass.create({
      data: { class_name: '2nd Year', year_level: 2 },
    });
    class2Id = class2.id;

    const student = await prisma.student.create({
      data: {
        name: 'Routine Reg Student',
        father_name: 'Routine Reg Father',
        mother_name: 'Routine Reg Mother',
        gender: Gender.MALE,
        student_phone: `017${suffix}`.slice(0, 20),
        father_phone: '01711111111',
        sub_district: 'Regression',
        district: 'Regression',
        password: 'regression',
      },
    });
    studentId = student.id;

    const enrollment1 = await prisma.studentEnrollment.create({
      data: {
        student_id: studentId,
        academic_session_id: session1Id,
        academic_class_id: class1Id,
        batch_id: batchId,
        is_primary: true,
        enrollment_status: EnrollmentStatus.ACTIVE,
        enrollment_type: EnrollmentType.REGULAR,
      },
    });

    const routine1 = await prisma.classRoutine.create({
      data: { academic_class_id: class1Id, batch_id: batchId },
    });
    routine1Id = routine1.id;
    const routine2 = await prisma.classRoutine.create({
      data: { academic_class_id: class2Id, batch_id: batchId },
    });
    routine2Id = routine2.id;

    // ── Step 1: before promotion, student sees the 1st-year routine ────────
    console.log('Step 1 — student before promotion (1st Year):');
    let result = await classRoutineService.getClassRoutineByStudentIdFromDB(
      studentId,
    );
    assert(
      result.currentClass === '1st Year',
      `currentClass is '1st Year' (got '${result.currentClass}')`,
    );
    assert(
      result.routines.some((r) => r.id === routine1Id),
      '1st-year routine is returned',
    );
    assert(
      !result.routines.some((r) => r.id === routine2Id),
      '2nd-year routine is NOT returned yet',
    );

    // ── Step 2: promote through the real promotion service ──────────────────
    console.log('Step 2 — promote 1st Year → 2nd Year:');
    await StudentPromotionService.promoteStudentIntoDB({
      student_id: studentId,
      enrollment_id: enrollment1.id,
      academic_session_id: session2Id,
      academic_class_id: class2Id,
      batch_id: batchId,
      enrollment_status: EnrollmentStatus.ACTIVE,
      enrollment_type: EnrollmentType.REGULAR,
      next_enrollment_type: EnrollmentType.REGULAR,
      next_enrollment_status: EnrollmentStatus.ACTIVE,
    });
    const primaryAfter = await prisma.studentEnrollment.findFirst({
      where: { student_id: studentId, is_primary: true },
    });
    assert(
      primaryAfter?.academic_class_id === class2Id,
      'promotion left a single primary enrollment row for 2nd Year',
    );

    // ── Step 3: resolver must immediately reflect the new year ──────────────
    console.log('Step 3 — routine resolver after promotion (expect 2nd Year):');
    result = await classRoutineService.getClassRoutineByStudentIdFromDB(
      studentId,
    );
    assert(
      result.currentClass === '2nd Year',
      `currentClass switches to '2nd Year' (got '${result.currentClass}')`,
    );
    assert(
      result.routines.some((r) => r.id === routine2Id),
      '2nd-year routine is returned',
    );
    assert(
      !result.routines.some((r) => r.id === routine1Id),
      '1st-year routine is NOT returned after promotion',
    );

    // ── Step 4: adversarial tie-break simulation of the original bug ────────
    // Row-insertion order is not a reliable "current year" signal; the OLD
    // resolver relied on `orderBy: { created_at: 'desc' }` only. Bump the
    // closed 1st-year enrollment to the NEWEST timestamp and prove the fix
    // still resolves by is_primary rather than by created_at.
    console.log('Step 4 — adversarial created_at tie-break simulation:');
    await prisma.studentEnrollment.update({
      where: { id: enrollment1.id },
      data: { created_at: new Date(Date.now() + 60_000) },
    });

    const staleLookup = await prisma.studentEnrollment.findFirst({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' }, // the OLD (buggy) resolution logic
    });
    assert(
      staleLookup?.academic_class_id === class1Id,
      'old created_at-desc lookup would pick the stale 1st-year enrollment',
    );

    result = await classRoutineService.getClassRoutineByStudentIdFromDB(
      studentId,
    );
    assert(
      result.currentClass === '2nd Year',
      'fix still resolves 2nd Year when the closed row is the newest',
    );
    assert(
      result.routines.some((r) => r.id === routine2Id),
      '2nd-year routine returned under adversarial ordering',
    );
    assert(
      !result.routines.some((r) => r.id === routine1Id),
      '1st-year routine not leaked under adversarial ordering',
    );

    console.log('──────────────────────────────────────────────────');
    console.log('PASS — dashboard reflects the promoted year immediately.');
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  } finally {
    // ── Cleanup (best effort, reverse dependency order) ─────────────────────
    await prisma.classRoutine.deleteMany({
      where: { id: { in: [routine1Id, routine2Id].filter(Boolean) } },
    });
    await prisma.studentEnrollment.deleteMany({ where: { student_id: studentId } });
    await prisma.student.deleteMany({ where: { id: studentId } });
    await prisma.academicClass.deleteMany({
      where: { id: { in: [class1Id, class2Id].filter(Boolean) } },
    });
    await prisma.batch.deleteMany({ where: { id: batchId } });
    await prisma.academicSession.deleteMany({
      where: { id: { in: [session1Id, session2Id].filter(Boolean) } },
    });
    await prisma.institutionConfig.deleteMany({ where: { id: institutionId } });
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
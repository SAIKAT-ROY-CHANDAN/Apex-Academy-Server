import { EnrollmentStatus } from '../../../../generated/prisma/enums';
import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IBulkStudentPromotion,
  IStudentPromotion,
} from './student-promotion.type';

const promoteStudentIntoDB = async (payload: IStudentPromotion) => {
  const response = await prisma.$transaction(async (tx) => {
    // 1. Verify the enrollment belongs to the student and is the current one
    const currentEnrollment = await tx.studentEnrollment.findFirst({
      where: {
        id: payload.enrollment_id,
        student_id: payload.student_id,
      },
      include: {
        academicClass: {
          select: { id: true, class_name: true, year_level: true },
        },
      },
    });

    if (!currentEnrollment) {
      throw new Error('Student enrollment not found');
    }

    if (!currentEnrollment.is_primary) {
      throw new Error(
        'Only the current (primary) enrollment can be promoted or repeated',
      );
    }

    // 2. Validate target class is different from current class — except REPEATED stays in same class
    if (
      currentEnrollment.academic_class_id === payload.academic_class_id &&
      payload.enrollment_status !== EnrollmentStatus.REPEATED
    ) {
      throw new AppError(
        400,
        `Cannot promote to the same class (${currentEnrollment.academicClass?.class_name ?? 'current class'}). Select a different target class.`,
      );
    }

    // 3. Close the old enrollment
    //    is_primary is always forced to false server-side (never from client)
    const failCount = payload.subject_fail_count ?? 0;
    const closedEnrollment = await tx.studentEnrollment.update({
      where: { id: currentEnrollment.id },
      data: {
        is_primary: false,
        enrollment_status: payload.enrollment_status,
        enrollment_type: payload.enrollment_type,
        subject_fail_count: failCount,
      },
    });

    // 4. Create the new enrollment
    //    is_primary is always forced to true, status always ACTIVE
    //    subject_fail_count is 0 on new enrollment (fails stay on closed enrollment)
    const newEnrollment = await tx.studentEnrollment.create({
      data: {
        student_id: payload.student_id,
        academic_session_id: payload.academic_session_id,
        academic_class_id: payload.academic_class_id,
        academic_section_id:
          payload.academic_section_id ?? currentEnrollment.academic_section_id,
        batch_id: payload.batch_id,
        shift_id: payload.shift_id ?? currentEnrollment.shift_id,
        roll_number:
          payload.roll_number ?? currentEnrollment.roll_number ?? null,
        registration_number:
          payload.registration_number ??
          currentEnrollment.registration_number ??
          null,
        enrollment_status:
          payload.next_enrollment_status ?? EnrollmentStatus.ACTIVE,
        enrollment_type: payload.next_enrollment_type,
        subject_fail_count: 0,
        is_primary: true,
      },
    });

    // 5. Safety net: ensure no other enrollment for this student has is_primary = true
    //    (defensive check in case of race conditions or data corruption)
    const otherPrimaryEnrollments = await tx.studentEnrollment.findMany({
      where: {
        student_id: payload.student_id,
        is_primary: true,
        id: { not: newEnrollment.id },
      },
    });

    if (otherPrimaryEnrollments.length > 0) {
      // Fix any stale primary flags
      await tx.studentEnrollment.updateMany({
        where: {
          student_id: payload.student_id,
          is_primary: true,
          id: { not: newEnrollment.id },
        },
        data: { is_primary: false },
      });
    }

    return {
      closedEnrollment,
      newEnrollment,
    };
  });

  return response;
};

// Bulk promotion: same target class/session/batch for many enrollments at once.
// No roll / registration numbers — new rows keep each student's current
// section/shift unless explicitly overridden, with roll/registration left null.
const promoteManyStudentsIntoDB = async (payload: IBulkStudentPromotion) => {
  const uniqueIds = [...new Set(payload.enrollment_ids)];

  const currentEnrollments = await prisma.studentEnrollment.findMany({
    where: { id: { in: uniqueIds } },
    include: {
      academicClass: {
        select: { id: true, class_name: true },
      },
    },
  });

  if (currentEnrollments.length !== uniqueIds.length) {
    throw new AppError(404, 'One or more student enrollments were not found');
  }

  const notPrimary = currentEnrollments.filter((e) => !e.is_primary);
  if (notPrimary.length > 0) {
    throw new AppError(
      400,
      `${notPrimary.length} selected student(s) are already promoted. Refresh the list and try again.`,
    );
  }

  // Validate no student is being promoted to the same class — except REPEATED may stay in same class
  if (payload.enrollment_status !== EnrollmentStatus.REPEATED) {
    const sameClass = currentEnrollments.filter(
      (e) => e.academic_class_id === payload.academic_class_id,
    );
    if (sameClass.length > 0) {
      const names = sameClass.map((e) => e.academicClass?.class_name ?? 'Unknown');
      throw new AppError(
        400,
        `Cannot promote ${sameClass.length} student(s) to the same class they are currently in (${names[0]}${names.length > 1 ? ` and ${names.length - 1} others` : ''}). Select a different target class.`,
      );
    }
  }

  const response = await prisma.$transaction(async (tx) => {
    const newEnrollments = [];

    for (const current of currentEnrollments) {
      const closedEnrollment = await tx.studentEnrollment.update({
        where: { id: current.id },
        data: {
          is_primary: false,
          enrollment_status: payload.enrollment_status,
          enrollment_type: payload.enrollment_type as any ?? current.enrollment_type,
          ...(payload as any).subject_fail_count !== undefined
            ? { subject_fail_count: (payload as any).subject_fail_count ?? 0 }
            : {},
        },
      });

      const created = await tx.studentEnrollment.create({
        data: {
          student_id: current.student_id,
          academic_session_id: payload.academic_session_id,
          academic_class_id: payload.academic_class_id,
          academic_section_id:
            payload.academic_section_id ?? current.academic_section_id,
          batch_id: payload.batch_id,
          shift_id: payload.shift_id ?? current.shift_id,
          roll_number: current.roll_number ?? null,
          registration_number: current.registration_number ?? null,
          enrollment_status:
            payload.next_enrollment_status ?? EnrollmentStatus.ACTIVE,
          enrollment_type: payload.next_enrollment_type,
          subject_fail_count: 0,
          is_primary: true,
        },
      });

      newEnrollments.push({ closedEnrollment, newEnrollment: created });
    }

    return newEnrollments;
  });

  return {
    promoted_count: response.length,
    results: response,
  };
};

export const StudentPromotionService = {
  promoteStudentIntoDB,
  promoteManyStudentsIntoDB,
};

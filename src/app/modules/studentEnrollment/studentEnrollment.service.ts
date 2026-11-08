import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IStudentEnrollmentCreate,
  IStudentEnrollmentUpdate,
} from './studentEnrollment.type';

/**
 * Returns ALL enrollments (current + previous years) for the logged-in student.
 * Used by the student class-routine year-filter dropdown.
 */
const getMyEnrollmentsFromDB = async (studentId: string) => {
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { student_id: studentId },
    orderBy: { created_at: 'desc' },
    include: {
      academicClass: {
        select: {
          id: true,
          class_name: true,
        },
      },
    },
  });

  return enrollments.map((e) => ({
    academic_class_id: e.academic_class_id,
    // Fallback: if academicClass join failed (orphaned FK), try to fetch class_name directly
    class_name: e.academicClass?.class_name ?? null,
    is_primary: e.is_primary,
    // Include raw IDs for debugging — remove after验证
    _debug: {
      enrollment_id: e.id,
      academic_class_id: e.academic_class_id,
      has_academic_class: !!e.academicClass,
    },
  }));
};

const createStudentEnrollmentIntoDB = async (
  payload: IStudentEnrollmentCreate,
) => {
  // Supplementary attempts are the only case allowed to coexist in same session/class
  const isSupplementaryAttempt =
    (payload as any).enrollment_type === 'SUPPLEMENTARY' &&
    (payload as any).enrollment_status === 'WITH_BACKLOG' &&
    (payload as any).is_primary === false;

  if (!isSupplementaryAttempt) {
    const existingEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        student_id: payload.student_id,
        academic_session_id: payload.academic_session_id,
      },
    });
    if (existingEnrollment) {
      throw new Error(
        'This student is already enrolled in this academic session',
      );
    }
  }

  const {
    promotion_status,
    enrollment_status,
    enrollment_type,
    ...rest
  } = payload as any;

  const data: any = { ...rest };
  if (promotion_status && !enrollment_status) {
    data.enrollment_status = promotion_status;
  } else if (enrollment_status) {
    data.enrollment_status = enrollment_status;
  }
  if (enrollment_type) data.enrollment_type = enrollment_type;

  const newStudentEnrollment = await prisma.studentEnrollment.create({
    data,
  });

  return newStudentEnrollment;
};

const getAllStudentEnrollmentsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['registration_number', 'roll_number'],
  });

  const [totalItems, studentEnrollments] = await prisma.$transaction([
    prisma.studentEnrollment.count({ where }),
    prisma.studentEnrollment.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        student: true,
        academicSession: true,
        academicClass: {
          include: {
            program: true,
            department: true,
          },
        },
        academicSection: true,
        batch: true,
        shift: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: studentEnrollments,
  };
};

const getStudentEnrollmentByIdFromDB = async (studentEnrollmentId: string) => {
  const existingStudentEnrollment = await prisma.studentEnrollment.findUnique({
    where: {
      id: studentEnrollmentId,
    },
    include: {
      student: true,
      academicSession: true,
      academicClass: true,
      academicSection: true,
      batch: true,
      shift: true,
    },
  });

  if (!existingStudentEnrollment) {
    throw new Error('Student enrollment not found');
  }

  return existingStudentEnrollment;
};

const updateStudentEnrollmentFromDB = async (
  studentEnrollmentId: string,
  payload: IStudentEnrollmentUpdate,
) => {
  const existingStudentEnrollment = await prisma.studentEnrollment.findUnique({
    where: {
      id: studentEnrollmentId,
    },
  });

  if (!existingStudentEnrollment) {
    throw new Error('Student enrollment not found');
  }

  const {
    promotion_status: updPromotionStatus,
    enrollment_status: updEnrollmentStatus,
    enrollment_type: updEnrollmentType,
    ...updRest
  } = payload as any;
  const updateData: any = { ...updRest };
  if (updPromotionStatus && !updEnrollmentStatus) {
    updateData.enrollment_status = updPromotionStatus;
  } else if (updEnrollmentStatus) {
    updateData.enrollment_status = updEnrollmentStatus;
  }
  if (updEnrollmentType) updateData.enrollment_type = updEnrollmentType;

  // --- DB-aware final-state validation ---
  // Merge existing DB values with incoming payload to validate the FINAL state (partial update)
  const finalEnrollmentType =
    (updateData.enrollment_type as string | undefined) ??
    (existingStudentEnrollment.enrollment_type as string | undefined);
  const finalEnrollmentStatus =
    (updateData.enrollment_status as string | undefined) ??
    (existingStudentEnrollment.enrollment_status as string | undefined);
  const finalIsPrimary =
    (updateData.is_primary as boolean | undefined) ??
    (existingStudentEnrollment.is_primary as boolean | undefined);
  const finalSubjectFailCount =
    (updateData.subject_fail_count as number | undefined) ??
    (existingStudentEnrollment.subject_fail_count as number | undefined);

  const isSuppFinal = finalEnrollmentType === 'SUPPLEMENTARY';
  const isBacklogFinal = finalEnrollmentStatus === 'WITH_BACKLOG';

  if (isSuppFinal || isBacklogFinal) {
    if (finalEnrollmentType !== 'SUPPLEMENTARY') {
      throw new Error('SUPPLEMENTARY type required for backlog enrollment');
    }
    if (finalEnrollmentStatus !== 'WITH_BACKLOG') {
      throw new Error('WITH_BACKLOG status required for supplementary enrollment');
    }
    if (finalIsPrimary !== false) {
      throw new Error('Supplementary enrollment must be is_primary=false');
    }
    if ((finalSubjectFailCount ?? 0) < 1) {
      throw new Error('subject_fail_count >=1 required for supplementary backlog');
    }
  }
  if (isSuppFinal && finalIsPrimary === true) {
    throw new Error('SUPPLEMENTARY cannot be primary');
  }

  const updatedStudentEnrollment = await prisma.studentEnrollment.update({
    where: {
      id: studentEnrollmentId,
    },
    data: updateData,
  });

  return updatedStudentEnrollment;
};

const deleteStudentEnrollmentFromDB = async (studentEnrollmentId: string) => {
  const existingStudentEnrollment = await prisma.studentEnrollment.findUnique({
    where: {
      id: studentEnrollmentId,
    },
  });

  if (!existingStudentEnrollment) {
    throw new Error('Student enrollment not found');
  }

  await prisma.studentEnrollment.delete({
    where: {
      id: studentEnrollmentId,
    },
  });
};

const createSupplementaryAttemptIntoDB = async (payload: {
  student_id: string;
  previous_enrollment_id: string;
  subject_fail_count: number;
}) => {
  const previous = await prisma.studentEnrollment.findUnique({
    where: { id: payload.previous_enrollment_id },
  });
  if (!previous) throw new Error('Previous enrollment not found');
  if (previous.student_id !== payload.student_id) throw new Error('Previous enrollment does not belong to student');
  if (previous.enrollment_type !== 'SUPPLEMENTARY' || previous.enrollment_status !== 'WITH_BACKLOG') {
    throw new Error('Previous enrollment must be SUPPLEMENTARY WITH_BACKLOG');
  }
  // Create new supplementary enrollment cloning academic placement from previous, is_primary false
  const newEnrollment = await prisma.studentEnrollment.create({
    data: {
      student_id: payload.student_id,
      academic_session_id: previous.academic_session_id,
      academic_class_id: previous.academic_class_id,
      academic_section_id: previous.academic_section_id,
      batch_id: previous.batch_id,
      shift_id: previous.shift_id,
      enrollment_status: 'WITH_BACKLOG' as any,
      enrollment_type: 'SUPPLEMENTARY' as any,
      is_primary: false,
      subject_fail_count: payload.subject_fail_count,
    },
  });
  return newEnrollment;
};

export const StudentEnrollmentService = {
  createStudentEnrollmentIntoDB,
  createSupplementaryAttemptIntoDB,
  getAllStudentEnrollmentsFromDB,
  getStudentEnrollmentByIdFromDB,
  updateStudentEnrollmentFromDB,
  deleteStudentEnrollmentFromDB,
  getMyEnrollmentsFromDB,
};

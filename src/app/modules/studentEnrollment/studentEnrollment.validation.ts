import z from 'zod';
import { EnrollmentStatus, EnrollmentType } from '../../../../generated/prisma/enums';

const createStudentEnrollmentValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    academic_session_id: z
      .string()
      .uuid({ message: 'Invalid academic session ID' }),
    academic_class_id: z
      .string()
      .uuid({ message: 'Invalid academic class ID' }),
    academic_section_id: z
      .string()
      .uuid({ message: 'Invalid academic section ID' })
      .optional(),
    batch_id: z.string().uuid({ message: 'Invalid batch ID' }),
    shift_id: z.string().uuid({ message: 'Invalid shift ID' }).optional(),
    roll_number: z.string().max(20).optional(),
    registration_number: z
      .string()
      .min(1, { message: 'Registration number is required' })
      .max(20),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .optional(),
    merit_position: z.number().int().optional(),
    enrollment_status: z
      .nativeEnum(EnrollmentStatus, { message: 'Invalid enrollment status' })
      .optional(),
    enrollment_type: z
      .nativeEnum(EnrollmentType, { message: 'Invalid enrollment type' })
      .optional(),
    promotion_status: z
      .nativeEnum(EnrollmentStatus, { message: 'Invalid promotion status' })
      .optional(),
    is_primary: z.boolean().optional(),
    subject_fail_count: z.coerce.number().int().min(0).max(100).optional(),
  }).superRefine((data, ctx) => {
    const isSupp = data.enrollment_type === EnrollmentType.SUPPLEMENTARY;
    const isBacklog = data.enrollment_status === EnrollmentStatus.WITH_BACKLOG;
    if (isSupp || isBacklog) {
      if (data.enrollment_type !== EnrollmentType.SUPPLEMENTARY) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'SUPPLEMENTARY type required for backlog enrollment' });
      }
      if (data.enrollment_status !== EnrollmentStatus.WITH_BACKLOG) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_status'], message: 'WITH_BACKLOG status required for supplementary enrollment' });
      }
      if (data.is_primary !== false) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['is_primary'], message: 'Supplementary enrollment must be is_primary=false' });
      }
      if ((data.subject_fail_count ?? 0) < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['subject_fail_count'], message: 'subject_fail_count >=1 required for supplementary backlog' });
      }
    }
    if (isSupp && data.is_primary === true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['is_primary'], message: 'SUPPLEMENTARY cannot be primary' });
    }
  }),
});

const updateStudentEnrollmentValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }).optional(),
    academic_session_id: z
      .string()
      .uuid({ message: 'Invalid academic session ID' })
      .optional(),
    academic_class_id: z
      .string()
      .uuid({ message: 'Invalid academic class ID' })
      .optional(),
    academic_section_id: z
      .string()
      .uuid({ message: 'Invalid academic section ID' })
      .optional(),
    batch_id: z.string().uuid({ message: 'Invalid batch ID' }).optional(),
    shift_id: z.string().uuid({ message: 'Invalid shift ID' }).optional(),
    roll_number: z.string().max(20).optional(),
    registration_number: z
      .string()
      .min(1, { message: 'Registration number is required' })
      .max(20)
      .optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .optional(),
    merit_position: z.number().int().optional(),
    enrollment_status: z
      .nativeEnum(EnrollmentStatus, { message: 'Invalid enrollment status' })
      .optional(),
    enrollment_type: z
      .nativeEnum(EnrollmentType, { message: 'Invalid enrollment type' })
      .optional(),
    promotion_status: z
      .nativeEnum(EnrollmentStatus, { message: 'Invalid promotion status' })
      .optional(),
    is_primary: z.boolean().optional(),
    subject_fail_count: z.coerce.number().int().min(0).max(100).optional(),
  }).superRefine((data, ctx) => {
    const isSuppType = data.enrollment_type === EnrollmentType.SUPPLEMENTARY;
    const isBacklog = data.enrollment_status === EnrollmentStatus.WITH_BACKLOG;
    if (isSuppType && data.enrollment_status !== undefined && data.enrollment_status !== EnrollmentStatus.WITH_BACKLOG) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_status'], message: 'SUPPLEMENTARY requires WITH_BACKLOG' });
    }
    if (isBacklog && data.enrollment_type !== undefined && data.enrollment_type !== EnrollmentType.SUPPLEMENTARY) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'WITH_BACKLOG requires SUPPLEMENTARY' });
    }
    if ((isSuppType || isBacklog) && data.is_primary === true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['is_primary'], message: 'SUPPLEMENTARY cannot be primary' });
    }
    if ((isSuppType || isBacklog) && data.subject_fail_count !== undefined && data.subject_fail_count < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['subject_fail_count'], message: 'subject_fail_count >=1 required for supplementary backlog' });
    }
  }),
});

const studentPromotionValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    from_academic_class_id: z
      .string()
      .uuid({ message: 'Invalid from academic class ID' }),
    to_academic_class_id: z
      .string()
      .uuid({ message: 'Invalid to academic class ID' }),
    promotion_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid promotion date',
    }),
    promoted_by: z.string().optional(),
    academic_section_id: z
      .string()
      .uuid({ message: 'Invalid section ID' })
      .optional(),
    academic_session_id: z
      .string()
      .uuid({ message: 'Invalid session ID' })
      .optional(),
    batch_id: z.string().uuid({ message: 'Invalid batch ID' }).optional(),
    shift_id: z.string().uuid({ message: 'Invalid shift ID' }).optional(),
    roll_number: z.string().max(20).optional(),
    registration_number: z.string().max(20).optional(),
    remarks: z.string().max(255).optional(),
  }),
});

const createSupplementaryAttemptValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    previous_enrollment_id: z.string().uuid({ message: 'Invalid previous enrollment ID' }),
    subject_fail_count: z.coerce.number().int().min(1, { message: 'At least 1 failed subject required' }).max(100),
  }),
});

export const StudentEnrollmentValidation = {
  createStudentEnrollmentValidation,
  updateStudentEnrollmentValidation,
  studentPromotionValidation,
  createSupplementaryAttemptValidation,
};

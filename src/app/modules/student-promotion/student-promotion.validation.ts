import z from 'zod';
import {
  EnrollmentStatus,
  EnrollmentType,
} from '../../../../generated/prisma/enums';

const promoteStudentValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    enrollment_id: z.string().uuid({ message: 'Invalid enrollment ID' }),
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
    registration_number: z.string().max(20).optional(),
    enrollment_status: z.nativeEnum(EnrollmentStatus, {
      message: 'Invalid enrollment status for closed row',
    }),
    enrollment_type: z.nativeEnum(EnrollmentType, {
      message: 'Invalid enrollment type for closed row',
    }),
    next_enrollment_type: z.nativeEnum(EnrollmentType, {
      message: 'Invalid enrollment type for new row',
    }),
    next_enrollment_status: z.nativeEnum(EnrollmentStatus, {
      message: 'Invalid enrollment status for new row',
    }),
    subject_fail_count: z.coerce
      .number()
      .int({ message: 'Subject fail count must be a whole number' })
      .min(0, { message: 'Subject fail count cannot be negative' })
      .max(100, { message: 'Subject fail count is too large' })
      .optional()
      .default(0),
  }).superRefine((data, ctx) => {
    if (
      data.enrollment_status === EnrollmentStatus.WITH_BACKLOG &&
      (data.subject_fail_count ?? 0) < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['subject_fail_count'],
        message:
          'Subject fail count is required (minimum 1) for backlog promotions',
      });
    }
    if (data.enrollment_status === EnrollmentStatus.PROMOTED && data.enrollment_type !== EnrollmentType.REGULAR) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'PROMOTED requires enrollment_type REGULAR' });
    }
    if (data.enrollment_status === EnrollmentStatus.WITH_BACKLOG && data.enrollment_type !== EnrollmentType.SUPPLEMENTARY) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'WITH_BACKLOG requires enrollment_type SUPPLEMENTARY' });
    }
    if (data.enrollment_status === EnrollmentStatus.WITH_BACKLOG && data.next_enrollment_type !== EnrollmentType.REGULAR) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_enrollment_type'], message: 'WITH_BACKLOG requires next_enrollment_type REGULAR' });
    }
    if (data.enrollment_status === EnrollmentStatus.REPEATED && data.enrollment_type !== EnrollmentType.REPEAT) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'REPEATED requires enrollment_type REPEAT' });
    }
    if (data.enrollment_status === EnrollmentStatus.REPEATED && data.next_enrollment_type !== EnrollmentType.REPEAT) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_enrollment_type'], message: 'REPEATED requires next_enrollment_type REPEAT' });
    }
    if (data.enrollment_status === EnrollmentStatus.PROMOTED && data.next_enrollment_type !== EnrollmentType.REGULAR) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_enrollment_type'], message: 'PROMOTED requires next_enrollment_type REGULAR' });
    }
  }),
});

const promoteManyStudentsValidation = z.object({
  body: z.object({
    enrollment_ids: z
      .array(z.string().uuid({ message: 'Invalid enrollment ID' }))
      .min(1, { message: 'Select at least one student to promote' })
      .max(500, { message: 'Cannot promote more than 500 students at once' }),
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
    enrollment_status: z.nativeEnum(EnrollmentStatus, {
      message: 'Invalid enrollment status for closed rows',
    }),
    enrollment_type: z
      .nativeEnum(EnrollmentType, {
        message: 'Invalid enrollment type for closed rows',
      })
      .optional(),
    next_enrollment_type: z.nativeEnum(EnrollmentType, {
      message: 'Invalid enrollment type for new rows',
    }),
    next_enrollment_status: z
      .nativeEnum(EnrollmentStatus, {
        message: 'Invalid enrollment status for new rows',
      })
      .optional(),
    subject_fail_count: z.coerce
      .number()
      .int({ message: 'Subject fail count must be a whole number' })
      .min(0, { message: 'Subject fail count cannot be negative' })
      .max(100, { message: 'Subject fail count is too large' })
      .optional()
      .default(0),
  }).superRefine((data, ctx) => {
    if (
      data.enrollment_status === EnrollmentStatus.WITH_BACKLOG &&
      (data.subject_fail_count ?? 0) < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['subject_fail_count'],
        message:
          'Subject fail count is required (minimum 1) for backlog promotions',
      });
    }
    if (data.enrollment_status === EnrollmentStatus.WITH_BACKLOG && data.enrollment_type && data.enrollment_type !== EnrollmentType.SUPPLEMENTARY) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'WITH_BACKLOG requires enrollment_type SUPPLEMENTARY' });
    }
    if (data.enrollment_status === EnrollmentStatus.WITH_BACKLOG && data.next_enrollment_type !== EnrollmentType.REGULAR) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_enrollment_type'], message: 'WITH_BACKLOG requires next_enrollment_type REGULAR' });
    }
    if (data.enrollment_status === EnrollmentStatus.PROMOTED && data.enrollment_type && data.enrollment_type !== EnrollmentType.REGULAR) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'PROMOTED requires enrollment_type REGULAR' });
    }
    if (data.enrollment_status === EnrollmentStatus.PROMOTED && data.next_enrollment_type !== EnrollmentType.REGULAR) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_enrollment_type'], message: 'PROMOTED requires next_enrollment_type REGULAR' });
    }
    if (data.enrollment_status === EnrollmentStatus.REPEATED && data.enrollment_type && data.enrollment_type !== EnrollmentType.REPEAT) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['enrollment_type'], message: 'REPEATED requires enrollment_type REPEAT' });
    }
    if (data.enrollment_status === EnrollmentStatus.REPEATED && data.next_enrollment_type !== EnrollmentType.REPEAT) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_enrollment_type'], message: 'REPEATED requires next_enrollment_type REPEAT' });
    }
  }),
});

export const StudentPromotionValidation = {
  promoteStudentValidation,
  promoteManyStudentsValidation,
};
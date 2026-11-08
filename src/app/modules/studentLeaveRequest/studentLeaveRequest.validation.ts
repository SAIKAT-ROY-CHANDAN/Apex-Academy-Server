import z from 'zod';
import { LeaveType, LeaveStatus } from '../../../../generated/prisma/enums';

const createStudentLeaveRequestValidation = z.object({
  body: z.object({
    student_id: z
      .string()
      .uuid({ message: 'Invalid student ID' })
      .optional(),

    leave_type: z.nativeEnum(LeaveType, { message: 'Invalid leave type' }),

    reason: z
      .string({ required_error: 'Reason is required' })
      .min(10, 'Reason must be at least 10 characters')
      .max(2000, 'Reason must be at most 2000 characters'),

    start_date: z
      .string({ required_error: 'Start date is required' })
      .datetime({ message: 'Invalid start date format' }),

    end_date: z
      .string({ required_error: 'End date is required' })
      .datetime({ message: 'Invalid end date format' }),

    status: z
      .enum([LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED], {
        message: 'Invalid status',
      })
      .optional(),
  }).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  }),
});

const updateStudentLeaveRequestValidation = z.object({
  body: z
    .object({
      leave_type: z.nativeEnum(LeaveType, { message: 'Invalid leave type' }).optional(),

      reason: z
        .string()
        .min(10, 'Reason must be at least 10 characters')
        .max(2000, 'Reason must be at most 2000 characters')
        .optional(),

      start_date: z.string().datetime({ message: 'Invalid start date format' }).optional(),

      end_date: z.string().datetime({ message: 'Invalid end date format' }).optional(),

      status: z
        .enum([LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED], {
          message: 'Invalid status',
        })
        .optional(),
    })
    .refine(
      (data) => {
        if (data.start_date && data.end_date) {
          return new Date(data.end_date) >= new Date(data.start_date);
        }
        return true;
      },
      {
        message: 'End date must be on or after start date',
        path: ['end_date'],
      },
    ),
});

export const StudentLeaveRequestValidation = {
  createStudentLeaveRequestValidation,
  updateStudentLeaveRequestValidation,
};

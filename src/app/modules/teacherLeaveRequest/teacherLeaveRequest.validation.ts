import z from 'zod';
import { LeaveType, LeaveStatus } from '../../../../generated/prisma/enums';

const createTeacherLeaveRequestValidation = z.object({
  body: z.object({
    teacher_id: z
      .string({ required_error: 'Teacher ID is required' })
      .uuid({ message: 'Invalid teacher ID' }),

    leave_start_date: z
      .string({ required_error: 'Leave start date is required' })
      .datetime({ message: 'Invalid leave start date format' }),

    leave_end_date: z
      .string({ required_error: 'Leave end date is required' })
      .datetime({ message: 'Invalid leave end date format' }),

    leave_type: z.nativeEnum(LeaveType, { message: 'Invalid leave type' }),

    leave_application: z
      .string({ required_error: 'Leave application is required' })
      .min(1, 'Leave application must not be empty'),

    leave_status: z
      .enum([LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED], {
        message: 'Invalid leave status',
      })
      .optional(),
  }),
});

const updateTeacherLeaveRequestValidation = z.object({
  body: z.object({
    leave_start_date: z
      .string()
      .datetime({ message: 'Invalid leave start date format' })
      .optional(),

    leave_end_date: z
      .string()
      .datetime({ message: 'Invalid leave end date format' })
      .optional(),

    leave_type: z.nativeEnum(LeaveType, { message: 'Invalid leave type' }).optional(),

    leave_application: z.string().min(1, 'Leave application must not be empty').optional(),

    leave_status: z
      .enum(
        [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED],
        { message: 'Invalid leave status' },
      )
      .optional(),
  }),
});

export const TeacherLeaveRequestValidation = {
  createTeacherLeaveRequestValidation,
  updateTeacherLeaveRequestValidation,
};
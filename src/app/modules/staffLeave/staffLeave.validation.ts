import z from 'zod';
import { LeaveStatus, LeaveType } from '../../../../generated/prisma/enums';

const createStaffLeaveValidation = z.object({
  body: z.object({
    staff_id: z
      .string({ required_error: 'Staff ID is required' })
      .uuid({ message: 'Invalid staff ID' }),

    leave_start_date: z
      .string({ required_error: 'Leave start date is required' })
      .datetime({ message: 'Invalid leave start date format' }),

    leave_end_date: z
      .string({ required_error: 'Leave end date is required' })
      .datetime({ message: 'Invalid leave end date format' }),

    leave_type: z.nativeEnum(LeaveType, { message: 'Invalid leave type' }),

    leave_application: z.string({
      required_error: 'Leave application is required',
    }),

    leave_status: z
      .enum([LeaveStatus.APPROVED, LeaveStatus.PENDING, LeaveStatus.REJECTED], {
        message: 'Invalid leave status',
      })
      .optional(),
  }),
});

const updateStaffLeaveValidation = z.object({
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

    leave_application: z.string().optional(),

    leave_status: z
      .enum([LeaveStatus.APPROVED, LeaveStatus.PENDING, LeaveStatus.REJECTED], {
        message: 'Invalid leave status',
      })
      .optional(),
  }),
});

export const StaffLeaveValidation = {
  createStaffLeaveValidation,
  updateStaffLeaveValidation,
};

import { z } from 'zod';
import { AttendanceStatus } from '../../../../generated/prisma/enums';

const createStaffAttendanceValidation = z.object({
  body: z.object({
    staff_id: z
      .string({ required_error: 'Staff ID is required' })
      .uuid({ message: 'Invalid staff ID' }),

    attendance_status: z.enum(
      [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT],
      { message: 'Invalid attendance status' },
    ),

    check_in_time: z
      .string({ required_error: 'Check-in time is required' })
      .datetime({ message: 'Invalid check-in time format' }),

    check_out_time: z
      .string()
      .datetime({ message: 'Invalid check-out time format' })
      .optional(),
  }),
});

const updateStaffAttendanceValidation = z.object({
  body: z.object({
    attendance_status: z
      .enum([AttendanceStatus.PRESENT, AttendanceStatus.ABSENT], {
        message: 'Invalid attendance status',
      })
      .optional(),

    check_in_time: z
      .string()
      .datetime({ message: 'Invalid check-in time format' })
      .optional(),

    check_out_time: z
      .string()
      .datetime({ message: 'Invalid check-out time format' })
      .optional(),
  }),
});

const getTodayAttendanceStatusValidation = z.object({
  body: z.object({
    staff_ids: z
      .array(z.string())
      .min(1, 'At least one staff ID is required'),
  }),
});

export const StaffAttendanceValidation = {
  createStaffAttendanceValidation,
  updateStaffAttendanceValidation,
  getTodayAttendanceStatusValidation,
};
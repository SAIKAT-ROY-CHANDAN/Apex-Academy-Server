import { z } from 'zod';

const createTeacherAttendanceValidation = z.object({
  body: z.object({
    teacher_id: z.string({ required_error: 'Teacher ID is required' }),
    attendance_status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE']),
    check_in_time: z.string({ required_error: 'Check-in time is required' }),
    check_out_time: z.string().optional(),
  }),
});

const updateTeacherAttendanceValidation = z.object({
  body: z.object({
    attendance_status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE']).optional(),
    check_in_time: z.string().optional(),
    check_out_time: z.string().optional(),
  }),
});

const getTodayAttendanceStatusValidation = z.object({
  body: z.object({
    teacher_ids: z.array(z.string()).min(1, 'At least one teacher ID is required'),
  }),
});

export const TeacherAttendanceValidation = {
  createTeacherAttendanceValidation,
  updateTeacherAttendanceValidation,
  getTodayAttendanceStatusValidation,
};
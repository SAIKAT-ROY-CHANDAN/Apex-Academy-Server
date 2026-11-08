import z from 'zod';

const attendanceStatusEnum = z.enum(['PRESENT', 'ABSENT']);
const studentGroupEnum = z.enum(['SCIENCE', 'COMMERCE', 'HUMANITIES']);

const attendanceBody = z.object({
  student_id: z
    .string({ required_error: 'Student ID is required' })
    .uuid({ message: 'Invalid student ID' }),

  attendance_status: attendanceStatusEnum,

  teacher_id: z
    .string({ required_error: 'Teacher ID is required' })
    .uuid({ message: 'Invalid teacher ID' }),

  attendance_date: z
    .string({ required_error: 'Attendance date is required' })
    .datetime({ message: 'Invalid attendance date format' }),

  subject_id: z.string().uuid({ message: 'Invalid subject ID' }).optional(),

  group: studentGroupEnum.optional(),

  academic_class_id: z
    .string()
    .uuid({ message: 'Invalid academic class ID' })
    .optional(),
});

const createStudentAttendanceValidation = z.object({
  body: attendanceBody,
});

const updateStudentAttendanceValidation = z.object({
  body: attendanceBody.partial(),
});

const createManyStudentAttendanceValidation = z.object({
  body: z.object({
    attendances: z
      .array(attendanceBody)
      .min(1, { message: 'At least one attendance record is required' }),
  }),
});

const updateManyStudentAttendanceValidation = z.object({
  body: z.object({
    updates: z
      .array(
        z.object({
          id: z.string().uuid({ message: 'Invalid attendance ID' }),
          attendance_status: attendanceStatusEnum,
        }),
      )
      .min(1, { message: 'At least one attendance record is required' }),
  }),
});

export const StudentAttendanceValidation = {
  createStudentAttendanceValidation,
  updateStudentAttendanceValidation,
  createManyStudentAttendanceValidation,
  updateManyStudentAttendanceValidation,
};
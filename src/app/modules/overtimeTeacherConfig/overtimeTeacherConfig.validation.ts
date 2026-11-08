import z from 'zod';

const createOvertimeTeacherConfigValidation = z.object({
  body: z.object({
    teacher_id: z
      .string({ required_error: 'Teacher ID is required' })
      .uuid({ message: 'Invalid teacher ID' }),

    overtime_hourly_amount: z
      .number({
        required_error: 'Overtime hourly amount is required',
        invalid_type_error: 'Overtime hourly amount must be a number',
      })
      .positive('Overtime hourly amount must be a positive number'),
  }),
});

const updateOvertimeTeacherConfigValidation = z.object({
  body: z.object({
    overtime_hourly_amount: z
      .number({
        invalid_type_error: 'Overtime hourly amount must be a number',
      })
      .positive('Overtime hourly amount must be a positive number')
      .optional(),
  }),
});

export const OvertimeTeacherConfigValidation = {
  createOvertimeTeacherConfigValidation,
  updateOvertimeTeacherConfigValidation,
};
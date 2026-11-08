import z from 'zod';

const createTeacherOvertimeValidation = z.object({
  body: z.object({
    teacher_id: z
      .string({ required_error: 'Teacher ID is required' })
      .uuid({ message: 'Invalid teacher ID' }),

    start_time: z
      .string()
      .datetime({ message: 'Invalid start time format' })
      .optional(),
  }),
});

const endTeacherOvertimeValidation = z.object({
  body: z.object({
    teacher_id: z
      .string({ required_error: 'Teacher ID is required' })
      .uuid({ message: 'Invalid teacher ID' }),

    overtime_id: z
      .string()
      .uuid({ message: 'Invalid overtime record ID' })
      .optional(),

    end_time: z
      .string()
      .datetime({ message: 'Invalid end time format' })
      .optional(),
  }),
});

const todayStatusValidation = z.object({
  body: z.object({
    teacher_ids: z
      .array(z.string().uuid({ message: 'Invalid teacher ID' }))
      .min(1, { message: 'At least one teacher ID is required' }),
  }),
});

const updateTeacherOvertimeValidation = z.object({
  body: z.object({
    overtime_hours: z.number().min(0).optional(),

    start_time: z
      .string()
      .datetime({ message: 'Invalid start time format' })
      .optional(),

    end_time: z
      .string()
      .datetime({ message: 'Invalid end time format' })
      .optional(),
  }),
});

export const TeacherOvertimeValidation = {
  createTeacherOvertimeValidation,
  endTeacherOvertimeValidation,
  todayStatusValidation,
  updateTeacherOvertimeValidation,
};

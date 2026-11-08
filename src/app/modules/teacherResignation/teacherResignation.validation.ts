import z from 'zod';

const createTeacherResignationValidation = z.object({
  body: z.object({
    teacher_id: z
      .string({ required_error: 'Teacher ID is required' })
      .uuid({ message: 'Invalid teacher ID' }),

    reason: z
      .string({ required_error: 'Reason is required' })
      .min(1, 'Reason must not be empty'),

    resignation_date: z
      .string({ required_error: 'Resignation date is required' })
      .datetime({ message: 'Invalid resignation date format' }),
  }),
});

const updateTeacherResignationValidation = z.object({
  body: z.object({
    reason: z.string().min(1, 'Reason must not be empty').optional(),

    resignation_date: z
      .string()
      .datetime({ message: 'Invalid resignation date format' })
      .optional(),
  }),
});

export const TeacherResignationValidation = {
  createTeacherResignationValidation,
  updateTeacherResignationValidation,
};
import z from 'zod';

const createHomeworkValidation = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(2, 'Title must be at least 2 characters'),

    description: z
      .string({ required_error: 'Description is required' })
      .min(2, 'Description must be at least 2 characters'),

    class_id: z
      .string({ required_error: 'Class ID is required' })
      .uuid({ message: 'Invalid class ID' }),

    section_id: z.string().uuid({ message: 'Invalid section ID' }).optional(),

    subject_id: z
      .string({ required_error: 'Subject ID is required' })
      .uuid({ message: 'Invalid subject ID' }),

    teacher_id: z
      .string({ required_error: 'Teacher ID is required' })
      .uuid({ message: 'Invalid teacher ID' }),

    due_date: z
      .string({ required_error: 'Due date is required' })
      .datetime({ message: 'Invalid due date format' }),
  }),
});

const updateHomeworkValidation = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),

    description: z
      .string()
      .min(2, 'Description must be at least 2 characters')
      .optional(),

    class_id: z.string().uuid({ message: 'Invalid class ID' }).optional(),

    section_id: z.string().uuid({ message: 'Invalid section ID' }).optional(),

    subject_id: z.string().uuid({ message: 'Invalid subject ID' }).optional(),

    teacher_id: z.string().uuid({ message: 'Invalid teacher ID' }).optional(),

    due_date: z
      .string()
      .datetime({ message: 'Invalid due date format' })
      .optional(),
  }),
});

export const HomeworkValidation = {
  createHomeworkValidation,
  updateHomeworkValidation,
};
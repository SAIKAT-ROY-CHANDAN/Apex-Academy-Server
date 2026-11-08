import z from 'zod';

const createSubjectValidation = z.object({
  body: z.object({
    class_id: z.string().uuid({ message: 'Invalid class ID' }),
    subjects: z
      .array(z.string().min(1, { message: 'Subject name cannot be empty' }))
      .min(1, { message: 'At least one subject is required' }),
  }),
});

const updateSubjectValidation = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: 'Subject name is required' })
      .optional(),
    class_id: z.string().uuid({ message: 'Invalid class ID' }).optional(),
  }),
});

export const SubjectValidation = {
  createSubjectValidation,
  updateSubjectValidation,
};
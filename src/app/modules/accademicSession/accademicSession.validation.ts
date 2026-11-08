import z from 'zod';

const createAcademicSessionValidation = z.object({
  body: z.object({
    institution_id: z.string().uuid({ message: 'Invalid institution ID' }),
    session_name: z.string().min(1, { message: 'Session name is required' }),
  }),
});

const updateAcademicSessionValidation = z.object({
  body: z.object({
    institution_id: z
      .string()
      .uuid({ message: 'Invalid institution ID' })
      .optional(),
    session_name: z
      .string()
      .min(1, { message: 'Session name is required' })
      .optional(),
  }),
});

export const AcademicSessionValidation = {
  createAcademicSessionValidation,
  updateAcademicSessionValidation,
};
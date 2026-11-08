import z from 'zod';

const createProgramValidation = z.object({
  body: z.object({
    institution_id: z.string().uuid({ message: 'Invalid institution ID' }),
    program_name: z.string().min(1, { message: 'Program name is required' }),
    duration_years: z.coerce.number().int().positive().optional(),
  }),
});

const updateProgramValidation = z.object({
  body: z.object({
    institution_id: z
      .string()
      .uuid({ message: 'Invalid institution ID' })
      .optional(),
    program_name: z
      .string()
      .min(1, { message: 'Program name is required' })
      .optional(),
   duration_years: z.coerce.number().int().positive().optional(),
  }),
});

export const ProgramValidation = {
  createProgramValidation,
  updateProgramValidation,
};
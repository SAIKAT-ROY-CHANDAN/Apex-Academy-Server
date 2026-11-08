import z from 'zod';

const createAcademicSectionValidation = z.object({
  body: z.object({
    section_name: z.string().min(1, { message: 'Section name is required' }),
    class_id: z.string().uuid({ message: 'Invalid class ID' }),
  }),
});

const updateAcademicSectionValidation = z.object({
  body: z.object({
    section_name: z
      .string()
      .min(1, { message: 'Section name is required' })
      .optional(),
    class_id: z.string().uuid({ message: 'Invalid class ID' }).optional(),
  }),
});

export const AcademicSectionValidation = {
  createAcademicSectionValidation,
  updateAcademicSectionValidation,
};
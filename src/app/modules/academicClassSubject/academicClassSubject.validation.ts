import z from 'zod';

const createAcademicClassSubjectValidation = z.object({
  body: z.object({
    class_id: z.string().uuid({ message: 'Invalid class ID' }),
    subject_id: z.string().uuid({ message: 'Invalid subject ID' }),
  }),
});

const updateAcademicClassSubjectValidation = z.object({
  body: z.object({
    class_id: z.string().uuid({ message: 'Invalid class ID' }).optional(),
    subject_id: z.string().uuid({ message: 'Invalid subject ID' }).optional(),
  }),
});

export const AcademicClassSubjectValidation = {
  createAcademicClassSubjectValidation,
  updateAcademicClassSubjectValidation,
};
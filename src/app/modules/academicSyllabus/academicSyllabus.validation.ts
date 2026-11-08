import z from 'zod';

const createAcademicSyllabusValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    syllabusUrl: z.string().optional().nullable(),
    removeSyllabus: z.string().optional(),
  }),
});

const updateAcademicSyllabusValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    syllabusUrl: z.string().optional().nullable(),
    removeSyllabus: z.string().optional(),
  }),
});

export const AcademicSyllabusValidation = {
  createAcademicSyllabusValidation,
  updateAcademicSyllabusValidation,
};

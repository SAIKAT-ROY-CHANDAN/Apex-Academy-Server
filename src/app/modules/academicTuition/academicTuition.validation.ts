import z from 'zod';

const createAcademicTuitionValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    tuitionUrl: z.string().optional().nullable(),
    tuitionAmount: z.coerce.number().optional().nullable(),
    removeTuitionImage: z.string().optional(),
  }),
});

const updateAcademicTuitionValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    tuitionUrl: z.string().optional().nullable(),
    tuitionAmount: z.coerce.number().optional().nullable(),
    removeTuitionImage: z.string().optional(),
  }),
});

export const AcademicTuitionValidation = {
  createAcademicTuitionValidation,
  updateAcademicTuitionValidation,
};

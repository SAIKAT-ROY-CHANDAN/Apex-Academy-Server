import z from 'zod';

const createCareerDevelopmentsValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().optional(),
    ),
    order: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().optional(),
    ),
    removeImage: z.string().optional(),
  }),
});

const updateCareerDevelopmentsValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().optional(),
    ),
    order: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().optional(),
    ),
    removeImage: z.string().optional(),
  }),
});

export const CareerDevelopmentsValidation = {
  createCareerDevelopmentsValidation,
  updateCareerDevelopmentsValidation,
};
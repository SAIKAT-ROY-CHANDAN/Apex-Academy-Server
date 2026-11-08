import z from 'zod';

const createBatchValidation = z.object({
  body: z.object({
    batch_name: z.string().min(1, { message: 'Batch name is required' }),
  }),
});

const updateBatchValidation = z.object({
  body: z.object({
    batch_name: z
      .string()
      .min(1, { message: 'Batch name is required' })
      .optional(),
  }),
});

export const BatchValidation = {
  createBatchValidation,
  updateBatchValidation,
};
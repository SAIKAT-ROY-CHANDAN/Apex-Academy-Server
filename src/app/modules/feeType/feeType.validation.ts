import z from 'zod';

const createFeeTypeValidation = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Fee type name is required' }),
    class_id: z.string().min(1, { message: 'Class ID is required' }),
  }),
});

const updateFeeTypeValidation = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: 'Fee type name is required' })
      .optional(),
    class_id: z
      .string()
      .min(1, { message: 'Class ID is required' })
      .optional(),
  }),
});

export const FeeTypeValidation = {
  createFeeTypeValidation,
  updateFeeTypeValidation,
};
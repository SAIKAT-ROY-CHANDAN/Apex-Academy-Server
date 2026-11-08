import z from 'zod';

const createDepositTypeValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
  }),
});

const updateDepositTypeValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
  }),
});

export const depositTypeValidation = {
  create: createDepositTypeValidationSchema,
  update: updateDepositTypeValidationSchema,
};
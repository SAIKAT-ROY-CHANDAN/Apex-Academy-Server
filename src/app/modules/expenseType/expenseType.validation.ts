import z from 'zod';

const createExpenseTypeValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
  }),
});

const updateExpenseTypeValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
  }),
});

export const expenseTypeValidation = {
  create: createExpenseTypeValidationSchema,
  update: updateExpenseTypeValidationSchema,
};
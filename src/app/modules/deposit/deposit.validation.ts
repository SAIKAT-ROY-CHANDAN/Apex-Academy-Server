import z from 'zod';

const depositItemSchema = z.object({
  item_name: z.string({ required_error: 'Item name is required' }).min(1, 'Item name cannot be empty'),
  item_amount: z.number({ required_error: 'Item amount is required' }).positive('Item amount must be positive'),
  description: z.string().optional(),
});

const createDepositValidationSchema = z.object({
  body: z.object({
    deposit_type_id: z.string({ required_error: 'Deposit type ID is required' }),
    deposit_date: z.string({ required_error: 'Deposit date is required' }),
    total_amount: z.number({ required_error: 'Total amount is required' }).positive('Total amount must be positive'),
    description: z.string().optional(),
    depositItems: z
      .array(depositItemSchema)
      .min(1, 'At least one deposit item is required'),
  }),
});

const updateDepositValidationSchema = z.object({
  body: z.object({
    deposit_type_id: z.string().optional(),
    deposit_date: z.string().optional(),
    total_amount: z.number().positive('Total amount must be positive').optional(),
    description: z.string().optional(),
    depositItems: z
      .array(depositItemSchema)
      .min(1, 'At least one deposit item is required')
      .optional(),
  }),
});

export const depositValidation = {
  create: createDepositValidationSchema,
  update: updateDepositValidationSchema,
};
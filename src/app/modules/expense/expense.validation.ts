import z from 'zod';

const expenseItemSchema = z.object({
  item_name: z.string({ required_error: 'Item name is required' }).min(1, 'Item name cannot be empty'),
  item_amount: z.number({ required_error: 'Item amount is required' }).positive('Item amount must be positive'),
  description: z.string().optional(),
});

const createExpenseValidationSchema = z.object({
  body: z.object({
    expense_type_id: z.string({ required_error: 'Expense type ID is required' }),
    expense_date: z.string({ required_error: 'Expense date is required' }),
    total_amount: z.number({ required_error: 'Total amount is required' }).positive('Total amount must be positive'),
    description: z.string().optional(),
    expenseItems: z
      .array(expenseItemSchema)
      .min(1, 'At least one expense item is required'),
  }),
});

const updateExpenseValidationSchema = z.object({
  body: z.object({
    expense_type_id: z.string().optional(),
    expense_date: z.string().optional(),
    total_amount: z.number().positive('Total amount must be positive').optional(),
    description: z.string().optional(),
    expenseItems: z
      .array(expenseItemSchema)
      .min(1, 'At least one expense item is required')
      .optional(),
  }),
});

export const expenseValidation = {
  create: createExpenseValidationSchema,
  update: updateExpenseValidationSchema,
};
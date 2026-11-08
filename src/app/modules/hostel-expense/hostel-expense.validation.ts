import z from 'zod';

const expenseItemSchema = z.object({
  item_name: z.string().min(1, { message: 'Item name is required' }),
  item_amount: z.number().positive({ message: 'Item amount must be positive' }),
});

const createHostelExpenseValidation = z.object({
  body: z.object({
    expense_date: z.coerce.date(),
    total_amount: z
      .number()
      .nonnegative({ message: 'Total amount must be non-negative' }),
    hostelExpenseItems: z
      .array(expenseItemSchema)
      .min(1, { message: 'At least one expense item is required' }),
  }),
});

const updateHostelExpenseValidation = z.object({
  body: z.object({
    expense_date: z.coerce.date().optional(),
    total_amount: z
      .number()
      .nonnegative({ message: 'Total amount must be non-negative' })
      .optional(),
    hostelExpenseItems: z.array(expenseItemSchema).optional(),
  }),
});

export const HostelExpenseValidation = {
  createHostelExpenseValidation,
  updateHostelExpenseValidation,
};

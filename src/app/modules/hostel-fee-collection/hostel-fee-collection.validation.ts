import z from 'zod';
import { PaymentMethod } from '../../../../generated/prisma/enums';

const feeItemSchema = z.object({
  item_name: z.string().min(1, { message: 'Item name is required' }),
  item_amount: z.number().positive({ message: 'Item amount must be positive' }),
});

const mealCollectionSchema = z.object({
  meal_count: z.number().int().nonnegative({ message: 'Meal count must be a non-negative integer' }),
  meal_rate: z.number().positive({ message: 'Meal rate must be positive' }),
  total_amount: z.number().nonnegative({ message: 'Total amount must be non-negative' }),
});

const createHostelFeeCollectionValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    collection_date: z.coerce.date(),
    total_amount: z.number().nonnegative({ message: 'Total amount must be non-negative' }),
    scholarship_amount: z.number().nonnegative({ message: 'Scholarship amount must be non-negative' }).optional(),
    paid_amount: z.number().nonnegative({ message: 'Paid amount must be non-negative' }),
    due_amount: z.number().nonnegative({ message: 'Due amount must be non-negative' }),
    hostelFeeCollectionItems: z
      .array(feeItemSchema)
      .min(1, { message: 'At least one fee item is required' }),
    mealCollection: mealCollectionSchema.optional(),
  }),
});

const updateHostelFeeCollectionValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }).optional(),
    collection_date: z.coerce.date().optional(),
    total_amount: z.number().nonnegative({ message: 'Total amount must be non-negative' }).optional(),
    scholarship_amount: z.number().nonnegative({ message: 'Scholarship amount must be non-negative' }).optional(),
    paid_amount: z.number().nonnegative({ message: 'Paid amount must be non-negative' }).optional(),
    due_amount: z.number().nonnegative({ message: 'Due amount must be non-negative' }).optional(),
    hostelFeeCollectionItems: z.array(feeItemSchema).optional(),
    mealCollection: mealCollectionSchema.optional(),
  }),
});

const payHostelDueValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    paid_amount: z
      .number()
      .positive({ message: 'Paid amount must be greater than 0' }),
    payment_method: z.nativeEnum(PaymentMethod, {
      message: 'Invalid payment method',
    }),
    payment_note: z.string().optional(),
  }),
});

const bkashInitiateValidation = z.object({
  body: z.object({}).optional(),
});

const bkashExecuteValidation = z.object({
  body: z.object({
    paymentID: z.string({ required_error: 'paymentID is required' }),
  }),
});

export const HostelFeeCollectionValidation = {
  createHostelFeeCollectionValidation,
  updateHostelFeeCollectionValidation,
  payHostelDueValidation,
  bkashInitiateValidation,
  bkashExecuteValidation,
};

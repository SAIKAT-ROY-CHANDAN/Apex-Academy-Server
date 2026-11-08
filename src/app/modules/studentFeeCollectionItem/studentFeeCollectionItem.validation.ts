import z from 'zod';
import { Month, PaymentMethod } from '../../../../generated/prisma/enums';

const createStudentFeeCollectionItemValidation = z.object({
  body: z.object({
    student_fee_collection_id: z
      .string()
      .uuid({ message: 'Invalid student fee collection ID' }),
    fee_item_id: z.string().uuid({ message: 'Invalid fee item ID' }),
    fee_month: z.nativeEnum(Month).nullable().optional(),
    fee_year: z.number().int().min(2000).max(2100).nullable().optional(),
    discount_amount: z.number().min(0).optional(),
    paid_amount: z.number().min(0).optional(),
    line_total_amount: z.number().min(0).optional(),
    fine_amount: z.number().min(0).optional(),
    payment_method: z.nativeEnum(PaymentMethod).optional(),
    payment_note: z.string().max(100).optional(),
  }),
});

const updateStudentFeeCollectionItemValidation = z.object({
  body: z.object({
    discount_amount: z.number().min(0).optional(),
    paid_amount: z.number().min(0).optional(),
    line_total_amount: z.number().min(0).optional(),
    fine_amount: z.number().min(0).optional(),
  }),
});

const editStudentFeeCollectionItemValidation = z.object({
  body: z
    .object({
      discount_amount: z.number().finite().min(0).optional(),
      paid_amount: z.number().finite().min(0).optional(),
    })
    .refine(
      (body) =>
        body.discount_amount !== undefined || body.paid_amount !== undefined,
      { message: 'At least one amount must be provided' },
    ),
});

export const StudentFeeCollectionItemValidation = {
  createStudentFeeCollectionItemValidation,
  updateStudentFeeCollectionItemValidation,
  editStudentFeeCollectionItemValidation,
};

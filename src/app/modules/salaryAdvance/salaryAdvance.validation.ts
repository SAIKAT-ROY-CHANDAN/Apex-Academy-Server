import z from 'zod';
import { AdvanceStatus, PaymentMethod } from '../../../../generated/prisma/enums';

const personRefinement = (data: { teacher_id?: string; staff_id?: string }, ctx: z.RefinementCtx) => {
  const hasTeacher = Boolean(data.teacher_id);
  const hasStaff = Boolean(data.staff_id);

  if (hasTeacher === hasStaff) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide exactly one of teacher_id or staff_id',
      path: ['teacher_id'],
    });
  }
};

const createSalaryAdvanceValidation = z.object({
  body: z
    .object({
      teacher_id: z.string().uuid({ message: 'Invalid teacher ID' }).optional(),
      staff_id: z.string().uuid({ message: 'Invalid staff ID' }).optional(),
      advance_amount: z
        .number({ required_error: 'Advance amount is required' })
        .positive({ message: 'Advance amount must be greater than 0' }),
      reason: z.string().optional(),
      given_at: z
        .string({ required_error: 'Given date is required' }),
      payment_method: z.nativeEnum(PaymentMethod, { message: 'Invalid payment method' }),
      transaction_id: z.string().optional(),
      bkash_sender_number: z.string().max(20).optional(),
      bkash_receiver_number: z.string().max(20).optional(),
      payment_note: z.string().optional(),
      is_deducted: z.boolean().optional(),
      advance_status: z.nativeEnum(AdvanceStatus, { message: 'Invalid advance status' }).optional(),
    })
    .superRefine(personRefinement),
});

const updateSalaryAdvanceValidation = z.object({
  body: z
    .object({
      teacher_id: z.string().uuid({ message: 'Invalid teacher ID' }).optional(),
      staff_id: z.string().uuid({ message: 'Invalid staff ID' }).optional(),
      advance_amount: z.number().positive({ message: 'Advance amount must be greater than 0' }).optional(),
      reason: z.string().optional(),
      given_at: z.string().datetime({ message: 'Invalid given date format' }).optional(),
      payment_method: z.nativeEnum(PaymentMethod, { message: 'Invalid payment method' }).optional(),
      transaction_id: z.string().optional(),
      bkash_sender_number: z.string().max(20).optional(),
      bkash_receiver_number: z.string().max(20).optional(),
      payment_note: z.string().optional(),
      is_deducted: z.boolean().optional(),
      advance_status: z.nativeEnum(AdvanceStatus, { message: 'Invalid advance status' }).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.teacher_id && data.staff_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide only one of teacher_id or staff_id',
          path: ['teacher_id'],
        });
      }
    }),
});

export const SalaryAdvanceValidation = {
  createSalaryAdvanceValidation,
  updateSalaryAdvanceValidation,
};
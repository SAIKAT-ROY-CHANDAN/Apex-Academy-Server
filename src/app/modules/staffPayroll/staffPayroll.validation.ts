import z from 'zod';
import { PaymentMethod } from '../../../../generated/prisma/enums';

const createStaffPayrollValidation = z.object({
  body: z
    .object({
      staffId: z.string({ required_error: 'Staff ID is required' }).uuid('Invalid staff ID'),

      month: z
        .number({ required_error: 'Month is required' })
        .int()
        .min(1, 'Month must be between 1 and 12')
        .max(12, 'Month must be between 1 and 12'),

      year: z
        .number({ required_error: 'Year is required' })
        .int()
        .min(2000, 'Year must be between 2000 and 2100')
        .max(2100, 'Year must be between 2000 and 2100'),

      payment_method: z.nativeEnum(PaymentMethod, {
        required_error: 'Payment method is required',
      }),

      transaction_id: z.string().optional(),
      bkash_sender_number: z.string().optional(),
      bkash_receiver_number: z.string().optional(),
      payment_note: z.string().optional(),
    }),
});

export const StaffPayrollValidation = {
  createStaffPayrollValidation,
};

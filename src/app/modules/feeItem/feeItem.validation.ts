import z from 'zod';
import { FeeItemType, Month, Fee_Assign_FOR } from '../../../../generated/prisma/enums';

const createFeeItemValidation = z.object({
  body: z
    .object({
      fee_type_id: z.string().uuid({ message: 'Invalid fee type ID' }),
      name: z.string().min(1, { message: 'Fee item name is required' }),
      FeeItemType: z.nativeEnum(FeeItemType, {
        message: 'Invalid fee item type',
      }),
      fee_assign_for: z.nativeEnum(Fee_Assign_FOR, {
        message: 'Invalid fee assign for type',
      }),
      amount: z.number().nonnegative({ message: 'Amount must be non-negative' }),
      amount_every_subject: z.number().positive().nullable().optional(),
      isFine: z.boolean().optional(),
      payment_start_date: z.number().int().nullable().optional(),
      last_payment_date: z.number().int().nullable().optional(),
      everydayFine_amount: z.number().positive().nullable().optional(),
      feeStartMonth: z.nativeEnum(Month).nullable().optional(),
      feeEndMonth: z.nativeEnum(Month).nullable().optional(),
    })
    .superRefine((body, ctx) => {
      // SUPPLEMENTARY fees are always OneTime and use amount_every_subject
      if (body.fee_assign_for === Fee_Assign_FOR.SUPPLEMENTARY) {
        if (body.FeeItemType !== FeeItemType.OneTime) {
          ctx.addIssue({
            code: 'custom',
            path: ['FeeItemType'],
            message: 'Supplementary fee must be OneTime type',
          });
        }
        if (!body.amount_every_subject || body.amount_every_subject <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['amount_every_subject'],
            message: 'Amount per subject is required for Supplementary fee',
          });
        }
        // Ignore month fields for supplementary
      } else {
        // REGULAR fees
        if (!body.amount || body.amount <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['amount'],
            message: 'Amount is required for Regular fee',
          });
        }
        if (body.FeeItemType === FeeItemType.Monthly) {
          if (!body.feeStartMonth) {
            ctx.addIssue({
              code: 'custom',
              path: ['feeStartMonth'],
              message: 'Start month is required for Monthly fee',
            });
          }
          if (!body.feeEndMonth) {
            ctx.addIssue({
              code: 'custom',
              path: ['feeEndMonth'],
              message: 'End month is required for Monthly fee',
            });
          }
        }
      }
    }),
});

const updateFeeItemValidation = z.object({
  body: z
    .object({
      fee_type_id: z
        .string()
        .uuid({ message: 'Invalid fee type ID' })
        .optional(),
      name: z
        .string()
        .min(1, { message: 'Fee item name is required' })
        .optional(),
      FeeItemType: z
        .nativeEnum(FeeItemType, {
          message: 'Invalid fee item type',
        })
        .optional(),
      fee_assign_for: z
        .nativeEnum(Fee_Assign_FOR, {
          message: 'Invalid fee assign for type',
        })
        .optional(),
      amount: z
        .number()
        .nonnegative({ message: 'Amount must be non-negative' })
        .optional(),
      amount_every_subject: z.number().positive().nullable().optional(),
      isFine: z.boolean().optional(),
      payment_start_date: z.number().int().nullable().optional(),
      last_payment_date: z.number().int().nullable().optional(),
      everydayFine_amount: z.number().positive().nullable().optional(),
      feeStartMonth: z.nativeEnum(Month).nullable().optional(),
      feeEndMonth: z.nativeEnum(Month).nullable().optional(),
    })
    .superRefine((body, ctx) => {
      // If fee_assign_for is being updated to SUPPLEMENTARY
      if (body.fee_assign_for === Fee_Assign_FOR.SUPPLEMENTARY) {
        const feeItemType = body.FeeItemType ?? FeeItemType.OneTime;
        if (feeItemType !== FeeItemType.OneTime) {
          ctx.addIssue({
            code: 'custom',
            path: ['FeeItemType'],
            message: 'Supplementary fee must be OneTime type',
          });
        }
        if (body.amount_every_subject !== undefined && body.amount_every_subject !== null && body.amount_every_subject <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['amount_every_subject'],
            message: 'Amount per subject must be positive for Supplementary fee',
          });
        }
      } else if (body.fee_assign_for === Fee_Assign_FOR.REGULAR) {
        // REGULAR fees
        if (body.amount !== undefined && body.amount <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['amount'],
            message: 'Amount must be positive for Regular fee',
          });
        }
        const feeItemType = body.FeeItemType ?? FeeItemType.Monthly;
        if (feeItemType === FeeItemType.Monthly) {
          if (body.feeStartMonth === undefined && body.feeEndMonth === undefined) return;
          if (!body.feeStartMonth) {
            ctx.addIssue({
              code: 'custom',
              path: ['feeStartMonth'],
              message: 'Start month is required for Monthly fee',
            });
          }
          if (!body.feeEndMonth) {
            ctx.addIssue({
              code: 'custom',
              path: ['feeEndMonth'],
              message: 'End month is required for Monthly fee',
            });
          }
        }
      } else if (body.FeeItemType === FeeItemType.Monthly) {
        // Fallback for when fee_assign_for not being updated
        if (body.feeStartMonth === undefined && body.feeEndMonth === undefined) return;
        if (!body.feeStartMonth) {
          ctx.addIssue({
            code: 'custom',
            path: ['feeStartMonth'],
            message: 'Start month is required for Monthly fee',
          });
        }
        if (!body.feeEndMonth) {
          ctx.addIssue({
            code: 'custom',
            path: ['feeEndMonth'],
            message: 'End month is required for Monthly fee',
          });
        }
      }
    }),
});

export const FeeItemValidation = {
  createFeeItemValidation,
  updateFeeItemValidation,
};
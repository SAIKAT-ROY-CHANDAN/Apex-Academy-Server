import z from 'zod';

const messageSchema = z
  .string()
  .trim()
  .min(1, { message: 'Message is required' })
  .max(1000, { message: 'Message must not exceed 1000 characters' });

const targetIdSchema = z.string().uuid({ message: 'Invalid target ID' });

const sendBulkSmsValidation = z.object({
  body: z.discriminatedUnion('target', [
    z.object({ message: messageSchema, target: z.literal('ALL_STUDENTS') }),
    z.object({
      message: messageSchema,
      target: z.literal('STUDENT'),
      targetId: targetIdSchema,
    }),
    z.object({
      message: messageSchema,
      target: z.literal('BATCH'),
      targetId: targetIdSchema,
    }),
    z.object({
      message: messageSchema,
      target: z.literal('CLASS'),
      targetId: targetIdSchema,
    }),
    z.object({
      message: messageSchema,
      target: z.literal('SHIFT'),
      targetId: targetIdSchema,
    }),
    z.object({
      message: messageSchema,
      target: z.literal('MANUAL'),
      phoneNumbers: z
        .array(
          z.string().trim().min(1, { message: 'Phone number is required' }),
        )
        .min(1, { message: 'At least one phone number is required' })
        .max(500, { message: 'A maximum of 500 phone numbers is allowed' }),
    }),
  ]),
});

export const BulkSmsValidation = {
  sendBulkSmsValidation,
};

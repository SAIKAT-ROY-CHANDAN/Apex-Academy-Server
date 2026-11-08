import z from 'zod';

const websiteFaqBodySchema = z.object({
  question: z.string().min(1, 'Question is required').optional(),
  answer: z.string().min(1, 'Answer is required').optional(),
});

const createWebsiteFaqValidation = z.object({
  body: websiteFaqBodySchema,
});

const updateWebsiteFaqValidation = z.object({
  body: websiteFaqBodySchema.partial(),
});

const createManyWebsiteFaqValidation = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          question: z.string().min(1, 'Question is required'),
          answer: z.string().min(1, 'Answer is required'),
        }),
      )
      .min(1, 'At least one FAQ is required'),
  }),
});

export const WebsiteFaqValidation = {
  createWebsiteFaqValidation,
  updateWebsiteFaqValidation,
  createManyWebsiteFaqValidation,
};

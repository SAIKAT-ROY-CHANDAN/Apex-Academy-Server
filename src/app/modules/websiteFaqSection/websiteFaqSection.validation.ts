import z from 'zod';

const createWebsiteFaqSectionValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
  }),
});

const updateWebsiteFaqSectionValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
  }),
});

export const WebsiteFaqSectionValidation = {
  createWebsiteFaqSectionValidation,
  updateWebsiteFaqSectionValidation,
};

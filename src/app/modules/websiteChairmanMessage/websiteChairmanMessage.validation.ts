import z from 'zod';

const websiteChairmanMessageBodySchema = z.object({
  imageUrl: z.string().optional().nullable(),
  name: z.string().optional(),
  facebookUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  message: z.string().optional(),
});

const createWebsiteChairmanMessageValidation = z.object({
  body: websiteChairmanMessageBodySchema,
});

const updateWebsiteChairmanMessageValidation = z.object({
  body: websiteChairmanMessageBodySchema,
});

export const WebsiteChairmanMessageValidation = {
  createWebsiteChairmanMessageValidation,
  updateWebsiteChairmanMessageValidation,
};

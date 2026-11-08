import z from 'zod';

const websitePrincipalMessageBodySchema = z.object({
  imageUrl: z.string().optional().nullable(),
  name: z.string().optional(),
  facebookUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  message: z.string().optional(),
});

const createWebsitePrincipalMessageValidation = z.object({
  body: websitePrincipalMessageBodySchema,
});

const updateWebsitePrincipalMessageValidation = z.object({
  body: websitePrincipalMessageBodySchema,
});

export const WebsitePrincipalMessageValidation = {
  createWebsitePrincipalMessageValidation,
  updateWebsitePrincipalMessageValidation,
};

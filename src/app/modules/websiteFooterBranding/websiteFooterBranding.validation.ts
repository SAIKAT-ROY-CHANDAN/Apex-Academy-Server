import z from 'zod';

const createWebsiteFooterBrandingValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    subHeading: z.string().optional(),
    description: z.string().optional(),
    footerImage: z.string().optional().nullable(),
    brandingImage: z.string().optional().nullable(),
    copyrightText: z.string().optional(),
  }),
});

const updateWebsiteFooterBrandingValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    subHeading: z.string().optional(),
    description: z.string().optional(),
    footerImage: z.string().optional().nullable(),
    brandingImage: z.string().optional().nullable(),
    copyrightText: z.string().optional(),
  }),
});

export const WebsiteFooterBrandingValidation = {
  createWebsiteFooterBrandingValidation,
  updateWebsiteFooterBrandingValidation,
};
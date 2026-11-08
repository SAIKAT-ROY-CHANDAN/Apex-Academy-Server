import z from 'zod';

const createWebsiteCtaBannerValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    subHeading: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
  }),
});

const updateWebsiteCtaBannerValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    subHeading: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
  }),
});

export const WebsiteCtaBannerValidation = {
  createWebsiteCtaBannerValidation,
  updateWebsiteCtaBannerValidation,
};

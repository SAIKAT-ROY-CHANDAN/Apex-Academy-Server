import z from 'zod';

const createWebsiteHeroSectionValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    subHeading: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
  }),
});

const updateWebsiteHeroSectionValidation = z.object({
  body: z.object({
    heading: z.string().optional(),
    subHeading: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
  }),
});

export const WebsiteHeroSectionValidation = {
  createWebsiteHeroSectionValidation,
  updateWebsiteHeroSectionValidation,
};

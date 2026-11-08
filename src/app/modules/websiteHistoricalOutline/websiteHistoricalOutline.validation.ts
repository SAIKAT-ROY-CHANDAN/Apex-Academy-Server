import z from 'zod';

const websiteHistoricalOutlineBodySchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  imageUrl1: z.string().optional().nullable(),
  imageUrl2: z.string().optional().nullable(),
  imageUrl3: z.string().optional().nullable(),
});

const createWebsiteHistoricalOutlineValidation = z.object({
  body: websiteHistoricalOutlineBodySchema,
});

const updateWebsiteHistoricalOutlineValidation = z.object({
  body: websiteHistoricalOutlineBodySchema,
});

export const WebsiteHistoricalOutlineValidation = {
  createWebsiteHistoricalOutlineValidation,
  updateWebsiteHistoricalOutlineValidation,
};

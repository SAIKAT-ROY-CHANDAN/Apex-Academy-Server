import z from 'zod';

const websiteJobCircularBodySchema = z.object({
  positionName: z.string().optional(),
  positionType: z.string().optional(),
  educationalQualification: z.string().optional(),
  applyFee: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional(),
});

const createWebsiteJobCircularValidation = z.object({
  body: websiteJobCircularBodySchema,
});

const updateWebsiteJobCircularValidation = z.object({
  body: websiteJobCircularBodySchema,
});

export const WebsiteJobCircularValidation = {
  createWebsiteJobCircularValidation,
  updateWebsiteJobCircularValidation,
};

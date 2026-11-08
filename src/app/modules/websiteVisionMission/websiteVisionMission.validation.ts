import z from 'zod';

const websiteVisionMissionBodySchema = z.object({
  heading: z.string().optional(),
  subHeading: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  goal: z.string().optional(),
});

const createWebsiteVisionMissionValidation = z.object({
  body: websiteVisionMissionBodySchema,
});

const updateWebsiteVisionMissionValidation = z.object({
  body: websiteVisionMissionBodySchema,
});

export const WebsiteVisionMissionValidation = {
  createWebsiteVisionMissionValidation,
  updateWebsiteVisionMissionValidation,
};

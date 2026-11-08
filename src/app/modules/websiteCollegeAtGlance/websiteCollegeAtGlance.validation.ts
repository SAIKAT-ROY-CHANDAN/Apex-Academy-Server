import z from 'zod';

const websiteCollegeAtGlanceBodySchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  imageUrl1: z.string().optional().nullable(),
  imageUrl2: z.string().optional().nullable(),
  imageUrl3: z.string().optional().nullable(),
  imageUrl4: z.string().optional().nullable(),
});

const createWebsiteCollegeAtGlanceValidation = z.object({
  body: websiteCollegeAtGlanceBodySchema,
});

const updateWebsiteCollegeAtGlanceValidation = z.object({
  body: websiteCollegeAtGlanceBodySchema,
});

export const WebsiteCollegeAtGlanceValidation = {
  createWebsiteCollegeAtGlanceValidation,
  updateWebsiteCollegeAtGlanceValidation,
};

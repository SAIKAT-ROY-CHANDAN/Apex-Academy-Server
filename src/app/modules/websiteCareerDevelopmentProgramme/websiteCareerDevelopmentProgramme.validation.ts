import z from 'zod';

const websiteCareerDevelopmentProgrammeBodySchema = z.object({
  programName: z.string().optional(),
  entryFee: z.string().optional(),
  description: z.string().optional(),
});

const createWebsiteCareerDevelopmentProgrammeValidation = z.object({
  body: websiteCareerDevelopmentProgrammeBodySchema,
});

const updateWebsiteCareerDevelopmentProgrammeValidation = z.object({
  body: websiteCareerDevelopmentProgrammeBodySchema,
});

export const WebsiteCareerDevelopmentProgrammeValidation = {
  createWebsiteCareerDevelopmentProgrammeValidation,
  updateWebsiteCareerDevelopmentProgrammeValidation,
};
import z from 'zod';

const websiteCurriculumBodySchema = z.object({
  title: z.string().optional(),
  fileUrl: z.string().optional().nullable(),
});

const createWebsiteCurriculumValidation = z.object({
  body: websiteCurriculumBodySchema,
});

const updateWebsiteCurriculumValidation = z.object({
  body: websiteCurriculumBodySchema,
});

export const WebsiteCurriculumValidation = {
  createWebsiteCurriculumValidation,
  updateWebsiteCurriculumValidation,
};

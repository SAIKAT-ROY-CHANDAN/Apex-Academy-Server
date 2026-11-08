import z from 'zod';

const websiteHeadOfDepartmentBodySchema = z.object({
  imageUrl: z.string().optional().nullable(),
  name: z.string().optional(),
  designation: z.string().optional(),
  departmentName: z.string().optional(),
});

const createWebsiteHeadOfDepartmentValidation = z.object({
  body: websiteHeadOfDepartmentBodySchema,
});

const updateWebsiteHeadOfDepartmentValidation = z.object({
  body: websiteHeadOfDepartmentBodySchema,
});

export const WebsiteHeadOfDepartmentValidation = {
  createWebsiteHeadOfDepartmentValidation,
  updateWebsiteHeadOfDepartmentValidation,
};

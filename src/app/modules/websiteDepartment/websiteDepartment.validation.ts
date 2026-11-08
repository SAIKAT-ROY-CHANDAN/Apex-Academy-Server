import z from 'zod';

const websiteDepartmentBodySchema = z.object({
  name: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  details: z.string().optional(),
  // parseFormData converts the stringified JSON array before validation.
  courseList: z.array(z.string()).optional(),
});

const createWebsiteDepartmentValidation = z.object({
  body: websiteDepartmentBodySchema,
});

const updateWebsiteDepartmentValidation = z.object({
  body: websiteDepartmentBodySchema,
});

export const WebsiteDepartmentValidation = {
  createWebsiteDepartmentValidation,
  updateWebsiteDepartmentValidation,
};

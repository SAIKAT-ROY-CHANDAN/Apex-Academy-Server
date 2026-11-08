import z from 'zod';

// FormData delivers booleans as the strings 'true'/'false' — coerce both
// representations so the schema accepts multipart and JSON payloads alike.
const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => (typeof value === 'string' ? value === 'true' : value));

const websiteGoverningBodyBodySchema = z.object({
  imageUrl: z.string().optional().nullable(),
  name: z.string().optional(),
  designation: z.string().optional(),
  isFeatured: booleanFromFormData,
});

const createWebsiteGoverningBodyValidation = z.object({
  body: websiteGoverningBodyBodySchema,
});

const updateWebsiteGoverningBodyValidation = z.object({
  body: websiteGoverningBodyBodySchema,
});

export const WebsiteGoverningBodyValidation = {
  createWebsiteGoverningBodyValidation,
  updateWebsiteGoverningBodyValidation,
};

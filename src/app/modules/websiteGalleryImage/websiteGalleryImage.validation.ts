import z from 'zod';

const websiteGalleryImageBodySchema = z.object({
  imageUrl: z.string().optional().nullable(),
  videoUrl: z.string().url('Invalid video URL').optional().nullable(),
  title: z.string().optional(),
  description: z.string().optional(),
  removeImage: z.string().optional(),
});

const createWebsiteGalleryImageValidation = z.object({
  body: websiteGalleryImageBodySchema,
});

const updateWebsiteGalleryImageValidation = z.object({
  body: websiteGalleryImageBodySchema,
});

export const WebsiteGalleryImageValidation = {
  createWebsiteGalleryImageValidation,
  updateWebsiteGalleryImageValidation,
};

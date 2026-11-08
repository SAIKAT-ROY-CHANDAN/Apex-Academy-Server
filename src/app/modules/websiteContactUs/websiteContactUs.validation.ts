import z from 'zod';

const websiteContactUsBody = z.object({
  heading: z.string().trim().optional().or(z.literal('')),
  subHeading: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().max(50, 'Phone must be 50 characters or fewer').optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
  location: z.string().trim().optional().or(z.literal('')),
  mapUrl: z
    .string()
    .trim()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
  workingHours: z.string().trim().max(100, 'Working hours must be 100 characters or fewer').optional().or(z.literal('')),
  facebookUrl: z
    .string()
    .trim()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
});

const createWebsiteContactUsValidation = z.object({
  body: websiteContactUsBody,
});

const updateWebsiteContactUsValidation = z.object({
  body: websiteContactUsBody,
});

export const WebsiteContactUsValidation = {
  createWebsiteContactUsValidation,
  updateWebsiteContactUsValidation,
};

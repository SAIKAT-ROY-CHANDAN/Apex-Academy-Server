import z from 'zod';

const createWebsiteCareerDevelopmentApplicationValidation = z.object({
  body: z.object({
    programmeId: z
      .string()
      .min(1, { message: 'Programme is required' }),
    fullName: z
      .string()
      .min(1, { message: 'Full name is required' }),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

export const WebsiteCareerDevelopmentApplicationValidation = {
  createWebsiteCareerDevelopmentApplicationValidation,
};
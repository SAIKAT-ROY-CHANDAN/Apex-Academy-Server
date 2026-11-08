import z from 'zod';

const jobApplicationBodySchema = z.object({
  circularId: z.string().min(1, 'Circular is required'),
  fullName: z.string().min(1, 'Full name is required'),
  gender: z.string().optional(),
  nid: z.string().optional(),
  dob: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  bloodGroup: z.string().optional(),
  village: z.string().optional(),
  postOffice: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  degree: z.string().optional(),
  majorSubject: z.string().optional(),
  institution: z.string().optional(),
  cgpa: z.string().optional(),
  graduationYear: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  certificateUrl: z.string().optional().nullable(),
  cvUrl: z.string().optional().nullable(),
});

const createJobApplicationValidation = z.object({
  body: jobApplicationBodySchema,
});

const bkashExecuteValidation = z.object({
  body: z.object({
    paymentID: z.string().min(1, 'paymentID is required'),
  }),
});

export const JobApplicationValidation = {
  createJobApplicationValidation,
  bkashExecuteValidation,
};
import z from 'zod';
import { AdmissionProgramType } from '../../../../generated/prisma/enums';

const createAdmissionProgramValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    type: z.nativeEnum(AdmissionProgramType, { message: 'Invalid program type' }),
    imageUrl: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    requirements: z.string().optional().nullable(),
    courseList: z.string().optional().nullable(),
    isActive: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().optional(),
    ),
    order: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().optional(),
    ),
    removeImage: z.string().optional(),
  }),
});

const updateAdmissionProgramValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    type: z.nativeEnum(AdmissionProgramType, { message: 'Invalid program type' }).optional(),
    imageUrl: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    requirements: z.string().optional().nullable(),
    courseList: z.string().optional().nullable(),
    isActive: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().optional(),
    ),
    order: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().optional(),
    ),
    removeImage: z.string().optional(),
  }),
});

export const AdmissionProgramValidation = {
  createAdmissionProgramValidation,
  updateAdmissionProgramValidation,
};
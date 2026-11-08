import z from 'zod';
import { AcademicTuitionType } from '../../../../generated/prisma/enums';

const createAcademicFacilitiesValidation = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    main_image_url: z.string().optional().nullable(),
    sub_one_image_url: z.string().optional().nullable(),
    sub_two_image_url: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    facilities_type: z.nativeEnum(AcademicTuitionType).optional(),
    removeMainImage: z.string().optional(),
    removeSubOneImage: z.string().optional(),
    removeSubTwoImage: z.string().optional(),
  }),
});

const updateAcademicFacilitiesValidation = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    main_image_url: z.string().optional().nullable(),
    sub_one_image_url: z.string().optional().nullable(),
    sub_two_image_url: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    facilities_type: z.nativeEnum(AcademicTuitionType).optional(),
    removeMainImage: z.string().optional(),
    removeSubOneImage: z.string().optional(),
    removeSubTwoImage: z.string().optional(),
  }),
});

export const AcademicFacilitiesValidation = {
  createAcademicFacilitiesValidation,
  updateAcademicFacilitiesValidation,
};

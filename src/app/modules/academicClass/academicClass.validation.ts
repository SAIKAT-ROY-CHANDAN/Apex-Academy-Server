import z from 'zod';
import { StudentGroup } from '../../../../generated/prisma/enums';

const createAcademicClassValidation = z.object({
  body: z.object({
    program_id: z.string().uuid({ message: 'Invalid program ID' }).optional().nullable(),
    department_id: z
      .string()
      .uuid({ message: 'Invalid department ID' })
      .optional()
      .nullable(),
    class_name: z.string().min(1, { message: 'Class name is required' }),
    class_level: z.number().int().optional().nullable(),
    year_level: z.number().int().optional().nullable(),
    group: z.nativeEnum(StudentGroup).optional().nullable(),
  }),
});

const updateAcademicClassValidation = z.object({
  body: z.object({
    program_id: z.string().uuid({ message: 'Invalid program ID' }).optional().nullable(),
    department_id: z
      .string()
      .uuid({ message: 'Invalid department ID' })
      .optional()
      .nullable(),
    class_name: z
      .string()
      .min(1, { message: 'Class name is required' })
      .optional(),
    class_level: z.number().int().optional().nullable(),
    year_level: z.number().int().optional().nullable(),
    group: z.nativeEnum(StudentGroup).optional().nullable(),
  }),
});

export const AcademicClassValidation = {
  createAcademicClassValidation,
  updateAcademicClassValidation,
};
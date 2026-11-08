import z from 'zod';
import { GenerateType } from '../../../../generated/prisma/enums';

const createIDCardGenerateLogValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    generated_at: z.coerce.date({ message: 'Invalid generated date' }).optional(),
    generate_type: z.nativeEnum(GenerateType, {
      message: 'Invalid generate type',
    }),
  }),
});

const updateIDCardGenerateLogValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }).optional(),
    generated_at: z.coerce.date({ message: 'Invalid generated date' }).optional(),
    generate_type: z
      .nativeEnum(GenerateType, { message: 'Invalid generate type' })
      .optional(),
  }),
});

export const IDCardGenerateLogValidation = {
  createIDCardGenerateLogValidation,
  updateIDCardGenerateLogValidation,
};
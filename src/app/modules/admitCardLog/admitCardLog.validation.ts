import z from 'zod';

const createAdmitCardLogValidationSchema = z.object({
  body: z.object({
    student_id: z.string({ required_error: 'Student ID is required' }),
    exam_config_id: z.string({ required_error: 'Exam config ID is required' }),
    status: z.string().optional(),
  }),
});

const updateAdmitCardLogValidationSchema = z.object({
  body: z.object({
    status: z.string().optional(),
  }),
});

export const admitCardLogValidation = {
  create: createAdmitCardLogValidationSchema,
  update: updateAdmitCardLogValidationSchema,
};
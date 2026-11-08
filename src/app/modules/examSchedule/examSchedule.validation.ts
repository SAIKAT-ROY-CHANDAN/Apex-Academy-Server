import z from 'zod';

const createExamScheduleValidationSchema = z.object({
  body: z.object({
    examConfigId: z.string({ required_error: 'Exam config ID is required' }),
    program_id: z.string().optional(),
    department_id: z.string().optional(),
    year: z.number().int().positive('Year must be positive').optional(),
    subjectId: z.string({ required_error: 'Subject ID is required' }),
    examTakenYear: z
      .number({ required_error: 'Exam taken year is required' })
      .int()
      .min(2000, 'Exam taken year must be a valid year').optional(),
    examDate: z.string({ required_error: 'Exam date is required' }),
    startTime: z.string({ required_error: 'Start time is required' }),
    endTime: z.string({ required_error: 'End time is required' }),
    durationMinutes: z.number({ required_error: 'Duration is required' }).positive('Duration must be positive'),
    fullMarks: z.number({ required_error: 'Full marks is required' }).positive('Full marks must be positive'),
    passMarks: z.number({ required_error: 'Pass marks is required' }).positive('Pass marks must be positive'),
  }),
});

const updateExamScheduleValidationSchema = z.object({
  body: z.object({
    examConfigId: z.string().optional(),
    program_id: z.string().optional(),
    department_id: z.string().optional(),
    year: z.number().int().positive('Year must be positive').optional(),
    subjectId: z.string().optional(),
    examTakenYear: z.number().int().min(2000, 'Exam taken year must be a valid year').optional(),
    examDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: z.number().positive('Duration must be positive').optional(),
    fullMarks: z.number().positive('Full marks must be positive').optional(),
    passMarks: z.number().positive('Pass marks must be positive').optional(),
  }),
});

export const examScheduleValidation = {
  create: createExamScheduleValidationSchema,
  update: updateExamScheduleValidationSchema,
};
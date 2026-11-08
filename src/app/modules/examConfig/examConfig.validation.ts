import z from 'zod';

const createExamConfigValidationSchema = z.object({
  body: z.object({
    academic_class_id: z.string({ required_error: 'Academic class ID is required' }),
    program_id: z.string().optional(),
    department_id: z.string().optional(),
    group: z.string().optional(),
    batch_id: z.string().optional(),
    sectionId: z.string().uuid('Section must be a valid UUID').optional(),
    exam_name: z.string({ required_error: 'Exam name is required' }).min(1, 'Exam name cannot be empty'),
    exam_date: z.string({ required_error: 'Exam date is required' }),
  }),
});

const updateExamConfigValidationSchema = z.object({
  body: z.object({
    academic_class_id: z.string().optional(),
    program_id: z.string().optional(),
    department_id: z.string().optional(),
    group: z.string().optional(),
    batch_id: z.string().optional(),
    sectionId: z.string().uuid('Section must be a valid UUID').optional(),
    exam_name: z.string().min(1, 'Exam name cannot be empty').optional(),
    exam_date: z.string().optional(),
    is_published: z.boolean().optional(),
  }),
});

export const examConfigValidation = {
  create: createExamConfigValidationSchema,
  update: updateExamConfigValidationSchema,
};
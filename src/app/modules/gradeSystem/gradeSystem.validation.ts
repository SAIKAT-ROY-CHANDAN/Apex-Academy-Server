import z from 'zod';

const createGradeSystemValidationSchema = z.object({
  body: z.object({
    grade_name: z.string({ required_error: 'Grade name is required' }).min(1, 'Grade name cannot be empty'),
    grade_point: z.number({ required_error: 'Grade point is required' }).min(0, 'Grade point must be non-negative'),
    mark_from: z.number({ required_error: 'Mark from is required' }).min(0, 'Mark from must be non-negative'),
    mark_to: z.number({ required_error: 'Mark to is required' }).min(0, 'Mark to must be non-negative'),
    remark: z.string().optional(),
  }),
});

const updateGradeSystemValidationSchema = z.object({
  body: z.object({
    grade_name: z.string().min(1, 'Grade name cannot be empty').optional(),
    grade_point: z.number().min(0, 'Grade point must be non-negative').optional(),
    mark_from: z.number().min(0, 'Mark from must be non-negative').optional(),
    mark_to: z.number().min(0, 'Mark to must be non-negative').optional(),
    remark: z.string().optional(),
  }),
});

export const gradeSystemValidation = {
  create: createGradeSystemValidationSchema,
  update: updateGradeSystemValidationSchema,
};
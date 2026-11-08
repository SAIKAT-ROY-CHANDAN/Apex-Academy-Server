import z from 'zod';

const createStudentExamResultValidationSchema = z.object({
  body: z.object({
    student_id: z.string({ required_error: 'Student ID is required' }),
    exam_schedule_id: z.string({ required_error: 'Exam schedule ID is required' }),
    obtained_marks: z.number({ required_error: 'Obtained marks is required' }).min(0, 'Obtained marks must be non-negative'),
    grade_id: z.string().optional(),
    institutionId: z.string().optional(),
  }),
});

const updateStudentExamResultValidationSchema = z.object({
  body: z.object({
    obtained_marks: z.number().min(0, 'Obtained marks must be non-negative').optional(),
    grade_id: z.string().optional(),
    institutionId: z.string().optional(),
  }),
});

export const studentExamResultValidation = {
  create: createStudentExamResultValidationSchema,
  update: updateStudentExamResultValidationSchema,
};
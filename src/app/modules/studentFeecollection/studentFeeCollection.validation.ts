import z from 'zod';

const createStudentFeeCollectionValidation = z.object({
  body: z.object({
    fee_type_id: z.string().uuid({ message: 'Invalid fee type ID' }),
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
  }),
});

const updateStudentFeeCollectionValidation = z.object({
  body: z.object({
    fee_type_id: z
      .string()
      .uuid({ message: 'Invalid fee type ID' })
      .optional(),
    student_id: z.string().uuid({ message: 'Invalid student ID' }).optional(),
  }),
});

export const StudentFeeCollectionValidation = {
  createStudentFeeCollectionValidation,
  updateStudentFeeCollectionValidation,
};
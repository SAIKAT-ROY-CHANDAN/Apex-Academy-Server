import z from 'zod';

const createStudentFeeValidation = z.object({
  body: z.object({
    student_enrollment_id: z
      .string()
      .uuid({ message: 'Invalid student enrollment ID' }),
    scholarship_amount: z.number().min(0).optional(),
    due_amount: z.number().min(0).optional(),
    paid_amount: z.number().min(0).optional(),
    feeItemId: z.string().uuid({ message: 'Invalid fee item ID' }).optional(),
  }),
});

const updateStudentFeeValidation = z.object({
  body: z.object({
    scholarship_amount: z.number().min(0).optional(),
    due_amount: z.number().min(0).optional(),
    paid_amount: z.number().min(0).optional(),
    feeItemId: z.string().uuid({ message: 'Invalid fee item ID' }).optional(),
  }),
});

export const StudentFeeValidation = {
  createStudentFeeValidation,
  updateStudentFeeValidation,
};
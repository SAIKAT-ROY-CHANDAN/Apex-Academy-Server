import z from 'zod';

const createStaffResignationValidation = z.object({
  body: z.object({
    staff_id: z
      .string({ required_error: 'Staff ID is required' })
      .uuid({ message: 'Invalid staff ID' }),

    reason: z.string({ required_error: 'Reason is required' }),

    resignation_date: z
      .string({ required_error: 'Resignation date is required' })
      .datetime({ message: 'Invalid resignation date format' }),
  }),
});

const updateStaffResignationValidation = z.object({
  body: z.object({
    reason: z.string().optional(),

    resignation_date: z
      .string()
      .datetime({ message: 'Invalid resignation date format' })
      .optional(),
  }),
});

export const StaffResignationValidation = {
  createStaffResignationValidation,
  updateStaffResignationValidation,
};

import z from 'zod';

const createOvertimeStaffConfigValidation = z.object({
  body: z.object({
    staff_id: z
      .string({ required_error: 'Staff ID is required' })
      .uuid({ message: 'Invalid staff ID' }),

    overtime_hourly_amount: z.coerce
      .number({
        required_error: 'Overtime hourly amount is required',
      })
      .positive('Overtime hourly amount must be greater than 0'),
  }),
});

const updateOvertimeStaffConfigValidation = z.object({
  body: z.object({
    overtime_hourly_amount: z.coerce
      .number()
      .positive('Overtime hourly amount must be greater than 0')
      .optional(),
  }),
});

export const OvertimeStaffConfigValidation = {
  createOvertimeStaffConfigValidation,
  updateOvertimeStaffConfigValidation,
};

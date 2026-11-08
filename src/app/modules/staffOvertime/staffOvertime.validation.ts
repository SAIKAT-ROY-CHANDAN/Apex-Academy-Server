import z from 'zod';

const createStaffOvertimeValidation = z.object({
  body: z.object({
    staff_id: z
      .string({ required_error: 'Staff ID is required' })
      .uuid({ message: 'Invalid staff ID' }),

    overtime_id: z
      .string()
      .uuid({ message: 'Invalid overtime config ID' })
      .optional(),

    start_time: z
      .string()
      .datetime({ message: 'Invalid start time format' })
      .optional(),
  }),
});

const endStaffOvertimeValidation = z.object({
  body: z.object({
    staff_id: z
      .string({ required_error: 'Staff ID is required' })
      .uuid({ message: 'Invalid staff ID' }),

    overtime_id: z
      .string()
      .uuid({ message: 'Invalid overtime record ID' })
      .optional(),

    end_time: z
      .string()
      .datetime({ message: 'Invalid end time format' })
      .optional(),
  }),
});

const todayStatusValidation = z.object({
  body: z.object({
    staff_ids: z
      .array(z.string().uuid({ message: 'Invalid staff ID' }))
      .min(1, { message: 'At least one staff ID is required' }),
  }),
});

const updateStaffOvertimeValidation = z.object({
  body: z.object({
    overtime_id: z
      .string()
      .uuid({ message: 'Invalid overtime config ID' })
      .optional(),

    overtime_hours: z.number().min(0).optional(),

    start_time: z
      .string()
      .datetime({ message: 'Invalid start time format' })
      .optional(),

    end_time: z
      .string()
      .datetime({ message: 'Invalid end time format' })
      .optional(),
  }),
});

export const StaffOvertimeValidation = {
  createStaffOvertimeValidation,
  endStaffOvertimeValidation,
  todayStatusValidation,
  updateStaffOvertimeValidation,
};

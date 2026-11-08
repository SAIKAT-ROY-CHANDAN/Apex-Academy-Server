import z from 'zod';

const createShiftValidation = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Shift name is required' })
      .min(1, { message: 'Shift name cannot be empty' }),
    start_time: z
      .string({ required_error: 'Shift start time is required' })
      .min(1, { message: 'Shift start time cannot be empty' }),
    end_time: z
      .string({ required_error: 'Shift end time is required' })
      .min(1, { message: 'Shift end time cannot be empty' }),
  }),
});

const updateShiftValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
  }),
});

export const ShiftValidation = {
  createShiftValidation,
  updateShiftValidation,
};

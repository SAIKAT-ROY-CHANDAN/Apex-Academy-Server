import z from 'zod';

const createHostelWithFloorsValidation = z.object({
  body: z.object({
    building_name: z
      .string()
      .min(1, { message: 'Building name is required' }),
    total_floors: z
      .number()
      .int()
      .positive({ message: 'Total floors must be a positive integer' }),
  }),
});

const assignRoomsToFloorValidation = z.object({
  body: z.object({
    hostel_floor_id: z
      .string()
      .uuid({ message: 'Invalid hostel floor ID' })
      .optional(),
    hostel_configuration_id: z
      .string()
      .uuid({ message: 'Invalid hostel configuration ID' })
      .optional(),
    floor_number: z
      .number()
      .int()
      .positive({ message: 'Floor number must be a positive integer' })
      .optional(),
    total_rooms: z
      .number()
      .int()
      .nonnegative({ message: 'Total rooms must be a non-negative integer' })
      .optional(),
    rooms: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          hostel_room_number: z
            .string()
            .min(1, { message: 'Room number is required' }),
          available_sits: z
            .number()
            .int()
            .nonnegative({ message: 'Available seats must be a non-negative integer' }),
        }),
      )
      .min(1, { message: 'At least one room is required' }),
  }),
});

const updateHostelConfigurationValidation = z.object({
  body: z.object({
    building_name: z
      .string()
      .min(1, { message: 'Building name is required' })
      .optional(),
    total_floors: z
      .number()
      .int()
      .positive({ message: 'Total floors must be a positive integer' })
      .optional(),
  }),
});

export const HostelConfigurationValidation = {
  createHostelWithFloorsValidation,
  assignRoomsToFloorValidation,
  updateHostelConfigurationValidation,
};

import z from 'zod';

const createHostelAllocationValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }),
    hostel_room_id: z.string().uuid({ message: 'Invalid hostel room ID' }),
    sit: z.string().trim().max(10).optional(),
    allocated_at: z.coerce.date().optional(),
  }),
});

const updateHostelAllocationValidation = z.object({
  body: z.object({
    student_id: z.string().uuid({ message: 'Invalid student ID' }).optional(),
    hostel_room_id: z.string().uuid({ message: 'Invalid hostel room ID' }).optional(),
    sit: z.string().trim().max(10).optional(),
    allocated_at: z.coerce.date().optional(),
  }),
});

export const HostelAllocationValidation = {
  createHostelAllocationValidation,
  updateHostelAllocationValidation,
};

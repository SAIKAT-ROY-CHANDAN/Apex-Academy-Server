import z from 'zod';

const createDesignationValidation = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Designation name is required' })
      .min(1, { message: 'Designation name cannot be empty' }),
  }),
});

const updateDesignationValidation = z.object({
  body: z.object({
    name: z.string().optional(),
  }),
});

export const DesignationValidation = {
  createDesignationValidation,
  updateDesignationValidation,
};

import z from 'zod';

const createDepartmentValidation = z.object({
  body: z.object({
    institution_id: z.string().uuid({ message: 'Invalid institution ID' }),
    department_name: z
      .string()
      .min(1, { message: 'Department name is required' }),
    program_id: z.string().uuid({ message: 'Invalid program ID' }),
  }),
});

const updateDepartmentValidation = z.object({
  body: z.object({
    institution_id: z
      .string()
      .uuid({ message: 'Invalid institution ID' })
      .optional(),
    department_name: z
      .string()
      .min(1, { message: 'Department name is required' })
      .optional(),
    program_id: z.string().uuid({ message: 'Invalid program ID' }).optional(),
  }),
});

export const DepartmentValidation = {
  createDepartmentValidation,
  updateDepartmentValidation,
};
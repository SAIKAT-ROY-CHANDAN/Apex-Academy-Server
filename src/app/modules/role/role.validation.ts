import z from 'zod';

const roleValidationSchema = z.object({
  body: z.object({
    role_name: z.string({}).min(1, 'Role name is required'),
    permissions: z
      .array(z.string())
      .min(1, 'At least one permission is required'),
  }),
});

export const roleValidation = {
  createRole: roleValidationSchema,
};

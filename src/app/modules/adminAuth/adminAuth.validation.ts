import z from 'zod';
import {
  DayOfWeek,
  InstitutionType,
  SystemModule,
} from '../../../../generated/prisma/enums';

const createAdminAuthValidation = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    roleId: z.string().min(1, { message: 'Role ID is required' }),
  }),
});

const loginAdminAuthValidation = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

const superAdminInstitutionConfigValidation = z.object({
  body: z.object({
    mode: z.enum([InstitutionType.SCHOOL, InstitutionType.COLLEGE_UNIVERSITY], {
      message: 'Invalid institution type',
    }),
    name: z.string().min(1, { message: 'Institution name is required' }),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    color_scheme: z.string().optional(),
    weekend_days: z.array(z.nativeEnum(DayOfWeek)).optional(),
    active_modules: z.array(z.nativeEnum(SystemModule)).optional(),
  }),
});

export const AdminAuthValidation = {
  createAdminAuthValidation,
  loginAdminAuthValidation,
  superAdminInstitutionConfigValidation,
};

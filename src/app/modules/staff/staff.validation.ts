import z from 'zod';
import {
  AcademicQualification,
  Gender,
  StaffType,
} from '../../../../generated/prisma/enums';

const createStaffValidation = z.object({
  body: z.object({
    full_name: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Full name not be empty'),

    email: z.string().email({ message: 'Invalid email address' }).optional(),

    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number must be at most 15 characters'),

    bkash_number: z.string().optional(),
    address: z.string().optional(),

    gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.OTHER], {
      message: 'Invalid gender',
    }),

    staff_type: z.nativeEnum(StaffType, {
      message: 'Invalid staff type',
    }),

    designation_id: z
      .string({ required_error: 'Designation ID is required' })
      .uuid({ message: 'Invalid designation ID' }),

    academic_qualification: z.enum([
      AcademicQualification.DEGREE_PASS,
      AcademicQualification.HSC,
      AcademicQualification.DIPLOMA,
      AcademicQualification.HONORS,
      AcademicQualification.MASTERS,
      AcademicQualification.PHD,
      AcademicQualification.SSC,
    ]),

    academic_document: z.string().optional(),
    previous_institution_resign_letter: z.string().optional(),
    nid_front: z.string().optional(),
    nid_back: z.string().optional(),
    photo: z.string().optional(),

    customSalaries: z.array(
      z.object({
        salary_component: z.string({
          required_error: 'Salary component is required',
        }),
        salary_amount: z
          .string()
          .regex(/^\d+\.?\d*$/, 'Invalid salary amount')
          .transform((val) => Number(val))
          .refine((val) => val > 0, 'Salary amount must be a positive number'),
      }),
    ),
  }),
});

const updateStaffValidation = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Full name not be empty').optional(),

    email: z.string().email({ message: 'Invalid email address' }).optional(),

    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number must be at most 15 characters')
      .optional(),

    bkash_number: z.string().optional(),
    address: z.string().optional(),

    gender: z
      .enum([Gender.FEMALE, Gender.MALE, Gender.OTHER], {
        message: 'Invalid gender',
      })
      .optional(),

    staff_type: z
      .nativeEnum(StaffType, {
        message: 'Invalid staff type',
      })
      .optional(),

    designation_id: z
      .string()
      .uuid({ message: 'Invalid designation ID' })
      .optional(),

    academic_qualification: z
      .enum([
        AcademicQualification.DEGREE_PASS,
        AcademicQualification.HSC,
        AcademicQualification.DIPLOMA,
        AcademicQualification.HONORS,
        AcademicQualification.MASTERS,
        AcademicQualification.PHD,
        AcademicQualification.SSC,
      ])
      .optional(),

    academic_document: z.string().optional(),
    previous_institution_resign_letter: z.string().optional(),
    nid_front: z.string().optional(),
    nid_back: z.string().optional(),
    photo: z.string().optional(),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional(),

    customSalaries: z
      .array(
        z.object({
          salary_component: z.string({
            required_error: 'Salary component is required',
          }),
          salary_amount: z
            .string()
            .regex(/^\d+\.?\d*$/, 'Invalid salary amount')
            .transform((val) => Number(val))
            .refine(
              (val) => val > 0,
              'Salary amount must be a positive number',
            ),
        }),
      )
      .optional(),
  }),
});

export const StaffValidation = {
  createStaffValidation,
  updateStaffValidation,
};

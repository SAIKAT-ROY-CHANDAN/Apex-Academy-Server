import z from 'zod';
import {
  AcademicQualification,
  Gender,
  TeacherType,
  AdministrativePosition,
} from '../../../../generated/prisma/enums';

const createTeacherValidation = z.object({
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

    last_qualification: z.enum([
      AcademicQualification.DEGREE_PASS,
      AcademicQualification.HSC,
      AcademicQualification.DIPLOMA,
      AcademicQualification.HONORS,
      AcademicQualification.MASTERS,
      AcademicQualification.PHD,
      AcademicQualification.SSC,
    ]),

    nid_front: z.string().optional(),
    nid_back: z.string().optional(),

    shift_id: z.string().uuid().optional(),
    department_id: z.string().uuid().optional(),
    subject_id: z.string().uuid().optional(),

    teacher_type: z.enum(
      [
        TeacherType.ADHOC,
        TeacherType.PERMANENT,
        TeacherType.REGULAR,
        TeacherType.GUEST,
        TeacherType.PROVISIONAL,
        TeacherType.SUBSTITUTE,
        TeacherType.PART_TIME,
        TeacherType.OTHERS,
      ],
      {
        message: 'Invalid teacher type',
      },
    ),

    administrative_position: z
      .enum(
        [
          AdministrativePosition.PRINCIPAL,
          AdministrativePosition.VICE_PRINCIPAL,
          AdministrativePosition.HEAD_OF_DEPARTMENT,
          AdministrativePosition.ASSISTANT_HEAD_OF_DEPARTMENT,
          AdministrativePosition.DEAN,
          AdministrativePosition.ASSISTANT_DEAN,
          AdministrativePosition.COORDINATOR,
          AdministrativePosition.DIRECTOR,
          AdministrativePosition.NONE,
        ],
        {
          message: 'Invalid administrative position',
        },
      )
      .optional(),

    designation_id: z
      .string({ required_error: 'Designation ID is required' })
      .uuid({ message: 'Invalid designation ID' }),

    customSalaries: z
      .array(
        z.object({
          salary_component: z.string({
            required_error: 'Salary component is required',
          }),
          salary_amount: z
            .string({
              required_error: 'Salary amount is required',
            })
            .regex(/^\d+\.?\d*$/, 'Invalid salary amount')
            .transform((val) => Number(val))
            .refine(
              (val) => val > 0,
              'Salary amount must be a positive number',
            ),
        }),
      )
      .optional(),

    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

const loginTeacherValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' }),

    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

const updateTeacherValidation = z.object({
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

    last_qualification: z
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

    shift_id: z.string().uuid().optional(),
    department_id: z.string().uuid().optional(),
    subject_id: z.string().uuid().optional(),

    teacher_type: z
      .enum(
        [
          TeacherType.PERMANENT,
          TeacherType.REGULAR,
          TeacherType.ADHOC,
          TeacherType.GUEST,
          TeacherType.PROVISIONAL,
          TeacherType.SUBSTITUTE,
          TeacherType.PART_TIME,
          TeacherType.OTHERS,
        ],
        {
          message: 'Invalid teacher type',
        },
      )
      .optional(),

    administrative_position: z
      .enum(
        [
          AdministrativePosition.PRINCIPAL,
          AdministrativePosition.VICE_PRINCIPAL,
          AdministrativePosition.HEAD_OF_DEPARTMENT,
          AdministrativePosition.ASSISTANT_HEAD_OF_DEPARTMENT,
          AdministrativePosition.DEAN,
          AdministrativePosition.ASSISTANT_DEAN,
          AdministrativePosition.COORDINATOR,
          AdministrativePosition.DIRECTOR,
          AdministrativePosition.NONE,
        ],
        {
          message: 'Invalid administrative position',
        },
      )
      .optional(),

    designation_id: z
      .string()
      .uuid({ message: 'Invalid designation ID' })
      .optional(),
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
            .string({
              required_error: 'Salary amount is required',
            })
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

export const TeacherValidation = {
  createTeacherValidation,
  updateTeacherValidation,
  loginTeacherValidation,
};

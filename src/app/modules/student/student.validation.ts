import z from 'zod';
import {
  EnrollmentStatus,
  EnrollmentType,
  Gender,
  Month,
  PaymentMethod,
  Religion,
} from '../../../../generated/prisma/enums';

const studentEnrollmentSchema = z.object({
  academic_session_id: z
    .string()
    .uuid({ message: 'Invalid academic session ID' }),
  academic_class_id: z.string().uuid({ message: 'Invalid academic class ID' }),
  academic_section_id: z
    .string()
    .uuid({ message: 'Invalid academic section ID' })
    .optional(),
  batch_id: z.string().uuid({ message: 'Invalid batch ID' }),
  shift_id: z.string().uuid({ message: 'Invalid shift ID' }).optional(),
  roll_number: z.string().max(20).optional(),
  registration_number: z
    .string()
    .min(1, { message: 'Registration number is required' })
    .max(20),
  password: z
    .string()
    .min(3, { message: 'Password must be at least 6 characters long' })
    .optional(),
  merit_position: z.number().int().optional(),
  enrollment_status: z
    .nativeEnum(EnrollmentStatus, { message: 'Invalid enrollment status' })
    .optional(),
  enrollment_type: z
    .nativeEnum(EnrollmentType, { message: 'Invalid enrollment type' })
    .optional(),
  // legacy alias — accepted but not persisted directly
  promotion_status: z
    .nativeEnum(EnrollmentStatus, { message: 'Invalid promotion status' })
    .optional(),
});

const studentFeeCollectionItemSchema = z.object({
  fee_item_id: z.string().uuid({ message: 'Invalid fee item ID' }),
  fee_month: z.nativeEnum(Month).nullable().optional(),
  fee_year: z.number().int().min(2000).max(2100).nullable().optional(),
  discount_amount: z.number().optional(),
  paid_amount: z.number().optional(),
  line_total_amount: z.number().optional(),
  fine_amount: z.number().optional(),
  payment_method: z.nativeEnum(PaymentMethod).optional(),
  payment_note: z.string().max(100).optional(),
});

const studentFeeCollectionSchema = z.object({
  fee_type_id: z.string().uuid({ message: 'Invalid fee type ID' }),
  payment_method: z.nativeEnum(PaymentMethod).optional(),
  payment_note: z.string().max(100).optional(),
  items: z.array(studentFeeCollectionItemSchema).optional(),
});

const hostelAllocationSchema = z.object({
  hostel_room_id: z.string().uuid({ message: 'Invalid hostel room ID' }),
  allocated_at: z.coerce.date({ message: 'Invalid allocated date' }).optional(),
});

const hostelFeeCollectionItemSchema = z.object({
  item_name: z.string().min(1, { message: 'Item name is required' }),
  item_amount: z.number(),
});

const mealCollectionSchema = z.object({
  meal_count: z.number().int(),
  meal_rate: z.number(),
  total_amount: z.number(),
});

const hostelFeeCollectionSchema = z.object({
  collection_date: z.coerce.date({ message: 'Invalid collection date' }),
  total_amount: z.number(),
  paid_amount: z.number(),
  due_amount: z.number(),
  items: z.array(hostelFeeCollectionItemSchema).optional(),
  mealCollection: mealCollectionSchema.optional(),
});

const createStudentValidation = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    father_name: z.string().min(1, { message: "Father's name is required" }),
    mother_name: z.string().min(1, { message: "Mother's name is required" }),
    religion: z
      .nativeEnum(Religion, { message: 'Invalid religion' })
      .optional(),
    is_residential: z.boolean().optional(),
    nid_no: z.string().optional(),
    gender: z.nativeEnum(Gender, { message: 'Invalid gender' }),
    student_phone: z.string().max(20).optional(),
    father_phone: z
      .string()
      .min(1, { message: "Father's phone is required" })
      .max(20),
    mother_phone: z.string().max(20).optional(),
    village_road: z.string().optional(),
    post_office: z.string().optional(),
    sub_district: z.string().min(1, { message: 'Sub-district is required' }),
    district: z.string().min(1, { message: 'District is required' }),
    email: z.string().email({ message: 'Invalid email address' }).optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    is_active: z.boolean().optional(),
    enrollment: studentEnrollmentSchema.optional(),
    studentFeeCollection: studentFeeCollectionSchema.optional(),
    hostelAllocation: hostelAllocationSchema.optional(),
    hostelFeeCollection: hostelFeeCollectionSchema.optional(),
  }),
});

const registerStudentValidation = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    father_name: z.string().min(1, { message: "Father's name is required" }),
    mother_name: z.string().min(1, { message: "Mother's name is required" }),
    religion: z
      .nativeEnum(Religion, { message: 'Invalid religion' })
      .optional(),
    is_residential: z.boolean().optional(),
    nid_no: z.string().optional(),
    gender: z.nativeEnum(Gender, { message: 'Invalid gender' }),
    student_phone: z.string().max(20).optional(),
    father_phone: z
      .string()
      .min(1, { message: "Father's phone is required" })
      .max(20),
    mother_phone: z.string().max(20).optional(),
    village_road: z.string().optional(),
    post_office: z.string().optional(),
    sub_district: z.string().min(1, { message: 'Sub-district is required' }),
    district: z.string().min(1, { message: 'District is required' }),
    email: z
      .string()
      .email({ message: 'Invalid email address' })
      .min(1, { message: 'Email is required' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

const updateStudentValidation = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    father_name: z
      .string()
      .min(1, { message: "Father's name is required" })
      .optional(),
    mother_name: z
      .string()
      .min(1, { message: "Mother's name is required" })
      .optional(),
    religion: z
      .nativeEnum(Religion, { message: 'Invalid religion' })
      .optional(),
    is_residential: z.boolean().optional(),
    nid_no: z.string().optional(),
    gender: z.nativeEnum(Gender, { message: 'Invalid gender' }).optional(),
    student_phone: z.string().max(20).optional(),
    father_phone: z.string().max(20).optional(),
    mother_phone: z.string().max(20).optional(),
    village_road: z.string().optional(),
    post_office: z.string().optional(),
    sub_district: z
      .string()
      .min(1, { message: 'Sub-district is required' })
      .optional(),
    district: z.string().min(1, { message: 'District is required' }).optional(),
    email: z.string().email({ message: 'Invalid email address' }).optional(),
    is_active: z.boolean().optional(),
  }),
});

const loginStudentValidation = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

const searchStudentByEmailValidation = z.object({
  query: z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address' }),
  }),
});

const sendClassMessageValidation = z.object({
  body: z.object({
    academic_class_id: z
      .string()
      .uuid({ message: 'Invalid academic class ID' }),
    batch_id: z.string().uuid({ message: 'Invalid batch ID' }).optional(),
    message: z
      .string()
      .trim()
      .min(1, { message: 'Message is required' })
      .max(1000, { message: 'Message must not exceed 1000 characters' }),
  }),
});

export const StudentValidation = {
  createStudentValidation,
  registerStudentValidation,
  updateStudentValidation,
  loginStudentValidation,
  searchStudentByEmailValidation,
  sendClassMessageValidation,
  bkashInitiateValidation: z.object({
    body: z.object({
      student_id: z.string().uuid({ message: 'Invalid student ID' }),
    }),
  }),
  bkashExecuteValidation: z.object({
    body: z.object({
      paymentID: z.string().min(1, { message: 'Payment ID is required' }),
    }),
  }),
};

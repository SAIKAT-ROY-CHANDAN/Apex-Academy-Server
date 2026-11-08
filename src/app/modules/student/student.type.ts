import {
  EnrollmentStatus,
  EnrollmentType,
  Gender,
  Month,
  PaymentMethod,
  Religion,
} from '../../../../generated/prisma/enums';

export interface IStudentFeeCollectionItemCreate {
  fee_item_id: string;
  fee_month?: Month | null;
  fee_year?: number | null;
  discount_amount?: number;
  paid_amount?: number;
  line_total_amount?: number;
  fine_amount?: number;
  payment_method?: PaymentMethod;
  payment_note?: string;
}

export interface IStudentFeeCollectionCreate {
  fee_type_id: string;
  payment_method?: PaymentMethod;
  payment_note?: string;
  items?: IStudentFeeCollectionItemCreate[];
}

export interface IHostelAllocationCreate {
  hostel_room_id: string;
  allocated_at?: Date;
}

export interface IHostelFeeCollectionItemCreate {
  item_name: string;
  item_amount: number;
}

export interface IMealCollectionCreate {
  meal_count: number;
  meal_rate: number;
  total_amount: number;
}

export interface IHostelFeeCollectionCreate {
  collection_date: Date;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  items?: IHostelFeeCollectionItemCreate[];
  mealCollection?: IMealCollectionCreate;
}

export interface IStudentCreate {
  name: string;
  father_name: string;
  mother_name: string;
  religion?: Religion;
  is_residential?: boolean;
  nid_no?: string;
  password: string;
  gender: Gender;
  student_phone?: string;
  father_phone: string;
  mother_phone?: string;
  photo?: string;
  village_road?: string;
  post_office?: string;
  sub_district: string;
  district: string;
  email?: string;
  is_active?: boolean;
  enrollment?: {
    academic_session_id: string;
    academic_class_id: string;
    academic_section_id?: string;
    batch_id: string;
    shift_id?: string;
    roll_number?: string;
    registration_number: string;
    password?: string;
    merit_position?: number;
    enrollment_status?: EnrollmentStatus;
    enrollment_type?: EnrollmentType;
    promotion_status?: EnrollmentStatus;
  };
  studentFeeCollection?: IStudentFeeCollectionCreate;
  hostelAllocation?: IHostelAllocationCreate;
  hostelFeeCollection?: IHostelFeeCollectionCreate;
}

export interface IStudentRegister {
  name: string;
  father_name: string;
  mother_name: string;
  religion?: Religion;
  is_residential?: boolean;
  nid_no?: string;
  gender: Gender;
  student_phone?: string;
  father_phone: string;
  mother_phone?: string;
  photo?: string;
  village_road?: string;
  post_office?: string;
  sub_district: string;
  district: string;
  email: string;
  password: string;
}

export interface IStudentUpdate {
  name?: string;
  father_name?: string;
  mother_name?: string;
  religion?: Religion;
  is_residential?: boolean;
  nid_no?: string;
  gender?: Gender;
  student_phone?: string;
  father_phone?: string;
  mother_phone?: string;
  photo?: string;
  village_road?: string;
  post_office?: string;
  sub_district?: string;
  district?: string;
  email?: string;
  is_active?: boolean;
}
export interface IStudentAuthLogin {
  email: string;
  password: string;
}

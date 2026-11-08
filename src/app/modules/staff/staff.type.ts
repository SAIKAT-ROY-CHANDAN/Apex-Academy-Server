import type {
  AcademicQualification,
  Gender,
  StaffType,
} from '../../../../generated/prisma/enums';

export type CustomSalaryInput = {
  salary_component: string;
  salary_amount: number;
};

export type CreateStaffInput = {
  full_name: string;
  gender: Gender;
  staff_type: StaffType;
  designation_id: string;
  phone: string;
  bkash_number?: string;
  email?: string;
  academic_qualification: AcademicQualification;
  academic_document?: string;
  previous_institution_resign_letter?: string;
  nid_front?: string;
  nid_back?: string;
  address?: string;
  photo?: string;
  customSalaries?: CustomSalaryInput[];
};

export type UpdateStaffInput = {
  full_name?: string;
  gender?: Gender;
  staff_type?: StaffType;
  designation_id?: string;
  phone?: string;
  bkash_number?: string;
  email?: string;
  academic_qualification?: AcademicQualification;
  academic_document?: string;
  previous_institution_resign_letter?: string;
  nid_front?: string;
  nid_back?: string;
  address?: string;
  photo?: string;
  password?: string;
  customSalaries?: CustomSalaryInput[];
};

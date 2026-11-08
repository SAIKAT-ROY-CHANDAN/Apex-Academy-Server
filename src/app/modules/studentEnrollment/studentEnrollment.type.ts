import { EnrollmentStatus, EnrollmentType } from '../../../../generated/prisma/enums';

export interface IStudentEnrollmentCreate {
  student_id: string;
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
  is_primary?: boolean;
  subject_fail_count?: number;
}

export interface IStudentEnrollmentUpdate {
  student_id?: string;
  academic_session_id?: string;
  academic_class_id?: string;
  academic_section_id?: string;
  batch_id?: string;
  shift_id?: string;
  roll_number?: string;
  registration_number?: string;
  password?: string;
  merit_position?: number;
  enrollment_status?: EnrollmentStatus;
  enrollment_type?: EnrollmentType;
  promotion_status?: EnrollmentStatus;
  is_primary?: boolean;
  subject_fail_count?: number;
}

// Matches `studentPromotionValidation` in studentEnrollment.validation.ts
export interface IStudentPromotionCreate {
  student_id: string;
  from_academic_class_id: string;
  to_academic_class_id: string;
  promotion_date: string; 
  promoted_by?: string;
  academic_section_id?: string;
  academic_session_id?: string;
  batch_id?: string;
  shift_id?: string;
  roll_number?: string;
  registration_number?: string;
  remarks?: string;
}
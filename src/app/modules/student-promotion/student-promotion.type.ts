import {
  EnrollmentStatus,
  EnrollmentType,
} from '../../../../generated/prisma/enums';

export interface IStudentPromotion {
  student_id: string;
  enrollment_id: string;
  academic_session_id: string;
  academic_class_id: string;
  academic_section_id?: string;
  batch_id: string;
  shift_id?: string;
  roll_number?: string;
  registration_number?: string;
  enrollment_status: EnrollmentStatus;
  enrollment_type: EnrollmentType;
  next_enrollment_type: EnrollmentType;
  next_enrollment_status: EnrollmentStatus;
  subject_fail_count?: number;
}

export interface IBulkStudentPromotion {
  enrollment_ids: string[];
  academic_session_id: string;
  academic_class_id: string;
  academic_section_id?: string;
  batch_id: string;
  shift_id?: string;
  enrollment_status: EnrollmentStatus;
  enrollment_type?: EnrollmentType;
  next_enrollment_type: EnrollmentType;
  next_enrollment_status?: EnrollmentStatus;
  subject_fail_count?: number;
}
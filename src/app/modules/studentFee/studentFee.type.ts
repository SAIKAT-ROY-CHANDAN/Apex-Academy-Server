export interface IStudentFeeCreate {
  student_enrollment_id: string;
  scholarship_amount?: number;
  due_amount?: number;
  paid_amount?: number;
  feeItemId?: string;
}

export interface IStudentFeeUpdate {
  scholarship_amount?: number;
  due_amount?: number;
  paid_amount?: number;
  feeItemId?: string;
}

export interface IStudentFeeDueResponse {
  id: string;
  student_enrollment_id: string;
  student_name: string;
  father_name: string;
  mother_name?: string;
  gender?: string;
  class_name?: string;
  section_name?: string;
  batch_name?: string;
  academic_session?: string;
  due_amount: number;
  scholarship_amount?: number;
  paid_amount?: number;
  fee_item_name?: string;
  status?: string;
}
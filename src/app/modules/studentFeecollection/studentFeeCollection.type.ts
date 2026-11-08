export interface IStudentFeeCollectionCreate {
  fee_type_id: string;
  student_id: string;
}

export interface IStudentFeeCollectionUpdate {
  fee_type_id?: string;
  student_id?: string;
}
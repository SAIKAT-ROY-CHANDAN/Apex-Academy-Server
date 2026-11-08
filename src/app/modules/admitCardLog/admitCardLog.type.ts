export interface IAdmitCardLogCreate {
  student_id: string;
  exam_config_id: string;
  status?: string;
}

export interface IAdmitCardLogUpdate {
  status?: string;
}
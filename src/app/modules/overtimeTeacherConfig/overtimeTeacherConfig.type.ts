export type CreateOvertimeTeacherConfigInput = {
  teacher_id: string;
  overtime_hourly_amount: number;
};

export type UpdateOvertimeTeacherConfigInput = {
  overtime_hourly_amount?: number;
};
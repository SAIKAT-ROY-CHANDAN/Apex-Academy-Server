export type CreateTeacherOvertimeInput = {
  teacher_id: string;
  start_time?: Date | string;
};

export type EndTeacherOvertimeInput = {
  teacher_id: string;
  overtime_id?: string;
  end_time?: Date | string;
};

export type UpdateTeacherOvertimeInput = {
  overtime_hours?: number;
  start_time?: Date | string;
  end_time?: Date | string;
};

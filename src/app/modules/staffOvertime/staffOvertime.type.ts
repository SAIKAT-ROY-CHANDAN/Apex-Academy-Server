export type CreateStaffOvertimeInput = {
  staff_id: string;
  overtime_id?: string;
  start_time?: Date | string;
};

export type EndStaffOvertimeInput = {
  staff_id: string;
  overtime_id?: string;
  end_time?: Date | string;
};

export type UpdateStaffOvertimeInput = {
  overtime_id?: string;
  overtime_hours?: number;
  start_time?: Date | string;
  end_time?: Date | string;
};

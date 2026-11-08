export type CreateOvertimeStaffConfigInput = {
  staff_id: string;
  overtime_hourly_amount: number;
};

export type UpdateOvertimeStaffConfigInput = {
  overtime_hourly_amount?: number;
};

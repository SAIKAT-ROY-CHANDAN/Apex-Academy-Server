export type CreateStaffResignationInput = {
  staff_id: string;
  reason: string;
  resignation_date: string;
};

export type UpdateStaffResignationInput = {
  reason?: string;
  resignation_date?: string;
};

export type CreateTeacherResignationInput = {
  teacher_id: string;
  reason: string;
  resignation_date: string;
};

export type UpdateTeacherResignationInput = {
  reason?: string;
  resignation_date?: string;
};
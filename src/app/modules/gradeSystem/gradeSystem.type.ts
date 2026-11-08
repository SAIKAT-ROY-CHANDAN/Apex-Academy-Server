export type TGradeSystemPayload = {
  grade_name: string;
  grade_point: number;
  mark_from: number;
  mark_to: number;
  remark?: string;
};

export type TGradeSystemUpdatePayload = {
  grade_name?: string;
  grade_point?: number;
  mark_from?: number;
  mark_to?: number;
  remark?: string;
};
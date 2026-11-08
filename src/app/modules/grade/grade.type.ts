export type TGradeRange = {
  minPercent: number;
  maxPercent: number;
  letterGrade: string;
  gradePoint: number;
  institutionId?: string | null;
};

export type TStudentResult = {
  obtainMarks: number;
  totalMarks: number;
  percentage: number;
  letterGrade: string;
  gradePoint: number;
  status: "Passed" | "Failed";
};

export type TGradeScalePayload = {
  minPercent: number;
  maxPercent: number;
  letterGrade: string;
  gradePoint: number;
  institutionId?: string | null;
};

export type TGradeScaleUpdatePayload = Partial<TGradeScalePayload>;

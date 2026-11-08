export interface IStudentExamResultCreate {
  student_id: string;
  exam_schedule_id: string;
  obtained_marks: number;
  // grade_id is now optional – if omitted backend auto-computes via GradeScale/percentage
  // Kept nullable for backward compat; do NOT drop this column until migration/backfill decided
  grade_id?: string;
  letterGrade?: string | null;
  // optional institutionId to scope grade lookup (passed through to grade service)
  institutionId?: string;
}

export interface IStudentExamResultUpdate {
  obtained_marks?: number;
  // same flag: this FK is legacy (points to GradeSystem). GradeScale is new source of truth.
  grade_id?: string;
  letterGrade?: string | null;
}
export interface IExamScheduleCreate {
  examConfigId: string;
  program_id?: string;
  department_id?: string;
  year?: number;
  subjectId: string;
  examTakenYear?: number;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  fullMarks: number;
  passMarks: number;
}

export interface IExamScheduleUpdate {
  examConfigId?: string;
  program_id?: string;
  department_id?: string;
  year?: number;
  subjectId?: string;
  examTakenYear?: number;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  fullMarks?: number;
  passMarks?: number;
}
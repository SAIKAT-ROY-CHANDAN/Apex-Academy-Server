export type TDayOfWeek =
  | 'SATURDAY'
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY';

export interface IClassRoutineItemCreate {
  period_no: number;
  day: TDayOfWeek;
  subject_id: string;
  teacher_id: string;
  /**
   * Optional room / lab for this single slot ("101", "B-12", "Lab 2").
   * Empty string is normalised to null before it reaches Prisma.
   */
  roomNo?: string | null;
}

/** A room number as it is persisted: trimmed, or null when unset. */
export type TRoomNo = string | null;

export interface IClassRoutineCreate {
  academic_class_id: string;
  academic_section_id?: string;
  batch_id?: string;
  shift_id?: string;
  classRoutineItems: IClassRoutineItemCreate[];
}

export interface IClassRoutineUpdate {
  academic_class_id?: string;
  academic_section_id?: string;
  batch_id?: string;
  shift_id?: string;
  classRoutineItems?: IClassRoutineItemCreate[];
}
export interface IAcademicClassSubjectCreate {
  class_id: string;
  subject_id: string;
}

export interface IAcademicClassSubjectUpdate {
  class_id?: string;
  subject_id?: string;
}
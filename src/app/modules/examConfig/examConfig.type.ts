export interface IExamConfigCreate {
  academic_class_id: string;
  program_id?: string;
  department_id?: string;
  group?: string;
  batch_id?: string;
  sectionId?: string;
  exam_name: string;
  exam_date: string;
}

export interface IExamConfigUpdate {
  academic_class_id?: string;
  program_id?: string;
  department_id?: string;
  group?: string;
  batch_id?: string;
  sectionId?: string;
  exam_name?: string;
  exam_date?: string;
  is_published?: boolean;
}

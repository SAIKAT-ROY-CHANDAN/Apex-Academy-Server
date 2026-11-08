export type CreateHomeworkInput = {
  title: string;
  description: string;
  class_id: string;
  section_id?: string;
  subject_id: string;
  teacher_id: string;
  due_date: string;
};

export type UpdateHomeworkInput = {
  title?: string;
  description?: string;
  class_id?: string;
  section_id?: string;
  subject_id?: string;
  teacher_id?: string;
  due_date?: string;
};
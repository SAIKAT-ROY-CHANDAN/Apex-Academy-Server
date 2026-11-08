export interface ISubjectCreate {
  class_id: string;
  subjects: string[];
}

export interface ISubjectUpdate {
  name?: string;
  class_id?: string;
}
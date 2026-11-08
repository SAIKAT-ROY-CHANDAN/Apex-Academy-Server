export interface IAcademicSectionCreate {
  section_name: string;
  class_id: string;
}

export interface IAcademicSectionUpdate {
  section_name?: string;
  class_id?: string;
}
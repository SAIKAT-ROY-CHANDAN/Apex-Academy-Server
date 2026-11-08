export interface IAcademicSyllabusCreate {
  title: string;
  syllabusUrl?: string | null;
}

export interface IAcademicSyllabusUpdate {
  title?: string;
  syllabusUrl?: string | null;
}

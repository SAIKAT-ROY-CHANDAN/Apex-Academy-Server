export interface IAcademicTuitionCreate {
  title: string;
  tuitionUrl?: string | null;
  tuitionAmount?: number | null;
}

export interface IAcademicTuitionUpdate {
  title?: string;
  tuitionUrl?: string | null;
  tuitionAmount?: number | null;
}

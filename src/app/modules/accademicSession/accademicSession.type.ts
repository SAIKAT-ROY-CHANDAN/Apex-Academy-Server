export interface IAcademicSessionCreate {
  institution_id: string;
  session_name: string;
}

export interface IAcademicSessionUpdate {
  institution_id?: string;
  session_name?: string;
}
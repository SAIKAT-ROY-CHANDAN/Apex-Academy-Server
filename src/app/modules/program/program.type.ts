export interface IProgramCreate {
  institution_id: string;
  program_name: string;
  duration_years?: number;
}

export interface IProgramUpdate {
  institution_id?: string;
  program_name?: string;
  duration_years?: number;
}
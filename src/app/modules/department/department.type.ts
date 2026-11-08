export interface IDepartmentCreate {
  institution_id: string;
  department_name: string;
  program_id: string;
}

export interface IDepartmentUpdate {
  institution_id?: string;
  department_name?: string;
  program_id?: string;
}
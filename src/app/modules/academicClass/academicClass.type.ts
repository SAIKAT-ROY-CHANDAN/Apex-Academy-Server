import { StudentGroup } from '../../../../generated/prisma/enums';

export interface IAcademicClassCreate {
  program_id?: string;
  department_id?: string;
  class_name: string;
  class_level?: number;
  year_level?: number;
  group?: StudentGroup;
}

export interface IAcademicClassUpdate {
  program_id?: string;
  department_id?: string;
  class_name?: string;
  class_level?: number;
  year_level?: number;
  group?: StudentGroup;
}
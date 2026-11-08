import { GenerateType } from '../../../../generated/prisma/enums';

export interface IIDCardGenerateLogCreate {
  student_id: string;
  generated_at?: Date;
  generate_type: GenerateType;
}

export interface IIDCardGenerateLogUpdate {
  student_id?: string;
  generated_at?: Date;
  generate_type?: GenerateType;
}
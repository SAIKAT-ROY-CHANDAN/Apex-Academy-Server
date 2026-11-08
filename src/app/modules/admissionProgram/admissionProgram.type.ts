import { AdmissionProgramType } from '../../../../generated/prisma/enums';

export interface IAdmissionProgramCreate {
  title: string;
  type: AdmissionProgramType;
  imageUrl?: string | null;
  description?: string | null;
  requirements?: string | null;
  courseList?: string | null;
  isActive?: boolean;
  order?: number;
}

export interface IAdmissionProgramUpdate {
  title?: string;
  type?: AdmissionProgramType;
  imageUrl?: string | null;
  description?: string | null;
  requirements?: string | null;
  courseList?: string | null;
  isActive?: boolean;
  order?: number;
}
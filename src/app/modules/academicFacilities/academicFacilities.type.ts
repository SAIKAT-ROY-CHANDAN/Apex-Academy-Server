import { AcademicTuitionType } from '../../../../generated/prisma/enums';

export interface IAcademicFacilitiesCreate {
  name: string;
  main_image_url?: string | null;
  sub_one_image_url?: string | null;
  sub_two_image_url?: string | null;
  description?: string | null;
  facilities_type?: AcademicTuitionType;
}

export interface IAcademicFacilitiesUpdate {
  name?: string;
  main_image_url?: string | null;
  sub_one_image_url?: string | null;
  sub_two_image_url?: string | null;
  description?: string | null;
  facilities_type?: AcademicTuitionType;
}

export interface ICareerDevelopmentsCreate {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  order?: number;
}

export interface ICareerDevelopmentsUpdate {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  order?: number;
}
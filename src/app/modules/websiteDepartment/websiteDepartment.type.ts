export interface IWebsiteDepartmentCreate {
  name?: string;
  imageUrl?: string | null;
  details?: string;
  courseList?: string[];
}

export interface IWebsiteDepartmentUpdate {
  name?: string;
  imageUrl?: string | null;
  details?: string;
  courseList?: string[];
}

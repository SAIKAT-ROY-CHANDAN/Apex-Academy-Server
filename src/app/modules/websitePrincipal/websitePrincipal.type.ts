export interface IWebsitePrincipalCreate {
  name: string;
  photoUrl?: string | null;
  fromDate: string | Date;
  toDate: string | Date;
}

export interface IWebsitePrincipalUpdate {
  name?: string;
  photoUrl?: string | null;
  fromDate?: string | Date;
  toDate?: string | Date;
}

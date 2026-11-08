export interface IJobApplicationCreate {
  circularId: string;
  fullName: string;
  gender?: string;
  nid?: string;
  dob?: string;
  phone?: string;
  email?: string;
  bloodGroup?: string;
  village?: string;
  postOffice?: string;
  subDistrict?: string;
  district?: string;
  degree?: string;
  majorSubject?: string;
  institution?: string;
  cgpa?: string;
  graduationYear?: string;
  imageUrl?: string | null;
  certificateUrl?: string | null;
  cvUrl?: string | null;
}

export interface IJobApplicationInitiateResponse {
  bkashURL: string;
  paymentID: string;
  applicationId: string;
}
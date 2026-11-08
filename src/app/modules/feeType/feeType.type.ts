export interface IFeeTypeCreate {
  name: string;
  class_id: string;
}

export interface IFeeTypeUpdate {
  name?: string;
  class_id?: string;
}
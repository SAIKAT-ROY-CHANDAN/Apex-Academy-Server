export interface IHostelFeeCollectionItem {
  item_name: string;
  item_amount: number;
}

export interface IMealCollection {
  meal_count: number;
  meal_rate: number;
  total_amount: number;
}

export interface ICreateHostelFeeCollection {
  student_id: string;
  collection_date: string | Date;
  total_amount: number;
  scholarship_amount?: number;
  paid_amount: number;
  due_amount: number;
  hostelFeeCollectionItems: IHostelFeeCollectionItem[];
  mealCollection?: IMealCollection;
}

export interface IPayHostelDue {
  student_id: string;
  paid_amount: number;
  payment_method: 'CASH' | 'BKASH' | 'BANK';
  transaction_id?: string;
  bkash_sender_number?: string;
  bkash_receiver_number?: string;
  payment_note?: string;
}

export interface IBkashInitiateResponse {
  bkashURL: string;
  paymentID: string;
  totalDue: number;
}

export interface IUpdateHostelFeeCollection {
  student_id?: string;
  collection_date?: string | Date;
  total_amount?: number;
  scholarship_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  hostelFeeCollectionItems?: IHostelFeeCollectionItem[];
  mealCollection?: IMealCollection;
}

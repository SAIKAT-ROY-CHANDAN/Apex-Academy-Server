import { Month, PaymentMethod } from '../../../../generated/prisma/enums';

export interface IStudentFeeCollectionItemCreate {
  student_fee_collection_id: string;
  fee_item_id: string;
  fee_month?: Month | null;
  fee_year?: number | null;
  discount_amount?: number;
  paid_amount?: number;
  line_total_amount?: number;
  fine_amount?: number;
  payment_method?: PaymentMethod;
  payment_note?: string;
}

export interface IStudentFeeCollectionItemUpdate {
  discount_amount?: number;
  paid_amount?: number;
  line_total_amount?: number;
  fine_amount?: number;
}

export interface IStudentFeeCollectionItemEdit {
  discount_amount?: number;
  paid_amount?: number;
}

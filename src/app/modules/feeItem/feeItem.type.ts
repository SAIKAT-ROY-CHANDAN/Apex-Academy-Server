import { FeeItemType, Month, Fee_Assign_FOR } from '../../../../generated/prisma/enums';

export interface IFeeItemCreate {
  fee_type_id: string;
  name: string;
  FeeItemType: FeeItemType;
  fee_assign_for: Fee_Assign_FOR;
  amount: number;
  amount_every_subject?: number | null;
  isFine?: boolean;
  payment_start_date?: number | null;
  last_payment_date?: number | null;
  everydayFine_amount?: number | null;
  feeStartMonth?: Month | null;
  feeEndMonth?: Month | null;
}

export interface IFeeItemUpdate {
  fee_type_id?: string;
  name?: string;
  FeeItemType?: FeeItemType;
  fee_assign_for?: Fee_Assign_FOR;
  amount?: number;
  amount_every_subject?: number | null;
  isFine?: boolean;
  payment_start_date?: number | null;
  last_payment_date?: number | null;
  everydayFine_amount?: number | null;
  feeStartMonth?: Month | null;
  feeEndMonth?: Month | null;
}
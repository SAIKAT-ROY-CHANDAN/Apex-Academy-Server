import { PaymentMethod } from '../../../../generated/prisma/enums';

export type CreateStaffPayrollPayload = {
  staffId: string;
  month: number;
  year: number;
};

export interface PayStaffPayrollPayload {
  staffId: string;
  month: number;
  year: number;

  payment_method: PaymentMethod;

  transaction_id?: string;
  bkash_sender_number?: string;
  bkash_receiver_number?: string;
  payment_note?: string;

  paid_by_admin_id: string;
}

export type CalculateStaffPayrollPayload = CreateStaffPayrollPayload;
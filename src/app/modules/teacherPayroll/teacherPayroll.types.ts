import { PaymentMethod } from "../../../../generated/prisma/enums";

export type CreateTeacherPayrollPayload = {
  teacherId: string;
  month: number;
  year: number;
}

export interface PayTeacherPayrollPayload {
  teacherId: string;
  month: number;
  year: number;

  payment_method: PaymentMethod;

  transaction_id?: string;
  bkash_sender_number?: string;
  bkash_receiver_number?: string;
  payment_note?: string;

  paid_by_admin_id: string;
}

export type CalculateTeacherPayrollPayload = CreateTeacherPayrollPayload;

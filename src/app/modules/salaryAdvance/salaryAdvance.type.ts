import {
  AdvanceStatus,
  PaymentMethod,
} from '../../../../generated/prisma/enums';

export interface CalculateTeacherAdvancePayload {
  teacherId: string;
  month: number;
  year: number;
}

export interface CalculateStaffAdvancePayload {
  staffId: string;
  month: number;
  year: number;
}

export type CreateSalaryAdvanceInput = {
  teacher_id?: string;
  staff_id?: string;
  advance_amount: number;
  reason?: string;
  given_at: string;
  payment_method: PaymentMethod;
  transaction_id?: string;
  bkash_sender_number?: string;
  bkash_receiver_number?: string;
  payment_note?: string;
  is_deducted?: boolean;
  advance_status?: AdvanceStatus;
};

export type UpdateSalaryAdvanceInput = {
  teacher_id?: string;
  staff_id?: string;
  advance_amount?: number;
  reason?: string;
  given_at?: string;
  payment_method?: PaymentMethod;
  transaction_id?: string;
  bkash_sender_number?: string;
  bkash_receiver_number?: string;
  payment_note?: string;
  is_deducted?: boolean;
  advance_status?: AdvanceStatus;
};

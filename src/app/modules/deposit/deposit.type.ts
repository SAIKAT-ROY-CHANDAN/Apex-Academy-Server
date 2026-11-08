export type TDepositItemPayload = {
  item_name: string;
  item_amount: number;
  description?: string;
};

export type TDepositPayload = {
  deposit_type_id: string;
  deposit_date: string;
  total_amount: number;
  description?: string;
  depositItems: TDepositItemPayload[];
};

export type TDepositUpdatePayload = {
  deposit_type_id?: string;
  deposit_date?: string;
  total_amount?: number;
  description?: string;
  depositItems?: TDepositItemPayload[];
};
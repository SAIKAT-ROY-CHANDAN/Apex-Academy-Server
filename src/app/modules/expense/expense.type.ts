export type TExpenseItemPayload = {
  item_name: string;
  item_amount: number;
  description?: string;
};

export type TExpensePayload = {
  expense_type_id: string;
  expense_date: string;
  total_amount: number;
  description?: string;
  expenseItems: TExpenseItemPayload[];
};

export type TExpenseUpdatePayload = {
  expense_type_id?: string;
  expense_date?: string;
  total_amount?: number;
  description?: string;
  expenseItems?: TExpenseItemPayload[];
};
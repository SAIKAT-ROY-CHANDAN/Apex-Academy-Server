export interface IHostelExpenseItem {
  item_name: string;
  item_amount: number;
}

export interface ICreateHostelExpense {
  expense_date: string | Date;
  total_amount: number;
  hostelExpenseItems: IHostelExpenseItem[];
}

export interface IUpdateHostelExpense {
  expense_date?: string | Date;
  total_amount?: number;
  hostelExpenseItems?: IHostelExpenseItem[];
}

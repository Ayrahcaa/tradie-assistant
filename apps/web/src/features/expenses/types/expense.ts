export type ExpenseCategory =
  | "MATERIALS"
  | "TOOLS"
  | "FUEL"
  | "VEHICLE"
  | "SUBCONTRACTOR"
  | "EQUIPMENT_HIRE"
  | "INSURANCE"
  | "PHONE_INTERNET"
  | "OFFICE"
  | "TRAVEL"
  | "OTHER";

export type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE";

export interface ExpenseProject {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  supplier: string | null;
  category: ExpenseCategory;
  status: ExpenseStatus;

  amount: string;
  gstAmount: string;

  expenseDate: string;
  dueDate: string | null;
  paidAt: string | null;

  notes: string | null;

  ownerId: string;
  projectId: string | null;
  project: ExpenseProject | null;

  createdAt: string;
  updatedAt: string;
}

export interface ExpensesResponse {
  count: number;
  data: Expense[];
}

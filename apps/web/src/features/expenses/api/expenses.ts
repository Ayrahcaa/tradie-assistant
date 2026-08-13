import type {
  Expense,
  ExpenseCategory,
  ExpensesResponse,
  ExpenseStatus,
} from "../types/expense";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface CreateExpenseInput {
  description: string;
  supplier?: string | null;
  category: ExpenseCategory;
  status?: ExpenseStatus;
  amount: number;
  gstAmount?: number;
  expenseDate: string;
  dueDate?: string | null;
  paidAt?: string | null;
  projectId?: string | null;
  notes?: string | null;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

interface ExpenseResponse {
  message?: string;
  data: Expense;
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const data: unknown = await response.json().catch(() => null);

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export async function getExpenses(
  status?: ExpenseStatus,
): Promise<ExpensesResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  const response = await fetch(`${API_URL}/expenses${query}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load expenses."),
    );
  }

  return response.json() as Promise<ExpensesResponse>;
}

export async function getExpense(expenseId: string): Promise<Expense> {
  const response = await fetch(`${API_URL}/expenses/${expenseId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to load expense."));
  }

  const result = (await response.json()) as ExpenseResponse;

  return result.data;
}

export async function createExpense(
  input: CreateExpenseInput,
): Promise<Expense> {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to create expense."),
    );
  }

  const result = (await response.json()) as ExpenseResponse;

  return result.data;
}

export async function updateExpense(
  expenseId: string,
  input: UpdateExpenseInput,
): Promise<Expense> {
  const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update expense."),
    );
  }

  const result = (await response.json()) as ExpenseResponse;

  return result.data;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to delete expense."),
    );
  }
}

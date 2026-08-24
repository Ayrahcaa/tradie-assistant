import type {
  Invoice,
  InvoicesResponse,
  InvoiceStatus,
} from "../types/invoice";
import { apiFetch } from "../../../shared/api/http";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateInvoiceInput {
  title: string;
  description?: string | null;
  customerId: string;
  projectId?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: InvoiceItemInput[];
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

interface InvoiceResponse {
  message?: string;
  data: Invoice;
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const errorData: unknown = await response.json().catch(() => null);

  if (
    typeof errorData === "object" &&
    errorData !== null &&
    "message" in errorData &&
    typeof errorData.message === "string"
  ) {
    return errorData.message;
  }

  return fallback;
}

export async function getInvoices(
  status?: InvoiceStatus,
): Promise<InvoicesResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  const response = await apiFetch(`${API_URL}/invoices${query}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load invoices."),
    );
  }

  return response.json() as Promise<InvoicesResponse>;
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const response = await apiFetch(`${API_URL}/invoices/${invoiceId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to load invoice."));
  }

  const result = (await response.json()) as InvoiceResponse;

  return result.data;
}

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<Invoice> {
  const response = await apiFetch(`${API_URL}/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to create invoice."),
    );
  }

  const result = (await response.json()) as InvoiceResponse;

  return result.data;
}

export async function updateInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput,
): Promise<Invoice> {
  const response = await apiFetch(`${API_URL}/invoices/${invoiceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update invoice."),
    );
  }

  const result = (await response.json()) as InvoiceResponse;

  return result.data;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
): Promise<Invoice> {
  const response = await apiFetch(`${API_URL}/invoices/${invoiceId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update invoice status."),
    );
  }

  const result = (await response.json()) as InvoiceResponse;

  return result.data;
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/invoices/${invoiceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to delete invoice."),
    );
  }
}

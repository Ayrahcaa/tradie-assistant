import type { Invoice, Payment, PaymentMethod } from "../types/invoice";
import { API_URL, apiFetch } from "../../../shared/api/http";

export interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string;
}

interface CreatePaymentResponse {
  message: string;

  data: {
    payment: Payment;
    invoice: Invoice;
  };
}

async function getErrorMessage(response: Response, fallback: string) {
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

export async function createPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResponse["data"]> {
  const response = await apiFetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to record payment."),
    );
  }

  const result = (await response.json()) as CreatePaymentResponse;

  return result.data;
}

export async function deletePayment(paymentId: string): Promise<Invoice> {
  const response = await apiFetch(`${API_URL}/payments/${paymentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to delete payment."),
    );
  }

  const result = (await response.json()) as {
    data: Invoice;
  };

  return result.data;
}

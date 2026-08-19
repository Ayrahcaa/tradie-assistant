import type { SubcontractorPayment, SubcontractorProjectCost } from "../types/subcontractor-cost";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface CreateSubcontractorPaymentInput {
  costId: string;
  amount: number;
  paidAt?: string;
  reference?: string | null;
  notes?: string | null;
}

interface PaymentResponse { data: { payment: SubcontractorPayment; cost: SubcontractorProjectCost } }

async function errorMessage(response: Response, fallback: string) {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") return body.message;
  return fallback;
}

export async function createSubcontractorPayment(input: CreateSubcontractorPaymentInput) {
  const response = await fetch(`${API_URL}/subcontractor-payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await errorMessage(response, "Unable to record payment."));
  return ((await response.json()) as PaymentResponse).data;
}

export async function deleteSubcontractorPayment(paymentId: string): Promise<SubcontractorProjectCost> {
  const response = await fetch(`${API_URL}/subcontractor-payments/${paymentId}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await errorMessage(response, "Unable to delete payment."));
  return ((await response.json()) as { data: SubcontractorProjectCost }).data;
}

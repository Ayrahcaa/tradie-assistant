import type { Quote, QuotesResponse, QuoteStatus } from "../types/quote";
import { apiFetch } from "../../../shared/api/http";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface QuoteItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateQuoteInput {
  title: string;
  description?: string | null;
  customerId: string;
  projectId?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: QuoteItemInput[];
}

export type UpdateQuoteInput = Partial<CreateQuoteInput>;

interface QuoteResponse {
  message?: string;
  data: Quote;
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

export async function getQuotes(status?: QuoteStatus): Promise<QuotesResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  const response = await apiFetch(`${API_URL}/quotes${query}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to load quotes."));
  }

  return response.json() as Promise<QuotesResponse>;
}

export async function getQuote(quoteId: string): Promise<Quote> {
  const response = await apiFetch(`${API_URL}/quotes/${quoteId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to load quote."));
  }

  const result = (await response.json()) as QuoteResponse;

  return result.data;
}

export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  const response = await apiFetch(`${API_URL}/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to create quote."));
  }

  const result = (await response.json()) as QuoteResponse;

  return result.data;
}

export async function updateQuote(
  quoteId: string,
  input: UpdateQuoteInput,
): Promise<Quote> {
  const response = await apiFetch(`${API_URL}/quotes/${quoteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to update quote."));
  }

  const result = (await response.json()) as QuoteResponse;

  return result.data;
}

export async function updateQuoteStatus(
  quoteId: string,
  status: QuoteStatus,
): Promise<Quote> {
  const response = await apiFetch(`${API_URL}/quotes/${quoteId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update quote status."),
    );
  }

  const result = (await response.json()) as QuoteResponse;

  return result.data;
}

export async function deleteQuote(quoteId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/quotes/${quoteId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to delete quote."));
  }
}

import type { Receipt, ReceiptsResponse } from "../types/receipt";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

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

export async function getExpenseReceipts(
  expenseId: string,
): Promise<ReceiptsResponse> {
  const response = await fetch(`${API_URL}/receipts/expense/${expenseId}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load receipts."),
    );
  }

  return response.json() as Promise<ReceiptsResponse>;
}

export async function uploadReceipt(
  expenseId: string,
  file: File,
): Promise<Receipt> {
  const formData = new FormData();

  formData.append("receipt", file);

  const response = await fetch(`${API_URL}/receipts/expense/${expenseId}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to upload receipt."),
    );
  }

  const result = (await response.json()) as {
    data: Receipt;
  };

  return result.data;
}

export async function deleteReceipt(receiptId: string): Promise<void> {
  const response = await fetch(`${API_URL}/receipts/${receiptId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to delete receipt."),
    );
  }
}

export function getReceiptDownloadUrl(receiptId: string): string {
  return `${API_URL}/receipts/${receiptId}/download`;
}

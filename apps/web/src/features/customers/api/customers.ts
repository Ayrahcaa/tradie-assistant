import type { Customer, CustomersResponse } from "../types/customer";
import { apiFetch } from "../../../shared/api/http";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  businessName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  abn?: string | null;
  notes?: string | null;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

interface CustomerResponse {
  message?: string;
  data: Customer;
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

export async function getCustomers(
  includeArchived = false,
): Promise<CustomersResponse> {
  const query = includeArchived ? "?includeArchived=true" : "";

  const response = await apiFetch(`${API_URL}/customers${query}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load customers."),
    );
  }

  return response.json() as Promise<CustomersResponse>;
}

export async function getCustomer(customerId: string): Promise<Customer> {
  const response = await apiFetch(`${API_URL}/customers/${customerId}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load customer."),
    );
  }

  const result = (await response.json()) as CustomerResponse;

  return result.data;
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  const response = await apiFetch(`${API_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to create customer."),
    );
  }

  const result = (await response.json()) as CustomerResponse;

  return result.data;
}

export async function updateCustomer(
  customerId: string,
  input: UpdateCustomerInput,
): Promise<Customer> {
  const response = await apiFetch(`${API_URL}/customers/${customerId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update customer."),
    );
  }

  const result = (await response.json()) as CustomerResponse;

  return result.data;
}

export async function archiveCustomer(customerId: string): Promise<Customer> {
  const response = await apiFetch(`${API_URL}/customers/${customerId}/archive`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to archive customer."),
    );
  }

  const result = (await response.json()) as CustomerResponse;

  return result.data;
}

export async function restoreCustomer(customerId: string): Promise<Customer> {
  const response = await apiFetch(`${API_URL}/customers/${customerId}/restore`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to restore customer."),
    );
  }

  const result = (await response.json()) as CustomerResponse;

  return result.data;
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/customers/${customerId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to delete customer."),
    );
  }
}

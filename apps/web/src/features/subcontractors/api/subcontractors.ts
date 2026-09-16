import type {
  Subcontractor,
  SubcontractorsResponse,
} from "../types/subcontractor";
import { API_URL, apiFetch } from "../../../shared/api/http";

export interface CreateSubcontractorInput {
  firstName: string;
  lastName?: string | null;
  businessName?: string | null;
  abn?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  isArchived?: boolean;
}

export type UpdateSubcontractorInput = Partial<CreateSubcontractorInput>;

interface SubcontractorResponse {
  message?: string;
  data: Subcontractor;
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

export async function getSubcontractors(
  includeArchived = false,
): Promise<SubcontractorsResponse> {
  const query = includeArchived ? "?includeArchived=true" : "";

  const response = await apiFetch(`${API_URL}/subcontractors${query}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load subcontractors."),
    );
  }

  return response.json() as Promise<SubcontractorsResponse>;
}

export async function getSubcontractor(
  subcontractorId: string,
): Promise<Subcontractor> {
  const response = await apiFetch(`${API_URL}/subcontractors/${subcontractorId}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load subcontractor."),
    );
  }

  const result = (await response.json()) as SubcontractorResponse;

  return result.data;
}

export async function createSubcontractor(
  input: CreateSubcontractorInput,
): Promise<Subcontractor> {
  const response = await apiFetch(`${API_URL}/subcontractors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to create subcontractor."),
    );
  }

  const result = (await response.json()) as SubcontractorResponse;

  return result.data;
}

export async function updateSubcontractor(
  subcontractorId: string,
  input: UpdateSubcontractorInput,
): Promise<Subcontractor> {
  const response = await apiFetch(`${API_URL}/subcontractors/${subcontractorId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update subcontractor."),
    );
  }

  const result = (await response.json()) as SubcontractorResponse;

  return result.data;
}

export async function archiveSubcontractor(
  subcontractorId: string,
): Promise<Subcontractor> {
  const response = await apiFetch(
    `${API_URL}/subcontractors/${subcontractorId}/archive`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to archive subcontractor."),
    );
  }

  const result = (await response.json()) as SubcontractorResponse;

  return result.data;
}

export async function restoreSubcontractor(
  subcontractorId: string,
): Promise<Subcontractor> {
  const response = await apiFetch(
    `${API_URL}/subcontractors/${subcontractorId}/restore`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to restore subcontractor."),
    );
  }

  const result = (await response.json()) as SubcontractorResponse;

  return result.data;
}

export async function deleteSubcontractor(
  subcontractorId: string,
): Promise<void> {
  const response = await apiFetch(`${API_URL}/subcontractors/${subcontractorId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to delete subcontractor."),
    );
  }
}

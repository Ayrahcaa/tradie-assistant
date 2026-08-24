import type {
  SubcontractorCostsResponse,
  SubcontractorProjectCost,
  SubcontractorRateType,
} from "../types/subcontractor-cost";
import { apiFetch } from "../../../shared/api/http";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface SubcontractorCostInput {
  subcontractorId: string;
  projectId: string;
  description?: string | null;
  rateType: SubcontractorRateType;
  rate?: number | null;
  quantity?: number | null;
  agreedAmount: number;
  notes?: string | null;
}

export type UpdateSubcontractorCostInput = Partial<SubcontractorCostInput>;

interface CostResponse {
  data: SubcontractorProjectCost;
}

async function errorMessage(response: Response, fallback: string) {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") return body.message;
  return fallback;
}

export async function getSubcontractorCosts(filters: { subcontractorId?: string; projectId?: string } = {}): Promise<SubcontractorCostsResponse> {
  const query = new URLSearchParams();
  if (filters.subcontractorId) query.set("subcontractorId", filters.subcontractorId);
  if (filters.projectId) query.set("projectId", filters.projectId);
  const response = await apiFetch(`${API_URL}/subcontractor-costs${query.size ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(await errorMessage(response, "Unable to load project costs."));
  return response.json() as Promise<SubcontractorCostsResponse>;
}

export async function getSubcontractorCost(costId: string): Promise<SubcontractorProjectCost> {
  const response = await apiFetch(`${API_URL}/subcontractor-costs/${costId}`);
  if (!response.ok) throw new Error(await errorMessage(response, "Unable to load project cost."));
  return ((await response.json()) as CostResponse).data;
}

async function writeCost(path: string, method: "POST" | "PATCH", input?: SubcontractorCostInput | UpdateSubcontractorCostInput) {
  const response = await apiFetch(`${API_URL}${path}`, {
    method,
    headers: input ? { "Content-Type": "application/json" } : undefined,
    body: input ? JSON.stringify(input) : undefined,
  });
  if (!response.ok) throw new Error(await errorMessage(response, "Unable to save project cost."));
  return ((await response.json()) as CostResponse).data;
}

export const createSubcontractorCost = (input: SubcontractorCostInput) => writeCost("/subcontractor-costs", "POST", input);
export const updateSubcontractorCost = (costId: string, input: UpdateSubcontractorCostInput) => writeCost(`/subcontractor-costs/${costId}`, "PATCH", input);
export const cancelSubcontractorCost = (costId: string) => writeCost(`/subcontractor-costs/${costId}/cancel`, "PATCH");

export async function deleteSubcontractorCost(costId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/subcontractor-costs/${costId}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await errorMessage(response, "Unable to delete project cost."));
}

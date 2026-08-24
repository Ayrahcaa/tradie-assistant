import type { BusinessOverview, CustomerOverview, ProjectOverview } from "./types";
import { apiFetch } from "../../shared/api/http";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function get<T>(path: string, fallback: string): Promise<T> {
  const response = await apiFetch(`${API_URL}${path}`);
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (body && typeof body === "object" && "message" in body && typeof body.message === "string") throw new Error(body.message);
    throw new Error(fallback);
  }
  return ((await response.json()) as { data: T }).data;
}

export const getBusinessOverview = () => get<BusinessOverview>("/analytics/overview", "Unable to load business overview.");
export const getProjectOverview = (projectId: string) => get<ProjectOverview>(`/analytics/projects/${projectId}`, "Unable to load project overview.");
export const getCustomerOverview = (customerId: string) => get<CustomerOverview>(`/analytics/customers/${customerId}`, "Unable to load customer overview.");

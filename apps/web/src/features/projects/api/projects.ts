import type {
  Project,
  ProjectStatus,
  ProjectsResponse,
} from "../types/project";
import { API_URL, apiFetch } from "../../../shared/api/http";

interface ProjectResponse {
  data: Project;
}

export async function getProjectById(
  projectId: string,
): Promise<ProjectResponse> {
  const response = await apiFetch(`${API_URL}/projects/${projectId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to load project."));
  }

  return response.json() as Promise<ProjectResponse>;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  clientName?: string | null;
  customerId?: string | null;
  address?: string | null;
  quotedValue?: number | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

interface CreateProjectResponse {
  message: string;
  data: Project;
}

interface ProjectResponse {
  message?: string;
  data: Project;
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
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

  return fallbackMessage;
}

export async function getProjects(
  status?: ProjectStatus,
): Promise<ProjectsResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  const response = await apiFetch(`${API_URL}/projects${query}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load projects."),
    );
  }

  return response.json() as Promise<ProjectsResponse>;
}

export async function createProject(
  input: CreateProjectInput,
): Promise<CreateProjectResponse> {
  const response = await apiFetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to create project."),
    );
  }

  return response.json() as Promise<CreateProjectResponse>;
}

export async function getProject(projectId: string): Promise<Project> {
  const response = await apiFetch(`${API_URL}/projects/${projectId}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load this project."),
    );
  }

  const result = (await response.json()) as ProjectResponse;
  return result.data;
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const response = await apiFetch(`${API_URL}/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update this project."),
    );
  }

  const result = (await response.json()) as ProjectResponse;
  return result.data;
}

export async function archiveProject(projectId: string): Promise<Project> {
  const response = await apiFetch(`${API_URL}/projects/${projectId}/archive`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to archive this project."),
    );
  }

  const result = (await response.json()) as ProjectResponse;
  return result.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to delete this project."),
    );
  }
}

import type {
  Project,
  ProjectStatus,
  ProjectsResponse,
} from "../types/project";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  clientName?: string | null;
  address?: string | null;
  quotedValue?: number | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

interface CreateProjectResponse {
  message: string;
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
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : "";

  const response = await fetch(`${API_URL}/projects${query}`);

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
  const response = await fetch(`${API_URL}/projects`, {
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
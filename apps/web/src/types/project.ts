export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientName: string | null;
  address: string | null;
  quotedValue: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  count: number;
  data: Project[];
}
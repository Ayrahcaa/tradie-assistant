export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientName: string | null;

  customerId: string | null;
  customer: ProjectCustomer | null;

  address: string | null;
  quotedValue: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  financialSummary?: { revenue: number; costs: number; profit: number; margin: number };
}

export interface ProjectCustomer {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  email: string | null;
  phone: string | null;
}
export interface ProjectsResponse {
  count: number;
  data: Project[];
}

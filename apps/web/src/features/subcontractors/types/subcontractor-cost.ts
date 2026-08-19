import type { Project } from "../../projects/types/project";

export type SubcontractorRateType =
  | "HOURLY"
  | "SQUARE_METRE"
  | "DAILY"
  | "FIXED_TASK"
  | "FIXED_PROJECT"
  | "PER_UNIT"
  | "OTHER";

export type SubcontractorCostStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED";

export interface SubcontractorPayment {
  id: string;
  costId: string;
  ownerId: string;
  amount: string;
  paidAt: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubcontractorProjectCost {
  id: string;
  subcontractorId: string;
  projectId: string;
  ownerId: string;
  description: string | null;
  rateType: SubcontractorRateType;
  rate: string | null;
  quantity: string | null;
  calculatedAmount: string | null;
  agreedAmount: string;
  amountPaid: string;
  amountPending: string;
  status: SubcontractorCostStatus;
  notes: string | null;
  project: Project;
  payments: SubcontractorPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface SubcontractorCostsResponse {
  count: number;
  data: SubcontractorProjectCost[];
}

export interface Subcontractor {
  id: string;

  firstName: string;
  lastName: string | null;

  businessName: string | null;
  abn: string | null;

  email: string | null;
  phone: string | null;
  address: string | null;

  notes: string | null;

  isArchived: boolean;

  ownerId: string;

  createdAt: string;
  updatedAt: string;
}

export interface SubcontractorsResponse {
  count: number;
  data: Subcontractor[];
}

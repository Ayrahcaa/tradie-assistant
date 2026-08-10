export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  abn: string | null;
  notes: string | null;
  isArchived: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  count: number;
  data: Customer[];
}

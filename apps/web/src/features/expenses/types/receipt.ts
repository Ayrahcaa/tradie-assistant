export interface Receipt {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;

  expenseId: string;
  ownerId: string;

  createdAt: string;
  updatedAt: string;
}

export interface ReceiptsResponse {
  count: number;
  data: Receipt[];
}

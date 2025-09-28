export interface Branch {
  id: string;
  userId: string;
  name: string;
  address?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  name: string;
  address?: string;
  active?: boolean;
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  active?: boolean;
}

export interface BranchListParams {
  page?: number;
  limit?: number;
  userId?: string;
}

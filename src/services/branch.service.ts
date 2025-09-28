import { axiosInstance } from "../lib/axios";
import type { PaginatedResult } from "../types/api";
import type {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchListParams,
} from "../types/branch";

export class BranchService {
  static url = "/branches";

  static async getList(params: BranchListParams) {
    const { data } = await axiosInstance.get<PaginatedResult<Branch>>(
      this.url,
      { params }
    );
    return data;
  }

  static async create(request: CreateBranchRequest): Promise<Branch> {
    const { data } = await axiosInstance.post<Branch>(this.url, request);
    return data;
  }

  static async update(
    id: string,
    request: UpdateBranchRequest
  ): Promise<Branch> {
    const { data } = await axiosInstance.patch<Branch>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }

  static async getById(id: string): Promise<Branch> {
    const { data } = await axiosInstance.get<Branch>(`${this.url}/${id}`);
    return data;
  }
}

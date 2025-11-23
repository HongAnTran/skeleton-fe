import { axiosInstance } from "@/lib/axios";
import type { PaginatedResult } from "@/types/api";
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentListParams,
} from "@/types/department";

export class DepartmentService {
  static url = "/departments";

  static async getList(params: DepartmentListParams) {
    const { data } = await axiosInstance.get<PaginatedResult<Department>>(
      this.url,
      { params }
    );
    return data;
  }

  static async create(request: CreateDepartmentRequest): Promise<Department> {
    const { data } = await axiosInstance.post<Department>(this.url, request);
    return data;
  }

  static async update(
    id: string,
    request: UpdateDepartmentRequest
  ): Promise<Department> {
    const { data } = await axiosInstance.patch<Department>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }

  static async getById(id: string): Promise<Department> {
    const { data } = await axiosInstance.get<Department>(`${this.url}/${id}`);
    return data;
  }
}

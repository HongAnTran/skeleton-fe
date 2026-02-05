import { axiosInstance } from "@/lib/axios";
import type { PaginatedResult } from "@/types/api";
import type {
  UserAdmin,
  UserAdminListParams,
  CreateUserAdminDto,
  UpdateUserAdminDto,
} from "@/types/userAdmin";

export class UserAdminService {
  static url = "/user-admins";

  static async getList(
    params: UserAdminListParams,
  ): Promise<PaginatedResult<UserAdmin>> {
    const { data } = await axiosInstance.get<PaginatedResult<UserAdmin>>(
      this.url,
      { params },
    );
    return data;
  }

  static async getById(id: string): Promise<UserAdmin> {
    const { data } = await axiosInstance.get<UserAdmin>(`${this.url}/${id}`);
    return data;
  }

  static async create(request: CreateUserAdminDto): Promise<UserAdmin> {
    const { data } = await axiosInstance.post<UserAdmin>(this.url, request);
    return data;
  }

  static async update(
    id: string,
    request: UpdateUserAdminDto,
  ): Promise<UserAdmin> {
    const { data } = await axiosInstance.patch<UserAdmin>(
      `${this.url}/${id}`,
      request,
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }
}

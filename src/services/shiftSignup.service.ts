import { axiosInstance } from "../lib/axios";
import type { PaginatedResult } from "../types/api";
import type {
  ShiftSignup,
  CreateShiftSignupDto,
  CreateShiftSignupByAdminDto,
  CancelShiftSignupDto,
  ShiftSignupListParams,
} from "../types/shiftSignup";

export class ShiftSignupService {
  static url = "/shift-signups";

  static async getList(params: ShiftSignupListParams) {
    const { data } = await axiosInstance.get<PaginatedResult<ShiftSignup>>(
      this.url,
      { params }
    );
    return data;
  }

  static async getListByEmployee(
    params: Pick<
      ShiftSignupListParams,
      "page" | "limit" | "startDate" | "endDate"
    > & {
      employeeId: string;
    }
  ) {
    const { data } = await axiosInstance.get<PaginatedResult<ShiftSignup>>(
      this.url + "/employee",
      { params }
    );
    return data;
  }

  static async getById(id: string): Promise<ShiftSignup> {
    const { data } = await axiosInstance.get<ShiftSignup>(`${this.url}/${id}`);
    return data;
  }

  static async create(request: CreateShiftSignupDto): Promise<ShiftSignup> {
    const { data } = await axiosInstance.post<ShiftSignup>(this.url, request);
    return data;
  }

  static async createMany(request: { slotIds: string[] }): Promise<number> {
    const { data } = await axiosInstance.post<number>(
      this.url + "/bulk-weekly",
      request
    );
    return data;
  }

  static async cancel(
    id: string,
    request: CancelShiftSignupDto
  ): Promise<ShiftSignup> {
    const { data } = await axiosInstance.patch<ShiftSignup>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }

  // Admin methods
  static async cancelByAdmin(
    id: string,
    cancelReason: string
  ): Promise<ShiftSignup> {
    const { data } = await axiosInstance.patch<ShiftSignup>(
      `${this.url}/${id}/cancel-by-admin`,
      { cancelReason }
    );
    return data;
  }

  static async createByAdmin(
    request: CreateShiftSignupByAdminDto
  ): Promise<ShiftSignup> {
    const { data } = await axiosInstance.post<ShiftSignup>(
      `${this.url}/admin`,
      request
    );
    return data;
  }
}

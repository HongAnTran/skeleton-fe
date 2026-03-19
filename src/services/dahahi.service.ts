import { axiosInstance } from "@/lib/axios";
import type {
  DahahiEmployee,
  DahahiCheckinHistoryParams,
  DahahiCheckinHistoryResponse,
} from "@/types/dahahi";

export class DahahiService {
  static employeesUrl = "/dahahi/employees";
  static checkinhisUrl = "/dahahi/checkinhis";

  static async getEmployees(): Promise<DahahiEmployee[]> {
    const { data } = await axiosInstance.get<unknown>(this.employeesUrl);
    return Array.isArray(data) ? (data as DahahiEmployee[]) : [];
  }

  static async getCheckinHistory(
    params: DahahiCheckinHistoryParams,
  ): Promise<DahahiCheckinHistoryResponse> {
    const { data } = await axiosInstance.get<DahahiCheckinHistoryResponse>(
      this.checkinhisUrl,
      { params },
    );
    return data;
  }
}

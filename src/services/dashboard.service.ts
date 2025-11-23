import { axiosInstance } from "@/lib/axios";
import type { DashboardResponse, DashboardQuery } from "@/types/dashboard";

export class ReportsService {
  static url = "/reports/dashboard";

  static async getDashboardData(
    query: DashboardQuery = {}
  ): Promise<DashboardResponse> {
    const { data } = await axiosInstance.get<DashboardResponse>(this.url, {
      params: query,
    });
    return data;
  }
}

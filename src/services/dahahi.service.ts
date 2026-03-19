import { axiosInstance } from "@/lib/axios";
import type { DahahiEmployee } from "@/types/dahahi";

export class DahahiService {
  static employeesUrl = "/dahahi/employees";

  static async getEmployees(): Promise<DahahiEmployee[]> {
    const { data } = await axiosInstance.get<unknown>(this.employeesUrl);
    return Array.isArray(data) ? (data as DahahiEmployee[]) : [];
  }
}

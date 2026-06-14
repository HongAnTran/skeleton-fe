import { axiosInstance } from "@/lib/axios";
import type { IphoneInventoryReport } from "@/types/iphone-inventory";

export class IphoneInventoryService {
  static url = "/kiotviet/inventory/iphone";

  /**
   * Lấy báo cáo tồn kho iPhone (onHand) chia theo chi nhánh.
   * Public API - không có tham số.
   */
  static async getReport(): Promise<IphoneInventoryReport> {
    const { data } = await axiosInstance.get<IphoneInventoryReport>(this.url);
    return data;
  }
}

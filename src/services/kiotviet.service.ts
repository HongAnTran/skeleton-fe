import { axiosInstance } from "@/lib/axios";
import type { SearchInvoiceResponse } from "@/types/kiotviet";

export class KiotVietService {
  static url = "/kiotviet/invoices";

  /**
   * Tra cứu hóa đơn và bảo hành bằng số điện thoại hoặc serial/IMEI
   * Public API - không cần authentication
   */
  static async searchInvoices(
    phoneOrSerial: string
  ): Promise<SearchInvoiceResponse> {
    const { data } = await axiosInstance.post<SearchInvoiceResponse>(this.url, {
      phoneOrSerial,
    });
    return data;
  }
}

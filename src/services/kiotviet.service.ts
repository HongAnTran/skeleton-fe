import { axiosInstance } from "@/lib/axios";
import type {
  SearchInvoiceResponse,
  KiotVietUsersParams,
  KiotVietUsersResponse,
  InvoicesByUserParams,
  InvoicesByUserResponse,
} from "@/types/kiotviet";

export class KiotVietService {
  static url = "/kiotviet/invoices";
  static usersUrl = "/kiotviet/users";
  static invoicesByUserUrl = "/kiotviet/invoices/by-user";

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

  /**
   * Lấy danh sách user cửa hàng (đã xác nhận, không bao gồm Super Admin).
   * Public API.
   */
  static async getUsers(
    params?: KiotVietUsersParams
  ): Promise<KiotVietUsersResponse> {
    const { data } = await axiosInstance.get<KiotVietUsersResponse>(
      this.usersUrl,
      { params }
    );
    return data;
  }

  /**
   * Lấy hóa đơn do một user bán, kèm báo cáo (tổng đơn, doanh thu, đơn có bảo hành).
   * Public API.
   */
  static async getInvoicesByUser(
    params: InvoicesByUserParams
  ): Promise<InvoicesByUserResponse> {
    const { data } = await axiosInstance.get<InvoicesByUserResponse>(
      this.invoicesByUserUrl,
      { params }
    );
    return data;
  }
}

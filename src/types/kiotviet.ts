/**
 * ============================================
 * KiotViet API - TypeScript Types
 * Copy file này vào project Frontend của bạn
 * ============================================
 */

/**
 * Request body để tra cứu hóa đơn
 */
export interface SearchInvoiceRequest {
  /**
   * Số điện thoại hoặc Serial/IMEI
   * @example "0912345678" hoặc "IMEI123456789"
   */
  phoneOrSerial: string;
}

/**
 * Thông tin sản phẩm trong hóa đơn
 */
export interface InvoiceProduct {
  /** ID sản phẩm */
  productId: number;

  /** Tên sản phẩm */
  productName: string;

  /** Mã sản phẩm */
  productCode: string;

  /** Số lượng */
  quantity: number;

  /** Giá bán */
  price: number;

  /** Thành tiền */
  subTotal: number;

  /** Danh sách Serial/IMEI (nếu có) */
  serialNumbers?: string[];
}

/**
 * Trạng thái bảo hành
 */
export type WarrantyStatus = "Còn hiệu lực" | "Hết hạn";

/**
 * Thông tin bảo hành
 */
export interface WarrantyInfo {
  /** Số ngày bảo hành */
  warrantyDays: number;

  /** Ngày bắt đầu bảo hành (ngày mua hàng) - ISO 8601 format */
  warrantyStartDate: string;

  /** Ngày kết thúc bảo hành - ISO 8601 format */
  warrantyEndDate: string;

  /** Số ngày bảo hành còn lại */
  remainingDays: number;

  /** Loại bảo hành */
  warrantyType: string;

  /** Trạng thái bảo hành */
  status: WarrantyStatus;
}

/**
 * Response hóa đơn từ API
 */
export interface Invoice {
  /** ID hóa đơn */
  id: number;

  /** Mã hóa đơn */
  code: string;

  /** Ngày tạo hóa đơn - ISO 8601 format */
  createdDate: string;

  /** Tổng tiền */
  total: number;

  /** Tổng tiền sau giảm giá */
  totalPayment: number;

  status: number;
  customerId: number;
  customerCode: string;
  customerName: string;

  /** Danh sách sản phẩm (đã loại bỏ các sản phẩm bảo hành) */
  invoiceDetails: InvoiceProduct[];

  /** Ghi chú hóa đơn */
  note?: string;

  /** Thông tin bảo hành (chỉ có khi hóa đơn có sản phẩm bảo hành) */
  warranty?: WarrantyInfo;
}

/**
 * Response từ API tra cứu hóa đơn
 */
export type SearchInvoiceResponse = Invoice[];

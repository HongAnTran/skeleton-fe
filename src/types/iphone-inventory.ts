// --- API Tồn kho iPhone theo chi nhánh (GET /kiotviet/inventory/iphone) ---

export type IphoneMarketKind = "lock" | "international" | "unknown";

/** Tách tồn (onHand) theo loại thị trường. */
export interface IphoneInventoryMarketTotals {
  lockQuantity: number; // Nhóm New L / Used L
  internationalQuantity: number; // Nhóm New Q / Used Q
  unknownMarketQuantity: number; // Không khớp hoặc thiếu nhóm
}

export interface IphoneInventoryDetailRow {
  modelName: string;
  storage: string;
  color: string;
  /** Backend trả string; FE có thể narrow về `IphoneMarketKind`. */
  marketType: string;
  /** Nhóm hàng gốc từ KiotViet (`categoryName`) nếu có. */
  productGroup?: string;
  onHand: number; // số lượng tồn
}

export interface IphoneInventoryBranch {
  branchId: number;
  branchName: string;
  totalOnHand: number; // tổng tồn iPhone của chi nhánh
  byMarket: IphoneInventoryMarketTotals; // tách Lock / Quốc tế / chưa xác định
  detailRows: IphoneInventoryDetailRow[];
}

export interface IphoneInventoryReport {
  totalOnHand: number; // tổng tồn iPhone của tất cả chi nhánh
  byBranch: IphoneInventoryBranch[];
}

/** Nhân viên Face Recognition — GET /dahahi/employees */
export interface DahahiEmployee {
  StatusName: string;
  EmployeeCode: string;
  Name: string;
  Mobile: string | null;
  Email: string | null;
  Address: string | null;
  IsDeleted: boolean;
  CreatedBy: string;
  Status: number;
  CreatedDate: string;
  Avatar: string | null;
  StructureDepartmentName: string | null;
  /** Nếu backend bổ sung, ưu tiên dùng cho báo cáo KiotViet */
  KiotVietUserId?: number;
}

/** Bản ghi lịch sử check-in — GET /dahahi/checkinhis */
export interface DahahiCheckinRecord {
  FacePersionId: string;
  CheckinTimeStr: string;
  FaceId: string;
  EmployeeIdStr: string;
  EmployeeCode: string;
  EmployeeName: string;
  FacePersonId: string;
  CheckinTime1Str: string;
  LiveImageUrl: string;
}

export interface DahahiCheckinReport {
  workDays: number;
  forgotCheckoutCount: number;
  totalRecords: number;
}

export interface DahahiCheckinHistoryResponse {
  data: DahahiCheckinRecord[];
  report: DahahiCheckinReport;
}

export interface DahahiCheckinHistoryParams {
  EmployeeCode: string;
  FromTimeStr: string;
  ToTimeStr: string;
}

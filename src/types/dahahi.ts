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

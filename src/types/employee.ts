import type { Branch } from "./branch";
import type { Department } from "./department";

export interface Employee {
  id: string; // UUID
  userId: string; // UUID của user sở hữu employee
  avatar?: string; // Avatar của nhân viên
  branchId?: string; // UUID của branch (optional)
  departmentId?: string; // UUID của department (optional)
  name: string; // Tên đầy đủ nhân viên
  phone?: string; // Số điện thoại (optional)
  active: boolean; // Trạng thái hoạt động
  currentLevel: number; // Cấp độ hiện tại
  createdAt: Date; // Ngày tạo
  updatedAt: Date; // Ngày cập nhật
  role: string | null; // Vai trò

  branch?: Pick<Branch, "id" | "name">; // Thông tin branch
  department?: Pick<Department, "id" | "name">; // Thông tin department
  account: {
    id: string;
    email: string;
    username: string;
  }; // Thông tin account
}

export interface CreateEmployeeDto {
  username: string; // Required: Tên đăng nhập
  branchId?: string; // Optional: UUID của branch
  departmentId?: string; // Optional: UUID của department
  name: string; // Required: Tên nhân viên
  email: string; // Required: Email (VD: "employee@example.com")
  password: string; // Required: Mật khẩu (VD: "1234567890")
  phone?: string; // Optional: Số điện thoại (VD: "+1234567890")
  active?: boolean; // Optional: Trạng thái hoạt động (default: true)
  provider?: string; // Optional: Provider (VD: "local")
  role?: string; // Optional: Role (VD: "employee")
}

export interface UpdateEmployeeDto {
  branchId?: string; // Optional
  departmentId?: string; // Optional
  name?: string; // Optional
  password?: string; // Optional
  email?: string; // Optional
  phone?: string; // Optional
  active?: boolean; // Optional
  provider?: string; // Optional
  role?: string; // Optional
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  branchId?: string;
  departmentId?: string;
}

export interface ShiftSignupSummary {
  id: string;
  employeeId: string;
  slotId: string;
  status: string;
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
  cancelReason: string;
  canceledBy: string;
  canceledAt: string;
  slot: {
    id: string;
    date: Date;
    capacity: number;
    note?: string;
    branch: {
      id: string;
      name: string;
    };
    department: {
      id: string;
      name: string;
    };
    type: {
      id: string;
      name: string;
    };
  };
}

export interface EmployeeShiftSummaryResponse {
  employee: Employee;
  shifts: ShiftSignupSummary[];
  shiftCountPending: number;
  totalHoursCompleted: number;
  shiftCountCompleted: number;
  shiftCountCancelled: number;
}

export interface EmployeeShiftSummaryParams {
  startDate: string;
  endDate: string;
}

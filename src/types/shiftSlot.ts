import type { Branch } from "./branch";
import type { Department } from "./department";
import type { ShiftSignup } from "./shiftSignup";
import type { ShiftSlotType } from "./shiftSlotType";
export interface ShiftSlot {
  id: string;
  userId: string;
  branchId: string;
  departmentId: string;
  capacity: number;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  department?: Pick<Department, "id" | "name">;
  branch?: Pick<Branch, "id" | "name">;
  type: Pick<
    ShiftSlotType,
    "id" | "name" | "startDate" | "endDate" | "isDeleted"
  >;
  signups: ShiftSignup[];
}

export interface ShiftSlotList {
  id: string;
  userId: string;
  branchId: string;
  departmentId: string;
  capacity: number;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  department?: Pick<Department, "id" | "name">;
  branch?: Pick<Branch, "id" | "name">;
  type: Pick<
    ShiftSlotType,
    "id" | "name" | "startDate" | "endDate" | "isDeleted"
  >;

  signups: ShiftSignup[];
}

export interface CreateShiftSlotDto {
  departmentIds: string[];
  branchId: string; // UUID của chi nhánh
  capacity: number; // Số lượng người tối đa (min: 1)
  note?: string; // Ghi chú (optional)
  date: string; // Ngày làm việc ISO format
  typeIds: string[]; // UUID của Shift Slot Type
  endDate?: string; // Ngày kết thúc ISO format
}

export interface UpdateShiftSlotDto {
  departmentId: string;
  branchId?: string;
  capacity?: number;
  note?: string;
  date?: string;
  typeId?: string;
}

export interface ShiftSlotListParams {
  page?: number; // Pagination
  limit?: number; // Pagination
  branchId?: string; // Filter theo chi nhánh
  startDate?: string; // Filter từ ngày
  endDate?: string; // Filter đến ngày
  typeId?: string; // Filter theo loại ca
  departmentId?: string; // Filter theo phòng ban
  employeeId?: string; // Filter theo nhân viên
}

import type { Employee } from "./employee";
import type { ShiftSlot } from "./shiftSlot";

export interface ShiftSignup {
  id: string;
  employeeId: string;
  slotId: string;
  canceledAt: Date | null;
  cancelReason: string | null;
  canceledBy: string | null;
  notes?: string;
  status: ShiftSignupStatus;
  createdAt: Date;
  updatedAt: Date;
  employee: Pick<Employee, "id" | "name" | "phone">;
  slot: ShiftSlot;
}

export enum ShiftSignupStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CreateShiftSignupDto {
  slotId: string;
}

export interface CreateShiftSignupByAdminDto {
  slotId: string;
  employeeId: string;
}

export interface CancelShiftSignupDto {
  cancelReason: string;
}

export interface ShiftSignupListParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

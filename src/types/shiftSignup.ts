import type { Employee } from "./employee";
import type { ShiftSlot } from "./shiftSlot";

export interface ShiftSignup {
  id: string;
  employeeId: string;
  slotId: string;
  isCanceled: boolean;
  canceledAt: Date | null;
  cancelReason: string | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  employee: Pick<Employee, "id" | "name" | "phone">;
  slot: ShiftSlot;
}

export interface CreateShiftSignupDto {
  slotId: string;
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

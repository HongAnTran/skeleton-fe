import type { Employee } from "./employee";
import type { ShiftSlot } from "./shiftSlot";

export type ShiftSwapStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  targetId: string;
  requesterSlotId: string;
  targetSlotId: string;
  status: ShiftSwapStatus;
  reason?: string;
  message?: string;
  responseMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;

  // Relations
  requester: Pick<Employee, "id" | "name">;
  target: Pick<Employee, "id" | "name">;
  requesterSlot: Pick<ShiftSlot, "id" | "date" | "capacity"> & {
    type: {
      name: string;
      startDate: Date;
      endDate: Date;
    };
    branch: { name: string };
  };
  targetSlot: Pick<ShiftSlot, "id" | "date" | "capacity"> & {
    type: {
      name: string;
      startDate: Date;
      endDate: Date;
    };
    branch: { name: string };
  };
}

export interface CreateShiftSwapRequestDto {
  targetId: string; // ID nhân viên đích
  requesterSlotId: string; // ID ca của người yêu cầu
  targetSlotId: string; // ID ca của người đích
  reason?: string; // Lý do đổi ca (optional)
  message?: string; // Tin nhắn kèm theo (optional)
}

export interface RespondShiftSwapRequestDto {
  status: "ACCEPTED" | "REJECTED";
  responseMessage?: string; // Tin nhắn phản hồi (optional)
}

export interface ShiftSwapListParams {
  type?: "sent" | "received";
  page?: number;
  limit?: number;
  status?: ShiftSwapStatus;
  search?: string;
}

export interface ShiftSwapFilters {
  status: ShiftSwapStatus | null;
  search: string;
}

export interface ShiftSwapUIState {
  showCreateModal: boolean;
  showDetailModal: boolean;
  showResponseModal: boolean;
  activeTab: "sent" | "received";
  selectedRequest: ShiftSwapRequest | null;
}

export interface ShiftSlotType {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShiftSlotTypeDto {
  name: string; // Tên loại ca (VD: "Morning Shift", "Night Shift")
  startDate: string; // Thời gian bắt đầu ISO format (VD: "2024-01-01T08:00:00Z")
  endDate: string; // Thời gian kết thúc ISO format (VD: "2024-01-01T16:00:00Z")
}

export interface UpdateShiftSlotTypeDto {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface ShiftSlotTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
}

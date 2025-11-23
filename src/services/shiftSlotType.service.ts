import { axiosInstance } from "@/lib/axios";
import type { PaginatedResult } from "@/types/api";
import type {
  ShiftSlotType,
  CreateShiftSlotTypeDto,
  UpdateShiftSlotTypeDto,
  ShiftSlotTypeListParams,
} from "@/types/shiftSlotType";

export class ShiftSlotTypeService {
  static url = "/shift-slot-types";

  // Get paginated list of shift slot types with optional filters
  static async getList(params: ShiftSlotTypeListParams) {
    const { data } = await axiosInstance.get<PaginatedResult<ShiftSlotType>>(
      this.url,
      { params }
    );
    return data;
  }

  // Get single shift slot type by ID
  static async getById(id: string): Promise<ShiftSlotType> {
    const { data } = await axiosInstance.get<ShiftSlotType>(
      `${this.url}/${id}`
    );
    return data;
  }

  // Create new shift slot type
  static async create(request: CreateShiftSlotTypeDto): Promise<ShiftSlotType> {
    const { data } = await axiosInstance.post<ShiftSlotType>(this.url, request);
    return data;
  }

  // Update existing shift slot type
  static async update(
    id: string,
    request: UpdateShiftSlotTypeDto
  ): Promise<ShiftSlotType> {
    const { data } = await axiosInstance.patch<ShiftSlotType>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  // Delete shift slot type
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }

  // Get all shift slot types for dropdown/selection (without pagination)
  static async getAll(): Promise<ShiftSlotType[]> {
    const { data } = await axiosInstance.get<ShiftSlotType[]>(
      `${this.url}/all`
    );
    return data;
  }
}

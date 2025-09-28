import { axiosInstance } from "../lib/axios";
import type { PaginatedResult } from "../types/api";
import type {
  ShiftSlot,
  CreateShiftSlotDto,
  UpdateShiftSlotDto,
  ShiftSlotListParams,
  ShiftSlotList,
} from "../types/shiftSlot";

export class ShiftSlotService {
  static url = "/shift-slots";

  static async getList(params: ShiftSlotListParams) {
    const { data } = await axiosInstance.get<PaginatedResult<ShiftSlotList>>(
      this.url,
      { params }
    );
    return data;
  }
  static async getListByEmployee(params: ShiftSlotListParams) {
    const { data } = await axiosInstance.get<ShiftSlotList[]>(
      `${this.url}/employee`,
      { params }
    );
    return data;
  }

  static async getById(id: string): Promise<ShiftSlot> {
    const { data } = await axiosInstance.get<ShiftSlot>(`${this.url}/${id}`);
    return data;
  }

  static async create(request: CreateShiftSlotDto): Promise<ShiftSlot> {
    const { data } = await axiosInstance.post<ShiftSlot>(this.url, request);
    return data;
  }
  static async createMany(request: CreateShiftSlotDto): Promise<number> {
    const { data } = await axiosInstance.post<number>(
      this.url + "/many",
      request
    );
    return data;
  }

  static async update(
    id: string,
    request: UpdateShiftSlotDto
  ): Promise<ShiftSlot> {
    const { data } = await axiosInstance.patch<ShiftSlot>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }

  static async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ShiftSlot[]> {
    const { data } = await axiosInstance.get<ShiftSlot[]>(
      `${this.url}/date-range`,
      {
        params: { startDate, endDate },
      }
    );
    return data;
  }
}

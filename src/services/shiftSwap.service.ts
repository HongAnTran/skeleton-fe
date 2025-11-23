import { axiosInstance } from "@/lib/axios";
import type { PaginatedResult } from "@/types/api";
import type {
  ShiftSwapRequest,
  CreateShiftSwapRequestDto,
  RespondShiftSwapRequestDto,
  ShiftSwapListParams,
} from "@/types/shiftSwap";

export class ShiftSwapService {
  static url = "/shift-swaps";

  // Tạo yêu cầu đổi ca
  static async create(
    request: CreateShiftSwapRequestDto
  ): Promise<ShiftSwapRequest> {
    const { data } = await axiosInstance.post<ShiftSwapRequest>(
      this.url,
      request
    );
    return data;
  }

  // Lấy danh sách yêu cầu đổi ca (sent/received)
  static async getList(
    params: ShiftSwapListParams
  ): Promise<PaginatedResult<ShiftSwapRequest>> {
    const { data } = await axiosInstance.get<PaginatedResult<ShiftSwapRequest>>(
      this.url,
      { params }
    );
    return data;
  }

  // Lấy chi tiết yêu cầu đổi ca
  static async getById(id: string): Promise<ShiftSwapRequest> {
    const { data } = await axiosInstance.get<ShiftSwapRequest>(
      `${this.url}/${id}`
    );
    return data;
  }

  // Phản hồi yêu cầu đổi ca (chỉ target)
  static async respond(
    id: string,
    request: RespondShiftSwapRequestDto
  ): Promise<ShiftSwapRequest> {
    const { data } = await axiosInstance.patch<ShiftSwapRequest>(
      `${this.url}/${id}/respond`,
      request
    );
    return data;
  }

  // Hủy yêu cầu đổi ca (chỉ requester)
  static async cancel(id: string): Promise<ShiftSwapRequest> {
    const { data } = await axiosInstance.patch<ShiftSwapRequest>(
      `${this.url}/${id}/cancel`
    );
    return data;
  }
}

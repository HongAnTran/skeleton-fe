import { axiosInstance } from "@/lib/axios";
import type {
  LeaveRequest,
  CreateLeaveRequestDto,
  QueryLeaveRequestDto,
  RejectLeaveRequestDto,
  CancelLeaveRequestDto,
  LeaveRequestListResponse,
} from "@/types/leaveRequest";

export class LeaveRequestService {
  static url = "/leave-requests";

  /**
   * Get my leave requests (Employee only)
   */
  static async getMyLeaveRequests(
    params?: QueryLeaveRequestDto
  ): Promise<LeaveRequestListResponse> {
    const { data } = await axiosInstance.get<LeaveRequestListResponse>(
      this.url,
      { params }
    );
    return data;
  }

  /**
   * Get all leave requests with filters (Admin/Manager only)
   */
  static async getAllLeaveRequests(
    params?: QueryLeaveRequestDto
  ): Promise<LeaveRequestListResponse> {
    const { data } = await axiosInstance.get<LeaveRequestListResponse>(
      `${this.url}/all`,
      { params }
    );
    return data;
  }

  /**
   * Get single leave request by ID
   */
  static async getById(id: string): Promise<LeaveRequest> {
    const { data } = await axiosInstance.get<LeaveRequest>(`${this.url}/${id}`);
    return data;
  }

  /**
   * Create new leave request (Employee only)
   */
  static async create(request: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const { data } = await axiosInstance.post<LeaveRequest>(this.url, request);
    return data;
  }

  /**
   * Update leave request (Employee only)
   */
  static async update(
    id: string,
    request: CreateLeaveRequestDto
  ): Promise<LeaveRequest> {
    const { data } = await axiosInstance.patch<LeaveRequest>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  /**
   * Approve leave request (Admin/Manager only)
   */
  static async approve(id: string): Promise<LeaveRequest> {
    const { data } = await axiosInstance.patch<LeaveRequest>(
      `${this.url}/${id}/approve`
    );
    return data;
  }

  /**
   * Reject leave request (Admin/Manager only)
   */
  static async reject(
    id: string,
    request: RejectLeaveRequestDto
  ): Promise<LeaveRequest> {
    const { data } = await axiosInstance.patch<LeaveRequest>(
      `${this.url}/${id}/reject`,
      request
    );
    return data;
  }

  /**
   * Cancel leave request (Employee only)
   */
  static async cancel(
    id: string,
    request: CancelLeaveRequestDto
  ): Promise<LeaveRequest> {
    const { data } = await axiosInstance.patch<LeaveRequest>(
      `${this.url}/${id}/cancel`,
      request
    );
    return data;
  }

  /**
   * Delete leave request (Admin only)
   */
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }
}

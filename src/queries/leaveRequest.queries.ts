import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { LeaveRequestService } from "../services/leaveRequest.service";
import type {
  CreateLeaveRequestDto,
  QueryLeaveRequestDto,
  RejectLeaveRequestDto,
  CancelLeaveRequestDto,
} from "../types/leaveRequest";
import type { ReactQueryOptions } from "../types/reactQuery";

export const LEAVE_REQUEST_KEYS = {
  all: ["leave-requests"] as const,
  lists: () => [...LEAVE_REQUEST_KEYS.all, "list"] as const,
  myList: (params?: QueryLeaveRequestDto) =>
    [...LEAVE_REQUEST_KEYS.lists(), "my", params] as const,
  allList: (params?: QueryLeaveRequestDto) =>
    [...LEAVE_REQUEST_KEYS.lists(), "all", params] as const,
  details: () => [...LEAVE_REQUEST_KEYS.all, "detail"] as const,
  detail: (id: string) => [...LEAVE_REQUEST_KEYS.details(), id] as const,
};

/**
 * Get my leave requests (Employee only)
 */
export const useMyLeaveRequests = (
  params?: QueryLeaveRequestDto,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: LEAVE_REQUEST_KEYS.myList(params),
    queryFn: () => LeaveRequestService.getMyLeaveRequests(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Get all leave requests with filters (Admin/Manager only)
 */
export const useAllLeaveRequests = (
  params?: QueryLeaveRequestDto,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: LEAVE_REQUEST_KEYS.allList(params),
    queryFn: () => LeaveRequestService.getAllLeaveRequests(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Get single leave request by ID
 */
export const useLeaveRequest = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: LEAVE_REQUEST_KEYS.detail(id),
    queryFn: () => LeaveRequestService.getById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Create leave request mutation (Employee only)
 */
export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestDto) =>
      LeaveRequestService.create(data),
    onSuccess: (newLeaveRequest) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.lists() });
      queryClient.setQueryData(
        LEAVE_REQUEST_KEYS.detail(newLeaveRequest.id),
        newLeaveRequest
      );
      message.success("Đơn xin nghỉ đã được tạo thành công!");
    },
  });
};

/**
 * Update leave request mutation (Employee only)
 */
export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLeaveRequestDto }) =>
      LeaveRequestService.update(id, data),
    onSuccess: (updatedLeaveRequest, { id }) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.lists() });
      queryClient.setQueryData(
        LEAVE_REQUEST_KEYS.detail(id),
        updatedLeaveRequest
      );
      message.success("Đơn xin nghỉ đã được cập nhật thành công!");
    },
  });
};

/**
 * Approve leave request mutation (Admin/Manager only)
 */
export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LeaveRequestService.approve(id),
    onSuccess: (approvedLeaveRequest, id) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.lists() });
      queryClient.setQueryData(
        LEAVE_REQUEST_KEYS.detail(id),
        approvedLeaveRequest
      );
      message.success("Đơn xin nghỉ đã được duyệt!");
    },
  });
};

/**
 * Reject leave request mutation (Admin/Manager only)
 */
export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectLeaveRequestDto }) =>
      LeaveRequestService.reject(id, data),
    onSuccess: (rejectedLeaveRequest, { id }) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.lists() });
      queryClient.setQueryData(
        LEAVE_REQUEST_KEYS.detail(id),
        rejectedLeaveRequest
      );
      message.success("Đơn xin nghỉ đã bị từ chối!");
    },
  });
};

/**
 * Cancel leave request mutation (Employee only)
 */
export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelLeaveRequestDto }) =>
      LeaveRequestService.cancel(id, data),
    onSuccess: (cancelledLeaveRequest, { id }) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.lists() });
      queryClient.setQueryData(
        LEAVE_REQUEST_KEYS.detail(id),
        cancelledLeaveRequest
      );
      message.success("Đơn xin nghỉ đã được hủy!");
    },
  });
};

/**
 * Delete leave request mutation (Admin only)
 */
export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LeaveRequestService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.lists() });
      queryClient.removeQueries({
        queryKey: LEAVE_REQUEST_KEYS.detail(deletedId),
      });
      message.success("Đơn xin nghỉ đã được xóa!");
    },
  });
};

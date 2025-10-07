import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { ShiftSwapService } from "../services/shiftSwap.service";
import type {
  CreateShiftSwapRequestDto,
  RespondShiftSwapRequestDto,
  ShiftSwapListParams,
} from "../types/shiftSwap";
import type { ReactQueryOptions } from "../types/reactQuery";

export const SHIFT_SWAP_KEYS = {
  all: ["shift-swaps"] as const,
  lists: () => [...SHIFT_SWAP_KEYS.all, "list"] as const,
  list: (params: ShiftSwapListParams) =>
    [...SHIFT_SWAP_KEYS.lists(), params] as const,
  details: () => [...SHIFT_SWAP_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SHIFT_SWAP_KEYS.details(), id] as const,
};

// Lấy danh sách yêu cầu đổi ca
export const useShiftSwapRequests = (
  params: ShiftSwapListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: SHIFT_SWAP_KEYS.list(params),
    queryFn: () => ShiftSwapService.getList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Lấy chi tiết yêu cầu đổi ca
export const useShiftSwapRequest = (
  id: string,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: SHIFT_SWAP_KEYS.detail(id),
    queryFn: () => ShiftSwapService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Tạo yêu cầu đổi ca
export const useCreateShiftSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftSwapRequestDto) =>
      ShiftSwapService.create(data),
    onSuccess: (newRequest) => {
      // Invalidate các list queries
      queryClient.invalidateQueries({
        queryKey: SHIFT_SWAP_KEYS.lists(),
      });

      // Add vào cache chi tiết
      queryClient.setQueryData(
        SHIFT_SWAP_KEYS.detail(newRequest.id),
        newRequest
      );

      message.success("Yêu cầu đổi ca đã được gửi thành công!");
    },
  });
};

// Phản hồi yêu cầu đổi ca
export const useRespondShiftSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RespondShiftSwapRequestDto;
    }) => ShiftSwapService.respond(id, data),
    onSuccess: (updatedRequest, { id, data }) => {
      // Invalidate các list queries
      queryClient.invalidateQueries({
        queryKey: SHIFT_SWAP_KEYS.lists(),
      });

      // Update cache chi tiết
      queryClient.setQueryData(SHIFT_SWAP_KEYS.detail(id), updatedRequest);

      const action = data.status === "ACCEPTED" ? "chấp nhận" : "từ chối";
      message.success(`Đã ${action} yêu cầu đổi ca thành công!`);
    },
  });
};

// Hủy yêu cầu đổi ca
export const useCancelShiftSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftSwapService.cancel(id),
    onSuccess: (updatedRequest, id) => {
      // Invalidate các list queries
      queryClient.invalidateQueries({
        queryKey: SHIFT_SWAP_KEYS.lists(),
      });

      // Update cache chi tiết
      queryClient.setQueryData(SHIFT_SWAP_KEYS.detail(id), updatedRequest);

      message.success("Đã hủy yêu cầu đổi ca thành công!");
    },
  });
};

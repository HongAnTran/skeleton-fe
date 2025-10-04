import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { ShiftSignupService } from "../services/shiftSignup.service";
import type {
  CreateShiftSignupDto,
  CreateShiftSignupByAdminDto,
  CancelShiftSignupDto,
  ShiftSignupListParams,
} from "../types/shiftSignup";
import type { ReactQueryOptions } from "../types/reactQuery";

export const SHIFT_SIGNUP_KEYS = {
  all: ["shift-signups"] as const,
  lists: () => [...SHIFT_SIGNUP_KEYS.all, "list"] as const,
  list: (params: ShiftSignupListParams) =>
    [...SHIFT_SIGNUP_KEYS.lists(), params] as const,
  details: () => [...SHIFT_SIGNUP_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SHIFT_SIGNUP_KEYS.details(), id] as const,
};

// Get shift signups with pagination and filters
export const useShiftSignups = (
  params: ShiftSignupListParams,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: SHIFT_SIGNUP_KEYS.list(params),
    queryFn: () => ShiftSignupService.getList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useShiftSignupsByEmployee = (
  params: Pick<
    ShiftSignupListParams,
    "page" | "limit" | "startDate" | "endDate"
  > & {
    employeeId: string;
  },
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: SHIFT_SIGNUP_KEYS.list(params),
    queryFn: () => ShiftSignupService.getListByEmployee(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Get single shift signup by ID
export const useShiftSignup = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: SHIFT_SIGNUP_KEYS.detail(id),
    queryFn: () => ShiftSignupService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create shift signup mutation
export const useCreateShiftSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftSignupDto) => ShiftSignupService.create(data),
    onSuccess: (newShiftSignup) => {
      // Invalidate all shift signup lists
      queryClient.invalidateQueries({ queryKey: SHIFT_SIGNUP_KEYS.lists() });

      // Also invalidate shift slots to update signup counts
      queryClient.invalidateQueries({ queryKey: ["shift-slots"] });

      // Add the new shift signup to cache
      queryClient.setQueryData(
        SHIFT_SIGNUP_KEYS.detail(newShiftSignup.id),
        newShiftSignup
      );

      message.success("Đăng ký ca làm việc thành công!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi đăng ký ca làm việc");
    },
  });
};

// Cancel shift signup mutation
export const useCancelShiftSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelShiftSignupDto }) =>
      ShiftSignupService.cancel(id, data),
    onSuccess: (updatedShiftSignup, { id }) => {
      // Update all relevant caches
      queryClient.invalidateQueries({ queryKey: SHIFT_SIGNUP_KEYS.lists() });

      // Also invalidate shift slots to update signup counts
      queryClient.invalidateQueries({ queryKey: ["shift-slots"] });

      // Update specific shift signup cache
      queryClient.setQueryData(
        SHIFT_SIGNUP_KEYS.detail(id),
        updatedShiftSignup
      );

      message.success("Đã hủy đăng ký ca làm việc!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi hủy đăng ký ca làm việc");
    },
  });
};

// Delete shift signup mutation
export const useDeleteShiftSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftSignupService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from all caches
      queryClient.invalidateQueries({ queryKey: SHIFT_SIGNUP_KEYS.lists() });

      // Also invalidate shift slots to update signup counts
      queryClient.invalidateQueries({ queryKey: ["shift-slots"] });

      queryClient.removeQueries({
        queryKey: SHIFT_SIGNUP_KEYS.detail(deletedId),
      });

      message.success("Xóa đăng ký ca làm việc thành công!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi xóa đăng ký ca làm việc");
    },
  });
};

// Admin mutations
export const useCancelShiftSignupByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cancelReason }: { id: string; cancelReason: string }) =>
      ShiftSignupService.cancelByAdmin(id, cancelReason),
    onSuccess: (updatedShiftSignup, { id }) => {
      // Update all relevant caches
      queryClient.invalidateQueries({ queryKey: SHIFT_SIGNUP_KEYS.lists() });

      // Also invalidate shift slots to update signup counts
      queryClient.invalidateQueries({ queryKey: ["shift-slots"] });

      // Update specific shift signup cache
      queryClient.setQueryData(
        SHIFT_SIGNUP_KEYS.detail(id),
        updatedShiftSignup
      );

      message.success("Đã hủy đăng ký ca làm việc cho nhân viên!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi hủy đăng ký ca làm việc");
    },
  });
};

export const useCreateShiftSignupByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftSignupByAdminDto) =>
      ShiftSignupService.createByAdmin(data),
    onSuccess: (newShiftSignup) => {
      // Invalidate all shift signup lists
      queryClient.invalidateQueries({ queryKey: SHIFT_SIGNUP_KEYS.lists() });

      // Also invalidate shift slots to update signup counts
      queryClient.invalidateQueries({ queryKey: ["shift-slots"] });

      // Add the new shift signup to cache
      queryClient.setQueryData(
        SHIFT_SIGNUP_KEYS.detail(newShiftSignup.id),
        newShiftSignup
      );

      message.success("Đã tạo đăng ký ca làm việc cho nhân viên!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi tạo đăng ký ca làm việc");
    },
  });
};

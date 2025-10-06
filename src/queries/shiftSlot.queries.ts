import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { ShiftSlotService } from "../services/shiftSlot.service";
import type {
  CreateShiftSlotDto,
  UpdateShiftSlotDto,
  ShiftSlotListParams,
} from "../types/shiftSlot";
import type { ReactQueryOptions } from "../types/reactQuery";

export const SHIFT_SLOT_KEYS = {
  all: ["shift-slots"] as const,
  lists: () => [...SHIFT_SLOT_KEYS.all, "list"] as const,
  list: (params: ShiftSlotListParams) =>
    [...SHIFT_SLOT_KEYS.lists(), params] as const,
  details: () => [...SHIFT_SLOT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SHIFT_SLOT_KEYS.details(), id] as const,
  calendar: () => [...SHIFT_SLOT_KEYS.all, "calendar"] as const,
  dateRange: (startDate: string, endDate: string) =>
    [...SHIFT_SLOT_KEYS.calendar(), startDate, endDate] as const,
  listByEmployee: (params?: ShiftSlotListParams) =>
    [...SHIFT_SLOT_KEYS.lists(), "employee", params] as const,
};

// Get shift slots with pagination and filters
export const useShiftSlots = (
  params: ShiftSlotListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: SHIFT_SLOT_KEYS.list(params),
    queryFn: () => ShiftSlotService.getList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

export const useShiftSlotsByEmployee = (
  params?: ShiftSlotListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: SHIFT_SLOT_KEYS.listByEmployee(params),
    queryFn: () => ShiftSlotService.getListByEmployee(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single shift slot by ID
export const useShiftSlot = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: SHIFT_SLOT_KEYS.detail(id),
    queryFn: () => ShiftSlotService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create shift slot mutation
export const useCreateShiftSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftSlotDto) => ShiftSlotService.create(data),
    onSuccess: (newShiftSlot) => {
      // Invalidate all shift slot lists and calendar data
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.calendar() });

      // Add the new shift slot to cache
      queryClient.setQueryData(
        SHIFT_SLOT_KEYS.detail(newShiftSlot.id),
        newShiftSlot
      );

      message.success("Ca làm việc đã được tạo thành công!");
    },
  });
};

// Create many shift slots mutation
export const useCreateManyShiftSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftSlotDto) => ShiftSlotService.createMany(data),
    onSuccess: (count) => {
      // Invalidate all shift slot lists and calendar data
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.calendar() });

      message.success(`${count} ca làm việc đã được tạo thành công!`);
    },
  });
};

// Update shift slot mutation
export const useUpdateShiftSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShiftSlotDto }) =>
      ShiftSlotService.update(id, data),
    onSuccess: (updatedShiftSlot, { id }) => {
      // Update all relevant caches
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.calendar() });

      // Update specific shift slot cache
      queryClient.setQueryData(SHIFT_SLOT_KEYS.detail(id), updatedShiftSlot);

      message.success("Ca làm việc đã được cập nhật thành công!");
    },
  });
};

// Delete shift slot mutation
export const useDeleteShiftSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftSlotService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from all caches
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_KEYS.calendar() });
      queryClient.removeQueries({
        queryKey: SHIFT_SLOT_KEYS.detail(deletedId),
      });

      message.success("Ca làm việc đã được xóa thành công!");
    },
  });
};

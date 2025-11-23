import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { ShiftSlotTypeService } from "@/services/shiftSlotType.service";
import type {
  CreateShiftSlotTypeDto,
  UpdateShiftSlotTypeDto,
  ShiftSlotTypeListParams,
} from "@/types/shiftSlotType";
import type { ReactQueryOptions } from "@/types/reactQuery";

export const SHIFT_SLOT_TYPE_KEYS = {
  all: ["shift-slot-types"] as const,
  lists: () => [...SHIFT_SLOT_TYPE_KEYS.all, "list"] as const,
  list: (params: ShiftSlotTypeListParams) =>
    [...SHIFT_SLOT_TYPE_KEYS.lists(), params] as const,
  details: () => [...SHIFT_SLOT_TYPE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SHIFT_SLOT_TYPE_KEYS.details(), id] as const,
};

// Get shift slot types with pagination and filters
export const useShiftSlotTypes = (
  params: ShiftSlotTypeListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: SHIFT_SLOT_TYPE_KEYS.list(params),
    queryFn: () => ShiftSlotTypeService.getList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single shift slot type by ID
export const useShiftSlotType = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: SHIFT_SLOT_TYPE_KEYS.detail(id),
    queryFn: () => ShiftSlotTypeService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create shift slot type mutation
export const useCreateShiftSlotType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftSlotTypeDto) =>
      ShiftSlotTypeService.create(data),
    onSuccess: (newShiftSlotType) => {
      // Invalidate all shift slot type lists
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_TYPE_KEYS.lists() });

      // Add the new shift slot type to cache
      queryClient.setQueryData(
        SHIFT_SLOT_TYPE_KEYS.detail(newShiftSlotType.id),
        newShiftSlotType
      );

      message.success("Loại ca làm việc đã được tạo thành công!");
    },
  });
};

// Update shift slot type mutation
export const useUpdateShiftSlotType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShiftSlotTypeDto }) =>
      ShiftSlotTypeService.update(id, data),
    onSuccess: (updatedShiftSlotType, { id }) => {
      // Update all relevant caches
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_TYPE_KEYS.lists() });

      // Update specific shift slot type cache
      queryClient.setQueryData(
        SHIFT_SLOT_TYPE_KEYS.detail(id),
        updatedShiftSlotType
      );

      message.success("Loại ca làm việc đã được cập nhật thành công!");
    },
  });
};

// Delete shift slot type mutation
export const useDeleteShiftSlotType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftSlotTypeService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from all caches
      queryClient.invalidateQueries({ queryKey: SHIFT_SLOT_TYPE_KEYS.lists() });

      queryClient.removeQueries({
        queryKey: SHIFT_SLOT_TYPE_KEYS.detail(deletedId),
      });

      message.success("Loại ca làm việc đã được xóa thành công!");
    },
  });
};

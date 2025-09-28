import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { DepartmentService } from "../services/department.service";
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentListParams,
} from "../types/department";
import type { ReactQueryOptions } from "../types/reactQuery";

export const DEPARTMENT_KEYS = {
  all: ["departments"] as const,
  lists: () => [...DEPARTMENT_KEYS.all, "list"] as const,
  list: (params: DepartmentListParams) =>
    [...DEPARTMENT_KEYS.lists(), params] as const,
  details: () => [...DEPARTMENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...DEPARTMENT_KEYS.details(), id] as const,
};

// Get departments with pagination
export const useDepartments = (
  params: DepartmentListParams,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: DEPARTMENT_KEYS.list(params),
    queryFn: () => DepartmentService.getList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Get single department
export const useDepartment = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: DEPARTMENT_KEYS.detail(id),
    queryFn: () => DepartmentService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create department mutation
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) =>
      DepartmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
      message.success("Phòng ban đã được tạo thành công!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi tạo phòng ban");
    },
  });
};

// Update department mutation
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      DepartmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.all });
      message.success("Phòng ban đã được cập nhật thành công!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi cập nhật phòng ban");
    },
  });
};

// Delete department mutation
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DepartmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
      message.success("Phòng ban đã được xóa thành công!");
    },
    onError: (error: any) => {
      message.error(error?.message || "Lỗi khi xóa phòng ban");
    },
  });
};

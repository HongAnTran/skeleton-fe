import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { EmployeeService } from "../services/employee.service";
import type {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeListParams,
  EmployeeShiftSummaryParams,
} from "../types/employee";
import type { ReactQueryOptions } from "../types/reactQuery";

export const EMPLOYEE_KEYS = {
  all: ["employees"] as const,
  lists: () => [...EMPLOYEE_KEYS.all, "list"] as const,
  list: (params: EmployeeListParams) =>
    [...EMPLOYEE_KEYS.lists(), params] as const,
  details: () => [...EMPLOYEE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EMPLOYEE_KEYS.details(), id] as const,
  dropdown: () => [...EMPLOYEE_KEYS.all, "dropdown"] as const,
  shiftSummary: (id: string, params: EmployeeShiftSummaryParams) =>
    [...EMPLOYEE_KEYS.detail(id), "shift-summary", params] as const,
};

// Get employees with pagination and filters
export const useEmployees = (
  params: EmployeeListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: EMPLOYEE_KEYS.list(params),
    queryFn: () => EmployeeService.getList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single employee by ID
export const useEmployee = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.detail(id),
    queryFn: () => EmployeeService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Get employee shift summary
export const useEmployeeShiftSummary = (
  id: string,
  params: EmployeeShiftSummaryParams,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.shiftSummary(id, params),
    queryFn: () => EmployeeService.getShiftSummary(id, params),
    enabled: !!id && !!params.startDate && !!params.endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Create employee mutation
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => EmployeeService.create(data),
    onSuccess: (newEmployee) => {
      // Invalidate all employee lists
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.dropdown() });

      // Add the new employee to cache
      queryClient.setQueryData(
        EMPLOYEE_KEYS.detail(newEmployee.id),
        newEmployee
      );

      message.success("Nhân viên đã được tạo thành công!");
    },
  });
};

// Update employee mutation
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      EmployeeService.update(id, data),
    onSuccess: (updatedEmployee, { id }) => {
      // Update all relevant caches
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.dropdown() });

      // Update specific employee cache
      queryClient.setQueryData(EMPLOYEE_KEYS.detail(id), updatedEmployee);

      message.success("Nhân viên đã được cập nhật thành công!");
    },
  });
};

// Delete employee mutation
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EmployeeService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from all caches
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.dropdown() });
      queryClient.removeQueries({ queryKey: EMPLOYEE_KEYS.detail(deletedId) });

      message.success("Nhân viên đã được xóa thành công!");
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { TaskService } from "../services/task.service";
import { TaskCycleService } from "../services/taskCycle.service";
import { TaskAssignmentService } from "../services/taskAssignment.service";
import type {
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
  CreateTaskCycleDto,
  UpdateTaskCycleDto,
  QueryTaskCycleDto,
  CreateTaskAssignmentDto,
  AssignEmployeesToCycleDto,
  QueryAssignmentDto,
  RejectAssignmentDto,
  CreateTaskCycleAllDto,
  TaskStatusV2,
} from "../types/task";
import type { ReactQueryOptions } from "../types/reactQuery";

// ==================== QUERY KEYS ====================

export const TASK_KEYS = {
  all: ["tasks"] as const,
  lists: () => [...TASK_KEYS.all, "list"] as const,
  list: (params?: QueryTaskDto) => [...TASK_KEYS.lists(), params] as const,
  details: () => [...TASK_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const,
};

export const TASK_CYCLE_KEYS = {
  all: ["task-cycles"] as const,
  lists: () => [...TASK_CYCLE_KEYS.all, "list"] as const,
  list: (params?: QueryTaskCycleDto) =>
    [...TASK_CYCLE_KEYS.lists(), params] as const,
  details: () => [...TASK_CYCLE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_CYCLE_KEYS.details(), id] as const,
};

export const TASK_ASSIGNMENT_KEYS = {
  all: ["task-assignments"] as const,
  lists: () => [...TASK_ASSIGNMENT_KEYS.all, "list"] as const,
  list: (params?: QueryAssignmentDto) =>
    [...TASK_ASSIGNMENT_KEYS.lists(), params] as const,
  details: () => [...TASK_ASSIGNMENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_ASSIGNMENT_KEYS.details(), id] as const,
  employee: (status?: TaskStatusV2) =>
    [...TASK_ASSIGNMENT_KEYS.all, "employee", status] as const,
  pendingApprovals: (departmentId?: string) =>
    [...TASK_ASSIGNMENT_KEYS.all, "pending-approvals", departmentId] as const,
};

// ==================== TASK QUERIES ====================

/**
 * Get all tasks with optional filters
 */
export const useTasks = (
  params?: QueryTaskDto,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_KEYS.list(params),
    queryFn: () => TaskService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get single task by ID with relations
 */
export const useTask = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => TaskService.getById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Create task mutation
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => TaskService.create(data),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      queryClient.setQueryData(TASK_KEYS.detail(newTask.id), newTask);
      message.success("Task đã được tạo thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi tạo task!");
    },
  });
};

/**
 * Update task mutation
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      TaskService.update(id, data),
    onSuccess: (updatedTask, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      queryClient.setQueryData(TASK_KEYS.detail(id), updatedTask);
      message.success("Task đã được cập nhật!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi cập nhật task!");
    },
  });
};

/**
 * Delete task mutation
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      queryClient.removeQueries({ queryKey: TASK_KEYS.detail(deletedId) });
      message.success("Task đã được xóa!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi xóa task!");
    },
  });
};

// ==================== TASK CYCLE QUERIES ====================

/**
 * Get all cycles with optional filters
 */
export const useTaskCycles = (
  params?: QueryTaskCycleDto,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_CYCLE_KEYS.list(params),
    queryFn: () => TaskCycleService.getAll(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Get single cycle by ID
 */
export const useTaskCycle = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: TASK_CYCLE_KEYS.detail(id),
    queryFn: () => TaskCycleService.getById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Create cycle mutation
 */
export const useCreateTaskCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskCycleDto) => TaskCycleService.create(data),
    onSuccess: (newCycle) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      queryClient.setQueryData(TASK_CYCLE_KEYS.detail(newCycle.id), newCycle);
      message.success("Chu kỳ đã được tạo thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi tạo chu kỳ!");
    },
  });
};

export const useCreateTaskCycleAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskCycleAllDto) =>
      TaskCycleService.createAll(data),
    onSuccess: (newCycle) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      message.success(
        `Chu kỳ đã được tạo thành công! ${newCycle.length} chu kỳ`
      );
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi tạo chu kỳ!");
    },
  });
};

/**
 * Update cycle mutation
 */
export const useUpdateTaskCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskCycleDto }) =>
      TaskCycleService.update(id, data),
    onSuccess: (updatedCycle, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.setQueryData(TASK_CYCLE_KEYS.detail(id), updatedCycle);
      message.success("Chu kỳ đã được cập nhật!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi cập nhật chu kỳ!");
    },
  });
};

/**
 * Delete cycle mutation
 */
export const useDeleteTaskCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskCycleService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      queryClient.removeQueries({
        queryKey: TASK_CYCLE_KEYS.detail(deletedId),
      });
      message.success("Chu kỳ đã được xóa!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi xóa chu kỳ!");
    },
  });
};

// ==================== TASK ASSIGNMENT QUERIES ====================

/**
 * Get all assignments with optional filters
 */
export const useTaskAssignments = (
  params?: QueryAssignmentDto,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_ASSIGNMENT_KEYS.list(params),
    queryFn: () => TaskAssignmentService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Get single assignment by ID
 */
export const useTaskAssignment = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: TASK_ASSIGNMENT_KEYS.detail(id),
    queryFn: () => TaskAssignmentService.getById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Get employee's assignments
 */
export const useEmployeeAssignments = (
  status?: TaskStatusV2,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_ASSIGNMENT_KEYS.employee(status),
    queryFn: () => TaskAssignmentService.getEmployeeAssignments({ status }),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Get pending approvals for manager
 */
export const usePendingApprovals = (
  departmentId?: string,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_ASSIGNMENT_KEYS.pendingApprovals(departmentId),
    queryFn: () => TaskAssignmentService.getPendingApprovals({ departmentId }),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Create assignment mutation
 */
export const useCreateTaskAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskAssignmentDto) =>
      TaskAssignmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_ASSIGNMENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      message.success("Đã gán task thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi gán task!");
    },
  });
};

/**
 * Bulk assign to cycle mutation
 */
export const useAssignToCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignEmployeesToCycleDto) =>
      TaskAssignmentService.assignToCycle(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TASK_ASSIGNMENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      message.success(`Đã gán ${result.assignedCount} nhân viên thành công!`);
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi gán nhân viên!");
    },
  });
};

/**
 * Delete assignment mutation
 */
export const useDeleteTaskAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskAssignmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_ASSIGNMENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      message.success("Đã xóa assignment!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi xóa assignment!");
    },
  });
};

// ==================== EMPLOYEE ACTIONS ====================

/**
 * Employee complete task mutation
 */
export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskAssignmentService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_ASSIGNMENT_KEYS.lists() });
      message.success("Đã đánh dấu hoàn thành! Chờ manager phê duyệt.");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi hoàn thành task!");
    },
  });
};

// ==================== MANAGER ACTIONS ====================

/**
 * Manager approve task mutation
 */
export const useApproveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskAssignmentService.approve(id),
    onSuccess: (updatedAssignment) => {
      queryClient.invalidateQueries({ queryKey: TASK_ASSIGNMENT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: TASK_ASSIGNMENT_KEYS.pendingApprovals(),
      });
      queryClient.invalidateQueries({
        queryKey: TASK_ASSIGNMENT_KEYS.employee(updatedAssignment.status),
      });
      queryClient.setQueryData(
        TASK_ASSIGNMENT_KEYS.detail(updatedAssignment.id),
        updatedAssignment
      );
      message.success("Đã phê duyệt task!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi phê duyệt task!");
    },
  });
};

/**
 * Manager reject task mutation
 */
export const useRejectTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectAssignmentDto }) =>
      TaskAssignmentService.reject(id, data),
    onSuccess: (updatedAssignment) => {
      queryClient.invalidateQueries({ queryKey: TASK_ASSIGNMENT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: TASK_ASSIGNMENT_KEYS.pendingApprovals(),
      });
      queryClient.invalidateQueries({
        queryKey: TASK_ASSIGNMENT_KEYS.employee(updatedAssignment.status),
      });
      queryClient.setQueryData(
        TASK_ASSIGNMENT_KEYS.detail(updatedAssignment.id),
        updatedAssignment
      );
      message.success("Đã từ chối task!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi từ chối task!");
    },
  });
};

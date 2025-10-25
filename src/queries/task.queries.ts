import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  TaskTemplateService,
  TaskScheduleService,
  TaskCycleService,
  TaskInstanceService,
} from "../services/task.service";
import type {
  CreateTaskTemplateDto,
  UpdateTaskTemplateDto,
  CreateTaskScheduleDto,
  UpdateTaskScheduleDto,
  CreateTaskCycleDto,
  UpdateTaskCycleDto,
  CreateTaskInstanceDto,
  UpdateTaskInstanceDto,
  UpdateTaskProgressDto,
  CompleteTaskInstanceDto,
  ApproveTaskInstanceDto,
  RejectTaskInstanceDto,
  TaskTemplateListParams,
  TaskScheduleListParams,
  TaskCycleListParams,
  TaskInstanceListParams,
} from "../types/task";
import type { ReactQueryOptions } from "../types/reactQuery";

// Task Template Query Keys
export const TASK_TEMPLATE_KEYS = {
  all: ["task-templates"] as const,
  lists: () => [...TASK_TEMPLATE_KEYS.all, "list"] as const,
  list: (params?: TaskTemplateListParams) =>
    [...TASK_TEMPLATE_KEYS.lists(), params] as const,
  details: () => [...TASK_TEMPLATE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_TEMPLATE_KEYS.details(), id] as const,
  statistics: (id: string) =>
    [...TASK_TEMPLATE_KEYS.detail(id), "statistics"] as const,
};

// Task Schedule Query Keys
export const TASK_SCHEDULE_KEYS = {
  all: ["task-schedules"] as const,
  lists: () => [...TASK_SCHEDULE_KEYS.all, "list"] as const,
  list: (params?: TaskScheduleListParams) =>
    [...TASK_SCHEDULE_KEYS.lists(), params] as const,
  details: () => [...TASK_SCHEDULE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_SCHEDULE_KEYS.details(), id] as const,
};

// Task Cycle Query Keys
export const TASK_CYCLE_KEYS = {
  all: ["task-cycles"] as const,
  lists: () => [...TASK_CYCLE_KEYS.all, "list"] as const,
  list: (params?: TaskCycleListParams) =>
    [...TASK_CYCLE_KEYS.lists(), params] as const,
  details: () => [...TASK_CYCLE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_CYCLE_KEYS.details(), id] as const,
  statistics: (id: string) =>
    [...TASK_CYCLE_KEYS.detail(id), "statistics"] as const,
};

// Task Instance Query Keys
export const TASK_INSTANCE_KEYS = {
  all: ["task-instances"] as const,
  lists: () => [...TASK_INSTANCE_KEYS.all, "list"] as const,
  list: (params?: TaskInstanceListParams) =>
    [...TASK_INSTANCE_KEYS.lists(), params] as const,
  details: () => [...TASK_INSTANCE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_INSTANCE_KEYS.details(), id] as const,
  statistics: (params?: TaskInstanceListParams) =>
    [...TASK_INSTANCE_KEYS.all, "statistics", params] as const,
};

// ==================== TASK TEMPLATE HOOKS ====================

// Get task templates
export const useTaskTemplates = (
  params?: TaskTemplateListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: TASK_TEMPLATE_KEYS.list(params),
    queryFn: () => TaskTemplateService.getList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single task template
export const useTaskTemplate = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: TASK_TEMPLATE_KEYS.detail(id),
    queryFn: () => TaskTemplateService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Get task template statistics
export const useTaskTemplateStatistics = (
  id: string,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_TEMPLATE_KEYS.statistics(id),
    queryFn: () => TaskTemplateService.getStatistics(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Create task template
export const useCreateTaskTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskTemplateDto) =>
      TaskTemplateService.create(data),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: TASK_TEMPLATE_KEYS.lists() });
      queryClient.setQueryData(
        TASK_TEMPLATE_KEYS.detail(newTemplate.id),
        newTemplate
      );
      message.success("Mẫu nhiệm vụ đã được tạo thành công!");
    },
  });
};

// Update task template
export const useUpdateTaskTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskTemplateDto }) =>
      TaskTemplateService.update(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_TEMPLATE_KEYS.lists() });
      queryClient.setQueryData(TASK_TEMPLATE_KEYS.detail(id), updatedTemplate);
      message.success("Mẫu nhiệm vụ đã được cập nhật thành công!");
    },
  });
};

// Toggle task template active status
export const useToggleTaskTemplateActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskTemplateService.toggleActive(id),
    onSuccess: (updatedTemplate, id) => {
      queryClient.invalidateQueries({ queryKey: TASK_TEMPLATE_KEYS.lists() });
      queryClient.setQueryData(TASK_TEMPLATE_KEYS.detail(id), updatedTemplate);
      message.success("Trạng thái mẫu nhiệm vụ đã được cập nhật!");
    },
  });
};

// Delete task template
export const useDeleteTaskTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskTemplateService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: TASK_TEMPLATE_KEYS.lists() });
      queryClient.removeQueries({
        queryKey: TASK_TEMPLATE_KEYS.detail(deletedId),
      });
      message.success("Mẫu nhiệm vụ đã được xóa thành công!");
    },
  });
};

// ==================== TASK SCHEDULE HOOKS ====================

// Get task schedules
export const useTaskSchedules = (
  params?: TaskScheduleListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: TASK_SCHEDULE_KEYS.list(params),
    queryFn: () => TaskScheduleService.getList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single task schedule
export const useTaskSchedule = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: TASK_SCHEDULE_KEYS.detail(id),
    queryFn: () => TaskScheduleService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create task schedule
export const useCreateTaskSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskScheduleDto) =>
      TaskScheduleService.create(data),
    onSuccess: (newSchedule) => {
      queryClient.invalidateQueries({ queryKey: TASK_SCHEDULE_KEYS.lists() });
      queryClient.setQueryData(
        TASK_SCHEDULE_KEYS.detail(newSchedule.id),
        newSchedule
      );
      message.success("Lịch trình nhiệm vụ đã được tạo thành công!");
    },
  });
};

// Update task schedule
export const useUpdateTaskSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskScheduleDto }) =>
      TaskScheduleService.update(id, data),
    onSuccess: (updatedSchedule, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_SCHEDULE_KEYS.lists() });
      queryClient.setQueryData(TASK_SCHEDULE_KEYS.detail(id), updatedSchedule);
      message.success("Lịch trình nhiệm vụ đã được cập nhật thành công!");
    },
  });
};

// Generate cycles for specific schedule
export const useGenerateTaskScheduleCycles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, upToDate }: { id: string; upToDate?: string }) =>
      TaskScheduleService.generateCycles(id, upToDate),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      message.success(`Đã tạo ${result.length} chu kỳ mới!`);
    },
  });
};

// Generate cycles for all schedules
export const useGenerateAllTaskScheduleCycles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (upToDate?: string) =>
      TaskScheduleService.generateAllCycles(upToDate),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      const totalCycles = result.reduce(
        (sum, item) => sum + item.cyclesCreated,
        0
      );
      message.success(
        `Đã tạo ${totalCycles} chu kỳ mới cho tất cả lịch trình!`
      );
    },
  });
};

// Delete task schedule
export const useDeleteTaskSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskScheduleService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: TASK_SCHEDULE_KEYS.lists() });
      queryClient.removeQueries({
        queryKey: TASK_SCHEDULE_KEYS.detail(deletedId),
      });
      message.success("Lịch trình nhiệm vụ đã được xóa thành công!");
    },
  });
};

// ==================== TASK CYCLE HOOKS ====================

// Get task cycles
export const useTaskCycles = (
  params?: TaskCycleListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: TASK_CYCLE_KEYS.list(params),
    queryFn: () => TaskCycleService.getList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single task cycle
export const useTaskCycle = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: TASK_CYCLE_KEYS.detail(id),
    queryFn: () => TaskCycleService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Get task cycle statistics
export const useTaskCycleStatistics = (
  id: string,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_CYCLE_KEYS.statistics(id),
    queryFn: () => TaskCycleService.getStatistics(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Create task cycle
export const useCreateTaskCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskCycleDto) => TaskCycleService.create(data),
    onSuccess: (newCycle) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.setQueryData(TASK_CYCLE_KEYS.detail(newCycle.id), newCycle);
      message.success("Chu kỳ nhiệm vụ đã được tạo thành công!");
    },
  });
};

// Update task cycle
export const useUpdateTaskCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskCycleDto }) =>
      TaskCycleService.update(id, data),
    onSuccess: (updatedCycle, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.setQueryData(TASK_CYCLE_KEYS.detail(id), updatedCycle);
      message.success("Chu kỳ nhiệm vụ đã được cập nhật thành công!");
    },
  });
};

// Generate instances for cycle
export const useGenerateTaskCycleInstances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskCycleService.generateInstances(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      message.success(`Đã tạo ${result.instancesCreated} nhiệm vụ mới!`);
    },
  });
};

// Update task cycle status
export const useUpdateTaskCycleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskCycleService.updateStatus(id),
    onSuccess: (updatedCycle, id) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.setQueryData(TASK_CYCLE_KEYS.detail(id), updatedCycle);
      message.success("Trạng thái chu kỳ đã được cập nhật!");
    },
  });
};

// Delete task cycle
export const useDeleteTaskCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskCycleService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: TASK_CYCLE_KEYS.lists() });
      queryClient.removeQueries({
        queryKey: TASK_CYCLE_KEYS.detail(deletedId),
      });
      message.success("Chu kỳ nhiệm vụ đã được xóa thành công!");
    },
  });
};

// ==================== TASK INSTANCE HOOKS ====================

// Get task instances
export const useTaskInstances = (
  params?: TaskInstanceListParams,
  options?: ReactQueryOptions
) => {
  const onSuccess = options?.onSuccess;
  const query = useQuery({
    queryKey: TASK_INSTANCE_KEYS.list(params),
    queryFn: () => TaskInstanceService.getList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });

  if (query.isSuccess && query.data) {
    onSuccess?.(query.data);
  }
  return query;
};

// Get single task instance
export const useTaskInstance = (id: string, options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: TASK_INSTANCE_KEYS.detail(id),
    queryFn: () => TaskInstanceService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Get task instance statistics
export const useTaskInstanceStatistics = (
  params?: TaskInstanceListParams,
  options?: ReactQueryOptions
) => {
  return useQuery({
    queryKey: TASK_INSTANCE_KEYS.statistics(params),
    queryFn: () => TaskInstanceService.getStatistics(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Create task instance
export const useCreateTaskInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInstanceDto) =>
      TaskInstanceService.create(data),
    onSuccess: (newInstance) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      queryClient.setQueryData(
        TASK_INSTANCE_KEYS.detail(newInstance.id),
        newInstance
      );
      message.success("Nhiệm vụ đã được tạo thành công!");
    },
  });
};

// Update task instance
export const useUpdateTaskInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInstanceDto }) =>
      TaskInstanceService.update(id, data),
    onSuccess: (updatedInstance, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      queryClient.setQueryData(TASK_INSTANCE_KEYS.detail(id), updatedInstance);
      message.success("Nhiệm vụ đã được cập nhật thành công!");
    },
  });
};

// Update task progress
export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskProgressDto }) =>
      TaskInstanceService.updateProgress(id, data),
    onSuccess: (updatedInstance, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      queryClient.setQueryData(TASK_INSTANCE_KEYS.detail(id), updatedInstance);
      message.success("Tiến độ nhiệm vụ đã được cập nhật!");
    },
  });
};

// Complete task
export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteTaskInstanceDto }) =>
      TaskInstanceService.complete(id, data),
    onSuccess: (updatedInstance, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      queryClient.setQueryData(TASK_INSTANCE_KEYS.detail(id), updatedInstance);
      message.success("Nhiệm vụ đã được hoàn thành!");
    },
  });
};

// Approve task
export const useApproveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveTaskInstanceDto }) =>
      TaskInstanceService.approve(id, data),
    onSuccess: (updatedInstance, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      queryClient.setQueryData(TASK_INSTANCE_KEYS.detail(id), updatedInstance);
      message.success("Nhiệm vụ đã được phê duyệt!");
    },
  });
};

// Reject task
export const useRejectTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectTaskInstanceDto }) =>
      TaskInstanceService.reject(id, data),
    onSuccess: (updatedInstance, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      queryClient.setQueryData(TASK_INSTANCE_KEYS.detail(id), updatedInstance);
      message.success("Nhiệm vụ đã bị từ chối!");
    },
  });
};

// Mark task instances as expired
export const useMarkTaskInstancesExpired = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycleId: string) => TaskInstanceService.markExpired(cycleId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      message.success(`Đã đánh dấu ${result.expiredCount} nhiệm vụ hết hạn!`);
    },
  });
};

// Delete task instance
export const useDeleteTaskInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskInstanceService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: TASK_INSTANCE_KEYS.lists() });
      queryClient.removeQueries({
        queryKey: TASK_INSTANCE_KEYS.detail(deletedId),
      });
      message.success("Nhiệm vụ đã được xóa thành công!");
    },
  });
};

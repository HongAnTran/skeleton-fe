import { axiosInstance } from "../lib/axios";
import type {
  TaskTemplate,
  TaskSchedule,
  TaskCycle,
  TaskInstance,
  TaskTemplateStatistics,
  TaskCycleStatistics,
  TaskInstanceStatistics,
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
  GenerateCyclesResponse,
  GenerateAllCyclesResponse,
  GenerateInstancesResponse,
  MarkExpiredResponse,
} from "../types/task";

// Task Template Service
export class TaskTemplateService {
  static url = "/task-templates";

  // Get all templates with optional filters
  static async getList(
    params?: TaskTemplateListParams
  ): Promise<TaskTemplate[]> {
    const { data } = await axiosInstance.get<TaskTemplate[]>(this.url, {
      params,
    });
    return data;
  }

  // Get single template by ID
  static async getById(id: string): Promise<TaskTemplate> {
    const { data } = await axiosInstance.get<TaskTemplate>(`${this.url}/${id}`);
    return data;
  }

  // Get template statistics
  static async getStatistics(id: string): Promise<TaskTemplateStatistics> {
    const { data } = await axiosInstance.get<TaskTemplateStatistics>(
      `${this.url}/${id}/statistics`
    );
    return data;
  }

  // Create new template
  static async create(request: CreateTaskTemplateDto): Promise<TaskTemplate> {
    const { data } = await axiosInstance.post<TaskTemplate>(this.url, request);
    return data;
  }

  // Update existing template
  static async update(
    id: string,
    request: UpdateTaskTemplateDto
  ): Promise<TaskTemplate> {
    const { data } = await axiosInstance.patch<TaskTemplate>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  // Toggle template active status
  static async toggleActive(id: string): Promise<TaskTemplate> {
    const { data } = await axiosInstance.patch<TaskTemplate>(
      `${this.url}/${id}/toggle-active`
    );
    return data;
  }

  // Delete template
  static async delete(id: string): Promise<TaskTemplate> {
    const { data } = await axiosInstance.delete<TaskTemplate>(
      `${this.url}/${id}`
    );
    return data;
  }
}

// Task Schedule Service
export class TaskScheduleService {
  static url = "/task-schedules";

  // Get all schedules with optional filters
  static async getList(
    params?: TaskScheduleListParams
  ): Promise<TaskSchedule[]> {
    const { data } = await axiosInstance.get<TaskSchedule[]>(this.url, {
      params,
    });
    return data;
  }

  // Get single schedule by ID
  static async getById(id: string): Promise<TaskSchedule> {
    const { data } = await axiosInstance.get<TaskSchedule>(`${this.url}/${id}`);
    return data;
  }

  // Create new schedule
  static async create(request: CreateTaskScheduleDto): Promise<TaskSchedule> {
    const { data } = await axiosInstance.post<TaskSchedule>(this.url, request);
    return data;
  }

  // Update existing schedule
  static async update(
    id: string,
    request: UpdateTaskScheduleDto
  ): Promise<TaskSchedule> {
    const { data } = await axiosInstance.patch<TaskSchedule>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  // Generate cycles for specific schedule
  static async generateCycles(
    id: string,
    upToDate?: string
  ): Promise<GenerateCyclesResponse[]> {
    const { data } = await axiosInstance.post<GenerateCyclesResponse[]>(
      `${this.url}/${id}/generate-cycles`,
      upToDate ? { upToDate } : {}
    );
    return data;
  }

  // Generate cycles for all schedules
  static async generateAllCycles(
    upToDate?: string
  ): Promise<GenerateAllCyclesResponse[]> {
    const { data } = await axiosInstance.post<GenerateAllCyclesResponse[]>(
      `${this.url}/generate-all-cycles`,
      upToDate ? { upToDate } : {}
    );
    return data;
  }

  // Delete schedule
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }
}

// Task Cycle Service
export class TaskCycleService {
  static url = "/task-cycles";

  // Get all cycles with optional filters
  static async getList(params?: TaskCycleListParams): Promise<TaskCycle[]> {
    const { data } = await axiosInstance.get<TaskCycle[]>(this.url, { params });
    return data;
  }

  // Get single cycle by ID
  static async getById(id: string): Promise<TaskCycle> {
    const { data } = await axiosInstance.get<TaskCycle>(`${this.url}/${id}`);
    return data;
  }

  // Get cycle statistics
  static async getStatistics(id: string): Promise<TaskCycleStatistics> {
    const { data } = await axiosInstance.get<TaskCycleStatistics>(
      `${this.url}/${id}/statistics`
    );
    return data;
  }

  // Create new cycle (manual)
  static async create(request: CreateTaskCycleDto): Promise<TaskCycle> {
    const { data } = await axiosInstance.post<TaskCycle>(this.url, request);
    return data;
  }

  // Update existing cycle
  static async update(
    id: string,
    request: UpdateTaskCycleDto
  ): Promise<TaskCycle> {
    const { data } = await axiosInstance.patch<TaskCycle>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  // Generate instances for cycle
  static async generateInstances(
    id: string
  ): Promise<GenerateInstancesResponse> {
    const { data } = await axiosInstance.post<GenerateInstancesResponse>(
      `${this.url}/${id}/generate-instances`
    );
    return data;
  }

  // Update cycle status
  static async updateStatus(id: string): Promise<TaskCycle> {
    const { data } = await axiosInstance.post<TaskCycle>(
      `${this.url}/${id}/update-status`
    );
    return data;
  }

  // Delete cycle
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }
}

// Task Instance Service
export class TaskInstanceService {
  static url = "/task-instances";

  // Get all instances with optional filters
  static async getList(
    params?: TaskInstanceListParams
  ): Promise<TaskInstance[]> {
    const { data } = await axiosInstance.get<TaskInstance[]>(this.url, {
      params,
    });
    return data;
  }

  // Get single instance by ID
  static async getById(id: string): Promise<TaskInstance> {
    const { data } = await axiosInstance.get<TaskInstance>(`${this.url}/${id}`);
    return data;
  }

  // Get instance statistics
  static async getStatistics(
    params?: TaskInstanceListParams
  ): Promise<TaskInstanceStatistics> {
    const { data } = await axiosInstance.get<TaskInstanceStatistics>(
      `${this.url}/statistics`,
      { params }
    );
    return data;
  }

  // Create new instance (manual)
  static async create(request: CreateTaskInstanceDto): Promise<TaskInstance> {
    const { data } = await axiosInstance.post<TaskInstance>(this.url, request);
    return data;
  }

  // Update existing instance
  static async update(
    id: string,
    request: UpdateTaskInstanceDto
  ): Promise<TaskInstance> {
    const { data } = await axiosInstance.patch<TaskInstance>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  // Update task progress
  static async updateProgress(
    id: string,
    request: UpdateTaskProgressDto
  ): Promise<TaskInstance> {
    const { data } = await axiosInstance.post<TaskInstance>(
      `${this.url}/${id}/update-progress`,
      request
    );
    return data;
  }

  // Complete task
  static async complete(
    id: string,
    request: CompleteTaskInstanceDto
  ): Promise<TaskInstance> {
    const { data } = await axiosInstance.post<TaskInstance>(
      `${this.url}/${id}/complete`,
      request
    );
    return data;
  }

  // Approve task
  static async approve(
    id: string,
    request: ApproveTaskInstanceDto
  ): Promise<TaskInstance> {
    const { data } = await axiosInstance.post<TaskInstance>(
      `${this.url}/${id}/approve`,
      request
    );
    return data;
  }

  // Reject task
  static async reject(
    id: string,
    request: RejectTaskInstanceDto
  ): Promise<TaskInstance> {
    const { data } = await axiosInstance.post<TaskInstance>(
      `${this.url}/${id}/reject`,
      request
    );
    return data;
  }

  // Mark instances as expired for a cycle
  static async markExpired(cycleId: string): Promise<MarkExpiredResponse> {
    const { data } = await axiosInstance.post<MarkExpiredResponse>(
      `${this.url}/cycles/${cycleId}/mark-expired`
    );
    return data;
  }

  // Delete instance
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }
}

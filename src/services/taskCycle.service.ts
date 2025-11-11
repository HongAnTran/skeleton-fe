import { axiosInstance } from "../lib/axios";
import type {
  TaskCycle,
  TaskCycleWithRelations,
  CreateTaskCycleDto,
  UpdateTaskCycleDto,
  QueryTaskCycleDto,
  CreateTaskCycleAllDto,
} from "../types/task";

/**
 * Task Cycle Service - Manages Task Cycles (Periods)
 */
export class TaskCycleService {
  static url = "/task-cycles";

  /**
   * Get all cycles with optional filters
   */
  static async getAll(params?: QueryTaskCycleDto): Promise<TaskCycle[]> {
    const { data } = await axiosInstance.get<TaskCycle[]>(this.url, { params });
    return data;
  }

  /**
   * Get single cycle by ID with relations
   */
  static async getById(id: string): Promise<TaskCycleWithRelations> {
    const { data } = await axiosInstance.get<TaskCycleWithRelations>(
      `${this.url}/${id}`
    );
    return data;
  }

  /**
   * Create new task cycle
   */
  static async create(request: CreateTaskCycleDto): Promise<TaskCycle> {
    const { data } = await axiosInstance.post<TaskCycle>(this.url, request);
    return data;
  }

  static async createAll(request: CreateTaskCycleAllDto): Promise<TaskCycle[]> {
    const { data } = await axiosInstance.post<TaskCycle[]>(
      this.url + "/all",
      request
    );
    return data;
  }

  /**
   * Update existing cycle
   */
  static async update(
    id: string,
    request: UpdateTaskCycleDto
  ): Promise<TaskCycle> {
    const { data } = await axiosInstance.put<TaskCycle>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  /**
   * Delete cycle
   */
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }
}

import { axiosInstance } from "@/lib/axios";
import type {
  Task,
  TaskWithRelations,
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
} from "@/types/task";

/**
 * Task Service - Manages Task Templates (TaskV2)
 */
export class TaskService {
  static url = "/tasks";

  /**
   * Get all tasks with optional filters
   */
  static async getAll(params?: QueryTaskDto): Promise<Task[]> {
    const { data } = await axiosInstance.get<Task[]>(this.url, { params });
    return data;
  }

  /**
   * Get single task by ID with relations
   */
  static async getById(id: string): Promise<TaskWithRelations> {
    const { data } = await axiosInstance.get<TaskWithRelations>(
      `${this.url}/${id}`
    );
    return data;
  }

  /**
   * Create new task template
   */
  static async create(request: CreateTaskDto): Promise<Task> {
    const { data } = await axiosInstance.post<Task>(this.url, request);
    return data;
  }

  /**
   * Update existing task
   */
  static async update(id: string, request: UpdateTaskDto): Promise<Task> {
    const { data } = await axiosInstance.put<Task>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  /**
   * Delete task
   */
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }
}

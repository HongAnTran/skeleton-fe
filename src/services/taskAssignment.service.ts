import { axiosInstance } from "@/lib/axios";
import type {
  TaskAssignment,
  CreateTaskAssignmentDto,
  AssignEmployeesToCycleDto,
  QueryAssignmentDto,
  RejectAssignmentDto,
  BulkAssignResponse,
  TaskStatusV2,
} from "@/types/task";

/**
 * Task Assignment Service - Manages Task Assignments
 */
export class TaskAssignmentService {
  static url = "/task-assignments";

  /**
   * Get all assignments with optional filters
   */
  static async getAll(params?: QueryAssignmentDto): Promise<TaskAssignment[]> {
    const { data } = await axiosInstance.get<TaskAssignment[]>(this.url, {
      params,
    });
    return data;
  }

  /**
   * Get single assignment by ID
   */
  static async getById(id: string): Promise<TaskAssignment> {
    const { data } = await axiosInstance.get<TaskAssignment>(
      `${this.url}/${id}`
    );
    return data;
  }

  /**
   * Create single assignment
   */
  static async create(
    request: CreateTaskAssignmentDto
  ): Promise<TaskAssignment> {
    const { data } = await axiosInstance.post<TaskAssignment>(
      this.url,
      request
    );
    return data;
  }

  /**
   * Bulk assign employees to cycle
   */
  static async assignToCycle(
    request: AssignEmployeesToCycleDto
  ): Promise<BulkAssignResponse> {
    const { data } = await axiosInstance.post<BulkAssignResponse>(
      `${this.url}/assign-to-cycle`,
      request
    );
    return data;
  }

  /**
   * Quick assign entire department to cycle
   */
  static async assignDepartment(
    cycleId: string,
    departmentId: string
  ): Promise<BulkAssignResponse> {
    const { data } = await axiosInstance.post<BulkAssignResponse>(
      `${this.url}/assign-department/${cycleId}/${departmentId}`
    );
    return data;
  }

  /**
   * Delete assignment
   */
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }

  // ==================== EMPLOYEE ACTIONS ====================

  /**
   * Employee marks task as complete
   */
  static async complete(id: string): Promise<TaskAssignment> {
    const { data } = await axiosInstance.post<TaskAssignment>(
      `${this.url}/${id}/complete`
    );
    return data;
  }

  /**
   * Get assignments for specific employee
   */
  static async getEmployeeAssignments(params?: {
    status?: TaskStatusV2;
  }): Promise<TaskAssignment[]> {
    const { data } = await axiosInstance.get<TaskAssignment[]>(
      `${this.url}/employee/me`,
      { params }
    );
    return data;
  }

  // ==================== MANAGER ACTIONS ====================

  /**
   * Manager approves completed task
   */
  static async approve(id: string): Promise<TaskAssignment> {
    const { data } = await axiosInstance.post<TaskAssignment>(
      `${this.url}/${id}/approve`
    );
    return data;
  }

  /**
   * Manager rejects completed task
   */
  static async reject(
    id: string,
    request: RejectAssignmentDto
  ): Promise<TaskAssignment> {
    const { data } = await axiosInstance.post<TaskAssignment>(
      `${this.url}/${id}/reject`,
      request
    );
    return data;
  }

  /**
   * Get pending approvals
   */
  static async getPendingApprovals(params?: {
    departmentId?: string;
  }): Promise<TaskAssignment[]> {
    const { data } = await axiosInstance.get<TaskAssignment[]>(
      `${this.url}/pending-approvals`,
      { params }
    );
    return data;
  }
}

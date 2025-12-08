import type { Department } from "./department";
import type { Employee } from "./employee";
import type { User } from "./user";

/**
 * Task/Assignment status
 */
export enum TaskStatusV2 {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  level: number;
  isActive: boolean;
  isTaskTeam: boolean; // false = INDIVIDUAL, true = DEPARTMENT
  departmentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  department?: Department;
  user?: User;
  cycles?: TaskCycle[];
  assignments?: TaskAssignment[];
}

/**
 * Task Cycle (TaskCycleV2)
 */
export interface TaskCycle {
  id: string;
  taskId: string;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  // Relations
  task?: Task;
  assignments?: TaskAssignment[];
}

/**
 * Task Assignment (Junction table)
 */
export interface TaskAssignment {
  id: string;
  cycleId: string;
  employeeId: string;
  status: TaskStatusV2;
  // Completion
  completedAt?: string;
  completedBy?: string;
  // Approval
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  cycle?: TaskCycle;
  employee?: Employee;
}

// ==================== REQUEST DTOs ====================

/**
 * Create Task DTO
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  departmentId: string;
  level?: number;
  isTaskTeam?: boolean;
}

/**
 * Update Task DTO
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  level?: number;
  isTaskTeam?: boolean;
}

/**
 * Query Task DTO
 */
export interface QueryTaskDto {
  departmentId?: string;
  level?: number;
}

/**
 * Create Task Cycle DTO
 */
export interface CreateTaskCycleDto {
  taskId: string;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
}

export interface CreateTaskCycleAllDto {
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
}

/**
 * Update Task Cycle DTO
 */
export interface UpdateTaskCycleDto {
  periodStart?: string;
  periodEnd?: string;
}

/**
 * Query Task Cycle DTO
 */
export interface QueryTaskCycleDto {
  taskId?: string;
  periodStartFrom?: string;
  periodStartTo?: string;
}

/**
 * Create Task Assignment DTO (single)
 */
export interface CreateTaskAssignmentDto {
  cycleId: string;
  employeeId: string;
  status?: TaskStatusV2;
}

/**
 * Assign Employees To Cycle DTO (bulk)
 */
export interface AssignEmployeesToCycleDto {
  cycleId: string;
  employeeIds?: string[];
  departmentId?: string;
}

/**
 * Query Task Assignment DTO
 */
export interface QueryAssignmentDto {
  cycleId?: string;
  employeeId?: string;
  departmentId?: string;
  status?: TaskStatusV2;
  level?: number;
}

/**
 * Reject Assignment DTO
 */
export interface RejectAssignmentDto {
  rejectedReason: string;
}

// ==================== RESPONSE DTOs ====================

/**
 * Task with relations response
 */
export interface TaskWithRelations extends Task {
  department: Department;
  cycles: TaskCycle[];
}

/**
 * Task Cycle with relations response
 */
export interface TaskCycleWithRelations extends TaskCycle {
  task: Task;
  assignments?: TaskAssignment[];
}

/**
 * Bulk assign response
 */
export interface BulkAssignResponse {
  cycleId: string;
  task: Task;
  period: {
    start: string;
    end: string;
  };
  assignedCount: number;
  skippedCount: number;
  assignments: TaskAssignment[];
}

// ==================== UI HELPER TYPES ====================

/**
 * Task card data for UI display
 */
export interface TaskCardData {
  id: string;
  title: string;
  description?: string;
  department: string;
  level: number;
  cycleCount: number;
  assignedCount: number;
  completedCount: number;
  isActive: boolean;
}

/**
 * Assignment card data for employee view
 */
export interface AssignmentCardData {
  id: string;
  taskTitle: string;
  taskDescription?: string;
  status: TaskStatusV2;
  periodStart: string;
  periodEnd: string;
  daysLeft: number;
  completedAt?: string;
  rejectedReason?: string;
  rejectedBy?: string;
}

/**
 * Pending approval item for manager view
 */
export interface PendingApprovalItem {
  assignmentId: string;
  taskTitle: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  completedAt: string;
  hoursAgo: number;
}

/**
 * Task statistics
 */
export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  approved: number;
  rejected: number;
  expired: number;
}

/**
 * Department completion rate
 */
export interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  totalAssignments: number;
  completedAssignments: number;
  approvedAssignments: number;
  completionRate: number; // 0-100
  approvalRate: number; // 0-100
}

/**
 * Employee performance
 */
export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  totalTasks: number;
  completedTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  completionRate: number; // 0-100
  approvalRate: number; // 0-100
}

// ==================== FILTER TYPES ====================

/**
 * Status filter options
 */
export type StatusFilter = TaskStatusV2 | "ALL";

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from?: string; // ISO date string
  to?: string; // ISO date string
}

/**
 * Task filters for list view
 */
export interface TaskFilters {
  departmentId?: string;
  level?: number;
  isActive?: boolean;
  search?: string; // Search in title/description
}

/**
 * Assignment filters for list view
 */
export interface AssignmentFilters {
  status?: StatusFilter;
  departmentId?: string;
  employeeId?: string;
  cycleId?: string;
  dateRange?: DateRangeFilter;
}

// ==================== FORM TYPES ====================

/**
 * Create task form data
 */
export interface CreateTaskFormData {
  // Step 1: Task Info
  title: string;
  description: string;
  departmentId: string;
  level: number;
  isTaskTeam: boolean;
  // Step 2: Period
  periodStart: Date;
  periodEnd: Date;
  // Step 3: Assignment
  assignmentType: "all" | "specific";
  employeeIds?: string[];
}

/**
 * Complete assignment form data
 */
export interface CompleteAssignmentFormData {
  note?: string;
}

/**
 * Reject assignment form data
 */
export interface RejectAssignmentFormData {
  rejectedReason: string;
}

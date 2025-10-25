export enum TaskScope {
  INDIVIDUAL = "INDIVIDUAL",
  DEPARTMENT = "DEPARTMENT",
}

export enum TaskFrequency {
  NONE = "NONE",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
}

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum TaskAggregation {
  COUNT = "COUNT",
  SUM = "SUM",
  AVERAGE = "AVERAGE",
  MAX = "MAX",
  MIN = "MIN",
}

// Task Template interfaces
export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  scope: TaskScope;
  unit?: string;
  defaultTarget?: number;
  aggregation: TaskAggregation;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  schedules?: TaskSchedule[];
  instances?: TaskInstance[];
  _count?: {
    instances: number;
  };
}

export interface CreateTaskTemplateDto {
  title: string;
  description?: string;
  scope: TaskScope;
  level: number;
  unit?: string;
  defaultTarget?: number;
  aggregation?: TaskAggregation;
  isActive?: boolean;
}

export interface UpdateTaskTemplateDto {
  title?: string;
  description?: string;
  scope?: TaskScope;
  level?: number;
  unit?: string;
  defaultTarget?: number;
  aggregation?: TaskAggregation;
  isActive?: boolean;
}

export interface TaskTemplateListParams {
  scope?: TaskScope;
  isActive?: boolean;
}

export interface TaskTemplateStatistics {
  totalInstances: number;
  completedInstances: number;
  approvedInstances: number;
  completionRate: number;
}

// Task Schedule interfaces
export interface TaskSchedule {
  id: string;
  templateId: string;
  frequency: TaskFrequency;
  interval: number;
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  template?: Pick<TaskTemplate, "id" | "title" | "scope">;
  cycles?: TaskCycle[];
  _count?: {
    cycles: number;
  };
}

export interface CreateTaskScheduleDto {
  templateId: string;
  frequency: TaskFrequency;
  interval: number;
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
}

export interface UpdateTaskScheduleDto {
  frequency?: TaskFrequency;
  interval?: number;
  dayOfMonth?: number;
  startDate?: string;
  endDate?: string;
}

export interface TaskScheduleListParams {
  templateId?: string;
  frequency?: TaskFrequency;
}

export interface GenerateCyclesResponse {
  id: string;
  scheduleId: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  status: TaskStatus;
}

export interface GenerateAllCyclesResponse {
  scheduleId: string;
  cyclesCreated: number;
}

// Task Cycle interfaces
export interface TaskCycle {
  id: string;
  scheduleId: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  status: TaskStatus;
  schedule?: {
    id: string;
    frequency: TaskFrequency;
    template?: Pick<TaskTemplate, "id" | "title">;
  };
  instances?: TaskInstance[];
  _count?: {
    instances: number;
  };
}

export interface CreateTaskCycleDto {
  scheduleId: string;
  periodStart: string;
  periodEnd: string;
}

export interface UpdateTaskCycleDto {
  periodStart?: string;
  periodEnd?: string;
  status?: TaskStatus;
}

export interface TaskCycleListParams {
  scheduleId?: string;
  status?: TaskStatus;
  periodStartFrom?: string;
  periodStartTo?: string;
}

export interface TaskCycleStatistics {
  totalInstances: number;
  pendingInstances: number;
  inProgressInstances: number;
  completedInstances: number;
  approvedInstances: number;
  rejectedInstances: number;
  expiredInstances: number;
  completionRate: number;
}

export interface GenerateInstancesResponse {
  cycleId: string;
  instancesCreated: number;
}

// Task Instance interfaces
export interface TaskInstance {
  id: string;
  templateId: string;
  cycleId: string;
  scope: TaskScope;
  employeeId?: string;
  departmentId?: string;
  level: number;
  required: boolean;
  title: string;
  description?: string;
  target?: number;
  unit?: string;
  quantity: number;
  status: TaskStatus;
  completedAt?: string;
  completedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  template?: Pick<TaskTemplate, "id" | "title">;
  cycle?: {
    id: string;
    periodStart: string;
    periodEnd: string;
    schedule?: TaskSchedule;
  };
  employee?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  progressEvents?: TaskProgressEvent[];
  approvals?: TaskApproval[];
  _count?: {
    progressEvents: number;
    approvals: number;
  };
}

export interface TaskProgressEvent {
  id: string;
  instanceId: string;
  delta: number;
  source?: string;
  note?: string;
  occurredAt: string;
  createdAt: string;
  createdBy: string;
}

export interface TaskApproval {
  id: string;
  instanceId: string;
  level: number;
  approvedBy: string;
  approvedAt: string;
  reason?: string;
}

export interface CreateTaskInstanceDto {
  templateId: string;
  cycleId: string;
  scope: TaskScope;
  employeeId?: string;
  departmentId?: string;
  level: number;
  required: boolean;
  title: string;
  description?: string;
  target?: number;
  unit?: string;
}

export interface UpdateTaskInstanceDto {
  title?: string;
  description?: string;
  target?: number;
  unit?: string;
  quantity?: number;
}

export interface UpdateTaskProgressDto {
  delta: number;
  source?: string;
  note?: string;
  occurredAt?: string;
  createdBy?: string;
}

export interface CompleteTaskInstanceDto {
  completedBy: string;
  note?: string;
}

export interface ApproveTaskInstanceDto {
  approvedBy: string;
  reason?: string;
}

export interface RejectTaskInstanceDto {
  rejectedBy: string;
  rejectedReason: string;
}

export interface TaskInstanceListParams {
  cycleId?: string;
  templateId?: string;
  scope?: TaskScope;
  employeeId?: string;
  departmentId?: string;
  status?: TaskStatus;
  level?: number;
}

export interface TaskInstanceStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  approved: number;
  rejected: number;
  expired: number;
  completionRate: number;
}

export interface MarkExpiredResponse {
  expiredCount: number;
}

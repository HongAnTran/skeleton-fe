export interface DashboardStats {
  totalEmployees: number;
  totalBranches: number;
  totalDepartments: number;
  totalShifts: number;
  totalHours: number;
  averageHoursPerEmployee: number;
  shiftUtilizationRate: number;
  attendanceRate: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
  employeeName: string;
  branchName: string;
  departmentName: string;
}

export interface TopPerformer {
  employeeId: string;
  employeeName: string;
  branchName: string;
  departmentName: string;
  totalShifts: number;
  totalHours: number;
  averageHoursPerShift: number;
}

export interface ShiftTrend {
  date: string;
  totalShifts: number;
  totalHours: number;
  utilizationRate: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  branchName: string;
  totalEmployees: number;
  totalShifts: number;
  totalHours: number;
  averageHoursPerEmployee: number;
  utilizationRate: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  topPerformers: TopPerformer[];
  shiftTrends: ShiftTrend[];
  departmentPerformance: DepartmentPerformance[];
  generatedAt: string;
}

export interface DashboardQuery {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  departmentId?: string;
}

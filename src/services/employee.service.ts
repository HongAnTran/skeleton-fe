import { axiosInstance } from "../lib/axios";
import type { PaginatedResult } from "../types/api";
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeListParams,
  EmployeeShiftSummaryResponse,
  EmployeeShiftSummaryParams,
} from "../types/employee";

export class EmployeeService {
  static url = "/employees";

  // Get paginated list of employees with optional filters
  static async getList(params: EmployeeListParams) {
    const { data } = await axiosInstance.get<PaginatedResult<Employee>>(
      this.url,
      { params }
    );
    return data;
  }

  // Get single employee by ID with relations
  static async getById(id: string): Promise<Employee> {
    const { data } = await axiosInstance.get<Employee>(`${this.url}/${id}`);
    return data;
  }

  // Create new employee
  static async create(request: CreateEmployeeDto): Promise<Employee> {
    const { data } = await axiosInstance.post<Employee>(this.url, request);
    return data;
  }

  // Update existing employee
  static async update(
    id: string,
    request: UpdateEmployeeDto
  ): Promise<Employee> {
    const { data } = await axiosInstance.patch<Employee>(
      `${this.url}/${id}`,
      request
    );
    return data;
  }

  // Delete employee
  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.url}/${id}`);
  }

  // Get all employees for dropdown/selection (without pagination)
  static async getAll(): Promise<Employee[]> {
    const { data } = await axiosInstance.get<Employee[]>(`${this.url}/all`);
    return data;
  }

  // Get employee shift summary with total hours
  static async getShiftSummary(
    id: string,
    params: EmployeeShiftSummaryParams
  ): Promise<EmployeeShiftSummaryResponse> {
    const { data } = await axiosInstance.get<EmployeeShiftSummaryResponse>(
      `${this.url}/${id}/shift-summary`,
      { params }
    );
    return data;
  }
}

export interface Department {
  id: string; // UUID
  userId: string; // UUID của user sở hữu department
  name: string; // Tên department (VD: "Human Resources")
  createdAt: Date; // Ngày tạo
  updatedAt: Date; // Ngày cập nhật
  user?: any; // Thông tin user (optional)
}

export interface CreateDepartmentRequest {
  name: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

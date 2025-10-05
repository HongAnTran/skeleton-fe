import { axiosInstance } from "../lib/axios";
import type { LoginResponse, RefreshTokenResponse } from "../types/api";
import type { LoginRequest } from "../types/auth";
import type { Employee } from "../types/employee";
import { tokenStorage } from "../utils/token";

export class AuthEmployeeService {
  static url = "/auth/employee";

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<LoginResponse>(
      `${this.url}/login`,
      credentials
    );

    if (data) {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
      tokenStorage.setType("employee");
    }
    return data;
  }
  static async logout(): Promise<void> {
    try {
      await axiosInstance.post(`${this.url}/logout`);
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      tokenStorage.clearTokens();
    }
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const { data } = await axiosInstance.post<RefreshTokenResponse>(
      `${this.url}/refresh`,
      {
        refreshToken: refreshToken,
      }
    );

    if (data) {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
    }
    return data;
  }

  static async getCurrentEmployee(): Promise<Employee> {
    const { data } = await axiosInstance.get<Employee>(`${this.url}/me`);
    if (!data) {
      throw new Error("No employee data available");
    }
    return data;
  }
}

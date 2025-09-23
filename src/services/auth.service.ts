import { axiosInstance } from "../lib/axios";
import type { LoginResponse, ApiResponse } from "../types/api";
import { tokenStorage } from "../utils/token";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      credentials
    );

    if (data) {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
    }

    return data;
  }

  static async register(userData: RegisterRequest): Promise<User> {
    const { data } = await axiosInstance.post<User>("/auth/register", userData);
    return data;
  }

  static async logout(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      tokenStorage.clearTokens();
    }
  }

  static async getProfile(): Promise<User> {
    const { data } = await axiosInstance.get<User>("/auth/profile");
    return data;
  }

  static async updateProfile(profileData: Partial<User>): Promise<User> {
    const { data } = await axiosInstance.put<User>(
      "/auth/profile",
      profileData
    );
    return data;
  }

  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    return await axiosInstance.put("/auth/change-password", data);
  }

  static async requestPasswordReset(email: string): Promise<ApiResponse> {
    return await axiosInstance.post("/auth/forgot-password", { email });
  }

  static async resetPassword(data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    return await axiosInstance.post("/auth/reset-password", data);
  }

  static async verifyEmail(token: string): Promise<ApiResponse> {
    return await axiosInstance.post("/auth/verify-email", { token });
  }

  static async resendVerification(): Promise<ApiResponse> {
    return await axiosInstance.post("/auth/resend-verification");
  }
}

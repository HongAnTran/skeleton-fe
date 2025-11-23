import { axiosInstance } from "@/lib/axios";
import type { LoginResponse, RefreshTokenResponse } from "@/types/api";
import type { LoginRequest } from "@/types/auth";
import type { User } from "@/types/user";
import { tokenStorage } from "@/utils/token";

export class AuthUserService {
  static url = "/auth/user";

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await axiosInstance.post<LoginResponse>(
      `${this.url}/login`,
      credentials
    );

    if (data) {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
      tokenStorage.setType("user");
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

  static async getCurrentUser(): Promise<User> {
    const { data } = await axiosInstance.get<User>(`${this.url}/me`);
    if (!data) {
      throw new Error("No user data available");
    }
    return data;
  }
}

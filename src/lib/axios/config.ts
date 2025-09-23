import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "../../utils/token";
import type {
  ApiResponse,
  ApiError,
  RefreshTokenResponse,
} from "../../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TIMEOUT = 30000;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
          params: config.params,
        }
      );
    }

    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error("🚨 [API Request Error]", error);
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (import.meta.env.DEV) {
      console.log(
        `✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (import.meta.env.DEV) {
      console.error(
        `❌ [API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        }
      );
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post<RefreshTokenResponse>(
            `${BASE_URL}/auth/refresh`,
            {
              refreshToken: refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          tokenStorage.setTokens(accessToken, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenStorage.clearTokens();

          window.location.href = "/login";

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        tokenStorage.clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    let errorMessage = "An unexpected error occurred";

    switch (error.response?.status) {
      case 400:
        errorMessage = error.response.data?.message || "Bad request";
        break;
      case 403:
        errorMessage = "Access forbidden";
        break;
      case 404:
        errorMessage = "Resource not found";
        break;
      case 422:
        errorMessage = error.response.data?.message || "Validation error";
        break;
      case 500:
        errorMessage = "Internal server error";
        break;
      case 502:
        errorMessage = "Bad gateway";
        break;
      case 503:
        errorMessage = "Service unavailable";
        break;
      default:
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
    }

    const apiError: ApiError = {
      message: errorMessage,
      error: error.response?.data?.error || "API Error",
      statusCode: error.response?.status || 500,
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(apiError);
  }
);

export default axiosInstance;

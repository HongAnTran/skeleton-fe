import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { tokenStorage } from "@/utils/token";
import type { LoginRequest } from "../types/auth";
import type { Employee } from "@/types/employee";
import { AuthEmployeeService } from "@/services/authEmployee.service";
import { Spin } from "antd";
import { useRouter } from "@tanstack/react-router";
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  employee: Employee | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthEmployeeProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    tokenStorage.isAuthenticated()
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (tokenStorage.isAuthenticated()) {
        const token = tokenStorage.getAccessToken();
        if (token && !tokenStorage.isTokenExpired(token)) {
          await fetchCurrentUser();
        } else {
          try {
            await AuthEmployeeService.refreshToken();
            await fetchCurrentUser();
          } catch (error) {
            console.error("Failed to refresh token:", error);
            await handleLogout();
          }
        }
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      await handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await AuthEmployeeService.getCurrentEmployee();
      setEmployee(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      await handleLogout();
    }
  };

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      try {
        setLoading(true);
        await AuthEmployeeService.login(credentials);
        await fetchCurrentUser();
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthEmployeeService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      await handleLogout();
    }
  }, []);

  const handleLogout = async () => {
    tokenStorage.clearTokens();
    setEmployee(null);
    setIsAuthenticated(false);
    router.navigate({ to: "/e/login" });
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    loading,
    employee,
    login,
    logout,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useEmployeeAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

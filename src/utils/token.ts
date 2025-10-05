// Token management utilities
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const TYPE_KEY = "type";

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  },

  setAccessToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error setting access token:", error);
    }
  },

  // Get refresh token from localStorage
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  // Set refresh token in localStorage
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error setting refresh token:", error);
    }
  },

  // Set both tokens
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  // Clear all tokens
  clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TYPE_KEY);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  setType(type: "user" | "employee"): void {
    try {
      localStorage.setItem(TYPE_KEY, type);
    } catch (error) {
      console.error("Error setting type:", error);
    }
  },

  getType(): "user" | "employee" | null {
    try {
      return localStorage.getItem(TYPE_KEY) as "user" | "employee" | null;
    } catch (error) {
      console.error("Error getting type:", error);
      return null;
    }
  },

  isTokenExpired(token: string): boolean {
    try {
      if (!token) return true;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  },
};

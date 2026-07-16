import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { setAccessToken, axiosInstance } from "../services/api/axios";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "AUDITOR" | "COMMITTEE" | "VIEWER";

export interface User {
  id: string;
  name: string; // mapped from fullName on login
  email: string;
  role: UserRole;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount: try to restore session via refresh token (httpOnly cookie)
    const restoreSession = async () => {
      // Only attempt if we had a previous session flag
      const hadSession = localStorage.getItem("has_session");
      const storedToken = localStorage.getItem("token");
      
      if (!hadSession) {
        setIsLoading(false);
        return;
      }

      // Immediately restore token from localStorage so in-flight requests work
      if (storedToken) {
        setAccessToken(storedToken);
      }

      try {
        // Step 1: Get a fresh access token using the refresh token cookie
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken } = refreshRes.data.data;
        setAccessToken(accessToken);

        // Step 2: Load current user profile
        const meRes = await axiosInstance.get("/auth/me");
        const admin = meRes.data.data.admin;

        setUser({
          id: admin.id,
          name: admin.fullName,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        });
      } catch {
        // Refresh failed — try using the stored token directly as fallback
        if (storedToken) {
          try {
            const meRes = await axiosInstance.get("/auth/me");
            const admin = meRes.data.data.admin;
            setUser({
              id: admin.id,
              name: admin.fullName,
              email: admin.email,
              role: admin.role,
              status: admin.status,
            });
          } catch {
            // Token also invalid — clear everything
            localStorage.removeItem("has_session");
            localStorage.removeItem("token");
            setAccessToken(null);
          }
        } else {
          localStorage.removeItem("has_session");
          setAccessToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("has_session", "true");
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem("has_session");
    setAccessToken(null);
    setUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Access token stored in memory (primary) and localStorage (fallback for page refresh)
let accessTokenMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenMemory = token;
  if (token) {
    localStorage.setItem("has_session", "true");
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("has_session");
    localStorage.removeItem("token");
  }
};

export const getAccessToken = () => {
  // Return in-memory token first, fall back to localStorage
  return accessTokenMemory || localStorage.getItem("token");
};

// Request Interceptor: Attach bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle token refresh and 401 failures
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never attempt refresh for auth endpoints themselves (prevents 401 cascade)
    const skipRefreshUrls = ["/auth/login", "/auth/refresh", "/auth/logout"];
    const requestUrl: string = originalRequest?.url ?? "";
    const isAuthEndpoint = skipRefreshUrls.some((u) => requestUrl.includes(u));

    // Trigger token refresh if token expired, hasn't retried yet, and is NOT an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = refreshResponse.data.data;
        setAccessToken(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        // Clear local credentials on hard session expiry
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Only redirect if on an admin page
        if (
          window.location.pathname.startsWith("/admin") &&
          window.location.pathname !== "/admin/login"
        ) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

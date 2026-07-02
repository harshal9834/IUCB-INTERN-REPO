import { axiosInstance } from "./axios.js";

export const authApi = {
  login: async (payload: any) => {
    return axiosInstance.post("/auth/login", payload);
  },

  logout: async () => {
    return axiosInstance.post("/auth/logout");
  },

  me: async () => {
    return axiosInstance.get("/auth/me");
  },

  refresh: async () => {
    return axiosInstance.post("/auth/refresh");
  },

  forgotPassword: async (payload: any) => {
    return axiosInstance.post("/auth/forgot-password", payload);
  },

  resetPassword: async (payload: any) => {
    return axiosInstance.post("/auth/reset-password", payload);
  },

  changePassword: async (payload: any) => {
    return axiosInstance.patch("/auth/change-password", payload);
  },
};
export default authApi;

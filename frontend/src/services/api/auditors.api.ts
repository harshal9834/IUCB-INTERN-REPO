import { axiosInstance } from "./axios.js";

export const auditorsApi = {
  getAuditors: async (params?: any) => {
    return axiosInstance.get("/auditors", { params });
  },

  // Future Extended CRUD methods compatible with PRD
  createAuditor: async (payload: any) => {
    return axiosInstance.post("/auditors", payload);
  },

  updateAuditor: async (id: string, payload: any) => {
    return axiosInstance.put(`/auditors/${id}`, payload);
  },

  updateAuditorStatus: async (id: string, status: string) => {
    return axiosInstance.put(`/auditors/${id}/status`, { status });
  },

  deleteAuditor: async (id: string) => {
    return axiosInstance.delete(`/auditors/${id}`);
  },

  getAuditorById: async (id: string) => {
    return axiosInstance.get(`/auditors/${id}`);
  },
};
export default auditorsApi;

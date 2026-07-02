import { axiosInstance } from "./axios.js";

export const organizationsApi = {
  getOrganizations: async (params?: any) => {
    return axiosInstance.get("/organizations", { params });
  },

  createOrganization: async (payload: any) => {
    return axiosInstance.post("/organizations", payload);
  },

  updateOrganizationStatus: async (id: string, status: string) => {
    return axiosInstance.patch(`/organizations/${id}/status`, { status });
  },

  // Future Extended CRUD methods compatible with PRD
  getOrganizationById: async (id: string) => {
    return axiosInstance.get(`/organizations/${id}`);
  },

  updateOrganization: async (id: string, payload: any) => {
    return axiosInstance.put(`/organizations/${id}`, payload);
  },

  deleteOrganization: async (id: string) => {
    return axiosInstance.delete(`/organizations/${id}`);
  },
};
export default organizationsApi;

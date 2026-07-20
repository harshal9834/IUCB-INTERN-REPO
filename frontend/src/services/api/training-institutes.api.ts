import { axiosInstance } from "./axios.js";

export interface TrainingInstitute {
  id: string;
  instituteName: string;
  registrationNumber: string;
  country: string;
  countryCode?: string;
  phoneCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  email: string;
  phone: string;
  website?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
  createdAt: string;
  updatedAt: string;
}

export const trainingInstitutesApi = {
  getTrainingInstitutes: async (params?: any) => {
    return axiosInstance.get("/training-institutes", { params });
  },

  getTrainingInstituteById: async (id: string) => {
    return axiosInstance.get(`/training-institutes/${id}`);
  },

  updateTrainingInstituteStatus: async (id: string, status: string) => {
    return axiosInstance.patch(`/training-institutes/${id}/status`, { status });
  },

  updateTrainingInstitute: async (id: string, payload: any) => {
    return axiosInstance.patch(`/training-institutes/${id}`, payload);
  },

  deleteTrainingInstitute: async (id: string) => {
    return axiosInstance.delete(`/training-institutes/${id}`);
  },

  getTrainingInstituteAuditLogs: async (id: string) => {
    return axiosInstance.get(`/training-institutes/${id}/audit-logs`);
  },
};

export default trainingInstitutesApi;

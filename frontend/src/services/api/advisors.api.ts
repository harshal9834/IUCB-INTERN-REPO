import { axiosInstance } from "./axios.js";

export interface Advisor {
  id: string;
  fullName: string;
  linkedinUrl?: string | null;
  organization: string;
  designation: string;
  expertiseArea: string;
  experienceYears: number;
  profilePhoto?: string | null;
  bio?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    applicationNumber?: string;
    email?: string;
    createdAt: string;
    reviewedAt?: string;
    applicationStatus?: string;
    applicationType?: string;
    internalNotes?: string;
  };
}

export const advisorsApi = {
  getAdvisors: async (params?: any) => {
    return axiosInstance.get("/advisors", { params });
  },

  getAdvisorById: async (id: string) => {
    return axiosInstance.get(`/advisors/${id}`);
  },

  getAdvisorAuditLogs: async (id: string) => {
    return axiosInstance.get(`/advisors/${id}/audit-logs`);
  },

  getAdvisorEmailLogs: async (id: string) => {
    return axiosInstance.get(`/advisors/${id}/email-logs`);
  },

  updateAdvisorStatus: async (id: string, status: string, reason?: string) => {
    return axiosInstance.patch(`/advisors/${id}/status`, { status, reason });
  },

  updateAdvisor: async (id: string, payload: any) => {
    return axiosInstance.patch(`/advisors/${id}`, payload);
  },

  sendEmail: async (id: string, recipient: string, subject: string, message: string) => {
    return axiosInstance.post(`/advisors/${id}/send-email`, { recipient, subject, message });
  },

  deleteAdvisor: async (id: string) => {
    return axiosInstance.delete(`/advisors/${id}`);
  },
};

export default advisorsApi;

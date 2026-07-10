import { axiosInstance } from "./axios.js";

// ── Types ────────────────────────────────────────────────────────────────────

export type ApplicationType = "ACCREDITATION" | "AUDITOR" | "TRAINING_INSTITUTE" | "ADVISORY";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Application {
  id: string;
  applicationNumber?: string;
  applicationType: ApplicationType;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  expertiseArea?: string;
  experienceYears?: number;
  statementOfMerit?: string;
  linkedinUrl?: string;
  registrationNumber?: string;
  country?: string;
  website?: string;
  appliedStandard?: string;
  internalNotes?: string;
  resumeUrl?: string;
  applicationStatus: ApplicationStatus;
  reviewedById?: string;
  reviewedAt?: string;
  reviewedBy?: { id: string; fullName: string; email?: string };
  createdAt: string;
  updatedAt: string;
  advisor?: any;
}

export interface ApplicationsListResponse {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── API ──────────────────────────────────────────────────────────────────────

export const applicationsApi = {
  // Public submission endpoints
  applyAccreditation: async (payload: any) =>
    axiosInstance.post("/accreditation/apply", payload),

  applyAuditor: async (payload: any) =>
    axiosInstance.post("/auditor/apply", payload),

  applyTrainingInstitute: async (payload: any) =>
    axiosInstance.post("/training-institute/apply", payload),

  applyAdvisory: async (payload: any) =>
    axiosInstance.post("/advisory/apply", payload),

  // Admin list
  getApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    type?: ApplicationType;
    search?: string;
  }) => axiosInstance.get<{ data: ApplicationsListResponse }>("/applications", { params }),

  // Admin single
  getApplicationById: async (id: string) =>
    axiosInstance.get<{ data: { application: Application } }>(`/applications/${id}`),

  // Admin approve
  approveApplication: async (id: string, remarks?: string) =>
    axiosInstance.patch(`/applications/${id}/approve`, { status: "APPROVED", remarks }),

  // Admin reject
  rejectApplication: async (id: string, remarks?: string) =>
    axiosInstance.patch(`/applications/${id}/reject`, { status: "REJECTED", remarks }),

  // Legacy PRD endpoint (advisory decision)
  decideApplication: async (id: string, payload: { status: string; remarks?: string }) =>
    axiosInstance.post(`/advisory/applications/${id}/decision`, payload),
};

export default applicationsApi;

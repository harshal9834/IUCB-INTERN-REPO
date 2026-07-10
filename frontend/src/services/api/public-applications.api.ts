import { axiosInstance as api } from "./axios";

export interface AccreditationPayload {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  organizationType: string;
  registrationNumber: string;
  country: string;
  address: string;
  website?: string;
  appliedStandard: string;
  message?: string;
}

export interface AuditorPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  designation: string;
  experienceYears: number;
  linkedinUrl?: string;
  appliedStandard: string;
  statementOfMerit?: string;
}

export interface TrainingInstitutePayload {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  organizationType: string;
  country: string;
  address: string;
  website?: string;
  appliedStandard: string;
}

export interface AdvisoryPayload {
  fullName: string;
  email: string;
  linkedinUrl?: string;
  company: string;
  designation: string;
  expertiseArea: string;
  experienceYears: number;
  statementOfMerit: string;
}

const publicApplicationsApi = {
  submitAccreditation: (data: AccreditationPayload) =>
    api.post("/accreditation/apply", data),

  submitAuditor: (data: AuditorPayload) =>
    api.post("/auditor/apply", data),

  submitTrainingInstitute: (data: TrainingInstitutePayload) =>
    api.post("/training-institute/apply", data),

  submitAdvisory: (data: AdvisoryPayload) =>
    api.post("/advisory/apply", data),
};

export default publicApplicationsApi;

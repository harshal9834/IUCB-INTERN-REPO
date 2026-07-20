import { axiosInstance as api } from "./axios";

export interface AccreditationPayload {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  organizationType: string;
  registrationNumber: string;
  country: string;
  countryCode?: string;
  phoneCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
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
  countryCode?: string;
  phoneCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
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
  countryCode?: string;
  phoneCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  address: string;
  website?: string;
  appliedStandard: string;
}

export interface AdvisoryPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  countryCode?: string;
  phoneCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
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

  submitContact: (data: { name: string; email: string; org?: string; subject: string; message: string }) =>
    api.post("/contact", data),
};

export default publicApplicationsApi;

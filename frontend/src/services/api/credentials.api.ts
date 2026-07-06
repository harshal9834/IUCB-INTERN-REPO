import { axiosInstance as apiClient } from "./axios";

export type CredentialStatus = "VALID" | "SUSPENDED" | "REVOKED" | "EXPIRED";

export interface GenerateCredentialDto {
  applicationId: string;
  issueDate: string;
  expiryDate: string;
  internalNotes?: string;
}

export interface Credential {
  id: string;
  credentialId: string;
  standard: string;
  issueDate: string;
  expiryDate: string;
  status: CredentialStatus;
  organizationId: string | null;
  auditorId: string | null;
  applicationId: string | null;
  verificationUrl: string;
  certificateGenerated: boolean;
  certificatePath?: string;
  generatedAt?: string;
  generatedById?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  organization?: any;
  auditor?: any;
  application?: any;
  generatedBy?: any;
  emailLogs?: any[];
}

const credentialsApi = {
  // Pending Queue
  getPendingCredentials: () => apiClient.get("/credentials/pending"),

  // Issued Credentials
  getIssuedCredentials: () => apiClient.get("/credentials"),

  // Individual Credential
  getCredentialById: (id: string) => apiClient.get(`/credentials/${id}`),

  // Generate Credential
  generateCredential: (payload: GenerateCredentialDto) =>
    apiClient.post("/credentials/generate", payload),

  // Update Status (Suspend/Revoke/Restore)
  updateStatus: (id: string, status: CredentialStatus) =>
    apiClient.patch(`/credentials/${id}/status`, { status }),

  // Generate Certificate (PDF)
  generateCertificate: (id: string) =>
    apiClient.post(`/credentials/${id}/certificate`),

  // Send Certificate Email
  sendCertificateEmail: (id: string, payload: { recipientEmail: string; subject: string; customMessage: string }) =>
    apiClient.post(`/credentials/${id}/send-email`, payload),

  // Get Email Logs
  getEmailLogs: (id: string) =>
    apiClient.get(`/credentials/${id}/email-logs`),

  // Get Audit Logs
  getCredentialAuditLogs: (id: string) =>
    apiClient.get(`/credentials/${id}/audit-logs`),

  // Download Certificate (authenticated)
  downloadCertificate: (id: string, inline: boolean = false) =>
    apiClient.get(`/credentials/${id}/certificate/download?inline=${inline}`, {
      responseType: "blob",
    }),
};

export default credentialsApi;

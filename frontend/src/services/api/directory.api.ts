import { axiosInstance } from "./axios";

// ── Types ────────────────────────────────────────────────────────────────────

export type SearchCertificateResponse = {
  success: boolean;
  uuid: string;
};

export type CertificateProfileResponse = {
  candidateName: string;
  organizationName: string;
  instituteName: string;
  country: string;
  credentialId: string;
  certificateId: string;
  registrationNumber: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  standard: string;
  issuedBy: string;
  verificationUrl: string;
  verificationTimestamp: string;
  qrCode: string | null;
  hasPdf: boolean;
  certificatePath: string | null;
};

// ── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/directory/search
 * Looks up a credential by certificateId and returns the record's UUID.
 */
export const searchCertificate = async (
  certificateId: string,
): Promise<SearchCertificateResponse> => {
  const response = await axiosInstance.post<SearchCertificateResponse>(
    "/directory/search",
    { certificateId },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );
  return response.data;
};

/**
 * GET /api/v1/directory/:uuid
 * Fetches the full credential profile for display on the verification page.
 */
export const getCertificateProfile = async (
  uuid: string,
): Promise<CertificateProfileResponse> => {
  const response = await axiosInstance.get<{ success: boolean; data: CertificateProfileResponse }>(
    `/directory/${uuid}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );
  return response.data.data;
};

/**
 * GET /api/v1/verify?credential=...
 * Fetches the full credential profile using either credentialId or certificateId.
 */
export const verifyCertificate = async (
  credential: string,
): Promise<CertificateProfileResponse> => {
  const response = await axiosInstance.get<{ success: boolean; data: CertificateProfileResponse }>(
    `/verify`,
    {
      params: { credential },
      headers: {
        Accept: "application/json",
      },
    },
  );
  return response.data.data;
};

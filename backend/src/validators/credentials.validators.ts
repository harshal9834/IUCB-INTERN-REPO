import { z } from "zod";

export const issueCredentialSchema = z.object({
  credentialNumber: z.string().min(5, "Credential number required"),
  standard: z.string().min(2, "ISO standard is required"),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  status: z.enum(["VALID", "REVOKED", "EXPIRED"]).optional().default("VALID"),
  organizationId: z.string().uuid("Invalid Organization ID"),
  auditorId: z.string().uuid("Invalid Auditor ID"),
  verificationUrl: z.string().url("Invalid verification URL"),
});

export const revokeCredentialSchema = z.object({
  reason: z.string().min(5, "Revocation reason required").optional(),
});

export const credentialQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["VALID", "REVOKED", "EXPIRED"]).optional(),
  organizationId: z.string().uuid().optional(),
  search: z.string().optional(),
});

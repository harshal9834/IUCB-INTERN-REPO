import { z } from "zod";

export const createOrganizationSchema = z.object({
  organizationName: z.string().min(2, "Organization name required"),
  registrationNumber: z.string().min(2, "Registration number required"),
  country: z.string().min(2, "Country required"),
  address: z.string().min(5, "Address required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  website: z.string().url("Invalid website URL").optional().nullable(),
  accreditationStatus: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).optional(),
  accreditationDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const updateOrganizationStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"], "Status must be ACTIVE, SUSPENDED, or REVOKED"),
});

export const organizationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
  status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).optional(),
  search: z.string().optional(),
});

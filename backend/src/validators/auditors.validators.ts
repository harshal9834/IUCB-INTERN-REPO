import { z } from "zod";

export const createAuditorSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  organizationId: z.string().uuid("Invalid Organization ID"),
  tier: z.enum(["ASSOCIATE", "SENIOR", "LEAD"]).optional().default("ASSOCIATE"),
  specialization: z.string().min(2, "Specialization required"),
  experienceYears: z.coerce.number().int().min(0, "Experience must be 0 or more"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional().default("ACTIVE"),
  country: z.string().optional(),
  countryCode: z.string().optional().nullable(),
  phoneCode: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  address: z.string().optional(),
});

export const updateAuditorSchema = createAuditorSchema.partial();

export const auditorQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
  organizationId: z.string().uuid().optional(),
  tier: z.enum(["ASSOCIATE", "SENIOR", "LEAD"]).optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
});

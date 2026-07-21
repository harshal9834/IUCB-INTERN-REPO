import { z } from "zod";

export const trainingInstituteQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
  status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).optional(),
  search: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
});

export const createTrainingInstituteSchema = z.object({
  instituteName: z.string().min(2, "Institute name required"),
  registrationNumber: z.string().min(2, "Registration number required"),
  country: z.string().min(2, "Country required"),
  countryCode: z.string().optional().nullable(),
  phoneCode: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  address: z.string().min(5, "Address required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  website: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),
  status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).optional(),
});

export const updateTrainingInstituteSchema = createTrainingInstituteSchema.partial();

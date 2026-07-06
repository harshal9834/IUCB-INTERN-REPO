import { z } from "zod";

export const applyAdvisorySchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email address"),
  linkedinUrl: z.string().url("Invalid LinkedIn URL"),
  company: z.string().min(2, "Company name required"),
  designation: z.string().min(2, "Designation required"),
  expertiseArea: z.string().min(2, "Expertise area required"),
  experienceYears: z.coerce.number().int().min(0),
  statementOfMerit: z.string().min(50, "Statement must be at least 50 characters"),
  resumeUrl: z.string().url("Invalid resume URL").optional(),
});

export const applicationDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], "Decision status must be APPROVED or REJECTED"),
  remarks: z.string().optional(),
});

export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
});

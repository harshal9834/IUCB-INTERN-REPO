import { z } from "zod";

// ── Public: Apply Accreditation Org ─────────────────────────────────────────
export const applyAccreditationSchema = z.object({
  fullName: z.string().min(2, "Contact person name required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  company: z.string().min(2, "Organization name required"),
  organizationType: z.string().min(2, "Organization type required"),
  registrationNumber: z.string().min(2, "Registration number required"),
  country: z.string().min(2, "Country required"),
  address: z.string().min(5, "Address required"),
  website: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),
  appliedStandard: z.string().min(2, "Applied standard required"),
  message: z.string().optional(),
});

// ── Public: Apply Auditor ────────────────────────────────────────────────────
export const applyAuditorSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  company: z.string().min(2, "Current organization required"),
  designation: z.string().min(2, "Designation required"),
  country: z.string().min(2, "Country required"),
  appliedStandard: z.string().min(2, "Specialization standard required"),
  experienceYears: z.coerce.number().int().min(0),
  statementOfMerit: z.string().min(20, "Please provide a brief statement").optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().nullable(),
});

// ── Public: Apply Training Institute ────────────────────────────────────────
export const applyTrainingInstituteSchema = z.object({
  fullName: z.string().min(2, "Contact person name required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  company: z.string().min(2, "Institute name required"),
  organizationType: z.string().min(2, "Organization type required"),
  country: z.string().min(2, "Country required"),
  address: z.string().min(5, "Address required"),
  website: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),
  appliedStandard: z.string().min(2, "Training program/standard required"),
});

// ── Public: Apply Advisory ───────────────────────────────────────────────────
export const applyAdvisorySchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email address"),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().nullable(),
  company: z.string().min(2, "Company name required"),
  designation: z.string().min(2, "Designation required"),
  expertiseArea: z.string().min(2, "Expertise area required"),
  experienceYears: z.coerce.number().int().min(0),
  statementOfMerit: z.string().min(50, "Statement must be at least 50 characters"),
  resumeUrl: z.string().url("Invalid resume URL").optional().nullable(),
});

// ── Admin: Decision ──────────────────────────────────────────────────────────
export const applicationDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  remarks: z.string().optional(),
});

// ── Admin: Query ─────────────────────────────────────────────────────────────
export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  type: z.enum(["ACCREDITATION", "AUDITOR", "TRAINING_INSTITUTE", "ADVISORY"]).optional(),
  search: z.string().optional(),
});

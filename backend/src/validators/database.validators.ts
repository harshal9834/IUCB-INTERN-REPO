import { z } from "zod";

// Admin validations
export const createAdminSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
});

// Organization validations
export const createOrgSchema = z.object({
  organizationName: z.string().min(2, "Organization name required"),
  registrationNumber: z.string().min(2, "Registration number required"),
  country: z.string().min(2, "Country required"),
  address: z.string().min(5, "Address required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  website: z.string().url().optional().nullable(),
  accreditationStatus: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).optional(),
  accreditationDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
});

// Auditor validations
export const createAuditorSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone required"),
  organizationId: z.string().uuid("Invalid Organization ID"),
  tier: z.enum(["ASSOCIATE", "SENIOR", "LEAD"]).optional(),
  specialization: z.string().min(2, "Specialization required"),
  experienceYears: z.number().int().min(0),
});

// Credential validations
export const createCredentialSchema = z.object({
  credentialId: z.string().min(5, "Credential ID required"),
  standard: z.string().min(2, "Standard ISO required"),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  status: z.enum(["VALID", "REVOKED", "EXPIRED"]).optional(),
  organizationId: z.string().uuid("Invalid Organization ID"),
  auditorId: z.string().uuid("Invalid Auditor ID"),
  verificationUrl: z.string().url(),
});

// Advisory Application validations
export const createAdvisoryApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email address"),
  linkedinUrl: z.string().url().optional().nullable(),
  company: z.string().min(2, "Company required"),
  designation: z.string().min(2, "Designation required"),
  expertiseArea: z.string().min(2, "Expertise area required"),
  experienceYears: z.number().int().min(0),
  statementOfMerit: z.string().min(10, "Statement of merit must be at least 10 characters"),
  resumeUrl: z.string().url().optional().nullable(),
});

// News validations
export const createNewsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  featuredImage: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
});

// Resource validations
export const createResourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url("File must be a valid URL"),
  category: z.string().min(2, "Category required"),
});

import { z } from "zod";

const parseDate = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return new Date(value);
  }
  return undefined;
}, z.date().optional());

export const analyticsQuerySchema = z.object({
  dateRange: z.enum(["LAST_7_DAYS", "LAST_MONTH", "LAST_YEAR", "CUSTOM"]).optional(),
  startDate: parseDate,
  endDate: parseDate,
  organizationId: z.string().uuid().optional(),
  standard: z.string().optional(),
  reportType: z.enum([
    "ALL",
    "OVERVIEW",
    "ORGANIZATIONS",
    "AUDITORS",
    "CREDENTIALS",
    "APPLICATIONS",
    "ADVISORS",
    "RESOURCES",
    "REPORTS",
    "AUDIT_LOGS",
  ]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

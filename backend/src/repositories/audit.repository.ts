// ============================================================
// Audit Repository – ONLY fetches from database via Prisma.
// No business logic here.
// When a real AuditLog table is added, replace this file only.
// ============================================================

import prisma from '../config/Database.js';
import type { RawAuditData } from '../types/audit.types.js';

class AuditRepository {
  /**
   * Fetches all source data in parallel using Promise.all.
   * Returns raw DB records – no transformation.
   */
  public async fetchAllRawData(): Promise<RawAuditData> {
    const [
      organizations,
      auditors,
      credentials,
      applications,
      advisors,
      news,
      resources,
      admins,
    ] = await Promise.all([
      prisma.organization.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          organizationName: true,
          accreditationStatus: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.auditor.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          fullName: true,
          email: true,
          tier: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.credential.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          credentialId: true,
          standard: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.application.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          fullName: true,
          applicationStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.advisor.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          fullName: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.news.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          isPublished: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.resource.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          category: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.admin.findMany({
        select: {
          id: true,
          fullName: true,
          role: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      organizations,
      auditors,
      credentials,
      applications,
      advisors,
      news,
      resources,
      admins,
    };
  }
}

export default new AuditRepository();

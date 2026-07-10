import prisma from "../config/db.js";
import { FilterQuery, AnalyticsOverview, ChartDataResponse, RecentActivitiesResponse } from "../types/analytics.types.js";
import { Logger } from "../utils/Logger.js";

export class AnalyticsService {
  
  async getOverviewStats(filters: FilterQuery): Promise<AnalyticsOverview> {
    try {
      const dateFilter = filters.startDate && filters.endDate ? {
        createdAt: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        }
      } : {};

      const totalOrganizations = await prisma.organization.count({ where: dateFilter });
      const activeOrganizations = await prisma.organization.count({ where: { ...dateFilter, accreditationStatus: "ACTIVE" } });
      const suspendedOrganizations = await prisma.organization.count({ where: { ...dateFilter, accreditationStatus: "SUSPENDED" } });
      const revokedOrganizations = await prisma.organization.count({ where: { ...dateFilter, accreditationStatus: "REVOKED" } });

      const applications = await prisma.application.count({ where: dateFilter });
      const pendingApplications = await prisma.application.count({ where: { ...dateFilter, applicationStatus: "PENDING" } });
      const approvedApplications = await prisma.application.count({ where: { ...dateFilter, applicationStatus: "APPROVED" } });
      const rejectedApplications = await prisma.application.count({ where: { ...dateFilter, applicationStatus: "REJECTED" } });

      const credentials = await prisma.credential.count({ where: dateFilter });
      const certificates = await prisma.credential.count({ where: { ...dateFilter, certificateGenerated: true } });
      
      const trainingInstitutes = await prisma.trainingInstitute.count({ where: dateFilter });
      const auditors = await prisma.auditor.count({ where: dateFilter });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todaysActivity = await prisma.auditLog.count({
        where: { createdAt: { gte: startOfDay } }
      });

      return {
        totalOrganizations,
        activeOrganizations,
        suspendedOrganizations,
        revokedOrganizations,
        applications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        credentials,
        certificates,
        trainingInstitutes,
        auditors,
        todaysActivity,
        systemHealth: 100 // Simulated since there isn't a direct DB metric for this
      };
    } catch (error: any) {
      Logger.error(`[AnalyticsService] getOverviewStats: ${error.message}`);
      throw error;
    }
  }

  async getChartsData(filters: FilterQuery): Promise<ChartDataResponse> {
    try {
      const dateFilter = filters.startDate && filters.endDate ? {
        createdAt: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        }
      } : {};

      // Monthly Applications
      const apps = await prisma.application.findMany({ where: dateFilter, select: { createdAt: true } });
      const monthlyApps = this.groupByMonth(apps.map(a => a.createdAt));

      // Monthly Credentials
      const creds = await prisma.credential.findMany({ where: dateFilter, select: { createdAt: true } });
      const monthlyCreds = this.groupByMonth(creds.map(a => a.createdAt));

      // Monthly Certificates
      const certs = await prisma.credential.findMany({ where: { ...dateFilter, certificateGenerated: true }, select: { createdAt: true } });
      const monthlyCerts = this.groupByMonth(certs.map(a => a.createdAt));

      // Organization Status
      const orgs = await prisma.organization.groupBy({
        by: ['accreditationStatus'],
        where: dateFilter,
        _count: true
      });
      const organizationStatus = orgs.map(o => ({
        id: o.accreditationStatus,
        label: o.accreditationStatus,
        value: o._count
      }));

      // Training Institutes Status
      const insts = await prisma.trainingInstitute.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true
      });
      const trainingInstitutes = insts.map(i => ({
        id: i.status,
        label: i.status,
        value: i._count
      }));

      // Country Distribution (Organizations)
      const countries = await prisma.organization.groupBy({
        by: ['country'],
        where: dateFilter,
        _count: true
      });
      const countryDistribution = countries.map(c => ({
        id: c.country,
        label: c.country,
        value: c._count
      }));

      // Top Standards (Credentials)
      const standards = await prisma.credential.groupBy({
        by: ['standard'],
        where: dateFilter,
        _count: true
      });
      const topStandards = standards.map(s => ({
        id: s.standard,
        label: s.standard,
        value: s._count
      }));

      // Audit Trend (Logs)
      const logs = await prisma.auditLog.findMany({ where: dateFilter, select: { createdAt: true } });
      const auditTrend = this.groupByMonth(logs.map(l => l.createdAt));

      // Auditor Distribution
      const auds = await prisma.auditor.groupBy({
        by: ['tier'],
        where: dateFilter,
        _count: true
      });
      const auditorDistribution = auds.map(a => ({
        id: a.tier,
        label: a.tier,
        value: a._count
      }));

      return {
        monthlyApplications: monthlyApps,
        monthlyCredentials: monthlyCreds,
        monthlyCertificates: monthlyCerts,
        organizationStatus,
        trainingInstitutes,
        countryDistribution,
        topStandards,
        auditTrend,
        auditorDistribution
      };
    } catch (error: any) {
      Logger.error(`[AnalyticsService] getChartsData: ${error.message}`);
      throw error;
    }
  }

  async getRecentActivities(): Promise<RecentActivitiesResponse> {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      const apps = await prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      const creds = await prisma.credential.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const activities: any[] = [];
      logs.forEach(l => activities.push({
        id: l.id, type: 'AUDIT_LOG', title: `Action by ${l.actorName || 'System'}`, description: `${l.action} on ${l.entityType}`, timestamp: l.createdAt
      }));
      apps.forEach(a => activities.push({
        id: a.id, type: 'APPLICATION', title: `New Application`, description: `${a.fullName} applied`, timestamp: a.createdAt, status: a.applicationStatus
      }));
      creds.forEach(c => activities.push({
        id: c.id, type: 'CREDENTIAL', title: `Credential Issued`, description: `ID: ${c.credentialId}`, timestamp: c.createdAt, status: c.status
      }));

      // Sort and take latest 10
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return {
        activities: activities.slice(0, 10)
      };
    } catch (error: any) {
      Logger.error(`[AnalyticsService] getRecentActivities: ${error.message}`);
      throw error;
    }
  }

  private groupByMonth(dates: Date[]) {
    const counts = dates.reduce((acc, date) => {
      const month = date.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).sort().map(month => ({
      date: month,
      x: month, // For Nivo line chart
      y: counts[month], // For Nivo line chart
      value: counts[month],
      id: month,
      label: month
    }));
  }
}

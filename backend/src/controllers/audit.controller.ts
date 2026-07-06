import { Response } from 'express';
import AuditService from '../services/audit.service.js';
import { AuthenticatedRequest } from '../middlewares/audit.middleware.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AuditAction, AuditSeverity, AdminRole } from '@prisma/client';

export class AuditController {
  // Get audit logs with filtering and pagination
  getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      actorId,
      entityType,
      action,
      module,
      severity,
      status,
      dateFrom,
      dateTo,
      ipAddress,
      sessionId,
      search,
    } = req.query;

    // Convert query parameters to proper types
    const filters = {
      actorId: actorId as string,
      entityType: entityType as string,
      action: action as AuditAction,
      module: module as string,
      severity: severity as AuditSeverity,
      status: status as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      ipAddress: ipAddress as string,
      sessionId: sessionId as string,
      search: search as string,
    };

    const result = await AuditService.getAuditLogs(
      filters,
      Number(page),
      Number(limit)
    );

    res.json(new ApiResponse(200, result, 'Audit logs retrieved successfully'));
  });

  // Get specific audit log by ID
  getAuditLogById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const auditLog = await AuditService.getAuditLogById(Array.isArray(id) ? id[0] : id);

    if (!auditLog) {
      throw new ApiError(404, 'Audit log not found');
    }

    res.json(new ApiResponse(200, auditLog, 'Audit log retrieved successfully'));
  });

  // Get entity history
  getEntityHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { entityType, entityId } = req.params;
    const history = await AuditService.getEntityHistory(
      Array.isArray(entityType) ? entityType[0] : entityType, 
      Array.isArray(entityId) ? entityId[0] : entityId
    );

    res.json(new ApiResponse(200, history, 'Entity history retrieved successfully'));
  });

  // Get audit statistics
  getAuditStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { dateFrom, dateTo } = req.query;

    const stats = await AuditService.getAuditStats(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json(new ApiResponse(200, stats, 'Audit statistics retrieved successfully'));
  });

  // Get dashboard data
  getDashboardData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { period = '7d' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    const dateFrom = new Date();
    
    switch (period) {
      case '24h':
        dateFrom.setHours(now.getHours() - 24);
        break;
      case '7d':
        dateFrom.setDate(now.getDate() - 7);
        break;
      case '30d':
        dateFrom.setDate(now.getDate() - 30);
        break;
      case '90d':
        dateFrom.setDate(now.getDate() - 90);
        break;
      default:
        dateFrom.setDate(now.getDate() - 7);
    }

    const [stats, mostActiveAdmins, timeline, alerts] = await Promise.all([
      AuditService.getAuditStats(dateFrom, now),
      AuditService.getMostActiveAdmins(10, dateFrom, now),
      AuditService.getActivityTimeline(20),
      AuditService.getActiveAlerts(),
    ]);

    const dashboardData = {
      period,
      dateRange: { from: dateFrom, to: now },
      stats,
      mostActiveAdmins,
      recentActivity: timeline,
      activeAlerts: alerts,
      summary: {
        totalLogs: stats.totalLogs,
        criticalAlerts: stats.criticalAlerts,
        failedLogins: stats.failedLogins,
        activeAdmins: mostActiveAdmins.length,
      }
    };

    res.json(new ApiResponse(200, dashboardData, 'Dashboard data retrieved successfully'));
  });

  // Get most active admins
  getMostActiveAdmins = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const admins = await AuditService.getMostActiveAdmins(
      Number(limit),
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json(new ApiResponse(200, admins, 'Most active admins retrieved successfully'));
  });

  // Get activity timeline
  getActivityTimeline = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 50 } = req.query;

    const timeline = await AuditService.getActivityTimeline(Number(limit));

    res.json(new ApiResponse(200, timeline, 'Activity timeline retrieved successfully'));
  });

  // Search audit logs
  searchAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { query, limit = 20 } = req.query;

    if (!query) {
      throw new ApiError(400, 'Search query is required');
    }

    const results = await AuditService.searchAuditLogs(query as string, Number(limit));

    res.json(new ApiResponse(200, results, 'Search results retrieved successfully'));
  });

  // Get active alerts
  getActiveAlerts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const alerts = await AuditService.getActiveAlerts();

    res.json(new ApiResponse(200, alerts, 'Active alerts retrieved successfully'));
  });

  // Acknowledge alert
  acknowledgeAlert = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.admin?.id;

    if (!adminId) {
      throw new ApiError(401, 'Admin ID not found');
    }

    const alert = await AuditService.acknowledgeAlert(Array.isArray(id) ? id[0] : id, adminId);

    res.json(new ApiResponse(200, alert, 'Alert acknowledged successfully'));
  });

  // Resolve alert
  resolveAlert = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.admin?.id;

    if (!adminId) {
      throw new ApiError(401, 'Admin ID not found');
    }

    const alert = await AuditService.resolveAlert(Array.isArray(id) ? id[0] : id, adminId);

    res.json(new ApiResponse(200, alert, 'Alert resolved successfully'));
  });

  // Verify audit integrity
  verifyIntegrity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only SUPER_ADMIN can verify integrity
    if (req.admin?.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Only Super Admins can verify audit integrity');
    }

    const result = await AuditService.verifyIntegrity();

    res.json(new ApiResponse(200, result, 'Integrity verification completed'));
  });

  // Get audit analytics for charts
  getAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { period = '30d', groupBy = 'day' } = req.query;

    // Calculate date range
    const now = new Date();
    const dateFrom = new Date();
    
    switch (period) {
      case '7d':
        dateFrom.setDate(now.getDate() - 7);
        break;
      case '30d':
        dateFrom.setDate(now.getDate() - 30);
        break;
      case '90d':
        dateFrom.setDate(now.getDate() - 90);
        break;
      case '1y':
        dateFrom.setFullYear(now.getFullYear() - 1);
        break;
      default:
        dateFrom.setDate(now.getDate() - 30);
    }

    const [stats, logs] = await Promise.all([
      AuditService.getAuditStats(dateFrom, now),
      AuditService.getAuditLogs(
        { dateFrom, dateTo: now },
        1,
        10000 // Get more data for analytics
      ),
    ]);

    // Group logs by time period for charts
    const timeGroups = this.groupLogsByTime(logs.logs, groupBy as string);
    const actionGroups = this.groupLogsByAction(logs.logs);
    const moduleGroups = this.groupLogsByModule(logs.logs);
    const severityGroups = this.groupLogsBySeverity(logs.logs);

    const analytics = {
      period,
      groupBy,
      dateRange: { from: dateFrom, to: now },
      timeSeriesData: timeGroups,
      actionDistribution: actionGroups,
      moduleDistribution: moduleGroups,
      severityDistribution: severityGroups,
      totalLogs: logs.logs.length,
      stats,
    };

    res.json(new ApiResponse(200, analytics, 'Analytics data retrieved successfully'));
  });

  // Helper method to group logs by time
  private groupLogsByTime(logs: any[], groupBy: string) {
    const groups: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      let key: string;

      switch (groupBy) {
        case 'hour':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  // Helper method to group logs by action
  private groupLogsByAction(logs: any[]) {
    const groups: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const action = log.action;
      groups[action] = (groups[action] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Helper method to group logs by module
  private groupLogsByModule(logs: any[]) {
    const groups: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const module = log.module;
      groups[module] = (groups[module] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Helper method to group logs by severity
  private groupLogsBySeverity(logs: any[]) {
    const groups: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const severity = log.severity;
      groups[severity] = (groups[severity] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([severity, count]) => ({ severity, count }))
      .sort((a, b) => {
        const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (order[a.severity as keyof typeof order] || 0) - (order[b.severity as keyof typeof order] || 0);
      });
  }
}

export default new AuditController();
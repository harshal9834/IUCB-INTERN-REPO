import AuditRepository, { CreateAuditLogData, AuditLogFilters, CreateAuditAlertData } from '../repositories/audit.repository.js';
import { AuditAction, AuditSeverity, AdminRole, AlertType } from '@prisma/client';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

export interface AuditContext {
  adminId?: string;
  adminName?: string;
  adminRole?: AdminRole;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
}

export interface EntityChange {
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValues?: any;
  newValues?: any;
}

export class AuditService {
  private previousHash: string | null = null;

  async logAudit(
    context: AuditContext,
    entityType: string,
    entityId: string,
    action: AuditAction,
    module: string,
    description: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    severity: AuditSeverity = AuditSeverity.LOW
  ) {
    try {
      // Parse user agent for device info
      const deviceInfo = this.parseUserAgent(context.userAgent);
      
      // Get location from IP
      const locationInfo = this.getLocationFromIP(context.ipAddress);
      
      // Calculate risk score
      const riskScore = this.calculateRiskScore(action, severity, context);
      
      // Generate hash for integrity
      const currentHash = this.generateHash(entityType, entityId, action, context.adminId);
      
      const auditData: CreateAuditLogData = {
        actorId: context.adminId,
        actorName: context.adminName,
        actorRole: context.adminRole,
        entityType,
        entityId,
        action,
        module,
        description,
        oldValues,
        newValues,
        metadata,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country: locationInfo.country,
        city: locationInfo.city,
        sessionId: context.sessionId,
        requestId: context.requestId,
        status: 'SUCCESS',
        severity,
        riskScore,
      };

      const auditLog = await AuditRepository.createAuditLog(auditData);
      this.previousHash = currentHash;

      // Create snapshot for important changes
      if (this.shouldCreateSnapshot(action)) {
        const snapshotData = newValues || oldValues;
        if (snapshotData) {
          await AuditRepository.createAuditSnapshot(
            auditLog.id,
            entityType,
            entityId,
            snapshotData
          );
        }
      }

      // Check for security alerts
      await this.checkSecurityAlerts(auditLog, context);

      // Update activity summary
      if (context.adminId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await AuditRepository.createActivitySummary(
          context.adminId,
          entityType,
          action,
          today
        );
      }

      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to prevent breaking main operations
      return null;
    }
  }

  async logBulkAudit(context: AuditContext, changes: EntityChange[], module: string) {
    const results = [];
    for (const change of changes) {
      const description = this.generateDescription(change.action, change.entityType, change.entityId);
      const result = await this.logAudit(
        context,
        change.entityType,
        change.entityId,
        change.action,
        module,
        description,
        change.oldValues,
        change.newValues,
        undefined,
        this.calculateSeverityFromAction(change.action)
      );
      results.push(result);
    }
    return results;
  }

  async getAuditLogs(filters: AuditLogFilters, page: number = 1, limit: number = 20) {
    return await AuditRepository.getAuditLogs(filters, page, limit);
  }

  async getAuditLogById(id: string) {
    return await AuditRepository.getAuditLogById(id);
  }

  async getEntityHistory(entityType: string, entityId: string) {
    return await AuditRepository.getEntityHistory(entityType, entityId);
  }

  async getAuditStats(dateFrom?: Date, dateTo?: Date) {
    return await AuditRepository.getAuditStats(dateFrom, dateTo);
  }

  async getMostActiveAdmins(limit: number = 10, dateFrom?: Date, dateTo?: Date) {
    return await AuditRepository.getMostActiveAdmins(limit, dateFrom, dateTo);
  }

  async getActivityTimeline(limit: number = 50) {
    return await AuditRepository.getActivityTimeline(limit);
  }

  async searchAuditLogs(query: string, limit: number = 20) {
    return await AuditRepository.searchAuditLogs(query, limit);
  }

  async getActiveAlerts() {
    return await AuditRepository.getActiveAlerts();
  }

  async acknowledgeAlert(alertId: string, adminId: string) {
    return await AuditRepository.acknowledgeAlert(alertId, adminId);
  }

  async resolveAlert(alertId: string, adminId: string) {
    return await AuditRepository.resolveAlert(alertId, adminId);
  }

  async verifyIntegrity() {
    try {
      const integrity = await AuditRepository.getAuditIntegrity();
      if (!integrity) {
        return { isValid: true, message: 'No integrity record found' };
      }

      // Verify hash chain (simplified implementation)
      const currentHash = crypto.createHash('sha256')
        .update(`${integrity.chainHash}-${integrity.blockCount}`)
        .digest('hex');

      const isValid = integrity.chainHash === currentHash;
      
      await AuditRepository.updateAuditIntegrity(
        currentHash,
        integrity.blockCount + 1,
        isValid,
        isValid ? undefined : 'Hash chain verification failed'
      );

      return {
        isValid,
        message: isValid ? 'Integrity verified' : 'Integrity verification failed',
        blockCount: integrity.blockCount,
      };
    } catch (error) {
      console.error('Integrity verification failed:', error);
      return {
        isValid: false,
        message: 'Integrity verification error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private parseUserAgent(userAgent?: string) {
    if (!userAgent) {
      return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    }

    try {
      const parser = new UAParser();
      parser.setUA(userAgent);
      const result = parser.getResult();
      
      return {
        device: result.device.model || result.device.type || 'Unknown',
        browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
        os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
      };
    } catch (error) {
      return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    }
  }

  private getLocationFromIP(ipAddress?: string) {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return { country: 'Local', city: 'Local' };
    }

    // For now, return unknown until we implement proper IP geolocation
    return { country: 'Unknown', city: 'Unknown' };
  }

  private calculateRiskScore(action: AuditAction, severity: AuditSeverity, context: AuditContext): number {
    let score = 0;

    // Base score from action
    switch (action) {
      case AuditAction.DELETE:
      case AuditAction.BULK_DELETE:
        score += 8;
        break;
      case AuditAction.ROLE_CHANGE:
      case AuditAction.PERMISSION_CHANGE:
        score += 7;
        break;
      case AuditAction.PASSWORD_CHANGE:
      case AuditAction.PASSWORD_RESET:
        score += 5;
        break;
      case AuditAction.FAILED_LOGIN:
        score += 3;
        break;
      case AuditAction.LOGIN:
      case AuditAction.LOGOUT:
        score += 1;
        break;
      default:
        score += 2;
    }

    // Severity multiplier
    switch (severity) {
      case AuditSeverity.CRITICAL:
        score *= 2;
        break;
      case AuditSeverity.HIGH:
        score *= 1.5;
        break;
      case AuditSeverity.MEDIUM:
        score *= 1.2;
        break;
    }

    // Location risk (simple check for non-local IPs)
    if (context.ipAddress && !['127.0.0.1', '::1'].includes(context.ipAddress)) {
      score += 1;
    }

    return Math.min(Math.round(score), 10); // Cap at 10
  }

  private generateHash(entityType: string, entityId: string, action: AuditAction, adminId?: string): string {
    const data = `${entityType}-${entityId}-${action}-${adminId || 'system'}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private shouldCreateSnapshot(action: AuditAction): boolean {
    const snapshotActions: AuditAction[] = [
      AuditAction.CREATE,
      AuditAction.UPDATE,
      AuditAction.DELETE,
      AuditAction.STATUS_CHANGE,
      AuditAction.APPROVE,
      AuditAction.REJECT,
    ];
    return snapshotActions.includes(action);
  }

  private async checkSecurityAlerts(auditLog: any, context: AuditContext) {
    // Check for multiple failed logins
    if (auditLog.action === AuditAction.FAILED_LOGIN) {
      const recentFailedLogins = await AuditRepository.getAuditLogs(
        {
          action: AuditAction.FAILED_LOGIN,
          ipAddress: context.ipAddress,
          dateFrom: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
        1,
        10
      );

      if (recentFailedLogins.logs.length >= 5) {
        await this.createAlert({
          auditLogId: auditLog.id,
          alertType: AlertType.MULTIPLE_FAILED_LOGINS,
          severity: AuditSeverity.HIGH,
          title: 'Multiple Failed Login Attempts',
          description: `${recentFailedLogins.logs.length} failed login attempts from IP ${context.ipAddress} in the last 15 minutes`,
          metadata: {
            ipAddress: context.ipAddress,
            attemptCount: recentFailedLogins.logs.length,
            timeWindow: '15 minutes',
          }
        });
      }
    }

    // Check for mass operations
    if ([AuditAction.BULK_DELETE, AuditAction.BULK_UPDATE].includes(auditLog.action)) {
      await this.createAlert({
        auditLogId: auditLog.id,
        alertType: auditLog.action === AuditAction.BULK_DELETE ? AlertType.MASS_DELETE : AlertType.MASS_UPDATE,
        severity: AuditSeverity.HIGH,
        title: `Mass ${auditLog.action === AuditAction.BULK_DELETE ? 'Delete' : 'Update'} Operation`,
        description: `Mass ${auditLog.action.toLowerCase().replace('bulk_', '')} operation performed by ${context.adminName}`,
        metadata: {
          entityType: auditLog.entityType,
          adminId: context.adminId,
        }
      });
    }

    // Check for privilege escalation
    if (auditLog.action === AuditAction.ROLE_CHANGE && auditLog.severity === AuditSeverity.CRITICAL) {
      await this.createAlert({
        auditLogId: auditLog.id,
        alertType: AlertType.PRIVILEGE_ESCALATION,
        severity: AuditSeverity.CRITICAL,
        title: 'Privilege Escalation Detected',
        description: `Role change operation may indicate privilege escalation for ${auditLog.entityType} ${auditLog.entityId}`,
        metadata: {
          entityType: auditLog.entityType,
          entityId: auditLog.entityId,
          adminId: context.adminId,
        }
      });
    }
  }

  private async createAlert(alertData: CreateAuditAlertData) {
    try {
      return await AuditRepository.createAuditAlert(alertData);
    } catch (error) {
      console.error('Failed to create audit alert:', error);
      return null;
    }
  }

  private generateDescription(action: AuditAction, entityType: string, entityId: string): string {
    const actionText = action.toLowerCase().replace('_', ' ');
    return `${actionText} ${entityType.toLowerCase()} ${entityId}`;
  }

  private calculateSeverityFromAction(action: AuditAction): AuditSeverity {
    switch (action) {
      case AuditAction.DELETE:
      case AuditAction.BULK_DELETE:
      case AuditAction.ROLE_CHANGE:
      case AuditAction.PERMISSION_CHANGE:
        return AuditSeverity.HIGH;
      case AuditAction.PASSWORD_CHANGE:
      case AuditAction.PASSWORD_RESET:
      case AuditAction.BULK_UPDATE:
        return AuditSeverity.MEDIUM;
      default:
        return AuditSeverity.LOW;
    }
  }
}

export default new AuditService();
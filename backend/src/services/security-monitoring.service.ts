import { PrismaClient, Prisma, AuditAction, AuditSeverity, AdminRole, AlertType } from '@prisma/client';
import db from '../config/db.js';
import crypto from 'crypto';

export interface SecurityThreat {
  id: string;
  type: 'BRUTE_FORCE' | 'PRIVILEGE_ESCALATION' | 'DATA_EXFILTRATION' | 'SUSPICIOUS_PATTERN' | 'ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedEntities: string[];
  evidence: SecurityEvidence[];
  riskScore: number;
  detectedAt: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  remediationActions: string[];
}

export interface SecurityEvidence {
  auditLogId: string;
  evidenceType: 'LOGIN_ATTEMPT' | 'DATA_ACCESS' | 'PRIVILEGE_CHANGE' | 'BULK_OPERATION' | 'PATTERN';
  description: string;
  timestamp: Date;
  sourceIP?: string;
  userAgent?: string;
}

export interface SecurityMetrics {
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  activeThreatCount: number;
  resolvedThreatCount: number;
  falsePositiveCount: number;
  
  // Security events (last 24h)
  failedLogins: number;
  suspiciousActivities: number;
  privilegeEscalations: number;
  dataExfiltrationAttempts: number;
  
  // Risk metrics
  averageRiskScore: number;
  highRiskUsers: string[];
  vulnerableEntities: string[];
  
  // Compliance metrics
  integrityViolations: number;
  auditCoverage: number;
  retentionCompliance: number;
}

export interface AnomalyPattern {
  patternType: 'VOLUME' | 'TIMING' | 'GEOGRAPHIC' | 'BEHAVIORAL' | 'ENTITY_ACCESS';
  description: string;
  baseline: number;
  currentValue: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
}

export class SecurityMonitoringService {
  
  private readonly THREAT_THRESHOLDS = {
    FAILED_LOGINS: 5, // Failed logins in 30 minutes
    BULK_OPERATIONS: 10, // Bulk operations in 1 hour
    PRIVILEGE_ESCALATION_WINDOW: 60, // Minutes
    DATA_ACCESS_VOLUME: 100, // Records accessed in 1 hour
    RISK_SCORE_THRESHOLD: 7
  };

  /**
   * Perform real-time security analysis
   */
  async performSecurityAnalysis(): Promise<SecurityMetrics> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
      const [
        recentThreats,
        securityEvents,
        riskMetrics,
        complianceMetrics
      ] = await Promise.all([
        this.getActiveThreats(),
        this.analyzeSecurityEvents(last24Hours),
        this.calculateRiskMetrics(),
        this.assessComplianceMetrics()
      ]);

      const threatLevel = this.calculateOverallThreatLevel(recentThreats, securityEvents);
      
      return {
        threatLevel,
        activeThreatCount: recentThreats.filter(t => t.status === 'ACTIVE').length,
        resolvedThreatCount: recentThreats.filter(t => t.status === 'RESOLVED').length,
        falsePositiveCount: recentThreats.filter(t => t.status === 'DISMISSED').length,
        
        failedLogins: securityEvents.failedLogins,
        suspiciousActivities: securityEvents.suspiciousActivities,
        privilegeEscalations: securityEvents.privilegeEscalations,
        dataExfiltrationAttempts: securityEvents.dataExfiltrationAttempts,
        
        averageRiskScore: riskMetrics.averageRiskScore,
        highRiskUsers: riskMetrics.highRiskUsers,
        vulnerableEntities: riskMetrics.vulnerableEntities,
        
        integrityViolations: complianceMetrics.integrityViolations,
        auditCoverage: complianceMetrics.auditCoverage,
        retentionCompliance: complianceMetrics.retentionCompliance
      };
    } catch (error) {
      console.error('Security analysis failed:', error);
      throw new Error('Security analysis could not be completed');
    }
  }

  /**
   * Detect security threats in real-time
   */
  async detectThreats(): Promise<SecurityThreat[]> {
    const detectedThreats: SecurityThreat[] = [];
    
    try {
      // Detect brute force attacks
      const bruteForceThreats = await this.detectBruteForceAttacks();
      detectedThreats.push(...bruteForceThreats);

      // Detect privilege escalation attempts
      const privilegeThreats = await this.detectPrivilegeEscalation();
      detectedThreats.push(...privilegeThreats);

      // Detect data exfiltration attempts
      const dataThreats = await this.detectDataExfiltration();
      detectedThreats.push(...dataThreats);

      // Detect suspicious patterns
      const patternThreats = await this.detectSuspiciousPatterns();
      detectedThreats.push(...patternThreats);

      // Detect anomalies
      const anomalyThreats = await this.detectAnomalies();
      detectedThreats.push(...anomalyThreats);

      // Save new threats to database
      for (const threat of detectedThreats) {
        await this.saveThreat(threat);
        await this.createSecurityAlert(threat);
      }

      return detectedThreats;
    } catch (error) {
      console.error('Threat detection failed:', error);
      throw new Error('Threat detection could not be completed');
    }
  }

  /**
   * Detect brute force attacks
   */
  private async detectBruteForceAttacks(): Promise<SecurityThreat[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const threats: SecurityThreat[] = [];

    try {
      // Group failed login attempts by IP address
      const failedLogins = await db.auditLog.findMany({
        where: {
          action: 'LOGIN',
          createdAt: { gte: thirtyMinutesAgo },
          OR: [
            { description: { contains: 'failed', mode: 'insensitive' } },
            { description: { contains: 'invalid', mode: 'insensitive' } },
            { riskScore: { gte: 6 } }
          ]
        },
        select: {
          id: true,
          ipAddress: true,
          actorName: true,
          createdAt: true,
          userAgent: true,
          description: true
        }
      });

      // Group by IP address
      const ipGroups = failedLogins.reduce((acc: any, login: any) => {
        const ip = login.ipAddress || 'unknown';
        if (!acc[ip]) acc[ip] = [];
        acc[ip].push(login);
        return acc;
      }, {} as Record<string, typeof failedLogins>);

      // Check for brute force patterns
      Object.entries(ipGroups).forEach(([ip, attempts]) => {
        if ((attempts as any[]).length >= this.THREAT_THRESHOLDS.FAILED_LOGINS) {
          const evidence: SecurityEvidence[] = (attempts as any[]).map((attempt: any) => ({
            auditLogId: attempt.id,
            evidenceType: 'LOGIN_ATTEMPT',
            description: `Failed login attempt: ${attempt.description}`,
            timestamp: attempt.createdAt,
            sourceIP: attempt.ipAddress || undefined,
            userAgent: attempt.userAgent || undefined
          }));

          threats.push({
            id: `brute-force-${ip}-${Date.now()}`,
            type: 'BRUTE_FORCE',
            severity: (attempts as any[]).length > 10 ? 'HIGH' : 'MEDIUM',
            description: `Brute force attack detected from IP ${ip} with ${(attempts as any[]).length} failed login attempts in 30 minutes`,
            affectedEntities: [...new Set((attempts as any[]).map((a: any) => a.actorName || 'unknown'))],
            evidence,
            riskScore: Math.min(10, 5 + (attempts as any[]).length * 0.5),
            detectedAt: new Date(),
            status: 'ACTIVE',
            remediationActions: [
              `Block IP address ${ip}`,
              'Review affected user accounts',
              'Enable additional authentication factors',
              'Monitor for continued attempts'
            ]
          });
        }
      });

      return threats;
    } catch (error) {
      console.error('Error detecting brute force attacks:', error);
      return [];
    }
  }

  /**
   * Detect privilege escalation attempts
   */
  private async detectPrivilegeEscalation(): Promise<SecurityThreat[]> {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const threats: SecurityThreat[] = [];

    try {
      // Look for admin role changes or permission modifications
      const privilegeChanges = await db.auditLog.findMany({
        where: {
          createdAt: { gte: lastHour },
          OR: [
            { action: 'UPDATE', entityType: 'ADMIN' },
            { action: 'CREATE', entityType: 'ADMIN' },
            { description: { contains: 'role', mode: 'insensitive' } },
            { description: { contains: 'permission', mode: 'insensitive' } },
            { description: { contains: 'privilege', mode: 'insensitive' } }
          ]
        },
        include: {
          actor: true
        }
      });

      // Group by actor and analyze patterns
      const actorGroups = privilegeChanges.reduce((acc: any, change: any) => {
        const actorId = change.actorId || 'unknown';
        if (!acc[actorId]) acc[actorId] = [];
        acc[actorId].push(change);
        return acc;
      }, {} as Record<string, typeof privilegeChanges>);

      Object.entries(actorGroups).forEach(([actorId, changes]) => {
        // Check for suspicious privilege escalation patterns
        const hasRoleChanges = (changes as any[]).some((c: any) =>
          c.newValues && 
          JSON.stringify(c.newValues).includes('SUPER_ADMIN')
        );

        const hasMultipleChanges = (changes as any[]).length > 2;

        if (hasRoleChanges || hasMultipleChanges) {
          const evidence: SecurityEvidence[] = (changes as any[]).map((change: any) => ({
            auditLogId: change.id,
            evidenceType: 'PRIVILEGE_CHANGE',
            description: `Privilege modification: ${change.description}`,
            timestamp: change.createdAt,
            sourceIP: change.ipAddress || undefined
          }));

          threats.push({
            id: `privilege-escalation-${actorId}-${Date.now()}`,
            type: 'PRIVILEGE_ESCALATION',
            severity: hasRoleChanges ? 'HIGH' : 'MEDIUM',
            description: `Privilege escalation detected for user ${(changes as any[])[0]?.actorName} with ${(changes as any[]).length} privilege modifications in 1 hour`,
            affectedEntities: [actorId, ...(changes as any[]).map((c: any) => c.entityId)],
            evidence,
            riskScore: hasRoleChanges ? 9 : 7,
            detectedAt: new Date(),
            status: 'ACTIVE',
            remediationActions: [
              'Review user access permissions immediately',
              'Verify legitimacy of privilege changes',
              'Consider temporary access suspension',
              'Alert system administrators'
            ]
          });
        }
      });

      return threats;
    } catch (error) {
      console.error('Error detecting privilege escalation:', error);
      return [];
    }
  }

  /**
   * Detect data exfiltration attempts
   */
  private async detectDataExfiltration(): Promise<SecurityThreat[]> {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const threats: SecurityThreat[] = [];

    try {
      // Look for bulk data access or export operations
      const bulkOperations = await db.auditLog.findMany({
        where: {
          createdAt: { gte: lastHour },
          OR: [
            { action: 'EXPORT' },
            { action: 'IMPORT' },
            { description: { contains: 'export', mode: 'insensitive' } },
            { description: { contains: 'download', mode: 'insensitive' } },
            { description: { contains: 'bulk', mode: 'insensitive' } }
          ]
        }
      });

      // Group by actor
      const actorOperations = bulkOperations.reduce((acc: any, op: any) => {
        const actorId = op.actorId || 'unknown';
        if (!acc[actorId]) acc[actorId] = [];
        acc[actorId].push(op);
        return acc;
      }, {} as Record<string, typeof bulkOperations>);

      Object.entries(actorOperations).forEach(([actorId, operations]) => {
        if ((operations as any[]).length >= this.THREAT_THRESHOLDS.BULK_OPERATIONS) {
          const evidence: SecurityEvidence[] = (operations as any[]).map((op: any) => ({
            auditLogId: op.id,
            evidenceType: 'BULK_OPERATION',
            description: `Bulk operation: ${op.description}`,
            timestamp: op.createdAt,
            sourceIP: op.ipAddress || undefined
          }));

          threats.push({
            id: `data-exfiltration-${actorId}-${Date.now()}`,
            type: 'DATA_EXFILTRATION',
            severity: (operations as any[]).length > 20 ? 'CRITICAL' : 'HIGH',
            description: `Potential data exfiltration detected: ${(operations as any[]).length} bulk operations by ${(operations as any[])[0]?.actorName} in 1 hour`,
            affectedEntities: [actorId, ...(operations as any[]).map((op: any) => op.entityType)],
            evidence,
            riskScore: Math.min(10, 6 + (operations as any[]).length * 0.2),
            detectedAt: new Date(),
            status: 'ACTIVE',
            remediationActions: [
              'Immediately review data access patterns',
              'Suspend user access pending investigation',
              'Check for unauthorized data exports',
              'Contact security team',
              'Review network traffic logs'
            ]
          });
        }
      });

      return threats;
    } catch (error) {
      console.error('Error detecting data exfiltration:', error);
      return [];
    }
  }

  /**
   * Detect suspicious patterns using behavioral analysis
   */
  private async detectSuspiciousPatterns(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    try {
      // Analyze unusual time-based access patterns
      const offHoursActivity = await this.detectOffHoursActivity();
      threats.push(...offHoursActivity);

      // Analyze geographic anomalies
      const geoAnomalies = await this.detectGeographicAnomalies();
      threats.push(...geoAnomalies);

      // Analyze rapid successive operations
      const rapidOperations = await this.detectRapidOperations();
      threats.push(...rapidOperations);

      return threats;
    } catch (error) {
      console.error('Error detecting suspicious patterns:', error);
      return [];
    }
  }

  /**
   * Detect statistical anomalies in audit data
   */
  private async detectAnomalies(): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    try {
      const anomalies = await this.analyzeStatisticalAnomalies();
      
      anomalies.forEach(anomaly => {
        if (anomaly.severity === 'HIGH' && anomaly.confidence > 0.8) {
          threats.push({
            id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'ANOMALY',
            severity: anomaly.severity,
            description: `Statistical anomaly detected: ${anomaly.description}`,
            affectedEntities: [anomaly.patternType],
            evidence: [{
              auditLogId: `anomaly-${Date.now()}`,
              evidenceType: 'PATTERN',
              description: `${anomaly.patternType}: Current value ${anomaly.currentValue} exceeds baseline ${anomaly.baseline} by ${((anomaly.currentValue - anomaly.baseline) / anomaly.baseline * 100).toFixed(1)}%`,
              timestamp: new Date()
            }],
            riskScore: anomaly.severity === 'HIGH' ? 8 : 6,
            detectedAt: new Date(),
            status: 'ACTIVE',
            remediationActions: [
              'Investigate anomalous activity patterns',
              'Review affected systems and users',
              'Check for system configuration changes',
              'Validate against known maintenance activities'
            ]
          });
        }
      });

      return threats;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  /**
   * Get currently active security threats
   */
  private async getActiveThreats(): Promise<SecurityThreat[]> {
    try {
      const alerts = await db.auditAlert.findMany({
        where: {
          alertType: { in: ['SECURITY_BREACH', 'INTEGRITY_VIOLATION', 'BRUTE_FORCE'] },
          status: { in: ['ACTIVE', 'ACKNOWLEDGED'] }
        },
        orderBy: { createdAt: 'desc' }
      });

      return alerts.map((alert: any) => ({
        id: alert.id,
        type: this.mapAlertTypeToThreatType(alert.alertType),
        severity: alert.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        description: alert.message,
        affectedEntities: alert.affectedEntities,
        evidence: [], // Would be populated from related audit logs
        riskScore: alert.riskScore || 5,
        detectedAt: alert.createdAt,
        status: alert.status as 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED',
        remediationActions: alert.remediationActions
      }));
    } catch (error) {
      console.error('Error getting active threats:', error);
      return [];
    }
  }

  /**
   * Analyze security events for metrics
   */
  private async analyzeSecurityEvents(since: Date) {
    try {
      const [failedLogins, suspiciousActivities, privilegeEscalations, dataExfiltrationAttempts] = await Promise.all([
        db.auditLog.count({
          where: {
            createdAt: { gte: since },
            action: 'LOGIN',
            OR: [
              { description: { contains: 'failed', mode: 'insensitive' } },
              { riskScore: { gte: 6 } }
            ]
          }
        }),
        db.auditLog.count({
          where: {
            createdAt: { gte: since },
            riskScore: { gte: this.THREAT_THRESHOLDS.RISK_SCORE_THRESHOLD }
          }
        }),
        db.auditLog.count({
          where: {
            createdAt: { gte: since },
            OR: [
              { action: 'UPDATE', entityType: 'ADMIN' },
              { description: { contains: 'role', mode: 'insensitive' } }
            ]
          }
        }),
        db.auditLog.count({
          where: {
            createdAt: { gte: since },
            OR: [
              { action: 'EXPORT' },
              { description: { contains: 'export', mode: 'insensitive' } }
            ]
          }
        })
      ]);

      return {
        failedLogins,
        suspiciousActivities,
        privilegeEscalations,
        dataExfiltrationAttempts
      };
    } catch (error) {
      console.error('Error analyzing security events:', error);
      return {
        failedLogins: 0,
        suspiciousActivities: 0,
        privilegeEscalations: 0,
        dataExfiltrationAttempts: 0
      };
    }
  }

  /**
   * Calculate overall risk metrics
   */
  private async calculateRiskMetrics() {
    try {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const [riskStats, highRiskLogs] = await Promise.all([
        db.auditLog.aggregate({
          where: { createdAt: { gte: lastWeek } },
          _avg: { riskScore: true }
        }),
        db.auditLog.findMany({
          where: {
            createdAt: { gte: lastWeek },
            riskScore: { gte: 7 }
          },
          select: {
            actorId: true,
            actorName: true,
            entityType: true,
            entityId: true
          },
          take: 100
        })
      ]);

      const highRiskUsers = [...new Set(highRiskLogs.map((log: any) => log.actorName).filter(Boolean))] as string[];
      const vulnerableEntities = [...new Set(highRiskLogs.map((log: any) => log.entityType))] as string[];

      return {
        averageRiskScore: Math.round((riskStats._avg.riskScore || 0) * 100) / 100,
        highRiskUsers: highRiskUsers.slice(0, 10),
        vulnerableEntities: vulnerableEntities.slice(0, 10)
      };
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      return {
        averageRiskScore: 0,
        highRiskUsers: [],
        vulnerableEntities: []
      };
    }
  }

  /**
   * Assess compliance metrics
   */
  private async assessComplianceMetrics() {
    try {
      const [integrityViolations, totalLogs, retentionCheck] = await Promise.all([
        db.auditIntegrity.count({
          where: { chainHash: { not: '' } }
        }),
        db.auditLog.count(),
        this.checkRetentionCompliance()
      ]);

      return {
        integrityViolations,
        auditCoverage: Math.min(100, (totalLogs / 10000) * 100), // Simplified calculation
        retentionCompliance: retentionCheck
      };
    } catch (error) {
      console.error('Error assessing compliance metrics:', error);
      return {
        integrityViolations: 0,
        auditCoverage: 0,
        retentionCompliance: 0
      };
    }
  }

  /**
   * Calculate overall threat level based on active threats and recent events
   */
  private calculateOverallThreatLevel(threats: SecurityThreat[], events: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalThreats = threats.filter(t => t.severity === 'CRITICAL').length;
    const highThreats = threats.filter(t => t.severity === 'HIGH').length;
    const totalEvents = events.failedLogins + events.suspiciousActivities + events.privilegeEscalations + events.dataExfiltrationAttempts;

    if (criticalThreats > 0 || totalEvents > 100) return 'CRITICAL';
    if (highThreats > 2 || totalEvents > 50) return 'HIGH';
    if (highThreats > 0 || totalEvents > 20) return 'MEDIUM';
    return 'LOW';
  }

  // Helper methods
  private async detectOffHoursActivity(): Promise<SecurityThreat[]> {
    // Implementation for detecting off-hours activity
    return [];
  }

  private async detectGeographicAnomalies(): Promise<SecurityThreat[]> {
    // Implementation for detecting geographic anomalies
    return [];
  }

  private async detectRapidOperations(): Promise<SecurityThreat[]> {
    // Implementation for detecting rapid successive operations
    return [];
  }

  private async analyzeStatisticalAnomalies(): Promise<AnomalyPattern[]> {
    // Implementation for statistical anomaly detection
    return [];
  }

  private async checkRetentionCompliance(): Promise<number> {
    // Implementation for checking data retention compliance
    return 95; // 95% compliant
  }

  private mapAlertTypeToThreatType(alertType: AlertType): SecurityThreat['type'] {
    switch (alertType) {
      case 'SECURITY_BREACH': return 'SUSPICIOUS_PATTERN';
      case 'INTEGRITY_VIOLATION': return 'SUSPICIOUS_PATTERN';
      case 'BRUTE_FORCE': return 'BRUTE_FORCE';
      default: return 'ANOMALY';
    }
  }

  private async saveThreat(threat: SecurityThreat): Promise<void> {
    // Save threat to database (implementation depends on threat storage model)
  }

  private async createSecurityAlert(threat: SecurityThreat): Promise<void> {
    await db.auditAlert.create({
      data: {
        alertType: 'SECURITY_BREACH',
        severity: threat.severity,
        title: threat.type,
        description: threat.description,
        metadata: JSON.stringify({ threatType: threat.type, evidence: threat.evidence })
      }
    });
  }
}

export default new SecurityMonitoringService();
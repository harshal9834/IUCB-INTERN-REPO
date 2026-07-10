import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Admin, AdminRole } from "@prisma/client";
import prisma from "../config/Database.js";
import ApiError from "../utils/ApiError.js";
import Logger from "../utils/Logger.js";
import AuditService, { AuditContext } from './audit.service.js';
import { AuditAction, AuditSeverity } from '../types/audit-enums.js';

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_signing_key_change_me_in_production";
const JWT_EXPIRES_IN = "15m"; // Short lived access token
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export class AuthService {
  // Generate Access JWT Token
  generateAccessToken(admin: { id: string; email: string; role: AdminRole }): string {
    return jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Generate Refresh Token and store it in database
  async generateRefreshToken(adminId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await prisma.refreshToken.create({
      data: {
        token,
        adminId,
        expiresAt,
      },
    });

    return token;
  }

  // Enhanced Audit Logging using new Audit Service
  async logAudit(
    adminId: string | null, 
    entityType: string, 
    entityId: string, 
    action: string, 
    ip: string | null, 
    ua: string | null, 
    oldData?: any, 
    newData?: any,
    adminName?: string,
    adminRole?: AdminRole,
    sessionId?: string,
    requestId?: string
  ) {
    try {
      // Map legacy action strings to new AuditAction enum
      let auditAction: AuditAction;
      switch (action.toUpperCase()) {
        case 'LOGIN':
          auditAction = AuditAction.LOGIN;
          break;
        case 'LOGOUT':
          auditAction = AuditAction.LOGOUT;
          break;
        case 'FAILED_LOGIN':
          auditAction = AuditAction.FAILED_LOGIN;
          break;
        case 'PASSWORD_CHANGE':
          auditAction = AuditAction.PASSWORD_CHANGE;
          break;
        case 'PASSWORD_RESET':
          auditAction = AuditAction.PASSWORD_RESET;
          break;
        case 'CREATE':
          auditAction = AuditAction.CREATE;
          break;
        case 'UPDATE':
          auditAction = AuditAction.UPDATE;
          break;
        case 'DELETE':
          auditAction = AuditAction.DELETE;
          break;
        case 'APPROVE':
          auditAction = AuditAction.APPROVE;
          break;
        case 'REJECT':
          auditAction = AuditAction.REJECT;
          break;
        default:
          auditAction = AuditAction.UPDATE; // Default fallback
      }

      const context: AuditContext = {
        adminId: adminId || undefined,
        adminName: adminName,
        adminRole: adminRole,
        ipAddress: ip || undefined,
        userAgent: ua || undefined,
        sessionId,
        requestId,
      };

      const severity = this.determineSeverity(auditAction);
      const module = this.determineModule(entityType);
      const description = this.generateDescription(auditAction, entityType, entityId);

      await AuditService.logAudit(
        context,
        entityType,
        entityId,
        auditAction,
        module,
        description,
        oldData,
        newData,
        undefined, // metadata
        severity
      );

      // Also maintain legacy audit log for backward compatibility
      await prisma.auditLog.create({
        data: {
          adminId,
          entityType,
          entityId,
          action: auditAction,
          module,
          description,
          ipAddress: ip,
          userAgent: ua,
          oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : undefined,
          newData: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
          sessionId,
          requestId,
          severity,
          timestamp: new Date(),
        },
      });

    } catch (err) {
      Logger.error("Failed to write audit log entry:", err);
    }
  }

  // Legacy method for backward compatibility
  async logAuditLegacy(adminId: string | null, entityType: string, entityId: string, action: string, ip: string | null, ua: string | null, oldData?: any, newData?: any) {
    return this.logAudit(adminId, entityType, entityId, action, ip, ua, oldData, newData);
  }

  // Invalidate individual refresh token
  async invalidateRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  // Invalidate all tokens for an admin (e.g. on reset/change password)
  async invalidateAllAdminTokens(adminId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { adminId },
    });
  }

  // Helper method to determine audit severity
  private determineSeverity(action: AuditAction): AuditSeverity {
    switch (action) {
      case AuditAction.DELETE:
      case AuditAction.BULK_DELETE:
      case AuditAction.FAILED_LOGIN:
      case AuditAction.ROLE_CHANGE:
      case AuditAction.PERMISSION_CHANGE:
        return AuditSeverity.HIGH;
      case AuditAction.PASSWORD_CHANGE:
      case AuditAction.PASSWORD_RESET:
      case AuditAction.UPDATE:
      case AuditAction.STATUS_CHANGE:
      case AuditAction.APPROVE:
      case AuditAction.REJECT:
        return AuditSeverity.MEDIUM;
      default:
        return AuditSeverity.LOW;
    }
  }

  // Helper method to determine module from entity type
  private determineModule(entityType: string): string {
    switch (entityType.toLowerCase()) {
      case 'admin':
        return 'Authentication';
      case 'organization':
        return 'Organizations';
      case 'auditor':
        return 'Auditors';
      case 'credential':
        return 'Credentials';
      case 'application':
        return 'Applications';
      case 'advisor':
        return 'Advisory';
      case 'traininginstitute':
        return 'Training Institutes';
      default:
        return 'System';
    }
  }

  // Helper method to generate audit description
  private generateDescription(action: AuditAction, entityType: string, entityId: string): string {
    const actionText = action.toLowerCase().replace('_', ' ');
    return `${actionText} ${entityType.toLowerCase()} ${entityId}`;
  }
}

export default AuthService;

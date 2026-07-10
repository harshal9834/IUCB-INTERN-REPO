import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './audit.middleware.js';
import AuditService from '../services/audit.service.js';
import { AuditAction, AuditSeverity } from '../types/audit-enums.js';

interface EntityOperationConfig {
  entityType: string;
  module: string;
  getEntityId?: (req: Request, result?: any) => string;
  getEntityData?: (result: any) => any;
  severity?: AuditSeverity;
  description?: string;
}

interface ResponseWithData extends Response {
  auditData?: {
    oldData?: any;
    newData?: any;
    entityId?: string;
    action?: AuditAction;
    config?: EntityOperationConfig;
  };
}

// Enhanced middleware that captures request/response data for automatic audit logging
export const captureAuditData = (config: EntityOperationConfig) => {
  return (req: AuthenticatedRequest, res: ResponseWithData, next: NextFunction) => {
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Initialize audit data
    res.auditData = { config };
    
    // Determine action based on HTTP method and route
    const action = determineAction(req.method, req.route?.path);
    res.auditData.action = action;
    
    // For UPDATE/DELETE operations, fetch existing data
    if (['PATCH', 'PUT', 'DELETE'].includes(req.method) && req.params.id) {
      fetchExistingData(req, config, res);
    }
    
    // Override response methods to capture response data
    res.json = function(data: any) {
      captureResponseData(req, res, data, config, action);
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      if (typeof data === 'object') {
        captureResponseData(req, res, data, config, action);
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

// Middleware to process captured audit data after response
export const processAuditLog = (req: AuthenticatedRequest, res: ResponseWithData, next: NextFunction) => {
  // Override res.end to process audit data when response is finished
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any) {
    // Only log if request was successful (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300 && res.auditData && req.auditContext) {
      const { config, action, oldData, newData, entityId } = res.auditData;
      
      if (config && action) {
        // Async audit logging (non-blocking)
        setImmediate(async () => {
          try {
            const finalEntityId = entityId || 
              (config.getEntityId ? config.getEntityId(req, newData) : req.params.id) || 
              'unknown';
            
            // Ensure finalEntityId is a string, not array
            const entityIdStr = Array.isArray(finalEntityId) ? finalEntityId[0] : finalEntityId;
              
            const description = config.description || 
              generateDescription(action, config.entityType, entityIdStr);
            
            if (!req.auditContext) return;

            await AuditService.logAudit(
              req.auditContext,
              config.entityType,
              entityIdStr,
              action,
              config.module,
              description,
              oldData,
              newData,
              {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                params: req.params,
                query: req.query,
              },
              config.severity || determineSeverity(action)
            );
          } catch (error) {
            console.error('Auto-audit logging failed:', error);
          }
        });
      }
    }
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Auto-audit middleware factory for specific entity operations
export const autoAudit = (config: EntityOperationConfig) => {
  return [
    captureAuditData(config),
    processAuditLog
  ];
};

// Predefined middleware for common entities
export const auditOrganizations = autoAudit({
  entityType: 'ORGANIZATION',
  module: 'Organizations',
  getEntityId: (req) => req.params.id || req.body.id,
  getEntityData: (result) => result?.data?.organization || result?.organization,
});

export const auditAuditors = autoAudit({
  entityType: 'AUDITOR', 
  module: 'Auditors',
  getEntityId: (req) => req.params.id || req.body.id,
  getEntityData: (result) => result?.data?.auditor || result?.auditor,
});

export const auditCredentials = autoAudit({
  entityType: 'CREDENTIAL',
  module: 'Credentials', 
  getEntityId: (req) => req.params.id || req.body.id,
  getEntityData: (result) => result?.data?.credential || result?.credential,
});

export const auditApplications = autoAudit({
  entityType: 'APPLICATION',
  module: 'Applications',
  getEntityId: (req) => req.params.id || req.body.id,
  getEntityData: (result) => result?.data?.application || result?.application,
});

export const auditAdvisors = autoAudit({
  entityType: 'ADVISOR',
  module: 'Advisory',
  getEntityId: (req) => req.params.id || req.body.id,
  getEntityData: (result) => result?.data?.advisor || result?.advisor,
});

export const auditTrainingInstitutes = autoAudit({
  entityType: 'TRAINING_INSTITUTE',
  module: 'Training Institutes',
  getEntityId: (req) => req.params.id || req.body.id,
  getEntityData: (result) => result?.data?.trainingInstitute || result?.trainingInstitute,
});

export const auditAdmins = autoAudit({
  entityType: 'ADMIN',
  module: 'Administration',
  getEntityId: (req: AuthenticatedRequest) => req.params.id || req.body.id || req.admin?.id,
  getEntityData: (result) => result?.data?.admin || result?.admin,
  severity: AuditSeverity.HIGH,
});

// Specialized middleware for authentication operations
export const auditAuthOperations = (operation: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET') => {
  return (req: AuthenticatedRequest, res: ResponseWithData, next: NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;
    
    const logAuth = async (success: boolean = true) => {
      if (!req.auditContext) return;
      
      let action: AuditAction;
      let entityId = 'unknown';
      let description = '';
      let severity: AuditSeverity = AuditSeverity.MEDIUM;
      let oldData: any = undefined;
      let newData: any = undefined;
      
      switch (operation) {
        case 'LOGIN':
          action = success ? AuditAction.LOGIN : AuditAction.FAILED_LOGIN;
          entityId = req.admin?.id || req.body.email || 'unknown';
          description = success ? `Admin ${req.admin?.fullName} logged in` : `Failed login attempt for ${req.body.email}`;
          severity = success ? AuditSeverity.LOW : AuditSeverity.HIGH;
          newData = success ? { loginTime: new Date() } : { failedEmail: req.body.email };
          break;
          
        case 'LOGOUT':
          action = AuditAction.LOGOUT;
          entityId = req.admin?.id || 'unknown';
          description = `Admin ${req.admin?.fullName} logged out`;
          severity = AuditSeverity.LOW;
          break;
          
        case 'PASSWORD_CHANGE':
          action = AuditAction.PASSWORD_CHANGE;
          entityId = req.admin?.id || 'unknown';
          description = `Admin ${req.admin?.fullName} changed password`;
          severity = AuditSeverity.MEDIUM;
          break;
          
        case 'PASSWORD_RESET':
          action = AuditAction.PASSWORD_RESET;
          entityId = req.body.email || 'unknown';
          description = `Password reset requested for ${req.body.email}`;
          severity = AuditSeverity.HIGH;
          break;
          
        default:
          return;
      }
      
      try {
        await AuditService.logAudit(
          req.auditContext,
          'ADMIN',
          entityId,
          action,
          'Authentication',
          description,
          oldData,
          newData,
          {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
          },
          severity
        );
      } catch (error) {
        console.error('Auth audit logging failed:', error);
      }
    };
    
    // Override response methods
    res.json = function(data: any) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      setImmediate(() => logAuth(success));
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      setImmediate(() => logAuth(success));
      return originalSend.call(this, data);
    };

    next();
  };
};

// Helper function to determine audit action from HTTP method and route
function determineAction(method: string, routePath?: string): AuditAction {
  switch (method.toUpperCase()) {
    case 'POST':
      return AuditAction.CREATE;
    case 'PUT':
    case 'PATCH':
      if (routePath?.includes('status')) return AuditAction.STATUS_CHANGE;
      if (routePath?.includes('approve')) return AuditAction.APPROVE;
      if (routePath?.includes('reject')) return AuditAction.REJECT;
      return AuditAction.UPDATE;
    case 'DELETE':
      return AuditAction.DELETE;
    default:
      return AuditAction.UPDATE;
  }
}

// Helper function to determine severity based on action
function determineSeverity(action: AuditAction): AuditSeverity {
  switch (action) {
    case AuditAction.DELETE:
    case AuditAction.BULK_DELETE:
    case AuditAction.ROLE_CHANGE:
    case AuditAction.PERMISSION_CHANGE:
      return AuditSeverity.HIGH;
    case AuditAction.PASSWORD_CHANGE:
    case AuditAction.PASSWORD_RESET:
    case AuditAction.STATUS_CHANGE:
    case AuditAction.APPROVE:
    case AuditAction.REJECT:
      return AuditSeverity.MEDIUM;
    default:
      return AuditSeverity.LOW;
  }
}

// Helper function to generate description
function generateDescription(action: AuditAction, entityType: string, entityId: string): string {
  const actionText = action.toLowerCase().replace('_', ' ');
  return `${actionText} ${entityType.toLowerCase()} ${entityId}`;
}

// Helper function to fetch existing data for updates/deletes
async function fetchExistingData(req: Request, config: EntityOperationConfig, res: ResponseWithData) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const entityId = req.params.id;
    const entityIdStr = Array.isArray(entityId) ? entityId[0] : entityId;
    if (!entityIdStr) return;
    
    let existingData: any = null;
    
    switch (config.entityType) {
      case 'ORGANIZATION':
        existingData = await prisma.organization.findUnique({
          where: { id: entityIdStr, deletedAt: null }
        });
        break;
      case 'AUDITOR':
        existingData = await prisma.auditor.findUnique({
          where: { id: entityIdStr, deletedAt: null }
        });
        break;
      case 'CREDENTIAL':
        existingData = await prisma.credential.findUnique({
          where: { id: entityIdStr, deletedAt: null }
        });
        break;
      case 'APPLICATION':
        existingData = await prisma.application.findUnique({
          where: { id: entityIdStr, deletedAt: null }
        });
        break;
      case 'ADVISOR':
        existingData = await prisma.advisor.findUnique({
          where: { id: entityIdStr, deletedAt: null }
        });
        break;
      case 'TRAINING_INSTITUTE':
        existingData = await prisma.trainingInstitute.findUnique({
          where: { id: entityIdStr, deletedAt: null }
        });
        break;
      case 'ADMIN':
        existingData = await prisma.admin.findUnique({
          where: { id: entityIdStr, deletedAt: null }
        });
        break;
    }
    
    if (existingData && res.auditData) {
      res.auditData.oldData = existingData;
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Failed to fetch existing data for audit:', error);
  }
}

// Helper function to capture response data
function captureResponseData(
  req: Request, 
  res: ResponseWithData, 
  data: any, 
  config: EntityOperationConfig, 
  action: AuditAction
) {
  if (!res.auditData) return;
  
  try {
    let newData: any = null;
    let entityId: string | undefined;
    
    // Extract data based on response structure
    if (data && typeof data === 'object') {
      // Handle ApiResponse wrapper
      if (data.data) {
        newData = config.getEntityData ? config.getEntityData(data) : data.data;
        entityId = extractEntityId(newData, config);
      } else {
        newData = data;
        entityId = extractEntityId(newData, config);
      }
    }
    
    res.auditData.newData = newData;
    if (entityId) {
      res.auditData.entityId = entityId;
    }
  } catch (error) {
    console.error('Failed to capture response data:', error);
  }
}

// Helper function to extract entity ID from data
function extractEntityId(data: any, config: EntityOperationConfig): string | undefined {
  if (!data) return undefined;
  
  // Try common ID fields
  if (data.id) return data.id;
  if (data.credentialId) return data.credentialId;
  if (data.applicationId) return data.applicationId;
  
  // Try nested objects
  if (data.organization?.id) return data.organization.id;
  if (data.auditor?.id) return data.auditor.id;
  if (data.credential?.id) return data.credential.id;
  if (data.application?.id) return data.application.id;
  if (data.advisor?.id) return data.advisor.id;
  if (data.trainingInstitute?.id) return data.trainingInstitute.id;
  if (data.admin?.id) return data.admin.id;
  
  return undefined;
}
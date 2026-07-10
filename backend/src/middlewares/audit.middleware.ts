import { Request, Response, NextFunction } from 'express';
import AuditService, { AuditContext } from '../services/audit.service.js';
import { AuditAction, AuditSeverity } from '../types/audit-enums.js';
import { v4 as uuidv4 } from 'uuid';

export interface AuthenticatedRequest extends Request {
  admin?: any;
  auditContext?: AuditContext;
}

export interface AuditOptions {
  entityType: string;
  action: AuditAction;
  module: string;
  getEntityId?: (req: Request) => string | string[];
  getDescription?: (req: Request) => string;
  severity?: AuditSeverity;
  captureBody?: boolean;
  captureResponse?: boolean;
}

// Middleware to setup audit context
export const setupAuditContext = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  
  req.auditContext = {
    adminId: req.admin?.id,
    adminName: req.admin?.fullName,
    adminRole: req.admin?.role,
    ipAddress: getClientIP(req),
    userAgent: req.get('User-Agent'),
    sessionId: req.get('X-Session-ID'),
    requestId,
  };

  // Add request ID to response headers for tracking
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

// Generic audit logging middleware
export const auditLog = (options: AuditOptions) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseData: any = null;
    let requestData: any = null;

    // Capture request data if needed
    if (options.captureBody && req.body) {
      requestData = sanitizeData(req.body);
    }

    // Override response methods to capture response data
    if (options.captureResponse) {
      res.send = function(data: any) {
        responseData = data;
        return originalSend.call(this, data);
      };

      res.json = function(data: any) {
        responseData = data;
        return originalJson.call(this, data);
      };
    }

    // Execute the route handler
    const originalNext = next;
    next = function(error?: any) {
      if (!error && req.auditContext) {
        // Log successful operation
        logAuditAsync(req, options, requestData, responseData, res.statusCode);
      }
      return originalNext(error);
    };

    next();
  };
};

// Specific middleware for different operations
export const auditLogin = auditLog({
  entityType: 'Admin',
  action: AuditAction.LOGIN,
  module: 'Authentication',
  getEntityId: (req) => req.body.email || 'unknown',
  getDescription: () => 'Admin login attempt',
  severity: AuditSeverity.MEDIUM,
});

export const auditLogout = auditLog({
  entityType: 'Admin',
  action: AuditAction.LOGOUT,
  module: 'Authentication',
  getEntityId: (req: AuthenticatedRequest) => req.admin?.id || 'unknown',
  getDescription: (req: AuthenticatedRequest) => `Admin ${req.admin?.fullName} logged out`,
  severity: AuditSeverity.LOW,
});

export const auditFailedLogin = auditLog({
  entityType: 'Admin',
  action: AuditAction.FAILED_LOGIN,
  module: 'Authentication',
  getEntityId: (req) => req.body.email || 'unknown',
  getDescription: () => 'Failed login attempt',
  severity: AuditSeverity.HIGH,
});

export const auditCreate = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.CREATE,
  module,
  getEntityId: (req) => req.body.id || req.params.id || 'new',
  getDescription: (req) => `Created new ${entityType.toLowerCase()}`,
  severity: AuditSeverity.LOW,
  captureBody: true,
  captureResponse: true,
});

export const auditUpdate = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.UPDATE,
  module,
  getEntityId: (req) => req.params.id || req.body.id || 'unknown',
  getDescription: (req) => `Updated ${entityType.toLowerCase()} ${req.params.id || req.body.id}`,
  severity: AuditSeverity.MEDIUM,
  captureBody: true,
  captureResponse: true,
});

export const auditDelete = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.DELETE,
  module,
  getEntityId: (req) => req.params.id || 'unknown',
  getDescription: (req) => `Deleted ${entityType.toLowerCase()} ${req.params.id}`,
  severity: AuditSeverity.HIGH,
});

export const auditStatusChange = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.STATUS_CHANGE,
  module,
  getEntityId: (req) => req.params.id || req.body.id || 'unknown',
  getDescription: (req) => `Changed status of ${entityType.toLowerCase()} ${req.params.id || req.body.id}`,
  severity: AuditSeverity.MEDIUM,
  captureBody: true,
});

export const auditApproval = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.APPROVE,
  module,
  getEntityId: (req) => req.params.id || 'unknown',
  getDescription: (req) => `Approved ${entityType.toLowerCase()} ${req.params.id}`,
  severity: AuditSeverity.MEDIUM,
  captureBody: true,
});

export const auditRejection = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.REJECT,
  module,
  getEntityId: (req) => req.params.id || 'unknown',
  getDescription: (req) => `Rejected ${entityType.toLowerCase()} ${req.params.id}`,
  severity: AuditSeverity.MEDIUM,
  captureBody: true,
});

export const auditGenerate = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.GENERATE,
  module,
  getEntityId: (req) => req.params.id || req.body.id || 'unknown',
  getDescription: (req) => `Generated ${entityType.toLowerCase()} for ${req.params.id || req.body.id}`,
  severity: AuditSeverity.MEDIUM,
  captureBody: true,
});

export const auditDownload = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.DOWNLOAD,
  module,
  getEntityId: (req) => req.params.id || 'unknown',
  getDescription: (req) => `Downloaded ${entityType.toLowerCase()} ${req.params.id}`,
  severity: AuditSeverity.LOW,
});

export const auditExport = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.EXPORT,
  module,
  getEntityId: () => 'bulk-export',
  getDescription: () => `Exported ${entityType.toLowerCase()} data`,
  severity: AuditSeverity.MEDIUM,
});

export const auditImport = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.IMPORT,
  module,
  getEntityId: () => 'bulk-import',
  getDescription: () => `Imported ${entityType.toLowerCase()} data`,
  severity: AuditSeverity.HIGH,
  captureBody: true,
});

export const auditUpload = (entityType: string, module: string) => auditLog({
  entityType,
  action: AuditAction.UPLOAD,
  module,
  getEntityId: (req) => req.params.id || 'file-upload',
  getDescription: (req) => `Uploaded file for ${entityType.toLowerCase()}`,
  severity: AuditSeverity.LOW,
});

// Helper function to get client IP address
function getClientIP(req: Request): string {
  const forwarded = req.get('X-Forwarded-For');
  const realIP = req.get('X-Real-IP');
  const clientIP = req.get('X-Client-IP');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || clientIP || req.socket.remoteAddress || 'unknown';
}

// Helper function to sanitize sensitive data
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}

// Async audit logging to avoid blocking request
async function logAuditAsync(
  req: AuthenticatedRequest,
  options: AuditOptions,
  requestData: any,
  responseData: any,
  statusCode: number
) {
  try {
    if (!req.auditContext) return;

    const entityId = options.getEntityId ? options.getEntityId(req) : 'unknown';
    const description = options.getDescription ? options.getDescription(req) : `${options.action} operation on ${options.entityType}`;
    
    const metadata = {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      requestData: requestData || null,
      responseData: responseData || null,
      query: req.query || null,
      params: req.params || null,
    };

    await AuditService.logAudit(
      req.auditContext,
      options.entityType,
      Array.isArray(entityId) ? entityId[0] : entityId,
      options.action,
      options.module,
      description,
      requestData,
      responseData,
      metadata,
      options.severity
    );
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to avoid breaking the request
  }
}

// Error handling middleware for audit failures
export const auditErrorHandler = (error: any, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Log the error as an audit event
  if (req.auditContext && error) {
    logAuditAsync(
      req,
      {
        entityType: 'System',
        action: AuditAction.FAILED_LOGIN, // Using failed login as generic error action
        module: 'System',
        getEntityId: () => 'error',
        getDescription: () => `System error: ${error.message || 'Unknown error'}`,
        severity: AuditSeverity.HIGH,
      },
      null,
      null,
      500
    ).catch(console.error);
  }

  next(error);
};

// General audit middleware for new routes
export interface AuditMiddlewareOptions {
  entityType: string;
  module: string;
  getEntityId?: (req: Request, result?: any) => string;
  severity?: AuditSeverity;
  description?: string;
}

export const auditMiddleware = (options: AuditMiddlewareOptions) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Set up audit context if not already set
    if (!req.auditContext) {
      setupAuditContext(req, res, () => {});
    }

    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseData: any = null;

    // Override response methods to capture response data and log audit
    res.send = function(data: any) {
      responseData = data;
      logAuditForRoute(req, options, responseData, res.statusCode);
      return originalSend.call(this, data);
    };

    res.json = function(data: any) {
      responseData = data;
      logAuditForRoute(req, options, responseData, res.statusCode);
      return originalJson.call(this, data);
    };

    next();
  };
};

// Helper function to log audit for route operations
function logAuditForRoute(
  req: AuthenticatedRequest,
  options: AuditMiddlewareOptions,
  responseData: any,
  statusCode: number
) {
  if (!req.auditContext) return;

  try {
    const entityId = options.getEntityId ? options.getEntityId(req, responseData) : 'unknown';
    const action = getActionFromMethod(req.method);
    const description = options.description || `${req.method} operation on ${options.entityType}`;
    
    const metadata = {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      query: req.query || null,
      params: req.params || null,
    };

    // Log audit asynchronously
    setImmediate(() => {
      AuditService.logAudit(
        req.auditContext!,
        options.entityType,
        entityId,
        action,
        options.module,
        description,
        req.body || null,
        responseData,
        metadata,
        options.severity || AuditSeverity.LOW
      ).catch(console.error);
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

// Helper function to determine action from HTTP method
function getActionFromMethod(method: string): AuditAction {
  switch (method.toUpperCase()) {
    case 'POST':
      return AuditAction.CREATE;
    case 'PATCH':
    case 'PUT':
      return AuditAction.UPDATE;
    case 'DELETE':
      return AuditAction.DELETE;
    default:
      return AuditAction.CREATE; // Default to CREATE
  }
}
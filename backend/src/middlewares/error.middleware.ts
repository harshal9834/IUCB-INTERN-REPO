import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { ZodError } from "zod";
import AuditService from "../services/audit.service.js";
import { AuditAction, AuditSeverity } from "@prisma/client";
import { AuthenticatedRequest } from "./audit.middleware.js";

export const errorHandler = (err: any, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.error("Global Error Handler Caught:", err);

  // Async error audit logging (non-blocking)
  if (req.auditContext) {
    setImmediate(async () => {
      try {
        let severity: AuditSeverity = AuditSeverity.LOW;
        let description = 'System error occurred';

        // Determine error severity and description
        if (err instanceof ApiError) {
          if (err.statusCode >= 500) {
            severity = AuditSeverity.HIGH;
            description = `Server error: ${err.message}`;
          } else if (err.statusCode >= 400) {
            severity = AuditSeverity.MEDIUM;
            description = `Client error: ${err.message}`;
          }
        } else if (err instanceof ZodError) {
          severity = AuditSeverity.LOW;
          description = `Validation error: ${err.issues.length} field(s) invalid`;
        } else {
          severity = AuditSeverity.CRITICAL;
          description = `Unexpected error: ${err.message || 'Unknown error'}`;
        }

        if (req.auditContext) {
          await AuditService.logAudit(
            req.auditContext,
          'SYSTEM',
          'error',
          AuditAction.FAILED_LOGIN, // Using as generic error action
          'System',
          description,
          undefined,
          {
            errorType: err.constructor.name,
            statusCode: err.statusCode || 500,
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            body: req.body,
            query: req.query,
            params: req.params,
          },
          {
            errorId: Date.now().toString(),
            timestamp: new Date().toISOString(),
          },
          severity
        );
        }
      } catch (auditError) {
        console.error('Failed to log error to audit system:', auditError);
      }
    });
  }

  // Handle different error types
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ 
      success: false, 
      message: err.message, 
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack 
    });
  }
  
  if (err instanceof ZodError) {
    return res.status(400).json({ 
      success: false, 
      message: "Validation Error", 
      errors: err.issues, 
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack 
    });
  }
  
  return res.status(500).json({ 
    success: false, 
    message: err.message || "Internal Server Error", 
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack 
  });
};
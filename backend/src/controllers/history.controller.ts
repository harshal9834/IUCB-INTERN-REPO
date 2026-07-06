import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { HistoryService } from "../services/history.service.js";

export class HistoryController {
  private historyService: HistoryService;

  constructor() {
    this.historyService = new HistoryService();
    this.getEntityHistory = this.getEntityHistory.bind(this);
    this.getEntityVersion = this.getEntityVersion.bind(this);
    this.compareVersions = this.compareVersions.bind(this);
    this.getAuditTrail = this.getAuditTrail.bind(this);
    this.getAdminActivity = this.getAdminActivity.bind(this);
    this.getEntityStats = this.getEntityStats.bind(this);
  }

  /**
   * GET /api/v1/history/entity/:entityType/:entityId
   * Get complete history for an entity
   */
  getEntityHistory = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { entityType, entityId } = req.params as { entityType: string; entityId: string };
    const { page = "1", limit = "50" } = req.query;

    const history = await this.historyService.getEntityHistory(
      entityType,
      entityId,
      parseInt(limit as string),
      parseInt(page as string)
    );

    res.json(
      new ApiResponse(200, history, "Entity history retrieved successfully")
    );
  });

  /**
   * GET /api/v1/history/entity/:entityType/:entityId/version/:version
   * Get specific version of an entity
   */
  getEntityVersion = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { entityType, entityId, version } = req.params as { entityType: string; entityId: string; version: string };

    const versionData = await this.historyService.getEntityVersion(
      entityType,
      entityId,
      parseInt(version)
    );

    if (!versionData) {
      throw new ApiError(404, `Version ${version} not found`);
    }

    res.json(
      new ApiResponse(200, versionData, "Entity version retrieved successfully")
    );
  });

  /**
   * GET /api/v1/history/compare/:entityType/:entityId
   * Compare two versions of an entity
   */
  compareVersions = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { entityType, entityId } = req.params as { entityType: string; entityId: string };
    const { from, to } = req.query;

    if (!from || !to) {
      throw new ApiError(400, "Both 'from' and 'to' version numbers are required");
    }

    const comparison = await this.historyService.compareVersions(
      entityType,
      entityId,
      parseInt(from as string),
      parseInt(to as string)
    );

    res.json(
      new ApiResponse(200, comparison, "Version comparison retrieved successfully")
    );
  });

  /**
   * GET /api/v1/history/audit-trail
   * Get audit trail with filters
   */
  getAuditTrail = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const {
      entityType,
      entityId,
      action,
      changedBy,
      dateFrom,
      dateTo,
      page = "1",
      limit = "50"
    } = req.query;

    const trail = await this.historyService.getAuditTrail({
      entityType: entityType as string,
      entityId: entityId as string,
      action: action as string,
      changedBy: changedBy as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json(
      new ApiResponse(200, trail, "Audit trail retrieved successfully")
    );
  });

  /**
   * GET /api/v1/history/admin/:adminId/activity
   * Get all activities by a specific admin
   */
  getAdminActivity = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { adminId } = req.params as { adminId: string };
    const { page = "1", limit = "100" } = req.query;

    const activity = await this.historyService.getAdminActivity(
      adminId,
      parseInt(limit as string),
      parseInt(page as string)
    );

    res.json(
      new ApiResponse(200, activity, "Admin activity retrieved successfully")
    );
  });

  /**
   * GET /api/v1/history/stats/:entityType
   * Get statistics for an entity type
   */
  getEntityStats = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { entityType } = req.params as { entityType: string };

    const stats = await this.historyService.getEntityTypeStats(entityType);

    res.json(
      new ApiResponse(200, stats, "Entity type statistics retrieved successfully")
    );
  });
}
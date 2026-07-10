import { Router } from "express";
import { param, query, validationResult } from "express-validator";
import { HistoryController } from "../controllers/history.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
const historyController = new HistoryController();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route GET /api/v1/history/entity/:entityType/:entityId
 * @desc Get complete history for an entity
 * @access Private (Authenticated users)
 */
router.get(
  "/entity/:entityType/:entityId",
  param("entityType").isString().notEmpty().withMessage("Entity type is required"),
  param("entityId").isUUID().withMessage("Entity ID must be a valid UUID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  historyController.getEntityHistory
);

/**
 * @route GET /api/v1/history/entity/:entityType/:entityId/version/:version
 * @desc Get specific version of an entity
 * @access Private (Authenticated users)
 */
router.get(
  "/entity/:entityType/:entityId/version/:version",
  param("entityType").isString().notEmpty().withMessage("Entity type is required"),
  param("entityId").isUUID().withMessage("Entity ID must be a valid UUID"),
  param("version").isInt({ min: 1 }).withMessage("Version must be a positive integer"),
  historyController.getEntityVersion
);

/**
 * @route GET /api/v1/history/compare/:entityType/:entityId
 * @desc Compare two versions of an entity
 * @access Private (Authenticated users)
 */
router.get(
  "/compare/:entityType/:entityId",
  param("entityType").isString().notEmpty().withMessage("Entity type is required"),
  param("entityId").isUUID().withMessage("Entity ID must be a valid UUID"),
  query("from").isInt({ min: 1 }).withMessage("From version must be a positive integer"),
  query("to").isInt({ min: 1 }).withMessage("To version must be a positive integer"),
  historyController.compareVersions
);

/**
 * @route GET /api/v1/history/audit-trail
 * @desc Get audit trail with optional filters
 * @access Private (Authenticated users)
 */
router.get(
  "/audit-trail",
  query("entityType").optional().isString().withMessage("Entity type must be a string"),
  query("entityId").optional().isUUID().withMessage("Entity ID must be a valid UUID"),
  query("action").optional().isIn(["CREATE", "UPDATE", "DELETE"]).withMessage("Action must be CREATE, UPDATE, or DELETE"),
  query("changedBy").optional().isUUID().withMessage("Changed by must be a valid UUID"),
  query("dateFrom").optional().isISO8601().toDate().withMessage("Date from must be a valid ISO 8601 date"),
  query("dateTo").optional().isISO8601().toDate().withMessage("Date to must be a valid ISO 8601 date"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  historyController.getAuditTrail
);

/**
 * @route GET /api/v1/history/admin/:adminId/activity
 * @desc Get all activities by a specific admin
 * @access Private (Authenticated users)
 */
router.get(
  "/admin/:adminId/activity",
  param("adminId").isUUID().withMessage("Admin ID must be a valid UUID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  historyController.getAdminActivity
);

/**
 * @route GET /api/v1/history/stats/:entityType
 * @desc Get statistics for an entity type
 * @access Private (Authenticated users)
 */
router.get(
  "/stats/:entityType",
  param("entityType").isString().notEmpty().withMessage("Entity type is required"),
  historyController.getEntityStats
);

export default router;
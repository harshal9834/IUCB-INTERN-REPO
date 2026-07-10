import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/audit.middleware.js';
import AdvancedSearchService, { AdvancedSearchFilters } from '../services/advanced-search.service.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AuditAction, AuditSeverity, AdminRole } from '@prisma/client';
import { body, query, param, validationResult } from 'express-validator';

export class AdvancedSearchController {

  /**
   * Perform advanced search with complex filtering
   * POST /api/v1/search/advanced
   */
  advancedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const filters: AdvancedSearchFilters = {
      // Time filters
      dateFrom: req.body.dateFrom ? new Date(req.body.dateFrom) : undefined,
      dateTo: req.body.dateTo ? new Date(req.body.dateTo) : undefined,
      timeRange: req.body.timeRange,

      // Entity filters
      entityTypes: req.body.entityTypes,
      entityIds: req.body.entityIds,

      // Actor filters
      actorIds: req.body.actorIds,
      actorNames: req.body.actorNames,
      actorRoles: req.body.actorRoles,

      // Action filters
      actions: req.body.actions,
      modules: req.body.modules,
      severities: req.body.severities,

      // Risk filters
      riskScoreMin: req.body.riskScoreMin,
      riskScoreMax: req.body.riskScoreMax,
      suspiciousActivitiesOnly: req.body.suspiciousActivitiesOnly,

      // Location filters
      ipAddresses: req.body.ipAddresses,
      countries: req.body.countries,
      devices: req.body.devices,
      browsers: req.body.browsers,

      // Search filters
      searchQuery: req.body.searchQuery,
      searchFields: req.body.searchFields,

      // Pagination
      page: req.body.page || 1,
      limit: req.body.limit || 20,
      sortBy: req.body.sortBy || 'createdAt',
      sortOrder: req.body.sortOrder || 'desc',

      // Export options
      includeMetadata: req.body.includeMetadata,
      exportFormat: req.body.exportFormat
    };

    const results = await AdvancedSearchService.search(filters);

    res.json(new ApiResponse(200, results, 'Advanced search completed successfully'));
  });

  /**
   * Quick search with simple query
   * GET /api/v1/search/quick
   */
  quickSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q, limit = 10 } = req.query;

    if (!q) {
      throw new ApiError(400, 'Search query is required');
    }

    const filters: AdvancedSearchFilters = {
      searchQuery: String(q),
      limit: Math.min(Number(limit), 50), // Cap at 50 for quick search
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    const results = await AdvancedSearchService.search(filters);

    res.json(new ApiResponse(200, {
      logs: results.logs,
      totalCount: results.totalCount,
      searchExecutionTime: results.searchExecutionTime
    }, 'Quick search completed'));
  });

  /**
   * Save search configuration
   * POST /api/v1/search/save
   */
  saveSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const { name, description, filters, isPublic = false, tags = [] } = req.body;
    const createdBy = req.admin!.id;

    const savedSearch = await AdvancedSearchService.saveSearch(
      name,
      filters,
      createdBy,
      description,
      isPublic,
      tags
    );

    res.status(201).json(new ApiResponse(201, savedSearch, 'Search saved successfully'));
  });

  /**
   * Get saved searches
   * GET /api/v1/search/saved
   */
  getSavedSearches = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { includePublic = 'true' } = req.query;
    const userId = req.admin!.id;

    const savedSearches = await AdvancedSearchService.getSavedSearches(
      userId,
      includePublic === 'true'
    );

    res.json(new ApiResponse(200, savedSearches, 'Saved searches retrieved successfully'));
  });

  /**
   * Execute saved search
   * GET /api/v1/search/saved/:id/execute
   */
  executeSavedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.admin!.id;
    const searchId = Array.isArray(id) ? id[0] : id;

    const results = await AdvancedSearchService.executeSavedSearch(searchId, userId);

    res.json(new ApiResponse(200, results, 'Saved search executed successfully'));
  });

  /**
   * Delete saved search
   * DELETE /api/v1/search/saved/:id
   */
  deleteSavedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    let id = req.params.id;
    if (Array.isArray(id)) {
      id = id[0];
    }
    const userId = req.admin!.id;

    // Check ownership or admin privileges
    const savedSearch = await AdvancedSearchService.getSavedSearches(userId, false);
    const userOwnsSearch = savedSearch.some(s => s.id === id);
    
    if (!userOwnsSearch && req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. You can only delete your own searches.');
    }

    // Perform deletion (assuming we add this method to the service)
    await this.deleteSearchById(id);

    res.json(new ApiResponse(200, null, 'Search deleted successfully'));
  });

  /**
   * Get search analytics and statistics
   * GET /api/v1/search/analytics
   */
  getSearchAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const adminId = req.admin!.id;
    
    const analytics = await AdvancedSearchService.getSearchAnalytics(adminId);

    res.json(new ApiResponse(200, analytics, 'Search analytics retrieved successfully'));
  });

  /**
   * Get search suggestions based on partial query
   * GET /api/v1/search/suggestions
   */
  getSearchSuggestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q } = req.query;

    if (!q || String(q).length < 2) {
      res.json(new ApiResponse(200, [], 'Query too short for suggestions'));
      return;
    }

    // Use the internal method from AdvancedSearchService
    const suggestions = await (AdvancedSearchService as any).generateSearchSuggestions(String(q));

    res.json(new ApiResponse(200, suggestions, 'Search suggestions retrieved'));
  });

  /**
   * Export search results
   * POST /api/v1/search/export
   */
  exportSearchResults = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { filters, format = 'json' } = req.body;
    
    if (!['json', 'csv', 'xlsx'].includes(format)) {
      throw new ApiError(400, 'Invalid export format. Supported formats: json, csv, xlsx');
    }

    // Override pagination for export (get all results)
    const exportFilters: AdvancedSearchFilters = {
      ...filters,
      page: 1,
      limit: 10000, // Large limit for export
      exportFormat: format,
      includeMetadata: true
    };

    const results = await AdvancedSearchService.search(exportFilters);

    // Set appropriate content type and filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit-search-export-${timestamp}.${format}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.json({
        exportDate: new Date(),
        totalRecords: results.totalCount,
        searchExecutionTime: results.searchExecutionTime,
        data: results.logs,
        facets: results.facets
      });
    } else {
      // For CSV/XLSX, we'd implement conversion logic here
      // For now, return JSON format
      res.setHeader('Content-Type', 'application/json');
      res.json(new ApiResponse(200, results, `Export prepared in ${format} format`));
    }
  });

  /**
   * Get search facets for current filters
   * POST /api/v1/search/facets
   */
  getSearchFacets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const filters: AdvancedSearchFilters = req.body;
    
    // Run a search with limit 0 to get only facets
    const results = await AdvancedSearchService.search({
      ...filters,
      limit: 0
    });

    res.json(new ApiResponse(200, {
      facets: results.facets,
      totalCount: results.totalCount
    }, 'Search facets retrieved successfully'));
  });

  /**
   * Helper method to delete a search by ID
   */
  private async deleteSearchById(id: string): Promise<void> {
    try {
      await (AdvancedSearchService as any).db.savedSearch.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting search:', error);
      throw new ApiError(500, 'Failed to delete saved search');
    }
  }
}

// Validation schemas
export const advancedSearchValidation = [
  body('dateFrom').optional().isISO8601().toDate(),
  body('dateTo').optional().isISO8601().toDate(),
  body('timeRange').optional().isIn(['last_hour', 'last_24h', 'last_week', 'last_month', 'last_year', 'custom']),
  body('entityTypes').optional().isArray(),
  body('entityIds').optional().isArray(),
  body('actorIds').optional().isArray(),
  body('actorNames').optional().isArray(),
  body('actorRoles').optional().isArray(),
  body('actions').optional().isArray(),
  body('modules').optional().isArray(),
  body('severities').optional().isArray(),
  body('riskScoreMin').optional().isInt({ min: 0, max: 10 }),
  body('riskScoreMax').optional().isInt({ min: 0, max: 10 }),
  body('suspiciousActivitiesOnly').optional().isBoolean(),
  body('searchQuery').optional().isString().trim(),
  body('page').optional().isInt({ min: 1 }),
  body('limit').optional().isInt({ min: 1, max: 100 }),
  body('sortBy').optional().isString(),
  body('sortOrder').optional().isIn(['asc', 'desc'])
];

export const saveSearchValidation = [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('filters').notEmpty().isObject(),
  body('isPublic').optional().isBoolean(),
  body('tags').optional().isArray()
];

export const searchIdValidation = [
  param('id').notEmpty().isUUID()
];

export default new AdvancedSearchController();
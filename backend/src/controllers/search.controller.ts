import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { SearchService, SearchQuery } from "../services/search.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
    this.search = this.search.bind(this);
    this.advancedSearch = this.advancedSearch.bind(this);
    this.saveSearch = this.saveSearch.bind(this);
    this.getSavedSearches = this.getSavedSearches.bind(this);
    this.executeSavedSearch = this.executeSavedSearch.bind(this);
    this.deleteSavedSearch = this.deleteSavedSearch.bind(this);
    this.updateSavedSearch = this.updateSavedSearch.bind(this);
    this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
  }

  /**
   * POST /api/v1/search
   * Search entity history with full-text search
   */
  search = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { text, entityType, entityId, action, changedBy, dateFrom, dateTo, limit, page } = req.body;

    if (!text) {
      throw new ApiError(400, "Search text is required");
    }

    const searchQuery: SearchQuery = {
      text,
      entityType,
      entityId,
      action,
      changedBy,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: Math.min(limit || 50, 100),
      page: Math.max(page || 1, 1)
    };

    const results = await this.searchService.searchEntityHistory(searchQuery);

    res.json(
      new ApiResponse(200, results, "Search results retrieved successfully")
    );
  });

  /**
   * POST /api/v1/search/advanced
   * Advanced search with field-level filtering
   */
  advancedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { entityType, filters, limit = 50, page = 1 } = req.body;

    if (!entityType) {
      throw new ApiError(400, "Entity type is required");
    }

    const results = await this.searchService.advancedSearch(
      entityType,
      filters || {},
      Math.min(limit, 100),
      Math.max(page, 1)
    );

    res.json(
      new ApiResponse(200, results, "Advanced search completed successfully")
    );
  });

  /**
   * POST /api/v1/search/save
   * Save a search query
   */
  saveSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { name, description, query } = req.body;

    if (!name || !query) {
      throw new ApiError(400, "Name and query are required");
    }

    if (!req.admin) {
      throw new ApiError(401, "Not authenticated");
    }

    const saved = await this.searchService.saveSearch(
      name,
      query,
      req.admin.id,
      description
    );

    res.json(
      new ApiResponse(201, saved, "Search saved successfully")
    );
  });

  /**
   * GET /api/v1/search/saved
   * Get saved searches for the authenticated admin
   */
  getSavedSearches = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    if (!req.admin) {
      throw new ApiError(401, "Not authenticated");
    }

    const { limit = 20, page = 1 } = req.query;

    const searches = await this.searchService.getSavedSearches(
      req.admin.id,
      Math.min(parseInt(limit as string) || 20, 100),
      Math.max(parseInt(page as string) || 1, 1)
    );

    res.json(
      new ApiResponse(200, searches, "Saved searches retrieved successfully")
    );
  });

  /**
   * POST /api/v1/search/saved/:searchId/execute
   * Execute a saved search
   */
  executeSavedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { searchId } = req.params as { searchId: string };

    const results = await this.searchService.executeSavedSearch(searchId);

    res.json(
      new ApiResponse(200, results, "Saved search executed successfully")
    );
  });

  /**
   * DELETE /api/v1/search/saved/:searchId
   * Delete a saved search
   */
  deleteSavedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    if (!req.admin) {
      throw new ApiError(401, "Not authenticated");
    }

    const { searchId } = req.params as { searchId: string };

    await this.searchService.deleteSavedSearch(searchId, req.admin.id);

    res.json(
      new ApiResponse(200, null, "Saved search deleted successfully")
    );
  });

  /**
   * PATCH /api/v1/search/saved/:searchId
   * Update a saved search
   */
  updateSavedSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    if (!req.admin) {
      throw new ApiError(401, "Not authenticated");
    }

    const { searchId } = req.params as { searchId: string };
    const { name, description, query } = req.body;

    const updated = await this.searchService.updateSavedSearch(
      searchId,
      req.admin.id,
      { name, description, query }
    );

    res.json(
      new ApiResponse(200, updated, "Saved search updated successfully")
    );
  });

  /**
   * GET /api/v1/search/suggestions
   * Get search suggestions based on partial text
   */
  getSearchSuggestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { text, entityType, limit = 10 } = req.query;

    if (!text) {
      throw new ApiError(400, "Search text is required");
    }

    const suggestions = await this.searchService.getSearchSuggestions(
      text as string,
      entityType as string,
      Math.min(parseInt(limit as string) || 10, 50)
    );

    res.json(
      new ApiResponse(200, suggestions, "Search suggestions retrieved successfully")
    );
  });
}

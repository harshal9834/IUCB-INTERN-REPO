import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const searchController = new SearchController();
const router = Router();

// Apply authentication to all search routes
router.use(protect);

/**
 * POST /api/v1/search
 * Search entity history with full-text search
 */
router.post("/", searchController.search);

/**
 * POST /api/v1/search/advanced
 * Advanced search with field-level filtering
 */
router.post("/advanced", searchController.advancedSearch);

/**
 * GET /api/v1/search/suggestions
 * Get search suggestions based on partial text
 */
router.get("/suggestions", searchController.getSearchSuggestions);

/**
 * POST /api/v1/search/save
 * Save a search query
 */
router.post("/save", searchController.saveSearch);

/**
 * GET /api/v1/search/saved
 * Get saved searches for the authenticated admin
 */
router.get("/saved", searchController.getSavedSearches);

/**
 * POST /api/v1/search/saved/:searchId/execute
 * Execute a saved search
 */
router.post("/saved/:searchId/execute", searchController.executeSavedSearch);

/**
 * PATCH /api/v1/search/saved/:searchId
 * Update a saved search
 */
router.patch("/saved/:searchId", searchController.updateSavedSearch);

/**
 * DELETE /api/v1/search/saved/:searchId
 * Delete a saved search
 */
router.delete("/saved/:searchId", searchController.deleteSavedSearch);

export default router;

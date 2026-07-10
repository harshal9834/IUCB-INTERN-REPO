import { Router } from 'express';
import AdvancedSearchController, { 
  advancedSearchValidation, 
  saveSearchValidation,
  searchIdValidation 
} from '../controllers/advanced-search.controller.js';
import { protect as authenticateAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// Advanced search endpoint
router.post(
  '/advanced', 
  advancedSearchValidation,
  auditMiddleware({
    entityType: 'SEARCH',
    module: 'ADVANCED_SEARCH',
    getEntityId: () => 'advanced-search-query',
    severity: 'LOW',
    description: 'Performed advanced audit search'
  }),
  AdvancedSearchController.advancedSearch
);

// Quick search endpoint
router.get(
  '/quick', 
  auditMiddleware({
    entityType: 'SEARCH',
    module: 'QUICK_SEARCH',
    getEntityId: (req) => `quick-search-${Date.now()}`,
    severity: 'LOW',
    description: 'Performed quick audit search'
  }),
  AdvancedSearchController.quickSearch
);

// Search suggestions
router.get('/suggestions', AdvancedSearchController.getSearchSuggestions);

// Search facets
router.post(
  '/facets', 
  auditMiddleware({
    entityType: 'SEARCH',
    module: 'SEARCH_FACETS',
    getEntityId: () => 'search-facets',
    severity: 'LOW',
    description: 'Retrieved search facets'
  }),
  AdvancedSearchController.getSearchFacets
);

// Export search results
router.post(
  '/export', 
  auditMiddleware({
    entityType: 'EXPORT',
    module: 'SEARCH_EXPORT',
    getEntityId: () => `search-export-${Date.now()}`,
    severity: 'MEDIUM',
    description: 'Exported search results'
  }),
  AdvancedSearchController.exportSearchResults
);

// Saved searches management
router.post(
  '/save', 
  saveSearchValidation,
  auditMiddleware({
    entityType: 'SAVED_SEARCH',
    module: 'SAVED_SEARCH',
    getEntityId: (req, result) => result?.id || 'new-saved-search',
    severity: 'LOW',
    description: 'Saved search configuration'
  }),
  AdvancedSearchController.saveSearch
);

router.get('/saved', AdvancedSearchController.getSavedSearches);

router.get(
  '/saved/:id/execute', 
  searchIdValidation,
  auditMiddleware({
    entityType: 'SAVED_SEARCH',
    module: 'SAVED_SEARCH',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'LOW',
    description: 'Executed saved search'
  }),
  AdvancedSearchController.executeSavedSearch
);

router.delete(
  '/saved/:id', 
  searchIdValidation,
  auditMiddleware({
    entityType: 'SAVED_SEARCH',
    module: 'SAVED_SEARCH',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Deleted saved search'
  }),
  AdvancedSearchController.deleteSavedSearch
);

// Search analytics
router.get(
  '/analytics', 
  auditMiddleware({
    entityType: 'ANALYTICS',
    module: 'SEARCH_ANALYTICS',
    getEntityId: () => 'search-analytics',
    severity: 'LOW',
    description: 'Viewed search analytics'
  }),
  AdvancedSearchController.getSearchAnalytics
);

export default router;
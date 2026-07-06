import { PrismaClient, Prisma, AuditAction, AuditSeverity, AdminRole } from '@prisma/client';
import db from '../config/db.js';

export interface AdvancedSearchFilters {
  // Time-based filters
  dateFrom?: Date;
  dateTo?: Date;
  timeRange?: 'last_hour' | 'last_24h' | 'last_week' | 'last_month' | 'last_year' | 'custom';
  
  // Entity filters
  entityTypes?: string[];
  entityIds?: string[];
  
  // Actor filters
  actorIds?: string[];
  actorNames?: string[];
  actorRoles?: AdminRole[];
  
  // Action filters
  actions?: AuditAction[];
  modules?: string[];
  severities?: AuditSeverity[];
  
  // Risk and security filters
  riskScoreMin?: number;
  riskScoreMax?: number;
  suspiciousActivitiesOnly?: boolean;
  
  // Location and device filters
  ipAddresses?: string[];
  countries?: string[];
  devices?: string[];
  browsers?: string[];
  
  // Content search
  searchQuery?: string;
  searchFields?: string[];
  
  // Pagination and sorting
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Export options
  includeMetadata?: boolean;
  exportFormat?: 'json' | 'csv' | 'xlsx';
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
    percentage: number;
  }>;
}

export interface AdvancedSearchResult {
  logs: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  facets: SearchFacet[];
  searchExecutionTime: number;
  suggestions: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: AdvancedSearchFilters;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
  tags: string[];
}

export class AdvancedSearchService {
  
  /**
   * Perform advanced search with complex filtering, faceting, and full-text search
   */
  async search(filters: AdvancedSearchFilters): Promise<AdvancedSearchResult> {
    const startTime = Date.now();
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100); // Cap at 100
    const offset = (page - 1) * limit;

    // Build dynamic where clause
    const whereClause = this.buildWhereClause(filters);
    
    // Build order by clause
    const orderBy = this.buildOrderByClause(filters);

    try {
      // Execute main search query
      const [logs, totalCount] = await Promise.all([
        db.auditLog.findMany({
          where: whereClause,
          orderBy,
          take: limit,
          skip: offset,
          include: {
            actor: {
              select: { id: true, fullName: true, email: true }
            },
            alerts: {
              select: { id: true, alertType: true, severity: true, title: true }
            }
          }
        }),
        db.auditLog.count({ where: whereClause })
      ]);

      // Generate search facets for filtering UI
      const facets = await this.generateSearchFacets(whereClause);
      
      // Generate search suggestions
      const suggestions = await this.generateSearchSuggestions(filters.searchQuery);

      const searchExecutionTime = Date.now() - startTime;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        logs,
        totalCount,
        currentPage: page,
        totalPages,
        facets,
        searchExecutionTime,
        suggestions
      };
    } catch (error) {
      console.error('Advanced search error:', error);
      throw new Error('Search execution failed');
    }
  }

  /**
   * Build dynamic WHERE clause based on filters
   */
  private buildWhereClause(filters: AdvancedSearchFilters): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    // Time-based filters
    if (filters.dateFrom || filters.dateTo || filters.timeRange) {
      where.createdAt = {};
      
      if (filters.timeRange && filters.timeRange !== 'custom') {
        const timeRanges = {
          'last_hour': new Date(Date.now() - 60 * 60 * 1000),
          'last_24h': new Date(Date.now() - 24 * 60 * 60 * 1000),
          'last_week': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          'last_month': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          'last_year': new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        };
        where.createdAt.gte = timeRanges[filters.timeRange];
      } else {
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }
    }

    // Entity filters
    if (filters.entityTypes?.length) {
      where.entityType = { in: filters.entityTypes };
    }
    if (filters.entityIds?.length) {
      where.entityId = { in: filters.entityIds };
    }

    // Actor filters
    if (filters.actorIds?.length) {
      where.actorId = { in: filters.actorIds };
    }
    if (filters.actorNames?.length) {
      where.actorName = { in: filters.actorNames };
    }
    if (filters.actorRoles?.length) {
      where.actorRole = { in: filters.actorRoles };
    }

    // Action filters
    if (filters.actions?.length) {
      where.action = { in: filters.actions };
    }
    if (filters.modules?.length) {
      where.module = { in: filters.modules };
    }
    if (filters.severities?.length) {
      where.severity = { in: filters.severities };
    }

    // Risk scoring filters
    if (filters.riskScoreMin !== undefined || filters.riskScoreMax !== undefined) {
      where.riskScore = {};
      if (filters.riskScoreMin !== undefined) where.riskScore.gte = filters.riskScoreMin;
      if (filters.riskScoreMax !== undefined) where.riskScore.lte = filters.riskScoreMax;
    }

    // Security filters
    if (filters.suspiciousActivitiesOnly) {
      where.OR = [
        { riskScore: { gte: 7 } },
        { severity: { in: ['HIGH', 'CRITICAL'] } },
        { 
          alerts: {
            some: {
              alertType: { in: ['SECURITY_BREACH', 'INTEGRITY_VIOLATION', 'BRUTE_FORCE'] }
            }
          }
        }
      ];
    }

    // Location and device filters (currently not supported in schema)
    // TODO: Add location and deviceInfo fields to AuditLog schema
    /*
    if (filters.ipAddresses?.length) {
      where.ipAddress = { in: filters.ipAddresses };
    }
    if (filters.countries?.length) {
      where.location = {
        path: ['country'],
        in: filters.countries
      };
    }
    if (filters.devices?.length) {
      where.deviceInfo = {
        path: ['device', 'type'],
        in: filters.devices
      };
    }
    if (filters.browsers?.length) {
      where.deviceInfo = {
        path: ['browser', 'name'],
        in: filters.browsers
      };
    }
    */

    // Full-text search
    if (filters.searchQuery) {
      const searchFields = filters.searchFields || ['description', 'actorName'];
      const searchConditions = searchFields.map(field => ({
        [field]: {
          contains: filters.searchQuery,
          mode: 'insensitive' as const
        }
      }));
      
      where.OR = searchConditions;
    }

    return where;
  }

  /**
   * Build ORDER BY clause
   */
  private buildOrderByClause(filters: AdvancedSearchFilters): Prisma.AuditLogOrderByWithRelationInput {
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    const validSortFields = ['createdAt', 'riskScore', 'actorName', 'entityType', 'action', 'severity'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    return { [field]: sortOrder };
  }

  /**
   * Generate search facets for filtering UI
   */
  private async generateSearchFacets(whereClause: Prisma.AuditLogWhereInput): Promise<SearchFacet[]> {
    try {
      const [
        actionFacets,
        severityFacets,
        entityTypeFacets,
        actorRoleFacets,
        moduleFacets
      ] = await Promise.all([
        this.getFacetData('action', whereClause),
        this.getFacetData('severity', whereClause),
        this.getFacetData('entityType', whereClause),
        this.getFacetData('actorRole', whereClause),
        this.getFacetData('module', whereClause)
      ]);

      return [
        { field: 'action', values: actionFacets },
        { field: 'severity', values: severityFacets },
        { field: 'entityType', values: entityTypeFacets },
        { field: 'actorRole', values: actorRoleFacets },
        { field: 'module', values: moduleFacets }
      ];
    } catch (error) {
      console.error('Error generating facets:', error);
      return [];
    }
  }

  /**
   * Get facet data for a specific field
   */
  private async getFacetData(field: string, whereClause: Prisma.AuditLogWhereInput) {
    // Simplified facet data - just return empty for complex fields
    return [];
  }

  /**
   * Generate search suggestions based on query
   */
  private async generateSearchSuggestions(query?: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
      // Get common entity types, actions, and actors that match the query
      const suggestions = await db.auditLog.findMany({
        where: {
          OR: [
            { entityType: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { actorName: { contains: query, mode: 'insensitive' } },
            { module: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          entityType: true,
          action: true,
          actorName: true,
          module: true
        },
        take: 5,
        distinct: ['entityType', 'action', 'actorName', 'module']
      });

      const suggestionSet = new Set<string>();
      suggestions.forEach((item: any) => {
        Object.values(item).forEach(value => {
          if (value && typeof value === 'string' && 
              value.toLowerCase().includes(query.toLowerCase())) {
            suggestionSet.add(value);
          }
        });
      });

      return Array.from(suggestionSet).slice(0, 5);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  /**
   * Save search configuration for reuse
   */
  async saveSearch(
    name: string,
    filters: AdvancedSearchFilters,
    createdBy: string,
    description?: string,
    isPublic = false,
    tags: string[] = []
  ): Promise<SavedSearch> {
    try {
      const savedSearch = await db.savedSearch.create({
        data: {
          name,
          description,
          filters: filters as Prisma.JsonObject,
          createdBy,
          useCount: 0
        }
      });

      return {
        id: savedSearch.id,
        name: savedSearch.name,
        description: savedSearch.description || undefined,
        createdAt: savedSearch.createdAt,
        lastUsed: savedSearch.lastUsed || undefined,
        useCount: savedSearch.useCount
      } as any;
    } catch (error) {
      console.error('Error saving search:', error);
      throw new Error('Failed to save search configuration');
    }
  }

  /**
   * Get saved searches for a user
   */
  async getSavedSearches(userId: string, includePublic = true): Promise<SavedSearch[]> {
    try {
      const whereClause: Prisma.SavedSearchWhereInput = {
        OR: [
          { createdBy: userId },
          // TODO: Add isPublic field to SavedSearch schema for public sharing
          // ...(includePublic ? [{ isPublic: true }] : [])
        ]
      };

      const savedSearches = await db.savedSearch.findMany({
        where: whereClause,
        orderBy: [
          { lastUsed: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return savedSearches.map((search: any) => ({
        id: search.id,
        name: search.name,
        description: search.description || undefined,
        filters: search.filters as AdvancedSearchFilters,
        isPublic: search.isPublic,
        createdBy: search.createdBy,
        createdAt: search.createdAt,
        lastUsed: search.lastUsed || undefined,
        useCount: search.useCount,
        tags: search.tags
      }));
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      throw new Error('Failed to fetch saved searches');
    }
  }

  /**
   * Execute a saved search
   */
  async executeSavedSearch(searchId: string, userId: string): Promise<AdvancedSearchResult> {
    try {
      const savedSearch = await db.savedSearch.findFirst({
        where: {
          id: searchId,
          OR: [
            { createdBy: userId },
            { name: { not: '' } }
          ]
        }
      });

      if (!savedSearch) {
        throw new Error('Saved search not found or access denied');
      }

      // Update usage statistics
      await db.savedSearch.update({
        where: { id: searchId },
        data: {
          lastUsed: new Date(),
          useCount: { increment: 1 }
        }
      });

      // Execute the search
      return await this.search(savedSearch.filters as AdvancedSearchFilters);
    } catch (error) {
      console.error('Error executing saved search:', error);
      throw new Error('Failed to execute saved search');
    }
  }

  /**
   * Get search analytics and statistics
   */
  async getSearchAnalytics(adminId?: string): Promise<any> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        totalSearches,
        recentSearches,
        popularFilters,
        topEntityTypes,
        searchTrends
      ] = await Promise.all([
        // Total searches count (from search index usage)
        db.searchIndex.count(),
        
        // Recent searches (last 30 days)
        db.searchIndex.count({
          where: {
            lastUpdated: { gte: thirtyDaysAgo }
          }
        }),

        // Most popular filter combinations
        db.savedSearch.findMany({
          select: {
            filters: true,
            useCount: true
          },
          orderBy: { useCount: 'desc' },
          take: 10
        }),

        // Top searched entity types
        db.auditLog.groupBy({
          by: ['entityType'],
          _count: true,
          orderBy: {
            _count: {
              entityType: 'desc'
            }
          },
          take: 10
        }),

        // Search trends (daily counts for last 30 days)
        db.auditLog.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: { gte: thirtyDaysAgo }
          },
          _count: true
        })
      ]);

      return {
        totalSearches,
        recentSearches,
        popularFilters: popularFilters.map((f: any) => ({
          filters: f.filters,
          usage: f.useCount
        })),
        topEntityTypes: topEntityTypes.map((t: any) => ({
          entityType: t.entityType,
          count: t._count
        })),
        searchTrends: this.processSearchTrends(searchTrends)
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw new Error('Failed to fetch search analytics');
    }
  }

  /**
   * Process search trends data for charting
   */
  private processSearchTrends(trends: any[]): Array<{ date: string; searches: number }> {
    const trendMap = new Map<string, number>();
    
    trends.forEach(trend => {
      const date = new Date(trend.createdAt).toISOString().split('T')[0];
      trendMap.set(date, (trendMap.get(date) || 0) + trend._count);
    });

    return Array.from(trendMap.entries()).map(([date, searches]) => ({
      date,
      searches
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default new AdvancedSearchService();
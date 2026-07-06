import prisma from "../config/db.js";
import { Logger } from "../utils/Logger.js";

export interface SearchQuery {
  text: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  changedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  fields?: string[];
  limit?: number;
  page?: number;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changeTimestamp: Date;
  changedBy: string | null;
  description: string | null;
  relevanceScore: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: SearchQuery;
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export class SearchService {
  /**
   * Search entity history with full-text search
   */
  async searchEntityHistory(searchQuery: SearchQuery): Promise<SearchResult[]> {
    try {
      const {
        text,
        entityType,
        entityId,
        action,
        changedBy,
        dateFrom,
        dateTo,
        limit = 50,
        page = 1
      } = searchQuery;

      // Build where clause
      const where: any = {};

      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;
      if (action) where.action = action;
      if (changedBy) where.changedBy = changedBy;

      if (dateFrom || dateTo) {
        where.changeTimestamp = {};
        if (dateFrom) where.changeTimestamp.gte = dateFrom;
        if (dateTo) where.changeTimestamp.lte = dateTo;
      }

      // Text search in description and other fields
      if (text) {
        where.OR = [
          { description: { contains: text, mode: "insensitive" } },
          { entityId: { contains: text, mode: "insensitive" } },
          { changedBy: { contains: text, mode: "insensitive" } }
        ];
      }

      const skip = (page - 1) * limit;

      const results = await prisma.entityHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { changeTimestamp: "desc" }
      });

      // Calculate relevance scores (simple implementation)
      return results.map((result, index) => ({
        id: result.id,
        entityType: result.entityType,
        entityId: result.entityId,
        action: result.action,
        changeTimestamp: result.changeTimestamp,
        changedBy: result.changedBy,
        description: result.description,
        relevanceScore: 1 - index * 0.01 // Higher score for earlier results
      }));
    } catch (error: any) {
      Logger.error(`[SearchService] Search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Advanced search with field-level filtering
   */
  async advancedSearch(
    entityType: string,
    filters: Record<string, any>,
    limit = 50,
    page = 1
  ): Promise<SearchResult[]> {
    try {
      const where: any = { entityType };

      // Build filter conditions
      if (filters.action) where.action = filters.action;
      if (filters.changedBy) where.changedBy = filters.changedBy;
      if (filters.minChanges) {
        // Count changes and filter
        where.version = { gte: filters.minChanges };
      }

      if (filters.dateRange?.from || filters.dateRange?.to) {
        where.changeTimestamp = {};
        if (filters.dateRange?.from) where.changeTimestamp.gte = new Date(filters.dateRange.from);
        if (filters.dateRange?.to) where.changeTimestamp.lte = new Date(filters.dateRange.to);
      }

      const skip = (page - 1) * limit;

      const results = await prisma.entityHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { changeTimestamp: "desc" }
      });

      return results.map((result, index) => ({
        id: result.id,
        entityType: result.entityType,
        entityId: result.entityId,
        action: result.action,
        changeTimestamp: result.changeTimestamp,
        changedBy: result.changedBy,
        description: result.description,
        relevanceScore: 1 - index * 0.01
      }));
    } catch (error: any) {
      Logger.error(`[SearchService] Advanced search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save a search query for later use
   */
  async saveSearch(
    name: string,
    query: SearchQuery,
    adminId: string,
    description?: string
  ): Promise<SavedSearch> {
    try {
      const saved = await prisma.savedSearch.create({
        data: {
          name,
          description,
          filters: query as any,
          createdBy: adminId
        }
      });

      return {
        id: saved.id,
        name: saved.name,
        description: saved.description || undefined,
        query: { text: '', filters: {} as any } as any,
        createdBy: saved.createdBy,
        createdAt: saved.createdAt,
        lastUsed: saved.lastUsed || undefined,
        usageCount: saved.useCount
      };
    } catch (error: any) {
      Logger.error(`[SearchService] Failed to save search: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get saved searches for an admin
   */
  async getSavedSearches(adminId: string, limit = 20, page = 1): Promise<SavedSearch[]> {
    try {
      const skip = (page - 1) * limit;

      const searches = await prisma.savedSearch.findMany({
        where: { createdBy: adminId },
        skip,
        take: limit,
        orderBy: { lastUsed: "desc" }
      });

      return searches.map(search => ({
        id: search.id,
        name: search.name,
        description: search.description || undefined,
        query: { text: '', filters: search.filters as any },
        createdBy: search.createdBy,
        createdAt: search.createdAt,
        lastUsed: search.lastUsed || undefined,
        usageCount: search.useCount
      }));
    } catch (error: any) {
      Logger.error(`[SearchService] Failed to get saved searches: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a saved search and increment usage count
   */
  async executeSavedSearch(searchId: string): Promise<SearchResult[]> {
    try {
      const saved = await prisma.savedSearch.findUnique({
        where: { id: searchId }
      });

      if (!saved) {
        throw new Error("Saved search not found");
      }

      // Update usage count and last used
      await prisma.savedSearch.update({
        where: { id: searchId },
        data: {
          useCount: saved.useCount + 1,
          lastUsed: new Date()
        }
      });

      // Execute search
      return this.searchEntityHistory({ text: '', filters: {} } as any);
    } catch (error: any) {
      Logger.error(`[SearchService] Failed to execute saved search: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId: string, adminId: string): Promise<boolean> {
    try {
      const saved = await prisma.savedSearch.findUnique({
        where: { id: searchId }
      });

      if (!saved || saved.createdBy !== adminId) {
        throw new Error("Search not found or unauthorized");
      }

      await prisma.savedSearch.delete({
        where: { id: searchId }
      });

      return true;
    } catch (error: any) {
      Logger.error(`[SearchService] Failed to delete saved search: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(
    searchId: string,
    adminId: string,
    updates: { name?: string; description?: string; query?: SearchQuery }
  ): Promise<SavedSearch> {
    try {
      const saved = await prisma.savedSearch.findUnique({
        where: { id: searchId }
      });

      if (!saved || saved.createdBy !== adminId) {
        throw new Error("Search not found or unauthorized");
      }

      const updated = await prisma.savedSearch.update({
        where: { id: searchId },
        data: {
          name: updates.name || saved.name,
          description: updates.description || saved.description,
          filters: updates.query || (saved.filters as any)
        }
      });

      return {
        id: updated.id,
        name: updated.name,
        description: updated.description || undefined,
        query: { text: '', filters: {} } as any,
        createdBy: updated.createdBy,
        createdAt: updated.createdAt,
        lastUsed: updated.lastUsed || undefined,
        usageCount: updated.useCount
      };
    } catch (error: any) {
      Logger.error(`[SearchService] Failed to update saved search: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial text
   */
  async getSearchSuggestions(text: string, entityType?: string, limit = 10): Promise<string[]> {
    try {
      const where: any = {};
      if (entityType) where.entityType = entityType;

      const results = await prisma.entityHistory.findMany({
        where: {
          ...where,
          description: { contains: text, mode: "insensitive" }
        },
        distinct: ["description"],
        take: limit,
        select: { description: true }
      });

      return results
        .map(r => r.description)
        .filter((d): d is string => d !== null)
        .slice(0, limit);
    } catch (error: any) {
      Logger.error(`[SearchService] Failed to get suggestions: ${error.message}`);
      throw error;
    }
  }
}

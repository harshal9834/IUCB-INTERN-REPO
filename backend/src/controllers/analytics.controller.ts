import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { ExcelExportService } from "../services/excel-export.service.js";
import { FilterQuery } from "../types/analytics.types.js";

export class AnalyticsController {
  private analyticsService: AnalyticsService;
  private excelExportService: ExcelExportService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.excelExportService = new ExcelExportService();
    this.getOverviewStats = this.getOverviewStats.bind(this);
    this.getChartsData = this.getChartsData.bind(this);
    this.getRecentActivities = this.getRecentActivities.bind(this);
    this.exportExcel = this.exportExcel.bind(this);
  }

  getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as FilterQuery;
    const stats = await this.analyticsService.getOverviewStats(filters);
    res.json(new ApiResponse(200, stats, "Overview statistics retrieved successfully"));
  });

  getChartsData = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as FilterQuery;
    const data = await this.analyticsService.getChartsData(filters);
    res.json(new ApiResponse(200, data, "Charts data retrieved successfully"));
  });

  getRecentActivities = asyncHandler(async (req: Request, res: Response) => {
    const activities = await this.analyticsService.getRecentActivities();
    res.json(new ApiResponse(200, activities, "Recent activities retrieved successfully"));
  });

  exportExcel = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as FilterQuery;
    await this.excelExportService.exportAnalytics(res, filters);
  });
}

import analyticsRepository from "../repositories/analytics.repository.js";
import { AnalyticsQuery } from "../validators/analytics.validators.js";

class AnalyticsService {
  public async getDashboardData(query: AnalyticsQuery) {
    return analyticsRepository.getDashboardData(query);
  }

  public async getFilters() {
    return analyticsRepository.getFilters();
  }

  public async getReports(query: AnalyticsQuery) {
    return analyticsRepository.getReportRows(query);
  }

  public async exportReport(query: AnalyticsQuery) {
    return analyticsRepository.getReportRows(query);
  }

  public async getReportMetadata(query: AnalyticsQuery) {
    return analyticsRepository.getReportMetadata(query);
  }

  public async getAuditLogs(query: AnalyticsQuery) {
    return analyticsRepository.getAuditLogs(query);
  }

  public async getResourceSummary(query: AnalyticsQuery) {
    return analyticsRepository.getResourceSummary(query);
  }

  public async getOrganizationSummary(query: AnalyticsQuery) {
    return analyticsRepository.getOrganizationSummary(query);
  }

  public async getAuditorSummary(query: AnalyticsQuery) {
    return analyticsRepository.getAuditorSummary(query);
  }

  public async getCredentialSummary(query: AnalyticsQuery) {
    return analyticsRepository.getCredentialSummary(query);
  }

  public async getApplicationSummary(query: AnalyticsQuery) {
    return analyticsRepository.getApplicationSummary(query);
  }

  public async getAdvisorSummary(query: AnalyticsQuery) {
    return analyticsRepository.getAdvisorSummary(query);
  }
}

export default new AnalyticsService();

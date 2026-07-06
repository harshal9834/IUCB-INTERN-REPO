import { Response } from 'express';
import exceljs from 'exceljs';
import prisma from '../config/db.js';
import { FilterQuery } from '../types/analytics.types.js';

export class ExcelExportService {
  async exportAnalytics(res: Response, filters: FilterQuery) {
    const workbook = new exceljs.Workbook();
    workbook.creator = 'IUCB Admin';
    workbook.created = new Date();

    const dateFilter = filters.startDate && filters.endDate ? {
      createdAt: {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      }
    } : {};

    await this.addOverviewSheet(workbook, filters, dateFilter);
    await this.addOrganizationsSheet(workbook, dateFilter);
    await this.addApplicationsSheet(workbook, dateFilter);
    await this.addCredentialsSheet(workbook, dateFilter);
    await this.addCertificatesSheet(workbook, dateFilter);
    await this.addTrainingInstitutesSheet(workbook, dateFilter);
    await this.addAuditorsSheet(workbook, dateFilter);
    await this.addAuditLogsSheet(workbook, dateFilter);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="IUCB Analytics Report.xlsx"');

    await workbook.xlsx.write(res);
  }

  private styleHeader(sheet: exceljs.Worksheet) {
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004080' } };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  private autoFit(sheet: exceljs.Worksheet) {
    sheet.columns.forEach(column => {
      let maxLength = 0;
      column["eachCell"]({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });
  }

  private applyAlternatingRows(sheet: exceljs.Worksheet) {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }
    });
  }

  private async addOverviewSheet(workbook: exceljs.Workbook, filters: FilterQuery, dateFilter: any) {
    const sheet = workbook.addWorksheet('Overview');
    sheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];
    this.styleHeader(sheet);

    const totalOrgs = await prisma.organization.count({ where: dateFilter });
    const totalApps = await prisma.application.count({ where: dateFilter });
    const totalCreds = await prisma.credential.count({ where: dateFilter });
    const totalCerts = await prisma.credential.count({ where: { ...dateFilter, certificateGenerated: true } });
    
    sheet.addRows([
      { metric: 'Report Generated At', value: new Date().toLocaleString() },
      { metric: 'Total Organizations', value: totalOrgs },
      { metric: 'Total Applications', value: totalApps },
      { metric: 'Total Credentials', value: totalCreds },
      { metric: 'Total Certificates', value: totalCerts },
    ]);
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }

  private async addOrganizationsSheet(workbook: exceljs.Workbook, dateFilter: any) {
    const sheet = workbook.addWorksheet('Organizations');
    sheet.columns = [
      { header: 'Organization Name', key: 'name' },
      { header: 'Organization Code', key: 'code' },
      { header: 'Country', key: 'country' },
      { header: 'Status', key: 'status' },
      { header: 'Created Date', key: 'created' },
    ];
    this.styleHeader(sheet);

    const data = await prisma.organization.findMany({ where: dateFilter, orderBy: { createdAt: 'desc' } });
    data.forEach(d => {
      sheet.addRow({
        name: d.organizationName,
        code: d.registrationNumber,
        country: d.country,
        status: d.accreditationStatus,
        created: d.createdAt.toLocaleDateString(),
      });
    });
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }

  private async addApplicationsSheet(workbook: exceljs.Workbook, dateFilter: any) {
    const sheet = workbook.addWorksheet('Applications');
    sheet.columns = [
      { header: 'Application Number', key: 'number' },
      { header: 'Applicant', key: 'applicant' },
      { header: 'Organization', key: 'org' },
      { header: 'Status', key: 'status' },
      { header: 'Created', key: 'created' },
    ];
    this.styleHeader(sheet);

    const data = await prisma.application.findMany({ where: dateFilter, orderBy: { createdAt: 'desc' } });
    data.forEach(d => {
      sheet.addRow({
        number: d.applicationNumber || '-',
        applicant: d.fullName,
        org: d.company || '-',
        status: d.applicationStatus,
        created: d.createdAt.toLocaleDateString(),
      });
    });
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }

  private async addCredentialsSheet(workbook: exceljs.Workbook, dateFilter: any) {
    const sheet = workbook.addWorksheet('Credentials');
    sheet.columns = [
      { header: 'Credential ID', key: 'id' },
      { header: 'Standard', key: 'standard' },
      { header: 'Issued Date', key: 'issued' },
      { header: 'Expiry', key: 'expiry' },
      { header: 'Status', key: 'status' },
    ];
    this.styleHeader(sheet);

    const data = await prisma.credential.findMany({ where: dateFilter, orderBy: { createdAt: 'desc' } });
    data.forEach(d => {
      sheet.addRow({
        id: d.credentialId,
        standard: d.standard,
        issued: d.issueDate.toLocaleDateString(),
        expiry: d.expiryDate.toLocaleDateString(),
        status: d.status,
      });
    });
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }

  private async addCertificatesSheet(workbook: exceljs.Workbook, dateFilter: any) {
    const sheet = workbook.addWorksheet('Certificates');
    sheet.columns = [
      { header: 'Certificate ID', key: 'id' },
      { header: 'Standard', key: 'standard' },
      { header: 'Issue Date', key: 'issued' },
      { header: 'Verification Status', key: 'status' },
    ];
    this.styleHeader(sheet);

    const data = await prisma.credential.findMany({ where: { ...dateFilter, certificateGenerated: true }, orderBy: { createdAt: 'desc' } });
    data.forEach(d => {
      sheet.addRow({
        id: d.credentialId,
        standard: d.standard,
        issued: d.generatedAt?.toLocaleDateString() || '-',
        status: d.status,
      });
    });
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }

  private async addTrainingInstitutesSheet(workbook: exceljs.Workbook, dateFilter: any) {
    const sheet = workbook.addWorksheet('Training Institutes');
    sheet.columns = [
      { header: 'Institute Name', key: 'name' },
      { header: 'Code', key: 'code' },
      { header: 'Status', key: 'status' },
      { header: 'Country', key: 'country' },
    ];
    this.styleHeader(sheet);

    const data = await prisma.trainingInstitute.findMany({ where: dateFilter, orderBy: { createdAt: 'desc' } });
    data.forEach(d => {
      sheet.addRow({
        name: d.instituteName,
        code: d.registrationNumber,
        status: d.status,
        country: d.country,
      });
    });
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }

  private async addAuditorsSheet(workbook: exceljs.Workbook, dateFilter: any) {
    const sheet = workbook.addWorksheet('Auditors');
    sheet.columns = [
      { header: 'Auditor Name', key: 'name' },
      { header: 'Level', key: 'level' },
      { header: 'Status', key: 'status' },
    ];
    this.styleHeader(sheet);

    const data = await prisma.auditor.findMany({ where: dateFilter, orderBy: { createdAt: 'desc' } });
    data.forEach(d => {
      sheet.addRow({
        name: d.fullName,
        level: d.tier,
        status: d.status,
      });
    });
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }

  private async addAuditLogsSheet(workbook: exceljs.Workbook, dateFilter: any) {
    const sheet = workbook.addWorksheet('Audit Logs');
    sheet.columns = [
      { header: 'Timestamp', key: 'timestamp' },
      { header: 'Admin', key: 'admin' },
      { header: 'Module', key: 'module' },
      { header: 'Action', key: 'action' },
      { header: 'IP Address', key: 'ip' },
    ];
    this.styleHeader(sheet);

    const data = await prisma.auditLog.findMany({ where: dateFilter, orderBy: { createdAt: 'desc' } });
    data.forEach(d => {
      sheet.addRow({
        timestamp: d.createdAt.toLocaleString(),
        admin: d.actorName || '-',
        module: d.module || '-',
        action: d.action || '-',
        ip: d.ipAddress || '-',
      });
    });
    this.autoFit(sheet);
    this.applyAlternatingRows(sheet);
  }
}

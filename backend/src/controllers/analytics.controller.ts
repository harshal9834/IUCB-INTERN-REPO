import { Response } from "express";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import analyticsService from "../services/analytics.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { analyticsQuerySchema } from "../validators/analytics.validators.js";

class AnalyticsController {
  public getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getDashboardData(query);
    return res.status(200).json(new ApiResponse(200, data, "Analytics dashboard fetched successfully."));
  });

  public getFilters = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await analyticsService.getFilters();
    return res.status(200).json(new ApiResponse(200, data, "Analytics filters fetched successfully."));
  });

  public getReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getReports(query);
    return res.status(200).json(new ApiResponse(200, data, "Analytics report rows fetched successfully."));
  });

  public exportReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const format = String(req.query.format || "csv").toLowerCase();
    const validFormats = ["csv", "excel", "pdf"] as const;

    if (!validFormats.includes(format as any)) {
      throw new ApiError(400, "Invalid export format. Supported formats are csv, excel, pdf.");
    }

    const { rows } = await analyticsService.exportReport(query);

    if (format === "csv") {
      const header = ["Timestamp", "Admin", "Action", "Entity", "Details", "IP Address"];
      const csv = [header.join(",")].concat(
        rows.map((row) => [row.timestamp, row.admin, row.action, row.entity, row.details.replace(/\n/g, " "), row.ip].map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")),
      ).join("\n");

      res.header("Content-Type", "text/csv");
      res.header("Content-Disposition", "attachment; filename=analytics-report.csv");
      return res.send(csv);
    }

    if (format === "excel") {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Analytics Report");

      sheet.columns = [
        { header: "Timestamp", key: "timestamp", width: 24 },
        { header: "Admin", key: "admin", width: 24 },
        { header: "Action", key: "action", width: 18 },
        { header: "Entity", key: "entity", width: 18 },
        { header: "Details", key: "details", width: 60 },
        { header: "IP Address", key: "ip", width: 18 },
      ];

      rows.forEach((row) => sheet.addRow(row));
      const buffer = await workbook.xlsx.writeBuffer();

      res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.header("Content-Disposition", "attachment; filename=analytics-report.xlsx");
      return res.send(Buffer.from(buffer));
    }

    const PDFDocument = (await import("pdfkit")).default;

    // Fetch full dashboard data for the executive report
    const dashboardData = await analyticsService.getDashboardData(query);

    const NAVY = "#0F2942";
    const GOLD = "#D4AF37";
    const LIGHT_BLUE = "#2563EB";
    const GREEN = "#10B981";
    const RED = "#EF4444";
    const AMBER = "#F59E0B";
    const SLATE = "#64748B";
    const SLATE_LIGHT = "#F8FAFC";
    const WHITE = "#FFFFFF";
    const BORDER = "#E2E8F0";

    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
    res.header("Content-Type", "application/pdf");
    res.header("Content-Disposition", "attachment; filename=iucb-analytics-report.pdf");
    doc.pipe(res);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const MARGIN = 40;
    const CONTENT_W = PAGE_W - MARGIN * 2;

    const generatedAt = new Date();
    const dateStr = generatedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const dateRangeLabel = query.dateRange?.replace(/_/g, " ") ?? "ALL TIME";
    const reportTypeLabel = query.reportType?.replace(/_/g, " ") ?? "ALL";

    let pageNum = 0;

    const addPage = () => {
      doc.addPage({ size: "A4", margin: 0 });
      pageNum++;

      // Header bar (skip on cover page 1)
      if (pageNum > 1) {
        doc.rect(0, 0, PAGE_W, 36).fill(NAVY);
        doc.fillColor(GOLD).fontSize(9).font("Helvetica-Bold")
          .text("IUCB", MARGIN, 13, { continued: true })
          .fillColor(WHITE).font("Helvetica")
          .text("  |  Analytics Dashboard Report  |  CONFIDENTIAL", { align: "left" });
        doc.fillColor(WHITE).fontSize(8).font("Helvetica")
          .text(`Page ${pageNum}  |  ${dateStr}`, MARGIN, 13, { align: "right", width: CONTENT_W });
      }

      // Footer bar
      doc.rect(0, PAGE_H - 28, PAGE_W, 28).fill(NAVY);
      doc.fillColor(WHITE).fontSize(7).font("Helvetica")
        .text(`Generated automatically by IUCB Management System  •  Confidential  •  Page ${pageNum}  •  ${dateStr} ${timeStr}`,
          MARGIN, PAGE_H - 18, { width: CONTENT_W, align: "center" });
    };

    // ══════════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════════
    addPage();

    // Full-height navy background
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(NAVY);

    // Gold accent bar top
    doc.rect(0, 0, PAGE_W, 8).fill(GOLD);

    // Gold accent bar bottom
    doc.rect(0, PAGE_H - 8, PAGE_W, 8).fill(GOLD);

    // White card in the centre
    const cardY = 160;
    const cardH = 420;
    doc.roundedRect(MARGIN, cardY, CONTENT_W, cardH, 12).fill(WHITE);

    // IUCB shield badge
    doc.circle(PAGE_W / 2, cardY - 48, 42).fill(GOLD);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22)
      .text("IUCB", PAGE_W / 2 - 28, cardY - 59);

    // Title block
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22)
      .text("Analytics Dashboard Report", MARGIN + 20, cardY + 30, { width: CONTENT_W - 40, align: "center" });

    doc.fillColor(SLATE).font("Helvetica").fontSize(11)
      .text("International Union for Certification & Benchmarking", MARGIN + 20, cardY + 62, { width: CONTENT_W - 40, align: "center" });

    // Divider
    doc.rect(MARGIN + 60, cardY + 86, CONTENT_W - 120, 1.5).fill(GOLD);

    // Meta grid
    const metaStartY = cardY + 104;
    const col1X = MARGIN + 28;
    const col2X = PAGE_W / 2 + 10;

    const metaRow = (label: string, value: string, x: number, y: number) => {
      doc.fillColor(SLATE).font("Helvetica").fontSize(8).text(label.toUpperCase(), x, y);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(value || "—", x, y + 13);
    };

    metaRow("Generated Date", dateStr, col1X, metaStartY);
    metaRow("Generated Time", timeStr, col2X, metaStartY);
    metaRow("Date Range", dateRangeLabel, col1X, metaStartY + 52);
    metaRow("Report Type", reportTypeLabel, col2X, metaStartY + 52);
    metaRow("Total Records Analyzed", String(rows.length), col1X, metaStartY + 104);
    metaRow("Report Version", "1.0", col2X, metaStartY + 104);

    // Summary stats strip
    const stripY = cardY + 260;
    doc.rect(MARGIN + 12, stripY, CONTENT_W - 24, 70).fill(SLATE_LIGHT);

    const kpiMini = (label: string, val: number | string, x: number) => {
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(18)
        .text(String(val), x, stripY + 10, { width: 90, align: "center" });
      doc.fillColor(SLATE).font("Helvetica").fontSize(7)
        .text(label, x, stripY + 32, { width: 90, align: "center" });
    };

    const metrics = dashboardData.metrics ?? [];
    const metricMap: Record<string, number> = {};
    metrics.forEach((m: any) => { metricMap[m.id] = m.value; });

    const miniW = (CONTENT_W - 24) / 6;
    kpiMini("Organizations", metricMap["orgs"] ?? 0, MARGIN + 12);
    kpiMini("Auditors", metricMap["auditors"] ?? 0, MARGIN + 12 + miniW);
    kpiMini("Credentials", metricMap["credentials"] ?? 0, MARGIN + 12 + miniW * 2);
    kpiMini("Pending Apps", metricMap["pending"] ?? 0, MARGIN + 12 + miniW * 3);
    kpiMini("Advisors", metricMap["advisors"] ?? 0, MARGIN + 12 + miniW * 4);
    kpiMini("Resources", metricMap["resources"] ?? 0, MARGIN + 12 + miniW * 5);

    // Vertical separators in strip
    for (let i = 1; i < 6; i++) {
      doc.rect(MARGIN + 12 + miniW * i, stripY + 8, 1, 54).fill(BORDER);
    }

    // Tagline
    doc.fillColor(SLATE).font("Helvetica").fontSize(8)
      .text("This report is generated automatically and contains confidential analytical data.",
        MARGIN + 20, cardY + cardH - 36, { width: CONTENT_W - 40, align: "center" });

    // ══════════════════════════════════════════
    // EXECUTIVE SUMMARY PAGE
    // ══════════════════════════════════════════
    addPage();
    let y = 52;

    const sectionHeader = (title: string, currentY: number): number => {
      doc.rect(MARGIN, currentY, CONTENT_W, 28).fill(NAVY);
      doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11)
        .text(title, MARGIN + 14, currentY + 8);
      doc.rect(MARGIN, currentY + 28, CONTENT_W, 1).fill(GOLD);
      return currentY + 40;
    };

    const checkPageBreak = (currentY: number, needed: number): number => {
      if (currentY + needed > PAGE_H - 50) {
        addPage();
        return 52;
      }
      return currentY;
    };

    y = sectionHeader("EXECUTIVE SUMMARY — KEY PERFORMANCE INDICATORS", y);
    y += 8;

    // KPI Cards — 3 per row
    const kpiCards = [
      { label: "Total Organizations", value: metricMap["orgs"] ?? 0, color: LIGHT_BLUE, sub: "Accredited Bodies" },
      { label: "Active Auditors", value: metricMap["auditors"] ?? 0, color: GREEN, sub: "Registered Auditors" },
      { label: "Issued Credentials", value: metricMap["credentials"] ?? 0, color: NAVY, sub: "Total Credentials" },
      { label: "Pending Applications", value: metricMap["pending"] ?? 0, color: AMBER, sub: "Awaiting Review" },
      { label: "Approved Advisors", value: metricMap["advisors"] ?? 0, color: GREEN, sub: "Advisory Members" },
      { label: "Total Resources", value: metricMap["resources"] ?? 0, color: SLATE, sub: "Published Resources" },
    ];

    const cardW = (CONTENT_W - 16) / 3;
    const cardH2 = 72;
    const cardGap = 8;

    kpiCards.forEach((card, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cx = MARGIN + col * (cardW + cardGap);
      const cy = y + row * (cardH2 + cardGap);

      // Card background
      doc.roundedRect(cx, cy, cardW, cardH2, 6).fill(WHITE);
      // Left accent
      doc.rect(cx, cy, 4, cardH2).fill(card.color);
      // Value
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(26)
        .text(card.value.toLocaleString(), cx + 14, cy + 10, { width: cardW - 20 });
      // Label
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9)
        .text(card.label, cx + 14, cy + 42, { width: cardW - 20 });
      // Sub
      doc.fillColor(SLATE).font("Helvetica").fontSize(7.5)
        .text(card.sub, cx + 14, cy + 55, { width: cardW - 20 });
    });

    y += Math.ceil(kpiCards.length / 3) * (cardH2 + cardGap) + 24;

    // ── Credential Status Summary ──
    y = checkPageBreak(y, 120);
    y = sectionHeader("CREDENTIAL STATUS OVERVIEW", y);
    y += 8;

    const credStatus = dashboardData.credentialStatus ?? [];
    const totalCreds = credStatus.reduce((s: number, c: any) => s + (c.value ?? 0), 0);
    const credColors: Record<string, string> = { VALID: GREEN, REVOKED: RED, EXPIRED: AMBER };

    if (credStatus.length === 0) {
      doc.fillColor(SLATE).font("Helvetica").fontSize(9).text("No credential data available.", MARGIN, y);
      y += 20;
    } else {
      const barW = CONTENT_W - 120;
      credStatus.forEach((item: any) => {
        const pct = totalCreds > 0 ? (item.value / totalCreds) : 0;
        const color = credColors[item.name] ?? LIGHT_BLUE;
        doc.fillColor(NAVY).font("Helvetica").fontSize(9).text(item.name, MARGIN, y + 3, { width: 90 });
        doc.rect(MARGIN + 96, y, barW, 14).fill("#F1F5F9");
        doc.rect(MARGIN + 96, y, Math.max(barW * pct, 2), 14).fill(color);
        doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(7.5)
          .text(`${item.value} (${Math.round(pct * 100)}%)`, MARGIN + 96 + 6, y + 3.5);
        y += 22;
      });
    }
    y += 16;

    // ── Auditor Tier Distribution ──
    y = checkPageBreak(y, 120);
    y = sectionHeader("AUDITOR TIER DISTRIBUTION", y);
    y += 8;

    const auditorTiers = dashboardData.auditorTier ?? [];
    const totalAuditors2 = auditorTiers.reduce((s: number, a: any) => s + (a.value ?? 0), 0);
    const tierColors: Record<string, string> = { LEAD: NAVY, SENIOR: LIGHT_BLUE, ASSOCIATE: GOLD };

    if (auditorTiers.length === 0) {
      doc.fillColor(SLATE).font("Helvetica").fontSize(9).text("No auditor tier data available.", MARGIN, y);
      y += 20;
    } else {
      const barW2 = CONTENT_W - 120;
      auditorTiers.forEach((item: any) => {
        const pct = totalAuditors2 > 0 ? (item.value / totalAuditors2) : 0;
        const color = tierColors[item.name] ?? SLATE;
        doc.fillColor(NAVY).font("Helvetica").fontSize(9).text(item.name, MARGIN, y + 3, { width: 90 });
        doc.rect(MARGIN + 96, y, barW2, 14).fill("#F1F5F9");
        doc.rect(MARGIN + 96, y, Math.max(barW2 * pct, 2), 14).fill(color);
        doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(7.5)
          .text(`${item.value} (${Math.round(pct * 100)}%)`, MARGIN + 96 + 6, y + 3.5);
        y += 22;
      });
    }
    y += 16;

    // ── Standards Adoption ──
    y = checkPageBreak(y, 130);
    y = sectionHeader("TOP STANDARDS BY ADOPTION", y);
    y += 8;

    const standards = dashboardData.standards ?? [];
    const stdColors = [NAVY, LIGHT_BLUE, GOLD, GREEN, AMBER];

    if (standards.length === 0) {
      doc.fillColor(SLATE).font("Helvetica").fontSize(9).text("No standards data available.", MARGIN, y);
      y += 20;
    } else {
      const barW3 = CONTENT_W - 120;
      standards.forEach((item: any, idx: number) => {
        const pct = (item.percent ?? 0) / 100;
        const color = stdColors[idx % stdColors.length];
        doc.fillColor(NAVY).font("Helvetica").fontSize(9).text(item.name, MARGIN, y + 3, { width: 90 });
        doc.rect(MARGIN + 96, y, barW3, 14).fill("#F1F5F9");
        doc.rect(MARGIN + 96, y, Math.max(barW3 * pct, 2), 14).fill(color);
        doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(7.5)
          .text(`${item.percent}%`, MARGIN + 96 + 6, y + 3.5);
        y += 22;
      });
    }
    y += 16;

    // ── Advisor Statistics ──
    y = checkPageBreak(y, 110);
    y = sectionHeader("ADVISOR STATISTICS", y);
    y += 8;

    const advisorStats = dashboardData.advisorStats;
    if (advisorStats) {
      const advisorItems = [
        { label: "Total Advisors", value: advisorStats.total ?? 0, color: NAVY },
        { label: "Licensed", value: advisorStats.licensed ?? 0, color: GREEN },
        { label: "Pending", value: advisorStats.pending ?? 0, color: AMBER },
        { label: "Inactive", value: advisorStats.inactive ?? 0, color: SLATE },
      ];
      const aW = (CONTENT_W - 24) / 4;
      advisorItems.forEach((item, idx) => {
        const cx2 = MARGIN + idx * (aW + 8);
        doc.roundedRect(cx2, y, aW, 56, 5).fill(WHITE);
        doc.rect(cx2, y, aW, 4).fill(item.color);
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20)
          .text(String(item.value), cx2 + 8, y + 12, { width: aW - 16, align: "center" });
        doc.fillColor(SLATE).font("Helvetica").fontSize(8)
          .text(item.label, cx2 + 8, y + 37, { width: aW - 16, align: "center" });
      });
      y += 72;
    }

    // ══════════════════════════════════════════
    // RECENT ACTIVITY / AUDIT LOG TABLE
    // ══════════════════════════════════════════
    y = checkPageBreak(y, 60);
    y = sectionHeader("RECENT ACTIVITY — AUDIT LOG", y);
    y += 8;

    // Table headers
    const cols = [
      { label: "Timestamp", width: 90 },
      { label: "Admin", width: 80 },
      { label: "Action", width: 60 },
      { label: "Entity", width: 60 },
      { label: "Details", width: 175 },
      { label: "IP Address", width: 50 },
    ];

    const drawTableHeader = (startY: number): number => {
      doc.rect(MARGIN, startY, CONTENT_W, 20).fill(NAVY);
      let x = MARGIN + 6;
      cols.forEach((col) => {
        doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(7.5)
          .text(col.label, x, startY + 6, { width: col.width - 6 });
        x += col.width;
      });
      return startY + 20;
    };

    y = drawTableHeader(y);

    if (rows.length === 0) {
      doc.rect(MARGIN, y, CONTENT_W, 24).fill(SLATE_LIGHT);
      doc.fillColor(SLATE).font("Helvetica").fontSize(8)
        .text("No activity records available for the selected filters.", MARGIN + 12, y + 8, { width: CONTENT_W - 24, align: "center" });
      y += 24;
    } else {
      rows.forEach((row: any, idx: number) => {
        const rowH = 22;
        y = checkPageBreak(y, rowH + 4);

        // Re-draw header after page break
        if (y === 52) {
          y = drawTableHeader(y);
        }

        const bgColor = idx % 2 === 0 ? WHITE : SLATE_LIGHT;
        doc.rect(MARGIN, y, CONTENT_W, rowH).fill(bgColor);

        // Bottom border
        doc.rect(MARGIN, y + rowH - 1, CONTENT_W, 1).fill(BORDER);

        const rowData = [
          typeof row.timestamp === "string"
            ? new Date(row.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            : String(row.timestamp ?? ""),
          String(row.admin ?? "System"),
          String(row.action ?? ""),
          String(row.entity ?? ""),
          String(row.details ?? "").substring(0, 60) + (String(row.details ?? "").length > 60 ? "…" : ""),
          String(row.ip ?? "—"),
        ];

        let x2 = MARGIN + 6;
        rowData.forEach((cell, cidx) => {
          doc.fillColor(NAVY).font("Helvetica").fontSize(7.5)
            .text(cell, x2, y + 6, { width: cols[cidx].width - 6, lineBreak: false });
          x2 += cols[cidx].width;
        });

        y += rowH;
      });
    }

    // ── Report Insights ──
    y += 24;
    y = checkPageBreak(y, 160);
    y = sectionHeader("REPORT INSIGHTS", y);
    y += 10;

    const totalOrgs = metricMap["orgs"] ?? 0;
    const totalAuds = metricMap["auditors"] ?? 0;
    const totalCreds2 = metricMap["credentials"] ?? 0;
    const pendingApps = metricMap["pending"] ?? 0;
    const totalAdvs = metricMap["advisors"] ?? 0;
    const validCreds = credStatus.find((c: any) => c.name === "VALID")?.value ?? 0;
    const credValidPct = totalCreds2 > 0 ? Math.round((validCreds / totalCreds2) * 100) : 0;
    const topStandard = standards.length > 0 ? standards[0]?.name : "N/A";
    const leadAuditors = auditorTiers.find((a: any) => a.name === "LEAD")?.value ?? 0;

    const insights = [
      `• ${totalOrgs} organization${totalOrgs !== 1 ? "s are" : " is"} registered on the IUCB platform under the selected date range.`,
      `• ${totalAuds} auditor${totalAuds !== 1 ? "s are" : " is"} currently registered. ${leadAuditors} hold Lead Auditor status.`,
      `• ${totalCreds2} credential${totalCreds2 !== 1 ? "s have" : " has"} been issued. ${credValidPct}% (${validCreds}) remain${credValidPct !== 100 ? "" : "s"} valid.`,
      `• ${pendingApps} advisory application${pendingApps !== 1 ? "s are" : " is"} pending review and require attention.`,
      `• ${totalAdvs} advisor${totalAdvs !== 1 ? "s are" : " is"} active on the advisory board.`,
      topStandard !== "N/A" ? `• The most adopted standard is ${topStandard}, leading the standards adoption rankings.` : `• No standards adoption data is available for the selected range.`,
      `• ${rows.length} audit log event${rows.length !== 1 ? "s are" : " is"} included in the activity table.`,
    ];

    insights.forEach((insight) => {
      y = checkPageBreak(y, 18);
      doc.fillColor(NAVY).font("Helvetica").fontSize(9).text(insight, MARGIN, y, { width: CONTENT_W });
      y += 16;
    });

    // ── Filter Information ──
    y += 12;
    y = checkPageBreak(y, 80);
    y = sectionHeader("APPLIED FILTERS", y);
    y += 10;

    doc.roundedRect(MARGIN, y, CONTENT_W, 52, 5).fill(SLATE_LIGHT);
    const fCol1 = MARGIN + 16;
    const fCol2 = MARGIN + CONTENT_W / 2 + 8;

    doc.fillColor(SLATE).font("Helvetica").fontSize(7.5)
      .text("DATE RANGE", fCol1, y + 8)
      .text("REPORT TYPE", fCol2, y + 8);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9)
      .text(dateRangeLabel, fCol1, y + 20)
      .text(reportTypeLabel, fCol2, y + 20);
    doc.fillColor(SLATE).font("Helvetica").fontSize(7.5)
      .text("RECORDS EXPORTED", fCol1, y + 36)
      .text(String(rows.length), fCol1 + 110, y + 36);

    doc.end();
  });

  public getReportMetadata = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getReportMetadata(query);
    return res.status(200).json(new ApiResponse(200, data, "Analytics report metadata retrieved successfully."));
  });

  public getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getAuditLogs(query);
    return res.status(200).json(new ApiResponse(200, data, "Audit log history retrieved successfully."));
  });

  public getResourceSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getResourceSummary(query);
    return res.status(200).json(new ApiResponse(200, data, "Resource analytics summary retrieved successfully."));
  });

  public getOrganizationSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getOrganizationSummary(query);
    return res.status(200).json(new ApiResponse(200, data, "Organization analytics summary retrieved successfully."));
  });

  public getAuditorSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getAuditorSummary(query);
    return res.status(200).json(new ApiResponse(200, data, "Auditor analytics summary retrieved successfully."));
  });

  public getCredentialSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getCredentialSummary(query);
    return res.status(200).json(new ApiResponse(200, data, "Credential analytics summary retrieved successfully."));
  });

  public getApplicationSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getApplicationSummary(query);
    return res.status(200).json(new ApiResponse(200, data, "Application analytics summary retrieved successfully."));
  });

  public getAdvisorSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getAdvisorSummary(query);
    return res.status(200).json(new ApiResponse(200, data, "Advisor analytics summary retrieved successfully."));
  });

  // ─── NEW ENDPOINTS (required by frontend) ───────────────────────────

  public getOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getOverviewStats(query);
    return res.status(200).json(new ApiResponse(200, data, "Analytics overview fetched successfully."));
  });

  public getCharts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getChartsData(query);
    return res.status(200).json(new ApiResponse(200, data, "Analytics charts data fetched successfully."));
  });

  public getRecentActivities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await analyticsService.getRecentActivities();
    return res.status(200).json(new ApiResponse(200, data, "Recent activities fetched successfully."));
  });

  public exportExcel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const rows = await analyticsService.getExcelExportData(query);

    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Analytics Report");

    sheet.columns = [
      { header: "Timestamp", key: "timestamp", width: 24 },
      { header: "Admin", key: "admin", width: 24 },
      { header: "Action", key: "action", width: 18 },
      { header: "Entity", key: "entity", width: 18 },
      { header: "Details", key: "details", width: 60 },
      { header: "IP Address", key: "ip", width: 18 },
    ];

    rows.forEach((row) => sheet.addRow(row));
    const buffer = await workbook.xlsx.writeBuffer();

    res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.header("Content-Disposition", "attachment; filename=analytics-report.xlsx");
    return res.send(Buffer.from(buffer));
  });

  public getTrainingInstituteSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getTrainingInstituteSummary(query);
    return res.status(200).json(new ApiResponse(200, data, "Training Institute analytics fetched successfully."));
  });
}

export default new AnalyticsController();

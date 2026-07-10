import { Request, Response } from 'express';
import { excelParserService } from '../services/bulk-email/excel-parser.service.js';
import { templateParserService } from '../services/bulk-email/template-parser.service.js';
import { bulkEmailService } from '../services/bulk-email/bulk-email.service.js';

export class BulkEmailController {
  
  public async uploadExcel(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No Excel file uploaded' });
      }

      const rows = excelParserService.parseBuffer(req.file.buffer);
      
      // We assume row headers are keys in the first row object
      const excelColumns = rows.length > 0 ? Object.keys(rows[0]) : [];

      res.status(200).json({
        success: true,
        data: {
          rowCount: rows.length,
          excelColumns,
          preview: rows.slice(0, 5),
          allRows: rows // Send all rows to frontend so they can be passed to generate Campaign
        }
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public async uploadTemplate(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No HTML file uploaded' });
      }

      const htmlContent = req.file.buffer.toString('utf-8');
      const { excelColumns } = req.body;

      let cols: string[] = [];
      try {
        cols = typeof excelColumns === 'string' ? JSON.parse(excelColumns) : excelColumns || [];
      } catch(e) {}

      const placeholders = templateParserService.extractPlaceholders(htmlContent);
      const matchResult = templateParserService.matchPlaceholders(placeholders, cols);

      res.status(200).json({
        success: true,
        data: {
          htmlContent, // Send back so frontend can store it
          placeholders,
          matchResult
        }
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public async generateCampaign(req: Request, res: Response) {
    try {
      // In a real app we'd receive the raw data again or process from a stored temp location.
      // Assuming frontend sends back the parsed rows and html for simplicity of stateless API
      const { campaignId, rows, templateHtml, baseUrl } = req.body;

      if (!campaignId || !rows || !templateHtml || !baseUrl) {
        return res.status(400).json({ success: false, message: 'Missing required parameters' });
      }

      const campaignDbId = await bulkEmailService.generateCampaign(campaignId, rows, templateHtml, baseUrl);

      res.status(200).json({
        success: true,
        data: { campaignDbId }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public async sendEmails(req: Request, res: Response) {
    try {
      const { campaignDbId, emailConfig } = req.body;

      if (!campaignDbId || !emailConfig) {
        return res.status(400).json({ success: false, message: 'Missing required parameters' });
      }

      // We start it in the background to not block the HTTP request if it takes a long time
      // For production we'd use a queue (BullMQ), but here we use a promise without await.
      bulkEmailService.sendCampaignEmails(campaignDbId, emailConfig).catch(console.error);

      res.status(200).json({
        success: true,
        message: 'Email dispatch started'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getReport(req: Request, res: Response) {
    try {
      const campaignDbId = req.params.campaignDbId as string;
      const report = await bulkEmailService.getCampaignReport(campaignDbId);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const bulkEmailController = new BulkEmailController();

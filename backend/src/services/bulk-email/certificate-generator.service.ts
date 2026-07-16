import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

export class CertificateGeneratorService {
  private readonly UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'certificates');

  constructor() {
    // Ensure base uploads directory exists
    if (!fs.existsSync(this.UPLOADS_DIR)) {
      fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
    }
  }

  /**
   * Replaces placeholders in the HTML template with actual values
   */
  public populateTemplate(html: string, data: Record<string, any>): string {
    let populatedHtml = html;
    
    // Convert keys to lowercase for case-insensitive matching
    const normalizedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      normalizedData[key.toLowerCase()] = String(value);
    }

    // Replace {{Placeholder}}
    populatedHtml = populatedHtml.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
      const key = p1.trim().toLowerCase();
      return normalizedData[key] !== undefined ? normalizedData[key] : match;
    });

    return populatedHtml;
  }

  /**
   * Generates a PDF from HTML and saves it locally
   */
  public async generatePdf(
    campaignId: string, 
    candidateName: string, 
    populatedHtml: string
  ): Promise<{ pdfPath: string, pdfFileName: string }> {
    
    const campaignDir = path.join(this.UPLOADS_DIR, campaignId);
    
    // Create campaign directory if it doesn't exist
    if (!fs.existsSync(campaignDir)) {
      fs.mkdirSync(campaignDir, { recursive: true });
    }

    // Sanitize file name
    const safeName = candidateName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    const pdfFileName = `${safeName}.pdf`;
    const pdfPath = path.join(campaignDir, pdfFileName);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(populatedHtml, { waitUntil: 'domcontentloaded' });
      
      // Generate PDF
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        landscape: true, // typical for certificates
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      });
      
    } finally {
      await browser.close();
    }

    // Return relative path for database storage
    const relativePath = path.join('uploads', 'certificates', campaignId, pdfFileName).replace(/\\/g, '/');
    
    return { 
      pdfPath: relativePath, 
      pdfFileName 
    };
  }

  /**
   * Generates a PDF buffer from HTML (for direct API usage)
   */
  public async generatePdfBuffer(populatedHtml: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(populatedHtml, { waitUntil: 'domcontentloaded' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true, // typical for certificates
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}

export const certificateGeneratorService = new CertificateGeneratorService();

import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../../config/Database.js';

export interface EmailConfig {
  subject: string;
  body: string;
  fromName: string;
  replyTo?: string;
}

export class EmailDispatcherService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.MAIL_FROM || 'noreply@iucb.org';
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Replaces placeholders in email subject and body
   */
  private populateEmailText(text: string, data: Record<string, any>): string {
    let populatedText = text;
    const normalizedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      normalizedData[key.toLowerCase()] = String(value);
    }

    populatedText = populatedText.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
      const key = p1.trim().toLowerCase();
      return normalizedData[key] !== undefined ? normalizedData[key] : match;
    });

    return populatedText;
  }

  public async sendEmailWithCertificate(
    to: string,
    config: EmailConfig,
    data: Record<string, any>,
    pdfPath: string,
    pdfFileName: string
  ): Promise<void> {
    
    // Resolve absolute path from relative path stored in DB
    const absolutePdfPath = path.join(process.cwd(), pdfPath);
    
    if (!fs.existsSync(absolutePdfPath)) {
      throw new Error(`PDF attachment not found at path: ${absolutePdfPath}`);
    }

    const subject = this.populateEmailText(config.subject, data);
    const html = this.populateEmailText(config.body, data);

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${config.fromName}" <${this.fromEmail}>`,
      to,
      subject,
      html,
      replyTo: config.replyTo,
      attachments: [
        {
          filename: pdfFileName,
          path: absolutePdfPath,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      await this.transporter.sendMail(mailOptions);
      
      // Log success to unified EmailLog table
      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject,
          template: 'bulk-certificate',
          status: 'SENT',
        }
      });
    } catch (err: any) {
      // Log failure to unified EmailLog table
      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject,
          template: 'bulk-certificate',
          status: 'FAILED',
          errorMessage: err.message,
        }
      });
      throw err;
    }
  }
}

export const emailDispatcherService = new EmailDispatcherService();

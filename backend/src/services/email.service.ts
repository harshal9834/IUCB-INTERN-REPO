import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import prisma from '../config/Database.js';
import { EmailTemplates } from './email-templates.js';
import * as fs from 'fs';
import * as path from 'path';

class EmailServiceClass {
  private transporter: Transporter;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.MAIL_FROM || 'noreply@iucb.org';
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  private async sendEmailWithLog(
    to: string,
    subject: string,
    html: string,
    templateName: string,
    attachments?: SendMailOptions['attachments'],
    credentialId?: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"IUCB Admin" <${this.fromEmail}>`,
        to,
        subject,
        html,
        attachments,
      });

      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject,
          template: templateName,
          status: 'SENT',
          credentialId: credentialId || null,
        }
      });
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      
      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject,
          template: templateName,
          status: 'FAILED',
          errorMessage: error.message,
          credentialId: credentialId || null,
        }
      });


      // Still throw it so the caller can handle it (e.g. return 500 or just ignore)
      throw error;
    }
  }

  async sendSubmissionConfirmationEmail(data: { to: string; applicantName: string; applicationType: string; applicationNumber: string }): Promise<void> {
    const html = EmailTemplates.submissionConfirmation(data);
    await this.sendEmailWithLog(
      data.to,
      `Application Received: ${data.applicationType}`,
      html,
      'submissionConfirmation'
    );
  }

  async sendWelcomeEmail(data: { to: string; applicantName: string; role: string }): Promise<void> {
    const html = EmailTemplates.welcomeEmail(data);
    await this.sendEmailWithLog(
      data.to,
      `Welcome to IUCB`,
      html,
      'welcomeEmail'
    );
  }

  async sendApprovalEmail(data: { to: string; applicantName: string; applicationType: string; applicationNumber?: string }): Promise<void> {
    const html = EmailTemplates.approvalEmail(data);
    await this.sendEmailWithLog(
      data.to,
      `Application Approved: ${data.applicationType}`,
      html,
      'approvalEmail'
    );
  }

  async sendRejectionEmail(data: { to: string; applicantName: string; applicationType: string; reason?: string }): Promise<void> {
    const html = EmailTemplates.rejectionEmail(data);
    await this.sendEmailWithLog(
      data.to,
      `Application Update: ${data.applicationType}`,
      html,
      'rejectionEmail'
    );
  }

  async sendCertificateEmail(data: { 
    to: string; 
    applicantName: string; 
    credentialId: string; 
    issueDate: string; 
    expiryDate: string; 
    verificationLink: string; 
    pdfBuffer: Buffer;
    customMessage?: string;
  }): Promise<void> {
    const html = EmailTemplates.certificateEmail(data);
    
    // Attempt to extract the UUID of the credential based on credentialId (string like C-2026-...)
    const cred = await prisma.credential.findFirst({
      where: { credentialId: data.credentialId, deletedAt: null }
    });

    await this.sendEmailWithLog(
      data.to,
      `Your Official IUCB Certificate - ${data.credentialId}`,
      html,
      'certificateEmail',
      [
        {
          filename: `${data.credentialId}.pdf`,
          content: data.pdfBuffer,
          contentType: 'application/pdf'
        }
      ],
      cred?.id
    );
  }

  async sendPasswordResetEmail(data: { to: string; adminName: string; resetLink: string }): Promise<void> {
    const html = EmailTemplates.passwordReset(data);
    await this.sendEmailWithLog(
      data.to,
      'IUCB Dashboard Reset Password Requested',
      html,
      'forgot-password'
    );
  }

  async sendGenericEmail(data: { to: string; subject: string; body: string }): Promise<void> {
    await this.sendEmailWithLog(
      data.to,
      data.subject,
      `<div style="font-family: Arial, sans-serif;">${data.body.replace(/\n/g, '<br/>')}</div>`,
      'generic'
    );
  }
}

export const EmailService = new EmailServiceClass();

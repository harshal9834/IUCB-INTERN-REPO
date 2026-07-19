import { PrismaClient } from '@prisma/client';
import { ParsedExcelRow } from './excel-parser.service.js';
import { credentialGeneratorService } from './credential-generator.service.js';
import { certificateGeneratorService } from './certificate-generator.service.js';
import { emailDispatcherService, EmailConfig } from './email-dispatcher.service.js';

const prisma = new PrismaClient();

export class BulkEmailService {
  /**
   * Step 3 & 4: Generate Credentials & Certificates
   */
  public async generateCampaign(
    campaignId: string,
    rows: ParsedExcelRow[],
    templateHtml: string,
    baseUrl: string
  ): Promise<string> {
    
    // upsert — create if new campaignId, update if somehow retried with same ID
    const campaign = await prisma.bulkEmailCampaign.upsert({
      where: { campaignId },
      create: {
        campaignId,
        templateHtml,
        totalRecipients: rows.length,
        status: 'PROCESSING'
      },
      update: {
        templateHtml,
        totalRecipients: rows.length,
        status: 'PROCESSING',
        credentialsGenerated: 0,
        certificatesGenerated: 0,
        emailsSent: 0,
        failedEmails: 0
      }
    });

    let credentialsGenerated = 0;
    let certificatesGenerated = 0;

    for (const row of rows) {
      try {
        // Generate system fields
        const sysFields = await credentialGeneratorService.generateFields(baseUrl);
        
        // Merge row data and system fields for placeholder replacement
        const combinedData = {
          ...row,
          'Credential ID': sysFields.credentialId,
          'Certificate ID': sysFields.certificateId,
          'Registration Number': sysFields.registrationNumber,
          'Verification Token': sysFields.verificationToken,
          'Verification URL': sysFields.verificationUrl,
          'QR_CODE': sysFields.qrCode,
          'Issue Date': sysFields.issueDate.toLocaleDateString(),
          'Expiry Date': sysFields.expiryDate.toLocaleDateString(),
          'Certificate Status': 'VALID',
          'Campaign ID': campaignId,
          'Created Date': new Date().toLocaleDateString(),
          'Created Time': new Date().toLocaleTimeString()
        };

        // Populate HTML and Generate PDF
        const populatedHtml = certificateGeneratorService.populateTemplate(templateHtml, combinedData);
        const { pdfPath, pdfFileName } = await certificateGeneratorService.generatePdf(
          campaignId,
          row.candidateName,
          populatedHtml
        );
        certificatesGenerated++;

        // Save credential to DB inside transaction (could optimize to bulk insert, 
        // but since we generate individual PDFs we'll do it sequentially for safety)
        await prisma.bulkEmailCredential.create({
          data: {
            campaignId: campaign.id,
            candidateName: row.candidateName,
            email: row.email,
            instituteName: row.instituteName,
            
            credentialId: sysFields.credentialId,
            certificateId: sysFields.certificateId,
            registrationNumber: sysFields.registrationNumber,
            verificationToken: sysFields.verificationToken,
            verificationUrl: sysFields.verificationUrl,
            qrCode: sysFields.qrCode,
            issueDate: sysFields.issueDate,
            expiryDate: sysFields.expiryDate,
            
            pdfPath,
            pdfFileName,
            generatedAt: new Date(),
            status: 'PENDING'
          }
        });
        credentialsGenerated++;

      } catch (err: any) {
        console.error(`Failed to generate for ${row.email}:`, err);
        // Continue with the next row even if one fails
      }
    }

    // Update campaign stats
    await prisma.bulkEmailCampaign.update({
      where: { id: campaign.id },
      data: {
        credentialsGenerated,
        certificatesGenerated,
        status: 'READY_TO_SEND'
      }
    });

    return campaign.id;
  }

  /**
   * Step 5 & 6: Send Emails
   */
  public async sendCampaignEmails(campaignDbId: string, config: EmailConfig): Promise<void> {
    const campaign = await prisma.bulkEmailCampaign.findUnique({
      where: { id: campaignDbId },
      include: { credentials: true }
    });

    if (!campaign) throw new Error('Campaign not found');

    await prisma.bulkEmailCampaign.update({
      where: { id: campaignDbId },
      data: {
        subject: config.subject,
        body: config.body,
        fromName: config.fromName,
        replyTo: config.replyTo,
        status: 'SENDING'
      }
    });

    let emailsSent = 0;
    let failedEmails = 0;

    for (const cred of campaign.credentials) {
      if (cred.status === 'SENT') continue;

      try {
        await prisma.bulkEmailCredential.update({
          where: { id: cred.id },
          data: { status: 'EMAILING' }
        });

        // Reconstruct combined data for email template.
        // We include BOTH the display-name form AND the UPPER_SNAKE form of each
        // field so templates using either convention resolve correctly.
        const combinedData: Record<string, string> = {
          // Display-name forms
          'Candidate Name':      cred.candidateName,
          'Email':               cred.email,
          'Institute Name':      cred.instituteName,
          'Credential ID':       cred.credentialId,
          'Certificate ID':      cred.certificateId,
          'Registration Number': cred.registrationNumber,
          'Verification Token':  cred.verificationToken,
          'Verification URL':    cred.verificationUrl,
          'Issue Date':          cred.issueDate.toLocaleDateString(),
          'Expiry Date':         cred.expiryDate.toLocaleDateString(),
          'Campaign ID':         campaign.campaignId,
          // UPPER_SNAKE_CASE aliases (template may use either form)
          'CANDIDATE_NAME':      cred.candidateName,
          'EMAIL':               cred.email,
          'INSTITUTE_NAME':      cred.instituteName,
          'CREDENTIAL_ID':       cred.credentialId,
          'CERTIFICATE_ID':      cred.certificateId,
          'REGISTRATION_NUMBER': cred.registrationNumber,
          'VERIFICATION_TOKEN':  cred.verificationToken,
          'VERIFICATION_URL':    cred.verificationUrl,
          'ISSUE_DATE':          cred.issueDate.toLocaleDateString(),
          'EXPIRY_DATE':         cred.expiryDate.toLocaleDateString(),
          'CAMPAIGN_ID':         campaign.campaignId,
        };

        if (cred.pdfPath && cred.pdfFileName) {
          await emailDispatcherService.sendEmailWithCertificate(
            cred.email,
            config,
            combinedData,
            cred.pdfPath,
            cred.pdfFileName
          );

          await prisma.bulkEmailCredential.update({
            where: { id: cred.id },
            data: { status: 'SENT' }
          });
          emailsSent++;
        } else {
          throw new Error('PDF not generated for this credential');
        }
      } catch (err: any) {
        console.error(`Email send failed for ${cred.email}:`, err);
        await prisma.bulkEmailCredential.update({
          where: { id: cred.id },
          data: { status: 'FAILED', errorMessage: err.message }
        });
        failedEmails++;
      }
    }

    await prisma.bulkEmailCampaign.update({
      where: { id: campaignDbId },
      data: {
        emailsSent,
        failedEmails,
        status: 'COMPLETED'
      }
    });
  }

  public async getCampaignReport(campaignDbId: string) {
    const campaign = await prisma.bulkEmailCampaign.findUnique({
      where: { id: campaignDbId },
      include: {
        credentials: {
          select: {
            candidateName: true,
            email: true,
            status: true,
            errorMessage: true,
            pdfPath: true
          }
        }
      }
    });
    return campaign;
  }
}

export const bulkEmailService = new BulkEmailService();

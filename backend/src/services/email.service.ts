import nodemailer from "nodemailer";
import prisma from "../config/Database.js";

const isSMTPConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const transporter = isSMTPConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const MAIL_FROM = process.env.MAIL_FROM ?? "IUCB Platform <noreply@iucb.org>";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function sendMail({
  to,
  subject,
  html,
  template,
  attachments,
  credentialId,
}: {
  to: string;
  subject: string;
  html: string;
  template: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
  credentialId?: string;
}): Promise<{ messageId?: string; smtpResponse?: string }> {
  let status = "SENT";
  let errorMessage: string | undefined;
  let messageId: string | undefined;
  let smtpResponse: string | undefined;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: MAIL_FROM,
        to,
        subject,
        html,
        attachments,
      });
      messageId = info.messageId;
      smtpResponse = info.response;
    } catch (err: any) {
      status = "FAILED";
      errorMessage = err?.message ?? "Unknown SMTP error";
      console.error(`[EmailService] Failed to send email to ${to}:`, err?.message);
    }
  } else {
    console.log(
      `[EmailService] SMTP not configured — logging email only. To: ${to} | Subject: ${subject}`,
    );
  }

  // Always log to DB regardless of SMTP status
  await prisma.emailLog.create({
    data: {
      recipient: to,
      subject: subject,
      template: template,
      status,
      errorMessage,
      ...(credentialId ? { credentialId } : {}),
    },
  });

  return { messageId, smtpResponse };
}

// ─── Shared Template Wrapper ─────────────────────────────────────────────────

function wrapTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6f9; margin:0; padding:0; }
        .container { max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
        .header { background:#0F2942; padding:30px 40px; text-align:center; }
        .header img { height:40px; margin-bottom:10px; }
        .header h1 { color:#ffffff; font-size:22px; margin:0; letter-spacing:1px; }
        .header p { color:#90adc4; font-size:12px; margin:4px 0 0; }
        .body { padding:36px 40px; color:#2d3748; }
        .body h2 { font-size:20px; margin-bottom:8px; color:#0F2942; }
        .body p { font-size:15px; line-height:1.7; color:#4a5568; margin:0 0 16px; }
        .badge { display:inline-block; padding:6px 16px; border-radius:50px; font-size:13px; font-weight:600; }
        .badge-approved { background:#d1fae5; color:#065f46; }
        .badge-rejected { background:#fee2e2; color:#991b1b; }
        .info-table { width:100%; border-collapse:collapse; margin:20px 0; }
        .info-table td { padding:10px 14px; font-size:14px; border-bottom:1px solid #e2e8f0; }
        .info-table td:first-child { font-weight:600; color:#718096; width:40%; }
        .cta { display:block; background:#0F2942; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-size:15px; font-weight:600; text-align:center; margin:24px 0; }
        .footer { background:#f7fafc; padding:20px 40px; text-align:center; border-top:1px solid #e2e8f0; }
        .footer p { font-size:12px; color:#a0aec0; margin:0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>IUCB</h1>
          <p>International Union for Certification Bodies</p>
        </div>
        <div class="body">${content}</div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} International Union for Certification Bodies. All rights reserved.</p>
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const EmailService = {
  /**
   * Sent when an application is successfully submitted.
   */
  async sendSubmissionConfirmationEmail(opts: {
    to: string;
    applicantName: string;
    applicationType: string;
    applicationNumber: string;
  }) {
    const html = wrapTemplate(`
      <h2>Application Received</h2>
      <p>Dear ${opts.applicantName},</p>
      <p>
        Thank you for submitting your <strong>${opts.applicationType}</strong> application to the IUCB.
      </p>
      <table class="info-table">
        <tr><td>Application Number</td><td>${opts.applicationNumber}</td></tr>
        <tr><td>Current Status</td><td>Pending Review</td></tr>
      </table>
      <p>
        Your application is currently under review by our accreditation committee. We will notify you of any updates via this email.
      </p>
      <p>Thank you for choosing IUCB.</p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Application Received — ${opts.applicationType}`,
      html,
      template: "SUBMISSION_CONFIRMATION",
    });
  },

  /**
   * Sent when an Organization application is approved.
   */
  async sendApprovalEmail(opts: {
    to: string;
    applicantName: string;
    applicationType: string;
    applicationNumber?: string;
  }) {
    const html = wrapTemplate(`
      <h2>Congratulations, ${opts.applicantName}!</h2>
      <p>
        We are pleased to inform you that your <strong>${opts.applicationType}</strong> application 
        has been <span class="badge badge-approved">Approved</span> by the IUCB Accreditation Committee.
      </p>
      ${opts.applicationNumber ? `<table class="info-table"><tr><td>Application Number</td><td>${opts.applicationNumber}</td></tr></table>` : ""}
      <p>
        Your credentials and official accreditation documents will be issued shortly. 
        Our team may reach out via this email address with further instructions.
      </p>
      <p>Welcome to the IUCB accredited family.</p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Application Approved — ${opts.applicationType}`,
      html,
      template: "APPROVAL_EMAIL",
    });
  },

  /**
   * Sent when an application is rejected.
   */
  async sendRejectionEmail(opts: {
    to: string;
    applicantName: string;
    applicationType: string;
    reason?: string;
  }) {
    const html = wrapTemplate(`
      <h2>Application Update</h2>
      <p>Dear ${opts.applicantName},</p>
      <p>
        After careful review, we regret to inform you that your <strong>${opts.applicationType}</strong> application 
        was <span class="badge badge-rejected">Not Approved</span> at this time.
      </p>
      ${opts.reason ? `<p><strong>Reason:</strong> ${opts.reason}</p>` : ""}
      <p>
        We encourage you to review the IUCB accreditation requirements and consider reapplying 
        once the criteria have been met. If you have questions, please contact us at 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Application Status Update`,
      html,
      template: "REJECTION_EMAIL",
    });
  },

  /**
   * Sent to Advisory Board members upon approval.
   */
  async sendWelcomeEmail(opts: {
    to: string;
    applicantName: string;
    role: string;
    applicationNumber?: string;
  }) {
    const html = wrapTemplate(`
      <h2>Congratulations, ${opts.applicantName}!</h2>
      <p>
        Your application for the <strong>IUCB Advisory Board</strong> has been 
        <span class="badge badge-approved">Approved</span>.
      </p>
      ${opts.applicationNumber ? `<table class="info-table"><tr><td>Application Number</td><td>${opts.applicationNumber}</td></tr><tr><td>Membership Role</td><td>${opts.role}</td></tr><tr><td>Status</td><td>Active Advisory Member</td></tr></table>` : ""}
      <p>
        We are thrilled to welcome you as a distinguished member of the International Union for Certification Bodies Advisory Board.
        Your expertise and experience will play a vital role in shaping international certification standards.
      </p>
      <p>
        <strong>Next Steps:</strong> Our executive team will reach out with details regarding upcoming board sessions and committee assignments.
      </p>
      <p>Welcome to the IUCB Advisory Board.</p>
    `);
    await sendMail({
      to: opts.to,
      subject: "Your IUCB Advisory Board Application Has Been Approved",
      html,
      template: "ADVISORY_APPROVAL_EMAIL",
    });
  },

  /**
   * Sent when an Advisory Board member is suspended.
   */
  async sendAdvisorySuspensionEmail(opts: {
    to: string;
    memberName: string;
    reason?: string;
  }) {
    const html = wrapTemplate(`
      <h2>Advisory Board Membership Notice</h2>
      <p>Dear ${opts.memberName},</p>
      <p>
        This is an official notification that your IUCB Advisory Board membership status has been set to 
        <span class="badge badge-rejected">Suspended</span> effective immediately.
      </p>
      ${opts.reason ? `<p><strong>Reason:</strong> ${opts.reason}</p>` : ""}
      <p>
        Effective Date: <strong>${new Date().toLocaleDateString()}</strong>
      </p>
      <p>
        If you have any questions or wish to appeal this status update, please contact our support team at 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: "Notice of Advisory Board Membership Suspension — IUCB",
      html,
      template: "ADVISORY_SUSPENSION_EMAIL",
    });
  },

  /**
   * Sent when an Advisory Board member status is set to Inactive / Deactivated.
   */
  async sendAdvisoryDeactivationEmail(opts: {
    to: string;
    memberName: string;
    reason?: string;
  }) {
    const html = wrapTemplate(`
      <h2>Advisory Board Membership Status Change</h2>
      <p>Dear ${opts.memberName},</p>
      <p>
        Your IUCB Advisory Board membership status has been updated to <strong>Inactive</strong>.
      </p>
      ${opts.reason ? `<p><strong>Reason / Remarks:</strong> ${opts.reason}</p>` : ""}
      <p>
        Thank you for your service to the IUCB. For any inquiries, please contact 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: "Notice of Advisory Board Membership Status Change — IUCB",
      html,
      template: "ADVISORY_DEACTIVATION_EMAIL",
    });
  },

  /**
   * Sent when an Advisory Board membership is revoked.
   */
  async sendAdvisoryRevocationEmail(opts: {
    to: string;
    memberName: string;
    reason?: string;
  }) {
    const html = wrapTemplate(`
      <h2>Notice of Membership Revocation</h2>
      <p>Dear ${opts.memberName},</p>
      <p>
        Please be advised that your appointment to the IUCB Advisory Board has been 
        <span class="badge badge-rejected">Revoked</span>.
      </p>
      ${opts.reason ? `<p><strong>Reason:</strong> ${opts.reason}</p>` : ""}
      <p>
        If you require further information, please contact our office at 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: "Notice of Advisory Board Membership Revocation — IUCB",
      html,
      template: "ADVISORY_REVOCATION_EMAIL",
    });
  },

  /**
   * Sent when an Advisory Board member is reactivated.
   */
  async sendAdvisoryReactivationEmail(opts: {
    to: string;
    memberName: string;
  }) {
    const html = wrapTemplate(`
      <h2>Welcome Back to IUCB Advisory Board</h2>
      <p>Dear ${opts.memberName},</p>
      <p>
        We are pleased to inform you that your IUCB Advisory Board membership status has been 
        <span class="badge badge-approved">Reactivated</span>.
      </p>
      <p>
        Your profile is once again active. We look forward to your continued participation and guidance.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: "Your IUCB Advisory Board Membership Has Been Reactivated",
      html,
      template: "ADVISORY_REACTIVATION_EMAIL",
    });
  },

  /**
   * Sent when an Organization status is updated (ACTIVE, SUSPENDED, REVOKED).
   */
  async sendOrganizationStatusEmail(opts: {
    to: string;
    orgName: string;
    status: string;
    reason?: string;
  }) {
    const isPositive = opts.status === "ACTIVE";
    const badgeClass = isPositive ? "badge-approved" : "badge-rejected";
    const html = wrapTemplate(`
      <h2>Accreditation Status Update</h2>
      <p>Dear ${opts.orgName},</p>
      <p>
        The accreditation status for <strong>${opts.orgName}</strong> has been updated to 
        <span class="badge ${badgeClass}">${opts.status}</span>.
      </p>
      ${opts.reason ? `<p><strong>Remarks / Reason:</strong> ${opts.reason}</p>` : ""}
      <p>Effective Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      <p>
        If you have any questions or require further assistance, please contact our support team at 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Accreditation Status Update — ${opts.status}`,
      html,
      template: "ORGANIZATION_STATUS_UPDATE",
    });
  },

  /**
   * Sent when an Auditor status is updated (ACTIVE, SUSPENDED, REVOKED, INACTIVE).
   */
  async sendAuditorStatusEmail(opts: {
    to: string;
    auditorName: string;
    status: string;
    reason?: string;
  }) {
    const isPositive = opts.status === "ACTIVE";
    const badgeClass = isPositive ? "badge-approved" : "badge-rejected";
    const html = wrapTemplate(`
      <h2>Auditor Registration Status Update</h2>
      <p>Dear ${opts.auditorName},</p>
      <p>
        Your IUCB Auditor registration status has been updated to 
        <span class="badge ${badgeClass}">${opts.status}</span>.
      </p>
      ${opts.reason ? `<p><strong>Remarks / Reason:</strong> ${opts.reason}</p>` : ""}
      <p>Effective Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      <p>
        For inquiries regarding your certification status, please contact 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Auditor Status Update — ${opts.status}`,
      html,
      template: "AUDITOR_STATUS_UPDATE",
    });
  },

  /**
   * Sent when a Training Institute status is updated (ACTIVE, SUSPENDED, REVOKED).
   */
  async sendTrainingInstituteStatusEmail(opts: {
    to: string;
    instituteName: string;
    status: string;
    reason?: string;
  }) {
    const isPositive = opts.status === "ACTIVE";
    const badgeClass = isPositive ? "badge-approved" : "badge-rejected";
    const html = wrapTemplate(`
      <h2>Training Institute Status Update</h2>
      <p>Dear ${opts.instituteName},</p>
      <p>
        The status for Training Institute <strong>${opts.instituteName}</strong> has been set to 
        <span class="badge ${badgeClass}">${opts.status}</span>.
      </p>
      ${opts.reason ? `<p><strong>Remarks / Reason:</strong> ${opts.reason}</p>` : ""}
      <p>Effective Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      <p>
        For questions or appeals, please contact our support team at 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Training Institute Status Update — ${opts.status}`,
      html,
      template: "TRAINING_INSTITUTE_STATUS_UPDATE",
    });
  },

  /**
   * Sent when a Credential status is updated (VALID, SUSPENDED, REVOKED, EXPIRED).
   */
  async sendCredentialStatusEmail(opts: {
    to: string;
    recipientName: string;
    credentialId: string;
    status: string;
    reason?: string;
  }) {
    const isPositive = opts.status === "VALID" || opts.status === "ACTIVE";
    const badgeClass = isPositive ? "badge-approved" : "badge-rejected";
    const html = wrapTemplate(`
      <h2>Credential Status Update</h2>
      <p>Dear ${opts.recipientName},</p>
      <p>
        The status of your IUCB Credential (<strong>${opts.credentialId}</strong>) has been updated to 
        <span class="badge ${badgeClass}">${opts.status}</span>.
      </p>
      ${opts.reason ? `<p><strong>Remarks / Reason:</strong> ${opts.reason}</p>` : ""}
      <p>Effective Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      <p>
        You can verify credential details on the IUCB Portal or contact 
        <a href="mailto:accreditation@iucb.org">accreditation@iucb.org</a>.
      </p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Credential Status Update — ${opts.credentialId}`,
      html,
      template: "CREDENTIAL_STATUS_UPDATE",
    });
  },

  /**
   * Sent to Admin when a user submits the Contact Us form on the website.
   */
  async sendContactMessageToAdmin(opts: {
    name: string;
    email: string;
    org?: string;
    subject: string;
    message: string;
  }) {
    let adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM || "admin@iucb.org";
    try {
      const admin = await prisma.admin.findFirst({
        where: { status: "ACTIVE" },
        select: { email: true },
        orderBy: { createdAt: "asc" },
      });
      if (admin?.email) {
        adminEmail = admin.email;
      }
    } catch (e) {
      console.log("[EmailService] Failed to fetch admin email from DB, fallback to:", adminEmail);
    }

    const html = wrapTemplate(`
      <h2>New Contact Form Inquiry</h2>
      <p>A new contact message has been submitted on the IUCB website.</p>
      <table class="info-table">
        <tr><td>Sender Name</td><td>${opts.name}</td></tr>
        <tr><td>Sender Email</td><td><a href="mailto:${opts.email}">${opts.email}</a></td></tr>
        ${opts.org ? `<tr><td>Organization</td><td>${opts.org}</td></tr>` : ""}
        <tr><td>Subject</td><td>${opts.subject}</td></tr>
        <tr><td>Timestamp</td><td>${new Date().toLocaleString()}</td></tr>
      </table>
      <div style="background: #f8fafc; border-left: 4px solid #0F2942; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="font-weight: 600; color: #0F2942; margin-bottom: 8px;">Message:</p>
        <p style="white-space: pre-wrap; color: #4a5568; line-height: 1.6; margin: 0;">${opts.message}</p>
      </div>
      <p style="font-size: 13px; color: #718096;">
        You can reply directly to the sender at <a href="mailto:${opts.email}">${opts.email}</a>.
      </p>
    `);

    await sendMail({
      to: adminEmail,
      subject: `[IUCB Website Inquiry] ${opts.subject}`,
      html,
      template: "CONTACT_FORM_SUBMISSION",
    });
  },

  /**
   * Future: Certificate issuance email.
   */
  async sendCertificateEmail(opts: {
    to: string;
    applicantName: string;
    credentialId: string;
    issueDate: string;
    expiryDate: string;
    verificationLink: string;
    pdfBuffer: Buffer;
    customMessage?: string;
  }) {
    // Convert the plain text customMessage to basic HTML if provided
    const customMessageHtml = opts.customMessage
      ? opts.customMessage.replace(/\n/g, '<br/>')
      : `<p>Dear ${opts.applicantName},</p>
         <p>Congratulations. Your accreditation has been formally approved and your credential has been generated.</p>
         <p>Attached to this email is your official IUCB Certificate.</p>`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0F2942;">IUCB Accreditation Certificate</h2>
        ${customMessageHtml}
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 5px 0;"><strong>Credential ID:</strong> ${opts.credentialId}</p>
          <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${opts.issueDate}</p>
          <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${opts.expiryDate}</p>
        </div>
        <p>You can verify this credential publicly at any time using the following link:</p>
        <p><a href="${opts.verificationLink}" style="color: #2563eb; text-decoration: none;">${opts.verificationLink}</a></p>
        <br/>
        <p>Regards,<br/><strong>IUCB Accreditation Authority</strong></p>
      </div>
    `;

    await sendMail({
      to: opts.to,
      subject: "IUCB Accreditation Certificate",
      html,
      template: "CERTIFICATE_EMAIL",
      attachments: [
        {
          filename: "IUCB_Certificate.pdf",
          content: opts.pdfBuffer,
        },
      ],
    });
  },

  /**
   * Password Reset email.
   */
  async sendPasswordResetEmail(opts: {
    to: string;
    resetLink: string;
  }) {
    const html = wrapTemplate(`
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your IUCB Admin Portal password.</p>
      <a href="${opts.resetLink}" class="cta">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `);
    await sendMail({
      to: opts.to,
      subject: `IUCB Admin Portal — Password Reset`,
      html,
      template: "PASSWORD_RESET_EMAIL",
    });
  },

  /**
   * Generic email for custom messages (e.g., from Email Composer).
   */
  async sendGenericEmail(opts: {
    to: string;
    subject: string;
    htmlContent: string;
  }) {
    const html = wrapTemplate(opts.htmlContent);
    await sendMail({
      to: opts.to,
      subject: opts.subject,
      html,
      template: "GENERIC_EMAIL",
    });
  },

  /**
   * Training Institute Certificate email.
   * Throws if SMTP fails so the caller can mark status as FAILED.
   * Returns real messageId and smtpResponse from Nodemailer.
   */
  async sendTrainingInstituteCertificateEmail(opts: {
    to: string;
    candidateName: string;
    instituteName: string;
    credentialId: string;
    issueDate: string;
    expiryDate: string;
    verificationUrl: string;
    pdfBuffer: Buffer;
  }): Promise<{ messageId: string | undefined; smtpResponse: string | undefined }> {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #f4f6f9; padding: 0;">
        <div style="background: #0F2942; padding: 30px 40px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0; letter-spacing: 1px;">IUCB</h1>
          <p style="color: #90adc4; font-size: 12px; margin: 4px 0 0;">International Union for Certification & Benchmarking</p>
        </div>
        <div style="background: #ffffff; padding: 36px 40px;">
          <h2 style="color: #0F2942; font-size: 20px; margin-bottom: 8px;">IUCB Accreditation Certificate</h2>
          <p style="font-size: 15px; line-height: 1.7; color: #4a5568;">Dear ${opts.candidateName},</p>
          <p style="font-size: 15px; line-height: 1.7; color: #4a5568;">
            Congratulations! Your Training Institute <strong>${opts.instituteName}</strong> has successfully
            completed the IUCB accreditation process.
          </p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Credential ID:</strong> ${opts.credentialId}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Issue Date:</strong> ${opts.issueDate}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Valid Until:</strong> ${opts.expiryDate}</p>
          </div>
          <p style="font-size: 14px; color: #4a5568;">
            Please find your official accreditation certificate attached to this email.
            You can also verify this credential at:
            <a href="${opts.verificationUrl}" style="color: #2563eb; text-decoration: none;">${opts.verificationUrl}</a>
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #4a5568; margin-top: 24px;">
            Regards,<br/><strong>IUCB Accreditation Authority</strong>
          </p>
        </div>
        <div style="background: #f7fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #a0aec0; margin: 0;">
            © ${new Date().getFullYear()} International Union for Certification & Benchmarking. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // This is the critical path — throw on SMTP failure
    // so the caller stores FAILED status (never fake SENT)
    if (!transporter) {
      console.log(
        `[EmailService][TI] SMTP not configured — skipping send for ${opts.to}`
      );
      return { messageId: undefined, smtpResponse: undefined };
    }

    try {
      const info = await transporter.sendMail({
        from: MAIL_FROM,
        to: opts.to,
        subject: "IUCB Accreditation Certificate",
        html,
        attachments: [
          {
            filename: `IUCB_Certificate_${opts.credentialId}.pdf`,
            content: opts.pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      // Log to DB as SENT
      await prisma.emailLog.create({
        data: {
          recipient: opts.to,
          subject: "IUCB Accreditation Certificate",
          template: "TI_CERTIFICATE_EMAIL",
          status: "SENT",
        },
      });

      return {
        messageId: info.messageId,
        smtpResponse: info.response,
      };
    } catch (err: any) {
      console.error(`Error sending email to ${opts.to}:`, err?.message || 'Unknown error');
      throw err;
    }
  },
};

export default EmailService;

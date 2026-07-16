export const EmailTemplates = {
  submissionConfirmation: (data: { applicantName: string; applicationType: string; applicationNumber: string }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F2942; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Application Received</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.applicantName},</p>
        <p>Thank you for submitting your application to the International University Certification Board (IUCB).</p>
        <p>We have successfully received your <strong>${data.applicationType}</strong> application.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #0F2942;">Application Number: ${data.applicationNumber}</p>
        </div>
        <p>Our review team will process your application shortly. You will be notified once a decision has been made or if further information is required.</p>
        <p>Best regards,<br/><strong>The IUCB Team</strong></p>
      </div>
      <div style="background-color: #f1f5f9; color: #64748b; text-align: center; padding: 15px; font-size: 12px;">
        &copy; ${new Date().getFullYear()} IUCB. All rights reserved.
      </div>
    </div>
  `,

  welcomeEmail: (data: { applicantName: string; role: string }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F2942; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Welcome to IUCB</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.applicantName},</p>
        <p>Congratulations! Your application has been approved, and we are thrilled to welcome you as a <strong>${data.role}</strong>.</p>
        <p>You now have access to the IUCB network and resources. If you have any immediate questions or need assistance setting up your profile, please reach out to our support team.</p>
        <p>Best regards,<br/><strong>The IUCB Team</strong></p>
      </div>
      <div style="background-color: #f1f5f9; color: #64748b; text-align: center; padding: 15px; font-size: 12px;">
        &copy; ${new Date().getFullYear()} IUCB. All rights reserved.
      </div>
    </div>
  `,

  approvalEmail: (data: { applicantName: string; applicationType: string; applicationNumber?: string }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F2942; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Application Approved</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.applicantName},</p>
        <p>We are pleased to inform you that your <strong>${data.applicationType}</strong> application ${data.applicationNumber ? `(${data.applicationNumber}) ` : ""}has been officially <strong>approved</strong> by the International University Certification Board.</p>
        <p>Your official credentials and certification documents will be processed and sent to you shortly.</p>
        <p>Best regards,<br/><strong>The IUCB Team</strong></p>
      </div>
      <div style="background-color: #f1f5f9; color: #64748b; text-align: center; padding: 15px; font-size: 12px;">
        &copy; ${new Date().getFullYear()} IUCB. All rights reserved.
      </div>
    </div>
  `,

  rejectionEmail: (data: { applicantName: string; applicationType: string; reason?: string }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F2942; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Application Update</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.applicantName},</p>
        <p>Thank you for your interest in the International University Certification Board and for submitting your <strong>${data.applicationType}</strong> application.</p>
        <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        ${data.reason ? `
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; color: #991b1b;">
          <strong>Reason for decision:</strong><br/>
          ${data.reason}
        </div>
        ` : ''}
        <p>You may reapply in the future once the above concerns have been addressed.</p>
        <p>Best regards,<br/><strong>The IUCB Team</strong></p>
      </div>
      <div style="background-color: #f1f5f9; color: #64748b; text-align: center; padding: 15px; font-size: 12px;">
        &copy; ${new Date().getFullYear()} IUCB. All rights reserved.
      </div>
    </div>
  `,

  certificateEmail: (data: { applicantName: string; credentialId: string; issueDate: string; expiryDate: string; verificationLink: string; customMessage?: string }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F2942; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Your Official IUCB Certificate</h2>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.applicantName},</p>
        ${data.customMessage ? `<p>${data.customMessage.replace(/\n/g, '<br/>')}</p>` : `<p>Congratulations! Please find attached your official IUCB Certificate.</p>`}
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #0F2942; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Credential Details</h3>
          <p style="margin: 10px 0 5px;"><strong>Credential ID:</strong> ${data.credentialId}</p>
          <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${data.issueDate}</p>
          <p style="margin: 5px 0 15px;"><strong>Expiry Date:</strong> ${data.expiryDate}</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${data.verificationLink}" style="background-color: #10b981; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Certificate Online</a>
          </div>
        </div>
        
        <p>Best regards,<br/><strong>The IUCB Team</strong></p>
      </div>
      <div style="background-color: #f1f5f9; color: #64748b; text-align: center; padding: 15px; font-size: 12px;">
        &copy; ${new Date().getFullYear()} IUCB. All rights reserved.
      </div>
    </div>
  `,

  passwordReset: (data: { adminName: string; resetLink: string }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F2942; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Password Reset Request</h2>
      </div>
      <div style="padding: 30px;">
        <p>Hello ${data.adminName},</p>
        <p>We received a request to reset the password for your IUCB Admin account.</p>
        <p>If you made this request, please click the button below to set a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetLink}" style="background-color: #3b82f6; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <p style="font-size: 13px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${data.resetLink}" style="color: #3b82f6; word-break: break-all;">${data.resetLink}</a>
        </p>
      </div>
    </div>
  `
};

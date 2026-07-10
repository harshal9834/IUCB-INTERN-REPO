import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import QRCode from 'qrcode';

export interface GeneratedCredentialFields {
  credentialId: string;
  certificateId: string;
  registrationNumber: string;
  verificationToken: string;
  verificationUrl: string;
  qrCode: string;
  issueDate: Date;
  expiryDate: Date;
}

export class CredentialGeneratorService {
  private generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length)
      .toUpperCase();
  }

  public async generateFields(baseUrl: string): Promise<GeneratedCredentialFields> {
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(issueDate.getFullYear() + 3); // 3 years validity by default

    // Format: C-YYYY-XXXXXXXX
    const year = issueDate.getFullYear();
    const credentialId = `C-${year}-${this.generateRandomString(8)}`;
    const certificateId = `CERT-${year}-${this.generateRandomString(8)}`;
    const registrationNumber = `REG-${year}-${this.generateRandomString(6)}`;
    
    const verificationToken = uuidv4();
    const verificationUrl = `${baseUrl}/verify/${credentialId}`;

    // Generate QR Code as Data URI
    let qrCode = '';
    try {
      qrCode = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 150
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
    }

    return {
      credentialId,
      certificateId,
      registrationNumber,
      verificationToken,
      verificationUrl,
      qrCode,
      issueDate,
      expiryDate
    };
  }
}

export const credentialGeneratorService = new CredentialGeneratorService();

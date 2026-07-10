import PDFDocument from "pdfkit";

export interface CertificateData {
  candidateName: string;
  instituteName: string;
  credentialId: string;
  issueDate: string;
  expiryDate: string;
  verificationUrl: string;
}

/**
 * Training Institute Certificate Generator
 * Generates a professional PDF certificate for IUCB Training Institute accreditation.
 */
export class TiCertificateService {
  /**
   * Generate a PDF certificate buffer for a training institute recipient.
   */
  static async generateCertificatePDF(data: CertificateData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margins: { top: 40, bottom: 40, left: 60, right: 60 },
        });

        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const centerX = pageWidth / 2;

        // ─── Background ──────────────────────────────────────────────────────
        doc.rect(0, 0, pageWidth, pageHeight).fill("#0F2942");

        // Inner white panel
        doc
          .roundedRect(30, 30, pageWidth - 60, pageHeight - 60, 12)
          .fill("#ffffff");

        // Top accent bar
        doc.rect(30, 30, pageWidth - 60, 8).fill("#10b981");

        // Bottom accent bar
        doc
          .rect(30, pageHeight - 38, pageWidth - 60, 8)
          .fill("#10b981");

        // ─── IUCB Header ─────────────────────────────────────────────────────
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#10b981")
          .text("INTERNATIONAL UNION FOR CERTIFICATION & BENCHMARKING", 0, 58, {
            align: "center",
            width: pageWidth,
          });

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#6b7280")
          .text("www.iucb.org  ·  accreditation@iucb.org", 0, 74, {
            align: "center",
            width: pageWidth,
          });

        // Divider
        doc
          .moveTo(centerX - 120, 92)
          .lineTo(centerX + 120, 92)
          .lineWidth(0.5)
          .strokeColor("#d1d5db")
          .stroke();

        // ─── Certificate Title ────────────────────────────────────────────────
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#6b7280")
          .text("CERTIFICATE OF ACCREDITATION", 0, 105, {
            align: "center",
            width: pageWidth,
            characterSpacing: 3,
          });

        // ─── Decorative lines ─────────────────────────────────────────────────
        doc
          .moveTo(centerX - 200, 122)
          .lineTo(centerX - 20, 122)
          .lineWidth(1)
          .strokeColor("#10b981")
          .stroke();

        doc
          .moveTo(centerX + 20, 122)
          .lineTo(centerX + 200, 122)
          .lineWidth(1)
          .strokeColor("#10b981")
          .stroke();

        // Diamond
        doc
          .polygon(
            [centerX, 115],
            [centerX + 8, 122],
            [centerX, 129],
            [centerX - 8, 122]
          )
          .fill("#10b981");

        // ─── "This is to certify that" ────────────────────────────────────────
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#4b5563")
          .text("This is to certify that", 0, 142, {
            align: "center",
            width: pageWidth,
          });

        // ─── Candidate Name ───────────────────────────────────────────────────
        doc
          .font("Helvetica-Bold")
          .fontSize(26)
          .fillColor("#0F2942")
          .text(data.candidateName, 0, 160, {
            align: "center",
            width: pageWidth,
          });

        // ─── "representing" ───────────────────────────────────────────────────
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#4b5563")
          .text("representing", 0, 200, {
            align: "center",
            width: pageWidth,
          });

        // ─── Institute Name ───────────────────────────────────────────────────
        doc
          .font("Helvetica-Bold")
          .fontSize(18)
          .fillColor("#10b981")
          .text(data.instituteName, 0, 218, {
            align: "center",
            width: pageWidth,
          });

        // ─── Body text ────────────────────────────────────────────────────────
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#4b5563")
          .text(
            "has successfully completed the IUCB accreditation process and has been awarded",
            0,
            252,
            { align: "center", width: pageWidth }
          );

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#0F2942")
          .text("IUCB Training Institute Accreditation", 0, 270, {
            align: "center",
            width: pageWidth,
          });

        // ─── Credential Info Box ──────────────────────────────────────────────
        const boxX = centerX - 220;
        const boxY = 295;
        const boxW = 440;
        const boxH = 52;

        doc
          .roundedRect(boxX, boxY, boxW, boxH, 6)
          .fillAndStroke("#f0fdf4", "#10b981");

        // Credential ID
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#6b7280")
          .text("CREDENTIAL ID", boxX + 30, boxY + 10);

        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("#0F2942")
          .text(data.credentialId, boxX + 30, boxY + 24);

        // Issue Date
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#6b7280")
          .text("ISSUE DATE", boxX + 200, boxY + 10);

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#0F2942")
          .text(data.issueDate, boxX + 200, boxY + 24);

        // Expiry Date
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#6b7280")
          .text("VALID UNTIL", boxX + 310, boxY + 10);

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#0F2942")
          .text(data.expiryDate, boxX + 310, boxY + 24);

        // ─── Verification URL ─────────────────────────────────────────────────
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#6b7280")
          .text(`Verify at: ${data.verificationUrl}`, 0, 360, {
            align: "center",
            width: pageWidth,
          });

        // ─── Signature Section ────────────────────────────────────────────────
        const sigY = 390;

        // Left signature
        doc
          .moveTo(centerX - 200, sigY + 30)
          .lineTo(centerX - 60, sigY + 30)
          .lineWidth(0.75)
          .strokeColor("#9ca3af")
          .stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor("#0F2942")
          .text("Director General", centerX - 210, sigY + 35, { width: 160, align: "center" });

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("#6b7280")
          .text("IUCB International", centerX - 210, sigY + 47, { width: 160, align: "center" });

        // Right signature
        doc
          .moveTo(centerX + 60, sigY + 30)
          .lineTo(centerX + 200, sigY + 30)
          .lineWidth(0.75)
          .strokeColor("#9ca3af")
          .stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor("#0F2942")
          .text("Head of Accreditation", centerX + 50, sigY + 35, { width: 160, align: "center" });

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("#6b7280")
          .text("IUCB Accreditation Authority", centerX + 50, sigY + 47, { width: 160, align: "center" });

        // ─── Bottom info ──────────────────────────────────────────────────────
        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("#9ca3af")
          .text(
            "© " +
              new Date().getFullYear() +
              " International Union for Certification & Benchmarking. All rights reserved.",
            0,
            pageHeight - 48,
            { align: "center", width: pageWidth }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default TiCertificateService;

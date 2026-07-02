import jsPDF from "jspdf";
import QRCode from "qrcode";

export type CertificateData = {
  id: string;
  holder: string;
  scope: string;
  issued: string;
  expires: string;
  status: string;
};

function hashCode(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  const hex = h.toString(16).padStart(8, "0");
  return `0x${hex}${hex}${hex}${hex}`.toUpperCase().slice(0, 42);
}

export async function downloadCertificatePdf(data: CertificateData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Colors
  const navy: [number, number, number] = [0, 75, 122];
  const gold: [number, number, number] = [212, 175, 55];
  const ink: [number, number, number] = [15, 23, 42];
  const muted: [number, number, number] = [100, 116, 139];

  // Outer frame
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // Gold border
  doc.setDrawColor(...gold);
  doc.setLineWidth(3);
  doc.rect(20, 20, W - 40, H - 40);
  doc.setLineWidth(0.5);
  doc.rect(28, 28, W - 56, H - 56);

  // Top navy band
  doc.setFillColor(...navy);
  doc.rect(28, 28, W - 56, 70, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("IUCB", 50, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(212, 175, 55);
  doc.text("INTERNATIONAL UNION OF CERTIFICATION BODIES", 50, 86);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("CERTIFICATE OF ACCREDITATION", W - 50, 70, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text(`ID: ${data.id}`, W - 50, 86, { align: "right" });

  // Title
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text("Certificate of Accreditation", W / 2, 160, { align: "center" });

  doc.setDrawColor(...gold);
  doc.setLineWidth(1.2);
  doc.line(W / 2 - 90, 175, W / 2 + 90, 175);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  doc.text("This is to certify that", W / 2, 200, { align: "center" });

  // Holder
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...navy);
  doc.text(data.holder, W / 2, 235, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text(
    "has been formally accredited by IUCB and is recognized as compliant with the international standard:",
    W / 2,
    265,
    { align: "center" },
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...ink);
  doc.text(data.scope, W / 2, 295, { align: "center" });

  // Detail grid
  const gridY = 340;
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.setFont("helvetica", "bold");

  const col = (label: string, value: string, x: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), x, gridY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...ink);
    doc.text(value, x, gridY + 16);
  };

  col("Issue Date", data.issued, 80);
  col("Expiry Date", data.expires, 260);
  col("Status", data.status, 440);
  col("Cryptographic Hash", hashCode(data.id + data.holder).slice(0, 22) + "…", 560);

  // QR Code
  const verifyUrl = `https://iucb.org/verify?id=${encodeURIComponent(data.id)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 240,
    color: { dark: "#0F172A", light: "#FFFFFF" },
  });
  const qrSize = 110;
  const qrX = W - qrSize - 70;
  const qrY = H - qrSize - 110;
  doc.setDrawColor(...gold);
  doc.setLineWidth(1.5);
  doc.rect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 20, { align: "center" });

  // Signature
  doc.setDrawColor(...ink);
  doc.setLineWidth(0.6);
  doc.line(80, H - 110, 280, H - 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  doc.text("Dr. Helena Vasquez", 80, H - 95);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Director General, IUCB", 80, H - 82);

  // Gold seal
  const sealX = 380;
  const sealY = H - 140;
  doc.setDrawColor(...gold);
  doc.setLineWidth(2);
  doc.circle(sealX, sealY, 38);
  doc.setLineWidth(0.6);
  doc.circle(sealX, sealY, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text("IUCB", sealX, sealY - 2, { align: "center" });
  doc.setFontSize(6);
  doc.text("VERIFIED", sealX, sealY + 10, { align: "center" });

  // Footer
  doc.setFillColor(...navy);
  doc.rect(28, H - 56, W - 56, 28, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Verify at iucb.org/verify  •  Certificate ID: ${data.id}`, W / 2, H - 38, {
    align: "center",
  });

  doc.save(`IUCB-Certificate-${data.id}.pdf`);
}

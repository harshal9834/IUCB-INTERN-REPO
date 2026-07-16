import prisma from "../config/Database.js";

const MODULE_PREFIX_MAP: Record<string, string> = {
  TRAINING_INSTITUTE: "INS",
  ACCREDITATION: "ORG",
  ADVISORY: "ADV",
  AUDITOR: "AUD",
};

export class IdGeneratorService {
  /**
   * Determine module code from application type
   */
  public static getModuleCode(applicationType: string): string {
    return MODULE_PREFIX_MAP[applicationType] || "ORG"; // Default to ORG
  }

  /**
   * Get next sequence number for a given column and prefix using raw SQL.
   * Extracts the trailing 6-digit number from matching IDs in the Credential table.
   */
  private static async getNextSequence(
    column: "credentialId" | "certificateId" | "registrationNumber",
    prefix: string
  ): Promise<string> {
    // Map TypeScript field name → actual PostgreSQL column name (Prisma uses camelCase without @map)
    const colMap: Record<string, string> = {
      credentialId: "credentialId",
      certificateId: "certificateId",
      registrationNumber: "registrationNumber",
    };
    const col = colMap[column];

    // Find the highest trailing 6-digit sequence for this prefix
    const result = await prisma.$queryRawUnsafe<Array<{ max_seq: number | null }>>(
      `SELECT MAX(CAST(SUBSTRING("${col}" FROM '([0-9]{6})$') AS INTEGER)) AS max_seq
       FROM "Credential"
       WHERE "${col}" LIKE $1`,
      `${prefix}%`
    );

    const maxSeq = result[0]?.max_seq ?? 0;
    return String(maxSeq + 1).padStart(6, "0");
  }

  public static async generateCredentialId(applicationType: string): Promise<string> {
    const moduleCode = this.getModuleCode(applicationType);
    const prefix = `IUCB-CRED-${moduleCode}-`;
    const sequence = await this.getNextSequence("credentialId", prefix);
    return `${prefix}${sequence}`;
  }

  public static async generateCertificateId(applicationType: string): Promise<string> {
    const moduleCode = this.getModuleCode(applicationType);
    const prefix = `IUCB-${moduleCode}-`;
    const sequence = await this.getNextSequence("certificateId", prefix);
    return `${prefix}${sequence}`;
  }

  public static async generateRegistrationNumber(applicationType: string): Promise<string> {
    const moduleCode = this.getModuleCode(applicationType);
    const prefix = `IUCB-REG-${moduleCode}-`;
    const sequence = await this.getNextSequence("registrationNumber", prefix);
    return `${prefix}${sequence}`;
  }

  /**
   * Generate all three IDs atomically for a given application type.
   */
  public static async generateAllIds(applicationType: string): Promise<{
    credentialId: string;
    certificateId: string;
    registrationNumber: string;
  }> {
    const [credentialId, certificateId, registrationNumber] = await Promise.all([
      this.generateCredentialId(applicationType),
      this.generateCertificateId(applicationType),
      this.generateRegistrationNumber(applicationType),
    ]);

    return { credentialId, certificateId, registrationNumber };
  }
}

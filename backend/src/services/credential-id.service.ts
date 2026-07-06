import prisma from "../config/Database.js";
import { ApplicationType } from "@prisma/client";

/**
 * IUCB Credential ID Generation Service
 * 
 * Generates sequential credential IDs following IUCB naming convention:
 * - Organizations:     IUCB-ORG-000001, IUCB-ORG-000002, etc.
 * - Auditors:          IUCB-AUD-000001, IUCB-AUD-000002, etc.
 * - Training Inst:     IUCB-TI-000001,  IUCB-TI-000002,  etc.
 * - Advisory Board:    IUCB-ADV-000001, IUCB-ADV-000002, etc.
 * 
 * Each application type maintains its own independent sequence.
 * Sequences never reset and never reuse deleted IDs.
 */

const TYPE_PREFIX: Record<ApplicationType, string> = {
  ACCREDITATION: "IUCB-ORG",
  AUDITOR: "IUCB-AUD",
  TRAINING_INSTITUTE: "IUCB-TI",
  ADVISORY: "IUCB-ADV",
};

export class CredentialIdService {
  /**
   * Generate the next credential ID for a given application type
   * 
   * @param applicationType - Type of application (ACCREDITATION, AUDITOR, TRAINING_INSTITUTE, ADVISORY)
   * @returns The next sequential credential ID in IUCB format
   * 
   * @example
   * // For ACCREDITATION type:
   * const id = await CredentialIdService.generateNextId("ACCREDITATION");
   * // Returns: "IUCB-ORG-000001" or "IUCB-ORG-000022" (next available)
   */
  static async generateNextId(applicationType: ApplicationType): Promise<string> {
    const prefix = TYPE_PREFIX[applicationType];
    if (!prefix) {
      throw new Error(`Invalid application type: ${applicationType}`);
    }

    // Find the latest credential with this prefix
    const latestCredential = await prisma.credential.findFirst({
      where: {
        credentialId: {
          startsWith: prefix,
        },
        deletedAt: null, // Include only non-deleted credentials
      },
      orderBy: {
        credentialId: "desc", // Alphabetic sort works for zero-padded IDs
      },
      select: {
        credentialId: true,
      },
    });

    // Extract sequence number from credential ID
    let nextSequence = 1;
    if (latestCredential) {
      // Format: IUCB-ORG-000001 or IUCB-AUD-000005
      // Extract the last 6 digits
      const parts = latestCredential.credentialId.split("-");
      const lastPart = parts[parts.length - 1]; // e.g., "000001"
      const currentSequence = parseInt(lastPart, 10);
      nextSequence = currentSequence + 1;
    }

    // Generate next ID with zero-padded sequence (6 digits)
    const sequencePadded = String(nextSequence).padStart(6, "0");
    const newCredentialId = `${prefix}-${sequencePadded}`;

    // Verify uniqueness (should always be true given our logic, but safety check)
    const existingCredential = await prisma.credential.findFirst({
      where: {
        credentialId: newCredentialId,
      },
    });

    if (existingCredential) {
      throw new Error(
        `Credential ID collision detected: ${newCredentialId}. ` +
        `This should never happen. Please contact support.`
      );
    }

    return newCredentialId;
  }

  /**
   * Get the current sequence count for a given application type
   * Useful for displaying "Next ID will be X" in UI
   */
  static async getCurrentSequence(applicationType: ApplicationType): Promise<number> {
    const prefix = TYPE_PREFIX[applicationType];
    if (!prefix) {
      throw new Error(`Invalid application type: ${applicationType}`);
    }

    const latestCredential = await prisma.credential.findFirst({
      where: {
        credentialId: {
          startsWith: prefix,
        },
        deletedAt: null,
      },
      orderBy: {
        credentialId: "desc",
      },
      select: {
        credentialId: true,
      },
    });

    if (!latestCredential) {
      return 0;
    }

    const parts = latestCredential.credentialId.split("-");
    const lastPart = parts[parts.length - 1];
    return parseInt(lastPart, 10);
  }

  /**
   * Get statistics for all credential types
   * Returns the current highest sequence number for each type
   */
  static async getCredentialStats(): Promise<Record<ApplicationType, { prefix: string; nextId: string; count: number }>> {
    const stats: Record<ApplicationType, { prefix: string; nextId: string; count: number }> = {
      ACCREDITATION: { prefix: "IUCB-ORG", nextId: "IUCB-ORG-000001", count: 0 },
      AUDITOR: { prefix: "IUCB-AUD", nextId: "IUCB-AUD-000001", count: 0 },
      TRAINING_INSTITUTE: { prefix: "IUCB-TI", nextId: "IUCB-TI-000001", count: 0 },
      ADVISORY: { prefix: "IUCB-ADV", nextId: "IUCB-ADV-000001", count: 0 },
    };

    // Get counts and latest IDs for each type
    for (const appType of Object.keys(stats) as ApplicationType[]) {
      const prefix = TYPE_PREFIX[appType];

      // Count total credentials for this type
      const count = await prisma.credential.count({
        where: {
          credentialId: {
            startsWith: prefix,
          },
          deletedAt: null,
        },
      });

      // Get the latest credential
      const latest = await prisma.credential.findFirst({
        where: {
          credentialId: {
            startsWith: prefix,
          },
          deletedAt: null,
        },
        orderBy: {
          credentialId: "desc",
        },
        select: {
          credentialId: true,
        },
      });

      stats[appType].count = count;

      if (latest) {
        // Calculate next ID
        const parts = latest.credentialId.split("-");
        const lastPart = parts[parts.length - 1];
        const nextSequence = parseInt(lastPart, 10) + 1;
        stats[appType].nextId = `${prefix}-${String(nextSequence).padStart(6, "0")}`;
      }
    }

    return stats;
  }
}

export default CredentialIdService;

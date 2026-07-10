import { PrismaClient, Prisma } from '@prisma/client';
import db from '../config/db.js';
import crypto from 'crypto';

export interface IntegrityCheckResult {
  auditLogId: string;
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  hashVerified: boolean;
  chainVerified: boolean;
  timestampVerified: boolean;
  signatureVerified: boolean;
  errors: string[];
  verifiedAt: Date;
}

export interface IntegrityReport {
  totalRecords: number;
  verifiedRecords: number;
  failedRecords: number;
  pendingRecords: number;
  integrityScore: number;
  lastVerification: Date;
  chainBreaks: IntegrityChainBreak[];
  recommendations: string[];
}

export interface IntegrityChainBreak {
  auditLogId: string;
  expectedHash: string;
  actualHash: string;
  position: number;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DigitalSignature {
  algorithm: string;
  signature: string;
  publicKey: string;
  timestamp: Date;
}

export class IntegrityVerificationService {
  
  private readonly HASH_ALGORITHM = 'sha256';
  private readonly SIGNATURE_ALGORITHM = 'RSA-SHA256';
  private readonly VERIFICATION_BATCH_SIZE = 1000;

  /**
   * Verify the integrity of the entire audit trail
   */
  async verifyAuditTrailIntegrity(): Promise<IntegrityReport> {
    try {
      const startTime = Date.now();
      console.log('Starting comprehensive audit trail integrity verification...');

      // Get total record count
      const totalRecords = await db.auditLog.count();
      
      // Get all audit logs ordered by creation
      const auditLogs = await db.auditLog.findMany({
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          hash: true,
          previousHash: true,
          createdAt: true,
          entityType: true,
          entityId: true,
          action: true,
          actorId: true,
          description: true,
          oldValues: true,
          newValues: true,
          metadata: true
        }
      });

      console.log(`Verifying ${totalRecords} audit log records...`);

      // Verify each record
      const verificationResults: IntegrityCheckResult[] = [];
      const chainBreaks: IntegrityChainBreak[] = [];
      let previousHash: string | null = null;

      for (let i = 0; i < auditLogs.length; i++) {
        const log = auditLogs[i];
        const result = await this.verifyAuditLogRecord(log, previousHash);
        verificationResults.push(result);

        // Check for chain breaks
        if (!result.chainVerified && i > 0) {
          chainBreaks.push({
            auditLogId: log.id,
            expectedHash: previousHash || '',
            actualHash: log.previousHash || '',
            position: i,
            timestamp: log.createdAt,
            severity: this.assessChainBreakSeverity(i, auditLogs.length)
          });
        }

        previousHash = log.hash;

        // Progress logging
        if (i % this.VERIFICATION_BATCH_SIZE === 0) {
          console.log(`Verified ${i + 1}/${auditLogs.length} records (${Math.round(((i + 1) / auditLogs.length) * 100)}%)`);
        }
      }

      // Calculate metrics
      const verifiedRecords = verificationResults.filter(r => r.status === 'VERIFIED').length;
      const failedRecords = verificationResults.filter(r => r.status === 'FAILED').length;
      const pendingRecords = verificationResults.filter(r => r.status === 'PENDING').length;
      const integrityScore = Math.round((verifiedRecords / totalRecords) * 100 * 100) / 100;

      // Save verification results
      await this.saveVerificationResults(verificationResults);

      // Generate recommendations
      const recommendations = this.generateIntegrityRecommendations(chainBreaks, integrityScore);

      const report: IntegrityReport = {
        totalRecords,
        verifiedRecords,
        failedRecords,
        pendingRecords,
        integrityScore,
        lastVerification: new Date(),
        chainBreaks,
        recommendations
      };

      const executionTime = Date.now() - startTime;
      console.log(`Integrity verification completed in ${executionTime}ms. Score: ${integrityScore}%`);

      return report;
    } catch (error) {
      console.error('Integrity verification failed:', error);
      throw new Error('Audit trail integrity verification failed');
    }
  }

  /**
   * Verify a single audit log record
   */
  async verifyAuditLogRecord(record: any, expectedPreviousHash?: string | null): Promise<IntegrityCheckResult> {
    const errors: string[] = [];
    let hashVerified = false;
    let chainVerified = false;
    let timestampVerified = false;
    let signatureVerified = false;

    try {
      // 1. Verify record hash
      const calculatedHash = this.calculateRecordHash(record);
      hashVerified = calculatedHash === record.hash;
      if (!hashVerified) {
        errors.push(`Hash mismatch: expected ${record.hash}, calculated ${calculatedHash}`);
      }

      // 2. Verify hash chain
      if (expectedPreviousHash !== undefined) {
        chainVerified = record.previousHash === expectedPreviousHash;
        if (!chainVerified) {
          errors.push(`Chain break: expected previousHash ${expectedPreviousHash}, found ${record.previousHash}`);
        }
      } else {
        chainVerified = true; // First record or no chain expected
      }

      // 3. Verify timestamp integrity
      timestampVerified = this.verifyTimestamp(record);
      if (!timestampVerified) {
        errors.push('Timestamp verification failed');
      }

      // 4. Verify digital signature (if present)
      signatureVerified = await this.verifyDigitalSignature(record);
      if (!signatureVerified) {
        errors.push('Digital signature verification failed');
      }

      const overallStatus: 'VERIFIED' | 'FAILED' | 'PENDING' = 
        hashVerified && chainVerified && timestampVerified ? 'VERIFIED' : 'FAILED';

      return {
        auditLogId: record.id,
        status: overallStatus,
        hashVerified,
        chainVerified,
        timestampVerified,
        signatureVerified,
        errors,
        verifiedAt: new Date()
      };
    } catch (error) {
      console.error(`Error verifying record ${record.id}:`, error);
      return {
        auditLogId: record.id,
        status: 'FAILED',
        hashVerified: false,
        chainVerified: false,
        timestampVerified: false,
        signatureVerified: false,
        errors: [`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        verifiedAt: new Date()
      };
    }
  }

  /**
   * Calculate hash for an audit record
   */
  calculateRecordHash(record: any): string {
    // Create a normalized string representation of the record
    const hashData = {
      entityType: record.entityType,
      entityId: record.entityId,
      action: record.action,
      actorId: record.actorId,
      description: record.description,
      oldValues: record.oldValues,
      newValues: record.newValues,
      createdAt: record.createdAt.toISOString(),
      previousHash: record.previousHash
    };

    // Sort keys to ensure consistent hashing
    const sortedData = this.sortObjectKeys(hashData);
    const dataString = JSON.stringify(sortedData);
    
    return crypto.createHash(this.HASH_ALGORITHM)
      .update(dataString)
      .digest('hex');
  }

  /**
   * Verify timestamp integrity
   */
  private verifyTimestamp(record: any): boolean {
    try {
      const recordTime = new Date(record.createdAt);
      const now = new Date();
      
      // Check if timestamp is in the future
      if (recordTime > now) {
        return false;
      }
      
      // Check if timestamp is too far in the past (e.g., before system deployment)
      const systemDeploymentDate = new Date('2025-01-01'); // Adjust as needed
      if (recordTime < systemDeploymentDate) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify digital signature (simplified implementation)
   */
  private async verifyDigitalSignature(record: any): Promise<boolean> {
    try {
      // Check if record has digital signature metadata
      const signatureData = record.metadata?.digitalSignature as DigitalSignature | undefined;
      
      if (!signatureData) {
        return true; // No signature required for older records
      }

      // In a real implementation, this would verify against a public key
      // For now, we'll simulate signature verification
      const isValidSignature = signatureData.algorithm === this.SIGNATURE_ALGORITHM &&
                              signatureData.signature.length > 0 &&
                              signatureData.publicKey.length > 0;
      
      return isValidSignature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Assess the severity of a chain break
   */
  private assessChainBreakSeverity(position: number, totalRecords: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const percentagePosition = (position / totalRecords) * 100;
    
    if (percentagePosition > 90) return 'CRITICAL'; // Recent records
    if (percentagePosition > 75) return 'HIGH';
    if (percentagePosition > 50) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Save verification results to database
   */
  private async saveVerificationResults(results: IntegrityCheckResult[]): Promise<void> {
    try {
      // Delete existing verification results for these records
      const chainHashes = results.map(r => r.auditLogId);
      
      await db.auditIntegrity.deleteMany({
        where: {
          chainHash: { in: chainHashes }
        }
      });

      // Insert new verification results
      const integrityRecords = results.map(result => ({
        chainHash: result.auditLogId, // Use auditLogId as chainHash
        blockCount: 0,
        lastVerified: result.verifiedAt,
        isValid: !result.errors || result.errors.length === 0,
        errorMessage: result.errors ? result.errors.join('; ') : null
      }));

      // Batch insert
      const batchSize = 500;
      for (let i = 0; i < integrityRecords.length; i += batchSize) {
        const batch = integrityRecords.slice(i, i + batchSize);
        await db.auditIntegrity.createMany({
          data: batch,
          skipDuplicates: true
        });
      }

      console.log(`Saved ${integrityRecords.length} verification results to database`);
    } catch (error) {
      console.error('Error saving verification results:', error);
      throw error;
    }
  }

  /**
   * Generate integrity recommendations
   */
  private generateIntegrityRecommendations(chainBreaks: IntegrityChainBreak[], integrityScore: number): string[] {
    const recommendations: string[] = [];

    if (integrityScore < 95) {
      recommendations.push('Integrity score is below acceptable threshold (95%). Immediate investigation required.');
    }

    if (chainBreaks.length > 0) {
      const criticalBreaks = chainBreaks.filter(b => b.severity === 'CRITICAL').length;
      const highBreaks = chainBreaks.filter(b => b.severity === 'HIGH').length;

      if (criticalBreaks > 0) {
        recommendations.push(`${criticalBreaks} critical chain breaks detected in recent records. Investigate potential tampering.`);
      }

      if (highBreaks > 0) {
        recommendations.push(`${highBreaks} high-severity chain breaks found. Review audit log integrity processes.`);
      }

      recommendations.push('Consider implementing additional integrity protection measures.');
    }

    if (integrityScore >= 99) {
      recommendations.push('Excellent integrity score. Continue current security practices.');
    } else if (integrityScore >= 95) {
      recommendations.push('Good integrity score. Monitor for any degradation trends.');
    }

    return recommendations;
  }

  /**
   * Verify integrity of recent records (last N records)
   */
  async verifyRecentRecords(limit: number = 1000): Promise<IntegrityReport> {
    try {
      const recentLogs = await db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          hash: true,
          previousHash: true,
          createdAt: true,
          entityType: true,
          entityId: true,
          action: true,
          actorId: true,
          description: true,
          oldValues: true,
          newValues: true,
          metadata: true
        }
      });

      // Reverse to get chronological order for chain verification
      recentLogs.reverse();

      const verificationResults: IntegrityCheckResult[] = [];
      const chainBreaks: IntegrityChainBreak[] = [];
      let previousHash: string | null = null;

      // If we're not starting from the beginning, get the previous hash
      if (recentLogs.length > 0) {
        const firstLog = recentLogs[0];
        previousHash = firstLog.previousHash;
      }

      for (let i = 0; i < recentLogs.length; i++) {
        const log = recentLogs[i];
        const result = await this.verifyAuditLogRecord(log, previousHash);
        verificationResults.push(result);

        if (!result.chainVerified && i > 0) {
          chainBreaks.push({
            auditLogId: log.id,
            expectedHash: previousHash || '',
            actualHash: log.previousHash || '',
            position: i,
            timestamp: log.createdAt,
            severity: 'MEDIUM'
          });
        }

        previousHash = log.hash;
      }

      const totalRecords = recentLogs.length;
      const verifiedRecords = verificationResults.filter(r => r.status === 'VERIFIED').length;
      const failedRecords = verificationResults.filter(r => r.status === 'FAILED').length;
      const pendingRecords = verificationResults.filter(r => r.status === 'PENDING').length;
      const integrityScore = totalRecords > 0 ? Math.round((verifiedRecords / totalRecords) * 100 * 100) / 100 : 100;

      return {
        totalRecords,
        verifiedRecords,
        failedRecords,
        pendingRecords,
        integrityScore,
        lastVerification: new Date(),
        chainBreaks,
        recommendations: this.generateIntegrityRecommendations(chainBreaks, integrityScore)
      };
    } catch (error) {
      console.error('Recent records verification failed:', error);
      throw new Error('Failed to verify recent audit records');
    }
  }

  /**
   * Get integrity statistics
   */
  async getIntegrityStatistics(): Promise<any> {
    try {
      const totalRecords = await db.auditLog.count();
      const totalIntegrityChecks = await db.auditIntegrity.count();
      const failedChecks = await db.auditIntegrity.count({ where: { isValid: false } });

      const coveragePercentage = totalRecords > 0 ? Math.round((totalIntegrityChecks / totalRecords) * 100 * 100) / 100 : 0;
      const failureRate = totalIntegrityChecks > 0 ? Math.round((failedChecks / totalIntegrityChecks) * 100 * 100) / 100 : 0;

      return {
        totalAuditRecords: totalRecords,
        totalIntegrityChecks,
        failedChecks,
        coveragePercentage,
        failureRate,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error getting integrity statistics:', error);
      throw new Error('Failed to retrieve integrity statistics');
    }
  }

  /**
   * Repair broken hash chains (where possible)
   */
  async repairHashChain(startingLogId: string): Promise<{ repairedCount: number; errors: string[] }> {
    try {
      console.log(`Starting hash chain repair from record ${startingLogId}...`);
      
      const errors: string[] = [];
      let repairedCount = 0;

      // Get all records from the starting point
      const startingRecord = await db.auditLog.findUnique({
        where: { id: startingLogId }
      });

      if (!startingRecord) {
        throw new Error('Starting record not found');
      }

      const subsequentRecords = await db.auditLog.findMany({
        where: {
          createdAt: { gt: startingRecord.createdAt }
        },
        orderBy: { createdAt: 'asc' }
      });

      let currentHash = startingRecord.hash;

      for (const record of subsequentRecords) {
        // Check if this record's previousHash is correct
        if (record.previousHash !== currentHash) {
          // Attempt repair
          try {
            await db.auditLog.update({
              where: { id: record.id },
              data: { previousHash: currentHash }
            });

            // Recalculate the record's hash
            const updatedRecord = { ...record, previousHash: currentHash };
            const newHash = this.calculateRecordHash(updatedRecord);

            await db.auditLog.update({
              where: { id: record.id },
              data: { hash: newHash }
            });

            repairedCount++;
            currentHash = newHash;
          } catch (error) {
            errors.push(`Failed to repair record ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            currentHash = record.hash; // Continue with original hash
          }
        } else {
          currentHash = record.hash;
        }
      }

      console.log(`Hash chain repair completed. Repaired ${repairedCount} records with ${errors.length} errors.`);
      
      return { repairedCount, errors };
    } catch (error) {
      console.error('Hash chain repair failed:', error);
      throw new Error('Failed to repair hash chain');
    }
  }

  /**
   * Sort object keys recursively for consistent hashing
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: any = {};

    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }

    return sortedObj;
  }

  /**
   * Create digital signature for a record (simplified)
   */
  createDigitalSignature(record: any): DigitalSignature {
    const dataToSign = JSON.stringify(this.sortObjectKeys(record));
    const hash = crypto.createHash('sha256').update(dataToSign).digest('hex');
    
    // In a real implementation, this would use actual cryptographic signing
    const signature = crypto.createHash('sha256').update(hash + 'secret-key').digest('hex');
    
    return {
      algorithm: this.SIGNATURE_ALGORITHM,
      signature,
      publicKey: 'mock-public-key', // Would be actual public key
      timestamp: new Date()
    };
  }
}

export default new IntegrityVerificationService();
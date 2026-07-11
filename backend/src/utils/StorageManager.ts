import fs from "fs";
import path from "path";

/**
 * StorageManager - Manages local storage for uploads
 * Ensures all required directories exist and provides utilities for file operations
 */
export class StorageManager {
  // Storage paths
  static readonly STORAGE_ROOT = path.join(process.cwd(), "storage");
  static readonly UPLOADS_DIR = path.join(StorageManager.STORAGE_ROOT, "uploads");
  static readonly TEMPLATES_DIR = path.join(StorageManager.UPLOADS_DIR, "templates");
  static readonly EXCEL_DIR = path.join(StorageManager.UPLOADS_DIR);
  static readonly CERTIFICATES_DIR = path.join(StorageManager.STORAGE_ROOT, "certificates");

  /**
   * Initialize all required storage directories
   * Creates folders if they don't exist
   */
  static initializeStorageDirs(): void {
    const dirs = [
      StorageManager.STORAGE_ROOT,
      StorageManager.UPLOADS_DIR,
      StorageManager.TEMPLATES_DIR,
      StorageManager.EXCEL_DIR,
      StorageManager.CERTIFICATES_DIR,
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created storage directory: ${dir}`);
      }
    });
  }

  /**
   * Get Excel upload directory
   * Returns path like: storage/uploads/
   */
  static getExcelUploadDir(): string {
    const dir = StorageManager.EXCEL_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Get HTML template upload directory
   * Returns path like: storage/uploads/templates/
   */
  static getTemplateUploadDir(): string {
    const dir = StorageManager.TEMPLATES_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Get campaign certificates directory
   * Creates campaign-specific subfolder if needed
   * Returns path like: storage/certificates/{campaignId}/
   */
  static getCampaignCertificatesDir(campaignId: string): string {
    const dir = path.join(StorageManager.CERTIFICATES_DIR, campaignId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Generate unique filename with timestamp
   * Example: 1720425120123-employees.xlsx
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    return `${timestamp}-${originalName}`;
  }

  /**
   * Verify that uploaded file exists
   * @param filePath Full path to the file
   * @returns true if file exists and is readable
   */
  static fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file size in bytes
   * @param filePath Full path to the file
   * @returns File size in bytes, or 0 if file doesn't exist
   */
  static getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get file size in human-readable format
   * @param bytes File size in bytes
   * @returns Formatted string like "1.5 MB"
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Delete a file from storage
   * @param filePath Full path to the file
   * @returns true if deletion was successful
   */
  static deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error deleting file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Delete an entire directory and its contents
   * @param dirPath Full path to the directory
   * @returns true if deletion was successful
   */
  static deleteDirectory(dirPath: string): boolean {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Deleted directory: ${dirPath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error deleting directory: ${dirPath}`, error);
      return false;
    }
  }

  /**
   * Get relative path for database storage
   * Converts absolute path to relative path from process.cwd()
   * @param absolutePath Full path to the file
   * @returns Relative path like "storage/uploads/filename.xlsx"
   */
  static getRelativePath(absolutePath: string): string {
    return path.relative(process.cwd(), absolutePath);
  }

  /**
   * Log storage info for debugging
   */
  static logStorageInfo(): void {
    console.log("\n📁 STORAGE CONFIGURATION:");
    console.log(`   Root: ${StorageManager.STORAGE_ROOT}`);
    console.log(`   Uploads: ${StorageManager.UPLOADS_DIR}`);
    console.log(`   Templates: ${StorageManager.TEMPLATES_DIR}`);
    console.log(`   Certificates: ${StorageManager.CERTIFICATES_DIR}`);
    console.log("");
  }
}

// Initialize storage on import
StorageManager.initializeStorageDirs();

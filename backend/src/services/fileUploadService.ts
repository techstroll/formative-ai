/**
 * File Upload Service - Handle competitor data and document uploads
 */

import fs from 'fs';
import path from 'path';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

class FileUploadService {
  private uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save uploaded file
   */
  saveFile(buffer: Buffer, originalName: string, mimetype: string): UploadedFile {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(originalName);
    const filename = `${timestamp}-${random}${ext}`;

    // Save to disk
    const filePath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
      filename,
      originalName,
      mimetype,
      size: buffer.length,
      path: filePath,
      uploadedAt: new Date(),
    };
  }

  /**
   * Parse CSV file for competitor data
   */
  parseCSVCompetitors(filePath: string): Record<string, string>[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      return [];
    }

    // Get headers from first line
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    // Parse data rows
    const data = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      return row;
    });

    return data;
  }

  /**
   * Parse Excel file for competitor data (simplified - requires excel library)
   */
  parseExcelCompetitors(filePath: string): Record<string, string>[] {
    // TODO: Implement with xlsx library
    // For now, return empty array
    console.log(`Excel parsing not yet implemented for: ${filePath}`);
    return [];
  }

  /**
   * Delete file
   */
  deleteFile(filename: string): boolean {
    try {
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
      return false;
    }
  }

  /**
   * Get file info
   */
  getFileInfo(filename: string): UploadedFile | null {
    try {
      const filePath = path.join(this.uploadDir, filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stat = fs.statSync(filePath);
      return {
        filename,
        originalName: filename,
        mimetype: 'application/octet-stream',
        size: stat.size,
        path: filePath,
        uploadedAt: stat.mtime,
      };
    } catch (error) {
      console.error(`Error getting file info for ${filename}:`, error);
      return null;
    }
  }

  /**
   * Validate file type
   */
  isValidCompetitorFile(mimetype: string): boolean {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return validTypes.includes(mimetype);
  }
}

export const fileUploadService = new FileUploadService();

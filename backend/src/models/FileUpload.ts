import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export interface IFileUpload {
  id: string;
  researchId?: string;
  projectId: string;
  userId: string;
  filename: string;
  originalName: string;
  filePath: string;
  mimetype?: string;
  fileSize?: number;
  fileType?: string;
  parsedData?: Record<string, any>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FileUpload implements IFileUpload {
  id: string;
  researchId?: string;
  projectId: string;
  userId: string;
  filename: string;
  originalName: string;
  filePath: string;
  mimetype?: string;
  fileSize?: number;
  fileType?: string;
  parsedData?: Record<string, any>;
  status: string = 'uploaded';
  createdAt: Date;
  updatedAt: Date;

  constructor(
    userId: string,
    projectId: string,
    originalName: string,
    filename: string,
    filePath: string
  ) {
    this.id = uuidv4();
    this.userId = userId;
    this.projectId = projectId;
    this.originalName = originalName;
    this.filename = filename;
    this.filePath = filePath;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Save file upload record to database
   */
  async save(): Promise<void> {
    const existingResult = await query(
      'SELECT id FROM file_uploads WHERE id = $1',
      [this.id]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE file_uploads
         SET filename = $1, original_name = $2, file_path = $3, mimetype = $4,
             file_size = $5, file_type = $6, parsed_data = $7, status = $8,
             research_id = $9, updated_at = NOW()
         WHERE id = $10`,
        [
          this.filename,
          this.originalName,
          this.filePath,
          this.mimetype,
          this.fileSize,
          this.fileType,
          this.parsedData ? JSON.stringify(this.parsedData) : null,
          this.status,
          this.researchId,
          this.id,
        ]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO file_uploads
         (id, research_id, project_id, user_id, filename, original_name, file_path,
          mimetype, file_size, file_type, parsed_data, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          this.id,
          this.researchId,
          this.projectId,
          this.userId,
          this.filename,
          this.originalName,
          this.filePath,
          this.mimetype,
          this.fileSize,
          this.fileType,
          this.parsedData ? JSON.stringify(this.parsedData) : null,
          this.status,
          this.createdAt,
          this.updatedAt,
        ]
      );
    }
  }

  /**
   * Find file upload by ID
   */
  static async findById(id: string): Promise<FileUpload | null> {
    const result = await query(
      'SELECT * FROM file_uploads WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapToFileUpload(result.rows[0]);
  }

  /**
   * Find all file uploads for a research
   */
  static async findByResearchId(researchId: string): Promise<FileUpload[]> {
    const result = await query(
      'SELECT * FROM file_uploads WHERE research_id = $1 ORDER BY created_at DESC',
      [researchId]
    );

    return result.rows.map(row => this.mapToFileUpload(row));
  }

  /**
   * Find all file uploads for a project
   */
  static async findByProjectId(projectId: string): Promise<FileUpload[]> {
    const result = await query(
      'SELECT * FROM file_uploads WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    return result.rows.map(row => this.mapToFileUpload(row));
  }

  /**
   * Find all file uploads for a user
   */
  static async findByUserId(userId: string): Promise<FileUpload[]> {
    const result = await query(
      'SELECT * FROM file_uploads WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(row => this.mapToFileUpload(row));
  }

  /**
   * Delete file upload record
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM file_uploads WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Map database row to FileUpload instance
   */
  private static mapToFileUpload(row: any): FileUpload {
    const upload = new FileUpload(
      row.user_id,
      row.project_id,
      row.original_name,
      row.filename,
      row.file_path
    );

    upload.id = row.id;
    upload.researchId = row.research_id;
    upload.mimetype = row.mimetype;
    upload.fileSize = row.file_size;
    upload.fileType = row.file_type;
    upload.parsedData = row.parsed_data;
    upload.status = row.status;
    upload.createdAt = new Date(row.created_at);
    upload.updatedAt = new Date(row.updated_at);

    return upload;
  }
}

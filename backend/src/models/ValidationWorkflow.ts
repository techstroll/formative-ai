import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { query } from '../config/database';

export interface IValidationWorkflow {
  id: string;
  artifactId: string;
  artifactType: 'research' | 'wireframe' | 'prototype' | 'prd';
  projectId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewerEmail?: string;
  approvalToken: string;
  feedback?: string;
  approvedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

export class ValidationWorkflow implements IValidationWorkflow {
  id: string;
  artifactId: string;
  artifactType: 'research' | 'wireframe' | 'prototype' | 'prd';
  projectId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' = 'pending';
  reviewerEmail?: string;
  approvalToken: string;
  feedback?: string;
  approvedAt?: Date;
  createdAt: Date;
  expiresAt: Date;

  constructor(
    artifactId: string,
    artifactType: 'research' | 'wireframe' | 'prototype' | 'prd',
    projectId: string,
    reviewerEmail?: string
  ) {
    this.id = uuidv4();
    this.artifactId = artifactId;
    this.artifactType = artifactType;
    this.projectId = projectId;
    this.reviewerEmail = reviewerEmail;
    this.approvalToken = crypto.randomBytes(32).toString('hex');
    this.createdAt = new Date();

    // Approval expires in 7 days
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Save validation workflow to database
   */
  async save(): Promise<void> {
    const existingResult = await query(
      'SELECT id FROM validation_workflows WHERE id = $1',
      [this.id]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE validation_workflows
         SET status = $1, feedback = $2, approved_at = $3
         WHERE id = $4`,
        [this.status, this.feedback, this.approvedAt, this.id]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO validation_workflows
         (id, artifact_id, artifact_type, project_id, status, reviewer_email,
          approval_token, feedback, approved_at, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          this.id,
          this.artifactId,
          this.artifactType,
          this.projectId,
          this.status,
          this.reviewerEmail,
          this.approvalToken,
          this.feedback,
          this.approvedAt,
          this.createdAt,
          this.expiresAt,
        ]
      );
    }
  }

  /**
   * Find workflow by ID
   */
  static async findById(id: string): Promise<ValidationWorkflow | null> {
    const result = await query(
      'SELECT * FROM validation_workflows WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapToWorkflow(result.rows[0]);
  }

  /**
   * Find workflow by approval token
   */
  static async findByToken(token: string): Promise<ValidationWorkflow | null> {
    const result = await query(
      'SELECT * FROM validation_workflows WHERE approval_token = $1',
      [token]
    );

    if (result.rows.length === 0) return null;
    return this.mapToWorkflow(result.rows[0]);
  }

  /**
   * Find all pending workflows for a project
   */
  static async findPendingByProjectId(projectId: string): Promise<ValidationWorkflow[]> {
    const result = await query(
      `SELECT * FROM validation_workflows
       WHERE project_id = $1 AND status = 'pending' AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [projectId]
    );

    return result.rows.map(row => this.mapToWorkflow(row));
  }

  /**
   * Find all workflows for an artifact
   */
  static async findByArtifactId(artifactId: string): Promise<ValidationWorkflow[]> {
    const result = await query(
      `SELECT * FROM validation_workflows
       WHERE artifact_id = $1
       ORDER BY created_at DESC`,
      [artifactId]
    );

    return result.rows.map(row => this.mapToWorkflow(row));
  }

  /**
   * Approve workflow
   */
  async approve(feedback?: string): Promise<void> {
    this.status = 'approved';
    this.feedback = feedback;
    this.approvedAt = new Date();
    await this.save();
  }

  /**
   * Reject workflow
   */
  async reject(feedback?: string): Promise<void> {
    this.status = 'rejected';
    this.feedback = feedback;
    this.approvedAt = new Date();
    await this.save();
  }

  /**
   * Check if workflow is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Map database row to ValidationWorkflow instance
   */
  private static mapToWorkflow(row: any): ValidationWorkflow {
    const workflow = new ValidationWorkflow(
      row.artifact_id,
      row.artifact_type,
      row.project_id,
      row.reviewer_email
    );

    workflow.id = row.id;
    workflow.status = row.status;
    workflow.approvalToken = row.approval_token;
    workflow.feedback = row.feedback;
    workflow.approvedAt = row.approved_at ? new Date(row.approved_at) : undefined;
    workflow.createdAt = new Date(row.created_at);
    workflow.expiresAt = new Date(row.expires_at);

    return workflow;
  }
}

import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

// Default project UUID when no project is specified
const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000000';

export interface IResearchSession {
  id: string;
  userId: string;
  projectId?: string;
  status: 'generating' | 'completed' | 'error';
  topic: string;
  targetAudience?: string;
  competitors?: string;
  geographicFocus?: string;
  estimatedCompletionTime?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Results (stored in JSON when completed)
  executiveSummary?: string;
  marketAnalysis?: string;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitorMatrix?: Record<string, any>;
  keyInsights?: string[];
  recommendations?: string[];
  generatedAt?: string;
}

export class ResearchSession implements IResearchSession {
  id: string;
  userId: string;
  projectId?: string;
  status: 'generating' | 'completed' | 'error' = 'generating';
  topic: string;
  targetAudience?: string;
  competitors?: string;
  geographicFocus?: string;
  estimatedCompletionTime?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  executiveSummary?: string;
  marketAnalysis?: string;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitorMatrix?: Record<string, any>;
  keyInsights?: string[];
  recommendations?: string[];
  generatedAt?: string;

  constructor(userId: string, topic: string) {
    this.id = uuidv4();
    this.userId = userId;
    this.topic = topic;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Save or update research session in database
   */
  async save(): Promise<void> {
    const existingResult = await query(
      'SELECT id FROM research_sessions WHERE id = $1',
      [this.id]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE research_sessions
         SET status = $1, topic = $2, target_audience = $3, competitors = $4,
             geographic_focus = $5, estimated_completion_time = $6, error_message = $7,
             updated_at = NOW(), completed_at = $8, executive_summary = $9,
             market_analysis = $10, swot = $11, competitor_matrix = $12,
             key_insights = $13, recommendations = $14, generated_at = $15
         WHERE id = $16`,
        [
          this.status,
          this.topic,
          this.targetAudience,
          this.competitors,
          this.geographicFocus,
          this.estimatedCompletionTime,
          this.errorMessage,
          this.completedAt,
          this.executiveSummary,
          this.marketAnalysis,
          this.swot ? JSON.stringify(this.swot) : null,
          this.competitorMatrix ? JSON.stringify(this.competitorMatrix) : null,
          this.keyInsights ? JSON.stringify(this.keyInsights) : null,
          this.recommendations ? JSON.stringify(this.recommendations) : null,
          this.generatedAt,
          this.id,
        ]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO research_sessions
         (id, user_id, project_id, status, topic, target_audience, competitors,
          geographic_focus, estimated_completion_time, error_message, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          this.id,
          this.userId,
          this.projectId,
          this.status,
          this.topic,
          this.targetAudience,
          this.competitors,
          this.geographicFocus,
          this.estimatedCompletionTime,
          this.errorMessage,
          this.createdAt,
          this.updatedAt,
        ]
      );
    }
  }

  /**
   * Save research results to research_artifacts table
   */
  async saveResults(): Promise<string> {
    const artifactId = uuidv4();

    await query(
      `INSERT INTO research_artifacts
       (id, project_id, title, content, market_analysis, target_audience,
        key_insights, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        artifactId,
        this.projectId || null,  // Allow null for research without a project
        this.topic,
        JSON.stringify({
          executiveSummary: this.executiveSummary,
          swot: this.swot,
          competitorMatrix: this.competitorMatrix,
          recommendations: this.recommendations,
          generatedAt: this.generatedAt,
        }),
        this.marketAnalysis,
        this.targetAudience,
        JSON.stringify(this.keyInsights),
        'generated',
        new Date(),
        new Date(),
      ]
    );

    return artifactId;
  }

  /**
   * Find research session by ID
   */
  static async findById(id: string): Promise<ResearchSession | null> {
    const result = await query(
      'SELECT * FROM research_sessions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapToSession(result.rows[0]);
  }

  /**
   * Find all research sessions for a user
   */
  static async findByUserId(userId: string): Promise<ResearchSession[]> {
    const result = await query(
      'SELECT * FROM research_sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(row => this.mapToSession(row));
  }

  /**
   * Find all research sessions for a project
   */
  static async findByProjectId(projectId: string): Promise<ResearchSession[]> {
    const result = await query(
      'SELECT * FROM research_sessions WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    return result.rows.map(row => this.mapToSession(row));
  }

  /**
   * Delete research session
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM research_sessions WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Map database row to ResearchSession instance
   */
  private static mapToSession(row: any): ResearchSession {
    const session = new ResearchSession(row.user_id, row.topic);
    session.id = row.id;
    session.projectId = row.project_id;
    session.status = row.status;
    session.targetAudience = row.target_audience;
    session.competitors = row.competitors;
    session.geographicFocus = row.geographic_focus;
    session.estimatedCompletionTime = row.estimated_completion_time ? new Date(row.estimated_completion_time) : undefined;
    session.errorMessage = row.error_message;
    session.createdAt = new Date(row.created_at);
    session.updatedAt = new Date(row.updated_at);
    session.completedAt = row.completed_at ? new Date(row.completed_at) : undefined;

    // Map research results
    session.executiveSummary = row.executive_summary;
    session.marketAnalysis = row.market_analysis;
    session.swot = row.swot ? (typeof row.swot === 'string' ? JSON.parse(row.swot) : row.swot) : undefined;
    session.competitorMatrix = row.competitor_matrix ? (typeof row.competitor_matrix === 'string' ? JSON.parse(row.competitor_matrix) : row.competitor_matrix) : undefined;
    session.keyInsights = row.key_insights ? (typeof row.key_insights === 'string' ? JSON.parse(row.key_insights) : row.key_insights) : undefined;
    session.recommendations = row.recommendations ? (typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations) : undefined;
    session.generatedAt = row.generated_at;

    return session;
  }
}

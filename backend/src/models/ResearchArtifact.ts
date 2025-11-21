import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export interface IResearchArtifact {
  id: string;
  projectId: string;
  title: string;
  content?: Record<string, any>;
  marketAnalysis?: string;
  competitorAnalysis?: string;
  targetAudience?: string;
  keyInsights?: Record<string, any>;
  confidenceScore: number;
  status: 'draft' | 'generated' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class ResearchArtifact implements IResearchArtifact {
  id: string;
  projectId: string;
  title: string;
  content?: Record<string, any>;
  marketAnalysis?: string;
  competitorAnalysis?: string;
  targetAudience?: string;
  keyInsights?: Record<string, any>;
  confidenceScore: number = 0.0;
  status: 'draft' | 'generated' | 'approved' | 'rejected' = 'draft';
  createdAt: Date;
  updatedAt: Date;
  version: number = 1;

  constructor(projectId: string, title: string) {
    this.id = uuidv4();
    this.projectId = projectId;
    this.title = title;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save(): Promise<void> {
    await query(
      `INSERT INTO research_artifacts
       (id, project_id, title, content, market_analysis, competitor_analysis,
        target_audience, key_insights, confidence_score, status, created_at, updated_at, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        this.id,
        this.projectId,
        this.title,
        JSON.stringify(this.content),
        this.marketAnalysis,
        this.competitorAnalysis,
        this.targetAudience,
        JSON.stringify(this.keyInsights),
        this.confidenceScore,
        this.status,
        this.createdAt,
        this.updatedAt,
        this.version,
      ],
    );
  }

  static async findById(id: string): Promise<ResearchArtifact | null> {
    const result = await query('SELECT * FROM research_artifacts WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToArtifact(result.rows[0]);
  }

  static async findByProjectId(projectId: string): Promise<ResearchArtifact[]> {
    const result = await query(
      'SELECT * FROM research_artifacts WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId],
    );
    return result.rows.map(row => this.mapToArtifact(row));
  }

  private static mapToArtifact(row: any): ResearchArtifact {
    const artifact = new ResearchArtifact(row.project_id, row.title);
    artifact.id = row.id;
    artifact.content = row.content;
    artifact.marketAnalysis = row.market_analysis;
    artifact.competitorAnalysis = row.competitor_analysis;
    artifact.targetAudience = row.target_audience;
    artifact.keyInsights = row.key_insights;
    artifact.confidenceScore = row.confidence_score;
    artifact.status = row.status;
    artifact.createdAt = new Date(row.created_at);
    artifact.updatedAt = new Date(row.updated_at);
    artifact.version = row.version;
    return artifact;
  }
}

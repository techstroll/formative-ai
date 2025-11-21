import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export interface ComponentMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  usage: string;
  tags: string[];
  variants?: string[];
}

export interface IWireframeArtifact {
  id: string;
  projectId?: string;
  researchId?: string;
  title: string;
  designType: string;
  svgContent?: string;
  layoutJson?: Record<string, any>;
  screens?: Record<string, any>;
  suggestedComponents?: ComponentMetadata[];
  designSuggestions?: string[];
  status: 'draft' | 'generated' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class WireframeArtifact implements IWireframeArtifact {
  id: string;
  projectId?: string;
  researchId?: string;
  title: string;
  designType: string;
  svgContent?: string;
  layoutJson?: Record<string, any>;
  screens?: Record<string, any>;
  suggestedComponents?: ComponentMetadata[];
  designSuggestions?: string[];
  status: 'draft' | 'generated' | 'approved' | 'rejected' = 'draft';
  createdAt: Date;
  updatedAt: Date;
  version: number = 1;

  constructor(title: string, designType: string, projectId?: string) {
    this.id = uuidv4();
    this.projectId = projectId;
    this.title = title;
    this.designType = designType;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Save wireframe artifact to database
   */
  async save(): Promise<void> {
    const existingResult = await query(
      'SELECT id FROM wireframe_artifacts WHERE id = $1',
      [this.id]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE wireframe_artifacts
         SET title = $1, design_type = $2, svg_content = $3, layout_json = $4,
             screens = $5, status = $6, research_id = $7, suggested_components = $8,
             design_suggestions = $9, updated_at = NOW(), version = version + 1
         WHERE id = $10`,
        [
          this.title,
          this.designType,
          this.svgContent,
          this.layoutJson ? JSON.stringify(this.layoutJson) : null,
          this.screens ? JSON.stringify(this.screens) : null,
          this.status,
          this.researchId,
          this.suggestedComponents ? JSON.stringify(this.suggestedComponents) : null,
          this.designSuggestions ? JSON.stringify(this.designSuggestions) : null,
          this.id,
        ]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO wireframe_artifacts
         (id, project_id, research_id, title, design_type, svg_content, layout_json,
          screens, suggested_components, design_suggestions, status, created_at, updated_at, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          this.id,
          this.projectId,
          this.researchId,
          this.title,
          this.designType,
          this.svgContent,
          this.layoutJson ? JSON.stringify(this.layoutJson) : null,
          this.screens ? JSON.stringify(this.screens) : null,
          this.suggestedComponents ? JSON.stringify(this.suggestedComponents) : null,
          this.designSuggestions ? JSON.stringify(this.designSuggestions) : null,
          this.status,
          this.createdAt,
          this.updatedAt,
          this.version,
        ]
      );
    }
  }

  /**
   * Find wireframe by ID
   */
  static async findById(id: string): Promise<WireframeArtifact | null> {
    const result = await query(
      'SELECT * FROM wireframe_artifacts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapToArtifact(result.rows[0]);
  }

  /**
   * Find all wireframes for a project
   */
  static async findByProjectId(projectId: string): Promise<WireframeArtifact[]> {
    const result = await query(
      'SELECT * FROM wireframe_artifacts WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    return result.rows.map(row => this.mapToArtifact(row));
  }

  /**
   * Find wireframe by research ID
   */
  static async findByResearchId(researchId: string): Promise<WireframeArtifact | null> {
    const result = await query(
      'SELECT * FROM wireframe_artifacts WHERE research_id = $1 ORDER BY created_at DESC LIMIT 1',
      [researchId]
    );

    if (result.rows.length === 0) return null;
    return this.mapToArtifact(result.rows[0]);
  }

  /**
   * Delete wireframe
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM wireframe_artifacts WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Map database row to WireframeArtifact instance
   */
  private static mapToArtifact(row: any): WireframeArtifact {
    const artifact = new WireframeArtifact(row.title, row.design_type, row.project_id);
    artifact.id = row.id;
    artifact.researchId = row.research_id;
    artifact.svgContent = row.svg_content;
    artifact.layoutJson = row.layout_json ? (typeof row.layout_json === 'string' ? JSON.parse(row.layout_json) : row.layout_json) : undefined;
    artifact.screens = row.screens ? (typeof row.screens === 'string' ? JSON.parse(row.screens) : row.screens) : undefined;
    artifact.suggestedComponents = row.suggested_components ? (typeof row.suggested_components === 'string' ? JSON.parse(row.suggested_components) : row.suggested_components) : undefined;
    artifact.designSuggestions = row.design_suggestions ? (typeof row.design_suggestions === 'string' ? JSON.parse(row.design_suggestions) : row.design_suggestions) : undefined;
    artifact.status = row.status;
    artifact.createdAt = new Date(row.created_at);
    artifact.updatedAt = new Date(row.updated_at);
    artifact.version = row.version;

    return artifact;
  }
}

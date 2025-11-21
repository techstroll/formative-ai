import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

/**
 * User Story following "As a [role], I want [goal], so that [benefit]" format
 */
export interface UserStory {
  role: string;          // e.g., "end user", "admin", "developer"
  goal: string;          // What the user wants to accomplish
  benefit: string;       // Why they want to accomplish it
  acceptanceCriteria: string[];  // List of testable conditions
}

/**
 * Technical Requirements for a feature
 */
export interface TechnicalRequirements {
  apiEndpoints: string[];        // e.g., ["/api/users", "/api/auth/login"]
  dataModels: string[];          // e.g., ["User", "Session", "Profile"]
  libraries: string[];           // e.g., ["bcrypt", "jsonwebtoken"]
  constraints: string[];         // e.g., ["Must support 1000 concurrent users"]
}

/**
 * Feature Dependencies (relationships with other features)
 */
export interface FeatureDependencies {
  requires: string[];    // Feature IDs that must be completed first
  blocks: string[];      // Feature IDs blocked by this one
  relatedTo: string[];   // Feature IDs with related functionality
}

/**
 * Feature represents a single feature/capability to be built with complete PRD details
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'secondary' | 'nice-to-have' | 'custom';
  priority: 'high' | 'medium' | 'low';

  // PRD fields - all required for confirmed feature plans
  userStories: UserStory[];
  technicalRequirements: TechnicalRequirements;
  dependencies: FeatureDependencies;
  effortEstimate: number;        // Story points (1, 2, 3, 5, 8, 13, 21)
  successMetrics: string[];      // e.g., ["90% user satisfaction", "< 2s load time"]
  designNotes: string;           // UX/design considerations
}

/**
 * Screen mapping shows which features appear on which screen
 */
export interface ScreenMapping {
  screenNumber: number;
  screenTitle: string;
  features: string[]; // Feature IDs
  description?: string;
}

export interface IFeaturePlan {
  id: string;
  researchId: string;
  projectId?: string;
  productType: 'website' | 'mobile_app' | 'both';
  features: Feature[];
  screenMappings: ScreenMapping[];
  screenCount: number;
  status: 'draft' | 'confirmed' | 'locked' | 'archived';
  locked: boolean; // When locked, wireframes have been generated
  wireframeId?: string; // Reference to generated wireframe
  reasoning?: string; // Why these features/screens were chosen
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class FeaturePlan implements IFeaturePlan {
  id: string;
  researchId: string;
  projectId?: string;
  productType: 'website' | 'mobile_app' | 'both' = 'website';
  features: Feature[] = [];
  screenMappings: ScreenMapping[] = [];
  screenCount: number = 0;
  status: 'draft' | 'confirmed' | 'locked' | 'archived' = 'draft';
  locked: boolean = false;
  wireframeId?: string;
  reasoning?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number = 1;

  constructor(researchId: string, projectId?: string) {
    this.id = uuidv4();
    this.researchId = researchId;
    this.projectId = projectId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Save feature plan to database
   */
  async save(): Promise<void> {
    const existingResult = await query(
      'SELECT id FROM feature_plans WHERE id = $1',
      [this.id]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE feature_plans
         SET research_id = $1, project_id = $2, product_type = $3, features = $4,
             screen_mappings = $5, screen_count = $6, status = $7, locked = $8,
             wireframe_id = $9, reasoning = $10, updated_at = NOW(), version = version + 1
         WHERE id = $11`,
        [
          this.researchId,
          this.projectId || null,
          this.productType,
          JSON.stringify(this.features),
          JSON.stringify(this.screenMappings),
          this.screenCount,
          this.status,
          this.locked,
          this.wireframeId || null,
          this.reasoning || null,
          this.id,
        ]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO feature_plans
         (id, research_id, project_id, product_type, features, screen_mappings,
          screen_count, status, locked, wireframe_id, reasoning, created_at, updated_at, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          this.id,
          this.researchId,
          this.projectId || null,
          this.productType,
          JSON.stringify(this.features),
          JSON.stringify(this.screenMappings),
          this.screenCount,
          this.status,
          this.locked,
          this.wireframeId || null,
          this.reasoning || null,
          this.createdAt,
          this.updatedAt,
          this.version,
        ]
      );
    }
  }

  /**
   * Find feature plan by ID
   */
  static async findById(id: string): Promise<FeaturePlan | null> {
    const result = await query(
      'SELECT * FROM feature_plans WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapToPlan(result.rows[0]);
  }

  /**
   * Find feature plan by research ID
   */
  static async findByResearchId(researchId: string): Promise<FeaturePlan | null> {
    const result = await query(
      'SELECT * FROM feature_plans WHERE research_id = $1 ORDER BY created_at DESC LIMIT 1',
      [researchId]
    );

    if (result.rows.length === 0) return null;
    return this.mapToPlan(result.rows[0]);
  }

  /**
   * Find all feature plans for a project
   */
  static async findByProjectId(projectId: string): Promise<FeaturePlan[]> {
    const result = await query(
      'SELECT * FROM feature_plans WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    return result.rows.map(row => this.mapToPlan(row));
  }

  /**
   * Delete feature plan
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM feature_plans WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Add feature to the plan
   */
  addFeature(feature: Feature): void {
    if (!this.features.find(f => f.id === feature.id)) {
      this.features.push(feature);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove feature from the plan
   */
  removeFeature(featureId: string): void {
    this.features = this.features.filter(f => f.id !== featureId);
    // Also remove from screen mappings
    this.screenMappings = this.screenMappings.map(sm => ({
      ...sm,
      features: sm.features.filter(fid => fid !== featureId)
    }));
    this.updatedAt = new Date();
  }

  /**
   * Confirm and lock the feature plan (ready for wireframe generation)
   */
  confirm(): void {
    this.status = 'confirmed';
    this.updatedAt = new Date();
  }

  /**
   * Lock the plan after wireframes are generated
   */
  lock(wireframeId: string): void {
    this.locked = true;
    this.status = 'locked';
    this.wireframeId = wireframeId;
    this.updatedAt = new Date();
  }

  /**
   * Map database row to FeaturePlan instance
   */
  private static mapToPlan(row: any): FeaturePlan {
    const plan = new FeaturePlan(row.research_id, row.project_id);
    plan.id = row.id;
    plan.productType = row.product_type;
    plan.features = row.features ? (typeof row.features === 'string' ? JSON.parse(row.features) : row.features) : [];
    plan.screenMappings = row.screen_mappings ? (typeof row.screen_mappings === 'string' ? JSON.parse(row.screen_mappings) : row.screen_mappings) : [];
    plan.screenCount = row.screen_count;
    plan.status = row.status;
    plan.locked = row.locked;
    plan.wireframeId = row.wireframe_id;
    plan.reasoning = row.reasoning;
    plan.createdAt = new Date(row.created_at);
    plan.updatedAt = new Date(row.updated_at);
    plan.version = row.version;

    return plan;
  }
}

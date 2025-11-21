import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export interface IProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed';
  category?: string;
  targetMarket?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export class Project implements IProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed' = 'draft';
  category?: string;
  targetMarket?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  constructor(userId: string, title: string) {
    this.id = uuidv4();
    this.userId = userId;
    this.title = title;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save(): Promise<void> {
    await query(
      `INSERT INTO projects (id, user_id, title, description, status, category, target_market, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        this.id,
        this.userId,
        this.title,
        this.description,
        this.status,
        this.category,
        this.targetMarket,
        this.createdAt,
        this.updatedAt,
      ],
    );
  }

  static async findById(id: string): Promise<Project | null> {
    const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToProject(result.rows[0]);
  }

  static async findByUserId(userId: string): Promise<Project[]> {
    const result = await query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map(row => this.mapToProject(row));
  }

  private static mapToProject(row: any): Project {
    const project = new Project(row.user_id, row.title);
    project.id = row.id;
    project.description = row.description;
    project.status = row.status;
    project.category = row.category;
    project.targetMarket = row.target_market;
    project.createdAt = new Date(row.created_at);
    project.updatedAt = new Date(row.updated_at);
    project.completedAt = row.completed_at ? new Date(row.completed_at) : undefined;
    return project;
  }
}

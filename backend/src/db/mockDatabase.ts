/**
 * Mock in-memory database for development/testing
 * Stores data in memory - data is lost on server restart
 */

import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

export interface MockProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
}

class MockDatabase {
  private users: Map<string, MockUser> = new Map();
  private projects: Map<string, MockProject> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId

  // ============================================================================
  // USER METHODS
  // ============================================================================

  async createUser(email: string, name: string, password: string): Promise<MockUser> {
    // Check if user exists
    if (this.emailIndex.has(email)) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user: MockUser = {
      id: uuid(),
      email,
      name,
      passwordHash,
      role: 'user',
      createdAt: new Date(),
    };

    // Store in memory
    this.users.set(user.id, user);
    this.emailIndex.set(email, user.id);

    return user;
  }

  async getUserByEmail(email: string): Promise<MockUser | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async getUserById(id: string): Promise<MockUser | null> {
    return this.users.get(id) || null;
  }

  async verifyPassword(user: MockUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  // ============================================================================
  // PROJECT METHODS
  // ============================================================================

  async createProject(userId: string, title: string, description: string): Promise<MockProject> {
    const project: MockProject = {
      id: uuid(),
      userId,
      title,
      description,
      createdAt: new Date(),
    };

    this.projects.set(project.id, project);
    return project;
  }

  async getProjectsByUserId(userId: string): Promise<MockProject[]> {
    return Array.from(this.projects.values()).filter((p) => p.userId === userId);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getStats() {
    return {
      users: this.users.size,
      projects: this.projects.size,
      totalMemory: JSON.stringify({
        users: Array.from(this.users.values()),
        projects: Array.from(this.projects.values()),
      }).length,
    };
  }

  reset() {
    this.users.clear();
    this.projects.clear();
    this.emailIndex.clear();
  }
}

// Export singleton instance
export const mockDb = new MockDatabase();

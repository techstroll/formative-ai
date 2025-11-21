import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';

export interface IUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  companyName?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export class User implements IUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  companyName?: string;
  role: 'user' | 'admin' = 'user';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean = true;

  constructor(email: string, name: string, passwordHash?: string) {
    this.id = uuidv4();
    this.email = email;
    this.name = name;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string): Promise<boolean> {
    if (!this.passwordHash) return false;
    return bcrypt.compare(password, this.passwordHash);
  }

  async save(): Promise<void> {
    await query(
      `INSERT INTO users (id, email, name, password_hash, company_name, role, created_at, updated_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        this.id,
        this.email,
        this.name,
        this.passwordHash,
        this.companyName,
        this.role,
        this.createdAt,
        this.updatedAt,
        this.isActive,
      ],
    );
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  private static mapToUser(row: any): User {
    const user = new User(row.email, row.name, row.password_hash);
    user.id = row.id;
    user.companyName = row.company_name;
    user.role = row.role;
    user.createdAt = new Date(row.created_at);
    user.updatedAt = new Date(row.updated_at);
    user.lastLogin = row.last_login ? new Date(row.last_login) : undefined;
    user.isActive = row.is_active;
    return user;
  }
}

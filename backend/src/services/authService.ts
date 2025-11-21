import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { mockDb, MockUser } from '../db/mockDatabase';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
  private jwtExpiry = process.env.JWT_EXPIRY || '24h';
  private useMockDb = process.env.USE_MOCK_DB === 'true'; // Use PostgreSQL by default

  async register(email: string, name: string, password: string): Promise<AuthUser> {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (this.useMockDb) {
      try {
        const user = await mockDb.createUser(email, name, password);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Registration failed');
      }
    } else {
      // Original PostgreSQL implementation
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const passwordHash = await User.hashPassword(password);
      const user = new User(email, name, passwordHash);
      await user.save();

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    if (this.useMockDb) {
      const user = await mockDb.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await mockDb.verifyPassword(user, password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const token = this.generateToken(authUser);
      return { user: authUser, token };
    } else {
      // Original PostgreSQL implementation
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const token = this.generateToken(authUser);
      return { user: authUser, token };
    }
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    if (this.useMockDb) {
      const user = await mockDb.getUserById(userId);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } else {
      const user = await User.findById(userId);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  }

  generateToken(user: AuthUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: '24h',
    };

    return jwt.sign(payload, this.jwtSecret, options);
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const authService = new AuthService();

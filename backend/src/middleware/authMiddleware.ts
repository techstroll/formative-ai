import { Request, Response, NextFunction } from 'express';
import { authService, JWTPayload } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        error: true,
        code: 'NO_TOKEN',
        message: 'No authentication token provided',
      });
    }

    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const err = error as Error;
    res.status(401).json({
      error: true,
      code: 'INVALID_TOKEN',
      message: err.message,
    });
  }
};

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

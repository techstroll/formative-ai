import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

/**
 * Custom error interface for application errors
 */
export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log the error
  const errorLog = {
    message: err.message,
    status: err.status || 500,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    details: err.details,
  };

  logger.error(JSON.stringify(errorLog));

  // Determine status code
  const statusCode = err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: true,
    status: statusCode,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { details: err.details }),
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
export const validationError = (
  status: number = 400,
  message: string = 'Validation failed',
  details?: any,
): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  return error;
};

/**
 * Authentication error handler
 */
export const authError = (message: string = 'Unauthorized'): AppError => {
  const error: AppError = new Error(message);
  error.status = 401;
  error.code = 'AUTHENTICATION_ERROR';
  return error;
};

/**
 * Not found error handler
 */
export const notFoundError = (resource: string = 'Resource'): AppError => {
  const error: AppError = new Error(`${resource} not found`);
  error.status = 404;
  error.code = 'NOT_FOUND';
  return error;
};

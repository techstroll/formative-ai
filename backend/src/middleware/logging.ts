import { Request, Response, NextFunction } from 'express';
import path from 'path';

/**
 * Simple logger utility for the application
 */
export const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  error: (message: string) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  },
};

/**
 * Request logging middleware
 * Logs details about incoming requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response
  res.send = function (data: any) {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    };

    if (res.statusCode >= 400) {
      logger.warn(JSON.stringify(log));
    } else {
      logger.debug(JSON.stringify(log));
    }

    return originalSend.call(this, data);
  };

  next();
};

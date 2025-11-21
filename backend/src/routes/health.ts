import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * Returns the current health status of the backend service
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * Readiness check endpoint
 * Used by load balancers to determine if service is ready for traffic
 */
router.get('/ready', (req: Request, res: Response) => {
  // TODO: Check database connection, Redis connection, etc.
  res.json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Liveness check endpoint
 * Used by orchestration systems to determine if service is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;

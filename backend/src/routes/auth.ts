import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/v1/auth/signup
 */
router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      throw validationError(400, 'email, name, and password are required');
    }

    const user = await authService.register(email, name, password);
    const token = authService.generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  }),
);

/**
 * POST /api/v1/auth/login
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw validationError(400, 'email and password are required');
    }

    const { user, token } = await authService.login(email, password);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  }),
);

/**
 * GET /api/v1/auth/me
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getUserById(req.user!.userId);

    if (!user) {
      throw validationError(404, 'User not found');
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }),
);

export default router;

import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/prototypes
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ artifacts: [] });
  }),
);

/**
 * POST /api/v1/prototypes
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId, wireframeId, title } = req.body;

    if (!projectId || !title) {
      throw validationError(400, 'projectId and title are required');
    }

    res.status(201).json({
      id: 'prototype-id',
      projectId,
      wireframeId,
      title,
    });
  }),
);

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json({ id: req.params.id });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json({ id: req.params.id, updated: true });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.status(204).send();
}));

export default router;

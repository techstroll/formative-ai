import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/prds
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ artifacts: [] });
  }),
);

/**
 * POST /api/v1/prds
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId, title } = req.body;

    if (!projectId || !title) {
      throw validationError(400, 'projectId and title are required');
    }

    res.status(201).json({
      id: 'prd-id',
      projectId,
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

/**
 * POST /api/v1/prds/:id/export
 * Export PRD in various formats (docx, pdf)
 */
router.post(
  '/:id/export',
  asyncHandler(async (req: Request, res: Response) => {
    const { format } = req.body;
    const { id } = req.params;

    res.json({
      id,
      format: format || 'docx',
      exported: true,
    });
  }),
);

export default router;

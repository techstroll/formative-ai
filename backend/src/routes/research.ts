import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';
import { researchService, ResearchRequest } from '../services/researchService';
import { featurePlanningService } from '../services/featurePlanningService';

const router = Router();

/**
 * POST /api/v1/research
 * Start async research generation
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { topic, targetAudience, competitors, geographicFocus, projectId } = req.body;

    // Validate required fields
    if (!topic) {
      throw validationError(400, 'topic is required');
    }

    const researchRequest: ResearchRequest = {
      topic,
      targetAudience: targetAudience || 'General audience',
      competitors: Array.isArray(competitors) ? competitors : [],
      geographicFocus: geographicFocus || 'Global',
      projectId: projectId || undefined,
    };

    try {
      const { id } = await researchService.startResearch(req.user!.userId, researchRequest);

      res.status(202).json({
        id,
        status: 'generating',
        message: 'Research generation started. Check back for results.',
      });
    } catch (error) {
      throw validationError(500, error instanceof Error ? error.message : 'Failed to start research');
    }
  }),
);

/**
 * GET /api/v1/research/:id
 * Get research status and results
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const research = await researchService.getResearch(id);

    if (!research) {
      throw validationError(404, `Research ${id} not found`);
    }

    res.json(research);
  }),
);

/**
 * GET /api/v1/research
 * Retrieve all research for current user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const allResearch = await researchService.getAllResearchForUser(req.user!.userId);

    res.json({
      count: allResearch.length,
      research: allResearch,
    });
  }),
);

/**
 * GET /api/v1/research/:id/readiness
 * Check if research is ready for wireframe generation
 */
router.get(
  '/:id/readiness',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const research = await researchService.getResearch(id);

    if (!research) {
      throw validationError(404, `Research ${id} not found`);
    }

    // Check if research is complete and has necessary data
    const isReady =
      research.status === 'completed' &&
      research.executiveSummary &&
      research.marketAnalysis;

    const missingFields: string[] = [];
    if (!research.executiveSummary) missingFields.push('executiveSummary');
    if (!research.marketAnalysis) missingFields.push('marketAnalysis');

    res.json({
      isReady,
      status: research.status,
      completionPercentage: calculateCompletion(research),
      missingFields,
      message: isReady
        ? 'Research is ready for wireframe generation'
        : `Research is not ready. Missing: ${missingFields.join(', ')}`,
    });
  }),
);

/**
 * POST /api/v1/research/:researchId/features
 * Create feature plan from research
 */
router.post(
  '/:researchId/features',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    // Get research data
    const research = await researchService.getResearch(researchId);
    if (!research) {
      throw validationError(404, `Research ${researchId} not found`);
    }

    // Create feature plan with AI suggestions
    const featurePlan = await featurePlanningService.createFeaturePlan(
      researchId,
      research,
      req.user!.userId
    );

    res.status(201).json({
      id: featurePlan.id,
      status: 'created',
      message: 'Feature plan created with AI suggestions',
      featurePlan,
    });
  })
);

/**
 * Helper function to calculate research completion percentage
 */
function calculateCompletion(research: any): number {
  const fields = [
    'executiveSummary',
    'marketAnalysis',
    'targetAudience',
    'swot',
    'competitorMatrix',
    'keyInsights',
    'recommendations',
  ];

  const completedFields = fields.filter((field) => {
    const value = research[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  });

  return Math.round((completedFields.length / fields.length) * 100);
}

export default router;

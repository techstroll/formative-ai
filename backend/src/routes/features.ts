import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';
import { featurePlanningService, FeaturePlanResult } from '../services/featurePlanningService';
import { researchService } from '../services/researchService';
import { Feature, FeaturePlan } from '../models/FeaturePlan';
import { validateFeaturePlan } from '../services/featureValidation';

const router = Router();

/**
 * POST /api/v1/research/:researchId/features
 * Create feature plan from research
 */
router.post(
  '/research/:researchId/features',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;
    const { projectId } = req.body;

    // Get research data
    const research = await researchService.getResearch(researchId);
    if (!research) {
      throw validationError(404, `Research ${researchId} not found`);
    }

    // Create feature plan with AI suggestions
    const featurePlan = await featurePlanningService.createFeaturePlan(
      researchId,
      research,
      projectId
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
 * GET /api/v1/research/:researchId/features
 * Get feature plan for research
 */
router.get(
  '/research/:researchId/features',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    const featurePlan = await featurePlanningService.getFeaturePlanByResearchId(researchId);

    if (!featurePlan) {
      throw validationError(404, `Feature plan for research ${researchId} not found`);
    }

    res.json(featurePlan);
  })
);

/**
 * GET /api/v1/features/:planId
 * Get feature plan by ID
 */
router.get(
  '/:planId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    const featurePlan = await featurePlanningService.getFeaturePlan(planId);

    if (!featurePlan) {
      throw validationError(404, `Feature plan ${planId} not found`);
    }

    res.json(featurePlan);
  })
);

/**
 * PATCH /api/v1/features/:planId
 * Update feature plan
 */
router.patch(
  '/:planId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;
    const { productType, features, screenMappings } = req.body;

    const updates: any = {};
    if (productType) updates.productType = productType;
    if (features) updates.features = features;
    if (screenMappings) updates.screenMappings = screenMappings;

    const featurePlan = await featurePlanningService.updateFeaturePlan(planId, updates);

    res.json({
      status: 'updated',
      message: 'Feature plan updated successfully',
      featurePlan,
    });
  })
);

/**
 * POST /api/v1/features/:planId/confirm
 * Confirm feature plan (ready for wireframe generation)
 */
router.post(
  '/:planId/confirm',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    const featurePlan = await featurePlanningService.confirmFeaturePlan(planId);

    res.json({
      status: 'confirmed',
      message: 'Feature plan confirmed. Ready for wireframe generation.',
      featurePlan,
    });
  })
);

/**
 * POST /api/v1/features/:planId/lock
 * Lock feature plan after wireframe generation
 */
router.post(
  '/:planId/lock',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;
    const { wireframeId } = req.body;

    if (!wireframeId) {
      throw validationError(400, 'wireframeId is required');
    }

    const featurePlan = await featurePlanningService.lockFeaturePlan(planId, wireframeId);

    res.json({
      status: 'locked',
      message: 'Feature plan locked. No further modifications allowed.',
      featurePlan,
    });
  })
);

/**
 * POST /api/v1/features/:planId/features
 * Add custom feature to plan
 * Note: Expects complete feature object with PRD details in request body
 */
router.post(
  '/:planId/features',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;
    const feature = req.body;

    // Validate required basic fields
    if (!feature.name || !feature.description) {
      throw validationError(400, 'name and description are required');
    }

    // Set defaults for basic fields if not provided
    const featureWithDefaults: Omit<Feature, 'id'> = {
      name: feature.name,
      description: feature.description,
      category: feature.category || 'custom',
      priority: feature.priority || 'medium',

      // PRD fields with defaults
      userStories: feature.userStories || [{
        role: 'user',
        goal: 'use this feature',
        benefit: 'accomplish my task',
        acceptanceCriteria: ['Feature functions as expected']
      }],
      technicalRequirements: feature.technicalRequirements || {
        apiEndpoints: [],
        dataModels: [],
        libraries: [],
        constraints: []
      },
      dependencies: feature.dependencies || {
        requires: [],
        blocks: [],
        relatedTo: []
      },
      effortEstimate: feature.effortEstimate || 5,
      successMetrics: feature.successMetrics || ['Define success metrics'],
      designNotes: feature.designNotes || 'No design notes provided'
    };

    const featurePlan = await featurePlanningService.addFeature(planId, featureWithDefaults);

    res.status(201).json({
      status: 'created',
      message: 'Feature added to plan',
      featurePlan,
    });
  })
);

/**
 * DELETE /api/v1/features/:planId/features/:featureId
 * Remove feature from plan
 */
router.delete(
  '/:planId/features/:featureId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { planId, featureId } = req.params;

    const featurePlan = await featurePlanningService.removeFeature(planId, featureId);

    res.json({
      status: 'deleted',
      message: 'Feature removed from plan',
      featurePlan,
    });
  })
);

/**
 * POST /api/v1/features/:planId/validate
 * Validate feature plan without confirming
 */
router.post(
  '/:planId/validate',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    const plan = await FeaturePlan.findById(planId);
    if (!plan) {
      throw validationError(404, `Feature plan ${planId} not found`);
    }

    const validation = validateFeaturePlan(plan);

    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      featureCount: plan.features.length
    });
  })
);

export default router;

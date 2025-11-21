import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';
import { wireframeService } from '../services/wireframeService';
import { researchService } from '../services/researchService';
import { featurePlanningService } from '../services/featurePlanningService';
import { WireframeArtifact } from '../models/WireframeArtifact';
import { query } from '../config/database';

const router = Router();

/**
 * GET /api/v1/wireframes/project/:projectId
 * Get all wireframes for a project
 */
router.get(
  '/project/:projectId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const wireframes = await WireframeArtifact.findByProjectId(projectId);

    res.json({
      count: wireframes.length,
      wireframes: wireframes.map(w => ({
        id: w.id,
        title: w.title,
        designType: w.designType,
        status: w.status,
        researchId: w.researchId,
        screenCount: w.screens ? Object.keys(w.screens).length : 0,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
    });
  }),
);

/**
 * POST /api/v1/wireframes/generate-from-research
 * Generate wireframes from research data
 */
router.post(
  '/generate-from-research',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId, projectId, title } = req.body;

    if (!researchId) {
      throw validationError(400, 'researchId is required');
    }

    // Fetch research data
    const research = await researchService.getResearch(researchId);
    if (!research) {
      throw validationError(404, 'Research not found');
    }

    // Check if completed
    if (research.status !== 'completed') {
      throw validationError(400, 'Research must be completed before generating wireframes');
    }

    // Fetch feature plan for this research (REQUIRED)
    const featurePlan = await featurePlanningService.getFeaturePlanByResearchId(researchId);

    // Validate feature plan exists and is confirmed
    if (!featurePlan) {
      throw validationError(
        400,
        'Feature plan is required before wireframe generation. Please create and confirm a feature plan first.'
      );
    }

    // Validate feature plan status (must be confirmed or locked)
    if (featurePlan.status !== 'confirmed' && featurePlan.status !== 'locked') {
      throw validationError(
        400,
        `Feature plan must be confirmed before wireframe generation. Current status: ${featurePlan.status}. Please confirm the feature plan first.`
      );
    }

    console.log(`✓ Feature plan validated: ${featurePlan.id} (status: ${featurePlan.status}, ${featurePlan.features.length} features, ${featurePlan.screenCount} screens)`);

    // Generate wireframes with validated feature plan
    const result = await wireframeService.generateWireframes(research, {
      researchId,
      projectId,
      title: title || `Wireframes: ${research.request.topic}`,
      featurePlan: featurePlan,
    });

    if (result.status === 'error') {
      console.error('Wireframe generation error:', result.error);
      throw validationError(500, `Wireframe generation failed: ${result.error}`);
    }

    if (!result.layout || !result.layout.screens || result.layout.screens.length === 0) {
      console.error('Wireframe layout invalid:', { layout: result.layout });
      throw validationError(500, 'Wireframe generation produced no layout data');
    }

    // Save to database
    // projectId is optional - pass null if not provided or if "default" string is passed
    const finalProjectId = (projectId && projectId !== 'default') ? projectId : undefined;
    const artifact = new WireframeArtifact(
      result.title,
      result.designType,
      finalProjectId
    );

    // Only set research_id if it actually exists in research_artifacts table
    // The research might exist in research_sessions but not yet in research_artifacts
    if (researchId) {
      try {
        const existingResearch = await query(
          'SELECT id FROM research_artifacts WHERE id = $1',
          [researchId]
        );
        if (existingResearch.rows.length > 0) {
          artifact.researchId = researchId;
          console.log(`Research ID ${researchId} found in database, linking to wireframe`);
        } else {
          console.warn(`Research ID ${researchId} not found in research_artifacts table, proceeding without FK reference`);
        }
      } catch (err) {
        console.warn(`Could not validate research_id ${researchId}:`, err);
      }
    }

    artifact.svgContent = result.svgContent;
    artifact.layoutJson = result.layout;
    artifact.suggestedComponents = result.suggestedComponents;
    artifact.designSuggestions = result.designSuggestions;
    artifact.screens = result.layout.screens?.reduce((acc, screen) => {
      acc[screen.id] = screen;
      return acc;
    }, {} as Record<string, any>) || {};
    artifact.status = 'generated';

    console.log(`Saving wireframe artifact: ${artifact.id} with ${artifact.screens ? Object.keys(artifact.screens).length : 0} screens, researchId: ${artifact.researchId || 'none'}`);

    try {
      await artifact.save();
      console.log(`✓ Wireframe artifact saved successfully: ${artifact.id}`);
    } catch (saveError) {
      console.error('Failed to save wireframe artifact:', {
        wireframeId: artifact.id,
        error: saveError instanceof Error ? saveError.message : saveError,
        stack: saveError instanceof Error ? saveError.stack : undefined,
      });
      throw validationError(500, `Failed to save wireframe: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
    }

    const responseData = {
      id: artifact.id,
      projectId: artifact.projectId,
      title: artifact.title,
      designType: artifact.designType,
      status: artifact.status,
      researchId: artifact.researchId || null,
      screenCount: result.screenCount,
      suggestedComponents: artifact.suggestedComponents || [],
      designSuggestions: artifact.designSuggestions || [],
      createdAt: artifact.createdAt ? new Date(artifact.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: artifact.updatedAt ? new Date(artifact.updatedAt).toISOString() : new Date().toISOString(),
      version: artifact.version,
    };

    console.log(`Returning wireframe response (size: ${JSON.stringify(responseData).length} bytes):`, JSON.stringify(responseData));
    res.status(201).json(responseData);
  }),
);

/**
 * GET /api/v1/wireframes/:id
 * Get wireframe details
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log(`[GET Wireframe] Fetching wireframe with ID: ${id}`);

    const wireframe = await WireframeArtifact.findById(id);

    console.log(`[GET Wireframe] Query result:`, wireframe ? { id: wireframe.id, title: wireframe.title } : 'NOT FOUND');

    if (!wireframe) {
      console.warn(`[GET Wireframe] Wireframe not found in database for ID: ${id}`);
      throw validationError(404, 'Wireframe not found');
    }

    const responseData = {
      id: wireframe.id,
      projectId: wireframe.projectId,
      researchId: wireframe.researchId,
      title: wireframe.title,
      designType: wireframe.designType,
      status: wireframe.status,
      screenCount: wireframe.screens ? Object.keys(wireframe.screens).length : 0,
      suggestedComponents: wireframe.suggestedComponents || [],
      designSuggestions: wireframe.designSuggestions || [],
      layout: wireframe.layoutJson || null,
      createdAt: wireframe.createdAt ? new Date(wireframe.createdAt).toISOString() : null,
      updatedAt: wireframe.updatedAt ? new Date(wireframe.updatedAt).toISOString() : null,
      version: wireframe.version,
    };

    console.log(`[GET Wireframe] Returning data:`, responseData);
    res.json(responseData);
  }),
);

/**
 * GET /api/v1/wireframes/:id/svg
 * Get wireframe SVG content
 */
router.get(
  '/:id/svg',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const wireframe = await WireframeArtifact.findById(id);

    if (!wireframe) {
      throw validationError(404, 'Wireframe not found');
    }

    if (!wireframe.svgContent) {
      throw validationError(400, 'SVG content not available');
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `inline; filename="${wireframe.title}.svg"`);
    res.send(wireframe.svgContent);
  }),
);

/**
 * GET /api/v1/wireframes/:id/screens/:screenIndex
 * Get specific screen preview
 */
router.get(
  '/:id/screens/:screenIndex',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id, screenIndex } = req.params;

    const wireframe = await WireframeArtifact.findById(id);

    if (!wireframe) {
      throw validationError(404, 'Wireframe not found');
    }

    if (!wireframe.layoutJson) {
      throw validationError(400, 'Layout data not available');
    }

    const index = parseInt(screenIndex, 10);
    const screen = wireframeService.getScreen(wireframe.layoutJson as any, index);

    if (!screen) {
      throw validationError(404, `Screen ${index} not found`);
    }

    res.json({
      id: screen.id,
      name: screen.name,
      title: screen.title,
      description: screen.description,
      blockCount: screen.blocks.length,
      blocks: screen.blocks.map(block => ({
        id: block.id,
        type: block.type,
        title: block.title,
        position: block.position,
        size: block.size,
      })),
    });
  }),
);

/**
 * PUT /api/v1/wireframes/:id
 * Update wireframe status
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw validationError(400, 'status is required');
    }

    const validStatuses = ['draft', 'generated', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw validationError(400, `Invalid status: ${status}`);
    }

    const wireframe = await WireframeArtifact.findById(id);

    if (!wireframe) {
      throw validationError(404, 'Wireframe not found');
    }

    wireframe.status = status as any;
    await wireframe.save();

    res.json({
      id: wireframe.id,
      status: wireframe.status,
      updated: true,
    });
  }),
);

/**
 * DELETE /api/v1/wireframes/:id
 * Delete wireframe
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const wireframe = await WireframeArtifact.findById(id);

    if (!wireframe) {
      throw validationError(404, 'Wireframe not found');
    }

    await WireframeArtifact.delete(id);

    res.json({
      success: true,
      message: 'Wireframe deleted',
    });
  }),
);

export default router;

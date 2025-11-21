import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';
import { ValidationWorkflow } from '../models/ValidationWorkflow';
import { emailService } from '../services/emailService';

const router = Router();

/**
 * GET /api/v1/validation/pending
 * Get all pending validations for current user's projects
 */
router.get(
  '/pending',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    // This would require fetching user's projects first
    // For now, returning empty list - can be enhanced later
    res.json({
      count: 0,
      pending: [],
    });
  }),
);

/**
 * POST /api/v1/validation
 * Create a new validation workflow (send approval email)
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { artifactId, artifactType, projectId, reviewerEmail } = req.body;

    if (!artifactId || !artifactType || !projectId || !reviewerEmail) {
      throw validationError(400, 'artifactId, artifactType, projectId, and reviewerEmail are required');
    }

    // Validate artifact type
    const validTypes = ['research', 'wireframe', 'prototype', 'prd'];
    if (!validTypes.includes(artifactType)) {
      throw validationError(400, `Invalid artifactType: ${artifactType}`);
    }

    // Create validation workflow
    const workflow = new ValidationWorkflow(
      artifactId,
      artifactType as any,
      projectId,
      reviewerEmail
    );

    await workflow.save();

    // Generate validation URLs
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const previewUrl = `${appUrl}/${artifactType}/${artifactId}`;
    const approveUrl = `${appUrl}/validate/${workflow.approvalToken}/approve`;
    const rejectUrl = `${appUrl}/validate/${workflow.approvalToken}/reject`;

    // Send validation email (in demo mode, just logs)
    await emailService.sendValidationEmail({
      to: reviewerEmail,
      artifactId,
      artifactType: artifactType as any,
      approveUrl,
      rejectUrl,
      previewUrl,
    });

    res.status(201).json({
      id: workflow.id,
      artifactId: workflow.artifactId,
      artifactType: workflow.artifactType,
      reviewerEmail: workflow.reviewerEmail,
      status: workflow.status,
      approvalToken: workflow.approvalToken,
      createdAt: workflow.createdAt,
      expiresAt: workflow.expiresAt,
    });
  }),
);

/**
 * GET /api/v1/validation/:token
 * Retrieve validation workflow by token (for email links)
 */
router.get(
  '/:token',
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    const workflow = await ValidationWorkflow.findByToken(token);

    if (!workflow) {
      throw validationError(404, 'Validation workflow not found');
    }

    if (workflow.isExpired()) {
      throw validationError(410, 'Validation workflow has expired');
    }

    res.json({
      id: workflow.id,
      artifactId: workflow.artifactId,
      artifactType: workflow.artifactType,
      status: workflow.status,
      feedback: workflow.feedback,
    });
  }),
);

/**
 * POST /api/v1/validation/:token/approve
 * Approve an artifact via validation token
 */
router.post(
  '/:token/approve',
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { feedback } = req.body;

    const workflow = await ValidationWorkflow.findByToken(token);

    if (!workflow) {
      throw validationError(404, 'Validation workflow not found');
    }

    if (workflow.isExpired()) {
      throw validationError(410, 'Validation workflow has expired');
    }

    if (workflow.status !== 'pending') {
      throw validationError(400, `Workflow is already ${workflow.status}`);
    }

    // Approve the workflow
    await workflow.approve(feedback);

    res.json({
      id: workflow.id,
      status: 'approved',
      message: 'Artifact approved successfully',
      feedback: workflow.feedback,
    });
  }),
);

/**
 * POST /api/v1/validation/:token/reject
 * Reject an artifact via validation token
 */
router.post(
  '/:token/reject',
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { feedback } = req.body;

    const workflow = await ValidationWorkflow.findByToken(token);

    if (!workflow) {
      throw validationError(404, 'Validation workflow not found');
    }

    if (workflow.isExpired()) {
      throw validationError(410, 'Validation workflow has expired');
    }

    if (workflow.status !== 'pending') {
      throw validationError(400, `Workflow is already ${workflow.status}`);
    }

    // Reject the workflow
    await workflow.reject(feedback);

    res.json({
      id: workflow.id,
      status: 'rejected',
      message: 'Artifact rejected. Changes requested.',
      feedback: workflow.feedback,
    });
  }),
);

export default router;

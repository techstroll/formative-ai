import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import { query } from '../config/database';

const router = Router();

/**
 * POST /api/v1/projects
 * Create a new project
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, category, targetMarket } = req.body;

    if (!title) {
      throw validationError(400, 'title is required');
    }

    const project = new Project(req.user!.userId, title);
    project.description = description;
    project.category = category;
    project.targetMarket = targetMarket;

    await project.save();

    res.status(201).json({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      targetMarket: project.targetMarket,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  }),
);

/**
 * GET /api/v1/projects/:id
 * Get project details
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      throw validationError(404, 'Project not found');
    }

    // Verify ownership (basic auth check)
    if (project.userId !== req.user!.userId) {
      throw validationError(403, 'Unauthorized: You do not have access to this project');
    }

    res.json({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      targetMarket: project.targetMarket,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      completedAt: project.completedAt,
    });
  }),
);

/**
 * GET /api/v1/projects
 * Get all projects for current user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const projects = await Project.findByUserId(req.user!.userId);

    res.json({
      count: projects.length,
      projects: projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  }),
);

/**
 * PUT /api/v1/projects/:id
 * Update project
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, category, targetMarket, status } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      throw validationError(404, 'Project not found');
    }

    // Verify ownership
    if (project.userId !== req.user!.userId) {
      throw validationError(403, 'Unauthorized: You cannot modify this project');
    }

    // Update fields if provided
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (category !== undefined) project.category = category;
    if (targetMarket !== undefined) project.targetMarket = targetMarket;

    if (status) {
      const validStatuses = ['draft', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        throw validationError(400, `Invalid status: ${status}`);
      }
      project.status = status as any;
      if (status === 'completed') {
        project.completedAt = new Date();
      }
    }

    project.updatedAt = new Date();

    // Update in database
    await query(
      `UPDATE projects
       SET title = $1, description = $2, category = $3, target_market = $4, status = $5, completed_at = $6, updated_at = $7
       WHERE id = $8`,
      [
        project.title,
        project.description,
        project.category,
        project.targetMarket,
        project.status,
        project.completedAt,
        project.updatedAt,
        id,
      ],
    );

    res.json({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      targetMarket: project.targetMarket,
      status: project.status,
      updatedAt: project.updatedAt,
      completedAt: project.completedAt,
    });
  }),
);

/**
 * DELETE /api/v1/projects/:id
 * Delete project
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      throw validationError(404, 'Project not found');
    }

    // Verify ownership
    if (project.userId !== req.user!.userId) {
      throw validationError(403, 'Unauthorized: You cannot delete this project');
    }

    // Delete from database (cascade deletes via foreign keys)
    await query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  }),
);

export default router;

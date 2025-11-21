import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';
import { fileUploadService } from '../services/fileUploadService';
import { FileUpload } from '../models/FileUpload';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
    ];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

/**
 * POST /api/v1/uploads
 * Upload a file associated with research or project
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw validationError(400, 'No file provided');
    }

    const { projectId, researchId } = req.body;

    if (!projectId) {
      throw validationError(400, 'projectId is required');
    }

    // Create file upload record
    const fileUpload = new FileUpload(
      req.user!.userId,
      projectId,
      req.file.originalname,
      req.file.filename,
      req.file.path
    );

    fileUpload.mimetype = req.file.mimetype;
    fileUpload.fileSize = req.file.size;
    fileUpload.fileType = path.extname(req.file.originalname).slice(1).toUpperCase();

    if (researchId) {
      fileUpload.researchId = researchId;
    }

    // Parse file data if CSV
    if (req.file.mimetype === 'text/csv') {
      try {
        const competitors = fileUploadService.parseCSVCompetitors(req.file.path);
        fileUpload.parsedData = {
          format: 'csv',
          rowCount: competitors.length,
          data: competitors,
        };
        fileUpload.fileType = 'CSV';
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    }

    // Save to database
    await fileUpload.save();

    res.status(201).json({
      id: fileUpload.id,
      filename: fileUpload.filename,
      originalName: fileUpload.originalName,
      fileSize: fileUpload.fileSize,
      fileType: fileUpload.fileType,
      mimetype: fileUpload.mimetype,
      uploadedAt: fileUpload.createdAt,
      parsedData: fileUpload.parsedData,
    });
  }),
);

/**
 * GET /api/v1/uploads/research/:researchId
 * Get all files for a research
 */
router.get(
  '/research/:researchId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    const files = await FileUpload.findByResearchId(researchId);

    res.json({
      count: files.length,
      files: files.map(f => ({
        id: f.id,
        filename: f.filename,
        originalName: f.originalName,
        fileSize: f.fileSize,
        fileType: f.fileType,
        status: f.status,
        uploadedAt: f.createdAt,
      })),
    });
  }),
);

/**
 * GET /api/v1/uploads/project/:projectId
 * Get all files for a project
 */
router.get(
  '/project/:projectId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const files = await FileUpload.findByProjectId(projectId);

    res.json({
      count: files.length,
      files: files.map(f => ({
        id: f.id,
        filename: f.filename,
        originalName: f.originalName,
        fileSize: f.fileSize,
        fileType: f.fileType,
        researchId: f.researchId,
        status: f.status,
        uploadedAt: f.createdAt,
      })),
    });
  }),
);

/**
 * GET /api/v1/uploads/:id
 * Get file metadata
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const fileUpload = await FileUpload.findById(id);

    if (!fileUpload) {
      throw validationError(404, 'File not found');
    }

    res.json({
      id: fileUpload.id,
      filename: fileUpload.filename,
      originalName: fileUpload.originalName,
      fileSize: fileUpload.fileSize,
      fileType: fileUpload.fileType,
      mimetype: fileUpload.mimetype,
      researchId: fileUpload.researchId,
      status: fileUpload.status,
      uploadedAt: fileUpload.createdAt,
      parsedData: fileUpload.parsedData,
    });
  }),
);

/**
 * DELETE /api/v1/uploads/:id
 * Delete a file
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const fileUpload = await FileUpload.findById(id);

    if (!fileUpload) {
      throw validationError(404, 'File not found');
    }

    // Check authorization (user can only delete their own files)
    if (fileUpload.userId !== req.user!.userId) {
      throw validationError(403, 'Unauthorized');
    }

    // Delete from disk
    fileUploadService.deleteFile(fileUpload.filename);

    // Delete from database
    await FileUpload.delete(id);

    res.json({
      success: true,
      message: 'File deleted',
    });
  }),
);

export default router;

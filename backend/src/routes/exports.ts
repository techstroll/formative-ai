import { Router, Request, Response } from 'express';
import { asyncHandler, validationError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';
import { researchService } from '../services/researchService';
import { documentService } from '../services/documentService';
import { ResearchSession } from '../models/ResearchSession';

const router = Router();

/**
 * GET /api/v1/exports/research/:researchId/html
 * Export research as HTML document
 */
router.get(
  '/research/:researchId/html',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    const research = await researchService.getResearch(researchId);

    if (!research) {
      throw validationError(404, 'Research not found');
    }

    // Generate HTML export
    const htmlContent = documentService.exportToHTML(research);

    // Set response headers for download
    const filename = documentService.generateExportFilename(research.request.topic, 'html');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(htmlContent);
  }),
);

/**
 * GET /api/v1/exports/research/:researchId/text
 * Export research as plain text
 */
router.get(
  '/research/:researchId/text',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    const research = await researchService.getResearch(researchId);

    if (!research) {
      throw validationError(404, 'Research not found');
    }

    // Generate text export
    const textContent = documentService.exportToText(research);
    const filename = documentService.generateExportFilename(research.request.topic, 'txt');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(textContent);
  }),
);

/**
 * GET /api/v1/exports/research/:researchId/json
 * Export research as JSON
 */
router.get(
  '/research/:researchId/json',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    const research = await researchService.getResearch(researchId);

    if (!research) {
      throw validationError(404, 'Research not found');
    }

    // Generate JSON export
    const jsonContent = documentService.exportToJSON(research);
    const filename = documentService.generateExportFilename(research.request.topic, 'json');

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(jsonContent);
  }),
);

/**
 * POST /api/v1/exports/research/:researchId/preview
 * Preview research export (returns JSON preview of content)
 */
router.get(
  '/research/:researchId/preview',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    const research = await researchService.getResearch(researchId);

    if (!research) {
      throw validationError(404, 'Research not found');
    }

    // Return preview data
    res.json({
      id: research.id,
      status: research.status,
      topic: research.request.topic,
      targetAudience: research.request.targetAudience,
      competitors: research.request.competitors,
      geographicFocus: research.request.geographicFocus,
      generatedAt: research.generatedAt,
      executiveSummary: research.executiveSummary,
      sections: {
        marketAnalysis: research.marketAnalysis ? research.marketAnalysis.substring(0, 300) + '...' : undefined,
        swot: {
          strengths: research.swot?.strengths?.length || 0,
          weaknesses: research.swot?.weaknesses?.length || 0,
          opportunities: research.swot?.opportunities?.length || 0,
          threats: research.swot?.threats?.length || 0,
        },
        competitorCount: Object.keys(research.competitorMatrix || {}).length,
        keyInsights: research.keyInsights?.length || 0,
        recommendations: research.recommendations?.length || 0,
      },
      exportOptions: {
        html: `/api/v1/exports/research/${researchId}/html`,
        text: `/api/v1/exports/research/${researchId}/text`,
        json: `/api/v1/exports/research/${researchId}/json`,
      },
    });
  }),
);

/**
 * GET /api/v1/exports/research/:researchId/formats
 * Get available export formats for a research
 */
router.get(
  '/research/:researchId/formats',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { researchId } = req.params;

    const research = await researchService.getResearch(researchId);

    if (!research) {
      throw validationError(404, 'Research not found');
    }

    res.json({
      researchId,
      topic: research.request.topic,
      availableFormats: [
        {
          format: 'html',
          mimetype: 'text/html',
          description: 'Professional HTML report',
          url: `/api/v1/exports/research/${researchId}/html`,
        },
        {
          format: 'text',
          mimetype: 'text/plain',
          description: 'Plain text markdown format',
          url: `/api/v1/exports/research/${researchId}/text`,
        },
        {
          format: 'json',
          mimetype: 'application/json',
          description: 'Structured JSON data',
          url: `/api/v1/exports/research/${researchId}/json`,
        },
      ],
    });
  }),
);

export default router;

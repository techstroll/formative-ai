/**
 * Research Service - Orchestrates research generation via FastAPI pipeline
 * Now uses PostgreSQL via ResearchSession model
 */

import { ResearchSession } from '../models/ResearchSession';

export interface ResearchRequest {
  topic: string;
  targetAudience?: string;
  competitors?: string[];
  geographicFocus?: string;
  projectId?: string;
}

export interface ResearchResult {
  id: string;
  status: 'generating' | 'completed' | 'error';
  request: ResearchRequest;
  executiveSummary?: string;
  marketAnalysis?: string;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitorMatrix?: Record<string, any>;
  keyInsights?: string[];
  recommendations?: string[];
  generatedAt?: string;
  error?: string;
  createdAt: Date;
}

class ResearchService {
  private aiPipelineUrl = process.env.AI_PIPELINE_URL || 'http://localhost:8000';

  /**
   * Start async research generation
   */
  async startResearch(userId: string, request: ResearchRequest): Promise<{ id: string }> {
    // Create research session in database
    const session = new ResearchSession(userId, request.topic);
    session.targetAudience = request.targetAudience;
    session.competitors = request.competitors?.join(',');
    session.geographicFocus = request.geographicFocus;
    session.projectId = request.projectId;

    await session.save();

    // Trigger async research generation (non-blocking)
    this.generateResearchAsync(session.id, userId, request).catch((error) => {
      console.error(`Research ${session.id} failed:`, error);
    });

    return { id: session.id };
  }

  /**
   * Get research status and results
   */
  async getResearch(researchId: string): Promise<ResearchResult | null> {
    const session = await ResearchSession.findById(researchId);
    if (!session) return null;

    return this.sessionToResult(session);
  }

  /**
   * Get all research for a user
   */
  async getAllResearchForUser(userId: string): Promise<ResearchResult[]> {
    const sessions = await ResearchSession.findByUserId(userId);
    return sessions.map(s => this.sessionToResult(s));
  }

  /**
   * Delete research session
   */
  async deleteResearch(researchId: string): Promise<boolean> {
    return ResearchSession.delete(researchId);
  }

  /**
   * Private: Generate research asynchronously via FastAPI
   */
  private async generateResearchAsync(
    researchId: string,
    userId: string,
    request: ResearchRequest
  ): Promise<void> {
    try {
      console.log(`Generating research ${researchId} for topic: ${request.topic}`);

      const session = await ResearchSession.findById(researchId);
      if (!session) {
        throw new Error('Research session not found');
      }

      // Transform request to snake_case for FastAPI
      const aiRequest = {
        project_id: session.projectId || '00000000-0000-0000-0000-000000000000',
        topic: request.topic,
        target_audience: request.targetAudience,
        geographic_focus: request.geographicFocus,
        competitors: request.competitors || [],
      };

      // Step 1: Call FastAPI POST to trigger research generation
      const postResponse = await fetch(`${this.aiPipelineUrl}/api/v1/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiRequest),
      });

      if (!postResponse.ok) {
        throw new Error(`FastAPI POST error: ${postResponse.status} ${postResponse.statusText}`);
      }

      const postResult = (await postResponse.json()) as Record<string, any>;
      const fastApiId = postResult.id;
      console.log(`Research posted to FastAPI with ID: ${fastApiId}`);

      // Step 2: Poll FastAPI GET endpoint until research is complete
      let result: Record<string, any> | null = null;
      let attempts = 0;
      const maxAttempts = 120; // 120 attempts * 5 seconds = 10 minutes max wait

      while (attempts < maxAttempts) {
        const getResponse = await fetch(`${this.aiPipelineUrl}/api/v1/research/${fastApiId}`);

        if (getResponse.ok) {
          const data = (await getResponse.json()) as Record<string, any>;

          if (data.status === 'completed') {
            result = data.content;
            console.log(`Research completed on FastAPI after ${attempts} attempts`);
            break;
          }
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
      }

      if (!result) {
        throw new Error(`Research did not complete within ${maxAttempts * 5} seconds`);
      }

      console.log(`FastAPI research result for ${researchId}:`, JSON.stringify(result, null, 2));

      // Step 3: Update session with results
      session.status = 'completed';
      session.executiveSummary = result.executiveSummary as string | undefined;
      session.marketAnalysis = result.marketAnalysis as string | undefined;
      session.swot = result.swot as any;
      session.competitorMatrix = result.competitorMatrix as Record<string, any>;
      session.keyInsights = result.keyInsights as string[] | undefined;
      session.recommendations = result.recommendations as string[] | undefined;
      session.generatedAt = result.generatedAt as string | undefined;
      session.completedAt = new Date();

      await session.save();

      // Save results to research_artifacts table
      await session.saveResults();

      console.log(`Research ${researchId} completed successfully`);
    } catch (error) {
      console.error(`Error generating research ${researchId}:`, error);

      const session = await ResearchSession.findById(researchId);
      if (session) {
        session.status = 'error';
        session.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        session.completedAt = new Date();
        await session.save();
      }
    }
  }

  /**
   * Convert ResearchSession to ResearchResult format
   * Ensures all fields have proper defaults to prevent undefined reference errors in frontend
   */
  private sessionToResult(session: ResearchSession): ResearchResult {
    return {
      id: session.id,
      status: session.status,
      request: {
        topic: session.topic,
        targetAudience: session.targetAudience || 'General audience',
        competitors: session.competitors?.split(',') || [],
        geographicFocus: session.geographicFocus || 'Global',
      },
      executiveSummary: session.executiveSummary || '',
      marketAnalysis: session.marketAnalysis || '',
      swot: session.swot || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
      competitorMatrix: session.competitorMatrix || {},
      keyInsights: session.keyInsights || [],
      recommendations: session.recommendations || [],
      generatedAt: session.generatedAt || new Date().toISOString(),
      error: session.errorMessage || undefined,
      createdAt: session.createdAt,
    };
  }
}

export const researchService = new ResearchService();

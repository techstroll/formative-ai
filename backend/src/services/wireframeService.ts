/**
 * Wireframe Service - Orchestrates wireframe generation from research
 * Manages the complete flow: research -> layout -> SVG wireframe
 *
 * Now enhanced with:
 * - Claude AI for intelligent wireframe refinement
 * - RAG pipeline for component-aware generation
 * - Design system integration
 */

import { ResearchResult } from './researchService';
import { FeaturePlanResult } from './featurePlanningService';
import { layoutGenerator, WireframeLayout } from './layoutGenerator';
import { svgWireframeGenerator } from './svgWireframeGenerator';
import { vectorDbService } from './vectorDbService';
import { ComponentMetadata } from '../config/componentLibrary';
import { DESIGN_TOKENS } from '../config/designTokens';

export interface WireframeGenerateRequest {
  researchId: string;
  projectId?: string;
  title?: string;
  useAI?: boolean; // Use Claude AI for enhanced generation
  refinementMode?: 'fast' | 'quality'; // fast = quick gen, quality = thorough
  featurePlan?: FeaturePlanResult; // Optional feature plan context
}

export interface WireframeResult {
  id: string;
  projectId?: string;
  researchId: string;
  featurePlanId?: string; // Reference to the feature plan used
  title: string;
  designType: string;
  status: 'generating' | 'completed' | 'error';
  layout?: WireframeLayout;
  svgContent?: string;
  screenCount: number;
  suggestedComponents?: ComponentMetadata[];
  designSuggestions?: string[];
  createdAt: Date;
  error?: string;
}

interface AIEnhancedWireframeSpec {
  screens: Array<{
    name: string;
    title: string;
    purpose: string;
    components: Array<{ type: string; label: string; purpose: string }>;
    layout: string;
    suggestions: string[];
  }>;
  designSystem: {
    primaryColor: string;
    spacing: string;
    typography: string;
  };
}

class WireframeService {
  private aiPipelineUrl = process.env.AI_PIPELINE_URL || 'http://localhost:8000';
  private claudeApiKey = process.env.CLAUDE_API_KEY || '';

  /**
   * Generate wireframes from research data with optional AI enhancement
   */
  async generateWireframes(research: ResearchResult, request: WireframeGenerateRequest): Promise<WireframeResult> {
    try {
      console.log(`Generating wireframes for research ${research.id}`);

      // Step 1: Get intelligent component recommendations based on research context
      const suggestedComponents = await this.recommendComponentsForResearch(research);

      // Step 2: Generate base layout structure from research (with feature plan if provided)
      const layout = layoutGenerator.generateLayout(research, request.featurePlan);

      // Step 3: Use Claude AI to enhance wireframe if enabled
      let enhancedLayout = layout;
      let designSuggestions: string[] = [];

      if (request.useAI && this.claudeApiKey) {
        console.log('Enhancing wireframes with Claude AI...');
        const aiSpec = await this.generateAIEnhancedSpec(research, suggestedComponents, request.featurePlan);
        enhancedLayout = await this.applyAISpecToLayout(layout, aiSpec);
        designSuggestions = this.extractDesignSuggestions(aiSpec);
      }

      // Step 4: Generate SVG from enhanced layout
      const svgContent = svgWireframeGenerator.generateResponsiveSVG(enhancedLayout);

      const result: WireframeResult = {
        id: this.generateId(),
        projectId: request.projectId,
        researchId: research.id,
        featurePlanId: request.featurePlan?.id,
        title: request.title || `Wireframe: ${research.request.topic}`,
        designType: 'responsive',
        status: 'completed',
        layout: enhancedLayout,
        svgContent,
        screenCount: enhancedLayout.screens.length,
        suggestedComponents: suggestedComponents.slice(0, 5),
        designSuggestions: designSuggestions,
        createdAt: new Date(),
      };

      console.log(`Wireframes generated successfully: ${result.screenCount} screens with ${suggestedComponents.length} component suggestions`);
      return result;
    } catch (error) {
      console.error('Error generating wireframes:', error);
      return {
        id: this.generateId(),
        projectId: request.projectId,
        researchId: research.id,
        featurePlanId: request.featurePlan?.id,
        title: request.title || 'Wireframe Generation Failed',
        designType: 'responsive',
        status: 'error',
        screenCount: 0,
        createdAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Recommend components based on research content (ENHANCED with full research context)
   */
  private async recommendComponentsForResearch(research: ResearchResult): Promise<ComponentMetadata[]> {
    try {
      // Extract SWOT highlights for component selection
      const swotStrengths = research.swot?.strengths?.slice(0, 3).join(', ') || '';
      const swotOpportunities = research.swot?.opportunities?.slice(0, 2).join(', ') || '';

      // Extract competitor context
      const competitors = research.competitorMatrix
        ? Object.keys(research.competitorMatrix).slice(0, 3).join(', ')
        : research.request.competitors?.join(', ') || '';

      // Build rich context string with full research insights
      const context = `
        PRODUCT VISION:
        ${research.executiveSummary?.substring(0, 500) || 'Product concept based on market research'}

        MARKET POSITIONING:
        ${research.marketAnalysis?.substring(0, 500) || 'Market analysis in progress'}

        TARGET AUDIENCE:
        ${research.request.targetAudience || 'General audience'}

        GEOGRAPHIC FOCUS:
        ${research.request.geographicFocus || 'Global'}

        KEY DIFFERENTIATORS (from SWOT):
        Strengths: ${swotStrengths || 'Building on core competencies'}
        Opportunities: ${swotOpportunities || 'Market opportunities to leverage'}

        STRATEGIC FOCUS:
        ${research.recommendations?.join(', ') || 'Strategic recommendations'}

        COMPETITIVE CONTEXT:
        Main Competitors: ${competitors || 'Analyzing competitive landscape'}

        KEY INSIGHTS:
        ${research.keyInsights?.join('. ') || 'Market insights'}

        TOPIC:
        ${research.request.topic}
      `;

      console.log('Enhanced component recommendation context built with 8+ research fields');
      const components = await vectorDbService.recommendComponents(context, 10);
      console.log(`Recommended ${components.length} components for wireframe based on comprehensive research analysis`);
      return components;
    } catch (error) {
      console.warn('Error recommending components:', error);
      return [];
    }
  }

  /**
   * Generate AI-enhanced wireframe specification using Claude
   */
  private async generateAIEnhancedSpec(
    research: ResearchResult,
    components: ComponentMetadata[],
    featurePlan?: FeaturePlanResult
  ): Promise<AIEnhancedWireframeSpec> {
    try {
      const componentDescriptions = components
        .slice(0, 8)
        .map(c => `- ${c.name}: ${c.description}`)
        .join('\n');

      // Build feature plan context if provided
      let featurePlanContext = '';
      if (featurePlan) {
        const featuresStr = featurePlan.features
          .map(f => `- ${f.name} (${f.priority}): ${f.description}`)
          .join('\n');

        const screenMappingsStr = featurePlan.screenMappings
          .map(sm => `- Screen ${sm.screenNumber}: ${sm.screenTitle} - ${sm.description || ''}`)
          .join('\n');

        featurePlanContext = `
FEATURE PLAN (Confirmed Product Strategy):
Product Type: ${featurePlan.productType}
Total Screens: ${featurePlan.screenCount}
Reasoning: ${featurePlan.reasoning || 'Product features mapped to user needs'}

Planned Features:
${featuresStr}

Screen Mappings:
${screenMappingsStr}
`;
      }

      // Extract SWOT for comprehensive context
      const swotContext = research.swot ? `
SWOT ANALYSIS:
Strengths: ${research.swot.strengths?.join(', ') || 'N/A'}
Weaknesses: ${research.swot.weaknesses?.join(', ') || 'N/A'}
Opportunities: ${research.swot.opportunities?.join(', ') || 'N/A'}
Threats: ${research.swot.threats?.join(', ') || 'N/A'}
` : '';

      // Extract competitor details from matrix
      const competitorDetails = research.competitorMatrix
        ? `\nCompetitor Analysis: ${JSON.stringify(research.competitorMatrix).substring(0, 1000)}`
        : '';

      const prompt = `You are a UX/UI design expert. Based on the COMPLETE research analysis and ${featurePlan ? 'confirmed feature plan' : 'market research'} below, generate wireframe specifications using the provided component library.

MARKET RESEARCH ANALYSIS:
Topic: ${research.request.topic}
Target Audience: ${research.request.targetAudience || 'General'}
Geographic Focus: ${research.request.geographicFocus || 'Global'}

EXECUTIVE SUMMARY:
${research.executiveSummary || 'Product concept based on market research'}

MARKET ANALYSIS:
${research.marketAnalysis || 'Market positioning and opportunity analysis'}
${swotContext}
COMPETITIVE LANDSCAPE:
Main Competitors: ${research.request.competitors?.join(', ') || 'N/A'}${competitorDetails}

KEY INSIGHTS (Strategic Implications):
${research.keyInsights?.map((insight, i) => `${i + 1}. ${insight}`).join('\n') || 'Market insights pending'}

STRATEGIC RECOMMENDATIONS:
${research.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n') || 'Strategic guidance pending'}
${featurePlanContext}

AVAILABLE COMPONENTS:
${componentDescriptions}

DESIGN SYSTEM:
Primary Color: ${DESIGN_TOKENS.colors['primary-600']}
Spacing Unit: 8px grid
Typography: Modern, clean sans-serif

TASK: Design wireframes that:
1. ${featurePlan ? 'Implement the confirmed feature plan' : 'Address the market opportunity and insights'}
2. Leverage SWOT opportunities and strengths in the design
3. Mitigate identified weaknesses and threats through UX
4. Differentiate from competitors (based on competitive analysis)
5. Target the specific audience needs
6. Support the strategic recommendations
${featurePlan ? '7. Map each screen to the planned features above' : ''}

Generate screens with:
- Screen names and purposes ${featurePlan ? '(aligned with feature plan)' : '(driven by research insights)'}
- Strategic component placement (considering SWOT and competitive context)
- Layout recommendations optimized for target audience
- Design suggestions that address market positioning

${featurePlan ? `IMPORTANT: Each screen must align with the feature plan and screen mappings. Features should address the SWOT analysis and competitive landscape.` : 'IMPORTANT: Screens should directly translate research insights and recommendations into user-facing features.'}

Return JSON with structure:
{
  "screens": [
    {
      "name": "screen_name",
      "title": "Display Title",
      "purpose": "What this screen does",
      "components": [{"type": "component_type", "label": "label", "purpose": "why it's here"}],
      "layout": "grid|flex|card",
      "suggestions": ["improvement suggestions"]
    }
  ],
  "designSystem": {
    "primaryColor": "#hex",
    "spacing": "standard",
    "typography": "description"
  }
}`;

      // Call Claude API (via FastAPI pipeline if configured)
      const response = await this.callClaudeAPI(prompt);

      if (response) {
        return JSON.parse(response);
      }

      // Fallback to basic spec
      return this.generateBasicWireframeSpec(research);
    } catch (error) {
      console.warn('Error generating AI spec:', error);
      return this.generateBasicWireframeSpec(research);
    }
  }

  /**
   * Call Claude API for wireframe enhancement
   */
  private async callClaudeAPI(prompt: string): Promise<string | null> {
    try {
      // Method 1: Direct API call (if CLAUDE_API_KEY is set)
      if (this.claudeApiKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': this.claudeApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const content = data.content[0].text;

          // Extract JSON from response (handles markdown code blocks)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          return jsonMatch ? jsonMatch[0] : content;
        }
      }

      // Method 2: Via FastAPI pipeline if available
      const aiResponse = await fetch(`${this.aiPipelineUrl}/api/v1/wireframe-enhancement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      }).catch(() => null);

      if (aiResponse?.ok) {
        const data = (await aiResponse.json()) as any;
        return data.specification;
      }

      return null;
    } catch (error) {
      console.warn('Claude API call failed:', error);
      return null;
    }
  }

  /**
   * Generate basic wireframe spec without AI (fallback)
   */
  private generateBasicWireframeSpec(research: ResearchResult): AIEnhancedWireframeSpec {
    const topic = research.request.topic.toLowerCase();
    const isEcommerce = topic.includes('ecommerce') || topic.includes('shop') || topic.includes('product');
    const isSaaS = topic.includes('saas') || topic.includes('software') || topic.includes('app');
    const isMarketing = topic.includes('marketing') || topic.includes('landing') || topic.includes('campaign');

    const screens = [];

    if (isEcommerce) {
      screens.push(
        { name: 'home', title: 'Homepage', purpose: 'Product showcase',
          components: [{type: 'hero', label: 'Hero Banner', purpose: 'Grab attention'}], layout: 'flex', suggestions: []},
        { name: 'products', title: 'Product Listing', purpose: 'Show products',
          components: [{type: 'card-product', label: 'Product Cards', purpose: 'Display products'}], layout: 'grid', suggestions: []},
        { name: 'checkout', title: 'Checkout Flow', purpose: 'Purchase items',
          components: [{type: 'form-group', label: 'Checkout Form', purpose: 'Collect payment'}], layout: 'flex', suggestions: []}
      );
    } else if (isSaaS) {
      screens.push(
        { name: 'onboarding', title: 'Welcome', purpose: 'Explain product',
          components: [{type: 'card', label: 'Feature Cards', purpose: 'Show benefits'}], layout: 'flex', suggestions: []},
        { name: 'dashboard', title: 'Main Dashboard', purpose: 'Show data',
          components: [{type: 'card', label: 'Data Cards', purpose: 'Display metrics'}], layout: 'grid', suggestions: []},
        { name: 'settings', title: 'User Settings', purpose: 'Manage account',
          components: [{type: 'form-group', label: 'Settings Form', purpose: 'User preferences'}], layout: 'flex', suggestions: []}
      );
    } else if (isMarketing) {
      screens.push(
        { name: 'hero', title: 'Hero Section', purpose: 'Main message',
          components: [{type: 'hero', label: 'Hero', purpose: 'Primary message'}], layout: 'flex', suggestions: []},
        { name: 'features', title: 'Features', purpose: 'Show features',
          components: [{type: 'card', label: 'Feature Cards', purpose: 'Display features'}], layout: 'grid', suggestions: []},
        { name: 'cta', title: 'Call to Action', purpose: 'Conversion',
          components: [{type: 'btn-primary', label: 'CTA Button', purpose: 'Drive action'}], layout: 'flex', suggestions: []}
      );
    } else {
      screens.push(
        { name: 'home', title: 'Home', purpose: 'Main landing',
          components: [{type: 'card', label: 'Content', purpose: 'Primary content'}], layout: 'flex', suggestions: []},
        { name: 'content', title: 'Content Page', purpose: 'Information',
          components: [{type: 'card', label: 'Content Card', purpose: 'Display info'}], layout: 'flex', suggestions: []}
      );
    }

    return {
      screens,
      designSystem: {
        primaryColor: DESIGN_TOKENS.colors['primary-600'],
        spacing: 'standard',
        typography: 'modern',
      },
    };
  }

  /**
   * Apply AI specification to existing layout
   */
  private async applyAISpecToLayout(layout: WireframeLayout, spec: AIEnhancedWireframeSpec): Promise<WireframeLayout> {
    // Enhance layout with AI suggestions
    const enhancedLayout = { ...layout };

    // Update screen names and descriptions based on AI spec
    spec.screens.forEach((specScreen, index) => {
      if (index < enhancedLayout.screens.length) {
        const screen = enhancedLayout.screens[index];
        screen.title = specScreen.title;
        screen.description = specScreen.purpose;
        // Additional enhancements could go here
      }
    });

    return enhancedLayout;
  }

  /**
   * Extract design suggestions from AI spec
   */
  private extractDesignSuggestions(spec: AIEnhancedWireframeSpec): string[] {
    const suggestions: string[] = [];

    spec.screens.forEach(screen => {
      if (screen.suggestions && screen.suggestions.length > 0) {
        suggestions.push(...screen.suggestions);
      }
    });

    return suggestions.slice(0, 5); // Top 5 suggestions
  }

  /**
   * Get wireframe for display
   */
  getWireframeResult(result: WireframeResult): WireframeResult {
    return {
      id: result.id,
      projectId: result.projectId,
      researchId: result.researchId,
      title: result.title,
      designType: result.designType,
      status: result.status,
      layout: result.layout,
      svgContent: result.svgContent,
      screenCount: result.screenCount,
      createdAt: result.createdAt,
      error: result.error,
    };
  }

  /**
   * Export wireframe screen as SVG
   */
  exportScreenAsSVG(layout: WireframeLayout, screenIndex: number): string {
    return svgWireframeGenerator.generateWireframeForExport(layout, screenIndex);
  }

  /**
   * Get layout structure
   */
  getLayout(result: WireframeResult): WireframeLayout | undefined {
    return result.layout;
  }

  /**
   * Get specific screen from layout
   */
  getScreen(layout: WireframeLayout, screenIndex: number) {
    if (screenIndex < 0 || screenIndex >= layout.screens.length) {
      return null;
    }
    return layout.screens[screenIndex];
  }

  /**
   * Get screen preview data (for quick display)
   */
  getScreenPreview(layout: WireframeLayout, screenIndex: number) {
    const screen = this.getScreen(layout, screenIndex);
    if (!screen) return null;

    return {
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
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `wireframe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const wireframeService = new WireframeService();

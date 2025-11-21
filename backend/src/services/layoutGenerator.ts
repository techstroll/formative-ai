/**
 * Layout Generator - Converts research data into wireframe layouts
 * Generates structured wireframe data from market research insights
 * Now integrates feature plans to create screens based on actual features
 * Phase 2.1: Enhanced with intelligent feature → component mapping
 */

import { ResearchResult } from './researchService';
import { FeaturePlanResult } from './featurePlanningService';
import { Feature, ScreenMapping } from '../models/FeaturePlan';
import { featureComponentMapper } from './featureComponentMapper';

export interface WireframeBlock {
  id: string;
  type: 'header' | 'hero' | 'section' | 'card' | 'grid' | 'list' | 'chart' | 'cta';
  title?: string;
  content?: string;
  data?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  children?: WireframeBlock[];
}

export interface WireframeScreen {
  id: string;
  name: string;
  title: string;
  blocks: WireframeBlock[];
  description?: string;
}

export interface WireframeLayout {
  id: string;
  title: string;
  screens: WireframeScreen[];
  metadata: {
    researchId?: string;
    topic: string;
    generatedAt: Date;
    algorithm: string;
  };
}

class LayoutGenerator {
  /**
   * Generate wireframe layout from research data
   * If feature plan is provided, generates screens based on features
   * Otherwise, falls back to default 6-screen layout
   */
  generateLayout(research: ResearchResult, featurePlan?: FeaturePlanResult): WireframeLayout {
    const layoutId = this.generateId();
    const screens: WireframeScreen[] = [];

    // If feature plan is provided, use it to generate screens
    if (featurePlan && featurePlan.screenMappings && featurePlan.screenMappings.length > 0) {
      console.log(`Generating wireframe with feature plan: ${featurePlan.screenCount} screens`);

      // Generate screens based on feature plan
      featurePlan.screenMappings.forEach((mapping) => {
        const screen = this.createFeatureBasedScreen(research, mapping, featurePlan.features);
        screens.push(screen);
      });
    } else {
      // Fallback to default 6-screen layout if no feature plan
      console.log('No feature plan provided, using default 6-screen layout');

      // Screen 1: Hero/Title Page
      screens.push(this.createHeroScreen(research));

      // Screen 2: Market Overview
      screens.push(this.createMarketOverviewScreen(research));

      // Screen 3: SWOT Analysis
      screens.push(this.createSWOTScreen(research));

      // Screen 4: Competitive Landscape
      screens.push(this.createCompetitiveScreen(research));

      // Screen 5: Key Insights
      screens.push(this.createInsightsScreen(research));

      // Screen 6: Recommendations
      screens.push(this.createRecommendationsScreen(research));
    }

    return {
      id: layoutId,
      title: `Wireframe for: ${research.request.topic}`,
      screens,
      metadata: {
        researchId: research.id,
        topic: research.request.topic,
        generatedAt: new Date(),
        algorithm: featurePlan ? 'LayoutGenerator v2.0 (Feature-Based)' : 'LayoutGenerator v1.0 (Default)',
      },
    };
  }

  /**
   * Create a screen based on feature plan mapping
   * Generates blocks that represent the features assigned to this screen
   */
  private createFeatureBasedScreen(research: ResearchResult, mapping: ScreenMapping, features: Feature[]): WireframeScreen {
    const blocks: WireframeBlock[] = [];

    // Header
    blocks.push({
      id: `header-screen-${mapping.screenNumber}`,
      type: 'header',
      title: 'Navigation Bar',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 60 },
    });

    // Screen title section
    blocks.push({
      id: `title-screen-${mapping.screenNumber}`,
      type: 'section',
      title: mapping.screenTitle,
      content: mapping.description,
      position: { x: 0, y: 60 },
      size: { width: 1200, height: 80 },
    });

    // Generate blocks for each feature assigned to this screen
    const screenFeatures = features.filter((f) => mapping.features.includes(f.id));
    let yPosition = 140;

    if (screenFeatures.length === 0) {
      // If no features mapped, show a placeholder card
      blocks.push({
        id: `placeholder-screen-${mapping.screenNumber}`,
        type: 'card',
        title: 'Feature Content',
        content: mapping.description || 'Feature details will appear here',
        position: { x: 0, y: 140 },
        size: { width: 1200, height: 400 },
      });
      yPosition = 540;
    } else {
      // Generate feature-specific blocks using intelligent component mapping
      for (const feature of screenFeatures) {
        // Map feature to appropriate components (Phase 2.1 enhancement)
        const recommendation = featureComponentMapper.mapFeatureToComponents(feature);

        // Determine block type based on layout pattern
        let blockType: WireframeBlock['type'] = 'card'; // default
        switch (recommendation.layoutPattern) {
          case 'grid':
            blockType = 'grid';
            break;
          case 'list':
            blockType = 'list';
            break;
          case 'dashboard':
            blockType = 'grid';
            break;
          case 'form':
            blockType = 'card'; // forms render as cards with inputs
            break;
          case 'hero':
            blockType = 'hero';
            break;
          default:
            blockType = 'card';
        }

        blocks.push({
          id: `feature-${mapping.screenNumber}-${feature.id}`,
          type: blockType,
          title: feature.name,
          content: feature.description,
          data: {
            category: feature.category,
            priority: feature.priority,
            // Phase 2.1: Add component mapping metadata
            detectedCategory: recommendation.detectedCategory,
            mappedComponents: recommendation.requiredComponentIds,
            optionalComponents: recommendation.optionalComponentIds,
            layoutPattern: recommendation.layoutPattern,
            designGuidance: recommendation.designGuidance,
            confidence: recommendation.confidence,
          },
          position: { x: 0, y: yPosition },
          size: { width: 1200, height: blockType === 'hero' ? 200 : 120 },
        });

        console.log(`✓ Feature "${feature.name}" mapped to category "${recommendation.detectedCategory}" with ${recommendation.requiredComponentIds.length} components (confidence: ${recommendation.confidence})`);

        yPosition += blockType === 'hero' ? 220 : 140;
      }
    }

    // Add CTA at the bottom
    blocks.push({
      id: `cta-screen-${mapping.screenNumber}`,
      type: 'cta',
      title: 'Continue',
      position: { x: 0, y: yPosition + 20 },
      size: { width: 1200, height: 80 },
    });

    return {
      id: `screen-feature-${mapping.screenNumber}`,
      name: mapping.screenTitle,
      title: mapping.screenTitle,
      blocks,
      description: mapping.description || `Screen ${mapping.screenNumber} with ${screenFeatures.length} features`,
    };
  }

  /**
   * Create hero/title screen
   */
  private createHeroScreen(research: ResearchResult): WireframeScreen {
    const blocks: WireframeBlock[] = [];

    // Header
    blocks.push({
      id: 'hero-header',
      type: 'header',
      title: 'Navigation Bar',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 60 },
    });

    // Hero section
    blocks.push({
      id: 'hero-main',
      type: 'hero',
      title: research.request.topic,
      content: research.executiveSummary?.substring(0, 200),
      position: { x: 0, y: 60 },
      size: { width: 1200, height: 400 },
    });

    // CTA Section
    blocks.push({
      id: 'hero-cta',
      type: 'cta',
      title: 'Get Insights',
      position: { x: 0, y: 460 },
      size: { width: 1200, height: 100 },
    });

    return {
      id: 'screen-hero',
      name: 'Hero Page',
      title: 'Overview',
      blocks,
      description: 'Title page with executive summary and key message',
    };
  }

  /**
   * Create market overview screen
   */
  private createMarketOverviewScreen(research: ResearchResult): WireframeScreen {
    const blocks: WireframeBlock[] = [];

    blocks.push({
      id: 'market-header',
      type: 'header',
      title: 'Navigation Bar',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 60 },
    });

    blocks.push({
      id: 'market-title',
      type: 'section',
      title: 'Market Analysis',
      position: { x: 0, y: 60 },
      size: { width: 1200, height: 80 },
    });

    // Market content in 2-column layout
    blocks.push({
      id: 'market-content-left',
      type: 'section',
      content: research.marketAnalysis?.substring(0, 300),
      position: { x: 0, y: 140 },
      size: { width: 580, height: 400 },
    });

    blocks.push({
      id: 'market-chart',
      type: 'chart',
      title: 'Market Trends',
      position: { x: 620, y: 140 },
      size: { width: 580, height: 400 },
    });

    // Target audience card
    blocks.push({
      id: 'market-audience',
      type: 'card',
      title: 'Target Audience',
      content: research.request.targetAudience,
      position: { x: 0, y: 540 },
      size: { width: 1200, height: 150 },
    });

    return {
      id: 'screen-market',
      name: 'Market Overview',
      title: 'Market Analysis',
      blocks,
      description: 'Detailed market analysis with trends and audience information',
    };
  }

  /**
   * Create SWOT analysis screen
   */
  private createSWOTScreen(research: ResearchResult): WireframeScreen {
    const blocks: WireframeBlock[] = [];

    blocks.push({
      id: 'swot-header',
      type: 'header',
      title: 'Navigation Bar',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 60 },
    });

    blocks.push({
      id: 'swot-title',
      type: 'section',
      title: 'SWOT Analysis',
      position: { x: 0, y: 60 },
      size: { width: 1200, height: 60 },
    });

    // SWOT in 2x2 grid
    const swot = research.swot || {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };

    blocks.push({
      id: 'swot-strengths',
      type: 'card',
      title: '💪 Strengths',
      data: swot.strengths,
      position: { x: 0, y: 120 },
      size: { width: 580, height: 300 },
    });

    blocks.push({
      id: 'swot-weaknesses',
      type: 'card',
      title: '⚠️ Weaknesses',
      data: swot.weaknesses,
      position: { x: 620, y: 120 },
      size: { width: 580, height: 300 },
    });

    blocks.push({
      id: 'swot-opportunities',
      type: 'card',
      title: '🎯 Opportunities',
      data: swot.opportunities,
      position: { x: 0, y: 420 },
      size: { width: 580, height: 300 },
    });

    blocks.push({
      id: 'swot-threats',
      type: 'card',
      title: '🚨 Threats',
      data: swot.threats,
      position: { x: 620, y: 420 },
      size: { width: 580, height: 300 },
    });

    return {
      id: 'screen-swot',
      name: 'SWOT Analysis',
      title: 'SWOT',
      blocks,
      description: '2x2 grid showing strengths, weaknesses, opportunities, and threats',
    };
  }

  /**
   * Create competitive landscape screen
   */
  private createCompetitiveScreen(research: ResearchResult): WireframeScreen {
    const blocks: WireframeBlock[] = [];

    blocks.push({
      id: 'comp-header',
      type: 'header',
      title: 'Navigation Bar',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 60 },
    });

    blocks.push({
      id: 'comp-title',
      type: 'section',
      title: 'Competitive Landscape',
      position: { x: 0, y: 60 },
      size: { width: 1200, height: 60 },
    });

    // Competitor cards in grid
    const competitors = research.competitorMatrix || {};
    const competitorNames = Object.keys(competitors).slice(0, 3);

    competitorNames.forEach((name, index) => {
      const xPos = (index % 3) * 400;
      const yPos = Math.floor(index / 3) * 250 + 120;

      blocks.push({
        id: `competitor-${index}`,
        type: 'card',
        title: name,
        data: competitors[name],
        position: { x: xPos, y: yPos },
        size: { width: 380, height: 220 },
      });
    });

    // Market positioning chart
    blocks.push({
      id: 'comp-positioning',
      type: 'chart',
      title: 'Market Positioning',
      position: { x: 0, y: 500 },
      size: { width: 1200, height: 300 },
    });

    return {
      id: 'screen-competitive',
      name: 'Competitive Analysis',
      title: 'Competitors',
      blocks,
      description: 'Competitor analysis with positioning matrix',
    };
  }

  /**
   * Create key insights screen
   */
  private createInsightsScreen(research: ResearchResult): WireframeScreen {
    const blocks: WireframeBlock[] = [];

    blocks.push({
      id: 'insights-header',
      type: 'header',
      title: 'Navigation Bar',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 60 },
    });

    blocks.push({
      id: 'insights-title',
      type: 'section',
      title: 'Key Insights',
      position: { x: 0, y: 60 },
      size: { width: 1200, height: 60 },
    });

    // Insights as numbered list
    const insights = research.keyInsights || [];

    insights.forEach((insight, index) => {
      blocks.push({
        id: `insight-${index}`,
        type: 'list',
        title: `Insight ${index + 1}`,
        content: insight,
        position: { x: 0, y: 120 + index * 100 },
        size: { width: 1200, height: 80 },
      });
    });

    return {
      id: 'screen-insights',
      name: 'Key Insights',
      title: 'Insights',
      blocks,
      description: 'List of key insights from research analysis',
    };
  }

  /**
   * Create recommendations screen
   */
  private createRecommendationsScreen(research: ResearchResult): WireframeScreen {
    const blocks: WireframeBlock[] = [];

    blocks.push({
      id: 'rec-header',
      type: 'header',
      title: 'Navigation Bar',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 60 },
    });

    blocks.push({
      id: 'rec-title',
      type: 'section',
      title: 'Strategic Recommendations',
      position: { x: 0, y: 60 },
      size: { width: 1200, height: 60 },
    });

    // Recommendations in 3-column grid
    const recommendations = research.recommendations || [];

    recommendations.forEach((rec, index) => {
      const xPos = (index % 3) * 400;
      const yPos = Math.floor(index / 3) * 250 + 120;

      blocks.push({
        id: `recommendation-${index}`,
        type: 'card',
        title: `Recommendation ${index + 1}`,
        content: rec,
        position: { x: xPos, y: yPos },
        size: { width: 380, height: 220 },
      });
    });

    // CTA for action
    blocks.push({
      id: 'rec-cta',
      type: 'cta',
      title: 'Start Implementation',
      position: { x: 0, y: 550 },
      size: { width: 1200, height: 100 },
    });

    return {
      id: 'screen-recommendations',
      name: 'Recommendations',
      title: 'Next Steps',
      blocks,
      description: 'Strategic recommendations for market entry and growth',
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `wireframe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const layoutGenerator = new LayoutGenerator();

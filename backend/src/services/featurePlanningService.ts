/**
 * Feature Planning Service
 *
 * Orchestrates feature planning and screen mapping from research data.
 * Uses Claude AI with RAG (Retrieval Augmented Generation) to intelligently
 * extract features and create screen mappings.
 */

import { FeaturePlan, Feature, ScreenMapping, UserStory, TechnicalRequirements, FeatureDependencies } from '../models/FeaturePlan';
import { ResearchResult } from './researchService';
import { validateFeaturePlan } from './featureValidation';
import Anthropic from '@anthropic-ai/sdk';

export interface FeaturePlanSuggestion {
  productType: 'website' | 'mobile_app' | 'both';
  suggestedFeatures: Feature[];
  screenCount: number;
  screenMappings: ScreenMapping[];
  reasoning: string;
}

export interface FeaturePlanResult {
  id: string;
  researchId: string;
  projectId?: string;
  productType: 'website' | 'mobile_app' | 'both';
  features: Feature[];
  screenMappings: ScreenMapping[];
  screenCount: number;
  status: 'draft' | 'confirmed' | 'locked' | 'archived';
  locked: boolean;
  reasoning?: string;
  createdAt: Date;
  updatedAt: Date;
}

class FeaturePlanningService {
  private claudeApiKey = process.env.CLAUDE_API_KEY || '';
  private client: Anthropic | null = null;

  constructor() {
    if (this.claudeApiKey) {
      this.client = new Anthropic({ apiKey: this.claudeApiKey });
    }
  }

  /**
   * Create initial feature plan with AI-powered suggestions
   */
  async createFeaturePlan(
    researchId: string,
    research: ResearchResult,
    projectId?: string
  ): Promise<FeaturePlanResult> {
    try {
      console.log(`Creating feature plan for research ${researchId}`);

      // Step 1: Create empty feature plan
      const plan = new FeaturePlan(researchId, projectId);
      await plan.save();

      // Step 2: Analyze research and get AI suggestions
      const suggestion = await this.analyzeResearchForFeatures(research);

      // Step 3: Update plan with suggestions
      plan.productType = suggestion.productType;
      plan.features = suggestion.suggestedFeatures;
      plan.screenMappings = suggestion.screenMappings;
      plan.screenCount = suggestion.screenCount;
      plan.reasoning = suggestion.reasoning;
      plan.status = 'draft';

      // Step 4: Save updated plan
      await plan.save();

      return this.planToResult(plan);
    } catch (error) {
      console.error(`Error creating feature plan for research ${researchId}:`, error);
      throw error;
    }
  }

  /**
   * Get feature plan by ID
   */
  async getFeaturePlan(planId: string): Promise<FeaturePlanResult | null> {
    const plan = await FeaturePlan.findById(planId);
    if (!plan) return null;

    return this.planToResult(plan);
  }

  /**
   * Get feature plan for a research
   */
  async getFeaturePlanByResearchId(researchId: string): Promise<FeaturePlanResult | null> {
    const plan = await FeaturePlan.findByResearchId(researchId);
    if (!plan) return null;

    return this.planToResult(plan);
  }

  /**
   * Update feature plan with user modifications
   */
  async updateFeaturePlan(planId: string, updates: Partial<FeaturePlan>): Promise<FeaturePlanResult> {
    const plan = await FeaturePlan.findById(planId);
    if (!plan) {
      throw new Error(`Feature plan ${planId} not found`);
    }

    if (plan.locked) {
      throw new Error(`Feature plan ${planId} is locked and cannot be modified`);
    }

    // Apply updates
    if (updates.productType) plan.productType = updates.productType;
    if (updates.features) plan.features = updates.features;
    if (updates.screenMappings) plan.screenMappings = updates.screenMappings;
    if (updates.status) plan.status = updates.status;

    await plan.save();
    return this.planToResult(plan);
  }

  /**
   * Confirm feature plan (ready for wireframe generation)
   */
  async confirmFeaturePlan(planId: string): Promise<FeaturePlanResult> {
    const plan = await FeaturePlan.findById(planId);
    if (!plan) {
      throw new Error(`Feature plan ${planId} not found`);
    }

    // Validate all features have complete PRD details before confirmation
    const validation = validateFeaturePlan(plan);
    if (!validation.isValid) {
      throw new Error(`Feature plan validation failed:\n${validation.errors.join('\n')}`);
    }

    plan.status = 'confirmed';
    await plan.save();

    return this.planToResult(plan);
  }

  /**
   * Lock feature plan after wireframe generation
   */
  async lockFeaturePlan(planId: string, wireframeId: string): Promise<FeaturePlanResult> {
    const plan = await FeaturePlan.findById(planId);
    if (!plan) {
      throw new Error(`Feature plan ${planId} not found`);
    }

    plan.locked = true;
    plan.status = 'locked';
    plan.wireframeId = wireframeId;
    await plan.save();

    return this.planToResult(plan);
  }

  /**
   * Add custom feature to plan
   */
  async addFeature(planId: string, feature: Omit<Feature, 'id'>): Promise<FeaturePlanResult> {
    const plan = await FeaturePlan.findById(planId);
    if (!plan) {
      throw new Error(`Feature plan ${planId} not found`);
    }

    if (plan.locked) {
      throw new Error(`Feature plan ${planId} is locked and cannot be modified`);
    }

    const newFeature: Feature = {
      id: `feature_${Date.now()}`,
      ...feature,
    };

    plan.features.push(newFeature);
    await plan.save();

    return this.planToResult(plan);
  }

  /**
   * Remove feature from plan
   */
  async removeFeature(planId: string, featureId: string): Promise<FeaturePlanResult> {
    const plan = await FeaturePlan.findById(planId);
    if (!plan) {
      throw new Error(`Feature plan ${planId} not found`);
    }

    if (plan.locked) {
      throw new Error(`Feature plan ${planId} is locked and cannot be modified`);
    }

    plan.features = plan.features.filter(f => f.id !== featureId);

    // Remove feature from all screen mappings
    plan.screenMappings = plan.screenMappings.map(sm => ({
      ...sm,
      features: sm.features.filter(fid => fid !== featureId),
    }));

    await plan.save();

    return this.planToResult(plan);
  }

  /**
   * Private: Analyze research data and extract features using Claude AI
   */
  private async analyzeResearchForFeatures(research: ResearchResult): Promise<FeaturePlanSuggestion> {
    try {
      // If no Claude API key, return basic suggestions
      if (!this.client) {
        console.warn('Claude API not configured, using basic feature extraction');
        return this.extractBasicFeatures(research);
      }

      // Build RAG prompt with research context
      const ragPrompt = this.buildFeatureExtractionPrompt(research);

      console.log('Calling Claude API for feature planning...');

      const response = await this.client.messages.create({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: ragPrompt,
          },
        ],
      });

      const responseText = response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => (block as any).text)
        .join('');

      console.log('Claude response:', responseText);

      // Parse Claude's response
      return this.parseFeatureExtractionResponse(responseText);
    } catch (error) {
      console.error('Error analyzing research for features:', error);
      // Fall back to basic extraction on error
      return this.extractBasicFeatures(research);
    }
  }

  /**
   * Build RAG prompt for feature extraction with complete PRD details
   */
  private buildFeatureExtractionPrompt(research: ResearchResult): string {
    return `You are an expert product strategist and technical architect. Analyze the research data and create a comprehensive PRD-level feature plan.

RESEARCH DATA:
Topic: ${research.request.topic}
Target Audience: ${research.request.targetAudience || 'Not specified'}
Geographic Focus: ${research.request.geographicFocus || 'Global'}
Competitors: ${research.request.competitors?.join(', ') || 'Not specified'}

Executive Summary:
${research.executiveSummary || 'Not available'}

Market Analysis:
${research.marketAnalysis || 'Not available'}

Key Insights:
${research.keyInsights?.join('\n') || 'Not available'}

Recommendations:
${research.recommendations?.join('\n') || 'Not available'}

SWOT Analysis:
Strengths: ${research.swot?.strengths?.join(', ') || 'Not available'}
Weaknesses: ${research.swot?.weaknesses?.join(', ') || 'Not available'}
Opportunities: ${research.swot?.opportunities?.join(', ') || 'Not available'}
Threats: ${research.swot?.threats?.join(', ') || 'Not available'}

OUTPUT FORMAT (JSON only, no markdown):
{
  "productType": "website" | "mobile_app" | "both",
  "screenCount": <number 3-10>,
  "features": [
    {
      "name": "Feature Name",
      "description": "Clear description of what it does",
      "category": "core" | "secondary" | "nice-to-have",
      "priority": "high" | "medium" | "low",
      "userStories": [
        {
          "role": "end user",
          "goal": "create an account quickly",
          "benefit": "I can start using the platform immediately",
          "acceptanceCriteria": [
            "User can sign up with email and password",
            "Confirmation email is sent within 5 seconds",
            "Account is created in under 3 seconds"
          ]
        }
      ],
      "technicalRequirements": {
        "apiEndpoints": ["/api/auth/signup", "/api/auth/login"],
        "dataModels": ["User", "Session"],
        "libraries": ["bcrypt", "jsonwebtoken"],
        "constraints": ["Must support OAuth2", "GDPR compliant"]
      },
      "dependencies": {
        "requires": [],
        "blocks": [],
        "relatedTo": []
      },
      "effortEstimate": 5,
      "successMetrics": ["90% signup completion rate", "< 3s signup time"],
      "designNotes": "Simple 2-field form, social login optional, mobile-first design"
    }
  ],
  "screenMappings": [
    {
      "screenNumber": 1,
      "screenTitle": "Screen Title",
      "description": "What this screen does",
      "features": ["feature_id_1", "feature_id_2"]
    }
  ],
  "reasoning": "Brief explanation of the feature selection and screen mapping strategy"
}

REQUIREMENTS:
- 5-7 core features with COMPLETE PRD details
- Each feature MUST have at least 1 user story with 2-3 acceptance criteria
- User stories follow format: As a [role], I want [goal], so that [benefit]
- Technical requirements MUST include realistic API endpoints, data models, libraries
- Dependencies can be empty arrays if none exist
- Effort estimates use Fibonacci: 1, 2, 3, 5, 8, 13, or 21 story points
- Success metrics MUST be measurable
- Design notes MUST address UX/UI considerations
- Return ONLY valid JSON, no markdown code blocks
`;
  }

  /**
   * Parse Claude's JSON response
   */
  private parseFeatureExtractionResponse(responseText: string): FeaturePlanSuggestion {
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      // Validate and normalize response
      const productType = this.normalizeProductType(parsed.productType);
      const screenCount = Math.max(3, Math.min(10, parsed.screenCount || 5));

      // Normalize features with IDs and PRD fields
      const features: Feature[] = (parsed.features || [])
        .slice(0, 10) // Limit to 10 features
        .map((f: any, idx: number) => ({
          id: `feature_${idx}_${Date.now()}`,
          name: f.name || `Feature ${idx + 1}`,
          description: f.description || 'No description',
          category: this.normalizeCategory(f.category) as any,
          priority: this.normalizePriority(f.priority) as any,

          // PRD fields with defaults
          userStories: this.normalizeUserStories(f.userStories),
          technicalRequirements: this.normalizeTechnicalRequirements(f.technicalRequirements),
          dependencies: this.normalizeDependencies(f.dependencies),
          effortEstimate: this.normalizeEffortEstimate(f.effortEstimate),
          successMetrics: Array.isArray(f.successMetrics) && f.successMetrics.length > 0
            ? f.successMetrics
            : ['Define success metrics'],
          designNotes: f.designNotes || 'No design notes provided'
        }));

      // Normalize screen mappings
      const screenMappings: ScreenMapping[] = (parsed.screenMappings || [])
        .slice(0, screenCount)
        .map((sm: any) => ({
          screenNumber: sm.screenNumber || 1,
          screenTitle: sm.screenTitle || `Screen ${sm.screenNumber || 1}`,
          description: sm.description || '',
          features: (sm.features || [])
            .filter((fid: string) => features.some(f => f.id === fid || f.name.toLowerCase() === fid.toLowerCase()))
            .slice(0, 5), // Max 5 features per screen
        }))
        .sort((a: ScreenMapping, b: ScreenMapping) => a.screenNumber - b.screenNumber);

      // Ensure screen mappings cover all screens
      const mappedScreenNumbers = new Set(screenMappings.map(sm => sm.screenNumber));
      for (let i = 1; i <= screenCount; i++) {
        if (!mappedScreenNumbers.has(i)) {
          screenMappings.push({
            screenNumber: i,
            screenTitle: `Screen ${i}`,
            description: '',
            features: features.slice(0, 2).map(f => f.id),
          });
        }
      }

      return {
        productType,
        suggestedFeatures: features,
        screenCount,
        screenMappings: screenMappings.sort((a: ScreenMapping, b: ScreenMapping) => a.screenNumber - b.screenNumber),
        reasoning: parsed.reasoning || 'Features extracted based on research analysis',
      };
    } catch (error) {
      console.error('Error parsing feature extraction response:', error);
      return this.extractBasicFeatures({ request: {} } as ResearchResult);
    }
  }

  /**
   * Extract basic features when Claude API is not available
   */
  private extractBasicFeatures(_research: ResearchResult): FeaturePlanSuggestion {
    // Default feature list with complete PRD details
    const defaultFeatures: Feature[] = [
      {
        id: 'feature_1_default',
        name: 'User Authentication',
        description: 'Login/signup functionality for user accounts',
        category: 'core',
        priority: 'high',
        userStories: [{
          role: 'user',
          goal: 'create an account and log in',
          benefit: 'access personalized features',
          acceptanceCriteria: [
            'User can sign up with email and password',
            'User can log in with valid credentials',
            'User receives confirmation email after signup'
          ]
        }],
        technicalRequirements: {
          apiEndpoints: ['/api/auth/signup', '/api/auth/login', '/api/auth/logout'],
          dataModels: ['User', 'Session'],
          libraries: ['bcrypt', 'jsonwebtoken'],
          constraints: ['Password must be hashed', 'Session expires after 24 hours']
        },
        dependencies: { requires: [], blocks: [], relatedTo: [] },
        effortEstimate: 5,
        successMetrics: ['95% successful login rate', 'Account creation < 30 seconds'],
        designNotes: 'Simple form with email/password. Include forgot password link.'
      },
      {
        id: 'feature_2_default',
        name: 'Dashboard',
        description: 'Main user dashboard displaying key information',
        category: 'core',
        priority: 'high',
        userStories: [{
          role: 'user',
          goal: 'view my account overview',
          benefit: 'quickly understand my current status',
          acceptanceCriteria: [
            'Dashboard loads in under 2 seconds',
            'Shows key metrics and recent activity',
            'Updates in real-time'
          ]
        }],
        technicalRequirements: {
          apiEndpoints: ['/api/dashboard', '/api/dashboard/stats'],
          dataModels: ['Dashboard', 'Activity'],
          libraries: ['chart.js'],
          constraints: ['Must support real-time updates', 'Responsive design required']
        },
        dependencies: { requires: ['feature_1_default'], blocks: [], relatedTo: [] },
        effortEstimate: 8,
        successMetrics: ['90% user engagement', '< 2s load time'],
        designNotes: 'Card-based layout with widgets. Mobile-first responsive design.'
      },
      {
        id: 'feature_3_default',
        name: 'Search & Discovery',
        description: 'Allow users to search and discover content',
        category: 'core',
        priority: 'high',
        userStories: [{
          role: 'user',
          goal: 'find relevant content quickly',
          benefit: 'save time and discover what I need',
          acceptanceCriteria: [
            'Search returns results in under 1 second',
            'Results are relevant and ranked',
            'Supports filters and sorting'
          ]
        }],
        technicalRequirements: {
          apiEndpoints: ['/api/search', '/api/search/suggestions'],
          dataModels: ['SearchIndex', 'SearchResult'],
          libraries: ['elasticsearch'],
          constraints: ['< 1s response time', 'Support 1000+ concurrent searches']
        },
        dependencies: { requires: [], blocks: [], relatedTo: [] },
        effortEstimate: 13,
        successMetrics: ['85% search success rate', 'Average result click within top 3'],
        designNotes: 'Prominent search bar. Live suggestions as user types. Filter sidebar.'
      },
      {
        id: 'feature_4_default',
        name: 'User Profile',
        description: 'User account profile and preferences management',
        category: 'secondary',
        priority: 'medium',
        userStories: [{
          role: 'user',
          goal: 'manage my account settings',
          benefit: 'customize my experience',
          acceptanceCriteria: [
            'User can update profile information',
            'Changes are saved immediately',
            'Email notifications for important changes'
          ]
        }],
        technicalRequirements: {
          apiEndpoints: ['/api/profile', '/api/profile/update'],
          dataModels: ['Profile', 'Preferences'],
          libraries: [],
          constraints: ['GDPR compliant data management']
        },
        dependencies: { requires: ['feature_1_default'], blocks: [], relatedTo: [] },
        effortEstimate: 5,
        successMetrics: ['70% users complete profile', 'Profile update success rate > 95%'],
        designNotes: 'Tabbed interface for different sections. Inline editing preferred.'
      },
      {
        id: 'feature_5_default',
        name: 'Notifications',
        description: 'Real-time notifications for user activities',
        category: 'secondary',
        priority: 'medium',
        userStories: [{
          role: 'user',
          goal: 'receive timely updates',
          benefit: 'stay informed about important events',
          acceptanceCriteria: [
            'Notifications appear in real-time',
            'User can mark as read/unread',
            'Notification preferences can be customized'
          ]
        }],
        technicalRequirements: {
          apiEndpoints: ['/api/notifications', '/api/notifications/mark-read'],
          dataModels: ['Notification', 'NotificationPreference'],
          libraries: ['websocket', 'push-notifications'],
          constraints: ['Real-time delivery required', 'Support browser notifications']
        },
        dependencies: { requires: ['feature_1_default'], blocks: [], relatedTo: [] },
        effortEstimate: 8,
        successMetrics: ['< 5s notification delivery', '60% notification engagement rate'],
        designNotes: 'Bell icon with badge counter. Dropdown notification center. Toast for critical alerts.'
      },
      {
        id: 'feature_6_default',
        name: 'Analytics',
        description: 'View usage analytics and insights',
        category: 'nice-to-have',
        priority: 'low',
        userStories: [{
          role: 'user',
          goal: 'understand my usage patterns',
          benefit: 'optimize my workflow',
          acceptanceCriteria: [
            'View usage statistics over time',
            'Export data as CSV',
            'Filter by date range'
          ]
        }],
        technicalRequirements: {
          apiEndpoints: ['/api/analytics', '/api/analytics/export'],
          dataModels: ['AnalyticsEvent', 'UsageStats'],
          libraries: ['chart.js', 'date-fns'],
          constraints: ['Historical data retention: 12 months']
        },
        dependencies: { requires: [], blocks: [], relatedTo: ['feature_2_default'] },
        effortEstimate: 8,
        successMetrics: ['40% users view analytics monthly', 'Average session time on analytics > 2min'],
        designNotes: 'Charts and graphs for visualization. Date range picker. Export button.'
      },
    ];

    // Default screen mappings
    const screenMappings: ScreenMapping[] = [
      {
        screenNumber: 1,
        screenTitle: 'Landing/Login',
        description: 'Entry point for the application',
        features: ['feature_1_default'],
      },
      {
        screenNumber: 2,
        screenTitle: 'Dashboard',
        description: 'Main dashboard with overview',
        features: ['feature_2_default', 'feature_5_default'],
      },
      {
        screenNumber: 3,
        screenTitle: 'Explore',
        description: 'Search and discover features',
        features: ['feature_3_default'],
      },
      {
        screenNumber: 4,
        screenTitle: 'Profile',
        description: 'User profile management',
        features: ['feature_4_default'],
      },
      {
        screenNumber: 5,
        screenTitle: 'Analytics',
        description: 'View usage analytics',
        features: ['feature_6_default'],
      },
    ];

    return {
      productType: 'website',
      suggestedFeatures: defaultFeatures,
      screenCount: 5,
      screenMappings,
      reasoning: 'Default feature set generated. Customize based on your specific requirements.',
    };
  }

  /**
   * Normalize product type
   */
  private normalizeProductType(
    type: string
  ): 'website' | 'mobile_app' | 'both' {
    if (type && typeof type === 'string') {
      const lower = type.toLowerCase();
      if (lower.includes('mobile') || lower.includes('app')) return 'mobile_app';
      if (lower.includes('both')) return 'both';
    }
    return 'website';
  }

  /**
   * Normalize feature category
   */
  private normalizeCategory(category: string): string {
    if (category && typeof category === 'string') {
      const lower = category.toLowerCase();
      if (lower.includes('secondary')) return 'secondary';
      if (lower.includes('nice')) return 'nice-to-have';
    }
    return 'core';
  }

  /**
   * Normalize priority
   */
  private normalizePriority(priority: string): string {
    if (priority && typeof priority === 'string') {
      const lower = priority.toLowerCase();
      if (lower.includes('low')) return 'low';
      if (lower.includes('medium')) return 'medium';
    }
    return 'high';
  }

  /**
   * Normalize user stories with defaults
   */
  private normalizeUserStories(stories: any[]): UserStory[] {
    if (!Array.isArray(stories) || stories.length === 0) {
      return [{
        role: 'user',
        goal: 'use this feature',
        benefit: 'accomplish my task',
        acceptanceCriteria: ['Feature functions as expected']
      }];
    }

    return stories.map(s => ({
      role: s.role || 'user',
      goal: s.goal || 'use this feature',
      benefit: s.benefit || 'accomplish task',
      acceptanceCriteria: Array.isArray(s.acceptanceCriteria) && s.acceptanceCriteria.length > 0
        ? s.acceptanceCriteria
        : ['Feature functions as expected']
    }));
  }

  /**
   * Normalize technical requirements with defaults
   */
  private normalizeTechnicalRequirements(req: any): TechnicalRequirements {
    return {
      apiEndpoints: Array.isArray(req?.apiEndpoints) ? req.apiEndpoints : [],
      dataModels: Array.isArray(req?.dataModels) ? req.dataModels : [],
      libraries: Array.isArray(req?.libraries) ? req.libraries : [],
      constraints: Array.isArray(req?.constraints) ? req.constraints : []
    };
  }

  /**
   * Normalize dependencies with defaults
   */
  private normalizeDependencies(dep: any): FeatureDependencies {
    return {
      requires: Array.isArray(dep?.requires) ? dep.requires : [],
      blocks: Array.isArray(dep?.blocks) ? dep.blocks : [],
      relatedTo: Array.isArray(dep?.relatedTo) ? dep.relatedTo : []
    };
  }

  /**
   * Normalize effort estimate to valid Fibonacci number
   */
  private normalizeEffortEstimate(estimate: any): number {
    const validEstimates = [1, 2, 3, 5, 8, 13, 21];
    const num = typeof estimate === 'number' ? estimate : 5;

    // Find closest valid estimate
    return validEstimates.reduce((prev, curr) =>
      Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
    );
  }

  /**
   * Convert FeaturePlan to result format
   */
  private planToResult(plan: FeaturePlan): FeaturePlanResult {
    return {
      id: plan.id,
      researchId: plan.researchId,
      projectId: plan.projectId,
      productType: plan.productType,
      features: plan.features,
      screenMappings: plan.screenMappings,
      screenCount: plan.screenCount,
      status: plan.status,
      locked: plan.locked,
      reasoning: plan.reasoning,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}

export const featurePlanningService = new FeaturePlanningService();

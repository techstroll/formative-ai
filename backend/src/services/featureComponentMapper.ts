/**
 * Feature Component Mapper Service
 *
 * Analyzes features and maps them to appropriate UI components based on
 * semantic matching and feature category detection.
 */

import {
  FEATURE_COMPONENT_MAPPINGS,
  FeatureComponentMapping,
  matchFeatureToCategory,
  getAllComponents,
  getLayoutPattern,
} from '../config/featureComponentMappings';
import { ComponentMetadata, getComponentById } from '../config/componentLibrary';

export interface Feature {
  id: string;
  name: string;
  description: string;
  category?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FeatureComponentRecommendation {
  featureId: string;
  featureName: string;
  detectedCategory: string;
  mapping: FeatureComponentMapping;
  recommendedComponents: ComponentMetadata[];
  requiredComponentIds: string[];
  optionalComponentIds: string[];
  layoutPattern: string;
  designGuidance: string;
  confidence: 'high' | 'medium' | 'low';
}

class FeatureComponentMapperService {
  /**
   * Analyze a single feature and recommend components
   */
  mapFeatureToComponents(feature: Feature): FeatureComponentRecommendation {
    // Match feature to category based on name and description
    const mapping = matchFeatureToCategory(feature.name, feature.description);

    // Get component metadata for all recommended components
    const allComponentIds = getAllComponents(mapping);
    const componentMetadata: ComponentMetadata[] = [];

    for (const componentId of allComponentIds) {
      const component = getComponentById(componentId);
      if (component) {
        componentMetadata.push(component);
      }
    }

    // Determine confidence based on how specific the match is
    const confidence = this.calculateConfidence(feature, mapping);

    return {
      featureId: feature.id,
      featureName: feature.name,
      detectedCategory: mapping.category,
      mapping,
      recommendedComponents: componentMetadata,
      requiredComponentIds: mapping.requiredComponents,
      optionalComponentIds: mapping.optionalComponents,
      layoutPattern: mapping.layoutPattern,
      designGuidance: mapping.designGuidance,
      confidence,
    };
  }

  /**
   * Map multiple features to components
   */
  mapFeaturesToComponents(features: Feature[]): FeatureComponentRecommendation[] {
    return features.map(feature => this.mapFeatureToComponents(feature));
  }

  /**
   * Get component recommendations for a screen based on its features
   */
  getComponentsForScreen(features: Feature[]): {
    allComponents: ComponentMetadata[];
    requiredComponents: ComponentMetadata[];
    optionalComponents: ComponentMetadata[];
    layoutSuggestion: string;
    designGuidance: string[];
  } {
    const recommendations = this.mapFeaturesToComponents(features);

    // Collect unique components across all features
    const allComponentIds = new Set<string>();
    const requiredIds = new Set<string>();
    const optionalIds = new Set<string>();
    const layoutPatterns: string[] = [];
    const designGuidance: string[] = [];

    for (const rec of recommendations) {
      rec.requiredComponentIds.forEach(id => {
        allComponentIds.add(id);
        requiredIds.add(id);
      });
      rec.optionalComponentIds.forEach(id => {
        allComponentIds.add(id);
        optionalIds.add(id);
      });
      layoutPatterns.push(rec.layoutPattern);
      designGuidance.push(`${rec.featureName}: ${rec.designGuidance}`);
    }

    // Get metadata for all components
    const allComponents: ComponentMetadata[] = [];
    const requiredComponents: ComponentMetadata[] = [];
    const optionalComponents: ComponentMetadata[] = [];

    allComponentIds.forEach(id => {
      const component = getComponentById(id);
      if (component) {
        allComponents.push(component);
        if (requiredIds.has(id)) requiredComponents.push(component);
        if (optionalIds.has(id)) optionalComponents.push(component);
      }
    });

    // Determine dominant layout pattern
    const layoutSuggestion = this.selectDominantLayoutPattern(layoutPatterns);

    return {
      allComponents,
      requiredComponents,
      optionalComponents,
      layoutSuggestion,
      designGuidance,
    };
  }

  /**
   * Calculate confidence score for a feature-category match
   */
  private calculateConfidence(feature: Feature, mapping: FeatureComponentMapping): 'high' | 'medium' | 'low' {
    const searchText = `${feature.name} ${feature.description}`.toLowerCase();

    // Check for exact keyword matches
    let exactMatches = 0;
    for (const pattern of mapping.patterns) {
      if (searchText.includes(pattern.toLowerCase())) {
        exactMatches++;
      }
    }

    // High confidence: multiple keyword matches or category is not generic
    if (exactMatches >= 2 || (exactMatches >= 1 && mapping.category !== 'generic')) {
      return 'high';
    }

    // Medium confidence: single keyword match
    if (exactMatches === 1) {
      return 'medium';
    }

    // Low confidence: fallback to generic
    return 'low';
  }

  /**
   * Select the dominant layout pattern from multiple patterns
   */
  private selectDominantLayoutPattern(patterns: string[]): string {
    if (patterns.length === 0) return 'detail';

    // Count occurrences of each pattern
    const counts: Record<string, number> = {};
    for (const pattern of patterns) {
      counts[pattern] = (counts[pattern] || 0) + 1;
    }

    // Priority order for layout patterns (if tie)
    const priorityOrder = ['dashboard', 'grid', 'form', 'list', 'hero', 'detail', 'split'];

    // Find pattern with highest count
    let maxCount = 0;
    let dominantPattern = 'detail';

    for (const [pattern, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantPattern = pattern;
      } else if (count === maxCount) {
        // If tie, use priority order
        const currentIndex = priorityOrder.indexOf(pattern);
        const dominantIndex = priorityOrder.indexOf(dominantPattern);
        if (currentIndex < dominantIndex) {
          dominantPattern = pattern;
        }
      }
    }

    return dominantPattern;
  }

  /**
   * Get component IDs for a specific feature category
   */
  getComponentsForCategory(category: string): string[] {
    const mapping = FEATURE_COMPONENT_MAPPINGS.find(m => m.category === category);
    return mapping ? getAllComponents(mapping) : [];
  }

  /**
   * Get all available feature categories
   */
  getAllCategories(): string[] {
    return FEATURE_COMPONENT_MAPPINGS.map(m => m.category);
  }

  /**
   * Get mapping details for a category
   */
  getCategoryMapping(category: string): FeatureComponentMapping | null {
    return FEATURE_COMPONENT_MAPPINGS.find(m => m.category === category) || null;
  }
}

// Export singleton instance
export const featureComponentMapper = new FeatureComponentMapperService();

/**
 * Feature Validation Service
 *
 * Validates that features have complete PRD details before confirmation
 */

import { Feature, FeaturePlan } from '../models/FeaturePlan';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate a single feature has all required PRD fields
 */
export function validateFeature(feature: Feature): ValidationResult {
  const errors: string[] = [];

  // Basic fields
  if (!feature.id) errors.push('Feature missing id');
  if (!feature.name?.trim()) errors.push(`Feature ${feature.id}: name required`);
  if (!feature.description?.trim()) errors.push(`Feature ${feature.id}: description required`);

  // User Stories
  if (!feature.userStories || feature.userStories.length === 0) {
    errors.push(`Feature "${feature.name}": at least one user story required`);
  } else {
    feature.userStories.forEach((story, idx) => {
      if (!story.role?.trim()) {
        errors.push(`Feature "${feature.name}", Story ${idx + 1}: role required`);
      }
      if (!story.goal?.trim()) {
        errors.push(`Feature "${feature.name}", Story ${idx + 1}: goal required`);
      }
      if (!story.benefit?.trim()) {
        errors.push(`Feature "${feature.name}", Story ${idx + 1}: benefit required`);
      }
      if (!story.acceptanceCriteria || story.acceptanceCriteria.length === 0) {
        errors.push(`Feature "${feature.name}", Story ${idx + 1}: acceptance criteria required`);
      }
    });
  }

  // Technical Requirements
  if (!feature.technicalRequirements) {
    errors.push(`Feature "${feature.name}": technicalRequirements required`);
  } else {
    const tr = feature.technicalRequirements;
    if (!Array.isArray(tr.apiEndpoints)) {
      errors.push(`Feature "${feature.name}": apiEndpoints must be an array`);
    }
    if (!Array.isArray(tr.dataModels)) {
      errors.push(`Feature "${feature.name}": dataModels must be an array`);
    }
    if (!Array.isArray(tr.libraries)) {
      errors.push(`Feature "${feature.name}": libraries must be an array`);
    }
    if (!Array.isArray(tr.constraints)) {
      errors.push(`Feature "${feature.name}": constraints must be an array`);
    }
  }

  // Dependencies
  if (!feature.dependencies) {
    errors.push(`Feature "${feature.name}": dependencies required`);
  } else {
    const d = feature.dependencies;
    if (!Array.isArray(d.requires)) {
      errors.push(`Feature "${feature.name}": dependencies.requires must be an array`);
    }
    if (!Array.isArray(d.blocks)) {
      errors.push(`Feature "${feature.name}": dependencies.blocks must be an array`);
    }
    if (!Array.isArray(d.relatedTo)) {
      errors.push(`Feature "${feature.name}": dependencies.relatedTo must be an array`);
    }
  }

  // Effort Estimate
  const validEstimates = [1, 2, 3, 5, 8, 13, 21];
  if (!validEstimates.includes(feature.effortEstimate)) {
    errors.push(
      `Feature "${feature.name}": effortEstimate must be a Fibonacci number (1, 2, 3, 5, 8, 13, or 21)`
    );
  }

  // Success Metrics
  if (!feature.successMetrics || feature.successMetrics.length === 0) {
    errors.push(`Feature "${feature.name}": at least one success metric required`);
  }

  // Design Notes
  if (!feature.designNotes?.trim()) {
    errors.push(`Feature "${feature.name}": designNotes required`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate all features in a feature plan
 */
export function validateFeaturePlan(plan: FeaturePlan): ValidationResult {
  const allErrors: string[] = [];

  // Validate each feature
  plan.features.forEach(feature => {
    const result = validateFeature(feature);
    allErrors.push(...result.errors);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

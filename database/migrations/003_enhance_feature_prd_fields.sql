-- Migration: Enhance Feature PRD Fields
-- Version: 003
-- Description: Documents the enhanced Feature structure with comprehensive PRD details
--
-- NOTE: This migration does NOT modify the database schema.
-- PostgreSQL JSONB columns are schema-less, so the features JSONB column
-- can store the new enhanced Feature structure without schema changes.
--
-- This file serves as documentation of the expected Feature structure.

-- Document the new Feature structure expected in features JSONB column
COMMENT ON COLUMN feature_plans.features IS
'JSONB array of Feature objects with complete PRD details:
{
  id: string,
  name: string,
  description: string,
  category: "core" | "secondary" | "nice-to-have" | "custom",
  priority: "high" | "medium" | "low",
  userStories: [
    {
      role: string,
      goal: string,
      benefit: string,
      acceptanceCriteria: string[]
    }
  ],
  technicalRequirements: {
    apiEndpoints: string[],
    dataModels: string[],
    libraries: string[],
    constraints: string[]
  },
  dependencies: {
    requires: string[],  -- Feature IDs that must be completed first
    blocks: string[],    -- Feature IDs blocked by this feature
    relatedTo: string[]  -- Related feature IDs
  },
  effortEstimate: number,  -- Story points (1, 2, 3, 5, 8, 13, 21)
  successMetrics: string[],
  designNotes: string
}';

-- Track migration version
DO $$
BEGIN
  -- Create migrations table if it doesn't exist
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Record this migration
  INSERT INTO schema_migrations (version, description)
  VALUES (3, 'Enhanced Feature PRD fields documentation')
  ON CONFLICT (version) DO NOTHING;
END
$$;

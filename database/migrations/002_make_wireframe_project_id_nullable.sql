-- Migration: Make wireframe_artifacts.project_id nullable
-- This allows wireframes to be created independently of projects

-- Drop the NOT NULL constraint on project_id
ALTER TABLE wireframe_artifacts
ALTER COLUMN project_id DROP NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN wireframe_artifacts.project_id IS 'Foreign key to projects table (nullable - wireframes can exist independently)';

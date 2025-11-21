-- Formative.AI Database Schema
-- Version 1.0
-- PostgreSQL 16

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  company_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  category VARCHAR(100),
  target_market VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- ============================================================================
-- RESEARCH ARTIFACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content JSONB,
  market_analysis TEXT,
  competitor_analysis TEXT,
  target_audience TEXT,
  key_insights JSONB,
  confidence_score FLOAT DEFAULT 0.0,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1
);

-- ============================================================================
-- WIREFRAME ARTIFACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS wireframe_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  research_id UUID REFERENCES research_artifacts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  design_type VARCHAR(100),
  svg_content TEXT,
  layout_json JSONB,
  screens JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1
);

-- ============================================================================
-- PROTOTYPE ARTIFACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS prototype_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wireframe_id UUID REFERENCES wireframe_artifacts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  prototype_json JSONB,
  interactive_flows JSONB,
  component_library JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1
);

-- ============================================================================
-- PRD ARTIFACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS prd_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  research_id UUID REFERENCES research_artifacts(id),
  wireframe_id UUID REFERENCES wireframe_artifacts(id),
  prototype_id UUID REFERENCES prototype_artifacts(id),
  title VARCHAR(255) NOT NULL,
  prd_content JSONB,
  executive_summary TEXT,
  success_metrics JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  document_format VARCHAR(50) DEFAULT 'docx',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1
);

-- ============================================================================
-- VALIDATION WORKFLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS validation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL,
  artifact_type VARCHAR(100) NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  reviewer_email VARCHAR(255),
  approval_token VARCHAR(255) UNIQUE,
  feedback TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

-- ============================================================================
-- USAGE METRICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL,
  value FLOAT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- ============================================================================
-- KNOWLEDGE BASE TABLE (for RAG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(255),
  content_type VARCHAR(50),
  embedding_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- FILE UPLOADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID REFERENCES research_artifacts(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mimetype VARCHAR(100),
  file_size INTEGER,
  file_type VARCHAR(50),
  parsed_data JSONB,
  status VARCHAR(50) DEFAULT 'uploaded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- RESEARCH SESSIONS TABLE (for tracking long-running research)
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'generating',
  topic VARCHAR(255) NOT NULL,
  target_audience VARCHAR(255),
  competitors TEXT,
  geographic_focus VARCHAR(255),
  estimated_completion_time TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_research_artifacts_project_id ON research_artifacts(project_id);
CREATE INDEX idx_wireframe_artifacts_project_id ON wireframe_artifacts(project_id);
CREATE INDEX idx_prototype_artifacts_project_id ON prototype_artifacts(project_id);
CREATE INDEX idx_prd_artifacts_project_id ON prd_artifacts(project_id);
CREATE INDEX idx_validation_workflows_project_id ON validation_workflows(project_id);
CREATE INDEX idx_validation_workflows_status ON validation_workflows(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX idx_usage_metrics_timestamp ON usage_metrics(timestamp);
CREATE INDEX idx_knowledge_base_is_active ON knowledge_base(is_active);
CREATE INDEX idx_file_uploads_research_id ON file_uploads(research_id);
CREATE INDEX idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX idx_research_sessions_project_id ON research_sessions(project_id);
CREATE INDEX idx_research_sessions_status ON research_sessions(status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER trigger_users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_projects_update_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_research_artifacts_update_timestamp
BEFORE UPDATE ON research_artifacts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_wireframe_artifacts_update_timestamp
BEFORE UPDATE ON wireframe_artifacts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_prototype_artifacts_update_timestamp
BEFORE UPDATE ON prototype_artifacts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_prd_artifacts_update_timestamp
BEFORE UPDATE ON prd_artifacts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_knowledge_base_update_timestamp
BEFORE UPDATE ON knowledge_base
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_file_uploads_update_timestamp
BEFORE UPDATE ON file_uploads
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_research_sessions_update_timestamp
BEFORE UPDATE ON research_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- SEED DATA (OPTIONAL - for development)
-- ============================================================================
-- INSERT INTO knowledge_base (title, content, source, content_type, is_active)
-- VALUES (
--   'SaaS Best Practices',
--   'Lorem ipsum dolor sit amet...',
--   'internal',
--   'article',
--   TRUE
-- );

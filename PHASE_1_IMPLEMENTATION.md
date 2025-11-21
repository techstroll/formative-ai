# Phase 1: Research Module Implementation Plan

**Duration**: Weeks 3-5 (3 weeks)
**Objective**: Build AI-driven research engine with market insights generation
**Target**: Generate comprehensive market research reports in <3 minutes with 85% accuracy

---

## Phase 1 Overview

This phase implements the core Research Module - the foundation of the Formative.AI platform. The research module will:

1. Accept product research requests from users
2. Perform market analysis using AI + external data sources
3. Generate structured reports with SWOT analysis
4. Email validation workflows for approval
5. Support competitor data uploads and analysis

**Success Criteria**:
- ✅ Research API endpoints operational
- ✅ Market report generation <3 minutes
- ✅ 85% accuracy baseline established
- ✅ Email validation workflow functional
- ✅ End-to-end flow tested with real data

---

## Work Breakdown Structure

### Track A: Backend Infrastructure (Database & Auth)

#### Task A1: Database Models & Migrations
**Duration**: 2 days
**Owner**: Backend Team

**Subtasks**:
1. Create database connection pool (using `pg` module)
2. Implement User model with password hashing (bcrypt)
3. Create Project model
4. Create ResearchArtifact model with JSONB columns
5. Create ValidationWorkflow model
6. Create database migration scripts
7. Seed test data

**Files to Create**:
```
backend/src/models/
├── User.ts
├── Project.ts
├── ResearchArtifact.ts
└── ValidationWorkflow.ts

backend/src/database/
├── connection.ts
├── migrations/
│   ├── 001_init_schema.sql
│   └── 002_add_indexes.sql
└── seeds/
    └── test-data.sql

backend/src/services/
└── databaseService.ts
```

**Testing**: Integration tests for database operations

---

#### Task A2: User Authentication System
**Duration**: 3 days
**Owner**: Backend Team

**Subtasks**:
1. Implement password hashing (bcrypt)
2. Create JWT token generation/validation
3. Build signup endpoint with email validation
4. Build login endpoint
5. Create protected middleware for JWT verification
6. Implement refresh token logic
7. Add password reset flow

**Files to Create**:
```
backend/src/routes/
└── auth.ts                    # Signup, login, refresh, logout

backend/src/services/
├── authService.ts             # JWT, password handling
└── emailService.ts            # Verification emails

backend/src/middleware/
└── auth.ts                    # JWT verification
```

**Endpoints**:
- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/refresh` - Get new token
- `POST /api/v1/auth/logout` - Clear session

**Testing**: Unit tests for auth logic, integration tests for endpoints

---

### Track B: Frontend - Research Input & Display

#### Task B1: Research Input Form Component
**Duration**: 2 days
**Owner**: Frontend Team

**Subtasks**:
1. Create research input form with fields:
   - Product/topic name
   - Target audience
   - Geographic focus
   - Industry/category
   - Competitor list (comma-separated)
   - Data sources preference (auto/manual/both)
   - File upload for existing research

2. Implement form validation (Joi schemas or similar)
3. Add real-time character counting
4. Create progress indicator
5. Implement error handling display
6. Add loading states during submission

**Files to Create**:
```
frontend/pages/
├── research/
│   ├── index.tsx              # Research module main page
│   ├── new.tsx                # New research form
│   └── [id].tsx               # Research report view

frontend/components/
├── ResearchModule/
│   ├── ResearchForm.tsx       # Input form
│   ├── ResearchReport.tsx     # Report viewer
│   ├── ReportTemplate.tsx     # Template selector
│   └── FileUpload.tsx         # Competitor data upload

frontend/lib/
├── api/researchApi.ts         # API client functions
└── types/research.ts          # TypeScript types
```

**UI/UX**:
- Clean form with inline help text
- Progress bar showing generation status
- Template selector before submission
- Real-time validation feedback

**Testing**: Component tests with React Testing Library

---

#### Task B2: Research Report Viewer Component
**Duration**: 2 days
**Owner**: Frontend Team

**Subtasks**:
1. Create report display component with:
   - Executive summary
   - Market analysis section
   - SWOT analysis (visual grid)
   - Competitor matrix
   - Key insights list
   - Recommendations

2. Implement tabbed interface for different sections
3. Add print-to-PDF functionality
4. Create download as DOCX button
5. Add validation email preview
6. Implement edit mode for manual corrections

**Files to Create**:
- `frontend/components/ResearchModule/ResearchReport.tsx`
- `frontend/components/ResearchModule/SWOTDisplay.tsx`
- `frontend/components/ResearchModule/CompetitorMatrix.tsx`
- `frontend/lib/reportFormatting.ts`

**Testing**: Component tests, visual regression tests

---

### Track C: AI Pipeline - Research Agent

#### Task C1: LangChain Research Agent Scaffold
**Duration**: 2 days
**Owner**: AI Team

**Subtasks**:
1. Set up LangChain agent framework
2. Create tool definitions for:
   - Web search
   - Document retrieval from vector DB
   - Company/competitor data lookup
   - SWOT generation
   - Report compilation

3. Implement agent state management
4. Create prompt templates
5. Add error handling and retries
6. Implement logging

**Files to Create**:
```
ai-pipeline/src/agents/
├── research_agent.py          # Main research agent
├── base_agent.py              # Base agent class
└── tools.py                   # Tool definitions

ai-pipeline/src/prompts/
├── research_prompts.py        # Prompt templates
├── swot_prompts.py
└── report_prompts.py

ai-pipeline/src/services/
├── llm_service.py             # LLM wrapper (OpenAI/Claude)
├── rag_service.py             # Vector DB retrieval
└── search_service.py          # External search APIs
```

**Agent Flow**:
1. Receive research request
2. Query for existing company data
3. Search for market information
4. Retrieve relevant documents from vector DB
5. Generate market analysis
6. Create SWOT analysis
7. Generate competitor matrix
8. Compile report

**Testing**: Unit tests for agent logic, mock external services

---

#### Task C2: OpenAI/Claude Integration
**Duration**: 2 days
**Owner**: AI Team

**Subtasks**:
1. Implement OpenAI API client with:
   - GPT-4 or GPT-3.5-turbo models
   - Streaming response support
   - Error handling & retries
   - Token counting
   - Cost tracking

2. Implement Anthropic Claude API client
3. Create LLM abstraction layer
4. Add fallback logic (use Claude if OpenAI fails)
5. Implement caching of identical requests
6. Add rate limiting awareness

**Files to Create**:
```
ai-pipeline/src/services/
├── openai_service.py
├── anthropic_service.py
└── llm_service.py            # Abstraction layer
```

**Environment Variables Needed**:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229
```

**Testing**: Integration tests with real API (using VCR for recording)

---

#### Task C3: Web Search Integration (Google)
**Duration**: 2 days
**Owner**: AI Team

**Subtasks**:
1. Set up Google Custom Search API
2. Create search query generation logic
3. Implement search results processing
4. Add filtering for relevance
5. Implement deduplication
6. Add result ranking
7. Handle search failures gracefully

**Files to Create**:
```
ai-pipeline/src/services/
└── search_service.py          # Google Search implementation
```

**Queries to Perform**:
- Market size and growth trends
- Competitor product analysis
- Industry news and reports
- Target audience insights
- Regulatory/compliance info

**Environment Variables**:
```
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
GOOGLE_SEARCH_MAX_RESULTS=5
```

**Testing**: Mock Google API responses, test ranking logic

---

### Track D: Data Retrieval & Vector Database

#### Task D1: Pinecone Vector DB Setup
**Duration**: 2 days
**Owner**: Backend/AI Team

**Subtasks**:
1. Create Pinecone account and index
2. Implement vector embedding generation (using OpenAI embeddings)
3. Create document ingestion pipeline
4. Build vector search functionality
5. Implement metadata filtering
6. Add document chunking for long documents
7. Create index management utilities

**Files to Create**:
```
ai-pipeline/src/services/
├── vector_db_service.py       # Pinecone operations
├── embedding_service.py       # Generate embeddings
└── document_processor.py      # Chunk and prepare docs

ai-pipeline/src/data/
└── seed_knowledge_base.py     # Load initial documents
```

**Initial Documents to Index**:
- Product management best practices
- SaaS market reports
- Industry whitepapers
- Competitor profiles
- Market research templates

**Environment Variables**:
```
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=formative-research
PINECONE_DIMENSION=1536
```

**Testing**: Test embedding quality, search relevance

---

#### Task D2: Report Template Engine
**Duration**: 2 days
**Owner**: Backend Team

**Subtasks**:
1. Design report template structure (JSON-based)
2. Create template selector logic
3. Implement template-to-report compilation
4. Add dynamic section generation
5. Create template validation
6. Build template versioning

**Files to Create**:
```
ai-pipeline/src/templates/
├── base_template.json
├── startup_template.json
├── saas_template.json
└── template_engine.py

backend/src/services/
└── reportService.ts           # Report compilation in backend
```

**Report Sections**:
- Executive Summary
- Market Overview
- Target Audience Analysis
- Competitive Landscape
- SWOT Analysis
- Key Opportunities
- Recommended Actions
- Appendix (raw data)

**Testing**: Template validation, section generation

---

### Track E: Document Generation & Email

#### Task E1: Report Export (PDF/DOCX)
**Duration**: 2 days
**Owner**: Backend Team

**Subtasks**:
1. Implement DOCX generation using `docxtemplater` or `docx`
2. Create PDF generation using ReportLab
3. Build dynamic content insertion
4. Add styling and formatting
5. Create export templates
6. Implement export caching
7. Add virus scanning for file safety

**Files to Create**:
```
backend/src/services/
├── documentService.ts         # PDF/DOCX generation
└── reportExportService.ts     # Export orchestration
```

**Export Templates**:
- Professional report layout
- Company branding support
- Custom header/footer
- Page numbering
- Table of contents generation
- Chart/graph embedding

**NPM Packages**:
- `docxtemplater` - DOCX templates
- `reportlab` (via Python) - PDF generation
- `pdf-lib` - PDF manipulation (if needed)

**Testing**: Generate sample reports, validate output format

---

#### Task E2: Email Validation Workflow (SendGrid)
**Duration**: 2 days
**Owner**: Backend Team

**Subtasks**:
1. Set up SendGrid account and templates
2. Create validation token generation
3. Implement email sending logic
4. Create approval/rejection endpoints
5. Build validation tracking
6. Add audit logging
7. Implement expiration handling (7-day default)

**Files to Create**:
```
backend/src/routes/
└── validation.ts              # Approval/rejection endpoints

backend/src/services/
├── emailService.ts            # SendGrid integration
├── validationService.ts       # Token generation/tracking
└── auditService.ts            # Audit logging
```

**Email Flow**:
1. Report generated
2. Validation email sent to stakeholder
3. Email contains approval/rejection links with tokens
4. Stakeholder clicks link
5. Token validated and action processed
6. Audit trail logged

**Endpoints**:
- `POST /api/v1/validation/send` - Send validation email
- `POST /api/v1/validation/:token/approve` - Approve report
- `POST /api/v1/validation/:token/reject` - Reject with feedback
- `GET /api/v1/validation/:token/status` - Check validation status

**Environment Variables**:
```
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@formative-ai.com
SENDGRID_TEMPLATE_ID_VALIDATION=...
VALIDATION_TOKEN_EXPIRY=604800  # 7 days in seconds
```

**Testing**: Mock SendGrid, test token validation

---

### Track F: File Upload & Competitor Data

#### Task F1: File Upload Service
**Duration**: 2 days
**Owner**: Backend Team

**Subtasks**:
1. Implement file upload endpoint
2. Add file type validation (CSV, XLSX, TXT, PDF)
3. Create file parsing logic
4. Add virus/malware scanning
5. Implement storage (S3 or MinIO)
6. Create file cleanup scheduling
7. Add upload progress tracking

**Files to Create**:
```
backend/src/routes/
└── upload.ts                  # File upload endpoints

backend/src/services/
├── fileService.ts             # File handling
├── storageService.ts          # S3/MinIO operations
└── dataParsingService.ts      # Parse CSV/XLSX
```

**Supported Formats**:
- CSV (competitor data, market data)
- XLSX (spreadsheet data)
- TXT (research notes)
- PDF (reports, whitepapers)

**Endpoints**:
- `POST /api/v1/research/:id/upload` - Upload competitor/market data
- `GET /api/v1/research/:id/uploads` - List uploaded files
- `DELETE /api/v1/research/:id/upload/:fileId` - Delete file

**Testing**: Test various file formats, size limits

---

#### Task F2: Competitor Data Processing
**Duration**: 2 days
**Owner**: AI Team

**Subtasks**:
1. Parse uploaded competitor data
2. Extract structured information
3. Normalize data format
4. Store in vector DB for retrieval
5. Generate competitor profiles
6. Create comparison matrices
7. Add competitor timeline analysis

**Files to Create**:
```
ai-pipeline/src/services/
├── competitor_parser.py       # Parse competitor data
├── competitor_analyzer.py     # Analysis logic
└── competitor_db.py           # Storage/retrieval
```

**Extracted Information**:
- Company overview
- Product features
- Pricing strategy
- Target market
- Strengths/weaknesses
- Market position
- Growth trajectory

**Testing**: Test with sample competitor data files

---

### Track G: Testing & Validation

#### Task G1: Performance Testing
**Duration**: 2 days
**Owner**: QA Team

**Subtasks**:
1. Measure end-to-end research generation time
2. Test with various input sizes
3. Identify bottlenecks
4. Optimize slow operations
5. Create performance benchmarks
6. Set up continuous monitoring

**Target Metrics**:
- Total generation: <3 minutes
- API response: <500ms p95
- Search queries: <30 seconds
- Report compilation: <60 seconds
- Email sending: <5 seconds

**Testing Tools**:
- Apache JMeter for load testing
- Artillery for API testing
- Python timeit for function profiling

---

#### Task G2: Accuracy Baseline Testing
**Duration**: 3 days
**Owner**: QA Team

**Subtasks**:
1. Create test dataset (10-15 research scenarios)
2. Generate reports via system
3. Have humans review for accuracy
4. Score accuracy against criteria:
   - Factual accuracy
   - Completeness
   - Relevance
   - Structure
   - Actionability

5. Calculate baseline accuracy
6. Document accuracy issues
7. Create improvement plan

**Target**: ≥80% accuracy on structured elements

**Testing Framework**:
- Manual review by product managers
- Structured scoring rubric
- Comparison with human-written reports

---

## Implementation Order (Recommended)

### Week 3 (Days 1-5)

**Monday-Tuesday (Days 1-2): Foundation**
- ✅ Task A1: Database Models & Migrations
- ✅ Task A2.1: Password hashing setup

**Wednesday (Day 3): Auth Core**
- ✅ Task A2: User Authentication System (complete)
- ✅ Task C2.1: OpenAI integration (basic setup)

**Thursday-Friday (Days 4-5): Frontend Start**
- ✅ Task B1: Research Input Form Component
- ✅ Create TypeScript types for research data

### Week 4 (Days 6-10)

**Monday-Wednesday (Days 6-8): AI Pipeline**
- ✅ Task C1: LangChain Research Agent
- ✅ Task C2: Full LLM integration
- ✅ Task C3: Google Search integration

**Thursday-Friday (Days 9-10): Data Layer**
- ✅ Task D1: Pinecone Vector DB
- ✅ Task D2: Report Template Engine

### Week 5 (Days 11-15)

**Monday-Wednesday (Days 11-13): Export & Email**
- ✅ Task E1: Report Export (PDF/DOCX)
- ✅ Task E2: Email Validation Workflow
- ✅ Task F1: File Upload Service

**Thursday-Friday (Days 14-15): Testing**
- ✅ Task G1: Performance Testing
- ✅ Task G2: Accuracy Baseline

---

## API Contract (Frontend ↔ Backend)

### Research Create Request
```typescript
POST /api/v1/research

{
  "projectId": "uuid",
  "topic": "AI-powered product assistant",
  "targetAudience": "Enterprise SaaS companies",
  "geographicFocus": "North America",
  "industry": "B2B SaaS",
  "competitors": ["Intercom", "Drift", "Zendesk"],
  "dataSourcesPreference": "both",
  "templateId": "saas_template"
}

Response (202 Accepted):
{
  "id": "research-id",
  "projectId": "project-id",
  "status": "generating",
  "estimatedCompletionTime": "2025-11-14T10:30:00Z"
}
```

### Research Status & Results
```typescript
GET /api/v1/research/{id}

Response:
{
  "id": "research-id",
  "status": "completed",
  "generatedAt": "2025-11-14T10:28:00Z",
  "content": {
    "executiveSummary": "...",
    "marketAnalysis": {...},
    "swot": {
      "strengths": [...],
      "weaknesses": [...],
      "opportunities": [...],
      "threats": [...]
    },
    "competitorMatrix": {...},
    "keyInsights": [...],
    "recommendations": [...]
  },
  "metadata": {
    "accuracy": 0.87,
    "sourcesUsed": 15,
    "generationTime": 142  // seconds
  }
}
```

### Validation Workflow
```typescript
POST /api/v1/validation

{
  "artifactId": "research-id",
  "artifactType": "research",
  "reviewerEmail": "stakeholder@company.com"
}

Response:
{
  "id": "validation-id",
  "token": "secure-token-123",
  "emailSent": true,
  "expiresAt": "2025-11-21T10:28:00Z"
}
```

---

## Environment Variables Required

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://formative_user:formative_password@postgres:5432/formative_ai
REDIS_URL=redis://redis:6379

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000

# LLM APIs
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
ANTHROPIC_API_KEY=sk-ant-...

# Search
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...

# Vector DB
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# Email
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@formative-ai.com

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=formative-ai-dev
```

### AI Pipeline (.env)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_SEARCH_API_KEY=...
PINECONE_API_KEY=...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## Success Criteria Checklist

### Functionality
- [ ] User signup/login working
- [ ] Research input form accepts all required data
- [ ] Research agent generates reports
- [ ] Report generation completes in <3 minutes
- [ ] Report format is correct (all sections present)
- [ ] Export to PDF/DOCX works
- [ ] Competitor data upload works
- [ ] Email validation workflow functions
- [ ] Approval/rejection actions update status
- [ ] API documentation complete

### Quality
- [ ] TypeScript compilation: zero errors
- [ ] Unit test coverage: ≥80%
- [ ] Integration tests pass
- [ ] No console errors/warnings
- [ ] Error handling comprehensive
- [ ] Logging informative and actionable

### Performance
- [ ] Research generation: <3 minutes
- [ ] API response time p95: <500ms
- [ ] Page load time: <2 seconds
- [ ] No memory leaks detected
- [ ] Database queries optimized

### Accuracy
- [ ] 80%+ accuracy baseline established
- [ ] Factual accuracy verified
- [ ] Structure completeness validated
- [ ] Human review completed

---

## Known Risks & Mitigation

### Risk: LLM API Costs
- **Mitigation**: Implement caching, use cheaper models for simple tasks, set API quotas

### Risk: Slow Search/Retrieval
- **Mitigation**: Optimize Pinecone queries, cache results, use shorter timeouts

### Risk: Email Delivery Issues
- **Mitigation**: Implement retry logic, track delivery status, add bounce handling

### Risk: File Upload Security
- **Mitigation**: Scan files, validate format, limit file size, store separately

---

## Resources & References

### Documentation
- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [SendGrid API Reference](https://docs.sendgrid.com/)
- [Express.js Guide](https://expressjs.com/en/starter/basic-routing.html)

### Libraries to Install
```bash
# Already installed (from requirements.txt / package.json):
langchain, langchain-openai, pinecone-client, openai, anthropic

# Backend additional:
npm install bcryptjs jsonwebtoken dotenv axios

# Frontend components:
npm install react-hook-form zod react-markdown recharts
```

---

## Next Steps

1. **Review & Approve Plan**: Confirm approach with team
2. **Set Up Development**: Configure all API keys and services
3. **Create Feature Branches**: One per major task
4. **Daily Standups**: Sync on progress and blockers
5. **Code Reviews**: Every PR needs 1+ approval
6. **Testing**: Write tests as you code, not after

---

**Phase 1 starts now. Track progress in the todo list above. Good luck!** 🚀

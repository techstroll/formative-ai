# Formative.AI - AI-Powered Product Lifecycle Intelligence Platform

[![Status](https://img.shields.io/badge/status-MVP%20Development-blue)]()
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## 🎯 Overview

Formative.AI is an intelligent, multi-agent Product Lifecycle Management platform that automates the journey from product idea to fully-structured PRD. Built with advanced AI orchestration, RAG (Retrieval-Augmented Generation), and domain-trained personas, it enables teams to:

- ✅ Generate complete market research reports in under 3 minutes
- ✅ Auto-generate wireframes and user flows in 90 seconds
- ✅ Create interactive clickable prototypes for stakeholder validation
- ✅ Produce validated, structured PRDs in under 5 minutes
- ✅ Enable intelligent multi-stage approval workflows

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- Node.js 20+ (for local development without Docker)
- Python 3.11+ (for local development without Docker)

### Local Development with Docker

```bash
# Clone the repository
git clone https://github.com/yourorg/formative-ai.git
cd formative-ai

# Copy environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-pipeline/.env.example ai-pipeline/.env

# Start all services (frontend, backend, AI pipeline, databases)
docker-compose up

# Services will be available at:
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:3001
# AI Pipeline:  http://localhost:8000
```

### Local Development without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**AI Pipeline:**
```bash
cd ai-pipeline
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## 📁 Project Structure

```
formative-ai/
├── frontend/              # Next.js React application
├── backend/               # Node.js/Express API server
├── ai-pipeline/          # FastAPI AI orchestration & agents
├── database/             # PostgreSQL migrations & schemas
├── docker/               # Docker configurations
├── docs/                 # Documentation
├── tests/                # Test suites
├── DEPLOYABLE_PLAN.md    # Comprehensive deployment guide
└── docker-compose.yml    # Local development setup
```

## 🏗️ Architecture

Formative.AI uses a sophisticated multi-tier architecture:

- **Frontend**: Next.js with React, TypeScript, and Tailwind CSS
- **API Layer**: Express.js with RESTful endpoints
- **AI Layer**: FastAPI with LangChain multi-agent orchestration
- **Databases**: PostgreSQL (transactional), Pinecone (vector search), Redis (caching)
- **LLMs**: GPT-5 (OpenAI) + Claude (Anthropic) for cross-validation
- **Infrastructure**: Docker + AWS ECS/Fargate for deployment

See [DEPLOYABLE_PLAN.md](./DEPLOYABLE_PLAN.md) for detailed architecture documentation.

## 📚 Documentation

- **[DEPLOYABLE_PLAN.md](./DEPLOYABLE_PLAN.md)** - Comprehensive deployment blueprint with architecture, timeline, and implementation guidelines
- **[docs/API.md](./docs/API.md)** - Complete API endpoint documentation
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture details
- **[docs/SETUP.md](./docs/SETUP.md)** - Detailed setup instructions
- **[docs/TESTING.md](./docs/TESTING.md)** - Testing strategies and procedures

## 🔑 Key Features

### Research Module
- AI-powered market research with verified sources
- Google Search integration for real-time competitor insights
- Template-based report generation (Market Overview, SWOT, Competitor Matrix)
- Manual data upload for custom datasets
- Email validation workflows

### Wireframing Module
- AI-driven layout generation from research insights
- SVG-based visualization with interactive editing
- Analytics visualization layer (charts, heatmaps)
- Export capabilities (SVG, PNG, JSON)

### Prototype Module
- Clickable prototype generation from wireframes
- Interactive screen navigation and linking
- Feedback collection mechanisms
- Stakeholder preview capabilities

### PRD Generation Module
- Automated PRD assembly from research, wireframes, and prototypes
- Intelligent requirement prioritization (impact × effort × urgency)
- Business case generation with ROI analysis
- Multi-stage approval workflows
- Export to DOCX/PDF with templated formatting

## 🎯 MVP Goals (4-Month Timeline)

| Phase | Duration | Goals |
|-------|----------|-------|
| Phase 0 | Weeks 1-2 | Foundation & infrastructure setup |
| Phase 1 | Weeks 3-5 | Research module implementation |
| Phase 2 | Weeks 6-8 | Wireframing & visualization |
| Phase 3 | Weeks 9-12 | Prototype & PRD generation |
| Phase 4 | Weeks 13-16 | QA, testing, pilot, deployment |

## 📊 Success Metrics

### Performance KPIs
- Research generation: **≤3 minutes**
- Wireframe generation: **≤90 seconds**
- PRD completion: **≤5 minutes**
- API response time (p95): **<500ms**
- Page load time: **<2 seconds**

### Quality KPIs
- AI accuracy vs human baseline: **≥80%**
- Code coverage: **≥80%**
- Bug density: **<3 per feature**
- System uptime: **≥99.5%**

### Business KPIs
- User validation rate: **≥70%**
- User satisfaction: **≥8/10**
- Time saved vs manual: **80% faster**

## 🔐 Security & Compliance

- HTTPS for all communications
- AWS KMS encryption at rest
- Role-based access control (RBAC)
- Data privacy and retention policies
- Regular security audits
- Encrypted database connections

## 🚀 Deployment

### Development
```bash
docker-compose up
```

### Staging
```bash
# Automated via GitHub Actions
# Push to 'develop' branch triggers CI/CD pipeline
git push origin develop
```

### Production
```bash
# Blue-green deployment to AWS ECS
# Automated rollback capability
# See DEPLOYABLE_PLAN.md for details
```

## 📝 Development Guidelines

### Code Standards
- **TypeScript** for type safety
- **Python 3.11+** with Pydantic for validation
- Minimum **80% test coverage**
- **ESLint** and **type-checking** enforced
- **Git workflow**: feature branches → develop → main

### Commit Messages
```
<type>(<scope>): <subject>

<body>

Closes #<issue>
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# AI pipeline tests
cd ai-pipeline && pytest
```

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up postgres
# Wait for healthy status, then restart all services
docker-compose up
```

### API Connection Errors
```bash
# Verify services are running
docker-compose ps

# Check AI pipeline health
curl http://localhost:8000/health

# Check backend health
curl http://localhost:3001/health
```

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make changes and commit with descriptive messages
3. Push to GitHub and create a Pull Request
4. Ensure all tests pass and code review is approved
5. Merge to `develop` for staging
6. After validation, create release to `main`

## 📧 Support & Questions

- **Issues**: Create a GitHub issue with detailed description
- **Documentation**: Check [docs/](./docs/) folder
- **Team**: Contact development team on Slack

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🎉 Acknowledgments

Built with modern AI frameworks:
- LangChain for multi-agent orchestration
- FastAPI for high-performance async services
- React/Next.js for responsive UI
- PostgreSQL + Pinecone for data persistence

---

**Version**: 1.0.0 | **Status**: MVP Development | **Last Updated**: November 2024

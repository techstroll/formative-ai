# Quick Start Guide - Formative.AI Development

## Prerequisites

✅ All dependencies installed
✅ Backend ready (Express/TypeScript)
✅ Frontend ready (Next.js/React)
✅ AI Pipeline ready (FastAPI/Python)

---

## Start Development (Easiest Way)

### Option 1: Automated Script (Recommended)

```bash
cd /Users/nick/Development/formative-ai
./start-dev.sh
```

This will:
- Clear any existing processes on ports 3000, 3001, 8000
- Start backend on port 3001
- Start frontend on port 3000
- Start AI pipeline on port 8000
- Display access points and logs

**To stop**: Press `Ctrl+C`

---

## Start Development (Manual - 3 Terminal Windows)

### Terminal 1: Backend API (Port 3001)

```bash
cd /Users/nick/Development/formative-ai/backend
npm run dev
```

**Expected Output**:
```
╔════════════════════════════════════════════════════════════════╗
║         Formative.AI Backend - Server Started                  ║
║                                                                ║
║  Environment: development                                    ║
║  Port:        3001                                           ║
║  Time:        2025-11-14T05:03:51.781Z                        ║
╚════════════════════════════════════════════════════════════════╝
```

### Terminal 2: Frontend App (Port 3000)

```bash
cd /Users/nick/Development/formative-ai/frontend
npm run dev
```

**Expected Output**:
```
▲ Next.js 14.2.33
- Local: http://localhost:3000
```

### Terminal 3: AI Pipeline (Port 8000)

```bash
cd /Users/nick/Development/formative-ai/ai-pipeline
python -m uvicorn src.main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [...]
```

---

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Landing page & Dashboard |
| **Backend API Root** | http://localhost:3001 | API documentation |
| **Backend Health** | http://localhost:3001/health | Server status |
| **Research Endpoints** | http://localhost:3001/api/v1/research | Research CRUD |
| **AI Pipeline** | http://localhost:8000 | FastAPI server |
| **API Docs** | http://localhost:8000/docs | Swagger UI documentation |

---

## Test the Setup

### Test Backend is Running

```bash
curl http://localhost:3001/

# Expected response:
{
  "name": "Formative.AI Backend API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "research": "/api/v1/research",
    "wireframes": "/api/v1/wireframes",
    "prototypes": "/api/v1/prototypes",
    "prds": "/api/v1/prds",
    "validation": "/api/v1/validation"
  }
}
```

### Test Backend Health

```bash
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-14T05:04:15.230Z",
  "uptime": 23.449,
  "environment": "development"
}
```

### Test Frontend is Running

Open in browser:
```
http://localhost:3000
```

Should show landing page with "Formative.AI" title and feature cards.

### Test AI Pipeline

Open in browser:
```
http://localhost:8000/docs
```

Should show Swagger UI with all available endpoints:
- POST /api/v1/research
- GET /api/v1/research/{id}
- POST /api/v1/wireframes
- etc.

---

## Troubleshooting

### Port Already in Use

If you get `EADDRINUSE` error:

```bash
# Find what's using the port
lsof -i :3001  # or :3000, :8000

# Kill the process
kill -9 <PID>

# Try again
npm run dev
```

Or use the script which handles this automatically:
```bash
./start-dev.sh
```

### Backend won't compile

```bash
cd backend
npm run type-check  # See errors
npm run build       # Try to build
```

### Frontend build issues

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### AI Pipeline won't start

```bash
cd ai-pipeline
python --version  # Should be 3.8+

# Verify import works
python -c "from src.main import app; print('✅ OK')"

# If issues, reinstall
pip install -r requirements.txt --force-reinstall
```

---

## Development Commands

### Backend

```bash
npm run dev           # Development with hot reload
npm run build         # Compile TypeScript
npm run start         # Run compiled version
npm run type-check    # Check TypeScript errors
npm run lint          # Run ESLint
npm test              # Run tests
```

### Frontend

```bash
npm run dev           # Development with hot reload
npm run build         # Production build
npm run start         # Start production server
npm run type-check    # Check TypeScript errors
npm run lint          # Run ESLint
npm test              # Run tests
```

### AI Pipeline

```bash
# Development
python -m uvicorn src.main:app --reload --port 8000

# Production
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000

# Run tests
pytest
pytest -v              # Verbose
pytest --cov=src       # With coverage
```

---

## Next Steps

### Immediate (Today)

1. ✅ Start all services with `./start-dev.sh`
2. ✅ Test all access points above
3. ✅ Verify no errors in any terminal

### Week 1: Database & Auth

1. Initialize PostgreSQL with schema
2. Create user authentication endpoints
3. Implement JWT tokens
4. Create project management

### Week 2: Research Module Phase 1

1. Connect OpenAI API
2. Implement research agent
3. Add Google Search integration
4. Build report templates

### Week 3: Research Module Phase 2

1. Integrate vector database (Pinecone)
2. Implement RAG system
3. Build email validation workflow
4. User testing

---

## Documentation

**Getting Started:**
- **[DEV_ENVIRONMENT_SETUP.md](./DEV_ENVIRONMENT_SETUP.md)** - Detailed setup guide
- **[README.md](./README.md)** - Project overview

**Implementation & Phases:**
- **[PHASE_0_COMPLETION.md](./PHASE_0_COMPLETION.md)** - What was built in Phase 0
- **[DEPLOYABLE_PLAN.md](./DEPLOYABLE_PLAN.md)** - Full project blueprint

**Feature-Specific Guides:**
- **[.claude/WIREFRAME_TESTING_GUIDE.md](./.claude/WIREFRAME_TESTING_GUIDE.md)** - End-to-end wireframe generation testing
- **[.claude/DATABASE_SCHEMA_FIXES.md](./.claude/DATABASE_SCHEMA_FIXES.md)** - Database schema issues and troubleshooting
- **[.claude/PROJECT_CONTEXT.md](./.claude/PROJECT_CONTEXT.md)** - Project rules, configuration, and quick reference

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the service logs in each terminal
3. Verify TypeScript compilation: `npm run type-check`
4. Clear node_modules and reinstall: `npm install`

---

**Ready to develop?** Run:
```bash
./start-dev.sh
```

**Happy coding!** 🚀

# Formative.AI Project Context

---

## 🔴 CRITICAL PRIORITY RULE #0: PORT MANAGEMENT (CHECK THIS FIRST EVERY TIME)

⚠️ **THIS IS THE MOST IMPORTANT RULE - IT SAVES TIME AND TOKENS** ⚠️

### The Problem You Were Facing

You kept getting stuck in port conflicts and token waste because:

1. ❌ Using individual `npm run dev` commands in backend/frontend directories
2. ❌ Not killing all processes properly before restarting
3. ❌ Assuming hardcoded ports (Next.js auto-increments ports dynamically)
4. ❌ Providing incorrect localhost links to user
5. ❌ Forgetting about the unified start-dev.sh script

### The Solution: ONE UNIFIED SCRIPT HANDLES EVERYTHING

**ALWAYS follow this exact procedure:**

```bash
# Step 1: Check what's running
lsof -i :3000,:3001,:8000 2>/dev/null | grep LISTEN

# Step 2: Kill everything if anything is running
killall -9 node npm python3 2>/dev/null && sleep 3

# Step 3: RUN THE UNIFIED SCRIPT (with frontend port locking)
./start-dev.sh

# Step 4: WAIT for output: "All Services Started Successfully! 🚀"
# Step 5: FRONTEND NOW LOCKED TO PORT 3000 (via -p 3000 flag)
lsof -i :3000-3010 2>/dev/null | grep LISTEN | awk '{print $9}' | sort -u
```

### Correct Ports (Fixed - Frontend Always Port 3000)

- **Backend**: ALWAYS `http://localhost:3001` ✅
- **API Base**: ALWAYS `http://localhost:3001/api/v1` ✅
- **Frontend**: ALWAYS `http://localhost:3000` ✅ (Locked with `-p 3000` flag, never auto-increments)
- **Health Check**: `http://localhost:3001/health` ✅

### IMPORTANT: Frontend Port Locking

⚠️ **Frontend is now locked to port 3000 with explicit `-p 3000` flag:**
- `start-dev.sh` clears port 3000 FIRST before starting frontend
- `start-dev.sh` passes explicit `-p 3000` to frontend startup
- `frontend/package.json` updated: `"dev": "next dev -p 3000"`
- If port 3000 still occupied: `lsof -ti :3000 | xargs kill -9` before `./start-dev.sh`

### What the start-dev.sh Script Does (Why It Works)

1. ✅ Kills ALL processes on ports 3000, 3001, 8000 (prevents conflicts)
2. ✅ Starts Backend (Express on 3001) - NEVER changes ports
3. ✅ Starts Frontend (Next.js) - auto-increments if port in use
4. ✅ Starts AI Pipeline (FastAPI on 8000)
5. ✅ Outputs "Access Points" section with ACTUAL running ports

### WRONG APPROACH - DO NOT USE

```bash
❌ cd backend && npm run dev &        # Causes port conflicts
❌ cd frontend && npm run dev &       # Wrong ports, multiple instances
❌ killall node                       # Too broad, might kill other things
❌ Assume frontend is :3002 or :3003  # Next.js changes this dynamically
```

### Real Example of This Working

Script output shows:

```
✓ Frontend:        http://localhost:3000
✓ Backend API:     http://localhost:3001
✓ AI Pipeline:     http://localhost:8000
```

You provide USER exactly these links - DO NOT make up links like 3002 or 3003!

---

## ⚠️ MANDATORY RULES (MUST FOLLOW EVERY TIME)

### Rule 1: Prompt Refinement Layer

**READ THIS FIRST** - Claude MUST follow this for EVERY user prompt:

1. **STOP** - Do NOT start coding immediately
2. **Reference Context** from this file (Known Issues, Critical Configuration, Key Files)
3. **Apply Template** from `.claude/PROMPT_TEMPLATES.md` (Bug→T1, Feature→T2, Test→T3, etc.)
4. **Show Structured Prompt** with template fields, context references, affected files
5. **Ask for Confirmation** - "Is this correct? Should I edit this further?"
6. **Wait for Approval** - Only proceed after user confirms

**This prevents hallucination, saves tokens, and catches misunderstandings before work starts.**

### Rule 2: Server Restart After Code Changes ⭐ NEW

**AFTER ANY CODE CHANGE/BUG FIX - Claude MUST:**

See **Rule #0 (PORT MANAGEMENT)** above for detailed port startup procedure. In brief:

1. **ALWAYS use the unified startup script:**

   ```bash
   ./start-dev.sh  # This is all you need!
   ```

2. **Script automatically handles:**
   - Killing all processes on ports 3000, 3001, 8000
   - Starting backend (Express on 3001)
   - Starting frontend (Next.js auto-increments if needed)
   - Starting AI Pipeline (FastAPI on 8000)

3. **Wait for:** "All Services Started Successfully! 🚀"

4. **Detect actual ports from script output or verify with:**

   ```bash
   lsof -i :3000-3010 2>/dev/null | grep LISTEN | awk '{print $9}' | sort -u
   ```

5. **Provide localhost links based on ACTUAL output:**
   - Backend: `http://localhost:3001` (ALWAYS)
   - API Base: `http://localhost:3001/api/v1` (ALWAYS)
   - Frontend: `http://localhost:[PORT]` (GET PORT FROM SCRIPT OUTPUT)
   - Health: `http://localhost:3001/health` (ALWAYS)

**Reference:** See Rule #0 PORT MANAGEMENT section above for troubleshooting.

### Rule 3: Documentation Consolidation ⭐ NEW

**BEFORE creating a new .md file - Claude MUST:**

1. **Check existing docs** - Does a file covering this topic already exist?
2. **Single Source of Truth** - One file per topic, NOT duplicate files
3. **Consolidate, don't create** - Modify existing files instead of creating new ones
4. **Concise content** - Keep under 500 lines, make it scannable
   - Use headers, bullet points, tables
   - Front-load critical info
   - Remove verbose explanations
5. **Follow structure** - Root = overview/setup, .claude/ = operational guides

**File Location Rules:**
- Root-level (.md): Architecture, features, setup, status, deployment
- .claude/ (.md): Rules, templates, testing, troubleshooting, development workflow

**Exception:** Only create new file if genuinely new content category (not covered by existing files)

**Reference:** See [.claude/DOCUMENTATION_PLANNING.md](./DOCUMENTATION_PLANNING.md) for full documentation guidelines

### Rule 4: Script Duplication Prevention ⭐ NEW

**BEFORE creating a new shell script - Claude MUST:**

1. **Check script purposes** - Do we already have a script that does this?
   - `setup.sh` = ONE-TIME initial project setup (install dependencies)
   - `start-dev.sh` = EVERY SESSION service startup (kill ports, start services)
   - `test-ui.sh` = TESTING HELPER (show UI testing instructions)
   - `test-api.sh` = TESTING HELPER (load env, show API testing commands)
   - `build.sh` = PRODUCTION BUILD (compile for deployment)

2. **Single Script, Single Purpose:**
   - Don't create `restart-dev.sh` if `start-dev.sh` exists
   - Don't create `dev-setup.sh` if `setup.sh` exists
   - Modify existing scripts instead of creating duplicates

3. **Script Clarity:**
   - `setup.sh` runs ONCE at project start (dependency installation)
   - `start-dev.sh` runs EVERY time you code (service restart)
   - If a script's purpose overlaps with existing scripts, enhance the existing one

4. **Documentation:**
   - Every new script MUST be documented in `/scripts/README.md`
   - Every new script MUST be added to `.claude/commands/COMMON_COMMANDS.md`
   - Link from appropriate .md docs (TESTING_GUIDE.md, QUICK_START.md, etc.)

**Exception:** Only create new script if genuinely new purpose (e.g., database migration, deployment to production)

**Reference:** See [.claude/DOCUMENTATION_PLANNING.md](./DOCUMENTATION_PLANNING.md) lines 136-167 for scripts organization rules

---

## Quick Reference

**Frontend:** http://localhost:3000 (Locked - never auto-increments)
**Backend:** http://localhost:3001 (Express on port 3001)
**API Base:** http://localhost:3001/api/v1

## Critical Configuration

### Backend CORS (app.ts:39-64)
- **Issue 1 Fixed:** Custom origin callback was throwing Error, returning 500 → HTTP 204
  - **Solution:** Changed `callback(new Error(...))` to `callback(null, false)` (line 58)
- **Issue 2 Fixed:** Ports 3003+ now supported for frontend dev (was hardcoded to 3000-3002)
  - **Solution:** Added dev-mode wildcard (lines 50-52): `if (NODE_ENV === 'development' && origin.startsWith('http://localhost:'))`
- **Never revert** these fixes or add back Error throwing
- **Production Mode:** Remove localhost wildcard, use explicit origin list instead

### Frontend API Configuration (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Database
- Uses Prisma ORM
- SQLite database (development)
- Models in prisma/schema.prisma

## Project Structure

```
/backend
  /src
    /services (business logic)
      - researchService.ts (guarantees all fields with defaults)
    /routes (API endpoints)
    /middleware (errorHandler, logging)
    app.ts (CORS config critical here)

/frontend
  /pages (route components)
    - research.tsx (has polling with error handling)
  /lib/api (API clients)
    - authApi.ts
    - researchApi.ts
  .env.local (must have NEXT_PUBLIC_API_URL)
```

## Known Issues & Fixes Applied

### 1. "missing required error components" Error
- **Root Cause:** Backend returning undefined for optional fields (swot, keyInsights, recommendations, executiveSummary, marketAnalysis)
- **Fixed In:** researchService.ts sessionToResult() - added defaults for all fields
- **Status:** ✅ FIXED

### 2. "Failed to fetch" on Login
- **Root Cause:** CORS middleware throwing Error on preflight request → HTTP 500 → browser blocks fetch
- **Fixed In:** app.ts:53 - changed Error throw to callback(null, false)
- **Status:** ✅ FIXED

### 3. Research Polling Errors
- **Root Cause:** Unhandled errors in polling would crash component
- **Fixed In:** research.tsx:41-52 - added try-catch with proper error state
- **Status:** ✅ FIXED

### 4. Wireframe Database Schema Issues
- **Root Cause:** New columns (`suggested_components`, `design_suggestions`) added to model but not to database
- **Fixed In:**
  - `backend/src/config/initializeDatabase.ts` - Automatic schema initialization
  - `backend/src/app.ts` - Calls initialization on startup
  - `backend/src/models/WireframeArtifact.ts` - Fixed constructor parameter order bug
  - `backend/src/routes/wireframes.ts` - Updated API responses
- **Status:** ✅ FIXED
- **See Also:** [DATABASE_SCHEMA_FIXES.md](./DATABASE_SCHEMA_FIXES.md) - Complete troubleshooting guide

## Important Rules

1. **Always check CORS config** when there's "Failed to fetch" - it's usually CORS
2. **Always provide defaults** in service layer for optional fields
3. **Always add error handling** in polling/async operations
4. **Never throw Error() in CORS callbacks** - use callback(null, false) instead
5. **Always use optional chaining** in React components: `result?.field || defaultValue`

## Prompt Refinement Layer (MANDATORY)

**For EVERY user prompt (bug fix, feature, test, refactoring, etc.):**

1. **STOP and Restructure** - Do NOT start coding immediately
2. **Reference Context** - Check PROJECT_CONTEXT.md for:
   - Related Known Issues & Fixes
   - Critical Configuration sections
   - Key Files to Modify
   - Documentation Reference by Category
3. **Apply Template** - Reformat prompt using template from `.claude/PROMPT_TEMPLATES.md`:
   - Bug fixes → Use Template 1
   - Features → Use Template 2
   - Tests → Use Template 3
   - Flow testing → Use Template 4
   - Quick tasks → Use Template 5
   - Refactoring → Use Template 6
4. **Show Structured Prompt** - Display refined prompt to user with:
   - Template type and fields filled in
   - Context references from PROJECT_CONTEXT.md
   - Affected files identified
   - Related documentation links
5. **Ask for Confirmation** - "Is this correct? Should I edit this further?"
6. **Wait for Approval** - Only proceed after user confirms

**Why this matters:**
- Prevents hallucination from missing context
- Ensures consistent, clear communication
- Saves tokens by clarifying requirements upfront
- Catches misunderstandings before work starts

## Commands to Remember

**See [.claude/commands/COMMON_COMMANDS.md](./commands/COMMON_COMMANDS.md) for complete command reference organized by task type.**

Quick commands:

```bash
# Start all services (RECOMMENDED - use this!)
./scripts/start-dev.sh  # OR ./start-dev.sh (symlink)

# Run setup (one-time)
./scripts/setup.sh

# UI Testing
./scripts/test-ui.sh

# API Testing
./scripts/test-api.sh

# Build for production
./scripts/build.sh

# Emergency: Kill all processes
killall -9 node npm python3 2>/dev/null; sleep 2

# Check running processes
ps aux | grep -E "node|npm" | grep -v grep | wc -l

# Check port availability
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :8000  # AI Pipeline
```

**For complete command reference:** See [.claude/commands/COMMON_COMMANDS.md](./commands/COMMON_COMMANDS.md)

## Key Files to Modify

| File | What | When |
|------|------|------|
| backend/src/app.ts | CORS, middleware, routes | On "Failed to fetch" errors |
| backend/src/services/*.ts | Business logic, defaults | On data structure issues |
| frontend/pages/*.tsx | UI, polling, error handling | On rendering or async errors |
| frontend/lib/api/*.ts | API clients, request format | On API call issues |
| prisma/schema.prisma | Database models | On data model changes |

## Troubleshooting Checklist

- [ ] Are there multiple Node processes? Kill all: `killall -9 node npm`
- [ ] Is CORS returning 500? Check app.ts:53 - should be `callback(null, false)`
- [ ] Is research data undefined? Check researchService.ts - all fields need defaults
- [ ] Is polling crashing? Check research.tsx:41-52 - needs try-catch
- [ ] Did you change .env? Restart frontend: `npm run dev`
- [ ] Is frontend showing old code? Hard refresh browser: Cmd+Shift+R (Mac)

## Documentation Reference by Category

### 🚀 Getting Started & Setup

**Use these when:** Starting development, setting up new machine, configuring API keys, or understanding project structure

| File | Purpose |
|------|---------|
| [README.md](README.md) | Main project documentation, overview, architecture |
| [QUICK_START.md](QUICK_START.md) | Quick start guide for running the project |
| [DEV_ENVIRONMENT_SETUP.md](DEV_ENVIRONMENT_SETUP.md) | Complete dev environment setup instructions |
| [API_KEYS_SETUP.md](API_KEYS_SETUP.md) | How to configure API keys (Claude, other services) |
| [MOCK_DATABASE_SETUP.md](MOCK_DATABASE_SETUP.md) | Mock database setup for testing |

### 📊 Current Status & Progress

**Use these when:** Understanding what's been built, checking implementation progress, reviewing current state

| File | Purpose |
|------|---------|
| [MVP_QUICK_STATUS.md](MVP_QUICK_STATUS.md) | Quick MVP status overview |
| [MVP_STATUS_ANALYSIS.md](MVP_STATUS_ANALYSIS.md) | Detailed MVP analysis and breakdown |
| [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) | Feature-by-feature implementation status |
| [FRONTEND_BUILD_SUMMARY.md](FRONTEND_BUILD_SUMMARY.md) | Frontend build details and status |
| [CHAT_HISTORY.md](CHAT_HISTORY.md) | Historical chat logs and decisions |

### 📋 Phase Documentation

**Use these when:** Understanding development phases, what was completed in each phase, phase requirements

| File | Purpose |
|------|---------|
| [PHASE_0_COMPLETION.md](PHASE_0_COMPLETION.md) | Phase 0 completion checklist and summary |
| [PHASE_1_IMPLEMENTATION.md](PHASE_1_IMPLEMENTATION.md) | Phase 1 implementation details and progress |
| [PHASE_2_RESEARCH_MODULE.md](PHASE_2_RESEARCH_MODULE.md) | Phase 2 research module implementation |
| [PHASE_2_SUMMARY.md](PHASE_2_SUMMARY.md) | Phase 2 summary and completion status |

### 🧪 Testing & Quality Assurance

**Use these when:** Running tests, testing features, understanding test coverage, testing deployment

| File | Purpose |
|------|---------|
| [QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md) | Quick manual testing guide |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Comprehensive testing guide and best practices |
| [DEPLOYABLE_PLAN.md](DEPLOYABLE_PLAN.md) | Deployment strategy and checklist |
| [WIREFRAME_TESTING_GUIDE.md](.claude/WIREFRAME_TESTING_GUIDE.md) | End-to-end wireframe generation testing |
| [DATABASE_SCHEMA_FIXES.md](.claude/DATABASE_SCHEMA_FIXES.md) | Database schema issues and solutions |

### 🤖 Claude Code Tools

**Use these when:** Working with Claude Code, setting up Claude integration, understanding how to work with this AI

| File | Purpose |
|------|---------|
| [.claude/PROJECT_CONTEXT.md](.claude/PROJECT_CONTEXT.md) | **You are here** - Main context for Claude Code |
| [.claude/HOW_TO_USE_CLAUDE_CODE.md](.claude/HOW_TO_USE_CLAUDE_CODE.md) | How to effectively use Claude Code with this project |
| [.claude/commands/project-context.md](.claude/commands/project-context.md) | Slash command reference for Claude |

### 🔐 Authentication & Testing

**Use these when:** Testing features, making API requests, debugging auth issues

| File | Purpose |
|------|---------|
| [.claude/TEST_USERS.md](.claude/TEST_USERS.md) | Test user credentials and JWT tokens |
| [.claude/WIREFRAME_TESTING_GUIDE.md](.claude/WIREFRAME_TESTING_GUIDE.md) | End-to-end testing with authentication |
| [.claude/DATABASE_SCHEMA_FIXES.md](.claude/DATABASE_SCHEMA_FIXES.md) | Database troubleshooting |

## How to Use This Reference

### Example 1: "I'm getting a CORS error"

1. Check the "Troubleshooting Checklist" above
2. Reference [.claude/PROJECT_CONTEXT.md](.claude/PROJECT_CONTEXT.md) Critical Configuration section
3. Look at app.ts:39-64 in the code

### Example 2: "I need to add a new API endpoint"

1. Read [README.md](README.md) for architecture
2. Check [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for similar endpoints
3. Review backend/src/app.ts for routing pattern

### Example 3: "I want to understand the research flow"

1. Start with [PHASE_2_RESEARCH_MODULE.md](PHASE_2_RESEARCH_MODULE.md)
2. Check [PHASE_2_SUMMARY.md](PHASE_2_SUMMARY.md) for completion status
3. Review [TESTING_GUIDE.md](TESTING_GUIDE.md) for test cases

### Example 4: "I'm starting fresh on this project"

1. Read [README.md](README.md) first
2. Follow [QUICK_START.md](QUICK_START.md)
3. Reference [DEV_ENVIRONMENT_SETUP.md](DEV_ENVIRONMENT_SETUP.md) for detailed setup
4. Check [API_KEYS_SETUP.md](API_KEYS_SETUP.md) for API configuration
5. Keep [.claude/HOW_TO_USE_CLAUDE_CODE.md](.claude/HOW_TO_USE_CLAUDE_CODE.md) open while working

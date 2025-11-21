# 🔧 Common Commands Reference

**Purpose:** Organized command reference by usage type
**Last Updated:** November 20, 2025
**Location:** `.claude/commands/`

All commands are organized by task type for quick lookup.

---

## ⚙️ Setup & Initialization

### Initial Project Setup
```bash
./scripts/setup.sh
```
- One-time setup: install dependencies for backend and frontend

### Create /scripts folder (Already done)
```bash
mkdir -p scripts
```

### Make scripts executable
```bash
chmod +x scripts/*.sh
```

---

## 🚀 Development & Services

### Start All Services
```bash
./scripts/start-dev.sh
# OR (symlink from root)
./start-dev.sh
```
- Starts: Backend (3001), Frontend (3000+), AI Pipeline (8000)
- Auto-clears existing processes on those ports
- Logs to: /tmp/start-dev.log

### Start Individual Services

**Backend (Express + TypeScript)**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Frontend (Next.js)**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000 (or 3002+ if port in use)
```

**AI Pipeline (Python FastAPI)**
```bash
cd ai-pipeline
python -m uvicorn src.main:app --reload --port 8000
# Runs on http://localhost:8000
```

---

## 🧪 Testing

### UI Testing (Browser)
```bash
./scripts/test-ui.sh
```
- Starts services
- Provides test user credentials
- Links to testing guide

**Manual UI Testing:**
```bash
# 1. Open browser
open http://localhost:3000  # or 3002, 3003, etc

# 2. Sign in with
Email: testuser@example.com
Password: TestPassword123

# 3. Create research & generate wireframes
```

### API Testing (cURL)
```bash
./scripts/test-api.sh
```
- Loads test user environment
- Shows example curl commands

**Load Test Variables:**
```bash
source /tmp/test-user-setup.sh
echo $TOKEN              # JWT token
echo $API_BASE           # http://localhost:3001/api/v1
echo $FRONTEND_URL       # http://localhost:3000
```

**Test Backend Health:**
```bash
curl http://localhost:3001/health
```

**List Research:**
```bash
curl -H "Authorization: Bearer $TOKEN" $API_BASE/research
```

**Create Research:**
```bash
curl -X POST $API_BASE/research \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Weather App",
    "targetAudience": "Mobile Users",
    "geographicFocus": "Global",
    "competitors": ["WeatherApp", "AccuWeather"]
  }'
```

**Generate Wireframes:**
```bash
curl -X POST $API_BASE/wireframes/generate-from-research \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "researchId": "<research-id>",
    "projectId": null,
    "useAI": true,
    "refinementMode": "quality"
  }'
```

---

## 🏗️ Building & Deployment

### Build for Production
```bash
./scripts/build.sh
```
- Builds backend (TypeScript compilation)
- Builds frontend (Next.js production build)
- Output: `backend/dist`, `frontend/.next`

### Build Backend Only
```bash
cd backend
npm run build
# Output: backend/dist
```

### Build Frontend Only
```bash
cd frontend
npm run build
# Output: frontend/.next
```

### Check Build Output
```bash
# Backend
ls -la backend/dist

# Frontend
ls -la frontend/.next
```

---

## 🐛 Debugging & Troubleshooting

### Check Running Processes
```bash
# All Node processes
ps aux | grep -E "node|npm" | grep -v grep

# Specific port
lsof -i :3001     # Backend
lsof -i :3000     # Frontend
lsof -i :8000     # AI Pipeline
```

### Detect Actual Running Service Ports
```bash
# Check which ports are ACTUALLY running (useful when ports auto-increment)
lsof -i :3000-3010 2>/dev/null | grep LISTEN | awk '{print $9}' | sort -u

# Or get a formatted list
lsof -i :3000-3010 2>/dev/null | grep LISTEN | awk '{printf "Port %s: %s\n", $9, $1}'
```
**Use this instead of assuming hardcoded ports!** Next.js may auto-increment to 3003, 3005, etc. if ports are in use.

### Kill All Processes
```bash
killall -9 node npm python3
```

### Kill Specific Port
```bash
# Find PID on port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

### View Logs

**Backend/Start Script Logs:**
```bash
tail -50 /tmp/start-dev.log
tail -f /tmp/start-dev.log   # Real-time
```

**Backend Logs (when running separately):**
```bash
cd backend
npm run dev 2>&1 | tee /tmp/backend.log
```

**Frontend Compilation:**
Check terminal running `npm run dev` in frontend folder

### Check Port Status
```bash
# All listening ports
lsof -i -P -n | grep LISTEN

# Specific ports
netstat -an | grep LISTEN | grep -E ":3000|:3001|:8000"
```

### Clear Node Modules Cache
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔑 Authentication & Tokens

### Load Test User Environment
```bash
source /tmp/test-user-setup.sh
```
Sets: `$TOKEN`, `$API_BASE`, `$FRONTEND_URL`, `$TEST_EMAIL`, `$TEST_PASSWORD`

### Generate Fresh JWT Token
```bash
cd backend
node -e "
const jwt = require('jsonwebtoken');
const secret = 'your-secret-key-change-in-production';
const token = jwt.sign(
  {
    userId: '50b91961-db91-4bf3-9baa-1ed9fe66c0d7',
    email: 'testuser@example.com',
    role: 'user'
  },
  secret,
  { expiresIn: '24h' }
);
console.log(token);
"
```

### Verify Token
```bash
# Check if valid
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/auth/me
```

---

## 📊 Database Commands

### Connect to PostgreSQL
```bash
PGPASSWORD="formative_password" psql \
  -h localhost \
  -U formative_user \
  -d formative_ai
```

### Initialize Database
```bash
# Automatic (runs on backend startup)
# Or manual:
cd backend
npm run dev
# Calls initializeDatabase.ts on startup
```

### Check Database Connection
```bash
PGPASSWORD="formative_password" psql \
  -h localhost \
  -U formative_user \
  -d formative_ai \
  -c "SELECT 1"
```

### View Tables
```bash
PGPASSWORD="formative_password" psql \
  -h localhost \
  -U formative_user \
  -d formative_ai \
  -c "\dt"
```

---

## 🔍 Code Quality & Type Checking

### Type Check Backend
```bash
cd backend
npm run type-check
```

### Type Check Frontend
```bash
cd frontend
npm run type-check
```

### Lint Code
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

---

## 🌐 Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://user:pass@localhost/db"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
PORT="3001"
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

### Check .env Files
```bash
# Backend
cat backend/.env

# Frontend
cat frontend/.env.local
```

---

## 📝 Script Documentation

### View Script Contents
```bash
cat scripts/start-dev.sh
cat scripts/test-ui.sh
cat scripts/test-api.sh
```

### Available Scripts
- `scripts/start-dev.sh` - Start all services
- `scripts/test-ui.sh` - UI testing guide
- `scripts/test-api.sh` - API testing guide
- `scripts/build.sh` - Production build
- `scripts/setup.sh` - Initial setup

See `scripts/README.md` for detailed information.

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [scripts/README.md](../../scripts/README.md) | Script overview and usage |
| [.claude/TESTING_GUIDE.md](../TESTING_GUIDE.md) | Complete testing procedures |
| [.claude/PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Project rules and config |
| [.claude/DOCUMENTATION_PLANNING.md](../DOCUMENTATION_PLANNING.md) | Documentation guidelines |

---

## 💡 Pro Tips

1. **Use symlink for start-dev.sh:** `./start-dev.sh` from root (symlinks to `scripts/start-dev.sh`)
2. **Real-time logs:** Use `tail -f` to watch logs as they appear
3. **Quick reset:** `killall -9 node npm python3` then `./scripts/start-dev.sh`
4. **Save commands:** Create shell aliases for frequently used commands
5. **Check before running:** Always verify port availability before starting services

---

**Last Updated:** November 20, 2025
**Location:** `.claude/commands/COMMON_COMMANDS.md`
**Maintained by:** Development team


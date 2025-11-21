# Testing Guide - Complete Reference

**Purpose:** All testing procedures (UI, API, E2E, wireframes, startup) in one concise guide
**Last Updated:** November 20, 2025
**Status:** ✅ Ready to use

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Start all services
./scripts/start-dev.sh  # OR ./start-dev.sh (symlink works too)
# Wait for: "All Services Started Successfully! 🚀"

# 2. Open browser
open http://localhost:3000  # or check startup output for actual port

# 3. Sign in with test user
Email: testuser@example.com
Password: TestPassword123

# 4. Test wireframe generation
- Click "New Research"
- Fill form and click "Start Research"
- Wait for completion (polling)
- Click "Generate Wireframes"
```

---

## 📋 Prerequisites & Setup

### Start All Services (Required Every Session)

**Location:** `/Users/nick/Development/formative-ai`

```bash
cd /Users/nick/Development/formative-ai
./scripts/start-dev.sh  # OR ./start-dev.sh (symlink)
```

**Expected Output:**
```
✅ Ports cleared
✅ Backend started (PID: ...)
✅ Frontend started (PID: ...)
✅ AI Pipeline started (PID: ...)

Access Points:
  Frontend:        http://localhost:3000
  Backend API:     http://localhost:3001
  API Health:      http://localhost:3001/health
  AI Pipeline:     http://localhost:8000
```

**⏱️ Time:** ~10-15 seconds

**Note:** Frontend may use 3002, 3003, etc if port 3000 is in use (auto-increment)

### Troubleshooting Startup

| Issue | Solution |
|-------|----------|
| "Address already in use" | `killall -9 node npm python3` then `./start-dev.sh` |
| Script won't run | `chmod +x /Users/nick/Development/formative-ai/start-dev.sh` |
| Backend won't start | Check PostgreSQL running: `PGPASSWORD="formative_password" psql -h localhost -U formative_user -d formative_ai -c "SELECT 1"` |
| Port conflicts | See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) Critical Configuration section |

---

## 📱 UI Testing

### Login

**URL:** `http://localhost:3000` (or the port shown in startup output)

**Test User:**
- Email: `testuser@example.com`
- Password: `TestPassword123`

**Steps:**
1. Open URL
2. Enter email and password
3. Click "Sign In"
4. ✅ Should redirect to `/research` page

### Create Research

1. Click "New Research" button
2. Fill form:
   - **Topic:** "Weather App" (or any topic)
   - **Target Audience:** "Mobile Users"
   - **Geographic Focus:** "Global"
   - **Competitors:** "WeatherApp, AccuWeather"
3. Click "Start Research"
4. ✅ Status shows "generating..."
5. Wait 30-60 seconds for auto-poll to complete
6. ✅ Status changes to "completed"

### Generate & Test Wireframes

1. After research is complete, click "🎨 Generate Wireframes"
2. ✅ Toast: "Wireframes generated!"
3. ✅ Auto-redirected to wireframe preview page
4. **Verify display:**
   - [ ] SVG preview shows wireframe
   - [ ] Left sidebar lists "Screen 1", "Screen 2", etc
   - [ ] Clicking screens updates preview
   - [ ] Right panel shows 3-5 suggested components
   - [ ] Each component has: name, category, description, tags, usage
   - [ ] Design suggestions listed

### Test Actions

| Action | Expected Result |
|--------|-----------------|
| Click "View Research" | Navigate back to research page |
| Click "Download SVG" | SVG file downloads to Downloads folder |
| Click screen in sidebar | Preview updates to show that screen |

### Verify Data Completeness

Each component should have:
- ✅ `id` - unique identifier
- ✅ `name` - component name (e.g., "Icon Badge")
- ✅ `category` - type (button, form, media, navigation)
- ✅ `description` - what it does
- ✅ `tags` - array of tags
- ✅ `usage` - when to use it
- ✅ `designTokens` - colors, spacing, typography
- ✅ `relatedComponents` - connected components

---

## 🔌 API Testing

### Load Test User Variables

```bash
source /tmp/test-user-setup.sh
echo $TOKEN              # JWT token
echo $API_BASE           # http://localhost:3001/api/v1
echo $FRONTEND_URL       # http://localhost:3000
```

### Test Backend Health

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{"status":"healthy","timestamp":"2025-11-20T...","uptime":...}
```

### List Research

```bash
curl -H "Authorization: Bearer $TOKEN" $API_BASE/research
```

### Create Research

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

**Expected:** Returns `id` of created research

### Poll for Completion

```bash
RESEARCH_ID="<id-from-above>"
curl -H "Authorization: Bearer $TOKEN" $API_BASE/research/$RESEARCH_ID
```

**Look for:** `"status": "completed"`

### Generate Wireframes (API)

```bash
curl -X POST $API_BASE/wireframes/generate-from-research \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "researchId": "'$RESEARCH_ID'",
    "projectId": null,
    "useAI": true,
    "refinementMode": "quality"
  }'
```

**Expected Response:** Contains:
- `id` - wireframe ID
- `screenCount` - number of screens (should be 6+)
- `suggestedComponents` - array of components
- `designSuggestions` - array of design tips

### Fetch Wireframe Details

```bash
WIREFRAME_ID="<id-from-above>"
curl -H "Authorization: Bearer $TOKEN" $API_BASE/wireframes/$WIREFRAME_ID
```

---

## 🧪 Full End-to-End Test

**Total Time:** 10-15 minutes

### Step 1: Setup (2 min)
- [ ] Run `./start-dev.sh`
- [ ] Wait for all services
- [ ] Open browser to frontend URL

### Step 2: Authentication (1 min)
- [ ] Sign in with testuser@example.com / TestPassword123
- [ ] Verify dashboard/research page loads

### Step 3: Create Research (5 min)
- [ ] Click "New Research"
- [ ] Fill form (Topic, Audience, Geographic Focus, Competitors)
- [ ] Click "Start Research"
- [ ] Wait for auto-poll to complete (~30-60 sec)

### Step 4: Generate Wireframes (2 min)
- [ ] Click "Generate Wireframes" button
- [ ] Wait for toast notification
- [ ] Verify redirect to wireframe preview page

### Step 5: Verify Wireframe Quality (3 min)
- [ ] Check SVG renders correctly
- [ ] Navigate between screens (left sidebar)
- [ ] Verify components display with full metadata
- [ ] Verify design suggestions display
- [ ] Test "Download SVG" button
- [ ] Test "View Research" button

### Step 6: Validate Data Persistence (1 min)
- [ ] Fetch same wireframe via API: `curl -H "Authorization: Bearer $TOKEN" $API_BASE/wireframes/<id>`
- [ ] Verify all fields present in response
- [ ] Check component data persisted to database

---

## 🐛 Troubleshooting

### "Failed to fetch" on login/API calls

**Cause:** CORS error or backend not responding

**Solution:**
```bash
# Check backend health
curl http://localhost:3001/health

# If fails, backend not running. Check output of ./start-dev.sh
# Restart: killall -9 node npm && ./start-dev.sh
```

### "Research not found" error

**Cause:** Research ID doesn't exist or was created in different session

**Solution:**
1. Create new research first
2. Wait for completion
3. Then generate wireframes

### "Wireframes generated!" toast but no preview page

**Cause:** Wireframe viewer component missing or API error

**Solution:**
1. Check browser console (F12) for errors
2. Fetch wireframe via API to see actual data
3. Verify `frontend/pages/wireframes/[id].tsx` exists

### Components showing empty array

**Cause:** Component recommendation not running or database not initialized

**Solution:**
1. Check backend logs for errors
2. Verify database initialized: `./start-dev.sh` should run `initializeDatabase.ts`
3. Check backend console for "Recommended" components message

### Token invalid error

**Cause:** Token expired (24-hour expiry) or jwt_secret changed

**Solution:**
1. Generate new token: See [TEST_USERS.md](./TEST_USERS.md#-how-to-generate-a-fresh-token)
2. Update `/tmp/test-user-setup.sh` with new token
3. Re-run: `source /tmp/test-user-setup.sh`

### Port conflicts

**Cause:** Previous session left processes running

**Solution:**
```bash
killall -9 node npm python3 2>/dev/null
sleep 2
./start-dev.sh
```

---

## 📊 Sample Test Data

| Topic | Expected Components | Complexity |
|-------|-------------------|-----------|
| Weather App | Cards, Lists, Forms, Navigation | Low |
| E-commerce Site | Product Cards, Filters, Cart, Checkout | Medium |
| SaaS Dashboard | Tables, Charts, Forms, Sidebar | High |
| Social Network | Feed, Comments, Profiles, Messaging | High |

---

## ✅ Quick Checklist

### Before Each Testing Session
- [ ] Run `./start-dev.sh`
- [ ] Wait for startup completion
- [ ] Load test user: `source /tmp/test-user-setup.sh`
- [ ] Open http://localhost:3000 in browser
- [ ] Verify no console errors (F12)

### During UI Testing
- [ ] Services running (check ports)
- [ ] Test user can log in
- [ ] Research creates successfully
- [ ] Wireframes generate without errors
- [ ] All metadata displays correctly

### During API Testing
- [ ] Token available and valid
- [ ] Health endpoint responds
- [ ] Research endpoints working
- [ ] Wireframe endpoints working
- [ ] All responses contain expected fields

### After Testing
- [ ] Stop services: `Ctrl+C` or `killall -9 node npm python3`
- [ ] Save any test results/notes
- [ ] Report any failures to PROJECT_CONTEXT.md Known Issues

---

## 🔄 Test User Management

### Primary Test User
- Email: `testuser@example.com`
- Password: `TestPassword123`
- User ID: `50b91961-db91-4bf3-9baa-1ed9fe66c0d7`
- Token valid for: 24 hours
- **Can be reused indefinitely** (same user across all sessions)

### Load Test Credentials
```bash
source /tmp/test-user-setup.sh
# Now available: $TOKEN, $API_BASE, $FRONTEND_URL, etc
```

### Generate Fresh Token (When Expired)

See [TEST_USERS.md](./TEST_USERS.md#-how-to-generate-a-fresh-token)

---

## 💡 Pro Tips

1. **Keep ./start-dev.sh running** - Don't close the terminal while testing
2. **Check startup output** - It shows actual ports in use (may be 3002, 3003, etc)
3. **Use same test user** - testuser@example.com works for unlimited sessions
4. **Browser console (F12)** - Check for errors if anything breaks
5. **Hard refresh (Cmd+Shift+R)** - Clear cache if seeing old code
6. **Check logs** - `tail -f /tmp/start-dev.log` for detailed output
7. **One test at a time** - Run UI tests OR API tests, not both simultaneously

---

## 🔗 Related Documentation

| Task | Document |
|------|----------|
| Test user credentials | [TEST_USERS.md](./TEST_USERS.md) |
| Database troubleshooting | [DATABASE_SCHEMA_FIXES.md](./DATABASE_SCHEMA_FIXES.md) |
| Project rules & config | [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) |
| How to structure requests | [PROMPT_TEMPLATES.md](./PROMPT_TEMPLATES.md) |

---

**Last Tested:** November 20, 2025 ✅
**Test User:** testuser@example.com (active and verified)
**Services Status:** All passing
**Next Update:** When testing procedures change


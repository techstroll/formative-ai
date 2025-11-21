# Port Management Checklist - MUST READ BEFORE EVERY SESSION

⚠️ **THIS IS THE SINGLE MOST IMPORTANT FILE - READ THIS FIRST**

## The Automated Solution (Why We Keep Making The Same Mistake)

The user discovered that I kept:
- Using individual `npm run dev` commands instead of unified script
- Causing port conflicts from lingering processes
- Providing incorrect localhost links
- Wasting tokens on repeated restarts

**Root cause:** I kept forgetting to use the `.claude/settings.json` rules and `./start-dev.sh` script.

---

## 🔴 BEFORE ANY CODING WORK - APPLY THIS CHECKLIST

### Step 1: Apply Prompt Refinement Layer (2 minutes)

Before touching ANY code:

- [ ] Read `.claude/settings.json` CRITICAL_PRIORITY_RULES section
- [ ] Read `.claude/PROJECT_CONTEXT.md` Rule #0: PORT MANAGEMENT section
- [ ] Check if your task involves server startup
  - If YES → Follow port management procedure below
  - If NO → Proceed with task

### Step 2: If Restarting Services - ONLY Use This Script

```bash
# Check what's running
lsof -i :3000,:3001,:8000 2>/dev/null | grep LISTEN

# Kill ALL processes
killall -9 node npm python3 2>/dev/null && sleep 3

# Run the ONLY script you need
./start-dev.sh

# Wait for: "✅ All Services Started Successfully! 🚀"

# Detect actual ports
lsof -i :3000-3010 2>/dev/null | grep LISTEN | awk '{print $9}' | sort -u
```

### Step 3: Provide Correct Links to User

Based on script output:

```
✅ ALWAYS correct (never changes):
- Backend:  http://localhost:3001
- API Base: http://localhost:3001/api/v1
- Health:   http://localhost:3001/health

✅ CHECK SCRIPT OUTPUT for frontend port:
- Frontend: http://localhost:[PORT]
  (May be 3000, 3003, 3005+, etc.)
```

---

## ❌ DO NOT DO THIS (The Things That Caused The Problem)

```bash
# ❌ WRONG - Causes port conflicts
cd backend && npm run dev &
cd frontend && npm run dev &

# ❌ WRONG - Incomplete cleanup
killall node
ps aux | grep npm | kill

# ❌ WRONG - Hardcoded wrong ports
Frontend is at http://localhost:3002 or 3003

# ❌ WRONG - Assuming ports without verifying
The script says 3000 is available
```

---

## ✅ What The start-dev.sh Script Does (Why It Works)

Unified script = ONE command that:

1. ✅ Kills ALL processes on 3000, 3001, 8000
2. ✅ Starts backend (Express on 3001) - NEVER changes
3. ✅ Starts frontend (Next.js) - auto-increments if needed
4. ✅ Starts AI pipeline (FastAPI on 8000)
5. ✅ Shows ACTUAL running ports in colored output
6. ✅ No guessing, no lingering processes, no manual steps

---

## 🎯 Quick Reference Commands

```bash
# Only script you need
./start-dev.sh

# Check ports are correct
lsof -i :3000-3010 2>/dev/null | grep LISTEN | awk '{print $9}' | sort -u

# Emergency kill all
killall -9 node npm python3

# Show what's running
ps aux | grep -E "node|npm|python"
```

---

## 📋 Self-Check Before Providing Links to User

Ask yourself:

- [ ] Did I use `./start-dev.sh` (not individual npm commands)?
- [ ] Did I wait for "All Services Started Successfully!"?
- [ ] Did I check actual ports with `lsof` command?
- [ ] Did I get frontend port FROM SCRIPT OUTPUT (not assumed)?
- [ ] Am I providing links based on ACTUAL output (not guessed)?
- [ ] Is backend link exactly `http://localhost:3001`?
- [ ] Is API base exactly `http://localhost:3001/api/v1`?

If ANY answer is "no" → STOP and fix before continuing.

---

## Related Documentation

- [PROJECT_CONTEXT.md - Rule #0: PORT MANAGEMENT](./PROJECT_CONTEXT.md#-critical-priority-rule-0-port-management-check-this-first-every-time)
- [PROJECT_CONTEXT.md - Rule #2: Server Restart](./PROJECT_CONTEXT.md#rule-2-server-restart-after-code-changes--new)
- [settings.json - CRITICAL_PRIORITY_RULES](./settings.json)

---

## Why This Matters (Cost Analysis)

- ❌ Using individual npm commands: 15-20 minutes, multiple restarts, ~50-100 tokens wasted
- ✅ Using unified script: 2-3 minutes, one restart, proper ports first time

**One mistake = 50-100 tokens wasted. This file = 0 more mistakes.**

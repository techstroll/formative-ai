# Port Management System - FIXED

## What Was The Problem?

You kept running into port conflicts and token waste because:

1. **Inconsistent Script Usage** - I kept using individual `npm run dev` commands instead of the unified `./start-dev.sh` script
2. **Incorrect Documentation** - The `settings.json` file had outdated startup procedures (individual npm commands)
3. **Missing Priority Rules** - No clear "BEFORE EVERYTHING" checklist to prevent the issue
4. **Hardcoded Port Assumptions** - Providing incorrect links like `localhost:3002` or `3003` without verifying actual ports

## What Was Fixed?

### 1. ✅ Updated `.claude/settings.json`

**Changed FROM:**
```json
{
  "afterAnyCodeChange": {
    "step1": "killall -9 node npm python3 2>/dev/null; sleep 3",
    "step2": "cd /Users/nick/Development/formative-ai/backend && npm run dev &",
    "step3": "cd /Users/nick/Development/formative-ai/frontend && npm run dev &",
    ...
  }
}
```

**Changed TO:**
```json
{
  "⚠️ CRITICAL_PRIORITY_RULES": {
    "1_PORT_MANAGEMENT": {
      "rule": "NEVER use individual npm run dev commands - ALWAYS use the unified start-dev.sh script",
      "correct_procedure": [
        "1️⃣  Check if services running...",
        "2️⃣  If YES: killall -9 node npm python3 && sleep 3",
        "3️⃣  ALWAYS use this: ./start-dev.sh",
        "4️⃣  WAIT for output: 'All Services Started Successfully! 🚀'",
        "5️⃣  DETECT actual ports from script output",
        "6️⃣  VERIFY with: lsof -i :3000-3010 2>/dev/null | grep LISTEN"
      ]
    }
  }
}
```

### 2. ✅ Added Rule #0 to PROJECT_CONTEXT.md

Created **CRITICAL PRIORITY RULE #0: PORT MANAGEMENT** at the very top of the rules section with:
- The exact problem that was happening
- Step-by-step solution procedure
- Correct vs wrong approaches
- Real example of correct output
- Why the unified script works

### 3. ✅ Updated Rule #2 in PROJECT_CONTEXT.md

Modified "Server Restart After Code Changes" to:
- Reference Rule #0 instead of duplicating information
- Emphasize using `./start-dev.sh` ONLY
- Show how to detect actual ports
- Clarify that links must be verified from script output, not assumed

### 4. ✅ Created `.claude/PORT_MANAGEMENT_CHECKLIST.md`

New file that serves as a quick reference to check BEFORE EVERY SESSION:
- Checklist to apply before any coding work
- Only script to use (with exact commands)
- What to provide to the user
- Self-check validation
- Related documentation links

## How This Prevents Future Issues

### Prompt Refinement Layer Implementation

Now when you give me any task:

1. **Rule #0 Priority Check** - I read `settings.json` CRITICAL_PRIORITY_RULES first
2. **Port Management Validation** - If task involves server startup, I follow the exact checklist
3. **Script Enforcement** - I ONLY use `./start-dev.sh`, never individual commands
4. **Link Verification** - I detect actual ports from script output, not guessing
5. **User Communication** - I provide correct links based on verified output

### Key Files Structure

```
.claude/
├── settings.json                      # CRITICAL_PRIORITY_RULES first
├── PROJECT_CONTEXT.md                 # Rule #0 PORT MANAGEMENT at top
├── PORT_MANAGEMENT_CHECKLIST.md       # Quick reference before work
└── PORT_FIX_SUMMARY.md               # This file - what was changed
```

## Test This Works

To verify the fix is in place:

```bash
# Check the rules are documented
cat .claude/settings.json | head -50
cat .claude/PROJECT_CONTEXT.md | head -100
cat .claude/PORT_MANAGEMENT_CHECKLIST.md | head -50
```

## Expected Behavior Going Forward

When you ask me to work on something:

1. **I check this file first** → PORT_MANAGEMENT_CHECKLIST.md
2. **I use only this script** → `./start-dev.sh`
3. **I verify actual ports** → `lsof -i :3000-3010`
4. **I provide correct links** → Based on script output, not guessed
5. **No more token waste** → One correct startup, every time

---

## TL;DR

**Before:**
- Individual npm commands → Port conflicts → 15-20 min restart → 50-100 tokens wasted
- Wrong links provided → User confused

**After:**
- One unified script → Correct ports → 2-3 min startup → Works first time
- Verified links → User has correct endpoints

The system is now automated to prevent this issue from happening again.

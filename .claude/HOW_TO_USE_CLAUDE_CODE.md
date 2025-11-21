# How to Use Claude Code with Persistent Project Context

## The Problem This Solves

Previously, Claude would:
- ❌ Scan files repeatedly to understand context
- ❌ Create duplicate .md files instead of updating existing ones
- ❌ Sometimes "hallucinate" without complete project knowledge
- ❌ Lack awareness of architecture and critical fixes

## The Solution: PROJECT_CONTEXT.md

### How to Use It

**Every time you ask Claude to work on the project:**

1. **Reference the context file in your prompt:**
   ```
   "Please [task]. See .claude/PROJECT_CONTEXT.md for project context."
   ```

2. **Or reference specific sections:**
   ```
   "Fix the login error. Check 'Known Issues & Fixes Applied' in PROJECT_CONTEXT.md"
   ```

3. **Claude will read the file and have full context** without needing to scan code

### What's in PROJECT_CONTEXT.md

✅ **Quick Reference** - Ports, URLs, API base
✅ **Critical Configuration** - CORS fixes, what never to revert
✅ **Known Issues & Fixes** - All bugs fixed with solutions
✅ **Important Rules** - Guidelines for this project
✅ **Commands to Remember** - Quick copy-paste commands
✅ **Key Files to Modify** - When to edit what files
✅ **Troubleshooting Checklist** - Quick diagnostics

## File Management Rule

**IMPORTANT:** When working on issues:

**OLD WAY (❌ Don't do this):**
- Create `BUG_FIXES_1.md`, `BUG_FIXES_2.md`, `CORS_CONFIG.md`
- Claude loses track of information

**NEW WAY (✅ Do this):**
- Everything goes into `.claude/PROJECT_CONTEXT.md`
- When you fix a bug, update the "Known Issues & Fixes Applied" section
- Keep one source of truth

### How to Update PROJECT_CONTEXT.md

When fixing a new bug:

1. **Reproduce and understand the bug**
2. **Fix the code**
3. **Update `.claude/PROJECT_CONTEXT.md`:**
   - Add new section in "Known Issues & Fixes Applied"
   - Include: Root Cause, Fixed In, Status
   - Update "Important Rules" if there's a new pattern to remember

Example:
```markdown
### 4. "API timeout on large requests"
- **Root Cause:** Request body limit was 1mb, production requests are 5mb+
- **Fixed In:** app.ts:61 - changed `limit: '1mb'` to `limit: '10mb'`
- **Status:** ✅ FIXED
```

## Commands to Remember

**Most Important:** Kill all processes before restarting
```bash
killall -9 node npm python3 2>/dev/null; sleep 3
```

Then restart:
```bash
cd /Users/nick/Development/formative-ai/backend && npm run dev &
cd /Users/nick/Development/formative-ai/frontend && npm run dev &
```

## When You Make a Request

**Good Prompt:**
```
"I'm getting 'Failed to fetch' error on login.
Check .claude/PROJECT_CONTEXT.md for CORS configuration and fixes already applied."
```

**Poor Prompt:**
```
"Fix the login error"
```

## What NOT to Do

❌ Create new .md files for issues (use PROJECT_CONTEXT.md instead)
❌ Ask Claude to "remember everything" without referencing context file
❌ Mix code fixes without updating documentation
❌ Keep multiple instances of services running (always killall first)
❌ Forget about browser cache (hard refresh: Cmd+Shift+R on Mac)

## Production Deployment Note

When deploying to production:
1. Remove the development mode CORS wildcard (line 50-52 of app.ts)
2. Replace with explicit production origins only
3. Update NODE_ENV to "production"
4. Update PROJECT_CONTEXT.md with production configuration

## Quick Checklist for Next Prompt

Before asking Claude to work on anything:

- [ ] I've read .claude/PROJECT_CONTEXT.md
- [ ] I understand the existing fixes
- [ ] I've mentioned PROJECT_CONTEXT.md in my prompt
- [ ] I've killed old processes: `killall -9 node npm`
- [ ] I'm ready to update PROJECT_CONTEXT.md with my changes

## Example: Adding a New Feature

**You:** "I want to add user preferences endpoint. See PROJECT_CONTEXT.md"

**What Claude does:**
1. ✅ Reads PROJECT_CONTEXT.md
2. ✅ Knows the CORS config (lines 39-64)
3. ✅ Knows the API structure
4. ✅ Knows where to put code (services, routes, etc.)
5. ✅ Adds the feature
6. ✅ Updates PROJECT_CONTEXT.md with new endpoint info
7. ✅ Returns and you merge changes

## Summary

**The system works when:**
- Claude reads PROJECT_CONTEXT.md first
- All project knowledge is in one file
- Updates happen after every change
- You reference the file in your prompts

**This prevents:**
- Repeated code scanning
- Lost context between prompts
- Duplicate documentation
- Hallucinations about architecture

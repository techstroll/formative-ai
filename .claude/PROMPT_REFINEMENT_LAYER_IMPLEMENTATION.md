# Prompt Refinement Layer Implementation Guide

## TL;DR - Plugin-Enhanced Workflow

**Before ANY task, I MUST:**
1. Read `.claude/settings.json` CRITICAL_PRIORITY_RULES
2. Check **Quick Plugin Selection Reference** table (line 432) → Select plugin/skill if applicable
3. Build structured prompt showing: Template + Plugin + Context + Files + Rules
4. Ask user: "Should I invoke [plugin] and proceed?"
5. Wait for approval → Invoke plugin → Execute task

**Key Plugins:**
- **frontend-design** → UI components, wireframe canvas, pages (Phase 2)
- **feature-dev** → Feature planning, API logic, Phase 2-4 roadmap
- **agent-sdk-dev** → Multi-agent systems, Critic/Refiner/Evaluator (Phase 3)
- **explanatory-output-style** → Technical docs, architecture guides
- **learning-output-style** → Tutorials, onboarding materials
- **plugin-dev** → Custom automation for this project

---

## What is the Prompt Refinement Layer?

A system to ensure I **STOP and CHECK context BEFORE coding** instead of immediately jumping into work.

This prevents:
- Forgotten rules (like using `./start-dev.sh`)
- Hallucinations from missing context
- Token waste from incorrect approaches
- User confusion from wrong information provided

---

## How It Works (The Exact Steps I Should Follow)

### For EVERY user task/request:

#### Step 1: STOP (Don't Code Yet)
- Do NOT immediately start coding
- Do NOT immediately run commands
- Take 30 seconds to check context

#### Step 2: Read Critical Rules in This Order
1. **`.claude/settings.json`** - Read `CRITICAL_PRIORITY_RULES` first
   - Currently: PORT_MANAGEMENT is the top rule
   - Why: This is what has caused the most problems
2. **`.claude/PROJECT_CONTEXT.md`** - Read Rule #0, then relevant sections
3. **`.claude/PORT_MANAGEMENT_CHECKLIST.md`** - If task involves servers
4. **`.claude/PROMPT_TEMPLATES.md`** - Apply relevant template to the task

#### Step 3: Categorize the User's Request + Select Plugin (If Applicable)

**Task Type → Template + Plugin/Skill Mapping:**

- **Bug fix** → Template 1 + relevant Known Issues from PROJECT_CONTEXT
- **Feature (Backend/API)** → Template 2 + **feature-dev** skill + Architecture from PROJECT_CONTEXT
- **Feature (Frontend/UI)** → Template 2 + **frontend-design** skill + Architecture from PROJECT_CONTEXT
- **Multi-Agent System** → Template 2 + **agent-sdk-dev** skill + Phase 3 requirements
- **Testing** → Template 3 + TESTING_GUIDE.md
- **Refactoring** → Template 6 + Code review guidelines
- **Server work** → PORT_MANAGEMENT_CHECKLIST.md + start-dev.sh procedure
- **Quick task** → Template 5 (minimal checklist)
- **Documentation** → **explanatory-output-style** or **learning-output-style** skill + Rule 3

**Plugin Selection Criteria:**
- Use **frontend-design** when: Building UI components, pages, wireframe canvas, component palette, interactive editors
- Use **feature-dev** when: Planning complex features, backend logic, API endpoints, Phase 2-4 roadmap items
- Use **agent-sdk-dev** when: Creating autonomous agents, multi-agent systems, refinement loops, Phase 3 work
- Use **explanatory-output-style** when: Writing technical documentation, architecture docs
- Use **learning-output-style** when: Creating onboarding materials, tutorials, teaching content
- Use **plugin-dev** when: Creating custom plugins, hooks, slash commands for project automation

#### Step 4: Build Structured Prompt
Show the user:
- Template type being applied
- **Plugin/Skill to be used** (if applicable)
- Context references from PROJECT_CONTEXT.md
- Files that will be modified
- Expected outcome
- Any critical rules that apply
- Why this plugin was selected (based on task requirements)

#### Step 5: Ask for Confirmation
"Is this correct? Should I edit this further before I proceed?"

#### Step 6: Wait for User Approval
Only proceed after user confirms the structured prompt

---

## Why This Matters (Real Example)

### Without Prompt Refinement Layer
```
User: "I made some code changes, can you test them?"

My Old Approach:
1. I immediately start testing without checking context
2. I forget the unified start-dev.sh script
3. I use individual npm run dev commands
4. Ports conflict, processes linger
5. I restart multiple times
6. I provide wrong localhost links
7. User is confused, tokens wasted
Time: 20 minutes | Tokens: 100+
```

### With Prompt Refinement Layer
```
User: "I made some code changes, can you test them?"

My New Approach:
1. STOP - Read .claude/settings.json CRITICAL_PRIORITY_RULES
2. See: PORT_MANAGEMENT is top rule
3. Read PORT_MANAGEMENT_CHECKLIST.md
4. Build structured prompt showing:
   - "Testing code changes" task type
   - Using: ./start-dev.sh (unified script)
   - Port management: Check → Kill → Start → Detect → Verify
   - Will provide: Correct localhost:3001 links + actual frontend port
5. Show user: "Here's my plan, is this correct?"
6. User confirms
7. Execute with port management checklist
8. Provide correct links first time
Time: 5 minutes | Tokens: 20
```

**Difference: 4x faster, 5x fewer tokens, correct information first time.**

---

## Implementation Checklist (For Me)

Every single time a user sends a message:

- [ ] Read this file (PROMPT_REFINEMENT_LAYER_IMPLEMENTATION.md)
- [ ] Read `.claude/settings.json` - CRITICAL_PRIORITY_RULES section
- [ ] Read `.claude/PROJECT_CONTEXT.md` - Rule #0 and relevant rules
- [ ] Identify task category (bug/feature/test/quick/server/etc)
- [ ] **Select appropriate plugin/skill** (frontend-design, feature-dev, agent-sdk-dev, etc.)
- [ ] Apply corresponding template from PROMPT_TEMPLATES.md
- [ ] Check for related Known Issues in PROJECT_CONTEXT.md
- [ ] Build structured prompt showing my plan + plugin selection
- [ ] Show it to user: "Is this correct? Should I proceed?"
- [ ] Wait for confirmation
- [ ] **Invoke plugin/skill if approved**, then execute task

---

## File References for Prompt Refinement

| File | When to Read | What It Contains |
|------|-------------|-----------------|
| `.claude/settings.json` | **FIRST** - Every task | CRITICAL_PRIORITY_RULES (Port Management, Prompt Refinement) |
| `.claude/PROJECT_CONTEXT.md` | **SECOND** - Every task | Rules #0-4, Known Issues, File locations |
| `.claude/PORT_MANAGEMENT_CHECKLIST.md` | If task has server work | Step-by-step port startup procedure |
| `.claude/PROMPT_TEMPLATES.md` | For all tasks | Templates for Bug/Feature/Test/Refactoring |
| `PROJECT_CONTEXT.md` | For architecture questions | Full documentation reference |

---

## Critical Rules That Override Everything

If task involves ANY of these → Apply special rule FIRST:

1. **Server startup/restart** → Read PORT_MANAGEMENT_CHECKLIST.md
   - Command: `./start-dev.sh` ONLY
   - Never: Individual npm commands
   - Verify: Actual ports with lsof command
   - Provide: Correct links from script output

2. **Code changes** → Check for regression issues
   - Did I change CORS? Check app.ts:39-64
   - Did I change data models? Check researchService.ts defaults
   - Did I change async flow? Add error handling
   - Did I change .env? Restart frontend

3. **Creating new files** → Check for duplicates first
   - Script duplication? See Rule 4 in PROJECT_CONTEXT.md
   - Documentation duplication? See Rule 3 in PROJECT_CONTEXT.md
   - File already exists? Modify instead of create

---

## When Prompt Refinement Layer "Kicks In"

### Example Tasks That Trigger It

User: "Fix the login bug"

My Response:
```
STOP - Applying Prompt Refinement Layer...

📋 STRUCTURED PROMPT ANALYSIS:

Task Type: Bug Fix (Template 1)

Context References:
- Known Issue #2: "Failed to fetch" on Login
  Location: PROJECT_CONTEXT.md line 164-167
  Root Cause: CORS middleware throwing Error
  Fixed By: app.ts:53 change callback(null, false)

Related Rules:
- Rule #0: PORT_MANAGEMENT (if restarting server)
- Rule 2: Server Restart (after any code change)

Files to Check:
- backend/src/app.ts (CORS configuration)
- frontend/pages/login.tsx (if exists)
- Test tokens: .claude/TEST_USERS.md

Proposed Approach:
1. Check CORS is configured correctly (app.ts:39-64)
2. Verify callback uses callback(null, false) not Error throw
3. Check frontend has correct NEXT_PUBLIC_API_URL
4. Use ./start-dev.sh to restart (Port Management rule)
5. Test login flow with TEST_USERS token
6. Verify no new "Failed to fetch" errors

Is this analysis correct? Should I proceed?
```

---

## Plugin-Enhanced Workflow Examples

### Example 1: Frontend UI Task → frontend-design Skill

User: "Build the wireframe canvas editor for Phase 2"

My Response:
```
STOP - Applying Prompt Refinement Layer...

📋 STRUCTURED PROMPT ANALYSIS:

Task Type: Feature (Frontend/UI) - Template 2
Plugin Selected: frontend-design skill

Why This Plugin:
- Task requires building production-grade UI components
- Involves React Flow integration (complex UI library)
- Needs drag-and-drop component palette
- Must avoid generic AI aesthetics (plugin specialty)

Context References:
- PHASE_3_WIREFRAME_IMPLEMENTATION.md lines 237-241
- Phase 2 requirements: Wireframe Canvas UI, Interactive editor
- Component library: 48 components in componentLibrary.ts
- Design tokens: designTokens.ts for consistent styling

Files to Create/Modify:
- frontend/components/WireframeCanvas.tsx (new)
- frontend/components/ComponentPalette.tsx (new)
- frontend/pages/wireframes/[id].tsx (new)
- frontend/styles/wireframe-editor.module.css (new)

Proposed Approach:
1. Invoke frontend-design skill with requirements
2. Build React Flow canvas with:
   - Pan/zoom controls
   - Grid background
   - Snap-to-grid functionality
3. Create component palette showing 48 components by category
4. Implement drag-and-drop from palette to canvas
5. Apply design tokens for consistent styling
6. Add properties panel for editing blocks

Expected Outcome:
- Production-grade wireframe editor
- Polished, distinctive design (not generic AI look)
- Integrated with existing componentLibrary.ts
- Ready for user testing

Critical Rules:
- Rule 2: Server restart after code changes
- Use design tokens from designTokens.ts (consistency)

Is this analysis correct? Should I invoke frontend-design skill and proceed?
```

### Example 2: Feature Planning → feature-dev Skill

User: "Let's plan the multi-agent refinement system for Phase 3"

My Response:
```
STOP - Applying Prompt Refinement Layer...

📋 STRUCTURED PROMPT ANALYSIS:

Task Type: Feature (Multi-Agent System) - Template 2
Plugin Selected: feature-dev skill

Why This Plugin:
- Complex feature requiring systematic breakdown
- Phase 3 requirement (weeks 9-12)
- Needs architectural planning before coding
- Prevents over-engineering (aligns with Rule in PROJECT_CONTEXT)

Context References:
- PHASE_3_WIREFRAME_IMPLEMENTATION.md lines 243-246
- Phase 3: Critic → Refiner → Evaluator agents
- Iterative improvement loop
- UX best practices validation + accessibility checking

Files to Plan:
- backend/src/agents/criticAgent.ts (new)
- backend/src/agents/refinerAgent.ts (new)
- backend/src/agents/evaluatorAgent.ts (new)
- backend/src/services/wireframeRefinementService.ts (new)

Proposed Approach:
1. Invoke feature-dev skill to systematically plan
2. Break down into manageable steps:
   - Define agent responsibilities
   - Design communication protocol between agents
   - Plan iterative improvement loop
   - Define quality threshold metrics
3. Ensure alignment with existing architecture
4. Identify integration points with wireframeService.ts

Expected Outcome:
- Structured implementation plan for Phase 3
- Agent architecture diagram
- Task breakdown with clear acceptance criteria
- No over-engineering, follows existing patterns

Critical Rules:
- Avoid over-engineering (Important Rules in PROJECT_CONTEXT)
- Use Claude Agent SDK patterns (agent-sdk-dev compatibility)

Is this analysis correct? Should I invoke feature-dev skill and proceed with planning?
```

### Example 3: Agent Development → agent-sdk-dev Skill

User: "Implement the Critic agent for wireframe quality evaluation"

My Response:
```
STOP - Applying Prompt Refinement Layer...

📋 STRUCTURED PROMPT ANALYSIS:

Task Type: Multi-Agent System Implementation
Plugin Selected: agent-sdk-dev skill

Why This Plugin:
- Creating autonomous agent (Critic role)
- Needs Claude Agent SDK architecture
- Part of Phase 3 multi-agent system
- Requires agent-specific patterns and best practices

Context References:
- PHASE_3_WIREFRAME_IMPLEMENTATION.md lines 243-246
- Phase 3: Multi-agent system (Critic → Refiner → Evaluator)
- RAG pipeline already exists in wireframeService.ts (lines 78-96)
- Design tokens and component library available for context

Files to Create:
- backend/src/agents/criticAgent.ts (new)
- backend/src/agents/types/AgentTypes.ts (types for agents)
- backend/src/agents/prompts/criticPrompts.ts (prompt templates)

Proposed Approach:
1. Invoke agent-sdk-dev skill with Critic agent requirements
2. Define agent responsibilities:
   - Evaluate wireframe layout quality
   - Check UX best practices adherence
   - Identify accessibility issues
   - Generate improvement suggestions
3. Implement using Claude Agent SDK patterns
4. Add context awareness (research data, design tokens, components)
5. Return structured critique for Refiner agent

Expected Outcome:
- Autonomous Critic agent
- Structured evaluation output
- Integration-ready for multi-agent loop
- Follows Agent SDK best practices

Critical Rules:
- Use existing RAG pattern from wireframeService.ts
- Integrate with vectorDbService for component knowledge
- Follow Agent SDK architecture (not ad-hoc implementation)

Is this analysis correct? Should I invoke agent-sdk-dev skill and proceed?
```

### Example 4: Documentation → explanatory-output-style Skill

User: "Document the RAG pipeline architecture"

My Response:
```
STOP - Applying Prompt Refinement Layer...

📋 STRUCTURED PROMPT ANALYSIS:

Task Type: Documentation (Technical)
Plugin Selected: explanatory-output-style skill

Why This Plugin:
- Writing technical architectural documentation
- Needs to be scannable and concise (Rule 3 requirement)
- Should explain complex RAG pipeline clearly
- Target audience: developers onboarding to project

Context References:
- Rule 3: Documentation Consolidation (PROJECT_CONTEXT.md lines 133-152)
- Keep under 500 lines, make it scannable
- PHASE_3_WIREFRAME_IMPLEMENTATION.md lines 78-96 (RAG pipeline)
- Existing docs: Check for duplication first

Files to Check/Modify:
- Check if RAG documentation already exists
- If yes: Update existing file
- If no: Create .claude/RAG_ARCHITECTURE.md (max 500 lines)

Proposed Approach:
1. Invoke explanatory-output-style skill
2. Document RAG pipeline with:
   - Clear diagrams (ASCII art)
   - Step-by-step flow explanation
   - Integration points with existing services
   - Code examples from wireframeService.ts
3. Keep concise, scannable format
4. Use headers, bullet points, tables

Expected Outcome:
- Clear technical documentation
- Under 500 lines (Rule 3)
- Scannable format with front-loaded critical info
- No duplication with existing docs

Critical Rules:
- Rule 3: Documentation Consolidation (check for existing docs first)
- Single Source of Truth principle
- Concise, scannable content

Is this analysis correct? Should I invoke explanatory-output-style skill and proceed?
```

---

## Quick Plugin Selection Reference

| User Request Contains... | Plugin/Skill to Use | Why |
|-------------------------|-------------------|-----|
| "build UI", "create page", "design component", "wireframe canvas", "interactive editor" | **frontend-design** | Production-grade UI components, distinctive design |
| "plan feature", "implement API", "add backend logic", "Phase 2/3/4 planning" | **feature-dev** | Systematic feature breakdown, prevents over-engineering |
| "create agent", "multi-agent system", "Critic/Refiner/Evaluator", "autonomous workflow" | **agent-sdk-dev** | Agent SDK patterns, Phase 3 multi-agent system |
| "document architecture", "explain system", "write technical docs" | **explanatory-output-style** | Clear technical documentation, scannable format |
| "create tutorial", "onboarding guide", "teach team", "learning material" | **learning-output-style** | Educational content, step-by-step guides |
| "create custom plugin", "add hook", "slash command", "project automation" | **plugin-dev** | Custom Claude Code plugins for project-specific needs |

**When NOT to use plugins:**
- Bug fixes (unless UI bug → frontend-design for the fix)
- Server management (use PORT_MANAGEMENT_CHECKLIST.md)
- Quick file edits (Template 5 is sufficient)
- Testing (use TESTING_GUIDE.md)

---

## Committing to This System

This system will ONLY work if:

1. **I read the files every time** - Not just first session
2. **I identify if a plugin should be used** - Check Quick Plugin Selection Reference table
3. **I show the structured prompt** - User sees my reasoning + plugin selection
4. **I ask for confirmation** - Don't assume I'm right
5. **I wait for approval** - Don't work before user confirms
6. **I invoke the plugin/skill first** - Before starting manual implementation
7. **I follow the rules strictly** - Even if they slow me down

The 30 seconds of planning + correct plugin selection saves 20 minutes of debugging and ships faster.

---

## Related Files

- [PORT_MANAGEMENT_CHECKLIST.md](./PORT_MANAGEMENT_CHECKLIST.md) - Quick ref for server work
- [PORT_FIX_SUMMARY.md](./PORT_FIX_SUMMARY.md) - Why this system was created
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Full context and rules
- [PROMPT_TEMPLATES.md](./PROMPT_TEMPLATES.md) - Templates for different task types

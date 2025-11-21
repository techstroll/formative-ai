# Prompt Templates for Efficient Task Execution

Use these templates exactly as shown to work most efficiently with Claude Code. Always reference PROJECT_CONTEXT.md to ensure I have full context.

---

## 🐛 Template 1: Fixing a Bug/Issue

```
Bug: [Short description of the bug]
Error Message: [Exact error message or screenshot reference]
Affected Flow: [Which user flow is broken - login, research, etc]
Expected Behavior: [What should happen]
Actual Behavior: [What actually happens]
Affected Files: [List files involved - optional but helpful]

See PROJECT_CONTEXT.md for:
- Known Issues & Fixes Applied section
- Troubleshooting Checklist
- Key Files to Modify table
```

**Example:**
```
Bug: Login button shows "Failed to fetch" error
Error Message: TypeError: Failed to fetch at authApi.ts:33:23
Affected Flow: Authentication flow on signup page
Expected Behavior: User should be able to login with email/password
Actual Behavior: All login attempts fail with fetch error
Affected Files: frontend/lib/api/authApi.ts, backend/src/app.ts

See PROJECT_CONTEXT.md for CORS configuration and fixes already applied.
```

---

## ✨ Template 2: Adding a New Feature

```
Feature: [Clear name of the feature]
Description: [What should it do]
User Flow: [Step-by-step what user does]
Files to Create/Modify:
  - [Backend route file]
  - [Frontend component file]
  - [Database model if needed]

Dependencies: [Does it depend on other features?]
Reference Docs: [Which docs to read first]

See PROJECT_CONTEXT.md for:
- Project Structure
- Key Files to Modify table
- Documentation Reference by Category (especially [IMPLEMENTATION_STATUS.md] and [README.md])
```

**Example:**
```
Feature: User Preferences Endpoint
Description: Allow users to save and retrieve personal preferences (theme, language, etc)
User Flow:
  1. User navigates to settings page
  2. User changes theme preference
  3. Preference is saved to database
  4. Page reloads and shows new theme
Files to Create/Modify:
  - backend/src/routes/preferences.ts (CREATE)
  - backend/src/services/preferencesService.ts (CREATE)
  - frontend/pages/settings.tsx (MODIFY)
  - frontend/lib/api/preferencesApi.ts (CREATE)
  - prisma/schema.prisma (MODIFY - add Preferences model)

Dependencies: Requires user authentication to be working
Reference Docs: PHASE_2_RESEARCH_MODULE.md for similar pattern, IMPLEMENTATION_STATUS.md for existing endpoints

See PROJECT_CONTEXT.md for architecture and patterns already established.
```

---

## 🧪 Template 3: Writing a Test

```
Test Type: [Unit/Integration/E2E]
Component/Function: [What are we testing]
Test File: [Where should test go]
Current Status: [Is test file already created? Does function exist?]

Test Scenarios:
  1. [Happy path - what should work]
  2. [Edge case - boundary condition]
  3. [Error case - what should fail gracefully]

Reference: [Which docs explain this feature]

See PROJECT_CONTEXT.md for:
- Testing & Quality Assurance docs
- Key Files to Modify table
```

**Example:**
```
Test Type: Unit Test
Component/Function: researchService.ts - sessionToResult()
Test File: backend/src/services/researchService.test.ts
Current Status: Test file doesn't exist yet, function is in researchService.ts:183-212

Test Scenarios:
  1. Happy path: Convert complete session to result with all fields
  2. Edge case: Handle session with undefined optional fields (should use defaults)
  3. Edge case: Handle null/empty arrays in swot object
  4. Error case: Handle malformed session data gracefully

Reference: TESTING_GUIDE.md explains research testing patterns

See PROJECT_CONTEXT.md Known Issues #1 about field defaults - that's what we're testing.
```

---

## 🔄 Template 4: Testing a Complete Flow

```
Flow Name: [What flow to test - login, research generation, etc]
Start Point: [Where user begins - home page, login, etc]
End Point: [What should be accomplished]
Test Environment: [localhost:3003, production, etc]

Steps to Test:
  1. [Action user takes]
  2. [Expected result]
  3. [Action user takes]
  4. [Expected result]
  ... continue

Known Issues to Avoid: [Any bugs we've already fixed that might reappear]
Success Criteria: [How do we know it worked]

Reference: [Which docs explain this flow]

See PROJECT_CONTEXT.md for:
- Documentation Reference by Category
- Troubleshooting Checklist (run through before testing)
```

**Example:**
```
Flow Name: Complete Research Generation Flow
Start Point: Dashboard page (authenticated user)
End Point: Research results page with populated data

Steps to Test:
  1. Click "New Research" button
     Expected: Research form appears
  2. Fill form: Topic="AI Customer Support", Audience="Enterprise", Competitors=["Zendesk", "Intercom"]
     Expected: Form validates and submits
  3. Wait for research generation (polling every 3 seconds)
     Expected: Status updates from "generating" → "completed"
  4. View final results
     Expected: All fields populated (executiveSummary, SWOT, keyInsights, recommendations)
  5. Click "Export" button
     Expected: Download PDF with all research data

Known Issues to Avoid:
  - "missing required error components" error (fixed in researchService.ts with defaults)
  - "Failed to fetch" on initial request (fixed in CORS config - app.ts:39-64)
  - Undefined fields crashing the page (fixed with optional chaining in research.tsx)

Success Criteria:
  - Form submits without errors
  - Status updates appear in real-time
  - All data fields are populated (no undefined values)
  - Export creates valid PDF
  - Browser console has no errors

Reference: PHASE_2_RESEARCH_MODULE.md for research implementation, QUICK_TEST_GUIDE.md for testing

See PROJECT_CONTEXT.md for known fixes and CORS configuration.
```

---

## 🚀 Template 5: Quick Task/Fix

```
Task: [One-line description]
File(s): [Specific file paths]
Change: [What needs to change]
Why: [Context or reference]

See PROJECT_CONTEXT.md [Critical Configuration / Known Issues / etc]
```

**Example:**
```
Task: Update CORS to allow port 3006 for frontend testing
File(s): backend/src/app.ts (line 42)
Change: Add 'http://localhost:3006' to allowedOrigins array
Why: New frontend instance might run on 3006, need CORS to allow it

See PROJECT_CONTEXT.md Critical Configuration section for how CORS works (lines 11-17)
```

---

## 📋 Template 6: Refactoring/Cleanup

```
Scope: [Which files/components to refactor]
Current Problem: [What's wrong with current code]
Target Improvement: [What should we improve]
Files to Modify: [List specific files]

Constraints: [Any breaking changes to avoid]
Tests: [Do tests need updating]

See PROJECT_CONTEXT.md for:
- Project Structure
- Key Files to Modify table
- [IMPLEMENTATION_STATUS.md] for impact analysis
```

**Example:**
```
Scope: Consolidate research API calls
Current Problem: Multiple duplicate fetch calls in research.tsx:22-56, scattered error handling
Target Improvement: Create researchPolling service to centralize polling logic with consistent error handling
Files to Modify:
  - frontend/lib/api/researchApi.ts (add new polling method)
  - frontend/pages/research.tsx (use new centralized method)

Constraints:
  - Don't change the polling interval (currently 3 seconds)
  - Keep the same error state structure

Tests: Update research polling tests if they exist

See PROJECT_CONTEXT.md Known Issues #3 about polling error handling - make sure we maintain that pattern.
```

---

## ✅ Best Practices for Prompts

### DO:
- ✅ Reference specific line numbers from PROJECT_CONTEXT.md
- ✅ Mention which Known Issues might be related
- ✅ Specify file paths completely
- ✅ Include exact error messages or expected behavior
- ✅ Reference relevant documentation files
- ✅ Mention Affected Files to avoid context-hunting

### DON'T:
- ❌ Say "fix the error" without showing the error message
- ❌ Forget to reference PROJECT_CONTEXT.md
- ❌ Leave vague descriptions like "make it work"
- ❌ Ask to "check if this is right" without saying what "right" means
- ❌ Change requirements mid-task without updating the prompt

---

## 🎯 Minimal Viable Prompt (MVP)

If you're in a hurry, use this bare minimum:

```
Task: [What you want done]
Files: [Where the code is]
See PROJECT_CONTEXT.md for full context
```

**Example:**
```
Task: Make login endpoint return 400 instead of 500 on invalid credentials
Files: backend/src/routes/auth.ts
See PROJECT_CONTEXT.md for CORS and error handling patterns
```

---

## 🔗 Quick Reference: What Section to Reference

| Issue Type | Reference Section |
|-----------|-------------------|
| CORS/fetch errors | PROJECT_CONTEXT.md → Critical Configuration |
| Undefined data fields | PROJECT_CONTEXT.md → Known Issues #1 |
| Polling crashes | PROJECT_CONTEXT.md → Known Issues #3 |
| Research flow | PHASE_2_RESEARCH_MODULE.md |
| API endpoints | IMPLEMENTATION_STATUS.md |
| Testing approach | TESTING_GUIDE.md or QUICK_TEST_GUIDE.md |
| Setup problems | DEV_ENVIRONMENT_SETUP.md |
| Status overview | MVP_STATUS_ANALYSIS.md |

---

## 💡 Example: Complete Well-Formatted Prompt

```
Bug: Research generation shows "Cannot read properties of undefined (reading 'length')" error

Error Location: frontend/pages/research.tsx:350 in SWOT section rendering
Stack Trace: TypeError: Cannot read properties of undefined (reading 'length')
             at Research.tsx:350

Affected Flow:
  1. User submits research request
  2. Research completes successfully
  3. Results page loads
  4. SWOT section renders but crashes

Expected Behavior: SWOT analysis should display 4 boxes (Strengths, Weaknesses, Opportunities, Threats) with bullet points

Actual Behavior: Page crashes with "Cannot read properties of undefined" error

Affected Files:
  - frontend/pages/research.tsx (rendering SWOT section)
  - backend/src/services/researchService.ts (providing SWOT data)

Root Cause Investigation: Check if backend is returning undefined for swot field (mentioned in PROJECT_CONTEXT.md Known Issues #1)

Steps to Reproduce:
  1. Start from Dashboard
  2. Create new research request
  3. Wait for completion
  4. Observe SWOT section on results page

See PROJECT_CONTEXT.md:
- Known Issues & Fixes Applied #1 (research data completeness)
- Critical Configuration (data defaults)
- Affected Files: researchService.ts (line 183-212) should have defaults
```

This is the gold standard for task prompts - specific, contextual, and self-contained!

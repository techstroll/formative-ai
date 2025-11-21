# 📚 Documentation Index

**Quick navigation for all project documentation**

---

## 🎯 By Use Case

### "I'm getting a wireframe database error"
→ [DATABASE_SCHEMA_FIXES.md](./DATABASE_SCHEMA_FIXES.md)
- Issue 1: "Column does not exist" errors
- Issue 2: Constructor parameter order bugs
- Issue 3: Suggested components not persisting
- Health check SQL queries
- Prevention best practices

### "I want to test wireframe generation"
→ [TESTING_GUIDE.md](./TESTING_GUIDE.md#-full-end-to-end-test)
- End-to-end flow explanation
- Step-by-step testing checklist
- API testing with cURL examples
- Common issues and solutions

### "I need to understand project rules & setup"
→ [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
- Mandatory workflow rules
- CORS configuration
- Known issues & fixes
- Troubleshooting checklist
- Key files to modify

### "I'm implementing a new feature"
→ [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#prompt-refinement-layer-mandatory)
- Prompt Refinement Layer (required!)
- Template selection guide
- Structured prompt format

### "I need to understand wireframe generation"
→ [PHASE_3_WIREFRAME_IMPLEMENTATION.md](./PHASE_3_WIREFRAME_IMPLEMENTATION.md)
- Feature overview
- Architecture & RAG pipeline
- Component library details (48 components)
- Design tokens system
- Success criteria

### "I need test user credentials for testing"
→ [TEST_USERS.md](./TEST_USERS.md)
- Primary test user (testuser@example.com)
- JWT token generation
- API testing with authentication
- UI testing credentials
- Database user info

### "I want to test the UI (browser testing)"
→ [TESTING_GUIDE.md](./TESTING_GUIDE.md#-ui-testing)
- Step-by-step browser testing
- Sign in walkthrough
- Wireframe generation flow
- Component verification
- Troubleshooting UI issues

### "How do I start the development environment?"
→ [TESTING_GUIDE.md](./TESTING_GUIDE.md#-prerequisites--setup)
- One-command startup: `./start-dev.sh`
- Service details (backend, frontend, AI pipeline)
- Port configuration
- Troubleshooting startup issues

---

## 📁 File Organization

### 🤖 Claude Code Configuration
| File | Purpose | Size |
|------|---------|------|
| [.claude/PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | **Main reference** - Rules, config, issues | 340 lines |
| [.claude/DOCUMENTATION_PLANNING.md](./DOCUMENTATION_PLANNING.md) | Documentation rules & consolidation guidelines | 220 lines |
| [.claude/DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | **You are here** - Quick navigation | Dynamic |
| [.claude/PROMPT_TEMPLATES.md](./PROMPT_TEMPLATES.md) | Prompt templates for different task types | 350 lines |
| [.claude/commands/COMMON_COMMANDS.md](./commands/COMMON_COMMANDS.md) | **Organized commands by task type** | 350 lines |
| [.claude/HOW_TO_USE_CLAUDE_CODE.md](./HOW_TO_USE_CLAUDE_CODE.md) | Guide for working with Claude Code | - |

### 🚀 Scripts & Automation
| Folder | Purpose | Location |
|--------|---------|----------|
| [/scripts](../scripts/) | **All development scripts** (start, test, build, setup) | `/scripts/` folder |
| [scripts/README.md](../scripts/README.md) | Script overview and usage guide | `/scripts/README.md` |

### 🧪 Testing & Troubleshooting (CONSOLIDATED)
| File | Purpose | When to Use |
|------|---------|------------|
| [.claude/TESTING_GUIDE.md](./TESTING_GUIDE.md) | **ALL testing** - UI, API, E2E, startup, wireframes | Any testing (quick start in 5 min) |
| [.claude/TEST_USERS.md](./TEST_USERS.md) | Test credentials, JWT tokens, user management | Need to test with authentication |
| [.claude/DATABASE_SCHEMA_FIXES.md](./DATABASE_SCHEMA_FIXES.md) | Database issues & solutions | Database errors occur |

### 📋 Implementation Details
| File | Purpose | When to Use |
|------|---------|------------|
| [.claude/PHASE_2_IMPLEMENTATION_REPORT.md](./PHASE_2_IMPLEMENTATION_REPORT.md) | **Phase 2 complete report** - Feature mapping & design tokens | Understanding Phase 2 changes (SHIPPED) |
| [.claude/PHASE_3_WIREFRAME_IMPLEMENTATION.md](./PHASE_3_WIREFRAME_IMPLEMENTATION.md) | Wireframe feature details | Understanding wireframe architecture |
| [README.md](../README.md) | Project overview | Getting started |
| [QUICK_START.md](../QUICK_START.md) | Quick setup guide | Setting up development |

---

## 🚀 Quick Start Navigation

```
New to the project?
└─ Read QUICK_START.md (../QUICK_START.md)
   └─ Then read PROJECT_CONTEXT.md

Getting an error?
└─ Check PROJECT_CONTEXT.md Known Issues section
└─ Or see TROUBLESHOOTING links below

Want to understand a feature?
└─ Find the PHASE_X_*.md file for that phase
└─ Then check FEATURE_TESTING_GUIDE.md for how to test it

Need to implement something?
└─ Read PROJECT_CONTEXT.md Prompt Refinement Layer section
└─ Follow the template provided
└─ Then check relevant FEATURE_TESTING_GUIDE.md
```

---

## 🔍 Troubleshooting Quick Links

### Database Issues
- **"Column does not exist"** → [DATABASE_SCHEMA_FIXES.md#issue-1](./DATABASE_SCHEMA_FIXES.md#issue-1-column-does-not-exist-error)
- **Corrupted wireframe data** → [DATABASE_SCHEMA_FIXES.md#issue-2](./DATABASE_SCHEMA_FIXES.md#issue-2-constructor-parameter-order-bug)
- **Missing components in response** → [DATABASE_SCHEMA_FIXES.md#issue-3](./DATABASE_SCHEMA_FIXES.md#issue-3-suggested-components-not-persisted)

### Wireframe Issues
- **Wireframe won't generate** → [WIREFRAME_TESTING_GUIDE.md#common-issues](./WIREFRAME_TESTING_GUIDE.md#-common-issues--solutions)
- **Testing wireframe generation** → [WIREFRAME_TESTING_GUIDE.md#testing-checklist](./WIREFRAME_TESTING_GUIDE.md#-testing-checklist)
- **API testing examples** → [WIREFRAME_TESTING_GUIDE.md#api-testing](./WIREFRAME_TESTING_GUIDE.md#-api-testing-curl)

### Configuration Issues
- **CORS problems** → [PROJECT_CONTEXT.md#cors](./PROJECT_CONTEXT.md#critical-configuration)
- **Port conflicts** → [PROJECT_CONTEXT.md#server-restart](./PROJECT_CONTEXT.md#rule-2-server-restart-after-code-changes-)
- **Database setup** → [PROJECT_CONTEXT.md#database](./PROJECT_CONTEXT.md#critical-configuration)

---

## 📊 Documentation Statistics

| Category | Files | Total Lines |
|----------|-------|-------------|
| Configuration & Context | 3 | ~1,000 |
| Testing & Troubleshooting | 3 | ~770 |
| Implementation Details | 2 | ~1,215 |
| **TOTAL** | **8** | **~2,985** |

---

## 🎓 How to Use This Index

### Method 1: By Problem
1. Search the **🔍 Troubleshooting Quick Links** section above
2. Click the direct link to the relevant section
3. Find your specific issue

### Method 2: By Task
1. Look at **🎯 By Use Case** at the top
2. Find your use case
3. Click the recommended document
4. Use Ctrl+F to search within that document

### Method 3: By Workflow
1. Check what type of work you're doing
2. Find the relevant **📁 File Organization** table
3. Choose the appropriate file
4. Navigate to the section you need

---

## 🔄 Cross-References

These documents reference each other:

```
PROJECT_CONTEXT.md
├─ References WIREFRAME_TESTING_GUIDE.md (testing)
├─ References DATABASE_SCHEMA_FIXES.md (database issues)
└─ References PROMPT_TEMPLATES.md (how to structure requests)

WIREFRAME_TESTING_GUIDE.md
├─ References DATABASE_SCHEMA_FIXES.md (for error solutions)
├─ References PHASE_3_WIREFRAME_IMPLEMENTATION.md (architecture)
└─ References PROJECT_CONTEXT.md (general rules)

DATABASE_SCHEMA_FIXES.md
├─ References PHASE_3_WIREFRAME_IMPLEMENTATION.md (feature context)
└─ References PROJECT_CONTEXT.md (general setup)

PHASE_3_WIREFRAME_IMPLEMENTATION.md
└─ References WIREFRAME_TESTING_GUIDE.md (how to test)
```

---

## 💡 Pro Tips

1. **Use Ctrl+F (Find)** within markdown files to search for keywords
2. **Most recent changes** are documented in PROJECT_CONTEXT.md Known Issues
3. **For quick help**, start with QUICK_START.md or PROJECT_CONTEXT.md
4. **For detailed info**, check the specific PHASE_X_*.md file
5. **Before implementing**, always read the Prompt Refinement Layer section

---

## 📝 Latest Updates

**November 20, 2025:**
- ✅ **PHASE 2 SHIPPED** - Added PHASE_2_IMPLEMENTATION_REPORT.md
  - Phase 2.1: Feature → Component Mapping (13 semantic categories)
  - Phase 2.2: Design Token Integration (consistent color system)
  - Complete test results and verification
  - Files changed summary and migration guide

**November 19, 2025:**
- Added DATABASE_SCHEMA_FIXES.md - comprehensive database troubleshooting
- Added WIREFRAME_TESTING_GUIDE.md - end-to-end testing procedures
- Created initializeDatabase.ts for automatic schema migration
- Added reference section to PHASE_3_WIREFRAME_IMPLEMENTATION.md
- Updated QUICK_START.md with feature-specific guides
- Added this index for easy navigation

---

## 🔗 Key Documentation Sections

### Must Read First
1. [QUICK_START.md](../QUICK_START.md) - Setup & running servers
2. [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Rules & configuration

### Reference While Working
1. [PROJECT_CONTEXT.md - Prompt Refinement Layer](./PROJECT_CONTEXT.md#prompt-refinement-layer-mandatory)
2. [PROJECT_CONTEXT.md - Troubleshooting](./PROJECT_CONTEXT.md#troubleshooting-checklist)

### When Debugging
1. [DATABASE_SCHEMA_FIXES.md](./DATABASE_SCHEMA_FIXES.md) - Database issues
2. [WIREFRAME_TESTING_GUIDE.md](./WIREFRAME_TESTING_GUIDE.md) - Feature testing

### When Building Features
1. [PHASE_2_IMPLEMENTATION_REPORT.md](./PHASE_2_IMPLEMENTATION_REPORT.md) - Phase 2 details (SHIPPED)
2. [PHASE_3_WIREFRAME_IMPLEMENTATION.md](./PHASE_3_WIREFRAME_IMPLEMENTATION.md) - Wireframe architecture
3. [WIREFRAME_TESTING_GUIDE.md](./WIREFRAME_TESTING_GUIDE.md) - How to test

---

**Last Updated:** November 20, 2025
**Maintained By:** Claude Code
**Next Review:** After Phase 3 completion


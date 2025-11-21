# Documentation Planning & Guidelines

**Last Updated:** November 20, 2025
**Purpose:** Establish rules for creating, organizing, and maintaining project documentation
**Audience:** Claude Code (AI assistant for this project)

---

## ⚠️ THE ONE RULE: NO DUPLICATE DOCUMENTATION

**Before creating ANY new .md file:**

1. **Search existing docs** - Is there already a file covering this topic?
2. **Single Source of Truth** - One file per topic, NOT multiple files with overlapping content
3. **Consolidate, don't create** - Modify existing files instead of creating new ones
4. **Exceptions only** - New files only if creating genuinely new content category

---

## 📊 Documentation Structure

### Root Level (Project-Wide Info)
**Purpose:** Overview, setup, deployment, project status
**Audience:** All developers, new contributors

| File | Content | Max Size |
|------|---------|----------|
| README.md | Project overview, features, architecture | 200 lines |
| QUICK_START.md | 5-minute setup & first test | 100 lines |
| [Other root docs] | Feature status, deployment guides | 200 lines each |

**Rule:** Root .md files answer "What is this project?" and "How do I get started?"

---

### .claude/ Level (Claude Code Operational Guides)
**Purpose:** How Claude Code should work on this project
**Audience:** Claude Code (AI assistant)

| File | Content | Max Size | Category |
|------|---------|----------|----------|
| PROJECT_CONTEXT.md | Rules, config, critical fixes | 300 lines | Core |
| DOCUMENTATION_PLANNING.md | This file - doc rules | 150 lines | Core |
| PROMPT_TEMPLATES.md | How to structure requests | 350 lines | Core |
| TESTING_GUIDE.md | UI, API, E2E, wireframe testing | 500 lines | Testing |
| TEST_USERS.md | Test credentials & tokens | 150 lines | Testing |
| DATABASE_SCHEMA_FIXES.md | DB issues & solutions | 200 lines | Troubleshooting |

**Rule:** .claude/ files answer "How do I develop on this project?" and "How do I test?"

---

## ✅ Documentation Best Practices

### 1. Conciseness First
- **Scannable headers** - User should find info in <30 seconds
- **Bullet points** - Not paragraphs (use tables for structured info)
- **Front-load critical info** - Most important first
- **Maximum 500 lines per file** - Unless archival/reference

**Example - Good:**
```
## Testing Wireframes
1. Start services: `./start-dev.sh`
2. Load test user: `source /tmp/test-user-setup.sh`
3. Generate: `curl -X POST /wireframes/generate-from-research ...`
```

**Example - Bad:**
```
## Testing Wireframes
To test wireframes in the system, you first need to understand the architecture
of how wireframes work. Wireframes are generated from research data using an AI
pipeline that processes research sessions and produces SVG output...
[continues with unnecessary detail]
```

### 2. Structure Information Hierarchically
```
Topic
├── Quick Start (TL;DR version)
├── Prerequisites
├── Step-by-Step Process
├── Troubleshooting
└── Related Docs (links)
```

### 3. Use Clear Section Headers
- `## Section` - Major topics
- `### Subsection` - Related concepts
- `#### Detail` - Specific items only

### 4. Link to Other Docs, Don't Duplicate
```markdown
// ✅ GOOD - Reference other docs
See [TESTING_GUIDE.md](./TESTING_GUIDE.md#wireframe-testing) for wireframe testing steps

// ❌ BAD - Copy content from other docs
[Duplicate paragraphs from TESTING_GUIDE.md...]
```

### 5. Use Tables for Comparisons & Lists
```markdown
// ✅ GOOD - Easy to scan
| Command | Purpose | When |
|---------|---------|------|
| ./start-dev.sh | Start all services | Every session |
| npm run build | Build for prod | Before deploy |

// ❌ BAD - Harder to scan
- ./start-dev.sh: Use this command to start all development services. Run it every time you begin a new development session.
- npm run build: This command builds the project for production. You should use it before deploying...
```

### 6. Front-Load Most Critical Info
```markdown
// ✅ GOOD - Critical info first
## Testing Wireframes
**Quick Start:** `./start-dev.sh` then `source /tmp/test-user-setup.sh`

**Expected Time:** 5 minutes

**Prerequisites:**
- Services running
- Test user credentials

// ❌ BAD - Details before quick start
## Testing Wireframes
This document explains the process of testing wireframes in the system...
[10 paragraphs of background]
...Finally, here's how to start: `./start-dev.sh`
```

---

## 📁 File & Scripts Naming Conventions

### Documentation Files - DO ✅
- Descriptive names: `TESTING_GUIDE.md`, `DATABASE_SCHEMA_FIXES.md`
- UPPERCASE for multi-word files
- Clear topic in name: `DOCUMENTATION_PLANNING.md` (not `DOCS.md`)

### Documentation Files - DON'T ❌
- Redundant names: Don't create `QUICK_TESTING_GUIDE.md` if `TESTING_GUIDE.md` exists
- Vague names: `INFO.md`, `GUIDE.md` (guide to what?)
- Version numbers: `TESTING_GUIDE_V2.md` (use one file, update it)

### Scripts Organization - NEW RULE ⭐
**All development scripts MUST be in `/scripts` folder**

- `start-*.sh` - Service startup scripts
- `test-*.sh` - Testing scripts
- `build*.sh` - Production build scripts
- `setup*.sh` - Project initialization scripts
- `scripts/README.md` - Document all scripts

**Don't:**
- ❌ Scatter scripts across project root
- ❌ Create `scripts/test/ui.sh` - keep flat structure
- ❌ Use vague names like `run.sh` or `go.sh`

**Do:**
- ✅ Keep all scripts in one `/scripts` folder
- ✅ Use clear, descriptive names
- ✅ Add usage comments at top of each script
- ✅ Link scripts from documentation
- ✅ Use symlinks for convenience if needed (e.g., `start-dev.sh` → `scripts/start-dev.sh`)

### Script Duplication Prevention - NEW RULE ⭐
**BEFORE creating a new shell script - Check for existing scripts with similar purposes**

**Current Scripts & Their Purposes:**
| Script | Purpose | When to Use | Frequency |
|--------|---------|------------|-----------|
| `setup.sh` | ONE-TIME initial project setup (install dependencies) | First time cloning project | Once |
| `start-dev.sh` | Service startup & restart (kill ports, start all services) | Before coding session begins | Every session |
| `test-ui.sh` | UI testing helper (show instructions, load test user) | Before UI testing | As needed |
| `test-api.sh` | API testing helper (load env vars, show curl examples) | Before API testing | As needed |
| `build.sh` | Production build (compile frontend/backend) | Before deployment | As needed |

**Prevention Checklist:**
- ❌ Don't create `restart-dev.sh` - use `start-dev.sh` instead
- ❌ Don't create `dev-setup.sh` - use `setup.sh` instead
- ❌ Don't create `run-tests.sh` - enhance existing `test-*.sh` instead
- ✅ Do modify existing scripts if you need new functionality
- ✅ Do document the distinction: setup = ONE-TIME, start-dev = EVERY SESSION

**If you need a new script:**
1. Check existing scripts first (see table above)
2. Verify the new purpose doesn't overlap with current scripts
3. Document it in `/scripts/README.md`
4. Add to `.claude/commands/COMMON_COMMANDS.md`
5. Only exception: genuinely new purpose (e.g., database migration script)

**See Also:** [PROJECT_CONTEXT.md Rule 4](./PROJECT_CONTEXT.md) for full script duplication prevention guidelines

---

## 🔗 Consolidation Checklist

**When consolidating docs (e.g., 5 testing files → 1):**

- [ ] Copy all content from each file
- [ ] Organize into new hierarchical structure
- [ ] Remove duplicate sections
- [ ] Add table of contents at top
- [ ] Link to new file in DOCUMENTATION_INDEX.md
- [ ] Update PROJECT_CONTEXT.md references
- [ ] Delete old duplicate files
- [ ] Search codebase for links to old files and update them

---

## 📋 Current Documentation Status (After Consolidation)

### .claude/ Folder Structure ✅
```
.claude/
├── PROJECT_CONTEXT.md (Main rules & config)
├── DOCUMENTATION_PLANNING.md (This file - rules for docs)
├── PROMPT_TEMPLATES.md (How to format requests)
├── TESTING_GUIDE.md (Consolidated: UI + API + E2E + wireframes)
├── TEST_USERS.md (Test credentials)
└── DATABASE_SCHEMA_FIXES.md (DB troubleshooting)
```

### Deleted (Consolidated) ✅
- ~~QUICK_TEST_GUIDE.md~~ → merged to TESTING_GUIDE.md
- ~~TESTING_CHECKLIST.md~~ → merged to TESTING_GUIDE.md
- ~~UI_TESTING_GUIDE.md~~ → merged to TESTING_GUIDE.md
- ~~WIREFRAME_TESTING_GUIDE.md~~ → merged to TESTING_GUIDE.md
- ~~STARTUP_GUIDE.md~~ → merged to TESTING_GUIDE.md

---

## 🎯 How to Use This Document

### Scenario 1: "Should I create a new .md file?"
1. Check "Documentation Structure" section above
2. Find the category (Testing? Troubleshooting? Setup?)
3. Check if that file already exists
4. If yes: Modify existing file
5. If no AND it's a new category: Create new file, name it clearly

### Scenario 2: "I need to add testing docs"
1. Add to `.claude/TESTING_GUIDE.md`
2. Follow conciseness best practices
3. Update table of contents
4. Link from DOCUMENTATION_INDEX.md

### Scenario 3: "Information is scattered across 3 files"
1. Create new consolidated file OR pick best existing file
2. Copy all relevant content
3. Reorganize hierarchically
4. Remove duplicates
5. Delete old files
6. Update all cross-references

---

## ✨ Pro Tips

1. **Keep DOCUMENTATION_INDEX.md updated** - It's the navigation hub
2. **Use search (Ctrl+F)** - Before creating new docs, search existing ones
3. **Version docs, not files** - One file per topic, update it over time
4. **Link liberally** - Reference other docs instead of duplicating content
5. **Concise = Maintainable** - Less text = easier to keep updated

---

## 📞 Examples

### Example 1: Adding new testing type
**Don't:** Create `MOBILE_TESTING_GUIDE.md`
**Do:** Add section to `.claude/TESTING_GUIDE.md` → `### Mobile Testing`

### Example 2: Need startup procedures
**Don't:** Create `STARTUP_GUIDE.md` (already in TESTING_GUIDE)
**Do:** Reference `TESTING_GUIDE.md → Step 0: Start Services`

### Example 3: New troubleshooting category
**Don't:** Create `API_TROUBLESHOOTING.md` AND `DB_TROUBLESHOOTING.md`
**Do:** Consolidate to `.claude/TROUBLESHOOTING_GUIDE.md` with sections

---

**Last Updated:** November 20, 2025
**Maintained By:** Claude Code
**Review Frequency:** After major documentation changes


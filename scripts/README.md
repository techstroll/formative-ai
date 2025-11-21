# 📜 Scripts Reference

All development and deployment scripts are organized in this folder for easy discovery and maintenance.

---

## 🚀 Quick Start Scripts

### `./start-dev.sh`
**Purpose:** Start all development services (backend, frontend, AI pipeline)

```bash
./scripts/start-dev.sh
# OR (symlink at root)
./start-dev.sh
```

**What it does:**
- Kills existing processes on ports 3000, 3001, 8000
- Starts backend (Express + TypeScript) on port 3001
- Starts frontend (Next.js) on port 3000 (or auto-increments to 3002+)
- Starts AI Pipeline (Python FastAPI) on port 8000

**Output:**
Shows access points for all services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health
- AI Pipeline: http://localhost:8000

---

## 🧪 Testing Scripts

### `./test-ui.sh`
**Purpose:** Start services and guide through UI testing

```bash
./scripts/test-ui.sh
```

**What it does:**
- Ensures services are running
- Shows browser URL to open
- Provides test user credentials
- Links to full testing guide

**Use when:** You want to test the web interface in a browser

---

### `./test-api.sh`
**Purpose:** Load test user environment and show API test commands

```bash
./scripts/test-api.sh
```

**What it does:**
- Loads test user credentials from `/tmp/test-user-setup.sh`
- Shows example curl commands for API testing
- Provides JWT token for authentication

**Use when:** You want to test API endpoints via curl or Postman

---

## 🏗️ Build & Setup Scripts

### `./setup.sh`
**Purpose:** Initial one-time project setup

```bash
./scripts/setup.sh
```

**What it does:**
- Checks Node.js and npm installation
- Installs backend dependencies
- Installs frontend dependencies
- Shows next steps

**Use when:** First time setting up the project

---

### `./build.sh`
**Purpose:** Build all services for production

```bash
./scripts/build.sh
```

**What it does:**
- Builds backend (TypeScript compilation)
- Builds frontend (Next.js production build)
- Shows build artifact locations

**Use when:** Preparing for deployment

---

## 📋 How to Use Scripts

### Run any script:
```bash
# From project root
./scripts/start-dev.sh
./scripts/test-ui.sh
./scripts/setup.sh

# Or use symlink (for start-dev.sh only)
./start-dev.sh
```

### Make script executable:
```bash
chmod +x scripts/script-name.sh
```

### View script contents:
```bash
cat scripts/script-name.sh
```

---

## 📝 Script Organization Guidelines

**When adding new scripts:**

1. **Place in /scripts folder** - Keep all scripts centralized
2. **Use clear names** - `test-ui.sh` not `tu.sh`
3. **Add usage comments** - Include purpose and usage at top
4. **Make executable** - `chmod +x scripts/new-script.sh`
5. **Document in README** - Update this file with new script info
6. **Link from docs** - Reference in TESTING_GUIDE.md, PROJECT_CONTEXT.md

**Script naming convention:**
- `start-*.sh` - Service startup
- `test-*.sh` - Testing procedures
- `build-*.sh` or `build.sh` - Production builds
- `setup*.sh` - Project initialization

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [.claude/TESTING_GUIDE.md](./../.claude/TESTING_GUIDE.md) | Complete testing procedures |
| [.claude/COMMON_COMMANDS.md](./../.claude/commands/COMMON_COMMANDS.md) | Organized command reference |
| [.claude/PROJECT_CONTEXT.md](./../.claude/PROJECT_CONTEXT.md) | Project rules and configuration |
| [.claude/DOCUMENTATION_PLANNING.md](./../.claude/DOCUMENTATION_PLANNING.md) | Documentation organization rules |

---

## ⚙️ Troubleshooting Scripts

### Script won't run
```bash
chmod +x scripts/script-name.sh
./scripts/script-name.sh
```

### Permission denied
```bash
chmod +x scripts/*.sh
```

### Port already in use
```bash
killall -9 node npm python3
./scripts/start-dev.sh
```

### Services won't start
Check logs: `tail -50 /tmp/start-dev.log`

---

**Last Updated:** November 20, 2025
**Maintained in:** `/scripts` folder
**See also:** `.claude/commands/COMMON_COMMANDS.md` for all commands


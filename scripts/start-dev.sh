#!/bin/bash

# Formative.AI Development Environment Startup Script
# This script kills any existing processes on the dev ports and starts all services

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
AI_PIPELINE_DIR="$PROJECT_ROOT/ai-pipeline"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║         Formative.AI Development Environment Startup           ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kill any existing processes on dev ports
echo -e "${YELLOW}Cleaning up existing processes on ports 3000, 3001, 8000...${NC}"

# Clear port 3000 first (Frontend MUST be on 3000)
lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true

# Clear port 3001 (Backend)
lsof -ti :3001 2>/dev/null | xargs kill -9 2>/dev/null || true

# Clear port 8000 (AI Pipeline)
lsof -ti :8000 2>/dev/null | xargs kill -9 2>/dev/null || true

sleep 2

echo -e "${GREEN}✅ Ports cleared${NC}"
echo ""

# Function to start service
start_service() {
  local SERVICE_NAME=$1
  local SERVICE_DIR=$2
  local COMMAND=$3
  local PORT=$4

  echo -e "${YELLOW}Starting $SERVICE_NAME on port $PORT...${NC}"
  cd "$SERVICE_DIR"
  eval "$COMMAND" &
  local PID=$!
  echo -e "${GREEN}✅ $SERVICE_NAME started (PID: $PID)${NC}"
  sleep 2
}

# Start all services
start_service "Backend" "$BACKEND_DIR" "npm run dev" "3001"
# Frontend MUST be on port 3000 - use explicit port binding with -p flag
start_service "Frontend" "$FRONTEND_DIR" "npm run dev -- -p 3000" "3000"
start_service "AI Pipeline" "$AI_PIPELINE_DIR" "python -m uvicorn src.main:app --reload --port 8000" "8000"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              All Services Started Successfully! 🚀              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Access Points:"
echo -e "  ${GREEN}Frontend:${NC}        http://localhost:3000"
echo -e "  ${GREEN}Backend API:${NC}     http://localhost:3001"
echo -e "  ${GREEN}Backend Root:${NC}    http://localhost:3001/"
echo -e "  ${GREEN}API Health:${NC}      http://localhost:3001/health"
echo -e "  ${GREEN}AI Pipeline:${NC}     http://localhost:8000"
echo -e "  ${GREEN}API Docs:${NC}        http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background processes
wait

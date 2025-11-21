#!/bin/bash

# Production Build Script
# Purpose: Build all services for production deployment
# Usage: ./scripts/build.sh

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🏗️  Building for Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build backend
echo "📦 Building backend..."
cd backend
npm run build 2>&1 | tail -20
echo "✅ Backend built"
echo ""

# Build frontend
echo "📦 Building frontend..."
cd ../frontend
npm run build 2>&1 | tail -20
echo "✅ Frontend built"
echo ""

cd "$PROJECT_ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Build complete!"
echo ""
echo "📁 Build artifacts:"
echo "   - Backend: backend/dist"
echo "   - Frontend: frontend/.next"
echo ""

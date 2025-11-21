#!/bin/bash

# Initial Project Setup Script
# Purpose: One-time setup for first-time developers
# Usage: ./scripts/setup.sh

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$PROJECT_ROOT"

echo "⚙️  Initial Project Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi
echo "✅ npm: $(npm --version)"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend dependencies
echo "   Backend..."
cd backend
npm install
cd ..
echo "   ✅ Backend dependencies installed"

# Frontend dependencies
echo "   Frontend..."
cd frontend
npm install
cd ..
echo "   ✅ Frontend dependencies installed"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: ./scripts/start-dev.sh"
echo "   2. Open: http://localhost:3000"
echo "   3. Sign in with test credentials (see .claude/TESTING_GUIDE.md)"
echo ""

#!/bin/bash

# UI Testing Wrapper
# Purpose: Start services and guide user through UI testing
# Usage: ./scripts/test-ui.sh

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧪 UI Testing Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if services are already running
if lsof -i :3001 >/dev/null 2>&1; then
  echo "⚠️  Services already running on port 3001"
  echo "Use existing services or stop them first:"
  echo "   killall -9 node npm python3"
  echo ""
else
  echo "🚀 Starting services..."
  cd "$PROJECT_ROOT"
  ./scripts/start-dev.sh &

  echo ""
  echo "⏳ Waiting for services to start (15 seconds)..."
  sleep 15
fi

echo ""
echo "✅ Services ready!"
echo ""
echo "📌 Next Steps:"
echo "   1. Open browser: http://localhost:3000"
echo "   2. Sign in with:"
echo "      Email: testuser@example.com"
echo "      Password: TestPassword123"
echo "   3. Follow .claude/TESTING_GUIDE.md → UI Testing section"
echo ""
echo "📖 Full guide: .claude/TESTING_GUIDE.md#-ui-testing"
echo ""

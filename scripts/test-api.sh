#!/bin/bash

# API Testing Wrapper
# Purpose: Set up test user environment and show API testing commands
# Usage: ./scripts/test-api.sh

set -e

echo "🔌 API Testing Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load test user variables
echo "📋 Loading test user credentials..."
source /tmp/test-user-setup.sh

echo ""
echo "✅ Test user loaded!"
echo ""

# Show quick commands
echo "📌 Quick API Test Commands:"
echo ""
echo "   # Check backend health:"
echo "   curl http://localhost:3001/health"
echo ""
echo "   # List research:"
echo "   curl -H \"Authorization: Bearer \$TOKEN\" \$API_BASE/research"
echo ""
echo "   # Create research:"
echo "   curl -X POST \$API_BASE/research \\"
echo "     -H \"Authorization: Bearer \$TOKEN\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"topic\":\"Test\",\"targetAudience\":\"Users\",\"geographicFocus\":\"Global\",\"competitors\":[]}'"
echo ""
echo "📖 Full guide: .claude/TESTING_GUIDE.md#-api-testing"
echo ""

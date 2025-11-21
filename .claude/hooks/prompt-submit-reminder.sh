#!/bin/bash
set -e

# UserPromptSubmit hook - Fires on EVERY user message
# Re-injects plugin selection reminder at each task boundary to prevent mid-execution forgetting

# Read JSON input from stdin
INPUT=$(cat)

# Extract user message (optional - could use for filtering)
USER_MESSAGE=$(echo "$INPUT" | jq -r '.user_message // empty')

# Output JSON with additionalContext that Claude will see
cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "⚠️ TASK BOUNDARY CHECK ⚠️\n\nIf this user message requests Write, Edit, or Skill work:\n\n1️⃣  Check PROMPT_REFINEMENT_LAYER_IMPLEMENTATION.md Quick Plugin Selection Reference (line 449-458)\n2️⃣  Identify task type: Bug fix, Feature (Frontend/Backend), Documentation, Multi-agent, etc.\n3️⃣  Select plugin if applicable:\n    • frontend-design → UI components, pages, wireframe canvas\n    • feature-dev → Feature planning, backend logic\n    • agent-sdk-dev → Multi-agent systems, Phase 3 work\n    • explanatory-output-style → Technical docs, architecture\n    • learning-output-style → Tutorials, onboarding\n    • plugin-dev → Custom plugins/hooks\n4️⃣  Build structured prompt showing Template + Plugin selection\n5️⃣  Ask user: 'Should I invoke [plugin] and proceed?'\n6️⃣  WAIT for confirmation before using Write/Edit/Skill tools\n\n⚠️ CRITICAL: Documentation tasks (\"document\", \"write docs\", \"create guide\") MUST use explanatory-output-style or learning-output-style.\n\n⚠️ Mid-execution tasks still count as NEW tasks requiring plugin check!"
  }
}
EOF

exit 0

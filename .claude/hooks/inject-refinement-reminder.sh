#!/bin/bash
set -e

# SessionStart hook that injects plugin selection reminder into Claude's context
# This ensures Claude checks PROMPT_REFINEMENT_LAYER_IMPLEMENTATION.md before using Write/Edit/Skill tools

# Read JSON input from stdin (required for hooks)
INPUT=$(cat)

# Output JSON with additionalContext that Claude will see
cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "⚠️ CRITICAL REMINDER: Plugin Selection Required Before Write/Edit/Skill Tools ⚠️\n\nBefore using Write, Edit, or Skill tools, you MUST check .claude/PROMPT_REFINEMENT_LAYER_IMPLEMENTATION.md for plugin selection requirements.\n\n📍 Quick Plugin Selection Reference: Line 449-458\n\nREQUIRED WORKFLOW BEFORE ANY WRITE/EDIT/SKILL:\n1️⃣  Identify the task type (Bug fix, Feature, Test, Documentation, etc.)\n2️⃣  Check Quick Plugin Selection Reference table (line 449-458)\n3️⃣  Select appropriate plugin if task matches:\n    • frontend-design → UI components, pages, wireframe canvas\n    • feature-dev → Feature planning, backend logic, Phase 2-4 work\n    • agent-sdk-dev → Multi-agent systems, Phase 3 autonomous agents\n    • explanatory-output-style → Technical documentation, architecture docs\n    • learning-output-style → Tutorials, onboarding materials\n    • plugin-dev → Custom plugins, hooks, slash commands\n4️⃣  Build structured prompt showing: Template + Plugin + Context + Files\n5️⃣  Ask user: 'Should I invoke [plugin] and proceed?'\n6️⃣  Wait for confirmation BEFORE using Write/Edit/Skill tools\n\nWhen NOT to use plugins (line 460-464):\n• Bug fixes (unless UI bug → frontend-design)\n• Server management (use PORT_MANAGEMENT_CHECKLIST.md)\n• Quick file edits (Template 5 sufficient)\n• Testing (use TESTING_GUIDE.md)\n\nRelated files to check:\n• .claude/settings.json → CRITICAL_PRIORITY_RULES section\n• .claude/PROJECT_CONTEXT.md → Rules and context\n• .claude/PROMPT_TEMPLATES.md → Templates by task type\n\n💡 This reminder is injected at SessionStart to ensure you never skip plugin selection!\n\n⚠️ IMPORTANT: Even when continuing work mid-session or executing todos, treat each new user request as a \"task\" requiring this workflow. Documentation tasks MUST use explanatory-output-style or learning-output-style skills."
  }
}
EOF

exit 0

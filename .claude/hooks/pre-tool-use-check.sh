#!/bin/bash
set -e

# PreToolUse hook - Fires BEFORE Write, Edit, or Skill tools execute
# Final enforcement layer: Asks user to confirm plugin selection was checked

# Read JSON input from stdin
INPUT=$(cat)

# Extract tool information
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // "N/A"')
SKILL_NAME=$(echo "$INPUT" | jq -r '.tool_input.skill // "N/A"')

# Determine what's being done
if [ "$TOOL_NAME" == "Skill" ]; then
  TOOL_CONTEXT="invoking skill: $SKILL_NAME"
elif [ "$TOOL_NAME" == "Write" ] || [ "$TOOL_NAME" == "Edit" ]; then
  TOOL_CONTEXT="modifying file: $FILE_PATH"
else
  TOOL_CONTEXT="using tool: $TOOL_NAME"
fi

# Ask user for confirmation before proceeding
cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "⚠️ PLUGIN SELECTION CHECK ⚠️\n\nAbout to use $TOOL_NAME tool ($TOOL_CONTEXT).\n\nBefore proceeding, confirm:\n✓ Did you check PROMPT_REFINEMENT_LAYER_IMPLEMENTATION.md Quick Plugin Selection Reference (line 449-458)?\n✓ Was the appropriate plugin selected for this task?\n✓ If this is documentation work, was explanatory-output-style or learning-output-style invoked?\n✓ If this is frontend work, was frontend-design considered?\n✓ If this is feature planning, was feature-dev considered?\n\nProceed with $TOOL_NAME?"
  }
}
EOF

exit 0

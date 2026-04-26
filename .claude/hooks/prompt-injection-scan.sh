#!/usr/bin/env bash
# Reject Bash commands that look like prompt-injection / exfiltration patterns.
set -u
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); print((d.get('tool_input') or {}).get('command',''))" 2>/dev/null || true)
echo "$CMD" | grep -E -q "(curl|wget).*(pastebin|ngrok|transfer\.sh|webhook\.site)" && {
  echo "INJECTION GUARD: suspicious egress to ephemeral host blocked." >&2; exit 2; }
echo "$CMD" | grep -E -q "echo .*\$ANTHROPIC_API_KEY|cat .*\.env" && {
  echo "INJECTION GUARD: refusing to print secrets." >&2; exit 2; }
exit 0

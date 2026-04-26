#!/usr/bin/env bash
# Block writes that would leak PII column values into source.
# Triggers on PreToolUse for Edit/Write.
set -u
INPUT=$(cat)
CONTENT=$(printf '%s' "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); ti=d.get('tool_input',{}); print((ti.get('content') or '')+'\n'+(ti.get('new_string') or ''))" 2>/dev/null || true)
if printf '%s' "$CONTENT" | grep -E -q "(PRTY_FULL_NM|PRTY_SHRT_NM|DOB_DT|TAX_RESID_CD)\\s*[:=]\\s*['\"][A-Za-z0-9]" ; then
  echo "PII GUARD: refusing to write apparent PII values to source. Mask with '***' or move to a sealed fixture." >&2
  exit 2
fi
exit 0

#!/usr/bin/env bash
# Before context compaction, snapshot key state so the next session can resume.
set -u
mkdir -p .claude/state
{
  echo "## Snapshot $(date -u +%FT%TZ)"
  echo
  echo "### Recent commits"
  git log --oneline -10 2>/dev/null || true
  echo
  echo "### Generated artifacts"
  ls -1 sql_teradata/*.gen.sql sql_dbt_gen/*.sql gx/*.gen.json soda/*.gen.yml sql_bteq/*.gen.sql 2>/dev/null | head -40 || true
} > .claude/state/last-snapshot.md
exit 0

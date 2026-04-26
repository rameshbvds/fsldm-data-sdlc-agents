---
name: release-checklist
description: Pre-merge / pre-release gate. Runs the full CI suite locally, audits PII handling, and produces a go/no-go verdict.
disable-model-invocation: true
allowed-tools: Bash(make:*), Bash(git:*), Read, Grep
effort: high
---

Production release gate. ABORT if any step fails.

1. Working tree clean? `git status --porcelain` empty.
2. `make typecheck`
3. `make test`
4. `make lint-sql`
5. `make run` (ensures pipeline still produces artifacts end-to-end)
6. PII audit: `grep -RIn --include='*.gen.*' -E 'PRTY_FULL_NM|DOB_DT|PRTY_SHRT_NM' sql_* gx soda sql_bteq` — must show only commented references.
7. Subagent: invoke `data-reviewer` over the diff since `origin/main`.
8. Show last 5 commits, request explicit user approval.
9. Print verdict: `READY_TO_SHIP` or `BLOCKED: <reasons>`.

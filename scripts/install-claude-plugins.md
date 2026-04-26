# Install recommended Claude Code plugins

Run these inside a Claude Code session (`claude` in the project root).

## 1. UI/UX Pro Max — design-intelligence skill
*Useful when this project gets a frontend / dashboards layer. Skip otherwise.*

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

## 2. GStack — Garry Tan's 23-tool engineering stack
*Provides `/codex` (cross-model second opinion), `/careful`, `/freeze`, `/guard` —
production-grade safety + review. Recommended at user scope.*

```
/plugin marketplace add garrytan/gstack
/plugin install gstack@gstack
```

After install, the most useful commands for this project:
- `/codex` — independent code review from a non-Claude model (great for SQL correctness)
- `/careful` — block destructive ops (rm -rf, DROP TABLE, force-push)
- `/guard` — `/careful` + `/freeze` for prod work
- `/setup-deploy` — one-time deploy configurator

## 3. GBrain — opinionated agent brain (OPTIONAL — not Claude Code)

GBrain is **not a Claude Code plugin**. It is a separate company-knowledge agent that runs on
its own infrastructure (Render or Railway), with a Postgres/Supabase backend, and ingests
Gmail / Twitter / Calendar / Twilio voice. It is designed to be installed by an OpenClaw or
Hermes agent, not by Claude Code.

If you decide you want it for cross-project knowledge (not for THIS data-warehouse pipeline),
follow: <https://github.com/garrytan/gbrain> and the recipes in their repo. Plan ~30 min and
expect ~$8–$25/mo in hosting costs.

GStack ships a `/setup-gbrain` command to wire GBrain into Claude Code via MCP if you have it
running.

---

## Why user-scope, not project-scope?

The Claude Code Power-User playbook (April 2026) §10 recommends installing widely-applicable
tooling at **user scope** so it's available everywhere, while keeping each project's `.claude/`
focused on its domain. Our project-scope `.claude/` is intentionally minimal: 5 subagents and
5 skills, all FSLDM-specific. Mixing in CEO/Designer/UI agents would dilute Claude's context
and confuse routing.

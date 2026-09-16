---
description: Review and validate changes before forwarding
agent: build
---

Use `$sac-nexus-preflight-review` to perform a critical review of the current
changes before this branch moves to review, QA, staging, production, commit,
push, or PR creation.

Read the governing `AGENTS.md` files and let the skill remain the source of
truth for inspection, safety, verification, documentation decisions, Codex
review policy, and output format.

Run in review-only mode. Do not modify, stage, commit, push, open a PR, merge,
deploy, roll back, or delete branches unless the user explicitly authorizes the
next action.

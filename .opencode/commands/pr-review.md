---
description: Triage current PR feedback and address valid findings
agent: build
---

Use `$sac-nexus-pr-review-triage` to inspect the current feature PR, classify
every distinct review item with evidence, and handle threads according to the
skill.

Read the governing `AGENTS.md` files and let the skill remain the source of
truth for applicability, safety, classification, review-cycle limits,
verification, documentation decisions, thread handling, and output format.

Fix findings only when the user requested fix mode. Do not commit, push, amend,
force-push, merge, close the PR, dismiss reviews, or delete branches without
explicit authorization.

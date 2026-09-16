---
name: aidlc
description: Use when the user says "Using AI-DLC", "AI-DLC", "AIDLC", or asks to run the AI-Driven Development Life Cycle workflow in OpenCode. Activates the vendored AWS AI-DLC v2 workflow adapter.
---

# AI-DLC v2 Workflow

Use this skill to run the AWS AI-DLC v2 workflow in OpenCode.

The project vendors AI-DLC v2 under `.aidlc/aidlc-v2/` from the upstream `v2` branch.

## Activation

When invoked:

1. Treat `.aidlc/aidlc-v2/` as the AI-DLC install root.
2. Read `.aidlc/aidlc-v2/skills/aidlc-orchestrator/SKILL.md` first.
3. Read `.aidlc/aidlc-v2/aidlc-common/protocols/aidlc-orchestrator-protocol.md` as the orchestration source of truth.
4. Resolve `skills/...` references from `.aidlc/aidlc-v2/skills/...`.
5. Resolve `aidlc-common/...` references from `.aidlc/aidlc-v2/aidlc-common/...`.
6. Preserve the project rules in `AGENTS.md` when they are more specific than generic AI-DLC guidance.
7. Keep user-facing UI labels and copy in Brazilian Portuguese, as required by this project.

## OpenCode Adapter Rules

AI-DLC v2 is currently packaged for Kiro. In OpenCode, adapt Kiro concepts as follows:

1. When the orchestrator protocol says `invokeSubAgent` with `aidlc-builder-agent`, launch an OpenCode general-purpose subagent and pass the builder protocol, active skill `SKILL.md`, validation spec, inputs, current step, and output paths exactly as required by the orchestrator protocol.
2. When the orchestrator protocol says `invokeSubAgent` with `aidlc-validator-agent`, launch an OpenCode general-purpose subagent and pass the validator protocol, validation spec, artifact paths, question file path, output directory, and scripts directory exactly as required by the orchestrator protocol.
3. Kiro hooks under `.aidlc/aidlc-v2/hooks/` are reference material only. They do not run automatically in OpenCode.
4. After every builder or validator subagent invocation, run the process checker exactly as the orchestrator protocol requires:

```bash
node .aidlc/aidlc-v2/aidlc-common/scripts/aidlc-process-checker.js --from-state <intent-dir>/state/process-checkpoint.json
```

5. Do not advance to the next step unless the process checker passes, except for the documented `intent-bootstrap` bootstrap exception.
6. Ask for human approval before major phase transitions, proposed workflows, execution plans, architecture decisions, code changes, deployment changes, and security-sensitive changes.
7. Follow AI-DLC v2's artifact location convention from its orchestrator protocol unless the user explicitly requests another location.

Do not use the removed AI-DLC v0.1.x rule layout. Do not assume Kiro, Amazon Q, Cursor, Cline, Claude Code, or Copilot-specific behavior exists in OpenCode unless this adapter explicitly maps it.

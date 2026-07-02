---
name: inngest
description: Router for official Inngest agent skills. Use when you are unsure which specific Inngest skill applies.
---

# Inngest Skill Router

This repository vendors official Inngest agent skills for integration work.
Use this router only to choose the specific skill to load next.

## This Repository

- Inngest is currently planned or referenced in this repo, not an app runtime
  dependency.
- Do not add runtime packages, app code, migrations, or `INNGEST_*` env vars
  unless the user explicitly asks for product Inngest integration and the work
  has its own OpenSpec scope.
- Inngest skills are subordinate to OpenSpec, root `AGENTS.md`, repo rulebooks,
  framework docs, and runtime evidence.

## Route by Task

- Existing workflow or background-job audit before changes:
  `docs/ai/skills/inngest-brownfield-audit/SKILL.md`
- New product runtime setup:
  `docs/ai/skills/inngest-setup/SKILL.md`
- Events and schemas:
  `docs/ai/skills/inngest-events/SKILL.md`
- Durable functions:
  `docs/ai/skills/inngest-durable-functions/SKILL.md`
- Step design and `step.*` usage:
  `docs/ai/skills/inngest-steps/SKILL.md`
- Concurrency, throttling, retries, cancellation, or batching:
  `docs/ai/skills/inngest-flow-control/SKILL.md`
- Middleware:
  `docs/ai/skills/inngest-middleware/SKILL.md`
- Realtime:
  `docs/ai/skills/inngest-realtime/SKILL.md`
- Durable AI agent workflows:
  `docs/ai/skills/inngest-agents/SKILL.md`
- Existing v3 to v4 migration only:
  `docs/ai/skills/inngest-v3-v4-migration/SKILL.md`
- Inngest API or CLI operations:
  `docs/ai/skills/inngest-api/SKILL.md`

## Checklist

- [ ] Confirm whether the repo already has Inngest runtime code.
- [ ] Load the most specific official Inngest skill for the task.
- [ ] Keep product runtime adoption out of agent-tooling-only changes.
- [ ] Use the Inngest dev-server MCP only when the dev server is running and
      the configured port matches the active server.

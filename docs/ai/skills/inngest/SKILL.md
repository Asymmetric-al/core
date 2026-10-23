---
name: inngest
description: Router for official Inngest agent skills. Use when you are unsure which specific Inngest skill applies.
---

# Inngest Skill Router

This repository vendors official Inngest agent skills for integration work.
Use this router only to choose the specific skill to load next.

## This Repository

- Core already uses Inngest as a runtime dependency in `packages/api/package.json`.
  The owned client is `packages/api/src/workflows/inngest/client.ts`; registered
  handlers live in `packages/api/src/workflows/serve.ts` and are exposed through
  the thin `apps/admin/app/api/inngest/route.ts` route.
- Audit those existing workflows before changing runtime behavior. Follow
  `docs/guides/features/inngest-workflows/local-development.md` for local setup
  and durability limits; installed runtime code does not prove live Cloud
  qualification.
- Keep new runtime adoption, provider provisioning, migrations and `INNGEST_*`
  environment changes out of agent-tooling-only changes. Product runtime changes
  require the user's task scope and the relevant OpenSpec change.
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
- Inngest CLI API operations (`npx inngest-cli@latest api`):
  `docs/ai/skills/inngest-api-cli/SKILL.md`
- Raw Inngest REST API v2, OpenAPI, or HTTP:
  `docs/ai/skills/inngest-api/SKILL.md`

## Checklist

- [ ] Inspect Core's existing client, registered functions and thin serving route.
- [ ] Load the most specific official Inngest skill for the task.
- [ ] Keep product runtime adoption out of agent-tooling-only changes.
- [ ] Use the Inngest dev-server MCP only when the dev server is running and
      the configured port matches the active server.

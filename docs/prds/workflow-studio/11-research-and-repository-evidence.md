# 12. Research and repository evidence

**Checked:** 2026-09-12. **Repository baseline:** `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Sources support factual descriptions; proposed architecture, limits, defaults, UX and tests are design decisions, not vendor guarantees.

## Reading the evidence

Current repo reality is determined by source/migrations/tests/runtime, not roadmap prose. This research read repository content through the connected GitHub tool; it did not run the application, inspect production tenant data, or execute repository CI. Official web documents were read directly. No unsupported competitor statistics are used.

## R1 — Core repository constitution

**Type:** Repository snapshot. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/AGENTS.md
Current package ownership, UI base-maia/Base UI requirement, source authority and verification rules.

## R2 — OpenSpec project index and workflow rule

**Type:** Repository snapshot. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/project.md
Proposed changes are not shipped behavior; use pinned CLI and do not archive unimplemented work. See also docs/ai/rules/openspec.md and openspec/config.yaml.

## R3 — Workflow orchestration capability

**Type:** Repository snapshot. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/workflow-orchestration/spec.md
Postgres/source ownership, shared execution infrastructure, identifier-only events, claims, dispatch ledger and tenant-scoped recovery.

## R4 — SiteStacker parity roadmap: workflow and source boundaries

**Type:** Repository snapshot. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md
Phase 34/35 scope, source ownership, dependencies and protected financial/records boundaries; roadmap depth is not implementation evidence.

## R5 — Platform surfaces

**Type:** Repository snapshot. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/platform-surfaces/spec.md
Mission Control owns operational depth; other surfaces expose role-appropriate shared records; applicant-mode addition needs explicit intent.

## R6 — API package manifest

**Type:** Repository snapshot. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/package.json
Inspected snapshot pins Inngest 4.5.1 and exports existing workflow/API modules. This is not a claim that it is the latest published SDK.

## R7 — Current narrow automation schema and runtime

**Type:** Repository snapshot. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/mission-control-automations/schemas.ts
Existing condition/action vocabulary is contribution-oriented. Related inspected files include packages/api/src/workflows/events.ts, serve.ts and recovery.ts.

## R8 — Workflow Kit README

**Type:** Official source repository. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://github.com/inngest/workflow-kit/blob/main/README.md
Describes itself as reference implementation and recommends designing your own implementation. Apache-2.0 reference, not an MIT core dependency.

## S01 — Inngest user-defined workflows and Workflow Kit

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/guides/user-defined-workflows
Useful action-registry/configuration example; see also https://www.inngest.com/docs/reference/workflow-kit. A demo is not an end-to-end tenant workflow product.

## S02 — Inngest TypeScript SDK v4

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/reference/typescript/intro
Current reference describes v4 APIs, schema validation, logging and execution optimizations. Implement against the pinned installed release.

## S03 — Inngest concurrency

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/guides/concurrency
Limits active steps; keyed fairness is best-effort. It does not replace database locking or source authorization.

## S04 — Inngest usage limits

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/usage-limits/inngest
Plan-dependent run duration/trace retention and bounded steps/state. Verify selected plan rather than hard-coding vendor capacity into business lifetime.

## S05 — Inngest idempotency

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/guides/handling-idempotency
Provider deduplication is finite and supplements permanent product effect identities.

## S06 — Resend idempotency keys

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://resend.com/docs/dashboard/emails/idempotency-keys
Keys are retained for 24 hours; durable business identities and uncertainty handling must live with product owners.

## S07 — Inngest wait for event

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event
Documents listener-start race and losing-wait behavior. Core uses durable source checks independently of listener behavior.

## S08 — Inngest throttling

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/guides/throttling
Queues excess function starts; distinguish from rate limiting that may skip excess work.

## S09 — Resend webhooks

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://resend.com/docs/webhooks/introduction
Verify, persist and deduplicate provider events; ordering and delivery do not supply application approval evidence.

## S10 — React Flow accessibility

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://reactflow.dev/learn/advanced-use/accessibility
Keyboard and screen-reader facilities are available. Full product accessibility still requires custom-component and participant-flow testing.

## S11 — React Flow performance

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://reactflow.dev/learn/advanced-use/performance
Use stable components/callbacks and selective state subscription; qualify real graph complexity.

## S12 — Zapier Paths

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://help.zapier.com/hc/en-us/articles/8496288555917-Add-branching-logic-to-Zap-workflows-with-Paths
Inspiration for guided branching; Core chooses explicit exclusive and parallel semantics rather than importing behavior implicitly.

## S13 — OWASP Authorization Cheat Sheet

**Type:** Primary security guidance. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
Deny by default, validate permissions for every request, and test authorization boundaries.

## S14 — PostgreSQL row security

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
RLS policies and privileged bypass behavior. Current URL resolves to PostgreSQL 18 documentation; this is not a claim Core runs version 18.

## S15 — WCAG 2.2

**Type:** W3C Recommendation. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.w3.org/TR/WCAG22/
Accessibility target for the complete product, not a claim of existing compliance.

## S16 — n8n flow logic

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://docs.n8n.io/flow-logic
Inspiration for flow vocabulary; n8n is not embedded or used as Core execution authority.

## S17 — Inngest function versioning

**Type:** Official docs. **Retrieved/reviewed:** 2026-09-12.

**Source:** https://www.inngest.com/docs/learn/versioning
Step memoization and code evolution differ from business-definition and source-action versioning.

## Important current-document distinctions

The Inngest usage-limit page lists an event lookback allowance while the wait-for-event guide discusses a future lookback feature. This specification does not infer an available API or reliable retrospective delivery from either statement; the exact SDK capability must be tested. Durable source fact rechecks remain required regardless.

Workflow Kit documentation offers an installable package, while its current source README calls it a reference implementation. The recommendation follows the latter qualification: learn from the patterns, own the production dialect/compiler, and use current Inngest SDK guidance.

Provider plans, prices, region support, contractual data handling, and exact deployment characteristics were not verified for the user’s account. Their certification is an explicit release gate, not an assumption. No price or universal service-level promise is embedded in the spec.

This chapter records September 12 research. The September 22 integration adopts the supplied program intent through the active planning change; it does not archive the change, prove runtime or grant applicant authorization. Private participant admission remains an exact Phase 4/12 compatibility gate and application My Journey belongs to Phase 41.

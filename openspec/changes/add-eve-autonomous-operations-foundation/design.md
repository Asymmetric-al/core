# Design & ADR-0001: Eve Autonomous Operations — autonomy model and guardrails

> This `design.md` doubles as the **initial autonomy ADR** required by issue #417 (PRD "one initial
> ADR covering Eve autonomy"). When accepted into `Asymmetric-al/core`, its ADR body should also be
> landed at the repo's ADR location (confirm the repo convention — the PRDs live under
> `docs/prds/eve-autonomous-operations/`; an ADR home such as `docs/adr/` or a PRD-adjacent ADR file
> should be chosen by the maintainers). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Status

Proposed (partner draft for #417). Supersedes nothing. Subordinate to OpenSpec and `AGENTS.md`.
[VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Context

The repo already has a strong instruction system, OpenSpec governance, Mission Control, Supabase,
GitHub workflows, and validation gates, but those pieces "do not yet form one durable, observable AI
operating system." The owner wants Eve to become a live autonomous operator that can review,
initiate, coordinate, remember, notify, and act — without weakening tenant isolation, product
intent, money integrity, permission correctness, auditability, or production safety. That tension is
exactly why autonomy must be established as a stated decision + spec before code.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

The `platform-boundaries` spec already makes sensitive operations server-side-only and treats tenant
isolation as a non-negotiable structural boundary; Eve autonomy must inherit, not erode, those
contracts. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Decision

1. **Spec-first, ADR-of-record.** Eve's autonomy contract is defined in the `eve-autonomous-operations`
   OpenSpec capability (this change's spec delta) and recorded in this ADR before any runtime code.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
2. **One release switch, phased delivery, disabled by default.** Delivery is phased across #418–#437,
   but activation is a single controlled release switch that stays off until governance, auth, audit,
   evals, protected-area policy, kill switches, and rollback are verified.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
3. **Layered source-of-truth.** OpenSpec + repo instructions > runtime/CI/eval reality > official
   docs > memory (never authoritative); `AGENTS.md` and OpenSpec outrank memory and provider plugins.
   [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
4. **Identity & accountability.** Admin UI actions act as the signed-in admin (tenant/role/audit from
   verified session); background/system work uses a service identity with explicit initiator
   metadata; GitHub actions run through a bot identity while recording the accountable human/trigger.
   Tenant/user identity is always derived from verified session context, never from prompt/model/tool
   input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
5. **Protected areas + production-write limits.** Auto-merge is blocked on protected areas; broad
   business-data writes are blocked without stricter approval; only operational records are writable
   under policy. The protected-area set is the enriched list in the spec delta (adds package/
   dependency/runtime changes, Eve config, admin access control, tenant resolution beyond the intake
   baseline). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
6. **Model policy.** Gateway-primary, role-based, per-subagent, eval-gated, rollback-protected, hard
   budgets with audited override; a partner GPU endpoint is only a proposed provider/role/fallback.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
7. **Governance data model at spec level now, implementation later (#418+).** Covers release/kill
   switch state, audit, approvals, model policy, budgets, notifications, run summaries, shared-run
   context, private admin memory, retention (180-day default, incident/legal holds override).
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Rollout order (governance-first)

Per the PRD's PR sequence: (1) OpenSpec/ADR/governance-data-model-spec/rollout/verification contract
→ (2) Supabase governance schema → (3) admin operations workspace + memory/model-policy/audit/
budgets/kill-switches → (4) standalone Eve runtime + model-policy integration + eval harness +
sandbox → (5) admin mount + global panel → (6) GitHub operator + PR review/ops + protected-area +
strict auto-merge → (7) subagents + shared run context + dynamic workflows + evals → (8) memory
auto-save + notifications + schedules + retention jobs + final release switch. Maps to issues
#417→#437. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Verification contract

- OpenSpec validates (`bunx @fission-ai/openspec@latest validate --all`) before runtime work.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required: `format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`; plus data-boundary
  verification. [VERIFIED-REPO: docs/ai/rules/general.md] [VERIFIED-REPO: docs/ai/rules/backend.md]
- The admin mount (#428) must prove compatibility with the installed Next.js version — currently
  `next@16.2.6`, NOT 16.3 — or explicitly block on a stable 16.3 rollout.
  [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- Eve uses the upstream `eve` framework and MUST read the installed Eve docs (`node_modules/eve/docs/`)
  after the package is added; runtime coding must not depend on memory of upstream APIs. (Note: `eve`
  is NOT yet a repo dependency at `25ca4a2`.) [VERIFIED-REPO: docs/ai/skills/eve/SKILL.md]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Consequences

- Positive: a stated, auditable contract; later slices build on it; autonomy is bounded and reversible.
- Cost: front-loaded spec/ADR effort before any running code; requires maintainer acceptance of the
  autonomy model.
- Risk if skipped: autonomy logic drifts into ad hoc prompts and review comments, weakening the very
  boundaries the PRD protects. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Alternatives considered

- **Runtime-first tracer bullet, spec later.** Rejected: the PRD explicitly forbids runtime code
  outrunning the spec/ADR. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **Skills instead of subagents/governance spec.** Rejected for the foundation: the PRD requires real
  governance data model and subagents; skills alone cannot encode approval/budget/kill-switch state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Out of scope (this change)

Runtime, schema, admin UI, GitHub automation, model-policy implementation, and any autonomous
money/identity/tenant/secret/migration writes — all deferred to later slices. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

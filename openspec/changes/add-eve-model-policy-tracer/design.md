# Design (provisional Eve label EVE-DESIGN-0006): Eve Model Policy

> **Numbering:** `EVE-DESIGN-0006` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0006**, the shared-model-policy decision required by issue #421. It builds
> on **ADR-0019** (#418, `add-eve-governance-kernel-release-switch`), **EVE-DESIGN-0003** (#419,
> `add-eve-audit-tracer-bullet`), and **EVE-DESIGN-0004** (#420, `add-eve-kill-switch-control-path`), all of which
> build on **ADR-0018** (#417, `openspec/specs/eve-autonomous-operations/spec.md`), and does not restate them — it
> operationalizes the shared model-policy capability whose changes the #420 kill switch can revoke and whose
> activation is #419-audited and eval-gated. When accepted into `Asymmetric-al/core`, its ADR body should also
> be landed at the repo's ADR location (using the next available canonical number per `docs/adr/README.md`). Every grounded claim carries a
> `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit `d14a2434` on 2026-07-02.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:102]

## Status

Proposed (partner draft for #421). Supersedes nothing. Builds on ADR-0019 (#418), EVE-DESIGN-0003 (#419), and
EVE-DESIGN-0004 (#420). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 5 (#421, "Model Policy Tracer Bullet") as an **AFK** slice **blocked by
slices 2, 3, and 4** — the governance kernel (#418), audit tracer (#419), and kill-switch control path (#420)
— and covering user stories 36–43 and 46. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:105]
What it must prove is that "authorized admins can draft, evaluate,
activate, and roll back a model policy change **without touching Eve runtime code**," with acceptance that the
"shared model policy supports named roles, Gateway-primary routing, direct provider fallback eligibility,
budgets, and per-subagent overrides," that "a dedicated AI settings permission gates edits," and that
"activation is eval-gated and rollback-capable." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:102]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:106]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:110]

The platform constraints already fix the shape: the "shared model policy uses Vercel AI Gateway as the primary
route and direct providers as controlled fallbacks"; it "uses named roles and per-subagent settings rather
than a single hard-coded model"; edits need "a dedicated AI settings permission"; changes are "draftable,
eval-gated, activatable, audited, and rollback protected"; "hard budgets and rate limits apply to roles,
subagents, dynamic workflows, evals, judge models, and expensive features" with an override that "requires
permission and audit"; and each subagent "may have its own model role, reasoning setting, fallback, budget,
eval gate." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:471]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:474]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:477]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:483]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:493]

The `platform-boundaries` spec already makes sensitive operations server-side-only and treats tenant isolation
as a structural boundary; the model policy inherits those contracts — a policy edit is a sensitive,
permissioned, server-side operation, and the policy adds restrictions (budgets, eval gates, kill-switch
consumption), never relaxations. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

**Partner-boundary note.** The fleet operates a shared GPU inference gateway. Under US-41 that gateway is a
"direct provider," and the constraint is explicit that direct providers are **controlled fallbacks**, not the
primary route. This ADR therefore specifies the fallback path so that any such gateway is a **proposed,
non-default, eval-gated, instantly-revocable** fallback rather than a hardcoded route — the exact posture the
constraint mandates. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]

## Decision

1. **Named roles, not hard-coded models.** The shared policy expresses model choice as named roles with
   per-subagent overrides, one platform policy in v1 with schema room for later tenant overrides. Callers
   resolve models through roles, so a policy edit re-routes every caller without code changes.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:471]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:480]
2. **Gateway-primary; direct providers are controlled, non-default fallbacks.** The Vercel AI Gateway is the
   primary route. A direct provider (including a partner GPU gateway) is eligible only when explicitly
   configured and eval-passed, is never the default, and is revocable at any time — by policy edit or the #420
   model-policy kill switch — without runtime code changes. It never activates implicitly by prompt/model/tool
   input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]
3. **A dedicated AI-settings permission gates edits.** Editing is a verified-human action from Mission Control
   under a permission distinct from general admin; it is never selectable by prompt, model output, or tool
   input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:197]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:474]
4. **Draft → eval → activate → rollback, all audited.** A change is drafted, evaluated against an eval gate,
   activated only if the gate passes, and rollback-capable to the prior policy; every draft, activation,
   rollback, and emergency override emits a #419 audit record. This is the "eval-gated and rollback protected"
   acceptance and the reason #421 is blocked by #419. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:477]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:113]
5. **Hard budgets and rate limits with audited emergency override.** Budgets and rate limits apply per
   role/subagent/workflow/eval/judge; an emergency override requires the dedicated permission and is audited.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:483]
6. **Judge models are configured separately from agent models**, so eval quality is measured independently of
   the model under test. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:213]
7. **Consumes kill-switch state; subordinate to #417/#418; grants no new authority.** Model-policy drafting,
   activation, and provider changes read the persisted #420 model-policy-changes switch state and block when it
   (or the master pause) forbids them — never satisfiable by a prompt/model/tool claim. The capability only
   adds a governed surface; a cleared switch never bypasses #417 protected-area/approval limits or #418
   emergency-off precedence. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:185]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract, protected-area set, and governance data model
  at spec level. #421 is subordinate to it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:104]
- **#418 (ADR-0019, governance kernel):** owns the release/kill-switch **state** and the single consult gate.
  #421 consumes the model-policy switch state; it does not persist or own it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:465]
- **#419 (EVE-DESIGN-0003, audit tracer):** owns the **audit-record shape**. #421 requires that each policy
  draft/activation/rollback/override emits one; it does not redefine the record.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:84]
- **#420 (EVE-DESIGN-0004, kill-switch):** owns the **model-policy-changes switch** as one of its per-domain controls.
  #421 owns the policy that switch revokes. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:97]
- **#421 (this change):** owns the **model-policy capability** — named roles, Gateway-primary routing,
  controlled non-default direct-provider fallbacks, permissioned eval-gated rollback-capable edits, per-role
  budgets, and separate judge models.
- **#433 (subagent catalog):** owns which subagents exist and their tools/instructions. #421 only defines that
  a subagent has a model role, fallback, budget, and eval gate. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:30]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-model-policy-tracer --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — role resolution, subagent model assignment, Gateway-primary routing,
  direct-provider fallback eligibility, eval-gated activation, rollback, budget caps, separate judge model, and
  kill-switch consumption — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:555]

## Consequences

- Positive: model routing is editable from Mission Control without code changes, is eval-gated and
  rollback-safe, is permissioned and audited, and stays Gateway-primary — with any direct provider (including a
  partner GPU gateway) held to a controlled, non-default, instantly-revocable fallback.
- Cost: a policy read on every role resolution and an audit write on every policy change/override; an eval-gate
  pass required before activation (a deliberate price for not silently weakening Eve).
- Risk if skipped: model choice degrades into hard-coded ids or ad-hoc provider selection a prompt or tool
  could steer — the exact "single hard-coded model" and uncontrolled-provider outcomes the constraints forbid.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:471]

## Alternatives considered

- **Hard-code models per call site.** Rejected: the constraint requires named roles and per-subagent settings
  "rather than a single hard-coded model," and code-free editing from Mission Control (US-37).
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:471]
- **Make a direct provider (e.g. a GPU gateway) a default or co-primary route.** Rejected: the constraint
  fixes Vercel AI Gateway as primary and direct providers as controlled fallbacks; a default direct provider
  would violate it and remove the instant-revoke posture.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]
- **Activate policy changes without an eval gate.** Rejected: US-38 requires changes to be eval-gated and
  rollback protected so models are not silently weakened.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:194]
- **Gate edits behind general admin only.** Rejected: US-39 requires a dedicated AI-settings permission so
  normal admin access does not imply model authority.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:197]
- **Share one model for agent and judge.** Rejected: US-43 requires judge models configured separately so eval
  quality is measured independently. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:213]

## Out of scope (this change)

Supabase schema, Mission Control UI, the eval harness, provider-client/runtime routing code, the
governance-kernel state store (#418), the audit-record implementation (#419), the kill-switch control path
(#420), the subagent catalog (#433), and any live model routing — all deferred to later, separately-gated
slices. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:104]

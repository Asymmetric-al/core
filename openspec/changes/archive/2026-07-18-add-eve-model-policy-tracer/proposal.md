# Proposal: Eve model policy tracer bullet

**Accepted implementation for GitHub issue #421 ("Eve: Model policy tracer
bullet").**

> **Builds on #417** (`openspec/specs/eve-autonomous-operations/spec.md`,
> ADR-0018), **#418** (`add-eve-governance-kernel-release-switch`, ADR-0019), **#419**
> (`add-eve-audit-tracer-bullet`, ADR-0020), and **#420** (`add-eve-kill-switch-control-path`, ADR-0021) —
> the three slices the implementation plan names as #421's blockers. It does not restate their contracts; it
> adds the shared model-policy capability whose changes are audited by #419 and whose activation is gated by
> the #420 model-policy kill switch. Every grounded claim carries a `[VERIFIED-REPO: path]` citation read from
> `Asymmetric-al/core` at commit `d14a2434` on 2026-07-02.

## Why

The implementation plan scopes slice 5 as the **Model Policy Tracer Bullet**, issue **#421**, an **AFK** slice
**blocked by slices 2, 3, and 4** — the governance kernel (#418), audit tracer (#419), and kill-switch control
path (#420). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:102]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:104] All three blockers are
already proposed, so #421 is unblocked. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:105]
Its stated purpose is that "authorized admins can draft, evaluate,
activate, and roll back a model policy change **without touching Eve runtime code**," with acceptance that the
"shared model policy supports named roles, Gateway-primary routing, direct provider fallback eligibility,
budgets, and per-subagent overrides," that "a dedicated AI settings permission gates edits," and that
"activation is eval-gated and rollback-capable."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:107]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:110]

The PRD requires "a shared repo model policy, so that Eve, admin AI features, evals, and external coding-agent
guidance can use consistent model roles" (US-36), model editing "from Mission Control … without code changes"
(US-37), changes that are "eval-gated and rollback protected" (US-38), editing "guarded by a dedicated AI
settings permission" (US-39), "one platform model policy in v1, with schema room for tenant overrides later"
(US-40), "Vercel AI Gateway as the primary model route and direct providers as controlled fallbacks" (US-41),
"hard budgets and rate limits with emergency override" (US-42), "Eve judge models … configured separately from
the agent model" (US-43), and "each subagent … [its] own model role, reasoning setting, fallback, budget, and
eval gate" (US-46). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:187]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:213]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:226]

This slice matters to the partner boundary: the fleet's shared **GPU inference gateway** is precisely a
"direct provider" under US-41. Specifying #421 correctly is what keeps that gateway a **proposed, controlled,
non-default fallback** — never a hardcoded route — activatable only by an authorized admin, eval-gated, and
instantly revocable through the #420 model-policy kill switch. That is the model-policy shape the platform
constraint already mandates ("Vercel AI Gateway as the primary route and direct providers as controlled
fallbacks"; policy "uses named roles … rather than a single hard-coded model").
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:471]

## What Changes

- Add a new OpenSpec capability `eve-model-policy` (spec delta in `specs/eve-model-policy/spec.md`) stating:
  the shared model policy defines **named roles and per-subagent settings** (never a single hard-coded model),
  with **one platform policy in v1** and schema room for later tenant overrides; **Vercel AI Gateway is the
  primary route** and any **direct provider is a controlled, non-default fallback** eligible only when
  explicitly configured and eval-passed and instantly revocable; **edits require a dedicated AI-settings
  permission** and are human actions from Mission Control, never model/prompt-selectable; **every policy
  change is draftable, eval-gated, activatable, rollback-capable, and emits a #419 audit record**; **hard
  budgets and rate limits** apply per role/subagent/workflow/eval/judge with an audited emergency override;
  **judge models are configured separately from agent models**; and the policy **consumes the #420
  model-policy kill-switch state, is subordinate to #417/#418, and grants no new authority**.
- Record the accepted decision as **ADR-0022** in `docs/adr/`, building on
  ADR-0019 (#418), ADR-0020 (#419), and ADR-0021 (#420), all of which build on
  ADR-0018 (#417).

## What Does Not Change

- This change adds **no live provider call**. It adds a pure role resolver and
  the app-owned policy control plane while the system stays disabled by default
  (per #418).
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:104]
- The **emergency/kill-switch state** (including the model-policy-changes switch) remains #418/#420's scope;
  #421 only requires that policy edits and activation **consume** that switch state and can be revoked by it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:465]
- The **audit-record shape** remains #419's scope; #421 only requires that each policy draft, activation,
  rollback, and emergency override **emits** one. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:84]
- The **subagent catalog and shared run context** (which subagents exist, their tools and instructions) remain
  #433's scope; #421 only defines that a subagent **has** a model role, fallback, budget, and eval gate.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:30]
- The Supabase policy store, Mission Control UI, deterministic server-side
  safety evaluator, and pure resolver land here. Provider clients, live model
  routing, usage metering, and model-quality eval execution remain later
  runtime concerns. #417's contract, `AGENTS.md`, `openspec/project.md`,
  `openspec/specs/**`, and existing CI gates remain authoritative.
  [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-model-policy-tracer --strict`) that makes the shared
  model-policy capability — named roles, Gateway-primary routing, controlled non-default direct-provider
  fallbacks, permissioned eval-gated rollback-capable edits, per-role/subagent budgets, and separate judge
  models — a durable, spec-level contract. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Canonical `ADR-0022` for the model policy, traceable from ADR-0019 (#418),
  ADR-0020 (#419), and ADR-0021 (#420).
- A clear boundary: #418 owns the release/kill-switch **state**; #419 owns the **audit record**; #420 owns the
  per-domain **control path** (incl. the model-policy switch); #421 owns the **model-policy capability** whose
  changes that switch can revoke and whose activation is eval-gated — and, critically, the rule that keeps any
  partner GPU inference gateway a **proposed, non-default, revocable fallback** rather than a hardcoded route.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]

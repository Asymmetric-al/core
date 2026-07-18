# Design (provisional Eve label EVE-DESIGN-0005): Eve Approval and Budget Policy

> **Numbering:** `EVE-DESIGN-0005` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0005**, the approval/budget-policy decision required by issue #423. It
> builds on **EVE-DESIGN-0004** (#420, `add-eve-kill-switch-control-path`), **ADR-0020** (#419,
> `add-eve-audit-tracer-bullet`), and **ADR-0019** (#418, `add-eve-governance-kernel-release-switch`), which
> all build on **ADR-0018** (#417, `openspec/specs/eve-autonomous-operations/spec.md`), and does not restate them —
> it operationalizes the trust-zone approval policy and hard-budget policy that #418's single consult gate
> evaluates and that emit #419 audit records. **The provisional label follows authoring order:** #421 and #422 ADRs are not
> yet authored in this partner-draft sequence, so this label is replaced at implementation time per
> `docs/adr/README.md`. When accepted into `Asymmetric-al/core`, its ADR
> body should also be landed at the repo's ADR location. Every grounded claim carries a
> `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit `d14a2434` on 2026-07-02.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Status

Proposed (partner draft for #423). Supersedes nothing. Builds on ADR-0019 (#418), ADR-0020 (#419), and
EVE-DESIGN-0004 (#420). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

ADR-0019 established the governance kernel's single consult gate and the disabled-by-default
release-switch/emergency-off **state**, but the _content_ of the policy that gate evaluates — which trust
zone an action belongs to, which write class it is, and whether budget remains — was deferred to later
slices. #423 is the slice that supplies that content. The PRD requires it directly: US-29 wants "separate
approval policies for engineering, product or admin actions, and memory, so that different trust zones have
different rules"; US-30 wants Eve to "write operational production records under policy … tasks, notes,
labels, internal statuses, workflow metadata, memory, model settings, and review artifacts"; US-31 wants Eve
"blocked from broad customer, donor, payment, identity, tenant ownership, auth, secret, migration, and
destructive production writes without stricter approval"; US-42 wants "hard budgets and rate limits with
emergency override, so that autonomous runs, subagents, evals, and judges cannot burn unbounded spend."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

The implementation plan scopes #423 (slice 7) as an **AFK** slice **blocked by slices 2, 3, 4, 5** (#418
governance kernel, #419 audit, #420 kill-switch, #421 model policy), with the stated purpose that **one
operational action can be allowed, denied, or paused by trust-zone policy and budget state**, and acceptance
focus that engineering/product-admin/memory policies are separate, hard budgets and emergency override are
enforceable and audited, and operational production writes are distinct from blocked business-data writes.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] The `platform-boundaries` spec
already assigns CRM the ownership of "operational identity … permissions-sensitive records, workflows,
approvals, money-related history, and other operational truth" and keeps sensitive operations server-side;
this policy sits on top of those boundaries and only tightens them.
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Decision

1. **Approval policy is separated by three trust zones.** Engineering, product/admin, and memory actions each
   have their own persisted rule set. A decision for one zone never applies another zone's rules, and a
   looser zone's allowance never authorizes a stricter zone's action. This is US-29 made concrete.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
2. **Operational production writes are allowed under policy.** Tasks, notes, labels, internal statuses,
   workflow metadata, memory, model settings, and review artifacts are an operational write class Eve may
   perform without a per-write human approval, still subject to the trust-zone rule, the #418 gate, the #420
   production-writes switch, and available budget. This is US-30.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
3. **Business-data writes are a distinct higher-trust class, blocked without stricter approval.** Customer,
   donor, payment, identity, tenant-ownership, auth, secret, migration, and destructive production writes are
   never authorized by an operational-write allowance; they require the stricter zone's explicit approval,
   and an unclassifiable write defaults to this stricter class. This is US-31 and mirrors the
   `platform-boundaries` operational-vs-sensitive split.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
4. **Hard budgets and rate limits, with an audited, permissioned emergency override.** Budgets/limits apply to
   model roles, subagents, dynamic workflows, evals, judge models, and expensive features; exceeding one
   pauses or denies the action. Budget state is persisted app-owned state read by the policy check — never a
   model/tool claim. The emergency override requires a dedicated permission and emits a #419 audit record.
   This is US-42. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
5. **Decisions are gate-consumed, audited, non-bypassable, and grant no new authority.** Every allow/deny/
   pause/override flows through #418's single consult gate, reads only persisted app-owned state, and emits a
   #419 audit record. Where kill-switch state and budget/approval policy disagree, the more restrictive
   result wins; #417 protected-area/approval limits and #418 emergency-off precedence always still apply. The
   change stays a spec/ADR + policy contract with no live autonomous surface.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract, protected-area set, and governance data model
  at spec level. #423 is subordinate to it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#418 (ADR-0019, governance kernel):** owns the single consult gate and the release-switch/emergency-off
  **state**. #423 supplies the policy _content_ the gate evaluates; it does not own the gate.
  [VERIFIED-REPO: openspec/specs/eve-autonomous-operations/spec.md]
- **#419 (ADR-0020, audit tracer):** owns the **audit-record shape**. #423 requires that each policy/budget
  decision emits one; it does not redefine the record.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#420 (EVE-DESIGN-0004, kill-switch):** owns the per-domain **control path** (incl. production-writes and
  force-approval). #423's budget/approval checks are consumed alongside kill-switch state; the more
  restrictive result wins, and force-approval overrides any allow this policy grants.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#421 (model policy):** owns named roles, Gateway-primary routing, and eval gates. #423 applies
  budgets/rate limits _to_ those roles/subagents/judges and depends on #421 for their definition — hence the
  blocked-by-5 dependency. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#423 (this change):** owns the trust-zone approval rules, the operational-vs-business-data write
  classification, and the hard-budget/rate-limit policy that the gate, kill-switch checks, and model policy
  all consume.

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-approval-budget-policy --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — one operational action allowed/denied/paused by zone + budget,
  separate zone policies, operational-vs-business-data distinction, and an audited emergency override — land
  with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Consequences

- Positive: the governance gate gains real, spec-level policy content — trust zones, write classes, and hard
  budgets — provable before any live runtime; every decision is audited and reads a single non-bypassable
  state.
- Cost: a mandatory policy/budget-state read on every gated action and an audit write on every decision
  (a deliberate price for accountable, bounded autonomy).
- Risk if skipped: "operate under policy" degrades into ad-hoc per-action approvals or unbounded spend, and
  the operational-vs-business-data line a model could talk past — the exact failures this policy forecloses.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Alternatives considered

- **One global approval rule instead of trust zones.** Rejected: US-29 explicitly wants engineering,
  product/admin, and memory to have different rules; a single rule cannot express "allow a code PR but gate a
  memory write." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- **Allowlist writes case-by-case instead of an operational-vs-business-data class split.** Rejected: US-30
  and US-31 draw a durable line between operational records and sensitive business data; a flat allowlist
  loses that line and defaults unknown writes unsafely.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- **Soft/advisory budgets.** Rejected: US-42 requires _hard_ budgets and rate limits so autonomous runs
  "cannot burn unbounded spend"; advisory limits are bypassable.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- **Ungated or self-service emergency override.** Rejected: the override must require a dedicated permission
  and an audit record; an ungated override would reopen the unbounded-spend hole it exists to close.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- **Enforce policy/budget from prompt/model context.** Rejected: it would be bypassable by model or tool
  output; checks read only persisted app-owned state.
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Out of scope (this change)

Supabase schema, admin UI, the governance-kernel gate/state store (#418), the audit-record implementation
(#419), the kill-switch control path (#420), the model-policy capability (#421), and any live autonomous
behavior — all deferred to later, separately-gated slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

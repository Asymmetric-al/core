# Design (provisional Eve label EVE-DESIGN-0009): Eve Admin Workspace Operations Shell

> **Numbering:** `EVE-DESIGN-0009` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0009**, the admin-workspace-shell decision required by issue #427. It is
> traceable from **EVE-DESIGN-0002** (#418, `add-eve-governance-kernel-release-switch`), **EVE-DESIGN-0003** (#419,
> `add-eve-audit-tracer-bullet`), **EVE-DESIGN-0004** (#420, `add-eve-kill-switch-control-path`), **EVE-DESIGN-0006** (#421,
> `add-eve-model-policy-tracer`), **#422** (`add-eve-admin-memory-tracer`), **EVE-DESIGN-0005** (#423,
> `add-eve-approval-budget-policy`), and **#424** (`add-eve-retention-replay-tracer`), and does not restate
> them — it operationalizes the operations-first workspace shell that renders that governance state as
> observable panels, exposes decision summaries rather than raw reasoning, and role-gates the admin controls
> that trigger the policies those slices own, while the release switch stays off per #418. When accepted into
> `Asymmetric-al/core`, its ADR body should also be landed at the repo's ADR location (same convention chosen
> for ADR-0018). Every grounded claim carries a `[VERIFIED-REPO: path:line]` citation read from
> `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]

## Status

Proposed (partner draft for #427). Supersedes nothing. Traceable from EVE-DESIGN-0002 (#418), EVE-DESIGN-0003 (#419),
EVE-DESIGN-0004 (#420), EVE-DESIGN-0006 (#421), #422 (admin memory), EVE-DESIGN-0005 (#423), and #424 (retention/replay).
Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 11 (#427, "Admin Workspace Operations Shell") as an **AFK** slice
**blocked by slices 2, 3, 4, 5, 6, 7, and 8** — the governance kernel (#418), the audit tracer (#419), the
kill-switch control path (#420), the model-policy tracer (#421), the private admin memory tracer (#422), the
approval/budget policy (#423), and the retention/replay tracer (#424) — and covering user stories 22, 25, 26,
34, 35, 37, 38, 42, and 67. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:184]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:185] What it must prove is that
"Mission Control has an operations-first Eve workspace backed by real governance state, not mock data," with
acceptance that the "workspace shows active run summaries, approvals, recent actions, budgets, failures, GitHub
activity placeholders, eval health, memory, model policy, subagents, notifications, audit, and emergency
controls," that "admin controls are role-gated," and that the "UI exposes decision summaries, not raw hidden
reasoning." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:186]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:189]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:192]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:193]

The platform constraints already fix the shell's shape. An admin wants "an operations-first Eve admin
workspace" so they "can see what Eve is doing before I chat with it" (US-25), and wants that workspace to "show
active runs, approvals, recent actions, budgets, failures, GitHub activity, eval health, memory, model policy,
subagents, notifications, audit, and emergency controls" so "the system is observable" (US-26); the UI must
expose "high-quality decision summaries instead of raw model reasoning" (US-34); the memory panel must give
"search, edit, delete, disable, categories, scopes, and change history" (US-22); the emergency controls surface
"a full kill-switch suite" (US-35); the model-policy editor lets an AI settings admin "edit Eve model settings
from Mission Control" (US-37) with changes "eval-gated and rollback protected" (US-38); the budget panel
reflects "hard budgets and rate limits with emergency override" (US-42); and the retention view reflects
"category-based retention with a 180-day default" (US-67).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:142]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:145]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:130]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:182]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:191]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:194]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:209]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:303]

The boundary constraints restate the same contract as durable rules: "The admin workspace is operations-first.
Chat is available, but the first screen prioritizes active runs, approvals, recent actions, budgets, failures,
GitHub activity, eval health, memory, model policy, subagents, notifications, audit, and emergency controls";
"Eve exposes high-quality decision summaries, not raw hidden reasoning. A decision summary explains action,
evidence, alternatives, risk, policies, approvals, and reversal or follow-up path"; and "Eve admin workspace
provides full memory control: view, search, edit, delete, disable, category, scope, and change history."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:450]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:446]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443]

The `platform-boundaries` spec keeps sensitive operations server-side and treats tenant isolation as a
structural boundary; the workspace shell inherits those contracts and adds no relaxation — it renders
governance summaries only. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

**Partner-boundary note.** The workspace is the **read-and-control surface** for governance state, not a new
authority. Because it renders governance summaries and decision summaries and never donor PII, payments, or
tenant facts, the charter data boundary holds by construction, and autonomy "does not weaken tenant safety,
donor trust, money integrity, or identity correctness" (US-4). The shell is defined here at spec level; its
admin-visible **exposure** through the Next.js admin mount and global panel is #428, gated by the #426 auth
boundary. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:63]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]

## Decision

1. **Operations-first workspace shell.** Mission Control's Eve workspace is operations-first: chat is
   available, but the first screen prioritizes active run summaries, approvals, recent actions, budgets,
   failures, GitHub activity placeholders, eval health, memory, model policy, subagents, notifications, audit,
   and emergency controls, so an admin sees what Eve is doing before chatting.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:450]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:189]
2. **Backed by real governance state, not mock data.** Each panel reads the real governance state owned by the
   sibling slices — #418 governance kernel, #419 audit, #420 kill switches, #421 model policy, #422 memory,
   #423 approval/budget, #424 retention/replay — with GitHub activity an explicit placeholder until the GitHub
   path lands; no panel is backed by mock data.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:186]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:190]
3. **Decision summaries, not raw hidden reasoning.** The workspace exposes high-quality decision summaries —
   action, evidence, alternatives, risk, policies, approvals, and reversal or follow-up path — and never
   exposes raw model reasoning or sensitive internals.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:446]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:193]
4. **Role-gated admin controls.** The workspace's admin controls are role-gated: model-policy editing is behind
   the dedicated AI settings permission, and kill switches, budget overrides, and memory management are gated to
   authorized admins; a user without the required role cannot operate the control.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:192]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:473]
5. **Surfaces and triggers, does not redefine.** The workspace surfaces and lets authorized admins trigger the
   emergency controls (#420), budgets/approvals (#423), model policy (#421), memory management (#422),
   retention view (#424), and audit view (#419); it renders and controls those policies and does not redefine
   their semantics, and full memory control (view, search, edit, delete, disable, category, scope, change
   history) is surfaced over #422's content.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443]
6. **No sensitive data in the shell.** The workspace surfaces governance state and decision summaries only; it
   must not surface donor details, payment data, raw records, table rows, secrets, or sensitive form values —
   the charter data boundary holds at the render surface.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:580]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:63]
7. **Subordinate; grants no new authority; spec-only.** This slice adds only the workspace-shell boundary as a
   spec/ADR contract; it introduces no live UI code and no governance schema, defers the admin-visible mount to
   #428 behind #426 auth, never bypasses #417 protected-area/approval limits or #418 emergency-off precedence,
   and keeps the release switch off until verified.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract and the protected-area set at spec level. #427 is
  subordinate to it and renders governance state within it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:49]
- **#418 (EVE-DESIGN-0002, governance kernel):** owns the governance state store and release switch. #427 renders that
  state; it does not define where it persists.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:62]
- **#419 (EVE-DESIGN-0003, audit tracer):** owns the audit-record shape and content. #427 surfaces an audit view; it
  does not define the record. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
- **#420 (EVE-DESIGN-0004, kill switches):** owns the kill-switch control path and switch semantics. #427 surfaces the
  emergency controls that trigger them; it does not define them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:88]
- **#421 (EVE-DESIGN-0006, model policy):** owns named roles, eval-gating, and rollback protection. #427 surfaces the
  model-policy editor over it; it does not define policy.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:102]
- **#422 (admin memory):** owns what memory stores and its exclusions. #427 surfaces the memory management
  panel over it; it does not define memory content.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:115]
- **#423 (EVE-DESIGN-0005, approval/budget):** owns approval and budget policy. #427 surfaces the budget/approval
  panels over it; it does not define policy.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **#424 (retention/replay):** owns retention and replay artifacts. #427 surfaces a retention view over it; it
  does not define retention. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:142]
- **#426 (EVE-DESIGN-0008, admin auth) / #428 (admin mount + global panel):** own the auth gate and the Next.js mount.
  #427 defines the shell; its exposure through that mount is auth-gated and is #428.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]

## Verification contract

- OpenSpec validates:
  `bunx @fission-ai/openspec@latest validate add-eve-admin-workspace-shell --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — admin workspace tests must cover operations-first navigation, active
  runs, approvals, audit, memory controls, model policy, budgets, kill switches, notification settings, and
  safe decision summaries — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:578]

## Consequences

- Positive: Mission Control has a single operations-first surface where every governance signal is observable
  before chat, admin controls are role-gated, and reasoning is exposed as decision summaries rather than raw
  internals — with no sensitive data crossing the render boundary.
- Cost: a workspace shell to build and maintain, wired to seven governance stores, each panel constrained to
  render real state and decision summaries only.
- Risk if skipped: a chat-first or mock-backed workspace that hides governance state, exposes raw reasoning, or
  leaks records — the exact failures the constraints forbid.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:450]

## Alternatives considered

- **Chat-first workspace with observability behind a tab.** Rejected: the workspace must be operations-first so
  an admin sees what Eve is doing before chatting.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:450]
- **Back panels with mock data for the shell milestone.** Rejected: the shell must be backed by real governance
  state, not mock data. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:186]
- **Expose raw model reasoning for transparency.** Rejected: the UI exposes decision summaries, not raw hidden
  reasoning or sensitive internals.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:446]
- **Ungated admin controls for convenience.** Rejected: admin controls are role-gated, and model-policy editing
  is behind the dedicated AI settings permission.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:192]
- **Redefine budget/model/memory/retention policy inside the workspace.** Rejected: those remain #423/#421/#422/
  #424's scope; the workspace surfaces and triggers, it does not redefine.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **Mount the workspace into admin now.** Rejected: the admin mount is #428, gated by #426 auth, and the
  release switch stays off until verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

Live workspace UI/components, data fetchers, the governance state store (#418), the audit-record shape (#419),
kill-switch semantics (#420), model policy (#421), private-memory content (#422), approval/budget policy (#423),
retention/replay (#424), the admin auth gate (#426), the Next.js admin mount and global panel (#428), any
Supabase schema, and any live autonomy — all deferred to their own separately-gated slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]

# Proposal: Eve admin workspace operations shell

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #427 ("Eve: Admin workspace operations shell").** Staged in the Gitea
> `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's
> OpenSpec workflow after operator/maintainer sign-off. **Builds on the governance-state slices it renders —**
> **#418** (`add-eve-governance-kernel-release-switch`, ADR-0019), **#419** (`add-eve-audit-tracer-bullet`,
> ADR-0020), **#420** (`add-eve-kill-switch-control-path`, EVE-DESIGN-0004), **#421** (`add-eve-model-policy-tracer`,
> EVE-DESIGN-0006), **#422** (`add-eve-admin-memory-tracer`), **#423** (`add-eve-approval-budget-policy`, EVE-DESIGN-0005),
> and **#424** (`add-eve-retention-replay-tracer`) — the seven slices the implementation plan names as #427's
> blockers. It does not restate their contracts; it defines the **operations-first admin workspace shell** that
> renders that governance state as observable panels, exposes decision summaries rather than raw reasoning, and
> role-gates the admin controls that trigger the policies those slices own. Every grounded claim carries a
> `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.

## Why

The implementation plan scopes slice 11 as **Admin Workspace Operations Shell**, issue **#427**, an **AFK**
slice **blocked by slices 2, 3, 4, 5, 6, 7, and 8** — the governance kernel (#418), the audit tracer (#419),
the kill-switch control path (#420), the model-policy tracer (#421), the private admin memory tracer (#422),
the approval/budget policy (#423), and the retention/replay tracer (#424).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:183]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:184] All seven blockers are
already proposed, so #427 is unblocked. Its stated purpose is to prove that "Mission Control has an
operations-first Eve workspace backed by real governance state, not mock data," with acceptance that the
"workspace shows active run summaries, approvals, recent actions, budgets, failures, GitHub activity
placeholders, eval health, memory, model policy, subagents, notifications, audit, and emergency controls," that
"admin controls are role-gated," and that the "UI exposes decision summaries, not raw hidden reasoning."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:186]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:189]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:192]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:193] It covers user stories 22,
25, 26, 34, 35, 37, 38, 42, and 67. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:185]

The platform constraints already fix the shape. An admin user wants "an operations-first Eve admin workspace,
so that I can see what Eve is doing before I chat with it" (US-25), and wants "the Eve workspace to show active
runs, approvals, recent actions, budgets, failures, GitHub activity, eval health, memory, model policy,
subagents, notifications, audit, and emergency controls, so that the system is observable" (US-26).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:142]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:145] An admin
user wants "high-quality decision summaries instead of raw model reasoning, so that I understand why Eve acted
without exposing hidden reasoning or sensitive internals" (US-34), and wants "a memory management panel with
search, edit, delete, disable, categories, scopes, and change history" (US-22).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:130] A platform
owner wants "a full kill-switch suite" surfaced as emergency controls (US-35) and "hard budgets and rate limits
with emergency override" (US-42); an AI settings admin wants "to edit Eve model settings from Mission Control"
(US-37) with those changes "eval-gated and rollback protected" (US-38); and a platform owner wants
"category-based retention with a 180-day default" reflected in the retention view (US-67).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:182]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:209]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:191]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:194]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:303]

The platform boundaries already state the rules this slice makes enforceable as spec. "The admin workspace is
operations-first. Chat is available, but the first screen prioritizes active runs, approvals, recent actions,
budgets, failures, GitHub activity, eval health, memory, model policy, subagents, notifications, audit, and
emergency controls." "Eve exposes high-quality decision summaries, not raw hidden reasoning. A decision summary
explains action, evidence, alternatives, risk, policies, approvals, and reversal or follow-up path." "Eve admin
workspace provides full memory control: view, search, edit, delete, disable, category, scope, and change
history." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:450]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:446]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443] And the shell
must not leak the data boundary: workspace and panel surfaces must not silently include "raw records, payment
data, donor details, table rows, and sensitive form values."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:580]

This slice matters to the partner boundary. It is the **read-and-control surface** for the governance state the
sibling slices own — it renders that state, it does not define it — so the charter data boundary holds by
construction: the shell surfaces governance summaries and decision summaries, never donor PII, payments, or
tenant facts, which "does not weaken tenant safety, donor trust, money integrity, or identity correctness"
(US-4). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:63] The
shell is defined here at spec level; its actual admin-visible **exposure** through the Next.js admin mount and
global panel is #428's scope and is gated by the #426 auth boundary, and the release switch stays off until
"governance, auth, audit, evals, protected-area policy, kill switches, and rollback paths are verified."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## What Changes

- Add a new OpenSpec capability `eve-admin-workspace-shell` (spec delta in
  `specs/eve-admin-workspace-shell/spec.md`) stating: Mission Control has an **operations-first Eve workspace**
  whose first screen prioritizes the observability panels — **active run summaries, approvals, recent actions,
  budgets, failures, GitHub activity placeholders, eval health, memory, model policy, subagents, notifications,
  audit, and emergency controls** — so an admin can see what Eve is doing before chatting; every panel is
  **backed by real governance state, not mock data**, reading the stores the sibling slices own (with GitHub
  activity an explicit placeholder until the GitHub path lands); the UI exposes **decision summaries** (action,
  evidence, alternatives, risk, policies, approvals, reversal/follow-up path), **never raw hidden reasoning or
  sensitive internals**; **admin controls are role-gated** (model-policy editing behind the dedicated AI
  settings permission, kill switches, budget overrides, and memory management gated to authorized admins); the
  workspace **surfaces and triggers** the emergency controls, budgets, model policy, memory, retention, and
  audit that the sibling slices define — it does not redefine their semantics; the shell **must not surface**
  donor details, payment data, raw records, table rows, secrets, or sensitive form values; and the change
  **grants no new authority** — it is a spec/ADR contract with no live UI code and no governance schema, the
  admin-visible mount is deferred to #428 behind #426 auth, and the release switch stays off until verified.
- Record the decision under provisional Eve design label **EVE-DESIGN-0009** in this change's `design.md`, traceable from ADR-0019 (#418), ADR-0020
  (#419), EVE-DESIGN-0004 (#420), EVE-DESIGN-0006 (#421), #422 (admin memory), EVE-DESIGN-0005 (#423), and #424 (retention/replay).

## What Does Not Change

- This change adds **no live workspace UI, no React/Next components, no governance schema, and no data
  fetchers**; it defines the workspace-shell capability and its observability/decision-summary/role-gating
  contract while the system stays disabled by default (per #418) and the release switch stays off until
  verified. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- The **governance state store and release switch** remain #418's scope; #427 renders that state, it does not
  define where it persists. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:62]
- The **audit-record shape and content** remain #419's scope; the **kill-switch control path and switch
  semantics** remain #420's scope; #427 surfaces an audit view and triggers the emergency controls, it defines
  neither. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:88]
- The **model-policy** (named roles, eval-gating, rollback protection) remains #421's scope; the **private
  admin memory** (what memory stores, its exclusions) remains #422's scope; the **approval/budget policy**
  remains #423's scope; the **retention/replay** rules remain #424's scope. #427 surfaces a model-policy
  editor, a memory management panel, budget/approval panels, and a retention view over them, without redefining
  any of those policies. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:102]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:115]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:142]
- The **admin auth and session ownership** gate remains #426's scope, and the **Next.js admin mount and global
  panel** remain #428's scope; #427 defines the shell, and its exposure through that mount — auth-gated — is
  #428. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
- No Supabase schema, no provider-client code, and no live autonomy land here. #417's contract, `AGENTS.md`,
  `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain authoritative and unchanged; this
  change is subordinate to them. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-admin-workspace-shell --strict`) that makes the Eve admin
  workspace shell — operations-first panel set, real-governance-state backing, decision-summaries-not-raw-
  reasoning, role-gated controls, and the no-sensitive-data boundary — a durable, spec-level contract.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0009` for the admin workspace operations shell, traceable from the seven governance-state slices
  it renders (#418–#424).
- A clear boundary: #418 owns the governance state store; #419 the audit record; #420 the kill switches; #421
  the model policy; #422 the memory content; #423 the approval/budget policy; #424 retention/replay; #426 the
  auth gate; #428 the admin mount; #427 owns the **operations-first shell** that renders and controls them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:656]

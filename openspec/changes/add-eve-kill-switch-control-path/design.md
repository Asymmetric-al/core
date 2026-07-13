# Design & ADR-0004: Eve Kill-Switch Control Path

> This `design.md` doubles as **ADR-0004**, the kill-switch control-path decision required by issue #420. It
> builds on **ADR-0002** (#418, `add-eve-governance-kernel-release-switch`) and **ADR-0003** (#419,
> `add-eve-audit-tracer-bullet`), which both build on **ADR-0001** (#417,
> `add-eve-autonomous-operations-foundation`), and does not restate them — it operationalizes the granular
> per-domain kill-switch control path that drives #418's persisted state and emits #419 audit records. When
> accepted into `Asymmetric-al/core`, its ADR body should also be landed at the repo's ADR location (same
> convention chosen for ADR-0001). Every grounded claim carries a `[VERIFIED-REPO: path]` citation read from
> `Asymmetric-al/core` at commit `d14a2434` on 2026-07-02.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Status

Proposed (partner draft for #420). Supersedes nothing. Builds on ADR-0002 (#418) and ADR-0003 (#419).
Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Context

ADR-0002 established the governance kernel's system-wide release-switch and emergency-off **state** and
explicitly deferred "the granular per-domain kill-switch control path (per-domain switches for automation,
active runs, GitHub actions, production writes, sandbox networking, dynamic workflows, model-policy changes,
force-approval)" to #420. [VERIFIED-REPO: openspec/changes/add-eve-autonomous-operations-foundation/tasks.md]
#420 is that slice. The PRD's US-35 requires "a full kill-switch suite … [to] pause all automation, stop
active runs, disable GitHub actions, disable production writes, disable sandbox networking, disable dynamic
workflows, revoke or disable model policy changes, and force human approval for all actions."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] The
implementation plan scopes #420 as an **AFK** slice **blocked by #418 and #419**, proving "platform owners
can stop Eve automation from the admin workspace before runtime integrations exist," with acceptance that the
switches cover all eight domains, that "kill-switch changes create audit records," and that "policy checks
consume kill-switch state." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

Adjacent user stories this slice serves: hard budgets/rate limits with emergency override (US-42),
dynamic-workflow failures that "may disable dynamic workflows" on escalation (US-54), and the sandbox's
"emergency kill switches" that contain allow-all networking (US-57).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] The
`platform-boundaries` spec already makes sensitive operations server-side-only and treats tenant isolation as
a structural boundary; the kill-switch state and policy-check path inherit those contracts and add
restrictions — they never relax them. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Decision

1. **A per-domain kill-switch suite, plus a master pause.** The suite provides independently actuatable
   switches for all-automation (master pause), active runs, GitHub actions, production writes, sandbox
   networking, dynamic workflows, model-policy changes, and a force-approval mode. A narrow domain can be
   disabled without disabling the rest; the master pause halts every domain at once. This is US-35's full
   suite made concrete. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
2. **Admin/external actuation, provable before runtime exists.** Each switch is actuatable from the admin
   workspace by a verified authorized human (or an authenticated external control caller), and the control
   path is proven ahead of any live runtime — the AFK acceptance. Actuation is never selectable by prompt,
   model output, or tool input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
3. **Every actuation is audited (via #419).** Setting, clearing, or toggling any switch emits a #419 audit
   record (actor, initiator, identity mode, target switch/domain, result, evidence summary), so switch
   history is reconstructable in the admin audit view. This is the direct "kill-switch changes create audit
   records" acceptance and the reason #420 is blocked by #419.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
4. **Policy checks consume switch state and cannot be bypassed.** Every policy check that gates an autonomous
   action reads the persisted app-owned switch state and blocks the action when the matching domain switch,
   the master pause, or force-approval forbids it. Checks read only persisted state — never a prompt, model
   output, tool input, or memory claim that a switch is off — mirroring ADR-0002's non-bypass rule. Blocked
   actions abort and are recorded. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
   [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
5. **The control path drives #418 state; it does not own the kernel.** #418 owns the persisted
   emergency/kill-switch state and the single consult gate; #420 owns the controls that set that state and the
   policy-check consumption of it. The two compose: #420 flips, #418 persists and is consulted.
   [VERIFIED-REPO: openspec/changes/add-eve-autonomous-operations-foundation/tasks.md]
6. **Subordinate to #417, grants no new authority.** The suite only restricts autonomy; it never widens it. A
   cleared switch does not bypass ADR-0001's protected-area blocks, production-write limits, or human-approval
   requirements, nor #418's release-switch/emergency-off precedence. The change stays a spec/ADR +
   control-path contract with no live autonomous surface.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0001, foundation):** owns the autonomy contract, protected-area set, and governance data model
  at spec level. #420 is subordinate to it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#418 (ADR-0002, governance kernel):** owns the release-switch/emergency-off **state**, the single
  consult/abort gate, and observability. #420 drives that state; it does not persist or consult it itself.
  [VERIFIED-REPO: openspec/changes/add-eve-autonomous-operations-foundation/tasks.md]
- **#419 (ADR-0003, audit tracer):** owns the **audit-record shape**. #420 requires that each switch actuation
  emits one; it does not redefine the record. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#420 (this change):** owns the granular per-domain **control path** — the switch set, admin/external
  actuation, audit emission, and policy-check consumption.
- **#421 (model policy):** owns named roles, Gateway-primary routing, and eval-gated activation. #420 only
  provides a switch that disables/revokes model-policy changes and requires policy checks to read switch
  state. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-kill-switch-control-path --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — every switch blocks its domain, a kill-switch change creates an audit
  record, and policy checks consume switch state — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Consequences

- Positive: platform owners get a full, per-domain stop control that exists and is provable before any live
  runtime; every actuation is audited; policy enforcement reads a single non-bypassable state.
- Cost: a mandatory switch-state read on every gated action and an audit write on every actuation (a cheap,
  deliberate price for a verifiable stop control).
- Risk if skipped: "stop Eve" degrades into ad-hoc flags and prompt checks a model or tool response could
  talk past — the exact bypass this control path forecloses.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Alternatives considered

- **One global on/off instead of per-domain switches.** Rejected: US-35 enumerates eight distinct domains and
  a force-approval mode; a single flag cannot express "disable GitHub actions but keep sandbox triage."
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- **Fold the switch state into #420.** Rejected: #418 already owns the persisted state and consult gate;
  duplicating it here would blur the state-vs-control boundary the foundation drew.
  [VERIFIED-REPO: openspec/changes/add-eve-autonomous-operations-foundation/tasks.md]
- **Enforce switches from prompt/model context.** Rejected: it would be bypassable by model or tool output;
  policy checks read only persisted app-owned switch state. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
- **Skip audit on actuation.** Rejected: the PRD acceptance requires kill-switch changes to create audit
  records, and an unlogged stop control is unaccountable.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Out of scope (this change)

Supabase schema, admin UI, the governance-kernel state store (#418), the audit-record implementation (#419),
the model-policy capability (#421), and any live autonomous behavior — all deferred to later,
separately-gated slices. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

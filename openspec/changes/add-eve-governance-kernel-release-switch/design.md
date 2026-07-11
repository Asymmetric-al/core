# Design & ADR-0002: Eve Governance Kernel and Release Switch

> This `design.md` doubles as **ADR-0002**, the governance-kernel + release-switch decision required by
> issue #418. It builds on **ADR-0001** (#417, `add-eve-autonomous-operations-foundation`) and does not
> restate it — it operationalizes ADR-0001's "one controlled release switch, disabled by default" into a
> concrete kernel state model and consult contract. When accepted into `Asymmetric-al/core`, its ADR body
> should also be landed at the repo's ADR location (same convention chosen for ADR-0001).
> Every grounded claim carries a `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at
> commit `25ca4a2` on 2026-07-02. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Status

Proposed (partner draft for #418). Supersedes nothing. Builds on ADR-0001 (#417). Subordinate to OpenSpec
and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Context

ADR-0001 established the autonomy contract at spec level and required that activation "MUST use a single
controlled release switch … off until governance, auth, audit, evals, protected-area policy, kill switches,
and rollback paths are verified," with the governance data model defined before implementation.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] #418 is the
next slice: it proves "the platform can persist and display Eve system state while Eve remains disabled by
default," with acceptance that the governance data model supports release-switch state, kill-switch state,
run summaries, and policy status; that an admin can see disabled/enabled + emergency status; and that
**tests prove disabled mode blocks autonomous behavior**. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

The PRD's user stories that this slice serves: an operations-first admin workspace that shows Eve state
before chat (US-25/26), governance data owned by the app in Supabase tables (US-65), and phased PRs behind
one release switch (US-70). The full kill-switch suite (pause automation, stop runs, disable GitHub actions,
disable production writes, disable sandbox networking, disable dynamic workflows, revoke model-policy
changes, force approval) is US-35 and is #420's control path — #418 defines only the release-switch and
emergency-off **state** it drives. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

The `platform-boundaries` spec already makes sensitive operations server-side-only and treats tenant
isolation as a non-negotiable structural boundary; the kernel's persisted state and consult path inherit
those contracts and add a gate — they never relax them. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Decision

1. **Disabled-by-default release switch as a durable spec contract.** Eve ships with a single master release
   switch defaulting to disabled; no autonomous surface may run while it is disabled, and merging a later
   slice never enables it. Enabling is a deliberate human action gated on the #437 end-to-end verification.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
2. **Emergency-off is a distinct state with precedence.** A separate emergency-off state forces the whole
   system to disabled / human-approval-only regardless of the release-switch value and outranks an enabled
   switch. Setting and clearing it are human actions and are recorded; clearing it returns only to what the
   release switch dictates and never auto-resumes autonomy.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
3. **The kernel is the single consult point; state is app-owned.** Release-switch state, emergency/kill-switch
   state, run summaries, and policy status are persisted as app-owned data (Supabase-owned governance,
   US-65). Every autonomous action reads the kernel immediately before acting and aborts + records the reason
   when disabled or emergency-off. Eve's own session/workflow durability stays runtime-owned (per ADR-0001).
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
4. **Non-bypassable by construction.** Kernel decisions use only the persisted app-owned state — never a
   prompt, model output, tool input, or memory claim that "Eve is enabled." This mirrors ADR-0001's rule that
   identity/authority derive from verified context, not model-controlled input.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
5. **Observable and provably blocking.** An authorized admin can see enabled/disabled, emergency-off, and
   policy status; the change is accompanied by tests proving disabled mode blocks autonomous behavior, so the
   gate is verified, not cosmetic. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
6. **Subordinate to #417, grants no new authority.** The kernel only gates autonomy; it never widens it. An
   enabled release switch does not bypass ADR-0001's protected-area blocks, production-write limits, or
   human-approval requirements. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0001, foundation):** owns the autonomy contract, layered source-of-truth, protected-area set,
  and the governance data model at spec level. #418 is subordinate to it and reuses its release-switch
  posture. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#418 (this change):** owns the release-switch state, emergency-off state, the single consult/abort gate,
  observability of that state, and the disabled-blocks-autonomy test contract.
- **#420 (kill-switch control path):** owns the granular per-domain switches (US-35) that _drive_ the state
  this kernel persists; #418 defines the state, #420 defines the controls. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **#437 (final release switch + launch verification):** owns the actual flip to enabled after end-to-end
  checks; the switch stays off until then. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-governance-kernel-release-switch --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The disabled-gate test (PRD acceptance: "tests prove disabled mode blocks autonomous behavior") is the
  slice-specific acceptance check and lands with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Consequences

- Positive: the disabled-by-default gate becomes a durable, testable contract every later Eve slice inherits;
  emergency-off gives an unconditional stop that outranks the switch; state is auditable and app-owned.
- Cost: front-loaded spec/ADR effort and a mandatory consult on every autonomous action (a deliberate,
  cheap price for a non-bypassable gate).
- Risk if skipped: the release switch degrades into scattered feature flags and prompt checks that a model or
  tool response could talk past — the exact bypass this kernel forecloses. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

## Alternatives considered

- **Per-feature flags instead of one kernel.** Rejected: the PRD mandates "one controlled release switch,"
  and scattered flags cannot express emergency-off precedence or a single auditable consult point.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **Fold the granular kill switches into #418.** Rejected: US-35's per-domain control path is #420's scope;
  merging them would overload this slice and blur the state-vs-control boundary.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- **Trust an in-memory / prompt-derived enabled flag.** Rejected: it would be bypassable by model or tool
  output, defeating the gate; the kernel reads only persisted app-owned state.
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Out of scope (this change)

Supabase schema, admin UI, the granular kill-switch control path (#420), and any live autonomous behavior —
all deferred to later, separately-gated slices. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

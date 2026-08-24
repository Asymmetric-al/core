# ADR-0180: Formal Phase 23 decision closure and evidence-gated handoff

**Status:** Accepted (founder-ratified Phase 23 D36 A-prime-R, 2026-08-24)

## Context

Phase 23 grooming produced 35 founder-ratified product and architecture
decisions covering Web Studio/CMS content, Pages, placement, hierarchy,
Navigation, redirects, schedules, dynamic sources and lists, public search,
forms, media, authorization, audit evidence, public serving, Content Health,
Payload v4 admission, and replacement of the current prototype.

A closure audit mapped every substantive source-prompt decision area to D1–D35,
confirmed that later-phase capabilities retain named owners, and preserved the
source prompt's complete testing, evidence, and issue-readiness requirements in
a durable repository checklist. No unresolved CMS feature, user outcome, or
ownership conflict remained. Continuing open-ended grooming would therefore
risk reopening settled decisions or inventing speculative integration,
workflow, reporting, or AI infrastructure.

## Decision

Phase 23 adopts **formal decision closure with frozen D1–D35 authority,
owner-bounded downstream seams, and evidence-gated handoff**:

1. D1–D35 are the complete founder product and architecture contract for Phase
   23 and may change only through a later explicit numbered founder amendment.
2. Ratified decisions override conflicting prompt examples, prior assumptions,
   provider defaults, and current prototype behavior.
3. Capabilities owned by later phases remain absent until their owner certifies
   the smallest purpose-qualified contract needed by a real consumer. Phase 23
   creates no universal integration catalog, event bus, workflow DSL, BI layer,
   AI writer, placeholder tables, or dormant staff controls.
4. Uncertified and unauthorized capabilities remain existence-safe and absent.
   Certified capabilities appear only in the owning task context with plain
   product language and permission-aware handoffs; setup and raw diagnostics
   remain with their owner.
5. D34 remains a live implementation-time Payload v4 cohort qualification and
   production-admission gate. D35 remains an implementation-time named-target
   census and disposition gate. Grooming claims neither gate has run.
6. Every implementation ticket must preserve its ratified owner, applicable
   scope, current authorization proof, expected revision or sealed input,
   idempotency, partial-failure posture, recovery path, receipt boundary, and
   adverse-first public safety.
7. The Phase 23 closure testing, evidence, and issue-readiness checklist is
   mandatory specification and ticket input. Built, Live, and Confirmed remain
   separate evidence states.
8. Phase 23 grooming stops at D36. Specification or issue publication requires
   a separate explicit founder invocation of `$to-spec`; runtime implementation
   and deployment require their own later authority.

The complete exact 36-clause authority is preserved in
[Phase 23 D36](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d36--formal-phase-23-decision-closure-and-evidence-gated-handoff)
and its
[decision brief](../prds/sitestacker-parity/research/phase-23-d36-formal-decision-closure-brief.md).

## Consequences

- Future specification and tracer-bullet tickets synthesize D1–D36; they do not
  redesign the product or reopen founder choices.
- Later product owners may add narrow certified contracts without transferring
  their source truth into Payload or Web Studio.
- Missing future owners are represented honestly as unavailable, not simulated
  with generic infrastructure or staff-facing placeholders.
- Current repository code and hosted state remain evidence subject to D35, not
  target authority.
- No Payload v4 cohort, provider feature, hosted state, production capacity, or
  live product capability is treated as qualified merely because grooming or
  specification documentation exists.
- The source prompt's negative matrices, accessibility journeys, capacity
  gates, recovery drills, editor-usability evidence, operator walkthroughs,
  known limitations, and deferred-owner boundaries must survive every later
  slice.
- The founder separately invoked `$to-spec` in the D36 ratification message,
  authorizing specification synthesis and issue publication only. D36 still
  authorizes no runtime code, dependency, schema/RLS, data, deployment, or
  production action.

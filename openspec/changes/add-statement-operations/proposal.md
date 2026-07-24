# Add Year-End Statement Operations

## Why

Phase 7 owns statement eligibility and immutable facts, Phase 18 owns generated
documents and exact artifacts, and Phase 17/6 owns governed communication and
delivery evidence. The platform still lacks the operational product that turns
those authorities into a reviewed, frozen, resumable year-end release for
thousands of recipients. The current donor annual-statement route recomputes
live rows into text and cannot prove reviewed population, immutable release,
per-recipient fulfillment, late-fact recovery, or truthful completion.

Phase 19 adds that missing orchestration without creating another eligibility,
document, communication, audit, or workflow system.

## What Changes

- Add one canonical, purpose-pinned **Statement Run** and **Run Preflight**
  model plus one derived **Year-End Operations** workspace.
- Freeze source-authoritative Statement Subjects, participation decisions,
  document and communication resolution pins, recipient-delivery snapshots,
  Fulfillment Plans, inclusion and exclusion reasons, and source cutoffs before
  one atomic **Start live run** release.
- Keep population, document, portal, communication, physical fulfillment,
  incident, legal, and completion truth separately authoritative.
- Add tenant-controlled Statement Delivery Profiles, governed destination
  succession, cooperative Pause/Resume/Stop containment, self-print-first
  physical fulfillment, truthful staff completion, and proportional review.
- Add source-owned late-fact recovery, including staff-attested year-boundary
  check intake; exact-issuer Canadian receipt-plan participation remains absent
  unless the Phase 18 Canadian pack is active.
- Add one contextual **Help with this statement** doorway, proportional
  statement communications, unmetered exact-current donor access, repeatable
  bounded copy fulfillment, and one PII-minimized Run Evidence Record.
- Add an optional purpose-separated **Support overview — Not a tax document**
  for the closed Phase 14 household-support and disclosed-DAF launch set.
- Replace the live annual-statement text route with the canonical Phase 19
  run, then Phase 18 document, then Phase 17 delivery path. No legacy adapter or
  parallel statement runtime is authorized.

## Capability Deltas

- Add capability: `statement-operations`
- Modify capability: `platform-product-intent` through
  `openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md`
- Modify capability: `donation-lifecycle` through
  `openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md`

The sibling delta paths above are part of this PR's explicit congruence
package. `add-statement-operations` owns the new capability; it does not copy
or fork those already-active capability changes.

## Dependencies

- Phase 7 must expose versioned, immutable Statement Subject, eligibility,
  coverage, correction, and facts-package seams.
- Phase 14 must expose the closed, permissioned recognition projection used by
  the optional Support overview.
- Phase 18 must expose side-effect-free document-resolution pins and the
  Generated Document service.
- Phase 17/6 must expose side-effect-free communication-plan pins, prepared
  message admission, transport, and monotonic delivery evidence.
- Phase 12 supplies capabilities, assurance, delegation, and optional
  independent-review authority.
- Phase 15 remains the check-entry and source-correction surface.
- Implementation dispatch is blocked until the Phase 17/18 authority package is
  accepted, merged, or explicitly superseded and the predecessor ownership
  conflicts recorded in the Phase 19 congruence package are resolved.

## Out Of Scope

- A second eligibility engine, facts store, document renderer, communication
  queue, audit log, case system, workflow builder, or records engine.
- A general mailroom, printer driver, postal presort platform, provider
  marketplace, NCOALink client, or automatic NCOALink-to-CRM overwrite.
- Tenant-authored legal rules, eligibility formulas, priority weights, provider
  limits, retry controls, or arbitrary recipient/destination fields.
- Automatic run completion, a blended progress percentage, live-year
  recomputation, post-start population edits, or reopening frozen history.
- Phase 25 portal redesign beyond consuming the canonical current-document and
  copy-request seams defined here.

## Release Posture

This change is an implementation-ready product and architecture contract only.
It does not implement Phase 19 or dispatch tickets. Runtime work may begin only
after the dependency gate above is satisfied and implementation is explicitly
dispatched. The confirmed public testing seam in the design is binding.

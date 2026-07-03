# Design — SiteStacker Parity Program (Phase 0)

## Context

Phase 0 stabilizes the baseline before parity work. It is governance + evidence
only; it ships no features. These decisions came from a structured Phase 0 grill
(2026-07-03).

## Decisions

- **Outcome parity, not blueprint parity.** SiteStacker is the benchmark of what
  a missions org must be able to accomplish; the platform builds those outcomes
  on its own model. Rationale: cloning SiteStacker's structure would fight the
  platform's surface/boundary model and produce bolt-ons.
- **Benchmark = official SiteStacker docs, cited or "not yet sourced."** No live
  SiteStacker instance is in use. Known limitation: docs describe features, not
  always operational depth.
- **Baseline = the live commit, with the develop→production gap recorded.** As
  of 2026-07-03: `production` HEAD `fb168d89` (2026-06-20) is the live candidate;
  `develop` HEAD `44c2637e` is 374 commits ahead. Confirming the true live
  commit is a human-only (Lane 2) task.
- **Two-lane truth-finding.** Lane 1 = repo/agent-provable; Lane 2 = human-only
  live confirmation. The live state is never assumed.
- **Governance by reference.** The existing boundary specs are the binding
  rules; the program points to them and adds one parity-specific reminder rather
  than restating them (avoids drift).
- **Program-only up front.** Only enough is written to govern the program; each
  of the 25 areas is specified in its own change + PRD when it is built.

## Non-goals

- No feature parity implemented in Phase 0.
- The 374 unreleased commits are recorded, not shipped; ship-or-not is a later
  human decision.
- No exhaustive up-front spec of the 25 areas.

## Risks / trade-offs

- **Live state unverifiable from repo** → mitigated by Lane 2 + stop condition
  SC1 in the evidence file; parity phases plan against the confirmed _committed_
  baseline until Lane 2 completes.
- **Doc-based benchmark misses operational depth** → mitigated by capturing
  depth per-area at build time, and by the acceptance-test column being
  outcome-based.
- **Overlap with OpenSpec PR #462** → mitigated by an explicit reconcile
  follow-up; the matrix points to #462 where it already governs an area.

## Open questions

- Who owns Lane 2 (hosting access)?
- Should the 374-commit gap be closed (release) before parity Phase 1 starts?
  (Recorded, deliberately not forced by Phase 0.)

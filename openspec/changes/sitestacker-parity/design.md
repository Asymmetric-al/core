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
- **One roadmap governs phase architecture (added 2026-07-07, Roadmap v2).**
  The phase set/numbering/ordering/dependencies live in
  `docs/prds/sitestacker-parity/roadmap.md` (41 phases, 0–40, seven lanes);
  `phase-map.md` mirrors it and loses on conflict. Rationale: the program
  re-sequenced once already (v1→v2 renumbered every phase above 9); without a
  single source of truth plus a mandatory renumbering-map + congruence-sweep
  rule and "Phase N (Name)" citation discipline, stale numbers silently
  misroute future PRDs, issues, and agents. Roadmap revisions are the only
  way ordering changes.
- **Recurring commitments and fixed-total pledges preserve separate truth
  (added 2026-07-13, Phase 16).** A recurring commitment records repeated
  support without a promised cumulative balance; a fixed-total pledge records
  an explicit cumulative promise. Collection arrangements and provider objects
  execute or evidence collection but do not define either promise. Expected
  occurrences, execution, payment finality, ledger posting, fulfillment
  applications, recognition, and posted contributions remain separately owned.
  Recurring groups contain stable destination-line identities; effective line-
  term versions remain distinct from authoritative calendar schedule epochs;
  and only compatible current pairs share a billing cohort/provider executor.
  Every active cadence policy features exactly one enabled cadence—monthly
  whenever enabled. Donor schedule boundaries validate in preview and again
  under lock. Pause/resume preserves the grid, recurring-to-fixed coverage uses
  one effective count-once temporal link, and provider subscriptions own
  ordinary renewal execution but never product recovery eligibility or timing.
  Rationale: the legacy one-subscription-to-one-`donor_pledges` topology
  collapses incompatible meanings, cannot represent independently manageable
  lines, and is unsafe under replay, provider-control loss, ACH delayed
  finality, provider-owned retry, or fixed-pledge fulfillment.
- **OpenSpec reconciliation is explicit, not retrospective (added
  2026-07-13).** The merged `donation-lifecycle` requirement is corrected
  through this dated change's `MODIFIED` delta. The still-active
  `add-recurring-giving` and `add-donor-self-service` changes are amended in
  place to consume the Phase 16 model and expressly record that their original
  legacy-pledge topology is superseded. Historical archived changes remain
  unchanged.

## Non-goals

- No feature parity implemented in Phase 0.
- The 374 unreleased commits are recorded, not shipped; ship-or-not is a later
  human decision.
- No exhaustive up-front spec of the 25 areas.
- No product implementation, migration, issue dispatch, or communication send
  is authorized by the Phase 16 specification package.

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

- Lane 2 (live confirmation) is owned by the platform owner (founder), to
  perform or delegate to an ops lead with hosting access (see the evidence
  file). The remaining action is scheduling and completing it — not deciding who
  is accountable.
- Should the 374-commit gap be closed (release) before parity Phase 1 starts?
  (Recorded, deliberately not forced by Phase 0.)

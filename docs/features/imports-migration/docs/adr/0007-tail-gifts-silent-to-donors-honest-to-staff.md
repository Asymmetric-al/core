# ADR-IM-007: Tail gifts are silent to donors and honest to staff

**Status:** Accepted 2026-11-02 — ratified by the founder in the Phase 30 grill (Q7). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q7; evidence, 26 edge cases and acceptance criteria `grill/q07-legacy-tail-effects/` (`q07-adversarial-review.md`). Amends ADR-IM-001 (tail surfaces) and ADR-IM-004 (duplicate exclusion; missionary views). Amended by ADR-IM-008 (2026-11-02, moves and tail closure).

## Context

During the Legacy Recurring Tail, the old system keeps charging some recurring donors and keeps its own receipts and recurring messages; Asym receives those gifts weeks later in Legacy Tail Backfills. Asym has no donor thank-you besides the tax receipt (barred by Q4), but its workflow recipes, missionary tasks and tribute letters would fire on late, imported facts, as Bloomerang's "First Ever Donation" re-entry shows. Vendors keep imported gifts silent to donors; missionaries rely on staff-facing gift signals. Workflow Studio keeps imported events dark "unless a bounded backfill request was reviewed" (`docs/prds/workflow-studio/03-runtime-and-recovery.md:25`), which an approved Legacy Tail Backfill could be mistaken for. At least six owner markers already exist. SiteStacker replaces schedules on edits and reruns declines; PayPal and template sources report no cancellations.

## Decision

Effects follow first recording: Asym runs gift-triggered effects only for gifts first recorded in Asym. Recorded-outside-Asym gifts and their reversals trigger no donor message, task, notice, welcome, tribute, milestone or first/new/started/special result, but count in every total and as earlier giving; nothing else in a backfill messages donors. Owners derive their own gates from the one fact; approving a backfill approves data only. The old system keeps its donor duties, including its thank-you messages and staff/missionary gift notices, through the tail by default. Staff and missionaries see "{previous system} · gifts shown up to {Month D, YYYY}"; donors see how to change, cancel or move their arrangement; never "legacy gift" or "updated". Arrangements are judged like any outside arrangement up to their covered-through date; later expected gifts are "not yet reported", and a late backfill raises one reminder to the Switch lead. Ends work exactly like Asym ends (a decline is never a stop; a replacement schedule is a continuation unless staff say otherwise); moves and planned closure ends produce no end signals; movers get no welcome; a charge after a move is real and flagged for refund. Charges Asym did not create never become Asym gifts. Each backfill review lists stops, continuations, leaks and possible double giving.

## Considered options

- **Silent history (A):** rejected; hides stops from staff and missionaries.
- **Treat tail gifts like Asym gifts (B):** rejected; duplicate, late thanks and false first-gift signals.
- **A tail-only "legacy gift stopped" notice; a year-long hold on missed-gift signals; replacing owners' markers:** rejected as inconsistent with Asym's own arrangements, hiding real stops, or breaching C3.

## Consequences

- Owner requirements O17 (rewritten), O32 (Phase 28), O33 (Phase 34/35 with 13, including the Workflow Studio wording edit), O34 (Phase 14) and O35 (Phase 13).
- No Legacy Tail Backfill commits until owner gates pass a zero-donor-messages test.

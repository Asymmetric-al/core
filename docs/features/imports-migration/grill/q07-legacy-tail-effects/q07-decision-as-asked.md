# Q7 — Legacy gifts after the switch: decision as asked and chosen

Founder answer (2026-11-02): **"c, but be sure we are within best pratices. Think of edge cases, but don't over-engineer or make it needlessly complex."** The founder then required a full adversarial review before recording.

## Options as asked

- **A. Silent history** — tail gifts trigger nothing; they only appear in records and totals. Cost: missionaries never learn when a legacy monthly gift stops.
- **B. Treated like Asym gifts (no receipts)** — Asym's normal donor and missionary workflows run. Cost: duplicate, weeks-late thank-yous; welcome series for long-time donors; false first-gift and started-giving alerts.
- **C. Silent to donors, honest to staff (chosen)** — no donor messages; visible and clearly labelled to staff and missionaries; one alert when a legacy gift stops.

## Option C as proposed (six parts)

1. **Nothing donor-facing.** A tail gift, refund or chargeback never triggers an Asym message to a donor (no thank-you, welcome, first-gift, milestone, tribute or refund notice). The old system keeps every donor-facing duty for its own donors through the tail; clarifies Q1 clause 7: any thank-you automation it already runs for those gifts stays on, with an owner and end date.
2. **Visible and labelled.** Tail gifts appear in donor, missionary and staff views and count in totals, labelled "Given through {previous system} · updated {date}".
3. **No false signals.** A tail gift never counts as a first gift, new supporter, "started" or "recontinued" giving, or a milestone. While a legacy arrangement is in the tail, missed-gift and lapse alerts for it are held; it shows "Updates from previous system · last {date}".
4. **One alert that matters.** If a batch shows a legacy gift has stopped (donor cancelled, card failed, or it ended), other than by moving to Asym, the ministry and that supporter's missionary get one "Legacy gift stopped" notice so they can follow up.
5. **Handover.** When a tail donor re-authorizes in Asym, they get the normal confirmation of their new recurring gift, never a welcome or first-gift message; their first Asym gift is not a "first gift".
6. **One marker everywhere.** Workflows recognise both imported history and tail gifts by Q4's **Recorded outside Asym** fact, replacing three inconsistent markers. Approving a Legacy Tail Backfill approves the data only, never the effects.

Proposed owner touches: Phase 34/35 (single marker; backfill approval approves data only), Phase 28 (labels; stop notice), Phase 16 (lapse hold; handover confirmation), Phase 14 (no tribute letters from tail gifts), Phase 25 (donor labels, extending O24).

## Context

- Ratified Q1–Q6: `grill/decision-log.md` §1 (Q1 clauses 6, 7; Q4 Recorded outside Asym; Q5 roles; Q6 Practice copies); glossary `docs/features/imports-migration/CONTEXT.md`; ADRs `docs/features/imports-migration/docs/adr/0001-0006`.
- Research: `research/q07-r1-repo-tail-effects.md` (no Asym donor thank-you besides tax receipt; one-time acknowledgment deferred in Phase 17; three inconsistent skip markers; WR:25 "reviewed bounded backfill" collision; Phase 16 7-day structured-feed review window; Spark "New Contribution" automations undecided in Q1; refund notices; handover DON-09; consent classes), `research/q07-r2-external-stewardship.md` (vendors silence imports to donors; Bloomerang re-entry hazard; per-gift acknowledgment status; MPDX/TntWare missionary alerts; lapse assumes timely data; CAN-SPAM/CASL transactional).

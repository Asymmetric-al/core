# Q4 — Switch-year tax documents: decision as asked and chosen

Founder answer (2026-11-02): **"yes I choose A. Just make sure it's not over engineered or overly complex, but will be fully functional."** The founder then required a full adversarial review before recording.

## Question as asked

For the switch year (the tax year in which a ministry's Switch Boundary falls), should official tax documents come from whichever system received or charged each gift (A), with all eight parts below?

Alternatives offered: **B** one combined US year-end acknowledgment from Asym listing every switch-year gift (Canada as A); **C** Asym issues every switch-year document in both countries, including Canadian receipts for gifts not yet receipted at the switch.

## Option A as proposed (eight parts; ★ = changes an earlier decision or sets financial policy)

1. ★ **Who issues.** Official tax documents follow the system that received or charged the gift; Asym never issues one for an imported or tail gift. US: if the old system already sent per-gift receipts, the ministry may skip the old system's year-end statement. Otherwise (Canadian annual receipting, or gifts never acknowledged) the old system must issue its part of the year.
2. ★ **The old system stays usable through tax season.** Amends Q1: a Switch cannot be marked closed until the old system has issued its documents for the switch year, and for any later year in which it charged tail gifts (at most two tax seasons with Q1's 12-month tail cap).
3. ★ **Every imported gift records its receipt status:** receipted by the old system (with receipt number where the export has it); not yet receipted at the switch; not the ministry's to receipt (CanadaHelps, donor-advised fund, fiscal sponsor); unknown. Asym never receipts any of these. "Not yet receipted" and "unknown" go on the readiness checklist.
4. **Late tail gifts never create Asym paperwork.** A gift the old system documents that arrives after a statement run has started needs no document action from Asym.
5. **One honest full-year view.** The donor portal and the optional Support overview list every switch-year gift, each labelled with where its tax document comes from; the portal's "this year so far" total explains the split.
6. **Timing advice, not a rule.** Recommend a 1 January switch where practical; warn against November or December.
7. **Donor notice.** Asym provides a plain template ("Gifts before {date} are on a statement from {old system}; keep both"); the ministry sends it through its usual channels; imports send nothing.
8. **Canada.** Asym's receipt numbers start at the switch with a prefix distinct from the old system's; the ministry keeps the old system's receipt copies for the CRA retention period; the readiness checklist confirms where they are kept.

## Context

- Ratified Q1 (switch model, Legacy Recurring Tail ≤12 months, old system receipts what it charges, Switch live/closed), Q2 (evidence), Q3 (SiteStacker direct support; any system via templates): `grill/decision-log.md` §1; glossary `docs/features/imports-migration/CONTEXT.md`; ADRs `docs/features/imports-migration/docs/adr/0001-0003`.
- Research: `research/q04-r1-asym-receipt-statement-contracts.md` (Asym owner contracts), `research/q04-r2-tax-rules-and-vendor-practice.md` (IRS/CRA, vendor practice).
- Discrepancies recorded: D4 (Phase 7 E3 vs C7), D26 (Late Fact Obligations), D27 (portal "this year so far"), D28 (boundary vs tax time zone).

# Q13-R3 — Owner-text verification for Option A (all history, gift by gift, history only)

Read-only. Baseline develop `629cb71dc`, 2026-11-03. This file extends `q13-r1` and does not repeat r03/q01-r4. Path keys follow r1. Additional keys:

- **ADR106**: `docs/adr/0106-reconciled-field-account-opening-position-and-operational-cutover.md`
- **P28P/P28R**: `phase-28-…/proof.md` and `relationships.md`
- **WS07/WS03**: `docs/prds/workflow-studio/07-core-workflow-catalog.md` and `03-runtime-and-recovery.md`

Nothing here is ratified intent.

## 1. Phase 13 D.6 adopted gift

**Quotes**

- **D.6 contents.** D.6 is five bullets, including:
  - "PAYMENT = already-succeeded (an externally-sourced marker; no Stripe reconciliation attempted)"
  - "POSTING = eligible immediately, stamped with a pre-Asym provenance boundary"
  - "REVIEW = bypassed unless donor-match or allocation is ambiguous" (P13:1029-1039)
- **Records.** An adopted gift uses the ordinary header, lines and postings plus separate payment and review records (:1025-1026, :1738-1767). No column carries the provenance stamp. The nearest candidate is the header's "immutable initial-post/freeze provenance" (:1738). _Unverified._
- **Identity.** Legacy references are "scoped to the exact tenant, connected account, livemode, source object" (:723-725). The idempotency list (:821) has no import key. This confirms D23 and O16.
- **Purpose.** Each line freezes a "restriction-or-preference class … or typed `not_applicable`/`not_captured`". "Missing or ambiguous accepted-purpose authority blocks the affected line" (:1750-1761).
- **Reversals.** `reverses_posting_id` is nullable (:1767). A reversal is rejected if it "exceeds the header's effective total" (:1936). Out-of-order provider events are "quarantined with backoff" (:1015). D.6 pre-advances only the original gift. It names no payment state for a historical refund or chargeback, and PAYMENT moves only on "exact signed provider confirmation or the qualified Phase 13/15 offline source command" (:1797).
- **Events.** Outbox facts "commit atomically" (:1787). The `contribution.corrected` and `refund.posted` events are consumed by Phases 7, 18, 17 and 6 (:878-885). A `credit_recheck` event is "consumed by Phase 14" (:852). Matching `received → reversed` is "driven by Phase 13 domain events" (P7:240; P14:891). Phase 21 derives candidates from "an exact eligible Phase 13 posted money-designation occurrence" (FAO:191-192). D.6 has no event-suppression clause.
- **Frozen facts.**
  - The legal donor is "frozen … at acceptance … Corrections never silently change the legal donor" (:225, :890).
  - `gift_method` and `legal_issuer_id` are immutable (:1738).
  - A DAF gift's legal donor is the sponsor (:1814). A matching gift's legal donor is the employer (P7:240).

**Verdict.** Confirms r1 and extends it.

**Implication.** The fallback "else 'history not yet covered'" works for overlays that can be added later: soft credits, tributes and recognition. It does not work for facts frozen at first commit: the DAF sponsor or matching employer as legal donor, the church remitter, and the noncash tender. A DAF gift imported with the advisor as legal donor can never be corrected. Such gifts must carry the fact at commit or wait.

## 2. Phase 21 and the Field Account Operations contract (FAO)

**Quotes**

- P21:73-77, in full: "Exact Phase 13 money-designation postings and qualified D21 realized noncash proceeds become provisional Missionary Support Activity. A prospective source-family **Support Allocation Readiness Policy** determines when each positive allocation may enter a Support Cycle close. Adverse corrections always remain appendable."
- The readiness policy is "prospective, immutable, and bounded by source family" (P21:354-356).
- "Known refunds, ACH returns, chargebacks … MUST NOT be suppressed by tenant policy" (FAO:206-208).
- "`reference_only` MUST remain … structurally unable to affect financial, communication, document, provider, or CRM truth" (FAO:150-151). "Phase 30 MUST NOT reconcile, authorize, or activate a cohort" (:175-176).
- "A late pre-cutover fact is first resolved against its existing manifest disposition. A position-changing fact creates … a new Opening Position Correction" (ADR106:101-104).

**Verdict.** Partly corrects r1. The readiness policy controls _when_ positive allocations enter a close. It neither excludes a source family nor holds back adverse corrections. Double credit is not automatic:

- History committed before activation is already covered by D17's dispositions.
- History committed after activation is first resolved against the existing manifest.

The gap is real in two places:

- (a) No text keys D.6 rows to the original gift time rather than the ingestion time.
- (b) Imported historical refunds collide with the no-suppression rule.

`reference_only`'s "unable to affect … CRM truth" also conflicts with history being visible in the CRM. Covering history through `opening_residual` fits better; that is an owner choice.

## 3. Phase 20

**Quotes**

- "Exactly one posting owner applies to each canonical source occurrence under … half-open source-authoritative interval" (P20:1035-1037).
- "Prior records remain attributed to the prior connector or manual workflow" (:1052).
- The processor-cost policy is scoped to a "Settlement Account Binding, source family, and half-open effective interval. It activates only at the next complete settlement boundary" (:1302-1304).
- Assessments: the baseline is "No administrative assessment" (P21:357). A Determination totals only "D2-admitted" allocations (P21:364-366).

**Verdict.** Corrects r1's "unverified". History gets no Posting Intent, fee attribution or assessment, provided its interval is keyed to the original source time and it is never D2-admitted. No sentence names D.6 explicitly.

**Edge case.** Fee-cover refunds use "the original frozen Phase 20 D19 policy" (P13:1569). History has no such policy.

## 4. Phase 7 dating

**Quotes**

- A14: "The first revision is written in the same transaction as the contribution". "A USPS-mailed check uses a captured postmark or a distinct staff-attested actual mailing date rather than the written date". A missing input "produces a typed blocked result" (P7:246).
- "Missing inputs block resolution" (P13:1807).
- "Missing/unqualified date/timezone is unavailable, not guessed" (P25F:127).
- "Legacy funds default to `fully_deductible`" (P7:250).
- `unknown_offline` still requires "batch/deposit evidence" (CO:383-384).

No import exception exists in Phase 7, Phase 13 or CO. O22 bars receipts but does not exempt dating.

**Verdict.** Confirms r1 and extends it. Beyond A15's per-gift attestation, A14 has no basis for a historical check that carries only a gift date, so the resolver blocks it. A missing non-deductible portion would default to fully deductible. That fact would be wrong, though O22/O23 limit the harm.

## 5. Designation lifecycle and missionaries who have left

**Quotes**

- Checkout-only rules: P13:1545 and :1569. Lifecycle-only targets: :1900. "General Fund is the backstop": :1935.
- A Designation is the "tenant-owned purpose target" (`CONTEXT.md:1710`). A Support Assignment is "not a person-… owned fund" (`:4950`).
- "A departed missionary loses the roster at un-assignment; a successor inherits it" (P14:1123).
- "Inactive, departed, retired, and successor accounts remain governed by D5" (ADR106:81).
- Field Account closure happens only after every "future writer … has an explicit disposition" (FAO:513-515).
- "Binding succession never propagates … history … or Giving destination" (P21:536-537).
- A "legacy donor assignment … is not that identity" (P28F:73-75).

No owner term exists for a gift target belonging to a former missionary.

**Verdict.** Extends r1. A Designation is separate from the person, and Phase 14 owns the effective-dated assignment between them. "Closed history-only records" means a retired Designation whose assignment window ends at the source's end date, not a fabricated person. Where a legacy fund was reused for a successor, the mapping must choose explicitly: continue it (the successor inherits the roster, including history) or retire it.

## 6. Site

`site_id` is NOT NULL (P13:196). Phase 2 defaults it to the default site (P2:380), but Phase 24 governs (D14): "historic records … never fall back to the Default Site" (P24DL:404-405). No owner text says how a historical gift gets its Site. _Unverified:_ whether SiteStacker gift exports carry a Site. Site must be a mapped fact; a row that cannot resolve a Site waits.

## 7. Missionary visibility and safety

**Quotes**

- "Missionary sees (v1): … per-path recognized amounts + dates + fund (alias-governed) … NEVER: … notes / … provenance internals / staff notes" (P14:1105). This is a "floor" (:1109).
- The roster covers the trailing 365 days plus the "365–730-day display band" (P14:1095-1097).
- Leak guards: "No member giving to other designations" (:1131). Restricted-tier rows are "OMITTED" (:1114). Rows carry "provenance chips" (:1111).
- Anonymity: "Staff MAY set the per-gift missionary/public visibility preference" (CO:375-377). "Source-approved anonymity SHALL be established positively" (P28P:167-168).
- Restricted names: "the P10 firewall resolves the label to an alias/fund-code … before it freezes into the snapshot" (P13:1763-1765). Alias enforcement applies "via service **or import**" (P10:174).

**Verdict.** Corrects r1 §7. Missionaries do see gift amounts and dates, but only for supporters in the 730-day band. They never see notes.

**Implications**

- **(a)** Missionary visibility reaches about two years back unless Phase 14 or Phase 28 is amended.
- **(b)** Missing anonymity evidence must hide the donor's identity. A "not yet covered" label over a visible name exposes donors who asked for anonymity.
- **(c)** A legacy fund name containing a restricted worker's legal name must not freeze into a snapshot or a visible evidence digest.
- **(d)** The previous-system label fits as a coarse provenance chip.

## 8. Other gift families

- **Matching.** Historical matches import as received pairs (:1865). Their state changes only through "the settlement-writing locked function and the Phase 13 domain-event consumer" (:891).
- **Noncash.** "In-kind posts `recognized_value = 0`" (P15:924), enforced across every channel including "import … regardless of channel" (:926). Phase 13 says instead "the internal FMV IS the non-cash line's `amount_minor`" (P13:1815).
- **Recurring.** Imports never "backfill … cash" (P16:2581). They link only "exact contribution/target links as D11 applications" (:2592).

**Verdict.** Confirms r1. It adds the conflict between P13:1815 and P15:924, which decides how a stock row carrying a dollar amount can commit.

## 9. Phase 25 donor portal

**Quotes**

- "Apply finalized inverse to the original effective gift-date cohort" (P25F:129).
- "Negative output is a source invariant failure" (:131).
- "Unknown imports remain quarantined" (:195).

**Verdict.** Extends O24. An orphan refund, whose original falls before the start year, would drive a cohort negative. Orphans must not post.

## 10. Roadmap and owner-constraints for Phase 30

**Quotes**

- "No mass welcome, first-gift trigger, account grant or new receipt merely because a row was imported" (roadmap:4365).
- "Reversal must not … rewind financial history" (:4371).
- Undo is blocked once a "Field Account entry, Accounting Release … covers a fact" (OC:380-383). OC also requires "batch-origin event suppression" (:387-388).

**Scale.** No owner gives a staff-migration size. The only figures are 10,000 rows for missionary self-import (P28R:473) and "no request or transaction loads universal history" (P21:680-682).

**Verdict.** Confirms. OC:373-374's "re-import updates" cannot apply to posted money (P13:1729-1734), so a re-import must converge or report a conflict.

## 11. Retention

Phase 38 owns erasure (P1:783-786). "GDPR-erased donors remain pseudonymized and must not be re-identified" (P13:746-747). Retention must not be "assumed indefinite" (P25F:159; P28F:53).

**Verdict.** New finding. No owner text sets a retention period for financial history, so nothing forbids importing every year. Nothing authorizes indefinite retention either.

## 12. Coverage start (O2 and O3)

"Phase 30 supplies import provenance and history coverage" (roadmap:4675); "incomplete history cannot prove a first gift" (:4876); "No inference from incomplete import history" (WS07:1163); imported events carry `historical=true` (WS03:25).

O2 and O3 are still unowned. If the start year is less than two years before the Switch, the 365–730-day band is incomplete and must show that limitation (P28P:192-193).

## Corrections to r1

1. **§3 double credit.** r1 overstated the risk for positive allocations: D17 and ADR106:101-104 already handle pre-cutover facts. It understated the risk for imported reversals (FAO:206-208).
2. **§3 fee and assessment.** Both are structurally excluded if history is never D2-admitted (P20:1302-1304; P21:357-366).
3. **§3 Posting Intent.** P20:1035-1052 already assigns pre-cutover occurrences to the prior owner. The only gap is that no sentence names D.6.
4. **§7 missionary gift-level history.** Answered by P14:1105, but limited to the 730-day band.
5. **§6 table.** DAF and matching cannot be "not covered" and added later, because the legal donor is frozen at commit.

## New gaps

- **G1.** No rule holds a gift whose frozen facts are missing.
- **G2.** Reversals that are orphans, exceed the original or precede it cannot post, and D.6 has no historical refund state.
- **G3.** D.6 events fan out to Phases 14 and 21 and to progress read models. O1 and O33 cover only workflows.
- **G4.** A14 has no basis for dating a historical check.
- **G5.** Restricted workers' legal names can sit in legacy labels.
- **G6.** Missing anonymity evidence fails open.
- **G7.** Missionaries cannot see history older than 730 days.
- **G8.** No rule chooses between successor and retired designation for a reused fund.
- **G9.** Phase 13 and Phase 15 disagree on where a noncash value goes.
- **G10.** No rule says how a historical gift resolves its Site.
- **G11.** The large-gift and restricted-ministry predicates (r03 D-7) would push years of history into review.

## Owner requirement candidates (requests)

1. **Phase 13.** D.6 should commit a gift only when its donor role, tender, Legal Entity, Site, currency, target and dating are all present; otherwise the gift waits visibly.
2. **Phase 13 with 7.** A historical reversal should post only against an imported original, by exact reference, after that original and up to its total. D.6 should define historical refunded, returned and disputed payment states.
3. **Phase 21.** D.6 history and its reversals should be predecessor facts keyed to the original source time, never D2 candidates and outside FAO:206-208. Name the D17 disposition.
4. **Phase 20.** State that D.6 history sits in the previous owner's interval with no cost policy.
5. **Phase 7.** Add a "source-recorded date" basis for gifts recorded outside Asym, with no per-gift attestation.
6. **Phases 10 and 13.** Run legacy labels and evidence through the Phase 10 firewall before the snapshot freezes.
7. **Phases 14 and 28.** Make missing anonymity evidence hide donor identity. Decide whether missionaries see history older than 730 days.
8. **Phase 14.** Treat departed missionaries' targets as retired, end-dated Designations; a reused fund needs a continue-or-retire choice.
9. **Phase 13.** Mark D.6 events `historical=true` and have every consumer honour it (extends O1).
10. **Phases 13 and 15.** Rule where a noncash value goes when history is imported.
11. **Phase 13.** Confirm whether D.6 review bypass overrides the large-gift and restricted-ministry predicates.

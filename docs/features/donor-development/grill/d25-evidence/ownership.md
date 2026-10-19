# D25 — reported gifts awaiting finance, owned by the intake source

2026-10-10 UTC. Founder selected Q25 A and requested the full review. Research
against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and D22–D24. This
appendix proposes source qualification; it changes no formal owner contract,
implementation, issue or live state. Existing source text is planning authority,
not evidence that the intake product is implemented.

**Recommendation: Accept A, conditional on the explicit additive P15 contract
below being reconciled through the authorized formal-specification workflow
before release.** The question already requires this source extension; it is not
a hidden P27 money writer or a reason for another series of founder micro-votes.
Merely showing all draft gifts as “in hand” would be incorrect. The larger
alternative—an independent P27 custody register with its own reconciliation—is
unnecessary and conflicts with the selected single intake owner.

## Primary evidence and scope

- **E1 — Choice:** [Q25:26–76](../phase27-q25-gift-handoff-visibility.md:26)
  requires an applicable pending item, responsibility and existing intake link;
  distinguishes actual handoff evidence from drafts/promises/dates, preserves
  finance owners and explicitly requires a narrow source seam before release.
- **E2 — One intake front door:** [P15:429–480](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:429)
  owns one staging/validation/commit domain, including batch-of-one Quick entry;
  posting is not generic contribution-operations batch execution. Draft validation
  is not money. [531–540](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:531)
  carries unresolved rows into a linked follow-on draft while committing a clean
  subset atomically. [389](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:389)
  archives abandoned drafts to audit rather than silently deleting them.
- **E3 — Existing fields do not establish custody:** [P15:1955–2018](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1955)
  defines incomplete staged rows, batch-scoped row identity, committed-header
  linkage, check dates and cash receiving staff. It does not define a current
  physical-handoff occurrence, report resolution or responsible-person transfer.
  [P7:246–248](../../../../prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md:246)
  and [305](../../../../prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md:305)
  make received/mailing evidence inputs to exact-issuer tax dating, not custody
  or a general “Received” status.
- **E4 — Separate immutable money and operational state:** [ADR0206:19–64](../../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md:19)
  freezes every posted financial column, including later additions, and keeps
  payment/review, deposit/return, acknowledgment and document states with separate
  owners. [Governing contribution OpenSpec:3–20](../../../../../openspec/changes/sitestacker-parity/specs/contribution-operations/spec.md:3)
  repeats this rule and allows draft edits only through their owning contract.
- **E5 — Posting, deposit and bank facts differ:** [ADR0007:22–55](../../../../adr/0007-undeposited-funds-deposit-model.md:22)
  makes deposits independent of batches and posting, with gift-grain membership;
  deposit-first and entry-first are both valid. [P20:409–431](../../../../prds/sitestacker-parity/phase-20-accounting-exports-reconciliation.md:409)
  separates source occurrences, Bank Evidence, accounting releases and external
  books; [903–919](../../../../prds/sitestacker-parity/phase-20-accounting-exports-reconciliation.md:903)
  excludes pending bank observations from confirmed Bank Match. [Donation
  OpenSpec:44–66](../../../../../openspec/specs/donation-lifecycle/spec.md:44)
  preserves independent payment, posting, receipt and delivery folds.
- **E6 — Received and fulfillment:** [P16:1101–1105](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1101)
  reads Received from the P13 effective ledger; ACH processing is not Received.
  [P16:74–78](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:74)
  reserves conserved applications to qualified posted lines and source-proven
  instructions, not matching names/amounts/dates. [P15:252–267](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:252)
  permits recorded checks before clearance and keeps cash risk review; therefore
  “recorded by finance” cannot mean irrevocably cleared.
- **E7 — Protected owner paths:** [P15:100–124](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:100)
  separates Party identity, P12 powers, credit, receipt authorization, document
  generation, communications and accounting. Its dated REAL/FORWARD assertions
  are not freshly verified runtime state. [P15:271–282](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:271)
  distinguishes bank-direct rails and noncash source facts; noncash is describe,
  not staff valuation. [ADR0183:24–69](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24)
  and [71–100](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:71)
  require exact source-owned work, current recipients and truthful task end.
- **E8 — Prior decisions:** [D22:22–63](../phase27-d22-adversarial-review.md:22)
  keeps request/response/source outcomes distinct; [D23:21–57](../phase27-d23-adversarial-review.md:21)
  approval supplies no finance power. [Q24:62–83](../phase27-q24-appeal-working-audience.md:62)
  and the [ratified D24 review](../phase27-d24-adversarial-review.md)
  preserve actual history and independent obligations after appeal-list changes.

## Exact proposed additive P15 owner requirement

> P15 SHALL support a narrow, source-owned reported-gift intake occurrence for
> an explicitly reported actual offline gift needing handoff or financial entry.
> It SHALL preserve the reporting actor/time, the attributed receipt/handling
> assertion and its time precision, currently accountable next actor or owned
> unresolved exception, permitted source context, and exact lineage to intake,
> staged gift and any eventual canonical contribution. Reporting SHALL create no
> money, legal-donor finding, accepted gift valuation, tax date, deposit, receipt,
> acknowledgment, fulfillment or communication authority.
>
> Where donor identity, financial Legal Entity, tender details or amount remain
> unresolved, the source SHALL retain a scoped unresolved intake occurrence
> without inventing them or creating a guessed financial root. A trusted Tenant
> and qualified intake-purpose authorization remain mandatory; unresolved entity
> is not wildcard financial access. The same occurrence SHALL continue through
> authorized finance resolution and the existing batch staging/commit path,
> rather than being copied into a second independently writable gift.
>
> The source SHALL expose a current, permission-qualified handoff projection and
> commands to record/correct the report, maintain accountability, connect exact
> intake lineage and record truthful resolution. A normal posting through linked
> intake SHALL establish the accepted contribution lineage and resolve only the
> awaiting-recording action, coherently with the local source transaction and
> required downstream intent. Any outstanding physical-handling or deposit action
> SHALL retain its own source predicate and responsibility.
> If a contribution already exists independently, authorized reconciliation SHALL
> bind the actual source once; neither missing projection nor a lost response
> permits another posting. Financial, custody and work outcomes remain distinct.

This is an **additive normative proposal for later `/to-prd` reconciliation**,
not text already present in P15. It extends P15's operational intake surface;
its sole money-creation path remains unchanged. No physical table count, separate
custody ledger, generalized chain-of-custody engine, new scanner or extra dual
approval is prescribed.

## Smallest coherent meaning

An authorized human reports a real check or other source-qualified offline gift
already handed over, not a promise that one is coming. The record is attributed
evidence of what staff report; it is not a guarantee of continuously verified
physical possession. Reporter, reported holder/receiver and next responsible
person are different facts. Changing the responsible person does not attest that
the physical gift moved. Record a reported transfer explicitly when needed, without
requiring a second person's acknowledgment merely to perform routine handoff.

One actual gift/tender intake has one source occurrence even when it has several
designation lines or permitted appeal references. Different checks remain
distinguishable; a remittance's recognition parties do not multiply its money.
An uncounted envelope or ambiguous collection can remain unresolved intake until
the owner establishes its constituent gifts; no guessed zero, donor, currency or
fabricated per-appeal split. Known reported amounts are labelled reports, separate
from all received/fulfilled totals. Finance's eventual amount may legitimately
correct the earlier report while preserving both meanings.

Finance receiving the item or starting a draft does not itself establish the
recorded contribution. The awaiting-recording projection resolves from exact
accepted source linkage; a carrier's handoff task may end earlier only if its
own action is truly complete and remaining finance responsibility is preserved.
Posting a check can complete the recording facet before physical transfer,
deposit or clearance. The same item may truthfully show **Recorded by finance**
while a source-owned **Send original check** action remains; reuse qualified
handling/deposit work rather than adding another appeal queue. Conversely,
handing it to finance is not posting. Do not make financial posting wait for a
physical deposit the owner allows to happen later.
A later NSF/reversal changes financial truth through its owner; it does not
pretend the gift was never handed over or blindly reopen the old intake task.

## Concerns, severity, conditional likelihood and exact proof

Likelihood is a design judgment, not a measured incident rate.

| Concern and grade                                                                                                      | Required correction / effect                                                                                                                                                                                                                                                                                                                             | Acceptance proof                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R01 — Draft/date masquerades as custody. High; likely with a status-only projection.**                               | E1–E3. Require the explicit source report above. A date, note, promise, batch save, default tender or received-by field alone cannot imply a live handoff. Current responsibility never proves physical movement.                                                                                                                                        | A draft check and “check coming” note produce no in-hand item. A deliberate receipt report does. Reassigning work leaves the custody assertion unchanged.                                                                                                                                                                                           |
| **R02 — Incomplete report guesses financial identity/scope. Critical; plausible in a quick form.**                     | E2–E3, E7. Preserve typed unknowns in qualified unresolved intake. A chosen appeal, reporter affiliation, check presenter or church representative cannot silently establish legal donor, issuer or currency. Resolve before creating the financial root.                                                                                                | Anonymous cash, unclear issuing entity and missing amount remain actionable without fake Party/$0/default currency. Neither reporter nor recipient gains finance/read authority.                                                                                                                                                                    |
| **R03 — One gift becomes many because of appeals/splits/reports. Critical; plausible across teams.**                   | E4–E6. Use stable intake identity and explicit source reconciliation through carry/rebatching/posting; multiple appeal views reference it. Heuristic matching may suggest, never establish equivalence or fulfillment. Duplicate report closure names its source resolution rather than deleting evidence.                                               | Two staff report the same check; finance reconciles one intake/gift and retains both reports. One check with three designations and two appeals posts once; distinct equal-value checks are not auto-collapsed.                                                                                                                                     |
| **R04 — Archive/cancel hides real unresolved money handling. High; likely if draft lifecycle drives task end.**        | E2, E7–E8. Archive of a draft, removal from an appeal, request withdrawal or journey closure cannot silently resolve physical/intake responsibility. P15 owns reported return, mistaken report, duplicate resolution and loss/uncertainty dispositions. A lost/unlocated gift retains an owned exception until the actual source obligation is resolved. | Abandoned batch with a reported check keeps source-visible recovery. “Entered in error” preserves attributed correction; genuine returned-before-posting evidence creates no fictitious reversal. Posted return invokes the financial owner.                                                                                                        |
| **R05 — Post/retry resolves the wrong gift or posts twice. Critical; plausible after lost response.**                  | E2, E4. Normal linked commit preserves exact occurrence→staged-row→accepted-header lineage and local required history/receipt/outbox coherently. Reconcile already accepted results before another write; a P27 cache cannot certify completion.                                                                                                         | Commit wins and response is lost: same source result resolves the recording facet, zero second posting; required original-check transfer remains. Carried row retains original intake identity. Wrong link correction preserves history and current responsibility.                                                                                 |
| **R06 — Pending handoff becomes received/deposited/cleared/tax-dated. Critical; likely with Received/Given labels.**   | E3–E6. Label pending intake separately; exact P13/P15/P7/P20 states retain source names/basis. Posting resolves awaiting-recording only, not physical transfer or deposit; work ends at its narrow source-action predicate. Posted operational updates use separate owner records, never financial columns.                                              | Check posted but undeposited: recording resolved, no clearance claim and remaining handling still visible. Deposit-before-entry remains possible. Handed to finance but not posted remains awaiting recording. ACH processing is not this physical-handoff fact or Received. NSF alters the financial projection without rewriting handoff history. |
| **R07 — Shared task becomes another intake ledger or grants access. High; plausible with copied payloads.**            | E7. One qualified source occurrence projects actual work, not one task per appeal. Eligible reassignment or a visible source-owned exception preserves responsibility; no guessed administrator/queue. Tasks and notifications reference minimized source details; generic Complete/read/archive cannot certify posting or physical transfer.            | Two permitted appeal views show one source work identity. Authority loss removes protected projection and leaves owner recovery. No check image, bank routing data or donor-private body leaks through title/export/log.                                                                                                                            |
| **R08 — Reporting grants posting/approval/receipt authority. Critical; plausible when reusing broad finance actions.** | E1, E4, E7–E8. Qualify narrow report/read/handoff powers separately from finance recording, risk review, donor matching, valuation, deposit and communications. Existing P15 cash/high-risk controls remain; D23 request approval is unrelated.                                                                                                          | Appeal staff report a check but cannot post/refund, bypass cash review, mark commitment fulfilled or issue receipt. Noncash description creates no appraisal or second proceeds gift.                                                                                                                                                               |
| **R09 — Restoration, closure or late evidence replays work. High; conditional on migration/recovery.**                 | E4, E7–E8. Preserve lawful history and current restrictions. Restore/import cannot synthesize current physical possession or revive resolved work. Source correction of a mistaken completion may create genuinely required successor work, not mutate an ended task into a new occurrence.                                                              | Late posting for removed appeal member resolves its recording facet without ending remaining physical handling or re-enrolling/contacting them. Later reversal uses new owner work if required. Restore reuses confirmed source receipts, not another gift.                                                                                         |

## Source conflicts and qualification boundary

P15's historical schema sketch [1993](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1993)
says a deposit pointer lands on a posted header. This is superseded by ADR0206 and
the explicit [P15 C-02 amendment:1421](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1421):
deposit membership is separate gift-grain operational state. Likewise do not adopt
the old three-state row sketch at 1990–1991 over the amended two-state offline
carry rule at 531–540. D25 must not reopen these resolved owner decisions.

The required addition is the explicit P15 reported-handoff occurrence and its
safe projection/commands—not a wholesale finance dependency. Its actual intake
authorization, staging/posting lineage, correction/disposition, shared task and
retention contracts must be implemented and tested before A releases. Downstream
receipt generation/delivery retains P15's [split activation gate:120](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:120).
Financial association/attribution remains separately governed; attaching this
handoff to an appeal does not decide which posted amounts count toward that appeal.
No claim of completed runtime qualification or full Phase 27 readiness follows.

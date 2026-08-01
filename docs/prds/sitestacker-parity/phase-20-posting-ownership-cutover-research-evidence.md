# Phase 20 Posting Ownership Cutover — Research Evidence

**Decision candidate:** D17
**Status:** Ratified as Phase 20 D17 with post-adoption adversarial hardening
**Date:** 2026-07-26
**Scope:** Transfer of accounting-posting ownership into Asym without overlap,
omission, or invented historical evidence

This dossier supports the next Phase 20 founder decision. It is not a PRD,
implementation specification, issue set, or authorization to build.

## Why this is the next decision

D5 already establishes one posting owner for a source interval, requires an
effective start, and blocks known overlap. D7 and D8 preserve that invariant,
but Phase 20 does not yet define the operating contract for:

- ending another connector or manual posting workflow;
- selecting a safe source boundary;
- determining what remains owned by the previous workflow;
- inspecting existing QBO or Xero records without overclaiming proof;
- optionally linking prior records;
- filling a genuinely unposted historical gap; or
- assigning late refunds, disputes, reversals, and corrections.

D2 governs the lane for an already frozen Accounting Release. D3 and D14 govern
destination identity and succession. D12 governs cadence. D16 governs a frozen
staff-import package. None determines which posting system owns a source
population before release.

This gap is critical because a technically perfect Accounting Release can still
duplicate or omit the books when two systems post overlapping source work.

The same invariant must cover every source family that enters Phase 20,
including processor settlements, frozen offline Deposit Groups, and future
Phase 21 approved-expense or reimbursement facts. D17 must not move receipt
capture, approval, reimbursement, or field-account truth into Phase 20.

## Current provider facts

### QuickBooks Online

- QBO `requestid` protects retries of requests made by the same integration. It
  cannot identify or deduplicate a record created earlier by another connector
  or manual workflow. `DocNumber` is not a universal provider idempotency key,
  and duplicate-number behavior depends on company preferences. See
  [Intuit field definitions and retry guidance](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
  and [common API errors](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/handling-common-errors).
- Historical inspection is provider-entity-specific. QBO queries one entity
  type at a time, and Change Data Capture is a bounded recent-change surface,
  not proof of all historical absence. See
  [QBO data queries](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/data-queries)
  and [QBO Change Data Capture](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture).
- Intuit's own
  [Square connector](https://quickbooks.intuit.com/learn-support/en-us/help-article/manage-integrations/connect-manage-square-transactions-quickbooks/L0mBsyBTP_US_en_US)
  asks for a starting date, supports a bounded historical import, and routes
  imported activity through review.
- QBO distinguishes matching a bank observation to an existing accounting
  record from categorizing it into a new record. Bank evidence therefore
  cannot prove posting ownership. See
  [QBO transaction matching](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/match-transactions-quickbooks-online/L0MF3Fn6y_US_en_US).

### Xero

- Xero idempotency keys are transient direct-API retry protection. The current
  contract caches responses for six minutes; after ambiguity, Xero recommends
  inspecting the resource before another create. See
  [Xero idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/).
- Provider journals cannot serve as universal cutover proof. Access,
  pagination, history, plan, and use-case constraints differ. See the
  [Xero Journals API](https://developer.xero.com/documentation/api/accounting/journals).
- The ordinary manual-journal importer creates draft journals and has no
  durable Asym-controlled idempotency identity. See
  [Xero manual-journal import](https://central.xero.com/s/article/Add-import-and-post-manual-journals-UK).
- Xero's conversion date is an accounting migration boundary, not proof that
  another connector did or did not post a particular source occurrence. See
  [Xero conversion-date guidance](https://central.xero.com/s/article/Setting-your-conversion-date).

### Comparable-product evidence

- Ramp's
  [ERP migration guidance](https://support.ramp.com/migrating-to-an-erp-without-a-direct-ramp-integration)
  recommends a transition date, draining old-provider work through that point,
  leaving later work unsynced, closing the old period, disconnecting, and then
  activating the new setup.
- Bloomerang exposes a
  [sync start date, preview population, and per-record sync state](https://help.bloomerang.com/en/articles/12632509-bloomerang-crm-to-quickbooks-online-sync-transactions).
- Bloomerang also
  [warns that overlapping accounting integrations can create duplicate data](https://help.bloomerang.com/en/articles/13382604-quickbooks-online-integration-with-bloomerang-fundraising).
- QBO and Xero bank-feed guidance warns staff to check for missing or duplicate
  observations after a feed transition. That is useful operational evidence,
  not proof of accounting-posting ownership.

These comparable patterns support an effective boundary, preview, and
one-owner rule. They are not provider guarantees.

## Required conceptual correction

A calendar date alone is not a safe cutover.

The boundary must be source-family-specific and must keep one natural atomic
source occurrence with one posting owner:

- processor settlement: one whole payout or other frozen settlement unit;
- offline activity: one whole frozen Deposit Group;
- approved expense: one immutable approved expense occurrence;
- reimbursement: one immutable payable or payment occurrence;
- another source family: its source-authoritative eligibility and atomicity
  contract.

A Dec. 31 gift included in a Jan. 2 payout does not justify splitting that
payout between owners. Creation time, economic date, provider transaction date,
and posting-ownership acquisition time remain separate.

## Independent expense, card, and source-family boundary review

D5's existing overlap guard is processor-account-specific. It does not by
itself prevent duplicate expense posting when a tenant also uses a card feed,
bank rule, expense platform, payroll or accounts-payable integration, or a
manual bookkeeper workflow. D17 must therefore distinguish **source-fact
ownership** from **provider-posting ownership**:

- Phase 21 may own approval and substantiation while another system remains the
  sole writer of the resulting QBO or Xero transaction.
- A downloaded bank or card observation is not automatically a competing
  writer. A match-only workflow may coexist with an Asym-created record, while
  categorizing or auto-adding that observation creates accounting work and is
  a competing posting route.
- Receipt presence, card settlement, expense approval, provider attachment,
  and provider posting are independent facts. None proves another.
- A manual workflow counts as a posting owner. The absence of another connected
  app is not proof that Asym owns the interval.

Expense ownership must be bounded at the natural occurrence level defined by
the source contract. At minimum, an organization-paid expense, an approved but
unpaid reimbursement payable, the later reimbursement payment, and a
correction are separate occurrences even when staff see one expense journey.
Likewise, a card purchase and the later card-liability payment are not one
posting occurrence. Cash advances, vendor-paid expenses, mileage, and per diem
remain unavailable until their source-owning phase defines their exact
accounting-ready occurrence and atomicity.

This also constrains D5's shorthand `Bill followed by BillPayment` and Xero
`invoice followed by Payment`: an approved unpaid fact may authorize the
payable only. A payment operation requires a later source-authoritative payment
confirmation and its own posting-ownership disposition. D17 must never turn
approval, a bank-feed observation, or a scheduled reimbursement into proof that
cash moved.

For each enabled expense or card source family, activation must record the
source system, source account or instrument where applicable, prior posting
route, next posting route, effective boundary, in-flight-work disposition, and
whether QBO/Xero bank-feed handling is match-only or create/categorize. If an
external expense system continues to post that family, Phase 20 may retain
approved source and provider evidence but may not create a competing Accounting
Release for the same occurrence. Ambiguity blocks only that family or account;
it does not disable unrelated settlements, deposits, or expenses.

## Options

### Option A — Clean forward-only takeover

Asym begins with the next complete source-family boundary after the previous
workflow is disabled and drained. It never links or posts earlier history.

**Advantages**

- Smallest and safest contract.
- No Asym-created historical duplicates.
- Fastest onboarding for clean books.

**Costs**

- Prior records remain outside Asym's detailed provider evidence.
- Genuine historical omissions cannot be filled through Asym.
- Late corrections against previous-owner records need external accountant
  handling.

### Option B — Historical evidence adoption without backfill

Asym starts prospectively but may inspect and link exact prior provider records
to supported source evidence. It never posts earlier history.

**Advantages**

- Better continuity and support context.
- No historical create operations.
- Can distinguish prior-owner evidence from Asym delivery.

**Costs**

- Provider inspection may be incomplete.
- Existing records may lack exact source references.
- Cannot repair genuine gaps.
- Fuzzy matching creates a dangerous temptation to overstate certainty.

### Option C-prime — Proof-gated bounded takeover

Forward-only takeover remains the quiet default. Tenants may optionally inspect
and link exact previous-owner records, and may backfill only a closed population
proved not to have been posted.

**Advantages**

- Preserves the safest normal path.
- Supports real migrations requiring historical continuity.
- Prevents both duplicate books and silent gaps.
- Works across direct and staff-mediated delivery lanes.

**Costs**

- Requires an explicit ownership contract and coverage review.
- Some history remains ambiguous because QBO/Xero cannot universally prove
  absence.
- Historical backfill may be impossible in locked periods or unsupported
  provider shapes.

**Recommendation:** Option C-prime, with the hardening below.

## Hardened C-prime contract

### Posting Ownership Cutover

One immutable cutover is scoped by:

- Tenant;
- Legal Entity;
- Accounting Destination and environment;
- source system and account or processor binding;
- source family and Accounting Posting Intent family;
- currency where the source contract requires it;
- previous posting owner;
- next posting owner; and
- one source-family-specific half-open ownership interval
  `[effective_from, effective_to)`.

The interval uses a source-authoritative boundary discriminator rather than one
generic timestamp.

Before the first release freezes, authorized staff may cancel or supersede the
proposal. After delivery begins, the boundary never moves backward. A later
change is prospective and any accounting correction follows D11.

### Cutover Coverage Manifest

The bounded review population receives complete, non-overlapping dispositions:

- covered by the previous posting owner;
- linked to exact existing provider evidence;
- proved unposted and eligible for optional backfill;
- assigned prospectively to Asym;
- intentionally excluded with a reason; or
- ambiguous and quarantined.

Every disposition labels evidence strength:

- **Exact** — stable provider identity and effect-equivalent source linkage.
- **Bounded** — a documented provider query or reviewed interval with known
  limits.
- **Staff-confirmed** — authorized testimony with actor, time, scope, and
  reason.
- **Unavailable** — provider or prior-workflow evidence cannot establish the
  result.

The UI may say **No known overlap found in the inspected scope**. It must never
say **No duplicates are possible**.

### Previous-owner evidence

Date, amount, memo, narration, name, or `DocNumber` similarity may produce a
candidate for staff review but cannot establish ownership.

Exact historical linkage requires:

- exact provider organization and environment;
- exact provider entity type and record ID;
- credible source or external-correlation evidence; and
- effect equivalence with the source-authoritative accounting facts.

The result remains **Previous-owner posting evidence**. It is not rewritten as
an Asym Accounting Release or Asym delivery.

### Gap-only historical backfill

Historical backfill is:

- off by default;
- explicitly activated by authorized finance staff;
- limited to a closed, reviewed source population;
- limited to exact work proved unposted;
- pinned to one destination and permitted accounting period;
- revalidated against D4-D8, D11, D14, D15 or D16, and D13; and
- released through normal immutable Accounting Release and delivery contracts.

There is no whole-history replay, fuzzy gap fill, opening-balance
reconstruction through detailed transactions, or “probably not posted”
shortcut. Where proof is unavailable, the tenant may start prospectively and
leave earlier resolution to its accountant.

### Late events and corrections

- An atomic payout, Deposit Group, expense occurrence, or reimbursement
  occurrence remains with one owner even if its dates cross the boundary.
- The original provider record and previous posting owner remain immutable
  provenance. Each refund, dispute, reversal, or correction receives exactly
  one current execution owner.
- If the previous workflow is retired, Asym may compensate a previous-owner
  record only after exact previous-provider linkage or accountant-owned
  resolution through D11. The old workflow is never implicitly reactivated.
- A late-created source record uses its source-family ownership discriminator,
  not whichever date is most convenient.
- An old connector's in-flight or queued writes keep the cutover in review-only
  state until drained, proved excluded, or classified ambiguous.
- Activation serializes the local ownership transition, freezes the first
  Asym-owned occurrence, records previous-owner cutoff evidence, and performs a
  capability-labelled final bounded inspection.
- Because Asym cannot lock an independent connector or manual bookkeeper, a
  bounded post-activation overlap check and normal provider readback remain
  active. A conflicting external write quarantines affected unreleased work
  and opens a D13 case.

### Both delivery lanes

The ownership interval governs direct and staff-mediated Accounting Releases.
D16 download evidence does not prove import. A partially imported package stays
ambiguous and cannot be made eligible for whole-package re-import or backfill.

## Quiet staff experience

Use one four-step review:

1. **Current workflow**
   - identify which connector or manual process currently posts each relevant
     source family;
   - detect known overlapping connections or settings;
   - keep source families owned elsewhere out of Asym posting.
2. **Choose the handoff**
   - recommend the next complete drained boundary;
   - show the corresponding provider period and first Asym-owned occurrence;
   - put custom boundary and optional history controls under **Advanced**.
3. **Review coverage**
   - show one timeline with **Previous workflow**, **Needs proof**, and
     **Asym begins**;
   - show counts, amounts, currencies, and complete source occurrences;
   - collapse clean coverage and foreground only ambiguity or overlap;
   - state that review sends nothing.
4. **Activate**
   - confirm the exact destination and first Asym-owned occurrence;
   - confirm the previous posting route is disabled or non-overlapping;
   - make activation one audited action;
   - begin review-first under D12.

The default should require no historical work. Optional adoption and backfill
remain clearly separated under **Need earlier history?**

There is no mandatory platform-wide second approver. A tenant may require one
through its existing governance policy.

## Critical edge cases

- A payout contains source facts economically dated on both sides of the
  proposed boundary.
- The old connector is disabled but still has queued or timeout-unknown writes.
- The provider's recent-change feed does not cover the historical interval.
- Two legitimate transactions share date and amount.
- A QBO duplicate reference preference is disabled.
- A Xero idempotency window has expired after an ambiguous response.
- Staff downloaded a D16 package but imported only some parts.
- An old provider record was edited, voided, or deleted after inspection.
- Historical backfill targets a closed accounting period.
- Another connector legitimately owns a different source family.
- Destination replacement and posting-owner cutover occur together.
- A late refund relates to a pre-cutover posting.
- A manual accountant adjustment resembles an unposted source occurrence.
- A source record is created after activation but belongs to a pre-cutover
  economic event.
- The previous workflow used a different grain or provider object type.
- A historical provider record combines sources that Asym would now separate,
  or separates sources Asym would now combine.

All ambiguity blocks only the affected source occurrence or source family.
Artifact-always evidence and unrelated source families remain available.

## Post-adoption adversarial hardening

The founder adopted C-prime-R on 2026-07-26. A final adversarial pass preserved
that direction and added the following permanent safeguards.

### External workflows cannot be atomically fenced

Asym serializes its own activation with compare-and-set or an equivalent
exclusion constraint, but QBO and Xero provide no universal lock over another
connector or a manual bookkeeper. Therefore:

- two administrators cannot activate overlapping Asym cutovers concurrently;
- old-workflow disable or drain evidence is recorded;
- activation includes one final capability-labelled bounded inspection;
- post-activation overlap detection remains active;
- re-enabling an old connector creates a D13 conflict instead of silently
  changing ownership; and
- already accepted provider work is never blindly resent.

### Manual drain remains testimony

For a manual previous owner, **drained** means an authorized finance user
identifies the last completed atomic source occurrence and confirms that the
manual workflow will not post later occurrences in Asym's interval.

This is Staff-confirmed evidence. It may authorize a clean prospective start,
but it does not prove historical absence and cannot by itself authorize
automatic backfill.

### Proved-unposted is a positive standard

A negative or empty provider query is insufficient. Automatic historical
backfill requires:

- positive previous-workflow unsynced or export evidence; or
- capability-complete inspection of every certified provider carrier type in
  the bounded population;
- authorized-finance confirmation; and
- no contradictory provider, package, source, or manual-workflow evidence.

Where this standard cannot be met, prospective activation remains available,
but historical work routes to accountant-owned D13/D11 resolution.

### Locked periods do not undo a clean cutover

A locked historical period blocks only the proposed historical work. Period
readiness is rechecked when the backfill Accounting Release freezes and again
before delivery. A new lock never moves the source-effective or
accounting-effective date silently, rolls ownership backward, or redirects
entries into the current period without D11 authority.

### Economic coverage, not labels, establishes exclusivity

Two differently named source families may coexist only when their source
contracts prove disjoint canonical source occurrences and Accounting Effect
coverage.

- A match-only bank feed may coexist with Asym-created accounting records.
- Auto-add, categorize, bank-rule creation, or connector-created accounting
  records are competing posting routes.
- An unpaid payable and its later payment are distinct occurrences.
- Card purchase and later card-liability payment are distinct occurrences.

The Cutover Coverage Manifest is source-complete only for its frozen, explicit
review population. It references source identities and evidence digests; it
does not copy financial truth, create another source ledger, or require staff
to review clean work row by row.

### D16 and D14 remain authoritative

- Package generation or download cannot bypass the ownership fence.
- A partial or outcome-unknown staff import blocks only affected provider
  operations.
- D16 recovery contains only operations proved not imported and never
  re-imports a whole package.
- When destination replacement and posting-owner succession coincide, D14
  first proves and certifies the new destination. D17 then activates
  prospectively against it.
- Existing releases retain their original destination and ownership interval.

## Ratified D17 wording

> **Option C-prime-amended-and-hardened (C-prime-R) — one immutable,
> source-family-specific Posting Ownership Cutover that defaults to the next
> complete drained boundary; records exact half-open ownership intervals and a
> source-complete Cutover Coverage Manifest; uses capability-labelled read-only
> provider inspection and exact provider identity where available; permits
> optional gap-only backfill solely for proved-unposted work; preserves
> previous-owner posting evidence without rewriting it as Asym delivery;
> assigns late events and corrections deterministically; and activates through
> one quiet review-first timeline—without dual-write, date-only ownership,
> fuzzy adoption, universal-history claims, mutable cutoffs, or whole-backlog
> replay.**

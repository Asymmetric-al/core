# Phase 21 — Missionary Field Accounts & Support Balances Decision Log

**Phase:** 21 (`field-accounts`)
**Status:** Implementation-ready planning — D1-D28 ratified; specification published as [#1108](https://github.com/Asymmetric-al/core/issues/1108); not implemented
**Last updated:** 2026-08-02

This log records founder-ratified product and domain decisions for Phase 21.
The implementation-ready contract is the
[Phase 21 PRD](./phase-21-field-accounts.md) and
[`add-field-account-operations`](../../../openspec/changes/add-field-account-operations/proposal.md)
OpenSpec change. This log is not a ticket set, legal opinion, payroll system
design, or authorization to build. Later Phase 21 decisions may add detail, but
they must not silently weaken an earlier ruling.

## D1 — Finance-closed support cycles and independent financial truth

**Founder ruling:** ratified on 2026-07-28.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — tenant-scheduled,
> finance-closed support cycles with independently authoritative Field Account,
> accounting, and payroll truth, plus the binding
> reimbursement-obligation, payment-evidence, and dashboard-truth rider.**

### Operating model

- The tenant chooses its support-cycle cadence. **Monthly** is the guided
  default; a tenant may choose a supported biweekly cadence without creating a
  second accounting or payroll product.
- A cycle moves through one understandable progression:
  **Collecting → Finance review → Closed**.
- Support recorded during an open cycle is visible but provisional. The
  missionary-facing **Finance-confirmed Field Account Balance** changes only
  through a finance close or a later append-only correction with exact source
  coverage.
- A close freezes the exact cycle boundary, included Field Account entries,
  policy versions, actor, and time only after a fresh machine-produced Support
  Cycle Integrity Manifest proves the exact business boundary and captured
  monotonic Phase 21 ingestion cursor. Late facts and corrections append
  through a later governed occurrence; they do not rewrite the closed cycle or
  its archived statement.
- Separately persisted Phase 20, QBO, or Xero evidence may inform a
  tenant-configured operational review, but it is not Field Account integrity
  proof, does not run inside the close publication transaction, and cannot
  overwrite Field Account truth. QBO/Xero-owned final reconciliation remains a
  separate later authority.
- The tenant's payroll or accounts-payable process executes compensation and
  reimbursements. Asym does not hold, move, withdraw, or directly pay worker
  money.

### Durable authorities

| Authority                      | Owns                                                                                                                                                                               | Must not claim                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Phase 13 contribution ledger   | Posted gift, legal donor, Designation, and exact support-allocation source coverage                                                                                                | Field Account balance, compensation, reimbursement, or payment                            |
| Phase 21 Field Account         | Organization-controlled operational allocations, assessments, funding coverage, Support Reallocation occurrences, expense effects, corrections, and finance-closed support balance | Donor ownership, bank balance, GL balance, payroll result, or payment                     |
| Phase 21 expense workflow      | Expense Claim, substantiation, policy decision, Approved Expense Snapshot, and any resulting Reimbursement Obligation                                                              | That approval or funding coverage proves payment                                          |
| Phase 21 reimbursement handoff | Immutable Package, Delivery Profile, Execution Claim, Handoff Coverage, Attestation, Operation, and exact evidence lineage                                                         | Expense approval, external execution, claimant payment, posting ownership, or final books |
| Phase 20 accounting doorway    | Accounting-ready handoff, Accounting Release, QBO/Xero delivery evidence, and drift verdict                                                                                        | Expense approval, Field Account truth, payment execution, payroll, or final books         |
| Tenant payroll/AP system       | Execution and provider-native status of compensation or reimbursement                                                                                                              | Field Account or contribution truth                                                       |
| QBO/Xero                       | Posted books, period controls, and final reconciliation                                                                                                                            | The source meaning of a gift, Field Account entry, expense approval, or payroll event     |

One page may summarize these authorities. Storage, commands, status machines,
and audit history must not collapse them into one mutable `available`, `paid`,
`exported`, `synced`, or `reconciled` flag.

### Binding reimbursement rider

The ordinary staff and missionary experience remains one report-first flow,
but the following facts stay separate:

1. **Expense Relationship Context** — the
   source-owned employee, independent-contractor, volunteer, or unresolved
   classification and applicable jurisdiction at the expense date. It is never
   inferred from `missionary`, Field Account type, or a public worker page.
2. **Expense Claim** — what the claimant submitted, including evidence and
   business purpose.
3. **Expense Policy Decision** — the approved, rejected, returned, or excluded
   line dispositions under the applicable tenant policy and worker
   relationship.
4. **Approved Expense Snapshot** — the immutable approved version and exact
   line coverage.
5. **Reimbursement Obligation** — the exact amount the organization owes when
   approval plus applicable policy or law establishes liability.
6. **Field Account Funding Coverage** — the exact organization-controlled
   support capacity assigned under tenant policy; it is neither liability nor
   cash movement.
7. **Reimbursement Handoff Package and Execution Claim** — the immutable
   minimum-data artifact plus one explicit coverage-scoped executable owner
   created only at release. Package access is non-executing and the handoff is
   not payment.
8. **Handoff Attestation or Reimbursement Handoff Operation** — exact evidence
   that work was handed to the tenant's external process or its certified
   pre-execution draft/input. It is not external execution or payment.
9. **External Payment Occurrence** — an externally executed
   payroll/AP/manual payment fact with evidence and exact obligation coverage.
10. **Accounting-ready expense handoff** — the PII-minimized Phase 21 projection
    that Phase 20 may compile into accounting.

An insufficient Field Account balance may prevent a new prospective spending
authorization or create a finance exception. It must not automatically erase,
reduce, postpone, or relabel a Reimbursement Obligation that already exists or
silently extend an applicable legal, contractual, or policy deadline.
Tenants own policy within applicable law; Asym must not encode one missions
organization’s employee, contractor, volunteer, international-worker,
accountable-plan, or wage rule as universal.

### Missionary dashboard truth

The default dashboard is one calm, mobile-first surface:

- **Finance-confirmed Field Account Balance** — displayed to missionaries as
  **Finance-confirmed support balance**, with a visible **through/as-of date**
  and close status.
- **Support recorded since close** — separate provisional activity; never
  silently blended into the confirmed balance.
- **Next compensation** — cadence and date first. Show an amount only from an
  authoritative tenant-approved plan, Compensation Funding Decision, or
  external result when tenant visibility permits it. Use D4's truthful
  `Planned`, `With payroll`, `Processing`, `Payment confirmed`, or
  `Needs attention` projection; finance decision, handoff, result, and payment
  remain separately inspectable.
- **Ministry expense capacity** — optional and shown only when a deterministic
  tenant policy produces it. It is not cash available to withdraw.
- **Expense and reimbursement progress** — claimant-readable statuses that
  distinguish needs-information, approved, owed, scheduled externally,
  partially paid, **Payment recorded by finance**, and stronger
  **Payment confirmed** only when the exact evidence supports it.
- Primary actions: **Submit expense**, **View activity**, and
  **Download statement**. A contextual **Ask finance about this** action routes
  exceptions without exposing accounting operations.

Tenant terminology may customize display labels, but the underlying meaning
and required explanatory copy remain contract-owned. The UI must not say
`Your money`, `Withdraw`, `Cash out`, `Available salary`, `Waiting for your
donations`, or `Paid` without qualifying evidence.

### Staff operations

- Finance reviews one cycle summary and works only exceptions: incomplete
  source coverage, stale tie-out evidence, assessment differences, unmatched
  corrections, missing expense evidence, funding shortfalls, and ambiguous
  payment results.
- Ordinary clean work does not require duplicate accounting approval or raw
  journal editing.
- The default expense approval path uses one authorized approver. A separate
  approver is required for self-approval, policy exceptions, or tenant-defined
  material/high-risk thresholds.
- Every claim and obligation pins the effective worker relationship and
  applicable jurisdiction at the expense date. An unresolved classification
  may allow draft capture and evidence collection but blocks automatic policy,
  tax, accounting, and payment disposition until finance resolves it.
- OCR and duplicate detection may suggest; a human confirms source facts.
  Missing-receipt declarations, offline/resumable upload, exact splits, request
  changes, and immutable approved versions are required behavior, not separate
  products.

### Failure and correction rules

- If close evidence is stale or incomplete, preserve the last confirmed
  balance and label the update delayed; never fabricate a current total.
- If payroll or AP evidence is absent or ambiguous, show the last truthful
  state and route finance review; never infer `Paid`.
- If an externally submitted payment result is unknown, inspect before retrying
  or recording another occurrence.
- Reversals, returns, corrections, and changed approvals append linked
  occurrences and preserve the original snapshot, close, obligation, payment
  coverage, and statement.
- Tenant, Legal Entity, Support Assignment, Field Account, currency, policy
  version, source version, and actor boundaries are mandatory on every Field
  Account financial authority. Worker/payee scope is additionally mandatory
  only for person-specific expense, compensation, handoff, and payment
  authorities; a participant or payee may be absent and never enters Field
  Account identity or arithmetic.

### Explicit non-goals

- No direct worker payout, payroll engine, bank account, debit card, cash-out
  action, AP aging product, or duplicate QBO/Xero reconciliation.
- No gift-sum or mutable-column Field Account balance.
- No universal short-check, backpay, hold-until-funded, or deficit rule.
- No single report-level `approved`, `available`, or `paid` authority.
- No exposure of donor-private, care-sensitive, or raw receipt data beyond the
  minimum purpose-scoped projection.

### Known current-repo contradictions

These are required clean-cutover inputs for the later Phase 21 specification;
they are not authorization to implement runtime behavior during this grill:

- `packages/missionary/components/balance-card.tsx` exposes **Available Funds**
  and **Withdraw** and must not become the Phase 21 surface.
- the current missionary portal projection and seed data use mutable
  `current_funding` or donation sums for ambiguous support numbers; they cannot
  become Field Account or compensation authority;
- donation-only tiles and charts require activity labels and cannot imply a
  finance-confirmed balance;
- hard-coded/fabricated financial analytics amounts must not survive the clean
  cutover;
- public worker and FAQ copy that promises “100%” goes directly to a worker or
  that a donor has “full control” conflicts with organization discretion and
  control; and
- the separate Mission Control Payouts product is fenced from Phase 21 and
  cannot accept Field Account balance, funding coverage, or expense approval as
  executable payout authority.

### Evidence

- [Phase 21 mission-dashboard and support-cycle research](./phase-21-mission-dashboard-product-research-evidence.md)
- [Phase 20 accounting-ready expense handoff research](./phase-20-accounting-ready-expense-handoff-research-evidence.md)
- [ADR-0059 — Accounting-ready expense handoff](../../adr/0059-accounting-ready-expense-handoff.md)
- [ADR-0062 — Finance-closed Field Account cycles and independent payment truth](../../adr/0062-finance-closed-field-account-cycles.md)

## D2 — Rail-qualified support-cycle admission and quiet missionary gift status

**Founder ruling:** ratified on 2026-07-28 with a binding
tenant-owned-organizational-use and progressive-disclosure missionary-CRM
rider.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — exact source-posted
> provisional support with one prospective, rail-qualified Support Allocation
> Readiness Policy; provider-settlement and offline-deposit/direct-credit
> guided defaults; bounded tenant source-family control; mandatory append-only
> adverse corrections; atomic redesignation and transfer pairs; and one
> exception-first Support Cycle close whose immutable coverage alone advances
> the Finance-confirmed Field Account Balance — with provider evidence and
> close readiness kept distinct from the tenant's organizational-use
> decisions, plus one
> privacy-filtered Support Activity projection that is quiet by default and
> reveals normal, plain-language contribution status only when useful or
> requested.**

### Binding meaning

- An exact eligible Phase 13 **money-designation** posting creates provisional
  support activity. An original noncash posting, recognized value, FMV,
  appraisal, or provider estimate never creates a monetary candidate. Only an
  exact source-final D21 Realized Support Basis with non-overlapping manifest
  coverage may create provisional support activity for a noncash lifecycle. No
  provisional activity changes a closed balance, authorizes compensation or
  reimbursement, establishes a worker right, or makes money available to the
  missionary.
- A prospective, immutable **Support Allocation Readiness Policy** determines
  the evidence a positive allocation needs before finance may admit it to a
  Support Cycle close. The policy is scoped by Tenant, Legal Entity, currency,
  and bounded source family.
- **Support Cycle Admission Coverage** is the immutable record of the exact
  source allocations, policy version, evidence identities, evidence-as-of time,
  and paired effects admitted by a close. Only that coverage advances the
  Finance-confirmed Field Account Balance.
- The tenant organization—not a Stripe state, Field Account entry, dashboard,
  or Asym—decides when support may fund compensation, approved ministry
  expenses, or another permitted organizational use.
- The exact Stripe term `available` may be retained in finance evidence because
  it is a provider-defined Balance Transaction state. It must not become a
  missionary-facing balance, gift status, support label, withdrawal claim, or
  promise that funds are payable.
- **Support Close Readiness** is the internal business meaning. It is not named
  `available`, `settled`, `cleared`, `paid`, `reconciled`, or `synced`.
  The disposable current evaluation has exactly four outcomes:
  `ready_for_close`, `waiting_for_evidence`, `needs_finance_review`, and
  `blocked_by_integrity`. Only immutable Support Cycle Admission Coverage—not
  that projection—has balance authority.

### Guided readiness profiles

The staff setting is presented as **Support inclusion timing**, with one plain
question: “When should recorded gifts be eligible for a finance close?” It is
not a free-form rules builder.

| Source family                                           | Provisional activity starts                                                                                               | Guided close evidence                                                                                                    | Bounded tenant alternatives                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Stripe card and wallet                                  | Exact Phase 13 succeeded posting                                                                                          | Exact linked Stripe Balance Transaction has provider status `available` as of the close fence                            | Admit when the succeeded gift is recorded, or require stronger payout/bank evidence                                             |
| Stripe ACH Direct Debit                                 | Exact Phase 13 succeeded posting; never `processing`                                                                      | Exact linked Stripe Balance Transaction has provider status `available`, while return exposure remains recorded          | Admit at succeeded, or require stronger bank evidence; no universal waiting period that pretends late returns become impossible |
| Check or church remittance                              | Exact Phase 15 commit and Phase 13 posting                                                                                | Exact deposit outcome is `deposited`, or the applicable `direct_credit/no_slip` outcome                                  | Admit when recorded, or require Phase 20 bank evidence                                                                          |
| Cash                                                    | Exact reviewed Phase 15 posting                                                                                           | Deposited                                                                                                                | Permit a governed cash-on-hand attestation, or require bank evidence                                                            |
| Wire or direct credit                                   | Exact source posting                                                                                                      | Exact direct-credit or bounded staff-confirmed bank evidence                                                             | Require an exact Phase 20 Bank Match                                                                                            |
| Refund, ACH return, chargeback, NSF, void, or write-off | Exact Phase 13 inverse posting                                                                                            | Mandatory in the open close or the append-only successor correction lane                                                 | No tenant option to suppress or defer a known adverse effect                                                                    |
| Phase 13 redesignation                                  | Exact sum-preserving negative/positive source pair                                                                        | Both sides admitted atomically                                                                                           | No half-admission                                                                                                               |
| Phase 21 internal transfer                              | Approved balanced debit/credit pair                                                                                       | Both sides admitted atomically; no external settlement requirement because no external cash moved                        | Tenant may add approval and cap policy, but cannot break conservation                                                           |
| Phase 13/15 noncash lifecycle                           | Original gift is activity-only; one exact Phase 15 source-final D21 Realized Support Basis creates the monetary candidate | Immutable D21 quantity/minor-unit manifest, exact finality, fresh authorization, and non-overlapping D17/source coverage | No valuation-as-support, estimate, second gift, fuzzy lot allocation, or staff-forced positive admission                        |

For D21, Phase 15 source finality proves the exact proceeds fact; D2 still
independently evaluates whether that manifest-covered candidate is ready for
this Support Cycle close. Neither fact substitutes for the other, and neither
is missionary availability or payment truth.

The UI offers three understandable presets—**When the gift is recorded**,
**After standard receipt checks** (guided), and **After bank evidence**—then an
optional advanced section for source-family differences. The saved contract
still pins the exact technical evidence. A policy change is prospective and
versioned; it never recalculates a prior close.

### Close fence and correction invariants

- The close pins an exact half-open business-date boundary and a monotonic
  commit-safe Phase 21 ingestion cursor, plus Tenant, Legal Entity, Field
  Account, currency, policy version, source revision, evidence identity,
  evidence-as-of time, and actor. Timestamps alone do not prove completeness.
- Source coverage is unique. Replayed webhooks, syncs, imports, staff retries,
  and repeated closes cannot credit the same allocation twice.
- A staged close performs final compare-and-swap revalidation before one
  logical publication fence. This avoids both a fragile giant transaction and
  a partially published close.
- Missing or stale evidence holds only the affected positive allocation. Clean
  accounts and sources can close without it.
- Staff may always hold a positive candidate. A positive candidate may be
  admitted without automated evidence only through a tenant-enabled,
  permission-gated evidence lane with a required reason and durable evidence.
- Staff cannot admit a processing or unposted contribution, a cross-scope or
  cross-currency effect, a known-reversed candidate, an orphan source, or half
  of a required pair.
- A known adverse event racing the close is either included before the close
  fence or appended immediately through one exact successor correction. It may
  never be omitted to preserve a larger displayed balance.
- Provider outages preserve the last finance-confirmed balance and hold only
  affected positive candidates. They do not downgrade a known adverse fact or
  require QBO/Xero to become the Field Account authority.

`blocked_by_integrity` remains a disposable Support Close Readiness Projection
result. Its durable cause, containment, evidence, owner, repair, and
proof-gated clearance live in a D11 Field Account Integrity Case.

### Missionary Support Activity projection

The missionary experience feels like a smaller, simpler CRM, but Phase 21 does
not create a second donor CRM. It composes:

- Phase 13 effective contribution activity;
- Phase 14's `getSupporterRoster` identity and recognition projection;
- Phase 16's safe recurring-support and payment-health statements; and
- the Phase 3/10/12 projection, restriction, authorization, and revocation
  controls.

Each Missionary Support Activity Projection is scoped to one exact Tenant,
Legal Entity, Support Assignment, purpose, and current Principal/Active Tenant
Assignment authorization. It never unions activity across a Party's Support
Assignments; a Party with several assignments receives separately authorized
views.

Phase 21 owns the balance, cycle, expense, and support-activity presentation.
Phase 14 remains the supporter-roster authority. Phase 28 later owns permitted
contact methods, notes, tasks, appeals, newsletters, coaching, and relationship
workflow. One integrated interface must not imply duplicate authority.

**Default dashboard**

- Show the **Finance-confirmed support balance** with its through date.
- Show **Support recorded since close** as separate activity, not as an
  available or withdrawable amount.
- Show recent gift activity with amount/currency, effective date, safe
  designation alias, and permitted supporter display from the Phase 14
  projection. Recognition paths remain visibly distinct from legal gift money.
- The Phase 14 consumer-specific safety floor wins over broader CRM access:
  display name, coarse city/state, safe support paths/dates, alias-governed
  fund, recency, and typed commitment context may appear; email, phone, home
  address, notes, spouse/household internals, tasks, scores, private provenance,
  and staff notes do not.
- The presence of an ordinary positive row means it was recorded. Do not add a
  repetitive success badge to every row.
- A material source exception—such as `Not received`, `Returned`, `Refunded`,
  `Reversed`, or `Corrected`—remains visible in quiet text because hiding it
  would make the list misleading. An exact `Declined` outcome may appear only
  in optional attempt detail when the source proves it; the private provider
  reason never appears.
- A declined, expired, canceled, or otherwise unsuccessful payment attempt is
  **attempt activity**, never a gift, Gross Support Allocation, support total,
  or Field Account entry. It may appear only when the authoritative
  contribution source has an exact worker/designation-scoped attempt and the
  privacy projection permits it.
- Keep detailed payment/source status, provider evidence, deposit state,
  support-cycle readiness, payout membership, Bank Match, and QBO/Xero state
  out of the default dashboard.
- A stale or overdue finance close, material correction, or returned support
  cannot be hidden behind an optional disclosure. Routine clean status remains
  hidden.

**Optional status detail**

- A keyboard- and screen-reader-operable **View details** disclosure on each
  activity row shows its current plain-language source status and dated
  timeline. A full activity table may offer a **Status** column that is hidden
  by default and whose personal visibility choice is remembered.
- Missionary-facing statuses are a derived projection, never a second mutable
  state machine:

| Display status                    | Exact meaning                                                                                                                 | Must not imply                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Recorded`                        | The gift exists in the authoritative CRM/contribution source                                                                  | Settlement, close admission, spendability, or finality                                   |
| `Processing`                      | The payment source has not yet reached its success outcome                                                                    | Failure or receipt                                                                       |
| `Received`                        | The source authority currently treats the gift as received by the organization                                                | Irrevocability, provider-balance availability to the worker, close admission, or payroll |
| `Not received`                    | An attempt did not result in a posted gift; optional detail may say `Declined` only when the source proves that exact outcome | A debt, donor blame, or private decline reason                                           |
| `Partially refunded` / `Refunded` | Exact source refund coverage exists                                                                                           | Deletion of the original gift                                                            |
| `Returned`                        | A previously received bank/check payment was reversed or returned                                                             | That the original record never existed                                                   |
| `Corrected` / `Reversed`          | An append-only source correction changed or negated presentation/allocation                                                   | Mutation or deletion of prior history                                                    |
| `Under review`                    | Source evidence is ambiguous and finance owns resolution                                                                      | That the missionary must reconcile it                                                    |

- Raw gateway reason codes, insufficient-funds detail, bank information,
  processor IDs, settlement timestamps, close-readiness verdicts, staff notes,
  and accounting exceptions are staff-only.
- `Received` is source confirmation, not a guarantee against a later refund,
  return, or dispute. Later facts update the current projection and append to
  the activity timeline.
- Anonymous and restricted gifts must not be re-identifiable through detail
  expansion, exact timestamps, stable public IDs, household joins, notes,
  tribute data, recurring-agreement metadata, or failure reasons. Server-side
  projection enforces the rule before bytes leave the service boundary.
- Public anonymity, organization visibility, and missionary visibility are
  separate scopes. A known identity withheld from this worker renders as
  `Private supporter`; a source record whose identity is genuinely unknown
  renders as `Anonymous supporter`. Neither row exposes a stable external Party
  identifier, URL token, exact-time fingerprint, location, task link, or
  cross-view correlation key.
- Restricted rows are removed before counts, totals, filters, pagination,
  notifications, exports, and realtime signals. No remainder arithmetic may
  reveal an omitted supporter.
- Assignment is effective-dated and rechecked on every read. Unassignment or
  access revocation removes the live projection and invalidates cached access;
  a successor sees only their currently assigned designation scope.
- Support-cycle Field Account statements—monthly by guided default—summarize
  support and account activity.
  They do not freeze supporter contact data or a donor roster into an archival
  PDF.
- A worker whose relationship or tenant access ends loses current portal
  access immediately; exported statements and durable audit remain governed by
  their own retention and access authorities.

### Staff close workspace

Finance sees one exception-first cycle workspace:

- **Ready for close**
- **Waiting for evidence**
- **Corrections and reversals**
- **Needs review**
- **Integrity issue**
- **Held for next cycle**

Each exception gives one plain explanation, the affected account and amount,
the exact evidence or action needed, and the balance impact. Clean candidates
are summarized rather than presented as a row-by-row approval queue. Advanced
details can reveal the exact Stripe status, Phase 15 deposit outcome, source
revision, policy version, and evidence time without exposing provider jargon
to missionaries.

### Clean-cutover obligations

The dormant missionary runtime is contradiction evidence, not a Phase 21
foundation:

- `packages/missionary/components/balance-card.tsx` labels a donation-derived
  value **Available Funds** and offers **Withdraw**. Phase 21 replaces that
  contract completely.
- `packages/api/src/missionary-portal/model.ts` derives dashboard funding from
  settled donation rows and does not carry safe source status. It cannot become
  the Field Account or Support Activity authority.
- `packages/missionary/components/dashboard-home.tsx`, its `raisedCents`
  projection/view contracts, database hooks, and snapshot/redaction tests must
  consume the new Phase 21 allowlist projection rather than preserve the
  donation-derived amount under a new label.
- `packages/api/src/public-giving/{projection,columns,types}.ts`, GraphQL
  exposure, and public-giving tests currently project `current_funding`; public
  support progress must instead consume its approved goal/activity projection
  and never expose an internal Field Account balance.
- `supabase/schema.sql`, its migration/seed lineage, generated database types,
  and collection schemas contain `current_funding`. Phase 21 removes that
  competing authority rather than dual-writing or retaining a compatibility
  balance.
- `packages/api/src/missionary-portal/donors.ts` exposes and mutates contact
  fields, addresses, spouse, dates, notes, tags, scores, and activities. That is
  future Phase 28 scope, not a DTO to extend for Phase 21.
- `packages/api/src/missionary-portal/redaction.ts` retains stable identifiers
  on rows described as anonymous, and current gift anonymity does not yet
  resolve the per-gift override first. Phase 21 must use a new server-side
  allowlist projection with correlation-resistant anonymous output.
- Public worker, home/SEO, and FAQ copy that promises `100% direct`, says a
  gift goes directly to a worker/field account, or gives a donor `full control`
  must be replaced with organization-discretion-and-control language owned by
  the proper public-content/receipt authorities.
- `packages/config/payouts.ts` belongs to Mission Control Payouts. It cannot be
  reused as a D4 compensation, payroll, reimbursement, or Field Account
  adapter.

No compatibility view, dual write, or transitional authority is required. The
new contract replaces these dormant semantics cleanly.

### D2 adversarial review

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                                      | Severity | Likelihood | Permanent prevention                                                                                                                                                                                                              |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | One universal “settled” event fails across card, ACH, check, cash, wire, manual payout, and provider outages.                                                                               | High     | High       | Rail-qualified, versioned policy; exact evidence adapters; affected-item holds; no universal finality claim.                                                                                                                      |
| Technical debt                    | Yes      | Duplicated source-status mappings in contribution, Field Account, staff, and missionary code would drift.                                                                                   | High     | Medium     | One source fold and one typed display projection; generated exhaustive mapping tests; no UI-owned state machine.                                                                                                                  |
| Edge cases                        | Yes      | Late ACH returns, post-close refunds, undeposited checks, direct credits, partial refunds, duplicate webhooks, multi-currency gifts, and concurrent redesignations can overstate support.   | Critical | High       | Unique source coverage, append-only adverse corrections, exact scope, CAS close fence, atomic pairs, per-currency accounts.                                                                                                       |
| Footguns                          | Yes      | Staff could include unsupported positive activity, defer a negative, or mistake provider `available` for worker availability.                                                               | Critical | Medium     | Permission-gated evidence override only for positives, required reason, non-bypassable negative rules, terminology lint and confirmation copy.                                                                                    |
| Tenant safety                     | Yes      | A candidate, policy, donor, or status projection could cross Tenant, Legal Entity, Support Assignment, recipient, or role boundaries.                                                       | Critical | Low-Medium | Scope on every key and query, server-side authorization/redaction, tenant-isolation tests, fail-closed unknown scope.                                                                                                             |
| Over-engineering                  | Yes      | A generic rules engine, universal rail ontology, or second settlement ledger would make the product harder to operate.                                                                      | High     | Medium     | Three guided presets, bounded source-family overrides, finite typed evidence catalog, Phase 13/15/20 references rather than copied truth.                                                                                         |
| UX/UI and user friction           | Yes      | Status chips and finance jargon could overwhelm missionaries; hiding adverse outcomes could also mislead them.                                                                              | High     | High       | Quiet default, exception-only labels, accessible row disclosure, optional remembered Status column, plain terms, one contextual finance-help action.                                                                              |
| Hidden coupling                   | Yes      | Requiring QBO/Xero, Bank Match, or payout membership for every close would make Field Account truth depend on optional downstream systems.                                                  | High     | Medium     | Source-owned admission policy; Phase 20 evidence is optional/tenant-selected; independent authorities and outage isolation.                                                                                                       |
| Failure modes                     | Yes      | Provider ambiguity or a crash during close could duplicate, partially publish, or freeze all accounts.                                                                                      | Critical | Medium     | Durable staging, one logical publication fence, idempotency, read-before-retry, item-level holds, resumable reconciliation, visible delayed update.                                                                               |
| Data integrity risks              | Yes      | Replays, half-pairs, policy mutation, stale evidence, or out-of-order events can corrupt balances and history.                                                                              | Critical | Medium     | Immutable versions, unique coverage constraints, balanced-pair constraint, source revision/as-of pins, monotonic source fold, invariant sweeps.                                                                                   |
| Security and privacy risks        | Yes      | Decline reasons, stable anonymous identifiers, donor contact data, household facts, or restricted-worker activity could leak through rows, counts, URLs, exports, notifications, or caches. | Critical | High       | Compose the Phase 14 roster and Phase 16 safe projection; field allowlist; per-gift privacy precedence; filter before all arithmetic; no Phase 21 donor CRUD/contact/task authority; revocation and correlation-resistance tests. |
| Scalability and performance risks | Yes      | Thousands of gifts across many accounts could make one close transaction or per-row provider calls fail.                                                                                    | High     | Medium     | Precomputed candidates, batch evidence sync, cursor-based staging, bounded chunks, final CAS publication, indexed scope/coverage keys, certified volume tests.                                                                    |
| Operational burden                | Yes      | Too many rail knobs or row approvals would require tribal knowledge every cycle.                                                                                                            | High     | High       | Guided defaults, policy preview, exception-first workspace, source-specific explanations, prospective changes, no clean-row approval ceremony.                                                                                    |
| Observability gaps                | Yes      | Silent evidence lag, unknown statuses, unprocessed reversals, or projection delay could leave finance trusting a stale total.                                                               | High     | Medium     | PII-minimized metrics and alerts for evidence lag, held value, adverse-correction age, close age, projection lag, invariant failures, and unknown mappings.                                                                       |
| Dependency and integration risks  | Yes      | Stripe fields, webhook order, offline-deposit contracts, or optional bank evidence can change or become unavailable.                                                                        | High     | Medium     | Versioned adapters, webhook plus scheduled reconciliation, provider capability certification, contract fixtures, quarantine unknown values, artifact/evidence continuity.                                                         |
| Migration and upgrade risks       | Yes      | Future rails or policy changes could reinterpret historical closes or force a balance rewrite.                                                                                              | High     | Medium     | Stable source/evidence identities, prospective policy versions, immutable closes, additive display mappings, exportable coverage manifests, no legacy runtime.                                                                    |
| Other development hazards         | Yes      | Time-zone cutoffs, race conditions, unsafe retry, stale permissions, and weak rollback can create wrong scope or double credit.                                                             | Critical | Medium     | UTC instants plus tenant display zone, exact half-open boundaries, transactional outbox/idempotency, authorization recheck at publication, append-only successor correction, failure-injection tests.                             |

### Evidence

- [Phase 21 mission-dashboard and support-cycle research](./phase-21-mission-dashboard-product-research-evidence.md)
- [Stripe balances and settlement time](https://docs.stripe.com/payments/balances)
- [Stripe Balance Transaction object](https://docs.stripe.com/api/balance_transactions/object)
- [Stripe ACH Direct Debit](https://docs.stripe.com/payments/ach-direct-debit)
- [Salesforce Nonprofit gift transaction statuses](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_gift_transactions_overview.htm&language=en_US&type=5)
- [Neon CRM transaction status definitions](https://support.neonone.com/hc/en-us/articles/4407399233421-Transaction-Status-Definitions)
- [TntConnect Gifts View](https://www.tntware.com/tntconnect/help/en/pages/gifts-view.aspx)
- [MissionGO missionary dashboard walkthrough](https://www.missiongo.org/ContentFiles/Missionary%20Dashboard%20Walkthru.pdf)
- [W3C disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- [W3C cognitive guidance for important information](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o2p04-page-important/)
- [Phase 14 supporter-roster projection contract](./phase-14-donor-credit-operations.md#getSupporterRoster--the-full-specification-d5)
- [Phase 16 recurring-support missionary projection](./phase-16-pledges-recurring-commitments.md#missionary-dashboard)
- [ADR-0063 — Rail-qualified support-cycle admission without worker-availability claims](../../adr/0063-rail-qualified-support-cycle-admission.md)

## D3 — Bounded prospective Administrative Assessment Profiles

**Founder ruling:** ratified on 2026-07-28.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — explicit
> zero-assessment default with bounded prospective Assessment Profiles,
> deterministic non-stacking resolution, period-correct
> minimum/flat/cap/service components, immutable source and period coverage,
> component-correct append-only reversals, production-shaped activation proof,
> and transparent tenant-configurable presentation.**

### Explicit zero-assessment baseline

- Every Tenant and Legal Entity starts with an explicit immutable
  **No administrative assessment** profile. It is a real policy version, not
  the absence of configuration.
- Tenants that do not use assessments perform no setup and see no profile
  tables, dashboard cards, empty columns, recurring `$0.00` activity, or
  missionary prompts.
- Missing or corrupt baseline configuration is an integrity failure. It must
  not silently behave as zero or choose another profile.
- Asym never infers an assessment from denomination, country, worker type,
  imported history, another tenant, or a missions-industry template.

### One bounded profile model

The supported catalog is deliberately finite:

| Method                              | Meaning                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| No assessment                       | Explicit tenant default or narrower exemption                                                          |
| Percentage                          | Source-family percentage of exact Gross Support Allocation                                             |
| Percentage with monthly minimum/cap | Source percentage plus one period-level minimum top-up or cap credit                                   |
| Fixed monthly assessment            | One monthly amount for a bounded assignment                                                            |
| Percentage plus monthly services    | One source percentage component plus one separately recorded fixed monthly service component           |
| Negotiated flat                     | An exact-Field-Account fixed-monthly assignment                                                        |
| Exempt                              | A narrower assignment to the No-Assessment profile rather than a zero-rate or negative-rate workaround |

Profiles are replacements, not additive layers. A combined percentage plus
monthly-services method is one profile with two typed components, not two
independently resolving charges. Zero percentage is represented by the
No-Assessment profile. Arbitrary formulas, scripts, numeric priority fields,
rule-order dragging, percentage-of-balance calculations, payroll deductions,
provider-fee behavior, and per-gift overrides are excluded.

### Exactly one deterministic winner

For the exact Tenant, Legal Entity, Support Assignment, Field Account,
currency, source-effective instant, and explicit source-labelled assessment-
applicability context, profile assignment uses one fixed specificity model:

1. exact Field Account;
2. exact worker-classification plus lifecycle-stage combination;
3. one matching single-axis worker-classification or lifecycle-stage
   assignment; then
4. Legal-Entity/currency default.

Worker classification and lifecycle stage share one specificity rank because
Asym cannot honestly assume that one dimension always outranks the other. If
both single-axis assignments resolve to the same profile, that profile wins.
If they resolve to different profiles, the account is
`blocked_by_integrity` until the tenant defines an explicit combination. The
product never silently stacks or chooses between them.

A worker-classification or lifecycle-stage axis resolves only from an explicit
prospective, source-labelled Support-Assignment assessment-applicability
context compiled for that exact Support Assignment and Field Account. It is
never inferred from current Support Assignment Participant Memberships,
participant count, workspace access, or relationship labels. An absent axis
does not match; conflicting explicit values block under the same lattice.

Inside the one winning profile, an exact source-family treatment replaces the
profile's default source treatment. Source family is a finite, source-owned
semantic identity frozen with the covered occurrence, not free text, a
campaign tag, donor identity, or mutable contact attribute. An unknown adapter
value enters the assessment exception lane instead of falling through to an
unproved charge.

### Assessable base and independent truth

- The assessable base is the exact Phase 21 **Gross Support Allocation**. For a
  D21 noncash lifecycle, this means only the manifest-frozen Realized Support
  Basis after the selected exact-cost treatment—never the original asset's FMV,
  appraisal, recognized value, or estimated proceeds.
- Fee-cover amounts, processor costs, D21 brokerage/liquidation/valuation/sale
  costs, refunds, opening balances, internal Field Account transfers, payroll
  amounts, reimbursement payments, and non-support corrections are not
  assessable gifts.
- Phase 20 D19's Processor Cost Attribution Manifest remains independent. A
  compatible Phase 21 processor-cost policy may consume its exact manifest
  once, but an assessment cannot copy, relabel, or double-charge it.
- Contribution, legal donor, Designation, receipt, processor-cost, Field
  Account, payroll, payment, Accounting Release, and QBO/Xero truth remain
  separately authoritative.

The visible relationship is:

`gross support − administrative assessment − separately enabled processor-cost effect = support credited`

An assessment is never described as a card-processing fee, donor-paid fee,
tax, payroll withholding, withdrawal, compensation, or money available to the
missionary.

### Monthly Assessment Period and calculation

**Assessment Period** is the exact monthly, per-currency interval that owns
minimum, cap, fixed, and service-component effects independently of Support
Cycle cadence:

- the guided default is the Legal Entity's calendar month in its pinned finance
  timezone;
- a tenant may align it to an already configured monthly finance calendar;
- intervals are exact and half-open;
- a monthly Support Cycle ordinarily finalizes one Assessment Period;
- a biweekly tenant may close source-linked percentage entries during the
  month, but exactly one later close owns the monthly period adjustment; and
- assessment never crosses currencies or creates an FX residual.

Each source-linked percentage is rounded once in currency minor units under
the canonical frozen money rule. For a profile with a minimum or cap:

```text
raw_percentage_total = sum(rounded covered source percentages)

monthly_target =
  min(
    max(raw_percentage_total, configured_minimum_or_zero),
    configured_cap_or_infinity
  )

period_adjustment = monthly_target - raw_percentage_total
```

The period adjustment is one positive minimum top-up or negative cap credit.
It is not redistributed across donor gifts. A fixed or monthly-service
component is another explicit period-level entry.

- A minimum or fixed/service component applies in a zero-support month only
  when the tenant explicitly enables that behavior. The guided default is off.
- A partial first or last month uses one explicit bounded choice:
  **Prorated** (guided), **Full**, or **Waived**.
- `cap >= minimum`; all configured amounts are nonnegative currency-minor
  units.
- A successor policy starts only at a complete future Assessment Period
  boundary. Partial-period behavior is for legitimate Field Account
  commencement or departure, not retroactive editing.

### Component-correct corrections

- A full or partial refund, return, void, or source correction reverses only
  the exact gift-linked variable assessment coverage using the original
  profile version, basis, currency, precision, rounding, and source
  population.
- Cumulative partial reversals cannot exceed the variable assessment originally
  attached to that source occurrence.
- A monthly minimum, cap adjustment, fixed amount, or service component is
  remeasured from its immutable Assessment Period Determination and corrected
  through append-only period effects.
- A gift-related assessment may reverse while the monthly minimum remains. The
  staff and missionary explanation must state that outcome rather than
  presenting it as a calculation discrepancy.
- One returned gift does not blindly reverse a whole fixed monthly or service
  amount.
- Late facts create linked current correction effects and never edit an
  original gift, Assessment Determination, closed Support Cycle, or archived
  statement.
- A Phase 13 corrective redesignation atomically reverses the original target
  assessment effect and derives the corrected target effect under the policy
  effective for the corrected source occurrence.
- A Phase 21 internal transfer is assessment-neutral and cannot be mistaken for
  new support.
- Gross allocation and any nonzero source assessment enter a Support Cycle
  publication fence atomically.

### Durable authority and lifecycle

Staff interact with one **Assessment policy** surface. The durable model keeps
only the distinctions needed to reproduce financial effects:

- Administrative Assessment Profile and immutable Profile Version;
- prospective Assessment Profile Assignment;
- monthly Assessment Period;
- immutable Assessment Period Determination;
- separate balanced Assessment Entry; and
- append-only Assessment Correction.

Every authority carries Tenant, Legal Entity, Field Account or assignment
scope, currency, effective interval, and actor/evidence identity where
applicable. Same-scope keys, row-level security, authorization rechecks, unique
source/period coverage, and balance invariants prevent cross-scope or duplicate
effects.

Active and historical versions are read-only. Staff change policy through a
prospective successor. Drafts may be deleted, and a scheduled successor may be
cancelled before its boundary. D3 creates no mandatory two-person approval;
an existing tenant separation-of-duties rule may apply when configured.

### Staff UX

The feature lives at **Finance → Field Accounts → Assessments**, not as a new
top-level product.

The quiet initial state is:

> **No administrative assessments**
> Gross support is credited without an administrative assessment.
> Payment-processing costs are configured separately.

The one primary action is **Configure assessments**. The guided flow is:

1. **Calculation** — choose one bounded method with a live worked example.
2. **Applicability** — choose the default or one bounded assignment and any
   source-family treatments.
3. **Test and preview** — test an exact account or scenario without posting.
4. **Review and schedule** — inspect a check-answers summary and use the
   consequential action **Schedule assessment policy**.

Preview uses frozen, production-shaped inputs and shows:

- the current and proposed winner plus **Why this profile?**;
- exact gross support, assessment components, and support credited;
- representative prior-period impact and affected-account count;
- no-assessment and exemption coverage;
- zero-support-month and partial-period behavior;
- refund, minimum-remains, and cap-credit examples;
- source-family, classification/lifecycle, currency, and overlap conflicts;
- the exact future activation boundary; and
- high-rate or high-value warnings without creating automatic bureaucracy.

The standing list shows **Active**, **Scheduled**, and **Ended** versions,
scope, method, effective boundary, affected-account count, presentation, owner,
and change reason. Clean determinations are summarized. Only ambiguity,
unknown source/classification, missing currency, stale policy reference,
reversal-coverage failure, late period adjustment, or invariant failure enters
the exception-first finance workspace.

### Missionary UX and tenant presentation freedom

When the winning profile is No Assessment, the missionary sees no assessment
card, column, empty row, or prompt.

When a nonzero assessment applies, the tenant chooses one default presentation:

1. **Compact transparent** (guided) — emphasize **Support credited** and place
   the exact breakdown behind one accessible **How support is calculated**
   disclosure.
2. **Balanced** — show **Gross support recorded**, **Organization assessment**,
   separately governed costs when applicable, and **Support credited** in the
   cycle summary.
3. **Detailed** — also show gift-linked percentage detail on affected activity;
   monthly minimum, cap-credit, flat, and service components remain separate
   period activity.

Gift activity continues to show the donor's gross gift truth. The tenant may
choose an honest bounded display label, short explanation, policy/help link,
and finance contact. Exact detail and immutable statements retain the canonical
**Administrative assessment** meaning. A tenant cannot use presentation
settings to hide a nonzero assessment or relabel it as processor cost, donor
restriction, tax, withdrawal, payroll deduction, or worker-owned money.

Missionaries see only their applicable method, rate or fixed component,
minimum/cap behavior, effective date, own calculation, and corrections. They
never see another worker's negotiated terms, classification notes, or
finance-only evidence. Disclosure is keyboard-operable, screen-reader
understandable, non-color-dependent, responsive at narrow widths and 200% zoom,
and consistent with the product's existing design tokens.

### Activation and production gates

Activation blocks on:

- missing explicit default;
- ambiguous or overlapping winners;
- invalid minimum/cap or currency configuration;
- unknown source identity or unsupported source/currency semantics;
- stale preview digest or changed authorization;
- a successor boundary inside a reviewed or closing period; or
- inability to prove exact source and period coverage.

Implementation cannot ship until tests prove:

- quiet explicit zero default;
- every bounded calculation and presentation method;
- every specificity outcome, same-rank conflict, source fallback, and unknown
  source;
- monthly, biweekly, zero-support, and partial-period behavior;
- full, partial, repeated, cap-affected, and minimum-retained refunds;
- redesignation atomicity and transfer neutrality;
- integer-minor-unit conservation, including one-cent and zero-decimal
  currencies;
- preview-to-publication parity from identical frozen inputs;
- idempotent close, activation, refund, retry, and crash recovery;
- cross-Tenant, Legal-Entity, Field-Account, currency, role, RLS, and cache
  isolation;
- accessible desktop and mobile journeys in every presentation mode; and
- certified production-shaped volume without N+1 or provider calls.

### Explicit non-goals

- No generic rules engine, formula language, numeric priority editor, stacked
  policies, retroactive re-rating, or mutable active profile.
- No assessment inferred from processor net, current balance, QBO/Xero,
  payroll, worker need, or another tenant.
- No per-clean-entry approval queue or mandatory new approval bureaucracy.
- No zero-dollar missionary noise, hidden assessment, misleading availability
  claim, or direct donor-gift rewrite.
- No provider call, accounting dependency, payroll dependency, or current HR
  join during deterministic assessment evaluation.

### D3 adversarial review

| Category                          | Concern? | Primary failure                                                                                                | Severity | Likelihood | Permanent prevention                                                                                           |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Current-profile joins, free-text source labels, or overlaps reinterpret history.                               | High     | High       | Frozen identities and versions, bounded selectors, activation conflict proof.                                  |
| Technical debt                    | Yes      | Preview, close, statement, correction, and accounting math drift apart.                                        | High     | High       | One canonical pure evaluator and one reusable projection.                                                      |
| Edge cases                        | Yes      | Zero-support, biweekly, partial-period, refund, cap, lifecycle, and currency cases charge incorrectly.         | Critical | High       | Explicit Assessment Period plus boundary, table, and property tests.                                           |
| Footguns                          | Yes      | Missing config means zero, active rates mutate, costs double-charge, or labels mislead.                        | Critical | Medium     | Explicit zero profile, immutable use, D19 one-time coverage, bounded terminology.                              |
| Tenant safety                     | Yes      | A foreign profile or account applies another tenant's policy.                                                  | Critical | Medium     | Composite same-scope keys, forced RLS, server-resolved context.                                                |
| Over-engineering                  | Yes      | A generic rules DSL or priority graph becomes untestable and unusable.                                         | High     | High       | Finite methods and assignments, one winner, no formulas or stacking.                                           |
| UX/UI and user friction           | Yes      | Staff cannot explain the winner or missionaries confuse assessment with a fee or balance.                      | High     | High       | Winner explanations, preview, quiet zero state, bounded transparent presentation.                              |
| Hidden coupling                   | Yes      | Assessment close depends on QBO/Xero, payroll, D19, live HR, or provider calls.                                | High     | Medium     | Independent authorities and frozen references only.                                                            |
| Failure modes                     | Yes      | A crash posts gross without assessment, duplicates a period effect, or half-publishes correction.              | Critical | Medium     | Durable staging, idempotency, unique coverage, atomic publication fence.                                       |
| Data integrity risks              | Yes      | Rounding drift, duplicate periods, overlapping versions, or over-reversal corrupts balance.                    | Critical | Medium     | Minor-unit math, exclusion constraints, balance invariants, reversal ceilings.                                 |
| Security and privacy risks        | Yes      | Negotiated terms, classification, donor facts, or finance notes leak to workers.                               | Critical | Medium     | Purpose-scoped DTOs, allowlists, least privilege, account-isolation tests.                                     |
| Scalability and performance risks | Yes      | Per-gift resolution and period recomputation overwhelm finance close.                                          | High     | Medium     | Indexed set-based resolution, chunked staging, no provider calls, volume certification.                        |
| Operational burden                | Yes      | Staff create a profile per worker or approve every clean calculation.                                          | High     | High       | Reusable default/group profiles, bulk preview, exact-account exceptions, exception-only review.                |
| Observability gaps                | Yes      | Unknown families, late adjustments, stale coverage, or missing reversals remain silent.                        | High     | Medium     | Coverage, ambiguity, reversal-lag, period-late, and invariant metrics/alerts.                                  |
| Dependency and integration risks  | Yes      | Adapter or classification changes silently alter policy selection.                                             | High     | Medium     | Stable source IDs, frozen classifications, versioned adapters, unknown-value quarantine.                       |
| Migration and upgrade risks       | Yes      | Dormant donation sums or `current_funding` survive as competing authority.                                     | Critical | High       | Clean replacement, no dual write, schema/version gates, obsolete-term tests.                                   |
| Other development hazards         | Yes      | Timezones, races, stale authorization, and overloaded “assessment” terminology cause inconsistent publication. | Critical | Medium     | Half-open periods, CAS/locking, auth recheck, idempotency, canonical **Administrative assessment** vocabulary. |

### Evidence

- [Phase 21 assessment and missionary-presentation research](./phase-21-mission-dashboard-product-research-evidence.md#d3-evidence-bounded-prospective-assessment-profiles)
- [Reliant Administrative Fee policy](https://solomon.reliant.org/display/public/employman/Administrative%2BFee)
- [ABWE Administrative Services Funding Model](https://abwe.org/financial-model/)
- [ECFA donor-disclosure guidance](https://www.ecfa.org/Content/2MemberManual-AdvisoryOpin-DonorDisclosure)
- [Blackbaud Default Gift Fees](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/altru/help/content/RPManageDefaultGiftFees.html)
- [Ramp expense-policy setup](https://support.ramp.com/getting-started-with-ramps-expense-policy-setup/)
- [HubSpot workflow testing](https://knowledge.hubspot.com/workflows/test-your-workflow)
- [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
- [ADR-0064 — Bounded prospective Administrative Assessment Profiles](../../adr/0064-bounded-prospective-administrative-assessment-profiles.md)

## D4 — Contract-referenced compensation funding with external payroll authority

**Founder ruling:** ratified on 2026-07-28.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — tenant-owned,
> contract-referenced compensation funding over Finance-confirmed Support Cycle
> coverage, with distinct exact Compensation Funding Periods, three bounded
> prospective funding methods, a simple optional support-balance floor,
> separately identified organization funding, and source-pinned Engagement
> Authority and Compensation Funding Plan versions; one immutable finance
> decision and non-reusable Field Account Funding Coverage that reserves but
> does not debit or pay; one artifact-always Compensation Handoff Package with
> at most one capability-certified payroll, contractor-AP, or accounting
> destination lane; draft-input-only provider automation where explicitly
> certified; separately authoritative finalized compensation results,
> evidence-qualified append-only Field Account effects under one pinned
> recognition policy, external payment and mixed-payment coverage, single-owner
> QBO/Xero accounting, failures, partial reversals, and reversals;
> operation-granular idempotency and drift detection;
> underfunding-to-exception rather than automatic wage reduction or backpay; and
> one exception-first finance workspace plus a quiet tenant-configurable
> missionary projection—without Asym classifying workers, calculating payroll
> or taxes, submitting payroll, moving compensation money, exposing unnecessary
> payroll PII, or treating an accounting connection, export, posted pay run, or
> payslip as proof of payment.**

> **D7 precision:** D4's “at most one” lane is now exactly one executable lane:
> staff artifact fulfillment, one exact capability-certified external
> payroll/contractor-AP provider-draft input, or one separately certified Phase
> 20 source handoff. An accounting-native QBO/Xero object is never a Phase 21
> Compensation Handoff Adapter.

### Binding authority boundary

- The tenant's HR, legal, payroll, or accounts-payable authority owns worker
  classification, compensation entitlement, externally binding arrangement,
  tax treatment, deductions, net pay, benefits, payroll approval, payroll
  execution, and any legal obligation or arrears.
- Phase 21 owns only the tenant-authorized use of organization-controlled Field
  Account capacity for compensation funding, the resulting immutable finance
  decision and coverage, the handoff package, the source-linked Field Account
  effect, and the staff/missionary projection of those facts.
- A fundraising goal, support activity, current balance, plan, proposal,
  funding reservation, handoff, provider draft, payroll schedule, payslip, or
  accounting entry never becomes wage entitlement or payment evidence.
- The Phase 21 `missionary` role, public worker page, Field Account type, or
  tenant-facing label cannot classify a person. Every active plan pins one
  exact, effective **Engagement Authority Reference** from the tenant's
  authoritative external source.
- That reference is source-pluggable: use an exact payroll/HR/AP provider
  identity and version when available; otherwise use a governed tenant-issued
  authority record with issuer/actor, asserted external classification,
  effective interval, source/evidence reference, and immutable version.
  Artifact-only tenants therefore remain supported without letting Asym infer
  or originate classification.
- D4 is a product and data-authority ruling, not jurisdiction-specific legal,
  employment, tax, or payroll advice.

### Distinct periods

The following exact half-open periods remain independent:

1. **Support Cycle** — D1's operational Field Account close interval;
2. **Compensation Funding Period** — D4's planning and finance-decision
   interval; and
3. **external payroll/AP period** — the period owned by the tenant's
   downstream system or process.

They may align for an ordinary monthly tenant but do not share identity or
authority. A Compensation Funding Decision may reference exact coverage from
one or more closed Support Cycles without redefining those closes or the
external pay period.

### Bounded tenant plan catalog

Compensation funding starts **Not managed in Asym**. An authorized tenant may
activate one prospective immutable Compensation Funding Plan Version for an
exact Tenant, Legal Entity, worker/payee, Support Assignment, Field Account,
Field Account funding
currency, external compensation/payment currency, Engagement Authority
Reference, and destination. The two currencies are equal in the ordinary
case. An active plan chooses exactly one method:

1. **Finance enters each cycle** — no amount is presumed; staff enter the
   externally authorized amount for the period.
2. **Fixed approved target** — Asym proposes one tenant-supplied target.
3. **Up to an approved maximum** — Asym proposes the lesser of the external
   maximum and exact policy-qualified Field Account funding capacity.

Unusual arrangements use **Finance enters each cycle** rather than an
unbounded formula language. D4 excludes percentage-of-balance pay,
donation-triggered pay, tax or net-pay formulas, overtime calculations,
automatic short checks or backpay, configurable code, and tenant-defined
lifecycle states.

Each prospective plan version may additionally pin:

- external arrangement owner; provider identity/version or governed
  tenant-issued authority record; and effective interval;
- compensation cadence, expected handoff date, Field Account funding currency,
  and external compensation/payment currency;
- optional externally supplied organization-cost components for gross
  compensation, employer costs, approved benefits, retirement, or
  housing/parsonage treatment;
- one simple per-currency **Keep in support balance** floor, defaulting to zero;
- whether separately authorized organization funding may be proposed;
- employee-payroll versus contractor/accounts-payable destination;
- artifact-only versus exact capability-certified provider-draft delivery; and
- bounded missionary visibility: date and stage only, or date, stage, and
  planned amount.

Assessments, processor costs, ministry-expense capacity, Reimbursement
Obligations, payroll deductions, tax calculations, and accounting releases
remain separate authorities. They may be explained together but are not hidden
components of the compensation plan.

Plan versions are prospective replacements. Each version owns a half-open
configuration-effective interval and cadence, not a cycle's Compensation
Funding Period. Activation rejects overlapping plan intervals for the same
tenant, Legal Entity, worker/payee, Engagement Authority Reference lineage,
Field Account, Field Account funding currency, and external
compensation/payment currency. A plan may never resolve across tenants, Legal
Entities, workers, provider companies, or currency lanes.

### Finance proposal, decision, and coverage

- A **Compensation Funding Proposal** is a disposable projection. It may use
  only the Finance-confirmed Field Account Balance minus exact active prior
  coverage and the configured support-balance floor. It has no durable
  authority.
- A **Compensation Funding Decision** is one immutable authorized result for a
  worker/payee and period. It freezes the plan and engagement versions, exact
  covered amount, separately identified organization funding, unresolved
  amount, destination, actor, time, and evidence.
- Each proposal and decision instantiates one exact half-open Compensation
  Funding Period. Compare-and-swap and a same-scope uniqueness constraint
  permit one current, non-superseded Compensation Funding Decision lineage for
  that Tenant, Legal Entity, worker/payee, Engagement Authority Reference
  lineage, Field Account, currency scope, and period. A change appends a
  successor; off-cycle work uses a distinct exact period.
- Purpose-typed **Field Account Funding Coverage** reserves exact
  organization-controlled capacity and prevents reuse. It is neither a debit,
  liability, payroll approval, cash movement, nor payment.
- Reserved and posted capacity conserve one amount. When a qualified
  Compensation Field Account Effect is appended, the exact overlapping active
  coverage amount atomically transitions to `fulfilled`; effect-backed
  coverage never transitions to `released`. Projections subtract the
  reservation before recognition and the debit afterward—never both. Only a
  non-overlapping remainder may transition to `released`, and only for the
  exact amount proved never handed off or submitted or after exact downstream
  cancellation/reversal proof establishes that it cannot still execute.
  Partial results transition only their exact amounts; an outcome-unknown
  handoff stays reserved in one exception. There is no timer-based expiration,
  silent deletion, or unproved reuse.
- Field Account funding, separate organization funding, and unresolved funding
  must conserve the decision. An organization top-up does not change the Field
  Account unless an independently authorized Field Account transfer occurrence
  does so.
- Provisional support, commitments, live provider balances, QBO/Xero bank
  balances, or open Support Cycles cannot fund the proposal.
- D4 performs no implicit FX. A cross-currency arrangement separately freezes
  the Field Account funding amount/currency and external
  compensation/payment amount/currency plus the exact external conversion
  authority/reference, rate or source amounts, rounding method, residual
  disposition, and provenance. Missing or ambiguous conversion evidence blocks
  the decision.

### Underfunding and tenant control

A shortfall creates one cause-owned **Compensation Exception Case**. It does not
automatically create a wage reduction, short check, negative balance, debt,
backpay, arrears, expiration schedule, or future recovery.

Authorized staff may:

- hold the handoff;
- supply separately identified organization funding;
- use a lower amount only when an external HR/payroll/AP authority permits and
  evidences it;
- reference an externally established obligation or arrears fact without
  making Asym its source; or
- prospectively replace the plan.

The exception shows planned funding, Field Account-covered funding,
organization-covered funding, and the unresolved amount without describing the
unresolved amount as money owed to or owned by the worker.

### Field Account effect recognition

The Funding Decision and its coverage reserve capacity but create no Field
Account debit. Each Legal Entity pins one prospective **Compensation Effect
Recognition Policy**:

- guided default: recognize the exact finalized **External Compensation
  Result**; or
- bounded alternative: recognize the exact **External Payment Occurrence**.

Only the selected evidence may create an append-only **Compensation Field
Account Effect**. A standing plan, proposal, approval, reservation, export,
provider draft, provider acceptance, accounting delivery, pay-run schedule, or
payslip never qualifies.

The payment-evidence alternative is certifiable only when the External Payment
Occurrence and Compensation Payment Coverage carry an exact source-qualified
Field Account organization-cost basis or link to a finalized External
Compensation Result that does. Net cash alone cannot establish gross
compensation or employer cost. Missing cost basis creates a Compensation
Exception Case rather than an inferred debit. Only a change, partial reversal,
or reversal in the policy-selected recognition authority may correct the Field
Account effect; a failure or disagreement on the non-selected evidence track
remains separately visible and cannot automatically reverse it.

The effect uses exact organization-cost roles. Gross compensation plus
externally asserted employer-only costs may affect the Field Account. Net pay,
employee withholding, and employee deductions are distributions of gross and
must not be added again. Every effect carries an exact component-level
result/payment-to-decision application manifest. Using the Decision's frozen
component dispositions, the manifest conserves the policy-selected
authority's qualified organization-cost basis exactly into Field
Account-applied, separately organization-funded, and unresolved variance. The
Field Account-applied amount cannot exceed unused active compensation
coverage; the organization-funded amount cannot exceed the Decision
authorization. A mismatch stays reserved where its outcome is unknown and
opens one exception—never silent clamping, prorating, or funding-source
reprioritization. Later result changes, payment failures, partial reversals, or
reversals append signed component deltas and preserve the original decision,
package, result, payment, and closed balance history.

### Artifact-always handoff and provider capability

Every approved decision creates one content-addressed, schema-versioned,
PII-minimized **Compensation Handoff Package** containing the exact
worker/payee, Legal Entity, external arrangement, Compensation Funding Period,
funding sources, typed components, Field Account funding amount/currency,
external compensation/payment amount/currency, conversion evidence when
different, destination, plan version, Support Cycle coverage, authorizer,
timestamp, and digest.

Exactly one outbound lane owns delivery:

1. **Artifact only** — stable human-usable and importable evidence. Download
   means `Exported`, not submitted or paid.
2. **Certified provider draft input** — performs only the exact provider-side
   draft/input operation proved by the destination capability, under one
   locally unique immutable operation identity and the provider-specific
   recovery contract. Byte-identical/same-key retry is allowed only when the
   exact provider operation proves safe idempotency or compare-and-swap;
   otherwise uncertainty becomes `outcome_unknown` for provider inspection or
   exact permitted staff confirmation. Acceptance means input recorded, not
   submitted, processed, or paid.
3. **Certified Phase 20 source handoff** — an optional accounting projection
   when no payroll input is intended. The package is only a source handoff: the
   Compensation Funding Decision or reservation alone creates no Accounting
   Posting Intent, payable, expense, or Accounting Release. Phase 20 stays dark
   until a separately certified source contract names the eligible
   evidence-qualified occurrence (normally a Compensation Field Account Effect
   or exact External Compensation Result), accountant-confirmed semantics, and
   exact Phase 20 D17 posting owner.

Provider readback or exact permitted provider/staff confirmation is independent
evidence and may accompany any outbound lane without becoming another
execution. Payroll certification is exact for tenant, Legal Entity, provider
company, product, country, environment, permission, scope, external worker
mapping, and operation. A generic `qbo_connected` or `xero_connected` flag is
insufficient. QuickBooks Accounting, QuickBooks Workforce, Xero Accounting,
and each regional Xero Payroll product remain distinct capabilities.

Provider automation is draft-input-only. Asym does not autonomously approve,
submit, calculate, post, or run payroll. Outcome-unknown operations are
inspected before retry; provider calls use operation-granular idempotency,
bounded backoff, readback, and drift comparison.

### Result, payment, mixed coverage, and accounting

- **External Compensation Result** owns the finalized external result and its
  provider-native processing, payslip, failure, cancellation, partial-reversal,
  and reversal evidence. `Processed`, `Posted`, or `payslip created` is not
  `Paid`.
- **External Payment Occurrence** remains the only source fact that can support
  `Payment confirmed` or `Paid`.
- A governed manual evidence lane requires exact date, amount, external payment
  currency, method category, external reference/evidence, actor, and reason.
  Its action is
  **Record payment confirmation**, never a generic `Mark paid`.
- One external payment may cover both compensation and reimbursement. Its typed
  manifest uses the External Payment Occurrence's one payment currency and
  conserves the complete payment through exact **Compensation Payment
  Coverage**, existing Reimbursement Payment Coverage, and one signed, typed,
  explicitly resolved residual disposition, including zero. A covered source
  component in another currency carries immutable source/payment amounts and
  exact conversion evidence. An unresolved residual or FX ambiguity fails
  closed. D4 must not fabricate two payments to keep domains visually
  separate.
- Payroll accounting has exactly one posting owner. When payroll/AP already
  posts QBO/Xero journals, Asym records exact references and drift evidence but
  creates no duplicate Accounting Release. Any later Asym-originated
  compensation projection requires Phase 20's Posting Ownership Cutover and a
  certified compensation source contract.

### Truthful lifecycle

The staff surface preserves four authorities behind one plain current-stage
summary:

| Track            | Projected states                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Finance decision | `Needs review`, `Approved for handoff`, `Held`, `Superseded`                                                                          |
| Handoff          | `Not prepared`, `Prepared`, `Exported`, `Provider input recorded`, `Submitted externally`, `Provider acknowledged`, `Needs attention` |
| External result  | `Not confirmed`, `Processing`, `Processed`, `Failed`, `Cancelled`, `Partially reversed`, `Reversed`                                   |
| External payment | `Not confirmed`, `Payment confirmed`, `Payment issue`, `Partially reversed`, `Reversed`                                               |

Native provider evidence remains inspectable. A downloaded artifact is not
`Sent`; `Sent` is not `Processed`; `Processed` is not `Paid`; and a payroll or
accounting occurrence cannot overwrite Field Account truth.

### Staff UX

The ordinary setup is one short flow:

1. **Who and where** — worker/payee, Legal Entity, Engagement Authority Reference, Field
   Account funding currency, external compensation/payment currency, and
   payroll or contractor/AP destination. The second currency stays hidden when
   both are equal.
2. **How should funding be prepared?** — one of the three plan methods, with a
   worked mock example.
3. **What should stay in the support balance?** — optional floor and
   organization-funding permission; advanced external components stay
   collapsed.
4. **Review and schedule** — exact effective boundary, next period, visibility,
   destination capability, and artifact fallback. The action is **Schedule
   funding plan**.

The standing workspace opens to **Needs attention**, with secondary
`Ready for review`, `Approved`, `With payroll/AP`, and `No action needed`
views. `No action needed` is only a disposable filter for rows with no current
Phase 21 action; it is not a durable `Complete` state, and each row still
exposes the independent finance, handoff, result/payment, and Field Account
effect evidence. Rows show worker/payee, Legal Entity, confirmed balance and
through-date, planned target or `Finance to enter`, Field Account and
organization funding, projected remaining balance, period, destination, one
plain current-stage summary, and one next action. Detail reveals the exact
calculation bridge, source coverage, arrangement and plan versions,
prior-period comparison, component detail, shortfall cause, provider
capability, and audit timeline.

Clean homogeneous rows may be bulk-authorized after one review summary. Mixed
Legal Entities, Field Account funding currencies, external
compensation/payment currencies, destinations, exceptions, or authority
versions cannot be silently bulked together. Consequential actions require
specific copy, exact scope and totals, review/correction, stale-preview
protection, and append-only supersession rather than destructive undo.

### Missionary UX

No active plan or disabled tenant visibility produces no empty compensation
module.

When enabled, one calm **Next payroll** or **Next compensation** card shows:

- expected date and plain-language stage first;
- a planned amount only from the authorized plan/decision and only when tenant
  visibility permits it;
- the Finance-confirmed support balance and its through-date separately;
- one **View details** action; and
- a tenant finance/payroll contact and external payroll-portal link when
  configured.

The detail timeline uses `Planned`, `With payroll`, `Processing`,
`Payment confirmed`, or `Needs attention`. Its standing explanation is:

> This is your organization's support-funding plan for the next compensation
> cycle. Your organization and payroll provider determine final pay, taxes,
> deductions, and delivery timing.

Missionaries do not see internal plan names, classification rationale,
negotiated terms for other workers, provider error payloads, employer-cost
details, tax elections, deductions, garnishments, bank data, benefit-health
information, or raw paystubs. The product does not say `Available pay`,
`Withdraw`, `Guaranteed`, `Payroll complete`, `Your money`, `Backpay owed`, or
`Paid` without the exact external authority.

### Security, failure, and proof requirements

- Tenant, Legal Entity, worker/payee, Field Account, Field Account funding
  currency, external compensation/payment currency, external arrangement,
  provider company or governed tenant authority issuer, environment,
  destination, plan, actor, and purpose scope are mandatory on every durable
  authority.
- Payroll authorization is separate from accounting authorization. Grants are
  encrypted separately from destination configuration; least scopes, access
  auditing, revocation, cache invalidation, expiring artifacts, allowlisted
  DTOs, and PII-free telemetry are required.
- SSNs, bank accounts, tax elections, garnishments, health-benefit information,
  complete provider payloads, and paystub bytes are not ingested by default.
- Atomic decision-plus-coverage publication, database uniqueness, CAS,
  outbox/inbox delivery, native-event deduplication, partial-result manifests,
  ambiguity quarantine, and read-before-retry prevent duplicate or uncertain
  work.
- Release proof covers all plan methods; employee payroll and contractor/AP;
  monthly, biweekly, and non-aligned periods; organization-funded shortfall;
  Plan Version interval overlap rejection; same-scope/period Decision CAS;
  leaver and distinct off-cycle periods; partial/mixed payment; provider
  rejection, timeout, drift, cancellation, failure, and reversal; single-owner
  accounting; minor-unit conservation; effect-backed coverage fulfillment
  without double subtraction; proof-gated remainder release;
  component-level result/payment application without overapplication or silent
  funding-source reprioritization; payment-based recognition with and without
  exact organization-cost basis; non-selected-track disagreement;
  outcome-unknown reservation quarantine; provider-backed and governed-manual
  Engagement Authority Reference; equal- and cross-currency plans with exact
  conversion, rounding, and residual; one-payment-currency mixed coverage with
  signed typed resolved residual and exact source FX evidence; coverage
  uniqueness; gross/net non-double-counting;
  tenant/entity/worker/currency isolation; responsive keyboard and
  screen-reader journeys; error summaries and status announcements; 200% zoom;
  and production-shaped volume.

### Explicit non-goals

- No payroll, tax, benefit, withholding, wage, overtime, classification, bank,
  AP-aging, or legal-entitlement engine.
- No direct compensation payout, payroll submission, autonomous payroll
  approval, worker bank account, cash-out action, or paystub archive.
- No formula DSL, percentage-of-balance pay, donation-triggered pay,
  tenant-defined lifecycle, automatic short check, backpay, arrears, or
  negative Field Account.
- No provider-shaped domain model, universal payroll adapter, or inference that
  an accounting connection grants payroll access.
- No handoff, provider, payment, or accounting state collapsed into one mutable
  status.

### D4 adversarial review

| Category                          | Concern? | Primary failure                                                                                                                                | Severity | Likelihood  | Permanent prevention                                                                                                     |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | Yes      | Monthly, single-currency, employee-only, current-plan, or universal-provider assumptions fail for real tenants.                                | Critical | High        | Exact frozen scope and periods, prospective versions, bounded methods, artifact fallback.                                |
| Technical debt                    | Yes      | Duplicate integration stacks and free-form calculations become unmaintainable payroll code.                                                    | Critical | High        | Reuse Phase 20 primitives, one canonical evaluator/projection, no formula DSL or dual write.                             |
| Edge cases                        | Yes      | Contractors, ministers, households, departures, partial/mixed payments, reversals, off-cycle runs, late support, and FX misstate funding.      | Critical | High        | External classification, exact individual payee identity, typed occurrences, explicit FX evidence, exception quarantine. |
| Footguns                          | Yes      | Goals become salary, reservations become debits, exports become paid, or staff reduce compensation without authority.                          | Critical | High        | Purpose-specific actions, immutable coverage, review/confirmation, banned misleading terms, external authority.          |
| Tenant safety                     | Yes      | Compensation or provider identities cross tenants, Legal Entities, workers, or destinations.                                                   | Critical | Medium      | Composite same-scope keys, forced RLS, server-owned context, fail-closed mapping and isolation tests.                    |
| Over-engineering                  | Yes      | Wage, tax, benefit, workflow, or provider-universal engines turn Asym into payroll.                                                            | High     | High        | Three plan methods, one workspace, one handoff contract, external execution.                                             |
| UX/UI and friction                | Yes      | Policy machinery overwhelms missionaries or opaque totals destroy finance trust.                                                               | High     | High        | Quiet optional card, exception-first finance queue, exact through-dates, progressive detail, one action per state.       |
| Hidden coupling                   | Yes      | Support close, compensation period, payroll, Field Account effect, accounting, and payment collapse together.                                  | Critical | High        | Separate periods and authorities; downstream change only from purpose-owned evidence.                                    |
| Failure modes                     | Yes      | Provider outage, unknown timeout, duplicate webhook, partial bulk work, rejected import, failed deposit, or reversal causes unsafe retry.      | Critical | Medium      | Artifact fallback, operation idempotency, inspect-before-retry, manifests, ambiguity cases, append-only recovery.        |
| Data integrity risks              | Yes      | Plan overlap, double coverage, currency mixing, provider drift, result overapplication, or gross/net double counting corrupts balances.        | Critical | High        | Exclusion/unique constraints, minor-unit conservation, content digests, readback diff, coverage ceilings.                |
| Security and privacy risks        | Yes      | Payroll PII leaks through views, artifacts, logs, notifications, support, or provider access.                                                  | Critical | Medium-high | Least scopes, separate grants, minimal ingestion, purpose RBAC, expiring artifacts, redaction and access audit.          |
| Scalability and performance risks | Yes      | Full-history recomputation, provider calls in closes, or per-row operations fail at monthly volume.                                            | High     | Medium      | Set-based indexed projections, chunked jobs, cursor resume, no provider call inside publication transaction.             |
| Operational burden                | Yes      | Per-worker formulas, repeated mapping, manual matching, and clean-row approvals recreate spreadsheets.                                         | High     | High        | Defaults, plan reuse/import, mapping health, homogeneous bulk review, exceptions only.                                   |
| Observability gaps                | Yes      | Staff cannot locate plan, coverage, handoff, provider, payment, or accounting discrepancies.                                                   | High     | Medium      | Correlation IDs, health and aging metrics, exact package/readback diff, privacy-safe timeline.                           |
| Dependency and integration risks  | Yes      | Provider products, regions, scopes, schemas, rate limits, and access programs change.                                                          | Critical | High        | Exact capability certificates, versioned adapters/fixtures, canaries, backoff, artifact continuity.                      |
| Migration and upgrade risks       | Yes      | Mutable/provider-shaped records or dormant gift-sum balance code survives as competing authority.                                              | Critical | High        | Clean replacement, schema gates, canonical packages, immutable native evidence, no dual write.                           |
| Other development hazards         | Yes      | Concurrent decisions, stale permission, timezone boundaries, callback races, wrong environments, or unsafe undo duplicate or misroute funding. | Critical | Medium      | Half-open intervals, CAS, authorization recheck, environment pinning, outbox/inbox, append-only supersession.            |

### Evidence

- [Phase 21 D4 compensation research and complete adversarial review](./phase-21-mission-dashboard-product-research-evidence.md#d4-ratified-direction-contract-referenced-compensation-funding-with-external-payroll-authority)
- [IRS exempt-organization worker classification](https://www.irs.gov/charities-non-profits/exempt-organizations-independent-contractors-vs-employees)
- [IRS Publication 517](https://www.irs.gov/publications/p517)
- [Department of Labor nonprofit guidance](https://www.dol.gov/agencies/whd/fact-sheets/14a-flsa-non-profits)
- [QuickBooks Online Accounting API](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api)
- [QuickBooks Workforce FAQ](https://developer.intuit.com/app/developer/payroll-time/docs/faq)
- [Xero Payroll OAuth scopes](https://developer.xero.com/documentation/guides/oauth2/scopes/)
- [Gusto payroll statuses](https://docs.gusto.com/embedded-payroll/docs/payroll-statuses)
- [ADR-0065 — Contract-referenced compensation funding with external payroll authority](../../adr/0065-contract-referenced-compensation-funding.md)

## D5 — Organization-authorized support reallocation and exit disposition

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one bounded,
> organization-authorized, purpose-compatible Support Reallocation Case with
> exact source-purpose authority, deterministic close-aware capacity, atomic
> internal pairs, a conserving exit manifest, proof-gated charitable
> succession, source-owned lifecycle succession, and Phase-20-only accounting
> delivery.**

The short ruling above carries the following binding contract. It is not
permission to replace the separate authorities below with one mutable case
status.

### Authority model and tenant control

One **Support Reallocation Case** coordinates, but does not own:

1. an optional, nonbinding worker request or exit preference;
2. one immutable prospective Support Reallocation Policy Version;
3. exact accepted-source purpose authority and one Support Reallocation
   Coverage Manifest;
4. one conflict-aware, immutable organization Support Reallocation Decision;
5. either atomic internal Field Account pairs, one or more evidence-gated
   Charitable Succession Handoffs, or an exact mixture;
6. independently authoritative Field Account, lifecycle, payment, accounting,
   communication, legal, and incident outcomes; and
7. cause-linked, append-only recovery for late or adverse facts.

The case has two bounded purposes: `active reallocation` and
`exit disposition`. They share authorization, coverage, conservation, and
audit primitives. Ordinary work does not inherit an exit checklist, and exit
work does not create a second transfer engine.

Every Tenant and Legal Entity starts with a usable staff-only default:

- internal same-Tenant, same-Legal-Entity, same-currency reallocation only;
- one authorized finance approver;
- no product-imposed amount cap or retained-balance floor beyond exact
  nonnegative unreserved capacity;
- missionary requests off; and
- external charitable succession off until the responsible specialist route
  and evidence contract are configured and proved.

An authorized tenant may activate a prospective policy version that controls
only:

- missionary request mode: `Off`, `Preference only`, or
  `Destination and amount request`;
- eligible typed Phase 21 destination roles: worker-associated Support
  Assignment Field Account, project/purpose Support Assignment Field Account,
  or organization-support-pool Support Assignment Field Account;
- whether a case may split across eligible destinations;
- currency-specific retained-balance floor, amount cap, and request-frequency
  limit;
- one normal approver and one conditional additional approval for configured
  materiality, exit, external-successor, or policy-exception conditions;
- missionary and recipient visibility, safe explanation, notification
  preference, and finance contact path; and
- an exit disposition suggestion or `Finance chooses each case`.

A finance staff member who created a case may approve it when the tenant grants
both roles and the actor has no personal interest. Requester, beneficiary, or
other personally interested self-approval is prohibited. A worker request can
never become execution authority. Tenants cannot add arbitrary formulas,
statuses, destination types, code, or approval graphs.

Policy versions are prospective and scoped to exact Tenant and Legal Entity.
Submission pins the policy and eligible-destination snapshot. Later
configuration changes never reroute in-flight work; stale or inactive
destinations return the case to review.

### Exact source-purpose authority

Phase 21 does not infer purpose compatibility from a current Designation,
worker page, organization discretion, or aggregate Field Account balance.
Phase 13 must freeze, at acceptance, an immutable posted-line
purpose-authority projection containing:

- exact Designation identity;
- restriction-or-preference classification;
- exact purpose and excess-use policy version;
- source-posting coverage; and
- one closed source-provenance variant:
  - when governed content was presented or captured, the exact source-owned
    publication kind, reference, and digest; or
  - typed `not_applicable` or `not_captured` plus the exact source-purpose
    evidence reference and digest, such as a Designation, remittance, memo, or
    acceptance-authority record.

Phase 22 owns a public giving-page publication only when that page was the
accepted source, over Phase 23's CMS substrate. Phase 17 owns a message
publication only when a governed communication was the accepted source. Other
producers, including offline entry and import, supply their actual
owner-labelled source-purpose evidence to the Phase 13 resolver; no producer
fabricates a publication or chooses the legal classification. Phase 7 owns
receipt and deductibility facts. Phase 21 consumes immutable references and
never edits those authorities. Missing, ambiguous, or disputed authority
blocks only the affected line for an authorized specialist.

Phase 13 may append a purpose-authority successor only after the exact
jurisdiction-permitted donor, legal, court, or regulator authority exists. It
preserves the original accepted terms. This is not an ordinary data correction,
and donor refund is not an exit-disposition option.

Within one compatible purpose-and-currency bucket, source coverage resolves in
the stable order of Support Cycle boundary, Phase 13 posting sequence, then
coverage identifier. Staff and workers cannot cherry-pick donors. A specialist
may supply an explicit source selection only to resolve a blocked exception,
with the exact authority and reason frozen.

### Deterministic close-aware capacity

The disposable staff projection is:

```text
Finance-confirmed Field Account Balance
− every qualified negative open-cycle Field Account effect not yet in that close
− exact active non-reusable Field Account Funding Coverage
− exact active Support Reallocation Coverage not replaced by its posted debit
− prospective tenant-policy retained-balance floor
= Eligible to reallocate as of [date]
```

Qualified negative effects include compensation, reimbursement, assessment,
reallocation, refund, reversal, and correction debits. Positive provisional
support never increases capacity. A Reimbursement Obligation, pending expense,
estimated exposure, legal matter, or incident is not silently converted into a
second balance. It subtracts only through exact coverage or a qualified
open-cycle effect, never both. Unknown amount needed for capacity blocks rather
than inventing a hold.

Final authorization compares and swaps the reviewed source account,
destination accounts, policy, lifecycle, purpose, destination, close, and
coverage versions. A stale version, insufficient capacity, purpose conflict,
same source and destination, inactive destination, unresolved authority, or
interested approver fails closed with a safe exact reason and preserves the
case for correction.

Support Reallocation Coverage freezes exact source-purpose and amount coverage.
An internal pair fulfills it in the same commit. External coverage remains
active through partial or unknown outcomes and is fulfilled only for an exact
qualified disposition effect. A remainder releases only after proof that the
downstream work never executed or was authoritatively cancelled; coverage does
not expire by timer.

### Atomic internal reallocation

An internal result has one source and one or more eligible typed Phase 21 Field
Account destinations. It is one purpose-typed, balanced, idempotent database
transaction:

- the immutable Decision, source debit, destination credits, coverage
  fulfillment, and outbox evidence append together or none append;
- every side has the same Tenant, Legal Entity, Field Account funding currency,
  transaction identity, and Support Cycle;
- a Phase 13 Designation, project, or GL account may explain a destination but
  is never written as the Field Account destination;
- accounts lock in deterministic identifier order; and
- all sides remain open-cycle activity until one later Support Cycle Close
  admits the complete pair and advances both Finance-confirmed balances
  together.

A cross-Tenant, cross-Legal-Entity, cross-currency, personal, affiliate,
treasury, or external destination is never an internal reallocation. A personal
destination always blocks. Another tenant identifier alone grants no authority.
Same-entity FX and affiliate/inter-entity work remain separately owned
treasury, grant, and accounting concerns outside D5.

### Proof-gated charitable succession

Only an independently verified charitable recipient may enter the optional
external specialist lane. A **Charitable Succession Handoff** freezes:

- recipient legal name, stable registration or tax identity, jurisdiction,
  current status evidence, and evidence date;
- approved charitable purpose and exact source-purpose coverage;
- tenant-defined proportional legal, due-diligence, grant, sanctions, consent,
  notice, or agreement evidence;
- charity identity separately from payee and payment-destination identity;
- exact source disposition and intended payment amounts and currencies;
- when currencies differ, exact external conversion authority, source and
  payment amounts, rate or source calculation, rounding, residual disposition,
  and provenance;
- authorizers, evidence references, and digests; and
- the responsible external payment and accounting route.

Asym does not move the money or infer payment. A **Charitable Succession
Result** qualifies only when it matches the organization Decision, still-valid
required authority, Handoff, and authoritative external payment occurrence by
payee, amount, currency, date, reference, and evidence identity. Payment
evidence alone is insufficient. Partial, failed, returned, reversed, or
ambiguous results append exact outcome and coverage changes without creating a
fabricated internal credit or silently releasing capacity.

Every qualified external disposition effect is also one canonical balanced
Field Account occurrence: the source Field Account debit and an exact typed
organization-control/disposition counter-entry append atomically, use the same
currency and occurrence identity, and enter the same governed Support Cycle
Close. The counter-entry is not a fabricated recipient Field Account, payment
execution, or general-ledger truth. A one-sided external debit cannot qualify,
close, or become accounting source evidence.

### Conserving exit disposition and lifecycle succession

Exit handling activates only from an exact **Worker Lifecycle Authority
Reference** containing the departure identity, status, effective boundary,
issuer, source/evidence reference, and immutable version. It references the
external HR or mobilization authority when available, or a governed
tenant-issued lifecycle record otherwise. It is distinct from D4's Engagement
Authority Reference and is never inferred from `missionaries.is_active`,
dashboard access, fundraising activity, or a finance note.

Finance may draft a case before the authoritative transition, but that draft
changes no request, Designation, recurring commitment, public page, assessment
profile, compensation plan, or Field Account behavior. The pinned transition
alone activates exit handling and closes new missionary requests. It does not
cancel independently live compensation, final-pay, reimbursement, expense,
payment, incident, legal-hold, or communication work.

One immutable **Exit Disposition Manifest**:

1. pins lifecycle and proposed close boundaries;
2. inventories every purpose-and-currency layer, qualified adverse effect,
   non-reusable coverage, independently live obligation, and blocker;
3. records a worker's preference only when policy permits and always as
   nonbinding;
4. conserves the exact residual across typed internal, external,
   continuing-authority, and organization-retained lines;
5. applies each internal line as its own atomic pair and each external line
   through exact coverage, Handoff, and independently proved Result;
6. proves retirement, completion, or source-owned succession for D3 Assessment
   Profile assignments and determinations, D4 Compensation Funding Plans and
   work, Phase 13 Designations, and any Phase 16 recurring-term stop or
   successor;
7. permits Phase 22 to retire or redirect presentation only after financial
   destination authority changes—never to choose or redirect money; and
8. closes the Field Account to ordinary activity only after no unexplained
   residual, discretionary future writer, or unowned next action remains.

The manifest is a conserving plan, not one false atomic outcome. Internal lines
may complete while external lines remain covered and open. An internal line is
terminal only after both sides enter the same immutable Support Cycle Close. An
external line is terminal only after a qualified Result and its disposition
effect enter a governed close, or an authorized continuing successor owns the
still-covered line.

Closure is read-only, not deletion. A late gift, refund, reversal, expense,
compensation result, payment result, or other source fact opens a cause-linked
recovery case and appends corrections. A source-mandated adverse correction
remains attached to the original Field Account and may expose a visible
deficit; it never silently claws back a destination. Recovery from a
destination needs a new organization-authorized Decision against current
capacity and authority.

### Phase-20-only accounting and governed communication

Neither a case nor an internal pair writes QBO or Xero. Only:

- an internal pair whose complete two-sided occurrence entered one immutable
  Support Cycle Close; or
- a Charitable Succession Result whose complete balanced disposition occurrence
  entered one governed close

may emit a separately certified **Support Reallocation Accounting Occurrence**.
Phase 20 alone applies accountant-confirmed semantics, Phase 20 D17 Posting Ownership
Cutover, Accounting Release rules, provider delivery, readback, and drift
detection. The current Phase 20 generation deliberately keeps this source
family unsupported and dark. A later separately approved Phase 20 change must
certify its source schema, accountant semantics, Posting Profile recipe, and
Phase 20 D17 ownership behavior before even a close-covered occurrence may enter.
A request, review, Decision, reservation, open-cycle pair, Handoff, payment
record alone, unknown result, or uncertified close-covered occurrence is
accounting-dark. A generic JournalEntry, ManualJournal, artifact, or manual
posting fallback is prohibited.

Consent, regulator or attorney-general notice, grantee acceptance, or another
jurisdiction-required communication may be prerequisite authority and blocks
commitment until its source owner proves completion. A post-occurrence
informational message is a separate typed communication obligation owned by
Phases 6 and 17. Its delivery failure never rolls back a valid financial
occurrence.

### Binding staff and missionary UX

- Staff use one doorway: **Field Accounts → Support reallocations**, with
  `Needs review`, `In progress`, and `History`. History owns type, outcome,
  date, and exception filters. `Needs attention` appears only as a conditional
  staff-only saved view when work exists.
- An ordinary internal case is one page or side sheet—not a stepper—with
  **From**, **Purpose**, **To**, **Amount**, **Reason**, exact policy/as-of
  evidence, and **Before → Change → After**. Split destinations appear only
  when enabled. Exit uses a nonlinear task-and-blocker page with owner, due
  date, obligations and holds, residual by purpose and currency, disposition
  lines, and close readiness.
- Actions use exact verbs: **Approve and record**, **Submit for final approval**,
  **Request information**, **Decline request**, **Approve external
  disposition**, **Record handoff outcome**, and **Close field account**.
  There is no generic **Transfer**, **Release funds**, **Paid**, **Completed**,
  or **Mark complete**, and no blind bulk financial approval. **Approve and
  open next** is permitted.
- Review remains editable before commitment, has direct **Change** links, and
  preserves entered work after stale-evidence failure. It states: **This
  records open-cycle activity now. Finance-confirmed balances change only when
  a governed Support Cycle Close includes it.**
- The missionary surface is absent when requests are disabled. When enabled,
  it shows one quiet **Request support reallocation** action, or **Share an
  exit preference** during departure. It exposes only tenant-curated
  destinations; no arbitrary worker or external-charity directory.
- A dated Finance-confirmed balance may appear as context, never as
  `transferable`, `spendable`, or `available`. Submission confirms **No Field
  Account activity has changed**.
- Missionary-safe states are `Submitted`, `Finance needs information`,
  `Not approved`, and `Withdrawn`, followed by internal `Recorded` and
  `Included through [close date]`. External states remain source-labelled:
  `Approved for external disposition`, `Submitted to [payment owner] on
[date]`, `Outcome not yet confirmed`, and `Payment confirmed by [evidence
source] on [date]`. The worker-safe exception is **Finance is reviewing a
  delay**.
- Internal reasons and missionary-safe explanations are separate. Restricted
  source identities, other accounts, finance holds, provider payloads,
  conflict notes, and legal review are omitted. Former missionaries may retain
  read-only access to final activity statements and safe history only while a
  current Principal/Party, Active Tenant Assignment, Support Assignment,
  purpose, tenant, and lifecycle authorization explicitly permits it.
  Participation alone never authorizes access, and retaining finance evidence
  never grants continuing portal access.
- Mobile uses one-column cards, at least 44-by-44 CSS-pixel targets, keyboard
  and screen-reader operation, visible focus, non-color-only states, error
  summary plus inline errors, status announcements without focus theft, 200%
  zoom, and locale/currency formatting. No failure is toast-only or hover-only.

### Release proof

Activation requires production-shaped, independently observable proof of:

1. deterministic prospective policy selection, same-rank ambiguity blocking,
   conflict-aware approval, and exact lifecycle authority;
2. complete Phase 13 accepted-source purpose authority with the exact closed
   source-provenance variant and preserved originals, including publication
   evidence only when the accepted source actually presented or captured one;
3. exact capacity arithmetic with provisional positive support excluded and
   coverage/effect double subtraction impossible;
4. same-scope atomic multi-entry conservation, CAS, uniqueness, idempotency,
   rollback, and deadlock-safe locking in real Postgres tests;
5. one later Support Cycle Close admitting both sides of every internal pair;
6. conserving exit manifests, source-owned writer succession, read-only
   closure, and cause-linked late-fact recovery;
7. exact recipient, purpose, jurisdiction, authority, Handoff, payment, Result,
   partial/reversal, and ambiguity behavior for external succession, including
   one atomic source debit plus typed organization-control/disposition
   counter-entry admitted together by one close;
8. negative Tenant, Legal Entity, account, role, cache, job, search, storage,
   export, and signed-access isolation tests;
9. responsive keyboard and screen-reader journeys, review/correct, stale
   preview recovery, error focus, non-color status, 200% zoom, and no
   toast-only failure;
10. production volume and fixtures for shared ministries, splits, death or
    incapacity, inactive destinations, legal hold, unresolved reimbursement,
    late gifts and refunds, negative corrections, provider outage, and
    cross-scope attempts;
11. accounting-dark request, review, Decision, reservation, open-cycle,
    Handoff, payment-only, and unknown-result states plus the sole certified
    close-covered Phase 20 entry; and
12. fault-injection and recovery proof at every consequential commit boundary.

Existing contribution-correction approval code is only a pattern. D5 must not
inherit self-approval for personally interested actors or apply without the
exact expected revisions reviewed.

### Explicit non-goals

- No worker-owned balance, withdrawal, payout, donor refund, target clawback,
  automatic external payment, or direct QBO/Xero write.
- No generic workflow, formula, grant-compliance, payment, treasury, FX, or
  inter-entity engine.
- No mutable historical policy, purpose, coverage, Decision, transaction,
  Handoff, Result, manifest, close, or accounting state.
- No purpose compatibility inferred from current labels, web pages, fund
  directory entries, organization discretion, or staff notes.
- No external success inferred from approval, registry lookup, Handoff,
  provider acknowledgement, or payment evidence alone.
- No source-owned assessment, compensation, Designation, recurring, lifecycle,
  page, payment, communication, incident, or legal truth silently cancelled by
  exit closure.

### D5 adversarial review

Every category contains a material concern. C-prime-R is the permanent
prevention strategy:

| Category                          | Concern? | What could go wrong and why it matters                                                                                | Severity | Likelihood  | Permanent prevention                                                                                                         |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Hard-coded caps, exit formulas, calendars, or destination models force tenants back to spreadsheets.                  | High     | High        | Prospective bounded policies, semantic roles, exact scope/versions, and close-aware outcomes.                                |
| Technical debt                    | Yes      | Separate transfer/exit engines drift; a generic workflow builder becomes a second product.                            | High     | Medium-high | One typed case family with shared finite authority, coverage, occurrence, and evidence primitives; no formulas or DSL.       |
| Edge cases                        | Yes      | Shared ministries, splits, death, inactivity, holds, late facts, refunds, and open obligations can race closure.      | Critical | High        | Exact lifecycle authority, complete inventories, pinned destinations, read-only closure, and cause-linked recovery.          |
| Footguns                          | Yes      | Wallet language, open search, conflicts, stale approval, blind bulk action, or `Mark complete` misstates authority.   | Critical | Medium-high | Nonbinding requests, conflict rules, exact verbs, review, CAS, atomic writes, and no blind bulk consequential actions.       |
| Tenant safety                     | Yes      | A lookup, cache, job, export, or malformed ID could expose or credit another tenant/entity.                           | Critical | Medium      | Composite scope keys, server-owned authorization, database constraints, RLS, quarantines, and negative isolation tests.      |
| Over-engineering                  | Yes      | Arbitrary stages, formulas, approvals, destinations, and universal legal logic overwhelm staff.                       | High     | High        | Staff-only default, finite roles, one normal plus one conditional approval, and one optional specialist lane.                |
| UX/UI and user friction           | Yes      | Too much legal detail overwhelms; too little implies ownership or hides the capacity bridge.                          | High     | High        | Quiet queue, one-page ordinary flow, task-based exit, progressive detail, exact bridge, and truthful states/actions.         |
| Hidden coupling                   | Yes      | Exit could cancel live work, rewrite donor truth, depend on QBO, or let a page redirect money.                        | Critical | Medium-high | Immutable references; source-owned succession; independent authorities; Phase 20-only accounting.                            |
| Failure modes                     | Yes      | Partial pairs, duplicate retries, unknown payments, expired proof, or deactivated destinations create false outcomes. | Critical | Medium      | One atomic internal transaction, idempotency/outbox, inspect-before-retry, revalidation, and ambiguity-held coverage.        |
| Data integrity risks              | Yes      | Aggregate inference, missing purpose history, double subtraction, reused coverage, or residual loss corrupts balance. | Critical | Medium-high | Accepted-source snapshots, stable lot order, exact formula, minor-unit conservation, uniqueness, CAS, and integrity jobs.    |
| Security and privacy risks        | Yes      | Missionaries could infer donors, other balances, HR/legal facts, holds, or external evidence identifiers.             | Critical | Medium      | Purpose RBAC, allowlisted projections, separate safe explanations, private evidence, redaction, access audit, and retention. |
| Scalability and performance risks | Yes      | Full-history replay or tenant-wide locks fail during close and offboarding peaks.                                     | Medium   | Medium      | Incremental verified projections, exact-row deterministic locks, pagination, asynchronous handoffs, and tenant fairness.     |
| Operational burden                | Yes      | Bespoke approvals, manual purpose review, repeated recipient proof, and notifications recreate tribal process.        | High     | High        | Guided defaults, reusable prospective policy, curated destinations, freshness-bounded evidence, one owner, and exceptions.   |
| Observability gaps                | Yes      | Support cannot tell which authority owns a wait, failure, or recovery.                                                | High     | Medium-high | Correlated immutable IDs, privacy-safe timeline, current cause/owner, aging metrics, and orphan/ambiguity alerts.            |
| Dependency and integration risks  | Yes      | Registries, sanctions data, accounting, and payment evidence can be stale, unavailable, or incapable.                 | High     | Medium      | Capability labels, internal evidence package, manual specialist lane, freshness rules, backoff, and no inferred success.     |
| Migration and upgrade risks       | Yes      | Provider-shaped records, mutable policies, opaque states, or lossy export destroy historical authority.               | High     | Medium      | Canonical versioned semantics, immutable open exports, provider identities at adapters, and prospective migration.           |
| Other development hazards         | Yes      | Concurrent reviews, close races, time zones, callbacks, rollback, and unclear owners duplicate or misdate work.       | Critical | Medium-high | Half-open intervals, CAS/uniqueness, deterministic locking, event dedupe, append-only succession, and fault injection.       |

### Evidence

- [Phase 21 D5 research, UX contract, adversarial review, and proof gates](./phase-21-mission-dashboard-product-research-evidence.md#d5-ratified-direction-support-reallocation-and-worker-exit-disposition)
- [Reliant MTD Fund Transfer](https://solomon.reliant.org/display/employman/MTD%2BFund%2BTransfer)
- [ECFA sample Deputized Worker Policy](https://www.ecfa.org/PDF/Sample_Deputized_Worker_policy.pdf)
- [ECFA Standard 4 commentary](https://www.ecfa.org/content/comment4)
- [IRS Publication 526](https://www.irs.gov/publications/p526)
- [IRS Tax Exempt Organization Search](https://www.irs.gov/charities-non-profits/search-for-tax-exempt-organizations)
- [CRA CG-032](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/policies-guidance/charities-making-grants-non-qualified-donees.html)
- [Modern Treasury ledger locking](https://docs.moderntreasury.com/ledgers/docs/lock-on-account-balance-or-version)
- [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
- [ADR-0066 — Organization-authorized support reallocation and exit disposition](../../adr/0066-organization-authorized-support-reallocation-and-exit-disposition.md)

## D6 — Quiet default and proof-gated parallel currency-scoped Field Accounts

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one explicit, quiet,
> Legal-Entity-owned default Field Account currency with tenant-authorized,
> prospective, source-family-specific proof-gated parallel currency-scoped
> Field Accounts; immutable currency and structurally complete Tenant, Legal
> Entity, purpose, account, and currency isolation; per-currency entries,
> assessments, reservations, capacity, Support Cycle closes, admission
> coverage, corrections, statements, reallocations, and retirement; one
> immutable, admission-contract-owned and per-designation-conserving Support
> Currency Allocation Manifest whenever source and Field Account currencies
> differ; independently authoritative activation, source readiness, Field
> Account close, Phase 20 accounting delivery, and external payroll/AP payment
> truth; affected-positive-only quarantine with mandatory adverse-correction
> continuity; exact externally owned conversion evidence without an Asym FX
> engine; and one accessible, quiet “Support balances” experience with every
> balance separately ISO-labelled and through-dated, and no authoritative
> converted grand total, mutable currency, destructive merge, or
> cross-currency internal reallocation.**

### Single-currency authority and quiet default

- Every technical Field Account is structurally scoped to one exact Tenant,
  Legal Entity, Support Assignment, and immutable ISO currency. Its approved
  charitable-purpose relationship remains a separately versioned Phase 13
  mapping and never changes the account key. The same Support Assignment may
  have sibling Field Accounts in different
  currencies; their relationship is a read-only presentation grouping, never
  a writable aggregate or mixed-currency financial root.
- Every Legal Entity has one explicit, tenant-confirmed prospective **Default
  Field Account Currency Version**. The product may recommend the ordinary
  organization-controlled settlement currency, but missing configuration does
  not mean USD and the system never derives authority from browser locale,
  Site currency, donor presentment, worker country, payroll currency, or a
  mutable QBO/Xero setting.
- Changing the default affects only future account suggestions and presentation
  order. Source routing or admission requires its own Field Account Currency
  Activation Version. The default cannot redenominate, relabel, merge, reorder
  authority, or move an existing balance, occurrence, close, statement,
  assessment, reservation, correction, or accounting record.
- Entries, assessments, reservations, capacity, Compensation Funding
  Coverage, reimbursement funding, Support Cycle closes, admission coverage,
  corrections, statements, exports, control totals, D5 reallocations, and
  retirement remain exact and independently governed per currency. No
  cross-currency scalar is balance or capacity authority.

### Source-family-specific activation

There is no universal `multicurrency_enabled`, `currency_ready`, or live
provider-health flag.

An additional currency uses one immutable prospective **Field Account Currency
Activation Version** for one exact Tenant, Legal Entity, Support Assignment,
approved purpose, destination Field Account identity or atomic creation intent, source family,
exact source binding, currency, environment, and half-open effective interval.
It requires an organization-controlled same-currency admission path appropriate
to that source:

- a retained Stripe settlement source references the exact Phase 20 D20
  processor, balance, payout-destination, and accounting capability evidence
  that applies;
- an offline deposit or direct credit uses its exact same-currency deposited,
  direct-credit, or D2-qualified staff-confirmed evidence;
- donor presentment currency alone never creates or selects a Field Account;
  Phase 24 remains the owner of donor presentment activation; and
- QBO/Xero readiness is independently required only for an accounting-delivery
  capability that depends on it. It is not a universal prerequisite for Field
  Account truth or a Support Cycle close.

Activation proof, source-family qualification, disposable D2 close readiness,
immutable Support Cycle Admission Coverage, Phase 20 accounting delivery, and
D4 external payroll/AP payment capability remain different contracts. A
certificate may expire or drift without rewriting what it proved while valid.

### Converted-source allocation

The ordinary same-currency path uses existing exact Phase 13 designation-line
and Support Cycle admission coverage. When the source header and
organization-controlled Field Account allocation basis use different
currencies, Phase 21 requires one immutable **Support Currency Allocation
Manifest** before it may create any target-currency Gross Support Allocation.
`Gross` means before separate Phase 21 assessment and cost effects; it does not
claim that every source rail exposed a processor-gross amount.

The manifest freezes:

- exact Tenant, Legal Entity, source family, contribution/header, source
  revision, and the complete effective Phase 13 hard-tender header line set,
  including fee-cover or other non-support lines;
- every source-line identity, semantic role, eligibility, amount, and source
  currency;
- one exact typed organization-controlled target allocation basis and currency:
  `provider_balance_gross`, `bank_credited_amount`, or another closed
  D2-qualified exact basis;
- exact provider/bank evidence identity and observation time;
- provider-supplied conversion provenance and explicit rate direction when
  available;
- separately observed provider-attributed conversion costs and ordinary
  processor fees when the source exposes them, without inventing an embedded
  or unavailable cost;
- the deterministic target-currency allocation across that complete line set
  using the established largest-remainder minor-unit seam, with only eligible
  non-fee-cover designation target portions allowed to create Gross Support
  Allocations;
- source and target amount representations, rounding, the residual recipient,
  and algorithm/contract version; and
- conservation and unique-coverage proof: the complete effective source line
  set equals the source header, the complete target line set equals the exact
  target allocation basis, and no source or target amount is consumed twice.

This manifest is an admission artifact derived from exact source-owned and
provider/bank facts. It is not donor, receipt, Designation, accounting,
translation, revaluation, or market-rate truth. Phase 21 does not query a
current rate, accept a staff-authored rate, default to `1.0`, infer a provider
rate, or reuse the manifest as a Phase 20 Accounting Effect. Missing or
contradictory evidence holds the affected positive candidate for repair.

Every later cross-currency refund, return, dispute, or source correction uses
its own immutable successor/correction Support Currency Allocation Manifest
with that adverse occurrence's exact source and provider/bank target amount,
currency, rate provenance, separately observed costs, allocation, rounding,
and residual. Its line applications are bounded by the exact remaining
original coverage. It never mechanically reverses the original target amount
or rate, and a hold or retired currency cannot suppress it.

### Failure containment and lifecycle

- A failed or expired retained-Stripe/source capability quarantines only new
  positive work requiring it. QBO/Xero outage, OAuth drift, accounting
  readback failure, or Bank Match state affects only its Phase 20 lane.
- Prior closes and balances remain readable. Healthy currencies and accounts
  continue. Known adverse corrections always append, even while new positive
  admission is held.
- Support Cycle UX may group a period, but publication authority and
  compare-and-swap protection remain per Field Account and currency. A grouped
  result says exactly which balances advanced and which need review; there is
  no mutable tenant-wide closed flag.
- Activation, default changes, and retirement use exact review versions and
  atomic prospective publication. Retirement stops ordinary new positive
  admission only after open cycles, reservations, obligations, assessment
  periods, correction writers, compensation/reimbursement work, and residual
  balances have an explicit continuing owner or governed disposition.
- History is never deleted, merged, zeroed, or converted. Mandatory late
  adverse facts continue. D5 internal Support Reallocation remains
  same-Tenant, same-Legal-Entity, and same-currency.
- External payroll, accounts-payable, bank, or other authorized conversion
  preserves exact source and result amounts/currencies, provider evidence,
  rate direction, fees, time, rounding, and residual under D4. It does not
  mutate or transfer value between Field Accounts. QBO/Xero owns accounting
  translation, revaluation, and foreign-exchange gain or loss.

### Staff and missionary experience

For one active currency, the missionary sees one quiet card:

> **Finance-confirmed support balance**
> CA$12,450.00 CAD
> Through June 30, 2026

The ordinary path has no currency selector, multicurrency badge, empty
settings, exchange-rate panel, inactive-currency placeholder, or provider
status. It never says `available`, `withdrawable`, `wallet`, or `cash balance`.

When more than one currency exists:

- the heading becomes **Support balances**;
- every authorized currency remains simultaneously visible in a compact
  stacked row/card with exact amount, ISO code, its own through date, material
  delayed/correction state, and direct activity access;
- the default currency appears first but is not a grand total;
- one quiet disclosure explains that settlement and accounting can differ and
  therefore the balances are not added together;
- a currency filter may narrow activity but cannot be the only way to discover
  another balance; and
- an all-currency activity list may interleave rows only when every amount
  retains its ISO code and no mixed subtotal, net change, chart axis, or grand
  total is shown.

Support-cycle statements are monthly by guided default and biweekly when the
tenant closes biweekly. Each statement remains scoped to one exact Field
Account and ISO currency with separate opening, activity, correction, closing,
and control-total facts. The workspace may group sibling same-period
statements, but it has no authoritative converted grand total. Any future
Phase 33 reporting estimate is visibly secondary, dated, rate-labelled,
non-authoritative, and excluded from capacity, close, compensation,
reimbursement, alert, and statement-control decisions.

Staff use **Add another support currency**, not a generic enable switch:

1. choose the exact currency and approved purpose;
2. verify the applicable organization-controlled source path and independently
   label optional accounting/payment capabilities;
3. preview the future effective boundary, affected account, assessment
   treatment, statement presentation, and what remains unchanged; and
4. activate through one explicit confirmation.

A blocked state says what is affected, what remains safe, why it is blocked,
who owns the next action, and what evidence resolves it. Missionaries never
see capability certificates, provider IDs, bank evidence, QBO/Xero state, or
FX controls.

### Invariants and proof gates

No D6 behavior reaches production without:

1. database-enforced Tenant, Legal Entity, purpose, Field Account, and currency
   scope; immutable currency; one active ordinary same-purpose/currency
   account; append-only entries; and unique source/manifest coverage;
2. safe integer-minor-unit money with explicit currency and exponent at domain
   boundaries, provider-specific amount normalization at adapters, checked
   arithmetic, and no floating-point business computation or `/100` fallback;
3. conservation and property tests for same-currency support, split converted
   gifts, deterministic largest-remainder allocation, partial/cumulative
   refunds, source and target residuals, negative corrections, large amounts,
   and zero-, two-, and three-decimal currencies;
4. real concurrency and recovery tests for activation versus activation,
   activation versus close, close versus adverse event, D3 determination,
   D4 coverage/effect, D5 pair, retirement, duplicate/out-of-order source
   events, stale review, crash, retry, and authorization revocation;
5. source/integration fixtures for ordinary Stripe conversion, retained
   Stripe settlement, offline same-currency deposit, bank conversion, missing
   and contradictory evidence, provider capability drift, QBO/Xero outage,
   and artifact-always accounting continuity;
6. proof that D3 assessments, D4 compensation and reimbursements, D5
   reallocations, exit disposition, statements, exports, alerts, and control
   tie-outs remain per currency and cannot use an estimated converted amount;
7. tenant-, entity-, Support-Assignment-, purpose-, restricted-worker-, role-, cache-,
   search-, export-, artifact-, notification-, and observability-isolation
   tests before aggregation or pagination;
8. certified-volume tests using many Support Assignments, multiple currencies, seasonal
   source volume, concurrent closes, statements, and invariant sweeps without
   full-history replay, per-row provider calls, or tenant-wide locks; and
9. mobile, keyboard, screen-reader, non-color, visible-focus, 200%/400% zoom,
   320 CSS-pixel reflow, locale, ambiguous-symbol, RTL, long-label, table/list,
   error-summary, and restrained status-announcement proof.

### Explicit non-goals

- No mixed-currency Field Account, aggregate balance, converted control total,
  cross-currency capacity, or current-rate historical rewrite.
- No Phase 21 exchange-rate service, FX quote, tenant rate picker, revaluation,
  treasury, foreign-exchange gain/loss engine, routing DSL, or accounting
  translation.
- No automatic activation of Stripe retained settlement, QBO multicurrency,
  Xero currencies, foreign bank accounts, or another irreversible
  provider-side setting.
- No destructive merge, mutable currency, retroactive default, silent
  redenomination, cross-currency D5 pair, or provider/accounting outage that
  invalidates Field Account truth.
- No promotion of current `current_funding`, `funds.current_amount`, implicit
  USD, donation sums, `Available Funds`, `Withdraw`, or symbol-only formatting
  into the future authority.

### D6 adversarial review

Every category contains a material concern. The ratified C-prime-R contract is
the permanent prevention strategy:

| Category                          | Concern? | What could go wrong and why it matters                                                                                                    | Severity | Likelihood     | Permanent prevention                                                                                                        |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Inferred defaults, a universal readiness flag, or live provider calls during close freeze unrelated balances when integrations change.    | Critical | High           | Explicit policy versions, source-specific proof, no live close dependency, and affected-positive-only quarantine.           |
| Technical debt                    | Yes      | Each downstream flow invents money/conversion rules, or a writable multicurrency parent becomes a second ledger.                          | Critical | High           | One currency-aware money model, one converted-source manifest, shared per-currency coverage, and no financial aggregate.    |
| Edge cases                        | Yes      | Split conversion, rate-changed refunds, retired-currency corrections, different close dates, and currency exponents corrupt totals.       | Critical | High           | Frozen exact manifests, append-only corrections, exponent-aware money, per-currency periods, and property tests.            |
| Footguns                          | Yes      | Staff mutate currency, merge accounts, enter a rate, use D5 as FX, delete a residual, or confuse provider availability with worker funds. | Critical | Medium-high    | Prospective constrained commands, no merge/rate/convert action, exact preview/CAS, and precise vocabulary.                  |
| Tenant safety                     | Yes      | Grouped queries, jobs, caches, exports, or service commands cross Tenant, Legal Entity, Support Assignment, purpose, or currency.         | Critical | Medium         | Complete structural scope, composite references, RLS, authorization recheck, scoped keys, and negative tests.               |
| Over-engineering                  | Yes      | FX, revaluation, routing, treasury, and workflow machinery overwhelms ordinary single-currency tenants.                                   | High     | High           | One quiet default, finite proof variants, optional sibling accounts, exact external evidence, and explicit non-goals.       |
| UX/UI and user friction           | Yes      | Selectors hide balances, symbols are ambiguous, combined totals mislead, and setup ceremonies burden staff.                               | High     | High           | All balances visible, ISO labels, per-balance through dates, quiet default, and progressive activation.                     |
| Hidden coupling                   | Yes      | QBO/Xero or Bank Match becomes Field Account authority; generic rate fields invert Stripe, QBO, or Xero conventions.                      | Critical | High           | Independent authority contracts and provider-typed source, target, units, and rate direction.                               |
| Failure modes                     | Yes      | Activation half-publishes, retry duplicates allocation, close partially commits, or retirement suppresses a refund.                       | Critical | Medium-high    | Durable staging, uniqueness, atomic CAS publication, deterministic locks, idempotency, and adverse successor recovery.      |
| Data integrity risks              | Yes      | Header-level converted value is inconsistently split, current rates rewrite history, coverage is reused, or numeric precision is lost.    | Critical | High           | Conserving immutable manifests, safe integer boundaries, checked arithmetic, unique coverage, and invariant sweeps.         |
| Security and privacy risks        | Yes      | Grouped balances, statements, exports, notifications, or telemetry reveal another scope, donor, or restricted worker.                     | Critical | Medium         | Purpose-scoped projections, authorization before aggregation, private evidence, short-lived access, redaction, and audit.   |
| Scalability and performance risks | Yes      | Parallel currencies multiply work; full folds, tenant-wide locks, provider-per-row calls, or giant closes fail seasonally.                | High     | Medium         | Incremental projections, indexed coverage, set-based evaluation, bounded staging, and per-account/currency CAS.             |
| Operational burden                | Yes      | Finance monitors healthy lanes, renews spreadsheets, explains floating totals, and manually repairs provider drift.                       | High     | Medium-high    | Exception-only operations, automated monitoring, expiry warnings, artifact continuity, and one cause/owner/action.          |
| Observability gaps                | Yes      | One currency silently stops while its stale balance appears current.                                                                      | High     | Medium         | Per-account source/admission/close/projection freshness, held value, proof expiry, correction age, and invariant metrics.   |
| Dependency and integration risks  | Yes      | Stripe regions, banks, QBO/Xero plans, OAuth, currency support, and API behavior drift independently.                                     | High     | High           | Capability-labelled adapters, expiring evidence, readback, local quarantine, and no inferred success.                       |
| Migration and upgrade risks       | Yes      | Prototype counters, implicit USD, or donation sums become unverifiable opening balances.                                                  | Critical | High if reused | Clean replacement; source-covered per-currency opening evidence; versioned exports; no compatibility authority.             |
| Other development hazards         | Yes      | Time boundaries, races, deadlocks, rate inversion, overflow, stale authorization, callback ordering, or cache poisoning duplicate money.  | Critical | Medium-high    | Half-open intervals, deterministic locks, expected revisions, checked arithmetic, typed rates, dedupe, and fault injection. |

### Evidence

- [Phase 21 D6 primary-source research, UX contract, adversarial review, and proof gates](./phase-21-mission-dashboard-product-research-evidence.md#d6-ratified-direction-quiet-default-and-proof-gated-parallel-currency-scoped-field-accounts)
- [Stripe supported currencies](https://docs.stripe.com/currencies)
- [Stripe Balance Transaction object](https://docs.stripe.com/api/balance_transactions/object)
- [Stripe multicurrency settlement](https://docs.stripe.com/connect/multicurrency-settlement)
- [QuickBooks Online multicurrency](https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-multiple-currencies)
- [Xero multicurrency](https://developer.xero.com/documentation/best-practices/data-integrity/multicurrency)
- [Modern Treasury ledger currencies](https://docs.moderntreasury.com/ledgers/docs/currencies)
- [Modern Treasury ledger guarantees](https://docs.moderntreasury.com/ledgers/docs/ledgers-guarantees)
- [MissionGO missionary dashboard walkthrough](https://www.missiongo.org/ContentFiles/Missionary%20Dashboard%20Walkthru.pdf)
- [MPDX multiple accounts](https://help.mpdx.org/article/1367-manage-multiple-accounts)
- [TntConnect multiple-currency behavior](https://www.tntware.com/tntconnect/help/en/pages/gifts_multicurrency.aspx)
- [Virtuous Project Statements](https://support.virtuous.org/hc/en-us/articles/6466181015949-What-is-the-Project-Statements-Tab)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ADR-0067 — Proof-gated parallel currency-scoped Field Accounts](../../adr/0067-proof-gated-parallel-currency-field-accounts.md)

## D7 — Capability-honest multi-provider compensation handoffs

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — a launch portfolio of fully
> built, capability-honest Compensation Handoff Adapters, with at least two
> production-authorized direct-write adapters required at launch: exact
> provider- and region-pinned Gusto Employee Payroll Draft, ADP Workforce Now
> Pay Data Input, and separately certified Xero Payroll AU and NZ draft-input
> adapters; capability-complete QuickBooks Workforce and Xero Payroll UK
> readback-and-artifact adapters where no equivalent per-run write exists; one
> immutable artifact-always Compensation Handoff Package and exactly one
> executable delivery lane; prospective Tenant-, Legal-Entity-,
> provider-organization-, product-, country-, environment-, external-provider-participant/payee-reference-,
> currency-, pay-cycle-, component-, and operation-scoped Delivery Profiles;
> explicit staff-reviewed provider-native preflight and preview; immutable
> Provider Draft Operations with concurrency protection, exact readback, drift
> detection, ambiguity-safe inspect-before-retry, residual-only append-only
> recovery, tenant-fair backpressure, kill switches, and production
> certification; while external providers remain authoritative for
> classification, calculation, approval, submission, posting, payroll
> completion, and payment—and without fictional provider parity, a universal
> payroll payload, payroll calculation or execution, contractor-payment
> initiation, destructive overwrite, blind retry, dual delivery,
> accounting/payroll connection conflation, adjacent-object substitution, or
> any claim that draft acceptance proves payroll completion or payment.**

### Launch portfolio and availability gate

- Phase 21 launches a portfolio of complete adapters for their exact supported
  capabilities, not a lowest-common-denominator payroll API:
  - **Gusto Employee Payroll Draft** updates an exact existing unprocessed
    payroll through the currently certified Gusto App Integrations workflow.
  - **ADP Workforce Now Pay Data Input** creates an exact provider-native input
    batch for staff review and processing in ADP.
  - **Xero Payroll Australia** and **Xero Payroll New Zealand** are separate
    regional adapters that may update only their exact certified draft
    pay-run/payslip surfaces.
  - **QuickBooks Workforce** and **Xero Payroll UK** are fully built
    readback-and-artifact adapters while current provider contracts do not
    prove an equivalent safe per-run compensation draft write.
- The Phase 21 multi-provider launch is incomplete until at least two distinct
  direct-write adapters have current production credentials, assigned scopes,
  provider authorization where required, and an exact production-shaped canary
  plus certification. Artifact/readback continuity may remain usable, but it
  is not the ratified D7 launch. Local completeness, a demo company, a sandbox,
  a partner application under review, or a provider logo does not satisfy that
  gate.
- Each adapter publishes a dated capability statement. A supported read is not
  presented as a write; a draft write is not presented as submission,
  calculation, posting, payroll completion, or payment.
- Capability loss, provider revocation, expired certification, or a kill switch
  can remove new direct-write availability without removing the immutable
  package or rewriting prior operation evidence.

### Fully built means the exact lifecycle is complete

Every launch adapter implements every applicable part of this contract:

1. encrypted provider authorization with least scopes, exact provider
   organization, product, country, environment, and revocation handling;
2. dated capability discovery for provider plan, role, permission, regional
   product, supported operation, limits, and current certification;
3. explicit destination and external provider participant/payee mapping using stable provider
   identifiers rather than names or “first company” defaults;
4. provider-native component-role mapping that blocks unsupported semantics
   instead of coercing reimbursement into earnings, fixed compensation into
   time, or payroll into an accounting bill;
5. fresh provider metadata, state, permissions, pay cycle, provider
   participant/payee reference, and
   current values before a release can qualify;
6. an accessible provider-native preview of exact target, existing readable
   values, proposed changes, replacement-versus-add behavior, and the boundary
   of what Asym will not do;
7. explicit permitted-staff release, destination-scoped serialization, and
   provider-specific concurrency or version protection;
8. request, response, correlation, destination, provider-participant/payee/
   component, timing,
   and readback evidence with payroll PII minimized;
9. exact readback where the provider exposes it, drift detection, and a
   truthful outcome when equivalent readback is unavailable;
10. ambiguity-safe recovery, bounded polling or explicit refresh, provider and
    operation kill switches, tenant-fair backpressure, support diagnostics,
    certification expiry, and artifact-always continuity.

“Fully built” does not mean a disabled unsupported action, a generic CSV behind
a provider logo, a time-entry substitute for fixed compensation, a standing
template substituted for a one-period decision, or an accounting object
substituted for a payroll/AP draft.

### Artifact-always package and exactly one executable lane

- The D4 **Compensation Handoff Package** always exists before delivery as an
  immutable, content-addressed, schema-versioned, PII-minimized artifact.
- One immutable route chooses exactly one executable outbound lane for the
  covered work:
  - staff artifact fulfillment;
  - one certified provider-draft operation; or
  - one separately certified Phase 20 source handoff.
- Artifact existence, preview, download for audit, or later evidence access is
  not a second execution. Staff cannot execute an artifact fulfillment after a
  provider operation has an unknown outcome.
- A route may change only through append-only recovery that proves the
  previously selected lane did not and cannot execute for the exact residual
  coverage. There is no dual write, “send both,” or fallback that can create
  two payroll inputs or accounting projections.

### Prospective delivery authority

One immutable **Compensation Draft Delivery Profile Version** binds:

- Tenant and Legal Entity;
- provider grant and exact provider organization/company/realm;
- provider product, country/region, and environment;
- exact external provider participant/payee reference;
- Field Account funding currency and provider compensation currency;
- exact pay cycle/pay-run selection rule;
- typed Compensation Funding component role to exact provider-native item,
  code, or supported field;
- supported operation and adapter/certification version; and
- half-open prospective effective interval.

A setup wizard may provide capability-based guidance, but it never infers a
provider organization, regional product, external provider participant/payee
reference, pay cycle, or semantic
role from names. Activation requires a production-shaped dry run against the
exact provider identity and proves authorization, supported roles, current
metadata, readback capability, limits, and expected state. A destination,
mapping, grant, scope, or provider-product change creates a successor profile
and cannot retarget an existing package or Provider Draft Operation.

### Immutable provider operations and recovery

- Every explicit provider-draft release creates one immutable **Provider Draft
  Operation** for one package, exact destination, certified operation, and
  bounded set of provider-participant/payee/component units. Artifact fulfillment preserves
  its own fulfillment/download evidence, and readback-only observations never
  masquerade as provider mutation.
- Provider calls are serialized at the smallest provider-safe destination and
  pay-cycle scope. Expected versions, current provider hashes, or exact
  provider-native concurrency tokens are frozen where available.
- Provider-specific child calls remain independently evidenced when provider
  limits require chunks. A parent summary cannot hide a partial provider
  outcome.
- Exact request identity, minimized response evidence, provider correlation
  identifiers, attempt time, destination identity, exact readback where
  exposed or exact permitted provider/staff confirmation otherwise, and later
  drift are append-only.
- Every covered unit resolves to exactly one recovery disposition:
  - `confirmed_updated`;
  - `proven_not_updated`; or
  - `outcome_unknown`.
- Only `proven_not_updated` units may enter one immutable residual successor.
  `confirmed_updated` units are never resent. `outcome_unknown` units remain
  quarantined until provider inspection or explicit exact staff evidence
  resolves them.
- A timeout, lost connection, provider 5xx, or missing public lookup endpoint
  never becomes “failed, safe to retry.” Safe same-key retry is allowed only
  when the provider documents the behavior and the exact immutable request
  remains valid.
- Provider changes discovered after readback/confirmation append drift evidence
  and return the affected work to review. Asym never silently restores its
  prior value over a provider-owned edit.

### Exact provider constraints

**Gusto**

- Target one staff-selected exact unprocessed payroll and exact employee
  compensation/reimbursement records.
- Pin and certify an explicit Gusto API version.
- Disclose that provider preparation mutates the payroll and may reset an
  earlier calculation; preparation is never a harmless settings preview.
- Use provider object versions as compare-and-swap, preserve current values,
  obey provider chunk limits, and require a fresh review after `409` or drift.
- Never calculate, submit, reverse, cancel, process, or pay payroll and never
  call contractor-payment endpoints.

**ADP Workforce Now**

- Use the exact Pay Data Input `modify` operation, practitioner scope, company,
  file, external provider participant/payee reference, current input/correction-cycle state, and fresh provider
  metadata.
- Treat provider-native earnings, deduction, reimbursement, allocation, cost,
  and department metadata as required validation, not free text.
- Because the same Batch ID can create another provider batch and public exact
  lookup may be limited, uncertain submission remains `outcome_unknown`; no
  blind retry or Batch-ID-as-idempotency assumption is allowed.
- Preflight the entire intended batch so one invalid associate does not
  surprise staff with a provider-wide rejection.

**Xero Payroll Australia and New Zealand**

- Treat AU and NZ as distinct adapters with separately proved OAuth scopes,
  roles, calendars, pay items, draft statuses, payloads, limits, and
  certification.
- Target only an exact `DRAFT` pay run/payslip. Read the complete provider
  object, merge only intended changes, show replacement semantics, and read
  back the full object after the write.
- Omitted lines that the provider interprets as deletion are a destructive
  overwrite risk. Any current-object mismatch requires re-review; Asym never
  writes posted/authorized/paid states or initiates payment.

**QuickBooks Workforce and Xero Payroll UK**

- Connect only when current provider access and product identity are proved.
- Provide complete external provider participant/payee mapping, exact provider-context links where
  permitted, artifact fulfillment, later result readback where accessible,
  drift/status evidence, disconnect, diagnostics, and support.
- Do not substitute QuickBooks TimeActivity, a QuickBooks Accounting Bill,
  Xero timesheets, Xero standing pay templates, or Xero Accounting invoices for
  a per-run payroll write.
- A future write capability requires new evidence, prospective certification,
  and a new delivery profile version; it does not silently upgrade existing
  profiles.

### Accounting, payroll, AP, and payment authority remain separate

- External payroll/AP systems own worker/payee classification, gross-to-net and
  tax calculation, deductions, approval, submission, posting, final payroll or
  AP result, and payment.
- A provider draft acceptance proves only the accepted input it names. It
  cannot create an External Compensation Result, External Payment Occurrence,
  Compensation Field Account Effect, Accounting Release, payroll-complete
  state, or paid state.
- Phase 21 owns the package, delivery profile, adapter contract, and operation
  evidence. Phase 20 remains the sole accounting doorway.
- A QuickBooks Workforce connection is not a QuickBooks Online Accounting
  connection. A regional Xero Payroll connection is not a Xero Accounting
  connection. Grants, destinations, scopes, operations, and staff permissions
  remain separate.
- QBO Bills, Xero Accounting invoices/bills, journals, and any other object
  that changes the books belong only to a separately certified Phase 20
  Accounting Release path. Phase 21 cannot reach them through an adjacent
  provider adapter.

### Staff and missionary experience

The ordinary staff path is setup once, review exceptions, choose an exact
package, inspect one concise provider-native preview, and use one literal
action:

- **Update Gusto payroll draft**
- **Create ADP pay-data batch**
- **Update Xero AU draft payslips**
- **Update Xero NZ draft payslips**
- **Prepare package for QuickBooks Payroll**
- **Prepare package for Xero Payroll UK**

The confirmation explains the exact boundary, for example:
“This changes a draft in Gusto. It does not run payroll or send money. Review
and finish payroll in Gusto.” Destructive replacement, preparation side
effects, partial progress, unavailable readback, or provider ambiguity appear
only when relevant. A vague green `Connected` badge is replaced by exact
capabilities and last-certified dates. Routine health stays quiet; one
exception card shows cause, affected people/components, safe completed work,
owner, evidence, and next action.

Missionaries do not see provider configuration, technical attempts, payroll
PII, batch identifiers, or retry controls. Their existing quiet compensation
projection remains provider-neutral:

- **Planned**
- **With payroll**
- **Processing**
- **Payment confirmed**
- **Needs attention**

These labels are projections from separately authoritative evidence. **With
payroll** does not mean approved, processed, or paid, and **Payment confirmed**
requires exact external payment evidence under D1/D4.

### D7 adversarial review

Every requested category has a concern:

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                           | Severity | Likelihood  | Permanent prevention                                                                                                                                     |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | A generic adapter assumes identical payroll states, fields, regions, or idempotency and breaks when a provider or tenant differs.                                                | Critical | High        | Exact provider/product/country/operation adapters, pinned contracts, capability discovery, and expiring certification.                                   |
| Technical debt                    | Yes      | One universal payload accumulates provider conditionals, copied mapping logic, and impossible parity promises.                                                                   | High     | High        | Stable package core, typed semantic roles, small provider modules, contract fixtures, and explicit unsupported capabilities.                             |
| Edge cases                        | Yes      | Off-cycle payrolls, duplicate names, recalculated drafts, partial chunks, terminated provider participant/payee records, unsupported pay items, or revoked scopes misroute work. | Critical | High        | Stable IDs, exact pay-cycle targeting, fresh preflight, per-unit coverage, state guards, and exception-first review.                                     |
| Footguns                          | Yes      | A staff click resets a Gusto calculation, deletes omitted Xero lines, duplicates an ADP batch, or sends both artifact and API input.                                             | Critical | Medium-high | Literal action copy, replacement previews, one-lane invariant, serialization, confirmation, inspect-before-retry, and forbidden endpoint absence.        |
| Tenant safety                     | Yes      | Provider grants, companies, workers, pay cycles, packages, operations, or readback leak or cross tenants/Legal Entities.                                                         | Critical | Medium      | Structurally complete scope, composite references, RLS, server-side authorization recheck, scoped secrets/queues/caches, and negative tests.             |
| Over-engineering                  | Yes      | A universal payroll abstraction, custom workflow language, or forced parity overwhelms a bounded handoff.                                                                        | High     | High        | One package contract, finite semantic roles, exact adapters, one executable lane, and no payroll engine.                                                 |
| UX/UI and user friction           | Yes      | Vague connection states and technical provider jargon make staff unsure what changes or whether money moved.                                                                     | High     | High        | Guided setup, capability cards, provider-native diff, literal actions, quiet exceptions, accessible review, and provider-neutral missionary stages.      |
| Hidden coupling                   | Yes      | Payroll grants become accounting grants, provider acceptance advances Field Account/payment truth, or Phase 20 depends on adapter internals.                                     | Critical | High        | Separate authorities, grants, destination registries, events, evidence contracts, and Phase-20-only accounting delivery.                                 |
| Failure modes                     | Yes      | Timeout, partial provider mutation, lost response, drift, revocation, or vendor outage causes duplicates or silent loss.                                                         | Critical | High        | Immutable operations, per-unit dispositions, exact readback, quarantine, residual successors, kill switches, and artifact continuity.                    |
| Data integrity risks              | Yes      | Replacement writes omit existing lines, stale values overwrite staff edits, or coverage is delivered twice.                                                                      | Critical | High        | Full current-object merge where required, concurrency proof, immutable coverage uniqueness, conservation, and post-write readback.                       |
| Security and privacy risks        | Yes      | Broad payroll scopes, refresh-token races, diagnostic leakage, or stale access exposes highly sensitive payroll data.                                                            | Critical | Medium-high | Least scopes, encrypted/rotated grants, serialized refresh, prompt revocation quarantine, minimized evidence, redacted diagnostics, and access audit.    |
| Scalability and performance risks | Yes      | Large payrolls exceed provider limits or one tenant monopolizes queues and rate budgets.                                                                                         | High     | Medium-high | Certified workload shapes, bounded chunks, per-destination serialization, tenant-fair queues, adaptive backpressure, and progress coverage.              |
| Operational burden                | Yes      | Six provider products create manual certification, vendor-change, support, and incident work.                                                                                    | High     | High        | Shared lifecycle contract, per-adapter runbooks, automated conformance suites, certification expiry, diagnostics, and clear ownership.                   |
| Observability gaps                | Yes      | A package appears sent while some provider participant/payee records were rejected, unknown, or later changed.                                                                   | Critical | Medium-high | Per-operation/unit state, freshness, provider correlation, readback/drift evidence, unknown-age alerts, and audit timelines.                             |
| Dependency and integration risks  | Yes      | Vendor approval, plan entitlements, API versions, scopes, rate limits, and regional products change independently.                                                               | Critical | High        | Production authorization gate, capability registry, version pinning, contract monitoring, recertification, and artifact-only continuity.                 |
| Migration and upgrade risks       | Yes      | Provider schema or version changes reinterpret stored payloads or mutate in-flight work.                                                                                         | High     | Medium-high | Immutable schema/adapter/profile versions, golden fixtures, prospective upgrade, replay-free evidence, and parallel certification before cutover.        |
| Other development hazards         | Yes      | Races, webhook reordering, refresh-token collision, cancellation, stale permissions, or a bad deploy create financial duplicate inputs.                                          | Critical | Medium-high | Deterministic locks, idempotent local commands, dedupe, out-of-order handling, feature/operation kill switches, canaries, rollback, and fault injection. |

### Required production proof

1. Contract tests and recorded fixtures for every exact provider product,
   country, supported operation, status, error class, destructive behavior,
   concurrency token, limit, and readback capability.
2. Provider-grant isolation, OAuth state/PKCE where applicable, refresh
   serialization, revocation, least-scope, tenant/Legal-Entity authorization,
   secret handling, PII minimization, audit, and redacted diagnostic tests.
3. Delivery-profile activation and prospective successor tests across provider
   organization, product, country, environment, external provider participant/payee reference, currency, pay
   cycle, component, operation, and certification change.
4. One-lane, coverage uniqueness, explicit release, duplicate command,
   concurrent release, timeout, lost response, partial chunk, 409/stale write,
   revocation, rate limit, outage, and kill-switch fault-injection tests.
5. Exact readback, readback-unavailable, later provider drift, webhook
   duplication/reordering, bounded polling, and the three recovery-disposition
   invariants.
6. Proof that a residual successor contains only `proven_not_updated` units and
   that `confirmed_updated` or `outcome_unknown` work cannot be resent or
   switched to artifact/another adapter.
7. Proof that no production adapter can call calculate, submit, authorize,
   post, pay, contractor-payment, or accounting-write endpoints outside its
   exact certification.
8. Provider workload certification at expected and seasonal volumes with
   bounded chunks, tenant fairness, backpressure, resumable progress, and no
   unbounded provider-per-row fan-out.
9. Keyboard, screen-reader, zoom, 320 CSS-pixel reflow, localization, long
   provider labels, non-color status, focus, error recovery, and destructive
   change comprehension tests for setup, preview, release, and exception flows.
10. At least two distinct direct-write adapters complete provider production
    authorization and an exact production-shaped canary with readback or exact
    permitted confirmation evidence, monitoring, kill switch,
    rollback/containment, and support runbook. Until both pass,
    artifact/readback continuity may remain usable but the ratified D7
    multi-provider launch is incomplete.

### Evidence

- [Phase 21 D7 primary-source provider research, capability matrix, UX contract, adversarial review, and proof gates](./phase-21-mission-dashboard-product-research-evidence.md#d7-ratified-direction-capability-honest-multi-provider-compensation-handoffs)
- [Gusto payroll update workflow](https://docs.gusto.com/app-integrations/docs/updating-payrolls)
- [Gusto idempotency and object versions](https://docs.gusto.com/app-integrations/docs/idempotency)
- [Gusto production approval](https://docs.gusto.com/app-integrations/docs/introduction)
- [ADP Workforce Now Pay Data Input guide](https://developers.adp.com/articles/preview/guide-payroll-data-input-api--guide-for-adp-workforce-now-0?chapter=2)
- [Intuit Workforce Payroll API overview](https://developer.intuit.com/app/developer/workforce-payroll/docs/get-started)
- [Xero Payroll AU overview](https://developer.xero.com/documentation/api/payrollau/overview)
- [Xero Payroll NZ overview](https://developer.xero.com/documentation/api/payrollnz/overview)
- [Xero Payroll UK overview](https://developer.xero.com/documentation/api/payrolluk/overview)
- [ADR-0068 — Capability-honest multi-provider compensation handoffs](../../adr/0068-capability-honest-multi-provider-compensation-handoffs.md)

## D8 — Source-authoritative Missionary Support Feed Projection

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one disposable, rebuildable,
> versioned, recipient-, purpose-, Tenant-, Legal-Entity-, destination-, and
> Missionary-Support-Feed-Subject-scoped Missionary Support Feed Projection composed exactly once
> from Phase 21’s existing finance-safe Missionary Support Activity Projection
> and separately through-dated per-currency Support Balances Projection, with
> only separately ratified Phase 28 relationship/contactability resource
> families added later; Phase 31 alone owns prospective feed subscriptions,
> provider authorization, capability-certified mappings, and a no-gap delivery
> contract consisting of a snapshot complete only within one immutable
> Coverage Manifest and atomic snapshot-through cut, distinct resumable page
> cursors, and an opaque authorization-bound, monotonic-server-checkpoint,
> at-least-once change cursor with finite retention and explicit reset, plus
> only PII-free signed reconciliation hints where supported; source domains
> remain authoritative and the projection remains disposable, while
> subscription versions, coverage and delivery evidence, change-envelope
> identities, and source-version references are immutable; visible durable
> records use destination-recipient-scoped unlinkable references, anonymous or
> private gifts retain only occurrence identities required for correction and
> deduplication and never a stable hidden Party identity, and authorization and
> privacy filtering occur before enumeration, counts, arithmetic, pagination,
> caching, hints, or diagnostics; restricted and high-risk workers are excluded
> from ordinary activation; tenant-off-by-default guided setup proves the exact
> external organization/profile and previews bounded history, permitted
> semantic bundles, omissions, lossiness, currencies, coverage, and
> residual-copy risk; health truth distinguishes Asym preparation, destination
> fetch, and destination application only when proved; Stop sharing atomically
> denies future egress and reports downstream removal as confirmed,
> unsupported, or unknown without claiming deletion; and TntConnect is
> supported only through a vendor-authorized, production-certified DonorHub
> pathway while MPDX is supported only for explicitly authorized installed-base
> organizations—without raw-table or arbitrary-field access, duplicate source
> reads, all-history defaults, cursor-as-authorization, stable anonymous Party
> identifiers, privacy-floor overrides, bidirectional writes, duplicate ledgers
> or CRMs, date-only recovery, destructive merge, uncontrolled exports,
> fictional provider parity, false synchronization or deletion claims,
> authoritative converted totals, or any claim that support is available,
> withdrawable, payroll-ready, payable, or paid.**

### Authority and projection boundary

- Phase 21 owns the Missionary Support Activity Projection, the separately
  through-dated per-currency Support Balances Projection, and their closed
  external field floor.
- Phase 31 owns the disposable composite Missionary Support Feed Projection
  and consumes the two named Phase 21 projections exactly once. It does
  not independently join Phase 14 and Phase 16 into a second version of
  supporter, contribution, or commitment truth.
- Phase 14 remains authoritative for supporter identity, recognition,
  anonymity, and `getSupporterRoster`. Phase 16 remains authoritative for
  commitment and current-support summaries. Their source versions and
  coverage may be carried through Phase 21 provenance without becoming
  additional Phase 31 read paths.
- Phase 28 may later add only a separately ratified and independently
  versioned relationship/contactability resource family. It does not own
  supporter identity, contribution, commitment, or Field Account truth.
- Phase 31 owns the Subscription Version, Coverage Manifest, provider grant,
  transport, API and schema negotiation, cursor lifecycle, signed hints,
  provider serialization, backpressure, connection health, and delivery
  evidence.
- Phase 30 owns inbound migration and historic-system adoption. A D8 feed is
  continuing read-only projection, not an import or universal-history lane.
- Phase 20 alone owns accounting authorization and delivery. D8 is
  accounting-dark: no feed row, cursor, hint, fetch, acknowledgment, or
  provider application may create an Accounting Posting Intent, Accounting
  Release, Bank Match, QBO/Xero operation, payroll result, or payment fact.
- The Phase 31 composite feed is disposable and rebuildable. Source domains
  own history. Only prospective subscription versions, immutable coverage and
  delivery evidence, change-envelope identities, and pinned source-version
  references are durable integration evidence.

D1-D7 remain binding projection constraints:

- only D1 Finance-confirmed balances through exact closed Support Cycles may
  appear as confirmed balances; open-cycle or provisional activity remains
  separately labelled and cannot become payment or availability truth;
- D2 Support Close Readiness, source settlement, provider, payout, deposit,
  Bank Match, and accounting evidence remain internal even when a plain
  source-owned activity status is projected;
- D3 assessment presentation is copied from the exact source-owned result and
  is never re-resolved or recalculated by Phase 31 or a provider mapping;
- D4 compensation funding, Expense Claim/Reimbursement Obligation, Handoff
  Package, external result, payment, and payroll/AP meanings are not D8
  resource families;
- D5 corrections, reversals, and reallocations remain append-only occurrences,
  and every required pair or balanced effect remains one complete atomic
  change group;
- D6 amounts remain exact, ISO-labelled, independently through-dated currency
  lanes with no authoritative converted total; and
- D7 payroll grants, connections, adapters, operations, and evidence are
  structurally distinct from Phase 31 feed grants and cannot be reused or
  inferred from one another.

Each data Subscription Version and its feed, cursor, and pseudonym namespace
bind exactly one recipient principal/Party and one Missionary Support Feed
Subject, which D19 defines as an exact Support Assignment. The guided bulk flow
may create several independently authorized versions, but it never creates one
multi-recipient or multi-subject cursor or globally linkable identity namespace.

### Bounded no-gap snapshot and cursor contract

One immutable **Missionary Support Feed Coverage Manifest** binds:

- Tenant and Legal Entity;
- exact integration installation, provider organization, product, country or
  region, and environment;
- recipient, Missionary Support Feed Subject, purpose, Designation and Field
  Account scope;
- authorized resource families and closed field-set version;
- explicit bounded history lower limit;
- exact currency scopes;
- projection schema, provider-mapping certification, and authorization epoch;
- source-policy and source-family coverage watermarks;
- inclusions, exclusions, and known semantic loss; and
- one atomic `snapshot_through` projection sequence.

“Complete” means complete only within that manifest. Every page reads the same
immutable generation. Changes after its cut begin strictly after
`snapshot_through`, so an occurrence is in either the snapshot or the first
change round and never neither.

Completeness is structural completeness at that manifest cut. Freshness is a
separate state derived from every required source watermark and lag;
`generated_at` never proves either.

Resumable page cursors and the terminal change cursor are distinct. The client
persists an applied page and its page checkpoint atomically and advances its
durable change checkpoint only after applying the complete round. The server
checkpoint is monotonic; cursor strings remain opaque, integrity-protected,
non-sortable, query-, schema-, authorization-epoch-, and scope-bound,
replayable, and finite-lived. They never grant access. Cursor and projection
sequence are transport order, never source-effective or financial chronology.
Expired, incompatible, or scope-obsolete cursors return `410 Gone` with an RFC
9457 `cursor_reset_required` problem and build a newly cut bounded snapshot;
they never silently resume from a guessed date.

Delivery is at-least-once. Every change carries an immutable event identity,
recipient/installation-scoped entity reference, per-entity version, typed
operation, full current authorized representation, exact ISO currency and
minor-unit money where relevant, safe source authority/version, and an atomic
change-group identity, member count, and membership digest where related
entries must be observed together. Full representation describes the current
projection entity; it never mutates source financial history. A financial
correction or reversal is a new immutable projected occurrence linked to the
original. A complete change group is delivered wholly in one page and applied
atomically; a group that cannot be delivered completely blocks checkpoint
advancement rather than exposing half a D5 pair or balanced effect. Consumers
deduplicate by event identity and compare entity versions rather than
timestamps, page order, or notification order.

Signed provider notifications, when supported, carry no supporter PII or
amounts. They are replay-bounded wake-up hints only. Cursor pull and scheduled
reconciliation remain authoritative even when a hint was delivered.

### Privacy, identity, and revocation

- The current Subscription Version is reauthorized on every request and before
  every queued egress. Scope contraction increments the authorization epoch,
  immediately blocks future positive disclosure, and invalidates prior
  cursors; a still-valid provider token cannot bypass the local deny-first
  fence.
- Authorization, anonymity, restricted-worker protection, and purpose policy
  apply before query enumeration, search, counts, arithmetic, pagination,
  cursor sequencing, caching, hints, logs, or support diagnostics.
- Internal Party, contribution, Designation, worker, Field Account, and
  provider IDs never leave Asym. Visible durable records use pseudonymous IDs
  unlinkable outside the exact destination-recipient namespace.
- A private or anonymous support occurrence may retain a scoped activity ID
  needed for correction and deduplication, but receives no persistent hidden
  Party identity linking separate gifts. Its safe presentation omits contact
  channels, location, household links, notes, agreement metadata, exact
  timestamps, and cross-view correlation keys.
- Phase 14's missionary field floor and all seven never-leak fixtures remain
  binding across the complete sequence of snapshots, changes, revocations,
  resets, and retained provider views, not only on one response. Anonymous
  crowd-blending and post-filter arithmetic must resist two-period and
  cross-view differencing.
- Restricted and high-risk workers are ineligible for ordinary D8 activation.
  A tenant role, integration switch, named grant, field mapper, or
  acknowledgment cannot override the Phase 10 publication firewall. Any future
  alias-only external pathway requires a separately ratified and certified
  safety contract.
- Recognition and contactability remain different permissions. Phase 14 may
  authorize safe recognition while Phase 28 still withholds solicitation,
  email, phone, mail, export, or another external-CRM use.
- A recipient-only revocation envelope may name only a pseudonymous object
  that the same recipient previously received. It reveals no current identity
  or restriction reason and means only that the recipient can no longer
  receive or access that projection object through the Subscription Version.
  It does not decide or represent whether a recipient or provider may retain a
  local, exported, or backed-up copy.
- Product truth distinguishes `future_access_revoked`,
  `revocation_delivered`, `provider_confirmed_removed`,
  `removal_unsupported`, and `downstream_outcome_unknown`. A disconnect,
  tombstone, or provider request never becomes “deleted everywhere” without
  exact provider evidence.

### Capability-honest provider contract

- D8 creates the provider-neutral projection contract, not an entitlement to
  any provider.
- TntConnect is labelled and supported only as **TntConnect via DonorHub** and
  only after the exact inbound direction, provider organization identity,
  authorization, resource/field semantics, correction/deletion behavior,
  currencies, limits, and production onboarding are authorized by TntWare and
  pass conformance certification.
- Public DonorHub query documentation does not prove an Asym-to-DonorHub
  ingestion contract. A local adapter, sandbox, logo, inferred payload, or
  pending vendor conversation cannot be advertised as supported.
- MPDX is available only to a tenant whose existing organization installation
  and MPDX authorization explicitly permit the mapping. D8 creates no new-org
  onboarding claim.
- Certification is exact to schema/capability version, provider and product,
  direction, region, environment, resource and field families, identity,
  correction, merge, revocation, anonymity, currency, history, authorization,
  rate/volume behavior, production organization, proof date, owner, expiry,
  and suspension trigger. No adapter, provider label, or Subscription Version
  is production-authorized until both the provider-neutral conformance suite
  and that exact provider certification suite pass.
- Unsupported meaning is omitted with exact disclosure or blocks activation.
  A provider limitation never silently combines commitments, legal and
  recognition identities, currencies, balances, or restricted facts.
- Source provenance exposed externally is limited to a safe owner-domain kind,
  scoped opaque reference, source version, and correction relation. Stripe,
  bank, payout, QBO/Xero, payroll, deposit, and raw decline identifiers remain
  internal.
- Provider fetch, acknowledgment, revocation delivery, disconnect, and cursor
  advancement never prove provider application or erasure. Product status may
  claim those outcomes only from the exact evidence certified for that
  destination capability.

### Quiet staff and missionary experience

The optional surface lives under **Settings → Integrations → Missionary
tools** and is off by default. Ordinary finance and missionary work is
unchanged.

Staff use one short guided flow:

1. choose an available production-certified tool;
2. choose eligible Support Assignments and separately authorized recipients,
   purpose, and bounded history;
3. accept recommended semantic bundles or narrow them without weakening the
   privacy floor;
4. review the exact destination organization/profile, masked representative
   rows, post-filter counts, per-currency through-dates, unsupported or lossy
   fields, and residual-copy warning; and
5. turn on the prospective Subscription Version.

Activation remains **Preparing initial snapshot** until the atomic cut is
ready. Routine status uses **On — current through {time}**, **Delayed**,
**Needs attention**, or **Off**. Details separately show Asym prepared through,
provider last requested through, provider-confirmed application through only
when proved, or confirmation unavailable. A green “Synced” badge cannot
collapse those facts.

The missionary home dashboard has no connector setup, cursor, provider error,
or duplicate balance. An optional **Connected tools** setting shows the tool,
categories shared, exact through time, and support owner. Only material delay
appears quietly beside affected information.

**Stop sharing** atomically denies new reads and queued egress first, then
revokes credentials and hint secrets where supported, records authorized
removal requests and outcomes, and explains that provider databases, local
files, exports, or backups may remain. Reconnection requires a new reviewed
grant, external identity binding, snapshot cut, cursor namespace, and
Subscription Version; it never revives the prior grant.

### D8 adversarial review

Every requested category has a concern:

| Category                          | Concern? | What could go wrong and why it matters                                                                                                   | Severity | Likelihood  | Permanent prevention                                                                                                        |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | A live snapshot races changes; date windows miss old corrections; provider contracts vary.                                               | Critical | High        | Immutable snapshot cut, no-gap change barrier, resettable cursors, exact provider certification.                            |
| Technical debt                    | Yes      | Duplicate source reads or adapter-owned policy create divergent CRM and privacy logic.                                                   | High     | High        | Consume Phase 21 once, one closed projection schema, one privacy floor, Phase 31 serializers only.                          |
| Edge cases                        | Yes      | Late corrections, merges, privacy changes, exits, spouse access, multiple entities/currencies, and expired cursors leave stale data.     | Critical | High        | Typed successors/revocations, exact recipients, authorization epochs, atomic groups, reset workflow.                        |
| Footguns                          | Yes      | All-history, broad contact sharing, global IDs, arbitrary fields, or “delete” overclaims expose data.                                    | Critical | Medium-high | Bounded semantic bundles, scoped pseudonyms, preview, no arbitrary mapper, honest Stop sharing.                             |
| Tenant safety                     | Yes      | Tokens, cursors, caches, jobs, or profile mappings cross Tenant, Legal Entity, recipient, or Missionary Support Feed Subject boundaries. | Critical | Medium      | Structurally complete scope, current authorization on every read/egress, isolation constraints and negative tests.          |
| Over-engineering                  | Yes      | D8 grows into CDC infrastructure, a mapping language, second CRM, or bidirectional sync.                                                 | High     | Medium-high | Finite read projection, certified presets, no scripts/formulas/raw fields, Phase 31 transport only.                         |
| UX/UI and user friction           | Yes      | Jargon, switches, false green status, and noisy alerts obscure what was shared.                                                          | High     | High        | Guided setup, safe defaults, plain states, progressive detail, exception-only notifications.                                |
| Hidden coupling                   | Yes      | Provider state becomes domain truth or provider failure blocks Field Account work.                                                       | Critical | Medium      | Source authority and Phase 21 operations remain independent; adapter health never gates closes.                             |
| Failure modes                     | Yes      | Partial snapshot, lost hint, token revocation, poison row, outage, or reset creates silent staleness.                                    | Critical | High        | Pull as truth, exact states, gap detection, bounded quarantine, reset, kill switches.                                       |
| Data integrity risks              | Yes      | Replay, reordering, duplicate IDs, missing revocation, or half a balanced change creates false history.                                  | Critical | High        | Event IDs, entity versions, full representations, atomic change groups, idempotent conformance tests.                       |
| Security and privacy risks        | Yes      | PII, restricted-worker existence, credentials, or correlation handles leak through payloads or metadata.                                 | Critical | High        | Pre-enumeration authorization, minimal fields, scoped pseudonyms, encryption, redaction, publication firewall.              |
| Scalability and performance risks | Yes      | Long snapshots and retry storms exhaust compute or let one tenant starve others.                                                         | High     | Medium-high | Async bounded snapshots, pagination/byte limits, fair scheduling, backpressure, reserved revocation capacity.               |
| Operational burden                | Yes      | Staff manually map, reconnect, and diagnose provider-specific behavior.                                                                  | High     | High        | Organization setup, bulk recipient/subject mapping, deterministic suggestions, one owner, automated certification/runbooks. |
| Observability gaps                | Yes      | “Synced” cannot distinguish prepared, fetched, applied, stale source, or failed removal.                                                 | High     | High        | Independent source, projection, fetch, application, cursor, authorization, and removal evidence.                            |
| Dependency and integration risks  | Yes      | Provider authorization is absent or IDs, fields, currencies, terms, or limits drift.                                                     | Critical | High        | Written authorization, expiring certification, fixtures, drift monitoring, flags and kill switches.                         |
| Migration and upgrade risks       | Yes      | Schema changes invalidate cursors or resync erases provider-owned work.                                                                  | High     | Medium      | Prospective schema versions, deprecation/reset, new reconnect namespace, replace only Asym projection data.                 |
| Other development hazards         | Yes      | Revocation races queued work; duplicate workers, replay floods, clock skew, or payload logs cause harm.                                  | Critical | Medium      | Atomic fence, pre-egress recheck, uniqueness/CAS, server sequences, replay protection, fault injection.                     |

### Required production proof

1. Authority tests prove D1-D7 darkness: only exact source-projected activity
   and D1 Finance-confirmed balances egress; D2 readiness/provider/bank facts,
   D3 re-resolution, D4 compensation/reimbursement/payment truth, Phase 20
   accounting, and D7 payroll grants/operations remain inaccessible.
2. Isolation tests cover Tenant, Legal Entity, destination organization and
   environment, the exactly one recipient/Support-Feed-Subject namespace, purpose,
   Designation/Field Account, currency, resource and field families, history,
   schema, and authorization epoch. Bulk activation proves that every exact
   recipient/Missionary-Support-Feed-Subject pair receives an independent
   subscription, cursor, and pseudonym namespace.
3. Snapshot/change race tests prove every occurrence appears in the snapshot or
   first change round; page resume covers zero, one, exact-boundary, empty
   intermediate, and many-page cases; only the terminal snapshot page yields
   the change cursor.
4. Completeness tests prove that the manifest cut is structurally complete
   while source freshness remains a separate per-source-watermark state and
   cannot be inferred from `generated_at`.
5. Duplicate, reordered, replayed, missing-page, crash-before/after-commit,
   cursor-expiry, and non-destructive resnapshot tests pass. An expired,
   incompatible, or scope-obsolete cursor returns `410 Gone` with RFC 9457
   `cursor_reset_required`; no date-based fallback is accepted.
6. Retroactive correction, refund, reversal, redesignation, merge,
   supersession, anonymity/privacy change, worker exit, and scope-contraction
   tests preserve source truth. Financial corrections append new linked
   occurrences, and cursor/page order is never interpreted as financial
   chronology.
7. Every D5 pair or balanced effect proves complete change-group member count
   and digest, never splits ambiguously across pages, applies atomically, and
   cannot advance the checkpoint when incomplete.
8. Cross-recipient/provider correlation, Phase 14 field-floor, all seven
   never-leak fixtures, anonymous crowd-blending, two-period/cross-view
   differencing, and restricted-worker existence-oracle tests prove no hidden
   Party identity, pre-filter count, cursor gap, hint, or diagnostic leak.
9. OAuth authorization code with PKCE where supported, exact redirect, least
   scope/audience, encrypted and serialized refresh, rotation, revocation,
   reconnect, current-grant recheck, and queued-egress race tests pass.
10. Provider outage, throttling, retry, cursor-reset storm, tenant fairness,
    privacy-removal priority, certification expiry, suspension, and truthful
    health tests pass at certified volume.
11. Provider fixtures prove exact product/version/direction authorization,
    production organization, identity, correction, merge, removal, anonymity,
    field, history, commitment, currency, rate, and volume semantics;
    omissions and lossiness appear before activation. Fetch, acknowledgment,
    revocation delivery, and disconnect never count as application or erasure.
12. Exact ISO and zero-decimal currencies remain separate, no floating-point
    money or authoritative converted total appears, and accounting/payroll
    boundaries remain dark.
13. Logs, traces, metrics, caches, errors, URLs, hints, and support bundles
    contain no prohibited PII, amount payload, provider credential, or raw
    cursor body.
14. **Stop sharing** proves immediate denial of future receiving and access
    through the Subscription Version and reports provider/local-copy removal
    only as confirmed, unsupported, or unknown.
15. WCAG 2.2 AA keyboard, screen-reader, focus-return, status announcement,
    error summary, zoom, 320 CSS-pixel reflow, touch-target, localization, and
    reduced-noise tests pass.

### Evidence

- [Phase 21 D8 primary-source protocol, provider, UX, and adversarial research](./phase-21-mission-dashboard-product-research-evidence.md#d8-ratified-direction-source-authoritative-missionary-support-feed-projection)
- [TntConnect gift download and correction behavior](https://www.tntware.com/tntconnect/help/en/pages/gifts-download.aspx)
- [TntConnect 3.4 DonorHub OAuth and old-date adjustments](https://www.tntware.com/tntconnect/help/en/pages/whatsnew_3_4.aspx)
- [TntConnect 4.0 DonorHub requirement](https://www.tntware.com/tntconnect/help/en/pages/whatsnew-4-0.aspx)
- [DonorHub managed-bridge description](https://www.tntware.com/donorhub/faqs/en/what-is-donorhub.aspx)
- [DonorHub public developer-API statement](https://www.tntware.com/donorhub/faqs/en/can-i-programmatically-query-the-the-donation-data-from-another-application-if-so-how.aspx)
- [MPDX FAQ and installed-base limitation](https://help.mpdx.org/article/202-mpdx-faqs)
- [MPDX source-field synchronization rules](https://help.mpdx.org/article/1021-mpdx-data-sync-rules-for-cru-staff)
- [MPDX duplicate risk for synchronized donations](https://help.mpdx.org/article/188-adding-donations-manually)
- [MPDX multiple-account balance warning](https://help.mpdx.org/article/1367-manage-multiple-accounts)
- [Microsoft Graph delta-query contract](https://learn.microsoft.com/en-us/graph/delta-query-overview)
- [Google Calendar incremental synchronization](https://developers.google.com/workspace/calendar/api/guides/sync)
- [Stripe webhook ordering and replay guidance](https://docs.stripe.com/webhooks)
- [OAuth 2.0 Security Best Current Practice — RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OAuth token revocation — RFC 7009](https://www.rfc-editor.org/rfc/rfc7009.html)
- [Problem Details for HTTP APIs — RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ADR-0069 — Source-authoritative missionary support feed](../../adr/0069-source-authoritative-missionary-support-feed.md)

## D9 — Optional Approved Support Plans and bounded workspace publication

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one optional,
> organization-approved, immutable prospective Approved Support Plan Version,
> defaulting to “Support planning not managed in Asym,” scoped to the exact
> Tenant, Legal Entity, Support Assignment, charitable purpose, ISO
> currency, and Field Account when applicable; owning bounded recurring and
> dated organization-approved needs plus one optional diagnostic reserve
> target, while Phase 13/21 received activity, Phase 16 commitments, Phase 21
> D1 Finance-confirmed Field Account Balances, D4 compensation funding, and
> Phase 28 Support-Raising Goals remain independently authoritative; with
> purpose-separated, source-versioned Balance Coverage, Reserve Position, and
> optional Commitment Forecast projections; one finite prospective
> tenant-owned Support Workspace Publication Profile with
> capability-controlled administration, production-shaped audience preview,
> absent-not-zero modules, harmless personal reorder/collapse, and a binding
> D1/D6 presentation-only rider permitting tenants to omit missionary balance
> publication without changing finance truth; exact per-currency calculation,
> compatible-close gating, append-only correction, and quiet exception-first
> operations—without arbitrary formulas or dashboard construction, mandatory
> commitments or balances, false zeroes, hidden-source leakage, automatic goal
> synchronization, cross-currency totals, retroactive mutation, or any gift,
> restriction, compensation, reimbursement, payroll, accounting, payment,
> public-fundraising, or D8/Phase31-feed authority.**

### Five independent authorities

| Concept                   | Source authority                          | D9 use                                                         | D9 must not claim                                                          |
| ------------------------- | ----------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Approved support need     | Phase 21 D9 Approved Support Plan Version | Organization-approved planning need                            | Gift goal, compensation entitlement, available cash, or GL budget          |
| Support-Raising Goal      | Phase 28                                  | Optional independently authorized fundraising/coaching context | Approved Support Plan, Field Account balance, or commitment truth          |
| Recorded support activity | Phase 13 and Phase 21                     | Actual source-qualified activity for the selected period       | Finance-confirmed balance, recurring promise, or spendable amount          |
| Commitments               | Phase 16                                  | Optional forecast context                                      | Received cash, settlement, Finance-confirmed balance, or guaranteed income |
| Finance-confirmed balance | Phase 21 D1 close                         | Optional dated balance and conservative planning coverage      | Worker-owned, withdrawable, payroll-ready, payable, or paid money          |

Two values may be numerically equal without becoming the same authority,
version, permission, evidence, or correction path.

### Optional adoption and exact absence semantics

The initial posture is **Support planning not managed in Asym**. It creates no
Support Plan record, setup exception, missionary planning card, missing-goal
warning, reserve card, coverage metric, or plan alert. Authorized staff see one
quiet setup affordance rather than recurring Mission Control noise.

Once a plan has existed, stopping Asym-managed planning creates an immutable
prospective posture successor. It never deletes prior plans, calculations,
statements, or audit evidence.

These axes remain independent:

| Axis                     | Values or meaning                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Adoption                 | `not_managed_in_asym` or `managed_in_asym`                                                  |
| Configuration resolution | `missing`, `active`, `future_only`, `expired`, or `ambiguous`                               |
| Authorization            | permitted or denied for the exact viewer, purpose, and surface                              |
| Projection health        | `current`, `delayed`, or `unavailable`                                                      |
| Presentation             | shown or intentionally hidden by the current Profile                                        |
| Source value             | no source data, an authoritative signed value including zero, or another exact source state |

`Not managed`, `not configured`, `not authorized`, `hidden`, `stale`,
`temporarily unavailable`, `no source data`, and an authoritative zero are
never synonyms. An unauthorized reader must not learn whether a hidden plan or
balance exists.

### Approved Support Plan Version

When Asym-managed planning is activated, at most one winning immutable Plan
Version exists for the exact Tenant, Legal Entity, Support Assignment,
charitable purpose, ISO currency, and applicable Field Account scope and
half-open effective interval.

The Plan owns:

- one positive approved recurring monthly support need;
- bounded dated or seasonal organization-approved needs that remain dated and
  are never silently averaged into the recurring amount;
- one optional same-currency diagnostic reserve target, expressed as either an
  exact fixed amount or a bounded months-of-plan basis compiled to an exact
  amount under a named rounding rule;
- approval source, actor, capability, timestamp, and bounded rationale;
- exact effective interval, source provenance, schema/evaluator version, and
  superseded-version reference.

The Plan may explain the bounded organization-approved need but does not
re-resolve or replace D3 assessment, D4 compensation, payroll, benefits, taxes,
reimbursement, contribution, commitment, bank, accounting, or payment truth.
A Support Plan is not a QBO/Xero budget.

Activation is prospective and defaults to the next complete Support Cycle
boundary. A different valid future boundary may be reviewed explicitly, but
Balance Coverage waits for a compatible D1 close. Backdating and overlapping
same-scope versions are rejected.

### Purpose-separated projections

The Finance-confirmed Planning Coverage Base is conservative:

```text
Finance-confirmed Field Account Balance
− qualified negative open-cycle Field Account effects not yet in that close
− active non-reusable Field Account Funding Coverage
− active Support Reallocation Coverage not yet replaced by its posted debit
= Finance-confirmed Planning Coverage Base
```

Every amount is subtracted exactly once. When covered work becomes a posted
debit, that debit replaces the corresponding active coverage for calculation
purposes. Positive provisional support never increases the Base.

```text
Finance-confirmed Planning Coverage Base
÷ positive approved recurring monthly support need
= Balance Coverage
```

Rules:

- use integer minor units and exact decimal or rational arithmetic, never
  binary floating point;
- compute independently per exact ISO currency;
- require a winning current Plan and a compatible D1 close at or after the
  Plan's effective boundary;
- a missing, zero, negative, stale, future, conflicting, unauthorized, or
  currency-incompatible denominator produces no result or **Not calculated**,
  never zero or infinity;
- a negative Base produces a separately labelled shortfall, never misleading
  negative months;
- dated needs remain a separate horizon view rather than changing the monthly
  denominator;
- every result pins the exact Plan, close, coverage versions, currency,
  evaluator version, source watermarks, effective and through dates, and
  computation time.

Reserve Position has one signed meaning:

```text
Finance-confirmed Planning Coverage Base
− reserve_target_minor_units
= Reserve Position
```

A positive result means above target; a negative result means shortfall. The
reserve is diagnostic only. It is not a donor restriction, accounting reserve,
spending authorization, reallocation trigger, D4/D5 retained-balance floor, or
payment promise.

Commitment Forecast consumes only current, authorized, scope- and
currency-compatible Phase 16 truth. It is separately labelled and never enters
the Finance-confirmed balance, Planning Coverage Base, Balance Coverage, or
Reserve Position. Missing, unused, stale, unauthorized, or cross-currency
commitments are absent—not inferred as zero.

### Support Workspace Publication Profile Version

One finite prospective tenant-owned Profile selects only independently
authorized, source-backed modules for each audience. The ordinary guided
starting profiles are:

1. **Activity only**
2. **Goal and activity**
3. **Balance and activity**
4. **Support planning**

Compatible modules are limited to recorded support, approved support plan,
Phase 28 goal, Phase 16 commitments, Finance-confirmed balance, Balance
Coverage, Reserve Position, and the D12 Field Account Support-statement history
derived from an authorized Finance-confirmed balance publication. The only
statement-specific convenience control is the optional ready notice; it
creates no new financial or document authority. The Profile has no arbitrary
card schema, query builder, expression language, custom financial formula, or
source join.

Phase 12 capabilities—not job titles—govern who may draft or approve a Plan,
manage the Profile, or view exact source finance detail. A tenant may authorize
finance, an administrator, missionary-care staff, a fundraising coach, or one
person wearing several roles. No mandatory second approver is introduced
because the Plan and Profile move no money. Activation remains explicit and
audited.

A missionary may reorder or collapse authorized cards and choose permitted
convenience-alert channels. Personal presentation cannot reveal a tenant-hidden
module, change an authority, formula, threshold, effective date, currency,
source, statement, or another user's view.

Authorization applies before query enumeration, arithmetic, caching, search,
counts, alert eligibility, export, announcement, or diagnostics. Client-side
visibility and CSS are never security controls.

### Binding D1/D6 presentation rider

D1 and D6 continue to own every Field Account, Support Cycle close, exact
per-currency Finance-confirmed balance, history, correction, and finance
surface whether or not a missionary sees a balance.

When the current Profile authorizes missionary balance publication:

- one active currency appears as one exact ISO-labelled balance with its
  through date and no multicurrency controls;
- if sibling currencies exist, every balance authorized as part of that
  publication family remains simultaneously discoverable, independently
  ISO-labelled, and independently through-dated; and
- no selector-only discovery or converted authoritative total is allowed.

When balance publication is off, no balance or balance-derived placeholder is
shown to that audience. Balance Coverage, Reserve Position, balance-based
alerts, statements, exports, and Phase 28 embedding are also off by default.
A tenant may separately authorize a bounded derivative only after a preview
explains the financial-inference risk. That derivative still cannot claim
availability.

This rider changes presentation only. It does not disable Field Account truth,
remove finance access, stop a close, alter history, or select which currency
finance maintains.

### Phase 28 goal bridge

Phase 28 retains exclusive Support-Raising Goal ownership.

1. An authorized user may choose **Create support-raising goal from approved
   plan**.
2. Phase 28 creates its own immutable Goal Version and records the exact source
   Plan identity and version as provenance.
3. Later Plan changes leave the Goal unchanged and produce only a
   compare/update suggestion.
4. A later Goal change never changes the Plan.
5. Neither action automatically changes public giving, commitments,
   compensation, reimbursements, reallocations, alerts, accounting, or
   payments.

No Plan or derived projection enters the D8/Phase 31 feed without a later
explicit provider-authorized and provider-certified resource-family decision.

### Quiet staff and missionary experience

Staff use one short setup:

1. choose what the organization uses;
2. assign exact stewardship and audience capabilities;
3. preview as Missionary, Coach, Finance, or Administrator with
   production-shaped data; and
4. review the effective boundary, affected scopes, enabled modules, hidden
   modules, calculations, and inference warnings before activation.

The editor disables or omits incompatible modules and explains prerequisites
in place. It shows the difference between current configuration and the
prospective version, supports a tenant default plus sparse reviewed Support-
Assignment cohort or recipient-audience overrides, and previews exceptions
before bulk activation.

Missionary copy uses **Approved monthly need**, **Recorded support**,
**Expected support**, **Finance-confirmed support balance**, **Balance
coverage**, and **Reserve position**. Amount, exact ISO currency, source or
through date, and plain status remain visible. **How this is calculated**
reveals optional provenance and formula detail without hiding essential truth.
The UI never uses `available support`, `your money`, `cash available`,
`withdrawable`, `payroll-ready`, `payable`, or `paid` without its separately
authoritative evidence.

Unused modules disappear. They do not create empty cards, zero metrics, setup
nags, or alert noise.

Plan-based convenience alerts are off by default. If activated, one winning
threshold basis uses current compatible Plan and close evidence, transition
deduplication, hysteresis, recovery outcomes, and a bounded reminder cadence.
Stale source coverage suppresses a new conclusion and creates one
staff-visible freshness exception. Phase 21 owns eligibility; Phase 17 owns
content; Phase 6 owns delivery and communication history.

### Required edge-case outcomes

- A tenant that never uses support planning has no Plan records, warnings, or
  missionary planning cards.
- A managed scope with no active Plan creates one staff setup exception and no
  missionary empty card.
- A future Plan is previewable, while overlapping winners block only affected
  derived projections.
- Before the first compatible close, the UI explains that coverage will appear
  after finance closes a compatible cycle.
- No commitments leaves Balance Coverage and activity independently usable.
- Stale commitments delay only Commitment Forecast.
- A hidden balance does not leak through coverage, reserve, alerts, statements,
  exports, counts, search, or another audience.
- Multiple currencies produce separate plans, reserve positions, coverage, and
  alerts without conversion or authoritative total.
- A negative Planning Coverage Base produces a shortfall, not negative runway.
- A late adverse correction recomputes the current disposable projection and
  appends evidence; archived snapshots remain immutable.
- Overfunding is informational only and does not stop giving, move support, or
  change donor communication automatically.
- Exit and reallocation remain controlled by D5; a Plan creates no transferable
  capacity.
- Restricted-worker and narrowed-permission rules apply before enumeration or
  arithmetic.
- A mismatch between Plan and compensation creates a bounded staff exception
  and never changes payroll or D4 funding automatically.

### D9 adversarial review

Every requested category has a concern:

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                        | Severity | Likelihood  | Permanent prevention                                                                                                                         |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Assuming every tenant has commitments, a balance, one currency, or a publishable finance position makes ordinary ministry models fail.                        | Critical | High        | Optional independently resolved modules, exact scopes, compatible-close gates, and no absent-data substitutes.                               |
| Technical debt                    | Yes      | Copying goals, commitments, plans, and balances into a dashboard table creates duplicated truth and divergent corrections.                                    | Critical | High        | Immutable source references, one shared projection evaluator, and contract/exhaustive mapping tests.                                         |
| Edge cases                        | Yes      | Zero need, negative balance, future or overlapping plans, stale closes, hidden balances, multiple currencies, exits, and late corrections break naive ratios. | Critical | High        | Explicit state/edge-case contracts, exact arithmetic, affected-projection isolation, and property/fault testing.                             |
| Footguns                          | Yes      | Staff could backdate a Plan, call a balance available, include commitments in coverage, mix currencies, or expose finance data through a card toggle.         | Critical | Medium-high | Prospective versions, governed labels, finite modules, no formula language, pre-computation authorization, and activation preview.           |
| Tenant safety                     | Yes      | A Profile, cache, alert, Plan, or result could cross Tenant, Legal Entity, Support Assignment, recipient audience, purpose, or currency.                      | Critical | Medium      | Structurally complete scope, tenant-safe uniqueness, RLS/service authorization, and negative isolation tests.                                |
| Over-engineering                  | Yes      | Flexibility could grow into budgeting, accounting, payroll forecasting, or a general dashboard builder.                                                       | High     | High        | One optional Plan, finite modules, bounded projections, one Profile, and reuse of existing authorities.                                      |
| UX/UI and user friction           | Yes      | Empty cards, setup nags, jargon, blended metrics, stale values, or a wall of switches obscure what is actual, expected, approved, or finance-confirmed.       | High     | High        | Guided profiles, progressive disclosure, live role preview, exact dates, absent-not-zero behavior, and mobile/user testing.                  |
| Hidden coupling                   | Yes      | Requiring Phase 16, Phase 28, QBO/Xero, provider balances, or payroll for core Phase 21 truth lets optional systems block the workspace or close.             | Critical | Medium-high | Independently authoritative modules, isolated projection failure, and no live external dependency.                                           |
| Failure modes                     | Yes      | A stale Plan, stalled watermark, failed alert, or stale cache can be shown as current.                                                                        | Critical | High        | Last-confirmed values with dates, compatibility/freshness states, discardable projections, staff exceptions, and truthful delivery evidence. |
| Data integrity risks              | Yes      | Overlapping versions, floating-point rounding, cross-currency math, duplicate alerts, or historical recomputation make results irreproducible.                | Critical | Medium-high | Uniqueness/CAS, integer minor units, prospective versions, idempotency, append-only correction, and no FX.                                   |
| Security and privacy risks        | Yes      | A visually hidden balance may still be fetched, cached, searched, announced, exported, or inferred.                                                           | Critical | Medium-high | Authorization before enumeration/computation, deny-by-default APIs, purpose-scoped caches, and privacy-differencing tests.                   |
| Scalability and performance risks | Yes      | Per-request raw-ledger recomputation or an alert storm after close can overload seasonal operations.                                                          | High     | Medium-high | Close-triggered incremental projections, batched reads, tenant-fair queues, deduplication, hysteresis, and load certification.               |
| Operational burden                | Yes      | Per-person custom dashboards and duplicate Plan maintenance force finance to reconcile widgets and answer recurring disputes.                                 | High     | High        | Tenant defaults, sparse overrides, bulk preview, one approved source, harmless personal preferences, and exception-first operations.         |
| Observability gaps                | Yes      | Support cannot reproduce a displayed number or determine which source was stale.                                                                              | High     | High        | Exact source versions/watermarks, formula provenance, safe evidence bundles, and conflict/staleness/denial metrics.                          |
| Dependency and integration risks  | Yes      | Copying MPDX, TntConnect, or DonorHub semantics as universal binds Asym to older or incomplete vendor behavior.                                               | High     | High        | Provider-neutral internal contracts, versioned certified adapters, and no assumed provider parity.                                           |
| Migration and upgrade risks       | Yes      | A formula/schema change may rewrite history, while imported goals may incorrectly gain organization-approved authority.                                       | High     | Medium      | Versioned schemas/evaluators, prospective migration, explicit authority classification, and immutable snapshots.                             |
| Other development hazards         | Yes      | Plan activation, finance close, visibility changes, corrections, and alerts can race into contradictory outcomes.                                             | Critical | Medium-high | Atomic boundary selection, CAS, outbox/idempotency, race/fault injection, and prospective rollback by successor.                             |

### Required production proof

1. A tenant with no Plan, commitments, or balance publication receives no setup
   noise and all D1-D8 work remains unchanged.
2. Authority tests prove that Plan or Profile changes cannot edit Phase 13/21
   activity, Phase 16 commitments, D1 entries/balances, D4 funding, Phase 28
   goals, external payroll/payment, or QBO/Xero truth.
3. Authorization tests prove a hidden balance is not fetched, counted,
   calculated, cached, exported, searched, announced, or leaked through alert
   eligibility.
4. Isolation tests cover Tenant, Legal Entity, Support Assignment,
   purpose/Field Account, audience, ISO currency, Plan, Profile, and Support
   Cycle.
5. Version and race tests cover activation before/at/after close, duplicate
   activation, interval overlap, stale CAS, deactivation, lifecycle succession,
   and late correction.
6. Formula property tests cover two-, zero-, and three-decimal currencies,
   large and signed values, exact division, display rounding, invalid
   denominators, dated needs, reserve methods, coverage-to-debit replacement,
   and no binary floating point.
7. Multi-currency tests prove independent Plan, balance, reserve, coverage, and
   alert lanes with no conversion or authoritative aggregate.
8. Freshness tests prove a new Plan waits for a compatible close and stale
   sources cannot generate a fresh health conclusion.
9. Alert tests prove one winning threshold, deduplication, hysteresis,
   recovery, reminder bounds, delivery-channel preference, and no direct
   Phase 21 transport call.
10. UI tests cover every guided profile and no-data, stale, negative,
    multi-currency, upcoming-plan, Plan/Goal disagreement, and
    permission-narrowing states.
11. Personalization tests prove reorder/collapse cannot widen access or mutate
    the Plan, Profile, calculation, statement, or another audience.
12. WCAG 2.2 AA tests cover semantic relationships, keyboard disclosure,
    visible focus, status announcements without chattiness, non-color status,
    200% zoom, 320 CSS-pixel reflow, touch targets, locale, and screen-reader
    formula/provenance text.
13. Support/audit tests reproduce a displayed projection from safe source
    references without logging donor PII or exposing internal IDs.
14. Production-volume close tests prove bounded recomputation, tenant fairness,
    and no alert storm.
15. Statements and archived snapshots preserve the exact Plan, Profile,
    formula, close, and source versions used when issued.

### Evidence

- [Phase 21 D9 primary-source support-plan, missions-product, CRM UX, and
  adversarial research](./phase-21-mission-dashboard-product-research-evidence.md#d9-ratified-direction-optional-approved-support-plans-and-bounded-workspace-publication)
- [MPDX mobile dashboard](https://help.mpdx.org/article/1100-mpdx-mobile-dashboard)
- [TntConnect support analysis](https://www.tntware.com/tntconnect/help/en/pages/analysis-analysisview.aspx)
- [TntConnect optional balance behavior](https://www.tntware.com/tntconnect/help/en/pages/gifts-download.aspx)
- [DonorHub optional financial information](https://www.tntware.com/donorhub/help/en/pages/financial_information.aspx)
- [Reliant support-goal guidance](https://reliant.org/help/supporting-missionaries/how-much-financial-support-do-reliant-missionaries-have-to-raise)
- [IPHC 2025 World Missions policy](https://iphc.org/missions/wp-content/uploads/sites/2/2025/04/WMM-Policy-Manual-April-2025.pdf)
- [HubSpot record customization](https://knowledge.hubspot.com/object-settings/customize-records)
- [Virtuous project-statement source prerequisite behavior](https://support.virtuous.org/hc/en-us/articles/6466181015949-What-is-the-Project-Statements-Tab)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ADR-0070 — Optional approved Support Plans and bounded workspace
  publication](../../adr/0070-optional-approved-support-plans-and-bounded-workspace-publication.md)

### Superseded remaining-decision note

D9 settles optional organization-approved Support Plans, conservative
purpose-separated planning projections, and bounded native workspace
publication. It adds no Phase 31 feed field and does not reopen D1-D8. Later
Phase 21 decisions continue one at a time.

## D10 — Claim-level expense truth and purpose-routed tenant AI

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — claim-level immutable
> Expense Claim truth inside one adaptive report-first experience, with exact
> conserved item/split dispositions, clean-claim progression, linked successor
> recovery, private many-to-many Receipt Evidence coverage, immutable Approved
> Expense Snapshots and supplements, and independently authoritative policy,
> Reimbursement Obligation, Field Account Funding Coverage, external-payment,
> and Phase 20 accounting truth; plus one shared tenant-owned AI capability
> control plane separating write-only encrypted Provider Credential Revisions
> from prospective purpose-specific, capability-certified AI Capability
> Binding Versions, allowing different connections, credentials, models,
> regions, and budgets per use; with classification-gated minimum-data egress,
> immutable invocation provenance, suggestion-only OCR and matching, explicit
> human confirmation, production-shaped evaluation, and a complete manual
> path—without public receipt storage, per-feature key columns, arbitrary
> endpoints, secret readback, silent provider fallback, AI-authored financial
> or publication truth, destructive report reopening, or report-level
> paid/synced authority.**

### Expense authority model

The **Expense Claim**, not the report, is the smallest independently versioned
and dispositioned source fact. One logical claim represents one business-
spending occurrence and owns the claimant's asserted facts, including the exact
Tenant, Legal Entity, claimant, Expense Relationship Context, certified claim
kind, merchant or payee, incurred date, original amount and ISO currency,
business purpose, economic-payer assertion, purpose or Designation allocation,
itemization, evidence links, and intake provenance.

Every material save creates or advances one immutable **Expense Claim Version**.
Its signed items and splits conserve the claim total in the exact source
currency. OCR, matching, policy suggestions, report membership, and downstream
provider data never overwrite a Claim Version.

An autosaved **Expense Report Draft** is an optional organization surface for a
trip, project, month, or other bounded tenant grouping. An immutable **Expense
Report Submission** pins the exact current Claim Versions, submitter, purpose,
context, and time sent for review. Draft and Submission are review envelopes,
not aggregate approval, obligation, funding, payment, accounting, or provider
truth.

The ordinary one-claim journey does not ask the missionary to create, name, or
manage a report. Grouping appears only when it saves work. Report status is a
derived summary such as **3 ready, 1 needs information** and never a stored
`approved`, `reimbursable`, `funded`, `paid`, `exported`, or `synced`
authority.

### Exact review, approval, and recovery

Every current Claim Version receives one version-pinned **Expense Policy
Decision** whose line dispositions are exhaustive and conserving:

- `approved`;
- `needs_information`;
- `rejected`; or
- `excluded`.

`Needs information` is a bounded workflow condition with a named requirement,
responsible party, and due or follow-up behavior. It is not an indefinite
financial status. A reviewer may advance clean claims while selected claims
wait for information or receive a terminal rejection or exclusion. **Approve
clean claims** is a batch command over the exact reviewed eligible versions; it
creates independent decisions and never smuggles hidden claims through a
report-level flag.

One claim may be partly approved only when every item/split receives an exact
terminal disposition and the approved, rejected, and excluded coverage
conserves the source total. A claim still needing information creates no
Approved Expense Snapshot.

Each approved Claim Version produces at most one immutable **Approved Expense
Snapshot** for its exact approved coverage. A later approval of previously
unapproved coverage creates a non-overlapping linked supplement or successor.
A returned claim creates a linked successor Claim Version beneath the same
logical expense; it never destructively reopens the prior version or silently
carries approval to changed facts. After a snapshot has contributed to an
obligation, Field Account effect, payment, or Accounting Release, every change
uses the appropriate cause-linked append-only correction.

The following authorities remain independent:

| Authority                                           | Owns                                                                                                | Does not prove                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Expense Claim Version                               | Claimant-authored expense facts and exact itemization                                               | Policy approval, organizational liability, funding, payment, or accounting |
| Expense Policy Decision / Approved Expense Snapshot | Source-owned disposition and frozen approved coverage                                               | Field Account capacity, payment, or provider posting                       |
| Reimbursement Obligation                            | Exact amount the organization owes under the applicable policy or law                               | Funding reservation, scheduled payment, or paid outcome                    |
| Field Account Funding Coverage                      | Exact non-reusable organization-controlled capacity reserved for an approved purpose                | Liability, cash availability, payment, or accounting                       |
| External Payment Occurrence                         | Source-qualified evidence that payroll, AP, or another authorized external process executed payment | Expense approval, Field Account truth, or final books                      |
| Phase 20 Accounting-Ready Expense Handoff           | PII-minimized projection rooted in exact approved/payment/correction facts                          | Raw receipt ownership, expense approval, or payment execution              |
| QBO/Xero                                            | Posted books and final reconciliation                                                               | Claim, policy, Field Account, or payment-source meaning                    |

### Private Receipt Evidence and exact coverage

Receipt and substantiation bytes are private financial evidence. Phase 21 owns
their expense meaning and uses immutable **Receipt Evidence Assets** plus
immutable, versioned **Expense Evidence Links**:

- one claim may have multiple evidence assets;
- one evidence asset may support several items or claims only through explicit
  coverage links;
- coverage links preserve evidence role, exact covered lines and amounts,
  actor, purpose, and explanation;
- intentional shared evidence must have non-overlapping economic coverage or a
  staff-visible reason;
- the immutable original is retained; crop, rotation, OCR text, thumbnail,
  redaction, and accessible rendition are derived artifacts, never
  replacements;
- a missing-receipt declaration is its own governed evidence kind, never a fake
  receipt; and
- deterministic byte digests are exact duplicate evidence, while perceptual,
  merchant/date/amount, source-transaction, or model similarity remains a
  reviewable suggestion.

The existing public `document-uploads` bucket and public media paths are
prohibited for expense evidence. Before D10 can ship, Core must provide a
genuinely private Phase-29-compatible byte seam with opaque immutable identity,
malware and file-type hygiene, size/page/decompression limits, short-lived
signed access, authorization before enumeration, access audit, retention and
hold references, and recoverable upload finalization. Phase 29 later owns the
common storage and access lifecycle without changing Phase 21 evidence
identity, meaning, coverage, approval, or correction truth.

Raw receipts do not enter Phase 20, ordinary telemetry, broad support tooling,
exports that do not explicitly include evidence, or a model invocation without
the exact permitted egress contract.

### Shared tenant-owned AI capability control plane

D10 pulls forward only the minimum shared AI execution foundation required for
purpose-specific product features. It does not place a generic key vault or
model marketplace inside expenses, and Phase 40 later consumes rather than
replaces this foundation.

The shared control plane owns:

- **AI Provider Connection** — the stable Tenant-owned relationship to one
  exact provider account or organization, environment, and compatible region;
- **AI Provider Credential Revision** — a write-only, encrypted, replaceable
  and revocable provider authority with a masked hint, provider-account proof,
  lifecycle evidence, actor, and cryptographic-erasure state;
- **AI Feature Purpose** — a closed code-owned purpose such as receipt
  extraction, expense-match suggestion, or public-profile drafting;
- **AI Capability Certification** — proof that an exact provider, model,
  region, input class, structured-output contract, language/page limit, and
  data-handling posture support one exact purpose;
- **AI Capability Binding Version** — one immutable prospective Tenant- and,
  where required, Legal-Entity-, region-, and purpose-scoped route pinning the
  connection, credential revision, certified model capability, schema/prompt
  family, provider retention/training posture, budget/rate envelope, and
  explicit fallback rule;
- **AI Egress Manifest** — the exact authorized source versions/digests,
  classifications, fields or bytes released, purpose, binding version, and
  redaction or denial result; and
- **AI Invocation Evidence** — an immutable idempotent request identity,
  provider/model/binding/schema versions, safe provider request reference,
  input/output digests, timing, outcome, error class, and authorized
  usage/cost observation, without secrets, raw model reasoning, or unrestricted
  prompt/output logging.

A tenant may reuse one Provider Connection and Credential Revision for several
authorized purposes or choose different credentials, providers, models,
regions, and budgets for different purposes. References from purpose-specific
Binding Versions provide that flexibility; D10 rejects one global key that
silently activates every feature and one schema column per feature/provider.

Provider and model choices are bounded to currently capability-certified
adapters. Arbitrary base URLs, free-form model identifiers, browser-side
provider requests, tenant-authored system prompts, and silent cross-provider
fallback are out. A credential test does not activate a purpose. Every
activation is prospective and previews the exact purpose, provider/model,
region, data classes, retention/training posture, billing owner, expected
limits, budget, and manual fallback.

Phase 21 owns **Receipt Extraction Suggestion Versions** and **Expense Match
Suggestion Versions** under the shared non-authoritative suggestion contract.
Phase 22 may later own a public-profile draft suggestion through the same
control plane. Neither Phase 21 nor the shared control plane owns biography
truth, public publication, claim approval, accounting, or another domain's
acceptance command.

### AI egress, safety, and manual continuity

Before receipt bytes or extracted text leave Asym, the system must:

1. resolve current Tenant, Legal Entity, claimant/worker scope, actor,
   capability, and AI Feature Purpose;
2. resolve the exact evidence version and strictest Phase 3/10 classification;
3. deny care, security, restricted-worker, or otherwise prohibited context
   under the current Phase 10 egress ruling—tenant BYOK does not waive it;
4. validate the current Binding Version and credential revision;
5. malware-scan and MIME-sniff the immutable input; enforce byte, page, pixel,
   decompression, orientation, and supported-format limits;
6. freeze one minimum-data AI Egress Manifest and idempotent invocation;
7. invoke only the server-side certified adapter with no tools, URL fetching,
   browsing, code execution, tenant search, or provider-side retrieval;
8. treat all receipt pixels/text as untrusted data, not instructions;
9. validate strict structured output against deterministic money, currency,
   date, total, tax, tip, and allocation rules; and
10. persist only a non-authoritative Suggestion Version for explicit human
    confirmation or rejection.

Amount, currency, date, claimant, economic payer, business purpose, allocation,
and any match that would establish evidence coverage require confirmation.
Accepting a suggestion creates ordinary source-owned claim/evidence facts with
provenance; it never converts model output into evidence or financial truth by
itself.

No AI feature is required to capture, submit, review, approve, correct, pay, or
account for an expense. Missing credentials, disabled features, provider
outage, timeout, rate limit, unsupported input/language, invalid schema, unsafe
output, exhausted budget, or revoked connection all preserve the original
evidence and immediately expose the complete manual path. An in-flight
invocation pins its original credential and Binding Version and never silently
switches account, model, region, or provider. Ambiguous provider outcomes use
inspect-before-retry; blind duplicate invocation is forbidden.

### UX/UI contract

#### Missionary and claimant

The primary action is **Add expense**. The mobile-first flow supports camera,
file, photo-library, and later governed intake seams; saves immediately; and
distinguishes **Saved on this device**, **Uploading**, **Uploaded**, and
**Could not upload** with accessible recovery.

Receipt extraction runs quietly in the background and never locks the form.
Suggested fields are visibly editable, and **Check these details** calls
attention only to material uncertainty. The form asks only fields required by
the applicable policy and explains unusual requests. **Save for later**,
resumable upload, and manual completion are first-class.

Before submission, a compact review shows source amount/currency, requested
treatment, business purpose, evidence count, and exact missing requirements.
After submission, one calm timeline uses claimant language:
**Submitted → Needs information / Approved / Not approved → Owed**, when an
obligation exists, followed only by independently evidenced external-payment
states. A request for information deep-links to the exact claim and requirement
without disturbing clean claims.

#### Finance and reviewers

The default review surface is an exception-first report summary with claim
rows, exact filters, and a visible **Approve clean claims** action. A clean
group needs one consequence preview and one confirmation. A mixed group states
the exact effects, for example: **Approve 9 claims (USD 842.14); request
information on 2; reject 1 personal line (USD 18.00).**

Receipt, extracted suggestions, claimant-confirmed facts, claimant changes,
policy result, duplicate/match candidates, and current decision are visually
separate. AI confidence is not a traffic-light approval score. Bulk actions
split mixed Tenant, Legal Entity, policy/relationship authority, currency
treatment, and action semantics before confirmation.

Self-approval, policy exceptions, material thresholds, suspicious evidence,
and unresolved relationship/jurisdiction context route to their separately
authorized decision. There is no report-level **Mark paid**, **Sync**, or
**Reconcile** action.

#### Tenant AI administration

The ordinary administrative surface is **Settings → AI features**, organized
by purpose rather than secrets. Cards such as **Read receipts**, **Suggest
expense matches**, and **Help write public profiles** show:

- On/Off and any blocking state;
- provider, model, and region;
- what data the purpose may send;
- provider retention/training posture and billing owner;
- budget or rate limit;
- last successful test, last use, and health; and
- the complete manual fallback.

Opening a card offers **Connect a provider** or **Use an existing connection**.
The server validates the entered secret and provider account; saving creates a
Credential Revision, never a readable key. Later actions are **Replace key**,
**Test connection**, **Turn off for this feature**, and **Revoke connection**.
Replacement or revocation requires fresh authority, shows every affected
purpose, fences stale workers, and records immutable evidence.

An advanced **Provider connections** view shows masked hints, provider-account
identity, authentication type, purpose usage, last verified/used time, health,
rotation, revocation, and audit. It never reveals or copies the secret.
Missionaries see none of this and receive no provider jargon when AI is off or
unavailable.

Phase 12 capabilities separately govern viewing AI posture, managing
connections, managing purpose bindings, viewing cost/usage, invoking receipt
extraction, accepting a suggestion, reviewing claims, overriding policy,
reading evidence, and retrieving protected audit evidence. A job title or broad
`admin` boolean is insufficient.

### Required edge-case outcomes

- A one-expense submission has no report naming or management ceremony.
- A mixed report advances clean claims while returned claims get linked
  successor paths and prior approved coverage is not re-reviewed.
- Multi-page, handwritten, foreign-language, low-quality, rotated, malformed,
  and unsupported receipts preserve the manual path.
- Taxes, tips, discounts, mileage, per diem, advances, partial personal use,
  refunds, negative corrections, and missing receipts conserve exact typed
  amounts or remain unsupported behind a named certification gate.
- Multiple evidence assets, one evidence asset covering multiple exact items,
  and duplicate-looking legitimate recurring expenses remain distinguishable.
- Multiple currencies remain independently ISO-labelled. No model-authored
  exchange rate or mixed-currency authoritative total is allowed.
- Offline capture, expired signed URLs, duplicate client retries, orphaned
  objects, rendition failure, malware-scan failure, and partial persistence
  recover without evidence loss or false success.
- Approval against a stale Claim Version fails before creating a snapshot.
- Revoked credentials, rotated credentials, disabled routes, exhausted budgets,
  model retirement, provider outage, and ambiguous provider outcomes cannot
  mutate Claim or Evidence truth or block manual work.
- A restricted worker's or care/security-classified receipt is denied remote
  model egress even when the tenant owns the provider key.
- A bio-writing feature may share the control plane but cannot read receipt
  evidence or publish content, and the receipt feature cannot read biography
  context.
- Approval, Funding Coverage, provider draft acceptance, and accounting
  delivery never produce `Paid`; only exact External Payment Occurrence
  evidence may do so.

### D10 adversarial review

Every requested category has a concern:

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                               | Severity | Likelihood  | Permanent prevention                                                                                                                                        |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Report-wide state, synchronous OCR, or a mutable model route lets one unusual claim or provider change block all clean work.                                         | Critical | High        | Claim/version authority, adaptive report projection, immutable bindings, typed adapters, and a complete manual path.                                        |
| Technical debt                    | Yes      | A mutable report row, generic ledger object, feature-local SDK calls, or one key column per feature/provider duplicates truth and secrets.                           | Critical | High        | Separate immutable authorities, shared credential/binding foundation, closed purposes, and one Phase 20 handoff.                                            |
| Edge cases                        | Yes      | Shared/missing receipts, itemization, personal splits, tips/tax, mileage/per diem, multi-currency, refunds, offline retries, and later approvals break naive models. | Critical | High        | Exact typed coverage, conservation rules, successor versions, private evidence links, and production-shaped fixtures.                                       |
| Footguns                          | Yes      | **Approve report**, **Mark paid**, secret readback, arbitrary endpoints, or AI confidence can create false obligations, duplicate downstream work, or data exposure. | Critical | High        | Exact consequence preview, bounded commands, write-only secrets, certified endpoints/models, suggestion styling, and human confirmation.                    |
| Tenant safety                     | Yes      | Receipt bytes, provider keys, jobs, caches, or bulk actions can cross Tenant, Legal Entity, claimant, purpose, or region.                                            | Critical | Medium-high | Structurally complete scope, RLS/service reauthorization, tenant-scoped queues/idempotency, and negative isolation tests.                                   |
| Over-engineering                  | Yes      | A workflow builder, prompt editor, universal expense taxonomy, arbitrary model marketplace, or AP subsystem overwhelms ordinary expense capture.                     | High     | High        | One claim model, one adaptive report surface, closed claim/purpose catalogs, guided defaults, and external payment/accounting boundaries.                   |
| UX/UI and user friction           | Yes      | Mandatory report ceremony, repeated approval, key jargon, noisy OCR status, and finance language delay missionaries and reviewers.                                   | High     | High        | Capture-first autosave, quiet one-item UX, approve-clean flow, progressive disclosure, purpose cards, and role-appropriate language.                        |
| Hidden coupling                   | Yes      | Report lifecycle can determine financial truth; QBO fields can leak into claims; Phase 21 can own generic AI or bio behavior; file moves can rewrite evidence.       | Critical | High        | Independent source authorities, typed projections, shared AI foundation, domain-owned acceptance, and stable byte/evidence identity.                        |
| Failure modes                     | Yes      | Upload/DB split success, provider timeout after billing, stale approval, invalid output, or ambiguous external callback can show success or duplicate work.          | Critical | Medium-high | Idempotent commands, transactional version pinning, CAS, explicit stage states, inspect-before-retry, quarantine, and orphan repair.                        |
| Data integrity risks              | Yes      | Lines may not conserve; evidence/payment coverage may duplicate; OCR may overwrite facts; historical approval may mutate.                                            | Critical | High        | Database invariants, exact minor units, immutable versions/snapshots, unique coverage, and append-only correction.                                          |
| Security and privacy risks        | Yes      | Receipts reveal addresses, travel, payment fragments, health/care context, or restricted-worker location; secrets or prompt injection may escape.                    | Critical | High        | Private storage, classification-gated minimum egress, managed secret boundary, no tools/network, strict schema, redacted audit, and provider posture proof. |
| Scalability and performance risks | Yes      | Synchronous image processing, full-history duplicate scans, tenant-wide locks, or provider throttling fail at month end.                                             | High     | Medium-high | Bounded asynchronous jobs, digests/indexes, row-level concurrency, pagination, backpressure, quotas, and tenant-fair certified capacity.                    |
| Operational burden                | Yes      | Every tenant could need bespoke prompts, provider debugging, duplicated key rotation, and opaque reviewer rituals.                                                   | High     | High        | Guided policies, shared connections, purpose cards, test/canary health, normalized errors, manual continuity, and exception-first operations.               |
| Observability gaps                | Yes      | Staff cannot tell upload, extraction, claimant, approval, funding, payment, or accounting wait states apart without exposing PII.                                    | High     | High        | Correlated opaque IDs, purpose-safe structured events, owner/reason/age metrics, invocation evidence, and protected audit retrieval.                        |
| Dependency and integration risks  | Yes      | Model retirement, changed parsing, provider region/retention changes, rate limits, and accounting/payment drift can silently alter behavior.                         | High     | High        | Capability certification, pinned versions, contract tests/canaries, manual fallback, circuit breakers, and provider-neutral domain truth.                   |
| Migration and upgrade risks       | Yes      | Provider-specific fields, mutable prompts/models, public file URLs, or lossy evidence exports prevent safe upgrades and portability.                                 | High     | Medium-high | Stable opaque IDs, versioned canonical schemas, immutable originals/provenance, portable manifests, and adapter-only provider metadata.                     |
| Other development hazards         | Yes      | Double submit, approval/edit races, replay, clock/zone errors, rounding drift, unbounded spend, and weak rollback can corrupt evidence.                              | Critical | High        | Idempotency, CAS/uniqueness, exact date/currency types, outbox, budgets/kill switches, fault/property testing, and successor rollback.                      |

### Required production proof

1. Authority tests prove Claim, report, Decision, Snapshot, Obligation, Funding
   Coverage, External Payment Occurrence, Phase 20 handoff, Accounting Release,
   and QBO/Xero truth may disagree honestly without overwriting one another.
2. A mixed submission with approved, needs-information, rejected, and excluded
   claims produces exact independent outcomes; clean claims never require
   re-review when a successor returns.
3. One-claim usability tests prove no report naming or management ceremony.
4. Version-race tests prove stale approval creates no snapshot or downstream
   effect.
5. Property tests prove claim/item/disposition conservation for signed amounts,
   two-, zero-, and three-decimal currencies, tax, tip, discount, personal split,
   rounding, refunds, and corrections.
6. Evidence-cardinality tests cover several receipts per claim, one receipt
   with disjoint coverage, intentional reuse, exact and perceptual duplicate
   candidates, missing-receipt declarations, and inaccessible evidence.
7. Upload and recovery tests cover offline/resume, duplicate retry, object/DB
   split success, rendition/scan failure, expired access, and orphan repair.
8. AI-independence tests cover no binding, invalid/revoked/rotated credential,
   disabled feature, timeout, rate limit, unsafe or malformed output,
   unsupported input/language, exhausted budget, prompt injection, and manual
   completion in every failure.
9. Credential tests prove no readback, server-only use, replacement/revocation,
   stale-worker fencing, impact preview, cryptographic erasure, and absence from
   logs, queues, telemetry, audits, exports, browser state, and support tools.
10. Authorization and isolation tests cover Tenant, Legal Entity, claimant,
    worker, restricted-worker, purpose, region, currency, evidence, report,
    provider connection, credential revision, Binding Version, invocation,
    cache, queue, and signed-URL substitution before enumeration.
11. Phase 10 tests deny prohibited receipt egress and prove tenant BYOK cannot
    widen classification or publication authority.
12. Prompt-injection tests cover visible/hidden document instructions, QR/URL
    payloads, multilingual/confusable text, malformed files, oversized output,
    and attempts to trigger tools, browsing, network, code, or tenant lookup.
13. Policy, segregation-of-duties, and bulk-command tests prove the exact
    version, actor, authority, exception, and consequence preview.
14. Phase 20 contract tests prove raw receipts, AI outputs, provider secrets,
    report status, and unsupported source kinds cannot enter an Accounting
    Posting Intent or Release.
15. Payment tests prove approval/funding never yields `Paid`, partial and grouped
    External Payment Occurrences preserve exact coverage, and ambiguous
    external evidence cannot be guessed.
16. Provider certification pins official documentation, capability probes,
    structured-output contracts, region and data-use posture, rate/error
    behavior, and production-shaped canaries for every enabled
    provider/model/purpose combination.
17. Load tests use production-shaped images and month-end volume to prove
    bounded memory, responsive capture/review, tenant fairness, backpressure,
    budget enforcement, and no duplicate provider billing.
18. Accessibility and representative usability tests cover the complete
    claimant/admin/reviewer paths with keyboard, screen reader, text errors,
    stable asynchronous focus, non-color state, status announcements, 200%
    zoom, 320 CSS-pixel reflow, touch targets, and low-bandwidth recovery.
19. Portability and audit tests export stable claim/version/snapshot/evidence
    identities, source/policy/decision/correction lineage, safe invocation
    provenance, and byte manifests without provider credentials or unrelated
    PII.
20. Failure injection before and after every persistence, decision, snapshot,
    outbox, provider, and handoff boundary yields zero or one inspectable effect
    and a recoverable owner-labelled exception—never silent partial success.

### Evidence

- [Phase 21 D10 expense-product, AI, UX, security, and adversarial
  research](./phase-21-mission-dashboard-product-research-evidence.md#d10-ratified-direction-claim-level-expense-truth-and-purpose-routed-tenant-ai)
- [Expensify expense approval and selective hold/reject
  behavior](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Approve-Expenses)
- [SAP Concur split-report recovery](https://help.sap.com/docs/concur-expense/concur-expense-standard-edition-administration-guides/split-expense-report-on-approval)
- [Brex expense reimbursements](https://www.brex.com/support/expense-reimbursements)
- [Ramp reimbursement submission](https://support.ramp.com/submitting-reimbursements/)
- [IRS Publication 463](https://www.irs.gov/publications/p463)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant
  AI](../../adr/0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)

### D19 transition to D20

D10 settles expense capture, report orchestration, evidence, claim-level
approval and recovery, and the minimum shared tenant-owned AI capability
control plane. It does not decide the tenant's full expense-policy catalog,
approval topology, card-feed product, external reimbursement-payment adapter,
or any later Phase 40 AI Operator behavior. Later Phase 21 decisions continue
one at a time.

## D11 — Layered, scope-bounded Field Account integrity and cause-owned repair

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — layered, exact,
> scope-bounded Field Account integrity across structurally isolated Tenant ×
> Legal Entity × ISO-currency scopes, using immutable source-addressed
> balanced occurrences with independently persisted bounded control-side
> entries; atomic same-currency writes, exact source-coverage conservation,
> semantic idempotency, checked minor-unit arithmetic, and per-account version
> fences; one machine-produced immutable Support Cycle Integrity Manifest over
> an exact business-date boundary and captured monotonic ingestion cursor at
> every close; workload-shaped incremental verification plus bounded
> historical re-verification; smallest-proved-scope containment with mandatory
> adverse-correction continuity; and deduplicated cause-owned Field Account
> Integrity Cases cleared only by fresh proof after projection rebuild, proved
> replay, source-owned correction, prospective configuration, or append-only
> compensating occurrence. Staff receive one quiet machine-prepared close
> action and exception-only guided recovery; tenants control cadence,
> authorized closers, routing, reminders, optional proportional approvals,
> compatible presentation, and stricter advisories, but cannot weaken
> arithmetic, isolation, coverage, immutability, or correction guarantees.
> Phase 20, QBO, and Xero retain independently authoritative accounting
> delivery and reconciliation truth, with no manual proof checklist, force
> close or force balance, tolerance, plug or generic suspense entry, direct
> database edit, live-provider dependency, generic mark-fixed action, mutable
> history, or tenant-wide freeze for a local fault.**

### Integrity authority and structural scope

D11 makes Field Account integrity a product-owned mathematical and historical
guarantee, not a checklist that finance staff attest to. The smallest ordinary
integrity partition is one exact:

`Tenant × Legal Entity × ISO currency`

Within that partition every occurrence and entry also carries the exact
purpose, Field Account, source identity/version, semantic operation, and
correction lineage needed by its type. Tenant, Legal Entity, purpose, Field
Account, and currency are structural columns and constraint inputs, not
optional metadata inside a JSON payload.

One immutable **Field Account Occurrence** is the semantic unit of write and
retry. It contains:

- one stable opaque occurrence identity and semantic idempotency key;
- one exact occurrence type and schema/calculation version;
- exact source authority, source version, and non-overlapping source coverage;
- exact Tenant, Legal Entity, ISO currency, purpose, and affected accounts;
- signed minor-unit entries whose debit and credit sides commit atomically;
- correction, reversal, pair, or predecessor references where applicable;
- actor/command provenance and committed ordering identity; and
- independently persisted Field-Account-side and organization-control-side
  entries where that occurrence changes a Support Assignment Field Account
  position.

The **Field Account Control Position** is derived from the independently
persisted organization-control-side entries. It is not writable, is not a QBO
or Xero account, and cannot be manufactured by negating the Field Account
position at read time. A comparison between a Field Account total and its own
algebraic inverse is tautological and proves nothing.

The organization-control side may use a small closed code-owned family of
semantic positions needed by the ratified occurrence types. It is not a
tenant-authored chart of accounts, arbitrary journal editor, suspense-account
catalog, or general ledger.

### Four integrity layers

D11 uses four complementary layers. No single layer substitutes for another:

1. **Write-time structural controls** reject malformed scope, unsupported
   currency, invalid minor-unit amount, unbalanced entry sets, missing pair
   members, duplicate semantic writes, and forbidden mutation.
2. **Command and admission controls** reauthorize the exact scope, pin source
   and policy versions, prove non-overlapping remaining source coverage, apply
   per-account version fences, and commit all same-currency effects atomically.
3. **Support Cycle close proof** produces one fresh immutable Support Cycle
   Integrity Manifest against the exact close fence and publishes it atomically
   with the Support Cycle Close.
4. **Scheduled and on-demand verification** incrementally rechecks new work and
   bounded historical scopes, detects latent or migration-induced defects, and
   opens or advances cause-owned cases. It prepares evidence and monitors
   history but never authorizes a close by itself.

Database constraints protect local shape. Domain commands protect semantic
meaning. The manifest proves one exact close. Background verification detects
later drift or previously unknown defects. Removing any layer creates a
different and weaker system.

### Exact conservation and continuity rules

All authoritative money uses checked integer minor units under the exact ISO
currency exponent. Floating-point arithmetic, implicit currency conversion,
silent overflow, and cross-currency balancing are prohibited.

For one Field Account Occurrence in one currency:

```text
sum(all signed entry amounts in minor units) = 0
```

For one Field Account through a close:

```text
closing balance
  = prior closing balance
  + admitted credits
  - admitted debits
```

For one Tenant × Legal Entity × currency control scope:

```text
sum(Field-Account-side net effects)
  + sum(independently persisted organization-control-side net effects)
  = 0
```

Those equations are necessary but not sufficient. The close must also prove:

- every covered occurrence is internally balanced and in the exact scope;
- every required internal pair is complete and atomically covered;
- opening continuity agrees exactly with the preceding immutable close;
- each source unit/version is covered at most once;
- the complete source range assigned to the close is either covered exactly or
  represented by one explicit qualified exclusion/defer outcome allowed by the
  already-ratified source policy;
- mandatory adverse corrections are included or remain visibly appendable and
  cannot be hidden by a positive-work hold;
- account, purpose, Legal Entity, and currency isolation hold before any
  aggregation;
- every calculated entry uses its pinned source and policy/calculation version;
- the resulting statement/balance projection can be deterministically rebuilt
  from the same immutable authorities; and
- no QBO, Xero, bank, payroll, AP, or payment result is being substituted for
  Field Account proof.

Source coverage is an exact first-class relation with uniqueness and
conservation constraints. A total that happens to match is not enough:
duplicating one occurrence while omitting another equal occurrence must fail.

### Support Cycle Integrity Manifest

Every successful close publishes exactly one immutable **Support Cycle
Integrity Manifest** in the same atomic decision as the Support Cycle Close.
The manifest is machine produced. Staff review its plain-language result but do
not manually certify each invariant.

It records at least:

- Tenant, Legal Entity, ISO currency, Support Cycle, and exact account/purpose
  coverage;
- the half-open business-date boundary `[cycle_start, cycle_end)`;
- the preceding committed ingestion cursor and captured upper ingestion cursor,
  defining the checked commit range `(previous_cursor, captured_cursor]`;
- the source families, source-version ranges, occurrence identities, entry and
  account counts, and deterministic coverage digests;
- the exact prior-close and opening-position references;
- every version-addressed Reimbursement Obligation, Field Account Funding
  Coverage reservation, compensation-funding reservation, and other approved
  non-balance position in scope at the captured fence, including its typed
  amount, ISO currency, state, source/version, and exact Field Account;
- one immutable typed relationship for each non-balance position stating
  whether it is already included in the closing balance, reserved against that
  balance, or disclosed only; the statement view consumes this relationship
  and cannot subtract or infer the position again;
- each invariant/check version and terminal result;
- the final Field-Account-side and independently derived organization-control-
  side positions;
- exclusions, policy-qualified deferrals, advisories, and blocking causes;
- statement/projection comparison evidence available at that same fence;
- the final account-version/CAS fence;
- command, actor, job, correlation, started, completed, and committed evidence;
  and
- the manifest schema/calculation version and immutable digest.

Business dates choose the operational period. The monotonic commit-safe cursor
proves which committed facts were observed. Timestamps alone cannot prove
completeness because clocks, backdated effective dates, retries, and delayed
source ingestion can arrive out of order.

A scheduled verification result, cached readiness projection, partial scan,
time-bounded sample, or prior successful manifest cannot be reused as the
authorization for a later close. The close must obtain a fresh terminal proof
against its captured fence. If new committed activity arrives while staff are
reviewing, the version fence invalidates the stale preview and safely refreshes
it rather than surfacing a database-conflict footgun.

### Workload-shaped verification

The verifier is cursor-resumable, tenant-fair, and partition-aware. It uses:

- incremental verification for newly committed occurrences and closes;
- bounded rotating historical re-verification so old corruption is not
  permanently invisible;
- targeted on-demand verification for one occurrence, account, cycle, case,
  Legal Entity, currency, migration cohort, or implementation version;
- explicit checkpoints and idempotent retry;
- separate execution state (`queued`, `running`, `complete`, `failed`,
  `cancelled`) from the financial verdict; and
- complete, stale, partial, and failed evidence states that cannot collapse
  into one green Boolean.

Each run records its exact lower and upper cursor, partitions visited, remaining
work, check versions, and terminal outcome. A capped query such as
`.limit(100)` or `.limit(500)` without cursor continuation and terminal
completeness evidence is prohibited as financial proof. Sampling may support
operational monitoring, never a close or case-clear decision.

The verifier may prepare a clean cycle before staff opens it. Final close still
rechecks the exact captured fence. Large tenants and noisy neighbors receive
bounded concurrency and fair scheduling without weakening any result.

### Cause-owned Integrity Cases and containment

One proved defect creates or advances one deduplicated **Field Account
Integrity Case** keyed by its typed root cause, exact affected scope/version,
and cause fingerprint. A generic “balance problem” row is insufficient.

The case records:

- typed cause and owning source/domain;
- first detected, last reproduced, and last checked evidence;
- exact affected Tenant, Legal Entity, currency, cycle, account, occurrence,
  source coverage, and implementation/migration versions where known;
- missionary-safe and finance-safe impact summaries;
- the smallest proved containment scope and what work may continue;
- the one next source-owned or system-owned repair action;
- owner, backup, age, service objective, and immutable recovery timeline; and
- the fresh successful verification that eventually clears the financial case.

Mission Control may own assignment, comments, reminders, escalation, and
follow-up presentation. It does not own the defect, source correction,
financial verdict, or case-clear authority. Completing, acknowledging,
snoozing, or deleting a general task cannot clear a Field Account Integrity
Case.

Containment applies only to the smallest scope the evidence proves unsafe:

- one command or occurrence when the fault is local;
- one Field Account or pair when only those positions are affected;
- one Tenant × Legal Entity × currency close scope for a partition-level
  mismatch; or
- the exact implementation/migration cohort when a systemic defect proves a
  wider shared cause.

A local fault never defaults to a whole-tenant or platform freeze.
Cross-tenant evidence is a security incident and invokes immediate security
containment rather than an ordinary finance-only case.

Containment may stop discretionary positive admission, close publication, or
other executable work in the affected scope. It must preserve the ability to
append known adverse corrections, reversals, and safety facts. The system may
show the last proven balance and through date while newer affected activity is
under review; it may not silently advance a disputed balance.

### Permanent repair paths

Repair follows the authority that owns the cause:

1. **Projection rebuild** for disposable read-model or aggregate drift.
2. **Proved idempotent replay** when an authorized source fact exists but its
   deterministic occurrence was not committed.
3. **Source-owned correction** when the contribution, assessment, expense,
   compensation, reallocation, worker-lifecycle, or other source authority is
   wrong or incomplete.
4. **Append-only reversal or compensating Field Account Occurrence** when
   immutable posted Field Account history needs a current correction.
5. **Prospective configuration successor** when a policy or mapping is wrong
   for future work.
6. **Phase 20 recovery** when the Field Account source is sound and the defect
   is solely Accounting Release, QBO/Xero delivery, readback, drift, or final
   reconciliation.
7. **Governed engineering recovery** for verified storage, migration, or
   platform corruption, preserving original evidence, exact scope, review,
   before/after proof, and append-only incident history.

The system chooses an automatic projection rebuild only when the target is
disposable, the rebuild is deterministic, and source facts are intact. Money
facts never receive an automatic synthetic balancing entry.

A case clears only after the owning repair reaches its authoritative state and
a fresh complete verification proves the original cause absent at a newer
fence. Staff task completion is not enough. If the same cause later recurs,
Asym creates a linked successor occurrence of the case rather than rewriting
its cleared history.

The following are permanently forbidden:

- editing or deleting a posted Field Account entry or closed manifest;
- directly editing a stored balance, control position, source-coverage row, or
  case verdict;
- “force close,” “force balance,” “mark fixed,” “mark reconciled,” or
  “accept variance” commands;
- rounding tolerances outside the exact currency's deterministic allocation
  rule;
- plug, balancing, catch-all, or generic suspense entries;
- moving an unexplained difference to QBO or Xero;
- retrying an ambiguous non-idempotent operation without inspecting its
  authoritative result; and
- hiding the defect by closing a Mission Control task, disabling a warning, or
  changing presentation.

### Quiet staff close and recovery UX

The ordinary staff experience is one prepared review and one real decision.
For a clean cycle the primary surface shows:

- Support Cycle, Legal Entity, ISO currency, and exact through date;
- number of Field Accounts and activity items checked;
- `Ready to close`;
- last check time and any non-blocking advisory count;
- one primary **Close support cycle** action; and
- one collapsed **What was checked** explanation in plain language.

The explanation says that every included item was accounted for, transfers and
reallocations balance, nothing was counted twice, scope/currency stayed
isolated, opening continuity agrees, and the resulting balances can be rebuilt.
It does not require staff to tick those items.

The consequential confirmation repeats scope, through date, coverage counts,
advisories, what becomes finance-confirmed, and the statement that the action
does not close QBO/Xero, run payroll/AP, or prove payment. No typed phrase,
required narrative, or default second approver is permitted.

Primary staff status labels are:

- `Collecting`
- `Ready to close`
- `Needs review`
- `Waiting for source information`
- `Closing`
- `Closed`
- `Closed with follow-up`

The surface never calls a Field Account close `Reconciled`.

When an exception exists, each card answers in this order:

1. what happened;
2. what is affected;
3. why it matters;
4. what the person should do next;
5. who owns it; and
6. when it was last checked.

The primary action opens the exact owning source or bounded authorized repair.
Raw cursors, digests, equations, provenance identifiers, and implementation
versions stay under **Audit details**. Technical states are not exposed as the
main staff vocabulary.

Routine notifications are quiet: an in-app action indicator and a daily digest
for unresolved assigned cases. Immediate notices are reserved for critical
near-close integrity blockers or security/privacy containment. Unchanged
conditions do not generate repeated messages. A blocker remains visible on the
close surface even when email is disabled.

### Missionary experience

Unaffected missionaries see no integrity alert. They continue to see the last
Finance-confirmed Field Account Balance with its exact ISO currency and
through date.

An affected missionary sees only a calm scope-safe message such as:

> **Recent activity is being reviewed.** Your finance-confirmed support balance
> through June 30 has not changed. Recent activity will appear after finance
> completes its review.

The missionary never sees another Support Assignment's or recipient's data,
organization-control-side amount, internal case severity, raw source evidence,
accounting/provider detail, or wording that
implies support is available, withdrawable, payable, payroll-ready, or paid.

### Bounded tenant control

Tenants prospectively control:

- monthly, biweekly, or other ratified Support Cycle cadence;
- authorized reviewers and closers;
- owner and backup routing by typed cause;
- target close dates, reminders, and ordinary notification frequency;
- an optional second review for tenant-defined material/risk thresholds;
- whether a mathematically valid advisory requires acknowledgment;
- stricter prospective advisory thresholds;
- saved views and terminology-compatible presentation labels;
- whether safe automatic projection repair is silently recorded or also
  notified; and
- whether D2-qualified positive work is deferred when the existing readiness
  policy permits it.

Tenants cannot override:

- exact balancing and checked minor-unit arithmetic;
- Tenant, Legal Entity, purpose, Field Account, and currency isolation;
- unique and complete source coverage;
- atomic same-currency pair behavior;
- immutable posted history and closes;
- mandatory adverse-correction continuity;
- fresh proof before close or financial case clearing;
- least-privilege authorization and protected evidence;
- the separation from Phase 20, QBO/Xero, payroll/AP, and payment truth; or
- the prohibition on plug, tolerance, force, suspense, or direct-edit repair.

Phase 21 does not add a workflow language, custom formula builder, arbitrary
severity matrix, tenant-authored control-account designer, or manual close
checklist.

### Required edge-case outcomes

1. New committed activity arriving during review invalidates the stale fence,
   refreshes checks without losing the user's place, and is never silently
   omitted.
2. A backdated source fact committed after the captured cursor cannot rewrite a
   closed manifest. It enters the next open cycle or the owning append-only
   correction path according to source authority.
3. Duplicate coverage plus an equal omitted occurrence fails even when the net
   amount is unchanged.
4. An incomplete transfer or reallocation pair blocks only its affected close
   scope and routes to the source case; no offset may be invented.
5. An empty cycle may close when opening continuity, zero source coverage, and
   the exact cursor range are completely proved.
6. Zero- and three-decimal currencies use their exact ISO minor-unit rules.
   Mixed-currency occurrence sets fail before aggregation.
7. A prior-cycle refund or other mandatory adverse fact appends to the current
   qualified correction path even when it produces a visible deficit.
8. A projection mismatch with intact immutable sources rebuilds
   deterministically without staff approval; material recovery remains visible
   in the timeline.
9. QBO/Xero or a provider outage does not block Field Account integrity proof.
   The independently owned accounting comparison says `Accounting check
delayed` and recovers separately.
10. A verifier crash leaves explicit incomplete execution state and resumes
    from its checkpoint. It never publishes a partial green result.
11. Double-click, network loss, and close-command retry resolve to zero or one
    authoritative close; the client inspects the result before offering retry.
12. A Support Assignment, approved-purpose, or source-policy lifecycle change during review triggers the
    version fence and a new preview; it does not mutate the reviewed sources.
13. A local affected account does not alarm or freeze unrelated missionaries,
    currencies, Legal Entities, or tenants.
14. A system-version defect may expand containment only to scopes proved to
    have been written by that version.
15. Cross-tenant evidence produces a security incident, immediate affected
    access containment, and no amount/PII in general operations alerts.
16. Case follow-up may remain open after the financial defect is freshly
    proved repaired; likewise, completing follow-up cannot clear an unproved
    financial defect.
17. Historical re-verification uses the original manifest/check version for
    historical interpretation and records a newer verification version without
    rewriting the close.

### D11 adversarial review

| Category                          | Concern? | What could go wrong                                                                                                                                         | Severity | Likelihood     | Permanent prevention                                                                                                              |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | A giant synchronous sweep, live provider dependency, timestamp fence, or single hot control row fails under normal concurrency and outages.                 | Critical | Medium-high    | Partitioned cursor-resumable checks, captured commit fence, per-account versions, and no provider call in close.                  |
| Technical debt                    | Yes      | Duplicated formulas, mutable flags, JSON-only scope, and generic exception rows drift until nobody can reproduce a close.                                   | Critical | High           | One versioned invariant contract, structural scope, immutable manifest, typed causes, and rebuildable projections.                |
| Edge cases                        | Yes      | Late/backdated facts, empty cycles, partial pairs, corrections, deficits, ISO exponents, retries, lifecycle changes, and stale policies break it.           | Critical | High           | Half-open boundaries, monotonic cursor, atomic pairs, exact versions, append-only adverse correction, and edge fixtures.          |
| Footguns                          | Yes      | Force close, mark fixed, accept variance, direct edit, or generic suspense can publish a knowingly false balance.                                           | Critical | Medium         | Remove generic bypasses; expose only typed source-owned repairs; never demote core blockers.                                      |
| Tenant safety                     | Yes      | Weak structural scope, shared caches/queues, or rich notifications can mix Tenants, Legal Entities, Support Assignments, currencies, recipients, or donors. | Critical | Medium         | Complete scope keys, RLS and command reauthorization, scoped idempotency, safe counts, and negative isolation tests.              |
| Over-engineering                  | Yes      | A GL-style close checklist, workflow builder, rule language, custom control accounts, or approval bureaucracy overwhelms ordinary finance work.             | High     | High           | One Support Cycle Manifest, guided tenant settings, machine checks, and exception-only human decisions.                           |
| UX/UI and user friction           | Yes      | Jargon, repeated attestations, stacked warnings, or mandatory second approval causes delay and rubber-stamping.                                             | High     | High           | One-screen readiness, one close action, progressive disclosure, direct source action, and optional proportional review only.      |
| Hidden coupling                   | Yes      | Field Account close can become dependent on QBO/Xero, bank, payroll, statements, Mission Control task state, or a disposable projection.                    | Critical | Medium-high    | Independently authoritative records and references; no shared mutable status or live downstream dependency.                       |
| Failure modes                     | Yes      | Partial scans, crash after decision, stale preview, ambiguous retry, or failed rebuild leaves staff unsure whether a close happened.                        | Critical | Medium         | Terminal completeness, atomic publication, idempotency, inspect-before-retry, last-proven truth, and explicit recovery state.     |
| Data integrity risks              | Yes      | Duplicate/omitted coverage, partial pair, overflow, mutable history, or a tautological control comparison corrupts balances.                                | Critical | Medium-high    | Independent control entries, uniqueness/conservation, checked integers, immutable facts, version fences, and property tests.      |
| Security and privacy risks        | Yes      | Cases and audit evidence can expose balances, gifts, expenses, or restricted-worker information to unauthorized people.                                     | Critical | Medium         | Least privilege, authorization before enumeration, PII-minimized general tasks, protected audit details, and access audit.        |
| Scalability and performance risks | Yes      | Full-history tenant scans, hot locks, and unbounded retries fail at month end or let one tenant starve others.                                              | High     | High over time | Incremental partitioned aggregates, bounded history rotation, tenant-fair queues, checkpoints, backpressure, and load proof.      |
| Operational burden                | Yes      | Manual tie-out packets, tribal repair steps, and noisy repeat alerts require constant finance or engineering intervention.                                  | High     | High           | Automatically collected evidence, cause-owned guided repair, quiet digests, deterministic rebuild, and embedded explanations.     |
| Observability gaps                | Yes      | Operators see “failed” without freshness, exact scope, cause, owner, cursor progress, or recovery outcome.                                                  | High     | Medium         | Safe correlation IDs, last checked time, affected scope, owner/reason/age, checkpoints, lag metrics, and immutable timeline.      |
| Dependency and integration risks  | Yes      | Provider downtime or API drift may falsely block or appear to invalidate a sound Field Account close.                                                       | High     | High           | Local immutable close evidence; separately recoverable Phase 20/provider comparisons and capability monitoring.                   |
| Migration and upgrade risks       | Yes      | Changed equations, manifest schemas, or migrations can make old closes unverifiable or silently reinterpret history.                                        | Critical | Medium         | Versioned schemas/checks, immutable old manifests, cohort proof, projection migration, and bounded historical re-verification.    |
| Other development hazards         | Yes      | Race conditions, timezone/date errors, double submit, unsafe repair rollout, or weak rollback can create rare systemic corruption.                          | Critical | Medium-high    | Concurrency/fault/property/boundary tests, canary derived repairs, kill switches, and no destructive rollback of immutable facts. |

### Required production proof

1. Property tests prove balancing, independent control comparison, opening
   continuity, source conservation, unique coverage, pair completeness, scope
   isolation, and deterministic rebuild.
2. Mutation tests deliberately omit one occurrence, duplicate another equal
   amount, swap destinations, mutate a policy/source version, and construct a
   Field-Account-side total with no independent organization-control-side
   entry; every case fails.
3. Currency tests cover positive/negative amounts, zero-, two-, and
   three-decimal currencies, allocation residuals, boundary values, and checked
   overflow.
4. Concurrency tests cover simultaneous occurrences on one account, two close
   attempts, new activity during review, policy/lifecycle succession, and
   version-fence refresh.
5. Cursor tests cover delayed ingestion, backdated effective dates,
   out-of-order timestamps, replay, crash/resume, empty ranges, and terminal
   completeness.
6. Fault injection before and after every occurrence, outbox, checkpoint,
   manifest, close, projection, case, and notification write yields zero or one
   inspectable effect and no false green.
7. Isolation tests cover Tenant, Legal Entity, Support Assignment, purpose,
   Field Account, currency, authorized recipient/restricted-worker, case, audit
   details, queue, cache, and notification
   payload before enumeration.
8. Repair tests prove deterministic projection rebuild, proved idempotent
   replay, source-owned correction, append-only compensation, prospective
   configuration, recurrence succession, and fresh-proof-only case clearing.
9. Containment tests prove the smallest affected scope stops only unsafe
   positive/executable work while mandatory adverse corrections remain
   appendable and unrelated scopes continue.
10. Phase 20 contract tests prove QBO/Xero downtime, Accounting Release drift,
    bank mismatch, and Mission Control task state cannot change Field Account
    truth or block a locally complete close.
11. Volume tests use production-shaped tenants, Legal Entities, Support
    Assignments, authorized recipients, accounts, currencies, occurrences,
    corrections, cycles, and historical
    depth; they prove tenant fairness, bounded memory, checkpoint recovery, and
    close responsiveness.
12. Migration tests prove an implementation/schema cohort can be located,
    contained, re-verified, and repaired without rewriting immutable history or
    freezing unaffected scopes.
13. Accessibility tests cover keyboard operation, visible focus, screen-reader
    names/status announcements, non-color severity, 320-CSS-pixel reflow, 400%
    zoom, primary touch targets, and consequential-action review.
14. Representative finance usability tests prove a clean close requires one
    meaningful review and one action, a blocker is understood without ledger
    jargon, the owning source is reachable in one action, and nobody mistakes
    the result for QBO/Xero reconciliation.
15. Missionary usability tests prove people understand the balance's ISO
    currency and through date without interpreting it as available,
    withdrawable, payable, payroll-ready, or paid.
16. Operational certification tracks proof freshness, close duration,
    incomplete-verification rate, blocking-case rate, repeated cause rate,
    containment breadth, repair time, historical re-verification lag, and false
    advisory rate without exposing amounts or PII.
17. Release is blocked if any path can force balance, clear a financial case
    without fresh proof, publish a partial scan as complete, compare a position
    only to its own inverse, mutate closed history, or expose another scope.

### Evidence

- [D11 Field Account integrity, close, repair, UX, and adversarial
  research](./phase-21-mission-dashboard-product-research-evidence.md#d11-ratified-direction-layered-scope-bounded-integrity-and-cause-owned-repair)
- [Modern Treasury ledger guarantees](https://docs.moderntreasury.com/ledgers/docs/ledgers-guarantees)
- [Modern Treasury concurrency handling](https://docs.moderntreasury.com/ledgers/docs/handle-concurrency)
- [Modern Treasury account-version and balance
  locking](https://docs.moderntreasury.com/ledgers/docs/lock-on-account-balance-or-version)
- [Modern Treasury prior-state
  verification](https://docs.moderntreasury.com/ledgers/docs/verify-prior-ledger-states)
- [Modern Treasury account
  reconciliation](https://docs.moderntreasury.com/ledgers/docs/account-reconciliation)
- [Stripe reconciliation guidance](https://docs.stripe.com/plan-integration/get-started/reporting-reconciliation)
- [GAO Green Book](https://www.gao.gov/greenbook)
- [Sage Intacct reconciliation](https://www.intacct.com/ia/docs/en_US/help_action/Cash_Management/Reconcile/Get_started/about-reconciling.htm)
- [Ramp accounting overview](https://support.ramp.com/overview-of-ramp-accounting/)
- [OWASP Multi-Tenant Security Cheat
  Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
- [WCAG 2.2 error prevention for financial
  actions](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [ADR-0072 — Layered, scope-bounded Field Account integrity and
  cause-owned repair](../../adr/0072-layered-field-account-integrity-and-cause-owned-repair.md)

### Remaining founder decisions

D11 settles the Field Account integrity layers, close proof, verification,
containment, cause-owned repair, staff close, and missionary-safe exception
experience. It does not reopen D1-D10 or make Asym a general ledger. Later
Phase 21 decisions continue one at a time.

## D12 — Immutable Support Cycle statements with automatic tenant publication

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one immutable D11
> Support Cycle close and Integrity Manifest as the sole Field Account
> statement-facts authority, with one durable post-close source occurrence and
> one deterministic Phase 21 Approved Data View producing the exact immutable
> Phase 18 Facts Package for the code-owned
> `field_account.support_statement@1` purpose; prospective tenant-controlled
> automatic publication through the existing D9 Support Workspace Publication
> Profile, guided compatible balance-profile defaults, no hidden-balance
> existence signal, no per-cycle staff work, and optional statement-ready
> notices off by default; one quiet HTML-first Support statements history with
> one unmetered currently authorized View or download PDF action per exact
> Field Account, Support Cycle, and ISO currency; support-cycle cadence,
> finance-confirmed through-dates, separately labelled non-balance positions,
> no converted total, current authorization on every request, private
> exact-artifact access, automatic idempotent rendering and exception-only
> recovery, append-only later-cycle financial corrections, immutable
> same-facts artifact successors, immediate privacy containment, and
> independently authoritative close, document, access, communication,
> accounting, payroll, reimbursement-payment, and external-provider
> truth—without a second facts store, statement run, scheduler, arbitrary
> official date range, recurring approval or Publish action, live historical
> recomputation, routine attachment, retroactive mass publication, duplicate
> user-visible versions, false zero, donor-PII expansion, or any tax, bank,
> payroll, payment, ownership, availability, or withdrawability claim.**

### Sole financial authority and post-close handoff

The D11 Support Cycle Integrity Manifest and its exact covered Field Account
Occurrences are the only financial facts authority for a Support statement.
D12 adds no mutable historical query, statement ledger, statement-specific
close, or second financial snapshot.

Every successful close atomically persists:

- the exact Tenant, Legal Entity, Support Assignment, charitable
  purpose, Field Account, Support Cycle, and ISO currency scope;
- half-open cycle boundaries and the captured monotonic ingestion boundary;
- opening and closing Finance-confirmed Field Account Balance;
- exact covered occurrences, corrections, policy and schema versions,
  reservations, obligations, and lifecycle evidence;
- the D11 equations, source-coverage, group-completeness, and control proof;
  and
- one durable, replayable post-close source occurrence/outbox instruction.

The close transaction performs no rendering, PDF validation, object storage,
notification, QBO/Xero call, payroll action, reimbursement payment, or other
provider work. A failure in any downstream lane cannot block, reopen, advance,
or correct the close.

After commit, an idempotent Phase 21 **Field Account Support Statement Approved
Data View** reads only the exact manifest identities and immutable covered
occurrences. When the effective D9 publication profile authorizes the purpose,
it deterministically creates the one immutable source-owned Phase 18 Facts
Package. The package pins:

- the manifest, close, Approved Data View, statement-category, locale,
  presentation-policy, profile, purpose, and schema versions;
- exact ordered category rows and integer minor-unit amounts;
- the opening/activity/closing conservation proof;
- separately typed non-balance positions and their inclusion relationship;
- correction lineage and the prior affected cycle where applicable;
- the exact authorized recipient meaning and scope; and
- a content digest over the complete typed package.

Phase 18 accepts it only through
`field_account.support_statement@1` in the `governed_business` lane. Phase 18
owns generation requests, attempts, the one logical document, accessible
current artifact, exact bytes, immutable same-facts successors, private
storage/access evidence, retention, hold, and disposal. Phase 21 never patches
the Facts Package after admission, and Phase 18 never invents, recalculates,
merges, or corrects Field Account meaning.

During this grill, that purpose key is a reserved additive contract in the
Phase 18 authority manifest, not a claim that the current executable purpose
catalog or renderer already supports it. Phase 21 implementation must add and
certify the purpose through the existing Phase 18 Generated Document service
before any tenant can activate it. Global purpose certification and the
tenant's prospective D9 publication choice are separate gates.

### One prospective tenant control, not recurring administration

D12 reuses the D9 **Support Workspace Publication Profile Version**. It does
not create a Statement Publication Profile, statement run, recipient list,
campaign, schedule, approval queue, or separate settings area.

The guided behavior is:

1. Support statements remain Off until the tenant intentionally activates a
   compatible balance-publishing D9 profile.
2. **Balance and activity** and compatible **Support planning** guided presets
   preselect **Show support statements** in their existing one-time activation
   review. The tenant may turn the capability off before activation.
3. **Activity only**, **Goal and activity**, and every balance-hidden profile
   expose no statement, placeholder, count, setup nag, alert, search result,
   export, notification eligibility, or existence inference.
4. **Notify missionaries when ready** is an optional event-family control whose
   tenant-safe default is Off. The Publication Profile may enable that event
   family and establish the prospective tenant default, but only each
   recipient's Support Workspace Notification Preference Version owns channel
   preference. Phase 6 re-proves current identity, authorization, source
   eligibility, preference, contact point, and suppression before using Phase
   17's protected `document_artifact_ready_v1` content seam. The PDF is never
   attached through this seam. Any future attachment route requires its own
   reviewed contract.
5. Enabling publication is prospective and does not silently reveal earlier
   cycles. An authorized administrator may deliberately publish a bounded
   historical range only after an exact audience/artifact impact preview and
   one explicit activation.
6. Disabling publication or losing viewer authorization blocks new
   enumeration, view, full download, and range access immediately. It does not
   delete finance facts, evidence, or properly retained artifacts.

Profile evaluation is fenced to the applicable source occurrence. A stale
profile or concurrent prospective change resolves deterministically rather
than publishing under whichever value a worker happens to read later.

A healthy cycle requires no statement-specific staff action. Staff never:

- select dates, recipients, accounts, purposes, currencies, rows, templates,
  branding, or delivery addresses;
- preview, approve, or publish every cycle;
- reconcile an expected render or recipient count;
- retry transient document work;
- resend a notice to make authenticated access work; or
- re-close a cycle because document work failed.

The existing Phase 18 qualified default publication, purpose output policy,
tenant branding contract, and locale contract apply automatically. A tenant
that chooses an authorized custom publication uses the existing Phase 18 proof
and activation flow once; it does not create a per-cycle requirement.

### Missionary experience

When at least one currently authorized statement is ready, the missionary
Support workspace shows one quiet **Support statements** section. When no
statement is authorized or useful, the section is absent.

Each row is one exact logical statement:

> **Support statement · May 2026**
> Finance-confirmed through May 31 · USD
> **View or download**

The row opens a responsive semantic HTML summary of the same facts and offers
one **View or download PDF** action for the exact current Phase 18 artifact.
The HTML summary is not a second official document, and technical artifact
versions are not shown as peer files. Prior cycles remain collapsed under
**Previous statements**. An authorized missionary may view or download the
current artifact repeatedly without staff approval or a usage quota.

Statement cadence follows the actual Support Cycle:

- monthly is the guided default;
- a tenant closing biweekly receives biweekly statements; and
- D12 creates no separate monthly aggregation scheduler over biweekly facts.

Every statement is scoped to one Field Account, Support Cycle, and ISO
currency. When a missionary has multiple authorized currencies, the workspace
groups them by period for convenience while exposing distinct ISO-labelled
statements. It never combines them into a converted or authoritative grand
total, waits for one currency before closing another, or presents an older
currency statement as current for a newer close.

The first view contains only:

- exact period and Finance-confirmed through date;
- exact ISO currency;
- opening Finance-confirmed Field Account Balance;
- only the balance-changing activity categories that occurred;
- closing Finance-confirmed Field Account Balance;
- a plain correction description when applicable; and
- a short non-authorizing reference.

Zero-value groups are omitted. Technical digests, provider payloads, renderer
states, source-row identities, policy internals, and artifact lineage remain
staff-only progressive detail.

Nonzero reservations or Reimbursement Obligations may appear only in one
separate **Open items** section when the D9 profile and current viewer
authorization permit them. Every item states whether it is included in the
closing balance. It cannot be labelled paid, available, withdrawable, or
payroll-ready, and it cannot be subtracted twice.

Every statement includes the protected qualifier:

> **Organization-controlled support activity. Not a tax receipt, bank
> statement, payslip, proof of payment, or statement of funds available for
> withdrawal.**

The missionary artifact contains no donor roster, donor address, donor email,
payment instrument, private donor or staff note, raw provider identifier,
restricted-worker fact outside the viewer's scope, or unrelated CRM record.
Detailed supporter and gift activity remains in its independently authorized
Phase 14/16/28 and Phase 21 activity surfaces.

### Corrections, successors, and closure

D12 separates financial correction from document repair:

- **Later financial fact or correction:** the owning source appends its
  authorized adverse/correcting fact. Phase 21 admits its linked effect through
  a qualified later Support Cycle, whose statement explains the relationship
  in plain language. The prior close, manifest, Facts Package, and artifact
  remain unchanged.
- **Same-facts presentation or accessibility defect:** Phase 18 renders an
  immutable artifact successor from the same pinned Facts Package. The same
  cycle row resolves to the current eligible artifact; predecessors remain
  protected evidence rather than duplicate user choices.
- **Changed financial meaning:** cannot be repaired by rerendering. It requires
  source-owned correction and later close coverage.
- **Wrong-recipient, cross-tenant, or integrity-invalid artifact:** immediately
  withdraw current access, quarantine the affected artifact, and create the
  appropriate security or integrity case. Do not delete evidence or silently
  substitute content.

A final account closure preserves exact close facts and protected
finance-accessible statement evidence. A former missionary sees it only while
a current recipient principal/Party, Active Tenant Assignment, Support
Assignment, purpose, Tenant, Legal Entity, lifecycle, projection, and
restricted-worker authorization permits access. Support Assignment
participation alone never authorizes access. Records retention and historical
relevance are never authorization.

### Quiet failure and recovery

Document states remain distinct from financial truth:

| Condition                                               | Missionary experience                                                                                              | Staff experience                                            | Permanent system behavior                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------- |
| Close complete; generation inside its normal objective  | No alert; prior statements and balance retain their exact dates                                                    | No task                                                     | Checkpoint and retry automatically             |
| Preparation exceeds the user-visible objective          | `This statement is still being prepared. You can still view your support activity.` inside the statement area only | One safe status, not one task per missionary                | Continue bounded recovery                      |
| Shared publication, font, renderer, or validator defect | No broken link or provider jargon                                                                                  | One deduplicated root-cause exception                       | Contain only the affected publication family   |
| One artifact validation or storage defect               | No row until exact private access is safe                                                                          | One affected-scope exception only after automation exhausts | Quarantine candidate; inspect before retry     |
| Optional notice fails                                   | Statement remains available                                                                                        | Existing Phase 6/17 delivery exception                      | Do not rerender or duplicate the notice        |
| Authorization ends                                      | Statement disappears without existence leakage                                                                     | Protected immutable denial/access evidence                  | Deny future access; retain governed evidence   |
| New close succeeds while an older statement is delayed  | Balance advances with its new through date; no older PDF is labelled current for it                                | One delayed-publication exception after threshold           | Reconcile each exact logical key independently |

Unchanged failures do not repeatedly notify staff. Automatic recovery never
asks finance to click Retry. A human task exists only when a source,
publication, authorization, protected artifact, or provider decision genuinely
requires human authority.

### Structural safety and scale

The semantic logical key includes the exact Tenant, Legal Entity, Support
Assignment, authorized recipient principal/Party when the artifact is recipient-
scoped, charitable purpose, Field Account, Support Cycle, ISO currency,
purpose key/version, and source close identity. Idempotency, outbox, queue,
cache, search, storage, artifact-head, audit, and telemetry correlation retain
the same structural scope.

Authorization is proved before enumeration, counts, arithmetic, search,
pagination, caching, artifact lookup, byte delivery, and diagnostics. Object
storage is private. A stable URL, opaque ID, cursor, cache hit, object path, or
previous authorization decision is never access authority.

Post-close work uses set-based Approved Data View assembly, bounded
tenant-fair fan-out, keyset statement history, page/row limits, retry budgets,
backpressure, and root-cause deduplication. No tenant may starve another, no
giant synchronous transaction renders every artifact, and one recipient or
currency failure cannot block an unrelated scope.

### D12 adversarial review

| Category                          | Concern? | What could go wrong                                                                                                                                                  | Severity | Likelihood  | Permanent prevention                                                                                                     |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | Yes      | Monthly-only assumptions, one currency, or rendering in close fails under biweekly operation, parallel currencies, and provider outages.                             | Critical | High        | Follow actual Support Cycles; immutable manifest input; post-commit document work.                                       |
| Technical debt                    | Yes      | A second facts table, donor-statement reuse, scheduler, or document engine duplicates authority and drifts.                                                          | Critical | High        | D11 remains authoritative; one Phase 21 Approved Data View and one Phase 18 purpose.                                     |
| Edge cases                        | Yes      | Empty cycles, deficits, closure, late corrections, revoked access, locale changes, concurrent closes, and artifact defects can mislead or omit history.              | Critical | High        | Exact eligibility/no-document results, scope-complete keys, successor semantics, and exhaustive fixtures.                |
| Footguns                          | Yes      | Per-cycle Publish, arbitrary ranges, live regeneration, attachment email, bulk historical release, or `Available Funds` wording can cause financial or privacy harm. | Critical | Medium-high | Remove those controls; prospective policy, immutable inputs, authenticated access, and governed copy.                    |
| Tenant safety                     | Yes      | Shared jobs, caches, search, storage, or document heads can expose another Tenant, Legal Entity, Support Assignment, recipient, purpose, account, or currency.       | Critical | Medium      | Structural scope everywhere, RLS/PEP, authorization before enumeration, and negative isolation tests.                    |
| Over-engineering                  | Yes      | A statement run, campaign, approval matrix, template requirement, delivery dashboard, or separate archive adds bureaucracy without authority.                        | High     | High        | One close occurrence, D9 profile, Phase 18 request, logical document, and exception surface.                             |
| UX/UI and user friction           | Yes      | Empty modules, setup nags, multiple versions, false zeroes, unclear dates, PDF-only mobile access, and notice spam confuse staff and missionaries.                   | High     | High        | Conditional disclosure, guided defaults, HTML-first summary, exact period/currency, one PDF action, and notices Off.     |
| Hidden coupling                   | Yes      | Close can accidentally depend on renderer, storage, communication, QBO/Xero, payroll, payment, or sibling currency completion.                                       | Critical | Medium-high | Transactional close/outbox only; independently authoritative and retryable downstream records.                           |
| Failure modes                     | Yes      | Lost post-close work, ambiguous retry, corrupt bytes, stale current head, or duplicate jobs can create missing or conflicting statements.                            | Critical | Medium      | Durable outbox, semantic idempotency, fencing, exact readback/hash, CAS promotion, inspect-before-retry.                 |
| Data integrity risks              | Yes      | Live recomputation, duplicate/omitted coverage, wrong policy, double-subtracted open items, or mixed-currency totals can publish false money.                        | Critical | Medium-high | Pin D11 identities/versions; minor-unit conservation; inclusion labels; no converted total; property and mutation tests. |
| Security and privacy risks        | Yes      | Stable URLs, attachments, donor PII, restricted-worker identity, or stale authorization can expose sensitive finance data.                                           | Critical | Medium-high | Deny by default; reauthorize every request; private short-lived delivery; minimized facts; immediate containment.        |
| Scalability and performance risks | Yes      | Large closes can create N+1 reads, renderer saturation, notification floods, and noisy-neighbor starvation.                                                          | High     | Medium-high | Set-based assembly, bounded tenant-fair queues, keyset history, limits, and workload certification.                      |
| Operational burden                | Yes      | Template setup, per-close approval, healthy-run monitoring, retry, resend, and duplicate-file support consume finance time.                                          | High     | High        | One-time profile activation, automatic operation/recovery, self-service access, and exception-only tasks.                |
| Observability gaps                | Yes      | Operations may know only `failed` without knowing whether close, facts, artifact, access, or notice is affected.                                                     | High     | Medium      | Correlate distinct states with safe scope, age, owner, cause, objective, and recovery evidence.                          |
| Dependency and integration risks  | Yes      | Renderer, font, object-store, and message-provider changes may alter output, block access, or cause retry storms.                                                    | High     | High        | Pin qualified dependencies; no render-time network; exact validation/readback; circuit breakers and retry budgets.       |
| Migration and upgrade risks       | Yes      | Facts schema, category, template, retention, or permission changes can reinterpret old statements or expose history.                                                 | Critical | Medium      | Version every contract; preserve old interpreters and bytes; prospective migrations and cohort proof.                    |
| Other development hazards         | Yes      | Double close, stale-profile races, timezone errors, notification-before-promotion, orphan artifacts, or unsafe rollback can publish the wrong result.                | Critical | Medium-high | Half-open boundaries, server-derived keys, unique constraints, transaction fences, CAS, fault injection, and canaries.   |

### Required production proof

1. Close/outbox fault injection proves either no close or one complete D11
   manifest plus one replayable source occurrence; no downstream call occurs
   in the transaction.
2. Approved Data View contract tests prove exact opening plus admitted signed
   activity equals closing and every ordered row has unique manifest coverage.
3. Mutation tests omit, duplicate, swap, cross-scope, or net-zero-substitute
   one source occurrence and reject the package.
4. Concurrency tests cover double close, duplicate outbox delivery, worker
   death, stale profile activation, profile disablement, and current-artifact
   promotion; each converges on zero or one authorized logical result.
5. Correction tests distinguish later financial facts, prior-cycle adverse
   effects, same-facts accessibility repair, closure, and security withdrawal
   without rewriting prior financial meaning.
6. Publication-profile tests cover every D9 guided posture and prove that a
   hidden balance leaks no statement existence through lists, counts, search,
   alerts, exports, notifications, caches, or error differences.
7. Isolation tests cover Tenant, Legal Entity, Support Assignment, recipient
   principal/Party, Active Tenant Assignment, purpose, Field Account, currency,
   restricted worker, lifecycle, logical
   document, cache, queue, storage, full/range download, and short-lived access
   before enumeration.
8. Multi-currency and cadence tests cover monthly, biweekly, zero-, two-, and
   three-decimal currencies, different through dates, delayed sibling
   statements, and no converted total or cross-currency gating.
9. Artifact proof verifies exact bytes, digest, length, source Facts Package
   digest, private object readback, validation result, and current-head identity
   before access or optional notification.
10. Accessibility proof covers semantic HTML, keyboard and screen reader,
    visible focus, status announcement, 320-CSS-pixel reflow, 400% zoom,
    accessible authentication, and exact tagged-PDF language, title, headings,
    tables, links, reading order, Unicode, contrast, and alternate text.
    Purpose-specific certification reuses the already qualified Phase 18
    renderer and its hard gates; an additive fixture pack covers zero-, two-,
    and three-decimal ISO currencies, maximum category content, non-balance
    position inclusion semantics, append-only corrections, exact through
    dates, accessible table structure, and production-shaped volume. D12 does
    not reopen or rerun the Phase 18 renderer contest.
11. Representative missionary testing proves users distinguish recorded
    activity, Finance-confirmed balance, open items, and payment and do not
    infer ownership, availability, withdrawability, payroll readiness, tax
    status, or payment.
12. Representative finance testing proves one-time profile configuration and
    a clean Support Cycle close create no statement-specific task, while one
    grouped exception identifies the cause and owning next action.
13. Failure drills cover queue, renderer, font, validator, object store, Phase
    17, and Phase 6 outages and prove no broken link, duplicate notice, close
    rollback, false current label, or loss of the last correct artifact.
14. Production-shaped volume proves bounded close latency, set-based facts
    assembly, tenant fairness, rendering throughput, page/row/storage limits,
    retry containment, and recovery objectives.
15. Release is blocked if any default path asks staff to select statement
    dates, accounts, recipients, rows, templates, approval, Publish, retry,
    render reconciliation, or resend to establish portal access.

### Evidence

- [D12 immutable-close statement publication research](./phase-21-mission-dashboard-product-research-evidence.md#d12-ratified-direction-immutable-support-cycle-statements-with-automatic-tenant-publication)
- [MNA staff portal FAQ](https://resources.pcamna.org/resource/mna-staff-portal-faq/)
- [DonorHub financial information](https://www.tntware.com/donorhub/help/en/pages/financial_information.aspx)
- [MPDX mobile dashboard](https://help.mpdx.org/article/1100-mpdx-mobile-dashboard)
- [Virtuous Project Statements](https://support.virtuous.org/hc/en-us/articles/6466181015949-What-is-the-Project-Statements-Tab)
- [Modern Treasury transaction immutability](https://docs.moderntreasury.com/ledgers/docs/transaction-status-and-balances)
- [Modern Treasury prior-state verification](https://docs.moderntreasury.com/ledgers/docs/verify-prior-ledger-states)
- [Stripe finalization workflow](https://docs.stripe.com/invoicing/integration/workflow-transitions)
- [Stripe customer portal](https://docs.stripe.com/customer-management)
- [Section 508 accessible PDF guidance](https://www.section508.gov/create/pdfs/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
- [ADR-0073 — Immutable Support Cycle statements with automatic tenant publication](../../adr/0073-immutable-support-cycle-statements-with-automatic-tenant-publication.md)

### Remaining founder decisions

D12 settles the immutable source facts, post-close document handoff,
prospective tenant publication control, zero-routine-work staff operation,
missionary statement experience, access, correction, recovery, currency, and
cadence boundaries. It does not reopen D1-D11, create a Phase 19 statement run,
or make a statement authoritative for accounting, payroll, reimbursement
payment, or availability. Later Phase 21 decisions continue one at a time.

## D13 — Bounded prospective Expense Governance Profiles

**Founder ruling:** ratified on 2026-07-30.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one quiet, tenant-enabled
> Expense Program governed by immutable prospective Expense Governance Profile
> Versions: one guided Legal-Entity default plus bounded, explicit
> relationship-, jurisdiction-, Expense Policy Cohort-, certified
> expense-family-, purpose/project/grant-, and exact-claimant variants; one
> deterministic, code-ordered, non-stacking incurred-date winner for every
> exact Expense Claim Version item or split; separately versioned finite
> Expense Approval Routes resolved into immutable submission-time Approval
> Assignment Snapshots; human-only, conflict-free decisions with one ordinary
> independent reviewer, conditional project/finance/specialist review,
> governed delegation and reassignment, named independent small-tenant
> oversight, typed missing-evidence and policy-exception paths, clean-only
> consequence-previewed bulk approval, and D10’s unchanged line dispositions
> and append-only successor semantics; with exact ISO-currency thresholds,
> production-shaped activation proof, independently authoritative obligation,
> Field Account, payment, Phase 20, and QBO/Xero truth, and one accessible
> exception-first experience—without admin rule ordering, an arbitrary rules
> DSL or workflow graph, implicit FX, retroactive policy mutation, self-, AI-,
> timeout-, or automatic approval, broad evidence bypass, report-level
> approval, or accounting/payment authority.**

### Quiet activation and bounded tenant control

The Expense Program is **Off** by default for each exact Tenant and Legal
Entity. An organization that does not use Asym for expense review sees no
claimant module, setup warning, empty queue, dashboard card, recurring prompt,
or configuration requirement. Capturing receipts for another purpose cannot
silently activate expense governance.

Activation creates one immutable prospective **Expense Program Activation
Version**. It pins:

- Tenant, Legal Entity, business timezone, activation boundary, actor, and
  authority;
- the one guided Legal-Entity default Expense Governance Profile Version;
- the applicable bounded profile assignments and Expense Approval Route
  Versions;
- the exact supported ISO currencies, certified expense families,
  relationship and jurisdiction sources, claimant eligibility/admission
  contract, and tested coverage watermark;
- the evaluator, profile-schema, route-schema, and capability versions; and
- the complete preview, conflict, coverage, representative-fixture, and
  authorization proof accepted before activation.

The guided default is intentionally short:

`Claimant submits → one independent authorized reviewer`

The tenant chooses only the requirements it actually uses. Advanced variants
remain collapsed until the tenant adds a proved exception to the default.
Policy and route changes create future versions; they never edit an active
version, reinterpret a prior expense, or invalidate historical proof. Turning
the program off prevents new governed submissions after the effective boundary
but preserves claims, decisions, obligations, evidence, audit, and required
correction or payment truth.

### Domain model and independent authorities

D13 adds governance records around D10's existing claim-level source truth; it
does not create a second expense claim or report model:

| Record                             | Owns                                                                                                                                                               | Must not claim                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Expense Program Activation Version | Whether and when one Tenant × Legal Entity uses the governed expense program and the exact certified configuration admitted                                        | That any claim is eligible, approved, owed, funded, posted, or paid                             |
| Expense Governance Profile Version | A finite immutable policy contract: required facts/evidence, timing, eligibility, amount controls, exception treatment, and certified calculation references       | Reviewer identity, payment, accounting, or universal legal/tax correctness                      |
| Expense Governance Assignment      | The prospective, bounded scope that assigns one Profile Version                                                                                                    | Claim facts, approval, or an admin-authored priority                                            |
| Expense Governance Resolution      | The one exact incurred-date Profile Version and evaluator result for one Expense Claim Version item or split, including all matched assignments and conflict proof | Human approval, obligation, funding, payment, or accounting                                     |
| Expense Approval Route Version     | One finite authorized review shape, conditional step contract, role requirements, conflict rules, and exact-currency amount bands                                  | Current reviewer capability, a completed decision, or payment                                   |
| Approval Assignment Snapshot       | The exact submission-time route, required review steps, assigned identities or governed role resolutions, scopes, conflicts, and source versions                   | Permanent authorization, notification delivery, or approval                                     |
| Expense Review Action              | One human actor's immutable decision over exact Claim Version item/split coverage, authority proof, reason where required, and prior/successor lineage             | Approval outside its exact coverage or any downstream financial result                          |
| Expense Policy Decision            | D10's exhaustive `approved`, `needs_information`, `rejected`, or `excluded` dispositions, plus exact Resolution, Assignment Snapshot, and Review Action lineage    | A fifth exception status, report-level approval, obligation, Field Account capacity, or payment |

An **Expense Policy Cohort** is a stable, tenant-owned, prospectively versioned
membership used only when a real organization policy applies to a known group.
It is not a mutable tag query, saved CRM filter, job title string, donor
attribute, AI classification, or inferred worker category. Relationship and
jurisdiction come from D1's source-owned Expense Relationship Context at the
incurred date. Certified expense family is a code-owned semantic identity, not
a mutable QBO/Xero category or free-text merchant label.

Each placement is an immutable prospective **Expense Policy Cohort Membership
Version** with an exact effective interval and succession. The Activation
Version pins the eligibility/admission contract and the coverage watermark
proved at activation; it does not freeze a permanent claimant roster. A later
eligible claimant or membership change follows the admitted contract and
creates ordinary prospective membership evidence without replacing the
Expense Program Activation Version.

### Exactly one incurred-date policy winner

Resolution occurs independently for every exact current Expense Claim Version
item or purpose split. It always includes Tenant, Legal Entity, claimant,
incurred date, original ISO currency, Expense Relationship Context, certified
expense family, purpose/allocation, and exact source versions. A report is
never a resolution unit.

Assignments may constrain only this closed set:

- Legal-Entity default;
- relationship and/or source-owned jurisdiction;
- exact Expense Policy Cohort;
- certified expense family;
- exact charitable purpose, project, or restricted-grant authority; and
- exact claimant.

The resolver uses a code-owned specificity lattice. One matching assignment
outranks another only when its certified constraints are a strict superset of
the other's constraints. Exact scope identity and source versions—not labels,
row order, creation time, drag order, numeric priority, or database accident—
determine a match.

The unique maximally specific assignment wins. If several maximal assignments
resolve to the same Profile Version, they collapse to that one result. If
incomparable maximal assignments resolve to different profiles, only the
affected item or split becomes `governance_conflict`; the system shows the
conflicting scopes and the exact combined assignment needed to resolve it.
It never stacks profiles, silently chooses one axis over another, or rejects
the claimant's expense because of an admin conflict.

An immutable Expense Governance Resolution records all candidates, exclusions,
winning proof or conflict, evaluator version, and source identities. Resolution
is idempotent for the exact Claim Version item/split and fails closed when a
required relationship, jurisdiction, purpose, family, cohort, currency, or
default source is missing or stale.

### Finite policy catalog and unchanged D10 dispositions

An Expense Governance Profile Version composes only code-owned, versioned
policy modules. The launch catalog may support certified modules for:

- business-purpose and exact allocation requirements;
- receipt or other evidence requirements by exact same-currency amount
  threshold, including families that always require evidence;
- itemization, attendee, travel, mileage, per-diem, advance, personal-portion,
  missing-receipt declaration, or prior-authorization evidence where the
  tenant enables a certified module;
- submission timing and late-submission treatment;
- permitted, conditionally permitted, and ineligible certified expense
  families;
- exact item/split, Claim Version, daily, trip, or other explicitly certified
  amount bases; and
- purpose/project/grant compatibility and separately authorized exception
  review.

The catalog is additive and versioned. Asym does not provide arbitrary
expressions, scripts, formulas, regular expressions, webhook actions,
tenant-authored code, free-form workflow conditions, or provider/accounting
fields as policy truth. Mileage, per-diem, tax, or jurisdiction-sensitive
modules require a versioned tenant/adviser-confirmed source and production
certification; an unavailable module remains unsupported rather than guessed.

Governance findings use a closed explanatory classification:

1. **Information** — no decision barrier; explains a policy consequence.
2. **Needs information** — names the exact missing fact or evidence, responsible
   party, and recovery action; maps to D10 `needs_information`.
3. **Reviewer exception required** — an authorized human may approve only with
   the violated clause, permitted exception basis, reason, authority, and
   independent review preserved.
4. **Not eligible** — maps to D10 `rejected` or `excluded` according to the
   certified source meaning and creates no approved coverage.
5. **Structural safety block** — scope, conservation, stale-version,
   authorization, conflict, or integrity failure that no reviewer may waive.

`Reviewer exception required` is not a fifth line disposition and is not a
generic override. If the exception is granted, the exact D10 disposition is
still `approved`, with immutable exception evidence. If it is not granted, the
line remains `needs_information`, `rejected`, or `excluded` as applicable.
Missing evidence can use only a separately certified missing-evidence
declaration path; a broad **Approve anyway** or evidence-bypass permission is
forbidden.

### Policy time and approval-route time are different

The applicable Expense Governance Profile Version is selected by the expense's
source-owned **incurred date** in the Legal Entity's pinned business timezone.
This preserves the policy under which the cost occurred. A later profile
activation never silently changes an earlier expense.

The Expense Approval Route Version is selected when an immutable Expense Report
Submission is created because organizational reviewer authority may change
after the expense was incurred. The resulting Approval Assignment Snapshot
pins the exact route and required identities or role-resolution evidence at
that submission time.

The following temporal rules are binding:

- the first activation cannot silently govern earlier incurred expenses; a
  pre-activation expense may be captured but requires a typed, independently
  authorized pre-activation exception or remains outside Asym approval;
- changing incurred date, amount, currency, claimant, economic payer,
  relationship, jurisdiction, family, allocation, business purpose, required
  evidence, or another material source fact creates D10's successor Claim
  Version and a fresh Resolution;
- a successor submission uses its incurred-date policy and then-current
  submission-date route; no approval carries forward to changed coverage;
- an already-approved Snapshot remains immutable when policy, route, staff,
  cohort membership, project authority, or tenant labels later change;
- revoked or expired current authority prevents a decision even when the actor
  appeared in the submission-time snapshot; and
- reassignment or delegation appends a reasoned successor Assignment Snapshot.
  It does not mutate the original route, erase prior responsibility, or skip a
  required independent step.

### Finite human approval routes

The route catalog is code-owned and intentionally finite:

1. **One independent reviewer** — the guided default.
2. **Manager or project owner, then finance** — enabled only where the tenant's
   profile requires both responsibilities.
3. **Specialist or restricted-grant review** — applies only to the exact
   affected item/split and may feed a required final finance step.
4. **Named independent small-tenant oversight** — a tenant-approved officer,
   trustee, board member, or authorized external reviewer supplies the
   compensating review when ordinary segregation of duties is not feasible.

Profiles may use exact ISO-currency amount bands to select a certified route or
add a finite required step. They cannot create arbitrary nodes, loops,
conditional scripts, parallel graphs, hidden fallthrough, or admin-ordered
precedence. A route change receives the same preview and prospective-version
discipline as a policy change.

Human independence is non-waivable:

- a claimant cannot approve or exception-approve any coverage in which they
  have a financial interest;
- an interested manager, project owner, grant owner, delegated actor, or policy
  administrator cannot satisfy the independent step;
- AI, OCR confidence, duplicate confidence, policy evaluation, provider status,
  elapsed time, reminder exhaustion, or a scheduled job cannot approve;
- there is no automatic or timeout approval, including below an amount
  threshold;
- a broad `admin`, finance title, policy-edit capability, or evidence-access
  capability does not confer review authority; and
- assignment, evidence access, ordinary approval, exception approval,
  delegation, reassignment, and policy/route administration remain separate
  exact capabilities.

Delegation is prospective, scope-bounded, time-bounded, actor-authorized, and
audited. Reassignment requires a reason and preserves the prior assignment.
Unavailable or conflicted reviewers place only their exact work in a
`reviewer_assignment_required` exception. A reminder, email, or task delivery
is never authority and its failure cannot approve, reject, or lose the claim.

An authorized reviewer may use D10's **Approve clean claims** command. It
operates only over exact current versions whose governance is clean, required
human steps are satisfied by that actor, and consequences are homogeneous and
visible. The command splits incompatible Tenant, Legal Entity, claimant,
profile, route, currency, obligation treatment, and exception semantics. It
creates one independent Review Action and Policy Decision per exact coverage;
there is no report-level approval.

Line-level review may progress independently, but D10's whole-claim snapshot
barrier remains binding: no Approved Expense Snapshot exists for an Expense
Claim while any of its items or splits lacks a terminal disposition. Other
fully terminal clean claims in the same report may advance. Phase 20 receives
nothing for the incomplete claim until its exact terminal coverage is frozen.

### Exact amount and multi-currency semantics

Every amount, limit, threshold, and route band uses an ISO 4217 currency and
integer minor units. The profile pins the exact basis being tested, such as one
item/split, one single-currency Claim Version, or one certified daily/per-diem
unit. Zero-, two-, and three-decimal currencies use their exact certified
minor-unit behavior.

A threshold applies only to an amount in the same ISO currency. A profile may
contain an explicit per-currency threshold table, but it cannot reuse a naked
number across currencies, sum a mixed-currency report, compare a converted
dashboard total, or fetch a live exchange rate during review. A missing
currency row produces a clear policy-coverage exception; it never falls back to
the Legal Entity's display currency.

If a future certified policy module genuinely requires conversion, it must
consume one immutable externally owned conversion record with exact source and
target amounts, currencies, rate source, rate, rounding, effective instant,
actor/adapter, and coverage. D13 does not create an FX engine, converted grand
total, or authoritative base-currency expense fact.

### Failure, correction, and downstream boundaries

Policy evaluation is deterministic and local to canonical source facts. OCR,
AI, notification, QBO, Xero, payroll, AP, bank, or payment availability cannot
be a prerequisite for resolution or human review.

- A stale Claim Version, policy, route, assignment, relationship, capability,
  or evidence revision fails compare-and-set before a decision is created.
- Policy conflict, missing default, uncovered currency, absent reviewer, or
  restricted evidence affects only the smallest exact item/split or action.
  Clean independent claims continue.
- Partial persistence yields either no decision or one complete immutable
  decision/outbox result. Duplicate client or worker retries converge through
  semantic idempotency.
- Later correction follows D10 and the authority that owns the changed fact.
  D13 never edits an Approved Expense Snapshot, Reimbursement Obligation, Field
  Account occurrence, External Payment Occurrence, or Accounting Release.
- A reviewer departure, role change, delegation expiry, or security revocation
  appends a governed assignment succession and rechecks current authority.
- A policy defect is repaired prospectively. Affected historical decisions are
  identified and escalated; they are not bulk-rewritten under the new policy.

Approval may establish a Reimbursement Obligation only when the separately
applicable tenant policy or law says it does. Approval never proves Field
Account capacity, external scheduling, payment, accounting delivery, or final
books. Phase 20 receives only the PII-minimized Approved Expense Snapshot and
the exact governance/decision/exception lineage required by its existing
Accounting-Ready Expense Handoff. It receives no receipt bytes, policy
configuration, approval queue, mutable route, reviewer private data, or
authority to decide eligibility. QBO and Xero remain authoritative for posted
books and reconciliation.

### UX/UI contract

#### Missionary and claimant

- **Add expense** remains the primary entry. The form asks only requirements
  selected by the resolved policy and reveals conditional fields when they
  become relevant.
- A short **Why is this needed?** explanation states the tenant requirement in
  plain language. It does not expose rule identifiers, approval graphs,
  accounting codes, or legal conclusions.
- Requirements are checked while editing without blocking save, camera,
  offline capture, or the D10 manual path. The submission review shows exact
  source amount/currency, purpose, evidence, and unresolved items once.
- After submission, the claimant sees calm outcomes such as **Submitted**,
  **Needs information**, **In review**, **Approved**, or **Not approved**. A
  policy-configuration conflict reads **Finance is reviewing the setup for
  this expense**, not as claimant failure.
- A request deep-links to the exact item, missing requirement, due/follow-up
  behavior, and one clear response action. Changed source facts create a
  visible successor without erasing the earlier submission.
- Approval, amount threshold, or finance review never changes the D1 language
  for owed, funded, scheduled externally, payment confirmed, or paid.

#### Finance and reviewers

- The ordinary surface is one exception-first queue. Clean work shows the exact
  count and same-currency amount available to **Approve clean claims**; it does
  not require opening every receipt or rereading the policy.
- The review drawer keeps claimant-confirmed facts, source evidence, AI/OCR
  suggestions, applicable policy, findings, reviewer duties, obligation
  consequence, and downstream status visually separate.
- The primary action states the consequence, for example **Approve 8 USD claims
  totaling USD 642.18**. Mixed currencies, entities, policies, routes,
  exceptions, or consequences split before confirmation.
- Needs-information requests use a finite reason plus concise human note.
  Exception approval shows the exact clause, permitted basis, affected amount,
  required independent reviewer, and permanent audit effect.
- Assignment problems show one owner-labelled repair action. Governed
  reassignment does not ask staff to recreate the claim or route.
- Queue rows expose current owner, age, next action, and exact safe scope.
  Technical identifiers and full policy history remain in progressive
  disclosure.

#### Tenant administration

The ordinary setup is **Settings → Expenses** with four plain-language steps:

1. **Who can submit?**
2. **What is required?**
3. **Who reviews?**
4. **Review and turn on**

The preview says who and what will change, when the version starts, unresolved
coverage, route conflicts, currencies without thresholds, self-interest or
missing-reviewer risks, and representative examples. **Test with examples**
uses production-shaped tenant-safe fixtures and may simulate selected real
draft facts without creating a decision, Snapshot, obligation, or notification.

After activation, the summary presents the Legal-Entity default first:
**Most expenses use this policy and one reviewer.** Variants appear as compact
**Applies to** cards only when configured. Adding a variant requires a
consequence preview and conflict simulation; admins never arrange rule order or
draw a workflow. Version history, exact sources, and technical proof remain
available under **Policy history**.

Policy authoring, route authoring, activation, cancellation, claimant/cohort
assignment, reviewer assignment, delegation, reassignment, ordinary decision,
exception decision, private-evidence access, and protected audit retrieval are
separately authorized. Every destructive-looking action states whether it
affects drafts, future incurred expenses, already-submitted work, or only
future submissions. No healthy claim produces an administrative task.

All three experiences use product design tokens, semantic HTML, keyboard and
screen-reader operation, visible focus, non-color state, text errors,
announced asynchronous changes, touch targets, 320-CSS-pixel reflow, and 400%
zoom. Policy explanation remains available in text and is never encoded only
in icons, color, position, hover, or an inaccessible receipt image.

### Required edge-case outcomes

- A one-claim submission uses the guided default without report-management or
  route-selection ceremony.
- Different items or purpose splits in one report may resolve to different
  profiles and routes; each remains independently reviewable and conserving.
- Incomparable matching assignments never use creation order. Same-profile
  matches collapse; conflicting profiles produce one actionable setup conflict.
- Unknown relationship, jurisdiction, expense family, cohort, purpose, grant,
  currency, or claimant assignment never falls through to a permissive policy.
- A claimant who is also manager, project owner, finance staff, administrator,
  delegate, or trustee cannot satisfy their own independent review.
- A small tenant may name independent oversight without buying or configuring
  an enterprise workflow graph.
- Reviewer departure, leave, delegation expiry, account disablement, and route
  replacement preserve assignment history and do not strand or auto-approve.
- Late submission, missing receipt, pre-activation expense, personal split,
  per-diem, mileage, advance, refund, negative correction, and changed evidence
  follow typed certified behavior or remain clearly unsupported.
- Mixed currencies remain separate; unsupported currency does not borrow a
  threshold or route band from another currency.
- Bulk approval skips stale, conflicted, exception-bearing, self-interested,
  mixed-consequence, or unauthorized coverage and identifies exactly why.
- Policy exception cannot waive structural scope, currency conservation,
  immutable history, tenant isolation, current authorization, or independent
  review.
- Phase 20, QBO/Xero, payroll/AP, external payment, and Field Account outages do
  not change expense-governance truth.

### D13 adversarial review

Every requested category has a concern:

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                               | Severity | Likelihood  | Permanent prevention                                                                                                                                    |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Rules tied to mutable labels, one current manager, report state, rule order, or one currency break when organization, claimant, policy, or expense context changes.  | Critical | High        | Stable semantic scopes, incurred-date immutable profiles, submission-time assignments, exact-currency rules, and fail-closed deterministic resolution.  |
| Technical debt                    | Yes      | Feature-local conditions, mutable policy rows, duplicated approval logic, or exception flags create contradictory historical decisions and expensive migrations.     | Critical | High        | One versioned profile/evaluator contract, one finite route catalog, immutable lineage, closed findings, and additive certified modules.                 |
| Edge cases                        | Yes      | Split purposes, late claims, missing evidence, personal portions, reviewer turnover, policy changes, uncommon currencies, and intersecting scopes defeat naive flow. | Critical | High        | Per-item/split resolution, successor versions, typed exceptions, assignment succession, same-currency thresholds, and exhaustive fixtures.              |
| Footguns                          | Yes      | Rule dragging, broad **Approve anyway**, self-approval, timeout approval, copied thresholds, or report-level actions can create improper obligations.                | Critical | High        | No admin ordering or generic override; exact previews; separate capabilities; human independent review; no automatic, timeout, or report approval.      |
| Tenant safety                     | Yes      | Profiles, cohort membership, reviewer assignments, evidence, bulk actions, caches, or jobs may cross Tenant, Legal Entity, claimant, purpose, grant, or currency.    | Critical | Medium-high | Structural scope, RLS/PEP reauthorization, exact assignment scope, tenant-fair workers, pre-enumeration checks, and negative isolation tests.           |
| Over-engineering                  | Yes      | A rules DSL, workflow graph, universal tax engine, FX engine, or AP/accounting subsystem recreates enterprise expense and accounting products.                       | High     | High        | Guided default, bounded variants, finite modules/routes, adviser-owned policy meaning, external payment/accounting authority, and explicit exclusions.  |
| UX/UI and user friction           | Yes      | Repeated policy questions, report ceremony, noisy queues, technical errors, route diagrams, and excessive confirmations drive missionaries and finance off-system.   | High     | High        | Requirement-at-entry, progressive disclosure, one guided setup, clean bulk review, exception-first queues, plain language, and accessible recovery.     |
| Hidden coupling                   | Yes      | Current staff roles can rewrite history; policy can depend on QBO categories; notification can become authority; funding/payment can leak into approval.             | Critical | High        | Separate temporal contracts and authorities, source-owned context, provider-neutral semantics, immutable snapshots, and typed projections only.         |
| Failure modes                     | Yes      | Stale approval, partial persistence, lost notification, orphan reviewer, resolver conflict, or retry after uncertainty can show false success or duplicate action.   | Critical | Medium-high | CAS, semantic idempotency, atomic decision/outbox, inspect-before-retry, assignment succession, owner-labelled exceptions, and no notification truth.   |
| Data integrity risks              | Yes      | Overlapping profiles, stale Claim Versions, duplicate coverage, FX/rounding drift, or mutable exception evidence can approve the wrong amount twice.                 | Critical | High        | Unique exact coverage, specificity proof, integer minor units, immutable versions/actions, conservation constraints, and append-only correction.        |
| Security and privacy risks        | Yes      | Broad approver access can reveal receipts, restricted-worker travel, grant data, or another claimant; policy administration may imply evidence access.               | Critical | High        | Least-privilege exact capabilities, private short-lived evidence access, conflict checks, redacted audit, classification controls, and access logging.  |
| Scalability and performance risks | Yes      | Evaluating arbitrary rules or full history, loading every receipt, and tenant-wide locks fail at month-end and create noisy-neighbor delays.                         | High     | Medium-high | Precompiled profile versions, indexed bounded resolution, item-level concurrency, keyset queues, asynchronous evidence, quotas, and certified load.     |
| Operational burden                | Yes      | Bespoke policies, constant reassignment, per-claim finance review, manual conflict discovery, and policy archaeology create hidden specialist work.                  | High     | High        | One default, optional variants, simulation, governed delegation, clean bulk approval, cause-owned exceptions, and readable version history.             |
| Observability gaps                | Yes      | Staff cannot distinguish claimant wait, policy conflict, reviewer wait, approval, obligation, funding, payment, or accounting without exposing sensitive data.       | High     | High        | Separately correlated states; safe scope, owner, reason, age, objective, and next-action telemetry; protected drill-down and audit retrieval.           |
| Dependency and integration risks  | Yes      | Mutable HR, project, grant, identity, accounting, AI, or provider data can silently reroute or reinterpret a claim.                                                  | Critical | Medium-high | Source-version pinning, provider-neutral policy semantics, capability certification, drift detection, manual continuity, and independently owned truth. |
| Migration and upgrade risks       | Yes      | New policy modules, route shapes, currencies, jurisdictions, or role models may make old decisions unreadable or accidentally retroactive.                           | High     | Medium-high | Versioned canonical schemas/evaluators, preserved interpreters, portable manifests, prospective activation, cohort proof, and no destructive migration. |
| Other development hazards         | Yes      | Double submit, edit/approve races, clock and timezone bugs, integer overflow, unsafe rollout, weak rollback, or missing tests can corrupt financial decisions.       | Critical | High        | Server-derived keys, CAS/uniqueness, pinned business timezone, checked arithmetic, outbox, feature fences, canaries, fault/property/mutation testing.   |

### Required production proof

1. Activation tests prove an Off tenant has no claimant/admin/reviewer surface
   or task, and an enabled Tenant × Legal Entity has exactly one complete
   prospective default with no retroactive decision.
2. Resolver property tests cover every supported scope and combination,
   arbitrary insertion order, same-profile collapse, incomparable conflicts,
   missing sources, and exact item/split isolation. Exactly one winner or one
   explicit conflict is possible; stacking is impossible.
3. Temporal tests prove incurred-date policy, submission-date route,
   successor-submission reevaluation, prospective profile/route/cohort changes,
   immutable approved history, and pinned Legal-Entity timezone behavior.
4. Policy-catalog tests cover every certified requirement, evidence threshold,
   timing rule, eligibility outcome, exception basis, warning, hard block, and
   unsupported combination without falling into a generic rule interpreter.
5. D10 compatibility tests prove the only final line dispositions remain
   `approved`, `needs_information`, `rejected`, and `excluded`; exceptions
   preserve reasoned approval evidence rather than adding a fifth status. They
   also prove no Approved Expense Snapshot or Phase 20 handoff exists for a
   claim while any item or split remains nonterminal or needs information.
6. Segregation-of-duties tests cover claimant-as-manager, project owner,
   finance reviewer, administrator, delegate, trustee, evidence custodian, and
   exception approver; no interested actor satisfies independent review.
7. Human-only tests prove AI output, OCR confidence, policy result, duplicate
   score, amount threshold, timer, reminder, job, webhook, or provider response
   can never create approval. There is no automatic or timeout approval path.
8. Assignment tests cover current capability recheck, reviewer departure,
   disablement, leave, scoped delegation, expiry, reassignment, conflicted
   reviewer, missing reviewer, notification loss, and immutable succession.
9. Bulk-command tests prove **Approve clean claims** operates on exact current
   homogeneous coverage, presents consequences, splits incompatible scopes,
   skips exceptions/stale versions, and creates independent decisions.
10. Currency property tests cover zero-, two-, and three-decimal currencies,
    negative corrections, boundary values, overflow, rounding, missing
    currency rows, mixed reports, and no implicit conversion or converted total.
11. Race and failure injection before and after resolution, submission,
    assignment, decision, Snapshot, obligation, and outbox persistence yields
    zero or one complete inspectable effect and safe idempotent recovery.
12. Isolation tests cover Tenant, Legal Entity, claimant, relationship,
    jurisdiction, cohort, expense family, purpose/project/grant, currency,
    profile, route, assignment, evidence, queue, cache, job, and audit before
    enumeration.
13. Evidence-security tests prove review access is exact, purpose-bound,
    short-lived, audited, revocable, and independent from policy or route
    administration; denied evidence never leaks through previews or errors.
14. Phase 20 contract tests prove only the PII-minimized approved lineage
    crosses the doorway and that policy config, routes, receipt bytes, AI
    suggestions, queues, and reviewer private data cannot enter Accounting
    Posting Intent or Accounting Release truth.
15. Production-shaped load tests prove indexed bounded resolution, responsive
    claimant forms and reviewer queues, tenant fairness, backpressure, bounded
    memory, and no tenant-wide lock or full-history scan at close periods.
16. Representative usability tests prove a small tenant can activate the
    guided default without specialist help; a complex tenant can add and
    explain a variant; claimants know what to provide; and reviewers correctly
    distinguish clean work, needs information, exceptions, approval, owed,
    funded, and paid.
17. Accessibility tests cover keyboard, screen reader, visible focus,
    announced updates, non-color status, text errors, 320-CSS-pixel reflow,
    400% zoom, touch targets, evidence alternatives, and error prevention for
    activation, bulk decisions, exceptions, delegation, and reassignment.
18. Portability tests export stable profile, assignment, resolution, route,
    snapshot, review, policy-decision, exception, and successor identities with
    exact versions and digests but no secrets, raw evidence, unrelated PII, or
    provider-specific authority.
19. Migration and rollback drills prove a bad profile or route is stopped
    prospectively, prior versions remain executable/readable, affected work is
    discoverable, and no historical decision is silently recomputed.
20. Release is blocked if any path allows admin-ordered policy precedence,
    arbitrary executable rules, profile stacking, implicit FX, retroactive
    mutation, self-, AI-, timeout-, or automatic approval, broad evidence
    bypass, report-level approval, direct downstream posting, or a false
    `funded`, `paid`, `synced`, or `reconciled` claim.

### Evidence

- [D13 bounded prospective Expense Governance Profiles
  research](./phase-21-mission-dashboard-product-research-evidence.md#d13-ratified-direction-bounded-prospective-expense-governance-profiles)
- [IRS Publication 463 — accountable-plan
  requirements](https://www.irs.gov/publications/p463)
- [Reliant accountable reimbursement
  plan](https://solomon.reliant.org/plugins/viewsource/viewpagesrc.action?pageId=185927098)
- [Reliant reimbursement standards and late-submission
  treatment](https://solomon.reliant.org/plugins/viewsource/viewpagesrc.action?pageId=185927425)
- [Ramp guided expense-policy
  setup](https://support.ramp.com/getting-started-with-ramps-expense-policy-setup/)
- [Ramp reimbursement setup and required
  fields](https://support.ramp.com/reimbursements-set-up/)
- [Expensify report approval
  workflows](https://help.expensify.com/articles/expensify-classic/reports/Create-a-report-approval-workflow)
- [Brex approval chains](https://www.brex.com/support/approval-chains)
- [Brex policy rule evaluation](https://www.brex.com/support/policy-rule-builder)
- [SAP Concur audit-rule
  conditions](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/1d134df937b240f8a584a744b9e875ae.html)
- [UK Charity Commission internal financial
  controls](https://www.gov.uk/government/publications/internal-financial-controls-for-charities-cc8/internal-financial-controls-for-charities)
- [WCAG 2.2 error prevention for legal, financial, and data
  actions](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [ADR-0074 — Bounded prospective Expense Governance
  Profiles](../../adr/0074-bounded-prospective-expense-governance-profiles.md)

### Remaining founder decisions

D13 settles the tenant expense-policy catalog, deterministic applicability,
prospective policy and approval-route versioning, finite human approval
topology, segregation of duties, typed exceptions, exact-currency amount
controls, activation proof, and claimant/reviewer/admin experience that D10
left open. It does not reopen D1-D12, authorize automatic approval, initiate
reimbursement payment, replace external payroll/AP, or make Asym a tax engine,
FX engine, accounting system, or general workflow builder. Organization-card
evidence and the external reimbursement-payment handoff remain later founder
decisions at this point in the log. Later Phase 21 decisions continue one at a
time.

## D14 — File-first organization-card transaction evidence

**Founder ruling:** ratified on 2026-07-31.

Phase 21 adopts:

> **B-prime-amended-and-hardened (B-prime-R) — one optional,
> organization-card-only, machine-readable statement/file-first Card
> Transaction Evidence product over the complete manual Expense Claim path;
> using one Tenant-, Legal-Entity-, Organization-Card-Source-,
> billing-currency-, and immutable Source-Profile-scoped staged CSV import lane;
> with certified or bounded tenant-reviewed prospective layouts, exact file and
> source-occurrence idempotency, overlap-aware classified preview, atomic
> manifest acceptance with only structurally safe rows advancing, immutable
> source revisions and append-only correction, explicit effective-dated card
> assignments, posted/source-final purchases and separately typed adverse
> evidence, exact same-currency business/personal/unresolved conservation,
> secure PAN-minimized private artifacts, quiet camera-first claimant work,
> cause-grouped finance exceptions, and Phase-20-only accounting handoff while
> issuer settlement, personal repayment, card-liability payment, external
> payment, and QBO/Xero reconciliation remain independently
> authoritative—without personal-card batch browsing, pending-as-final
> evidence, PDF/OCR/XLSX-derived financial truth, heuristic auto-deduplication,
> destructive undo, automatic approval or reimbursement, raw card data, or
> false synced, paid, settled, available, or reconciled claims.**

### Authority and launch boundary

Card Transaction Evidence is optional and **Off** until an authorized tenant
creates and activates one exact Organization Card Source for one Legal Entity.
An Off tenant sees no setup warning, empty queue, claimant task, dashboard card,
or configuration requirement. D10's complete manual Expense Claim and Receipt
Evidence path remains available whether or not D14 is enabled, interrupted, or
later retired.

D14 is intentionally narrower than a bank feed or generic import framework.
“Statement/file-first” is the ratified option label only; product UI uses
**Upload card activity**, **Organization card activity file**, and
**Organization Card Transaction Evidence**, never a bare **Statement** label:

- launch financial truth comes only from a machine-readable CSV file admitted
  through a certified or bounded tenant-reviewed Organization Card Import
  Profile Version;
- a PDF statement may be retained as restricted supporting evidence, but its
  text, OCR, AI output, or visual layout cannot create financial facts;
- XLS/XLSX, OFX/QFX, image, scanned statement, screen scrape, email-body, and
  free-form pasted rows are not authoritative D14 launch inputs;
- only organization-controlled card activity is in scope; personal-card
  purchases continue through D10's claimant-private manual path, and staff
  never browse a missionary's unrelated personal transactions;
- the D14 lane is a card-specific source adapter, not Phase 15's offline-gift
  intake or Phase 30's future general import product; and
- live issuer or aggregator adapters remain future certified source adapters
  over the same evidence contract. File import does not claim live-feed,
  pending-authorization, webhook, issuer-settlement, or connection semantics.

One Organization Card Source may cover multiple physical or virtual cards only
when every admitted row contains an exact safe card identity sufficient to
resolve the applicable effective-dated assignment. A source that cannot
distinguish its cards remains finance-only until the ambiguity is resolved.

### Durable records and independent truth

| Record                                         | Owns                                                                                                                                                                                                                                  | Must not claim                                                                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization Card Source                       | The exact Tenant, Legal Entity, issuer/program label, billing currency, safe account/card namespace, source status, and source-profile lineage admitted to D14                                                                        | Claimant identity, expense approval, issuer balance, card-liability payment, settlement, accounting, or reconciliation                                                       |
| Organization Card Import Profile Version       | One immutable prospective parser/mapping/finality contract for a recognizable CSV header/format, sign convention, date convention, billing-currency behavior, safe card identity, and source-occurrence identity tier                 | That a mapped row is true, approved, unique, paid, or reconciled                                                                                                             |
| Organization Card Activity File Asset          | The private identity of the original CSV and optional supporting PDF whose Phase 21 meaning and Phase 29-compatible byte/access lifecycle remain purpose-separated                                                                    | Receipt Evidence, public statement, OCR truth, reusable spreadsheet, or accounting artifact                                                                                  |
| Organization Card Activity Import Manifest     | The immutable file digest, source/profile versions, uploader, import time, row provenance, classified preview, control totals, accepted coverage, excluded or exceptional coverage, and exact outcome                                 | A mutable batch, a delete/replace instruction, statement reconciliation, or all issuer history                                                                               |
| Organization Card Transaction Evidence Version | The source-attributed, append-only evidence for one exact organization-card purchase or typed Organization Card Source Adjustment Evidence reported as posted under the pinned import-profile finality contract                       | Expense Claim, policy decision, Reimbursement Obligation, Field Account effect, issuer settlement, card-liability payment, Phase 20 delivery, or QBO/Xero truth              |
| Organization Card Assignment Version           | The explicit prospective/effective-dated routing link between one safe card identity and one exact authorized claimant Party under its source-owned relationship context, or a finance queue, within the same Tenant and Legal Entity | Ownership of the underlying card account, worker classification, proof the person made a purchase, historical retargeting, or permission to view another claimant's activity |
| Organization Card Evidence Coverage            | The immutable same-billing-currency conservation connecting source evidence to exact business Expense Claim Version item/split coverage, nonbusiness/personal portion, and unresolved remainder                                       | Automatic duplicate proof, receipt sufficiency, policy compliance, approval, repayment, payment, or accounting                                                               |

Typed Organization Card Source Adjustment Evidence covers refund, refund
reversal, dispute, dispute reversal, fee, source correction, or certified source
removal without overloading D11's Field Account adverse-correction vocabulary.
An unlinked adjustment remains source evidence; it becomes a downstream
correction only when exact affected coverage exists.

An Organization Card Transaction Evidence Version preserves the exact
issuer-posted billing amount and ISO currency in integer minor units, source
dates, safe merchant/source
descriptor, safe card token or last four where provided, exact source
occurrence identity tier, source-profile and manifest provenance, and every
material source revision. Original merchant amount/currency and issuer-supplied
conversion or fee evidence are optional attributed provenance, never an
inferred rate or Phase 21 FX result. Ordinary facts store only opaque
source/card identifiers and masked display metadata. An upload containing
unmasked PAN, CVV/CVC, PIN or track data, or credentials fails acceptance, is
quarantined, and follows bounded secure disposal and incident handling.

D10 remains the claimant-authored business-purpose, receipt, itemization,
allocation, and economic-payer truth. D13 remains policy and human approval
authority. An organization-paid card occurrence cannot create a Reimbursement
Obligation merely because it was imported, attached, or approved as a business
expense. A personal/non-business portion records classification only; any
collection or repayment remains separate external truth.

Phase 20 receives only its existing PII-minimized Accounting-Ready Expense
Handoff after D10/D13 produce an eligible Approved Expense Snapshot. Phase 20
alone compiles Accounting Releases and delivers to QBO/Xero. QBO/Xero and the
bookkeeper remain authoritative for native card/bank matching and final
reconciliation; the issuer remains authoritative for its statement, account,
settlement, and liability balance.

### Staged import, identity, and correction

The first import is one guided review:

1. **Identify source** — Legal Entity, organization card program, billing
   currency, coverage label, and file.
2. **Confirm mapping** — mapped fields, sign convention, dates, currency,
   source identity, safe card identity, and representative classified rows.
3. **Assign new cards** — only safe card identities without a proved
   effective assignment; existing assignments are read-only in the ordinary
   flow.
4. **Review consequences** — new occurrences, exact repeats, possible
   overlaps, source revisions, unassigned cards, invalid rows, claimant tasks,
   same-currency control totals, and no-effect rows.
5. **Import** — one background operation persists the immutable manifest and
   all admitted rows or no manifest acceptance at all.

Recurring imports reuse the exact Organization Card Import Profile Version and
active Organization Card Assignment Versions and normally require only
**Upload → Review → Import**.
Header, format, sign, date, currency, identity, or source drift reopens only the
affected mapping proof; it never silently mutates the active version.

Identity is deliberately tiered:

- an exact source-owned occurrence identifier within the exact Organization
  Card Source is authoritative for source identity;
- the exact file-convergence scope is Tenant, Legal Entity, Organization Card
  Source, Organization Card Import Profile Version, and file digest; a repeat
  is an immediate visible no-op linked to the prior manifest;
- cross-file convergence is authoritative only when the certified source
  supplies a stable issuer/export occurrence identifier;
- otherwise the exact row identity is the immutable manifest, row ordinal, and
  row digest; and
- merchant, card, date, amount, description, or OCR similarity is only a
  **Possible overlap** suggestion. It cannot merge, consume, delete, approve,
  or suppress a distinct occurrence.

When source identity is absent, two same-day, same-amount purchases remain
separate unless an authorized reviewer explicitly records **Same source
occurrence** after side-by-side evidence. The alternative action is **Separate
purchases**, not a generic **Merge**.

Structural defects—wrong source, missing required columns, ambiguous currency,
unbounded row/column counts, parser-profile mismatch, unsafe file type,
malware, or broken control-total contract—block the whole manifest before
acceptance. Row-local defects remain immutable classified rows on the accepted
manifest while structurally safe new rows advance once. The outcome says
**Imported with exceptions** and names accepted, no-effect, and unresolved
counts; it never says partially synced.

Accepted evidence is never destructively undone. A wrong assignment, mapping,
source field, purchase, refund, dispute, or prior human identity decision
creates a scoped successor, correction, or typed Organization Card Source
Adjustment Evidence with exact lineage. Historical claimant exposure is
contained immediately where required, but the original evidence and audit
remain.

### Conservation and claimant work

For every purchase reported as posted under the pinned Organization Card Import
Profile Version's finality contract in one ISO currency:

`source amount = business portions + personal/non-business portion + unresolved remainder`

Every term uses exact integer minor units and the source currency. Submission
requires a zero unresolved remainder. Refunds, reversals, disputes, fees,
corrections, and source removals are separately typed signed Organization Card
Source Adjustment Evidence and never overwrite or silently net the purchase
away.

Import, assignment, evidence linkage, nonbusiness/personal classification, and
expense approval create no Field Account Funding Coverage or Field Account
Occurrence. Those effects require their independently authorized D1/D10
commands and later Support Cycle coverage.

Only an assigned charge reported as posted under that pinned finality contract
and missing claimant-authored D10/D13 facts creates missionary work. The
ordinary mobile card is:

> **Add receipt and details**
> THB 1,420.00 at Example Hotel · Visa • 4821 · 28 Jul

Opening it shows a compact read-only **Posted card charge** header, source
merchant, source amount/currency, posted date, safe card label, import
provenance, and **Not my charge**. The normal completion path is one receipt
photo, one short business purpose, only conditional D13 requirements, optional
business/personal or purpose split, and **Save draft** or **Submit**. A global
camera capture may suggest a match, but the claimant must confirm **Attach to
this charge** unless exact source identity already establishes the link.
Interrupted or offline capture preserves a local draft and plainly states when
upload remains pending.

The default missionary surface does not display import machinery, source
profiles, control totals, issuer settlement, card liability, or accounting.
Valid claimant labels include **Posted card charge**, **Needs receipt**,
**Needs details**, **Ready to submit**, **Submitted**, **Needs information**,
and D13-owned **Approved** or **Not approved**. It never labels statement/file
evidence **Pending** and never derives **Paid**, **Reimbursed**, **Available**,
**Deducted**, **Settled**, **Synced**, or **Reconciled**.

### Quiet finance and admin experience

Finance uses one **Card activity** workspace:

- **Needs attention** is the default and contains only cause-owned work;
- **All activity** exposes authorized evidence history; and
- **Imports** exposes source manifests, classified outcomes, and recovery.

Fixed attention reasons include **Needs cardholder**, **Claimant says “not my
charge”**, **Possible overlap**, **Source row changed**, **File/layout issue**,
**Claimant details overdue**, **Personal portion follow-up**, **Refund or
correction**, and **Coverage gap**. Each item shows cause, owner, age, affected
count, same-currency amount, and one next safe action. A common parser or
mapping problem creates one cause-level case with affected-row drill-down, not
hundreds of tasks.

Safe bulk actions are limited to one previewed effective card assignment,
homogeneous reminders, acknowledging one resolved file-level cause, or
downloading an injection-safe error list. Bulk fuzzy matching, possible-overlap
merging, unrelated-card reassignment, personal classification, expense
approval, repayment, accounting delivery, and reconciliation declarations do
not exist.

All import, review, and recovery surfaces use product design tokens, semantic
HTML, native or established Base UI behavior, visible focus, text-linked
errors, non-color state, resumable progress, appropriately announced status,
keyboard operation, screen-reader relationships, 320-CSS-pixel reflow, 400%
zoom, and usable touch targets. The consequence preview is the single
review-and-correct opportunity for the consequential import action; ordinary
navigation does not add repeated confirmation dialogs.

### Required edge-case outcomes

- An identical file in the same source scope produces **No new rows**, zero
  claimant tasks, and a link to the prior import.
- A corrected file after one row-local failure admits only the repaired or new
  coverage; accepted occurrences are not replayed.
- Two genuine same-day, same-merchant, same-amount purchases are not silently
  collapsed.
- A reused issuer transaction identifier outside the exact source namespace
  does not collide.
- A shared, replacement, reassigned, terminated-worker, unknown, or
  overlapping card assignment exposes nothing to the wrong claimant and
  affects only the explicit effective interval.
- A claimant's **Not my charge** response quarantines claimant exposure and
  routes the assignment question to finance without deleting the occurrence.
- A changed merchant descriptor, tip-adjusted amount, refund, dispute, source
  correction, or negative row appends typed evidence and preserves prior
  versions.
- Missing currency, ambiguous decimal/date/sign convention, duplicate headers,
  embedded newlines, BOM/encoding differences, empty lines, huge fields,
  spreadsheet formulas, control characters, and CSV injection are handled
  deterministically and never become executable output.
- A PDF or OCR result cannot create, change, or repair an occurrence; staff
  correct the machine-readable source or use an explicit manual D10 claim.
- A clean import and complete claims create no finance queue work.
- Phase 20, QBO/Xero, issuer, object-storage, notification, or AI outage does
  not mutate accepted D14 source evidence or D10/D13 claim truth.

### D14 adversarial review

Every requested category has a concern:

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                         | Severity | Likelihood  | Permanent prevention                                                                                                                                                                               |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | One issuer layout, mutable headers, assumed cardholder columns, one date/sign convention, or “one row equals one final purchase” breaks with real statements.  | Critical | High        | Immutable Organization Card Import Profile Versions, classified preview, explicit identity tiers, bounded parser grammar, drift detection, and manual-claim continuity.                            |
| Technical debt                    | Yes      | Feature-local CSV parsing, duplicated matching, mutable imports, or a hidden generic importer creates incompatible history and expensive rewrites.             | Critical | High        | One card-specific evidence contract, shared safe primitives only, immutable manifests/revisions, closed state catalog, and documented Phase 15/30 boundaries.                                      |
| Edge cases                        | Yes      | Tips, credits, refunds, disputes, shared cards, reassignment, duplicate-looking purchases, locale ambiguity, and corrected files defeat naive import.          | Critical | High        | Typed Organization Card Source Adjustment Evidence, exact intervals, same-currency conservation, no fuzzy authority, row provenance, and exhaustive fixtures.                                      |
| Footguns                          | Yes      | Staff can map the wrong sign/currency, reassign history, merge a real purchase, approve on import, or export executable spreadsheet cells.                     | Critical | High        | Consequence preview, prospective assignments, exact no-op keys, append-only repair, restricted bulk actions, and formula-safe exports.                                                             |
| Tenant safety                     | Yes      | Files, rows, assignments, tasks, evidence, caches, or jobs can cross Tenant, Legal Entity, source, card, claimant, or currency.                                | Critical | Medium-high | Structural composite scope, fail-closed projection/RLS, authorization before enumeration, scope-keyed idempotency, and substitution tests.                                                         |
| Over-engineering                  | Yes      | Multiple live adapters, PDF/OCR financial truth, a generic mapping DSL, issuer ledger, repayment engine, or reconciliation workspace recreates other products. | High     | High        | CSV-only launch truth, bounded profiles, optional feature, manual path, future certified adapters, and explicit external authorities.                                                              |
| UX/UI and user friction           | Yes      | Repeated mapping, noisy healthy rows, technical errors, duplicated data entry, and lost mobile receipts drive users off-system.                                | High     | High        | Map once, assign once, exception-first finance, camera-first claimant work, plain outcomes, resumable drafts, and progressive disclosure.                                                          |
| Hidden coupling                   | Yes      | Card evidence can become a claim, assignment can become authorization, approval can become reimbursement, or import can become accounting truth.               | Critical | High        | Separate records, commands, status machines, dates, coverage, projections, and explicit Phase 20 handoff only.                                                                                     |
| Failure modes                     | Yes      | Upload, parse, commit, storage, notification, or retry can fail between rows and create duplicates, missing tasks, or false success.                           | Critical | Medium-high | Staged parsing, atomic manifest acceptance, semantic idempotency, durable outbox/work, truthful counts, and inspect-before-retry.                                                                  |
| Data integrity risks              | Yes      | Weak dedupe, mutable amounts, partial manifests, overlapping assignments, rounding, or destructive undo can corrupt financial coverage.                        | Critical | High        | Exact identity tiers, immutable amounts/versions, checked minor-unit arithmetic, unique coverage, CAS, conservation, and append-only correction.                                                   |
| Security and privacy risks        | Yes      | Malicious files, spreadsheet formulas, full PAN, broad staff access, personal-card browsing, or receipt leakage can expose sensitive data.                     | Critical | High        | Allowlisted CSV, size/row limits, malware scanning, neutralized exports, rejection and quarantine of unmasked PAN or sensitive authentication data, private artifacts, least privilege, and audit. |
| Scalability and performance risks | Yes      | Large files, quadratic overlap matching, full-history scans, per-row jobs, or tenant-wide locks fail at month-end.                                             | High     | Medium-high | Streaming/bounded parse, indexed exact keys, bounded candidate windows, set-based writes, cause grouping, backpressure, and tenant fairness.                                                       |
| Operational burden                | Yes      | Every file needs remapping, each invalid row creates a ticket, and provider drift requires developers.                                                         | High     | High        | Prospective reusable profiles, representative preview, cause-level exceptions, tenant-safe correction, readable diagnostics, and health telemetry.                                                 |
| Observability gaps                | Yes      | Staff cannot distinguish no-op, invalid, unassigned, overlap, source revision, claimant wait, approval, accounting, or issuer state.                           | High     | High        | Separate correlated states; safe source/profile/manifest IDs; counts, reason, owner, age, watermark, and next-action telemetry.                                                                    |
| Dependency and integration risks  | Yes      | Issuer formats, spreadsheet behavior, object storage, malware tooling, QBO/Xero semantics, or future adapters change.                                          | High     | High        | Provider-neutral source truth, versioned profiles, capability certification, artifact/manual continuity, and independent downstream authority.                                                     |
| Migration and upgrade risks       | Yes      | Parser/schema changes can reinterpret history, collide IDs, lose row provenance, or make old imports unreadable.                                               | High     | Medium-high | Versioned canonical schemas/parsers, preserved interpreters, stable opaque IDs, portable manifests, additive readers, and no destructive migration.                                                |
| Other development hazards         | Yes      | Double confirm, concurrent imports, hash misuse, timezone bugs, integer overflow, unsafe rollout, or weak rollback can duplicate or misdate evidence.          | Critical | High        | Server-derived keys, cryptographic digests with scoped uniqueness, CAS/advisory fences, pinned date semantics, checked arithmetic, canaries, and fault/property tests.                             |

### Required production proof

1. Off-by-default tests prove an unactivated Tenant × Legal Entity has no
   D14 surface or task while D10 manual claims remain complete.
2. Parser contract tests cover the bounded CSV grammar, BOM/encoding, quoting,
   delimiters, embedded newlines, empty rows, duplicate headers, locale/date/
   decimal/sign conventions, zero-/two-/three-decimal currencies, limits,
   unsafe types, malware, formula injection, and sanitized exports.
3. Organization Card Import Profile Version tests prove first-time mapping,
   representative preview, prospective activation, drift detection, immutable
   succession, and no historical reinterpretation.
4. Identity property tests prove exact source/file/row repeats are no-ops,
   source namespaces do not collide, possible overlap never auto-deduplicates,
   and two genuine duplicate-looking purchases survive.
5. Import transaction and failure-injection tests prove structural errors
   commit nothing; an accepted manifest, its safe occurrences, row provenance,
   classified remainder, audit, and durable work commit atomically; retry
   creates no duplicate effect.
6. Assignment tests cover shared, replacement, unknown, overlapping,
   reassigned, departed, and **Not my charge** cases with exact effective
   intervals and no wrong-claimant enumeration.
7. Conservation property tests prove exact same-currency business +
   personal/non-business + unresolved equality, signed adverse occurrences,
   checked arithmetic, and zero unresolved remainder before submission.
8. D10/D13 tests prove import, exact attachment, OCR, AI, mapping, assignment,
   amount, or policy evaluation cannot approve, create an obligation, or create
   a Field Account effect.
9. Phase 20 contract tests prove only an eligible PII-minimized Approved
   Expense Snapshot lineage crosses the accounting doorway; raw files,
   receipts, profiles, card numbers, assignments, tasks, and personal portions
   outside approved coverage cannot enter an Accounting Release.
10. Security tests cover Tenant/Legal-Entity/source/card/claimant/currency
    substitution before enumeration, private artifact access, short-lived
    retrieval, PAN/CVV/track-data rejection, malicious CSV, audit redaction,
    retention, legal hold, and revocation.
11. Load tests cover production-shaped files, overlap candidate volume,
    concurrent imports, set-based writes, bounded memory, cause grouping,
    backpressure, tenant fairness, and recovery objectives without full-history
    scans or tenant-wide locks.
12. Representative admin tests prove first import, mapping, assignment,
    consequence prediction, and correction without specialist help; the second
    import requires no remapping.
13. Representative missionary tests prove one-photo/one-purpose ordinary
    completion, conditional requirements only, preserved offline draft,
    understandable personal split, and no inference of payment or availability.
14. Representative finance tests prove healthy work stays absent, one common
    cause does not create row storms, and users distinguish source evidence,
    claim, approval, repayment, accounting, issuer settlement, and
    reconciliation.
15. Accessibility tests cover native upload, keyboard and screen reader
    mapping, linked text errors, review/correction, announced async status,
    visible focus, non-color outcomes, semantic tables plus mobile summaries,
    320-CSS-pixel reflow, 400% zoom, and usable touch targets.
16. Migration/portability tests export stable source, profile, manifest,
    occurrence, revision, assignment, link, coverage, and correction identities
    with digests and exact versions but no secrets, full PAN, receipt bytes,
    unrelated PII, or provider-specific authority.
17. Release is blocked if any path enables personal-card batch browsing,
    pending/file evidence as final authorization truth, PDF/OCR/XLSX financial
    truth, fuzzy auto-merge, mutable accepted facts, destructive undo,
    automatic approval/reimbursement, direct QBO/Xero posting, or false
    `synced`, `paid`, `settled`, `available`, or `reconciled` status.

### Evidence

- [D14 organization-card evidence research](./phase-21-mission-dashboard-product-research-evidence.md#d14-ratified-direction-file-first-organization-card-transaction-evidence)
- [Expensify company-card reconciliation](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Reconcile-Company-Card-Expenses)
- [Expensify statement matching](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation)
- [SAP Concur Available Expenses](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-end-user-help/available-expenses-overview)
- [SAP Concur Pending Card Transaction](https://help.sap.com/docs/SAP_CONCUR/bb83754b1c5541808d50c09901e11475/f42c33d721994fa79e70532f7152e889.html)
- [Ramp split transactions](https://support.ramp.com/splitting-transactions-or-reimbursements/)
- [Brex expense lifecycle](https://www.brex.com/support/managing-your-expenses)
- [QuickBooks Online matching](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/match-transactions-quickbooks-online/L0MF3Fn6y_US_en_US)
- [Xero bank reconciliation](https://central.xero.com/s/article/Bank-reconciliation-in-Xero)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [PCI SSC FAQ 1280 — sensitive authentication data](https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/Can-card-verification-codes-values-be-stored-for-card-on-file-or-recurring-transactions/)
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [WCAG 2.2 Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [ADR-0075 — File-first organization-card transaction evidence](../../adr/0075-file-first-organization-card-transaction-evidence.md)

### Remaining founder decisions

D14 settles the optional launch source, organization-card-only boundary,
machine-readable file truth, source/profile/manifest/occurrence/assignment
model, identity and overlap behavior, append-only correction, conservation,
claimant/admin/finance experience, and Phase 20/QBO/Xero separation. It does
not reopen D1-D13, build a general importer, authorize personal-card browsing,
add a live issuer adapter, issue or settle cards, collect personal portions,
initiate reimbursement, or decide how an approved Reimbursement Obligation is
handed to external payroll/AP and later proved paid. The external
reimbursement-payment handoff is resolved by D15 below.

## D15 — Artifact-always reimbursement handoff with qualified execution

**Founder ruling:** ratified on 2026-07-31.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> content-addressed, schema-versioned, PII-minimized, artifact-always
> Reimbursement Handoff Package for exact Reimbursement Obligations, with one
> immutable Reimbursement Execution Claim assigning every exact,
> non-overlapping obligation-coverage unit to exactly one prospective Tenant-,
> Legal-Entity-, claimant-relationship-, reimbursement-family-,
> provider-organization/product-, country-, environment-, external-provider-participant/payee-reference-,
> ISO-currency-, cadence/cycle-, certified-operation-, and
> external-execution-owner-qualified lane while separately pinning, never
> inferring, Phase 20 posting ownership; a complete quiet `Handle outside Asym`
> default with an explicit Handoff Attestation and executable release distinct
> from non-executing creation, preview, protected audit retrieval, reference
> download, and redownload; only capability-certified payroll or AP
> pre-execution draft/input operations whose exact endpoint and effective
> tenant automation cannot approve, calculate, submit, schedule, fund, or send
> money; D7 operation-kernel reuse without compensation, reimbursement, or
> payment-truth conflation; separately authoritative provider readback or exact
> staff-attested External Payment Occurrence evidence with explicit evidence
> strength; exact partial, grouped, many-to-many, mixed-compensation,
> cross-report, FX, residual, failure, return, partial-reversal, reversal,
> repayment, correction, and reissue coverage; append-only ambiguity-safe
> inspect-before-retry and proof-gated residual-only route succession;
> Phase-20-only QBO/Xero accounting delivery; and one quiet, accessible,
> exception-first finance and claimant-readable experience—without direct
> money movement, beneficiary-bank custody, an AP aging or payroll engine, a
> generic payout/workflow/status API, dual delivery, blind retry, fuzzy payment
> matching, report-level `Paid`, accounting-record-as-payment inference, or any
> claim that approval, Field Account Funding Coverage, artifact access, Handoff
> Attestation, provider-draft acceptance, scheduling, payroll completion,
> payslip, Accounting Release, QBO/Xero readback, or bank reconciliation proves
> claimant payment.**

### Binding interpretation and independent authority

The ratified wording is read with these non-negotiable boundaries:

1. A Reimbursement Handoff Package may exist with **zero** Execution Claims.
   Creation, preview, protected retrieval, download, and redownload are access,
   not release. Only one explicit release atomically creates the unique
   Reimbursement Execution Claim and exact non-overlapping Reimbursement
   Handoff Coverage for the released units.
2. `external_execution_owner` and Phase 20 D17 posting ownership are different
   authorities. A profile or claim may pin an already-applicable Phase 20 D17
   source-family ownership contract; it cannot assign or infer the posting
   owner of a future payment. Phase 20 D17 assigns one posting owner when the actual
   source or atomic payment occurrence exists.
3. D15 consumes only an already-established Reimbursement Obligation and its
   exact source-owned claimant-relationship reference. A delivery profile,
   package, claim, attestation, or provider result cannot approve an expense,
   create or change an obligation, classify a claimant, create Field Account
   Funding Coverage, or ingest an organization-card personal portion.
4. Reimbursement Handoff Coverage, Field Account Funding Coverage, and
   Reimbursement Payment Coverage are three distinct conservation contracts:
   handoff exclusivity, organization-controlled capacity reservation, and
   payment application respectively. None substitutes for another.
5. Provider draft/input readback proves only what the exact handoff operation
   did. Only separately qualified payment-state evidence or an exact
   staff-attested External Payment Occurrence may establish payment evidence.
6. QBO and Xero Accounting bills, payments, journals, or other accounting
   objects are not D15 AP draft inputs. Phase 20 remains the only QBO/Xero
   Accounting write path.
7. The quote's repayment coverage preserves exact repayment-related evidence
   and lineage in a return, correction, or recovery case. D15 does not certify
   claimant repayment as a negative payment, new occurrence family, Field
   Account effect, or Phase 20 source. D16 below now owns that separate
   reverse-flow contract without changing D15 handoff or payment truth.

| Authority                                              | Owns                                                                                                                                 | Does not prove                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Approved Expense Snapshot and Reimbursement Obligation | Exact approved source coverage and amount the organization owes                                                                      | Field Account capacity, external release, payment, or accounting                                             |
| Reimbursement Handoff Package                          | Immutable minimum-data human and machine artifact                                                                                    | Release, external acceptance, payment, or posting                                                            |
| Reimbursement Execution Claim and Handoff Coverage     | One executable owner for each exact released obligation-coverage unit                                                                | That the external process acted or paid                                                                      |
| Handoff Attestation                                    | Who handed which package and coverage to which governed external process, how, when, and under what reference                        | Provider acceptance, scheduling, funding, payment, or claimant receipt                                       |
| Reimbursement Handoff Operation                        | Exact manual or certified pre-execution provider-draft attempt, readback, drift, ambiguity, and per-unit handoff disposition         | Payroll/AP completion, payment, or accounting                                                                |
| External payroll/AP/manual process                     | External calculation, approval, submission, scheduling, funding, execution, and provider-native state                                | Phase 21 obligation, Field Account, or Phase 20 posting ownership                                            |
| External Payment Occurrence and Payment Coverage       | Source-labelled payment evidence strength and exact amount applications                                                              | Expense approval, Field Account balance, final books, or stronger evidence than the source actually supplies |
| Phase 20 and QBO/Xero                                  | Accounting-ready validation, one Phase 20 D17 posting owner, Accounting Release delivery, accepted provider records, and final books | Reimbursement execution or claimant receipt                                                                  |

### Complete manual default and bounded connected lanes

An authorized tenant answers one setup question per exact Legal Entity and
claimant-relationship family:

> **How does your organization normally reimburse this type of person?**

The visible choices are:

- **Handle outside Asym** — default and complete;
- **Include in regular payroll** — only when the exact D7-compatible
  pre-execution operation and effective tenant automation are currently
  certified; or
- **Send to accounts payable** — only when an exact non-executing AP draft/input
  operation is currently certified and is not a QBO/Xero Accounting write.

Unsupported choices are absent, not disabled promotional tiles. The outside
lane produces the same immutable package and exact coverage as a connected
lane. Staff explicitly record **External handoff recorded** through a Handoff
Attestation; package access alone never advances the stage.

Each immutable Reimbursement Delivery Profile Version is prospective and pins
the exact Tenant, Legal Entity, source-owned claimant relationship,
reimbursement family, external execution owner, and—when connected—provider
organization, product, country, environment, external provider participant/payee
reference, currency, cadence or cycle, and certified operation. Release re-proves all scope, authorization,
destination, provider participant/payee reference, amount, currency, package digest, capability, and
effective downstream automation. A changed connection, provider participant/payee reference, profile,
provider behavior, claimant relationship, or destination creates a successor
for future unclaimed coverage only.

### Operation, ambiguity, and append-only recovery

The reimbursement operation reuses only D7's technical kernel: destination
serialization, semantic idempotency, concurrency/version proof, exact
request/response identity, readback, drift detection, bounded batch envelopes,
tenant-fair backpressure, kill switches, and inspect-before-retry. It does not
reuse the Compensation Handoff Package or compensation domain state.

Each exact handoff coverage unit resolves only as:

- `confirmed_handed_off`;
- `proven_not_handed_off`; or
- `outcome_unknown`.

Only an exact `proven_not_handed_off` residual may receive a successor
Execution Claim. `outcome_unknown` remains quarantined until exact inspection
or authorized evidence resolves it; time, worker retry, provider outage, staff
closing a task, or a second lane cannot release it. If compensation and
reimbursement touch the same payroll draft, their source packages and coverage
remain separate while the provider-destination concurrency fence is shared.

A correction after release never edits the obligation, package, claim,
attestation, provider draft, payment evidence, or prior Support Cycle. It
appends a correction, attempts cancellation only through a separately
certified safe operation, reserves ambiguous coverage, and creates a reissue
only from exact work proved unpaid, not executed, returned, or reversed.

### Exact payment evidence and conservation

An External Payment Occurrence is homogeneous by Tenant, Legal Entity,
authoritative external payee, payment ISO currency, external execution owner,
and Phase 20 posting owner. Cross-payee payroll/AP/check batches are envelopes
around separate atomic occurrences. One payment may cover multiple
obligations, and one obligation may be covered by multiple payments.

Every payment records exact source and evidence strength:

- staff-attested;
- payroll/AP-provider observed;
- payment-provider observed;
- bank observed; or
- another separately certified authority.

Staff-attested evidence is displayed as **Payment recorded by finance**. The
stronger **Payment confirmed** label is allowed only under a separately
qualified confirmation contract. No UI, notification, export, or API silently
upgrades evidence strength.

A reimbursement-only payment conserves exact Reimbursement Payment Coverage
plus one signed typed resolved residual, including zero. A mixed compensation
and reimbursement payment uses one complete manifest in the payment currency
across Compensation Payment Coverage, Reimbursement Payment Coverage, and one
signed typed resolved residual. Cross-currency applications preserve immutable
source and payment amounts, rounding, residual, and exact externally owned
conversion evidence. Unknown amount, payee, currency, FX, residual, execution
owner, or posting owner fails closed.

Failure, return, partial reversal, reversal, correction, repayment-related
evidence, and reissue append exact linked evidence. They never mutate original
coverage or reinterpret a source occurrence. Repayment remains accounting-dark
inside D15; D16 below separately certifies its bounded source contract and
Phase 20 admission rules.

### Quiet staff and claimant experience

Finance works from one responsive exception-first reimbursement workspace:

- **Needs attention**;
- **Ready for external processing**;
- **Waiting on external process**;
- **Payment evidence received**; and
- **No action needed** under progressive disclosure.

Healthy work is grouped only when Tenant, Legal Entity, claimant relationship,
external execution owner, provider destination, currency, cycle, and certified
operation are homogeneous. A group is an envelope; each claimant and exact
coverage unit retains its own outcome. The ordinary actions are literal:

- **Download payment package**;
- **Record external handoff**;
- **Add to payroll draft**;
- **Create accounts-payable draft**;
- **Inspect provider outcome**;
- **Record payment confirmation**;
- **Record returned payment**; and
- **Prepare replacement handoff**.

The claimant sees one calm current stage and, where useful, one expected
external cycle date:

- **Approved**;
- **Finance is processing it**;
- **With payroll**;
- **With accounts payable**;
- **Partially paid**;
- **Payment recorded by finance**;
- **Payment confirmed**; or
- **Finance is resolving a returned payment**.

Expected dates are explicitly estimates sourced from the external cadence and
never payment promises. Provider identifiers, profile dimensions, coverage
matrices, evidence taxonomy, accounting ownership, and error payloads remain
progressive finance detail. Accessible keyboard operation, visible focus,
text-linked errors, non-color state, announced async outcomes, semantic tables
with mobile summaries, 320-CSS-pixel reflow, 400% zoom, and usable touch
targets are release gates.

The product never uses **Pay**, **Send money**, blind **Retry payment**,
report-level **Mark paid**, generic **Sync**, **Settled**, or **Reconciled** for
this surface.

### D15 adversarial disposition

Every requested category has a concern and a binding permanent control:

| Category                          | Concern? | Severity | Likelihood  | Permanent prevention                                                                                                                                     |
| --------------------------------- | -------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Critical | High        | Coverage-scoped exclusivity, complete manual default, exact product/country/environment/operation certification, and immutable prospective profiles      |
| Technical debt                    | Yes      | High     | High        | Reuse only the D7 operation kernel; keep distinct packages, commands, coverage, statuses, and a closed lane catalog                                      |
| Edge cases                        | Yes      | Critical | High        | Exact many-to-many coverage, homogeneous occurrences, typed residuals, payee identity, exact FX evidence, and append-only adverse/reissue facts          |
| Footguns                          | Yes      | Critical | High        | Non-executing artifact access, explicit release, one Execution Claim, consequence preview, CAS, literal actions, and inspect-before-retry                |
| Tenant safety                     | Yes      | Critical | Medium-high | Structural scope on every identity/key/query, authorization before enumeration, destination pinning, RLS/server checks, and substitution tests           |
| Over-engineering                  | Yes      | High     | High        | Three product choices, manual default, code-owned states, and no money movement, bank custody, AP aging, payroll calculation, or QBO/Xero write          |
| UX/UI and user friction           | Yes      | High     | High        | Saved defaults, homogeneous grouping, exception-first responsive workspace, one stage/next action, calm claimant copy, and accessibility gates           |
| Hidden coupling                   | Yes      | Critical | High        | Independent obligation, funding, handoff, provider-operation, payment, accounting, and reconciliation authorities                                        |
| Failure modes                     | Yes      | Critical | High        | Durable operation/outbox, exact readback, `outcome_unknown` quarantine, kill switches, visible ownership/age, and residual-only recovery                 |
| Data integrity risks              | Yes      | Critical | High        | Content-addressed immutable artifacts, minor units, scoped IDs, unique active coverage, CAS, conservation, and append-only correction                    |
| Security and privacy risks        | Yes      | Critical | Medium-high | PII-minimized formula-safe artifacts, no bank data, encrypted private storage, short-lived access, malware checks, least privilege, and redacted logs    |
| Scalability and performance risks | Yes      | High     | Medium-high | Bounded batch envelopes, per-unit outcomes, set-based writes, resumable work, provider backpressure, tenant fairness, and indexed uncertain work         |
| Operational burden                | Yes      | High     | High        | Guided defaults, reusable profiles, quiet healthy automation, exact grouped attestation, cause-grouped repair, and readable diagnostics                  |
| Observability gaps                | Yes      | High     | High        | Correlated obligation/package/claim/operation/evidence/payment/accounting lineage with cause, owner, age, strength, and next action                      |
| Dependency and integration risks  | Yes      | Critical | High        | Exact time-bounded capability certification including downstream automation, production-shaped tests, drift probes, kill switches, and manual continuity |
| Migration and upgrade risks       | Yes      | High     | Medium      | Versioned schemas/compilers/capability maps/derivations, preserved readers/evidence, prospective cutover, and proved-unreleased-only succession          |
| Other development hazards         | Yes      | Critical | High        | Serializable/CAS release fence, release-time reproof, exact cycle/timezone, semantic idempotency, transactional outbox, and race/fault tests             |

### Required production proof

1. Package-access tests prove zero Execution Claims before explicit release and
   no state change from preview, download, redownload, or protected retrieval.
2. Serial/CAS and property tests prove at most one active executable owner per
   exact non-overlapping obligation-coverage unit under staff, worker,
   callback, polling, retry, and deployment races.
3. Profile and destination tests prove Tenant, Legal Entity, source-owned
   claimant relationship, provider organization/product/country/environment,
   external provider participant/payee reference, currency, cadence/cycle,
   certified operation, and external
   execution owner at activation and release.
4. Capability certification proves the endpoint and tenant's effective
   downstream automation cannot approve, calculate, submit, schedule, fund, or
   send money; sandbox-only or logo-level evidence is insufficient.
5. Manual-lane tests prove artifact access is not handoff and Handoff
   Attestation is not provider acceptance, payment, claimant receipt,
   accounting, or reconciliation.
6. Connected-operation tests prove exact idempotency, concurrency, readback,
   drift, partial outcome, timeout-after-write quarantine, inspect-before-retry,
   kill switches, backpressure, and residual-only succession.
7. Conservation tests cover partial, grouped, cross-report, one-to-many,
   many-to-one, mixed compensation/reimbursement, FX, residual, failure,
   return, partial reversal, reversal, correction, and reissue.
8. Negative accounting tests reject Package, Delivery Profile, Execution
   Claim, Handoff Coverage, Handoff Attestation, Handoff Operation, provider
   acceptance/readback, payroll status, and payslip before Posting Intent.
9. Evidence-strength tests prove **Payment recorded by finance** is not silently
   upgraded and **Payment confirmed** requires its separately certified
   authority.
10. Security tests cover cross-Tenant/Legal-Entity/payee/provider/currency
    substitution before enumeration, short-lived access, PII minimization,
    private storage, malware and formula injection, audit redaction,
    revocation, retention, and legal hold.
11. Load tests cover month-end production volume, provider limits, partial
    batches, readback storms, tenant fairness, bounded memory, and recovery
    without one job per line or full-history scans.
12. Representative finance and claimant tests prove users distinguish
    **Approved**, **Prepared for external processing**, **With payroll/AP**,
    **Payment recorded by finance**, and **Payment confirmed**, and complete
    the ordinary task without specialist help.
13. Accessibility tests cover keyboard and screen-reader operation, visible
    focus, linked errors, announced outcomes, non-color status, mobile reflow,
    zoom, and touch targets.
14. Release fails if any path moves money, stores beneficiary-bank credentials,
    creates QBO/Xero Accounting objects, performs payroll/AP approval or
    calculation, dual-delivers, blind-retries, fuzzy-matches payment, mutates
    released history, or treats handoff/provider/accounting evidence as
    claimant payment.

### Evidence

- [D15 reimbursement-handoff research and adversarial review](./phase-21-mission-dashboard-product-research-evidence.md#d15-ratified-direction-artifact-always-reimbursement-handoff)
- [Expensify reimbursement methods](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Reimbursement-Payment-Methods)
- [Ramp reimbursement setup](https://support.ramp.com/reimbursements-set-up/)
- [Brex expense reimbursements](https://www.brex.com/support/expense-reimbursements)
- [SAP Concur Payment Manager](https://help.sap.com/docs/CONCUR_EXPENSE/1f13d54352684d6dba6e65c8c5d75ead/c451750651c31015899fea36a2d5353e.html)
- [SAP Concur payee statuses](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/2ec7715d01514150b5b6766bfe367b40.html)
- [Gusto payroll events](https://docs.gusto.com/embedded-payroll/docs/payroll-events)
- [Intuit bill payment](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-bookkeeping/pay-bills)
- [Xero Payments API](https://developer.xero.com/documentation/api/accounting/payments)
- [ADR-0076 — Artifact-always reimbursement handoff with qualified execution](../../adr/0076-artifact-always-reimbursement-handoff.md)

### Remaining founder decisions

D15 settles the immutable minimum-data package, non-executing artifact access,
exact release claim and handoff coverage, complete outside-Asym default,
bounded capability-certified pre-execution payroll/AP lanes, D7 kernel reuse,
ambiguous-outcome containment, exact payment evidence and strength, append-only
recovery, quiet staff/claimant UX, and Phase 20/QBO/Xero separation. It does
not reopen D1-D14, move money, store beneficiary bank details, calculate or
run payroll/AP, create QBO/Xero Accounting objects, prove payment from a draft,
or certify claimant repayment as a source family.

The next unresolved seam is how Phase 21 should model organization advances,
organization-card personal/nonbusiness amounts, overpayments, and money a
claimant owes back—without netting those reverse-flow obligations into
reimbursements, Field Account balances, payroll, or accounting truth. Later
Phase 21 decisions continue one at a time.

## D16 — Purpose-separated advances and claimant repayments

**Founder ruling:** ratified on 2026-07-31.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one optional, off-by-default,
> Tenant- and Legal-Entity-owned Advance and Claimant Repayment evidence
> contract, exposed through one quiet experience but compiled into
> independently activatable prospective Expense Advance Policy and Claimant
> Repayment Policy versions, each pinning source-owned claimant relationship,
> applicable-jurisdiction determination, purpose and source family, ISO
> currency, effective interval, organization authority, substantiation and
> evidence requirements, and external handling rules; immutable Expense
> Advance Authorization versions distinct from source-qualified Expense
> Advance Issuance Occurrences and their evidence observations; claimant-use
> readiness proof before any advance can satisfy expense coverage; one
> Approved-Expense-Snapshot-rooted serializable Expense Settlement
> Determination that atomically conserves exact approved coverage into
> non-overlapping same-currency Expense Advance Applications, the remaining
> Reimbursement Obligation, typed residuals, and any tenant-enabled
> non-reusable Field Account Funding Coverage without mutating source truth or
> adding a routine staff step; source-final and responsibility-proved Claimant
> Repayment Decisions whose `request_external_return` disposition alone
> creates an operational Claimant Repayment Requirement rather than
> adjudicated debt; exact Claimant Repayment Occurrences separated from
> source-labelled evidence observations and applied through many-to-many
> non-overlapping coverage with typed residual, failure, return, correction,
> dispute, and post-return restitution review; a complete `Handle outside
Asym` lane, evidence-strength-aware status, conflict-safe
> insider/private-benefit routing, payroll and setoff fail-closed behavior,
> exact externally owned FX evidence, a closed Phase 20 source catalog with
> independently assigned Phase 20 D17 posting ownership, and calm role-scoped
> accessible mobile UX—without card assignment implying responsibility,
> authorization or provider acceptance implying issuance or claimant use,
> personal/nonbusiness classification implying debt, one mutable claimant
> balance, direct money movement, personal bank or card custody, payroll
> deduction, automatic reimbursement, compensation, or Field Account netting,
> gift, deposit, pledge, or commitment funding inference, AP aging,
> collections, dunning, interest, penalties, tax or worker-classification
> adjudication, a generic `Mark paid` or `Mark repaid`, destructive edits,
> fuzzy payment matching, or any claim that a request, acknowledgment,
> notification, staff task, artifact, provider draft, payroll record, QBO/Xero
> entry, Accounting Release, or bank reconciliation proves money returned.**

### Independent authority and activation

The feature is off by default for every Tenant × Legal Entity. Off means no
navigation, empty queue, setup warning, dashboard tile, claimant task, or
notification. One quiet setup experience may compile into two independently
activatable immutable prospective records:

- **Expense Advance Policy Version**; and
- **Claimant Repayment Policy Version**.

Each version pins Tenant, Legal Entity, authoritative claimant-relationship
version, applicable-jurisdiction determination, purpose and source family, ISO
currency, effective interval, organization authority, substantiation and
evidence requirements, and external handling rules. A policy cannot determine
worker classification, taxable compensation, legal enforceability, payroll
deduction authority, payment, accounting, or final reconciliation. U.S.
accountable-plan timing examples may be labelled jurisdiction-specific presets;
they are never universal deadlines.

| Authority                             | Owns                                                                                                                                    | Must not claim                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Expense Advance Authorization Version | Prospective claimant, purpose, maximum amount, ISO currency, interval, policy, and organization authority                               | Issuance, claimant use, approved expense, Field Account debit, payment, or accounting                   |
| Expense Advance Issuance Occurrence   | Exact source-qualified economic issuance plus explicit evidence strength                                                                | Claimant-use readiness unless the source contract proves it; approved expense or accounting             |
| Expense Settlement Determination      | Atomic allocation of exact approved coverage across application, obligation, typed residual, and separately authorized funding coverage | Funding authorization, external payment, claimant debt, payroll deduction, or general-ledger treatment  |
| Repayment Subject Determination       | Source-backed responsible Party, relationship, jurisdiction, conflict/dispute route, actor, and version                                 | Debt, return request, cardholder liability, payment, or accounting                                      |
| Claimant Repayment Decision           | Authorized disposition of currently admissible source and responsibility-proved coverage                                                | Universal legal liability, money returned, payroll authority, or accounting                             |
| Claimant Repayment Requirement        | Exact operational amount finance is asking the authoritative claimant to return                                                         | Adjudicated debt, collection authority, payment, Field Account debit, or bookable receivable by default |
| Claimant Repayment Occurrence         | Exact externally handled economic return with one stable identity                                                                       | Stronger evidence than its observations support, accounting posting, or bank reconciliation             |
| Phase 20 / QBO / Xero                 | Accountant-confirmed posting policy, Phase 20 D17 owner, Accounting Release, provider records, and final books                          | Phase 21 source, responsibility, claimant return, payroll, or Field Account truth                       |

### Exact advance issuance, readiness, and application

Authorization, provider draft acceptance, check creation, accounting, or a
staff workflow does not prove issuance. Issuance itself does not prove that the
claimant could use the advance for the covered expense. An advance may satisfy
approved expense coverage only after the pinned evidence contract establishes
**Advance Application Readiness**. This is the canonical predicate represented
by the ratified phrase `claimant-use readiness`; it proves only application
eligibility, not general availability or withdrawability.

One Approved-Expense-Snapshot-rooted, serializable **Expense Settlement
Determination** atomically creates the exact application and only the remaining
Reimbursement Obligation:

```text
gross approved reimbursable amount
  = Expense Advance Application
  + new Reimbursement Obligation
  + policy-authorized nonpayable disposition
```

It must not create a gross obligation and later reduce or cancel it. Every
Expense Advance Application uses one exact application currency, is
non-overlapping, and is limited by both the readiness-qualified issuance
remainder and eligible approved expense coverage. It cannot cover rejected,
personal, unresolved, company-paid,
already-covered, or stale coverage.

For each issuance:

```text
issued advance
  = applied-to-approved-expense coverage
  + externally returned coverage
  + policy-permitted carry residual
  + unresolved residual
```

All terms use exact checked integer minor units in the application currency,
complete typed residuals, and append-only corrections. When the incurred or
approved source amount uses another currency, the Approved Expense Snapshot
must pin both source and settlement amounts, the externally owned conversion
authority/rate, rounding, and residual. Phase 21 does not quote, choose, or
calculate FX; absent complete evidence, application fails closed.

If a tenant explicitly funds the advance from organization-controlled Field
Account capacity, the exact approved funding component of the reviewed Expense
Advance Authorization Version atomically creates purpose-typed, non-reusable
**Field Account Funding Coverage** before that capacity can be promised
elsewhere. The coverage is not a debit, payment, claimant-owned money, or
dashboard availability. Only a separately qualified Field Account Effect under
the policy-pinned recognition contract may fulfill it; an Expense Advance
Application alone cannot. A proved external return drives its own cause-owned
adverse or reversal effect before derived capacity changes. Unknown work stays
reserved. No repayment may be netted against a Field Account.

### Source-final repayment decision and exact return evidence

Unused advance coverage, exact D14 personal/nonbusiness coverage, and exact D15
overpayment or duplicate-payment residuals are review candidates only. A
Claimant Repayment Decision records exactly one disposition:

- `correct_source`;
- `no_return_requested`;
- `request_external_return`; or
- `refer_to_external_specialist`.

Only `request_external_return` creates a Claimant Repayment Requirement. Card
assignment, portal role, worker page, or personal classification cannot prove
the responsible person. A distinct immutable **Repayment Subject
Determination** pins the exact source evidence, responsible Party,
relationship/jurisdiction authority, conflict/dispute route, actor, and
version. Card-caused cases route fraud, merchant error, dispute, and
organizational-use paths before any claimant request.

`Source-final` in the ratified wording means the current pinned source version
is admissible under its source-family finality contract at the decision instant.
The command re-proves that version and responsibility with compare-and-swap;
later source corrections append and trigger cause-owned review rather than
pretending the source was permanently final.

One external claimant-to-organization economic return has one stable Claimant
Repayment Occurrence and zero or more immutable source-labelled evidence
observations. Stronger evidence corroborates or conflicts with that occurrence;
it does not create a duplicate or silently upgrade evidence strength. A return
may cover several Requirements and one Requirement may receive several partial
returns:

```text
Claimant Repayment Occurrence
  = exact Claimant Repayment Coverage
  + typed unapplied residual
```

Every atomic occurrence is homogeneous by Tenant, Legal Entity, authoritative
claimant, ISO currency, external execution owner, and evidence class.
Cross-claimant or cross-currency groups are envelopes only. A conflict,
returned payment, dispute, unknown result, or correction remains visibly
quarantined and cannot be closed by task completion or a timer.

If source truth changes after money was returned, preserve the Decision,
Requirement, Occurrence, observations, and coverage and open a **Repayment
Restitution Review**. Any organization-to-claimant restoration requires its own
qualified source, authority, and payment evidence. It is never silently netted
against compensation, reimbursement, another Requirement, or Field Account
capacity.

### Legal, accounting, and integration containment

- The complete launch lane is **Handle outside Asym**. No personal bank/card
  custody, ACH/debit collection, money movement, or repayment-provider adapter
  is required.
- Payroll deduction and setoff are absent from ordinary method selection. D16
  never calculates or initiates them. An already externally executed result may
  be recorded only through a separately certified contract proving exact
  authority, gross amount, component, net result, execution, outcome, and Phase 20 D17
  ownership. U.S. federal and Canadian federal guidance demonstrate
  jurisdiction-sensitive complexity rather than a universal prohibition or
  authorization; state, provincial, contractual, and other-country authority
  remains external.
- Officer, director, trustee, disqualified-person, related-party, or other
  source-identified private-benefit cases require independent conflict-safe
  specialist handling; self-approval or a generic waiver cannot close them.
- Asym never calculates, imposes, adjudicates, or ordinary-flows interest,
  penalties, tax correction, or private-benefit correction amounts. A
  specialist-owned exact correction required under external authority may be
  recorded only through its separately certified source contract.
- Compensation overpayments remain external payroll truth. Gifts, deposits,
  pledges, commitments, or a card assignment cannot fund or authorize an
  advance or repayment.
- Phase 20 receives only separately certified, PII-minimized issuance,
  application, return, or cause-linked correction occurrences under
  accountant-confirmed policy and an independently assigned Phase 20 D17 posting owner.
  Policy, authorization, task, Requirement, residual projection, dispute, raw
  evidence observation, Restitution Review, and Field Account reservation are
  accounting-dark. A Claimant Repayment Requirement remains accounting-dark
  unless a separately accountant-certified policy/source contract recognizes a
  receivable; the later cash occurrence and an advance return remain distinct
  typed accounting occurrences.
- QBO/Xero objects and bank reconciliation cannot establish Claimant Repayment
  Occurrence truth or alter any Phase 21 source record.

### Quiet finance and claimant experience

No active claimant work means no permanent dashboard card. Active work appears
in existing Tasks and contextually in the expense flow; completed history is
available through progressive disclosure under **Advances & repayments**.

Claimant copy is limited to what the current authority proves:

- **Advance being processed**;
- **Advance to account for**;
- **Not yet applied to approved expenses**;
- **Can be applied to a later eligible expense until [organization-policy date]**;
- **Finance asked you to return [exact amount and ISO currency]**;
- **Return recorded by finance**; or
- **Return confirmed** only under a separately qualified stronger evidence
  contract.

Claimant actions are **View return instructions**, **Share return evidence**,
and **Ask finance to review**. The product does not show **Debt**,
**Collections**, **Available balance**, **Repay now**, **Deduct from payroll**,
generic **Paid**, **Settled**, or **Reconciled**.

Finance defaults to **Needs attention** and groups common causes rather than
creating one task per line. Its explicit states are **Needs issuance evidence**,
**Waiting for expenses**, **Needs return decision**, **Waiting for claimant**,
**Waiting for external return**, **Return evidence received**, **Disputed or
specialist review**, and **No action needed**. Staff actions remain literal:
**Record advance issuance**, **Apply to approved expenses**, **Request external
return**, **Record return evidence**, **Correct classification**, **Ask claimant
for information**, and **Inspect external outcome**.

The consequential **Request external return** action uses one review-and-correct
surface showing claimant, Legal Entity, exact cause, amount, ISO currency,
policy basis, follow-up date, recipient, and notification consequence. Routine
drafts and notes add no confirmation ceremony. One initial notice plus
tenant/user-controlled reminders or digest replaces red debt styling,
countdowns, and notification storms.

### D16 adversarial disposition

Every requested category has a concern and a binding permanent control:

| Category                          | Concern? | Severity | Likelihood  | Permanent prevention                                                                                                                                   |
| --------------------------------- | -------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | Yes      | Critical | High        | Immutable source families, exact many-to-many coverage, bounded prospective policies, per-currency residuals, and explicit unsupported states          |
| Technical debt                    | Yes      | Critical | High        | Closed authorization/issuance/application/decision/requirement/occurrence/observation/coverage terms; projections only between contexts                |
| Edge cases                        | Yes      | Critical | High        | Partial/multi-report/multi-advance, former/deceased claimant, dispute, return, FX, correction, and zero-/three-decimal fixtures                        |
| Footguns                          | Yes      | Critical | High        | Explicit Decision before Requirement, literal actions, no automatic setoff, consequence preview, separate permissions, and immutable sources           |
| Tenant safety                     | Yes      | Critical | Medium-high | Structural Tenant/Legal-Entity/claimant/relationship/purpose/currency scope, RLS/server reauthorization, and negative substitution tests               |
| Over-engineering                  | Yes      | High     | High        | Off-by-default occurrence families, complete external lane, no money movement, collections, payroll, tax, AP aging, bank custody, or FX engine         |
| UX/UI and user friction           | Yes      | High     | High        | One quiet derived experience, progressive disclosure, gross/application/residual clarity, grouped exceptions, calm copy, and accessible mobile UX      |
| Hidden coupling                   | Yes      | Critical | High        | Independent expense, advance, Field Account, repayment, external payment, accounting, payroll, and reconciliation authorities                          |
| Failure modes                     | Yes      | Critical | Medium-high | Semantic idempotency, serializable/CAS fences, transactional outbox, evidence conflict quarantine, append-only recovery, and visible owner/next action |
| Data integrity risks              | Yes      | Critical | High        | Database-enforced non-overlap/conservation, exact minor units, stable cause IDs, typed residuals, immutable versions, and property tests               |
| Security and privacy risks        | Yes      | Critical | High        | PII-minimized projections, encrypted private evidence, governed temporary retrieval, least privilege, access audit, and redacted telemetry             |
| Scalability and performance risks | Yes      | High     | Medium-high | Indexed coverage/checkpoints, set-based operations, keyset pagination, resumable tenant-fair work, and production-shaped load certification            |
| Operational burden                | Yes      | High     | High        | Independent off defaults, reusable profiles, automatic exact suggestions, cause-grouped review, quiet healthy work, and cause-owned repair             |
| Observability gaps                | Yes      | High     | High        | Separate state dimensions with correlated safe IDs, exact coverage, evidence strength, owner, age, reason, and next action                             |
| Dependency and integration risks  | Yes      | Critical | High        | Provider-neutral source truth, bounded certification, exact scope pinning, evidence readback, manual continuity, drift checks, and kill switches       |
| Migration and upgrade risks       | Yes      | High     | Medium-high | Versioned schemas/readers, portable manifests, prospective cutover, exact ownership intervals, and proved-unexecuted-only succession                   |
| Other development hazards         | Yes      | Critical | High        | Server-derived idempotency, serializable settlement, checked arithmetic, pinned timezone, transactional messaging, and race/fault/mutation testing     |

### Required production proof

1. Authority tests prove authorization is not issuance; issuance is not
   Advance Application Readiness; source classification is not a Requirement; a
   Requirement is not returned money; and Phase 20/QBO/Xero/payroll cannot
   rewrite Phase 21 truth.
2. Property tests conserve arbitrary partial, multi-report, multi-advance,
   carry, return, correction, and residual combinations in each ISO currency.
3. Atomic settlement tests prove only exact eligible approved coverage accepts
   an application and only the remaining Reimbursement Obligation is created.
4. Responsibility tests prove card assignment, portal role, worker page,
   personal classification, and claimant acknowledgment cannot create a
   Requirement.
5. Repayment tests conserve partial, grouped, many-to-many, duplicate-evidence,
   returned, disputed, corrected, and unapplied-residual outcomes.
6. Evidence tests prove one stable economic identity, explicit observation
   strength, no duplicate occurrence from corroboration, and no silent upgrade
   from **Return recorded by finance** to **Return confirmed**.
7. Correction-after-return tests preserve history and open an exact
   Restitution Review without netting or inferred restoration payment.
8. Legal-boundary tests prove no policy, actor, job, provider response, or
   accounting state can initiate payroll deduction, compensation/reimbursement
   offset, Field Account debit, bank transfer, or ordinary Phase 21 calculation,
   imposition, or adjudication of interest, penalty, tax treatment, or worker
   classification. Separately certified specialist-owned correction evidence
   remains recordable without becoming an Asym calculation.
9. Tenant-isolation tests substitute Tenant, Legal Entity, claimant,
   relationship, purpose, source, currency, policy, artifact, evidence, and
   coverage identifiers across direct, cached, queued, bulk, export, audit, and
   recovery paths.
10. Concurrency/failure tests cover simultaneous issuance, settlement,
    Requirement, evidence, correction, Support Cycle close, retry, callback,
    job replay, notification loss, upload failure, and deployment rollback.
11. Phase 20 contract tests accept only complete, certified D16 economic
    occurrences and reject policy, authorization, Requirement, task, residual,
    raw evidence, dispute, Restitution Review, and Field Account reservation.
12. Representative claimant and finance tests prove users distinguish
    authorized, issued, ready, applied, remaining, requested, staff-recorded,
    confirmed, disputed, accounted, and reconciled without training.
13. Accessibility tests cover keyboard, screen reader, focus, review/correction,
    persistent errors, announced outcomes, non-color state, 320-CSS-pixel
    reflow, 400% zoom, and usable touch targets.
14. Scale tests cover support-cycle and month-end production shapes across
    large and small tenants without full-history scans, row-level task storms,
    unbounded evidence scans, or tenant starvation.
15. Release fails if any path creates one mutable claimant balance, direct
    money movement, personal bank/card custody, payroll deduction, automatic
    netting, AP aging, collection/dunning, an interest/penalty engine,
    destructive edit,
    fuzzy match, generic `Mark paid`/`Mark repaid`, or returned-money inference
    from workflow, provider, accounting, or bank state.

### Evidence

- [D16 advances and claimant-repayment research](./phase-21-mission-dashboard-product-research-evidence.md#d16-ratified-direction-purpose-separated-advances-and-claimant-repayments)
- [IRS Publication 463 — advances and accountable plans](https://www.irs.gov/publications/p463)
- [IRS intermediate-sanctions guidance](https://www.irs.gov/charities-non-profits/charitable-organizations/intermediate-sanctions-excess-benefit-transactions)
- [U.S. DOL wage-deduction guidance](https://www.dol.gov/agencies/whd/fact-sheets/16-flsa-wage-deductions)
- [Canadian federal wage and deduction guidance](https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards/pay-deductions.html)
- [SAP Concur cash advances](https://help.sap.com/docs/CONCUR_EXPENSE/1c6701a5b9ea4cc69eee62d00f2cf326/31b68c9b3fbd499d8cbaeec021cd00f8.html)
- [Ramp employee repayments](https://support.ramp.com/employee-repayments/)
- [Brex employee repayments](https://www.brex.com/support/employee-repayments)
- [Expensify payment methods](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Pay-Expenses)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [ADR-0077 — Purpose-separated advances and claimant repayments](../../adr/0077-purpose-separated-advances-and-claimant-repayments.md)

## D17 — Reconciled Field Account Opening Position and operational cutover

**Founder ruling:** ratified 2026-07-31.

> **C-prime-amended-and-hardened (C-prime-R) — one finance-authorized,
> source-covered, per-Field-Account and per-currency reconciled immutable
> Opening Position over a complete Tenant × Legal Entity × ISO-currency
> activation cohort; built from one precedence-explicit Opening Source Package
> and complete Opening Coverage Manifest; prepared through private, chunked,
> resumable, non-authoritative staging and production-shaped shadow
> reconciliation; activated only by one short Asym-side CAS-guarded Operational
> Cutover at an exact source-family half-open boundary after final permission,
> source, cohort, mapping, control-total, in-flight, and manifest reproof; with
> every pre-cutover source fact in exactly one non-overlapping disposition so
> canonical certified exact history plus the residual Opening Position equals
> the reconciled boundary position; privacy-filtered, structurally inert
> reference history otherwise; balanced organization-control entries, exact
> minor-unit per-currency conservation, append-only idempotent late-fact
> corrections, smallest-scope containment, and post-activation overlap/gap
> monitoring; with Phase 30 owning transport and Phase 20 alone owning proved
> accounting-gap delivery; exposed through one quiet accessible exception-first
> Start Field Accounts setup and calm through-dated missionary truth—without
> mutable balance scalars, negative Field Accounts, fuzzy identity, silent
> exclusions, fabricated history, giant transactions, universal external-lock
> claims, dual write, destructive rollback, whole-history replay, downstream
> side-effect replay, public evidence storage, or QBO/Xero balance authority.**

### One opening authority, not a second recurring close path

- Phase 21 D17 is the sole bootstrap qualification to D2's recurring admission rule.
  One proved **Field Account Operational Cutover** establishes the initial
  Finance-confirmed Field Account Balance for a complete activation cohort.
- After activation, ordinary positive activity advances only through immutable
  **Support Cycle Admission Coverage**. Phase 21 D17 cannot be reused as a convenient
  balance adjustment, recurring import, or bypass around Support Cycle close.
- Mandatory adverse corrections remain continuous. A late pre-cutover fact is
  handled by an append-only **Opening Position Correction** and manifest
  successor, never by mutating the original opening, reinterpreting a closed
  cycle or prior statement, or silently inserting history. The successor records
  newly discovered source coverage; the economic effect enters through the
  normal correction/next-close path with source-effective, discovery, and record
  times. Positive corrections require fresh finance/source proof; adverse
  corrections remain mandatory.
- Phase 21 D17 does not make a Field Account a bank account, GL, payroll/AP ledger,
  payment authority, donor asset, or worker-owned wallet. It never says funds
  are available, withdrawable, payable, payroll-ready, or paid.

### Complete cohort, exact coverage, and conservation

The activation unit is one complete **Tenant × Legal Entity × ISO-currency
Opening Position Activation Cohort**. Every Field Account in that cohort is in
the census, including zero, inactive, departed, blocked, and exception accounts.
Staff cannot activate only the rows that happened to map cleanly.

One immutable, content-addressed **Opening Source Package** pins:

- Tenant, Legal Entity, ISO currency, every predecessor source family and
  source-system identity, environment, source timezone, and one exact half-open
  boundary per predecessor source;
- one canonical operational/business through boundary that every predecessor
  cursor or snapshot proves complete through and that starts the first D11
  half-open business interval;
- authoritative position artifact and explicit precedence over each bounded
  corroborating or reference artifact;
- raw artifact digests, parser/schema/adapter/mapping versions, stable source
  identities, source capture times, and finance authorization;
- exact per-account positions and cohort control totals in checked integer
  minor units;
- in-flight, unavailable-source, limitation, and unresolved-source evidence;
- the canonical ingestion cursor that becomes the predecessor of the first D11
  Support Cycle close; and
- exact independently live reservations, obligations,
  compensation/reimbursement coverage, reallocations, unresolved payments, and
  other capacity effects carried forward without replay.

Every pre-cutover source fact has exactly one **Opening Coverage Disposition**:
`exact_history`, `opening_residual`, `reference_only`,
`intentional_exclusion`, or `unresolved`. The dispositions are mutually
exclusive and collectively exhaustive. An intentional exclusion must be
proved non-balance-bearing; an unresolved fact blocks activation.

The immutable **Opening Coverage Manifest** proves independently for every
Field Account and currency, and again at cohort control totals:

```text
sum(certified, canonical, balance-bearing exact history before cutover)
+ Field Account Opening Position residual
= reconciled boundary position from the Opening Source Package
```

Certified exact history is admitted only when the source adapter proves exact
stable identity, purpose, account, currency, amount, type, effective time,
reversal/correction semantics, non-overlap, deterministic source order, and a
nonnegative balance prefix for every Field Account. An atomic pair or group must
receive one group-complete disposition. D3 assessment detail is admitted only
as one complete, non-overlapping Assessment Period Determination, including its
frozen partial-period policy and every component and correction. Detail that
fails any of those tests remains structurally inert
reference history and the reconciled position stays in the residual. Importing exact history never
replays receipts, communications, workflows, notifications, accounting,
payroll/AP, reimbursement, or other downstream side effects. All other useful
history is privacy-filtered `reference_only` evidence and is structurally
incapable of changing a balance or triggering a side effect.

If a D6 Support Currency Allocation Manifest or another source-conserving
atomic group spans currency cohorts, its exact history is canonical only when
the complete group belongs to one cohort or every affected cohort activates
behind one linked atomic barrier. Otherwise the detail remains reference-only
and each currency uses its independently reconciled residual. No cohort may
claim only part of the source or claim the same source coverage twice.

The admissible nonzero residual becomes one immutable, typed **Field Account Opening
Position** plus its balanced organization-control counter-entry. A zero
position is represented only by complete manifest coverage, not a fake zero
entry. The manifest distinguishes the source-reported position from the
finance-authorized admissible Field Account position. A negative source amount
cannot become a negative Field Account; it may be resolved only through already
source-authoritative obligation or lifecycle-disposition evidence under the
applicable owner domain. D5 applies only when exit or charitable succession is
the actual cause and cannot invent a generic deficit obligation. Otherwise
the complete cohort remains blocked before activation—staff cannot carve out
the negative row merely to start the rest.

### Private preparation and one short operational cutover

- Phase 29 owns private byte identity, storage/access mechanics, malware
  hygiene, and access audit. Phase 30 owns import-session/upload UX, transport,
  replaceable parsing and mapping mechanics, resumable job mechanics, and
  review scaffolding. Phase 21 owns source precedence, semantic mapping
  admissibility, exact-history qualification, cohort completeness, coverage,
  conservation, activation, evidence-retention purpose, and correction
  semantics.
- Preparation is private, chunked, resumable, idempotent, bounded, and
  non-authoritative. It uses immutable inputs, stable operation IDs,
  checkpoints, poison-row isolation, deterministic rebuilds, and
  production-shaped shadow reconciliation. It cannot publish missionary truth
  or create downstream effects.
- Finance reviews exceptions, mapping, source limitations, per-account and
  cohort totals, exact-versus-reference history, and the consequence of the
  proposed boundary. Routine clean rows require no row-by-row approval.
- Activation is one short Asym-side CAS-guarded fence. At the final action,
  Asym reauthorizes the actor and re-proves source generation, complete cohort,
  identities, mappings, control totals, every predecessor boundary, captured
  first-close cursor, in-flight classification, independently live coverage,
  manifest generation, and absence of unresolved or inadmissibly negative
  facts. A stale preview or changed
  generation fails safely and returns to review.
- The cutover pins one exact half-open boundary for every predecessor source
  family and then activates the complete cohort once. Each crossing atomic
  occurrence is classified wholly as prior-owner or Asym-owned. It proves only
  the bounded sources inspected and one common through boundary for the
  Finance-confirmed position; Asym must never claim it locked an external
  writer it does not control. Unfreezable sources require a captured snapshot
  or cursor, explicit in-flight classification, and post-activation overlap/gap
  monitoring.
- Before the fence, a candidate generation may be discarded or replaced.
  After the fence, there is no destructive rollback or reinterpretation of the
  original manifest, Opening Position, closed Support Cycle, or statement.
  Recovery is append-only, cause-linked, idempotent, and bounded to the smallest
  affected Tenant, Legal Entity, account, currency, source, and interval.
  Unaffected work proceeds and mandatory adverse corrections continue.

### Independent Phase 20 and Phase 30 boundaries

- **Phase 21 D17** owns Field Account opening authority. It does not assign the
  accounting posting owner governed by **Phase 20 D17**.
- Opening Source Packages, manifests, Opening Positions, reference history, and
  the Field Account Operational Cutover are accounting-dark. A residual
  Opening Position is not automatically a QBO/Xero journal or a proved
  accounting gap.
- Only a separately accountant-certified source occurrence proved unposted
  under Phase 20 D17 may enter its gap-only backfill. Existing provider entries
  remain previous-owner evidence and are never rewritten as Asym delivery.
- Phase 21 and Phase 20 half-open boundaries remain independently authoritative
  even when a tenant intentionally aligns them. Phase 30 transport status,
  commit, or undo never implies Phase 21 activation.
- Every Phase 21 decision other than D17 follows its own dependency path, but
  Phase 21 D17 activation is feature-gated until certified Phase 29 private-
  byte/access and Phase 30 import-session transport/staging seams exist, or
  those exact seams are pulled forward under their owning phases. This ruling
  does not pretend those runtimes already exist.

### Quiet staff and missionary experience

The staff surface is one accessible, save-and-resume **Start Field Accounts**
flow:

1. **Choose source** — identify the authoritative position source and exact
   through boundary for every predecessor source family; attach supporting
   artifacts without implying equal authority.
2. **Match accounts** — accept only exact stable identity; show conflicts and
   unmapped rows in one exception-first queue with guided bulk mapping.
3. **Reconcile** — show per-account position, exact-history coverage, residual,
   exclusions, unresolved facts, and cohort control totals in plain language.
4. **Start Field Accounts** — one finance-authorized action with concise copy
   explaining what becomes authoritative, what remains reference-only, the
   exact through time, and that post-start recovery is fix-forward.

Fresh tenants with no prior position get a quiet zero-manifest path. Technical
manifest details, hashes, parser versions, and evidence retrieval stay behind
progressive disclosure. Errors are persistent and actionable; no color-only
state, hover-only help, jargon-first copy, or row-by-row bureaucracy is
required. Missionary access remains governed by D9. When the applicable
publication profile does not authorize a balance or reference history, those
facts are not queried, cached, exported, or exposed. When authorized, the
missionary sees only the calm Finance-confirmed support balance for each ISO
currency with its exact through date and separately permitted, privacy-safe
reference history. Opening activity never masquerades as a new donation or
availability claim.

Activation may cause one current-source-version transition that rebuilds a D9-
authorized workspace and the Phase 31 projection through their normal snapshot
or current-state change contracts. It never replays itemized historical feed
events, notifications, receipts, communications, statements, accounting,
payroll/AP, reimbursement, or workflows. Reference-only history never enters D2
admission or the D8 support feed.

### D17 adversarial disposition

| Risk                      | Concern?                                                                                                                          | Permanent control                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness               | Yes — source disagreement, late facts, or an unfreezable writer can break a date-only import.                                     | Precedence-explicit source package, exact boundary, in-flight classification, resumable staging, one CAS fence, and overlap/gap monitoring.             |
| Technical debt            | Yes — a migration-only balance table or duplicate importer would fork owner-domain rules.                                         | Phase 30 transport reuse plus Phase 21 canonical occurrences, coverage, policy readers, jobs, and idempotency seams.                                    |
| Edge cases                | Yes — zero/negative positions, departed workers, reused names, three-decimal currencies, DST, and late corrections are realistic. | Complete cohort, exact identities and minor units, explicit dispositions, D5 negative handling, and correction fixtures.                                |
| Footguns                  | Yes — fuzzy mapping, silent exclusion, stale activation, or editing an opening can corrupt every later balance.                   | No fuzzy financial identity, unresolved-blocks, final reauthorization/reproof, role separation, and append-only fix-forward.                            |
| Tenant safety             | Yes — cross-scope mappings or artifacts can leak or mix balances.                                                                 | Structural Tenant/Legal Entity/account/purpose/currency keys, scoped storage paths and jobs, RLS, and substitution tests.                               |
| Over-engineering          | Yes — universal migration DSLs, live GL mirrors, or mandatory full history add fragility.                                         | Small source-family adapter contract, residual-first default, optional certified exact history, and no dual write.                                      |
| UX/UI friction            | Yes — row approval, migration jargon, or noisy missionary banners destroy trust.                                                  | Four-step exception-first flow, clean-row bulk progress, plain consequences, save/resume, progressive disclosure, and accessible reflow.                |
| Hidden coupling           | Yes — provider, importer, notification, or statement shapes could accidentally become balance authority.                          | Owner-domain package/manifest independent of transport and a strict no-side-effect admission firewall.                                                  |
| Failure modes             | Yes — crashes or retries around activation can create ambiguous authority.                                                        | Immutable generations, checkpoints, inspect-before-retry, CAS activation, pre-fence discard, post-fence correction, and restore-epoch tests.            |
| Data integrity            | Yes — full history plus a full opening double-counts; aggregate ties can hide account errors.                                     | Exactly-one disposition and per-account plus cohort conservation proof with uniqueness and overlap/gap constraints.                                     |
| Security/privacy          | Yes — migration evidence can contain donor, worker, bank, tax, or payroll data.                                                   | Private encrypted storage, least privilege, malware/content validation, redacted previews/logs, protected retrieval, retention, and no public URLs.     |
| Scale/performance         | Yes — whole-history transactions and full-table reconciliation will fail at production volume.                                    | Chunked bounded staging, bulk operations, incremental checkpoints, partition-aware reads, short activation, and workload tests.                         |
| Operational burden        | Yes — bespoke tenant rituals and manual clean-row review would create tribal knowledge.                                           | Guided defaults, reusable source profiles, exception-only work, control-total templates, dry runs, and restartable jobs.                                |
| Observability             | Yes — a green import count can hide gaps, duplicates, drift, or side effects.                                                     | Scope-labelled metrics, immutable operation/manifest IDs, stage telemetry, per-disposition counts, control deltas, and reconciliation cases.            |
| Dependencies/integrations | Yes — exports, parsers, and provider semantics drift.                                                                             | Raw digests, pinned parser/schema/adapter/mapping versions, capability certification, golden fixtures, and fail-closed drift handling.                  |
| Migration/upgrade         | Yes — schema changes, restores, or reimports can mutate or replay the opening.                                                    | Portable immutable packages/manifests/occurrences, successor versions, restore reconciliation, and destructive-reimport prohibition.                    |
| Other hazards             | Yes — concurrency, TOCTOU authorization, clock skew, overflow, and weak rollback cluster at activation.                           | Checked integer arithmetic, deterministic ordering, final CAS/reproof, bounded retries, kill switches, explicit ownership, and crash/concurrency tests. |

### Required production proof

1. Contract and property tests prove complete cohort enumeration, exactly-one
   disposition, atomic-group completeness, complete D3 Assessment Period
   Determination coverage,
   deterministic order, nonnegative prefixes, non-overlap, exact minor-unit
   conservation, and deterministic rebuilds for zero, nonzero, negative,
   three-decimal, and multi-account cases. Any unresolved or inadmissibly
   negative pre-activation row blocks the whole cohort.
2. Adapter golden fixtures and mutation tests prove source precedence, exact
   identity, effective-time/cursor semantics, reversals, corrections, and
   capability drift; uncertified detail remains reference-only. Cross-currency
   fixtures prove a D6 source manifest is wholly contained or linked across all
   affected cohorts, with no partial source coverage or double claim.
3. Concurrency and failure tests cover simultaneous prepares, mapping changes,
   stale previews, permission revocation, source mutation, duplicate activation,
   crashes before/during/after the fence, retries, restore epochs, and late
   pre-cutover facts without duplicate effects or rewriting the original
   manifest, Opening Position, closed cycle, or statement. The captured
   ingestion cursor is proved as the first D11 close predecessor, and every
   independently live capacity effect remains covered exactly once.
4. Side-effect firewall tests prove opening admission cannot replay receipts,
   messages, notices, workflows, statements, payroll/AP, reimbursement,
   accounting, portal history, or itemized external feed changes. A separately
   authorized current-state projection transition is allowed only through D9
   and Phase 31 version/snapshot contracts.
5. Tenant-isolation and security tests substitute every Tenant, Legal Entity,
   account, purpose, currency, source, artifact, operation, mapping, and manifest
   identifier across reads, writes, jobs, exports, caches, audit, and recovery.
6. Scale tests use production-shaped account and history volumes and prove no
   giant transaction, whole-history replay, tenant starvation, or unbounded
   scan at activation.
7. Usability and WCAG 2.2 tests prove finance users can identify the authority
   source, resolve exceptions, understand totals and the cutover consequence,
   recover a stale review, and distinguish exact from reference history without
   training; keyboard, screen reader, focus, errors, 320-CSS-pixel reflow, 400%
   zoom, touch, and non-color state all remain usable. D9 authorization tests
   prove an unpublished balance or reference history is not queried, cached,
   exported, counted, or leaked.
8. Release fails if any path creates a mutable balance scalar, negative Field
   Account, fuzzy mapping, silent exclusion, fabricated history, partial cohort
   activation, dual write, destructive rollback, whole-history or downstream
   replay, public evidence, QBO/Xero balance authority, or an unqualified claim
   that Asym locked an external source.

### Evidence

- [D17 opening-position and cutover research](./phase-21-mission-dashboard-product-research-evidence.md#d17-ratified-direction-reconciled-field-account-opening-positions-and-operational-cutover)
- [ADR-0078 — Reconciled Field Account Opening Position and operational cutover](../../adr/0078-reconciled-field-account-opening-position-and-operational-cutover.md)
- [Fragment migration lifecycle](https://fragment.dev/docs/ledger/migrations)
- [Modern Treasury ledger transactions and immutable balancing](https://www.moderntreasury.com/journal/how-to-scale-a-ledger-part-v)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)

### Remaining founder decisions

Phase 21 D17 settles the complete opening cohort, source precedence, exact-versus-
reference history, residual Opening Position, exhaustive manifest,
conservation, private preparation, operational cutover, late-fact recovery,
Phase 20/30 authority split, and quiet staff/missionary experience. It does not
reopen D1-D16, create general migration scope, require complete legacy history,
post prior books, run payroll/AP, replay downstream effects, or make QBO/Xero a
Field Account authority.

The next unresolved Phase 21 production seam is calculated travel expense
evidence—especially mileage and per-diem—whose rate authority, jurisdiction,
effective dates, substantiation, exceptions, and claimant/finance experience
must be decided without turning Asym into a tax engine. That decision continues
one founder ruling at a time.

## D18 — Certified, policy-pinned Travel Allowance Calculations

**Founder ruling:** ratified 2026-08-01.

> **C-prime-amended-and-hardened (C-prime-R) — one optional,
> tenant-authorized, policy-pinned Travel Allowance Calculation inside the
> single winning D13 Expense Governance Profile, with an explicit
> Actual-expenses-only default; bounded typed mileage, fixed-allowance,
> actual-against-limit, and externally calculated modes; tenant/adviser-owned
> applicability; individually capability-certified and immutably versioned
> official Source Packages or bounded tenant-owned schedules; exact
> claimant-Party-, source-owned-relationship/engagement-, purpose-, jurisdiction-, location-,
> policy/tax-period-, currency-, vehicle-, trip-, supplied-meal-, partial-day-,
> long-stay-, band-, cap-, coverage-, and rounding evidence; deterministic
> serialized cumulative capacity and duplicate-reimbursement protection;
> prospective CAS-guarded policy activation with production-shaped preview and
> append-only retroactive-source or late-fact recovery; low-friction route,
> odometer, manual, optional-GPS, per-day, and offline-draft claimant paths; one
> calm accessible total with exact on-demand explanation; privacy-minimized
> optional route evidence; quiet typed exception-first finance recovery; and a
> permanent evidence-backed actual/external fallback; one D13 incurred-date
> resolution recorded as an immutable typed calculation occurrence inside D10
> claim truth and frozen only through the Approved Expense Snapshot—while
> D10/D13 retain claim and approval authority, D1/D2 retain Field Account truth,
> D15 retains handoff authority, Phase 20 retains accounting authority, and
> external specialists/providers retain tax, payroll, payment, and legal-
> classification authority; without live approval-time source calls, global-
> compliance claims, arbitrary or natural-language financial rules, rule-order
> precedence, claimant-selected policy, implicit FX, mandatory GPS, mutable or
> destructively deleted calculations, silent fallback or recalculation,
> stacked reimbursement, or any claim that calculated or approved means
> available, payable, tax-free, posted, reimbursed, or paid.**

### One bounded D13 module, not a Travel product

- D18 adds one optional **Travel reimbursements** calculation section to the
  single winning D13 Expense Governance Profile Version. It creates no
  `TravelPolicy`, assignment system, second resolver, workflow graph, approval
  queue, navigation product, payment rail, accounting projection, or tax
  engine.
- The quiet default is **Actual expenses only**. A tenant may enable mileage,
  fixed meals/incidentals, actual meals or lodging checked against a policy
  limit, a bounded combined plan, or an evidence-backed external calculation.
- D13 resolves exactly one profile for each Expense Claim Version item or split
  from the incurred date and existing specificity lattice. Submission-time
  facts may route approval but do not select a different calculation policy.
  Claimants never select among finance policy variants.
- Tenant flexibility comes from prospective profile variants, individually
  certified named schedules, bounded tenant/adviser-owned schedules, and the
  permanent external-calculation lane. There is no executable formula, script,
  regular expression, natural-language financial authority, hidden first/last
  match, or administratively ordered precedence.

### Separate source, applicability, calculation, and financial truth

One official schedule can be arithmetically correct yet inapplicable to the
tenant, claimant Party, source-owned relationship/engagement, trip, or payment.
D18 therefore separates:

1. **source truth** — exactly what a named authority published, for which
   interval, population, location, vehicle, component, currency, and policy
   purpose;
2. **applicability truth** — the tenant or its qualified adviser confirms which
   source and method govern the exact source-owned relationship/engagement,
   claimant Party, purpose, and jurisdiction;
3. **calculation truth** — the immutable inputs, winning profile, source
   revision, deterministic components, coverage, rounding, and result;
4. **claim and approval truth** — D10 and D13 remain authoritative and approval
   alone freezes the exact calculation into an Approved Expense Snapshot; and
5. **obligation, capacity, payment, payroll/tax, and accounting truth** — D1/D2,
   D15, Phase 20, and the applicable external specialist/provider remain
   independently authoritative.

`Certified` means only that Asym faithfully captured and executes a specifically
named source inside its declared capability envelope. It never means the source
is legally applicable, tax-free, deductible, mandatory, reasonable for every
tenant, or globally compliant.

### Immutable Source Packages and exact calculation occurrences

Every supported official schedule is ingested ahead of use into an immutable,
content-addressed **Travel Allowance Source Package** that pins primary-source
evidence; source and revision identity; publication, retrieval, and effective
times; population and capability envelope; exact rows and components; currency
and units; parser/schema version; digest; validation; and certification
evidence. Claim creation, calculation, review, and approval never depend on a
live government, mapping, route, or commercial API.

Automated source refresh creates only a candidate package. Schema and semantic
diffs, production-shaped fixtures, and product certification precede tenant
availability. Adoption is tenant-authorized and prospective by default. A
retroactively effective source creates an explicit impact case: unapproved
work may be deliberately recalculated with a visible difference; approved work
requires a source-linked append-only adjustment, exception, or documented
no-change disposition. No source change rewrites a prior claim, calculation,
Approved Expense Snapshot, obligation, Field Account occurrence, handoff, or
accounting release.

Each immutable **Travel Allowance Calculation Occurrence** belongs to one exact
D10 Expense Claim Version item or split and preserves:

- Tenant, Legal Entity, claimant Party, purpose, source-owned relationship or
  engagement and classification context, winning D13 profile and resolution
  evidence;
- source kind, package/revision/digest, applicability confirmation, exact
  effective interval, capability state, and separately preserved publication,
  occurrence, submission, approval, obligation, and any source-required
  payment dates;
- exact trip instants, destination-local IANA timezones, locations and match
  evidence, segments, duration, partial days, supplied meals, long-stay stage,
  and actual-cost evidence where applicable;
- exact decimal distance and unit, evidence method, accepted route/odometer/
  manual facts, vehicle kind and registration jurisdiction when required, plus
  separately claimed parking or toll coverage;
- cumulative-capacity key, deterministic order, before/after capacity,
  threshold split, component coverage, caps, exclusions, and duplicate-
  reimbursement proof; and
- ISO currency, exact rational rates, unrounded component values, declared
  rounding stages and mode, rounded minor-unit values, remainder, final result,
  warnings, actors, and version lineage.

Material draft changes create successor Expense Claim and calculation versions.
Submission references an exact occurrence. The Approved Expense Snapshot freezes
it; the calculation itself does not approve the claim or create reimbursement,
funding, payment, payroll, tax, or accounting truth.

### Cumulative capacity, coverage, currency, and failure recovery

- A cumulative schedule uses one exact Tenant × Legal Entity × claimant Party
  × source-owned relationship/engagement version × source/package × policy/
  tax-period × vehicle-kind and source-required associated-scope capacity key.
  Allocation is serialized or uses equivalent
  compare-and-swap reservation. Occurrences order deterministically by the
  policy-owned instant and stable opaque identity, not arrival or reviewer
  timing. Threshold-crossing claims split exactly between bands.
- Preview never reserves capacity and is visibly estimated when authoritative
  shared capacity can still change it. A late earlier occurrence never mutates
  approved history; it produces exact re-evaluation evidence and append-only
  correction or finance review.
- Coverage prevents mileage and mutually exclusive actual vehicle-operating
  costs from covering the same segment, and prevents per diem and the same
  actual meal from covering the same claimant-Party/date/component. Parking,
  tolls, or other source-authorized separate components retain independent
  evidence.
- Distance, rate, and money calculations use exact decimal/rational values.
  Rounding occurs only at the declared component or claim boundary. Every
  source and result has an explicit ISO 4217 currency. D18 performs no FX;
  differing currencies require D6 externally owned conversion evidence or the
  external-calculation lane.
- Source outage, schema drift, ambiguous location, unavailable route, denied
  GPS, offline synchronization, unsupported combination, or calculation-proof
  failure preserves claimant work and contains only the affected item. The
  user receives an actual-expense, manual/odometer, external-calculation, or
  typed finance-review path. No silent rate, location, jurisdiction, currency,
  or policy fallback is permitted.

### Quiet, progressive tenant and claimant experience

Staff configure travel inside one collapsed **Travel reimbursements** section
of the future Expense Program / Expense Governance Profile surface:

1. **Choose method** — actual expenses, mileage, per diem/allowance, a bounded
   combination, or calculated outside Asym.
2. **Choose source** — one supported named package, organization schedule, or
   external calculation.
3. **Confirm applicability** — summarize the existing D13 assignment, Legal
   Entity, policy cohort, purpose, geography, currency, authorized policy owner,
   and prospective incurred-date boundary. Show affected population and exact
   `Why this profile wins` evidence; unresolved overlap or positive-population
   gaps block activation.
4. **Test with trips** — the exact production evaluator shows ordinary,
   boundary/partial-day, threshold/supplied-meal, unsupported, and tenant-entered
   examples without creating a claim, reservation, or financial occurrence.
5. **Review and activate** — show a human-readable diff, source revision,
   coverage, unsupported cases, exact future consequence, and preserved prior
   claims before one authorized CAS-guarded activation.

Advanced controls appear only when the chosen certified method needs them.
Referenced or active versions cannot be edited or deleted; staff clone and
prospectively supersede them. Healthy configuration creates no recurring
administrative task. Only an applicable source change, policy conflict,
unsupported case, or real exception surfaces work.

Missionaries retain one **Expenses** doorway and one **Add expense** action.
Mileage appears only when enabled and offers route, odometer, and manual
distance as equal first-class methods; optional GPS is requested only after the
claimant chooses it. Per diem asks only the destination, trip dates/times,
purpose, supplied-meal, partial-day, lodging, or long-stay facts the winning
method actually requires. Offline/local drafts retain explicit safe states and
idempotent synchronization.

The ordinary result is one calm **Calculated amount**, ISO currency, short
policy label, and through/effective date. **How this was calculated** reveals
exact human-readable component math, source revision, rounding, reductions,
and changes. **This doesn't look right** preserves the draft and routes to
claimant correction or finance review. No copy implies approval, availability,
payability, reimbursement, payment, tax treatment, payroll readiness, posting,
or reconciliation.

Finance sees calculation evidence inside the existing D10 review surface.
Clean claims remain ordinary work. Only typed causes—missing claimant facts,
unsupported policy, ambiguous location/jurisdiction, duplicate coverage,
source change, late cumulative effect, required conversion evidence, or missing
calculation proof—enter the exception-first workspace. Each exception states
the cause, safe remainder, owner, and next action. Bulk approval is limited to
homogeneous clean claims using the same visible profile and source version.

GPS is Off by default and never mandatory. Route, home, ministry-location,
companion, date, and receipt evidence is purpose-minimized, least-privilege,
encrypted, access-audited, and excluded from broad logs and exports. Raw
continuous telemetry requires a separate tenant-visible retention purpose and
is never the default approved evidence.

### D18 adversarial disposition

| Risk                      | Concern?                                                                                                                                | Permanent control                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness               | Yes — live sources, fuzzy locations, retroactive revisions, and flat schemas break repeatability.                                       | Immutable local Source Packages, exact matching evidence, typed capability envelopes, and actual/external fallback.                                                     |
| Technical debt            | Yes — a second resolver and country conditionals would drift from D13.                                                                  | One D13 resolver, canonical calculator contract, source adapters, shared exact-money/band primitives, and no formula language.                                          |
| Edge cases                | Yes — DST/date line, partial days, mixed locations, supplied meals, thresholds, currencies, and late claims are normal missions travel. | Exact instants/IANA zones, segmented components, deterministic capacity, source-owned date rules, and append-only recovery.                                             |
| Footguns                  | Yes — universal government rates, backdating, stacking, destructive deletion, and broad bulk approval can produce false authority.      | Applicability confirmation, prospective immutable versions, coverage proof, supersession, and guarded operations.                                                       |
| Tenant safety             | Yes — policies, counters, routes, and exceptions can cross scope.                                                                       | Structural Tenant/Legal Entity/claimant-Party/source-relationship/purpose/currency scope, authorization-before-enumeration, scoped jobs/caches, and substitution tests. |
| Over-engineering          | Yes — worldwide tax, GPS, route, FX, and arbitrary-rule products would exceed Phase 21.                                                 | Quiet default, finite methods, individually certified sources, bounded tenant schedules, and external calculation.                                                      |
| UX/UI friction            | Yes — knob-heavy setup and policy jargon drive users to spreadsheets.                                                                   | Goal-first progressive setup, automatic winner, one calm result, mobile/offline capture, and exception-first review.                                                    |
| Hidden coupling           | Yes — calculation could be mistaken for approval, capacity, payroll, payment, or accounting.                                            | Immutable evidence only and independently authoritative D10/D13, D1/D2, D15, Phase 20, tax, payroll, and payment contracts.                                             |
| Failure modes             | Yes — partial import, ambiguity, races, offline conflict, or missing proof can create false success.                                    | Atomic package certification and calculation proof, idempotency, serialization/CAS, inspect-before-retry, and smallest-scope recovery.                                  |
| Data integrity            | Yes — duplicate band use, float drift, double coverage, overlap, and historical mutation corrupt totals.                                | Stable occurrence IDs, exact arithmetic, half-open intervals, coverage keys, atomic allocation, immutable versions, and conservation tests.                             |
| Security/privacy          | Yes — travel routes and locations can endanger missionaries.                                                                            | Optional just-in-time GPS, manual alternatives, minimization, field-level access, purpose-owned retention, encrypted evidence, and redacted logs.                       |
| Scale/performance         | Yes — global scans, map calls, large tables, and threshold locks fail at close.                                                         | Indexed local packages, narrow capacity ledgers, per-key serialization, chunked previews, tenant-fair queues, and load proof.                                           |
| Operational burden        | Yes — manual source monitoring and rate maintenance create tribal work.                                                                 | Asym-certified supported-source updates, guided tenant imports, affected-tenant-only notices, semantic diffs, and cause-grouped exceptions.                             |
| Observability             | Yes — an unexplained amount is unauditable.                                                                                             | Immutable provenance, `Why this applied`, safe correlation/reason codes, source/capacity metrics, and exact diagnostic replay.                                          |
| Dependencies/integrations | Yes — source, map, mobile-permission, and API contracts drift.                                                                          | Adapter contracts, raw evidence, semantic validation, cached packages, capability labels, circuit breakers, and manual continuity.                                      |
| Migration/upgrade         | Yes — schema changes and incomplete cumulative history can invalidate old calculations.                                                 | Versioned readers, retained artifacts, explicit opening cumulative capacity, dry runs, and no historical rewrite.                                                       |
| Other hazards             | Yes — non-authoritative preview, concurrent bands, rounding/timezone bugs, stale activation, and shallow tests remain material.         | Non-reserving preview, linearizability/property tests, declared rounding, timezone fixtures, CAS, idempotency, accessibility, offline, and device tests.                |

### Required production proof

1. Pure deterministic evaluator and property tests cover exact incurred/effective
   boundaries, units, rational rates, minor-unit rounding, partial days,
   supplied meals, long stays, caps, bands, threshold splits, cumulative
   concurrency, source revisions, external calculation, no-FX enforcement,
   duplicate coverage, corrections, and conservation.
2. D13 resolver tests prove exactly one non-stacking winner. D10 tests prove a
   calculation cannot create policy approval, Approved Expense Snapshot,
   Reimbursement Obligation, Field Account effect, payment, payroll/tax, or
   accounting truth.
3. Source-adapter certification uses primary-source provenance, raw evidence,
   digests, semantic-diff and mutation fixtures, location ambiguity, outage,
   rate limit, malformed response, retrospective revision, and historical-
   replay tests before a source is labelled certified.
4. Concurrency and fault tests prove preview is non-reserving, shared cumulative
   capacity is linearizable, retries cannot double-consume capacity or duplicate
   a calculation, stale activation fails by CAS, and late earlier occurrences
   recover append-only.
5. Tenant-isolation and authorization tests substitute every Tenant, Legal
   Entity, claimant Party, source-owned relationship/engagement, cohort,
   purpose, source/package, location, claim,
   currency, route, artifact, capacity, exception, and operation identity
   across reads, writes, jobs, previews, exports, caches, audit, and recovery.
6. Authenticated admin and missionary journeys prove progressive configuration,
   representative preview, prospective activation, manual/odometer/optional-
   route mileage, per diem with supplied meals, offline drafts, calculation
   explanation, clean review, unsupported-case recovery, approval freeze, and
   D15 handoff without creating parallel truth.
7. Accessibility proof includes native label association, fieldsets/legends,
   linked errors and summary, status announcements, keyboard/focus management,
   non-color states, 320-CSS-pixel reflow, 400% zoom, Core touch targets, dark
   mode, reduced motion, and a non-map path. Generic public-route Axe coverage
   is insufficient.
8. Release fails if any path introduces a second travel policy/resolver/queue,
   live approval-time lookup, formula or natural-language financial authority,
   rule-order precedence, claimant policy selection, implicit FX, mandatory
   GPS, destructive rate deletion, silent fallback/recalculation, stacked
   reimbursement, historical rewrite, or authority-inflating copy.

### Evidence

- [D18 travel-allowance research and adversarial review](./phase-21-mission-dashboard-product-research-evidence.md#d18-grooming-evidence-mileage-and-per-diem-calculation)
- [ADR-0079 — Certified, policy-pinned Travel Allowance Calculations](../../adr/0079-certified-policy-pinned-travel-allowance-calculations.md)
- [ADR-0074 — Bounded prospective Expense Governance Profiles](../../adr/0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0076 — Artifact-always reimbursement handoff](../../adr/0076-artifact-always-reimbursement-handoff.md)
- [IRS standard mileage rates](https://www.irs.gov/tax-professionals/standard-mileage-rates)
- [GSA Per Diem API](https://open.gsa.gov/api/perdiem/)
- [CRA automobile allowance guidance](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances/automobile/automobile-motor-vehicle-allowances.html)
- [HMRC Approved Mileage Allowance Payments](https://www.gov.uk/government/publications/increase-to-approved-mileage-allowance-payments-amaps-and-self-employed-simplified-mileage-rates)
- [ATO reasonable travel allowance amounts](https://www.ato.gov.au/law/view/document?docid=TXD/TD20254/NAT/ATO/00001)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

D18 settles the travel-calculation authority boundary, bounded method catalog,
source certification, tenant applicability, exact calculation occurrence,
cumulative capacity, duplicate coverage, source-update and failure recovery,
privacy posture, and the complete staff, missionary, and finance experience. It
does not reopen D1-D17 or make Asym a travel booking, tax, payroll, payment,
route, FX, accounting, or global compliance product.

That complete D1-D18 scope and congruency audit selected the canonical Field
Account subject and its participant/access boundary as D19 below.

## D19 — Organization-controlled Support Assignments and separated participant access

**Founder ruling:** ratified 2026-08-01.

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> organization-controlled, Tenant- and Legal-Entity-scoped Support Assignment
> as the canonical Field Account subject, with one Field Account per Support
> Assignment and ISO currency; zero-to-many prospective, effective-dated,
> append-only-corrected Support Assignment Participant Memberships; and
> separately authoritative Phase 12 principal-bound Workspace Access, source-
> owned operational responsibility, and recipient-scoped Support Workspace
> Notification Preference Versions.
> One quiet “People & access” experience may commit the explicitly selected
> local truths and outbox intent through tenant-configurable safe presets and
> one literal consequence review, while every spouse, teammate, leader, coach,
> and staff member retains a separate Party identity and, where applicable,
> separate login principal, invitation, access, claimant, responsibility, and
> preference identities. Participant-free
> projects, shared couples/teams, separate spouse assignments, several
> assignments per person, scoped leadership, mobile-complete invitation and
> recovery, deny-first revocation, life-event succession, exact per-assignment
> and ISO-currency navigation, composite Tenant/Legal-Entity scope, coarse
> forced RLS, server-only projections through the sole Phase 12 PDP, signal-only
> Realtime, append-only evidence, and production-shaped isolation, concurrency,
> performance, privacy, and accessibility proof are mandatory—without person-
> or household-owned funds, shared credentials, implicit spouse/team/leader
> access, relationship-based authorization, broad account sharing, a Phase 21
> ACL engine, assignment-aware RLS, JWT grant lists, client-trusted scope, raw
> financial `postgres_changes`, destructive merge, cascade deletion, stale
> notification eligibility, or participation-driven money movement.**

### One canonical organization-controlled subject

- A **Support Assignment** is the stable organization-controlled subject that
  an approved field purpose and its Field Accounts belong to. It is scoped to
  exactly one Tenant and Legal Entity. It is not owned by a missionary, spouse,
  household, team member, leader, donor, login, or external provider.
- Exactly one Field Account may exist for each `Tenant × Legal Entity × Support
Assignment × ISO currency`. D6 sibling currencies remain separate Field
  Accounts. Participant count and identity never enter account arithmetic.
- A Support Assignment may have no participant, one participant, or several
  participants. One Party may participate in no assignment, one assignment, or
  several assignments. A project remains valid with zero participants.
- A **Support Assignment Participant Membership** records only that one Party
  participates during one exact half-open interval. It is prospective,
  effective-dated, source- and actor-evidenced, and corrected by a linked
  successor/end/correction rather than mutation.
- Duplicate or overlapping membership intervals for the same Party and Support
  Assignment are rejected structurally. Party merge, marriage, separation,
  death, departure, incapacity, or leadership turnover never merges Field
  Accounts, unions access, cascades deletion, or rewrites history.

Shared spouses or teammates each retain a distinct Party and membership in one
Support Assignment. Spouses with independently governed ministries use
separate Support Assignments. A leader or coach may be associated with an
assignment, responsible for work, authorized to view a projection, subscribed
to updates, or any explicit combination; no label implies another selection.

### Four independently authoritative truths

| Truth                                                 | Exact authority                                                                                                                                                                                                                                                | Never implies                                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Support Assignment Participant Membership**         | One Party's association with one organization-controlled Support Assignment during one exact half-open interval                                                                                                                                                | Login access, claimant/approver/payee identity, notification, donor purpose, financial ownership, money |
| **Phase 12 Support Workspace authorization**          | Request-time, Principal- and Active-Tenant-Assignment-bound purpose, projection, capability, Legal-Entity/Support-Assignment scope, interval, floor, and epoch                                                                                                 | Participation, operational responsibility, relationship authority, or notification preference           |
| **Source-owned operational responsibility**           | D10/D13 own expense claimant, submitter, reviewer, and approval-route truth; D4 plus the exact external Engagement Authority source own compensation/payee identity; Phase 28 owns support-raising coaching and task truth; Phase 12 owns current capabilities | Participation or general workspace visibility                                                           |
| **Support Workspace Notification Preference Version** | One recipient's assignment-, event-family-, channel-, purpose-, and effective-interval-scoped preference                                                                                                                                                       | Access to the underlying data or permission to send it                                                  |

One guided command may atomically write the explicitly selected local records
and enqueue an outbox intent, but it does not collapse their identities,
evidence, state machines, authority, or recovery. External invitation or
message delivery cannot be part of the database transaction. Delivery failure
preserves valid local truth and opens one recoverable exception; a pending or
failed invitation grants nothing.

Phase 12 remains the sole authorization product and Policy Decision Point.
Phase 21 registers its resources, purposes, projections, and smallest useful
capabilities with `resolveProjection`; it does not create a local ACL, RBAC,
ReBAC, permission resolver, role matrix, or relationship-based authorization
path. D10/D13 remain authoritative for expense claims, claimant/submitter
identity, review, and approval routing. D4 plus the exact external Engagement
Authority source own compensation/payee identity. Phase 28 owns support-raising
coaching and task truth. Phase 12 owns current capabilities. Phase 21 owns
the prospective Support Workspace Notification Preference Version and source-
event eligibility input; Phase 6 owns
recipient-specific intent, dispatch, provider outcome, suppression, and
communication history.

### Exact naming and structural scope

- **Support Assignment** is distinct from Phase 12 **Active Tenant Assignment**. The
  latter is the principal's selected Tenant membership/security context for a
  request. Schema and code use `support_assignment_id`, never a bare ambiguous
  `assignment_id`.
- The existing `public.support_assignments` table belongs to Support Hub
  conversation routing. Phase 21 must not reuse, reinterpret, or rename it.
  The physical/API namespace is Field-Accounts-specific, such as
  `field_support_assignments`, while product language remains **Support
  Assignment**.
- Every child relation repeats Tenant and Legal Entity scope keys and uses
  composite same-scope foreign keys. A Party, principal, membership, purpose,
  Field Account, invitation, access reference, responsibility, or notification
  recipient cannot be substituted from another Tenant or Legal Entity.
- Historical and financial references use `ON DELETE RESTRICT` or equivalent
  non-destructive lifecycle. No Party, auth-user, household, team, or assignment
  deletion may erase membership, access, actor, claim, notification, or Field
  Account evidence.
- Semantic idempotency keys include the complete scope and intent. Interval
  exclusion/uniqueness, consistent lock order, version/CAS fences, and
  append-only corrections prevent duplicate memberships, invites, grants,
  notification-preference versions, and stale-browser overwrites.

### Coarse forced RLS and one server authorization path

- Every D19 table enables and forces RLS. RLS is the Phase 12 **coarse Tenant
  isolation backstop**, not the place for principal-, participant-, spouse-,
  leader-, capability-, purpose-, projection-, field-, or Support-Assignment-
  aware authorization.
- Raw D19 tables and current internal projections are browser-inaccessible.
  Every user-facing read or mutation goes through an authorized server boundary
  that invokes the sole Phase 12 PDP and rechecks exact Tenant, Legal Entity,
  Support Assignment, ISO currency where relevant, target, purpose, capability,
  floor, authorization epoch, and record version before enumeration or change.
- Supabase service/secret keys and PostgreSQL `BYPASSRLS` roles are not user
  authority. Every privileged route, job, outbox consumer, repair, export,
  support tool, and scheduled notification explicitly performs the same PDP and
  target-scope checks.
- Fine-grained grants never live in `user_metadata`, JWT arrays, cookies, URL
  state, cached client selectors, or client-submitted scope. Any exposed view is
  `security_invoker=true`; privileged helpers are narrow, non-exposed,
  least-granted, fully qualified, and fixed to a safe search path.
- No raw financial, participant, access, responsibility, or notification table
  uses `postgres_changes`. When live refresh is justified, one private
  signal-only Broadcast carries only opaque resource kind/id, monotonic version,
  and operation. The client then re-fetches through the authorized projection.

### Quiet `People & access` experience

From one Support Assignment, authorized staff open **People & access**, choose
a person, and review three plain-language controls:

1. **Associated with this support balance** — participant association and exact
   effective dates;
2. **Can use the Support Workspace** — one safe starting point or **No workspace
   access**; and
3. **Gets updates** — exact event families and channels or **No notifications**.

Responsibilities appear explicitly when relevant and never hide inside those
controls. Tenant-configurable safe presets may preselect ordinary combinations
prospectively, but each preset compiles into exact Phase 12 capabilities and
explicit Support Workspace Notification Preference Versions; the preset label
is not authority. The common
one-worker path is one short reviewed action. Advanced Phase 12 controls appear
only when requested.

The final review states literally what changes and what does not across
participation, workspace access, responsibilities, notifications, and money/
history. Every person row can answer **why this person is listed**, **what they
can see**, **what they can do**, **what they receive**, and **when each fact
applies**. The ordinary financial consequence reads: **No balance moves. No
closed history changes.** A financial movement or exit disposition is a
separately authorized D5 case.

Every participant who uses the Support Workspace uses their own separately
verified login; participation itself does not require a login. Invitations are
exact-recipient, single-use, expiring, mobile-complete, and recoverable.
Acceptance re-proves the intended identity and current invitation/access
versions. Pending, expired, mismatched, revoked, or failed invitations grant
nothing. Reissue creates a new bounded invitation without resurrecting an old
grant.

A principal with several assignments receives an accessible, deep-linkable
switcher that always names the Support Assignment, Legal Entity where needed,
and ISO currency. There is no authoritative combined balance. Drafts and
mutations pin the exact Support Assignment and currency. An unauthorized or
stale deep link safely chooses an authorized default or returns a uniform
not-found result without revealing the former assignment.

### Deny-first revocation, correction, and life-event succession

- Immediate safety separation may revoke workspace access and invalidate the
  authorization epoch before a prospective participation end. Ordinary
  departure may end each truth at its separately reviewed future boundary.
- Revocation independently invalidates server access, cache eligibility,
  queued notification eligibility, and future delivery before disclosure.
  Reactivating a login never revives revoked grants or notification preferences.
- Notification execution re-proves current recipient identity, purpose,
  authorization, notification preference, suppression, contact point, and event coverage
  immediately before Phase 6 intent release. Stale queued work becomes
  ineligible; it is not sent because it was once queued.
- Wrong participation appends an exact correction/end and, where applicable,
  successor membership. It never rewrites prior statements, claims, actor
  evidence, notifications, or financial occurrences.
- A Party duplicate/merge preserves historical Party/principal evidence and
  enters explicit access and responsibility reconciliation. It never unions
  permissions or silently retargets history.
- Departure, separation, death, incapacity, or leadership turnover shows
  separate consequence rows and unresolved follow-up for participation,
  workspace access, responsibilities/approvals, notifications, and D5 financial
  succession. The affected person need not authorize an emergency removal.

### Current-repository prerequisites

D19 is binding product authority, not a claim that its runtime exists. Before
D19 access can ship, the implementation must land and prove the canonical
Party, Legal Entity, Phase 12 Active Tenant Assignment/PDP/grant runtime, and
Phase 21
tables. The present tenant-wide `authz.memberships`, broad role/profile-based
missionary portal, service-role reads, prototype Teams UI, and local-state
notification UI are not D19 authority.

The migration chain must also prove that final `handle_new_user()` behavior
creates the required safe tenant membership/Active-Tenant-Assignment onboarding
result.
Seed data cannot substitute for that proof, and D19 cannot trust signup metadata
or create a second membership system to compensate.

### D19 adversarial disposition

| Risk                      | Concern?                                                                                                    | Permanent control                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness               | Yes — one-person/login/assignment assumptions fail for normal couples, teams, projects, and stale sessions. | Stable Support Assignment, zero-to-many memberships, exact server scope, and no cross-assignment aggregate authority.              |
| Technical debt            | Yes — scattered spouse/leader checks become a parallel ACL.                                                 | Phase 12's sole PDP, registered atoms, shared projections, and architecture tests that relationship names never authorize.         |
| Edge cases                | Yes — empty projects, several assignments, differing spouse roles, life events, and open work are ordinary. | Independent half-open truths, deterministic fixtures, explicit responsibility succession, and no automatic financial effect.       |
| Footguns                  | Yes — friendly share/remove labels can conceal access, PII, alerts, or apparent money movement.             | Intent-specific controls, safe presets, a literal consequence review, and no broad share-account toggle.                           |
| Tenant safety             | Yes — stale selectors, guessed IDs, invites, and service paths can cross scope.                             | Composite same-scope keys, forced coarse RLS, one PDP, uniform non-enumerating errors, and identity-substitution tests.            |
| Over-engineering          | Yes — arbitrary roles, nested teams, or assignment-aware RLS would create another IAM product.              | One progressive surface, bounded presets, advanced Phase 12 controls, and no Phase 21 ACL/ReBAC engine.                            |
| UX/UI friction            | Yes — users can confuse association, login, responsibility, and alerts.                                     | Three plain-language controls, explicit responsibility, visible invite/recovery, scoped navigation, and WCAG 2.2 AA proof.         |
| Hidden coupling           | Yes — participant count or relationship could affect access, notifications, claims, or balances.            | Four independently authoritative truths, explicit references, invariant tests, and D5-only financial succession.                   |
| Failure modes             | Yes — delivery, identity acceptance, concurrent revoke, or departure can partially fail.                    | Local truth plus outbox, pending-grants-nothing, CAS/idempotency, deny-first epochs, inspect-before-retry, and exceptions.         |
| Data integrity            | Yes — overlap, duplicates, cross-scope FKs, merge unions, or deletion destroy proof.                        | Native constraints, composite FKs, append-only correction, `ON DELETE RESTRICT`, scoped idempotency, and no destructive merge.     |
| Security/privacy          | Yes — spouses, coaches, or leaders could see donor PII, receipts, payee data, or restricted identities.     | Purpose-specific projections, Phase 10/12 floors, separate identity capability, read audit, and independent immediate revocation.  |
| Scale/performance         | Yes — graph joins, N+1 checks, token grant lists, and alert fan-out collapse at scale.                      | Indexed stable keys, set-based PDP evaluation, relational grants, keyset pagination, digest fan-out, and plan/load budgets.        |
| Operational burden        | Yes — manual revoke/invite/responsibility/alert checklists are omission-prone.                              | One life-event flow, prospective safe defaults, reassignment prompts, cause-owned exceptions, and one completion summary.          |
| Observability             | Yes — staff may not know why access exists or why an invite/notification failed.                            | Separate timelines, `explainAccess`, safe reason/correlation IDs, and PII-free invite/revocation/delivery metrics.                 |
| Dependencies/integrations | Yes — identity, email, SCIM, and external grouping contracts drift.                                         | Provider-neutral local truth, exact identity proof, immediate local quarantine, and staged associations that never import grants.  |
| Migration/upgrade         | Yes — legacy shared credentials, merged spouses, or broad account sharing are ambiguous.                    | Source-labelled coverage, separate Party/principal/participation/grant mapping, review-first access, and no fabricated acceptance. |
| Other hazards             | Yes — races, stale caches, covert IDs, duplicate alerts, self-review, or UI-only tests can bypass intent.   | UTC half-open intervals, CAS, DB constraints, Party-based conflict checks, cache epochs, non-enumeration, and behavioral tests.    |

### Required production proof

1. Migration and pgTAP proof covers exact tables, composite keys and FKs,
   exclusion/unique constraints, scope-inclusive indexes, grants, policies,
   `relrowsecurity`, `relforcerowsecurity`, helper hardening, exposed-view
   behavior, and no cascade path through preserved evidence.
2. API/PDP tests prove anonymous, cross-Tenant, cross-Legal-Entity, cross-
   assignment, participant-without-access, access-without-participation,
   spouse/household/leader-without-grant, revoked/expired-old-token,
   restricted-field, enumeration, and privileged-path-without-PDP denial.
3. Concurrency tests race participant add/end/correction, duplicate/future
   intervals, invite accept/revoke/reissue, grant/revoke, Party merge,
   notification enqueue/revoke, life-event succession, and stale-client writes.
4. Production-cardinality plans cover a principal with many assignments, one
   assignment with many participants/viewers, large tenants, keyset paging,
   notification fan-out, and authorization-aware caches without N+1 evaluation
   or growing JWT/token state.
5. Authenticated end-to-end fixtures cover one-worker setup, separate spouse
   logins sharing one assignment, spouses with separate assignments, teams,
   participant-free projects, scoped coaches/leaders, several assignments per
   person, invitation failure/recovery, deny-first departure, notification
   dedupe, and exact assignment/currency navigation.
6. Accessibility proof covers names/semantics, keyboard order, visible and
   unobscured focus, screen-reader context and status announcements, linked
   errors and destructive-consequence review, non-color states, Core target
   sizes, 320-CSS-pixel reflow, 400% zoom, reduced motion, mobile invitation and
   recovery, and safe focus after assignment loss.
7. Release fails if any path authorizes from participation, relationship,
   household, leader label, mutable JWT/client scope, service-key possession,
   or Support Hub's existing table; emits raw financial `postgres_changes`;
   shares credentials; moves money from a people change; creates a combined
   balance; unions access on merge; or destructively rewrites history.

### Evidence

- [D19 canonical-subject, Supabase/PostgreSQL, RLS, and UX research](./phase-21-mission-dashboard-product-research-evidence.md#d19-ratified-direction--canonical-field-account-subject-and-participant-membership)
- [ADR-0080 — Organization-controlled Support Assignments with separated access](../../adr/0080-organization-controlled-support-assignments-and-separated-access.md)
- [Phase 12 full role and permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 1 source-of-truth ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database authorization roles](https://supabase.com/docs/guides/database/postgres/roles)
- [Supabase Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)
- [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL `CREATE POLICY`](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

D19 settles the canonical organization-controlled Field Account subject,
participant membership, Phase 12 access boundary, operational-responsibility
separation, notification eligibility, couples/teams/projects/multi-assignment
behavior, life-event succession, Supabase/PostgreSQL/RLS posture, and the calm
staff and missionary experience. It does not reopen D1-D18, grant ownership to
participants, create money movement, replace Phase 12, or implement runtime
behavior.

The completed [post-D19 preservation and cross-phase congruency
audit](./phase-21-mission-dashboard-product-research-evidence.md#post-d19-preservation-and-cross-phase-congruency-audit)
found no decision loss. It selected organization-incurred benefits, services,
and direct ministry costs outside D3, D4, and D10/D13 as the next material
founder seam. D20 below now resolves that seam without changing D19.

## D20 — Source-authoritative Organization Support Cost Applications

**Founder ruling:** ratified on 2026-08-01.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — an absent-unless-enabled,
> source-authoritative Organization Support Cost Application lane for only
> exact source-final, purpose-compatible residual organization service/direct-
> cost occurrences whose canonical semantic family—not configuration state—is
> exclusively owned by D20 rather than D3, D4, or D10/D13; activated
> prospectively at one source-family half-open boundary through capability-
> certified source-admission contracts, one canonical economic-occurrence root,
> and exclusive cross-lane coverage; with organization-absorbed as the safe
> default, finite tenant-owned bearing treatments, non-calculating evidence-
> backed allocation, private bounded staging, one CAS-published immutable per-
> currency conserving manifest with no unresolved target admitted to close,
> purpose-typed non-reusable Field Account Funding Coverage, and D1-only
> recognition as a D11-balanced same-currency Field Account Occurrence;
> ordinary applications and carryforward constrained by exact nonnegative
> capacity, while mandatory source-owned adverse corrections remain append-only
> and may expose a visible D11 deficit; optional advanced bounded carryforward
> through non-overlapping minor-unit tranches and explicit append-only successor
> disposition rather than worker debt, AP, availability, or silent expiry;
> source-version-pinned deterministic append-only corrections; exact externally
> supplied currency results only; independently authoritative source, Field
> Account, publication, accounting, and external-payment truth; current Phase
> 20 accounting darkness until separately certified posting ownership; complete
> structural tenant isolation and private evidence; and one quiet exception-
> first experience that is invisible when disabled and shows missionaries only
> authorized grouped post-close effects—without fallback ownership, arbitrary
> debits, unresolved-close completeness, participant-derived allocation,
> whole-ledger ingestion, retroactive reclassification, discretionary overdraft,
> live-provider close dependency, duplicate posting, sensitive-detail exposure,
> or Asym benefits, payroll, AP, GL, FX, budget, or formula authority.**

### Exclusive semantic ownership

Phase 21 D20 is a residual application lane, not a fallback. Canonical semantic
family decides the owner even when that owner is disabled, unconfigured,
degraded, or temporarily unavailable.

| Economic fact                                                                                           | Source authority                                                                  | Exclusive Field Account application owner                                      |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Percentage, minimum, flat, cap, exemption, or ordinary service assessment                               | D3 profile, determination, and covered source facts                               | D3 Assessment Entry                                                            |
| Compensation-linked employer cost admitted by a Compensation Funding Plan                               | Exact external payroll, benefits, or Engagement Authority source referenced by D4 | D4 compensation effect                                                         |
| Claimant, organization-card, or approved organization-paid expense                                      | D10 source/economic-payer truth plus D13 approval                                 | D10/D13 expense effect                                                         |
| Processor fee/cost or designation-borne uncovered processor-cost effect                                 | Exact provider evidence and Phase 20 D19 Processor Cost Attribution Manifest      | The separately enabled Phase 21 processor-cost effect only; never Phase 21 D20 |
| Brokerage, liquidation, exchange, custody, or other exact cost covered by one D21 noncash disposition   | Phase 15 disposition source plus the frozen D21 source contract/treatment         | D21 Realized Support Basis treatment only; never Phase 21 D20                  |
| Bill, vendor credit, payment, AP balance, or GL posting                                                 | External AP/accounting authority                                                  | No Field Account effect merely because the record exists                       |
| Exact source-final residual organization service/direct cost assigned to Phase 21 D20's bounded catalog | Enrolled external source or governed exact tenant source                          | Phase 21 D20 Organization Support Cost Application                             |

Turning an owning feature off never makes its facts eligible for Phase 21 D20.
Every source line has one canonical **Support Cost Economic Occurrence Root**
and at most one application owner. Provider aliases, bills, card evidence,
claims, benefit statements, processor-cost evidence, and tenant-entered evidence
for the same real-world cost join that root or enter cause-owned duplicate
review; they never create parallel economics by using different identifiers.

### Source admission and prospective activation

Each enabled family has one prospective, immutable **Support Cost Source
Admission Contract**. It pins Tenant, Legal Entity, provider organization and
environment or governed tenant source, object and line identity, canonical
family, qualifying finality, credit/correction events, completeness watermark,
source currency and precision, adapter/schema version, and capability-expiry
behavior. Finality is family- and provider-specific; `posted`, `approved`,
`authorized`, `paid`, and record existence are never universal equivalents.

Phase 21 D20 accepts only explicitly enrolled, capability-certified source
operations. It does not ingest a tenant's whole payroll, benefits, AP, QBO,
Xero, processor, or expense ledger. A governed tenant source still carries
exact issuer, actor, reference, amount, ISO currency, service/effective period,
semantic family, purpose attribution, and evidence policy. It is not a free-
form **charge balance**, adjustment, or journal command.

Activation is prospective at one exact source-family half-open boundary and
defaults to the next complete Support Cycle. A complete activation manifest
dispositions pre-boundary and in-flight work and proves no overlap with D17
Opening Position truth, a predecessor spreadsheet/manual process, Phase 20 D19
processor-cost coverage, or another application owner. There is no dual write,
ordinary backfill, mutable cutoff, or whole-history replay.

### Bounded tenant policy and allocation

One prospective **Support Cost Bearing Policy Version** chooses, per certified
family, exactly one of:

1. **Organization covers it** — the guided default;
2. **Apply to support balance**;
3. **Split between the organization and support balance**; or
4. **Send to finance for review**.

Exactly one version wins for Tenant, Legal Entity, family, purpose, ISO
currency, and effective interval. Unknown families go to review. Tenant labels
may map to a finite canonical catalog, but no executable formula, script,
journal, percentage of gifts/support/balance, participant-count rule, arbitrary
rule order, or custom lifecycle is permitted.

Allocation distributes one exact source-final occurrence; it does not calculate
the cost. Permitted bases are exact source attribution, a documented contract-
fixed price for service actually provided, fixed proportions of the exact
source amount, or one reviewed exact split. Participant membership, login,
notification preference, current balance, fundraising, and arbitrary weights
cannot select a target or split.

### Exact lifecycle, conservation, and close

The lifecycle remains purpose- and authority-separated:

1. a private **Support Cost Source Observation** has no Field Account effect;
2. certified finality qualifies one immutable **Organization Support Cost
   Occurrence**;
3. an immutable **Support Cost Application Determination** proposes exact
   dispositions and opens cause-owned review for anything unresolved;
4. one short CAS fence publishes one immutable **Support Cost Application
   Manifest** and exact purpose-typed, non-reusable Field Account Funding
   Coverage for every eligible target; and
5. D1 Support Cycle Admission Coverage and close alone recognize an applied
   effect as one atomic D11 balanced same-currency Field Account Occurrence.

`Unresolved` is progress/exception truth, never a close-complete disposition.
It blocks only the smallest proved affected target; independently complete
targets may close. Before close, copy says **Targeted to support balance**, not
**Applied**. D1 close reads persisted qualified evidence and never calls a live
provider.

Every source root and target manifest is scoped by Tenant, Legal Entity, ISO
currency, Support Assignment, and Field Account as applicable. It proves both:

```text
source-currency terminal dispositions + source-currency unresolved
= exact qualified source amount

each target-currency terminal disposition
= exact externally supplied target-currency amount
```

Different currencies are never added. Checked deterministic minor-unit
allocation assigns every rounding unit to an explicit terminal bucket. Native
coverage constraints prevent D3/D4/D10/D13/Phase 20 D19/Phase 21 D20/D21
overlap,
and every recognized effect commits its Field-Account-side entry and
organization-control-side counter-entry atomically.

### Capacity, carryforward, correction, and succession

A Phase 21 D20 application never makes a Field Account negative and never
silently assigns a remainder to one. The insufficient-capacity guided outcome
is organization absorption or finance review. A tenant may prospectively
enable one advanced **Support Cost Carryforward** with a per-Field-Account/
currency maximum, maximum age, and explicit `organization absorbed` or `review
required` successor. Non-overlapping minor-unit tranches reserve capacity once
through ordinary purpose-typed coverage.

Carryforward has no current Field Account effect, never means worker debt, AP,
availability, or payment, and never silently expires. At maximum age it appends
the configured successor disposition. Retirement does not move it to another
Field Account automatically. D5 source-owned lifecycle succession controls any
valid corrective target.

A source credit, cancellation, refund, reclassification, or correction stays
with the original application owner and pinned source, policy, allocation,
currency, and rounding versions. A successor determination appends exact per-
bucket and per-target deltas in a later qualified Support Cycle. It cannot
over-credit remaining reversible coverage, mutate or reopen a close, or let
staff assign an unlinked vendor credit to a convenient target. Source-
effective/service-period, source-finality, discovery, determination, and D1-
close dates remain separately preserved.

Every application uses one Field Account currency. Phase 21 D20 is same-
currency unless the external source supplies an exact target-currency result
and conversion evidence. When it does, D20 preserves source/target amounts,
currencies, fees, time, provenance, and deterministic rounding without becoming
an FX engine. Without exact evidence, the line remains under review or is
organization-absorbed according to policy.

### Independent downstream truth

Phase 21 D20 may emit one PII-minimized **Support Cost Accounting Candidate
Handoff**, but it remains accounting-dark. Only a later Phase 20-certified
source contract may promote an eligible closed occurrence to Phase 20's
qualified accounting-ready boundary after proving accountant-confirmed
semantics, a compatible Posting Profile, and D17 posting ownership/cutover.
Source observations, determinations, manifests, coverage, carryforward, and
organization-absorbed amounts cannot create an Accounting Release. Existing
provider-posting evidence remains exact so Phase 20 can post only a proved
unowned differential and never duplicate work already in QBO/Xero or another
system.

Source, D1 close, D9/D12 publication, Phase 20 Accounting Release, external AP
or payroll payment, provider record, and final books/reconciliation remain
independently authoritative. A QBO/Xero outage cannot block or change closed
Field Account truth. Phase 21 D20 never changes legal donor, Designation,
purpose, restriction, receipt, gross-support, processor-cost attribution,
expense classification, benefits, payroll, AP, GL, budget, or payment truth.

### Quiet staff and missionary experience

Phase 21 D20 is **absent unless relevant**. Outside one authorized optional-
feature row, a disabled, unauthorized, zero-work, or unaffected scope has no
D20 navigation, dashboard card, KPI, filter, queue, empty state, onboarding
warning, badge, notification, statement/export field, search/count/cache
signal, API projection, or DOM node. CSS hiding is not compliance.

Authorized finance settings staff discover **Organization support costs — Off**
under existing Field Accounts optional settings. It opens a four-step, save-
and-resume setup: choose the certified source, choose only eligible cost
families, choose the bounded bearing treatment, then review a production-shaped
preview and schedule the prospective boundary. **Organization covers it** is
preselected. The confirmation states that a later finance close may affect
support balances and that nothing here pays anyone or changes payroll, AP, QBO,
or Xero.

Clean nonzero work appears only as one conditional line in the existing Support
Cycle review. Only cause-owned exceptions enter D11's existing queue, where the
card shows what happened, affected scope, why it matters, one next action,
owner, age, and last check. D20 creates no separate module, inbox, generic rule
builder, debit editor, **Force charge**, or **Apply anyway** action.

Only a closed, nonzero effect authorized by D9, D12, Phase 12, and D19 appears
to a missionary, grouped in existing Support activity or statements. The exact
source-to-balance bridge shows before balance, grouped effect, after balance,
ISO currency, and through-date. It does not expose health/dependent,
compensation, claimant, vendor, invoice, payroll, AP, or other sensitive source
detail and never says `your money`, `you owe`, `available`, `withdrawable`, or
`paid`. There is no per-cost missionary notification by default.

### Isolation and operational requirements

Every durable and cached record repeats complete Tenant, Legal Entity, Support
Assignment, Field Account, purpose, and ISO-currency scope where applicable and
uses same-scope composite foreign keys. Raw evidence is private and browser-
inaccessible. Tables enable and force RLS as a coarse Tenant backstop; all
reads, mutations, jobs, exports, and repairs pass through the sole Phase 12 PDP
with exact target and authorization-epoch reproof. Service-role possession,
client filters, URL state, JWT/user metadata, raw financial Realtime, logs,
caches, metrics, and error text are not authority and cannot leak evidence.

Phase 21 D20 cannot ship ahead of the D1, D6, D11, D12, D19, Legal Entity, PDP,
private-evidence, and forced-RLS foundations through nullable scope or a tenant-
wide compatibility shim.

### D20 adversarial disposition

| Risk                         | Concern?                                                                                                             | Permanent control                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                  | Yes — provider identities, schemas, finality, and credits drift.                                                     | Versioned source-admission contracts, persisted snapshots/watermarks, certification expiry, repair sweeps, and no live close dependency.                   |
| Technical debt               | Yes — a parallel close, queue, coverage, or correction kernel would diverge.                                         | Reuse D1/D11 coverage, close, balanced occurrence, case, manifest, and outbox seams; add only D20 semantics.                                               |
| Edge cases                   | Yes — shared/retired assignments, late credits, zero capacity, hidden balances, and multiple currencies are routine. | Exact identities/dates, source-pinned deltas, D5 succession, smallest-scope containment, and role/property fixtures.                                       |
| Footguns                     | Yes — fallback ownership or a manual debit could duplicate or invent a cost.                                         | Configuration-independent semantic ownership, governed exact sources, prospective scheduling, absorbed default, and no generic override.                   |
| Tenant safety                | Yes — scope or existence can leak through evidence, queues, counts, or caches.                                       | Composite scope, forced coarse RLS, server PDP, scoped idempotency/cache keys, and substitution/differencing tests.                                        |
| Over-engineering             | Yes — the rare feature could become benefits, AP, cost accounting, budgeting, or workflow software.                  | Finite residual catalog and treatments, optional settings leaf, existing close/queue, and no formula or whole-ledger ingestion.                            |
| UX/UI friction               | Yes — zero cards, jargon, debt-like copy, and repetitive review destroy trust.                                       | Strict absence, short setup, exact bridge, clean automation, one next action, grouped post-close disclosure, and comprehension proof.                      |
| Hidden coupling              | Yes — payroll/AP/accounting/provider outages could be mistaken for close truth.                                      | Persisted source facts and separately authoritative source, close, publication, accounting, and payment states.                                            |
| Failure modes                | Yes — stale preview, crash, partial target work, or blind retry can duplicate coverage.                              | Private staging, short CAS fence, semantic idempotency, inspect-before-retry, residual recovery, and outbox-after-commit.                                  |
| Data integrity               | Yes — unresolved work, mixed currencies, aliases, nonconserving splits, or unbalanced entries can corrupt balances.  | No unresolved close admission, canonical economic roots, per-currency conservation, native uniqueness/coverage, checked minor units, and balanced entries. |
| Security/privacy             | Yes — benefit, claimant, vendor, invoice, or compensation detail could leak.                                         | Minimum typed projections, private encrypted evidence, governed retrieval, neutral grouping, no raw browser streams, and PII-free telemetry.               |
| Scalability/performance      | Yes — shared allocations and recurring carryforward can create unbounded rows and N+1 checks.                        | Set-based evaluation, scoped indexes, bounded manifests/tranches, keyset/chunk processing, aggregation, and tenant-fair queues.                            |
| Operational burden           | Yes — manual line mapping and per-record tasks recreate spreadsheets.                                                | Family allowlists, reusable mappings, bulk preview, automatic clean path, cause-aggregated cases, and no notification flood.                               |
| Observability gaps           | Yes — observed, final, targeted, reserved, applied, corrected, published, and delivered can be confused.             | Causal state, owner, age, next action, watermark, manifest digest, and PII-free count/value metrics.                                                       |
| Dependency/integration risks | Yes — unsupported providers may lack stable identity, completeness, correction, or exact FX evidence.                | Capability-labelled operations, pinned adapters, replay/repair, backpressure, kill switches, exact fallback, and refusal of approximate operations.        |
| Migration/upgrade risks      | Yes — activation can duplicate D17 history or prior manual work.                                                     | Exact half-open cutover coverage, next-complete-cycle default, no unproved backfill, immutable versions, and inert reference history.                      |
| Other development hazards    | Yes — activation, correction, authorization, reservation, and close can race.                                        | Deterministic lock order, CAS/version reproof, native constraints, bounded serialization retry, fault injection, and post-commit delivery.                 |

### Required production proof

1. Schema and pgTAP proof covers complete scope, same-scope foreign keys,
   uniqueness/exclusion and cross-lane coverage constraints, forced RLS,
   hardened helpers/views, private evidence, retention, and no destructive
   cascade through preserved financial truth.
2. Property tests prove exact minor-unit conservation, no cross-currency sum,
   no ordinary or carryforward-created deficit, full append-only adverse-
   correction continuity including a visible D11 deficit, no unresolved close
   admission, one application owner, balanced occurrences, idempotent replay,
   correction bounds, and non-overlapping carryforward/coverage.
3. Adapter contract and fault tests cover out-of-order/duplicate events,
   mutable provider records, deleted/voided sources, credits, incomplete
   watermarks, schema/capability expiry, rate limits, outages, drift, and exact
   external currency evidence.
4. Concurrency tests race policy activation, duplicate sources, target/capacity
   reservation, correction, authorization change, manifest publication,
   assignment retirement, and Support Cycle close.
5. Role-based API/E2E tests prove off/unauthorized/zero-work absence, source and
   field privacy, shared-assignment isolation, one clean close path, exact
   exception ownership, append-only recovery, and Phase 20 darkness.
6. Accessibility and usability proof covers keyboard and screen reader flows,
   visible/unobscured focus, linked errors, restrained live regions, 320 CSS
   pixels, 400% zoom, long localization/RTL, touch targets, mobile task cards,
   and at least 90% first-attempt comprehension of balance change, timing,
   source ownership, payment, and debt meaning.
7. Production-cardinality plans and load tests prove set-based close, bounded
   manifests/carryforward, tenant fairness, aggregate exception handling, and
   PII-free observability at the certified envelope.

### Evidence

- [D20 organization-support-cost research and ruthless review](./phase-21-mission-dashboard-product-research-evidence.md#d20-decision-research--organization-incurred-support-costs)
- [ADR-0081 — Source-authoritative Organization Support Cost Applications](../../adr/0081-source-authoritative-organization-support-cost-applications.md)
- [Phase 1 source-of-truth ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)
- [Phase 20 accounting boundary](./phase-20-accounting-exports-reconciliation.md)
- [Reliant Order of Pay](https://solomon.reliant.org/display/public/fieldbenefits/Order%2Bof%2BPay)
- [ABWE financial model](https://abwe.org/financial-model/)
- [QuickBooks webhook best practices](https://developer.intuit.com/app/developer/qbo/docs/develop/webhooks/best-practices)
- [QuickBooks Change Data Capture](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture)
- [Xero webhooks](https://developer.xero.com/documentation/guides/webhooks/overview/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

Phase 21 D20 settled residual organization support-cost source admission,
exclusive semantic ownership, bounded bearing policy, per-currency
conservation, nonnegative ordinary capacity and carryforward, mandatory adverse-
correction continuity, D1/D11 close recognition,
corrections, Phase 20 darkness, isolation, and the absent-unless-relevant
experience. It does not reopen D1-D19 or implement runtime behavior. The
post-D20 preservation and cross-phase gap audit found no conflict in D1-D20,
closed the processor-cost and premature-accounting-readiness ambiguities, and
selected noncash-support realization as the next material founder seam. The
founder subsequently ratified that seam as D21 below.

## D21 — Source-mode-honest Noncash Support Realization

**Founder ruling:** ratified on 2026-08-01.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> source-mode-honest Noncash Support Realization bridge preserving the original
> noncash Contribution, legal-donor, accepted-purpose, gift-date, valuation,
> receipt, supporter, and source-owned disposition truth without creating
> monetary Field Account support; admitting only exact source-final proceeds
> through capability-certified Tenant-, Legal-Entity-, source-role-, asset-lot-,
> purpose-, and currency-scoped contracts; freezing non-overlapping quantity and
> minor-unit proceeds coverage, exact finality evidence, one zero-setup
> net-realized default or prospective proof-gated organization-absorbed
> exact-cost treatment, deterministic line allocation and residuals, D6-owned
> external conversion evidence, source and policy versions, semantic
> idempotency, and append-only correction lineage; creating exactly one
> D11-balanced Field Account occurrence only through D2's CAS-guarded Support
> Cycle admission, with D3 assessment applied only to the resulting Realized
> Support Basis, D5 owning valid purpose succession, D17 owning pre-cutover
> coverage, D19 owning participant access, Phase 15 owning source facts, and
> Phase 20 alone owning separately certified accounting delivery; supporting
> partial, pooled, installment, and terminal nonmonetary dispositions only with
> exact source coverage; and presenting one conditional, accessible,
> exception-first staff lifecycle plus one quiet grouped missionary story —
> without valuation-as-cash, a second gift, duplicate donor/supporter/fundraising
> credit, mutable sale truth, fuzzy lot allocation, inferred costs or settlement,
> per-gift truth toggles, double-applied costs, implicit FX, silent redesignation,
> asset custody/trading, gain/loss accounting, QBO/Xero authority, or any
> available, payable, payroll-ready, or paid claim.**

### Authority and source-mode boundary

- Phase 13 remains authoritative for the original Contribution, legal donor,
  accepted purpose, gift date, asset description, valuation and receipt-facing
  facts. A realization never creates or edits a Contribution, receipt, pledge
  fulfillment, campaign total, fundraising credit, donor lifetime value, or
  supporter relationship.
- Phase 15 owns the canonical append-only asset-lot, disposition, proceeds,
  source-finality, evidence, and correction projection. D21 consumes that
  projection; it does not invent sale truth or call a provider response final
  without the source contract's required proof.
- A tenant-held asset, or a provider acting as the tenant's agent with exact
  lot-to-proceeds lineage, may qualify. A DAF sponsor or intermediary that is
  itself the legal donee and later sends the tenant cash is a cash/grant source,
  not the tenant's underlying noncash asset. Donated services and retained,
  consumed, donated-onward, abandoned, or worthless property create no monetary
  realization.
- Phase 21 owns only the immutable derivative bridge and its closed Field
  Account occurrence. Phase 20 alone may later certify accounting delivery;
  QBO/Xero remains authoritative for asset derecognition, gain or loss, fees,
  cash, periods, and final reconciliation.

### Immutable realization and conservation

Each `Noncash Support Realization Manifest` freezes the complete Tenant, Legal
Entity, source role and legal recipient, source-family contract/version,
original Contribution and purpose lines, asset lot and exact quantity/scale,
disposition identity/version, evidence and finality watermark, sale/effective/
discovery dates, ISO currency, gross/cost/net or exact-net-only facts, selected
cost treatment, `Realized Support Basis`, deterministic line allocations and
residuals, D6 conversion evidence when applicable, policy versions, correction
lineage, semantic idempotency key, coverage ranges, digest, and cursor.

The manifest must prove all of the following before positive admission:

1. exact-scale asset quantity is covered at most once across partial, pooled,
   installment, corporate-action, and terminal dispositions;
2. checked integer minor units conserve proceeds, exact costs, allocations,
   residuals, and corrections per currency;
3. each source fact and purpose share has one non-overlapping disposition;
4. D17 opening coverage and D21 realization coverage do not overlap;
5. the candidate still targets an active, authorized, purpose-compatible Field
   Account under fresh D5, D6, D19, and authorization-epoch proof; and
6. exactly one D11-balanced occurrence is admitted through D2's CAS-guarded
   Support Cycle close.

Duplicate, reordered, late, corrected, canceled, or ambiguous source events
never mutate a prior manifest. Semantic replay is a no-op; a changed source fact
creates an append-only successor or adverse correction with exact causal and
coverage lineage. Unproved positive work is quarantined at the smallest affected
scope, while mandatory adverse-correction continuity remains executable.

### Cost treatment and assessment

`net_realized` is the zero-setup tenant default. The exact source-final net
proceeds become `Realized Support Basis`; an exact-net-only source remains valid
without inventing gross proceeds, zero fees, or a fee allocation.

A tenant may prospectively activate `organization_absorbs_exact_costs` only for
a certified source contract that provides exact gross, exact eligible costs, and
exact net proof. It makes exact gross proceeds the basis while keeping the costs
as separately owned organization facts. It is not a per-gift override, formula
builder, inferred fee, or invitation to duplicate Phase 20 D19 processor cost or
D20 Organization Support Cost truth.

D3 assesses only the resulting `Realized Support Basis`, never the original
noncash valuation, appraisal, recognized value, provider estimate, or a second
cash-gift fiction. Any later cost or proceeds change uses component-correct,
append-only correction lineage under the frozen treatment version.

### Quiet staff and missionary experience

- Tenants without relevant, certified noncash activity see no setup card,
  navigation item, queue, badge, or empty state.
- Relevant staff use the existing Contribution detail and exception-first
  finance workspace. One source-labelled lifecycle shows the original gift,
  processing, exact realized tranches, support-cycle admission, and corrections
  without presenting separate gifts. The surface exposes one next action only
  when evidence or resolution is genuinely required.
- The default path is automatic once Phase 15 source evidence is complete.
  Staff may record governed external facts or resolve a mismatch; they cannot
  press `Convert to cash`, edit source truth, select a convenient valuation, or
  force an unproved positive balance.
- A missionary sees at most one quiet grouped story and only tenant-published,
  finance-closed support effects. Donor-facing history and receipts continue to
  show the original noncash Contribution only. Neither surface claims that an
  appraisal, sale, realization, or Field Account amount is available,
  withdrawable, payable, payroll-ready, paid, or posted to accounting.
- Copy, focus order, status, errors, and disclosure must remain understandable at
  320 CSS pixels, 200%/400% zoom, keyboard-only, and with screen readers; status
  is never color-only and technical state changes do not create missionary
  notification noise.

### Adversarial disposition

The complete D21 ruthless review is binding in the Phase 21 research evidence.
Every requested category has a concern: brittleness, technical debt, edge cases,
footguns, tenant safety, over-engineering, UX/UI friction, hidden coupling,
failure modes, data integrity, security/privacy, scalability/performance,
operational burden, observability, dependency/integration risk,
migration/upgrade risk, and other development hazards. The permanent controls
are versioned source contracts; exact role/finality/coverage evidence; native
scope and conservation constraints; private evidence; forced coarse RLS plus the
Phase 12 PDP; tenant-fair bounded processing; append-only recovery; D17 cutover
coverage; and production-shaped contract, property, concurrency, privacy,
accessibility, usability, migration, and load proof.

### Required production proof

1. No recognized value, FMV, appraisal, or provider estimate can create a D2
   monetary candidate; no realization can create donor, receipt, pledge,
   campaign, fundraising, or supporter truth.
2. Property tests cover exact quantity and minor-unit conservation across
   partial, pooled, installment, canceled, corrected, and terminal outcomes.
3. Fixtures cover full gross/cost/net proof, legitimate exact-net-only sources,
   retained/used/abandoned property, costs at or above proceeds, delayed costs,
   redesignation, inactive assignments, and external conversion.
4. Idempotency, out-of-order, duplicate, ambiguous-result, concurrent tranche,
   correction-versus-close, authorization-revocation, and crash-recovery tests
   prove no duplicate coverage or lost adverse correction.
5. D3, D6, D17, D20, and Phase 20 D19 non-overlap tests prove one semantic owner
   and one conversion/assessment/cost application.
6. RLS/PDP tests prove Tenant × Legal Entity × source × purpose × Support
   Assignment × Field Account × ISO-currency isolation across rows, counts,
   search, subscriptions, exports, caches, and private evidence retrieval.
7. Staff and missionary usability/accessibility proof reaches at least 90%
   unassisted task and comprehension success, with zero participants mistaking
   valuation for balance, one lifecycle for two gifts, or realization for
   available/payable money.

### Evidence

- [D21 research, source-mode analysis, ruthless review, and proof gates](./phase-21-mission-dashboard-product-research-evidence.md#d21-decision-research---noncash-support-realization)
- [ADR-0082 — Source-mode-honest Noncash Support Realization](../../adr/0082-source-mode-honest-noncash-support-realization.md)
- [Phase 1 source-of-truth ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)
- [Phase 13 contribution authority](./phase-13-campaign-designation-contribution-ledger-giving-cart.md)
- [Phase 15 noncash intake and disposition authority](./phase-15-offline-gift-batch-entry.md)
- [Phase 20 accounting boundary](./phase-20-accounting-exports-reconciliation.md)

### Remaining founder decisions

D21 closes noncash-to-support realization without reopening D1-D20 and without
turning Phase 21 into custody, liquidation, appraisal, accounting, or payment
software. The post-D21 preservation and cross-phase gap audit found no need to
reopen D1-D21 and selected optional Prospective Expense Authorization as the
next material founder seam. That D22 research is recorded in the Phase 21
evidence file; it is not authority unless and until the founder rules.

## D22 — Optional exact Prospective Expense Authorization

**Founder ruling:** ratified on 2026-08-01.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one independently optional,
> Tenant- and Legal-Entity-off-by-default, purpose-scoped Prospective Expense
> Authorization inside the existing Phase 21 Expense Program and Expenses
> doorway, structurally absent from requester, reviewer, admin, notification,
> reporting, and API projections unless prospectively activated as
> available-when-helpful or required-for-selected-expenses through D13's bounded
> non-stacking scope lattice; with one fast accessible four-question `Plan an
expense` flow; separate immutable requester-authored Request Versions, private
> plan-evidence coverage, submission-time Governance Resolutions and
> operation-scoped finite Approval Assignment Snapshots, current-authority-
> rechecked human Review Actions, and exact Organization Authorization Decisions
> pinning Tenant, Legal Entity, claimant Party, submitter/preparer, source-owned
> relationship context, purpose, certified expense family, positive integer-
> minor-unit ceiling, one ISO currency, half-open incurrence window, frozen
> permitted conditions, authority, route, and source/policy versions; guided
> approval-only behavior plus one advanced, explicitly certified, same-purpose
> and same-currency D1 capacity-reservation consequence committed atomically
> with the final decision; exact non-overlapping later D10 item/split
> Authorization Coverage, partial and multi-claim use, within-ceiling
> preservation and excess-only review, narrowing-only approval changes,
> immutable successor amendments, pre-decision withdrawal, prospective
> future-use end, expiry without timer release, proved-unused-only release,
> in-flight residual quarantine, semantic idempotency, CAS/concurrency
> protection, and append-only correction and recovery; one quiet exception-
> first `Planned expenses` staff surface with role queues, separate prepare/
> submit/view/decide/exception/reassign/delegate/configure/reserve capabilities,
> recusal, date-bounded non-transitive delegation, named independent small-
> tenant oversight, sparse privacy-minimized notifications, online-only
> authoritative actions, resumable mobile drafts, and WCAG 2.2 AA proof —
> without enabling from D13 or D19 alone, mandatory preapproval for every tenant
> or expense, claimant-selected reviewers, mutable request or decision truth, a
> second workflow or reservation engine, broad administrator bypass, self-,
> AI-, automatic-, email-link-, bulk-, or timeout approval, timer-based release,
> implicit FX, fuzzy claim coverage, public evidence, cards, wallets, spend
> limits, purchase orders, vendor onboarding, travel booking, direct payment,
> payroll or accounting authority, or any claim that planned or approved means
> reserved, incurred, substantiated, policy-eligible, reimbursable, owed,
> available, guaranteed, payable, paid, posted, synced, or reconciled.**

### Optional posture and deterministic governance

One immutable prospective posture applies per exact Tenant and Legal Entity:

1. `not_managed_in_asym` is the default and exposes no requester action,
   navigation, empty card, queue, count, report, reminder, notification,
   onboarding task, setup warning, or API enumeration;
2. `available_when_helpful` permits an authorized requester to use the exact
   before-spend process without making its absence an actual-claim violation;
   and
3. `required_for_selected_expenses` requires it only where one uniquely
   resolved bounded D13 scope says so.

D13 Expense Program activation is a prerequisite but never implicitly enables
D22. The ordinary D10/D13 `Add expense` path remains complete in every posture.
When required authorization is absent, the actual expense and evidence remain
capturable and D13 opens its typed prior-authorization exception; Phase 21 never
fabricates retroactive prospective authority.

Activation, replacement, and deactivation are prospective. Turning D22 off
stops new submissions after the exact boundary but preserves drafts, submitted
work, decisions, reservations, applications, residuals, corrections, and audit
history. It cannot withdraw an existing decision or release capacity.

D22 reuses D13's deterministic non-stacking scope lattice, finite Approval Route
Versions, assignment, delegation, reassignment, conflict, and activation-proof
machinery. Bounded scope may use Legal Entity, certified expense family,
purpose/project/grant, Expense Policy Cohort, source-owned relationship or
classification, country/risk class, exact-currency amount band, or exact
claimant. Exactly one profile wins; an incomparable conflict stops only the
affected submission. There is no free-form workflow graph, priority order,
formula, script, generic JSON rules engine, or automatic approval.

### Independent authority and immutable lifecycle

The following remain separate source truths:

- a mutable private draft with no authority;
- an immutable `Prospective Expense Request Version` containing the exact
  claimant-authored plan;
- one submission-time `Prospective Expense Governance Resolution` and
  operation-scoped `Approval Assignment Snapshot`;
- append-only current-authority-rechecked human `Expense Review Actions`;
- one immutable `Prospective Expense Authorization Decision` over the exact
  request version and approved terms;
- optional exact purpose- and currency-compatible D1 Field Account Funding
  Coverage;
- exact non-overlapping `Prospective Expense Authorization Coverage` linking
  later D10 claim items or purpose splits; and
- append-only future-end, proved-unused release, unresolved/in-flight residual,
  correction, and succession facts.

The displayed status is a projection over those authorities, never the sole
record. `Needs information` is a review action; a response creates a successor
Request Version. Withdrawal before decision, future-use end after decision,
unused-scope declaration, and correction are distinct CAS-guarded actions.

The route snapshot fixes what review the submission must satisfy but does not
preserve reviewer authority. Every action re-proves current Phase 12 Tenant,
Legal Entity, purpose, subject, operation, coverage, governance epoch,
capability, and conflict status. Claimant, preparer, and submitter cannot satisfy
an independent step. Delegation is exact-scope, date-bounded, non-transitive,
and independently authorized; reassignment and recusal append successor
evidence. No broad administrator, AI model, email link, amount threshold,
elapsed timer, or bulk command may create final D22 authority.

`Approve with changes` may only narrow the exact ceiling or time window or add
a permitted frozen condition. Increasing or changing claimant, Legal Entity,
purpose, currency, or expense family requires a requester-authored successor
and fresh resolution. The original request and every relied-upon decision remain
immutable.

### Capacity, actual-claim linkage, and conservation

The enabled default is `approval_only`. A tenant may separately certify
`approval_with_compatible_capacity_reservation` for a bounded scope. The latter
uses only the exact D1 Finance-confirmed Planning Coverage Base for the same
Tenant, Legal Entity, purpose, Field Account, and ISO currency. The human final
decision and full reservation are one atomic, CAS-guarded commit; a partial,
pending, or failed reservation cannot produce an `Approved` result and cannot
silently downgrade to approval-only.

One authorization may cover multiple later claims only when its frozen policy
permits it. Every D10 item or purpose split consumes at most one exact
authorization slice. Matching or AI may suggest a candidate but never creates
coverage. A larger actual expense preserves valid within-ceiling coverage and
routes only the excess through successor authorization or D13 exception review.

For each authorization and currency:

```text
approved ceiling
= exact later-claim application coverage
+ proved-unused released coverage
+ unresolved or in-flight residual coverage
```

All terms are exact integer minor units, mutually exclusive, and collectively
exhaustive. When an independently approved actual expense qualifies for D1
Field Account Funding Coverage, the exact prospective reservation slice is
fulfilled or reclassified atomically; it cannot remain both reserved and
consumed. Cross-currency approval may remain a human policy decision, but no
capacity or monetary coverage crosses currency without exact D6 externally
owned conversion evidence.

Expiry ends new reliance but does not prove the residual unused. An expense
proved incurred inside the half-open validity window may be submitted later.
Only an immutable unused-scope declaration plus current proof that the exact
slice is not linked, uploading, correcting, appealing, or otherwise in flight
may release it. Uncertain residual stays quarantined and non-reusable.

### Quiet requester and reviewer experience

- When authorized and enabled, the existing Expenses doorway keeps `Add
expense` primary and shows `Plan an expense` as a secondary action.
- The ordinary mobile-first plan asks what is planned, estimated maximum and
  ISO currency, expected incurrence date/window, and ministry purpose/project.
  Known identity and scope are confirmed rather than re-entered; private quote,
  itinerary, attendee, location/security, or specialist evidence appears only
  when the winning policy requires it.
- Drafts autosave and may resume offline with literal device-only status.
  Submission, withdrawal, review, decision, assignment, reservation, release,
  and exact application require a committed online server result and never use
  optimistic financial state.
- The requester sees exact terms, current owner role, a target review date
  labelled as a target, one next action, and expandable history. `Add expense to
this plan` prefills safe context but never supplies actual amount/date,
  merchant/payee, economic payer, splits, substantiation, or D10 approval.
- Staff use one `Planned expenses` view inside the existing expense workspace.
  Low-sensitivity task rows, role queues, exact reason/term/change displays,
  narrowing-only confirmation, sparse notifications, `Approve and open next`,
  and cause-owned exceptions keep the clean path fast without blind batch
  decisions.
- All plan evidence is private and purpose-separated from D10 Receipt Evidence.
  D19 participation never grants claim, review, payee, conflict, or evidence
  authority. Notifications omit itinerary, location, health/security context,
  evidence, private notes, and unnecessary amounts.

### Boundaries

A D22 request, policy resolution, route snapshot, review action, decision,
capacity reservation, application, residual, or correction creates no Expense
Claim, Approved Expense Snapshot, Reimbursement Obligation, Field Account debit,
advance, handoff, external payment, payroll operation, Accounting Posting
Intent, Accounting Release, Expected Bank Arrival, Bank Match, or QBO/Xero
truth. D10/D13 independently evaluates actual facts, evidence, policy,
jurisdiction, relationship, exceptions, and approval; D15 and external systems
own later handoff/payment; Phase 20 alone owns accounting delivery.

D22 adds no card, wallet, spend limit, procurement, purchasing, purchase order,
vendor onboarding, travel booking, direct payment, payroll, AP, accounting, or
general workflow product.

### Adversarial disposition

The complete D22 ruthless review is binding in the Phase 21 research evidence.
Every requested category has a concern: brittleness, technical debt, edge cases,
footguns, tenant safety, over-engineering, UX/UI friction, hidden coupling,
failure modes, data integrity, security/privacy, scalability/performance,
operational burden, observability, dependency/integration risk,
migration/upgrade risk, and other development hazards. The permanent controls
are structural feature absence, immutable versions, exact scope and
minor-unit constraints, D13 kernel reuse, Phase 12 current-authority reproof,
forced default-deny RLS, private evidence, semantic idempotency, CAS and
deterministic locks, atomic decision/reservation/outbox, exact coverage
conservation, append-only recovery, tenant-fair bounded work, and
production-shaped contract, property, concurrency, privacy, accessibility,
usability, migration, and load proof.

### Required production proof

1. Off tenants have no D22 UI, API, queue, report, notification, setup, or D10
   claim-path friction; activation previews every policy, route, conflict,
   currency, consequence, and uncovered scope.
2. Tests prove D22 approval may coexist with D10 rejection, no reservation, no
   obligation, no payment, and no accounting, and that all surfaces explain the
   distinction correctly.
3. Route/permission tests cover self/preparer conflicts, role queues, named and
   specialist routes, delegation, reassignment, recusal, staff departure,
   current-authority loss, and independent small-tenant oversight.
4. Real PostgreSQL/RLS/concurrency tests cover duplicate submit/decision,
   request-versus-withdraw/successor, decision-versus-capacity change,
   application-versus-release/expiry, two claims consuming one slice, semantic
   idempotency payload conflict, serialization failure, deadlock, and cross-
   Tenant/Legal-Entity substitution.
5. Property tests prove exact ceiling and reservation conservation for zero-,
   two-, and three-decimal currencies, partial and multi-claim use, excess,
   correction, expiry, in-flight quarantine, and proved-unused release.
6. Failure tests prove upload, private evidence, outbox, notification, stale
   client, and ambiguous network outcomes never show false approval or lose
   source truth.
7. Accessibility/usability proof covers mobile and offline drafts, keyboard,
   screen reader, visible/unobscured focus, 320 CSS pixels, 200%/400% zoom,
   touch, long localization/RTL, status/error announcements, and representative
   user comprehension of planned, approved, reserved, incurred, reimbursable/
   owed, payable, paid, and posted truth.
8. Contract and load tests prove exact D1/D5/D6/D10/D13/D15/D19/Phase 6/12/20/
   29 boundaries, bounded indexed queues, short scoped locks, tenant-fair work,
   privacy-safe observability, and Phase 20 rejection of every prospective
   object.

### Evidence

- [D22 research, founder selection, ruthless review, and ratification](./phase-21-mission-dashboard-product-research-evidence.md#d22-founder-selection-and-adversarial-hardening)
- [ADR-0083 — Optional exact Prospective Expense Authorization](../../adr/0083-optional-exact-prospective-expense-authorization.md)
- [Phase 1 source-of-truth ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)
- [Phase 12 permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 20 accounting boundary](./phase-20-accounting-exports-reconciliation.md)
- [IRS accountable-plan rules](https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens-and-the-accountable-plan-rules)
- [Ramp spend-request approval setup](https://support.ramp.com/setting-up-spend-request-approvals/)
- [SAP Concur request-to-expense linking](https://help.sap.com/docs/CONCUR_REQUEST/ccfb1b533dd24f569506dc7fcad15891/4207c4fcd9a04755ae32c1594832285d.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

D22 closes optional exact before-spend authorization without reopening D1-D21
and without turning Phase 21 into procurement, cards, payments, payroll, or
accounting software. The next material founder seam will be selected from the
post-D22 preservation, repository, missions-practice, and production-completeness
gap audit and presented one decision at a time.

## D23 — Source-family-specific Expense Field Account Effect Recognition

**Founder ruling:** ratified on 2026-08-01.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one immutable, prospective,
> Tenant-, Legal-Entity-, purpose-, Field-Account-, ISO-currency-, and certified
> source-family-scoped Expense Field Account Effect Recognition Profile,
> presented only as support-balance inclusion timing and never as GAAP, tax,
> accounts-payable, reimbursement-payment, or QBO/Xero policy; with claimant-
> paid reimbursement guided by independently established Reimbursement
> Obligation plus exact compatible Field Account Funding Coverage and one
> bounded prospective exact-payment alternative; organization-card effects
> qualified only by source-final cleared charge plus exact approval;
> organization cash/debit/direct-payment effects qualified only by exact
> executed economic-payer occurrence; and certified organization-payable
> effects qualified only by a separately source-owned present obligation—while
> D16 advances, D20 Organization Support Costs, D21 noncash realization, and D4
> taxable-compensation succession remain exclusive owners; resolving and
> freezing exactly one profile on D16's existing Approved-Expense-Snapshot-
> rooted Expense Settlement Determination; creating one PII-minimized immutable
> Expense Field Account Effect Basis and non-reusable exact Effect Coverage that
> conserves approved integer minor-unit coverage without capacity-created
> partials; atomically appends immutable dispositions so only one exact slice
> bears capacity; pins source-family-specific Field Account amount authority and
> exact externally owned multi-currency evidence; preserves incurred, approval,
> obligation, qualification, close, payment, accounting-effective, and provider-
> posting dates independently; applies refunds, returns, conversion
> differences, reclassifications, failures, and corrections only through
> source- and cause-linked append-only deltas or exact ownership succession in a
> later permitted Support Cycle; enforces complete tenant/entity/assignment/
> purpose/account/currency scope through composite same-scope keys, server-only
> canonical truth, forced coarse RLS, Phase 12 PDP current-authority reproof, a
> stable source-slice semantic identity independent of retry, profile, and
> Support Cycle, CAS/Serializable atomic effect-coverage-outbox commits, bounded
> pre-admitted close work, and ambiguity-safe inspect-before-retry recovery; and
> exposes one quiet accessible guided prospective setup, source-labelled
> independent truth sections, signed ISO-currency and through-dated missionary
> activity, zero clean-path staff actions, and one root-cause-deduplicated
> exception-first finance surface—without per-claim timing or FX overrides,
> generic `paid`/`posted` authority, implicit partial funding, capacity-created
> or discretionary deficits, double subtraction, card-statement or claimant-
> repayment inference,
> live provider/FX dependency, historical recomputation, QBO/Xero authority over
> Field Account truth, linear completion steppers, or any claim that inclusion
> proves availability, reimbursement, payment, accounting posting, or
> reconciliation.**

### Operational-only authority and source families

D23 answers only when an exact ordinary approved-expense slice becomes eligible
for a later D1 Support Cycle close. It does not determine GAAP or tax treatment,
create accounts payable, approve an expense, establish or cancel an obligation,
execute or prove reimbursement, reconcile a bank account, choose a Phase 20
posting date, or create QBO/Xero truth.

The source-family catalog is closed:

1. **Claimant-paid reimbursement — `obligation_qualified` guided default.** An
   exact Approved Expense Snapshot, independently established Reimbursement
   Obligation, and compatible Field Account Funding Coverage qualify the exact
   slice. Approval alone is insufficient, and later handoff, payment, or
   accounting cannot debit it again.
2. **Claimant-paid reimbursement — `external_payment_qualified` bounded
   alternative.** A tenant may prospectively select this only for one exact
   certified source/relationship family. The exact External Payment Occurrence
   and payment-to-obligation coverage must also exist; attempted, initiated,
   failed, ambiguous, or returned execution does not qualify by inference.
3. **Organization card — fixed `source_final_and_approved`.** Only source-final
   cleared issuer evidence plus exact approved organization-paid business
   coverage qualifies. Pending authorization, card assignment, personal/
   nonbusiness coverage, and later statement payment do not.
4. **Organization cash/debit/direct payment — fixed
   `source_final_and_approved`.** The exact executed economic-payer occurrence
   plus approved organization-paid coverage qualifies. Instructions, exports,
   bank matches, and accounting records are insufficient.
5. **Certified organization payable.** An exact independently source-owned
   present obligation may qualify only through a certified source adapter.
   Purchase requests/orders, unapproved invoices, and QBO/Xero record existence
   are not Field Account authority.

D4 remains the exclusive owner of taxable expense-recovery/compensation
succession, D16 of advances and claimant repayments, D20 of Organization
Support Costs, and D21 of noncash realization. Unknown, unsupported,
capability-drifted, or multiply owned sources stop only affected positive work
and open one cause-owned exception. Mandatory adverse corrections stay live.
AI, OCR, and matching output may suggest but never establishes source finality,
ownership, amount, approval, coverage, or an effect.

### Binding cross-phase precision riders

The ratified shorthand that freezes D23 on D16's Expense Settlement
Determination applies only to claimant-reimbursable coverage governed by that
determination. Organization-card, organization cash/debit/direct-payment, and
certified-payable sources bind the exact D10/D13 Approved Expense Snapshot
item/split, its economic-payer classification, and their independently
certified source occurrence directly. They never fabricate a Reimbursement
Obligation or D16 settlement, and D16 feature activation is not a D23
prerequisite. The D23 Effect Basis is the common downstream seam for both root
shapes.

These cross-phase consequences are also binding:

- **Payment return while obligation remains.** In
  `external_payment_qualified` mode, a source-final return atomically appends
  the exact effect reversal and a successor capacity-bearing Field Account
  Funding Coverage reservation whenever the Reimbursement Obligation remains
  live. If the obligation owner separately cancels the obligation, no successor
  reservation is created.
- **Direct-pay return classification.** The source owner distinguishes expense
  cancellation, returned payment with continuing obligation, partial refund,
  and amount correction. D23 reverses only cancelled/reduced coverage or moves
  continuing obligation coverage atomically into its certified payable/
  reservation lineage; ambiguity stays in one cause-owned exception.
- **Initial adoption and replacement.** Initial D23 activation reconciles to
  D17's complete Opening Coverage Manifest and exact source-family half-open
  ownership boundary. Later profile replacement uses a D11-manifested complete
  Support Cycle boundary, captured ingestion cursor, and a complete in-flight
  disposition manifest. Date-only cutover, history replay, overlap, and gaps
  are forbidden.
- **Stable identity.** The root economic-occurrence identity excludes evidence
  observation revision as well as adapter/import version, retry, profile, job,
  and Support Cycle. Observation versions remain immutable Basis evidence; a
  true economic correction gets its own correction identity plus predecessor
  and root references.
- **Atomic D4 succession.** Taxable-compensation succession is one same-
  currency group that atomically appends the D23 reversal, transfers exact
  source coverage ownership, and admits the D4 replacement in one later
  permitted Support Cycle. Until all D4 facts qualify, capacity remains
  conserved and one cause-owned exception remains open.
- **Certified payable remains proof-gated.** The family is structurally absent
  until a separately certified non-accounting source contract supplies exact
  D10/D13-approved coverage and a present-obligation occurrence. QBO/Xero/AP
  record existence, import success, or readback never qualifies it.
- **D22-to-actual transition.** D22 first reclassifies exact prospective
  coverage into actual D10/D16 Field Account Funding Coverage through its own
  atomic lineage. D23 can fulfill only that actual coverage; prospective
  authorization, approval, or reservation never qualifies an effect.
- **Separate coverage namespaces.** D23 Effect Coverage and Phase 20 accounting
  source coverage may independently cover the same economic source for their
  different purposes. Neither fulfills, releases, dates, gates, or mutates the
  other, and duplicate accounting posting from the D23 effect is forbidden.
- **Late first facts and case ownership.** A first qualification observed after
  a prior close is a new late-admitted occurrence in the next permitted cycle,
  not a correction to a nonexistent effect. Only changes to admitted roots are
  corrections. D23 owns profile-resolution and effect/coverage/conservation
  cases; D10/D13, D14, D15, D16, D20/D21, D11, and Phase 20 retain their cause-
  owned cases, and Mission Control task state never clears financial truth.
- **Publication, lifecycle, and retirement.** D9 decides whether the activity/
  balance module exists; D12 alone publishes immutable statements; D19
  participation never grants evidence access. D5 exit and D6 currency-
  retirement manifests enumerate every D23 reservation, candidate, effect,
  correction, and unresolved slice exactly once. New forward work stops at the
  exact boundary while source-owned corrections continue against their
  original immutable scope; D23 never creates/reallocates an account or
  currency lane to solve a shortfall.

### Immutable profile, basis, and semantic identity

The tenant sees one bounded claimant-reimbursement timing choice: include when
finance confirms the exact organization obligation (recommended), or after
exact external payment for an intentionally selected certified family.
Organization-paid behavior is fixed explanatory truth rather than another
setting. Advanced families remain absent until a relevant certified source
exists.

Exactly one immutable prospective Expense Field Account Effect Recognition
Profile resolves and freezes on each exact approved item/split using the
source-root contract above. A successor applies only at the next
complete D11-manifested Support Cycle boundary and captured ingestion cursor
after every in-flight slice has one explicit predecessor/successor disposition.
It never reroutes existing coverage or recalculates closed history.

The immutable **Expense Field Account Effect Basis** pins the winning profile,
source family, stable economic occurrence, immutable observation/evidence
versions, exact approved and funding
coverage, Field Account amount/currency authority, close lineage, and
correction cause. The stable semantic effect identity is separately rooted in
Tenant, Legal Entity, purpose, Field Account, ISO currency, stable economic
occurrence, approved coverage slice, and effect family. It excludes observation
revision, adapter/import version, retry/job identity, mutable status, profile
version, and selected Support Cycle
so a successor profile or later-cycle retry cannot post the same economic slice
again.

### Per-currency conservation and capacity

Conservation is never asserted across unlike currencies:

```text
approved source-currency slice
= source-currency dispositions + conversion-source coverage

exact Field Account-currency target
= Expense Field Account Effect Coverage
+ organization-funded or non-Field-Account target disposition
+ exact target residual
```

All terms are checked integer minor units. Source/receipt, approved, obligation,
payment, entity-functional, and Field Account amounts and ISO currencies remain
separate. Exact externally owned conversion evidence preserves source and
target amount, rate/direction, effective instant, rounding, fee, residual,
provenance, and evidence strength. Missing or conflicting evidence quarantines
the affected positive effect; no current/live rate, staff convenience rate,
QBO `HomeTotalAmt`, Xero convenience amount, or synthetic `1.0` fills a gap.

Ordinary qualification, reservation, and capacity allocation cannot create
`min(balance, obligation)`, overdraw a Field Account, or reduce the independently
live Reimbursement Obligation. A partial effect is permitted only after the
upstream source owner establishes exact non-overlapping approved/obligation/
payment/organization-funded and residual coverage; otherwise the whole candidate
waits. A mandatory source-owned adverse correction still appends in full and
may expose a visible D11 deficit; D23 cannot clip, defer, relabel, or convert it
into a capacity-created partial.

One immutable disposition makes the exact overlapping Field Account Funding
Coverage derive `fulfilled` in the same transaction that commits the balanced
effect, exact Effect Coverage, per-account CAS/version advance, ingestion
sequence, and identifier-only outbox request. The original coverage remains
immutable. D22 prospective reservation, D10/D16 actual funding coverage, and
D23 effect form one append-only lineage with at most one capacity-bearing state.

### Independent dates and source-specific correction

Source-incurred/effective, observed, recorded, approval, obligation-effective,
recognition-qualified, effect-commit, Support Cycle boundary/close/through,
external-payment, Phase 20 accounting-effective/delivery, and provider-posting/
readback dates remain independently authoritative.

- In obligation mode, later payment delay, failure, return, reversal, or reissue
  does not reverse the Field Account effect while the approved Reimbursement
  Obligation remains. Only an exact source-owned obligation/snapshot/funding
  correction can change it.
- In payment mode, a source-final return/reversal appends an exact correction of
  only previously qualified payment coverage and atomically restores a
  successor reservation when the Reimbursement Obligation remains; a failed or
  ambiguous attempt that qualified nothing has nothing to reverse.
- Organization-card and direct-pay refund, void, dispute, conversion delta, or
  source correction appends exact linked coverage under the frozen basis.
- Card-statement payment, claimant repayment, reimbursement batch funding, bank
  match, accounting edit, provider task closure, or generic `Paid` never creates
  or reverses an effect by inference.
- A source-authorized taxable-compensation reclassification uses one atomic,
  same-currency append-only ownership succession across the D23 reversal,
  coverage transfer, and D4 replacement and can never debit through both D23
  and D4 or temporarily free committed capacity.

Closed cycles, statements, original effects, and historical rates never mutate.
A late correction enters the next permitted D1 close with original source,
discovery, correction-effective, close, payment, and accounting dates preserved.

### Isolation, concurrency, and workload

Every canonical record and reference repeats complete same-scope Tenant, Legal
Entity, Support Assignment, purpose, Field Account, and ISO-currency identity
where applicable. Raw financial truth is server-only and revoked from browser
roles. Forced coarse RLS is a fail-closed backstop; purpose-minimized reads,
commands, jobs, exports, repairs, and evidence retrieval pass through the Phase
12 PDP and re-prove current actor, target, capability, authorization epoch, and
record version. Relationship labels, client scope, JWT grant lists, and service-
role possession are not authorization.

Database constraints enforce same-scope foreign keys, stable semantic
uniqueness, non-overlapping coverage/dispositions, balanced entry groups, and
immutable retained truth. Capacity-changing writes use deterministic smallest-
scope lock order with per-account CAS or bounded Serializable retry. An
ambiguous result is inspected by semantic identity before retry. Multi-account
splits lock in canonical order; ordinary work never takes a tenant-global lock.

D1 close consumes only pre-admitted normalized occurrences at or below its
captured upper cursor. It uses bounded indexed/keyset work and tenant-fair
backpressure and never calls a card, payroll/AP, bank, FX, AI, file-parser,
QBO, or Xero provider.

### Quiet staff and missionary experience

The tenant configures D23 under **Settings → Expenses → Support-balance
timing**. The guided question is **When should approved reimbursements affect
support balances?** with obligation-qualified recommended and exact-payment-
qualified as the bounded alternative. Fixed explanatory copy states that a
final organization-paid charge affects the balance after approval and that
later card/bank-liability payment does not include it again.

Before **Activate for future expenses**, one accessible review shows Tenant and
Legal Entity, source families, currencies, first complete boundary/cursor,
representative claimant/card/refund examples, reservation transitions,
uncovered/conflicting sources, and the explicit warning that the change does
not approve, reimburse, pay, or post expenses to accounting. Activation and
successor changes re-prove current authority and use server-confirmed results.

Clean work adds zero actions. There is no per-claim mode, `Include`, `Post`,
`Sync`, `Retry`, `Mark paid`, editable rate, or editable effective date. One
root-cause-deduplicated exception-first finance surface shows a plain reason,
affected count, same-currency total, owner, and one next action. Automatic waits
say no action is needed and do not create one task per affected expense.

Expense review, Support balance, Reimbursement, and staff-only Accounting are
independent sections, never a linear completion stepper. Missionary activity
uses a signed Field Account amount, exact ISO currency, and finance-confirmed
through date, such as **Support balance includes this expense: −USD 124.50 ·
through Aug 31**. It never says `your money`, available, withdrawn, reimbursed,
paid, posted, synced, or reconciled. Organization-paid expenses omit
reimbursement progress, and private merchant, location, receipt, claimant,
bank, provider, tax, or comment detail requires separate D10/D19/D15 authority.

### Adversarial disposition

The complete D23 ruthless review is binding in the Phase 21 research evidence.
Every requested category has a concern: brittleness, technical debt, edge
cases, footguns, tenant safety, over-engineering, UX/UI friction, hidden
coupling, failure modes, data integrity, security/privacy, scalability/
performance, operational burden, observability, dependency/integration risk,
migration/upgrade risk, and other development hazards.

Permanent controls are the operational-only authority boundary, closed
source-family catalog, exact ownership succession, immutable profile/basis/
coverage, stable source-slice identity, per-currency integer conservation,
source-owned FX, no capacity-created partials, immutable coverage-disposition
lineage, independently truthful dates, source-specific append-only correction,
composite same-scope database constraints, server-only truth, forced coarse
RLS, Phase 12 PDP reproof, deterministic locks, CAS/Serializable atomic commit,
captured close cursor, no live provider close dependency, one guided setup,
zero-action clean path, independent truth sections, deduplicated exceptions,
and production-shaped contract, property, concurrency, RLS, currency,
correction, accessibility, usability, migration, load, and recovery proof.

### Required production proof

1. Source-owner contract tests prove exactly one owner for each certified family
   and fail closed for unknown, overlap, drift, personal/nonbusiness card
   portions, AI suggestions, and missing evidence.
2. Property tests prove source- and Field-Account-currency conservation,
   non-overlap, balanced entries, checked arithmetic, no ordinary recognition-
   or capacity-created deficit, full append-only adverse-correction continuity
   including a visible D11 deficit, no capacity-created partial, and no
   reservation-plus-effect double subtraction for zero-, two-, and three-
   decimal currencies.
3. Event-order, real-database concurrency, and fault tests cover duplicate and
   reordered approval, obligation, funding, D22 application, payment, return,
   card adjustment, correction, profile activation, close cursor, timeout after
   commit, deadlock, and serialization retry. Exactly one semantic effect and
   terminal coverage disposition commit.
4. Scenario tests cover whole and exact source-authorized partial
   reimbursements, grouped/partial payment-qualified work, pending/cleared/
   refunded cards, direct organization pay, certified payable, taxable D4
   succession, D16/D20/D21 exclusivity, departures, and post-close correction.
5. Currency tests cover every source/obligation/payment/entity/Field Account
   currency combination, rate direction, rounding, fee, residual, late delta,
   precision, and overflow without cross-currency totals.
6. Phase 20/QBO/Xero tests prove bills, payments, home amounts, posting dates,
   readback, drift, and bank reconciliation cannot qualify or rewrite D23 and
   receive only a PII-minimized exact closed occurrence after separate source
   certification.
7. RLS/PDP tests substitute every scope component and cover anonymous, stale or
   revoked authority, relationship-only access, list/detail/export/
   notification/evidence paths, service jobs, and existence leakage. Raw tables
   remain browser-inaccessible.
8. Accessibility and comprehension tests prove finance staff and missionaries
   distinguish approval, obligation, support-balance inclusion, reimbursement,
   payment, and accounting without inferring availability. Keyboard, screen
   reader, focus, 320-pixel reflow, 200%/400% zoom, contrast, RTL,
   localization, and signed currency presentation are release gates.
9. Production-shaped plans and load tests prove bounded close admission,
   tenant-fair work, provider-outage continuity, root-cause exception
   deduplication, PII-free observability, deterministic rebuild, and zero added
   clean-path clicks.

### Evidence

- [D23 research, founder selection, ruthless review, and ratification](./phase-21-mission-dashboard-product-research-evidence.md#d23-decision-research--exact-expense-field-account-effect-recognition)
- [ADR-0084 — Source-family Expense Field Account Effect Recognition](../../adr/0084-source-family-expense-field-account-effect-recognition.md)
- [Phase 1 source-of-truth ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)
- [Phase 12 permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 20 accounting boundary](./phase-20-accounting-exports-reconciliation.md)
- [IRS Publication 463](https://www.irs.gov/publications/p463)
- [Ramp reimbursement accounting](https://support.ramp.com/syncing-reimbursements-to-accounting)
- [Ramp QuickBooks Online overview](https://support.ramp.com/quickbooks-online-overview/)
- [Brex reimbursements](https://www.brex.com/support/expense-reimbursements)
- [QuickBooks Online multicurrency](https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-multiple-currencies)
- [Xero Accounting API payments](https://developer.xero.com/documentation/api/accounting/payments)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

D23 closes ordinary-expense support-balance inclusion timing without reopening
D1-D22 and without turning Phase 21 into a GAAP, tax, AP, payment, bank-
reconciliation, or accounting system. The next material founder seam will be
selected from the post-D23 preservation, repository, mission-practice, and
production-completeness gap audit and presented one decision at a time.

## D24 — Own-identity, claim-bounded expense collaboration

**Founder ruling:** ratified on 2026-08-02. D1-D23 remain binding and
unchanged.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one optional,
> Tenant-controlled, own-identity exact-claim-bounded Expense Collaboration
> Assignment Version that records responsibility, provenance, and a code-owned
> collaboration-mode ceiling but never replaces Phase 12 authorization; bound
> to one exact Tenant, Legal Entity, Expense Program, claimant Party, helper
> Party and accepted authenticated principal, stable Expense Claim, covered
> item/split/purpose/evidence scope, an explicit code-owned Evidence Access
> Projection Version from which stricter Phase 3/10 classification may only
> subtract, and half-open interval; activated only through a separate
> authority-free, one-time, expiring invitation accepted by the verified
> principal, and otherwise absent unless enabled under a staff-managed,
> claimant-managed, or combined appointment posture; with one quiet
> prepare-only default, exact independently revocable assignments even after
> batch setup, and one separately enabled mechanical submission operation only
> for complete unchanged Claim Versions whose material facts and evidence-link
> set are pinned by immutable authenticated Claimant Confirmation or a
> versioned tenant-admitted claimant-authored external attestation meeting an
> Asym minimum proof floor; explicit multi-claim, claimant, Legal-Entity,
> item/split, purpose, currency, and evidence coverage with no silent omission
> or hidden partial submission; separately preserved claimant, economic payer,
> evidence contributor, preparer, submitter, confirmer/attestor, reviewer,
> approver, beneficiary/payee, and actual-principal truth; minimum private
> evidence access through current-authorized non-cacheable retrieval,
> persistent scoped “Helping with expenses” context, non-transitive deny-first
> future-access revocation without fictional recall of delivered bytes,
> identity/lifecycle quarantine without automatic succession, semantic
> idempotency, commit-time reauthorization and current-version/epoch CAS,
> immutable action provenance, cause-owned observability, and append-only
> correction and recovery—without shared credentials, whole-account
> impersonation or visibility, a second PDP, generic delegation graph,
> membership-, spouse-, household-, team-, manager-, email-, OCR-, match-, AI-,
> notification-, silence-, or timeout-derived authority, helper-created
> claimant consent, stale or reusable evidence URLs, helper-selected review,
> self-approval, transitive delegation, automatic successor authority,
> payment/payroll/Field-Account/accounting authority, public helper/evidence
> leakage, or any reopening of Phase 21 D1-D23.**

### Exact collaboration and authorization truth

An **Expense Collaboration Assignment Version** is responsibility, scope, and
provenance, not an ACL. Its only operation choice is a code-owned collaboration-
mode ceiling: `prepare_only` or the separately enabled
`prepare_and_submit_confirmed`. Phase 12 remains the sole request-time Policy
Decision Point. Every list, detail, evidence contribution or retrieval, upload
finalization, draft mutation, ready-for-review action, submission, export,
notification, repair, background job, and support operation intersects:

1. current Tenant and Legal Entity activation;
2. current half-open assignment version;
3. exact claimant Party, helper Party, accepted authenticated principal, stable
   Expense Claim, Expense Program, item/split, purpose, and evidence scope;
4. the code-owned Evidence Access Projection Version and the stricter current
   Phase 3/10 classification floor;
5. current Active Tenant Assignment and independently granted Phase 12
   capability;
6. current claim, evidence, identity-binding, and invitation state; and
7. current governance epoch and claim/assignment CAS.

Support Assignment participation, marriage, household, team, manager,
relationship, broad role, D13 review delegation, D22 prospective request,
sender address, OCR/match confidence, model output, notification delivery, and
provider identity are never authority. Assignment storage is not an arbitrary
permission list, role, formula, policy DSL, impersonation stack, or transitive
delegation graph.

The capability is Tenant- and Legal-Entity-off and structurally absent by
default: no setting, navigation, count, empty state, queue, notification,
report field, export field, or API enumeration. When enabled, the tenant
chooses `staff_managed` (recommended), `claimant_managed`, or `both`. That
posture determines who may request an exact appointment and never widens the
tenant operation or evidence ceiling.

### Invitation, appointment, and lifecycle

An **Expense Collaboration Invitation Version** is opaque, one-time, expiring,
and authority-free. It identifies no protected expense data before an
authenticated, verified principal explicitly accepts through current Phase 12
authorization and CAS. Supabase Auth invitation or account creation never
creates Tenant membership, Party association, principal binding, or
collaboration authority. Pending, expired, rejected, superseded, and ambiguous
invitations grant nothing.

Accepted setup creates one exact independently revocable assignment per stable
Expense Claim, including after a previewed batch appointment. A helper may
serve many claimants, and a claimant may use more than one helper, but each
exact assignment retains its own interval, mode, evidence projection, identity
binding, provenance, and successor lineage. A helper cannot appoint another
helper or expand their own envelope.

Disablement, offboarding, leave, death/incapacity, spouse or team separation,
Party merge/split, principal relink, Legal Entity change, classification
change, and tenant deactivation deny new work first and preserve immutable
provenance. Drafts become an explicitly owned reassignment or disposition task.
No spouse, household member, teammate, helper, participant, manager, or prior
confirmer automatically succeeds to claimant authority. Party identity change
or relink quarantines rather than silently retargets an active assignment.

Revocation is deny-first and non-transitive. It appends a successor, advances
the authorization/governance epoch, fences new reads and writes, invalidates
authorization caches, stops new evidence delivery, suppresses stale queued
notifications, and makes offline work reauthorize before any authoritative
commit. It truthfully cannot recall bytes already obtained.

### Prepare-only default and exact claimant confirmation

The ordinary **Prepare drafts** mode permits only:

- staged private evidence contribution for the exact claimant/claim;
- minimum linked or helper-contributed evidence retrieval admitted by both the
  Evidence Access Projection and current Phase 3/10 floor;
- creation or editing of unsubmitted draft facts within exact scope; and
- **Ready for claimant review** on the current version.

The optional advanced operation may mechanically submit only a complete,
unchanged Claim Version already covered by an immutable **Claimant
Confirmation Version**. Confirmation pins the current version digest and every
material assertion: claimant, Legal Entity, economic payer, item/split amounts
in integer minor units, ISO currency, incurred date, merchant/payee assertion,
business purpose, funding classification, exact evidence-link set, missing-
receipt declaration, applicable tax/relationship answers, and attestation
policy, method, and source. A material successor stales the confirmation.

A claimant without an Asym login may use only a versioned tenant-admitted,
claimant-authored external attestation that meets the Asym minimum proof floor,
pins the same digest and explicit assertion, and retains exact source, time,
method, evidence strength, and admitting actor. Tenant policy may strengthen
the floor, never weaken it to helper assertion, forwarded email, reply-link
possession, silence, timeout, notification delivery, a prior claim, or model
inference. The helper cannot author, admit alone, mutate, or reuse claimant
confirmation.

Claimant, economic payer, evidence contributor, preparer, submitter,
confirmer/attestor, reviewer, approver, beneficiary/payee, and actual principal
remain separate typed facts. **Prepared by Alex for Jordan** and **Submitted by
Alex** never rewrite Alex's actual actions as Jordan's. Jordan's assertion
comes only from the exact confirmation. The helper cannot change bank/payee
data, choose the D13 route, review, approve, exception-approve, mark paid,
create an obligation or Field Account effect, release payment or payroll, or
deliver accounting.

### Multi-claim submission and conflict rules

Every Claim Version and item/split in a multi-claim Expense Report Submission
must independently have current collaboration coverage, Phase 12 authority,
permitted evidence visibility, and exact confirmation. A report never crosses
claimant Parties or Legal Entities. Currency remains exact per claim/item and
never becomes an authoritative converted report total. Different purposes may
be grouped only when every exact slice qualifies.

Uncovered work is blocked or intentionally submitted in a separate user-
selected envelope. It is never silently omitted, and partial server success is
never presented as complete submission. A material change creates a successor
Claim Version, fresh confirmation, and—when submitted—a fresh immutable
submission and D13 governance resolution/route snapshot.

A helper who prepared, submitted, paid, benefited from, or contributed evidence
to a claim cannot satisfy an independent D13 review step for that claim even
when the actor holds a general reviewer capability. Work assignment never
grants authority to decide, a helper cannot select the route, and small-tenant
oversight remains D13's independently named path rather than a D24 bypass.

### Evidence, concurrency, recovery, and experience

Helper uploads are staged, private, resumable, scanned, non-authoritative, and
reauthorized at finalization and linking. Email sender, alias, filename, OCR,
merchant/date/amount similarity, or AI confidence may suggest but never select
claimant, establish authority, confirm, or submit. Ambiguous or quarantined
evidence remains private for explicit authorized resolution.

Evidence and claim source tables are not browser-enumerable. Every child repeats
Tenant and Legal Entity scope with same-scope composite constraints. Forced
coarse RLS is defense in depth; the server PDP owns fine-grained decisions.
Service-role, table-owner, `BYPASSRLS`, view, function, export, support, and
background paths receive explicit denial tests. Mutable/large collaboration
arrays are never authorization in JWTs.

Receipt access uses current-authorized, server-mediated, non-cacheable private
retrieval with private/no-store controls rather than reusable bearer URLs.
Every protected command uses semantic idempotency and one short local
transaction that reauthorizes before commit and CAS-checks current claim,
assignment, principal binding, evidence disposition, and governance epoch.
Immutable action/audit provenance and identifier-only outbox facts append in
the same transaction or the command rolls back. Storage, scan, email, and
notification work remains outside behind recoverable outbox work. Blind retry,
last-write-wins, and distributed-transaction fiction are prohibited.

The helper remains signed in as themselves under a persistent non-color-only
**Helping Jordan with expenses** context. A scoped queue/switcher lists only
currently authorized claims and does not switch the whole account identity.
The claimant receives one **Alex prepared an expense for you** task and lands
on the first changed/unconfirmed material fact. Plain statuses distinguish
`Draft`, `Ready for your review`, `Confirmed`, `Submitted for review`, and
`Needs changes`. Advanced submit copy identifies whose facts were confirmed,
the exact version, the actual submitter, and that approval, reimbursement,
payment, and accounting remain separate.

Healthy work creates no recurring admin task. Previewed batch setup produces
exact independently revocable assignments; event-triggered review and one
orphan-work queue replace arbitrary recertification campaigns. Every surface
must pass WCAG 2.2 AA, financial error-prevention, mobile/reflow, keyboard,
screen-reader, focus, status-announcement, and comprehension proof.

### Independent downstream truth

D24 never creates, qualifies, dates, fulfills, or changes a D13 approval,
Approved Expense Snapshot, Reimbursement Obligation, D23 Expense Field Account
Effect or coverage, D15 compensation/payment handoff, External Payment
Occurrence, payroll fact, Phase 20 Accounting Release or Bank Match, provider
posting/readback, QBO/Xero fact, missionary statement, supporter feed, or
public-giving truth. A downstream source owner may retain only the minimum
non-authoritative actor/collaboration provenance after its own independent
admission contract succeeds.

Submitted-claim correction uses a linked D10 successor and fresh confirmation/
submission. D13, D15, D23, Phase 20, payment, and statement owners use their own
append-only correction paths; D24 cannot reopen or rewrite them. Helper identity
is available to the claimant and protected audit purpose but does not leak to
missionary statements, supporter/public surfaces, ordinary telemetry, or
purpose-unrelated notifications.

### Adversarial disposition

The complete D24 ruthless review is binding in the Phase 21 research evidence.
Every requested category has a concern: brittleness, technical debt, edge
cases, footguns, tenant safety, over-engineering, UX/UI friction, hidden
coupling, failure modes, data integrity, security/privacy, scalability/
performance, operational burden, observability, dependency/integration risk,
migration/upgrade risk, and other development hazards.

Permanent controls are the assignment-as-envelope/PDP separation, exact stable-
claim and item/split scope, own identity, authority-free invitation, prepare-
only default, exact immutable confirmation, proof-floored external attestation,
separate actor truths and conflicts, no silent partial submission, complete
same-scope constraints, private request-authorized evidence delivery, deny-
first revocation, identity/lifecycle quarantine, semantic idempotency, commit-
time reauthorization, CAS, immutable action provenance, outbox recovery, quiet
progressive UX, PII-minimized observability, and negative downstream authority
boundaries.

### Required production proof

1. Operation/capability tests prove prepare without submit, submit denial
   without exact confirmation, evidence ceilings, no transitivity, no
   relationship-derived access, and server/UI action parity.
2. Actor/conflict tests preserve every typed role and prove the helper cannot
   satisfy independent D13 review or change route, payee, payment, Field
   Account, payroll, or accounting truth.
3. Real PostgreSQL/RLS/PDP substitution tests cover every Tenant, Legal Entity,
   claimant, helper, principal, claim, version, item/split, purpose, currency,
   evidence, classification, assignment, invitation, job, export, support,
   view/function, and service-role path without existence leakage.
4. Concurrency/fault tests race claimant/helper/two-helper edits, confirmation,
   material successor, revocation, principal disablement, upload finalization,
   evidence quarantine, URL retrieval, policy succession, notification, and
   repeated/ambiguous submission. Exactly one authorized immutable outcome
   survives.
5. Multi-scope tests prove explicit split/block for mixed claimant, Legal
   Entity, purpose, currency, and uncovered slices with no silent omission or
   hidden partial success.
6. Evidence tests cover spoofed/forwarded/aliased email, duplicates, multiple
   attachments, malware, unsupported/oversize files, ambiguous matches, scan/
   provider outages, revoked helpers, non-cacheable retrieval, and truthful
   limits on already delivered copies.
7. Lifecycle tests cover pending/expired invitation, helper and claimant
   offboarding, leave, death/incapacity, spouse/team separation, Support
   Assignment succession, Party merge/split, principal relink, Legal Entity or
   classification change, tenant deactivation, and retention/hold.
8. Negative-boundary tests prove D24 creates no approval, snapshot, obligation,
   Field Account effect, handoff, payment, payroll, accounting, bank-match,
   provider, statement, feed, or public truth.
9. Production-cardinality tests cover centralized assistants, month-end keyset
   queues, bounded PDP evaluation, chunked batch setup, evidence retrieval,
   outbox fan-out, tenant-fair backpressure, safe observability, and cause-owned
   recovery.
10. Accessibility/comprehension tests prove missionaries, spouses, teammates,
    assistants, finance users, and small-tenant admins can explain whose claim
    is open, who asserted/prepared/submitted it, what the helper can see/do,
    what waits on whom, and why it is not approved, owed, payable, paid, or
    exported.

### Release dependency ruling

D24 may be specified after ratification, but runtime release is blocked on the
completed Phase 3/9/10/12 projection, Party/principal, Legal-Entity, current
Active Tenant Assignment, PDP, and governance-epoch substrate plus D10's Phase-
29-compatible private receipt-byte seam. Current broad role fallbacks, client-
filtered scope, profile-derived Tenant context, service-role reads, public
`document-uploads`, best-effort generic audit, non-forced RLS, and reusable
signed-URL precedent are evidence to replace or bypass through the established
future contracts, not acceptable D24 foundations.

### Evidence

- [D24 research, founder selection, ruthless review, and ratification](./phase-21-mission-dashboard-product-research-evidence.md#d24-decision-research--own-identity-expense-collaboration)
- [ADR-0085 — Own-identity, claim-bounded expense collaboration](../../adr/0085-own-identity-claim-bounded-expense-collaboration.md)
- [ADR-0071 — Claim-level expense truth](../../adr/0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0074 — Expense Governance Profiles](../../adr/0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0080 — Support Assignments and separated access](../../adr/0080-organization-controlled-support-assignments-and-separated-access.md)
- [ADR-0083 — Optional exact Prospective Expense Authorization](../../adr/0083-optional-exact-prospective-expense-authorization.md)
- [ADR-0084 — Expense Field Account Effect Recognition](../../adr/0084-source-family-expense-field-account-effect-recognition.md)
- [Phase 12 permission configuration](./phase-12-full-role-permission-configuration.md)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

D24 closes actual-expense collaboration without reopening D1-D23, creating
account impersonation or a generic delegation product, or granting approval,
payment, Field Account, payroll, accounting, statement, supporter-feed, or
public authority. The next material founder seam will be selected from the
post-D24 preservation, repository, missions-practice, and production-
completeness gap audit and presented one decision at a time.

## D25 — Exact, cause-owned Expense Claim resolution

**Founder ruling:** ratified on 2026-08-02. D1-D24 remain binding and
unchanged.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one exceptional-only,
> immutable, exact-scope and code-cause-owned Expense Claim Resolution Case,
> embedded as one quiet contextual expense update and one exception-first
> finance workspace rather than exposed as a case-management or workflow
> product; bound to one Tenant, Legal Entity, Expense Program, claimant Party,
> stable Expense Claim, triggering Claim Version, exact item/split/purpose/ISO-
> currency coverage, cause-contract version, root source fact and owner,
> evidence/classification references, current authorization/governance
> versions, and a proportional complete Downstream Impact Manifest; opened
> idempotently only for an actual issue under the closed causes information
> required, claimant withdrawal requested, claimant review requested,
> organization source error, policy application question, claimant unavailable
> or identity changed, and downstream-effect conflict, with same-cause
> duplicates converging and distinct exact cases grouped only for presentation;
> giving each actor one plain-language, source-owned next safe action while
> clean and separable claim coverage continues, claimant, helper, organization,
> reviewer, lifecycle, and actual-principal facts remain separately attributed,
> and material changes receive an exact before/after and downstream-impact
> preview; completing only from the root source owner's proof plus an explicit
> disposition for every affected downstream family, while D10, D13, D15/D16,
> D23, D12, Phase 20, payroll/AP, and providers alone append their own
> successor, supplement, withdrawal, decision, obligation, payment/return,
> later-cycle Field Account, statement, accounting, or provider correction
> truth; enforced by complete same-scope constraints, integer minor units and
> exact ISO currencies, semantic idempotency and non-overlap, the sole Phase 12
> PDP before enumeration and at commit, version/governance/conflict/downstream
> CAS reproof, deterministic locking, private D10/Phase-29 evidence, and one
> atomic local case-action, actor-provenance, immutable-audit, projection, and
> identifier-only-outbox commit, with PII-minimized governed notifications,
> tenant-fair recovery, and production-shaped security, failure, load,
> accessibility, and comprehension proof—without a fifth D13 disposition,
> tenant-authored catch-all, generic Resolve/Close/Reopen/Unapprove/Override/
> Edit-as-claimant/Mark-paid/rollback, destructive mutation or deletion,
> relationship/helper/lifecycle succession, silence/timer/notification/AI/
> provider-ambiguity authority, custom workflow or status DSL, report-wide
> blocking where exact coverage can proceed, cross-currency arithmetic,
> reusable evidence URLs, hidden partial success, broad administrator or
> service-role authority, or any claim that case completion proves approval,
> reimbursability, obligation, funding, payment, Field Account inclusion,
> statement correction, accounting delivery, provider acceptance, posting, or
> reconciliation.**

### Coordination only, with exact identity

The Expense Claim Resolution Case coordinates one proved exception. It is not
an Expense Claim, D13 decision or Reviewer Exception, Field Account Integrity
Case, reimbursement or payment case, Accounting Exception Case, general
Mission Control task, or Phase 34 workflow. Healthy claims create no case,
task, notification, or setup work.

One immutable case basis binds the exact Tenant, Legal Entity, Expense
Program, claimant Party, stable Expense Claim, triggering Claim Version,
item/split/purpose/ISO-currency coverage, cause-contract version, root source
fact and owner, evidence/classification references, authorization and
governance versions, and Downstream Impact Manifest. Its semantic identity is
Tenant × Legal Entity × stable Claim × cause-contract version × root source
identity × exact coverage digest.

Same-meaning replay converges on the original result. Changed content under
the same key conflicts. Overlapping unresolved causes must be explicitly
related and ordered or fail visibly; last-created-wins is prohibited. Distinct
exact cases may be grouped only for presentation. Clean separable siblings
continue unless a code-declared inseparable relationship proves that exact
coverage must move atomically.

### Closed cause and action contract

The versioned code-owned cause catalog contains exactly:

1. `information_required`;
2. `claimant_withdrawal_requested`;
3. `claimant_review_requested`;
4. `organization_source_error`;
5. `policy_application_question`;
6. `claimant_unavailable_or_identity_changed`; and
7. `downstream_effect_conflict`.

There is no tenant-authored `other`. Free text may explain a cause but cannot
add authority or routing semantics. A prospective new cause requires an exact
source owner, admissible scope, permitted actors/actions, completion predicate,
downstream dispositions, migration treatment, and proof. Tenants may configure
bounded queue owners, reminders, existing D13 routes, and help copy, but not
states, formulas, scripts, timers, financial meanings, or workflow graphs.

Claimants may provide requested information or evidence, state that evidence
is unavailable, request another review, request withdrawal of exact eligible
unapproved coverage, and confirm or submit a D10 successor. Staff record only
organization-authored facts and correction proposals under their own
identities. A D24 helper remains inside the current exact assignment and never
becomes claimant, confirmer, reviewer, approver, lifecycle successor, or
financial actor. Only a current authorized, conflict-free D13 reviewer records
one of D13's existing four dispositions or a separately permitted Reviewer
Exception.

Silence, elapsed time, notification, email reply, account deletion, stale
credentials, manager assertion, spouse/team/helper relationship, OCR/matching,
AI output, or provider ambiguity never proves a claimant fact, unavailability,
consent, authority, succession, decision, or completion.

### Source-owned correction and completion

The case stores no authoritative mutable `open`, `resolved`, `approved`,
`reopened`, `paid`, or `corrected` scalar. Immutable Expense Claim Resolution
Occurrences drive a disposable current-action projection. **Needs your
update**, **With finance**, **Waiting on source**, **Correction in progress**,
and **Complete** are presentation labels only and may not feed a financial
consumer.

The Downstream Impact Manifest is empty when no downstream authority exists
and otherwise completely pins every possibly affected source family and
version. Completion is derived only after the root source owner proves the
cause predicate and every affected family records `corrected`, `unaffected`,
`not_applicable`, or safely `quarantined`.

| Existing truth                       | Sole permanent path                                                                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft                                | D10 successor draft or exact withdrawal occurrence                                                                                                                    |
| Submitted or pending review          | Linked D10 successor, fresh claimant confirmation/submission where required, and current D13 route/decision                                                           |
| Rejected or excluded                 | New facts use a successor; a same-fact review request gets new exact D13 review evidence and decision while the old decision remains                                  |
| Approved Expense Snapshot            | D10/D13-owned supplement, successor, reversal, or correction; never `Unapprove`                                                                                       |
| Reimbursement Obligation             | D15-owned exact cancellation, reduction, or supplement only when independently qualified                                                                              |
| D23 effect or closed Support Cycle   | D23 appends a source- and cause-linked correction in a later permitted cycle; the old close never reopens                                                             |
| Handoff or provider operation        | The owning lane inspects first and creates only proved residual succession; ambiguity remains quarantined                                                             |
| External payment                     | Preserve payment truth; D16 alone determines any qualified return path, never negative reimbursement, debt inference, payroll deduction, or unrelated netting         |
| Published statement                  | D12 alone creates any correction or later statement; the artifact remains immutable                                                                                   |
| Phase 20 release or provider posting | Phase 20 alone creates any qualified Compensating Accounting Release in an accountant-permitted period, with idempotent delivery, exact readback, and drift detection |

D25 requests typed owner-domain commands and observes immutable outcomes; it
never edits the target or performs the correction. Case completion proves only
that its exact coordination predicate concluded—not approval,
reimbursability, obligation, funding, availability, payment, Field Account
inclusion, statement correction, accounting delivery, provider acceptance,
posting, sync, or reconciliation.

### Quiet, progressive experience

The claimant sees one contextual expense update only when they can act or a
material outcome affects that claim. It leads with what finance needs, which
expense and exact ISO-currency amount, why, one primary action, and what
happens next. Changed facts use a prefilled before/after review. The UI says
**Request another review**, not **Appeal**, and never exposes case, effect,
watermark, disposition, reconciliation, or provider jargon by default.

A helper sees the existing **Helping with expenses** identity context and only
currently authorized actions. Finance reuses **Expenses → Needs attention**
with **Response received**, **Waiting for claimant**, **Source correction**,
**Downstream correction**, and **Aging** views. Consequential actions disclose
exact before/after and downstream impact. Safe bulk work is limited to
homogeneous routing or communication, with row-level authorization and explicit
results; no bulk approval, withdrawal, correction, completion, payment, or
accounting action exists.

The feature has no empty Cases navigation, recurring recertification, workflow
builder, or clean-path click. Phase 6/17 messages contain only an opaque
reference, safe stage/action, and minimum timing. Delivery and reply never
decide or complete work. Mission Control may mirror assignment, target,
reminder, and follow-up but cannot own or clear D25 or any source-domain
disposition.

All surfaces require WCAG 2.2 AA, 320-pixel reflow, keyboard and screen-reader
operation, visible focus, announced result/error recovery, financial review-
and-confirm, localization/RTL, slow-network truth, and representative-user
comprehension proof.

### Isolation, evidence, concurrency, and recovery

Phase 12 remains the sole PDP before enumeration and again at commit. Every
case child repeats Tenant and Legal Entity scope with complete same-scope
constraints. Forced coarse RLS is defense in depth; list, count, search,
cache, export, Realtime, job, support, view/function, service-role, table-owner,
and `BYPASSRLS` paths receive explicit substitution and non-enumeration tests.

Receipt bytes remain D10/Phase-29 private evidence. D25 stores typed references
only. Retrieval is current-authorized, purpose/classification-filtered, and
non-cacheable; reusable bearer URLs and copied evidence are prohibited.

Each consequential command reauthorizes and CAS-checks current case, claim,
route, collaboration, evidence, identity/lifecycle, classification, conflict,
downstream manifest, and governance versions. One short local transaction
appends the case action, actual actor provenance, immutable audit, projection
change, and identifier-only outbox fact or nothing. Semantic idempotency plus
content digest, deterministic narrow locking, bounded whole-transaction retry,
inspect-before-retry, explicit unknown/waiting states, and tenant-fair outbox
work prevent duplicate or hidden partial correction.

### Adversarial disposition

The complete D25 ruthless review in the Phase 21 research evidence is binding.
Every required category has a concern: brittleness, technical debt, edge cases,
footguns, tenant safety, over-engineering, UX/UI friction, hidden coupling,
failure modes, data integrity, security/privacy, scalability/performance,
operational burden, observability, dependency/integration risk, migration/
upgrade risk, and other development hazards.

Permanent controls are exceptional-only creation, immutable exact scope,
finite cause/action contracts, separately attributed actors, source-derived
completion, complete proportional impact coverage, append-only owner-domain
corrections, same-scope constraints, sole-PDP authorization, private evidence,
semantic idempotency, version/governance CAS, atomic audit/projection/outbox,
quiet progressive UX, PII-minimized observability, tenant-fair recovery, and
negative financial-authority proof.

### Required production proof

1. A mixed report advances clean claims while one exact claim completes an
   information request, response, successor, confirmation/submission, and
   fresh D13 review; declared inseparable coverage remains atomic.
2. Claimant, helper, preparer, confirmer, organization evidence contributor,
   reviewer, approver, payee, and actual principal never collapse.
3. Every closed cause admits only its declared scope, actors, actions, root
   proof, and completion predicate; a tenant cannot add an `other` route.
4. Same semantic cause converges, changed content conflicts, overlapping cases
   relate/order or fail visibly, and races cannot double-correct downstream
   coverage.
5. A case, task, message, response, or derived **Complete** state changes no
   claim, decision, snapshot, obligation, payment, Field Account, statement,
   accounting, provider, or public truth by itself.
6. Every post-snapshot/payment/effect/statement/accounting change uses exactly
   one source-owned append-only path and ambiguous outcomes stay quarantined.
7. Real PostgreSQL/RLS/PDP substitution covers every Tenant, Legal Entity,
   claimant, helper, reviewer, claim/version, item/split, purpose, currency,
   evidence, case, list/count/search/export/cache/job/function/view/service/
   support path before enumeration and at commit.
8. Evidence quarantine, copied URLs, browser/CDN caches, notifications,
   exports, logs, AI, and support paths disclose neither protected content nor
   unauthorized existence.
9. Production-volume queues use compact indexed projections, keyset
   pagination, bounded history, narrow locks, chunked tenant-fair fan-out,
   deduplicated reminders, and cause-owned repair.
10. Accessibility, slow/offline-network truth, error recovery, and moderated
    claimant/helper/reviewer/finance/admin comprehension tests pass.

### Evidence

- [D25 research, founder selection, ruthless review, and ratification](./phase-21-mission-dashboard-product-research-evidence.md#d25-decision-research--exact-expense-claim-resolution-without-destructive-reopening)
- [ADR-0086 — Exact, cause-owned Expense Claim resolution](../../adr/0086-cause-owned-expense-claim-resolution.md)
- [ADR-0071 — Claim-level expense truth](../../adr/0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0074 — Expense Governance Profiles](../../adr/0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0076 — Artifact-always reimbursement handoff](../../adr/0076-artifact-always-reimbursement-handoff.md)
- [ADR-0084 — Expense Field Account Effect Recognition](../../adr/0084-source-family-expense-field-account-effect-recognition.md)
- [ADR-0085 — Own-identity expense collaboration](../../adr/0085-own-identity-claim-bounded-expense-collaboration.md)
- [Phase 12 permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 20 accounting boundary](./phase-20-accounting-exports-reconciliation.md)
- [SAP Concur selected expense return](https://help.sap.com/docs/CONCUR_EXPENSE/1f13d54352684d6dba6e65c8c5d75ead/c459abae51c3101593a1902615753967.html)
- [Oracle Expenses audit actions](https://docs.oracle.com/en/cloud/saas/financials/25c/fawde/audit-actions.html)
- [IRS Publication 463](https://www.irs.gov/publications/p463)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

D25 closes exceptional Expense Claim coordination without reopening D1-D24,
adding a fifth D13 disposition, creating a general workflow/case product, or
granting claim, approval, payment, Field Account, statement, accounting,
provider, or reconciliation authority. The next material founder seam will be
selected from the post-D25 preservation, repository, missions-practice, and
production-completeness gap audit and presented one decision at a time.

## D26 — Purpose-owned Phase 21 records schedules and exact tenant custody exports

### Decision

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) - one source-purpose-,
> record-family-, jurisdiction-, Legal-Entity-, and relationship-where-material-
> owned catalog of immutable, qualified-review-backed Phase 21 Records Schedule
> Contracts with one quiet safe default and only bounded prospective tenant
> bindings; exact typed triggers, preservation floors, privacy ceilings,
> access/use limits, copy classes, holds, recovery, export, and verified-
> disposition semantics; immutable per-record resolutions and complete successor
> impact coverage; and Phase-29-only private-byte custody for Phase-21-owned
> evidence and D26 export packages, including copy inventory, package staging,
> hold/disposal execution, backup and restore suppression, and authorized
> delivery under Phase 3/10/12 egress authority. Independently owned artifacts,
> including Phase 18 generated documents, retain their owner-domain exact-byte
> and lifecycle authority and enter D26 only by authorized reference or
> retrieval. Every currently
> authorized tenant can repeatedly export exact Phase 21 records and policy
> history as contextual human/print copies or one source-watermarked,
> manifest-complete, open-format Records Export Package per Legal Entity, with a
> one-action tenant-wide fan-out, canonical JSONL, bounded spreadsheet-safe CSV,
> accessible PDF/HTML, authorized original artifacts, exact relationships,
> applicable contract/binding and service-document versions, ordered verifiable
> parts, integrity digests, truthful omissions and owner-domain references,
> append-only residual recovery, a short governed repeatable-download window,
> and a separately governed final offboarding snapshot-plus-delta and records-
> only retrieval window. Download, print, tenant external-copy assertion,
> verified destination custody transfer, Asym-held retention, legal hold,
> termination, and copy-specific disposal remain independently authoritative:
> none implies another, changes a source schedule, releases a hold, or proves
> legal sufficiency. The tenant remains responsible for determining its
> applicable organizational obligations and securing, validating, retaining,
> recovering, and disposing copies in its custody; Asym remains responsible for
> its actual statutory, contractual, security, processor/service-provider,
> export-fidelity, hold, return, deletion, backup, provider-copy, and published
> commitments for copies in its custody. Guidance is source-linked,
> jurisdiction-labelled, review-dated, and explicitly informational, with no
> compliance warranty, individualized legal advice, liability-shifting checkbox,
> tenant-authored legal DSL, arbitrary timer, casual forever, floor weakening,
> unsupported privacy-ceiling breach, direct delete, download-as-transfer,
> export-triggered disposal, paper-as-universal-original claim, silent partial
> package, proprietary hostage format, generic database dump, reusable evidence
> URL, email attachment, broad restricted-person export, cross-owner deletion or
> universal-history claim, giant transaction/archive, Phase 30 export ownership,
> launch-time connector sprawl, restore resurrection, or disclaimer purporting
> to erase Asym's own duties.**

### Authority and responsibility split

The tenant owns its organizational purpose, jurisdiction and classification
facts, professional-advice decisions, and every copy after it enters tenant
custody. Phase 21 owns the business meaning of Phase 21 record families,
schedule contracts and bindings, immutable record resolutions, successor
impact, export selection, package schema, and coverage truth. Asym remains
responsible for the statutory, contractual, security, processor, retention,
return, deletion, backup, provider-copy, and published commitments that
actually apply to copies in Asym custody; tenant copy choices cannot waive or
transfer those duties.

Phase 29 alone executes the physical lifecycle for Phase-21-owned evidence and
D26 package bytes: copy inventory, malware and quarantine controls, package
staging, authorized byte delivery, holds, disposal, provider-copy evidence,
backup handling, and restore suppression. Phase 18 retains semantic and exact-
byte ownership of its generated documents; D26 may include them only through
authorized owner-domain reference or retrieval. Phases 3, 10, and 12 remain the
sole projection, classification, restricted-
subject, authorization, step-up, and egress authorities. Phase 30 is inbound
only. Phase 31 owns any later certified external-destination adapter. Phase 38
owns data-subject privacy requests. None of those phases may redefine a Phase
21 record's purpose or schedule.

### Closed schedules, bindings, and immutable resolutions

One versioned Phase 21 Records Schedule Contract covers each qualified
combination of source purpose, closed record family, jurisdiction, Legal
Entity, and relationship where material. It defines exact typed triggers,
preservation floors, privacy ceilings, use/access boundaries, copy classes,
holds, recovery, export, and verified-disposition semantics. A quiet reviewed
default applies unless one bounded prospective tenant binding wins under a
deterministic non-stacking precedence rule. Tenants may choose only supported
reviewed variants; there is no arbitrary legal-rule DSL, free-form timer,
casual `forever`, floor weakening, unsupported ceiling extension, or direct
delete control.

Every record pins the exact contract and binding versions resolved when its
authoritative trigger occurs. A later legal, policy, service, provider, or
tenant change creates an immutable successor plus a complete Phase 21 Records
Schedule Successor Impact Manifest; it never silently rewrites prior evidence.
Ambiguous, missing, conflicting, or unsupported classification enters one
cause-owned review and blocks only the smallest affected scope. Legal hold is
monotonic and independent of ordinary export, termination, and disposition.

The launch catalog is closed to six families:

1. Field Account, allocation, assessment, reservation, capacity, opening,
   close, balance, integrity, and correction facts;
2. Expense claim, review, authorization, obligation, payment/return,
   resolution, Field Account effect, and accounting-lineage facts;
3. sensitive receipt, organization-card, travel, opening, provider, and other
   admitted source bytes and derivatives;
4. compensation, reimbursement, and accounting-handoff artifacts and exact
   readback evidence;
5. authorization, collaboration, audit, hold, export, and disposition
   evidence; and
6. transient staging, preview, parser, OCR/AI, cache, package, and diagnostic
   material.

### Exact export and offboarding contract

Every currently authorized tenant can repeatedly obtain:

- **Export this view**, a bounded convenience projection explicitly labelled
  as not an archive;
- **Download record copy**, the authorized human-readable or original record;
- **Create Phase 21 records archive**, one exact source-watermarked package per
  Legal Entity; and
- **Final offboarding archive**, an initial snapshot plus a final bounded delta
  and a separately governed records-only retrieval window.

A one-action tenant-wide archive request fans out to one independently sealed
package per Legal Entity beneath one tenant index. Canonical JSONL preserves
the typed source record and version history; spreadsheet-safe CSV is a bounded
convenience projection; accessible PDF/HTML provides readable copies; exact
authorized originals remain original bytes. Each package includes stable
opaque identifiers, exact relationships, ISO currencies and integer minor
units, source and correction lineage, applicable contract/binding and service-
document versions, README/schema information, deterministic ordered parts, and
integrity digests.

The Records Export Coverage Manifest assigns every selected record exactly one
truthful disposition: `included_exact`,
`included_human_readable_projection`, `owner_domain_reference`,
`excluded_by_current_authority`, `restricted_separate_package_required`,
`already_lawfully_disposed`, `quarantined_or_unavailable`, or
`not_applicable`. A package is **Ready** only when its manifest is closed and
independently verifiable. **Ready with issues** remains downloadable but is
never described as complete; later proved residual content arrives through an
append-only residual package, never mutation of a sealed package.

The universal fulfillment lane is authenticated browser download with print
support. Package preparation is chunked, streaming, resumable, tenant-fair,
and asynchronous rather than one giant transaction or in-memory archive. A
quiet seven-day staging default may be prospectively changed by an authorized
security administrator to one reviewed value of 24 hours, 3 days, 7 days, or
14 days. Expiry removes only staged package bytes, not source records, policy
history, manifest evidence, or the right to request a fresh authorized export.
A destination connector is optional Phase 31 scope only after exact identity,
least privilege, write/readback, ambiguity-safe retry, drift, revocation,
residency, and exit certification.

For offboarding, the contract-defined records-only retrieval window is at
least 30 days where the EU Data Act applies, or longer where another binding
obligation requires it. Source-specific Phase 18 closure rules remain binding.
Download, print, Tenant External Copy Assertion, Verified Destination Custody
Transfer, Asym retention, legal hold, termination, and copy-specific disposal
are independent events. `Downloaded` never means `Transferred`; an assertion
that the tenant stored a copy elsewhere is useful custody evidence but cannot
trigger disposal; verified transfer requires destination-specific identity,
write, digest/readback, and authorized acceptance proof.

### Quiet, accessible experience

Healthy records create no missionary notification, recurring task, or visible
retention matrix. Authorized staff use one **Settings → Records & exports**
surface with a plain-language **Records policy**, never a misleading
commercial/legal-contract label. It leads with **Recommended configuration**,
`kept because`, and `starts from`, then progressively discloses jurisdiction,
family, versions, floors/ceilings, copy classes, and evidence.

The archive flow has four steps: choose scope; review included families and
restricted lanes; prepare asynchronously; then download/print or optionally
record external custody. Routine export has no repeated legal attestation.
One high-salience educational acknowledgement is permitted only at policy
activation or a destructive offboarding decision and is never a waiver.
Exceptions appear as one grouped **Needs records review** queue with exact
cause, affected scope, owner, and next safe action.

Copy must say **Ready to download**, not **Safely archived**;
**Downloaded**, not **Transferred**; and exact outcomes such as **active copy
disposed**, **backup beyond use**, **provider deletion requested**, **provider
confirmed deletion**, or **outcome unknown**, never **Deleted everywhere**
without complete proof. WCAG 2.2 AA, 320-pixel reflow, 200%/400% zoom,
keyboard/screen-reader operation, announced asynchronous status and recovery,
reduced motion, localization, low-bandwidth resume, and representative-
nonprofit comprehension proof are release criteria.

### Adversarial disposition

The complete D26 ruthless review in the Phase 21 research evidence is binding.
Every required category has a concern: brittleness, technical debt, edge cases,
footguns, tenant safety, over-engineering, UX/UI friction, hidden coupling,
failure modes, data integrity, security/privacy, scalability/performance,
operational burden, observability, dependency/integration risk, migration/
upgrade risk, and other development hazards.

Permanent controls are closed reviewed schedules, prospective bindings,
immutable resolutions and successors, complete impact and export manifests,
same-scope keys and sole-PDP authorization, open documented formats, exact
source watermarks and stable identifiers, private Phase 29 staging, semantic
idempotency, commit-time reproof, inspect-before-retry, tenant-fair streaming,
short staging, append-only residual recovery, independently authoritative
custody/disposition facts, quiet progressive UX, and a legal/privacy/security/
runtime congruency gate before activation.

### Required production proof

1. Every Phase 21 record and derivative resolves to exactly one closed family
   and one schedule result or one visible review exception.
2. Every selected export record receives exactly one manifest disposition;
   relationships, counts, bytes, digests, and per-currency controls reconcile,
   and an independent reader validates every supported schema generation.
3. Tenant, Legal Entity, subject/account, family, restricted-person, contract,
   binding, package, part, destination, cache, audit, service-role, table-owner,
   and `BYPASSRLS` substitutions fail before enumeration and again at commit.
4. Concurrent binding, successor, export, hold, disposal, and download races
   preserve exact history and never cross an irreversible boundary on stale
   authority.
5. Duplicate request, lost response, worker replay, partial part, corrupt byte,
   provider outage, expired authority, interrupted download, ambiguous
   destination, and restore-resurrection tests produce explicit recoverable
   outcomes without false completion.
6. Security proof covers archive path traversal and collision, decompression
   bombs, CSV formula injection, secret leakage, malware/quarantine, cache and
   signed-link forwarding, PII-rich telemetry, and staged-byte expiry.
7. Large multi-entity, multi-currency offboarding proves snapshot plus delta,
   holds, restricted records, actor succession, regeneration, provider/backup
   outcomes, and restore suppression under production-shaped load.
8. Qualified legal, privacy, security, support, sales, MSA/DPA, OpenPolicy,
   provider, backup, and runtime claims agree before production activation.
9. Representative staff can distinguish view export, readable copy, complete
   archive, external-copy assertion, verified transfer, source retention, and
   copy-specific disposal without support intervention.

### Evidence

- [D26 research, ruthless review, and ratification](./phase-21-mission-dashboard-product-research-evidence.md#d26-decision-research---purpose-owned-phase-21-records-schedules)
- [ADR-0087 — Purpose-owned Phase 21 records schedules and exact tenant custody exports](../../adr/0087-purpose-owned-phase21-records-schedules-and-exact-custody-exports.md)
- [ADR-0038 — Purpose-owned records schedules and verified disposal](../../adr/0038-purpose-owned-records-schedules-and-verified-disposal.md)
- [Phase 1 source-of-truth ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)
- [Phase 3 governed projection and export foundation](./phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 10 sensitive-data safety](./phase-10-sensitive-data-safety.md)
- [Phase 12 permission configuration](./phase-12-full-role-permission-configuration.md)
- [OpenPolicy evidence map](../../ai/OPENPOLICY-EVIDENCE-MAP.md)

### Remaining founder decisions

D26 closes Phase 21 record-purpose, schedule, tenant-copy, archive, and
offboarding-export semantics without reopening D1-D25 or granting Phase 21
private-byte, generic egress, connector, inbound-migration, privacy-request, or
legal-advice authority. The next material founder seam will be selected from
the post-D26 production-completeness audit and presented one decision at a
time.

## D27 — Evidence-gated Core Field Accounts production activation

### Decision

**Founder ruling:** ratified on 2026-08-02.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — one quiet, evidence-gated Core
> Field Accounts Production Activation Contract composed through D17's sole
> Operational Cutover, with proof-gated tenant-selected optional capability
> bindings and cause-owned live containment; using one immutable Phase 21
> Release Generation, one prospective Field Accounts Adoption Plan Version,
> and one content-addressed machine-prepared Go-Live Readiness Manifest bound to
> the exact Tenant, Legal Entity, ISO currency, complete Support Assignment and
> source-family census, environment, code/schema generation, and D17 half-open
> authority boundary, while referencing and never recreating, weakening,
> waiving, or reinterpreting every applicable D1-D26 and owning-phase fact;
> separating fully synthetic demonstration and provider sandbox evidence from
> a production-authorized, complete-cohort, structurally side-effect-dark,
> non-authoritative shadow; giving finance one accessible exception-first
> consequence review and literal start action; and performing final actor,
> permission, source, cohort, policy, mapping, manifest, revocation, and
> generation reproof inside D17's idempotent CAS-guarded cutover rather than a
> second activation state. D17 authority, first and later D11 close/integrity
> proof, D9/D12 publication, Phase 20 accounting delivery, compensation and
> reimbursement handoffs, notifications, external feeds, provider outcomes,
> reconciliation, payroll completion, and payment remain independently
> authoritative; a named missionary pilot scopes only exact D19/Phase 12
> publication, never financial rows. One disposable through-dated Operational
> Readiness Projection keeps healthy tenants quiet and opens only cause-owned
> exceptions; smallest-scope prospective containment stops affected new
> positive or discretionary behavior while preserving immutable history,
> authorized reads, D26 custody export, established obligations, mandatory
> adverse corrections, artifact/manual continuity, and append-only recovery —
> without a tenant-global enable bit, arbitrary flag or workflow matrix,
> random-row financial canary, mutable readiness truth, shadow side effect,
> repeated manual certification, sandbox-as-production proof, generic
> compliance badge, blind retry, implicit downstream success, force-close,
> destructive rollback, or any claim that configured, connected, checked,
> active, closed, published, delivered, posted, reconciled, payroll-complete,
> payable, or paid are the same fact.**

### Thin activation composition and sole authorities

D27 is a production evidence and consequence-review contract, not a new
financial domain or release-management platform. D17 remains the sole Field
Account Operational Cutover and D11 remains the sole close and integrity
authority. D27 may compose and present their current evidence but may never
recalculate, waive, reinterpret, clear, or replace it.

The bounded durable model contains:

1. one platform-owned immutable **Phase 21 Release Generation**, proving only
   that one exact deployed code/schema generation has current invariant,
   security/RLS, workload, accessibility, observability, restore, and recovery
   evidence;
2. one tenant-owned prospective **Field Accounts Adoption Plan Version**,
   selecting one complete core cohort and only the optional capabilities the
   tenant uses from a finite server-owned catalog; and
3. one content-addressed, immutable **Field Accounts Go-Live Readiness
   Manifest**, referencing the current applicable D1-D26 and owning-phase
   evidence for the exact scope, source boundaries/cursors, cohort census,
   policy and mapping generations, actor and authorization epoch, qualified
   reviews, D17 opening-preparation/shadow result, consequence digest, and
   semantic cutover operation.

The manifest carries no mutable `ready` field and grants no permission. A
disposable, rebuildable, through-dated **Field Accounts Operational Readiness
Projection** composes the current states for staff. It is never accepted as
command input.

The D17 cutover binds the accepted manifest identity and digest, Release
Generation, Adoption Plan Version, exact half-open boundary, actor,
authorization epoch, and semantic idempotency key. Inside one short transaction
it reauthorizes the actor and re-proves every source, cohort, policy, mapping,
permission, revocation, and generation input before its existing CAS. A stale
input changes no authority and returns the reviewer to the smallest changed
item. A lost response is inspected by operation identity before any residual
action; there is no blind retry or second activation record.

### Complete cohort and distinct proof classes

Synthetic demonstration, provider sandbox proof, D17 production-shaped opening
preparation/shadow proof, and production authority remain structurally
different. No sample, test identity, or sandbox record can become production
truth through a flag change.

D27 references and invokes D17's already-ratified production-shaped opening
preparation and shadow-reconciliation contract; it owns no second balance
calculation, mapping-admissibility decision, source disposition,
reconciliation result, or financial shadow. D17 may use production-authorized
reads and the same deterministic compilers and invariants as the live path. It remains
non-authoritative through deny-by-construction effect ports: it cannot create a
Field Account occurrence, entry, balance/control projection, Opening Position,
reservation, obligation, D17 cutover, D11 close, statement, communication,
notification, Accounting Release, payroll/AP or reimbursement handoff,
provider write, or external feed. Its private evidence is bounded, chunked,
resumable, fixed to one captured generation, PII-minimized, and subject to D26
and Phase 29 handling.

A financial activation cohort is the complete D17 census for one Tenant,
Legal Entity, and ISO currency. It includes every in-scope Support Assignment,
source family, split, correction, reallocation pair, reservation, obligation,
and source/currency-conserving atomic group. A random percentage, selected-row,
or named-worker canary is forbidden. A named missionary pilot changes only the
separate D9 publication audience through exact D19 participant membership and
current Phase 12 authorization; it never selects financial rows or creates a
second balance model.

### Separate authority and health axes

The staff surface keeps these truths independent:

- D17 Field Account authority and exact boundary;
- first and later D11 close/integrity proof and any cause-owned containment;
- D9 workspace and D12 statement publication;
- Phase 12 request-time access and D19 participant membership;
- Phase 20 accounting-package, direct-delivery, readback, and reconciliation
  evidence;
- D7/D15 compensation and reimbursement handoff operations;
- D8/Phase 31 external feed state;
- Phase 6/17 notification eligibility and delivery; and
- external accounting, payroll/AP, reimbursement-payment, bank, and provider
  outcomes.

`Active` therefore never implies closed, published, delivered, posted,
reconciled, payroll-complete, payable, or paid. A failed optional capability
cannot mark Core Field Accounts inactive or block an unrelated capability.

### Quiet setup and activation experience

One resumable **Mission Control → Finance → Field Accounts → Set up** workspace
extends D17's **Start Field Accounts** path. It is not a second wizard and has
four calm sections:

1. **Your setup** — Legal Entity, ISO currency, complete source/cohort scope,
   finance owner, quiet core defaults, and only tenant-selected optional
   capabilities;
2. **Checks** — applicable evidence grouped as **Asym checks automatically**,
   **Your organization**, or **Qualified review**, with healthy proof collapsed
   and each exception showing cause, scope, user impact, owner, last successful
   proof, and one next safe action;
3. **Try and compare** — an unmistakably synthetic demonstration followed by a
   separately labelled, production-authorized, read-only complete-cohort shadow
   with explicit zero-side-effect copy; and
4. **Review and start** — one accessible check-answers consequence review of
   exact boundary, scope, visibility, executable operations, limitations,
   containment, and responsible people, followed by a literal action such as
   **Start USD Field Accounts on 31 August 2026**.

The guided starting configuration is one Legal Entity, one currency, ordinary
support sources, the D3 zero-assessment default unless changed prospectively,
and no advanced capability or publication lane unless selected. Unselected
capabilities are absent or **Not used**, not blockers. Staff do not receive a
percentage-complete score, repeated attestations, `Mark complete`, force-pass,
or a monthly readiness ceremony.

After cutover, the finance surface reports only the exact fact, for example
**Recording USD Field Account activity since 31 August 2026; first Support
Cycle verification is in progress**. D9 alone determines whether the D17
Finance-confirmed opening position may be published, and D12 governs
closed-cycle statement publication. First-D11-close verification remains an
independent, through-dated finance fact; it neither grants nor revokes
publication. An
authorized pilot sees the ordinary production projection, a quiet **Pilot**
label, and an exact through-date—not release generations, manifests, source
cursors, control totals, provider diagnostics, availability, withdrawability,
payroll, payable, or payment claims.

Adding an optional capability later creates a prospective Adoption Plan
successor for that bounded item, proves only its dependencies and consequence,
and selects an exact future boundary. It neither reopens core activation nor
recomputes prior Field Account history.

### Existing D26 records-family resolution

D27 creates no seventh Phase 21 records family. Durable Release Generation,
Adoption Plan, Go-Live Readiness Manifest, consequence-review,
activation-operation, and containment evidence resolve under D26's existing
authorization/audit/evidence family. Replaceable D17 shadow working data and
diagnostics resolve under D26's transient staging/preview/diagnostic family;
any sealed proof referenced by a readiness manifest is durable audit evidence.
D27 containment preserves currently authorized D26 records access and custody
export unless an independently authoritative legal or security restriction
forbids that access.

### Tenant isolation, scale, accessibility, and recovery proof

Every durable row and operation is structurally keyed by Tenant plus all
applicable Legal Entity, ISO currency, cohort/census, purpose, Support
Assignment, Field Account, source family, environment, release, plan, manifest,
authorization epoch, provider organization, and operation dimensions.
Same-tenant composite foreign keys, closed sets, unique coverage, integer minor
units, `ENABLE` and `FORCE ROW LEVEL SECURITY`, and Phase 12 PDP checks before
enumeration and again at consequential commit are required. Service-role and
`BYPASSRLS` work accepts one explicit tenant/scope and reuses the same policy
decision; it never materializes a cross-tenant readiness cache and filters
later.

Preparation and shadow work are cursor-resumable, set-based, fixed-generation,
tenant-fair, bounded in memory and transaction duration, and tested for large
cohorts, hot control accounts, multiple currencies, month-end concurrency,
slow providers, and first-close cadence. Only D17's final authority fence is a
short transaction.

The setup and exception experience must meet WCAG 2.2 AA and Core's stronger
interaction baseline: keyboard and screen-reader completion, text rather than
color-only state, visible unobscured focus, linked error summary and inline
errors, polite asynchronous status without focus theft, 320-pixel reflow,
200%/400% zoom, touch, reduced motion, localization, slow-network resume,
stale-review recovery, and accessible evidence download. Automated axe proof
alone is insufficient.

### Cause-owned containment, never rollback

Before D17, stale or incomplete proof makes no financial change. After D17,
there is no **Undo launch** or generic mutable `paused` fact. Current owner
decisions constrain affected effect ports:

- stop only new affected positive/discretionary admission, publication,
  invitation, or executable delivery at the smallest proved scope;
- preserve immutable history, current authorized reads, D26 records access and
  custody export, established reimbursement and compensation obligations,
  artifact/manual continuity, and source-owned repair;
- continue mandatory refunds, chargebacks, adverse corrections, reversals,
  claimant responses, payment-evidence ingestion, and integrity evidence;
- preserve already-posted provider evidence and use exact readback for an
  ambiguous remote outcome; and
- reactivate only through a prospective owner successor after current proof.

A platform-wide emergency switch is permitted only for a proved shared-system
hazard. It may cap execution but grants no tenant authority and cannot clear an
owner case or automatically resume a tenant capability.

### Adversarial disposition

The complete D27 ruthless review in the Phase 21 research evidence is binding.
Every requested category has a concern: brittleness, technical debt, edge
cases, footguns, tenant safety, over-engineering, UX/UI friction, hidden
coupling, failure modes, data integrity, security/privacy, scalability/
performance, operational burden, observability, dependency/integration risk,
migration/upgrade risk, and other development hazards.

The permanent controls are sole D17/D11 authorities; three immutable records
plus one derived projection; complete cohorts and atomic groups; distinct proof
classes; side-effect-dark ports; exact structural scope, forced RLS and Phase
12 reauthorization; content digests and source-specific freshness; final CAS
and semantic idempotency; inspect-before-retry; independent optional bindings;
quiet exception-first UX; production-shaped capacity and recovery proof; and
smallest-scope prospective containment with mandatory adverse continuity.

### Required production proof

1. Synthetic and production-shadow paths are visibly, semantically, and
   technically distinct, and negative tests prove zero financial, document,
   communication, accounting, provider, payroll/AP, reimbursement, or feed
   effects.
2. Every source fact and atomic group in the complete activation census has one
   exact disposition; per-currency account and control positions reconcile,
   and unresolved mandatory coverage blocks the affected cohort.
3. Two activators, permission revocation, governance-epoch change, source or
   policy drift, release/schema change, provider revocation, boundary change,
   duplicate submit, worker crash, and lost client response yield exactly one
   inspectable D17 outcome.
4. D17 authority, first D11 close, balance/control rebuild, D9/D12 preview,
   selected D20/D7/D15 handoff, and provider readback remain independently
   correct without transferring authority.
5. Tenant, Legal Entity, currency, cohort, purpose, assignment, participant,
   source, plan, manifest, evidence, provider, cache, queue, audit, export,
   support-tooling, service-role, and prepared-statement substitutions fail
   before enumeration and again at commit.
6. Production-shaped load proves bounded shadow and first-close completion,
   tenant fairness, hot-account behavior, short final fencing, slow/failed
   providers, and resumable evidence access.
7. Protective-containment tests prove only named future positive behavior
   stops while authorized history/records, obligations, mandatory adverse
   corrections, artifacts, and exact recovery remain available.
8. Database and private-storage restore, queues, manifests, policies, provider
   evidence, authorization/suppression epochs, and overlap/gap monitoring
   invalidate stale unconsumed readiness without replaying committed truth.
9. Representative small and complex mission staff can identify exact scope,
   owner, consequence, what remains off, and the safe response without a
   spreadsheet or facilitator; the complete accessibility matrix passes.
10. Copy tests prohibit `available`, `withdraw`, `all clear`, `rollback`,
    `ready for payroll`, and downstream-success language unless that exact
    independent owner proves it.

### Evidence

- [D27 research, selected-option review, and ratification](./phase-21-mission-dashboard-product-research-evidence.md#d27-selected-option-adversarial-review---evidence-gated-core-field-accounts-activation)
- [ADR-0088 — Evidence-gated Core Field Accounts production activation](../../adr/0088-evidence-gated-core-field-accounts-production-activation.md)
- [ADR-0078 — Reconciled Field Account opening position and operational cutover](../../adr/0078-reconciled-field-account-opening-position-and-operational-cutover.md)
- [ADR-0072 — Layered Field Account integrity and cause-owned repair](../../adr/0072-layered-field-account-integrity-and-cause-owned-repair.md)
- [Phase 12 permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 20 accounting boundary](./phase-20-accounting-exports-reconciliation.md)
- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Remaining founder decisions

D27 closes the Phase 21 core-production-activation, optional-capability binding,
production-shadow, financial-versus-publication pilot, go-live consequence,
current-readiness, and post-start containment seam without reopening D1-D26 or
making readiness, a feature flag, Mission Control task, provider sandbox,
OAuth connection, accounting delivery, payroll completion, reconciliation, or
payment into Field Account authority. The next material founder seam will be
selected from the post-D27 completeness audit and presented one decision at a
time.

## D28 — Opening cumulative Travel Allowance state and continuing source coverage

### Decision

**Founder ruling:** ratified on 2026-08-02.

Phase 21 adopts:

> **C-prime-amended-and-hardened (C-prime-R) — source-defined clean-period
> native activation by default, with proof-gated immutable Travel Allowance
> Opening Cumulative State and prospective source-completeness admission for
> every exact D18 cumulative pool or indivisible source-defined group before
> native first use:** each admission preserves the exact source-defined
> accumulator semantics, stable Capacity Key Contract and explicit pool
> succession, policy period, ordering fact, unit, aggregation scope,
> relationship evidence, timezone, half-open D13/D18 authority boundary,
> epistemic class, and complete predecessor and prospective coverage; uses
> exhaustive clean-boundary-zero, opening-state, or external opening disposition
> plus Asym-complete, certified-feed-complete, or external continuity disposition
> for the complete initial census and every later key; treats proved zero as
> affirmative and missing as never zero; accepts source-valid above-threshold
> state without confusing a band with a cap; and assigns in-flight and late
> predecessor facts once through append-only correction and affected-suffix
> review. Native admission is source-group-atomic, CAS-guarded with first
> allocation, semantically idempotent, finally reauthorized, and contained at
> the smallest affected positive scope; a clean reset alone never waives
> continuing facts outside Asym, and uncertain, externally changing, or
> unsupported pools remain fully usable through D18's exact external-
> calculation lane until a later boundary where both opening and continuing
> completeness are proved. D27 may reference current admission evidence for
> initial or later optional-capability readiness but never owns or recreates it,
> never gates already-safe Core Field Accounts, and never reopens D17. Finance
> receives one quiet dated three-choice setup, source-specific language, system-
> generated small or Phase-30 bulk preparation, exception-first consequence
> review, and one literal start action; missionaries receive no setup noise and
> only a privacy-minimized on-demand explanation. No opening or continuity fact
> fabricates history or creates claim, approval, Field Account money or
> availability, obligation, handoff, provider, reimbursement, payment,
> payroll/tax, statement, accounting, posting, or reconciliation truth —
> without a mutable counter, universal employee/year key, implicit jurisdiction
> or unit, odometer or amount inference, partial/backdated activation, whole-
> history replay, cross-group splitting, periodic manual reseeding, reliance on
> RLS against a bypass role, missionary migration UI, silent recalculation,
> destructive correction, blind retry, or false legal, tax, payment, or
> accounting assurance.\*\*

### Exact cumulative admission

D28 extends D18 rather than creating a second travel, migration, policy, or
financial subsystem. Native cumulative calculation requires two independently
proved axes for one source-defined authority interval:

1. an opening disposition of `clean_boundary_zero`,
   `opening_cumulative_state`, or `external_at_boundary`; and
2. a continuity disposition of `asym_source_complete`,
   `authoritative_feed_complete`, or `external_calculation`.

A clean boundary proves only the opening zero. It never proves that facts which
can continue outside Asym — including source-required private travel, other
vehicles, associated employments, or another indivisible group member — will be
complete prospectively. A pool enters native calculation only when both axes
are proved. External calculation is a complete ordinary D10/D18 path, not an
error, setup failure, or degraded claim.

The source package defines the accumulated qualifying state, ordering fact,
period and reset, exact unit, aggregation scope, band-versus-cap meaning,
restoration semantics, allowed evidence class or estimate, and continuing-
coverage requirement. `Distance already reimbursed`, `claimant × year`, and
`odometer` are not universal semantics.

### Stable pools, complete coverage, and correction

One immutable **Travel Allowance Capacity Key Contract** defines the exact
source-owned cumulative pool or indivisible group and its succession. Profile,
source-package, relationship, vehicle-record, or evaluator version churn is
provenance and cannot silently reset consumption. A successor explicitly says
`continue_existing_pool` or `new_pool`.

One content-addressed **Travel Allowance Cumulative Admission Manifest** gives
every current eligible pool or indivisible group exactly one opening and one
continuity disposition. Later-arriving claimants, vehicles, relationships,
entities, source revisions, or groups receive the same proof before their first
native use. Missing is never zero, a source-valid quantity above a rate
threshold is not rejected as though the threshold were a cap, and conflicting
evidence is never averaged, maximized, or silently combined.

The admission and first D18 cumulative allocation share one group-level head
CAS with semantic idempotency, final authorization and revocation reproof, and
inspect-before-retry recovery. In-flight predecessor facts receive one exact
owner. A later pre-boundary discovery appends an Opening Cumulative State
correction and recomputes only the affected suffix or indivisible group; it
never edits history or automatically creates repayment, obligation, payment,
payroll, tax, accounting, or Field Account consequences.

Loss of continuing completeness contains only affected new positive native
calculation. Existing history, mandatory adverse correction, and the ordinary
external-calculation claim path continue. D27 may reference current D28 proof
for an optional capability but cannot create, waive, or reinterpret it, gate
safe Core Field Accounts, or reopen D17.

### Quiet experience and authority

Finance sees the setup only for a genuinely cumulative D18 method:

- **Next complete policy period — recommended**;
- **This period using earlier activity**; or
- **Keep this calculation outside Asym**.

Asym generates the current census and source-required labels. Healthy scope is
collapsed into **Native now**, **Scheduled at a proved boundary**, or
**Calculated outside Asym**. Exceptions name one cause, owner, consequence,
and next safe action. Small cohorts use accessible row cards; Phase 30 may
provide private chunked bulk mechanics without owning meaning or activation.
There is no force-complete action, generic compliance score, periodic manual
reseeding ceremony, or missionary migration UI.

Missionaries retain the same D10 expense flow in native and external modes.
An optional calculation explanation may show the source, through-period,
earlier source-defined quantity, current quantity, threshold split or cap,
rate, and unit, but never private group-member facts or downstream authority.

Phase 12 separately grants preparation, evidence access, admission, correction,
and audit/export powers. Every command derives scope server-side and rechecks
authorization at consequential commit. Same-scope composite constraints and a
least-privilege non-`BYPASSRLS` command role are preferred; any unavoidable
service-role path must still pass the Phase 12 policy decision and explicit
bypass-path tenant-isolation tests.

### Evidence and remaining founder decisions

- [D28 official research, full adversarial review, and ratification](./phase-21-mission-dashboard-product-research-evidence.md#d28-selected-option-adversarial-review-opening-cumulative-travel-allowance-state-and-continuity)
- [ADR-0079 — Certified policy-pinned Travel Allowance calculations](../../adr/0079-certified-policy-pinned-travel-allowance-calculations.md)
- [ADR-0089 — Proof-gated opening cumulative Travel Allowance admission](../../adr/0089-proof-gated-opening-cumulative-travel-allowance-admission.md)
- [Phase 12 permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 20 accounting-ready expense boundary](./phase-20-accounting-ready-expense-handoff-research-evidence.md)

D28 closes the opening-before-state, prospective-completeness, stable capacity-
pool identity, first-use fencing, later-key admission, late-predecessor, and
native-versus-external continuity seam without reopening D1-D27. Any further
founder decision must come from a bounded completeness audit and must not turn
implementation, source certification, fixtures, or release proof into product
scope.

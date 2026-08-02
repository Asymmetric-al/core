# File-first organization-card transaction evidence

**Status:** Accepted (founder ruling, Phase 21 grill session — D14)

## Context

Phase 21 D10 and D13 establish a complete manual, claim-level expense path with
private Receipt Evidence, human approval, and independently authoritative
obligation, Field Account, payment, accounting, and reconciliation truth.
Organization-card source evidence can reduce claimant re-entry and missing
receipts, but issuer and aggregator feeds have materially different identities,
cardholder coverage, pending/final lifecycles, commercial access, countries,
and failure behavior. Launching several live adapters would multiply
certification and operational burden before tenant demand proves which card
programs matter. Treating PDF/OCR or fuzzy matching as financial authority would
instead create silent duplicates, wrong assignments, and false downstream
status.

## Decision

Phase 21 launches one optional, tenant-off-by-default, organization-card-only
Card Transaction Evidence product. D10's complete manual Expense Claim path
always remains available. “Statement/file-first” remains the ratified option
label; product UI says **Upload card activity** and **Organization card
activity file**. The launch source lane accepts only machine-readable CSV
through an immutable Tenant-, Legal-Entity-, Organization-Card-Source-,
billing-currency-, and Organization Card Import Profile Version-scoped
contract. PDF statements may be restricted supporting evidence but never
financial truth; XLS/XLSX, OCR, AI extraction, images, and free-form rows
cannot create Card Transaction Evidence.

Every staged file becomes one immutable Organization Card Activity Import
Manifest only
after a classified consequence preview. Exact file and source-occurrence
repeats are idempotent no-ops. Similar merchant, card, date, or amount can raise
only a Possible overlap; it cannot merge, consume, delete, approve, or suppress
a distinct occurrence. Structural defects block the manifest. Row-local
defects remain manifest-backed exceptions while structurally safe new rows
advance in the same atomic acceptance. Accepted evidence is never destructively
undone; source changes and wrong assignments append scoped successors, while
refunds, disputes, reversals, fees, source removals, and corrections append
typed Organization Card Source Adjustment Evidence.

Organization Card Activity File Assets use Phase 29's private byte, malware,
access, retention, hold, quarantine, and disposition mechanics while Phase 21
owns purpose, source/profile linkage, manifest provenance, and financial
meaning. This recurring operational source lane is not Phase 30's general
migration importer, and Phase 30 cannot reinterpret, deduplicate, undo, or
bypass its accepted evidence.

Organization Card Transaction Evidence Version is separate from Expense Claim
Version, Organization Card Assignment Version, Organization Card Evidence
Coverage, Receipt Evidence, Expense Policy Decision, Approved Expense Snapshot,
Reimbursement Obligation, Field Account Funding Coverage, personal repayment,
external payment, Phase 20 Accounting Release, issuer settlement,
card-liability payment, and QBO/Xero reconciliation. Only purchases reported as
posted under the pinned Organization Card Import Profile Version's finality
contract create claimant work. A nonbusiness/personal portion is
classification, not repayment, and every purchase conserves its exact issuer
billing currency through business, nonbusiness/personal, and unresolved
portions.

The ordinary claimant experience is a quiet camera-first task over a read-only
posted charge. Finance starts in a cause-grouped Needs attention view; healthy
rows do not create work. Card assignments are explicit and effective-dated,
and an unassigned, shared, or disputed card exposes no row to a claimant.
Ordinary facts store only opaque card identifiers and masked display metadata.
An upload containing unmasked PAN, CVV/CVC, PIN or track data, or credentials
fails acceptance, is quarantined, and follows bounded secure disposal and
incident handling. Personal-card batch browsing, pending-as-final evidence,
automatic approval or reimbursement, direct QBO/Xero posting, and false paid,
settled, available, synced, or reconciled status are prohibited.

Future live issuer or aggregator adapters may reuse the evidence contract only
after exact provider, country, account, cardholder, lifecycle, scope, and
production behavior is separately certified. Phase 20 remains the only
accounting doorway, and QBO/Xero retains final accounting and reconciliation
authority.

## Consequences

- Tenants without organization-card evidence receive no setup burden or UI
  noise.
- Recurring file use becomes upload, classified review, and import after one
  source mapping and effective card-assignment setup.
- Historical source evidence stays reproducible across file, layout,
  assignment, parser, and schema changes.
- The product gains useful expense-completion assistance without becoming a
  card issuer, bank feed, repayment engine, accounting system, or generic
  importer.
- Production release requires parser, idempotency, overlap, conservation,
  assignment, tenant-isolation, security, load, failure-injection,
  accessibility, and representative-user proof from the Phase 21 decision log.

## Rejected alternatives

- manual claims only with no organization-card evidence seam;
- several live issuer or aggregator adapters at launch;
- personal-card statement browsing by tenant staff;
- PDF, OCR, AI, XLS/XLSX, or free-form import as financial truth;
- heuristic auto-deduplication or destructive import rollback;
- one mutable card row that collapses source, claim, approval, payment,
  accounting, issuer settlement, and reconciliation state;
- direct Phase 21 accounting delivery or card-liability reconciliation.

## Related decisions

- [ADR-0059 — Accounting-ready expense handoff](./0059-accounting-ready-expense-handoff.md)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant AI](./0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0074 — Bounded prospective Expense Governance Profiles](./0074-bounded-prospective-expense-governance-profiles.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)

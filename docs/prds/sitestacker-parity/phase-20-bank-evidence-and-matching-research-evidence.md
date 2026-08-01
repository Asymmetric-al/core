# Phase 20 Bank Evidence and Matching — Research Evidence

**Research date:** 2026-07-26
**Purpose:** Evidence for the next Phase 20 `/grill-with-docs` decision after
D9. This note does not ratify a decision and is not an implementation
specification.

## Executive conclusion

Phase 20 needs a **Bank Match**, but that match is an informational evidence
workflow only. It does not reconcile a bank account. Final bank reconciliation
always belongs to the tenant's QuickBooks Online or Xero books, where finance
compares the accounting register with the bank statement and closes the
period. Asym does not need to become a bank-feed, cash-management, or
general-ledger product.

The cleanest current direction is one bounded, source-labelled bank-evidence
contract that can support:

1. a posted bank transaction imported from a statement;
2. an optional read-only bank-data connection only after a separate
   capability and security gate; or
3. a staff confirmation that records exactly what was checked and where,
   without pretending that Asym independently observed the bank.

All three lanes produce the same small evidence shape. The lane and evidence
strength remain visible forever. Matching is an append-only informational
allocation between bank evidence and a Phase 20 **Expected Bank Arrival**
derived from either a Stripe **Processor Payout Transfer** or a Phase 15
**Deposit Group**.

The system may automatically evidence-link only a unique, exact, posted match
that passes all hard identity and conservation rules.
Amount/date/description similarity produces a **candidate**, never proof.
Ambiguity, partial settlement, aggregation, splitting, pending-to-posted
replacement, removal, and later mutation remain visible and recoverable. Even
an exact Asym Bank Match means only that the expected arrival is supported by
the recorded bank evidence; it does not mean the bank account is reconciled.

QuickBooks Online and Xero remain authoritative for their own bank-feed
matching and statement reconciliation. Asym may say:

- `Matched to bank evidence`;
- `Staff confirmed in the bank`;
- `Ready to reconcile in QuickBooks`;
- `Ready to reconcile in Xero`; or
- `Provider reconciliation verified` only when a separate provider-owned
  readback contract can prove that exact fact.

It must not collapse those statements into a generic `reconciled`.

### Focused current-source verification

A focused recheck on 2026-07-26 strengthened this conclusion:

- Intuit's current matching documentation says downloaded bank transactions do
  not affect the books until staff match or categorize them, and matching links
  the line to an existing QuickBooks record. Intuit separately defines
  reconciliation as comparing QuickBooks against the real bank statement for a
  period until the difference is zero.
- Xero likewise treats matching an imported statement line to an accounting
  transaction as part of its own bank-reconciliation workflow and separately
  supports period reconciliation and close.
- Plaid continues to document bank transaction observations as added, modified,
  and removed cursor updates; pending-to-posted replacement and later
  transaction churn remain possible.
- Stripe Trace IDs remain location and investigation evidence, not a
  bank-posting or accounting-reconciliation assertion.

No reviewed source supports allowing an Asym-side match to represent final QBO
or Xero reconciliation. This remains true whether evidence came from an
upload, a direct read-only connection, or staff review.

## Existing Asym authorities

This recommendation follows, rather than replaces, the existing contracts.

### Phase 15

ADR-0007 makes a Deposit Group an operational grouping, not bank truth:

- gifts link to one current Deposit Group at gift grain;
- assignments remain editable and append-only audited until Phase 20 export;
- the retained deposit slip is an immutable snapshot;
- grouping moves no money;
- Stripe-rail gifts are structurally excluded; and
- Phase 20 owns the bank-statement tie-out and GL handoff.

The Phase 15 PRD also permits deposit-before-entry, entry-before-deposit,
same-day, delayed, one-to-one, many-to-one, and one-to-many operational
workflows. Bank matching therefore cannot assume that a gift-entry batch,
Deposit Group, slip, or bank line is always one-to-one with another.

### Phase 20 D1–D9

- D1 keeps contributions, processor settlements, Bank Matches, expenses,
  Accounting Releases, and provider records separate.
- D2 keeps the Accounting Release, delivery operation, external provider
  record, provider readback, and reconciliation verdict separate.
- D3 requires exact Tenant, Legal Entity, destination, account, environment,
  currency, and effective binding scope.
- D4 requires a canonical balanced effect and complete source coverage.
- D5 assigns one accounting posting owner per economic event.
- D7 and D8 preserve QBO/Xero-native reconciliation truth and forbid claiming
  that object creation or readback proves bank reconciliation.
- D9 explicitly separates processor composition, source coverage, Processor
  Payout Transfer state, Bank Match, and accounting handoff.

No current runtime code implements Deposit Groups, bank evidence, or Bank
Matches. The Phase 13 and Phase 15 models are groomed-not-built, so Phase 20
should establish the clean contract without a legacy compatibility layer.

## What current official products establish

### Stripe: payout evidence helps locate a transfer but is not bank posting

Stripe's Payout object supplies an expected `arrival_date`, destination,
currency, amount, payout lifecycle, statement descriptor, and—where
supported—a bank-partner-created Trace ID. Stripe describes the Trace ID as a
unique identifier that can help the bank locate a late or missing payout.
Trace IDs can remain pending for up to ten days and can be unsupported for
some country/currency/mode combinations.

This makes a supported Trace ID excellent matching evidence, but it does not
turn `payout.paid` into proof that the bank posted the line. Stripe tells users
to contact the bank with the Trace ID when a payout has not arrived.

Stripe also warns that beneficiary banks may override or omit payout statement
descriptors. A descriptor is therefore useful candidate evidence, not a stable
identity.

Sources:

- [Stripe Payout Trace IDs](https://docs.stripe.com/payouts/trace-id)
- [Stripe Payout object](https://docs.stripe.com/api/payouts/object)
- [Stripe payout statement descriptors](https://docs.stripe.com/payouts/statement-descriptors)
- [Stripe payout reconciliation report fields](https://docs.stripe.com/reports/report-types/payout-reconciliation)

### QuickBooks Online: suggestion, matching, and monthly reconciliation differ

QuickBooks downloads posted bank transactions, suggests matches to existing
records, and requires the user to review whether a suggestion is correct.
Intuit states that suggested matches use the same amount and a similar date
range. If the suggestion is wrong, the user can find another match. Matching
links the bank line to the already-entered record so it is not duplicated.

This establishes three useful principles:

1. only posted bank evidence should be final;
2. an algorithmic suggestion is not confirmation; and
3. transaction matching is distinct from later account reconciliation.

It also reinforces the clearing-account pattern: payments can first sit in
Undeposited Funds, then be grouped into the actual bank deposit.

Sources:

- [QuickBooks Online: Match transactions](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/match-transactions-quickbooks-online/L0MF3Fn6y_US_en_US)
- [QuickBooks Online: Match online bank transactions](https://quickbooks.intuit.com/learn-support/en-ie/help-article/bank-feeds/match-online-bank-transactions-quickbooks-online/L6qyw0PvP_IE_en_IE)
- [QuickBooks Online: Record and make bank deposits](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)
- [QuickBooks Online: What reconciliation means](https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/reconciliation/L8d7WuSfl_US_en_US)

### Xero: statement line, accounting transaction, and reconciliation are separate

Xero defines bank reconciliation as matching an imported bank statement line
against a transaction already recorded in Xero. It may suggest the most likely
transaction, but staff can inspect alternatives or use Find & Match. Xero
supports one statement line matched to multiple transactions and multiple
batches matched to one statement line.

Xero also warns that manually marking a transaction reconciled creates a new
statement line. If the real line later arrives, it can create a duplicate and
cause the bank balance to disagree. That is direct evidence against Asym
manufacturing a bank line or treating staff confirmation as feed-observed
evidence.

The period-close workflow separately compares opening and closing statement
balances with recorded payments and deposits. This is final accounting-system
reconciliation, not the same as an Asym source-to-bank match.

Sources:

- [Xero: Bank reconciliation](https://central.xero.com/s/article/Bank-reconciliation-in-Xero)
- [Xero: Reconcile a bank account](https://central.xero.com/s/article/Reconcile-your-bank-account)
- [Xero: Find transactions to match](https://central.xero.com/s/article/Reconcile-a-bank-statement-line-using-Find-Match)
- [Xero: Reconcile a batch payment or deposit](https://central.xero.com/s/article/Reconcile-a-batch-payment-or-batch-deposit)
- [Xero: Manually mark a transaction reconciled](https://central.xero.com/s/article/Reconcile-an-account-transaction-without-an-imported-bank-statement)
- [Xero: Reconcile and close a period](https://central.xero.com/s/article/Reconcile-a-period)

### Plaid: bank transaction data is incremental and mutable

Plaid recommends `/transactions/sync` for new integrations. Integrators must
persist cursors, paginate until `has_more=false`, restart from the original
cursor if the underlying data mutates during pagination, and apply added,
modified, and removed updates.

Pending and posted transactions are not the same immutable record. A posted
transaction normally replaces a pending transaction; the amount, name, and
date can change, the matching identifier can be absent, and a pending item can
disappear without posting. Even a posted transaction can later be modified or
removed.

Therefore:

- pending observations can create candidates but cannot confirm Bank Matches;
- a feed identifier needs institution/account scope;
- later modification or removal must create successor evidence and conflict
  any affected confirmed match; and
- direct bank data requires durable cursor, backfill, reconnection, duplicate
  Item, and institution-coverage operations.

Those requirements make a bank connection a separately certified optional
evidence lane, not a casual dependency for every tenant.

Sources:

- [Plaid Transactions integration](https://plaid.com/docs/transactions/)
- [Plaid transaction states](https://plaid.com/docs/transactions/transactions-data/)
- [Plaid Transactions API](https://plaid.com/docs/api/products/transactions/)
- [Plaid Transactions troubleshooting](https://plaid.com/docs/transactions/troubleshooting/)

### Modern Treasury: exact rules first; ambiguity goes to review

Modern Treasury models an expected payment separately from the observed bank
transaction. It automatically reconciles only when all configured conditions
match. When several expected payments match one transaction, it does not
choose arbitrarily; the case becomes a manual-reconciliation exception.

Its manual view places transactions and expected payments side by side and
shows the remaining difference. It supports one transaction to many expected
payments and partial reconciliation. Its guidance recommends prioritizing
specific identifiers over broader amount/date rules.

Asym should adopt the bounded principles—not Modern Treasury's general rules
DSL:

- expected and observed money are separate;
- exact identifiers outrank amount/date;
- ambiguity blocks automatic evidence linking;
- allocations expose their remaining difference; and
- manual resolution is explicit and audited.

Sources:

- [Modern Treasury: Reconciling received payments](https://docs.moderntreasury.com/payments/docs/managing-externally-originated-payments)
- [Modern Treasury: Defining Reconciliation Rules](https://docs.moderntreasury.com/payments/docs/defining-reconciliation-rules)
- [Modern Treasury: Manual reconciliation](https://docs.moderntreasury.com/payments/docs/exception-handling-manual-reconciliation)
- [Modern Treasury: Expected Payments](https://docs.moderntreasury.com/platform/reference/expected-payment-object)

## Options for the next grill decision

### Option A — Staff attestation only

Staff open the bank or accounting product, then record the posted date, amount,
reference, and confirmation in Asym.

**Advantages**

- smallest integration and security surface;
- works for every bank and tenant;
- does not duplicate QBO/Xero bank feeds; and
- handles paper statements and unusual institutions.

**Weaknesses**

- relies on manual accuracy;
- does not independently prove the observed bank line;
- becomes repetitive at volume; and
- offers weaker automatic detection of late, missing, or duplicate deposits.

This is a truthful and sufficient baseline lane because final reconciliation
still happens in QBO or Xero. It is weaker for timely operational alerts and
high-volume convenience, not for Asym's accounting authority.

### Option B — Mandatory direct bank feed

Every tenant connects settlement bank accounts through an aggregator and Asym
automatically matches deposits.

**Advantages**

- lower routine data entry;
- supports timely missing-deposit alerts; and
- can provide independent posted transaction evidence.

**Weaknesses**

- institution coverage, OAuth, MFA, consent, credential, duplicate-connection,
  cursor, mutable-transaction, and support burden;
- duplicates bank feeds that tenants already operate in QBO or Xero;
- turns Phase 20 into a substantial bank-data product;
- direct feeds can be delayed and are not universal; and
- creates unnecessary PII and account-data exposure.

This is disproportionate and brittle as a universal Phase 20 requirement. A
connection materially helps only with convenience at sufficient volume:
reducing rekeying, surfacing posted lines sooner, and detecting missing
arrivals. It does not strengthen Asym into final reconciliation, eliminate
QBO/Xero work, guarantee real-time evidence, or remove staff review of
ambiguous matches.

### Option C-prime — One bounded Bank Match with source-labelled proof lanes

Use one contract and one workspace while allowing the tenant to provide the
strongest practical evidence:

- explicit staff confirmation from the bank or bank statement as the universal
  baseline;
- imported posted statement line when the tenant wants less rekeying; or
- optionally connected read-only posted transaction only after certification
  and demonstrated tenant volume.

The system suggests candidates using a fixed, product-owned matcher. Exact
unique matches can confirm automatically only under strict proof. Everything
else is reviewed in one compact side-by-side surface.

**Advantages**

- supports every tenant without forcing another connection;
- allows later automation without changing the domain model;
- clearly distinguishes independent evidence from staff attestation;
- handles Stripe and offline deposits through one truthful contract;
- avoids a tenant-authored matching DSL; and
- leaves final bank reconciliation in QBO/Xero.

**Weaknesses**

- requires disciplined evidence-tier presentation;
- statement import still needs secure parsing and deduplication;
- optional bank connectivity remains a material later certification; and
- allocation support must be bounded carefully to avoid becoming a generic
  reconciliation engine.

**Recommendation:** Option C-prime, with staff confirmation and statement
evidence as the complete baseline. Direct bank connectivity is optional
acceleration, not a Phase 20 authority, prerequisite, or promised launch
dependency. It should activate only after a tenant explicitly opts in and the
adapter passes its separate security, coverage, mutation, and operational
readiness gates.

## Recommended contract

### Expected Bank Arrival

An **Expected Bank Arrival** is a derived, immutable expectation for one:

- Stripe Processor Payout Transfer; or
- Phase 15 Deposit Group frozen at the Phase 20 accounting-release boundary.

It records:

- Tenant and Legal Entity;
- destination Bank Account Binding;
- origin type and stable origin identity;
- expected direction, integer-minor-unit amount, and currency;
- expected arrival or deposit-date window;
- safe descriptor, trace, slip, or deposit references available from the
  source;
- source snapshot or digest;
- current source lifecycle; and
- successor lineage.

It is not a receivable, gift, bank transaction, journal entry, or promise that
the bank will post the money.

### Bank Evidence Observation

A **Bank Evidence Observation** is an append-only observation of a transaction
or staff verification from one declared source lane:

- `statement_import`;
- `read_only_connection`; or
- `staff_attestation`.

Every observation records:

- exact Tenant, Legal Entity, Bank Account Binding, source lane, and source
  connection or import identity;
- source-native account and transaction identity where one exists;
- posted or pending state;
- transaction and authorized dates when supplied;
- direction, amount, and currency;
- bank-provided reference, trace, description, and check number when supplied;
- observation time and source data freshness;
- raw evidence digest plus a restricted evidence pointer;
- normalizer and schema version;
- actor, reason, and the evidence actually consulted for staff attestation;
- supersession or removal lineage; and
- retention and access classification.

The normalized ordinary projection is PII-minimized. Raw statement rows,
descriptions, account identifiers, and uploaded files remain purpose-restricted.

### Bank Match Allocation

A **Bank Match Allocation** informationally links an Expected Bank Arrival to a
Bank Evidence Observation for an exact allocated amount in the same currency.
It is evidence that Asym's expected arrival corresponds to the recorded
observation. It is never a bank-register entry, cleared state, period
reconciliation, or provider reconciliation.

The junction supports only the real settlement shapes:

- one expected arrival to one bank line;
- several expected arrivals to one bank line;
- one expected arrival split across several bank lines; and
- partial matching with an explicit residual.

It is not a general transaction-to-transaction rules engine.

Hard invariants:

- all roots share Tenant, Legal Entity, Bank Account Binding, direction, and
  currency;
- allocations use integer minor units;
- allocations cannot exceed either side's still-unmatched amount;
- one evidence-linked allocation cannot be silently consumed by another match;
- a pending observation cannot receive a final evidence-linked allocation;
- every state transition and allocation change is append-only audited;
- removal, mutation, reversal, or source correction produces successor
  evidence and a conflict, never historical rewriting; and
- an evidence-linked Bank Match does not mutate a Deposit Group, Processor Payout
  Transfer, Accounting Release, QBO/Xero record, or provider reconciliation.

### Candidate and evidence-linking policy

Matching uses a fixed product-owned decision table, not tenant-defined rules.

**Automatic evidence linking** requires all of:

- posted bank evidence from a source with stable transaction identity;
- exact Tenant, Legal Entity, Bank Account Binding, direction, and currency;
- exact residual amount conservation;
- one uniquely eligible expected arrival;
- no conflicting or already-consumed allocation;
- a supported exact provider or tenant-controlled reference match where
  available, or another separately certified deterministic signature;
- a bounded source-appropriate date window; and
- current, complete source synchronization.

If an exact identifier is unavailable, amount and date may rank candidates but
should not silently resolve repeated equal deposits. A unique amount/date case
may be presented as `Strong candidate` for one-click evidence linking, not
elevated to independent proof unless production evidence certifies the
false-positive rate and the contract explicitly admits it.

Staff verification records the chosen items, allocation, remaining difference,
actor, time, and reason. It does not edit the source values, reconcile an
account, or claim that Asym independently observed the bank.

### Evidence and status vocabulary

Separate axes remain visible:

1. **Expected arrival** — expected, changed, canceled, reversed, or superseded.
2. **Bank evidence** — unavailable, pending, posted, modified, removed, or
   staff-attested.
3. **Bank Match** — unobserved, candidate, partially evidence-linked,
   evidence-linked, staff-confirmed evidence, conflicted, or superseded.
4. **Accounting handoff** — independently governed by D2–D8.
5. **QBO/Xero reconciliation** — provider-owned and separately evidenced.

Avoid:

- cleared;
- deposited;
- reconciled;
- bank confirmed;
- automatically matched;
- synced;

unless the UI qualifies exactly which authority made that determination.

## Bookkeeper-first UX

The existing settlement and deposit surfaces should share one compact
**Bank evidence** section rather than create a second reconciliation product.

### Normal state

A healthy row says:

- `Linked to posted bank evidence`;
- `Staff confirmed in the bank`; or
- `Ready to reconcile in QuickBooks/Xero`.

It shows the posted date, account-safe label, amount, source badge, and a link
to evidence. A persistent quiet note states `Final reconciliation happens in
QuickBooks/Xero`. It does not ask for approval again.

### Exception-first queue

Only these require routine attention:

- no bank evidence after the expected window;
- several equally plausible candidates;
- split or combined amount requiring allocation;
- amount, account, direction, or currency conflict;
- pending evidence older than its expected window;
- a previously evidence-linked bank transaction changed or disappeared;
- a payout or Deposit Group changed after the expectation froze;
- disconnected or stale evidence source; and
- unmatched remainder.

The repair surface is side-by-side:

```text
Expected arrival                         Bank evidence
Stripe payout / Deposit Group            Posted statement line
Expected date and amount                 Posted date and amount
Trace / deposit reference                Bank reference / description
Still unmatched                          Still unmatched
```

Primary actions are bounded:

- `Link evidence`;
- `Split amount`;
- `Choose another transaction`;
- `Record confirmation from bank`;
- `Refresh evidence`;
- `Resolve source correction`; and
- `Leave unmatched`.

The system always previews the residual and resulting truth before linking.
Bulk linking is allowed only for individually deterministic matches and
shows count, total, account, currency, and evidence lane.

## Adversarial review

### Brittleness — concern: yes, high

**Failure:** treating amount/date/description as identity; relying only on
webhooks; assuming a bank transaction never changes; assuming all banks expose
pending or reference data.

**Permanent prevention:** source-labelled immutable observations, complete
cursor/import proof, posted-only finality, append-only successors, exact-scope
constraints, and ambiguity-to-review.

### Tenant safety — concern: yes, critical

**Failure:** one tenant's bank item, import, connection, or match becomes visible
or allocatable under another tenant, entity, or bank account.

**Permanent prevention:** composite Tenant + Legal Entity + Bank Account Binding
scope on every observation, import, connection, allocation, cursor, cache,
artifact, and idempotency key; FORCE RLS; server-side authorization; negative
cross-scope tests.

### Data integrity — concern: yes, critical

**Failure:** duplicate imports, duplicate linked bank accounts, over-allocation,
currency mixing, pending/posted double counting, or one bank line consumed by
two matches.

**Permanent prevention:** source-native identity plus import digest/row
identity, integer units, bounded allocation conservation, pending-successor
links, compare-and-swap confirmation, and explicit residuals.

### UX and usability — concern: yes, high

**Failure:** staff see three different workflows, raw bank-feed data, false
certainty, or a giant match table that recreates QBO/Xero.

**Permanent prevention:** one Bank evidence card and exception queue, plain
authority-labelled states, progressive evidence disclosure, fixed next actions,
strong defaults, keyboard-complete side-by-side matching, and no routine
approval for clean items.

### Security and privacy — concern: yes, critical

**Failure:** broad bank histories, account numbers, statement files, or
descriptions expose sensitive financial or donor information.

**Permanent prevention:** ingest only bound settlement accounts; minimize the
ordinary projection; encrypt credentials and files; restrict raw evidence;
audit access; redact logs; purpose-owned retention; and avoid bank connectivity
unless the tenant activates it and certification passes.

### Operational burden — concern: yes, high

**Failure:** broken bank connections, mutable feeds, CSV format variation,
duplicate uploads, and ambiguous matches overwhelm tenant staff and support.

**Permanent prevention:** staff-attested fallback always available, idempotent
imports, saved tenant-specific CSV mapping only after a reviewed preview,
cause-coded exceptions, connection-health diagnostics, reprocessing from raw
evidence, and narrow runbooks.

### Over-engineering — concern: yes, high

**Failure:** Asym builds transaction categorization, cash forecasting, a tenant
rule DSL, statement-balance close, arbitrary bank journal creation, or another
QBO/Xero bank feed.

**Permanent prevention:** only expected arrivals, bank observations, bounded
allocations, candidate ranking, evidence capture, and exception recovery.
Explicitly exclude unrelated bank transactions and general reconciliation.
Ship the complete staff-confirmed/imported-evidence workflow without waiting
for a direct bank adapter. Add the adapter only when measured tenant volume
proves that reduced rekeying justifies its security and support surface.

### Failure recovery — concern: yes, high

**Failure:** evidence was linked and the bank line later changes, disappears,
or is reversed; a Deposit Group changes before export; or a timeout occurs
during linking.

**Permanent prevention:** append-only observations and match events,
compare-and-swap finalization, outcome readback, conflicted successor state,
immutable released accounting, and compensating work rather than mutation.

## Production gates

Before any Bank Match reaches production:

- one-to-one, many-to-one, one-to-many, partial, and zero-residual tests;
- duplicate amount/date and ambiguous-candidate tests;
- exact Stripe Trace ID supported, pending, and unsupported fixtures;
- Stripe paid-then-failed and reversed transfer fixtures;
- Phase 15 slip/live-membership divergence and frozen-export fixtures;
- pending-to-posted replacement, changed amount/date/name, removed posted
  transaction, and absent pending link fixtures;
- duplicate bank connection and duplicate statement import tests;
- OFX/QFX/CSV encoding, locale, sign, date, zero-decimal currency, malformed
  row, formula-injection, oversized-file, and zip-bomb defenses if those formats
  ship;
- over-allocation, wrong direction, wrong currency, wrong account, stale
  candidate, and concurrent-confirmation tests;
- negative Tenant, Legal Entity, account, connection, import, artifact, cache,
  queue, and evidence-access tests;
- timeout-after-confirmation and replay tests;
- accounting-release immutability and correction tests;
- high-volume server pagination and tenant-fair processing;
- keyboard, focus, screen-reader, status-text, responsive, and error-summary
  tests; and
- production-shaped usability validation with bookkeepers for clean,
  ambiguous, combined, split, missing, and later-conflicted matches.

An optional direct bank-data connection additionally requires:

- provider security and privacy review;
- tenant consent, connection, revocation, and account-selection UX;
- institution-coverage disclosure;
- durable sync cursor and mutation-during-pagination recovery;
- stale-data and last-successful-update visibility;
- duplicate Item/account detection;
- webhook loss and scheduled completeness recovery;
- reconnect and institution-migration testing;
- retention and deletion validation; and
- a connector-specific kill switch.

## Explicit non-goals

- No general-purpose bank feed.
- No display or categorization of unrelated tenant spending.
- No cash-flow forecasting or treasury management.
- No arbitrary tenant matching-rule builder.
- No general ledger or bank-register replacement.
- No statement-balance close or monthly account reconciliation in Asym.
- No editing a bank-sourced transaction.
- No manufactured bank statement line.
- No fuzzy candidate silently treated as proof.
- No QBO/Xero bank-reconciliation claim from object delivery or readback.
- No final bank reconciliation in Asym, even when evidence is exact or
  directly connected.
- No mandatory Plaid or other aggregator connection.
- No dependency on pending bank data.
- No bank connection required to use accounting exports.
- No one mutable `reconciled`, `cleared`, or `deposited` flag.

## Proposed hardened decision title

**C-prime-amended-and-hardened (C-prime-R) — one informational,
source-labelled, allocation-safe Bank Match connecting immutable Expected Bank
Arrivals to posted bank evidence through a complete staff-confirmed and
statement-evidence baseline plus optional certified read-only acceleration,
with deterministic exact evidence linking, ambiguity-to-review, append-only
correction, and always-QBO/Xero-owned final bank reconciliation.**

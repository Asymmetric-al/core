# Phase 20 Policy-Bounded Compensating Corrections — Research Evidence

**Research date:** 2026-07-26
**Purpose:** Evidence and adversarial review for the Phase 20 decision following
D10. This note does not itself ratify a decision and is not an implementation
specification.

## Executive conclusion

The selected direction is correct if Asym preserves a narrow boundary:

> Asym prepares, releases, links, and observes compensating accounting work.
> QuickBooks Online or Xero owns the books, provider lock state, final posting,
> reconciliation, period close, financial statements, and any conclusion about
> the GAAP treatment of a material prior-period error.

The durable model is an immutable original **Accounting Release** plus a new,
linked **Compensating Accounting Release**. A versioned,
accountant-confirmed tenant policy determines which posting dates Asym may
offer. The provider must still accept the exact operation, and Asym must read
the result back before claiming delivery.

The product must not:

- reopen or rewrite an earlier Accounting Release;
- silently backdate;
- claim that an Asym policy overrides a provider lock;
- automatically decide whether a fact is a GAAP prior-period error;
- change QBO or Xero closing/lock settings;
- delete or void an already delivered provider transaction as routine recovery;
- claim that a current-period compensating entry restates issued financial
  statements; or
- become a period-close, consolidation, or general-ledger system.

This remains first-class integration. “First class” means exact provider-aware
preflight, provider-native operation plans, idempotent delivery, outcome-unknown
recovery, exact readback, drift detection, deep links, understandable errors,
and a complete immutable evidence artifact. It does not mean duplicating the
provider's accounting workflows.

## The accounting boundary

FASB identifies its Codification as the single official source of
authoritative nongovernmental US GAAP. FASB Topic 250 distinguishes accounting
changes from corrections of errors and includes retrospective reporting
requirements for errors in previously issued financial statements. That is a
financial-reporting judgment, including materiality and presentation—not a
date-routing rule that a CRM can safely infer from transaction metadata
alone.[^fasb-standards][^fasb-154][^fasb-topic-250]

Therefore, D11 must not encode “GAAP says every late item goes into the current
period” or the opposite. The safe product rule is:

1. source authorities identify the new or corrected business fact;
2. the tenant's versioned, accountant-confirmed policy identifies permitted
   posting treatments and dates;
3. authorized finance staff choose when the policy permits more than one
   treatment;
4. Asym compiles a balanced provider-native operation;
5. QBO or Xero validates and records it; and
6. the tenant's accountant remains responsible for materiality, reporting,
   disclosure, and any formal restatement.

The policy is a guardrail and routing input. It is not an accounting opinion.
If no accountant-approved, policy-permitted, provider-accepted period exists,
Asym blocks delivery and requests accountant resolution. It never silently
backdates, reopens a provider period, or substitutes the current period.

## Provider evidence

### QuickBooks Online

QuickBooks Online lets an administrator set a closing date and choose a warning
or password control. Intuit describes closing books as protection against
changes to transactions on or before the closing date and provides an
Exceptions to Closing Date report for later changes.[^qbo-close][^qbo-edit-close]

The QBO API returns closed-period errors, including `6200` and `6210`, when an
operation targets a closed period. Intuit's current common-error guidance says
apps cannot reliably check or change the close setting through the Accounting
API and recommends collecting the date from the company administrator. Yet
Intuit's platform release notes also say
`Preferences.AccountingInfoPrefs.BookCloseDate` was added to the Preferences
response.[^qbo-closed-error][^qbo-error-codes][^qbo-release-notes]

That official-document inconsistency is itself an implementation constraint:

- never rely on a QBO close-date preflight as authoritative;
- if the field is available and validated in the pinned API minor version,
  display it as advisory provider context;
- retain a tenant-confirmed date as another advisory signal;
- treat the actual provider operation response as authoritative for acceptance;
- translate `6200`/`6210` into a recoverable `Posting period unavailable`
  exception; and
- never ask staff for, store, or attempt to use a QBO closing-date password.

Intuit recommends a `requestid` on write, modify, and delete operations. Reusing
the same ID allows QBO to return the original response instead of duplicating
the operation after an uncertain transport outcome.[^qbo-request-id] Every
Compensating Accounting Release therefore needs a stable operation-granular
request ID, persisted before the network call.

QBO supports read-by-ID and change data capture. CDC is limited to the last 30
days and can return at most 1,000 objects, so it is useful for drift detection
but cannot replace immediate exact readback or periodic complete
verification.[^qbo-cdc]

Intuit's product guidance says reversing a journal creates a new balancing
journal and retains the original. It also warns that deleting a journal can
quickly unbalance accounts. More generally, Intuit recommends voiding over
deleting for recordkeeping, while hard-deleted API transactions cannot be
restored.[^qbo-reverse-journal][^qbo-void-delete][^qbo-api-delete]

Consequently:

- ordinary correction must be a linked compensating release;
- delete and void are not retry strategies;
- Asym must never mutate a previously delivered provider object merely because
  its source fact changed;
- provider-side mutation or deletion becomes drift requiring review; and
- an explicit, separately authorized provider repair may be designed later,
  but cannot erase Asym's original evidence.

QBO access uses OAuth 2.0. Access tokens expire, refresh-token values rotate,
users can revoke access, and inactive or hard-expired refresh tokens require
reauthorization. Tokens must be securely stored, rotated atomically, and
revoked when staff disconnect the integration.[^qbo-oauth][^qbo-token-faq]

QBO also enforces request and batch limits and returns `429`. Direct delivery
must be queued per realm, honor provider limits, and distinguish retryable
transport/rate failures from validation and policy failures.[^qbo-limits]

### Xero

Xero exposes `PeriodLockDate` and `EndOfYearLockDate` on the Organisation
endpoint. Lock dates stop users from adding or editing transactions on or
before the date, subject to Xero's role rules. The Organisation Actions data
can expose whether the connected user may perform operations such as creating
or updating manual journals.[^xero-org][^xero-lock][^xero-token-ids]

This supports a stronger preflight than QBO, but it still does not authorize
Asym to override a lock. The current provider response remains authoritative
because permissions, connection state, object state, and lock settings can
change after preflight.

Xero's Manual Journals endpoint:

- accepts a journal date;
- requires a narration and at least two journal lines;
- supports draft and posted journals;
- represents debits as positive and credits as negative;
- permits a maximum of two tracking-category elements per line;
- rejects system accounts such as accounts receivable, accounts payable,
  retained earnings, and bank accounts; and
- recommends clearing accounts when a manual-journal use case would otherwise
  target a bank account.[^xero-manual-journals]

These are provider-native constraints, not reasons to weaken the canonical
balanced Accounting Effect. D5-D8 compilation must select an appropriate Xero
transaction plan, not assume that every correction can be delivered as one
manual journal.

Xero supports idempotency keys for `POST`, `PUT`, and `PATCH`, caches the
response, and recommends retrying uncertain requests with the same key.
Compensating delivery must persist a stable operation-level key before sending
and must not generate a new key merely because a response was lost. Xero's
documented response cache is bounded, so a durable Asym operation identity,
payload digest, provider ID, and resource-specific readback remain necessary
after the provider window expires.[^xero-idempotency]

Xero returns structured `400` validation errors, `401` for an invalid or
disconnected authorization, `403` for insufficient permissions, `429` for
rate limits, and `503` for service or organisation unavailability. Xero
specifically recommends easy reauthorization after `401`, about a five-minute
retry for an offline organisation, and honoring `Retry-After` for
throttling.[^xero-errors][^xero-rate-limits]

Xero access tokens expire after 30 minutes. Refresh tokens rotate, and the
previous refresh token has only a grace period after rotation. Apps must store
the latest access and refresh token atomically. Xero also requires the exact
`xero-tenant-id` on accounting calls and supports explicit connection
removal.[^xero-auth][^xero-scopes]

Xero is migrating integrations toward granular OAuth scopes, with broad scopes
remaining only through September 2027 for existing connections. The connector
must model required capabilities rather than hard-code today's broad scope
bundle.[^xero-scopes]

### Provider finality

Neither provider offers a distributed transaction with Asym. The safe delivery
machine is:

`prepared → approved → submitting → outcome unknown | rejected | accepted → exact readback verified → drifted`

An HTTP timeout after submission is not failure. Recovery first queries by the
stored provider object ID, request/idempotency key where supported, and exact
release fingerprint. It retries the same operation with the same key only when
provider semantics permit. It never creates a replacement with a new key
before resolving ambiguity.

## Hardened domain shape

### Correction Cause

A source-owned immutable reason that accounting consequences may be needed,
for example:

- refund;
- dispute or chargeback;
- processor-fee correction;
- payout adjustment;
- offline deposit correction;
- designation/accounting mapping correction;
- source-fact supersession; or
- provider-side drift.

The cause records the original business-effective date, discovery date, source
authority, exact source version, amount/currency effect, and successor lineage.
It does not select a posting date.

### Correction Posting Policy

A prospective, versioned, accountant-confirmed tenant policy scoped to one
Tenant, Legal Entity, destination, and provider plan. It maps a bounded cause
class and provider/period conditions to:

- permitted posting treatments;
- earliest and latest permitted dates or periods;
- whether staff choice is allowed;
- required reason/evidence;
- materiality/escalation threshold configured by the tenant's accountant;
- required role for approval; and
- a safe default when exactly one treatment is permitted.

The policy cannot:

- override provider locks;
- alter source truth;
- produce an unbalanced effect;
- permit cross-entity or cross-currency correction;
- infer that issued financial statements should be restated;
- create arbitrary tenant code or formulas; or
- mutate releases already pinned to an earlier policy version.

### Compensating Accounting Release

A normal immutable Accounting Release with explicit correction lineage:

- `corrects_release_id`;
- Correction Cause ID and source digest;
- original business-effective date;
- discovery date;
- selected accounting date and period;
- selected policy version and rule result;
- selection actor/reason when choice existed;
- canonical balanced Accounting Effect;
- provider-native plan and capability snapshot;
- delivery operation IDs/idempotency keys;
- provider IDs and exact readback digest; and
- later correction or drift lineage.

It follows the existing D2-D8 release contract. It is not a second correction
subsystem.

### Period availability

Keep three independent truths:

1. **Tenant policy availability** — whether the selected policy permits a date.
2. **Observed provider context** — provider lock dates and capabilities when
   retrievable, with observation timestamp and freshness.
3. **Provider acceptance** — whether the provider accepted the exact operation.

Do not collapse them into `period_open=true`.

For QBO, observed provider context may be incomplete or advisory. For Xero, it
can include current lock dates and organisation capabilities. In both cases,
provider acceptance is final for the attempted operation.

## First-class staff experience

### Default clean path

Most corrections should require no accounting-form construction by staff.
The existing finance exception workspace shows:

- `Correction ready`;
- the plain-language cause;
- original release and provider link;
- original event date;
- recommended posting date and why;
- affected accounts/funds at progressive disclosure;
- balanced debit/credit preview;
- destination and provider connection health; and
- one primary `Review and send` action.

When exactly one policy-permitted treatment exists, it is selected
automatically. The confirmation says what will happen:

> Create a new linked correction dated July 26 in QuickBooks. The original
> December release remains unchanged.

### Choice only when real

If policy permits multiple posting periods, show a small choice using
accountant-authored labels:

- `Post in the source period` — available only when policy and provider context
  permit it;
- `Post in the current open period`; or
- another specifically configured permitted period.

Each option displays its accounting date, destination, consequence, and any
provider warning. Do not show unavailable periods as selectable.

Staff must never choose raw debit/credit signs, provider entity types,
idempotency keys, lock overrides, or API retry behavior in the routine flow.

### Provider-aware exceptions

Translate provider responses into one actionable surface:

- `Posting period unavailable` — choose another policy-permitted date or finish
  the accounting work in QBO/Xero;
- `Accounting connection needs attention` — reconnect without losing the
  release;
- `Permission needed` — reconnect with an authorized provider user;
- `Account or tracking target changed` — repair D6/D7 mapping prospectively;
- `Outcome not yet known` — Asym is checking before retrying;
- `Provider record changed` — compare exact readback and resolve drift; or
- `Provider temporarily unavailable` — queued retry with visible next action.

Never expose `6200`, `6210`, `401`, `429`, or raw provider payloads as the
primary staff explanation. Retain them in restricted support evidence.

### Direct provider continuity

Every accepted correction supplies:

- exact QBO/Xero object type and ID;
- a provider deep link where officially supported and safely constructible;
- delivery and readback timestamps;
- connection/tenant identity;
- immutable artifact download;
- `View original release`;
- `View correction`; and
- `Finish review in QuickBooks/Xero`.

If direct delivery is unavailable, the same Accounting Release remains
exportable through its already selected evidence-always artifact lane. A failed
direct operation must not silently switch delivery lanes for the same release.

## Ruthless adversarial review

### Brittleness — concern: yes

**What could go wrong:** The design assumes every tenant closes monthly, every
correction is a journal, or provider lock state is stable and readable.

**Why it matters:** Real tenants have different policies and QBO/Xero expose
different capabilities.

**Severity:** High.
**Likelihood:** High without provider-aware plans.

**Permanent prevention:** Bounded cause types, prospective policy versions,
canonical balanced effects, provider-native compilation, three-axis period
truth, and provider acceptance/readback as final delivery evidence.

### Technical debt — concern: yes

**What could go wrong:** Refunds, disputes, fees, and mapping corrections each
grow separate retry, dating, and provider code.

**Why it matters:** Accounting behavior and audit evidence drift.

**Severity:** High.
**Likelihood:** Medium-high.

**Permanent prevention:** Reuse one Accounting Release pipeline, one Correction
Cause interface, one policy evaluator, and existing provider adapters. Do not
create a parallel “adjustment export” architecture.

### Edge cases — concern: yes

**What could go wrong:** Partial refunds, multiple corrections to one release,
multi-currency effects, negative payouts, provider-side edits, a period locking
between approval and delivery, leap-day/fiscal calendars, or a correction that
spans legal entities.

**Why it matters:** The wrong date, destination, or amount can enter the books.

**Severity:** Critical.
**Likelihood:** Medium.

**Permanent prevention:** One entity/currency per release, integer minor units,
source-version coverage, chained correction lineage, delivery-time capability
checks, and no cross-entity balancing.

### Footguns — concern: yes

**What could go wrong:** Staff backdate casually, delete the original provider
transaction, reuse a retry with a new idempotency key, or interpret “corrected”
as “restated.”

**Why it matters:** Audit history can be destroyed or entries duplicated.

**Severity:** Critical.
**Likelihood:** Medium.

**Permanent prevention:** No routine delete/void, policy-bounded dates,
plain-language consequence preview, stable operation keys, append-only
recovery, and explicit labels such as `Linked correction posted`.

### Tenant safety — concern: yes

**What could go wrong:** A correction is compiled using another tenant's realm,
Xero organisation, entity, policy, mapping, or token.

**Why it matters:** This would write financial data into another organisation's
books.

**Severity:** Critical.
**Likelihood:** Low if enforced, catastrophic if missed.

**Permanent prevention:** Persist and validate Tenant + Legal Entity +
destination binding on every record and operation; encrypt tokens per
connection; fail closed on mismatch; and test cross-tenant, cross-entity,
cross-environment, and stale-connection attacks.

### Over-engineering — concern: yes

**What could go wrong:** Asym builds period close, materiality analysis,
restatement workflows, arbitrary rules, or a shadow general ledger.

**Why it matters:** It duplicates accountants and providers while increasing
liability and maintenance.

**Severity:** High.
**Likelihood:** High unless prohibited.

**Permanent prevention:** Small enumerated cause/treatment catalogs,
accountant-confirmed policy, balanced release preparation, direct delivery,
readback, and evidence only. QBO/Xero owns the books.

### UX/UI and user friction — concern: yes

**What could go wrong:** Every correction requires finance to understand
journals, provider locks, and API errors.

**Why it matters:** Staff bypass the integration or create manual duplicates.

**Severity:** High.
**Likelihood:** Medium-high.

**Permanent prevention:** One recommended action, choices only when genuine,
progressive accounting detail, exact provider link, exception-first handling,
and copy that states the original is unchanged.

### Hidden coupling — concern: yes

**What could go wrong:** The policy depends directly on QBO error codes, Xero
object shapes, or specific source-table schemas.

**Why it matters:** Provider changes force accounting-domain rewrites.

**Severity:** High.
**Likelihood:** Medium.

**Permanent prevention:** Canonical Correction Cause and Accounting Effect;
provider capability and operation adapters; raw provider details confined to
the integration boundary.

### Failure modes — concern: yes

**What could go wrong:** Timeout after provider success, token rotation race,
rate limit, partial batch success, provider outage, validation rejection, or
connection revocation.

**Why it matters:** Blind retry creates duplicates; blind failure creates
missing books.

**Severity:** Critical.
**Likelihood:** Medium-high.

**Permanent prevention:** Operation-level state machine, persisted idempotency
keys, single-flight token refresh, outcome-unknown resolution, individual
result handling, provider-specific retry policy, and exact readback.

### Data integrity — concern: yes

**What could go wrong:** An unbalanced effect, wrong sign, duplicate correction,
stale policy, reused source coverage, or provider drift.

**Why it matters:** The accounting handoff no longer equals its source facts.

**Severity:** Critical.
**Likelihood:** Medium.

**Permanent prevention:** Debit=credit invariant, source conservation,
correction uniqueness/idempotency constraints, pinned versions/digests,
transactional approval, exact provider readback, and periodic drift scans.

### Security and privacy — concern: yes

**What could go wrong:** OAuth tokens, financial descriptions, donor names, or
provider payloads leak.

**Why it matters:** Accounting data and credentials are highly sensitive.

**Severity:** Critical.
**Likelihood:** Medium.

**Permanent prevention:** Least scopes, encrypted secret storage, atomic token
rotation, revocation on disconnect, role-based access, PII-minimized UI/logs,
restricted raw evidence, audit trails, and retention controls.

### Scalability and performance — concern: yes

**What could go wrong:** Seasonal correction bursts or drift scans exceed
per-tenant and app-wide limits.

**Why it matters:** One tenant can delay other tenants or create provider bans.

**Severity:** High.
**Likelihood:** Medium.

**Permanent prevention:** Tenant-fair queues, per-connection flow control,
provider `Retry-After`, bounded batches, pagination, incremental observation
plus periodic verification, and no synchronous UI-bound provider writes.

### Operational burden — concern: yes

**What could go wrong:** Support manually diagnoses every close-date rejection,
token expiry, mapping drift, or unknown outcome.

**Why it matters:** A first-class integration becomes expensive and unreliable.

**Severity:** High.
**Likelihood:** High without a repair surface.

**Permanent prevention:** Actionable provider health, grouped exceptions,
safe reconnect, deterministic retry ownership, restricted support evidence,
and immutable artifacts that allow accounting work to continue.

### Observability gaps — concern: yes

**What could go wrong:** Missing corrections, stuck unknown outcomes, duplicate
writes, stale tokens, drift, and aging exceptions remain invisible.

**Why it matters:** Financial omissions surface only at close.

**Severity:** High.
**Likelihood:** Medium.

**Permanent prevention:** Metrics/alerts by tenant and provider for correction
age, delivery state, unknown-outcome duration, retries, validation categories,
token health, rate limits, readback mismatch, drift, and artifact availability.

### Dependency and integration risk — concern: yes

**What could go wrong:** QBO minor versions, Xero scope migration, provider
limits, object constraints, or OAuth behavior change.

**Why it matters:** Direct delivery can stop or silently lose capability.

**Severity:** High.
**Likelihood:** High over the product lifetime.

**Permanent prevention:** Pinned supported API versions, capability
certification, contract tests against both sandboxes, release-note monitoring,
provider adapters, artifact-always fallback, and no provider-native assumptions
in the canonical domain.

### Migration and upgrade risk — concern: yes

**What could go wrong:** New policy, mapping, or provider-plan versions alter
historical correction interpretation.

**Why it matters:** Audit evidence becomes unreproducible.

**Severity:** High.
**Likelihood:** Medium.

**Permanent prevention:** Prospective versions, immutable artifacts and
digests, schema versioning, readable old compilers, and successor migrations
instead of history rewrites.

### Other development hazards — concern: yes

**What could go wrong:** Two staff members approve the same correction,
concurrent source updates invalidate review, or deploy rollback occurs between
provider success and local persistence.

**Why it matters:** Duplicate or orphan provider entries result.

**Severity:** Critical.
**Likelihood:** Medium.

**Permanent prevention:** Compare-and-swap approval, database uniqueness,
single-flight submission, source/policy digest recheck at release, durable
outbox/state transitions, replay tests, provider sandbox contract suites,
fault injection at every network boundary, and rollback that stops new work
without deleting evidence.

## Implementation proof gates

No D11 behavior should ship without:

1. correction-source conservation and debit=credit property tests;
2. open, closed, and lock-changed-after-review provider scenarios;
3. QBO `6200`/`6210`, timeout-after-success, duplicate request ID, `401`,
   `429`, and provider drift tests;
4. Xero lock-date, capability, reserved-account, tracking-limit, partial
   validation, token-rotation, `401`, `403`, `429`, `503`, and drift tests;
5. operation-key replay proving no duplicate provider objects;
6. exact readback and fingerprint mismatch tests;
7. concurrent approval/submission/source-change tests;
8. cross-tenant/entity/destination/environment negative tests;
9. policy-version and mapping-version reproducibility tests;
10. artifact-lane continuity when direct delivery is unavailable;
11. accessible keyboard/screen-reader/error-recovery UI tests; and
12. finance usability testing with both simple and many-fund mission
    organisations.

## Final synthesis

The permanent path is:

1. preserve the original Accounting Release;
2. capture one source-owned Correction Cause;
3. evaluate one pinned, accountant-confirmed Correction Posting Policy;
4. auto-select only when exactly one permitted treatment exists;
5. let authorized finance staff choose only among genuinely permitted choices;
6. compile a new balanced Compensating Accounting Release through D4-D8;
7. recheck source, policy, mapping, connection, capability, and observed period
   context at approval and again before submission;
8. submit with a stable operation-granular idempotency key;
9. resolve uncertain outcomes before retry;
10. read the exact provider object back and compare its accounting effect;
11. retain the immutable artifact and provider evidence; and
12. leave period close, reconciliation, financial statements, and formal GAAP
    correction judgments in QBO/Xero and with the tenant's accountant.

This is not accounting software. It is a reliable, provider-native accounting
handoff and evidence system.

## Primary sources

[^fasb-standards]:
    FASB,
    [Standards](https://fasb.org/standards).

[^fasb-154]:
    FASB,
    [Statement No. 154 — Accounting Changes and Error Corrections](https://storage.fasb.org/fas154.pdf).

[^fasb-topic-250]:
    FASB,
    [GAAP Taxonomy Implementation Guide on Accounting Changes](https://xbrl.fasb.org/impdocs/AC2_TIG/accountingchanges.htm).

[^qbo-close]:
    Intuit,
    [Lock your books in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-article/close-books/close-books-quickbooks-online/L59LelyPM_US_en_US).

[^qbo-edit-close]:
    Intuit,
    [Edit your closed books in QuickBooks](https://quickbooks.intuit.com/learn-support/en-us/help-article/customer-company-settings/edit-closed-books/L76xHuaZ5_US_en_US).

[^qbo-closed-error]:
    Intuit Developer,
    [Handling common errors — Account Period Closed](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/handling-common-errors).

[^qbo-error-codes]:
    Intuit Developer,
    [QuickBooks Online Accounting API error codes](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/error-codes).

[^qbo-release-notes]:
    Intuit Developer,
    [Platform release notes](https://developer.intuit.com/app/developer/qbo/docs/release-notes/platform-release-notes).

[^qbo-request-id]:
    Intuit Developer,
    [Basic field definitions — Request ID](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions).

[^qbo-cdc]:
    Intuit Developer,
    [Change data capture operation](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture).

[^qbo-reverse-journal]:
    Intuit,
    [Reverse or delete a journal entry](https://quickbooks.intuit.com/learn-support/en-us/help-article/journal-entries/reverse-delete-journal-entry-quickbooks-online/L2prlrnkh_US_en_US).

[^qbo-void-delete]:
    Intuit,
    [Void or delete transactions](https://quickbooks.intuit.com/learn-support/en-us/help-article/list-management/void-delete-transactions-quickbooks-online/L5sZV8GYh_US_en_US).

[^qbo-api-delete]:
    Intuit Developer,
    [What you can do with the QuickBooks Online Accounting API](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api).

[^qbo-oauth]:
    Intuit Developer,
    [OAuth 2.0](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0).

[^qbo-token-faq]:
    Intuit Developer,
    [Authentication and authorization FAQ](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/faq).

[^qbo-limits]:
    Intuit Developer,
    [API call limits and throttles](https://developer.intuit.com/app/developer/qbo/docs/learn/limits-and-throttles).

[^xero-org]:
    Xero Developer,
    [Accounting API — Organisation](https://developer.xero.com/documentation/api/accounting/organisation).

[^xero-lock]:
    Xero,
    [Set up or remove lock dates](https://central.xero.com/s/article/Set-up-and-work-with-lock-dates).

[^xero-token-ids]:
    Xero Developer,
    [Managing tokens and IDs](https://developer.xero.com/documentation/best-practices/data-integrity/managing-tokens).

[^xero-manual-journals]:
    Xero Developer,
    [Accounting API — Manual Journals](https://developer.xero.com/documentation/api/accounting/manualjournals/).

[^xero-idempotency]:
    Xero Developer,
    [Idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/).

[^xero-errors]:
    Xero Developer,
    [Accounting API response codes and errors](https://developer.xero.com/documentation/api/accounting/responsecodes).

[^xero-rate-limits]:
    Xero Developer,
    [Rate limits](https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits).

[^xero-auth]:
    Xero Developer,
    [Standard authorization code flow](https://developer.xero.com/documentation/guides/oauth2/auth-flow/).

[^xero-scopes]:
    Xero Developer,
    [OAuth 2.0 scopes](https://developer.xero.com/documentation/guides/oauth2/scopes).

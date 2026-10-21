# D31 database, monetary precision and authorization evidence

**October 18, 2026 UTC** · HEAD
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

The founder selected **any eligible positive source-confirmed excess**, without
an added minimum-amount setting. This research note reviews that predicate's
technical consequences. It changes no application, schema, source money,
provider, dependency or live database. D30 evidence is unchanged. No prior model,
database experiment or test suite was rerun. Fifteen fresh primary-document GETs
are recorded in the [retrieval manifest](technical-fetches.json); successful
retrieval is not implementation or hosted-version evidence.

## Disposition and precise contract

**Accept with required amendments.** Compare an already owner-qualified, exact
canonical excess amount with zero. Do not build a P28 financial calculator by
subtracting portal totals, a current pledge amount or a rounded display value.
There is no user-entered excess, tolerance, percentage, provider charge minimum,
per-currency stewardship threshold or new tenant switch. D22's whole-gift amount
setting and D30's optional one-time-purpose rule remain independent.

The logical predicate is:

```text
qualified source proof for exact live gift/application + comparison scope
AND exact finite canonical excess_minor > 0
AND current authorized, unconsumed source-purpose admission
```

This is a predicate, **not** an implementation formula or permission shortcut.
The source proof must identify the exact received business gift/eligible portion,
financial Legal Entity, Tenant, Party/recognition, typed ministry/project,
applicable commitment/target/terms and revisions, currency, financial/application
correction state and comparison completeness. Provider evidence also carries
the exact source-owned account/mode/binding when applicable. Missing or stale
proof withholds this reason; it does not make the gift, target or expected amount
zero. A new threshold would change the founder's choice, not repair an invalid
comparison.

[D21-C04:198](../phase28-d21-explicit-gift-follow-up-adversarial-review.md:198)
already excludes unmatched-money/no-commitment inference, catch-up, advance,
reduced terms and current excess without new money as new occurrences.
[P16 F.2–F.3:970](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:970)
owns typed expectation targets and conserved applications; source/target
capacity, exact scope/currency, current authority, expected revisions and
permanent lock order belong there. P28 consumes the qualified result; it does
not create an application, increase target capacity or ask a missionary to edit
money to obtain or suppress a task.

[P16 F.5–F.7:1005](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1005)
separates application authority, uncertainty, prepayment and correction.
An overage against one installment may belong to other explicitly eligible
targets; a limited read of one target cannot prove overall excess. Conversely,
P28 may not silently assign money to another target to eliminate an excess.
[P16 M.2–M.3:1378](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1378)
can show **Applied above current commitment** after a donor-requested reduction;
that derived state is not proof that new money arrived and cannot create D31
work on its own.

## Current source: sound primitives and concrete reuse hazards

The current files and source paths below were freshly inspected. D29/D30 task,
scope and staging findings are reused where stated; no claim is made that their
production behavior was retested. Bounded searches for above-commitment and
fulfillment-application producers in `packages/api/src` and migration SQL did
not establish an implemented D31 source. This does not prove absence of every
differently named path.

| Evidence                                                                                                                                                                                                                                                                                                                                                              | Current behavior                                                                                                                                                                                                                           | D31 consequence and claim limit                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR-0208:18](../../../../adr/0208-currency-aware-minor-units.md:18), [money parser:26](../../../../../packages/api/src/money/index.ts:26)                                                                                                                                                                                                                            | Governing money representation is checked integer minor units plus validated currency. Parser uses decimal text and BigInt to construct units, rejects nonfinite values/excess precision and enforces JavaScript safe integer output.      | Reuse the canonical primitive rather than add a cents-only or floating-point comparison. Exact parsing is an existing capability; it does not qualify the financial meaning or completeness of an excess.                                                      |
| [Money formatter:56](../../../../../packages/api/src/money/index.ts:56), [provider conversion:117](../../../../../packages/api/src/money/index.ts:117), [metadata:1](../../../../../packages/api/src/money/metadata.ts:1)                                                                                                                                             | Formatter uses currency exponent and exact decimal-string formatting. Metadata supports exponents 0, 2, 3 and 4. Provider charge/payout representation and divisibility are separate and lossless.                                         | No canonical minor unit may disappear through display rounding or provider-specific rules. Comprehensive metadata is not a promise that every currency/payment/source lane is live.                                                                            |
| [Money foundation tests:14](../../../../../tests/unit/packages/api/money-foundation.test.ts:14), [boundary tests:82](../../../../../tests/unit/packages/api/money-foundation.test.ts:82), [provider tests:28](../../../../../packages/api/tests/unit/money-provider.test.ts:28)                                                                                       | Existing tests specify zero/three-decimal behavior, invalid precision, safe integer limits and canonical/provider differences. They were read, not rerun here.                                                                             | Useful concrete acceptance examples for money primitives; not proof of real D31 source, SQL/JSON round-trip, aggregate capacity or concurrency.                                                                                                                |
| [Current settlement resolver:5](../../../../../packages/api/src/money/settlement.ts:5)                                                                                                                                                                                                                                                                                | An explicitly narrow compatibility resolver returns the existing USD donate lane only for a verified tenant; it says metadata cannot widen qualification.                                                                                  | Do not advertise new currency lanes or reinterpret provider support just because a D31 comparison is currency-aware. Existing legitimately qualified monetary sources retain their own boundaries.                                                             |
| [Legacy money migration:460](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:460), [checks:526](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:526)                                                                                                                                                              | Donations/pledge amounts and counters were migrated to BIGINT using a two-decimal historical conversion; nonnegative checks exist.                                                                                                         | BIGINT is useful exact storage but its range exceeds JavaScript's safe-number range. A source census must establish units/origin; never rerun the old conversion on canonical data or infer current excess from migrated counters.                             |
| [Migration assertion:554](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:554)                                                                                                                                                                                                                                                              | `assert_amount_columns_multiple_of_100()` checks divisibility by 100 for a historical whole-dollar migration assumption. Search found its definition and rollback drop, not an active invocation in the inspected migrations/seed/scripts. | **Do not reuse it** as D31 validation: it would reject a valid one-minor-unit excess. It is not evidence of an enforced live minimum or a deployed D31 defect.                                                                                                 |
| [Donation pledge link:289](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:289), [commitment detail fetch:407](../../../../../packages/api/src/admin/contribution-operations/operations.ts:407)                                                                                                                                             | Existing donation `pledge_id` and a tenant-scoped fetch expose related pledge amount/status/frequency. They are not the target/terms/application/capacity proof defined by P16.                                                            | A foreign key or linked agreement cannot replace exact immutable application lineage, source revisions and complete applicable comparison scope. No new mutable `excess` field on a posted donation is justified.                                              |
| [Missionary related-pledge query:542](../../../../../packages/api/src/missionary-portal/donors.ts:542), [donor snapshot limits:208](../../../../../packages/api/src/donor-portal/service.ts:208)                                                                                                                                                                      | Portal reads expose aggregate counters and bounded lists; the inspected missionary pledge selection does not carry currency or target/application/terms revisions.                                                                         | These display/read inputs cannot prove complete same-currency excess. A paged/limited user-visible set is not the full authorized source comparison. Unknown omitted data cannot be treated as zero.                                                           |
| [Missionary money conversion:227](../../../../../packages/api/src/missionary-portal/model.ts:227), [gift mapping:317](../../../../../packages/api/src/missionary-portal/model.ts:317), [pledge formatting:93](../../../../../packages/api/src/donor-portal/pledge-view.ts:93), [pledge totals:134](../../../../../packages/api/src/donor-portal/pledge-view.ts:134)   | Legacy presentation divides rounded values by 100 and uses USD fallbacks. These do not implement ADR-0208's general currency-safe display contract.                                                                                        | Reached D31 reason/detail must use qualified currency and canonical formatting. Treat as concrete reuse gaps; this review does not claim that the present USD lane necessarily displays an incorrect D31 value. Never compute admission from formatted values. |
| [Portal aggregate:357](../../../../../packages/api/src/missionary-portal/model.ts:357), [provider pledge update:254](../../../../../packages/api/src/stripe/recurring.ts:254)                                                                                                                                                                                         | Portal summary sums display inputs; recurring webhook helper mutates collection/status counters. Neither is an authoritative conserved P16 application operation.                                                                          | Do not equate summary totals or event counts with fulfillment, new excess or a complete history. The helper alone does not establish absence of upstream webhook deduplication; no duplicate-charge/runtime defect is asserted.                                |
| [Manual task create:81](../../../../../packages/api/src/missionary-portal/tasks.ts:81), [task mutation:81](../../../../../packages/api/src/missionary-portal/task.ts:81), [delete:102](../../../../../packages/api/src/missionary-portal/task.ts:102)                                                                                                                 | As already observed in D29/D30, POST forces manual provenance; generic patch/delete lack native source/coverage guards.                                                                                                                    | Adding an “above commitment” title/flag does not implement a qualified native producer or D20 exact handling. Fence/delegate source-relevant mutations before reuse.                                                                                           |
| [Donation SELECT policy:184](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:184), [pledge SELECT policy:237](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:237), [task revoke:261](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261) | Existing row policies and task table access revocation are real migration evidence, but not proof of future fine-grained comparison/result disclosure.                                                                                     | Inventory effective deployed roles, grants and policies before activation. Do not cite an old disabled-RLS statement as current browser exposure, or assume raw row visibility authorizes arithmetic-derived sensitive facts.                                  |

## Exact numeric semantics

[PostgreSQL numeric documentation](https://www.postgresql.org/docs/17/datatype-numeric.html)
confirms BIGINT's signed range of −9,223,372,036,854,775,808 through
9,223,372,036,854,775,807. JSON's broadly interoperable exact integer range is
−9,007,199,254,740,991 through 9,007,199,254,740,991 in
[RFC 8259 §6](https://www.rfc-editor.org/rfc/rfc8259#section-6), matching the
current helper's safe-number boundary. A valid database integer therefore is
not automatically a lossless JavaScript `number`.

Required precision contract:

1. Source monetary values, intermediate sums/differences and result use exact
   canonical units and a validated source currency. Preserve the accepted
   currency metadata/version semantics. Reject unsupported precision, nonfinite
   inputs and overflow before coercion. Do not repair an invalid financial input
   by rounding it into a valid positive amount.
2. A qualified exact integer excess of **1** is positive. Depending on the
   source's canonical exponent, that can display as JPY 1, USD 0.01 or KWD 0.001.
   Four-decimal metadata must also be handled correctly where a source lane is
   qualified. These are representation examples, not new currency launches.
3. Exact zero and negative source outcomes do not qualify. Unknown/incomplete/
   denied/stale comparison is not a numeric outcome. Do not use `epsilon`,
   floating-point noise, rounded percentages, string comparisons, display
   positivity, `abs`, an arbitrary one-dollar/cents floor or a provider minimum.
4. Keep existing safe-number contracts when their declared bounds are sufficient.
   If a qualified owner supports larger values, use its lossless transport and
   exact arithmetic representation end to end. Do not cast database BIGINT or
   NUMERIC strings through `Number`, `parseFloat`, or JSON number conversion
   before proving the bound. No blanket numeric-type migration is selected.
5. Checking each input's safe range is insufficient: sums/intermediates can
   exceed it. [PostgreSQL aggregates](https://www.postgresql.org/docs/17/functions-aggregate.html)
   returns `numeric` for `sum(bigint)`. Preserve exact result transport and
   separately validate source capacity, comparison bounds and final safe output.
6. `numeric(p,s)` rounds excess fractional precision on assignment. A CHECK on
   the already coerced value cannot recover what was rounded. Validate original
   precision first. Unconstrained NUMERIC can represent nonfinite values; a bare
   positivity test is not a complete financial validity check. Prefer the
   repository's checked canonical integer boundary rather than introduce a
   new decimal-major-unit pipeline.
7. `sum` with no rows is NULL. `COALESCE(...,0)` is valid only when the owner
   proves a complete known empty set for that exact calculation. Permission-
   filtered, paginated, stale or failed reads cannot establish no applications
   or no commitment. An unknown target does not have zero capacity.
8. Canonical precision and payment charge/payout constraints have different jobs.
   Do not quantize existing received excess to a provider charge multiple or
   minimum. Source qualification already owns whether money was received; D31
   creates no charge or payout and adds no minimum setting.

The Postgres performance skill's generic `numeric(10,2)` example does not override
[ADR-0208](../../../../adr/0208-currency-aware-minor-units.md:18). Exact canonical
integer minor units are the governing repository choice, including currencies
that do not use two decimals.

## Source evidence, state and invariant requirements

Use one owner-qualified source result, not a P28 shadow ledger. Its evidence must
make independently testable why the particular new live gift/portion represents
support above the exact applicable commitment comparison. An opaque `excess=true`,
an untrusted import field, unmatched balance, textual memo or a naked target ID
is insufficient. A single immutable evidence reference may expose these facts
through its adapter; this requirement does not prescribe duplicate columns or
a new universal proof service.

- **Scope and terms:** exact Tenant, financial Legal Entity, contribution/line,
  eligible Party, typed ministry/project, comparison kind/target/terms and
  revisions, currency and applicable provider binding. A same-Tenant gift can
  still belong to a different Entity or subject. Null scope/default USD cannot
  fill gaps. Use compatible composite keys/FKs where owner keys exist, with
  source-owned validation of typed relationships and current meaning.
- **Conservation and completeness:** source applications and target capacity use
  the P16 conserved command. Do not double-count recognition, recurring-to-fixed
  derived coverage, multiple lines or equal gifts. A shown installment does not
  stand for the whole applicable commitment unless the owner proves that scope.
  No FX, unrelated commitments, fee cover, net settlement or advance/catch-up
  inference may manufacture this reason.
- **Immutable financial truth:** [ADR-0206:19](../../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md:19)
  still prohibits mutation of posted financial columns. Store P28 operational
  qualification/admission separately under its owner and consume financial
  revisions; a later mathematical correction is not permission to edit money.
- **Trusted context and protected mutations:** derive Tenant, actor, source owner,
  attribution and audit time through trusted command context. Submitted IDs are
  candidate references. No generic task/API update can retarget an accepted
  reason to another gift, target, author or subject, even if both rows are
  individually writable. Coarse Tenant RLS is not transition immutability.
- **Stable effect:** use D20's canonical gift/Party/typed-subject/purpose member.
  New comparison revisions, positive amounts, reason codes, transport IDs or
  repeated provider events do not mint new work for the same handled effect.
  Several independent reasons can explain one compatible task; distinct gifts
  remain distinct. A corrected excess amount does not imply a new gift.
- **Correction:** use P16's immutable source correction/inverse and exact
  revisions. An ambiguous partial reversal withholds the affected reason and
  preserves unrelated valid reasons/work. Corrections do not require reviving
  expired original application authority; they require current qualified
  correction authority. A missing read is not proof the old reason was false.
- **History:** preserve original live lineage and accepted handling. Historical
  imports, reduced terms or reclassification create no fresh monetary occurrence.
  Legitimate delayed source qualification or repair can use original unconsumed
  live lineage through the owning contract; do not replace event time with worker
  time or invent a new materiality policy interval for D31.

## Atomicity, races, authorization and disclosure

[P16 F.3:995](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:995)
already specifies authority fence, source then sorted target locking and
under-lock authority/capacity refolding. D31 must consume a coherently qualified
source revision; it must not build a second inconsistent lock order or evaluate
some terms before and other applications after a correction. P28 accepted
reason, required state/revision, semantic receipt, audit and durable identifier-
only task intent commit atomically at its owner. Finance does not wait for human
task completion. Cross-owner adapters use the existing versioned/durable protocol,
not an unproved distributed transaction.

[READ COMMITTED](https://www.postgresql.org/docs/17/transaction-iso.html) can
recheck a changed locked row while other lookups have older snapshots.
[PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) explicitly
describes cross-table policy races. Locking only a task or purpose row is not
proof that a concurrent target/source correction or authorization revocation is
ordered. Require both sides to participate in the source-qualified fence/CAS/
serialization protocol, recheck after waits and retry the whole owner command
where required. [Current-time documentation](https://www.postgresql.org/docs/17/functions-datetime.html)
distinguishes transaction-start `now()` from actual `clock_timestamp()`; expiring
authority must be checked at final acceptance after waits using current time.

Current [Supabase grants](https://supabase.com/docs/guides/api/securing-your-api)
and [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
are separate from source permission. Review effective schema/table/column grants,
old/new row checks, policies, views, RPC owners/ACLs/search paths and direct,
service-role, import, worker and repair paths. Actual database roles and deployed
catalogs were not inspected here.

Correct two overbroad skill claims using primary PostgreSQL documentation:
[CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) reuses
`USING` when `UPDATE`/`ALL` omits `WITH CHECK`; omission alone is not an exploit.
Both old and new rows may still satisfy broad policy while violating immutable
source/actor relationships, which need explicit safeguards.
[SECURITY DEFINER](https://www.postgresql.org/docs/17/sql-createfunction.html)
uses the actual owner's privileges; bypass is role/owner dependent. FORCE RLS
binds ordinary table owners but not superusers/BYPASSRLS. Default PUBLIC execution
and exposed schema reachability require actual ACL inspection, selective grants
and trusted search paths, not categorical assumptions. Fine-grained product
authorization remains the existing P12 spine; no second SQL permission engine.

**Derived arithmetic is sensitive data too.** A permitted gift amount plus a
published excess can reveal a protected commitment value or remaining capacity.
P12 must qualify the derived-result projection, not merely check that each task
or gift row is visible. Show exact gift/excess/comparison amounts only in the
approved combination and source scope. If a category is permitted but its detail
is not, a minimal reason can be used; if even the category/commitment existence
is hidden, generic wording does not confer permission. A task read cannot grant
raw application/terms/body access.

Apply current projection at final release to lists, history, counts, filters,
exports, notifications, logs, saved views, caches and result recovery. Reject
late responses after actor/Tenant/scope/permission changes. Already released
bytes cannot be recalled. Recovered command success still requires current
disclosure; deny without exposing hidden operands or confirming a protected
record's existence. Durable audit contains qualified minimal actor/source/revision/
outcome metadata, not private financial operands or donor narratives merely for
debugging. Preserve source-owned retention/holds/corrections and current deny
state on restoration; D28 private-preparation retention does not own these facts.

## Required proof before activation

These are **unperformed release obligations**, not claims of passing production
tests. Existing primitive tests are useful and need targeted extension at the
actual implemented D31 seams; no need to create tests for this documentation
edit or rerun earlier artificial models.

| Case                                                                                                | Required domain outcome                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Qualified exact excess −1, 0, 1 in canonical units                                                  | Only positive 1 qualifies; no rounding, epsilon or hidden minimum. Unknown/incomplete is separate from all three.                                                        |
| Qualified zero/two/three/four-decimal sources                                                       | Preserve one minor unit and exact currency on source→DB→API→UI path; do not advertise unqualified source currencies.                                                     |
| Safe integer boundary, SQL BIGINT boundary and aggregate overflow                                   | Reject unsupported range before loss or transport through a qualified exact representation. Individually safe rows do not justify unsafe aggregate/intermediate results. |
| Excess fractional input, nonfinite numeric, empty SUM, hidden/paged target set                      | Reject invalid precision/values; never convert missing/incomplete evidence into zero capacity or positive excess.                                                        |
| Genuine excess versus fee cover, installment overage, catch-up/advance, other target, reduced terms | Only the exact source-qualified new-money case admits; no pledge edit or financial application is performed by D31.                                                      |
| Current target/terms/application/source correction races admission, both orders                     | Coherent owner revision and qualified fence determines outcome; no mixed old/new comparison or stale authority after waits.                                              |
| Authority expires during lock wait                                                                  | Final current-time check denies expired admission; transaction-start time does not extend access.                                                                        |
| Duplicate/new transport keys, multiple reasons/lines, lost accepted response                        | One stable effect and exact reviewed D20 coverage; recover same result without re-sending or re-applying money.                                                          |
| Partial/full reversal, source uncertainty and repair                                                | Withdraw only invalid reason, hold ambiguous comparison, preserve independent reasons and completed history; restore only qualified unconsumed original work.            |
| Cross-Tenant/Entity/subject, wrong target revision, null currency, spoofed actor and mutable origin | Every actual table/API/RPC/privileged entry denies without exposing hidden source existence.                                                                             |
| Gift visible but commitment/derived operands restricted                                             | Task, category, arithmetic detail, count, cache and recovered response disclose only the qualified projection; no reconstruction shortcut.                               |
| Task completion concurrent with another gift or source revision                                     | Only reviewed eligible member/revision set is consumed; later work stays visible and old handled work does not reopen.                                                   |
| Failure at required source/audit/receipt/intent persistence; async outage                           | No partial accepted effect; durable intent repairs the same task under current source authority without finance rollback.                                                |
| Legacy cents values, source metadata revisions, old clients and restore                             | No unconditional ×100 migration, historical reclassification or default USD; compatible old-writer fences preserve source truth and coverage.                            |

Qualify the exact producer and P12 safe result first, then integrate D20 task
projection/detail. Use additive schema/read/write deployment and effect-dark
historical reconciliation. No threshold migration, tenant settings page or
per-currency policy table is necessary. Operational feature gates may protect
an unqualified adapter during rollout; they are not a product control silently
making required native work optional. Kill switches stop new invalid admission
while preserving accepted evidence, mandatory correction and recoverable work.

Index exact source/target/terms revision, Tenant/Entity/subject, stable member and
pending intent lookups. Measure real joins, lock contention, source correction
fan-out and tenant skew with declared workload bounds. Do not repeatedly scan
all donor history or compute authoritative comparisons from client summaries.
This review makes no unmeasured throughput or latency claim.

Fresh [Supabase changelog](https://supabase.com/changelog.md) review found the same
relevant notices as D30: [new-table Data API grants](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
roll out to existing projects on October 30, 2026 without removing existing
grants; [PostgreSQL 15.19/17.11 changes](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
require actual-version/extension qualification; [legacy TLS cipher removal](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)
starts no earlier than November 10. None changes D31's business predicate or
justifies adding a new integration. Repository SQL/grants and current owner
contracts remain the implementation boundary.

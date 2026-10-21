# D33 finite offline-report counterexamples

**October 18, 2026 UTC.** The selected direction allows optional actual
offline-gift reporting by authorized missionaries through P15's existing intake,
with organization reporting Off by default. The temporal rules here are proposed
D33 review amendments; this artifact claims neither ratification nor implementation.

[Model](report-counterexamples.py) and [deterministic results](report-counterexamples.json)
contain 13 counterexample families and 4 controls. The JSON records the exact
outcome-assertion count and script SHA-256. [Analytical review](counterexample-review.md)
identifies additional source obligations and scenarios beyond this small model.

## Reproduce

From the repository root:

```bash
python3 docs/features/missionary-workspace-depth/grill/d33-evidence/report-counterexamples.py > /tmp/d33-report-counterexamples.json
cmp /tmp/d33-report-counterexamples.json docs/features/missionary-workspace-depth/grill/d33-evidence/report-counterexamples.json
```

The script uses the Python standard library, prints deterministic JSON and writes
no files itself. Assertions raise on unexpected outcomes. Preserve the generated
JSON serializer's bytes rather than formatting that output separately. No older
model or probe is executed.

## Exact key and policy semantics

Current policy and current create authority govern new missionary report
acceptance. A cached On check does not authorize a later acceptance after Off.
An Off-rejected submission records a **terminal minimal no-effect receipt**. It
does not create an intake or queue an eventual submission. The old key remains
rejected after On returns. Maya must deliberately review current facts and submit
a **new intent/key**; that new report may truthfully describe an actual receipt
that occurred while reporting was Off. Acceptance is not backdated.

An accepted exact retry recovers its original minimal result under current
disclosure, even when reporting is now Off or the create grant has been revoked.
A changed payload under the accepted/rejected key conflicts. Source-unavailable
failure before acceptance creates no durable report receipt in the illustrated
case, so the same unchanged intent can retry. The model makes no general claim
that every validation failure is retryable or terminal.

Keys are scoped to trusted Tenant, actor and intent. Report and correction are
distinct commands within the payload. Receipts retain only an equality witness
and minimal disposition/reference, not a copy of the old report body. The model's
SHA-256 payload witness is not a proposed sensitive-data storage or privacy design.
Current scope/read checks govern recovery and late-context rendering; they are
independent of permission to create, correct, route or record money.

## Cases and controls

| Cases | Unsafe shortcut | Corrected modeled outcome |
| --- | --- | --- |
| B01–B03 | Default-enabled creation, cached On, Off treated as absence of an accepted report, or automatic replay of an Off rejection. | Default Off; check current acceptance; recover accepted result; preserve rejected key; require deliberate new intent after enable. |
| B04–B06 | Reporter becomes financial owner; unknowns become defaults; equal-looking independent reports auto-merge. | Separate current powers, scoped honest unknowns with owned recovery, same-intent dedup and source-proved duplicate resolution preserving origins. |
| B07–B09 | One Done flag collapses physical and financial work; status repair reposts money; last writer wins a correction/resolution race. | Preserve independent dimensions and exact lineage; retain independently committed financial facts and accountable reconciliation in both orders. |
| B10–B11 | Source acceptance without its audit/receipt/intent, or recovery returns stale PII after correction/context change. | Assumed atomic local effects, retained source evidence, minimal immutable receipt and current disclosure. |
| B12–B13 | Missing source/recovery ownership invokes a local replacement or broadcast; a dated promise becomes actual receipt. | Keep activation/admission unavailable where required owner capability is missing; require an attributed actual-receipt assertion. |

Controls cover an ordinary source intake without money creation; authorized staff
correction and exact finance continuation while missionary reporting is Off;
physical handling resolved before recording; and exact retry versus an independent
separate report. The latter remains distinct unless the owner later proves that
the actual item is the same.

## Boundaries and limits

The model consumes attributed receipt assertions; it does not verify physical
truth or establish continuous custody. Recorder, reported holder and accountable
next work remain separate. Source evidence history is represented only as finite
fixture revisions; actual retention and lawful correction remain owner duties.

Financial records are independently committed fixture inputs. The model checks
exact source correspondence and status resolution but contains no money posting,
receipt, fulfillment, bank-clearing, matching or valuation implementation. Its
duplicate operation retains proved origins only: canonical redirects, multiple
posted duplicates, itemization, appeal fanout and shared-task reconciliation are
outside the model. Full incidental-edit, exception closure and correction folds
are also unimplemented.

Ordered schedules assume serialized atomic owner commands. A simulated failure
before local acceptance illustrates required all-or-none effects; it proves no
actual SQL/RLS, locks, transaction isolation, process crash, durable outbox,
concurrent execution or delivery guarantee. Role grants, settings authority,
clock/expiry checks, recipient directories, browser behavior and field-level
privacy are qualified inputs or untested surfaces. Policy-command retry,
cancellation, restore and mixed-version deployments are not implemented.

No application, database, provider, network, private data, older model or probe
is accessed. Passing these finite examples establishes no deployed grant,
producer availability, production reliability or release readiness. The
[P15](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md#d1-one-front-door-for-offline-money)
and [P27](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md#d25-requirement-contract)
owners retain all operational and financial authority.

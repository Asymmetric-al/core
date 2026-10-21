# D19 evidence — first-support history and permanent task meaning

Research checked October 16, 2026. This is bounded evidence for the selected
**first support for the ministry/project** answer. It is not a new financial
owner, a schema migration, an implemented producer, or release certification.

The simple product outcome survives the review: one useful personal follow-up
for the beginning of eligible support for that ministry/project, even when the
supporter has previously given elsewhere. The hard part is proving “first” and
preserving one obligation while facts arrive or change. Neither the missionary
nor a workflow author should configure a historical algorithm.

## Evidence and authority

Repository facts inspected directly:

- [Q19 research](../phase28-q19-first-support-follow-up-research.md) distinguishes
  this internal task from automatic thanks, consent, receipt and contact access.
- [P13 finality](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:987)
  distinguishes processing from posted provisional ACH and final money; missionary
  support defaults to settled-only for return-exposed ACH. First-support history
  must consume that exact owner-approved support basis, not infer receipt from a
  provider callback. P13 contribution and effective line truth remains upstream.
- [P14 roster](../../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:236)
  is intentionally time bounded: trailing 365-day support/typed commitments,
  display-only 365–730-day history, and drop after 730 days. It cannot prove
  first-ever support. Its [church-member ruling](../../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:1023)
  excludes member thank-you letters; a roster entry is not a general recipient
  eligibility grant.
- [P9 Ministry Project](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:1272)
  and [Ministry Assignment](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:1299)
  are typed identities with exact Tenant/Legal Entity scope. Ministry Assignment
  survives worker, spouse, household, login, employment and public-page changes.
  [P9 tasks](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:812)
  use shared task links and a tenant-scoped reverse index, rather than a second
  missionary-only task authority.
- [P16 initial gift](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:535)
  is an occurrence of a new recurring arrangement, not proof of first-ever support.
- [P27 research](../../../donor-development/grill/phase27-program-research.md:65)
  preserves completeness, raw-provider exclusion, shared purpose and suppression
  invariants. [WS-AT-018](../../../../prds/workflow-studio/10-acceptance-scenarios.md:213)
  says omitted earlier gifts leave first-gift truth unknown; the scenario is
  explicitly specified, not executed evidence.
- [IG-07](../../../../prds/program-roadmap/integration-guide.md:93),
  [WS-AT-044](../../../../prds/workflow-studio/10-acceptance-scenarios.md:527), and
  [WS-INT-06](../../../../prds/program-roadmap/delivery-contract.md:85) require
  permanent effect-owner identity across native/workflow callers and retries.
  Same-purpose work converges; genuinely different authorized organization and
  missionary purposes remain separate.
- [P35 boundary](../../../../prds/sitestacker-parity/roadmap.md:4843) requires
  completeness-qualified organization/designation history and source-defined
  posted/settled/qualifying meanings. Corrections/refunds do not restart a welcome
  journey; native P28 work does not wait for Workflow Studio.
- Current [portal source](../../../../../packages/api/src/missionary-portal/service.ts:194)
  reads at most 250 legacy donations, ordered by gift date. Current
  [legacy backfill](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:384)
  takes a donor-level minimum date without this subject/qualification contract.
  Current [manual task creation](../../../../../packages/api/src/missionary-portal/tasks.ts:69)
  writes `is_auto_generated: false`. These are observed code paths, not evidence
  of a production-qualified D19 source or an assertion that every deployment is
  identical. A working manual thank-you type does not settle financial semantics.

Primary technical documentation checked directly, not provider experiments:

| Source                                                                                                | Verified fact                                                                                                    | Relevance and limit                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Inngest idempotency](https://www.inngest.com/docs/durable-execution/guides-and-advanced/idempotency) | Event/function duplicate suppression lasts 24 hours; external work may succeed before a step records its result. | Durable business identity is still necessary. We did not run Inngest or validate a deployed SDK/version.                                                                          |
| [Stripe webhook delivery](https://docs.stripe.com/webhooks#event-ordering)                            | Delivery order is not guaranteed; equal event timestamps and duplicate delivery are possible.                    | Source-owner reconciliation must precede D19. Stripe is not the first-support authority, and this evidence authorizes no direct P28 Stripe consumer.                              |
| [PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html)                          | A limited query needs a unique order for predictable subsets; a deterministic subset is still a subset.          | Even perfect pagination ordering does not make a UI viewport complete history. Current documentation resolved to PostgreSQL 18; no assertion about the deployed Supabase version. |
| [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                | Composite uniqueness and foreign keys can enforce declared identity and relationship constraints.                | Constraints cannot prove imported history complete or determine the ministry's financial meaning. Actual transaction/RLS/concurrency proof remains required.                      |

## Minimal exact amendments

These clauses are proposed D19 requirements, coordinated with the financial-owner
research. They deliberately leave the owning service's physical schema and
approved recipient-role allowlist to the named source contract. That binding is
a release prerequisite, not permission to guess in P28.

**HIST-01 — Qualified subject and basis.** The native first-support task SHALL
consume a source-certified first-support fact for one exact Tenant, Legal Entity,
typed Ministry Assignment or Ministry Project, and source-qualified supporter.
Its basis SHALL be eligible positive effective monetary support on the exact P13
designation lines attributed to that subject under the owner-approved temporal
mapping, tender finality and missionary-support policy. Pending/failed payment,
commitment creation, match expectancy, noncash valuation, fee cover, unrelated
allocations, roster membership and contact import SHALL NOT independently qualify.
Legal donor, recognized supporter and permitted recipient SHALL remain distinct;
P14 exclusions and privacy rules continue to apply.

**HIST-02 — Unknown is not first.** A first-support fact SHALL state the scope and
coverage of its source-certified history, source revision and original event
provenance. An unknown earlier history, ambiguous supporter/subject mapping or
unqualified source SHALL hold automatic first-support admission. No UI viewport,
bounded roster, import timestamp, absence of visible rows, current assignment or
new recurring agreement SHALL prove first-ever support. Authorized manual
relationship work remains available without claiming a verified first gift.
An organization may resolve incomplete migration coverage only through the
financial/history owner's explicit evidence process; a P28 checkbox cannot
declare a closed world.

**HIST-03 — Ordering without fabricated chronology.** The owner SHALL resolve
effective support history using its qualified dating/finality contract, not
webhook receipt time, client clock or a fabricated universal timestamp. Multiple
eligible allocations/gifts beginning support for the same supporter and subject
SHALL converge to one first-support purpose. A source order or stable tie-breaker
may choose a reproducible evidence reference, but SHALL NOT be represented as
proof that one equal-date gift happened before another. Preserve other qualifying
evidence and re-prove when late facts change the current basis.

**HIST-04 — Stable purpose, separate operation.** One permanent, same-scope
first-support task purpose SHALL survive event redelivery, workflow publication,
worker changes, subject renaming, currency changes, retries and transport-cache
expiry. The effect owner SHALL enforce its semantic uniqueness atomically and
return/reconcile the accepted result after response loss. Financial evidence
occurrences, assignment revisions, communication intents and transport operations
SHALL remain separately identifiable. Their IDs SHALL NOT manufacture another
first-support task or collapse distinct authorized purposes. No new first-support
episode is created merely because a new allocation line, currency or recurring
agreement appears.

**HIST-05 — Prospective origin, not delivery time.** Historical imports/backfills
SHALL update the authoritative baseline without generating catch-up first-support
tasks or sends. A delayed originally live qualifying occurrence may be replayed
through its existing purpose when its original activation/provenance permits it.
Correction may repair and re-evaluate an originally live, still-unconsumed
occurrence; it SHALL NOT become a new acquisition occurrence or fresh effect key.
Historical provenance SHALL remain historical after correction or re-designation.
Changing a policy or enabling a producer SHALL NOT replay all historical gifts as
new support.

**HIST-06 — Correction preserves work history.** Refund, return, attribution repair,
re-designation, reversal and undo SHALL re-evaluate current source eligibility.
An invalidated pending cause SHALL become non-actionable with an authorized,
plain-language reason; it SHALL NOT stay a misleading ordinary thank-you task.
Retain the permanent purpose, original cause and accepted work history. Completed
or already communicated work SHALL NOT be erased, relabelled as never performed,
or automatically reopened by a zero balance followed by a later positive balance.
A still-unconsumed purpose may resume only after current source qualification;
correction is not automatic donor-facing communication or recall.

**HIST-07 — Identity changes preserve lineage.** Subject rename, participant/worker
change and account change SHALL NOT reset first-support history. A designation
change SHALL use source-owned historical attribution rather than repointing old
gifts to the current holder. Source-owned Party merges, splits, subject succession
and corrections SHALL reconcile affected purpose claims through retained lineage,
without rewriting historical source references, deleting performed work or granting
the successor new access. Overlapping pending claims SHALL not create duplicate
actionable obligations; previously performed duplicates remain truthful history
for authorized review. A new Ministry Project identity is not sufficient evidence
to reset an existing support relationship without its source succession meaning.

**HIST-08 — Task is human work.** Task display SHALL say **Thank Grace for beginning
support for [permitted ministry label]**, with a concise, permission-safe reason
and source link when available. It SHALL NOT call Grace a new organizational
donor unless that separate fact is qualified. Task completion SHALL record task
completion only; actual contact, sent/accepted/delivered message, response, gift
and receipt remain independent facts. Personal follow-up SHALL not auto-send or
grant contact details. The missionary sees one current owner and one understandable
task, with supporting financial detail progressively disclosed within permission.

**HIST-09 — No lost or fabricated work.** Required source admission, permanent task
claim, accepted receipt and required outbox intent SHALL have the qualified atomic
boundary; remote calls stay outside it. A worker crash or lost response SHALL
reconcile that purpose rather than re-create the task. Competing valid callers
SHALL converge, and conflicting bodies for the same purpose SHALL produce a
repairable conflict. Current source and assignment permission SHALL be re-proved
at consequential boundaries. A dispatcher attempt or queue acknowledgment is
not proof of either business completion or delivery.

## Eight material concerns and their exact resolutions

Likelihood is qualitative reasoning before amendments, not measured incidents.
Each concern includes failure, impact, severity, likelihood, evidence, effect on
the answer, permanent fix and exact language. Requirements above are the exact
language; the last column makes their proof falsifiable.

| Concern                                  | Failure and why it matters                                                                                                                                                  | Severity / likelihood                                         | Evidence                                                                      | Effect on A                                                            | Permanent fix / exact clause                                                    | Required independent proof                                                                                                                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-F1: False first from partial history   | A recent viewport/roster or incomplete migration labels an established supporter new, causing awkward repeated thanks and bad reporting.                                    | High / high if display data is reused.                        | Current 250-row portal; P14 730-day boundary; WS-AT-018; H01–H03.             | Narrows eligibility; retains A.                                        | Owner-qualified coverage and unknown hold, HIST-01/02.                          | Complete old history and identical visible incomplete histories produce different qualification; incomplete remains unknown. No first-task created by contact import or commitment-only roster.                                          |
| H-F2: Wrong identity or temporal mapping | A worker transition, designation reuse or current join transfers historical support and private evidence to the wrong ministry.                                             | High / medium; these are explicitly modeled lifecycle events. | P9 stable identities; P14 temporal mapping; H09/H10/H16.                      | Clarifies ministry/project identity; retains A.                        | Source history and scoped identity/lineage, HIST-01/07.                         | Rename/worker move creates no new first purpose; effective-date boundary uses correct subject; merge keeps references and suppresses overlapping pending work; cross-Tenant/LE and successor access denied.                              |
| H-F3: Race, ties and replay              | Two first gifts, split allocations, native/Studio callers or a replay beyond a provider cache create several tasks, or one global key hides a legitimate task.              | High / high without durable purpose uniqueness.               | IG-07, WS-INT-06, current Inngest/Stripe docs; H04/H05/H07/H08/H12–H14/H19.   | Requires convergence, not weaker task scope.                           | Stable purpose and atomic claim, HIST-03/04/09.                                 | Real PostgreSQL concurrent admission, same and conflicting bodies, repeat after 25 hours, response loss, same subject multi-line/currency and two different subjects. One purpose per eligible subject; distinct scopes remain separate. |
| H-F4: Correction resets first-ever       | Full refund, return or undo erases first work; a later gift causes another welcome, or an invalidated pending task stays actionable.                                        | High / medium.                                                | P13 append-only corrections; P35 no welcome restart; H15.                     | Changes lifecycle wording, retains A.                                  | Separate current eligibility from consumed purpose, HIST-06.                    | Refund before admission, before action and after completed/contacted work; undo and later gift; source-suspended unconsumed purpose can requalify without new identity. No erased work or automatic resend.                              |
| H-F5: Import time becomes event time     | An old gift imported today floods work, while a blanket correction/replay ban drops genuinely live work repaired after a delay.                                             | High / high for migration-heavy deployments.                  | WS-AT-018, P35 prospective rollout, H11/H20.                                  | Narrows event provenance, retains A.                                   | Preserve original live/historical origin and activation qualification, HIST-05. | Same corrected data with historical-import versus originally live provenance has different task-admission result. Late live source event remains recoverable; activation produces no historic catch-up.                                  |
| H-F6: Recipient and money shortcuts      | New recurring agreement, legal payer, recognition credit or full gift header becomes the wrong “first support,” leaking other allocations or thanking an ineligible person. | High / medium.                                                | P13 finality; P14 exclusion; P16 initial occurrence; H06/H07.                 | Requires exact source bindings; A does not ratify recipient expansion. | Consume qualified monetary/recognition facts only, HIST-01.                     | Processing ACH, exposed ACH policy, provisional check, match expectancy, church member, DAF payer/advisor, multi-subject split and anonymous supporter fixtures through real owners. Unsupported source arms fail closed.                |
| H-F7: Task/communication conflation      | Completing a task manufactures an interaction, a receipt suppresses a legitimate personal task, or a send retry makes another first-support obligation.                     | High / medium.                                                | IG-07 outcome distinctions; WS-AT-044; current manual task creation; H17/H18. | Clarifies expected human outcome.                                      | Distinct purpose and channel operation identity, HIST-04/08/09.                 | Task completion with no message creates no send history; receipt and personal follow-up can coexist; two callers requesting same personal obligation converge; uncertain dispatch is reconciled without channel fallback duplicates.     |
| H-F8: Hidden unresolved history          | Safe suppression silently loses useful work, or every gap produces an overwhelming exception queue.                                                                         | Medium / medium; product judgment, not observed workload.     | Unknown-history requirement plus current bounded UI and source ownership.     | Requires a small, truthful UX; retains A.                              | HIST-02/06/08/09 plus operational rule below.                                   | Authorized staff can identify and repair the source coverage problem; missionary sees an accurate task or permitted reason without inaccessible gifts/counts. Ordinary manual follow-up still works. No one-task-per-unknown-row flood.  |

## Simple operational treatment

Keep unresolved historical coverage at the owning migration/source scope, with
affected qualification visible to the authorized responsible staff. Do not create
a manual exception task for every old row or require every ordinary gift to be
reviewed. Existing source recovery handles delayed live work. Where a permitted
user needs an explanation, use **Earlier giving history is not yet verified**;
never use **First gift** as a synonym for **First gift we can currently see**.

For an invalidated pending task, a calm inline state such as **This gift changed;
this follow-up is no longer needed** is clearer than silently deleting it. A source
link/details disclose only what that viewer may read. A completed item retains its
completion and may show a permitted correction note. Do not show raw ledger
sequence numbers, provider errors or invisible donor identities as explanations.

The eight concerns require specification and release proof, not monitoring in
place of a fix. Useful residual monitors are: **any duplicate actionable task for
one owner-qualified purpose** (threshold 1; task-domain owner stops new admission
for the affected producer and reconciles receipts); **any historical-import
origin admitted as a live first-support purpose** (threshold 1; finance/integration
owner disables affected source adapter and repairs provenance); **any completed
purpose reopened by correction/undo** (threshold 1; task-domain owner disables
that transition and restores truthful history). These zero-tolerance thresholds
are proposed invariant monitors, not observed failure rates. Security/source
qualification is still a release gate.

## Executed counterexamples and remaining proof

Ran [history-probe/probe.py](history-probe/probe.py) with Python 3.12.14:
**20/20 bounded synthetic counterexamples reproduced**; exact observations are in
[results.json](history-probe/results.json). The probe shows incomplete views,
indistinguishable unknown histories, out-of-order and tied dates, recurring versus
ever-first confusion, allocation/currency overcount, mutable identity/mapping,
import timestamps, transport identities and cache expiry, check-then-insert races,
refund/undo history, merge overlap, purpose/channel distinction, task/send
distinction, missing scope and correction-origin ambiguity.

This is intentionally a counterexample probe, not a miniature correct
implementation. Its explicit interleaving does not test real database isolation.
Its list/set examples do not qualify RLS, merges, financial folds, recipients,
source coverage, task concurrency, provider delivery or production capacity. No
live service, real donor data, provider call, new dependency or schema was used.

Before implementation can be called qualified, run the listed owner-shaped cases
through the real P13/P14/P9/P16 sources and shared task boundary, including current
permissions, late facts, recovery and actual Postgres races. Verify a coverage
certificate cannot be caller-forged, a semantic claim cannot move tenants or
subjects through UPDATE, historical-import status cannot be changed into live by
generic edits, and service-role paths enforce the same source boundaries. Bind
source revisions and audit evidence without copying donor history into a second
P28 ledger. Measure query plans and resource use on complete histories; do not
replace lifetime history with an arbitrary performance lookback or report a
synthetic probe as a measured production limit.

**Disposition for this evidence scope: Accept with required amendments.** The
selected ministry/project basis is useful and coherent. Exact historical scope,
coverage, original provenance, permanent purpose and correction semantics must
be recorded with it. Financial and recipient source bindings remain explicit
implementation qualification prerequisites; this evidence does not invent or
certify them.

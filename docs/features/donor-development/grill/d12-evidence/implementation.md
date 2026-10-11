# D12 implementation evidence — direct current-stage selection

**2026-10-10**, checkout `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
A permits choosing an appropriate currently available stage directly, including
skipping and returning, while retaining history. This appendix reviews source and
isolated mechanics; no product, migration, existing application database or provider was changed.

## Simplest implementation direction

Use one narrow native source command accepting the intended eligible target and
expected current journey version, with a retained business-effect identity for
transport retry. Accept the direct from/to event, required provenance and outcome
atomically. Do not traverse list positions, synthesize intermediate visits or
create an allowed-transition matrix for A. D10's display order remains presentation.

A later return is another real occurrence. Retrying an old occurrence is not.
An unchanged current stage is not a fresh assessment. A historical successful
receipt must remain distinguishable from the current authorized source state.
These distinctions need no workflow engine, universal funnel mapping, per-stage
schema, new event-sourcing platform or automatic migration facility.

## Fresh bounded source inventory

Searches for `cultivation`, `stage.entry`, `stage.requirements`,
`development.stage`, `stage_history` and `stageHistory` in API/database packages,
admin/missionary apps, migrations and unit tests found no matching P27 implementation.
This is a bounded checkout observation, not proof about every deployed system.
Existing names resembling stages were then inspected directly:

| Source inspected                                                                                                                                               | Actual behavior; limit                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Demo collection](../../../../../packages/database/collections/admin-workspace.ts:10), stage at line 35, activities at line 17                                 | Explicitly local-only workspace demo with five hardcoded sales stages and a generic `stage_change` activity type. No accepted occurrence identity, from/to history or source command is established by that type.                                                                                                                                |
| [CRM board](<../../../../../apps/admin/app/(app)/crm/kanban-view.tsx:29>), card action line 74                                                                 | Builds columns alphabetically from loaded donor statuses; clicking opens a record. It is not an implemented cultivation drag/update command.                                                                                                                                                                                                     |
| [CRM read model](../../../../../packages/api/src/admin/crm/model.ts:41)                                                                                        | Maps donor status to `lifecycleStatus` and donor `updated_at` to `lastTouchAt`. Neither supplies journey stage history or verified contact time.                                                                                                                                                                                                 |
| [Missionary donor update](../../../../../packages/api/src/missionary-portal/donor.ts:174), payload line 73                                                     | Scopes an existing donor update by donor/tenant/missionary and privacy condition; updates the broad donor payload and timestamp. No journey revision, occurrence or atomic stage-history contract is present. This is not a finding that its own donor contract is defective.                                                                    |
| [Generic table helper](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-mutation.ts:89), rollback line 167                         | Direct browser table mutation; failure restores a cached whole-list snapshot. This helper does not establish D12 business acceptance; no actual P27 consumer is demonstrated.                                                                                                                                                                    |
| [CRM note command](../../../../../packages/api/src/admin/crm/notes/service.ts:190), log sequence line 224                                                      | Dedupe uses supplied request ID; note insertion and command logging are separate writes. The [route](../../../../../packages/api/src/admin/crm/notes/index.ts:52) receives a [fresh request UUID](../../../../../packages/api/src/shared/with-operation.ts:128) from its wrapper. Correlation is not automatically stable across client retries. |
| [Detail cache](../../../../../packages/database/hooks/admin-crm-detail.ts:85), [loaded grid](../../../../../packages/database/hooks/admin-crm-infinite.ts:192) | 30-second stale windows, focus-refetch disabled; loaded grid retains previous data. Note success invalidates related keys. Useful infrastructure, not cross-tab current-state or stale-receipt rendering proof.                                                                                                                                  |

The native [data boundary](../../../../guides/architecture/data-access-boundary.md)
places multi-table/history operations behind source commands. D11 selector results
remain prior UI evidence; no reason was found to repeat them for D12.

## Findings, exact corrections and required proof

Severity describes prospective consequence if a pattern is reused. Likelihood
is engineering judgment, not observed production incidence. All retain A.

**I01 — Wrong source or accidental sequencing. High / plausible.** A developer
could rename the donor status or traverse the five-value demo enum. Neither models
the selected particular partnership or independent visits (inventory above).
**Clause:** “Resolve the current journey and approved eligible stage by scoped
identity. One direct selection SHALL create at most its actual from/to transition,
never inferred intermediate transitions, contact, completion or donor agreement.”
**Proof:** A→D has one event; presentation reordering changes neither permitted
selection nor source meaning. Exercise all admitted source writers, not just UI.

**I02 — Destination dedupe erases genuine return. High / plausible.** A lifetime
unique key on journey plus stage looks attractive but collapses repeated visits.
The fresh probe demonstrates three intended B,A,B occurrences retaining only two
rows under that shortcut. **Clause:** “Distinct accepted occurrences SHALL remain
distinct even when the destination or from/to pair repeats. Same-intent delivery
SHALL deduplicate by qualified business-effect identity, not destination.”
**Proof:** preserve A→B→A→B with separate accepted events; concurrent duplicate
delivery adds none; changed intent under the same key conflicts. Probe checks 1–2,
4–5, 8 and 14 establish only synthetic mechanics, not Core enforcement.

**I03 — Same value and historical correction confused. High / plausible.** The
existing donor payload refreshes `updated_at` on edit; that must not become a
stage-assessment clock. **Clause:** “An unchanged recorded stage SHALL not create
a new visit, assessment, contact date or downstream effect. An actual later return
SHALL preserve the earlier visits. Correction/backdating remains its own qualified
operation.” **Proof:** compare recorded state/history before and after same-value
selection and retry; unknown historical dates stay unknown. Probe checks 6–7 cover
the value/clock distinction, not duration/reporting or historical correction policy.

**I04 — Old successful response regresses current understanding. High / plausible.**
Whole-list optimistic rollback and old response application are unsafe precedents
for repeated visits. **Clause:** “An old receipt SHALL describe its historical
accepted outcome without presenting it as the present stage or overwriting a
newer revision. Readback SHALL obey current disclosure authority.” **Proof:** after
A→B→A, retry the first command: acknowledge original B acceptance while current A
remains. Repeat for an old no-op B receipt after a later C. Probe checks 4/7 prove
database separation; real UI, caches, events and revoked access remain untested.

**I05 — Retry or audit split duplicates/loses history. High / plausible.** The
nearby note service's separate insert/log calls and per-request correlation ID
cannot be adopted as atomic stage receipts. **Clause:** “Accept the source value,
necessary history, outcome and required secondary intent together; retain the
command identity across unknown transport outcomes. A failed response is not
proof that no change committed.” **Proof:** rollback after writes, response loss,
same-key/different-payload conflict and concurrent duplicate delivery. Probe 8/12/14
covers bounded transaction mechanics; no provider delivery or client retry occurred.

**I06 — Stale editors despite an apparently unchanged stage. High / plausible.**
Existing donor updates have scope filters but no cultivation expected revision.
After A→B→A, comparing only the visible old/current A would miss intervening work.
**Clause:** “Validate current authority, expected journey version and destination
eligibility at source acceptance; reject stale intent with useful permitted
recovery. Coordinate with retirement; never silently choose a neighboring stage.”
**Proof:** a new revision-0 intent rejects after the journey returns to A/revision 2,
even though the visible stage matches. Test concurrent editors and both retirement/
selection orders, plus actual P12 scopes. Probe 3/9/13 covers stale revision;
D10 retirement tests remain prior evidence. Policy qualification belongs to the
authorization appendix, not this owner-only fixture.

**I07 — Reports confuse order, visits and contact. High / plausible.** Loaded-row
column counts and donor `updated_at` cannot establish stage totals, time in stage,
meaningful contact or a monotonic funnel. **Clause:** “Current-stage views SHALL
count current authorized journeys; transition history SHALL preserve actual visits
without counting skipped stages. Reports SHALL state their population and event
basis; current display rank or identical labels SHALL not imply advancement.”
**Proof:** revisits, missing dates, reordered/retired definitions and limited views
produce explainable outputs without inventing dates or double-counting current
journeys. Exact duration metrics remain a later decision; this probe tests no report.

**I08 — Mock success overstated as source proof. High / plausible.**
[CRM-note dedupe tests](../../../../../tests/unit/packages/api/crm-notes.test.ts:303)
use a [memory store](../../../../../tests/unit/packages/api/crm-notes.test.ts:48)
and injected repeated request ID. [Donor mutation tests](../../../../../tests/unit/packages/api/missionary-portal/donor-mutations.test.ts:18)
mock query chains. They are useful checks of their contracts, not actual database
isolation, concurrent effects or future P27 behavior. **Clause/proof:** qualify
the real source command through nonowner roles/API paths, denied direct writes,
current policy, races, recoveries, actual consumers and supported sizes before
activation. Do not relabel unrelated passing tests as D12 coverage.

## Fresh execution and limitations

The [isolated probe](stage-visit-probe/README.md) passed **14/14 checks on PostgreSQL
17.11**. Exact source, raw observations, input hashes, image digest and cleanup are
retained, including the earlier successful 13-check run before the added explicit
A→B→A stale-editor check. The probe includes a failing-design counterexample and
two controlled lock interleavings; it is stronger evidence of those mechanics
than a mocked selector test. It remains a purpose-built toy experiment, not
independent evidence that its chosen protocol is complete or best for Core.

No P12/RLS/application authorization, Supabase/PostgREST API, task/ask/notification,
browser, migration, performance or actual duration report was exercised. The
fixture runs as owner and contains none of those sources. No hosted or existing application database was
queried. Cleanup was verified. No product feature or formal schema was introduced.

Fresh primary grounding on 2026-10-10: PostgreSQL 17
[transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html)
documents locking/rechecking updated rows; [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
documents uniqueness/reference guarantees. Neither selects Core's business key.
The Supabase [changelog index](https://supabase.com/changelog.md),
[17.11 notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
(2026-09-25) and [API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
(2026-04-28) were read. The toy needs no affected extension; actual deployed grants
and project version remain unverified. Explicit grants and RLS are separate
checks, and generic skill summaries do not replace PostgreSQL's effective policy
semantics. No extension, platform upgrade or extra permission system is required
by choosing direct stage movement.

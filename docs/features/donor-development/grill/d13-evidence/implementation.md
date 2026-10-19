# D13 — initial assessment, readers and bounded database evidence

2026-10-10; source revision `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
Research only. The founder selected A: deliberate partnership work may begin
without a known stage. This appendix supports **accepting A with the inherited
safeguards**. It does not select a physical schema, stage default, clearing policy,
new task, review deadline, workflow engine or formal specification.

The simplest sound meaning is: **“Not yet assessed” describes a valid journey
without a recorded assessment. It is not a tenant stage or a fallback for failed,
incomplete or restricted reads. Required identity, authority, responsibility and
follow-up remain unchanged. A later first assessment records only what actually
happened; an old start request cannot reset it.** This is recommended interpretation
of Q13 plus D4/D10–D12, not a demonstrated feature.

## Current source and why generic reuse needs qualification

The fresh scoped source search found no P27 cultivation/current-stage/history
implementation in API/database/admin/missionary source or SQL migrations. The
existing [demo collection](../../../../../packages/database/collections/admin-workspace.ts:10)
explicitly declares local-only data and requires a fixed stage enum at line 35.
The [donor mutation](../../../../../packages/api/src/missionary-portal/donor.ts:25)
requires donor lifecycle status. Neither requirement decides journey assessment.
The original [donor migration](../../../../../supabase/migrations/20250101000000_init_schema.sql:62)
defines donor status/defaults, not a journey stage. It must not be treated as a new
P27 schema or evidence of current deployed grants.

The [CRM model](../../../../../packages/api/src/admin/crm/model.ts:41) passes donor
status through as `lifecycleStatus`; it uses donor `updated_at` for last touch and
leaves next task null. Its numeric helper at line 26 converts null/nonfinite values
to zero. These are source observations, not suitable P27 assessment, aging or
follow-up semantics by inference.

The [board](<../../../../../apps/admin/app/(app)/crm/kanban-view.tsx:29>) derives and
sorts columns from provided rows, substitutes “Unknown,” and counts those rows.
The [table](<../../../../../apps/admin/app/(app)/crm/columns.tsx:165>) substitutes N/A;
its local filter at line 182 lets a falsy value pass. The server instead applies
[status `.in()` filtering](../../../../../packages/api/src/admin/crm/service.ts:56).
The [infinite reader](../../../../../packages/database/hooks/admin-crm-infinite.ts:192)
retains previous data, caches eight pages, and flattens loaded pages at line 210.
These are concrete integration cautions, not proof that P27 already miscounts.

## Findings, exact corrections and meaningful acceptance proof

Severity/likelihood are qualitative engineering judgments about an unqualified
implementation; they are not measured incidence or current exploit findings.

**I1 — Optional stage accidentally makes scope optional. High / plausible.**
Fresh [PostgreSQL constraints documentation](https://www.postgresql.org/docs/17/ddl-constraints.html)
and probe cases 1–3 establish that nullable composite references require care.
The inadequate `MATCH SIMPLE` example accepted a missing preset; blanket `MATCH
FULL` rejected a valid unassessed tuple. Independent required scope references
worked. **Clause:** “Assessment may be absent; required journey identity and
applicable scope must remain valid and non-null, with equivalent integrity across
all writes. Absence is not part of journey deduplication identity.” **Proof:**
actual migrations/commands accept the valid unassessed case and reject omitted,
null, nonexistent and foreign tenant/entity/preset references. The toy's parent
layout is an example, not a ratified tenant/preset model.

**I2 — Null becomes a permission exception. High / plausible.** Probe cases 4–5
reproduced an unsafe OR-null policy and tested a scoped nonowner policy's old-row
and resulting-row behavior. **Clause:** “Not yet assessed grants no additional
read, edit or start authority; all resulting source links remain authorized.”
**Proof:** qualify real P12/API/direct-write paths with unassessed foreign/hidden
rows, reassignment, stale authority and denied disclosure. The toy uses a fixed
tenant role; it does not qualify Core. [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
correctly applies `USING` to resulting rows when applicable `WITH CHECK` is omitted.
An omitted explicit check is not, by itself, a bypass.

**I3 — Omission, explicit absence and clearing collapse. High / plausible.**
[JSON extraction](https://www.postgresql.org/docs/17/functions-json.html) and case 6
show missing and explicit-null fields can both extract as SQL null. The generic
[select cell](../../../../../packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx:47)
can emit null when configured clearable; its default is false. **Clause:** “Define
initial absence deliberately; omission in a later partial update must not clear an
assessment, and selecting A does not authorize clearing an existing stage.”
**Proof:** actual decoder/command tests distinguish start-unassessed, omitted field,
explicit null, empty/invalid stage and ordinary assessment. Preserve existing stage
when unrelated edits or admission retries omit it. Do not add a correction flow
or required explanation solely to solve decoder ambiguity.

**I4 — Readers erase or falsely label journeys. High / likely if copied blindly.**
[Join semantics](https://www.postgresql.org/docs/17/queries-table-expressions.html)
and case 7 demonstrate four source rows becoming one under a selectable-stage
inner join. The missing joins represented actual absence, retirement and restricted
visibility. **Clause:** “Use authoritative assessment state, not a missing joined
label, to identify Not yet assessed. Preserve eligible unassessed rows; show permitted
retired references accurately and handle unavailable/restricted data according to
the owning policy.” **Proof:** actual detail, board, table, export and filtered reads
cover all four conditions plus loading/error/stale response. Diagnostic fixture
IDs/labels are not a proposed disclosure format. No invisible donor or stage may
be inferred through a user-visible total or error.

**I5 — Incomplete counts, null filtering and cursor boundaries mislead. Medium–high /
plausible.** Current server [cursor handling](../../../../../packages/api/src/admin/crm/service.ts:80)
uses an ID-only comparison when the cursor value is null; ordering separately sets
null placement at line 179. No future nullable-stage paging guarantee follows.
Case 8 distinguishes total 4, assessed 3 and unassessed 1; it does not test the API.
**Clause:** “Unassessed work remains findable, with honest authorized scope and
coverage. A loaded-page count is labeled as such; classification counts must not
silently drop absence. Null ordering and filters have consistent server/consumer
meaning.” **Proof:** exercise several pages spanning assessed/unassessed boundaries
in both sort directions, including IDs that do not match stage order; compare full
authorized results and exports, without skips/duplicates. Test dedicated unassessed
filter, combined filters, zero matches, partial load and failed reads. No special
new dashboard or always-visible board lane is selected here.

**I6 — Missing assessment becomes fictional progress or zero duration. High /
plausible.** Case 9 has a start receipt and no initial stage event/time; case 10 has
exactly null→A. [Aggregate semantics](https://www.postgresql.org/docs/17/functions-aggregate.html)
and case 8 distinguish no known samples/null average from one measured zero.
**Clause:** “Starting unassessed does not record an entered tenant stage, assessment
time or duration. First assessment records the chosen stage and accepted occurrence.
Unknown duration is not zero; absent classification is not lost, inactive, paused,
or completed work.” **Proof:** inspect real source/history/reports before and after
first assessment and replay; show denominator/coverage and distinguish measured
zero. Detailed aging, backdating and historical-import formulas remain undecided.

**I7 — Old start or simultaneous first assessments overwrite truth. High /
plausible.** Cases 10–15 show one atomic first assessment, preserved historical
start receipt, same-intent retry, rejected null/retired intent, rollback and one
controlled two-writer conflict. **Clause:** “Admission retry preserves any later
assessment. First assessment follows current authorization, eligibility, expected
revision, atomic history and stable effect identity. A historical receipt is not
instructions to restore its old current state.” **Proof:** real API tests for
lost response/retry after assessment, competing first choices, revoked authority,
retired target and interrupted transaction; no extra event, phantom stage or silent
last-write-wins result. Generic D12 movement proof was not rerun unnecessarily.

**I8 — A boolean schema change is mistaken for rollout readiness. High / plausible.**
No P27 implementation was found. Existing demo enums, lifecycle mutators, cache,
read/error and list contracts have different meanings. **Clause:** “Qualify the
actual command, data readers, history, permitted consumers and mixed existing data
before activation; leave legacy unknown provenance distinct from deliberate new
unassessed admission.” **Proof:** generated types and actual migrations align;
readers tolerate the new valid state before writes enable it; historical records
are not silently backfilled as first stage, zero age or consciously unassessed.
Backward-compatible deployment/rollback and supported-size query plans require
later real implementation evidence, not this toy fixture.

## Executed evidence and boundaries

The [fresh isolated probe](initial-assessment-probe/README.md) passed **15/15** on
PostgreSQL 17.11 at 13:17:42–13:17:48 UTC, with input hashes, raw observations,
image/isolation metadata and verified cleanup. Passing includes successfully
reproducing deliberately failing designs. The mutation/replay mechanism is synthetic
and runs as owner; the nonowner RLS cases are separate. There is no Supabase Auth,
PostgREST, Core P12, real admission/deduplication, task/ask/notification, application
UI, migration or performance qualification. No live database was read or changed.
Fresh official PostgreSQL 17 pages linked above were retrieved on 2026-10-10;
these living references provide no article publication date. Core source and the
accepted decisions provide the product meaning, not PostgreSQL documentation.

Requiring an appropriate stage before every admission remains the strongest bounded
alternative: fewer nullable readers, but a truthful choice must always be available.
That implementation convenience does not outweigh A's accepted purpose. A needs
careful source/read contracts, not an “unassessed” catalog stage, new state engine,
automatic assessment task, escalation policy or routine approval ceremony.

# D14 — additional approved lists: source boundaries and mechanics

2026-10-10; repository revision `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
Research only. The founder selected A: organizations may add approved stage lists.
This appendix supports A with inherited safeguards; no product, formal schema,
API, deployment or workflow is introduced.

Recommended core clause: **“An authorized organization may create an additional
stage list for a real process need. Each partnership retains one applicable list
and one shared recorded stage; list creation does not create, duplicate, reassign
or reassess partnership work. Lists, stages and creation intents have stable,
distinct identities. Names and order do not establish identity or cross-list
equivalence.”** Scope/applicability, defaults, copying, lifecycle and switching
remain dependent questions; this review does not silently settle them.

## What current source establishes

Fresh inspection of `packages/api/src/admin/crm`, database CRM types, the admin
demo collection and SQL migrations found no production cultivation stage-list
creation contract. Matches for staged gifts are unrelated. The
[demo collection](../../../../../packages/database/collections/admin-workspace.ts:10)
is explicitly local-only and uses a fixed stage enum at line 35. The current
[shared CRM grid](../../../../../packages/database/types/crm-grid.ts:4) has donor
lifecycle status, not journey/list/stage identity; the [model](../../../../../packages/api/src/admin/crm/model.ts:41)
maps that status from the donor. These surfaces cannot establish P27 readiness.

The [named-view migration](../../../../../supabase/migrations/20260611170000_crm_table_named_views.sql:1)
explicitly describes personal-only view snapshots, unique per user/table/name.
[View-setting resolution](../../../../../packages/api/src/admin/crm/table-preferences/view-settings.ts:11)
falls back from user preference to tenant and system defaults. That is useful
presentation infrastructure, not a model for giving one partnership different
stages or lists according to its viewer. The [board](<../../../../../apps/admin/app/(app)/crm/kanban-view.tsx:29>)
groups by status text and sorts alphabetically. Copying that grouping would not
preserve additional lists' independent identities.

The [generic mutation hook](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-mutation.ts:80)
offers direct single-table insert/update/upsert operations. The existing
[CRM note service](../../../../../packages/api/src/admin/crm/notes/service.ts:190)
uses request ID for retry lookup, inserts at line 224 and separately logs at line 256. Its [route](../../../../../packages/api/src/admin/crm/notes/index.ts:52) supplies
the wrapper's [fresh request UUID](../../../../../packages/api/src/shared/with-operation.ts:128).
Those facts do not supply stable user-intent retry or a transaction covering a
new list, stages and configuration history. Existing components can be reused at
their actual seams; their names do not prove the required effects.

## Graded concerns, bounded clauses and proof

Severity and likelihood below are qualitative judgments about an unqualified
implementation. They are not observed incidents or defect claims against a
nonexistent P27 implementation.

**I1 — A valid stage belongs to the wrong list. High / plausible.** Probe cases
1–2 reproduce a same-tenant mismatch allowed by separate list and stage FKs, then
reject it using composite membership. **Clause:** “All stage references must belong
to the journey's applicable list and tenant; valid individual IDs are insufficient.
List scope remains required even with no assessment.” **Proof:** qualify actual
write/API paths with same-label stages from another list, foreign lists/stages,
unassessed source rows and matching valid references. [PostgreSQL composite
constraints](https://www.postgresql.org/docs/17/ddl-constraints.html) support this
mechanism, but no specific physical key layout is selected. D13's nullable-reference
proof need not be rerun absent new behavior.

**I2 — Labels become identities or false retry receipts. High / plausible.** Cases
3, 5–7 and 13 distinguish a display name, list/stage identity and tenant-scoped
create-intent key. A name-key conflict-do-nothing example silently merges distinct
intents. **Clause:** “A retry of the same authorized create intent returns the same
accepted result. Changed intent under that key conflicts. A separate request with
the same label is not assumed to be the old request.” **Proof:** actual HTTP lost
response/retry and concurrent delivery produce one result; different payload does
not silently succeed; equal labels follow the explicit naming policy, with an honest
conflict if uniqueness is required. The fixture permits equal names only to expose
identity distinctions; it does not ratify a duplicate-name policy. No display label
or rank may serve as a hidden cross-list mapping.

**I3 — Creation publishes a partial or falsely successful list. High / plausible.**
The existing generic mutations and separately logged notes do not prove a compound
transaction. Cases 4, 8–9 and 12 demonstrate coherent list/stage/configuration-history/
receipt persistence, two rollback points and no partial visibility. **Clause:**
“An accepted usable list and its required stage definitions/configuration history
must become available coherently. A failure must not leave a usable half-list or
successful receipt for unapplied configuration.” **Proof:** actual create command
fails within stage persistence and before commit; a concurrent reader sees either
the prior state or the complete accepted result. Recovery identifies the actual
outcome without blind duplication. [Transactions](https://www.postgresql.org/docs/17/tutorial-transactions.html)
and [INSERT conflict behavior](https://www.postgresql.org/docs/17/sql-insert.html)
support the toy mechanism. They do not require draft/publish/approval states; if a
draft lifecycle is later selected, incomplete drafts must not masquerade as usable
approved lists.

**I4 — Configuration authority grants donor access or progress powers. High /
plausible.** Case 10 shows a nonowner metadata privilege can be kept separate from
journey reads/writes; it is not Core P12 evidence. **Clause:** “Organization list
configuration is an explicit authorized capability. It does not grant journey,
supporter, gift, task or restricted-history access, and creating a list does not
change permission inheritance.” **Proof:** real P12/service/API/direct-access tests
for configuration-only, journey-only, denied and stale-authority actors; tenant-safe
receipt lookup and errors. No implicit admin role or new approval queue follows
from the fixture role name. The new list is ordinary organization configuration,
not a new security boundary for partnership records.

**I5 — New list becomes duplicate partnership or automatic reassignment. High /
plausible.** Q14 preserves D3/D4 identity and D9–D13 history. Case 14 checks source
journey/list/stage/revision/history are unchanged by all successful list creates.
**Clause:** “Adding or viewing a list does not create another record for the same
work, replace an assigned list, reset assessment, reopen work or change ownership.
The list ID is not an extra ordinary-journey deduplication dimension.” **Proof:**
real creation leaves existing work/tasks/asks/permissions/history unchanged; the
same partnership appears coherently to authorized staff and missionaries. Any
later applicable-list selection or switch must use its separately qualified source
command. The fixture deliberately has no ministry/purpose business key and cannot
prove real duplicate prevention or decide lifetime uniqueness.

**I6 — Reports merge equal labels or hide incompatible meaning. Medium–high /
likely if label grouping is copied.** Case 11 merges two stage identities named
Engaged into one label count; list/stage grouping retains both. The experiment
does not establish whether any real labels have equivalent meaning. **Clause:**
“Keep list/stage provenance where grouping needs it. Matching names or positions
do not establish comparable progress, likelihood, outcome or stage duration.”
**Proof:** same-label/different-ID fixtures remain distinguishable in relevant
authorized board filters, reports and exports; renaming/reordering does not rewrite
history or recalculate an implied common funnel. A broad total can remain a total
where its meaning is valid; no mandatory mapping engine or artificial universal
stage model is introduced to make all lists comparable.

**I7 — Caches and viewers choose different truths. High / plausible.** Current
[query keys](../../../../../packages/database/hooks/admin-crm-infinite.ts:192) reflect
the existing CRM filters and sort, with previous-data retention; they contain no
future stage-list contract. **Clause:** “Applicable list and recorded stage are
source facts. Scoped catalog reads, caching and authorized consumers must preserve
that identity, with loading/stale/error states shown honestly.” **Proof:** two
authorized viewers of one partnership see the same accepted list/stage; a newly
created list is discoverable only where qualified, without stale cross-scope labels,
permission leakage or silently inferred application. Personal saved views may alter
presentation, never select the partnership's list by fallback.

**I8 — List capability expands into an unfinished workflow system. Medium–high /
plausible.** The selected capability does not determine list retirement, copying,
template updates, switching, stage mapping, tenant assignments or initial defaults.
**Clause:** “Provide bounded organization configuration through the existing source
and shared UI boundaries; keep pending policies explicit. Do not add per-list tables,
per-view models, scripts, automatic tasks or mandatory approvals.” **Proof:** later
implementation has an explicit supported-size contract for lists/stages/payloads,
bounded queries and actual plans at representative scale, migration/rollback-safe
types and qualified consumers. No invented fixed quota, latency target or workload
statistic is established by this tiny experiment. Readiness requires those concrete
choices, not the existence of a passing toy SQL function.

## Actual execution and recommendation

The [new isolated probe](list-creation-probe/README.md) passed **14/14 checks** on
PostgreSQL 17.11 at 13:54:51–13:54:56 UTC. Input hashes, raw outcomes, exact lock
barrier, pinned image and verified container removal are retained. Passing includes
the expected reproduction of deliberately insufficient designs. Creation runs as
the isolated owner; the nonowner grant check is separate. There is no Supabase
Auth/PostgREST/P12, Core migration, real donor data, HTTP transport, UI, cache,
performance or full concurrency qualification. No existing application database
was read or changed. D10–D13 passing suites were not repeated.

Fresh official PostgreSQL 17 sources linked above were retrieved 2026-10-10;
they are living documentation without article publication dates. Current Core
source anchors establish reuse limitations, while accepted founder decisions
establish product scope. The fixture is authored evidence for bounded mechanisms,
not independent proof its design is complete or best.

The strongest simpler alternative is B: customize supplied lists and use guidance
plus direct stage selection for variation. It avoids another configuration surface,
but can force a confusing combined list where processes genuinely differ. Honor
A with additional lists as a modest organization capability and ordinary shared
lists as the starting point. Identity, atomicity and coherent readers are necessary
to make that flexibility trustworthy; a generalized workflow engine is not.

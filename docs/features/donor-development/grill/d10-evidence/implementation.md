# D10 implementation and database evidence

2026-10-10; research only; source HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. The user selected B: authorized tenant
configuration may add, retire and reorder stages, preserving existing records
and meaning. D8 reopens the same journey; D9 retains its recorded stage without
fresh assessment. No app code, migration, live database or provider was changed.

**Recommendation:** retain B with a small governed relational configuration
model. Current source provides useful transaction, scoped configuration and
cache patterns, but does not prove an implemented P27 stage catalog. Do not
turn custom stage lists into configurable transition rules, new permissions,
personal pipelines, automatic outreach or a generic workflow engine.

## Evidence and reuse limits

Repository-relative paths below were inspected directly. Bounded searches in
`packages`, `apps` and SQL migrations for stage lists/definitions, cultivation
stages and development presets found no target implementation. Searches for
`getFieldCatalog`, `field_definitions`, `custom_field_definitions`,
`option_set_id` and `field_option` in API/database/SQL paths likewise found no
P11 implementation. These searches do not prove absence under every synonym or
establish deployed state.

| Source                                                                                                                      | Observed behavior and limit                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/database/collections/admin-workspace.ts:10–12,26–41,772–779`                                                      | `New/Contacted/Meeting/Proposal/Won` is a hard-coded demo contact enum backed by seed reads. It is not the approved P27 preset or a tenant configuration store. The mobilization enum at `:174–185` is another domain.                                                                                                                                                                             |
| `packages/api/src/admin/crm/model.ts:41–69`; `service.ts:23–30,46–58`                                                       | CRM `lifecycleStatus` maps donor status; filter/sort targets `donors.status`. This is neither stage identity nor a cultivation history boundary. `lastTouchAt = updated_at` is not proof of contact.                                                                                                                                                                                               |
| `apps/admin/app/(app)/crm/kanban-view.tsx:29–41,48–69`                                                                      | Board columns are distinct labels in loaded rows, alphabetically sorted; counts use that subset. It does not consume configured order, show authoritative empty stages or establish full stage totals.                                                                                                                                                                                             |
| Staff CRM `columns.tsx:165–192`, `page-client.tsx:332–337`; `packages/api/src/missionary-portal/donor.ts:25–38,73–100`      | Staff filters hard-code active/inactive; missionary donor editing uses Active/Lapsed/New/At Risk. Reusing these status controls would conflate separate donor and cultivation meanings.                                                                                                                                                                                                            |
| `packages/api/src/admin/crm/table-preferences/route.ts:30–56,243–300`; `view-settings.ts:244–281`                           | Gift-history configuration has finite validated settings, a specific capability and explicit delegates. This is useful separation of personalization and tenant authority; its capability/delegation is not permission to configure P27 stages.                                                                                                                                                    |
| `supabase/migrations/20260611160000_crm_table_preferences.sql:19–41,182–237,249–309`                                        | Tenant defaults have tenant/table uniqueness. One RPC takes a transaction advisory lock, locks current data, rechecks configured delegate eligibility, writes configuration and audit together. It accepts a server-supplied capability boolean and has no expected catalog revision or stable command receipt. Copy the atomicity pattern, not assumed P12 coverage or a lost-response guarantee. |
| Same migration `:47–57,311–354`; `20260611170000_crm_table_named_views.sql:5–28,349–413`                                    | Checked-in tables enable RLS, revoke browser grants and grant service role; RPCs revoke PUBLIC execute and grant service role. These are source declarations, not a hosted grant inventory. Privileged caller parameters remain the server's responsibility.                                                                                                                                       |
| `packages/api/src/admin/crm/table-preferences/named-views.ts:20–26,91–100,127–138`; named-view migration `:119–169,196–244` | Named views are personal gift-history snapshots with scoped RPC writes. They are not approved tenant stage presets. Their `schema_version` is a format version, not a concurrency revision; row locks alone do not reject a stale user's desired configuration.                                                                                                                                    |
| `packages/database/hooks/admin-crm-named-views.ts:64–70,96–106,110–136`; `admin-crm-table-preferences.ts:92–105`            | Hooks cache settings for 60 seconds and explicitly invalidate affected settings queries after writes. This is useful practice, not proof that a stage edit reaches every picker, board, report or current authorization context.                                                                                                                                                                   |

P11 is a **ratified design**, not runtime qualification: its PRD
`docs/prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:4–10`
states dependencies and no live claims without evidence. Its catalog principles
at `:173–183` and option lifecycle at `:189` are relevant: immutable identity,
labels separate from keys, retired options resolvable but unavailable for new
selection, reorder presentation-only, different meaning gets a new identity.
P27 need not become a custom field or copy P11's JSONB storage, merge/replace,
hard-delete, import auto-creation, quotas, purge engine or full audit technology.
P11's retroactive same-meaning label display also does not authorize rewriting
P27's historical meaning or asserting a fresh assessment.

## Material risks and exact safeguards

Likelihood is conditional implementation risk, not measured incidence. These
are missing D10 qualification requirements and verified reuse limits, not
claims of shipped D10 vulnerabilities. All preserve B.

### I1 — Labels/order become identity or change historical meaning

**Severity high; likelihood high** if demo enums or the current board are reused.
Evidence: demo stage enum, alphabetical board and P11 identity contract above.

**Safeguard:** “Identify each stage independently of its label and position,
within its authorized tenant/list. A same-meaning wording change must not
retarget references. Different meaning requires a distinct stage identity;
retain enough governed definition/change provenance to explain earlier recorded
stages. Reorder changes presentation only.”

**Proof:** rename, reorder, duplicate-looking labels and changed guidance leave
enrollment stage identity, recorded actor/time, time-in-stage and prior meaning
intact. Historical display distinguishes recorded meaning from current wording
where relevant. No stage-progress, task, contact, money or consent effect is
emitted merely because configuration changed. Do not compare ordinal positions
from different list revisions as advancement/regression.

### I2 — Retirement erases values or races with new stage selection

**Severity high; likelihood high** without a shared write protocol.
Evidence: no target catalog found; relational constraints do not by themselves
encode active-for-new-selection behavior.

**Safeguard:** “Retirement prevents new selection while preserving existing
recorded values, references and authorized history. Retire and assign commands
must share a serialized current-definition check. Retention of an unchanged
retired stage, including D9 reopening, is not a new selection.”

Do not advance existing journeys, choose replacements, clear their stage,
restart their clocks or reject unrelated edits merely because their recorded
stage retired. An FK requiring every stored assignment's stage to remain active
would violate this rule. Retain scoped identity integrity and validate new
selection separately. A stale picker is not authorization to select retired
content. If configuration leaves no eligible stage for a required operation,
give an actionable result; do not silently invent a default or migration.

**Proof:** deterministic retirement/assignment races in both commit orders;
existing values and reopened retired values survive; subsequent new selection
fails; stale import/API/manual writers obey the same gate. The root's isolated
Postgres fixture can prove mechanics, not actual P27 authorization or policy.

### I3 — Reorder loses concurrent edits or partially corrupts the list

**Severity medium/high; likelihood high** with independent row updates.
Evidence: current settings RPC serializes writes but does not carry an expected
catalog revision; current board ignores any configured order.

**Safeguard:** “Apply one bounded reorder atomically against the expected current
list. Validate its exact intended membership: no omitted, duplicated, unknown
or foreign-list identifiers. Reject stale/conflicting intent truthfully. List
membership changes and reorder participate in the same concurrency protocol.”

Use a simple stable order representation; a fractional-order service, event
engine or per-tenant schema is unnecessary. Swapping unique positions needs
SQL that handles intermediate uniqueness checks; ‘one UPDATE’ is not proof.
Do not mistake a schema-format version for the current configuration head.

**Proof:** complete permutation, duplicate/missing/cross-tenant IDs, stale
revision, simultaneous add/retire/reorder, and a failure midway through the
transaction. Readers observe one accepted order, never a partial arrangement;
stage history is untouched. Include empty/retired columns in the intended
display behavior rather than deriving catalog membership from loaded records.

### I4 — Configuration authority silently becomes stage-write or data access authority

**Severity high; likelihood medium.** Evidence: current CRM is coarse-role
gated (`packages/api/src/crm/auth/access.ts:8–61`); gift-history delegates are
domain-specific; privileged RPCs trust server inputs.

**Safeguard:** “Use current P12 authority for the exact tenant configuration
operation. Configuring a list grants no enrollment-edit, disclosure, export,
consent or communication permission. Resolve visible catalog labels/guidance
through the permitted surface; enforce authority at command execution.”

Enforce tenant/list/stage membership at database and command boundaries.
Required identity parts must not be nullable loopholes. Tenant-level list
ownership does not invent a Party legal-entity column or erase the enrollment's
exact legal-entity scope. Never copy the gift-history capability or add a
generic administrator override merely because the route exists. P12 owns the
actual permission names and delegation rules.

**Proof:** cross-tenant/list identifiers, revoked configurator, stale session,
missionary who can read a journey but cannot configure, and config manager who
cannot read another restricted journey. Check labels, counts, history, logs
and exports, not just mutation denial. Unique-conflict handling must not return
hidden definitions or grant access to another tenant's receipt.

### I5 — Retries create duplicate stages or unaudited configuration

**Severity high; likelihood medium.** Evidence: settings has atomic audit but
no command receipt; named-view create uniqueness is name-based and returns a
conflict, not the original accepted intent (`named-views.ts:117–153`).

**Safeguard:** “Commit accepted configuration, required history and its stable
command result together. Retry of the same authorized intent recovers the same
result; a reused key with different intent cannot overwrite history.”

Record configuration actor/time separately from the actor/time who last
assigned a journey stage. Preserve enough provenance for lawful recovery;
do not require indefinite copies of sensitive text. Ordinary display rename
must not update every enrollment's historical timestamp.

**Proof:** lost response after commit, double submit, concurrent create, audit
failure, conflicting command payload and access loss before receipt recovery.
One accepted configuration change remains; no phantom stage or rewritten
stage-assignment history. Provider dedupe or browser state is not this receipt.

### I6 — One consumer keeps stale labels, eligibility or alphabetical order

**Severity medium/high; likelihood high** given current hard-coded consumers.
Evidence: CRM board/filter/status code and separate settings caches above.

**Safeguard:** “Pickers, lists, boards, history, reports, saved views and allowed
integrations resolve the same stable stage identity and current permitted
definition. Preserve retired references; do not silently drop an invalid filter
and widen results. A stale client may display known history but cannot bypass
current selection/configuration checks.”

Invalidate/reconcile catalog-dependent data after accepted edits, and reject
late old responses that would restore retired selectability. Canonical order
is not alphabetical order; a loaded page is not the complete catalog/count.
Cross-preset or cross-tenant reporting must not equate stages by name or rank.

**Proof:** same edit across staff and authorized missionary contexts, stale tab,
saved filter, CSV/API round trip and multi-page board. Labels/order reconcile
without changing membership/history; restricted labels remain restricted.
Unknown retired references degrade truthfully, not to an unrelated default.

### I7 — Preset updates or rollout overwrite tenant choices

**Severity high; likelihood medium.** Evidence: P27 roadmap `:4087,4127,4133`
requires approved presets/history and retained-data handling; no stage source
implementation is found in the inspected paths.

**Safeguard:** “Version and attribute supplied starting definitions separately
from accepted tenant changes. A provider/product update, seed rerun, import or
repair must not silently replace tenant order, identity, retirement or meaning.
Reconcile old statuses explicitly; ambiguous legacy labels are not approved
stage assignments. Fence old writers before activating the new rules.”

**Proof:** repeated seed/bootstrap, new supplied preset version, custom tenant
edit, rollback, old client and ambiguous demo/legacy values. Accepted tenant
configuration/history survives, with no automated reclassification or migration.
Native operation must work with optional Studio/Eve unavailable. Do not restore
retired Twenty CRM or introduce a new provider dependency for these mechanics.

## Database feasibility and proof boundaries

A tenant/list/stage relational shape with stable identities, scoped references,
display order, retirement and governed change provenance is sufficient in
principle. This is conceptual, not frozen DDL or a mandate for another catalog
framework. Database checks protect identity/scope; current command authority
and the shared concurrency protocol protect allowed operations.

Primary PostgreSQL 17 pages refreshed 2026-10-10:
[enum types](https://www.postgresql.org/docs/17/datatype-enum.html) cannot remove
existing values or change their sort order without dropping/recreating the
type; a deployment-wide enum is therefore a poor tenant-list authority.
[Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html) support
composite identity integrity; they do not substitute for new-selection policy.
[CREATE TABLE](https://www.postgresql.org/docs/17/sql-createtable.html) documents
unique/deferrable constraints; reorder must use a proved collision-safe
transaction strategy. No particular index or lock layout is selected here.

D6's [version evidence](../d6-evidence/implementation.md) records the same
checkout's manifest/installed drift: Supabase JS 2.117.3/2.103.0, SSR
0.12.7/0.8.0, Inngest ^4.22.0/4.5.1. Local configuration requests PG17; no hosted
version, applied grants, active job or deployment was queried for D10.

Root owns the isolated retirement/assignment and reorder mechanics experiment;
its artifact must state exact fixture, schedules and results. It proves neither
Core's current P12 authorization nor a shipped stage feature. Existing
`crm-named-views.test.ts` and `crm-view-settings.test.ts` test another feature
using stubs/pure functions; rerunning them would not establish D10 retirement,
reorder or history. No such qualification claim or duplicate test run was made.
Future implementation needs the source/database/surface proofs above. No
arbitrary capacity SLA, stage limit, cadence or mandatory approval process was
invented during this review.

# D29 database and authorization evidence

Research date: **October 17, 2026 UTC**. Repository HEAD:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

This is a fresh static review and primary-documentation check for the selected
explicit-additional-support case. It does not inspect a live Supabase catalog,
claim a deployed exploit, or implement/qualify the future source. No database,
application, schema, provider, or dependency was changed. No prior database
experiment or finite model was rerun. [HTTP evidence](technical-fetches.json)
records fourteen successful fresh GETs and their hashes; retrieval is not proof
of the running project's version or settings.

## Finding and owner boundary

**Accept the purpose case only with an explicit owner-qualified purpose fact.**
An assertion that Grace meant an exact eligible gift, or an exact eligible
portion, as additional support belongs to P28's operational stewardship purpose.
It must reference P13's financial source and any necessary P14 recognition facts.
It neither rewrites posted financial rows nor decides P16 commitment application.
The existing P9 shared task is a projection/independent human deliverable; its
title, status, generated flag, or completion is not evidence of donor intent.

[ADR-0206:19](../../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md:19)
freezes **all** posted financial columns, including later additions, and places
mutable operational state with its owner. Its
[transaction requirement:61](../../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md:61)
requires accepted state, receipt, audit and outbox facts to commit together.
[ADR-0183:622](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
distinguishes the independent follow-up task and requires durable source-owned
projection intent. It expressly treats current contribution and missionary
task implementations as migration inputs, not interchangeable authorities
[:653](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:653).

The already-ratified [D21 C02–C07:180](../phase28-d21-explicit-gift-follow-up-adversarial-review.md:180)
requires exact qualification, current source authority, same-scope contribution
grain, and one owner admission path. This case adds a qualification criterion;
it cannot weaken those requirements. It does not settle every remaining
special-gift criterion. No named appeal, minimum amount, visible commitment,
managed partnership, new donor checkout field, attachment, or AI classification
is necessary to establish this particular purpose case.

**Founder-selected actor clarification:** authorized staff and missionaries may
confirm/correct donor purpose when the organization permits the exact scoped
action. This selects the actor classes; it neither grants authority through
existing task-write permission nor establishes implementation or full amendment
ratification. P12 must register the scoped authority through the existing
capability/PDP spine. An authorized human recording an eligible direct donor
assertion is distinct from the donor making it; preserve both identities and
times. A system adapter records its real service identity, source and provenance,
never a fabricated human attestation. No routine staff approval is required for
every already-qualified missionary confirmation.

## Current implementation: what exists and what cannot be inferred

| Static evidence                                                                                                                                                                                                                                                                              | Current behavior and bounded concern                                                                                                                                                                                                                                                                                                                                                                                                                   | Required consequence for D29                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Manual task POST:30](../../../../../packages/api/src/missionary-portal/tasks.ts:30), [:72](../../../../../packages/api/src/missionary-portal/tasks.ts:72), [:81](../../../../../packages/api/src/missionary-portal/tasks.ts:81)                                                             | Strict schema, current selected-donor check, trusted profile assignment and `is_auto_generated: false`; no purpose/source/revision/coverage envelope. This is a useful manual-command boundary, not a native gift producer.                                                                                                                                                                                                                            | Do not add caller-controlled generated/purpose/actor fields or infer qualification from manual creation.                                                                                                                                                                                                                         |
| [Task PATCH:25](../../../../../packages/api/src/missionary-portal/task.ts:25), [:72](../../../../../packages/api/src/missionary-portal/task.ts:72), [DELETE:102](../../../../../packages/api/src/missionary-portal/task.ts:102)                                                              | Current routes permit changing title, donor and status, or deleting a task, by task ID and missionary profile. There is no source-generated guard, expected coverage revision or source-purpose reconciliation in these routes.                                                                                                                                                                                                                        | Before generated D29 work uses this table/path, fence/delegate source-relevant mutations. Ordinary completion cannot forge exact automatic coverage; deletion cannot erase it. This is a reuse gap, not evidence of deployed D29 work.                                                                                           |
| [Task schema:287](../../../../../supabase/migrations/20250101000000_init_schema.sql:287) and [later revoke:261](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261)                                                                                | Initial task schema has profile/donor UUID relationships and profile-delete cascade; it has no explicit Tenant/Legal Entity/typed-subject/contribution relationship. Later migration revokes all table access from `anon` and `authenticated`.                                                                                                                                                                                                         | Do not cite the old disabled-RLS statement alone as browser exposure. Do not copy profile-only scope or profile-delete cascade into permanent gift-purpose/coverage history. Qualify the effective migration/catalog.                                                                                                            |
| [Task service:252](../../../../../packages/api/src/missionary-portal/service.ts:252), [donor check:278](../../../../../packages/api/src/missionary-portal/service.ts:278)                                                                                                                    | Task listing/getting is profile-scoped; the separate donor check includes Tenant plus missionary. Listing is unbounded in this function and selects joined donor data. Portal preview is limited to 100 tasks [:214](../../../../../packages/api/src/missionary-portal/service.ts:214).                                                                                                                                                                | Source-qualified pagination, counts, detail and privacy projection must replace assumptions that a profile/task link grants all gift/evidence data. A preview limit does not establish full-work completeness.                                                                                                                   |
| [Staged gift schema:64](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:64), [allocation/audit schema:153](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:153)                                                                | Staged gifts, allocation memos and generic metadata exist. Parent/child Tenant fields have independent UUID FKs, not composite same-Tenant relationship constraints. Allocation/audit children cascade on parent deletion; actor references can become null.                                                                                                                                                                                           | These are not immutable purpose facts, durable business-portion identities, permanent attribution or financial retention proof. D29 must use qualified source identities and bounded evidence, not treat arbitrary metadata/memo as authority.                                                                                   |
| [Allocation replacement RPC:22](../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql:22)                                                                                                                                                              | It locks the Tenant-scoped parent and atomically deletes/reinserts allocation rows; replacement physical IDs can change. It does not validate donor/fund/missionary cross-Tenant membership or sum in SQL. EXECUTE is restricted to `service_role` [:61](../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql:61).                                                                                              | Preserve the useful parent-lock atomicity, but do not bind D29 business identity to replaceable staging rows or call the RPC a browser exploit. Durable purpose follows source-qualified contribution/portion lineage.                                                                                                           |
| [Staged review PATCH:139](../../../../../packages/api/src/admin/contributions/staged-gifts.ts:139)                                                                                                                                                                                           | It loads a Tenant-scoped gift, then writes donor/status/note **before** checking allocation total [:150](../../../../../packages/api/src/admin/contributions/staged-gifts.ts:150). Allocation replacement, allocation status, and audit are subsequent independent calls [:183](../../../../../packages/api/src/admin/contributions/staged-gifts.ts:183). The inspected route/RPC has no same-Tenant validation of supplied donor/fund/missionary IDs. | Concrete adjacent static defects: invalid total or later error may leave partial writes; individually valid UUID FKs do not prove same-Tenant relationships. Do not extend this path for D29 purpose. Source state/receipt/audit/intent need one authoritative transaction and relationship validation. No exploit was executed. |
| [Phase 3 visibility grant:11](../../../../../supabase/migrations/20260513173739_expose_phase_03_service_tables_to_rest.sql:11), [explicit deny policies:16](../../../../../supabase/migrations/20260513173938_add_phase_03_rest_visibility_deny_policies.sql:16)                             | API visibility grants coexist with authenticated `USING(false)`/`WITH CHECK(false)` policies.                                                                                                                                                                                                                                                                                                                                                          | A grant alone is not a demonstrated browser leak. A permissive false policy also cannot cancel a different permissive true policy. Inventory effective combined policy/ACL paths. Future raw D29 tables must meet current P12 owner boundaries rather than reproduce historical exposure conventions.                            |
| [Initial staging retry guard:282](../../../../../packages/api/src/giving/staged-gifts.ts:282), [initial unique migration](../../../../../supabase/migrations/20260611130000_staged_gift_allocation_initial_unique.sql)                                                                       | Existing code avoids stale full-allocation reinsertion and handles a concurrent unique conflict.                                                                                                                                                                                                                                                                                                                                                       | Preserve this existing behavior; it proves neither exact D29 purpose uniqueness nor task-effect deduplication. A new request key for the same business purpose must not create fresh outreach.                                                                                                                                   |
| [Auth registry:12](../../../../../packages/auth/permissions.ts:12), [contribution capabilities:90](../../../../../packages/api/src/admin/contribution-operations/permissions.ts:90), [metadata update:152](../../../../../packages/api/src/admin/contribution-operations/permissions.ts:152) | Present registries expose coarse staff and contribution actions; no explicit additional-purpose confirm authority was found. Generic metadata updates map to correction authority. [Operation wrapper:137](../../../../../packages/api/src/shared/with-operation.ts:137) uses an admin client and authenticated role check.                                                                                                                            | Neither generic role nor service credential proves purpose capability. Register exact current scope, actor class and command preconditions; do not repurpose finance corrections or task permission.                                                                                                                             |
| [Portal query key:100](../../../../../packages/database/hooks/missionary-portal.ts:100), [task hook:157](../../../../../packages/lib/hooks/use-tasks.ts:157)                                                                                                                                 | Portal key is constant; task hook has an in-flight sequence guard but retains prior tasks when a fetch errors. These snippets alone do not prove whole-app cache reset behavior.                                                                                                                                                                                                                                                                       | D29 requires current source/P12 checks before all egress, scope/generation-bound client state and fail-closed loss of authorization. A request sequence is not an authorization epoch; do not display stale protected data on actor/Tenant/scope changes.                                                                        |
| [Currency foundation:217](../../../../../supabase/migrations/20261003051630_currency_foundation.sql:217), [adjustments schema:7](../../../../../supabase/migrations/20260611100000_contribution_adjustments.sql:7)                                                                           | Donations/staged gifts have ISO currency reference enforcement; adjustments have separate source and retry fields.                                                                                                                                                                                                                                                                                                                                     | Reuse monetary owner semantics. Do not invent cents-only/float/converted comparisons, a duplicate balance or new financial adjustment merely to record purpose.                                                                                                                                                                  |

Bounded searches across `packages`, `apps` and migration SQL for explicit
special/additional-gift purpose producers found no implemented D29 admission
path. This is not a proof that every differently named implementation is absent.
No catalog, deployed schema drift, production grants, or production data was
inspected. Static migration/API mismatch itself is a qualification gate.

## Lean invariant and transition contract

The following defines necessary semantics, not table names, a second ledger,
mandatory new database, new universal evidence service, or a second permission
resolver. The [P12 foundation:11](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:11)
and ratified D21 C06–C07 remain governing. Prefer one existing owner command and
its revision/receipt/intent mechanisms where they can prove these invariants.

1. **Exact source scope.** An accepted purpose revision identifies one immutable
   business contribution and the source-qualified relevant portion under exact
   Tenant, Legal Entity, typed ministry/project subject and eligible Party.
   If multiple allocation lines form that portion, the owner certifies their
   identity and coverage. A child UUID, credit, processor event or shared donor
   does not independently define another gift. No cross-Tenant/Entity transfer
   or subject rewrite is allowed by updating a purpose row.
2. **One current purpose head.** Store immutable accepted revisions with a
   source-owned current pointer/sequence, or an equivalent existing mechanism.
   Confirmation, qualified correction and withdrawal have expected-head checks.
   Distinct request IDs for the same purpose do not create duplicate current
   facts. A corrected donor/allocation/subject requires owner reconciliation of
   exact lineage, not silent relabeling. Historical revisions do not count as
   current confirmation.
3. **Trusted attribution and bounded provenance.** Server context derives actor,
   Tenant, current authorization, recorded time and command identity. Submitted
   identifiers are candidate inputs resolved under current scope; they are not
   authority. Preserve donor assertion source/time where known separately from
   recording time. Use a bounded evidence kind/reference and any source-required
   qualification metadata. Do not require a transcript or copy protected P27
   interaction bodies into purpose rows, tasks, logs or job events. Evidence
   reference possession grants no read permission.
4. **Qualification is not a boolean imported flag.** Only the qualified owner
   admits this reason for current eligible financial state/portion and permitted
   follow-up Party. Memo text, appeal membership, one-time payment, amount,
   no-visible-commitment, title, imported label or classifier output cannot
   substitute. Unknown/conflicting/stale source evidence withholds this reason;
   it does not mutate finance, declare zero, or disable other independently
   qualified reasons.
5. **Durable effect identity.** Stable gift/portion/purpose work identity survives
   purpose revision churn, transport retries, webhook redelivery and adapter
   replacement. The revision is evidence consumed, not a fresh business-effect
   identity. Qualification state, semantic receipt, required audit and durable
   identifier-only shared-task projection intent commit atomically. P13 posting
   does not wait for task materialization or a human completion.
6. **Current shared work and precise coverage.** Apply D20 compatibility and
   reviewed-group rules. A second reason can enrich one compatible current task;
   one gift can retain several independent reasons without multiplied outreach.
   Withdrawing this reason preserves valid other reasons. A correction cannot
   erase reviewed completion history, silently cover a new gift/portion, revive
   consumed work, or mint another task by toggling a flag. Owner reconciliation
   may repair still-unconsumed work; it must not impersonate completed contact.
7. **Independent communication truth.** Purpose confirmation, task admission,
   interaction recording, task completion and sending are separate facts.
   No new task sends, changes consent or starts a provider call. Read, confirm,
   correct, complete, contact and send permissions remain independently checked.
8. **History and live eligibility are explicit.** Historical-only imports and
   backfills remain effect-dark; do not infer confirmation while migrating.
   Delayed eligible live evidence needs an owner-defined admission rule preserving
   original business occurrence and completed coverage. Delivery time or a new
   attestation request ID cannot transform old history into new money/outreach.
   Do not silently choose an arbitrary age cutoff or scan all history on rollout.

At minimum distinguish current confirmed, corrected/superseded and withdrawn
purpose evidence from unavailable/conflicting qualification. These need not all
be stored as one status enum. Do not persist a false negative for every gift
view. Missing evidence is not proof that the donor did not intend additional
support; an unsubmitted form is not a business fact.

## Supabase/PostgreSQL requirements and corrected misconceptions

Fresh [Supabase API documentation](https://supabase.com/docs/guides/api/securing-your-api)
separates schema/object grants from RLS. The
[RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
documents `security_invoker` views, JWT staleness and service-role bypass. Apply
repository coarse Tenant defenses and its single fine-grained PDP; do not add
complex membership/missionary/Party authorization joins as a competing SQL PDP.

- **Tenant-aware relationships:** require non-null owning Tenant and exact
  required source fields, composite candidate keys/FKs where corresponding
  owner keys exist, and source-owned validation of typed Entity/subject/Party/
  contribution/portion relationships. A separate FK on `tenant_id` plus a FK on
  `contribution_id` does not prove they belong together. Same-Tenant alone also
  does not prove correct Entity/subject. Cross-owner revision qualification still
  needs the owner boundary; do not fabricate unsupported direct FKs.
- **Row versus transition invariants:** explicit `USING` controls eligible old
  rows and `WITH CHECK` eligible new rows when writes are exposed. PostgreSQL
  [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
  states that omitted `WITH CHECK` on `UPDATE`/`ALL` reuses `USING`; omission alone
  is **not** proof reassignment is allowed. Even both predicates being true does
  not stop changing one allowed source/actor to another. Immutable scope,
  original attribution and source identity need command/column/trigger/constraint
  enforcement. No generic upsert may bypass the owner mutation path.
- **Grants and actual role reachability:** deny direct client raw-table writes
  and unauthorized reads. Test REST, RPC, views, service-role/background/import/
  maintenance paths, not only UI. Review permissive policy OR composition and
  restrictive policy AND composition, function ACLs/default privileges, owners,
  views and exposed schemas. A false permissive policy is not a deny override.
- **Definer nuance:** [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
  says ordinary table owners normally bypass RLS; `FORCE ROW LEVEL SECURITY`
  subjects them to it. Superusers and `BYPASSRLS` roles still bypass. A
  `SECURITY DEFINER` function uses its owner's privileges; it is not intrinsically
  an unconditional bypass. [Function documentation](https://www.postgresql.org/docs/17/sql-createfunction.html)
  requires a trusted search path and selective EXECUTE grants, with default
  PUBLIC revocation in the same transaction. Test the actual owner/role graph.
  A service credential is infrastructure privilege, never product authority.
- **Constraint limits:** [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
  documents that CHECK accepts null unless constrained, cannot maintain arbitrary
  cross-row truth, and referential keys need real candidate keys. Use non-null,
  check, uniqueness and FK constraints for stable invariants; current permission,
  expected head and cross-owner qualification belong to the command. Unique/FK
  checks bypass RLS; normalize errors so hidden record existence is not leaked.
- **Money:** keep source exact currency/units and finite supported bounds;
  [PostgreSQL numeric](https://www.postgresql.org/docs/17/datatype-numeric.html)
  distinguishes exact integer/numeric from inexact floating point. If qualified
  partial amounts must be represented, validate them against the exact source
  portion and source currency. Do not sum recognition credits or convert money
  to decide donor intent. Purpose recording changes no money total.

## Concurrency, failure and recovery proof obligations

PostgreSQL [READ COMMITTED](https://www.postgresql.org/docs/17/transaction-iso.html)
can wait on an updated row then recheck that row while other lookups retain a
different snapshot. Its RLS guide explicitly demonstrates cross-table permission
lookup races. An ordinary transaction, initial RLS check or `FOR UPDATE` on only
the purpose row does not automatically serialize permission revocation,
financial correction and purpose admission.

The owner must identify the relevant source/authorization heads, deterministic
lock or compare-and-swap protocol, and final admission linearization point.
Both competing operations must participate. Recheck current facts after waits;
where authorization expires, evaluate current time at admission rather than a
transaction-start timestamp. Serializable transactions may be a qualified
choice, but require bounded whole-command retry and semantic idempotency; they
are not a replacement for scope or authority. Do not prescribe an isolation
level without testing the actual access pattern.

Required production-shaped database cases:

- simultaneous confirmations, new idempotency keys for the same purpose and lost
  successful response: one current fact and one business effect;
- confirm versus withdraw/correct; confirm versus financial reversal/allocation
  correction; correction versus reviewed-group completion, both commit orders;
- purpose capability/assignment/privacy revocation versus command and versus
  asynchronous projection: no effect through stale authority or stale source;
- failure after accepted source commit but before materialization: durable
  identifier-only intent repairs the same work; failure before commit leaves no
  partial fact/audit/intent; replay of an old revision cannot override a newer one;
- two qualifying gifts and multiple reasons racing with task group completion:
  exact reviewed set preserved, later eligible work remains visible;
- same donor/gift-looking identifiers across Tenants, Entities and ministry
  subjects; hidden evidence reference, null scope, mutation to another allowed
  row scope, caller actor/author/purpose spoofing and privileged-path bypass;
- failure/deny versus known absence in counts/detail; stale cache or delayed
  old response after scope switch, revocation or source correction;
- zero/negative/unsupported or malformed source portions, split gifts, line
  replacement, duplicate credits, mixed currency and partial corrections.

These are **required tests**, not tests already passed. No new disposable model
was needed to resolve an undocumented engine claim. An eventual finite model
would demonstrate contract counterexamples, not qualify real SQL, provider,
policies, frontend cache or concurrency behavior.

## Retention, disclosure and operational deployment

P28 purpose evidence, P13 immutable financial facts, P14 recognition, P9 task
history and protected P27 communication bodies keep their owners and retention
purposes. D28's private-preparation departure schedule does not govern these
records. Use [purpose-owned disposition](../../../../adr/0038-purpose-owned-records-schedules-and-verified-disposal.md)
and preserve qualified durable attribution/coverage under the applicable
schedule. Account/profile deletion must not accidentally cascade business
history; conversely, append-only history does not mean perpetual retention of
raw donor statements. Holds preserve only the applicable content under current
read restrictions and do not create a permission.

Prefer an eligible existing evidence reference over a new file-upload surface.
If a qualified source later requires an object, [Storage ownership](https://supabase.com/docs/guides/storage/security/ownership)
is not access control by itself, and service-key-created objects do not receive
an ordinary user's owner identity. Private bucket policies and source-governed
read/disposal remain necessary. [Database backups](https://supabase.com/docs/guides/platform/backups)
exclude Storage object bytes; database restoration is not object restoration.
Restore/replay must reconcile current privacy restrictions, source heads,
purpose withdrawals, consumed task coverage and disposition before reopening
discovery or publishing old intents. No screen or revocation can claw back
already delivered information; do not promise otherwise.

Activation should be additive and effect-dark: qualify source IDs and capability
mapping, fence old generic writers, deploy constraints/commands/read projections,
then enable the exact producer only after owner/RLS/concurrency/migration proof.
Never backfill confirmed purpose from amounts, one-time frequencies, free-text
memos or imported labels. Existing work cannot acquire new automatic coverage
through migration. Mixed versions must reject unsupported purpose commands;
unknown source type/revision fails closed. Rollback disables new admission and
drains/reconciles accepted durable work without deleting fact/receipt/history or
releasing stale work. Use existing executor/outbox infrastructure; a second
durable scheduler or shadow ledger is unnecessary.

Index the proven query grains: exact Tenant/source identity and current purpose
head, semantic operation identity, exact shared-work source coverage, and due
projection/reconciliation work. Use bounded pages and claims; avoid full donor
history scans, one task per allocation row, or client-side privacy filtering.
Measure actual plans and peak production-shaped data. This review asserts no
unmeasured latency/capacity figure.

Fresh Supabase notices affect qualification, not this product's semantics:

- [Data API grant default](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically):
  announced April 28, 2026; existing-project rollout October 30, 2026. New tables
  require explicit opt-in after rollout; existing grants remain. Migrations must
  explicitly grant/revoke required paths, not assume hosted default privileges.
- [PostgreSQL minor releases](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes):
  September 25 notice covers PostgreSQL 15.19/17.11 and extension/operator changes.
  Verify the actual project version/extensions and upgrade tests; do not invent
  a D29 dependency on `ltree`, `btree_gist` or custom operators.
- [TLS notice](https://supabase.com/changelog/cbc-tls-ciphers-deprecated):
  October 12 notice removes selected legacy CBC TLS 1.2 ciphers no earlier than
  November 10, 2026. Preserve honest connection errors and supported-client
  compatibility; no D29-specific integration is justified by this notice.

The permanent minimum is one qualified operational-purpose command, one exact
current owner fact with attributable correction history, and the existing
durable shared-task projection. Additional tables, bespoke queues, generalized
classifiers and copied communication evidence are not required by this decision.

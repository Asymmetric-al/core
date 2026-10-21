# D32 database and authorization evidence

Reviewed **October 18, 2026 UTC**, against repository HEAD
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the current working tree.
The selected direction combines compatible gift and fixed-commitment-fulfillment
follow-up while keeping their purposes and handling evidence distinct. Tenant
**Combine / Separate** controls grouping, not whether either eligible purpose
exists. The recommendations below are engineering amendments for this review,
not proof of ratified implementation or financial-source qualification.

This note changes no application, schema, database, provider, dependency or
earlier evidence. Existing source was freshly inspected. No older model,
database probe or test suite was rerun, and no live catalog was inspected.

## Conclusion

**Accept with required amendments.** Reuse the shared task owner and extend its
exact reviewed-set contract to these two compatible purpose kinds. Do not merge
the financial gift and commitment, collapse their semantic identities, or use one
task `completed` flag as proof that both purposes were handled.

[D20 C01–C04](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:177)
explicitly reserves distinct-purpose coverage and already defines compatibility,
source ownership and stable gift membership.
[C06–C10](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:225)
requires exact reviewed membership, atomic coverage, residual work and semantic
recovery. D32 is a bounded extension of those contracts. It is not another task
engine, an unrestricted cross-purpose merge framework or new finance authority.

P16 owns actual fixed-commitment fulfillment. Its
[subject/lifecycle contract](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1035)
distinguishes fixed-total progress from recurring lifecycle; its
[conserved fold](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1378)
does not equate donor end, internal release or a final scheduled date with a new
received-money fulfillment event. D32 consumes a qualified milestone and its
exact relationship to the gift. Task handling never establishes that financial
milestone.

## Current code: evidence and reuse hazards

These observations concern inspected source, not an executed exploit or a claim
that the future D32 feature already exists. Previously identified D20/D29–D31
task concerns remain relevant; the cited paths were reread for D32.

| Exact source                                                                                                                                                                                                                                                                                                                             | Current behavior                                                                                                                                                                                                                                          | Required D32 consequence                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Manual task POST:30](../../../../../packages/api/src/missionary-portal/tasks.ts:30), [insert:81](../../../../../packages/api/src/missionary-portal/tasks.ts:81)                                                                                                                                                                         | Strictly validates editable fields and derives missionary identity from auth. It writes one row, permits a completed initial status and explicitly sets `is_auto_generated=false`.                                                                        | Useful manual-task validation is not native purpose admission. Generated purpose identities, membership, source revisions and durable intent must come from qualified owners, not a caller's title/status.                                                                                                |
| [PATCH:25](../../../../../packages/api/src/missionary-portal/task.ts:25), [status/relationship mapping:48](../../../../../packages/api/src/missionary-portal/task.ts:48), [write:81](../../../../../packages/api/src/missionary-portal/task.ts:81)                                                                                       | Generic PATCH can set or clear `completed_at`, change `donor_id`, title, type and other presentation fields. The write filters ID/profile; it carries no exact reviewed purpose set or receipt. A supplied donor is checked separately before the update. | Fence/delegate generated-work completion, reopening, retargeting and protected fields before reuse. A separate donor check is not an atomic old/new relationship invariant or current source check. No live cross-tenant exploit was demonstrated.                                                        |
| [DELETE:102](../../../../../packages/api/src/missionary-portal/task.ts:102)                                                                                                                                                                                                                                                              | Deletes by task ID/profile without a source-purpose/coverage command.                                                                                                                                                                                     | Ordinary deletion cannot erase accepted source membership or immutable handling evidence; hiding a projection is distinct from canceling a purpose.                                                                                                                                                       |
| [Task SELECT:79](../../../../../packages/api/src/missionary-portal/service.ts:79), [list:252](../../../../../packages/api/src/missionary-portal/service.ts:252), [donor gate:278](../../../../../packages/api/src/missionary-portal/service.ts:278), [single read:295](../../../../../packages/api/src/missionary-portal/service.ts:295) | Current reads join donor details and use profile ownership; the list is unpaged. The separate donor relationship check includes Tenant. The DTO has no independently qualified gift/fulfillment members.                                                  | These reads do not prove compatible Entity/subject/responsibility or per-purpose disclosure. Build the approved source-aware projection; do not infer coverage or missing work from this list. Profile filtering is not itself evidence of a deployed leak.                                               |
| [Client task shape:7](../../../../../packages/database/hooks/missionary-portal.ts:7), [portal query key:100](../../../../../packages/database/hooks/missionary-portal.ts:100)                                                                                                                                                            | One task status and flat donor data are represented. The local query key itself does not include Tenant or actor.                                                                                                                                         | D32 needs explicit permitted purpose summaries and context-safe cache/recovery. This inspection did not trace every session/provider cache reset, so it does not establish an existing cross-account cache disclosure.                                                                                    |
| [Initial task schema:287](../../../../../supabase/migrations/20250101000000_init_schema.sql:287)                                                                                                                                                                                                                                         | Legacy missionary task definition has single donor/profile references and a single status; profile deletion cascades tasks. It has no purpose coverage identities in that definition.                                                                     | Do not treat this legacy shape as the intended shared-task schema. Add the required owner identities/constraints through the qualified design and preserve required source/handling history under deletion, retention and restoration.                                                                    |
| [Shared task links/events:39](../../../../../supabase/migrations/20260526193000_mission_control_tasks.sql:39), [events:68](../../../../../supabase/migrations/20260526193000_mission_control_tasks.sql:68)                                                                                                                               | Current shared task links store `record_type`, `record_id` and metadata; child links/events cascade with the task. Tenant columns and task FKs are separate rather than composite in this migration.                                                      | A generic polymorphic link is not a typed purpose, tenant-equality proof or completion receipt. Do not put authoritative D32 coverage in mutable metadata or reuse destructive cascades for required history.                                                                                             |
| [Task creation sequence:62](../../../../../packages/api/src/admin/mission-control-tasks/service.ts:62), [concrete inserts:75](../../../../../packages/api/src/admin/mission-control-tasks/store.ts:75)                                                                                                                                   | The inspected adapter inserts the task, then links, then event via separate awaited database calls.                                                                                                                                                       | This is not evidence of atomic D32 membership/coverage. Reuse of the pattern needs a qualified owner transaction or durable recovery protocol; the review does not claim an observed current partial-write incident.                                                                                      |
| [Shared task grants:109](../../../../../supabase/migrations/20260526193000_mission_control_tasks.sql:109), [later task revoke:261](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261)                                                                                                         | Shared tables enable RLS and revoke browser-role access; service role is granted access. The later missionary-table migration also enables RLS and revokes raw task access.                                                                               | Effective deployed grants/roles still need inspection. Do not cite the initial demo disabled-RLS clause as current browser exposure, or assume a service role supplies domain authorization.                                                                                                              |
| [Organization settings:9](../../../../../packages/api/src/admin/org-settings.ts:9), [GET:22](../../../../../packages/api/src/admin/org-settings.ts:22), [PATCH:48](../../../../../packages/api/src/admin/org-settings.ts:48)                                                                                                             | Existing post-visibility handler targets `DEFAULT_TENANT_ID`; PATCH has an explicit admin role gate but still writes that fixed ID. It does not implement D32 grouping policy.                                                                            | Do not extend this fixed-tenant pattern for Combine/Separate. Derive selected Tenant from trusted current context, require the exact policy-management action, validate the enum, use expected revision and return persisted outcome. No runtime exploit or successful fixed-tenant mutation is asserted. |

## Minimal invariants and exact proposed requirements

**T01 — Distinct meaning.** The shared task SHALL retain independently identified
gift-follow-up and fulfilled-fixed-commitment purposes. Each purpose SHALL bind
its authoritative occurrence, relevant revisions, financial Legal Entity,
Tenant, typed ministry/project, qualified Party, responsibility and completion
authority. A task ID, source revision, grouping-policy revision or assignee change
SHALL NOT mint a new semantic purpose. P16 defines milestone occurrence/correction
identity; a generic `fulfilled=true` or mutable counter does not.

**T02 — Bounded compatibility.** Combination SHALL require the exact currently
qualified causal source relationship and the D20 compatibility dimensions for
all selected purposes. Shared name, email, Party alone, timing or arbitrary linked
records SHALL NOT combine unrelated obligations. Permission to handle the gift
SHALL NOT grant permission to view or handle the commitment purpose, or vice
versa. Each purpose qualifies independently; neither invents the other.

**T03 — Grouping policy only.** Tenant policy SHALL contain only the authorized
Combine/Separate behavior and revision/provenance needed by its owner. Neither
value suppresses, handles or withdraws eligible work. Policy-management scope and
actor SHALL come from trusted context. Changed payload under the same command
key SHALL conflict; stale expected revisions SHALL not silently overwrite a
newer decision. Persist required policy state, receipt and audit atomically.

**Current-pending recomposition proposed by the main D32 review:** policy save
SHALL atomically commit its new revision and durable reconciliation intent.
Existing D20 gift grouping remains the anchor. Only eligible unhandled fulfillment
purposes may attach/detach through the shared-task owner, preserving their stable
identities and enforcing one active placement per purpose. Independent undertakings
may prevent combination. New admissions and each bounded reconciliation batch
SHALL validate current policy, source and placement after waits; an old Combine
job cannot undo a later Separate decision. Do not hold a Tenant-wide lock while
recomposing every task.

A stale joint projection is not authority while repair runs. Current policy must
fence new joint acceptance immediately, not only after a background job catches
up. Unaffected single-purpose handling may resolve its exact current placement
when selected meaning/authority remains valid; it must never update the wrong old
task or silently broaden coverage. Old joint requests under Separate require
refresh with no newly handled subset. Empty presentation shells become superseded,
not Done; safe old links resolve through retained lineage. Completed receipts and
purpose coverage never change. Drafts, prepared communications and independently
promised work are neither copied nor silently re-scoped. Policy revision is
evidence, not a new purpose/deduplication key.

**T04 — Exact reviewed command.** A disposition SHALL bind a nonempty explicitly
reviewed set of purpose-member IDs, intended outcome and relevant source/task/
responsibility/authority revisions. The server SHALL resolve and validate every
binding; caller-supplied counts, flags and hashes are not authority. Deliberately
handling only the gift is a valid smaller selected set. If any selected purpose
materially changed, became unauthorized or was handled elsewhere, follow D20's
whole-command conflict/recovery semantics with no silently newly handled subset.
An unrelated purpose arriving outside the selected set neither joins coverage
nor alone invalidates the unchanged selection.

**T05 — Atomic coverage and residue.** In the shared-task owner's accepted command,
record each selected purpose's exact coverage, one disposition receipt, required
actor/time/audit history and resulting task state atomically. One command may
reference separately inspectable per-purpose coverage; no duplicate financial
receipt or repeated human interaction is required. Close only when the owner
proves no unresolved required membership or independent obligation remains.
Unknown or hidden work is not absent. Current viewer visibility may end without
claiming the underlying task is complete or disclosing hidden residue.

**T06 — Durable identity and recovery.** Enforce uniqueness on the owner-qualified
purpose/effect, not request key, task row, reason label or policy revision alone.
Identical retry recovers the original accepted outcome under current disclosure;
changed payload conflicts. Different keys/overlapping sets cannot duplicate
coverage or silently complete the unhandled remainder of a stale command. A
delayed original live fulfillment purpose may join compatible uncovered work or
remain separate according to the current owner/policy contract. An earlier gift
disposition never retroactively proves an unseen milestone was handled.

**T07 — One actual action, honest evidence.** Recording a real interaction remains
separate from task disposition. When existing owner rules permit one interaction
to support multiple purposes, reference the same interaction with exact deliberate
coverage; never count it twice or manufacture a second send. Later review may
use existing actual evidence only through the qualified owner action, not through
automatic backdating or inference from a completed task. A failed combined task
command does not erase an actual interaction or replay a provider send.

**T08 — Independent correction.** Source correction SHALL invalidate only the
affected unhandled purpose or evidence, preserving independent valid work and
historical handling. Actual gift receipt can remain valid when fulfillment is
withdrawn. Current source uncertainty is not confirmed withdrawal. Qualified
restoration reuses the same still-unhandled original purpose lineage and cannot
reopen covered work. Accepted historical financial authority does not become a
false fact merely because its original authorization later expired; current new
admission, handling, correction and disclosure still require their own authority.

**T09 — Database integrity.** Required Tenant/source/purpose/task/coverage/receipt
identity and scope SHALL be non-null where authoritative. Use tenant-aware
composite references and typed source validation, valid state constraints and
unique effect/one-current/one-active-placement constraints where expressible.
Placement moves SHALL atomically retire the old current placement and establish
the new one without moving coverage or changing the purpose. Protect Tenant, actor,
origin, purpose kind, source association and coverage from generic UPDATEs, even
if both old and proposed rows pass a broad same-Tenant policy. Cross-row finance,
permission and compatibility decisions belong to the authoritative mutation
boundary, not a CHECK that consults mutable external rows. Choose exact indexes
for Tenant/compatibility, purpose identity, receipt lookup and pending intent;
do not freeze redundant tables merely to name these invariants.

**T10 — Durable source integration.** Each source admission and its required
identifier-only task intent SHALL commit atomically at its owner. Shared-task
admission SHALL atomically resolve the compatible task and unique memberships.
Required task writes/coverage are one local transaction; cross-owner notification
and projection use qualified durable versioned protocols, not an assumed
distributed transaction. Required audit/receipt failure cannot leave accepted
partial coverage. Financial posting need not wait for human task handling.

## Authorization and concurrent acceptance

PostgreSQL [READ COMMITTED](https://www.postgresql.org/docs/17/transaction-iso.html)
and [RLS documentation](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
warn that a changed row obtained after waiting can be combined with an older
snapshot of a referenced authorization row. Locking only the task does not
serialize a source correction, scope transfer, revocation or policy mutation.
Both sides must participate in the qualified owner fence/CAS/serialization
protocol. Use the existing stable lock order, bounded exact selected sets and
whole-command retry on a transaction conflict; do not hold financial locks while
waiting for a provider or human.

**T11 — Final current authority.** Revalidate each selected purpose's current
source/dependency revisions, current P12 action/scope and relevant policy/task
authority/placement at final acceptance, including after waits. A gift's unchanged revision
does not prove its commitment milestone is unchanged. For expiring authority use
actual current time at that boundary: PostgreSQL
[`now()`/`CURRENT_TIMESTAMP`](https://www.postgresql.org/docs/17/functions-datetime.html)
is transaction-start time, while `clock_timestamp()` changes within a statement.
No transaction may gain extra authorization lifetime by beginning before expiry.

**T12 — Same enforcement on every path.** Inspect effective schema/table/column
grants, RLS old/new checks, views, RPC ownership/EXECUTE/search paths, imports,
workers, repairs, browser collections, storage and realtime. Every supported
production entry running with service/owner/definer privilege SHALL enforce the
same domain checks. Infrastructure privilege is not product permission. An
unrestricted superuser inherently can bypass database enforcement; do not claim
RLS makes arbitrary privileged SQL safe.

Primary documents correct two overbroad skill formulations:

- [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) reuses
  `USING` for `UPDATE`/`ALL` when `WITH CHECK` is omitted. Omission alone is not
  evidence of a reassignment exploit. Both old/new rows can nevertheless satisfy
  a broad policy while a protected identity or relationship changes illegally.
- [SECURITY DEFINER](https://www.postgresql.org/docs/17/sql-createfunction.html)
  uses actual owner privileges, not unconditional RLS bypass. Ordinary table
  owners usually bypass RLS; FORCE RLS can bind them, but not superusers or
  BYPASSRLS. Default PUBLIC execution, actual role ownership and reachable schemas
  matter. Use trusted search paths and restricted grants. Invoker views or
  qualified unexposed alternatives must preserve the source boundary.

Supabase [Data API grants](https://supabase.com/docs/guides/api/securing-your-api)
and [row policies](https://supabase.com/docs/guides/database/postgres/row-level-security)
are separate controls. Existing task revocations are useful evidence, not proof
that a future safe projection/RPC has the correct effective ACL or P12 action.

**T13 — Current disclosure and recovery.** Independently authorize each purpose,
amount, label, source link and derived fact. Group counts, apparent completion,
hidden-residue messages and “also fulfilled a commitment” can leak protected
facts even without raw financial rows. Use minimal current projections at final
disclosure release across lists, details, history, export, notices, logs, caches
and command recovery. Bind caches/in-flight results to current Tenant/actor/scope;
discard stale results after a context change. Already released bytes cannot be
recalled. An accepted receipt does not grant future access: after revocation,
recover safely without re-executing or exposing protected existence/details.

**T14 — Retention and deployment.** Keep immutable purpose/source/correction and
handling lineage under their owning retention/hold/redaction rules. Task deletion,
profile removal, grouping changes, policy rollback and restoration must not erase
required coverage or replay old obligations. Do not copy donor narratives or money
into generic task metadata. Deploy additive owner records/constraints, fence old
generic writers, qualify source/RLS/atomic commands, then activate prospectively.
Backfill source evidence separately from task admission; imported `completed`
does not prove either purpose's coverage. Roll forward after accepted effects;
rollback cannot restore an old writer that discards new evidence.

## Required real proof before activation

These are release obligations, **not tests performed by this documentation review**.

| Case                                                                                    | Required result                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One valid gift and its qualified fixed-fulfillment milestone, Combine                   | One compatible current task, two independently identifiable purposes, exact source evidence and separately inspectable coverage after one reviewed action.                                                                          |
| Same inputs, Separate                                                                   | Both purposes remain actionable; neither suppressed or pre-completed. No forced second communication.                                                                                                                               |
| Same Party but wrong Entity/typed subject/responsibility/causal relationship            | No combination or source disclosure; no ID-only or name-based fallback.                                                                                                                                                             |
| Deliberately handle gift only                                                           | Gift coverage commits; fulfillment remains pending with honest permitted UI. No task-wide completed shortcut.                                                                                                                       |
| New purpose arrives during review                                                       | Existing exact selection may complete if unchanged; new purpose remains uncovered. No global-version rejection solely for the addition and no silent absorption.                                                                    |
| Concurrent sets `{gift, fulfillment}` and `{gift}`                                      | One accepted overlapping coverage effect; the losing stale command cannot silently newly cover fulfillment. Validate both commit orders.                                                                                            |
| Source correction/revocation/reassignment races completion                              | Stale selected-purpose handling fails atomically; independent valid work and actual interactions remain. Validate both orders and relevant dependency revisions.                                                                    |
| Authority expires during a lock wait                                                    | Final actual-time check denies; transaction-start timestamps cannot extend permission.                                                                                                                                              |
| Same/different request keys, lost response and changed payload                          | Same accepted effect recovers once; changed-payload key conflicts; current disclosure applies even to old receipts.                                                                                                                 |
| Fulfillment withdrawn/restored after gift handled                                       | Exact affected purpose changes; no gift replay, hidden retroactive coverage or duplicate interaction. Historical evidence stays truthful.                                                                                           |
| Policy change races new membership or pending-group recomposition                       | Current revision governs placement/joint acceptance; stable identities/coverage survive. An older worker cannot reverse a newer policy. A stale joint request cannot execute while reconciliation lags.                             |
| Combine↔Separate with draft, independent undertaking, old link or single-purpose action | Move only eligible unhandled placement atomically; preserve draft/communication scope and history. Superseded shells are not Done. Resolve exact valid single-purpose work at current placement without fabricating joint coverage. |
| Table/API/RPC/worker mutation of source, actor, Tenant, purpose kind or task parent     | Old/new invariants deny unauthorized transforms, including privileged production paths; no leaked existence through errors or counts.                                                                                               |
| Hidden purpose, permission loss or Tenant switch                                        | No purpose/count/closure/receipt/cache leakage; old responses are discarded; internal unresolved work survives.                                                                                                                     |
| Failure between required member coverage, receipt, audit and task-state writes          | No accepted partial result; durable source/task intents recover one qualified work unit without moving money.                                                                                                                       |
| Delete, restore, old-code/new-schema and rollback after writes                          | Required source/handling history and deny state survive; no historical task flood or erased coverage.                                                                                                                               |
| Largest qualified compatible group, concurrent policy/source updates and tenant skew    | Declared bounds and query/lock/queue budgets pass; no silent truncation, all-history read or one-tenant starvation.                                                                                                                 |

These requirements preserve the narrow product choice. They add no monetary
threshold, suppression option, new financial ledger, message sender, permission
engine or general workflow builder. The unresolved implementation proof is the
actual source/command/projection integration, not an invitation to substitute
generic task status for exact purpose coverage.

## Fresh primary retrievals

The repository Supabase and PostgreSQL skills were applied and checked against
primary documentation. The changelog was freshly fetched; relevant grant-default,
PostgreSQL-upgrade and TLS notices were followed. New-table grant defaults do not
remove pre-existing grants. Their dates/version implications require deployment
qualification, not an invented D32 runtime assertion. The primary PostgreSQL
pages below are version 17 documentation, not proof of the hosted server version.

All entries below returned HTTP 200 on October 18, 2026 UTC. Hashes identify the
retrieved bytes; they do not certify product behavior.

| Source                                                                                                                                                                                          | Retrieved UTC   | SHA-256                                                            | Bytes  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------ | ------ |
| [changelog.md](https://supabase.com/changelog.md)                                                                                                                                               | 03:34:04.767557 | `15b3d0d1a7dc3b3f2c0af4788e49acfdf2d2edbd2613f22de0705fa43b1cf58b` | 102319 |
| [securing-your-api.md](https://supabase.com/docs/guides/api/securing-your-api.md)                                                                                                               | 03:34:04.437817 | `d2c47fd37a58003f294e11f47cdb05bdd2bb853f350c006a9e6a2c4249868e46` | 18172  |
| [row-level-security.md](https://supabase.com/docs/guides/database/postgres/row-level-security.md)                                                                                               | 03:34:04.794060 | `9398df00c60160ffbbdf9b53f02e61bd34db000d291152a3268a00a95e4cdac8` | 30344  |
| [sql-createpolicy.html](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                                                                               | 03:34:05.860914 | `1772bf6791789204d77a0ed3e35c0ff2f7ea988fb71f64a0b4b3a19908fad6a6` | 46910  |
| [ddl-rowsecurity.html](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                                                                                                                 | 03:34:05.014919 | `4cdf084d8e36009d03790c508585bd7c4c237aac4165dbbc9173866dbffc980e` | 31181  |
| [sql-createfunction.html](https://www.postgresql.org/docs/17/sql-createfunction.html)                                                                                                           | 03:34:05.563985 | `887e05c52a98890006d7d63cd1dcbb933309376ff78967bef6693f247dddbf43` | 51069  |
| [transaction-iso.html](https://www.postgresql.org/docs/17/transaction-iso.html)                                                                                                                 | 03:34:05.998068 | `e3475df0c76b214dbda0bc681015099763b83778e1355e17ee7b908e6fd38a26` | 47618  |
| [functions-datetime.html](https://www.postgresql.org/docs/17/functions-datetime.html)                                                                                                           | 03:34:06.968092 | `20965f1539d658c525d403ad548d697cfcb8967f4faf8f81127373572f33821d` | 108106 |
| [ddl-constraints.html](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                                                                                 | 03:34:06.162344 | `dadc6166e3dcae0a1c91ada5373ef046682876b6db32e8c771338a4cb9b8c4be` | 44707  |
| [45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) | 03:35:00.773289 | `b55ab284630217cab0a4944dd192349508871b4a8f47432e4c265d18a525bed1` | 163465 |
| [postgres-15-19-17-11-breaking-changes](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)                                                                                   | 03:35:01.018951 | `9ac8626244284d144287533ef7437436fda15e20c49d87fb3bc472b7052e8983` | 246967 |
| [cbc-tls-ciphers-deprecated](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)                                                                                                         | 03:35:00.838259 | `09ba277064047bb7abd603b81203d146965e57b5a8e0bc0ebe5ce9d1ab84c598` | 87727  |
| [product-security.md](https://supabase.com/docs/guides/security/product-security.md)                                                                                                            | 03:35:00.794263 | `826f6b0233dbc8a54a840a382cbb6c3f7f5ffe4c1d2d760762e306d7958b2d87` | 2354   |

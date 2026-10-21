# D28 — database, authorization and disposition evidence

Research date: **October 17, 2026 UTC**. Source inspected at
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is the database/security workstream
for the selected **organization-set finite period after departure**. It does not
activate a schedule, change a database, qualify a deployment, or select a number
of days. The parent review owns the final amendment, including the explicit
return/retention clarification.

**Disposition: Accept with required amendments.** Tenant configuration is
compatible with source ownership only when confirmed departure, the applicable
policy revision, access cutoff and physical disposal remain precise and distinct.
Keeping a body is not permission to read it. A delayed cleanup job cannot extend
ordinary access; a hold cannot become a recovery route; an old backup cannot
restore a disposed body to ordinary use.

## Evidence method and limits

Fresh reads covered migrations, `packages/api/src`, `packages/auth`, relevant
database hooks, owning decisions and current official technical documentation.
Searches for preparation/prospect production paths did not find a qualified
private-preparation retention producer in those bounded paths. This is not a
claim about every file, a hosted schema, or production data.

The Supabase and Supabase Postgres skills were read. Changelog and primary pages
were retrieved by public HTTPS GET; [metadata](technical-fetches.json) records
17 successful responses, timestamps, URLs, byte counts and SHA-256 values.
No project credentials, live database, provider mutation, dependency install,
schema change or application execution was used. SQL/API observations below are
static evidence. Counterexample schedules are reasoning, not reproduced data loss.

## Governing ownership and selected boundary

- [D3-C06](../phase28-d3-adversarial-review.md:249) requires source-qualified body,
  evidence, derivative, hold, trigger, duration and restoration rules. Retention
  does not grant ordinary reads; attribution/tombstones do not require unlimited
  plaintext or a live login. [D3-C08–10](../phase28-d3-adversarial-review.md:263)
  require ordered acceptance, trusted identity and restore reconciliation.
- [D27-C07](../phase28-d27-resume-preparation-adversarial-review.md:207) keeps
  ordinary retained bodies, hold-only evidence and erased content distinct.
  [D27-C11](../phase28-d27-resume-preparation-adversarial-review.md:266) requires
  current deadline checks after waits and authoritative ordering. D28 must not
  silently make login, role reassignment or an ordinary Resume reset retention.
  Any deliberate current-work retention admission selected in the D28 review is
  an explicit source transition/amendment, not an inference from account return.
- [Identity/access OpenSpec](../../../../../openspec/specs/identity-and-access/spec.md:14)
  derives principal, tenant and role from a validated server session;
  [tenant isolation](../../../../../openspec/specs/identity-and-access/spec.md:43)
  requires application checks plus RLS and revoked access to internal tables.
- [ADR0038's scope precision](../../../../../docs/adr/0038-purpose-owned-records-schedules-and-verified-disposal.md:144)
  explicitly prevents a generated-document or Phase 21 records schedule from
  becoming a platform-wide semantic owner. Its purpose-owned schedule and
  verified-disposal pattern is relevant; its numerical policy and document
  classifications do not govern private preparation.
- [ADR0025 for Eve](../../../../../docs/adr/0025-eve-retention-replay-lifecycle.md:15)
  owns Eve's categories and artifact storage. Its 180/30-day defaults and
  two-phase artifact procedure are not preparation retention policy.
- The [Phase 21 OpenPolicy activation gate](../../../../../docs/guides/features/openpolicy-legal-pages.md:164)
  is expressly scoped to Phase 21 D26. It is a relevant reconciliation precedent,
  not a universal P9 owner. D28 must independently reconcile its exact body and
  copy classes with the actual public terms/MSA/DPA. Current public
  [OpenPolicy content](../../../../../apps/donor/openpolicy.ts:106) includes
  several fixed retention statements; whether a preparation text body falls in a
  named class must be established. Departure, deletion request, account closure
  and tenant closure are not interchangeable triggers. This is a potential
  contract conflict to resolve before activation, not a finding of illegality.

## Fresh current-source findings

| Evidence                                                                                                                                                             | What is verified                                                                                                                                                                                                                                                                                                                                                              | Consequence for D28                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Membership schema](../../../../../supabase/migrations/20260226113000_authz_memberships_foundation.sql:45)                                                           | Membership has identity, tenant, role, `is_active` and generic timestamps. Its unique key can reuse a row for the same person/tenant/role. The migration's [backfill](../../../../../supabase/migrations/20260226113000_authz_memberships_foundation.sql:92) sets active, but is not a runtime departure/return workflow.                                                     | `is_active = false`, `updated_at`, last login or delivery time cannot prove the source-confirmed departure episode/effective date needed for this timer. Qualify that source contract rather than fabricate a trigger.                                                                     |
| [Request context](../../../../../packages/auth/context.ts:249) and [membership projection](../../../../../packages/auth/context.ts:322)                              | Session/profile/membership errors fail closed. Returned membership data is a coarse active role shape, not exact historical assignment/activation admission. [Compatibility roles](../../../../../packages/auth/permissions.ts:84) remain in role resolution.                                                                                                                 | Role or account return alone does not authorize discovery, policy administration, hold access or a retention transition. This is an adoption gap, not a claim that the fixed query-error fallback still exists.                                                                            |
| [Initial FK graph](../../../../../supabase/migrations/20250101000000_init_schema.sql:27)                                                                             | Auth deletion cascades to profiles; missionaries and [missionary tasks](../../../../../supabase/migrations/20250101000000_init_schema.sql:287) have profile cascades. Memberships have an Auth cascade. [Member-care private notes](../../../../../supabase/migrations/20260414180338_member_care_foundation.sql:126) instead reference the author with `ON DELETE RESTRICT`. | Auth account deletion is not a qualified departure or content-disposal command. Inspect the whole FK graph: a blocking FK can roll back cascades, while allowed cascades can remove facts outside this source. Do not solve retention by deleting a person/profile or nulling attribution. |
| [CRM notes](../../../../../supabase/migrations/20260818000000_crm_notes.sql:5)                                                                                       | Staff-owned body rows have nullable author metadata and no preparation departure/retention lifecycle. Authenticated INSERT checks staff/visibility, not author binding at [line 63](../../../../../supabase/migrations/20260818000000_crm_notes.sql:63).                                                                                                                      | These declared grants/policies are not a private-preparation source. Reusing nullable or caller-supplied author metadata for retained-body access would be unsafe. No direct-table exploit or deployed role inventory was exercised.                                                       |
| [Portal query key](../../../../../packages/database/hooks/missionary-portal.ts:100) and [session cache isolation](../../../../../packages/auth/client-session.ts:56) | The portal key is static. Query cache clearing exists for sign-out/user-ID changes; [auth load versioning](../../../../../packages/auth/client-session.ts:139) discards older auth loads.                                                                                                                                                                                     | Do not claim cache cleanup is absent. D28 requires stronger same-user tenant/assignment/policy/deadline isolation for its own result paths and no stale body placeholder after current denial. Existing cleanup does not prove it.                                                         |
| [Eve categories](../../../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:7)                                                                | Categories are global, with a 1–3650-day check and domain-specific defaults. [Artifact rows](../../../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:35) contain owner cascades, Storage paths, expiry and deletion markers.                                                                                                                        | This is an existing domain mechanism, not a tenant-customizable preparation policy or safe schema template. Do not copy those numbers, cascades, object bodies or hold target strings into P9 without justification.                                                                       |
| [Eve SQL expiry](../../../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:373)                                                              | Bounded claims use `FOR UPDATE SKIP LOCKED`, check holds and set `delete_pending`. Record-only expiry has a [shared transaction mutex](../../../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:498) with relevant hold creation.                                                                                                                    | Positive precedent for bounded work and ordered DB-only transitions; it does not establish correct D28 hold/return/policy semantics. No throughput is inferred.                                                                                                                            |
| [Eve signed download](../../../../../packages/api/src/eve/retention/control.ts:157)                                                                                  | It checks owner, tenant, status and expiry, then issues a fixed 60-second signed URL.                                                                                                                                                                                                                                                                                         | This does not prove a strict preparation deadline cutoff: a URL issued just before expiry can outlive that deadline. Do not borrow the path as current-history authorization or assume JWT revocation recalls an issued URL. No D28 attachment/export feature follows.                     |
| [Local Supabase configuration](../../../../../supabase/config.toml:7)                                                                                                | `public`/`graphql_public` are exposed; configured PG major is 17.                                                                                                                                                                                                                                                                                                             | Inspect actual grants, exposed routes, view/function owners and deployed version before qualification. Local configuration is not proof of production privilege state.                                                                                                                     |

### Existing late-worker deletion hazard: do not copy blindly

The Eve artifact flow is a useful concrete counterexample to “a timed lease makes
deletion safe.” The inspected code contains this possible schedule:

1. `begin_eve_replay_artifact_deletion` locks the artifact, checks holds, records
   [deletion start and returns](../../../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:418).
2. The application worker pauses before
   [Storage removal](../../../../../packages/api/src/eve/retention/control.ts:240).
3. After 15 minutes, hold creation can clear the old deletion marker and accept a
   hold: [artifact and category branches](../../../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:278).
4. The paused worker resumes with its earlier successful Boolean and calls
   `Storage.remove`. Its request carries no current hold/deletion generation.
   The later [finalization hold check](../../../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:464)
   can prevent marking metadata expired; it cannot restore already removed bytes.

**Impact:** possible loss of held bytes under that schedule; high severity,
plausible under a long pause or ambiguous external completion. This is a static
source finding in an adjacent domain, not a reproduced incident or an active D28
implementation defect. No relevant later replacement of the inspected functions
was found in the bounded migration search.

**Permanent D28 prevention:** prefer the source's existing Postgres body and an
atomic body-disposition transaction where all affected bytes are in that source.
Do not introduce Storage merely to build retention. If a qualified existing copy
inventory includes Storage/provider objects, use a durable, ordered irreversible
deletion decision plus provider-specific confirmation/reconciliation; a timed-out
worker must not regain permission to delete a body that has become protected.
Once an external irreversible request may be in flight, do not claim a new hold
guarantees preservation of those bytes or clear its fence merely because time
passed. Surface the truthful unavailable/pending incident state to the authorized
records operator. Resolving ambiguous deletion must not reopen ordinary access.

## Primary technical rules verified for this review

1. **RLS is not a substitute for grants or immutable-column constraints.**
   [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
   separates schema exposure, table/function privileges and row policies.
   [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
   checks old rows with `USING` and new rows with `WITH CHECK`. For UPDATE/ALL,
   omitted `WITH CHECK` inherits `USING`; the skill's categorical claim that
   omission alone permits reassignment is overbroad. Still inspect both effective
   predicates and forbid caller changes to tenant, source identity, departure,
   policy basis, deadline, hold status, purge evidence and actor attribution.
2. **Privileged paths need the same business predicates.**
   [PG RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) states that
   superusers and `BYPASSRLS` roles bypass RLS; ordinary owners normally do too,
   unless `FORCE ROW LEVEL SECURITY` applies. A definer executes with its owner's
   privileges; it does not automatically have every possible bypass. Invoker
   views/functions are preferable when suitable. Audit actual owners, `EXECUTE`
   grants/search paths and service credentials; FORCE is not a service-role fence.
   RLS does not cover `TRUNCATE`, and FK/uniqueness checks can leak existence through
   errors. Browser policy editors must not gain body reads or destructive table
   privileges because they may change the organization setting.
3. **Time and cross-row ordering need explicit qualification.**
   [PG time functions](https://www.postgresql.org/docs/17/functions-datetime.html)
   distinguish transaction-start `now()`/`CURRENT_TIMESTAMP` from actual
   `clock_timestamp()`. [Read Committed](https://www.postgresql.org/docs/17/transaction-iso.html)
   can combine a newer updated row with older cross-table snapshots;
   [RLS documentation](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
   explicitly warns about policy subquery races. After waits, read current source,
   policy/hold state and actual decision time within the qualified ordering
   protocol. A transaction or a row lock alone is not proof all relevant predicate
   changes are ordered. A shared source fence must cover creation of a hold when
   no hold row existed; locking an empty hold lookup cannot do that.
4. **Queue selection is not full disposal proof.**
   [PG SKIP LOCKED](https://www.postgresql.org/docs/17/sql-select.html) is suitable
   for queue-like consumers but gives an inconsistent view unsuitable for general
   authoritative reads. It can prevent workers claiming the same available row;
   it does not serialize every policy/return/hold mutation or prove external
   deletion. Use bounded indexed work, semantic idempotency and fair revisits of
   skipped rows. No skill's illustrative 10×/100–1000× claim is a measured Core
   throughput result; a full table scan is not inherently exponential.
5. **Account and Storage metadata do not confer access/disposal guarantees.**
   [Supabase Auth](https://supabase.com/docs/guides/auth/managing-user-data)
   documents that deletion does not retroactively invalidate issued JWTs, and
   Storage ownership can block Auth deletion.
   [Storage ownership](https://supabase.com/docs/guides/storage/security/ownership)
   says owner metadata alone grants no access. Use current source authority, not
   stale JWT metadata or an object owner ID, for the preparation boundary.
6. **Database backup is not Storage backup or deletion reconciliation.**
   [Supabase backups](https://supabase.com/docs/guides/platform/backups) exclude
   Storage object bytes; restoring an older database does not restore subsequently
   deleted objects. [Storage deletion](https://supabase.com/docs/guides/storage/management/delete-objects)
   requires the Storage API; deleting metadata with SQL leaves orphaned objects.
   Its current `remove` limit is 1000 objects/request, not a D28 chosen batch size.
   Proving database DELETE success does not prove deletion from derivatives,
   backups or a separate provider. Backup retention windows are deployment facts,
   not preparation policy durations.
7. **Changelog review adds qualification dependencies, not new architecture.**
   [PG minor-release notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
   calls out extension/operator/index/encryption compatibility;
   [TLS notice](https://supabase.com/changelog/cbc-tls-ciphers-deprecated) announces
   CBC cipher removal no earlier than November 10, 2026. Installed versions and
   clients must be checked at implementation. The
   [backup scheduling fix](https://supabase.com/changelog/bulk-prepare-retry-on-transient-failure)
   and [restore credential fix](https://supabase.com/changelog/restore-credential-resync)
   are provider evidence that job acceptance/restoration must be observed and
   reconciled. They are fixed issues, not claims the same defect remains deployed.

## Lean source model and exact amendment requirements

These are invariants and recommended command semantics, not a request for new
tables/services. Reuse a qualified source mechanism where it already represents
them. P9 owns preparation facts/disposition; P12 owns administration and access;
the platform supplies infrastructure without becoming the record owner.

| ID   | Exact requirement to carry into the developing contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DB01 | **Policy scope:** one organization setting for this exact ordinary private-preparation departure purpose. The server MUST resolve tenant and staff capability. Supported periods MUST be finite, positive, unambiguous and source/privacy qualified; NULL/zero/missing configuration MUST NOT mean forever or silently trigger deletion. No donor/task/financial policy inherits this value.                                                                                                                                                                                                                                                             |
| DB02 | **Version and effect:** ordinary changes MUST create an effective-dated policy revision and apply prospectively to newly effective confirmed departures. Existing eligible departure cohorts retain their pinned revision/deadline. The UI MUST explain prospective scope. Any separately required corrective transition for legal/privacy reasons follows its source-owned authority and impact review, not an undocumented backfill.                                                                                                                                                                                                                   |
| DB03 | **Departure trigger:** capture canonical source departure identity, exact affected participation/scope, authoritative effective time and distinct observation time. Select the policy effective at that departure time, not webhook delivery time, last login, profile update or the time a retry runs. Late/backdated events with no qualified historical policy/trigger MUST enter source review; no guessed date or indefinite default.                                                                                                                                                                                                               |
| DB04 | **One deadline:** derive the ordinary deadline deterministically from the same departure and pinned supported unit/rule; record the resolved instant and policy evidence. Duration units/calendar interpretation/timezone MUST be explicit. Generic `updated_at`, note edit, archive, login, duplicate departure or delivery retry MUST NOT restart it. Immutable original author/scope remain separate from current actor and retention episode.                                                                                                                                                                                                        |
| DB05 | **Access cutoff:** every ordinary discovery/count/search/snippet/read/Resume/result-recovery path MUST require a readable body, current history authority and actual time strictly before the applicable deadline. Equality is expired. Missing/held-only/expired/erased material MUST NOT appear as recoverable. Purge backlog, stale replicas and cached grants MUST NOT extend this window. Previously delivered information cannot be recalled; qualify client invalidation and revoke late responses.                                                                                                                                               |
| DB06 | **Return ordering:** a genuine current-work retention admission, if explicitly selected by D28 and authorized by the owner, MUST order against expiry/hold/erasure and preserve the original departure/policy history. Login, reactivated membership or changing a display list MUST NOT themselves reset retention. Whether to compose admission with the deliberate D27 action is the parent decision's explicit amendment; do not infer it from A's selection of who sets the period.                                                                                                                                                                 |
| DB07 | **Expiry and hold:** ordinary eligibility expires independently of physical purge. An accepted active hold can preserve its scoped evidence under its own authority, but MUST NOT reopen ordinary use. Hold release MUST recompute current disposition and purge eligibility from the existing basis, never grant a fresh full period. A later longer policy MUST NOT revive already-expired/erased ordinary availability or turn held-only evidence into a resumable body.                                                                                                                                                                              |
| DB08 | **Database integrity:** tenant/source identities MUST be non-null for new qualified rows and enforced by tenant-aware references/unique constraints. Any relation to a departure/policy/hold/disposal item MUST preserve exact source scope. At most one effective disposition basis and one terminal disposal effect may exist for the same body generation and departure episode. Lifecycle combinations, finite durations and timestamp order MUST be constrained; immutable identity/basis fields MUST not be caller-editable. Do not use generic `ON DELETE CASCADE` from account/assignment as body disposition.                                   |
| DB09 | **Atomic DB disposition:** for source-local bytes, current hold/return/erasure/policy checks, logical expiry/purge decision, body removal and minimal disposition evidence MUST form one ordered transaction or equivalently proven source protocol. Relevant competing commands MUST use that protocol, including holds whose row does not yet exist. After lock waits, recheck actual time/current basis. Do not catch a hold conflict and continue deleting.                                                                                                                                                                                          |
| DB10 | **Derivative disposal:** inventory only actual copies. Search/cache/history/exports/Storage/provider references MUST have source-qualified disposition. Where cross-system removal is necessary, persist intent and exact object generation before external deletion; distinguish not-started, in-progress/ambiguous and verified completion. A lost provider response MUST not mark success or reopen access; retry/reconcile the same effect. No reusable object path may allow a stale worker to delete newer bytes.                                                                                                                                  |
| DB11 | **Minimal evidence and restore:** retained disposal evidence MUST identify the source body generation, applicable policy/trigger, reason, actor/service and outcome without retaining private body text, names/contact details or content hashes by default. Its own retention/access policy is separate. Before reopening a restored database, reconcile current erasure, expired deadline, hold, authority and completed/pending deletion evidence from a qualified surviving recovery source. A tombstone stored only inside the restored old snapshot cannot prove newer erasure. No indefinite shadow archive or new multi-cloud system is implied. |
| DB12 | **All access paths:** API authorization and database grants/RLS MUST preserve the same domain boundary for SELECT and effective old/new mutation checks. Cover actual views, RPC/definer owners, service jobs, Storage, GraphQL/REST, Realtime, exports and observability; disable unsupported paths. Policy administrators obtain no body-reader capability. Direct browser mutation of deadlines, departure identity, tenant, hold/purge state or audit attribution MUST be denied.                                                                                                                                                                    |
| DB13 | **Batches and recovery:** use indexed due-work selection, bounded claims/transactions, stable ordering and tenant fairness. Batch size and execution budget MUST be qualified on actual record/copy volumes. Skipped/failed work MUST remain visible and retryable without repeating a terminal business effect. A per-item error MUST not falsely certify the entire batch. Report logical expiry and confirmed physical completion separately.                                                                                                                                                                                                         |
| DB14 | **Enablement:** missing source/policy qualification MUST keep automatic purge and D28 activation unavailable, never guess a destructive default. Existing historical data MUST be inventoried and reconciled; do not infer an empty production source or apply a bulk timer from author/updated timestamps. Deploy compatible guards before UI/writers, prohibit old readers from bypassing cutoff, and preserve later denials/erasure across rollback and restore.                                                                                                                                                                                      |

No content new to this feature needs Storage. No generic privacy engine, arbitrary
tenant scripts, per-contact period, entire-account deletion, indefinite hold-by-
checkbox, admin body browser or replica of the preparation is required.

## Required proof and operation evidence

Before activation, verify these at real source/API/SQL and copy-provider seams:

- Cross-tenant/source FK rejection and hidden-safe errors; unauthorized policy
  writes; no private-body discovery through settings, diagnostics or held evidence.
- Exact author/current assignment/history access, same-user context changes,
  policy revision and expiry on direct reads, RPCs, privileged jobs and caches.
- Before/at/after deadline; lock wait crosses deadline; current UTC versus
  transaction-start time; selected duration unit/calendar/timezone boundaries.
- Duplicate/out-of-order/late/backdated departure; same-ID reactivation; historical
  policy unavailable; new policy before/after effective departure; no timer reset.
- Both orderings of current-work admission versus expiry/purge, hold placement
  versus purge, hold release versus retry, and source correction versus worker.
- Two workers, two transport keys, process death after DB acceptance, job timeout,
  provider delete success with lost response, and late stale-worker response.
  Demonstrate no held/newer byte loss and no false disposal success.
- Account/tenant/source deletion through the actual FK graph; preserve required
  evidence without keeping a login or private plaintext unnecessarily.
- Restore an older snapshot after later erasure/expiry/hold/access changes, with
  Storage bytes independently present/missing; keep ordinary access fenced until
  current reconciliation completes. Include delayed queues and search rebuilds.
- Measure production-shaped query/RLS plans, batch latency, lock contention,
  oldest due unheld item, copy-verification lag and per-tenant fairness. Do not
  infer capacity from illustrative skill speedups or an API's maximum batch size.

**Residual monitoring:** P9 lifecycle owner owns oldest overdue unheld disposal
and ambiguous-delete age; before launch, record numeric time budgets and route
any exceedance to bounded retry/reconciliation without reopening reads. P12/
security owns any confirmed post-cutoff unauthorized disclosure (threshold **1**:
fence affected reads and investigate). P9/privacy owns any held-body deletion,
deadline reset or erased-body restoration (threshold **1**: stop affected
disposal/restore path, preserve minimal incident evidence, repair/verify before
reenablement). Unknown copy completion must remain unknown, not be monitored as
if disposal succeeded. These signals complement release proof; none waives it.

This evidence supports the product decision and precise required safeguards.
It does not certify current implementation, live RLS, a legally qualified period,
physical erasure, backup coverage, accessible UI or production capacity.

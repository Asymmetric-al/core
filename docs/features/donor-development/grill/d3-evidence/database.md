# Phase 27 D3 — relational database and concurrency review

> Research input, 2026-10-09. The [consolidated D3 review](../phase27-d3-adversarial-review.md)
> reconciles recommendations and controls decision status. The
> [reproducible mechanics experiment](postgres-mechanics/README.md) is
> synthetic research evidence, not an application migration or qualification.

Research only, 2026-10-09. Repository `/workspace/core`; current code observations are bounded static evidence, not deployed qualification. Parent supplies the selected D3 A: ordinary financial and prayer ministry support shares one continuing relationship journey; extra journeys exist only for genuinely independent continuing purposes. D1 and amended D2 remain ratified. This review does not write a PRD, schema migration, app implementation or new remote issue.

**Recommendation: retain D3 A. PostgreSQL 17/Supabase can support it with ordinary relational constraints and a narrow source-owned transaction. D3 does not require a generic purpose registry, purpose graph, new permission engine, duplicate task engine or payment-style saga.** The important open decisions are admission observability and the lifetime of the continuing relationship. Neither a table design nor a partial unique index should accidentally decide those questions.

## Minimal conceptual shape, without freezing physical schema

The continuing relationship owns its admitted identity and progress and refers to the supporter Party and exact Ministry Assignment. The ordinary lane can be intrinsic to that source model. Prayer and financial participation are dimensions of that ordinary relationship; particular asks, tasks, interactions and finance facts remain their respective source records. A new gift, prayer response, annual appeal, staff member, representative, currency or displayed label does not create another relationship identity by itself. A permission boundary is also not, by itself, a new business purpose.

An independently continuing extra purpose needs authoritative business admission and stable identity when that feature is specified. Do not introduce a general-purpose catalog merely to represent the ordinary lane. Free text is a display label, not a trustworthy deduplication key. D3 does not yet establish an enumeration of extra purposes, an end/reopen rule, one-row-per-pair forever, or a mandatory purpose foreign key. Avoid the opposite shortcut of an unconstrained JSON blob or polymorphic arbitrary ID replacing stable source references.

Use normal relational enforcement once the owning sources exist:

- A Party reference must establish compatible Tenant scope. A Ministry Assignment reference must establish the exact Tenant and Legal Entity. Party may be Tenant-only: an invented `Party.LegalEntity` column or composite is not required. Where source tables expose appropriate keys, composite FKs enforce the actual allowed tuple. Authoritative source eligibility/current action authority remains a separate source-command check.
- Required identity and scope fields must be `NOT NULL`. A positive or allowed-value `CHECK` alone accepts NULL. Nullable composite FKs using default `MATCH SIMPLE` skip matching if any component is NULL; `MATCH FULL` prevents partial-null tuples but still permits the all-null tuple. Required references should be required, not patched with optional matching semantics.
- Database uniqueness is the concurrency floor for the ratified semantic identity/lifetime. Ordinary PostgreSQL UNIQUE treats NULLs as distinct. If an optional component legitimately belongs in identity, choose explicitly whether NULL is one identity (`NULLS NOT DISTINCT`) or whether separate keys are clearer. Prefer no optional component when the ordinary lane does not need one. Do not invent an extra purpose to get around a collision.
- Simple CHECKs constrain a row. Cross-row current eligibility, current permissions, effect admission and live obligations belong in owner-qualified transactions and appropriate database constraints, not a CHECK querying mutable external rows. PostgreSQL does not support a general cross-row CHECK guarantee.
- Preserve attributable history. Ordinary identity retirement should not blindly `ON DELETE CASCADE` away cultivation history, tasks or event evidence. Source owners decide correction, erasure and retention; a FK RESTRICT/NO ACTION boundary is a safer default for a continuing source association until that disposition is admitted. RESTRICT and deferred NO ACTION have different timing; choose for actual commands. This is not a requirement to retain prohibited private content forever.
- A PK/UNIQUE creates its index. A child FK does not automatically create an index on the referencing columns. Add only needed source lookup, RLS and traversal indexes based on actual queries and deletion/update paths. Do not duplicate a unique index automatically, add every proposed dashboard column, or adopt partitioning/materialized projections before evidence.

This is feasible normalized ownership, not a proposed SQL layout. The fixture described below deliberately uses toy field names and an ordinary-lane tuple to test mechanisms; that tuple is not a frozen Phase 27 key.

## Current implementation and compatibility evidence

All repository paths here are relative to `/workspace/core`.

| Evidence                                                                                                                                                                                                                      | What it establishes                                                                                              | What it does not establish                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/config.toml:32–34` declares `major_version = 17`                                                                                                                                                                    | Local project targets PostgreSQL major 17                                                                        | Actual hosted version, patch, grants or policies; none were queried                                                                          |
| Bounded exact-name search in `packages/api`, `packages/database`, `supabase/migrations`, `tests`, excluding Markdown, found no `MinistryAssignment`, `ministry_assignment`, `cultivation_enrollment`, `cultivationEnrollment` | No matching executable target implementation was found in those paths                                            | No differently named implementation anywhere, no remote deployment; absent target implementation is not a current exploit                    |
| `supabase/migrations/20250101000000_init_schema.sql:62–66` defines `donors.missionary_id` referencing `profiles(id)`                                                                                                          | Legacy association is a profile reference                                                                        | Exact Ministry Assignment, financial designation or a safe one-to-many backfill mapping                                                      |
| `packages/api/src/admin/mission-control-tasks/service.ts:62–77`; `store.ts:75–123`                                                                                                                                            | Existing task path inserts task, links and event through separate awaited Supabase operations                    | Atomic task/primary-edge/history/receipt admission; a second operation failure can leave the first committed under this shape                |
| `supabase/migrations/20260226100000_atomic_mutation_rpcs_and_donation_saga.sql:39–40,134–174`                                                                                                                                 | Existing owner precedent for scoped operation identity, a transaction-scoped lock and receipt-like replay lookup | Correct Phase 27 admission, fingerprint, current permission or receipt contract; do not copy payment saga machinery into ordinary enrollment |
| `tests/unit/packages/api/admin/mission-control-tasks.test.ts:232–254`                                                                                                                                                         | Current task unit fixture uses mocked insert/link/event dependencies                                             | A real PostgreSQL transaction, RLS, rollback or race proof                                                                                   |
| `tests/integration/supabase/donation-fee-replay-verification.sql:4,147`                                                                                                                                                       | Repository already has SQL integration verification wrapped in BEGIN/ROLLBACK                                    | Phase 27 behavior qualification; no application integration SQL was run for this review                                                      |

Current task persistence is concrete technical debt if reused for a compound Phase 27 creation. It is not evidence that a nonexistent Phase 27 command already performs unsafe writes. Existing service-owned task tables and source admission may need a narrow atomic owner operation; they do not need a second task database. Browser local mutation serialization cannot serialize another client or a background writer.

Skills read for this work: repository Supabase and Postgres best-practices skills, their relevant RLS/privilege/locking references, plugin `supabase:supabase` and `supabase:supabase-postgres-best-practices`, and cloud environment runtime isolation guidance. Their guidance is subordinate to the user's research-only scope. No application migration/reset, database helper with environment URL fallback, hosted query, seed, production credentials or remote change was used.

## Risks, exact prevention and acceptance evidence

Severity is consequence if the stated implementation mistake is made; likelihood is a qualitative conditional assessment, not incident frequency. None of the absent target behaviors below is alleged to be deployed.

### DB1 — hidden uniqueness becomes an existence oracle

**Critical consequence; plausible if raw inserts or generic UPSERT are exposed. D3 unchanged; admission contract remains open.** Unique/PK/FK integrity checking is not concealed by RLS. The lab proves a row invisible to SELECT still produces `23505`, while an absent key succeeds for the same role. Replacing the detailed message with “unavailable” only on conflicts still distinguishes existence from absent-row success.

**Prevention:** the source owner authorizes the exact creation/reuse operation and the minimum existence/reuse information its outcome conveys before exposing that distinction. A caller without that independently admitted authority receives the same bounded unavailable/deferred outcome before key-dependent success/conflict disclosure. Dedupe itself grants no new read authority, coordinator role, approval step or access to a ministry roster. Current P12 source admission must settle this UX boundary. Do not return an unrestricted row on conflict; do not duplicate hidden work to make creation succeed; do not use a no-op `DO UPDATE` to discover a hidden row. RLS, service role and definer functions are mechanisms, not proof of admission.

**Acceptance:** real source roles and exact context show no distinguishable hidden-row versus absent-row response where admission observability is denied, including result/metadata/count/search/log/export paths. An admitted create/reuse returns only its permitted projection; denied operations create zero rows/effects. Test raw table/RPC alternate doors and constraints, not just UI error text. The toy RLS test proves the hazard only; it does not qualify P12 or an actual response contract.

### DB2 — check-then-create races, empty CTE results or unauthorized overwrite

**High consequence; high likelihood under ordinary retries/concurrent users if preflight lookup is authority. D3 unchanged.** Two clients can both see no row. `INSERT … ON CONFLICT DO NOTHING RETURNING` returns nothing when it loses. At READ COMMITTED, a concurrent uncommitted row can be visible to uniqueness enforcement but invisible to the original statement snapshot. A single CTE INSERT plus fallback SELECT can therefore return zero rows even after the competing insert commits. The deterministic lab reproduced that exact case.

**Prevention:** once identity/lifetime is ratified, enforce the semantic key with an applicable nondeferrable unique constraint/index. After current source admission, use a narrow owner transaction: attempt targeted insertion; if it conflicts, use a separate statement with a fresh READ COMMITTED snapshot to reload and validate the winning row under current authority and source conditions. Handle a concurrent retirement/correction/revocation with bounded source-owner retry or safe conflict disposition. Do not assume the winner is visible or still valid. A blanket `ON CONFLICT DO NOTHING` that suppresses unrelated constraints hides errors; identify the intended arbiter. `DO UPDATE` is appropriate only for an explicitly authorized update, not a no-op trick to fetch existing private facts; it may execute update triggers, audit or revision behavior.

**Acceptance:** independent connections forced to the same source key converge to the same permitted relationship, preserve existing stage/owner/private fields, and create only the intended initial obligation/history. Tests must force actual blocking, not just hope that sleeps overlap. Include a hidden winner, changed lifetime/revision, revoked context and unrelated constraint failure. The lab proves normal SQL snapshot mechanics with known visible toy rows; it does not prove the source transaction or authorization.

### DB3 — a partial index silently decides pause, end and reopen

**High consequence; high likelihood if “active” is assumed to be the uniqueness predicate. D3 unchanged; lifetime decision required.** A unique index covering only a running state permits another row once the first is paused. Reopening the old row then collides. The lab demonstrated both facts. A perpetual unique pair can conversely prohibit genuinely permitted subsequent work or independent purposes.

**Prevention:** decide continuing relationship lifetime and admission/return semantics before choosing a current-slot predicate, state enum or uniqueness scope. Determine whether pause retains the same journey, what ending preserves, whether return reopens it, and how an already occupied permitted identity is resolved. Preserve history and unfinished obligations; no silent merge/deletion or newly labeled duplicate to appease SQL. A partial unique index may be appropriate after those decisions, but its predicate must encode the admitted lifetime precisely. The phrase “current slot” is hypothetical, not a newly ratified product state.

**Acceptance:** actual source tests cover pause/create, end/create, reopen-with-existing-work, independent approved purpose, correction into occupied identity and Party merge collisions according to the ratified rules. Conflict responses may not disclose unauthorized work. The toy states in this review settle none of those rules.

### DB4 — client batching is mistaken for a multi-table transaction

**High consequence; concrete risk in the inspected current task path. D3 unchanged; narrow implementation safeguard.** Awaiting a list of Supabase client requests, `Promise.all`, or UI optimistic batching does not join their server transactions. PostgREST normally executes each HTTP request in its own transaction. The lab proves a first autocommit parent remains after a later child insert fails, while the same two writes in one PostgreSQL transaction roll back together.

**Prevention:** creation/reuse plus any required next task/owned exception, task association, history and command receipt must share the source-owned transaction whenever they form one admitted operation. Use a narrow RPC/database function or an existing owner connection transaction. Separately delivered external effects need the established durable effect/outbox mechanism and source-purpose identity, not a claim that SQL and a remote send commit together. Do not require a new generic transaction framework or import the entire donation saga.

**Acceptance:** inject a failure after each write and before commit; no admitted parent without its required obligation/history/receipt. A lost response retries to the original permitted result. No task effect starts from an uncommitted/failed admission. Verify the real database and actual writer path; mocked call order does not establish atomicity.

### DB5 — resource uniqueness is mistaken for command/effect idempotency

**High consequence; plausible under browser retry, webhook or workflow replay. D3 unchanged.** A unique relationship alone cannot prevent a retry from adding another task, stage event or send. Conversely a new request UUID does not justify another ordinary relationship. Mutable display labels/purpose corrections must not change a previously intended native/workflow effect identity.

**Prevention:** keep three meanings distinct without building three generic systems: source semantic uniqueness for the continuing relationship; a source-owned command receipt with stable scoped operation identity and input meaning/fingerprint; existing source-purpose effect identity for intended native/workflow consequences. A retry is admitted under current authority and returns only a currently permitted receipt projection. Reusing a command key with a changed action/meaning must reject safely; an old receipt does not confer authority to read or execute today. The initial admitted transaction commits the source result and its receipt together. Effects remain owned by their accepted domain contracts.

**Acceptance:** same command/same inputs after response loss gives one result; same key/different intent rejects; distinct commands for same ordinary purpose converge without duplicating initial obligations; native/workflow path for the same intended effect runs it once; rename/correction/restore cannot replay a completed effect. These application receipts were not implemented or tested in the lab.

### DB6 — nullable or incomplete scope allows invalid references

**Critical for cross-scope disclosure/integrity; medium if developers use independent single-column IDs and optional scope. D3 unchanged.** The lab rejected wrong Party Tenant and wrong Ministry Legal Entity using tuple FKs; it also demonstrated nullable CHECK/UNIQUE/MATCH SIMPLE bypasses. A valid target ID alone does not prove the relationship row has compatible scope.

**Prevention:** use exact existing source scope, required identity components and enforceable composite relationships as above. Do not make Party entity-scoped merely for syntactic symmetry. Do not trust supplied Tenant/entity/actor IDs; resolve trusted context and authorize both existing and proposed rows. Constraints reinforce, but do not replace, P12 source action authority.

**Acceptance:** direct SQL and every admitted route reject cross-Tenant Party, wrong exact Ministry Entity, NULL required values and reassignment of permitted rows into forbidden scope. Resulting-row enforcement is tested as well as old-row selection. Actual owner scopes must be settled before deriving final constraint columns.

### DB7 — retention, backfill and old writers bypass the new identity

**High consequence; plausible during cutover if legacy profile relationships are reinterpreted. D3 unchanged.** Legacy profile linkage is not exact Ministry Assignment identity. A profile that belongs to several ministries cannot safely become one enrollment per ministry. Restoring an old snapshot may revive incompatible identity, grants or already completed effects; an old writer may continue profile-based inserts after new constraints/commands are adopted.

**Prevention:** retain only source-evidenced mappings; ambiguous data stays unresolved with an actionable owned disposition and creates no guessed extra purpose. Backfill and legacy task attachment are provenance work and emit zero newly approved cultivation task/message/stage effects. Fence incompatible writers as part of cutover; rollback cannot re-enable bypasses. Reconcile source corrections, current permission/retention disposition and accepted receipts before restoring affected reads/writes/jobs. Do not require wholesale legacy backfill or a new recovery platform merely for D3.

**Acceptance:** ambiguous one-profile/multiple-ministry fixtures do not fan out; rerunning/import interruption converges; old writer rejects; migrated legacy tasks create no approval/effect; restore predating revocation/erasure/completed effects cannot resurrect them. These rollout guarantees remain future source implementation qualification.

### DB8 — unnecessary indexing and abstractions add cost before evidence

**Medium consequence; plausible during premature optimization. D3 unchanged.** Another purpose registry, generalized polymorphic identity table, duplicated lifecycle engine, per-state projection, excessive index set or per-row network lookup creates complexity without helping the selected ordinary relationship. Partial-index predicates also affect planner usability; a parameterized clause may not imply the index predicate.

**Prevention:** reuse domain sources, one ordinary relationship owner and shared tasks. Use bounded permitted projections with query-driven indexes. Verify realistic EXPLAIN plans, RLS lookup shape and keyset/pagination needs only when actual queries and representative data exist. No arbitrary row limit, response-time SLA, capacity claim or mandatory partitioning follows from this experiment.

**Acceptance:** owner-qualified representative data and queries demonstrate bounded access and no per-row remote fetch under intended portfolio screens; inspect query plans and index write cost. Name only concrete zero-tolerance integrity/privacy monitors now: duplicate admitted ordinary identity, invalid source scope, unauthorized disclosure/effect. Latency and capacity thresholds remain measurements to propose and agree later, not measured results.

## Supabase implementation boundaries

PostgreSQL functions can express this narrow transactional work. Prefer invoker semantics where appropriate; a definer function runs with its owner's privileges and needs explicit caller/context validation, a safe pinned `search_path`, deliberate schema and EXECUTE grants, and no arbitrary privileged endpoint. Create/privilege changes should not open an unintended window. Supabase/PostgREST function invocation is a transport option, not a new permission grant or automatic correctness proof. Exposed schema/grants and RLS are separate gates. Existing broad policies can combine with new permissive policies; inspect all applicable policies, direct table grants, views, jobs and service-role routes rather than adding one apparently restrictive policy in isolation.

Current installed dependencies/source configuration are stronger evidence than a remembered SDK API; production patch/grants/policies still require owner-approved qualification at implementation time. This research used PostgreSQL 17.11 only in an isolated disposable lab. It does not claim that the hosted database has that version or that recent Supabase platform defaults changed existing object grants.

## Executed mechanics evidence and limits

All 21 checks passed on PostgreSQL 17.11. Files live in `/workspace/scratch/phase27-d3-db/`:

- `README.md`: reproduction command and interpretation limits.
- `run-lab.py`: creates and destroys the isolated local container, records metadata and invokes the fixture.
- `mechanics.py`: exact executable fixture and assertions; uses synthetic `lab` schema only.
- `setup.sql`: generated fixture SQL, not an application migration.
- `results.json`: all 21 observed pass results and race blocking evidence.
- `run-metadata.json`: exact digest/create command/timestamps/exit code/cleanup verification.

Exact image: `postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`. Container: `phase27-d3-postgres-lab`, local Unix Docker socket, `--network none`, no published ports, no host mounts, database on tmpfs. Container was removed and absence verified. Its 256 MiB/one CPU/128 MiB tmpfs limits are isolation settings, not proposed application capacity.

| Check group                                                                          | Observed result                                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact Party Tenant and Ministry Entity, required NULL and referenced ministry delete | Each invalid operation rejected with expected SQLSTATE                                                                                                             |
| CHECK/UNIQUE/composite FK nullable pitfalls                                          | CHECK permits NULL; default UNIQUE permits duplicate NULL keys; MATCH SIMPLE skips partial-null tuple; NULLS NOT DISTINCT and MATCH FULL reject the relevant cases |
| Hypothetical lifecycle partial index                                                 | Pausing releases bad running-only uniqueness; another same-key row inserts; old row reopening then conflicts                                                       |
| Atomic versus separate calls                                                         | Same-transaction child failure leaves zero parent; prior autocommit parent persists after separate failure                                                         |
| RLS/uniqueness                                                                       | Synthetic role cannot SELECT another owner's row; same-key INSERT gets 23505; absent-key INSERT succeeds                                                           |
| CTE snapshot race                                                                    | A stays uncommitted until observer proves B blocked by A through pg_blocking_pids; after A commits, single CTE returns zero despite one existing row               |
| Separate statement race                                                              | Same explicit barrier; separate READ COMMITTED lookup sees the winning row                                                                                         |
| Contention sample                                                                    | 16 submissions, at most eight concurrent client workers; one persisted row and one distinct returned ID                                                            |

The original sleep-scheduled counterexample was strengthened after review. Final races have no `pg_sleep`: A is held until `pg_stat_activity` and `pg_blocking_pids` show B blocked on A (`Lock`/`transactionid`), then A commits. Observation polling is bounded. This addresses reproducibility of the concurrency mechanism without asserting exhaustive scheduling proof.

No application schema, Supabase Auth/API/PostgREST integration, source admission, source receipt, lifecycle enum, owner authorization, expected revision, migration, backfill, merge/recovery, native/workflow effect, workload performance or actual deployment was tested. The synthetic SQL role is not a P12 capability context. Separate reload works for this known visible fixture; it must be reauthorized in the eventual source operation and may properly yield a safe conflict for hidden/changed work. Toy lifecycle states and keys are not final schema proposals.

## Primary documentation checked

Official pages fetched/read 2026-10-09. Relevant snapshots are in the mechanics evidence directory, except RLS/CREATE FUNCTION snapshots already obtained by the sibling authorization review.

| Source                                                                                         | Rule used                                                                                                                             |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)           | NULL CHECK behavior; UNIQUE NULLS NOT DISTINCT; compound FK/MATCH; required columns; index and delete semantics                       |
| [PostgreSQL 17 INSERT](https://www.postgresql.org/docs/17/sql-insert.html)                     | Targeted arbiter, blocking on conflicts, RETURNING only affected rows, DO UPDATE authority/semantics, nondeferrable conflict arbiters |
| [PostgreSQL 17 transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html) | READ COMMITTED fresh statement snapshots; invisible conflicts for DO NOTHING                                                          |
| [PostgreSQL 17 partial indexes](https://www.postgresql.org/docs/17/indexes-partial.html)       | Predicate limits uniqueness and query-planner applicability                                                                           |
| [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)          | Referential integrity checks bypass RLS and can expose covert channels                                                                |
| [PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html)    | Definer owner privileges, search path and execute grants                                                                              |
| [PostgREST 12 transactions](https://docs.postgrest.org/en/v12/references/transactions.html)    | Request transaction boundary, default READ COMMITTED and constraint rollback; docs behavior, not confirmed deployed PostgREST version |
| [Supabase database functions](https://supabase.com/docs/guides/database/functions)             | Function/RPC mechanism; invoker/definer and privilege care                                                                            |
| [Supabase cascade deletes](https://supabase.com/docs/guides/database/postgres/cascade-deletes) | Explicit deletion behavior choices                                                                                                    |

## Highest-leverage remaining question

D3's ordinary purpose boundary is coherent and implementable. Before physical identity/lifecycle constraints, settle: **when an ordinary continuing relationship is paused, ended and later resumed, is it the same journey, and what happens when independently admitted existing work already occupies that relationship identity?** That decision determines the uniqueness lifetime. Independently, exact P12 source admission must determine who may receive the minimum create/reuse result; no deduplication algorithm can invent that permission. These are source decisions, not reasons to add a generic purpose registry.

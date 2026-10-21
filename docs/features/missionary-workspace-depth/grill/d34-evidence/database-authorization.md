# D34 — Database, authorization and expiry evidence

Research date: 2026-10-18 UTC. Scope: optional, organization-permitted minimal
expired-referral history, including the loss of the last active relationship.
This is a proposed source-purpose amendment and implementation qualification
contract, not an implemented feature or a deployed security assessment. No live
database, application, migration, provider or earlier probe was changed or run.

The selected answer is supportable **with required amendments**: P9 owns the
referral and its source facts; P12 authorizes an exact minimal history purpose;
P28 renders that projection. A history entry is neither an active relationship,
a contact permission, a referral renewal nor a second stored copy of CRM data.

## Governing facts and the necessary amendment

| Evidence                                                                                                                                                                                                                                    | Established fact and implication                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [P28 owner boundary](../../../../prds/program-roadmap/owner-constraints.md:143)                                                                                                                                                             | Ordinary workspace Party enumeration requires an active supporter or referral relationship. A must explicitly amend this boundary for the qualified minimal expired-referral projection; an archive filter alone cannot authorize it. |
| [P9 referral owner](../../../../prds/program-roadmap/owner-constraints.md:81)                                                                                                                                                               | Referrals are source-owned graph edges with provenance, expiry and reporting, not free-text fields or a missionary-local referral store.                                                                                              |
| [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353), [A6/A7](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:378)                                              | Canonical same-Tenant edges, time bounds and retained lineage; derived relationships are read projections and display roles never authorize. D34 does not replace these facts with a contact-wide Expired status.                     |
| [P9 A9](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:409)                                                                                                                                              | Party merge re-points edges atomically and preserves tombstone/unmerge evidence. Neither merge nor a canonical redirect confers permission to the winner or to unrelated history.                                                     |
| [P9 cross-surface proof](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:917)                                                                                                                             | Assignment/linking does not grant current or earlier protected history; source/field/purpose gates apply to results and recovery. Private notes, activity and finance provenance cannot become identifying summaries.                 |
| [P12 principals and Tenant context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552)                                                                                                                | Exact current acting context and bounded source/purpose authority are required. Names, counts and options require permission. A role, former membership, prior display or original receipt of a referral is insufficient.             |
| [P12 projection/query/realtime](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1645), [purpose/contactability](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654) | Apply authorization inside selection and every egress surface; contactability is independent of readability. Restricted rows are push-silent. Purpose is bound to the door, not caller asserted.                                      |
| [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md:16)                                                                                                                                                      | Actual source projection-policy widening needs its governed distinct-human approval. Do not turn every ordinary history read into a new approval workflow; an allowed setting cannot bypass the owner’s widening rules.               |
| [ADR-0038 scope precision](../../../../adr/0038-purpose-owned-records-schedules-and-verified-disposal.md:144)                                                                                                                               | Purpose-owned disposal is a precedent, not a universal retention owner. P18/P21 schedules, D28 preparation periods or financial retention numbers cannot be copied into referral history.                                             |
| [Active P27 CRM amendment](../../../../../openspec/changes/add-donor-development/specs/crm-core/spec.md:21)                                                                                                                                 | Its new shared-interaction history exception is source/purpose specific, not a standing expired-referral permission. Active OpenSpec describes intended behavior, not deployed enforcement.                                           |

The minimal additional permission must be independently qualified even when
ordinary Party access has ended. It must not require ordinary full-Party read as
an implementation shortcut, and it must not grant that broader read to make a
query work. Organization permission is necessary; current source eligibility,
actor/context, field classification, purpose, residency and retained-data
restrictions remain subtractive. A missing or indeterminate qualified source
does not become a guessed permission.

## Fresh current-code inspection: useful machinery and unsafe reuse

Bounded case-insensitive searches for `referral`, private-prospect and
relationship-expiry producers in `packages/api`, `packages/auth`,
`packages/database`, `apps/missionary` and `supabase/migrations` did not establish
an implemented D34 source or capability. This is not an exhaustive absence
claim and says nothing about a live deployment. The P9 PRD explicitly labels its
older baseline historical and implementation qualification unproved.

| Current evidence                                                                                                                                                                                                                                  | What the code actually does                                                                                                                                                                                  | D34 implication; severity/likelihood if copied unchanged                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Missionary donor query](../../../../../packages/api/src/missionary-portal/donors.ts:489)                                                                                                                                                         | Uses the admin client, filters `tenant_id` and a legacy `missionary_id`, orders by name/id and uses offset pagination. It does not establish referral-purpose, expiry, retention or current field authority. | High/plausible: an assignment-scoped donor list is not D34 history eligibility. Keep scope filtering but qualify the new source-purpose path.                                                                                                        |
| [Donor output](../../../../../packages/api/src/missionary-portal/donors.ts:406), [select list](../../../../../packages/api/src/missionary-portal/donors.ts:436), [related reads](../../../../../packages/api/src/missionary-portal/donors.ts:532) | Named donor output includes email, phones, addresses, location, spouse, notes, tags, activities and financial fields; name falls back to email. It separately redacts anonymous donor identity.              | High/likely: merely hiding fields in a card or reusing `name ?? email` would expose forbidden contact/context. A small allowlisted DTO is required before egress. Existing anonymity logic is useful but is not a D34 purpose projection.            |
| [Status normalization](../../../../../packages/api/src/missionary-portal/donors.ts:174)                                                                                                                                                           | Unrecognized statuses normalize to `Active`.                                                                                                                                                                 | Moderate/likely: adding Expired to legacy donor data would mislabel it as current work. Referral lifecycle belongs to its own source; no contact-wide status mutation.                                                                               |
| [Legacy access assertion](../../../../../packages/api/src/missionary-portal/service.ts:277), [route helper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:14)                                                                | Checks donor id/Tenant/profile assignment; the helper checks the missionary role before using the admin client.                                                                                              | High/plausible: neither proves the new exact capability or active-assignment/history-purpose contract. Existing role checks must not become the source of D34 authority.                                                                             |
| [Admin client](../../../../../packages/database/supabase/admin.ts:22)                                                                                                                                                                             | The client is constructed with `SUPABASE_SERVICE_ROLE_KEY`, server-side.                                                                                                                                     | High/plausible: RLS cannot be assumed to constrain this service path. Apply the same current source/P12 predicate and field projection server-side; do not expose the key or raw owner relation.                                                     |
| [Browser grants and donor policy](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157)                                                                                                                   | Authenticated has SELECT on donors; the policy permits staff/super-admin or the donor’s own profile. This is not a missionary-history permission. Earlier public-read policies are explicitly removed.       | High/plausible: widening raw donor SELECT for D34 would grant table-column access, not just the minimal card. Inspect the whole migration chain and actual roles before release; no production exploit was executed here.                            |
| [Browser collection](../../../../../packages/database/collections/tables/people.ts:29)                                                                                                                                                            | Donor collection exists; Realtime is disabled pending production RLS/column review.                                                                                                                          | High/plausible: disabled subscriptions are not revoked table grants. Keep D34 off raw donor collections and independently test REST/GraphQL/RPC/export doors.                                                                                        |
| [Query key](../../../../../packages/database/hooks/missionary-portal.ts:100), [donor hook](../../../../../packages/database/hooks/missionary-donors.ts:149), [query defaults](../../../../../packages/database/providers/query-client.ts:81)      | Portal uses a constant key; donor key includes missionary id, with a 30-second stale time. Shared query defaults use 60-second stale time and five-minute collection time.                                   | High/plausible: these keys/timers alone do not partition D34 by current Tenant assignment, purpose or governance epoch and do not end access at a source deadline. They are caching behavior, not authorization guarantees.                          |
| [Existing session cleanup](../../../../../packages/auth/client-session.ts:56), [versioned session loads](../../../../../packages/auth/client-session.ts:140)                                                                                      | Auth user switches/sign-out clear query cache; auth-state loads are version checked.                                                                                                                         | Positive evidence: do not claim the app has no session isolation. D34 still needs same-user Tenant/assignment/policy/source changes and late data-response fencing; this code alone does not establish those cases.                                  |
| [Current auth context](../../../../../packages/auth/context.ts:249)                                                                                                                                                                               | Calls `auth.getUser`, resolves a profile and loads active memberships via RPC. Profile Tenant and a super-admin demo fallback remain in the current path.                                                    | High/plausible reuse gap against intended P12: qualify the exact current Tenant Authorization Context, without trusting caller ids, role fallback or stale historical assignment. This is a static mismatch, not a demonstrated cross-Tenant attack. |

The current donor response is bounded at 50 default/100 maximum rows, with
related-row reads capped at 2,000 ([source](../../../../../packages/api/src/missionary-portal/donors.ts:450)).
These are actual existing limits, **not** suitable evidence of D34 capacity or
permission-safe pagination. D34 does not need its expensive activities/pledges
fan-out at all. A safe history query can remain a narrow, paginated source read.

## Current primary technical guidance and corrections to shortcuts

The Supabase skill and local repository overlay were read. The current changelog,
current Supabase RLS/Data API guidance and PostgreSQL 17 reference pages were
retrieved fresh; evidence hashes appear below. The deployed PostgreSQL/Supabase
version and effective catalog were not inspected. PostgreSQL 17 is a reference
baseline, not a claim about production.

1. **Grants and RLS are separate.** A table grant permits the operation; RLS
   determines eligible rows. RLS does not implement column projection by itself.
   Current Supabase guidance discusses project-specific default privileges and
   explicit exposure. The April 2026 default-exposure change does not retroactively
   revoke committed donor grants. Inspect ACLs, schemas, policies and alternate
   RPC/view/GraphQL paths together.
2. **Correct the skill’s overbroad `WITH CHECK` warning.** PostgreSQL uses `USING`
   as the new-row check for UPDATE/ALL when a separate `WITH CHECK` is omitted.
   Omission alone does not prove reassignment is possible. Inspect the actual
   predicates, all permissive policies, grants, trigger effects and resulting
   state. Explicitly test old/new Tenant, endpoint, author, classification,
   source-generation and lifecycle transformations. `WITH CHECK` is not an
   old-versus-new immutability comparison; a valid new row can still be an
   unauthorized retargeting without immutable-field constraints/commands.
3. **Policy composition matters.** Applicable permissive policies combine with
   OR; an added permissive false policy is not a universal deny. Restrictive
   policies require an applicable permissive admission and combine with AND.
   Source gates must survive other legacy policies and `RETURNING`/SELECT needs.
4. **Definer and view semantics are privilege dependent.** A `SECURITY DEFINER`
   function runs with its owner’s privileges. Superusers and `BYPASSRLS` bypass
   RLS; table owners ordinarily bypass it unless forced. `FORCE ROW LEVEL
SECURITY` does not constrain a superuser/BYPASSRLS role. An invoker function
   does not repair a caller that already has privileged access. A normal view
   applies owner privileges/policies; `security_invoker` uses the caller’s
   underlying permissions/policies. Do not grant full underlying donor access
   merely to make an invoker view succeed. Use the qualified owner service and
   exact projection without inventing another authorization system.
5. **Function exposure is not just a filename.** PostgreSQL grants function
   EXECUTE to PUBLIC by default, but real exposure also depends on schema USAGE,
   explicit ACLs, exposed schemas and the call path. Harden actual callable
   functions, owner privileges and `search_path`; never claim every definer in
   `public` is necessarily reachable after explicit revocations.
6. **Time and concurrent visibility need an actual fence.** `now()` and
   `CURRENT_TIMESTAMP` use transaction-start time; `clock_timestamp()` is actual
   current time. READ COMMITTED permits successive statements to see different
   snapshots, and a row-lock wait does not make every earlier authorization
   subquery current. A read must re-prove relevant source/policy/assignment and
   actual-time eligibility at its defined disclosure-release point after waits.
   No cleanup job, cached Active flag or client timer can extend that boundary.
   Choose the owner’s existing lock/revision strategy; D34 need not impose
   SERIALIZABLE on every list read.
7. **A stable page is not a stable grant.** PostgreSQL requires deterministic
   ordering for predictable LIMIT results, and large OFFSET still computes
   skipped rows. P9 already selects keyset pagination. Bound pages, use a stable
   opaque tie-breaker and scope cursors to the current authorized projection.
   Re-evaluate eligibility on every page; never freeze old permission into a
   cursor or fetch unauthorized rows and filter them only after computing count,
   `hasMore`, sort position or snippets.

## Exact proposed requirements and minimal invariants

These specify outcomes for later source-owner integration. They do not freeze a
new table, grant ledger, background materialization or subsystem.

**DB34-01 — Narrow purpose.** P9/P12 SHALL authorize a separate minimal
expired-referral-history projection for an exact currently eligible missionary
and source context when the organization permits it, including when no active
supporter/referral relationship remains. That admission SHALL NOT widen ordinary
Party enumeration/detail, contactability, private referral context or staff notes.
No historical membership, old assignment, URL possession or displayed role
substitutes for current authority. A new assignee does not inherit a predecessor’s
history without an independently qualified source/history grant.

**DB34-02 — One source and exact identity.** The entry SHALL derive from the
canonical retained P9 referral occurrence and current permitted identification.
Source Tenant, endpoints, relevant ministry/assignment scope, original attribution
and occurrence/generation SHALL remain unambiguous. Same-Tenant composite
relationships, required keys and valid source states SHALL be enforced at the
owner boundary and through database constraints where possible. Do not copy a
name/body into a P28 archive to preserve access after the source denies it.

**DB34-03 — Explicit small response.** The response SHALL contain only the
currently approved identifier/display label, source-qualified Expired label and
any individually approved date needed for recognition. Names, initials, aliases,
counts, dates and existence are protected data. No email-as-name fallback,
avatar, address, phone, referrer identity, message, reason, relationship graph,
financial amount, hidden source id or context-bearing URL is implicitly allowed.
Where even existence/recognition is denied, omit the entry and its counts; a
“Protected referral” placeholder is not automatically safe. D34 approves no
new file, attachment, export or public/coach projection.

**DB34-04 — Source temporal truth.** Referral expiry, loss of ordinary Party
access, eligibility to read history and data retention SHALL remain distinct.
Use source-confirmed occurrence and deadline precision; no universal timeout,
client-inferred timezone, date-only midnight conversion or cleanup timestamp may
invent expiry. Validate current time and source state at disclosure after waits.
An expiry/retention job running late SHALL not retain contact authority or expose
history past its permitted use. Unknown/unavailable source state is not Expired.

**DB34-05 — Current revocation and availability.** Organization policy Off,
membership/assignment loss, revoked purpose access, changed classification,
source disposition and disposal SHALL prevent later unauthorized disclosure
without destroying lawful source history. A transient unavailable source SHALL
produce an honest unavailable result, not permanent revocation, false expiry or
fallback to stale contact data. Re-enable/regrant re-proves current eligibility;
it does not restore ended grants, disposed PII, contact authority or old pending
responses. The system can fence new release and clear controlled client caches;
it cannot retract bytes legitimately delivered before revocation or screenshots.

**DB34-06 — Independent access stays independent.** If another currently valid
supporter/referral relationship permits ordinary Party access, preserve that
separate path and its exact field/purpose floor. Expired-history access SHALL not
reveal the old referral body through it, and expiry SHALL not wrongly revoke the
surviving independent permission. The entry remains an expired source occurrence;
it does not make the whole person Expired. Do not reveal otherwise hidden
relationships through a “has another relationship” explanation.

**DB34-07 — Merge, correction and return.** Source corrections, Party merge,
unmerge and endpoint repair SHALL preserve source attribution and current
authorization; identity redirects SHALL not union permissions or leak winner
labels/contact fields. Test original and canonical endpoint restrictions and
newly classified labels. Any source-authorized succession re-proves its exact
scope. D34 history viewing SHALL neither renew an expired referral nor generate
new follow-up, a continuation request, a task or a notification. Continuation is
a separate later decision and source action, never a raw status update.

**DB34-08 — Uniform protected query.** Selection, search predicates, sorting,
counts, facets, pagination, detail, empty states, deep links and errors SHALL use
the same current source-purpose floor. Searching an email/phone/private-context
term must not reveal that an otherwise minimal row matched a forbidden field.
Neither masked labels nor an empty UI correct a leak already present in JSON,
prefetch, cursor contents, logs or database access. Preserve P12’s denied/missing
uniformity contract; retain diagnostic distinctions only in their authorized
security channel.

**DB34-09 — Privilege and mutation closure.** History is read-only. Browser
grants, RLS, views, RPCs, service roles, imports, workers, repair commands and
backups SHALL not create an alternate raw-data or lifecycle-write path. Existing
source policy/lifecycle changes use current trusted actor/Tenant context, exact
capabilities and allowed resulting states; immutable attribution/source endpoints
cannot be retargeted via a generic update. Source policy changes retain their
atomic required audit/semantic result, revision checks and ADR-0211 review where
the change actually widens governed projection policy.

**DB34-10 — Cache and egress closure.** Server/client query and cursor scope
SHALL include current principal, validated Tenant assignment, source/context,
projection purpose and relevant policy/source revision or equivalent enforced
invalidation. Apply current source and actual-time eligibility on each read,
including restoration/back-forward navigation. Clear forbidden controlled
content when context changes and discard late prior-context results. Realtime
must follow P12’s qualified signal-only/push-silent rules; do not introduce raw
Postgres-change payloads or sensitive row ids as an expiry notification.

**DB34-11 — Retention is not access.** Referral source-class retention, holds,
redaction and verified disposal govern the underlying record and every allowed
derived copy. Retaining an edge’s minimal lineage does not require retaining
identifying text forever or granting it to Maya. Hold preserves only its lawful
retention effect, not ordinary discovery. History reads, re-enable, repeat fetch,
merge or a new membership SHALL not reset source retention or resurrect disposed
content. Restore must reconcile newer privacy/disposition restrictions before
opening the historical reader. D34 imports no P18/P21/D28 numerical schedule.

**DB34-12 — Bounded source query and rollout.** Reuse P9’s set-based projection,
appropriate Tenant/context/time indexes and keyset list machinery. Do not fetch
full activity/finance histories, run N+1 permission queries or copy results into a
second durable list. Declare actual source-shaped page/payload/query budgets
before activation; test skewed tenants and deadlines/concurrent restriction
changes with real query plans. Qualify the exact P9/P12 historical producer and
all writer/read paths before exposing the option. Mixed deployment or a kill
switch must deny the new projection safely without deleting source history or
breaking independently authorized current work. No guessed migration from
legacy donor.status or bulk historical access backfill is authorized.

## Falsifiable release proof

| Case                                  | Required observable outcome                                                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last active relationship ends         | Ordinary Party/contact access ends according to its source rule; only an independently approved D34 entry remains. Without the minimal history permission nothing is enumerated.                                  |
| One independent relationship survives | Its permitted ordinary access remains; no protected expired referral context appears through the history card or ordinary path.                                                                                   |
| Names and query predicates            | Denied names, aliases, counts, phone/email search matches, dates, hidden relationship count and cursor data reveal nothing through list/detail/search/error/empty states.                                         |
| Boundary time and delayed cleanup     | Reads before/at/after the actual source deadline obey its exact inclusive/exclusive rule despite delayed cleanup and lock waits; transaction-start time does not extend access.                                   |
| Policy/authorization race             | A read delayed across Off/revocation/source restriction cannot release a now-forbidden payload; a completed earlier release is not falsely claimed recoverable.                                                   |
| Availability                          | Unavailable source produces no guessed Expired/Deleted state and no stale unredacted fallback; a later eligible retry works without creating history or changing source state.                                    |
| Same user, different context          | Tenant/assignment/purpose switches invalidate or isolate cached pages, prefetch, deep links and late responses; user-switch cleanup alone is insufficient.                                                        |
| Ended and recreated assignment        | Same human/role/email does not revive the old history grant; current exact eligibility is proven again.                                                                                                           |
| Party merge/unmerge                   | Same-Tenant lineage is preserved; canonical resolution does not disclose a forbidden winner, union unrelated contexts or reset history/retention.                                                                 |
| Direct/privileged paths               | Real anon/authenticated/nonowner and service/API/RPC/view/GraphQL paths cannot reach raw donor/contact/referral text through the D34 grant. Test the effective policy union and actual function owners/ACLs.      |
| Forbidden mutation                    | Direct INSERT/UPDATE/UPSERT/DELETE/RETURNING and owner commands cannot convert history read into continuation, shift Tenant/endpoints/author, change purpose/classification or manufacture valid lifecycle state. |
| Retention and hold                    | Ended use is denied while lawful held data remains; disposal removes eligible PII; restore cannot resurrect a newer denied/disposed projection. No view or cache becomes retention authority.                     |
| Pagination and scope change           | Each page re-proves current scope; changes do not expose hidden `hasMore`, counts or cursor fields. Repeat page loads have no side effects and no silent truncation.                                              |
| Source correction                     | Corrected identification/expiry displays only when permitted; no fabricated dates and no automatic renewal, task, message or contact action.                                                                      |
| Workload                              | Approved measured limits are tested below/at/above their boundary with real database query plans, concurrent changes and large skewed tenants; no capacity number is inferred from this note.                     |
| Rollout                               | Old/new readers and writers cannot widen raw access; unavailable qualification denies the lane while preserving current independently authorized workflows and lawful source history.                             |

These are proof obligations. No SQL/RLS, race, browser, load or production test
was run for this evidence note. No old finite model/probe was rerun. Static
source checks and official documentation establish requirements, not runtime
qualification.

## Fresh primary retrieval evidence

All pages were retrieved with HTTP GET on 2026-10-18 UTC. SHA-256 pins bytes
actually read; retrieval dates do not assert publication dates. The changelog
was scanned for relevant breaking changes; exposure defaults and the PG
15.19/17.11 upgrade entry were followed. They require actual environment
qualification, not a schema/workflow change in this review.

| Primary page                                                                                                                                      | HTTP | SHA-256                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------ |
| [Supabase changelog](https://supabase.com/changelog.md)                                                                                           | 200  | `15b3d0d1a7dc3b3f2c0af4788e49acfdf2d2edbd2613f22de0705fa43b1cf58b` |
| [Supabase Data API security](https://supabase.com/docs/guides/api/securing-your-api.md)                                                           | 200  | `d2c47fd37a58003f294e11f47cdb05bdd2bb853f350c006a9e6a2c4249868e46` |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security.md)                                                          | 200  | `9398df00c60160ffbbdf9b53f02e61bd34db000d291152a3268a00a95e4cdac8` |
| [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                              | 200  | `1772bf6791789204d77a0ed3e35c0ff2f7ea988fb71f64a0b4b3a19908fad6a6` |
| [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                                                                | 200  | `4cdf084d8e36009d03790c508585bd7c4c237aac4165dbbc9173866dbffc980e` |
| [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html)                                                          | 200  | `887e05c52a98890006d7d63cd1dcbb933309376ff78967bef6693f247dddbf43` |
| [PostgreSQL date/time](https://www.postgresql.org/docs/17/functions-datetime.html)                                                                | 200  | `20965f1539d658c525d403ad548d697cfcb8967f4faf8f81127373572f33821d` |
| [PostgreSQL transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html)                                                       | 200  | `e3475df0c76b214dbda0bc681015099763b83778e1355e17ee7b908e6fd38a26` |
| [PostgreSQL LIMIT/OFFSET](https://www.postgresql.org/docs/17/queries-limit.html)                                                                  | 200  | `f57b5f91f744f763a52a29a7a1d080622e2e00cdd1b609b4316b74f6fafba8cb` |
| [PostgreSQL view/rule privileges](https://www.postgresql.org/docs/17/rules-privileges.html)                                                       | 200  | `467c1611b1242d412698b40040e066dea247397b13991eb12397da6a6c253ad8` |
| [Supabase exposure-default change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) | 200  | `4a0fb17f6dd7a07e5185021a4dd3ba4ebe930a22886821524a87823dc7884124` |
| [Supabase PG minor-upgrade notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)                                          | 200  | `6e6cf7ac6205aa27b024dd6bb6c3e2e8124160b75841edffd852f7cbce8b73a6` |

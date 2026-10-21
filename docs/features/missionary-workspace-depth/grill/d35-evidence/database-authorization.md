# D35 — Continuation command, database and authorization review

Research date: 2026-10-18 UTC. Repository HEAD:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`, with the existing working tree.
Scope: the selected option permits an organization-authorized missionary to
deliberately continue an eligible ordinarily expired referral; independently
authorized staff can still act. Tenant control is requested. This note proposes
precise engineering amendments; it does not establish ratification, a deployed
source, a schema or an implemented permission.

**Accept with required amendments.** Continue the same canonical referral
through its qualified P9 owner, with a distinct attributable continuation of the
exact expired cycle. Preserve old history and consumed effects. Never implement
this by editing donor status, clearing an end date without lineage, reopening a
task, cloning a contact or granting staff access to a missionary.

## Owner requirements that constrain the design

| Repository evidence                                                                                                                                                                                                                   | Consequence for D35                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Founder referral journey](../phase28-founder-brief.md:137)                                                                                                                                                                           | Source provenance, expiry, cannot-pursue dispositions and deliberate continuation are required; continuation itself grants no contact permission.                                                                                                                                                                                                                              |
| [P9 ownership](../../../../prds/program-roadmap/owner-constraints.md:81)                                                                                                                                                              | Referral edges, expiry and reporting belong to P9; P28 consumes them.                                                                                                                                                                                                                                                                                                          |
| [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)                                                                                                                                        | Source relationships have same-Tenant endpoint FKs, time bounds, retained history and active logical uniqueness. Continuing must preserve these invariants and handle another compatible active edge without inventing a duplicate.                                                                                                                                            |
| [P9 A9](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:409)                                                                                                                                        | Merge/repoint/unmerge are owner transactions with preserved evidence. Continuation cannot silently redirect a stale command to a different Party or union access/history.                                                                                                                                                                                                      |
| [P9 A17](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:581)                                                                                                                                       | Native capability-checked writes commit source row, audit and required activity emission together. `crm_command_logs` is reserved for future async provider work; donate-path idempotency headers remain money-only. Expected source revision plus narrow change-record correlation is a precedent for durable duplicate/lost-response recovery without a generic CRM journal. |
| [P12 exact actor/context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [purpose/contactability](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654) | Current Tenant assignment, exact capability, source/ministry scope, fields and purpose govern execution and result disclosure. A missionary can hold bounded action rights without a staff role. Readable does not mean contactable.                                                                                                                                           |
| [D34 ratified history boundary](../phase28-d34-expired-referral-history-adversarial-review.md:173)                                                                                                                                    | Historical referral recognition and current continuation authority remain separate. A history row, old membership, original authorship or link does not grant action rights. D35 does not reopen D34’s limited field projection.                                                                                                                                               |
| [P27 return](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:377)                                                                                                                                      | Reopening cultivation preserves cycles and does not revive consumed children or revoked rights. This is a useful invariant, not a referral producer or a transferable staff-only permission.                                                                                                                                                                                   |
| [ADR-0183 source tasks](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:71)                                                                                                                              | Source tasks cannot be generically reopened; old occurrences remain ended and source actions own applicability. D35 selects no automatic new task or notification.                                                                                                                                                                                                             |
| [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md:16)                                                                                                                                                | Govern any actual source projection-policy widening through its distinct-human approval. An ordinary qualified continuation is not automatically a new policy approval or a supervisory workflow.                                                                                                                                                                              |

**A17 reconciliation is material.** D35 requires durable same-intent recovery and
at most one continuation of an expired cycle, but that does not justify a new
generic CRM/provider journal or reuse of a payment idempotency header. Persist
the minimum intent/outcome correlation with the source continuation/change
evidence or its existing qualified mechanism. The later owner contract must
prove the outcome, not freeze a speculative table named “command receipts.”

## Fresh implementation inspection and limits

Fresh bounded searches of missionary/CRM APIs, auth and migration paths did not
establish a referral-expiry/continuation source. The only searched migration
`relationship_type` match was a different identity-representation relationship;
it does not prove the P9 referral graph exists. This is not a repository-wide
absence claim or a live deployment assessment. The inspected paths are still
useful evidence of what **must not** be copied unchanged.

| Current source                                                                                                                                                                  | Actual behavior                                                                                                                                                                       | Material reuse concern and assessment                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Donor patch schema](../../../../../packages/api/src/missionary-portal/donor.ts:25), [mutation](../../../../../packages/api/src/missionary-portal/donor.ts:174)                 | A contact-wide Active/Lapsed/New/At Risk status and many personal fields are updated through the admin client. The query applies id/Tenant/profile and explicit anonymity predicates. | High/plausible if reused: it has no referral occurrence, ordinary-expiry proof, expected cycle, continuation terms, preserved transition result or same-effect recovery. The real tenant/anonymity checks are positive evidence, not a complete continuation contract. |
| [Activity mutation](../../../../../packages/api/src/missionary-portal/donor.ts:120), [access assertion](../../../../../packages/api/src/missionary-portal/service.ts:278)       | Performs a donor-assignment lookup, then a separate activity insert. The access helper proves id/Tenant/profile assignment only.                                                      | High/plausible: precheck then insert is not a lock/revision fence with policy Off or source changes; an activity row cannot be the continuation authority or an invented outreach event. No exploit was executed.                                                      |
| [Missionary operation helper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:14), [admin client](../../../../../packages/database/supabase/admin.ts:22)     | Checks the missionary role and uses a server-side service-role client.                                                                                                                | High/plausible: role and assignment are not the new exact P12 action, and RLS cannot be presumed to constrain service-role writes. Re-prove source/action authority at the owner transaction.                                                                          |
| [Generic operation wrapper](../../../../../packages/api/src/shared/with-operation.ts:128)                                                                                       | Generates a fresh `requestId`, obtains auth/audit helpers and invokes the handler.                                                                                                    | High/plausible: a per-request correlation id is not durable business-effect deduplication, atomic audit, a transaction or replay evidence. Preserve correlation logging without claiming guarantees this wrapper does not implement.                                   |
| [CRM relationship route](../../../../../packages/api/src/admin/crm/relationships/index.ts:12), [service](../../../../../packages/api/src/admin/crm/relationships/service.ts:43) | A read route maps current local donors/profiles/missionaries/pledges/member-care activities into a report; it fetches collections before slicing an offset page.                      | High/plausible: this is a composed report, not a stored P9 referral command. Do not add Continue to this report by changing a derived row. Its full-source read shape is not a continuation performance design.                                                        |
| [CRM access helper](../../../../../packages/api/src/crm/auth/access.ts:22)                                                                                                      | Staff-role checks and Tenant checks construct an actor with the requested action string.                                                                                              | High/plausible: naming `crm.relationship.read`/another action does not prove a granular capability was resolved. Independently qualify D35 human/service action authorization; do not widen staff-only routing to all missionaries.                                    |
| [Organization settings](../../../../../packages/api/src/admin/org-settings.ts:9), [PATCH](../../../../../packages/api/src/admin/org-settings.ts:48)                             | The visibility handler has an explicit admin role check but reads/writes a fixed Tenant id.                                                                                           | High/plausible reuse hazard: D35 controls must derive the actual Tenant and exact manage capability, with source policy revision and atomic audit/outcome. This is static incompatible code, not a tested production cross-Tenant mutation.                            |
| [Missionary task mutation](../../../../../packages/api/src/missionary-portal/task.ts:38), [PATCH](../../../../../packages/api/src/missionary-portal/task.ts:81)                 | Generic status changes clear/set completion fields and write the task, then separately fetch it.                                                                                      | High/plausible: task reopen is not referral continuation; a failed post-write read is not proof the write failed. Do not replay consumed source work or overwrite later task state to recover a response.                                                              |
| [Browser grants/policies](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157)                                                         | Donors SELECT is granted to authenticated and constrained by self/staff policies; missionary task raw grants are revoked at line 265.                                                 | High/plausible: D35 neither inherits a missionary referral write grant nor needs a broad donor/table grant. Effective deployed ACLs and the full policy chain still require real verification.                                                                         |

All current-code findings are bounded static evidence. They do not establish a
successful unauthorized production call, complete effective grants, deployed
policies or a released referral implementation. Earlier D34 evidence and all
previous models/probes/verifiers were preserved and not executed again.

## Minimal source model and exact command outcomes

Use one canonical referral lineage. The owner must distinguish the original
referral from each actual active/expired continuation cycle or equivalent
monotonic source revision with attributable transition history. “Cycle” is a
semantic distinction, not a requirement for a new table. The old occurrence,
originator, introducing provenance, prior start/end facts and dispositions are
not overwritten by the person continuing it. Append the current actor, accepted
time, relevant source/policy revisions and resulting source state under the
owner’s existing history mechanism.

The reviewed intent identifies the exact Tenant/source/ministry/recipient scope,
expired cycle, relevant source revision and applicable continuation terms. Client
ids and expected versions are selectors to validate, not trusted proof of their
truth. Tenant, actual actor, acceptance time, original author and outcome
attribution come from trusted server/source context. A transport id alone is
insufficient. Neither contact name nor email is an identity or dedupe key.

| Situation                                                                       | Required source outcome                                                                                                                                                                                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qualified ordinary expired cycle; current missionary action allowed             | One attributed continuation returns the same referral to active work under source-defined current terms. Preserve previous history; no contact consent is created.                                                  |
| Read allowed but continuation not allowed                                       | No mutation. History remains governed separately; no staff impersonation, role upgrade or hidden-field discovery.                                                                                                   |
| Missing/unqualified continuation terms                                          | No guessed Active flag, arbitrary duration or accidental immediately-expired cycle. Show the lane unavailable under the permitted projection; source qualification is required.                                     |
| Withdrawal, invalidation, privacy revocation, ended assignment or erased source | Not ordinary-expiry continuation. Apply the actual owner correction/disposition/access rules; do not use Continue as Undo.                                                                                          |
| Policy Off wins the authoritative race                                          | New missionary continuation is not accepted; nothing is queued for re-enable. Independent staff action remains subject to its own exact authority.                                                                  |
| Continuation acceptance wins, then policy Off                                   | Preserve the accepted source effect/history. Off does not undo it, restore the expired cycle or revoke unrelated current work by implication.                                                                       |
| Accepted response lost                                                          | Recover the same minimal permitted accepted result, even if missionary continuation is now Off. Recovery is not another continuation and cannot overwrite later state.                                              |
| Two new commands race for one expired cycle                                     | At most one continuation effect exists. The other command reports an allowed current already-continued/conflict outcome without claiming its actor performed the first action or exposing that actor unnecessarily. |
| The continued cycle later expires; an old intent retries                        | Recover the earlier effect if readable. It cannot continue the later cycle, extend its deadline or revive old child effects. A new current reviewed intent is needed.                                               |
| Party merge, recipient/scope change or material correction races the command    | Re-evaluate exact current source identity and authority under shared fencing; stale material terms conflict safely. No silent cross-ministry/recipient retargeting.                                                 |
| Source accepted but view refresh failed                                         | Preserve acceptance and show a permitted accepted/status-unavailable result. Do not assert still Active, failed or renewed again from an unavailable/stale projection.                                              |

## Exact proposed database and authorization amendments

**DB35-01 — Action authority is separate.** The owning P9 continuation command
SHALL require current source-qualified eligibility, exact P12 continuation
authority and the organization’s current missionary-continuation permission.
History/Party read, authorship, old assignment, source possession or a role label
SHALL not grant this action. Independently authorized staff retain their own
scoped action; a caller-provided staff mode cannot bypass the missionary gate.

**DB35-02 — Bounded tenant control.** Apply the organization’s permitted
missionary actor configuration through existing qualified permission/settings
machinery. Missing explicit admission denies this action. Do not add per-record
exceptions, arbitrary policy scripts or a duplicate grant store to satisfy
customization. Configuration mutations derive Tenant/actor, validate the exact
manage capability and expected policy revision, and atomically preserve the
required policy audit/outcome. Ordinary continuation within qualified policy
needs no new routine approval; actual projection-policy widening retains
ADR-0211 governance.

**DB35-03 — Same source, exact expired cycle.** Continue only an eligible
ordinary-expiry occurrence in the exact currently authorized context. Preserve
canonical referral identity and old lifecycle evidence; create an attributable
new continuation in that lineage without restoring old permissions, private
context, completed/cancelled tasks, notifications, responses or consumed effects.
No name-based merge, duplicate contact, cultivation reopen, task reopen,
relationship transfer or generic donor status write substitutes for this command.

**DB35-04 — Qualified resulting terms.** The source SHALL prove the resulting
active-work terms and effective-time semantics before acceptance, including its
expiry treatment. It SHALL preserve the original history and record the terms
that actually governed the accepted continuation. D35 selects no numerical
window, universal reintroduction requirement, renewal count or grace period.
An unqualified/missing producer withholds this lane only; it must not invent a
deadline, preserve expired contact authority, or reopen and immediately re-expire
work because the old deadline was left in place.

**DB35-05 — Concurrency and actual time.** New continuation, material source
correction/withdrawal/merge/assignment changes, policy changes and relevant
authorization changes SHALL share the owner’s authoritative fences. Re-prove
the exact current facts after waits and before accepting the source transition;
transaction-start time, a browser clock, pre-lock lookup or cleanup job is not
current-time authority. Policy admission must be serializable against Off even
where no policy row exists yet; qualify stable policy identity/absence handling.
Use a consistent lock order or proven equivalent and bounded deadlock/serialization
recovery, not a global lock or blanket high isolation without evidence.

**DB35-06 — Off is a new-admission fence.** Turning missionary continuation Off
SHALL stop new missionary acceptances, including old forms and delayed workers.
It SHALL not undo an already accepted continuation, rewrite prior expiry,
delete source history, cancel unrelated valid work, suppress separately allowed
D34 history or withdraw independent staff powers. Re-enable SHALL not replay
rejected intents or auto-submit saved choices. A stale On→Off→On reviewed intent
cannot silently act as fresh consent; require current review when relevant
policy/source terms changed. Other source restrictions may separately end access.

**DB35-07 — One effect and narrow durable recovery.** Bind the reviewed intent
to the exact Tenant/actor/action/source/expired-cycle/context and relevant terms.
Store minimal semantic correlation in the accepted source transition/change
evidence or an existing qualified owner mechanism; no new generic CRM/provider
journal or donate-path idempotency header. Same-intent replay recovers one
accepted effect under current result disclosure; changed intent under the same
correlation conflicts. Independently submitted competing commands still cannot
produce two continuations of the same expired cycle. The database/owner boundary
must enforce that semantic uniqueness, not just disable a button.

**DB35-08 — Retry cannot target the next cycle.** The original accepted intent
SHALL remain bound to its original expired cycle after later expiry, correction,
merge, Off/re-enable or assignment recreation. It can never become a command for
a newer cycle. A definitive no-effect denial remains no-effect on retry; a new
deliberate reviewed intent is required after conditions change. A response lost
before the client knows the outcome remains unknown and uses same-intent status
recovery before any replacement submission. Current result-read denial must not
be described as proof the original write failed.

**DB35-09 — Atomic owner effect.** Commit required source state/revision,
attributed transition/history, required audit/activity and narrow intent/outcome
correlation together. If qualified secondary projections need updating, persist
their minimal durable intent in the same owner transaction; replay projects the
accepted result rather than executing Continue again. Keep external I/O outside
that transaction. A source continuation event is not an outreach interaction,
conversation, fresh introduction, donor response or automatic send/task purpose.

**DB35-10 — Tenant-aware constraints and old/new state.** Source keys and
recipient/Party/ministry relationships SHALL be exact and same-Tenant; immutable
origin/attribution and historical references cannot be altered by caller payload.
Enforce valid continuation states, relevant revision monotonicity, active logical
uniqueness and one continuation per expired cycle through constraints and the
single authoritative command where appropriate. A permitted update cannot move
Tenant, source, author, recipient, cycle or classification into an unauthorized
state. P9’s active-edge uniqueness and collision/merge semantics remain governing;
do not silently collapse two source-distinct introductions to satisfy an index.
Do not use a CHECK constraint with mutable cross-row authorization or current time
as a substitute for the acceptance boundary.

**DB35-11 — Every database path preserves the contract.** Qualify actual schema
USAGE, table/column grants, RLS `USING` and resulting-row `WITH CHECK`, policies
combined across roles, SELECT/RETURNING, views, RPC EXECUTE/ownership/search paths,
service jobs, imports, repair and direct browser access. The required operation
must not be reachable through a raw status write or looser privileged route.
RLS does not automatically constrain service-role code or implement field
projection; every reached privileged path must apply the same current source/P12
contract. Do not grant full donor/Party access to make the command or its result
read work.

**DB35-12 — Current review and response disclosure.** Show enough currently
permitted source identity and material resulting terms for a deliberate action;
do not require contact/private-referral access as a shortcut. Re-check current
read purpose/fields before releasing success, recovery, conflict or errors.
Accepted then later restricted remains an accepted effect, but that fact/detail
is disclosed only under current result authority. After acceptance, re-fetch
active-work fields through their own current floor; continuation itself is no
contact-consent waiver or restoration of old private context. Preserve the
ratified D34 minimal history projection and independent legitimate access.

**DB35-13 — Honest release and client boundaries.** Define the source acceptance
point separately from server response disclosure. Re-prove current release
authority after waits; do not promise to recall already lawfully released bytes,
including in-flight responses or external copies. Controlled clients suppress
obsolete-context/revision responses once that change is known and clear forbidden
controlled state under P12. Tenant/account/assignment changes, new-cycle state,
policy narrowing and privacy changes cannot rehydrate a prior view or trigger
automatic resubmission. Current source state may have advanced since acceptance;
never turn an immutable accepted outcome into an assertion that it is still Active.

**DB35-14 — Retention, migration and recovery.** Source-class retention, holds
and disposal govern all transition evidence and lawful minimal replay protection.
Continuation cannot resurrect erased labels/private context or reset an old
cycle’s retention incidentally. Any genuinely new cycle’s retention treatment
comes from its qualified source schedule, not a D35 blanket extension. Restore
must reconcile later policy/revocation/disposal and consumed-effect evidence
before writes or disclosure. Inventory retained source cycles before additive
rollout; never translate imported Expired text into eligible continuation.
Mixed writers and rollback must preserve consumed-cycle uniqueness and accepted
history. A purpose-scoped kill switch fences unsafe new admission while preserving
qualified staff recovery and independently authorized ordinary work.

**DB35-15 — Bounded workload and operational proof.** Use exact source lookup and
indexed Tenant/source/cycle/revision constraints with existing owner mechanisms.
Do not enumerate a tenant’s CRM graph or activity history to continue one referral.
Measure contention, correction/Off races, duplicate attempts and result recovery
against source-shaped fixtures. Declare payload/retry/timeout/retention limits
and numerical command/query budgets with units before activation; enforce them
without shortening privacy floors or retrying a committed effect. No capacity,
throughput or exact latency claim is established by this research.

## PostgreSQL/Supabase details that must not be simplified incorrectly

The Supabase skill was reread and current official pages fetched. Existing local
repository instructions and the canonical data-access boundary remain in force.
No SQL was executed. PostgreSQL 17 documentation supplies a reference baseline;
the deployed version/roles remain uninspected.

- **Omitted `WITH CHECK` is not itself a bypass.** For UPDATE/ALL, PostgreSQL
  reuses `USING` when the separate new-row check is absent. Evaluate all applicable
  policies and exact grants; permissive policies combine with OR. Both old and
  resulting rows must pass the real contract, and immutability needs more than
  a predicate accepting either otherwise-valid row.
- **Definer means the actual owner’s privileges.** It is not universally
  equivalent to bypass. Superusers/BYPASSRLS always bypass; table owners normally
  bypass unless FORCE applies. FORCE does not constrain BYPASSRLS/superusers.
  Invoker code is only as constrained as its caller. Inspect function EXECUTE
  ACLs, schema USAGE/exposure and safe search paths; PUBLIC EXECUTE is a default,
  not proof every function remains callable after explicit revocation.
- **A row lock is not all authorization.** PostgreSQL documents cross-table RLS
  lookup races and READ COMMITTED inconsistent snapshots. Locking the referral
  while independently reading stale policy is insufficient. The owner must
  serialize every relevant source/policy writer or detect stale revisions and
  retry before effect acceptance. This need does not mandate SERIALIZABLE for
  unrelated queries.
- **`now()` is transaction start.** After lock waits use the qualified actual-time
  boundary, not a timestamp evaluated before the wait. `clock_timestamp()` reports
  actual current time. Time-based eligibility is not enforced merely by running
  an expiry cleanup job or including a timestamp column.
- **Use real constraints where they fit.** Primary/composite foreign/unique keys
  and source state checks enforce valid rows. PostgreSQL warns that CHECK is not
  a reliable cross-row or mutable-function consistency mechanism. Choose the
  constraint/command combination against the actual owner schema; do not invent
  a schema from this review’s semantic vocabulary.
- **New exposure defaults do not remove old grants.** Current Supabase Data API
  guidance and the April default-exposure change separate grants from RLS.
  Existing committed table grants and service paths must still be inspected.
  The changelog’s PG minor-upgrade and TLS notices require deployment/version
  qualification; they do not change D35’s ownership, permission or migration scope.

## Required falsifiable proof before activation

| Case                                                        | Observable required outcome                                                                                                                                                              |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorized Maya and authorized staff                        | Each acts only within current exact scope; missionary permission is optional, and staff authority is separately resolved.                                                                |
| History-only, forged role/Tenant/actor or guessed source id | No continuation, hidden fields, existence distinction or broader Party grant; P12’s measured denied/missing uniformity applies.                                                          |
| Qualified ordinary expiry versus withdrawal/invalidation    | Only ordinary eligible expiry can continue; unknown status/deadline or imported text is not proof.                                                                                       |
| Actual deadline during lock wait                            | Exact source boundary is honored after waiting; transaction-start time cannot accept an ineligible or incorrectly timed transition.                                                      |
| Policy Off before acceptance                                | No new missionary effect, including worker/deep-link/direct RPC paths; there is no eventual submission after re-enable.                                                                  |
| Acceptance before Off                                       | One accepted continuation persists; permitted recovery works without continuing again. Off does not mutate source history or independent staff/current-work authority.                   |
| On→Off→On stale command                                     | Relevant stale review conflicts or requires fresh review; no automatic use of an old affirmative policy snapshot.                                                                        |
| Same-intent double click/lost response                      | One source effect and original attributed outcome; retries do not append another lifecycle transition. Changed payload under the same correlation conflicts.                             |
| Two independent intents or staff plus missionary race       | At most one continuation of the expired cycle; the other outcome is truthful and does not attribute the first actor’s work to the loser.                                                 |
| New cycle expires, old intent replays                       | Only the old accepted outcome can be recovered under current disclosure; no second renewal/deadline change or old-task replay.                                                           |
| Partial failure at each owner write                         | Required source state/history/audit/correlation/projection intent are all committed or none. A failed later read/consumer does not undo or repeat the source effect.                     |
| Party merge/unmerge or scope/recipient change               | Stale relevant commands conflict; identity mapping preserves lineage and current permissions without retargeting a reviewed action or merging distinct source introductions.             |
| Existing compatible active relationship                     | Source active-identity rules hold; no duplicate edge is created and no unrelated active relationship is overwritten.                                                                     |
| Old/new row attacks                                         | Real nonowner and privileged-equivalent tests deny Tenant/author/source/cycle/scope/classification escape across UPDATE/UPSERT/RETURNING/RPC/import/repair paths.                        |
| Current result access lost after commit                     | Accepted effect is not repeated; unauthorized result data is withheld uniformly. UI does not infer nonacceptance or propose blind replacement.                                           |
| Accepted result now expired/unavailable                     | Immutable acceptance remains distinguishable from current Active state or unavailable state; no stale success card promises a renewed window still exists.                               |
| Contact, private context and old children                   | No implied communication consent, restored private text, recreated completed task, revived notification, cultivation reopen or interaction count.                                        |
| Retention/restore/mixed deployment                          | Newer disposal/access restrictions and consumed-cycle evidence survive restore and rollback; old writers cannot create a second transition or resurrect data.                            |
| Performance and recovery                                    | Actual indexed source query/transaction plans, contention/race behavior and declared boundary/over-boundary cases pass measured budgets; supported recovery needs no direct data repair. |

This is a proof plan, not a claimed passing runtime suite. The review performed
source/document inspection, fresh primary GETs and documentation validation only.
No prior finite model, SQL probe or verification runner was rerun.

## Primary retrieval evidence

Fresh HTTP GETs on 2026-10-18 UTC. Retrieval is not publication date. Hashes pin
the bytes inspected. The changelog was scanned and relevant default-exposure,
PostgreSQL minor-upgrade and TLS entries were followed. No version upgrade or
new dependency is authorized by this evidence.

| Primary page                                                                                                                                      | HTTP | SHA-256                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------ |
| [Supabase changelog](https://supabase.com/changelog.md)                                                                                           | 200  | `15b3d0d1a7dc3b3f2c0af4788e49acfdf2d2edbd2613f22de0705fa43b1cf58b` |
| [Supabase Data API security](https://supabase.com/docs/guides/api/securing-your-api.md)                                                           | 200  | `d2c47fd37a58003f294e11f47cdb05bdd2bb853f350c006a9e6a2c4249868e46` |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security.md)                                                          | 200  | `9398df00c60160ffbbdf9b53f02e61bd34db000d291152a3268a00a95e4cdac8` |
| [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                              | 200  | `1772bf6791789204d77a0ed3e35c0ff2f7ea988fb71f64a0b4b3a19908fad6a6` |
| [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                                                                | 200  | `4cdf084d8e36009d03790c508585bd7c4c237aac4165dbbc9173866dbffc980e` |
| [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html)                                                          | 200  | `887e05c52a98890006d7d63cd1dcbb933309376ff78967bef6693f247dddbf43` |
| [PostgreSQL date/time](https://www.postgresql.org/docs/17/functions-datetime.html)                                                                | 200  | `20965f1539d658c525d403ad548d697cfcb8967f4faf8f81127373572f33821d` |
| [PostgreSQL isolation](https://www.postgresql.org/docs/17/transaction-iso.html)                                                                   | 200  | `e3475df0c76b214dbda0bc681015099763b83778e1355e17ee7b908e6fd38a26` |
| [PostgreSQL locking](https://www.postgresql.org/docs/17/explicit-locking.html)                                                                    | 200  | `cce2f9f92449f15fcb9927c23f164701652ed352470838d5db5a1bd930a77193` |
| [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                                 | 200  | `dadc6166e3dcae0a1c91ada5373ef046682876b6db32e8c771338a4cb9b8c4be` |
| [Supabase default exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) | 200  | `da3d078e1ba62fb7fe45965f992bc0b4e62e05705eaef4b76236ffdb9fa22c44` |
| [Supabase PG minor-upgrade notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)                                          | 200  | `5a92d706d0c1b15171eef316df49ab21442106090e557cda9cfddfa42dc53329` |
| [Supabase TLS notice](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)                                                                  | 200  | `20aff98d8760c248ec4f86f054731fe398dcf738ca956693a4c33611627fd25c` |

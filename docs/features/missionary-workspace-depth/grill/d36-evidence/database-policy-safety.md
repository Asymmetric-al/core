# D36 — Renewed referral period: database and policy safety

Research date: **2026-10-18 UTC**. Repository HEAD:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`, with the existing working tree.
This is a bounded static and primary-document review. No application, schema,
live database, older evidence, prior model, probe or verifier was changed or run.

**Disposition: Accept with required amendments.** The founder selected an
organization-configured finite renewed period, without a missionary date picker.
The engineering recommendations below preserve D35's ratified source command.
They do not establish a deployed referral producer, a new table, runtime proof,
or an already-ratified numerical/time policy.

The review coordinator selected the following **proposed D36 amendments** for
the main review: a positive whole number of elapsed days, exactly 86,400 seconds
per day; one ordinary Continue period for staff and permitted missionaries;
prospective policy changes; and source-fixed accepted start/end and policy
revision per cycle. These are explicit product judgments, not practices proved
by a ministry study or values inherited from another owner. No universal default
or arbitrary maximum such as 365 days is selected here.

## Governing repository evidence

| Evidence                                                                                                                                                                                                                       | What it requires here                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [P9 referral ownership](../../../../prds/program-roadmap/owner-constraints.md:81), [founder referral journey](../phase28-founder-brief.md:137)                                                                                 | P9 owns referred-by edges, provenance, expiry and source reporting. P28 consumes a deliberate source continuation; expiry is neither a contact permission nor a task due date.                                                                                                                                                            |
| [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)                                                                                                                                 | Same-Tenant endpoint FKs, canonical relationship identity, retained time-bound history and active-edge uniqueness remain binding. A renewed window must fit that owner representation without silently overwriting old cycles or creating another active duplicate.                                                                       |
| [P9 A17](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:581)                                                                                                                                | Capability-checked native writes commit source, audit and required activity together. Expected revision and narrow source change-record correlation may support recovery. No generic CRM/provider journal, provider gate or donate-path idempotency header is authorized.                                                                 |
| [P12 current authority](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [one Tenant source](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1555) | Tenant, actor, active assignment and exact source/action scope derive from validated server context. Role names and a caller-supplied staff mode are insufficient. Until application and database Tenant sources are unified, RLS cannot be described as a Tenant backstop.                                                               |
| [P12 egress](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1645), [purpose/contactability](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654)       | Preview, settings summaries, acceptance/result recovery, dates, counts and errors are governed projections. Readability is independent of contactability. A later grant expiry can end access before the referral period ends.                                                                                                            |
| [ADR-0209](../../../../adr/0209-static-field-policies-and-subtract-only-projection.md:16)                                                                                                                                      | Register/classify the actual period/end/revision record family and fields, then use the shared conditional resolver. Do not put conditional expiry expressions in static field policies, expose unclassified JSON, or create a surface-local allowlist as authority.                                                                      |
| [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md:16)                                                                                                                                         | Actual projection-policy widening needs independent approval and stale-base checks. This is not routine approval for every source continuation or period edit. A longer source period is not automatically a static projection-policy widening; if implementation changes that policy, its actual change must be classified and governed. |
| [Durable CRM boundary](../../../../../openspec/specs/crm-core/spec.md:14), [data access boundary](../../../../guides/architecture/data-access-boundary.md:10)                                                                  | Asym Postgres and `packages/api` own operational truth. The missionary screen consumes it; CMS, browser preferences and external CRMs do not become expiry authorities.                                                                                                                                                                   |
| [Original Q36 scope](q36-before-answer.txt:95), [ratified D35](../phase28-d35-referral-continuation-adversarial-review.md)                                                                                                     | Q36 chooses the renewed-period source, not initial-referral policy, retention, grant duration or automatic renewal. D35's exact-cycle, current-authority, Off, staff and recovery invariants continue to apply.                                                                                                                           |

The initial-referral period remains a separate owner question. Reuse an existing
qualified policy only if its actual meaning matches; do not create a duplicate
setting by assumption or silently couple initial and renewed periods.

## Fresh current-code inspection

Fresh searches for referral/continuation terms in `packages/api/src`,
`packages/database`, `packages/auth`, migrations and the inspected CRM OpenSpec
files did not establish a qualified referral-period producer. This is a bounded
search result, not a claim that every repository file or deployed database was
examined. The unchanged D35 source findings below were re-read, not re-tested.

| Current code                                                                                                                                                                                                                             | Observed behavior                                                                                                                                                                       | Consequence and honest limit                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Organization settings](../../../../../packages/api/src/admin/org-settings.ts:9), [PATCH](../../../../../packages/api/src/admin/org-settings.ts:48)                                                                                      | Explicit admin/super-admin gate; current visibility read/write uses one fixed `DEFAULT_TENANT_ID`. There is no expected policy revision or atomic policy audit/outcome in this handler. | High/plausible reuse hazard: do not add D36 to this mutation unchanged. Derive Tenant and the actual manage capability, use concurrency-safe revision acceptance and durable change evidence. No production cross-Tenant exploit was executed or established. |
| [Tenant type](../../../../../packages/database/types/database.ts:90), [timezone migration](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:82)                                                                 | `org_settings` is a broad record; `default_timezone` is text with UTC default in the inspected migration.                                                                               | A TypeScript shape or default does not validate finite duration, IANA timezone, policy lineage or author identity. Do not treat arbitrary JSON or timezone text as an already-qualified period policy.                                                        |
| [Missionary timezone migration](../../../../../supabase/migrations/20260414180338_member_care_foundation.sql:3), [backfill](../../../../../supabase/migrations/20260414180338_member_care_foundation.sql:61)                             | Missionary timezone is text, initially copied from the tenant for UTC rows.                                                                                                             | A different missionary timezone cannot redefine the elapsed window; it may affect explicitly labeled display. No current referral arithmetic was established by these fields.                                                                                 |
| [Donor schema](../../../../../packages/api/src/missionary-portal/donor.ts:25), [mutation](../../../../../packages/api/src/missionary-portal/donor.ts:174)                                                                                | A broad donor status edit uses id/Tenant/profile plus an explicit anonymity predicate.                                                                                                  | Positive scoped checks exist, but contact status is not a referral cycle and supplies no accepted period or policy revision. Generic Active/Lapsed editing is not D36.                                                                                        |
| [Task date input](../../../../../packages/api/src/missionary-portal/task.ts:25), [mutation/result read](../../../../../packages/api/src/missionary-portal/task.ts:81)                                                                    | Caller-provided ISO `due_date` is written; the task update is followed by a separate fetch.                                                                                             | Do not reuse an editable task deadline as referral expiry. A failed read after the write also cannot mean that continuation failed or justify another continuation. This is a code-path fact, not a tested exploit.                                           |
| [Missionary wrapper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:14), [admin client](../../../../../packages/database/supabase/admin.ts:22)                                                                       | Role gate followed by a server service-role client.                                                                                                                                     | D36 needs current scoped source action, policy and row transition checks inside its authoritative command. RLS is not a presumed guard on service-role writes.                                                                                                |
| [CRM access helper](../../../../../packages/api/src/crm/auth/access.ts:22)                                                                                                                                                               | Staff role/Tenant checks return the requested action string as actor metadata.                                                                                                          | An action string does not independently prove a granular capability. Period management and continuation are separate authorized actions; neither should inherit blanket role authority.                                                                       |
| [Operation wrapper](../../../../../packages/api/src/shared/with-operation.ts:128)                                                                                                                                                        | Generates a fresh request ID and provides auth/audit helpers to the handler.                                                                                                            | It is not a transaction, expected-revision protocol or durable semantic recovery mechanism. No such guarantee should be attributed to the wrapper.                                                                                                            |
| [Browser policies/grants](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157), [task revocation](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261) | Donor SELECT is granted with self/staff policies; raw missionary-task access is revoked.                                                                                                | These do not grant period mutation or expose a referral policy. Actual effective ACLs, all policy migrations, view/RPC owners and deployed roles must be qualified rather than inferred from one file.                                                        |

## Fresh primary technical evidence

The Supabase and repository Postgres skills were applied. Official sources were
fetched on **2026-10-18 UTC**; successful HTTP retrieval does not qualify the
deployment version or execute any database behavior. PostgreSQL 17 documentation
is used for explicit engine semantics, not as proof Core is running that version.

| Primary source                                                                                                                                                | Verified consequence                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PostgreSQL date/time functions](https://www.postgresql.org/docs/17/functions-datetime.html)                                                                  | `now()`/`CURRENT_TIMESTAMP`/`transaction_timestamp()` denote transaction start. `clock_timestamp()` advances during execution. In a DST-observing zone, `interval '1 day'` and `interval '24 hours'` can produce different instants. `isfinite` distinguishes finite timestamps from infinity.                               |
| [PostgreSQL date/time types](https://www.postgresql.org/docs/17/datatype-datetime.html)                                                                       | Timestamp inputs support special infinity values. `timestamptz` represents an instant, with timezone-sensitive input/output; it does not preserve the originally entered zone as a separate fact. Calendar display and the authoritative instant must not be confused.                                                       |
| [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                                                     | `USING` evaluates old-row visibility; `WITH CHECK` constrains inserted/updated rows. For applicable UPDATE/ALL policies, an omitted `WITH CHECK` inherits `USING`. Multiple permissive policies combine with OR. Both valid rows may still permit a forbidden transition unless immutability/command constraints prevent it. |
| [Row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                                                                                       | Owners normally bypass RLS unless forced; superusers/BYPASSRLS still bypass. Policy subqueries can race with changes to referenced authority. Locking one source row alone does not establish current cross-table authority.                                                                                                 |
| [CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html)                                                                                 | SECURITY DEFINER uses the owner's privileges; that is not universally identical to bypassing RLS. Secure search paths, actual owner privileges, schema exposure and EXECUTE ACLs matter. PUBLIC EXECUTE is a default, not proof a deployed function remains public after revocation.                                         |
| [Transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html), [locking](https://www.postgresql.org/docs/17/explicit-locking.html)         | Read Committed can observe snapshots that do not make a pre-read of policy current after waiting on another row. Establish source/policy/grant ordering explicitly; use consistent lock order and bounded retry for actual conflicts, not a universal tenant lock or a blanket isolation-level prescription.                 |
| [Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                                                        | CHECK succeeds on true or null, so required values need NOT NULL as well. Mutable cross-row policy and current-time eligibility do not belong in CHECK predicates that PostgreSQL assumes immutable. FKs/uniqueness prove structural relationships; current authority belongs in the command/read boundary.                  |
| [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) | Grants decide reachable operations; RLS governs reachable rows. Neither replaces the other. Actual service-role and invoker/definer paths must preserve the same product restrictions.                                                                                                                                       |

**Skill corrections:** the generic skill's claim that omission of WITH CHECK
necessarily permits reassignment is overbroad: PostgreSQL inherits USING in the
documented cases. Likewise, SECURITY DEFINER is owner privilege execution, not
an unconditional RLS bypass. These corrections do not excuse weak policies,
mutable trusted fields or ungoverned privileged paths.

The [Supabase changelog](https://supabase.com/changelog) was freshly scanned.
The linked API auto-exposure change, PostgreSQL 15.19/17.11 notice and HTTP TLS
notice were fetched. These require deployment-specific grant/version/client
qualification; they do not select a referral duration, justify widening grants,
or change Core's migration workflow. New exposure defaults must not be assumed
to revoke old object grants.

## Material concerns and exact prevention

Likelihood below is a reasoned estimate **if the safeguard is absent**, not an
observed production incident rate. All findings narrow implementation while
retaining A; none requires replacing the organization-configured choice.

| ID  | What can go wrong; why it matters                                                                                                                           | Severity / likelihood                                              | Evidence and permanent correction                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | A broad/fixed-Tenant settings route changes the wrong policy or lets a role bypass the real capability; current permission disappears after a precheck.     | High / plausible on reuse                                          | Current settings/wrapper evidence and P12. DB36-01/06/12 require trusted exact context, stable policy fence and privileged parity.                                            |
| F02 | Blank/null/zero, fractional or overflowing input becomes unlimited, silently rounded or an invented default; accepted Active cannot have a valid end.       | High / likely without typed contract                               | Broad JSON type and PostgreSQL null/infinity semantics. DB36-02/03 require strict bounded positive integer input and finite checked results, without a Never sentinel.        |
| F03 | Session timezone, browser arithmetic, DST or transaction-start time changes the real duration or uses stale authority.                                      | High / plausible                                                   | Official date/time behavior, existing unrelated timezone fields. DB36-03/06 fix elapsed-unit arithmetic, exact accepted instants and actual current time after waits.         |
| F04 | Saving the next period recalculates old active windows, shortens/extends accepted history or rewrites the old policy revision.                              | High / likely if expiry is read as current start + current setting | P9 retained history and prospective product amendment. DB36-04/05 freeze cycle terms; historical revisions are not destructively replaced.                                    |
| F05 | Policy is changed/restored between preview and acceptance, or two staff overwrite each other's settings; stale terms still succeed.                         | High / plausible under concurrency                                 | Read Committed/authority lookup evidence. DB36-05/06/07 enforce expected revisions, stable absent identity, non-reused revision on ABA and reviewed material terms.           |
| F06 | Off is mistaken for deleting the period or ending all referrals/staff rights; corrupt shared configuration silently falls back to a private staff deadline. | High / plausible                                                   | D35 Off lane and shared-period amendment. DB36-08 separates permission disable from period validity; no Clear/implicit staff override.                                        |
| F07 | A stale preview promises one date but acceptance after midnight or a policy edit silently installs another; post-write error causes duplicate continuation. | Medium–high / plausible                                            | Actual separate write/read pattern and new period arithmetic. DB36-07/09 require truthful preview/current result and source-correlated recovery.                              |
| F08 | Expiry waits for a delayed job, or an old-cycle job ends a renewed cycle; old task/activity writes reset the clock.                                         | High / plausible                                                   | Source expiry vs derived status and exact-cycle requirements. DB36-10 makes deadline eligibility current and each worker exact-cycle/revision bound; no incidental extension. |
| F09 | A policy FK crosses Tenant, history deletion cascades, or an allowed update changes accepted actor/cycle/period to a different valid row.                   | High / plausible without constraints                               | P9 tenant-aware graph and PostgreSQL old/new row distinction. DB36-11/12 require Tenant-aware relations, immutable accepted fields and owner corrections.                     |
| F10 | The new end date, preview or successful old outcome leaks a hidden referral after revocation; accepted historically is falsely shown Active now.            | High / plausible                                                   | ADR0209/P12 and D35. DB36-13 separates acceptance evidence/current state/current disclosure and covers all egress.                                                            |
| F11 | Restore/rollback replays a consumed expired cycle, old code accepts custom dates, or new code treats old null periods as Never.                             | High / plausible in mixed deployment                               | Unqualified current source, retained history and D35 replay rules. DB36-14 requires compatibility census, safe activation and current reconciliation before reads/writes.     |
| F12 | A generic scheduler/ledger or tenant-wide serial lock adds debt; the exact-source operation degrades into scanning all historical referrals.                | Medium / plausible                                                 | P9 A17 prohibition and P12 query boundary. DB36-15 requires lean source reuse, bounded indexed reads, measured actual contention and minimal evidence.                        |

## Exact technical requirements for the developing decision

**DB36-01 — Trusted ownership.** Authorized staff manage the organization's
renewed-period policy through its qualified owner; ordinary Continue consumes
it through the P9 source command. Derive Tenant, actor, assignment, capability,
scope and attribution from trusted current context. Caller input may identify
the intended resource and expected revision, never author its trusted ownership,
policy version, acceptance time or resulting expiry. Policy management does not
grant continuation and continuation does not grant policy management.

**DB36-02 — Positive finite supported input.** Accept only a positive whole
number `N` within one explicitly published, owner-qualified supported range.
That range, accepted timestamp range and arithmetic/serialization limits must
be recorded before activation and enforced consistently by UI, API and database.
There is no implied default or arbitrary 365-day cap. Reject blank/null, zero,
negative, fractional, nonnumeric, unsafe integer, over-range and overflowing
values without rounding, truncation, saturation, fallback or treating them as
Never. The typed command rejects unknown fields, including missionary-supplied
custom end dates. A form may parse localized digits for display/input, but its
canonical validated value must meet the same integer contract.

**DB36-03 — Exact elapsed interval.** At qualified authoritative acceptance after
required waits, capture one trusted database instant `A`; derive
`E = A + N × 86,400 seconds` using checked exact arithmetic and freeze both
instants with the accepted duration and policy revision. Require finite
representable `A` and `E` and `E > A`; reject PostgreSQL infinity values.
The active time interval is `[A, E)`: equality at `E` is expired. Do not use a
session-dependent calendar-day interval, client clock, request-start time,
transaction-start `now()` or locale to define the elapsed duration. Actual
implementation must prove its database/driver timestamp precision and checked
conversion; display precision cannot decide eligibility.

**DB36-04 — Accepted terms do not drift.** Later period, display timezone or
locale changes apply to future accepted continuations only. They do not
recompute an accepted `E`, reset original introduction/prior expiry, revive an
ended cycle or change retention/grant/contact-consent clocks. Preserve the
accepted terms and their attributable source policy evidence through qualified
history; a genuine source correction uses its separate authorized correction
contract. No general edit silently amends an accepted window.

**DB36-05 — Policy save and absent-state ordering.** Policy save atomically
commits the value, new non-reused revision, required audit and minimal semantic
outcome evidence. Require the expected base revision; competing saves and
same-correlation/different-input reuse conflict. Maintain a stable authoritative
policy namespace/fence even before first configuration. Do not synthesize a new
revision on every absent read. Restoring a former numeric value after another
revision does not restore old review authority. Ordinary settings edits are
prospective; no bulk recalculation or hidden historical scan is part of Save.

**DB36-06 — One acceptance order.** Policy mutation, source-cycle acceptance and
relevant authorization changes participate in a qualified common ordering
boundary. Re-prove current source/cycle, active context, scope, permission,
policy/revision, privacy and actual current database time after waits, not just
before taking a source lock. A prior committed relevant change prevents stale
acceptance. An accepted continuation is not undone by a later policy edit or
missionary Off. Use a bounded consistent locking/retry design without prescribing
one global lock, mutable CHECK subqueries or universal SERIALIZABLE transactions.

**DB36-07 — Honest preview and deliberate terms.** Show the proposed period and
resulting end date with clear time/zone where needed to understand the boundary;
explain that the final period starts when continuation is accepted. The server
computes final terms. If the relevant policy revision or materially displayed
end date/window changes before acceptance, refresh the terms and require a new
deliberate reviewed intent; never accept unseen terms. Do not force a modal or
another click solely because harmless seconds elapsed within the same displayed
terms. User timezone changes may change display, never the accepted instant.
Do not label an exact-instant expiry as inclusive “through this date” by accident.

**DB36-08 — Off, missing policy and staff remain distinct.** One valid ordinary
Continue period serves permitted staff and missionary continuations. D35's
missionary Off blocks new missionary self-service acceptance only; it preserves
the period, accepted windows and independently authorized staff actions. Do not
add a normal Clear period control or a silent per-item staff date override.
Missing/corrupt/unqualified period configuration prevents new commands needing
that shared source policy, including staff commands, with safe corrective
feedback; it is not a revocation of staff rights and does not end accepted work.
No dependent path invents a fallback duration. Configuring a period alone does
not enable missionary self-service.

**DB36-09 — Atomic effect and original recovery.** In the existing P9 owner
transaction, commit the new cycle and frozen terms, required source audit/activity,
minimal accepted intent/outcome correlation and any required identifier-only
secondary projection intent together. Preserve D35's unique consumed expired
cycle across different transport keys and staff/missionary races. Bind recovery
to trusted Tenant, actor, action, source/cycle/context and reviewed intent;
different input with the same correlation conflicts. Recovery never recomputes
expiry using a later clock/policy or opens the next expired cycle. Accepted but
unreadable remains accepted, not a reason to execute again. No provider I/O or
generic command journal is added.

**DB36-10 — Deadline, not job timing.** Source read/action eligibility evaluates
the frozen `E` against qualified current time, even when a cleanup or projection
job is delayed. A materialized Active label is not authority. Any expiry worker
targets the exact cycle and expected end/relevant revision, is idempotent and
cannot terminate a newer continued cycle. New manual notes, activity, task
edits, imports, page visits and policy saves do not reset or extend the clock.
An expired cycle can be deliberately continued only through the qualified D35
command, whether or not an asynchronous materialization has caught up.

**DB36-11 — Structural constraints, not a speculative schema.** Use the owner's
existing policy/source history representation where it can prove these outcomes.
Require non-null tenant/source/cycle identity for accepted terms, same-Tenant
composite relationships to policy evidence and source context, structural
one-active/one-consumption invariants, finite timestamp checks and positive
bounded integer validation. Required values need NOT NULL as well as CHECK.
Accepted actor, Tenant, source lineage, cycle, accepted terms and policy evidence
cannot be changed through an ordinary update. Preserve historical references;
policy replacement/deletion must not cascade-delete accepted source history.
Retention/disposal remains owner-governed; evidence is not retained forever by
this decision. Mutable current-policy/time checks belong in qualified commands,
not immutable row CHECK expressions.

**DB36-12 — All database entry paths.** Qualify actual table/column grants, RLS
old-row USING and new-row WITH CHECK behavior, permissive-policy composition,
view invoker/owner privileges, RPC EXECUTE/search path and service-role paths.
Prevent permitted rows being transformed into forbidden Tenant, owner, cycle or
terms even if both endpoints separately satisfy row visibility. Omitted CHECK
inheritance is acknowledged; explicit immutability and command boundaries still
matter. Raw browser writes and generic status/date PATCH paths cannot bypass
the period/source command. Do not widen a donor/table grant to make this work.

**DB36-13 — Current projected results.** Classify and govern actual policy/end
fields through ADR0209 and P12. Preview, acceptance, recovery, lists, errors,
caches, signals and diagnostics disclose only current permitted facts. Preserve
accepted historical outcome separately from current state: show Active only
when its current qualified state is still Active. Recheck current response
authority at final disclosure release; known-stale controlled-client responses
are discarded. This does not promise recall of bytes already lawfully released
or reverse an accepted transaction when later disclosure is denied. No referral
window extends a grant or restores erased/private context.

**DB36-14 — Safe activation, restore and rollback.** Inventory actual retained
policy/source facts, clock precision, grants and old clients before activation.
Do not backfill an arbitrary period or silently reinterpret old null/date data
as a valid renewed cycle. Reconcile old routes and mixed-version writers so all
accepted continuations obey one period/cycle boundary. Restore current
privacy/erasure, consumed-cycle correlation and accepted terms before accepting
writes or serving governed data. Containment can stop new dependent acceptance
without deleting history, recalculating old windows or restoring generic raw
date/status updates. Roll forward accepted data safely when rollback cannot
understand it.

**DB36-15 — Lean performance and operations.** The normal operation reads one
exact source/cycle and the required current policy/authority; index actual
Tenant/source/cycle and due-expiry access paths after measuring query shape.
Bound expiry batches and contention; page only permitted rows without per-row
network authorization or full-history loading. Record production-shaped
latency/query/recovery/lock budgets and exact boundaries before activation;
claim no unmeasured capacity. Durable source history records original actor,
accepted period/revision and timing separately from technical diagnostics.
Operators recover source truth through owner tools, never another continuation
or direct database repair. No runtime vendor, dependency or generalized renewal
engine is necessary.

## Required falsifiable implementation proof

These are release obligations, not tests run in this research task.

| Proof                                       | Observable result                                                                                                                                                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T01 — Canonical input boundaries            | Minimum valid, published maximum and adjacent invalid values agree across UI/API/database; null/empty/zero/fraction/NaN-like text/negative/unsafe integer/overflow never round, default or create Active.                                            |
| T02 — Extra-field and trusted-field attacks | Caller-supplied Tenant/actor/policy revision-as-fact/start/end/date override cannot establish authority or alter computed accepted terms.                                                                                                            |
| T03 — Exact elapsed arithmetic              | For supported `N`, source `E − A` is exactly `N × 86,400 seconds` at supported precision, across DST transitions, leap day, year boundary and differing server/session/viewer zones.                                                                 |
| T04 — Finite/precision limits               | Positive/negative infinity, out-of-range timestamps, multiplication/addition overflow and unsupported serialization precision are rejected safely; no clipping or accidental infinite period.                                                        |
| T05 — Actual time after wait                | A transaction waiting across relevant grant/source/preview boundaries uses current acceptance time and authority, not transaction-start now or caller time. Test the real engine/driver, not a clock argument asserted by test code.                 |
| T06 — Half-open expiry                      | Immediately before, exactly at and after E yields correct source eligibility even when an expiry worker is stopped; a rounded displayed date cannot authorize.                                                                                       |
| T07 — Prospective policy                    | Shortening/lengthening the period changes the next accepted cycle only; previously accepted A/E/N/policy evidence and original introduction remain unchanged.                                                                                        |
| T08 — Concurrent settings                   | Two saves from one base produce one ordered change and a conflict; first configuration races safely with missing-policy acceptance; value A→B→A does not revive the first revision.                                                                  |
| T09 — Preview change                        | Cross-midnight/material displayed-date or policy change requires refreshed deliberate terms; harmless seconds do not add routine interaction. The authoritative returned expiry matches actual acceptance.                                           |
| T10 — Off/configuration matrix              | Missionary Off with valid period preserves qualified staff action and accepted cycles; period configuration does not enable missionaries; missing/corrupt period blocks dependent staff and missionary commands without revoking independent rights. |
| T11 — Exact expired-cycle uniqueness        | Concurrent actors/keys consume one expired cycle once. A later retry under a different period returns only the original currently permitted outcome and never recomputes or opens the next cycle.                                                    |
| T12 — Transaction fault injection           | Failure after source write but before audit/correlation/projection-intent persistence yields either complete rollback or one fully recoverable accepted effect; no orphan accepted window.                                                           |
| T13 — Delayed expiry work                   | An old-cycle expiry job arriving after continuation cannot end the new cycle; duplicate jobs converge without duplicate activity or history rewriting.                                                                                               |
| T14 — No incidental extension               | Notes, calls, tasks, imports, reads, policy saves and retry/recovery leave accepted A/E unchanged and create no automatic continuation.                                                                                                              |
| T15 — Roles and row transformations         | Actual anonymous/authenticated/service/operator/RPC/view/raw-table paths prove exact Tenant/action scope and denial of cross-Tenant policy FK, owner/cycle/terms reassignment and generic date-patch bypass.                                         |
| T16 — Policy/source race                    | Policy save, missionary Off, grant removal and source change in both orderings produce complete old-or-new valid acceptance, never mixed policy fields or pre-lock authority.                                                                        |
| T17 — Current result disclosure             | Acceptance followed by revocation, newer expiry or unavailable projection never leaks hidden dates/source context, falsely claims Active now or tells the client to redo a committed effect.                                                         |
| T18 — Restore/mixed version                 | Retained data, stale writer, backup restore and rollback cannot recreate consumed cycles, erase policy history, restore erased content or reinterpret null as Never.                                                                                 |
| T19 — Historical ownership                  | Policy replacement cannot cascade-delete accepted cycle evidence; authorized source correction preserves attributable history and qualified retention.                                                                                               |
| T20 — Performance and operations            | Recorded production-shaped query/batch/lock/recovery budgets pass exact thresholds, large-tenant and multi-tenant contention tests without tenant-global serialization or a full historical scan.                                                    |

## Verification and unresolved qualification

This review verifies the inspected source text and current official technical
documentation. It does **not** verify an implementation, deployed PostgreSQL
version, effective live grants, actual transaction ordering, end-user
comprehension, timezone database version, driver arithmetic, numerical supported
maximum, migrations or production performance. Those are named qualification
outputs rather than invented facts. No old model or probe was executed.

The selected product direction is ready to carry into the main D36 amendments.
Before activation, the P9/API owner must publish the supported integer/timestamp
range and prove the concrete source/constraint/clock/permission contract; the
P12 owner qualifies actual projections and privileged paths. No exact numerical
ministry norm follows from this research.

### Fresh retrieval integrity

All following retrievals returned HTTP 200 on 2026-10-18 UTC. SHA-256 hashes
identify the fetched documents; retrieval is evidence of the cited text, not
database execution or vendor suitability.

| Source                                                                                                                                                                                          | Retrieved UTC | SHA-256                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| [changelog.md](https://supabase.com/changelog.md)                                                                                                                                               | 08:34:49      | `15b3d0d1a7dc3b3f2c0af4788e49acfdf2d2edbd2613f22de0705fa43b1cf58b` |
| [securing-your-api.md](https://supabase.com/docs/guides/api/securing-your-api.md)                                                                                                               | 08:34:49      | `d2c47fd37a58003f294e11f47cdb05bdd2bb853f350c006a9e6a2c4249868e46` |
| [row-level-security.md](https://supabase.com/docs/guides/database/postgres/row-level-security.md)                                                                                               | 08:34:49      | `9398df00c60160ffbbdf9b53f02e61bd34db000d291152a3268a00a95e4cdac8` |
| [functions-datetime.html](https://www.postgresql.org/docs/17/functions-datetime.html)                                                                                                           | 08:34:49      | `20965f1539d658c525d403ad548d697cfcb8967f4faf8f81127373572f33821d` |
| [datatype-datetime.html](https://www.postgresql.org/docs/17/datatype-datetime.html)                                                                                                             | 08:34:49      | `108c082718240b46d0c94d1659bb2543fbf8173b6f189584651a524c42d75278` |
| [sql-createpolicy.html](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                                                                               | 08:34:49      | `1772bf6791789204d77a0ed3e35c0ff2f7ea988fb71f64a0b4b3a19908fad6a6` |
| [ddl-rowsecurity.html](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                                                                                                                 | 08:34:51      | `4cdf084d8e36009d03790c508585bd7c4c237aac4165dbbc9173866dbffc980e` |
| [sql-createfunction.html](https://www.postgresql.org/docs/17/sql-createfunction.html)                                                                                                           | 08:34:51      | `887e05c52a98890006d7d63cd1dcbb933309376ff78967bef6693f247dddbf43` |
| [transaction-iso.html](https://www.postgresql.org/docs/17/transaction-iso.html)                                                                                                                 | 08:34:51      | `e3475df0c76b214dbda0bc681015099763b83778e1355e17ee7b908e6fd38a26` |
| [explicit-locking.html](https://www.postgresql.org/docs/17/explicit-locking.html)                                                                                                               | 08:34:51      | `cce2f9f92449f15fcb9927c23f164701652ed352470838d5db5a1bd930a77193` |
| [ddl-constraints.html](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                                                                                 | 08:34:51      | `dadc6166e3dcae0a1c91ada5373ef046682876b6db32e8c771338a4cb9b8c4be` |
| [45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) | 08:36:15      | `0498d6de526b9e452aeedd03204ded05a10be179927560960e2a75dbc26b6ef1` |
| [postgres-15-19-17-11-breaking-changes](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)                                                                                   | 08:36:14      | `cae06f958699d2a7dbf63a594e1c4e03af7c70464d6d108b7cd1639e72824583` |
| [cbc-tls-ciphers-deprecated](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)                                                                                                         | 08:36:15      | `286d738c00ca2b97812b6f94f42a0c463bdbe1598bf6398d356eb165ede5c5c0` |

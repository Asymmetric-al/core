# D33 database and authorization evidence

Reviewed **October 18, 2026 UTC**, repository HEAD
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and current working tree.
The selected direction permits optional missionary reporting of actual offline
gifts when the organization enables it, with the tenant control **Off by default**.
P15 owns the same operational intake and subsequent finance continuation.
This note proposes technical safeguards; it is not implementation, runtime
qualification or independent ratification of those safeguards.

Only this new evidence note is written. No application, schema, database,
provider or dependency was changed; no earlier artifact/model/probe was run or
modified. Findings are static source observations and contract requirements,
not demonstrated production exploits. Deployed catalogs and real user sessions
were not inspected. Twelve fresh primary GETs are recorded at the end.

## Outcome and governing boundary

**Accept with required amendments.** Add one qualified missionary entry point to
the existing source-owned report command, not a missionary donation-insert route,
editable financial staging row or local pending-money ledger.

[P15 D1:431–459](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:431)
already owns the operational intake extension. It may hold honest unresolved
facts outside a valid financial batch; it does not create money, verified custody,
tax dating, receipt eligibility or fulfillment. Every eventual financial root
still has complete valid scope, and the single batch commit remains the offline
money entry boundary. A qualified direct finance entry does not acquire a
compulsory preliminary report.

[P27 requests:77–87](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:77),
[REQ27-F59–F64](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:587)
and [owner reconciliation:21–25](../../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:21)
already separate report/read/correct/route/finance powers, recorder/holder/next
actor, exact same-item continuation, duplicate-report origins and independent
recording/physical-handling outcomes. D33 selects the bounded missionary consumer;
it does not replace these contracts.

[P12:11](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:11)
owns the single permission/projection spine and code-owned capability registry.
[Its Entity scope rule:31–39](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:31)
requires current qualified financial Entity scope; an intake's unknown intended
Entity cannot become a wildcard Entity grant. The existing unresolved-intake
envelope is a separately restricted purpose, not weakened finance authorization.

## Current code and concrete reuse hazards

Fresh targeted searches of missionary portal/app paths for offline/intake/
awaiting-finance/gift-report commands found redaction and an analytics comment,
not a qualified D33 source. Searches for reported-gift/intake/batch owner tables
in API/migrations likewise did not establish the intended operational producer.
These are bounded search results, not proof that no differently named path exists.

| Exact evidence                                                                                                                                                                                                                                                                                                                                        | Current behavior                                                                                                                                                                                 | D33 consequence and claim limit                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Offline route:41](../../../../../packages/api/src/admin/contributions/offline-route.ts:41), [role gate:63](../../../../../packages/api/src/admin/contributions/offline-route.ts:63)                                                                                                                                                                  | Staff/admin route requires `finance:manage_contributions`; its input is a financial contribution request.                                                                                        | Do not add missionary to this role list or grant finance power to expose reporting. Report creation needs its own current source action and bounded payload.                                                                                      |
| [Dependency binding:36–67](../../../../../packages/api/src/admin/contributions/offline-dependencies.ts:36)                                                                                                                                                                                                                                            | Both persistence dependencies deliberately throw HTTP 501. Comments describe a future legacy `donations` insert binding.                                                                         | This is not an operational intake implementation. P15 D1 explicitly supersedes that write direction with its single batch pipeline: never wire the legacy donation path for D33. Comments do not override the governing owner.                    |
| [Offline orchestration:97](../../../../../packages/api/src/admin/contributions/offline-entry.ts:97), [write result:106](../../../../../packages/api/src/admin/contributions/offline-entry.ts:106)                                                                                                                                                     | The unbound orchestration can resolve/create a known donor and is designed to return contribution/receipt state.                                                                                 | Missionary reporting cannot create/match a canonical donor or claim posted/receiptable money. Preserve only neutral validation lessons; do not reuse these effects. No live donor creation through this unbound route was demonstrated.           |
| [Legacy schema:70–104](../../../../../packages/api/src/schemas/contributions-offline.ts:70), [known donor requirement:123](../../../../../packages/api/src/schemas/contributions-offline.ts:123)                                                                                                                                                      | Requires positive amount, literal USD and complete known/unknown modes; checks cannot use unknown donor mode.                                                                                    | The intended incomplete intake can truthfully lack donor/amount/currency/Entity facts. Do not require fake values or treat an unresolved check payer as an anonymous legal donor.                                                                 |
| [Legacy conversion:49–61](../../../../../packages/api/src/admin/contributions/offline-logic.ts:49), [canonical parser:26–53](../../../../../packages/api/src/money/index.ts:26)                                                                                                                                                                       | Old contribution logic rounds `amount * 100`; the canonical money module instead validates currency exponent, precision and safe exact units.                                                    | Where reported amount and currency are actually known, use exact canonical validation. An unqualified reported value is not ledger money, and unknown/noncash facts cannot be converted to default USD or zero.                                   |
| [Staged gifts:64–95](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:64)                                                                                                                                                                                                                                               | Existing financial staging requires a donation ID, amount and currency and carries receipt/posting fields.                                                                                       | It is not the incomplete operational envelope. Do not force report creation to create a donation, widen this table to missionaries or stash the report as authoritative JSON metadata.                                                            |
| [Staged PATCH:150–215](../../../../../packages/api/src/admin/contributions/staged-gifts.ts:150)                                                                                                                                                                                                                                                       | Header update occurs before allocation-total validation; allocation replacement/status update and audit are separate calls.                                                                      | This sequence is not an atomic report-correction or finance-continuation contract. Copying it could accept partial facts while returning an error. No real partial-write incident was exercised.                                                  |
| [Replacement RPC:22–57](../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql:22), [ACL:61](../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql:61)                                                                                                                     | RPC locks a tenant-scoped staged gift and atomically replaces its allocations; it is invoker code with service-role-only EXECUTE. Target fund/missionary identity is supplied to that operation. | Useful evidence of a narrow atomic primitive, not proof of D33 reporting, complete financial relationship authority or atomic audit/header/continuation. Do not open the RPC to reporters.                                                        |
| [Financial staging FKs:153–176](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:153)                                                                                                                                                                                                                                   | Child Tenant and gift references are separate FKs in this migration, and child audit/allocation rows cascade with the staged gift.                                                               | D33 requires tenant-equal source relationships and retained original/continuation history under its owner; generic IDs/cascades are not sufficient. Deployed constraints were not inspected.                                                      |
| [Initial grants:404–421](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:404), [later grants:9](../../../../../supabase/migrations/20260513173739_expose_phase_03_service_tables_to_rest.sql:9), [deny policy:16](../../../../../supabase/migrations/20260513173938_add_phase_03_rest_visibility_deny_policies.sql:16) | Initial browser revokes were followed by authenticated grants and explicit false RLS policies while service paths remained available.                                                            | Review the complete effective grant/policy history. Do not claim either the initial revoke or the later grants alone proves current exposure. A default-permissive false policy is not a permanent veto against a future permissive allow policy. |
| [Capability registry:12–53](../../../../../packages/auth/permissions.ts:12), [contribution capabilities:90](../../../../../packages/api/src/admin/contribution-operations/permissions.ts:90)                                                                                                                                                          | Current inspected registries expose coarse staff and contribution operations capabilities, not a demonstrated missionary report/read/correct/route contract.                                     | Qualify explicit P15/P12 actions and current scope; a role, possession, task assignment or generic financial capability cannot substitute.                                                                                                        |
| [Organization settings:9](../../../../../packages/api/src/admin/org-settings.ts:9), [PATCH:48–69](../../../../../packages/api/src/admin/org-settings.ts:48)                                                                                                                                                                                           | Existing post-visibility settings route uses a fixed default Tenant even with a role-gated PATCH.                                                                                                | Do not use it as the D33 policy template. Trusted current Tenant, exact manage action, revision checks and persisted-result recovery are required. No deployed fixed-Tenant mutation exploit was tested.                                          |

The historical staging migration mentions Twenty. The
[retirement migration:39](../../../../../supabase/migrations/20260818010000_retire_twenty_crm_runtime.sql:39)
explicitly records that gifts stay in Asym Postgres. D33 must not restore CRM sync,
an old contribution writer or a second vendor store.

## Exact proposed authorization and data requirements

**A01 — Create is not finance.** Missionary report-create SHALL require current
authenticated Tenant, qualified reporting scope/action, tenant policy On and an
available qualified P15 intake adapter. Role labels, possession, assignment and
UI visibility SHALL grant no additional power. Report/read/correct/route/finance/
receipt actions remain independently authorized; reporting SHALL NOT create a
Party, post or correct money, allocate fulfillment, issue a tax receipt, mark a
deposit/clearance, change contact consent or send a donor message.

**A02 — Minimal trusted identity.** Tenant, original recorder identity, server
recorded-at instant, source identity and accepted command attribution SHALL be
derived and immutable under the source owner. The reported receiver/holder and
reported occurrence precision are attributed assertions, separately represented
from the trusted recorder and current accountable next actor. Changing responsibility
is not evidence of physical transfer. Candidate subject/Party/Entity/recipient IDs
must be resolved under current source permission; caller fields cannot set
ownership, approval, finance completion or audit identity.

**A03 — Honest incomplete facts.** Keep required operational Tenant/source scope
and current accountable recovery non-null. Allow explicit unknown donor, amount,
intended Entity, allocation, tender or holder only within P15's restricted envelope.
No unknown value becomes a wildcard, fake Party, default USD/Entity, zero amount,
noncash valuation or guessed tax date. A fully specified reported amount/currency
uses checked exact canonical units; unresolved literal information remains a
reported fact until source resolution, never an invented normalized financial
value. Validate reported date/instant precision without turning date-only/unknown
time into a falsely observed midnight. Record time and financial dating remain
separate. Do not weaken eventual financial-root constraints to accommodate intake.

**A04 — Same report, same source.** Finance SHALL continue or exactly reconcile
the original P15 intake through its qualified staging/batch/commit owner.
Preserve exact lineage through carried rows, corrected scope and independent
reports. One check with multiple designations remains one intake item; distinct
checks remain distinct. Equal name, amount, date, check number or serialized
payload SHALL NOT merge actual items. Independent reports of one item retain both
origins under an authorized canonical resolution. A reporter cannot relink the
report to an arbitrary posted gift or claim finance completion.

**A05 — Separate progress dimensions.** Source-confirmed coverage of the exact
recording obligation resolves only that work. Physical handoff/handling, deposit,
clearance, return/loss/dispute and financial posting remain independent. Accepted
report status SHALL NOT increase received-support totals or trigger money-based
follow-up. Correctly posted money remains posted when a report projection fails;
later NSF or reversal does not invent renewed possession. Material correction
and exact finance resolution must serialize, not silently overwrite one another.

**A06 — Tenant control.** The existing settings owner SHALL maintain one explicit
On/Off value, default Off, with trusted Tenant/action/actor, expected revision,
durable command result and required audit. Missing/invalid/unavailable policy
cannot authorize new missionary reports. Enabling the setting is not sufficient
to enable an unqualified source lane. Off stops new missionary report admission;
it does not delete accepted reports, revoke independently held read/correction/
routing rights, stop finance continuation or suppress unresolved actual handling.
Qualified staff intake remains governed by its own actions. Re-enabling SHALL
not auto-submit stale drafts or manufacture new effects from old reports.

**A07 — Off and permission races.** Policy change, report admission and relevant
revocation/scope mutation SHALL participate in a qualified common serialization
or version-fence protocol. Revalidate current policy, action/scope and source
readiness at final acceptance, including after lock waits. Use actual current time
for expiry checks, not transaction-start time. If acceptance wins first, preserve
the accepted report and required work; if Off/revocation wins first, no new report
may commit. A stale UI, old token, pending background job or previously valid
preflight is not current authority. This order must be proved, not inferred from
two sequential application checks.

**A08 — Durable semantic recovery.** Reuse the same report-command identity for
the same reporting intent across duplicate clicks/retries/reconnect. Bind its
Tenant/actor/purpose and exact semantic payload; changed payload with the same key
conflicts. A lost-response retry of an already accepted command recovers that
accepted result under current disclosure without requiring report-create to still
be On and without executing again. An unaccepted command after Off cannot create.
New request keys cannot be used to evade an existing intent identity, while
independent human reports must not be deduplicated by a content heuristic.
Distinguish an ordinary semantic command receipt from a tax receipt.

**A09 — Atomic source command.** Accepted report/correction SHALL atomically commit
its required source state/revision, attribution/history, semantic command receipt,
required audit and durable identifier-only work/continuation intent. Failure of a
required write cannot leave a successful partial report. Secondary task/notification
projection can retry from that durable intent; source evidence, not a notification,
proves acceptance. Routing needs a qualified current next actor or owned exception;
unknown routing cannot become a broadcast to guessed finance recipients. Real
unresolved handling survives recipient departure and policy changes.

**A10 — Protected transitions and constraints.** Use tenant-aware keys and composite
references for intake, corrections, lineage, work and receipts; enforce required
identities, closed valid states and semantic uniqueness where expressible. Financial
Entity-bearing relationships require current exact Entity scope when resolved.
Do not make nullable intended Entity an authorization wildcard. Reporters SHALL
NOT generically retarget Tenant/subject/original recorder, rewrite original receipt
assertion, set financial completion or replace authoritative lineage. Correction
uses its own currently authorized owner command with expected revisions and
retained originals. Both old-row eligibility and allowed resulting state must hold.

**A11 — Safe reader, not finance access.** Maya SHALL receive only a current
independently permitted intake/status/next-action projection. A minimal “recorded”
result does not require full financial-record access or an unusable privileged link.
Report creation does not authorize supporter search, restricted Party discovery,
other reports, whole financial rows or all-Entity queries. Protect even existence,
counts, previews, source links and recovered results. Read authorization SHALL be
checked at final disclosure release; late responses from a previous Tenant/actor/
scope generation are discarded. Already released bytes cannot be recalled.
Caches, history, exports, logs, notices and any future file derivatives obey the
same boundary. Do not introduce check-image/bank-field storage or sensitive
persistent browser drafts for this narrow lane.

**A12 — Source retention and safe rollout.** Intake/history/lineage follows P15's
qualified retention, redaction and hold/disposition ownership. Report/profile
deletion, draft cleanup, staff departure, policy Off and restore cannot erase
required unresolved work, accepted lineage or semantic recovery evidence.
Preserve lawful original attribution without requiring indefinite private-body
retention. Default new policy Off, add qualified source/projection/command
protections before UI activation, and fence old unsupported writers. Mixed-version
code must deny unsupported operations rather than guess source state. A kill switch
stops new reporting while preserving accepted recovery and finance continuity.
Rollback after accepted reports must retain their source/history and support
roll-forward repair; it cannot restore the retired legacy contribution path.

## PostgreSQL and Supabase enforcement

Fresh [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
and [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
distinguish database object grants from row policies. Inspect all effective grants,
RLS policies, owners, views/RPC ACLs, exposed schemas, realtime and supported
service-role/import/repair paths for the actual deployment. Default-denied new
intake writes and a narrow server-owned command do not justify granting reporters
access to current financial staging. Domain authorization is still the P12 spine;
coarse RLS is a backstop, not a competing permission engine.

Primary PostgreSQL documentation qualifies the skill's generic shortcuts:

- [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) uses
  `USING` for old rows and `WITH CHECK` for new rows. For UPDATE/ALL, omitted
  `WITH CHECK` inherits `USING`; omission alone is not a reassignment exploit.
  Both states can still satisfy coarse policy while illegally changing report
  meaning or protected identity. Default-permissive policies combine with OR;
  one false policy does not veto another applicable permissive allow policy.
- [Row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) normally
  exempts table owners; FORCE RLS can bind ordinary owners but not superusers or
  BYPASSRLS. [SECURITY DEFINER](https://www.postgresql.org/docs/17/sql-createfunction.html)
  uses its actual owner's privileges, not automatic unconditional bypass. Inspect
  ownership, PUBLIC EXECUTE, schema reachability and trusted search paths. Every
  supported production privileged entry must still enforce domain action/scope;
  arbitrary unrestricted superuser SQL is not claimed safe.
- [READ COMMITTED](https://www.postgresql.org/docs/17/transaction-iso.html) and
  the RLS cross-table example show why waiting on one source row is insufficient
  when a policy/permission lookup can use an earlier snapshot. Both sides need
  the qualified fence and under-lock recheck; deterministic lock order and whole
  command retries must preserve semantic identity.
- [Current-time functions](https://www.postgresql.org/docs/17/functions-datetime.html)
  distinguish transaction-start `now()` from actual `clock_timestamp()`. Authority
  cannot remain valid through a long wait just because the transaction began On.
- [Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html) can encode
  keys, relationships, nonnull/closed states and uniqueness; they cannot substitute
  for a current cross-row source permission/transition command. Do not put mutable
  cross-table authorization into an ordinary CHECK and call the contract proved.

This review proposes no live policy change. The current staging deny posture and
service-only allocation RPC are not evidence of an exploitable public intake;
the risk is widening/reusing them without the intended source boundary.

## Required proof before activation

These are unperformed outcome tests at the eventual real source/SQL/API/UI seams.

| Case                                                                             | Required outcome                                                                                                                                |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Default Off; missing/invalid policy; unqualified adapter                         | No missionary report admission; no fallback contribution insert. Qualified staff paths and accepted report continuity remain independent.       |
| On plus exact report action, with unknown donor/amount/Entity                    | One restricted operational report with truthful unknowns and accountable recovery; no fake money/identity/default scope.                        |
| Current report actor versus holder/next actor                                    | Trusted recorder remains original; reported possession stays attributed; reassignment alone cannot assert handoff.                              |
| Report-only missionary tries finance/view/correct/route APIs                     | Deny each ungranted action; no donation, Party, receipt, fulfillment, bank clearance or broad financial discovery.                              |
| Off/revoke/expiry races create, both orders and across lock wait                 | One well-defined accepted-or-denied result using final current state/time; no accepted report is retroactively lost.                            |
| Accepted response lost, then Off or disclosure revoked                           | Same command result recovers without another report; only current permitted evidence is returned. Unaccepted retry remains denied.              |
| Same intent repeats; changed same-key payload; independent equal-looking reports | One accepted intent, semantic conflict for changed payload, separate origins for genuine independent reports; no heuristic physical-item merge. |
| Finance continuation or already-posted exact match                               | Continue/reconcile the original item once with source lineage; no duplicate entry, contribution, tax receipt or fulfillment application.        |
| Reporter correction races exact finance resolution                               | Material revision conflict is visible; no silent overwrite of source or financial truth. Required correction/history remains attributable.      |
| Posted before handoff; handoff before posting; NSF/return/loss                   | Correct independent recording/handling/clearance outcomes; no invented completion or renewed possession.                                        |
| Cross-Tenant/Entity/subject/Party, forged actor/holder role and forbidden UPDATE | Every supported API/RPC/service/direct-grant path enforces old/new scope and resulting state; reported unknown Entity grants no Entity access.  |
| Failed audit/receipt/state/intent write; failed secondary projection             | No partial accepted source effect; accepted source recovers qualified work from durable intent without rewriting money.                         |
| Hidden report/status, Tenant switch, stale cache and old idempotent response     | No source existence/count/detail leak; old client responses are discarded and protected state cleared appropriately.                            |
| Profile departure, draft cleanup, Off, retention/hold and restore                | Unresolved real handling and exact lawful lineage survive under source ownership; stale writes/denies/recovery cannot be bypassed.              |
| Old/new code/schema, kill switch and rollback after accepted reports             | Unsupported writes fail safely; old offline 501 donation binding remains retired; source recovery and finance continuation remain available.    |
| Production-shaped report/routing queue with declared limits                      | Bounded indexed Tenant/source/intent lookups, current-owner recovery and fair queues; no silent truncation or unsupported throughput promise.   |

## Fresh primary retrievals

The repository Supabase and PostgreSQL skills were read/applied; their generic
claims were checked against primary documentation above. Relevant changelog
entries were fetched, including new-table API grants (existing grants are not
removed), PostgreSQL 15.19/17.11 upgrade implications and November TLS changes.
These need actual deployment qualification; they establish no hosted version or
current D33 vulnerability. All entries below returned HTTP 200 on October 18,
2026 UTC. Hashes identify fetched bytes, not product or runtime proof.

| Source                                                                                                                                                                                          | Retrieved UTC   | SHA-256                                                            | Bytes  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------ | ------ |
| [changelog.md](https://supabase.com/changelog.md)                                                                                                                                               | 04:37:00.673561 | `15b3d0d1a7dc3b3f2c0af4788e49acfdf2d2edbd2613f22de0705fa43b1cf58b` | 102319 |
| [securing-your-api.md](https://supabase.com/docs/guides/api/securing-your-api.md)                                                                                                               | 04:37:00.714955 | `d2c47fd37a58003f294e11f47cdb05bdd2bb853f350c006a9e6a2c4249868e46` | 18172  |
| [row-level-security.md](https://supabase.com/docs/guides/database/postgres/row-level-security.md)                                                                                               | 04:37:00.698026 | `9398df00c60160ffbbdf9b53f02e61bd34db000d291152a3268a00a95e4cdac8` | 30344  |
| [sql-createpolicy.html](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                                                                               | 04:37:01.492984 | `1772bf6791789204d77a0ed3e35c0ff2f7ea988fb71f64a0b4b3a19908fad6a6` | 46910  |
| [ddl-rowsecurity.html](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                                                                                                                 | 04:37:01.851118 | `4cdf084d8e36009d03790c508585bd7c4c237aac4165dbbc9173866dbffc980e` | 31181  |
| [sql-createfunction.html](https://www.postgresql.org/docs/17/sql-createfunction.html)                                                                                                           | 04:37:03.212292 | `887e05c52a98890006d7d63cd1dcbb933309376ff78967bef6693f247dddbf43` | 51069  |
| [transaction-iso.html](https://www.postgresql.org/docs/17/transaction-iso.html)                                                                                                                 | 04:37:02.599419 | `e3475df0c76b214dbda0bc681015099763b83778e1355e17ee7b908e6fd38a26` | 47618  |
| [functions-datetime.html](https://www.postgresql.org/docs/17/functions-datetime.html)                                                                                                           | 04:37:02.898435 | `20965f1539d658c525d403ad548d697cfcb8967f4faf8f81127373572f33821d` | 108106 |
| [ddl-constraints.html](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                                                                                 | 04:37:01.800612 | `dadc6166e3dcae0a1c91ada5373ef046682876b6db32e8c771338a4cb9b8c4be` | 44707  |
| [45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) | 04:37:02.856961 | `45b7decafe590b735e051fb7256491f82bc72dee35b16e59b3a52154b5a9cc75` | 163465 |
| [postgres-15-19-17-11-breaking-changes](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)                                                                                   | 04:37:02.773596 | `0757e3c6e5a8d2f27e84e4755ee36c30dfd554cda25f2d2fbbc4104559515fad` | 246967 |
| [cbc-tls-ciphers-deprecated](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)                                                                                                         | 04:37:02.893561 | `901ff198ee2f248d2dbc73d722017f553100f1666ef6f3fddd3630f57a060a67` | 87727  |

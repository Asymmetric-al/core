# D30 database and policy authorization review

**October 18, 2026 UTC** · repository HEAD
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

This is a static source and primary-documentation review of selected Q30 A:
eligible received gifts for a confirmed specific one-time need may independently
qualify for personal follow-up. Organization-wide On/Off versus per-need override
is still awaiting the founder's clarification at the time of this evidence note.
The recommendations below do not silently select an answer, grant permission,
modify a schema or qualify deployed behavior. Only this evidence note and its
[technical retrieval manifest](technical-fetches.json) were written.

## Technical disposition and exact owner boundaries

**Accept with required amendments.** Use the existing P28 qualified purpose and
D20 shared-work contract with one additional criterion. A raw Need ID, campaign
link, fund default, title, end date, one-time payment or generic confirmed flag
must not become proof. Qualification requires both an owner-certified specific
one-time need/purpose and exact eligible gift/portion correspondence. Neither
fact supplies the other.

P13 owns received money, allocations and corrections; P14 owns qualified
attribution; P16 owns commitment application. P27 source facts can support exact
need/purpose evidence, but P28 owns this independent native stewardship qualifier.
P9's shared task remains its human work projection. Need closure and automatic
follow-up policy are distinct from those facts. In particular:

- [P27 REQ27-F83:818](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:818)
  requires actionable source occurrence and forbids task-per-link/member/response.
  An appeal link therefore cannot itself admit D30 work.
- [P27 REQ27-F84:829](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:829)
  fences new appeal-originated planning/solicitation on closure while allowing
  late facts/corrections against prior terms. It does not say that a received
  gift ceases to exist or becomes ordinary support when a need closes.
- [ADR-0206:19](../../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md:19)
  prohibits changing any posted financial field. This criterion belongs in
  separate source-owned operational purpose state, not a mutable posted-row flag.
- [ADR-0183:622](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
  preserves independent task completion and durable identifier-only projection
  intent. Task materialization is not source admission or communication.

**Necessary distinction:** a closed/funded need can still be the truthful purpose
of received support. That fact grants no new solicitation, contact, email, receipt
or need-reopening authority. Reclassification of what the need actually meant is
a separate attributable correction; current display text or status cannot
rewrite historical gift purpose. Source truth and current disclosure are both
required, so preserving a historical purpose does not preserve an obsolete read
grant to its title or body.

## Fresh current-code inspection and reused D29 findings

The HEAD is unchanged from D29. Relevant task/staging source was reread and the
inspected files have no tracked working-tree diff. The following explicitly
reuses D29's static findings rather than claiming a new runtime verification.
The original [D29 database review](../../grill/d29-evidence/database-and-authorization.md)
remains unchanged. No previous database or finite probe was rerun.

| Evidence                                                                                                                                                                                                                     | What exists; limits of the evidence                                                                                                                                                                                                                                                                                                                                   | D30 consequence                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Organization settings:9](../../../../../packages/api/src/admin/org-settings.ts:9), [GET:22](../../../../../packages/api/src/admin/org-settings.ts:22), [PATCH:48](../../../../../packages/api/src/admin/org-settings.ts:48) | Current visibility GET/PATCH use a hard-coded default Tenant. PATCH checks admin role and accepted visibility values, then writes that fixed row; it has no source policy revision/activation receipt or expected-head check. It returns submitted state after an error-free update, without a returned persisted row. This is an adjacent visibility route, not D30. | Do not copy this into the policy. Resolve current Tenant/action through P12; strictly validate a typed command; accept one exact current revision; persist history/audit/receipt atomically and return authoritative state. A zero-row/no-effect result must not be a successful activation.            |
| [Tenant baseline:14](../../../../../supabase/migrations/20250101000000_init_schema.sql:14), [current revoke:41](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:41)                 | A generic `org_settings` JSON object exists, but secret-bearing `tenants` rows have all `anon`/`authenticated` access revoked in a later migration. The current route uses a cookie client, not an admin client.                                                                                                                                                      | Do not claim the hard-coded route is an exercised cross-Tenant exploit; under the checked revoke it can fail closed. Equally, do not restore browser access to secret-bearing tenant rows to make a setting work. Use a safe source-owned command/read projection and verify effective deployed grants. |
| [Settings role test:42](../../../../../packages/api/tests/unit/org-settings-role-gate.test.ts:42)                                                                                                                            | Unit test mocks a successful update and checks role gating; it does not exercise actual RLS, correct Tenant selection, affected-row count, concurrent policy heads or source admission.                                                                                                                                                                               | A passing role test cannot qualify D30 policy safety. Actual catalog/command tests are required; no such test was run for this research note.                                                                                                                                                           |
| [Campaign schema:9](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:9) and [donation campaign relation:291](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:291)         | Current campaign metadata/title/status/goals and a donation campaign UUID relationship exist. They do not establish a source-qualified one-time need, immutable donor-intent binding or P28 purpose admission.                                                                                                                                                        | Do not classify every campaign/fund/payment with an end date as a one-time need. No mandatory new Need table or appeal is selected; an eligible source adapter must prove the exact fact and lineage first.                                                                                             |
| [Task PATCH:61](../../../../../packages/api/src/missionary-portal/task.ts:61), [DELETE:102](../../../../../packages/api/src/missionary-portal/task.ts:102)                                                                   | As in D29, generic manual-task mutation/deletion has no generated-source or exact reviewed-coverage guard. Task POST forces manual provenance; current task schema/query is profile-oriented.                                                                                                                                                                         | Adding a new reason to these paths alone cannot implement D20 handling. Fence/delegate source-relevant mutation before generated work uses them; do not erase purpose coverage through generic task deletion.                                                                                           |
| [Task projection fields:81](../../../../../packages/api/src/missionary-portal/service.ts:81)                                                                                                                                 | Current task projection returns stored title/description and joined donor fields. It has no independently qualified need-purpose/title projection.                                                                                                                                                                                                                    | Do not copy a sensitive need title into a durable task title, notification or search record and then rely on the need page's permissions. Every derivative must enforce current disclosure.                                                                                                             |
| [Staged review:139](../../../../../packages/api/src/admin/contributions/staged-gifts.ts:139), [replacement RPC:22](../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql:22)           | D29's static defects remain: donor/status/note writes precede allocation-total validation, later audit is independent, and the allocation RPC deletes/recreates physical child rows. The RPC locks the same-Tenant parent and restricts EXECUTE to service role.                                                                                                      | Keep useful parent-lock atomicity, but do not adopt this multi-call flow or replaceable physical child ID as immutable D30 gift/portion identity. The existing code is not the new purpose source.                                                                                                      |
| [Auth registry:12](../../../../../packages/auth/permissions.ts:12), [contribution capabilities:90](../../../../../packages/api/src/admin/contribution-operations/permissions.ts:90)                                          | Existing registries do not establish a D30 policy-management or exact need-purpose-confirmation capability. D29's actor selection is accepted product intent, not a deployed generic grant to all purpose actions.                                                                                                                                                    | Qualify the D30 action through the same P12 spine. Policy management, eligible need definition, gift-purpose confirmation, task handling, financial correction and protected source-body reading remain separate authorities.                                                                           |

Bounded source/migration searches found no implemented D30 producer or purpose
policy. Generic campaign references and notification queues do not prove one.
This absence claim is limited to the inspected terms/paths; it is not an audit
of an authenticated live application or all differently named implementation.

## Recommended policy semantics: simple controls, exact durable meaning

Recommend one organization-wide control, initially Off until deliberately
enabled, with no per-need exceptions unless the founder chooses that scope.
This is a **proposed D30 policy amendment**, not an inference that D22's amount
policy already controls this purpose. The separate role grant is also not the
On/Off switch: On makes the criterion available; it does not authorize any
specific caller, gift, source body or send.

[D22's ratified lifecycle:206](../phase28-d22-amount-based-gift-follow-up-adversarial-review.md:206)
provides a useful existing pattern for prospective enabled intervals and accepted
work. Reconcile D30 explicitly with it rather than silently copying its currency
threshold model. D30 needs no currency-setting grid, amount threshold, rule DSL,
approval queue, new event store or alternate task list.

| Transition or fact                                    | Required D30 semantics if the recommended policy is adopted                                                                                                                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unconfigured, disabled, unavailable                   | New admission is denied in all three; the UI must distinguish saved Off from unreadable/unknown state. Do not show a failed policy fetch as Off or a successful policy save.                                                                                                          |
| Enable                                                | Authorized staff deliberately accepts a new prospective enabled interval under the current policy head. No sweep of prior gifts, need links or old confirmation labels.                                                                                                               |
| Eligible original live receipt                        | The source binds the exact canonical first owner-qualified received-support boundary to the applicable enabled interval. Gift date, webhook arrival, worker execution or newly inserted purpose row is not that boundary.                                                             |
| First valid purpose evidence arrives later            | A still-unadmitted candidate from that originally-live cohort can qualify while its applicable interval remains continuously enabled, with current source/permission proof. Do not require the donor statement to have been entered at checkout or posting.                           |
| Off                                                   | Commit closes new admissions at the owner boundary. It neither deletes admitted reasons nor cancels current accepted tasks/intents, marks them Done, changes source evidence, or automatically contacts anyone. Later materialization of already-accepted intent remains recoverable. |
| Off races admission                                   | Exactly one qualified ordering: admission first retains existing work; Off first prevents the unadmitted effect. A previously cached On value cannot authorize a later admission.                                                                                                     |
| On after Off                                          | New prospective interval. Never-admitted candidates from earlier closed intervals, or receipts originally eligible while Off, do not revive simply because the boolean is true again.                                                                                                 |
| Owner repair of accepted work                         | Reconcile the same originally-admitted, still-unconsumed effect under current truth/authority even while the admission policy is Off. This is repair, not new admission or replay of Done/Not needed coverage.                                                                        |
| Actual closure versus funding/goal attainment         | Preserve received-gift purpose and independent admitted stewardship. Actual owner closure applies its qualified planning/solicitation fence. Funding/goal attainment alone neither closes coordination nor creates a new fence. Neither event permits a send or proves completion.    |
| Need meaning/gift-purpose/financial fact is corrected | Requalify only affected reasons using exact owner revisions. Withdrawal preserves independent reasons and handled history. Rename, relink, reopen or re-enable cannot manufacture a new gift-purpose effect.                                                                          |

Purpose facts remain recordable/correctable through their qualified owner while
this automatic criterion is Off; the switch controls new automatic admission,
not whether historical truth may exist. Any product decision to disable a source
command would require its own explicit scope and cannot prevent necessary
correction or conceal accepted obligations.

Policy revisions need trusted acceptance time and non-overlapping, deterministically
ordered active intervals. Ordinary edits cannot backdate an enable. Equal-clock
timestamps need a durable sequence/order, not timestamp comparison alone. A real
source correction to event timing uses the owner's qualified correction path;
the actor cannot choose the convenient historical policy revision. Late delivery
must retain the original live boundary and interval; unknown lineage withholds
the affected admission for owner resolution. A timestamp generated by the
consumer cannot repair missing source ordering evidence.

If the founder chooses per-need customization, its precedence, default,
applicability, eligibility-interval closure and parent-Off behavior must be
specified and tested. Do not introduce nullable `enabled` booleans whose meaning
alternates between inherit, Off and unknown. This note does not authorize that
additional configuration layer while the question is pending.

## Minimum source, constraint and mutation contract

1. **Policy fact:** one current D30 policy per exact Tenant and immutable accepted
   revision/interval history under the settings owner; trusted actor/time and
   expected head. Preserve referenced revisions under the qualified retention
   schedule. No caller-provided Tenant, role, approval, actor or activation time.
   Physical storage may reuse existing qualified owner mechanisms; generic
   arbitrary JSON patching cannot be its mutation interface.
2. **Need-purpose fact:** source-certified identity/type, exact relevant meaning
   revision and permitted correspondence to the gift/portion. Do not store a
   duplicated editable need title/body as authority. Closure/state history and
   substantive meaning correction are distinct. A campaign renamed “one-time”
   does not retroactively certify gifts. An existing valid reference does not
   grant protected source-body read permission.
3. **Gift-purpose fact:** same Tenant, Legal Entity, canonical business gift,
   eligible Party, typed ministry/project, exact source-qualified portion,
   need-purpose source and revisions. Use the D29 evidence/attribution principles
   through an explicitly qualified D30 action; do not silently widen D29's action
   or make every missionary a finance editor. Staff/missionary actor eligibility
   alone does not replace the organization-granted exact permission.
4. **Relations and identity:** enforce required non-null scope and appropriate
   composite candidate keys/FKs where the owner has compatible keys. A Need UUID
   plus an independent Tenant FK cannot prove same Tenant/Entity/subject.
   Immutable source identity and original recorder must not be retargetable even
   between two otherwise writable resources. Cross-owner revision qualification
   stays with the source boundary, not a pretend cross-table CHECK.
5. **One effect:** reuse D20's canonical contribution/Party/typed-subject/purpose
   member; multiple needs, portions, evidence versions or independent D29/D30/
   amount reasons do not multiply that member. Distinct business gifts remain
   distinct. Policy revision and delivery ID are consumed evidence, not new
   business-effect identities. Follow the existing owner grain across genuinely
   distinct subjects; do not impose a global one-task-per-gift shortcut.
6. **Atomic acceptance:** purpose qualification/admission, expected source/policy
   heads, required semantic receipt, audit and identifier-only projection intent
   commit together. Required local failure leaves no partial accepted effect.
   Financial posting does not wait for task materialization or human handling.
   Async projection rechecks current applicable source facts and current reader/
   responsibility authority without converting policy Off into cancellation.
7. **Money and portions:** use exact source currency/units and qualified financial
   boundaries. No extra balance, currency conversion, amount inference, financial
   restriction or P16 application follows from the need purpose. Ambiguous partial
   correction withholds the affected reason; it cannot silently prorate. Overlapping
   need portions cannot duplicate effective money or broaden D20 coverage.
8. **Correction and disposition:** append attributable correction/withdrawal under
   an expected current head; keep valid independent reasons and completed human
   history. Profile/source deletion cannot cascade into independent lawful money/
   coverage history. Source retention/holds/privacy deletion qualify each body,
   reference and minimal history separately; append-only does not mean perpetual
   retention. D28 private-preparation retention is not the schedule for this work.

## RLS, function and temporal facts checked against current primary sources

The Supabase skill and repository rules were read. Current public technical
pages were fetched on October 18; the manifest records twelve successful GETs.
The following corrects overbroad skill wording rather than repeating it:

- [Supabase API grants](https://supabase.com/docs/guides/api/securing-your-api)
  and [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
  are separate controls. Verify exposed schemas, table/column grants, effective
  policies, views, function ACLs and roles together. Do not expose secret-bearing
  tenant rows or raw purpose/evidence data just to display a toggle or task.
- [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
  defines old-row `USING` and new-row `WITH CHECK`; omitted `WITH CHECK` for
  `UPDATE`/`ALL` inherits `USING`. Omission alone does not prove reassignment.
  Both sides may be allowed while changing immutable origin, so source-transition
  safeguards remain necessary. Permissive policies combine with OR; a permissive
  false policy is not a universal deny override.
- [PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
  normally exempts ordinary owners unless FORCE RLS is set, while superusers and
  `BYPASSRLS` roles still bypass. [Definer functions](https://www.postgresql.org/docs/17/sql-createfunction.html)
  use actual owner privileges, not an intrinsic unconditional bypass. Qualify
  owner/search path/EXECUTE grants and revoke default PUBLIC execution where
  required in the same migration transaction. Browser role labels or service
  credentials are not the P12 product decision.
- [Constraint documentation](https://www.postgresql.org/docs/17/ddl-constraints.html)
  distinguishes row checks from cross-row constraints; CHECK accepts null absent
  a NOT NULL invariant. Use real uniqueness/FKs and source commands rather than
  assuming JSON validation or a UUID alone proves relationships. Normalize errors
  from constraints so hidden-source existence is not disclosed.
- [READ COMMITTED](https://www.postgresql.org/docs/17/transaction-iso.html)
  can recheck a locked changed row without making other queried rows current.
  The RLS documentation explicitly warns about cross-table permission races.
  Policy Off, source correction and admission need a proven common locking/CAS/
  serialization protocol at the real acceptance boundary, not only an initial
  lookup or a purpose-row lock. Both competing commands must participate.
- [Current-time functions](https://www.postgresql.org/docs/17/functions-datetime.html)
  distinguish `CURRENT_TIMESTAMP`/`now()` at transaction start from actual
  `clock_timestamp()`. Recheck expiring authority with actual current time after
  waits at final admission. An earlier transaction timestamp cannot preserve an
  expired grant. No single isolation-level label proves these product invariants.

Coarse Tenant RLS remains defense in depth beneath the single P12 permission/
projection spine; no parallel fine-grained SQL permission engine is recommended.
Direct tables, REST, RPC, background/service-role, import, repair and maintenance
paths all need the same qualified source command. Actual deployed grants/roles,
policies, schema drift and concurrency were **not** inspected or tested here.

## Hidden titles, projections and user-facing safety

The ordinary task may show **Gift for vehicle repairs** only when that exact
current purpose/title projection is allowed. If P12 permits the generic purpose
but not the title, **Gift for a specific one-time need** is a possible safe label.
If it does not permit even that fact, generic wording is not a workaround. Keep
other permitted reasons/work visible and follow the source's restricted/unavailable
presentation; do not disclose hidden need counts, identifiers or former names.

Apply current projection before list/search/count/sort/filter, joins, task detail,
notifications, activity history, exports, recovered command results and every
cache/serialization. A stored old task title can disclose a newly restricted
need even when the need page is protected. Key cached results by exact subject,
viewer and authorization/source generation; discard unsafe state and late
responses after context change. Redact sensitive titles, bodies and donor/location
content from logs/outbox payloads. The final disclosure-release check must have
an explicit owner boundary; revocation cannot recall bytes already released.

The setting can still be one clean switch with a brief explanation: **Off stops
new follow-up from this rule. Existing follow-up stays available.** Saved state,
unsaved choice, saving, failed/unknown response and permission loss are distinct.
Do not allow a stale Save to silently undo a newer Off. Show success from the
accepted revision/readback; an unknown response recovers the same operation.
Need purpose and money remain available only under their own current permissions.

## Required real proof and rollout

No new synthetic probe is necessary to establish the documented engine facts.
The following are future release gates, not results already obtained:

| Case                                                                          | Required falsifiable outcome                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same/different transport retries and concurrent confirmers                    | One semantic source effect and compatible current D20 task; changed-payload same-operation conflicts.                                                                                                                                                                              |
| On/Off racing admission in both commit orders                                 | Admission-first survives; Off-first cannot use cached On. Accepted intent may materialize after Off without becoming a new admission.                                                                                                                                              |
| On→Off→On and delayed evidence                                                | No revival of previously never-admitted candidates; same originally-live evidence qualifies only in its allowed continuous interval.                                                                                                                                               |
| Qualified late finality versus late delivery/history import                   | Real later eligible source event can establish its actual boundary; transport timestamp, relabel or new link cannot.                                                                                                                                                               |
| Actual closure and funded-but-open versus gift-purpose admission              | Funded-but-open acquires no automatic closure/fence. Actual closure preserves its owner-qualified fence; independently source-eligible received-gift purpose may still qualify within the D30 interval. No send, automatic reopening or redirection of an ineligible gift follows. |
| Need meaning, gift portion or financial correction versus admission/Done      | Current source revisions and reviewed coverage win in both orders; independent reasons survive and unreviewed gifts remain pending.                                                                                                                                                |
| Permission expires while blocked on a lock                                    | Final admission uses actual current time and denies expired authority despite an older transaction timestamp.                                                                                                                                                                      |
| Cross-Tenant/Entity/subject IDs; permitted-to-permitted origin retarget       | All API/RPC/direct/privileged paths deny wrong relationships or immutable-origin changes without leaking hidden existence.                                                                                                                                                         |
| Hidden title/body, current privacy change and stale cache/response            | Task/search/count/notification/history never bypass current projection; released-byte limits are stated honestly.                                                                                                                                                                  |
| Required local persistence failure; success then lost response; worker outage | No partial accepted state; same-operation recovery; durable intent eventually repairs exact existing work under current facts.                                                                                                                                                     |
| Off then source repair; completed coverage and multiple reasons               | Existing unconsumed admitted work can be repaired; completed/Not needed work never replays; only invalid reasons withdraw.                                                                                                                                                         |
| Actual retained data and mixed versions                                       | Old generic writers cannot forge purpose or erase coverage; no backfill of new admissions from historical campaign labels.                                                                                                                                                         |

Deploy additive compatible source/policy history, constraints, command and read
projections first. Qualify exact source adapters and P12 actions; fence old
writers; keep admission Off until proof passes. Preserve accepted evidence,
receipts and work under rollback/restore; reconcile current policy intervals,
source heads, access restrictions and consumed coverage before reopening reads or
releasing intents. A rollback must not reactivate the unsafe legacy writer.
No destructive backfill, new database or attachment store is required.

Index proven grains: Tenant/current policy head, source contribution/typed subject,
need-purpose revision, semantic effect/receipt and pending projection claim.
Use bounded pagination/claims and deterministic lock ordering. Measure actual
plans, hot-Tenant skew, correction fan-out and lock contention under a declared
workload; do not invent capacity numbers or scan all giving history. A new policy
version must not rewrite every historical gift or fan out one task per need.

Fresh [Supabase changelog](https://supabase.com/changelog.md) review found the same
relevant notices as D29: [explicit new-table Data API grants](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
roll out to existing projects October 30, 2026 while existing grants remain;
[PostgreSQL 15.19/17.11 extension/operator changes](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
need actual-version qualification; and [legacy TLS cipher removal](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)
starts no earlier than November 10, 2026. None supplies a new D30 policy/source
authority or requires another integration. Explicit grants and compatible
migrations cannot rely on an assumed hosted default.

The permanent minimum is one optional admission policy, one qualified exact
need-purpose reason, and the existing shared-task lifecycle. Source permission,
financial truth and privacy are fixed safeguards, not tenant-customizable
exceptions. Policy granularity awaits the founder; exact current-source and
runtime qualification remain implementation obligations.

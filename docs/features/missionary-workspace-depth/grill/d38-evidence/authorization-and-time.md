# D38 — Authorization, source ownership and time review

Reviewed October 18, 2026 UTC against repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its existing working tree.
Scope: Q38 B selects separately configurable organization periods for new and
deliberately continued referrals. This is a research contribution to the parent
review, not ratification, a formal specification, implementation or live proof.
No earlier model, probe or verifier was executed. No app, schema or existing
evidence file was changed.

**Recommendation: Accept with required amendments.** Two independent values are
reasonable tenant customization. The material risks are treating a setting as
permission, applying a new value retroactively, silently starting an imported
referral's clock now, and confusing a new referral with a continuation of the
same referral. Two fields do not require two authorization systems, timer engines
or write authorities.

## Governing repository evidence

| Evidence                                                                                                                                                                                                                                                           | Verified meaning and consequence                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Q38 scope](q38-before-answer.txt:31) and [initial-clock qualification](q38-before-answer.txt:80)                                                                                                                                                                  | The question selects one versus two organization values. It explicitly does not select an initial clock anchor or number. B cannot silently settle those product semantics.                                                                                             |
| [D36 initial exclusion](../phase28-d36-configured-referral-period-adversarial-review.md:48), [C01](../phase28-d36-configured-referral-period-adversarial-review.md:231)                                                                                            | D36's renewed period remains intact. D38 adds the separate initial setting; it does not replace the renewed field or reinterpret already accepted cycles.                                                                                                               |
| [D36 C03–C10](../phase28-d36-configured-referral-period-adversarial-review.md:248)                                                                                                                                                                                 | Continued periods use positive whole elapsed days, 86,400 seconds each, one fresh trusted acceptance instant after required waits, prospective policy revisions, one consumed expired cycle and exact expiry at E. Source facts, rather than display precision, govern. |
| [D35 C01–C03](../phase28-d35-referral-continuation-adversarial-review.md:178)                                                                                                                                                                                      | Missionary continuation is a separate organization control, initially Off for unconfigured tenants. Independent staff action and exact current scope still apply.                                                                                                       |
| [D34 C03–C08](../phase28-d34-expired-referral-history-adversarial-review.md:175)                                                                                                                                                                                   | History is a narrow currently authorized projection. Ordinary expiry differs from refusal, Never Ask or other ineligibility. Looking at history cannot continue a referral or restore private material.                                                                 |
| [P9 ownership](../../../../prds/program-roadmap/owner-constraints.md:81), [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)                                                                                           | Native CRM owns referral edges with same-tenant endpoints and preserved time-bound history. Do not create a second missionary referral or contact-status store.                                                                                                         |
| [P9 A17](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:581)                                                                                                                                                                    | A native source mutation, required audit and activity commit together. A generic CRM/provider command journal and money-path idempotency header are expressly excluded. Narrow semantic recovery is allowed through owner change evidence.                              |
| [P12 current context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552)                                                                                                                                                     | Server-validated current tenant, assignment, scope and capabilities govern; a role name or client tenant id is insufficient. The intended unified tenant/RLS model is not established merely by documentation.                                                          |
| [ADR-0209](../../../../adr/0209-static-field-policies-and-subtract-only-projection.md:16), [ADR-0210](../../../../adr/0210-code-authoritative-capability-foundation.md:15), [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md:16) | Use existing capability meaning and subtract-only field/row resolver. New timing projections must be classified. Actual projection-policy widening retains separate approval; an ordinary duration edit does not require a new routine approval workflow.               |
| [Identity and access](../../../../../openspec/specs/identity-and-access/spec.md:45), [data boundary](../../../../guides/architecture/data-access-boundary.md:8)                                                                                                    | App checks and RLS are complementary. Source business logic remains in `packages/api`; routes are thin, and this multi-fact mutation is not a browser single-table write.                                                                                               |

## Current implementation is not a qualified D38 producer

Fresh bounded case-insensitive searches for referral, continuation and introduction
in `packages/api`, `packages/database`, `supabase/migrations` and
`apps/missionary` found no matching source implementation. This is bounded static
evidence, not proof of repository-wide absence or deployed state. Relevant current
paths were read directly rather than relying only on earlier D35 findings.

| Current source                                                                                                                                                                                                                     | What exists                                                                                                                                               | Consequence                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Missionary model](../../../../../packages/api/src/missionary-portal/model.ts:150), [service selection](../../../../../packages/api/src/missionary-portal/service.ts:59)                                                           | A broad donor relationship DTO includes contact, location, giving and person-wide status.                                                                 | This is neither D34's limited history projection nor a cycle/period authority. Do not add two dates here and call referral lifecycle implemented.                                                                             |
| [Donor update schema](../../../../../packages/api/src/missionary-portal/donor.ts:25), [mutation](../../../../../packages/api/src/missionary-portal/donor.ts:174)                                                                   | Active/Lapsed/New/At Risk and contact fields are writable through an admin client; the query checks tenant, assignment and explicit anonymity preference. | Those checks are useful existing behavior, but no exact referral cycle, duration revision, one-effect continuation or source clock contract is established by this path. Reusing person status would conflate distinct facts. |
| [Missionary helper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:14)                                                                                                                                         | A missionary role check precedes a service-role handler.                                                                                                  | A role and privileged database client do not supply D38's exact action/manage authority or currentness after waits.                                                                                                           |
| [Organization settings](../../../../../packages/api/src/admin/org-settings.ts:9), [PATCH](../../../../../packages/api/src/admin/org-settings.ts:48)                                                                                | A current visibility setting uses a fixed tenant id, with an explicit admin role check for PATCH.                                                         | Do not copy this handler for referral policy. Tenant must come from the validated current context; current manage capability and policy revision must govern. This is a concrete reuse hazard, not a confirmed live exploit.  |
| [Browser grants](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157), [server-only tables](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261) | Donor reads have explicit grants/policies; missionary tasks remain revoked from raw browser access.                                                       | A read grant is no referral write grant. The effective full migration chain, deployed grants/functions and privileged paths require release proof.                                                                            |
| [Local database major](../../../../../supabase/config.toml:34)                                                                                                                                                                     | Local configuration selects PostgreSQL 17.                                                                                                                | Version-17 primary documentation is the relevant baseline; the actual deployed version and extensions were not inspected.                                                                                                     |

No database connection, RLS exploit, live grants census, concurrency run or browser
journey was performed. Current code observations establish reuse risks only.

## Fresh primary technical documentation

The Supabase skill was consulted for database review; its shorthand claim that an
omitted `WITH CHECK` inherently permits ownership reassignment is not adopted.
PostgreSQL documents inheritance of `USING` where applicable. D36 C13 already
requires this distinction. Even an inherited check is not column immutability,
and a permitted old row plus permitted new row does not establish a valid source
transition.

- [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html),
  freshly opened: grants and RLS differ; owners/BYPASSRLS bypass ordinary policies;
  permissive policies combine with OR; related-table policy lookups can race.
- [PostgreSQL 17 date/time](https://www.postgresql.org/docs/17/functions-datetime.html),
  freshly opened: transaction-start time differs from wall time. Calendar-day
  arithmetic can differ from elapsed 24-hour arithmetic across DST.
- [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security),
  freshly opened: qualify privileged paths and exposed relations independently.
- [Supabase changelog](https://supabase.com/changelog.md), fetched successfully
  after the web tool rejected its Markdown content type. Relevant
  [explicit-grant rollout](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
  confirms new-table exposure defaults change, while existing table grants remain.
  Schema creation therefore must explicitly state least privileges and test them.
  Its example broad grants are examples, not an authorization design to copy.
- [PostgreSQL minor-release notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
  was checked because local configuration targets 17. Deployment qualification
  must use the actual engine/extensions. D38 requires no new extension.

These technical sources support precise implementation safeguards; they do not
prove how long a ministry should allow a referral or when an initial window
should start. The TLS and unrelated SDK/platform notices do not change D38's
product semantics and do not justify a new dependency or upgrade project here.

## Material concerns and exact recommended prevention

Likelihood labels below are engineering judgments if the unamended feature is
implemented, not measured incident rates. Severity concerns the possible outcome.

| Concern                                               | Severity / likelihood, evidence and consequence                                                                                                                                                               | Exact proposed language                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial duration mistaken for initial clock semantics | High / plausible. Q38 explicitly left the anchor open; delayed entry or import could create a fresh window for old information. Narrows B.                                                                    | **The separate initial period SHALL not imply a new clock start. Its source event, effective-time precision and late-entry/import treatment SHALL be explicit before activation. Preserve original introduction evidence. Import/replay SHALL not create or renew an active window merely by writing now.**                                                          |
| Initial and continued values silently linked          | Medium / plausible. A convenience checkbox, hidden fallback or copy-on-change can defeat the chosen independence and make edits unpredictable. Changes the proposed UI.                                       | **The organization SHALL have two independently saved values, allowed to be equal. Saving either SHALL not overwrite or link the other. Do not add a persistent “same as” dependency, per-person overrides or arbitrary formula editor.**                                                                                                                            |
| Settings change rewrites existing work                | High / plausible. Recomputing E from current policy changes promised dates and historical interpretation. D36 C05–C06 prohibit it for continuation. Extends safeguards to the new initial value.              | **Each accepted window SHALL retain its type, start/end facts, duration and applicable policy evidence. Later ordinary setting edits SHALL affect future accepted windows only. No bulk deadline rewrite, implicit extension, retroactive shortening or source-history rewrite.**                                                                                    |
| Off interpreted as Never or expiry disabling          | High / plausible. User asks disable, but D35 defines missionary Off and owner constraints require expiry. Narrows disable meaning and may require a separate product choice if broader disabling is intended. | **Zero, blank or null SHALL not mean Off or Never. Existing missionary-continuation Off SHALL block new missionary continuations without disabling finite expiry, accepted work, history reads or independent staff authority. Period administration SHALL not enable the lane.**                                                                                    |
| Wrong actor/tenant or stale authority                 | Critical / plausible if current generic settings/service patterns are copied. Fixed-tenant settings and role-only helpers are concrete static hazards. Changes required mutation boundary.                    | **Tenant, actor, attribution, action and management authority SHALL be server-derived in current context. The source transaction SHALL re-prove relevant authority and policy after waits under the same qualified ordering as their changes. Neither client ids nor prior page checks authorize a write.**                                                          |
| Shared revision causes unnecessary user conflicts     | Medium / plausible. Two values may use one policy object, but changing new-referral terms need not disturb a continuation already reviewed under unchanged terms. Refines currentness.                        | **Settings Save SHALL protect its actual edited fields against lost updates. Action review SHALL bind the applicable period and genuinely relevant policy/source conditions; an unrelated initial-period edit alone SHALL not require renewed continuation review. Physical policy-revision changes SHALL not be mistaken for changed material terms.**              |
| Clock shortcut or equality mistake                    | High / plausible. `now()` before a lock wait, a date-only comparison or local-day arithmetic shifts expiry. D36 C04/C10 and PostgreSQL docs substantiate. Retains existing semantics.                         | **For continued cycles preserve D36's source acceptance A and E=A+N×86,400 seconds; active means A≤T<E under current source/access rules, expired at T=E. Capture fresh trusted time after waits. Worker lag, rounded display or timezone changes SHALL not move E.**                                                                                                |
| Duplicate/replayed action affects another cycle       | High / plausible. Per-request ids and disabled buttons do not constrain two actors or an old retry. D35 C07–C09 cover semantic effect. Retains and extends safeguards.                                        | **An expired cycle SHALL be consumed at most once, including distinct requests. Accepted retries SHALL recover the original outcome/end time under current read authority, even after policy changes or later expiry; they SHALL not continue a later cycle. Definitive no-effect intents SHALL not become effects after re-enable.**                                |
| Broad reads or protected-to-unprotected mutation      | High / plausible. Broad current DTO and service paths are not the target permission model. Changes release conditions.                                                                                        | **Classify policy/timing fields under ADR-0209 and apply the shared resolver on all release paths. Qualify grants, RLS USING/WITH CHECK composition, immutable fields, views, RPC ownership/EXECUTE/search paths, service role and operator paths. A permitted UPDATE SHALL not move tenant, lineage, actor or accepted terms into a forbidden state.**              |
| Mixed-version rollout applies wrong period            | High / plausible. Old code may read one field as both, or backfill unknown initial values from continuation. Changes rollout requirements.                                                                    | **Preserve a qualified existing renewed value in its exact meaning. Do not infer missing initial values or recompute historical deadlines. Deploy compatible readers/writers and source contracts before enabling new admission. Rollback SHALL preserve accepted two-period evidence and disable affected new commands where old code cannot interpret it safely.** |

The initial anchor is a real unresolved semantic dependency, not a reason to ask
the founder to choose database types. One defensible product choice is a fresh
native active-work admission with introduction history kept separate; another is
the original introduction instant. They produce different outcomes for delayed
handoffs. Neither is selected by B, and a review must not quietly choose one by
labeling it an engineering detail. Historical import is not a loophole for either
choice: existing qualified source deadlines remain facts, and unqualified records
do not receive fabricated active authority.

## Minimal owner design without freezing a schema

Use the existing tenant configuration owner and P9 referral owner. The semantic
data is a tenant policy with distinct initial/continued durations; an accepted
window with its kind, original lineage, source-defined anchor, finite end,
accepted duration and relevant policy evidence; and existing native attributed
history/recovery evidence. This does not demand new tables or a generic policy
framework. Two fields and their qualified source command are sufficient.

Required tenant/source/cycle/policy references need non-null protection and
tenant-aware foreign relationships. Use structural constraints for positive
integral representable durations, finite timestamp combinations, accepted fact
immutability, logical active uniqueness and consumed-cycle uniqueness where the
owner representation permits. A nullable field denotes unconfigured only in the
qualified policy model; it must never make an active window indefinite. SQL CHECK
alone does not reject null. Do not put changing current time, permissions or
cross-row policy lookups into an assumed immutable CHECK.

Policy changes cannot cascade-delete accepted evidence. Retention, lawful erasure
and source-history requirements remain separate; preserving an audit event does
not justify copying private referral bodies. No new money columns, rounding,
currency conversion or financial conservation rules are involved.

No full-history scan is needed for an ordinary setting edit: save current policy
and audit once. Current deadline evaluation uses source facts and trusted time;
a background job is not needed merely to decide expiry. If existing projections
use jobs, fence each by exact source cycle/revision and E so a late old expiry
cannot terminate newer work. Keep external I/O outside the source transaction.
Required secondary work needs durable native intent and replay of the accepted
effect, never re-execution of Continue.

## Boundary and race proof obligations

These are proposed release proofs, not tests executed in this review.

1. Initial and continued values differ; each command uses its own value. Equal
   values remain allowed, and editing one leaves the other unchanged.
2. Missing one value gates only commands requiring it. Continued value remains
   configurable while missionary continuation is Off; invalid unsaved drafts do
   not prevent turning self-service Off. Existing windows remain unchanged.
3. Reject empty, null-as-value, zero, negative, fractional, nonnumeric, nonfinite,
   unsupported and overflow values without clamping or coercion. Source owner
   publishes one actual supported range and arithmetic/driver precision, and the
   form/API/database prove the same boundaries. No arbitrary universal maximum
   or default is asserted by this research.
4. For the continued clock, check E−ε, E, E+ε at the qualified source precision,
   plus waits crossing expiry, DST transitions, offset changes and date rounding.
   At E deny this path even if a cached flag still says Active.
5. Relevant value A→B→A and Off→On revisions cannot validate a previously stale
   intent. An unrelated setting change does not create needless reconfirmation.
6. Policy edit versus acceptance; Off versus acceptance; permission revocation
   versus acceptance; merge/reassignment/correction versus acceptance. A prior
   committed relevant restriction prevents stale acceptance; a later restriction
   does not erase already accepted history.
7. Two actors with different transport keys target the same expired cycle. One
   effect wins; correct original performer persists. An old accepted request
   arriving after another expiry cannot open the next cycle.
8. Source commit followed by response loss, stale UI, disclosure revocation or
   projection failure. Recover original outcome without guessing failure or
   widening reads. No result-read failure may recreate the effect.
9. Direct API/raw-table/RPC/service/operator attempts to alter tenant, owner,
   source id, cycle kind, duration snapshot, policy revision, attribution or end
   time. Verify both permitted old state and forbidden transition/new state.
10. Cross-tenant selectors/cache keys, stale context, omitted fields, metadata,
    counts, exports and error paths disclose nothing outside current projection.
11. Historical import with precise known deadline, date-only introduction,
    unknown original timezone, no start evidence, ended/erased source and replay.
    Preserve uncertainty and source facts; do not manufacture a fresh active
    period. Initial-anchor behavior requires its explicit source contract.
12. Old-code/new-schema and new-code/old-schema rollout, settings adoption,
    interrupted migration and rollback after accepted new data. A new field's
    existence alone cannot enable admissions or re-enable missionary permission.

## Ordering and monitoring

Before D38 is recorded as a final decision, state two independent values,
prospective edits, preserved D35/D36 boundaries and the unresolved initial-anchor
scope honestly. Capture the exact initial start/import contract before activation;
do not describe runtime safety as verified until its source exists and is tested.
Then implement the native mutation/projection seams, qualify schema and all
privileged paths, and run the race/rollout proofs before exposing controls.

Safety invariants above are release requirements, not monitor-only risks.
If operational monitoring is adopted, these are concrete proposed checks:

| Signal                                                                      | Threshold                                                                         | Owner                         | Response                                                                                                                                    |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate accepted continuation for the same expired cycle                  | Any confirmed occurrence                                                          | P9/API owner                  | Stop affected new admissions, preserve source evidence, diagnose and apply qualified correction; never dedupe by deleting history.          |
| Accepted end changed by ordinary configuration save or same-intent recovery | Any confirmed occurrence                                                          | P9/API owner                  | Disable the defective writer, reconcile affected records from accepted evidence and repair the writer before re-enabling.                   |
| Unauthorized timing/identity release or cross-tenant access                 | Any confirmed occurrence                                                          | P12/security owner            | Contain the affected release path immediately, preserve minimal audit evidence and follow incident response.                                |
| Two-period controls misunderstood as auto-renew or editable end dates       | Two observed failures in a five-person moderated staff/missionary usability round | Phase 28 product/design owner | Revise labels/helper copy and repeat the affected task before rollout. This is a proposed evaluation threshold, not measured user feedback. |

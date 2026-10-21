# D24 — Current coaching and activity-summary source evidence

Research only, 17 October 2026 UTC. The founder selected **A: optional coach
activity summaries**, when the organization permits and the missionary
deliberately shares. The founder subsequently selected ongoing sharing of future
periods of the same explicitly selected target while sharing remains active.
Choosing a personal target alone shares nothing. This note distinguishes present
code, selected intent, ratified inherited requirements and candidate safeguards.
The [Q24 scenario](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q24-coaching-activity-summary-research.md:10)
uses illustrative counts and targets, not recommended quantities.

## Fresh scope and limits

Fresh bounded searches covered the missionary app/package; other app trees for
coach symbols; API, auth, database types/collections/hooks, GraphQL, migrations
and related tests. Terms included coach/coaching, activity summary/target, goal
version, membership, permissions, metrics, cache, dates and grants. Reached reads
covered shell/proxy/navigation, auth and membership RPC, portal/donor APIs,
metrics API/hook, activity writer, projection foundations, follower-request
mutation and shared UI.

No native coaching portfolio/detail/sharing route, coaching activity-summary
endpoint or qualified activity-target store was found in these inspected paths.
The activity-summary symbol found in Mission Control is an automation-run
summary. This is a bounded census, not a whole-repository or hosted absence claim.

Applicable root/missionary/API/auth/database/UI/Supabase instructions, backend/
data-boundary rules and repository Supabase/auth skills were read. D23 evidence
is prior static context; the key source/cache paths were freshly reopened.
No app/schema/dependency/formal-owner edit, live query, provider/send action,
ticket, installation, migration replay or runtime test occurred.

## Accepted intent is not current implementation

[D8-C01–C04](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:417)
require the coach's own identity, active context, exact canonical subject and
organization ceiling. [D8-C07–C12](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:469)
preserve independent grants, explicit module/history scope, read-only coaching,
voluntary information and safe projection.
[D8-C18–C20](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:579)
cover every surface, current release/cache, exact review and bounded portfolio.
These are ratified requirements, not working routes established by this pass.

Ratified [D23-C02–C06](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d23-activity-targets-adversarial-review.md:235)
keep target versions with P28 Support-Raising Goal Versions and actual
occurrence/participation/outcome with P9/P27/P6/P17. Supported measures retain
canonical meaning, exact person/purpose and distinct source identity.
Overlapping personal measures are not a team/organization rollup.
[D23-C13/C14](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d23-activity-targets-adversarial-review.md:329)
separate aggregate-only rights from raw history and forbid implied coaching
disclosure. D24 adds an optional module without removing those boundaries.

[D10 financial history](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d10-adversarial-review.md:53)
does not grant activity history. [D11 duration](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d11-coaching-duration-decision.md:16)
allows ongoing sharing with optional end under current authority. Access
duration, source period, target revision and freshness remain distinct.
The founder has now selected continuation into future periods of the same
explicitly selected target. That choice does not silently include new targets,
materially changed subjects/measures or periods before the reviewed first period.
The [main D24 synthesis](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d24-coaching-activity-summary-adversarial-review.md)
records that selected direction and its proposed safeguards. This note does not
invent an earlier lookback, permanent retention, frozen snapshot or renewal policy.

## Current facts and unsafe reuse

### S1 — Current identity and roles do not implement the coach context

[Current role types](/workspace/core/packages/database/types/database.ts:30)
include donor, missionary, admin, staff and super_admin; membership roles are
donor, missionary and staff. The [membership foundation](/workspace/core/supabase/migrations/20260226113000_authz_memberships_foundation.sql:45)
has tenant/user/role keys, active flag, own-row read RLS and service-role policy.
Its [enum](/workspace/core/supabase/migrations/20260226113000_authz_memberships_foundation.sql:22)
does not include coach. This does not prescribe adding a global profile-role
enum: D8/P12 own the proper tenant Role Assignment and active context model.

[getAuthContext](/workspace/core/packages/auth/context.ts:250) validates the user,
loads the caller's profile through the request client and derives its tenant.
The [membership loader](/workspace/core/packages/auth/context.ts:305) uses a
caller-bound RPC, filters active rows for that tenant and known roles, and fails
closed on membership-read error. The [RPC migration](/workspace/core/supabase/migrations/20260802041500_current_user_memberships_rpc.sql:22)
uses SECURITY DEFINER, empty search_path, auth.uid(), exact tenant and active
predicate; PUBLIC execution is revoked and authenticated execution is granted.
These are useful actual boundaries, not client-selected actor identity.

The [permission helper](/workspace/core/packages/auth/permissions.ts:61)
combines membership with compatibility profile-role fallbacks. Its
[staff capabilities](/workspace/core/packages/auth/permissions.ts:32) give the
same broad CRM/gift/report capabilities to all listed staff subroles. A role or
membership is not a D24 sharing episode, module grant, exact period scope or
current protected-aggregate authorization. Making a coach staff/missionary as a
shortcut would grant powers beyond the selected read-only module.

The [app gate](/workspace/core/apps/missionary/app/access.ts:3),
[proxy](/workspace/core/apps/missionary/proxy.ts:9) and
[streamed gate](/workspace/core/apps/missionary/app/layout.tsx:58) use the
missionary/admin/staff/super_admin allowlist. The
[navigation](/workspace/core/apps/missionary/components/navigation-items.ts:31)
has Dashboard, Donors, Ministry Updates, Analytics, Tasks, Profile and Settings;
no Coaching entry. This is reusable shell infrastructure, not a delivered coach
journey. Navigation visibility cannot substitute for endpoint authority.

### S2 — The self-workspace payload is too broad for coach summaries

The [portal handler](/workspace/core/packages/api/src/missionary-portal/index.ts:7)
requires missionary role and uses authenticated profile/tenant. Its
[context resolution](/workspace/core/packages/api/src/missionary-portal/service.ts:159)
checks both profile and missionary in that tenant. The
[snapshot queries](/workspace/core/packages/api/src/missionary-portal/service.ts:187)
fetch up to 250 donations, 250 donors, 100 tasks and ten posts.
The [response shape](/workspace/core/packages/database/hooks/missionary-portal.ts:30)
contains personal/contact fields, donor relationships, gift information, task
text and ministry updates. It is not aggregate-only.

The [donor handler](/workspace/core/packages/api/src/missionary-portal/donors.ts:581)
also derives identity from auth and returns donor/detail rows. Do not broaden
these endpoints to a coach-supplied missionary ID then hide fields in React.
Authorize and project the narrow summary before serialization.
The [operation wrapper](/workspace/core/packages/api/src/shared/with-operation.ts:137)
provides auth, an admin client and audit helper; it does not itself evaluate D24
module/history rights or transform a broad response into an approved summary.

### S3 — Existing analytics is not a coach-safe aggregate endpoint

The mounted metrics API's [authorization](/workspace/core/packages/api/src/missionaries/metrics.ts:172)
checks auth, allowed roles, tenant and missionary ownership with a staff/admin
path. It then [reads donation rows](/workspace/core/packages/api/src/missionaries/metrics.ts:246)
containing ID, amount, type, created_at and status over 13 months.
[useDonationMetrics](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:181)
receives and aggregates those rows in the browser. A chart displaying only
monthly totals does not establish an aggregate-only network payload. This is a
financial endpoint, not a claim that coaches can currently reach it.

The hook correctly treats a permission-limited response as
[Unavailable](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:205)
and uses current-request checks and cancellation. Reuse those state patterns,
not raw-row delivery, financial formulas or its date basis for D24.

A separate [getMissionaryMetrics helper](/workspace/core/packages/api/src/reads/missionary-metrics.ts:85)
uses Next.js cache, tenant/missionary parameters and an admin client to count
follows/posts and compute financial totals/13-month series. Its signature has
no coach/principal/purpose/grant revision. No call expression outside its
definition was found in the bounded apps/packages search. It is neither a
demonstrated mounted leak nor a qualified coach aggregator; tenant-keyed caching
alone would not authorize a new D24 release.

The [automation activity summary](/workspace/core/packages/api/src/admin/mission-control-automations/store.ts:203)
counts capped automation executions/failures over 24 hours. It cannot supply
personal calls, exchanges or target progress. Generic audit/event row counts
are not substitute activity evidence.

### S4 — Current activity data still lacks qualified summary facts

Fresh inspection reconfirmed the [manual log schema](/workspace/core/packages/api/src/missionary-portal/donor.ts:10)
accepts type plus required note. Its [writer](/workspace/core/packages/api/src/missionary-portal/donor.ts:120)
checks donor ownership and then inserts in a separate request, using server
save time without persisted actual-participant/outcome/occurrence-precision/
command identity in that payload. The [mapper](/workspace/core/packages/api/src/missionary-portal/donors.ts:292)
substitutes created_at when activity date is absent. The
[history query](/workspace/core/packages/api/src/missionary-portal/donors.ts:532)
caps activities at 2,000 across a donor page; response pagination covers donors,
not complete activity-period evidence.

The [anonymous projection](/workspace/core/packages/api/src/missionary-portal/donors.ts:378)
removes activity arrays because of free text/PII. Empty arrays cannot certify
zero activity. The [activity collection](/workspace/core/packages/database/collections/tables/giving.ts:14)
explicitly disables realtime. More extensive
[D23 evidence](/workspace/core/docs/features/missionary-workspace-depth/grill/d23-evidence/current-activity-source.md:1)
remains static evidence, not runtime qualification promoted by reuse.

The [foundation activity table](/workspace/core/supabase/migrations/20250101000000_init_schema.sql:222)
has generic text/date fields. The inspected types/routes and fresh target/
goal-version searches did not locate the P28 activity target/period-version
producer. D23's owner extension must be qualified; it is not permission for a
second coaching goal store, copied interaction ledger or writable count.

The [June activity SELECT policy](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:211)
uses super-admin or donor-linked staff/owner predicates, not coaching
aggregate-only scope. It [keeps tasks/follower requests server-only](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261).
No hosted ACL, role inheritance, view/RPC ownership, trigger or full migration
application was tested. Do not widen raw activity SELECT merely to make a
summary invoker view work.

### S5 — Cache cleanup exists, but does not establish D24 revocation

The [portal hook](/workspace/core/packages/database/hooks/missionary-portal.ts:100)
uses one constant missionary/portal key. The
[donor hook](/workspace/core/packages/database/hooks/missionary-donors.ts:149)
keys by missionary profile and “redacted,” with 30-second stale time. Neither
binds tenant, active hat, episode, module, period and permission generation.

The [client session helper](/workspace/core/packages/auth/client-session.ts:64)
**does clear queries on sign-out or authenticated-user change** and
[rejects older auth loads](/workspace/core/packages/auth/client-session.ts:139).
Do not claim “no cache isolation.” Its comparison is user ID; same-user
tenant/hat changes, module removal, episode expiration and source restriction
are different events needing D24 qualification.

[Query defaults](/workspace/core/packages/database/providers/query-client.ts:81)
have 60-second stale time, five-minute garbage collection and no window-focus
refetch. These are general behavior, not a revocation deadline or offline grant.
The [metrics hook](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:172)
reruns on missionary ID and cancels replaced requests; it does not bind current
sharing authority. Reuse cancellation while binding release to exact current
permission/source state. Previously valid late responses or materialized values
must not restore a revoked disclosure.

### S6 — Projection foundations are useful, not an activated aggregate policy

The [field-policy reader](/workspace/core/packages/api/src/field-policies/reader.ts:25)
ignores reserved tenant overrides, loads global policies and explicitly says it
is a static ceiling, never actor authority. Missing/unclassified keys fail
closed. Its [surface registry](/workspace/core/packages/api/src/field-policies/taxonomy.ts:12)
is extensible text with unknown surfaces blind until admitted. Inventing a
“coaching” string does not authorize it.

[Projection binding types](/workspace/core/packages/api/src/projection/types.ts:5)
carry principal, tenant, purpose, context/source revision and operation. The
[admission helper](/workspace/core/packages/api/src/projection/policy.ts:50)
intersects stable static policies with resolved readable/exportable fields.
These are reusable shapes; their comments distinguish producer evidence from a
token, caller approval or live verification. D24 must resolve current authority,
permitted aggregate inputs and safe release; a matching client object cannot.

Aggregate-only authority need not grant source-row SELECT or bodies. A
missionary's personal read rights do not make all inputs shareable; conversely,
a coach's lack of raw-row rights does not force a valid aggregate to zero.
The authorized count population and displayed target must form one truthful
comparison. Do not show a smaller/differently scoped releasable subset as
complete progress against a broader target without owner-qualified meaning.

### S7 — Reuse the shell and truthful states, not follower grants or fake Save

[Follower-request approval](/workspace/core/packages/api/src/follower-requests/request.ts:17)
checks request ownership and updates approved/rejected plus view/comment access.
That is donor following, not coach own-account acceptance, subject/module/
history/duration authority. A “view” label does not establish a D24 grant.
Adding this module to a D8 relationship should not create another invitation.

[Missionary Save Preferences](/workspace/core/apps/missionary/app/settings/page-client.tsx:112)
only clears local dirty state; it cannot persist sharing. Reuse shared
[SettingsCard](/workspace/core/packages/ui/components/settings/settings-card.tsx:14),
labelled fields, Checkbox/Switch/Select/Button and the
[metric tile layout](/workspace/core/packages/ui/components/shadcn-studio/blocks/metrics-card-parts.tsx:5)
within [base-maia](/workspace/core/packages/ui/components.json:3). These are
presentation primitives, not authorization or persistence.

The mounted [analytics UI](/workspace/core/apps/missionary/app/analytics/page-client.tsx:97)
distinguishes Unavailable KPIs and loading/error/empty chart states. The shared
[Progress primitive](/workspace/core/packages/ui/components/shadcn/progress.tsx:13)
converts undefined to zero: branch missing/unshared/unavailable before rendering
numeric progress. No chart is required for a useful count/target pair. Do not
copy D23's personal “View recorded calls” link into aggregate-only coaching.

## Smallest complete candidate journey

This extends the **ratified D8 sharing journey**, not a currently mounted
coaching screen. It is proposed composition, not another permission engine.

1. **Manage Jordan's existing sharing.** Show organization, identity, exact
   subject and current episode. Offer one eligible “Activity summaries” module.
   Organization denial, unqualified source, not shared and temporary failure
   differ. Personal target creation and invitation acceptance select nothing.
2. **Review the exact offer.** Show canonical measures, target quantities, exact
   periods/calendar and truthful recorded counts/currentness/coverage. Preview
   only this proposed offer intersected with the grantor's own read rights, not
   Jordan's independent broader rights. Canonical “Calls made” is a safe simple
   initial label; private personal target names need separate qualification.
3. **Save once.** Show accepted sharing only after the existing source command
   returns its result/revision. Pending, conflict, denied and uncertain saves
   preserve input and recover the same command. A moved switch is not Shared.
4. **Read in the native portfolio/detail.** A compact card can show “Calls made ·
   [exact period] · 5 recorded / target 8” and separately “Conversations ·
   [exact period] · 2 recorded / target 3.” These overlap; there is no total of
   seven activities. No edit, log, donor drilldown or send action follows.
5. **Handle change honestly.** Qualified corrections can change allowed counts
   while preserving the accepted target/period meaning. New target versions,
   later/earlier periods, subject changes or labels cannot silently widen sharing.
   The selected continuation includes qualified future periods of that same
   explicitly selected target while sharing remains active; it does not add new
   targets or earlier periods. The reviewed first period and applicable source/
   retention bounds remain explicit in the main synthesis. Access duration alone
   still does not authorize a different module or target.
6. **Remove or end.** Removing this module fences its disclosures without
   deleting targets/activities or unrelated shared modules. Ending the episode
   follows D8/D11, preserving independent valid grants. Do not promise recall of
   information a human already saw.
7. **Recover without pressure.** Distinguish “Summary unavailable,” “Activity
   summaries aren't shared” and complete “0 recorded,” without exposing hidden
   exclusions or claiming no work. Other qualified modules stay useful. Empty
   cards create no log requirement, reminder/task, score or questionnaire.

Use keyboard controls, associated errors, focus restoration and concise status
announcements. Phone layout keeps exact dates/count meaning readable without a
report builder. No hover/color-only meaning, rank, streak, stacked total or
chart-implied history. Export/print, offline persistence and notifications remain
separate source-authorized disclosures, not automatic screen-access features.

## Eight material dimensions and exact candidate clauses

Severity and likelihood concern conditional reuse/implementation impact, not
measured exploitation or a deployed D24 defect.

| ID / dimension                       | Concern; severity and likelihood condition                                                                      | Exact candidate requirement                                                                                                                                                                                                                                                                                                                               | Proofs      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| S24-C1 — Product scope               | High; likely if target creation/invitation auto-shares targets or reporting becomes compulsory. S1/S7.          | Activity summaries SHALL be a separately deliberate optional module within the organization ceiling and exact coaching episode. Personal targets, financial sharing and access duration alone SHALL NOT imply numeric disclosure, earlier history or future periods outside the deliberately selected target continuation, compulsory logging or scoring. | P1–P2       |
| S24-C2 — Data integrity              | High; likely if coarse types/save dates/capped arrays or mismatched periods become complete progress. S3/S4/S6. | Each comparison SHALL retain canonical measure, exact person/subject/period/calendar, target version/quantity and qualified distinct recorded count with truthful coverage/currentness. Preserve D23 overlap/correction/unknown-date meaning; do not present a silently narrowed count against a broader target as complete.                              | P3–P5       |
| S24-C3 — Tenant/security/privacy     | High; conditional on broad payload, staff-role, raw-grant or client-redaction reuse. S1/S2/S4/S6.               | Resolve exact current context/episode/module/history/field authority for aggregate input and final release. Aggregate-only access SHALL grant no raw-row/body/drilldown rights; hidden fields SHALL not enter payloads. Qualify names, dates, small counts, deltas, filters and combined disclosures together; body-free SHALL not imply anonymous.       | P6–P8       |
| S24-C4 — Lifecycle/concurrency       | High; plausible with late responses, scope changes, expiry and source corrections. S5/S6.                       | Sharing commands SHALL use expected revisions and atomic acceptance/result with stable retry. Bind cached/projected release to current authority/source state; adverse changes SHALL fence stale/queued results. Source corrections, target revisions and disclosure dates remain distinct; re-enable SHALL not revive ended sharing.                     | P9–P10      |
| S24-C5 — UX/accessibility            | Medium/high; likely with personal drilldown/actions, fake Save, false zero or excessive controls. S7.           | Extend one compact sharing review and native portfolio detail. Preview the exact allowed offer; distinguish not shared, denied, pending, unavailable, partial and complete-zero recorded evidence. Preserve input/focus and show only actual actions; no narrative, chart, report builder or new invitation is required.                                  | P1, P11–P12 |
| S24-C6 — Architecture/debt/migration | High; likely if coarse roles/follower requests or duplicate stores become authority. S1/S4/S6/S7.               | Extend P28 Goal Versions and existing D8/P9/P12 sharing/projection contracts; retain P9/P27/P6/P17 source ownership. Do not duplicate goals, create a coach count ledger, promote uncertain legacy rows or grant staff/missionary rights to simulate coaching. Fence old/API/import/background writers from forged scope/provenance.                      | P2, P6, P13 |
| S24-C7 — Performance/boundedness     | Medium/high; likely if cards download raw history or paged arrays supply totals. S2–S5.                         | Authorize portfolio enumeration before results; use bounded indexed exact-scope aggregates with explicit completeness/freshness. Never send raw bodies to aggregate in the coach browser. Avoid per-card full-history fanout and preserve unrelated qualified modules during partial failure.                                                             | P5, P8, P14 |
| S24-C8 — Recovery/audit/proof        | High; plausible with uncertain saves, hidden backlog and sensitive telemetry. S5–S7.                            | Retain source-authorized sharing decisions/revisions and required audit/result separately from derived values; recover exact commands without widening scope. Diagnose stale/denied/incomplete projections with minimized telemetry. Activation requires actual authority/DB/source/race/accessibility evidence, not mocks, census or ratification.       | P9–P14      |

## Proposed falsifiable outcomes — not executed

1. Personal targets, invitation acceptance and financial sharing expose no
   activity numbers. Only deliberate eligible module save offers exact scope.
2. Activity-only coaching needs no financial goal/public page/new invitation.
   Module removal preserves source records and unrelated valid modules.
3. Five calls including two conversations produce two non-additive comparisons.
   Canonical units remain visible; personal names neither redefine facts nor
   expose private context automatically.
4. Prior/current/future target versions, pause/end and corrected actuals retain
   D23 meaning. Qualified future periods of the explicitly selected target enter
   the active share under its reviewed profile; earlier periods/new targets do
   not. A current quantity never silently replaces an earlier one, and correction
   never grants additional periods.
5. Unknown/withheld/truncated/unavailable data never yields false zero or a
   complete percentage. Complete zero is labelled recorded; a permitted subset
   is not mislabeled as a complete larger population.
6. Real-role tests allow exact aggregates while denying source rows, bodies and
   writes. A broad-role fallback or supplied actor/context cannot bypass scope.
7. Wrong tenant/subject/hat, inactive assignment, expired episode and revoked
   module deny enumeration and release. Grantor preview reveals no independent
   broader coach entitlement.
8. Test small cells, repeated/overlapping periods, filters, changed labels and
   combined portfolio cards against the actual permitted query family. Do not
   invent an unreviewed universal count threshold or anonymity guarantee.
9. Share/remove/expiry races and lost responses yield one accepted result with
   required audit. Stale preview cannot widen it; failed refresh after accepted
   Save does not turn that source transition into a rejection.
10. Same-user tenant/hat/module/source changes discard old client results and
    fence cached releases; existing sign-out/user-change isolation remains.
    Re-enable/reissue does not revive an ended episode.
11. Phone, keyboard, screen-reader, zoom and reduced-motion journeys preserve
    exact dates, definitions, input and focus without hover/color dependence.
12. No View activity/Edit target/Log activity/Send/export right comes from this
    module. An unavailable module leaves other qualified coaching usable.
13. Actual migration/grant/RPC/view/function/service/browser/import/restore
    inventory shows no source/grant bypass. Legacy uncertain rows gain no
    invented precision, participant, target or history scope.
14. Actual plans/workloads cover largest admitted portfolio, skew beyond current
    caps, corrections/revocation, cold/warm cache and low bandwidth. State bounds
    and freshness from evidence, not a row cap or disabled realtime.

## Existing tests and remaining qualification

The [app access test](/workspace/core/tests/unit/apps/missionary/app/access.test.ts:8)
checks existing app roles, not coach capability.
[Client session tests](/workspace/core/tests/unit/auth/client-session.test.ts:92)
cover stale auth loads and user-switch cleanup with mocked clients.
[Metrics hook tests](/workspace/core/tests/unit/packages/lib/use-donation-metrics.test.tsx:55)
cover limited versus empty responses and
[late A/B responses](/workspace/core/tests/unit/packages/lib/use-donation-metrics.test.tsx:136).
These are useful expectations, not actual-role D24 proof.

No tests ran. The previously recorded Sentry package-export precollection
failure was not rerun without new justification. No effective hosted grants,
complete migration replay, real aggregate producer, sharing commands, source/
revocation races, query plans, accessibility session or screenshot was obtained.
No vendor behavior was newly fetched/tested. Only this note was edited;
structural links, line bounds and whitespace are checked independently of
application correctness.

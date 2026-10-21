# Phase 28 completion review — bounded current-source and safety evidence

Reviewed 2026-10-18 at repository HEAD `9cada8f3d8ab59db391d3fd20df77fcadeb09813`,
including the current working tree. This is a fresh, read-only source review of
the reached missionary tasks/activity, donor/gift projection, dashboard/analytics,
and settings paths. It is not a deployed database audit, runtime reproduction,
performance benchmark, accessibility evaluation, or claim that all Phase 28 code
has been inspected. No prior probe, model, verifier, or test was executed. No
application or schema change was made.

The reviewed source does **not** establish Phase 28 implementation or release
completion. Several concrete reached paths remain incompatible with accepted
outcomes. This does not invalidate the product decisions or prove that every
decision needs a new interview question: these are implementation, specification
traceability, and release-proof obligations. An interview-complete claim and an
implementation-complete claim require different evidence.

Instructions consulted: root and applicable missionary/API/database/Supabase
`AGENTS.md`, backend rules, data-access boundary, OpenSpec index, the previously
loaded Supabase skill, the founder brief, and ADR-0183. The skill's shorthand
about missing `WITH CHECK` is not used as a vulnerability rule: PostgreSQL may
inherit `USING` as the resulting-row check. Effective policies, grants, roles,
privileged paths, and permissible row transformations must be reviewed together.

## S1 — Task completion and actual interaction are still separate legacy operations

**Material concern: yes. High severity; likely if current generic task behavior
is reused as the Phase 28 completion contract.**

Current behavior is precise: the tasks page dispatches generic complete/reopen
through [the handler](../../../../../apps/missionary/app/tasks/page-client.tsx:842).
[The hook](../../../../../packages/lib/hooks/use-tasks.ts:466) PATCHes only
`status: completed`, then assigns a client-clock completion time. The
[server mutation](../../../../../packages/api/src/missionary-portal/task.ts:25)
accepts status with no source contract, expected revision, reviewed purpose
membership, or actual interaction outcome. It updates the row by task and signed-in
profile, then reads it back separately. [The activity
command](../../../../../packages/api/src/missionary-portal/donor.ts:120) separately
inserts donor, activity type, title, note, and server time; it has no task-effect
receipt, explicit encounter purpose/outcome/audience, or supplied occurrence time
in that reached command.

This is **not** evidence that a checkbox currently fabricates a call: it does
not call the activity command. It is evidence that the promised one-deliberate-
completion/actual-outcome journey and permanent source-purpose coverage are not
provided by these paths. Likewise, `is_auto_generated` is not evidence that a task
has source-controlled completion authority.

The correct contract already exists in [ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:71):
source-controlled work rejects generic Complete/Reopen/Delete and obtains closure
from the owning source. Its separately defined [Independent follow-up
task](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
may truthfully finish without closing its source. Do not prohibit legitimate
human follow-up completion by treating every source-linked task as source-controlled.
The [founder brief](../phase28-founder-brief.md:125) permits recording an actual
outcome once and forbids inferred contact from UI actions.

**Required language:** “Each task's immutable server-resolved contract SHALL
determine completion authority. Source-controlled tasks SHALL reject generic
completion, reopening, deletion, and drag-to-Done through every writer.
Independent human follow-up completion SHALL preserve exact reviewed purposes
and evidence without mutating gift, commitment, or communication truth. When the
user deliberately records an actual interaction while completing work, the
authorized command SHALL record the encounter once with method, purpose,
occurrence time, provenance, outcome, and audience, and link the task disposition
without inventing contact.”

**Proof:** ordinary Done without a conversation creates no interaction; an
explicit attempted call and completed conversation retain different outcomes;
source-controlled direct PATCH/drag/bulk actions are rejected; a new gift arriving
after review is not consumed by the prior completion; two tabs and a lost response
produce one durable reviewed effect. Retained historic tasks need an authority
census and an explicit migration classification, not a guessed classification
from title or `is_auto_generated`.

## S2 — Reached task creation bypasses the server path, and retry recovery is unqualified

**Material concern: yes. High severity; high likelihood under the committed grant
posture for the direct browser path; plausible duplicate/lost-intent impact under
response failure.**

The [mounted task dialog](../../../../../apps/missionary/app/tasks/page-client.tsx:299)
still [updates/inserts `missionary_tasks` directly from the
browser](../../../../../packages/missionary/components/task-dialog.tsx:167),
including a raw donor join. Its [payload](../../../../../packages/missionary/components/task-form-model.ts:81)
accepts the browser profile as owner and writes `is_auto_generated: false` for
both creation and edit. The later [canonical browser-access
migration](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261)
revokes all browser-role privileges on this table. Under that migration posture,
these dialog writes cannot supply working manual follow-up. This is a source/grant
contradiction, not a hosted execution result.

The separate [API POST](../../../../../packages/api/src/missionary-portal/tasks.ts:67)
does derive the owner from trusted context and validates linked donor access, but
inserts before a separate readback and has no durable creation-intent identity or
receipt. A commit followed by failed readback or lost response can look like a
failure; a fresh POST can duplicate the user's one intended task. [PATCH](../../../../../packages/api/src/missionary-portal/task.ts:81)
has the same separate-readback ambiguity and no expected revision. No guarantee
of complete-once effects follows from client button disabling or an HTTP request ID.

**Required language:** “All reached task create/edit/complete paths SHALL use the
owning authorized shared-task command. The same durable user intent SHALL resolve
to one task/effect and a recoverable safe result after a timeout or lost response;
a genuinely distinct task remains possible. A stale expected revision SHALL not
overwrite newer work. The UI SHALL distinguish saved, still saving, known failure,
and uncertain outcome, preserve input, and recover the original result before
offering a duplicate creation. Browser table access SHALL not be widened to repair
a blocked privileged writer.”

**Proof:** create and edit from the actual Tasks and donor-detail entry points,
refresh/relogin durability, delayed/lost response, two-tab edit conflict,
disable/reassignment during save, and actual database grants. Ensure migration
cuts over every old writer before canonical source admission; rollback must not
reactivate the discarded writer or replay historical follow-up.

## S3 — Gift privacy depends on a separately capped donor list

**Material concern: yes. High severity; plausible when a gift's donor is absent
from the loaded relationship page or has a per-gift privacy override.**

[Snapshot service](../../../../../packages/api/src/missionary-portal/service.ts:194)
independently caps gifts and donors at 250. The
[gift select](../../../../../packages/api/src/missionary-portal/service.ts:47)
does not load per-gift anonymity or identity status. The
[snapshot mapper](../../../../../packages/api/src/missionary-portal/model.ts:306)
builds an anonymous-ID set only from loaded donors; it calls the gift redactor
with `false` when the gift's non-null donor ID is absent from that set. Consequently
the donor correlation ID survives even though no loaded row established permission
to disclose it. The helper itself [supports explicit per-gift/unknown-identity
signals and defaults missing donor preferences to
anonymous](../../../../../packages/api/src/missionary-portal/redaction.ts:38),
but this caller does not supply those signals.

The task mapper [redacts the joined donor but passes the task's title,
description, and donor ID through](../../../../../packages/api/src/missionary-portal/model.ts:261).
This cannot retract identifying content copied into a task body. It is not proof
that real protected bodies have been copied, nor proof that a retained ID alone
exposes a name through another endpoint. The exact verified gap is missing
qualification of correlation and free-text projection.

**Required language:** “Every gift and source-derived task projection SHALL
resolve current permission and privacy from its exact source, independently of
unrelated list pagination. Missing, partial, stale, or contradictory identity
evidence SHALL not admit donor correlation. Per-gift anonymity SHALL not be
overridden by a donor default. Source-protected identity and context SHALL be
referenced and authorized at read time rather than copied into generic task,
notification, search, export, or telemetry text.”

**Proof:** gift for a donor beyond the relationship cap; donor absent altogether;
named donor with anonymous gift; unknown offline identity; a privacy change while
a task/detail is open; lists/counts/search/export/notifications and direct APIs;
late responses after context change. No per-gift exception should be activated
from a legacy fallback without the source owner's qualified contract.

## S4 — Contact projection and mutation do not implement the accepted field boundary

**Material concern: yes. High severity; likely if the current full-form path is
treated as the accepted native contact editor.**

The [donor projection](../../../../../packages/api/src/missionary-portal/donors.ts:363)
includes type/status/score and named donors' notes/address/tags. The
[static field-policy foundation](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:400)
denies missionary visibility for type/status/score/tags/address; it also
[denies notes](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:490).
These are not equivalent outputs. The foundation expressly describes
[tenant overrides as dormant](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:19),
and the [reader](../../../../../packages/api/src/field-policies/reader.ts:68)
loads baseline rows only. It is not correct to claim that tenant field settings
already govern these donor routes.

[The edit schema](../../../../../packages/api/src/missionary-portal/donor.ts:29)
requires a whole-form name/email plus status, frequency, notes, and address fields;
the [payload](../../../../../packages/api/src/missionary-portal/donor.ts:73)
replaces those fields and hardcodes country to USA. The
[write](../../../../../packages/api/src/missionary-portal/donor.ts:174) correctly
scopes donor/tenant/missionary and requires explicit nonanonymous preference, but
has no reached field-policy/capability check, expected revision, or changed-field
patch semantics. Editing a phone number can therefore overwrite unrelated
concurrently changed fields or a non-US country. Shared `donors.notes` is not
evidence of private missionary preparation.

**Required language:** “The already-ratified native contact-edit contract SHALL
be implemented through its exact allowed fields, current actor/tenant/relationship
authority and source ownership. Only deliberately changed allowed fields SHALL
be applied against an expected revision. Empty and absent values SHALL have
distinct supported meanings. Names, missing email, and international addresses
SHALL not be forced into US-only or invented identity values. Shared contact
facts, contact preferences, financial/relationship statuses, and private
preparation SHALL remain distinct. Dormant tenant overrides SHALL not be presented
as active controls.”

**Proof:** re-use D5's field inventory and release gates, not a new contact
architecture. Verify denied fields through API/raw rows/views/RPCs/service-role
paths; private preparation does not overwrite shared notes; stale full form cannot
wipe a new address; donor anonymity changes race safely with save. A native route
does not gain permission merely because no external contact feed is selected.

## S5 — Dashboard figures are not complete, consistently qualified financial measures

**Material concern: yes. High severity; likely with more than the fixed caps,
multiple periods/currencies, or missing authoritative funding values.**

The snapshot uses the [250-gift, 250-donor, 100-task
reads](../../../../../packages/api/src/missionary-portal/service.ts:194) as inputs
to [support totals and counts](../../../../../packages/api/src/missionary-portal/model.ts:357).
`recurringMonthlyCents` is the sum of loaded recurring gifts without a monthly
window. `raisedCents` falls back from `current_funding` to all loaded settled gifts.
Currency is retained on individual gifts but not separated in those sums.
`giftCount` and active donor count are loaded-row counts, with no completeness
envelope. [The dashboard presenter](../../../../../packages/missionary/components/dashboard-view.ts:73)
turns all loaded non-completed tasks into an attention count, rather than proving
the registered source predicate or full count. These values cannot establish
qualified monthly support, committed support, available funds, relationship
value, or first-gift history.

**Required language:** “Each displayed measure SHALL name its source-owned
meaning, scope, period, currency/unit, freshness, and completeness. An incomplete
page SHALL not become a complete total/count or a zero. Monthly actual receipts,
qualified commitments, goals, and financial balances SHALL remain distinct.
Mixed currencies SHALL not be summed without the separately approved conversion
contract. Attention SHALL reflect currently qualified actionable work; a cached
or loaded count SHALL not assert completeness.”

**Proof:** 249/250/251 gifts and donors and 99/100/101 tasks, distributions across
periods, annual/irregular giving, multiple currency scales, missing source facts,
corrections, partial access, zero versus unknown, and incomplete history. Use
owner-provided aggregates or bounded pagination with a truthful completeness
contract; do not add a second money authority or solve truncation with an
unbounded browser download.

## S6 — Mounted metrics have specific unit and period errors

**Material concern: yes. High severity; deterministic for qualifying inputs in
the reviewed code, without a claim of observed production impact.**

The [foundation migration](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:460)
converts donation amounts to BIGINT minor units. The
[metrics route](../../../../../packages/api/src/missionaries/metrics.ts:246)
returns raw amount, donation type, `created_at`, and status over a rolling
13-month interval, with no currency, gift occurrence date, explicit pagination,
or completeness result. The
[hook](../../../../../packages/lib/hooks/use-donation-metrics.ts:254) sums raw
amounts. The mounted [dashboard metric tiles](../../../../../packages/missionary/components/metric-tiles.tsx:100)
format those values directly as dollar amounts. The
[analytics adapter](../../../../../apps/missionary/app/analytics/analytics-data.ts:19)
instead divides the same minor-unit series by 100. Under the committed minor-unit
contract, a raw `10000` cannot correctly mean `$10k` in one view and `$100` in the
other.

There are independent time defects: [month-end bounds](../../../../../packages/lib/hooks/use-donation-metrics.ts:233)
are midnight at the start of the month's final day while the filter uses `<=`,
excluding later gifts that day. Previous-YTD requests January through the same
day of the previous year, but a rolling 13-month input omits the earlier portion
of that interval for much of the year. [A zero comparator](../../../../../packages/lib/hooks/use-donation-metrics.ts:148)
is rendered as 100% growth rather than an undefined percentage. Local month
construction mixed with UTC month keys needs explicit zone qualification.

**Required language:** “Money SHALL retain its authoritative currency and minor-
unit scale through aggregation and use one approved formatting boundary. Periods
SHALL use explicit source occurrence semantics and a named zone with half-open
intervals `[start, nextStart)`. Every comparison SHALL have complete equivalent
source periods; unavailable/incomplete comparators and growth from zero SHALL
be explained instead of invented. Historical backfill SHALL not be counted in
its import month merely because it was recorded then.”

**Proof:** one-unit and large supported exact values, zero/two/three-decimal
currencies if supported by the owning product contract, last-day noon and final
instant, leap day/DST/time-zone boundaries, backdated gifts, prior-YTD needing more
than 13 months, previous zero, and API row truncation. Do not infer the deployment's
PostgREST cap or claim a latency number without measuring it. Reuse the financial
owner's truth and existing formatter; no new ledger is justified.

## S7 — Visible settings are not evidence of durable tenant control

**Material concern: yes. High severity for safety-related Off controls; certain
local-only behavior in the inspected missionary settings component.**

The [missionary settings page](../../../../../apps/missionary/app/settings/page-client.tsx:112)
holds notification choices in component state; Save Preferences only clears
`hasChanges`. Its [test](../../../../../tests/unit/apps/missionary/settings-preferences.test.tsx:20)
explicitly tests a local save, not refresh/relogin persistence or dispatch
enforcement. The same page displays [static integration
states](../../../../../apps/missionary/app/settings/page-client.tsx:242). It cannot
prove tenant disable switches or actual channel availability.

Separately, the [organization settings handler](../../../../../packages/api/src/admin/org-settings.ts:9)
targets a constant demo tenant, supports only post visibility, and its PATCH
returns the requested value after a write without verifying an affected result.
It has an explicit admin role gate, but the target is not derived from the
authenticated tenant. Its user-scoped table access also conflicts with the
[migration revoking tenant-table browser-role
privileges](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:41).
RLS/grants may deny the operation; the static constant is not proof of a
cross-tenant write succeeding. Neither this handler nor the local missionary
matrix is an implementation of Phase 28 tenant policy.

**Required language:** “Each offered tenant control SHALL read and mutate the
active authenticated tenant's persisted policy through its authorized owner
command, enforce supported defaults and current policy at effects, and return a
verified revision/result. Save SHALL not imply persistence before authoritative
success. Turning a feature off SHALL have its ratified effect on new commands,
in-flight work, existing data and safe recovery; changing presentation SHALL not
silently delete history or restore authority. Only genuinely available controls
and verified integrations SHALL be shown as operational.”

**Proof:** two tenants and a dual-member actor switching context, refresh/relogin,
concurrent staff changes, stale tabs, denied and zero-row updates, lost response,
Off while a command is in flight, upgrades preserving off-by-default decisions,
and real dispatch/source enforcement. Preserve existing domain-specific defaults;
one generic default or universal “Off deletes everything” behavior would contradict
the decisions.

## Database and privileged-path review limits and required proof

These are cross-cutting requirements attached to S1–S7, not a proposal to add a
new policy engine or duplicate tables.

| Area checked                          | Current evidence and limitation                                                                                                                                                                                                                                                                                                                                                                                                                                          | Required permanent proof                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trusted identity / privileged access  | [Route helper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:24) obtains an admin client and signed-in missionary role; [operation wrapper](../../../../../packages/api/src/shared/with-operation.ts:137) similarly supplies admin client and trusted auth. Correct scoping therefore depends on every handler. Task ownership is profile-scoped; donor access includes tenant.                                                                     | Tenant, actor, author, owner, approval, audit attribution and completion authority come from trusted context/source. Revalidate current authority in the authoritative transaction, including the existing and resulting linked source. Test reassignment/privacy/disable between precheck and write.                                                    |
| Keys / nullability / relations        | [Legacy tasks](../../../../../supabase/migrations/20250101000000_init_schema.sql:287) have a nullable profile FK, independent donor FK, profile-delete cascade, and no tenant/source-occurrence key in this definition. [Activities](../../../../../supabase/migrations/20250101000000_init_schema.sql:222) have an independent nullable donor link. These are migration inputs under ADR-0183, not proof of canonical shared-task invariants.                           | Canonical owner design must make cross-tenant/cross-subject relations impossible, require provenance and semantic effect uniqueness, define nullable states and deletion/retention consequences, and preserve completed lawful history. Census invalid/orphan legacy data before backfill; do not rename the legacy table and declare migration done.    |
| Grants / RLS / old and resulting rows | [Canonical migration](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:17) enables RLS, removes demo public-read policy, blocks task browser grants, and gives scoped SELECT to donors/donations/activities/pledges. [Pledge policy](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:234) includes missionary-linked read. RLS row filtering does not implement per-field minimization. | Test effective grants plus all permissive/restrictive policies and old/resulting-row predicates for exact roles. Audit raw table, view, RPC, storage, worker, definer/owner and service-role paths. Never infer safety from a UI allowlist, or infer a bug solely from absent literal `WITH CHECK`. No deployed grant graph was inspected here.          |
| Mutation transformation               | Task PATCH scopes existing task owner, then permits changed donor/status/description; donor precheck and update are separate. Contact edit positively scopes tenant/owner/anonymity but replaces a broad payload.                                                                                                                                                                                                                                                        | A permitted row cannot become an impermissible tenant/subject/source/authority state. Protect immutable identity/attribution and apply expected-revision, field and resulting-state validation in the owner command. Server-side uniqueness/receipts, not client sequence alone, own durable effects.                                                    |
| Money precision                       | Foundation stores BIGINT minor units and [nonnegative checks](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:526). UI uses JS Number and dollar assumptions.                                                                                                                                                                                                                                                                                  | Bound exact supported numeric range, preserve currency scale, reject nonfinite/unsafe amounts, and keep financial corrections and append-only source history in their owner. No amount mutation is introduced to “fix” dashboard presentation.                                                                                                           |
| Indexes / bounded reads               | [Donation indexes](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:603) include tenant/gift date and missionary/gift date. These do not prove performance for a `created_at` query. Snapshot caps are explicit; task list [has no application paging envelope](../../../../../packages/api/src/missionary-portal/service.ts:252). Donor-related reads [cap at 2,000 rows](../../../../../packages/api/src/missionary-portal/donors.ts:532).    | Verify actual query plans against production-shaped cardinalities and skew, paging stability, per-tenant work limits, client memory, and truthful partial results. Count/source qualification must occur before page presentation; raising limits cannot establish completeness.                                                                         |
| Durable history / recovery            | Generic complete rewrites completion time; task/activity writes lack the reached durable business-effect receipt. Existing source-owned projection architecture supports [transactional identifier-only intent and reconciliation](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:630).                                                                                                                                                    | Record actor/time/purpose/source revision and stable effect receipt durably; keep technical logs separate and content-minimized. Reconcile pending projection after write-before-response/delivery failure, preserving history. Backfill/restore/mixed-version rollout must not replay contacts, send messages, revive access, or resurrect old writers. |

## Tests read and what they actually establish

- [Auth/ownership unit tests](../../../../../tests/unit/packages/api/missionary-portal/auth-ownership.test.ts:13)
  assert mocked query filters and absence handling. They are useful evidence of
  intended scoping, not RLS/grant, concurrency, or deployed-context proof.
- [Snapshot redaction tests](../../../../../packages/api/tests/unit/missionary-portal-snapshot-redaction.test.ts:282)
  exercise fixtures where the relevant donor rows are present, including empty,
  null, and missing preferences. They do not establish missing-donor/cap-boundary,
  per-gift override, copied-text, or current-permission behavior.
- [Model tests](../../../../../tests/unit/packages/api/missionary-portal/model.test.ts:120)
  explicitly expect loaded recurring gifts to become `recurringMonthlyCents`.
  Passing that expectation would not validate the required financial meaning.
- [Task deletion recovery tests](../../../../../tests/unit/apps/missionary/app/tasks/task-delete-recovery.test.tsx:19)
  use mocked hook operations and test useful failure/focus behavior. Preserve
  that UX work; it does not prove create/complete atomicity or owner commands.
- [Analytics data tests](../../../../../tests/unit/missionary-analytics/analytics-data.test.ts:53)
  verify the adapter intentionally excludes offline gifts. Labels and accepted
  measure definitions must agree; the choice cannot silently stand for all giving.
- [Analytics page](../../../../../apps/missionary/app/analytics/page-client.tsx:97)
  honestly marks unsupported headline metrics Unavailable and distinguishes
  loading/error/empty states. [Dashboard retry](../../../../../packages/missionary/components/dashboard-home.tsx:97)
  is also present. These strengths should be retained; the review does not claim
  that every displayed value is fabricated.

No tests were executed for this document-only assignment. The required proof is
against the eventual reached implementation and actual migrations, including
database-negative, direct-API, concurrency, lost-response, migration, accessible
phone/desktop and poor-network journeys. Historic synthetic models can explain
an invariant but cannot qualify a deployed source or complete a release gate.

## Priority and closure

1. Preserve the distinction between ratified intent, specification completion,
   implemented behavior, and release qualification. Attach S1–S7 to their existing
   decision/owner requirements and downstream tasks; do not declare the source
   conformant from the presence of a UI or a passing mocked test.
2. Before exposing qualified Phase 28 work, resolve S1–S4's owner commands,
   completion/effect identity, current privacy and exact field boundaries. Cut
   over reached legacy writers with retained-data migration proof.
3. Qualify S5–S6's source measures, units, periods, completeness and safe reads;
   keep truthful unavailable states while a measure remains unqualified.
4. Implement S7's real tenant controls and effect-time enforcement using each
   ratified default and lifecycle. Verify entire user journeys, not individual
   toggle renderings.
5. Release only with the owner-specific proofs above. Privacy/authorization,
   money correctness, effect uniqueness, and policy Off semantics are blocking
   correctness conditions, not “monitor after launch” substitutes. Capacity and
   UX budgets require measured workloads and accountable release thresholds; no
   quantitative performance claim is made by this source review.

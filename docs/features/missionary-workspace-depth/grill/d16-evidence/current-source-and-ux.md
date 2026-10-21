# D16 — current source and goal-setting journey evidence

Research date: October 16, 2026 UTC. Research only; no app, API, schema, provider,
hosted-data or formal-specification changes. Founder selected missionary-managed
goals when permitted. The exact staff On/Off/optional and missionary/project
control semantics are being clarified by the parent review. This note does not
turn that wording into compulsory goals, a default-on policy, a subject hierarchy
or a new permission system. Conditional sketches below are recommendations.

## Scope and authority

Inspected missionary dashboard/settings/profile, portal reads and profile API;
legacy GraphQL goal mutation and its mounted route/auth/RPC; relevant forward
migrations and scalar/field-policy definitions; current organization/team
permission UI; shared settings/forms, money parser and representative tests.
Read root and scoped API/database/Supabase/UI/app instructions and repository
Supabase guidance. Existing D5 evidence supplies background, with cited settings,
policy and role sources rechecked. No tests or real-role/database/provider probes
were run. Searches were bounded to these paths, not a complete writer census.

[Q16](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q16-goal-authority-research.md:12)
asks who may establish/change an internal fundraising goal. Its pre-answer
“awaiting” status is superseded by the founder's A answer; subsequent control
clarification remains separate. The [founder brief](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:147)
requires recurring/special-gift goals with currency/period/scope; its
[source boundary](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:153)
keeps Goal Versions distinct from finance Support Plans and public release.
[Retained goal obligations](/workspace/core/docs/prds/program-roadmap/owner-constraints.md:128)
allow explicit adoption of an exact approved Plan, with later comparison rather
than automatic synchronization. Coaching/activity-target participation remains
separately deliberate. Read-only coaches do not become goal writers.

## Actual current behavior

| Surface                    | Exact evidence and current fact                                                                                                                                                                                                                                                                                                                                                                                                                              | Meaning for D16                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Portal source              | [Service select](/workspace/core/packages/api/src/missionary-portal/service.ts:30) reads `missionaries.funding_goal/current_funding`. [Model](/workspace/core/packages/api/src/missionary-portal/model.ts:357) sums loaded recurring gifts, uses stored current funding or loaded gift sum, defaults absent goal to zero and computes percent funded. [Service](/workspace/core/packages/api/src/missionary-portal/service.ts:187) limits gift/donor inputs. | Scalar and capped-read arithmetic are legacy representations, not qualified Goal Versions or a complete dated support comparison. Goal authority must not permit editing received/expected money.                                                                                                                                                                                                |
| Dashboard                  | [Goal card](/workspace/core/packages/missionary/components/dashboard-home.tsx:244) says Monthly Support Goal. [Empty state](/workspace/core/packages/missionary/components/dashboard-home.tsx:310) asks the user to set one but has no setting action. [Formatter](/workspace/core/packages/missionary/components/dashboard-home.tsx:41) divides by 100, adds `$` and abbreviates larger values.                                                             | Existing UI promises an unavailable action and presumes a monthly USD-style representation. Future exact amount, currency and period must remain legible; absent/unknown is not zero or failure.                                                                                                                                                                                                 |
| Missionary settings        | [Save handler](/workspace/core/apps/missionary/app/settings/page-client.tsx:135) only clears local dirty state; [integration cards](/workspace/core/apps/missionary/app/settings/page-client.tsx:247) contain hardcoded status.                                                                                                                                                                                                                              | No D16 policy persistence or goal-setting capability follows from this settings screen. Reuse shared presentation, not its simulated save/readiness behavior.                                                                                                                                                                                                                                    |
| Profile editing            | [Payload](/workspace/core/apps/missionary/app/profile/use-profile-page-view.ts:309) sends names/bio/tagline/location/phone/photos/social links. [Strict schema](/workspace/core/packages/api/src/profile/index.ts:15) excludes goal/funding; [updates](/workspace/core/packages/api/src/profile/index.ts:118) only write profile fields.                                                                                                                     | The current profile editor cannot establish/change a goal through this route. Adding a number field here would need a new qualified source command; broadening the profile PATCH is not enough.                                                                                                                                                                                                  |
| Important alternate writer | [GraphQL input](/workspace/core/packages/graphql/handler.ts:185) includes `fundingGoal: Int`; [resolver](/workspace/core/packages/graphql/handler.ts:707) requires missionary role, forwards the integer as `funding_goal` and calls the audit RPC using trusted auth profile/tenant/actor.                                                                                                                                                                  | A real legacy source-code mutation exists despite the missing editor. It has no inspected D16 subject setting, exact goal source/period/currency, expected version, or current policy fence. Do not claim there are no goal mutations.                                                                                                                                                           |
| Mounted GraphQL path       | [Donor API route](/workspace/core/apps/donor/app/api/graphql/route.ts:1) mounts this handler. [Context](/workspace/core/packages/graphql/handler.ts:882) resolves auth and an admin client. [Middleware](/workspace/core/packages/auth/middleware.ts:177) defaults API pass-through, with [early return](/workspace/core/packages/auth/middleware.ts:198); the resolver supplies its own role gate.                                                          | Its placement in the donor app does not make the missionary mutation unreachable in source. Actual deployment, session cookies and request reachability were not exercised.                                                                                                                                                                                                                      |
| Privileged SQL writer      | [RPC](/workspace/core/supabase/migrations/20260223170000_atomic_rpc_and_donation_saga.sql:686) updates goal by profile/tenant, raises not-found, and inserts audit in one function call. [Grants](/workspace/core/supabase/migrations/20260223170000_atomic_rpc_and_donation_saga.sql:1395) revoke PUBLIC/anon/authenticated execution and grant service_role.                                                                                               | Atomic write/audit and trusted scope are useful. The procedure is a service-only scalar writer, not direct browser permission or a versioned D16 command. Fence/converge this writer before claiming an effective staff control.                                                                                                                                                                 |
| Public projection          | [Projection](/workspace/core/packages/api/src/public-giving/projection.ts:53) maps the same two scalar fields into public goal/raised.                                                                                                                                                                                                                                                                                                                       | Concrete reuse/integration coupling hazard: do not back the new private goal with a field a public projection directly reads. **This is not proof that current public pages update from it.** Bounded production-call search found this helper's exports/tests, while the inspected [worker page](</workspace/core/apps/donor/app/(public)/(solid)/workers/[id]/page.tsx:24>) imports mock data. |
| Read cache                 | [Portal hook](/workspace/core/packages/database/hooks/missionary-portal.ts:100) uses `['missionary','portal']`; [cache reset](/workspace/core/packages/auth/client-session.ts:64) responds to user change/signout, not an explicit same-user policy/subject generation.                                                                                                                                                                                      | New subject control and project context cannot rely on cached role/goal state as write authority. Partition/refresh qualified projections and reject late responses from an old context. No actual stale cross-tenant disclosure was reproduced.                                                                                                                                                 |

The initial quick check covered current UI/profile paths only. The expanded D16
trace above deliberately corrects any broader inference of mutation absence.
The GraphQL mutation updates `funding_goal`, not `current_funding`; no current
funding mutation is inferred from its goal argument.

## Migration and permission facts, with limits

Forward file evidence inspected, in order:

1. [Initial schema](/workspace/core/supabase/migrations/20250101000000_init_schema.sql:44)
   defines numeric goal/current-funding scalars with zero defaults. The
   [foundation conversion](/workspace/core/supabase/migrations/20260214090000_foundation_1_schema.sql:520)
   multiplies them by 100 into BIGINT; [checks](/workspace/core/supabase/migrations/20260214090000_foundation_1_schema.sql:550)
   require nonnegative values. These do not encode currency, period, goal kind,
   subject, financial coverage, required/optional state or version provenance.
2. [Demo read-only migration](/workspace/core/supabase/migrations/20260216153000_demo_readonly_rls.sql:14)
   includes missionaries, enables RLS, replaces existing policies and at line 59
   revokes browser privileges then grants SELECT. Do not infer direct browser
   UPDATE permission from the collection schema or older policies.
3. The later RPC grants above admit only service_role. Bounded searches found
   this goal function definition/grant and GraphQL caller, not a later function
   replacement that adds D16 permission.
4. [June collection migration](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:81)
   grants missionary SELECT to anon/authenticated. Its
   [policy loop](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:125)
   gives missionaries the fallback `true` SELECT predicate; it does not grant
   UPDATE. Thus storing new private Goal Version facts on that legacy row would
   need a full reached-reader review, not just API controls.
5. [October field-policy foundation](/workspace/core/supabase/migrations/20261005050728_field_policy_foundation.sql:19)
   expressly leaves tenant overrides dormant. The
   [goal/current-funding rows](/workspace/core/supabase/migrations/20261005050728_field_policy_foundation.sql:760)
   allow missionary visibility but deny editing/public visibility as static
   ceilings. These are not automatic column privileges or universal enforcement.
   [Reader](/workspace/core/packages/api/src/field-policies/reader.ts:28) ignores
   tenant override input, describes itself as a ceiling and loads only global
   rows. The inspected legacy goal resolver does not call it.

These are migration-file semantics, not an introspected deployed catalog. No
hosted grants/RLS, Data API exposed-schema configuration, RPC execution or full
migration replay was queried. Rollback files were not treated as forward
authority. No finding relies on the incorrect generalization that omission of
an explicit UPDATE WITH CHECK always creates an unconstrained new-row check.

The [organization settings route](/workspace/core/packages/api/src/admin/org-settings.ts:9)
targets a fixed tenant and only post visibility; its PATCH checks SQL error but
not an affected-row result. [Role compatibility](/workspace/core/packages/auth/permissions.ts:40)
gives all staff subroles broad baseline capabilities; its admin/missionary role
checks retain legacy fallbacks. Neither defines the authorized D16 policy
manager. Use P12/P3's current qualified actor/subject authority, not a new
`can_edit_goal` JSON shortcut or the word “admin.”

The [team permissions screen](</workspace/core/apps/admin/app/(app)/admin/teams/teams-sections.tsx:166>)
has useful labelled grouping, but its inspected Select at line 203 has a
`defaultValue` and no change/persistence callback. It is not evidence of a working
per-subject goal control. Broad “None/View/Manage/Admin” module levels should not
be copied to express a single narrow fundraising capability.

## Material concerns and candidate safeguards

| Concern                                                                           | Severity / conditional likelihood                         | Required direction                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Old GraphQL/RPC still writes despite staff Off or revoked authority               | High / likely if only a new UI/API is gated               | Converge every reached writer on the P28 command and current source/subject permission at acceptance; preserve trusted tenant/actor, exact result and audit. Service-role execution is not user authority. |
| Private goal leaks or silently alters public/finance meaning through scalar reuse | High / plausible if old missionary row is reused          | Separate exact Goal Versions from Plan, giving, compensation, publication and legacy scalars. Inventory generic SELECT/GraphQL/REST/export/cache readers; a UI read-only flag is not privacy.              |
| Zero/unset/Off/staff-managed collapse into one misleading state                   | High / likely with current defaults                       | Keep availability, editing rights, existence, currentness and actual zero distinct. Await clarified optional/On/Off meaning; no compulsory goal or automatic erase/zero on Off.                            |
| Wrong missionary/project or inherited setting silently affects other subjects     | High / plausible with profile-only keys or a broad toggle | Identify the canonical subject and current authority on control, save and result. No household/team/project propagation or precedence rule is inferred from display membership.                            |
| Goal overwritten while another editor or staff control changes                    | High / plausible without version/fence                    | Atomic source revision plus policy acceptance ordering; stale change is a conflict. Retry/recover the same operation; no last-write-wins or fresh replay after a newer goal.                               |
| Amount/period comparison falsely shows progress                                   | High / likely if current formatter/model is reused        | Exact permitted currency/precision and compatible period/scope; source-certified support totals. No silent conversion, monthly label on a special-gift total, or missing-as-zero percentage.               |
| Settings appears saved but is local/unpersisted or unauthorized                   | High / plausible if current settings examples are copied  | Render persisted effective value separately from pending input, verify one source acceptance and show durable failure/recovery. Never infer save from a changed switch.                                    |
| Complicated access builder or approval ceremony obstructs a simple goal edit      | Medium / likely if broad team UI is copied                | One qualified subject control and one goal editor. Add only fields needed to express the selected goal; do not add a new inbox, per-change approval queue or mandatory coaching enrollment.                |

## Shared UI and money patterns worth reusing

[SettingsCard](/workspace/core/packages/ui/components/settings/settings-card.tsx:14)
provides shared title/description/body/footer composition; [Switch](/workspace/core/packages/ui/components/shadcn/switch.tsx:9)
is Base UI with shared semantic tokens. Use a switch only for a genuinely binary
immediate state; a three-way policy needs a clearly labelled choice control, not
a tristate switch. Which of those is correct awaits the clarified semantics.

The [contribution amount control](</workspace/core/apps/admin/app/(app)/contributions/operation-shell.tsx:501>)
keeps an amount string, displays currency in a visible label, uses decimal input
mode and wires errors through `aria-describedby`/`aria-invalid`. Reuse that
interaction pattern, not its refund-specific business meaning. The
[currency filter](/workspace/core/packages/ui/components/shadcn/data-table/filters/filter-value-inputs.tsx:113)
defaults USD and a 0.01 step; the [offline-gift form](</workspace/core/apps/admin/app/(app)/contributions/offline-gift/offline-gift-entry-dialog.tsx:520>)
labels USD explicitly. Neither is a generic multi-currency goal contract.

[Canonical money parsing](/workspace/core/packages/api/src/money/index.ts:33)
uses currency exponents, decimal-string parsing and safe-integer validation
without silent rounding. [Formatting](/workspace/core/packages/api/src/money/index.ts:56)
requires explicit currency and locale. Its parser expects plain decimal input;
a localized UI must deliberately reconcile decimal/grouping conventions or
explain accepted input, not ambiguously reinterpret `1,234` or strip separators.
Goal-specific positivity/limits and currency eligibility remain source rules;
the generic money helper does not decide them. Preserve zero-decimal and
three-decimal currencies and exact values, not only USD examples.

## Smallest complete proposed journey

### Staff subject control — conditional on clarified semantics

Place one compact control on the existing qualified missionary/project detail
or permission surface, with the subject name and organization visible. Do not
make staff configure every member, underlying record or application separately.
The control's label must describe the actual effect: for editing authority,
“Allow missionary goal setting” is clearer than “Goals: On.” If the choice
instead controls whether fundraising goals are used, label that separate meaning
plainly; an editing switch must not imply the feature is hidden or a goal is
required. No inheritance/default/required state is selected by this sketch.

```text
Maya — [organization] / [exact qualified subject]
Fundraising goals
[the single clarified subject control]
[short sentence describing who can set goals and what changes]
Saved state / Unsaved change / Saving… / Couldn't save
                                        [Save]
```

An authorized staff member changes the one policy and saves; ordinary save needs
no repeated confirmation. Show the accepted effective value after success.
Loss of authority, a conflicting policy change or unknown save result leaves a
truthful recoverable state; no optimistic “Off” that masks a still-active grant.
The server rechecks current authority regardless of which controls are visible.

### Missionary: unset → set → view → edit

Use the goal card already in the workspace and one concise editor. When allowed
and unset, show “No fundraising goal set” and **Set goal**. If goal use is
optional, leave normal support work available without a goal; do not produce a
red warning, fake zero or required onboarding task. If read permitted but edit
denied, show the actual goal with “Managed by your organization.” If no goal
exists and editing is staff-managed, say “No goal has been set.” Do not suggest
that a hidden goal exists when read permission is absent.

```text
Set fundraising goal
For: Maya — [exact qualified subject]
Goal: [qualified recurring / special-gift purpose, if needed]
Amount (USD) [          ]
[necessary period/cadence and dates, showing known context]
This is your internal fundraising goal.
                               [Cancel] [Save goal]
```

USD is an example, not a default. Prefill only trustworthy contextual values;
show them visibly and allow source-permitted correction. Do not require users
to choose technical owner IDs or reselect an already established subject.
Distinguish a monthly recurring target from a total special-gift goal. Exact
period/cadence/date requirements come from the qualified goal kind, not a giant
universal form. Explicit adoption from an approved Plan can be a contextual
shortcut when available; absence of that optional shortcut must not make an
independently permitted goal impossible. Never live-link the Plan amount.

After success show exact amount, currency, meaningful timeframe and permitted
attribution/currentness; **Edit goal** returns to the same focused form. Existing
public/coach/finance projections retain their own source bindings and audience.
A simple “Goal saved” is sufficient; avoid an extra review wizard unless a
specific consequential source change actually requires review.

### Off, conflicts and recovery

- **Edit permission removed:** preserve the existing accepted goal/history and
  read it where still permitted; hide editing and explain staff management.
  Refuse an already-open editor's Save after the authoritative revocation point.
  Preserve unsaved input only while its current read/custody authority allows.
- **Goal feature no longer used, if this is what Off means:** do not assume it
  deletes history, turns amount into zero, withdraws public release or revokes an
  independent coach/finance grant. The clarified source outcome must determine
  current display and reactivation. Do not conflate this with editing Off.
- **Concurrent goal change:** “This goal changed while you were editing.” Show
  authorized current and unsaved values compactly, with **Review changes** and
  **Keep current goal**. A subsequent deliberate save binds the newly reviewed
  revision. Do not overwrite or ask the user to reload and lose their input.
- **Validation:** identify the exact field in text and preserve every valid
  value. Example: “JPY amounts cannot include decimal fractions,” only when that
  currency rule is actually applicable. Never silently round the target.
- **Uncertain save:** “We couldn't confirm whether your goal was saved.” Resolve
  the original operation and current source outcome before treating retry as a
  new goal version. A saved goal with failed refresh is not “save failed.”
- **Unavailable source or denied read:** use “Goal unavailable” with an actually
  useful retry where appropriate. Do not show cached sensitive amount, fabricate
  no-goal or replace unknown progress with zero.

On mobile use stacked fields, visible currency/period, accessible labels and a
footer that remains reachable with the keyboard open. Preserve focus and input
after errors; do not use a toast as the only saved/conflict/error evidence. A
switch requires an associated visible label and adequate touch area. Keyboard,
screen-reader, zoom/reflow and slow-network behavior remain qualification work,
not evidence supplied by component choice.

## Primary UX references and meaningful proof

Opened October 16, 2026:

- [MPDX Preferences](https://help.mpdx.org/article/454-preferences-settings),
  updated September 22, 2022, describes a simple monthly amount edit/save while
  saying the organization should set the amount. Useful distinction between
  authority and entry mechanics; its MPD-info development caveat prevents using
  it as proof of accurate goal/commitment reporting or current role enforcement.
- [GOV.UK Text input](https://design-system.service.gov.uk/components/text-input/)
  recommends visible concise labels and warns against placeholders as labels.
  Learn the form pattern without importing its visual system or one-question-
  per-page layout into this small Core editor.
- [W3C error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
  requires detected errors to identify the affected item and describe the error
  in text. Generic redisplay or color alone is inadequate. No compliance claim
  follows without exercising the complete implemented journey.

Smallest meaningful future checks, **not run**:

1. Actual authorized/denied staff and missionary roles across two tenants and
   two canonical subjects; selected control states plus missing/unavailable
   policy. API, GraphQL, direct Data API and privileged paths agree.
2. Save a permitted new goal, edit it and recover a lost response without a
   duplicate version/audit; no-op does not fabricate a change or interaction.
3. Two editors, staff-control change and role/subject reassignment race both ways:
   one valid acceptance order, explicit stale conflict, no later authority bypass.
4. Unset, zero where source-valid, read-only, Off, expired period and unavailable
   source remain distinct. Goal choice creates no compulsory activity/coaching.
5. Exact currency/period fixtures including JPY and KWD; unsafe range, ambiguous
   localized entry and incompatible expected/received support fail honestly.
6. Private goal edit leaves public release, finance Plan, commitments/payments and
   independently bound historical coaching projections unchanged unless their
   owner explicitly accepts a new effect.
7. Every reached list/detail/count/export/cache/GraphQL/browser read enforces the
   goal's actual audience. Same-user tenant/subject change rejects late data;
   historical raw rows cannot become a new grant by migration or restore.
8. Phone/keyboard/screen-reader path completes control → set → edit → conflict
   → saved/read-only without data loss, ambiguous controls or hidden currency.

Existing [money tests](/workspace/core/tests/unit/packages/api/money-foundation.test.ts:13)
cover multiple exponents, invalid precision and safe-integer limits; the
[migration test](/workspace/core/tests/unit/donation-saga-migrations.test.ts:43)
checks service-only RPC grant text. Inspected, not executed here. Neither proves
the new goal authority, runtime policy matrix or complete UX. D16 still needs an
actual source/role/API/database/retained-data census and implemented journey
qualification; this research does not assert deployed exposure or readiness.

## Subsequent review synthesis

After the initial review, the founder explicitly clarified: **editing permission
only; staff allow or disable missionary editing, and setting a goal remains
optional**. This supersedes this note's earlier pending-clarification language.
The [completed D16 review](../phase28-d16-goal-management-adversarial-review.md)
records that confirmed meaning. Its recommended Staff-managed / Missionary-managed
labels, organization-default inheritance and remaining amendments are not fully
ratified by this clarification. No Required/Optional/Not-used goal usage is added.
The main review reconciles individual View only versus Staff-managed,
one canonical goal-policy scope across aliases, applicable Legal Entity,
conditional ending and all-path restore fencing. Earlier conditional exploration
in this evidence note is preserved as research, not competing final design.

Actual probe claims retain their exact limits: permission re-enable is not a
backup restore test; no-op and a separately read-authorized receipt endpoint
were not executed. The completed review's C01–C20/P01–P24 govern the proposed
future proof, not a claim that those features are implemented.

## Subsequent ratification

On October 16, 2026 UTC the founder explicitly ratified the corrected D16 decision
and required amendments, including C01–C20 and P01–P24 as future acceptance
obligations. The [main D16 review](../phase28-d16-goal-management-adversarial-review.md)
is the reconciled decision; conditional alternatives and recommendation labels
above describe research before ratification, not competing current decisions.
The earlier clarification alone was narrower; the subsequent ratification accepts
the full corrected amendment package. This changes intended-behavior status only.
Executed probes, source snapshots and all runtime/qualification limits remain
unchanged. No full application, live database or production claim follows.

# D22 — Organization amount rule: current source and settings evidence

Research only, 17 October 2026 UTC. The founder selected the optional
organization-set amount rule and asked for full customization without complexity.
This note distinguishes that selected capability from current implementation and
from candidate safeguards. It does not invent a threshold value, a financial
amount basis, permission key, donor classification or general rules language.
The [Q22 scenario](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q22-amount-based-gift-follow-up-research.md:7)
describes a fixed amount rule, independently of D21's excluded comparison with
the supporter's previous giving. Its awaiting-answer wording is superseded by
the current answer.

## Scope and limits

Fresh bounded inspection covered the organization settings API and mounted
route, tenant schema/type, settings and permission examples, shared auth context,
field-policy reader, shared monetary parser/metadata/settlement resolver, relevant
migrations and task request boundary. Searches covered `packages/api/src`,
`packages/auth`, `packages/database`, `packages/graphql`, `packages/ui`, admin and
missionary UI, current OpenSpec and selected active changes. Search terms included
tenant/org settings, permission/PDP, threshold/large gift/amount rule, money parser,
currency and generated/source flags. No qualified native amount-rule settings
store or producer was found in these inspected paths. This is not an assertion
about every branch, hosted function, deployment or external integration.

Read root and applicable admin/API/auth/database/UI/Supabase instructions; reused
the repository Supabase skill and read the scoped auth skill. This is static
research, not Next.js/auth implementation. No app/schema/dependency/formal-owner
edit, hosted query, provider action or test execution occurred. D19/D20 source
admission and task-coverage evidence, and [D21's current trace](/workspace/core/docs/features/missionary-workspace-depth/grill/d21-evidence/current-source-and-ux.md:16),
are explicitly reused rather than repeated as fresh end-to-end qualification.

## Current source: reusable parts and unsafe shortcuts

### S1 — Existing organization settings are a narrow legacy route, not this policy store

The mounted [route export](/workspace/core/apps/admin/app/api/admin/org-settings/route.ts:1)
reaches [org-settings.ts](/workspace/core/packages/api/src/admin/org-settings.ts:9).
GET validates a user, then reads only `org_post_visibility` from a constant
`DEFAULT_TENANT_ID`; it defaults the returned visibility to all_donors. PATCH
[checks admin/super_admin](/workspace/core/packages/api/src/admin/org-settings.ts:48),
reads `body.orgPostVisibility`, checks two allowed values, updates that same
constant tenant, and echoes the requested value when no database error appears.
It does not derive the target from `auth.tenantId`, reject unrelated JSON keys,
check an expected policy revision, select an affected row, or return a persisted
revision/receipt. A zero-row result with no error is not distinguished from an
accepted update. This is not a finding that it currently changes another tenant:
the query uses a session client and actual effective grants were not tested.

The [initial tenant table](/workspace/core/supabase/migrations/20250101000000_init_schema.sql:13)
has `org_settings JSONB DEFAULT '{}'`; the current [Tenant interface](/workspace/core/packages/database/types/database.ts:90)
exposes it as `Record<string, unknown>`. This is storage shape, not a registered
allowlist, schema version, concurrency contract or qualified setting. No reached
amount-rule reader/writer of that JSON was located. Arbitrary key/value access
would not acquire authority simply by residing in `org_settings`.

The later [June migration](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:17)
enables RLS on tenants, removes the public-read policy and at line 43 revokes all
tenant table privileges from anon/authenticated because rows contain secrets.
If that grant state is effective, the session client's tenant table operation is
denied regardless of a UI admin check. This is migration-file evidence, not a
live catalog result. Do not repair reuse by granting generic tenant-row access
or returning secret-bearing tenant JSON to the browser.

**Reuse:** thin route export, server-side validation and normal error responses.
**Must qualify:** exact tenant policy owner/command, narrow safe projection,
current capability, strict allowed field set, persistence result and concurrency.
Do not extend this legacy route by adding an untyped threshold property.

### S2 — Current auth is useful context, not proof of the entire target PDP

[getAuthContext](/workspace/core/packages/auth/context.ts:260) reads the caller's
profile through the validated request client, derives its tenant and loads
membership through the caller-bound `current_user_memberships` RPC. It filters
rows to that tenant, active status and admitted membership roles; membership
read errors fail closed. [requireRole](/workspace/core/packages/auth/context.ts:355)
is an actual server guard. These are valuable existing boundaries.

However the [compatibility capability map](/workspace/core/packages/auth/permissions.ts:12)
defines four broad staff capabilities, with the same baseline for every staff
subrole; [admin checks](/workspace/core/packages/auth/permissions.ts:61) include
staff membership and profile-role fallbacks. This is not a dedicated amount-rule
manage capability or the full Active Tenant Assignment/PDP target. The actual
[operation wrapper](/workspace/core/packages/api/src/shared/with-operation.ts:137)
resolves auth and gives the handler an admin client; service-role availability
does not prove authorization for a new policy or source operation.

The [Eve model-policy permission example](/workspace/core/packages/api/src/eve/model-policy/permissions.ts:9)
separates general admin access from `ai.settings.manage`; its
[grant lookup](/workspace/core/packages/api/src/eve/model-policy/store.ts:139)
binds tenant/profile/exact key/active state. Its
[strict mutation schema](/workspace/core/packages/api/src/eve/model-policy/schema.ts:91)
requires an expected active policy for activation and the
[route response](/workspace/core/packages/api/src/eve/model-policy/route.ts:86)
reloads the policy view after mutation. These are bounded design precedents,
not permission to reuse the AI grant, platform scope, model evaluator, default
limits or approval lifecycle for gift follow-up. The inspected schema alone is
not proof that a new D22 command would have atomic CAS.

**Reuse:** current trusted request identity, deny/error conventions, narrow
permission checks and strict request-shape conventions. **Must qualify:** the
owner-registered exact D22 actions and context. Settings management must not grant
financial-source read, missionary contact, task completion or sending authority.

### S3 — Field policy is a static ceiling with dormant overrides

The [field-policy reader](/workspace/core/packages/api/src/field-policies/reader.ts:25)
explicitly ignores tenant override input and describes itself as a static ceiling,
never actor authority. It loads global rows only; absent/unclassified/dotted keys
are denied. The [migration](/workspace/core/supabase/migrations/20261005050728_field_policy_foundation.sql:19)
likewise keeps tenant overrides dormant and limits writes to super-admin policy.
Adding a JSON key or a field-policy row cannot enable a tenant setting manager,
choose financial meaning, activate a native producer or bypass a denied source.

The selected amount rule is operational configuration. It must not silently alter
data projection rights. Existing policy-widening approval rules apply if rights
are actually widened; ordinary permitted threshold changes need not be turned
into a new two-person approval ceremony merely because they change task volume.

### S4 — Shared money parsing is suitable; currency/source admission remains separate

The [shared money parser](/workspace/core/packages/api/src/money/index.ts:26)
accepts plain decimal strings, uses BigInt to construct exact currency minor
units, rejects nonfinite numbers and excess nonzero precision, and requires a
safe integer result. It uses [currency metadata](/workspace/core/packages/api/src/money/metadata.ts:1)
with exponents 0/2/3/4; metadata explicitly represents money and does not qualify
a payment route. [formatMoney](/workspace/core/packages/api/src/money/index.ts:56)
requires an explicit locale and retains exact units during formatting.

The parser accepts signed amounts and zero because it serves broader money
domains. D22 needs its own documented threshold constraints; using the parser
alone would allow an unintended negative/zero rule. Candidate recommendation:
positive exact minor units within the validated source/representation range,
with no arbitrary product cap inferred from this note. Ordinary formatted input
and locale normalization must be specified; the parser's plain-decimal grammar
does not itself accept grouping separators or decimal commas. Keep original
user text for validation feedback; never silently reinterpret `1,000` or round.

The [settlement resolver](/workspace/core/packages/api/src/money/settlement.ts:5)
is expressly a legacy USD-only donate compatibility lane. It verifies a tenant
exists, then returns USD; it is not an organization reporting currency or a
multicurrency support-policy registry. The
[currency foundation migration](/workspace/core/supabase/migrations/20261003051630_currency_foundation.sql:182)
provides read-only metadata, not D22 configuration admission. A valid ISO code
alone cannot show that the relevant source amount is available/qualified.

The shared [FilterCurrencyInput](/workspace/core/packages/ui/components/shadcn/data-table/filters/filter-value-inputs.tsx:113)
defaults missing currency to USD and uses numeric conversion/step 0.01. It is a
filter UI, not a canonical settings money editor. Reuse shared Field/Input/Select
primitives, but not that two-decimal default or generic range-filter semantics.
Threshold comparisons require one exact eligible currency and the approved
received-allocation basis; provider charge units, headline totals and implicit
FX are not substitutes. No payment-route expansion is selected by D22.

### S5 — Current UI includes local or close-only Save controls

The missionary [notification settings](/workspace/core/apps/missionary/app/settings/page-client.tsx:112)
store local state; [Save Preferences](/workspace/core/apps/missionary/app/settings/page-client.tsx:135)
only clears the dirty flag. The staff team
[permission selector](</workspace/core/apps/admin/app/(app)/admin/teams/teams-sections.tsx:203>)
has a default value without a persistence callback, and its
[Save Changes](</workspace/core/apps/admin/app/(app)/admin/teams/teams-sections.tsx:413>)
closes the panel. These do not establish saved policy or capability changes.
Do not copy their completion behavior for D22.

The shared [SettingsCard](/workspace/core/packages/ui/components/settings/settings-card.tsx:14)
offers title/description/content/footer composition in the existing design system.
It is a useful layout primitive, not an authorization, mutation or dirty-state
engine. Show the last accepted effective policy separately from unsaved inputs;
Off, unavailable, no permission and not configured are different states.

### S6 — Manual task fields and legacy donor values remain nonauthoritative

The [task creation schema](/workspace/core/packages/api/src/missionary-portal/tasks.ts:30)
strictly admits ordinary title/type/status/priority/due/donor/sort fields. The
[server writer](/workspace/core/packages/api/src/missionary-portal/tasks.ts:67)
uses current auth identity, checks donor access and forces generated false. This
is not an amount-rule producer. The direct-browser writer, generic status API and
lack of qualified source-purpose/coverage contracts are explicitly reused from
[D20](/workspace/core/docs/features/missionary-workspace-depth/grill/d20-evidence/current-source-and-ux.md:17)
and [D21 S5](/workspace/core/docs/features/missionary-workspace-depth/grill/d21-evidence/current-source-and-ux.md:186).

[D21 S1/S2](/workspace/core/docs/features/missionary-workspace-depth/grill/d21-evidence/current-source-and-ux.md:73)
traces editable donor status, returned score and placeholder score 70. A visible
label, task priority, generic generated flag, amount in a note, staff-entered
status or successful manual task save must not certify D22 qualification. Source
reason/evidence belongs to the authoritative admission command, not arbitrary
client metadata. Existing task work, reviewed sets, purpose identity and receipts
remain with D19/D20/P9; D22 needs no second task engine.

## Governing OpenSpec: target and present implementation are distinct

The [OpenSpec index](/workspace/core/openspec/project.md:6) distinguishes accepted
intent from current code and states that an active change does not prove delivery.
The following were freshly inspected; this is not an exhaustive OpenSpec census.

| Source                                                                                                                                                                                                                             | Precise consequence                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Durable identity/access](/workspace/core/openspec/specs/identity-and-access/spec.md:14)                                                                                                                                           | Identity/tenant/role come from a validated server context; application authorization plus RLS, and sensitive capability checks, are required. UI role hiding is insufficient.                                                                                                             |
| [Active parity single-context target](/workspace/core/openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:3)                                                                                                     | One current Active Tenant Assignment for member work, appropriate NHI/operator variants, subtract-only floors and deferred re-resolution. Line 11 explicitly says the target does not prove all foundations implemented. Do not invent a new D22 role engine or aggregate unrelated hats. |
| [Active parity projection boundary](/workspace/core/openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:41)                                                                                                      | Exact tenant/entity/field/relationship/source floors; code-authoritative early registry, read-only inspection UI and deferred configurable grant product. Field-policy storage cannot activate dormant authority.                                                                         |
| [Active parity projection widening](/workspace/core/openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:144)                                                                                                     | Actual projection widening has separate distinct-human approval. Changing a threshold under an unchanged qualified projection is not automatically such widening.                                                                                                                         |
| [Request-context active amendment](/workspace/core/openspec/changes/fix-request-scoped-auth-context/specs/identity-and-access/spec.md:34) and [tasks](/workspace/core/openspec/changes/fix-request-scoped-auth-context/tasks.md:9) | Caller-bound auth, errors fail closed; source code reflects the narrowed request path. The task file still leaves human review/merge unchecked; do not claim external merge or hosted installation.                                                                                       |
| [P27 active authority amendment](/workspace/core/openspec/changes/add-donor-development/specs/identity-and-access/spec.md:5)                                                                                                       | Ordinary edit/reviewer power grants no financial authority; current source/recipient checks apply at execution/recovery. Routine qualified writes need no invented supervisory approval.                                                                                                  |
| [P12 downstream ownership examples](/workspace/core/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:62)                                                                                                | P12 owns registry/context/epochs/scope; each source owner owns command preconditions. A tenant setting, role name or prior green result never replaces current permission. Adjacent currency/suggested-amount keys are not D22's permission.                                              |

## Smallest complete settings journey — candidate, not implemented

The user's customization requirement should be expressed through direct controls
for the approved policy dimensions, not arbitrary source fields, donor scoring,
scripts, history conditions or a generic workflow builder. Exact financial basis,
comparison boundary and effective-time behavior must be named by the main owner
synthesis before implementation. This note does not settle them silently.

1. **Open Organization → Gift follow-up.** Show the organization and accepted
   state. A read-only user sees the effective rule if permitted and a short
   explanation of who can manage it; do not display a disabled editor as proof
   that every staff member has source/financial access.
2. **Enable and choose the amount.** One clearly labelled optional control plus
   an exact amount and relevant currency. Currency rows are justified only when
   the owner-qualified policy needs more than one; no giant table by default.
   Do not preselect a monetary threshold or infer a currency from locale.
3. **Review in place.** A plain sentence states the exact comparator, currency,
   approved allocation basis and prospective effect. Conditional example, if the
   main contract selects inclusive comparison: **Create personal follow-up when
   an eligible received amount for the ministry is at least [amount] [currency].**
   Explain that this is an organization amount rule, not extra support or donor
   generosity. A small below/equal/above illustration uses synthetic amounts and
   no real donor access; it is not a production impact estimate.
4. **Save once.** Save is pending until source acceptance. Return the accepted
   effective policy/revision and clear dirty state only for that accepted edit.
   No separate confirmation ceremony is needed when scope/effect are visible.
   A changed setting in another tab gives **This setting changed. Review the
   latest rule before saving.** Keep the user's input available for comparison.
5. **Change or turn off.** Show what applies to future qualification and what
   happens to existing pending work under the chosen lifecycle contract. Do not
   promise already accepted tasks disappear or historical gifts are reprocessed.
   Off does not disable first-support, above-commitment or manual follow-up.
   Preserve completed task history and the evidence behind accepted work.
6. **Recover honestly.** Failed fetch is **We couldn't load this rule**, not Off.
   Failed save retains inputs and the previous effective rule. An uncertain save
   says **We couldn't confirm the change** while recovering the same command;
   a fresh resubmission must not silently activate against a newer policy. If
   authority is removed, preserve only permitted unsaved UI content and deny the
   command/current protected result.
7. **Missionary receives ordinary work.** An amount-qualified task says why it
   exists in factual language, with currently permitted gift references. Editing
   the policy must not generate a second task for the same intended source-purpose
   effect. Rule revision is evidence, not automatically a new deduplication key.

Use existing base-maia SettingsCard, shared labelled fields, Switch/Select/Button
and error/status patterns. Render currency code as well as any ambiguous symbol;
associate validation with the amount field and preserve keyboard focus. Support
phone/zoom/reflow and screen readers without chart hover, draggable conditions or
an offscreen Save. A no-op save needs no new policy activation or task events.
An “estimate affected gifts” feature would require separate current financial
authority and complete bounded evidence; omit a fake count or scan button.

## Eight concern dimensions and exact candidate clauses

Conditional severities concern implementation/reuse; no measured production
incident or feature activation is claimed.

| ID / dimension                         | Material concern; severity and likelihood condition                                                                                | Exact candidate requirement                                                                                                                                                                                                                                                                                                                                                                              | Proofs        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| S22-C1 — Product meaning/customization | High; likely if a configurable amount becomes a generosity classifier, history rule or gate on other native work. S6/Q22.          | The optional native amount policy SHALL be independently enabled and configured through its closed owner-defined dimensions. Its reason SHALL describe the amount rule without asserting extra support, donor intent or rating. Other qualified native and ordinary manual purposes SHALL remain independent.                                                                                            | P1–P3.        |
| S22-C2 — Data/money integrity          | High; likely with untyped scalar, USD fallback, float conversion, wrong allocation or missing source. S4.                          | Persist exact positive threshold minor units with admitted currency, comparison semantics, approved source basis and policy revision. Validate representation and source admission separately; reject excess precision, unsafe range and unknown fields. No implicit FX, fee/header substitution, null-to-zero or placeholder value SHALL qualify a gift.                                                | P4–P6.        |
| S22-C3 — Tenant/security/permissions   | High; conditional on fixed tenant, broad admin, dormant field override or privileged writer reuse. S1–S3.                          | Policy read/change/enable/disable and source admission SHALL use the current server-validated context and exact owner-registered capability/scope. Tenant/entity/field/purpose and RLS floors SHALL hold independently. Settings management SHALL grant no source/financial/task/contact/send rights. No client key/value/actor/scope may manufacture authority.                                         | P7–P8.        |
| S22-C4 — Lifecycle/concurrency         | High; plausible with concurrent policy edits, delayed events and corrections. Reused D20/S1.                                       | Policy changes SHALL have a defined acceptance order, effective boundary and immutable version/result. Exact source occurrence eligibility SHALL resolve under that contract, including current permissions and source corrections. Retrying a change or incrementing policy revision SHALL not create a new source-purpose effect or reinterpret completed history.                                     | P9–P11.       |
| S22-C5 — UX/accessibility              | Medium/high; likely if local/close-only Save is copied or customization becomes a rule builder. S5.                                | The editor SHALL expose the accepted effective rule separately from unsaved input and distinguish Off, unconfigured, unavailable, read-only, pending, saved and conflict. Explain exact currency/basis/comparison/effect in place, support direct keyboard/phone flow, preserve failed input and never show a fake count or durable-success claim.                                                       | P12–P13.      |
| S22-C6 — Architecture/debt/migration   | High; likely if generic JSON/task flags or duplicated native/workflow engines become authority. S1/S6.                             | Extend the existing source/P9/P12 contracts with a typed allowlisted setting and authoritative admission command. Old browser/API/import/background writers SHALL be fenced from forging or overwriting source qualification and coverage. Legacy JSON, scores, labels and imported task status SHALL not establish enablement or historical handling.                                                   | P2, P8, P11.  |
| S22-C7 — Performance/boundedness       | Medium/high; plausible if every edit scans history or previews expose protected data. S4/reused D21.                               | Setting change SHALL not silently replay historical gifts or scan full donor histories. Use bounded indexed exact-currency/subject rule resolution and qualified source events; any real impact estimate requires separately authorized complete evidence. Never silently truncate work or bypass correctness for queue volume.                                                                          | P6, P10, P14. |
| S22-C8 — Recovery/audit/proof          | High; plausible with zero-row echo success, lost responses or settings/task writes split without durable intent. S1/S5/reused D20. | Persist the accepted policy command result/audit with its owner transition, recover exact retry under current disclosure, and retain source qualification/rule revision separately from task materialization. Observe unavailable qualification, denied policy change and repair backlog without donor details. Activation requires actual source/auth/migration/concurrency evidence, not mock success. | P9–P14.       |

## Falsifiable proof outcomes proposed, not executed

1. With this optional rule unconfigured/Off, amount alone admits no work; required
   first/special/above-commitment and ordinary manual work still function.
2. A qualifying ordinary large installment may produce an amount-rule task
   without asserting extra support or changing fulfillment; history comparison,
   legacy donor score/status and an arbitrary source flag do not qualify it.
3. More than one qualified reason for the same compatible intended effect does
   not duplicate D20 work or consume a distinct first-support purpose silently.
4. Just-below, exact-equality and just-above amounts obey the displayed comparator
   for admitted 0/2/3/4-decimal currencies with exact integer units.
5. Negative/zero, nonfinite, exponent notation, excessive precision, ambiguous
   localized separators, unsupported currency and unsafe magnitude are rejected
   or explicitly normalized under a documented rule, never silently rounded.
6. A split gift, fee cover, refunded/corrected amount, missing basis or another
   currency cannot qualify by a header total, converted headline or unavailable
   source. Configuring currency does not enable giving or payment processing.
7. Two tenants and multiple hats/assignments prove settings-manager versus source
   reader/task actor separation; current revocation/owner loss denies commands
   and protected recovery without undoing lawful prior accepted results.
8. Extra/unknown JSON keys, forged actor/tenant/capability/effective time/generated
   flags, direct table/RPC access and old writers cannot change the policy or
   certify a native amount occurrence outside the owner command.
9. Two simultaneous editors cannot silently overwrite one another. No-op save
   produces no new activation/effect. Lost response and exact retry recover the
   original result, even after another valid policy version exists.
10. Gift arrival versus enable/change/disable and delayed original-event recovery
    obey the declared effective-time contract in both acceptance orders. Import,
    lower threshold or re-enable does not manufacture historical live work.
11. Rule revision/source correction changes admission/reconciliation according
    to owner contract without repeating purpose or erasing completed human
    evidence. Existing D20 reviewed-set/concurrent-arrival safeguards still hold.
12. Failed read never appears Off; zero affected rows cannot be reported Saved.
    Failed/uncertain save retains the previous effective policy and user input,
    with a truthful current-permission-safe recovery action.
13. Keyboard/screen-reader/phone/zoom users can enable, enter an exact amount,
    understand currency/equality/effect, save, recover conflict and turn off
    without chart hover, scripts, excessive screens or mandatory narrative.
14. Bounded real source loads, queue recovery and unknown-currency cases prove
    predictable work without full-history scans, leaked preview counts, silent
    truncation or a new parallel task/configuration engine.

## Verification and remaining qualification

Inspected [organization-settings tests](/workspace/core/packages/api/tests/unit/org-settings-role-gate.test.ts:42)
mock the update as `{error:null}` and test role rejection/admin success; they do
not prove actual tenant choice, affected rows, applied permissions or policy CAS.
Existing [money tests](/workspace/core/tests/unit/packages/api/money-foundation.test.ts:14)
cover exact currency/precision/safe integer cases, and
[provider tests](/workspace/core/packages/api/tests/unit/money-provider.test.ts:28)
distinguish canonical money from Stripe restrictions. Their existence is useful
future seam evidence, not a new passing run or D22 qualification.

The known [Sentry failure before test collection](/workspace/core/docs/features/missionary-workspace-depth/grill/d20-evidence/current-source-and-ux.md:248)
was not rerun. No app behavior changed. All 48 local file-link/line-bound checks,
whitespace and scoped diff checks passed; these are documentation checks only. Effective deployed grants,
full migration precedence, actual PDP integration, source amount certification,
policy-versus-event races, browser accessibility and production performance
remain to be qualified through their owners before activation.

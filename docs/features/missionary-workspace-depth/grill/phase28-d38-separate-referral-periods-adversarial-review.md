# Phase 28 D38 — separate organization-set referral periods

**Disposition: Accept with required amendments.**

Reviewed October 18, 2026 against repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its research working tree.
**B and the exact corrected decision and required amendments were explicitly
ratified on October 18, 2026.** D34–D37 remain ratified. This is a finished
policy-scope review in the [Phase 28 research session](phase28-founder-brief.md:21),
not a formal PRD/OpenSpec, implementation ticket, schema change or live release.

## Exact corrected decision to record

> **D38 — Separate organization-set periods for new and continued referrals.**
> Authorized staff can configure two independent finite organization-wide
> follow-up periods: **New referral period** and **Continued referral period**.
> Both use positive whole numbers of elapsed days; one day is 24 hours.
> The values may be the same or different. Neither inherits from the other,
> and no per-missionary, project or referral override is introduced.
>
> Keep both fields together in the existing referral settings. Explain their
> different purposes and that edits affect future accepted windows only.
> Preserve qualified saved values; do not invent a default duration, use a
> blank or zero to mean Never, or silently copy one value into the other.
> Missing or invalid terms block only the source operation that depends on
> those terms. Maya sees her referral's applicable end date, time and timezone,
> without choosing a period or date herself.
>
> Keep tenant control over actions separate from the two periods. The existing
> missionary-continuation control remains available and initially Off for
> new/unconfigured tenants. Ordinary source action permissions let organizations
> withhold staff and missionary referral actions as appropriate. Saving periods
> never grants permission or enables a feature. Turning actions off stops new
> acceptance under those grants; it does not rewrite accepted end dates, delete
> otherwise permitted history or disable expiry. No additional global CRM
> shutdown switch is added.
>
> The native referral source owns each accepted window and its original
> introduction, kind, period and policy evidence. Continuation retains D36's
> accepted-source clock and exact expiry rules. This decision extends period
> configuration to initial referrals; it does not silently choose an initial
> clock anchor. Initial timing and late-entry admission remain a separate
> explicit product decision; the P9 source contract must then qualify that
> adopted meaning before initial windows can use this policy. Recording,
> importing, viewing or editing an old introduction must not silently grant a
> fresh window. Existing accepted windows and provenance remain intact.
>
> A period is a work-window rule, not contact consent, data retention, a task
> deadline, supporter interest, coaching access or automatic outreach.
> Current source, privacy and permission restrictions remain independently
> binding. Retries recover the original accepted outcome; they never extend it.

The amendment explicitly adds initial **configuration scope** to D36's exclusion;
it does not replace D36's continued-window semantics. D35's Off behavior remains
unchanged. The new/continued distinction is source-defined, not a user-selected
label that can reset an expired referral. No universal duration or numerical
supported range is asserted by this review.

## Evidence and what is actually known

| Evidence class              | Finding and limit                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User decision               | B requires independently configurable periods with a simple everyday experience and tenant disable control. It does not authorize indefinite expiry, per-item overrides or automatic continuation.                                                                                                                                                                                                                                                                                           |
| Governing repository intent | [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), [CRM Core](../../../../openspec/specs/crm-core/spec.md), [data boundary](../../../guides/architecture/data-access-boundary.md) and P9 own native referral truth and commands. P12 owns current scoped capabilities; field policies own disclosure. See the [governance evidence](d38-evidence/governance.md) for inspected clauses.                                                                            |
| Ratified predecessor        | [D34](phase28-d34-expired-referral-history-adversarial-review.md#exact-corrected-decision-to-record) separates expired history from access/action; [D35](phase28-d35-referral-continuation-adversarial-review.md#exact-corrected-decision-to-record) separates self-service Off from staff grants; [D36](phase28-d36-configured-referral-period-adversarial-review.md#exact-corrected-decision-to-record) supplies continued-window timing, exact expiry, recovery and prospective settings. |
| Current implementation      | The inspected settings, donor/portal mutation and legacy schema paths do not prove a qualified two-period referral producer. Static reuse hazards and exact file/line evidence are in the [authorization/time review](d38-evidence/authorization-and-time.md). No live database grants, deployed exploit, migration success or runtime readiness is claimed.                                                                                                                                 |
| Primary external evidence   | Fresh official MPDX/TntConnect/CRM/coaching guidance and accessible-form guidance inform discoverability, central defaults and clear actions. None establishes the correct initial/continued durations or Core's source clock. [Comparisons](d38-evidence/ux-and-comparisons.md) and [root research](d38-evidence/root-research.md) give URLs, dates and limits.                                                                                                                             |
| Product judgment            | Two visible fields with independent values express the selected flexibility more clearly than a shared/different mode, inheritance switch or rule builder. This is reasoned design, not a measured ministry preference.                                                                                                                                                                                                                                                                      |
| Unresolved qualification    | Initial source anchor and historical-import treatment, exact numeric/timestamp bounds, effective deployed permissions, scale budgets and actual usability remain unproved. Named owners and required outputs below gate only the affected activation. They are not guessed defaults or promises of future research without a release condition.                                                                                                                                              |

No ministry interviews or authenticated competitor application tests were
performed. The edge-case scenarios are deliberate counterexamples, not claimed
observations of how ministries normally work. Current official documentation can
describe a feature without proving that it improves fundraising outcomes.

## Necessity and alternatives

The real selected job is letting one organization choose different first and
renewed follow-up windows without asking Maya to administer policy on each
referral. B meets that job with two values. It does not require a generic
automation system, coaching workflow or new CRM.

**Strongest alternative: one shared period.** A removes one field and is a good
choice when an organization wants identical windows. B now has explicit user
support; equal values provide that practical outcome without an extra mode.
A hidden “Use new-referral period” checkbox would create linked state, ambiguous
future edits and migration cases. It is unnecessary. A shorter continued period
is not inherently more correct: either value may be greater, smaller or equal.

Per-item date overrides would provide more freedom but contradict the settled
ordinary journey and multiply authority/validation cases. A fixed Asym duration
lacks evidence and defeats tenant configuration. Manual staff work contains an
unqualified source path but is not the permanent chosen experience. Existing
qualified source policy should be reused where its exact meaning matches, not
wrapped in a second consumer settings store.

## Complete UX and UI

### Authorized staff: find, configure and change

Place one **Referral follow-up periods** section in the existing organization
referral settings. Reuse the current settings shell, navigation, save conventions
and [Core UI system](../../../../packages/ui/AGENTS.md). Do not create a separate
policy dashboard, wizard or new top-level navigation destination.

Show two vertically stacked fields with ordinary readable labels:

| Label                                | Persistent help                                                     |
| ------------------------------------ | ------------------------------------------------------------------- |
| **New referral period (days)**       | “Used for a new referral's first follow-up window.”                 |
| **Continued referral period (days)** | “Used when an eligible expired referral is deliberately continued.” |

Below them: **“The periods can be the same or different. Each day is 24 hours.
Changes apply to future windows. Existing end dates stay the same.”**
More detailed timing help uses the qualified source contract; do not claim
“from when you add the person” before that source meaning exists. A short
explanation can distinguish expiry from deleting a person or their history.
No long legal warning belongs in the primary form.

Use a compact text/numeric-entry control with explicit days, an appropriate
numeric keyboard and associated help/errors. Reuse shared controls; do not
introduce spinner/scroll behavior that accidentally changes a duration. No unit
dropdown, slider, calendar picker, colored risk meter or inferred recommended
number. Once qualified, display the same supported range enforced at the source.

Show existing saved values. For genuinely unset values, show **Not configured**
and an empty editable field, not a plausible-looking prefill. Loading failure
is **“Periods couldn't be loaded. Try again.”**, not Not configured. An
unauthorized viewer does not receive hidden settings in the page payload.

One ordinary **Save changes** commits the intended valid changes atomically.
An untouched unset period can remain unset when configuring the other kind;
it is not a validation error for an unrelated workflow. A changed invalid field
blocks that save. Clearing an already saved value is invalid, not a disable
operation. A save containing two changes must not silently persist only one.
Cancel restores the last known saved form, not a guessed default.

On success, show **“Referral periods saved. Existing end dates are unchanged.”**
Keep the saved values visible. On a stale form, explain that settings changed,
show current saved values and let staff reapply their intended edit without
silently overwriting someone else's change. On a lost response, recover that
save's result before treating it as a new change.

Both fields remain visible while missionary self-service is Off because
independently authorized staff may still act. The existing **Allow missionaries
to continue referrals** control stays separately operable even if a period draft
is invalid. Help explains **“Off stops new missionary continuations. Existing
windows keep their end dates. Staff permissions are managed separately.”**
Link authorized staff to the existing permission administration for broader
restriction; do not invent a second capability editor here.

### Maya: normal referral work

Maya does not see the two settings on every referral. In the ordinary list/detail
she sees the one applicable status and **“Follow-up ends [date, time, timezone]”**.
The end date is not an appointment or a task due date. Use the existing explicit
locale/timezone preference, never a protected location inference. Avoid ambiguous
numeric-only dates, midnight implications, unexplained timezone abbreviations,
countdown animations and urgent red badges for ordinary expiry.

For an eligible expired referral, retain the single **Continue referral** action
and D36's concise period/estimated-end terms. It uses the saved **Continued**
period; Maya never chooses the policy kind. After acceptance show the actual
end time. Relevant changed terms require refreshed review; an unrelated edit
to the **New** period alone must not invalidate otherwise unchanged continuation
terms. Normal within-date estimate drift retains D36's existing treatment.

If configuration is missing, explain **“Your organization needs to configure
the continued referral period before this referral can be continued.”** Provide
the existing appropriate staff/help path when available, not a button to settings
Maya cannot use. If the organization withholds the action, say that when safe to
disclose. Hidden records remain hidden; an error cannot reveal their existence.

At expiry, use D34's **Expired** history presentation under current authority.
Do not label the supporter inactive, uninterested or unsuccessful. No automatic
message, new task, coach notification or activity target credit is generated
by selecting, saving, viewing or reaching either period.

### Exceptional states and mobile use

| Situation                           | User-visible and source outcome                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Only New is configured              | Initial work may proceed only after its own source qualification; continuation explains its missing terms. No fallback.       |
| Only Continued is configured        | Qualified continuation remains available under current grants; missing initial setup does not break it.                       |
| Two values happen to match          | Both display normally. Editing one leaves the other unchanged.                                                                |
| Period shortened or lengthened      | Existing accepted windows remain fixed; future windows of the affected kind use the new terms.                                |
| Missionary continuation Off         | New missionary continuations stop; staff authority and permitted existing work/history are separately evaluated.              |
| All relevant action grants withheld | Neither staff nor missionary can perform the withheld source actions. The policy values do not bypass the restriction.        |
| Known accepted write; refresh fails | Report acceptance accurately, with “Current status unavailable. Refresh.” Do not invite another source effect.                |
| Acceptance outcome unknown          | “We couldn't confirm the result. Check status.” Recover the same action rather than issue a new one.                          |
| Another actor already continued     | Show the currently permitted original outcome; no duplicate cycle or false attribution to Maya.                               |
| Historical import/late record       | Preserve source history and apply qualified historical semantics; never grant a new window merely because a row was inserted. |
| Privacy withdrawal/deletion         | Current restriction governs immediately; period/history evidence cannot restore erased or restricted content.                 |
| Timezone changes or DST passes      | Format the same source endpoint; do not move it or add calendar days.                                                         |

Keep the settings and referral terms in a calm single-column layout on phones,
with wrapping long names/dates and normal Core spacing, typography, radius and
Zinc semantic tokens. No hover-only explanation. Use shared touch targets,
visible keyboard focus, associated inline validation and a single meaningful
status announcement. Verify 320 CSS-pixel reflow and 400% zoom, keyboard-only and
screen-reader operation. A success toast alone is insufficient.

On weak connections, keep form input recoverable in the current authorized
session, distinguish saving from saved and allow explicit status recovery.
Do not queue privileged offline mutations for later automatic replay. Cross-tenant
navigation or permission loss must clear stale private displays. This feature
adds no address/name fields, donor checkout steps, public UI or new coach access;
ordinary international names remain unmodified and eligible to wrap.

## Ownership, lifecycle and invariants

| Fact                       | Authority and invariant                                                                                                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy                     | One native tenant policy contains two independently meaningful configured kinds. At most one current value per tenant/kind; absent is unconfigured, never infinite. Historical evidence is separately retained. No shadow workspace preference.                                  |
| Duration                   | Positive finite integer elapsed days in a qualified range. `86,400` seconds per day is a unit definition, not a performance estimate or calendar-day promise.                                                                                                                    |
| Referral and cycle         | P9 owns lineage, introduction, responsibility and accepted windows. At most one accepted successor consumes a particular expired cycle, regardless of actor/request key. New/continued is derived from source lifecycle.                                                         |
| Continued timing           | D36 remains binding: source acceptance A after checks/waits; E = A + N × 86,400 seconds with checked arithmetic; interval `[A,E)`. At E it is expired.                                                                                                                           |
| Initial timing             | The initial source contract must name the anchor, precision, policy-selection event and treatment of late/backdated/imported records. Store original source timing separately from recorded/ingested/accepted timing. No consumer or migration chooses an anchor by convenience. |
| Accepted facts             | Each window retains kind, applicable duration/revision and authoritative timing/provenance. Do not dynamically recalculate historical end dates from current settings.                                                                                                           |
| Permissions and disclosure | P12/current source and static field policies govern each read/action. A setting, actor role label, cached status or source link is not a grant. No contacts or protected context in unqualified error/search/export/cache paths.                                                 |
| Secondary work             | Existing source transaction/history and qualified downstream effects remain owners. A projected list, task, notification or worker cannot extend a window or own referral state.                                                                                                 |

Configuration states are independently **Unconfigured** or **Configured** for
each kind. Source qualification/availability is not encoded as a magic value.
Ordinary edits preserve configured history; corruption is repaired through the
source owner. Referral states follow the native source: eligible initial
acceptance, active window, exact expiry, deliberate eligible successor; factual
correction, withdrawal and erasure retain separate semantics. Opening history,
an import retry, policy edit or old queued job cannot make any transition active.

No money, gift, allocation, commitment, tax receipt or received-total invariant
changes. No new attachment, storage object, generated donor document or external
provider is required. Existing disclosure/deletion rules still cover dates,
policy references, exports, audit attribution and backup recovery.

## Exact required amendments

These are explicitly ratified requirements for the selected answer; they do not
create an implementation authorization or claim that a missing producer exists.

- **C01 — Two independent kinds.** The native organization policy SHALL expose
  New and Continued finite periods. Equal, greater and smaller combinations SHALL
  be valid within supported bounds; no ordering constraint, inheritance, fallback,
  override matrix or third mode SHALL be added. This explicitly extends D36's
  initial configuration exclusion without replacing its continuation contract.
- **C02 — Typed finite input.** Both values SHALL use positive integral elapsed
  days with one day = 86,400 seconds. Reject zero, negative, fractional, nonnumeric,
  null-as-value, infinity, unsafe serialization and overflow without rounding or
  clamping. Unconfigured is a distinct absence. The P9/API owner SHALL qualify and
  publish the exact range/precision enforced consistently in form/API/database.
- **C03 — Independent readiness and safe defaults.** Preserve only values whose
  original semantics are qualified. No implicit numeric default or copy between
  kinds. An unconfigured kind SHALL block only dependent new acceptance, not
  existing work or the other qualified kind. Reads/fetch failures SHALL not
  masquerade as unconfigured. Initial availability/grants SHALL not be enabled
  by migration; D35's missionary continuation default remains Off.
- **C04 — Scope of Off.** Existing self-service Off and source action grants
  SHALL govern tenant disabling. No period value SHALL disable expiry, erase
  history or serve as a grant. Saved values remain editable under independent
  management authority. Off/restriction SHALL remain operable despite invalid
  period drafts. Re-enabling SHALL not replay rejected or stale intents.
- **C05 — Qualify the initial source clock.** Before initial-period activation,
  the initial-window anchor and late-entry admission behavior SHALL be resolved
  explicitly in the grill/domain-owner decision record before an authorized
  specification treats them as settled. The P9/import owners SHALL then qualify
  that adopted source event/clock, precision, policy-selection ordering and
  late/backdated/date-only/unknown/import handling with fixtures.
  Original introduction and recorded/imported/accepted times SHALL remain
  distinguishable. Mere insertion/import SHALL NOT manufacture a fresh window;
  unknown historical terms SHALL not be inferred from today's policy. This gate
  blocks only the affected initial path; D38 does not silently select the anchor.
- **C06 — Preserve accepted windows.** Store source-defined kind, timing, duration
  and applicable policy evidence at acceptance. Policy changes SHALL affect only
  future accepted windows of the affected kind. D36's exact elapsed-time boundary
  remains binding for continued windows. Corrections SHALL use the authorized
  history-preserving source contract, never a generic status/date patch.
- **C07 — Atomic configuration.** Saving intended valid changes SHALL be atomic
  with current-base concurrency checks, required audit and bounded outcome
  recovery evidence. Two-field saves SHALL not partially succeed. Untouched
  unconfigured fields may remain absent; attempted clearing of a configured
  value SHALL fail. Concurrent saves SHALL not silently lose another edit.
- **C08 — Current authority and relevant terms.** Tenant/actor/assignment/owner/
  scope/attribution and accepted policy facts SHALL derive from trusted current
  context. Settings, restrictions and source acceptance SHALL have a qualified
  ordering boundary with fresh checks after waits. Only relevant terms authorize
  the action: editing New alone SHALL not invalidate unchanged Continued terms.
  Changes A→B→A to relevant terms SHALL not revive a stale rejected intent.
- **C09 — One durable source effect.** Native acceptance, required audit/activity
  and minimal recovery correlation SHALL commit together. Retry/recovery SHALL
  preserve the original kind/end/actor and not consume a later cycle. Competing
  actors or transport keys SHALL not duplicate an effect. Post-write read failure
  SHALL be distinguished from failed/unknown acceptance. No generic command
  journal or new scheduler is required for this local source work.
- **C10 — Structural database safety.** Tenant-aware keys/FKs SHALL protect policy,
  referral, cycle, actor and evidence relationships. Enforce finite/non-null
  configured values, valid kind, unique current policy and single cycle effect
  at the source/database boundary. Delete behavior SHALL not cascade policy edits
  into referral history or erase required attribution. Qualification SHALL test
  actual grants, RLS `USING` and new-row `WITH CHECK`, restrictive/permissive
  composition, immutable fields, views/RPCs/function privileges and service-role
  bypasses; an allowed update must not transform a row into a forbidden tenant,
  owner, kind or accepted state. Generic broad JSON/donor PATCH is not this API.
- **C11 — Read and privacy parity.** List/detail/preview/recovery/search/export/
  cache/log/audit surfaces SHALL honor current tenant and field disclosure.
  Expiry/retention/contactability/coaching remain separate. Technical logs SHALL
  not copy private referral bodies, protected location or full snapshots.
  Restoration SHALL reapply current restrictions before serving restored data.
- **C12 — Clear settings and everyday UI.** Use the two labeled day fields in one
  existing settings section, current saved/unset/loading/error states and normal
  Save/Cancel. Maya sees only applicable source terms/end, not policy editing.
  Continue retains D36's honest estimated preview and accepted result. No extra
  routine confirmation, user date picker, automated contact or task completion.
- **C13 — Accessible, localizable feedback.** Use exact Core base-maia/Base UI and
  semantic tokens, associated labels/help/errors, keyboard/focus/touch support,
  screen-reader status and 320 CSS-pixel/400% reflow. Format date/time/zone using
  approved explicit preferences; preserve instant through travel/DST. Unknown
  outcome offers recovery; no offline privileged replay or countdown spam.
- **C14 — Bounded native operations.** Use source-appropriate indexed tenant/kind
  lookups, paginated current-authority reads and bounded exact-cycle jobs/recovery.
  Policy edits SHALL not scan/recompute every historical referral or lock other
  tenants. P9/API operations owners SHALL qualify query/load/batch/latency budgets
  with production-shaped data before rollout; no unmeasured speed promise.
- **C15 — Compatible rollout and rollback.** Inventory existing policy meanings
  before migration. Preserve accepted history; do not copy ambiguous single
  settings into both kinds. Expand and deploy readers/writers that understand
  kind before enabling new acceptance. Old clients cannot omit kind/context to
  write unsafe terms. Rollback SHALL stop affected new acceptance while retaining
  known results/history; never collapse unequal values or restore unsafe old
  writes. Feature restriction is not deletion or expiry disablement.
- **C16 — Evidence and traceability.** Before activation, fulfill the qualification
  gates and P01–P24 below using actual source/database/UI tests. Preserve Q38 B,
  these reviewed amendments, the glossary and D34–D36 scope in later authorized
  owner/OpenSpec/design/tasks/test/release records. This review SHALL not be
  represented as runtime proof, automatic ratification or a completed user study.

## Concern register

Likelihoods are reasoned exposure assessments, not incident rates. Severity
describes the plausible consequence if the unamended omission reaches a real
implementation. Every material concern below narrows or amends B; none overturns
the selected two-period model.

| Finding | What could go wrong and why it matters                                                                                                      | Severity / likelihood                                | Evidence and effect on answer                                                                                         | Permanent prevention / exact language |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| F01     | One field inherits from another, equal values become linked, or a hidden rule forces continued < new; tenant edits have surprising effects. | Medium / likely in a naive settings design           | B requires independent control; strongest A/inheritance comparison above. Narrows UI/data semantics.                  | C01, C07, C12; P01–P03, P07.          |
| F02     | Blank/zero/unsupported days become infinite or wrap timestamp arithmetic; one missing kind blocks unrelated work.                           | High / plausible                                     | D36 C03; source clock/driver limits unqualified. Narrows configuration and admission.                                 | C02–C03; P03–P05, P23.                |
| F03     | Late entry/import date is treated as original introduction or new-window anchor, making old records appear freshly eligible.                | High / likely if insertion time is reused            | Q38 explicitly left anchor open; P9 source provenance. Blocks unqualified initial activation.                         | C05–C06; P13–P14, G1.                 |
| F04     | Reading current settings recalculates prior end dates, or migration applies today's policy retrospectively.                                 | High / plausible                                     | D36 accepted timing/history; temporal counterexample. Requires saved terms and prospective adoption.                  | C06, C15; P06, P20–P21.               |
| F05     | Off deletes data, turns off expiry, revokes unrelated staff authority, or cannot be saved because a field draft is invalid.                 | High / plausible                                     | D35 ratified Off; D36 separate controls. Clarifies disable instead of adding a global switch.                         | C04, C12; P08–P09.                    |
| F06     | Stale forms overwrite one value; two-field save partially succeeds; policy/access races accept unauthorized terms.                          | High / plausible under concurrency                   | Current-base and source ordering required by D36, extended to two kinds. Changes mutation contract.                   | C07–C08; P07, P10–P11.                |
| F07     | Lost responses/retries or competing actors create multiple windows or a later end date.                                                     | High / plausible on weak networks                    | D35 single-cycle effect; D36 recovery. Preserves source business identity, not only request key.                      | C09; P12, P15.                        |
| F08     | Generic settings, donor mutation, service-role or RLS update permits cross-tenant reads/writes or row transformation.                       | Critical / plausible if reused without qualification | Static API/schema evidence in authorization note; no deployed exploit claimed. Prohibits unsafe reuse.                | C08, C10–C11; P16–P18, G2.            |
| F09     | Date-only text implies midnight, active implies contact consent, or Expired implies donor refusal; users act on a false interpretation.     | Medium; privacy consequence High / plausible         | D34–D36, Tnt/MPDX comparison and W3C. Changes language and state feedback.                                            | C11–C13; P19, P22.                    |
| F10     | Display state, task due date, coach view or external CRM becomes referral authority; duplicate timers drift.                                | High / plausible                                     | ADR-0001, source-owned boundaries, P9/P12. Narrows architecture and integrations.                                     | C05–C06, C09, C11, C14; P14, P18.     |
| F11     | History scans, global locks, unlimited recovery or delayed expiry jobs degrade or revive stale cycles.                                      | Medium / plausible at scale                          | No measured deployment budget; exact-cycle and indexed-query reasoning. Requires bounded qualification.               | C09, C14; P15, P23, G3.               |
| F12     | Audit/log/export/backup copies retain private context or cannot explain which period governed an outcome.                                   | High / plausible                                     | Static field/source/audit contracts; privacy/access have different retention purposes. Changes evidence/minimization. | C06–C07, C10–C11; P17–P18, P21.       |
| F13     | Rollback or an old client collapses distinct periods, resets history or writes without necessary context.                                   | High / plausible during deployment                   | Two-kind schema/semantic change requires mixed-version proof. Changes rollout sequencing.                             | C15; P20–P21, G4.                     |
| F14     | A polished review is mistaken for proven source behavior, accessible UI or measured ministry need.                                          | High / plausible if evidence status is omitted       | No current qualified producer/runtime/user study; explicit source gates. Limits claims and activation.                | C16; P22–P24, G1–G5.                  |

## Independent category review

Every requested category is evaluated independently. The concern register supplies
consequence, severity, likelihood, evidence, impact and exact prevention for each
referenced finding; C/P references are the exact review-ready wording.

| #   | Category                                                      | Material concern? What was checked                                                                                                                                                                                                                                                                     | Required resolution                                      |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 1   | Problem validity, necessity, and alternatives                 | **Yes — F01, F14.** Compared shared value, two independent values, inherited values, per-item dates and no-build. B solves the explicitly selected organization choice; no evidence supports a universal default or ordering.                                                                          | C01–C03, C16.                                            |
| 2   | Brittleness                                                   | **Yes — F02–F07.** Missing configuration, late entry, travel/DST, stale forms, weak connections and policy changes break ideal-condition assumptions.                                                                                                                                                  | C02–C09, C13.                                            |
| 3   | Technical debt                                                | **Yes — F01, F08, F10.** Generic JSON, copied donor status paths, duplicate consumer policy and an extra timer service would entrench weak abstractions.                                                                                                                                               | C01, C05–C10, C14.                                       |
| 4   | Edge cases                                                    | **Yes — F02–F07, F09.** Equal/reversed values, one unset, empty draft, exact expiry, historical imports, relevant-policy ABA and result recovery after another expiry were examined.                                                                                                                   | P01–P15, P19.                                            |
| 5   | Footguns                                                      | **Yes — F02, F04–F05, F09.** Zero-as-Off, copied defaults, Save-enables, retroactive shortening and midnight wording cause avoidable mistakes.                                                                                                                                                         | C02–C06, C12–C13.                                        |
| 6   | Tenant safety                                                 | **Yes — F08, F12.** Policy/kind identity, references, actors, caches, lists, exports, recovery and restrictions must stay within current tenant/scope.                                                                                                                                                 | C08, C10–C11; P16–P18.                                   |
| 7   | Database, RLS, and authorization safety                       | **Yes — F02, F06–F08, F12.** Reviewed keys/FKs, types, null/default/check/unique/delete rules, index needs, old/new-row authorization, view/RPC/service paths and trusted attribution. Money precision is unaffected. Live grants are unverified.                                                      | C02, C07–C11, C14–C15; G2.                               |
| 8   | Overengineering                                               | **Yes — F01, F10.** Mode switches, inherited values, a policy builder, project/person exceptions and a new approval queue add no selected value.                                                                                                                                                       | C01, C09, C12.                                           |
| 9   | UX/UI and user friction                                       | **Yes — F01, F05, F09, F14.** Complete admin/Maya/disabled/error/mobile/localized/a11y journeys are defined. Donor/public/coaching flows need no added steps. Actual comprehension remains untested.                                                                                                   | C12–C13; P19, P22; G5.                                   |
| 10  | Source of truth, ownership, and domain invariants             | **Yes — F03–F04, F08, F10.** P9 policy/cycle vs display, cardinality, accepted history and current access are distinct; no money conservation change.                                                                                                                                                  | C05–C11; ownership table.                                |
| 11  | Hidden coupling                                               | **Yes — F01–F05, F10.** Initial readiness must not depend on Continued or vice versa; period, permission, retention, task due date and coaching remain independent.                                                                                                                                    | C01, C03–C06, C11.                                       |
| 12  | Failure modes                                                 | **Yes — F06–F08, F11.** Partial save, lost source response, failed post-write refresh, delayed jobs and permission revocation require visible safe outcomes and recovery.                                                                                                                              | C07–C09, C11, C14.                                       |
| 13  | Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — F03–F07, F11.** Defined independent configuration readiness, active/expired/successor, forbidden revival, corrections, exact E, source ordering and business-effect deduplication. Initial anchor explicitly unqualified.                                                                      | C05–C09; P06–P15; G1.                                    |
| 14  | Data integrity risks                                          | **Yes — F03–F04, F06–F08, F13.** Mixed policy snapshots, duplicate cycles, broken tenant references, stale deadlines and semantic migration drift are material.                                                                                                                                        | C06–C10, C15.                                            |
| 15  | Security and privacy risks                                    | **Yes — F05, F08–F10, F12.** Access/contactability, timing metadata, protected locations, retention, logs, exports and restored backups were checked. No new external disclosure is justified.                                                                                                         | C04, C08, C10–C11, C13.                                  |
| 16  | Scalability and performance risks                             | **Yes — F11, F14.** No workload/latency claim is verified; constant-scope policy reads, indexed expiry access, bounded pages/jobs/recovery and measured budgets are required.                                                                                                                          | C14; P23; G3.                                            |
| 17  | Operational burden                                            | **Yes — F02–F03, F06, F11.** Unexplained blocked setup, repeated data repair and ambiguous retries would produce support work. Keep precise readiness, owner repair and recoverable commands.                                                                                                          | C03, C05, C07, C09, C14.                                 |
| 18  | Observability and auditability gaps                           | **Yes — F06–F07, F12, F14.** Need policy kind/revision and accepted source history plus separate technical failures and security attribution; logs alone do not prove business outcome.                                                                                                                | C06–C11, C16; monitor table.                             |
| 19  | Dependency and integration risks                              | **Yes — F03, F10, F14.** P9/P12/field-policy producers and import contracts are real dependencies. No new vendor/package is needed; delayed/duplicate external imports cannot invent or reset windows.                                                                                                 | C05, C08–C11, C16; G1–G2.                                |
| 20  | Migration, rollout, and upgrade risks                         | **Yes — F04, F13.** Existing one-value policy meanings, retained records, mixed readers/writers, staged enablement and non-destructive rollback require proof.                                                                                                                                         | C15; P20–P21; G4.                                        |
| 21  | Testability, traceability, and proof                          | **Yes — F14.** Selected B and reviewed amendments must remain distinct; precise positive/negative/race/access/migration/UI criteria follow. No runtime tests are claimed by doc verification.                                                                                                          | C16; P01–P24; G1–G5.                                     |
| 22  | Other development hazards                                     | **No additional material concern found after the above amendments.** Checked new fees/licensing, third-party dependency, donor drop-off, new money ownership and mandatory coaching/gamification: none is introduced. Unsupported source/rollout claims remain explicitly covered by F14, not ignored. | Preserve scope exclusions; re-review if those are added. |

## Independently testable proof obligations

These verify domain/user outcomes in the future actual implementation, not a
model that simply repeats the proposed logic. They are not claimed executed.

| ID  | Falsifiable outcome                                                                                                                                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | Configure unequal values; a qualified initial window uses New and a continued window uses Continued. Maya supplies no duration, kind override or end date.                                                                                                                                                                             |
| P02 | Equal values are accepted; editing either does not change the other. Both new < continued and new > continued are valid.                                                                                                                                                                                                               |
| P03 | Zero/negative/fractional/empty mutation/nonnumeric/nonfinite/overflow values fail consistently without rounding; qualified minimum and maximum succeed, immediate outside bounds fail.                                                                                                                                                 |
| P04 | Only one kind configured: the other dependent command is blocked, while qualified independent work continues. No copied default appears in storage or UI.                                                                                                                                                                              |
| P05 | Fetch failure, permission denial and true unconfigured state remain distinguishable without leaking another tenant's settings.                                                                                                                                                                                                         |
| P06 | Change either policy in both directions; accepted prior endpoints/provenance do not move. A new accepted window uses its relevant then-current terms.                                                                                                                                                                                  |
| P07 | Two-field save is all-or-nothing with audit. Concurrent stale saves do not lose edits; an unknown save response recovers the accepted result without overwriting later settings.                                                                                                                                                       |
| P08 | Saving periods grants no capability. D35 Off blocks new missionary continuation but preserves staff rights and permitted existing work. Invalid numeric drafts do not prevent Off.                                                                                                                                                     |
| P09 | Withhold all relevant grants: every affected direct/API/RPC action denies; existing facts are neither deleted nor made infinite. Re-enable does not replay rejected actions.                                                                                                                                                           |
| P10 | Policy/restriction commit before acceptance prevents stale admission after waits. Reverse ordering preserves the accepted facts while enforcing current subsequent disclosure.                                                                                                                                                         |
| P11 | New-only edit does not invalidate otherwise unchanged Continued terms. Relevant A→B→A does not revive an old rejected intent.                                                                                                                                                                                                          |
| P12 | Same intent retry, different transport keys and two actors consuming one expired cycle produce one durable successor and correct attribution.                                                                                                                                                                                          |
| P13 | Qualified initial fixtures distinguish original introduction, delayed recording and trusted initial-window anchor. An old import never becomes fresh work solely because it was inserted today.                                                                                                                                        |
| P14 | Duplicate/out-of-order import, missing historical anchor and corrected source date follow explicit source rules without recreating people, silently extending windows or using current policy as historical truth.                                                                                                                     |
| P15 | At one supported precision tick before E the time predicate may pass; at E and after it fails. Old expiry work and recovered responses cannot close or create a different cycle.                                                                                                                                                       |
| P16 | Two tenants, overlapping roles, changed assignment and spoofed tenant/actor/owner/policy fields never cross authority. An allowed update cannot move a row into a forbidden tenant/kind/accepted state.                                                                                                                                |
| P17 | Test actual grants/RLS old and new rows, RPC execute rights, function search path, view semantics and privileged service path; no browser or generic mutation bypass exists.                                                                                                                                                           |
| P18 | List/detail/preview/recovery/search/cache/export/audit follow current field policy. Restrict or erase a source after acceptance; old result/log/backup restore does not restore disclosure.                                                                                                                                            |
| P19 | Date/time/zone is correct through DST, leap day, travel, locale change and long international names. End date is never silently changed by formatting or presented as contact consent.                                                                                                                                                 |
| P20 | Upgrade retained qualified one-kind data without inventing the other; ambiguous legacy meaning requires explicit owner mapping. No accepted endpoint is rewritten.                                                                                                                                                                     |
| P21 | Mixed versions and rollback deny unsafe new writes while preserving accepted results/history; two unequal values are never collapsed into an old single field. Restore obeys current restrictions.                                                                                                                                     |
| P22 | In actual UI, representative staff can change only the intended value and explain Off/existing-date effects; missionaries can find and explain their actual end date and recover an uncertain result. Keyboard, screen reader, mobile, 320px/400% and weak-network journeys pass. Misunderstood authority/expiry is a release blocker. |
| P23 | Source-owner published finite numeric/precision and production-shaped load/query/recovery budgets pass at boundary workloads, including a large tenant, concurrency and delayed jobs. No historical rescan/global tenant lock is required by a settings edit.                                                                          |
| P24 | Selected answer, reviewed/ratified status, source amendments, glossary and later authorized OpenSpec/design/tasks/tests/release evidence use consistent kind, time, permission and retention terminology.                                                                                                                              |

## Ruthless synthesis and order of work

**Before recording this review:** reconcile B with D36's initial-scope exclusion,
retain D35's disable meaning, reject hidden inheritance/indefinite values and
state the unqualified initial clock honestly. This document does that; B and its
exact amendments are now explicitly ratified. The original answer review posed
no new independent question; continuation follows in the session record.

**Capture in the later authorized spec/design:** C01–C16, the two-field journey,
independent readiness, accepted-history invariants, P01–P24 and the following
specific gates. Integrate through canonical source owners and generated views
only when `/to-prd` authorizes that transition; ratification does not itself
integrate an amendment into governing specifications. D38 needs no new platform ADR because
it is a small policy-scope choice within existing owners.

| Gate                             | Accountable owner role                                            | Required output and dependency                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — Initial source meaning      | Founder/domain decision owner, then P9 referral and import owners | Resolve the initial anchor and late-entry admission explicitly in the grill/domain-owner decision record before treating them as settled in an authorized specification. Then qualify the exact clock/policy-selection event, late/backdated/date-only/unknown/import handling, range/precision and P13–P14 fixtures. No initial activation before adoption and proof; qualified continuation is independent. P9/import implementation cannot choose an implicit recording/import-time default. |
| G2 — Actual authorization        | P9 API and P12/security owners                                    | Exact source commands/grants/RLS/field projections and ordering proof for P08–P18 on the real deployment. No new activation through the inspected generic mutation/settings shortcuts.                                                                                                                                                                                                                                                                                                          |
| G3 — Capacity and recovery       | P9/API operations owner                                           | Numeric workload, page/batch/query/latency and recovery budgets with production-shaped evidence P23; durable-outcome diagnosis and owner repair procedure. No guessed SLO.                                                                                                                                                                                                                                                                                                                      |
| G4 — Safe adoption               | Database/release owner                                            | Legacy semantic mapping, expand/enable sequence, old-client denial, preserved endpoints, compatible rollback/restore and P20–P21 evidence.                                                                                                                                                                                                                                                                                                                                                      |
| G5 — Comprehension/accessibility | Missionary Workspace design and accessibility owner               | Actual prototype/UI sessions and manual/automated P22 evidence across staff and missionary roles. Every observed authority/expiry misunderstanding is corrected and retested before release. No invented sample-size or efficacy claim.                                                                                                                                                                                                                                                         |

**Implementation order:** qualify native policy/source meaning and authorization
first; enforce constraints and atomic commands next; connect the existing staff
form and missionary source projection; then prove failure, migration and UI
journeys before enabling a cohort. A missing initial producer does not block
independent workspace capabilities. A consumer-local substitute is not a
permanent fix for that missing producer.

**Monitor after safeguards and release proof, never instead of them:**

| Signal                                                                                                                            | Threshold                                    | Owner role                     | Response                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accepted window changes after an ordinary policy edit, duplicate successor, or new acceptance after a prior committed restriction | Any confirmed occurrence                     | P9 API on-call                 | Stop affected new acceptance, preserve reads/recovery under current authority, trace source evidence and correct through owner path before re-enable.        |
| Cross-tenant or forbidden referral metadata disclosed                                                                             | Any confirmed occurrence                     | Security incident owner        | Restrict affected path immediately, investigate scope, revoke exposed caches/exports where controllable and follow the incident process.                     |
| Staff or missionary confuses the two kinds, treats expiry as consent, or believes settings changed existing dates                 | Any validated usability/support incident     | Workspace product/design owner | Reproduce with the actual journey, fix the responsible copy/control and regression-test before expanding rollout. Do not add settings by reflex.             |
| Request/query/job performance exceeds the published G3 budget                                                                     | Any measured breach of that published budget | API operations owner           | Block expansion or limit affected work, inspect plans/lock contention/backlog and restore the budget before expansion. Undefined budget means no activation. |
| A legitimate eligible action is blocked by unintended cross-kind readiness or stale configuration state                           | Any reproducible report                      | P9 product/API owner           | Diagnose kind/readiness and repair policy/source boundary; do not insert a guessed duration or bypass current grants.                                        |

These owners are accountable roles, not fabricated personnel assignments. Assign
actual on-call/product ownership in release evidence. No policy correctness,
authorization, unknown anchor or migration defect is relegated to monitoring.

## Evidence preservation and verification

[Original unanswered Q38](d38-evidence/q38-before-answer.txt) is preserved.
[Prior evidence manifest](d38-evidence/prior-evidence-sha256.json) pins all seventeen
D37 evidence files and that snapshot. Earlier programs are not rerun. The new
[review verification](d38-evidence/review-verification.json) checks document
structure, links, selected/pending status and frozen hashes only. It proves no
source runtime, database access, screen-reader behavior or fundraising effect.

## Explicit ratification

On **October 18, 2026**, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”**
The exact corrected D38 decision, C01–C16, P01–P24 and required design amendments
are explicitly ratified with their reviewed wording preserved.

Two independent organization periods are accepted; existing end dates and
D35/D36 authority/time boundaries remain intact. Initial-clock and late-entry
meaning remain the explicit unresolved product branch identified by C05/G1.
Ratification does not answer that branch, select a numerical duration, implement
a source producer or qualify a deployment. D12's detailed amendments retain
their separately recorded status.

The [pre-ratification D38](d38-evidence/d38-before-ratification.txt),
[pre-ratification Q38](d38-evidence/q38-before-ratification.txt) and all nine original
D38 evidence files are preserved by the
[ratification manifest](d38-evidence/ratification-evidence-sha256.json).
[New ratification verification](d38-evidence/ratification-verification.json) checks
exact wording, current status, references and preserved hashes. No prior model,
probe or verifier is executed. No formal PRD/ADR/OpenSpec, ticket, app/schema,
live permission, external communication or GitHub state is changed.

# Phase 24 D55 — Access-Review Timing-Profile Safety Withdrawal

- **Status:** Founder Option 1 adjudicated; documentation-only activation
  prerequisite
- **Founder direction:** preserve every Tenant-selected timing-policy head and
  stop the exact unsafe profile revision through one platform safety fence
- **Disposition:** **Accept with required amendments**
- **Date reviewed:** 2026-08-29
- **Scope:** D56-gated authority/evidence dependency; exact profile lifecycle;
  selected-versus-effective policy truth; D43/D49/Delivery Plan consequences;
  local and future external irreversible-effect boundaries; authorization,
  RLS, privacy, UX/accessibility, concurrency, mixed versions, operations,
  repair, rollout, proof, and D56
- **Non-scope:** no runtime row, schema, migration, OpenSpec delta, profile,
  timing value, key, manifest/census entry, Delivery Step, provider request,
  feature flag, task, notification, worker, UI, telemetry pipeline, or generic
  override engine is authorized by D55

## Executive adjudication

Option 1 is the correct permanent direction. A single exact-profile safety
disposition contains material harm in O(1) product state, preserves who actually
selected Tenant policy, and avoids a cross-Tenant bulk write whose partial
success and actor attribution would be difficult to make truthful. The short
answer is nevertheless unsafe without amendments. “Fence” could otherwise mean
a mutable feature flag, stale cache entry, Tenant-editable Boolean, provider
pause, or asynchronously propagated worker hint. “Preserve Tenant heads” could
also cause a settings form to falsely show the unsafe profile as still effective
or to silently resume it later.

The corrected D55 decision is:

> After—and only after—an exact D53 evidence-qualified proposal passes the full
> activation package, its immutable activated profile identity/revision must be
> governed by one product-owned **Access-review timing-profile safety
> withdrawal** contract. The exact authorized-human/assurance and registered-
> trigger/evidence rule is D56's separate pre-activation decision. D55 permits
> actuation only through that future D56-qualified, trusted, server-side
> platform command. The command must persist the exact environment and profile
> revision, server-derived accountable actor/initiator, trusted database
> effective instant, stable safe reason class, restricted evidence reference or
> digest, decision/contract revision, and durable idempotency. A Tenant admin,
> `permissions.manage_grants`, support/impersonation, a role string, browser,
> worker, provider, feature flag, automation, or `service_role` alone can never
> satisfy D56 or publish the withdrawal.
>
> D55 does not choose whether the D56 command requires one authorized human to
> contain immediately with later independent review or a different human's
> approval before containment. In every D56 option, the registered trigger and
> evidence reference must distinguish safety withdrawal from ordinary
> retirement/investigation, and neither Tenant consent, a Tenant census, bulk
> fanout, provider acknowledgement, analytics, nor an unreviewed machine/vendor
> signal is authority. No profile may activate while D56 remains unresolved.
>
> The committed disposition is append-only, monotonic, terminal for that exact
> activated profile revision, and globally narrowing in its product environment.
> It is not a Tenant policy head, ordinary profile retirement, Delivery Plan,
> notification preference, provider setting, deployment flag, rollout cohort,
> or generic policy override. An idempotent replay returns the same disposition;
> a different immutable target or meaning conflicts. The disposition cannot be
> updated, deleted, temporarily disabled, scheduled, scoped to selected Tenants,
> or “cleared.” A safe future implementation requires an independently
> evidenced and activated successor profile revision; affected Tenants remain
> effectively Off until an authorized Tenant person deliberately saves Off or
> another currently selectable profile.
>
> Every **Selected access-review timing-policy head** remains unchanged with its original
> actor, reason, revision, and time. Every already-pinned D43 source tuple and
> compatible decoder remains immutable historical evidence. The **Effective
> access-review cadence disposition** is a server-derived evaluation of the
> selected profile revision under the applicable platform safety disposition.
> For an exact withdrawn revision, that disposition is Off/no new courtesy
> effect, but this derived Off result is never
> stored or displayed as though the Tenant selected it. Unknown, malformed,
> unsupported, unreadable, stale, or unavailable safety state also fails closed
> to no new optional reminder effect; it cannot block the underlying D43 request,
> D44 initial attention, ADR-0183 task, access, or a Tenant's explicit save to
> Off.
>
> Fence publication and each favorable boundary share a defensible product-
> database order. Fence-first blocks new offering/selection, a D43 admission
> using that current head, an uncommitted D49 source occurrence/cohort seal, plan
> compilation, and every still-unreleased local or external member/step. A D43
> creation that committed first keeps its pinned historical tuple, but every
> later seal and descendant still re-proves the disposition and is suppressed.
> No catch-up, substitute profile, successor occurrence, rekey, fallback channel,
> or changed payload is created. Reconciliation may materialize terminal
> **safety-withdrawn/no-release** evidence, but truth changes at the one fence
> commit and never waits for a scan or worker.
>
> An irreversible-effect admission that committed first remains truthful. A
> D54 local reminder already made queryable ends only that reminder child's
> active/unread contribution through its registered source-applicability end;
> it does not fabricate read, archive, dismissal, deletion, request resolution,
> or task completion, and authorized Recent/audit history may remain. The D44
> initial item and the source-backed task remain actionable while D43 remains
> pending. A future external step still **Prepared definitely unsubmitted** is
> suppressed. A step already at **Submission may have begun** may finish or
> reconcile only its one previously admitted provider call under frozen
> identity; withdrawal authorizes no recall claim, retry, follow-up, replacement,
> rekey, resend, fallback, or second provider call.
>
> Tenant policy publication uses expected-head concurrency. A stale or current
> client cannot newly select/reselect a withdrawn revision. Concurrent Tenant
> save and platform withdrawal serialize: save-first may leave that profile as
> the preserved selected head but the fence immediately makes it effectively
> Off; fence-first rejects the unsafe save. Saving explicit Off remains a safe
> narrowing even if fence evaluation is temporarily unavailable. Policy commands
> compare and mutate the selected head, never the derived effective result:
> deliberately saving Off from a withdrawn selected revision is therefore a
> real D51 Active-to-Off transition that advances the Tenant cancellation epoch,
> not a no-op merely because effective behavior was already Off. Saving any
> non-Off profile requires fresh proof that the target is activated, selectable,
> compatible, not ordinarily retired, and not safety-withdrawn and remains
> prospective for genuine later D43 requests.
>
> The future **People & access → Access requests → Settings** surface shows a
> compact read-only **Current setting** summary: **Selected: [profile label]**,
> **Status: Unavailable for safety**, **Effective: Off**, and **Courtesy
> reminders are off. Existing access requests, tasks, and access are unchanged.
> This setting will not restart.** It shows no incident detail, affected
> person/request count, recipient identity, internal evidence, alarming modal,
> global banner, task, inbox item, email, toast, or forced redirect. A secondary
> **Choose a new setting** action opens the ordinary native radio fieldset with
> only explicit Off and other independently activated selectable profiles; the
> withdrawn profile is static context, not a disabled or selected radio. Nothing
> is preselected and Save remains unavailable until the authorized Tenant person
> deliberately chooses. Cancel leaves the selected head intact. Ordinary users
> simply stop receiving new courtesy effects.
>
> D55 uses Core's own authoritative product database, authorization, audit,
> source, plan, item, and typed-destination contracts. It does not introduce a
> third-party flag dependency, a generic override/rule engine, a new scheduler,
> group policy, notification system, task state, synchronous Tenant fanout, or
> per-Tenant exception. D55 is documentation only; no timing profile may be
> activated until the eventual implementation and release package proves this
> entire contract, including fail-closed mixed-version behavior.

The disposition is **Accept with required amendments**, not an unqualified
acceptance of a mutable kill switch or a bulk policy rewrite.

## Current behavior, intended behavior, and permanent path

| Layer             | Verified current behavior                                                 | Intended D55 behavior after a future activation                                                                                      | Best permanent path                                                                                          |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Timing profiles   | No D47–D55 profile registry, policy head, fence, or setting ships.        | One exact activated revision can be terminally safety-withdrawn.                                                                     | Admit the fence and the first profile in the same complete activation package; never land inert scaffolding. |
| Access review     | D43–D54 are planning contracts, not runtime source behavior.              | Withdrawal narrows only the optional courtesy effect.                                                                                | Keep D43 request, D44 routing/initial attention, access, and ADR-0183 task independently authoritative.      |
| Tenant policy     | No reminder policy head exists.                                           | The Selected access-review timing-policy head stays historically exact; the Effective access-review cadence disposition derives Off. | Preserve authorship and expose selected-versus-effective truth instead of fabricating a Tenant Off write.    |
| Local reminder    | No courtesy key/item/group exists; current bell content is demo material. | A released D54 child ends active/unread contribution without fake engagement.                                                        | Reuse ADR-0027 source-applicability and Recent-history behavior; do not mutate its sibling or group truth.   |
| External reminder | D54 authorizes no external courtesy step.                                 | Any later channel obeys its own irreversible boundary and fence recheck.                                                             | Keep pre-I/O suppression and post-admission reconciliation channel-specific under ADR-0026.                  |
| Safety control    | There is no D55 control.                                                  | One exact-profile, environment-scoped, product-owned terminal disposition.                                                           | Do not adopt a third-party flag, per-Tenant override, targeting rules, or generic policy engine.             |
| UX                | No Access requests settings route is implemented.                         | Calm static selected/effective summary plus explicit replacement selection.                                                          | Use Base Maia/Base UI and native semantic controls in the eventual complete feature.                         |

## Problem validity and strongest alternative

The root problem is credible post-activation evidence that one exact profile can
cause material harm while current Tenant heads continue admitting new requests.
Ordinary retirement is intentionally too weak: it removes the profile from new
selection but preserves current-head behavior. D51 Tenant Off is individually
correct but cannot depend on every Tenant discovering and saving it before harm
continues.

The strongest plausible alternative is automatic Off successor heads for every
affected Tenant. It makes stored and effective values coincide, but it is the
worse permanent system: it performs O(Tenant) authoritative mutations, can
partially succeed, races legitimate saves, needs synthetic platform-as-Tenant
attribution, and creates pressure for mass notifications and rollback. A
mutable generic feature flag is operationally quick but weaker still because it
can drift from source/audit truth, be cached as favorable, or be cleared without
the activation evidence required by D47/D53.

The exact-profile fence is proportionate. It adds one future narrow product
primitive only if a profile first exists, reuses the existing source/effect
admission boundaries, and makes no request/task/item fanout. No-build remains
the simplest current solution: cadence stays absent under D53.

## Evidence classification

### Verified repository facts

- [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md) keeps source
  cancellation live until each channel-specific irreversible boundary and
  separates provider submission phase from provider outcome.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  keeps source applicability, presentation, engagement, group state, and
  durable history distinct.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  makes task state a projection and forbids task completion from owning source
  completion.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  makes Phase 12 access-request and current-access truth authoritative and
  already distinguishes ordinary retirement from urgent withdrawal.
- [Phase 12](./phase-12-full-role-permission-configuration.md) owns D43 request,
  D44 responsibility, and the source policy/occurrence boundary.
- [Phase 17](./phase-17-system-messages-template-management.md) owns role-safe
  item presentation and engagement; the [manifest](./phase-17-system-message-executable-manifest.md)
  and [census](./phase-17-system-message-census-2026-07-19.md) contain no D55
  executable artifact and remain at 20 Target Live candidates and 20 Reserved
  keys.
- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
  requires server-derived identity/Tenant/role, application authorization,
  capability enforcement, RLS defense in depth, and server-only sensitive
  operations.
- [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  keeps permission-sensitive operations server-side and distinct product
  surfaces role-scoped.
- [Platform Principles](../../../openspec/specs/platform-principles/spec.md)
  prioritizes Tenant/permission safety, accessibility, clarity, and reliability.
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
  makes product records, claims, authorization, and idempotency authoritative;
  executors remain identifier-only.
- Repository search found no D55 runtime, safety disposition, timing-profile
  schema, Access requests settings route, or courtesy-reminder key in `apps/`,
  `packages/`, `supabase/`, or merged OpenSpec requirements.

### Verified current official evidence

| Primary source                                                                                  | Verified modern practice                                                                                                               | D55 application                                                                                              | Boundary                                                                           |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)                   | CM-5 restricts and audits system changes; SI-17 calls for predefined fail-safe procedures and operator guidance.                       | Publish through exact least-privilege authority, immutable audit, named runbook, and fail-closed behavior.   | NIST does not choose Core's profile model or Tenant UX.                            |
| [LaunchDarkly kill-switch guidance](https://launchdarkly.com/docs/home/flags/killswitch)        | Permanent safety switches should be simple and avoid complex targeting rules.                                                          | One exact revision-wide narrowing disposition is safer than per-Tenant targeting.                            | LaunchDarkly is a comparator, not Core's source of truth or a required dependency. |
| [LaunchDarkly audit-log API](https://launchdarkly.com/docs/api/audit-log)                       | Operational configuration changes need queryable change history.                                                                       | Preserve exact actor, target, reason/evidence reference, command receipt, and review.                        | A vendor audit log cannot replace Core product audit or database constraints.      |
| [W3C Forms tutorial](https://www.w3.org/WAI/tutorials/forms/)                                   | Native labels, fieldsets, instructions, and feedback improve comprehension and assistive-technology use.                               | Use a native replacement fieldset with persistent explanation, not a custom picker.                          | W3C does not determine policy meaning or visual tokens.                            |
| [WAI keyboard guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)          | Disabled native controls leave the tab sequence; discoverability and focus treatment require intentional design.                       | Show the withdrawn selection as static labeled status, not an unexplained disabled radio.                    | Exact behavior still requires browser/AT testing.                                  |
| [WAI status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Dynamic outcomes should be programmatically exposed without stealing focus or creating unnecessary interruption.                       | Save receipts/errors may use a scoped polite status; withdrawal itself creates no focus-stealing alert.      | A status region does not replace persistent page state.                            |
| [USWDS form guidance](https://designsystem.digital.gov/components/form/)                        | Contextual helper text and inline validation reduce form errors; disabled options can explain genuine unavailability in limited cases. | Core uses clearer static current-state context and selectable replacements, avoiding a discoverability trap. | Core retains Base Maia/Base UI rather than importing USWDS components.             |

### Reasonable inferences and product judgments

- A single exact-profile disposition is the smallest reliable containment unit
  because the evidence and immutable runtime meaning are revision-specific.
- The authority model must balance prompt containment with independent control,
  but repository evidence does not decide whether the second human acts before
  or after containment; D56 must choose rather than D55 smuggling in a role.
- A static selected/effective split is clearer than a checked-but-disabled radio:
  it tells the truth without implying that an unavailable value can be saved.
- No proactive Tenant fanout is proportionate for an optional courtesy reminder;
  a separate governed safety communication remains possible if a future incident
  creates a factual need.

### Assumptions and unresolved unknowns

- **Unknown:** the exact authorized-human assurance and registered-trigger/
  evidence rule is unresolved and blocks profile activation; D56 must decide it.
- **Assumption:** the authoritative product database can serialize fence
  publication with D43/D49/effect admission without a network dependency.
- **Unknown:** no timing pair, recipient demand, volume, or performance budget
  has passed D47; D55 therefore states invariants, not speculative thresholds.
- **Unknown:** external courtesy delivery remains unadmitted after D54 and is a
  later founder decision after D56.

## Exact domain model

### Canonical terms

**Access-review timing-profile safety withdrawal:** the irreversible platform
safety disposition that makes one exact activated timing-profile revision
effectively Off everywhere without rewriting any Tenant's selected head. It
blocks new and unreleased reminder effects; recovery requires a separately
activated successor and deliberate Tenant selection.

**Selected access-review timing-policy head:** the Tenant-authored current
cadence intent: absence or an explicit Off revision, or a reference to one
activated profile identity/revision. Platform withdrawal never changes it.

**Effective access-review cadence disposition:** the currently executable
server-derived result of the selected head after stricter platform safety
dispositions apply. It is Off for a withdrawn or unprovable revision and is not
a second Tenant selection.

The exact D56 registered trigger/evidence envelope and assurance workflow are
not named or decided here.

_Avoid:_ kill-flag-as-source, Tenant override, emergency Off policy, paused
profile, disabled Delivery Plan, global notification pause, provider recall,
automatic fallback, resumed profile, or synthetic Tenant choice.

### Ownership matrix

| Fact                                           | Authority                                                                        | Never authoritative                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Activated immutable pair/profile revision      | D47/D53 activation package and code-owned registry                               | Tenant row, research artifact alone, worker, provider, flag            |
| Selected access-review timing-policy head      | Phase 12 Tenant policy aggregate                                                 | Platform fence, UI state, support note, effective read model           |
| Access-review timing-profile safety withdrawal | Platform product database through a D56-qualified exact command                  | Tenant, browser, cache, workflow, Realtime, provider, third-party flag |
| Effective access-review cadence disposition    | Server-side Phase 12 evaluation of selected head plus current safety disposition | Stored synthetic Off head, UI, analytics, task/item state              |
| D43 request and pinned tuple                   | Phase 12 source commit                                                           | Fence, notification, task, provider outcome                            |
| D49 sealed cohort                              | Exact source occurrence transaction                                              | Fence, task assignee, item group, channel recipient query              |
| Descendant irreversible admission              | Product database under each registered step contract                             | Network response, provider timestamp, executor log                     |
| Local item engagement/history                  | ADR-0027 item and recipient engagement records                                   | Fence, request/task status, attention group                            |
| Provider outcome                               | Channel-specific delivery evidence                                               | Safety disposition or “send” intent                                    |

### Profile and fence state machine

```text
evidence candidate
  -> evidence-qualified proposal
  -> activated exact revision
       -> ordinarily retired exact revision
       -> safety-withdrawn exact revision (terminal)

ordinary retirement:
  no new selection/reselection
  preserved current Tenant heads still admit D43 work

safety withdrawal (from activated or ordinarily retired):
  no offering/selection/reselection/current-head admission/unreleased effect
  preserved Tenant heads and pinned history remain
  exact revision can never return
  recovery requires a separately activated successor and Tenant save
```

`safety-withdrawn` dominates `activated` and `ordinarily retired` for effective
behavior. It cannot transition to active, retired-only, cleared, paused, or
expired. Corrections and additional evidence append to the restricted
withdrawal evidence record without changing the exact target or committed
effect.

### Serialization and effect matrix

| Race or state at fence commit                               | Required result                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tenant save to target revision commits first                | Selected head may reference it; fence immediately derives effective Off.                                     |
| Fence commits before Tenant save                            | Save/reselect to target is rejected without changing the head.                                               |
| D43 source creation commits first                           | Request and pinned tuple remain; any later occurrence/effect must re-prove and fails.                        |
| Fence commits before D43 admission                          | Request may still be created, but no cadence admission/pin for the withdrawn profile produces reminder work. |
| D49 seal is uncommitted                                     | Seal cannot commit favorably; same occurrence records or derives safety-withdrawn/no-release.                |
| D49 cohort already sealed                                   | Cohort history remains; each unreleased descendant is suppressed.                                            |
| Local item not queryable                                    | Atomic release fails; no orphan item/group appears.                                                          |
| Local reminder already queryable                            | Only that child's active/unread applicability ends; independent Recent/audit history may remain.             |
| D44 initial item/task exists                                | It remains governed by D43 and unchanged.                                                                    |
| External step unprepared or prepared definitely unsubmitted | Suppress permanently; no provider call.                                                                      |
| External submission may have begun                          | Complete/reconcile only the one admitted call; no new I/O.                                                   |
| Client/cache/worker cannot prove fence state                | Fail closed for optional courtesy effects; preserve core access-review workflow.                             |
| Tenant explicitly saves Off                                 | Append truthful Tenant Off head even if safety reads are degraded.                                           |
| Tenant selects another profile                              | Require fresh selectable/nonwithdrawn proof and expected-head CAS.                                           |

### UX and accessibility contract

The settings route must preserve one visual and programmatic reading sequence:

1. **Courtesy reminders** heading and concise no-deadline helper.
2. Read-only **Current setting** with **Selected: [profile label]**, **Status:
   Unavailable for safety**, **Effective: Off**, and concise unchanged-work/
   no-restart text.
3. Secondary **Choose a new setting** action.
4. When invoked, the ordinary native vertical radio fieldset containing
   explicit Off and currently activated/selectable profiles only.
5. Ordinary Save and Cancel. No replacement is preselected; Save is disabled
   until a choice is deliberate and Cancel leaves the selected head intact.

This is a persistent inline status, not a toast or transient live announcement.
The summary is not an interactive disabled card and does not masquerade as a
radio value. Visible labels and accessible names agree. Helper and error text
are associated programmatically. The page preserves keyboard order, visible
focus, target size, error recovery, forced colors, text spacing, 400-percent
zoom/320-CSS-pixel reflow, RTL/CJK/long localization, screen reader operation,
touch, reduced motion, low bandwidth, and reconnect. It uses Core's Base Maia,
Base UI, Zinc-derived semantic tokens, and shared `@asym/ui` ownership; no new
design system or app-local primitive is admitted.

Tenant-facing copy does not disclose incident details, another Tenant,
affected recipient/request counts, internal evidence, provider state, or the
identity of the platform actor. A Tenant audit view may show the safe fact that
the selected revision was withdrawn by Asym and when, derived from the global
disposition; it must not copy a fabricated audit event into every Tenant.

## Normative requirements

### D55-R1 — Documentation-only boundary

D55 changes governing documentation only. The complete fence contract must be
part of the same later activation package as the first selectable timing profile;
no dormant row, flag, schema, UI, job, key, OpenSpec placeholder, or telemetry
exists before then.

### D55-R2 — Exact scope

One disposition targets exactly one immutable activated profile identity and
revision in one product environment. It cannot target timing values, Tenants,
segments, requests, roles, channels, providers, workers, or text by heuristic.

### D55-R3 — D56 evidence dependency

D55 cannot actuate from an unreviewed complaint, analytic, worker, provider,
flag, or automation signal. D56 must define the registered trigger/evidence
reference and assurance rule that distinguishes safety withdrawal from ordinary
retirement or investigation; no profile activates before it does.

### D55-R4 — D56 authority dependency

Only the future D56-qualified trusted server command may engage withdrawal.
D55 pre-authorizes no operator role or review timing. Tenant admins,
`permissions.manage_grants`, support/impersonation, role strings, clients,
workers, providers, flags, and `service_role` alone are explicitly insufficient.

### D55-R5 — Monotonic terminal disposition

The successful disposition is immutable, append-only, nonexpiring, and terminal
for the exact revision. It cannot be updated, deleted, cleared, scheduled,
targeted, or converted to ordinary retirement; a successor is a new revision.

### D55-R6 — Ordinary retirement remains distinct

Ordinary retirement only prevents new selection/reselection and leaves
current-head prospective D43 admission unchanged. Urgent withdrawal additionally
blocks current-head admission and unreleased descendants; neither rewrites
history.

### D55-R7 — Selected and effective truth

The **Selected access-review timing-policy head** remains authoritative and
unchanged. The **Effective access-review cadence disposition** is derived
server-side; a withdrawn selected revision yields Off without a
synthetic Tenant policy write, actor, reason, or timestamp.

### D55-R8 — Fail-closed evaluation

Every favorable reminder boundary requires fresh authoritative proof that its
exact profile revision is not withdrawn. Missing, stale, malformed, unsupported,
or unavailable safety proof denies only the optional courtesy effect.

### D55-R9 — D43 serialization

Fence publication and D43 cadence admission produce one defensible product-
database order. Fence-first denies admission; admission-first preserves the
pinned tuple while every later boundary still rechecks the fence.

### D55-R10 — D49 source occurrence

An uncommitted D49 occurrence/cohort seal for the withdrawn revision cannot
commit favorably and terminally closes or derives **safety-withdrawn/no-release**
without being relabeled proved zero, D52 expired, D51 Tenant Off, or source-
resolved. A prior sealed cohort remains immutable history, but it authorizes no
still-unreleased descendant after withdrawal.

### D55-R11 — Plan and descendant gate

Plan compilation and every member/step irreversible admission independently
re-prove the exact disposition. A favorable sibling, channel, task, item, or
worker result cannot authorize another descendant.

### D55-R12 — Released local item

A D54 reminder child released before withdrawal ends active/unread contribution
through its registered source-applicability rule only. No engagement, sibling,
group, task, request, access, or authorized history is fabricated or rewritten.
Generic non-unread Recent/audit history remains only while its decoder,
renderer, privacy, and authorization contract is safe; a shared presentation/
content/privacy defect invokes its own Phase 17 containment rather than being
misrepresented as a timing-profile effect.

### D55-R13 — External ambiguity

Prepared-definitely-unsubmitted external work is permanently suppressed. A
submission-may-have-begun step may finish/reconcile only its one admitted call
and can never recall, retry, follow up, replace, rekey, resend, or fall back.

### D55-R14 — Core workflow continuity

Withdrawal never blocks, resolves, withdraws, removes, or mutates the D43
request, D44 routing/initial attention, ADR-0183 task, current grant, Effective
Access, or authorized review action.

### D55-R15 — No mass fanout

The fence commit is O(1) in Tenant/request/effect count and performs no Tenant
census, head rewrite, request/member update, task/item/message creation,
notification, provider call, or synchronous projection cleanup.

### D55-R16 — Tenant save concurrency

Tenant policy saves use expected-head concurrency and current target validation.
Fence-first rejects the withdrawn target; save-first preserves authorship but
the fence derives Off. Duplicate/lost-response replay returns one receipt.

### D55-R17 — Replacement selection

Explicit Off is always a safe narrowing; from a withdrawn selected revision it
is a real D51 Active-to-Off selected-head transition and advances the Tenant
cancellation epoch even though effective behavior was already Off. Any non-Off
save requires current proof of exact activated, compatible, selectable,
nonretired, nonwithdrawn target; no fallback or successor is selected
automatically.

### D55-R18 — Database integrity

The eventual product store enforces immutable exact profile/environment
reference, unique terminal disposition, trusted database commit time, safe
reason/evidence reference, restrictive deletes, and append-only audit through
constraints or an equivalent single mutation boundary.

### D55-R19 — Authorization and RLS

Browser writes are revoked. Application authorization is primary; RLS/grants,
both `USING` and `WITH CHECK`, functions/RPCs/views, and privileged service paths
independently prevent unauthorized, cross-environment, or target-changing writes.

### D55-R20 — Trusted attribution and privacy

Actor, authority, environment, target, commit instant, and review attribution
come from trusted server context. Tenant UI, logs, traces, exports, notifications,
and analytics receive only minimized safe status, never protected evidence.

### D55-R21 — Calm truthful settings UX

The future settings page shows one read-only Current setting summary with
separate Selected, Status, and Effective facts, explains that current access-
review work/access remains unchanged and the setting will not restart, and
offers one secondary explicit replacement flow without alarmist or blaming
language.

### D55-R22 — Native accessible replacement form

The withdrawn profile is not an enabled, checked, or unexplained disabled radio.
**Choose a new setting** opens a native labeled fieldset with no preselection,
associated help/errors, explicit Save/Cancel, and Core's tested shared design
primitives.

### D55-R23 — Inclusive resilient experience

Equivalent meaning and operation must survive keyboard, screen reader, visible
focus, forced colors, touch, 400-percent zoom/320-CSS-pixel reflow, text spacing,
reduced motion, localization/RTL/CJK, mobile, low bandwidth, and reconnect.

### D55-R24 — Cache and Realtime safety

No favorable stale cache or Realtime event can outrank the product disposition.
Caches may preserve or tighten Off only; uncertain/expired reads fail closed,
and Realtime merely invalidates identifiers without carrying authority.

### D55-R25 — Idempotency and repair

Semantic idempotency binds exact environment, profile revision, command meaning,
and disposition identity. Repair rebuilds projections from product truth,
quarantines contradictions, and never force-clears or fabricates Tenant heads.

### D55-R26 — Mixed-version compatibility

Every supported reader, source writer, compiler, claimant, renderer, and adapter
must understand and re-prove the disposition before any profile activates.
Unknown versions fail closed; rollback retains disposition and decoders.

### D55-R27 — Rollout order

The future package deploys durable decoder/store and fail-closed readers first,
all favorable writers/claims second, settings/operations third, and selectable
profile activation last, with synthetic nonproduction proof and a roll-forward
incident path.

### D55-R28 — Bounded performance

Fence evaluation uses indexed exact-profile lookup or an equivalently bounded
authoritative path and batched reconciliation. No request-count scan, per-Tenant
copy, cross-service flag call, N+1 authorization loop, or unbounded offset job
may sit on admission.

### D55-R29 — Operations and restoration

The runbook incorporates D56's eventual engage authority, trigger/evidence,
assurance/review timing, plus verification, containment, reconciliation,
monitoring, and successor process. The same exact revision never resumes;
Tenants deliberately select a separately activated successor or Off.

### D55-R30 — Semantic ceiling and traceability

D55 authorizes only exact-profile urgent harm containment. It creates no generic
override, emergency access, feature targeting, provider pause, notification
preference, policy engine, SLA, or mass communication; every requirement traces
through glossary, ADRs, PRDs, OpenSpec, tickets, code, tests, and release proof.

## Ruthless adversarial review

The following categories judge the founder's short Option 1 wording before the
requirements above are applied. Every category has a material concern; the
specified amendments preserve the direction while making it safe and testable.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Core could build an emergency-control subsystem before any timing profile exists, or treat ordinary low-confidence complaints as global safety incidents.             |
| Why it matters           | Dormant machinery creates maintenance and UX surface without user value; overuse erodes Tenant trust and bypasses ordinary retirement.                                |
| Severity                 | High                                                                                                                                                                  |
| Likelihood               | Medium without an explicit threshold; zero current profiles make premature scaffolding especially tempting.                                                           |
| Evidence or reasoning    | D53 makes Off-by-absence complete and blocks activation until withdrawal is settled; NIST distinguishes controlled fail-safe procedures from ad hoc change.           |
| Effect on current answer | Narrows, but does not invalidate, Option 1.                                                                                                                           |
| Best permanent fix       | Keep D55 documentation-only; admit one narrow fence only with the first activated profile after D56 defines the exact authority and registered trigger/evidence rule. |
| Exact language to add    | **D55-R1** and **D55-R3–R4**: no artifact or activation before the separate D56 actuation contract closes.                                                            |

### 2. Brittleness

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | A fence keyed by duration, label, current registry row, message key, provider, or feature-flag name misses renamed/successor variants or blocks unrelated behavior.               |
| Why it matters           | Harm containment becomes dependent on mutable presentation or deployment details and can silently fail under upgrades.                                                            |
| Severity                 | Critical                                                                                                                                                                          |
| Likelihood               | High if “profile” is not exact.                                                                                                                                                   |
| Evidence or reasoning    | D53 profiles are immutable identity/revision contracts and D48–D54 pin exact source/effect facts; LaunchDarkly recommends simple kill-switch targeting rather than complex rules. |
| Effect on current answer | Materially narrows identity and scope.                                                                                                                                            |
| Best permanent fix       | Bind one immutable environment + activated profile revision and derive all downstream denial from it.                                                                             |
| Exact language to add    | **D55-R2**, **D55-R5**, and **D55-R24**: no heuristic or favorable stale-cache targeting; exact revision is terminal.                                                             |

### 3. Technical debt

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Core could add a generic override engine, third-party flag dependency, per-channel pause, or duplicate cancellation workflow.               |
| Why it matters           | Multiple authorities drift, every future feature inherits unexplained precedence, and cleanup becomes harder than the one reminder feature. |
| Severity                 | High                                                                                                                                        |
| Likelihood               | Medium-High because “safety fence” resembles a feature-flag requirement.                                                                    |
| Evidence or reasoning    | Phase 12, ADR-0026/0027/0183/0184 already own source, effects, presentation, task, and authorization truth.                                 |
| Effect on current answer | Changes architecture, not outcome.                                                                                                          |
| Best permanent fix       | Add one profile-specific disposition to existing product admission checks; reuse existing effect boundaries and audit.                      |
| Exact language to add    | **D55-R11**, **D55-R15**, and **D55-R30**: no second coordinator, policy engine, provider pause, or generic flag source.                    |

### 4. Edge cases

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Withdrawal can race D43 creation, D49 zero/indeterminate/sealed states, D51 Off, D52 expiry, local release, external attempt admission, Tenant save, or authorization loss. |
| Why it matters           | Two individually reasonable actions could create a late reminder, lose history, or report a false Tenant choice.                                                            |
| Severity                 | Critical                                                                                                                                                                    |
| Likelihood               | High aggregate in a durable asynchronous system.                                                                                                                            |
| Evidence or reasoning    | D48–D54 deliberately define each boundary independently; ADR-0026 separates external submission admission from outcome.                                                     |
| Effect on current answer | Requires the explicit serialization/effect matrix.                                                                                                                          |
| Best permanent fix       | Re-prove the fence at every favorable product boundary and preserve admission-first history.                                                                                |
| Exact language to add    | **D55-R9–R13** and **D55-R16**: fence-first denies; irreversible-admission-first preserves only the exact admitted effect.                                                  |

### 5. Footguns

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What could go wrong      | Operators could clear the fence, target a Tenant subset, edit the reason/target, bulk-write Off, or press an instant UI toggle without understanding scope.  |
| Why it matters           | A simple operational mistake could restart harm or falsify thousands of Tenant audit histories.                                                              |
| Severity                 | Critical                                                                                                                                                     |
| Likelihood               | Medium without hard constraints and purpose-specific UX.                                                                                                     |
| Evidence or reasoning    | Mutable feature flags are designed to toggle; D55 instead needs a terminal product disposition and trusted attribution.                                      |
| Effect on current answer | Changes “switch” into an append-only command with no reverse action.                                                                                         |
| Best permanent fix       | Remove clear/update/targeting paths, require the future D56-qualified trusted command and idempotent receipt, and require successor activation for recovery. |
| Exact language to add    | **D55-R4–R5**, **D55-R18**, and **D55-R29**: D55 pre-authorizes no role; no clear/delete/expiry or per-Tenant targeting.                                     |

### 6. Tenant safety

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Bulk writes, caches, reports, derived effective values, or support tools could mix Tenant heads, attribute platform action to a Tenant actor, or expose which Tenants selected the profile. |
| Why it matters           | Cross-Tenant disclosure and false policy authorship violate Core's highest-priority invariant.                                                                                              |
| Severity                 | Critical                                                                                                                                                                                    |
| Likelihood               | Medium if a global disposition is copied into Tenant rows or analytics.                                                                                                                     |
| Evidence or reasoning    | Identity and Access requires application checks plus Tenant-scoped RLS; Option 2's fanout creates exactly this risk.                                                                        |
| Effect on current answer | Strengthens head preservation and read-model isolation.                                                                                                                                     |
| Best permanent fix       | Keep one global exact disposition, leave Tenant heads untouched, authorize every Tenant read separately, and expose only safe derived status.                                               |
| Exact language to add    | **D55-R7**, **D55-R15**, **D55-R19–R20**: no cross-Tenant census/fanout or synthetic actor.                                                                                                 |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Caller-controlled actor/target/reason, missing composite constraints, permissive update/delete grants, incomplete `WITH CHECK`, or service-role bypass could publish, retarget, or clear a fence. |
| Why it matters           | An allowed mutation could turn an authorized exact narrowing into a forbidden cross-environment/global state change.                                                                              |
| Severity                 | Critical                                                                                                                                                                                          |
| Likelihood               | Medium until schema and policies are proved.                                                                                                                                                      |
| Evidence or reasoning    | Core mandates server authorization as primary and RLS defense in depth; the current repo contains no D55 policy to inspect.                                                                       |
| Effect on current answer | Adds mandatory future data/auth proof without freezing table shape.                                                                                                                               |
| Best permanent fix       | One server mutation boundary, immutable exact references/unique constraint/restrictive delete, revoked browser grants, complete `USING`/`WITH CHECK`, and privileged-path parity.                 |
| Exact language to add    | **D55-R18–R20**: trusted context supplies target/actor/time; no update/delete; every path enforces identical scope.                                                                               |

### 8. Overengineering

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What could go wrong      | A policy language, condition builder, staged approvals service, automated harm classifier, Tenant exception list, scheduled expiry, or universal kill-switch UI could be added “for the future.” |
| Why it matters           | Speculative flexibility increases incident-time ambiguity, surface area, and support burden.                                                                                                     |
| Severity                 | High                                                                                                                                                                                             |
| Likelihood               | High if modern feature-management products are copied literally.                                                                                                                                 |
| Evidence or reasoning    | D55 has one exact feature/revision and a binary terminal narrowing; vendor targeting breadth is neither needed nor repository authority.                                                         |
| Effect on current answer | Aggressively narrows implementation.                                                                                                                                                             |
| Best permanent fix       | One exact append command, one evaluator predicate, one settings state, and existing audit/reconciliation.                                                                                        |
| Exact language to add    | **D55-R2**, **D55-R15**, **D55-R30**: no targeting, engine, scheduler, exception, or approval platform.                                                                                          |

### 9. UX/UI and user friction

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | The UI could show the withdrawn profile as selected/effective, silently check Off, hide the old choice entirely, trap it as a disabled radio, force a modal, or disclose alarming incident detail. |
| Why it matters           | Tenant admins cannot tell what they chose, what is happening now, or whether saving changes policy; ordinary users receive unnecessary noise.                                                      |
| Severity                 | High                                                                                                                                                                                               |
| Likelihood               | High without a prescribed selected/effective presentation.                                                                                                                                         |
| Evidence or reasoning    | D53 already separates retired current state from selectable choices; W3C favors native labeled controls and persistent understandable feedback.                                                    |
| Effect on current answer | Adds a precise calm replacement journey.                                                                                                                                                           |
| Best permanent fix       | Read-only Current setting with exact Selected/Status/Effective facts, secondary Choose a new setting, native unselected fieldset, explicit Save/Cancel, and no proactive fanout.                   |
| Exact language to add    | **D55-R21–R23** and the UX contract: withdrawn state is context, not a selectable/disabled radio or alert storm.                                                                                   |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | The effective Off read model, a feature flag, a task/item, or a provider pause could become write authority; Tenant saved policy and platform safety facts could collapse into one Boolean. |
| Why it matters           | Dual ownership causes circular synchronization and destroys who selected what and why.                                                                                                      |
| Severity                 | Critical                                                                                                                                                                                    |
| Likelihood               | High if “current setting” remains overloaded.                                                                                                                                               |
| Evidence or reasoning    | D53 defines selected heads and pinned tuples; ADRs separate source, task, presentation, engagement, and delivery evidence.                                                                  |
| Effect on current answer | Requires explicit saved-selection/effective-cadence terms and invariants.                                                                                                                   |
| Best permanent fix       | Phase 12 owns Tenant heads/evaluation; platform store owns fence; projections derive and never write either.                                                                                |
| Exact language to add    | **D55-R6–R8**, ownership matrix, and **D55-R14**: fence affects only optional courtesy admission.                                                                                           |

### 11. Hidden coupling

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Identity or evaluation could depend on UI copy, timing seconds, message key, route, provider, task ID, worker version, deployment flag, or analytics name. |
| Why it matters           | Content, routing, provider, and implementation changes could accidentally clear or miss containment.                                                       |
| Severity                 | High                                                                                                                                                       |
| Likelihood               | Medium-High without explicit negative constraints.                                                                                                         |
| Evidence or reasoning    | D47–D55 intentionally separate exact source profile, safety withdrawal, occurrence, recipients, presentation, and channel contracts.                       |
| Effect on current answer | Narrows keys and dependencies.                                                                                                                             |
| Best permanent fix       | Use only exact activated profile identity/revision/environment and authoritative product state.                                                            |
| Exact language to add    | **D55-R2**, **D55-R11**, **D55-R24**: no route/copy/channel/worker/cache fact enters disposition identity.                                                 |

### 12. Failure modes

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Commit succeeds but response is lost; some workers miss invalidation; group/source-end projection fails; provider result is ambiguous; safety store is unavailable; reconciliation runs late. |
| Why it matters           | Operators may retry a different action, users may see stale active attention, or external delivery may duplicate.                                                                             |
| Severity                 | Critical                                                                                                                                                                                      |
| Likelihood               | Medium individually, High aggregate.                                                                                                                                                          |
| Evidence or reasoning    | ADR-0026 treats lost responses and provider ambiguity explicitly; Phase 17 projections are rebuildable and nonauthoritative.                                                                  |
| Effect on current answer | Requires durable idempotency, fail-closed reads, and source-derived repair.                                                                                                                   |
| Best permanent fix       | Same command returns same receipt; all favorable boundaries recheck; projection repair is bounded; post-admission external work only reconciles.                                              |
| Exact language to add    | **D55-R8**, **D55-R12–R13**, **D55-R24–R25**.                                                                                                                                                 |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | A timestamp comparison or last-write-wins update could order Tenant save, D43 creation, occurrence seal, fence, expiry, and effect release inconsistently; duplicate commands could create multiple dispositions. |
| Why it matters           | The same history can yield both sent and suppressed outcomes depending on worker order.                                                                                                                           |
| Severity                 | Critical                                                                                                                                                                                                          |
| Likelihood               | High without shared serialization.                                                                                                                                                                                |
| Evidence or reasoning    | D48 and D51 reject wall-clock classification and require defensible business order; D52 uses fresh claim instants at each boundary.                                                                               |
| Effect on current answer | Adds the terminal state machine and boundary matrix.                                                                                                                                                              |
| Best permanent fix       | Product-database serialization/CAS, exact semantic uniqueness, no clear transition, fresh fence proof at every favorable boundary.                                                                                |
| Exact language to add    | **D55-R5**, **D55-R9–R11**, **D55-R16**, **D55-R25**.                                                                                                                                                             |

### 14. Data integrity risks

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Duplicate or retargeted fences, orphan evidence, missing profile decoder, synthetic Off heads, stale effective projections, or cascaded deletion can corrupt history and reporting. |
| Why it matters           | Staff cannot prove whether an effect was lawfully admitted or why a Tenant became effectively Off.                                                                                  |
| Severity                 | Critical                                                                                                                                                                            |
| Likelihood               | Medium without constraints and reconciliation.                                                                                                                                      |
| Evidence or reasoning    | D53 requires immutable profile linkage; D54 requires product-database uniqueness and rebuildable projection.                                                                        |
| Effect on current answer | Adds integrity and quarantine requirements.                                                                                                                                         |
| Best permanent fix       | Unique exact terminal disposition, restrictive references, append-only audit, decoder retention, deterministic projection rebuild, contradiction quarantine.                        |
| Exact language to add    | **D55-R18**, **D55-R25–R26**.                                                                                                                                                       |

### 15. Security and privacy risks

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Unauthorized platform or support actors can disable policy; incident evidence, affected Tenants, sensitive access/ministry details, or operator identity leak through UI/logs/exports. |
| Why it matters           | The control itself becomes a denial-of-service and privacy-disclosure vector.                                                                                                          |
| Severity                 | Critical                                                                                                                                                                               |
| Likelihood               | Medium absent least privilege and minimization.                                                                                                                                        |
| Evidence or reasoning    | Identity and Access requires capability checks/server boundaries; access-review facts can expose sensitive people and ministry context.                                                |
| Effect on current answer | Makes D56's authority/evidence decision a hard activation dependency while retaining trusted attribution and safe presentation.                                                        |
| Best permanent fix       | D56-qualified trusted command, protected evidence reference, safe Tenant projection, audit access control, and retention.                                                              |
| Exact language to add    | **D55-R3–R4**, **D55-R19–R20**: no Tenant/support/role-string/worker/provider/flag/`service_role`-alone authority.                                                                     |

### 16. Scalability and performance risks

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | A global safety action scans/writes every Tenant/request/item, or each admission makes remote flag calls/N+1 authorization queries; a large Tenant delays containment. |
| Why it matters           | The fence could be slowest precisely during an incident and partial fanout would create inconsistent protection.                                                       |
| Severity                 | High                                                                                                                                                                   |
| Likelihood               | Medium under the chosen model; High under Option 2.                                                                                                                    |
| Evidence or reasoning    | One exact profile disposition is independent of affected cardinality; current profile count is zero, so quantitative latency claims would be invented.                 |
| Effect on current answer | Requires O(1) authority state and production-shaped measured SLOs at activation.                                                                                       |
| Best permanent fix       | Indexed exact lookup/local transaction, batch reconciliation, no Tenant census/fanout or remote dependency, load test largest supported cohort.                        |
| Exact language to add    | **D55-R15**, **D55-R28**; activation sets measured budgets rather than vague “fast” claims.                                                                            |

### 17. Operational burden

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | On-call staff need SQL, undocumented flag consoles, manual Tenant repairs, or channel-specific cleanup; no one knows whether or how to restore. |
| Why it matters           | Incident response becomes tribal, error-prone, and slow.                                                                                        |
| Severity                 | High                                                                                                                                            |
| Likelihood               | Medium without a tested runbook and one control surface.                                                                                        |
| Evidence or reasoning    | NIST SI-17 explicitly calls for fail-safe procedures and operator instructions.                                                                 |
| Effect on current answer | Adds a pre-activation operational gate.                                                                                                         |
| Best permanent fix       | One purpose command/receipt, deterministic verification and reconciliation, no direct SQL, terminal revision, successor-only recovery.          |
| Exact language to add    | **D55-R25**, **D55-R27**, **D55-R29**.                                                                                                          |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Logs show a worker stopped while D43 admissions or provider calls continue; no durable link joins the restricted evidence reference, disposition, blocked boundary, and earlier effect. |
| Why it matters           | Core cannot prove containment, diagnose leaks, or distinguish permitted admission-first outcomes from defects.                                                                          |
| Severity                 | Critical                                                                                                                                                                                |
| Likelihood               | Medium without business audit and invariant monitors.                                                                                                                                   |
| Evidence or reasoning    | LaunchDarkly exposes change history, but Core requires stronger product lineage than operational logs.                                                                                  |
| Effect on current answer | Adds durable audit plus zero-tolerance monitors.                                                                                                                                        |
| Best permanent fix       | Correlate exact disposition to source/effect IDs with minimized business audit; monitor post-fence favorable boundaries independently of executor health.                               |
| Exact language to add    | **D55-R20**, **D55-R25**, **D55-R29** and the named monitor table below.                                                                                                                |

### 19. Dependency and integration risks

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What could go wrong      | LaunchDarkly, Inngest, Realtime, email provider, browser cache, or webhook becomes the fence source; outage, rate limit, or contradictory event allows work. |
| Why it matters           | Optional external infrastructure can bypass a critical product-safety boundary.                                                                              |
| Severity                 | Critical                                                                                                                                                     |
| Likelihood               | Medium if a generic vendor flag is adopted.                                                                                                                  |
| Evidence or reasoning    | Workflow Orchestration keeps executors identifier-only; ADR-0026 keeps provider evidence channel-specific and nonauthoritative.                              |
| Effect on current answer | Rejects an external feature-management dependency.                                                                                                           |
| Best permanent fix       | Product-database disposition and local fail-closed checks; dependencies only wake, invalidate, deliver an admitted call, or report evidence.                 |
| Exact language to add    | **D55-R8**, **D55-R13**, **D55-R24**, **D55-R30**.                                                                                                           |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Old writers ignore the fence, new writers see an absent legacy row as clear, rollback removes a decoder, activation precedes operations/UI, or a backfill fabricates history. |
| Why it matters           | A supposedly withdrawn profile can continue producing effects during mixed deployment or rollback.                                                                            |
| Severity                 | Critical                                                                                                                                                                      |
| Likelihood               | Medium without activation ordering; profile cannot safely ship first.                                                                                                         |
| Evidence or reasoning    | D53 already makes mixed-version and disable/repair proof activation prerequisites.                                                                                            |
| Effect on current answer | Makes D55 a hard pre-activation compatibility gate.                                                                                                                           |
| Best permanent fix       | Fence-aware readers first, favorable writers next, UX/runbook next, profile activation last; unknown fails closed; roll forward with decoder retention and no backfill.       |
| Exact language to add    | **D55-R1**, **D55-R26–R27**.                                                                                                                                                  |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | Tests check only a Boolean evaluator or settings screenshot and miss cross-Tenant scope, races, lost responses, item history, provider ambiguity, old binaries, or accessibility. |
| Why it matters           | Green tests would not prove the user-visible or domain outcome.                                                                                                                   |
| Severity                 | Critical                                                                                                                                                                          |
| Likelihood               | High without explicit production-shaped acceptance criteria.                                                                                                                      |
| Evidence or reasoning    | D47–D55 require source/effect outcome proof and repository traceability, not implementation-detail coverage alone.                                                                |
| Effect on current answer | Adds 120 falsifiable criteria and matrix tests.                                                                                                                                   |
| Best permanent fix       | Trace D55 IDs through ADR/PRD/OpenSpec/tickets/code/tests/release evidence; test positive, negative, boundary, auth, concurrency, migration, a11y, and load outcomes.             |
| Exact language to add    | **D55-R30** and **D55-AC001–D55-AC120** below.                                                                                                                                    |

### 22. Other development hazards

**Material concern: Yes.**

| Required field           | Finding                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What could go wrong      | “Safety” becomes a bypass for product disagreement, support convenience, Tenant-specific disablement, censorship of audit history, emergency access, or unrelated feature rollout. |
| Why it matters           | A narrowly justified control becomes an unreviewed administrative superpower.                                                                                                      |
| Severity                 | High                                                                                                                                                                               |
| Likelihood               | Medium over time if the semantic ceiling is not explicit.                                                                                                                          |
| Evidence or reasoning    | Generic safety labels invite scope creep; Core's governing ADRs deliberately give each domain fact one owner.                                                                      |
| Effect on current answer | Adds strict non-goals and makes the unresolved D56 assurance rule explicit.                                                                                                        |
| Best permanent fix       | Closed harm classes, exact profile target, protected reason, append-only history, no per-Tenant targeting, and separate decisions for other features.                              |
| Exact language to add    | **D55-R2–R5**, **D55-R20**, **D55-R30**.                                                                                                                                           |

## Acceptance criteria and proof portfolio

### Documentation and activation boundary

- **D55-AC001:** A repository scan after D55 finds no new executable timing
  profile, safety disposition, flag, schema, migration, key, plan, step, worker,
  route, UI, or telemetry artifact attributable to this decision.
- **D55-AC002:** The future first-profile activation gate fails if the exact D55
  disposition contract, authority, evaluator, UI, runbook, and production proof
  are absent or incomplete.
- **D55-AC003:** D55 alone leaves the Phase 17 census at exactly 20 Target Live
  candidates and 20 Reserved keys and introduces no placeholder reminder key.
- **D55-AC004:** Before a profile activates, all user surfaces remain unchanged;
  no Off-only setting, unavailable card, teaser, waitlist, help link, or disabled
  control appears.

### Exact target and identity

- **D55-AC005:** One successful command identifies exactly one product
  environment and one activated immutable profile identity/revision.
- **D55-AC006:** A request that supplies only seconds, label, message key, route,
  provider, worker, Tenant, or cohort cannot resolve or publish a disposition.
- **D55-AC007:** Two profiles with equal timing values remain independently
  targetable; withdrawing one does not affect the other.
- **D55-AC008:** The evaluator cannot broaden an exact disposition to another
  revision through name matching, “latest” lookup, inheritance, or fallback.

### D56 trigger/evidence dependency

- **D55-AC009:** The future release links the exact ratified D56 decision/
  contract revision and records its required stable safe reason class and
  restricted registered trigger/evidence reference or digest.
- **D55-AC010:** Missing, empty, malformed, unregistered, target-inconsistent,
  or otherwise D56-insufficient trigger/evidence fails before any disposition
  commits.
- **D55-AC011:** An automated metric, provider event, worker failure, support
  note, or one complaint may open investigation but cannot independently publish
  the disposition.
- **D55-AC012:** D56's ratified rule distinguishes safety-withdrawal evidence
  from product preference, ordinary defect/retirement, or investigation and is
  tested at the public command boundary.

### D56 authority and assurance dependency

- **D55-AC013:** Only the exact currently authenticated platform actor(s),
  purpose, assurance, and approval/review sequence later ratified by D56 can
  invoke or complete the command.
- **D55-AC014:** Tenant admins, support/impersonation sessions, workers,
  `permissions.manage_grants`, role strings, workers, providers, flags,
  automation, clients, and `service_role` alone are denied.
- **D55-AC015:** Actor, authority snapshot, environment, target, and commit time
  are derived from trusted server/database context and cannot be overridden by
  request fields.
- **D55-AC016:** No profile activates while D56 is unresolved; after resolution,
  tests prove its exact pre- or post-containment independent-human sequence and
  that no review result can clear/rewrite the withdrawal.

### Monotonic terminal state

- **D55-AC017:** Once committed, the exact revision remains safety-withdrawn
  across process restart, deployment, restore, replay, failover, and time.
- **D55-AC018:** No API, SQL grant, RPC, admin UI, flag, support tool, expiry,
  scheduler, or migration can update/delete/clear the disposition.
- **D55-AC019:** A second identical semantic command returns the same disposition
  and receipt without another business effect; changed immutable meaning
  conflicts.
- **D55-AC020:** Reuse requires a separately evidenced and activated successor
  profile revision; the exact withdrawn revision can never be offered again.

### Ordinary retirement distinction

- **D55-AC021:** Ordinary retirement removes the exact profile from new
  selection/reselection while a pre-existing selected head continues prospective
  D43 cadence admission.
- **D55-AC022:** Urgent withdrawal removes the exact profile from offering and
  additionally blocks current-head D43 admission and every unreleased descendant.
- **D55-AC023:** Retiring then safety-withdrawing the same revision yields the
  safety-withdrawn effective result without rewriting either historical fact.
- **D55-AC024:** Neither retirement nor withdrawal changes already pinned profile
  tuples, decoder availability, source history, or lawful effect evidence.

### Selected versus effective truth

- **D55-AC025:** After withdrawal, every affected Tenant selected head retains
  its original profile reference, actor, reason, revision, and commit evidence.
- **D55-AC026:** Server evaluation returns effective Off for the withdrawn
  selection without inserting an Off Tenant policy revision.
- **D55-AC027:** Tenant policy audit never attributes the platform disposition
  to a Tenant actor or claims the Tenant chose Off.
- **D55-AC028:** Reports and APIs expose **Selected access-review timing-policy
  head** and **Effective access-review cadence disposition** as distinct typed
  facts and cannot write a projection back into either source.

### Fail-closed evaluation

- **D55-AC029:** A valid favorable D43/D49/plan/member/step boundary commits only
  after current authoritative nonwithdrawn proof for its exact revision.
- **D55-AC030:** Missing row meaning, decode error, unsupported version,
  unavailable authoritative read, expired favorable cache, or contradictory
  state yields no new courtesy effect.
- **D55-AC031:** Fail-closed reminder evaluation does not deny creation/view/
  resolution of the D43 request, D44 initial attention/task, current access, or
  an explicit Tenant Off save.
- **D55-AC032:** Recovery from an unavailable safety read never catches up or
  revives a boundary that was not lawfully admitted while proof was uncertain.

### D43 concurrency

- **D55-AC033:** A concurrency test proves fence-first D43 creation can still
  create the valid request but records no cadence admission for the withdrawn
  revision.
- **D55-AC034:** A concurrency test proves D43-admission-first preserves its
  pinned tuple while subsequent D49 and descendant admission fail.
- **D55-AC035:** No browser timestamp, source `created_at`, fence `committed_at`,
  UUID order, queue time, or worker time substitutes for the serialized product
  order.
- **D55-AC036:** Lost-response replay of either winner returns the same source or
  disposition receipt and cannot invert the original order.

### D49 occurrence and cohort

- **D55-AC037:** Fence-first prevents an uncommitted D49 occurrence/cohort seal
  from producing a proved positive cohort or descendant and records/derives the
  distinct safety-withdrawn/no-release result.
- **D55-AC038:** A prior proved-zero, indeterminate, safety-withdrawn/no-release,
  or sealed result preserves its exact historical meaning and is not relabeled.
- **D55-AC039:** A cohort sealed before withdrawal remains immutable evidence,
  but each member still fails every unreleased local/external admission.
- **D55-AC040:** Later D44 routing, re-enable, successor activation, repair, or
  replay cannot create a second occurrence or broaden the old cohort.

### Plan and descendant boundaries

- **D55-AC041:** Plan compilation for a withdrawn exact revision produces no new
  releasable plan/member even if the occurrence was previously eligible.
- **D55-AC042:** Every member and Delivery Step re-proves the fence independently
  immediately before its registered irreversible admission.
- **D55-AC043:** A released sibling, successful channel, task assignment, item
  group, event, worker run, or provider acceptance cannot bypass another step's
  fence proof.
- **D55-AC044:** A crash after source/plan preparation but before irreversible
  admission leaves the exact descendant permanently suppressible after the
  fence.

### Released local presentation

- **D55-AC045:** A D54 reminder item queryable before withdrawal stops
  contributing active/unread attention after the registered source-end rule
  observes withdrawal.
- **D55-AC046:** Ending the reminder does not set `read`, `seen`, `archived`,
  dismissed, deleted, or task/source-completed evidence.
- **D55-AC047:** An eligible matching D44 initial child remains actionable and
  retains its engagement; the derived group count/state recomputes from the
  remaining presentable children.
- **D55-AC048:** Authorized Recent/audit history for the released reminder
  retains original occurrence/release/engagement/end evidence and never appears
  as newly unread on restoration; an incident affecting shared renderer/content/
  privacy uses the separately owned Phase 17 containment and does not rely on
  the timing-profile fence.

### External irreversible boundary

- **D55-AC049:** Unprepared or Prepared-definitely-unsubmitted external work
  makes no provider call after fence-first ordering.
- **D55-AC050:** Submission-may-have-begun work may complete/reconcile exactly
  the frozen already-admitted initial call and preserves independent outcome
  evidence.
- **D55-AC051:** Definitive rejection, timeout, ambiguous response, webhook,
  restart, credential repair, or provider recovery after withdrawal authorizes
  no retry, follow-up, replacement, rekey, resend, fallback, or recall claim.
- **D55-AC052:** Every future external channel must pass its own admission/
  finality/recovery proof; email semantics cannot be inherited by push or chat.

### Core workflow continuity

- **D55-AC053:** Withdrawal changes no D43 request state or decision and creates
  no synthetic withdrawal/resolution/no-longer-applicable source transition.
- **D55-AC054:** D44 coordinator membership, responsibility generation, initial
  item, and source-backed task remain governed by their own current source rules.
- **D55-AC055:** Current direct grant, Effective Access, capability, group
  membership, subject status, and authorization remain unchanged.
- **D55-AC056:** The typed Review action continues to reauthorize and open the
  pending source even when courtesy reminders are effectively Off.

### No fanout or side effects

- **D55-AC057:** Fence publication performs one bounded authoritative write/
  transition independent of Tenant, request, recipient, task, item, or plan
  count.
- **D55-AC058:** No synchronous or asynchronous operation rewrites every affected
  Tenant head merely to establish effective Off.
- **D55-AC059:** Publication creates no Tenant task, bell item, email, toast,
  inbox notification, provider call, policy-save receipt, or unread event.
- **D55-AC060:** Reconciliation may derive/repair status in bounded batches, but
  no favorable boundary waits for it and no partial batch defines truth.

### Tenant save concurrency and idempotency

- **D55-AC061:** Fence-first rejects a concurrent save targeting the withdrawn
  profile before the Tenant head changes.
- **D55-AC062:** Save-first may commit that authentic Tenant selection, after
  which effective evaluation returns Off at the fence order without another
  Tenant write.
- **D55-AC063:** Concurrent saves use expected-head comparison; exactly one
  compatible successor wins and stale attempts return a truthful conflict.
- **D55-AC064:** Same idempotency key/same policy meaning returns the same receipt;
  same key/different target or meaning is rejected.

### Replacement validation

- **D55-AC065:** An authorized Tenant can explicitly select Off even while the
  safety state cannot be read; from a withdrawn selected revision the successful
  save appends one truthful D51 Active-to-Off head and advances its cancellation
  epoch rather than collapsing into a no-op.
- **D55-AC066:** Any non-Off target is validated at commit as exact, activated,
  compatible, selectable, not ordinarily retired, and not safety-withdrawn.
- **D55-AC067:** Withdrawn, unknown, legacy, evidence-only, unsupported, retired,
  or disabled options are absent from target lookup and rejected if forged.
- **D55-AC068:** Successor activation never auto-maps, resumes, or changes an
  affected Tenant; explicit Tenant Save is required.

### Database integrity

- **D55-AC069:** The future schema or equivalent store enforces exact immutable
  environment/profile-revision reference and at most one terminal disposition.
- **D55-AC070:** Database time and trusted actor/context own commit attribution;
  nullable or caller-authored target/actor/environment fields cannot commit.
- **D55-AC071:** Update/delete/cascade operations cannot remove, retarget, or
  orphan the disposition, profile decoder, restricted evidence record, or
  required audit.
- **D55-AC072:** A property/invariant test rejects invalid combinations including
  cleared-withdrawn, selected-by-platform, cross-environment target, and active-
  after-withdrawal.

### Application authorization and RLS

- **D55-AC073:** Public/authenticated browser roles have no direct insert,
  update, delete, RPC, view, or storage path to the safety disposition/evidence.
- **D55-AC074:** Application authorization denies missing purpose, stale session,
  wrong environment, wrong target, and unsupported action before mutation.
- **D55-AC075:** RLS and grants independently enforce read/write scope with both
  `USING` and `WITH CHECK`; an allowed row cannot be transformed into a forbidden
  target/state.
- **D55-AC076:** Service-role, background, migration, support, and security-
  definer paths either call the same boundary or prove equivalent constraints,
  fixed `search_path`, attribution, and audit.

### Privacy and attribution

- **D55-AC077:** Tenant-facing status reveals only the safe product fact,
  affected policy label, effective Off result, and next action.
- **D55-AC078:** Incident details, evidence, affected Tenant/request/recipient
  counts, access reasons, capability/grant data, ministry/member-care facts, and
  secrets never enter ordinary UI, notification, analytics, or logs.
- **D55-AC079:** Protected withdrawal-evidence access is least-privilege, audited,
  retained/deleted under applicable policy, and excluded from public/Tenant
  exports and generated documents.
- **D55-AC080:** Tenant audit derives a safe platform-withdrawal fact without
  copying rows or exposing another Tenant or the platform actor's unnecessary
  personal data.

### Selected/effective settings UX

- **D55-AC081:** The read-only **Current setting** shows **Selected: [profile
  label]**, **Status: Unavailable for safety**, **Effective: Off**, and
  **Courtesy reminders are off. Existing access requests, tasks, and access are
  unchanged. This setting will not restart.**
- **D55-AC082:** The withdrawn status uses calm, factual, localized language and
  contains no blame, countdown, urgency, incident detail, or due/access claim.
- **D55-AC083:** No modal, forced redirect, global banner, toast-only explanation,
  task, notification, email, animation, sound, vibration, or focus theft
  announces the platform action.
- **D55-AC084:** A direct/reloaded/bookmarked low-bandwidth route renders the
  complete selected/effective meaning and replacement action without Realtime,
  images, avatars, hover, or prior navigation.

### Replacement form semantics

- **D55-AC085:** The withdrawn selection is static labeled content and is not an
  enabled, checked, hidden, or unexplained disabled radio option.
- **D55-AC086:** Secondary **Choose a new setting** opens a native semantic
  fieldset/legend containing only explicit Off and current selectable profiles
  with visible labels and descriptions.
- **D55-AC087:** No replacement is preselected; Save is unavailable until a
  deliberate selection, while Cancel preserves the current **Selected access-
  review timing-policy head** and effective Off.
- **D55-AC088:** Save success, stale-head conflict, validation error, and network
  ambiguity preserve entered choice as appropriate and present persistent,
  associated, programmatically determinable recovery text.

### Accessibility, localization, mobile, and low bandwidth

- **D55-AC089:** Keyboard-only and screen-reader testing proves label,
  selected/effective state, fieldset choices, error, Save, Cancel, and receipt in
  logical visual/DOM/focus order with visible focus.
- **D55-AC090:** The flow passes forced colors, contrast, non-color state,
  target-size, text-spacing, reduced-motion, 400-percent zoom, and 320-CSS-pixel
  reflow without loss or two-dimensional scrolling for ordinary content.
- **D55-AC091:** Long translation, RTL, CJK, plural/number formatting, locale,
  and Tenant time-zone display do not truncate, reorder, or change policy
  meaning; no duration is recomputed client-side.
- **D55-AC092:** Mobile touch and slow/offline/reconnect tests preserve explicit
  commit, never optimistically claim success, and reconcile one authoritative
  receipt without duplicate save.

### Cache, Realtime, and read consistency

- **D55-AC093:** An authoritative fence commit blocks new favorable boundaries
  even if every cache and Realtime subscriber still holds pre-fence state.
- **D55-AC094:** A cache may reuse a known withdrawn result but cannot reuse
  stale/unknown “not withdrawn” beyond the proven boundary required by the
  authoritative command.
- **D55-AC095:** Realtime payloads carry only scoped identifiers/invalidation;
  clients refetch an authorized safe projection and never publish/evaluate the
  fence.
- **D55-AC096:** Stale UI action to a withdrawn reminder or profile reauthorizes
  on the server, fails safely, and returns a clear non-sensitive current result.

### Idempotency, reconciliation, and repair

- **D55-AC097:** Crash before disposition commit yields no disposition/effect;
  crash after commit before response returns the same receipt on retry.
- **D55-AC098:** Concurrent identical commands converge on one disposition;
  different target/meaning commands remain separately exact or conflict as
  appropriate without partial mutation.
- **D55-AC099:** Reconciliation detects and quarantines any post-fence favorable
  boundary, stale active reminder projection, illegal Tenant head mutation, or
  disposition mismatch and links exact evidence.
- **D55-AC100:** Repair rebuilds derived effective/item/group views from source
  truth and never deletes the disposition, resets engagement, writes synthetic
  Off, or force-releases work.

### Mixed versions and rollback

- **D55-AC101:** Every supported source writer, plan compiler, claimant,
  renderer/query, action endpoint, and external adapter understands the
  disposition before the first profile becomes selectable.
- **D55-AC102:** Unsupported/malformed disposition versions fail closed to no
  courtesy effect and emit a safe invariant signal rather than treating absence
  as active.
- **D55-AC103:** Old-code/new-store and new-code/old-store matrices cannot admit
  a favorable effect without proven compatibility; activation remains blocked
  until the old writer cohort is gone or fenced.
- **D55-AC104:** Rollback after a disposition preserves its row, decoder, audit,
  fail-closed evaluator, and history; restoration is roll-forward only.

### Activation and deployment order

- **D55-AC105:** The future change deploys compatible durable store/decoder and
  fail-closed read evaluation before any writer can reference the profile.
- **D55-AC106:** D43/D49/plan/member/step checks deploy and pass concurrency/
  failure tests before the settings UI or profile activation is enabled.
- **D55-AC107:** Settings UX, exact operator capability, runbook, synthetic
  nonproduction engage/replay/verification, monitors, and repair proof pass
  before profile selection opens.
- **D55-AC108:** Rollout activation is last and has a tested monotonic narrowing
  path; no migration backfills a historical fence, policy head, reminder, item,
  task, or engagement.

### Scale and performance

- **D55-AC109:** Publishing the disposition remains one bounded transaction/
  command as affected Tenant/request/item counts grow.
- **D55-AC110:** Admission uses indexed exact-profile authoritative lookup or an
  equivalent measured bounded path with no remote flag/provider dependency.
- **D55-AC111:** Production-shaped tests cover the largest supported Tenant and
  concurrent request/worker volume, measuring added p50/p95/p99 latency, lock
  wait, query count, and error rate against activation budgets.
- **D55-AC112:** Reconciliation uses keyset/bounded batches, resumes safely, and
  cannot hold broad locks or make protection depend on completing the backlog.

### Operations and restoration

- **D55-AC113:** The tested runbook incorporates D56's exact authority,
  registered trigger/evidence, assurance/review ordering, plus verification
  queries, incident ownership, containment, reconciliation, communication
  boundary, and successor procedure.
- **D55-AC114:** Immediately after engage, operators can prove the exact
  disposition and zero post-fence favorable boundaries without inspecting raw
  Tenant or request content.
- **D55-AC115:** A mistaken or later-disproved safety concern cannot clear the
  exact revision; correction appends evidence and any future availability uses
  an independently activated successor.
- **D55-AC116:** Affected Tenants remain effectively Off until their authorized
  person explicitly selects Off or a current safe successor; no support or
  platform bulk repair substitutes.

### Semantic ceiling and traceability

- **D55-AC117:** API/schema/domain vocabulary never calls the disposition a
  Tenant override, paused profile, provider pause, notification preference,
  task status, emergency access, or generic feature flag.
- **D55-AC118:** D55 introduces no targeting DSL, Tenant exception, automatic
  substitute, channel fallback, notification fanout, due/SLA state, or unrelated
  product kill switch.
- **D55-AC119:** D55-R1–D55-R30 and D55-AC001–D55-AC120 trace consistently from
  the Grill answer into glossary, ADRs, Phase 12/17, OpenSpec, tickets,
  implementation, tests, and release evidence with no contradictory term/state.
- **D55-AC120:** Release evidence contains positive, negative, boundary,
  authorization, RLS, cross-Tenant, concurrency, idempotency, failure,
  provider-ambiguity, migration, rollback, accessibility, localization, mobile,
  low-bandwidth, privacy, performance, and operational-drill results at public
  seams—not merely unit tests of an evaluator Boolean.

## Named release and production monitors

Every threshold below is a release-blocking invariant or an explicit activation
budget. “Owner” identifies the accountable operating function, not merely the
team whose code emitted a metric.

| Monitor                               | Signal                                                                                                                                                              | Threshold                                                                                              | Owner                                                      | Required response                                                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D55-M01 Post-fence D43 admission      | Count of D43 cadence admissions ordered after withdrawal for the exact revision                                                                                     | **> 0 ever**                                                                                           | Phase 12 Access Platform on-call + Security incident owner | Declare Sev-1 product-safety incident; disable all reminder activation at the product boundary, quarantine affected source IDs, preserve evidence, correct serialization, and prove zero leakage before any successor activation. |
| D55-M02 Post-fence D49 seal           | Positive D49 occurrence/cohort seals ordered after withdrawal                                                                                                       | **> 0 ever**                                                                                           | Phase 12 Access Platform on-call                           | Stop favorable seal claims, quarantine occurrence IDs, reconcile descendants, and repair the fence check before resume.                                                                                                           |
| D55-M03 Post-fence local release      | D54 local irreversible releases ordered after withdrawal                                                                                                            | **> 0 ever**                                                                                           | Phase 17 Notifications on-call + Phase 12                  | End affected active presentation without fabricating engagement, quarantine item IDs, investigate boundary order, and block reminder writers.                                                                                     |
| D55-M04 Post-fence external admission | External step submission-attempt admissions ordered after withdrawal                                                                                                | **> 0 ever**                                                                                           | Phase 6 Delivery on-call + Security                        | Stop new provider I/O, preserve ambiguity evidence, reconcile only admitted calls, notify incident owners, and fix admission fencing.                                                                                             |
| D55-M05 Extra provider I/O            | Provider calls/retries/fallbacks after fence without a pre-fence attempt admission                                                                                  | **> 0 ever**                                                                                           | Phase 6 Delivery on-call                                   | Disable affected adapter, quarantine intent/attempt IDs, preserve provider evidence, assess disclosure, and require independent fix verification.                                                                                 |
| D55-M06 Effective-policy escape       | Withdrawn selected heads evaluated as non-Off                                                                                                                       | **> 0 ever**                                                                                           | Phase 12 Access Platform on-call                           | Fail the entire optional reminder feature closed, invalidate favorable caches, identify affected boundaries, and repair evaluator/decoder before re-enable.                                                                       |
| D55-M07 Illegal re-selection          | Successful Tenant save targeting a withdrawn revision                                                                                                               | **> 0 ever**                                                                                           | Phase 12 Authorization owner                               | Freeze non-Off saves, preserve the authentic head/receipt, derive Off, investigate auth/validation, and correct without rewriting Tenant history.                                                                                 |
| D55-M08 Disposition mutation          | Update/delete/clear/retarget/expiry attempt that succeeds                                                                                                           | **> 0 ever**                                                                                           | Database Security + Platform Security                      | Treat as critical integrity incident, revoke path, restore append-only truth from audit/backup, and require migration/RLS review.                                                                                                 |
| D55-M09 D56 assurance violation       | Disposition committed without the exact authority, assurance/review sequence, registered trigger/evidence, trusted target, or current context later ratified by D56 | **> 0 ever**                                                                                           | Platform Security                                          | Contain credentials/path, preserve evidence, assess denial-of-service/privacy impact, block profile activation, and enforce the D56 contract before recovery.                                                                     |
| D55-M10 Tenant-head fanout            | Tenant policy heads written by withdrawal command/reconciler                                                                                                        | **> 0 ever**                                                                                           | Phase 12 Product Data owner                                | Stop fanout, preserve original/audit data, roll forward with corrective Tenant-authorship records only through approved repair, and fix command boundary.                                                                         |
| D55-M11 Unknown safety version        | Unsupported/malformed disposition encountered by a favorable reader/writer                                                                                          | **> 0 favorable admissions; any encounter alerts**                                                     | Platform Runtime owner                                     | Keep affected effects Off, identify mixed binary/schema cohort, deploy compatible decoder, and block profile activation/rollout expansion.                                                                                        |
| D55-M12 Stale active reminder         | Withdrawn-revision reminder still contributes active/unread state on an authoritative query                                                                         | **> 0 ever**                                                                                           | Phase 17 Notifications on-call                             | Invalidate/rebuild projection, preserve item engagement/history, verify source applicability, and inspect all affected query paths.                                                                                               |
| D55-M13 Cross-boundary disclosure     | Any withdrawal/evidence response, cache, log, export, or UI reveals another Tenant or protected incident/access/ministry detail                                     | **> 0 confirmed event**                                                                                | Privacy/Security incident owner                            | Contain exposure, revoke access/cache, preserve audit, follow breach process, minimize data path, and verify affected surfaces.                                                                                                   |
| D55-M14 Missing D56 contract/review   | Profile activation, incident closure, or successor activation attempted without the ratified D56 authority/evidence/assurance rule or its required review           | **> 0 attempt**                                                                                        | Product Safety governance owner                            | Block the attempted transition, complete the founder decision and required human review, record disposition, and audit authority separation.                                                                                      |
| D55-M15 Fence evaluation health       | Authoritative lookup error/timeout rate and latency                                                                                                                 | **Any breach of activation SLO for two consecutive measurement windows; all errors still fail closed** | Phase 12/Database SRE                                      | Keep reminders Off, investigate database/index/lock path, scale or optimize without caching favorable state, and re-prove budgets.                                                                                                |
| D55-M16 Accessibility regression      | Release or production audit finds a blocker in selected/effective comprehension, semantics, keyboard, screen reader, reflow, focus, or error recovery               | **Any blocker**                                                                                        | Design System + Accessibility owner                        | Block rollout or disable settings mutation while preserving Off, repair shared primitive/copy, and rerun manual AT matrix.                                                                                                        |
| D55-M17 Reconciliation drift          | Disposition/source/effect projection mismatch unresolved after the configured bounded reconciliation objective                                                      | **Any item past the activation-defined objective**                                                     | Phase 12/17 Operations                                     | Keep favorable effects fail-closed, quarantine mismatches, repair from source truth, and investigate systemic drift before expansion.                                                                                             |
| D55-M18 Scope-creep artifact          | Generic override/targeting rule, per-Tenant exception, provider pause, or unrelated feature consumes D55 disposition                                                | **> 0 registered consumer outside the exact reminder contract**                                        | Architecture owner                                         | Block merge/release, remove coupling, require a separate ADR/decision for the new domain, and re-run traceability proof.                                                                                                          |

## Final disposition and exact corrected decision to record

**Final disposition: Accept with required amendments.**

Record this decision:

> Core will use one irreversible product-owned **Access-review timing-profile
> safety withdrawal** for one exact activated profile revision and environment.
> The exact authorized-human/assurance and registered-trigger/evidence rule is
> D56's separate pre-activation decision. D55 pre-authorizes no operator role or
> review timing. Only the future D56-qualified trusted server command can engage
> withdrawal; Tenant admins, `permissions.manage_grants`, support/impersonation,
> role strings, clients, workers, providers, flags, automation, and
> `service_role` alone are insufficient.
>
> The disposition is append-only, terminal, nonexpiring, untargeted, and
> impossible to clear. It preserves every **Selected access-review timing-policy
> head** and every pinned historical tuple while the **Effective access-review
> cadence disposition** derives Off. It
> performs no Tenant/head/request/task/item/message/provider fanout and never
> chooses a replacement. The exact revision can never resume; recovery requires
> an independently evidenced/activated successor and a deliberate authorized
> Tenant save.
>
> Fence publication serializes with D43 cadence admission, D49 seal, plan
> compilation, and every descendant's own irreversible boundary. Fence-first
> denies; admission-first preserves only the exact truthful history. A released
> D54 reminder child ends active/unread contribution without fake engagement or
> sibling/task/source mutation. Prepared-definitely-unsubmitted external work
> is suppressed; submission-may-have-begun work can only finish/reconcile the
> one frozen call and can never retry, fall back, or claim recall.
>
> Unknown or unavailable safety state fails closed for optional courtesy
> effects while the access-review workflow remains usable. Every path is
> server-authorized with RLS/grant/privileged-path parity and trusted
> attribution. The future settings page presents the exact read-only **Current
> setting** Selected/Status/Effective summary and unchanged-work/no-restart copy,
> then secondary **Choose a new setting** opens the unpreselected native Off/
> available-profile fieldset. It is calm, accessible, privacy-minimized,
> localized, mobile/low-bandwidth resilient, and creates no proactive
> notification.
>
> D55 creates documentation only. No profile may activate until D56 is ratified
> and compatible
> store/decoders, fail-closed readers and writers, UX, authorization, runbook,
> mixed-version/rollback behavior, monitors, tests, and release evidence prove
> D55-R1–D55-R30 and D55-AC001–D55-AC120. No generic flag, override engine,
> targeting system, provider pause, or second cancellation/workflow system is
> authorized.

## Ruthless synthesis and ordered path forward

### Resolved before this answer is recorded

1. Treat urgent withdrawal as a terminal exact-profile product disposition,
   not a mutable “kill switch.”
2. Preserve Tenant-selected heads and expose selected-versus-effective truth; do
   not bulk-write synthetic Off.
3. Make every favorable source/effect boundary re-prove the fence and define
   admission-first history.
4. Keep request, D44 attention, task, access, local engagement/history, and
   provider evidence under their existing owners.
5. Prohibit mass fanout, automatic replacement, per-Tenant targeting, clearing,
   external flag authority, and generic-engine scope creep.

### Requirements that must enter the durable spec/design

1. Use the existing canonical terms **Access-review timing-profile safety
   withdrawal**, **Selected access-review timing-policy head**, and **Effective
   access-review cadence disposition** consistently.
2. Add the terminal lifecycle, ordinary-retirement precedence, D56 authority/
   evidence dependency, selected/effective invariant, irreversible-effect
   matrix, and successor-only restoration to ADR-0026/0027/0183/0184 and Phase
   12/17.
3. Keep the manifest/census count unchanged now; a future activation links the
   exact D55 contract without reserving a placeholder key.
4. Add OpenSpec requirements only with the later complete implementation, with
   matching positive and negative scenarios and no active-change-over-merged-
   intent ambiguity.
5. Resolve D56's exact authorized-human/assurance and registered-trigger/
   evidence rule before any timing profile can activate. External courtesy
   delivery remains a later separate question.

### Required implementation safeguards before activation

1. Implement the immutable exact disposition and the future D56-qualified
   trusted command with durable semantic idempotency, attribution, constraints,
   restrictive deletes, application authorization, RLS `USING`/`WITH CHECK`,
   and privileged-path parity.
2. Deploy compatible decoders and fail-closed evaluators to every D43/D49/plan/
   member/step/query/action path before a profile becomes selectable.
3. Implement source-derived local-item end and channel-specific external
   suppression/reconciliation without engagement, task, or source mutation.
4. Build one Base Maia/Base UI settings journey with separate Selected/Effective
   truth and an explicit native replacement form; test all accessibility,
   localization, mobile, and low-bandwidth boundaries.
5. Provide bounded indexed lookup, keyset reconciliation, minimized audit,
   runbook, synthetic drills, zero-tolerance invariant monitors, and production-
   shaped concurrency/load/failure proof.
6. Activate last. Roll forward after withdrawal, retain all compatible decoders
   and history, and never backfill a fence or historical reminder.

### Residual risks allowed only under monitoring

Only operational latency, projection convergence, and implementation defects
remain monitorable. They do not relax product invariants: every uncertain path
still fails closed. D55-M01–D55-M18 name the signal, threshold, owner, and
mandatory response. No known semantic, authorization, privacy, lifecycle,
mixed-version, or UX gap is deferred to monitoring.

## D56 — Who may irreversibly withdraw an activated timing-profile revision?

### Why this needs a founder decision

D55 deliberately resolves the disposition's target, permanence, precedence,
history, effects, and Tenant UX without inventing who may exercise a global,
irreversible platform power. Waiting for a second human can reduce insider or
mistake risk, but it can also extend a confirmed privacy, accessibility, or
fatigue harm. Allowing one person to contain immediately is faster, but needs an
exact non-Tenant purpose, step-up assurance, registered evidence, durable audit,
and mandatory independent review.

For example, a reviewed accessibility investigation may prove the active
profile causes a material barrier. The operator must stop new courtesy effects
quickly, but a Tenant admin with `permissions.manage_grants`, a support
impersonation session, or a generic platform role must not gain power to disable
the revision for every Tenant.

### Option 1 — one dedicated operator contains immediately; independent review follows — recommended

One currently authenticated, step-up-proved human holding the dedicated non-
Tenant platform timing-profile-safety-withdrawal purpose may commit immediately
when the registered trigger and restricted evidence reference are present. A
different currently authorized human independently reviews the action before
incident closure or successor activation, not before containment. Missing
review blocks those later transitions but never clears the withdrawal.

**UX/operations impact:** shortest exposure window and one clear accountable
actor, without sacrificing independent scrutiny or allowing surprise
restoration.

### Option 2 — different-human approval is required before containment

One qualified human prepares the exact withdrawal request and evidence; a
different currently authenticated, step-up-proved qualified human must approve
before the immutable disposition commits. There is no same-person or automated
emergency bypass.

**UX/operations impact:** stronger separation before a global action, but
containment waits for an approver and needs a durable pending-request lifecycle,
expiry, reassignment, concurrency, and availability model.

Under either option, Tenant admins, `permissions.manage_grants`, support/
impersonation, role strings, browsers, workers, providers, feature flags,
automation, and `service_role` alone are never sufficient. External courtesy-
reminder delivery remains a later founder decision.

**Recommendation:** Option 1. Narrowing should be fast when its registered
evidence threshold is met; immutable audit and mandatory independent review
before closure or successor activation provide proportionate control without
building a preapproval workflow on the incident path.

Which should Core record for D56: **Option 1 — one dedicated step-up-proved
platform safety operator may contain immediately with different-human review
before closure/successor activation**, or **Option 2 — different-human approval
is required before the withdrawal commits**? You may amend either option.

## Source index

### Governing repository sources

- [Core glossary](../../../CONTEXT.md)
- [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
- [Phase 12](./phase-12-full-role-permission-configuration.md)
- [Phase 17](./phase-17-system-messages-template-management.md)
- [Phase 17 executable manifest](./phase-17-system-message-executable-manifest.md)
- [Phase 17 census](./phase-17-system-message-census-2026-07-19.md)
- [D47 adversarial review](./phase-24-d47-bounded-tenant-reminder-cadence-adversarial-review.md)
- [D48 adversarial review](./phase-24-d48-new-request-only-cadence-application-adversarial-review.md)
- [D49 adversarial review](./phase-24-d49-current-recipient-cohort-adversarial-review.md)
- [D50 adversarial review](./phase-24-d50-request-anchored-elapsed-clock-adversarial-review.md)
- [D51 adversarial review](./phase-24-d51-immediate-irreversible-narrowing-adversarial-review.md)
- [D52 adversarial review](./phase-24-d52-bounded-usefulness-window-adversarial-review.md)
- [D53 adversarial review](./phase-24-d53-evidence-admitted-complete-timing-profile-adversarial-review.md)
- [D54 adversarial review](./phase-24-d54-distinct-grouped-reminder-presentation-adversarial-review.md)
- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
- [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Platform Principles](../../../openspec/specs/platform-principles/spec.md)
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)

### Current official external sources

- [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- [LaunchDarkly kill switches](https://launchdarkly.com/docs/home/flags/killswitch)
- [LaunchDarkly audit log](https://launchdarkly.com/docs/api/audit-log)
- [W3C Forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WAI keyboard-interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [USWDS form guidance](https://designsystem.digital.gov/components/form/)

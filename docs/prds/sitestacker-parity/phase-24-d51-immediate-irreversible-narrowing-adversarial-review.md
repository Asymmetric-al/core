# Phase 24 D51 — Immediate Irreversible Narrowing for Cadence Changes

- **Status:** Founder answer adjudicated; documentation-only future contract
- **Founder direction:** Option 1 — non-Off interval edits are prospective, Off monotonically cancels not-yet-irreversibly-admitted reminder effects, and re-enable never resurrects
- **Disposition:** **Accept with required amendments**
- **Date reviewed:** 2026-08-29
- **Scope:** Phase 12 cadence-policy revisions, D43/D48 request admission, D50 immutable source-time packages, D49 occurrence/recipient sealing, Off/edit/re-enable semantics, irreversible-effect admission, provider ambiguity, UX, authorization, RLS, migration, operations, and proof
- **Non-scope:** no runtime behavior, schema, migration, OpenSpec delta, current-work fanout, cadence/usefulness value, late-wake/catch-up rule, message key, channel cancellation adapter, task mutation, Inngest function, feature flag, telemetry pipeline, or UI is authorized by D51

## Executive adjudication

Option 1 is the right safety and UX model, but “turning Off cancels pending
reminders” is dangerously ambiguous. A database policy save cannot
synchronously recall provider work, undo an already visible in-product item, or
atomically update every request row without a large brittle fanout.

The corrected decision is:

> Every cadence change appends one immutable Phase 12 policy revision and
> advances one authoritative Tenant/environment/policy-kind head through an
> expected-head server command. Non-Off-to-non-Off changes are widening or
> replacement choices for genuine D43 source creations ordered after the policy
> boundary under D48's shared serialization and committing their immutable
> disposition; already admitted requests retain their immutable D50
> source-time package. Re-enable after Off behaves the same way: only genuine
> later requests may be admitted. It never revives, recalculates, un-cancels,
> catches up, or creates another occurrence for prior work.
>
> An Off revision advances a separate monotonic cancellation epoch in the same
> successful transaction that advances the policy head. The epoch—not the
> ordinary revision number—is the logical source fence. Non-Off edits do not
> advance it; re-enable retains the advanced epoch; every newly admitted
> request pins the then-current epoch. The Off commit is O(1) in request count and does
> not synchronously enumerate, count, lock, or write every request, recipient,
> task, item, intent, provider record, or workflow run. Every source occurrence
> seal, in-product release, and currently governed email preparation/attempt admission must
> compare the request's pinned epoch with the current epoch under the same
> stable-scope serialization/CAS discipline.
> Bounded reconciliation may materialize projections later, but truth changes
> at the policy-head commit, not when a worker reaches a row.
>
> Off publication, D50/D49 claims, and each irreversible-effect
> admission share a stable absent-row-safe Tenant/environment/policy-kind
> serialization discipline and produce one defensible order. If Off commits
> first, a prior active generation cannot later seal a new occurrence or admit
> a new irreversible descendant. If an occurrence seal commits first, its
> history remains but every still-retractable descendant must race/re-prove the
> Off fence. If an exact irreversible-effect admission commits first, that
> effect remains historically authorized and may already be visible or may
> still arrive after Off.
>
> **Irreversible-effect admission** is the product-owned atomic boundary that
> authorizes one exact descendant to cross beyond reliable source recall. For
> in-product presentation it is one atomic source/presentation release commit
> that makes the item queryable; a later human read is not the boundary. For an
> the currently governed email step it is the Phase 6 product-owned
> submission-attempt admission/claim immediately before the network call—not
> provider acceptance. Email
> dispatch remains on Core's canonical independent axes: **Unprepared** or
> **Prepared definitely unsubmitted** is suppressible; once attempt admission
> wins, dispatch is permanently **Submission may have begun**, while provider
> outcome independently remains exactly **None**, **Accepted**, **Definitely
> rejected**, or **Indeterminate** as evidence permits. An admitted call cannot
> be promised recalled, canceled, or unseen. Off permits evidence
> reconciliation but no further provider call, same-key follow-up, new attempt,
> or blind resend; a definitive rejection learned after Off receives no new
> attempt. A channel that supports
> canceling its own still-scheduled object may later attempt that separately
> governed narrowing, but D51 neither requires it nor treats provider
> cancellation as source truth. Every future push, Slack, Teams, Google Chat,
> or other channel must register and prove its own product-owned admission,
> finality, and recovery boundary; it cannot inherit email assumptions or add a
> generic cancellation engine.
>
> Off changes no D43 request, grant, EffectiveAccess, decision, holder status,
> D44 current responsibility, or existing source-backed task. It creates no
> second task, task completion, cancellation task, cancellation notification,
> bell item, unread reset, email, or channel message. Existing effects retain
> truthful history. A local item released before Off ends active/unread
> attention only through ADR-0027's source-owned presentation-end contract,
> never by fabricated read, dismissal, archive, or deletion; permitted Recent
> history and current authorization/presentation ceilings remain independent.
>
> The future policy editor uses one explicit form with Save and Cancel—never an
> instant toggle, optimistic autosave, or background draft. Changing a non-Off
> interval or re-enabling uses a durable inline impact statement and ordinary
> Save. Selecting Off reveals one proportionate inline consequence review
> inside the same route-addressable Base Maia form/Sheet and replaces the
> ordinary primary action with **Turn off courtesy reminders**. There is no
> nested dialog or post-Save confirmation. The review states the immediate
> narrowing of current preventable and future reminders: earlier in-product
> reminder history may remain, and a reminder already being sent may still
> arrive. It requires no typed phrase, checkbox ritual,
> current-request count, request list, recipient names, or second surface.

The amendments preserve the founder’s future-only widening and trustworthy Off
semantics without pretending a distributed system can synchronously erase
already admitted effects.

## Problem validity and strongest alternative

A Tenant must be able to stop optional future attention without waiting for a
row-by-row job or accidentally triggering it again when the policy returns.
That is a real safety and trust requirement if D47’s optional reminder ever
ships. It remains conditional: D51 does not prove the reminder itself is
necessary.

The strongest alternative is making every edit—including Off—prospective only,
allowing already admitted work to continue. It is simpler and maximally
immutable, but violates the ordinary meaning of Off: a ministry could
deliberately turn reminders off and still receive future reminders from waiting
requests.

Recompute/pause/resume is rejected. It would turn a small policy edit into a
current-cohort scheduler command, permit backlog acceleration or bunching, and
require preview, baseline, fanout, repair, migration, and rollback machinery
without evidence.

## Evidence classification

### Verified repository facts

- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
  requires server-derived Tenant, identity, role, and capability; application
  authorization is primary and RLS is defense in depth.
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
  keeps product records, Tenant authorization, audit, work claims, and dispatch
  ledger authoritative while Inngest remains an identifier-only executor.
- [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  keeps permission-sensitive operations server-side and preserves one shared
  staff task model.
- [Platform Principles](../../../openspec/specs/platform-principles/spec.md)
  ranks Tenant/permission safety above convenience and requires clarity,
  accessibility, coherence, and reliable system behavior.
- [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md) keeps each
  Delivery Step's irreversible boundary channel-specific and separates email
  dispatch phase from independent provider outcome.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  separates queryable presentation, personal engagement, source-owned
  presentation end, and durable history.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  makes the D44 task a projection; task state cannot create, cancel, or own an
  access-review reminder.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  makes Phase 12 policy/request/occurrence truth authoritative and requires
  future source cancellation/usefulness proof before effects.
- D47 requires immutable policy revisions, zero-or-one occurrence, current
  source reproof, and no reminder runtime until all downstream decisions close.
- D48 makes first activation prospective at genuine source creation and
  expressly left later edit/Off/re-enable effects unresolved.
- D49 binds recipients at source seal, allows later narrowing only, and keeps
  proved zero and indeterminate distinct.
- D50 pins one immutable request-anchored elapsed candidate and defines only an
  inclusive not-before boundary; it explicitly does not decide lateness.
- Current generic task reminders and contribution approval notification
  timestamps/providers are separate-domain migration evidence, not D51 source
  or cancellation precedent.
- No D43–D51 runtime, policy head, source fence, occurrence, provider adapter,
  or UI currently ships.

### Verified current official primary evidence

- [SailPoint access-request email configuration](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)
  states configuration changes affect requests created after the change while
  pending requests retain submission-time configuration. This supports
  prospective non-Off edits.
- [Microsoft Entra current/series behavior](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
  separates Current-instance changes from future Series changes.
  [Microsoft Entra review completion](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
  allows an active instance to be stopped and says it cannot be restarted.
  This supports explicit monotonic stop semantics, not silent pause/resume.
- [HubSpot workflow Off behavior](https://knowledge.hubspot.com/workflows/turn-off-workflows)
  stops actions while Off and says skipped actions are not executed when the
  workflow is later re-enabled. This supports no resurrection/catch-up while
  remaining only a CRM comparator.
- [Salesforce Scheduled Paths](https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_scheduled_path.htm&language=en_US)
  reevaluates conditions and cancels scheduled paths when a record no longer
  meets them. This supports current-source narrowing but also demonstrates the
  complexity D51 avoids through one separate cancellation epoch.
- [Resend scheduled email documentation](https://resend.com/docs/dashboard/emails/schedule-email)
  can cancel a provider-scheduled email, after which that provider object cannot
  be rescheduled. This is channel-specific capability, not a guarantee for
  already sent or in-flight calls.
- [Resend idempotency documentation](https://resend.com/docs/dashboard/emails/idempotency-keys)
  identifies concurrent in-progress requests as a distinct conflict and retains
  idempotency keys for 24 hours. Product truth must survive longer and represent
  ambiguous/in-flight effects honestly.
- [RFC 9110 section 9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)
  warns that non-idempotent requests should not be automatically retried unless
  the client can prove semantic idempotency or that the original was not applied.
- [PostgreSQL serialization-failure handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
  requires retrying the complete transaction, including all value-selection
  logic, after serialization failure.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes USING/WITH CHECK and identifies owner/BYPASSRLS behavior that
  requires privileged-path parity.
- [WCAG confirmation technique G168](https://www.w3.org/WAI/WCAG21/Techniques/general/G168)
  recommends confirmation that identifies an irreversible action and its
  consequences while allowing cancel. This supports one proportionate Off
  confirmation, not confirmation fatigue.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires labels/instructions, error
  identification, and programmatically determinable status messages for later
  policy UI.

These sources support prospective widening, explicit stopping, no automatic
resurrection, honest provider ambiguity, product idempotency, and proportionate
confirmation. None dictates Core’s exact source fence or proves a reminder
should ship.

### Reasonable inferences

- Small or distributed ministry teams expect Off to stop future optional
  attention even when they do not understand queue/provider internals.
- A separate monotonic cancellation epoch scales and recovers more safely than synchronous
  per-request cancellation.
- “Already created or being delivered may still arrive” is more trustworthy
  than a false “all reminders canceled” success message.

### Product judgments and unresolved unknowns

- Immediate logical narrowing at source head commit is a Core product judgment,
  not a universal vendor rule.
- Representative ministry research has not established cadence/usefulness
  values, whether reminders should ship, or whether the Off inline-review copy
  reaches the required comprehension rate.
- D51 settles Off against D49 indeterminate proof: once Off advances the epoch,
  that same unresolved occurrence is permanently source-fenced, releases
  nobody, and cannot retry after re-enable. D52 decides only useful-lateness
  expiry for an otherwise current indeterminate occurrence when neither Off nor
  another source-terminal fence has occurred.
- Later design must choose persistence, serialization mechanism, physical
  effect-admission boundary per surface/channel, retention, channel cancellation
  adapters, and performance budgets without weakening D51 behavior.

## Current behavior, intended behavior, and permanent path

| Area                                     | Current repository behavior            | D51 intended contract                                                                                                        | Best permanent path                                            |
| ---------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Cadence policy                           | No D47 runtime                         | Append-only Off/non-Off heads with expected-head commands                                                                    | Phase 12 policy source                                         |
| Non-Off edit                             | No runtime                             | Future genuine requests only; existing packages unchanged                                                                    | Prospective source generation                                  |
| Off                                      | No runtime                             | O(1) logical monotonic fence: Off advances a separate cancellation epoch in the policy-head transaction                      | Source-ordered epoch, not ordinary head equality or row fanout |
| Re-enable                                | No runtime                             | Later genuine requests only; no revival/catch-up                                                                             | Fresh active generation                                        |
| D49 occurrence                           | No runtime                             | Off-first prevents seal; seal-first preserves history and narrows descendants                                                | Product source claim/receipt                                   |
| In-product effect                        | Current bell is non-authoritative demo | Atomic presentation/admission; released history remains, while active/unread ends only through source-owned presentation end | ADR-0027 Phase 17 presentation + history                       |
| Currently governed external email effect | Resend exists for other domains        | Phase 6 attempt admission plus independent dispatch/outcome evidence                                                         | Phase 6 intent/claim/provider truth                            |
| Tasks                                    | Generic task reminders exist           | No second/cancellation task or task mutation                                                                                 | D44 task remains work truth                                    |
| UX                                       | No cadence editor                      | Explicit primary action; one inline Off consequence review; honest durable result                                            | People & access Base Maia form/Sheet                           |

## Domain model, ownership, and invariants

### Canonical terms

**Cadence policy head:** The one authoritative current Off or non-Off Phase 12
revision for a Tenant/environment/policy kind.

**Cancellation epoch:** A separate monotonic Phase 12 watermark for one
Tenant/environment/policy kind. Every successful Off command advances it in
the policy-head transaction; non-Off edits do not; re-enable retains it; every
new request admission pins its current value.

**Prospective non-Off generation:** A non-Off policy revision eligible only for
genuine D43 source creations ordered after its boundary under D48's shared
serialization and committing their immutable disposition.

**Monotonic Off fence:** The cancellation-epoch advance committed with an Off
revision. Pinned-epoch inequality permanently prevents prior active
generations from admitting new source occurrences or irreversible descendants.

**Irreversible-effect admission:** The product-owned atomic transition that
either makes one in-product presentation queryable in the same source/release
commit or, for currently governed email, admits one Phase 6 submission attempt
immediately before its network call. A human read and provider acceptance are
later evidence.

**Currently governed email dispatch phase and provider outcome:** Two
independent canonical axes. Dispatch is **Unprepared**, **Prepared definitely unsubmitted**, or
permanently **Submission may have begun** after attempt admission. Provider
outcome is **None**, **Accepted**, **Definitely rejected**, or
**Indeterminate**. Timeout/connection failure cannot be guessed into another
phase or outcome.

**Admitted-before-Off effect:** An effect whose irreversible admission
linearized before the Off fence. Its later provider/presentation outcome
remains truthful history even if it appears after Off.

**Logically canceled occurrence:** An admitted request whose source occurrence
had not sealed before an Off-first order and can never seal or revive.

### Ownership matrix

| Authoritative fact                                    | Owner                                          | Permitted consumers                      | Explicit non-owners                                  |
| ----------------------------------------------------- | ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| Off/non-Off policy heads and effective order          | Phase 12 source policy                         | authorized settings, source claims/audit | browser toggle, worker, provider                     |
| Monotonic cancellation epoch and pinned request epoch | Phase 12 source policy/request admission       | all later source/effect claims           | ordinary policy revision equality, browser, executor |
| D43 episode/D48 admission/D50 package                 | Phase 12 request aggregate                     | source claim, safe audit                 | policy edit job, task, item                          |
| D49 occurrence seal/recipient ceiling                 | Phase 12 source occurrence                     | Phase 17/6 descendants                   | provider, task, current policy query                 |
| Source cancellation under Off                         | Phase 12 policy/occurrence contract            | claims/reconciliation                    | task completion, notification deletion               |
| Irreversible effect admission                         | Owning product boundary under Phase 12 ceiling | Phase 17 or Phase 6 adapter              | provider timestamp, executor run                     |
| In-product presentation/history                       | ADR-0027/Phase 17                              | authorized staff surfaces                | cadence policy source                                |
| External intent/outcome/ambiguity                     | Phase 6 + provider evidence                    | operations/audit                         | policy head, D43 request                             |
| D44 task/current work                                 | ADR-0183 + D44 source responsibility           | Tasks Hub                                | Off cancellation, provider                           |
| Wake/retry/reconciliation                             | Replaceable executor                           | identifier-only product claims           | policy order, admission, recall truth                |

### Domain invariants

1. D51 creates no current artifact or behavior.
2. Policy revisions are immutable and one expected-head command advances one
   authoritative Tenant/environment/policy-kind head.
3. Non-Off edits and re-enable admit only genuine D43 source creations ordered
   after their policy boundary under D48's shared serialization and committing
   their immutable disposition.
4. Existing D50 source-time packages never recalculate, move, pause, resume, or
   inherit a later non-Off interval.
5. Off is monotonic for every prior active generation; re-enable never
   resurrects canceled/unsealed work or creates catch-up.
6. Every successful Off advances a separate cancellation epoch atomically with
   the policy head; non-Off edits do not advance it, re-enable retains it, and
   each newly admitted request pins the current value.
7. Off becomes logically effective at that atomic commit and performs no
   synchronous request/task/item/member/intent/provider fanout.
8. Off and every D50/D49/in-product/currently governed email admission have one defensible serial order
   or the losing complete command retries.
9. Every later claim compares the pinned and current cancellation epochs under
   the stable-scope CAS/serialization discipline; ordinary head inequality
   from a non-Off edit cannot cancel old work.
10. Off-first prevents later source seal and later irreversible effect
    admission from the fenced generation.
11. Occurrence-seal-first preserves source history; still-retractable descendants
    must re-prove Off before admission.
12. Irreversible-admission-first preserves truthful effect authority/outcome;
    Off cannot promise recall or non-arrival.
13. Currently governed email dispatch **Unprepared | Prepared definitely unsubmitted |
    Submission may have begun** and independent provider outcome **None |
    Accepted | Definitely rejected | Indeterminate** remain distinct. Once
    attempt admission wins, dispatch never regresses; Off allows evidence
    reconciliation but no later provider call, including after rejection.
14. A released local item ends active/unread only through an ADR-0027
    source-owned presentation end; Off never fabricates read, dismissal,
    archive, deletion, or engagement.
15. Off creates no task, notification, message, unread state, engagement
    mutation, D43 state, grant/access change, or holder-facing event.
16. Policy generation is not occurrence/effect uniqueness; edits cannot mint
    another courtesy occurrence.
17. Every field, relationship, policy, claim, receipt, and query is same-
    Tenant, purpose-scoped, server-derived, and protected under ordinary and
    privileged paths.
18. Ordinary UX states exact consequence without counts, names, recall promise,
    autosave, instant toggle, or unnecessary confirmation ritual.

## Lifecycle, concurrency, idempotency, and failure

### Conceptual lifecycle

These are behavioral states, not a schema prescription:

1. **Off:** no new request can receive cadence admission.
2. **Active generation:** genuine D43 source creations ordered after the head
   boundary under D48's shared serialization may atomically pin that generation
   and the current cancellation epoch in their immutable disposition.
3. **Prospective successor:** a later non-Off head affects only later genuine
   requests; earlier packages remain immutable.
4. **Fenced by Off before occurrence seal:** prior admitted request can never
   seal/catch up/revive.
5. **Occurrence sealed before Off:** source history remains; descendants still
   require irreversible admission.
6. **Descendant canceled before admission:** Off-first permanently suppresses
   the exact descendant.
7. **Descendant admitted before Off:** an in-product release is queryable
   regardless of later read; a currently governed email attempt remains permanently
   **Submission may have begun** while its independent **None**, **Accepted**,
   **Definitely rejected**, or **Indeterminate** outcome reconciles as evidence
   permits.
8. **Re-enabled generation:** only later genuine requests may enter.
9. **Indeterminate D49 proof fenced by Off:** the same unresolved occurrence
   releases nobody, becomes permanently source-fenced, and cannot retry or
   revive after re-enable.

Forbidden transitions include Off to revival, prior package to current policy
time, logically canceled to sealed, unadmitted descendant to provider after
Off, ambiguous provider effect to canceled/failed by guess, and policy save to
task/notification creation.

### Required race and failure outcomes

| Race or failure                                                                             | Required result                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Non-Off edit commits while an older request waits                                           | Cancellation epoch does not advance; older package/candidate remains eligible under its pinned epoch; new head applies only to later D43 creations                   |
| Re-enable commits after Off                                                                 | Advanced cancellation epoch is retained; only later genuine requests pin it and may be admitted; canceled work remains canceled                                      |
| Off commits before D49 occurrence seal                                                      | No seal/member/descendant; logical cancellation is immediate at head commit                                                                                          |
| D49 proof is indeterminate when Off commits                                                 | Same unresolved occurrence becomes permanently source-fenced with no release/retry; re-enable cannot revive it                                                       |
| D49 occurrence seal commits before Off                                                      | Seal/history remains; each unadmitted descendant re-proves and may be suppressed by Off                                                                              |
| Off and source seal overlap without provable order                                          | One aborts/retries; no stale seal after Off-first                                                                                                                    |
| Off commits before in-product admission                                                     | No new presentation/unread effect                                                                                                                                    |
| Atomic in-product source/presentation release commits before Off                            | Truthful presentation/history remains; active/unread ends only through ADR-0027 source-owned presentation end; Off creates no fabricated read/dismiss/archive/delete |
| Off commits before currently governed email attempt admission                               | No new provider call                                                                                                                                                 |
| Email submission-attempt admission commits before Off                                       | Dispatch remains **Submission may have begun**; call may resolve later and Off cannot promise recall                                                                 |
| Local submission-attempt admission commits before Off; provider acceptance is learned later | Preserve boundary-first authority and later **Accepted** outcome; never infer provider acceptance timing from local order                                            |
| Provider call is in flight/response lost when Off commits                                   | Dispatch remains **Submission may have begun** with **Indeterminate** or still-**None** outcome as evidence permits; no blind resend or false canceled state         |
| Email work remains **Prepared definitely unsubmitted** when Off wins                        | Suppress before provider I/O and preserve exact preparation/suppression evidence                                                                                     |
| Admitted email attempt later becomes **Definitely rejected** after Off                      | Preserve rejection and make no follow-up or new attempt                                                                                                              |
| Provider supports scheduled cancellation                                                    | Later channel adapter may attempt it; failure/ambiguity does not weaken Off source fence                                                                             |
| Off save commits but response is lost                                                       | Semantic replay returns exact Off head/receipt; no second fence or fanout                                                                                            |
| Off commit succeeds but reconciliation/dispatch fails                                       | Fence remains effective; bounded repair materializes projections without changing truth                                                                              |
| Old worker wakes after Off                                                                  | Product claim denies source/effect admission; no fallback/catch-up                                                                                                   |
| D43 becomes terminal before any effect                                                      | Ordinary D43 terminal truth independently prevents effect                                                                                                            |
| Request/assignment/auth changes after admitted effect                                       | Current read/presentation gates may narrow; historical admission/provider truth remains                                                                              |
| Mixed deployment has old worker unaware of Off                                              | Rollout must prevent policy writer activation until every admission path is fence-aware                                                                              |
| Duplicate Off command                                                                       | Same semantic receipt/head returns; no duplicate audit/fanout                                                                                                        |
| Support asks to “uncancel” after re-enable                                                  | Denied; only a genuine later D43 successor can be evaluated                                                                                                          |

## UX/UI contract

### D51 creates no surface now

No policy control, toggle, confirmation, count, cancellation status, task row,
notification, or placeholder is added through D51.

### Future single-form policy journey

If the complete feature later activates, People & access → Access requests uses
one route-addressable Base Maia form/Sheet with the finite Off/non-Off choices
plus an explicit primary action and **Cancel**. Choosing a radio/card changes
only the preserved local draft.
There is no autosave, optimistic policy update, instant switch, save-on-blur, or
background mutation.

For a non-Off interval edit:

> Applies to access review requests created after you save. Existing requests
> keep their current reminder timing.

For re-enable:

> Applies only to access review requests created after you save. Reminders
> canceled while Off will not restart.

Selecting Off reveals this inline consequence review in that same form/Sheet:

**Turn off courtesy reminders?**

> This stops every pending reminder Asym can still prevent. Earlier in-product
> reminder history may remain, and a reminder already being sent may still
> arrive. If you turn reminders on again, only new access review requests will
> be included. Access requests, tasks, and access do not change.

The inline review replaces **Save changes** with **Turn off courtesy
reminders**; **Cancel** remains available. There is no dialog, modal, nested
Sheet, post-Save prompt, typed phrase, extra checkbox, countdown,
current-request count, request/recipient list, or second surface. The final
action uses the current expected policy head and cancellation epoch; stale
state returns to the same form with the local draft preserved.

Successful Off status says:

> Reminders are off. Existing access requests and access have not changed.
> Earlier in-product reminder history may remain, and a reminder already being
> sent may still arrive. Turning reminders on again will include only new
> requests.

The status is durable and programmatically announced, never toast-only. An
ambiguous response first recovers the authoritative semantic receipt rather
than asking the user to repeat the action.

### Other user journeys

- Coordinators receive no “reminder canceled” task, notification, email, chat,
  or unread change.
- Requesters/holders see no reminder policy, cancellation, audience, delivery,
  or staff-awareness state.
- An already arriving reminder remains safe and truthful: its link loads
  current authorization/source status and may show the work is resolved or no
  longer available.
- Provider/support audit uses precise **admitted before Off**, **suppressed by
  Off**, **accepted**, **rejected**, or **ambiguous** terms; ordinary UI does not.
- Donor, missionary, CMS, and public surfaces gain no control or status.

### Accessibility, localization, mobile, and field conditions

The eventual form/inline review must use Base Maia/Base UI and shared Zinc
tokens, preserve keyboard/screen-reader order and context, visible focus,
labels/descriptions, non-color semantics, forced colors, target size, reduced
motion, 320-pixel/400-percent reflow, RTL/CJK expansion, localization, mobile
touch, and low-bandwidth recovery. Confirmation copy and final buttons must
state consequences without relying on position, color, icon, or animation.

## Normative requirements

- **D51-R1:** D51 is documentation-only and creates no runtime, schema,
  OpenSpec, policy row, event, job, key, channel, task behavior, telemetry, or UI.
- **D51-R2:** Every future Off/non-Off save appends one immutable Phase 12
  revision and advances one authoritative expected Tenant/environment/policy-
  kind head or writes nothing.
- **D51-R3:** Non-Off-to-non-Off interval edits apply only to genuine D43
  source creations ordered after the new policy boundary under D48's shared
  serialization and committing their immutable disposition; existing packages
  are unchanged.
- **D51-R4:** Re-enable after Off is a fresh prospective active generation for
  genuine later requests only.
- **D51-R5:** Re-enable never revives, recalculates, un-cancels, catches up, or
  mints another occurrence for prior admitted/canceled work.
- **D51-R6:** Every successful Off advances a separate monotonic cancellation
  epoch atomically with its policy head and is O(1) in current request count;
  non-Off edits do not advance it and re-enable retains it.
- **D51-R7:** Off performs no synchronous census, row-by-row fanout, child
  writes, recipient resolution, task/item/message/provider mutation, or count.
- **D51-R8:** Every request admission pins the current cancellation epoch;
  every D50 claim, D49 seal, in-product release, currently governed email
  preparation, and email submission-attempt admission compares that pin with the current epoch under
  one absent-row-safe stable-scope CAS/serialization discipline or complete-
  command retry.
- **D51-R9:** Off-first prevents every later D49 source seal from a fenced prior
  active generation; an indeterminate D49 occurrence becomes permanently
  source-fenced with no release or later retry; seal-first preserves immutable
  source history.
- **D51-R10:** Every descendant has one registered product-owned irreversible-
  effect admission boundary under the source fence: atomic source/presentation
  release for queryable in-product state; for currently governed email, the
  Phase 6 submission-attempt claim immediately before the network call.
  Neither read nor provider acceptance is the boundary; every future channel
  must prove its own boundary and cannot inherit email assumptions.
- **D51-R11:** Off-first prevents every later irreversible admission from the
  fenced source generation.
- **D51-R12:** Irreversible-admission-first preserves the exact authorized
  effect/history even when presentation/provider outcome occurs after Off; a
  released local item's active/unread state ends only through ADR-0027
  source-owned presentation end, never fabricated engagement.
- **D51-R13:** Currently governed email dispatch uses exactly **Unprepared**, **Prepared
  definitely unsubmitted**, or permanent **Submission may have begun** after
  attempt admission; independent provider outcome uses exactly **None**,
  **Accepted**, **Definitely rejected**, or **Indeterminate**. Off suppresses
  unadmitted/prepared work, permits later evidence reconciliation, and permits
  no provider call after Off, including a same-key follow-up or new attempt
  after definitive rejection.
- **D51-R14:** Provider scheduled-cancel capability is optional channel-specific
  narrowing and never policy/source truth or a D51 activation requirement.
- **D51-R15:** Off never rewrites accepted/rejected/ambiguous provider evidence
  or fabricates retraction, delivery failure, read, dismissal, or unseeing.
- **D51-R16:** Every unadmitted source/effect claim re-proves current D43/D48/
  policy fence, D50/later temporal rules, D49, authorization, and product claim.
- **D51-R17:** Off creates no second task, cancellation task, task mutation,
  cancellation notification, bell item, unread reset, email, or channel effect.
- **D51-R18:** Off/non-Off edits change no request, grant, EffectiveAccess,
  decision, holder status, D44 responsibility, source-backed task, or access.
- **D51-R19:** Phase 12 owns policy/cancellation epoch/source admission;
  ADR-0183 owns task; ADR-0027/Phase 17 owns presentation and engagement;
  Phase 6 owns external intent; provider owns provider evidence; executor owns none.
- **D51-R20:** Human permissions.manage_grants plus registered policy purpose
  authorizes policy publication; automatic source/effect claims use separate
  code-owned purposes and never impersonate the human.
- **D51-R21:** Future persistence/queries use non-null same-Tenant composites,
  application authorization, least grants, RLS USING/WITH CHECK, restrictive
  deletion, and owner/service/worker/support/BYPASSRLS parity.
- **D51-R22:** Tenant, actor/system purpose, policy/source/expected heads,
  cancellation and pinned epochs, revision, generation, occurrence/effect
  identity, and attribution are server-derived; callers cannot retarget them.
- **D51-R23:** Policy/fence/admission/provider receipts are immutable/history-
  preserving and permanently semantically idempotent beyond transport windows.
- **D51-R24:** Lost responses, failed reconciliation, duplicate events,
  executor/provider outage, and ambiguous calls recover from product receipts/
  claims without weakening Off, collapsing canonical dispatch/outcome axes, or
  resending blindly.
- **D51-R25:** Future policy UX is one explicit Save/Cancel form; no instant
  toggle, autosave, optimistic commit, save-on-blur, or background mutation.
- **D51-R26:** Selecting Off reveals one proportionate inline consequence
  review in the existing route-addressable Base Maia form/Sheet and replaces
  the ordinary primary action with **Turn off courtesy reminders**; there is no
  nested dialog/post-Save prompt, and exact preventable/history/already-being-
  sent/re-enable copy plus durable receipt recovery is required.
- **D51-R27:** UX exposes no current-work census/count/list, recipient names,
  provider internals, fake cancellation total, typed phrase, confirmation
  checkbox, or second confirmation.
- **D51-R28:** Off source mutation is O(1); bounded indexed reconciliation and
  per-effect claims may scale later but cannot define truth or block safe Off.
- **D51-R29:** Rollout is deny-first and cancellation-epoch-aware across every writer/
  executor before policy UI activation, with no historical backfill, bounded
  Tenant cohort, kill path, and roll-forward repair.
- **D51-R30:** D51 settles Off-fenced D49 indeterminate work as permanent
  no-release/no-retry; D52 must independently decide useful-lateness expiry for
  an otherwise current indeterminate occurrence when no Off/source-terminal
  fence occurred.

## Ruthless adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                                                   | Why it matters                                                                                         | Severity | Likelihood | Evidence or reasoning                                                                                                                                                      | Effect on answer                                                             | Best permanent fix                                                                                                   | Exact specification language                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D51 could turn an unvalidated optional reminder into a required product, or treat every cadence edit as current-cohort recomputation. | The former freezes speculative ministry workflow; the latter adds surprise, fanout, and catch-up debt. | High     | Medium     | D47 says runtime remains gated; SailPoint and Microsoft distinguish future configuration from current instances; no representative-ministry evidence proves cadence value. | Narrows Option 1; it does not invalidate prospective edit and Off semantics. | Keep D51 conditional and documentation-only; compare against prospective-only Off and reject recompute/pause/resume. | “D51 defines behavior only if the D47 reminder later activates. It creates no reminder runtime. Non-Off edits and re-enable affect only genuine later D43 creations; Off alone monotonically narrows preventable prior work.” |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                                   | Why it matters                                                                         | Severity | Likelihood             | Evidence or reasoning                                                                                                                                | Effect on answer                        | Best permanent fix                                                                                                                             | Exact specification language                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reusing ordinary policy-head equality as the fence would cancel old work after harmless interval edits; row-by-row cancellation would fail partially. | Either behavior violates immutable D50 packages and produces timing-dependent results. | Critical | High without amendment | The policy head advances on every edit, while cancellation must advance only on Off; distributed fanout cannot be atomic with unbounded descendants. | Changes the original answer materially. | Use a separate monotonic cancellation epoch, pinned at request admission and rechecked at every source/effect boundary under stable-scope CAS. | “Every distinct committed Off advances the cancellation epoch in the head transaction. Non-Off edits do not. Re-enable retains it. Every request pins it, and every D50/D49/release/attempt claim requires pinned epoch equals current epoch.” |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                             | Why it matters                                                                                                   | Severity | Likelihood | Evidence or reasoning                                                                                                                                  | Effect on answer                     | Best permanent fix                                                                                                                                                 | Exact specification language                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separate per-channel cancellation jobs, duplicated status enums, or provider identifiers as idempotency could become the de facto source model. | Later push/chat/digest/reminder channels would duplicate logic, drift semantically, and couple truth to vendors. | High     | Medium     | Workflow Orchestration keeps product claims authoritative; Resend idempotency lasts only 24 hours; providers expose different cancellation guarantees. | Narrows implementation architecture. | Centralize source/effect admission and preserve the independent canonical dispatch-phase and provider-outcome axes; keep channel adapters downstream and optional. | “One product-owned claim/receipt model governs all descendants. Channel adapters may narrow their own scheduled objects but cannot define cancellation, uniqueness, source state, or replay authority.” |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                              | Why it matters                                                                                                                  | Severity | Likelihood            | Evidence or reasoning                                                                                                                                 | Effect on answer                                          | Best permanent fix                                                                                                                                  | Exact specification language                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Off may overlap a D49 seal, in-product release, external call timeout, terminal request, stale admin form, repeated Off, or immediate re-enable. | These realistic races can create a late reminder, duplicate attempt, false success, or revival unless each has a named outcome. | High     | High over system life | RFC 9110 cautions against retrying non-idempotent calls; PostgreSQL requires whole-transaction retry; provider response loss is inherently ambiguous. | Requires explicit race table and receipts, not rejection. | Define linearization outcomes, canonical independent dispatch/outcome axes, expected-head/epoch recovery, and no post-Off provider call or revival. | “Every overlap resolves as Off-first or boundary-first. Unknown order aborts and retries the complete product command. Attempt-admitted dispatch remains Submission may have begun with None or Indeterminate outcome as evidence permits and is never blindly resent.” |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                             | Why it matters                                                                                                             | Severity | Likelihood | Evidence or reasoning                                                                                                                             | Effect on answer                                                               | Best permanent fix                                                                                                                    | Exact specification language                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An instant toggle/autosave, inflated cancellation count, typed confirmation, or support “uncancel” action could mislead or mutate unexpectedly. | Administrators need a deliberate but efficient stop; false recall claims damage trust and resurrection violates the fence. | High     | Medium     | WCAG G168 supports consequence review and cancellation, not ritual; current Core patterns use explicit server mutations and source-owned history. | Changes the UI from a toggle/modal concept to one inline reviewed form action. | Preserve local draft, show concise inline consequences, require specific action, recover receipt, and expose no resurrection control. | “Off is never autosaved. Selecting Off shows one inline review and primary action Turn off courtesy reminders. No count, typed phrase, nested modal, provider recall claim, or uncancel action is permitted.” |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                            | Why it matters                                                                                                    | Severity | Likelihood                     | Evidence or reasoning                                                                                                                          | Effect on answer                                       | Best permanent fix                                                                                                              | Exact specification language                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A policy, epoch, claim, cache, job, or provider receipt could be read or applied under another Tenant/environment/policy kind. | Cross-Tenant cancellation or delivery can suppress legitimate ministry work or disclose protected staff activity. | Critical | Low with controls; high impact | Identity and Access requires server-derived Tenant context; current platform makes application authorization primary and RLS defense in depth. | Requires hard scoping throughout, not only UI filters. | Use same-Tenant composite relationships, trusted scope derivation, purpose-scoped workers, and Tenant-keyed caches/idempotency. | “No D51 read, write, claim, receipt, replay, reconciliation, cache, or audit query may omit exact server-derived Tenant, environment, and policy kind; cross-scope references are structurally invalid.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                     | Why it matters                                           | Severity | Likelihood                     | Evidence or reasoning                                                                                                                   | Effect on answer                                          | Best permanent fix                                                                                                                                                           | Exact specification language                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caller-controlled actor/Tenant/epoch, incomplete WITH CHECK, mutable audit rows, absent-row races, or owner/service bypass could permit stale or cross-scope admission. | One privileged defect can defeat the entire Off promise. | Critical | Medium without explicit design | PostgreSQL documents distinct USING/WITH CHECK semantics and owner/BYPASSRLS exemptions; the repo requires application checks plus RLS. | Requires a later database design proof before activation. | Server-derived fields, non-null composite FKs, restrictive deletes, append-only receipts, stable scope row/advisory key, least grants, ordinary and privileged parity tests. | “All mutation paths derive scope, actor/system purpose, expected head, pinned/current epoch, identities, and attribution server-side. RLS supplies both USING and WITH CHECK; owner/service/worker/support paths prove identical Tenant and authorization outcomes.” |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                                       | Why it matters                                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                        | Effect on answer            | Best permanent fix                                                                                                            | Exact specification language                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Building a generic scheduler, universal provider recall framework, per-request preview, two-person approval, or current-cohort application would solve unchosen problems. | Complexity would delay a small policy safety rule and create long-lived machinery without evidence. | Medium   | Medium     | D51 has one occurrence and no chosen numeric cadence/useful window; vendor cancellation is channel-specific. | Narrows scope aggressively. | Specify semantic seams only: immutable heads, cancellation epoch, claims/receipts, one inline review, bounded reconciliation. | “D51 authorizes no scheduler framework, provider-recall abstraction, current-work application, impact census, approval workflow, channel adapter, or schema shape beyond the behavioral contracts required here.” |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                                      | Why it matters                                                                                                                        | Severity | Likelihood                       | Evidence or reasoning                                                                                                                                      | Effect on answer                    | Best permanent fix                                                                                                                                   | Exact specification language                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A switch suggests immediate reversible state; a nested modal interrupts context; internal terms, noisy counts, or a toast-only result obscure consequences and recovery. | Tenant administrators could believe all messages vanished, repeat an ambiguous save, or avoid the setting because it feels dangerous. | High     | High without copy/UI constraints | WCAG 2.2 requires clear labels/errors/status; G168 supports an identified consequence and cancel; Core uses Base Maia/Base UI and route-addressable forms. | Changes the exact journey and copy. | One local draft form/Sheet; inline impact statement; Off-specific primary action; durable status; mobile/reflow/localization proof; no impact count. | “Selecting Off reveals an inline review in the existing form and changes the primary action to Turn off courtesy reminders. Copy says Asym stops what it can still prevent, earlier in-product reminder history may remain, a reminder already being sent may still arrive, and requests, tasks, and access do not change.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                       | Why it matters                                                                            | Severity | Likelihood | Evidence or reasoning                                                                                                                                 | Effect on answer                            | Best permanent fix                                                                                                                                                          | Exact specification language                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy head, cancellation epoch, task, notification engagement, executor, or provider could each claim to own “canceled.” | Dual ownership creates circular repair, resurrection, fake read, and contradictory audit. | Critical | Medium     | ADR-0183 makes tasks projections; ADR-0027 separates presentation/engagement/source state; Workflow Orchestration makes product claims authoritative. | Requires explicit ownership and invariants. | Phase 12 owns policy/epoch/source admission; ADR-0027 owns presentation/engagement; Phase 6 owns external intent; providers only evidence; executor owns no business truth. | “Off truth is the Phase 12 cancellation-epoch advance. A task, item, read/archive state, provider status, event, or executor run cannot create, cancel, revive, complete, or reinterpret that source fact.” |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                        | Why it matters                                                                        | Severity | Likelihood | Evidence or reasoning                                                                                                           | Effect on answer                | Best permanent fix                                                                                                                    | Exact specification language                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D51 could silently depend on Inngest timing, D44 task state, a specific channel, provider scheduling, or current notification-table shape. | Replacing any dependency would alter correctness and block future reminders/channels. | High     | Medium     | Platform boundaries require identifier-only executors; D44 task and Phase 17 engagement are separate from cadence source truth. | Narrows permitted dependencies. | Define product command/claim interfaces and identifier-only wakes; adapters consume immutable identities and re-prove current source. | “Correctness is independent of executor, wake count, task state, channel availability, provider scheduling, and notification storage. Replacing any of them cannot alter epoch order or source/effect uniqueness.” |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                          | Severity | Likelihood | Evidence or reasoning                                                                                                   | Effect on answer                                    | Best permanent fix                                                                                                                                                | Exact specification language                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Off can commit while the response is lost, reconciliation can fail after truth changes, or an external call can be accepted despite a lost response. | Retrying the wrong layer can advance twice, send twice, or falsely report cancellation. | Critical | Medium     | Distributed calls have ambiguous success; Resend exposes finite transport idempotency; RFC 9110 limits automatic retry. | Requires durable semantic receipts and safe repair. | Deduplicate by durable business identity, return same receipt on command replay, keep fence effective through projection failure, and quarantine ambiguous calls. | “A lost Off response recovers the same semantic receipt and does not advance again. Failed reconciliation never weakens the fence. Submission may have begun plus None/Indeterminate outcome is reconciled, never blindly resent or labeled canceled.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                                       | Why it matters                                                                 | Severity | Likelihood | Evidence or reasoning                                                                                                                                         | Effect on answer                                                                                       | Best permanent fix                                                                                                                                                | Exact specification language                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Late wakes, clock drift, Off/re-enable races, duplicate events, and concurrent claims could jointly violate zero-or-one occurrence or resurrect old work. | Individually valid actions may create a second reminder or post-Off admission. | Critical | Medium     | D50 defines only a not-before boundary and explicitly leaves useful lateness unresolved; PostgreSQL requires whole-command retry after serialization failure. | D51 fences Off and settles Off-fenced indeterminate work, while D52 decides only active useful expiry. | Pin immutable source time and epoch; CAS every transition; semantic idempotency on durable effect identity; terminal no-revival states; no inferred clock window. | “D51 defines no useful-lateness window. Off permanently fences the same indeterminate occurrence. Regardless of D52, every claim is atomic, epoch-checked, terminal-state aware, and idempotent by exact source occurrence/effect—not event, job, HTTP request, or provider key.” |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                             | Why it matters                                                                                    | Severity | Likelihood | Evidence or reasoning                                                                       | Effect on answer                                 | Best permanent fix                                                                                                                                              | Exact specification language                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate policy revisions, mutable pinned epochs, orphan receipts, overwritten ambiguity, or delete cascades could erase why an effect was or was not allowed. | Reporting and support could no longer reconstruct access-attention history or prove Off behavior. | High     | Medium     | The governing ADRs require immutable policy/source history and product-database uniqueness. | Requires append-only identities and constraints. | Expected-head uniqueness, immutable epochs/receipts, same-Tenant FKs, no destructive cascade of audit, closed state transitions, reconciliation from authority. | “Pinned epoch and source/effect identity are immutable. Exact semantic keys are unique per Tenant. Provider evidence may only move through allowed knowledge transitions and may never be overwritten by policy state or deletion.” |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                            | Why it matters                                                                                                              | Severity | Likelihood | Evidence or reasoning                                                                                                       | Effect on answer                                                  | Best permanent fix                                                                                                                     | Exact specification language                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Impact previews, logs, provider metadata, or support tools could expose requester/holder/coordinator identities or sensitive ministry context. | Access-review activity may reveal staffing, location, member-care, or ministry relationships beyond the viewer’s authority. | Critical | Medium     | D37 intentionally permits only permission-safe aggregate effects; ADR-0027 forbids protected source detail in presentation. | Eliminates current-work counts/lists and constrains audit/export. | No pre-save census; body-free/minimized identifiers; current read ceilings; purpose-limited support; retention/redaction/export tests. | “The Off form exposes no current request, recipient, hidden/visible split, provider, or cancellation count. Logs and receipts contain only identifiers needed for authorized diagnosis and never protected request reason or ministry context.” |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                     | Why it matters                                                                                                  | Severity | Likelihood | Evidence or reasoning                                                                | Effect on answer                                | Best permanent fix                                                                                                                             | Exact specification language                                                                                                                                                                     |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Off latency could grow with requests/effects, or every claim could scan policy history. | Large Tenants would see timeouts precisely when trying to stop attention; locks could become global contention. | High     | Medium     | A row-by-row fanout is unbounded; indexed head/epoch compare is constant-scope work. | Requires quantitative architecture gates later. | O(1) source commit, indexed exact-scope lookup/CAS, bounded resumable reconciliation, no global lock, measured p95/p99 budgets before rollout. | “Off performs constant-count source writes independent of current cohort size. Claims use indexed exact-scope keys. Reconciliation is bounded, resumable, and cannot block or define Off truth.” |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                                 | Why it matters                                                               | Severity | Likelihood | Evidence or reasoning                                                                                                         | Effect on answer                                          | Best permanent fix                                                                                                                                         | Exact specification language                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operators may need direct SQL to fix stuck projections, interpret provider ambiguity, or “uncancel” requests after a mistaken save. | Manual repair is slow, unsafe, unaudited, and dependent on tribal knowledge. | High     | Medium     | Ambiguous delivery and lost responses are normal distributed-system cases; monotonic fences make rollback by mutation unsafe. | Requires product-owned repair and roll-forward playbooks. | Read-only evidence view, bounded replay by identity, quarantine/reconciliation commands, semantic receipt recovery, new prospective policy for correction. | “No repair requires mutating history or lowering an epoch. Supported repair replays projections/claims from authoritative receipts or publishes a new prospective policy; every repair is same-Tenant, authorized, idempotent, and audited.” |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                   | Why it matters                                                                     | Severity | Likelihood                   | Evidence or reasoning                                                                                                           | Effect on answer                                     | Best permanent fix                                                                                                                                                  | Exact specification language                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logs may show job success while business effects were suppressed, duplicated, ambiguous, or crossed the Off boundary. | Staff cannot distinguish expected late arrival from a security/correctness defect. | High     | High without domain evidence | Technical executor logs are explicitly non-authoritative; external acceptance and presentation release are separate boundaries. | Requires durable business audit plus metrics/traces. | Record actor/purpose, heads/epochs, source/effect identity, admission order, evidence transitions, suppression reason, and correlation—without sensitive body data. | “Durable audit proves which command/claim linearized, its expected and resulting head/epoch, and exact effect outcome. Technical logs and provider dashboards are diagnostic only and cannot substitute for business history.” |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                      | Why it matters                                                                                                               | Severity | Likelihood                  | Evidence or reasoning                                                                                                                             | Effect on answer                                 | Best permanent fix                                                                                                                                                | Exact specification language                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider cancellation, retention, webhook order, idempotency windows, or outages could be treated as uniform guarantees. | Slack, Teams, Google Chat, push, email, and future adapters have different semantics; vendor changes could break Core truth. | High     | High across future channels | Resend cancellation applies to its scheduled objects and idempotency lasts 24 hours; RFC 9110 does not make arbitrary external POST effects safe. | Rejects provider recall as D51 source semantics. | Product outbox/claim/evidence contract, adapter capability registry, webhook dedupe/reconciliation, canonical dispatch/outcome axes, provider-specific kill path. | “Provider capabilities may improve best-effort narrowing only after product admission. Missing, delayed, duplicated, or contradictory provider events cannot advance source truth or authorize another attempt.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                     | Why it matters                                                               | Severity | Likelihood               | Evidence or reasoning                                                                                 | Effect on answer                                                         | Best permanent fix                                                                                                                                            | Exact specification language                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- | ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New UI could publish Off while an old worker ignores epochs, or schema rollback could lose epoch data after new writes. | Mixed versions could emit precisely the reminders administrators turned off. | Critical | Medium during deployment | Fence safety requires every writer/executor path to check the same source boundary before activation. | Requires deny-first staged rollout; rollback after writes is not simple. | Add/read epoch compatibly; deploy all checks dark; shadow proof; bounded cohort; then writer/UI; kill admissions not source truth; roll forward after writes. | “Policy activation remains disabled until every source/effect path proves epoch enforcement in mixed-version tests. After any epoch-bearing write, rollback means disabling new admissions and rolling forward; history and epochs are never removed or decremented.” |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                             | Why it matters                                                                                | Severity | Likelihood                  | Evidence or reasoning                                                                                              | Effect on answer                                          | Best permanent fix                                                                                                                                                                | Exact specification language                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vague words such as pending, cancel, immediate, sent, or existing could let tests pass while behavior contradicts the decision. | The grill answer could drift across ADR, OpenSpec, tickets, schema, UI, and release evidence. | High     | High without numbered proof | D47–D50 already distinguish admission, seal, time candidate, and recipient proof; external outcome is multi-state. | Requires falsifiable numbered ACs and artifact trace map. | Test boundaries/outcomes rather than implementation; require positive, negative, Tenant, RLS, concurrency, migration, accessibility, performance, and production-shaped evidence. | “Every implementation artifact traces D51-R and D51-AC identifiers. Release evidence proves Off-first and boundary-first races, non-Off epoch stability, re-enable no-revival, all privileged paths, receipt recovery, exact UX copy, and zero unauthorized effects.” |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                                     | Why it matters                                                                                                | Severity | Likelihood | Evidence or reasoning                                                                                           | Effect on answer                                   | Best permanent fix                                                                                          | Exact specification language                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Teams could confuse immediate logical narrowing with immediate physical cleanup, choose D52 lateness implicitly, or add cancellation notifications/tasks “for clarity.” | That would reintroduce false guarantees, duplicate attention, and scope hidden inside implementation tickets. | High     | Medium     | D50 explicitly leaves usefulness open; ADR-0183/0027 prohibit task/notification state from owning source truth. | Requires explicit non-decisions and next decision. | State logical-vs-physical boundary, forbid secondary artifacts, and ask D52 before implementation planning. | “Immediate means the source fence is effective at the Off commit; it does not promise synchronous fanout, provider recall, deletion, or non-arrival. D51 creates no task/message and makes no useful-lateness choice; it does permanently end an Off-fenced indeterminate occurrence.” |

## Acceptance criteria

### Decision scope and evidence

- **D51-AC001:** The D51 change set contains this decision document only and no
  runtime, schema, migration, OpenSpec, UI, event, job, key, or telemetry change.
- **D51-AC002:** A repository scan proves no D43–D51 production cadence policy,
  cancellation epoch, occurrence, effect, provider adapter, or policy UI exists
  before later implementation.
- **D51-AC003:** The documented founder choice remains conditional on separate
  activation proof that the optional D47 reminder should ship.
- **D51-AC004:** The decision explicitly compares prospective-only Off and
  recompute/pause/resume as the two strongest alternatives.
- **D51-AC005:** The record distinguishes verified repository facts, verified
  current primary evidence, reasonable inference, product judgment, and unknowns.
- **D51-AC006:** No vendor comparator is treated as authority over a conflicting
  accepted Core ADR or OpenSpec requirement.
- **D51-AC007:** Current behavior, intended behavior, and permanent ownership
  are separately stated for policy, Off, re-enable, occurrence, effects, tasks,
  and UX.
- **D51-AC008:** “Immediate” is testably defined as logical source-fence effect
  at the successful Off commit, not synchronous descendant mutation.
- **D51-AC009:** “Cancel” is testably limited to preventing source/effect
  admissions Core still controls, not recall, deletion, unread reset, or unseeing.
- **D51-AC010:** D52 useful-lateness values remain explicitly undecided while
  D51 expressly settles Off-fenced D49 indeterminate work as no-release/no-retry.

### Policy revision, prospectivity, and re-enable

- **D51-AC011:** Every accepted policy save appends one immutable revision and
  advances one expected Tenant/environment/policy-kind head or writes nothing.
- **D51-AC012:** A stale expected-head save writes no revision, epoch change,
  source mutation, descendant, audit success, or side effect.
- **D51-AC013:** A lost-response replay of one semantic save returns its original
  receipt and does not append another revision.
- **D51-AC014:** A non-Off-to-non-Off edit does not advance the cancellation
  epoch.
- **D51-AC015:** An older admitted request retains its immutable D50 policy
  package and candidate after a non-Off edit.
- **D51-AC016:** A genuine D43 source creation ordered after the new non-Off
  policy boundary under D48's shared serialization atomically pins that
  revision and current cancellation epoch in its immutable disposition.
- **D51-AC017:** A genuine D43 source creation ordered before the new non-Off
  policy boundary cannot inherit the new interval through worker delay or retry.
- **D51-AC018:** Re-enable after Off appends a prospective active revision while
  retaining the already advanced cancellation epoch.
- **D51-AC019:** Only genuine D43 source creations ordered after the re-enable
  policy boundary under D48's shared serialization may atomically pin that
  epoch and active revision in their immutable disposition.
- **D51-AC020:** Re-enable cannot revive, unseal, un-cancel, recalculate, move,
  catch up, or create another occurrence/effect for any prior request.

### Cancellation epoch and source fence

- **D51-AC021:** Every distinct successfully committed Off command advances the
  cancellation epoch exactly once in the same atomic transaction as its policy
  head.
- **D51-AC022:** Replaying the same Off command does not advance the epoch again.
- **D51-AC023:** Saving a distinct later Off revision advances the epoch again,
  including after an intervening active revision.
- **D51-AC024:** Off performs a constant number of authoritative source writes
  independent of request, occurrence, member, task, item, intent, or provider
  row counts.
- **D51-AC025:** Off performs no synchronous census, count, per-request lock,
  fanout, recipient resolution, task mutation, effect mutation, or provider call.
- **D51-AC026:** Every new D48 request admission pins the server-read current
  cancellation epoch in its immutable source package.
- **D51-AC027:** Every D50 claim compares pinned and current epochs under the
  same stable-scope serialization/CAS discipline used by Off.
- **D51-AC028:** Every D49 occurrence seal compares pinned and current epochs
  under that discipline.
- **D51-AC029:** Every atomic in-product release compares pinned and current
  epochs under that discipline; in-product uses no external prepared-artifact
  state and retains the canonical **prepared.none@1** no-artifact posture.
- **D51-AC030:** Every currently governed email preparation and
  submission-attempt admission compares pinned and current epochs under that
  discipline.

### Source and irreversible-effect boundaries

- **D51-AC031:** If Off advances the epoch first, a prior request's later D50
  claim is denied without a source occurrence or descendant.
- **D51-AC032:** If Off advances the epoch first, a prior request's later D49
  seal is denied and remains terminally unable to seal.
- **D51-AC033:** If a D49 seal commits first, its immutable source history
  remains after Off.
- **D51-AC034:** A D49-indeterminate occurrence becomes permanently
  source-fenced when Off commits, releases nobody, and never retries or revives.
- **D51-AC035:** A seal-first descendant that has not crossed its own
  irreversible boundary is denied when Off wins the later boundary race.
- **D51-AC036:** The in-product irreversible boundary is one atomic source/
  presentation release commit that makes the item queryable.
- **D51-AC037:** A human view, read, unread, archive, restore, or dismissal is
  never used as the in-product irreversible boundary.
- **D51-AC038:** The currently governed email irreversible boundary is a Phase
  6 product-owned exact submission-attempt admission/claim immediately before
  the first byte may leave Asym.
- **D51-AC039:** Provider acceptance, webhook arrival, delivery, open, or click
  is never used as the external irreversible boundary.
- **D51-AC040:** Unknown serialization order aborts/retries the complete product
  command; no path guesses Off-first or boundary-first from timestamps.

### Currently governed email dispatch, local presentation, and evidence

- **D51-AC041:** Off-first suppresses **Unprepared** email work without
  artifact sealing, attempt admission, provider I/O, or fabricated provider
  outcome.
- **D51-AC042:** Off-first suppresses email **Prepared definitely unsubmitted** work
  before provider I/O while preserving its exact immutable preparation and
  suppression evidence.
- **D51-AC043:** Once submission-attempt admission commits, dispatch becomes
  **Submission may have begun** before the first byte may leave Asym and never
  regresses to **Prepared definitely unsubmitted**.
- **D51-AC044:** Provider outcome is independent of dispatch and remains exactly
  **None**, **Accepted**, **Definitely rejected**, or **Indeterminate**.
- **D51-AC045:** Local attempt-admission-before-Off order does not assert when
  or whether the provider accepted the call.
- **D51-AC046:** A timeout, lost response, disconnect, contradictory response,
  or unknown provider schema never becomes **Definitely rejected** or
  **Accepted** by guess.
- **D51-AC047:** After Off, **Submission may have begun** permits reconciliation
  and webhook evidence reduction but no same-key follow-up call, new attempt,
  rekey, replacement payload, or blind resend.
- **D51-AC048:** An **Accepted** outcome learned after Off remains accepted
  evidence for the boundary-first attempt and does not claim delivery, reading,
  understanding, or business completion.
- **D51-AC049:** A **Definitely rejected** outcome learned after Off remains
  rejected evidence and authorizes no follow-up or new attempt.
- **D51-AC050:** A provider-specific scheduled-cancel adapter, if separately
  authorized later, cannot alter source epoch, dispatch history, provider
  outcome evidence, or the D51 activation gate; every future push/chat channel
  registers and proves its own admission/finality/recovery boundary and cannot
  inherit email assumptions or create a generic cancellation engine.

### Lifecycle, concurrency, idempotency, and recovery

- **D51-AC051:** Product-database uniqueness allows at most one D49 courtesy
  occurrence for the exact D43 request episode regardless of policy revision,
  epoch, event, wake, job, or provider key.
- **D51-AC052:** Product-database uniqueness allows at most one exact
  irreversible descendant admission per occurrence, recipient, contract step,
  and presentation/delivery identity.
- **D51-AC053:** D43 terminal or no-longer-applicable source truth independently
  denies an unadmitted occurrence/effect even when pinned epoch still matches.
- **D51-AC054:** Authorization or current-recipient narrowing independently
  denies an unadmitted descendant and never widens because the epoch matches.
- **D51-AC055:** Duplicate and out-of-order events recover the same semantic
  occurrence/effect receipt and create no second business effect.
- **D51-AC056:** A lost successful Off response is recovered by command identity
  and returns the committed head/epoch/audit receipt without another advance.
- **D51-AC057:** A reconciliation or projection failure after Off leaves the
  epoch effective and is repairable without rewriting source truth.
- **D51-AC058:** An old worker waking after Off is denied at the product claim;
  executor retry policy cannot bypass the epoch or create catch-up.
- **D51-AC059:** Serialization or deadlock failure retries the complete command,
  including all selection and authorization logic, rather than only the failed
  SQL statement.
- **D51-AC060:** Every semantic idempotency identity remains durable for the
  business retention period and is not bounded by an executor, HTTP, or
  provider idempotency window.

### Database, RLS, and authorization

- **D51-AC061:** Every policy, request package, occurrence, member, effect,
  receipt, and audit row has non-null exact Tenant scope.
- **D51-AC062:** Every cross-entity relationship uses a same-Tenant composite
  foreign key or an equivalently proved same-Tenant invariant.
- **D51-AC063:** The browser cannot supply trusted Tenant, actor, policy kind,
  expected/current/pinned epoch, source/effect identity, or audit attribution.
- **D51-AC064:** A human policy save requires server-proved current
  **permissions.manage_grants** and the registered exact policy-management
  purpose.
- **D51-AC065:** Automated source/effect claims use distinct registered
  code-owned purposes and cannot impersonate the human policy actor.
- **D51-AC066:** Application authorization denies an out-of-Tenant or
  unauthorized read/write even if a direct row identifier is valid.
- **D51-AC067:** RLS SELECT/UPDATE/DELETE policies use restrictive **USING** and
  INSERT/UPDATE policies use restrictive **WITH CHECK** for both old and new
  row scope.
- **D51-AC068:** An allowed update cannot change Tenant, policy kind, epoch,
  source identity, effect identity, actor, or attribution into a forbidden state.
- **D51-AC069:** Owner, service-role, worker, support, function, view, RPC, and
  BYPASSRLS paths prove the same Tenant and purpose outcomes as ordinary paths.
- **D51-AC070:** Delete behavior preserves required policy, epoch, occurrence,
  effect, provider-evidence, and audit history and cannot cascade away proof of
  an admitted or suppressed effect.

### Ownership, tasks, channels, and executor boundaries

- **D51-AC071:** Phase 12 policy/request source owns the policy head,
  cancellation epoch, pinned epoch, occurrence ceiling, and Off decision.
- **D51-AC072:** ADR-0027/Phase 17 owns in-product presentation and personal
  engagement without owning policy, source cancellation, task, or access.
- **D51-AC073:** Phase 6 owns currently governed email intent, attempt admission, and provider
  evidence without owning policy, request, task, or access.
- **D51-AC074:** ADR-0183/D44 owns the one source-backed task projection without
  owning courtesy reminder cancellation or effect history.
- **D51-AC075:** The executor receives identifiers only, re-enters a product
  claim, and owns no ordering, authorization, idempotency, or recall truth.
- **D51-AC076:** Off creates no task, cancellation task, task completion,
  reassignment, due date, reminder, escalation, or Tasks Hub status change.
- **D51-AC077:** Off creates no cancellation notification, bell occurrence,
  email, push, SMS, Slack, Teams, Google Chat, digest, or recipient-facing event.
- **D51-AC078:** Off does not change D43 request state, grant, EffectiveAccess,
  holder status, reviewer decision, responsibility, or any access outcome.
- **D51-AC079:** A released in-product item ends active/unread attention only
  through ADR-0027 source-owned presentation end, never fabricated read,
  dismissal, archive, deletion, or engagement.
- **D51-AC080:** Permitted Recent history and immutable audit may remain after a
  source-owned presentation end, subject to current authorization and retention
  ceilings.

### UX, accessibility, localization, and privacy

- **D51-AC081:** D51 itself renders no policy field, toggle, form, placeholder,
  cancellation status, task, notification, or telemetry.
- **D51-AC082:** A later complete policy editor uses the existing
  route-addressable Base Maia form/Sheet, shared Base UI components, and Zinc
  tokens rather than a bespoke cadence surface.
- **D51-AC083:** Selecting any option changes only a preserved local draft;
  there is no instant switch, autosave, optimistic commit, save-on-blur, or
  background mutation.
- **D51-AC084:** A non-Off interval edit shows: “Applies to access review
  requests created after you save. Existing requests keep their current
  reminder timing.”
- **D51-AC085:** Re-enable shows: “Applies only to access review requests
  created after you save. Reminders canceled while Off will not restart.”
- **D51-AC086:** Selecting Off reveals one inline consequence review stating
  that Asym stops every pending reminder it can still prevent, earlier
  in-product reminder history may remain, a reminder already being sent may
  still arrive, re-enable includes only new requests, and requests/tasks/access
  do not change.
- **D51-AC087:** The inline Off review replaces the ordinary primary action with
  **Turn off courtesy reminders** and retains **Cancel** in the same surface.
- **D51-AC088:** Off uses no nested dialog/modal/Sheet, post-Save prompt, typed
  phrase, checkbox, countdown, second confirmation, or destructive-color-only
  meaning.
- **D51-AC089:** A stale expected head/epoch preserves the local draft, explains
  that settings changed, reloads authoritative context, and requires a fresh
  deliberate submit.
- **D51-AC090:** An ambiguous save response first recovers the authoritative
  receipt; it never asks the administrator to click the action again blindly.
- **D51-AC091:** Success is durable in the form and programmatically announced;
  it is not toast-only and does not claim all reminders were canceled.
- **D51-AC092:** Keyboard order, visible focus, screen-reader name/description,
  error association, status announcement, and non-color consequence meaning
  pass the repository's WCAG 2.2 target.
- **D51-AC093:** The form/review passes 320 CSS-pixel reflow, 400-percent zoom,
  target-size, forced-colors, reduced-motion, mobile touch, and low-bandwidth
  retry/recovery checks.
- **D51-AC094:** Copy supports localization, RTL, CJK expansion, and local
  terminology without exposing internal epoch, claim, provider, or worker
  jargon.
- **D51-AC095:** The form, confirmation review, logs, receipts, and support
  surfaces expose no current-work count/list, requester/holder/recipient names,
  visible/hidden split, protected reason, provider body, or ministry context.

### Scale, operations, migration, and rollout

- **D51-AC096:** Load proof shows Off source-write count and lock set are
  invariant as a Tenant grows from zero to production-shaped current requests.
- **D51-AC097:** Every admission lookup uses an indexed exact
  Tenant/environment/policy-kind/pinned-epoch path and no policy-history scan.
- **D51-AC098:** Reconciliation is bounded, resumable, idempotent, observable,
  and unable to weaken, delay, or redefine the committed source fence.
- **D51-AC099:** Authorized repair can replay a projection/claim from immutable
  receipts without direct SQL, history mutation, epoch decrement, or
  cross-Tenant access.
- **D51-AC100:** A mistaken Off is corrected only by a new prospective active
  revision; no support or administrator path can lower the epoch or uncancel
  prior work.
- **D51-AC101:** Schema rollout, if later authorized, is additive and readable
  by old code before any epoch-bearing writer is enabled.
- **D51-AC102:** Every D50/D49/Phase 17/Phase 6 claim path is deployed
  epoch-aware and fail-closed before the Off writer or policy UI is enabled.
- **D51-AC103:** Mixed old/new code and old/new schema tests prove no old worker
  can admit work after an Off-first epoch advance.
- **D51-AC104:** Activation begins with a complete compatible bounded Tenant
  cohort and exposes no partial channel or worker coverage within an activated
  Tenant.
- **D51-AC105:** The kill path disables new policy/source/effect admissions
  without deleting history, decrementing epochs, changing access/tasks, or
  pretending provider recall.

### Testability, traceability, and release proof

- **D51-AC106:** Positive tests prove future request admission under a new
  non-Off revision and under re-enable.
- **D51-AC107:** Negative tests prove non-Off edits do not change older packages
  or cancellation epochs and re-enable does not revive prior work.
- **D51-AC108:** Deterministic concurrency tests prove Off-first, D49-seal-first,
  in-product-release-first, email-preparation-first, and email-attempt-
  admission-first outcomes at transaction boundaries.
- **D51-AC109:** Crash-point tests cover before/after epoch commit, D49 seal,
  queryable in-product release, email preparation, attempt fence, first
  provider byte, response receipt, and evidence reconciliation.
- **D51-AC110:** Authorization tests cover valid, missing, revoked, cross-Tenant,
  stale-role, caller-retargeted, requester-self, and every privileged path.
- **D51-AC111:** Database tests cover same-Tenant FKs, nullability, uniqueness,
  immutable columns, allowed/forbidden evidence transitions, restrictive
  delete, RLS **USING**, RLS **WITH CHECK**, and transform-to-forbidden updates.
- **D51-AC112:** Accessibility tests prove the exact inline review, focus/order,
  accessible names/descriptions/errors/status, reflow, zoom, forced colors,
  target size, keyboard-only use, and assistive-technology announcements.
- **D51-AC113:** Performance tests publish explicit units and p50/p95/p99 Off
  latency, lock wait, claim latency, and reconciliation throughput at a
  production-shaped largest-Tenant fixture before activation.
- **D51-AC114:** Migration tests prove old-code/new-schema, new-code/old-schema
  guard behavior, mixed-version deny-first sequencing, backup/restore, kill
  path, and roll-forward after epoch-bearing writes.
- **D51-AC115:** Traceability maps each D51-R and D51-AC into the glossary, ADR,
  OpenSpec requirements/design/tasks, GitHub tickets, implementation, tests,
  migration evidence, UX evidence, and release artifact with no contradictory
  terms, states, limits, or owners.

### Monitoring, non-decisions, and final gate

- **D51-AC116:** Durable audit distinguishes Off-first suppression,
  seal-first/source history, release-first presentation, external preparation
  suppression, attempt-admission-first, and later provider evidence without
  inferring provider timing.
- **D51-AC117:** Production logs/traces contain only Tenant-safe opaque
  identifiers and never prepared bodies, request reasons, recipient identities,
  protected ministry context, or caller-supplied attribution.
- **D51-AC118:** D52 independently defines the active useful-lateness fence and
  expiry of otherwise-current D49-indeterminate proof; no D51 implementation
  infers a value from a scheduler, retry policy, provider, or UI.
- **D51-AC119:** Representative authorized ministry-administrator usability
  evidence must meet the named comprehension/error thresholds below before UI
  activation; until then the copy remains a product judgment, not verified fact.
- **D51-AC120:** Release is blocked unless all requirements and acceptance
  criteria trace green, every named monitor is wired with an owner/response,
  zero known cross-Tenant or post-Off-admission defects remain, and rollback/
  repair evidence is complete.

## Implementation proof matrices

These matrices constrain a later design; they do not prescribe table names or
authorize implementation.

### State and transition matrix

| Conceptual state                                                                | Permitted next transition                                                         | Required guard                                         | Forbidden transition                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| Active request package, candidate not reached                                   | Same package remains waiting; ordinary D43 terminal; later D52 expiry; Off-fenced | Immutable D50 package, current source, pinned epoch    | Recalculate from newer interval; second package     |
| D49 proof indeterminate, no Off/source terminal                                 | Retry the same occurrence only under later D52 usefulness rule                    | Same occurrence identity, current source, pinned epoch | Partial recipient release; guessed zero             |
| D49 proof indeterminate when Off advances                                       | Permanent source-fenced/no-release                                                | Current epoch differs from pin                         | Retry after Off or re-enable; new occurrence        |
| Occurrence sealed, descendant unadmitted                                        | Exact descendant admission or Off suppression                                     | Current source/recipient/auth plus epoch CAS           | Bypass to presentation/provider                     |
| In-product release admitted                                                     | Source-owned presentation end; authorized Recent history                          | ADR-0027 presentation/engagement contract              | Undo history; fabricate read/archive/dismiss/delete |
| Governed email **Unprepared**                                                   | Prepare exact artifact or Off suppress                                            | All live gates plus epoch CAS                          | Provider I/O                                        |
| Governed email **Prepared definitely unsubmitted**                              | Attempt admission then exact I/O, or Off suppress                                 | Sealed bytes/identity plus epoch CAS                   | Claim submission after Off; mutate bytes            |
| Governed email **Submission may have begun** + **None/Indeterminate**           | Evidence reconciliation only after Off                                            | Same frozen identity; verified evidence                | Regression; follow-up call; rekey; blind resend     |
| Governed email **Submission may have begun** + **Accepted/Definitely rejected** | Later lifecycle evidence/audit only after Off                                     | Verified evidence                                      | Retry after Off; rewrite source cancellation        |
| Off head/current epoch                                                          | New prospective active head retaining epoch                                       | Authorized expected-head command                       | Lower epoch; revive old work                        |

### Invariant enforcement matrix

| Invariant                               | Authoritative enforcement seam                                                  | Required independent proof                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Non-Off edits do not cancel old work    | Separate cancellation epoch not advanced by non-Off                             | Concurrent old-package claim survives interval edit                           |
| Off is immediate and O(1)               | Atomic policy-head + epoch + audit/receipt + identifier-only outbox transaction | Query/write/lock plan invariant across zero and largest-Tenant fixtures       |
| Off-first prevents admission            | Pinned/current epoch equality in every product claim                            | Deterministic transaction barriers at D50, D49, release, preparation, attempt |
| Boundary-first preserves history        | Immutable occurrence/effect/dispatch receipts                                   | Late presentation/provider-evidence fixtures after Off                        |
| Zero-or-one occurrence/effect           | Product-database semantic uniqueness                                            | Duplicate/out-of-order event and restore tests                                |
| No revival                              | Monotonic epoch plus terminal source-fenced occurrence                          | Off → re-enable → stale wake/indeterminate retry tests                        |
| Tenant isolation                        | Application auth + same-Tenant composites + RLS                                 | Ordinary and privileged cross-Tenant negative matrix                          |
| Task/access non-effect                  | Domain mutation allowlist and sink audit                                        | Before/after snapshots of D43, grants, EffectiveAccess, D44 task              |
| Governed email truth remains orthogonal | Canonical dispatch phase and provider outcome reducers                          | Every allowed/forbidden transition and contradictory evidence fixture         |
| Presentation truth remains separate     | ADR-0027 source-owned presentation end                                          | Read/unread/archive/source-end race tests                                     |

### Authorization and RLS matrix

| Path                           | Required authority/context                                                      | May do                                                    | Must not do                                           | Proof                           |
| ------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------- |
| Human policy read              | Active Tenant Assignment, exact visibility, current Tenant                      | Read safe policy/head status                              | Read protected current-work impact                    | Application-auth + RLS matrix   |
| Human policy save              | Current **permissions.manage_grants**, registered policy purpose, expected head | Append exact policy revision; Off may advance epoch       | Supply trusted scope/epoch/actor; mutate work/effects | API negative tests + real DB    |
| D50/D49 source claim           | Registered code-owned purpose, exact source identity, current Tenant            | Claim/seal exact occurrence if all gates pass             | Impersonate human; broaden recipients                 | Concurrency/auth property tests |
| In-product release             | Registered Phase 17 purpose, exact occurrence/member, current role/surface      | Atomic queryable release                                  | Create task/access; bypass epoch                      | Phase 17 public-seam tests      |
| Governed email prepare/attempt | Registered Phase 6 purpose, exact frozen intent/member/bytes                    | Prepare or admit exact attempt if all gates pass          | Caller bytes/recipient; post-Off I/O                  | Phase 6 crash/provider harness  |
| Support/repair                 | Purpose-limited audited support capability                                      | Inspect body-free evidence; replay exact projection/claim | Lower epoch; rewrite history; resend ambiguity        | Support-role RLS/abuse tests    |
| Owner/service/BYPASSRLS        | Server-only registered purpose and Tenant                                       | Same product command only                                 | Direct favorable write/bypass                         | Privileged parity suite         |

### Privacy and retention matrix

| Surface or sink                  | Minimum permitted data                                                     | Forbidden data/effect                                              | Owner/proof                            |
| -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| Ordinary policy form             | Current choice, prospective-impact copy, Off consequence, durable result   | Current request/recipient counts or names; reasons; provider state | Access Product + Privacy snapshot      |
| In-product reminder              | Registered role-safe ADR-0027 projection                                   | Protected request body copied into presentation; shared engagement | Phase 17 contract tests                |
| Task Hub                         | Existing D44 source-backed task only                                       | Cancellation task/status/message from D51                          | Tasks Platform sink audit              |
| Governed email prepared artifact | Exact Phase 6 contract minimum under registered retention class            | Indefinite body retention; cross-channel reuse                     | Communications + retention purge proof |
| Product audit                    | Opaque identities, actor/purpose, heads/epochs, boundary/evidence receipts | Message body, protected reason/context, secrets                    | IAM + Security schema/log review       |
| Technical logs/traces            | Correlation and safe reason codes                                          | Emails, display names, provider payload, ministry context          | SRE log-sink inspection                |
| Support/export/backup            | Purpose-authorized minimum, same-Tenant history                            | Broad body export or unauthorized restored presentation            | Privacy + Support + restore tests      |

### Scale and performance matrix

| Operation                   | Required bound                                                                 | Release/production threshold                                                                                                              | Safety response                                                              |
| --------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Off source command          | Constant-count exact-scope writes/locks; no cohort dependence                  | Missing approved source-command p50/p95/p99/lock budget blocks activation; two consecutive registered windows over budget pause expansion | Inspect scope key/index/lock plan; never add stale cache or weaken fence     |
| Policy read/save form       | One exact policy/head read plus authorized command                             | p95 above 2× established People & access settings baseline for 15 minutes with at least 100 eligible operations                           | Pause expansion; inspect auth/query plan; keep explicit durable save         |
| D50/D49/effect claim        | Indexed exact-scope lookup/CAS; bounded recipient/member set                   | Missing approved claim budget blocks activation; two consecutive windows over budget pause expansion                                      | Inspect index/contention; fail closed, never skip proof                      |
| Projection reconciliation   | Bounded batches, fair per-Tenant partition, resumable cursor                   | p95 lag above 60 seconds for 15 minutes or any item above 300 seconds                                                                     | Replay exact receipts; inspect outbox/worker; source fence remains effective |
| Provider evidence reduction | One frozen attempt identity; bounded verified events                           | Breach of registered evidence-reconciliation SLO or backlog safety ceiling                                                                | Quarantine/reconcile; no resend or inferred outcome                          |
| Largest-Tenant fixture      | Published cardinalities, query plans, p50/p95/p99, lock waits, memory, retries | Missing production-shaped evidence blocks cohort activation                                                                               | Add indexes/bounds or redesign; never truncate safety proof                  |

### Migration, rollout, rollback, and upgrade matrix

| Stage                  | Required action/evidence                                                  | Activation allowed             | Kill/repair posture                                  |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------- |
| 0 — Reserved           | Ratify D51/D52 and research gate; no runtime key                          | No                             | Documentation rollback only                          |
| 1 — Additive substrate | Add immutable heads/epoch/pins/claims/receipts compatibly                 | No writer/UI                   | Remove no written history; validate backup/restore   |
| 2 — Deny-first readers | Deploy epoch checks to every D50/D49/Phase 17/Phase 6 path                | No Off writer/UI               | Claims fail closed; repair defects before proceeding |
| 3 — Shadow proof       | Exercise no-send/concurrency/restore/privileged paths on complete Tenants | No external effect             | Compare receipts; zero safety discrepancy required   |
| 4 — Bounded cohort     | Enable complete compatible Tenant cohort with kill and monitors           | Only after all gates green     | Disable new admissions; keep source/history          |
| 5 — Expansion          | Expand by certified capacity and representative UX evidence               | Yes, bounded                   | Pause cohort growth on any threshold                 |
| Post-write rollback    | Preserve policy/epoch/pin/history and disable favorable admissions        | No destructive schema rollback | Roll forward; replay projections from receipts       |

### Test and traceability matrix

| Proof family             | Required fixtures/outcomes                                                                 | Release evidence                                        |
| ------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Positive/negative        | Prospective edit/re-enable; unchanged old work; Off narrowing; no task/access effect       | Public API/domain outcomes                              |
| Boundary/concurrency     | Off versus D50, D49, in-product release, external prepare, attempt admission               | Deterministic barrier traces and DB receipts            |
| Idempotency/failure      | Duplicate/out-of-order events, lost responses, crashes at every boundary, outage/restore   | Same identity/effect, no blind resend                   |
| Authorization/Tenant/RLS | Every role/path, cross-Tenant IDs, caller retargeting, USING/WITH CHECK, privileged bypass | Real database policy suite                              |
| Data/evidence            | Constraints, immutable pins/epochs, dispatch/outcome transitions, delete/restore           | Migration and property tests                            |
| UX/accessibility/privacy | Exact copy/action, stale save, low bandwidth, keyboard/AT/mobile/locale, every sink        | Playwright/manual WCAG, localization, log/export review |
| Performance/scale        | Zero/typical/largest Tenant, contention/noisy neighbor, query plans and budgets            | Published p50/p95/p99/locks/throughput                  |
| Trace                    | D51-R/AC to glossary, ADR, OpenSpec, design, tickets, code, tests, release                 | Machine-auditable coverage with zero contradiction      |

## Named production and release monitors

Safety-invariant thresholds are zero tolerance. Operational thresholds alert
and pause expansion; they never mutate source truth or silently widen access.
All metric dimensions must be cardinality-bounded and Tenant-safe.

| Signal                                                                                                                           | Threshold                                                                                                                    | Owner                                           | Required response                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **D51-CROSS-TENANT-ACCESS** — policy/epoch/claim/effect/read/write scope mismatch                                                | Any event                                                                                                                    | IAM Security + Database SRE                     | Disable affected admissions, open a security incident, preserve evidence, determine exposure, repair authorization/RLS before re-enable |
| **D51-NON-OFF-EPOCH-ADVANCE** — non-Off command changes cancellation epoch                                                       | Any event                                                                                                                    | Phase 12 IAM                                    | Disable policy writer, correct transaction, audit affected requests, prove no suppression, roll forward                                 |
| **D51-POST-OFF-SOURCE-ADMISSION** — D50/D49 claim succeeds with pinned epoch unequal to current                                  | Any event                                                                                                                    | Phase 12 IAM + Platform SRE                     | Kill source/effect admissions for affected cohort, incident, reconcile exact identities, repair CAS/serialization                       |
| **D51-POST-OFF-EFFECT-ADMISSION** — in-product release or external attempt admitted after Off-first                              | Any event                                                                                                                    | Phase 17/6 + IAM Security                       | Kill affected channel admissions, preserve receipts/provider evidence, notify incident owner, repair before expansion                   |
| **D51-REENABLE-REVIVAL** — prior fenced occurrence/effect retries or revives after re-enable                                     | Any event                                                                                                                    | Phase 12 IAM                                    | Disable re-enable writer/admissions, quarantine revived work, reconcile without sending, correct generation/epoch proof                 |
| **D51-D49-FENCED-INDETERMINATE-RETRY** — Off-fenced indeterminate proof retries/releases                                         | Any event                                                                                                                    | Phase 12 IAM                                    | Stop worker path, suppress descendants, preserve occurrence evidence, fix terminal state transition                                     |
| **D51-DUPLICATE-OCCURRENCE-OR-EFFECT** — semantic uniqueness violation                                                           | Any event                                                                                                                    | Phase 12 + Data Platform                        | Stop affected admissions, identify causal identity defect, suppress unadmitted duplicate, never delete admitted history                 |
| **D51-DISPATCH-STATE-REGRESSION** — **Submission may have begun** regresses or axes collapse                                     | Any event                                                                                                                    | Communications Platform                         | Quarantine attempt, block provider calls, restore canonical reducer from immutable evidence, incident review                            |
| **D51-POST-OFF-PROVIDER-CALL** — any call/follow-up/new attempt for a pre-Off pinned epoch after Off                             | Any event                                                                                                                    | Communications Platform + Security              | Disable adapter, preserve provider evidence, investigate recipients/effects, repair call gate; never claim recall                       |
| **D51-PROVIDER-AMBIGUITY-SLO** — **None/Indeterminate** attempt exceeds registered evidence-reconciliation SLO                   | Any breach, or missing SLO for an enabled adapter                                                                            | Communications Operations                       | Reconcile/quarantine same frozen attempt, inspect webhook/provider, no resend/rekey; pause adapter expansion                            |
| **D51-FAKE-LOCAL-ENGAGEMENT** — Off writes read/unread/archive/dismiss/delete instead of source end                              | Any event                                                                                                                    | Phase 17 + Access Product                       | Disable presentation reconciler, restore from source/engagement history, correct ADR-0027 transition                                    |
| **D51-SECONDARY-ARTIFACT** — Off creates/mutates task, notification, email/chat, access, or request                              | Any event                                                                                                                    | Access Product + Tasks/Communications owner     | Disable offending consumer, reverse only safely reversible projection, preserve source/audit, add sink regression                       |
| **D51-SYNCHRONOUS-FANOUT** — Off command scans/counts current work or writes descendant rows                                     | Any descendant write/cohort query in command trace, or source write count above approved constant plan                       | Phase 12 + Database SRE                         | Block activation/pause rollout, remove fanout, restore O(1) source transaction                                                          |
| **D51-RECEIPT-DIVERGENCE** — same semantic policy command returns different head/epoch/result                                    | Any event                                                                                                                    | Phase 12 + Data Integrity                       | Disable writer, incident, reconcile command ledger, never rerun as a new command automatically                                          |
| **D51-PRIVILEGED-PARITY** — owner/service/worker/support path differs from ordinary Tenant/purpose outcome                       | Any test or production event                                                                                                 | IAM Security + Database                         | Block deployment/disable path, repair least grants/RLS/application check, rerun full matrix                                             |
| **D51-RECONCILIATION-LAG** — projection cleanup/reconciliation delay                                                             | p95 above 60 seconds for 15 minutes or any item above 300 seconds                                                            | Workflow Platform + Phase 12/17/6 owner         | Replay exact receipts, inspect outbox/worker/index, keep source fence effective, pause expansion if sustained                           |
| **D51-SOURCE-COMMAND-SLO** — Off command latency/lock budget                                                                     | Missing approved budget for enabled cohort, or two consecutive registered windows above it                                   | Phase 12 + Database SRE                         | Block/pause activation, inspect scope key/index/lock contention; never cache stale authority or relax checks                            |
| **D51-SETTINGS-LATENCY** — policy form read/save regression                                                                      | p95 above 2× established People & access baseline for 15 minutes and at least 100 eligible operations                        | Access Product + IAM                            | Pause expansion, inspect query/auth/receipt recovery, preserve explicit save and truth                                                  |
| **D51-FALSE-IMPACT-COPY** — visible/programmatic claim of total recall, deletion, access/task/request change, or future-only Off | Any occurrence                                                                                                               | Product Design + Accessibility + Access Product | Block affected surface, correct copy/accessible description, rerun snapshot/comprehension tests                                         |
| **D51-OFF-COMPREHENSION** — representative admins cannot predict effects                                                         | Below 90% correctly state preventable-vs-already-admitted behavior, no access/task/request change, and future-only re-enable | UX Research + Access Product + Accessibility    | Keep UI inactive/pause expansion, simplify inline review, repeat representative role/locale/device/AT study                             |
| **D51-SENSITIVE-SINK-DATA** — protected identity/context/body in UI/log/audit/export/trace                                       | Any occurrence                                                                                                               | Privacy + Security + owning platform            | Stop affected sink, contain and assess exposure, purge where authorized, minimize schema/copy, add regression                           |
| **D51-MIXED-VERSION-UNSAFE-PATH** — enabled Tenant reaches a worker/adapter lacking epoch proof                                  | Any event                                                                                                                    | Release Engineering + Platform SRE              | Stop rollout, disable writer/admissions, complete compatible deployment and replay only exact safe receipts                             |
| **D51-MONITOR-COVERAGE-GAP** — enabled cohort lacks any required alert/runbook/owner                                             | Any gap                                                                                                                      | Release Engineering + Product Operations        | Block activation or remove cohort, wire owner/runbook/test before restore                                                               |

## Ruthless synthesis and ordered path

### Final disposition

**Accept with required amendments.**

Option 1 solves the right administrator trust problem and is preferable to
prospective-only Off or current-cohort recomputation. The unamended wording is
not safe enough: it conflates policy revision with cancellation, implies
physical recall, collapses existing external-delivery states, leaves local
presentation ending underspecified, and adds avoidable confirmation-surface
friction.

### Must be resolved before D51 is recorded

1. Record a separate monotonic cancellation epoch. Every distinct successful
   Off advances it atomically with the policy head; non-Off edits do not;
   re-enable retains it; semantic replay does not advance twice.
2. State that Off immediately narrows current preventable and future effects.
   Only non-Off interval edits and re-enable are prospective.
3. Pin the epoch at D48 admission and require epoch CAS/reproof at D50, D49,
   in-product queryable release, governed email preparation, and governed
   email submission-attempt admission.
4. Preserve the canonical external axes: **Unprepared | Prepared definitely
   unsubmitted | Submission may have begun**, plus independent **None |
   Accepted | Definitely rejected | Indeterminate** provider outcome. Never
   invent a collapsed D51 status.
5. Settle Off-fenced D49 indeterminate work as permanently no-release/no-retry,
   including after re-enable.
6. End released local active/unread attention only through ADR-0027
   source-owned presentation end; never fake read, dismissal, archive, or delete.
7. Use one inline consequence review in the existing route-addressable form/
   Sheet with a specific primary action, not a toggle or nested modal.

### Must be captured in the later specification and design

1. Exact command, head, cancellation-epoch, pin, source occurrence, effect
   identity, receipt, and semantic-idempotency contracts.
2. Stable absent-row-safe serialization/CAS design proving one order between
   Off and every source/effect boundary.
3. Complete lifecycle and allowed transition reducers for policy, occurrence,
   presentation, dispatch phase, provider outcome, and reconciliation.
4. Same-Tenant relational constraints, immutable columns, restrictive deletion,
   least grants, RLS **USING/WITH CHECK**, and every privileged path.
5. ADR-0027 presentation-end semantics and Phase 6 preparation/attempt/evidence
   integration without alternate truth.
6. Bounded identifier-only outbox/reconciliation, repair commands, retention,
   backup/restore, audit, and safe support surfaces.
7. Exact Base Maia interaction/copy, stale-save recovery, accessibility,
   localization, low-bandwidth, privacy, and representative comprehension proof.
8. Approved quantitative command/claim/performance budgets and
   production-shaped largest-Tenant fixtures.

### Mandatory implementation safeguards

1. Deploy all epoch-aware deny paths before any Off writer or UI.
2. Keep Off source commit O(1); never put a census, count, recipient resolution,
   descendant write, provider call, or executor completion in its success path.
3. Treat every unadmitted boundary as a fresh source/auth/epoch proof and every
   admitted boundary as immutable history.
4. Use product-database uniqueness and durable business receipts; provider,
   HTTP, event, or job idempotency is supplemental only.
5. Permit only evidence reconciliation—not provider I/O—after Off for an
   already admitted attempt.
6. Fail closed on stale/indeterminate authorization, serialization, migration,
   provider, or mixed-version state; never broaden, truncate, guess, or retry.
7. Activate only complete compatible Tenant cohorts with kill, repair,
   monitoring, and roll-forward evidence already rehearsed.

### Risks permitted only under monitoring

The only monitorable risks are performance degradation, reconciliation lag,
provider-evidence delay, and administrator comprehension after their safety
invariants are already enforced. Their exact signals, thresholds, owners, and
responses are the named table above. Cross-Tenant access, post-Off admission,
revival, duplicate effects, state regression, fake engagement, secondary
artifacts, sensitive sink data, or unsafe mixed versions are zero-tolerance
incidents—not accepted residual risk.

### Implementation order

1. Ratify this corrected D51 in the decision log, glossary, ADR-0184, and
   Phase 12/17/6 planning text without activating runtime.
2. Decide D52's active useful-lateness/indeterminate-expiry model.
3. Complete D47's independent reminder-need/cadence/comprehension/harm evidence;
   keep the capability Reserved/Off if it fails.
4. Produce the database/authorization/threat model and OpenSpec delta with the
   matrices and trace IDs above.
5. Split implementation tickets by authoritative source transaction,
   claims/receipts, Phase 17 release/source-end, Phase 6 external boundaries,
   UX, migration, observability, and proof—without a generic cancellation engine.
6. Implement additively and deny-first; complete deterministic concurrency,
   real-DB RLS, crash/restore, performance, accessibility, privacy, and
   production-shaped no-send evidence.
7. Activate one complete compatible Tenant cohort, verify every zero-tolerance
   monitor, then expand only against certified capacity and UX evidence.

## Exact corrected D51 decision to record

> **Option 1 — prospective ordinary edits and immediate monotonic Off
> narrowing through a separate cancellation epoch.**
>
> Each cadence save appends an immutable expected-head Phase 12 policy
> revision. A non-Off interval edit affects only genuine D43 source creations
> ordered after its policy boundary under D48's shared serialization and
> committing their immutable disposition; earlier D50 packages remain
> unchanged. Each distinct
> successful Off advances a separate monotonic cancellation epoch atomically
> with the policy head and becomes immediately authoritative for current
> preventable and future reminder work without a synchronous census or fanout.
> Re-enable retains that epoch and affects only genuine later requests; it
> never revives, retries, recalculates, resumes, or catches up prior work.
>
> D48 admission pins the current epoch. D50 claim, D49 seal, in-product
> queryable release, governed email preparation, and governed email submission-attempt
> admission each compare the pin with the current epoch under one stable
> absent-row-safe CAS/serialization discipline. Off-first denies the later
> boundary. Boundary-first preserves immutable truthful history. D49
> indeterminate proof present at Off becomes permanently source-fenced,
> releases nobody, and cannot retry after re-enable.
>
> In-product irreversibility is the atomic role-safe release that makes the
> item queryable, not a human read; released active/unread attention ends only
> through ADR-0027 source-owned presentation end, never fabricated engagement.
> For the currently governed email step, external irreversibility is the Phase
> 6 attempt fence committed before the first byte may leave Asym, not provider
> acceptance. **Unprepared** and
> **Prepared definitely unsubmitted** remain suppressible. Attempt admission
> permanently yields **Submission may have begun** with independent provider
> outcome **None**, **Accepted**, **Definitely rejected**, or **Indeterminate**.
> After Off, reconciliation may reduce evidence but no provider call,
> same-key follow-up, new attempt, rekey, blind resend, or recall claim is
> permitted. Every future push, Slack, Teams, Google Chat, or other channel
> must register and prove its own product-owned admission, finality, and
> recovery boundary; it cannot inherit email assumptions or add a generic
> cancellation engine.
>
> Off changes no request, task, responsibility, grant, decision,
> EffectiveAccess, or access. It creates no second/cancellation task,
> notification, email, chat, unread reset, or recipient-facing cancellation
> effect. The future route-addressable Base Maia policy form preserves local
> draft and uses explicit submission. Selecting Off shows one inline
> consequence review and replaces the ordinary primary action with **Turn off
> courtesy reminders**, alongside **Cancel**. It states that Asym stops every
> pending reminder it can still prevent; earlier in-product reminder history
> may remain, and a reminder already being sent may still arrive; re-enable
> includes only new requests; and requests, tasks, and access do not change.
> There is no autosave, instant
> toggle, nested modal, typed phrase, impact count/list, or second confirmation.

## D52 — When does an otherwise-current reminder stop being useful?

### Why this is the next decision

D50 fixed the candidate as a request-anchored elapsed instant but intentionally
defined only “not before.” D51 now settles Off and other source-terminal fences:
they end the same unresolved occurrence permanently. What remains is a narrower
case—how long the same occurrence may still resolve/release when the request,
recipient basis, authorization, and cancellation epoch are all still current.

### Concrete example

An access-review reminder reaches its D50 candidate while a dependency is
unavailable, so D49 recipient proof is **Indeterminate** and releases nobody.
The dependency recovers later. The request is still pending, the policy has not
turned Off, the pinned epoch still matches, and the recipient proof can now be
complete. Should Asym still release that one reminder, and if so, for how long?

### Decision

Choose the useful-lateness model; this question does not yet choose the numeric
duration and creates no due date, SLA, urgency, escalation, or second reminder.

1. **Bounded product-owned useful window (Recommended).** The candidate is
   inclusive and one later immutable useful-until fence is exclusive. A late
   wake or D49 retry may claim the same occurrence only before that fence and
   only after every current proof passes. At/after the fence, unsealed or
   indeterminate work becomes terminal no-release and never catches up.
   This prevents stale surprise while tolerating ordinary outages and keeps
   one clear permanent boundary independent of the executor/provider.
2. **While the request remains pending.** The same occurrence may release at
   any later time while all source/auth/epoch proofs remain current. This is
   simpler but permits a reminder to arrive arbitrarily long after its intended
   context and makes operational delay silently define user experience.
3. **Candidate-only.** Any failure to seal/release at the candidate permanently
   suppresses the occurrence. This eliminates late surprise but makes brief
   outages lose useful attention and couples correctness too closely to worker
   punctuality.

**Question:** Which D52 useful-lateness model should Core record?

# Phase 24 D51 — Immediate Irreversible Narrowing Primary Research

**Date:** 2026-08-29

**Founder answer:** **Option 1 — Off immediately and irreversibly narrows every
not-yet-irreversible reminder effect; non-Off edits and re-enable are new-
request-only**

**Disposition:** **Accept with required amendments**

**Scope:** cadence-policy lifecycle, cancellation fencing, source/effect order,
cooperative cancellation, provider ambiguity, idempotency, quiet configuration
UX, authorization, RLS, recovery, migration, proof, and the next D52 question
only; no cadence value, usefulness interval, content, channel, schema, OpenSpec,
worker, telemetry, feature flag, or UI artifact

## Purpose and research standard

D51 resolves what a later cadence change does to work already admitted under
D48. The founder selected immediate irreversible narrowing: Off stops every
pending courtesy-reminder effect the product can still prevent, while a non-Off
edit or re-enable applies only to genuinely new D43 request episodes.

That shorthand needs four corrections before it is safe to record. First, a
current policy head alone is not a cancellation fence: a non-Off edit changes
the head but must not cancel requests admitted under the prior active revision.
Each admission therefore pins a separate monotonic **cadence cancellation
epoch**. Non-Off edits do not advance it; each active-to-Off transition does;
re-enable retains the advanced epoch. Second, Off becomes logically effective
at its authoritative head-and-epoch commit without synchronously touching every
request, occurrence, recipient, task, presentation, dispatch, or executor run.
Third, every source seal and effect release must serialize against that fence.
Fourth, product cancellation cannot recall an in-product item already released
or an external request whose submission attempt may have begun.

This document tests the corrected choice against the current Core repository,
ADRs and OpenSpec, current first-party IAM/CRM/CMS/provider/platform guidance,
PostgreSQL and HTTP semantics, distributed-failure practice, accessibility, and
representative user journeys. Evidence labels are strict:

- **Repository fact:** verified in the current Core repository.
- **Verified external fact:** verified in current official first-party material.
- **Requirement inference:** required by governing Core or platform behavior.
- **Product judgment:** Core deliberately chooses among multiple safe models.
- **Assumption:** plausible but not established by representative ministry data.
- **Unresolved unknown:** reserved for a later founder, research, or design gate.

Vendor behavior is comparative evidence only. Core imports no vendor workflow,
state machine, cancellation API, interval, provider guarantee, component, or
retention window merely because it demonstrates one useful pattern.

## Executive finding

**Accept with required amendments.** Option 1 is the strongest permanent path,
provided “immediate” means an O(1) authoritative logical fence and
“irreversible” is defined by one product-owned order—not a promise of queue
purge, provider recall, or unreadness.

- SailPoint documents prospective configuration: changed reminder/escalation
  settings apply to requests created afterward while pending requests keep
  their submission-time configuration. That is the right rule for non-Off
  edits, not for an explicit Off safety action.
- Microsoft Entra separates stopping a current review instance from changing a
  future recurring series; a stopped instance cannot restart. This supports
  explicit monotonic stopping rather than implicit pause/resume.
- HubSpot says turning a workflow Off prevents actions from executing, records
  skipped actions, and does not automatically replay completed/skipped work on
  re-enable. It also exposes how vendor-specific delay behavior can be
  surprising, so Core needs its own exact lifecycle.
- Contentful cancels only a scheduled action still in `scheduled`; succeeded or
  failed work remains history. Resend can cancel its own scheduled-email object
  but does not establish recall for a send already handed off.
- Inngest explicitly cancels between steps and cannot interrupt an executing
  step. Platform cancellation is therefore an optimization, never Core's
  source fence or proof that no external effect occurred.
- Stripe and Resend document finite provider idempotency behavior and distinct
  in-progress/uncancelable states. RFC 9110 permits automatic retry of a
  non-idempotent request only when semantics or application state proves it
  safe. Product-owned durable attempt identity and outcome reconciliation must
  outlive transport windows.
- AWS's transactional-outbox guidance separates the authoritative database
  transaction from later delivery and requires idempotent consumers. PostgreSQL
  supplies serializable failure/retry and row-security semantics but does not
  make a database transaction atomic with an external network call.
- WCAG requires predictable explicit changes, textual errors, reflow, and
  programmatically determinable status. GOV.UK says warning buttons and extra
  confirmations should be rare and reserved for serious hard-to-undo harm.
  Turning off optional attention is consequential but not data deletion, so one
  inline consequence review and a specific final action are proportionate.

The corrected model adds no runtime artifact now. If later activated, the
future Base Maia form quietly says exactly what Off can and cannot do, never
queries an impact count, and never makes staff understand queues, epochs,
providers, tasks, or notification architecture.

## Exact corrected D51 decision

1. D51 selects **immediate irreversible narrowing** for the optional D47
   courtesy-reminder cadence.
2. D51 does not activate the reminder. Every D46/D47 evidence and release gate
   remains controlling.
3. Phase 12 owns one immutable cadence-policy revision stream and one current
   Tenant/environment/policy-kind head. A successful publication appends a
   revision and advances the head through a semantic-idempotent expected-head
   server command, or writes nothing.
4. The same stable absent-row-safe policy scope owns a separate monotonic
   **cadence cancellation epoch**. Exact storage type and lock primitive remain
   design choices; the epoch must have an unambiguous successor order.
5. Each D48-admitted D43 episode atomically pins its exact cadence revision,
   D50 package, and the current cancellation epoch. Replay returns the same
   tuple.
6. A non-Off-to-non-Off interval edit advances the policy revision/head but
   does **not** advance the cancellation epoch. Existing admitted episodes keep
   their pinned D50 timing and may continue only under that unchanged epoch;
   genuine later episodes use the new revision.
7. A successful transition from active cadence to Off atomically appends the
   Off revision, advances the policy head, advances the cancellation epoch, and
   records immutable actor/audit/receipt evidence. A semantic replay or already-
   Off no-op returns existing truth and does not advance again.
8. Re-enable appends a new active revision but retains the current advanced
   cancellation epoch. Only genuine D43 episodes ordered after re-enable may
   pin it. Older episodes retain the lower epoch and can never revive.
9. The authoritative Off head-and-epoch commit is the logical cancellation
   instant. Correctness is immediate at that commit and O(1) in request/member/
   effect count.
10. Off performs no synchronous census, preview count, row-by-row cancellation,
    task mutation, projection deletion, executor call, provider call, or
    recipient fanout. Bounded reconciliation may later append materialized
    suppression evidence, but no correctness check waits for it.
11. Every D50 eligibility claim, D49 resolution/seal, in-product release, and
    external submission-attempt admission atomically re-reads the current
    policy state and cancellation epoch under the same stable serialization
    discipline. It may proceed only when the state is active and the episode's
    pinned epoch equals the current epoch.
12. A newer non-Off revision with the same epoch cannot invalidate an older
    admitted episode. Comparing only policy revision/head would be incorrect.
13. Off publication and every D51-relevant source/effect boundary have one
    defensible product-database order. On serialization/CAS conflict, the whole
    losing command—including authorization and value selection—retries or
    returns a typed conflict; no stale check may cross the boundary.
14. If Off commits before an unsealed occurrence, a waiting D50 candidate and
    D49 `recipient_resolution_indeterminate` occurrence become logically
    canceled and can never seal, retry into release, catch up, or resurrect.
15. D49 `sealed_proved_zero` remains its already terminal no-effect history.
    Off creates no descendant or additional receipt merely to restate zero.
16. If D49 `sealed_members` commits before Off, the sealed cohort remains
    immutable source history. Each not-yet-released member descendant must
    still re-prove the current epoch and is suppressed when Off wins first.
17. In-product irreversibility is the atomic product-owned **presentation
    release commit** that both makes the exact item queryably available under
    ADR-0027 and records its release evidence. Rendering, preparation, worker
    wake/claim, cache fill, event receipt, or a human read is not that boundary.
18. Off-first prevents an in-product release commit. Release-first preserves
    truthful release/history; Off cannot say the item was unseen or fabricate a
    read/dismissal. Active/unread attention may end only through ADR-0027's
    source-owned presentation-end rules, not through D51 mutation.
19. External irreversibility is the atomic product-owned **submission-attempt
    admission commit** immediately before the network call. In one transaction
    it re-proves the source/epoch/member/destination/channel fences, claims the
    exact effect, retains a stable product attempt/idempotency identity, and
    changes dispatch from `Prepared definitely unsubmitted` to `Submission may
have begun` before any call.
20. Worker wake, content preparation, destination resolution, provider SDK
    construction, or an outbox dequeue is not external irreversibility. Off-
    first suppresses all `Unprepared` and `Prepared definitely unsubmitted`
    work without a provider call.
21. Submission-attempt-admission-first leaves dispatch `Submission may have
begun`; the orthogonal provider outcome remains exactly `None`, `Accepted`,
    `Definitely rejected`, or `Indeterminate`. Core reconciles that exact
    attempt and never promises recall, non-arrival, or an outcome evidence does
    not establish.
22. The canonical external axes remain distinct: dispatch is `Unprepared`,
    `Prepared definitely unsubmitted`, or `Submission may have begun`; the
    provider outcome is `None`, `Accepted`, `Definitely rejected`, or
    `Indeterminate`. A committed attempt fence is never downgraded to definitely
    unsubmitted.
23. Provider acceptance time is not in the product ordering namespace. Core may
    prove only whether its own submission-attempt admission ordered before or
    after Off; it must not infer that provider acceptance happened before Off
    merely from a late response or provider timestamp.
24. If an admitted attempt becomes `Definitely rejected` after Off, it is
    terminal for D51 and receives no retry. Dispatch `Submission may have begun`
    with outcome `None` or `Indeterminate` is reconciled idempotently against the
    exact attempt; after Off, reconciliation may read/consume provider evidence
    but performs no new send, retry, attempt, or other effectful provider I/O.
    Later D52 usefulness rules may narrow further.
25. A provider-specific API that can cancel its own still-scheduled object may
    later be used as separately governed best-effort narrowing. D51 neither
    depends on it nor calls it successful without provider evidence.
26. Provider idempotency keys supplement but never replace the durable product
    effect/attempt identity, attempt state, receipt, and reconciliation because
    provider retention and concurrency semantics are finite.
27. Inngest `cancelOn`, pause, bulk cancellation, run state, replay, or cleanup
    may later reduce wasted execution. None owns Off truth, cancellation epoch,
    source/effect admission, provider outcome, or recovery.
28. Non-Off edit, Off, and re-enable never mutate D43 request state, grant,
    EffectiveAccess, decision, holder status, D44 responsibility, D44 initial
    attention, source-backed task, task completion, or task assignment.
29. D51 creates no cancellation task, notification, email, chat message, unread
    reset, escalation, recipient substitution, or user-facing per-request
    cancellation state.
30. Human publication uses the D44-governed Phase 12 policy-management
    authorization and current same-Tenant `permissions.manage_grants` scope.
    Automated claims use registered product/system purposes and never
    impersonate that human.
31. Tenant, actor/system purpose, policy head/revision, expected head,
    cancellation epoch, request/occurrence/member/effect/attempt identity,
    destination revision, timestamps, and audit attribution derive from trusted
    server/source context; callers cannot set or retarget them.
32. Future persistence must enforce non-null Tenant scope, same-Tenant composite
    relationships, valid state combinations, one semantic effect/attempt,
    immutable source evidence, restrictive deletion, least grants, RLS `USING`
    and `WITH CHECK`, and owner/service/worker/support/BYPASSRLS parity.
33. Events and executor payloads remain identifier-only. Protected names,
    reasons, request content, recipient lists, destinations, and provider
    secrets do not enter cancellation events, general logs, or task text.
34. Durable business history distinguishes policy publication, logical source
    cancellation, effect suppression, presentation release, attempt admission,
    provider outcome, and later reconciliation. Technical traces never replace
    these facts.
35. Rollback after an Off epoch has committed is roll-forward only. A deploy or
    UI rollback may disable future configuration, but it cannot decrement the
    epoch, revive old work, erase history, or safely restore the old policy.
36. No mixed deployment may expose the Off writer until every source seal,
    release, and submission-attempt admission path is fence-aware at its
    authoritative mutation boundary. Executor cancellation alone is not a
    compatibility bridge.
37. Future policy UX is one route-addressable People & access → Access requests
    Base Maia form/Sheet with local draft, explicit submission, and Cancel. It
    has no autosave toggle, optimistic commit, save-on-blur, nested modal, impact
    count, recipient list, channel list, or typed-confirmation ritual.
38. When Off is selected, the existing form reveals one inline consequence
    review and replaces the ordinary submit label with **Turn off courtesy
    reminders**. This is the single confirmation opportunity; no second dialog
    opens.
39. The review states that every pending reminder Asym can still prevent will
    stop, earlier in-product reminder history may remain, a reminder already
    being sent may still arrive, access requests/tasks/access do not change, and
    re-enable applies only to new access review requests.
40. D51 adds no schema, migration, policy row, epoch, state, API, cache, index,
    event, outbox, job, Inngest function, provider adapter, feature flag,
    telemetry, UI, or hidden placeholder now.

## Current behavior, intended behavior, and permanent path

| Area                 | Verified current behavior                                                                         | D51 intended behavior                                                                     | Best permanent path                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Reminder cadence     | D43–D51 are documentation only; no cadence runtime exists.                                        | Preserve default-Off and every release gate.                                              | No-build now; implement only after the remaining evidence chain closes. |
| Policy lifecycle     | D47/D48 define immutable versions and prospective first activation; later edit/Off remained open. | Non-Off edit prospective; Off immediate logical narrowing; re-enable prospective.         | Immutable revisions plus separate monotonic cancellation epoch.         |
| Source work          | D43 request and D44 task/current attention remain authoritative in their domains.                 | Off changes no request, access, responsibility, or task.                                  | Phase 12 source fence; ADR-0183 projection remains independent.         |
| Recipient occurrence | D49 seals one exact cohort or proved zero; indeterminate releases nobody.                         | Off-first blocks seal; seal-first keeps history and fences descendants.                   | Epoch check in the authoritative D49 seal transaction.                  |
| In-product attention | ADR-0027 owns presentation and engagement; current demos are nonprecedent.                        | Release-first remains truthful; Off-first prevents release.                               | One source-owned atomic release commit; no fake read/dismissal.         |
| External handoff     | Other domains use Resend, but no D51 adapter exists.                                              | Off-first suppresses definite-unsubmitted work; attempt-first reconciles exact ambiguity. | Product attempt fence/outbox/receipt plus provider evidence.            |
| Workflow engine      | Inngest is a replaceable executor under Core's workflow contract.                                 | Cancellation reduces work but cannot establish correctness.                               | Identifier-only intents and product claims at every effect boundary.    |
| Policy UX            | No cadence editor exists.                                                                         | Quiet inline consequence review with explicit final action.                               | Shared Base Maia form/Sheet only after activation is proved.            |

## Governing Core evidence

| Repository authority                                                                                                                                      | Verified finding                                                                                                                                        | D51 consequence                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [D51 decision log](./phase-24-multi-site-management-decision-log.md)                                                                                      | Founder selected Option 1 for three admitted states and rejected prospective-only Off/pause-resume.                                                     | Preserve immediate narrowing but correct fanout and irreversibility wording.                |
| [D47 research](./phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)                                                                        | Cadence is default Off, bounded to at most one courtesy occurrence, and not runtime-authorized.                                                         | D51 cannot create recurrence, due meaning, or implementation.                               |
| [D48 research](./phase-24-d48-new-request-only-cadence-application-primary-research.md)                                                                   | Admission is source-ordered, prospective, immutable, and absent-row-safe.                                                                               | Reuse its stable policy scope; pin revision plus cancellation epoch.                        |
| [D49 research](./phase-24-d49-current-recipient-cohort-primary-research.md)                                                                               | One occurrence seals `sealed_members`, `sealed_proved_zero`, or remains `recipient_resolution_indeterminate`; downstream only narrows.                  | Off-first blocks sealing; a sealed cohort remains immutable evidence.                       |
| [D50 research](./phase-24-d50-request-anchored-elapsed-clock-primary-research.md)                                                                         | Source-created/eligibility instants and duration evidence are immutable; later Off was reserved.                                                        | Never rebase, pause, or recalculate D50 facts.                                              |
| [Phase 12](./phase-12-full-role-permission-configuration.md) and [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)            | Phase 12 owns permission requests, source heads, policy, review decisions, exact provenance, authorization, receipts, and current Access requests lane. | Policy, epoch, source cancellation, and seal remain Phase 12 facts.                         |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                                        | Source work projects into Tasks Hub; task state cannot own source outcomes.                                                                             | Off never closes, deletes, completes, or reassigns the D44 task.                            |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md) and [Phase 17](./phase-17-system-messages-template-management.md)        | Presentation/engagement and provider dispatch have their own exact lifecycle/history.                                                                   | Define release/attempt boundaries there under the Phase 12 ceiling; do not collapse states. |
| [Identity and Access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                                                       | Identity, Tenant, role, and capability resolve server-side; application authorization is primary and RLS is defense in depth.                           | Caller-controlled epoch/actor/Tenant or service-role bypass is forbidden.                   |
| [Workflow Orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                                 | Product records, claims, audit, and dispatch ledger remain authoritative; Inngest is identifier-only execution.                                         | Product fencing/outbox/idempotency, not `cancelOn`, determines effects.                     |
| [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md) and [Platform Principles](../../../openspec/specs/platform-principles/spec.md) | Sensitive writes are server-side; safety, clarity, accessibility, and one shared task model outrank convenience.                                        | One purpose-bound server command and quiet coherent UX.                                     |
| [Frontend rules](../../../docs/ai/rules/frontend.md)                                                                                                      | Shared `@asym/ui`, Base UI/base-maia, Maia/Zinc tokens, semantic forms/status, and privileged server mutations are mandatory.                           | No app-local toggle/dialog/component fork; no UI now.                                       |

## Current official primary evidence

### Governance, CRM, and CMS comparators

- [Microsoft Entra review completion](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
  says an active instance can be stopped, reviewers can no longer respond, and
  the instance cannot restart; stopping a recurring series is a separate edit.
- [Microsoft Entra review creation](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
  distinguishes the current review instance from the future series.
- [SailPoint request email configuration](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)
  states configuration changes affect requests created afterward while pending
  requests keep their submission-time configuration.
- [HubSpot workflow Off behavior](https://knowledge.hubspot.com/workflows/turn-off-workflows)
  says new records are not enrolled, actions for enrolled records are skipped,
  history records those skips, and re-enable does not automatically replay work
  that exited. HubSpot's special delay behavior is a warning against copying a
  vendor's hidden lifecycle.
- [Contentful scheduled actions](https://www.contentful.com/developers/docs/references/content-management-api/scheduled-actions/)
  permits cancel only while an action remains scheduled, uses explicit
  scheduled/canceled/failed/succeeded states, and uses version conflicts for
  concurrent updates.

These sources establish mature patterns—prospective edits, explicit stop,
monotonic terminal history, and version-aware mutation. They do not prove a
universal Off rule or Core's exact epoch design. No current public first-party
nonprofit CRM source located for this review established stronger cancellation
semantics; Core must not invent one from ministry intuition.

### Cooperative cancellation and external ambiguity

- [Inngest cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
  says cancellation occurs between steps and an actively executing step runs
  to completion. Canceling runs also does not prevent new runs from being
  enqueued.
- [Inngest function execution](https://www.inngest.com/docs/learn/how-functions-are-executed)
  says steps are separately invoked, persisted, memoized, and retried. That is
  useful execution behavior, not atomicity with Core policy or providers.
- [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
  documents the dual-write failure, atomic source/outbox commit, duplicate
  delivery, ordering, and idempotent-consumer requirements.
- [RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)
  says clients should not automatically retry non-idempotent requests unless
  they know the request is idempotent or know the original was not applied.
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)
  retains the first result for a key, rejects parameter mismatch, and permits
  pruning keys after at least 24 hours. Its
  [PaymentIntent cancellation](https://docs.stripe.com/api/payment_intents/cancel)
  is status-bounded and fails when the object is no longer cancelable.
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)
  retains keys for 24 hours and distinguishes concurrent in-progress requests;
  its [cancel API](https://resend.com/docs/api-reference/emails/cancel-email)
  applies specifically to scheduled email objects.

Together these sources verify that worker/provider cancellation is cooperative
and capability-specific, idempotency windows may be finite, and loss of a
response creates ambiguity. The submission-attempt admission boundary and
permanent product identity are Core product judgments required to make those
facts safe.

### Database and UX evidence

- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
  and [serialization failure handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
  require a defensible transaction order and whole-transaction retry on
  serialization failure.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes row visibility (`USING`) from rows created/changed (`WITH
CHECK`) and documents owner/BYPASSRLS exceptions.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires predictable changes,
  labels/instructions, textual errors, reflow, visible focus, and
  programmatically determinable status messages.
- [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/)
  requires action-specific labels and reserves warning buttons/extra
  confirmation for serious hard-to-undo consequences. [USWDS modal guidance](https://designsystem.digital.gov/components/modal/)
  similarly reserves modal interruption for decisions needing full attention.

The UX inference is proportionate: Off requires one explicit consequence review
and final action, but not a red deletion ceremony, typed phrase, checkbox,
nested modal, or protected impact census.

## Evidence classification and unresolved facts

### Verified facts

- No D43–D51 cadence runtime or policy editor currently ships.
- Core's sources, tasks, presentation, provider dispatch, and executor have
  deliberately separate owners.
- Current official products distinguish prospective configuration, stopping,
  terminal history, cooperative cancellation, and provider-specific recall.
- A database commit cannot atomically retract an already visible item or an
  external network effect.

### Requirement inferences

- A separate cancellation epoch is required because policy revision equality
  would wrongly cancel old work on a non-Off edit or revive it after re-enable.
- A product-database ordering fence is required at D49 seal, presentation
  release, and submission-attempt admission; a check earlier in a worker leaves
  a race.
- Logical Off can be immediate without fanout only if all authoritative reads
  and mutation boundaries honor the head-and-epoch predicate.
- Provider ambiguity must be retained as ambiguity; Off cannot manufacture an
  outcome.

### Product judgments

- Off is stronger than a prospective edit because ordinary users reasonably
  understand it as stopping optional pending attention.
- The external submission-attempt admission commit is the conservative local
  irreversible boundary because no cross-system transaction can prove provider
  acceptance atomically.
- One inline review in the existing form is clearer and less disruptive than a
  nested dialog while still preventing accidental autosave.

### Assumptions requiring evidence

- Authorized ministry staff understand **courtesy reminders** and the proposed
  Off consequence copy without interpreting it as request/task/access removal.
- The remaining reminder problem is frequent and harmful enough to justify a
  feature after D46/D47 evidence gates.
- Future channel adapters can expose reliable attempt/outcome evidence without
  placing protected recipient data in general logs.

### Unresolved unknowns

- D52 must decide useful-lateness after delayed resolution/wake/outage; D51
  selects no interval or catch-up window.
- Later decisions must choose content, channels, preferences, quiet time,
  destination evidence, provider adapters, retention, physical schema, and
  quantitative performance budgets.
- Representative nonprofit/ministry usability and operational evidence has not
  yet proved the copy, thresholds, or activation case.

## Source state and ownership matrices

### Source lifecycle matrix

| Source state at Off order                              | Off-first result                                               | Earlier-boundary result                                       | Preserved evidence                                             |
| ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| D48 admitted; D50 not yet eligible                     | Pinned epoch mismatches; logically canceled; no D49 attempt    | D50 eligibility alone is reversible and does not defeat Off   | Original admission, revision, epoch, D50 instants, Off receipt |
| D50 eligible; D49 `recipient_resolution_indeterminate` | No further attempt may seal; no member/effect release          | Only a terminal D49 seal ordered first can survive as history | Every attempt receipt plus logical cancellation                |
| D49 `sealed_proved_zero`                               | No additional work; remains terminal zero                      | Same                                                          | Exact zero proof and seal                                      |
| D49 `sealed_members`; no descendant released           | Each member's unreleased descendant is suppressed              | Cohort itself remains immutable                               | Sealed cohort/member evidence and suppression reason           |
| D43 independently terminal before a boundary           | Ordinary source actionability blocks effect independent of Off | A previously released/admitted effect remains history         | D43 terminal receipt plus exact boundary evidence              |
| Re-enable after prior Off                              | Old epoch remains fenced; no resurrection                      | New genuine D43 episodes pin current active revision/epoch    | Prior cancellation plus new-policy history                     |

### Ownership matrix

| Authoritative fact                                               | Owner                                              | Derived consumers               | Explicit non-owners                      |
| ---------------------------------------------------------------- | -------------------------------------------------- | ------------------------------- | ---------------------------------------- |
| Policy revisions, head, cancellation epoch, publication order    | Phase 12 policy source                             | settings summary, claims, audit | browser draft, task, Inngest, provider   |
| D43 episode, D48 admission, D50 tuple                            | Phase 12 request aggregate                         | D49 and authorized audit        | policy editor, task, notification        |
| D49 occurrence and sealed cohort/zero/indeterminate attempts     | Phase 12 occurrence                                | eligible descendant commands    | worker cache, provider, recipient UI     |
| In-product presentation release/end/engagement                   | ADR-0027 / Phase 17                                | authorized staff surfaces       | cadence policy, task, provider           |
| External preparation, attempt admission, outcome, reconciliation | Phase 6/17 product dispatch plus provider evidence | operations/audit                | policy head, executor run, webhook alone |
| D44 current responsibility and source-backed task                | Phase 12/D44 and ADR-0183 projection               | Access requests and Tasks Hub   | D51 Off, provider, engagement            |
| Execution cancellation/retry                                     | Replaceable executor                               | operational traces              | policy/source/effect truth               |

### Irreversibility matrix

| Surface                   | Still preventable                                                  | Product-owned irreversible boundary                                | After boundary                                                                                   |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Source occurrence         | D50 waiting or D49 indeterminate                                   | Atomic D49 terminal seal                                           | Cohort/zero history remains; descendants still fenced                                            |
| In-product                | No presentation release exists                                     | Atomic queryable presentation release commit with release evidence | Never claim unseen; end attention only through ADR-0027 source rules                             |
| External                  | `Unprepared` or `Prepared definitely unsubmitted`                  | Atomic submission-attempt admission immediately before call        | Dispatch remains `Submission may have begun`; reconcile exact attempt/outcome; no recall promise |
| Provider-scheduled object | Product attempt already admitted, provider object still cancelable | Provider-specific successful cancel evidence                       | Preserve original admission and cancellation outcome; never generalize                           |

### External dispatch/outcome matrix

| Dispatch position                 | Outcome               | Off requirement                                                                                                     |
| --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Unprepared`                      | `None`                | Suppress; no preparation or call                                                                                    |
| `Prepared definitely unsubmitted` | `None`                | Suppress; retain minimal prepared/suppression history; no call                                                      |
| `Submission may have begun`       | `None`                | Retain that exact dispatch/outcome pair while the call is active; reconcile the same attempt; do not create another |
| `Submission may have begun`       | `Accepted`            | Preserve accepted provider evidence; no recall/non-arrival claim                                                    |
| `Submission may have begun`       | `Definitely rejected` | Preserve rejection; after Off, terminal no retry                                                                    |
| `Submission may have begun`       | `Indeterminate`       | Preserve ambiguity and bounded reconciliation; no blind retry or guessed outcome                                    |

### Race matrix

| Race                                             | Required single-order result                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Non-Off edit versus old admitted episode claim   | Same epoch means old episode may continue with pinned old revision; edit affects later requests only                                           |
| Off versus D49 terminal seal                     | Off-first blocks seal; seal-first preserves cohort/zero and fences descendants                                                                 |
| Off versus in-product release                    | Off-first blocks release; release-first remains truthful/queryable history                                                                     |
| Off versus external attempt admission            | Off-first keeps dispatch `Prepared definitely unsubmitted` or `Unprepared`; admission-first becomes `Submission may have begun` and reconciles |
| Re-enable versus old canceled work               | Re-enable retains advanced epoch; old work remains fenced regardless of wake/replay                                                            |
| Off response loss versus retry                   | Recover same receipt/head/epoch; never advance twice or fan out twice                                                                          |
| Provider response versus Off                     | Product can order only attempt admission and Off; response updates outcome without inferring provider-time order                               |
| Old worker versus new epoch                      | Authoritative claim denies before source/effect boundary; executor run may finish harmlessly                                                   |
| Concurrent attempts for one effect               | Product uniqueness/claim admits at most one stable attempt; provider conflict cannot mint another                                              |
| Mixed-version worker versus activated Off writer | Activation is forbidden until the mutation boundary itself is fence-aware; old worker cannot bypass via direct write                           |

## Best UX and UI contract

### No surface now

D51 authorizes no UI, placeholder, disabled control, preview query, task row,
notification, or cancellation message. The following is a release contract for
a future feature only.

### Policy manager journey

The setting remains in **People & access → Access requests → Settings** within
the existing route-addressable shared Base Maia form/Sheet. Off and finite
non-Off choices are radios or equivalent semantic single-choice controls.
Changing a choice updates only local draft state. Ordinary non-Off saves use
**Save changes**; **Cancel** discards the draft.

When a non-Off interval changes, show:

> Applies only to new access review requests. Existing reminder timing does not
> change.

When Off is selected, reveal one inline neutral consequence panel immediately
before the actions:

> **Turn off courtesy reminders**
>
> This stops every pending reminder Asym can still prevent. Earlier in-product
> reminder history may remain, and a reminder already being sent may still
> arrive. Access requests, tasks, and access do not change.
>
> Turning reminders on again applies only to new access review requests.

The final actions are **Turn off courtesy reminders** and **Cancel**. There is
no red deletion treatment, impact count, names, protected details, channel
inventory, modal, nested Sheet, typed phrase, checkbox, second confirmation,
countdown, optimistic status, or Undo promise.

After a successful Off command, keep a persistent inline status:

> **Courtesy reminders are off.** Access requests, tasks, and access did not
> change. Earlier in-product reminder history may remain, and a reminder already
> being sent may still arrive.

When re-enabling, show:

> Applies only to new access review requests. Reminders stopped while Off will
> not restart.

A stale-head conflict preserves the local draft, reloads the authoritative
summary, places focus on a textual conflict message, and requires a fresh
review. A lost/ambiguous response first recovers the semantic receipt; it never
invites an unqualified second save.

### Other viewers and failure UX

- Coordinators, requesters, holders, donors, missionaries, CMS users, and public
  visitors receive no policy-change or cancellation message.
- A previously released in-product reminder may remain visible with current
  source/authorization resolution; it never claims its work is still pending
  when D43 says otherwise.
- A later-arriving external reminder uses a current authenticated link and safe
  terminal/unavailable state. It does not expose policy history or provider
  diagnostics.
- Authorized operations/audit surfaces may use exact technical states; ordinary
  policy UX does not mention epoch, occurrence, fence, outbox, attempt, Inngest,
  provider acceptance, or reconciliation.
- Under low bandwidth, the submitted form stays in a recoverable pending state;
  a durable result or precise retry/recovery action replaces toast-only success.

### Accessibility and internationalization

The future form uses shared `@asym/ui` Base UI/base-maia primitives and Maia/
Zinc semantic tokens; native form semantics; associated labels, descriptions,
and errors; visible focus; logical keyboard and screen-reader order; focus
preservation/return; non-color meaning; forced-colors support; target-size
compliance; reduced motion; 320 CSS-pixel/400-percent reflow; RTL order; CJK and
translated-copy expansion; locale-independent server facts; and a persistent
programmatic status announcement. Selecting Off never submits on input alone.

## Problem validity and strongest alternatives

The root problem is valid if the optional reminder later ships: an authorized
Tenant must be able to stop pending optional attention without completing the
request, removing access, editing tasks, waiting for a bulk job, or receiving a
burst when it re-enables. The decision belongs at the Phase 12 cadence-source
policy because only that owner can consistently fence D49 and every downstream
surface. Inngest, Tasks Hub, Notification Center, or a provider cannot solve it
across all effects.

The strongest alternative is **prospective-only Off**. It needs no cancellation
epoch and lets every admitted tuple complete under its snapshot. That is simpler
internally, but it makes Off misleading: a Tenant can save Off and still receive
future reminders from current waiting requests. Prominent warning copy would
explain the surprise rather than solve it.

The strongest narrower implementation of Option 1 is a synchronous bulk
cancellation transaction/job. It appears concrete and can produce a count, but
it is weaker permanently: cardinality and locks grow with current work; partial
failure creates mixed truth; new descendants can race the scan; protected
counts require extra authorization; and correctness depends on every child row
being found. An O(1) epoch fence plus bounded reconciliation prevents the effect
at every authoritative boundary and needs no census.

Pause/resume/recalculate is rejected. It creates mutable remaining-time state,
another route to the one occurrence, catch-up bursts, ambiguous interval
versioning, migration debt, and a noisy operational UI without user evidence.

No-build remains the best alternative to the reminder feature itself until
D46/D47 and later evidence gates prove value. D51 only makes the lifecycle safe
if that later proof succeeds.

## Ruthless adversarial category review

Every requested category contains a material concern under the unamended
founder shorthand. The amendments below resolve or bound each concern; none is
silently deferred to convention.

For every row, the concern **narrows Option 1 and requires the stated amendment;
it does not invalidate the corrected decision**. The evidence/effect column
calls out any additional change in scope or architecture.

| Category                                                      | Material concern | What could go wrong and why it matters                                                                                                                                                              | Severity / likelihood                     | Evidence and effect on answer                                                                                                                                                                 | Permanent prevention and exact language to record                                                                                                                                                      |
| ------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Problem validity, necessity, and alternatives                 | **Yes**          | Off that only affects future requests violates ordinary intent; a fanout implementation solves the symptom at the wrong layer. Staff lose trust or miss the fact that optional attention continues. | High / High without exact semantics       | D51 example, Entra/HubSpot stop patterns, and Core source ownership support immediate source narrowing; no evidence yet proves reminders should ship. Narrows, does not invalidate, Option 1. | **“Off advances one authoritative cancellation epoch immediately; non-Off/re-enable remain new-request-only; D51 creates no runtime.”** Keep no-build as activation baseline.                          |
| Brittleness                                                   | **Yes**          | Comparing only the current revision cancels old work on any edit; scanning child rows misses races; worker cancellation fails mid-step.                                                             | Critical / High                           | D48 immutability and Inngest cancellation-between-steps directly expose these assumptions. Changes architecture materially.                                                                   | **“Admissions pin a cancellation epoch; only active-to-Off advances it; every irreversible boundary checks it atomically.”**                                                                           |
| Technical debt                                                | **Yes**          | Channel-specific cancel flags, per-worker checks, duplicated state names, or an Off backfill become permanent divergent logic.                                                                      | High / High                               | ADR-0027/Phase 17 already own presentation/dispatch; Core requires shared product boundaries.                                                                                                 | **“One Phase 12 fence and registered surface admission commands; no source-name/channel/executor conditionals or cancellation shadow state.”**                                                         |
| Edge cases                                                    | **Yes**          | Off can race eligibility, indeterminate D49, seal, release, call, response loss, duplicate save, re-enable, source terminality, and recipient churn. Any gap can emit after Off or corrupt history. | Critical / High                           | D49/D50 states and distributed provider behavior make every race realistic. Expands exact state/race contract.                                                                                | **“Use the source, external-state, irreversibility, and race matrices verbatim; unproved order conflicts, never guesses.”**                                                                            |
| Footguns                                                      | **Yes**          | Autosave toggle, impact count, misleading Undo, manual epoch input, replaying canceled runs, or retrying a rejected send can cause unintended attention or privacy exposure.                        | High / Medium-high                        | WCAG predictability, Inngest replay, and protected access-request data support explicit server submission.                                                                                    | **“Local draft plus specific final action; no autosave/count/Undo; callers and support cannot set epoch, resurrect, or resend.”**                                                                      |
| Tenant safety                                                 | **Yes**          | A missing composite relationship, cache key, event filter, or worker context can apply one Tenant's Off to another or release cross-Tenant reminders.                                               | Critical / Medium                         | Identity OpenSpec and ADR-0184 require same-Tenant source/effective-access boundaries. Does not change choice; adds hard constraints.                                                         | **“Every revision, epoch, request, occurrence, member, effect, attempt, receipt, query, cache, event, and lock scope binds the same non-null Tenant/environment.”**                                    |
| Database, RLS, and authorization safety                       | **Yes**          | `USING` without `WITH CHECK`, owner/service bypass, caller-controlled actor/head, mutable tenant/epoch, weak FKs, or allowed update-to-forbidden state defeats the fence.                           | Critical / High if conventional-only      | PostgreSQL RLS and Core OpenSpec explicitly require mutation checks and privileged parity.                                                                                                    | **“Use same-Tenant composite keys, immutable evidence, valid-state constraints, restrictive deletes, least grants, application auth, `USING`/`WITH CHECK`, and owner/service/worker/support parity.”** |
| Overengineering                                               | **Yes**          | A generic workflow cancellation DSL, saga engine, per-channel recall protocol, current-work preview, pause state, or globally shared epoch platform solves speculative needs.                       | High / High if vendor patterns are copied | One occurrence and one source policy need a small domain-specific fence, not an automation platform.                                                                                          | **“D51 adds only behavioral contracts for one policy head/epoch and existing surface boundaries; no generic cancellation framework or implementation now.”**                                           |
| UX/UI and user friction                                       | **Yes**          | A switch commits before comprehension; a modal stack/typed phrase overstates harm; counts/names leak data; “all canceled” lies; red danger styling creates noise.                                   | High / High                               | Core Base Maia rules, WCAG, GOV.UK, and distributed irreversibility support one inline review. Changes the proposed impact-count UX.                                                          | **“Use the exact quiet inline copy and `Turn off courtesy reminders`; no autosave, modal, count, names, jargon, Undo, or recall claim.”**                                                              |
| Source of truth, ownership, and domain invariants             | **Yes**          | Policy head, task, executor, item, or provider can become competing cancellation truth; read models may write back; historical release can be erased.                                               | Critical / High                           | ADRs 0183/0027/0184 and workflow OpenSpec define separate owners.                                                                                                                             | **“Phase 12 owns policy/epoch/source cancellation; Phase 17/6 own effect history; ADR-0183 owns task projection; executor owns none.”**                                                                |
| Hidden coupling                                               | **Yes**          | Off can accidentally depend on D44 task state, notification engagement, Resend scheduling, Inngest retention, current policy revision, or a page count.                                             | High / High                               | These systems have distinct owners/retention and optional availability.                                                                                                                       | **“Off correctness depends only on product source/effect transactions; every queue, task, channel, count, cache, and provider adapter is replaceable.”**                                               |
| Failure modes                                                 | **Yes**          | Head commits while fanout fails; response is lost; worker finishes; provider call is ambiguous; reconciliation stalls; rollback re-enables old work.                                                | Critical / High                           | AWS outbox, RFC 9110, provider idempotency, and Inngest cooperative cancellation verify the failures.                                                                                         | **“Head/epoch truth survives downstream failure; recover semantic receipt; preserve `Submission may have begun` plus exact outcome including `Indeterminate`; roll forward; never blind-retry.”**      |
| Lifecycle, temporal correctness, concurrency, and idempotency | **Yes**          | Edit, Off, re-enable, seal, release, and attempt admission can each win races; an ABA-style re-enable can make an old active revision look current.                                                 | Critical / High                           | D48/D50 immutable tuples plus PostgreSQL serialization require exact ordering. The epoch is a required amendment.                                                                             | **“Non-Off keeps epoch; Off advances; re-enable retains; old pinned epochs never equal again; whole-command conflict retry and permanent semantic idempotency apply.”**                                |
| Data integrity risks                                          | **Yes**          | Duplicate occurrence/effect/attempt rows, illegal state collapse, partial cohort, provider outcome overwrite, delete cascade, or restore-based resurrection corrupt proof.                          | Critical / Medium-high                    | D49 canonical states and Phase 17 dispatch axes are already governing.                                                                                                                        | **“Enforce one semantic identity per occurrence/effect/attempt, closed transitions, atomic complete seal, append-only outcomes/audit, restrictive deletion, and restore-preserved epochs.”**           |
| Security and privacy risks                                    | **Yes**          | Impact counts/names, payloads, logs, exports, support tools, provider metadata, or cancellation messages expose sensitive access/ministry details; broad operators can alter policy.                | Critical / Medium                         | Access requests can reveal role/capability and staff relationships; Core purpose/floor rules govern.                                                                                          | **“No ordinary census or recipient state; identifier-only execution; purpose-bound minimized audit/export; exact policy permission; secrets never browser/log/event.”**                                |
| Scalability and performance risks                             | **Yes**          | Synchronous cancellation grows with Tenant backlog, locks hot rows, times out, and still races; unindexed epoch reconciliation becomes a table scan.                                                | High / High at large tenants              | O(1) head mutation and indexed claims are standard consequence of source fencing; no verified volume supports fixed product limits now.                                                       | **“Off latency/write cardinality is independent of current work; design indexed bounded reconciliation and load-test ratified budgets before release.”**                                               |
| Operational burden                                            | **Yes**          | Support may need direct SQL to uncancel/retry, reconcile provider ambiguity, or explain mixed states; tribal channel semantics proliferate.                                                         | High / Medium-high                        | Provider state and irreversible history require durable repair paths.                                                                                                                         | **“No uncancel; expose authorized receipt/reconciliation/replay-safe repair, canonical states, runbooks, and roll-forward procedures before activation.”**                                             |
| Observability and auditability gaps                           | **Yes**          | Logs can say a worker was canceled while an effect was released; no one can prove policy/effect order or distinguish suppression from provider rejection.                                           | Critical / High                           | Inngest marks a run canceled even when its active step completes; technical logs are insufficient.                                                                                            | **“Retain durable policy epoch, occurrence, release/attempt, outcome, actor, order, and suppression receipts; implement the named monitors below.”**                                                   |
| Dependency and integration risks                              | **Yes**          | Provider outages, finite idempotency, webhook duplication/order, cancellation feature changes, rate limits, or Inngest replay can duplicate or misclassify effects.                                 | Critical / Medium-high                    | Resend/Stripe/Inngest docs verify these limits.                                                                                                                                               | **“Provider/engine features are adapters only; product attempt identity/state is permanent; webhooks are evidence; disagreements reconcile without widening.”**                                        |
| Migration, rollout, and upgrade risks                         | **Yes**          | An old writer ignores epoch while UI saves Off; rollback decrements fence; inferred backfill admits old work; mixed schema rejects receipts.                                                        | Critical / High without staged rollout    | No runtime exists, so there is no legitimate D51 backfill; future mixed versions are the main hazard.                                                                                         | **“Deploy fence-aware mutation boundaries before writer/UI activation; no historical inference; retain epoch across rollback; roll forward after writes.”**                                            |
| Testability, traceability, and proof                          | **Yes**          | “Immediately,” “pending,” “sent,” and “irreversible” are otherwise unfalsifiable; unit tests can pass while race/authorization/UI outcomes fail.                                                    | Critical / High                           | The current question used ambiguous terms; Core requires ADR/OpenSpec-to-release traceability.                                                                                                | **“Trace D51 answer → glossary/ADR/OpenSpec/design/tasks/tickets/code/tests/release; prove all 60 acceptance criteria including real concurrency, RLS, provider ambiguity, and a11y.”**                |
| Other development hazards                                     | **Yes**          | Clock/provider timestamps may be treated as order, result copy may promise recall, cancellation epoch may be reused globally, or cleanup may delete history.                                        | High / Medium                             | Cross-system clocks do not establish serial order; exact scope and copy prevent false certainty.                                                                                              | **“Only product commit order decides D51; epoch scope is Tenant/environment/policy-kind; copy is exact; retention/anonymization never rewrites business effect history.”**                             |

## Final disposition and corrected decision to record

**Disposition: Accept with required amendments.** Record this concise decision:

> **D51 — Immediate irreversible narrowing.** Every D48 cadence admission pins
> the current Phase 12 cadence cancellation epoch. Non-Off interval edits do
> not advance that epoch and affect only genuine later D43 request episodes.
> An active-to-Off publication atomically advances it and becomes an immediate,
> O(1) logical source fence: waiting and D49-indeterminate occurrences can no
> longer seal, and every sealed-but-unreleased descendant is suppressed at its
> next authoritative boundary. Re-enable retains the advanced epoch and applies
> only to genuine later requests; it never rebases, resumes, catches up, or
> resurrects prior work.
>
> Off, D49 sealing, atomic in-product presentation release, and atomic external
> submission-attempt admission share one defensible product order. Off-first
> prevents the boundary. Boundary-first preserves immutable history: a released
> in-product item was released; an externally admitted attempt remains dispatch
> `Submission may have begun` while its independent outcome is `None`,
> `Accepted`, `Definitely rejected`, or `Indeterminate`. Core never promises
> recall or infers provider timing, performs reconciliation only after Off, and
> never retries a definitely rejected attempt or performs new effectful provider
> I/O. Product receipts/fencing/outbox/idempotency remain authoritative.
> Executor cancellation or a separately proved channel-specific cancel may
> narrow execution but never source truth; every future channel registers its
> own irreversible boundary.
>
> Off changes no request, task, access, D44 responsibility, initial attention,
> or audit history. A future Base Maia editor uses local draft plus one inline
> consequence review and **Turn off courtesy reminders** action, with no
> autosave, count, names, modal, typed confirmation, false Undo, or cancellation
> message. D51 creates no runtime artifact now.

## Ruthless synthesis and order of work

### Must be resolved before the answer is recorded

1. Replace policy-head equality with the separate cancellation-epoch contract.
2. Define in-product release and external submission-attempt admission as the
   only D51 effect boundaries; remove worker/preparation/read/provider-
   acceptance ambiguity.
3. Preserve the exact external dispatch/outcome axes and no-retry-after-Off
   rule for definite rejection.
4. Replace impact-count/modal UX with the exact inline quiet contract.
5. State that D51 settles Off-ending for D49 indeterminate occurrences; D52
   addresses useful expiry only when no Off/source-terminal fence has won.

### Requirements to capture in glossary, ADRs, OpenSpec, and design later

1. Canonical definitions for cancellation epoch, logical cancellation instant,
   presentation release, submission-attempt admission, and canonical external
   axes.
2. Phase 12 ownership, expected-head/epoch publication, admission pinning,
   stable serialization scope, state machines, same-Tenant relationships, and
   immutable receipts.
3. ADR-0027/Phase 17 presentation-end and external dispatch integration without
   fake read/dismissal or collapsed provider state.
4. Registered human/system purposes, RLS/privileged-path parity, retention,
   repair, identifier-only events, and exact user-visible copy.
5. Traceability from the founder answer through all 120 D51 research assertions
   and all 60 D51 acceptance criteria to tickets, implementation, tests, and
   release evidence.

### Implementation safeguards required before any activation

1. Put the fence check inside every authoritative seal/release/attempt mutation,
   not in a prior query, browser, worker, or queue filter.
2. Use one durable semantic identity and atomic receipt/outbox transition for
   every policy command and effect; reconcile duplicates/out-of-order evidence.
3. Deploy and verify all fence-aware mutation boundaries before any Off writer,
   policy UI, or external adapter; keep a product kill switch that only narrows.
4. Prove ordinary and privileged authorization, same-Tenant constraints,
   concurrency, lost response, restore, mixed-version, provider ambiguity,
   accessibility, localization, mobile, and low-bandwidth behavior.
5. Provide roll-forward repair and authorized diagnostics; never direct-edit an
   epoch/outcome or replay a canceled old occurrence.

### Named production monitors

Monitoring supplements rather than weakens invariants. Each signal below must
bind Tenant/environment/policy kind and omit protected content.

| Signal                                                  | Threshold                                                                                                                                                                                                                      | Owner                         | Required response                                                                                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `d51_post_epoch_d49_seal_total`                         | **> 0 ever** for a lower pinned epoch                                                                                                                                                                                          | Phase 12 on-call              | Disable every reminder-effect admission, preserve evidence, open Critical incident, repair forward, and prove no release followed.                               |
| `d51_post_epoch_presentation_release_total`             | **> 0 ever**                                                                                                                                                                                                                   | Phase 17 + Phase 12 on-call   | Activate narrowing kill switch, quarantine affected effect IDs, notify security/product incident owners, and correct mutation fence before re-enable.            |
| `d51_post_epoch_submission_attempt_admission_total`     | **> 0 ever**                                                                                                                                                                                                                   | Phase 6/17 + Phase 12 on-call | Stop adapter admission, preserve provider ambiguity, reconcile exact attempts, and open Critical incident; do not send compensating messages.                    |
| `d51_attempt_state_regression_total`                    | **> 0 ever** when `Submission may have begun` regresses to `Prepared definitely unsubmitted`/`Unprepared`, or a non-`None` provider outcome regresses to `None`                                                                | Delivery Platform owner       | Quarantine updater, restore append-only evidence, reconcile provider, and block rollout.                                                                         |
| `d51_retry_after_off_definite_rejection_total`          | **> 0 ever**                                                                                                                                                                                                                   | Delivery Platform owner       | Disable retries for contract key, quarantine duplicate-risk attempts, reconcile, and ship permanent state-machine correction.                                    |
| `d51_epoch_reuse_or_decrement_total`                    | **> 0 ever**                                                                                                                                                                                                                   | Identity/Phase 12 owner       | Halt policy writes and effect admissions, treat as Critical authorization incident, repair by advancing/roll-forward only.                                       |
| `d51_off_command_child_mutation_total`                  | **> 0 request/member/task/presentation/dispatch child rows written synchronously by an Off command**                                                                                                                           | Phase 12 owner                | Fail release gate or disable writer, remove fanout, and restore O(1) command before activation.                                                                  |
| `d51_unreconciled_ambiguous_attempt_oldest_age`         | **> 24 hours for any admitted attempt**                                                                                                                                                                                        | Delivery Operations           | Investigate provider/adapter, perform evidence-safe reconciliation, keep state indeterminate, and pause that adapter if two consecutive daily thresholds breach. |
| `d51_logical_cancellation_projection_lag`               | **> 15 minutes for three consecutive 5-minute samples**                                                                                                                                                                        | Workflow Operations           | Repair bounded reconciler/projections while leaving epoch truth intact; page Phase 12 if lag grows for another 15 minutes.                                       |
| `d51_policy_receipt_recovery_failure_total`             | **> 0 unrecovered ambiguous policy save after three bounded reads**                                                                                                                                                            | Phase 12 on-call              | Disable repeat submit, inspect source receipt/head, restore authoritative result, and prevent duplicate publication.                                             |
| `d51_cross_tenant_or_wrong_purpose_denial_escape_total` | **> 0 ever**                                                                                                                                                                                                                   | Security + Identity           | Disable affected endpoint/worker, start Critical tenant-isolation incident, preserve audit, assess notification exposure, and remediate all paths.               |
| `d51_off_copy_comprehension_release_gate`               | **< 90% of representative authorized staff correctly identify all four outcomes: pending reminders stop, earlier in-product history may remain, an already-sending reminder may arrive, requests/tasks/access stay unchanged** | Product Research + Design     | Do not activate UI; revise/test copy and interaction until threshold passes across mobile, assistive-tech, and low-bandwidth cohorts.                            |

The 24-hour ambiguity and 15-minute reconciliation thresholds are provisional
operational product judgments for a future adapter, not D51 delivery promises.
They must be re-ratified against provider contracts and production load before
activation; zero-tolerance correctness/security thresholds are permanent.

## Research assertions

### Repository and governing-contract facts

- **D51-RA001 — Repository fact:** D43–D51 have no current cadence runtime,
  policy editor, cancellation epoch, reminder occurrence, or provider adapter.
- **D51-RA002 — Repository fact:** D47 makes the possible reminder default Off,
  courtesy-only, bounded to zero or one occurrence, and not a due/SLA signal.
- **D51-RA003 — Repository fact:** D48 orders policy admission at genuine D43
  creation and retains immutable admitted policy evidence.
- **D51-RA004 — Repository fact:** D48's stable policy serialization scope must
  work before an optional policy row exists.
- **D51-RA005 — Repository fact:** D49 owns one source occurrence and exact
  `sealed_members`, `sealed_proved_zero`, and
  `recipient_resolution_indeterminate` outcomes.
- **D51-RA006 — Repository fact:** D49 releases no member from an indeterminate
  resolution and permits downstream membership only to narrow.
- **D51-RA007 — Repository fact:** D50 pins immutable source-created and
  eligibility instants plus exact duration evidence.
- **D51-RA008 — Repository fact:** D50 not-before eligibility is not a release,
  delivery promise, deadline, or usefulness decision.
- **D51-RA009 — Repository fact:** Phase 12 owns D43 request/policy/source heads,
  decisions, authorization, audit, and semantic receipts.
- **D51-RA010 — Repository fact:** ADR-0183 makes Tasks Hub a source-work
  projection; task state cannot decide or cancel source work.
- **D51-RA011 — Repository fact:** ADR-0027/Phase 17 own presentation,
  engagement, end conditions, and external dispatch history independently.
- **D51-RA012 — Repository fact:** ADR-0184 requires purpose-bound current
  EffectiveAccess and exact source/history rather than broad role assumptions.
- **D51-RA013 — Repository fact:** the Identity OpenSpec requires server-resolved
  identity, Tenant, role, capability, and application authorization with RLS in
  depth.
- **D51-RA014 — Repository fact:** the Workflow OpenSpec keeps product records,
  claims, dispatch ledger, authorization, and audit authoritative over Inngest.
- **D51-RA015 — Repository fact:** Platform Boundaries keep sensitive mutations
  server-side and preserve one shared task model.
- **D51-RA016 — Repository fact:** Platform Principles rank Tenant/permission
  safety, clarity, accessibility, and reliability above convenience.
- **D51-RA017 — Repository fact:** frontend rules require shared `@asym/ui`, Base
  UI/base-maia, Maia/Zinc tokens, semantic forms/status, and server-owned
  privileged writes.
- **D51-RA018 — Repository fact:** D44's complete Access requests lane and
  source-backed task remain useful even if optional reminder projections fail.
- **D51-RA019 — Repository fact:** D44 initial attention and D51 courtesy
  reminders are different effects; Off cannot remove required initial attention.
- **D51-RA020 — Repository fact:** current task reminders, contribution timers,
  demo bell UI, and Resend usages belong to other domains and are not D51
  cancellation precedent.

### Verified external facts

- **D51-RA021 — Verified external fact:** Microsoft Entra permits stopping one
  active review instance and says it cannot be restarted.
- **D51-RA022 — Verified external fact:** Entra treats stopping a recurring
  series as a separate future-series edit.
- **D51-RA023 — Verified external fact:** SailPoint says changed access-request
  email configuration affects later requests while pending requests retain
  submission-time configuration.
- **D51-RA024 — Verified external fact:** HubSpot Off prevents new enrollment
  and skips actions for already enrolled records.
- **D51-RA025 — Verified external fact:** HubSpot records skipped actions and
  does not automatically replay records that exited while Off.
- **D51-RA026 — Verified external fact:** HubSpot delay behavior has additional
  vendor-specific rules, demonstrating that the word Off alone is insufficient.
- **D51-RA027 — Verified external fact:** Contentful has explicit scheduled,
  canceled, failed, and succeeded scheduled-action states.
- **D51-RA028 — Verified external fact:** Contentful cancellation is limited to
  work still scheduled and concurrent updates use version conflict.
- **D51-RA029 — Verified external fact:** Inngest cancels between steps; an
  actively executing step runs to completion.
- **D51-RA030 — Verified external fact:** canceling Inngest runs does not itself
  prevent new runs from being enqueued.
- **D51-RA031 — Verified external fact:** Inngest steps are distinct persisted,
  memoized, retried invocations rather than a transaction with Core's database.
- **D51-RA032 — Verified external fact:** AWS identifies source-write plus event-
  publish as a dual-write failure solved by an atomic transactional outbox.
- **D51-RA033 — Verified external fact:** AWS requires duplicate-tolerant,
  idempotent processing and preserved event order for outbox delivery.
- **D51-RA034 — Verified external fact:** RFC 9110 restricts automatic retry of
  non-idempotent requests unless semantics or application knowledge makes retry
  safe.
- **D51-RA035 — Verified external fact:** Stripe's idempotency layer returns the
  first result for a stable key and rejects key reuse with different parameters.
- **D51-RA036 — Verified external fact:** Stripe may prune idempotency keys after
  at least 24 hours, so they cannot be permanent product truth.
- **D51-RA037 — Verified external fact:** Stripe cancellation is resource-state-
  bounded and errors when the resource is no longer cancelable.
- **D51-RA038 — Verified external fact:** Resend retains email idempotency keys
  for 24 hours and reports concurrent requests separately.
- **D51-RA039 — Verified external fact:** Resend's cancel API applies to a
  provider-scheduled email object, not arbitrary already-submitted email.
- **D51-RA040 — Verified external fact:** PostgreSQL Serializable can abort one
  transaction when concurrent reads/writes cannot correspond to a serial order.
- **D51-RA041 — Verified external fact:** PostgreSQL requires retry of the whole
  transaction, including value-selection logic, after serialization failure.
- **D51-RA042 — Verified external fact:** PostgreSQL RLS separates row visibility
  under `USING` from mutation admissibility under `WITH CHECK`.
- **D51-RA043 — Verified external fact:** PostgreSQL owners and BYPASSRLS roles
  can bypass ordinary policies unless parity is deliberately enforced.
- **D51-RA044 — Verified external fact:** WCAG 2.2 requires predictable input,
  labels/instructions, textual errors, reflow, focus, and accessible status.
- **D51-RA045 — Verified external fact:** GOV.UK recommends action-specific
  button labels and sparing warning-button use for serious hard-to-undo harm.
- **D51-RA046 — Verified external fact:** USWDS reserves modal interruption for
  a decision that requires attention outside the normal flow.
- **D51-RA047 — Verified external fact:** Apple APNs and Firebase expose expiry/
  lifespan because delayed notifications can otherwise arrive after usefulness.
- **D51-RA048 — Verified external fact:** APNs calls delivery best effort and
  warns an expired notification may still arrive after its timestamp.
- **D51-RA049 — Verified external fact:** FCM acceptance returns a message ID but
  does not mean the device received the message.
- **D51-RA050 — Verified external fact:** no current public first-party nonprofit
  CRM source found in this review establishes a stronger cross-channel recall
  guarantee; absence of evidence cannot be filled with invented ministry facts.

### Corrected decision and source semantics

- **D51-RA051 — Requirement inference:** current policy revision alone cannot
  represent cancellation because a non-Off edit must preserve old admissions.
- **D51-RA052 — Requirement inference:** every admitted episode pins a separate
  monotonic cancellation epoch with its policy/D50 tuple.
- **D51-RA053 — Product judgment:** a non-Off edit changes revision/timing for
  later genuine requests but leaves the epoch unchanged.
- **D51-RA054 — Product judgment:** active-to-Off publication advances the epoch
  exactly once and becomes the logical cancellation instant.
- **D51-RA055 — Product judgment:** re-enable retains the advanced epoch so an
  older admission cannot pass an ABA-like active-state check.
- **D51-RA056 — Requirement inference:** an already-Off semantic replay/no-op
  cannot advance the epoch again or create a second audit effect.
- **D51-RA057 — Requirement inference:** Off truth is O(1) at the head/epoch
  commit and cannot depend on synchronous child-row fanout.
- **D51-RA058 — Requirement inference:** bounded reconciliation may materialize
  suppression later but cannot be needed to deny a source/effect claim.
- **D51-RA059 — Requirement inference:** every authoritative boundary checks
  `current state = active` and `pinned epoch = current epoch` in its mutation.
- **D51-RA060 — Requirement inference:** a newer active non-Off revision with
  the same epoch must not invalidate the older pinned revision.

### Ordering, occurrence, and effect assertions

- **D51-RA061 — Requirement inference:** policy publication and D49 seal share
  one stable serialization scope or complete-command conflict retry.
- **D51-RA062 — Requirement inference:** Off-first permanently ends a waiting
  D50 candidate without changing its immutable source/eligibility facts.
- **D51-RA063 — Requirement inference:** Off-first permanently source-fences the
  same D49 indeterminate occurrence; it cannot retry after re-enable.
- **D51-RA064 — Requirement inference:** a D49 terminal seal ordered first
  preserves exact `sealed_members` or `sealed_proved_zero` history.
- **D51-RA065 — Requirement inference:** `sealed_proved_zero` is already a
  terminal no-effect result and needs no D51 descendant.
- **D51-RA066 — Requirement inference:** a sealed member creates no entitlement
  to later release; every descendant must pass its own current fence.
- **D51-RA067 — Requirement inference:** presentation irreversibility is the
  atomic queryable release commit, not worker preparation, rendering, or read.
- **D51-RA068 — Requirement inference:** Off-first prevents release; release-
  first preserves history and cannot be recast as unseen.
- **D51-RA069 — Requirement inference:** D51 cannot fabricate read, dismissal,
  archive, or presentation end to hide a release-first result.
- **D51-RA070 — Requirement inference:** active/unread attention ends only under
  ADR-0027's source-owned presentation-end contract.
- **D51-RA071 — Requirement inference:** external dispatch remains `Unprepared`
  until product preparation has completed under its own valid source proof.
- **D51-RA072 — Requirement inference:** `Prepared definitely unsubmitted` is
  the last external state Off can suppress with proof that no call may begin.
- **D51-RA073 — Requirement inference:** submission-attempt admission atomically
  changes dispatch to `Submission may have begun` before the call.
- **D51-RA074 — Requirement inference:** the attempt-admission transaction
  retains one stable product effect/attempt/idempotency identity and source
  evidence.
- **D51-RA075 — Requirement inference:** a committed attempt fence can never
  regress to `Prepared definitely unsubmitted` or `Unprepared`.
- **D51-RA076 — Requirement inference:** provider outcomes remain the orthogonal
  closed set `None`, `Accepted`, `Definitely rejected`, and `Indeterminate`.
- **D51-RA077 — Requirement inference:** product order establishes attempt-
  admission-first or Off-first; provider timestamps cannot extend that order.
- **D51-RA078 — Requirement inference:** an attempt admitted before Off may
  complete after Off and remains truthful effect history.
- **D51-RA079 — Requirement inference:** a `Definitely rejected` outcome reached
  after Off is terminal and cannot be retried under the old admission.
- **D51-RA080 — Requirement inference:** `Indeterminate` is preserved and
  reconciled against the exact attempt without guessing or creating a second
  attempt.

### Authorization, integrity, and failure assertions

- **D51-RA081 — Product judgment:** provider-specific cancellation is optional
  best-effort narrowing and never Phase 12 source truth.
- **D51-RA082 — Requirement inference:** a provider cancellation result must be
  proved by provider evidence and cannot erase the original attempt admission.
- **D51-RA083 — Requirement inference:** provider idempotency supplements but
  cannot replace permanent product uniqueness and receipts.
- **D51-RA084 — Requirement inference:** Inngest cancellation, pause, replay,
  and cleanup are execution optimizations only.
- **D51-RA085 — Requirement inference:** old workers may execute but cannot
  cross a fence-aware product mutation boundary after Off-first.
- **D51-RA086 — Requirement inference:** executor payloads carry safe typed
  identifiers only and cannot carry authoritative policy/recipient truth.
- **D51-RA087 — Requirement inference:** Off changes no D43 request lifecycle,
  grant, EffectiveAccess, holder status, or decision.
- **D51-RA088 — Requirement inference:** Off changes no D44 responsibility,
  source-backed task, initial attention, task completion, or task assignment.
- **D51-RA089 — Product judgment:** Off emits no cancellation task,
  notification, email, chat, unread change, or escalation.
- **D51-RA090 — Requirement inference:** human policy publication and automatic
  source/effect claims have separate registered authorization purposes.
- **D51-RA091 — Requirement inference:** the server derives Tenant, actor,
  purpose, heads, epoch, source/effect IDs, timestamps, and audit attribution.
- **D51-RA092 — Requirement inference:** a client cannot supply, mutate, or
  retarget the cancellation epoch or authoritative order evidence.
- **D51-RA093 — Requirement inference:** every relationship and uniqueness
  constraint includes non-null same-Tenant scope where applicable.
- **D51-RA094 — Requirement inference:** RLS `USING` and `WITH CHECK` must both
  prevent a permitted row from being transformed across Tenant/scope/state.
- **D51-RA095 — Requirement inference:** owner, service-role, worker, support,
  RPC, view, trigger, function, and BYPASSRLS paths enforce authorization parity.
- **D51-RA096 — Requirement inference:** deletion is restrictive for referenced
  policy/epoch/source/effect evidence; retention/anonymization preserves meaning.
- **D51-RA097 — Requirement inference:** semantic idempotency is tied to the
  durable policy/effect result rather than HTTP, event, or provider retention.
- **D51-RA098 — Requirement inference:** lost Off responses recover the same
  head, epoch, audit, and receipt before any repeat publication.
- **D51-RA099 — Requirement inference:** failed reconciliation cannot weaken the
  logical epoch fence or authorize a post-fence effect.
- **D51-RA100 — Requirement inference:** rollback after an Off write is
  roll-forward; no code/schema/UI rollback may decrement or forget the epoch.

### UX, operations, migration, proof, and unknowns

- **D51-RA101 — Product judgment:** policy UX belongs in People & access →
  Access requests → Settings, not Tasks Hub, Notification Center, or a provider
  preference surface.
- **D51-RA102 — Product judgment:** the future editor uses one route-addressable
  shared Base Maia form/Sheet with local draft and explicit submission.
- **D51-RA103 — Product judgment:** selecting Off reveals one inline consequence
  review; it does not submit, navigate, or open another overlay.
- **D51-RA104 — Product judgment:** the exact final action is **Turn off courtesy
  reminders**, with **Cancel** as the safe alternative.
- **D51-RA105 — Product judgment:** exact copy distinguishes preventable pending
  reminders from earlier in-product history and reminders already being sent.
- **D51-RA106 — Product judgment:** exact copy states access requests, tasks, and
  access do not change and re-enable applies only to new requests.
- **D51-RA107 — Requirement inference:** impact counts, recipient names, request
  details, and channel inventory are unnecessary and privacy-risking.
- **D51-RA108 — Requirement inference:** no autosave, instant toggle, optimistic
  commit, save-on-blur, typed phrase, checkbox ritual, modal, or false Undo is
  permitted.
- **D51-RA109 — Requirement inference:** success and error/conflict states are
  persistent, textual, programmatically announced, and never toast-only.
- **D51-RA110 — Requirement inference:** the future UX must prove keyboard,
  screen reader, focus, reflow, touch, forced colors, RTL/CJK/localization,
  reduced-motion, and low-bandwidth recovery.
- **D51-RA111 — Requirement inference:** Off mutation cardinality/latency is
  independent of current request, cohort, effect, and task counts.
- **D51-RA112 — Requirement inference:** later materialization/reconciliation is
  indexed and bounded but never correctness-authoritative.
- **D51-RA113 — Requirement inference:** no policy writer can activate until all
  D49 seal, presentation release, and attempt-admission paths enforce the epoch.
- **D51-RA114 — Requirement inference:** no historical admission is inferred or
  backfilled because no D51 runtime currently exists.
- **D51-RA115 — Requirement inference:** migration and restore preserve immutable
  revisions, epochs, pinned tuples, receipts, and effect history.
- **D51-RA116 — Requirement inference:** exact release proof includes positive,
  negative, boundary, authorization, concurrency, migration, provider,
  accessibility, and production-shaped tests.
- **D51-RA117 — Requirement inference:** all D51 terms/numbers/states must trace
  consistently through decision log, glossary, ADR, OpenSpec, design, tickets,
  implementation, tests, and release evidence before activation.
- **D51-RA118 — Unresolved unknown:** whether the courtesy reminder itself has
  representative ministry value remains an activation gate, not a D51 fact.
- **D51-RA119 — Unresolved unknown:** D52 must choose useful-lateness only for an
  otherwise-current unresolved/retryable occurrence where no Off or source-
  terminal fence has already ended it.
- **D51-RA120 — Scope boundary:** D51 chooses no cadence interval, usefulness
  interval, content, channel, provider, quiet time, destination rule, schema,
  executor, telemetry, or runtime artifact.

## Acceptance criteria

### Policy and source semantics

- **D51-AC001:** This decision changes documentation only; repository review
  finds no new schema, migration, runtime, API, event, job, feature flag,
  telemetry, UI, or dependency attributable to D51.
- **D51-AC002:** A future policy publication either atomically appends one
  immutable revision, updates one expected head, records audit/receipt, and
  applies the required epoch rule, or writes none of them.
- **D51-AC003:** A successful active-to-Off transition advances the scoped
  cancellation epoch exactly once and returns its exact logical cancellation
  order evidence.
- **D51-AC004:** Replaying the same semantic Off command after success or a lost
  response returns the original head/epoch/audit/receipt and does not advance or
  fan out again.
- **D51-AC005:** A non-Off-to-non-Off edit changes the active revision but leaves
  the cancellation epoch unchanged.
- **D51-AC006:** Re-enable publishes a new active revision while retaining the
  epoch established by the last Off transition.
- **D51-AC007:** Every admitted D43 episode atomically retains the exact policy
  revision, cancellation epoch, D48 disposition, and D50 tuple or safe non-
  admission; replay cannot change them.
- **D51-AC008:** No edit, Off, re-enable, retry, restore, or migration rewrites a
  retained D50 source-created/eligibility instant or duration.
- **D51-AC009:** An Off command's source transaction has constant logical work:
  policy revision/head/epoch/audit/receipt and optional identifier-only outbox,
  independent of current child count.
- **D51-AC010:** Query/statement evidence proves the Off command performs no
  synchronous read/count/write of request, occurrence member, task,
  presentation, dispatch, provider, or executor-run collections.

### Boundary and concurrency proof

- **D51-AC011:** An episode pinned to an older non-Off revision may still pass a
  later claim after a non-Off edit when its epoch equals the current active
  epoch; the claim uses its original D50 tuple.
- **D51-AC012:** In an Off-versus-D50-claim race, Off-first denies further source
  progress, while a D50 eligibility observation alone never defeats Off.
- **D51-AC013:** In an Off-versus-D49-indeterminate retry race, Off-first
  permanently source-fences that same occurrence and re-enable cannot retry it.
- **D51-AC014:** In an Off-versus-D49-terminal-seal race, exactly one order is
  committed: Off-first denies seal, or seal-first preserves one complete
  `sealed_members`/`sealed_proved_zero` result.
- **D51-AC015:** Off applied after `sealed_proved_zero` creates no member,
  descendant, second occurrence, retry, or substitute zero result.
- **D51-AC016:** In an Off-versus-in-product-release race, exactly one order is
  committed: Off-first leaves no release, or release-first retains one queryable
  presentation/release receipt.
- **D51-AC017:** A release-first result is never rewritten to unseen, unread,
  dismissed, archived, or unreleased by D51; any later end follows ADR-0027.
- **D51-AC018:** In an Off-versus-external-attempt-admission race, exactly one
  order is committed: Off-first leaves dispatch `Unprepared` or `Prepared
definitely unsubmitted`, or admission-first sets `Submission may have begun`
  before the network call.
- **D51-AC019:** Once submission-attempt admission commits, no code path can
  regress dispatch to `Prepared definitely unsubmitted`/`Unprepared`, regardless
  of timeout, crash, Off, cancel event, webhook, or support action.
- **D51-AC020:** Concurrent commands for the same external effect admit at most
  one stable attempt identity; all losing/replayed commands return conflict or
  the same semantic receipt and cannot call under a new key.

### Effect, provider, and source-domain outcomes

- **D51-AC021:** Database constraints/state-machine tests admit only dispatch
  `Unprepared`, `Prepared definitely unsubmitted`, or `Submission may have
begun` and outcome `None`, `Accepted`, `Definitely rejected`, or
  `Indeterminate` in valid combinations.
- **D51-AC022:** A provider response/webhook updates only the exact attempt's
  outcome idempotently and cannot infer or rewrite the D51 Off/attempt order.
- **D51-AC023:** An acceptance response arriving after Off preserves the
  admission-first attempt and `Accepted` evidence without claiming provider
  acceptance occurred before or after Off.
- **D51-AC024:** An attempt whose outcome becomes `Definitely rejected` after
  Off is terminal; retry/replay/recovery tests prove zero later provider calls.
- **D51-AC025:** A response-loss/timeout case retains `Submission may have begun`
  with `None` while active or `Indeterminate` when evidence requires it,
  reconciles the exact attempt, and never blind-sends another.
- **D51-AC026:** A provider-scheduled cancellation adapter, if later approved,
  records success/failure/ambiguity separately and never erases attempt
  admission or weakens the epoch fence.
- **D51-AC027:** Expiry/pruning of provider idempotency data cannot permit a
  second product attempt for the same semantic effect.
- **D51-AC028:** Canceling, pausing, replaying, losing, or disabling an Inngest
  run cannot alter policy epoch, source seal, presentation release, attempt
  admission, provider outcome, or semantic uniqueness.
- **D51-AC029:** Off/non-Off/re-enable produce no D43 lifecycle/access/grant/
  EffectiveAccess/D44 responsibility/task/initial-attention change and emit no
  cancellation task, notification, email, chat, or escalation.
- **D51-AC030:** A released/externally arriving reminder resolves its link from
  current same-Tenant authorization/source truth and renders a safe terminal or
  unavailable result without exposing policy/provider diagnostics.

### Authorization, database, privacy, and audit proof

- **D51-AC031:** Human policy publication succeeds only for a current same-
  Tenant `permissions.manage_grants` holder under the registered D44/Phase 12
  purpose and is denied before mutation otherwise.
- **D51-AC032:** Automatic D50/D49/release/attempt claims use registered code-
  owned purposes, never a human actor impersonation or broad service-role trust.
- **D51-AC033:** API mutation tests prove caller-supplied Tenant, actor, purpose,
  policy head/revision, epoch, request/member/effect/attempt ID, timestamp, or
  audit attribution cannot retarget authoritative state.
- **D51-AC034:** Primary/foreign/unique/check constraints reject null Tenant,
  cross-Tenant relationships, duplicate semantic effect/attempt, epoch
  decrement/reuse, and invalid terminal transitions.
- **D51-AC035:** RLS tests cover `SELECT`, `INSERT`, `UPDATE`, and `DELETE` with
  both `USING` and `WITH CHECK`, including an update that tries to move a
  permitted row into another Tenant/scope/state.
- **D51-AC036:** Equivalent negative authorization tests pass for ordinary,
  owner, service-role, worker, support, RPC, view, function, trigger, and
  BYPASSRLS-capable paths.
- **D51-AC037:** Evidence fields that establish policy/source/effect order are
  immutable after commit; corrections append linked evidence rather than
  overwriting history.
- **D51-AC038:** Delete, retention, anonymization, backup/restore, and Tenant
  offboarding tests preserve required business chronology and prevent
  resurrecting a lower epoch or old effect.
- **D51-AC039:** Events, queues, traces, error logs, analytics, tasks, and
  ordinary exports contain no protected names, reasons, request content,
  destinations, provider secrets, or recipient lists beyond registered purpose.
- **D51-AC040:** Authorized business audit can distinguish policy publication,
  logical cancellation, source suppression, D49 seal, presentation release,
  attempt admission, provider outcome, and reconciliation with exact actor/
  system purpose and same-Tenant scope.

### UX, accessibility, and recovery proof

- **D51-AC041:** No current UI exists; a later activated editor appears only in
  People & access → Access requests → Settings and reuses shared Base Maia/Base
  UI primitives and Maia/Zinc tokens.
- **D51-AC042:** A non-Off edit shows exactly that it applies only to new access
  review requests and existing reminder timing does not change.
- **D51-AC043:** Selecting Off changes local draft only and reveals one inline
  consequence review in the same form/Sheet; it opens no modal/nested Sheet and
  makes no request.
- **D51-AC044:** The Off review states all five consequences: preventable
  pending reminders stop; earlier in-product reminder history may remain; an
  already-sending reminder may arrive; requests/tasks/access do not change; re-
  enable applies only to new requests.
- **D51-AC045:** While Off is selected, the final action label is exactly **Turn
  off courtesy reminders** and **Cancel** remains available without submitting.
- **D51-AC046:** UX inspection finds no autosave switch, save-on-blur, optimistic
  commit, red deletion ceremony, impact count, names, request details, channel
  list, typed phrase, checkbox ritual, countdown, false Undo, or second
  confirmation.
- **D51-AC047:** Success persists on page, is programmatically announced, and
  says courtesy reminders are off, requests/tasks/access did not change,
  earlier in-product history may remain, and an already-sending reminder may
  arrive; success is not toast-only.
- **D51-AC048:** A stale expected-head response preserves the draft, reloads the
  current authoritative summary, identifies the conflict in text, moves focus
  predictably, and requires fresh review.
- **D51-AC049:** A lost or ambiguous policy-save response attempts semantic
  receipt recovery before enabling repeat submission and cannot create a second
  revision/epoch.
- **D51-AC050:** Manual and automated accessibility proof covers semantic names/
  roles/values, labels/descriptions/errors, keyboard order, visible/unobscured
  focus, status announcements, non-color meaning, forced colors, touch target,
  reduced motion, and no change of context on selection.

### Rollout, scale, operations, and traceability proof

- **D51-AC051:** Layout/copy works at 320 CSS pixels and 400% zoom, mobile touch,
  RTL, CJK/long translation, screen reader, and low bandwidth without content,
  action, focus, or receipt loss.
- **D51-AC052:** A mixed-version release test proves every D49 seal,
  presentation-release, and attempt-admission mutation is fence-aware before
  the Off writer/UI can activate; old workers cannot bypass the database/API
  boundary.
- **D51-AC053:** Migration deploys additive compatible evidence first, infers no
  historical D51 admission, and verifies old-code/new-schema plus new-code/old-
  schema failure safety before activation.
- **D51-AC054:** Rollback after a committed Off retains the advanced epoch and
  old cancellations; recovery is roll-forward and never restores/recalculates
  old work.
- **D51-AC055:** Production-shaped load tests demonstrate Off command statement/
  write count is constant with at least empty, typical, and largest-supported
  Tenant backlogs; numerical latency budgets are ratified before release.
- **D51-AC056:** Every zero-tolerance monitor is wired to a production-shaped
  fault test that proves its alert, owner route, narrowing response, and
  protected-data minimization.
- **D51-AC057:** Bounded reconciliation uses indexed stable keys, resumes
  idempotently after interruption, and cannot release work; lag affects only
  projection/operations evidence, never Off correctness.
- **D51-AC058:** A traceability check finds one consistent decision, terms,
  states, owners, numbers, and criteria from Grill answer through glossary,
  ADRs, OpenSpec, design, tasks, tickets, code, tests, and release evidence.
- **D51-AC059:** Before UI activation, representative authorized staff research
  meets the named 90% comprehension gate across ordinary, mobile, assistive-
  technology, and low-bandwidth scenarios without an impact count or jargon.
- **D51-AC060:** D52 useful-lateness implementation, when later decided, can
  only narrow an otherwise-current occurrence; it cannot override an Off/source-
  terminal fence, revive a lower epoch, or change any D51 boundary/history.

## D52 — Useful-lateness boundary for an otherwise-current eligible occurrence

### Why this is the next decision

D51 now completely settles Off: if Off or an independent D43 source-terminal
fence wins, waiting and D49-indeterminate work ends permanently and no later
usefulness rule may revive it. One different case remains.

Hope Mission has an admitted request whose D50 not-before instant has passed.
The cadence is still active and its pinned cancellation epoch still equals the
current epoch. Recipient resolution is temporarily indeterminate, or an
otherwise valid product release is delayed by an outage. The source request is
still actionable. If the dependency recovers much later, Core needs to know
whether the courtesy attention is still helpful or has become stale. This is
not a due date, task SLA, provider-delivery promise, or Off behavior.

Current primary evidence supports making usefulness explicit but does not pick
a Core duration. APNs and FCM both expose expiration/lifespan because stored
notifications can otherwise arrive after delay; Apple also warns expiry is
best effort after provider handoff. Inngest can durably retry late, but that
does not prove the product effect remains useful. Core therefore needs a
source-owned pre-release usefulness fence before channel-specific expiry.

### Option 1 — bounded source usefulness interval — recommended

Keep the same one occurrence retryable only until one separately evidenced,
finite, code-owned usefulness fence derived from its immutable D50 eligibility
instant, while D43 remains actionable and every D51 epoch/source fence passes.
Before that fence, the same indeterminate occurrence may resolve/release; at or
after it, unsealed/unreleased work records a terminal source no-effect result
and never catches up. Provider-specific TTL may narrow further after external
attempt admission but never widen the source interval.

**Why recommended:** it prevents stale outage recovery from surprising staff,
keeps time immutable and source-owned, works across in-product and future
channels, and needs no pause/resume clock. It deliberately does not choose the
duration; that value requires representative ministry evidence and later
ratification.

### Option 2 — useful while the request remains pending

Allow the same occurrence to resolve/release at any later time while D43 remains
actionable and the D51 epoch is current.

**Tradeoff:** simplest state model, but a weeks-old outage or backlog can produce
a stale burst long after the reminder would help. Provider TTL cannot protect
the in-product path or work not yet handed off.

### Option 3 — exact-time only, no grace

Permit release only at the D50 eligibility instant; any worker, database,
dependency, or authorization delay loses the occurrence.

**Tradeoff:** eliminates stale delivery but is operationally brittle and makes
ordinary distributed delay silently drop useful attention. D50 is a not-before
instant, not an exact appointment, so this would change its meaning.

### Recommendation and exact question

**Recommendation: Option 1 — one bounded source usefulness interval, with its
numeric value researched and decided separately.** It gives Core a durable seam
for future reminder Delivery Steps such as in-product, email, push, Slack,
Teams, or Google Chat without making any provider the source clock. Tasks Hub
is never a delivery channel, and digests/escalations remain separate meanings.
It also preserves D51's permanent Off fence and chooses no channel now.

Which D52 rule should Core record: **Option 1 — one bounded source usefulness
interval before irreversible release**, **Option 2 — useful indefinitely while
the request remains pending**, or **Option 3 — exact-time only with no grace**?

## Source index

### Core

- [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)
- [D47 primary research](./phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)
- [D48 primary research](./phase-24-d48-new-request-only-cadence-application-primary-research.md)
- [D49 primary research](./phase-24-d49-current-recipient-cohort-primary-research.md)
- [D50 primary research](./phase-24-d50-request-anchored-elapsed-clock-primary-research.md)
- [D51 adversarial review](./phase-24-d51-immediate-irreversible-narrowing-adversarial-review.md)
- [Phase 12](./phase-12-full-role-permission-configuration.md)
- [Phase 17](./phase-17-system-messages-template-management.md)
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
- [Identity and Access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)
- [Workflow Orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)
- [Platform Boundaries OpenSpec](../../../openspec/specs/platform-boundaries/spec.md)
- [Platform Principles OpenSpec](../../../openspec/specs/platform-principles/spec.md)
- [Frontend rules](../../../docs/ai/rules/frontend.md)

### External primary sources

- [Microsoft Entra — complete an access review](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
- [Microsoft Entra — create an access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
- [SailPoint — configure access-request emails](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)
- [HubSpot — turn off workflows](https://knowledge.hubspot.com/workflows/turn-off-workflows)
- [Contentful — scheduled actions](https://www.contentful.com/developers/docs/references/content-management-api/scheduled-actions/)
- [Inngest — function cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
- [Inngest — function execution](https://www.inngest.com/docs/learn/how-functions-are-executed)
- [AWS — transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
- [RFC 9110 — idempotent methods](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)
- [Stripe — idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Stripe — cancel a PaymentIntent](https://docs.stripe.com/api/payment_intents/cancel)
- [Resend — idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [Resend — cancel a scheduled email](https://resend.com/docs/api-reference/emails/cancel-email)
- [PostgreSQL — transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL — serialization failures](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
- [PostgreSQL — row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [GOV.UK — button guidance](https://design-system.service.gov.uk/components/button/)
- [USWDS — modal guidance](https://designsystem.digital.gov/components/modal/)
- [Apple — APNs request/expiration behavior](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns)
- [Firebase — message lifespan](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan)

## Evidence limits and final conclusion

Official vendor documentation establishes real patterns and failure boundaries,
not Core user truth. No vendor proves that a courtesy reminder is necessary,
that one universal cancellation rule fits every channel, that provider cancel
recalls an accepted effect, or that a specific useful-lateness interval fits
missions ministries. The 90% comprehension release gate and provisional
operational thresholds are product judgments that require representative
evidence before activation.

D51 is nevertheless complete as a lifecycle decision. The separate monotonic
cancellation epoch prevents both false cancellation on ordinary edits and
resurrection after re-enable. O(1) logical fencing avoids brittle fanout.
Product-owned D49 seal, presentation release, and submission-attempt admission
provide one provable order. Exact external axes preserve ambiguity instead of
inventing provider truth. Quiet inline UX explains consequences without leaking
protected current-work data or creating deletion-level ceremony. With these
amendments, Option 1 is safe, scalable, testable, consistent with Core, and
ready to record—while implementation remains correctly unauthorized.

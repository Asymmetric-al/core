# Phase 24 D52 — Bounded Usefulness Window Primary Research

**Date:** 2026-08-29

**Autonomous decision:** **Option 1 — one finite product/source-owned
`useful_for_seconds`, resolved to immutable exclusive `useful_until`**

**Disposition:** **Accept with required amendments**

**Scope:** useful-lateness for the one possible D47 courtesy-reminder
occurrence when D43 source truth and the D51 cancellation epoch remain current;
temporal ownership, terminal no-effect semantics, in-product/external effect
boundaries, recovery, UX, authorization, RLS, migration, proof, and one D53
question only; no numeric duration, cadence value, content, channel, provider,
quiet time, schema, OpenSpec, executor, telemetry, feature flag, or UI artifact

## Purpose and research standard

D50 defines when the one possible reminder becomes eligible, but only as an
inclusive not-before instant. D51 permanently ends work when Off or another
source-terminal fence wins. D52 resolves the remaining case: the request,
recipient basis, authorization, and cancellation epoch all remain current, but
a dependency, queue, deployment, lock, or D49 indeterminate proof delays the
same occurrence. Core needs one terminal answer for when releasing it would be
stale rather than helpful.

Option 1 was treated as a hypothesis. It was compared with request-lifetime
eligibility, exact-instant execution, provider TTL, worker retry limits, and no-
build. Current official IAM, nonprofit grantmaking, push, CMS, workflow, and
e-commerce evidence consistently separates a finite business/review window
from later execution or delivery. It does not supply a transferable number.

The corrected model therefore adds two source-owned facts to a future admitted
tuple: one strictly positive finite fixed-elapsed **`useful_for_seconds`** from a
versioned code-owned registry and one immutable **`useful_until`** equal to D50
**`not_before`** plus that duration. D50's candidate/eligibility instant is
called `not_before` here. `not_before` is inclusive and `useful_until` is
exclusive. At or after `useful_until`,
unsealed work records a terminal no-effect disposition and sealed-but-
unreleased descendants are suppressed. Nothing catches up.

Evidence labels are strict:

- **Repository fact:** verified in the current Core repository.
- **Verified external fact:** verified in current official first-party material.
- **Requirement inference:** required by a governing Core or platform boundary.
- **Product judgment:** Core deliberately chooses among multiple safe models.
- **Assumption:** plausible but not established by representative ministry data.
- **Unresolved unknown:** reserved for a later founder, research, or design gate.

Vendor behavior is comparative evidence only. Core imports no vendor number,
calendar, due-date semantics, reminder frequency, TTL guarantee, workflow,
provider, state machine, component, or retention limit.

## Executive finding

**Select Option 1 with required amendments.** A finite source-owned window is
the best permanent model because it tolerates normal distributed delay without
permitting unbounded stale attention:

- Microsoft Entra access-review reminders occur within a configured finite
  review duration and its midpoint; reviewers cannot respond after the review
  ends. Okta campaigns close on their end date or earlier completion. SailPoint
  certification reminders stop at sign-off, expiry, or completion. These are
  due-governed products, unlike Core's courtesy nudge, but they demonstrate that
  reminder usefulness is bounded by source lifecycle rather than queue age.
- Blackbaud Grantmaking anchors draft/form reminders before a cycle close or
  form due date. It is relevant nonprofit operational evidence, but its default
  five/seven-day values and deadline UX do not transfer to access governance.
- RFC 8030 says some push messages cease to be useful, requires TTL, and forbids
  a push service from attempting after TTL; it also makes the application
  account for transit delay. Firebase offers zero-to-28-day message lifespan
  and says provider acceptance is not device delivery. APNs offers expiry but
  explicitly calls it best effort and allows arrival afterward. Provider TTL
  can narrow a channel only; it cannot be Core's cross-surface source boundary.
- Stripe Checkout Sessions use a finite product resource expiration independent
  of worker retries. The permitted 30-minute-to-24-hour range demonstrates the
  pattern, not a D52 value.
- Inngest durably sleeps and retries but documents separate queue delays,
  configurable retries/timeouts, and plan/execution limits. Those are executor
  mechanics, not user-facing usefulness.
- PostgreSQL supports exact UTC-normalized instants, checked constraints, and
  serializable retry, but current-time functions have different meanings and a
  transaction has no ordinary physical commit timestamp. D52 must use one
  trusted final source-decision instant, not worker time or a stale transaction-
  start value.

The strongest alternative—eligibility until D43 ends—is simpler but silently
makes outage length the user experience and can produce weeks-old catch-up.
Exact-instant execution eliminates stale output but makes ordinary scheduling
latency a hidden product guarantee. A finite half-open window is the smallest
model that rejects both hazards.

D52 selects no number and activates nothing. A future quiet timing disclosure
may say:

> If Asym cannot create the reminder soon enough, it skips it instead of
> creating it late.

No countdown, due date, overdue state, failure alert, or extra setting is added.

## Exact corrected D52 decision

1. D52 selects one **finite product/source-owned usefulness window** for the
   single possible D47 courtesy-reminder occurrence of an exact D48-admitted
   D43 request episode.
2. D52 does not activate or prove the reminder. D46/D47 and every later content,
   channel, evidence, security, and release gate remain controlling.
3. A future admitted cadence tuple must carry exact versioned code-owned
   **`wait_for_seconds`** and strictly positive finite fixed-elapsed
   **`useful_for_seconds`** as one complete timing profile. D52 chooses no
   numeric pair or registry cardinality.
4. Tenant free text, arbitrary number, cron, RRULE, calendar date, working-day
   rule, per-request override, provider TTL, task due date, worker timeout, and
   retry count cannot define or widen the interval.
5. D53 must decide whether complete pairs enter only after D47 evidence, are
   guessed now from convention, or become separately Tenant-configurable. D52's
   recommended permanent UX is one evidence-backed complete profile selection,
   with both values pinned at D48 admission and no separate usefulness control.
6. Inside the same successful D43 source-creation transaction that retains the
   D48/D50 tuple, Phase 12 performs checked arithmetic once and retains immutable
   **`useful_until = not_before + useful_for_seconds`**.
7. If the request creation rolls back, no `useful_for_seconds`/`useful_until`
   exists. Replay returns the original tuple and cannot recompute from current
   policy, code defaults, time, or provider state.
8. `useful_for_seconds` uses exact elapsed seconds on the same PostgreSQL/
   POSIX-style timeline as D50. If a later label says “day,” it means exactly
   86,400 elapsed seconds, not a local date, DST day, weekday, business day, or
   holiday.
9. Missing, zero/negative, unsupported, non-finite, contradictory, overflowed,
   or otherwise invalid usefulness proof cannot strand the valid D43 request.
   It follows D48's typed safe non-admission path and creates no reminder tuple.
10. `useful_until` is finite, UTC-normalized, precision-preserving, strictly
    later than `not_before`, immutable, and retained
    with exact registry/version/duration evidence.
11. Temporal usefulness is the half-open interval **[`not_before`,
    `useful_until`)**. D50 permits a source claim at `not_before`; D52 forbids a
    first seal/release/admission at or after `useful_until`.
12. Browser, Node/server-process, worker, replica, cache, Inngest, provider,
    destination device, and viewer clocks cannot decide D52 usefulness.
13. Every D49 terminal seal, in-product presentation release, and external
    submission-attempt admission captures one trusted primary-database
    **usefulness decision instant** in its final atomic source/effect mutation
    after required locks/current proofs. The transaction retains that instant
    or retains nothing.
14. The usefulness decision instant is not called a physical commit timestamp.
    Exact PostgreSQL function/precision awaits design; it must be sampled once
    at the final guarded mutation, after waits and before no external I/O, so a
    transaction-start/worker timestamp cannot make stale work appear timely.
15. A boundary proceeds only when the retained decision instant is at or after
    `not_before` and strictly before `useful_until`, and every current D43,
    D44, D49, authorization, D51 active-state/epoch, and uniqueness predicate
    passes in the same mutation.
16. A long-running transaction cannot capture time before lock waits and commit
    later using stale temporal proof. Final mutation/transaction latency must be
    bounded and observable; no network call occurs inside the transaction.
17. Before `not_before`, the occurrence remains waiting and cannot seal or
    release. D52 does not move eligibility earlier.
18. From `not_before` until `useful_until`, an otherwise-current D49
    `recipient_resolution_indeterminate` occurrence may retry only the same
    occurrence under bounded claims and current proofs.
19. At or after `useful_until`, an otherwise-current unresolved occurrence
    becomes a terminal source no-effect disposition with reason
    **`usefulness_expired`**. It is not `sealed_proved_zero`, cancellation,
    failure, provider rejection, request completion, or task completion.
20. Logical usefulness expiry is effective from immutable `useful_until`;
    instant; correctness does not wait for a sweeper or materialized terminal
    receipt. The next read/claim must resolve it as terminal.
21. D49 `sealed_proved_zero` remains its earlier terminal zero proof and is not
    relabeled as usefulness expiry.
22. If D49 `sealed_members` commits before `useful_until`, the exact sealed cohort
    remains immutable. Each member descendant still must cross its own
    registered irreversible boundary before `useful_until` or be terminally
    suppressed for `usefulness_expired`.
23. One member's timely release does not extend another member's window. At
    `useful_until`, already released/admitted effects remain history and every
    still-unreleased descendant closes without substitution or catch-up.
24. D43 source terminality and D51 Off/cancellation epoch remain independent
    stronger current-source fences. Whichever predicate has already failed
    prevents release; no D52 rule can revive, delay, or override it.
25. If multiple fences are false when terminal evidence is materialized, the
    receipt preserves every relevant immutable fact and a deterministic code-
    owned disposition rule. It never guesses chronology from worker, provider,
    or device timestamps.
26. D51 non-Off edits and re-enable remain new-request-only. They never change
    an existing admitted `useful_for_seconds`/`useful_until`, reopen an expired
    occurrence, or create a second occurrence.
27. In-product irreversibility remains D51's atomic queryable presentation
    release commit. Release before `useful_until` remains truthful history;
    D52 cannot call it unseen or fabricate read/dismissal.
28. D52 is an admission ceiling, not a presentation-applicability end. A
    reminder released before `useful_until` remains active only while ADR-0027's
    current D43 source-actionability rule permits it; crossing `useful_until`
    alone does not clear unread attention, end/delete the item, or fabricate
    engagement.
29. Content/render preparation, queue claim, executor wake, outbox dequeue, and
    provider object construction before `useful_until` do not reserve
    timeliness.
30. External irreversibility remains D51's atomic product-owned submission-
    attempt admission. The exact envelope is already prepared/decrypted before
    the pre-I/O critical section; admission must commit before `useful_until`
    and changes dispatch to `Submission may have begun` with outcome `None`.
31. The one initial provider call may start after `useful_until` only as the
    immediate continuation of that same registered adapter critical section
    within its ratified bounded fence-to-I/O budget—without another queue,
    sleep, lock, retry, rekey, process handoff, or unrelated await. It may then
    finish, reconcile, or arrive later.
    D52 never promises recall/non-arrival, rewrites dispatch/outcome, or infers
    provider acceptance order from a provider timestamp.
32. At/after `useful_until`, Core admits no new attempt, follow-up, retry,
    replacement, rekey, resend, recipient substitution, channel fallback, or
    additional provider I/O for that occurrence. A stalled, terminated, or
    restarted process cannot resume the call after admission; it preserves
    `Submission may have begun` with `Indeterminate` evidence and performs no
    new I/O. Later work only reconciles that exact attempt/evidence.
33. A future channel supporting TTL/expiry must encode a provider deadline no
    later than source `useful_until`, rounded conservatively. A
    provider may shorten it; no provider setting may widen the source window.
34. APNs-style best-effort expiry and email without recall prove that provider
    TTL is defense in depth, not source truth. A provider-accepted effect can
    arrive late without changing D52 correctness.
35. Provider scheduling before D49/temporal/source proof is forbidden. Future
    adapters register their own admission/finality/TTL behavior rather than
    pre-scheduling this courtesy effect outside product control.
36. Inngest sleep, start/finish timeout, retry count, cancellation, run history,
    replay, or plan limit can reduce work but cannot define eligibility,
    `useful_until`, terminality, uniqueness, or repair truth.
37. No write must occur exactly at `useful_until`. Indexed bounded reconciliation
    may append terminal receipts/close projections later, but all source reads
    and mutations honor logical expiry immediately.
38. D52 changes no request, grant, EffectiveAccess, D44 responsibility, D44
    task/initial attention, task completion, access decision, holder status, or
    source actionability. It creates no task, message, email, push, chat, digest,
    escalation, or failure notification.
39. Future policy/registry publication and source/effect claims use the existing
    purpose-bound server authorization model. Tenant, actor/system purpose,
    policy/registry heads, duration, instants, identities, and audit attribution
    derive from trusted source context, never caller input.
40. Future persistence must enforce non-null same-Tenant relationships,
    immutable source evidence, exact state combinations, strict range/order
    checks, restrictive deletion, least grants, application authorization, RLS
    `USING`/`WITH CHECK`, and owner/service/worker/support/BYPASSRLS parity.
41. Future ordinary UX uses no separate usefulness control until D53 and value
    evidence justify one. It shows quiet no-stale-catch-up copy only after full
    feature activation, with no date, countdown, overdue, urgency color, failure
    badge, per-request status, or promise of provider non-arrival.
42. D52 adds no schema, migration, registry value, policy row, state, key,
    manifest entry, Delivery Step, event, outbox, index, cache, job, Inngest
    function, provider setting, feature flag, telemetry, UI, or hidden
    placeholder now.

## Current behavior, intended behavior, and permanent path

| Area              | Verified current behavior                                                                                   | D52 intended behavior                                                                                       | Best permanent path                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Reminder runtime  | D43–D52 are documentation only; no cadence occurrence or policy editor ships.                               | Keep no-runtime/default-Off gates.                                                                          | Record contracts now; implement only after all evidence/release gates.                              |
| Source time       | D50 owns immutable request-created evidence and inclusive `not_before`.                                     | Add pinned positive `useful_for_seconds` and immutable exclusive `useful_until`.                            | Derive once in D43 source transaction from admitted registry evidence.                              |
| Policy lifecycle  | D51 owns active revision/cancellation epoch; edit/re-enable are prospective and Off is immediate narrowing. | Usefulness is immutable per admission and always subordinate to current source/epoch.                       | Conjunctive Phase 12 source predicates; no current-policy recompute.                                |
| D49 occurrence    | One occurrence can be waiting, indeterminate, sealed members, or proved zero.                               | Indeterminate/unreleased closes terminally at `useful_until`; earlier seal history remains.                 | Source-owned `usefulness_expired` no-effect disposition and descendant narrowing.                   |
| In-product effect | ADR-0027 owns release, engagement, active presentation, and history.                                        | First release only before `useful_until`; crossing the ceiling alone does not end an already released item. | D52 gates release; current D43 source actionability continues to govern presentation applicability. |
| External effect   | D51 owns attempt-admission boundary and exact dispatch/outcome axes.                                        | Admit only before `useful_until`; reconcile admitted attempts later; provider TTL only narrows.             | Product attempt receipt plus channel-specific conservative expiry adapter.                          |
| Tasks and access  | D43/D44/ADR-0183 own request, access work, and task.                                                        | No task/access/request mutation or stale-reminder failure message.                                          | Keep source work available independently of optional attention.                                     |
| Executor          | Inngest is replaceable identifier-only orchestration.                                                       | Late wake runs a product claim that safely closes/no-ops after `useful_until`.                              | Product-database predicates and bounded reconciliation, not executor timeout.                       |
| UX                | No timing/usefulness editor exists.                                                                         | Quiet “skip instead of late” disclosure; no due/overdue/countdown/control.                                  | Existing Base Maia Access requests settings only after activation proof.                            |

## Governing Core evidence

| Repository authority                                                                                                                                                                                             | Verified finding                                                                                                                            | D52 consequence                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [D52 decision-log question](./phase-24-multi-site-management-decision-log.md)                                                                                                                                    | D50 is not-before only; D51 handles Off/source ends; three useful-lateness models remain.                                                   | D52 selects one finite window but no number.                                                 |
| [D47 research](./phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)                                                                                                                               | Cadence is optional/default Off, code-owned finite, courtesy-only, and at most one occurrence.                                              | Use a bounded registry fact; do not add recurrence/due/SLA meaning.                          |
| [D48 research](./phase-24-d48-new-request-only-cadence-application-primary-research.md)                                                                                                                          | Source creation pins exact policy evidence prospectively under stable serialization.                                                        | Pin D52 interval/version and derived instant in the same immutable tuple.                    |
| [D49 research](./phase-24-d49-current-recipient-cohort-primary-research.md)                                                                                                                                      | Indeterminate releases nobody and may retry same occurrence until a later source/usefulness fence; sealed sets only narrow.                 | D52 supplies that finite terminal fence without guessing zero.                               |
| [D50 research](./phase-24-d50-request-anchored-elapsed-clock-primary-research.md)                                                                                                                                | One exact elapsed duration produces immutable inclusive eligibility; DB time is authoritative and not physical commit time.                 | Reuse elapsed/UTC/precision/trusted-source rules and add an exclusive later instant.         |
| [D51 research](./phase-24-d51-immediate-irreversible-narrowing-primary-research.md) and [adversarial review](./phase-24-d51-immediate-irreversible-narrowing-adversarial-review.md)                              | Separate cancellation epoch; Off/source terminal permanently ends; product release/attempt boundaries preserve history/ambiguity.           | D52 operates only while D51 remains active/current and cannot recall boundary-first effects. |
| [Phase 12](./phase-12-full-role-permission-configuration.md) and [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                                                   | Phase 12 owns policy, request, source heads, occurrence, authorization, decision, audit, and receipt.                                       | Phase 12 owns `useful_for_seconds`, `useful_until`, and terminal no-effect truth.            |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                                                                                               | Tasks Hub projects source work and cannot own source completion/reminders.                                                                  | Task age/due/reminder/retry cannot define or change D52.                                     |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md) and [Phase 17](./phase-17-system-messages-template-management.md)                                                               | Presentation, engagement, end, dispatch, provider outcome, and history have exact independent states.                                       | Release/end/attempt check D52 but never rewrite source/provider history.                     |
| [Identity and Access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                                                                                                              | Identity, Tenant, role, capability, and sensitive operations resolve server-side with RLS in depth.                                         | Caller/provider/executor cannot supply temporal authority or cross Tenant.                   |
| [Workflow Orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                                                                                        | Product records/claims/dispatch ledger/audit are authoritative; Inngest is identifier-only.                                                 | Useful-until and terminal disposition stay product-owned.                                    |
| [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md), [Platform Principles](../../../openspec/specs/platform-principles/spec.md), and [frontend rules](../../../docs/ai/rules/frontend.md) | Sensitive writes are server-side; safety, clarity, accessibility, shared tasks, Base UI/base-maia, and Maia/Zinc consistency are mandatory. | One quiet shared future form, no app-local timer/control or runtime now.                     |

## Current official primary evidence

### IAM and review systems

- [Microsoft Entra access-review creation](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
  configures a finite review duration, sends reminders halfway through the
  review, and warns the scheduled start can be delayed by processing.
- [Microsoft Entra access-review completion](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
  says current review views exist during the instance duration and reviewers
  cannot respond after a stopped review.
- [Okta access-certification campaigns](https://help.okta.com/en-us/Content/Topics/identity-governance/access-certification/campaigns.htm)
  have start date/duration and close at end date or completion, whichever is
  first. [Okta campaign creation](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/create-user-campaign.htm)
  places pending-review reminders relative to campaign close.
- [SailPoint campaign completion](https://documentation.sailpoint.com/saas/help/certs/completing_campaigns.html)
  sends periodic certification reminders only until sign-off, certification
  expiry, or administrator completion.

These sources use formal deadlines and access outcomes that Core explicitly
does not adopt. They still verify the cross-product pattern that reminders and
review actionability live inside a bounded source lifecycle rather than an
executor's indefinite retry horizon.

### Nonprofit, CMS, and e-commerce comparators

- [Blackbaud Grantmaking program settings](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/gc-grant-programs-configure-settings.html)
  anchors draft-application reminders before cycle close and form reminders
  before due dates. Its five/seven-day defaults are product-specific and not
  evidence for D52.
- [Blackbaud program dates](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantsconnect/content/gc-applicants-program-dates.html)
  makes the program close a source boundary for new submissions while leaving
  later review/award work distinct.
- [Contentful scheduled actions](https://www.contentful.com/developers/docs/references/content-management-api/scheduled-actions/)
  uses explicit scheduled/canceled/failed/succeeded states and rejects invalid
  timing/version changes. It demonstrates immutable terminal history, not a
  reminder window.
- [Stripe Checkout Session creation](https://docs.stripe.com/api/checkout/sessions/create)
  permits one finite `expires_at` 30 minutes to 24 hours after creation. That
  product resource, not a retry worker, owns the window.

The product-specific ranges vary by orders of magnitude and by meaning. This is
strong evidence for a finite source model and equally strong evidence against
copying a numeric value.

### Push, execution, and database evidence

- [RFC 8030 §5.2](https://www.rfc-editor.org/rfc/rfc8030.html#section-5.2)
  says delivery after relevance ends is wasteful, requires a TTL, allows the
  service to shorten it, forbids service delivery attempts after it, and makes
  the application account for transit delay.
- [Firebase message lifespan](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan)
  allows zero to 2,419,200 seconds and says an accepted message ID is not device
  delivery.
- [Apple APNs requests](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns)
  supports expiration but calls delivery/expiry best effort and warns a message
  can arrive after the timestamp.
- [Inngest delayed functions](https://www.inngest.com/docs/guides/delayed-functions)
  durably sleeps until a time; [retries](https://www.inngest.com/docs/features/inngest-functions/error-retries/retries)
  use configurable counts/backoff; [timeouts](https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-timeouts)
  limit queued/executing runs. These are distinct execution controls.
- [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html)
  stores `timestamptz` internally as UTC and distinguishes elapsed microseconds/
  days/months; [date/time functions](https://www.postgresql.org/docs/current/functions-datetime.html)
  distinguish transaction-, statement-, and changing wall-clock time.
- [PostgreSQL serialization handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
  requires complete transaction retry; [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes `USING`/`WITH CHECK` and privileged bypass.

These sources support a product-owned absolute fence checked at final mutation,
provider TTL as narrower defense, executor replaceability, and explicit
temporal/authorization proof. None proves an exact D52 value.

## Evidence classification

### Verified repository facts

- No D43–D52 reminder runtime, `useful_for_seconds`, `useful_until`, terminal
  disposition, channel, policy editor, or executor currently ships.
- D50 defines one immutable inclusive eligibility instant, not useful lateness.
- D51 permanently ends Off/source-fenced work and reserves D52 only for an
  otherwise-current occurrence.
- Phase 12, Tasks Hub, presentation, provider dispatch, and Inngest have distinct
  governing owners.

### Verified external facts

- IAM/review systems bound reminders and reviewer action to finite campaigns.
- A nonprofit grantmaking platform anchors reminders to program/form lifecycle.
- Push standards/providers expose finite TTL because delayed delivery can lose
  relevance, but provider acceptance/expiry does not prove device behavior.
- Workflow engines expose durable delay/retry/timeout mechanics that differ from
  business usefulness.
- E-commerce resources can have source-owned expiry independent of workers.

### Requirement inferences

- One cross-surface source `useful_until` must exist before provider TTL;
  otherwise email, in-product, and future channels can disagree.
- `useful_until` must be immutable and pinned with D48/D50 evidence or
  later policy edits/restores can re-age work.
- Every irreversible boundary must compare a fresh trusted database decision
  instant against `useful_until` in the final mutation; wake/preparation time is
  insufficient.
- Logical expiry cannot require a scheduled write, or outages can postpone the
  very boundary meant to contain them.

### Product judgments

- A finite window better balances omission and stale surprise than either
  request-lifetime or exact-instant eligibility.
- The window is fixed elapsed time because D52 makes no civil-time promise.
- D52 gates first in-product release only; current D43 source actionability—not
  usefulness expiry—continues to govern an already released presentation.
- Quiet policy copy is sufficient; a second Tenant control/countdown/status
  would add friction without proved value.

### Assumptions requiring evidence

- Representative authorized ministry staff prefer omission after a bounded
  outage to receiving a stale courtesy reminder.
- A future evidence-backed interval can tolerate ordinary field connectivity,
  small-team staffing, and platform recovery without silently omitting most
  useful reminders.
- “Soon enough”/“late” copy is understood as reminder behavior, not a request
  deadline or staff-performance judgment.

### Unresolved unknowns

- The exact complete numeric pair(s), registry cardinality, and evidence
  admission remain deliberately undecided for D53/evidence work.
- Reminder necessity, cadence values, content, channels, preferences, provider
  adapters, quiet-time behavior, retention, and operational budgets remain
  later gates.
- Representative nonprofit/ministry research and production distributions do
  not yet exist; vendor values cannot substitute.

## Source, state, ownership, race, and failure matrices

### Source and state matrix

| Exact state                                  | Before `not_before`                     | From `not_before` to `useful_until`                | At/after `useful_until`                                                                |
| -------------------------------------------- | --------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| D48 admitted; occurrence waiting             | No seal/release                         | May claim same occurrence under all current proofs | Terminal no-effect `usefulness_expired`; no catch-up                                   |
| D49 `recipient_resolution_indeterminate`     | No release                              | May retry same occurrence only                     | Terminal `usefulness_expired`, never `sealed_proved_zero`                              |
| D49 `sealed_proved_zero`                     | Invalid ordering if before eligibility  | Terminal zero history                              | Remains zero; no relabel/reopen                                                        |
| D49 `sealed_members`, no descendant released | Invalid ordering if before eligibility  | Each member may independently narrow/release       | Unreleased descendants suppress for usefulness expiry; cohort remains                  |
| In-product release committed                 | Invalid ordering if before `not_before` | Release/history valid                              | No new release; current D43 actionability governs active presentation; history remains |
| External `Prepared definitely unsubmitted`   | No admission                            | May attempt-admit only under final proof           | Suppress; no provider I/O                                                              |
| External `Submission may have begun`         | Invalid ordering if before eligibility  | Reconcile exact attempt                            | Reconcile only; no new attempt/retry/fallback; outcome stays exact                     |
| D43 terminal or D51 epoch mismatch           | Blocks at every time                    | Blocks at every time                               | Remains independently terminal/fenced; D52 cannot revive                               |

### Ownership matrix

| Authoritative fact                             | Owner                                              | Permitted consumers                                    | Explicit non-owners                                 |
| ---------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| Usefulness registry choice/version             | Phase 12 code-owned policy registry                | D48 admission, authorized policy summary/audit         | Tenant free text, task, provider, worker            |
| Pinned `useful_for_seconds` and `useful_until` | Phase 12 D43/D48/D50 source tuple                  | D49/effect claims, authorized audit                    | current policy lookup, task date, channel TTL       |
| Useful/no-longer-useful source disposition     | Phase 12 occurrence                                | Access requests read model, downstream end/suppression | sweeper, Inngest, provider, notification engagement |
| D49 recipient seal/attempts                    | Phase 12 occurrence                                | registered descendants                                 | D52 worker, task, provider                          |
| In-product release/end/history                 | ADR-0027 / Phase 17 under Phase 12 fence           | authorized staff surfaces                              | D52 policy row, task, provider                      |
| External attempt/outcome/TTL evidence          | Phase 6/17 product dispatch plus provider evidence | operations/audit                                       | `useful_until` owner, executor run, webhook alone   |
| D43 request/D44 task/access                    | Phase 12/D44 and ADR-0183                          | Access requests/Tasks Hub                              | usefulness expiry, provider, engagement             |
| Wake/retry/reconciliation                      | Replaceable executor                               | identifier-only product claims                         | temporal authority, terminality, uniqueness         |

### Temporal and source-fence order matrix

| Boundary            | Inclusive/exclusive rule    | If it wins first                                       | If effect boundary wins first                                |
| ------------------- | --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| D50 eligibility     | Inclusive not-before        | Same occurrence may begin source proof                 | Effect before eligibility is invalid/quarantined             |
| D52 `useful_until`  | Exclusive not-after         | Unreleased work terminally no-effects                  | Exact released/admitted effect remains history/reconciles    |
| D51 Off epoch       | Immediate source fence      | Permanently cancels lower-epoch work regardless of D52 | D51 boundary-first rules preserve effect history             |
| D43 terminal source | Current-actionability fence | Prevents optional effect regardless of time            | Earlier effect history remains; current link resolves safely |
| D49 terminal seal   | Source cohort/zero boundary | Sealed result remains; descendants still check D52     | Not applicable; no descendant can create seal                |

### Race matrix

| Race                                                               | Required outcome                                                                                                                                                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Worker wakes before `useful_until` but waits on a lock until after | Final database decision instant is sampled after waits; claim expires rather than using wake/transaction-start time                                                                                  |
| D49 indeterminate retry versus `useful_until`                      | Decision instant before fence may terminally seal; at/after fence records/returns `usefulness_expired`                                                                                               |
| D49 seal versus D43 terminal/Off                                   | Existing source serialization chooses one result; D52 cannot override D43/D51                                                                                                                        |
| `useful_until` versus in-product release                           | Decision instant before ceiling may release once; at/after it cannot first-release; it does not end an earlier item                                                                                  |
| `useful_until` versus external attempt admission                   | Admission before the ceiling authorizes only the same critical section's bounded immediate initial call; at/after the ceiling no new admission occurs and prepared work stays definitely unsubmitted |
| Boundary transaction rolls back                                    | No decision instant/effect/terminal receipt exists; retry rechecks current database time/fences                                                                                                      |
| Non-Off edit/re-enable versus old tuple                            | Old interval/instant remains immutable; prospective policy cannot extend/reopen it                                                                                                                   |
| Restore/replay after `useful_until`                                | Same occurrence resolves terminally expired; no recompute, second occurrence, or provider call                                                                                                       |
| Provider response after `useful_until`                             | Updates exact admitted attempt outcome only; no retry or source reinterpretation                                                                                                                     |
| Attempt admission before `useful_until`; first network byte after  | Allowed only inside the same bounded pre-I/O critical section with envelope already prepared/decrypted; no handoff/restart/second admission/rekey/retry/fallback                                     |
| Two expiry materializers                                           | Semantic idempotency returns one terminal disposition/receipt, never duplicate history                                                                                                               |

### Failure matrix

| Failure                                                               | Safe result                                                                                           | Diagnosis/recovery                                                                       |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Inngest sleep/event lost                                              | Indexed product recovery finds due/current work; after `useful_until` it closes/no-ops                | Product ledger/source query, not Inngest history alone                                   |
| Executor wakes late                                                   | No irreversible boundary; terminal expiry if otherwise current                                        | Record decision instant/fences; no catch-up                                              |
| D49 dependency remains unavailable                                    | Indeterminate until earlier source fence or `useful_until`; then terminal expiry                      | Immutable attempts and bounded retry/reconciliation                                      |
| Database serialization/lock conflict                                  | Whole command retries with fresh authorization/time or returns typed conflict                         | Trace lock/attempt; never reuse old decision instant                                     |
| Source write succeeds, executor handoff fails                         | Source tuple/fence remains; outbox/recovery may retry only within window                              | Durable outbox/claim and idempotent repair                                               |
| Attempt admitted before `useful_until`, call starts/finishes later    | Dispatch/outcome remain exact and later reconcile                                                     | Stable attempt/idempotency/provider evidence; no recall promise or additional I/O        |
| Process stalls/restarts after attempt admission but before proved I/O | Do not resume/send; preserve `Submission may have begun` and `Indeterminate`; reconcile evidence only | Fence-to-I/O trace, process/run identity, stable attempt receipt                         |
| Provider expiry ignored/best-effort                                   | Late delivery can occur but cannot create new Core attempt/history                                    | Provider metrics/evidence; copy and audit remain truthful                                |
| Terminal receipt materialization delayed                              | Logical source expiry still blocks all reads/mutations                                                | Bounded indexed reconciler; lag monitor; no correctness incident unless boundary crosses |
| Invalid/overflowed interval at D43 creation                           | Valid request commits with typed cadence safe non-admission                                           | Minimized operations evidence; registry/config repair, no backfill                       |
| Mixed-version writer ignores D52                                      | Activation forbidden; authoritative mutation boundary/version gate denies                             | Kill switch, deployment rollback before writes, roll-forward after source facts          |

## Best UX and UI contract

### No surface now

D52 authorizes no setting, field, countdown, date, badge, alert, task status,
notification, report column, provider status, telemetry, or placeholder.

### Future policy manager journey

If the complete reminder later activates, usefulness stays inside the existing
route-addressable **People & access → Access requests → Settings** Base Maia
cadence form. It is not another toggle or advanced panel. Until D53/value
evidence proves otherwise, the administrator selects only a finite cadence
choice and sees one quiet helper under Timing:

> If Asym cannot create the reminder soon enough, it skips it instead of
> creating it late.

Changing cadence retains D51's prospective copy:

> Applies only to new access review requests. Existing reminder timing does not
> change.

No UI calls `useful_until` Due, Deadline, Expires, Overdue, Grace
period, SLA, Escalation, or Failure. No exact date/countdown/urgency color is
shown on request/task/reminder rows. The policy editor never previews current
request counts or promises that a provider-admitted reminder cannot arrive
later.

### Coordinator, requester, audit, and failure journeys

- Coordinators keep the same Access requests lane and source-backed task. A
  skipped courtesy reminder creates no message, badge, assignment change, or
  explanation they must clear.
- Requesters and holders see no timing/usefulness/provider state. Their request,
  access, and current source outcome remain unchanged.
- A reminder released in time remains active only under current D43 source
  actionability. Crossing `useful_until` alone does not end it, clear unread
  attention, or fabricate read/dismissal.
- A provider-admitted reminder can arrive later. Its authenticated link resolves
  current authorization/source truth and may show that work ended/unavailable.
- Purpose-authorized audit may say **Reminder not created — usefulness window
  ended**, show the exact immutable instants/disposition, and distinguish it
  from zero recipients, Off, source terminality, provider rejection, or failure.
- Operations failure UI gives a durable safe retry/recovery action for system
  repair; ordinary staff never see executor/provider jargon or a “missed SLA.”

### Accessibility, localization, mobile, and field conditions

Future UX uses shared `@asym/ui` Base UI/base-maia primitives and Maia/Zinc
tokens; semantic labels/descriptions/errors/status; predictable explicit
submission; visible focus; keyboard/screen-reader order; non-color meaning;
forced colors; target-size compliance; reduced motion; 320 CSS-pixel/400-percent
reflow; RTL/CJK/translation expansion; locale-independent source instants;
mobile touch; and low-bandwidth receipt recovery. No timer animation or live
countdown creates cognitive load or continual announcements.

## Problem validity and strongest alternatives

The root problem is real if the optional reminder later ships: reliable
execution can be delayed, and “still pending” does not prove a courtesy nudge is
still useful. The decision belongs at the Phase 12 source occurrence because it
must govern D49, in-product release, email, push, chat, and future channels
consistently. A worker timeout or provider TTL cannot cover all surfaces.

The strongest alternative is **remain useful while D43 stays pending**. It
requires no extra instant and maximizes the chance of eventually creating the
reminder. It also makes an outage of any duration silently acceptable, permits
large stale catch-up bursts, and gives a months-old reminder the same meaning as
one created near eligibility. Current evidence does not justify that surprise.

The other strong alternative is **candidate-only exact execution**. It needs no
late window and guarantees no stale release. It makes lock waits, normal queue
jitter, deploys, and brief dependency outages user-visible omissions and
misrepresents D50's not-before instant as an appointment. No current platform
can guarantee that precision end to end.

Provider TTL is not a complete alternative: in-product and email may lack the
same enforcement, APNs is best effort, and TTL begins after product handoff.
Retry counts/timeouts are transport configuration and can change without a
product decision. No-build remains the baseline for the reminder feature until
all release evidence exists, but it does not resolve the lifecycle if activated.

## Ruthless adversarial category review

Every requested category contains a material concern under an unqualified
“finite window” statement. For every row, the concern narrows Option 1 and
requires the stated amendment; it does not invalidate the corrected model.

| Category                                                      | Material concern | What could go wrong and why it matters                                                                                                                                     | Severity / likelihood                         | Evidence and effect on answer                                                                                                                                  | Permanent prevention and exact language to record                                                                                                                         |
| ------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | **Yes**          | A window can optimize a reminder that never earns activation, or solve executor delay rather than stale user attention.                                                    | High / Medium                                 | D46/D47 keep necessity unproved; RFC/IAM/nonprofit evidence validates bounded relevance only if the effect exists. Narrows to docs-only conditional semantics. | **“D52 selects lifecycle only; no runtime/value ships until reminder value and representative omission-versus-staleness evidence pass.”**                                 |
| Brittleness                                                   | **Yes**          | Worker wake/transaction-start/provider time, an exact-instant rule, or a scheduled expiry write fails under locks, outages, restore, and skew.                             | Critical / High                               | PostgreSQL time functions and executor behavior prove these clocks differ.                                                                                     | **“Derive immutable `useful_until` once; sample trusted final decision time in each atomic boundary; logical expiry needs no scheduled write.”**                          |
| Technical debt                                                | **Yes**          | Per-channel TTL, retry counts, duplicate stale flags, or current-policy recompute create divergent lifetime authorities.                                                   | High / High                                   | Phase 12/17 and provider docs define separate domains.                                                                                                         | **“One source instant governs every first effect; channels only narrow; no shadow expiry state or source-name conditional.”**                                             |
| Edge cases                                                    | **Yes**          | Exact fence equality, indeterminate D49, partial member release, rollback, late provider outcomes, policy edit, Off, source terminality, and restore can disagree.         | Critical / High                               | D49–D51 expose each realistic state.                                                                                                                           | **“Use half-open [`not_before`, `useful_until`), canonical states, and all source/race/failure matrices without inferred resurrection.”**                                 |
| Footguns                                                      | **Yes**          | Tenant free-form values, due/overdue labels, support extensions, backdating, replay, or provider defaults can widen stale work.                                            | High / Medium-high                            | Vendor ranges differ and Core has no due promise.                                                                                                              | **“Code-owned finite registry only; no override/extension/backdate/countdown/Undo/replay; caller cannot supply temporal facts.”**                                         |
| Tenant safety                                                 | **Yes**          | Cross-Tenant interval/head/cache/event/claim can close or release another Tenant's sensitive reminder.                                                                     | Critical / Medium                             | Identity OpenSpec/ADR-0184 demand same-Tenant depth.                                                                                                           | **“Every registry, tuple, occurrence, member, effect, receipt, query, cache, event, and lock binds exact non-null Tenant/environment.”**                                  |
| Database, RLS, and authorization safety                       | **Yes**          | Null/invalid instants, cross-Tenant FK, mutable expiry, `USING` without `WITH CHECK`, or service-role bypass defeats the fence.                                            | Critical / High if convention-only            | PostgreSQL and Core contracts require constraints and privileged parity.                                                                                       | **“Checked order/range/state constraints, same-Tenant composites, immutability, least grants, app auth, `USING`/`WITH CHECK`, and owner/service/worker/support parity.”** |
| Overengineering                                               | **Yes**          | Calendar/holiday engine, generic scheduler, tenant workflow builder, per-channel lifetime DSL, sweeper dependency, or separate UI control exceeds one courtesy occurrence. | High / High if enterprise patterns are copied | D50 fixed elapsed time; product evidence varies.                                                                                                               | **“One fixed elapsed interval/instant and existing claim boundaries only; no calendar, generic workflow, provider abstraction, or implementation now.”**                  |
| UX/UI and user friction                                       | **Yes**          | A countdown, “expired/overdue” badge, extra setting, failure notice, or date implies deadline/blame; hidden stale behavior undermines trust.                               | High / High                                   | Core UX rules/WCAG and courtesy semantics require quiet clarity.                                                                                               | **“Show only exact skip-instead-of-late helper after activation; no date/countdown/urgency/status/control/current-work preview.”**                                        |
| Source of truth, ownership, and domain invariants             | **Yes**          | Task, Inngest, notification item, provider TTL, current policy, or analytics can become temporal authority and rewrite history.                                            | Critical / High                               | ADRs 0183/0027/0184 and Workflow OpenSpec define owners.                                                                                                       | **“Phase 12 owns interval/instant/disposition; Phase 17/6 own effect history; Tasks Hub/executor/provider own none.”**                                                    |
| Hidden coupling                                               | **Yes**          | Window may couple to task due dates, D44 assignments, channel quiet time, provider max TTL, Inngest plan/history, or Tenant timezone.                                      | High / High                                   | Those owners/semantics change independently.                                                                                                                   | **“D52 uses only pinned source evidence and primary DB time; downstream/provider/executor settings may only narrow execution.”**                                          |
| Failure modes                                                 | **Yes**          | Lost event, late wake, indeterminate proof, failed terminal materialization, ambiguous provider response, or source/outbox split can create catch-up or missing evidence.  | Critical / High                               | Inngest/AWS/provider behavior makes failures expected.                                                                                                         | **“Source predicate blocks independently; transactional intent/receipt, semantic idempotency, bounded reconciliation, and no blind retry.”**                              |
| Lifecycle, temporal correctness, concurrency, and idempotency | **Yes**          | Two valid claims around `useful_until` can jointly release twice; stale transaction time can cross the fence; edit/restore can reopen.                                     | Critical / High                               | PostgreSQL whole-command retry and D47 one occurrence require exact rules.                                                                                     | **“Inclusive `not_before`/exclusive `useful_until`; final sampled DB instant; atomic claim; immutable tuple; terminal no-revival; one semantic identity.”**               |
| Data integrity risks                                          | **Yes**          | Overflow, precision loss, invalid ordering, duplicate terminal/effect rows, `proved_zero` collapse, destructive delete, or backfill corrupts history.                      | Critical / Medium-high                        | D49/D50 state/precision distinctions are governing.                                                                                                            | **“Safe non-admission on invalid arithmetic; exact precision; closed dispositions; append-only evidence; restrictive deletion; no inferred backfill.”**                   |
| Security and privacy risks                                    | **Yes**          | Per-request expiry, recipient data, reasons, provider details, logs/exports, or support tools can reveal sensitive access/ministry relationships.                          | Critical / Medium                             | D43 provenance/reason and D44 recipients are purpose protected.                                                                                                | **“Ordinary UI exposes no per-request timing/delivery; identifier-only execution; purpose-minimized audit/export; secrets never browser/log/event.”**                     |
| Scalability and performance risks                             | **Yes**          | A timer/write per request at `useful_until`, backlog scans, hot locks, or catch-up bursts degrade large Tenants.                                                           | High / High at scale                          | Logical predicate and indexed claims avoid cardinality-coupled scheduling.                                                                                     | **“No exact-time write; indexed keyset reconciliation; constant-time claim; load-test ratified budgets and largest-supported Tenant.”**                                   |
| Operational burden                                            | **Yes**          | Support may extend windows, replay expired work, direct-edit state, or manually reconcile channels; hidden old runs create tribal knowledge.                               | High / Medium-high                            | Executor/provider state is independent of source.                                                                                                              | **“No extension/reopen; authorized diagnostics, canonical receipt, roll-forward repair, adapter runbooks, and safe terminal replay.”**                                    |
| Observability and auditability gaps                           | **Yes**          | Logs may show a late worker “success” without proving boundary time, or conflate expiry, zero, Off, source end, rejection, and failure.                                    | Critical / High                               | Durable business history differs from traces.                                                                                                                  | **“Retain exact `not_before`/`useful_until`/decision/fence/disposition/effect evidence and wire named monitors below.”**                                                  |
| Dependency and integration risks                              | **Yes**          | Provider TTL limits/defaults, best-effort late arrival, webhook duplication, Inngest limits, SDK changes, and rate limits can change behavior.                             | High / High over time                         | APNs/FCM/Inngest explicitly expose these differences.                                                                                                          | **“Provider/executor are replaceable adapters; source window is permanent; channel TTL no later than source and disagreements never widen.”**                             |
| Migration, rollout, and upgrade risks                         | **Yes**          | Old workers ignore D52; backfill invents eligibility; mixed schema drops evidence; rollback reopens expired work.                                                          | Critical / High without staging               | No runtime exists, so inferred historical migration is unjustified.                                                                                            | **“Deploy additive evidence and fence-aware mutations first; activate writers last; no historical inference; preserve source instants on restore/rollback.”**             |
| Testability, traceability, and proof                          | **Yes**          | “Soon enough,” “late,” “useful,” and “at expiry” are unfalsifiable without exact interval semantics and production races.                                                  | Critical / High                               | Existing question intentionally omitted a numeric value but requires exact model.                                                                              | **“Prove all 60 D52 acceptance criteria and trace terms/owners/states from answer through release evidence.”**                                                            |
| Other development hazards                                     | **Yes**          | Teams may smuggle in a numeric default, treat expiry as failure, notify recipients, use physical commit claims, or let a provider-admitted effect imply timely delivery.   | High / Medium-high                            | Cross-product values vary and D51 preserves provider ambiguity.                                                                                                | **“No numeric/value/UI/runtime now; expiry is terminal no-effect, not failure; no message; no physical-commit/delivery guarantee.”**                                      |

## Final disposition and corrected decision to record

**Disposition: Accept with required amendments.** Record this concise decision:

> **D52 — Bounded source usefulness.** Every future admitted cadence tuple pins
> exact versioned code-owned `wait_for_seconds`, strictly positive finite fixed-
> elapsed `useful_for_seconds`, and immutable exclusive
> `useful_until = not_before + useful_for_seconds`. The occurrence is useful
> only in the half-open interval [`not_before`, `useful_until`),
> and only while D43, D44, D49, authorization, and D51 active-epoch proofs pass.
>
> Each D49 seal, in-product release, and external submission-attempt admission
> samples one fresh trusted primary-database decision instant in its final
> atomic mutation. At/after `useful_until`, indeterminate/unsealed work becomes
> terminal no-effect `usefulness_expired`, and sealed-but-unreleased descendants
> are suppressed without catch-up, substitution, replay, or notification.
> Earlier release/admission remains truthful history. One initial provider call
> admitted in time may start later only as the same prepared/decrypted adapter
> critical section's immediate bounded continuation; a stalled/restarted process
> cannot resume it. External dispatch/outcome reconciles under D51 and an effect
> can still arrive. No later admission/retry/rekey/resend/fallback is permitted.
> Provider TTL may only narrow.
>
> D52 sets no due date, SLA, numeric duration, Tenant free-form control,
> provider/executor timeout, or current-work migration. It changes no request,
> task, access, responsibility, or decision and creates no runtime artifact now.

## Ruthless synthesis and order of work

### Must be resolved before recording D52

1. Make the interval fixed elapsed, strictly positive, registry-owned, pinned,
   and resolved once to exclusive `useful_until`.
2. Define one final trusted database usefulness decision instant and reject
   wake/transaction-start/provider/device time.
3. Define `usefulness_expired` as terminal no-effect distinct from D49 zero,
   D51 cancellation, source terminality, provider rejection, and failure.
4. State exactly how earlier in-product/external boundaries preserve history and
   how provider TTL can only narrow.
5. Preserve no-runtime/no-number scope and quiet no-countdown UX.

### Requirements for later glossary, ADR, OpenSpec, and design

1. Canonical `wait_for_seconds`, `useful_for_seconds`, `not_before`,
   `useful_until`, decision-instant, and expired-disposition
   definitions plus half-open temporal predicate.
2. Registry/admission pinning, checked arithmetic, final-boundary time sampling,
   source fence conjunction, state machines, same-Tenant constraints, receipts,
   and terminal materialization.
3. ADR-0027 in-product release gating and continuing D43-actionability behavior,
   plus Phase 17/6 channel TTL/outcome integration without fake read, recall,
   or delivery claims.
4. Authorization/RLS/privileged parity, retention, repair, identifier-only
   events, exact copy, accessibility, and no current-work migration.
5. Traceability through all 120 research assertions and 60 acceptance criteria
   into implementation tickets, tests, and release evidence.

### Implementation safeguards before any activation

1. Put the current-time/`useful_until` predicate inside every authoritative
   seal/release/attempt mutation after waits and locks.
2. Keep source arithmetic/evidence atomic with D43 admission; use product
   uniqueness/receipts/outbox and idempotent bounded reconciliation.
3. Deploy all D52-aware mutation paths before any cadence writer/UI/channel;
   retain a narrowing kill switch and roll-forward recovery.
4. Prove authorization, Tenant isolation, state constraints, exact equality,
   long-lock behavior, restore, late wake, partial cohort, provider ambiguity,
   accessibility, localization, low bandwidth, and production scale.
5. Ratify D53/value evidence before adding registry values or user-visible copy.

### Named production monitors

Monitoring is defense in depth and creates no telemetry artifact now. Signals
bind exact Tenant/environment/occurrence/effect identifiers and exclude
protected content.

| Signal                                             | Threshold                                                                                                                        | Owner                        | Required response                                                                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `d52_post_useful_until_d49_seal_total`             | **> 0 ever**                                                                                                                     | Phase 12 on-call             | Disable all reminder effects, preserve/quarantine occurrence evidence, open Critical incident, and repair final claim predicate.                |
| `d52_post_useful_until_presentation_release_total` | **> 0 ever**                                                                                                                     | Phase 17 + Phase 12          | Activate narrowing kill switch, quarantine effects, assess exposure, and correct release boundary before resume.                                |
| `d52_post_useful_until_submission_admission_total` | **> 0 ever**                                                                                                                     | Delivery Platform + Phase 12 | Stop adapter admission, reconcile exact attempts without recall message, open Critical incident, and fix boundary.                              |
| `d52_useful_until_recomputed_or_extended_total`    | **> 0 ever**                                                                                                                     | Phase 12 owner               | Halt writers/claims, restore immutable tuple, advance by roll-forward only, and audit every affected occurrence.                                |
| `d52_expired_occurrence_resurrected_total`         | **> 0 ever**                                                                                                                     | Phase 12 owner               | Disable replay/recovery path, quarantine duplicate risk, and repair terminal-state enforcement.                                                 |
| `d52_invalid_temporal_tuple_total`                 | **> 0 committed admitted tuple**                                                                                                 | Database/Identity owner      | Block activation or writes, safe-non-admit affected creation, and repair registry/arithmetic/constraints.                                       |
| `d52_boundary_decision_to_commit_ms`               | **> 5,000 ms for any effect admission or p99 > 1,000 ms for 15 minutes**                                                         | Database Platform            | Page owner, stop affected admission path if single 5-second breach can cross window materially, and remove lock/transaction work before resume. |
| `d52_expiry_materialization_lag`                   | **> 15 minutes for three consecutive 5-minute samples**                                                                          | Workflow Operations          | Repair indexed reconciler while logical fence remains active; page Phase 12 if growth continues 15 more minutes.                                |
| `d52_late_wake_rate`                               | **> 1% of due occurrences waking at/after `useful_until` for 15 minutes**                                                        | Workflow Operations          | Investigate capacity/dependency, pause admission if systemic, and never widen/replay expired work.                                              |
| `d52_attempt_fence_to_io_ms`                       | **> the adapter's ratified numeric `fence_to_io_max_ms`, or any release with no registered bound**                               | Delivery Platform            | Disable adapter admission, preserve ambiguous attempts without retry, remove intervening waits/handoffs, and re-certify the critical section.   |
| `d52_provider_ttl_exceeds_source_total`            | **> 0 ever** for a TTL-capable adapter                                                                                           | Delivery Platform            | Disable adapter, reconcile admitted effects, fix conservative conversion/rounding, and re-certify channel.                                      |
| `d52_cross_tenant_or_wrong_purpose_escape_total`   | **> 0 ever**                                                                                                                     | Security + Identity          | Disable path, open Critical isolation incident, preserve evidence, assess exposure, and remediate all privilege paths.                          |
| `d52_copy_comprehension_release_gate`              | **< 90% of representative authorized staff distinguish reminder skipping from request/task/access deadline, failure, or change** | Product Research + Design    | Do not activate UX; revise/test copy across mobile, assistive-tech, localization, and low-bandwidth cohorts.                                    |

The 5-second/1-second transaction, 15-minute materialization, and 1% late-wake
thresholds are provisional future operational judgments, not usefulness values
or delivery promises. They require re-ratification against production evidence;
zero-tolerance correctness/security thresholds are permanent.

## Research assertions

### Repository and governing-contract facts

- **D52-RA001 — Repository fact:** no D43–D52 cadence reminder runtime, source
  occurrence, `useful_for_seconds`/`useful_until`, provider adapter, or policy UI
  ships.
- **D52-RA002 — Repository fact:** D47 allows at most one optional courtesy
  occurrence and gives it no due, overdue, SLA, or access consequence.
- **D52-RA003 — Repository fact:** D48 admission occurs only at genuine D43
  creation and pins exact source policy evidence.
- **D52-RA004 — Repository fact:** D48 invalid optional proof safely non-admits
  cadence without stranding the valid request.
- **D52-RA005 — Repository fact:** D49 has one occurrence with exact
  `sealed_members`, `sealed_proved_zero`, or
  `recipient_resolution_indeterminate` semantics.
- **D52-RA006 — Repository fact:** an indeterminate D49 attempt releases nobody
  and retries only the same occurrence until a later fence.
- **D52-RA007 — Repository fact:** D49 sealed membership is immutable and every
  downstream effect may only narrow.
- **D52-RA008 — Repository fact:** D50 retains immutable source-created and
  eligibility instants plus exact elapsed duration evidence.
- **D52-RA009 — Repository fact:** D50 eligibility is inclusive not-before and
  explicitly does not decide useful lateness.
- **D52-RA010 — Repository fact:** D50 uses primary product-database time and
  rejects browser/worker/provider clocks as authority.
- **D52-RA011 — Repository fact:** D51 pins a separate cancellation epoch and
  makes Off/source-terminal work permanently no-release.
- **D52-RA012 — Repository fact:** D51 non-Off edits and re-enable are prospective
  and cannot rebase or revive an admitted tuple.
- **D52-RA013 — Repository fact:** D51 in-product irreversibility is an atomic
  queryable presentation release commit, not human read.
- **D52-RA014 — Repository fact:** D51 external irreversibility is product
  submission-attempt admission before provider I/O.
- **D52-RA015 — Repository fact:** D51 preserves dispatch `Unprepared`,
  `Prepared definitely unsubmitted`, or `Submission may have begun` independently
  from provider outcome `None`, `Accepted`, `Definitely rejected`, or
  `Indeterminate`.
- **D52-RA016 — Repository fact:** Phase 12 owns request, policy, source heads,
  occurrence, authorization, audit, and semantic receipt.
- **D52-RA017 — Repository fact:** ADR-0183 keeps source work authoritative over
  Tasks Hub projection and task engagement.
- **D52-RA018 — Repository fact:** ADR-0027/Phase 17 own presentation,
  engagement/end, dispatch, provider outcome, and history.
- **D52-RA019 — Repository fact:** Identity/Workflow OpenSpec require server-
  resolved Tenant/authorization and product-owned claims/ledger over Inngest.
- **D52-RA020 — Repository fact:** Core frontend rules require shared Base UI/
  base-maia, Maia/Zinc tokens, accessibility, and server-owned privileged writes.

### Verified external facts

- **D52-RA021 — Verified external fact:** Entra access reviews configure a
  finite duration for reviewer input.
- **D52-RA022 — Verified external fact:** Entra sends its standard review
  reminder halfway through the finite review period.
- **D52-RA023 — Verified external fact:** Entra warns a configured review start
  can be delayed by system processing.
- **D52-RA024 — Verified external fact:** Entra reviewer input ends when the
  review stops/ends; later application of access outcome is distinct.
- **D52-RA025 — Verified external fact:** Okta campaigns specify a start date and
  duration.
- **D52-RA026 — Verified external fact:** Okta closes a campaign on its end date
  or when all reviewers complete, whichever comes first.
- **D52-RA027 — Verified external fact:** Okta places pending-review reminders
  relative to campaign close and supports channel-specific Slack only when
  separately enabled.
- **D52-RA028 — Verified external fact:** SailPoint certification campaigns have
  a deadline and reminders cease on sign-off, expiry, or completion.
- **D52-RA029 — Verified external fact:** Blackbaud Grantmaking anchors draft
  reminders before a program cycle close.
- **D52-RA030 — Verified external fact:** Blackbaud anchors form reminders to a
  form due date and its public defaults differ from other products.
- **D52-RA031 — Verified external fact:** Blackbaud program close prevents new
  application submission while leaving review/award processes distinct.
- **D52-RA032 — Verified external fact:** Contentful scheduled actions use
  explicit scheduled/canceled/failed/succeeded states.
- **D52-RA033 — Verified external fact:** Contentful rejects invalid timing and
  stale version changes instead of silently rewriting completed work.
- **D52-RA034 — Verified external fact:** Stripe Checkout Session `expires_at`
  is a product-resource fact constrained 30 minutes to 24 hours after creation.
- **D52-RA035 — Verified external fact:** RFC 8030 says some push messages are
  useless after a period and late delivery is wasteful.
- **D52-RA036 — Verified external fact:** RFC 8030 requires application-server
  TTL, permits a service to shorten it, and forbids service attempts after it.
- **D52-RA037 — Verified external fact:** RFC 8030 makes the application account
  for transit delay when choosing TTL.
- **D52-RA038 — Verified external fact:** Firebase accepts zero-to-2,419,200-
  second message lifespan values.
- **D52-RA039 — Verified external fact:** Firebase says an accepted message ID
  does not mean the device received the message.
- **D52-RA040 — Verified external fact:** Firebase can store messages and later
  deliver them unless configured lifespan expires.
- **D52-RA041 — Verified external fact:** APNs supports an expiration timestamp
  for stored notification attempts.
- **D52-RA042 — Verified external fact:** APNs calls expiry/delivery best effort
  and says a notification may arrive after expiration.
- **D52-RA043 — Verified external fact:** Inngest can durably sleep until an
  absolute time across restarts/deploys.
- **D52-RA044 — Verified external fact:** Inngest retry counts/backoff are
  configurable execution behavior.
- **D52-RA045 — Verified external fact:** Inngest start/finish timeouts govern
  queued/executing runs, not source usefulness.
- **D52-RA046 — Verified external fact:** PostgreSQL `timestamptz` stores an
  instant internally in UTC and output timezone is presentation.
- **D52-RA047 — Verified external fact:** PostgreSQL intervals preserve separate
  month/day/microsecond fields and a civil day can differ across DST.
- **D52-RA048 — Verified external fact:** PostgreSQL transaction-, statement-,
  and wall-clock current-time functions have different semantics.
- **D52-RA049 — Verified external fact:** PostgreSQL serializable failure
  requires application retry of the complete transaction logic.
- **D52-RA050 — Verified external fact:** PostgreSQL RLS separates `USING` and
  `WITH CHECK` and privileged roles may bypass ordinary policy.

### Corrected temporal and lifecycle assertions

- **D52-RA051 — Product judgment:** a finite window best balances normal delay
  tolerance against stale catch-up.
- **D52-RA052 — Product judgment:** request-lifetime eligibility is rejected
  because request age can be unbounded and is not reminder relevance evidence.
- **D52-RA053 — Product judgment:** exact-instant execution is rejected because
  D50 is not an appointment and infrastructure cannot guarantee punctuality.
- **D52-RA054 — Requirement inference:** provider TTL cannot be the source
  window because it excludes in-product/email/pre-handoff work.
- **D52-RA055 — Requirement inference:** executor retries/timeouts cannot be the
  source window because they are replaceable operational configuration.
- **D52-RA056 — Requirement inference:** the interval is strictly positive,
  finite, versioned, and admitted from a closed code-owned registry.
- **D52-RA057 — Scope boundary:** D52 chooses no numeric interval or registry
  mapping; those need D53 and representative evidence.
- **D52-RA058 — Requirement inference:** D43 source creation pins the exact
  interval/version with D48/D50 evidence.
- **D52-RA059 — Requirement inference:** `useful_until` is derived exactly once
  as `not_before + useful_for_seconds`.
- **D52-RA060 — Requirement inference:** invalid/overflowed arithmetic produces
  cadence safe non-admission, not an invalid tuple or failed D43 request.

### Boundary, authorization, UX, and operational assertions

- **D52-RA061 — Requirement inference:** `useful_until` is immutable, finite,
  UTC-normalized, precision-preserving, and strictly after eligibility.
- **D52-RA062 — Product judgment:** D52 uses fixed elapsed seconds and creates no
  timezone, calendar, weekend, holiday, or business-day promise.
- **D52-RA063 — Requirement inference:** usefulness is half-open—eligibility is
  inclusive and `useful_until` is exclusive.
- **D52-RA064 — Requirement inference:** exact equality with `useful_until` cannot
  seal, release, or attempt-admit.
- **D52-RA065 — Requirement inference:** every D49/effect boundary samples one
  fresh trusted primary-database decision instant at final guarded mutation.
- **D52-RA066 — Requirement inference:** worker wake, HTTP arrival, transaction
  start, browser, replica, provider, and device time cannot prove usefulness.
- **D52-RA067 — Requirement inference:** the decision instant is retained only
  when the boundary transaction commits and is not called physical commit time.
- **D52-RA068 — Requirement inference:** time sampling occurs after lock waits/
  current proofs and before no network I/O, preventing stale early samples.
- **D52-RA069 — Requirement inference:** D49 indeterminate may retry the same
  occurrence only before `useful_until` and while every source fence passes.
- **D52-RA070 — Requirement inference:** at/after `useful_until`, unresolved work
  becomes terminal source no-effect `usefulness_expired`.
- **D52-RA071 — Requirement inference:** usefulness expiry is not D49 proved
  zero, D51 cancellation, request completion, provider rejection, or failure.
- **D52-RA072 — Requirement inference:** logical expiry is effective at the
  immutable instant and needs no scheduled write/sweeper for correctness.
- **D52-RA073 — Requirement inference:** a sealed cohort remains history and
  each unreleased descendant closes independently at `useful_until`.
- **D52-RA074 — Requirement inference:** one timely member effect does not widen
  another member's window or create fallback/substitution.
- **D52-RA075 — Requirement inference:** D43 source terminality and D51 epoch
  mismatch always prevent release independently of D52.
- **D52-RA076 — Requirement inference:** policy edit/re-enable cannot extend,
  recompute, reopen, or mint another occurrence for an existing tuple.
- **D52-RA077 — Requirement inference:** in-product release before `useful_until`
  remains truthful history after usefulness ends.
- **D52-RA078 — Requirement inference:** D52 does not end an earlier released
  item; current D43 source actionability remains ADR-0027 presentation truth.
- **D52-RA079 — Requirement inference:** preparation/wake/dequeue before the
  fence does not reserve timeliness; only release/attempt admission does.
- **D52-RA080 — Requirement inference:** after envelope preparation/decryption,
  external attempt admission commits strictly before `useful_until` or no
  provider call may begin.
- **D52-RA081 — Requirement inference:** the one initial call may start later
  only as the same critical section's immediate continuation within the
  adapter's ratified fence-to-I/O bound; it may complete/arrive later.
- **D52-RA082 — Requirement inference:** a stall/process handoff/restart cannot
  resume an admitted call; it preserves `Submission may have begun`/
  `Indeterminate` and performs no new admission/follow-up/retry/rekey/resend/
  fallback/substitution/additional I/O.
- **D52-RA083 — Requirement inference:** provider TTL/expiry, when available,
  is conservatively no later than source `useful_until` and can only narrow.
- **D52-RA084 — Requirement inference:** provider best-effort late arrival does
  not alter source correctness or justify recall/non-arrival copy.
- **D52-RA085 — Requirement inference:** provider pre-scheduling before source/
  recipient/temporal proof is forbidden for this courtesy occurrence.
- **D52-RA086 — Requirement inference:** Inngest sleep/timeout/retry/cancel/
  replay/history owns no source temporal or terminal fact.
- **D52-RA087 — Requirement inference:** indexed recovery may materialize expiry
  later but cannot release, reopen, or be required for claim denial.
- **D52-RA088 — Requirement inference:** D52 changes no request, access, grant,
  EffectiveAccess, decision, D44 responsibility, task, or initial attention.
- **D52-RA089 — Product judgment:** usefulness expiry emits no task,
  notification, email, push, chat, digest, escalation, or failure message.
- **D52-RA090 — Requirement inference:** human registry/policy writes and
  automatic claims use separate registered purpose-bound server authorization.
- **D52-RA091 — Requirement inference:** server context derives Tenant, actor/
  purpose, heads, duration, instants, source/effect IDs, and audit attribution.
- **D52-RA092 — Requirement inference:** caller/provider/executor cannot supply,
  retarget, extend, backdate, or round-trip authoritative temporal facts.
- **D52-RA093 — Requirement inference:** persistence uses non-null same-Tenant
  composites, exact uniqueness, temporal order/range, and closed-state checks.
- **D52-RA094 — Requirement inference:** RLS `USING`/`WITH CHECK` and application
  authorization prevent visible-row mutation into forbidden Tenant/state.
- **D52-RA095 — Requirement inference:** owner/service/worker/support/RPC/view/
  function/trigger/BYPASSRLS paths enforce identical policy/temporal checks.
- **D52-RA096 — Requirement inference:** deletion/retention/anonymization/
  restore preserve immutable timing, terminality, and effect chronology.
- **D52-RA097 — Requirement inference:** semantic idempotency keys the durable
  occurrence/effect outcome, not time, event, run, HTTP, or provider key.
- **D52-RA098 — Product judgment:** future policy UX belongs only in People &
  access → Access requests → Settings.
- **D52-RA099 — Product judgment:** the quiet helper says Asym skips a reminder
  it cannot create soon enough rather than creating it late.
- **D52-RA100 — Requirement inference:** ordinary UX shows no usefulness
  control/date/countdown/due/overdue/SLA/urgency/failure/per-request status.

### Scale, proof, assumptions, and explicit non-decisions

- **D52-RA101 — Requirement inference:** a previously provider-admitted reminder
  may arrive after `useful_until` and ordinary copy cannot promise otherwise.
- **D52-RA102 — Requirement inference:** purpose-authorized audit distinguishes
  usefulness expiry from zero, Off, source end, rejection, and technical failure.
- **D52-RA103 — Requirement inference:** events/logs/tasks/general exports carry
  no protected names, reasons, destinations, recipient lists, or secrets.
- **D52-RA104 — Requirement inference:** no per-occurrence write/timer at useful-
  until is required; indexed predicates avoid cardinality-coupled scheduling.
- **D52-RA105 — Requirement inference:** bounded reconciliation uses stable
  keyset/indexes and remains idempotent under interruption/replay.
- **D52-RA106 — Requirement inference:** Off/source-terminal/expired cohorts do
  not create catch-up bursts after outage or capacity recovery.
- **D52-RA107 — Requirement inference:** every D49 seal/release/attempt mutation
  must be D52-aware before any reminder policy/channel activates.
- **D52-RA108 — Requirement inference:** no historical D52 tuple is inferred or
  backfilled because no D52 runtime currently exists.
- **D52-RA109 — Requirement inference:** mixed-version and rollback strategy
  preserves lower-level source facts and never reopens expired work.
- **D52-RA110 — Requirement inference:** production proof includes equality,
  long-lock, late-wake, concurrency, auth, RLS, migration, provider, a11y, and
  largest-supported-Tenant tests.
- **D52-RA111 — Requirement inference:** durable business audit retains exact
  temporal/fence/disposition/effect evidence; traces and metrics are secondary.
- **D52-RA112 — Requirement inference:** named zero-tolerance monitors detect any
  post-fence boundary, recompute, resurrection, invalid tuple, or isolation escape.
- **D52-RA113 — Assumption:** staff prefer a stale reminder omission to delayed
  surprise once ordinary platform recovery tolerance has passed.
- **D52-RA114 — Assumption:** an evidence-backed finite value can accommodate
  mobile/low-bandwidth ministry operations without excessive omission.
- **D52-RA115 — Assumption:** quiet helper copy does not imply a request deadline,
  staff performance judgment, access consequence, or delivery promise.
- **D52-RA116 — Unresolved unknown:** the exact numeric pair(s), registry
  cardinality, and whether evidence admits any non-Off profile remain D53
  decisions.
- **D52-RA117 — Unresolved unknown:** representative ministry value/omission/
  lateness distributions must be gathered before registry/value activation.
- **D52-RA118 — Unresolved unknown:** content, channel, preference, quiet time,
  provider adapters, retention, and quantitative SLOs remain later gates.
- **D52-RA119 — Scope boundary:** D52 creates no runtime/schema/OpenSpec/value/
  event/job/provider/telemetry/UI artifact or hidden placeholder now.
- **D52-RA120 — Traceability requirement:** the corrected decision, terms,
  matrices, assertions, criteria, and D53 dependency must remain consistent from
  Grill answer through glossary, ADRs, OpenSpec, design, tickets, code, tests,
  and release evidence.

## Research acceptance criteria

### Research quality and decision proof

- **D52-RAC001:** The artifact distinguishes repository fact, verified external
  fact, requirement inference, product judgment, assumption, and unresolved
  unknown without presenting vendor behavior as Core authority.
- **D52-RAC002:** Current first-party evidence covers IAM reviews, nonprofit
  grantmaking, CMS scheduling, e-commerce expiry, push TTL, Inngest execution,
  PostgreSQL time/concurrency, and Core governing contracts.
- **D52-RAC003:** The comparison explicitly tests finite source window,
  request-lifetime, exact-instant, provider-TTL, executor-timeout, and no-build
  alternatives and identifies the strongest tradeoff of each.
- **D52-RAC004:** No numeric duration is selected or implied from Entra, Okta,
  SailPoint, Blackbaud, Stripe, RFC, Firebase, Apple, or Inngest defaults/limits.
- **D52-RAC005:** The exact recorded choice is one finite source-owned admission
  window, not a due date, SLA, provider promise, retry budget, or presentation
  retention rule.
- **D52-RAC006:** D52 remains documentation-only; repository review finds no
  schema, migration, OpenSpec, value, key, event, job, provider, telemetry,
  feature flag, UI, dependency, or placeholder added by it.
- **D52-RAC007:** Every requested adversarial category is explicitly marked
  material yes/no and includes failure, importance, severity, likelihood,
  evidence, decision effect, prevention, and exact amended language.
- **D52-RAC008:** The source/state/ownership/temporal/race/failure matrices use
  D43–D51 canonical states and do not collapse zero, indeterminate, Off,
  source-terminal, expiry, provider rejection, or technical failure.
- **D52-RAC009:** The artifact contains exactly 120 continuous unique D52
  research assertions and exactly 60 continuous unique D52 research acceptance
  criteria.
- **D52-RAC010:** Every factual local link exists and every external citation is
  official/primary/current at research time or is clearly historical evidence.

### Temporal and source semantics

- **D52-RAC011:** A future admitted tuple atomically retains exact versioned
  `wait_for_seconds`, strictly positive finite `useful_for_seconds`,
  `not_before`, and `useful_until`, or cadence safely non-admits.
- **D52-RAC012:** Checked arithmetic proves
  `useful_until = not_before + useful_for_seconds`, with exact precision,
  finite range, and `useful_until > not_before`.
- **D52-RAC013:** Missing, zero/negative, unsupported, contradictory, non-finite,
  overflowed, or precision-losing evidence cannot commit an admitted tuple and
  cannot strand the valid D43 request.
- **D52-RAC014:** Replay/lost-response/restore/policy-edit/re-enable returns the
  exact original temporal tuple and cannot recalculate, extend, re-anchor, round,
  or reopen it.
- **D52-RAC015:** Boundary tests prove the half-open predicate permits a final
  mutation at `not_before`, permits one strictly before `useful_until`, and
  denies one exactly at or after `useful_until`.
- **D52-RAC016:** All comparisons use one trusted primary-database decision
  instant; browser, app, worker, transaction-start, replica, cache, Inngest,
  provider, and device clocks cannot authorize a boundary.
- **D52-RAC017:** A lock-wait test starts before `useful_until`, obtains final
  locks afterward, samples time afterward, and terminally expires without seal/
  release/attempt.
- **D52-RAC018:** A rollback after sampling the decision instant retains no
  effect/terminal receipt; retry samples fresh time and current source fences.
- **D52-RAC019:** D52 uses exact elapsed seconds and tests across DST/timezone/
  weekend/holiday/session-TimeZone changes produce identical instants/outcomes.
- **D52-RAC020:** No write, timer, cron, workflow run, or provider object is
  required exactly at `useful_until` for logical expiry to block reads/mutations.

### Occurrence and effect-boundary outcomes

- **D52-RAC021:** Before `not_before`, D49 cannot terminally seal and no
  in-product release/external attempt admission can commit.
- **D52-RAC022:** Within [`not_before`, `useful_until`), one otherwise-current
  D49 indeterminate occurrence may retry only itself and release no partial set.
- **D52-RAC023:** At/after `useful_until`, unresolved/indeterminate work returns
  one semantic terminal no-effect `usefulness_expired` receipt and never later
  seals, catches up, or resurrects.
- **D52-RAC024:** `sealed_proved_zero` remains exact terminal zero before/after
  `useful_until`; no expiry relabel, member, retry, or second occurrence appears.
- **D52-RAC025:** A `sealed_members` cohort committed in time remains immutable;
  each member released before the ceiling remains history and each unreleased
  member is independently suppressed at/after it.
- **D52-RAC026:** D43 terminality and D51 Off/epoch mismatch deny effect at every
  time and cannot be overridden by a still-open D52 interval.
- **D52-RAC027:** In-product release can commit only before `useful_until`; an
  earlier released item is not ended, unread-cleared, deleted, or engagement-
  mutated by crossing `useful_until`.
- **D52-RAC028:** ADR-0027 current D43 source actionability continues to govern
  an earlier released item's presentation applicability after `useful_until`.
- **D52-RAC029:** External envelope preparation/decryption before
  `useful_until` reserves nothing; attempt admission at/after it leaves dispatch
  `Prepared definitely unsubmitted`/`Unprepared` and performs no provider call.
- **D52-RAC030:** An external attempt admitted before `useful_until` permits one
  initial call after it only in the same prepared/decrypted critical section and
  within the registered fence-to-I/O bound. A stall/restart preserves
  `Submission may have begun`/`Indeterminate` without resuming; reconciliation
  creates no new admission/follow-up/retry/replacement/rekey/resend/fallback/
  substitution/additional provider I/O.

### Authorization, database, privacy, and audit proof

- **D52-RAC031:** Human policy/registry publication requires current same-Tenant
  purpose-bound authority; automatic temporal/source/effect claims use separate
  registered code-owned purposes and never impersonate a human.
- **D52-RAC032:** Mutation tests prove callers cannot supply or retarget Tenant,
  actor/purpose, heads, `wait_for_seconds`, `useful_for_seconds`, `not_before`,
  `useful_until`, decision time, occurrence/effect IDs, or audit attribution.
- **D52-RAC033:** Primary/foreign/unique/check constraints reject null Tenant,
  cross-Tenant relations, duplicate occurrence/effect/terminal receipts, invalid
  temporal order/range, and forbidden state transitions.
- **D52-RAC034:** RLS tests cover `SELECT`/`INSERT`/`UPDATE`/`DELETE`, `USING`,
  and `WITH CHECK`, including moving a visible row to another Tenant/state.
- **D52-RAC035:** Equivalent denial/outcome tests pass for owner, service-role,
  worker, support, RPC, view, function, trigger, and BYPASSRLS-capable paths.
- **D52-RAC036:** Temporal/source/effect evidence is immutable; corrections append
  linked evidence and never overwrite chronology or provider outcome.
- **D52-RAC037:** Delete/retention/anonymization/offboarding/backup/restore tests
  preserve required timing/terminal/effect history and cannot resurrect expiry.
- **D52-RAC038:** Events, queues, traces, tasks, analytics, errors, and ordinary
  exports contain no protected reason/request/recipient/destination/secret data.
- **D52-RAC039:** Purpose-authorized audit distinguishes
  `usefulness_expired`, D49 zero/indeterminate, D51 Off, D43 terminality,
  provider rejection/ambiguity, and technical failure with exact source facts.
- **D52-RAC040:** Semantic idempotency survives event/run/HTTP/provider-key
  retention and guarantees one durable occurrence/effect/terminal outcome.

### UX, accessibility, failure, provider, and operations proof

- **D52-RAC041:** No current UI exists; a future disclosure appears only in the
  shared Base Maia People & access → Access requests timing form after full
  activation proof.
- **D52-RAC042:** Future copy says Asym skips a reminder it cannot create soon
  enough instead of creating it late and does not imply request/task/access
  deadline, failure, staff judgment, or provider non-arrival.
- **D52-RAC043:** UX inspection finds no separate usefulness control, date,
  countdown, due/overdue/SLA/grace/escalation label, urgency color, failure
  badge, per-request status, current-work count, or notification.
- **D52-RAC044:** Coordinators/requesters/holders receive no expiry task/message/
  email/push/chat/digest/escalation and their request/task/access remains exact.
- **D52-RAC045:** Accessibility proof covers semantic labels/descriptions/errors/
  status, keyboard, visible/unobscured focus, screen reader, non-color meaning,
  forced colors, target size, reduced motion, and no live countdown noise.
- **D52-RAC046:** Layout/copy passes 320 CSS pixels/400% zoom, mobile touch, RTL,
  CJK/long translation, localization, and low-bandwidth receipt recovery.
- **D52-RAC047:** Lost Inngest sleep/event, late wake, exhausted retries, timeout,
  or disabled executor converges through product claims; at/after `useful_until`
  it closes/no-ops and never catches up.
- **D52-RAC048:** Provider TTL-capable adapters encode a deadline no later than
  `useful_until` with conservative rounding; unsupported/minimum/shorter TTL
  narrows or suppresses the channel and never widens source truth.
- **D52-RAC049:** APNs/provider best-effort late delivery after an admitted
  attempt preserves exact history and safe current link without recall, false
  failure, or new Core effect.
- **D52-RAC050:** Terminal-materialization/reconciliation failure leaves logical
  expiry authoritative, is visible to operations, and recovers idempotently
  without any effect admission.

### Migration, scale, observability, traceability, and D53 gate

- **D52-RAC051:** Additive migration deploys temporal evidence/constraints and
  all D52-aware mutation boundaries before any cadence writer/UI/channel;
  old-code/new-schema and new-code/old-schema fail safely.
- **D52-RAC052:** No historical tuple/backfill is inferred; mixed-version and
  restore tests preserve existing source admissions and never invent/extend a
  window.
- **D52-RAC053:** Rollback after committed temporal/source facts is roll-forward;
  code/UI rollback cannot drop `useful_until` enforcement or reopen expired work.
- **D52-RAC054:** Production-shaped load tests prove no per-occurrence expiry
  timer/write, indexed keyset recovery, bounded transaction work, and stable
  behavior for empty/typical/largest-supported Tenant backlogs.
- **D52-RAC055:** Long-transaction/late-wake/materialization-lag budgets are
  ratified before release; a budget change never changes `useful_for_seconds`.
- **D52-RAC056:** Every named zero-tolerance monitor is fault-injected to prove
  signal, threshold, owner route, narrowing response, and data minimization.
- **D52-RAC057:** A traceability check finds consistent D52 terms, owners,
  predicates, states, copy, numbers, and scope in decision log, glossary, ADRs,
  OpenSpec, design, tickets, code, tests, and release evidence.
- **D52-RAC058:** Representative staff research meets the named 90%
  comprehension gate and product research quantifies omission-versus-staleness
  before any value/UI activation.
- **D52-RAC059:** D53 explicitly selects the complete-pair evidence/admission
  rule and later approved evidence selects exact numeric values; D52
  implementation cannot invent defaults.
- **D52-RAC060:** D53/later channel work can only narrow within D52; it cannot
  alter existing tuples, make `useful_until` inclusive, extend expired work,
  override D43/D51, or end an already released item solely because D52 elapsed.

## D53 — Which exact complete timing profiles may the future policy offer?

### Why this is the next decision

D52 makes a profile one indivisible pair: when the one courtesy reminder first
becomes eligible and how much longer it may still be created. It deliberately
does not provide numbers. If Hope Mission selects **After 7 days**, a hidden or
indefinite retry window would make that label misleading; exposing two separate
duration controls would be noisy and permit unresearched combinations.

Cross-product research does not supply a defensible universal number. Current
identity-governance products range from midway reminders inside a configured
review period to inactivity-based expiration, while transport products expose
TTL values from immediate discard to weeks. Those are different domains. D47
already requires representative nonprofit/missions evidence before any non-Off
profile exists, so D53 must decide how exact pairs enter the closed registry,
not invent a popular-looking default.

### Option 1 — evidence admits each complete pair; remain Off until one passes — recommended

The code registry initially contains only Off. Preregistered representative
research evaluates complete candidate pairs such as `(7 elapsed days,
7 elapsed days useful)`; a pair is added only after need, comprehension,
fatigue, accessibility, privacy, low-bandwidth, operational, and harm thresholds
pass. The example is not an admitted value. No Off-only placeholder setting
ships. The first UI release may expose one proven non-Off card plus Off; later
evidence may add at most a small set without changing old pinned revisions.

**UX/impact:** no speculative interval, no hidden grace choice, and the least
noisy editor. Users see only outcome-meaningful cards backed by evidence. The
feature remains reminder-free until research proves an exact pair, which D47
already requires.

### Option 2 — standardize one pair now from cross-product convention

Choose one fixed pair now—for example seven elapsed days to eligibility plus
seven elapsed days of usefulness—and validate it during rollout.

**UX/impact:** fastest path to a simple two-card editor, but no reviewed Core or
representative ministry evidence supports those numbers. Production becomes
the experiment, and the value may nag too soon or skip before part-time,
international, or low-bandwidth staff rhythms make attention useful.

### Option 3 — let each Tenant choose wait and usefulness durations

Expose separate bounded duration selectors or custom numeric fields.

**UX/impact:** maximizes local control but creates a two-dimensional timing
matrix, invalid combinations, weak comparability, support burden, migration
debt, and a high chance staff read usefulness as a deadline or delivery
guarantee. It conflicts with D47's deliberately small code-owned choice set.

### Recommendation and exact question

**Recommendation: Option 1 — admit only complete timing pairs that pass the D47
evidence gate, beginning with Off only and no placeholder UI.** This prevents an
unsupported number from becoming product truth while retaining the smallest
stable implementation: one closed profile identity/revision, two immutable
elapsed values, one concise card only after evidence admits it, and no free-
form scheduler.

Which D53 registry rule should Core record: **Option 1 — remain Off until each
complete pair independently passes the D47 evidence gate**, **Option 2 — choose
one conventional pair now and validate in rollout**, or **Option 3 — Tenant-
configurable wait and usefulness durations**? You may amend any option.

## Source index

### Core

- [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)
- [D47 primary research](./phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)
- [D48 primary research](./phase-24-d48-new-request-only-cadence-application-primary-research.md)
- [D49 primary research](./phase-24-d49-current-recipient-cohort-primary-research.md)
- [D50 primary research](./phase-24-d50-request-anchored-elapsed-clock-primary-research.md)
- [D51 primary research](./phase-24-d51-immediate-irreversible-narrowing-primary-research.md)
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

- [Microsoft Entra — create access reviews](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
- [Microsoft Entra — complete access reviews](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
- [Okta — access-certification campaigns](https://help.okta.com/en-us/Content/Topics/identity-governance/access-certification/campaigns.htm)
- [Okta — create identity campaigns](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/create-user-campaign.htm)
- [SailPoint — complete certification campaigns](https://documentation.sailpoint.com/saas/help/certs/completing_campaigns.html)
- [Blackbaud — configure Grantmaking program settings](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/gc-grant-programs-configure-settings.html)
- [Blackbaud — program dates](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantsconnect/content/gc-applicants-program-dates.html)
- [Contentful — scheduled actions](https://www.contentful.com/developers/docs/references/content-management-api/scheduled-actions/)
- [Stripe — create Checkout Session](https://docs.stripe.com/api/checkout/sessions/create)
- [RFC 8030 — Web Push TTL](https://www.rfc-editor.org/rfc/rfc8030.html#section-5.2)
- [Firebase — message lifespan](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan)
- [Apple — APNs expiration](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns)
- [Inngest — delayed functions](https://www.inngest.com/docs/guides/delayed-functions)
- [Inngest — retries](https://www.inngest.com/docs/features/inngest-functions/error-retries/retries)
- [Inngest — start/finish timeouts](https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-timeouts)
- [PostgreSQL — date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [PostgreSQL — date/time functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [PostgreSQL — serialization failures](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
- [PostgreSQL — row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Evidence limits and final conclusion

Official sources establish bounded review/business/message lifetimes and real
late-delivery/executor limits; they do not prove Core's reminder value or a
numeric window for distributed missions ministries. Public product defaults
vary from minutes to weeks and encode different due/access/payment meanings.
The D53 complete-pair admission rule and every numeric value therefore remain
evidence gates.

The corrected Option 1 is nevertheless complete as a temporal model. Exact
`wait_for_seconds`/`useful_for_seconds` are pinned at source admission;
`not_before` is inclusive and `useful_until` exclusive; fresh primary-database
time gates each first irreversible boundary; expiry is terminal no-effect for
unreleased work; earlier presentation/attempt history stays truthful; D43
actionability continues to govern an already released item; provider TTL can
only narrow; and execution delay cannot define product usefulness. The model is
small, source-owned, channel-neutral, recoverable, and creates no runtime now.

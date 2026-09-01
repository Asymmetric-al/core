# Phase 24 D46 — No Automatic Access-Review Reminder

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — create no automatic reminder in v1 until the
governing access-request source owns a truthful temporal requirement.  
**Scope:** D43 holder access-review requests only: reminder necessity, negative
runtime contract, UX, source/time ownership, future admission seam,
authorization, privacy, observability, rollout, rollback, repair, and proof.
D45 remains initial email only; digest and escalation remain later decisions.  
**Method:** `/grill-with-docs`, current Core ADR/PRD/OpenSpec/code-boundary
review, the current D45 first-party research, refreshed official Microsoft
Entra/Contentful/Apple evidence, and the required 22-category adversarial pass.  
**Verification note:** Broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, build, and `git diff --check` verification
remains deferred until the Grill ends. Only focused file-scope, structural, and
identifier-continuity checks are performed here.

> **Post-D47 historical note (2026-08-29):** Earlier statements in this D46
> artifact that D47 is unresolved, must decide, or remains next preserve the
> decision-time D46 record. They are superseded for current direction by the
> dated D47 resolution below: D47 conditionally admits only an independently
> validated, bounded, default-Off Phase 12 cadence-policy class; it activates
> no reminder or artifact. D48 has since limited first application to genuine
> D43 request creations ordered after the first successful non-Off source
> boundary, with no pre-boundary enrollment. D49 has since bound one exact
> current D44 responsibility cohort atomically at the source occurrence and
> allows later narrowing only. D50 has since selected one immutable request-
> anchored elapsed eligibility instant: exact elapsed seconds from a trusted
> source-created instant captured after D48 serialization, independent of civil
> time and never a due date or delivery promise. D51 has since added source-
> fenced Off and prospective re-enable; D52 has fixed finite half-open source
> usefulness and no catch-up; D53 now keeps every candidate absent until a D47
> evidence-qualified proposal later passes a separate full activation. D54 local
> presentation is next. D46–D53 add no reminder/runtime artifact.

## Final disposition

**Accept with required amendments.**

Option 1 is the modern, proportionate answer for the current source contract.
D43 has a durable pending state but no review due date, completion promise,
expiry of the request, risk transition, urgency level, business calendar, or
validated ministry cadence. D44 already keeps current work in the complete
permission-filtered **Access requests** lane, a source-backed Tasks Hub
projection when personally routed, and a required source-actionable
Notification Center item that remains in **Needs attention** while the source
is actionable. D45 may add one optional initial email, default Off. A timer
would therefore manufacture a second occurrence from elapsed time alone.

The bare phrase “no reminder” is not sufficient. Without a precise negative
contract, a developer could add a Tasks Hub due date, replay the D44 item as
unread, resend the D45 email, schedule an Inngest sleep, poll request age, add a
disabled Tenant toggle, or reserve a generic reminder key “for later.” Each
would create temporal meaning and technical debt despite nominally accepting
Option 1. Acceptance requires these amendments:

- v1 creates no automatic reminder occurrence, intent, task, notification,
  email, provider request, due date, urgency, overdue state, repeat, digest,
  escalation, timer, cron, scheduled job, queue item, or human-wait run;
- elapsed age, request `created_at`, grant end/expiry, notification retention,
  task projection age, D45 delivery time, and provider state are not a review
  deadline or reminder clock;
- D46 adds no runtime/schema/config/catalog/manifest/preference/feature-flag
  placeholder and no disabled reminder setting in Tenant or personal UX;
- D43, D44, D45, ADR-0027 engagement, and ADR-0183 task states remain
  independent and unchanged; staff may follow up deliberately outside this
  automatic contract, but Core adds no generic **Send reminder** command;
- current screens remain quiet: no **Overdue**, **Due soon**, countdown,
  reminder icon, snooze, “reminders off,” recurring marker, urgency color, or
  duplicate badge/unread item is inferred from age;
- future reminder adoption requires a new evidence-backed source decision that
  defines the exact temporal fact, clock owner, one stable business meaning,
  current actionability/recipient fences, recurrence bound, cancellation,
  idempotency, timezone/calendar behavior, late/missed-wakeup behavior,
  privacy, UX, rollout, and proof before any executable artifact exists;
- a future reminder is a new source-owned occurrence, not a retry/resend of the
  initial D44/D45 occurrence and not a task, notification, Phase 17, provider,
  workflow, or executor-owned fact;
- a future channel remains a separate reviewed Delivery Step over that future
  reminder meaning; D45 email authority cannot authorize reminder email, and
  no generic cross-channel payload or preference is prebuilt now;
- if Inngest is later selected, it may wake identifier-only product-owned due
  work after durable source commit and fire-time reauthorization; it may not
  own the clock, human wait, source occurrence, recipient, content,
  idempotency, catch-up policy, or outcome; and
- aggregate evidence may trigger research, never a reminder. It must not label
  a request overdue, score an individual coordinator, treat valid D44
  shared-lane-only operation as ownerless failure, or silently activate code.

These amendments preserve a clean future seam without shipping speculative
machinery.

## Exact corrected decision

> D46 creates **no automatic reminder in v1** for a D43
> `holder_direct_grant_review` request. A request may remain
> `pending_review` for any length of time allowed by its authoritative Phase 12
> source. Elapsed time alone creates no source event, task, assignment,
> notification item, unread state, email, communication intent, provider call,
> warning, urgency, due date, overdue result, escalation, digest, access change,
> or request transition.
>
> Phase 12 remains the sole owner of request actionability and the closed D43
> lifecycle: `pending_review`, `withdrawn`, `resolved_kept`,
> `resolved_removed`, and `no_longer_applicable`. Source withdrawal, a lawful
> keep/remove decision, or the authoritative grant/assignment/source end alone
> ends a pending episode. The direct grant's independent end condition may make
> the request `no_longer_applicable`; it is not a review due date and does not
> authorize a pre-expiry reminder.
>
> D44 remains the sole owner of personal responsibility generations. The
> permission-filtered **People & access → Access requests** lane remains
> complete even when the Tenant deliberately chooses shared-lane-only routing
> or when current resolution proves zero or indeterminate personal recipients.
> Such operation is not “ownerless,” broken, or a reminder trigger. A current
> personal recipient keeps the existing source-backed Tasks Hub projection and
> required Phase 17 item; coordinator-policy or eligibility changes follow
> D44's differential recipient-generation rules and do not reset an age clock.
>
> The D44 `holder_access_review_requested_v1` item continues under
> `presentation.source_actionable_then_recent_90d@1`. Reading it does not make
> the source non-actionable; while current it remains discoverable in **Needs
> attention** and **All** without being re-issued, marked unread again, cloned,
> badged as new, or converted into a reminder. The grouped
> `access_request_responsibility_updated_v1` item likewise remains exactly the
> one D44 responsibility-application occurrence. D46 adds no third Phase 17
> key or presentation policy.
>
> D45 remains one optional **initial** `staff_email` sibling for each exact D44
> meaning. Core never resubmits or re-labels that email because a request is
> old, the recipient read or did not read another surface, delivery failed,
> provider acceptance is unknown, a Tenant later enables email, a recipient
> changes preference, or a coordinator route changes. D45 provider evidence is
> delivery evidence only and never a reminder clock. D46 registers no reminder
> email step, recipient preference, content, sender profile, provider intent,
> fallback channel, or delivery-plan choice.
>
> D46 adds no database column or relation such as `due_at`, `remind_at`,
> `next_reminder_at`, `last_reminded_at`, `reminder_count`, `overdue_at`, or
> `reminder_state`; no enum member, message key, manifest row, delivery step,
> Tenant plan choice, personal preference, API field, event schema, queue,
> outbox member, provider template, feature flag, cron, scheduled function,
> Inngest function/event/wait, generic workflow node, analytics dimension, or
> hidden UI control is reserved. Unknown fields or commands that attempt to
> express any of these meanings fail closed. “Default Off” is represented by
> absence of the capability, not a dormant setting.
>
> Current UX adds no reminder configuration or status. Tenant administrators
> see only D44 coordinator routing and D45 initial-email delivery controls in
> their established locations. Recipients see their current Tasks Hub work,
> source-actionable Notification Center item, and Access requests destination.
> Holders see the existing request status. No surface says **Overdue**, **Due
> soon**, **Reminder**, **Reminders off**, **Snoozed**, or **Escalated**, and no
> color, icon, badge, relative age, countdown, sort default, empty state, toast,
> or email implies a response deadline. Existing authorized source timestamps
> may continue to render under their owner; D46 gives them no temporal policy.
>
> A staff member may deliberately follow up through an independently governed
> human communication path. That ordinary human action does not create D46
> state, prove delivery or awareness, change the request, or authorize Core to
> build a generic **Send reminder** button. Any product-mediated manual reminder
> would be a separately decided source communication occurrence with its own
> actor authority, content, recipient, idempotency, audit, privacy, and abuse
> controls.
>
> Operational observation may measure body-free, aggregate request age and
> substantiated missed-attention reports for product research. It may not
> expose protected D43 text or provenance, classify a request as late, create a
> per-person responsiveness score, notify or pressure a coordinator, change
> routing, or execute a reminder. D44 shared-lane-only operation is a valid
> product choice and cannot be reported as an ownerless incident.
>
> Core may revisit D46 only when the Phase 12 owner or another exact governing
> source ratifies a temporal requirement that is meaningful for this request,
> such as an authoritative due instant or a source expiry/risk transition that
> actually requires prior attention. D47 separately decides whether a
> validated Tenant cadence without any such lifecycle fact may ever qualify;
> D46 does not assume that it does.
>
> Adoption requires evidence that the temporal requirement solves a known user
> problem and a reviewed versioned contract defining: clock origin; absolute-
> instant or calendar semantics; timezone and timezone-data ownership when
> relevant; DST, leap-day, weekend, holiday, and business-calendar behavior;
> valid states; single versus recurring occurrence cardinality; cancellation;
> current recipient/source reproof; concurrency; idempotency; late deployment,
> downtime, missed wake-up, policy-change, and catch-up behavior; privacy;
> accessible UX; observability; migration; kill switch; rollback; and repair.
>
> A future reminder, if ratified, is one new code-owned source occurrence with
> a stable meaning and source-owned immutable eligibility instant. It is not a
> resend of `holder_access_review_requested_v1`, a task retry, a re-opened
> notification, an email retry, a provider schedule, a Phase 17 timer, a Phase
> 34 generic workflow timer, or an Inngest run. It re-proves the exact current
> request and the then-current D44 recipient generation before committing any
> attention candidate; terminal or no-longer-authorized work produces no
> candidate. Repeated reminders or escalation require separate evidence and
> explicit cardinality; they cannot arise from a generic recurrence field.
>
> Presentation and delivery follow only after that future occurrence exists.
> Phase 17 may compile fixed reviewed in-product or external Delivery Steps for
> the same stable reminder meaning, but D45's initial-email plan/preference/key
> cannot authorize them. Push, Slack, Teams, Google Chat, email, or another
> future channel must separately prove destination, installation, consent or
> preference, quiet-time/urgency behavior, content, provider identity,
> idempotency, privacy, outcome, accessibility, rollout, and shutdown. Tasks Hub
> remains work, not a delivery channel.
>
> If a future implementation uses Inngest, the source/product database first
> commits the temporal fact, source occurrence identity or durable due intent,
> exact scope, and product idempotency. Inngest may receive only versioned
> identifier-only wake/reconciliation work, re-resolve current authorization at
> fire time, and use product claims. It owns no business clock, timer policy,
> human wait, request, recipient, channel, body, provider truth, retry safety,
> missed-wakeup decision, or terminal result. Removing Inngest must not change
> the meaning or recoverability of the future source contract.

## Evidence classification and modern-practice resolution

### Verified repository facts

- D43's authoritative Phase 12 lifecycle has no due date, SLA, reminder state,
  urgency transition, or automatic terminal decision. Its grant end condition
  can make a request no longer applicable but does not create a review clock.
- D44 already supplies a complete Access requests source read model and optional
  bounded personal responsibility. For each current personal recipient, it
  supplies per-request Tasks Hub work and required Phase 17 source-actionable
  attention. Lane-only is a deliberate valid mode.
- ADR-0027 keeps a current source-actionable item in **Needs attention** even
  after read and forbids engagement from changing source truth. Reissuing it to
  simulate a reminder would create a new occurrence without a source event.
- ADR-0183 makes Tasks Hub a projection. Generic task due dates, reminders,
  completion, reassignment, and worker actions cannot change or define D43.
- ADR-0026 assigns occurrence timing and cancellation fences to the producer.
  Phase 17 declares bounded Delivery Steps but is not a scheduler, workflow,
  queue, or source clock.
- D45 is explicitly initial email only. Its key, plan, preference, email intent,
  provider idempotency, and provider outcome cannot authorize a reminder.
- Current contribution correction/task code owns finance-specific reminders,
  due dates, and escalation. The governing docs label it migration input, not
  D43/D46 infrastructure.
- The current Phase 12/17/Tasks Hub contracts are forward contracts; no shipped
  D46 runtime must be migrated or preserved.

### Verified current external evidence

- Microsoft Entra access-review reminders are coupled to an explicit review
  duration: its current access-package review documentation defines how many
  days a review is open and sends a reminder at the review midpoint. This
  supports deriving a reminder from source lifecycle, not picking an arbitrary
  age for a request with no deadline.
  [Microsoft Entra access-package access reviews](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-reviews-create)
- Microsoft Entra also defines what happens at the review end and how an
  unreviewed decision is handled. That reinforces that reminders, deadlines,
  and terminal/default behavior are one lifecycle contract, not independent
  notification toggles.
  [Microsoft Entra access-review FAQ](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-faqs)
- Contentful assigns email for a task and sends its reminder two days before a
  task's explicit due date. This is a comparable CMS example of a reminder
  anchored to source-owned deadline semantics.
  [Contentful tasks](https://www.contentful.com/help/content-and-entries/tasks/)
- Apple's current notification guidance says notifications should be timely
  and high-value, warns against sending multiple notifications for the same
  thing even when a person has not responded, and requires urgency to be
  represented accurately. It is platform UX guidance rather than Core domain
  authority, but it supports not manufacturing repeated attention or urgency.
  [Apple notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)
- WCAG 2.2 remains the accessibility baseline for the existing source, task,
  notification, settings, and future reminder surfaces. A no-build decision
  does not waive existing names, focus, reflow, status, or localization proof.
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Product judgments, assumptions, and unresolved facts

- **Product judgment:** persistent source work plus required in-product
  attention and optional initial email is a proportionate v1 recovery model;
  repetition without a source clock is more likely to create noise than truth.
- **Product judgment:** no disabled reminder control is clearer than a visible
  setting that can never be enabled and avoids committing future IA or data
  shape prematurely.
- **Product judgment:** the future seam is a documented admission contract, not
  dormant code or schema. This is easier to change safely because no false API
  compatibility promise exists.
- **Assumption:** ministries can operate D43 with the durable Access requests
  lane and D44/D45 attention paths while evidence is gathered. This is not yet
  validated across representative small, distributed, volunteer-led, low-
  bandwidth, and multi-time-zone ministries.
- **Unknown:** how often current requests age because staff missed attention
  versus because a decision is intentionally deferred, sensitive, awaiting
  offline context, or not currently actionable by a personal coordinator.
- **Unknown:** whether a reminder would improve resolution without increasing
  fatigue, opt-out, support burden, privacy exposure, or perceived pressure.
- **Evidence required before reopening D46:** representative workflow research,
  source-timestamp quality, aggregate pending-duration distributions with
  reasons sampled safely, missed-attention reports, comprehension testing, and
  proof of one truthful source-owned temporal trigger. None may silently
  activate runtime behavior.

## Current behavior, intended behavior, and permanent path

| Area               | Current repository behavior                                                                                    | Intended governing contract                                                  | D46 permanent path                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| D43 timing         | Forward contract has pending and terminal states but no deadline/reminder runtime.                             | Phase 12 owns actionability, expiry/source end, and transitions.             | No age-triggered occurrence; future timing belongs to a versioned source decision. |
| Source lane        | Access requests is the complete permission-filtered source lane.                                               | Lane works with no personal recipient or projection.                         | Keep it complete; do not label valid lane-only work ownerless.                     |
| Tasks Hub          | Current contribution-oriented task code exposes generic dates/reminders; shared ADR-0183 model is prospective. | Source-backed task projects work and cannot own due/reminder/source closure. | No D43 task date/reminder/snooze/repeat field or generic timer reuse.              |
| In-product         | Current staff bell component is demo; Phase 17 contract is prospective.                                        | Required source-actionable item stays discoverable while source is current.  | Do not clone, re-unread, rebadge, or replay it as a reminder.                      |
| Email              | D45 optional initial email is Reserved/forward contract.                                                       | One future-only initial email with independent provider evidence.            | No age-based resend and no reminder step/preference/content.                       |
| Scheduler/executor | Inngest may execute identifier-only projections elsewhere.                                                     | Product owners and database claims own facts/idempotency.                    | No D46 event/function/wait now; any future executor remains subordinate.           |
| UX/settings        | No reminder setting is shipped.                                                                                | Core uses contract-bounded controls only for real capabilities.              | Add no disabled placeholder, overdue state, countdown, or reminder IA.             |
| Research           | No validated D43 cadence or deadline.                                                                          | Product telemetry cannot become authorization or surveillance.               | Gather aggregate evidence under named thresholds; require a new decision.          |

## Domain model, ownership, and invariants

### Canonical terms

- **Automatic reminder:** a new source-owned attention occurrence caused by an
  exact current source crossing a ratified temporal condition. It is not a
  resend, retry, unread reset, task due date, or provider schedule.
- **No-reminder contract:** the D46 v1 negative capability boundary under which
  age alone has no product effect and no executable placeholder exists.
- **Source temporal fact:** an authoritative, versioned fact whose owner can
  prove why attention becomes newly meaningful at a defined time or state.
- **Temporal admission package:** the evidence and contract required by a
  future D46 successor before any runtime/schema/config artifact is introduced.
  It is documentation, not a dormant product object.
- **Operational age observation:** privacy-minimized aggregate measurement of
  request timestamps for research; it conveys no due, late, urgency, owner,
  performance, or action meaning.

### Ownership matrix

| Fact                                    | Authority now                                        | Derived consumers                                | Never authoritative                                              |
| --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| Request state/actionability/terminality | D43 Phase 12 aggregate                               | source lane, task, in-product, D45 source fences | request age, task, notification, email, provider, monitor        |
| Direct-source end/expiry                | Phase 12 direct grant source                         | D43 no-longer-applicable convergence             | reminder due date or urgency                                     |
| Personal responsibility                 | D44 source recipient generation                      | task and Phase 17/6 members                      | task assignee edit, email address, reminder engine               |
| Source-backed work presentation         | ADR-0183 Tasks Hub                                   | staff work view                                  | source deadline, reminder, completion, authorization             |
| In-product availability/engagement      | ADR-0027/Phase 17                                    | bell/Notification Center                         | source actionability, task state, human awareness, reminder need |
| Initial email delivery                  | D45/Phase 6/17                                       | body-free delivery evidence                      | reminder occurrence, read, response deadline                     |
| Future temporal requirement             | Future versioned Phase 12/source decision            | future occurrence compiler                       | Phase 17, task row, provider, Inngest, analytics                 |
| Future reminder occurrence              | Future source contract only                          | future fixed delivery/presentation steps         | retry, scheduler run, channel adapter                            |
| Execution/wake-up                       | Future product due intent/claims; optional executor  | processing telemetry                             | business clock, source, idempotency, human wait                  |
| Research/monitoring                     | Product analytics under minimized aggregate contract | decision evidence and operations                 | user-facing state, routing, reminder activation, employee score  |

### Invariants

1. D43 age alone produces no business or attention occurrence.
2. Only D43 source commands/end truth change request state.
3. D44 lane-only operation is valid and is never treated as routing failure.
4. Existing task, item, email, and provider states cannot become a reminder.
5. Reading, archiving, delivery failure, or lack of action creates no repeat.
6. The grant end condition is independent of a request-review due date.
7. No **due**, **overdue**, **urgent**, **snoozed**, or countdown meaning exists.
8. D46 has no executable schema, config, contract key, step, event, or timer.
9. No Tenant or recipient can configure a capability that does not exist.
10. Current UX remains complete without a reminder row or dead control.
11. Operational age metrics have no per-person, authorization, or action effect.
12. A future temporal condition must be owned and committed by the source.
13. A future reminder is a new occurrence, never an initial-attention replay.
14. A future occurrence re-proves current request and recipient authority.
15. Terminal or no-longer-authorized work can never emit a future reminder.
16. Future cardinality is finite and explicit; recurrence is never implicit.
17. Product database identity/claims, not a scheduler, own future idempotency.
18. Future clock/calendar semantics are exact before implementation.
19. Future delivery channels require separate reviewed fixed steps.
20. Inngest may execute but never own a future temporal business fact.

## State, temporal correctness, concurrency, and idempotency

### Current closed state effect

| Current object/state                   | D46 v1 effect                                          | Forbidden interpretation                            |
| -------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| D43 `pending_review`                   | none beyond existing source/task/item presentation     | reminder pending, due, overdue, SLA running         |
| D43 terminal state                     | no reminder; existing projections converge from source | timer cancellation as the source terminal receipt   |
| D44 recipient generation               | existing responsibility only                           | reminder enrollment, timer reset, deadline transfer |
| D44 lane-only/zero/indeterminate route | source lane remains complete                           | ownerless incident, fallback recipient, broadcast   |
| ADR-0183 active task                   | existing source-backed work                            | due date, reminder, snooze, recurrence, timer truth |
| ADR-0027 available/read/unread item    | personal engagement only                               | reminder eligibility, human awareness, age reset    |
| D45 email intent/provider evidence     | initial delivery only                                  | resend eligibility, response proof, reminder clock  |
| Request/grant timestamps               | historical/source facts                                | deadline, local-day counter, urgency score          |

### V1 temporal rules

1. No wall clock, monotonic clock, database `now()`, local calendar, timezone,
   task age, notification age, delivery timestamp, or scheduled provider field
   is evaluated for a D46 product effect.
2. Display localization of an already-owned timestamp does not change its
   instant or create a deadline. Relative age or an age badge is not added by
   D46; D47 decides any new age presentation.
3. A request can cross midnight, weekend, holiday, leap day, DST gap/overlap,
   Tenant timezone change, coordinator timezone change, or tzdb upgrade with
   zero D46 transition.
4. Deployment, maintenance, executor outage, clock skew, delayed projection,
   route change, email failure, and data repair create no catch-up reminder.
5. There is no D46 idempotency key because there is no D46 occurrence. Any
   attempted reminder command/event is rejected, not recorded as a zero-send.

### Race outcomes

| Race                                                                | Required v1 result                                                |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| request becomes old while still pending                             | no transition or attention occurrence                             |
| request resolves as a hypothetical timer wakes                      | source terminal truth wins; no reminder artifact may exist        |
| recipient generation changes at any age                             | only D44 differential task/item/initial-email semantics apply     |
| D45 email fails or is disabled while request remains pending        | required source/task/item remain; no reminder or fallback         |
| notification is read/archive attempted while source remains current | ADR-0027 engagement policy applies; no reminder reset/reissue     |
| task projection fails or is rebuilt                                 | D43/source lane remain; no timer catch-up                         |
| deployment introduces then removes an accidental timer              | stop/quarantine it; never replay missed ages after repair         |
| two accidental reminder producers race                              | both are contract violations; neither may choose a winner/send    |
| timezone/tzdb changes                                               | no D46 effect because no calendar computation exists              |
| source timestamp is repaired                                        | history may be corrected by its owner; no reminder is synthesized |

## UX/UI contract

### Tenant administrator

No D46 card, row, switch, selector, disabled control, upsell, setup warning, or
feature flag appears in **People & access**, **System Messages**, **Tasks**, or
Tenant settings. D44 continues to explain personal responsibility. D45
continues to show only required in-product plus optional initial email. The UI
does not say “Reminders are off” because that would imply a configurable
capability and reserve information architecture without evidence.

### Coordinator and authorized reviewer

The coordinator continues from the existing durable entry points:

```text
Needs attention

Access review needs attention
Review this request in People & access. It remains in Needs attention until
it is resolved, withdrawn, or no longer applies.

[Review in People & access]
```

Reading the item does not remove current work from **Needs attention**. Tasks
Hub continues to show one source-backed work row where D44 assigned personal
responsibility. The Access requests source lane remains the complete place to
work across personally assigned and shared-lane-only requests. D46 adds no
secondary toast, duplicate item, “new again” badge, alarm color, due-date chip,
countdown, snooze, reminder history, or prompt to enable another channel.

### Holder, donor, missionary, and public users

The holder's D43 status remains **Review requested. Your access has not
changed.** D46 does not imply a response time or contact a holder again.
Donor, missionary, public, and unrelated staff surfaces receive no D46 row,
badge, preference, email, metric, or terminology. A person serving multiple
Tenants sees only the already-authorized current-Tenant source/task/item state;
no cross-Tenant age summary is added.

### Honest time and status language

- Use only source-owned status labels. Never infer **late**, **stale**,
  **overdue**, **waiting too long**, **urgent**, or **escalated** from age.
- An existing localized submitted timestamp may remain where its owner already
  permits it; D46 adds no relative-age promise or visual severity.
- Empty, loading, offline, stale-read, no-access, lane-only, zero-recipient,
  indeterminate-routing, and terminal states remain distinct.
- Low-bandwidth recovery loads current source truth; it does not replay a
  dismissed alert or schedule a local-device reminder.
- No hover, color, motion, notification count, or email is the only means of
  discovering current work.

### Accessibility and product consistency

- Reuse the existing Base Maia/Base UI source, task, notification, list,
  status, and link primitives. D46 creates no component or styling fork.
- Preserve semantic headings, programmatic names/descriptions, logical keyboard
  order, visible unobscured focus, 44-by-44 important targets, 320-CSS-pixel/
  400-percent reflow, forced colors, reduced motion, zoom, and non-color state.
- Localize source-owned dates with the viewer context without converting them
  into a due date. Support long Tenant names, Unicode, CJK, RTL/bidi, time-zone
  differences, and server-recovered current state.
- Screen readers must not encounter hidden “reminder,” “overdue,” or timer
  semantics absent visually; accessible names and live regions match the same
  no-reminder truth.

## Normative requirements

1. **D46-R1 — No automatic reminder.** D43 `pending_review` age creates no
   automatic occurrence, task, notification, email, provider call, or mutation.
2. **D46-R2 — Source-owned future only.** Any future reminder begins with a
   separately ratified Phase 12/source temporal requirement and occurrence.
3. **D46-R3 — No dormant artifact.** D46 adds no runtime, schema, config,
   catalog, manifest, preference, feature-flag, scheduler, or UI placeholder.
4. **D46-R4 — Preserve D43 truth.** Only D43 source transitions own pending and
   terminal state; reminder behavior can never decide access or request outcome.
5. **D46-R5 — Preserve D44 routing.** Current recipient generations and valid
   shared-lane-only operation remain unchanged and never become timer inputs.
6. **D46-R6 — Preserve D45 initial-only meaning.** No age-based resend, replay,
   renamed intent, or implicit reminder email is permitted.
7. **D46-R7 — No duplicate attention.** Existing task and item remain durable;
   age never clones, re-unreads, rebadges, reopens, or reassigns them.
8. **D46-R8 — Age has no policy meaning.** Request, task, item, email, and
   provider timestamps are historical/evidence facts, not a response clock.
9. **D46-R9 — No false temporal status.** D46 defines no due, overdue, urgent,
   waiting-too-long, snoozed, escalating, or countdown state/copy/style.
10. **D46-R10 — No automatic consequence.** Age never changes grant, request,
    recipient, priority, visibility, task state, engagement, or escalation.
11. **D46-R11 — No Tenant control.** There is no reminder setting, plan choice,
    cadence, business calendar, or disabled placeholder for administrators.
12. **D46-R12 — No recipient control.** There is no reminder preference,
    channel order, quiet-hours control, snooze, or recipient override in v1.
13. **D46-R13 — Manual follow-up is separate.** D46 adds no generic product
    **Send reminder** command; a future manual occurrence needs its own proof.
14. **D46-R14 — Quiet coherent UX.** Existing Core source/task/item/settings
    surfaces remain clear, accessible, mobile-safe, and free of phantom UI.
15. **D46-R15 — No calendar computation.** Timezone, DST, weekend, holiday,
    leap-day, clock-skew, and tzdb changes create no current D46 effect.
16. **D46-R16 — Evidence-gated reconsideration.** A future decision must prove
    a known workflow problem and one truthful temporal trigger before design.
17. **D46-R17 — Future stable meaning.** A ratified reminder uses one new
    source-owned versioned occurrence meaning, never an initial-key/channel retry.
18. **D46-R18 — Future current reproof.** Before future occurrence commit and
    presentation/delivery, current request, source, recipient, auth, and privacy re-prove.
19. **D46-R19 — Future bounded cardinality.** Single versus recurring behavior,
    maximum count, successor rules, and escalation separation are explicit.
20. **D46-R20 — Future product idempotency.** Durable source/product identity,
    uniqueness, claims, and receipts—not transport or scheduler dedupe—own replay.
21. **D46-R21 — Future cancellation and terminality.** Source terminality,
    recipient loss, policy change, and safety fences define suppression/cancel behavior.
22. **D46-R22 — Future clock exactness.** Clock origin, instant/calendar model,
    timezone/tzdb, DST, holidays, and late/missed-wakeup semantics are specified.
23. **D46-R23 — Future failure contract.** Partial success, outage, deployment,
    catch-up, ambiguous external success, repair, and rollback fail safely.
24. **D46-R24 — Channels remain separate.** Future reminder email/push/chat/
    in-product steps need reviewed channel-specific authority and cannot reuse D45.
25. **D46-R25 — Tasks Hub boundary.** Task age/due/reminder/retry/engagement is
    never source temporal truth or reminder identity.
26. **D46-R26 — Phase 17 boundary.** Phase 17 may render/route a ratified future
    occurrence but never schedules or invents it.
27. **D46-R27 — Inngest boundary.** No D46 function/event/wait exists now;
    future identifier-only execution is replaceable and subordinate to product truth.
28. **D46-R28 — Tenant/RLS/privacy safety.** Existing exact-scope boundaries
    remain; any future persistence uses same-scope constraints and minimized evidence.
29. **D46-R29 — Humane observability.** Aggregate signals may trigger research
    or incident response only; no overdue classification, personal scoring, or automation.
30. **D46-R30 — Additive proof and recovery.** Rollout adds nothing executable
    now; future adoption needs migration, kill, rollback, repair, tests, and traceability.

## Ruthless 22-category adversarial review

Severity and likelihood describe each concern before the corrected safeguards.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                            | Why it matters                                                                         | Severity | Likelihood                                                               | Evidence or reasoning                                                                                      | Decision effect                       | Permanent fix                                                                                                                 | Exact requirement / acceptance language                                |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| No reminder could leave genuinely missed requests pending indefinitely.                                        | A holder may wait, and a ministry may retain access it intended to reconsider.         | High     | Medium; current volume/behavior is unknown                               | D44 has durable recovery surfaces, but no representative ministry evidence proves they are always noticed. | Narrows rather than rejects Option 1. | Keep the complete lane/task/item, measure missed-attention reports, and reopen only for a proved source temporal requirement. | **D46-R1–R2, R5, R14, R16, R29; D46-AC001–010, AC021–030, AC091–100.** |
| The strongest alternative is one fixed one-time product reminder. It is simple, but any number is unsupported. | A seemingly harmless seven-day rule would become a de facto SLA and calendar contract. | High     | High if “modern products remind” is copied without its lifecycle context | Entra and Contentful anchor reminders to review duration or due date; D43 has neither.                     | Confirms no-build now.                | Require source-owned timing evidence rather than adopting a vendor cadence.                                                   | **D46-R2, R16–R23; D46-AC071–090.**                                    |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                                | Why it matters                                                                                         | Severity | Likelihood                                   | Evidence or reasoning                                                                                        | Decision effect                           | Permanent fix                                                                                                      | Exact requirement / acceptance language                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| A hidden `created_at + N`, cron, task due date, or D45 resend can appear to work until timezones, route changes, source closure, or outages occur. | Ordinary changes create late, duplicate, or unauthorized attention and no owner can explain the clock. | Critical | High if implemented as a small local feature | Current contribution code has generic reminder/due patterns, but ADR-0026/0183 reject them as D43 authority. | Makes the negative architecture explicit. | Reject every age-derived executable artifact; future timing must be a source contract with exact clock and fences. | **D46-R3, R7–R8, R15, R20–R27; D46-AC011–020, AC041–070, AC081–090.** |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                   | Why it matters                                                                                                                      | Severity | Likelihood                                   | Evidence or reasoning                                                                                 | Decision effect                                | Permanent fix                                                                                                                  | Exact requirement / acceptance language                                 |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| “Future-ready” nullable columns, enum values, disabled controls, placeholder keys, or generic schedule APIs freeze an unproved model. | Later evidence may require a different clock, cardinality, recipient, UX, or channel, leaving migrations and compatibility baggage. | High     | High if placeholders are treated as harmless | Core's contract-bounded model gains safety from closed Live meanings, not speculative generic fields. | Changes implementation scope to true no-build. | Preserve only a documentation-level temporal admission package; add runtime/schema/config in the future version that earns it. | **D46-R3, R11–R12, R16–R17, R30; D46-AC011–020, AC071–080, AC111–120.** |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                         | Why it matters                                                                           | Severity | Likelihood        | Evidence or reasoning                                                                                                                   | Decision effect                                       | Permanent fix                                                                                                          | Exact requirement / acceptance language                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| A request spans DST, leap day, a Tenant timezone change, assignment/grant expiry, route churn, long leave, low connectivity, deployment downtime, or a corrected timestamp. | A naïve age calculation fires at different instants or after the work/recipient is gone. | High     | High in aggregate | Multi-time-zone ministries and asynchronous projection races are normal; D43 terminality and D44 recipient generations are independent. | Adds explicit zero-effect and future admission rules. | No v1 clock; future contract specifies time/calendar/catch-up and re-proves source/recipient before occurrence commit. | **D46-R4–R8, R15, R18–R23; D46-AC031–060, AC071–090.** |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                                                                     | Severity | Likelihood                                                      | Evidence or reasoning                                                                                                           | Decision effect             | Permanent fix                                                                       | Exact requirement / acceptance language                |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| A task **Add reminder**, **Snooze**, due-date field, red age badge, repeated unread item, email retry, or dormant toggle silently creates policy. | Staff may believe Core promises a deadline, rely on a notification that is not authorized, or pressure volunteers. | High     | High because these controls are common in generic task products | ADR-0183 explicitly separates generic tasks from source-backed work; Apple warns against duplicate/false-urgency notifications. | Narrows UX and server APIs. | Omit controls and reject commands/fields server-side; use only source-owned status. | **D46-R7, R9–R14, R25–R26; D46-AC011–030, AC061–070.** |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                                | Severity | Likelihood                                 | Evidence or reasoning                                                                                    | Decision effect                                                | Permanent fix                                                                                                              | Exact requirement / acceptance language                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Timer scans, caches, recipient lookup, workspace timezone, or notification fanout can cross Tenant or active-assignment context for multi-hat staff. | A reminder can disclose that sensitive access governance work exists in another organization. | Critical | Medium without exact same-scope derivation | D43/D44 require exact Tenant/assignment/Party/role/surface relations; external delivery is irreversible. | Preserves no runtime now and constrains future implementation. | No timer today; future source occurrence and every consumer use composite same-scope relations and current Tenant reproof. | **D46-R5, R18, R24, R27–R28; D46-AC031–040, AC081–090.** |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                   | Why it matters                                                                                           | Severity | Likelihood              | Evidence or reasoning                                                                                                      | Decision effect                                                     | Permanent fix                                                                                                                                                                        | Exact requirement / acceptance language                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| A nullable timer field, browser-writable due date, bare FK, missing `WITH CHECK`, mutable reminder count, or service-role scheduler can forge/retarget an occurrence. | An allowed update could turn a permitted row into a cross-Tenant or unauthorized external communication. | Critical | High for a naïve schema | Phase 12 and Phase 17 require server-derived fields, composite FKs, forced RLS, immutable versions, and privileged parity. | Prohibits current schema and makes future database proof normative. | Add nothing now; a future source-owned relation must use closed checks, same-scope keys, `USING`/`WITH CHECK`, restrictive deletes, trusted attribution, and privileged-path parity. | **D46-R3, R18, R20–R21, R28; D46-AC011–020, AC031–040, AC081–090.** |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                      | Why it matters                                                                                                      | Severity | Likelihood                                   | Evidence or reasoning                                                                                               | Decision effect              | Permanent fix                                                                                                                | Exact requirement / acceptance language                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| A reminder roadmap becomes a generic scheduler, recurrence/quiet-hours DSL, escalation graph, channel matrix, business-calendar service, or universal notification payload before one cadence is proved. | It duplicates Phase 34, hides source/channel differences, and makes a small ministry workflow harder to understand. | High     | High if “future channels” drives abstraction | ADR-0026 explicitly rejects Tenant-authored workflow graphs; D45 requires each future channel to earn its contract. | Confirms deliberate absence. | Document admission criteria only; implement the smallest source-owned occurrence and named fixed steps when evidence exists. | **D46-R2–R3, R11–R13, R16–R27; D46-AC011–020, AC061–090.** |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                           | Why it matters                                                                                     | Severity | Likelihood | Evidence or reasoning                                                                                   | Decision effect                       | Permanent fix                                                                                      | Exact requirement / acceptance language                |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| No reminder is represented by a noisy disabled setting, while current work disappears after read or lane-only operation is called unassigned. | Administrators get configuration clutter and coordinators can lose confidence in where work lives. | High     | Medium     | ADR-0027 keeps source-actionable work visible after read; D44 makes lane-only complete and intentional. | Changes the presentation of Option 1. | Add no reminder UI; preserve durable Needs attention/task/source-lane IA and exact plain language. | **D46-R5, R7, R9, R11–R14; D46-AC021–030, AC061–070.** |
| Age is shown as a red badge or “waiting 12 days” without a deadline.                                                                          | Relative age easily reads as blame, urgency, or an SLA and may not localize consistently.          | Medium   | Medium     | No source evidence defines when age becomes actionable; D47 must decide any neutral date presentation.  | Narrows D46 to no new age UI.         | Keep current source timestamps only; no D46 relative/severity treatment. Ask D47 separately.       | **D46-R8–R9, R14–R15; D46-AC021–030, AC041–050.**      |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                                          | Why it matters                                                                                                        | Severity | Likelihood                            | Evidence or reasoning                                                                    | Decision effect                          | Permanent fix                                                                                      | Exact requirement / acceptance language                          |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Request age, task due state, item read state, email failure, provider outcome, or Inngest run is treated as the fact that a reminder is due. | Multiple systems can independently create attention and mutate each other, causing circular truth and duplicate work. | Critical | High without an explicit owner matrix | ADR-0026/0027/0183 separate producer event, work, presentation, delivery, and execution. | Makes ownership central to the decision. | Phase 12 owns any future temporal fact/occurrence; all downstream systems only project or execute. | **D46-R2, R4–R8, R17–R27; D46-AC001–010, AC031–040, AC061–090.** |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                              | Severity | Likelihood  | Evidence or reasoning                                                                                | Decision effect             | Permanent fix                                                                                                 | Exact requirement / acceptance language                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| D46 depends on contribution task reminders, Phase 17 retention deadlines, D45 provider timestamps, a UI interval, Inngest schedule state, or one vendor channel. | Unrelated changes alter access-governance behavior and block provider/executor replacement. | High     | Medium-high | The current code has finance-specific reminder machinery; governing docs reject it as D43 precedent. | Prohibits convention reuse. | No dependency now; future source contract exposes a typed occurrence consumed through existing bounded seams. | **D46-R3, R6, R8, R15, R24–R27; D46-AC011–020, AC041–070.** |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                                            | Why it matters                                                                                   | Severity | Likelihood                    | Evidence or reasoning                                                                                     | Decision effect                                          | Permanent fix                                                                                                                             | Exact requirement / acceptance language              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| A timer fires but occurrence commit fails; one channel succeeds; a response is lost; downtime passes the threshold; provider success is ambiguous; source resolves mid-flight. | Blind catch-up or retry can duplicate/leak attention, while skipping can hide a false guarantee. | High     | High for distributed delivery | Phase 6/D45 already require durable identity and reconciliation; scheduler wake-up is not business truth. | Requires future failure semantics but no current engine. | Future source commit/identity first, explicit missed-wakeup/catch-up, independent channel outcomes, current fences, no blind replacement. | **D46-R18, R20–R24, R27; D46-AC051–060, AC081–090.** |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                                    | Why it matters                                                                               | Severity | Likelihood                      | Evidence or reasoning                                                                               | Decision effect                                      | Permanent fix                                                                                                                | Exact requirement / acceptance language         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| The system has no definition for timer start, timezone, policy change, re-routing, recurrence, cancellation, late deployment, or source-terminal race. | Two locally valid operations can jointly send after terminality or more often than intended. | Critical | High if a timer is added ad hoc | D43 has closed terminal states and D44 generation changes; neither currently owns a reminder epoch. | Rejects implementation until semantics are complete. | Zero v1 transitions; future decision defines every state, transition, cardinality, clock, fence, claim, and replay identity. | **D46-R15–R23, R27; D46-AC041–060, AC071–090.** |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                   | Why it matters                                                                               | Severity | Likelihood | Evidence or reasoning                                                                            | Decision effect                                         | Permanent fix                                                                                                                                 | Exact requirement / acceptance language                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Duplicate timer rows, mutable `last_reminded_at`, backfilled due dates, changed payload under one key, stale recipients, or partial channel children corrupt history. | Repair cannot tell whether a reminder was due/sent and may notify twice or the wrong person. | Critical | Medium     | Product database uniqueness and immutable complete occurrences are the established Core pattern. | Prohibits placeholder data and constrains future model. | No current rows; future immutable source occurrence plus exact child identity, complete-set release, restrictive history, and reconciliation. | **D46-R3, R17–R23, R28, R30; D46-AC011–020, AC051–060, AC081–090, AC101–110.** |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                  | Why it matters                                                                         | Severity | Likelihood | Evidence or reasoning                                                                                | Decision effect                     | Permanent fix                                                                                                                                      | Exact requirement / acceptance language                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Repeated alerts, metrics, URLs, provider metadata, or logs reveal a holder, capability, protected explanation, group/provenance, ministry/location context, or coordinator behavior. | Reminder data is externally visible, persistent, and usable for profiling or coercion. | Critical | Medium     | D43 text is protected and D45's safe fact wall exists because external attention is hard to retract. | Narrows metrics and future content. | No v1 egress; aggregate/body-free research; future minimized fact wall, authenticated inert destination, exact retention, and no personal scoring. | **D46-R1, R18, R24, R28–R29; D46-AC031–040, AC081–100.** |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                      | Severity | Likelihood                    | Evidence or reasoning                                                                                                      | Decision effect                 | Permanent fix                                                                                                                             | Exact requirement / acceptance language                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Periodic scans of all pending requests create N+1 authorization/recipient checks, thundering herds at local midnight, duplicate fanout, and noisy-neighbor load. | Source operations and required attention can slow or fail as Tenants/requests grow. | High     | Medium if cron/scans are used | D44 resolution is bounded per occurrence, but request volume and Tenant count are not; generic calendar scans couple them. | Supports no scheduler/scan now. | Future source-owned indexed due intents, bounded claims/fairness, exact fanout, and performance budgets; never browser/worker full scans. | **D46-R3, R18–R23, R27–R30; D46-AC051–060, AC081–110.** |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                | Why it matters                                                                       | Severity | Likelihood                | Evidence or reasoning                                                                           | Decision effect                     | Permanent fix                                                                                                      | Exact requirement / acceptance language                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------- | ------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Operators inherit a dormant scheduler, dead settings, timezone support, stuck jobs, catch-up decisions, provider repair, and manual database resend before product value is known. | Small ministries and Core support pay recurring complexity for speculative behavior. | High     | High if scaffolding ships | Each temporal/channel choice adds lifecycle and runbooks; no current D43 evidence justifies it. | Confirms no executable placeholder. | Ship only deny/monitor/proof boundaries; future rollout includes explicit owner, kill, reconciliation, and repair. | **D46-R3, R11–R12, R16, R22–R23, R27, R30; D46-AC011–020, AC071–080, AC101–110.** |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                | Why it matters                                                                             | Severity | Likelihood                  | Evidence or reasoning                                                                                         | Decision effect                                     | Permanent fix                                                                                                                        | Exact requirement / acceptance language  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Core cannot tell whether requests age from missed attention, deliberate waiting, no personal route, insufficient authority, or source/process friction; alternatively it labels coordinators slow. | The next decision could be based on misleading metrics or employee/volunteer surveillance. | High     | High without typed evidence | Age is correlation, not reason; D44 lane-only is valid and D43 protected context is unavailable to analytics. | Adds humane named monitors and research thresholds. | Separate incident invariants from product-research signals; aggregate/minimize, disclose limits, and never automate or score people. | **D46-R5, R8, R16, R29; D46-AC091–100.** |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                      | Decision effect                                             | Permanent fix                                                                                                         | Exact requirement / acceptance language |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Inngest schedule semantics, provider scheduling, webhook timing, push/chat DND, Slack/Teams identity, or email deliverability becomes the reminder/source clock. | Vendor changes/outages can alter who is notified, when, or whether a request is considered handled. | High     | Medium     | D45 research shows channel-specific identity/consent/outcome differences; Core must own product semantics. | Prevents current dependency and constrains future adapters. | Product source/ledger first; replaceable identifier-only executor; independently ratified channel steps and outcomes. | **D46-R17–R27; D46-AC061–090.**         |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                          | Why it matters                                                             | Severity | Likelihood                               | Evidence or reasoning                                                                                 | Decision effect                                          | Permanent fix                                                                                                                                         | Exact requirement / acceptance language           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Existing generic task reminder fields are inferred for D43, old rows receive due dates, a feature flag exposes dead UI, or a later timer backfills all old pending requests. | Surprise reminder storms and duplicate external messages are irreversible. | Critical | High without explicit negative migration | D45 already requires no backfill; current contribution/task schemas are explicitly not D43 authority. | Adds no-inference/no-backfill and staged future rollout. | Do not migrate anything now; future readers/deny proof before writer, prospective activation, no historical catch-up absent separately proved policy. | **D46-R3, R6–R8, R30; D46-AC011–020, AC101–110.** |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                          | Severity | Likelihood                     | Evidence or reasoning                                                                                             | Decision effect                               | Permanent fix                                                                                                                                   | Exact requirement / acceptance language |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| “Nothing happens” is asserted only by absence of a unit test; another job, task API, UI control, or contract key still creates reminder behavior. | The decision can silently regress while all feature tests remain green. | High     | High for negative capabilities | Multiple current domains contain reminder-like primitives; proof must span public seams and generated registries. | Makes negative tests and trace IDs normative. | Carry D46-R/AC through docs/spec/design/tickets/tests/release and test positive existing behavior plus negative age/time/channel/runtime paths. | **D46-R1–R30; D46-AC001–120.**          |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                 | Why it matters                                                                                | Severity | Likelihood | Evidence or reasoning                                                                                       | Decision effect                       | Permanent fix                                                                                                                                               | Exact requirement / acceptance language                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| “Pending too long” becomes an employee/volunteer score, an arbitrary SLA, support force-send, AI escalation, or a product-wide access-health grade. | It changes a sensitive governance aid into pressure/surveillance and invents ministry policy. | High     | Medium     | No founder or research evidence authorizes performance management, HR use, or generic automated escalation. | Adds an explicit humane-use boundary. | Aggregate product-health-only evidence; prohibit rankings, automatic outreach, AI decisions, and policy claims; require a new decision for changed purpose. | **D46-R9–R10, R13, R16, R29–R30; D46-AC091–100, AC111–120.** |

## Acceptance criteria

### Decision, scope, source ownership, and current truth

- **D46-AC001:** For every D43 `holder_direct_grant_review` request, elapsed
  time alone creates zero automatic reminder occurrences, tasks, notification
  items, communication intents, provider calls, or source mutations.
- **D46-AC002:** A request may remain `pending_review` across any number of
  wall-clock days without entering a D46 state, satisfying or violating a D46
  deadline, or incrementing a reminder count.
- **D46-AC003:** Only the registered D43 source transitions may produce
  `withdrawn`, `resolved_kept`, `resolved_removed`, or
  `no_longer_applicable`; no timer, task, item, delivery, or monitor can produce
  or prevent one.
- **D46-AC004:** The direct grant's end/expiry condition remains an independent
  Phase 12 source fact. It may make the request no longer applicable but cannot
  be interpreted as a review due date or authorize a pre-expiry reminder.
- **D46-AC005:** D44 shared-lane-only, proved-zero-recipient, and indeterminate-
  recipient results remain valid safe states with a complete Access requests
  lane; none is labelled ownerless, broken, late, or reminder-eligible.
- **D46-AC006:** D44 coordinator policy, current recipient generations,
  requester exclusion, continuing/new/removed semantics, and exact current-
  eligibility reproof are unchanged by request age.
- **D46-AC007:** An ADR-0183 source-backed task remains only a work projection.
  Its creation, engagement, rebuild, absence, delay, or closure projection
  creates no D46 occurrence and changes no source clock.
- **D46-AC008:** The required D44 in-product item remains governed only by
  ADR-0027 availability/presentation/engagement/source-end rules. Read, unread,
  archive denial, view, or age creates no reminder occurrence.
- **D46-AC009:** A D45 email remains an initial email only. Provider accepted,
  delivered, delayed, failed, suppressed, bounced, complained, opened, clicked,
  or indeterminate evidence creates no reminder and authorizes no resend.
- **D46-AC010:** D46 creates no digest, escalation, auto-removal, automatic
  decision, holder follow-up, channel fallback, manual product reminder, or
  changed request/grant/authorization behavior.

### No dormant runtime, schema, configuration, or compatibility promise

- **D46-AC011:** No D43, D44, task, notification, communication, or provider
  table receives `due_at`, `remind_at`, `next_reminder_at`,
  `last_reminded_at`, `reminder_count`, `overdue_at`, `reminder_state`, or an
  equivalent generic/polymorphic field for D46.
- **D46-AC012:** No D46 enum member, status, source kind, event kind, stable
  message key, recurrence code, reason code, timer token, idempotency key, or
  opaque metadata slot is registered or reserved.
- **D46-AC013:** The Phase 17 catalog, executable manifest, generated binding,
  contract profile, Delivery Plan, and channel registry contain no D46 reminder
  occurrence or step, including a disabled/Reserved placeholder.
- **D46-AC014:** No Tenant plan value, cadence choice, business calendar,
  reminder policy, per-request override, recipient preference, quiet-hours
  setting, snooze, or “follow organization” reminder choice exists.
- **D46-AC015:** No browser/server API, RPC, SQL function, event schema, outbox
  member, queue item, claim kind, provider template, webhook mapping, or import/
  export field accepts or emits D46 reminder meaning.
- **D46-AC016:** No cron, database scheduler, provider `scheduled_at`, Phase 17
  wait, Phase 34 workflow node, service timer, client timer, Inngest function,
  Inngest event, `sleep`, `sleepUntil`, recurring function, or human wait is
  created for D46.
- **D46-AC017:** No hidden, disabled, coming-soon, upsell, feature-flagged, or
  permission-hidden reminder UI is rendered in Tenant, recipient, task,
  notification, request, email, or operator surfaces.
- **D46-AC018:** Unknown reminder-like fields, commands, keys, steps, enum
  values, event kinds, task operations, and config fail closed with no persisted
  partial artifact and no fallback to a generic scheduler.
- **D46-AC019:** Existing contribution reminder/SLA/escalation data, generic
  `mission_control_tasks` due/reminder controls, Support digest preferences,
  notification retention clocks, and provider schedule fields are not joined,
  copied, inferred, dual-written, or treated as D46 compatibility inputs.
- **D46-AC020:** Deploying D46 runs no data migration or backfill, changes no
  existing request/task/item/email row, and preserves no hypothetical API shape
  for a future reminder implementation.

### UX/UI, accessibility, localization, and field conditions

- **D46-AC021:** **People & access → Access requests** remains the complete,
  permission-filtered source lane for current D43 work, including when no
  personal recipient exists, with no reminder-specific navigation or empty
  state.
- **D46-AC022:** D44 coordinator settings and D45
  **System Messages → Messages → Access review requested → Delivery** retain
  their exact responsibilities and add no reminder row, switch, cadence,
  readiness state, impact count, or cross-link.
- **D46-AC023:** A current recipient's D44 item continues to say that the
  request remains in **Needs attention** until resolved, withdrawn, or no
  longer applicable; reading it does not hide the actionable source or create
  another item.
- **D46-AC024:** Tasks Hub shows no D46 due-date chip, alarm/reminder icon,
  urgency color, snooze, repeat, recurrence, reschedule, “remind me,” overdue
  filter, or generic mutation for a D43 source-backed task.
- **D46-AC025:** The Access requests lane, task projection, and Notification
  Center destination resolve current source state independently; failure or
  absence of one does not replace it with a reminder or hide the others.
- **D46-AC026:** Holder presentation remains **Review requested. Your access
  has not changed.** and does not promise response timing, advertise reminder
  behavior, ask the holder to resubmit, or apply urgency pressure.
- **D46-AC027:** No visible or accessible copy/style says or implies **Due**,
  **Due soon**, **Overdue**, **Waiting too long**, **Reminder**, **Reminders
  off**, **Snoozed**, **Escalated**, a countdown, or an SLA from age alone.
- **D46-AC028:** Any timestamp already authorized by D43/D44 renders through
  its existing owner and locale rules. D46 adds no relative-age badge,
  severity threshold, local-midnight boundary, deadline, sort default, or
  date-based row promotion.
- **D46-AC029:** Existing affected surfaces retain WCAG 2.2 AA names,
  descriptions, headings, focus order/visibility, keyboard operation, status
  messages, non-color meaning, 44-CSS-pixel important targets, reflow, zoom,
  forced colors, and reduced-motion behavior; hidden semantics match visible
  no-reminder truth.
- **D46-AC030:** At 320 CSS pixels, 400-percent zoom, long localized strings,
  Unicode/CJK/RTL/bidi text, multiple viewer/Tenant timezones, low bandwidth,
  stale reads, offline return, and ambiguous navigation responses, current work
  remains understandable without horizontal scrolling, hover, motion, toast-
  only state, or a local-device reminder.

### Authorization, Tenant isolation, RLS, privacy, and purpose

- **D46-AC031:** Phase 12 remains the only authority for D43 request reads,
  actionability, decision commands, source end, and terminal receipts; task,
  notification, Phase 17/6, analytics, provider, and executor paths cannot
  acquire a D46 mutation capability.
- **D46-AC032:** D44 remains the only authority for personal responsibility;
  an original grantor, Owner/Admin label, role, group, task assignee, email
  address, support operator, AI result, provider contact, or historical
  recipient cannot be chosen as a reminder fallback.
- **D46-AC033:** Every existing request/task/item/email read remains bound to
  exact Tenant, Active Tenant Assignment, Party, registered role/surface,
  current purpose, and source visibility; D46 adds no cross-Tenant cache,
  aggregate, queue, or multi-hat-person join.
- **D46-AC034:** Browser base writes remain revoked and owner, service-role,
  worker, support, operator, `BYPASSRLS`, and maintenance paths have no hidden
  D46 write/send power; current RLS `USING`/`WITH CHECK` and hardened-command
  parity remain intact.
- **D46-AC035:** Operational measurements contain no D43 request/decision
  explanation, D40 reason, holder/requester identity, capability, group/
  provenance, grant snapshot, protected scope, recipient address, raw URL, or
  provider payload.
- **D46-AC036:** No per-person pending-age, response-time, read/open/click,
  delivery, rank, workload, performance, volunteer diligence, or employment
  score is calculated, displayed, exported, searched, embedded, or sent to AI.
- **D46-AC037:** No cross-Tenant reminder/age summary, notification, badge,
  email, provider envelope, monitor dimension, or support view lets a multi-
  Tenant person infer another Tenant's request or responsibility.
- **D46-AC038:** Logs, traces, metrics, analytics, caches, Realtime, search,
  exports, backups, AI, and incident payloads remain body-free and use only
  closed safe reason codes, counts, durations, and opaque scoped identifiers
  permitted by their existing purpose.
- **D46-AC039:** A staff member's independent human follow-up outside D46
  creates no product reminder truth, delivery/awareness proof, request comment,
  recipient mutation, audit inference, or permission; Core offers no generic
  force-send/support impersonation path.
- **D46-AC040:** Donor, missionary, public, unrelated staff, wrong-role,
  inactive/recreated assignment, support, operator, and unauthenticated
  surfaces expose no D46 term, preference, date status, metric, or occurrence;
  denials remain uniform and existence-safe.

### V1 time, lifecycle, race, and failure behavior

- **D46-AC041:** No product path evaluates `now() - request.created_at`, task
  age, item age, D45 preparation/submission/delivery time, grant remaining time,
  or any other timestamp comparison to decide D46 behavior.
- **D46-AC042:** Crossing local midnight, weekend, holiday, leap day, month/
  year boundary, DST gap/overlap, Tenant/coordinator timezone change, or timezone-
  database update creates zero D46 transition and zero regenerated projection.
- **D46-AC043:** Correcting, importing, restoring, or reconciling a source-owned
  timestamp changes only that owner's lawful historical fact; it cannot
  synthesize, backdate, catch up, or cancel a D46 occurrence.
- **D46-AC044:** A D44 policy save, eligibility loss/restoration, assignment
  recreation, responsibility-application generation, or no-op authorization-
  epoch re-evaluation follows D44 semantics and does not start, stop, transfer,
  reset, or inherit a reminder clock.
- **D46-AC045:** Viewing, reading, marking unread, archive attempt, deep-link
  opening, browser prefetch, task engagement, or source-detail navigation does
  not start/reset/satisfy a timer or establish awareness.
- **D46-AC046:** D45 Tenant On/Off, recipient `inherit | disabled`, contact/
  connection/sender repair, provider delay/failure/acceptance, or tracking
  evidence does not start/reset/satisfy a reminder clock or create a repeat.
- **D46-AC047:** Deployment, maintenance, executor/provider outage, queue lag,
  delayed materialization, clock skew, feature rollback, or recovery across any
  hypothetical age threshold produces no v1 catch-up, backlog, or missed-
  reminder replay.
- **D46-AC048:** If D43 becomes terminal while any unapproved timer/job/event is
  evaluating, source terminality remains authoritative and the job creates no
  occurrence/member/provider call; the attempted path raises the named
  contract-violation monitor.
- **D46-AC049:** Approaching or crossing the direct grant's independent expiry
  may end the source under Phase 12 but generates no prior reminder, grace
  period, escalation, default Keep/Remove, or holder/coordinator communication
  under D46.
- **D46-AC050:** D46 introduces no new relative-age presentation. Any later
  decision to show age/date beyond existing source-owned timestamps must define
  purpose, copy, localization, sort/filter behavior, accessibility, privacy,
  and assurance that it does not imply a deadline.

### Idempotency, projection recovery, and accidental-path containment

- **D46-AC051:** An attempted D46 reminder command/event/request is rejected as
  unregistered before persistence or provider preparation; it is not stored as
  a successful zero-recipient/zero-channel occurrence.
- **D46-AC052:** Concurrent or duplicate unregistered reminder attempts are all
  contract violations. They cannot race to select a winner, generate an
  idempotency token, claim work, or create one “best effort” reminder.
- **D46-AC053:** No current D46 semantic/provider idempotency key exists.
  Reusing a D43 request ID, D44 generation, task ID, notification ID, D45 email
  key, provider key, or Inngest event ID as one is rejected.
- **D46-AC054:** Rebuilding, replaying, reconciling, or migrating an ADR-0183
  task returns only the existing source-work projection and never emits a
  reminder, changes task due fields, or increments notification engagement.
- **D46-AC055:** Rebuilding, regrouping, replaying, or repairing an ADR-0027
  item returns only the existing occurrence/engagement projection and never
  marks it newly unread, creates a second occurrence, or invokes a channel.
- **D46-AC056:** Reconciliation of a D45 indeterminate/failed/accepted email
  updates only the existing delivery evidence; no result authorizes a new
  provider envelope, reminder, fallback channel, or source/task/item change.
- **D46-AC057:** If an accidental timer, due field, reminder row, queue member,
  task mutation, item, or intent is discovered, operators fence its writer and
  claimant, quarantine unsubmitted work, preserve body-free evidence, and
  invoke D46 repair without treating any artifact as source truth.
- **D46-AC058:** Core sends no automatic apology, correction, counter-reminder,
  duplicate, or “ignore previous message” after an accidental external
  reminder. Incident communication requires its independently authorized
  communications process.
- **D46-AC059:** Source lane, task, required in-product item, D45 initial-email
  history, and holder status remain independently rebuildable and truthful
  through D46 incident containment; none is deleted or rewritten to hide the
  violation.
- **D46-AC060:** Partial success across any accidental task/item/email/channel
  path cannot mark a sibling successful, read, complete, aware, delivered,
  resolved, or reminder-satisfied; each owner is repaired from its own evidence.

### Tasks Hub, Phase 17, future channels, and Inngest boundaries

- **D46-AC061:** Tasks Hub is work presentation/coordination, not a
  communication channel or scheduler. D46 cannot be implemented as a task
  retry, due date, recurrence, snooze, queue move, comment, or assignee edit.
- **D46-AC062:** Every browser, API, bulk, import, AI, support, service, worker,
  and generic task mutation attempting to set a D43 source-backed task reminder,
  due/overdue state, priority-from-age, or recurrence rejects at the server
  boundary, even if a generic task type supports that operation elsewhere.
- **D46-AC063:** Phase 17 may present/deliver only registered producer
  occurrences. It neither polls pending requests nor owns a clock, due intent,
  reminder eligibility, recurrence, cancellation, catch-up, or terminal result.
- **D46-AC064:** The Phase 17 catalog/manifest contains no D46 stable key or
  reminder step now; a future key cannot become Live until its source occurrence
  and every presentation/channel dependency pass reviewed generation proof.
- **D46-AC065:** Neither `holder_access_review_requested_v1` nor
  `access_request_responsibility_updated_v1`, their `staff_in_product` members,
  D45 `staff_email` members, family plan, preferences, publications, or provider
  intents may be reused, replayed, renamed, or version-aliased as a reminder.
- **D46-AC066:** A future reminder with unchanged reminder business meaning
  uses one stable Phase 17 message key bound to one producer/source-owned
  occurrence across its reviewed presentation/delivery steps; changing only
  channel does not mint another source occurrence, while changed business
  meaning requires a successor key.
- **D46-AC067:** Future in-product, email, push, Slack, Teams, Google Chat, SMS,
  or another step must separately prove exact destination authority,
  installation/credentials, consent/preference/suppression, safe renderer and
  action, urgency/quiet-time behavior, provider identity/outcome, privacy/
  retention, accessibility, operations, rollout, and shutdown.
- **D46-AC068:** One future channel's disabled/unready/failed/engaged/delivered
  state cannot create, cancel, retry, complete, or widen another channel or the
  source reminder occurrence; required/optional step semantics are explicit in
  the reviewed future contract.
- **D46-AC069:** No generic `channels[]`, notification Boolean blob, arbitrary
  provider map, universal payload, workflow canvas, Tenant-authored rule,
  webhook target, fallback order, or “render once everywhere” abstraction is
  introduced for future reminders.
- **D46-AC070:** Inngest availability, run state, retries, event deduplication,
  step memoization, concurrency, or retention has zero effect on current D43/
  D44/D45 meaning and cannot become the only recovery path for a future source
  occurrence.

### Future temporal admission package

- **D46-AC071:** Before reopening D46, the proposal identifies a verified user
  and workflow problem, the affected request kind/cohort, why existing durable
  surfaces are insufficient, evidence quality/limits, and the strongest no-
  reminder/no-build alternative.
- **D46-AC072:** The governing source names one exact temporal fact and owner
  and explains why crossing it makes new attention truthful; notification
  convenience, request age, task age, provider failure, or generic industry
  practice alone is insufficient.
- **D46-AC073:** D46 does not decide that a validated Tenant cadence without a
  due/expiry/risk/other source lifecycle fact qualifies. D47 must resolve that
  trade-off before such a cadence can authorize any artifact.
- **D46-AC074:** A future contract fixes the clock origin as a durable source-
  owned instant/state transition and defines whether edits, corrections,
  reopens, route changes, source successors, or policy changes preserve or
  replace it.
- **D46-AC075:** A future contract chooses and justifies exact absolute-instant
  semantics or exact local-calendar semantics; words such as “day,” “week,”
  “business day,” “midpoint,” “before,” and “after” remain non-executable until
  precisely defined.
- **D46-AC076:** If calendar semantics are used, the future contract names the
  authoritative timezone, persisted timezone identifier/revision posture,
  tzdb-update behavior, ambiguous/nonexistent-local-time rule, and display
  versus execution distinction.
- **D46-AC077:** If weekends, holidays, ministry workdays, local cutoffs, or
  business calendars matter, the future source owns a bounded versioned
  calendar and change policy; neither Phase 17 nor an executor guesses from
  locale, address, user device, or Tenant branding.
- **D46-AC078:** The future contract defines exact minimum/maximum cardinality,
  whether one occurrence or recurrence is permitted, recurrence anchor,
  successor identity, stop condition, and whether repeated attention is
  prohibited; no nullable interval or open-ended loop expresses policy.
- **D46-AC079:** The future contract enumerates valid states/transitions,
  terminal/cancellation/suppression reasons, request/source/recipient/policy
  change behavior, correction path, and immutable historical evidence; invalid
  state combinations are structurally rejected.
- **D46-AC080:** The future proposal defines prospective cutover, existing-
  request treatment, no-backfill or explicitly justified bounded catch-up,
  mixed-version compatibility, activation order, blast radius, and safe
  rollback before any writer or schedule is deployed.

### Future occurrence, authorization, idempotency, delivery, and failure proof

- **D46-AC081:** A future reminder occurrence keys the exact Tenant,
  environment, request kind/version, immutable D43 request/source occurrence,
  ratified temporal-contract version, source temporal fact/head, and producer
  fence using composite same-scope relations; no polymorphic bare ID is accepted.
- **D46-AC082:** At future occurrence-commit time, Phase 12 re-proves that the
  exact request is still `pending_review`, the exact source remains current,
  the temporal condition is satisfied under its pinned semantics, and no
  terminal/cancellation/suppression fence applies.
- **D46-AC083:** Any future personal attention candidate starts from the exact
  then-current D44 recipient generation and independently re-proves current
  same-Tenant assignment/Party/role/surface, source visibility, capability/
  ceiling/floor, requester exclusion, and privacy; it may only narrow.
- **D46-AC084:** Terminal, withdrawn, resolved, no-longer-applicable,
  cross-Tenant, requester-self, ended/recreated-assignment, ineligible,
  unauthorized, proved-zero, partial, stale, contradictory, corrupt, or
  indeterminate proof produces no future personal reminder candidate and no fallback.
- **D46-AC085:** The future source transaction commits its temporal occurrence/
  receipt and an identifier-only product dispatch/projection handoff atomically
  before downstream work. Phase 17 compiles the permitted plan and Phase 6 owns
  recipient communication intents, preparation, provider handoff, and delivery
  evidence; downstream failure cannot erase the source occurrence or change the
  request.
- **D46-AC086:** Product database uniqueness, immutable semantic input hashes,
  expected-head compare-and-swap, finite member counts/digests, claims, and
  receipts—not scheduler/provider/event dedupe—own future replay safety.
- **D46-AC087:** Exact replay of the same future occurrence and complete
  immutable candidate set returns the prior receipt/members; concurrent exact
  submissions converge without duplicate attention.
- **D46-AC088:** Changed clock fact, request/source head, recipient membership,
  contract, plan, content, channel, destination, or cardinality under an
  occupied future identity hard-conflicts. A lawful repeat/successor requires a
  source-authorized new occurrence identity under explicit cardinality rules.
- **D46-AC089:** The future contract defines crash-before/after-commit,
  early/late wake, missed wake, downtime, deployment pause, clock skew, lease
  expiry, executor replacement, stale policy, and catch-up behavior without
  scanning all requests, blind replay, or changing the source instant.
- **D46-AC090:** External submission, provider timeout/possible acceptance,
  duplicate/reordered webhook, channel outage, bounce/complaint/suppression,
  and provider-idempotency-window expiry reconcile through the future channel's
  product ledger; none proves awareness or authorizes a replacement occurrence.

### Named-monitor behavior, research evidence, and humane measurement

- **D46-AC091:** `d46_automatic_reminder_occurrence_total` remains zero; any
  nonzero source/item/task/communication/provider occurrence caused only by
  D43 age is a release-blocking/production incident, not evidence the feature works.
- **D46-AC092:** `d46_initial_attention_reused_as_reminder_total` remains zero;
  any D44 key/member, D45 intent/provider key, task ID, item ID, or engagement
  state reused for repeated attention triggers containment and identity repair.
- **D46-AC093:** `d46_age_only_projection_mutation_total` remains zero; any task
  due/priority/reminder, item unread/badge/group, route, request, grant, or
  source mutation caused only by elapsed time blocks release or stops the writer.
- **D46-AC094:** `d46_dormant_artifact_total` remains zero across schema,
  generated registries, manifests, APIs, config, preferences, feature flags,
  queues, jobs, events, UI, and providers; any hit is removed before release.
- **D46-AC095:** `d46_unowned_clock_or_executor_total` remains zero; any Phase
  17, Tasks Hub, provider, generic workflow, cron, client, or Inngest clock/wait
  for D43 age is disabled and investigated.
- **D46-AC096:** `d46_cross_tenant_or_fallback_recipient_total` remains zero;
  any timer/metric/attention edge that crosses scope or selects a fallback
  recipient triggers security containment and disclosure assessment.
- **D46-AC097:** `d46_false_temporal_copy_total` remains zero; any **due**,
  **overdue**, urgency, countdown, reminder-off, snooze, escalation, or SLA
  language/style derived without a source fact blocks the affected surface.
- **D46-AC098:** `d46_individual_attention_scoring_total` remains zero; any
  per-person response/open/read/age/rank/performance/volunteer or employment
  metric is disabled, removed from outputs, audited for use, and purged where lawful.
- **D46-AC099:** Any substantiated missed-attention report triggers Product +
  UX triage, not an automatic reminder. Reports are classified by durable-
  surface access, routing, authorization, intentional deferral, and notification
  comprehension without copying protected request text. Further study requires
  a separately approved privacy-reviewed research brief.
- **D46-AC100:** No future D46 option is proposed from telemetry alone until a
  research pack follows a preregistered representative sampling/comprehension
  plan approved by Product, UX Research, IAM, Privacy, and Architecture, states
  its evidence limits, covers affected roles and mobile/assistive/low-bandwidth
  conditions, and names one candidate temporal policy with a Phase 12/source
  owner. The plan—not D46—justifies its sample and success criterion before
  collection. D47 decides whether the candidate qualifies; evidence triggers
  review, never implementation or a universal cadence claim.

### Migration, rollout, rollback, kill, and repair

- **D46-AC101:** D46 rollout first reconciles the negative contract and D46-R/
  AC trace anchors into governing docs/OpenSpec/design/tasks/tickets before any
  future implementation work is accepted; current runtime behavior remains unchanged.
- **D46-AC102:** No D46 schema migration, seed, backfill, enum/catalog
  registration, provider setup, secret, schedule, queue, worker, or external
  connection is run for v1.
- **D46-AC103:** Existing pending and terminal requests, D44 recipient
  generations, tasks, items, D45 plan/preferences/intents, generic task reminder
  fields, and contribution reminders are neither copied nor rewritten.
- **D46-AC104:** No dormant feature flag or kill switch is created merely for
  absent functionality. Existing source/task/item/email kill boundaries remain
  independent; a future reminder adds its own only with its ratified contract.
- **D46-AC105:** Before D46 documentation is considered implementation-ready,
  focused negative architecture/public-seam tests prove that age cannot reach
  a registered event, task mutation, item occurrence, email intent, provider,
  UI control, schedule, or executor and that existing attention still works.
- **D46-AC106:** If accidental reminder execution is found, the first response
  disables/fences the exact producer, claimant, schedule, and channel step
  without disabling D43 source lane/commands, D44 routing/task/item, D45 initial
  email reconciliation, or unrelated communications.
- **D46-AC107:** Rollback preserves immutable D43/D44/D45/task/item/audit/
  provider evidence, never rewinds a request/grant/authorization head, marks
  work handled, invents read/completion, or guesses a replacement recipient.
- **D46-AC108:** An accidentally provider-accepted external message is treated
  as non-retractable; unsubmitted material is suppressed/purged under its owner,
  provider evidence continues reducing safely, and no blind resend or automatic
  corrective message occurs.
- **D46-AC109:** Repair removes/ignores unauthorized due/reminder fields and
  active projections through a reviewed migration, restores each owner from
  authoritative source/identity evidence, preserves an incident audit, and
  never derives source truth from the accidental artifact.
- **D46-AC110:** A future ratified reminder rolls forward through new versioned
  source/contract/schema readers and deny paths before writer/wake/channel
  activation, uses prospective cutover by default, and never reinterprets D46
  v1 absence as historical reminder enrollment.

### Testability, traceability, proof, and decision hygiene

- **D46-AC111:** D46-R1–R30 and D46-AC001–AC120 retain the same identifiers and
  meaning in the decision log, glossary/ADRs, OpenSpec requirements/design/
  tasks, GitHub tickets, implementation, tests, deployment evidence, and release notes.
- **D46-AC112:** Positive public-seam tests prove a pending request remains in
  the authorized Access requests lane, the exact D44 task/item remain durable,
  lane-only remains usable, and D45 initial-email behavior remains independent
  across long elapsed time.
- **D46-AC113:** Negative tests cover every age/timestamp input and every
  browser/API/RPC/SQL/import/bulk/worker/support/AI/event/task/item/email/provider
  path and prove zero D46 artifacts, source changes, recipient widening, or
  protected-data egress.
- **D46-AC114:** Boundary/concurrency tests cover zero/one/three coordinators,
  requester exclusion, route/eligibility/source terminal races, duplicate
  attempted events, timestamp repair, grant expiry, deployment downtime,
  midnight/month/year/leap/DST/tzdb/timezone changes, and rebuild/reconcile paths.
- **D46-AC115:** Accessibility and UX proof covers administrator, coordinator,
  holder, no-access, lane-only, loading, stale, terminal, wrong-Tenant, mobile,
  zoom, keyboard, screen reader, forced colors, localization, CJK/RTL/bidi, and
  low-bandwidth states with no phantom reminder semantics.
- **D46-AC116:** Production-shaped architecture tests reject imports/calls from
  D43/D44/D45 to contribution reminder code, generic task due/reminder APIs,
  Phase 17 scheduling, provider schedule fields, Phase 34 generic waits, and
  Inngest timing functions.
- **D46-AC117:** Every named monitor records safe numerator, denominator,
  scope, contract/build version, observation window, and causal owner where
  applicable; alerts link to the exact runbook and never expose protected
  content or trigger user-facing automation.
- **D46-AC118:** Research and release evidence label verified repository facts,
  verified external facts, reasonable inference, product judgment, assumption,
  and unresolved unknown separately; a vendor default or correlation is never
  represented as a Core requirement.
- **D46-AC119:** D47 remains the one next unresolved decision: whether a
  validated Tenant cadence can ever qualify without an actual source due/
  expiry/risk/other lifecycle fact. D46 does not implement or imply either answer.
- **D46-AC120:** D46 v1 succeeds only when existing work remains complete and
  understandable, all prohibited artifact/egress/temporal monitors remain
  within their stated bounds, no user is promised a response deadline, and a
  future team can add a proved source-owned reminder through a new reviewed
  version without migrating a speculative placeholder.

## Named monitors

Every zero threshold below is a hard invariant. Research thresholds are only
triggers to investigate; they do not define due/overdue status, promise an SLA,
create a product requirement, or authorize implementation. No monitor may
create/reissue an item, task, email, provider call, recipient, urgency,
reminder, digest, escalation, or source mutation. No monitor may treat valid
D44 shared-lane-only operation as ownerless or score an individual.
These names are acceptance/evidence labels, not authorization for new v1
telemetry. Zero-artifact signals run through CI/release audit wherever possible;
operational rows may consume an already-permitted existing signal only. D46
adds no pipeline, table, event, job, scheduled snapshot, dashboard, or alert.
Any product-discovery study requires its own privacy-reviewed, time-bounded,
preregistered research plan before collection.

| Signal                                                | Threshold                                                                                                                                               | Owner                                           | Required response                                                                                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `d46_automatic_reminder_occurrence_total`             | Any occurrence/task/item/intent/provider request caused solely by D43 elapsed age                                                                       | Access Product + IAM + Notifications            | Block release or stop exact producer/claimant, quarantine unsubmitted work, preserve safe evidence, inspect any external disclosure, repair from source truth, and re-prove zero. |
| `d46_initial_attention_reused_as_reminder_total`      | Any reuse/replay/rekey of a D44 item/task identity or D45 intent/provider key as repeated attention                                                     | Data Integrity + Notifications + Communications | Fence the path, reconcile existing identities, suppress unsubmitted children, inspect duplicates, and require a new source occurrence before any future reconsideration.          |
| `d46_age_only_projection_mutation_total`              | Any task due/priority/reminder, notification unread/badge/group, route, request, grant, or source change caused only by age                             | Access Product + Tasks Hub + Notifications      | Stop writer, restore each projection from its owner, preserve incident audit, and add the missing negative public-seam test.                                                      |
| `d46_dormant_artifact_total`                          | Any D46 field/table/enum/key/step/plan/preference/flag/API/event/job/queue/provider template/UI control                                                 | Architecture + Data Platform + Product          | Block release, remove the artifact and compatibility claim, verify no data was written, and keep only the documented temporal admission package.                                  |
| `d46_unowned_clock_or_executor_total`                 | Any Phase 17, Tasks Hub, provider, generic workflow, cron, client, or Inngest clock/wait over D43 age                                                   | Architecture + Platform SRE                     | Disable schedule/function, preserve identifier-only diagnostics, verify no occurrence/delivery escaped, and reassert source ownership.                                            |
| `d46_cross_tenant_or_fallback_recipient_total`        | Any age/metric/timer/attention edge crosses scope or selects a fallback/original grantor/admin/role/address                                             | Security + IAM + Privacy                        | Contain affected path, assess disclosure, suppress unsubmitted external work, repair composite scope/recipient resolver, and re-prove uniform denial.                             |
| `d46_false_temporal_copy_total`                       | Any due/overdue/urgency/countdown/reminder-off/snooze/escalation/SLA presentation without a ratified source fact                                        | UX + Access Product + Accessibility             | Block affected surface, remove false semantics from visible and accessible copy/style, re-run comprehension/accessibility proof, and do not substitute another number.            |
| `d46_valid_lane_only_mislabeled_ownerless_total`      | Any valid D44 lane-only/zero/indeterminate route produces an ownerless warning, fallback, score, or reminder                                            | Access Product + IAM                            | Remove warning/action, restore complete source-lane behavior, correct telemetry vocabulary, and re-test zero/indeterminate routing.                                               |
| `d46_generic_task_reminder_accept_total`              | Any browser/API/bulk/import/support/AI/worker task operation accepts a reminder/due/recurrence mutation for a D43 source-backed task                    | Tasks Hub + Security                            | Reject/fence generic mutation, inspect affected rows, restore source projection, and add task-contract deny fixtures.                                                             |
| `d46_d45_resend_or_fallback_total`                    | Any age/email failure/provider state triggers D45 resend, new key, recipient, or another channel                                                        | Communications + Email Platform                 | Stop dispatch, retain provider indeterminate/no-resend fences, inspect duplicates/exposure, and repair only the existing D45 intent.                                              |
| `d46_phase17_repeat_item_total`                       | Any current D44 item is cloned, reissued, marked unread again, or rebadged as new solely from age/read state                                            | Notifications + Data Integrity                  | End/quarantine invalid projection, preserve engagement history, restore one occurrence, and repair applicability/grouping logic.                                                  |
| `d46_inngest_payload_or_wait_total`                   | Any D46 event/function/run/sleep/schedule exists, or any Inngest payload contains request/protected/recipient/channel facts                             | Platform SRE + Security                         | Disable function/event, purge prohibited payload copies under policy, assess exposure, and confirm product contracts remain recoverable without it.                               |
| `d46_monitor_protected_data_egress_total`             | Any D43/D40/provenance/person/address/raw-ID/provider-body fact enters monitor/log/trace/analytics/export/AI                                            | Privacy + Security + Data Platform              | Disable consumer/writer, quarantine or purge copies where lawful, assess disclosure, repair allowlist and add egress proof.                                                       |
| `d46_individual_attention_scoring_total`              | Any person-level age/response/read/open/click/delivery/rank/workload/performance metric is calculated or exposed                                        | Privacy + Product Governance                    | Disable and remove output, audit use, purge derived data where lawful, notify governance owner, and restore aggregate product-health-only telemetry.                              |
| `d46_authorized_source_lane_availability_error_total` | Any currently authorized D43 row is absent from Access requests solely because personal routing/task/item/email is zero, failed, read, or unavailable   | Access Product + IAM + SRE                      | Restore source-lane read model, disable projection dependency, reconcile safely, and verify lane-only plus failure fixtures.                                                      |
| `d46_source_actionable_visibility_drift_total`        | Any current recipient's D44 item leaves Needs attention solely because it was read/aged, or archive succeeds while source remains actionable            | Notifications + Access Product                  | Restore ADR-0027 policy state, repair engagement reducer, preserve user action history, and re-test current/terminal transitions.                                                 |
| `d46_substantiated_missed_attention_report`           | Any permission-safe report substantiated as missed despite the then-current source/lane/routing/IA surfaces                                             | Access Product + UX Research                    | Triage the cause, repair a verified source/lane/routing/IA defect, or approve a privacy-reviewed research brief; never infer a cadence or send automatically.                     |
| `d46_temporal_research_brief_approved`                | Product, UX Research, IAM, Privacy, and Architecture approve a preregistered representative sampling plan and name one candidate source temporal policy | Same approving group                            | Conduct the bounded study and return to D47/D46-successor review; approval does not qualify the policy, choose a cadence, or authorize implementation.                            |
| `d46_no_deadline_comprehension_criterion_failed`      | Any separately approved moderated study misses its preregistered criterion or finds a participant reasonably inferred Due/Overdue/SLA                   | UX Research + Access Product                    | Revise existing source/task/item IA/copy, document the evidence limit, and retest without inventing reminder UI.                                                                  |
| `d46_accessibility_regression_total`                  | Any affected source/task/item/settings state fails required names/focus/keyboard/reflow/zoom/contrast/non-color/status/RTL/plain-language proof         | Accessibility + UI owners                       | Block related release, repair the shared primitive/surface, and repeat automated plus manual assistive-technology proof.                                                          |
| `d46_future_artifact_without_admission_pack_total`    | Any future reminder artifact appears before source fact, D47 result, clock/cardinality/failure/channel/privacy/rollout proof is ratified                | Architecture + Product Governance               | Freeze work, remove or quarantine the artifact, reconcile governing docs, and restart only through the reviewed future admission sequence.                                        |

## Migration, rollout, rollback, and repair

### V1 rollout order

1. Record D46's exact no-reminder decision, requirements, acceptance criteria,
   monitors, and D47 boundary in the decision log and governing artifact chain.
2. Reconcile Phase 12, ADR-0026/0027/0183, Phase 17, Tasks Hub, and D45 language
   so no document implies that task age, notification engagement, email failure,
   grant expiry, Phase 17, or Inngest owns D46 timing.
3. Add focused deny/architecture proof that no D46 field/key/step/config/API/
   event/job/UI/provider path exists and generic task/contribution reminder
   machinery cannot attach to D43 source-backed work.
4. Prove positive recovery remains complete: the Access requests source read
   model always remains complete; each current D44 personal recipient's task
   and required source-actionable item, optional D45 initial-only email, and
   holder status still behave correctly across long elapsed time and failures.
5. Use CI/release-audit zero-artifact checks and deliberate, privacy-reviewed,
   time-bounded research over already-permitted source facts. D46 activates no
   telemetry pipeline, table, event, job, dashboard, alert, or required snapshot.
6. Perform no schema/config/data migration, backfill, schedule, secret setup,
   feature flag, provider registration, or canary reminder. There is no runtime
   feature to enable.
7. Reopen design only when named evidence thresholds and a verified source
   temporal requirement exist; D47 must first decide whether cadence alone can
   ever qualify.

### Migration and upgrade rules

- Existing generic task due/reminder fields, contribution reminders,
  notification clocks, support digests, provider schedules, and Inngest jobs do
  not migrate, infer, seed, or dual-write D46 state.
- No existing pending request is enrolled, stamped, scheduled, or treated as
  having missed a reminder. Absence is not a legacy default row.
- Unknown future reminder fields/keys/steps/events remain non-executable in a
  mixed deployment. Old code cannot interpret a future version by convention.
- A future schema generation is additive and prospective by default, with
  readers/deny paths before writers. Historical catch-up requires its own
  explicit evidence and cannot be smuggled in as migration repair.

### Rollback and kill

- V1 has no D46-specific runtime or feature flag to roll back. Rolling back
  documentation must not revive generic reminder behavior.
- If an accidental implementation exists, kill/fence the exact source producer,
  schedule, claim, projection, and external channel independently. Keep D43
  source lane/commands, D44 routing/task/item, D45 initial-email reconciliation,
  and unrelated channels available.
- Stop and purge unsubmitted prepared material under its governing retention.
  Continue safe evidence reduction for any provider-accepted message; it is
  non-retractable and never permits a replacement.
- Preserve immutable source, recipient, task, engagement, communication, and
  incident evidence. Do not delete/rewind heads, fabricate read/completion,
  change access, or send an automatic correction.

### Repair

- Identify the accidental artifact by exact Tenant/environment/source/request/
  recipient/channel identity; never scan or mutate broadly from an age range.
- Quarantine invalid due/reminder rows and active projections, then remove or
  ignore them through a reviewed forward migration. Restore source/task/item/
  email state only from their authoritative owners.
- Reconcile accepted/indeterminate provider work against the sealed existing
  envelope; never rekey, rerender, reroute, or blind-resend.
- Correct any false **due/overdue/reminder** UI and accessible semantics without
  substituting a different arbitrary threshold. Preserve honest current source
  status and incident history.
- If monitoring/research data contains protected or person-level detail,
  disable the pipeline, assess exposure, purge where lawful, repair the closed
  aggregate contract, and do not use the contaminated evidence for D47.
- A future approved reminder is a roll-forward new source/contract generation,
  not revival or reinterpretation of an accidental/dormant D46 artifact.

## Ruthless synthesis

### Resolved before D46 is recorded

1. **No reminder is an explicit capability boundary.** It means no occurrence,
   state, clock, configuration, UI, delivery, or dormant placeholder—not merely
   a default-Off switch.
2. **Current recovery remains complete.** Access requests is the complete
   source-owned recovery read model over authoritative D43 records; for each
   current D44 personal recipient, that recipient's task and required source-
   actionable item remain durable. D45 remains one optional initial email.
3. **Age is evidence, not policy.** It may support aggregate research but cannot
   label work overdue, route it, notify anyone, or score a person.
4. **The grant end is not the review deadline.** It may make D43 no longer
   applicable and does not imply a pre-expiry reminder.
5. **No projection or executor owns time.** Tasks Hub, Phase 17, providers,
   generic workflows, and Inngest remain downstream and replaceable.
6. **Future extensibility is clean.** The seam is a new versioned source
   occurrence plus reviewed fixed delivery steps, not a placeholder or generic
   scheduler/channel engine.
7. **Cadence-alone qualification remains genuinely unresolved.** D47 must decide
   whether Tenant preference can ever be the source clock absent a lifecycle
   fact; D46 does not smuggle in an answer.

### Requirements to carry into specification and design

- D46-R1–R30, D46-AC001–AC120, the ownership/invariant matrices, zero-effect
  race table, named monitors, and rollout/repair contract.
- Explicit negative generated-registry/API/schema/task/UI/executor boundaries,
  including no current key, step, event, preference, due field, or job.
- The future temporal admission package: source fact/owner, clock/calendar,
  lifecycle/cardinality, current reproof, product idempotency, failure/catch-up,
  channel independence, privacy, UX, migration, and kill/repair.
- Clear separation of verified facts, product judgments, assumptions, and
  evidence thresholds. No metric or vendor default silently changes the contract.

### Implementation safeguards required now

1. Keep D43 source-backed work excluded from generic task reminder/due APIs.
2. Keep D44 source-actionable items stable after read and source lane complete
   through zero/failed personal projections.
3. Keep D45 email initial-only and provider evidence independent.
4. Reject unregistered reminder fields/keys/events/jobs rather than storing
   tolerant metadata for future use.
5. Check zero-artifact invariants through CI/release audit. Conduct aggregate
   product research only through a separately approved, privacy-reviewed,
   time-bounded plan over already-permitted source facts; D46 creates no runtime
   monitor, pipeline, dashboard, alert, or required snapshot.

### Risks permitted only under named monitoring

- **Missed attention:** signal `d46_substantiated_missed_attention_report`;
  threshold any substantiated, permission-safe report that all current recovery
  surfaces were missed; owner Access Product + UX Research; response triage the
  source/lane/routing/IA cause and approve a research brief if warranted, never
  send automatically.
- **Recovery comprehension:** signal
  `d46_no_deadline_comprehension_criterion_failed`; threshold any separately
  approved moderated study that misses its preregistered comprehension
  criterion or finds a participant reasonably inferred Due/Overdue/SLA;
  owner UX Research + Access Product; response repair IA/copy and retest without
  phantom reminder UI.
- **Evidence readiness:** signal `d46_temporal_research_brief_approved`;
  threshold Product, UX Research, IAM, Privacy, and Architecture approve a
  preregistered representative sampling plan and name one candidate source
  temporal policy; owner the same group; response conduct the study and return
  to D47/D46 successor review, not implementation or automatic activation.
- **Unadmitted artifact:** signal `d46_release_audit_artifact_found`; threshold
  any prohibited field/key/step/config/API/job/UI/provider artifact found by
  CI or release audit; owner Architecture + affected owner; response block the
  release, remove the artifact safely, and re-prove zero.

## Exact final D46 decision to record

> D46 adopts Option 1 with required safeguards: Core creates no automatic
> reminder for D43 holder access-review requests in v1. Elapsed time alone has
> no business effect and creates no due/overdue/urgency state, source event,
> task mutation, duplicate/re-unread notification, D45 resend, communication
> intent, channel delivery, provider call, escalation, digest, or access/request
> mutation.
>
> D43 Phase 12 remains request/source truth; D44 remains recipient truth and
> valid shared-lane-only operation; ADR-0183 Tasks Hub remains a source-backed
> work projection; ADR-0027 keeps current actionable attention discoverable;
> D45 remains optional initial email only. The direct grant end may make the
> request no longer applicable but is not a review deadline. Staff may follow
> up deliberately through independently governed human practice, but D46 adds
> no generic product **Send reminder** action.
>
> D46 adds no schema field/table, key, enum, manifest/Delivery Step, Tenant plan,
> recipient preference, API/event/queue/job, feature flag, provider template,
> UI placeholder, cron, Phase 17/Phase 34 timer, or Inngest function/wait.
> Existing source timestamps may remain under their owners; D46 adds no age
> severity, countdown, reminder-off control, or implied SLA. Aggregate age and
> missed-attention evidence may trigger research only and cannot label a request
> late, treat shared-lane-only as ownerless, score a person, or notify anyone.
>
> A future reminder requires a new evidence-backed source decision and one
> stable source-owned occurrence with exact clock/calendar, lifecycle,
> cardinality, current request/recipient/auth/privacy reproof, cancellation,
> product idempotency, missed-wakeup/failure/catch-up, migration, monitoring,
> kill, rollback, and repair semantics. Presentation/delivery channels then
> require separately reviewed fixed steps; D45 initial-email authority cannot
> authorize reminder email. Inngest may later execute identifier-only product-
> owned due work but never owns the clock, occurrence, human wait, recipient,
> channel, idempotency, or outcome. D47 separately decides whether a validated
> Tenant cadence can ever qualify without an actual source lifecycle fact.

## D47 — Can Tenant cadence alone ever justify a future reminder?

**Historical resolution (2026-08-29):** D47 selected Option 1: an evidence-
admitted, bounded, Tenant-default-Off cadence may later qualify as separate
Phase 12 source policy for at most one courtesy occurrence without deadline or
access meaning. D47 activates no policy, reminder, schema, key, worker, or UI;
current-request impact, recipient-generation binding, clock/calendar, and
channels remain later decisions.

### Why this needs a separate decision

Suppose representative research later finds that Hope Mission's coordinators
want one nudge after a bounded interval because many serve part-time. The D43
request still has no due date, expiry of its own, risk transition, SLA, or
automatic terminal effect at that point. A reminder can truthfully mean **this
is still waiting for review** without meaning **this is overdue**, but only if
Core is explicit about who owns that cadence and prevents the setting from
becoming a generic scheduler or implied deadline.

D47 decides what may qualify as the temporal authority for a future D46
successor. It does not choose an interval, calendar unit, channel, content,
recipient, or implementation. The recommended option bounds the source result
to at most one reminder; any repeating cadence or escalation remains a later
decision. Every option keeps current D46 v1 at no automatic reminder until its
evidence and complete future contract exist.

### Option 1 — validated bounded Tenant cadence may become source policy — recommended

After independent representative evidence, Phase 12 may define one closed,
source-owned Tenant policy whose default is **Off** and whose remaining choices
are a small reviewed set. A chosen cadence may create at most one reminder
occurrence for a still-current request even without a due/expiry/risk fact. The
reminder is an attention nudge only: it creates no **Due**, **Overdue**, SLA,
priority, escalation, terminal default, or access consequence. The exact
choices and calendar semantics require a later decision and proof; D47 does not
preselect them.

**Example:** validated research might eventually support **Off** plus one or
two bounded intervals. Hope Mission selects one. If the request and current
recipient still qualify at the exact source-owned point, Core creates one new
reminder occurrence; otherwise it creates none. The request remains equally
valid before and after that nudge.

**UX/impact:** fits differing nonprofit/volunteer rhythms while staying quiet
by default and avoiding a fake deadline. It does add one carefully placed
Tenant choice, prospective cutover, exact calendar/failure semantics, and a
risk that users may still infer urgency unless copy/comprehension proof is strong.

### Option 2 — cadence alone is insufficient; require a lifecycle fact

A future reminder requires an objective source lifecycle fact such as a due
instant, expiry/risk transition that makes prior attention meaningful, or
another explicit source obligation. A Tenant cadence may only choose or narrow
a bounded offset inside that ratified lifecycle window; it cannot create the
occurrence by itself.

**Example:** if a future source says a review must close on 30 September, a
bounded Tenant choice might select one permitted reminder offset before that
date. Without such a source obligation, no setting appears and no timer runs.

**UX/impact:** strongest semantic restraint and smallest configuration/operation
surface, but ministries cannot request one evidence-backed nudge solely because
their teams work on different rhythms.

### Option 3 — one evidence-backed product-wide cadence

After cross-Tenant research, Core defines one fixed one-time cadence for every
eligible source occurrence, with no Tenant configuration. It remains a nudge
only and has no terminal/access effect.

**UX/impact:** smallest future settings surface, but a universal rhythm is least
likely to fit volunteer, international, holiday, and multi-time-zone ministry
work. It also makes Core rather than the Tenant/source policy the cadence owner.

### Recommendation and exact question

**My recommendation is Option 1 — a validated bounded Tenant cadence may become
source policy.** The strongest objection is real: official IAM/CMS examples
often anchor reminders to review duration or task due date, and a weak cadence
would invent urgency. The decisive distinction is that a future Option 1
reminder would not claim a deadline or source consequence. It would be one
explicit source-owned attention occurrence, independently validated for the
nonprofit workflow, Off by default, bounded, prospective, nonrecurring, and
fully separated from channels. That gives ministries flexibility without
turning Tasks Hub, Phase 17, or Inngest into a generic clock. If evidence cannot
support clear nudge-not-deadline comprehension and exact calendar/operational
semantics, the policy remains absent under D46.

Which D47 policy should Core record: **Option 1 — an independently validated,
bounded, Off-by-default Tenant cadence may itself become Phase 12 source
policy**, **Option 2 — cadence alone is insufficient and may only narrow an
objective source lifecycle**, or **Option 3 — one evidence-backed product-wide
cadence**? You may amend any option.

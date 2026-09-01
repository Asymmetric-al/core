# Phase 24 D47 — Bounded Tenant Access-Review Reminder Cadence Eligibility

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — an independently validated, bounded,
Off-by-default Tenant cadence may later qualify as Phase 12 source policy for
at most one D43 access-review reminder even though the request has no due date,
expiry, risk transition, SLA, or no-response consequence.  
**Scope:** Eligibility and permanent architecture only: evidence threshold,
source ownership, policy versioning, one-occurrence cardinality, future
temporal semantics, recipient-binding questions, UX, authorization, RLS,
idempotency, failure/recovery, replaceable execution, rollout, and proof. D47
does not choose a cadence, calendar, channel, message, key, schema, worker, or
runtime implementation.  
**Method:** `/grill-with-docs`, D43–D46 and governing Core artifact review,
current code/OpenSpec boundary audit, refreshed official IAM/CMS/CRM/nonprofit
CRM/accessibility/database/executor evidence, and the required 22-category
adversarial pass.  
**Verification note:** Broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, production-build, and `git diff --check`
verification remains deferred until the Grill ends. This document receives
only focused structural and identifier-continuity checks.

> **Post-D48 historical note (2026-08-29):** Earlier statements that D48 is
> unresolved or next preserve the D47-time record. D48 has since selected first-
> activation admission only for genuine D43 request creations ordered after the
> first successful non-Off Phase 12 policy boundary; pre-boundary episodes remain
> excluded and exact replay preserves the original disposition. Later policy-
> edit effects remain open. D49 has since bound one exact current D44
> responsibility cohort atomically at the source occurrence and permits later
> narrowing only. D50 has since selected one immutable request-anchored elapsed
> eligibility instant from exact seconds and a trusted source-created instant
> captured after D48 serialization; it is no due date or delivery promise. D51
> has since added source-fenced Off and prospective re-enable; D52 has fixed
> finite half-open source usefulness and no catch-up; D53 now keeps every
> candidate absent until an evidence-qualified proposal later passes a separate
> full activation. D54 local presentation is next. D48–D53 activate no reminder
> or artifact.

## Final disposition

**Accept with required amendments.**

Option 1 is a defensible modern product policy, but not because comparable
products prove that an arbitrary no-deadline timer is good practice. Current
Microsoft Entra, Okta, SailPoint, Contentful, HubSpot, Givebutter, Salesforce,
and Blackbaud examples overwhelmingly anchor reminders to a finite review
window, campaign end, task due date, or other explicit source time. They prove
the source-ownership and bounded-notification patterns; they do **not** prove a
particular D43 cadence or that cadence without a lifecycle consequence will
help ministries.

The founder's qualification—**independently validated**—is therefore material.
A cadence may become a truthful source policy only after representative
ministry research shows that one courtesy nudge solves missed attention without
being understood as a deadline, compliance obligation, performance measure, or
threat to access. Until a later feature decision satisfies that evidence gate
and the complete D46 admission package, D47 changes documentation only and
creates nothing executable or visible.

The unqualified option would be brittle if it allowed a free-form number,
“working days” without a calendar, mutable policy rows, implicit/unbounded
existing-request backfill, one reminder per coordinator, route-change replay, a task due date,
an unread reset, D45 email reuse, a generic scheduler, or Inngest as the clock.
It is accepted only with these amendments:

- D47 is a permission to **consider** one future source policy, not permission
  to implement it; there is no setting, key, enum, column, row, event, job,
  feature flag, UI placeholder, or hidden default now;
- future admission requires independent, representative, preregistered product
  research plus comprehension and harm checks; vendor defaults, support volume,
  record age, or one founder/customer preference alone are insufficient;
- if later activated, missing, unknown, legacy, incompatible, or unproved
  policy resolves to Off; choices are a small code-owned finite set, never a
  free-form duration, cron, formula, rule, workflow, or Tenant calendar DSL;
- the policy may authorize at most one source reminder occurrence per exact
  D43 request episode, not one per coordinator, channel, task, retry, route
  revision, outage, read state, or policy revision;
- that occurrence means only **this access review is still waiting**. It creates
  no Due/Overdue state, deadline, SLA, urgency, priority, escalation,
  auto-decision, default response, grant mutation, or reviewer-performance fact;
- Phase 12 owns the future policy revision, source request episode, temporal
  eligibility, occurrence identity, cancellation, and current-usefulness fence;
  Tasks Hub, ADR-0027, Phase 17, Phase 6, providers, analytics, clients, and
  Inngest remain projections or executors;
- D47 does not decide which pending requests a later policy affects or how
  policy edits affect already-admitted work. D48 must choose new-request-only,
  deliberate current-work application, or automatic original-age inclusion;
  further impact/version rules must be settled before runtime rather than
  inferred from D44/D45 precedent;
- exact duration, elapsed-versus-calendar semantics, source timezone, DST,
  tzdb, weekend/holiday behavior, late-usefulness window, and catch-up policy
  remain required later decisions. **Working days** is forbidden unless a
  separately governed calendar proves every included/excluded day;
- D44's zero-to-three recipient model remains independent from source
  occurrence cardinality, but D47 does not choose whether future reminder
  members bind at request creation, candidate time, occurrence commit, or
  delivery. D49 must settle zero/indeterminate and route-change behavior before
  any presentation/delivery artifact exists;
- D45 remains initial email only. No future reminder channel is authorized by
  D47; in-product, email, push, Slack, Teams, Google Chat, digest, or any other
  presentation/delivery requires its own reviewed Phase 17/6 step and channel
  contract over the same one source occurrence;
- the future product database—not executor deduplication—must own permanent
  semantic uniqueness, immutable policy/source evidence, claims, cancellation,
  audit, and reconciliation under same-Tenant composite keys and complete RLS/
  privileged-path parity; and
- current UX stays silent. A future source setting, if later earned, belongs in
  the existing **People & access → Access requests** settings context, not
  System Messages, Tasks, Notifications, or a workflow builder. It must use
  plain no-deadline copy, the exact impact semantics later selected through
  D48 and successors, accessible finite choices, and a fresh consequence preview.

These amendments make Option 1 a narrow, evidence-gated source capability
instead of a speculative reminder engine.

## Exact corrected decision

> D47 establishes only this future admission rule: after independent,
> representative, privacy-reviewed research validates one courtesy-attention
> cadence for D43 work, a later Phase 12 feature decision **may** register one
> code-owned, bounded, Off-by-default Tenant cadence policy. The policy may
> authorize at most one source reminder occurrence for an exact still-current
> `holder_direct_grant_review` request episode even though no due date, expiry,
> risk transition, SLA, or no-response consequence exists. D47 itself creates
> no policy key, row, schema, stable message key, Delivery Step, preference,
> event, job, timer, feature flag, UI, or executable placeholder.
>
> Independent validation must cover representative small, staffed,
> volunteer-led, distributed, multi-time-zone, mobile/low-bandwidth, and
> accessibility-using ministry contexts relevant to the intended release. The
> research plan must be approved before data collection, distinguish missed
> attention from deliberate waiting, name its recruitment and analysis limits,
> test **still waiting** versus Due/Overdue/SLA comprehension, assess fatigue and
> pressure, and define success and stop criteria. A vendor pattern, one Tenant
> request, aggregate age distribution, click/open rate, anecdote, support ticket,
> or internally selected interval cannot independently qualify the policy.
>
> If a later implementation is earned, the effective policy is exactly Off or
> one value from a small versioned code-owned set. Absence, unknown version,
> invalid value, unsupported time semantics, stale authorization, partial read,
> mixed deployment incompatibility, or failed validation resolves to Off. There
> is no free-form number, unit, cron, recurring expression, business-calendar
> builder, quiet-hours engine, branching rule, recipient query, channel list,
> workflow graph, or Tenant-authored reminder text.
>
> The reminder's source meaning is exactly **one courtesy notice that this
> access review is still waiting**. The request is valid before and after that
> instant. The occurrence does not set or imply a due date; does not mark the request,
> task, coordinator, holder, or grant Due, Overdue, late, urgent, escalated, or
> noncompliant; change priority or sort severity; create a response promise;
> choose a default decision; approve, keep, remove, suspend, extend, or end
> access; score a coordinator; or change any D43 state. Only D43 source
> withdrawal, lawful keep/remove, or no-longer-applicable transitions end work.
>
> Source cardinality is one per exact `(Tenant, environment, D43 request
episode, stable courtesy-reminder class)`. Policy revision and reminder
> contract/render version are immutable inputs and part of semantic input hash/
> audit, but **not** occurrence uniqueness; changing a version can never mint
> another reminder for the same episode. The zero-to-three D44 personal recipients
> and any later channel children are members of that one occurrence; they are
> not separate source reminders. Retries, recipient count, coordinator route or
> eligibility changes, read/unread state, task engagement, delivery failure,
> provider ambiguity, policy edits, deployment, replay, reconciliation, or
> executor replacement cannot mint another source occurrence. Repeat reminders,
> digests, and escalation remain separate undecided meanings.
>
> Phase 12 owns the future immutable policy revisions, trusted effective
> cutovers, request-episode cohort, source time basis, candidate instant,
> occurrence identity, cancellation/supersession, current-usefulness predicate,
> and terminal audit. The D43 request, not its task or notification, is the
> authoritative work. D44 owns current personal responsibility. ADR-0183 owns
> the task projection, ADR-0027/Phase 17 own presentation and engagement, Phase
> 6 owns communication intents/outcomes, providers own provider evidence, and
> Inngest may only execute identifier-only product work. No downstream owner can
> recalculate or repair Phase 12 business time by convention.
>
> D47 deliberately does not decide which already-pending requests a later On
> policy affects. D48 must choose among new-request-only application, one
> deliberate previewed application to a current cohort, or automatic original-
> age inclusion and define that first-application cohort/baseline/cutover. Later
> impact decisions must define repeated save/edit and rollback consequences
> before any schedule exists. Until
> D48 is recorded, no request—new or current—is enrolled by D47, and no
> implementation may infer prospective, retroactive, widening, narrowing,
> rescheduling, cancellation, revival, or catch-up semantics from D44, D45, or
> another domain.
>
> D47 also does not choose a clock/calendar model. D50 must decide clock origin,
> duration/unit, absolute-versus-civil-time calculation, source timezone,
> stored-instant/rule evidence, tzdb handling, DST, leap/month boundaries,
> weekend/holiday behavior, policy-timezone changes, late usefulness, catch-up,
> and precision before any artifact exists. **Working days** remains an
> unresolved option, not an admitted phrase or implementation.
>
> Any later policy editor reuses D44's existing authority boundary: current
> same-Tenant Tenant-wide `permissions.manage_grants` plus the registered exact
> policy-management purpose, live scope/ceiling/floor, current Active Tenant
> Assignment, authorization epoch, and expected policy head. D47 creates no new
> capability. Coordinator membership, task or notification receipt, Owner/Admin
> label, D45/System Messages authority, support, service role, or original-
> grantor status grants nothing by itself.
>
> After D48–D50 settle impact, recipient, and clock semantics, a future source
> transaction must persist the completely proved policy/source temporal identity
> and product handoff atomically or neither. Claims must re-prove every fence
> those decisions ratify. D47 fixes only source ownership, zero-or-one episode
> cardinality, and fail-closed authority; it does not silently choose the claim
> instant, recipient-resolution instant, late behavior, or current-work effect.
>
> D47 does not choose how the one source occurrence binds to D44 recipients.
> D49 must decide whether membership is resolved at request admission,
> candidate time, occurrence commit, or presentation/delivery and must define
> continuing, removed, newly admitted, `proved_zero`, `indeterminate`, and
> retry behavior. Any answer must preserve D44's authority/no-cross-Tenant-
> fallback invariants and cannot allow route or recipient changes to create a
> second source occurrence for the same request episode.
>
> D47 authorizes no user-facing channel. A future reminder requires a separately
> reviewed stable Phase 17 meaning and fixed plan/profile generation. The
> existing D44 task is not duplicated, reprioritized, reopened, completed, or
> given a due/reminder field. The existing D44 in-product item is not cloned,
> marked unread, or rebadged by D47. D45 initial-email keys, plan, recipient
> preference, intent, rendered body, provider key, and outcome cannot send or
> suppress a reminder. Every future in-product/email/push/chat step independently
> proves current recipient/destination, content, consent/preference/suppression,
> privacy, idempotency, delivery evidence, accessibility, and shutdown.
>
> If later used, Inngest receives a versioned identifier-only wake or
> reconciliation request after product commit. It may sleep or scan candidate product
> work, but its run, event timestamp, wall clock, event/function idempotency
> window, cancellation, replay, trace retention, or dashboard is never source
> truth. Product uniqueness and claims survive more than the executor's
> deduplication window; cancellation is re-proved at the product boundary because
> an already executing step may finish; and a recovery scanner can reconstruct
> eligible candidate work from product records without depending on a sleeping run.
>
> Current UX remains unchanged and contains no disabled or coming-soon reminder
> control, countdown, age severity, status chip, sort priority, empty-state
> promise, or channel setting. If a later feature earns activation, its one
> compact source-policy control appears alongside Access request source/routing
> settings in **People & access → Access requests**. It leads with Off, offers
> only the reviewed finite choices, and states **If a review is still waiting
> after [choice], create one courtesy reminder. This does not set a due date or
> change access. How it is delivered is managed separately.** A fresh preview
> explains the exact current-versus-future and
> policy-edit effects selected through D48 and later impact decisions. The
> control is never duplicated in System Messages, Tasks, Notifications, or a
> workflow canvas; channel preferences remain in their own established homes.

## Evidence classification and modern-practice resolution

### Verified repository facts

- D43 owns one access-governance request with `pending_review` plus four closed
  terminal outcomes. It defines no due date, SLA, reminder, urgency transition,
  no-response decision, or timer. Submission never changes access.
- D44 keeps **People & access → Access requests** as the complete source lane and
  optionally routes co-equal responsibility to one-to-three current eligible
  coordinators. Tasks Hub and required staff in-product attention consume the
  same current recipient generation; zero/indeterminate recipients cause no
  fallback.
- D45 is one optional immediate **initial** email family, Tenant default Off,
  with recipient `inherit | disabled` narrowing. Widening is future-only;
  narrowing suppresses not-yet-provider-submitted optional email. Its meaning,
  plan, recipient, key, and provider evidence do not authorize reminders.
- D46 creates no automatic reminder and no dormant schema/config/catalog/UI/
  job artifact. It permits reconsideration only through a complete source-owned
  temporal admission package and left cadence-alone qualification to D47.
- ADR-0026 says producers own occurrence timing and cancellation while Phase 17
  exposes only fixed named plan steps. It expressly rejects Tenant-authored
  waits, formulas, recipient queries, and generic workflow graphs.
- ADR-0027 keeps source-actionable attention discoverable independent of read
  engagement. A new source occurrence may create a new child, but age/read
  state cannot clone or reopen the existing item.
- ADR-0183 makes Tasks Hub a source-backed work projection. Generic task due,
  reminder, completion, reassignment, snooze, or worker state cannot own D43.
- ADR-0184 and Phase 12 keep grants, requests, D44 responsibility, authorization
  epochs, and EffectiveAccess in Asym Postgres/authorization services; workers
  and projections cannot invent or repair them.
- Phase 17's `contribution_approval_reminder_v1` is a useful architecture
  precedent only because finance owns `contribution.approval_reminder_due@1`,
  `pending_since`, reminder sequence, due semantics, and escalation. Current
  finance code uses mutable `reminderHours`/`last_reminder_at`; it is not a D43
  implementation template.
- Workflow OpenSpec makes Inngest a replaceable durable executor. Product
  records, Tenant authorization, provider records, product dispatch ledger, and
  product work claims remain authoritative. Current Core reminder-like code is
  domain-specific; no current D43 `sleepUntil` runtime exists.

### Verified current external evidence

- Microsoft Entra configures review duration and end behavior, then sends
  reminders halfway through that explicit review. Its deployment guidance asks
  teams to decide frequency, notification, enforced timeline, no-response
  action, and resulting communication together. This supports source-owned,
  complete temporal policy and shows why D47 must not borrow the reminder while
  omitting the lifecycle semantics.
  [Create an Entra access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review),
  [plan access-review deployment](https://learn.microsoft.com/en-us/entra/id-governance/deploy-access-reviews)
- Okta Access Certification campaigns define a start time/timezone and duration;
  optional pending reminders are selected relative to the scheduled campaign
  end. Okta also bounds group reviewers and re-proves active/fallback reviewer
  behavior. This supports a bounded source campaign and separate notification
  choice, not a no-deadline D43 default.
  [Okta identity campaigns](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/create-user-campaign.htm)
- SailPoint certification campaigns have deadlines and send weekly reminders
  only while the certification remains active and unfinished; notifications can
  be disabled, and short campaigns do not receive the scheduled reminder. This
  supports current-state fences and bounded delivery but not D47's cadence by
  itself.
  [SailPoint campaign completion](https://documentation.sailpoint.com/saas/help/certs/completing_campaigns.html),
  [Certification Due template](https://documentation.sailpoint.com/saas/help/common/emails/et_certs_certdue.html)
- Contentful Tasks emails assignment and reminds two days before an optional
  due date. HubSpot binds individual task reminders to task due time and treats
  its opt-in daily digest as a separate feature prepared/sent in the user's
  timezone. These support source time, channel separation, and no reminder/
  digest conflation.
  [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/),
  [HubSpot task reminders and digest](https://knowledge.hubspot.com/tasks/task-reminders-and-daily-digest)
- Givebutter's current nonprofit CRM task experience separates centralized
  Tasks, optional deadlines, assignment email, and reminders that must be
  configured before the due date and only for one's own assignment. This is
  relevant nonprofit UX evidence, but its user-owned task deadline is not a
  safe authority model for D43 source-backed access governance.
  [Givebutter Tasks](https://help.givebutter.com/en/articles/9703441-how-to-manage-your-fundraising-to-do-list-with-tasks)
- Apple says notifications should be timely/high-value, avoid sensitive body
  content, and avoid multiple notifications for the same thing because users
  may disable all notifications. This supports one-occurrence cardinality,
  minimization, and channel restraint.
  [Apple notification guidance](https://developer.apple.com/design/human-interface-guidelines/notifications)
- PostgreSQL stores `timestamptz` internally as UTC and does not retain the
  originally supplied zone; IANA time-zone rules change over time. A future
  civil-time policy therefore must retain its zone/rule evidence separately
  instead of assuming a UTC instant preserves the human policy.
  [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html),
  [IANA Time Zone Database](https://www.iana.org/time-zones)
- PostgreSQL RLS checks existing rows with `USING` and proposed inserted/updated
  rows with `WITH CHECK`; table owners normally bypass unless RLS is forced.
  OWASP recommends deny by default and fresh authorization on every request.
  These support symmetric Tenant/source checks and privileged-path parity.
  [PostgreSQL `CREATE POLICY`](https://www.postgresql.org/docs/current/sql-createpolicy.html),
  [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- Inngest offers durable `sleepUntil` and future event timestamps, but event and
  function idempotency keys prevent duplicates for only 24 hours. Cancellation
  cannot stop a currently executing step or prevent new runs, and long sleeps
  may outlive normal trace visibility. It is suitable as a future executor only
  behind product-owned identity, cancellation, claims, and reconciliation.
  [Inngest delayed functions](https://www.inngest.com/docs/guides/delayed-functions),
  [idempotency](https://www.inngest.com/docs/guides/handling-idempotency),
  [cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation),
  [sleep trace limits](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)
- WCAG 2.2 and WAI-ARIA require reflow, visible/programmatic names, announced
  status, keyboard operation, and controls whose semantics match their choices.
  A future finite Off-plus-cadence choice should use native grouped controls and
  helper/impact text, not color, icon, hover, motion, or a mislabeled binary
  switch.
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
  [WAI-ARIA radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

### Reasonable inferences and product judgments

- **Inference:** A source-owned courtesy cadence can be truthful without a due
  date if the message says only that work is still waiting and every behavior
  excludes deadline/consequence semantics. Comparable vendors do not directly
  verify this; research must.
- **Product judgment:** Default Off and no current artifact are safer than a
  universal cadence because D44 already provides three durable recovery paths.
- **Product judgment:** One source occurrence per request episode is the
  smallest useful bound and avoids notification fatigue, route-churn replay,
  and an accidental recurrence engine.
- **Product judgment:** Code-owned finite choices are preferable to free-form
  numbers. Exact values and time semantics must be chosen from evidence in a
  later decision rather than frozen in D47.
- **Product judgment:** Current-work application, policy-edit effects,
  recipient binding, and clock semantics are consequential enough to require
  their own decisions rather than being inferred in D47.
- **Product judgment:** The source control belongs with Access requests because
  it defines when a source occurrence may exist. Channel enablement and personal
  delivery preference remain under System Messages/Notifications.

### Assumptions and unresolved unknowns

- **Assumption:** Representative ministries may value one courtesy nudge even
  when no formal deadline exists. No current repository or public vendor fact
  verifies that need for D43.
- **Unknown:** Which elapsed/calendar model, interval set, Tenant timezone, and
  late-usefulness window users understand consistently across ministry sizes
  and countries.
- **Unknown:** Whether one reminder improves lawful resolution versus merely
  increasing opens, pressure, opt-outs, support work, or off-platform action.
- **Unknown:** Whether route changes before/after cadence create user confusion
  despite the D44 responsibility-update path.
- **Required evidence:** independently reviewed qualitative workflow evidence,
  source data-quality proof, comprehension testing, accessibility testing,
  privacy/harm review, and a preregistered success/stop criterion. D47 approval
  alone does not satisfy it.

## Current behavior, intended behavior, and permanent path

| Area              | Current repository behavior                                                          | D47 intended contract                                                                            | Best permanent path                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| D43 source        | Pending/terminal source request; no clock or consequence at age.                     | Cadence may become source time only after independent validation and later feature ratification. | Add a versioned Phase 12 policy/occurrence generation only when earned; never reinterpret `created_at`.      |
| D44 routing       | Complete source lane plus optional one-to-three personal recipients.                 | Recipient count does not multiply source reminder cardinality; binding time remains undecided.   | D49 must choose request/candidate/occurrence/delivery-time membership and route-change outcomes.             |
| Tasks Hub         | Source-backed work projection; generic task code has reminder-like fields elsewhere. | Task never owns cadence, due state, occurrence, or retry.                                        | Keep one existing task; reject source-backed reminder/due mutations.                                         |
| Phase 17/D45      | Required initial in-product attention and optional initial email.                    | Reminder meaning/channel remain separate and unregistered now.                                   | Later reviewed stable source meaning plus fixed named steps; no D45 resend/rekey.                            |
| Time              | No D43 temporal computation.                                                         | D47 permits but does not select one future model.                                                | D50 selects elapsed/calendar semantics; later feature stores exact source instant and rule evidence.         |
| Workflow          | Inngest executes product-owned identifier-only work.                                 | Executor is optional and replaceable.                                                            | Product candidate intent/claim/reconciliation first; Inngest sleep/scan only as adapter.                     |
| Settings UX       | No reminder control.                                                                 | No placeholder now; future compact source control only if earned.                                | One Access requests card, finite choices, Off default, no-deadline copy, effect preview.                     |
| Existing requests | No reminders and no missed-reminder state.                                           | D47 makes no application/cutover choice.                                                         | D48 chooses new-only, deliberate apply-current, or automatic original-age inclusion with exact impact proof. |

## Domain model, ownership, and invariants

### Canonical terms

- **Validated Tenant cadence:** a later, independently evidenced, finite Phase
  12 source-policy choice that may make one courtesy-attention occurrence
  eligible; it is not a deadline, channel preference, task field, or D47 runtime.
- **Request episode:** one exact D43 request generation from submission through
  one terminal outcome. A terminal successor request is a new episode.
- **Reminder occurrence:** one immutable source meaning that a still-current
  request crossed its admitted courtesy-attention point. Recipient/channel
  members project it; they do not multiply it.
- **Policy revision:** one immutable Tenant-scoped source-policy version with a
  trusted cutover and closed value. Later changes append successors.
- **Application cohort:** the set of request episodes a later cadence policy is
  permitted to affect. D48—not D47—selects its construction/cutover.
- **Recipient binding point:** the D44 generation/time from which future
  reminder members are derived. D49—not D47—selects it.
- **Temporal admission package:** D46's complete clock, calendar, lifecycle,
  authorization, idempotency, cancellation, usefulness, failure, migration,
  UX, privacy, and proof contract required before implementation.

### Ownership matrix

| Authoritative fact                      | Owner                                  | Permitted projections/executors                     | Explicit non-owners                                                |
| --------------------------------------- | -------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| D43 request episode/state/actionability | Phase 12 permission-change source      | source lane, task, notification, audit read model   | policy UI, task, email, provider, worker                           |
| Future cadence policy/current head      | Phase 12 Tenant source policy          | permission-filtered settings summary/impact preview | D44 coordinator, Phase 17 plan, personal preference, Inngest       |
| Candidate instant/rule evidence         | Phase 12 source temporal contract      | candidate-work index and safe display projection    | database/session timezone, recipient local zone, worker wall clock |
| Reminder occurrence/cardinality         | Phase 12 source occurrence             | Phase 17/6 plan occurrence and recipient children   | task row, unread state, provider attempt, route revision           |
| Current personal recipients             | D44 resolver/generation                | Tasks Hub and reviewed attention adapters           | cadence policy, fallback role/group/address                        |
| Task work/engagement                    | ADR-0183 Tasks Hub                     | My tasks/list/count                                 | source state/time, reminder occurrence, access                     |
| Presentation/read engagement            | ADR-0027/Phase 17                      | Notification Center                                 | source actionability, task completion, recipient routing           |
| Channel plan/preference/destination     | Phase 17/6 and channel owner           | provider intents/outcomes                           | cadence source policy, D45 initial-email setting                   |
| Provider submission/outcome             | exact provider adapter/provider record | support/operations evidence                         | reminder source, human awareness, request decision                 |
| Wake/retry execution                    | replaceable workflow adapter           | traces and product-owned claim outcomes             | source time, idempotency, cancellation, authorization              |

### Invariants

1. D47 creates no current executable or visible artifact.
2. No future policy exists until independently validated and separately
   ratified; absence/unknown/incomplete means Off.
3. One request episode can have zero or one reminder source occurrence—never
   more.
4. Zero-to-three current D44 recipients do not change source cardinality.
5. The reminder means courtesy attention only and has zero source/access/
   deadline/performance consequence.
6. Policy revisions and occurrence evidence are immutable; corrections append
   typed successors/cancellations.
7. D48 must settle first-application current/future cohort/baseline/cutover;
   later impact decisions must settle edits, rollback, and any catch-up behavior
   before runtime. D47 selects none.
8. D49 must settle recipient binding, route changes, zero/indeterminate, retry,
   and member suppression before presentation/delivery; D47 selects none.
9. D50 must settle clock/calendar, timezone, lateness, and outage behavior
   before runtime; D47 selects none.
10. Policy revision is immutable semantic input/audit evidence but not part of
    occurrence uniqueness; no policy revision can mint a second occurrence for
    one request episode/meaning.
11. Tasks, notification engagement, D45 delivery, provider state, analytics,
    and executor state never own or imply reminder eligibility.
12. Every future row/relation/claim is same-Tenant, same-environment, same-source
    and server-derived under database constraints, RLS, and privileged parity.
13. Execution is at-least-once safe while business effect is at-most-once by
    durable product identity, not a transport window.
14. A future source clock has one explicit temporal model; no silent database,
    browser, server, Tenant, or recipient timezone default participates.
15. Every presentation truthfully distinguishes source occurrence, task,
    channel delivery, provider evidence, and human engagement.

## State, temporal correctness, concurrency, and idempotency

### D47 current state effect

D47 adds zero states and zero transitions. Every existing request remains under
D43. Every task/item/email remains under D44/D45. Advancing any clock—request
age, local midnight, weekend, DST, provider timeout, Inngest run age, or policy
discussion—has no current product effect.

### Required future source lifecycle

If a later feature earns admission, its finite source lifecycle must distinguish:

1. `policy_off` or one reviewed code-owned cadence policy revision;
2. a request episode admitted under the exact D48 application rule and policy
   input selected by a later feature decision;
3. an immutable future candidate intent/instant derived from exact source
   facts under the D50 temporal model;
4. typed suppression/cancellation under exact impact rules ratified after D48;
5. one immutable occurrence committed after complete current proof;
6. zero-to-three recipient members compiled under one occurrence;
7. independent member/channel suppression, preparation, submission, outcome,
   and engagement; and
8. source request terminality independent of every reminder state.

No generic `scheduled`, `snoozed`, `overdue`, `repeated`, `escalated`,
`completed_by_reminder`, `failed_reminder`, or Tenant-defined state is admitted.

### Required but unresolved impact decisions

| Question                      | Plausible alternatives that must be tested                                                                 | D47 fixed constraints                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| First On application          | New request episodes only; deliberate previewed current cohort; automatic current cohort from original age | D48 must choose; no implementation/inference now; zero-or-one occurrence remains.                          |
| Off/On and cadence edits      | New-only successor; current cohort reschedule/suppress; explicit current-work application                  | Later decision must define exact cutover/history/preview; policy revision cannot mint a second occurrence. |
| Existing request clock origin | Original request time; application/cutover time; explicit per-cohort baseline                              | D48/D50 must choose; no age field or catch-up exists now.                                                  |
| Rollback/re-enable            | Preserve old cohort; cancel; recompute under a successor                                                   | Must retain immutable evidence, fail closed, and prevent a second episode occurrence.                      |
| Unknown/incompatible policy   | Off/error/read-only repair                                                                                 | D47 fixes fail-closed Off and forbids guessing.                                                            |

### Race outcomes

| Race                                                       | Required winner/effect                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| D43 terminal transition vs candidate claim                 | Source terminality/current-head proof wins; no new releasable member.                                                |
| Policy edit vs candidate claim                             | A later impact decision must name serialization/winner; D47 only requires expected heads and one episode occurrence. |
| Duplicate wake/recovery/replay                             | One product identity/claim; exact replay returns prior result, changed inputs conflict.                              |
| Route/eligibility change before or after source occurrence | D49 must choose binding and member outcomes; route change cannot mint a second source occurrence.                    |
| Zero/indeterminate recipients vs retry                     | D49 must choose bounded behavior while preserving D44 authority and no cross-Tenant fallback.                        |
| Policy activation vs old pending request                   | D48 must choose cohort/baseline; D47 causes no enrollment.                                                           |
| Outage past candidate instant                              | Later-defined bounded usefulness/catch-up rule decides; no unbounded burst or worker guess.                          |
| Provider timeout vs retry                                  | Provider/product delivery idempotency and reconciliation decide; no new source occurrence.                           |
| Tenant/timezone/tzdb change vs candidate computation       | D50 must choose historical/recomputation behavior; D47 permits no clock artifact.                                    |

## UX/UI contract

### Current UX

- D47 adds no reminder card, toggle, selector, disabled control, **Coming soon**
  text, countdown, status, icon, badge, color, animation, age severity, default
  sort, or empty-state promise.
- **Access requests**, the D44 task/item, holder status, and D45 initial-email
  controls remain exactly under their established owners.
- Existing timestamps may render under their source owner, but D47 does not add
  **waiting too long**, **due**, **overdue**, **late**, or **needs escalation**.

### Future Tenant administrator journey, if separately activated

1. The authorized actor remains in **People & access → Access requests** and
   sees one compact **Courtesy reminder** source-policy summary adjacent to the
   established request/coordinator settings—not a new navigation destination.
2. The summary states current effective source choice and **This never sets a
   due date or changes access** before **Change reminder**.
3. Editing uses the established responsive Base Maia Sheet over retained
   context. A native labelled radio group is used when the eventual finite set
   is small; a native select may be used only if research proves a larger finite
   set. A binary switch is insufficient for Off plus multiple cadences.
4. Copy is **If a review is still waiting after [choice], create one courtesy
   reminder. This does not set a due date or change access. How it is delivered
   is managed separately.** It never says deadline, compliance, overdue,
   urgency, escalation, or response required.
5. A fresh permission-safe preview explains the exact current-versus-future,
   baseline, edit, and rollback effect selected through D48 and later impact
   decisions. It exposes no
   subject, protected request, explanation, per-coordinator preference/contact,
   or hidden scope.
6. Save uses expected policy/source/auth heads and produces a durable inline
   result/receipt. Stale/partial/indeterminate proof changes nothing and asks
   the actor to refresh; no toast-only success or optimistic schedule exists.
7. The setting contains no recipient picker, channel matrix, quiet hours,
   custom time, calendar builder, test-send, template, rule, workflow, escalation,
   digest, or advanced mode. Those are different owners/decisions.

### Coordinator journey, if a reminder channel is later activated

- The current task remains one work item. A future reminder presentation says
  only **This access review is still waiting** and opens authenticated current
  **People & access** detail after fresh authorization.
- It shows no countdown, due date, overdue chip, red urgency, reviewer ranking,
  holder/request explanation, capability/provenance, inline Keep/Remove, peer
  identities, or delivery/provider status.
- Reading/dismissing a presentation changes engagement only; it cannot suppress
  source work, decide the request, or promise another reminder.
- If responsibility changed, D44 copy remains authoritative and any future
  reminder copy truthfully reflects the D49-selected binding/history; it never
  fabricates prior responsibility or another source occurrence.

### Holder, donor, missionary, and public journeys

- Holder status remains D43 truth and does not expose coordinator cadence,
  schedule, recipient, delivery, read, or response-performance state.
- Donors, missionaries, public visitors, unrelated staff, and other Tenants see
  no D47 information or behavior.
- External channel bodies, if later authorized, must keep D45's safe-fact-wall
  discipline and authenticated inert links; D47 authorizes none.

### Accessibility, localization, and field conditions

- Native controls, persistent visible labels/instructions, described helper
  text, keyboard operation, visible focus, announced save/error status, and
  semantic grouping satisfy the applicable WCAG 2.2 AA baseline.
- No meaning relies on color, icon, placement, animation, hover, or relative
  time alone. Copy and controls reflow at 320 CSS pixels/400% zoom, support long
  localized strings and RTL, and preserve draft/retry across intermittent
  connectivity without duplicate save.
- Dates/times, if later shown, localize for display while preserving a labelled
  source timezone when ambiguity matters. Relative time is supplementary; an
  absolute accessible value remains available.
- The future control is not shown until functional. D47's no-placeholder rule
  avoids a permanently disabled or confusing promise for current users.

## Normative requirements

1. **D47-R1 — Eligibility only.** D47 permits a later evidence-gated source
   policy decision and creates no present capability or artifact.
2. **D47-R2 — Independent validation.** Representative preregistered research,
   comprehension, accessibility, privacy, fatigue, and harm evidence is required
   before implementation.
3. **D47-R3 — Default Off.** Missing, unknown, legacy, incompatible, incomplete,
   or unproved future policy resolves to Off.
4. **D47-R4 — Finite code-owned choices.** No free-form duration, cron,
   calendar, formula, workflow, recipient, channel, or recurrence DSL exists.
5. **D47-R5 — One source occurrence.** Each exact D43 request episode has zero
   or one reminder occurrence regardless of recipients/channels/retries.
6. **D47-R6 — Courtesy meaning only.** Reminder time creates no deadline,
   urgency, SLA, performance, source, request, task, or access consequence.
7. **D47-R7 — Phase 12 ownership.** Policy, source time, episode, occurrence,
   cancellation, usefulness, and audit remain Phase 12 truth.
8. **D47-R8 — Preserve D43.** Only D43's registered terminal transitions end or
   decide a request; cadence and engagement never do.
9. **D47-R9 — Preserve D44.** D44 alone owns current personal responsibility;
   zero/indeterminate remains valid lane-only operation with no fallback.
10. **D47-R10 — Recipient binding remains separate.** D49 must decide the D44
    binding point, zero/indeterminate, route-churn, retry, and member outcomes.
11. **D47-R11 — Route cannot multiply source truth.** Whatever D49 chooses,
    recipient/route changes cannot mint another source occurrence for the same
    request episode and reminder meaning.
12. **D47-R12 — D45 remains initial-only.** D45 plan/preference/key/intent/
    provider state cannot create, deliver, retry, or suppress a reminder.
13. **D47-R13 — Channel independence.** D47 authorizes no presentation or
    transport; every future step earns an independent Phase 17/6 contract.
14. **D47-R14 — Tasks remain work.** Task due/reminder/priority/engagement and
    duplicate task creation cannot express the future source occurrence.
15. **D47-R15 — Immutable policy input, stable uniqueness.** Policy edits append
    trusted revisions used in semantic input/audit hashes; policy revision is
    excluded from occurrence uniqueness and cannot mint a second occurrence.
16. **D47-R16 — Current-work impact remains separate.** D48 must choose the
    application cohort, baseline/cutover, preview, and rollback behavior.
17. **D47-R17 — Policy-edit effects remain separate.** A later decision must
    define Off/On/cadence-edit effects on admitted/current work before runtime;
    D47 infers no widening, narrowing, reschedule, cancellation, or catch-up.
18. **D47-R18 — Exact future time model remains separate.** D50 must define
    origin, instant/civil model, zone, tzdb, DST, calendar, precision, and lateness.
19. **D47-R19 — No fake working days.** Working-day language/logic requires a
    complete separately governed calendar; weekends-only is insufficient.
20. **D47-R20 — Durable product identity.** Product database uniqueness,
    immutable evidence, claims, and reconciliation own at-most-once effect.
21. **D47-R21 — Exact later reproof.** D48–D50 and channel decisions must name
    source, policy, auth, recipient, privacy, destination, and usefulness fences;
    every irreversible boundary enforces the ratified set.
22. **D47-R22 — Tenant/RLS safety.** Same-scope composite keys, constraints,
    forced RLS, `USING`/`WITH CHECK`, hardened server commands, and privileged
    parity prevent caller-controlled scope/actor/time/recipient.
23. **D47-R23 — Replaceable execution.** Inngest may wake identifier-only
    product work but never owns time, identity, cancellation, or outcome.
24. **D47-R24 — Failure-safe recovery.** Partial commit, duplicate wake,
    cancellation race, outage, late wake, ambiguous delivery, and repair have
    closed no-guess/no-blind-resend outcomes.
25. **D47-R25 — Quiet source UX.** No current placeholder; future control stays
    in Access requests, uses no-deadline copy, finite choices, and exact impact.
26. **D47-R26 — Accessible resilient UX.** Native semantics, keyboard/focus/
    status/reflow/localization/RTL/mobile/low-bandwidth proof are release gates.
27. **D47-R27 — Privacy minimization.** Policy, preview, occurrence, telemetry,
    logs, channels, exports, and AI reveal no unnecessary protected D43/D40 facts.
28. **D47-R28 — Bounded performance.** Future work is one source intent per
    admitted request and at most three recipient members, with indexed claims,
    Tenant fairness, pagination, and measured budgets before release.
29. **D47-R29 — No new telemetry authority.** D47 monitors use CI/release audit,
    existing incident/support evidence, or separately approved research; they
    create no pipeline, metric, event, job, dashboard, or automation.
30. **D47-R30 — Traceable future release.** Requirements and ACs must reconcile
    through glossary, ADRs, OpenSpec, design, tasks, tickets, tests, rollout,
    rollback, repair, and release evidence before any future activation.

## Ruthless 22-category adversarial review

Severity is the potential consequence if the concern escapes; likelihood is
the reasoned probability under a naïve implementation, not a claim about
current shipped behavior. D47 currently adds no runtime.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                                                                                  | Why it matters                                                                                                              | Severity | Likelihood                       | Evidence or reasoning                                                                                                                                                                            | Decision effect                                                               | Best permanent fix                                                                                                                                       | Exact decision / requirement / acceptance language         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Core treats a requested cadence as a verified need and builds a reminder even when pending work is deliberately waiting or existing recovery IA is the real problem. | The product creates noise and operational cost without solving the root cause; ministries may infer pressure or compliance. | High     | High absent independent research | D44 already provides the complete lane, task, and required in-product attention. Current external products generally tie reminders to source due windows; none proves a D43 no-deadline cadence. | Narrows Option 1 to conditional eligibility, not implementation.              | Require preregistered representative research that distinguishes missed attention from deliberate waiting and repairs verified IA/routing defects first. | **D47-R1–R2, R6, R25, R29–R30; D47-AC001–020, AC101–120.** |
| The strongest simpler alternative—keep D46 no-reminder indefinitely—is rejected without evidence.                                                                    | D47 could freeze speculative temporal complexity when no build is the better product.                                       | High     | Medium                           | No current source SLA exists; default Off/no artifact preserves the alternative until evidence changes it.                                                                                       | Does not invalidate eligibility; keeps no-build as the actual current result. | Treat failure to satisfy any admission criterion as a final Off result for that proposal, not a prompt to weaken the gate.                               | **D47-R1–R4, R29–R30; D47-AC001–020, AC111–120.**          |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                                        | Why it matters                                                                                                  | Severity | Likelihood                           | Evidence or reasoning                                                                                                                | Decision effect                                                                      | Best permanent fix                                                                                                               | Exact decision / requirement / acceptance language  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| A timer is calculated as `created_at + N` in a worker/client and silently depends on server timezone, mutable config, route membership, or process uptime. | Ordinary timezone, policy, deployment, or recipient changes produce duplicate, late, or unauthorized attention. | Critical | High for a local feature shortcut    | PostgreSQL does not retain the original zone in `timestamptz`; IANA rules change; Inngest sleeps are execution, not source evidence. | Requires a complete future temporal contract and immutable source evidence.          | Persist exact source instant/rule/policy version under Phase 12, claim by durable product identity, and re-prove current fences. | **D47-R7, R15, R18–R24; D47-AC041–060, AC071–090.** |
| Policy or coordinator changes restart age or replay recipients.                                                                                            | One request can generate several reminders despite the “one” promise.                                           | High     | High without episode/member identity | D44 recipient generations are independently mutable while D43 episode identity remains stable.                                       | Changes cardinality from “per person” to one source occurrence plus bounded members. | Unique source identity per episode/meaning; explicit continuing/removed/new-recipient rules.                                     | **D47-R5, R9–R11, R20–R21; D47-AC051–070.**         |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                  | Why it matters                                                                                                                   | Severity | Likelihood                                  | Evidence or reasoning                                                                                                             | Decision effect                                      | Best permanent fix                                                                                                                | Exact decision / requirement / acceptance language                        |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| “Future-ready” nullable fields, disabled UI, generic reminder table, cadence enum, feature flag, or scheduler abstraction ships now. | Unproved interval/calendar/channel semantics become compatibility promises and migrations; a generic engine duplicates Phase 34. | High     | High if placeholders are viewed as harmless | D46 explicitly defines future readiness as a documented admission seam, not dormant implementation. ADR-0026 is contract-bounded. | Makes D47 a documentation-only eligibility decision. | Add no artifact now; later implement the smallest versioned source policy/occurrence and fixed channel steps that evidence earns. | **D47-R1, R3–R4, R13–R14, R29–R30; D47-AC001–010, AC071–080, AC091–100.** |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                     | Why it matters                                                                                    | Severity | Likelihood                           | Evidence or reasoning                                                                                                          | Decision effect                                                                                         | Best permanent fix                                                                                                                                                              | Exact decision / requirement / acceptance language |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Requests cross DST gaps/overlaps, leap day, month end, weekend/holiday, Tenant timezone/tzdb changes, long outages, route churn, grant expiry, or corrected timestamps. | Different nodes can disagree on the instant, send after work ended, or lose/duplicate a reminder. | High     | High in aggregate for global Tenants | IANA publishes rule changes; PostgreSQL UTC storage does not preserve the civil rule; D43/D44 states can change independently. | Defers exact clock to D50 and recipient behavior to D49, making every case release-blocking until then. | D49/D50 select explicit models; later design pins evidence and proves every chosen gap/overlap/lateness/correction/recipient outcome.                                           | **D47-R15–R24; D47-AC041–060, AC081–090.**         |
| The coordinator set is zero, indeterminate, changes from 3→0→2, includes the requester, or restores eligibility before/after occurrence or delivery.                    | Fallbacks can leak work; re-admission can create a second nudge.                                  | Critical | Medium                               | D44 defines complete algebraic recipient results and requester exclusion, but D47 has not chosen the reminder binding point.   | Defers member timing/outcomes to D49 while preserving one source occurrence.                            | D49 explicitly compares and selects binding/zero/route/retry outcomes; every option preserves D44 authority/no cross-Tenant fallback and cannot mint another source occurrence. | **D47-R9–R11, R21–R22; D47-AC061–070.**            |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                                         | Why it matters                                                                                        | Severity | Likelihood                                          | Evidence or reasoning                                                                                                         | Decision effect                                                                   | Best permanent fix                                                                                                     | Exact decision / requirement / acceptance language         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| A free-form day field, **Send now**, **Snooze**, repeat checkbox, task alarm, red age badge, or test-send creates hidden policy or irreversible disclosure. | Administrators can accidentally nag volunteers, imply a deadline, or notify the wrong cohort/channel. | High     | High because these are common generic task controls | Givebutter/HubSpot/Salesforce task patterns are user-task features, not D43 source authority; Apple warns against duplicates. | Removes generic controls and preserves one source editor only if activated later. | Finite code-owned choices, fresh impact preview, server rejection of unregistered commands, no manual reminder in D47. | **D47-R4–R6, R13–R14, R25–R27; D47-AC021–030, AC071–080.** |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                 | Why it matters                                                                                            | Severity | Likelihood                      | Evidence or reasoning                                                                                                                   | Decision effect                                   | Best permanent fix                                                                                           | Exact decision / requirement / acceptance language          |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| A policy, cache, candidate-time query, claim, recipient lookup, destination, or executor concurrency key omits Tenant/environment/assignment scope. | Sensitive access-governance existence or content can cross organizations, especially for multi-hat staff. | Critical | Medium without composite design | D43/D44/D45 all require exact Tenant and Active Tenant Assignment relations; shared workflow infrastructure is explicitly multi-Tenant. | Adds same-scope invariants to every future layer. | Composite keys/FKs, Tenant-bound policy/occurrence/member/claim, current Tenant reproof, no shared fallback. | **D47-R7, R9–R11, R21–R23, R27; D47-AC031–040, AC061–090.** |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                      | Why it matters                                                                                                          | Severity | Likelihood                  | Evidence or reasoning                                                                                                                        | Decision effect                                                           | Best permanent fix                                                                                                                                                                 | Exact decision / requirement / acceptance language  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Caller-controlled Tenant, actor, request, policy version, timestamp, timezone, recipient, or channel enters a row; a bare FK/nullable owner/default permits cross-scope or orphan state. | A permitted write can forge a reminder, retarget it, or transform an allowed row into forbidden external communication. | Critical | High for a naïve CRUD model | PostgreSQL evaluates proposed rows under `WITH CHECK`; owners/service roles may bypass RLS; D43 decisions already demand trusted derivation. | Prohibits generic CRUD and makes future database proof part of admission. | Server command derives every authority field; composite NOT NULL FKs/checks/unique indexes; restrictive deletes; forced RLS; explicit `USING` and `WITH CHECK`; privileged parity. | **D47-R7, R15, R20–R22; D47-AC031–040, AC051–060.** |
| “One reminder” is enforced only in application code or executor dedupe.                                                                                                                  | Concurrent claims/replays can jointly violate cardinality after 24 hours or across redeploys.                           | Critical | High under retries          | Inngest event/function dedupe is 24 hours; permanent business uniqueness belongs in product storage.                                         | Requires durable semantic uniqueness before executor choice.              | Unique exact episode/meaning identity, immutable input hash, claim CAS, exact replay/changed-input conflict.                                                                       | **D47-R5, R20, R23–R24; D47-AC051–060, AC071–080.** |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                                             | Why it matters                                                                                       | Severity | Likelihood                                       | Evidence or reasoning                                                                                                            | Decision effect                                                     | Best permanent fix                                                                                                                                            | Exact decision / requirement / acceptance language               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Courtesy cadence expands into business calendars, arbitrary units, recurrence, quiet hours, escalation graphs, recipient queries, multi-channel rules, and a generic scheduler. | A single nudge becomes a second workflow/notification platform with high support and migration cost. | High     | High if future channels are designed all at once | ADR-0026 rejects arbitrary waits/graphs; D45 requires each channel to earn its contract; D46 forbids generic reminder machinery. | Strictly limits D47 to one finite source policy and one occurrence. | D48–D50 settle cohort/recipient/time one at a time; later feature exposes only evidence-backed fixed choices; repeat/digest/escalation/channel stay separate. | **D47-R4–R6, R13, R18–R19, R23, R25; D47-AC001–030, AC071–080.** |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                                | Why it matters                                                                                                                   | Severity | Likelihood                             | Evidence or reasoning                                                                                              | Decision effect                                                             | Best permanent fix                                                                                                                                                 | Exact decision / requirement / acceptance language  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| **After 5 days**, a countdown, red status, list ordering, “pending too long,” or **working days** is understood as a deadline/SLA even when helper text denies it. | Staff may rush sensitive access decisions, holders may expect action, and volunteer performance may be judged unfairly.          | High     | High without comprehension proof       | Vendor access reviews pair reminder with deadline; language/visual hierarchy can override fine print.              | Makes no-deadline comprehension a release gate and forbids urgency styling. | Lead with courtesy meaning, repeat no-access/no-due consequence at decision point, neutral visuals, user-test across roles/locales.                                | **D47-R2, R6, R25–R27; D47-AC011–030, AC101–110.**  |
| Setting appears in System Messages/Notifications/Tasks or in multiple places.                                                                                      | Users cannot tell whether they are setting business time, delivery channel, or personal preference; contradictory state results. | Medium   | High in a broad communications product | D45 deliberately locates source-independent channel controls elsewhere; D44 Access requests is the source context. | Fixes one future source location and read-only deep links only.             | Canonical Access requests card; other surfaces may show permission-filtered effective summaries, never another editor.                                             | **D47-R7, R12–R14, R25; D47-AC021–030, AC071–080.** |
| Current-versus-future and policy-edit impact is left implicit or a save is optimistic/toast-only.                                                                  | Admins cannot predict which pending requests are enrolled, rebased, suppressed, or excluded.                                     | High     | High until D48/later impact decisions  | D44 and D45 have different current-work semantics, so neither is safe precedent.                                   | Makes impact a separate decision instead of smuggling in one answer.        | D48 chooses the first application cohort; later impact decision defines edits; the eventual UI shows a server-produced permission-safe preview and durable result. | **D47-R15–R17, R25–R26; D47-AC021–030, AC041–050.** |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                                                       | Why it matters                                                                                              | Severity | Likelihood                      | Evidence or reasoning                                                                      | Decision effect                                       | Best permanent fix                                                                                                                 | Exact decision / requirement / acceptance language      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Request `created_at`, task due/reminder state, unread state, D45 failure, provider timestamp, analytics age, or Inngest run becomes the clock/occurrence. | Multiple systems independently create attention, circular synchronization, and irreparable duplicate truth. | Critical | High without an explicit matrix | Core ADRs separate source, work, presentation, delivery, provider evidence, and execution. | Centralizes all business time/occurrence in Phase 12. | One source policy/episode/instant/occurrence; downstream typed adapters only; database constraints make dual ownership impossible. | **D47-R5–R14, R18, R20–R23; D47-AC001–010, AC051–080.** |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                | Why it matters                                                                                   | Severity | Likelihood                                            | Evidence or reasoning                                                                                 | Decision effect                            | Best permanent fix                                                                                                                | Exact decision / requirement / acceptance language                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| D47 reuses finance `reminderHours`, generic task fields, D45 keys/preferences, Phase 17 retention, provider scheduling, one Tenant timezone column, or one Inngest function shape. | Unrelated changes silently alter access governance and block later executor/channel replacement. | High     | High because similar primitives exist in current code | Current contribution reminder code is domain-specific and ADRs label source clocks as producer-owned. | Forbids convention reuse and placeholders. | New reviewed source version only after evidence; typed adapters at owner boundaries; architecture tests reject forbidden imports. | **D47-R1, R7, R12–R14, R18–R23; D47-AC001–010, AC071–080, AC101–110.** |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                    | Why it matters                                                                                               | Severity | Likelihood                  | Evidence or reasoning                                                                                     | Decision effect                                                      | Best permanent fix                                                                                                                           | Exact decision / requirement / acceptance language  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- | --------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Policy/request commit succeeds but handoff fails; wake is lost/late/duplicated; route proof is indeterminate; source closes mid-flight; one channel succeeds and another is ambiguous. | Core can silently miss a promised nudge, issue one after work ended, or blind-resend external communication. | High     | High in distributed systems | Workflow OpenSpec requires product ledger/recovery; provider acceptance and human awareness are distinct. | Requires closed future failure semantics and forbids guarantees now. | Atomic source+handoff, indexed reconciliation, current claim fences, bounded lateness, independent member/channel outcomes, no blind resend. | **D47-R20–R24, R27–R30; D47-AC051–060, AC081–100.** |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                                           | Severity | Likelihood                                   | Evidence or reasoning                                                                                                             | Decision effect                                                                                         | Best permanent fix                                                                                                                                    | Exact decision / requirement / acceptance language |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Mutable policy edits, request successors, source terminality, route changes, retries, and outages race without exact valid/terminal states or predecessor heads. | Two individually legal actions can create two reminders or a reminder after closure or a changed policy. | Critical | High                                         | D43 has immutable request generations; D44 has recipient generations; D45 uses expected heads. The reminder needs the same rigor. | Adds immutable policy/episode/occurrence generations while leaving disputed winners to later decisions. | D48–D50 and later impact design define winners; CAS/locking then enforces them, while episode/meaning uniqueness always prevents a second occurrence. | **D47-R5, R15–R24; D47-AC041–070, AC081–090.**     |
| Calendar/timezone rules are deferred but implementation starts anyway.                                                                                           | A supposedly small timer freezes ambiguous DST/holiday/tzdb behavior and historical interpretation.      | High     | High if exact interval is chosen before D50. | IANA changes and PostgreSQL zone retention limits are current facts.                                                              | D47 explicitly blocks runtime until later temporal decision.                                            | D50 selects one model; release proof covers gaps/overlaps/corrections/version changes and historical interpretation.                                  | **D47-R18–R19, R30; D47-AC041–050, AC101–110.**    |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                                                                      | Severity | Likelihood  | Evidence or reasoning                                                                                                               | Decision effect                                                        | Best permanent fix                                                                                                                                 | Exact decision / requirement / acceptance language                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Duplicate due rows, in-place time edits, orphan policy references, stale recipients, mutable `last_reminded_at`, partial fanout, or reused keys corrupt history. | Operators cannot prove which policy applied, whether one occurrence existed, or who was lawfully eligible; repair may notify twice. | Critical | Medium-high | Current finance uses mutable reminder fields; Core's forward architecture favors immutable source occurrences/complete-set release. | Rejects local fields and requires normalized immutable identity later. | Composite FKs, unique episode/meaning, immutable revision hashes, complete bounded plan release, restrictive delete, deterministic reconciliation. | **D47-R5, R15, R20–R22, R24, R30; D47-AC031–040, AC051–070, AC091–100.** |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                     | Why it matters                                                                                           | Severity | Likelihood | Evidence or reasoning                                                                                                                                          | Decision effect                                                  | Best permanent fix                                                                                                                                | Exact decision / requirement / acceptance language              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Settings preview, job payload, log, metric, email/chat body, URL, export, search, cache, or AI reveals holder, request explanation, capability, provenance, location, coordinator, or behavioral score. | Sensitive missionary/member-care/ministry access facts can leak externally or become staff surveillance. | Critical | Medium     | D43 prose/provenance is protected; D45 safe fact wall exists because external delivery is hard to retract; Apple warns against sensitive notification content. | Narrows every future payload/monitor and forbids person scoring. | Identifier-only execution, safe aggregate preview, authenticated inert links, field allowlists, exact retention, no open/click/response rankings. | **D47-R21–R23, R27, R29; D47-AC031–040, AC081–090, AC111–120.** |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                           | Why it matters                                                                                    | Severity | Likelihood                    | Evidence or reasoning                                                                                                                                      | Decision effect                                                                          | Best permanent fix                                                                                                                                                                                                                 | Exact decision / requirement / acceptance language            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Per-request sleeping runs, full pending scans, per-member N+1 authorization, local-midnight herds, implicit/unbounded backfill, or channel fanout causes noisy-neighbor load. | Large Tenants and global cadence boundaries can degrade source operations and required attention. | High     | Medium if implemented naïvely | Recipient bound is exactly three, but request/Tenant volume is unbounded; Inngest sleeps do not count toward concurrency but may outlive trace visibility. | Defines the known cardinality and demands measured budgets rather than vague “scalable.” | One indexed candidate intent/occurrence per D48-admitted request, bounded set-based 0–3 member resolution, Tenant-fair claims, pagination, no implicit/unbounded backfill, and production-shaped benchmark budgets before release. | **D47-R5, R10, R16, R20–R24, R28; D47-AC051–090, AC101–110.** |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                                                           | Why it matters                                                                              | Severity | Likelihood                      | Evidence or reasoning                                                                       | Decision effect                                  | Best permanent fix                                                                                                       | Exact decision / requirement / acceptance language         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Support must interpret arbitrary calendars, stuck sleeps, retroactive edits, duplicate sends, provider ambiguity, or direct DB repair before value is proved. | Small nonprofit teams and Core operators inherit recurring complexity and tribal knowledge. | High     | High for a generic/custom model | Every extra temporal/channel choice multiplies runbooks; D47 has no validated interval yet. | Keeps no runtime now and finite semantics later. | One model/finite set, product reconciliation, exact runbook/kill/repair, no direct SQL resend or hidden scheduler state. | **D47-R1–R4, R18–R24, R28–R30; D47-AC001–020, AC081–100.** |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                                                                | Why it matters                                                                                                                    | Severity | Likelihood                       | Evidence or reasoning                                                                                                               | Decision effect                                                        | Best permanent fix                                                                                                                                                          | Exact decision / requirement / acceptance language       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Provider/executor logs are treated as durable proof, or new telemetry is introduced through D47 to measure age, opens, response time, and coordinator performance. | Product truth becomes vendor-retention-dependent and a courtesy feature becomes surveillance; D47 silently creates runtime scope. | High     | High absent an explicit boundary | Inngest long sleeps may disappear from normal trace view; provider evidence is not human awareness; D46 forbids individual scoring. | Adds product-owned future audit and no-new-telemetry current monitors. | Use CI/release audits and already-permitted incidents/research now; future product records own policy/occurrence/member/outcome history with minimized operational signals. | **D47-R20–R24, R27, R29–R30; D47-AC081–090, AC101–120.** |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                            | Why it matters                                                                                          | Severity | Likelihood  | Evidence or reasoning                                                                                                                   | Decision effect                                             | Best permanent fix                                                                                                                                       | Exact decision / requirement / acceptance language                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Inngest, provider scheduling, Slack/Teams/Google identity, email deliverability, tzdb, browser timers, or one vendor default owns when/if the reminder exists. | Vendor limits, outages, version changes, and lock-in alter business semantics or prevent safe recovery. | High     | Medium-high | Inngest idempotency is 24 hours and cancellation is not absolute; IANA rules change; channels have distinct destination/consent models. | Keeps all integrations subordinate and separately admitted. | Product source/claim/ledger first; pinned temporal evidence; identifier-only replaceable executor; independently reviewed channel adapters and outcomes. | **D47-R7, R12–R13, R18, R20–R24, R27; D47-AC041–050, AC071–090.** |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                     | Why it matters                                                                                           | Severity | Likelihood                         | Evidence or reasoning                                                                   | Decision effect                                                                 | Best permanent fix                                                                                                                                                                    | Exact decision / requirement / acceptance language               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Future activation infers schedules from existing `created_at`, finance/task fields, or old settings before D48 chooses the current-work cohort; old code misreads new policy; rollback deletes history. | Reminder storms, duplicated external messages, and inconsistent mixed-version behavior are irreversible. | Critical | High without explicit impact rules | D45/D46 similar behavior is nonprecedent and D47 intentionally leaves application open. | Makes no-inference and D48-before-writer gating normative without choosing D48. | Readers/deny paths before writers; missing/unknown Off; only the D48-ratified cohort/baseline may enroll; immutable history; independent producer/channel kill; roll-forward repairs. | **D47-R1, R3, R15–R17, R20–R24, R30; D47-AC001–010, AC091–110.** |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                                              | Why it matters                                                                                                          | Severity | Likelihood             | Evidence or reasoning                                                                    | Decision effect                                                 | Best permanent fix                                                                                                                                                                               | Exact decision / requirement / acceptance language |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| “One reminder, no deadline, future-ready” remains prose without falsifiable positive/negative/boundary/auth/concurrency/time/migration/accessibility tests or trace identifiers. | Implementations can pass local tests while duplicating reminders, leaking Tenants, or creating false urgency elsewhere. | High     | High across many seams | Current repo contains task/reminder/provider primitives that can accidentally be reused. | Adds 120 acceptance criteria and end-to-end trace requirements. | Carry D47-R/AC identifiers into all artifacts; verify public user/domain outcomes, generated registries, forbidden imports/fields, race fixtures, comprehension, and production-shaped recovery. | **D47-R1–R30; D47-AC001–120.**                     |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                                              | Why it matters                                                                                               | Severity | Likelihood | Evidence or reasoning                                                                                                                               | Decision effect                                  | Best permanent fix                                                                                                                                                        | Exact decision / requirement / acceptance language              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A support force-send, AI recommendation, admin override, restore/clock correction, analytics experiment, employee score, or “temporary” manual SQL bypasses the source contract. | Hidden privileged paths defeat every visible safeguard and can expose sensitive access work or coerce staff. | Critical | Medium     | D43 free text and access are sensitive; OWASP requires authorization on every path; service owners normally bypass RLS unless forced/parity-tested. | Adds uniform negative-path and purpose controls. | No current runtime; future exact server commands only, privileged-path parity, no force-send/AI action, incident-safe forward repair, audit all overrides (ideally none). | **D47-R6–R7, R20–R24, R27, R29–R30; D47-AC031–040, AC081–120.** |

## Acceptance criteria

### Decision scope, no-build boundary, and current behavior

- **D47-AC001:** D47 is satisfied only by documentation that a bounded Tenant
  cadence may later qualify; no runtime, schema, configuration, catalog,
  preference, feature-flag, UI, worker, or provider artifact is added.
- **D47-AC002:** Current D43 requests produce zero automatic reminder source
  occurrences regardless of age, request timestamp, source/grant expiry,
  coordinator count, task/item engagement, D45 outcome, or executor state.
- **D47-AC003:** The current effective posture is absence of the capability,
  not a persisted Off row, hidden default, disabled toggle, Reserved key, empty
  manifest slot, no-op event, or sleeping/paused function.
- **D47-AC004:** No database field/relation named or serving as `cadence`,
  `due_at`, `remind_at`, `next_reminder_at`, `last_reminded_at`,
  `reminder_count`, `overdue_at`, or equivalent is added to D43/D44/task/item/
  communication records through D47.
- **D47-AC005:** No enum, stable message key, producer kind, Delivery Step,
  plan/profile choice, personal preference, content/template, action, API/RPC,
  import/export field, event schema, queue/outbox kind, cron, or Inngest
  function is reserved through D47.
- **D47-AC006:** Current **Access requests**, D44 coordinator settings/tasks/
  items, D45 initial-email settings/intents, holder status, and grant decisions
  remain behaviorally unchanged by D47.
- **D47-AC007:** Existing generic task/finance reminder fields, states, policies,
  tables, functions, jobs, UI, or provider records are never inferred, mapped,
  copied, aliased, or treated as a compatible D47 implementation.
- **D47-AC008:** Unknown reminder-like browser/API/import/support/AI/worker input
  fails closed and writes no tolerant metadata for later interpretation.
- **D47-AC009:** D47 does not choose any cadence value, unit, timezone, calendar,
  lateness window, content, channel, recipient preference, quiet-hour behavior,
  or implementation technology.
- **D47-AC010:** Current deployment requires no migration, seed, backfill,
  secret, provider setup, scheduler registration, dashboard, alert, or feature
  rollout and cannot send a test/canary reminder.

### Independent validation and future source-policy admission

- **D47-AC011:** Before any future artifact is proposed, a written research
  brief is independently approved by Access Product, UX Research, IAM/Security,
  Privacy, Accessibility, and Architecture; approval itself does not
  authorize implementation.
- **D47-AC012:** The brief identifies the known workflow/root problem, compares
  no-build and IA/routing repair, and distinguishes missed attention from
  deliberate waiting, offline coordination, insufficient authority, sensitive
  deliberation, or source inapplicability.
- **D47-AC013:** Recruitment covers the actual intended market and includes
  relevant small, staffed, volunteer-led, distributed, multi-time-zone,
  mobile/low-bandwidth, international-language/RTL, and disability/assistive-
  technology contexts; exclusions and evidence limits are explicit.
- **D47-AC014:** The brief preregisters qualitative/quantitative questions,
  comprehension and harm outcomes, success/stop criteria, analysis method,
  retention, minimization, responsible owners, and how contradictory evidence
  will be handled before collection begins.
- **D47-AC015:** Vendor defaults/examples, one Tenant/founder preference,
  request-age distribution, opens/clicks, completion correlation, support
  ticket count, or current coordinator behavior cannot alone qualify a cadence.
- **D47-AC016:** Comprehension proof separately tests administrators,
  coordinators, holders, and authorized reviewers and must meet its preregistered
  criterion for **courtesy/still waiting** without Due/Overdue/SLA/access-
  consequence inference in each materially different cohort.
- **D47-AC017:** Fatigue/harm proof assesses duplicate attention, volunteer/
  employee pressure, unsafe rushed decisions, opt-out, privacy exposure,
  low-bandwidth interruption, and disparate timezone/calendar effects; a
  material unmitigated harm fails admission.
- **D47-AC018:** Source data-quality proof shows the exact request episode,
  source timestamp, policy head, Tenant scope, request currentness, and D44
  generation can be resolved completely; missing/ambiguous data fails closed.
- **D47-AC019:** The later decision names one candidate finite source policy and
  its evidence. It cannot say merely configurable, reasonable, timely,
  business days, best practice, or industry standard without exact falsifiable
  semantics.
- **D47-AC020:** If any evidence/admission gate is absent, stale, materially
  contradictory, or fails its criterion, the proposal remains Off/no-build;
  no weaker default, beta, admin override, manual send, or experimental runtime
  substitutes for the gate.

### UX/UI, content, accessibility, localization, and field conditions

- **D47-AC021:** D47 adds no visible or programmatic reminder control/status now,
  including no disabled/coming-soon card, badge, countdown, age color, tooltip,
  default sort, empty-state promise, upsell, or hidden screen-reader text.
- **D47-AC022:** If later activated, exactly one canonical editor appears in the
  established **People & access → Access requests** settings context beside the
  source/routing policy; no new top-level destination or duplicate editor exists.
- **D47-AC023:** System Messages/Notifications/Tasks may at most expose a
  permission-filtered read-only effective summary or typed link when useful;
  they cannot edit or become the cadence source.
- **D47-AC024:** The future editor leads with Off and only the reviewed finite
  code-owned choices. It uses a native labelled radio group for a small choice
  set or a justified native select, never a binary switch for multi-valued state
  or a free-form number/unit/time field.
- **D47-AC025:** Persistent helper text states **If a review is still waiting
  after [choice], create one courtesy reminder. This does not set a due date or
  change access. How it is delivered is managed separately.** Equivalent
  localized copy preserves all four meanings.
- **D47-AC026:** No visible/accessibility copy or style says or implies deadline,
  Due, Overdue, late, urgent, SLA, compliance, escalation, risk, response by,
  no-response action, access expiry, performance score, or guaranteed delivery.
- **D47-AC027:** Before save, a fresh server preview states the exact cohort,
  baseline, cutover, and edit/rollback effects ratified through D48 and later
  impact decisions, reports only
  permission-safe aggregates, and discloses no holder/request/capability/
  explanation/per-recipient preference/contact/provider fact.
- **D47-AC028:** Save is an explicit local-draft action with Cancel, expected-
  head server validation, durable inline success/receipt, and identifiable
  recoverable errors; stale/partial/indeterminate proof leaves the published
  policy unchanged and never relies on a toast alone.
- **D47-AC029:** Every affected future control/surface passes WCAG 2.2 AA
  keyboard, name/role/value, focus visible/not obscured, error identification,
  status announcement, contrast/non-color, target, and no-drag-only proof with
  supported assistive technology.
- **D47-AC030:** At 320 CSS pixels and 400% zoom, with long localized/RTL text,
  mobile touch, low bandwidth, reconnect/retry, and time localized outside the
  source zone, no content/action is lost, draft/save duplicates do not occur,
  and source-zone/absolute meaning remains accessible.

### Database, Tenant isolation, RLS, authorization, and privacy

- **D47-AC031:** A future policy/occurrence model, if earned, keys every relation
  by exact Tenant and environment plus appropriate source/request/policy/
  occurrence/member identity; no bare cross-Tenant FK or email/display-name
  relationship is accepted.
- **D47-AC032:** Policy value/version/effective time, request episode, clock
  origin, candidate instant/rule evidence, actor, author, recipient, authority,
  audit attribution, and idempotency identity are server-derived from trusted
  current context and never accepted as authoritative caller input.
- **D47-AC033:** Future policy/source/occurrence/member fields required for
  identity, ownership, state, and history are `NOT NULL` with closed checks and
  composite FKs; invalid mixed policy/state/time/member combinations are
  impossible by database constraints or one authoritative mutation boundary.
- **D47-AC034:** Product uniqueness prevents more than one reminder source
  occurrence for one exact request episode/meaning across all time, retries,
  recipients, channels, policies, restores, and executor/provider dedupe windows.
- **D47-AC035:** Base-table browser writes remain revoked; exact hardened server
  commands perform policy publication, source scheduling, occurrence commit,
  cancellation, and claims. Generic CRUD/upsert/bulk/import/support paths cannot
  perform those mutations.
- **D47-AC036:** Every future table/view/function/RPC/storage/search/cache/
  Realtime path has default-deny Tenant/purpose policies; applicable mutations
  use matching `USING` for current rows and `WITH CHECK` for proposed rows so an
  allowed update cannot transform scope, owner, source, or recipient.
- **D47-AC037:** RLS is forced or equivalent for owner paths; service-role,
  background, migration, support, import, AI, and administrative execution
  pass the same Tenant/source/purpose/cardinality/privacy invariants with no
  broad fallback bypass.
- **D47-AC038:** Future policy management reuses D44's current same-Tenant
  Tenant-wide `permissions.manage_grants` boundary plus the registered exact
  policy-management purpose, live scope/ceiling/floor, Active Tenant Assignment,
  authorization epoch, and expected policy head. D47 adds no capability; D44
  coordinator, task, notification, D45/System Messages, Owner/Admin label,
  support, service-role, or original-grantor status grants nothing by itself.
- **D47-AC039:** Future source and recipient reads/actions reauthorize on every
  enumerate/count/detail/preview/save/claim/compile/prepare/submit/retry/repair
  boundary and return non-oracular typed failures across wrong Tenant, ended/
  recreated assignment, wrong purpose, stale head, and hidden field cases.
- **D47-AC040:** Durable policy/occurrence/claim/audit and operational evidence
  contains only required identifiers and typed codes; protected D43 reason/
  decision, D40 basis, capability/provenance, person/address/body, location,
  peer identity, or behavioral score never enters settings, task, event, log,
  metric, trace, analytics, export, search, cache, AI, or provider payload.

### Temporal semantics, calendar correctness, and policy versioning

- **D47-AC041:** No implementation begins until D48 selects the application
  cohort/baseline, D49 selects recipient binding/route-change behavior, D50
  selects the temporal model, and later impact/channel decisions close every
  remaining executable ambiguity.
- **D47-AC042:** D50 must explicitly choose clock origin, unit, precision,
  arithmetic, absolute-versus-civil interpretation, candidate-instant
  derivation, source/display timezone roles, and reproducibility evidence; D47
  supplies no default.
- **D47-AC043:** D50 must explicitly decide DST gap/overlap, leap day, month/
  year boundary, non-hour offsets, tzdb change, Tenant/recipient timezone edits,
  corrected timestamps, and historical interpretation; no server/database/
  session/browser convention fills a gap.
- **D47-AC044:** D50 must decide whether elapsed duration, Tenant-local calendar
  days, or working days are admitted. If working/business/holiday semantics are
  selected, the later design must own a complete versioned calendar rather than
  treating weekends alone as proof.
- **D47-AC045:** D50 must decide whether and how recipient-local time affects
  display or delivery versus source eligibility; D47 fixes only that different
  localizations cannot create a second source occurrence for one episode.
- **D47-AC046:** D48 must choose exactly which current/future D43 episodes an
  initial On policy may affect, the baseline/cutover used for any included
  current work, and whether application requires a deliberate previewed command.
  D47 enrolls none.
- **D47-AC047:** D48 options remain genuinely open: new requests only;
  deliberate application to a previewed complete current cohort; or automatic
  inclusion of current requests using original age. No code/schema/UI may
  assume one before D48 is recorded.
- **D47-AC048:** A later impact decision must define Off→On, On→Off, shorter/
  longer cadence edits, repeated saves, rollback/re-enable, schedules already
  calculated, occurrences already committed, prepared members, and provider-
  accepted messages. D47 infers no widening/narrowing/cancel/reschedule rule.
- **D47-AC049:** Every future policy revision and selected D48/D50 input is
  immutable semantic input/audit evidence. Policy revision is excluded from the
  source occurrence unique identity, so changing it cannot create a second
  reminder for the same request episode/meaning.
- **D47-AC050:** D50/later failure decision must set bounded late-usefulness and
  outage/catch-up behavior before activation. D47 chooses no grace period,
  late-send/suppress rule, or historical catch-up behavior; every choice still
  preserves one-occurrence and no-deadline semantics.

### Lifecycle, concurrency, idempotency, cancellation, and claims

- **D47-AC051:** Future source cardinality is zero-or-one for exact `(tenant,
environment, D43 request episode, stable courtesy-reminder class)` and is
  independent of policy/reminder contract/render versions, D44 members,
  channels, retries, deployments, and restores.
- **D47-AC052:** A source transaction persists the complete proved temporal
  intent/identity plus durable identifier-only handoff intent atomically, or
  persists neither; crash before commit exposes no schedule and crash after
  commit is reconstructable without client/executor memory.
- **D47-AC053:** Candidate claiming uses one durable product-owned CAS/lock/
  lease identity with bounded recovery; exact concurrent/duplicate wakes
  converge on one result while changed semantic inputs under the same identity
  conflict and never merge partially.
- **D47-AC054:** Before occurrence commit, the claimant re-proves the exact
  request/source/current head plus every policy, impact, recipient, clock,
  authorization, privacy, and usefulness fence ratified through D48–D50 and
  later decisions. False/unknown/stale/indeterminate proof fails closed.
- **D47-AC055:** D43 withdrawal, kept/removed decision, or no-longer-applicable
  source that wins before occurrence commit creates no reminder occurrence;
  later policy/authorization/privacy/usefulness winners follow the exact future
  rules and cannot be guessed or bypassed by replay/recovery.
- **D47-AC056:** A later design explicitly resolves occurrence-commit versus
  source-terminal/member-release races. Regardless of the selected member
  outcome, committed history is immutable, no source decision changes, and no
  second occurrence may be minted.
- **D47-AC057:** Exact replays return the same policy/source/occurrence/member/
  claim receipt. Changed policy revision is new immutable input but cannot
  create a successor source occurrence for the same episode/meaning; D49 and
  channel decisions define any lawful descendant successor identities, and
  changed inputs otherwise hard-conflict instead of mutating an existing key.
- **D47-AC058:** Inngest event IDs/function idempotency, provider keys, task IDs,
  notification IDs, and cache locks are defense in depth only; product database
  uniqueness and claims prevent duplicate business effects beyond 24 hours and
  across executor/provider replacement.
- **D47-AC059:** Cancellation signals to an executor/provider are advisory.
  Because a currently executing step may finish and new runs may enqueue, every
  irreversible product/provider boundary still checks current source/policy/
  recipient/destination eligibility and records an honest accepted/ambiguous/
  suppressed outcome.
- **D47-AC060:** Recovery reconstructs candidate/claimed/stuck work solely from
  product policy/source/occurrence/claim records, uses the same semantic identity
  and current fences, and cannot blind-replay, rekey, rerender, reroute, force-
  release, or mint a replacement reminder.

### D44 recipient binding, membership, and route-change boundaries

- **D47-AC061:** D44 remains the sole owner of coordinator policy and current
  recipient generations; a cadence policy grants no responsibility, authority,
  visibility, assignment, task, contact, channel, or fallback recipient.
- **D47-AC062:** D49 must choose the exact recipient-binding point for a future
  reminder—request application, candidate time, occurrence commit, plan compile,
  or another explicitly defined boundary—and D47 supplies no default.
- **D47-AC063:** D49 must compare snapshot versus current membership, zero/
  `proved_zero`/`indeterminate`, requester exclusion, eligibility loss/restore,
  additions/removals, retry after incomplete proof, and route change before/
  after occurrence/member release.
- **D47-AC064:** Whatever D49 selects, D44's one-to-three configured-member cap
  and complete algebraic resolver remain authoritative, and no recipient/
  route/member change can create a second reminder source occurrence for the
  same D43 episode/meaning.
- **D47-AC065:** A policy revision, D44 route revision, recipient generation,
  member assignment, destination, task, item, or channel identifier is never
  included in source occurrence uniqueness such that churn could mint another
  occurrence; it may appear only in immutable input/member evidence where the
  later contract requires it.
- **D47-AC066:** D49 must preserve D44's cross-Tenant/requester/fallback safety:
  no admin, role, group, original grantor, manager, requester, email alias,
  stale coordinator, or another Tenant is guessed when complete proof fails.
- **D47-AC067:** D49 must define whether and when a current recipient may receive
  zero or one descendant member under the one source occurrence and how exact
  replay versus changed membership conflicts; D47 does not promise delivery to
  every person ever configured.
- **D47-AC068:** Route changes, policy application, and reminder occurrence
  cannot create, duplicate, complete, reprioritize, reassign, reopen, snooze, or
  add a due/reminder field to the existing source-backed D44 task.
- **D47-AC069:** D47 cannot clone, re-unread, rebadge, regroup, or extend
  `holder_access_review_requested_v1` or
  `access_request_responsibility_updated_v1`. Any later reminder presentation
  starts only from its separately ratified one source occurrence after D49.
- **D47-AC070:** Before any recipient/channel release, the later design must
  prove a complete bounded member set/count/digest under one product occurrence
  and exact D49 binding rule. Crash/partial/changed membership cannot expose a
  partial parent or broaden recipients.

### Tasks Hub, Phase 17/6, D45, channels, and Inngest boundaries

- **D47-AC071:** D45 remains immediate initial email only. Its stable keys,
  `profile.access_governance_attention@1`, Tenant plan, recipient preference,
  address, prepared material, provider idempotency, and outcome cannot create,
  represent, retry, suppress, or count as a future reminder.
- **D47-AC072:** D47 adds no Phase 17 census/catalog/manifest key, producer
  binding, fact, action, presentation policy, Delivery Step, profile, plan
  choice, content variant, or generated binding for a reminder.
- **D47-AC073:** If later admitted, the reminder uses one new stable source
  meaning over the one Phase 12 occurrence. Transport changes extend its
  reviewed fixed plan generation; they do not create channel-specific source
  keys or another source occurrence.
- **D47-AC074:** Every future in-product, email, push, Slack, Teams, Google Chat,
  SMS, webhook, or other step independently proves destination/install,
  consent/preference/suppression, content/minimization, sender/connection,
  idempotency, callback/outcome, accessibility, privacy/retention, rate/abuse,
  rollout, and shutdown. D47 admits none.
- **D47-AC075:** Tasks Hub stays work rather than a delivery channel. Task age,
  due/reminder fields, completion, priority, snooze, reassignment, read state,
  cache, worker, or user engagement cannot schedule or satisfy a reminder.
- **D47-AC076:** Phase 17/6 may later present/deliver only an already-committed
  registered source occurrence; its plan, preference, retention, provider,
  engagement, retry, or failure cannot create source time or another occurrence.
- **D47-AC077:** A future workflow event contains only versioned opaque product
  identifiers and safe routing metadata, never policy prose, D43 reason/
  decision, capability/provenance, person/address/body, recipient list, channel
  secret, or caller-selected authority.
- **D47-AC078:** Inngest `sleep`, `sleepUntil`, event `ts`, cron, replay, debounce,
  concurrency, rate limit, 24-hour event/function idempotency, run state, and
  trace retention are implementation aids only and cannot satisfy product
  occurrence uniqueness, source time, authorization, or recovery proof.
- **D47-AC079:** Executor cancellation cannot replace product fences because a
  current step can finish and new runs can enqueue. Disabling/replacing Inngest
  leaves all policy/source/occurrence/claim/audit records and manual/product
  reconciliation valid.
- **D47-AC080:** No generic `channels[]`, notification Boolean blob, reminder
  adapter, schedule table, arbitrary webhook, provider-neutral content payload,
  rules engine, workflow node, or channel fallback is created as a D47
  extensibility seam.

### Failure, privacy, observability, scalability, and operations

- **D47-AC081:** D47 authorizes no new runtime telemetry, log field, event,
  metric, trace, snapshot, dashboard, scheduled query, alert, warehouse model,
  or individual score. Named monitors below are evidence/release labels only.
- **D47-AC082:** Current monitoring uses only CI/release document/schema/API/
  registry/UI/code audits, already-authorized security/incident/support records,
  and separately approved time-bounded research; absence of a signal does not
  authorize collection.
- **D47-AC083:** Existing support/incidents may trigger root-cause review but
  cannot label a request/person late, infer cadence value, enroll work, contact
  a coordinator, change routing/access, or activate a reminder.
- **D47-AC084:** A future implementation must separately register minimized
  product-owned operational signals for policy/occurrence/claim/member/channel
  invariants with safe numerator/denominator/retention/access and no protected
  body or person-performance dimension; D47 does not register them.
- **D47-AC085:** Product-owned immutable policy/source/occurrence/member/audit
  evidence remains distinct from executor/provider logs and advisory engagement.
  A vanished trace, delivered/opened message, or task read cannot prove human
  awareness, request outcome, or source correctness.
- **D47-AC086:** Future capacity design has exactly one source temporal intent/
  occurrence per admitted D43 episode and D44's maximum of three candidate
  personal recipients. No quantitative request/Tenant/throughput/latency limit
  is asserted until production-shaped benchmarks publish exact units and budgets.
- **D47-AC087:** Candidate-work selection is indexed, keyset/bounded, Tenant-fair, and
  set-based; no browser/client timer, full-table scan, one sleeping run per
  channel/member, per-row N+1 authorization, local-midnight herd, or unbounded
  cohort/backfill is permitted by an eventual design.
- **D47-AC088:** Future flow control defines measured batch/concurrency/rate/
  backlog/oldest-claim thresholds and recovery ownership from benchmark/load
  evidence. Vague “large,” “fast,” “scalable,” or vendor default limits cannot
  satisfy release proof.
- **D47-AC089:** No policy, preview, source occurrence, member, channel, monitor,
  analytics, audit reader, export, support tool, or AI path exposes/ranks a
  coordinator's age, response, open/click/read, delivery, workload, or
  performance; aggregate research never becomes an employment/volunteer score.
- **D47-AC090:** Crash before/after every source/claim/member/prepare/submit/
  callback boundary, lost response, duplicate/out-of-order event, ambiguous
  provider acceptance, source terminality, policy edit, route change, and
  executor outage has an exact future outcome before release; no blind resend,
  fallback, or fabricated success is allowed.

### Migration, rollout, rollback, kill, and repair

- **D47-AC091:** D47 rollout is documentation reconciliation plus focused
  no-artifact audits only. It has no runtime flag, canary Tenant, shadow timer,
  schedule, provider call, data migration, or current-work enrollment.
- **D47-AC092:** A later implementation cannot begin until D48 application,
  D49 recipient binding, D50 temporal model, policy-edit/failure semantics, and
  at least one separately reviewed presentation/delivery contract are recorded
  with traceable requirements and proof.
- **D47-AC093:** Future migration uses readers/deny behavior before writers:
  new code against absent/old/unknown policy resolves Off, and old code cannot
  interpret or execute a new policy/source occurrence by convention.
- **D47-AC094:** Existing pending/terminal D43 requests, D44 route/recipient
  generations, tasks/items, D45 intents/outcomes, generic task fields, finance
  reminders, provider schedules, and workflow runs are not inferred as D47
  state before or outside the exact D48-ratified cohort rule.
- **D47-AC095:** Any future application to current work uses only the complete
  D48-selected authoritative cohort and baseline through a deliberate source
  contract; partial scans, client lists, stale caches, per-channel fanout, or
  migration-time guessing cannot enroll work.
- **D47-AC096:** Future rollout stages source reader/deny paths, immutable policy
  publication, source temporal intent, claims/reconciliation, recipient compile,
  presentation/channel adapters, and external submission so each can be killed
  independently while Access requests/D43 decisions remain available.
- **D47-AC097:** Before enabling writers/sends, production-shaped no-send proof
  validates mixed versions, zero/one/three recipients, every D48 cohort option
  selected, D49/D50 boundaries, source terminality, duplicate claims, stale
  policy, cross-Tenant denial, outage/backlog, and no-deadline copy.
- **D47-AC098:** A future kill disables new policy application/source occurrence
  production and each presentation/channel executor independently without
  deleting source/audit history, changing D43/access, fabricating task/item
  engagement, or breaking existing source-lane recovery.
- **D47-AC099:** Rollback after policy/occurrence data exists is forward-safe:
  unknown generations fail Off/non-executable; committed history remains; any
  provider-accepted message is non-retractable; no old key/row/job is reinterpreted
  and no automatic correction/reminder is sent.
- **D47-AC100:** Repair identifies exact Tenant/environment/request episode/
  policy input/occurrence/member/channel identities, quarantines unsubmitted
  invalid work, reconciles from authoritative owners, preserves incident/
  immutable evidence, avoids broad age-based mutation, and never rekeys,
  rerenders, reroutes, force-releases, or blind-resends.

### Testability, traceability, accessibility, and production proof

- **D47-AC101:** D47-R1–R30 and D47-AC001–AC120 retain stable identifiers and
  trace consistently into glossary, ADRs, Phase 12/17, OpenSpec, design, tasks,
  GitHub tickets, implementation, tests, migration, runbooks, and release
  evidence before a later activation.
- **D47-AC102:** Positive tests prove D43/D44/D45 current behavior remains
  complete with no reminder: long-pending requests remain in the source lane;
  current tasks/items remain durable; optional initial email stays independent;
  D43 terminal actions remain source-owned.
- **D47-AC103:** Negative tests/audits reject every dormant field/key/step/
  preference/control/event/job/provider/runtime path and every attempt to use
  request/task/item/email/provider/executor age or state as current D47 truth.
- **D47-AC104:** Authorization tests cover same/wrong Tenant, Active Tenant
  Assignment ended/recreated, exact `permissions.manage_grants` plus registered
  policy purpose, scope/ceiling/floor, requester/self, hidden field, stale heads,
  RLS `USING`/`WITH CHECK`, owner/service/support/import/AI paths, and uniform denial.
- **D47-AC105:** Concurrency/idempotency tests cover double save, changed policy
  under same head, concurrent source terminality, duplicate/out-of-order wake,
  crash at every transaction/claim boundary, replay after more than 24 hours,
  restore/reconciliation, and permanent one-episode/meaning uniqueness that
  excludes policy revision.
- **D47-AC106:** After D48, tests encode all chosen current/future cohort,
  baseline, cutover, edit, repeated-save, rollback, and no-unselected-path
  outcomes; before D48, architecture tests prove no writer assumes any option.
- **D47-AC107:** After D49, tests encode selected binding, zero/indeterminate,
  requester exclusion, 0/1/3 member, route/eligibility loss/restore, retry, and
  before/after occurrence outcomes; before D49, no recipient adapter is Live.
- **D47-AC108:** After D50, tests encode the selected clock across exact boundary
  instants, zones, DST gaps/overlaps, leap/month/year transitions, tzdb/timezone
  changes, corrections, lateness/outage, and localization; before D50, no time
  calculation is executable.
- **D47-AC109:** UX/accessibility proof covers admin, coordinator, holder,
  authorized reviewer, no-access user, long localized/RTL copy, keyboard,
  screen reader, 320-pixel/400%-zoom reflow, touch, low bandwidth, reconnect,
  stale save, and comprehension of courtesy/no-due/no-access consequence.
- **D47-AC110:** Production-shaped performance/recovery proof publishes exact
  dataset/units/budgets and tests Tenant fairness, indexed candidate selection,
  bounded 0–3 fanout, backlog/oldest work, claim expiry, duplicate recovery,
  executor removal, provider ambiguity, rollback, and exact repair outcomes.

### Monitor discipline, evidence quality, and next-decision boundary

- **D47-AC111:** Every named monitor below identifies a signal, threshold,
  owner, and response and is an acceptance/release label—not authorization to
  add telemetry, tables, jobs, events, dashboards, alerts, or user contact.
- **D47-AC112:** The no-artifact release audit fails on any D47 runtime/schema/
  config/catalog/API/UI/event/job/provider artifact and blocks/removes it rather
  than legitimizing it with an Off default or feature flag.
- **D47-AC113:** Governing-document drift audit fails on any contradiction in
  policy eligibility, default Off, finite choices, one episode occurrence,
  no-deadline/access meaning, owner boundaries, or D48–D50 unresolved status.
- **D47-AC114:** UX/content release audit fails on any due/overdue/SLA/urgency/
  deadline/escalation/performance or working-day claim unsupported by a later
  decision and comprehension proof, including accessible names/descriptions.
- **D47-AC115:** Existing security/privacy incident intake treats any cross-
  Tenant, wrong-recipient, protected-body, executor-payload, provider, export,
  analytics, or person-score exposure as an incident; it does not create a new
  D47 monitoring pipeline.
- **D47-AC116:** Research readiness is satisfied only by the approved
  preregistered representative brief and evidence package; a monitor threshold
  can trigger review but never pick a cadence or activate code.
- **D47-AC117:** Any future reminder artifact before D48 application, D49
  recipient, D50 time, later policy-edit/failure, and channel decisions is an
  admission failure requiring freeze/removal—not a reason to answer implicitly.
- **D47-AC118:** Research/release evidence labels verified repository facts,
  verified external facts, reasonable inferences, product judgments,
  assumptions, and unresolved unknowns separately; no vendor behavior is
  represented as a governing Core requirement.
- **D47-AC119:** D48 remains the one next decision: whether a later first On
  policy affects new requests only, a deliberately previewed current cohort,
  or all current requests automatically from original age. D47 chooses none.
- **D47-AC120:** D47 succeeds only when Option 1 is recorded as conditional
  future eligibility, current Core remains reminder-free and clear, every
  fixed invariant is testable, disputed impact/recipient/time choices remain
  visibly gated, and no technical debt or false UX promise is introduced.

## Named monitors without new telemetry authority

These are acceptance/release evidence labels. D47 authorizes **no** runtime
metric, log field, event, table, scheduled query, job, dashboard, alert, user
tracking, or notification. CI/release audits inspect artifacts already produced
by development; incident/support rows mean only existing authorized intake;
research means a separately approved, time-bounded, privacy-reviewed study.
Signals may block/research/repair but can never choose a cadence, classify a
request as late, contact a person, alter routing/access, or activate runtime.

| Signal                                      | Threshold                                                                                                                                                                                                                                     | Owner                                                                                | Required response                                                                                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D47-NO-ARTIFACT-RELEASE-AUDIT`             | Any D47 field/table/enum/key/step/plan/preference/flag/API/event/job/provider template/UI control/runtime artifact                                                                                                                            | Architecture + affected owner                                                        | Block release; remove the artifact/compatibility promise; verify no data/work/provider effect exists; retain only docs.                                                   |
| `D47-GOVERNING-DRIFT-AUDIT`                 | Any glossary/ADR/PRD/OpenSpec/design/task/ticket/test text contradicts conditional eligibility, default Off, finite choices, zero-or-one episode occurrence, no-deadline/access meaning, owner boundaries, or unresolved D48–D50              | Product Governance + Architecture                                                    | Stop reconciliation, correct every authority artifact, preserve decision identifiers, and repeat focused semantic audit.                                                  |
| `D47-FALSE-DEADLINE-UX-AUDIT`               | Any visible/programmatic Due/Overdue/late/urgent/SLA/deadline/escalation/performance/working-day claim not separately ratified/proved                                                                                                         | UX + Accessibility + Access Product                                                  | Block surface, remove false semantics from copy/style/accessible description, run comprehension/accessibility proof, and do not substitute another number.                |
| `D47-OCCURRENCE-IDENTITY-DESIGN-GATE`       | Any proposed uniqueness includes policy revision, recipient/member, route revision, task/item, channel, provider, or executor such that one D43 episode/meaning could mint more than one source occurrence                                    | Data Integrity + Phase 12                                                            | Reject design/schema; restore episode/meaning uniqueness; keep policy/recipient/channel only as immutable input/descendant evidence; re-run concurrency proof.            |
| `D47-D48-IMPACT-GATE`                       | Any source writer, schedule, migration, preview copy, or rollout assumes new-only/current-cohort/original-age behavior before D48                                                                                                             | Access Product + Architecture                                                        | Freeze/remove artifact, make impact unresolved again, ask/record D48, then redesign only to the selected cohort/baseline.                                                 |
| `D47-D49-RECIPIENT-GATE`                    | Any recipient/member adapter assumes a binding point, zero/indeterminate, route-churn, retry, or new/removed-member outcome before D49                                                                                                        | IAM + Notifications/Tasks                                                            | Freeze/remove adapter, preserve D44 source lane/routing, ask/record D49, and re-prove no second source occurrence.                                                        |
| `D47-D50-TIME-GATE`                         | Any executable duration/timezone/calendar/DST/holiday/lateness/catch-up calculation before D50                                                                                                                                                | Phase 12 + Data Platform + SRE                                                       | Disable/remove computation, verify no temporal rows/jobs exist, ask/record D50, and require exact temporal proof before reintroduction.                                   |
| `D47-RESEARCH-EVIDENCE-GATE`                | Evidence package lacks independent approval, representative recruitment, root-cause distinction, preregistered criteria, comprehension, accessibility, privacy/fatigue/harm, or limitation statement                                          | Access Product + UX Research + IAM/Security + Privacy + Accessibility + Architecture | Keep policy class inactive/Off; repair/repeat research or reject proposal; never weaken gate or launch an experiment runtime.                                             |
| `D47-AUTHORITY-BOUNDARY-AUDIT`              | Proposal invents a new D47 capability or permits coordinator/task/notification/D45/System Messages/Owner/Admin/support/service status without current same-Tenant `permissions.manage_grants` plus registered policy purpose and D44 boundary | IAM + Security                                                                       | Block design, restore existing D44 authority/purpose/ceiling/floor/expected-head checks, and add uniform negative-path proof.                                             |
| `D47-EXISTING-SECURITY-INCIDENT-INTAKE`     | Existing authorized incident process receives any cross-Tenant/wrong-recipient/protected-payload/provider/export/analytics/AI disclosure connected to a reminder-like path                                                                    | Security + Privacy + IAM                                                             | Contain exact path, preserve/minimize evidence, assess notification duties, suppress unsubmitted work, repair owner/field fences, and do not create a D47 telemetry feed. |
| `D47-SUBSTANTIATED-MISSED-ATTENTION-REVIEW` | Existing support/research intake substantiates that current lane/task/item/optional-initial-email IA was missed under then-current lawful routing                                                                                             | Access Product + UX Research                                                         | Fix a verified IA/routing defect first or approve the bounded independent research brief; never infer an interval, late status, or automatic contact.                     |
| `D47-PERSON-SCORING-RELEASE-AUDIT`          | Any design/query/report/analytics/support/AI output ranks or exposes individual age/response/read/open/click/delivery/workload/performance                                                                                                    | Privacy + Product Governance                                                         | Block/remove output, audit use, purge derived data where lawful, restore aggregate product-research-only purpose, and document incident/repair.                           |

## Migration, rollout, rollback, kill, and repair

### D47 rollout now

1. Record the exact eligibility decision, 30 requirements, 120 acceptance
   criteria, 22-category review, monitor discipline, and D48 boundary across
   the decision log and governing artifact chain.
2. Reconcile D43–D46, CONTEXT, ADR-0026/0027/0183/0184, Phase 12/17, and
   workflow OpenSpec so none says D47 picked a cohort, recipient binding,
   calendar/clock, channel, or runtime.
3. Run focused no-artifact/semantic/identifier audits only. No schema/config/
   registry/API/UI/job/provider check may “fix” absence by creating a placeholder.
4. Ask D48 next. D49 recipient binding and D50 clock/calendar follow as their
   own decisions; policy-edit/failure/channel decisions follow before executable design.
5. Gather evidence only through the separately approved research gate. Current
   product operation remains D46 no-reminder.

### Future rollout sequence, if evidence and later decisions admit the feature

1. Close the evidence gate and D48–D50 plus policy-edit/failure/channel decisions.
2. Reconcile glossary/ADR/OpenSpec/design/tasks/tickets/test trace and prove one
   source occurrence identity independent of policy revision/recipients/channels.
3. Add fail-closed readers and mixed-version deny behavior before policy/source
   writers; absence/unknown/incompatible resolves Off.
4. Add immutable Phase 12 policy/source temporal records and product-owned
   handoff/claim/reconciliation under exact DB/RLS/authorization constraints.
5. Implement only the D48-selected application cohort/baseline, D49-selected
   member behavior, and D50-selected temporal model. Unselected paths remain
   rejected and unrepresented.
6. Add one reviewed Phase 17/6 presentation/channel at a time after complete
   member release; Tasks and D45 remain independent.
7. Complete no-send production-shaped, accessibility/comprehension, security/
   privacy, concurrency, performance/fairness, outage, mixed-version, rollback,
   and repair proof before any Tenant can enable it.
8. Activate only through the exact authorized Tenant source-policy save and
   D48-selected effect. Never run a migration/backfill/canary reminder by age.

### Migration and upgrade rules

- D47 runs no migration. Existing absence is not an Off row to backfill.
- Existing `created_at`, task due/reminder, finance SLA, notification age,
  provider timestamp, D45 delivery, and workflow state are not policy/source
  occurrence data.
- Future new code on old/absent/unknown schema/policy fails Off/non-executable;
  old code cannot interpret new policy/occurrence rows or event names by convention.
- Existing pending requests are affected only by the exact D48 decision and
  later ratified baseline/cutover. Until then, none is enrolled or labeled missed.
- Policy revision participates in immutable semantic input/audit hashing but not
  unique source occurrence identity; migrations cannot use a revision change to
  create a successor occurrence for the same request episode/meaning.
- Expand/contract changes preserve old-reader denial and immutable history;
  destructive rollback or dual-write to a generic task/reminder store is forbidden.

### Rollback and kill

- D47 currently has no runtime, data, or feature flag to roll back. Documentation
  rollback cannot revive D46-prohibited behavior.
- A future implementation independently kills policy application/source
  occurrence production, candidate-work claiming, recipient compilation, each
  presentation/channel, and provider submission while preserving D43 source
  lane/actions and immutable history.
- Off/On/current-work/edit effects after activation follow only later ratified
  semantics; operators cannot improvise an emergency cohort, reschedule, or send.
- Provider-accepted external communication is non-retractable; rollback records
  honest outcome, suppresses what remains legally/currently suppressible under
  the later contract, and sends no automatic correction/duplicate.
- Executor removal cannot delete or redefine product source time/identity;
  product records and manual/product reconciliation remain sufficient.

### Repair

- Identify exact Tenant/environment/request episode/reminder meaning/policy
  input/occurrence/member/channel; never perform broad age-range mutation.
- Quarantine invalid/unsubmitted work, preserve immutable incident/provider
  evidence, and reconstruct only from authoritative Phase 12/D44/Phase 17/6
  records under the selected D48–D50 semantics.
- Never change policy revision/recipient/channel/executor identity to evade the
  one-occurrence constraint; changed evidence hard-conflicts or follows an
  explicitly permitted descendant repair, not a new source occurrence.
- Remove false deadline/urgency UI and protected data copies without replacing
  them with another arbitrary interval or deleting legitimate source/audit history.
- No direct database force-send, manual provider resend, fallback recipient,
  fabricated read/completion, source/access mutation, or AI-selected repair is allowed.

## Ruthless synthesis

### Resolved before D47 is recorded

1. **Modern-practice claim is bounded.** Current IAM/CMS/CRM/nonprofit CRM
   examples validate source-owned finite timing and separate notification
   controls; they do not validate a D43 no-deadline cadence. Independent ministry
   evidence remains mandatory.
2. **D47 is eligibility, not implementation.** Current Core remains D46
   no-reminder with no dormant artifact or UI promise.
3. **The policy class is narrow.** Future default is Off; only a small code-owned
   finite choice set may be admitted; no arbitrary timer/calendar/workflow DSL.
4. **Meaning and cardinality are fixed.** At most one courtesy/still-waiting
   source occurrence per exact D43 request episode/meaning; zero deadline,
   urgency, SLA, performance, request, or access consequence.
5. **Ownership is coherent.** Phase 12 owns policy/source occurrence; D44 owns
   responsibility; Tasks own work; Phase 17/6 own presentation/delivery;
   providers own provider evidence; Inngest remains replaceable execution.
6. **Authority reuses Core.** Policy management later uses D44's existing
   current same-Tenant Tenant-wide `permissions.manage_grants` plus registered
   policy-management purpose/scope/ceiling/floor/head—not a new capability.
7. **Policy edits cannot evade cardinality.** Policy revision is immutable input
   and audit/hash evidence, not source occurrence uniqueness; a new revision
   cannot mint another reminder for the same episode/meaning.
8. **Unresolved choices stay visible.** D48 decides current-versus-future
   application; D49 recipient binding; D50 clock/calendar. D47 does not infer
   pinning, backfill, suppression, reschedule, route timing, or late behavior.
9. **UX remains quiet and truthful.** No control now; any future source editor
   stays in Access requests, uses finite accessible controls/no-deadline copy,
   and previews the exact later-ratified impact.

### Requirements to carry into specification and design

- D47-R1–R30, D47-AC001–AC120, ownership/invariant matrices, unresolved impact/
  race tables, monitor discipline, rollout/rollback/repair contract, and D48 boundary.
- Explicit one-per-episode/meaning product uniqueness excluding policy revision,
  recipients, tasks, items, channels, providers, and executor identities.
- Evidence classification and admission package with preregistered representative
  research/comprehension/accessibility/privacy/fatigue/harm criteria.
- Same-Tenant composite DB relationships, RLS `USING`/`WITH CHECK`, forced owner/
  privileged parity, trusted server attribution, expected heads, immutable audit,
  product claims/idempotency, and replaceable identifier-only execution.
- No current schema/config/catalog/API/UI/job/telemetry placeholder and no
  external-channel authorization through D47.

### Implementation safeguards required now

1. Keep D43 source-backed work excluded from generic task/finance reminder APIs.
2. Keep D44 lane/task/item and D45 initial-only email behavior independent of age.
3. Reject unregistered reminder fields/keys/events/jobs rather than tolerantly
   storing them.
4. Run CI/release/document drift audits only; add no D47 telemetry or scheduler.
5. Block every future writer until D48–D50 and remaining admission decisions are
   explicit and traceable.

### Risks permitted only under named monitoring

- **Speculative artifact:** `D47-NO-ARTIFACT-RELEASE-AUDIT`; threshold any;
  owner Architecture + affected owner; response block/remove/re-prove zero.
- **False deadline:** `D47-FALSE-DEADLINE-UX-AUDIT`; threshold any;
  owner UX + Accessibility + Access Product; response remove semantics and
  repeat comprehension/accessibility proof.
- **Implicit application policy:** `D47-D48-IMPACT-GATE`; threshold any writer/
  UI/migration assumption before D48; owner Access Product + Architecture;
  response freeze/remove and record D48.
- **Implicit recipient/time policy:** `D47-D49-RECIPIENT-GATE` or
  `D47-D50-TIME-GATE`; threshold any adapter/calculation before its decision;
  owner IAM/Notifications or Phase 12/Data/SRE; response freeze/remove and ask
  the exact decision.
- **Evidence insufficiency:** `D47-RESEARCH-EVIDENCE-GATE`; threshold any missing
  gate; owner cross-functional approval group; response remain Off/no-build and
  repair/reject research, never launch an experiment runtime.

## Exact final D47 decision to record

> D47 adopts Option 1 with required safeguards: an independently validated,
> bounded, default-Off Tenant cadence may later qualify as Phase 12 source policy
> for at most one courtesy reminder occurrence per exact D43 request episode.
> The occurrence can mean only that an access review is still waiting. It creates
> no due date, Due/Overdue/late/urgent state, SLA, priority, escalation,
> no-response action, performance fact, request transition, grant/access change,
> or guarantee that a person/channel receives or notices anything.
>
> D47 itself creates no setting, policy key/row, schema field/table, enum,
> message key, Delivery Step, preference, content, API/event, queue/claim, cron/
> Inngest function, provider artifact, feature flag, telemetry, or UI placeholder.
> Missing/unknown/incompatible future policy is Off; any later choices are a
> small versioned code-owned set, never free-form duration/calendar/rule/workflow.
>
> Phase 12 owns future policy/source occurrence truth. D43 remains request truth;
> D44 remains current responsibility truth; ADR-0183 Tasks Hub remains work;
> ADR-0027/Phase 17 and Phase 6 remain presentation/delivery; D45 remains initial
> email only; providers remain provider evidence; Inngest is optional identifier-
> only execution. A policy revision is immutable input/audit/hash evidence but
> not occurrence uniqueness, so revisions, recipients, routes, tasks, items,
> channels, providers, retries, or executors cannot create a second source
> reminder for one request episode/meaning.
>
> Before implementation, independent representative research must satisfy its
> preregistered need, comprehension, accessibility, privacy, fatigue, and harm
> gates. D48 must decide application to current versus future requests; D49 must
> decide D44 recipient binding and route-change outcomes; D50 must decide the
> exact clock/calendar/timezone/lateness model; policy-edit/failure/channel
> decisions must close remaining ambiguity. D47 chooses none of those behaviors.
> Until they are recorded and proven, current Core stays reminder-free.

## D48 — Which requests does a later first On cadence affect?

### Why this needs a separate decision

Suppose a later evidence package qualifies **one courtesy reminder after the
selected cadence**, and Hope Mission enables it while 12 D43 requests are
already pending. Some are one day old; others are 60 days old. D47 says cadence
may qualify and there can be at most one occurrence per episode, but it
deliberately does not say whether those 12 requests enter the policy or what
time baseline applies.

This choice materially changes UX and operational risk. Automatic original-age
inclusion can immediately release a backlog burst and make an optional nudge
feel punitive. Ignoring all current work is the simplest and safest but means
older requests never receive this feature. A deliberate apply-current action can
include them without a burst if it uses a new baseline, but adds an explicit
impact preview/application workflow. D48 decides only first application;
recipient binding and clock semantics remain D49 and D50.

### Option 1 — new request episodes only — recommended

The first On revision affects only D43 request episodes created after its trusted
cutover. Every request already pending remains under the existing lane/task/item
recovery model and receives no cadence reminder from that activation.

**Example:** Enabling the policy with 12 open requests previews **0 existing
requests will be added. This applies to new requests only.** The next newly
submitted request may become eligible under later D49/D50 rules.

**UX/impact:** quiet, predictable, no historical scan/baseline/backlog burst,
and easiest to roll out and explain. The trade-off is that current missed work
does not receive the new nudge.

### Option 2 — separate deliberate application to the complete current cohort

Saving On affects new requests. A second explicit, authorized, fresh-previewed
source action may apply the cadence to the complete current pending cohort using
one new application baseline rather than each request's original age. Partial
selection and per-request picking are unavailable.

**Example:** After enabling, the administrator sees **12 current requests are
not included** and may choose **Apply reminder policy to current requests**.
Confirmation explains they start from the application baseline; no immediate
catch-up message is produced merely because an old request is 60 days old.

**UX/impact:** gives intentional current-work coverage without an immediate age
burst, but adds a second consequence preview, source application generation,
idempotency, cancellation, audit, and recovery path.

### Option 3 — automatically include all current requests from original age

Enabling On automatically enrolls every current pending request and computes
eligibility from its original source timestamp. Requests already beyond the
selected cadence may become immediately eligible under later D49/D50 rules.

**Example:** Saving with 12 pending requests may make several old requests eligible
at once, potentially producing up to one source occurrence each and several
recipient/channel members.

**UX/impact:** fastest current-work coverage and least extra configuration, but
highest surprise, load, privacy, notification-storm, rollback, and false-
urgency risk. It turns a settings save into a broad current-work operation.

### Recommendation and exact question

**My recommendation is Option 1 — new request episodes only.** It matches D47's
default-Off courtesy posture and current Core's preference for explicit source
effects without inventing an application workflow before its need is proven.
It is the clearest UX: one save, one concise preview, no hidden historical
cohort, no immediate burst, and no ambiguity about old request age. If research
later proves current-work application necessary, Option 2 is the strongest
alternative because it makes that effect deliberate and uses a new baseline;
Option 3 is not proportionate for a no-deadline nudge.

When a later D47 cadence is first enabled, which requests may enter it:
**Option 1 — only new request episodes after cutover**, **Option 2 — new requests
plus one separately confirmed complete current cohort using a new application
baseline**, or **Option 3 — all current requests automatically using original
age**? You may amend any option.

# ADR-0026: Contract-bounded Delivery Plans

**Status:** Accepted (founder ruling, Phase 17 grill session — D7)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D7).

## Context

One business event can require an immediate receipt, a later reminder, an
in-product alert, or an escalation. Putting those steps in producer code makes
tenant-safe variation difficult; giving tenants a general workflow graph inside
System Messages duplicates Phase 34 and creates another timing and state engine.

## Decision

Each message contract declares only a small, versioned set of fixed, named
Delivery Plan step slots and permitted choices. The producer owns the event,
facts, recipient authority, business eligibility, timing fences, cancellation
fences, and source truth. Phase 17 owns the contract's bounded capability
envelope: which named steps may be enabled, disabled, delayed, escalated, or
assigned a permitted channel. Authorized tenant staff publish the
tenant-specific **Delivery Plan** by choosing only among those declared options.
For platform scope, the exact meaning-specific platform profile instead declares
one immutable Asym-owned fixed plan/version; it cannot resolve tenant
configuration or be altered by tenant staff.

Every authoritative producer occurrence enters Phase 6 through one bounded
`compileAndReleaseCommunicationPlanOccurrence` command. The producer supplies
one `plan_occurrence_token@1`, the source occurrence and fence, the complete
bounded candidate facts (which may be empty), and independent member tokens. The
top-level token is canonical opaque 1–128-byte UTF-8, PII/secret-free, unique
within the stable producer namespace, and retained raw only by the producer for
replay; Phase 6 stores its schema/version and derived slot hash, never raw bytes.
The generated registry—not the producer—resolves top-level scope/event/contract/
plan authority even for zero candidates plus every exact immutable binding
projection and effective plan.
Phase 6 inserts or locks one unique `communication_plan_occurrences` coordination
header and inserts or exactly replays the complete canonically ordered child set
in one PostgreSQL transaction. It verifies the exact compilation hash, member
count and digest, then writes `released_at` last. Claim SQL admits a child only
through its released same-scope parent. Exact retries return the prior header
and children, including a valid zero-member result; changed plan, binding,
condition, recipient, membership, count, digest, or child input under the same
plan-occurrence token hard-conflicts without partial eligibility.

After atomic release, every eligible step remains its own recipient-specific
Phase 6 intent with an independent occurrence slot and outcome. An eligible
external-delivery intent proceeds through its channel executor. An eligible
`in_product` intent creates one local `available` event and the Asym/Postgres
role-safe Phase 17 attention projection; it creates no provider submission,
provider state, or provider outcome. The coordination header is not a workflow
run, scheduler, outbox, queue, communication ledger, or outcome truth, and a
step cannot write business records.

Delivery Plans MUST NOT expose arbitrary event creation, audience queries,
free-form recipients, formulas, code, nested branches, loops, waits unrelated
to a producer-owned clock, record mutations, tasks, or general automation.
Those capabilities remain Phase 34 workflow definitions. A plan and its
effective revision are pinned before execution; later edits affect only future
eligible events.

**Phase 24 D45 clarification (2026-08-29).** The two D44 access-request
contracts use one bounded profile with a required `staff_in_product` slot and
one optional immediate `staff_email` slot. The system/default Tenant plan keeps
email Off. The recipient's closed
`preference.access_request_responsibility_email@1` is `inherit | disabled`;
absence means `inherit`, which follows a deliberate Tenant On, while `disabled` always
suppresses email and no administrator can override it. The required in-product
member is compiled independently and cannot be disabled, delayed, replaced,
completed, or made conditional on email.

One atomic `profile.access_governance_attention@1` family-plan selection
governs both exact D44 `staff_email` slots. Mixed per-key On/Off is invalid, and
On can publish only when both keys' contract, publication, and Resend/Sender/
Reply readiness dependencies are compatible. Their source occurrences,
recipient members, safe renders, and delivery identities remain separate.
The effective family-plan value is exactly
`email_disabled | email_enabled`; missing, legacy, unknown, or unproved state
resolves to `email_disabled`, and only a current same-Tenant actor with
`system_messages.plan.manage` may publish its successor.

The compiler admits the email member only when every narrowing gate is current:
the Live contract permits the slot; the published Tenant plan enables it; the
recipient preference is not `disabled`; the exact D44 responsibility generation,
D43 source, recipient assignment/Party/role, source visibility, and decision
authorization remain current; the server resolves one current owned and
contactable email revision with no applicable suppression; and the exact
Tenant-owned Resend connection, Sender Profile, and reply purpose are Ready.
Missing, false, stale, indeterminate, or contradictory proof produces a typed
non-applicable/suppressed email result without changing the required in-product
member or guessing another address, recipient, sender, account, or channel.

For a newly opened request, the plan contains at most one email member per exact
admitted D44 recipient. A responsibility application that assigns several
already-pending requests keeps one Tasks Hub projection per request but compiles
at most one grouped email member per exact recipient and source-owned
responsibility-application generation. The grouped message carries only its
immutable initial safe count and authenticated Access requests action; it never
fans out one email per child request or enumerates subjects. Each email intent,
prepared artifact, provider attempt/outcome, and advisory engagement has its own
semantic identity and cannot mark the sibling notification read, the task done,
the request resolved, or access changed.

Tenant-plan/preference enablement is future-only and does not add an omitted
member to a released occurrence; `disabled`→`inherit` and contact/readiness
repair are the same future-only widening. Tenant Off, `inherit`→`disabled`, and
source/authorization/contact/suppression/readiness loss re-prove immediately
before external submission and suppress any not-yet-submitted optional email,
including prepared work, without mutating or rerendering its sealed artifact.
Provider-accepted mail is non-retractable. No path replays current/historical
requests or revives an ended generation; a later source-authorized request or
responsibility-application generation evaluates the then-current gates. D45 adds no timer,
reminder, digest, escalation, SMS, push, Slack, Microsoft Teams, Google Chat, or
generic webhook step.

Any future channel must be a separately registered code-owned channel/profile/
step with its own recipient and destination authority, installation/readiness,
preference/consent/suppression, safe rendering, idempotency, delivery evidence,
retention, tenant isolation, and proof pack. It may reuse this bounded
plan/compiler and Phase 6 intent seam only through a new reviewed schema
generation. When the business meaning is unchanged, that generation extends
the same stable message key and source occurrence with a named channel step; it
does not mint a channel-specific key or duplicate source event. Only changed
business meaning warrants a successor key. Neither a generic notification
setting nor a Tenant-authored DSL may turn it on. SMS additionally remains
blocked by ADR-0028.

**Phase 24 D46 clarification (2026-08-29).** D43 presently defines no due
instant, expiry, risk transition, service level, or other ratified temporal
requirement. D47 now permits one bounded timing-pair candidate to qualify as a
version-controlled Phase 12 source-policy proposal even without another
lifecycle obligation; that qualification does not activate or choose a cadence.
Its D44 attention contracts therefore have no reminder occurrence, reminder
Delivery Step, stable reminder key, reminder row, `remind_at`, scheduled worker,
Inngest sleep, Tenant reminder choice, or placeholder UI. An elapsed record age,
task field, notification state, Delivery Plan, Tenant preference, or executor
clock cannot invent business time or authorize a timed communication.

A later generation may admit an access-request reminder only after Phase 12
separately ratifies one source-owned temporal requirement and the exact reminder
meaning, source revision/fence, absolute instant plus human time-zone/calendar
interpretation when applicable, semantic occurrence identity, current
eligibility predicate, recipient generation, cancellation/supersession and
late-usefulness rules. The product database must own durable uniqueness and an
atomic source-occurrence-to-identifier-only-product-handoff boundary; Phase 17
then compiles and Phase 6 owns recipient communication intents. Every wake-up
re-proves source, authorization,
recipient, and usefulness before it can compile an independently governed
delivery plan. Reminder, digest, escalation, and transport choice remain
different contracts.

Inngest may later provide durable wake-up or reconciliation after that product
truth exists, but its run, sleep, event-id window, cancellation, or wall clock
is never the reminder source, permanent idempotency record, or business outcome.
A best-effort cancellation signal cannot replace fire-time source proof. No
generic reminder table, scheduler, cadence preset, workflow graph, or rules DSL
is created in anticipation. Future readiness means the existing finite
contract/compiler and product-ledger boundaries can accept a reviewed source
occurrence later—not dormant implementation now.

**Phase 24 D47 clarification (2026-08-29).** A future
**Access-review attention cadence policy** is a separate versioned Phase 12
source policy, absent/Off by default. It may authorize at most one reminder
occurrence for one still-current D43 request generation. It creates no Due,
Overdue, SLA, priority, escalation, no-response default, request transition, or
access change. Tenant staff may eventually select only an activated,
code-owned bounded choice; there is no free-form number, per-request override,
recurrence, calendar builder, or Tenant-authored rule.

Cadence policy is not a Delivery Plan, D44 coordinator policy, Tasks Hub field,
Phase 17 preference, or executor setting. Later decisions must define the exact
clock/calendar, bounded choices, effective and policy-version semantics,
treatment of already-pending requests, Off/change/reschedule behavior, recipient
and zero-member timing, later-routing/backfill posture, activation generation,
and channel steps. D47 qualifies none of those answers and authorizes no
inference from another Core schedule.

D47 itself adds no reminder key, profile, step, policy row, enum, preset,
preference, worker, event, schedule, feature flag, migration, or UI placeholder.
It qualifies a future source-policy class so implementation can remain additive
after the remaining decisions, not a speculative compatibility promise now.

**Phase 24 D48 clarification (2026-08-29).** The first later non-Off cadence
application is prospective by genuine D43 source creation only. Phase 12 must
place the first successful non-Off policy publication and D43 request creation
in one authoritative logical order; only a request creation ordered after that
boundary may atomically retain cadence admission. Pre-boundary requests never
enter through age, timestamp comparison, task/notification rebuild, retry,
restore, migration, reconciliation, or a Delivery Plan. Exact committed replay
returns the original source disposition.

A Delivery Plan therefore cannot scan, backfill, reclassify, or create reminder
work for existing requests, and policy/request/task timestamps are not cohort
authority. D48 adds no reminder key, step, plan, preference, cohort operation,
or executable artifact. D50 now supplies request-anchored elapsed eligibility
and D51 supplies source-fenced Off/prospective re-enable; stable meaning,
usefulness, and channels remain separately gated.

**Phase 24 D49 clarification (2026-08-29).** One later admitted reminder source
occurrence binds its candidate recipients exactly once from the complete,
then-current D44 responsibility generation for that exact D43 request. Phase 12
must seal one unordered set of one to three exact Active Tenant Assignments or a
proved-zero result under the same current request, responsibility-generation,
authorization, policy, and occurrence fence. The raw configured coordinator
roster, request-creation recipients, Tasks Hub assignees, notification rows,
cached membership, and a provider-time recipient query are not that result.

Each nonempty member binds the exact D44 recipient-generation identity together
with its Active Tenant Assignment. A continuing member must prove an unbroken
D44 continuation from that generation; remove-then-readd, restored eligibility
after a definite loss, or a recreated assignment is not continuation. The D49
bind and D44 configuration/application must also serialize when the optional
D44 row is absent, so first configuration racing the occurrence produces either
a complete configured cohort or terminal proved zero, never a missing-row race.

An indeterminate, stale, partial, contradictory, corrupt, or over-limit D44
resolution leaves the same durable product occurrence slot unreleased with
append-only attempt evidence; it is not a terminal recipient disposition. It
may retry to one sealed member set or terminal proved zero and never guesses
zero, chooses a subset, broadcasts, or mints a successor occurrence. Later
coordinator changes still create
their ordinary D44 current-work task and responsibility-update attention, but
cannot add a person to the sealed reminder cohort.

The Phase 17/6 compiler receives one complete source-owned candidate envelope
and may only narrow it through fresh current source, assignment,
authorization, preference/consent, destination/readiness, suppression, and
privacy checks. It may never resolve the D44 route independently, replace a
suppressed member, or let different channels broaden the source cohort. A
temporary indeterminate downstream check releases nothing and may retry the
same sealed member; a definitive narrowing is monotonic. Provider acceptance
remains non-retractable evidence. D49 creates no task, reminder key, plan step,
channel, schema, worker, or UI now.

**Phase 24 D50 clarification (2026-08-29).** One D48-admitted D43 episode has
one immutable **Access-review reminder eligibility instant**. After the source-
creation transaction crosses D48's shared policy/request serialization fence
and proves the winning non-Off policy, Phase 12 captures one fresh trusted
database-derived source-created instant exactly once at the authoritative
request write, the exact code-owned
duration identity/revision and bounded whole elapsed seconds, and the resulting
finite absolute UTC not-before instant. The facts are authoritative only when
that source transaction commits. A PostgreSQL physical commit timestamp,
earlier transaction-start time, generic `created_at`, task/notification time,
browser/application/worker/provider clock, or query-time age is not authority.

Elapsed-time arithmetic is exact: any later approved “day” equals 86,400
seconds. Calendar-day/month interval fields, IANA/session/Tenant zones, DST,
weekends, holidays, working calendars, zone changes, routes, tasks, and worker
restarts cannot move the stored instant. A product claim is eligible only at
the inclusive trusted-database boundary where the current instant is at or
after not-before; early wakes do nothing, and late wakes attempt only the same
occurrence subject to later cancellation/usefulness rules. D49 still seals its
complete current D44 cohort at the actual successful source-seal commit, not at
nominal eligibility.

The source-created, not-before, wake/claim, seal, preparation, provider-
submission, and delivery-evidence instants remain different facts. A Delivery
Plan may consume the product-owned occurrence only after fresh gates; it cannot
compute, delay, restart, reschedule, or interpret source time. Inngest may later
sleep until or reconcile the stored instant but its run and clock are not
business truth. Missing, unsupported, contradictory, nonpositive, overflowing,
nonfinite, or otherwise unprovable optional time evidence safely makes cadence
not admitted without blocking the valid D43 request and releases no candidate
or handoff. D50 chooses no numeric value and adds no key, profile, plan,
step, preference, schema, event, worker, schedule, migration, OpenSpec, UI, or
telemetry artifact. D51 now defines policy edit/Off/re-enable cancellation;
usefulness, content, and channel decisions remain gated.

**Phase 24 D51 clarification (2026-08-29).** Cadence Off is an immediate
Phase 12 source fence, not a Delivery Plan toggle or executor cancellation.
Every successful Active-to-Off publication advances a separate monotonic
cancellation epoch atomically with the immutable policy revision, expected-head
change, audit/receipt, and identifier-only outbox intent. D48 admissions pin the
epoch; non-Off edits do not advance it, and re-enable carries the advanced epoch
forward. Every D49 seal and every later plan-member irreversible admission must
re-prove equality. Off-first denies the old work; admission-first preserves
truthful history. No policy save scans, counts, locks, rewrites, or synchronously
cancels every request/member/step.

Every Delivery Step must register its own product-owned irreversible-effect
admission. For an in-product step, it is the atomic role-safe release that makes
the item queryable, not read. For the currently governed email step, it is the
Phase 6 provider-submission attempt fence committed before the first byte may
leave Asym, not provider acceptance. **Prepared definitely unsubmitted** remains
suppressible; after attempt admission, dispatch is permanently **Submission may
have begun** while its independent outcome remains **None**, **Accepted**,
**Definitely rejected**, or **Indeterminate**. After Off only reconciliation and
webhook evidence reduction may continue. No same-key follow-up call, new
attempt, blind resend, provider-recall claim, or changed-envelope replay is
allowed. A channel-specific scheduled-cancel capability may later narrow its
own object under a separately proved adapter contract but never owns source
truth. Future push/chat steps must separately prove their exact admission,
finality, and repair semantics and cannot inherit email assumptions or create a
generic cancellation engine.

Non-Off edits and re-enable are prospective for genuine later D43 requests;
they never recompile an old plan occurrence, resume/catch up a canceled member,
or create another semantic occurrence. D51 creates no plan, member, message
key, task, channel, policy row, epoch field, job, schema, migration, OpenSpec,
UI, or telemetry artifact now.

**Phase 24 D52 clarification (2026-08-29).** Every later activated
Access-review cadence choice must be one complete versioned code-owned pair of
positive finite whole-second `wait_for_seconds` and `useful_for_seconds` values.
D48/D50 pin both values and derive immutable finite UTC `not_before` and
`useful_until` facts in the successful D43 source-creation transaction. A plan
may consume the occurrence only inside the product-owned half-open interval
`not_before <= claim_instant < useful_until`; equality at the upper bound is
expired. Each D49 seal and each still-unreleased plan member/step separately
captures a fresh trusted primary-database claim instant after its locks and
re-proves the source interval, D51 epoch, current D43 actionability, sealed D49
member, and every current authorization/privacy/channel fence.

Expiry is a terminal no-release source result, never a retry schedule. D49
indeterminate at expiry remains historically indeterminate and closes as
usefulness-expired; proved zero remains proved zero. A cohort sealed in time is
immutable evidence, but each unreleased descendant still expires independently.
A released in-product item remains governed by ADR-0027 and current D43 source
actionability rather than disappearing merely because the admission interval
later closes. **Prepared definitely unsubmitted** external work is suppressed
at expiry. A pre-expiry **Submission may have begun** attempt's one admitted
initial provider call may start, finish, or reconcile afterward only as the
immediate bounded continuation of that same pre-I/O critical section with its
envelope already prepared; a stalled/restarted process makes no call or retry.
The independent provider outcome is preserved, but expiry authorizes no new attempt, follow-up
call, retry, replacement, rekey, resend, or recall
claim.

Provider TTL/expiration and executor retry age may only narrow transport; they
never own or extend source usefulness. Inngest may wake or reconcile identifiers
but cannot supply the clock, transition, terminal result, uniqueness, or
idempotency fact. No successor occurrence, catch-up, request/task mutation, or
cancellation message is created. The future policy editor exposes no separate
grace-period control or expiry countdown; a selected card is the complete timing
profile and says **If Asym cannot create the reminder soon enough, it skips it
instead of sending it late.** D52 adds no profile/value, Delivery Plan, key,
step, schema, OpenSpec, job, provider request, UI, or telemetry artifact now;
D53 and the D47 evidence gate must admit exact pairs before activation.

**Phase 24 D53 clarification (2026-08-29).** Off remains absence, not a dormant
Delivery Plan. Before one complete timing pair independently passes D47 and a
later full activation package, no profile, step, key, manifest row, plan,
preference, schedule, flag, executor, or disabled UI may exist. Research
qualification is a version-controlled product proposal only; it never compiles
a plan or becomes runtime input. D53 reuses D47's evidence/review process and
creates no database evidence registry, workflow, approval service, periodic
recertification, or production experiment.

Each exact pair qualifies independently under an immutable
`research_candidate_id` and preregistered protocol version. Shared current
baseline evidence may be referenced, but a different second, protocol version,
material semantic/interaction meaning, or bound is a new proposal and cannot inherit the former pair's behavioral, comprehension,
fatigue/harm, accessibility, international/low-bandwidth, and feasibility
result. Passing evidence does not activate or reserve a product identifier. A
later profile becomes selectable only when the same exact pair and tested
semantic/interaction contract also pass D48–D55-plus source, content,
channel, authorization/RLS, privacy/retention, concurrency, load, migration,
mixed-version, OpenSpec, manifest, and release proof; that package assigns and
links the immutable code-owned profile identity/revision. Meaning-preserving
editorial, accessibility, and localization corrections use normal review and
do not mint a timing candidate or profile.

Only then may the code-owned plan input expose Off plus activated profile
identities/revisions. Tenant/caller/provider/executor data never supplies the
seconds, and an unqualified pair is absent rather than disabled or experimental.
Any later temporary release/kill control may only narrow an already activated
feature, requires an owner and removal criteria, and never qualifies/selects a
pair or becomes source truth. D53 adds no artifact now.

Ordinary profile retirement removes a profile from new selection/reselection
only; a Tenant's current selected head continues prospective D43 admission until
a deliberate policy change. D55 now makes urgent safety withdrawal a terminal
exact-profile platform fence that preserves the selected head while blocking
execution. D56 must still settle its authority/evidence-review contract before
activation.

**Phase 24 D54 clarification (2026-08-29).** A later fully activated timing
profile must compile one required local `staff_in_product` reminder descendant
for each still-qualified D49 sealed member. That descendant is a distinct
recipient communication/item with independent availability and engagement; it
is not a replay of either D44 key, a mutation of the one ADR-0183 task, or a
generic plan retry. Product-owned uniqueness binds the exact reminder source
occurrence, sealed member, future registered local step/key, and contract
revision. Group identity, worker/event/provider IDs, and an existing item cannot
substitute for that business effect.

The local step releases only at one atomic boundary that re-proves D43
actionability, D48/D49 admission and uninterrupted recipient continuation, D51
cancellation, D52 usefulness, current authorization/privacy/source visibility,
semantic uniqueness, and valid Phase 17 Access-review attention-group
attachment. A partial item-without-group release is forbidden; replay may repair
the same occurrence only while every source gate still passes. The group remains
a Phase 17 presentation projection and never becomes the Delivery Plan
occurrence, member set, idempotency source, or channel coordinator.

D45's `profile.access_governance_attention@1` governs only the initial-request
and responsibility-update email slots. The courtesy-reminder meaning does not
inherit that plan, Tenant enablement, or recipient preference. At D54 the future
local step is required and every external step is absent/not-applicable unless a
later decision independently admits its source, contract, preference, privacy,
transport, failure, cancellation, and proof boundary. D54 registers no key,
plan, step, manifest/census row, profile, renderer, preference, or executable
artifact now; counts remain unchanged under D53.

**Phase 24 D55 clarification (2026-08-29).** Urgent withdrawal is one
irreversible, exact-profile-revision platform safety disposition, not Tenant
policy, an ordinary retirement, a Delivery Plan, a provider pause, or a generic
feature/kill flag. It preserves every Tenant's selected policy head and pinned
historical tuple while making the withdrawn revision's effective cadence Off.
The platform publishes one O(1) disposition; it performs no Tenant census,
successor-head fanout, automatic Off write, fallback selection, task/item
creation, or replay. A withdrawn revision can never be cleared or selected
again. Recovery requires a separately evidenced and activated successor plus a
Tenant's deliberate policy save.

Every D43 source admission, D49 seal, plan compilation, and still-unreleased
member/step must atomically prove that its exact profile revision is not safety-
withdrawn. Missing, stale, unreadable, malformed, or unsupported safety state
fails closed for the optional reminder effect while the D43 request, initial D44
attention, and source-backed task remain usable. Fence-first blocks the effect.
If an irreversible boundary committed first, D55 preserves that truthful fact:
a released local item follows ADR-0027's withdrawal end rule, while an external
step still **Prepared definitely unsubmitted** is suppressed and a step already
at **Submission may have begun** may only complete/reconcile the one previously
admitted provider call under its frozen identity. It authorizes no recall, new
call, retry, rekey, replacement, fallback, or follow-up.

A flag may temporarily narrow rollout after activation, but it cannot author,
clear, cache over, or replace this product-owned disposition. Workflow, Realtime,
provider, support, and client state are nonauthoritative. Mixed-version readers
and writers must understand the persisted withdrawal before any timing profile
can activate; rollback preserves the disposition and compatible decoders. D55
adds no runtime row, key, flag, plan, step, manifest/census entry, schema,
OpenSpec requirement, UI, worker, or telemetry now.

## Consequences

- Staff get one understandable plan editor with contract-named choices, impact
  preview, synthetic test, immutable publication, and audit.
- Producer cancellation and current safety/consent fences remain live until a
  step crosses its registered irreversible-effect admission. Preparation alone
  remains suppressible; for current email that later boundary is the pre-I/O
  provider-submission attempt fence.
- Crash before commit exposes no parent or child; crash after commit but before
  response exactly replays. Concurrent identical compilers converge on one
  released occurrence, while changed or disjoint membership under the same
  occurrence token conflicts. A committed unreleased header is an alerted,
  unclaimable invariant violation with no force-release path.
- Sibling delivery and engagement outcomes are independent only after the
  complete bounded plan occurrence has been atomically released.
- D45 can add a low-noise optional email without creating a second source,
  notification fallback, or channel engine; a required local item remains
  reliable when tenant email is disabled, unavailable, suppressed, or failed.
- D46 leaves the access-request UX free of reminder controls and invented
  urgency while preserving a precise, source-owned admission path for a future
  reminder once a truthful temporal requirement exists.
- D47 permits a bounded candidate to become an evidence-qualified proposal and
  a separately activated profile to supply that source meaning later without
  turning delivery settings or elapsed age into a deadline, while keeping all
  executable artifacts absent today.
- D50 selects deterministic request-anchored elapsed eligibility without
  turning the not-before instant into delivery time, a civil calendar, or a
  deadline.
- D51 makes cadence Off a product-owned source fence with prospective re-enable,
  no synchronous fanout, no revival, and no false recall across in-product or
  external delivery boundaries.
- D52 makes late usefulness a finite product-owned source-admission ceiling;
  it prevents stale outage catch-up without turning provider TTL or executor
  timing into Delivery Plan authority.
- D53 prevents an evidence candidate, disabled setting, or rollout flag from
  becoming a Delivery Plan. Only a separately activated exact profile can
  compile later work.
- D54 requires one independent local reminder descendant and reuses Phase 17's
  narrow attention grouping without conflating group state, task state, or the
  D45 initial-email family plan with Delivery Plan truth.
- D55 gives the exact profile revision one monotonic safety ceiling that blocks
  every not-yet-irreversible effect without rewriting Tenant intent, reviving
  work, or treating a feature flag/provider as source authority.
- Plan execution reuses Phase 6; Phase 17 adds no queue, scheduler, outbox, or
  second communication ledger.
- Tests cover duplicate events, late workers, daylight-saving boundaries,
  disabled steps, changed plans, zero-member results, every compile crash point,
  concurrent same/changed compilers, finite-bound overflow, claim visibility,
  cancellation, and cross-tenant/platform isolation.

## Related Phase 24 evidence

- [Phase 24 D45 adversarial review](../prds/sitestacker-parity/phase-24-d45-optional-initial-email-adversarial-review.md)
- [Phase 24 D45 primary research](../prds/sitestacker-parity/phase-24-d45-optional-initial-email-primary-research.md)
- [Phase 24 D46 adversarial review](../prds/sitestacker-parity/phase-24-d46-no-automatic-reminder-adversarial-review.md)
- [Phase 24 D46 primary research](../prds/sitestacker-parity/phase-24-d46-no-automatic-reminder-primary-research.md)
- [Phase 24 D47 adversarial review](../prds/sitestacker-parity/phase-24-d47-bounded-tenant-reminder-cadence-adversarial-review.md)
- [Phase 24 D47 primary research](../prds/sitestacker-parity/phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)
- [Phase 24 D48 adversarial review](../prds/sitestacker-parity/phase-24-d48-new-request-only-cadence-application-adversarial-review.md)
- [Phase 24 D48 primary research](../prds/sitestacker-parity/phase-24-d48-new-request-only-cadence-application-primary-research.md)
- [Phase 24 D49 adversarial review](../prds/sitestacker-parity/phase-24-d49-current-recipient-cohort-adversarial-review.md)
- [Phase 24 D49 primary research](../prds/sitestacker-parity/phase-24-d49-current-recipient-cohort-primary-research.md)
- [Phase 24 D50 adversarial review](../prds/sitestacker-parity/phase-24-d50-request-anchored-elapsed-clock-adversarial-review.md)
- [Phase 24 D50 primary research](../prds/sitestacker-parity/phase-24-d50-request-anchored-elapsed-clock-primary-research.md)
- [Phase 24 D51 adversarial review](../prds/sitestacker-parity/phase-24-d51-immediate-irreversible-narrowing-adversarial-review.md)
- [Phase 24 D51 primary research](../prds/sitestacker-parity/phase-24-d51-immediate-irreversible-narrowing-primary-research.md)
- [Phase 24 D52 adversarial review](../prds/sitestacker-parity/phase-24-d52-bounded-usefulness-window-adversarial-review.md)
- [Phase 24 D52 primary research](../prds/sitestacker-parity/phase-24-d52-bounded-usefulness-window-primary-research.md)
- [Phase 24 D53 adversarial review](../prds/sitestacker-parity/phase-24-d53-evidence-admitted-complete-timing-profile-adversarial-review.md)
- [Phase 24 D53 primary research](../prds/sitestacker-parity/phase-24-d53-evidence-admitted-complete-timing-profile-primary-research.md)
- [Phase 24 D54 adversarial review](../prds/sitestacker-parity/phase-24-d54-distinct-grouped-reminder-presentation-adversarial-review.md)
- [Phase 24 D54 primary research](../prds/sitestacker-parity/phase-24-d54-distinct-grouped-reminder-presentation-primary-research.md)
- [Phase 24 D55 adversarial review](../prds/sitestacker-parity/phase-24-d55-monotonic-profile-safety-fence-adversarial-review.md)
- [Phase 24 D55 primary research](../prds/sitestacker-parity/phase-24-d55-monotonic-profile-safety-fence-primary-research.md)

# Phase 24 D50 — Request-Anchored Elapsed Reminder Clock

- **Status:** Founder answer adjudicated; documentation-only future contract
- **Founder direction:** Option 1 — one elapsed duration from the authoritative D43 source-creation commit
- **Disposition:** **Accept with required amendments**
- **Date reviewed:** 2026-08-29
- **Scope:** Phase 12 D43 source-time evidence, D47 cadence input, D48 admission, D49 occurrence/recipient sealing, time arithmetic, clock integrity, lifecycle, UX, authorization, RLS, execution, migration, recovery, and proof
- **Non-scope:** no runtime behavior, schema, migration, OpenSpec delta, cadence value, late-usefulness value/semantics, policy-edit effect, message key, channel, task date, Inngest function, feature flag, telemetry pipeline, or UI is authorized by D50

> **Post-D51 historical note (2026-08-29):** D51 now makes Active-to-Off a
> monotonic source fence, keeps non-Off edits and re-enable prospective, and
> forbids revival/catch-up without changing D50's immutable time package. D52
> useful-lateness is next. D50's original D51 question remains historical.

## Executive adjudication

Option 1 is the smallest reliable temporal model, but the phrase “from the
source-creation commit” is not implementable literally as an ordinary physical
commit timestamp. PostgreSQL’s current_timestamp and transaction_timestamp
represent transaction start, statement_timestamp represents statement start,
and clock_timestamp changes during execution. An application cannot write the
future physical commit instant inside the same transaction by convention.

D50 therefore preserves the founder’s intent through a precise business
anchor:

> For one D48-admitted D43 request episode, the authoritative Phase 12 creation
> command derives one finite UTC **source-created instant** from the product
> database exactly once during the final source-creation write, after D48's
> shared policy/request serialization fence has produced and proved the winning
> non-Off policy/admission result, and commits it atomically with
> the request, applicable immutable D47 cadence input, D48 disposition,
> calculation version, exact elapsed-duration value, exact candidate instant,
> source receipt/audit, and identifier-only durable handoff. “Source-creation
> commit” means that committed business fact. It does not mean a physical
> database commit timestamp, transaction ID, WAL position, app-server time,
> browser time, worker time, or current query of a generic created_at column.
>
> The duration is a finite positive code-owned elapsed quantity expressed in
> integral seconds. The candidate instant is exactly source-created instant plus
> that duration on the product’s canonical UTC instant timeline. If a choice is
> displayed in days, one day means exactly 86,400 elapsed seconds. Weekends,
> holidays, leap days, DST gaps/overlaps, Tenant or recipient timezone, local
> midnight, and later timezone/tzdb changes do not participate in calculation.
> Months, years, business/working days, free-form values, civil-time rules, cron,
> and calendar DSLs are forbidden.
>
> Source anchor and candidate are exact finite UTC instants under one future
> canonical precision, parser/serializer, and calculation version. Physical
> precision, wire formatting, and scheduler rounding belong to later design and
> shared conformance fixtures; no adapter may lose information in a way that
> releases before the authoritative candidate.
>
> The time package pins the exact cadence revision/input observed at D43
> creation. It is immutable and replay returns it verbatim. A later policy edit
> cannot silently recalculate, move, or recreate the candidate instant; D51
> must separately decide prospective edit, Off cancellation, and re-enable
> behavior. If the policy/time proof is missing, unknown, corrupt, unsupported,
> nonpositive, nonfinite, overflowing, or incompatible, the valid D43 request
> still commits under D48’s typed cadence-not-admitted path and no time handoff
> exists.
>
> The candidate instant is an eligibility boundary for one courtesy occurrence,
> never a due date, SLA, deadline, urgency, escalation, no-response consequence,
> delivery promise, task reminder, or evidence that a person was notified. A
> future source claim captures one trusted database claim instant. Before the
> candidate it creates nothing. At or after the candidate it may attempt the
> one D49 source occurrence only while the exact D43 request, D48 admission,
> applicable policy/cancellation state, D49 rules, current authorization, and
> every later-ratified source/usefulness gate permit it.
>
> D50 defines only an inclusive not-before boundary: a trusted claim instant
> equal to or later than candidate satisfies the elapsed lower bound. D50 does
> not decide useful lateness, an upper boundary, delayed-wake behavior, catch-up,
> D49-indeterminate retry ending, or descendant suppression. No implementation
> may infer those behaviors, and no reminder may activate until later founder
> decisions close them.
>
> Phase 12 and the product database own anchor, duration input, candidate,
> claim instant, occurrence identity, cancellation, and temporal evidence. The
> automatic claim is a code-owned system/source command,
> distinct from a human policy-management command. Inngest may later wake at an
> absolute candidate or reconcile indexed product work, but its event
> timestamp, sleep, run, retry, clock, deduplication, cancellation, or logs are
> never business time. Every wake re-reads and claims product truth.

The unqualified answer is therefore accepted only after replacing a vague
physical-commit timestamp and “N days” timer with one atomically committed,
versioned source-time package, exact elapsed arithmetic, an inclusive
not-before boundary, and a source-database claim.

## Problem validity and strongest alternative

The root product problem remains unproven: a courtesy reminder might help a
ministry notice waiting access work, but D44’s lane, task, and initial attention
already keep the request operable. D50 cannot convert record age into urgency
or justify a reminder by itself. D47’s independent ministry-research gate
remains mandatory.

For a feature that has earned activation, an elapsed request anchor is easier
to understand and operate than Tenant-local calendars. It is invariant across
DST, travel, field assignments, holidays, and timezone changes and prevents
D44 route churn from indefinitely resetting the clock.

The strongest alternative is a Tenant-local calendar window. It could match
office-day expectations but requires one authoritative IANA zone, tzdb
versioning, DST gap/overlap policy, holiday ownership, policy-timezone edits,
and cross-region explanation. No current evidence justifies that burden.

A responsibility-generation anchor is rejected. It would couple D44 routing to
source time, allow coordinator churn to postpone the occurrence indefinitely,
and make responsibility updates an indirect reminder-control surface.

## Evidence classification

### Verified repository facts

- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
  requires server-derived Tenant, identity, role, and capabilities; application
  authorization is primary and RLS is defense in depth.
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
  makes product records, Tenant authorization, audit, work claims, and dispatch
  ledger authoritative while Inngest is an identifier-only executor.
- [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  keeps permission-sensitive actions behind Mission Control/server boundaries
  and retains one shared staff task model.
- [Platform Principles](../../../openspec/specs/platform-principles/spec.md)
  prioritizes Tenant/permission safety, operational truth, clarity,
  accessibility, coherence, and reliable system behavior.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  keeps task dates, task reminders, engagement, and task age from becoming D43
  source time or reminder authority.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  makes the D43 request and Phase 12 source policy authoritative, requires one
  occurrence, and keeps D44 recipients separate from time.
- D47 allows only an independently validated bounded finite policy, requires
  exact source time/rule evidence, and expressly left the clock to D50.
- D48 admits only genuine post-boundary request episodes and requires the D43
  source transaction to preserve applicable immutable policy input.
- D49 binds the current D44 cohort only when the source occurrence successfully
  seals, distinguishes proved zero from unreleased indeterminate, and creates
  no second task.
- Current generic mission_control_task_reminders and contribution approval
  reminderHours/created_at scans are different domain implementations and are
  explicitly nonprecedent.
- No D43–D50 runtime, source-time field, reminder occurrence, Phase 17 key, or
  UI currently ships.

### Verified current official primary evidence

- [PostgreSQL current date/time functions](https://www.postgresql.org/docs/current/functions-datetime.html)
  state that current_timestamp/transaction_timestamp are transaction-start
  time, statement_timestamp is statement-start time, and clock_timestamp
  changes during execution. This invalidates a casual claim that any of them is
  the literal commit timestamp.
- The same PostgreSQL documentation shows that one calendar day and 24 hours
  can produce different results across DST. Fixed integral elapsed seconds
  avoid session-timezone and civil-calendar ambiguity.
- [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html)
  store timestamptz internally in UTC and do not retain the originally stated
  timezone. Timezone is therefore display context, not recoverable clock-rule
  evidence.
- [PostgreSQL serialization-failure handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
  requires retrying the complete transaction, including the logic that chooses
  values, after serialization failure.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes USING from WITH CHECK and identifies owner/BYPASSRLS behavior
  that needs explicit privileged-path parity.
- [NIST SP 800-53 Rev. 5.1 SC-45](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
  requires synchronization of system clocks within and between components.
  D50 therefore needs clock-health operations even though one database clock
  remains business authority.
- [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html) demonstrates UTC-
  capable Internet timestamp representation and real offset/leap-second edge
  cases. It supports requiring one canonical design later; D50 does not freeze
  its physical wire format.
- [Inngest delayed functions](https://www.inngest.com/docs/guides/delayed-functions)
  and [Inngest sleeps](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)
  support durable execution at a future timestamp across redeploys. They prove
  executor suitability, not source ownership or exact delivery.
- [Inngest idempotency guidance](https://www.inngest.com/docs/guides/handling-idempotency)
  documents a 24-hour deduplication window, which is insufficient for permanent
  one-occurrence uniqueness.
- [Microsoft Entra access-review creation](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
  warns that a configured start time can vary by hours due to processing.
  [Microsoft Entra review performance](https://learn.microsoft.com/en-us/entra/id-governance/perform-access-review)
  warns email can be delayed up to 24 hours. These support separating source
  eligibility from wake/delivery promises.
- [Okta resource campaigns](https://help.okta.com/oie/en-us/content/topics/identity-governance/access-certification/iga-ac-create-campaign.htm)
  and [SailPoint campaign completion](https://documentation.sailpoint.com/saas/help/certs/completing_campaigns.html)
  bind reminders to explicit campaign windows/deadlines. They are useful
  contrasts but do not validate Core’s no-deadline courtesy cadence.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires programmatically
  determinable status messages without focus movement and supplies the
  accessibility floor for any later policy/recovery feedback.

No source proves a universal cadence value, late-usefulness window, or ministry
need. External behavior supports precise source time, bounded lifecycle,
auditable execution, and honest delivery uncertainty; Core’s exact policy
remains a product judgment subordinate to its ADRs.

### Reasonable inferences

- Fixed elapsed arithmetic is less surprising across globally distributed
  ministry staff than a hidden Tenant-local business calendar.
- Database-owned source and claim instants reduce cross-host clock disagreement.
- Materializing candidate time with its immutable input is easier to audit and
  migrate than recalculating it from current policy on every query.

### Product judgments and unresolved unknowns

- Integral seconds, a 24-hour elapsed day, and one source-database clock are
  D50 product judgments; they are not vendor mandates.
- Representative ministry research has not established a cadence value,
  late-usefulness value, acceptable attention duplication after reassignment,
  or whether the reminder should ship.
- D51 must decide how non-Off edits, Off, and re-enable affect admitted work
  before seal and sealed descendants before an irreversible boundary. No edit
  may change candidate time by implication.
- Later decisions still owe exact cadence/usefulness values, content,
  presentation key, channels, retention, and rollout budgets before activation.

## Current behavior, intended behavior, and permanent path

| Area              | Current repository behavior                               | D50 intended contract                                                                                            | Best permanent path                                     |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| D43 source time   | No D43 runtime; generic created_at fields exist elsewhere | One database-derived source-created instant committed with D43                                                   | Phase 12 source receipt, never generic field convention |
| D47 cadence       | No runtime policy/value                                   | One finite code-owned positive elapsed quantity if research admits it                                            | Immutable policy revision and exact input               |
| D48 admission     | No runtime                                                | Source creation admits/excludes/safely declines cadence                                                          | Time package exists only for valid admitted episodes    |
| Candidate instant | None                                                      | Exact anchor plus elapsed seconds, stored with input/version                                                     | Phase 12 immutable source evidence                      |
| D49 occurrence    | No runtime                                                | Candidate supplies only an inclusive not-before boundary; later lateness/usefulness decisions are still required | Product transaction and permanent semantic identity     |
| Tasks/items/email | Generic current implementations in other domains          | Never own/recompute clock or receive due semantics                                                               | Consume source occurrence only                          |
| Timezone          | Session/user/Tenant display contexts exist                | Display only; no arithmetic dependency                                                                           | Explicit locale/zone rendering from UTC instant         |
| Executor          | Inngest is accepted orchestration                         | Optional absolute wake/reconciliation                                                                            | Product record/claim remains recoverable authority      |
| Policy edits      | Unresolved                                                | No implicit recomputation through D50                                                                            | D51 decides prospective edit/Off/re-enable              |

## Domain model, ownership, and invariants

### Canonical terms

**Source-created instant:** The finite UTC business timestamp derived by the
product database during the final authoritative D43 creation write and
committed with that request. It is not a physical commit timestamp.

**Elapsed cadence input:** One immutable code-owned positive integral-second
quantity selected by the applicable D47 policy revision and observed by D43
creation.

**Candidate instant:** The exact UTC instant computed once as source-created
instant plus elapsed cadence input under a versioned calculation contract.

**Claim instant:** One database-derived UTC instant captured by the future
source occurrence transaction and used once to evaluate the inclusive
not-before boundary plus every later-ratified temporal gate.

**Source-time package:** The immutable anchor, duration/input revision,
calculation version, candidate, applicable heads, admission basis, and source
receipt evidence. It is not a scheduler job.

### Ownership matrix

| Authoritative fact                         | Owner                             | Permitted consumers                        | Explicit non-owners                             |
| ------------------------------------------ | --------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| D43 request episode/source-created instant | Phase 12 D43 aggregate            | source lane, audit, D50 calculator         | browser, task, worker, generic created_at query |
| D47 cadence revision/duration input        | Phase 12 Tenant source policy     | D43 creation and authorized policy view    | D44 route, System Messages, Inngest             |
| D48 admission/applicable policy input      | Phase 12 creation receipt         | D50 source-time package                    | migration, timestamp scan, task                 |
| Candidate/calculation/claim evidence       | Phase 12 temporal source contract | indexed claim/reconciliation, safe display | app clock, Tenant zone, provider                |
| D49 occurrence/recipient seal              | Phase 12 source occurrence        | Phase 17/6 descendants                     | timer job, channel, task                        |
| Current D43/D44 authorization              | Phase 12/IAM                      | every claim and effect gate                | stored time package alone                       |
| Task work/engagement                       | ADR-0183                          | Tasks Hub                                  | candidate, occurrence, urgency                  |
| Presentation/delivery                      | ADR-0027/Phase 17/6               | staff surfaces/providers                   | source clock, occurrence identity               |
| Wake/retry                                 | Replaceable executor              | identifier-only product claims             | anchor, candidate, late-usefulness truth        |
| Clock health                               | Platform/database operations      | claim admission/fencing                    | Tenant settings, browser                        |

### Domain invariants

1. D50 creates no current artifact or behavior.
2. A D48-admitted D43 episode has exactly one immutable source-time package or
   a typed cadence-not-admitted source result; it never has a partial package.
3. Source-created instant is finite, database-derived, UTC-normalized, and
   committed with the request; it is not caller supplied or later edited.
4. Elapsed cadence input is a finite positive integral-second value from a
   versioned code-owned registry. Missing/unknown/free-form values fail closed.
5. Candidate instant equals anchor plus exact elapsed seconds under one
   calculation version. One future canonical physical precision and
   serialization must preserve exact ordering and prevent early release;
   overflow, nonfinite, ambiguous, or precision-losing values are invalid.
6. A displayed day means 86,400 elapsed seconds. Calendar day, month, year,
   business day, weekend, holiday, local midnight, DST, and timezone do not
   affect arithmetic.
7. UTC is calculation/interchange context; Tenant/user IANA zone and locale are
   display context only and never cause recomputation.
8. Replay, restore, policy query, executor replacement, and projection rebuild
   preserve the exact source-time package and candidate.
9. Policy edits do not silently mutate/recompute time. D51 alone may authorize
   cancellation or prospective behavior.
10. One claim transaction captures one trusted claim instant; no operation
    compares multiple changing clocks to choose eligibility.
11. Before candidate, no occurrence/member/item/intent/task effect is created.
12. Candidate is an inclusive not-before boundary only. D50 defines no upper
    bound, catch-up, late-wake, or terminal-usefulness behavior.
13. D49 indeterminate retry ending remains a later decision; D50 changes no
    D49 state by implication.
14. Candidate, elapsed age, or wake delay creates no Due/Overdue/SLA/
    urgency/escalation/access or human-performance meaning.
15. Every field, relation, query, claim, and audit is exact-Tenant,
    purpose-scoped, server-derived, and protected across ordinary and privileged
    paths.

## Lifecycle, temporal correctness, concurrency, and failure

### Conceptual lifecycle

These are behavioral states, not a schema prescription:

1. **No cadence package:** pre-D48, excluded, or typed safe non-admission.
2. **Waiting before candidate:** valid immutable package; request remains
   ordinarily actionable with no reminder effect.
3. **Candidate reached:** a trusted claim instant equals or exceeds candidate,
   satisfying only D50’s inclusive lower bound. D50 alone still releases
   nothing.
4. **Later-governed source claim:** only after lateness/usefulness, D51 policy,
   D43/D48, authorization, and D49 rules are complete may another decision
   permit the one occurrence.
5. **Occurrence sealed:** D49 may later seal members or proved zero; D50 never
   creates a second occurrence.
6. **Terminal source ended/canceled:** D43 or a later D51 rule may end
   eligibility before seal.

Forbidden transitions include changing anchor/candidate, moving candidate from
a current policy read, turning an early or late wake into an occurrence without
the later temporal contract, creating a second occurrence after policy edit, or
using a task/channel timestamp as source time.

### Required race and failure outcomes

| Race or failure                                                | Required result                                                                                                 |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| D43 creation succeeds with valid temporal proof                | Request, D48 admission, complete source-time package, receipt, and handoff commit atomically                    |
| D43 is valid but temporal proof is invalid/corrupt/overflowing | Request commits with typed cadence not admitted; no package/handoff; no later age-in                            |
| Creation response is lost and retried later                    | Original anchor/input/candidate/receipt returns exactly; current time/policy is not used                        |
| Same semantic creation is replayed after candidate             | Existing request/package returns; no occurrence is inferred from replay                                         |
| Valid terminal successor request is created                    | New episode gets its own freshly derived package if current policy permits                                      |
| Worker wakes before candidate                                  | Product claim returns not yet eligible; no occurrence or descendant                                             |
| Claim instant equals candidate                                 | D50 lower bound is satisfied; no occurrence is authorized until later temporal/source gates are ratified        |
| Worker wakes after candidate                                   | D50 lower bound is satisfied; useful-lateness/catch-up behavior remains undecided and no D50-only effect occurs |
| D43 becomes terminal before claim                              | No occurrence                                                                                                   |
| D43 terminal races claim                                       | One serial winner; a claim ordered first still faces D49/current effect reproof                                 |
| Two workers claim at the boundary                              | Product uniqueness/CAS yields one claim/occurrence; loser observes authoritative result                         |
| Database clock health is failed or indeterminate               | Pause temporal claims; release nothing; source lane/task remain available                                       |
| App/browser/worker clocks disagree with database               | Database claim instant wins; other clocks are diagnostics/display only                                          |
| Tenant/user timezone or tzdb changes                           | Candidate unchanged; future display uses the current authorized presentation context                            |
| DST gap/overlap, weekend, holiday, leap day, month/year end    | Exact elapsed-second candidate remains unchanged                                                                |
| Policy duration changes before candidate                       | D50 does not recompute; D51 decides cancellation/prospective effect                                             |
| Inngest sleep/event is missing or duplicated                   | Indexed product reconciliation/claim recovers once from source truth                                            |
| Dispatch fails after package commit                            | Product ledger repairs handoff; package and request remain authoritative                                        |
| Stored package and recomputation disagree                      | Quarantine; no occurrence; never overwrite the original from current policy                                     |
| Backup restore/rebuild                                         | Preserve exact package/receipt; no current-time or created_at backfill                                          |

## UX/UI contract

### D50 creates no control or status now

There is no reminder timing setting, countdown, candidate date, age badge,
Due/Overdue state, task reminder, calendar picker, timezone selector, business-
day option, disabled placeholder, or channel preview through D50.

### Future policy explanation

If the complete feature later earns activation, the compact People & access →
Access requests cadence form should use the established Base Maia/Base UI
grammar and say:

**Reminder timing**

**Create one courtesy reminder after [duration] of elapsed time.**

> Timing starts when each new access review request is created. Weekends and
> local clock changes are included. This doesn’t set a due date or change
> access.

The finite options must use plain units. If a UI says a number of days, nearby
help must make the 24-hour elapsed meaning understandable; it must not say
business days, working days, end of day, local time, or promise exact delivery.
D48’s new-request-only impact and D49’s Recipients explanation remain visible
without a second confirmation or channel matrix.

### Staff, holder, and audit journeys

- Staff see the ordinary request/task as primary. A later reminder says only
  that an access review is still waiting and loads current state after auth.
- The holder/requester sees no countdown, recipient list, reminder status,
  delivery/read state, or claim that staff are aware.
- Tenant timezone may render an authorized candidate/receipt instant for audit,
  with explicit zone/offset and an absolute date/time; relative time is
  supplementary and never the only representation.
- Ordinary users never see anchor/calculation version, epoch seconds, source
  heads, clock-skew diagnostics, or executor timing.
- Indeterminate time/clock operation produces no misleading sent state.
- The shared lane/task remain usable under no email, executor outage, weak
  connectivity, mobile, or low bandwidth.

### Accessibility and internationalization

Any later form/result must preserve keyboard and screen-reader order, visible
focus, labels and descriptions, field/error association, non-color semantics,
forced colors, WCAG 2.2 target sizes, reduced motion, 320-pixel/400-percent
reflow, RTL/CJK expansion, localization, and persistent programmatic status
without focus theft or toast-only feedback. Localized display may never alter
stored input or arithmetic.

## Normative requirements

- **D50-R1:** D50 is documentation-only and creates no runtime, schema,
  OpenSpec, cadence value, timer, job, key, channel, task field, telemetry, or UI.
- **D50-R2:** “Source-creation commit” means the database-derived finite UTC
  source-created instant captured exactly once at the final D43 write after
  D48's policy/request serialization winner is proved and committed with D43,
  not a literal physical commit timestamp, earlier transaction-start time, or
  generic created_at convention.
- **D50-R3:** Source-created instant, Tenant, request, applicable policy input,
  calculation version, and audit attribution are trusted server/database facts;
  no caller or downstream system supplies them.
- **D50-R4:** A valid D43 creation atomically commits request, D48 disposition,
  complete source-time package, receipt/audit, and identifier-only handoff;
  invalid temporal proof uses D48 safe non-admission without blocking D43.
- **D50-R5:** Cadence duration is a finite positive code-owned integral-second
  value; free-form, zero/negative, fractional, infinite, month/year, civil,
  business-day, cron, and calendar-DSL inputs are forbidden.
- **D50-R6:** Candidate instant is computed once as source-created instant plus
  exact elapsed seconds; any overflow, nonfinite result, unsupported
  calculation version, or contradictory recomputation fails closed.
- **D50-R7:** UTC governs arithmetic/interchange. Tenant/user timezone, locale,
  IANA/tzdb revision, DST, weekend, holiday, and local clock are display-only.
- **D50-R8:** Future design must choose one exact bounded physical precision,
  UTC serialization, rounding, parser, and calculation version with shared
  fixtures; no adapter may lose precision or round in a way that releases
  before candidate. D50 freezes no storage or wire format.
- **D50-R9:** The complete source-time package and candidate are immutable;
  policy edits, replay, restore, migration, task/item state, executor, or
  current query never silently recompute them.
- **D50-R10:** Exact semantic replay returns the original anchor, input,
  candidate, receipt, and handoff even when retried after candidate or policy edit.
- **D50-R11:** One database-derived claim instant equal to or later than
  candidate satisfies D50’s inclusive not-before boundary only.
- **D50-R12:** Before candidate, no occurrence, recipient seal, presentation,
  intent, provider submission, or task change may occur.
- **D50-R13:** D50 defines no late-usefulness duration, upper boundary,
  catch-up, delayed-wake, terminal-no-release, or descendant-suppression
  semantics; none may be inferred or implemented before a later decision.
- **D50-R14:** D50 does not decide when D49 indeterminate retry ends and changes
  no D49 state or occurrence by implication.
- **D50-R15:** Every claim re-proves current D43 actionability, D48 admission,
  applicable source/cancellation state, D49 preconditions, authorization,
  clock health, and every later-ratified usefulness rule; time alone authorizes
  nothing.
- **D50-R16:** One permanent product occurrence/claim identity, not timer or
  transport deduplication, preserves zero-or-one cardinality across boundary
  races, retries, redeploys, and outages.
- **D50-R17:** Inngest or another executor may wake/reconcile identifier-only
  work but never owns anchor, candidate, claim instant, lateness, occurrence,
  cancellation, idempotency, or audit.
- **D50-R18:** Product-owned indexed reconciliation repairs missing/late/
  duplicate wake metadata from immutable records/claims without broad scans or
  recalculation, but D50 alone never authorizes delayed execution.
- **D50-R19:** Candidate/elapsed age/fence creates no task due/reminder field,
  status, priority, urgency, SLA, deadline, escalation, access effect, default
  decision, or coordinator-performance fact.
- **D50-R20:** D50 adds no current UX; later UX uses the exact quiet elapsed-
  time/no-due copy, finite options, explicit Save/Cancel, and accessible durable
  status in People & access.
- **D50-R21:** Future persistence uses non-null same-Tenant composite integrity,
  least grants, application authorization, RLS USING/WITH CHECK, restrictive
  deletion, and owner/service/worker/support/BYPASSRLS parity.
- **D50-R22:** The automatic temporal claim is a registered code-owned system
  command separate from human permissions.manage_grants policy publication;
  expected heads are concurrency inputs, not authority.
- **D50-R23:** Source-time evidence is immutable/history-preserving and
  constraint-valid; no ordinary update, backdate, correction, import, or
  support action may retarget its Tenant/request/policy/time.
- **D50-R24:** Database/system clock synchronization and health are operational
  prerequisites; failed/unknown health pauses claims without changing requests,
  tasks, anchors, candidates, or pretending zero.
- **D50-R25:** Temporal data is minimized and purpose-bound; logs/events/
  analytics/AI/exports never expose protected request content, individual
  responsiveness scores, hidden location, or unnecessary person-level timing.
- **D50-R26:** Candidate lookup is indexed, bounded, cursor/claim based, and
  exact-Tenant; it never scans all requests, tasks, users, messages, or history.
- **D50-R27:** Migration performs no historical clock backfill or created_at
  inference; missing/legacy/unknown packages release nothing and old readers
  remain deny-compatible.
- **D50-R28:** Rollout uses readers/constraints/RLS/receipts before one writer,
  a source kill path, mixed-version proof, bounded Tenant cohorts, and
  roll-forward repair preserving committed history.
- **D50-R29:** Durable business audit and security evidence are distinct from
  technical clock/executor traces; tests and monitors prove source outcomes
  without authorizing new person surveillance.
- **D50-R30:** D51 must independently decide non-Off edit, Off cancellation,
  re-enable, already-admitted/unsealed behavior, and sealed-but-not-yet-
  irreversible descendants; D50 permits no implicit rescheduling, pausing,
  revival, or current-work application. A later founder
  decision must still define useful lateness and D49-indeterminate ending.

## Ruthless 22-category adversarial review

Every category was evaluated independently. A material concern exists in all
22 categories for the unqualified answer. Each concern narrows or amends
Option 1; none defeats the corrected request-anchored elapsed model.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                                                                                        | Why it matters                                                                                        | Severity | Likelihood  | Evidence or reasoning                                                                                | Effect on answer                                                                              | Best permanent fix                                                                                   | Exact specification language                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Core treats record age as a problem, builds a timer before evidence, or claims elapsed time is a deadline. A Tenant-local calendar could better match office expectations. | A courtesy feature adds noise/pressure while D44 recovery already works; the wrong model harms trust. | High     | Medium-high | D47 found vendor reminders tied to real review windows and requires independent ministry validation. | Accepts elapsed only as the future arithmetic model after evidence, not as authority to ship. | Preserve D47 research gate, no runtime now, and compare the strongest calendar alternative honestly. | **D50-R1, R5, R19, R30; D50-AC001–010, AC111–120.** |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                | Why it matters                                                                                    | Severity | Likelihood          | Evidence or reasoning                                                                                    | Effect on answer                                                                                 | Best permanent fix                                                                                                          | Exact specification language              |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| “Commit time” is implemented with transaction start, app time, worker time, or generic created_at; “day” uses calendar arithmetic. | Long transactions, skew, DST, session timezone, and retries produce different candidate instants. | Critical | High for a shortcut | PostgreSQL documents distinct transaction/statement/clock times and one-day versus 24-hour DST behavior. | Replaces vague commit/day language with a committed source-created instant and integral seconds. | One database-derived anchor, exact source package, versioned calculation, UTC arithmetic, and deterministic boundary tests. | **D50-R2–R11; D50-AC011–040, AC101–110.** |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                                                | Why it matters                                                                                  | Severity | Likelihood                         | Evidence or reasoning                                                                                             | Effect on answer                               | Best permanent fix                                                                                            | Exact specification language                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| D50 adds nullable timer fields, free-form intervals, cron, a shared scheduler table, task due dates, or Inngest-specific IDs before policy/edit/channel decisions. | Placeholder shapes become compatibility contracts and duplicate source/workflow infrastructure. | High     | High under “future-ready” pressure | D46–D49 explicitly define readiness as contracts, not dormant artifacts; generic current timers are nonprecedent. | Makes D50 artifact-free and behavior-specific. | Later implement the smallest source-time package/claim proven by OpenSpec/design; no generic reminder engine. | **D50-R1, R4–R9, R17–R20, R27–R30; D50-AC001–010, AC061–070, AC091–100.** |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                           | Why it matters                                                                                   | Severity | Likelihood        | Evidence or reasoning                                                                                | Effect on answer                                                                                                              | Best permanent fix                                                                                                             | Exact specification language                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ----------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Long creation transaction, lost response, exact-boundary equality, DST, leap day, timezone/tzdb change, clock jump, overflow, terminal race, delayed outage, successor, and restore disagree. | Core can release early, duplicate, silently change history, or accidentally pre-decide catch-up. | Critical | High in aggregate | These are ordinary temporal/distributed cases; PostgreSQL and executor docs expose the distinctions. | Adds an exact inclusive lower boundary, immutable package, safe non-admission, race outcomes, and explicit lateness deferral. | Database anchor/claim, fixed seconds, complete replay, product claim, no D50-only delayed effect, and production-shaped tests. | **D50-R2–R18, R23–R24; D50-AC011–050, AC081–110.** |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                                                             | Why it matters                                                                      | Severity | Likelihood                         | Evidence or reasoning                                                                                            | Effect on answer                                                                                                | Best permanent fix                                                                                                                                         | Exact specification language                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Developer accepts a browser timestamp, adds interval “1 day,” recalculates from current policy, backdates source time, uses Send now, or converts a delayed wake into catch-up. | Easy local choices create early/late external attention and mutable policy effects. | Critical | High without explicit prohibitions | PostgreSQL shows civil/elapsed difference; D47 forbids free-form/calendar DSL and D48 forbids historical age-in. | Adds server-only derivation, not-before semantics, and uniform negative paths while leaving lateness undecided. | Revoke generic writes, finite seconds registry, immutable candidate, no force-run/reschedule/backdate/catch-up inference, and negative architecture tests. | **D50-R2–R13, R21–R23, R27; D50-AC011–040, AC051–070, AC101–110.** |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                | Why it matters                                                                      | Severity | Likelihood                                  | Evidence or reasoning                                                             | Effect on answer                                                                                | Best permanent fix                                                                                          | Exact specification language                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Shared candidate scan, cache, claim, clock-health state, or bare FK combines one Tenant’s policy/time with another Tenant’s request or occurrence. | It can expose sensitive access work or let one Tenant’s load/config affect another. | Critical | Medium without composite scope/flow control | OpenSpec makes Tenant isolation structural inside shared workflow infrastructure. | Adds exact Tenant/environment scope to package, index, claim, audit, and executor flow control. | Same-Tenant composites, app authorization + RLS, per-Tenant cursors/claims/concurrency, no global fallback. | **D50-R3–R4, R15–R18, R21–R26; D50-AC051–070, AC091–110.** |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                      | Severity | Likelihood            | Evidence or reasoning                                                                                | Effect on answer                                                                                        | Best permanent fix                                                                                                                    | Exact specification language                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | --------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Caller supplies anchor/duration/now; an update retargets time; RLS checks only existing rows; service/BYPASSRLS skips scope; two workers both claim. | An allowed mutation can forge eligibility, cross Tenant, or create two occurrences. | Critical | High for generic CRUD | Identity OpenSpec and PostgreSQL USING/WITH CHECK/serialization guidance directly cover these risks. | Requires trusted commands, immutable constraints, and privileged parity without fixing physical schema. | Server/database derivation, composite keys, unique product claim, restrictive deletion, correct RLS/grants/functions, complete retry. | **D50-R2–R4, R10–R18, R21–R24; D50-AC011–020, AC041–060, AC081–090.** |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                                | Severity | Likelihood                             | Evidence or reasoning                                                                            | Effect on answer                                                           | Best permanent fix                                                                                                        | Exact specification language                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Elapsed timing grows into calendars, holidays, quiet hours, cron, recurrence, pauses, per-recipient zones, escalation, or a generic workflow canvas. | One courtesy occurrence becomes another automation platform with high support/migration cost. | High     | High if enterprise products are copied | Comparable IAM systems have campaign/deadline machinery because they govern different workflows. | Strictly limits D50 to one fixed elapsed model and one bounded occurrence. | Code-owned finite values, UTC instants, no calendar/recipient timing, and separate later decisions for every new meaning. | **D50-R1, R5–R9, R13, R17–R20, R30; D50-AC001–010, AC021–040, AC061–080.** |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                                | Why it matters                                                                            | Severity | Likelihood              | Evidence or reasoning                                                                                          | Effect on answer                                        | Best permanent fix                                                                                                             | Exact specification language                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| “After 3 days” is read as calendar/business days or a due date; countdowns/age color create pressure; timezone controls add noise; toast-only save causes retries. | Staff misunderstand the promise, feel judged, or configure a setting they cannot predict. | High     | High without exact copy | PostgreSQL proves “day” ambiguity; Core prioritizes clarity/accessibility and D47 forbids Due/Overdue meaning. | Adds quiet exact elapsed/no-due copy and no current UI. | Finite plain choices, elapsed helper, no countdown/urgency/timezone picker, durable accessible status, comprehension research. | **D50-R5, R7, R19–R20, R25; D50-AC031–040, AC071–080, AC111–120.** |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                        | Severity | Likelihood                   | Evidence or reasoning                                                                  | Effect on answer                                 | Best permanent fix                                                                                                           | Exact specification language                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- | ---------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Task created_at/reminder, Phase 17 item, provider scheduled time, Inngest event ts, app clock, current policy, or analytics age becomes source time. | Multiple systems disagree and circular repairs create duplicates or historical drift. | Critical | High without an owner matrix | ADRs/OpenSpec explicitly separate source, task, presentation, delivery, and execution. | Centralizes complete temporal truth in Phase 12. | Immutable source-time package and product claim; every downstream adapter consumes identifiers and re-proves current fences. | **D50-R2–R18, R21–R23; D50-AC011–020, AC041–070.** |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                                       | Why it matters                                                               | Severity | Likelihood                            | Evidence or reasoning                                             | Effect on answer                                       | Best permanent fix                                                                                                                | Exact specification language                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- | ------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| D50 reuses finance reminderHours, task reminders, database session timezone, JavaScript Date precision, D45 email timing, provider schedules, or one Inngest sleep shape. | Changes in unrelated domains/libraries/vendors alter access-governance time. | High     | High because similar primitives exist | Current code contains those tempting but incompatible precedents. | Forbids convention reuse and defines behavioral seams. | Source-owned calculation contract/version, canonical precision, identifier-only executor adapter, and forbidden-dependency tests. | **D50-R1–R10, R17–R20, R26–R30; D50-AC001–030, AC061–070, AC101–110.** |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                 | Why it matters                                                                          | Severity | Likelihood                    | Evidence or reasoning                                                                                                          | Effect on answer                                                                                            | Best permanent fix                                                                                                                                            | Exact specification language                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Request commits without timer evidence, handoff is lost, wake is early/delayed/duplicated, clock health fails, source closes, recipient proof stays indeterminate, or provider result is ambiguous. | Core may strand D43, miss/duplicate a nudge, release early, or invent delayed behavior. | Critical | High in distributed operation | Workflow OpenSpec requires product ledger/claims; Inngest timing/dedupe is not permanent; optional cadence must not block D43. | Adds atomic/safe-nonadmitted creation, source not-before claim, repair, and explicit lateness non-decision. | Commit complete package or typed no-admission, indexed reconciliation, current reproof, one product identity, and no delayed/catch-up/blind-resend inference. | **D50-R4, R10–R18, R24, R28–R29; D50-AC011–020, AC041–050, AC081–100.** |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                              | Severity | Likelihood                    | Evidence or reasoning                                                                          | Effect on answer                                                                                                                                     | Best permanent fix                                                                                                                                  | Exact specification language                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| No exact states/boundaries exist; equality differs by node; policy edit recomputes; terminal request and timer claim race; duplicate workers create occurrences. | One request can release early, twice, or after termination and history cannot be explained. | Critical | High without formal semantics | D43/D48/D49 already require episode identity, source order, and permanent product idempotency. | Defines immutable package, inclusive not-before boundary, serial current-state claim, forbidden transitions, and explicit later-decision boundaries. | Candidate <= one DB claim instant proves only the lower bound; product unique claim; complete retry; D51 for edits and later decision for lateness. | **D50-R2–R18, R23–R24, R30; D50-AC011–050, AC081–090.** |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                             | Why it matters                                                                                 | Severity | Likelihood  | Evidence or reasoning                                                         | Effect on answer                                                                    | Best permanent fix                                                                                                                          | Exact specification language                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Anchor/input/candidate are nullable or mutable, use mismatched units/precision, overflow, duplicate per request, cascade-delete, or are asynchronously patched. | Candidate drifts, unknown becomes eligible, and replay/migration can mint a second occurrence. | Critical | Medium-high | Exact arithmetic and historical audit need constraints and one atomic writer. | Requires complete immutable temporal package without prescribing a relation layout. | Closed validation, canonical unit/precision/version, same-Tenant uniqueness, restrictive deletion, digest/receipt, quarantine disagreement. | **D50-R3–R10, R16, R21–R23, R27; D50-AC011–040, AC051–060, AC081–100.** |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                      | Why it matters                                                                             | Severity | Likelihood | Evidence or reasoning                                                            | Effect on answer                                    | Best permanent fix                                                                                                                                         | Exact specification language                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Exact candidate/age, timezone, clock diagnostics, logs, exports, AI, or analytics reveal sensitive staffing/location or become coordinator surveillance. | Access-governance/member-care facts leak and a courtesy clock becomes a performance score. | Critical | Medium     | D43 detail is protected; timing metadata can reveal work patterns and geography. | Minimizes temporal fields and user-visible meaning. | Purpose-limited receipts, no protected payload/person score/location inference, authorized absolute display only, governed retention/export/backup/log/AI. | **D50-R19–R25, R29; D50-AC051–080, AC101–120.** |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                  | Why it matters                                                                             | Severity | Likelihood                  | Evidence or reasoning                                                                                                | Effect on answer                                                    | Best permanent fix                                                                                                                   | Exact specification language                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Cron scans every pending request, one sleeping function exists per row without recovery, claims lock a Tenant broadly, or boundary retries create a thundering herd. | Large Tenants and shared infrastructure degrade; timeouts invite unsafe catch-up/fallback. | High     | Medium for naïve scheduling | Workflow OpenSpec supports product-ledger recovery and per-Tenant flow control; exact volumes/SLO remain unmeasured. | Keeps executor implementation open but product query/claim bounded. | Indexed candidate cursor, small claims, per-Tenant flow control/jitter outside semantics, production plans/load tests, no full scan. | **D50-R16–R18, R24, R26, R28; D50-AC041–050, AC091–110.** |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                          | Why it matters                                                                    | Severity | Likelihood  | Evidence or reasoning                                                      | Effect on answer                                                                                      | Best permanent fix                                                                                                | Exact specification language                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Operators inspect sleeps/logs, edit candidate_at, rerun timers, interpret timezones/DST, or manually catch up after outages. | A small optional feature requires tribal knowledge and dangerous database repair. | High     | Medium-high | Executor trace/dedupe is bounded; calendar complexity multiplies runbooks. | Requires simple elapsed semantics, durable receipts, source reconciliation, and no manual time edits. | Read-only diagnosis, clock-health runbook, product-claim replay, quarantine, kill switch, no direct SQL/send-now. | **D50-R5–R18, R23–R29; D50-AC031–050, AC081–100, AC111–120.** |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                       | Why it matters                                                                             | Severity | Likelihood                              | Evidence or reasoning                                                         | Effect on answer                                                                    | Best permanent fix                                                                                                                  | Exact specification language                                    |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | --------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Only executor logs show anchor/candidate/claim or new person-level timing telemetry is added prematurely. | History cannot prove early/late behavior, while monitoring itself expands sensitive scope. | High     | High absent explicit evidence ownership | Core distinguishes durable business audit from traces; D50 activates nothing. | Requires future source receipts and current release audits without telemetry creep. | Immutable input/calculation/claim/terminal evidence, aggregate clock/executor health, zero-tolerance invariants, no person metrics. | **D50-R4, R8–R10, R16–R18, R24–R29; D50-AC011–020, AC081–120.** |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                            | Why it matters                                                  | Severity | Likelihood  | Evidence or reasoning                                                   | Effect on answer                                                                    | Best permanent fix                                                                                                                                      | Exact specification language                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| PostgreSQL function semantics, session timezone, JS parsing/precision, Inngest maximum sleep/dedupe, provider scheduling, NTP service, or tzdb update becomes hidden contract. | Dependency upgrades/outages change candidate or duplicate work. | High     | Medium-high | Official docs show function/timezone/dedupe limits and executor delays. | Makes exact calculation/version behavioral and every executor/provider replaceable. | Canonical source parser/precision/version; source claim after every wake; conformance fixtures; product uniqueness; dependency inventory/upgrade tests. | **D50-R2–R10, R16–R18, R24, R27–R29; D50-AC021–030, AC061–070, AC091–110.** |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                          | Severity | Likelihood              | Evidence or reasoning                                                | Effect on answer                                                     | Best permanent fix                                                                                                                                  | Exact specification language                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- | ----------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Migration backfills candidate from generic created_at, old code ignores calculation version, mixed writers disagree on precision, timezone update recomputes, or rollback deletes accepted evidence. | Existing requests can suddenly fire and versions disagree irreversibly. | Critical | High without sequencing | D48 forbids historical age-in; D50’s source package is absent today. | Adds no-backfill, deny-first, one-writer, immutable-history rollout. | Readers/constraints/RLS before writer; unknown deny; bounded Tenant cohort; no current/historical package inference; kill new claims; roll forward. | **D50-R1, R8–R10, R16, R21–R29; D50-AC091–110.** |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                           | Why it matters                                                        | Severity | Likelihood | Evidence or reasoning                                                                      | Effect on answer                                            | Best permanent fix                                                                                                                                     | Exact specification language   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Tests use fake timers/sleeps but miss DB boundaries, transaction-time semantics, DST/calendar negatives, lost replay, RLS bypass, mixed versions, clock health, and accessible comprehension. | Implementation passes while releasing early/late or misleading users. | Critical | High       | Correctness spans database/source/executor/UI and cannot be proved by one unit timer test. | Adds stable IDs and outcome-based, production-shaped proof. | Trace D50-R/AC through all artifacts; deterministic DB clock injection/barriers; property fixtures; auth/RLS matrix; usability/a11y; rollout evidence. | **D50-R1–R30; D50-AC001–120.** |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                                    | Why it matters                                                                                | Severity | Likelihood | Evidence or reasoning                                                                 | Effect on answer                                             | Best permanent fix                                                                                                                                      | Exact specification language              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Support/AI/import/restore edits time, an experiment accelerates a cohort, task snooze changes candidate, clock failure becomes catch-up, or age is used to rank staff. | Hidden paths bypass founder intent and convert optional attention into pressure/surveillance. | Critical | Medium     | Platform boundaries apply to support/AI; D47 rejects urgency and performance meaning. | Adds uniform no-exception/purpose rules and incident repair. | Reject force-time/sample/backdate; preserve source lineage; no task coupling/person score; privileged parity; new founder decision for changed meaning. | **D50-R9–R30; D50-AC041–080, AC091–120.** |

## Acceptance criteria

### Decision scope, current behavior, evidence, and alternatives

- **D50-AC001:** D50 is documentation-only and adds no runtime field, table,
  enum, migration, RLS policy, API, event, timer, job, Inngest function, key,
  plan, preference, channel, task behavior, telemetry pipeline, or UI.
- **D50-AC002:** The disposition is Accept with required amendments and records
  elapsed time from a committed D43 source-created business instant rather than
  silently substituting transaction-start or physical-commit telemetry.
- **D50-AC003:** Current repository verification states that D43–D50 are not
  shipped and that generic task/contribution timestamps and reminders are
  nonprecedent.
- **D50-AC004:** D47’s independent representative ministry-research,
  comprehension, fatigue, pressure, success, and stop gates remain mandatory;
  choosing clock arithmetic does not satisfy them.
- **D50-AC005:** The strongest alternative—Tenant-local calendar timing—is
  documented with its timezone/tzdb/DST/holiday/edit burden rather than
  dismissed as impossible.
- **D50-AC006:** Responsibility-generation timing is rejected because D44
  routing would become temporal authority and could indefinitely reset the
  occurrence.
- **D50-AC007:** Official sources are primary/current, support only attributed
  facts, and cannot override governing Core OpenSpec/ADRs.
- **D50-AC008:** Integral seconds, 86,400-second displayed days, and database
  clock ownership are identified as Core product judgments, not universal
  vendor standards.
- **D50-AC009:** The decision distinguishes verified facts, repository facts,
  inferences, product judgments, assumptions, and unresolved values/edit/
  channel questions.
- **D50-AC010:** No acceptance test may treat elapsed age, candidate crossing,
  or a successful reminder as proof the feature is necessary, useful, read, or
  behavior-changing.

### Source-created instant and atomic source-time package

- **D50-AC011:** Source-created instant is one finite UTC instant derived by the
  product database exactly once during the final authoritative D43 creation
  write after D48's serialized policy/request winner is proved, then committed
  with the request. A transaction that begins before activation but wins D48
  afterward cannot use its earlier transaction-start time.
- **D50-AC012:** Source-created instant is not caller/browser/app-server/worker/
  provider time, transaction ID, WAL/LSN, UUID order, HTTP arrival/response,
  transaction-start time, or a later query of generic created_at.
- **D50-AC013:** Tenant, environment, request episode, source-created instant,
  applicable policy revision/input, D48 disposition, calculation version, and
  attribution are server/database-derived and cannot be retargeted.
- **D50-AC014:** Valid creation atomically commits the D43 request, source
  receipt/audit, D48 admission, complete time package, and identifier-only
  durable handoff or none of that temporal package commits.
- **D50-AC015:** Missing, unknown, unsupported, corrupt, stale, contradictory,
  nonpositive, nonfinite, overflowing, or incompatible temporal proof commits
  the otherwise valid D43 request with typed cadence not admitted and no time
  handoff.
- **D50-AC016:** Temporal safe non-admission never retries a permanent proof
  defect indefinitely, blocks My Access, changes the grant, or later ages in
  from current policy.
- **D50-AC017:** Exact semantic creation replay returns the original request,
  source-created instant, policy input, duration, candidate, calculation
  version, receipt, and handoff after response loss.
- **D50-AC018:** A replay after candidate, policy edit, timezone change,
  deployment, or executor outage never substitutes current time/input or creates
  a successor package.
- **D50-AC019:** A valid terminal D43 predecessor never reopens; a separately
  valid successor episode receives a new source-created instant/package only
  under its own current D47/D48 proof.
- **D50-AC020:** Source-time handoff contains only schema-versioned identifiers,
  candidate reference/claim context, and safe routing evidence—no protected
  request text, grant/provenance, recipient/contact, rendered body, or secret.

### Elapsed arithmetic, UTC, timezone, precision, and calculation proof

- **D50-AC021:** Elapsed cadence input is one finite positive integral-second
  value from the exact versioned code-owned policy registry; client/free-form
  numeric or unit input is rejected.
- **D50-AC022:** Candidate instant equals source-created instant plus the exact
  integral seconds under the pinned calculation version and is materialized
  with the package rather than query-time current policy.
- **D50-AC023:** Any displayed one-day quantity maps to exactly 86,400 elapsed
  seconds; weeks map to exact multiples; months/years never enter the registry.
- **D50-AC024:** Calendar-day, business/working-day, weekend/holiday, local
  midnight, quiet-hour, cron, recurrence, and Tenant calendar constructs are
  rejected by UI, API, policy compiler, and persistence validation.
- **D50-AC025:** Candidate calculation is independent of Tenant/user/recipient
  timezone, locale, DST gap/overlap, IANA/tzdb version, travel, and system
  session TimeZone.
- **D50-AC026:** Candidate is represented/interchanged as one canonical finite
  UTC instant; locale-dependent or timezone-less timestamp strings are rejected
  at every boundary.
- **D50-AC027:** Future design fixes one bounded physical precision, canonical
  UTC serialization, parser, rounding rule, and calculation version; every
  runtime/database adapter passes shared fixtures without order-changing
  precision loss, and D50 freezes no storage/wire format.
- **D50-AC028:** Duration addition cannot overflow supported instant range,
  produce infinity, lose sign, wrap integer units, or silently truncate; every
  such result uses temporal safe non-admission.
- **D50-AC029:** A persisted candidate/input digest mismatch or recomputation
  disagreement is an impossible state that quarantines temporal release and
  never overwrites source evidence.
- **D50-AC030:** DST transitions, leap day, month/year boundary, timezone/tzdb
  changes, and host/session timezone permutations produce the same candidate
  for the same canonical anchor/input fixture.

### Future UX, comprehension, accessibility, and honest time meaning

- **D50-AC031:** D50 adds no reminder timing control, countdown, candidate
  date, age badge, urgency color, task reminder, calendar/timezone picker,
  disabled placeholder, or channel preview now.
- **D50-AC032:** If later activated, the read-only explanation is headed
  **Reminder timing** and says **Create one courtesy reminder after [duration]
  of elapsed time.**
- **D50-AC033:** The adjacent explanation says exactly: **Timing starts when
  each new access review request is created. Weekends and local clock changes
  are included. This doesn’t set a due date or change access.**
- **D50-AC034:** A day-labeled option is comprehension-tested as 24 elapsed
  hours; copy never implies business/working days, end of local day, deadline,
  or exact delivery.
- **D50-AC035:** The cadence editor remains in People & access → Access
  requests, uses Base Maia/Base UI and shared tokens, and is not duplicated in
  Tasks, Notifications, System Messages, or a workflow canvas.
- **D50-AC036:** D48’s future-only impact and D49’s recipient summary remain
  coherent in the same compact form without a separate modal, audience count,
  task control, or channel matrix.
- **D50-AC037:** Staff reminder copy, if separately registered later, says only
  that an access review is still waiting and never says Due, Overdue, late,
  urgent, ignored, unresponsive, delivered, read, or access changed.
- **D50-AC038:** Holder/requester, donor, missionary, CMS, and public surfaces
  show no candidate/countdown/reminder/delivery/recipient/awareness state.
- **D50-AC039:** Authorized audit display uses an absolute localized date/time
  with explicit zone/offset; relative time is supplementary and never changes
  calculation or becomes the sole representation.
- **D50-AC040:** Future Save/Cancel, validation, stale conflict, ambiguous
  response, and durable result preserve input and use programmatically
  announced persistent status without focus theft or toast-only dependency.

### Inclusive not-before boundary, races, and idempotency

- **D50-AC041:** One future source claim captures one database-derived finite
  claim instant; it does not compare separate browser, app, worker, or provider
  clocks.
- **D50-AC042:** Claim instant strictly before candidate returns not yet
  eligible and creates no occurrence/member/presentation/intent/provider/task
  effect.
- **D50-AC043:** Claim instant exactly equal to candidate passes the temporal
  lower bound only; later-ratified usefulness/source gates are still required.
- **D50-AC044:** A claim instant after candidate also proves only the elapsed
  lower bound; D50 does not authorize a delayed occurrence, catch-up, or
  descendant.
- **D50-AC045:** D50 defines no upper boundary, useful-lateness interval,
  delayed-wake outcome, terminal no-release state, or sealed-descendant
  suppression; implementation must not invent one.
- **D50-AC046:** A later founder decision must define evidence-backed
  useful-lateness and catch-up semantics before any runtime claim can create an
  occurrence; absent that decision, reaching candidate releases nothing.
- **D50-AC047:** D50 does not change D49 recipient indeterminacy, retry, or
  ending behavior; any such transition remains governed by D49 plus the later
  temporal decision.
- **D50-AC048:** Executor retry count, timeout, queue age, trace retention,
  outage duration, current time, or operator action cannot decide D49
  indeterminate ending or create a terminal lateness result.
- **D50-AC049:** D43 terminality, source invalidation, authorization denial, or
  any later-ratified D51 cancellation ordered before claim prevents the
  occurrence even when the candidate was reached.
- **D50-AC050:** Concurrent boundary workers and terminal/source changes have a
  deterministic serial/product-claim result; transport/executor dedupe can
  never create a second occurrence.

### Database, RLS, authorization, and Tenant isolation

- **D50-AC051:** Every future package/claim/occurrence relation carries non-null
  Tenant/environment identity and uses same-Tenant composite relationships to
  request, policy, admission, and occurrence.
- **D50-AC052:** Browser anon/authenticated roles have no base insert/update/
  delete or broad select grant for source-time packages, claims, clock-health
  evidence, or protected audit.
- **D50-AC053:** Application-layer validated session/Tenant/purpose/capability
  checks are primary and RLS independently denies cross-Tenant/unauthorized
  operations; UI hiding is never isolation.
- **D50-AC054:** Mutation policies protect both selected and resulting rows with
  correct USING/WITH CHECK behavior so an allowed mutation cannot retarget
  Tenant, request, policy, time, calculation, state, or actor.
- **D50-AC055:** ENABLE/FORCE RLS or equivalent hardening, least grants, pinned
  function search paths, and owner/service/BYPASSRLS/worker/support/migration
  parity are release requirements.
- **D50-AC056:** Human permissions.manage_grants plus registered purpose governs
  policy publication only; the automatic claim uses a separate code-owned
  system purpose and exact product predicates, never impersonating an author.
- **D50-AC057:** Caller-supplied expected heads or idempotency keys are checked
  concurrency inputs only and cannot select Tenant, anchor, duration, claim
  instant, candidate, occurrence, or actor.
- **D50-AC058:** Views, functions, RPCs, Realtime, caches, search, exports, and
  reports preserve the same Tenant/purpose/field ceiling and cannot expose time
  packages through definer/owner bypass.
- **D50-AC059:** Source-created instant/input/candidate/calculation/receipt are
  immutable or equivalently append-only, restrictively deleted, and cannot
  cascade with a task, coordinator, channel, executor, or current policy.
- **D50-AC060:** Constraints/trusted writer make impossible or quarantinable:
  duplicate package, invalid unit/value, candidate mismatch, cross-Tenant
  relation, unknown version, mutable retargeting, early claim, and duplicate
  occurrence.

### Source ownership, Tasks Hub, presentation, channels, and executor

- **D50-AC061:** Phase 12 alone owns source-created instant, elapsed input,
  candidate, claim instant/result, cancellation, occurrence, temporal
  non-decisions, and source audit.
- **D50-AC062:** D44 remains current responsibility owner and D49 remains
  recipient seal owner; neither assignment generation nor recipient local zone
  anchors or resets D50 time.
- **D50-AC063:** The existing D44 task remains the one task; D50 creates or
  mutates no due/reminder date, priority, urgency, status, completion, snooze,
  dismissal, assignment, comment, queue, or engagement.
- **D50-AC064:** Phase 17 creates no key/item/render/engagement through D50 and
  cannot infer a reminder from age/candidate; later presentation consumes only
  a valid source occurrence.
- **D50-AC065:** Phase 6/providers own later channel intent/submission/outcome
  only; provider scheduling/time never alters source candidate or occurrence.
- **D50-AC066:** Inngest may receive candidate references and identifiers after
  product commit, but its event ts, sleepUntil, run time, retry count, dedupe,
  cancellation event, precision, trace, or dashboard is never source time or
  lateness authority; physical rounding belongs to later reviewed design.
- **D50-AC067:** Every early/late/duplicate executor wake re-reads product
  package and obtains a source claim; executor result alone never marks
  occurrence created/canceled/not useful or decides catch-up.
- **D50-AC068:** Product-owned indexed reconciliation can recover missing
  wake-ups after executor redeploy/outage/trace expiry without reconstructing
  time from events or creating broad scans.
- **D50-AC069:** D45 initial email and any future channel preference/readiness/
  suppression/timezone cannot create, move, cancel, or revive D50 candidate or
  occurrence.
- **D50-AC070:** Tasks/items/channels/executors remain independently available
  or failed; none of their engagement/delivery states changes D43 request,
  grant, access, D48 admission, source time, or D49 seal.

### Privacy, accessibility, localization, and field conditions

- **D50-AC071:** Source-time events/logs/analytics/AI contain only approved
  identifiers and typed time evidence; no request reason, holder identity,
  grant/provenance, recipient/contact, message body, or location inference.
- **D50-AC072:** Candidate/age/claim timing never becomes a per-person response
  score, neglect label, workload ranking, escalation input, or employment/
  ministry performance measure.
- **D50-AC073:** Exact source-time package and clock diagnostics are visible
  only through purpose-authorized audit/operations paths; ordinary staff see
  only the safe policy/result meaning they need.
- **D50-AC074:** Retention, deletion/anonymization, export, backup, log, support,
  AI, and legal-hold treatment for temporal evidence are ratified before
  activation and remain separate from protected D43 content retention.
- **D50-AC075:** Keyboard, screen reader, focus, labels/descriptions, error
  association, non-color state, forced colors, target size, and reduced motion
  are release-blocking.
- **D50-AC076:** 320-pixel/400-percent reflow, mobile touch, RTL/CJK expansion,
  localization, long translated duration labels, and low-bandwidth operation
  remain usable with no horizontal scroll or hover-only meaning.
- **D50-AC077:** Localized date/time formatting always receives an explicit
  authorized display zone and locale; database/session/browser defaults cannot
  silently choose presentation.
- **D50-AC078:** Ambiguous/invalid/unsupported local display cannot change source
  truth; it shows a safe unavailable state while authorized absolute UTC audit
  remains recoverable.
- **D50-AC079:** External delivery failure or weak connectivity never hides the
  Access requests lane/current task or produces a false reminder-received
  state.
- **D50-AC080:** Moderated tests include small, staffed, volunteer-led,
  distributed, multi-time-zone, mobile/low-bandwidth, and assistive-technology
  ministry participants and test elapsed/no-due meaning.

### Failure handling, clock health, observability, and repair

- **D50-AC081:** Failed/unknown database/system clock-health proof pauses all
  temporal claims for affected environment, releases nothing, and leaves D43/
  D44 work available; it is not proved zero or late by assumption.
- **D50-AC082:** App/browser/worker/provider clock disagreement is diagnostic
  only; database source/claim time wins and no actor can override it.
- **D50-AC083:** A clock step forward/backward or synchronization incident never
  mutates anchors/candidates; affected unsealed claims quarantine or retry only
  under later-ratified source/usefulness rules, never D50 inference.
- **D50-AC084:** A corrupt/missing package or recomputation mismatch is
  diagnosable from body-free product receipt evidence, blocks release, and is
  never repaired from current policy, task, event, log, or provider time.
- **D50-AC085:** A committed package with missing dispatch is recovered from the
  product ledger/receipt without recalculating candidate or duplicating a wake/
  occurrence.
- **D50-AC086:** Lost source-claim response returns the original claim/
  occurrence result through semantic replay and never evaluates a new now to
  create an additional effect or invent a lateness result.
- **D50-AC087:** Provider timeout before/after acceptance uses product intent
  plus provider evidence; no blind resend or new source occurrence is justified
  by elapsed time.
- **D50-AC088:** Cross-Tenant time/claim exposure or confirmed early release is
  a security/data-integrity incident: stop affected effects, preserve evidence,
  assess disclosure, fence paths, and repair forward.
- **D50-AC089:** Support/runbooks permit read-only diagnosis, source-claim/
  dispatch reconciliation, and kill; no backdate, reschedule, send-now, member
  override, package edit, or direct SQL catch-up.
- **D50-AC090:** Durable business receipt/audit proves anchor/input/candidate/
  claim/outcome independently of technical logs, metrics, workflow history, or
  provider retention and distinguishes D50 lower-bound proof from later
  lateness decisions.

### Scalability, migration, rollout, rollback, and operational proof

- **D50-AC091:** Candidate reconciliation uses an indexed exact-Tenant bounded
  cursor/claim query and never scans all requests, tasks, coordinators,
  notifications, providers, or historical records.
- **D50-AC092:** Flow control and claims isolate Tenants, use bounded batches,
  avoid long transactions/sleeps while holding locks, and prevent boundary
  thundering herds without changing semantic time.
- **D50-AC093:** Before activation, explain/analyze/index/lock evidence meets a
  ratified source-claim SLO under production-shaped volume; D50 invents no
  unsupported latency budget.
- **D50-AC094:** Load proof includes at least 100,000 terminal requests in one
  Tenant and 10,000 current requests across many Tenants, boundary contention,
  outage recovery, and no cross-Tenant/no-full-scan behavior.
- **D50-AC095:** Rollout installs deny-compatible readers, unknown-version
  handling, constraints, RLS, receipt inspection, and safe display before one
  compatible source writer.
- **D50-AC096:** Mixed-version proof shows old readers deny/ignore temporal
  packages safely, old writers cannot create them, one calculation version
  owns new writes, and executor adapters cannot run ahead.
- **D50-AC097:** Migration/backfill never infers anchor/input/candidate from
  generic created_at, policy, task, item, message, provider, event, log, import,
  restore insertion time, or present age.
- **D50-AC098:** Activation uses a bounded Tenant cohort only after D47 research,
  D48–D51+, OpenSpec/design, values, channels, retention, accessibility,
  security, clock, operations, and rollback evidence are accepted.
- **D50-AC099:** A source kill switch stops new claims/occurrences and
  unaccepted downstream effects without closing requests, changing tasks/
  access, deleting packages/receipts, or claiming provider recall.
- **D50-AC100:** Rollback is roll-forward compatible: preserve immutable
  packages/claims/occurrences/provider truth, disable writer/executor, repair
  handoffs, and never recompute or rewrite history.

### Testability, traceability, and independent proof

- **D50-AC101:** D50-R1–R30 and D50-AC001–AC120 retain stable identifiers across
  decision log, glossary, ADRs, OpenSpec, design, tasks, GitHub tickets,
  implementation, tests, and release evidence.
- **D50-AC102:** Positive tests prove valid package atomicity, exact elapsed
  arithmetic, semantic replay, before/equal/after-candidate lower-bound
  outcomes, one product identity, and zero D50-only occurrence release.
- **D50-AC103:** Negative tests prove no caller/app/worker/provider clock, no
  calendar/DST/timezone arithmetic, no free-form/invalid input, no task
  coupling, no policy-query recompute, no historical backfill, and no inferred
  catch-up/upper-bound/terminal-lateness behavior.
- **D50-AC104:** Deterministic database clock/transaction fixtures distinguish
  transaction-, statement-, and clock-time semantics and avoid real sleeps or
  wall-clock race luck.
- **D50-AC105:** Boundary/race tests cover source terminal vs claim, two
  workers, response loss, unchanged D49 indeterminate state after candidate,
  D51 cancellation hook, clock-health failure, and executor replay after dedupe
  expiry.
- **D50-AC106:** Temporal property tests cover sign/zero/overflow/infinity,
  design-selected bounded precision, subsecond before/equal/after, DST gaps/
  overlaps, leap day, month/year end, timezone/tzdb/session changes, and
  serialization/order parity.
- **D50-AC107:** Authorization tests cover same/cross Tenant, exact/wrong
  purpose, browser denial, stale head, RLS USING/WITH CHECK, owner/service/
  worker/support/migration/impersonation/AI, and clock-health administration.
- **D50-AC108:** Migration tests cover old-code/new-schema, new-code/old-schema
  rejection, unknown calculation version, no backfill, restore, mixed
  deployment, kill, rollback, and roll-forward repair.
- **D50-AC109:** Accessibility/usability proof includes automated checks plus
  manual keyboard/screen-reader/focus/status/forced-colors/zoom/reflow/mobile/
  RTL/CJK/translation/low-bandwidth and elapsed/no-due comprehension.
- **D50-AC110:** Release evidence includes source/race transcripts, shared time
  fixtures, query/index plans, RLS matrix, clock-health drill, executor outage
  recovery, privacy/security review, research, runbooks, monitors, and rollback
  drill tied to user/domain outcomes.

### Monitor discipline, remaining decisions, and final proof

- **D50-AC111:** Every monitored risk names a signal, threshold, owner, and
  response; a monitor name alone authorizes no schema, metric, alert, vendor,
  person score, or sensitive log.
- **D50-AC112:** Any candidate derived from a non-source anchor, non-integral
  elapsed value, calendar/timezone rule, current policy query, or unsupported
  calculation version has zero tolerance and blocks release.
- **D50-AC113:** Any occurrence/member/intent/task effect with claim instant
  before candidate, or any D50-only upper-bound/catch-up/terminal-lateness
  transition, has zero tolerance and triggers source/data-integrity response.
- **D50-AC114:** Any mutated/recomputed package, duplicate package/occurrence,
  or replay returning different time evidence has zero tolerance.
- **D50-AC115:** Any cross-Tenant package/claim/cache/display/export or
  privileged-path authorization mismatch has zero tolerance and follows
  security incident response.
- **D50-AC116:** Failed/unknown clock health or source/executor handoff gap
  releases nothing and invokes the named operational response without changing
  source truth.
- **D50-AC117:** Any task due/reminder/urgency mutation, Due/Overdue/SLA copy,
  individual score, or holder/public timing disclosure has zero tolerance.
- **D50-AC118:** External products remain comparative evidence only; any
  imported practice conflicting with Core’s source/no-deadline boundary must be
  identified and rejected or separately governed.
- **D50-AC119:** D50 chooses no numeric cadence/usefulness value, upper
  boundary, catch-up, delayed-wake, D49-ending, or non-Off-edit/Off/re-enable
  effect; D51 and later founder/evidence decisions must resolve them.
- **D50-AC120:** D50 succeeds only when every admitted request uses one
  immutable database-derived source package, exact fixed elapsed arithmetic,
  one inclusive not-before boundary, zero early or D50-inferred late effects, no
  task/source meaning drift, and no runtime activation by implication.

## Named monitors without new telemetry authority

These are future release/audit obligations. D50 creates no metric, table, log
field, alert, dashboard, time service, or vendor. Before activation, design
must map every signal to approved product receipts, security audit, existing
aggregate infrastructure, or a separately privacy-reviewed minimized addition.

| Signal                                                                                                                                            | Threshold                                                                                                 | Owner                                        | Required response                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D50-PREMATURE-ARTIFACT-AUDIT** — D50-named runtime/schema/job/key/flag/UI/OpenSpec implementation before remaining decisions                    | Any occurrence                                                                                            | Architecture + Phase 12 Product              | Block release, remove the artifact, and prove no runtime/data effect                                                                                     |
| **D50-ANCHOR-AUTHORITY-BREACH** — package anchor comes from caller/app/worker/provider/generic field instead of authoritative D43 source creation | Any occurrence                                                                                            | Phase 12 + Data Integrity                    | Quarantine package/effects, disable writer, preserve D43, and correct source derivation                                                                  |
| **D50-ELAPSED-CALCULATION-BREACH** — non-integral/free-form/calendar/timezone/DST/current-policy arithmetic or unsupported calculation version    | Any occurrence                                                                                            | Phase 12 + Database + Architecture           | Block temporal release, disable incompatible writer/reader, and restore reviewed calculation fixtures                                                    |
| **D50-TEMPORAL-BOUNDARY-BREACH** — occurrence/effect before candidate or any D50-only upper-bound/catch-up/terminal-lateness behavior             | Any occurrence                                                                                            | Phase 12 + Workflow Platform + Security      | Stop affected effects, assess disclosure/noise, preserve evidence, remove unratified behavior, and repair claim logic                                    |
| **D50-TIME-PACKAGE-MUTATION-BREACH** — anchor/input/candidate/version changes after commit or replay returns different evidence                   | Any occurrence                                                                                            | Data Integrity + Phase 12                    | Quarantine, disable mutation/reconciler, restore immutable receipt truth, and add regression proof                                                       |
| **D50-DUPLICATE-OCCURRENCE-BREACH** — more than one semantic occurrence for one request episode/courtesy class                                    | Any occurrence                                                                                            | Phase 12 + Workflow Platform                 | Stop claims, preserve first authoritative receipt, quarantine later descendants, and repair uniqueness                                                   |
| **D50-CROSS-TENANT-TIME-INCIDENT** — package/claim/cache/audit/display/export crosses Tenant/environment                                          | Any confirmed occurrence                                                                                  | Security + IAM + Data Integrity              | Stop affected release, preserve evidence, assess exposure, fence access, and repair forward under incident policy                                        |
| **D50-CLOCK-HEALTH-FENCE** — absolute primary database clock offset from the approved infrastructure reference                                    | More than 5 seconds for two consecutive 1-minute samples, or unknown at claim time                        | Database Operations + Platform SRE           | Pause affected temporal claims, retain lane/task, restore synchronization/proof, and resume only after two healthy samples and every later-ratified gate |
| **D50-SAFE-NONADMISSION-HEALTH** — temporal proof safely fails at D43 creation                                                                    | More than 2% of at least 100 cadence-eligible creations in 24 hours, or any continuous 15-minute interval | Phase 12 + Data Integrity + Platform SRE     | Pause cadence admission for affected scope, diagnose registry/version/clock/data, preserve D43, and never backfill                                       |
| **D50-HANDOFF-GAP** — valid committed time package lacks retriable identifier-only dispatch/reconciliation state                                  | Any reconciled package                                                                                    | Workflow Platform + Phase 12                 | Repair from source receipt without recalculation and verify no duplicate claim                                                                           |
| **D50-CALENDAR-DEPENDENCY-AUDIT** — business-day/holiday/local-midnight/timezone/tzdb/session-zone input reaches source calculation               | Any code/design/test path                                                                                 | Architecture + Database + UX                 | Block release, remove dependency, restore fixed elapsed semantics, and repeat boundary fixtures                                                          |
| **D50-TASK-MEANING-BREACH** — task due/reminder/urgency/status or task age creates/moves/completes occurrence                                     | Any occurrence                                                                                            | Tasks Hub + Access Product                   | Block producer, restore source/task separation, remove invalid projection where safe, and test non-ownership                                             |
| **D50-PRIVACY-MEANING-BREACH** — protected payload/location inference/person score/Due-Overdue language enters temporal evidence or UX            | Any occurrence                                                                                            | Privacy + Security + UX                      | Stop exposure, assess/purge where lawful, restore allowlists/plain copy, and repeat review                                                               |
| **D50-PERFORMANCE-SLO** — source package/claim/reconciliation exceeds later ratified query/lock SLO                                               | Two consecutive five-minute windows above ratified SLO or any timeout-triggered safety fallback           | Database + Phase 12 + Platform SRE           | Pause rollout, retain ordinary work paths, inspect plans/locks/flow control, and never weaken correctness                                                |
| **D50-COMPREHENSION-GATE** — participants misunderstand elapsed day, start point, no-due meaning, future-only scope, or delivery uncertainty      | Below 90% correct in moderated representative testing                                                     | UX Research + Access Product + Accessibility | Keep feature Reserved, simplify copy/choices, and repeat testing                                                                                         |

## Migration, rollout, rollback, kill, and repair

### D50 rollout now

1. Record only the corrected D50 decision, source-time terminology, ownership/
   invariant/lifecycle/race matrices, D50-R1–R30, D50-AC001–AC120, and D51
   question.
2. Add no runtime or OpenSpec implementation scenario through D50.
3. Keep D43–D49 documentation and current product truthful: no access-request
   reminder or clock is active.
4. Preserve current Phase 17 census/manifest and all task/notification code.

### Future implementation sequence

1. Resolve D51 policy edit, Off cancellation, re-enable, admitted-unsealed
   behavior, and sealed-but-not-yet-irreversible descendants.
2. Resolve the evidence-backed cadence value, whether/how useful lateness is
   bounded, its exact delayed/catch-up/indeterminate-ending behavior, and any
   source correction/clock-health posture.
3. Complete D47’s preregistered representative ministry validation with
   comprehension, fatigue, pressure, success, harm, and stop criteria.
4. Resolve exact content, source meaning/version, in-product presentation,
   each external channel, preference/consent/suppression, retention/export/
   deletion, and sealed-but-unsubmitted cancellation behavior.
5. Add source-specific identity/access and outbound-communications OpenSpec
   requirements. Generic reminder/task requirements are insufficient.
6. Design the smallest Phase 12 package/claim representation, source
   transaction, product ledger, indexes, same-Tenant constraints, RLS/grants/
   functions/views, clock-health fence, audit, reconciliation, and executor
   adapter.
7. Install deny-compatible readers, unknown-version handling, constraints/RLS,
   receipt inspection, and runbooks before exactly one compatible writer.
8. Prove deterministic database-time/race behavior, shared calculation
   fixtures, semantic replay, privileged parity, no-backfill migration,
   accessibility/comprehension, production performance, executor/clock outage,
   kill, and rollback.
9. Activate a bounded Tenant cohort only with all named monitors/runbooks
   ready; expand only on clean evidence.

### Migration and upgrade rules

- No current or historical request receives a synthesized time package.
- Generic created_at, task/item/provider/event/log timestamps, restore insertion
  time, and current policy are forbidden backfill sources.
- Missing/unknown/unsupported package or calculation version is fail-closed and
  releases nothing.
- Old readers must deny/ignore safely; old writers cannot create a package;
  exactly one calculation/writer generation owns new package creation.
- Shared fixtures must pass before database, API/runtime, or executor upgrades.
- Timezone/tzdb/display-library updates cannot rewrite source instants/
  candidates.
- Executor/provider replacement consumes product records/claims and preserves
  semantic identities.

### Rollback and kill

A kill operation stops new cadence admission, temporal claims, occurrence
seals, and all new unaccepted irreversible descendants. It does not close D43
requests, alter D44 responsibility/task, change access, delete packages/
receipts, edit anchors/candidates, or claim provider recall. Previously accepted
provider outcomes remain historical truth. Rollback disables writers/adapters
and repairs forward while preserving immutable source evidence.

### Repair

- Missing time-package handoff is recreated from the immutable source receipt.
- Duplicate wake/dispatch is reconciled to the one product claim.
- Corrupt/mismatched package quarantines temporal release; D43 remains usable.
- Early/late release or cross-Tenant exposure is an incident, not a timestamp
  edit.
- Clock-health recovery resumes only claims permitted by all later-ratified
  temporal/source gates and never invents catch-up or a lateness outcome.
- Missing/unknown historical package remains no-admission; no operator backfills.
- Support cannot backdate, reschedule, send now, override the fence, or rewrite
  source history.

## Ruthless synthesis

### Resolved before D50 is recorded

- “Source-creation commit” is a committed database-derived business instant,
  not a literal physical commit timestamp.
- Source creation atomically pins anchor, applicable policy duration,
  calculation version, candidate, receipt, and handoff.
- Invalid temporal proof preserves D43 through typed safe non-admission.
- Duration is finite positive integral seconds; a displayed day is exactly
  86,400 seconds.
- UTC/fixed elapsed arithmetic is independent of civil calendars, zones, DST,
  holidays, and route changes.
- Candidate is an inclusive not-before boundary only.
- Useful-lateness, upper boundary, catch-up, delayed-wake behavior, descendant
  suppression, and D49-indeterminate ending remain explicit later decisions.
- Database claim time, product identity, and current source/auth gates outrank
  executor clocks/dedupe.
- No task/date/SLA/urgency meaning and no D50 UI exists.
- Policy edits never recompute by implication; D51 is next.

### Requirements to carry into future spec and design

- D50-R1–R30 and D50-AC001–AC120 without renumbering or semantic drift.
- Canonical terms, owner/invariant/state/race/failure matrices, exact arithmetic,
  inclusive not-before boundary, safe non-admission, and explicit lateness
  non-decision.
- Trusted source/claim time, complete atomic package, immutable calculation
  evidence, product claims, indexed reconciliation, clock-health fence, and
  executor non-ownership.
- Same-Tenant composite integrity, application authorization, RLS/grants/
  views/functions/RPCs, privileged parity, privacy/retention/export, migration,
  rollout, kill, repair, and evidence.
- Exact future UX copy, no-due/no-countdown/no-timezone-control boundary,
  accessibility, localization, mobile, low bandwidth, and comprehension proof.

### Implementation safeguards required

- One trusted Phase 12 source writer and one source claim boundary.
- One canonical calculation library/version and shared cross-runtime fixtures.
- Product-database semantic uniqueness beyond transport windows.
- Deterministic database-time injection and concurrency barriers in tests.
- No calendar/current-policy/task/executor recomputation.
- No historical backfill, direct time edit, force-run, or inferred catch-up.
- Deny-first mixed-version rollout and roll-forward recovery.

### Risks allowed only under named monitoring

Only aggregate safe-nonadmission health, handoff gaps, clock health, later
ratified performance SLO, and comprehension may be monitored as residual
operational/product risk. Non-source anchor, arithmetic/calendar drift, early
release or unratified lateness behavior, package mutation, duplicate
occurrence, cross-Tenant exposure, task ownership, privileged bypass, and
privacy/meaning breach have zero-tolerance thresholds and are incidents.

## Exact final D50 decision to record

**Disposition: Accept with required amendments.**

> For each D48-admitted D43 request episode, the authoritative Phase 12
> creation command derives one finite UTC source-created instant from the
> product database exactly once during its final source write after D48's
> serialized policy/request winner is proved and atomically commits that
> business anchor with the request, exact applicable D47 cadence revision/input,
> D48 disposition, code-owned calculation version, finite positive integral-
> second duration, exact candidate instant, source receipt/audit, and identifier-
> only durable handoff. This is the authoritative “source-creation commit”
> anchor; it is not physical commit telemetry, transaction/statement/app/
> browser/worker/provider time, or a generic created_at convention.
>
> Candidate instant is computed once as source-created instant plus exact
> elapsed seconds. A displayed day is 86,400 seconds. UTC governs arithmetic
> and interchange; weekends, holidays, leap days, local midnight, Tenant/user/
> recipient timezone, DST, IANA/tzdb changes, route changes, and task/item/
> channel state do not change it. Calendar/business days, months/years, cron,
> free-form duration, and workflow rules are forbidden. Future design must
> select one exact bounded physical precision, UTC serialization, rounding,
> parser, calculation version, and cross-runtime fixture set; no adapter may
> lose ordering or release before candidate. D50 freezes no storage or wire
> format.
>
> The package is immutable. Exact replay returns it verbatim. A later policy
> edit cannot silently recompute or move candidate time; D51 decides edit/Off/
> re-enable effects. Missing, stale, unknown, corrupt, nonpositive, nonfinite,
> overflowing, contradictory, or incompatible temporal proof never blocks the
> valid D43 request: it commits through D48’s typed cadence-not-admitted result
> with no temporal handoff and never ages in later.
>
> One future source claim captures one database-derived claim instant. Before
> candidate it creates nothing. Candidate is the inclusive lower boundary; a
> claim instant equal to or later than it satisfies only that not-before check.
> The code-owned system command may attempt the one D49 occurrence only after
> current D43, D48, source/cancellation, authorization, clock-health, D49, and
> every later-ratified temporal gate. D50 chooses no useful-lateness value,
> upper boundary, catch-up/delayed-wake outcome, terminal-lateness state,
> descendant suppression, or D49-indeterminate ending. No runtime may infer
> those semantics, and D50 creates no delivery guarantee.
>
> Candidate/age/fence is not Due, Overdue, SLA, deadline, urgency, escalation,
> no-response, task reminder, access effect, default decision, or human-
> performance evidence. The existing D44 task remains the one work identity.
> Phase 12/product database own temporal and occurrence truth; D44/D49 own
> responsibility/recipient truth; ADR-0183 owns task projection; ADR-0027/Phase
> 17 and Phase 6 own later presentation/delivery; Inngest, if used, only wakes
> or reconciles identifier-only product claims and remains replaceable.
>
> D50 activates no schema, OpenSpec requirement, value, timer, job, event,
> Inngest function, stable message key, channel, preference, task field,
> telemetry, setting, or UI. A future proven form belongs in People & access →
> Access requests and explains elapsed timing, included weekends/local clock
> changes, and no due/access effect using the exact accessibility and UX
> contract above.

## D51 — How should later cadence changes affect admitted work that is not yet irreversible?

### Why this needs a separate decision

Suppose three requests are admitted under one non-Off elapsed interval. One has
an immutable D50 candidate in the future, one is eligible but D49 resolution is
indeterminate, and one has sealed D49 members but no presentation/provider step
has crossed an irreversible boundary. An authorized administrator changes the
non-Off interval, then turns the policy Off, and later enables it again. Core
must decide whether each effect continues, cancels, pauses, recomputes, or is
resurrected.

This decision is consequential: an edit could silently accelerate many
requests, Off could fail to stop expected future attention, or re-enable could
release a surprise backlog. All options preserve D48’s no historical backfill,
D50’s immutable source package/audit, one occurrence per request, the D44 lane/
task, no access/Due/Overdue effect, and the historical non-retractability of any
already provider-accepted effect.

This is the highest-dependency next question because source claims cannot
truthfully evaluate current cancellation, and implementation cannot finalize
package lifecycle or policy UX, until Off/edit/re-enable semantics are fixed.

[Microsoft Entra](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
distinguishes Current instances from future Series changes and offers an
explicit irreversible Stop for an active instance.
[SailPoint](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)
applies changed access-request reminder configuration to requests created after
the change while pending requests retain submission-time configuration.
[HubSpot](https://knowledge.hubspot.com/workflows/turn-off-workflows) currently
skips scheduled actions while a workflow is Off and does not replay skipped
actions after re-enable. These are useful patterns, not direct authority for
Core’s simpler source model.

### Option 1 — prospective edits, Off stops every not-yet-irreversible effect, no resurrection — recommended

Non-Off-to-non-Off interval edits apply only to genuine D43 requests created
after the new policy boundary; already admitted requests retain their original
immutable source package. Off is a monotonic safety cancellation for every
admitted occurrence from prior active generations that has not yet sealed and
a suppression fence for every not-yet-irreversible descendant of an already
sealed occurrence. Provider-accepted effects remain historical and cannot be
recalled. Re-enable applies only to later genuine requests and never revives
canceled or suppressed work.

**UX/impact:** interval edits are predictable and future-only; Off means no
future reminder effect can still emerge from prior optional work that has not
crossed its irreversible boundary; re-enable cannot cause catch-up. The
consequence review can explain each effect without listing requests or exposing
protected details.

### Option 2 — every edit, including Off, is prospective only

Already admitted requests and sealed-but-unpresented occurrences always
continue under their original package. Non-Off changes, Off, and re-enable
affect only later requests.

**UX/impact:** strongest immutability and simplest data behavior, but an
administrator who turns reminders Off could still see future reminders created
from previously admitted work. That is a dangerous mismatch with ordinary Off
expectations.

### Option 3 — recompute, pause, and resume admitted work

Non-Off edits recompute candidate instants for admitted unsealed requests; Off
pauses them and sealed-but-unpresented descendants; re-enable resumes or
recalculates them under the latest interval.

**UX/impact:** maximally flexible but can accelerate or bunch a backlog, needs a
complete current cohort and baseline, makes policy edits scheduling commands,
and creates complex concurrency, migration, preview, rollback, and repair.

### Recommendation and exact question

**My recommendation is Option 1 — non-Off interval edits are prospective; Off
monotonically cancels or suppresses every prior-generation effect that is not
yet irreversible; re-enable applies only to later genuine requests and never
resurrects canceled or suppressed work.** It preserves immutable source timing while
making Off a trustworthy safety narrowing, prevents surprise catch-up, and
avoids a mutable scheduler/current-cohort engine.

Which D51 policy should Core record: **Option 1 — prospective interval edits,
monotonic Off cancellation/suppression through each irreversible boundary, and
no resurrection**, **Option 2 — all edits including Off are prospective only**,
or **Option 3 — recompute, pause, and resume admitted work**?

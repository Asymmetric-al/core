# Phase 24 D52 — Bounded Reminder Usefulness Window

- **Status:** Autonomous choice adjudicated; documentation-only future contract
- **Decision:** **Option 1 — one finite product-owned usefulness window**
- **Disposition:** **Accept with required amendments**
- **Date reviewed:** 2026-08-29
- **Scope:** D50 **not_before** lower bound, separately pinned
  **useful_for_seconds**, exclusive **useful_until** upper bound, D49
  indeterminate ending, D51 Off,
  D43/source terminality, descendant admission, temporal races, authorization,
  RLS, privacy, UX, failure recovery, scale, migration, proof, and D53
- **Non-scope:** no runtime, schema, migration, OpenSpec delta, numeric duration,
  cadence value, Tenant setting, message key/content/channel, task behavior,
  Inngest function, feature flag, telemetry pipeline, or UI is authorized by D52

## Executive adjudication

The finite product-owned window is the only defensible model of the three, but
“run it for a while after **not_before**” is too vague to record. Request
lifetime is potentially unbounded and would let infrastructure delay define
the recipient experience. Exact-instant execution is not reliable: the
**not_before** is a point, normal polling/outage/transaction delay can miss it, and
a zero-width half-open interval contains no valid claim instant.

The corrected decision is:

> If the optional D47 reminder later earns activation, each D48-admitted D43
> request pins one complete timing profile with finite positive integral-second
> **wait_for_seconds** and **useful_for_seconds**. The same immutable source-time
> package retains the profile identity/revision, both exact values, calculation
> version, and finite UTC **not_before** (D50's candidate instant) and
> **useful_until** instants computed once. No Tenant,
> browser, worker, provider, support path, experiment, policy edit, or current
> registry lookup can choose or rewrite that duration.
>
> The claim interval is exactly **[not_before, useful_until)**:
> **not_before** is inclusive and **useful_until** is exclusive. After acquiring
> the relevant source/claim locks and immediately before the transition, each
> product command captures one fresh trusted primary-database claim instant.
> Before **not_before**, the occurrence is not yet eligible. At or after
> **not_before** and strictly before **useful_until**, the same occurrence may attempt only after
> current D43/D48/D51/D49, authorization, clock-health, and product-claim proof.
> At or after **useful_until**, no still-unadmitted source seal or descendant may
> cross its boundary.
>
> D49 indeterminate resolution may retry only the same occurrence inside the
> half-open window. At **useful_until** it becomes permanently **expired
> no-release**; it never becomes proved zero, releases a partial set, catches
> up, revives after re-enable, or creates another occurrence. D49 sealed proved
> zero remains its existing terminal historical result.
>
> D43 terminality, D51 Off, cancellation-epoch mismatch, recipient/source loss,
> or authorization loss may narrow earlier and always wins when proved before
> an admission boundary. A boundary admitted with a claim instant inside the
> window remains truthful history even if presentation/provider evidence
> follows later. The window never recalls or pretends to undo an irreversible
> effect.
>
> For in-product attention, **useful_until** is an admission ceiling only. A local
> item released inside the interval remains governed by ADR-0027 and current
> D43 source actionability; D52 does not end active/unread presentation,
> fabricate engagement, or create a presentation-retention deadline.
>
> For the currently governed email step, **Unprepared** and **Prepared
> definitely unsubmitted** work is suppressible when **useful_until** wins.
> Submission-attempt admission before **useful_until** permanently yields
> **Submission may have begun** with independent **None**, **Accepted**,
> **Definitely rejected**, or **Indeterminate** outcome. The one initial call
> admitted inside may start after **useful_until** only as the immediate
> continuation of that same pre-I/O critical section, with its envelope already
> prepared/decrypted and inside the registered adapter's bounded fence-to-I/O
> rule; it may then finish or reconcile later.
> At/after expiry, no new attempt admission, follow-up call, retry, replacement,
> rekey, changed payload, resend, or additional provider I/O may be authorized.
> Every future channel must register its own product-owned
> admission/finality/recovery boundary and cannot inherit email assumptions.
>
> D52 creates no user-facing deadline or expiring task. It changes no request,
> task, priority, grant, EffectiveAccess, decision, access, or coordinator
> performance fact and creates no expiry/cancellation notification. The future
> Base Maia cadence form adds no usefulness field, slider, advanced control,
> countdown, “expires,” Due/Overdue, SLA, urgency, or catch-up status. Each
> visible cadence card is one complete timing profile and uses one quiet helper
> sentence: **If Asym cannot create the reminder soon enough, it skips it
> instead of sending it late.** D50's no-due/no-access copy remains.

The amendments make usefulness a source-owned safety ceiling rather than an
executor retry setting, an implicit request deadline, or a new Tenant knob.

## Problem validity and strongest alternatives

The root problem is real only if D47's optional reminder later ships: a durable
worker can wake after **not_before** because of deployment, outage, rate limit,
clock-health pause, or temporarily indeterminate D49 proof. Core must decide
whether that one occurrence remains useful rather than let executor behavior
decide accidentally.

The strongest alternative is request-lifetime eligibility. It is simple and
continues to re-prove current source truth, but a request may remain pending for
weeks or months; a reminder arriving arbitrarily late is surprising and turns
operational backlog into product behavior. Microsoft Entra's review-lifetime
model is tied to an explicit review end date and default decision, facts D43
deliberately does not have.

Exact-instant eligibility is rejected. It avoids late attention but is brittle:
ordinary scheduler granularity or outage loses the occurrence, equality at a
continuous timestamp is not a usable delivery contract, and it makes worker
punctuality source truth.

The finite window is accepted conditionally. D52 does not validate a universal
numeric duration or prove the reminder should ship. D53 must choose how the
code-owned duration is selected; later research must establish the value.

## Evidence classification

### Verified repository facts

- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
  requires server-derived Tenant/identity/capability and makes application
  authorization primary with RLS as defense in depth.
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
  makes product records, claims, authorization, audit, and dispatch ledger
  authoritative while Inngest remains an identifier-only executor.
- [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  keeps permission-sensitive mutation server-side and preserves one shared
  Tasks Hub model.
- [Platform Principles](../../../openspec/specs/platform-principles/spec.md)
  prioritizes Tenant/permission safety, clarity, accessibility, and reliable
  behavior over convenience.
- [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md) gives each
  Delivery Step its own irreversible boundary and separates email dispatch
  phase from provider outcome.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  separates source applicability, queryable presentation, personal engagement,
  source-owned presentation end, and durable history.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  makes tasks projections; reminder usefulness cannot complete or expire work.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  reserves useful-lateness expiry to D52 and requires current source,
  cancellation, authorization, and channel-specific admission proof.
- D43 owns pending/terminal request truth without a due date or default decision.
- D47 keeps the reminder conditional and forbids urgency/performance meaning.
- D48 admits only genuine post-boundary request episodes and pins policy facts.
- D49 allows indeterminate same-occurrence retry until a later usefulness
  fence, while proved zero and sealed members are terminal results.
- D50 pins one immutable inclusive **not_before** and trusted database
  claim instant but intentionally leaves the upper bound open.
- D51 makes Off an earlier monotonic source fence, ends Off-fenced
  indeterminate work, and preserves boundary-first history.
- No D43–D52 cadence/usefulness runtime, schema, key, channel, or UI ships.

### Verified current official primary evidence

- [Kubernetes CronJob documentation](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
  provides a finite delayed-start deadline and explicitly explains that work
  after it may no longer be useful. It also warns that suspended work can catch
  up without a deadline and that jobs must be idempotent.
- [AWS EventBridge Scheduler retry policy](https://docs.aws.amazon.com/scheduler/latest/APIReference/API_RetryPolicy.html)
  bounds retry by maximum event age and attempt count. This supports a finite
  operational horizon, not AWS's values or executor ownership.
- [RFC 8030](https://www.rfc-editor.org/rfc/rfc8030.html#section-5.2)
  requires Web Push TTL, recognizes messages can become useless, and prevents a
  push service from attempting delivery after its retained TTL; provider TTL
  still begins only after product admission.
- [Firebase Cloud Messaging lifespan documentation](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan)
  distinguishes provider acceptance from device delivery and offers a broad
  TTL range, confirming both usefulness and provider state are product-specific.
- [Apple APNs request documentation](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns)
  describes best-effort expiration and warns delivery may occur after the
  timestamp, so provider expiry cannot prove recall or non-arrival.
- [Inngest timeout documentation](https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-timeouts)
  distinguishes queued-start from execution-finish timeout. Executor timeout is
  useful defense in depth but cannot own Core usefulness or interrupt a product
  effect already inside an atomic step.
- [Inngest pause/resume documentation](https://www.inngest.com/docs/guides/pause-functions)
  says skipped events do not replay automatically but may be manually replayed,
  demonstrating why Core must forbid ungoverned catch-up at the product claim.
- [RFC 7519 expiration semantics](https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.4)
  requires current time to be before expiration, supporting an exclusive upper
  bound as a general temporal convention.
- [PostgreSQL range documentation](https://www.postgresql.org/docs/current/rangetypes.html)
  explicitly models inclusive/exclusive bounds and documents lower-inclusive,
  upper-exclusive construction. D52 adopts those semantics without requiring a
  range column.
- [PostgreSQL date/time documentation](https://www.postgresql.org/docs/current/datatype-datetime.html)
  documents finite timestamp precision and warns that stored relative time
  shorthands can become stale. D52 retains absolute calculated evidence.
- [Microsoft Entra access-review documentation](https://learn.microsoft.com/en-us/entra/id-governance/perform-access-review)
  presents a due date and review-period default behavior; this is evidence that
  request-lifetime reminders normally rely on an explicit deadline, not
  authority to add one to D43.
- [WCAG timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
  requires care when UI time limits constrain a user's task and notes an
  alternative persistent inbox can avoid a transient-message time barrier.
  D52 therefore cannot expire D43/Tasks Hub work or show a user countdown.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) governs accessible control/status
  semantics for any later policy disclosure.

Infrastructure products demonstrate finite start/retry horizons, but none
governs Core's duration or turns executor expiration into product truth.

### Reasonable inferences

- A short outage should not silently lose an otherwise useful one-time nudge.
- A reminder arriving arbitrarily long after **not_before** is more confusing
  than helpful for a no-deadline request.
- Hiding reliability-window internals from ordinary settings reduces false
  precision and prevents administrators treating it as a second cadence.

### Product judgments and unresolved unknowns

- One finite product-owned half-open usefulness window is a Core judgment.
- The duration's selection model and exact seconds are not validated; D53 is
  next.
- Representative ministry evidence does not yet establish acceptable late
  arrival, offline/low-bandwidth tolerance, cadence value, fatigue, or whether
  any reminder is necessary.
- Later design must choose physical storage/precision, calculation version,
  terminal-result materialization, indexes, retention, operational budgets, and
  channel-specific boundaries without weakening D52.

## Current behavior, intended behavior, and permanent path

| Area                   | Current repository behavior    | D52 intended contract                                                     | Best permanent path                 |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------- | ----------------------------------- |
| **not_before**         | D50 docs only                  | Inclusive lower bound unchanged                                           | Immutable Phase 12 source package   |
| **useful_for_seconds** | None                           | Complete timing-profile pair, finite positive code-owned elapsed value    | Versioned registry, no Tenant field |
| **useful_until**       | None                           | **not_before** plus **useful_for_seconds**, finite UTC, exclusive         | Immutable absolute source evidence  |
| D49 indeterminate      | Docs only                      | Same-occurrence retry inside; expired no-release at upper bound           | Phase 12 terminal source result     |
| D49 proved zero        | Docs only                      | Existing terminal empty result unchanged                                  | Immutable source history            |
| D51 Off/D43 terminal   | Docs only                      | Earlier narrowing wins                                                    | Current source ceilings             |
| In-product effect      | Bell demo is non-authoritative | Useful-until gates first release only; released item follows D43/ADR-0027 | ADR-0027 presentation contract      |
| Governed email         | Resend used in other domains   | Prepare/admit only inside; admitted attempt may resolve later             | ADR-0026/Phase 6 axes               |
| Tasks/access           | Existing independent domains   | No mutation, expiry, deadline, or notification                            | D43/D44/ADR-0183 remain truth       |
| UX                     | No cadence editor              | No window setting; one quiet optional disclosure                          | Existing Base Maia cadence form     |

## Domain model, ownership, and invariants

### Canonical terms

**Timing profile:** One complete versioned code-owned pair of finite positive
integral-second **wait_for_seconds** and **useful_for_seconds**, pinned for the
request episode.

**Useful-until instant:** The finite immutable UTC **useful_until** upper
boundary computed once as **not_before + useful_for_seconds** under a versioned
checked calculation.

**Useful claim interval:** The exact half-open interval **[not_before,
useful_until)**. **not_before** belongs to the interval; **useful_until** does not.

**Expired no-release:** The permanent source result for the still-unsealed or
D49-indeterminate occurrence when a claim instant is at/after **useful_until**.
It is not proved zero, request resolution, task completion, or delivery failure.

**Boundary-first effect:** An exact descendant whose product-owned
irreversible admission committed using one trusted claim instant inside the
window. Its later presentation/provider evidence remains truthful.

### Ownership matrix

| Authoritative fact                    | Owner                                            | Permitted consumers           | Explicit non-owners                |
| ------------------------------------- | ------------------------------------------------ | ----------------------------- | ---------------------------------- |
| **not_before**/source-time package    | Phase 12 D50                                     | D52 calculation/claims        | browser, task, executor            |
| Timing-profile registry/pair/revision | Phase 12 code-owned temporal policy              | D48/D50 package creation      | Tenant setting, provider           |
| **useful_until**/calculation evidence | Phase 12 request package                         | claims/audit/projections      | current registry query, worker     |
| Expired no-release result             | Phase 12 source occurrence                       | Phase 17/6 suppression/audit  | task, notification engagement      |
| D49 member/zero/indeterminate proof   | Phase 12 source occurrence                       | usefulness/source claims      | channel, current route alone       |
| D51 cancellation epoch                | Phase 12 policy                                  | every later claim             | **useful_until** calculation       |
| In-product presentation/history       | ADR-0027/Phase 17 under D43 source actionability | authorized staff presentation | D52 expiry, read/archive as source |
| Email dispatch/outcome                | Phase 6 + provider evidence                      | operations/audit              | usefulness source row, executor    |
| D43/D44 work and access               | D43/D44/EffectiveAccess owners                   | People & access/Tasks Hub     | **useful_until**, reminder         |
| Wake/reconciliation                   | Replaceable executor                             | identifier-only product claim | time/source/idempotency truth      |

### Domain invariants

1. D52 creates no current artifact or behavior.
2. One timing profile is a complete versioned code-owned pair of finite
   positive whole-second **wait_for_seconds** and **useful_for_seconds**.
3. No Tenant/user/API/import/AI/support/provider/executor path chooses or edits it.
4. A D48-admitted request has one complete usefulness package or typed safe
   non-admission; partial temporal evidence is impossible.
5. **useful_until** equals **not_before + useful_for_seconds** once, is finite,
   strictly later than **not_before**, and never recomputes.
6. Eligibility is **not_before <= claim_instant < useful_until** using one fresh
   primary-database claim captured after locks immediately before transition.
7. UTC and elapsed seconds govern arithmetic; timezone, DST, calendar, locale,
   weekends, holidays, and business days are display-only.
8. Every unadmitted D49 seal and descendant re-proves D43/D48/D51, D49,
   usefulness, authorization, clock health, and product uniqueness.
9. D49 indeterminate retries only the same occurrence inside the window and
   becomes permanent expired no-release at/after **useful_until**.
10. Sealed proved zero and sealed member history never reopen or reseal.
11. D43 terminality, D51 Off, epoch mismatch, source/recipient loss, or
    authorization loss may narrow before **useful_until**.
12. Admission-first preserves truthful history; expiry never recalls an effect.
13. D52 gates in-product first release only; an already released item continues
    under current D43 actionability and ADR-0027 without fabricated engagement.
14. Governed email preparation is suppressible at expiry; the one initial call
    admitted inside may start later only as the same bounded pre-I/O critical
    section, then finish/reconcile, but expiry authorizes no new attempt or
    additional provider I/O.
15. The window creates no due date, task expiry, urgency, SLA, escalation,
    default decision, access effect, performance metric, or catch-up.
16. Semantic uniqueness survives policy edits, expiry, retries, restore, and
    executor replacement.
17. Every relation/query/claim/audit is exact-Tenant, purpose-scoped,
    server-derived, and protected across ordinary and privileged paths.

## Lifecycle, temporal correctness, concurrency, and failure

### Conceptual lifecycle

These are behavioral states, not a schema prescription:

1. **No usefulness package:** cadence not admitted or temporal proof invalid.
2. **Waiting:** valid package; trusted instant is before **not_before**.
3. **Useful and unsealed:** trusted instant is within the half-open window;
   same occurrence may attempt D49/current proof.
4. **Useful and D49 indeterminate:** releases nobody; same occurrence may retry
   while every current gate remains true and claim instant stays inside.
5. **Sealed proved zero:** immutable terminal empty result.
6. **Sealed members, descendants retractable:** each exact descendant still
   must cross its boundary before the earliest current source ceiling.
7. **In-product released:** D52 admission is complete; current D43 actionability
   and ADR-0027 alone govern active/unread presentation and history.
8. **Email prepared definitely unsubmitted:** exact artifact exists but expiry
   may still suppress it before provider I/O.
9. **Email submission may have begun:** attempt boundary won inside; its one
   initial call may start after expiry only as the immediate same prepared/
   decrypted bounded fence-to-I/O critical section, then finish/reconcile. A
   stalled/restarted process performs no later I/O.
10. **Expired no-release:** unsealed/indeterminate/unadmitted work is terminal.
11. **Earlier source-fenced:** D43 terminal, D51 Off, authorization/source loss,
    or another stricter ceiling won before expiry.

Forbidden transitions include waiting directly to release, expired to retry,
indeterminate to proved zero by timeout, zero to members, expired/re-enabled to
catch-up, **useful_until** recomputation, prepared-after-expiry to attempt, admitted
email back to prepared, and expiry to local engagement mutation.

### Required race and failure outcomes

| Race or failure                                                                                                            | Required result                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claim instant before **not_before**                                                                                        | Not yet eligible; no occurrence/effect                                                                                                                  |
| Claim instant exactly **not_before**                                                                                       | Lower bound passes; all other gates still required                                                                                                      |
| Claim instant strictly inside window                                                                                       | Same occurrence may advance through current proof                                                                                                       |
| Claim instant exactly **useful_until**                                                                                     | Expired no-release; upper bound is exclusive                                                                                                            |
| Claim instant after **useful_until**                                                                                       | Expired no-release; no catch-up                                                                                                                         |
| D49 indeterminate then recovers inside                                                                                     | Retry same identity; seal members/zero only from complete current proof                                                                                 |
| D49 indeterminate reaches **useful_until**                                                                                 | Permanent expired no-release; never zero or partial                                                                                                     |
| D49 proved zero before expiry                                                                                              | Terminal zero remains; no retry at route change or expiry                                                                                               |
| D43 terminal/Off wins before claim                                                                                         | Earlier source fence denies admission                                                                                                                   |
| Source terminal/Off overlaps claim                                                                                         | Stable source transaction or full retry produces one order                                                                                              |
| Useful claim seals D49 before expiry; descendant waits                                                                     | Descendant re-proves expiry and all current ceilings                                                                                                    |
| Useful-until wins before in-product release                                                                                | No queryable reminder                                                                                                                                   |
| In-product release wins inside window                                                                                      | Item/history follows current D43 actionability and ADR-0027; D52 expiry changes no engagement/presentation                                              |
| Useful-until wins while email is unprepared/prepared                                                                       | Suppress before provider I/O; preserve evidence/retention                                                                                               |
| Email attempt admission wins inside window                                                                                 | Exact call may finish and evidence may arrive later; no recall                                                                                          |
| Email attempt admission wins inside but process stalls/restarts or exceeds registered fence-to-I/O bound before first byte | Dispatch remains **Submission may have begun** with ambiguous/None evidence as permitted; abort, preserve history, and perform no resumed/retry/new I/O |
| Email attempt is in flight when expiry passes                                                                              | Preserve **Submission may have begun** plus independent outcome; no further call                                                                        |
| Email becomes definitely rejected after expiry                                                                             | Preserve rejection; no retry/new attempt                                                                                                                |
| Worker/executor wakes late or duplicates                                                                                   | Product claim decides once; executor status has no business effect                                                                                      |
| Database clock health is failed/indeterminate                                                                              | Release nothing; recovery may retry only if still inside                                                                                                |
| Restore occurs after **useful_until**                                                                                      | Preserve original package; terminalize unreleased work; no age-in/catch-up                                                                              |
| Policy/registry duration changes later                                                                                     | Existing package/window unchanged; only later genuine request disposition may pin new value                                                             |

## UX/UI contract

### D52 creates no surface now

No usefulness setting, slider, preset, date, countdown, “expires,” status,
notification, task field, placeholder, or telemetry is added through D52.

### Future quiet policy journey

If the complete reminder later activates, D52 adds no second field to the
existing route-addressable Base Maia cadence form/Sheet. Cadence remains the
only Tenant choice. The compact default view remains quiet.

Each visible cadence card represents one complete timing profile and includes:

> If Asym cannot create the reminder soon enough, it skips it instead of
> sending it late.

Do not show the internal pair, **not_before**, **useful_until**, retry count, worker
state, countdown, progress bar, expired count, affected-recipient count, or
“send by” promise in ordinary settings. Authorized D42 audit/provenance may
show localized **not_before**/**useful_until** and typed source result when needed for
diagnosis, without implying human lateness.

Recipients and holders receive no “reminder expired/canceled” item, task,
email, chat, or badge. The Access requests lane and source-backed task remain
available according to D43/D44 even when courtesy attention expires. This is
not a WCAG user-task timeout because D52 removes only optional unadmitted
attention and preserves the persistent authorized work path.

### Accessibility, localization, mobile, and field conditions

Any later disclosure/audit result uses Base Maia/Base UI and Zinc tokens,
semantic text, keyboard/screen-reader order, visible focus, programmatic status,
non-color meaning, forced colors, target size, reduced motion,
320-CSS-pixel/400-percent reflow, localization, RTL/CJK expansion, mobile touch,
and low-bandwidth recovery. Localized display never changes elapsed arithmetic.
No UI counts down or auto-submits/ends a human task.

## Normative requirements

- **D52-R1:** D52 is documentation-only and creates no runtime, schema,
  migration, OpenSpec, value, registry entry, key, channel, job, telemetry, or UI.
- **D52-R2:** D52 selects a finite product-owned usefulness window and rejects
  request-lifetime and exact-instant eligibility.
- **D52-R3:** Each timing profile is one complete versioned code-owned pair of
  finite positive integral-second **wait_for_seconds** and
  **useful_for_seconds**; neither is inferred from the other.
- **D52-R4:** No Tenant/user/browser/API/import/AI/support/provider/executor
  input or separate free-form/preset UI controls **useful_for_seconds**.
- **D52-R5:** Future D48/D50 admission atomically retains a complete immutable
  usefulness package or typed safe non-admission with the D43 request.
- **D52-R6:** **not_before** and **useful_until** are computed once from the
  complete pair, with **useful_until = not_before + useful_for_seconds**, under
  a versioned checked calculation; invalid,
  nonfinite, nonpositive, overflowing, or precision-losing proof fails closed.
- **D52-R7:** The valid interval is **[not_before, useful_until)**:
  **not_before** is inclusive and **useful_until** exclusive.
- **D52-R8:** After acquiring relevant locks and immediately before each D49
  seal or still-unreleased descendant transition, the command captures one
  fresh trusted primary-database **claim_instant** for both bounds/all gates;
  app/worker/browser/provider/transaction-start clocks cannot authorize.
- **D52-R9:** UTC and exact elapsed seconds govern arithmetic; timezone, locale,
  DST, weekend, holiday, business day, calendar units, and tzdb do not.
- **D52-R10:** Profile identity/revision, **wait_for_seconds**,
  **useful_for_seconds**, calculation evidence, **not_before**, and
  **useful_until** are immutable across edits/replay/restore/migration/change.
- **D52-R11:** Every D49 seal and descendant admission re-proves current
  D43/D48/D51/D49, useful interval, authorization, clock health, and uniqueness.
- **D52-R12:** D49 indeterminate retries only the same occurrence inside the
  window and releases no partial/guessed/known subset.
- **D52-R13:** At/after **useful_until**, unsealed or D49-indeterminate work becomes
  permanent expired no-release and never retries after policy/re-enable/change.
- **D52-R14:** Sealed proved zero remains terminal zero; expiry neither rewrites
  it nor admits a later cohort.
- **D52-R15:** D43 terminality, D51 Off/epoch mismatch, source/recipient loss,
  and authorization loss may end eligibility earlier and never extend the window.
- **D52-R16:** Irreversible-admission-first preserves exact truthful
  effect/history even if visible/provider evidence occurs after **useful_until**.
- **D52-R17:** Useful-until gates first in-product release only. A released item
  remains governed by current D43 source actionability and ADR-0027; D52 never
  ends active/unread presentation or fabricates read/dismiss/archive/delete.
- **D52-R18:** Governed email **Unprepared**/**Prepared definitely unsubmitted**
  is suppressible at expiry; preparation itself is not irreversible admission.
- **D52-R19:** Governed email attempt admission inside the window permits that
  one initial call to start after **useful_until** only as the immediate
  continuation of the same prepared/decrypted pre-I/O critical section within
  its registered bounded fence-to-I/O rule, then finish or reconcile. A stalled,
  restarted, or over-budget process performs no call;
  expiry permits no new attempt admission, follow-up, retry, replacement,
  rekey, changed payload, resend, additional provider I/O, or recall claim.
- **D52-R20:** Every future channel registers/proves its own product-owned
  admission/finality/recovery boundary and cannot inherit email semantics;
  provider TTL may only narrow post-admission delivery and never owns/extends
  the source interval.
- **D52-R21:** Expiry creates no catch-up, successor occurrence, second task,
  cancellation/expiry notification, unread reset, or recipient-facing effect.
- **D52-R22:** Usefulness changes no D43 request, D44 task/responsibility,
  decision, grant, EffectiveAccess, holder status, access, or source work.
- **D52-R23:** Human policy publication remains D44-governed
  **permissions.manage_grants**; automatic temporal/source claims use separate
  registered code-owned purposes and never impersonate the human.
- **D52-R24:** Future persistence uses non-null same-Tenant composites,
  server-derived fields, application authorization, least grants, restrictive
  deletion, RLS **USING/WITH CHECK**, and privileged-path parity.
- **D52-R25:** Caller-controlled Tenant, actor, policy/source head, pair/value,
  **not_before**, **useful_until**, **claim_instant**, identity, result, or attribution is
  ignored/rejected and never trusted.
- **D52-R26:** Logs/audit/export/backup retain only purpose-minimum temporal and
  identity evidence; no protected request/body/recipient/ministry context is
  added by D52.
- **D52-R27:** Future ordinary UX adds no usefulness control/countdown/deadline;
  each visible cadence card is one complete profile and includes the exact
  quiet skip-instead-of-late helper while preserving D50 no-due/no-access copy
  and persistent source/task paths.
- **D52-R28:** Claims/reconciliation use indexed bounded exact-Tenant cursors,
  semantic uniqueness, per-Tenant fairness, and product receipts; no full scan,
  sleeping-run truth, or thundering-herd catch-up.
- **D52-R29:** Rollout is additive, deny-first, mixed-version safe, complete-
  Tenant-cohort bounded, monitored, killable, repairable, and roll-forward after
  temporal writes.
- **D52-R30:** D53 plus D47's representative-evidence gate must admit exact
  complete **(wait_for_seconds, useful_for_seconds)** profile pairs before
  activation; D52 infers no pair or numeric value.

## Ruthless adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                         | Why it matters                                                                                               | Severity | Likelihood               | Evidence or reasoning                                                                                           | Effect on answer                                             | Best permanent fix                                                                                                                           | Exact specification language                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| D52 could assume the reminder is necessary, or solve executor retries instead of stale-recipient attention. | This would freeze speculative ministry behavior and let infrastructure policy masquerade as product meaning. | High     | High absent the D47 gate | D47 remains conditional; Kubernetes/AWS show bounded delivery age but do not validate Core reminders or values. | Narrows Option 1; does not reject the finite semantic model. | Keep D52 documentation-only and conditional; compare request lifetime and exact instant explicitly; require independent activation evidence. | “D52 defines a product source ceiling only if D47 later activates. It creates no reminder, scheduler, duration value, channel, or user setting.” |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                                          | Why it matters                                                                          | Severity | Likelihood             | Evidence or reasoning                                                                                      | Effect on answer                                                                | Best permanent fix                                                                                                          | Exact specification language                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Exact equality, worker-local duration, current registry lookup, or separate lower/upper clock reads can make identical work pass or fail by timing accident. | Ordinary scheduling delay, restart, or policy change would lose or resurrect attention. | Critical | High without amendment | D50 already requires one DB claim instant; continuous timestamp equality is not a viable execution window. | Replaces vague finite-window prose with an immutable half-open source interval. | Pin the complete pair and absolute **not_before/useful_until**; evaluate both bounds with one trusted DB claim after locks. | “Eligibility is not_before <= claim_instant < useful_until from the immutable package; no other clock or current value participates.” |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                  | Why it matters                                                          | Severity | Likelihood | Evidence or reasoning                                                                                             | Effect on answer                      | Best permanent fix                                                                            | Exact specification language                                                                                                                  |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Each channel could add its own retry age, TTL field, expiry status, and cleanup job. | Push/chat/email would drift and force migrations when providers change. | High     | Medium     | ADR-0026 makes boundaries channel-specific while source truth remains product-owned; provider TTLs differ widely. | Narrows architecture, not the choice. | One Phase 12 source window; adapters may only narrow their post-admission retention/delivery. | “No provider/executor TTL owns usefulness. Future channels consume the same source ceiling but separately prove admission/finality/recovery.” |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                    | Why it matters                                                                          | Severity | Likelihood        | Evidence or reasoning                                                                  | Effect on answer                                              | Best permanent fix                                                                                                           | Exact specification language                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact upper-bound equality, indeterminate proof, zero proof, terminal race, clock pause, prepared email, in-flight call, restore, or later policy change may disagree. | Core could release after expiry, call a provider twice, or mislabel zero/indeterminate. | Critical | High in aggregate | These are normal distributed/temporal states; D49–D51 deliberately keep them distinct. | Requires the explicit race matrix and terminal results below. | Half-open comparison, one claim instant, immutable states, earlier source ceilings, boundary-first history, and no catch-up. | “At useful_until equality the unadmitted result is expired no-release; admitted-before remains history; indeterminate never becomes zero.” |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                                     | Severity | Likelihood | Evidence or reasoning                                                                     | Effect on answer                                   | Best permanent fix                                                                                         | Exact specification language                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| A developer can add days with calendar arithmetic, expose a free-form Tenant value, force-send expired work, or label the source request expired. | Easy local choices create false deadlines, privacy noise, and permanent data debt. | Critical | Medium     | D50 forbids civil/calendar arithmetic and privileged time overrides; D43 has no deadline. | Adds explicit prohibitions and architecture tests. | Positive whole seconds, server derivation, no ordinary/privileged override, typed expired-no-release only. | “No UI/API/support/import/experiment may set, extend, backdate, or force the window; expiry never changes D43/Tasks Hub/access.” |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                              | Why it matters                                                                                       | Severity | Likelihood                       | Evidence or reasoning                                                                     | Effect on answer                                  | Best permanent fix                                                                                                         | Exact specification language                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| A **not_before/useful_until** package, cursor, cache, claim, or repair may be read/applied under another Tenant. | Cross-Tenant reminders or suppression expose sensitive access-review activity and corrupt attention. | Critical | Low with controls; severe impact | Identity and Access requires exact server-derived Tenant across application auth and RLS. | Requires structural same-Tenant proof throughout. | Same-Tenant composites, purpose-scoped commands, Tenant-keyed cursors/caches/idempotency, and cross-Tenant negative tests. | “Every D52 relation, read, claim, receipt, reconciliation, repair, cache, and audit query carries exact trusted Tenant/environment/source identity.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                      | Why it matters                                        | Severity | Likelihood                     | Evidence or reasoning                                                                          | Effect on answer                      | Best permanent fix                                                                                                         | Exact specification language                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Caller timestamps, nullable/overflowing values, mutable packages, incomplete WITH CHECK, absent-row races, or owner/service bypass can admit stale work. | One privileged defect defeats the usefulness ceiling. | Critical | Medium without explicit design | PostgreSQL distinguishes range bounds and RLS USING/WITH CHECK; repo authorization is primary. | Requires later database design proof. | Server-derived immutable fields, checks, same-Tenant FKs, stable CAS, restrictive delete, least grants, privileged parity. | “Both profile values are positive; useful_until is finite and greater than not_before; every ordinary/privileged mutation proves Tenant, purpose, source, and interval.” |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                   | Severity | Likelihood                         | Evidence or reasoning                                                                                               | Effect on answer                     | Best permanent fix                                                                 | Exact specification language                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Core could build a generic scheduler DSL, per-channel window engine, Tenant sliders, calendar exceptions, expiry notifications, or cleanup workflow. | Speculative flexibility makes a one-occurrence safety fence noisy and expensive. | Medium   | High if “future-ready” is overread | D47 allows finite code-owned choices only; no evidence supports localization/calendar or Tenant usefulness control. | Aggressively narrows implementation. | One versioned source calculation and claim predicate; leave physical storage open. | “D52 authorizes no DSL, generic scheduler/cancellation engine, Tenant window control, calendar, expiry workflow, or channel TTL abstraction.” |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                              | Why it matters                                                                                              | Severity | Likelihood               | Evidence or reasoning                                                                                   | Effect on answer                            | Best permanent fix                                                                                                      | Exact specification language                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| A second timing control, countdown, send-by date, expired badge, or warning modal creates false precision and deadline pressure. | Ministries may treat optional attention as SLA/performance, while mobile/AT users face needless complexity. | High     | High without constraints | D47/D50 prohibit urgency; WCAG timing rules matter if human task access expires, which D52 must not do. | Changes future UX to quiet disclosure only. | No usefulness control or countdown; preserve persistent lane/task; optional plain-language disclosure in existing form. | “Ordinary UX exposes no duration/upper instant/retry state and never labels a request/task/person late or expired.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                           | Why it matters                                                             | Severity | Likelihood | Evidence or reasoning                                                                         | Effect on answer                        | Best permanent fix                                                            | Exact specification language                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scheduler timeout, task state, notification engagement, provider TTL, or current registry could each claim to own usefulness. | Dual ownership causes revival, premature hiding, and irreconcilable audit. | Critical | Medium     | Governing ADRs separate Phase 12 source, task, presentation, external dispatch, and executor. | Requires explicit ownership/invariants. | Phase 12 package and claim own usefulness; other domains only consume/narrow. | “Only immutable Phase 12 useful_until and current source ceilings authorize first admission; task/item/provider/executor facts cannot extend it.” |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                        | Why it matters                                                                      | Severity | Likelihood                    | Evidence or reasoning                                                              | Effect on answer                                        | Best permanent fix                                                                                                       | Exact specification language                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Usefulness could silently depend on cadence length, Inngest retention, queue retry settings, provider TTL, timezone, or current D44 route. | Changing unrelated infrastructure/product policy would change old request behavior. | High     | High for naïve implementation | D50 pins duration evidence and Platform Orchestration makes executors replaceable. | Requires separately pinned facts and public claim seam. | Separate usefulness identity/value; absolute instant; identifier-only wakes; current route affects recipient proof only. | “Cadence, usefulness, executor retention, provider TTL, and recipient route are independent facts with no implicit synchronization.” |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                              | Why it matters                                                                                  | Severity | Likelihood | Evidence or reasoning                                                                                                    | Effect on answer                                                            | Best permanent fix                                                                                                     | Exact specification language                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handoff loss, late wake, DB clock-health failure, terminal-projection lag, provider timeout, or restore can occur around expiry. | Blind retry may contact someone after the safety ceiling or misstate why unadmitted work ended. | Critical | Medium     | Inngest timeouts occur between steps; provider acceptance/delivery is ambiguous; source must be independently re-proved. | Adds durable receipts/repair without altering timely released presentation. | Fail closed, reconcile exact identity, never resend ambiguity, restore original package, preserve ADR-0027 separation. | “Operational failure may lose optional attention but can never extend useful_until, weaken source ceilings, mutate released engagement, or create a second effect.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                   | Why it matters                                         | Severity | Likelihood                       | Evidence or reasoning                                                                    | Effect on answer                                   | Best permanent fix                                                                                                                | Exact specification language                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------- | -------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two workers or a boundary/expiry race can each appear valid; clock reads can straddle the boundary; D49 retry can outlive the window. | This violates zero-or-one and can leak late attention. | Critical | High without transactional proof | D50 requires one DB instant; PostgreSQL supports explicit inclusive/exclusive semantics. | Defines one half-open interval and terminal state. | Capture one claim instant, CAS exact identity, retry whole command, preserve boundary-first receipt, terminalize unadmitted work. | “No command reads time twice to choose a favorable result; semantic idempotency is keyed to the durable occurrence/effect, not wake/run/request.” |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                        | Why it matters                                                                | Severity | Likelihood | Evidence or reasoning                                                | Effect on answer                              | Best permanent fix                                                                                                      | Exact specification language                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Duration/value mismatch, recomputation drift, duplicate packages, mutable expiry, zero misclassification, or destructive cascade can erase why work ended. | Audit/reporting/support cannot prove correct non-release or effect authority. | High     | Medium     | D50 packages and D49 terminal results are immutable source evidence. | Requires constraints and append-only history. | Store identity/revision/seconds/absolute result/calculation evidence together; verify on read; quarantine disagreement. | “Mismatch never overwrites the package; it blocks unadmitted effects and enters authorized repair while immutable original evidence remains.” |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                              | Why it matters                                                                | Severity | Likelihood | Evidence or reasoning                                                                       | Effect on answer                                           | Best permanent fix                                                                                  | Exact specification language                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Expiry reports, logs, traces, DLQs, or policy previews could expose requester/recipient identity, request reason, location, or ministry context. | Access-review timing can reveal sensitive staffing/member-care relationships. | Critical | Medium     | ADR-0027 and D42 require role-safe/minimized presentation; D37 avoids current-work details. | Removes ordinary impact/expiry lists and narrows evidence. | Opaque identifiers/safe reason codes, purpose-tiered audit, retention/deletion/export/backup tests. | “D52 adds no names, bodies, reasons, counts, or protected source detail to settings, logs, events, traces, exports, or monitoring.” |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                                                   | Severity | Likelihood | Evidence or reasoning                                                                  | Effect on answer               | Best permanent fix                                                                                          | Exact specification language                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Full pending scans, one sleeping function per request as truth, broad expiry updates, or outage catch-up can produce lock storms/noisy neighbors. | Larger Tenants fail when the safety boundary is most needed and timeouts tempt unsafe shortcuts. | High     | Medium     | D50 requires indexed reconciliation; Kubernetes warns of missed-job catch-up behavior. | Constrains query/worker shape. | Indexed **not_before/useful_until** cursors, small CAS claims, per-Tenant fairness, bounded reconciliation. | “No expiry fanout is required for correctness; claim predicates enforce the absolute fence and cleanup is resumable projection work.” |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                  | Why it matters                                                          | Severity | Likelihood | Evidence or reasoning                                                                                              | Effect on answer                                               | Best permanent fix                                                                   | Exact specification language                                                                                                                     |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operators may need SQL to force/extend expiry, replay a missed reminder, or clear stale projections. | Manual intervention is unsafe, unaudited, and creates tribal knowledge. | High     | Medium     | Delayed/expired work is expected in durable systems; monotonic history should be repaired by replay, not mutation. | Requires supported body-free evidence and roll-forward repair. | Exact projection replay, quarantine, package verifier, no force-send/extend command. | “Repair can materialize terminal projections from receipts but cannot change not_before, useful_until, occurrence identity, or admission order.” |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                               | Why it matters                                                                  | Severity | Likelihood                   | Evidence or reasoning                                                            | Effect on answer                                  | Best permanent fix                                                                                              | Exact specification language                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- | ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Logs may say timeout/failed while the product admitted an effect, or “expired” without distinguishing Off/source/auth/usefulness. | Staff cannot diagnose expected suppression versus correctness/security defects. | High     | High without domain receipts | Executor logs are non-authoritative; boundary and provider outcome are separate. | Requires durable typed history plus safe metrics. | Record calculation evidence, claim instant, gate result, boundary order, terminal reason, correlation; no body. | “Audit distinguishes not-yet, expired no-release, D49 indeterminate, proved zero, earlier source fence, boundary-first, and provider evidence.” |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                            | Why it matters                                                                                                | Severity | Likelihood                  | Evidence or reasoning                                                        | Effect on answer                | Best permanent fix                                                                                                               | Exact specification language                                                                                              |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | --------------------------- | ---------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Inngest timeout, AWS/Kubernetes event age, FCM/APNs TTL, or provider acceptance may be assumed to enforce D52. | Vendors can delay, shorten, reorder, or best-effort deliver after expiry; changing vendors changes semantics. | Critical | High across future channels | RFC 8030/FCM/APNs expose distinct TTL semantics and non-delivery guarantees. | Rejects dependency-owned truth. | Product claim before every irreversible boundary; provider TTL only narrows after admission; reconciliation preserves ambiguity. | “No provider/executor success, timeout, retention, or TTL can authorize after useful_until or prove recall/non-delivery.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                   | Why it matters                                                                 | Severity | Likelihood            | Evidence or reasoning                                                                                | Effect on answer                                      | Best permanent fix                                                                                                               | Exact specification language                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- | --------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Existing packages may lack usefulness evidence, old workers may ignore it, or rollback may drop written upper bounds. | Mixed versions can emit stale reminders or backfill old requests unexpectedly. | Critical | Medium during rollout | D48 forbids historical age-in; every admission path must understand the new fence before activation. | Requires additive deny-first rollout and no backfill. | New requests only, typed no-admission for missing evidence, all paths dark-deployed, complete cohort, roll forward after writes. | “No historical request receives a synthesized window; enabled cohorts require complete compatible source/effect readers and writers.” |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                           | Why it matters                                                                         | Severity | Likelihood                     | Evidence or reasoning                                             | Effect on answer                                  | Best permanent fix                                                                                       | Exact specification language                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- | ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| “Briefly delayed,” “useful,” “expired,” and “before” may remain prose; tests may mock a timer and miss exact boundaries/RLS/provider crashes. | Implementation can pass while releasing at equality, across Tenants, or after restore. | Critical | High without numbered criteria | D49–D51 correctness spans source, DB, presentation, and delivery. | Adds 120 falsifiable criteria and proof matrices. | Deterministic DB-time barriers; property/race/restore/auth/a11y/performance tests; end-to-end trace IDs. | “Every D52-R/AC maps decision→glossary→ADR→OpenSpec→design→ticket→code→test→release with identical bounds, states, owners, and non-effects.” |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                             | Why it matters                                                              | Severity | Likelihood | Evidence or reasoning                                                         | Effect on answer                                   | Best permanent fix                                                                                                        | Exact specification language                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analytics may score staff by expiry, success may be called “on time,” or a future experiment may extend windows for engagement. | Optional attention becomes surveillance/pressure and hidden mutable policy. | High     | Medium     | D47/D50 forbid urgency/performance meaning; no usefulness value is validated. | Adds semantic/analytics prohibitions and D53 gate. | No person scores/SLO meaning/experiments; monitor only safety, system health, fatigue, comprehension with aggregate data. | “Useful-until is a product safety boundary, not a deadline, staff metric, campaign optimization target, or evidence that the reminder is needed.” |

## Acceptance criteria

### Scope, alternatives, and evidence

- **D52-AC001:** The D52 change set contains this document only and no runtime,
  schema, migration, OpenSpec, value, key, job, channel, telemetry, or UI.
- **D52-AC002:** Repository proof confirms no production D43–D52 usefulness
  package, claim, terminal-result projection, or control currently ships.
- **D52-AC003:** D52 remains conditional on independent D47 proof that the
  optional reminder should activate.
- **D52-AC004:** The record compares finite window, request lifetime, and
  exact-instant alternatives against the same source and UX outcomes.
- **D52-AC005:** Request lifetime is rejected because D43 has no finite due/end
  fact and may remain pending indefinitely.
- **D52-AC006:** Exact-instant is rejected because ordinary execution cannot
  reliably claim a continuous timestamp point and zero-width **[x,x)** is empty.
- **D52-AC007:** Vendor/executor age windows are treated as comparators or
  defense in depth, never Core authority or duration evidence.
- **D52-AC008:** Repository facts, current primary evidence, inference, product
  judgments, assumptions, and unknowns are labeled separately.
- **D52-AC009:** D52 chooses no numeric usefulness seconds and no Tenant choice.
- **D52-AC010:** D52 success does not authorize the reminder, prove benefit, or
  satisfy cadence/content/channel/activation gates.

### Immutable usefulness package and calculation

- **D52-AC011:** Every future admitted request retains one complete profile
  identity/revision, positive whole-second **wait_for_seconds** and
  **useful_for_seconds**, calculation version, **not_before**, and
  **useful_until**, or records typed safe non-admission.
- **D52-AC012:** Both profile values are retained separately and neither can be
  derived from the other.
- **D52-AC013:** Duration zero, negative, fractional, infinite, free-form,
  calendar, month/year, business-day, unknown, or unsupported values fail closed.
- **D52-AC014:** **useful_until** equals immutable **not_before +
  useful_for_seconds** under the retained calculation version.
- **D52-AC015:** **useful_until** is finite, UTC-normalized, exactly representable
  at the chosen precision, and strictly later than **not_before**.
- **D52-AC016:** Overflow, nonfinite result, rounding loss, contradictory
  recomputation, or unsupported calculation produces no executable package.
- **D52-AC017:** Valid D43 creation atomically commits the complete D48/D50/D52
  disposition/package/receipt/handoff or none of those optional facts.
- **D52-AC018:** Lost-response semantic replay returns the original profile,
  **not_before**, **useful_until**, calculation evidence, and receipt exactly.
- **D52-AC019:** Current registry/policy/timezone/route/task/provider/executor
  changes never recompute an existing package.
- **D52-AC020:** Backup restore and projection rebuild preserve original package
  meaning and never derive a new upper bound from restore time.

### Half-open temporal claim

- **D52-AC021:** After relevant locks and immediately before transition, one
  product claim captures one fresh trusted primary-database **claim_instant**
  and uses it for every temporal/current-gate comparison in that command.
- **D52-AC022:** A **claim_instant** before **not_before** returns not-yet-eligible and
  creates no occurrence, member, presentation, intent, task, or effect.
- **D52-AC023:** A **claim_instant** exactly equal to **not_before** passes only the
  inclusive lower bound.
- **D52-AC024:** A **claim_instant** strictly between **not_before** and **useful_until**
  passes only D52's temporal bounds; every other gate remains mandatory.
- **D52-AC025:** A **claim_instant** exactly equal to **useful_until** fails the
  exclusive upper bound.
- **D52-AC026:** A **claim_instant** after **useful_until** fails permanently for every
  still-unadmitted source/effect boundary.
- **D52-AC027:** Browser, application-process, worker, executor, task,
  notification, analytics, provider, and wall-clock headers cannot authorize.
- **D52-AC028:** Tenant/user zone, locale, DST, weekend, holiday, business day,
  leap day, month/year end, or tzdb edit changes no stored instant/comparison.
- **D52-AC029:** Database clock-health failed or indeterminate releases nothing;
  recovery retries only the same identity if a new claim remains inside.
- **D52-AC030:** No command reads time twice or chooses among clocks/reads to
  obtain a favorable side of either boundary.

### D49 lifecycle and source ceilings

- **D52-AC031:** D49 indeterminate inside the window releases no known subset,
  guessed recipient, presentation, task, or external intent.
- **D52-AC032:** D49 indeterminate retry preserves the exact occurrence identity,
  prior attempt evidence, pinned package, and source lineage.
- **D52-AC033:** Complete D49 proof inside may atomically seal members or proved
  zero exactly once.
- **D52-AC034:** D49 indeterminate at/after **useful_until** becomes typed permanent
  expired no-release and never becomes proved zero.
- **D52-AC035:** Expired no-release cannot retry after route/policy/assignment/
  authorization recovery, re-enable, restore, replay, or manual action.
- **D52-AC036:** Sealed proved zero remains terminal zero across expiry, route
  change, re-enable, and later eligible coordinators.
- **D52-AC037:** Sealed members remain immutable source history; expiry cannot
  replace, widen, or reseal the cohort.
- **D52-AC038:** D43 terminality ordered before an unadmitted claim denies it
  independently of the temporal window.
- **D52-AC039:** D51 Off/current epoch mismatch ordered before an unadmitted
  claim denies it independently and remains permanent.
- **D52-AC040:** Source/recipient/authorization narrowing can deny earlier but
  no fact can extend **useful_until**.

### Descendant and irreversible-boundary outcomes

- **D52-AC041:** Every sealed member's in-product release independently captures
  one claim instant and re-proves the useful interval/current ceilings.
- **D52-AC042:** Useful-until-first prevents queryable in-product release and
  creates no unread/engagement.
- **D52-AC043:** Queryable in-product release admitted inside remains governed
  by current D43 actionability/ADR-0027 when **useful_until** passes later.
- **D52-AC044:** After timely in-product release, D52 expiry changes no
  active/unread/read/archive/dismiss/delete state; current D43 actionability and
  ADR-0027 govern presentation.
- **D52-AC045:** A timely released item's continued presentation cannot
  authorize another release, occurrence, task, or external effect.
- **D52-AC046:** Governed email preparation captures a fresh claim inside the
  window and remains **Prepared definitely unsubmitted** until attempt admission.
- **D52-AC047:** Useful-until-first suppresses **Unprepared** and **Prepared
  definitely unsubmitted** email before provider I/O and preserves evidence.
- **D52-AC048:** Email attempt admission inside commits **Submission may have
  begun** before the first byte and never regresses.
- **D52-AC049:** An initial exact call whose attempt admission committed inside
  may start after expiry only as the immediate continuation of the same
  prepared/decrypted pre-I/O critical section within the registered adapter's
  fence-to-I/O bound, then finish/produce evidence without implying recall.
- **D52-AC050:** At/after **useful_until**, no new attempt admission, follow-up,
  retry, replacement, rekey, changed payload, resend, or additional provider
  I/O is authorized. A stalled/restarted/over-budget process cannot resume the
  admitted call; it preserves **Submission may have begun** and permitted
  outcome evidence and performs no retry/new I/O.

### Concurrency, idempotency, and failure recovery

- **D52-AC051:** Product-database uniqueness permits at most one D49 reminder
  occurrence per exact D43 episode across all wakes, policies, and windows.
- **D52-AC052:** Product-database uniqueness permits at most one exact
  descendant admission per occurrence/member/step/presentation identity.
- **D52-AC053:** Two workers at either boundary produce one serial product
  result; losers return authoritative state without a second effect.
- **D52-AC054:** Source-terminal/Off versus claim overlap uses stable
  serialization or complete-command retry and never timestamp guesswork.
- **D52-AC055:** A transition admitted with its post-lock **claim_instant**
  inside remains boundary-first even if commit/effect/evidence is observed after
  **useful_until**.
- **D52-AC056:** Serialization/deadlock failure retries the complete command,
  including source/auth/time selection, not only one SQL statement.
- **D52-AC057:** Missing, delayed, duplicate, and out-of-order wakes recover the
  same semantic identity from product records without catch-up.
- **D52-AC058:** Executor timeout/cancel/failure/success never terminalizes,
  extends, admits, or reopens product work.
- **D52-AC059:** Provider timeout/response loss preserves canonical dispatch and
  independent outcome; expiry never converts ambiguity to failure/cancellation.
- **D52-AC060:** Projection/outbox failure after authoritative write is
  idempotently replayable from receipts without altering source/boundary order.

### Database, RLS, and authorization

- **D52-AC061:** Every package, occurrence, terminal result, descendant, receipt,
  and audit row has non-null exact Tenant/source scope.
- **D52-AC062:** Every relationship uses a same-Tenant composite FK or
  equivalently enforced invariant and rejects cross-Tenant references.
- **D52-AC063:** Constraints prove both profile values positive/integral/
  bounded, **not_before/useful_until** finite, and **useful_until > not_before**.
- **D52-AC064:** Profile identity/revision/pair/calculation,
  **not_before/useful_until**/Tenant/source/attribution are immutable.
- **D52-AC065:** Caller-supplied trusted temporal/scope/actor/result fields are
  ignored/rejected and server derivation is independently tested.
- **D52-AC066:** Human policy reads/saves require current same-Tenant
  application authorization and the exact registered capability/purpose.
- **D52-AC067:** Automatic claims use separate code-owned purposes and cannot
  impersonate a human or turn expected heads into authority.
- **D52-AC068:** RLS applies restrictive **USING** and **WITH CHECK** to old/new
  row scope and prevents update into a forbidden Tenant/state.
- **D52-AC069:** Owner/service/worker/support/function/view/RPC/BYPASSRLS paths
  prove the same Tenant/purpose/temporal outcomes as ordinary paths.
- **D52-AC070:** Delete behavior preserves required package, occurrence,
  effect/provider, terminal, and audit proof; no cascade erases history.

### Ownership, privacy, and non-effects

- **D52-AC071:** Phase 12 alone owns profile/package/**useful_until**/expired
  no-release; executor/provider/task/item cannot create or extend them.
- **D52-AC072:** ADR-0027/Phase 17 owns presentation/engagement while consuming
  the source ceiling and never owning D43/task/access truth.
- **D52-AC073:** ADR-0026/Phase 6 owns governed email preparation/attempt/outcome
  while consuming usefulness and never owning its source interval.
- **D52-AC074:** ADR-0183/D44 task remains actionable according to source work;
  useful expiry never completes, hides, reprioritizes, or dates it.
- **D52-AC075:** D52 changes no request, task, route, responsibility, decision,
  grant, EffectiveAccess, holder status, access, or public/donor/missionary state.
- **D52-AC076:** Expiry creates no task, notification, email, push, SMS, Slack,
  Teams, Google Chat, digest, escalation, or cancellation/expiry message.
- **D52-AC077:** Ordinary settings expose no current-work/expired/recipient
  count, list, name, reason, visible-hidden split, provider, or protected detail.
- **D52-AC078:** Audit/log/event/trace/export/DLQ uses opaque identities and safe
  codes only, never request body/reason, email, display name, or ministry context.
- **D52-AC079:** Retention/anonymization/deletion/export/backup/restore rules are
  documented and tested for temporal evidence and prepared artifacts separately.
- **D52-AC080:** Analytics cannot derive person performance, deadline compliance,
  urgency, “on-time,” request quality, or reminder necessity from D52.

### UX, accessibility, and field conditions

- **D52-AC081:** D52 itself renders no control, value, status, placeholder,
  countdown, badge, task field, notification, or audit field.
- **D52-AC082:** Later ordinary cadence settings contain no separate usefulness
  field, slider, advanced panel, Tenant preset, calendar, or per-channel value.
- **D52-AC083:** The compact Base Maia form remains route-addressable,
  mobile-safe, explicit-save, and consistent with the existing cadence journey.
- **D52-AC084:** Each visible cadence card represents one complete profile and
  says **If Asym cannot create the reminder soon enough, it skips it instead of
  sending it late.**
- **D52-AC085:** Default settings view does not expose **not_before**, **useful_until**,
  duration, retry count, worker/provider state, or expired count.
- **D52-AC086:** Recipient/requester/holder surfaces show no expiry/cancel
  message; authorized source lane/task remains discoverable and usable.
- **D52-AC087:** Authorized D42 provenance may show localized **not_before**/
  **useful_until**/typed result only when purpose/current visibility permit.
- **D52-AC088:** No surface uses Due/Overdue/late/urgent/SLA/escalation/
  countdown/send-by/performance language or urgency styling.
- **D52-AC089:** Keyboard, screen-reader, visible focus, labels/descriptions,
  errors/status, non-color meaning, forced colors, and target size meet WCAG 2.2.
- **D52-AC090:** 320-pixel/400-percent reflow, RTL/CJK expansion, localization,
  mobile touch, reduced motion, offline/low-bandwidth, and persistent-path tests pass.

### Scale, operations, and observability

- **D52-AC091:** **not_before/useful_until** claims use indexed exact-Tenant bounded
  cursors and small CAS transactions, never a full pending scan.
- **D52-AC092:** Correct expiry/source-read filtering requires no synchronous
  row-by-row fanout or projection completion.
- **D52-AC093:** Reconciliation is bounded, cursor-resumable, idempotent,
  per-Tenant fair, observable, and unable to redefine source truth.
- **D52-AC094:** Outage recovery does not enqueue an unbounded catch-up wave;
  every package is independently claimed against immutable **useful_until**.
- **D52-AC095:** Largest-Tenant/noisy-neighbor fixtures publish cardinalities,
  query plans, p50/p95/p99, lock waits, throughput, retries, and memory.
- **D52-AC096:** Missing approved claim/read/reconciliation budgets blocks
  activation; a timeout never triggers partial/favorable fallback.
- **D52-AC097:** Authorized operations can distinguish not-yet, useful,
  indeterminate, zero, expired no-release, earlier source fence, and admitted history.
- **D52-AC098:** Supported repair replays exact projections/claims from receipts
  but exposes no extend/reopen/force-send/backdate/recompute operation.
- **D52-AC099:** Package/evidence disagreement quarantines unadmitted effects,
  preserves originals, alerts an owner, and never self-corrects from current policy.
- **D52-AC100:** Every monitor below is wired with bounded safe dimensions,
  tested alert delivery, owner, runbook, and response before cohort activation.

### Migration, rollout, and upgrade

- **D52-AC101:** Later schema changes are additive and old code can safely read/
  ignore them before any D52-bearing writer is enabled.
- **D52-AC102:** Existing/historical requests receive no backfilled/synthesized
  profile/**useful_until** and cannot age into reminder eligibility.
- **D52-AC103:** Missing/unknown D52 package follows typed safe non-admission and
  never falls back to request lifetime, current registry, or executor defaults.
- **D52-AC104:** Every D49/Phase 17/Phase 6 claim path is usefulness-aware and
  fail-closed before package writer/reminder activation.
- **D52-AC105:** Mixed old/new code and old/new schema tests prove no path admits
  at/after **useful_until**.
- **D52-AC106:** Activation uses one complete compatible bounded Tenant cohort,
  never partial worker/channel coverage within an enabled Tenant.
- **D52-AC107:** The kill path disables new usefulness/source/effect admissions
  without changing requests/tasks/access or deleting package/effect history.
- **D52-AC108:** After usefulness-bearing writes, rollback preserves all
  temporal/source history and rolls forward; it never drops/recomputes upper bounds.
- **D52-AC109:** Backup/restore across versions preserves exact package/results
  and terminalizes expired unreleased work without sending.
- **D52-AC110:** Dependency/provider/executor upgrade tests prove Core semantics
  unchanged despite timeout, TTL, precision, retry, or webhook changes.

### Testability, traceability, research, and release

- **D52-AC111:** Boundary tests cover before/equal/one representable unit after
  **not_before** and before/equal/one representable unit after **useful_until**.
- **D52-AC112:** Property tests cover supported duration/precision extremes,
  overflow/nonfinite/rounding, DST/zones/locales, leap/month/year, and restore.
- **D52-AC113:** Deterministic race tests cover D43 terminal, D51 Off, D49
  indeterminate/zero/member seal, local release, email prepare/attempt, and expiry.
- **D52-AC114:** Crash tests cover every point before/after package commit,
  claim, seal, local release, email preparation, attempt fence, first byte,
  registered fence-to-I/O bound, process restart, response, evidence reduction,
  and reconciliation.
- **D52-AC115:** Real-database tests cover constraints, uniqueness, immutable
  columns, same-Tenant FKs, deletion, RLS **USING/WITH CHECK**, and privileged paths.
- **D52-AC116:** UX tests prove exact quiet copy, no timing control/urgency,
  persistent work path, mobile/AT/localization comprehension, and no protected leak.
- **D52-AC117:** Representative authorized ministry staff achieve at least 90%
  correct comprehension of skip-instead-of-late and no-due/access/task effect.
- **D52-AC118:** Traceability maps every D52-R/AC through glossary, ADR,
  OpenSpec, design, tickets, implementation, tests, migration, and release evidence.
- **D52-AC119:** D53/value research is preregistered and representative,
  distinguishes outage tolerance from reminder desire, and records limitations;
  missing/failed evidence keeps cadence Reserved/Off.
- **D52-AC120:** Release requires every R/AC green, all monitors/runbooks active,
  approved quantitative budgets, zero known safety/Tenant defects, complete
  rollback/repair proof, and all remaining D47/D53/channel gates closed.

## Implementation proof matrices

These matrices constrain a later design without prescribing table names.

### Authorization and RLS matrix

| Path                    | Required trusted context                                                         | Permitted outcome                                                            | Forbidden outcome                                    | Proof                            |
| ----------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| Policy admin            | Active same-Tenant assignment, **permissions.manage_grants**, registered purpose | Read/save separately authorized cadence policy                               | Set/extend usefulness; inspect current affected work | API + real-DB role matrix        |
| D48/D50/D52 package     | Code-owned purpose, exact D43 source and winning policy boundary                 | Atomically retain complete package/safe non-admission                        | Caller/current-registry/backfill package             | Creation/replay/property tests   |
| D49 claim               | Code-owned purpose, exact occurrence, current source/epoch/auth, one DB instant  | Seal members/zero or preserve indeterminate/expire                           | Partial/widened/late cohort                          | Transaction barrier tests        |
| Phase 17 release/read   | Exact source/member/role/surface and current useful ceiling at first release     | Release inside; afterward follow D43/ADR-0027                                | Post-expiry first release or D52 engagement mutation | Public seam + presentation tests |
| Phase 6 email           | Exact frozen intent/member/artifact and current useful ceiling                   | Prepare/admit inside; admitted initial call may start/finish/reconcile later | New attempt/additional provider I/O after expiry     | Crash/provider harness           |
| Support/repair          | Purpose-limited audited same-Tenant support capability                           | Body-free inspect/replay/quarantine                                          | Extend/reopen/force-send/recompute                   | Support RLS/abuse tests          |
| Owner/service/BYPASSRLS | Registered server purpose and Tenant                                             | Invoke same product commands only                                            | Direct favorable write                               | Privileged parity suite          |

### Data and temporal-integrity matrix

| Invariant                | Constraint/command boundary                                                                        | Failure posture                             |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Complete package         | One atomic D43 disposition with profile identity/revision/pair/**not_before/useful_until**/version | Typed safe non-admission                    |
| Finite positive interval | Both seconds > 0; finite **not_before/useful_until**; upper > lower; supported precision           | Reject/quarantine, no effect                |
| Immutable history        | No update to package/source/effect identity; restrictive delete                                    | Preserve original evidence                  |
| Half-open check          | Post-lock DB **claim_instant** and **not_before <= claim_instant < useful_until**                  | Not-yet or expired no-release               |
| Exact cardinality        | Product unique occurrence/effect keys                                                              | Return existing receipt                     |
| Earlier source ceilings  | D43/D51/auth/source CAS in every admission                                                         | Deny without extending time                 |
| Canonical email axes     | Dispatch and provider outcome independent monotonic reducers                                       | Quarantine contradiction; no I/O            |
| Presentation separation  | D52 gates first release; D43/ADR-0027 govern released item                                         | No D52 engagement/presentation-end mutation |

### Privacy and sink matrix

| Sink                      | Permitted minimum                                      | Forbidden                                         | Owner                    |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------- | ------------------------ |
| Cadence form/disclosure   | Quiet generic behavior copy                            | Duration/instant/count/name/provider/current work | Access Product + Privacy |
| Authorized D42 audit      | Localized temporal/source result under current purpose | Protected body or broader visibility              | IAM Audit                |
| Notification presentation | Role-safe ADR-0027 projection/history                  | Request body/shared engagement                    | Phase 17                 |
| Email artifact/evidence   | Phase 6 contract minimum and retention class           | Cross-channel reuse/indefinite body               | Communications           |
| Logs/traces/metrics       | Opaque IDs, safe gates, aggregate latency/counts       | Person/body/reason/ministry context               | SRE + Security           |
| Export/backup/support     | Purpose-authorized minimum immutable evidence          | Broad disclosure or revived presentation          | Privacy + Support        |

### Scale, migration, rollout, and test matrix

| Concern                          | Required proof                                                                              | Activation/response                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Claim performance                | Indexed exact-Tenant cursor/CAS; published p50/p95/p99/locks at largest fixture             | Missing/breached budget blocks or pauses                                                               |
| Terminal-disposition convergence | Every new claim/release is source-filtered; bounded no-release projection p95 and worst age | Replay terminal projections; source interval remains truth and released-item presentation is untouched |
| Outage recovery                  | No herd/catch-up; per-Tenant fairness and expired filtering                                 | Throttle fairly; never widen                                                                           |
| Mixed versions                   | Old/new code/schema deny-first at every claim/admission                                     | No writer/cohort until complete                                                                        |
| Historical data                  | No backfill; missing package safe non-admission                                             | Preserve D48 boundary                                                                                  |
| Rollback/restore                 | Kill admissions, retain packages/results, roll forward after writes                         | Never drop/recompute                                                                                   |
| Boundary/failure                 | Exact representable-unit edges, deterministic races, every crash point                      | Zero safety failures                                                                                   |
| Auth/privacy/a11y                | Real DB RLS/privileged matrix; sink audit; mobile/AT/locales                                | Zero cross-Tenant/leaks; comprehension >=90%                                                           |

## Named release and production monitors

Safety thresholds are zero tolerance. Operational alerts never extend the
window, send catch-up, or weaken authorization.

| Signal                                                                                         | Threshold                                                                                                                                                       | Owner                                        | Required response                                                                                                                          |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **D52-CROSS-TENANT** — package/claim/read/effect scope mismatch                                | Any event                                                                                                                                                       | IAM Security + Database SRE                  | Disable affected admissions, security incident, preserve evidence, repair auth/RLS                                                         |
| **D52-PACKAGE-INCOMPLETE** — partial/missing/contradictory admitted package                    | Any event                                                                                                                                                       | Phase 12 + Data Integrity                    | Quarantine unadmitted work, stop writer, restore from source receipt; no synthesis                                                         |
| **D52-BOUNDARY-BREACH** — seal/release/prepare/attempt at **claim_instant >= useful_until**    | Any event                                                                                                                                                       | Phase 12 + Phase 17/6 + Security             | Kill affected admissions, incident, suppress unadmitted descendants, inspect exposure                                                      |
| **D52-EARLY-BREACH** — occurrence/effect at **claim_instant < not_before**                     | Any event                                                                                                                                                       | Phase 12 + Security                          | Same as boundary breach; correct time/precision/claim logic                                                                                |
| **D52-INDETERMINATE-RETRY-AFTER-EXPIRY**                                                       | Any event                                                                                                                                                       | Phase 12 IAM                                 | Stop resolver, preserve terminal result, remove descendant, fix transition                                                                 |
| **D52-PROVED-ZERO-RESURRECTION**                                                               | Any event                                                                                                                                                       | Phase 12 + Data Integrity                    | Stop claims, restore terminal zero, audit route-change writers                                                                             |
| **D52-DUPLICATE-OCCURRENCE-EFFECT**                                                            | Any uniqueness violation                                                                                                                                        | Phase 12 + Data Platform                     | Stop affected processing, preserve admitted history, fix semantic identity                                                                 |
| **D52-FAKE-ENGAGEMENT** — expiry writes read/archive/dismiss/delete                            | Any event                                                                                                                                                       | Phase 17                                     | Disable reconciler, restore engagement history, correct ADR-0027 mapping                                                                   |
| **D52-POST-EXPIRY-NEW-PROVIDER-AUTHORIZATION**                                                 | Any new attempt admission, follow-up, retry, replacement, rekey, resend, or additional I/O authorized at/after expiry; exclude the initial call admitted inside | Communications + Security                    | Disable adapter, preserve provider evidence, incident; never claim recall                                                                  |
| **D52-FENCE-TO-I/O-BUDGET** — admitted initial call misses same-critical-section adapter bound | Any first byte after the registered adapter bound, or any stalled/restarted process attempts to resume it                                                       | Communications Platform + SRE                | Abort/no retry, preserve **Submission may have begun** and permitted outcome evidence, disable adapter if systemic                         |
| **D52-DISPATCH-OUTCOME-REGRESSION**                                                            | Any canonical-axis regression/collapse                                                                                                                          | Communications                               | Quarantine attempt, block calls, rebuild reducer from immutable evidence                                                                   |
| **D52-PROVIDER-TTL-AUTHORITY** — adapter/provider TTL extends or replaces source ceiling       | Any event                                                                                                                                                       | Communications Architecture                  | Disable adapter, restore source check, add contract test                                                                                   |
| **D52-SECONDARY-ARTIFACT** — expiry creates task/message/access/request mutation               | Any event                                                                                                                                                       | Access Product + owning platform             | Disable consumer, safely correct projection, preserve source/audit                                                                         |
| **D52-CATCH-UP** — expired/old/missing package admitted after recovery/re-enable               | Any event                                                                                                                                                       | Workflow Platform + Phase 12                 | Stop worker/cohort, quarantine effect, fix claim/reconciliation                                                                            |
| **D52-PRIVILEGED-PARITY**                                                                      | Any ordinary versus privileged outcome mismatch                                                                                                                 | IAM Security + Database                      | Block path/deploy, repair grants/RLS/auth, rerun full matrix                                                                               |
| **D52-RECONCILIATION-LAG**                                                                     | p95 >60 seconds for 15 minutes or any >300 seconds                                                                                                              | Workflow Platform + Phase 17/6               | Replay receipts, inspect outbox/index/worker; claim/release admission filtering remains active and released-item presentation is untouched |
| **D52-CLAIM-SLO**                                                                              | Missing approved budget, or two consecutive registered windows over it                                                                                          | Phase 12 + Database SRE                      | Block/pause cohort, inspect query/locks; no timeout fallback                                                                               |
| **D52-SENSITIVE-SINK-DATA**                                                                    | Any protected identity/body/reason/context                                                                                                                      | Privacy + Security                           | Stop sink, contain/assess/purge where authorized, minimize and retest                                                                      |
| **D52-FALSE-DEADLINE-UX**                                                                      | Any Due/Overdue/late/urgent/SLA/countdown/send-by/performance claim                                                                                             | UX + Accessibility + Access Product          | Block surface, remove semantics/style, rerun comprehension/a11y                                                                            |
| **D52-COMPREHENSION**                                                                          | <90% correctly predict skip-instead-of-late and no-due/no-access-task effect                                                                                    | UX Research + Accessibility + Access Product | Keep inactive/pause expansion, simplify helper, repeat representative study                                                                |
| **D52-MIXED-VERSION-UNSAFE**                                                                   | Any enabled path lacks D52 proof                                                                                                                                | Release Engineering + SRE                    | Stop rollout/disable writer, complete compatible deployment                                                                                |
| **D52-MONITOR-COVERAGE-GAP**                                                                   | Any enabled cohort lacks alert/owner/runbook                                                                                                                    | Release Engineering + Product Operations     | Block/remove cohort until wired and tested                                                                                                 |

## Ruthless synthesis and ordered path

### Final disposition

**Accept with required amendments.**

The finite product-owned window is superior to request lifetime and
exact-instant execution. It is accepted only as an immutable Phase 12
half-open source interval with terminal no-release semantics, not an executor
retry setting, provider TTL, human deadline, or Tenant control.

### Must be resolved before D52 is recorded

1. Define one complete retained timing-profile pair and finite absolute
   **not_before/useful_until**; never infer either value from the other/current registry.
2. Define **[not_before, useful_until)** with one fresh primary-database
   **claim_instant** captured after locks immediately before transition.
3. End D49 indeterminate as permanent expired no-release at the exclusive
   upper boundary; preserve proved zero and admitted history distinctly.
4. Apply the upper fence to every still-unadmitted D49/local/email boundary.
5. Preserve boundary-first local/provider history: the initial call admitted
   inside may start/finish/reconcile later, while expiry forbids every new
   attempt/additional provider authorization and all fabricated local engagement.
6. State that earlier D43/D51/source/auth ceilings still win.
7. Forbid free-form/Tenant usefulness UX, catch-up, urgency, task/access
   mutation, and secondary expiry artifacts.

### Requirements for later specification/design

The later design must specify the immutable package/calculation version,
precision/overflow rules, stable claim/CAS command, typed terminal reasons,
same-Tenant constraints, RLS and privileged paths, ADR-0027 separation,
ADR-0026/Phase 6 integration, bounded reconciliation, retention/repair,
quantitative budgets, migration compatibility, UX/a11y/privacy evidence, and
full D52-R/AC traceability.

### Mandatory safeguards and rollout order

1. Ratify D52 in the decision log/glossary/ADR-0184/Phase 12/17/6 docs only.
2. Decide D53's exact complete timing-profile pair(s) through the D47
   representative-evidence gate.
3. Keep D47 Reserved until reminder need/cadence/content/channel/harm gates pass.
4. Design/threat-model the database and product claim; add OpenSpec/tickets.
5. Add substrate compatibly; deploy every deny-first reader/claim before writer.
6. Prove boundaries, races, crashes, restore, real-DB RLS, privacy, accessibility,
   comprehension, and production-shaped scale without sending.
7. Activate one complete compatible Tenant cohort with kill/repair/monitors;
   expand only against certified evidence.

Only performance, projection lag, provider-evidence delay, and comprehension
are monitorable after safety enforcement. Cross-Tenant access, early/late
admission, catch-up, duplicate effects, source-state regression, post-expiry
new/additional provider authorization, fake engagement, secondary artifacts,
or sensitive leakage are zero-tolerance incidents.

## Exact corrected D52 decision to record

> **Option 1 — finite product-owned bounded usefulness.** If the D47 reminder
> later activates, every D48-admitted request atomically retains a separate
> versioned code-owned complete positive whole-second
> **(wait_for_seconds, useful_for_seconds)** timing profile and finite immutable
> UTC **not_before/useful_until**. Existing packages never recompute; no Tenant
> or downstream system controls either value.
>
> The valid source interval is **[not_before, useful_until)**. After relevant
> locks and immediately before transition, each command captures one fresh
> trusted primary-database **claim_instant**. Every D49 seal and
> irreversible descendant admission re-proves the interval plus D43/D48/D51,
> recipient/source, authorization, clock health, and product uniqueness.
> D49 indeterminate retries only the same occurrence inside; at **useful_until** it
> becomes permanent expired no-release. Zero/member history never reopens.
>
> Earlier D43 terminality, D51 Off/epoch mismatch, source/recipient loss, or
> authorization loss narrows sooner. Boundary-first effects remain truthful.
> Timely released local attention remains governed by current D43 source
> actionability and ADR-0027; D52 changes no engagement. Governed email
> unprepared/prepared work is suppressed;
> an attempt admitted inside allows its one initial call to start after expiry
> only as the immediate same prepared/decrypted critical section within the
> registered adapter's fence-to-I/O bound, then finish/reconcile. No new attempt admission, follow-up, retry,
> replacement, rekey, resend, or additional provider I/O is then authorized.
> Provider TTL may only narrow post-admission delivery and never owns/extends
> source usefulness. Future channels prove their own boundaries.
>
> Expiry causes no catch-up, task/message, request/access change, deadline,
> urgency, SLA, performance fact, or Tenant usefulness setting. Future ordinary
> Base Maia UX stays quiet, preserves the source lane/task, and makes each
> visible cadence card one complete profile with **If Asym cannot create the
> reminder soon enough, it skips it instead of sending it late.**

## D53 — Which exact complete timing profiles may the future policy offer?

### Context and example

D52 makes a profile one indivisible pair: when the one courtesy reminder first
becomes eligible and how much longer it may still be created. It intentionally
chooses no number. If Hope Mission selects **After 7 days**, a hidden or
indefinite retry window would make that label misleading; two independent
duration controls would be noisy and permit unresearched combinations.

Cross-product defaults vary from immediate transport discard to multiweek
review lifetimes and do not establish nonprofit/missions need. D47 already
requires representative evidence. D53 therefore decides whether exact complete
pairs enter only through that gate, are guessed now from convention, or become
Tenant-configurable.

### Options

1. **Evidence admits each complete pair; remain Off until one passes
   (Recommended).** The registry initially contains only Off and no placeholder
   UI ships. Preregistered research evaluates each exact positive whole-second
   `(wait_for_seconds, useful_for_seconds)` pair. The first UI release may show
   one proven non-Off card plus Off; later evidence may add at most a small set
   prospectively.
2. **Standardize one conventional pair now.** Choose a plausible fixed pair,
   such as seven elapsed days to eligibility plus seven elapsed days of
   usefulness, and validate it in rollout. No current representative Core
   evidence supports those illustrative numbers, so production becomes the
   experiment.
3. **Let each Tenant choose both durations.** Expose separate bounded selectors
   or custom numbers. This adds a two-dimensional schedule, invalid
   combinations, support/migration burden, and false-deadline risk contrary to
   D47's small code-owned set.

**Recommendation:** Option 1. It is the only choice consistent with D47's
evidence gate, D52's complete immutable pair, and the quiet one-selection UX.
Until evidence proves an exact pair, Core remains reminder-free and exposes no
Off-only placeholder control.

**Question:** Which D53 registry rule should Core record: **Option 1 — remain
Off until each complete pair independently passes the D47 evidence gate**,
**Option 2 — choose one conventional pair now and validate in rollout**, or
**Option 3 — Tenant-configurable wait and usefulness durations**? You may amend
any option.

# Phase 20 D12 Accounting Release Cadence Research Evidence

**Research date:** 2026-07-26
**Decision:** D12 — C-prime-amended-and-hardened (C-prime-R)

## Conclusion

Tenant-controlled Accounting Release cadence is appropriate only when cadence
controls **when eligible work reaches the release fence**, not what is
eligible, how it is accounted for, or whether QBO/Xero accepted it. The
production-safe model is one provider-neutral readiness and release path with
three bounded tenant choices:

1. release eligible routine work automatically;
2. prepare eligible work on a schedule for staff review; or
3. wait for staff to release it.

All three modes use the same readiness evaluator, atomic release fence,
immutable Accounting Release, evidence artifact, delivery-lane rules, and
operation-granular provider recovery. The tenant may require more review but
cannot configure away source, accounting, security, period, or provider
requirements.

## Current primary-source findings

### QuickBooks Online

- QBO strongly recommends a unique `requestid` for every write, update, or
  delete and describes it as the idempotence mechanism for a dropped response.
  `DocNumber` is not a system idempotency key. A retry after uncertain outcome
  must preserve the request identifier and, where needed, query/read the
  provider record before another create.
- Production limits include 500 requests per minute per realm and 10 requests
  per second per realm and app. Intuit recommends bounded batch payloads,
  throttles batch calls separately, returns item-level batch outcomes, and
  times out work that exceeds its documented request duration.
- Published QBO pages have differed on recommended batch size. Capability
  certificates must therefore pin a conservative tested limit instead of
  making changing documentation part of business semantics.
- QBO batching is a transport optimization, not an atomic Accounting Release
  or proof that every provider operation succeeded.

Sources:

- [QBO request IDs and field definitions](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
- [QBO limits and throttles](https://developer.intuit.com/app/developer/qbo/docs/learn/limits-and-throttles)
- [QBO batch operations](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/batch)

### Xero

- Xero applies organization-scoped concurrency, minute, and daily request
  limits plus an app-wide minute limit. Current guidance requires honoring
  `Retry-After`, monitoring remaining-limit headers, and using scheduled or
  queued background work so users do not expect an immediate response.
- Xero's `Idempotency-Key` protects mutating requests only within the
  documented response-cache interval. The current interval is six minutes.
  After an ambiguous result or expired interval, Asym must inspect the exact
  provider resource before using another key.
- Xero permits multiple nodes in supported requests, but validation and
  resource semantics remain provider-specific. A multi-node request is not a
  cross-resource transaction or an Asym release boundary.
- Some Xero request modes can return HTTP `200` while individual elements
  contain validation failures. Adapters must inspect every element outcome
  rather than treating the top-level HTTP status as complete success.

Sources:

- [Xero rate limits](https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits)
- [Xero idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Xero Accounting API response codes](https://developer.xero.com/documentation/api/accounting/responsecodes)

### Comparable finance operations

- Ramp separates the decision that accounting work is **Ready** from the
  mechanism that transfers that ready queue to an ERP. Its current auto-sync
  guidance says auto-sync moves already-ready work and does not determine what
  is safe.
- Ramp groups work by actionable states such as needs review and ready to sync,
  and distinguishes a preview/download from a committed accounting action.
- That separation is useful for Asym. Ramp's broad AI and custom accounting
  rule surface is not: Phase 20 already has product-owned Posting Intents,
  policies, mappings, and Carrier Plans, so D12 does not add another rules
  engine.

Sources:

- [Ramp Accounting Agent and auto-sync](https://support.ramp.com/ramp-accounting-agent-enablement-daily-use-admin-guide/)
- [Ramp accounting queue and committed actions](https://support.ramp.com/marking-transactions-as-synced/)
- [Ramp accounting overview](https://support.ramp.com/overview-of-ramp-accounting/)

### Accessibility and quiet status

- WCAG 2.2 status messages require important asynchronous result, progress,
  waiting, and error updates to be programmatically available without moving
  focus.
- Status indicators should not highlight healthy background states when no
  action or meaningful information is present. D12 therefore announces
  consequential completion or error changes but keeps routine queue progress
  visually and audibly quiet.

Sources:

- [W3C Understanding status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Carbon status-indicator pattern](https://carbondesignsystem.com/patterns/status-indicator-pattern/)

## Hardened domain contract

### Accounting Release Cadence Policy Version

The immutable, prospective policy is scoped to one Tenant, Legal Entity,
Accounting Destination, delivery lane, and product-owned Posting Intent
family. It freezes:

- one of the three supported modes;
- a bounded schedule preset and IANA timezone when applicable;
- an effective-from timestamp;
- the authorized finance actor who changed it;
- whether healthy-run digest notification is enabled;
- the exact product contract and schema version; and
- an impact preview digest for queued future work.

The ordinary schedule choices are product-owned, such as when ready, weekday,
weekly, or monthly. A repeated local time executes once. A nonexistent
daylight-saving local time runs at the first valid instant after the gap.
Monthly configuration uses unambiguous choices such as days 1–28 or the last
calendar day. The UI always shows the next exact local occurrence and timezone.
No arbitrary cron, holiday calendar, executable expression, or custom
recurrence language is required.

Each occurrence has a deterministic logical identity. After downtime, Asym
coalesces missed occurrences into one current readiness evaluation rather than
replaying each missed slot and flooding a provider. The evidence identifies
which occurrences were coalesced. Work arriving after the current occurrence's
selection cutoff waits for the next occurrence.

New direct connections start review-first. An authorized tenant finance admin
may explicitly enable automatic release only after the applicable destination,
Posting Profile, mapping, Carrier Plan, and provider adapter are certified.
Small tenants may assign policy-management and release permissions to the same
person; D12 does not require two-person approval.

Disconnecting or replacing an accounting destination prospectively retires
that destination's cadence policy and prevents new release fences. Already
frozen releases retain their destination and recovery state. Reconnecting to a
different provider organization requires fresh identity and capability proof
plus explicit policy activation.

### Release Candidate and atomic fence

A Release Candidate is a derived, disposable view. It may be ready, waiting,
blocked, or stale, but it is not financial truth and never reaches a provider.
At the release fence, Asym revalidates:

- Tenant, Legal Entity, destination, environment, delivery lane, and currency;
- exact source identifiers, revisions, and source-set digest;
- D4 Posting Intent, policy, balanced effect, and source coverage;
- D5 Posting Profile and provider-native recipe;
- D6 mapping and Mapping Coverage Manifest;
- D7/D8 Carrier Plan, capability certificate, and reporting disclosure;
- applicable D9 settlement, D10 Bank Match, and D11 correction requirements
  without making every independent authority a universal blocker;
- posting-period treatment and provider-context freshness;
- current provider authorization and stable organization identity; and
- absence of an unresolved exception that the governing contract requires to
  block.

Every schedule occurrence has a deterministic logical key. Manual,
scheduled-review, automatic, retry, and catch-up triggers all enter the same
service. Compare-and-swap or equivalent fencing prevents a source change,
policy change, Pause, and Release now action from creating duplicate or stale
releases.

Pause-versus-freeze ordering is normative: a Pause committed before the fence
prevents the release; a Pause committed after the fence cannot cancel it.
Scheduler and Release now races converge on the same deterministic release
identity. Resume creates a fresh evaluation.

A bulk action does not turn several releases into one provider transaction.
Each release unit crosses its own atomic fence. Revalidation may remove
changed or blocked items from an exact staff-reviewed set, but it may never
silently add newly eligible work after review. Newly eligible work waits for
the next review. The result states exact released, excluded, changed, and
blocked counts and amounts.

D9 Processor Payout Transfer, D10 Bank Match, and Accounting Release remain
independent authorities. An intent contract may require particular settlement
evidence, but cadence cannot make Bank Match a universal prerequisite or
retroactively mutate a release when a later Bank Match changes.

### Durable cadence evidence

Release Candidates remain disposable, but each cadence execution retains one
PII-minimized evidence record containing:

- logical occurrence and intended local time;
- policy version, trigger kind, and actor;
- source/version digests evaluated;
- exact reviewed selection digest when staff reviewed work;
- selected, excluded, stale, and blocked counts with reason codes;
- Pause and resume transitions;
- releases created; and
- provider-operation correlation identifiers.

Retention follows the Accounting Evidence Artifact policy rather than the
workspace's display window.

### Delivery and control semantics

- **Release now** advances only currently eligible work. It never bypasses a
  mandatory review, accounting rule, provider limit, fairness control, or
  unknown-outcome quarantine.
- **Pause upcoming releases** is scoped to one Legal Entity, destination,
  lane, and intent family. It stops new release fences but does not cancel
  frozen releases or submitted provider operations. Its confirmation states
  exactly what stops and what continues.
- **Resume** recomputes current readiness. It does not replay a stale candidate
  snapshot.
- Automatic direct delivery creates the immutable release and queues its
  provider operations. It does not present the release as accepted, read back,
  drift-free, or reconciled.
- Automatic staff-mediated delivery may prepare the immutable artifact and put
  it in the staff queue. Download, preview, or artifact creation never proves
  that staff imported it.
- OAuth loss, provider outage, throttling, or a destination circuit breaker
  stops only that direct-delivery queue. It never silently switches a frozen
  release to the staff-mediated lane.
- Provider execution remains per-destination, operation-granular,
  tenant-fair, adaptive to rate-limit headers, and recoverable from
  `Outcome unknown`.

Distinct server-side permissions govern viewing readiness, releasing eligible
work, pausing or resuming a destination lane, configuring cadence or enabling
automation, and inspecting or downloading accounting evidence. One user may
hold every permission. Every action reauthorizes Tenant, Legal Entity, and
destination; hiding a button is not authorization.

## UX contract

The one **Ready for Accounting** workspace uses a **Release Horizon** as its
signature element. It answers four questions without opening another page:

1. What needs staff now?
2. What will happen automatically?
3. When will it happen?
4. What is blocked, and what is the next safe action?

The default order is:

1. needs attention;
2. ready for review;
3. scheduled or automatic; and
4. recently released, collapsed by default.

The interface uses a dense semantic list or table rather than a metric-card
grid or Kanban board. Each row gives source purpose, Legal Entity, amount and
currency, accounting date or period, destination, readiness explanation, and
next action. A details drawer progressively discloses source coverage,
balanced effect, policy, mapping, Carrier Plan, artifact, and provider
evidence.

The primary action names the exact scope, for example:

> Release 12 items ($84,221.03) to Hope Missions — QuickBooks Online

Selection never silently includes hidden pages or another Legal Entity. A
stale selection is revalidated and its changed rows are identified.

Configuration asks:

> How should routine Stripe settlements move to QuickBooks?

It presents the three modes, the next exact occurrence, affected future work,
mandatory exceptions, and the statement that changes affect future releases
only. No healthy-run toast storm or mandatory approval chain is introduced.
Scheduled-review readiness, automatic-release failure, paused work,
destination disconnection, and unknown provider outcomes may create
contract-owned notifications through the existing communication system.

Status is text-first and never color-only. Async results use a restrained
status announcement, errors use an accessible summary linked to rows, drawers
restore focus, bulk controls work by keyboard, responsive rows reflow at 200%
zoom, and reduced-motion preferences are honored.

## Adversarial findings and permanent controls

| Category                    | Concern                                                                                                       | Permanent control                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                 | Schedules, candidates, provider access, and timezones change.                                                 | Logical occurrence keys, IANA timezone semantics, fence-time revalidation, and provider-independent queues.                               |
| Technical debt              | Separate automatic, scheduled, and manual pipelines would drift.                                              | One readiness evaluator and release service; trigger kind is evidence only.                                                               |
| Edge cases                  | DST, missed schedules, empty work, mixed eligibility, stale selection, and destination change are inevitable. | Bounded recurrence semantics, coalesced idempotent catch-up, CAS, exact result disclosure, and destination pinning.                       |
| Footguns                    | Release now, Pause, and select-all can affect unexpected work.                                                | Scoped previews, no hidden or post-review expansion, prospective policy, and explicit continue-versus-stop text.                          |
| Tenant safety               | A queue or provider client can target the wrong realm, organization, or entity.                               | Composite identity constraints, server-resolved destination identity, RLS, per-destination workers, and negative tests.                   |
| Over-engineering            | A rules DSL, cron builder, risk engine, or approval graph duplicates established authorities.                 | Three modes, product-owned intent families, bounded presets, and no executable tenant logic.                                              |
| UX friction                 | Status soup and repeated confirmation conceal the work that needs judgment.                                   | One Release Horizon, action-first ordering, progressive evidence, and one consequential confirmation.                                     |
| Hidden coupling             | Provider batch behavior, scheduler state, and UI labels can become one false status.                          | Provider-neutral release contract and separately derived readiness, release, delivery, readback, drift, and reconciliation truth.         |
| Failure modes               | Duplicate fire, worker crash, timeout-after-commit, partial acceptance, 429, 503, and OAuth loss occur.       | Durable idempotency, destination circuit breaking, backoff, unknown-outcome quarantine, readback, and operation-granular resume.          |
| Data integrity              | Stale sources or repeated actions can duplicate or omit accounting effect.                                    | Frozen source manifests, reviewed-set digests, uniqueness constraints, CAS, balanced effect, complete coverage, and append-only evidence. |
| Security and privacy        | Unauthorized automation or PII-rich queue data can create material harm.                                      | Server-side capabilities, least-privilege OAuth, secret isolation, PII-minimized evidence, and immutable audit records.                   |
| Scalability and performance | Seasonal work and large tenants can exhaust provider or shared capacity.                                      | Tenant-fair per-destination budgets, adaptive concurrency, bounded batching, cursor pagination, and queue-age objectives.                 |
| Operational burden          | Too many policies and notices create finance-admin work.                                                      | One destination default, bounded intent-family overrides, named owner, and exception-only notifications.                                  |
| Observability               | Ready or queued work can silently stall.                                                                      | Oldest-ready age, queue age, last occurrence, retry-after, quota/circuit state, stuck-work, and unknown-outcome instrumentation.          |
| Dependency and integration  | Provider limits, resources, certification, and idempotency behavior change.                                   | Versioned capability certificates, conservative limits, provider contract fixtures, kill switches, and artifact continuity.               |
| Migration and upgrade       | New schedule or adapter versions could reinterpret historical work.                                           | Immutable policy/schedule versions, prospective destination retirement, and re-evaluation of only unfrozen candidates.                    |
| Other hazards               | Pause, policy change, source correction, deployment, and scheduled execution can race.                        | One linearization point, fencing tokens, transactional outbox, backward-compatible workers, canaries, and failure-injection tests.        |

## Production release gates

D12 cannot ship without:

- all three modes for direct and staff-mediated delivery;
- prospective policy change, destination retirement/replacement, invalid
  policy, unauthorized actor, and stale impact-preview tests;
- timezone, spring-forward, fall-back, month-end, leap-day, missed-occurrence
  coalescing, duplicate occurrence, cutoff, and catch-up tests;
- simultaneous schedule, Release now, Pause, resume, policy change, source
  change, double-click, retry, and deploy-restart tests;
- reviewed-set non-expansion plus mixed clean, changed, blocked, empty,
  multi-currency, multi-entity, and multi-destination result tests;
- QBO stable-request-ID, item-level batch failure, `429`,
  timeout-after-write, unknown-outcome, readback, and drift fixtures;
- Xero concurrency, minute/day-limit, expired idempotency interval,
  `Retry-After`, partial-element failure inside HTTP `200`, validation,
  timeout-after-write, readback, and drift fixtures;
- direct-versus-staff-mediated lane, no-silent-failover, and
  artifact-not-delivered tests;
- wrong Tenant, Legal Entity, destination, realm, Xero organization,
  environment, lane, policy, mapping, and source-version negative tests;
- server-side view, release, pause/resume, configuration, and evidence
  permission-negative tests;
- tenant-fair seasonal load, destination-circuit, quota telemetry, queue-age,
  noisy-neighbor, and degraded-provider tests;
- durable cadence-evidence retention, PII-safe narration/logging,
  support-access, and audit-evidence tests;
- status-text, keyboard bulk selection, focus restoration, status
  announcement, error-summary, 200%-zoom, responsive, and reduced-motion tests;
  and
- production-shaped usability sessions with one-person finance teams,
  bookkeepers, many-fund mission organizations, and external accountants.

## Explicit non-goals

- No general ledger, period-close system, bank reconciliation, or financial
  statement workflow in Asym.
- No tenant-authored accounting or readiness rules.
- No arbitrary cron expression, workflow graph, or approval-chain builder.
- No priority purchase, provider-limit bypass, or cross-tenant fast lane.
- No automatic treatment of accountant-owned exceptions.
- No provider batch presented as atomic release or complete delivery.
- No artifact download presented as provider import.
- No automatic failover between direct and staff-mediated delivery lanes.
- No mutable `ready`, `synced`, `exported`, or `reconciled` boolean that
  collapses the independent authorities.

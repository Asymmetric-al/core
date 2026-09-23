# 4. Runtime, Inngest integration, and recovery

## Ownership and provider decision

Reuse Core's shared Inngest infrastructure and dispatch ledger. Do not create an Inngest app, environment, or deployed function per tenant or template [R3]. A small set of versioned coded handlers loads tenant data: evaluate event, advance engagement, execute permitted operation, wake due work, reconcile outstanding operation, and recover handoff. Domain owners continue their existing payment, communication, file, and identity functions.

Inngest remains the selected default because Core already integrates it and its durable-execution model fits the proposed product separation. Workflow Kit is reference material rather than the canonical runtime [R8, S01]. Temporal is not a required second runtime; reconsider the provider only through an evidence-based ADR if workload, residency, deployment compatibility, or recovery certification fails. No provider-neutral abstraction needs to emulate every feature of every orchestrator: keep a narrow dispatch/execute boundary and portable business state.

The September 12 source inspection recorded Inngest 4.5.1 and SDK v4 guidance [R6, S02]; this is dated evidence, not a present lockfile or provider qualification claim. Implement against the actual lockfile and installed documentation, with an explicit dependency update only when needed. Do not copy v3 examples into v4 by assumption or select moving `latest` tags in production configuration.

## State machines

Definition lifecycle: `draft → validated → published`; publication is immutable. Enrollment binding independently has `disabled | enabled | suspended`. Archived definitions cannot receive new enrollment but preserve run/read history and compatible implementations.

Engagement lifecycle: `active | on_hold | discontinued | complete`. Operational health is separate: `healthy | waiting | needs_assignment | blocked | needs_attention`. An infrastructure retry does not make the applicant declined, and a paused applicant is not a failed function. Complete records carry a declared outcome and completion evidence; later invalidation creates a linked remediation engagement rather than silently reopening historical completion.

Step occurrence: `planned → ready → active → waiting → completed`; terminal alternatives are `not_selected`, `canceled`, `superseded`, or `failed`. A business response is a typed outcome in the source record, not necessarily failure. Attempts, occurrences, and node IDs are distinct.

Operation intent: `prepared → queued → leased → dispatching → confirmed`. Alternatives include `blocked`, `suppressed`, `proven_not_applied`, `outcome_unknown`, `canceled_before_dispatch`, and `exhausted`. Retry is allowed only for an operation whose domain/provider contract proves it safe. A provider acknowledgment can confirm request acceptance, not every downstream business outcome.

## Event intake and subscription

Source modules commit facts and durable event/outbox intent atomically wherever they share a database. Verified provider webhooks are stored by existing provider boundaries before acceptance. Studio consumes named business events; raw provider payloads never become user-authored trigger facts.

Each subscription binding has a prospective activation generation. For imported or historical events, `historical=true` is explicit and outward effects stay dark unless a bounded backfill request was reviewed. The binding records a source-supported activation boundary and accepted event identity; it does not infer safe ordering from timestamps alone.

Maintain an idempotent receipt per event/binding and a durable per-subject wake. Concurrent source commits must not be lost by advancing `MAX(sequence)` when a lower-numbered transaction has not committed. Use a committed outbox consumer protocol with row acknowledgments or certified commit-aware cursors, and test the out-of-order commit case. Unknown events enter operational quarantine; they never map to an arbitrary action.

## One advance

1. Load the current run, publication, plan revision, cancellation epoch, Phase 12 NHI with live human-owner capability intersection, and needed source facts through authorized services.
2. Evaluate the pure transition plan. Reuse recorded decisions; do not re-evaluate frozen past branches from current profile values.
3. In a short transaction, lock/CAS the run revision, verify applicable source versions, create unique step/operation/wait records, append safe decision/audit evidence, and record dispatch requests. Retry serialization conflicts without external effects.
4. Commit before invoking external providers. If source versions changed during planning, discard the plan and evaluate again.
5. Dispatch bounded work through the shared outbox. Results are accepted by their owning service, recorded durably, and cause a new wake.

Never hold a database transaction open during an external API call. `concurrency: 1` in Inngest is not a run-wide database mutex: concurrency limits executing steps, not entire engagements [S03].

## Product claims and fencing

Each operation has a product claim/lease and monotonically increasing fence token. Before final action submission, recheck current run epoch, source preconditions, permission, suppression, binding validity, and fence. A stale worker cannot commit an authoritative result or start an unsubmitted action after reassignment/cancellation wins the comparison. External systems that cannot honor fencing require serialization plus ambiguity handling; do not claim Core can recall an already-started external action.

A lease expiry does not prove a previous external request did not execute. If the worker may have passed the dispatch boundary, move to `outcome_unknown` and reconcile rather than granting a blind new send. Recovery must distinguish prepared-but-not-sent from sent-but-unconfirmed.

## Permanent business idempotency

Build semantic identities from tenant, environment, owning domain, source occurrence, purpose, recipient/subject, channel where applicable, and intentional repetition number. Do not use a random retry key, full template version, layout digest, or invocation timestamp. A reissued receipt, a second interview, and reminder number two each require an explicit new business identity; retrying the same operation does not.

Cross-workflow identical effects converge through the owning domain's semantic namespace, not merely a run-local dedupe table. Conflicting requests with one semantic identity but incompatible payloads block for review; first-writer behavior cannot silently choose donor wording or amount. Core stores a reference to the source-owned outcome and identity rather than becoming a second communication or money authority.

Inngest and Resend document finite dedupe windows [S05, S06]. They supplement, not replace, these permanent product identities. Exact request payload and resolved publication must remain stable across a retry. When the provider outcome is uncertain beyond its safe retry window, reconcile or require review.

## Waiting without lost events

A durable wait row identifies exact source subject, predicate contract, desired version/currentness rules, cancellation epoch, activation time, due time, and reconciliation deadline. Upon wait registration, enqueue an immediate post-commit fact recheck. The source completion consumer also locates eligible wait rows. This handshake covers both orderings: completion before registration is found by the recheck; completion after registration is found by the event consumer. A periodic indexed reconciliation catches either lost wake.

For very short waits, Inngest `waitForEvent` can be an optimization, never the sole evidence. Its current guide warns about events before listener registration and non-canceled losing waits [S07]. Correlate by exact tenant, subject, requirement, and source version—not email address. Validate actual source facts before continuing even after a matching wake.

Clock deadlines never imply human approval. At expiry, execute an allowed reminder/escalation/hold operation. Explicit source policy decides whether a late submission is accepted. Record accepted source-time and decision-time separately. If the deadline and response race, serialize source acceptance and recheck it before reminder dispatch; an already-accepted email cannot be recalled.

## Schedules and calendars

For eligible Studio-owned clocks, store an IANA timezone, business-calendar version, anchor, time interpretation, next due instant, policy version, and cancellation epoch. Native CMS D13 appointments retain exact revision, civil time, named zone, explicit ambiguity choice, not-before instant and generation fencing; Support response targets, recurring recovery, fixed-pledge reminders and report schedules retain their source policies. A valid organization-owned CMS appointment may survive routine initiator departure under D13; this never extends the lifetime of a Studio human-owner-bound NHI. Standard reminder proposal: due after three business days, optional reminder at due plus two business days, final internal escalation at due plus five; at most two outward reminders unless the source-owned message contract is narrower. Tenant activation must show the actual proposed dates. No default reminder program for fixed pledges or recurring-payment recovery beyond their source rules.

`elapsed` means an exact duration. `local_date` means a date in the specified timezone. `business` means scheduled open intervals minus configured holidays. For eligible Studio-owned clocks only, the candidate default moves nonexistent local times to the next valid instant and selects the earlier repeated occurrence; qualify that profile before activation. Source clocks requiring explicit user interpretation, including CMS D13 appointments, never inherit this default. Store the resolution. Date-only expiry defaults to end of the source's named local date, not UTC midnight by accident.

On pause, freeze remaining duration only for relative timers marked pauseable. Fixed expiry and appointment clocks continue. Resume recalculates relative timers from remaining duration. Calendar changes affect future allocations unless a reviewed run revision explicitly reschedules active work. Missed routine schedules coalesce to one review/reminder by default; no catch-up flood. Source-owned report, payment, and statement schedules are invoked through their owners, not duplicated.

## Retries, exception classes, and compensation

Retry transient transport failures and documented provider throttling with bounded exponential backoff, jitter, and provider Retry-After. Source contract sets the safe budget; a proposed generic ceiling is five automatic execution attempts within 24 hours, never applied to an ambiguous or non-idempotent operation. Existing dispatch handoff recovery remains a separate budget and must not multiply business sends.

Validation errors, revoked permissions, missing owner, impossible joins, rejected decisions, and incomplete historical facts require correction/review—not repeated network retries. Categorize denial, missing evidence, source conflict, technical failure, and uncertain outcome separately. Suppressed optional communication may complete its communication request as not sent, but must not satisfy an evidence gate.

No universal rollback. Compensation is a distinct authorized source-domain operation with its own identity and evidence. A refund, access revocation, publication correction, or document replacement is not generated because a downstream task failed. Preserve confirmed upstream work and show the exact unresolved remainder.

## Capacity, fairness, and outage behavior

Use tenant-keyed Inngest concurrency and global resource pools; official documentation calls fairness best-effort, so load certification remains required [S03]. The SDK supports a bounded number of concurrency constraints; do not specify an impossible stack of per-run/per-tenant/per-domain/per-provider keys. Database fences protect mutations; action-level provider limits protect transports. Throttling queues work whereas rate limiting can discard excess starts; essential business work must be queued [S08].

Bulk enrollment freezes an authorized cohort manifest and consumes it in bounded chunks. No unbounded `Promise.all`, per-node full-CRM query, or per-donor giant function state. Essential source operations have protected capacity distinct from optional journeys. Tenant overload blocks additional optional admission visibly without losing already accepted source events. Meter evaluation/operation costs and enforce platform limits; never alter money or evidence because a tenant hit a plan limit.

Inngest run lengths and trace retention are plan-dependent [S04]. Core engagements, source evidence, and purpose retention outlive individual executions and provider traces. Every bounded worker yields after a maximum work budget and records another durable continuation when needed.

When orchestration is down, source operations and acceptance continue wherever their owners support it; dispatch requests remain durable. Provide manual source operations and an external heartbeat check independent of Inngest. Restore first in outbound-suppressed mode, reconcile effect/tombstone records with providers and sources, then selectively reopen dispatch. Restoring a database must not resend confirmed communications or resurrect revoked access.

# Design: Eve Email And Discord Notifications

## Context

`#436` consumes already-governed Eve events, including #435 monitor findings, and requests safe external
summaries. It owns notification policy, the safe envelope, channel eligibility, platform-owner recipient
authority, dedupe, pause, expiry, and Discord rendering/delivery. For email, it owns the typed request but hands
content governance to a platform-scoped fixed Phase 17 contract and delivery to the Phase 6 Resend spine. It does not own the
source event, global kill switches, verified identity, audit shape, retention policy, or a second email
renderer/provider lifecycle.

## Decisions

### 1. One safe envelope precedes channel rendering

The source event is normalized into a notification envelope containing stable event/notification ids, event
type, severity, source and target references, occurred time, safe decision summary, explicitly allowed detail
fields, policy/redaction versions, dedupe key, intended channel class, and expiry. Unsafe raw source payloads
are not copied into the envelope.

### 2. Destinations are app-owned and verified

Email recipients come only from enabled platform-owner notification records tied to verified app identity and
permission state. Discord destinations come only from enabled app-owned operational channel configuration.
Prompts, models, tools, events, issue bodies, PR content, and monitor evidence cannot add or replace a
recipient, address, webhook, guild, or channel.

The normative email authority is a revisioned
`platform_owner_notification_records` aggregate owned by #436. Each revision
binds one stable app principal, verified email/contact revision, current
platform-owner permission epoch, enabled event classes, enable/pause state, and
revision/time evidence; it has no tenant id and is service-only. Phase 6 stores
the exact record id, authority revision, and identity/permission epoch on the
platform intent and re-proves them at preparation. The destination address is
restricted delivery material, not a caller field or durable body-free history
field.

### 3. Email is a platform-owner durable record

V1 email is restricted to platform owners. A durable message includes the safe event class, severity, time,
decision summary, permitted evidence link/reference, and a link back to authorized Mission Control context.
The safe envelope and recipient become a typed platform-scoped communication intent. Phase 17 owns the
catalog/contract, Asym-fixed publication resolution, canonical compiler, and platform delivery-profile/connection
configuration and proof. Phase 6 owns recipient-specific intent, preparation orchestration through those Phase 17
resolvers, outbox/claim, submission fence, idempotency, Resend invocation, provider attempt/evidence/outcome
reduction, reconciliation, and body-free communication history.
This platform connection is never a tenant fallback. Email never becomes the authoritative Eve audit record;
`#419` audit remains authoritative and links to Phase 6 delivery evidence.

The current Phase 17 manifest generation intentionally contains zero Eve email
keys, because this change has not yet enumerated exact occurrence meanings and
source fences. Email is therefore non-dispatchable: a request fails before
Phase 6 intent creation. A later generation must add one meaning-specific key
per proved occurrence plus the fixed platform profile and complete proof pack.
One generic `eve_alert` or severity-only catch-all is prohibited.

### 4. Discord is urgent awareness with minimal content by default

Only events meeting app-owned urgency/severity policy are eligible for Discord. The default rendering is
minimal: event class, severity, safe summary, time, and safe internal reference. Rich details may be added only
when the field allowlist and deterministic safe-content/redaction policy approve each field. Uncertain content
is omitted, not sent for a model-only safety judgment.

### 5. Sensitive content is excluded by construction

Neither channel may contain secrets/credentials, service-role keys, environment values, raw production
records, donor/payment data, unapproved identity or tenant data, raw logs, unredacted replay/debug artifacts,
hidden reasoning, or arbitrary model/tool output. URLs must be allowlisted and must not carry credentials or
sensitive query parameters.

### 6. Dedupe and lifecycle prevent noise

Stable notification dedupe combines event class, target, severity band, channel, and configured time window.
Eve owns eligibility, suppression, cancellation, pause, expiry, and handoff. Discord keeps its bounded
pending/sending/delivered/retryable-failed/terminal-failed channel lifecycle. Email provider lifecycle does not
duplicate those states: after the typed intent handoff, Phase 6 owns preparation orchestration through the Phase 17
compiler/resolvers, provider submission, retry/reconciliation, and delivery outcome, while Eve projects the linked safe status. Retries are bounded,
idempotent, budgeted, and cease on pause or stale/expired events. A severity escalation may create a new
allowed notification under policy; repeat observations do not spam recipients.

### 7. Pause is notification-local but consumes global controls

Notification settings support channel/global notification pause and recipient opt-out as app-owned state.
Delivery also consumes #418 release/emergency and #420 relevant kill-switch state. #436 does not invent a new
global automation switch or override #420. Re-enable/resume requires the existing authorized admin path.
Eve exposes those current decisions, notification pause/opt-out/expiry/dedupe eligibility, exact source event and
target identity, #426 verified service-identity revision, recipient-authority revision, severity band, current #423
budget/rate-limit decision and policy revision, selected eligible channel, and content-policy/redaction version
through one opaque producer-owned fence. Phase 6 independently re-reads or verifies that same complete fence
before preparation and again immediately before committing its submission fence; missing, stale, mismatched, or
unavailable proof stops definitely unsubmitted work without reinterpreting Eve policy.
Possibly submitted work remains governed by provider-outcome reconciliation.

### 8. Every outcome is audited and retained by existing owners

`#419` records policy, redaction, dedupe, destination class (not secrets), delivery attempt, provider response
class, and outcome. Every attempt executes as #426's verified service identity and carries the explicit source
initiator/trigger metadata; event, prompt, model, or tool content cannot choose the actor or user/tenant scope.
Audit records both the source initiator and delivery actor. #424 controls retention of notification and audit
records. Provider payloads/responses are stored only in safe redacted form when necessary; credentials and raw
sensitive content are never retained.

### 9. Runtime and provider boundaries remain external

`#425` owns event-consumer/runtime durability. #436 owns the safe envelope and notification-level policy rather
than a new host. Discord provider selection and execution remain #436 implementation details inside its
operational-channel boundary. Email has no independent provider choice: it uses a platform-scoped Phase 17
contract/compiler and publication plus the Phase 6 server-side delivery boundary and Resend. It is never a browser-to-provider path or a
tenant-message fallback.

## State Flow

1. A governed source event requests notification.
2. Current release, #420 switch, pause/opt-out, expiry/dedupe, exact source event/target identity, #426 service
   identity revision, recipient-authority revision, severity band, #423 budget/rate-limit decision and policy
   revision, selected eligible channel, and content-policy/redaction state are evaluated and sealed as an opaque
   Eve fence.
3. The safe envelope is built and deterministically redacted.
4. Dedupe and expiry decide send/suppress/cancel.
5. Destination resolves from app-owned config; Discord renders under Eve policy, while email submits only the typed platform-scoped Phase 6 intent.
6. Discord executes under verified service identity and bounded idempotent retry; Phase 6 independently verifies
   the Eve fence before preparation and submission, invokes Phase 17's compiler/resolvers, and delivers email
   through Resend under its own exact provider fences.
7. Safe outcome is audited and shown in #427 Mission Control.

## Alternatives Rejected

- **Let event payloads supply recipients:** enables exfiltration and routing abuse.
- **Send rich Discord messages then redact at storage:** external leakage has already occurred.
- **Use Discord as audit history:** it is an awareness channel, not app-owned evidence.
- **Model-only redaction:** deterministic deny/allow rules must bound any model contribution.

## Risks and Mitigations

- **Data leakage:** safe envelope, field allowlists, URL sanitization, deny-on-uncertainty.
- **Alert fatigue:** severity routing, stable dedupe, cooldown, bounded retry, pause.
- **Recipient drift:** verified app-owned platform-owner records and operational destinations.
- **Provider replay/duplicates:** Discord uses Eve idempotency/lifecycle; email uses Phase 6 prepared identity, Resend idempotency, and provider reconciliation.
- **Stale incident delivery:** Eve checks current state before handoff/Discord work; Phase 6 independently verifies
  the opaque Eve fence before preparation and submission and fails closed without duplicating Eve policy.

## Rollout

This PR defines only the contract. No destination or provider is configured here. Implementation must remain
disabled until channel tests and #437 final launch verification pass.

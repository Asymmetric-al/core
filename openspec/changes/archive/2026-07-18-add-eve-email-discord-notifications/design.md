# Design: Eve Email And Discord Notifications

## Context

#436 consumes already-governed Eve events, including #435 monitor findings, and delivers safe external
summaries. It owns notification policy, envelope, channel rendering, dedupe, pause, and delivery outcomes. It
does not own the source event, global kill switches, verified identity, audit shape, or retention policy.

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

### 3. Email is a platform-owner durable record

V1 email is restricted to platform owners. A durable message includes the safe event class, severity, time,
decision summary, permitted evidence link/reference, and a link back to authorized Mission Control context.
Email never becomes the authoritative audit record; #419 audit remains authoritative.

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

Stable dedupe combines event class, target, severity band, channel, and configured time window. The lifecycle
is pending, suppressed, sending, delivered, retryable-failed, terminal-failed, or cancelled. Retries are
bounded, idempotent, budgeted, and cease on pause or stale/expired events. A severity escalation may create a
new allowed notification under policy; repeat observations do not spam recipients.

### 7. Pause is notification-local but consumes global controls

Notification settings support channel/global notification pause and recipient opt-out as app-owned state.
Delivery also consumes #418 release/emergency and #420 relevant kill-switch state. #436 does not invent a new
global automation switch or override #420. Re-enable/resume requires the existing authorized admin path.

### 8. Every outcome is audited and retained by existing owners

#419 records policy, redaction, dedupe, destination class (not secrets), delivery attempt, provider response
class, and outcome. Every attempt executes as #426's verified service identity and carries the explicit source
initiator/trigger metadata; event, prompt, model, or tool content cannot choose the actor or user/tenant scope.
Audit records both the source initiator and delivery actor. #424 controls retention of notification and audit
records. Provider payloads/responses are stored only in safe redacted form when necessary; credentials and raw
sensitive content are never retained.

### 9. Runtime and provider boundaries remain external

#425 owns event-consumer/runtime durability; #436 owns the safe envelope, notification policy, and delivery
lifecycle rather than a new host. Email delivery remains behind the repository's existing server-side outbound
email boundary, never a browser-to-provider path. Email uses that existing Resend boundary; Discord uses a
server-only environment webhook that is never persisted.

## State Flow

1. A governed source event requests notification.
2. Current release, pause, identity, recipient, severity, budget, and channel policy are evaluated.
3. The safe envelope is built and deterministically redacted.
4. Dedupe and expiry decide send/suppress/cancel.
5. Channel renderer includes only allowed fields; destination resolves from app-owned config.
6. The server-side provider operation executes under verified service identity and idempotently within bounded retry policy.
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
- **Provider replay/duplicates:** idempotency keys and durable lifecycle state.
- **Stale incident delivery:** expiry and current-state checks before every attempt/retry.

## Rollout

This PR implements the contract with app-owned destination classes and provider boundaries. No provider
credential or live destination is configured, both channels ship disabled and paused, and the release switch
remains off until #437 final launch verification passes.

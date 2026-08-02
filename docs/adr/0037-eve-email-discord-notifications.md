# ADR-0037: Deliver Eve operator notifications from durable safe envelopes

- Status: Accepted
- Date: 2026-07-18
- Issue: #436

## Context

Engineering findings need durable platform-owner email and urgent Discord
awareness without allowing source content to choose recipients or leak raw
evidence. Delivery can fail or be retried, so a direct send from a monitor is
not sufficient.

## Decision

Normalize each finding into a strict, redacted envelope before channel
rendering. Supabase owns channel and recipient configuration, stable dedupe,
idempotency identity, delivery lifecycle, bounded attempts, expiry, and atomic
leases. Email recipients resolve only from current `super_admin` profiles with
an enabled app-owned preference. Email uses `@asym/email`; Discord uses a
server-only `EVE_DISCORD_WEBHOOK_URL` that is never stored.

Every enqueue and attempt rechecks current release, emergency, active-run,
channel, severity, policy-version, recipient, and budget state. Discord is
minimal by default and disables mentions. Only deterministic allowlisted fields
can appear in rich mode. Audit stores destination classes and safe provider
response classes, never secrets or raw provider payloads.

## Consequences

- Both channels ship disabled and paused, with no credential committed.
- A database trigger prevents non-platform-owner email configuration.
- Duplicate events converge on one durable record per destination and window.
- Crashed deliveries are reclaimed after a lease expires; retries are bounded.
- Mission Control exposes real safe state and platform-owner pause controls.

# Change: Add Eve Email And Discord Notifications

## Why

Important Eve events must not remain trapped in Mission Control. Issue #436 adds the v1 external-notification
contract: email is the durable record for platform owners, while Discord provides urgent operational
awareness. Both channels must be policy-controlled, redacted, deduplicated, pausable, and audited.

External delivery raises the cost of a mistake. Recipient and destination configuration therefore remains
app-owned, content is safe by construction, Discord rich detail requires an explicit safe-content decision,
and neither a prompt nor a model can choose where a notification goes.

## What Changes

- Define a channel-neutral safe envelope and notification-level policy lifecycle.
- Restrict v1 email recipients to verified configured platform owners.
- Route email through an exact platform-scoped, Asym-fixed Phase 17 contract and
  compiler/publication plus the Phase 6 Resend delivery spine; do not create a parallel email renderer, provider
  lifecycle, or history.
- Treat email as implementation-blocked in the current Phase 17 manifest
  generation, which contains zero Eve keys. Before any email implementation,
  enumerate each stable occurrence meaning and source fence, add only
  meaning-specific platform keys plus the fixed platform profile in a later
  manifest generation, and pass each platform proof pack. Do not add a generic
  `eve_alert` key.
- Restrict Discord to configured operational destinations and urgent operational events.
- Default Discord to minimal safe content; allow richer detail only after deterministic policy/redaction checks.
- Define dedupe, retry, suppression, pause/opt-out, delivery outcome, and audit behavior.
- Require secrets, raw production data, donor/payment details, unsafe identity data, raw logs, unredacted replay,
  and hidden reasoning to remain out of both channels.
- Keep the package spec-only with no provider, webhook, credential, schema, send, or runtime activation.

## Impact

- **Affected capability:** `eve-email-discord-notifications` (new)
- **Dependencies:** #418, #419, #420, #423, #424, #426, #427, #435, and the
  SiteStacker Phase 17 content contract plus Phase 6 outbound-delivery contract
- **Issue covered:** #436
- **User stories covered:** 61, 62, 63, and 64
- **Runtime impact:** none in this PR

## Non-Goals

- Sending email to customers, donors, tenant users, arbitrary admins, or addresses supplied at runtime.
- Treating Discord as a durable audit/archive system or a safe location for sensitive data.
- Creating a new global pause or kill-switch owner; #420 remains authoritative.
- Defining monitor detection; #435 owns monitor findings.
- Activating the final Eve release switch; #437 owns launch verification.
- Creating tenant-facing Discord configuration or using the Asym platform Resend
  connection as fallback for tenant messages.

## Evidence

- The PRD requires email plus Discord, platform-owner-only email, policy-gated rich Discord content, and tests
  for redaction, severity, dedupe, and pause state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- The implementation plan assigns the external-notification slice to #436.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- #419 owns audit/redaction shape and #424 owns retention/replay lifecycle.
  [VERIFIED-REPO: openspec/changes/add-eve-audit-tracer-bullet]
  [VERIFIED-REPO: openspec/changes/add-eve-retention-replay-tracer]

# Change: Add Eve Email And Discord Notifications

## Why

Important Eve events must not remain trapped in Mission Control. Issue #436 adds the v1 external-notification
contract: email is the durable record for platform owners, while Discord provides urgent operational
awareness. Both channels must be policy-controlled, redacted, deduplicated, pausable, and audited.

External delivery raises the cost of a mistake. Recipient and destination configuration therefore remains
app-owned, content is safe by construction, Discord rich detail requires an explicit safe-content decision,
and neither a prompt nor a model can choose where a notification goes.

## What Changes

- Define a channel-neutral notification envelope and lifecycle.
- Restrict v1 email recipients to verified configured platform owners.
- Restrict Discord to configured operational destinations and urgent operational events.
- Default Discord to minimal safe content; allow richer detail only after deterministic policy/redaction checks.
- Define dedupe, retry, suppression, pause/opt-out, delivery outcome, and audit behavior.
- Require secrets, raw production data, donor/payment details, unsafe identity data, raw logs, unredacted replay,
  and hidden reasoning to remain out of both channels.
- Implement the off-by-default durable lifecycle, server-side provider boundaries, Mission Control status, and operator controls.

## Impact

- **Affected capability:** `eve-email-discord-notifications` (new)
- **Dependencies:** #418, #419, #420, #423, #424, #426, #427, and #435
- **Issue covered:** #436
- **User stories covered:** 61, 62, 63, and 64
- **Runtime impact:** a one-minute delivery sweep exists, but both channels ship disabled and paused and the release switch remains off

## Non-Goals

- Sending email to customers, donors, tenant users, arbitrary admins, or addresses supplied at runtime.
- Treating Discord as a durable audit/archive system or a safe location for sensitive data.
- Creating a new global pause or kill-switch owner; #420 remains authoritative.
- Defining monitor detection; #435 owns monitor findings.
- Activating the final Eve release switch; #437 owns launch verification.

## Evidence

- The PRD requires email plus Discord, platform-owner-only email, policy-gated rich Discord content, and tests
  for redaction, severity, dedupe, and pause state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- The implementation plan assigns the external-notification slice to #436.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- #419 owns audit/redaction shape and #424 owns retention/replay lifecycle.
  [VERIFIED-REPO: openspec/changes/add-eve-audit-tracer-bullet]
  [VERIFIED-REPO: openspec/changes/add-eve-retention-replay-tracer]

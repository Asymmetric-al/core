# Tasks: Eve Email And Discord Notifications

## 1. Envelope And Policy

- [x] 1.1 Define the typed safe envelope, allowed event classes, severity routing, and expiry.
- [x] 1.2 Implement deterministic field redaction, URL sanitization, and deny-on-uncertainty behavior.
- [x] 1.3 Keep unsafe raw payloads and arbitrary model/tool output outside notification records.

## 2. Destinations And Rendering

- [x] 2.1 Resolve email only from enabled verified platform-owner configuration.
- [x] 2.2 Resolve Discord only from enabled app-owned operational destinations.
- [x] 2.3 Render minimal Discord content by default and gate each rich field independently.

## 3. Lifecycle And Controls

- [x] 3.1 Implement stable channel-aware dedupe and idempotent provider attempts.
- [x] 3.2 Implement bounded retries, expiry, terminal states, and current-policy checks before every attempt.
- [x] 3.3 Enforce notification pause/opt-out plus #418/#420 global state without creating a new global switch.
- [x] 3.4 Consume #423 budget/rate limits for delivery and retry work.
- [x] 3.5 Execute every generation/attempt as #426's verified service identity with source initiator/trigger metadata.

## 4. Audit And Visibility

- [x] 4.1 Emit #419 records for source initiator, verified delivery actor, policy, redaction, dedupe, attempt, suppression, and outcome.
- [x] 4.2 Apply #424 retention/hold/expiry to safe notification records.
- [x] 4.3 Expose safe status, failures, and pause controls through #427.

## 5. Verification

- [x] 5.1 Test platform-owner-only email and rejection of runtime-supplied recipients.
- [x] 5.2 Test urgent Discord routing, minimal default, approved rich fields, and denied unsafe fields.
- [x] 5.3 Test secrets, raw production/donor/payment data, raw logs, replay, and unsafe URL exclusion.
- [x] 5.4 Test dedupe, idempotency, retries, expiry, pause, budget exhaustion, and audit.
- [x] 5.5 Keep the release switch off and configure/send no external notification in this slice.

## 6. Scope Check

- [x] 6.1 Confirm #436 owns notification policy/delivery lifecycle, not global kill switches.
- [x] 6.2 Confirm #425 owns runtime/event-consumer durability and email stays behind the server-side boundary.
- [x] 6.3 Confirm monitor detection and final launch remain #435/#437 scope.

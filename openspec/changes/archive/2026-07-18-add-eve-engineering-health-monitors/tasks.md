# Tasks: Eve Engineering Health Monitors

## 1. Registry And Configuration

- [x] 1.1 Define the exact six-type active registry and fail-closed unknown-type behavior.
- [x] 1.2 Define app-owned schedule/event, thresholds, severity, scope, dedupe, cursor, owner, and pause config.
- [x] 1.3 Keep product-opportunity and every unlisted monitor disabled.

## 2. Collection And Findings

- [x] 2.1 Implement per-signal minimum evidence adapters and freshness validation.
- [x] 2.2 Normalize safe finding records with stable dedupe and lifecycle transitions.
- [x] 2.3 Exclude secrets, donor/payment data, raw production records, and hidden reasoning.

## 3. Governance And Downstream Operations

- [x] 3.1 Enforce #418 release/emergency, #420 relevant switch state, #423 budgets/rate limits, and #426 identity/scope before every run and downstream request.
- [x] 3.2 Route existing-PR comments only through #430.
- [x] 3.3 Route issue creation/work initiation only through #431.
- [x] 3.4 Emit #419 audit for collection, classification, dedupe, lifecycle, and downstream outcome.
- [x] 3.5 Expose safe monitor state through #427.

## 4. Verification

- [x] 4.1 Test all six allowed signal types and rejection of product/unlisted types.
- [x] 4.2 Test stale/malformed/cross-scope evidence rejection and revision freshness.
- [x] 4.3 Test dedupe, cooldown, resolution, reopen, and alert-storm resistance.
- [x] 4.4 Test budget exhaustion, pause/kill state, protected-area precedence, and audit completeness.
- [x] 4.5 Test that comments/issues cannot bypass #430/#431 gates.
- [x] 4.6 Keep the release switch off and activate no monitor in this slice.

## 5. Scope Check

- [x] 5.1 Confirm #435 owns detection/findings, not GitHub mutation implementations.
- [x] 5.2 Confirm #425 owns schedule/runtime durability and #424 owns finding/audit retention/replay.
- [x] 5.3 Confirm #431 is optional downstream composition, not a new blocker for comment-only outcomes.
- [x] 5.4 Confirm notification delivery and final launch remain #436/#437 scope.

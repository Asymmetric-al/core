# Change: Add Eve Engineering Health Monitors

## Why

Eve needs a first active background-monitor set that turns known engineering-health signals into governed,
auditable operational follow-up. Issue #435 intentionally limits that first set to six signals: CI failures,
stale PRs, failing evals, dependency/security alerts, protected-area PRs, and budget/rate-limit issues.

Monitoring must not become a back door to broad autonomous work. Detection is read-oriented; comments and
issues remain policy-gated GitHub operations owned by the existing #430 and #431 capabilities. Product
opportunity scanning is explicitly deferred and must remain disabled.

## What Changes

- Define scheduled and event-fed monitor runs for the six approved engineering-health signal types.
- Define app-owned monitor configuration, thresholds, cursors, dedupe keys, severity, and pause state.
- Require safe evidence normalization, deterministic classification where possible, and freshness checks.
- Allow a monitor to request an audited existing #430 comment or #431 issue operation only when policy allows.
- Require protected-area and budget/rate-limit signals to preserve the stricter governing policy.
- Keep product-opportunity scanning and any unlisted monitor disabled by default.
- Implement the root-only Eve dispatcher, app-owned persisted registry, atomic leases, collectors, safe findings, governed follow-up composition, and Mission Control visibility.
- Keep every monitor, destination, and the global release switch disabled and paused.

## Impact

- **Affected capability:** `eve-engineering-health-monitors` (new)
- **Declared blockers:** #423, #427, #430, and #433
- **Composed owners:** #417, #418, #419, #420, #424, #425, #426, and #431 when policy chooses new issue creation
- **Issue covered:** #435
- **User stories covered:** 58, 59, and 60
- **Runtime impact:** one root-only five-minute dispatcher; no run is claimable until an app-owned config is deliberately enabled and unpaused after launch approval

## Non-Goals

- Product-opportunity, customer, donor, fundraising, or business-data scanning.
- Creating a new GitHub comment or issue mutation path.
- Auto-fixing, pushing, merging, deploying, or changing protected areas.
- Defining notification delivery; #436 owns email and Discord policy.
- Defining final launch activation; #437 owns launch verification.

## Evidence

- The PRD names the exact initial engineering-health monitor set and defers product-opportunity scanning.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- The implementation plan requires audited issue/comment outcomes under policy.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- #430 owns governed review comments and #431 owns autonomous issue creation/work initiation.
  [VERIFIED-REPO: openspec/changes/add-eve-github-read-review-path]
  [VERIFIED-REPO: openspec/changes/add-eve-autonomous-pr-operator]

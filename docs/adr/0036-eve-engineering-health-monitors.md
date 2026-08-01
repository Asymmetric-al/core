# ADR-0036: Run Eve engineering monitors through an app-owned leased registry

- Status: Accepted
- Date: 2026-07-18
- Issue: #435

## Context

Eve needs proactive engineering-health detection without turning background
execution into a new authority boundary. The first set is exactly CI failures,
stale pull requests, failing evals, dependency/security alerts, protected-area
pull requests, and budget/rate-limit pressure. Product-opportunity scanning is
explicitly outside this release.

Eve 0.25.1 discovers root-only static schedules at build time. Its documented
dynamic-scheduling pattern uses one static dispatcher plus application-owned
rows and atomic leases. Delivery is at least once, so findings and downstream
effects need their own stable idempotency keys.

## Decision

Use one root-only, five-minute Eve schedule as a dispatcher. Supabase owns the
exact monitor registry, enabled/paused state, scope, thresholds, severity,
destination policy, policy version, checkpoint, and atomic lease. All defaults
are inserted disabled, paused, and with no destination.

Collectors are deterministic GitHub App reads scoped to
`Asymmetric-al/core`. They normalize only the minimum safe evidence for their
signal and reject stale, malformed, cross-scope, secret-like, business-data, or
hidden-reasoning content. A SHA-256 dedupe identity makes repeated observations
update one finding and makes downstream comments/issues idempotent.

Each claimed run creates a service-owned session and rechecks current release,
emergency, active-run, policy-version, approval, and budget state. Existing-PR
comments compose through the #430 review boundary; new issues compose through
the #431 operator. Neither collector owns a GitHub mutation client.

## Consequences

- No schedule can run until both the persisted config and global governance are
  deliberately activated.
- Unknown and product-opportunity monitor types are absent from schemas, SQL
  constraints, collectors, and the admin view.
- Overlapping cron ticks cannot claim the same monitor lease.
- A crash may retry a read, but stable finding and downstream markers prevent
  alert storms.
- Mission Control can inspect safe config, run, and finding state without raw
  logs, prompts, secrets, or hidden reasoning.

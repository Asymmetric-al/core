# Eve Engineering Health Monitors

Issue #435 installs the first engineering-health monitor set. It does not turn
the monitors on. Every default row is `enabled = false`, `paused = true`, and
has destination `none`; the global Eve release switch also remains off.

## Exact monitor set

1. CI failures
2. Stale pull requests
3. Failing Eve/evaluation workflows
4. Dependabot and code-scanning alerts
5. Pull requests that touch protected-area rules
6. GitHub API budget/rate-limit pressure

Product-opportunity, customer, donor, payment, fundraising, and arbitrary
repository scanning are not registered and fail schema/database validation.

## Runtime flow

The root schedule `engineering-health` fires every five minutes in UTC on a
production Eve host. It ensures the disabled defaults exist and atomically
claims only due rows that an operator has separately enabled and unpaused.
Development does not fire cron automatically; use Eve's dev-only schedule
dispatch route for local iteration.

For each claim, the runtime:

1. establishes a tenant-scoped service session owned by
   `eve-monitor-scheduler`;
2. rechecks current governance, config policy version, and the active-runs
   switch;
3. consumes the hard `engineering.monitor.collect` budget;
4. reads only the minimum GitHub evidence for that monitor;
5. validates freshness and writes or updates a stable safe finding;
6. rechecks GitHub governance and budget before an optional #430 comment or
   #431 issue; and
7. records run, finding, dedupe, downstream, and audit outcomes before
   releasing the lease.

## Operator response

- Use the `active_runs` kill switch to stop monitor execution globally.
- Use `github_actions` or `production_writes` to stop downstream follow-up.
- Keep a monitor paused when its evidence source is degraded or noisy.
- Treat policy-version mismatch as a required config review, not as something
  the runtime may auto-update.
- Inspect safe status in Mission Control. Raw logs and protected content remain
  at their source and are referenced only by a GitHub URL.

## Verification

- `eve info` must list the `engineering-health` schedule with no diagnostics.
- `eve build` must include the five-minute schedule.
- Unit coverage must prove all six collectors, stale/cross-scope rejection,
  dedupe/reopen behavior, release and pause suppression, downstream
  composition, and migration grants/constraints.
- Supabase migration verification must confirm service-only RPC execution and
  that all inserted default configs are disabled, paused, and destinationless.

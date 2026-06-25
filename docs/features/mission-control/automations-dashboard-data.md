# Mission Control Automations Dashboard Data Contract

## Current Implemented Sources

Automation rules come from `mission_control_automation_rules` through
`GET /api/admin/mission-control/automations` and the
`useMissionControlAutomations` client hook. The dashboard summary derives rule
counts from persisted rules for the authenticated tenant:

- `totalRules`: all returned persisted rules.
- `activeRules`: rules marked enabled or active.
- `pausedRules`: rules with paused or disabled activation status.
- `draftRules`: rules with draft activation status.

Execution metrics come from `mission_control_automation_activity_logs`.
`executions24h` counts persisted activity-log rows created in the last 24
hours, and `failedRuns24h` counts those rows with a non-empty `failures` array.
When the activity-log query succeeds, zero means zero persisted activity, not
missing data.

## Explicitly Not Wired Yet

Integration health is not live yet. The Automations page must not show provider
statuses without a real persisted data source. Future provider health should be
read from actual connection state, webhook health, provider API health, or a
tenant-scoped integration telemetry table.

Until that source exists, the UI should show an honest not-wired state instead
of claiming that any provider is operational.

## Control Behavior Contract

`/automations` is currently the full Mission Control automation rules surface.
Do not add enabled controls unless they navigate to a verified route or perform
a real action.

- View All Flows: this is redundant while `/automations` is the full rules
  list. If a future dashboard card becomes a limited preview, this control may
  link to the full rules route.
- New Flow: this belongs to the future builder route. The builder should create
  a disabled draft first, start with simple mode, require `automation:manage`,
  and block activation until preview, test run, and activity-log readiness are
  proven.
- History: this belongs to a future activity route backed by
  `mission_control_automation_activity_logs`. It must show real persisted run
  data only, including run identifiers, rule links, trigger details, action
  results, failures, notifications, created tasks, actor context, and
  `created_at`.
- Manage Connections: this belongs to future provider telemetry and connection
  management. It must read real persisted provider state. External integration
  marketplace behavior is out of scope for this automation surface.

## UI Trust Rule

Staff and admin pages must not fall back to demo flows or hardcoded live
metrics. Loading, empty, and error states must not look like tenant data.
Sample data is allowed only in clearly labeled demo contexts, not this
production admin surface. Placeholder controls are not acceptable: planned
actions must be absent, disabled with visible explanation, or wired to real
routes and actions.

## Future Wiring Checklist

- Add real integration connection telemetry before showing provider health.
- Write activity logs from the automation executor when execution becomes
  functional.
- Add history, new-flow, and connection-management links only when real routes
  or actions exist.
- Build the activity/history route before surfacing a History action.
- Build the simple New Flow draft route before surfacing a New Flow action.
- Add preview/test-run activation gates before allowing rule activation from
  builder UI.
- Keep tests that guard the summary contract and prevent fallback demo data.

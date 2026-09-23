# Mission Control Automations Dashboard Data Contract

**Source inspection: 2026-09-22.** Current rule/dashboard behavior below is read from `packages/api/src/admin/mission-control-automations/store.ts`, `packages/database/mission-control-automations.ts` and the shared query hook. This is source evidence, not a deployment/provider qualification claim. The full intended product is the [Workflow Studio contract](../../prds/workflow-studio/README.md); its adoption does not enable missing dashboard controls.

## Implemented source contract at inspection

Rules come from `mission_control_automation_rules` through `GET /api/admin/mission-control/automations` and `useMissionControlAutomations`. The store returns at most 100 tenant-scoped rows ordered by update time. Summary counts cover those returned rows, not a proved count of every tenant rule:

- `totalRules`: all returned rules.
- `activeRules`: `enabled` and `activationStatus=active` together.
- `invalidRules`: active status without enabled; invalid is not active.
- `pausedRules`: paused or disabled lifecycle status.
- `readyRules`: ready lifecycle status.
- `draftRules`: the remaining draft bucket from the shared lifecycle resolver.

Execution metrics read `mission_control_automation_activity_logs` within a 24-hour window, newest first, capped at 1,000 returned rows. `executions24h` is the returned row count and `failedRuns24h` counts rows with a non-empty `failures` array. These capped activity-row summaries are not independently proved unique-run or uncapped total metrics. A successful empty query produces zero with `activityLogBacked=true`; an error must not be disguised as a successful zero.

The loader sets `integrationHealthBacked=false`. It does not establish live provider health. Read actual qualified connection/webhook/provider evidence before showing an operational provider status.

## Current and future control behavior

`/automations` is the existing Mission Control rules entry point. Keep deep-link compatibility during the documented Studio route migration. Enable a control only when it navigates to a verified route or performs a real authorized action.

- **View all flows:** link to the current full list only when a limited preview needs it; do not invent another rule authority.
- **New flow:** the shared Studio creates an inert draft using the supported guided language. Current Phase 12 authoring capability and source scope apply; the historical `automation:manage` label alone is insufficient. Publication and prospective activation remain separate, with exact bindings, preflight, synthetic test and review gates.
- **History:** show actual authorized activity and source outcomes. During migration preserve legacy rows and their real metric meaning; do not relabel them as qualified Studio engagements, provider delivery, evidence acceptance or business completion. New history must link source outcomes, unknown results, plan versions and correlation without exposing raw private records.
- **Manage connections:** use the shared source-qualified connection product. A dashboard link does not authorize raw credentials, a workflow-specific key store or an integration marketplace.

Support contextual settings consume the same Studio definition and retain [Phase 26 native owners](../support-hub/README.md). Source routing, quarantine, response clocks, manual source operations and essential communication remain usable without optional Studio enrollment.

## UI trust rule

Do not display demo flows or hardcoded live metrics as tenant data. Loading, empty, unavailable and error states stay distinct. Synthetic data is allowed only in clearly labelled preview/test contexts with no live effects. Hide unavailable controls or explain their state; do not imply an unimplemented action works.

## Future wiring and migration requirements

- Add qualified provider telemetry before claiming integration health.
- Preserve existing rule/activity identities and counts’ documented bounds; a changed metric needs a source-backed contract and tests.
- Route new-flow/history/connection controls only to implemented, authorized shared surfaces.
- Bind future execution to the Phase 12 NHI live human-owner ceiling and exact current source operations.
- Require immutable publication, separate prospective enablement, synthetic preview/test, exact preflight and activity readiness.
- Shadow-compare retained rules with effects disabled and atomically select one execution owner; old prototype correction/replay actions are not automatically admitted into the new registry.
- Verify the [shared program checkpoints](../../prds/workflow-studio/09-implementation-backlog.md) and retain tests preventing fabricated metrics, duplicate effects and enabled placeholder controls.

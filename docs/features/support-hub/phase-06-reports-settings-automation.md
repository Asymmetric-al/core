# Support Hub — Phase 6: reports, inbox settings, SLA rules, and automation

**Current adoption requirements amended 2026-09-22 (AL-1892).** This file retains the earlier Support implementation inventory; its local “Phase 6/7” labels are historical feature stages, not program Phases 6/7. The [current Phase 26 package](README.md) owns native Support behavior and the [Workflow Studio contract](../../prds/workflow-studio/README.md) owns configurable cross-product rules. The [original record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/support-hub/phase-06-reports-settings-automation.md) preserves the initial design and reported test results.

## Current compatibility requirements

- Preserve the nested `/support/reports/*` and `/support/settings/*` entry points and shared Mission Control shell where compatible with the current Phase 26 experience. Route compatibility does not establish source authorization.
- Configurable triggers, conditions, branches and actions use the single Phase 34 Studio vocabulary and registry. Existing rule CRUD and the pure `evaluateSupportAutomationRule` matcher are migration inputs, not a second approved live engine. Shadow comparison is effect-free; one qualified execution owner is selected before activation.
- Native Support owns conversations, assignment decisions, response clocks, quarantine, exact source commands and permitted macros. It remains complete without the general Studio; fixed native policies cannot become hidden optional tenant automations.
- Business operations belong in `packages/api`; approved browser collections/hooks remain in `packages/database`. Replacing a collection fetch function is insufficient to prove permissions, source command receipts, safe projections or retained-data migration.
- Shared UI preserves exact `base-maia`, Base UI, semantic tokens, keyboard/outline access and truthful loading/error states. Existing chart/shell components may be reused after current-contract verification.
- Knowledge-base insertion, feedback and other source integrations follow the current Phase 26 requirements and exact source readiness; the historical “no fitting content source” observation does not decide their present scope.

## Historical implementation inventory

The following architecture, file list, types, report shapes and UI details describe the earlier implementation record. They preserve reusable implementation context, not current proof that every named source, writer, permission or runtime behavior meets the Phase 26/34 contracts. Seed fixtures and recorded test totals are not tenant data or current qualification.

## Architecture

```mermaid
flowchart LR
  subgraph routes [/support/* routes]
    inbox[/support page.tsx/]
    reportsLayout[reports/layout.tsx]
    settingsLayout[settings/layout.tsx]
    reportsPages[reports/*/page.tsx]
    settingsPages[settings/*/page.tsx]
  end
  subgraph chrome [Workspace chrome]
    shell[SupportWorkspaceShell]
    subnav[SupportSubNav]
  end
  subgraph data [Data layer]
    collections[Collections]
    hooks[Hooks]
    mutations[Mutation hooks]
    selectors[Selectors]
    engine[automation-engine]
    biz[business-hours]
    exportLib[report-export]
  end
  subgraph ui [Phase 6 UI]
    reports[Reports surfaces]
    settings[Settings surfaces]
    automations[Automation rule builder]
  end
  reportsLayout --> shell
  settingsLayout --> shell
  reportsPages --> reports
  settingsPages --> settings
  shell --> subnav
  reports --> selectors
  reports --> exportLib
  reports --> hooks
  settings --> mutations
  automations --> engine
  selectors --> biz
```

## Files added

### Routes (`apps/admin/app/(app)/support/`)

```
reports/
  layout.tsx
  loading.tsx
  page.tsx                    # redirect → /support/reports/overview
  overview/page.tsx
  agents/page.tsx
  teams/page.tsx
  labels/page.tsx
  inbox/page.tsx
settings/
  layout.tsx
  loading.tsx
  page.tsx                    # redirect → /support/settings/inbox
  inbox/page.tsx
  collaborators/page.tsx
  assignment/page.tsx
  business-hours/page.tsx
  sla/page.tsx
  signatures/page.tsx
  labels/page.tsx
  macros/page.tsx
  canned-responses/page.tsx
  saved-views/page.tsx
  automations/page.tsx
  notifications/page.tsx
```

### Feature components (`apps/admin/features/support-hub/components/`)

```
workspace/
  SupportWorkspaceShell.tsx    # PageShell wrapper + sub-nav mount + SupportNowProvider
  SupportSubNav.tsx            # Section pills + sub-section tabs; mobile Select fallback
  SupportSettingsLayout.tsx    # Optional two-column layout helper
  SupportEmptySection.tsx      # Quiet empty state used across settings / reports

reports/
  ReportFilters.tsx            # Date range + group-by + business-hours toggle
  ReportScopeSelect.tsx        # Scope picker (all / inbox / agent / team / label)
  ReportExportMenu.tsx         # CSV + JSON download trigger
  ReportSummaryCards.tsx       # Maia stat cards row
  ReportLineChart.tsx          # Recharts AreaChart (dynamic import)
  ReportBarChart.tsx           # Recharts BarChart (dynamic import)
  ReportTable.tsx              # Tabular fallback for accessibility
  surfaces/
    OverviewReport.tsx
    AgentsReport.tsx
    TeamsReport.tsx
    LabelsReport.tsx
    InboxReport.tsx

settings/
  SettingsPanel.tsx            # Card-shaped panel
  SettingsRow.tsx              # Two-column label / control row
  SettingsToolbar.tsx          # Sticky save/discard strip with dirty indicator
  inbox/InboxSettingsForm.tsx
  collaborators/{AgentsList,TeamList,TeamForm}.tsx
  assignment/AssignmentRulesForm.tsx
  business-hours/{BusinessHoursList,BusinessHoursForm}.tsx
  sla/{SlaPolicyList,SlaPolicyForm}.tsx
  signatures/{SignatureList,SignatureForm}.tsx
  labels/LabelsSettingsPanel.tsx
  macros/{MacroList,MacroForm,MacroActionEditor}.tsx
  canned-responses/{CannedResponseList,CannedResponseForm}.tsx
  saved-views/SavedViewsList.tsx
  automations/{AutomationRuleList,AutomationRuleForm,AutomationConditionRow,AutomationActionRow,AutomationDryRunPreview}.tsx
  notifications/NotificationPreferencesForm.tsx
```

### Library helpers (`apps/admin/features/support-hub/lib/`)

```
automation-engine.ts           # evaluateSupportAutomationRule(rule, context)
business-hours.ts              # isWithinBusinessHours + minutesWithinBusinessHours
report-aggregations.ts         # buildReportSeries (all Phase 6 metrics)
report-export.ts               # toReportCsv / toReportJson / downloadReportBlob
report-state.ts                # useSupportReportRouteState (nuqs)
```

### Database additions (`packages/database/collections/support-hub.ts`)

- `SUPPORT_AUTOMATION_TRIGGERS` / `SUPPORT_AUTOMATION_CONDITION_KINDS` /
  `SUPPORT_AUTOMATION_ACTION_KINDS` enum tables + discriminated-union Zod
  schemas for `SupportAutomationCondition` and `SupportAutomationAction`.
- `supportAutomationRuleSchema` + `supportSignatureSchema` +
  `supportNotificationPreferencesSchema` Zod schemas and derived TS types.
- Seeded collections:
  - `supportAutomationRulesCollection` (3 rules: auto-label foundation gifts,
    auto-snooze newsletter subjects, auto-escalate urgent gift keywords).
  - `supportSignaturesCollection` (one signature per seeded agent, each marked
    as default for its owner).
  - `supportNotificationPreferencesCollection` (one row per seeded agent).
- `SUPPORT_REPORT_SLICES` extended with `messages-received`,
  `messages-sent`, `customer-waiting`, `resolution-count`, `open-count`,
  `snoozed-count` plus matching aggregators in `report-aggregations.ts`.
- `INBOX_SETTINGS_SEED.defaultSignatureId` now points at Emily's signature.

### Tests (`tests/unit/apps/admin/features/support-hub/`)

```
automation-engine.test.ts     (5 cases)
business-hours.test.ts         (5 cases)
report-aggregations.test.ts    (8 cases)
report-export.test.ts          (4 cases)
```

Historical recorded result: **111 test files, 481 unit tests passed** (458 prior + 23 new) in the original implementation record. These tests were not rerun for this planning update.

## Data model additions

```ts
type SupportAutomationTrigger =
  | "conversation_created"
  | "message_received"
  | "status_changed"
  | "label_added"
  | "past_due_reached";

type SupportAutomationCondition =
  | { kind: "inbox_is"; inboxId: string }
  | { kind: "label_includes"; labelId: string }
  | { kind: "from_domain_equals"; domain: string }
  | { kind: "assignee_is_present"; value: boolean }
  | { kind: "is_overdue"; value: boolean }
  | { kind: "is_escalated"; value: boolean }
  | { kind: "subject_contains"; value: string }
  | { kind: "body_contains"; value: string };

type SupportAutomationAction =
  | { kind: "assign_agent"; agentId: string }
  | { kind: "assign_team"; teamId: string }
  | { kind: "add_label"; labelId: string }
  | { kind: "set_priority"; priority: SupportPriority }
  | { kind: "set_status"; status: SupportConversationStatus }
  | { kind: "snooze"; hours: number }
  | { kind: "mark_escalated" }
  | { kind: "run_macro"; macroId: string };

interface SupportAutomationRule {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  enabled: boolean;
  trigger: SupportAutomationTrigger;
  conditions: SupportAutomationCondition[]; // ANDed
  actions: SupportAutomationAction[];
  createdAt: string;
  updatedAt: string;
}
```

```ts
interface SupportSignature {
  id: string;
  tenantId: string;
  ownerAgentId: string | null;
  name: string;
  bodyText: string;
  bodyHtml: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupportNotificationPreferences {
  id: string;
  tenantId: string;
  agentId: string;
  emailMentions: boolean;
  emailAssignments: boolean;
  emailDailyDigest: boolean;
  inAppMentions: boolean;
  inAppAssignments: boolean;
  inAppSlaWarnings: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Reports contract

```ts
interface SupportReportRequest {
  slice: SupportReportSlice; // extended with 6 new metrics
  scope: {
    kind: "all" | "inbox" | "agent" | "team" | "label";
    id?: string | null;
  };
  range: { from: string; to: string };
  groupBy: "day" | "week" | "month";
  businessHoursOnly: boolean;
}
```

- `useSupportReport(request)` pulls the full conversation + message + label +
  business-hours collections and delegates to `buildReportSeries`.
- `ReportFilters` writes its state to `?from=&to=&groupBy=&scope=&businessHours=`
  via `useSupportReportRouteState` (nuqs). Reset button is always available.
- CSV / JSON export builds the file in-browser via `Blob` +
  `URL.createObjectURL` (no network round trip). Filenames follow
  `{slice}-{YYYY-MM-DD}.{csv|json}`.
- The 5 report surfaces wrap `ReportFilters`, the chart wrappers
  (`ReportLineChart` / `ReportBarChart`), `ReportSummaryCards`, and
  `ReportTable` (the table is rendered alongside each chart as an a11y
  fallback).

### Metric catalogue

| Metric              | Unit    | Slice value         | Bucket contents                            |
| ------------------- | ------- | ------------------- | ------------------------------------------ |
| Conversations       | count   | `volume`            | Per-day counts of `conversation.createdAt` |
| First response time | minutes | `first-response`    | Average + median                           |
| Resolution time     | minutes | `resolution`        | Average + resolved count                   |
| Label mix           | count   | `label-mix`         | Conversations per label                    |
| Agent mix           | count   | `agent-mix`         | Conversations per assignee                 |
| Messages received   | count   | `messages-received` | Inbound email count per period             |
| Messages sent       | count   | `messages-sent`     | Outbound email count per period            |
| Customer waiting    | minutes | `customer-waiting`  | Conversations waiting + avg + longest      |
| Resolution count    | count   | `resolution-count`  | Conversations resolved in range            |
| Open count          | count   | `open-count`        | Open + pending split                       |
| Snoozed count       | count   | `snoozed-count`     | Currently snoozed + ready-to-wake          |

## Matcher shape and effective execution boundary

The current pure signature `evaluateSupportAutomationRule(rule, { conversation, message?, now? })` returns:

```ts
interface AutomationEvaluationResult {
  ruleId: string;
  matches: boolean;
  reasons: string[]; // one reason per condition
  plannedActions: SupportMacroAction[]; // reuses macro-runner shape
  unsupportedActions: SupportAutomationAction[]; // e.g. mark_escalated
}
```

The historical matcher translates supported actions into the macro-shaped preview result and retains unsupported actions separately. This structural translation is not source authorization or proof that an action is safe to execute. The current pure function takes a rule and evaluation context; read its actual signature before calling it.

A dry-run must remain mutation-free and use permitted synthetic preview facts. Unsupported actions must say unavailable until their exact source adapter is qualified; do not promise that a later server automatically executes them. Future configurable execution belongs to the shared Studio, through current Phase 12/NHI authority and source-owned commands. A generic `set_status`, `assign_agent` or `run_macro` shape cannot bypass Phase 26's reviewed state/assignment/macros contracts, source receipts or safety fences. Native Support timers and recovery remain native.

## Keyboard + route continuity

- No new top-level nav entries. The `/support` role gate still applies to
  `/support/reports/*` and `/support/settings/*` because they share the
  same URL prefix.
- Every new route is a client component that mounts
  `<SupportWorkspaceShell section=... />` — no shell rewrites, no
  `MCShell` changes, no additions to `packages/lib/mission-control/nav.ts`.
- Phase 5's inbox keyboard surface is untouched.

## Visual rules followed

- Maia tokens + Zinc palette only. No new hex colors.
- Forced-light theme preserved.
- Sub-nav chips use the same `h-10 rounded-xl` density as the Phase 3
  toolbar.
- Charts inherit the default Maia theme from `@asym/ui/components/shadcn/chart`.
- Mobile collapses the long settings tab strip into a `<Select>` dropdown so
  the workspace sub-nav stays usable at ≤ md.

## Loading, empty, and failure states

- Each section has its own `loading.tsx` that renders a skeleton inside
  `<PageShell>`.
- Empty settings tables render `<SupportEmptySection>` with a single CTA
  (e.g. "Create a team", "Save current filter").
- Reports with zero data show the chart frame + a quiet "No activity in the
  selected window" caption.
- Failed mutations toast via sonner; settings forms revert their local draft
  on Discard.
- Dry-run without seeded conversations renders an explainer pointing to
  `/support`.

## Historical recorded quality gates

- `bun run lint` — clean across the workspace.
- `bun run typecheck` — clean across 13 packages.
- `bun run test:unit` — **481 tests across 111 files** pass (458 prior + 23
  new).
- `tanstack-foundation-guardrails.test.ts` stays green (no `@tanstack/db`
  import added to admin).
- Prettier — clean.

## Current follow-through and migration

Use the current Phase 26 implementation queue and the Studio WS-20 slice rather than executing the original feature-stage follow-up list as a new product plan.

- Inventory real tables, alternate writers, exposed collections, persisted rules, macros, routes, seed behavior and reporting consumers before migration. Preserve source facts and historical activity; qualify current grants/RLS and server projections.
- Keep the old matcher available only for approved preview/shadow comparison until retained rules have one certified Studio execution owner. Do not attach a second autonomous evaluator to the inbound webhook router.
- Bind any admitted rule action to its exact current Support command, actor/NHI scope, source revision, semantic effect identity and audit receipt. Unsupported actions remain unavailable; a generic task or macro result cannot establish another source's completion.
- Use Phase 17 exact governed message production and Phase 6 release/delivery/history. Do not add a direct Resend digest sender or infer communication permission from a legacy preference row.
- Follow current native Support requirements for assignment, response targets, calendars, feedback, content insertion, replies and CRM context. Resolve exact source readiness and current timezone policy; historical UTC-only helpers do not set the target contract.
- Preserve route/shell and approved collection-hook compatibility where possible, while proving server authority and source-safe projection instead of assuming a fetch swap makes the old UI complete.
- Prove bounded migration, effects-disabled comparisons, safe rollback/recovery, privacy, source outcome correctness and accessible staff journeys. Existing source histories and required native behavior survive disabling optional workflow enrollment.

# Support Hub — Phase 6: reports, inbox settings, SLA rules, and automation

Phases 1–5 are stacked. Phase 6 adds the manager-facing operating layer to the
Donor Care Support Hub: nested `/support/reports/*` and `/support/settings/*`
routes under a shared workspace shell, 12 settings panels, 5 report surfaces,
and a typed first-version automation rule builder with dry-run preview. Every
new mutation is additive over the Phase 2 collection writers, so Phase 7 can
swap in real Supabase persistence without touching any settings or reports
component.

## Decisions locked

- **Route shape:** nested routes (option a, locked in Phase 1 file-map). All
  leaf pages sit inside `<PageShell>` and mount a shared
  `<SupportSubNav />` so Inbox / Reports / Settings navigation lives in one
  place. Mission Control shell ownership is preserved.
- **Automation builder:** full form-based CRUD (option a) with typed
  trigger / conditions / actions + a pure dry-run preview. No live runtime
  yet — `evaluateSupportAutomationRule` is a pure function the Phase 7
  inbound webhook router will reuse.
- **Collections stay in `packages/database`.** The
  `tanstack-foundation-guardrails.test.ts` rule still holds: no
  `@tanstack/db` import lands in `apps/admin`.
- **Charts** reuse Recharts through dynamic imports (same pattern as
  `apps/admin/app/reports/reports-charts.tsx`). No new chart library.
- **Knowledge-base article insertion** is deferred — the repo has no fitting
  content source today. Listed in the Phase 7 follow-up.

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

### Routes (`apps/admin/app/support/`)

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

Totals: **111 test files, 481 unit tests pass** (458 prior + 23 new).

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

## Automation contract

`evaluateSupportAutomationRule({ rule, conversation, message? })` returns:

```ts
interface AutomationEvaluationResult {
  ruleId: string;
  matches: boolean;
  reasons: string[]; // one reason per condition
  plannedActions: SupportMacroAction[]; // reuses macro-runner shape
  unsupportedActions: SupportAutomationAction[]; // e.g. mark_escalated
}
```

Every automation action that maps cleanly onto `SupportMacroAction` lands in
`plannedActions`. The two exceptions — `mark_escalated` and `run_macro` —
come back in `unsupportedActions` so the dry-run preview can tell the agent
"this action is valid but fires server-side only (Phase 7)."

The `<AutomationDryRunPreview />` component renders the reasons + planned
actions inline beneath the rule form. No mutations run during dry-run.

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

## Quality gates

- `bun run lint` — clean across the workspace.
- `bun run typecheck` — clean across 13 packages.
- `bun run test:unit` — **481 tests across 111 files** pass (458 prior + 23
  new).
- `tanstack-foundation-guardrails.test.ts` stays green (no `@tanstack/db`
  import added to admin).
- Prettier — clean.

## Phase 7 follow-up list (real backend pieces still needed)

- Real Supabase tables + RLS for `support_automation_rules`,
  `support_signatures`, `support_notification_preferences`.
- Server-side automation evaluator — Phase 7's inbound webhook router
  calls the same pure `evaluateSupportAutomationRule` and then pipes
  `plannedActions` through `runSupportMacro`.
- `mark_escalated` + `run_macro` action coverage in the server runtime.
- Real notification delivery — Resend daily digest emails + Mission
  Control inbox bell surface.
- CSAT collection + report (table reserved in Phase 1 spec; UI deferred).
- Knowledge-base article insertion inside the reply composer (no fitting
  content source today).
- CRM hydration for merge variables and contact sidecar.
- Live business-hours-aware SLA timers (today the report applies the
  business-hours filter post-hoc rather than pausing live timers).
- Tenant timezone plumbing so `business-hours.ts` can interpret schedules
  in the tenant-local offset (currently UTC-only).
- Macro action parity with automation actions (`mark_escalated`,
  `set_status`, `run_macro`).

## Continuity for Phase 7+

- `evaluateSupportAutomationRule` is a pure function and reuses
  `SupportMacroAction` so the server-side scheduler can pipe hits through
  `runSupportMacro` without a parallel dispatcher.
- New collections share the Phase 2 collection-writer pattern — swap the
  `queryFn` for a Supabase fetch and the UI continues to work unchanged.
- `report-export.ts` is browser-only today; if server-side export is ever
  needed it can move into `packages/api` without changing the UI surface.
- `SupportWorkspaceShell` + `SupportSubNav` are the single seam for adding
  new sub-sections; extending the nav is a one-line change.
- Every settings mutation writes a sonner toast + optimistic collection
  update so the real server-side variant only needs to preserve those
  semantics.

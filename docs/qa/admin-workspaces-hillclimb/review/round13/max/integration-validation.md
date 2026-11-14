# Round 13 independent integration regression validation

## Outcome and limits

**PASS: 469 tests in 33 files, across eight sequential batches; every batch exited 0.** No assertion failures, failed suites, or reported unhandled test errors. One source-owned Base UI integration diagnostic remains, described below; passing assertions are not a clean-console or release-acceptance claim.

- Execution checkout: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. The parent `t3-5a24111d` checkout was read only, including frozen briefs and round 12 reviews.
- Evidence window: **2026-11-11, 15:40:41–22:35:49, Asia/Bangkok (UTC+07)**. These are separate bounded runs, not one atomic snapshot. Builders may still change the app; results apply to modules loaded by each recorded batch.
- Installed tooling inspected: Bun **1.4.3**, Node **24.22.1**, Vitest **5.0.5**, Next **16.4.2**.
- Only this report and its owned temporary logs were authored. No app/test/config edits, git mutations, subagents, councils, workflows, servers, browser/localhost requests, real provider/database operations, `.env` changes, turbo, tsc, root unit sweep, or lint/format mutations.
- This is a focused regression check across the seven assigned areas, **not a final visual score, completed council, exhaustive area certification, or deployment sign-off**.

## Selection and execution method

Read applicable root/admin/shared-UI instructions, frontend/testing rules, relevant OpenSpec principles, boundaries, CRM/contribution contracts and active UI/support changes, manifests/configuration, test harnesses and installed Next testing/error guidance before selecting existing tests. Selection followed the frozen [implementation brief:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/IMPLEMENT-BRIEF.md:1), relevant wave-A files, [wave-B pending acceptance:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-b-pending.md:1), and their referenced round 12 reviews. Superseded CRM/Contributions fixture complaints were not treated as current defects.

The root unit script runs a broad suite, so it was deliberately not invoked. Used the current root Vitest configuration with explicit files. Each process finished before starting the next. `--maxWorkers 1 --no-file-parallelism --maxConcurrency 1` bounds concurrent work to one worker; per-file isolation remains enabled. Logs saying several workers were _spawned_ describe sequential isolated files, not simultaneous workers. No performance suggestions to disable isolation were followed.

`--configLoader runner --no-cache --no-fsModuleCache` avoids the normal bundled-config and test/module cache writes. No coverage or snapshot-update flags. Existing DOM suites mock data hooks or stub `fetch`; query/service tests use explicit HTTP/query fakes. A jsdom `http://localhost/` document origin is not a server request. No new tests, superficial source-string checks, or duplicate builder tests were written; existing structural assertions inside selected suites are not counted as proof of live integration.

## Recorded results

All dates below are 2026-11-11, UTC+07. Duration is Vitest's reported duration; logs retain exact timestamps, commands, diagnostics and exit codes.

| Batch     | Focus                                         | Files / tests passed | Start–end         | Duration | Exit           | Raw log                                                                                                                                                                               |
| --------- | --------------------------------------------- | -------------------- | ----------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01        | Shell / Home                                  | 4 / 80               | 15:40:41–15:41:55 | 69.73s   | 0              | [01-shell-home.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/01-shell-home.log:1)       |
| 02        | Reports / database hook / API read model      | 4 / 51               | 21:55:17–21:55:37 | 17.57s   | 0              | [02-reports.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/02-reports.log:1)             |
| 03        | Studio account / collections / preview        | 3 / 58               | 21:59:40–22:00:14 | 31.73s   | 0              | [03-studio.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/03-studio.log:1)               |
| 04        | CRM / shared gift operations                  | 4 / 107              | 22:03:32–22:06:06 | 152.39s  | 0              | [04-crm.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/04-crm.log:1)                     |
| 05        | Contributions / permission props / money      | 3 / 59               | 22:10:10–22:10:25 | 13.44s   | 0              | [05-contributions.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/05-contributions.log:1) |
| 06        | People / care / locations                     | 4 / 39               | 22:28:43–22:29:25 | 40.73s   | 0              | [06-people.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/06-people.log:1)               |
| 07        | Tools / moderation / workflow / PDF           | 5 / 54               | 22:31:17–22:31:48 | 29.37s   | 0              | [07-tools.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/07-tools.log:1)                 |
| 08        | Support board / setup / unknown counts / time | 6 / 21               | 22:35:10–22:35:49 | 36.48s   | 0              | [08-support.log:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/08-support.log:1)             |
| **Total** | **Selected scope only**                       | **33 / 469**         |                   |          | **0 failures** |                                                                                                                                                                                       |

No failed checks were waived or silenced. No test reruns were needed.

## Passing scope and current evidence

### Shell / Home / Reports

- Exercised the actual in-shell error and missing-page components, including exception reporting, support reference only (not private exception text), retry and Home links: [shell-boundaries.test.tsx:14](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/shell-boundaries.test.tsx:14). Current implementation invokes the framework-provided retry callback at [error.tsx:47](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/error.tsx:47>). Other shell suites compose `MCShell` with mocked navigation/context to exercise unsaved-change navigation, focus and navigation names. This does not mount Next's complete route/error hierarchy.
- Home retains exact cents, separates real zero from unavailable figures, reports failed attention checks, and respects role/module disclosure: [mission-control-home.test.tsx:282](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/mission-control-home.test.tsx:282).
- Missing `report.completeness` does not crash Reports or advertise complete charts: [page-client.tsx:90](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:90>), [reports-page.test.tsx:215](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:215). Failed/unknown figures remain distinct from zero.
- Current Reports URL behavior is covered through the real nuqs testing adapter: initial grouping/period, updates and invalid-value defaults, plus hook/export selection. See [reports-page.test.tsx:247](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:247). The trend-after-funds DOM-order case also passed at [reports-page.test.tsx:759](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:759); it must not be reported as still expecting the round 12 order.
- Report hook tests exercise request bounds, applied-filter exports and stale-data updating state with stubbed HTTP. API read-model tests exercise paging beyond 1,000 rows, cap disclosure, settled status/refunds/corrections, donor deduplication and tenant separation using an in-memory query fake: [admin-crm-report-totals.test.ts:102](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/api/admin-crm-report-totals.test.ts:102). Async trend-section tests call the section and inspect returned props; they are not streamed RSC rendering tests.

### Web Studio

- Account regression uses installed Payload `RenderServerComponent` and the configured import-map entry with route-shaped props. It exercises outer view versus nested account-form rendering, matching the current branch at [studio-account-view.tsx:37](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/shell/studio-account-view.tsx:37). **Payload `AccountView` and `DefaultEditView` are mocked**, however: [web-studio-account.test.tsx:34](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/web-studio-account.test.tsx:34), [web-studio-account.test.tsx:59](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/web-studio-account.test.tsx:59). This is stronger than rendering the custom form alone, but does not close the actual installed account-route acceptance gap.
- Collection tests pass for phone primary links, avoiding block cell markup inside paragraphs, filtering/sorting/selection, named references with honest ID sort disclosure, and 1024px panel-width decisions. The new heading-width cases start at [web-studio-collection-grid.test.tsx:1747](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/web-studio-collection-grid.test.tsx:1747). These are mocked geometry/DOM checks, not measured browser overflow or hydration.
- Preview tests verify a direct single link, correct published-only label, a menu for two links, and no control without a destination.

### CRM and Contributions

- Relationships distinguishes absent commitments from an actual zero-pledge report: [page-client.tsx:168](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/relationships/page-client.tsx:168>), [crm-relationships-workspace.test.tsx:933](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/crm-relationships-workspace.test.tsx:933), [crm-relationships-workspace.test.tsx:957](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/crm-relationships-workspace.test.tsx:957). Loading/error states, monthly per-currency labels and staff-denial behavior also pass.
- Drawer tests cover cents, received versus pending/failed/refunded money, incomplete history disclosure, retry, owner identity, and gift history before the secondary chart: [crm-record-drawer.test.tsx:438](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/crm-record-drawer.test.tsx:438). CRM-to-shared-detail tests exercise donation IDs, preserved route state/focus, available actions, retired CRM-posting fail-closed behavior and shared operation submission through mocked HTTP.
- Contributions distinguishes failed attention checks from a clean queue, failed gifts from empty data, and partial loaded-page totals from complete totals: [contributions-page.test.tsx:555](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-page.test.tsx:555), [contributions-page.test.tsx:682](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-page.test.tsx:682). Deep links, detail/operation overlays, correction consequences, revision submission and shared invalidation pass; invalidation evidence is at [contributions-page.test.tsx:1644](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-page.test.tsx:1644).
- Money-model assertions cover integer cents, net refunds, currency partitioning, real empty zero, anonymous donor hiding and receipt suppression/resend eligibility. Auth tests call the real async page with mocked auth/permissions and inspect client permission props; they do not establish live server authorization or provider effects.

### People

- Care activity renders stored TipTap JSON, literal plain text including angle brackets, and legacy HTML as readable safe text. The HTML case asserts the exact decoded multi-line string and absence of rendered script/image nodes: [personnel-profile.test.tsx:233](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:233), [personnel-profile.test.tsx:261](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:261). The production text conversion is at [PersonnelProfile.tsx:182](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:182). The rich viewer/editor are mocked; this is not a complete editor/sanitizer audit.
- A failed profile read remains retryable rather than becoming Not Found: [care-profile-page.test.tsx:157](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/care/care-profile-page.test.tsx:157). Real query hooks with stubbed HTTP distinguish 404 from 403/500 and invalidate profile/overview/last-contact after logging contact: [member-care-detail.test.tsx:32](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/database/member-care-detail.test.tsx:32).
- Contact drafts survive failure, pending saves lock fields, empty editor documents are rejected, real goal/cadence IDs and the shared calendar work. Locations tests cover list/map state, existing relationship preservation, read failures and failed save/delete retries with a mocked WebGL map.

### Tools

- Automations no longer offers unrelated Support inbox-rule settings as platform-rule management; real summary/loading/error/empty/filter and missing-count cases pass: [automations-page.test.tsx:72](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:72).
- Moderation exercises actual query hooks with stubbed server-authorized responses, including unresolved shell identity, staff-readable labels/dates, capped lists, separate comment failure/retry, read-only controls and tenant cache isolation: [moderation-real-readonly.test.tsx:65](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed/moderation-real-readonly.test.tsx:65). This does not test the real server's authorization.
- Tasks retain real follow-up links and distinguish unknown/error from empty. Workflow runs preserve urgent filtering/deep links and retry without duplicate outcome charts. PDF header/export tests distinguish native sample renders/JSON from real downloads and explain free-mode PDF restrictions: [pdf-studio-header-export.test.tsx:84](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:84). The remote legacy editor is mocked; no export/provider request was made.

### Support

- Move menu is outside the conversation button and dispatches the selected status without opening the conversation: [board-card.test.tsx:93](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx:93). The composed board uses a real snooze picker before invoking its mocked mutation, and reports rejected moves without claiming success: [board-lane-jump.test.tsx:109](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/board-lane-jump.test.tsx:109). Compact lane jumps and focus/scroll contracts also pass.
- Agent setup waits for ready identity/access data, gives admins the collaborator-settings destination, gives non-admins a handoff rather than an admin link, and supports dismissal: [agent-setup-notice.test.tsx:38](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/agent-setup-notice.test.tsx:38). See the primitive diagnostic below.
- Unknown inbox totals/tabs do not fabricate zeros, and real ready states remain distinct: [inbox-availability.test.tsx:31](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/inbox-availability.test.tsx:31). Filter reset and native `<time datetime>`/exact-date tooltip behavior pass at [inbox-refinements.test.tsx:45](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/inbox-refinements.test.tsx:45).

## Failures, diagnostics and attribution

### Verified non-gating source integration diagnostic

**Support admin setup renders an anchor through a native-button primitive.** At [SupportAgentSetupNotice.tsx:49](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/alerts/SupportAgentSetupNotice.tsx:49), `Button` renders Next `Link` without changing the primitive's native-button contract. The shared wrapper forwards it to Base UI at [button-component.tsx:19](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/button-component.tsx:19), whose installed default is `nativeButton = true` at [Button.js:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/node_modules/@base-ui/react/button/Button.js:24). The existing agent-setup test emits the matching Base UI warning at [08-support.log:22](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/08-support.log:22), while its assertions still pass.

This is source-owned, not an inferred Windows/host failure. The exact component path is absent in the frozen parent checkout (`Test-Path -LiteralPath 'C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/apps/admin/features/support-hub/components/alerts/SupportAgentSetupNotice.tsx'` returned false), so this particular composition is new relative to that evidence tree; no commit/builder attribution is claimed. The owner can use the already-shared semantic `ButtonLink` at [button-component.tsx:40](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/button-component.tsx:40). **No actual blocked navigation, keyboard failure or lost permission boundary was demonstrated**, so this is not escalated to a proven release-blocking functional failure. Source was not edited.

### Other emitted diagnostics, not established product regressions

- Recharts reports zero chart dimensions in jsdom in Reports and CRM: [02-reports.log:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/02-reports.log:9), [04-crm.log:51](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/04-crm.log:51). This run cannot distinguish a browser sizing defect from unavailable DOM geometry; it proves neither successful chart visibility nor a production chart failure.
- Studio's default-order reset emits React's test-environment `act(...)` warning: [03-studio.log:38](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/03-studio.log:38). The assertion passes. Treat as a harness diagnostic, not evidence of a live sort failure; age was not classified.
- CRM's yearly-giving fixture emits a missing-key warning at [04-crm.log:45](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/max/integration-validation-logs/04-crm.log:45). Its helper supplies `shared.donationId` but no top-level `id`, then bypasses typing with `as never`: [crm-record-drawer.test.tsx:390](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/crm-record-drawer.test.tsx:390). Production rendering keys rows by `gift.id`: [gift-history-rows.tsx:308](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/gift-history-rows.tsx:308>). This fixture warning does not substantiate missing/duplicate IDs in real CRM payloads or a money regression.

There were **no failing checks to classify as host, pre-existing, or newly introduced product failures**. No frozen-baseline execution was performed and no warning was dismissed merely because a previous review mentioned it.

## Critical acceptance still missing

1. **Actual installed Payload account route.** Render `/web-studio/account` with real `AccountView`, `DefaultEditView`, document providers, permissions/preferences and form save behavior in the authorized runtime pass. Current mocks intentionally model the context invariant but cannot establish the actual route no longer crashes. This is the most important remaining integration acceptance gap.
2. **Next route/streaming/hydration behavior.** The real shell's nested error boundary, async page/trend sections, Cache Components/PPR and server-to-client wiring were not exercised as a running Next app. Installed [Next Vitest guidance:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md:9) explicitly recommends E2E for async Server Components. Direct async function/returned-prop tests are not a substitute.
3. **Real responsive and accessible interaction.** Verify 1440/1024/640/390px, no horizontal page scroll, loaded chart geometry, keyboard/focus, zoom and real hydration. Mobile semantic/geometry mocks are useful regressions but do not close this acceptance. In particular, wave B asks for Email/PDF toolbar captures and non-default Reports grouping/period: [wave-b-pending.md:34](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-b-pending.md:34).
4. **Real navigation and persistence.** Reports' URL parser/update and trend DOM order are covered, but real browser reload/back/forward, fixed-trend period disclosure alongside selected report periods, and persisted state after Support move/care contact/gift operations remain unverified. Stubs establish UI contracts, not database/provider success or live role/tenant enforcement.
5. **Unselected surfaces.** This is not a sweep of Directory/Events, every Administration/Settings route, Email Studio, Organization Updates, or all Support settings/reports. No full build/typecheck, browser audit, finance/provider integration suite or production data check was run. The seven area labels describe selected seams, not complete-area acceptance.

## Exact test commands

Working directory for every command: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. Each was executed once inside a PowerShell logging wrapper using `Tee-Object` and recording `$LASTEXITCODE`; the exact Vitest invocations were:

### 01 — Shell / Home — exit 0, 4 files / 80 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/shell-boundaries.test.tsx tests/unit/apps/admin/shell-navigation-guard.test.tsx tests/unit/apps/admin/mc-shell-navigation-names.test.tsx tests/unit/apps/admin/mission-control-home.test.tsx
```

### 02 — Reports — exit 0, 4 files / 51 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/app/reports-page.test.tsx tests/unit/apps/admin/app/reports-giving-trend.test.tsx tests/unit/packages/database/admin-crm-report.test.tsx tests/unit/packages/api/admin-crm-report-totals.test.ts
```

### 03 — Studio — exit 0, 3 files / 58 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/web-studio-account.test.tsx tests/unit/apps/admin/web-studio-collection-grid.test.tsx tests/unit/apps/admin/web-studio-document-preview-links.test.tsx
```

### 04 — CRM — exit 0, 4 files / 107 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/app/crm-relationships-workspace.test.tsx tests/unit/apps/admin/app/crm-record-drawer.test.tsx tests/unit/apps/admin/app/crm-gift-detail-entry.test.tsx tests/unit/packages/api/admin/crm-gift-history-row-model.test.ts
```

### 05 — Contributions — exit 0, 3 files / 59 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/app/contributions-page.test.tsx tests/unit/apps/admin/app/contributions-page-auth.test.tsx tests/unit/apps/admin/app/contributions-hub-model.test.ts
```

### 06 — People — exit 0, 4 files / 39 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx tests/unit/apps/admin/app/care/care-profile-page.test.tsx tests/unit/packages/database/member-care-detail.test.tsx tests/unit/apps/admin/app/mobilize/locations-page.test.tsx
```

### 07 — Tools — exit 0, 5 files / 54 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/app/automations-page.test.tsx tests/unit/apps/admin/app/feed/moderation-real-readonly.test.tsx tests/unit/apps/admin/app/tasks/tasks-content.test.tsx tests/unit/apps/admin/app/workflows-page.test.tsx tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx
```

### 08 — Support — exit 0, 6 files / 21 tests

```powershell
bunx vitest run --config vitest.config.mts --configLoader runner --maxWorkers 1 --no-file-parallelism --maxConcurrency 1 --no-cache --no-fsModuleCache --reporter verbose --no-color tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx tests/unit/apps/admin/features/support-hub/components/board-lane-jump.test.tsx tests/unit/apps/admin/features/support-hub/components/agent-setup-notice.test.tsx tests/unit/apps/admin/features/support-hub/components/stats-strip-state.test.tsx tests/unit/apps/admin/features/support-hub/components/inbox-availability.test.tsx tests/unit/apps/admin/features/support-hub/components/inbox-refinements.test.tsx
```

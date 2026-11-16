# Round 13 focused review: Support Hub and Tools

## Scope and evidence

Independent source/contract review and one targeted unit-test run on 2026-11-11 (Asia/Bangkok). Application evidence was read from `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`; the final PDF/workflow anchors were captured at 21:46:57 +07:00. Builders were editing concurrently: moderation labels and workflow-chart removal changed during this review. Findings describe the observed snapshot, not a declaration that wave A is complete.

Only this report was authored. No application/test edits, git mutations, dev servers, localhost requests, live backend access, or delegated work. This is **not a final visual score, accessibility-conformance certification, or completed-council claim**.

Reviewed the applicable root/admin/UI/API/database instructions, frontend/testing rules, relevant backend/data-access rules, OpenSpec project and identity/platform/workflow/support-read contracts, and installed Next.js accessibility documentation. Applied the accessibility-review skill to native semantics, accessible names/descriptions, menu structure, feedback and verification limits.

Frozen intent/evidence consulted:

- [Round 13 implementation brief](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/IMPLEMENT-BRIEF.md:1).
- [Wave A People/Tools/Support](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-a-people-tools-support.md:1) and [wave B pending work](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-b-pending.md:1).
- [Round 12 Support review](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round12/claude-support.md:1) and [Tools re-run review](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round12/claude-tools.md:1). No superseded Reports-fixture conclusions are carried forward.

## Verified remaining application issues

No P0/P1 defect or tenant/permission regression was established in the audited paths. The following are concrete, scoped acceptance gaps; they may be in-progress builder work rather than claimed-complete changes.

### 1. PDF export limitation remains duplicated and outside the shared Alert

**Priority: P2, assigned UI/accessibility follow-up.**

[PDF header:642](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:642>) still renders the free-mode limitation as a raw `p role="note"`. Opening Export adds the same limitation again in a separate menu paragraph at [PDF header:574](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:574>), using the [shared limitation text](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/pdf-export.ts:10>). This leaves both wave A's shared-Alert requirement and wave B's single-message requirement unfinished.

The PDF item **is correctly disabled and described** at [PDF header:553](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:553>); this is not a claim that an unavailable paid export is enabled or that the existing description is missing.

**Minimal owner change:** render one shared `Alert`/`AlertDescription` containing the limitation text, put the stable description ID on that persistent message, retain the disabled item's `aria-describedby`, and remove the repeated menu paragraph. Do not weaken the export guard or imply PDF export succeeded. The focused test failed before opening the menu because it could not find the expected shared warning ([test:78](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:78)).

### 2. Open template is still available only through overflow

**Priority: P2, assigned action-discoverability follow-up.**

[PDF header:614](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:614>) places `Open template` only inside the More PDF template actions menu; there is no directly discoverable header button. The new [toolbar-action regression test:118](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:118) confirms this: no button named `Open template` exists with the menu closed.

**Minimal owner change:** expose a shared header `Button` named `Open template`, wired to the existing `onLoadTemplate` callback; remove the redundant overflow entry. Check narrow toolbar fit when authorized browser evidence is captured. The existing overflow action itself is not proven keyboard-inaccessible; the verified gap is the requested direct action.

## Validation follow-up, not a product defect

The Automations empty-state test at [test:176](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:176) still requires the exact substring `rules can’t be edited here`. Current [page copy:221](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:221>) truthfully says `Rules are managed by the platform and can’t be edited here.` Consequently this test is red, although the intended store/editability disclosure is present.

**Minimal owner change:** reconcile the assertion with the intended platform-managed/no-editor wording. Preserve the actual capability assertion; do not restore the misleading Support automation link just to satisfy old expectations. This is a verified source/test wording mismatch, not evidence of broken rule management.

## Checks satisfied in the observed source

- **Board Move action:** the menu is in the metadata footer ([BoardCard:303](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/BoardCard.tsx:303)), beside the avatar rather than in a separate row. Its named shared button ([BoardCard:318](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/BoardCard.tsx:318)) is outside the native conversation-selection button; the wrapper is above the stretched selection hit area. Menu activation calls the requested status callback, not conversation selection ([test:93](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx:93)). The board shares real move handling, including the snooze dialog, at [SupportBoardView:114](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/SupportBoardView.tsx:114).
- **Role-aware agent notice:** [notice:23](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/alerts/SupportAgentSetupNotice.tsx:23) uses server-provided access, waits for agent/access reads, and provides a named dismissal button. Admins receive an agent-settings link and an explicit warning that adding agents is not available here ([notice:44](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/alerts/SupportAgentSetupNotice.tsx:44)); non-admins receive the support-admin handoff. It precedes the stats rather than splitting toolbar and board ([SupportInbox:195](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInbox.tsx:195)). The destination is an honest read-only collaborator review, not a claimed agent-creation flow.
- **Time semantics:** [RelativeTime:35](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/RelativeTime.tsx:35) uses native `time`, `dateTime` and a tooltip title without the prohibited `aria-label`; invalid dates fall back to text at [RelativeTime:18](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/RelativeTime.tsx:18). Both targeted relative-time tests pass.
- **Automations store truth:** the remaining header link is to workflow runs ([page:205](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:205>)), not Support inbox rules. The platform-managed/capped-window note sits below the KPIs ([page:220](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:220>)). The listed rules actually come from tenant-filtered `mission_control_automation_rules` ([store:193](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/mission-control-automations/store.ts:193)); Support uses the distinct `support_automation_rules` store ([adapter:1253](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/support-hub/adapter/supabase.ts:1253)).
- **Moderation wording/state truth:** [status mapping:55](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/content-moderation-page-client.tsx:55>) and shared badges at [post card:262](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/content-moderation-page-client.tsx:262>) replace raw machine labels, including `Waiting for review`, `Prayer request` and `Partners only`. Dates use `useLocaleFormat` ([post card:277](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/content-moderation-page-client.tsx:277>)). Unconnected moderation actions remain explicitly read-only ([page:317](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/content-moderation-page-client.tsx:317>)). All eight moderation UI tests pass.
- **Workflow duplicate removed:** the final page renders KPIs followed by the runs table ([page:127](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/workflows/page-client.tsx:127>), [page:151](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/workflows/page-client.tsx:151>)), without the redundant outcome chart. The scope note still says latest up to 50 runs, before filters, not all history ([page:98](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/workflows/page-client.tsx:98>)). Removal is an allowed resolution; no categorical outcome distribution is being presented as a time trend. All five workflow-page tests pass. The earlier chart observed during review is not carried forward as an open finding.

## Permission and tenant contract check

Removing the moderation shell-identity prerequisite is justified **for these server-authorized reads**, not as a general recommendation to remove identity/permission checks.

- [Identity/access spec:16](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/openspec/specs/identity-and-access/spec.md:16) and [spec:57](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/openspec/specs/identity-and-access/spec.md:57) place identity/tenant/capability enforcement on the server. The client hook now requests with same-origin credentials and cancellation, partitions query keys by shell tenant/user/role, and does not require shell identity to enable the reads ([hook:41](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/use-moderation-feed.ts:41>), [hook:56](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/use-moderation-feed.ts:56>)).
- Posts still call `getAuthContext`/`requireRole` for staff/admin/super-admin ([API:18](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/posts/index.ts:18)); the list and summary counts are tenant-filtered ([API:39](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/posts/index.ts:39), [API:72](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/posts/index.ts:72)). Comments retain the same role gate ([API:18](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/comments/index.ts:18)), tenant-filtered parent-post join ([API:32](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/comments/index.ts:32)) and tenant-filtered author lookup ([API:73](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/comments/index.ts:73)).
- Support access still requires authenticated user and tenant plus an allowed role; `canManageAll` is derived from admin/super-admin roles, and handlers bind the authenticated tenant ([route helper:33](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/support-hub/route-helpers.ts:33), [route helper:60](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/support-hub/route-helpers.ts:60), [route helper:73](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/support-hub/route-helpers.ts:73)). An absent agent record is not used as an authorization grant.
- Targeted tests cover unresolved shell identity, tenant-cache change, scoped author lookup, exact multi-status counts, and failed-count handling. API tests mock authentication/database seams; these results do **not** independently prove live session validation, deployed RLS, or every tenant-switch race.

## Exact targeted command and results

Working directory: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.

```powershell
bun run test:unit --no-coverage --maxWorkers=1 --configLoader=runner --no-cache tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx tests/unit/apps/admin/features/support-hub/components/agent-setup-notice.test.tsx tests/unit/apps/admin/features/support-hub/components/inbox-refinements.test.tsx tests/unit/apps/admin/app/automations-page.test.tsx tests/unit/apps/admin/app/feed/moderation-real-readonly.test.tsx tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx tests/unit/apps/admin/app/pdf/pdf-export.test.ts tests/unit/apps/admin/app/workflows-page.test.tsx tests/unit/packages/api/admin-moderation-reads.test.ts tests/unit/packages/api/admin/support-hub/route-helpers.test.ts
```

**Exit 1.** Bun version guard passed (`bun@1.4.3`); Vitest `5.0.5`. Start 21:43:25; duration 47.30 seconds. **10 files: 8 passed, 2 failed. 85 tests: 82 passed, 3 failed.** One run only; no retry loop or application/test repairs.

| Focused suite                   | Passed / total |
| ------------------------------- | -------------: |
| Board card                      |          8 / 8 |
| Agent setup notice              |          3 / 3 |
| Inbox/relative-time refinements |          2 / 2 |
| Automations page                |        31 / 32 |
| Moderation UI                   |          8 / 8 |
| PDF header/export menu          |          2 / 4 |
| PDF export behavior             |          9 / 9 |
| Workflow runs page              |          5 / 5 |
| Moderation API reads            |          5 / 5 |
| Support access/route helpers    |          9 / 9 |

Exact failing cases:

1. Automations: `renders an honest empty state when no automation rules exist` — expected substring `rules can’t be edited here`; received `Rules are managed by the platform and can’t be edited here. Run and failure counts cover up to 1,000 most recent logged runs in the last 24 hours. Busy periods may be incomplete.`
2. PDF header: `warns before export in free mode that no PDF can be made` — could not find `/Free mode can't make PDFs/` before opening the menu; the helper expects a shared Alert.
3. PDF header: `opens saved templates directly from the toolbar` — could not find a button named `Open template` with the menu closed.

## Limits and minimal handoff

Fix the two PDF presentation/action gaps and reconcile the Automations assertion; preserve the server gates, distinct rule stores, disabled PDF guard and honest read-only notices. No additional backend changes are justified by this audit.

The board test exercises menu activation and non-nesting, not a real browser Tab/arrow/Escape sequence or focus restoration after moving a card between columns. No browser, screen-reader, contrast, zoom/reflow, touch-target geometry or responsive-toolbar verification was performed. No lint, full typecheck/build, broad test gate, production/API call or final visual comparison was run. These are assurance limits, not promoted speculative defects. Later builder edits require their own bounded verification.

## Report-only formatting check

Command: `node ./node_modules/prettier/bin/prettier.cjs --check docs/qa/admin-workspaces-hillclimb/review/round13/max/support-tools-review.md`.

Initial check: exit 1 (Markdown link/table normalization). Formatting was corrected via `apply_patch` only in this report. Final check: exit 0.

# Independent round13r2 React Doctor ledger review

**Recommendations only. Not current approval, product acceptance, a strict pass, or authorization to apply the patch. The canonical ledger remains untouched and invalid.**

Review date: November 12, 2026, Asia/Bangkok. Command receipts use UTC. Checkout: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` only. All authored files are new reports/structured decisions under `docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review`.

## Results

- Seven rebindings: **7 accept recommendations**, 0 reject, 0 hold. Each exact `unused-export` consumer seam is independently justified below, not its other behavior or findings.
- Forty-one retirements: **41 accept removal-only recommendations**, 0 reject, 0 remaining retirement unknowns. Every old site, current replacement and relevant consumer/shared contract was separately examined; no waiver is transferred.
- **195 other stale records remain unqualified holds and untouched**. No blanket ratification, evidence rehash or new qualification is given to them. The 40 old mechanically exact records are not newly semantically approved either.
- New current approvals, ledger operations applied, product fixes and tests executed: **0**. The original strict failure persists. The hypothetical partial ledger still fails canonical validation on contribution-detail-sheet evidence.

Complete identities, record hashes, evidence hashes, conditions and excluded holds: [decisions.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review/decisions.json:1). Report-only exact operations: [proposed-ledger.patch.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review/proposed-ledger.patch.json:1). Exact final command/results and structural/preservation checks: [verification.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review/verification.json:1).

## Binding and evidence method

The existing read-only `read-binding.mjs` was inspected and executed live before source adjudication; saved parent proof was not substituted. Initial observed receipt: [binding-before.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review/binding-before.json:1). Final live receipt: [binding-after.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review/binding-after.json:1).

- Checkpoint `round13r2`; pinned base `8368004b339384eb98129a086ca71b7db88534ed`.
- Manifest: `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0` (1,038 entries including deletions).
- Frozen diff: `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b`.
- Full source-inventory digest: `a4b92ea2ba382845a752f0b64094632b40c6f8a4f35c370dabd7a8bb522e6cc3` (2,379 files).
- Whole canonical ledger: `16a0c7614cfc967c2c1a30a2133bfd17fc7b1dfe5588853136dd4d66a1914f62`; config: `9593037aa41b52d104aeea055158d7046dc23cfe6b202ce74fa22e0423b54f98`.
- The helper validates 158 controls. All 133 fresh-evidence files were independently inventoried initially; complete tree digest: `85dbbcfe7b75e70a9c48b11a194d8cda80eed97232289a5f69c5d090aedc8463`. Final verification checks complete additions/deletions/content against that observation.

Read applicable root/admin/missionary/shared-UI/script instructions, requested React Doctor skill and guide, source/tests/configuration, and canonical diagnostic/exception validation. No nested AGENTS.md applies under the output directory. Governing exception policy: [docs/guides/development/react-doctor.md:37](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/guides/development/react-doctor.md:37). No product/test/harness/ledger/config/manifest/Git edits, browser/server/provider/listener operations or agent children were performed.

Complete owner/test sources were read and independently parsed. Runtime imports were resolved to actual r12 owner files; static versus type-only imports, namespace assignments, awaited destructuring, JSX binding use and owner-versus-dependency mocks were checked. Root Vitest include/setup and per-importer/workspace alias contracts were examined so relative consumers are not mistaken for substituted owners. Repository-wide symbol searches found the extra real governance-confirmation suite and a source-text-only complexity test; the latter was not counted as runtime proof. Tests were not executed.

Canonical rechecks parse all eight strict and eight raw retained target protocols, validate complete/no-skipped/project identity/counts and equality with stored scans. Results: 669 applicable, 11,452 raw, and exact full-identity parity after excluding only obsolete `react-in-jsx-scope`. All seven proposed replacements pass exact source/context/evidence and isolated canonical single-record checks. These are mechanical checks, not combined-ledger acceptance.

For each retirement, both the exact historical identity and its same-target/file/plugin/rule/message/severity group have zero matches in both complete retained inventories. The current whole owning modules and relevant consumer/shared contracts were then inspected; absence was not promoted to a functional-fix claim. Read-only pinned-base blobs match old whole-file ledger hashes for 29 retirement records; seven organization-updates and five PersonnelProfile records differ, so those base references are explicitly contextual, not exact historical source proof.

## Distinctions that matter

- Retirement 3: replacement grid still has index-dependent idless `getRowId`; **stable identity is not proven fixed**. [apps/admin/app/(app)/automations/rules-grid.tsx:368](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/rules-grid.tsx:368>).
- Skeleton retains `animate-pulse` ([packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7)) with a global source-only baseline ([packages/ui/styles/globals.css:372](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:372)). Spinner uses `spinner-essential` ([packages/ui/components/shadcn/spinner.tsx:10](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/spinner.tsx:10)), and CSS intentionally preserves 1.5-second infinite rotation under reduced motion ([packages/ui/styles/globals.css:387](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:387)). **No shared/global/essential-motion waiver or motion-elimination certification follows.**
- Form retirements 80/81 and 276-279: callback forwarding changes scanner visibility, not progressive enhancement. Current callbacks still prevent default before pending guards; the actual shared frame forwards directly to native form ([apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77)). Installed TanStack 1.33.5 adapter/core take submit metadata, not a browser event. No server-action, no-JavaScript or authenticated-flow pass is claimed.
- Export retirements 17/275: named composer exports actually disappeared; their old evidence file now imports only the default unavailable route ([tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4)). Rehashing that file would not renew the old named-consumer rationale.
- Rebinding 137 has unchanged diagnostic identity and refreshed stale source/evidence; the type-only import alone is insufficient. Separate runtime import/assignment/renders qualify it, but mocked motion/dropdown dependencies do not qualify those behaviors.

## Seven rebindings — individual decisions

### Rebinding 0: EveModelPolicyReadiness — accept recommendation

The real EveModelPolicyAdminView renderer is statically imported as a value, not a type. The existing external test constructs an active model policy with passing checks and a reviewer override, renders the actual export, and asserts eval/subagent output. The complete test has no owner mock. This is genuine out-of-target runtime use, not a fabricated or source-text-only consumer.

- [apps/admin/app/(app)/admin/eve/model-policy-panel.tsx:134](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/eve/model-policy-panel.tsx:134>) — Actual exported readiness view.
- [tests/unit/apps/admin/app/eve-operations-workspace.test.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/eve-operations-workspace.test.tsx:7) — Static actual value import.
- [tests/unit/apps/admin/app/eve-operations-workspace.test.tsx:127](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/eve-operations-workspace.test.tsx:127) — Policy fixture, render at 158 and real UI assertions.

**Reconsider:** Reconsider if tests/unit/apps/admin/app/eve-operations-workspace.test.tsx stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph. Requalify rather than just rehash if the source, test, runtime binding, mock boundary, harness resolution, current diagnostic or whole-ledger binding changes before authorized application.
**Limits:** Tests read and independently parsed, not executed. No live financial, authorization, governance/provider, motion/menu, native browser or accessibility certification. Only the exact unused-export reachability claim is qualified.

### Rebinding 1: EveGovernanceView — accept recommendation

beforeAll runtime-imports the real page-client and assigns pageClient.EveGovernanceView before JSX renders it. Complete tests contain no owning-module mock and exercise loading, fail-closed/missing state, pending disabled controls, audit output and confirmation callbacks. The additional confirmation-stability suite also consumes this actual export. No governance/backend exception is inferred.

- [apps/admin/app/(app)/admin/eve/page-client.tsx:681](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/eve/page-client.tsx:681>) — Actual governance view contract.
- [tests/unit/apps/admin/app/eve-governance-page.test.tsx:27](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/eve-governance-page.test.tsx:27) — Actual runtime import and assignment in beforeAll.
- [tests/unit/apps/admin/app/eve-governance-page.test.tsx:73](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/eve-governance-page.test.tsx:73) — Pending control assertions.
- [tests/unit/apps/admin/app/eve-governance-page.test.tsx:241](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/eve-governance-page.test.tsx:241) — Confirmation behavior source assertions.

**Reconsider:** Reconsider if tests/unit/apps/admin/app/eve-governance-page.test.tsx stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph. Requalify rather than just rehash if the source, test, runtime binding, mock boundary, harness resolution, current diagnostic or whole-ledger binding changes before authorized application.
**Limits:** Tests read and independently parsed, not executed. No live financial, authorization, governance/provider, motion/menu, native browser or accessibility certification. Only the exact unused-export reachability claim is qualified.

### Rebinding 4: AutomationsPageView — accept recommendation

beforeEach imports the actual page-client and assigns pageClient.AutomationsPageView, then real renders assert persisted-shaped summary/rules, loading/error/empty state, search, failing-only filtering and grid behavior. Only the database hook is mocked, not the page or view. Its maintained external test seam is outside the target-local import graph.

- [apps/admin/app/(app)/automations/page-client.tsx:158](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:158>) — Actual exported automation view.
- [tests/unit/apps/admin/app/automations-page.test.tsx:14](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:14) — Dependency-only database-hook mock.
- [tests/unit/apps/admin/app/automations-page.test.tsx:121](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:121) — Actual runtime import and assignment.
- [tests/unit/apps/admin/app/automations-page.test.tsx:137](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:137) — Actual view loading-state assertions.
- [tests/unit/apps/admin/app/automations-page.test.tsx:655](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:655) — Failing-rule interaction assertions.

**Reconsider:** Reconsider if tests/unit/apps/admin/app/automations-page.test.tsx stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph. Requalify rather than just rehash if the source, test, runtime binding, mock boundary, harness resolution, current diagnostic or whole-ledger binding changes before authorized application.
**Limits:** Tests read and independently parsed, not executed. No live financial, authorization, governance/provider, motion/menu, native browser or accessibility certification. Only the exact unused-export reachability claim is qualified.

### Rebinding 24: ReportsPageView — accept recommendation

The test dynamically imports the real page-client and assigns its ReportsPageView export. Only the report-hook boundary is partially mocked. Concrete capped/incomplete response and failed-read assertions depend on the real view, so this is a runtime consumer rather than a mocked owner or a type-only reference. No financial/report-integration correctness is certified.

- [apps/admin/app/(app)/reports/page-client.tsx:156](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:156>) — Actual view/completeness contract.
- [tests/unit/apps/admin/app/reports-page.test.tsx:30](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:30) — Report-hook-only partial mock.
- [tests/unit/apps/admin/app/reports-page.test.tsx:171](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:171) — Runtime import and assignment.
- [tests/unit/apps/admin/app/reports-page.test.tsx:189](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:189) — Actual incomplete and failed response renders/assertions.

**Reconsider:** Reconsider if tests/unit/apps/admin/app/reports-page.test.tsx stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph. Requalify rather than just rehash if the source, test, runtime binding, mock boundary, harness resolution, current diagnostic or whole-ledger binding changes before authorized application.
**Limits:** Tests read and independently parsed, not executed. No live financial, authorization, governance/provider, motion/menu, native browser or accessibility certification. Only the exact unused-export reachability claim is qualified.

### Rebinding 137: PostComposerActions — accept recommendation

The type-only import at test line 14 would not suffice. Independently, beforeAll imports the actual worker-feed module at 103, assigns its PostComposerActions value at 104, and real JSX renders assert pending initiator focus, peer disabling and callback deduplication. Motion, next/dynamic and dropdown dependencies are mocked, not the owner. The exact diagnostic identity is unchanged; this refreshes stale source/evidence, not a line-move waiver.

- [apps/missionary/app/feed/worker-feed-page-client.tsx:692](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/missionary/app/feed/worker-feed-page-client.tsx:692) — Actual exported pending-action handler.
- [tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx:14](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx:14) — Type-only import is not the runtime proof.
- [tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx:101](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx:101) — Actual runtime import and assignment.
- [tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx:135](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx:135) — Real pending-action renders and assertions.

**Reconsider:** Reconsider if tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph. Requalify rather than just rehash if the source, test, runtime binding, mock boundary, harness resolution, current diagnostic or whole-ledger binding changes before authorized application.
**Limits:** Tests read and independently parsed, not executed. No live financial, authorization, governance/provider, motion/menu, native browser or accessibility certification. Only the exact unused-export reachability claim is qualified.

### Rebinding 273: CrmViewToolbar — accept recommendation

Both async tests directly destructure the named value from an awaited runtime import of the exact page-client path. Real renders check pressed state, the kanban callback, refusal to deselect the active view, link hrefs and a visible tooltip. The whole consumer has no owning-module mock; the destructured import is a real value binding, not unassigned namespace/type usage.

- [apps/admin/app/(app)/crm/page-client.tsx:499](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/page-client.tsx:499>) — Actual controlled view toolbar.
- [tests/unit/apps/admin/app/crm-view-toolbar.test.tsx:8](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/crm-view-toolbar.test.tsx:8) — First actual awaited destructured import and real assertions.
- [tests/unit/apps/admin/app/crm-view-toolbar.test.tsx:34](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/crm-view-toolbar.test.tsx:34) — Second actual import and tooltip assertions.

**Reconsider:** Reconsider if tests/unit/apps/admin/app/crm-view-toolbar.test.tsx stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph. Requalify rather than just rehash if the source, test, runtime binding, mock boundary, harness resolution, current diagnostic or whole-ledger binding changes before authorized application.
**Limits:** Tests read and independently parsed, not executed. No live financial, authorization, governance/provider, motion/menu, native browser or accessibility certification. Only the exact unused-export reachability claim is qualified.

### Rebinding 274: CrmRelationshipsFilters — accept recommendation

The async test directly destructures CrmRelationshipsFilters from the awaited owning-module import, renders that binding with its current controlled props and asserts domain toggle, reset and search callbacks. The actual shared search/buttons remain in use and no module mock substitutes the owner. This independently qualifies the external runtime seam.

- [apps/admin/app/(app)/crm/relationships/page-client.tsx:268](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/relationships/page-client.tsx:268>) — Actual controlled search/domain filters.
- [tests/unit/apps/admin/app/relationship-filter-selection.test.tsx:8](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/relationship-filter-selection.test.tsx:8) — Actual awaited import, JSX and callback assertions.

**Reconsider:** Reconsider if tests/unit/apps/admin/app/relationship-filter-selection.test.tsx stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph. Requalify rather than just rehash if the source, test, runtime binding, mock boundary, harness resolution, current diagnostic or whole-ledger binding changes before authorized application.
**Limits:** Tests read and independently parsed, not executed. No live financial, authorization, governance/provider, motion/menu, native browser or accessibility certification. Only the exact unused-export reachability claim is qualified.

## Forty-one retirements — individual decisions

For each item, accept means recommend deleting only the exact absent historical record. Original index/line are navigation, not matching authority. Previous full identities and record hashes are retained in decisions.json and full-old-record test guards in the patch. No current finding is newly waived. All cited tests are source evidence, not run results.

### Retirement 2: react-doctor/jsx-props-no-spreading — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/automations/page-client.tsx:191`.
The old propsHeroEntrance spread on a mapped motion/stat wrapper is absent. The complete current automation page imports neither motion nor that factory: it composes MetricCard/MetricGrid with explicit props and still renders the real exported view. Retirement does not grant a new motion-factory or prop-forwarding exception.

- [apps/admin/app/(app)/automations/page-client.tsx:71](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:71>) — Actual explicit metric composition.
- [apps/admin/app/(app)/automations/page-client.tsx:196](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:196>) — Current PageShell/stats/grid owner.
- [tests/unit/apps/admin/app/automations-page.test.tsx:265](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:265) — Real view summary/rule assertions.

**Reconsider:** Review any restored spread against the actual factory, preference input and consumer; do not revive this waiver by message.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 3: react-doctor/no-array-index-as-key — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/automations/page-client.tsx:350`.
The historical AutomationRuleRow JSX key no longer exists; the page delegates to AutomationRulesGrid. That grid still uses rule.id ?? `${rule.name}-${index}` in getRowId. Deleting the old location is justified, but it is NOT proof that positional identity or idless reordering was fixed.

- [apps/admin/app/(app)/automations/page-client.tsx:234](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:234>) — Current filtered-rules grid consumer.
- [apps/admin/app/(app)/automations/rules-grid.tsx:368](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/rules-grid.tsx:368>) — The still-positional idless fallback is explicit.
- [tests/unit/apps/admin/app/automations-page.test.tsx:880](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:880) — Real sorting assertions, not coverage of all idless permutations.

**Reconsider:** If idless rows reorder or gain state/inputs, review the real identity contract and focused behavior tests. Any new finding needs a fresh identity.
**Limits:** The moved fallback remains a visible contract risk; no new waiver or reordered-row safety certification.

### Retirement 5: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx:299`.
The old contribution-loading LoaderCircle animate-spin is replaced by a real status-bearing ContributionDetailLoadingState with shared Skeleton placeholders. Motion moved to the primitive/global stylesheet, not necessarily out of the UI. All other detail-sheet findings remain untouched.

- [apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx:423](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx:423>) — Real loading status and Skeleton tree.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Shared primitive retains animate-pulse.
- [packages/ui/styles/globals.css:372](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:372) — Source-only reduced-motion baseline.
- [tests/unit/apps/admin/app/contribution-detail-sheet.test.tsx:118](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contribution-detail-sheet.test.tsx:118) — Actual sheet loading/status assertions.

**Reconsider:** Re-evaluate a restored local spinner or changed Skeleton/CSS consumption; do not turn retirement into a global motion waiver.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 7: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/contributions/correction-approval-panel.tsx:312`.
The old free-standing Submitting decision LoaderCircle is absent. Pending decisions keep both buttons mounted, announce status and render shared Spinner in the initiator. Spinner uses spinner-essential; CSS deliberately keeps it rotating at 1.5s under reduced motion. Removal is valid, but neither motion elimination nor the old global-motion rationale transfers.

- [apps/admin/app/(app)/contributions/correction-approval-panel.tsx:410](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/correction-approval-panel.tsx:410>) — Real status and pending initiator buttons.
- [packages/ui/components/shadcn/spinner.tsx:10](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/spinner.tsx:10) — Shared essential-status class.
- [packages/ui/styles/globals.css:387](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:387) — Explicit infinite reduced-motion exemption.
- [tests/unit/apps/admin/app/correction-approval-panel.test.tsx:163](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/correction-approval-panel.test.tsx:163) — Real pending focus/status/dedup assertions with synthetic fetch.

**Reconsider:** A future motion exception must qualify the essential-status exemption and actual reduced-motion behavior separately.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 9: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/contributions/operation-shell.tsx:1434`.
The historical free-standing Submitting LoaderCircle is gone. The footer now has a live text announcement plus shared Spinner in its guarded initiating button. Financial availability, stale-draft, validation and pending behavior remain owned by the shell, not qualified by deleting this old animation waiver.

- [apps/admin/app/(app)/contributions/operation-shell.tsx:997](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx:997>) — Current live submitting text.
- [apps/admin/app/(app)/contributions/operation-shell.tsx:1025](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx:1025>) — Actual validation/pending guards and shared Spinner.
- [packages/ui/components/shadcn/spinner.tsx:10](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/spinner.tsx:10) — Motion now owned by the essential spinner.
- [packages/ui/styles/globals.css:387](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:387) — Essential reduced-motion animation is retained.
- [tests/unit/apps/admin/app/contribution-operation-shell.test.tsx:381](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contribution-operation-shell.test.tsx:381) — Actual shell contract source with synthetic requests.

**Reconsider:** Review replacement motion findings separately; preserve financial/stale-response/pending tests before behavior changes.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 13: react-doctor/no-symmetric-text-button-padding — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/crm/page-client.tsx:625`.
The old equal-padding full-card native button is absent from the page. CrmResultsSection delegates to KanbanView; the current card has p-3 on a non-button li, while its stretched name button has no symmetric padding. No exception transfers to this card or its current prop spread.

- [apps/admin/app/(app)/crm/page-client.tsx:581](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/page-client.tsx:581>) — Current table/kanban callback consumers.
- [apps/admin/app/(app)/crm/kanban-view.tsx:223](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/kanban-view.tsx:223>) — Actual li padding and native name-button layout.

**Reconsider:** Recheck any changed button/card ownership and keyboard/selection contract as a fresh location, not by page path.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 14: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/events/page-client.tsx:685`.
The old events chart pulse and chart path have been removed. The entire current EventsPage is an explicit unavailable-connection disclosure with a real CRM link. Its existing test imports the actual default route and expects no fake attendee/export controls. This does not certify an events integration.

- [apps/admin/app/(app)/events/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/events/page-client.tsx:14>) — Complete unavailable route replacement.
- [tests/unit/apps/admin/app/events/events-venues-tab.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/events/events-venues-tab.test.tsx:4) — Actual default consumer and no-fake-controls assertions.

**Reconsider:** If events/chart loading returns, inspect its real data and motion contract as a new finding.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 15: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/feed/org-updates/page-client.tsx:99`.
The historical lazy-editor loading pulse is absent because the current organization-updates route no longer has a composer, editor, upload, save or publish mutation path. It renders an honest unavailable-publishing surface and working moderation/website-update alternatives. The current real test checks that replacement, not the retired motion behavior.

- [apps/admin/app/(app)/feed/org-updates/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx:14>) — Complete replacement has no composer or animation classes.
- [tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4) — Actual route/no-Publish/navigation assertions.

**Reconsider:** If organization publishing or the lazy-editor loading pulse returns, qualify actual provider availability and motion behavior rather than reviving this record.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 16: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/feed/org-updates/page-client.tsx:361`.
The historical saving spinner is absent because the current organization-updates route no longer has a composer, editor, upload, save or publish mutation path. It renders an honest unavailable-publishing surface and working moderation/website-update alternatives. The current real test checks that replacement, not the retired motion behavior.

- [apps/admin/app/(app)/feed/org-updates/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx:14>) — Complete replacement has no composer or animation classes.
- [tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4) — Actual route/no-Publish/navigation assertions.

**Reconsider:** If organization publishing or the saving spinner returns, qualify actual provider availability and motion behavior rather than reviving this record.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 17: react-doctor/unused-export — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/feed/org-updates/page-client.tsx:737`.
The actual ComposeCardActions export is gone from current apps/packages/tests/scripts. Its former evidence test now imports and renders only the default OrgUpdates unavailable route, not this named export. Therefore the old real-consumer rationale is invalid, not something to rehash into a new waiver. Delete only this absent record.

- [apps/admin/app/(app)/feed/org-updates/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx:14>) — Only the default unavailable route remains.
- [tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4) — Former evidence now uses only the default route.

**Reconsider:** If ComposeCardActions or a new test seam returns, independently inspect the exact owner, real runtime consumer and mocks against the new diagnostic.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 18: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/feed/org-updates/page-client.tsx:871`.
The historical draft-action spinner is absent because the current organization-updates route no longer has a composer, editor, upload, save or publish mutation path. It renders an honest unavailable-publishing surface and working moderation/website-update alternatives. The current real test checks that replacement, not the retired motion behavior.

- [apps/admin/app/(app)/feed/org-updates/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx:14>) — Complete replacement has no composer or animation classes.
- [tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4) — Actual route/no-Publish/navigation assertions.

**Reconsider:** If organization publishing or the draft-action spinner returns, qualify actual provider availability and motion behavior rather than reviving this record.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 19: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/feed/org-updates/page-client.tsx:888`.
The historical publish-action spinner is absent because the current organization-updates route no longer has a composer, editor, upload, save or publish mutation path. It renders an honest unavailable-publishing surface and working moderation/website-update alternatives. The current real test checks that replacement, not the retired motion behavior.

- [apps/admin/app/(app)/feed/org-updates/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx:14>) — Complete replacement has no composer or animation classes.
- [tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4) — Actual route/no-Publish/navigation assertions.

**Reconsider:** If organization publishing or the publish-action spinner returns, qualify actual provider availability and motion behavior rather than reviving this record.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 20: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/feed/org-updates/page-client.tsx:817`.
The historical media-upload spinner is absent because the current organization-updates route no longer has a composer, editor, upload, save or publish mutation path. It renders an honest unavailable-publishing surface and working moderation/website-update alternatives. The current real test checks that replacement, not the retired motion behavior.

- [apps/admin/app/(app)/feed/org-updates/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx:14>) — Complete replacement has no composer or animation classes.
- [tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4) — Actual route/no-Publish/navigation assertions.

**Reconsider:** If organization publishing or the media-upload spinner returns, qualify actual provider availability and motion behavior rather than reviving this record.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 22: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/pdf/page-client.tsx:943`.
The old templates-list local animate-spin placeholder is removed. The real TemplatesList renders Loading templates status with shared Skeleton rows. Other PDF operations use shared Spinner; the separate export span explicitly uses motion-safe:animate-spin. No current PDF export/layout/dependency warning is waived by this retirement.

- [apps/admin/app/(app)/pdf/page-client.tsx:1039](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:1039>) — Current named status and Skeleton rows.
- [apps/admin/app/(app)/pdf/page-client.tsx:565](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:565>) — Separate local export spinner is motion-safe gated.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Template pulse is now shared ownership.
- [packages/ui/styles/globals.css:372](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:372) — Shared CSS baseline, source only.

**Reconsider:** Review any restored templates spinner or changed Skeleton policy separately; no PDF export or motion certification.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 30: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:5`.
The old h-14 w-72 heading pulse was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the h-14 w-72 heading pulse or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 31: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:6`.
The old h-4 descriptive-line pulse was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the h-4 descriptive-line pulse or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 32: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:11`.
The old h-4 w-52 notice-heading pulse was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the h-4 w-52 notice-heading pulse or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 33: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:12`.
The old h-5 notice-body pulse was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the h-5 notice-body pulse or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 34: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:17`.
The old six h-28 metric pulses was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the six h-28 metric pulses or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 35: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:27`.
The old five h-20 conversation-row pulses was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the five h-20 conversation-row pulses or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 36: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:33`.
The old h-96 main-panel pulse was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the h-96 main-panel pulse or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 37: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:35`.
The old h-64 side-panel pulse was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the h-64 side-panel pulse or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 38: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/loading.tsx:36`.
The old h-48 side-panel pulse was in a nine-site route-local loading tree which no longer exists. The entire current loading route delegates to SupportWorkspaceShell and the real SupportInboxSkeleton, with four metrics and a status/toolbar/body layout using shared Skeleton. No one-to-one geometry equivalence or inherited nine-location waiver is asserted.

- [apps/admin/app/(app)/support/loading.tsx:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/loading.tsx:1>) — Complete route delegates loading ownership.
- [apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx:9) — Actual four-metric status-bearing replacement.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse literal remains shared.
- [tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/support/support-page-chrome.test.ts:24) — Current structural geometry assertions, not runtime motion.

**Reconsider:** If the h-48 side-panel pulse or any other local pulse returns, adjudicate its new exact identity; shared Skeleton/CSS still needs separate motion review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 39: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/reports/loading.tsx:6`.
The old support-report h-64 animate-pulse div is gone. SupportReportsLoading renders the real workspace shell, named status, four metric Skeletons and two chart Skeletons. This is shared-loading composition, not disappearance of all pulse animation.

- [apps/admin/app/(app)/support/reports/loading.tsx:4](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/reports/loading.tsx:4>) — Complete current loading composition.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Shared pulse ownership.
- [packages/ui/styles/globals.css:372](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:372) — Global motion baseline source.

**Reconsider:** Review restored route-local pulses or changed shared motion/status contracts independently.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 40: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/support/settings/loading.tsx:6`.
The old settings h-64 animate-pulse div is gone. SupportSettingsLoading now renders a status-labelled Card and three real shared Skeleton children. The route-local class has no current diagnostic; no blanket shared-motion approval follows.

- [apps/admin/app/(app)/support/settings/loading.tsx:4](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/support/settings/loading.tsx:4>) — Current complete status-card loading tree.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Shared pulse remains.
- [packages/ui/styles/globals.css:372](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:372) — Source-only global motion policy.

**Reconsider:** Any restored settings animation or changed shared Skeleton/CSS policy requires fresh source/consumer review.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 49: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/mission-control/care/components/CareDashboard.tsx:178`.
The old animated urgent-alert dot is absent from the complete CareDashboard source. CareOverview derives crisis/at-risk counts from current personnel and renders a static metric and follow-up content. Removing a decorative pulse does not certify care classifications or permission-sensitive data.

- [apps/admin/features/mission-control/care/components/CareDashboard.tsx:305](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/CareDashboard.tsx:305) — Actual persisted-status-derived urgent count.
- [apps/admin/features/mission-control/care/components/CareDashboard.tsx:342](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/CareDashboard.tsx:342) — Current static crisis/at-risk metric.
- [tests/unit/apps/admin/features/mission-control/care/care-workspace.test.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/care-workspace.test.tsx:15) — Real CareOverview consumer; routing is mocked separately.

**Reconsider:** Review any restored care-alert pulse against its exact reduced-motion/data contract; do not waive other care behavior.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 50: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:167`.
The actual overview TabsContent panel remains, but its old local animate-in/fade-in classes are gone; none remain anywhere in the complete PersonnelProfile module. The real shared export resolves to the Base UI Panel wrapper with flex-1/outline-none defaults, not a renamed app-local animation. No privacy/tab-behavior waiver is inferred.

- [apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:312](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:312) — Current overview panel has no retired entry-animation class.
- [packages/ui/components/shadcn/tabs.ts:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs.ts:3) — Actual shared export resolves to tabs-component.
- [packages/ui/components/shadcn/tabs-component.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs-component.tsx:64) — Real Base UI Panel class/forwarding contract.
- [tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11) — Actual profile owner imported; hooks/editor dependencies are mocked.

**Reconsider:** If the overview panel gains a local/shared entry animation, review its fresh identity and reduced-motion behavior. Private-note permissions remain outside this retirement.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 51: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:356`.
The actual care-thread TabsContent panel remains, but its old local animate-in/fade-in classes are gone; none remain anywhere in the complete PersonnelProfile module. The real shared export resolves to the Base UI Panel wrapper with flex-1/outline-none defaults, not a renamed app-local animation. No privacy/tab-behavior waiver is inferred.

- [apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:399](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:399) — Current care-thread panel has no retired entry-animation class.
- [packages/ui/components/shadcn/tabs.ts:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs.ts:3) — Actual shared export resolves to tabs-component.
- [packages/ui/components/shadcn/tabs-component.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs-component.tsx:64) — Real Base UI Panel class/forwarding contract.
- [tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11) — Actual profile owner imported; hooks/editor dependencies are mocked.

**Reconsider:** If the care-thread panel gains a local/shared entry animation, review its fresh identity and reduced-motion behavior. Private-note permissions remain outside this retirement.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 52: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:446`.
The actual care-plan TabsContent panel remains, but its old local animate-in/fade-in classes are gone; none remain anywhere in the complete PersonnelProfile module. The real shared export resolves to the Base UI Panel wrapper with flex-1/outline-none defaults, not a renamed app-local animation. No privacy/tab-behavior waiver is inferred.

- [apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:621](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:621) — Current care-plan panel has no retired entry-animation class.
- [packages/ui/components/shadcn/tabs.ts:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs.ts:3) — Actual shared export resolves to tabs-component.
- [packages/ui/components/shadcn/tabs-component.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs-component.tsx:64) — Real Base UI Panel class/forwarding contract.
- [tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11) — Actual profile owner imported; hooks/editor dependencies are mocked.

**Reconsider:** If the care-plan panel gains a local/shared entry animation, review its fresh identity and reduced-motion behavior. Private-note permissions remain outside this retirement.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 53: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:540`.
The actual activity TabsContent panel remains, but its old local animate-in/fade-in classes are gone; none remain anywhere in the complete PersonnelProfile module. The real shared export resolves to the Base UI Panel wrapper with flex-1/outline-none defaults, not a renamed app-local animation. No privacy/tab-behavior waiver is inferred.

- [apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:819](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:819) — Current activity panel has no retired entry-animation class.
- [packages/ui/components/shadcn/tabs.ts:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs.ts:3) — Actual shared export resolves to tabs-component.
- [packages/ui/components/shadcn/tabs-component.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs-component.tsx:64) — Real Base UI Panel class/forwarding contract.
- [tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11) — Actual profile owner imported; hooks/editor dependencies are mocked.

**Reconsider:** If the activity panel gains a local/shared entry animation, review its fresh identity and reduced-motion behavior. Private-note permissions remain outside this retirement.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 54: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:605`.
The actual secure-notes TabsContent panel remains, but its old local animate-in/fade-in classes are gone; none remain anywhere in the complete PersonnelProfile module. The real shared export resolves to the Base UI Panel wrapper with flex-1/outline-none defaults, not a renamed app-local animation. No privacy/tab-behavior waiver is inferred.

- [apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:845](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx:845) — Current secure-notes panel has no retired entry-animation class.
- [packages/ui/components/shadcn/tabs.ts:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs.ts:3) — Actual shared export resolves to tabs-component.
- [packages/ui/components/shadcn/tabs-component.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs-component.tsx:64) — Real Base UI Panel class/forwarding contract.
- [tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/mission-control/care/personnel-profile.test.tsx:11) — Actual profile owner imported; hooks/editor dependencies are mocked.

**Reconsider:** If the secure-notes panel gains a local/shared entry animation, review its fresh identity and reduced-motion behavior. Private-note permissions remain outside this retirement.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 69: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/support-hub/components/reports/ReportBarChart.tsx:22`.
The old local animate-pulse chart placeholder is replaced by the actual named-status Fallback and shared Skeleton. Complete source wires that Fallback into next/dynamic lazy-module loading; data-query loading is separately owned by ChartCard. Real-chart tests check data/error/retry states, not reduced-motion behavior or a new Recharts exception.

- [apps/admin/features/support-hub/components/reports/ReportBarChart.tsx:21](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/reports/ReportBarChart.tsx:21) — Current real loading Fallback.
- [apps/admin/features/support-hub/components/reports/ReportBarChart.tsx:107](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/reports/ReportBarChart.tsx:107) — Actual lazy-module consumer of Fallback.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse now owned by shared Skeleton.
- [tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:5](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:5) — Actual bar/line imports, not owner mocks.
- [tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:55](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:55) — Real error/retry assertions, not motion verification.

**Reconsider:** If local chart fallback animation or shared/lazy-module ownership changes, qualify the new exact contract without transferring this waiver.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 70: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/support-hub/components/reports/ReportLineChart.tsx:23`.
The old local animate-pulse chart placeholder is replaced by the actual named-status Fallback and shared Skeleton. Complete source wires that Fallback into next/dynamic lazy-module loading; data-query loading is separately owned by ChartCard. Real-chart tests check data/error/retry states, not reduced-motion behavior or a new Recharts exception.

- [apps/admin/features/support-hub/components/reports/ReportLineChart.tsx:22](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/reports/ReportLineChart.tsx:22) — Current real loading Fallback.
- [apps/admin/features/support-hub/components/reports/ReportLineChart.tsx:159](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/reports/ReportLineChart.tsx:159) — Actual lazy-module consumer of Fallback.
- [packages/ui/components/shadcn/skeleton.tsx:7](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/skeleton.tsx:7) — Pulse now owned by shared Skeleton.
- [tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:5](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:5) — Actual bar/line imports, not owner mocks.
- [tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:55](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/report-chart-states.test.tsx:55) — Real error/retry assertions, not motion verification.

**Reconsider:** If local chart fallback animation or shared/lazy-module ownership changes, qualify the new exact contract without transferring this waiver.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 73: react-doctor/no-ungated-tailwind-animation — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:72`.
The old SettingsToolbar Loader2 animate-spin is gone. Its actual Save button now uses shared Spinner with focusableWhenDisabled; the separate status line owns Saving announcements and Spinner is aria-hidden. Real-toolbar tests assert focus/dedup and one status. Essential motion intentionally remains under reduced motion, so this is not a motion fix certification.

- [apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:42](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:42) — Persistent status owner.
- [apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:66](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:66) — Actual Save and hidden Spinner.
- [packages/ui/components/shadcn/spinner.tsx:10](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/spinner.tsx:10) — Shared essential-spinner class.
- [packages/ui/styles/globals.css:387](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:387) — Essential motion explicitly retained.
- [tests/unit/apps/admin/features/support-hub/components/settings-toolbar-focus.test.tsx:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/settings-toolbar-focus.test.tsx:11) — Actual owner pending-focus/dedup assertions.
- [tests/unit/apps/admin/features/support-hub/components/settings-toolbar-focus.test.tsx:40](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/features/support-hub/components/settings-toolbar-focus.test.tsx:40) — Single status announcement source assertions.

**Reconsider:** Any future spinner waiver needs its own essential-motion qualification; preserve initiator focus, dedup and status ownership.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 80: react-doctor/no-prevent-default — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx:189`.
The historical native form JSX moved into StudioFlowFrame. The actual missionary flow STILL calls e.preventDefault before the pending guard and form.handleSubmit; the real frame forwards that callback directly to native form onSubmit. Installed TanStack 1.33.5 handleSubmit accepts metadata, not a DOM event. Scanner absence reflects this forwarding boundary, NOT restored progressive enhancement or grounds for a new no-prevent-default waiver. Real create tests use mocked auth/routing/fetch and exercise conflict handling, not an authenticated no-JavaScript flow.

- [apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx:206](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx:206) — Actual preventDefault-before-guard/submit order.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51) — Actual FormEvent callback contract.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77) — Native form forwards that callback.
- [node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411) — Installed 1.33.5 handleSubmit metadata contract.
- [node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245) — Installed React adapter delegates to _handleSubmit.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:85](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:85) — Actual giving/project conflict handling source assertions.
- [apps/admin/src/cms/create-from-template-endpoint.ts:719](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/create-from-template-endpoint.ts:719) — Existing staff/body/tenant endpoint ownership, not executed.

**Reconsider:** Recheck missionary selection, form forwarding, explicit prevention, pending dedup, tenant checks and 409 paths if ownership/framework changes; do not revive this waiver.
**Limits:** No progressive-enhancement/server-action fix, authenticated tenant check or no-JavaScript success certification. Tests not run.

### Retirement 81: react-doctor/no-prevent-default — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx:179`.
The historical native form JSX moved into StudioFlowFrame. The actual fund flow STILL calls e.preventDefault before the pending guard and form.handleSubmit; the real frame forwards that callback directly to native form onSubmit. Installed TanStack 1.33.5 handleSubmit accepts metadata, not a DOM event. Scanner absence reflects this forwarding boundary, NOT restored progressive enhancement or grounds for a new no-prevent-default waiver. Real create tests use mocked auth/routing/fetch and exercise conflict handling, not an authenticated no-JavaScript flow.

- [apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx:195](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx:195) — Actual preventDefault-before-guard/submit order.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51) — Actual FormEvent callback contract.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77) — Native form forwards that callback.
- [node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411) — Installed 1.33.5 handleSubmit metadata contract.
- [node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245) — Installed React adapter delegates to _handleSubmit.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:85](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:85) — Actual giving/project conflict handling source assertions.
- [apps/admin/src/cms/create-from-template-endpoint.ts:719](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/create-from-template-endpoint.ts:719) — Existing staff/body/tenant endpoint ownership, not executed.

**Reconsider:** Recheck fund selection, form forwarding, explicit prevention, pending dedup, tenant checks and 409 paths if ownership/framework changes; do not revive this waiver.
**Limits:** No progressive-enhancement/server-action fix, authenticated tenant check or no-JavaScript success certification. Tests not run.

### Retirement 275: react-doctor/unused-export — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/app/(app)/feed/org-updates/page-client.tsx:698`.
The actual ComposeCardTypeSelector export is gone from current apps/packages/tests/scripts. Its former evidence test now imports and renders only the default OrgUpdates unavailable route, not this named export. Therefore the old real-consumer rationale is invalid, not something to rehash into a new waiver. Delete only this absent record.

- [apps/admin/app/(app)/feed/org-updates/page-client.tsx:14](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx:14>) — Only the default unavailable route remains.
- [tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/feed-org-updates-composer-actions.test.tsx:4) — Former evidence now uses only the default route.

**Reconsider:** If ComposeCardTypeSelector or a new test seam returns, independently inspect the exact owner, real runtime consumer and mocks against the new diagnostic.
**Limits:** Exact retirement only; not a current behavior/motion/financial/accessibility approval. Tests read, not run.

### Retirement 276: react-doctor/tanstack-form-on-submit-requires-prevent-default — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/src/cms-ui/web-studio/flows/MinistryUpdateCreateView.tsx:193`.
The current ministry update callback explicitly prevents default BEFORE the form.state.isSubmitting guard and void form.handleSubmit. The actual shared frame forwards its typed FormEvent handler directly to a native form. Installed TanStack adapter/core does not consume a DOM event, so that prevention remains essential. The old exact native-JSX diagnostic is absent; removal is justified without claiming this review repaired a reload defect.

- [apps/admin/src/cms-ui/web-studio/flows/MinistryUpdateCreateView.tsx:234](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/MinistryUpdateCreateView.tsx:234) — Exact current native-prevention/pending/submit order.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51) — Actual typed callback boundary.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77) — Native form forwards onSubmit without substitution.
- [node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411) — Installed 1.33.5 metadata, not event contract.
- [node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245) — Installed adapter delegates submission.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:17) — Actual flow imports; auth/router/shell/fetch are synthetic.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:164](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:164) — Actual selection/retry/pending-dedup assertions in source, not executed.

**Reconsider:** If ministry update handler, shared frame or TanStack adapter changes, recheck default-prevention order and duplicate-pending behavior; newly emitted findings need new decisions.
**Limits:** Source proves prevention; no browser/no-JavaScript/authenticated endpoint test pass is claimed.

### Retirement 277: react-doctor/tanstack-form-on-submit-requires-prevent-default — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx:191`.
The current missionary giving callback explicitly prevents default BEFORE the form.state.isSubmitting guard and void form.handleSubmit. The actual shared frame forwards its typed FormEvent handler directly to a native form. Installed TanStack adapter/core does not consume a DOM event, so that prevention remains essential. The old exact native-JSX diagnostic is absent; removal is justified without claiming this review repaired a reload defect.

- [apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx:206](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx:206) — Exact current native-prevention/pending/submit order.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51) — Actual typed callback boundary.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77) — Native form forwards onSubmit without substitution.
- [node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411) — Installed 1.33.5 metadata, not event contract.
- [node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245) — Installed adapter delegates submission.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:17) — Actual flow imports; auth/router/shell/fetch are synthetic.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:164](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:164) — Actual selection/retry/pending-dedup assertions in source, not executed.

**Reconsider:** If missionary giving handler, shared frame or TanStack adapter changes, recheck default-prevention order and duplicate-pending behavior; newly emitted findings need new decisions.
**Limits:** Source proves prevention; no browser/no-JavaScript/authenticated endpoint test pass is claimed.

### Retirement 278: react-doctor/tanstack-form-on-submit-requires-prevent-default — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx:181`.
The current project callback explicitly prevents default BEFORE the form.state.isSubmitting guard and void form.handleSubmit. The actual shared frame forwards its typed FormEvent handler directly to a native form. Installed TanStack adapter/core does not consume a DOM event, so that prevention remains essential. The old exact native-JSX diagnostic is absent; removal is justified without claiming this review repaired a reload defect.

- [apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx:195](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx:195) — Exact current native-prevention/pending/submit order.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51) — Actual typed callback boundary.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77) — Native form forwards onSubmit without substitution.
- [node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411) — Installed 1.33.5 metadata, not event contract.
- [node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245) — Installed adapter delegates submission.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:17) — Actual flow imports; auth/router/shell/fetch are synthetic.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:164](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:164) — Actual selection/retry/pending-dedup assertions in source, not executed.

**Reconsider:** If project handler, shared frame or TanStack adapter changes, recheck default-prevention order and duplicate-pending behavior; newly emitted findings need new decisions.
**Limits:** Source proves prevention; no browser/no-JavaScript/authenticated endpoint test pass is claimed.

### Retirement 279: react-doctor/tanstack-form-on-submit-requires-prevent-default — accept removal-only recommendation

Historical ledger location, not a current source assertion: `apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx:168`.
The current standard page callback explicitly prevents default BEFORE the form.state.isSubmitting guard and void form.handleSubmit. The actual shared frame forwards its typed FormEvent handler directly to a native form. Installed TanStack adapter/core does not consume a DOM event, so that prevention remains essential. The old exact native-JSX diagnostic is absent; removal is justified without claiming this review repaired a reload defect.

- [apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx:191](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx:191) — Exact current native-prevention/pending/submit order.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:51) — Actual typed callback boundary.
- [apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx:77) — Native form forwards onSubmit without substitution.
- [node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+form-core@1.33.5/node_modules/@tanstack/form-core/src/FormApi.ts:2411) — Installed 1.33.5 metadata, not event contract.
- [node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/node_modules/.bun/@tanstack+react-form@1.33.5+ab9c01e4ccdf52df/node_modules/@tanstack/react-form/src/useForm.tsx:245) — Installed adapter delegates submission.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:17) — Actual flow imports; auth/router/shell/fetch are synthetic.
- [tests/unit/apps/admin/cms-create-feedback.test.tsx:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/cms-create-feedback.test.tsx:1) — Complete source read; no claimed explicit defaultPrevented test.

**Reconsider:** If standard page handler, shared frame or TanStack adapter changes, recheck default-prevention order and duplicate-pending behavior; newly emitted findings need new decisions.
**Limits:** Source proves prevention; no browser/no-JavaScript/authenticated endpoint test pass is claimed.

## Exact future patch — never applied here

The RFC 6902 proposal has 99 operations: three envelope tests and one full-old-record test before each of seven replacements and 41 removals. Descending original indexes prevent removal-induced index shifts. **An external whole-ledger raw-byte SHA check is mandatory**; the JSON Patch alone is not the entire application authorization or guard. A changed ledger means abort and regenerate/review, not fuzzy matching. Canonical top-level review metadata is not refreshed to imply approval.

In-memory simulation only: 283 original records become 242, with **235 non-proposed records unchanged (195 unqualified stale + 40 mechanically exact prior)**. Seven replacement objects are exactly the individually qualified proposed records, not rule suppressions. No disk write to the ledger occurred.

Simulated whole-ledger validation still fails: `Exception evidence changed: apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx`. Later separately authorized owners must recheck the complete binding and each consumer/contract, independently resolve other stale/current findings, validate the combined ledger, and run a new complete eight-target strict audit with official actionable.json. This review supplies no strict pass or changed current actionable count.

## Verification and limits

The original strict invocation failed with `Exception evidence changed: tests/unit/apps/admin/app/eve-operations-workspace.test.tsx`; official strict actionable.json is absent. This review reproduces the failure read-only and does not substitute raw inventory exit 0 for strict acceptance. It did not rerun the scanner or its writing validation harness. The exact successful independent verifier command and result are retained in verification.json. An initial read-only verifier probe used the nonexistent `applyExceptionLedger` export and failed before checks; corrected `reviewReactDoctorFindings` checks pass only within their stated mechanical scope.

A report-writing transport error occurred before any report was created: apply_patch requires a UTF-8 patch argument and does not accept the attempted stdin invocation. That reset the Node REPL holding the full initial receipt, per-file hashes and initial per-path Git status. binding-before.json honestly retains the initial values actually printed by the successful live check; it is not a later run presented as before. Final comparisons use the observed initial source/fresh-tree/ledger/config digests and current controls against frozen audit controls. **No exact initial-versus-final per-path Git status comparison is claimed.** All analysis and final structural checks were reconstructed from unchanged inputs; the working apply_patch argument transport writes only this new report directory.

No native tests, builds/lint/typecheck/coverage/format gate, browser/keyboard/axe/responsive/zoom/motion checks, authenticated provider/tenant/payment integration or deployment was run. Existing synthetic mocks and assertion boundaries are described per record. Source evidence is not test success or product certification. Final verification rehashes fresh/source/test/policy/installed-contract evidence, compares live binding, validates every output/decision/guard, and simulates the exact patch without applying it. Matching checkpoints cannot detect intervening edit-and-restore or freeze future state.

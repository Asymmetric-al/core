# Round13r3 holds-A: individual React Doctor qualification

**Recommendations for root review only. No approval, ledger patch, strict pass, or final current-candidate acceptance.**

Review date: November 12, 2026 (Asia/Bangkok). Review started 2026-11-12T01:30:21.307Z; final recorded input comparison 2026-11-12T02:57:04.307Z. Checkout: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. Only new `docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r3-holds-a/report.md` and `docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r3-holds-a/decisions.json` are authored.

## Scope and results

- Exactly **65 individually adjudicated records**, zero-based positions **0..64 inclusive** of `remainingStaleRecords` in [the assigned source list](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/handback-proposal-review.json:1); original ledger indices are preserved, not renumbered.
- **61 conditional exact-rebind recommendations; 0 retirements; 1 reject/repair; 3 holds.** None is approval or authorization to update hashes.
- Semantically unresolved: **positions 3, 5, 12 and 21**. All 65 also remain unresolved for application/current acceptance until authorized root review and fresh binding/gates.
- New approvals, ledger/product/test/config/frozen-evidence mutations, children, Git commands, audits, test executions, browser/server/provider operations: **0**. Source and structural inspection only.
- The other **130** records in the historical 195-entry remaining-stale list are outside this assignment and receive no decision here. No scope reduction, removal, or transferred waiver is proposed.

Full exact old identities/record hashes, individually selected retained diagnostics, observational source/context/evidence hashes, test-mock assessments, reconsideration conditions, all 167 input observations and explicit unresolved identities are in [decisions.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r3-holds-a/decisions.json:1). This is a review data file, not a ledger-ready patch.

Assigned source-list SHA-256: `b423332f2ecdf2844076be16eafa5f14422168dbeb1e4422f373dfb5def21474`. Selected array-slice SHA-256 (UTF-8 JSON.stringify of those65 source records): `ffbea198f9ee28ff91aab5c50b558d95e33151170f16a902367365543a3a1b52`.

## Unresolved identities and required root action

### Position 3 / ledger 11 — reject/repair

[apps/admin/app/(app)/contributions/use-admin-contributions.ts:35](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/use-admin-contributions.ts:35>): `unused-export` on `loadMockAdminContributions`. The alleged monorepo test consumer replaces the entire owner at [tests/unit/apps/admin/app/contributions-page.test.tsx:87](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-page.test.tsx:87); its clone assertion at [tests/unit/apps/admin/app/contributions-page.test.tsx:1710](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-page.test.tsx:1710) calls that mock. No real consumer was established by the scoped apps/packages/tests/scripts symbol search. Keep the warning actionable. The owner must repair/remove/module-private it intentionally after external/generated consumer review, or supply genuine supported consumer evidence; do not manufacture a consumer or retire a retained finding.

### Position 5 / ledger 21 — hold

[apps/admin/app/(app)/pdf/page-client.tsx:472](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:472>): compact PDF `p-0.5` rail. Portaled tooltip prose is not rail body copy, but the owner changed since r13r2 and PDF writing is active. Existing control/header tests do not measure current responsive padding or target geometry. Stabilize the owner and inspect an exact fresh diagnostic/visible-control contract before reconsidering; identical-looking token text is insufficient.

### Position 12 / ledger 41 — hold

[apps/admin/app/(payload)/layout.tsx:125](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/layout.tsx:125>): localization followed by `executeAuthStrategies`. Installed implementations have no return-value dependency. The real auth strategy can synchronize/create CMS identities, but that alone does not establish the old claim that localization MUST succeed first. No failure-order consumer test/ratified owner contract was established. Do not approve that rationale or blindly parallelize side-effectful authentication.

### Position 21 / ledger 61 — hold

[apps/admin/features/support-hub/components/board/BoardCard.tsx:271](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/BoardCard.tsx:271): native card drag-handle spread. The actual getter is bounded native `draggable/onDragStart/onDragEnd`, not unspecified sensor/ARIA metadata. The owner changed since r13r2; the retained byte span now reads `ragHandleProps}\n    `, not the complete spread. Root must reinspect a stabilized fresh diagnostic/context and actual drag/keyboard ownership. Do not renew this stale offset by changing a hash.

## Historical evidence versus observed inputs

The adjacent [r13r2 ledger review](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review/report.md:1), [its decisions](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-ledger-review/decisions.json:1) and [retained fresh report](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/report.md:1) were read as historical evidence. They report seven rebind recommendations,41 removal recommendations,195 remaining stale records,669 applicable/11,452 raw/629 unresolved findings, and no official strict actionable.json. Those are **reported historical counts**, not a re-run or a new certification. No recommendation here is subtracted from629 and no combined ledger is validated. The older review is not current approval.

Two assigned owners already differed from the r13r2 source-list capture when first inspected:

| Position | Owner                                                                                                                                                                                       | r13r2 reported source SHA-256                                      | Observed owner SHA-256                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 5        | [apps/admin/app/(app)/pdf/page-client.tsx:472](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:472>)                                           | `fca5ed238d366088cdd978d011bde2f0a6c40aa3079492ef78bbba4514391465` | `375ba25f50eca2a4ffbdb892b9b263ec50162bcd156b2fdb71167af1e47c8ee3` |
| 21       | [apps/admin/features/support-hub/components/board/BoardCard.tsx:271](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/BoardCard.tsx:271) | `eaf4d5fdea9a18a2d503fe324a72c3ee64aaecea3bc692d476ac2f52ba76d75a` | `e9a3a42a2a5bd58c5c737b9ec9cc8a7edfb15ae40b3437f8c0831ec2c77e77b7` |

The remaining63 assigned owner byte hashes matched that historical source-list value at capture. That is not a new scanner result or current product acceptance. Source-context byte hashes are separate from whole-file hashes; for PDF the old byte token still matches, while BoardCard demonstrates why a similar line number cannot repair a stale offset. Both observations are retained, not overwritten.

All **167 actually inspected inputs** were re-read for SHA-256 comparison at 2026-11-12T02:57:04.307Z; **0 changed/deleted among those observations** between their own initial read and that comparison. Initial/final SHA-256, byte counts and timestamps are retained per path in decisions.json. This is **not a full repository freeze, source inventory, new-file census, or proof that concurrent grid/PDF/catalogue writers are done**. Uninspected dependencies and later changes are not covered. Old evidence hashes are retained alongside newly observed hashes, not silently refreshed into the ledger.

### Draft-state reconstruction

The drafting tool session reset before any artifact write. The same separately authored decisions were reconstructed from this task’s own tool record, and all 167 inspected input paths were reread. Input-observation timestamps below describe those rereads, not retrodated earlier captures. The earlier recorded comparison at 2026-11-12T02:33:59.347Z reported zero changed/deleted inputs among 167; a per-path cross-reset comparison is not claimed for prior receipts that were not recoverable. No scanner, validator, suite, browser, server or provider ran during reconstruction.

## Contract and review method

- Read applicable AGENTS, code-review/React Doctor skill and guide, relevant repository rules and accessibility-review guidance. No skill step overrode the user's no-Git/no-children/no-runtime boundary. No audit/validator engine was imported or executed.
- Current local scanner policy remains pinned React Doctor0.9.18 over eight targets; any unexcepted warning/error or skipped/incomplete applicable checks fails acceptance ([docs/guides/development/react-doctor.md:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/guides/development/react-doctor.md:3)). No scanner configuration, exclusions or scope were changed.
- Exact identity is the12-field tuple from [scripts/react-doctor-ledger.mjs:12](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/scripts/react-doctor-ledger.mjs:12). Each old identity and SHA-256(JSON.stringify(old record)) was matched to the captured ledger/source-list record; each selected candidate exactly occurs once in retained diagnostics.
- Observational candidate contexts reproduce [scripts/react-doctor-ledger.mjs:55](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/scripts/react-doctor-ledger.mjs:55): valid raw UTF-8 byte slice [offset,offset+length), otherwise LF-joined diagnostic lines. Separately retained semantic line context is explicitly **not** a replacement scanner hash. No new offsets/fingerprints/identities were invented.
- Complete owning source and actual framework/consumer boundaries were inspected. Duplicate-looking candidate groups were resolved by semantic site, not proximity/hash; the three SuggestionList rules remain three separate judgments. Every record below has its own rationale, consumer limits and reconsideration condition.
- Existing tests were read, including whether the actual owner or a provider boundary is mocked. **No tests ran**, so there is no test stdout or runtime result to preserve. A mock-owner test is not an export consumer; a mocked DefaultEditView/grid is not installed Payload runtime; static markup is not RSC/browser/provider proof.
- Installed contracts observed: `next@16.4.2`, `react@19.3.1`, `payload@4.0.0-beta.3`, `@payloadcms/ui@4.0.0-beta.3`, `@tanstack/react-form@1.33.5`, `recharts@3.10.1`, `@base-ui/react@1.9.0`. Next router/lazy guidance, Payload document/list/preferences types and real installed view consumers were inspected. Installed node_modules hashes are observational reference evidence; those paths are **not proposed as canonical ledger evidence**, whose path validator disallows them.

### Material corrections, not rubberstamps

The unused export's cited consumer is mocked (3); localization failure-order necessity is unproven (12); native DnD has actual bounded native handler keys, not a generic sensor/ARIA bag (21/22); MacroPreviewLine has four query hooks despite the old stateless wording (27); the exact dry-run candidate is unsupported-action badges, not reasons (29); Payload document props are view/form-state/slot contracts, while list wrappers have a separate custom list contract and drawer forwarding (31/33..48); ministry-updates list uniquely overrides its template create URL (36); busy macro keeps a name but no invented Running announcement (28).

### Motion boundary used, separately at each site

For the25 exact motion occurrences, [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371) sets reduced-motion animation duration0.01ms, iteration-count1 and transition duration0.01ms. It does **not** literally remove every animation. The same layer's `.spinner-essential` explicitly restores1.5s/infinite; none of the25 selected occurrences uses that class. Both app root/global import chains were inspected. Each spinner, skeleton, pulse or entrance was assessed for its own surrounding text/decorative role; no generic rule-level waiver is proposed. Browser cascade, generated CSS, reduced-motion emulation, focus and AT behavior were not tested. No status/session/financial truth follows from a motion exception.

### Conditions before any root application

These are recommendations on retained candidates and captured source semantics only. Root must stabilize all relevant writer inputs, obtain an authorized fresh diagnostic/binding, reinspect any changed owner/consumer/contract rather than mechanically renumber/rehash, and perform canonical whole-ledger plus all-target/no-skipped gates. Keep unknown/real debt actionable. No retirement is proposed because these65 each retain a historical candidate and there is no authorized current absence proof. No final current-candidate acceptance is given.

## Individual adjudications, positions0..64

The complete machine identities and hashed evidence for each entry are in the matching decisions.json record. Repeated supporting contracts do not transfer a decision to another occurrence or rule.

### Position 0 / ledger 6 — exact-rebind: Read-only idless designation fallback

- **Site:** [apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx:1093](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx:1093>); `react-doctor/no-array-index-as-key`. Retained r13r2 candidate only.
- **Prior rationale:** Supported only for the allocationId-absent read-only branch; the old test reference is source-policy evidence, not a rendered reordering test.
- **Rationale:** The candidate key at 1093 prefers allocationId. In the only index-fallback branch, the row renders designation status text; Retry is separately gated on allocationId and handlers receive that ID. This is not a waiver for an allocation-owned editable financial row or its asynchronous retry behavior.
- **Evidence:** inspected owner SHA-256 `0746a7f5796858d09ec6dc6e670db0d094e8c6c0581f0be7f9f85c948110e7e7`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Existing retry-support test inspects source strings. No rendered insertion/reorder/focus test for idless rows was found or executed; mutable financial controls remain outside this recommendation.
- **Limits:** No retry, money or provider behavior is certified.
- **Reconsider:** Any input/local state/ref/focus, per-row async ownership, keyed motion, or retry without allocationId in the fallback branch requires reconsideration.

### Position 1 / ledger 8 — exact-rebind: Offline gift Recording spinner

- **Site:** [apps/admin/app/(app)/contributions/offline-gift/offline-gift-entry-dialog.tsx:305](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/offline-gift/offline-gift-entry-dialog.tsx:305>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Replace the generic global-motion rationale with the exact Recording state and import chain; no essential-spinner exemption is present.
- **Rationale:** The Loader2 at 305 belongs to the offline gift submit pending branch with the textual Recording label. This SVG has animate-spin but no spinner-essential class. The shared admin CSS reduces this occurrence to one near-instant iteration; the text survives without rotation.
- **Evidence:** inspected owner SHA-256 `44ac9119f9a48a64257de6c30fc449b8550b0bfee403b712f4862eb03546d435`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real-dialog suite covers form behavior through mocks, not this spinner computed style or reduced-motion preference. It was read, not run.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 2 / ledger 10 — exact-rebind: Contribution invalid-gift URL cleanup

- **Site:** [apps/admin/app/(app)/contributions/page-client.tsx:208](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/page-client.tsx:208>); `react-doctor/nextjs-no-client-side-redirect`. Retained r13r2 candidate only.
- **Prior rationale:** Supported as same-path selection canonicalization, not authentication or navigation to another page.
- **Rationale:** The effect validates gift selection, removes only the invalid gift query parameter and calls replace on the existing pathname with scroll:false. Other query state remains. The real page test checks preservation of status, an error notification, and no gift fetch. Installed Next documents replace/scroll as router operations; this is not a server-redirect claim.
- **Evidence:** inspected owner SHA-256 `c8f7c6f196de9abad50182f3e932384265aa08f6c8f93157f13e24f016ea2e66`. Supporting: [apps/admin/app/(app)/contributions/contribution-detail-query.ts:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/contribution-detail-query.ts:1>); [apps/admin/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md:42](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md:42). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The page owner is real; router/data/toast boundaries are mocked. These are source assertions of an existing test, not a test result or authenticated navigation proof.
- **Limits:** No browser history, authenticated route or scroll behavior was executed.
- **Reconsider:** Pathname changes, authentication routing, fetching before validation, removal of unrelated query state or a wrong-page flash require reconsideration.

### Position 3 / ledger 11 — reject-repair: Unused export has only a mocked alleged consumer

- **Site:** [apps/admin/app/(app)/contributions/use-admin-contributions.ts:35](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/use-admin-contributions.ts:35>); `react-doctor/unused-export`. Retained r13r2 candidate only.
- **Prior rationale:** Rejected: the cited whole-monorepo test does not consume this owner implementation. It replaces the entire owning module and assigns a new loadMockAdminContributions lambda.
- **Rationale:** The export remains at 35 and a matching unused-export candidate remains in retained diagnostics. contributions-page.test mocks the owner at 87-102; its 1710 clone assertion calls that replacement, not this export. A scoped apps/packages/tests/scripts symbol search found no other actual consumer. There is no evidence-backed exception and no basis to retire the diagnostic merely because a mock shares its name.
- **Evidence:** inspected owner SHA-256 `9cb3b30f6dfa7e25b554926d18ff8d23de8408b94980f6de45885e380e8f933e`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Owner mocked: yes. No genuine consumer established. No test was run and creating a consumer simply to hide the diagnostic is not recommended.
- **Limits:** The search was source-based within apps, packages, tests and scripts, excluding installed/build trees; it is not proof about unlisted external consumers.
- **Reconsider:** Only a verified real supported consumer, or an intentional owner-approved removal/module-private repair followed by a fresh scan, changes this finding. Do not manufacture a consumer.
- **Root action:** Reject this waiver. Root must resolve the unused export at its owner after checking supported external/generated consumers, or provide real consumer evidence; keep the finding actionable meanwhile.

### Position 4 / ledger 12 — exact-rebind: CRM invalid-gift URL cleanup

- **Site:** [apps/admin/app/(app)/crm/page-client.tsx:188](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/page-client.tsx:188>); `react-doctor/nextjs-no-client-side-redirect`. Retained r13r2 candidate only.
- **Prior rationale:** Supported independently of the contribution page: the CRM-specific consumer verifies the donor query survives.
- **Rationale:** CRM deletes only the invalid gift selection from URLSearchParams and replaces the same pathname with scroll:false. It does not redirect to login or another route. The separate CRM real-page test checks preservation of donor query state and no invalid-gift fetch. This recommendation cannot be transferred from the Hub without this separate owner check.
- **Evidence:** inspected owner SHA-256 `fb5b8853bf742084ba30736f3e348e37554db479734acc463770a34a75b53c3d`. Supporting: [apps/admin/app/(app)/contributions/contribution-detail-query.ts:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/contribution-detail-query.ts:1>); [apps/admin/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md:42](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md:42). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real CRM page with mocked navigation/data boundaries; not the Hub test and not runtime browser proof. No test execution.
- **Limits:** No live navigation, permission or drawer hydration certification.
- **Reconsider:** Reconsider any pathname/auth redirect, validation/fetch ordering change, unrelated query deletion or wrong-page flash.

### Position 5 / ledger 21 — hold: PDF compact rail changed since retained scan

- **Site:** [apps/admin/app/(app)/pdf/page-client.tsx:472](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx:472>); `react-doctor/no-cramped-container-padding`. Retained r13r2 candidate only.
- **Prior rationale:** The portaled-tooltip versus visible-body-copy distinction is plausible, but cannot authorize reusing a stale file binding or certify current target geometry.
- **Rationale:** The current p-0.5 div at 472 is a hidden-xl segmented icon-control rail. Shared TooltipContent portals its contents, so tooltip prose is not rail body copy. However this owner SHA differs from the source-list r13r2 SHA while the PDF writer is active. The old byte span still happens to name this div; that does not establish a current scanner identity, final responsive layout, padding or target geometry.
- **Evidence:** inspected owner SHA-256 `375ba25f50eca2a4ffbdb892b9b263ec50162bcd156b2fdb71167af1e47c8ee3`. Supporting: [packages/ui/components/shadcn/tooltip.tsx:44](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tooltip.tsx:44). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Existing tests are useful control consumers but do not prove hit geometry or the current candidate scanner binding; none executed.
- **Limits:** Current owner changed before capture; no browser/layout/computed padding evidence.
- **Reconsider:** After the PDF writer finishes, root must capture stable source/diagnostic hashes and inspect the actual visible rail/tooltip/target contract. Only then reconsider this exact padding candidate.
- **Root action:** Hold without rebinding or retirement. Reinspect the stabilized PDF owner and independently resolve the exact current candidate; do not only refresh the SHA.

### Position 6 / ledger 23 — exact-rebind: PDF preview diagnostic projection rows

- **Site:** [apps/admin/app/(app)/pdf/native-pdf-document-builder-section.tsx:101](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/native-pdf-document-builder-section.tsx:101>); `react-doctor/no-array-index-as-key`. Retained r13r2 candidate only.
- **Prior rationale:** Supported for the diagnostics row only, not the authoring textarea or complete PDF preview workflow.
- **Rationale:** At 99-122 each code-index-keyed row projects icon, severity Badge and message from one preview result. The row has no input, handler, local state/ref or independent async work; the authoring textarea is outside this list. Reordering text projections therefore does not transfer a row-owned financial/editing draft.
- **Evidence:** inspected owner SHA-256 `e8d58547d53af12b13adce1c40ee30e0bd2a1d14d344364def3ca3f2984afb89`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real section is imported, but its existing status test never renders a diagnostic row. No rendered reorder assertion or test execution; qualification rests on the complete row structure.
- **Limits:** This says nothing about parser correctness, PDF generation or diagnostic accuracy.
- **Reconsider:** Inputs, interactive diagnostic actions, local refs/state/focus, per-row async results or stable diagnostic-ID requirements require a new review.

### Position 7 / ledger 25 — exact-rebind: Reports loading-chart spinner

- **Site:** [apps/admin/app/(app)/reports/reports-charts.tsx:63](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/reports-charts.tsx:63>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Narrow the generic CSS waiver to the Reports loading status at 63; do not recertify chart accessibility or data truth.
- **Rationale:** The chart-loading fallback uses animate-spin inside its loading presentation. It does not opt into spinner-essential. Its surrounding status/copy remains available when the admin imported policy collapses rotation to one 0.01ms iteration; this is a cross-stylesheet policy the local class diagnostic does not capture.
- **Evidence:** inspected owner SHA-256 `327acd7d34492bc87dd1c71728496a318c90e248591cb98db2ee2f62ff89e860`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Existing layout/status coverage was inspected, not executed; it cannot prove a computed reduced-motion cascade.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 8 / ledger 26 — exact-rebind: Same-page guarded Resend hydration hook

- **Site:** [apps/admin/app/(app)/settings/integrations/resend/page-client.tsx:391](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/settings/integrations/resend/page-client.tsx:391>); `react-doctor/no-pass-live-state-to-parent`. Retained r13r2 candidate only.
- **Prior rationale:** Supported after checking the hook caller and all effect guards; it is not a child owning live state and raising it to another fiber.
- **Rationale:** The private useResendConnectionHydration hook is called at 182 by the page that owns its setters/form. Its 391 call starts an asynchronous server-state read; isActive guards reset, result, error and loading writes, and cleanup deactivates it. A hook call does not establish the extra child-to-parent mirroring/render cycle claimed by this candidate.
- **Evidence:** inspected owner SHA-256 `73495f1d33e1e95ee374930d04f5a2e169ae83c2893536ac2b43b8db1991f388`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct in-flight/unmount hydration consumer test was established. The cited suites do not certify this effect. No tests/provider calls executed.
- **Limits:** Static lifecycle review is not live cancellation, provider or stale-response runtime proof.
- **Reconsider:** If lifted into a child that mirrors its own local state, or active guards/cleanup and same-page ownership change, review again.

### Position 9 / ledger 27 — exact-rebind: Resend Connecting spinner, not send spinner

- **Site:** [apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx:643](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx:643>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** The ambiguous two-candidate group is separated semantically: this record binds connect pending at 643, not test-send at 765.
- **Rationale:** The Loader2 at 643 is in the connect form pending branch with Connecting text. The adjacent test-send occurrence has identical spinner JSX but different form ownership and location; only the connect occurrence is selected here. This class lacks spinner-essential and is covered by the admin CSS import chain.
- **Evidence:** inspected owner SHA-256 `7901bfc5b699bd026910cbac15fc0acd37f008113394290811d97934ede07267`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No exact Connecting reduced-motion runtime test established; field/schema evidence is not an animation result.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 10 / ledger 28 — exact-rebind: Resend test-send modal form ownership

- **Site:** [apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx:676](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx:676>); `react-doctor/no-prevent-default`. Retained r13r2 candidate only.
- **Prior rationale:** Supported as an intentionally hydrated modal workflow, not as a claim of no-JavaScript submit support or executed Enter behavior.
- **Rationale:** The exact preventDefault/stopPropagation handler at 676 routes the modal native submit event to TanStack handleSubmit, owned by the enclosing page test form with email Zod validation, pending/error/success state and authenticated send logic. Frontend policy explicitly selects TanStack+Zod for modal workflows, unlike simple search/server-only forms. The diagnostic describes a real lack of no-JS submission, but this is an intentional client-modal contract, not accidental lost navigation.
- **Evidence:** inspected owner SHA-256 `7901bfc5b699bd026910cbac15fc0acd37f008113394290811d97934ede07267`. Supporting: [apps/admin/app/(app)/settings/integrations/resend/page-client.tsx:119](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/settings/integrations/resend/page-client.tsx:119>); [apps/admin/app/(app)/settings/integrations/resend/use-resend-forms.ts:1](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/settings/integrations/resend/use-resend-forms.ts:1>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Schema is real; focused field tests use synthetic boundaries. No direct Enter, no-JS, hydration or live authenticated send verification was executed.
- **Limits:** No progressive-enhancement or provider-delivery certification.
- **Reconsider:** A server/native conversion, change to validation/authentication/pending ownership, or use for a trivial/server-only form requires reconsideration.

### Position 11 / ledger 29 — exact-rebind: Resend Sending spinner, not connect spinner

- **Site:** [apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx:765](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx:765>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Separately resolve the 765 test-send branch; do not transfer the 643 Connecting disposition by equal context hash alone.
- **Rationale:** This Loader2 is in ResendTestDialog submit pending with Sending text at 765. Its duplicate-looking connect spinner is a different candidate. The exact send occurrence lacks spinner-essential, and the admin global rule suppresses repeated rotation while text remains meaningful.
- **Evidence:** inspected owner SHA-256 `7901bfc5b699bd026910cbac15fc0acd37f008113394290811d97934ede07267`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No exact test-send spinner runtime/CSS test established; the schema suite is not animation evidence. No tests executed.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 12 / ledger 41 — hold: Unproven localization-before-auth failure ordering

- **Site:** [apps/admin/app/(payload)/layout.tsx:129](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/layout.tsx:129>); `react-doctor/server-sequential-independent-await`. Retained r13r2 candidate only.
- **Prior rationale:** Not ratified: code executes localization first, but neither installed implementation nor an owning test proves that localization MUST succeed before any auth synchronization effect.
- **Rationale:** getLocalI18n at 125 consumes config/language; executeAuthStrategies at 129 consumes headers/payload, so there is no return-value dependency. The actual configured Supabase auth strategy can find/create CMS tenants and sync CMS users at 438-449. That makes a blind Promise.all behavior change unsafe, but side effects alone do not establish the old mandatory failure-order policy. Source order cannot be circular evidence for its own exception.
- **Evidence:** inspected owner SHA-256 `9348772ff61e4e21689bd5a956289523d2064716111ae235796de3d8acc2dd34`. Supporting: [apps/admin/node_modules/payload/dist/translations/getLocalI18n.js:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/payload/dist/translations/getLocalI18n.js:1); [apps/admin/node_modules/payload/dist/auth/executeAuthStrategies.js:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/payload/dist/auth/executeAuthStrategies.js:1). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No consumer test was found establishing localization rejection versus auth write ordering; no tests or authentication/provider operations were run.
- **Limits:** Not evidence that parallelization is safe, or that localization is infallible. No auth request executed.
- **Reconsider:** Provide a domain-owner failure-order contract plus focused rejecting-localization/observable-auth-effect coverage, or an intentional safe repair, before reconsidering this exact sequential-await warning.
- **Root action:** Keep unresolved/actionable; ask the owning reviewer to establish failure-order semantics or repair safely. Do not approve from side effects alone or silently parallelize.

### Position 13 / ledger 42 — exact-rebind: Server FAQ text-row index key

- **Site:** [apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx:368](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx:368>); `react-doctor/no-array-index-as-key`. Retained r13r2 candidate only.
- **Prior rationale:** Supported for FAQ rows at 368 after separating them from the impact-statistic candidate at 396.
- **Rationale:** The server preview fetches one authenticated draft document with overrideAccess:false. The FAQ branch maps question/answer text into rows with no client state, refs, event handlers or independently loaded per-row child. An index key for this text projection does not key an editing draft. Authentication and access checks are inspected context, not independently certified.
- **Evidence:** inspected owner SHA-256 `71a4dd368d9f8987846f51f547c8ac496c9ccaea936aa1b2e9b166f2c3ae4966`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real preview page consumer, but fixture uses hero/call-to-action rather than FAQ rows. No FAQ reorder or authenticated live request/test execution.
- **Limits:** No access-control or real RSC/hydration certification.
- **Reconsider:** Reconsider FAQ editing, focus/ref/state, interactive children, per-row loads or stable content-identity requirements.

### Position 14 / ledger 43 — exact-rebind: Server impact-statistic text-row index key

- **Site:** [apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx:396](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx:396>); `react-doctor/no-array-index-as-key`. Retained r13r2 candidate only.
- **Prior rationale:** Supported independently for impact-statistics at 396, not a duplicate waiver for the FAQ branch.
- **Rationale:** The impact branch projects value, label and description from the same document response into static server markup. The full row contains no stateful/interactive/ref-owning child or independent async ownership. Its stat-index key is a rendering aid for read-only value/text, not an editable list identity.
- **Evidence:** inspected owner SHA-256 `71a4dd368d9f8987846f51f547c8ac496c9ccaea936aa1b2e9b166f2c3ae4966`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real owner with mocked dependencies, no direct impact-statistic-row test found or executed. Source projection is the evidence, not a test pass.
- **Limits:** No RSC runtime, live draft access or data-accuracy proof.
- **Reconsider:** Client counters/animations, local refs/state/focus, controls, per-statistic async work or stable identity requirements require new review.

### Position 15 / ledger 44 — exact-rebind: Web Studio Saving spinner

- **Site:** [apps/admin/app/web-studio/web-studio-sections.tsx:296](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/web-studio/web-studio-sections.tsx:296); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Replace the generic CSS statement with the actual save-state branch and surviving Saving label.
- **Rationale:** The web-studio section Loader2 at 296 appears in the saving branch with textual Saving output. It is an ordinary animate-spin class, not spinner-essential. The admin shared media query shortens rotation to one near-instant iteration without removing the save-state text.
- **Evidence:** inspected owner SHA-256 `c9a30ee9d914fe36af43bdbd9b47090dabc964d99f76761f0c7531a07fa2a6c2`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Only indirect utility-fixture motion coverage was found for this exact occurrence; no exact real save-state CSS test or execution.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 16 / ledger 46 — exact-rebind: Revenue view is behind a concrete lazy boundary

- **Site:** [apps/admin/components/dashboard/charts/revenue-chart-view.tsx:5](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/components/dashboard/charts/revenue-chart-view.tsx:5); `react-doctor/prefer-dynamic-import`. Retained r13r2 candidate only.
- **Prior rationale:** Keep only the supported complete-module lazy-import rationale. Do not assert that every Recharts primitive inherently requires synchronous loading.
- **Rationale:** RevenueChartView owns the static recharts import at 5, but production RevenueChart declares a module-level React.lazy import of this complete view and renders it under Suspense. The scoped importer search found that concrete wrapper and the formatter test, not an eager production bypass. Installed Next explicitly supports React.lazy+Suspense. Another per-primitive async layer is not required to establish the existing module boundary.
- **Evidence:** inspected owner SHA-256 `e408163b5b80900e57881ff0741e9ef58c880ddf0563f8c231ff08a81b4725e6`. Supporting: [apps/admin/components/dashboard/charts/revenue-chart.tsx:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/components/dashboard/charts/revenue-chart.tsx:1); [apps/admin/node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Formatter suite imports the real Revenue view but mocks Recharts; it does not prove chunking, measured performance or Recharts child-discovery behavior. No execution.
- **Limits:** No bundle build/chunk analysis or page-load measurement; importer search is structural, not runtime proof.
- **Reconsider:** A new eager production importer, movement of Recharts to the eager owner, or loss of the module-level lazy/Suspense boundary requires reconsideration.

### Position 17 / ledger 47 — exact-rebind: Weekly view has its own complete-view lazy importer

- **Site:** [apps/admin/components/dashboard/charts/weekly-chart-view.tsx:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/components/dashboard/charts/weekly-chart-view.tsx:4); `react-doctor/prefer-dynamic-import`. Retained r13r2 candidate only.
- **Prior rationale:** Verified separately from Revenue; remove the unnecessary blanket claim about all Recharts axes/series sync APIs.
- **Rationale:** WeeklyChartView statically imports recharts at 4. Its separate WeeklyChart wrapper defines React.lazy for this exact module and uses Suspense. Scoped production importer inspection found no eager bypass for this view. This is already the on-demand complete-chart module described by installed Next lazy-loading guidance; Revenue evidence alone would not qualify it.
- **Evidence:** inspected owner SHA-256 `1cdd3fdf12689423fb5afd65395ffca27923785f2ab92979fe53ea856dab04d6`. Supporting: [apps/admin/components/dashboard/charts/weekly-chart.tsx:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/components/dashboard/charts/weekly-chart.tsx:1); [apps/admin/node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real Weekly view imported in formatter cases; Recharts/motion boundary mocked. No bundle or real chart runtime is tested here and no suite ran.
- **Limits:** No build/performance measurement or primitive-child runtime assertion.
- **Reconsider:** Any eager production bypass or removal/movement of this Weekly module lazy boundary requires a separate review.

### Position 18 / ledger 48 — exact-rebind: Studio chrome save-state spinner

- **Site:** [apps/admin/components/studio/studio-chrome.tsx:149](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/components/studio/studio-chrome.tsx:149); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Supported narrowly for the aria-hidden Saving indicator; actual focus tests are synthetic, not a browser motion result.
- **Rationale:** The save-status span at 149 is aria-hidden and animate-spin while text at 153 describes Saving. It is not spinner-essential, so the imported admin reduced-motion baseline removes repeated rotation without removing the text state. The specific shared Studio owner was inspected, not just another loader under this rule.
- **Evidence:** inspected owner SHA-256 `7437133e65316c8e5bae8dba8fa9b138934066b938f28a1f15e8cbdf50386d6e`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The consumer exercises pending-save semantics/focus in jsdom, not actual media-query/computed CSS; read only.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 19 / ledger 59 — exact-rebind: Location drawer submits validated multi-field client state

- **Site:** [apps/admin/features/mission-control/locations/components/LocationEditor.tsx:158](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/locations/components/LocationEditor.tsx:158); `react-doctor/no-prevent-default`. Retained r13r2 candidate only.
- **Prior rationale:** Supported by the actual schema, client mutation hook and success/error ownership, not a generic preference for preventDefault.
- **Rationale:** LocationEditor handles a linked, type-dependent multi-field drawer: locationSchema validates title/type/link/status/coordinates. Its preventDefault/stopPropagation handler at 158-164 calls TanStack handleSubmit. The form hook awaits upsertLocation, clears only on success and leaves errors/draft in the drawer on rejection. This matches the repository modal/drawer TanStack policy; it is not a promise of no-JS operation.
- **Evidence:** inspected owner SHA-256 `eecb384561b671009c6fad869353140bb7da88f3f739bbab7537b7f3f12b36ba`. Supporting: [docs/ai/rules/frontend.md:111](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/ai/rules/frontend.md:111). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Editor is real; map/data/mutation boundaries are mocked. Source tests cover linked edits/save failure, not hydration, no-JS submit or real RLS writes; not executed.
- **Limits:** No browser Enter/hydration or backend authorization proof.
- **Reconsider:** Native/server migration or changes to coordinate/link validation, mutation await, close-on-success or error draft retention require reconsideration.

### Position 20 / ledger 60 — exact-rebind: Location editor Saving spinner

- **Site:** [apps/admin/features/mission-control/locations/components/LocationEditor.tsx:278](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/locations/components/LocationEditor.tsx:278); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Qualify this loader separately from the drawer submit exception; no shared approval of form behavior is implied.
- **Rationale:** The editor save action shows the Loader2 at 278 and Saving text at 280 while the mutation is pending. It does not use spinner-essential. The admin global rule bounds its spin to one near-instant iteration; removing motion leaves the explicit pending label.
- **Evidence:** inspected owner SHA-256 `eecb384561b671009c6fad869353140bb7da88f3f739bbab7537b7f3f12b36ba`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Existing editor consumer is not exact computed-CSS coverage; no test executed.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 21 / ledger 61 — hold: BoardCard native drag spread has stale byte binding

- **Site:** [apps/admin/features/support-hub/components/board/BoardCard.tsx:271](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/BoardCard.tsx:271); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Replace the old sensor/ARIA description: actual getter forwards native draggable, onDragStart and onDragEnd, not a general ARIA/sensor payload.
- **Rationale:** The current article spreads dragHandleProps at 271; use-board-dnd defines and produces a bounded native drag-handle object and SupportBoardView supplies it. That is a plausible forwarding boundary, but BoardCard SHA differs from the retained r13r2 input and the historical byte offset now slices the tail of the spread rather than the exact diagnostic token. Reusing that identity/context would misbind an active writer input.
- **Evidence:** inspected owner SHA-256 `e9a3a42a2a5bd58c5c737b9ec9cc8a7edfb15ae40b3437f8c0831ec2c77e77b7`. Supporting: [apps/admin/features/support-hub/components/board/use-board-dnd.ts:23](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/use-board-dnd.ts:23); [apps/admin/features/support-hub/components/board/use-board-dnd.ts:59](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/use-board-dnd.ts:59). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real card naming/click tests do not prove native drag lifecycle. No browser or test run. Static source still needs stable current diagnostic coordinates.
- **Limits:** Owner changed before inspection; historical context offset is materially stale.
- **Reconsider:** After writer quiescence, inspect the exact fresh BoardCard candidate, whole owner and context hashes, actual getter keys and keyboard alternative; reassess if getter becomes arbitrary or overrides unrelated semantics.
- **Root action:** Hold; retain historical and observed hashes/context separately. Do not apply a stale offset or simply refresh evidence hashes.

### Position 22 / ledger 62 — exact-rebind: BoardColumn forwards only native drop-zone handlers

- **Site:** [apps/admin/features/support-hub/components/board/BoardColumn.tsx:65](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/BoardColumn.tsx:65); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Correct the old rationale: native drop handlers, not unspecified sensor/ARIA metadata.
- **Rationale:** The section spread at 65 receives the real getColumnDropProps output: onDragOver/onDragEnter/onDragLeave/onDrop. Those keys cannot replace laneRef, tabIndex, aria-label or className defined by the owner. SupportBoardView supplies the actual getter, so this is a narrow integration contract rather than an opaque application object. BoardCard file drift does not make this unchanged owner automatically acceptable or unacceptable.
- **Evidence:** inspected owner SHA-256 `bc05eca93fb6d3f468c0b7b879c4d92ffcedd4be3adf45d64f39900d06a39b54`. Supporting: [apps/admin/features/support-hub/components/board/use-board-dnd.ts:23](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/use-board-dnd.ts:23); [apps/admin/features/support-hub/components/board/use-board-dnd.ts:59](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/use-board-dnd.ts:59). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The direct empty-column fixture does not exercise handler delivery; no native DnD lifecycle/focus runtime result is claimed. No tests executed.
- **Limits:** No native browser drag/drop or keyboard-alternative certification.
- **Reconsider:** Getter expansion to arbitrary props, ref/tabIndex/ARIA/class overrides, a different drop owner or changed drop lifecycle requires fresh review.

### Position 23 / ledger 63 — exact-rebind: Composer sending-or-note-saving icon

- **Site:** [apps/admin/features/support-hub/components/detail/composer/ComposerActions.tsx:118](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/ComposerActions.tsx:118); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Narrow to ComposerSendIcon at 118; do not confuse it with the separate Save draft action.
- **Rationale:** The exact aria-hidden Loader2 appears only for isSending. The action owner keeps aria-busy, an sr-only sendAccessibleLabel and visible Sending/Saving text resolved for reply versus internal note. It has no spinner-essential. The CSS baseline collapses this icon rotation without eliminating the text distinction; separate draft-save behavior is not waived.
- **Evidence:** inspected owner SHA-256 `c6a648574c97826bcbbd58e1b73d7a8a7b671d3b004087c0ca52c9bc8cda3997`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Existing mode/name tests use synthetic callbacks and do not prove this CSS media query. None executed.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 24 / ledger 64 — exact-rebind: Suggestion effect is a DOM ARIA bridge, not data lifting

- **Site:** [apps/admin/features/support-hub/components/detail/composer/extensions/SuggestionList.tsx:73](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/SuggestionList.tsx:73); `react-doctor/no-pass-data-to-parent`. Retained r13r2 candidate only.
- **Prior rationale:** Supported only after tracing the sole production onActiveOptionChange callback; no business/fetched data is passed into parent React state.
- **Rationale:** The candidate no-pass-data-to-parent call at 73 passes listbox/active-option IDs after list commit. The actual renderer callback updates focused editor DOM aria-controls/aria-activedescendant, not setState or a fetched-data owner. A separately mounted suggestion root needs that imperative accessibility bridge; the diagnosed extra parent data-render cycle is absent in this consumer.
- **Evidence:** inspected owner SHA-256 `1ed2788853f1f67e6f9ca5ff0383179bf36bba31e138139fddf45de007e2ec50`. Supporting: [apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:54](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:54); [apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:91](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:91). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real list and renderer tests use synthetic editor/data boundaries; owner not replaced. Existing focus/ARIA assertions inspected only, not executed.
- **Limits:** Not a blanket callback/effect waiver and not live screen-reader proof.
- **Reconsider:** A new consumer that stores callback data in parent React state, transfers business data, removes ownership-aware restoration or changes commit ordering needs new qualification.

### Position 25 / ledger 65 — exact-rebind: Suggestion effect does not push live parent state

- **Site:** [apps/admin/features/support-hub/components/detail/composer/extensions/SuggestionList.tsx:73](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/SuggestionList.tsx:73); `react-doctor/no-pass-live-state-to-parent`. Retained r13r2 candidate only.
- **Prior rationale:** Separately adjudicated no-pass-live-state-to-parent: current selection changes are bridged to editor attributes, not parent setState.
- **Rationale:** The same 73 occurrence changes aria-activedescendant as the suggestion selection changes. The sole callback follows connectActiveOption to direct DOM updates only; it does not mirror local selection through React parent state. The editor keeps focus while the separately rendered list publishes the committed active ID. This consumer contradicts the rule message about an extra parent render.
- **Evidence:** inspected owner SHA-256 `1ed2788853f1f67e6f9ca5ff0383179bf36bba31e138139fddf45de007e2ec50`. Supporting: [apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:54](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:54); [apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:91](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:91). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real list/renderer focus tests check changing active descendant and editor focus under synthetic boundaries. They were not executed, and no AT/browser result is claimed.
- **Limits:** This rule-specific disposition is independent of positions24 and26 despite the shared effect.
- **Reconsider:** Parent React-state writes, alternate consumers, focus ownership changes or missing restoration/cancellation require another review.

### Position 26 / ledger 66 — exact-rebind: Post-render prop callback is imperative accessibility synchronization

- **Site:** [apps/admin/features/support-hub/components/detail/composer/extensions/SuggestionList.tsx:73](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/SuggestionList.tsx:73); `react-doctor/no-prop-callback-in-effect`. Retained r13r2 candidate only.
- **Prior rationale:** Supported for no-prop-callback-in-effect because the actual callback is not a parent rerender loop; effect presence alone does not prove a defect.
- **Rationale:** The callback at 73 synchronizes DOM ARIA references after listbox/option IDs are committed, not a parent model that schedules another React render. The renderer creates a separate root and restores only attributes it owns on teardown. Moving this to render/event-only timing could publish an uncommitted ID or miss initial selection; this is a concrete imperative effect seam.
- **Evidence:** inspected owner SHA-256 `1ed2788853f1f67e6f9ca5ff0383179bf36bba31e138139fddf45de007e2ec50`. Supporting: [apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:54](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:54); [apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:91](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/detail/composer/extensions/use-suggestion-renderer.tsx:91). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Existing real owner tests inspect synchronization and restore/unmount behavior with synthetic data/editor boundaries; no suite executed.
- **Limits:** No generalized permission for prop callbacks in effects; no runtime render-count claim.
- **Reconsider:** A callback that schedules React parent updates, new consumer, removal of ownership guards, or timing/teardown changes invalidates this precise rationale.

### Position 27 / ledger 67 — exact-rebind: Macro action preview rows, not a stateless component

- **Site:** [apps/admin/features/support-hub/components/macros/MacroPreviewLine.tsx:68](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/macros/MacroPreviewLine.tsx:68); `react-doctor/no-array-index-as-key`. Retained r13r2 candidate only.
- **Prior rationale:** Correct the prior statement: MacroPreviewLine runs four query hooks, so the component is not stateless. Its keyed li rows still own no row-local draft or handlers.
- **Rationale:** The exact key at 68 belongs to an action-icon/derived-label li. Component-level queries supply names/loading fallbacks; each keyed child contains only icon/text, with no editable input, row ref/focus or independent mutation. Duplicate action kinds are valid. Qualification depends on row ownership, not the inaccurate old assertion that the entire component is stateless.
- **Evidence:** inspected owner SHA-256 `57d1388b1e972c610719f4e2fce9fc40155932bf214999384aed04770c724544`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Preview owner real; data query hooks mocked. Tests establish intended labels only in source, not reorder state correctness or an executed result.
- **Limits:** Does not waive editable macro rule/action rows.
- **Reconsider:** Per-row query/state/ref/focus, editable MacroActionEditor reuse, handlers or stable action-ID ownership requires reconsideration.

### Position 28 / ledger 68 — exact-rebind: Busy macro spinner retains the macro name

- **Site:** [apps/admin/features/support-hub/components/macros/RunMacroPopover.tsx:147](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/macros/RunMacroPopover.tsx:147); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Qualify only motion; unlike several loaders this site does not add Running text, so do not invent a pending announcement.
- **Rationale:** The 147 Loader2 renders for the busy macro.id; each CommandItem has stable macro.id, is disabled while any macro is busy and keeps its macro.name. The spinner is not spinner-essential, so the admin policy eliminates repeated rotation. Static name retention supports motion removal, but is not evidence of an explicit Running announcement or complete asynchronous accessibility.
- **Evidence:** inspected owner SHA-256 `cd83c66d270b5250ea99316def546bda74873db531cb108f91d1d60f5a5a4f2b`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/admin/app/layout.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/layout.tsx:17). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct busy-macro reduced-motion/AT test established; loading-state tests are not the busy-site result. Not executed.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No explicit Running status is present at this site; do not treat this motion-only exception as pending-announcement approval.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 29 / ledger 71 — exact-rebind: Unsupported-action badges, not dry-run reason rows

- **Site:** [apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview.tsx:73](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview.tsx:73); `react-doctor/no-array-index-as-key`. Retained r13r2 candidate only.
- **Prior rationale:** Replace the old reason-row explanation: the candidate is unsupportedActions at 73, whereas result.reasons uses a different key at 48.
- **Rationale:** The complete unsupportedActions row at 72-76 contains only an outline Badge with labelForKind(action.kind); the kind-index key distinguishes repeated kinds. It owns no row state/ref/control/async work. The owning group explicitly says Not simulated and does not describe a runner as executing. Text-only reasons elsewhere cannot serve as evidence for this identity.
- **Evidence:** inspected owner SHA-256 `1b75e1cde173815aa4237db1c6aab13836d0ad63620854c87cd985610a98f544`. Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real preview owner with synthetic hook/data boundary. Test targets unsimulated badges but not insertion/reorder identity; read only.
- **Limits:** No automation execution capability or runtime result is certified.
- **Reconsider:** Interactive unsupported actions, local refs/state/focus, per-action async execution or stable action-ID requirements require review.

### Position 30 / ledger 72 — exact-rebind: Read-only team slug snapshot remounts by team identity

- **Site:** [apps/admin/features/support-hub/components/settings/collaborators/TeamForm.tsx:22](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/settings/collaborators/TeamForm.tsx:22); `react-doctor/hook-use-state`. Retained r13r2 candidate only.
- **Prior rationale:** Supported by the current real TeamList key, not by assuming props automatically reset useState.
- **Rationale:** TeamForm getter-only useState captures the initial slug; it is intentionally not editable. Save preserves a nonempty existing slug and only derives/falls back for a new team. The actual TeamList key is editingTeam.id or new-team, so selecting another team remounts this snapshot. The dedicated TeamList/Form test covers Alpha→Beta drafts and new-team reset.
- **Evidence:** inspected owner SHA-256 `4634db5f9b9ab155c1b6288b6367e354a444038e2c03732bd833b708d50d557d`. Supporting: [apps/admin/features/support-hub/components/settings/collaborators/TeamList.tsx:139](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/settings/collaborators/TeamList.tsx:139). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Owner components are real; database hooks/mutation results mocked. No suite executed and no real concurrent-write/persistence proof.
- **Limits:** Not permission to omit setters for mutable state in other forms.
- **Reconsider:** Editable slug, unkeyed reuse, same-key identity changes or altered derivation/preservation policy require a new review.

### Position 31 / ledger 78 — exact-rebind: Payload edit adapter forwards framework slots, not arbitrary DOM props

- **Site:** [apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx:985](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx:985); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Narrow the old broad form/document-or-link rationale. Installed DocumentViewClientProps is a slot/form-state/view-type adapter, not arbitrary DOM/ref/link metadata.
- **Rationale:** NativeCollectionEditView types its input as DocumentViewClientProps plus studioCollection, removes the collection-only discriminator, then spreads the remaining Payload view props into DefaultEditView at 985 before intentionally supplying its three content-slot overrides. Installed Payload consumes those slots and provider context. This exact forwarding preserves the integration boundary rather than hiding a business/DOM prop object.
- **Evidence:** inspected owner SHA-256 `3b415fb30b3a86a3a47d41ad70908307ace26805b3e6021c9ba9a44b24b4b94c`. Supporting: [apps/admin/node_modules/payload/dist/admin/views/document.d.ts:36](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/payload/dist/admin/views/document.d.ts:36); [apps/admin/node_modules/@payloadcms/ui/dist/views/Edit/index.js:44](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/@payloadcms/ui/dist/views/Edit/index.js:44). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Shared owner real, but installed DefaultEditView/providers are mocked. Existing published-page assertions do not prove real Payload field/permission/runtime behavior; not executed.
- **Limits:** Framework types/implementation inspected, not installed Payload runtime; no native-editor activation claim.
- **Reconsider:** Payload upgrade/type/slot changes, arbitrary props, discriminator leakage or changed slot/provider ownership require requalification.

### Position 32 / ledger 79 — exact-rebind: Payload workspace preference modal owns its client submit

- **Site:** [apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeDocumentWorkspaceSettingsDialog.tsx:160](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeDocumentWorkspaceSettingsDialog.tsx:160); `react-doctor/no-prevent-default`. Retained r13r2 candidate only.
- **Prior rationale:** Supported as a two-boolean client preference dialog with cancellation-aware load and awaited setter, not as no-JS or provider persistence proof.
- **Rationale:** The open dialog loads preferences under an active guard, validates two workspace booleans with Zod/TanStack, and awaits Payload setPreference(key, parsed, true) before onSaved. Its preventDefault/stopPropagation at 160 routes the modal submit through that form. Installed usePreferences declares an async setter with the merge argument; this aligns with the intentional client-modal policy.
- **Evidence:** inspected owner SHA-256 `6083c712140c2d3edcd81f28ad2c0b57ba7d51a0b77a8aef11be1f786c845ab4`. Supporting: [apps/admin/node_modules/@payloadcms/ui/dist/providers/Preferences/index.d.ts:4](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/node_modules/@payloadcms/ui/dist/providers/Preferences/index.d.ts:4); [docs/ai/rules/frontend.md:111](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/ai/rules/frontend.md:111). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct real-dialog submit/cancellation test established. The neighboring shared-editor suite replaces this owner, so cannot validate it. No tests executed.
- **Limits:** No no-JS/hydration/focus or live preference persistence certification.
- **Reconsider:** Changes to preference shape, merge semantics, cancellation, save completion ordering or deliberate native/server migration require reconsideration.

### Position 33 / ledger 82 — exact-rebind: Media document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/media/document/MediaNativeEditView.tsx:8](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/media/document/MediaNativeEditView.tsx:8); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Replace inherited shared-editor-only evidence with this actual Media wrapper, its registration and installed document-slot contract.
- **Rationale:** MediaNativeEditView accepts DocumentViewClientProps and forwards them to the shared editor at 8, setting studioCollection="media" after the spread. The discriminator cannot be overridden by incoming props. Media config registers this exact edit export; the shared editor strips the discriminator and passes framework slots to DefaultEditView. This is not DOM/ARIA/ref forwarding.
- **Evidence:** inspected owner SHA-256 `77b18d079092789e1fa6354564c9ea8ec8ee1294df5dc19b8b0a7cb0e13efdd0`. Supporting: [apps/admin/src/cms/collections/media.ts:25](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/media.ts:25); [apps/admin/app/(payload)/web-studio/importMap.js:113](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:113>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Media wrapper discriminator/type or registration, shared editor slot ownership, Payload upgrade or new non-framework props require re-review.

### Position 34 / ledger 83 — exact-rebind: Media list adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/media/list/MediaNativeListView.tsx:13](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/media/list/MediaNativeListView.tsx:13); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Shared edit evidence is not the list contract. This Media list and the actual shared list/drawer boundary were inspected independently.
- **Rationale:** MediaNativeListView accepts Omit<NativeCollectionListViewProps,"collectionSlug"> and forwards it at 13 with collectionSlug="media" after the spread. Media config/import map point at this exact list export. The shared list preserves incoming framework props to DefaultListView in a drawer and owns shell/grid inputs outside it; a field-by-field copy here would duplicate that adapter contract.
- **Evidence:** inspected owner SHA-256 `525d20472eaababa9b72a3892aaae0b916254367740abbf24dddf8e3cc027df4`. Supporting: [apps/admin/src/cms/collections/media.ts:25](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/media.ts:25); [apps/admin/app/(payload)/web-studio/importMap.js:113](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:113>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Media list slug, shared custom-prop shape, drawer routing, collection registration or installed Payload list changes require new qualification.

### Position 35 / ledger 84 — exact-rebind: Ministry updates document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/ministry-updates/document/MinistryUpdatesNativeEditView.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/ministry-updates/document/MinistryUpdatesNativeEditView.tsx:9); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Individually replace the generic view/router rationale with the MinistryUpdates DocumentViewClientProps boundary.
- **Rationale:** MinistryUpdatesNativeEditView uses the Payload document prop type, spreads into NativeCollectionEditView at 9 and pins studioCollection="ministry-updates" after it. Ministry-updates config registers this exact editor only within its native feature branch. Shared slot forwarding, not a visible DOM object, is the consumer contract; this does not qualify its separate create flow.
- **Evidence:** inspected owner SHA-256 `5cff1363a75a2c965effa52653d23fa65bc977e3a51f16d911af72df843245d2`. Supporting: [apps/admin/src/cms/collections/ministry-updates.ts:20](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/ministry-updates.ts:20); [apps/admin/app/(payload)/web-studio/importMap.js:110](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:110>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Document discriminator/type, native registration, shared slots or MinistryUpdate create/edit ownership changes require re-review.

### Position 36 / ledger 85 — exact-rebind: Ministry updates list preserves its template create override

- **Site:** [apps/admin/src/cms-ui/web-studio/ministry-updates/list/MinistryUpdatesNativeListView.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/ministry-updates/list/MinistryUpdatesNativeListView.tsx:17); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Unlike the other list wrappers, this one has a deliberate createHrefOverride; an undifferentiated spread waiver would miss that contract.
- **Rationale:** The Omit<NativeCollectionListViewProps,"collectionSlug"> wrapper forwards at 17, then fixes both collectionSlug="ministry-updates" and createHrefOverride="/web-studio/templates?pageType=ministry_update". Shared list creates the href only when hasCreatePermission is true. The actual registered adapter retains framework list/column/permission inputs while routing create to templates; neither the shared editor nor another collection is sufficient evidence.
- **Evidence:** inspected owner SHA-256 `8e2000b44bb10faaefdfa5fb6263b94b5bf6e45d392f2be8a2ecb7395d4f485b`. Supporting: [apps/admin/src/cms/collections/ministry-updates.ts:20](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/ministry-updates.ts:20); [apps/admin/app/(payload)/web-studio/importMap.js:110](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:110>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified. No create-template navigation or real permissions test executed.
- **Reconsider:** Template create destination, hasCreatePermission gating, slug, drawer route, list contract or Payload list version changes require separate review.

### Position 37 / ledger 86 — exact-rebind: Missionary giving pages document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/missionary-giving-pages/document/MissionaryGivingPagesNativeEditView.tsx:12](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/missionary-giving-pages/document/MissionaryGivingPagesNativeEditView.tsx:12); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Use actual giving-pages document signature/registration, not generic link behavior or the similarly named list adapter.
- **Rationale:** MissionaryGivingPagesNativeEditView forwards DocumentViewClientProps at 12, then pins studioCollection="missionary-giving-pages". The giving-pages collection registers the exact editor in its conditional native branch; the shared editor removes the discriminator before DefaultEditView. The spread is a document-slot integration boundary, not donor payment data or arbitrary HTML props.
- **Evidence:** inspected owner SHA-256 `1aca91393cda9b0b7adcf9afbb94f811bc778f3d995de39f8a664918761ef45b`. Supporting: [apps/admin/src/cms/collections/missionary-giving-pages.ts:58](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/missionary-giving-pages.ts:58); [apps/admin/app/(payload)/web-studio/importMap.js:100](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:100>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified. No public giving-page/payment behavior is qualified.
- **Reconsider:** Giving-pages editor type/slug, slot overrides, collection/create-flow registration or Payload document-contract changes require review.

### Position 38 / ledger 87 — exact-rebind: Missionary giving pages list adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/missionary-giving-pages/list/MissionaryGivingPagesNativeListView.tsx:17](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/missionary-giving-pages/list/MissionaryGivingPagesNativeListView.tsx:17); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Replace inherited editor-only evidence with actual giving-pages list type, fixed slug and list/drawer consumer.
- **Rationale:** MissionaryGivingPagesNativeListView takes the shared custom list type minus collectionSlug, forwards at 17 and pins "missionary-giving-pages" at 18. Its exact config registration/import-map export is present. It preserves the framework adapter inputs that the shared drawer branch passes to stock Payload; normal grid behavior is outside this narrow spread recommendation.
- **Evidence:** inspected owner SHA-256 `0e55a6e729c232f12f76eaff2d0d9dfbb5bb11af3cf98591580facfd2888a659`. Supporting: [apps/admin/src/cms/collections/missionary-giving-pages.ts:58](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/missionary-giving-pages.ts:58); [apps/admin/app/(payload)/web-studio/importMap.js:100](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:100>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Giving-pages slug, framework list/custom props, drawer selection boundary, registration or underlying grid interface changes require re-review.

### Position 39 / ledger 88 — exact-rebind: Missionary profiles document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/missionary-profiles/document/MissionaryProfilesNativeEditView.tsx:12](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/missionary-profiles/document/MissionaryProfilesNativeEditView.tsx:12); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** The specific profile editor is a Payload document-slot adapter; a general router/form forwarding rationale is too broad.
- **Rationale:** MissionaryProfilesNativeEditView forwards DocumentViewClientProps at 12 and supplies studioCollection="missionary-profiles" afterward. The profiles collection config resolves this exact editor, while the shared editor owns discriminator removal/content-slot overrides. No data from the incoming framework props is reinterpreted as DOM props in this wrapper.
- **Evidence:** inspected owner SHA-256 `54d70f6dd10e7dc914e71d7a3bbf7b6da45e1b062865f7209e61d55505c3cdf1`. Supporting: [apps/admin/src/cms/collections/missionary-profiles.ts:19](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/missionary-profiles.ts:19); [apps/admin/app/(payload)/web-studio/importMap.js:108](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:108>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified. No profile publication or tenant-permission correctness claim.
- **Reconsider:** Profile discriminator/type, slots/provider ownership, registration or installed Payload document shape changes require review.

### Position 40 / ledger 89 — exact-rebind: Missionary profiles list adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/missionary-profiles/list/MissionaryProfilesNativeListView.tsx:16](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/missionary-profiles/list/MissionaryProfilesNativeListView.tsx:16); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Read independently from the profile editor; old shared-editor evidence cannot establish list/column/drawer forwarding.
- **Rationale:** The profile list wrapper accepts the shared custom list contract excluding collectionSlug; the 16 spread is followed by the explicit "missionary-profiles" slug. Its own conditional collection registration and map entry identify a real framework consumer. The shared list keeps drawer props intact; this recommendation does not certify the normal profile grid or claim its type aliases every installed optional Payload prop.
- **Evidence:** inspected owner SHA-256 `61c10dd73b362ba32e4f7c17ab4f067f8fbb94ed821d213bd48be83767f876a9`. Supporting: [apps/admin/src/cms/collections/missionary-profiles.ts:19](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/missionary-profiles.ts:19); [apps/admin/app/(payload)/web-studio/importMap.js:108](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:108>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Profile list slug/custom contract, drawer behavior, registration or installed Payload list interface changes require re-review.

### Position 41 / ledger 90 — exact-rebind: Navigation document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/navigation/document/NavigationNativeEditView.tsx:8](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/navigation/document/NavigationNativeEditView.tsx:8); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** This is the Navigation CMS document view, not arbitrary navigation/router-link props.
- **Rationale:** NavigationNativeEditView at 8 forwards DocumentViewClientProps into the shared editor with a post-spread studioCollection="navigation". Navigation config/import map register the exact document export. The installed Payload slot/form-state/view-type contract and shared discriminator removal explain the spread; router href/ref claims from the old broad rationale are unnecessary.
- **Evidence:** inspected owner SHA-256 `f7611a0067111c8b491b7732a8466e9c9ba6c5ee479d4d6fea78c8dc616d7500`. Supporting: [apps/admin/src/cms/collections/navigation.ts:26](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/navigation.ts:26); [apps/admin/app/(payload)/web-studio/importMap.js:106](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:106>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified. No public navigation publish/link behavior is certified.
- **Reconsider:** Navigation document type/discriminator, content slots or Payload/config registration changes require new review.

### Position 42 / ledger 91 — exact-rebind: Navigation list adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/navigation/list/NavigationNativeListView.tsx:13](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/navigation/list/NavigationNativeListView.tsx:13); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** The Navigation list has its own shared-list contract; do not reuse document-editor-only evidence.
- **Rationale:** NavigationNativeListView takes Omit<NativeCollectionListViewProps,"collectionSlug"> and forwards at 13 with explicit "navigation" afterward. Its own collection registration/map entry exists. Shared list code preserves the actual input object in drawer context and explicitly consumes list permissions/columns outside it; this wrapper need not enumerate those evolving framework inputs.
- **Evidence:** inspected owner SHA-256 `6e2e10eb065ca54d86797abbc259b1572ea6d9edb712d3c8cd1ecd9aa94b8f03`. Supporting: [apps/admin/src/cms/collections/navigation.ts:26](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/navigation.ts:26); [apps/admin/app/(payload)/web-studio/importMap.js:106](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:106>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Navigation slug/custom list shape, drawer context, registration or Payload list-contract changes require review.

### Position 43 / ledger 92 — exact-rebind: Page templates document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/page-templates/document/PageTemplatesNativeEditView.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/page-templates/document/PageTemplatesNativeEditView.tsx:9); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Replace generic forwarding prose with the exact PageTemplates DocumentViewClientProps/discriminator path.
- **Rationale:** PageTemplatesNativeEditView spreads Payload document props at 9 then pins studioCollection="page-templates". Its collection registers that exact editor and the import map resolves it. The shared editor forwards stripped framework props plus deliberate slots to DefaultEditView; this is unrelated to runtime template catalogue contents or create-flow correctness.
- **Evidence:** inspected owner SHA-256 `77ae318029e5c6a157e84595658a89c3de60d66075c23bd1eb3a71b544e894a4`. Supporting: [apps/admin/src/cms/collections/page-templates.ts:18](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/page-templates.ts:18); [apps/admin/app/(payload)/web-studio/importMap.js:97](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:97>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified. Active catalogue writer changes are not approved by this adapter recommendation.
- **Reconsider:** Template document discriminator/type, editor slots, catalogue-to-editor handoff or Payload view contract changes require separate review.

### Position 44 / ledger 93 — exact-rebind: Page templates list adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/page-templates/list/PageTemplatesNativeListView.tsx:16](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/page-templates/list/PageTemplatesNativeListView.tsx:16); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** The actual page-templates list boundary replaces the old shared-edit-only evidence; no catalogue acceptance is inferred.
- **Rationale:** The custom list prop type omits collectionSlug, and PageTemplatesNativeListView supplies "page-templates" after its spread at 16. Collection config and map resolve this exact list export. The relevant consumers are NativeCollectionListView and installed Payload list props, not DefaultEditView. No extra create override is supplied in this wrapper.
- **Evidence:** inspected owner SHA-256 `a08cbfaadfbf3280bcf3a28fb47480a51861c959fb4963a4693dc907a8d4cfc4`. Supporting: [apps/admin/src/cms/collections/page-templates.ts:18](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/page-templates.ts:18); [apps/admin/app/(payload)/web-studio/importMap.js:97](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:97>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified. No active catalogue/grid product acceptance.
- **Reconsider:** Template list/custom inputs, slug, create destination, drawer routing or installed framework contract changes require re-review.

### Position 45 / ledger 94 — exact-rebind: Pages document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/pages/document/PagesNativeEditView.tsx:8](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/pages/document/PagesNativeEditView.tsx:8); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Individually verify the Pages wrapper; the shared editor alone does not prove this collection/prop binding.
- **Rationale:** PagesNativeEditView forwards DocumentViewClientProps at 8 and fixes studioCollection="pages" after the spread. Pages config registers this exact edit export and the map resolves it. Shared editor removes that collection-only prop and intentionally forwards the remaining slot contract to DefaultEditView, so the spread is not an arbitrary app object.
- **Evidence:** inspected owner SHA-256 `249dcc3afe01b4726d9a7afe8adccad8098858c105b0c2c081403e5c3c30bd0d`. Supporting: [apps/admin/src/cms/collections/pages.ts:28](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/pages.ts:28); [apps/admin/app/(payload)/web-studio/importMap.js:93](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:93>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified. No page preview/publication behavior or draft permissions certified.
- **Reconsider:** Pages document discriminator, view slots/type, config registration or Payload document contract changes require review.

### Position 46 / ledger 95 — exact-rebind: Pages list adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/pages/list/PagesNativeListView.tsx:13](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/pages/list/PagesNativeListView.tsx:13); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** The Pages list is adjudicated against its own custom-list and drawer consumer, not the Pages edit waiver.
- **Rationale:** PagesNativeListView forwards the shared custom list type minus collectionSlug at 13 then pins "pages". Its collection config and actual map entry give it a supported framework consumer. Drawer forwarding preserves Payload slots/column/permission inputs through the shared boundary; a local manual reconstruction would not improve that contract. Full normal-grid behavior remains separate.
- **Evidence:** inspected owner SHA-256 `fa3fb60451d0ae183b5c1fe82425e5c18cb25a062099025f944aa7d9ab364a19`. Supporting: [apps/admin/src/cms/collections/pages.ts:28](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/pages.ts:28); [apps/admin/app/(payload)/web-studio/importMap.js:93](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:93>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Pages custom-list contract/slug, drawer selection, registered consumer or Payload list interface changes require a new review.

### Position 47 / ledger 96 — exact-rebind: Project pages document adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/project-pages/document/ProjectPagesNativeEditView.tsx:9](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/project-pages/document/ProjectPagesNativeEditView.tsx:9); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Qualify the ProjectPages document signature and fixed collection separately; do not treat it as a generic router/ref spread.
- **Rationale:** ProjectPagesNativeEditView uses DocumentViewClientProps and spreads at 9 with studioCollection="project-pages" afterward. Project-pages config registers the exact editor and its import-map export is present. Shared editor removes the discriminator and forwards framework view slots, establishing an intentional document adapter without approving unrelated project content or public navigation.
- **Evidence:** inspected owner SHA-256 `80aede422eecc16b70a904811d7afc51ce32dc30512780e98c69d3ff515ee8d6`. Supporting: [apps/admin/src/cms/collections/project-pages.ts:27](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/project-pages.ts:27); [apps/admin/app/(payload)/web-studio/importMap.js:103](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:103>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The real shared editor is exercised by the adjacent suite, but DefaultEditView/providers/settings dialog are mocked. No exact collection-wrapper or installed Payload runtime test was established or executed; conditional registration is not activation proof.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Project document props/discriminator, slot overrides, registration or installed Payload document changes require reconsideration.

### Position 48 / ledger 97 — exact-rebind: Project pages list adapter

- **Site:** [apps/admin/src/cms-ui/web-studio/project-pages/list/ProjectPagesNativeListView.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/project-pages/list/ProjectPagesNativeListView.tsx:15); `react-doctor/jsx-props-no-spreading`. Retained r13r2 candidate only.
- **Prior rationale:** Replace inherited shared-edit evidence with this list signature, slug, registered consumer and installed list input contract.
- **Rationale:** ProjectPagesNativeListView accepts the shared custom list contract with collectionSlug omitted, forwards at 15 and supplies "project-pages" afterward. Project config/map resolve the exact export. Shared drawer mode forwards the original list props to DefaultListView; normal mode owns grid/shell inputs. This scope does not authorize hiding arbitrary data props or certify the active grid writer.
- **Evidence:** inspected owner SHA-256 `cd521703a78e8f74ebacc4fb1df8c31a43bc912510ca9b4ddca8b2bc269963c7`. Supporting: [apps/admin/src/cms/collections/project-pages.ts:27](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms/collections/project-pages.ts:27); [apps/admin/app/(payload)/web-studio/importMap.js:103](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(payload)/web-studio/importMap.js:103>). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The shared-list consumer uses mocked DefaultListView/grid/providers. It checks branch/prop plumbing, not this exact wrapper or real Payload selection. No suite executed and no flag/tenant activation claim.
- **Limits:** Static integration-boundary qualification only. Current grid/catalogue/native-editor product behavior, access enforcement, optional flag activation, installed Payload runtime and real framework rendering remain unverified.
- **Reconsider:** Project list slug/custom type, drawer mode, grid interface, registry mapping or Payload list API changes require another review.

### Position 49 / ledger 99 — exact-rebind: Donor feed Loading updates spinner

- **Site:** [apps/donor/app/(dashboard)/donor-dashboard/feed/page-client.tsx:306](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(dashboard)/donor-dashboard/feed/page-client.tsx:306>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Resolve this exact donor feed loading branch and import chain; generic shared CSS alone is not the full row rationale.
- **Rationale:** At 302-309 the feed loading state has role=status, Loader2 animate-spin at 306 and visible Loading updates text at 308. This is not spinner-essential, so donor root/shared CSS removes repeated spin while keeping an explicit non-moving loading message. The loaded feed test cannot be counted as loader coverage.
- **Evidence:** inspected owner SHA-256 `ac08639b8981fdfdf93f0ce2f00589326385247323067f9219a96db066735571`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Owner real, data hooks mocked; existing heading test does not exercise the spinner. No test or browser preference run.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 50 / ledger 100 — exact-rebind: Donor history lazy-chart pulse placeholder

- **Site:** [apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx:123](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx:123>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Qualify the exact aria-hidden chart placeholder, not transaction/data loading behavior.
- **Rationale:** HistoryChartFallback at 123 is an aria-hidden rectangular animate-pulse div. MonthlyGivingChart returns it only before the lazy Recharts module exists, and has separate failure and no-data text branches. The donor policy reduces the pulse to one near-instant iteration; no changing information exists only in this decorative placeholder.
- **Evidence:** inspected owner SHA-256 `8162573ef739c0a90b3979180bf7680ab5b20308b6ba8802e00213e877bda6b7`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct existing test was established for this chart-placeholder reduced-motion state. Source inspection only; no test execution or chart fetch/import failure runtime proof.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No statement about chart totals, donor transaction correctness or import failure behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 51 / ledger 101 — exact-rebind: Pledges billing-portal action spinner

- **Site:** [apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx:128](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx:128>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Supported for the aria-hidden icon; existing pending-focus test is real-page synthetic evidence, not CSS.
- **Rationale:** The portal action at 128 keeps its Manage in billing portal label while an aria-hidden animate-spin Loader2 indicates pending. No spinner-essential class bypasses donor reduced motion. Static meaningful action text survives without rotation; portal initiation, focus and disabled behavior remain separately owned.
- **Evidence:** inspected owner SHA-256 `9f1b6c83c09b214c20aeace097e3b9ab2fec40fa0793673a43f5379e4feb1341`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Actual page consumer with synthetic portal/data boundary; existing pending-focus assertions inspected, not run. No CSS/browser/real portal proof.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 52 / ledger 102 — exact-rebind: Settings profile Save changes spinner

- **Site:** [apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:273](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:273>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Bind the profile-save occurrence273, not any of the other three animation candidates in this settings owner.
- **Rationale:** The profile action uses animate-spin at 273 while Saving text remains in the button at 277. Its isSubmitting branch is distinct from notifications, password and active-session pulse. It lacks spinner-essential, so the donor global policy removes repeat spin without suppressing the visible save state.
- **Evidence:** inspected owner SHA-256 `7b7b2073c5a41c673a545cc14f00bd47e0cc42a2a50850f1e14352650474d746`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Existing test targets profile pending feedback, not computed CSS. Owner real, boundaries mocked; no test execution.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 53 / ledger 103 — exact-rebind: Settings notification-preference spinner

- **Site:** [apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:640](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:640>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Select notification submit640 independently of profile273/password769/session919.
- **Rationale:** The notification save action has its own isSubmitting Loader2 at 640 and text branch Saving / Save Preferences at 644-650. The SVG has no spinner-essential exemption. The donor shared rule bounds its rotation and leaves the preference-submit label, so this exact CSS warning can be requalified without approving notification delivery or persistence.
- **Evidence:** inspected owner SHA-256 `7b7b2073c5a41c673a545cc14f00bd47e0cc42a2a50850f1e14352650474d746`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No exact notification-pending motion test established; shared settings tests are not interchangeable coverage for all four occurrences. No suite executed.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No live notification settings/provider synchronization proof.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 54 / ledger 104 — exact-rebind: Settings password Updating spinner

- **Site:** [apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:769](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:769>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Select the password action769, not another settings loader with similar JSX.
- **Rationale:** The password form action renders animate-spin at 769 and explicit Updating / Update Password text at 773-779. This exact icon does not use spinner-essential. The shared donor baseline removes repeat spin; the changing password action label remains, without claiming that authentication or password persistence has been tested.
- **Evidence:** inspected owner SHA-256 `7b7b2073c5a41c673a545cc14f00bd47e0cc42a2a50850f1e14352650474d746`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** The suite uses synthetic form/auth boundaries and is not this pending CSS behavior. Not executed; no password/auth operation.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No password security, save, no-JS or authentication certification.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 55 / ledger 105 — exact-rebind: Settings active-session dot pulse

- **Site:** [apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:919](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:919>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Motion-only qualification. The literal location/Active now text must not be promoted to verified session truth.
- **Rationale:** The animate-pulse span at 919 is a small session-status dot adjacent to San Francisco / Active now text at 916. It lacks spinner-essential. The global donor policy leaves a static dot/text rather than repeated pulsing; reducing motion does not remove the status words. Whether this session/location text reflects reality is outside this diagnostic.
- **Evidence:** inspected owner SHA-256 `7b7b2073c5a41c673a545cc14f00bd47e0cc42a2a50850f1e14352650474d746`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No exact active-session pulse/source-of-truth consumer test established or executed. Motion is assessed structurally, not against a real account/session.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. This recommendation explicitly does not ratify session/location/active-state accuracy.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 56 / ledger 108 — exact-rebind: Public financials expense-chart skeleton pulse

- **Site:** [apps/donor/app/(public)/(hero)/financials/financials-client.tsx:34](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(hero)/financials/financials-client.tsx:34>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Qualify the aria-hidden loading skeleton only; the visible allocation figures are not validated financial evidence.
- **Rationale:** FinancialsChartFallback at 34 is an aria-hidden animate-pulse rectangle before the lazy Recharts module resolves. The page keeps expense allocation labels/figures as separate content and a separate chart-failure status. Without spinner-essential the donor shared rule collapses the pulse, leaving a static placeholder and content. This does not certify the hard-coded percentages.
- **Evidence:** inspected owner SHA-256 `513724c479130bb5c66748ee006b7bbc83f677e36e39f5020a4007676dec534c`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct financial chart-placeholder motion consumer test established or run. No external financial/provider data or current browser inspected.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No audit/accounting/public allocation-data correctness claim.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 57 / ledger 109 — exact-rebind: Checkout fee-summary fade and slide

- **Site:** [apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:405](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:405>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Select the fee-copy wrapper405, not either payment/configuration spinner later in checkout.
- **Rationale:** The fee summary animate-in/fade/slide wrapper at 405 encloses visible fee text at 407-411. It has no spinner-essential. The donor rule shortens CSS animation/transition duration to 0.01ms with one iteration, allowing the summary text to settle without spatial entrance motion. Fee computation and payment processing are not established by this animation-only review.
- **Evidence:** inspected owner SHA-256 `47773fd7f8e197de7954337ecc3cf6d973e5f966387fe9498b5a481afce257d1`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Checkout owner real, synthetic provider/UI/motion boundaries; summary assertions are not computed animation evidence. No execution.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No payment, fee-amount, provider or disclosure correctness certification.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 58 / ledger 110 — exact-rebind: Checkout Processing payment spinner

- **Site:** [apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:1080](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:1080>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Bind the payment-submit1080 icon; retained test source genuinely exercises a pending promise, but it was not executed here.
- **Rationale:** The exact Loader2 at 1080 is aria-hidden, while the button uses the explicit Processing payment accessible name at 1074-1077. It is not spinner-essential. Shared donor CSS removes repeated spin while the pending name survives. Existing real-checkout test source defers a mocked Stripe confirmation and asserts initiating focus/aria-disabled/name instead of early success; that is not live payment proof.
- **Evidence:** inspected owner SHA-256 `47773fd7f8e197de7954337ecc3cf6d973e5f966387fe9498b5a481afce257d1`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real owner under synthetic provider/UI/motion boundaries. Pending case read only; no live charge, confirmation, browser CSS or test execution.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No financial/provider outcome or duplicate-charge protection certification.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 59 / ledger 111 — exact-rebind: Checkout runtime-configuration loading spinner

- **Site:** [apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:1111](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx:1111>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Select the configuration loading1111 icon, distinct from submit1080 and fee wrapper405.
- **Rationale:** The configuration loading panel at 1108 has role=status and a decorative aria-hidden animate-spin icon at 1111, with loading title/message at 1116-1120. It lacks spinner-essential. The donor shared baseline stops repeat spin without replacing or concealing those configuration state words.
- **Evidence:** inspected owner SHA-256 `47773fd7f8e197de7954337ecc3cf6d973e5f966387fe9498b5a481afce257d1`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Configuration tests mock fetch/Stripe or inspect source. No exact computed-motion assertion, live provider, or test execution.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No runtime-config correctness, credential or payment readiness certification.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 60 / ledger 113 — exact-rebind: Where-we-work dynamic map loading spinner

- **Site:** [apps/donor/app/(public)/(solid)/where-we-work/where-we-work-client.tsx:16](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/where-we-work/where-we-work-client.tsx:16>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Qualify the actual dynamic-loading boundary, not the loaded map/canvas interaction.
- **Rationale:** The dynamic map fallback has role=status / aria-busy and a border animate-spin element at 16 alongside Loading map text at 18. It is ordinary CSS, not spinner-essential. The donor shared rule bounds its rotation while the explicit fallback message stays. This says nothing about the eventual map animation/rendering engine.
- **Evidence:** inspected owner SHA-256 `ba7ddab4971f625b7192b1ee50d386ab4e828f50fb6333c322fddc4ed0e35da0`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct real map-loading reduced-motion consumer test established or executed. No map/browser/server/provider started.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. MapLibre/canvas motion and actual map load/failure behavior are not waived.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 61 / ledger 114 — exact-rebind: Worker status decorative ping

- **Site:** [apps/donor/app/(public)/(solid)/workers/[id]/page.tsx:179](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/workers/[id]/page.tsx:179>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Qualify ping179 separately from the giving-widget placeholder205; text/dot survive even if the ping vanishes.
- **Rationale:** The worker profile status has an aria-hidden animate-ping outer marker at 179 and a static inner dot at 180 plus descriptive worker text at 182. There is no spinner-essential exemption. Reduced-motion CSS allows at most one near-instant ping; even if its final opacity disappears, the static dot/text still carry the information.
- **Evidence:** inspected owner SHA-256 `8b2d1f297ee0a78681d1be1e1bc642482c7feb76ac38919c51ddaf683926549d`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Acceptance-named test is synthetic static markup, not deployed/authenticated acceptance. It does not measure ping/reduced-motion CSS and was not run.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No status/presence/data accuracy certification.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 62 / ledger 115 — exact-rebind: Worker giving-widget fallback pulse

- **Site:** [apps/donor/app/(public)/(solid)/workers/[id]/page.tsx:205](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/workers/[id]/page.tsx:205>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Bind the giving Suspense fallback205 independently of the status ping179.
- **Rationale:** The giving-widget loading placeholder uses animate-pulse at 205 in the worker server shell while the real widget is behind Suspense. No spinner-essential class bypasses the donor CSS baseline, so pulsing collapses to a static placeholder. The placeholder is not a financial total or evidence of a completed gift.
- **Evidence:** inspected owner SHA-256 `8b2d1f297ee0a78681d1be1e1bc642482c7feb76ac38919c51ddaf683926549d`. Supporting: [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371); [apps/donor/app/layout.tsx:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/layout.tsx:15). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** Real shell with synthetic boundaries. No current RSC stream, giving provider or measured fallback motion proved; no execution.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No giving-widget/payment functionality or accessibility certification.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 63 / ledger 116 — exact-rebind: Worker Story panel CSS entrance

- **Site:** [apps/donor/app/(public)/(solid)/workers/[id]/tabs-client.tsx:56](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/workers/[id]/tabs-client.tsx:56>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Select value=story56 rather than the adjacent updates63 candidate; identical-looking classes are separate panel owners.
- **Rationale:** The Story TabsContent at 56 has animate-in/fade/slide classes and renders storyContent as its child. Shared TabsContent passes the class to Base UI Panel. It has no spinner-essential. The donor media query shortens its entrance to one near-instant iteration/transition; story text does not depend on animation to exist.
- **Evidence:** inspected owner SHA-256 `e7a764586472944a601cbf6180eb803ea1071bcb04209652d2282d37dcde7c7c`. Supporting: [packages/ui/components/shadcn/tabs-component.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs-component.tsx:64); [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct real Story tab-switch/reduced-motion test established or executed; the shell fixture is not Base UI keyboard/browser proof.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. Base UI tab keyboard/focus, mount behavior and story-content accuracy are not certified.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

### Position 64 / ledger 117 — exact-rebind: Worker Updates panel CSS entrance

- **Site:** [apps/donor/app/(public)/(solid)/workers/[id]/tabs-client.tsx:63](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/donor/app/(public)/(solid)/workers/[id]/tabs-client.tsx:63>); `react-doctor/no-ungated-tailwind-animation`. Retained r13r2 candidate only.
- **Prior rationale:** Select value=updates63 independently from Story56; do not pool the two matching class strings.
- **Rationale:** This TabsContent renders updatesContent under value=updates at 63 with its own fade/slide entrance. Shared TabsContent forwards className to Base UI Panel. With no spinner-essential, the imported donor reduced-motion rule collapses its CSS movement while content remains declarative. This scope is neither the Story panel nor a promise that updates have loaded correctly.
- **Evidence:** inspected owner SHA-256 `e7a764586472944a601cbf6180eb803ea1071bcb04209652d2282d37dcde7c7c`. Supporting: [packages/ui/components/shadcn/tabs-component.tsx:64](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/tabs-component.tsx:64); [packages/ui/styles/globals.css:371](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/styles/globals.css:371). Full source/consumer/installed-contract ranges and SHA-256 values are retained in JSON.
- **Consumers:** No direct Updates switching/data/reduced-motion consumer test established or run. Static shell rendering is not a browser/AT result.
- **Limits:** Source/cascade inspection only: no browser/computed CSS, preference emulation, keyboard/AT check, live provider, or test execution. The exception is limited to this exact CSS utility occurrence; it does not certify other accessibility, status truth, Motion/canvas, focus or hydration behavior. No updates data freshness, tab keyboard/focus or installed Base UI runtime acceptance.
- **Reconsider:** Reconsider if this occurrence, stylesheet import/cascade/layer, shared reduced-motion values, Tailwind output, or .spinner-essential participation changes; retain meaningful non-moving information. A stable fresh diagnostic and root review are required before any application.

## Structural handback verification

JSON serialization/parse and source-reference checks cover exactly65 unique positions, original ledger indices/identities/record hashes,65 distinct selected retained identities, per-record rationale/evidence/consumer limits/reconsideration, evidence hashes and line bounds, recommendation totals and zero approvals. This is structural report validation only: not a test pass, React Doctor validator result, repository preservation audit, build, runtime check or all-target acceptance. Only these two new artifacts are authored; no frozen r13r2 artifact is edited.

**Handback:**61 exact-rebind recommendations;0 retirements;1 reject/repair (3);3 holds (5,12,21). Root review remains required for every record.

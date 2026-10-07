# Core React cleanup implementation report — 2026-10-06

This report preserves the original local implementation evidence on `ffa8126`.
The PR integrates that cleanup into later `develop` source. Its current-base
validation, retained shipped changes, publication scope, and CI evidence are
recorded separately in `pr-validation.md`; the counts and local-only status below
are historical, not a claim about the later PR head.

The accepted cleanup is implemented locally in `/home/conrad/code/core`. React Doctor **0.9.17** completed all **eight targets and 1,373 source files** with **zero unexcepted warnings or errors**, **289 individually reviewed exceptions**, and **no skipped applicable scanner checks**. The final supported-CLI raw audit contains 8,589 diagnostics: 8,300 obsolete classic JSX import checks and 289 applicable findings. No numeric score, sharing, telemetry, or network-backed supply-chain checks were enabled.

Changes remain **local and uncommitted**. The checkout remains on the original `develop` HEAD, `ffa812656b0ff920b3fe014a31d2d57ee8679288`. Existing skill/environment work was preserved. `.codex/config.toml` and `packages/ui/components.json` still match their protected initial hashes. The final source readback matches all 2,200 source/config/tooling files inventoried by the strict audit; there were no later source changes from the build or final checks.

**Audit results.** Every diagnostic is retained before exception matching. Exceptions do not remove findings from the raw JSON. The applicable profile disables only `react-doctor/react-in-jsx-scope`, because these Next.js apps use the automatic JSX transform. The disposable raw profile re-enables that check for complete comparison.

| Target                | Files checked | Applicable findings, all reviewed | Unexcepted findings |
| --------------------- | ------------: | --------------------------------: | ------------------: |
| `apps/admin`          |           675 |                               107 |                   0 |
| `apps/donor`          |           140 |                                37 |                   0 |
| `apps/missionary`     |           117 |                                14 |                   0 |
| `packages/auth`       |            21 |                                 0 |                   0 |
| `packages/database`   |            61 |                                 1 |                   0 |
| `packages/lib`        |            55 |                                 2 |                   0 |
| `packages/missionary` |            37 |                                 9 |                   0 |
| `packages/ui`         |           267 |                               119 |                   0 |
| **Total**             |     **1,373** |                           **289** |               **0** |

The expanded planning inventory was 10,185 raw diagnostics, comprising 8,230 obsolete JSX checks and 1,955 applicable findings. Applicable diagnostics declined by **1,666**. This is a diagnostic delta, not a claim of 1,666 distinct behavioral bugs fixed. The original research used private analyzer orchestration; the permanent workflow and final audits exclusively use the supported public CLI. The complete baseline disposition retains all 10,185 original records: 8,230 obsolete automatic-JSX findings, 1,655 no longer reproduced by the current supported CLI, 254 matching current exception contexts, and 46 mapped to superseded contexts with reviewed current exceptions. Old records can converge on one current diagnostic; those categories are not one-to-one exception counts.

**Correctness and accessibility.** Contribution query keys, UUID validation, detail fetching, response parsing, and related invalidation now have one app-internal owner. The detail overlay and operation shell no longer import each other. Mutation ownership, revision checks, idempotency, refund calculations, draft state, and successful-operation handling remain together. Regression and browser fixtures cover failed submissions, stale revisions, refund limits, and a successful operation followed by refresh failure, so a refresh error cannot silently rewrite the operation result.

Team forms are keyed by their team/new-team ownership boundary to prevent submitting one team's draft for another. Automation/macro editor rows and attachment chips have stable event-created identities, so removals preserve the surviving editor and focus. Initial row identities are created once in the state initializer, and serialized payloads still contain the business values rather than these UI identities. Board empty-state rendering uses the authoritative item count. These substantive changes were reproduced before the fix and then verified with regression tests.

Data-grid shortcuts now respect native inputs, textareas, selects, editable elements, textbox/combobox ownership, and already-prevented events. Actual Chromium tests prove that Delete and Ctrl+C remain with an editor and that Escape returns keyboard ownership to the grid. Donation metrics abort obsolete requests and guard late JSON responses after identity changes or unmount. Funding-progress presentation clamps both ends of its visual ratio while preserving signed financial values and existing accessible descriptions.

Mobile location details use the existing shared Base UI dialog owner for focus entry, tab containment, Escape, dismissal, and focus restoration. Map profile/support actions use native links with the shared button variants, eliminating nested interactive controls. The light-theme marker label uses the existing darker emerald token after axe reproduced inadequate contrast; dark styling remains intact. Icon-only actions gained meaningful names and hover-only actions remain visible. Care controls have explicit label relationships, and table action columns have accessible names. Existing numeric editing drafts, subscriptions, annotation-only compiler behavior, and keyboard ownership were retained where verified.

**Composition and compatible APIs.** Contribution detail and operation rendering now use focused private module-level sections; the operation session continues to own its hooks and financial submission sequence. Donor contact/header/roster sections, pagination, image-trigger handling, composer actions, dashboard, CRM, support, Email Studio, and map rendering were similarly reduced in bounded changes. No global context or new memoization layer was introduced to lower scanner complexity.

Seven shared control entrypoints (`badge`, `button`, `button-group`, `tabs`, `toggle`, `navigation-menu`, and `combobox`) now use compatible `.ts` entrypoints with component implementations and variant utilities in separate files. The former `.tsx` entrypoint files were replaced, not abandoned. Public import paths, prop/ref forwarding, types, and Maia variant strings remain available. Tiptap's `image-view` entrypoint likewise preserves its four exports through separate image-node, extension, and resize modules. Regression tests cover public exports and variants. The public `PostComposerActions.handlePost` contract and shared `Globe`/`Settings` exports were checked against outside consumers and preserved.

**Typography, styling, and motion.** The main typography journal records 901 replacements across 206 files, and 266 caller font overrides were removed from 92 files so shared Maia controls own their font choices. Missionary-specific typography and localized layout journals retain the additional edits. Compact labels normally use `text-xs`; justified shared-control contracts remain exact exceptions. Tailwind v4 spellings, semantic sizes, tracking, padding, and shadows were reconciled with existing owners. Redundant nested card framing and redundant caller border/shadow overrides were removed. Decorative blurred color surfaces use equivalent radial color treatment where appropriate; unnecessary active pulse/bounce treatments were removed.

The existing reduced-motion policy, View Transition owners and identities, feature flags, silent revalidation, and Base UI/base-maia styling remain in place. No animation feature or React canary dependency was added. Two SVG paths were rounded to two decimals; coordinate changes stay within 0.005 viewBox units. Twenty before/after canvas comparisons covered five sizes, two themes, and two device-pixel ratios. Small renders were pixel-identical; the largest observed mean channel difference was approximately 0.00213 on a 0–255 scale. A side-by-side screenshot was visually inspected. This is specific logo evidence, not a claim that every application route received a visual comparison.

**Performance and unused code.** Selected-option membership now uses a Set while preserving selected order and removal behavior. Reusable Intl formatters were hoisted where safe, including hydration-safe timezone handling. Filter/map chains were flattened without changing order or formatter indices. Static UI values were moved out of repeated renders. Five chart view boundaries now load lazily while their data hooks and IDs remain with the eager owner. Recharts tooltip/legend public children remain synchronous where the consuming library requires that shape. Animation activity respects the existing reduced-motion hook.

Unused app-internal export modifiers, declarations, barrels, and legacy aliases were removed only after checking monorepo, framework, tests, dynamic consumers, and package boundaries. The reviewed-unused journal contains 47 disposition records mixing privacy changes and removals; it is not a count of 47 deleted symbols. Seven additional unused database legacy aliases/hooks were removed: `EmailTemplateBuilder`, `EmailTemplateCategory`, `MemberCareActivityType`, `CrmLinkEntityType`, `CrmSyncDomain`, `CrmSyncRecordStatus`, and `useCarePersonnel`. Their live SDK/member-care owners remain. Eleven redundant dependency declarations were removed from donor, missionary, and UI workspaces: duplicate Base UI declarations, donor next-themes/server Stripe/unused OpenPolicy CLI, missionary DnD declarations, and direct Tiptap Link/Underline declarations whose supported aggregate owner remains present. Missionary now explicitly declares its Tailwind v4 peer. Frozen Bun installs passed. No runtime package version upgrade was part of this cleanup.

**Permanent tooling and agent integration.** `doctor.config.json` explicitly registers 906 pinned rule settings, including optional checks, with an empty rule-ignore list. `scripts/react-doctor-audit.mjs` creates a physical disposable source copy, excludes credentials and generated catalogs, invokes the supported CLI using Node IPC, and verifies original/snapshot integrity. It rejects source escape, detects edits/additions/deletions/scanner rewrites, and never permits acceptance through the advisory exit policy. `scripts/react-doctor-ledger.mjs` requires full diagnostic identity, source/context hashes, nonempty supporting-file hashes, reasons, and reconsideration conditions. Stale, duplicate, missing, unsupported, or unconsumed exceptions fail the strict run. Thirty-two focused wrapper/ledger/snapshot tests passed, including failure cases for changed owners and malformed reports.

The existing first-party helper remains compatible with old invocation arguments and pins 0.9.17. New repository commands are `react-doctor:audit`, `react-doctor:raw`, `react-doctor:check`, and `test:react-cleanup`. The existing shadcn lint patch now discovers imported local variant definitions; its focused tests passed. Native authoring boundaries were updated for moved implementation files. Existing native suppression debt counts were retained or pruned, never increased. Both requested React Doctor skill variants and the Vercel React best-practices, composition-patterns, and View-Transitions skills informed the cleanup. The React Doctor guide and canonical skill were updated and synchronized; final `skills:verify` passed for the Codex, Claude Code, Cursor, and Eve development-catalog integration.

Two preexisting files, `.codex/ui-tools/kit-dashboard.mjs` and `.codex/ui-tools/runtimes.json`, needed formatting for the repository-wide check. Their normalized JavaScript AST and parsed JSON values were compared before/after and were identical; no environment setting was reconfigured. The proof is `/home/conrad/code/core/.reference/react-cleanup-2026-10-06/tool-format-verification.json`.

**Exceptions and retained decisions.** All 289 current findings have exact-site, evidence-backed records. A read-only reviewer completed independent source review, including supporting hashes and reconsideration conditions, with no remaining unknown/deferred candidate. During final review, a closed six-prop TaskForm spread was rejected as an exception: it was explicitly forwarded and its waiver withdrawn. Required framework/native/shared-control forwarding remains where source proves the contract. The rule counts below are accounting; each record still has its own location, explanation, and evidence.

| Rule                                    | Exact exceptions |
| --------------------------------------- | ---------------: |
| `jsx-props-no-spreading`                |              101 |
| `no-ungated-tailwind-animation`         |               97 |
| `unused-export`                         |               20 |
| `no-prevent-default`                    |                9 |
| `no-array-index-as-key`                 |                7 |
| `prefer-dynamic-import`                 |                6 |
| `jsx-handler-names`                     |                4 |
| `todo`                                  |                4 |
| `no-cramped-container-padding`          |                3 |
| `no-symmetric-text-button-padding`      |                3 |
| `prefer-tag-over-role`                  |                3 |
| `click-events-have-key-events`          |                2 |
| `effect-needs-cleanup`                  |                2 |
| `nextjs-no-client-side-redirect`        |                2 |
| `no-pass-live-state-to-parent`          |                2 |
| `no-static-element-interactions`        |                2 |
| `anchor-target-exists`                  |                1 |
| `async-await-in-loop`                   |                1 |
| `hook-use-state`                        |                1 |
| `jsx-no-useless-fragment`               |                1 |
| `nextjs-no-img-element`                 |                1 |
| `no-clone-element`                      |                1 |
| `no-create-object-url-without-revoke`   |                1 |
| `no-fetch-in-effect`                    |                1 |
| `no-layout-shifting-interaction-state`  |                1 |
| `no-loading-flag-reset-outside-finally` |                1 |
| `no-nested-card-surface`                |                1 |
| `no-pass-data-to-parent`                |                1 |
| `no-prop-callback-in-effect`            |                1 |
| `no-reset-all-state-on-prop-change`     |                1 |
| `no-side-tab-border`                    |                1 |
| `no-small-form-control-text`            |                1 |
| `no-tailwind-layout-transition`         |                1 |
| `only-export-components`                |                1 |
| `query-mutation-missing-invalidation`   |                1 |
| `refs`                                  |                1 |
| `server-sequential-independent-await`   |                1 |
| `unused-type`                           |                1 |

The 97 animation exceptions rely on Core's actual global reduced-motion policy and checked component behavior. The 101 spread exceptions cover verified native/framework/primitive/DnD/Payload/motion forwarding contracts. Twenty apparent unused exports remain because real tests, outside-target consumers, framework entrypoints, or public APIs use them; deleting them would break the verified boundary. Four compiler TODO findings preserve installed annotation-only compiler semantics. Synchronous chart children, editable numeric drafts, grid roles/keyboard handlers, attachment object-URL cleanup, subscription cleanup, mutation invalidation, and shared Maia density rules likewise remain where the ledger proves their owner. No uncertain real debt was admitted merely to meet acceptance.

Two exact native ESLint exceptions are separately recorded. The checkout payment factory captures refs and returns an async event handler; ref accesses occur only inside the returned handler, not during render-time factory creation. CRM CSV export uses browser navigation because the actual authenticated endpoint returns `Content-Disposition: attachment`; routing it as a Next page would alter download handling. These native inline comments do not suppress the disposable React Doctor findings. They are distinct from the retained native legacy design-system suppression budget.

**Excluded surfaces.** Build outputs, installed dependencies, vendor artifacts, and separately checked docs/tests/scripts/tooling/Supabase surfaces keep explicit ownership boundaries. Generated Eve skill-catalog copies are excluded from the source audit and checked by skill synchronization. The two exact MapLibre worker/shared asset names were excluded only after verifying the copy script, both Next config generation sites, and byte equality against installed MapLibre 6.10.0 for admin and donor. The generated directories were already Git-ignored. The worker SHA-256 is `7d5ebf88ec25a72cc48cc320d374f41d921e5105d2f1fc774d463a4b68164227`; shared asset SHA-256 is `0996a0ff2ecb2807afc3f053992539ff7fe45c1678a02304b2b33120136f81f3`. These assets were not hand-edited, and this ownership must be rechecked when MapLibre changes.

**Final verification.** Commands ran in native Ubuntu-24.04 WSL with the repository's installed toolchain. Workspace build/lint caches were used where their inputs matched; the final typecheck ran all 15 tasks without cache reuse.

| Check                                                                                                  | Result                                                                                  | Local evidence                                                                    |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `bun run react-doctor:check -- --output=.reference/react-cleanup-2026-10-06/final-actionable-verified` | All 8 targets; zero actionable warnings/errors; 289 exact exceptions; no skipped checks | `final-actionable-verified.log`, target JSON, `actionable.json`, `integrity.json` |
| Supported raw CLI audit with `--raw`                                                                   | All 8 targets; 8,589 raw / 8,300 obsolete JSX / 289 applicable; no skipped checks       | `final-raw-verified.log`, `final-raw-verified/`                                   |
| `bunx --no-install vitest run --coverage --maxWorkers=4`                                               | 5,788 passed; 4 existing skips; 754 files passed / 2 skipped                            | `full-unit-coverage-completion.log`                                               |
| `bun run test:react-cleanup`                                                                           | 73 Chromium tests passed, including axe assertions and focus/keyboard cases             | `browser-final.log`                                                               |
| `bun run build:strict`                                                                                 | Shared packages, admin, donor, missionary, and overall CI build passed                  | `affected-builds-completion.log`                                                  |
| `bun run typecheck`                                                                                    | 15/15 workspace tasks passed                                                            | `final-typecheck-completion.log`                                                  |
| `bun run lint`                                                                                         | 15/15 workspace tasks passed, no ESLint warning/error diagnostics                       | `final-native-lint-completion.log`                                                |
| `bun run format:check`                                                                                 | Entire repository formatting check passed                                               | `final-format-completion.log`                                                     |
| `bun run skills:verify`                                                                                | Canonical skills/mirrors/Eve catalog verification passed                                | `final-skills-verification-completion.log`                                        |
| Final source and protection readback                                                                   | Audited source unchanged; HEAD and protected file hashes unchanged                      | `final-source-readback.json`, `changed-files.json`                                |

**Verification limits.** Four existing unit skips remain: two live Stripe checkout-element cases, one live Stripe payment-intent case, and one Windows-specific environment-sync case under WSL. These are not skipped React Doctor checks. The coverage-enabled run completed, but Core's retained custom coverage provider reports `totalScripts: 0` and does not compute line/statement/branch totals; no coverage percentage or threshold certification is claimed. Native ESLint emitted its existing missing-`pages` discovery notice for these App Router applications; the 15-task gate still passed, and this notice is not an ESLint warning diagnostic. Existing native legacy design-system debt counts are still present.

Browser checks use actual React components with synthetic responses and isolated boundaries. Contribution Hub/CRM launch surfaces were exercised at 320/1280px in light/dark and reduced/normal motion, including failed/stale/refund/refresh-failure operation outcomes. Grid and mobile-dialog ownership were exercised in actual Chromium. Map engine, Next image/navigation, authentication/provider hooks are stubbed where needed. These checks do not certify authenticated whole-page integration, live Stripe/provider behavior, the actual MapLibre engine, or production deployment. Eve build uses artifact mode and does not provision or qualify live sandboxes. Existing financial/stale-response/hydration/draft/pending-focus assertions passed in the full unit suite. No dependency-security certification is claimed.

**Reviewable artifacts.** Read the [updated guide](../../guides/development/react-doctor.md), [exact exception ledger](exceptions.json), [native exceptions](native-exceptions.json), [complete baseline dispositions](finding-disposition.json), and [source-change inventory with hashes](changed-files.json). Full target raw/actionable reports, regression journals, review output, browser screenshots, and command logs are retained in `/home/conrad/code/core/.reference/react-cleanup-2026-10-06/`. The hashed change inventory covers app/package source, relevant scripts/tests/guides/QA, and tracked tooling. Root package/rule/lock manifests, canonical skill synchronization, and UI-tool formatting are recorded separately as supplemental changes because the initial source-hash inventory did not include them. Credentials and generated agent catalogs are excluded. It distinguishes entrypoint replacements from removal of public APIs. Preexisting modernization is preserved rather than reported as new React cleanup work.

The public CLI behavior was checked against the [React Doctor CLI reference](https://www.react.doctor/docs/reference/cli-reference) and [configuration documentation](https://www.react.doctor/docs/configuration/config-files). Compiler exception adjudication used installed source plus the [official annotation compilation mode contract](https://react.dev/reference/react-compiler/compilationMode). Coverage interpretation follows the actual repository provider and canonical Vitest skill; see the [official coverage documentation](https://vitest.dev/guide/coverage.html) for provider behavior. The full report is also copied into the current Windows task directory for convenient review.

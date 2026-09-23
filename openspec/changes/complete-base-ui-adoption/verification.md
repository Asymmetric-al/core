# Verification — AL-1894

## Source and dependency audit

- Based on `develop` at `c236455724a819ec800104be3e81f563da3de86b`, in an isolated worktree. The existing canonical worktree's unrelated changes were not modified.
- Official Base UI releases and npm registry verified 2026-09-22: stable 1.8.0; no newer beta/RC.
- Exact shared dependency is 1.8.0; unused app-level Base UI and Radix dependencies removed. Frozen install and workspace lock drift verification pass. Lockfile update retains unrelated vendored-package metadata rather than accepting Bun's incidental re-resolution of that graph.
- Shadcn CLI confirms Base UI, base-maia, Zinc, CSS variables, and existing shared aliases.
- Independent source review covered root dimensions/stacking, care export consumers, donor render composition, stable selection IDs, callback behavior, and dependency closure.

## Behavior evidence

- TDD reproduced and fixed the care profile missing TabsList context crash, missing care dialog semantics/Escape handling, donation radio/tab keyboard gaps, incorrect NavigationMenu state selectors, persistent multifilter semantics, and task partner duplicate-name keyboard selection/clear behavior.
- Existing donation payment/idempotency/fee tests remain unchanged in intent and pass alongside the added keyboard tests. No payment or task persistence logic was changed.
- Browser verification uses real shared production components and CSS in an isolated local fixture. Chromium at 1280×844 and 390×844 passes nested/scrolled Dialog, AlertDialog, Sheet, Drawer, care shortcuts, single/multiple filters, and duplicate-name partner selection. It checks stacking over high-z application content, viewport bounds, Tab containment, Escape, selection, clearing, and focus restoration.
- All 16 shared browser axe state scans report zero WCAG2A/AA/2.1AA violations; no page errors. Browser inspection found and repaired the Base UI 1.8 Empty live region's unwanted 64px blank space without hiding the live region.
- Real Next donor checkout route verified at desktop/mobile widths. Payment-tab checks use explicit local configuration/Stripe client stubs; they prove UI behavior, not provider integration. No payment POST or charge occurred.
- Physical iOS 26 Safari browser chrome is not emulated by the Chromium mobile viewport checks; device QA remains a release check.

## Repository checks

- All 15 workspace typechecks pass; scoped changed-workspace lint passes. Full lint passed with existing unrelated warnings.
- OpenSpec strict/full validation, shared shadcn configuration, frozen install, and Bun workspace-lock verification pass.
- Shadscan task baseline/floor: 29 using repository-pinned CLI 0.1.1. Current shared UI audit: 29; no regression.
- The repository React Doctor runner failed in Bun with `child.channel?.unref is not a function`. The same cached CLI and configured first-party target/flag set completed under Node with advisory findings. No numeric score is produced by the configured offline/no-score mode; this is not a claim that all findings are fixed. Existing compiler/complexity findings remain outside this primitive adoption scope; the shared collection-factory export follows the established wrapper API pattern.
- Full `bun run ci:preflight` passed, including all three production app builds and 4,338 unit tests across 590 passing files (4 tests / 2 files skipped by the existing harness). Final source includes the review fixes that preserve search focus before conditional Clear buttons unmount in all three multifilters. Focused regressions also verify continued keyboard selection after clearing.

## Expanded documentation compliance qualification (2026-09-23)

The initial evidence above describes the earlier upgrade. The follow-up reviews the current documentation index and is recorded in `docs/guides/base-ui-compliance.md` plus the handbook, controls, and overlay matrices. It includes all 37 component families, conditional utility/specialist boundaries, 153 state-callback wrapper contracts, 58 selector call sites (25 now searchable), and the complete 151-node disabled Button-family inventory.

- Local `bun run ci:preflight` passes, including all three application builds and 4,592 passing unit tests (four existing skips across two files).
- The committed `bun run test:e2e:base-ui` gate passes 76 tests across four projects, with 28 axe scans, no runtime errors, and no external or API requests. It includes actual consumer forms, mobile filter Drawer, responsive toolbar, native links, and the real rich-text editor. The fixture builds before preview to avoid development dependency-optimizer races.
- Independent reviews closed the Slider controlled-scalar/default-array precedence bug and preserved informative action names, upload labels, and responsive action names. Async payment and tenant-default regressions verify that keeping focus does not permit repeated writes.
- React Doctor completes all eight configured first-party targets through Node in offline/no-score advisory mode. Its Bun runner still fails with `child.channel?.unref`; remaining maintainability, informational-tooltip focus, and controlled numeric synchronization advisories are described in the compliance ledger.
- The latest npm registry has only `latest: 1.8.0` and no prerelease at or above 1.8.0. A semantic lockfile comparison confirms the follow-up only removes input-otp and its workspace declaration; formatting moved existing entries without upgrading unrelated packages.
- Physical iOS software-keyboard/browser-chrome behavior and provider-governed previews retain the explicit limits described above. No platform governance or credentials were changed.

The current repository attribution policy rejects the earlier PR's unsigned Blake commits for a Conrad-authenticated publication. The original history is preserved; the complete reviewed tree is published from develop under Conrad's registered identity. Final published-head CI/review evidence belongs to the successor pull request and must be checked live.

## Publication review follow-up (2026-09-23)

- Published successor [PR #1899](https://github.com/Asymmetric-al/core/pull/1899); #1896 is closed as superseded with its branch/history preserved. Integrated the reviewed remote fixes on current develop at `ea8086cf3`. The remote branch was subsequently rebased by another writer; recovery refs preserve the prior local and remote snapshots, and only unpublished local follow-up work was replayed onto the updated remote.
- The first published implementation head `2afaccbf8` passed the main CI gate, unit/build jobs, migrations, health smoke, and browser smoke. Its preview workflow failed during admin deployment before browser tests or donor/missionary deployments ran. [The deployment](https://vercel.com/asymmetric-al/admin/8yRXPYHs68EsMHZGBQC9HmFbF2zy) reports `BUILD_UTILS_SPAWN_1`; the underlying error is unconfirmed because the build-log connector failed and browser log access was unavailable. Historical Eve governance failures do not establish this current failure's cause.
- Review repairs keep details actions inside their labeled menu groups and retain finance-action focus only for the exact pending action, contribution, staged gift, and retry scope. Refund and unrelated actions retain native disabling. The corrected 151-node classification is 100 initiating actions, one return-focus target, 11 disabled peers, and 39 static/data-readiness prerequisites.
- Five focused menu tests include actual CRM cells with/without email and contribution cells, preserving callbacks. All 32 contribution-sheet tests pass; four added cases cover initiator focus, duplicate activation, pending recovery, and stale contribution/staged-gift identity.
- Eight bounded actual-sheet Chromium checks at desktop/mobile widths pass native focus and keyboard contracts with no runtime errors or external/API requests. The correction panel (never rendered) is stubbed and the shared API barrel is aliased to its exact row-contract module to avoid unrelated server imports; this is component evidence, not a live finance workflow. Its fixture server was stopped.
- CodeRabbit skipped review due to file/usage limits, and Codex cloud review reported exhausted usage. Independent implementation reviews and the returned Cursor findings were assessed separately; a skipped provider review is not approval.

### Subsequent review findings and evidence

- Notification tabs were nested inside Base UI 1.8's aria-hidden MenuGroupLabel. They now sit beside the presentational heading; the actual Menu/Tabs test verifies role discovery, selection, keyboard navigation, Escape and restored focus. Checkout's pending spinner is decorative while the button retains its processing name. These focused suites pass 27 tests; notification desktop/mobile browser checks pass without runtime errors.
- Login and registration now use synchronous in-flight guards. Registration's explicit pending state lasts until signUp settles instead of ending with an unawaited transition callback. Auth arguments, validation, errors and navigation are preserved. Three auth regressions, the two shared loading-button tests, and two composer tests pass; the composer tests now use the real shared Button. Two actual auth-component browser checks verify pending focus, Enter, programmatic submission, error recovery and success using inert provider stubs, with no external requests.
- Chromium disproves the proposed blanket native-disabled submit policy: Enter is blocked by both native-disabled and Base UI click-cancelled buttons, while requestSubmit bypasses both. Handler locks protect the actual auth operations. Installed TanStack Form synchronously changes canSubmit before awaiting, so two same-stack submissions invoke its callback once. No blanket focusability reversal or speculative offline-gift rewrite was made.
- CUSTOM.md now documents real menu-group ownership, presentational labels and the intentional Base OTPField adapter API/manual CLI-update boundary. The consumer guard covers DropdownMenu, ContextMenu and Menubar labels. Its six checks pass.
- A file crossing 1,000 lines and generic registry suggestions about existing compact styling are nonblocking maintainability/design suggestions under repository review policy. They do not justify a new button abstraction or a broad product styling change in this primitive contract repair. The existing exact base-maia configuration and product variants remain intact.

- A complete follow-up of the 33 remaining single-Select roots verifies all 29 value handlers have explicit nullable-value policies (four roots have no handler). Twenty-three actual-consumer callback-boundary tests pass; pagination retains supported nondefault sizes and avoids null coercion, and required enum/form/grid values do not receive an implicit null. Intentional clearing in the 25 SearchableSelect migrations remains intact. The controls guide records where the review's claimed reproduction/severity was not supported by the installed libraries or route parsers.

- After the review fixes, the durable browser gate passes all 76 cases again. The current Node-based React Doctor run completes all eight configured targets in changed-source, offline/no-score advisory mode; remaining findings include complexity, the documented controlled numeric synchronization, the Base collection-factory export, and small selection-array lookups. No new ignore or suppression was added.

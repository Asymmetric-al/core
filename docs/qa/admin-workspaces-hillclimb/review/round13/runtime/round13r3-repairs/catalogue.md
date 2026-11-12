# R13r3 catalogue/setup repairs

November 12, 2026 (Asia/Bangkok). **Source and harness repairs only; expected inventory, not collected evidence or acceptance.**

All work is confined to `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. In this report, Q means `docs/qa/admin-workspaces-hillclimb`; runtime paths are relative to `Q/review/round13/runtime`.

## Authority and boundary

- Authority: closed `refreeze/next-candidate-repair-decision.md` and the full independent `round13r2-catalogue-reconciliation/{README.md,proposed-inventory.json,core-setup-addendum.md,regression-contracts.md}`. The proposal supplies expected sets, not evidence that collection succeeded.
- Edited only catalogue/setup/inventory/brief modules and directly relevant harness tests. Product/shared UI, fixture definitions, collectors, manifests, frozen snapshots, old evidence, ledger and acceptance assembly are untouched by this repair.
- No real collector, browser, server, environment-file, provider, Git or child-agent operations ran. The existing runner source is evaluated only inside its mocked harness-test seam; the brief writer uses mocked filesystem tests. Pure catalogue imports/counting are not collection.
- This report does not reopen round13r2 or supply a new product/runtime freeze. Source changes here require separately attributed future harness identity and root-owned runtime verification.

## Implemented repairs

- `Q/module-states.mjs` now declares the 44-state proposal. `admin-staff-directory`, `admin-staff-search` and `admin-staff-no-results` name actual read-only staff states. The two filters start independently from the populated authorized directory; Dana-only and exact no-result content are required, not a loading/error/empty directory or an old team dialog.
- Mobilize and Events require their actual disconnected copy and correct destination links without navigating. `tasks-follow-ups` requires the populated needs-attention fixture, real contribution links and recent/open/100-item/retired-issues-excluded disclosure. These states do not assert a working applicant, attendance, team-task editing or creation workflow.
- `Q/catalogue-setups.mjs` gives the eight supported hooks positive overlay/panel/layout/filter assertions. Missing, hidden, disabled, rejected or ineffective actions fail; no false `clickFirst` return can qualify these hooks. Failures identify the state and pair key in a fatal `setup unqualified` exception.
- Care plan retains desktop/mobile and both full-page images, with fresh per-width setup. At 390px it uses the actual **Profile section** combobox and **Care plan** option, not hidden desktop tabs; desktop requires a selected tab. Both require the actual panel, goals/contact-schedules copy and Add a goal field. Existing mobile-navigation freshness and conversation `keepScroll` remain.
- PDF Export waits for the exact **enabled Export** trigger, at most 120,000ms, **before** clicking. Save readiness is not its substitute. Menu qualification requires actual native Test render/JSON items or classic PDF/HTML items. Disabled classic PDF also requires its real associated free-plan explanation; a disabled trigger or null config cannot establish free mode. Native and HTML items must be enabled. Setup clicks no export item, Save or provider operation. PDF studio keeps all four widths and its Save readiness, with an additional fatal setup guard so the warning-only legacy settled wait cannot qualify an unready editor.
- `Q/workspace-catalogue-setups.mjs` binds the gift-menu selector to the current fixture donor/gift and its actual amount/date/fund accessible name. The anchored menu, operation items, availability and supplied blocked explanations must match. The generic ellipsis, another gift or the underlying donor drawer cannot qualify; no gift operation runs.
- The unavailable `contribution-fund-correction` Hub setup now fails explicitly without action. Its historical name and desktop/mobile denominator remain; old sheet images are not form evidence. Separate opt-in `createOptionalCrmStates(bundle)` exposes **crm-fund-correction** only after donor membership and real `fund_correction.available === true` validation. It opens the exact enabled gift operation and requires the shared shell, exact heading, Destination fund and Reason at fresh desktop/mobile widths. No submission or notification runs.
- `Q/catalogue-inventory.mjs` provides pure strict selection, exact expected pair/PNG sets, per-area/per-width census and bounded plans. Empty, duplicate, unknown, retired and mismatched selections fail in this API. It does not inspect observed artifacts, write manifests or assemble acceptance. Product, harness and fixture identities are separate; missing inputs remain `NOT_PROVIDED`.
- `Q/write-briefs.mjs` uses truthful state groups and all four widths, retains incomplete axe IDs and route diagnostics, suppresses wrong-state Hub images, and discloses non-equivalence, unexercised workflows and historical gaps. It refuses existing brief targets before any write and uses exclusive `wx` writes. No real brief was generated.

### Unexercised workflows

`UNAVAILABLE_MODULE_WORKFLOWS` records these nine retired executable hooks as `NOT_EXERCISED`, with reasons and `equivalentWorkflow: false`:

`admin-team-manage`, `admin-team-create`, `mobilize-candidate`, `mobilize-add`, `events-venues`, `events-speakers`, `events-attendees`, `tasks-drawer`, `tasks-new`.

`UNAVAILABLE_WORKSPACE_WORKFLOWS` separately records the unavailable Hub correction entrypoint. No alias maps a staff filter, disconnected page, linked follow-up or CRM correction form to one of those missing workflows. This is observed UI scope, not ratification of shared staff-task-domain retirement or completion.

### Integration limitations requiring root-owned follow-up

These are intentionally **not** hidden by passing unit tests:

1. Legacy collectors still call `createStates(bundle.captureMeta)` without the bound bundle. The repaired gift setup fails closed for that call. An authorized later integration must pass the current sanctioned preflight bundle as `createStates(bundle.captureMeta, bundle)`; no stale frozen bundle or fabricated eligibility may substitute. The optional CRM state must also be explicitly selected with its current eligible bundle. It is not in defaults or default briefs.
2. Strict `selectStates` is a new pure preflight seam, **not wired into collector CLI filters**. Legacy CLI unknown/retired selection and zero-state behavior are not claimed fixed. Use of this seam before browser launch requires later authorized collector integration.
3. R02 coverage locks fatal semantic **setup** failures in both mocked runners: unsuccessful invocation, explicit pair/reason exception, preservation of earlier rows, no failed pair measurement/image/axe and cleanup. It does not repair the collectors' generic warning-only `ready`/`settled` catches or add durable failed-pair artifacts. The test called `settled-timeout` uses PDF's new fatal readiness setup guard; it is not proof that every legacy settled timeout now fails. Diagnostics/partials and actual termination provenance still need root reconciliation.
4. Optional CRM `operationContext` declares the expected `donor_crm_record`, donation and donor identity from the bound fixture. Selector/form tests and source wiring are not rendered-runtime context attestation.

Thus the full R02 and R08 collector/runtime contracts remain partially outstanding outside this ownership boundary. Do not describe the default collector pipeline as ready or these local guards as acceptance.

## Expected inventory and census

Derived read-only from the repaired real state modules; tests require exact pair/PNG equality with the independent proposal, not just matching totals. Viewports are D=desktop 1440x1000, I=intermediate 1024x900, S=small-tablet 640x900 and M=mobile 390x844. A full flag adds one full-page PNG per declared viewport, in addition to its viewport PNG.

| Primary area      | States | Pairs/check rows | Full PNGs | Total PNGs | D/I/S/M pairs |
| ----------------- | -----: | ---------------: | --------: | ---------: | ------------- |
| Shell             |     13 |               19 |        11 |         30 | 12/1/1/5      |
| People            |     14 |               27 |        21 |         48 | 14/2/2/9      |
| Support           |     10 |               16 |        13 |         29 | 10/1/1/4      |
| Tools             |      7 |               18 |         8 |         26 | 7/3/3/5       |
| **Primary total** | **44** |           **80** |    **53** |    **133** | **43/7/7/23** |

The frozen module denominator was 51 states / 87 pairs / 140 PNGs. The proposed repaired denominator is 44 / 80 / 133; this changes expectations, not the completeness or meaning of any frozen run. Ten full-page base pairs are rekeyed, not removed viewport breadth.

### Primary state inventory

`care-profile`, `care-profile-thread` and `care-profile-plan` use `/care/directory/9a0c1e00-0000-4000-8000-000000000001`. `support-conversation` uses `/support?id=conv-1001` and retains `keepScroll`.

| Area    | State                          | Route                           | Widths  | Full | Fresh per width |
| ------- | ------------------------------ | ------------------------------- | ------- | ---- | --------------- |
| shell   | home                           | /                               | D/I/S/M | yes  | no              |
| shell   | home-search                    | /                               | D       | no   | no              |
| shell   | home-profile-menu              | /                               | D       | no   | no              |
| shell   | home-mobile-nav                | /                               | M       | no   | yes             |
| shell   | admin                          | /admin                          | D/M     | yes  | no              |
| shell   | admin-staff-directory          | /admin/teams                    | D/M     | yes  | no              |
| shell   | admin-staff-search             | /admin/teams                    | D       | no   | no              |
| shell   | admin-staff-no-results         | /admin/teams                    | D       | no   | no              |
| shell   | admin-eve                      | /admin/eve                      | D       | yes  | no              |
| shell   | email-delivery                 | /settings/integrations/resend   | D/M     | yes  | no              |
| shell   | about                          | /help/about                     | D       | no   | no              |
| shell   | sign                           | /sign                           | D       | no   | no              |
| shell   | no-access                      | /no-access                      | D       | no   | no              |
| people  | care                           | /care                           | D/I/S/M | yes  | no              |
| people  | care-directory                 | /care/directory                 | D/M     | yes  | no              |
| people  | care-profile                   | care profile route above        | D/M     | yes  | no              |
| people  | care-profile-thread            | care profile route above        | D       | no   | no              |
| people  | care-profile-plan              | care profile route above        | D/M     | yes  | yes             |
| people  | care-settings                  | /care/settings                  | D       | no   | no              |
| people  | mobilize-unconnected           | /mobilize                       | D/M     | yes  | no              |
| people  | locations                      | /mobilize/locations             | D       | no   | no              |
| people  | locations-list                 | /mobilize/locations             | D/M     | no   | no              |
| people  | locations-add                  | /mobilize/locations             | D       | no   | no              |
| people  | events-unconnected             | /events                         | D/M     | yes  | no              |
| people  | feed                           | /feed                           | D/M     | yes  | no              |
| people  | org-updates                    | /feed/org-updates               | D       | yes  | no              |
| people  | tasks-follow-ups               | /tasks                          | D/I/S/M | yes  | no              |
| support | support-inbox                  | /support                        | D/I/S/M | yes  | no              |
| support | support-table                  | /support                        | D       | no   | no              |
| support | support-conversation           | conversation route above        | D/M     | no   | no              |
| support | support-reports                | /support/reports/overview       | D/M     | yes  | no              |
| support | support-reports-agents         | /support/reports/agents         | D       | yes  | no              |
| support | support-settings-inbox         | /support/settings/inbox         | D/M     | yes  | no              |
| support | support-settings-sla           | /support/settings/sla           | D       | yes  | no              |
| support | support-settings-labels        | /support/settings/labels        | D       | yes  | no              |
| support | support-settings-automations   | /support/settings/automations   | D       | yes  | no              |
| support | support-settings-notifications | /support/settings/notifications | D       | yes  | no              |
| tools   | reports                        | /reports                        | D/I/S/M | yes  | no              |
| tools   | automations                    | /automations                    | D/M     | yes  | no              |
| tools   | automations-failing            | /automations                    | D       | no   | no              |
| tools   | workflows                      | /workflows                      | D/M     | yes  | no              |
| tools   | email-studio                   | /email                          | D/I/S/M | no   | no              |
| tools   | pdf-studio                     | /pdf                            | D/I/S/M | no   | no              |
| tools   | pdf-export-menu                | /pdf                            | D       | no   | no              |

Required pair keys are exactly `state@viewport`; PNG names are `state--viewport.png` and, only for full states, `state--viewport-full.png`. `expectedInventory` emits these expected sets without writing files. A name is not semantic qualification.

### New bounded plan

Each group is nonempty, at most four states, and appears once in each of capture/check: **14 groups / 28 prospective invocations**. These are plans, not executed jobs. Only the new plan omits empty `people-06`; no frozen plan was edited.

| Batch      | States                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------- |
| shell-01   | home, home-search, home-profile-menu, home-mobile-nav                                         |
| shell-02   | admin, admin-staff-directory, admin-staff-search, admin-staff-no-results                      |
| shell-03   | admin-eve, email-delivery, about, sign                                                        |
| shell-04   | no-access                                                                                     |
| people-01  | care, care-directory, care-profile, care-profile-thread                                       |
| people-02  | care-profile-plan, care-settings, mobilize-unconnected                                        |
| people-03  | locations, locations-list, locations-add                                                      |
| people-04  | events-unconnected                                                                            |
| people-05  | feed, org-updates, tasks-follow-ups                                                           |
| support-01 | support-inbox, support-table, support-conversation, support-reports                           |
| support-02 | support-reports-agents, support-settings-inbox, support-settings-sla, support-settings-labels |
| support-03 | support-settings-automations, support-settings-notifications                                  |
| tools-01   | reports, automations, automations-failing, workflows                                          |
| tools-02   | email-studio, pdf-studio, pdf-export-menu                                                     |

### Conditional whole-catalogue arithmetic

This is conditional on the other area definitions remaining unchanged, not a new whole-catalogue acceptance denominator.

| Other area                        |  States |   Pairs | Full PNGs | Total PNGs | D/I/S/M pairs    |
| --------------------------------- | ------: | ------: | --------: | ---------: | ---------------- |
| CRM                               |      20 |      41 |        12 |         53 | 20/3/3/15        |
| Contributions                     |      13 |      24 |         6 |         30 | 13/2/1/8         |
| Studio                            |      47 |      82 |        14 |         96 | 42/4/4/32        |
| **Whole including primary areas** | **124** | **227** |    **85** |    **312** | **118/16/15/78** |

The whole plan has 35 groups / 70 prospective invocations. Its required keys still include **contribution-fund-correction@desktop** and **contribution-fund-correction@mobile**, explicitly unexercised; 227 expected keys do not mean 227 qualifiable or completed pairs.

Optional additive CRM form coverage is **+1 state / +2 pairs / +2 viewport PNGs**, not full-page images: conditionally 125 / 229 / 314, with 36 groups / 72 invocations if explicitly selected. It does not clear either Hub gap. The unapproved C17 replacement alternative would instead retain whole 124 / 227 / 312, move CRM to 21 / 43 and Contributions to 12 / 22, remove the Hub entry from contributions-03 and add crm-06 (36 groups / 72 invocations). **No replacement is applied.**

## Baseline comparability limitations

- New staff search/no-results have **no equivalent workflow** in old team-management/create dialogs. The four base mappings `admin-teams -> admin-staff-directory`, `mobilize -> mobilize-unconnected`, `events -> events-unconnected` and `tasks -> tasks-follow-ups` are **changed-purpose pages**, not feature equivalence.
- The proposal's nine unavailable workflows already lacked A images. Their removal is not nine newly lost comparisons. There are **12 new primary pair names** (10 renamed base pairs plus two staff filters) and **11 unchanged historical image gaps** in the conditional whole denominator.
- The independent proposal's **filename-only ceiling is 204 = 227 - 12 - 11**. This repair did not inspect A files outside this checkout. This is an unverified ceiling from preserved proposal accounting, not 204 semantically comparable workflows, accessible pairs, scored pairs or accepted evidence. The optional C17 replacement ceiling would be 202, also not applied or qualified.
- No baseline alias, old-image rename, B-to-A copy, manifest rewrite or changed-purpose match promotes comparability. Fresh source/runtime qualification and independent review remain necessary.

## Preserved historical evidence and timeout gaps

The following are retained source-reported partitions from the independent reconciliation/addendum, not reruns or newly accepted evidence. Root's closed source-freeze report of **1,038 entries / zero drift** was not independently revalidated here.

- Shell/People `run-20261111T224417910Z`: expected 34 states / 53 pairs / 85 PNGs; raw 28 metric entries / 10 checks / 48 PNGs; only 16 captures and seven checks qualified. Team-manage/create and Mobilize-candidate artifacts were wrong-state evidence. People check was interrupted; its exact exit remains unknown.
- Support/Tools `run-20261111T210346808Z`: expected 34 pairs / 55 PNGs, with 25 checks. Nine checks remain missing: Email studio four widths, PDF studio four widths and PDF Export desktop. The named Export screenshot was the editor; the menu workflow remained unexercised.
- Core: 33 states / 65 pairs; 63 capture rows / 61 check rows / 59 complete pairs / 56 intended-setup-qualified pairs / 82 of 83 PNGs. Wrong gift-menu/Hub correction rows are not promoted by separately saved focused-form success.
- `crm-01` check timeout: 5/9 rows. Missing `crm-kanban@mobile`, `crm-drawer@desktop`, `crm-drawer@mobile` and **desktop-only** `crm-drawer-properties@desktop` remain missing.
- `crm-04` capture timeout: 6/7 rows. `crm-relationships-more@desktop` remains provisional and `crm-relationships-more@mobile` absent. These partitions establish neither impossible workflows nor a diagnosed performance cause. No timeout was increased to hide a gap.

Future authorized collection must retain per-invocation exits, partial writes, warnings, route errors, axe violations and incomplete IDs, and exact setup-failure reasons. Changed expectations cannot complete any historical check, supply an unknown exit or qualify a wrong-state image.

## Regression proof and scoped verification

Meaningful RED/GREEN cycles exercised actual stale catalogue/setup behavior before repairs, including the generic gift-menu decoy, silent Hub fall-through, missing inventory APIs, stale brief state groups, disabled native menu items and snapshot overwrite behavior. Tests use real catalogue definitions and stateful fake locators/runners, not a live browser. An initially mistaken breadth assertion was corrected to the actual desktop-only properties state; no product breadth was changed to make the test pass.

| Proposed contract | Harness coverage and RED/GREEN outcome                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R01               | Exact real names/routes/width/full/fresh/scroll sets, filenames, per-width census and all nine unavailable IDs; stale catalogue failed, repaired catalogue passes.                                                                             |
| R02               | Both fake runners reject seven semantic setup failure modes, preserve prior rows and never publish failed-pair metrics/images/axe; explicit fatal pair/reason and event order. Generic collector catch/status limitations remain as disclosed. |
| R03               | Populated authorized directory before independent Dana/no-results filters; pending, error, empty, non-admin and ineffective filters fail.                                                                                                      |
| R04               | Real disconnected copy/hrefs and populated linked follow-ups; pending/error/empty/missing-link variants fail; no linked navigation or mutation action.                                                                                         |
| R05               | Both fake runners set viewport before fresh Care navigation/setup at D/M; actual mobile combobox/option and actual panel required, with missing/disabled/wrong-panel negatives. Capture asserts two viewport plus two full images.             |
| R06               | Initially disabled then ready Export, never-ready/no-click deadline, native/classic/blocked-free menu branches and actual note association; disabled native items fail; fatal PDF Save readiness. No export/save item invocation.              |
| R07               | All eight supported hooks have positive and missing/disabled/ineffective cases. Automation requires one failing rule and two failed runs, not invented extra failing rules.                                                                    |
| R08               | Exact proposed pair/PNG/batch sets, uniqueness, width unions, strict pure selection, separate identity inputs and expected-only status. Collector CLI integration remains outstanding.                                                         |
| R09               | Two distinct gifts plus generic decoy; only fixture-bound accessible target qualifies; blocked availability/explanations preserved; missing/ineffective/wrong-donor/unbound inputs fail.                                                       |
| R10               | Hub fails with no action; separate optional form validates eligible membership before state construction and exact enabled menu/form at both widths; blocked/mismatched/form/context negatives and no submit. Historical timeout keys remain.  |

Final verification on the repaired source:

- Focused Node harness suite: **76 tests passed, zero failed/cancelled/skipped/todo**, exit 0. Command: `node --experimental-vm-modules --test --test-reporter=spec` with `Q/catalogue.test.mjs`, `Q/catalogue-setups.test.mjs`, `Q/catalogue-inventory.test.mjs`, `Q/workspace-catalogue.test.mjs`, `Q/briefs.test.mjs`, `Q/harness.test.mjs`, `Q/harness-runners.test.mjs` as explicit arguments.
- `node --check` on the 13 owned JavaScript modules: passed, exit 0.
- Installed ESLint on those 13 modules with `--max-warnings=0`: passed, exit 0. Three initial import-order warnings were repaired; no suppression was added.
- Installed Prettier `--check` on those 13 modules: passed, exit 0. This new report is formatted and checked separately.
- Pure inventory imports produced primary 44/80/133 and conditional whole 124/227/312, with the exact width/batch partitions above. No manifest or plan file was emitted.

Owned JavaScript verification set: `module-states.mjs`, `catalogue-setups.mjs`, `workspace-states.mjs`, `workspace-catalogue-setups.mjs`, `catalogue-inventory.mjs`, `write-briefs.mjs`, `catalogue.test.mjs`, `setup-test-page.mjs`, `catalogue-setups.test.mjs`, `workspace-catalogue.test.mjs`, `catalogue-inventory.test.mjs`, `briefs.test.mjs`, `harness-runners.test.mjs`, all under Q. The existing `harness.test.mjs` was run but not edited.

## Separate input identities

Read-only source digests recorded after final code formatting/lint/tests, without Git or fixture generation:

- Product/runtime identity: **not attested by this task**. The closed root freeze remains historical authority, not proof of current runtime after concurrent work. No new product freeze is claimed.
- Owned harness/catalogue/test source group SHA-256: `c0d9ae0c6c8504f21c4338f8bcb0971da1802140efab1bb603fc49dd813e43ed`, over the 13-file verification set above. This report and unchanged collector/harness sources are not in that group.
- Fixture **source** group SHA-256: `a386eae65a916a84dff5d43ba7c517e3f0650b7b8694c25da46135e344e6d137`, over `Q/fixtures/module-fixtures.mjs`, `Q/fixtures/route-fixtures.mjs` and `Q/fixtures/crm-contrib-fixtures.ts`. Those files were not edited. This is **not** an emitted fixture-bundle/preflight/runtime identity.
- Digest algorithm: SHA-256 of concatenated, lexically sorted repository-relative forward-slash path + NUL + SHA-256 of file bytes + LF for each file. These source identities distinguish inputs; they do not refresh old hashes or make a successful capture.

No broad app gate or runtime qualification ran. Browser behavior, actual Base UI accessibility tree, WCAG, PDF export/provider success, shared-task-domain resolution, semantic baseline comparability, visual score and acceptance remain **unestablished**. Root-owned integration, current sanctioned fixtures and separately authorized fresh capture/check work are prerequisites to later evidence review.

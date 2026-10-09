# AL-1985 verification

Evidence recorded on October 10, 2026 (Asia/Bangkok) for the working branch `chore/AL-1985-base-ui-1-9`.

## Release and implementation

- Official [1.9.0 release notes](https://base-ui.com/react/overview/releases/v1-9-0) and npm metadata agree on 1.9.0, published October 9. The registry's only dist-tag is `latest: 1.9.0`; no preview dependency was selected.
- Both direct first-party declarations (`packages/ui` and `apps/admin`) and the lockfile resolve exact 1.9.0. The lock update retains unrelated resolutions and contains only Base UI's required changes, including its nested `use-sync-external-store` 1.7.0 resolutions. Frozen installation passed with Bun 1.4.2.
- New shared FilterProvider/Input/List/Clear/Empty parts expose upstream props, refs, render targets, class/style state callbacks, and cancelable query events. Highlight styles preserve keyboard feedback while the input holds focus. InputGroup render composition retains its existing control slot and styles.
- Email Studio adopts Input/List/Empty with controlled external filtering. Key OR label OR category matching, case/whitespace handling, item order, disabled behavior, and exact insertion keys are preserved. Clear remains an optional shared part with direct tests.
- The release-sensitive source audit found no existing `actionsRef`, `preventUnmountOnClose`, `onItemHighlighted`, or swipe-ignore usage requiring migration. Existing generic Select/Combobox props inherit readonly multiple-value support.
- `shadcn info --json` confirms Base UI, exact `base-maia`, Zinc, shared aliases, and CSS variables. No design-system configuration or token scale changes were made. Independent React/API review found no product issues.

## Checks

| Check                                            | Result                                                                                                                                                                                                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared filtering and merge-tag regressions       | 12 new real-primitive DOM tests pass; meaningful RED captured before each implementation seam.                                                                                                                                                                 |
| Existing Base UI compatibility selection         | 9 files / 74 tests pass; final menu/dependency selection passes 5 files / 21 tests.                                                                                                                                                                            |
| All workspace typechecks and lint                | 15 typecheck tasks and 15 lint tasks pass. Changed components also pass uncached raw design-system lint with no findings.                                                                                                                                      |
| Browser controls/inputs/overlays/support selects | 57 existing checks pass; 3 support-select cases intentionally skip outside the desktop-light project.                                                                                                                                                          |
| Real merge-tag browser scenarios                 | 8 checks pass across desktop/mobile, light/dark, and reduced-motion configurations; cover input focus, filtering, visible highlight, Enter insertion, close/reset, empty results, and popup axe checks.                                                        |
| Upstream shadcn review guard                     | Pass: pinned CLI 4.21.4 reviews 53 installed components, 54 file diffs, and 34 local adapters. Only the reviewed dropdown file record changes; all prior proof records remain.                                                                                 |
| Shadscan evidence guard                          | Pass: 118 findings validated, existing app score floors preserved. Only 22 reviewed source hashes change for the dropdown wrapper and two dependency manifests; classifications and policy remain intact. Existing cited proof suites pass 8 files / 40 tests. |
| Manifest/lock/config/spec contracts              | Frozen install, lock drift, workspace contract, shadcn configuration, strict change validation, and active OpenSpec delta compatibility pass.                                                                                                                  |
| Full unit suite and app builds                   | Pass: 875 unit files / 6,990 tests, with 2 files / 4 tests skipped; shared packages and all three app builds pass.                                                                                                                                             |
| Canonical preflight                              | Initial run required refreshed component evidence. All stages now pass individually; the required pre-push hook enforces the combined readiness gate before branch publication.                                                                                |

## Scope and rollback

Menu filtering is an upstream preview API, adopted behind shared wrappers. Component/browser evidence does not establish every application route, email-editor provider integration, or physical iOS keyboard/swipe behavior. No deployment or merge is part of this verification. Revert the dependency/lock changes, filtering wrappers, consumer composition, tests, and corresponding review hashes together to restore the prior baseline. Leave this change active until implementation is merged.

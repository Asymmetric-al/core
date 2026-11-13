# Round 13 Studio representative PNG review

These are observations from actual saved PNGs in `candidate-13-studio/capture/`, not conclusions derived only from exit codes or unit fixtures. The complete native dimension/hash index is `png-index.json`; only the following representative images were visually inspected. All dimensions below are native PNG pixels at DPR 1.

## Account

| PNG                                     | Native dimensions | Observation                                                                                                                                                                                       |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `studio-account--desktop.png`           | 1440 x 1000       | Account title, sign-in fields and the start of preferences render rather than an error boundary.                                                                                                  |
| `studio-account--intermediate.png`      | 1024 x 900        | Account title, email, sign-in ID, organization ID and role fields fit the content column. Preferences continue below the viewport, which is ordinary page scroll rather than horizontal clipping. |
| `studio-account--small-tablet-full.png` | 640 x 1087        | Full page shows fields, language selector, enhanced-contrast choice and reset preferences control; mobile navigation replaces the fixed sidebar.                                                  |
| `studio-account--mobile-full.png`       | 390 x 1115        | Full mobile page has readable sign-in fields and language/contrast preferences. This is not a missing Account body or route-error capture.                                                        |

The visible Account title in these PNGs does not measure the visibility of every DOM H1 or the number of main landmarks. Raw capture H1 arrays also contain the fixture email; no fresh visible-heading/main probe ran after drift was detected. Controls rendering in a screenshot is not proof that save/reset or real identity integration works.

## Template picker and new template

| PNG                                            | Native dimensions | Observation                                                                                                                     |
| ---------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `studio-new-page-template-picker--desktop.png` | 1440 x 1000       | Template popup is open and loaded, showing Standard Page Template and the search field/focus styling, not a loading-only state. |
| `studio-new-page-template-picker--mobile.png`  | 390 x 844         | Loaded template option and search field are visible within the mobile popup.                                                    |
| `studio-new-template--desktop.png`             | 1440 x 1000       | New-template form is rendered despite the logged readiness-text timeout.                                                        |

The visible search focus ring is only a captured focus appearance. Keyboard traversal, selection, focus return and popup dismissal were not measured by a fresh check run.

## Representative 1024px screens

| PNG                                  | Native dimensions | Observation                                                                                                                                  |
| ------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `studio-dashboard--intermediate.png` | 1024 x 900        | Heading/actions, two-column create cards and document cards fit their column. Further recently-updated content continues below the viewport. |
| `studio-pages--intermediate.png`     | 1024 x 900        | Page-list toolbar/table fit without evident overlapping controls or clipped outer page edges.                                                |
| `studio-page-edit--intermediate.png` | 1024 x 900        | Seeded editor heading/actions fit without evident header overlap or clipping.                                                                |

These are representative viewport observations, not a full scroll/keyboard/zoom audit. Machine-recorded horizontal overflow is false for all 82 pairs, but that single document-width metric cannot rule out every internal or transient clipping issue.

## Readiness-warning states

| PNG                                         | Native dimensions | Observation                                                                                                                                              |
| ------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `studio-page-edit-details--mobile.png`      | 390 x 844         | Details is expanded. Document state, published/public status, autosave, private-preview explanation, document/organization IDs and versions are visible. |
| `studio-page-edit-preview-menu--mobile.png` | 390 x 844         | Preview menu is open with Open preview and Open published page above the seeded form.                                                                    |
| `studio-new-giving-errors--desktop.png`     | 1440 x 1000       | Giving-page form displays the missionary-field validation treatment and Select a missionary message.                                                     |

The fourth warned state, new template, is reviewed in its own table above. All four warnings remain in `capture.log`; images establish visible state content, not timing correctness or complete behavior.

In the mobile details PNG, the bottom-right developer badge overlays part of the last visible access row. This is a concrete capture observation, not a verified new product regression: this run has no matched baseline proof attributing it to the candidate change. The badge is also present on other local-dev captures. No badge removal, recapture or product/harness change was attempted.

## Conclusion and limits

No defensible new product regression is established from these 13 inspected representatives. The complete capture inventory has 96 PNGs; the remaining PNGs were indexed and structurally validated but are not represented as individually visually reviewed here. No baseline image was substituted, and no final visual score is assigned.

All 74 check pairs remain unrun after the immutable-source guard failed. These screenshot observations do not establish axe status, keyboard/focus behavior, WCAG conformance, provider success, real auth/tenant integration or the separate published-link installed-form journey. That journey is absent from the current catalogue and was not manufactured by publishing/editing extra content.

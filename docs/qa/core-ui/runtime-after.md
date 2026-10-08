# UI runtime verification

Current local product-route metadata covers 43 admin URLs, 26 donor URL representations, and 16 missionary URLs. These 85 observed URLs include existing error, loading, unavailable-provider, and not-found states. They are not 85 successful product workflows or a claim that every route received visual inspection. Source-wide dispositions are in the coverage ledger. Exact route lists, screenshot hashes, and interaction results are in `after-index.json`.

The unchanged selected component browser gate passed 62 checks before and 62 after. `checks/component-browser.json` and its two logs record the command, installed browser, scope, and explicit `.mts` configuration fix. This gate complements the repository application suites and CI results reported separately.

## Final responsive corrections

- Native checkout renders four named preset radios at 161px wide on desktop and 163px on mobile, with labels inside their bounds. Selection of $250, a custom $137, and Next/Back preserve the existing amount state. No payment was submitted.
- Native donor history renders the same three existing E2E records, dates, amounts, and status on desktop and mobile. The two successful gifts retain their actual receipt URLs and keyboard focus; receipt endpoints were not called.
- Native missionary tasks now has document width 1440px at a 1440px viewport and width 390px at a 390px viewport. Its four actual board columns remain in an internal 1328px scroll surface; scrolling to the end reveals Done. No task mutation or drag operation was exercised.
- Native FAQ, Financials, and Ways to Give have matching fresh desktop/mobile captures. Their unscrolled text contrast on the new 80px strip is 17.16; the actual logo leaf with opacity 0.6 is 6.78, and the mobile menu glyph is 17.16. All measured controls stay inside the strip. Scrolling retains the existing solid navbar; FAQ Clear restores search focus.
- Native `/feed/org-updates` and `/sign` now have correct original/current captures. Org Updates' existing controlled type toggle changes to Prayer Request locally; no draft or publication action ran.

The final metadata keys `after-donor-final-corrections.json`, `after-header-glyph-contrast.json`, `after-missionary-board-geometry.json`, `after-admin-final-missing.json`, and `after-org-updates-type.json` identify these checks.

## Actual component seams

The two Giving fixture gifts use the actual detail/provider/table/formatters and the application MotionProvider. Original narrow rendering reproduces blank record cards; current narrow rendering exposes all five existing formatted cells for both gifts. All measured motion ancestors settle at opacity1; document width equals the viewport. The final focused rightmost tab is revealed by native rail scrolling 14px, without changing document width 390px or page `scrollY` 0. ArrowLeft/Right retains the existing Base UI manual activation contract. `after-giving-rail-keyboard.json` and its explicit keyboard-state image close the earlier clipped-trigger observation.

Contributions and Support fixtures preserve actual selection controllers and the responsive table. Natural Tab traversal followed by Space selects the record-specific Checkbox and exposes the existing action toolbar without opening a different record. Contributions confirms two selected contributions and records their exact local receipt payload while a local promise remains pending. Support records the actual local PATCH path for the selected conversation. These are controlled synthetic-input seams, not live receipt delivery or productive Support mutations.

Shared Email preview has explicit desktop/mobile device captures in light and dark modes. Desktop fits the available panel at 390px; mobile retains its intentional fixed390px canvas inside an internal scroll surface. Settled report charts preserve the actual three-point series and three bars before and after. Mobilize stages and shared status badges use actual Chromium-resolved light/dark token values and composited contrast measurements, separate from the source-token calculations.

## Runtime limits

Provider-backed admin tables and care profiles, missionary productive profile/partner records, native CMS gallery/wizards/editor, native email/PDF studio chrome, and donor ministry feed/provider submission remain unavailable or unverified in the example datasource. Existing SSR fallbacks and original hydration diagnostics are recorded in the baseline and route metadata. Product data was not fabricated to hide these limits.

Matched fresh first-mount map captures render actual geography in both original/current 390×844 and 1440×1000 viewports, with 17/23 successful style/tile responses, no failed map requests, no page errors, and no WebGL context-loss events. The earlier resized-context blank image was a transient capture state, not a proved source regression. The final MapHeaderControls spacing fix puts Back/Search below the fixed navbar; native hit-tests, keyboard opening, touch opening, empty search, keyboard clearing, and Escape focus restoration pass. Wide counts remain visible and mobile counts intentionally stay hidden. Provider-backed location selection/details remain unverified with the example datasource, so `passedMapWorkflow:false` is retained for the productive workflow.

No hosted writes, production sign-in, seed operations, migrations, payment operations, or provider credential changes ran. Supplemental fixture boundaries and local-only diagnostics are described in `runtime-reproduction.md`. Screenshot capture alone is not an accepted visual comparison; independent review results remain in the review ledger.

Financials canonical images are matching native allocation-chart viewport crops, not full-page captures. Ordinary full-page capture resets Recharts sectors during screenshot and they recover afterward; those initial images remain qualified header/body evidence with unaccepted arcs. Actual chart-focused viewport captures preserve all three 85/10/5 sectors and geometry immediately after capture without engine/animation overrides. Exact scrollY, viewport, path bounds, fills, and prior-image hashes are in the two financial-pie-settled metadata entries.

The historical `tasks-critical-filter` false result tested a nonexistent toggle-off contract. It remains preserved with a pointer to the passing final check of keyboard activation and the existing All Missions reset behavior; no product change was made to satisfy the incorrect assumption.

Runtime captures and the selected browser checks were completed on the pre-integration checkout using Next.js 16.3.8. The later integration of upstream `develop` commit `180dde` introduces Next.js 16.4 and admin refresh changes. These images are evidence for the implementation before that integration; no post-integration application browser capture is claimed. Final integration checks and any affected behavior limits must be reported separately.

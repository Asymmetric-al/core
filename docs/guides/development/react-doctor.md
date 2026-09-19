# React Doctor

## Triggers

- Run React Doctor before React, Next.js, or shared UI changes are considered ready.
- Run it after broad refactors, component cleanup, or before opening a UI-heavy PR.
- Use the first-party helper for this monorepo instead of scanning vendored code.

## Workflow

1. Run `bun run react-doctor:first-party -- --full --offline --fail-on none`.
2. Read each configured first-party target separately; the wrapper iterates concrete React project roots under `apps/*` and React-bearing workspace packages instead of aggregate `apps` / `packages` directories.
3. Treat the result as a configured first-party audit, not a claim that every possible React Doctor rule is enabled.
4. Fix errors and high-confidence warnings in source code first.
5. Keep repo-level exceptions in `doctor.config.json` so repeated scans are deterministic.
6. Pair React Doctor with the normal repo gates: format, lint, typecheck, build, unit tests, and relevant browser checks.

## Result Language

Use precise wording in PRs and release notes:

- Correct: "React Doctor passes for the configured first-party audit."
- Correct: "Known ignores are documented in `docs/guides/development/react-doctor.md`."
- Correct: "`blocking` is advisory unless CI runs a stricter mode."
- Avoid: "React Doctor proves the repo is 100/100 clean" unless every enabled and disabled rule has been audited and there are no ignored findings.

The default command accepts legacy `--fail-on none` and normalizes it to the current React Doctor `--blocking none` flag; `doctor.config.json` also sets `"blocking": "none"`. That keeps the audit useful during cleanup without turning every advisory rule into a local blocker. CI or a focused cleanup PR may choose a stricter mode later.

The wrapper runs `bunx react-doctor@latest` on Node, not `bunx --bun`. React Doctor spawns its rule engine over Node IPC and calls `child.channel.unref()`, which Bun's `ChildProcess` does not implement; forcing the Bun runtime makes every target fail before any rule executes. `tests/unit/scripts/react-doctor-first-party.test.ts` guards this.

Inline suppressions use `// react-doctor-disable-next-line <plugin>/<rule>` and must carry a one-line reason on the preceding comment. Use them only for confirmed false positives, never to hide a real finding.

## Configured Ignores

The ignore list is intentionally human-readable here because `doctor.config.json` is JSON and cannot carry comments.

| Group                             | Rules or files                                                                                                                                                                                                                                                                               | Reason                                                                                                                                                                                                                                                                                                                    | Status                                                         | Owner / area      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------- |
| Covered by another gate           | `.next/**`, `dist/**`, `coverage/**`, `node_modules/**`, `vendor/**`                                                                                                                                                                                                                         | Generated, vendored, or build output should not affect first-party source audits.                                                                                                                                                                                                                                         | Permanent                                                      | Platform tooling  |
| Covered by another gate           | `tests/**`, `scripts/**`, `tooling/**`, `supabase/**`                                                                                                                                                                                                                                        | These areas use dedicated Vitest, script, workspace-contract, data-boundary, migration, and lint checks. React Doctor is scoped to app and package React source.                                                                                                                                                          | Permanent, revisit if React Doctor gains better non-UI support | Platform tooling  |
| Repo policy exception             | `docs/**`, `.next-docs/**`                                                                                                                                                                                                                                                                   | Documentation and generated Next.js docs are not runtime React surfaces.                                                                                                                                                                                                                                                  | Permanent                                                      | Documentation     |
| Tool false positive or noisy rule | `knip/duplicates`, `knip/exports`, `knip/files`, `knip/types`                                                                                                                                                                                                                                | Workspace exports, route files, generated mirrors, and app/package boundaries are noisy in React Doctor. Use dedicated dependency and workspace audits for unused-code cleanup.                                                                                                                                           | Revisit periodically                                           | Platform tooling  |
| Covered by another gate           | `jsx-a11y/*` ignored in config                                                                                                                                                                                                                                                               | Accessibility is checked through code review and Playwright/axe flows where the rendered UI can be evaluated with real semantics.                                                                                                                                                                                         | Revisit as pages stabilize                                     | Frontend          |
| Temporary debt to re-enable later | React component shape rules such as `no-giant-component`, `prefer-useReducer`, `no-many-boolean-props`, `no-generic-handler-names`, `no-derived-state-effect`, `no-derived-useState`, `no-cascading-set-state`, `no-prop-callback-in-effect`                                                 | The current PR reduced high-risk patterns without rewriting large feature areas. These remain cleanup candidates where local behavior tests exist.                                                                                                                                                                        | Temporary                                                      | App owners        |
| Tool false positive or noisy rule | Rendering and memoization rules such as `rendering-hoist-jsx`, `rendering-conditional-render`, `rerender-memo-before-early-return`, `rerender-state-only-in-handlers`, `rendering-hydration-mismatch-time`, `rendering-svg-precision`                                                        | Several findings are stylistic or need route-specific proof. Keep targeted fixes when a real render bug or measurable churn is found.                                                                                                                                                                                     | Revisit per feature                                            | Frontend          |
| Temporary debt to re-enable later | Async/data rules such as `no-fetch-in-effect`, `async-await-in-loop`, `async-defer-await`, `async-parallel`, `server-sequential-independent-await`                                                                                                                                           | Some client-only Supabase/TanStack and mutation flows intentionally fetch from effects or preserve sequencing. Fix obvious independent work, but do not change data semantics solely for score.                                                                                                                           | Temporary                                                      | Data/app owners   |
| Temporary debt to re-enable later | Next.js rules such as `nextjs-no-img-element`, `nextjs-no-client-side-redirect`, metadata-related findings when present                                                                                                                                                                      | Prefer fixing active route issues when scoped. The only first-party raw `<img>` JSX currently lives in the Tiptap image NodeView because resize handles require an image DOM ref. Contract tests guard that this exception stays local. Boneyard/deprecated flows can stay documented rather than forcing broad rewrites. | Temporary                                                      | App owners        |
| Tool false positive or noisy rule | Micro-optimization rules such as `js-batch-dom-css`, `js-cache-property-access`, `js-combine-iterations`, `js-flatmap-filter`, `js-hoist-intl`, `js-min-max-loop`, `js-tosorted-immutable`, `prefer-dynamic-import`, `use-lazy-motion`                                                       | These are useful prompts but can make code harder to read or widen scope. Apply only when the local code remains clearer.                                                                                                                                                                                                 | Revisit opportunistically                                      | Frontend/platform |
| Covered by another gate           | Design/aesthetic rules such as `design-no-redundant-size-axes`, `no-gray-on-colored-background`, `no-inline-bounce-easing`, `no-inline-exhaustive-style`, `no-pure-black-background`, `no-side-tab-border`, `no-tiny-text`, `design-no-vague-button-label`, `client-passive-event-listeners` | Visual, UX, and accessibility review should happen on real screens with Tailwind/shadcn conventions and browser checks.                                                                                                                                                                                                   | Revisit per UI pass                                            | Design/frontend   |
| Temporary debt to re-enable later | Correctness-suspicion rules such as `no-array-index-as-key`, `no-effect-event-handler`, `no-prevent-default`, `no-react19-deprecated-apis`, `no-render-in-render`, `advanced-event-handler-refs`                                                                                             | Treat these as cleanup leads. Re-enable one family at a time after targeted fixes and regression coverage.                                                                                                                                                                                                                | Temporary                                                      | App owners        |

## Checklist

- [ ] React Doctor reports the expected score for each configured app target under the configured audit.
- [ ] React Doctor reports the expected score for each configured package target under the configured audit.
- [ ] Any remaining findings are either fixed or documented as known exceptions.
- [ ] Any new ignored rule has a repo-specific reason and is not masking a known bug.
- [ ] `blocking` behavior is described honestly in the PR summary.
- [ ] Relevant format/lint/typecheck/build/test commands have been run for touched surfaces.

## Narrowed Rules

| Rule                                 | Change                                                                                                    | Evidence                                                                                                                                                                                                                                                                               | Guardrail                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react/no-danger`                    | Removed from the global ignore list on 2026-05-21.                                                        | First-party `apps/**` and `packages/**` TS/TSX source has no runtime `dangerouslySetInnerHTML=` assignments. Rich text HTML flows through `packages/lib/components/safe-html.tsx`, which sanitizes with `sanitizeRichTextHtml` and renders parsed nodes instead of raw dangerous HTML. | `tests/unit/apps/react-doctor-config-contracts.test.ts` fails if runtime dangerous HTML assignments are introduced or the global ignore comes back. |
| `react-doctor/nextjs-no-img-element` | Kept globally ignored for now, but the known first-party JSX exception is documented and contract-tested. | `packages/ui/components/shadcn/rich-text-editor/image-view.tsx` uses a raw `<img>` inside a Tiptap NodeView because drag-resize behavior needs an `HTMLImageElement` ref.                                                                                                              | `tests/unit/apps/react-doctor-config-contracts.test.ts` fails if another raw `<img>` JSX use appears under `apps/**` or `packages/**`.              |

## 2026-05-21 Cleanup Decisions

- Responsive shared tables: `packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx` now derives mobile state with `useMediaQuery` and keeps only the table-to-card coercion effect. Avoid reintroducing manual `resize` listeners in table components unless the shared hook cannot express the query.
- Missionary donor mutations: `apps/missionary/app/donors/use-donors-page-view.tsx` and `apps/missionary/app/donors/edit-donor-dialog.tsx` now call `/api/missionary/donors/[donorId]` and `/api/missionary/donors/[donorId]/activities` through `apps/missionary/app/donors/donor-mutation-client.ts`. Server-side handlers live in `packages/api/src/missionary-portal/donor.ts` and must keep missionary role, tenant, profile, and donor relationship scoping.
- Large component, bundle, accessibility, and design rule families remain per-slice work. Do not re-enable those globally without route-owner coverage and rendered validation.

## 2026-09-18 Cleanup Decisions

Configured first-party audit (`bun run react-doctor:first-party -- --full --offline --fail-on none`, React Doctor 0.9.14): 316 findings (60 errors) before, 236 findings (41 errors) after. No rule was added to the ignore list.

Fixed in source:

- Purity: `apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx` no longer writes refs during render or inside `setCheckoutState` updaters; ref checks and mirror writes happen in the async payment handler. `packages/ui/components/ministry-update/use-engagement.ts` syncs its latest-value refs in a layout effect and seeds `getSnapshot` from the current baseline. `packages/ui/components/shadcn/data-table/filters/use-advanced-filter.ts` notifies `onFilterChange` from a single `commit` path instead of inside updaters (covered by `tests/unit/packages/ui/use-advanced-filter.test.tsx`, which renders under StrictMode). `apps/missionary/app/profile/use-profile-page-view.ts` derives `isLoading` from state, not a ref.
- Cleanup and memoization: `carousel.tsx` detaches the `reInit` listener; context provider values in `carousel`, `chart`, `toggle-group`, `rich-text-editor`, and `packages/lib/mission-control/context.tsx` are memoized; `number-cell.tsx` uses a lazy state initializer; `contributions/main-body.tsx` hoists its default `needsAttentionGroups` array.
- Lookups: `Set`/`Map` replace `includes`/`find` inside loops in the donors list model, mission-control tiles, task table, mission briefing, filter select inputs, CSV export, CRM tag filter, Payload language options, and support macro canned responses.
- Security: the native PDF authoring preview iframe is sandboxed like the email preview (`allow-same-origin`; the print document is static markup plus inline CSS), and every `window.open(..., "_blank")` passes `noopener,noreferrer`.
- Bugs: `apps/missionary/app/feed/use-worker-feed-page-view.ts` treats HTTP errors from `/api/posts` and `/api/follower-requests` as failed loads instead of empty data (`tests/unit/apps/missionary/app/feed/use-worker-feed-page-view.test.tsx`). Support store schemas use `z.looseObject` (Zod 4).
- Accessibility: icon-only buttons and symbol-only controls in shared data tables, data grid, filter bar, image upload, rating cell, Web Studio preview toggles, donor settings/wallet/map, and missionary donor filters have `aria-label`s (plus `aria-pressed`/`aria-expanded` for toggles). `SupportFailureBanner` keeps `role="status"` but announces politely because the failing mutation already raises an error toast.
- Motion: the recurring-gift progress bar in `use-donors-page-view.tsx` scales on X instead of animating `width`; `quick-give.tsx` relies on `layout` instead of also animating `width`.

Confirmed false positives (left as-is at this inventory, no config change):

- `no-fetch-response-used-without-status-check` (25 remaining at inventory): the repo convention at the time read the JSON body first to surface the API error payload, then checked `response.ok`. Remaining `parseJsonResponse` clones in portal hooks later started checking `response.ok` before reading the JSON body.
- `no-set-state-after-await-in-effect` (4) and `no-create-object-url-without-revoke` (1): each site already guarded with a cancellation flag (`cancelled`/`isMounted`) or revoked in `removeMedia`, `handleClose`, and an unmount effect.
- `effect-needs-cleanup` in `use-supabase-realtime.ts` (suppressed inline with a reason: cleanup runs through `channelRef`) and `UnlayerEmailEditor.tsx` (the inventory treated the legacy editor listener as living on the editor instance, not in an effect; the 2026-09-19 pass later added explicit cleanup on that instance).
- `anchor-has-content` in `menu-dropdown.tsx`: Base UI's `render` prop merges the visible item title into the rendered link.
- `query-mutation-missing-invalidation` in `hooks/donor-portal.ts`: the billing-portal session mutation returns a redirect URL and owns no cached data.
- `insecure-crypto-risk` in `packages/lib/cloudinary-server.ts`: the helper SHA-256s Cloudinary's official sorted string-to-sign (not a credential hash). Cloudinary accepts SHA-1 and SHA-256 hex digests interchangeably. The helper is unused today; the live email uploader in `packages/api/src/email/assets.ts` SHA-256s and sends `signature_algorithm=sha256`.

Deferred with owners (pre-pass inventory; closed in the 2026-09-19 source pass below):

- `no-layout-property-animation` (29 errors, 8 files at inventory): `height: 0 -> "auto"` reveals and `width: 0 -> "auto"` button reveals lived in the donor FAQ accordion, wallet banner, `QuickGiveInput`, missionary donor filters/tag chips/profile field messages, feed media strips, and admin flag banners. The 2026-09-19 pass later replaced those with transform-only motion.
- `react-hooks-js/todo` (10 errors at inventory): React Compiler could not yet lower `try`/`finally` or `throw` inside `try`/`catch` in a few missionary hooks. Those hooks later landed in the 2026-09-19 source pass under annotation mode.
- `socket/low-supply-chain-score`: `maplibre-gl@5.x` was locked at 5.23.0 and covered by GHSA-jrc7-96c5-q579 (`DOM.sanitize()` XSS, fixed in 6.4.1+). First-party code used `Popup.setDOMContent` and disabled the attribution control. The 2026-09-19 pass later upgraded the donor where-we-work map to `maplibre-gl` 6.x.
- Maintainability families (`only-export-components` 57, `no-high-complexity-react-function` 31, `duplicate-jsx-subtree` 9), `no-locale-format-in-render` (27), `no-adjust-state-on-prop-change`/`no-reset-all-state-on-prop-change` (9), `no-pass-live-state-to-parent`/`no-pass-data-to-parent` (7, `carousel` `setApi` contract and `use-data-table-live-query`), `prefer-tag-over-role` (7), and the remaining focus/nesting a11y items were later closed in the 2026-09-19 source pass below.

## 2026-09-19 Cleanup Decisions

React Doctor passes for the configured first-party audit. Command: `bun run react-doctor:first-party -- --full --offline --fail-on none` (React Doctor 0.9.14, `blocking` still `none`). Every wrapper target reported no issues: `@asym/admin`, `@asym/donor`, `@asym/missionary-app`, `@asym/auth`, `@asym/database`, `@asym/lib`, `@asym/missionary`, `@asym/ui`. `doctor.config.json` ignore rules were not expanded.

This is not a claim that every React Doctor rule is enabled. Known ignores stay in `doctor.config.json` and in Configured Ignores above (`no-giant-component`, knip, jsx-a11y, design, micro-optimization, and the other temporary families). Do not add rules to the ignore list to keep this audit green. Re-enable one ignored family at a time with route-owner coverage.

Closed in source from the 2026-09-18 remaining inventory:

- `maplibre-gl` 6.x (GHSA-jrc7-96c5-q579 floor) on the donor where-we-work map.
- Transform-only motion for the previous `no-layout-property-animation` sites.
- Missionary hooks that tripped `react-hooks-js/todo` under React Compiler annotation mode.
- Unlayer editor listener cleanup on the editor instance.
- Remaining `parseJsonResponse` clones in portal hooks check `response.ok` before reading the JSON body.
- Hydration-safe locale formatting (`no-locale-format-in-render`).
- Derive or key state instead of syncing props in effects.
- Notify parents from events, not effects (`carousel` `setApi` and live-query seams kept).
- Async effect cancellation guards and external-store email drafts.
- First-party a11y semantics (`prefer-tag-over-role` and related).
- Non-component exports moved out of component files (`only-export-components`).
- Duplicated JSX subtrees extracted to shared siblings.
- High-complexity React functions extracted in `@asym/admin`, `@asym/donor`, `@asym/missionary-app`, `@asym/missionary`, and `@asym/ui` so each stays under the cyclomatic/cognitive threshold. Public APIs, `base-maia` styling, and upload/donate/Stripe handlers were not restyled or rewritten for score.

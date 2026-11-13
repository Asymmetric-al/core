## Approach

Ownership stays with `packages/ui`. Bun's isolated linker installs the SDK for
that package alone, so applications cannot resolve it directly and reach it
through `@asym/ui/components/primitives/*` wrappers. The existing primitives
export publishes wrappers without touching any barrel, keeping
`optimizePackageImports` barrel imports free of the SDK. Each wrapper starts as
a client module, imports per-component SDK entries, and styles the SDK's
`data-slot` and state attributes with Maia semantic tokens.

The SDK injects a few runtime rules into a `ui-sdk` cascade layer after mount.
`packages/ui/styles/globals.css` declares that layer before Tailwind, which
Tailwind preserves below `theme`, `base`, `components` and `utilities` (it
hoists only its `properties` fallback layer). Admin fixes its layer order in
`apps/admin/app/css-layer-order.css` before the shared stylesheet loads, so it
names `ui-sdk` in the same position. No application sets a page Content
Security Policy, so the SDK needs no nonce meta tag; a future policy must allow
its injected styles and server-rendered style attributes.

The SDK is beta, so both packages share one exact pin. The `ui-sdk` skill is
imported from the upstream commit tagged for that release, which is identical
to the copy bundled in the installed package. Its Core overlay keeps Base UI
the default, points agents at `packages/ui/node_modules/@ui-sdk/react/docs/`,
and overrides upstream defaults that conflict with Core. Factory roles have no
skill loader and start in a control directory, so `packages/ui/AGENTS.md`
names the skill by repository path, which they read inside their assigned
checkout.

`Rating` is the reference wrapper because Base UI has no rating and Core's
existing data-table rating cell is not an accessible radio group. It requires
an accessible name because Base UI field labels do not name SDK parts.

## Verification

Unit tests cover the wrapper's naming, single tab stop, keyboard changes, form
value and server-render hydration. A structural test covers the exact pins,
the single shared SDK and React runtime across the three dashboards, wrapper
resolution from each dashboard, the absence of application imports and of the
optional stylesheet, and the compiled layer order. A Chromium spec hydrates the
server HTML and checks keyboard, focus ring, token colors, contrast, axe and
the layer order in light and dark themes at phone and desktop widths. The
skill test compares the vendored skill with the installed package's bundled
copy. Repository checks include typecheck, lint, the skill mirrors, OpenSpec
validation and the hash-bound review ledgers.

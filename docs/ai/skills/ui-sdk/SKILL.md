---
name: ui-sdk
description: Builds Core UI behavior that no existing @asym/ui component provides with UI SDK (@ui-sdk/react and @ui-sdk/core), such as a star rating, a mixed text-and-token input, keyboard shortcuts, reordering or a custom primitive like a stepper, as a Maia-styled wrapper in packages/ui with keyboard, focus, ARIA, server-rendering and hydration tests. Use when Mission Control, missionary or donor UI work needs such an interaction, when changing a file that imports @ui-sdk/*, or when the user mentions ui-sdk. Ordinary controls keep the existing @asym/ui components, built on Base UI and other shared integrations.
---

# Build with ui-sdk

> **Core:** in Asymmetric-al/core, read [This repository](#this-repository-asymmetric-alcore) at the end first. It replaces the install, docs-path, styling and testing steps below where they differ, and the existing `@asym/ui` components stay the default for ordinary controls.

ui-sdk is a library of UI behaviors: keyboard navigation, focus, selection, dismissal, popups, drag and drop and the ARIA they need. Its components are built from those behaviors and render no styles of their own, in React, Vue, Svelte, Solid and web components. `@ui-sdk/core/web.css` gives them an optional default look. When a component is missing, you build it from the same behaviors in `@ui-sdk/core`, and it gets the same keyboard, focus, server rendering and right to left support.

## Read first

The docs for the installed version ship in each package, as Markdown:

- `node_modules/@ui-sdk/<framework>/docs/llms.txt` is the index. Read it first. `<framework>` is `react`, `vue`, `svelte`, `solid` or `web`.
- Then read only the pages your task needs, like `docs/components/select.md`. Don't read the whole `docs/` folder; it's large.
- An interface built from our components doesn't need `docs/core.md`. Only path 2 below does, and even then you search it by heading: it's over 300 KB. `docs/rendering.md` sits next to it in the same `docs/` folder.
- Don't read compiled JavaScript in `dist/*.js`, even to debug. The docs and the `.d.ts` types are the API; when they don't answer, write a small test that tries it.

The same docs are online at https://ui-sdk.dev/docs. Prefer the installed copy: it matches the version in the project.

A page with no build step, like an Artifact, installs nothing: it loads `https://ui-sdk.dev/web.js` and `web.css` with two tags. Read https://ui-sdk.dev/web.md instead of `llms.txt`. It's the web components docs in one file, for that page, and [references/web-components.md](references/web-components.md#without-a-bundler) has the rest.

Otherwise, if no `@ui-sdk` package is installed yet, install `@ui-sdk/core` and the framework's package with the project's package manager.

## Pick your path

1. **Build an interface from our components**, like a settings page, a form or a command palette: read [references/build-interface.md](references/build-interface.md).
2. **Build a component or behavior ui-sdk doesn't ship**, or extend one of ours: read [references/create-component.md](references/create-component.md).

Most interfaces only need path 1. When one part of it needs a component we don't have, follow path 2 for that part.

Every path ends the same way:

3. **Make it agent-ready**: [references/agent-ready.md](references/agent-ready.md).
4. **Test it**: [references/testing.md](references/testing.md).

## Rules for every path

- **Import from entries.** Each component has its own entry, like `@ui-sdk/react/select`. There's no root import from a framework package. Never import `@ui-sdk/core/internal/*`.
- **One shape everywhere.** A root and its parts, nested as the component page's Composition shows. Change a part's element with `render`, never an `as` prop.
- **Default or controlled.** `defaultValue` to start, or `value` with `onValueChange(value, details)` to control it (each framework's idiom: `v-model` in Vue, `bind:value` in Svelte, properties and events in web components). `details` has `reason`, `source` and `cancel()`.
- **Name every control.** Use the component's label part (`FieldLabel`, `SelectLabel`, `DialogTitle`), or `aria-label` when there's no visible text. People using screen readers and agents both find controls by name.
- **Style from state.** Target `data-slot` and state attributes like `data-open` or `data-pressed`, and the CSS variables each component lists. Never inline styles for state, and never generated ids. When the app uses `web.css`, read [references/styles.md](references/styles.md) first: it draws icons and sets sizes you can't see in the markup.
- **Declare the ui-sdk layer.** Put `@layer ui-sdk;` at the top of the global stylesheet, above `@import "tailwindcss"` if there is one.
- **Check color.** Text needs 4.5:1 against what's behind it, and control edges, focus rings and state fills 3:1. jsdom can't see color, so check it in a real browser.
- **Key lists by value or id**, never by index.
- **Right to left needs no provider.** Components read the direction from the page.
- **Comments are rare.** Write one only when a reader would get the code wrong without it, like a browser quirk or a trade-off, in one or two lines. Never comment what the code does, what a value is, or which section starts here, and no JSDoc blocks on app code.
- **Don't hand-roll what we ship.** Before you write any `role=` attribute, look for the component in the table in [references/build-interface.md](references/build-interface.md). A `div` with `role="listbox"`, `"menu"`, `"dialog"`, `"tablist"`, `"separator"`, `"switch"`, `"slider"`, `"radiogroup"`, `"toolbar"` or `"tree"` next to an installed ui-sdk package is almost always a bug.

## When you're done

1. **Typecheck.** If the root `tsconfig.json` has `"files": []` and `references`, `npx tsc --noEmit` checks nothing: run `npx tsc -b` or `npx tsc --noEmit -p <app config>`. For Svelte, run `svelte-check`; for Vue, `vue-tsc`.
2. **Write and run tests** (see testing.md). Every task gets tests, and every interface gets at least the agent test from agent-ready.md. If a test finds a bug in code you were asked only to test, mark it `test.fails` (or `it.fails`) with a one-line reason, report the bug, and leave the suite green.
3. **Read every comment in your diff.** Delete it unless it names a browser quirk, an APG rule or a trade-off, and cut what's left to two lines. Turn JSDoc on app code into a plain comment or delete it. Never tell the reader to replace something.
4. **Report** each command you ran with its exit code, anything you couldn't check, and anything the docs or types got wrong or left out.

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Adapted from vercel-labs/ui `packages/core/skills/ui-sdk` at commit `8ff6bcf`
(the `@ui-sdk/core@0.1.0-beta.2` release, Apache-2.0). Modified by
Asymmetric-al/core: the description is narrowed, the Core note at the top and
this overlay were added, and three references carry marked secret-scanner
comments. The upstream text above is otherwise unchanged. Provenance is in
`references/upstream.md`, and `LICENSE` is the upstream Apache-2.0 text.

On conflict, follow the current user request, root `AGENTS.md`,
`packages/ui/AGENTS.md` (§ UI SDK) and `docs/ai/rules/frontend.md`. They win
over the upstream text above. Repository paths in this section are relative to
the root of your checkout; resolve them there when you start elsewhere.

### Triggers

- UI work in Mission Control (`apps/admin`), the missionary workspace
  (`apps/missionary`) or the donor portal (`apps/donor`) needs an interaction
  that no existing `@asym/ui` component provides. Examples: a star rating, a
  mixed text-and-token input, keyboard shortcuts, drag-and-keyboard
  reordering, or a custom composite such as a stepper.
- A change touches a file that imports `@ui-sdk/*`, or the user names ui-sdk.
- Not for anything `@asym/ui` already covers, even where UI SDK ships an
  equivalent. Base UI owns Select, Combobox (including multi-select tag chips),
  Dialog, Menu, Tabs, Popover, Tooltip, Switch, Checkbox, Radio Group (labelled
  choices), Slider, Number and OTP fields. Other shared integrations own dates
  (Calendar), command palettes (Command), toasts (Sonner), carousels,
  resizable panels, image cropping, data tables and grids. The upstream "Don't
  hand-roll what we ship" rule does not override these components.

### Workflow

1. **Reuse first.** Search `packages/ui/components/shadcn` and
   `packages/ui/components/primitives`. Use UI SDK only for a gap no shared
   component fills, and keep one owner per interaction: never mix Base UI and
   UI SDK parts in one control.
2. **Read the installed docs.** Bun's isolated linker installs the SDK for
   `packages/ui` only, so the upstream `node_modules/@ui-sdk/...` paths are
   `packages/ui/node_modules/@ui-sdk/...` in this repo:
   - `packages/ui/node_modules/@ui-sdk/react/docs/llms.txt` is the index.
     Read it first.
   - `docs/components/<name>.md` and `docs/hooks/<name>.md` in the same
     package describe each part you use.
   - For a new primitive, search `docs/core.md` by heading (it is over 300 KB)
     and read `docs/rendering.md` and `docs/server-rendering.md`.
   - `packages/ui/package.json` pins `@ui-sdk/core` and `@ui-sdk/react` to one
     exact version. The skill bundled at
     `packages/ui/node_modules/@ui-sdk/core/skills/ui-sdk/` must match this
     copy; `tests/unit/docs/ui-sdk-skill.test.ts` enforces it.
3. **Wrap it in `packages/ui`.** Put each adopted part in a Maia-styled wrapper
   at `packages/ui/components/primitives/<name>.tsx`. The existing
   `./components/primitives/*` export publishes it; do not add it to a barrel
   or re-export the SDK. Start the file with `"use client"`, import
   per-component entries such as `@ui-sdk/react/rating` (there is no root
   entry, and never `@ui-sdk/core/internal/*`), and import shared helpers
   through `@asym/ui/...` or relative paths, not `@/`. Apps import the wrapper
   (`@asym/ui/components/primitives/<name>`) and never declare or import
   `@ui-sdk/*`. A behavior-only wrapper, such as a shortcut hook, lives there
   too, so it gets the same narrow export.
4. **Style with Maia tokens.** Target the SDK's `data-slot` and state
   attributes (`data-filled`, `data-checked`, `data-open` and so on) with
   Tailwind data variants and semantic tokens such as `text-muted-foreground`
   and `ring-ring/50`. Do not import the optional `@ui-sdk/core/web.css` or
   use the CDN `web.js` page setup, and add no `--ui-*` theme, raw colors or
   inline styles. `@layer ui-sdk;` already opens
   `packages/ui/styles/globals.css` and appears in
   `apps/admin/app/css-layer-order.css`; keep both. On touch screens Core's
   base layer gives buttons a 44px minimum height, so size the part that holds
   an SDK button to match (the Rating star uses `pointer-coarse:size-11`).
5. **Name every control.** Core's Base UI `Field` and `FieldLabel` do not name
   UI SDK parts. Pass `aria-label` or `aria-labelledby`; the reference
   wrapper's types require one.
6. **Keep boundaries.** SDK component entries already carry `"use client"`; a
   wrapper with state, callbacks or render functions needs its own. Ordinary
   use needs no provider, `Preferences`, agent bridge (`createAgent`), WebMCP
   or CSP change. Treat "Make it agent-ready" above as guidance on accessible
   names, not a required step, unless the user asks for agent integration.
   The SDK's layer stack (modal pausing, dismissal order) only knows SDK
   popups, so guard shortcuts and outside-press behavior yourself when a Base
   UI dialog or menu can be open.
7. **Test first.** Follow `docs/ai/skills/tdd/SKILL.md`. Write a jsdom test
   under `tests/unit/packages/ui/components/primitives/` (names, one tab stop,
   keys, values, server render plus hydration). For layout, focus movement,
   touch or popups, add a real-browser spec like
   `tests/e2e/ui-sdk-rating.spec.ts` (server HTML, hydration, keyboard, token
   colors, touch targets, axe). Register it in two allowlists, the `testMatch`
   list in `tests/e2e/playwright-isolated.config.ts` and the
   `test:e2e:production-gate` script in the root `package.json`, or CI never
   runs it. Tests outside `packages/ui` cannot import `@ui-sdk/*` by bare
   specifier, so test through the wrapper; if you need
   `@ui-sdk/core/testing`, add an exact-file alias in `vitest.config.mts`
   beside its existing `packages/ui/node_modules` pins. Use Core's installed
   Vitest and Playwright, not the upstream install commands. Never mark a
   failing test `test.fails` or `it.fails` to keep a suite green: fix the bug,
   or report it as a blocker.
8. **Verify with Core commands.** Run
   `bunx turbo run typecheck --filter=@asym/ui` plus each consuming app,
   `bun run lint`, focused `bunx vitest run <files>`, and
   `node node_modules/@playwright/test/cli.js test --config=tests/e2e/playwright-isolated.config.ts <spec>`.
   Do not use `npx tsc` or install packages as part of UI work. Editing
   `packages/ui/package.json`, `packages/ui/styles/globals.css`,
   `packages/ui/AGENTS.md` or `docs/ai/rules/frontend.md` stales hash-bound
   review proofs; rebind them after review as `bun run verify:shadscan` and
   `bun run verify:shadcn-diff` report.
9. **Upgrade deliberately.** UI SDK is beta. Never bump it as a side effect. A
   bump moves both exact pins together, rereads that release's docs, reruns
   the wrapper tests and refreshes this skill from the same release.

The reference implementation is
`packages/ui/components/primitives/rating.tsx`, with its unit test
`tests/unit/packages/ui/components/primitives/rating.test.tsx` and its browser
proof `tests/e2e/ui-sdk-rating.spec.ts` (fixture
`tests/e2e/fixtures/ui-sdk-rating.tsx`).

### Checklist

- [ ] No existing `@asym/ui` component covered the interaction, and the gap is
      named in the change
- [ ] The wrapper lives in `packages/ui/components/primitives/` and imports
      per-component SDK entries; apps import only the wrapper
- [ ] Only Maia semantic tokens and SDK data attributes style it; no
      `web.css`, raw colors, inline styles or new theme
- [ ] Every control is named; keyboard, focus ring, hydration, contrast, touch
      targets and axe were checked in a real browser spec that CI runs
- [ ] Failing tests were fixed or reported, never hidden with `test.fails`
- [ ] Skill edits change `docs/ai/skills/ui-sdk/` (never a generated mirror)
      and update `references/upstream.md`
      before running `bun run skills:sync` and the non-mutating
      `bun run skills:verify`

<!-- CORE-OVERLAY-END -->

---
name: ui-sdk
description: Builds and maintains Core's UI SDK (@ui-sdk/react and @ui-sdk/core) components as Maia-styled wrappers in packages/ui, with keyboard, focus, ARIA, server-rendering and hydration tests. Use when evaluating or implementing a shared control where UI SDK may give better interaction, accessibility, simplicity, maintainability or measured performance than the current option (Base UI and UI SDK are both approved), when changing or improving a file that imports @ui-sdk/*, or when the user asks for ui-sdk. Not needed merely because the SDK is installed, for ordinary page composition with existing @asym/ui components, or for Base UI component work.
---

# Build with ui-sdk

> **Core:** in Asymmetric-al/core, read [This repository](#this-repository-asymmetric-alcore) at the end first. It replaces the install, docs-path, styling and testing steps below where they differ. Reuse existing `@asym/ui` components first; the import, part, attribute and testing rules below apply to UI SDK code only.

ui-sdk is a library of UI behaviors: keyboard navigation, focus, selection, dismissal, popups, drag and drop and the ARIA they need. Its components are built from those behaviors and render no styles of their own, in React, Vue, Svelte, Solid and web components. `@ui-sdk/core/web.css` gives them an optional default look. When a component is missing, you build it from the same behaviors in `@ui-sdk/core`, and it gets the same keyboard, focus, server rendering and right to left support.

## Read first

The docs for the installed version ship in each package, as Markdown:

- `node_modules/@ui-sdk/<framework>/docs/llms.txt` is the index. Read it first. `<framework>` is `react`, `vue`, `svelte`, `solid` or `web`.
- Then read only the pages your task needs, like `docs/components/select.md`. Don't read the whole `docs/` folder; it's large.
- An interface built from our components doesn't need `docs/core.md`. Only path 2 below does, and even then you search it by heading: it's over 300 KB. `docs/rendering.md` sits next to it in the same `docs/` folder.
- Don't read compiled JavaScript in `dist/*.js`, even to debug. The docs and the `.d.ts` types are the API; when they don't answer, write a small test that tries it.

The same docs are online at https://ui-sdk.dev/docs. Prefer the installed copy: it matches the version in the project.

A page with no build step, like an Artifact, installs nothing: it loads `https://ui-sdk.dev/web.js` and `web.css` with two tags. Read https://ui-sdk.dev/web.md instead of `llms.txt`. It's the web components docs in one file, for that page, and [references/web-components.md](references/web-components.md#without-a-bundler) has the rest.

Otherwise, if no `@ui-sdk` package is installed yet, install `@ui-sdk/core` and the framework's package with the project's package manager. In a Nuxt 4 or newer app using `@ui-sdk/vue`, also add `"@ui-sdk/vue"` to `modules` in `nuxt.config.ts`.

## Pick your path

1. **Build an interface from our components**, like a settings page, a form or a command palette: read [references/build-interface.md](references/build-interface.md).
2. **Build a component or behavior ui-sdk doesn't ship**, or extend one of ours: read [references/create-component.md](references/create-component.md).

Most interfaces only need path 1. When one part of it needs a component we don't have, follow path 2 for that part.

Every path ends the same way:

3. **Make it agent-ready**: [references/agent-ready.md](references/agent-ready.md).
4. **Test it**: [references/testing.md](references/testing.md).

## Rules for every path

- **Import from entries.** Each component has its own entry, like `@ui-sdk/react/select`. Import components from there, not from a package root. Never import `@ui-sdk/core/internal/*`.
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

Adapted from vercel-labs/ui `packages/core/skills/ui-sdk` at commit `d850982`
(the `@ui-sdk/core@0.1.0-beta.17` release, Apache-2.0). Modified by
Asymmetric-al/core: the description is rewritten, the Core note at the top and
this overlay were added, and three references carry marked secret-scanner
comments. The upstream text above is otherwise unchanged. Provenance is in
`references/upstream.md`, and `LICENSE` is the upstream Apache-2.0 text.

On conflict, follow the current user request, root `AGENTS.md`,
`packages/ui/AGENTS.md` (Choosing a library, UI SDK implementation) and
`docs/ai/rules/frontend.md`. They win
over the upstream text above. Repository paths in this section are relative to
the root of your checkout; resolve them there when you start elsewhere.

### Triggers

- Shared UI work for Mission Control (`apps/admin`), the missionary workspace
  (`apps/missionary`) or the donor portal (`apps/donor`) is evaluating or
  building a control where UI SDK may be the better implementation. It is the
  natural choice for what only it ships (a mixed text-and-token input, a custom
  composite such as a stepper), and it may be chosen over a Base UI equivalent
  for a concrete benefit. A star rating, page shortcuts and list reordering
  already have shared owners, listed below: reuse them.
- A change touches a file that imports `@ui-sdk/*`, or the user names ui-sdk.
- Not merely because the SDK is installed, and not for ordinary page
  composition, which uses existing `@asym/ui` components. The upstream "Don't
  hand-roll what we ship" rule does not require replacing existing shared
  components such as Select, Combobox, Dialog, Menu, Tabs, Calendar, Command
  or Sonner.

### Workflow

1. **Reuse first, then choose.** Search `packages/ui/components/shadcn` and
   `packages/ui/components/primitives`, and improve the existing component
   when it serves. Choose UI SDK for a concrete benefit (interaction,
   accessibility, simpler or more maintainable code, demonstrated performance)
   and say so in the change description; no decision document is needed. An
   existing Base UI equivalent does not rule it out, and SDK availability alone
   is no reason to replace a working component. One library owns a control's
   internals: do not mix Base UI and UI SDK parts in one control. When the SDK
   version supersedes a shared component, migrate its consumers and remove the
   old one.
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
   use needs no provider, `Preferences` or CSP change. Core has one agent
   bridge owner (below): never call `createAgent` or `registerTools` anywhere
   else; mount no other bridge unless the user asks for agent integration.
   Base UI and native controls are operated through their accessible names,
   roles and states, not the bridge. "Make it agent-ready" above applies to
   every SDK-backed control: name it, keep its checks in change callbacks, and
   put `data-agent-confirm` on anything that deletes, pays or sends. The SDK's
   layer stack (modal pausing, dismissal order) only knows SDK popups; the
   shared shortcut owner already guards Base UI overlays, so guard
   outside-press behavior yourself when a Base UI dialog or menu can be open.
   An SDK control may sit inside a Base UI dialog, popover or form, and the
   reverse. Test focus order and return, accessible names, Escape and
   outside-press dismissal, and overlay stacking across that boundary.
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
   `packages/ui/styles/globals.css`, `packages/ui/AGENTS.md` or
   `docs/ai/rules/frontend.md` stales hash-bound review proofs in
   `tooling/shadcn/upstream-review-baseline.json`; rebind them after review as
   `bun run verify:shadcn-diff` reports.
9. **Upgrade deliberately.** UI SDK is beta. Never bump it as a side effect. A
   bump moves both exact pins together, rereads that release's docs, reruns
   the wrapper tests and refreshes this skill from the same release.

Core's shared UI SDK owners, all in `packages/ui/components/primitives/`:

- `shortcut.tsx`: every page or region keyboard shortcut (`useShortcut`,
  always with a `description`), its hint and `aria-keyshortcuts`
  (`useShortcutHint`, `ShortcutHint`), and the list behind the help
  (`listShortcuts`). It decides typing, open Base UI overlays, regions, held
  keys and hydration-safe hints. Never add a `keydown` listener for a
  shortcut.
- `shortcut-help.tsx`: the Shift+? dialog listing the described shortcuts
  that work where focus is, also from inside a dialog or sheet, mounted once
  per app shell (a second host stays inert).
- `sortable-list.tsx`: reordering a list with a drag handle, keyboard
  pick-up, announcements and an agent `move` action.
- `agent-bridge.tsx`: the one agent bridge, mounted once per document that
  renders SDK-backed controls (Mission Control's shell and its Web Studio
  layout today) with a deny-by-default allowlist pinned to each list's label.
  It sees only SDK-backed controls; never mirror a Base UI or native control
  into it.
- Pattern checks: `@ui-sdk/core/testing` is aliased in `vitest.config.mts`,
  and `tests/e2e/ui-sdk-pattern-conformance.spec.ts` runs `checkPattern`
  over Core's retained Base UI wrappers in Chromium, recording each accepted
  deviation and its reason. Give a new shared interactive wrapper a check
  there.

The reference implementation is
`packages/ui/components/primitives/rating.tsx`, with its unit test
`tests/unit/packages/ui/components/primitives/rating.test.tsx` and its browser
proof `tests/e2e/ui-sdk-rating.spec.ts` (fixture
`tests/e2e/fixtures/ui-sdk-rating.tsx`).

### Checklist

- [ ] An existing `@asym/ui` component was reused or improved where it served,
      and the change description says why UI SDK was chosen
- [ ] The wrapper lives in `packages/ui/components/primitives/` and imports
      per-component SDK entries; apps import only the wrapper
- [ ] Only Maia semantic tokens and SDK data attributes style it; no
      `web.css`, raw colors, inline styles or new theme
- [ ] Every control is named; keyboard, focus ring, hydration, contrast, touch
      targets and axe were checked, in a real browser spec that CI runs when
      the change affects layout, focus movement, touch or popups
- [ ] Failing tests were fixed or reported, never hidden with `test.fails`
- [ ] Skill edits change `docs/ai/skills/ui-sdk/` (never a generated mirror)
      and update `references/upstream.md`
      before running `bun run skills:sync` and the non-mutating
      `bun run skills:verify`

<!-- CORE-OVERLAY-END -->

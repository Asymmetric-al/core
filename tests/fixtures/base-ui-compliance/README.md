# Base UI browser compliance fixture

Run from the repository root after the normal frozen-lockfile install:

```sh
bunx playwright install --with-deps chromium
bun run test:e2e:base-ui
```

The command typechecks the Playwright configuration/specs, then builds the fixture bundle and starts and stops its own static Vite preview on `127.0.0.1:5198`. It does not reuse an existing server, start a product app, or load `.env` files. Four Chromium projects cover desktop/mobile widths (1280/390), light/normal motion, and dark/reduced motion. `--project=mobile-dark-reduced` or `--grep "drawer"` selects a smaller check.

On the Ubuntu 26.04 development host used for the initial verification, Playwright needed its supported Ubuntu 24.04 dependency/browser bundle:

```sh
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 bun run test:e2e:base-ui
```

Do not set that override on other operating systems by default.

`main.tsx` composes the actual shared primitives and the actual application components in the adjacent fixture modules. The sole application provider stub redirects LabelForm's mutation hook to `label-mutation-stub.ts`, recording its payload without I/O. A Playwright fixture rejects unexpected external or `/api/` requests, page exceptions and console errors. The offline gift dialog is exercised only through its local mode selection, never submitted.

The preview starts only after the complete build, so a cold run cannot race dependency optimization or reload another test through HMR.

`server.mjs` compiles the real `packages/ui/styles/globals.css` through the installed Tailwind/PostCSS pipeline. It resolves Vite from the existing Vitest dependency graph, so this gate adds no dependency or alternate design system. Generated CSS, Vite cache, screenshots, traces and HTML reports are written beneath ignored root `test-results/base-ui-compliance/`.

The specs verify keyboard and focus contracts, named controls and groups, state callbacks, native form values, disabled/pending actions, drawer touch/snap movement, short-document backdrops, nested portal stacking, computed motion, and axe checks. They provide repeatable component integration evidence. They do not establish physical iOS software-keyboard behavior, assistive-technology interoperability, or provider-backed production workflows.

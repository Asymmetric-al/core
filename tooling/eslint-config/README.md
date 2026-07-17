# @asym/eslint-config

Unified ESLint flat configs for the monorepo.

## Overview

This package is the single source of truth for lint rules used across:

- `apps/*` via `@asym/eslint-config/nextjs.mjs`
- `packages/*` via `@asym/eslint-config/library.mjs`
- shared/fallback usage via `@asym/eslint-config/base.mjs`

The shared base config enforces architecture boundaries and high-signal bug-catching rules.

## Usage

### Next.js app

```js
import { nextjsConfig } from "@asym/eslint-config/nextjs.mjs";

export default nextjsConfig;
```

### Library/package

```js
import { libraryConfig } from "@asym/eslint-config/library.mjs";

export default libraryConfig;
```

## Workspace Contract

- Every workspace under `apps/*` must include `eslint.config.mjs` and export `nextjsConfig`.
- Every workspace under `packages/*` must include `eslint.config.mjs` and export `libraryConfig`.
- Every workspace using `libraryConfig` must include a local `tsconfig.json` so type-aware parsing can resolve project settings.
- Transitional package-specific relaxations are allowed only as temporary overrides in package-local `eslint.config.mjs`, with a TODO marker and follow-up tracking.
- Any package config that sets a rule to `"off"` without a `TODO(...)` tracking marker fails `bun run verify:eslint`.

### Base-only

```js
import { baseConfig } from "@asym/eslint-config/base.mjs";

export default baseConfig;
```

## Architecture Boundary Enforcement

The base config blocks cross-app imports (for example imports into `apps/admin`, `apps/donor`, or `apps/missionary`) using `no-restricted-imports`.

Expected design:

- app-specific code stays in its own app
- shared code moves into `@asym/*` packages

## Pragmatic Exception Policy

Use lint disables only for transitional or legacy code that cannot be resolved immediately.

Required format:

```ts
// eslint-disable-next-line <rule> -- TODO(T3-follow-up): <rationale>
```

Rules:

- Every disable must include a tracking TODO or ticket reference.
- Keep disable scope as small as possible (`eslint-disable-next-line` preferred).
- Remove the disable once the follow-up task lands.

Acceptable:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(T3-follow-up): remove legacy API any after payload migration
```

Unacceptable:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

## Migration Guide (legacy `.eslintrc.*` -> flat config)

1. Replace legacy config usage with `eslint.config.mjs`.
2. Import either `nextjsConfig`, `libraryConfig`, or `baseConfig`.
3. Remove `.eslintrc.*` files once migrated.
4. Run `bun run lint` from repository root.

The legacy CJS `base.js` has been removed; all consumers use the flat-config
exports.

## Import Boundary Rules

The `no-restricted-imports` boundary knowledge (cross-app import bans, the
motion/react ban, the raw Twenty client ban) lives in
`restricted-imports.mjs`. The rule REPLACES (never merges) earlier entries for
a matching file, so any override block that re-declares it must carry the full
boundary set again. Never inline pattern groups; compose the rule through the
builders instead:

- `restrictedImports({ exclude, extraPatterns, extraPaths })` — universal set
  (cross-app + motion) for all first-party source.
- `appRestrictedImports(...)` — universal set plus the raw Twenty client ban,
  for app code zones.

## Adding Rules or Plugins

1. Add plugin dependency at repository root and keep optional peers in this package.
2. Add shared rules in `base.mjs` unless they are framework-specific.
3. Add framework-specific rules in `nextjs.mjs` or `library.mjs`.
4. Run:
   - `bun run lint`
   - `bun run verify:eslint`

## Troubleshooting

- `Parsing error: project not found`:
  - ensure workspace has `tsconfig.json`
  - run lint from the correct workspace/root entrypoint
- `Plugin not found`:
  - install root dependencies with `bun install`
- Boundary import errors:
  - move shared code into a `packages/*` workspace and import via `@asym/*`

# Monorepo Architecture

## Overview

This repository uses Bun workspaces for package management and Turborepo for task orchestration and caching.
`bun run verify:workspace-contract` (`scripts/verify-workspace-contract.mjs`) enforces the workspace contract described here.

## Workspace Structure

```text
.
|- apps/
|  |- admin
|  |- donor
|  |- missionary
|  `- factory-console (private VM 100 operator service, not deployed)
|- packages/
|  |- api
|  |- auth
|  |- config
|  |- database
|  |- email
|  |- env
|  |- eve-runtime
|  |- graphql
|  |- lib
|  |- missionary
|  |- mock-data
|  `- ui
`- tooling/
   |- eslint-config
   |- shadcn (review baseline data, not a workspace package)
   `- typescript-config
```

Contracted workspace globs in root `package.json`:

- `apps/*`
- `packages/*`
- `packages/env`
- `tooling/*`

## Naming Conventions

Every workspace package must use the `@asym/<name>` scope.

Examples:

- `@asym/admin`
- `@asym/donor`
- `@asym/missionary-app`
- `@asym/ui`
- `@asym/eslint-config`

## Dependency Protocol

Internal workspace dependencies must use `workspace:*`.

Example:

```json
{
  "dependencies": {
    "@asym/ui": "workspace:*",
    "@asym/config": "workspace:*"
  }
}
```

The only allowed exception is the vendored `@asym/pdf-*` and
`@asym/docraptor-client` archives, referenced as `file:` paths to versioned
`.tgz` files in `vendor/react-pdf-packages/`.

## Placement Rules

Use this decision flow when placing code:

1. Is it deployable app routing/UI/runtime behavior for one surface? -> `apps/*`
2. Is it shared runtime code used by two or more apps? -> `packages/*`
3. Is it environment schema/config contract code? -> `packages/env`
4. Is it build/lint/type/tooling configuration? -> `tooling/*`

Quick rules:

- App-specific feature code belongs in `apps/*`.
- Reusable business/runtime code belongs in `packages/*`.
- Toolchain config packages belong in `tooling/*`.

## Current Workspaces

### Apps

- `apps/admin` -> `@asym/admin`
- `apps/donor` -> `@asym/donor`
- `apps/missionary` -> `@asym/missionary-app`
- `apps/factory-console` -> `@asym/factory-console`: the private owner-only
  operator Console for the Core software factory. It is not a product app:
  it runs only as a loopback service on VM 100 and is never deployed to
  Vercel. Root lint, typecheck, unit tests and the shared design-system rules
  cover it; CI compiles it only for develop pull requests that touch it or a
  workspace package it depends on (`OPERATOR_BUILD_APPS` in
  `scripts/verify/ci-build-policy.mjs`), and `bun run build` builds only the
  three product apps. See `docs/guides/architecture/runtime-map.md`.

### Packages

- `packages/api` -> `@asym/api`
- `packages/auth` -> `@asym/auth`
- `packages/config` -> `@asym/config`
- `packages/database` -> `@asym/database`
- `packages/email` -> `@asym/email`
- `packages/env` -> `@asym/env`
- `packages/eve-runtime` -> `@asym/eve-runtime` (product Eve runtime; separate from the coding-agent skill library, see `packages/eve-runtime/AGENTS.md`)
- `packages/graphql` -> `@asym/graphql`
- `packages/lib` -> `@asym/lib`
- `packages/missionary` -> `@asym/missionary`
- `packages/mock-data` -> `@asym/mock-data`
- `packages/ui` -> `@asym/ui`

### Tooling

- `tooling/eslint-config` -> `@asym/eslint-config`
- `tooling/typescript-config` -> `@asym/typescript-config`

## Adding New Workspaces

### Add a new app

1. Create `apps/<app-name>/`.
2. Add `apps/<app-name>/package.json` with `name: "@asym/<app-name>"`.
3. Use `workspace:*` for internal dependencies.
4. Add scripts expected by Turbo (`dev`, `build`, `lint`, `typecheck`).
5. Run `bun run verify:workspace-contract`.

Minimal app `package.json`:

```json
{
  "name": "@asym/my-new-app",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@asym/ui": "workspace:*"
  }
}
```

### Add a new package

1. Create `packages/<package-name>/`.
2. Add `packages/<package-name>/package.json` with `name: "@asym/<package-name>"`.
3. Export package entrypoints and import by package name, not relative cross-package paths.
4. Use `workspace:*` for internal dependencies.
5. Run `bun run verify:workspace-contract`.

Minimal package `package.json`:

```json
{
  "name": "@asym/my-new-package",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@asym/config": "workspace:*"
  }
}
```

### Add a new tooling package

1. Create `tooling/<tool-name>/`.
2. Add `tooling/<tool-name>/package.json` with `name: "@asym/<tool-name>"`.
3. Keep package scope focused on lint/build/type/tooling behavior.
4. Reference from workspace consumers via `workspace:*`.
5. Run `bun run verify:workspace-contract`.

## Verification

Primary guardrail:

```bash
bun run verify:workspace-contract
```

What it validates:

- Root workspace globs align with the contract.
- Workspace package names follow `@asym/*`.
- Internal workspace dependencies use `workspace:*` (except the vendored archives above).
- App Router `route`/`layout`/`page` files do not export route segment config
  (`runtime`, `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`,
  `preferredRegion`, `maxDuration`); Cache Components is enabled.
- Every `apps/*/app/api/**/route.ts` (and `apps/*/src/app/api/**`) has a row in
  `docs/guides/architecture/runtime-map.md`. Add the row when you add an API route.
- No page lives under a `__boneyard__` private folder.

The same script then runs `scripts/verify/typescript-toolchain.mjs` and
`bun run verify:pdf-package-provenance`.

Task orchestration comes from the `turbo.json` task definitions (`build`, `lint`, `typecheck`, `dev`, and others).

## Common Mistakes

- Using unscoped names like `"admin"` instead of `"@asym/admin"`.
- Using `file:` for internal dependencies instead of `workspace:*`.
- Adding shared runtime code under `apps/*` instead of `packages/*`.
- Putting toolchain configuration under `packages/*` instead of `tooling/*`.
- Creating folders under workspace roots without a valid `package.json` and expecting workspace resolution.

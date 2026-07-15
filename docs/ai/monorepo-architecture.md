# Monorepo Architecture

## Overview

This repository uses Bun workspaces for package management and Turborepo for task orchestration and caching.
The workspace contract is defined in `README.md` and enforced by `bun run verify:workspace-contract`.

## Workspace Structure

```text
.
|- apps/
|  |- admin
|  |- donor
|  |- missionary
|  `- contract-test (support folder, not a workspace package)
|- packages/
|  |- api
|  |- auth
|  |- config
|  |- database
|  |- email
|  |- env
|  |- graphql
|  |- lib
|  |- missionary
|  |- mock-data
|  `- ui
`- tooling/
   |- eslint-config
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

Rationale:

- Ensures local linking behavior is explicit and consistent.
- Prevents drift from `file:` links and ad-hoc path references.
- Keeps workspace dependency validation simple and enforceable.

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

### Packages

- `packages/api` -> `@asym/api`
- `packages/auth` -> `@asym/auth`
- `packages/config` -> `@asym/config`
- `packages/database` -> `@asym/database`
- `packages/email` -> `@asym/email`
- `packages/env` -> `@asym/env`
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
- Internal workspace dependencies use `workspace:*`.

Related orchestration comes from `turbo.json` task definitions (`build`, `lint`, `typecheck`, `test`, etc.).

## Common Mistakes

- Using unscoped names like `"admin"` instead of `"@asym/admin"`.
- Using `file:` for internal dependencies instead of `workspace:*`.
- Adding shared runtime code under `apps/*` instead of `packages/*`.
- Putting toolchain configuration under `packages/*` instead of `tooling/*`.
- Creating folders under workspace roots without a valid `package.json` and expecting workspace resolution.

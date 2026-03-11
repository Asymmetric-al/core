# TypeScript Config Hierarchy

This package provides shared TypeScript config presets for the monorepo.

## Configs

- `base.json`
  - Monorepo strict baseline.
  - Enforces `strict`, `verbatimModuleSyntax`, and `noUncheckedIndexedAccess`.
- `nextjs.json`
  - App-focused preset for Next.js workspaces.
  - Extends `base.json` and keeps `noEmit` for app typechecking.
- `library.json`
  - Package-focused preset for shared libraries.
  - Extends `base.json` and enables `isolatedDeclarations` for staged TS 6.0 readiness.
  - Sets `composite`, `declaration`, and `declarationMap`.
- `library-transitional.json`
  - Transitional preset for packages not yet ready for `isolatedDeclarations`.
  - Extends `base.json` directly.
  - Sets `composite: false`, `declaration: false`, and `declarationMap: false`.
  - Does not set `isolatedDeclarations` (inherits `false` from `base.json`).
- `react.json`
  - React library preset where `isolatedDeclarations` is not required.
  - Extends `base.json` and sets React JSX/library defaults.

## When To Use Which

| Scenario                                              | Config                                              |
| ----------------------------------------------------- | --------------------------------------------------- |
| Apps (`apps/*`)                                       | `@asym/typescript-config/nextjs.json`               |
| Packages ready for `isolatedDeclarations`             | `@asym/typescript-config/library.json`              |
| Packages **not yet** ready for `isolatedDeclarations` | `@asym/typescript-config/library-transitional.json` |
| Legacy/edge React scenarios                           | `@asym/typescript-config/react.json`                |

## Staged `isolatedDeclarations` Rollout

- `isolatedDeclarations` is enabled only in `library.json`.
- `base.json` intentionally keeps `isolatedModules` but does not force `isolatedDeclarations`.
- This keeps app ergonomics unchanged while enforcing stronger declaration safety in shared packages.

Related readiness context:

- TypeScript release notes for `isolatedDeclarations`: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations
- TypeScript roadmap: https://github.com/microsoft/TypeScript/wiki/Roadmap

## Migration Examples

App:

```json
{
  "extends": "@asym/typescript-config/nextjs.json"
}
```

Package:

```json
{
  "extends": "@asym/typescript-config/library.json"
}
```

## Migration: Transitional -> Library

1. Run `bun run typecheck` and note any `isolatedDeclarations`-related errors (typically missing explicit return types on exported functions).
2. Add explicit return types to all exported functions flagged by the compiler.
3. Once zero errors remain, change the package `extends` from `library-transitional.json` to `library.json`.
4. Remove any redundant `lib` override if it matches `library.json` defaults.
5. Run `bun run typecheck` again to confirm.

## Configuration Hierarchy

```mermaid
graph TD
    base[base.json\nstrict, verbatimModuleSyntax,\nnoUncheckedIndexedAccess]
    nextjs[nextjs.json\nNext.js plugins, noEmit]
    library[library.json\nisolatedDeclarations: true\ncomposite, declaration]
    transitional[library-transitional.json\nisolatedDeclarations: false\ncomposite: false]
    react[react.json\nReact JSX transform]

    base --> nextjs
    base --> library
    base --> transitional
    base --> react

    apps[Apps: admin, donor, missionary]
    pkgs_ready[Packages ready:\n— none yet]
    pkgs_transitional[Packages transitional:\napi, ui, database, lib,\nconfig, graphql, auth]

    nextjs --> apps
    library --> pkgs_ready
    transitional --> pkgs_transitional
    transitional -.->|migrate when ready| library
```

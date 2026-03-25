# TypeScript 6 / 7 readiness (prep only)

This document is a **preparation and policy** guide. It is **not** the TypeScript upgrade runbook. The repo stays on **TypeScript 5.9.x** until a dedicated upgrade task bumps the compiler.

## Why this prep pass exists

Microsoft positions **TypeScript 6.0** as a **bridge** release (last Strada/JavaScript compiler line) before **TypeScript 7.0** (native compiler). Official posts:

- [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [Progress on TypeScript 7 - December 2025](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)

6.0 changes **defaults** and **deprecates** options that 7.0 will remove. Preparing early reduces surprise; changing the compiler version is intentionally separate.

## What changed in TypeScript 6.0 that matters here

From the official 6.0 announcement (non-exhaustive; see the post for the full list):

| Area | TypeScript 6.0 direction | Why it matters in this monorepo |
|------|-------------------------|--------------------------------|
| **Defaults** | `strict`, `module`, `target`, `noUncheckedSideEffectImports`, `libReplacement`, `rootDir`, `types` | We already set many flags explicitly in `tooling/typescript-config/base.json`. 6.0 defaults can still affect **omitted** options. |
| **`baseUrl`** | Deprecated; **removed in TS 7** (per TS 7 progress post / breaking-change tracking) | We removed redundant `baseUrl` where only `paths` was needed; do not reintroduce `baseUrl` in new code. |
| **`moduleResolution: node10`** | Deprecated; removed in TS 7 in favor of **bundler** and **nodenext** | This repo’s Next apps and shared base already use **bundler**; avoid `node`/`node10`. |
| **`rootDir`** | Default becomes the directory containing `tsconfig.json`; emit layout can change if you relied on inference | Packages with `outDir` + deep `include` should keep **explicit** `rootDir` where emit layout matters. |
| **`types`** | Default becomes `[]` instead of “all `@types`” | Config/scripts that relied on ambient `@types` without imports may need explicit `"types": ["node"]` (or test runner types) per workspace. |
| **`noUncheckedSideEffectImports`** | Default becomes `true` in 6.0 | Layouts use `import "./globals.css"` and similar; enabling globally requires verified module declarations. **Deferred** for default shared config. |
| **Import assertions** | Old `import ... assert { }` deprecated (extended to dynamic `import()`) | Repo audit: no `assert {` usage found; do not add legacy assertion syntax. |
| **`stableTypeOrdering`** | New flag to align ordering with TS 7 for **comparison** | **Do not** enable in normal shared configs; optional diagnostic only (slows checks ~up to 25% per official note). |

## What TypeScript 7 means here (plain language)

- **Performance:** Native compiler (`tsgo` / `@typescript/native-preview`) is optional side-by-side validation, not part of default repo workflows.
- **Breaking removals:** TS 7 drops deprecated TS 6 behaviors (e.g. **`baseUrl`**, **`node10` resolution**, stricter **`rootDir`/`outDir` expectations** per official roadmap summaries).
- **Practical approach:** Use TS 6.0 when you upgrade off 5.9; use native preview **optionally** to compare type errors (official TS 7 post states high parity with ~known gaps).

## Module resolution: how to choose (this repo)

- **`moduleResolution: "bundler"`** with **`module: "ESNext"`** (or Next’s `esnext`): **Next.js apps**, packages consumed only through **Vite/Next/Bun bundlers**, and shared `base.json` defaults. Matches current `tooling/typescript-config/base.json` and `nextjs.json`.
- **`moduleResolution: "nodenext"`** / **`module: "nodenext"`**: Prefer when the **primary** artifact is **Node-run `.js`** with **package.json `exports`**, and you want resolution to match Node. Do not switch apps away from bundler “just because.”
- **Never** target **`node10`** (`"node"`) for new work; it is on the removal path for TS 7.

## `baseUrl` and `paths`

- Official [TSConfig `paths`](https://www.typescriptlang.org/tsconfig#paths): **`paths` can be used without `baseUrl`.** Patterns are resolved relative to the tsconfig file.
- **House rule:** Do **not** add **`baseUrl`** in new configs. Use **`paths`** only (as in `apps/*/tsconfig.json` for `@/*`).
- **Legacy:** If you see bare imports that only worked via `baseUrl` (non-`paths` rewriting), document and fix deliberately; do not guess.

## Aliases going forward

- **Next apps:** `@/*` → `./*` in each app’s `tsconfig.json` (example: `apps/admin/tsconfig.json`).
- **Packages (`@asym/ui`, `@asym/missionary`):** same pattern for editor/tsc resolution; bundlers must still resolve aliases (Next/Vite config). **Package `exports`** remain the runtime public API — tsconfig aliases are for **typechecking and DX**, not a substitute for `exports`.
- **Vitest:** root `vitest.config.ts` uses `resolve.alias` for `@` → `./src`; keep test aliases in sync with test layout, not necessarily app `src/`.

## `types` array

- TypeScript 6.0 default **`types: []`** means globals from random `@types` packages may no longer appear unless listed.
- **Do not** push a one-size `types` array from shared base unless **every** extending workspace is verified (apps, packages, scripts).
- **Prefer:** local `tsconfig` for **Node scripts**, **Vitest**, or **Playwright** configs if they need `node` or test globals explicitly.
- If you see “Cannot find name `process` / `describe` / …” after an upgrade, add the minimal `types` entry for that project (official 6.0 announcement examples).

## Test globals (Vitest / Playwright)

- Vitest provides globals via its tooling; root tests use `vitest/config` and `environment: "node"`.
- Playwright specs use `NodeJS.ProcessEnv` and `process.env` in config files — ensure those files are included in a project that still resolves **Node** types (typically `@types/node` at repo root).
- **Scope** explicit `types` to test/config projects when needed instead of widening the whole monorepo.

## Side-effect imports and assets

- `import "./globals.css"` and similar are **intentional** side effects.
- `noUncheckedSideEffectImports: true` (TS 6 default) requires that the module resolves and is typed; missing declarations for CSS/assets become errors.
- **Policy:** Shared default stays **`noUncheckedSideEffectImports: false`** until a dedicated pass verifies all side-effect import patterns; then flip per workspace or shared with CI proof.

## `rootDir` and `outDir`

- **High risk** to change for fun: affects emitted `.js` layout under `dist/`.
- Library packages already set **`outDir`** + **`rootDir: "."`** or **`./src`** intentionally; match the **actual** file layout.
- TS 6.0 **default `rootDir`** behavior change: if emit suddenly nests `dist/src/...`, you previously relied on inference — set explicit `rootDir` (official 6.0 announcement).

## What not to do in new code

- Do not add **`baseUrl`**.
- Do not use **`moduleResolution: "node"`** / **`node10`** for new projects.
- Do not use legacy **`import ... assert { type: "json" }`** (use current `with` / supported syntax per TS version when you upgrade).
- Do not enable **`stableTypeOrdering`** in shared CI or default configs.
- Do not add **`@typescript/native-preview`** or **`tsgo`** to default `package.json` scripts in this prep phase.

## What is allowed in new code

- **`paths`**-only aliases (no `baseUrl`).
- **Explicit** `compilerOptions` that document intent (`libReplacement`, `noUncheckedSideEffectImports`, `rootDir`, `types` per package).
- Optional **audit** script: `bun run tsconfig:future-audit` (non-blocking).

## Examples (this repo)

**Next app alias (no `baseUrl`):**

```json
{
  "extends": "@asym/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@payload-config": ["./payload.config.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.d.ts"]
}
```

**Shared base explicit 5.9-safe defaults (see live `tooling/typescript-config/base.json`):**

```json
{
  "compilerOptions": {
    "libReplacement": true,
    "noUncheckedSideEffectImports": false
  }
}
```

## Checklist: new app

- [ ] Extends `@asym/typescript-config/nextjs.json`.
- [ ] `paths` for `@/*`; **no** `baseUrl`.
- [ ] `include` covers `next-env.d.ts` and `.next/types/**/*.d.ts`.
- [ ] Run `bunx turbo run typecheck --filter=@asym/<app>`.

## Checklist: new package

- [ ] Extends `library.json` or `library-transitional.json` intentionally (declaration / composite needs vs transitional).
- [ ] If emitting `dist/`, set **`rootDir`** consistent with `include` and **verify** `tsc` output layout.
- [ ] No new `baseUrl`; prefer **package `exports`** for public API surface.

## Checklist: AI agents

- [ ] Read `docs/guides/typescript-6-readiness.md` and `docs/ai/rules/typescript-future-proofing.md` before tsconfig edits.
- [ ] Prefer **minimal** diffs; validate **all** workspaces that extend changed shared JSON.
- [ ] Do not bump `typescript` in `package.json` unless the task is explicitly an upgrade.
- [ ] After shared `base.json` change, run **`bun run typecheck`**.

## Deferred until TypeScript 6 upgrade

- Bumping **`typescript`** to 6.x and re-running full **`typecheck`** / **`lint`** / **`test:unit`**.
- Deciding whether to adopt TS 6 defaults (`noUncheckedSideEffectImports: true`, `libReplacement: false`, empty `types`) **per workspace** with fixes.
- Any **`ignoreDeprecations`** usage (avoid hiding issues in prep; evaluate at upgrade time).

## Deferred until later TS 7 validation

- Optional **`tsgo`** / **`@typescript/native-preview`** side-by-side runs (official guidance: compare errors vs `tsc`).
- Broader **JSX / generic inference** changes from TS 6 (may need explicit type arguments — see 6.0 announcement).
- Language service / **LSP** behavior differences when using native preview in editors.

## Internal doc mismatches (recorded)

- `docs/ai/rules/general.md` may still mention an older TypeScript minor; **live** `package.json` devDependency is authoritative (currently **5.9.3**).
- Default Git branch in automation may be **`epic`** while `general.md` discusses **`main`** as protected; follow **remote default** for branch operations.

## Audit matrix (snapshot)

| Workspace / file | Pattern | TS6/TS7 risk | Level | Prep action |
|----------------|---------|----------------|-------|-------------|
| `tooling/typescript-config/base.json` | Explicit strict, bundler, ES2022 | Default shifts for `libReplacement`, `noUncheckedSideEffectImports`, `types`, `rootDir` | Medium | **Done:** explicit `libReplacement` + `noUncheckedSideEffectImports` |
| `tooling/typescript-config/nextjs.json` | `noEmit`, bundler | Same as base for omitted options | Medium | Inherits base |
| `apps/{admin,donor,missionary}/tsconfig.json` | `paths` for `@/*` | `baseUrl` removal in TS7 | Medium | **Done:** removed `baseUrl`; kept `paths` |
| `packages/{ui,missionary}/tsconfig.json` | `paths`, `outDir`, `rootDir` | `baseUrl` removal; emit root | Medium | **Done:** removed `baseUrl` |
| `packages/*/tsconfig` (transitional) | `library-transitional.json` | `types` default `[]` on upgrade | Low–Med | Defer; audit per package on upgrade |
| `packages/email` | `library.json` + `rootDir: ./src` | Emit layout | Low | Defer unless changing structure |
| Root `vitest.config.ts` | `alias "@": ./src` | Not tsc | Low | None |
| Playwright configs | `process.env` | Node globals if `types` empty | Med | Defer explicit `types` until upgrade |
| App layouts | CSS side-effect imports | `noUncheckedSideEffectImports` | Med | Deferred; flag stays false in base until audited |

---

**Sources used for this document:** [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/), [Progress on TypeScript 7 - December 2025](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/), [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig) (`baseUrl`, `paths`, `moduleResolution`, `rootDir`, `types`, `noUncheckedSideEffectImports`).

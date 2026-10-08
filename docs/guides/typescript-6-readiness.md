# TypeScript 6 / 7 configuration and tooling

All 15 compiled application and shared-package workspaces use the stable native
TypeScript 7 compiler. Exact versions belong to their manifests and `bun.lock`.
The repository root intentionally retains the full TypeScript 6 JavaScript
compiler package for API consumers and editor plugins. Changing the root package
alone does not select the compiler used by a workspace.

## Compiler and API ownership

| Context                                    | Dependency                                 | Purpose                                                                     |
| ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------- |
| Apps and packages with `typecheck`         | Local `typescript@7.0.2`                   | Native `tsc` for workspace checks/builds; Next selects this CLI in each app |
| Root fixture/compiler commands             | `@typescript/native: npm:typescript@7.0.2` | Explicit native CLI, including `test:e2e:base-ui`                           |
| Root AST scripts and ESLint                | Root `typescript@6.0.3`                    | Supported JavaScript compiler API for existing tooling                      |
| Legacy editor/Next language-service plugin | Root `node_modules/typescript/lib`         | Full TypeScript 6 editor SDK, including `tsserver.js`                       |

TypeScript 7's package root does not expose the legacy JavaScript compiler API.
The current typescript-eslint peer range also excludes TypeScript 7. Keep the
root API context supported; do not suppress version warnings or override peer
ranges. Native compiler completion does not mean ESLint uses the native API.

Next 16.4 selects each application's local CLI by default. Keep
`experimental.useTypeScriptCli` enabled (its default) and never enable
`typescript.ignoreBuildErrors` to accommodate this migration. Native TypeScript
7 cannot load the legacy Next language-service plugin. For that plugin, open the
repository root and select the TypeScript 6 workspace SDK; an editor configured
for native TypeScript 7 has a separate plugin capability boundary.

The official `@typescript/typescript6` compatibility package can supply the
legacy API, but its shim does not include `lib/tsserver.js`. Retaining the full
root TypeScript 6 package supports the existing editor SDK without another
alias or SDK path convention.

When updating compiler dependencies, verify actual installed workspace CLI,
Next CLI and ESLint API resolution, then run `bun run typecheck`, `bun run lint`
and `bun run test:unit`. Run `bun run verify:workspace-contract` and
`bun run verify:cms-public-sole-entry` to exercise existing AST tooling. The Base
UI fixture explicitly dispatches `node node_modules/@typescript/native/lib/tsc.js`.

## Compiler transition context

Microsoft positions **TypeScript 6.0** as a **bridge** release (last Strada/JavaScript compiler line) before **TypeScript 7.0** (native compiler). Official posts:

- [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [Progress on TypeScript 7 - December 2025](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

  6.0 changes **defaults** and **deprecates** options that 7.0 will remove. Explicit configuration preserves the existing behavior while compiler and API contexts migrate independently.

## What changed in TypeScript 6.0 that matters here

From the official 6.0 announcement (non-exhaustive; see the post for the full list):

| Area                               | TypeScript 6.0 direction                                                                                                                                                                               | Why it matters in this monorepo                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Defaults**                       | `strict`, `module`, `target`, `noUncheckedSideEffectImports`, `libReplacement`, `rootDir`, `types`                                                                                                     | We already set many flags explicitly in `tooling/typescript-config/base.json`. 6.0 defaults can still affect **omitted** options.                  |
| **`baseUrl`**                      | Deprecated; **removed in TS 7** (per TS 7 progress post / breaking-change tracking)                                                                                                                    | We removed redundant `baseUrl` where only `paths` was needed; do not reintroduce `baseUrl` in new code.                                            |
| **`moduleResolution: node10`**     | Deprecated; removed in TS 7 in favor of **bundler** and **nodenext**                                                                                                                                   | This repo’s Next apps and shared base already use **bundler**; avoid `node`/`node10`.                                                              |
| **`rootDir`**                      | Default becomes the directory containing `tsconfig.json`; emit layout can change if you relied on inference                                                                                            | Packages with `outDir` + deep `include` should keep **explicit** `rootDir` where emit layout matters.                                              |
| **`types`**                        | Default becomes `[]` instead of “all `@types`”                                                                                                                                                         | Config/scripts that relied on ambient `@types` without imports may need explicit `"types": ["node"]` (or test runner types) per workspace.         |
| **`noUncheckedSideEffectImports`** | Default becomes `true` in 6.0                                                                                                                                                                          | Layouts use `import "./globals.css"` and similar; enabling globally requires verified module declarations. **Deferred** for default shared config. |
| **Import attributes**              | Legacy `import ... assert { }` deprecated; use ECMAScript **`import ... with { type: "json" }`** (and the matching dynamic `import()` form) when you need attributes — see TypeScript 6.0 announcement | Repo audit: no `assert {` usage found; do not add legacy assertion syntax.                                                                         |
| **`stableTypeOrdering`**           | New flag to align ordering with TS 7 for **comparison**                                                                                                                                                | **Do not** enable in normal shared configs; optional diagnostic only (slows checks ~up to 25% per official note).                                  |

## What TypeScript 7 means here (plain language)

- **Stable compiler:** TypeScript 7 is published in the ordinary `typescript` package. `@typescript/native-preview` is the older preview channel and is not the stable migration target.
- **Breaking removals:** TS 7 drops deprecated TS 6 behaviors (e.g. **`baseUrl`**, **`node10` resolution**, stricter **`rootDir`/`outDir` expectations** per official roadmap summaries).
- **Compatibility:** TypeScript 7 does not expose the legacy JavaScript compiler API. Repository AST scripts, typescript-eslint and the Next language-service plugin still need a supported TypeScript 6 API context. The ownership table above records this repository's installed split; verify actual compiler and parser resolution after installation.

## Module resolution: how to choose (this repo)

- **`moduleResolution: "bundler"`** with **`module: "ESNext"`** (or Next’s `esnext`): **Next.js apps**, packages consumed only through **Vite/Next/Bun bundlers**, and shared `base.json` defaults. Matches current `tooling/typescript-config/base.json` and `nextjs.json`.
- **`moduleResolution: "nodenext"`** / **`module: "nodenext"`**: Prefer when the **primary** artifact is **Node-run `.js`** with **package.json `exports`**, and you want resolution to match Node. Do not switch apps away from bundler “just because.”
- **Never** target **`node10`** (`"node"`) for new work; it is on the removal path for TS 7.

## `baseUrl` and `paths`

- Official [TSConfig `paths`](https://www.typescriptlang.org/tsconfig#paths): **`paths` can be used without `baseUrl`.** Patterns are resolved relative to the tsconfig file.
- **House rule:** Do **not** add **`baseUrl`** in new configs. Use **`paths`** only (as in `apps/*/tsconfig.json` for `@/*`).
- **Legacy:** If you see bare imports that only worked via `baseUrl` (non-`paths` rewriting), document and fix deliberately; do not guess.

## Source aliases

- **Next apps:** `@/*` → `./*` in each app’s `tsconfig.json` (example: `apps/admin/tsconfig.json`).
- **Packages (`@asym/ui`, `@asym/missionary`):** same pattern for editor/tsc resolution; bundlers must still resolve aliases (Next/Vite config). **Package `exports`** remain the runtime public API — tsconfig aliases are for **typechecking and DX**, not a substitute for `exports`.
- **Vitest:** root `vitest.config.ts` uses the per-importer alias plugin to resolve `@/` against each workspace's tsconfig; keep test aliases aligned with the importing workspace.

## `types` array

- TypeScript 6.0 default **`types: []`** means globals from random `@types` packages may no longer appear unless listed.
- **Do not** push a one-size `types` array from shared base unless **every** extending workspace is verified (apps, packages, scripts).
- **Prefer:** local `tsconfig` for **Node scripts**, **Vitest**, or **Playwright** configs if they need `node` or test globals explicitly.
- If you see “Cannot find name `process` / `describe` / …” after an upgrade, add the minimal `types` entry for that project (official 6.0 announcement examples).

### Bun + TypeScript 6 / 7 ([Bun docs: TypeScript 6 and 7](https://bun.com/docs/typescript-6))

Bun’s documentation matches the TypeScript 6.0 story: with **`types` defaulting to `[]`**, you must **explicitly** include packages whose globals you need, and you still need **`@types/bun` installed** (`bun add -d @types/bun`).

**How this fits this monorepo (Bun package manager + Next.js apps):**

| Situation                                                                        | What to do                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Workspaces still using TypeScript 5.9**                                        | Do **not** set `compilerOptions.types` to `["bun"]` only on Next app tsconfigs. TypeScript 5.9 still auto-includes `@types/*`; a narrow `types` array **drops** `node`, `react`, etc. and will break typechecking.                                                                                                               |
| **After upgrading to TypeScript 6+**                                             | Where TypeScript should see **`Bun`**, add **`@types/bun`** and list it in **`types`** alongside other globals that project needs (Bun’s doc shows `"types": ["bun", "react"]`; Next apps typically need **`node`** at minimum—combine per workspace, e.g. `"types": ["node", "bun"]` only after verifying nothing else breaks). |
| **`paths` / `@/*` (e.g. `apps/missionary/tsconfig.json`)**                       | Path aliases are **unrelated** to Bun globals. Keep **`paths`** as-is; add Bun **`types`** only when you actually reference **`Bun`** in that project’s TypeScript and you are on TS 6+ empty-default behavior.                                                                                                                  |
| **Root `scripts/*.ts` using `Bun.*`** (e.g. `scripts/shadcn/add-shadcnuikit.ts`) | On TS 6+, either: add a **small `tsconfig`** scoped to those scripts with `"types": ["bun", "node"]`, or ensure the root/workspace project that includes them lists both. Install **`@types/bun`** at the root when you add that.                                                                                                |

Bun’s sample tsconfig (ESNext, `module: "Preserve"`, etc.) targets **Bun-first apps**. This repo’s **Next.js** workspaces should **keep** extending `@asym/typescript-config/nextjs.json`; only adopt the **`types: ["bun"]`** (and peers) part of Bun’s guide when TS 6+ and when that workspace needs Bun globals.

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
- Do not use legacy **`import ... assert { }`**; prefer **`import ... with { }`** (import attributes) per current ECMAScript / TypeScript guidance when you upgrade or add new attribute imports.
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

## Configuration preparation before compiler convergence

- Re-run full **`typecheck`** / **`lint`** / **`test:unit`** whenever workspace compiler dependencies change; do not infer a common version from the root manifest.
- `config`, `missionary`, `ui` and `email` explicitly include **`types: ["node"]`** because their source or imported source references Node globals such as `process`. Their previous implicit ambient inclusion fails with TypeScript 6 and 7's empty default. Keep this per-project rather than imposing a shared global list.
- Deciding whether to adopt TS 6 defaults (`noUncheckedSideEffectImports: true`, `libReplacement: false`, empty `types`) **per workspace** with fixes.
- Any **`ignoreDeprecations`** usage (avoid hiding issues in prep; evaluate at upgrade time).

## Native migration validation

- Compare the stable native **`typescript`** compiler with the current compiler, using the separate root API context for legacy tools.
- Broader **JSX / generic inference** changes from TS 6 (may need explicit type arguments — see 6.0 announcement).
- Retain a TypeScript 6 editor option for plugins that require the legacy language-service API. Native CLI completion does not establish plugin compatibility.

## Audit matrix (snapshot)

| Workspace / file                              | Pattern                          | TS6/TS7 risk                                                                            | Level   | Prep action                                                                                          |
| --------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `tooling/typescript-config/base.json`         | Explicit strict, bundler, ES2022 | Default shifts for `libReplacement`, `noUncheckedSideEffectImports`, `types`, `rootDir` | Medium  | **Done:** explicit `libReplacement` + `noUncheckedSideEffectImports`                                 |
| `tooling/typescript-config/nextjs.json`       | `noEmit`, bundler                | Same as base for omitted options                                                        | Medium  | Inherits base                                                                                        |
| `apps/{admin,donor,missionary}/tsconfig.json` | `paths` for `@/*`                | `baseUrl` removal in TS7                                                                | Medium  | **Done:** removed `baseUrl`; kept `paths`                                                            |
| `packages/{ui,missionary}/tsconfig.json`      | `paths`, `outDir`, `rootDir`     | `baseUrl` removal; emit root                                                            | Medium  | **Done:** removed `baseUrl`                                                                          |
| `packages/*/tsconfig` (transitional)          | `library-transitional.json`      | `types` default `[]` on upgrade                                                         | Low–Med | Verified under native compiler; add globals locally when needed                                      |
| `packages/email`                              | `library.json` + `rootDir: .`    | Emit layout                                                                             | Low     | Preserve explicit root; include Node globals locally                                                 |
| Root `vitest.config.ts`                       | Per-importer workspace aliases   | Not tsc                                                                                 | Low     | None                                                                                                 |
| Playwright configs                            | `process.env`                    | Node globals if `types` empty                                                           | Med     | Fixtures/apps include Node globals explicitly                                                        |
| App layouts                                   | CSS side-effect imports          | `noUncheckedSideEffectImports`                                                          | Med     | Deferred; flag stays false in base until audited                                                     |
| Root scripts using `Bun.*`                    | `Bun` global                     | TS6 `types: []`; need `@types/bun` + `types`                                            | Med     | On TS6+: `bun add -d @types/bun` + scoped `types` ([Bun TS6 doc](https://bun.com/docs/typescript-6)) |

---

**Sources used for this document:** [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [Next TypeScript configuration](https://nextjs.org/docs/app/api-reference/config/typescript), [typescript-eslint dependency support](https://typescript-eslint.io/users/dependency-versions/), [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/), [Progress on TypeScript 7 - December 2025](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/), [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig) (`baseUrl`, `paths`, `moduleResolution`, `rootDir`, `types`, `noUncheckedSideEffectImports`).

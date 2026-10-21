# TypeScript compiler, API and configuration guide

All 15 compiled application/shared-package workspaces use stable native
TypeScript 7. The root retains the supported full TypeScript 6 JavaScript API
for AST scripts, typescript-eslint and the legacy editor SDK. This document's
existing path is retained for links; compiler preparation is complete.

## Ownership and installed resolution

| Context                                     | Dependency owner                                                   | Required behavior                                                   |
| ------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Application and shared-package typechecks   | Each workspace's pinned `typescript`                               | Native TypeScript 7; all product versions agree                     |
| Root compiler fixtures                      | Root `@typescript/native` alias to the stable `typescript` package | Root `tsc` and explicit Base UI fixture use the same native release |
| AST/JSONC scripts and ESLint parser         | Root pinned full `typescript` package                              | Supported TypeScript 6 JavaScript API                               |
| Legacy Next/editor language-service plugins | Root full `node_modules/typescript/lib` SDK                        | Existing `tsserver.js` remains available                            |

Exact tested versions belong to manifests and `bun.lock`. The
[toolchain verifier](../../scripts/verify/typescript-toolchain.mjs) checks
installed identities, the root command, all workspace compiler declarations,
the parser's physical API resolution and the editor SDK. It runs inside
`verify:workspace-contract` and therefore normal preflight and CI.
[Compatibility tests](../../tests/unit/scripts/typescript-toolchain.test.ts)
exercise JSONC aliases, TSX parsing and a real native compilation that accepts a
valid contract and rejects an invalid one.

The [TypeScript 7 release](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
provides the stable native compiler. Its package does not expose the legacy
JavaScript compiler API. Current
[typescript-eslint support](https://typescript-eslint.io/users/dependency-versions/)
includes ESLint 10 and TypeScript below 6.1. Keep the API dependency supported;
do not override its peer contract or disable version warnings.

Next uses each app's native CLI for build checking. Keep its CLI integration
enabled and `typescript.ignoreBuildErrors` disabled. Plugins requiring the
legacy language-service API use the root TypeScript 6 workspace SDK; native
editor/CLI support does not prove compatibility with those plugins. The
`@typescript/typescript6` compatibility shim lacks the full editor SDK, so the
root currently owns the full supported package. Recheck this boundary when
upstream parser or editor APIs change.

## Configuration policy

The live presets under `tooling/typescript-config/` are authoritative.

- Next and bundled workspaces use `moduleResolution: "bundler"`. Node-first
  emitted packages may use NodeNext when that matches their runtime and exports.
  Do not introduce removed `node10`/`node` resolution or `baseUrl`.
- Keep `paths` relative to their tsconfig. Apps, UI and missionary packages map
  `@/*` to their own directory; aliases do not replace public package exports.
- The shared base explicitly keeps `libReplacement: true` and
  `noUncheckedSideEffectImports: false`. CSS and other intentional side-effect
  imports require an audited declaration/import pass before tightening that flag.
- Declare ambient globals per project. Config, missionary, UI and email already
  include Node types. Test/config files need their appropriate Node/test types.
  Projects referencing `Bun` additionally need `@types/bun` and scoped Bun types;
  do not drop Node/React globals with a Bun-only array in a Next workspace.
- Preserve explicit `rootDir` and `outDir` wherever emit layout matters. Check
  resulting files when changing them; do not infer layout from compiler defaults.
- Keep strictness and build errors enabled. Do not blanket-ignore deprecations.
  Use import attributes (`with`) for new attribute imports, not legacy `assert`.
- Keep `stableTypeOrdering` out of normal configurations. Do not introduce native
  preview packages or `tsgo` as the stable compiler entrypoint.

## Tests and aliases

`vitest.config.mts` loads its ESM helpers directly. Per-importer aliases follow
each workspace's tsconfig, while workspace imports stay anchored to this checkout.
The two old `.ts` helper entrypoints only preserve imports used by frozen
historical donor-development source probes; active configuration uses `.mts`.
Node 24 can import the active configuration without bundling or module-type
warnings. Its include list and test scope are unchanged.

Playwright remains configured separately. Scope test globals to their projects;
Vitest's runtime transformation does not replace product compiler checking.
The Base UI browser fixture explicitly dispatches the stable native alias.

## Change verification

For a new app, extend the existing Next preset, retain `@/*` paths and generated
Next type includes, declare the same native compiler, and run the app typecheck
and build. For a new package, choose the existing library preset deliberately,
keep public exports explicit, and validate emitted layout if it builds output.

After shared preset/compiler changes run:

```bash
bun run verify:typescript-toolchain
bun run verify:workspace-contract
bun run verify:cms-public-sole-entry
bun run typecheck
bun run lint
bun run test:unit
bun run build
```

Use focused checks while iterating. The optional `tsconfig:future-audit` script
is an inventory aid and does not establish release qualification.

Official references: [Next TypeScript configuration](https://nextjs.org/docs/app/api-reference/config/typescript),
[TSConfig reference](https://www.typescriptlang.org/tsconfig),
[Bun TypeScript guidance](https://bun.com/docs/typescript-6).

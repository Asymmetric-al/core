# TypeScript compiler and configuration rules

**Name:** `typescript-future-proofing`  
**Purpose:** Maintain TypeScript 7 product compilation and the supported TypeScript 6 JavaScript API used by AST, ESLint and editor tooling.
**Applies when:** Editing compiler dependencies, `tsconfig*.json`, shared presets, aliases, test configuration or tooling that imports `typescript`.

The [current compiler guide](../../guides/typescript-6-readiness.md) owns the
installed boundary and configuration details. Its existing path remains stable;
TypeScript 7 is already in use.

## Workflow

1. Read the guide and the affected workspace's actual manifest/configuration.
2. Run `bun run verify:typescript-toolchain` after installation or compiler changes.
   Product workspaces and the root command must resolve the pinned native
   compiler. AST scripts, typescript-eslint and the legacy editor SDK must
   resolve the supported full JavaScript API. Do not suppress unsupported-version
   warnings, force peer ranges or infer workspace resolution from the root alone.
3. Keep existing explicit configuration intentional: `libReplacement: true` and
   `noUncheckedSideEffectImports: false` preserve current library and CSS behavior.
   A stricter side-effect-import setting requires an asset/import audit first.
4. Do not add `baseUrl` or `node10` resolution. Keep `paths` relative to the
   tsconfig location. Use bundler resolution for Next/bundled workspaces and
   NodeNext for Node-first emitted artifacts when their runtime requires it.
5. Scope Node, React, test and Bun globals to their actual projects. Install
   `@types/bun` where Bun globals are needed; a Bun-only `types` array must not
   remove other required globals from Next workspaces.
6. Preserve explicit emit roots and verify output layout when changing
   `rootDir`/`outDir`. Keep package exports as public runtime boundaries.
7. After shared configuration or compiler changes, run full typecheck, lint and
   unit tests, plus workspace/AST verification and the affected real builds.

## Guardrails

- Keep strictness and Next build errors enabled.
- Use ECMAScript import attributes (`with`), not legacy import assertions.
- Keep `stableTypeOrdering` out of normal/default configurations; it is a
  comparison diagnostic for the JavaScript compiler.
- Do not introduce preview compiler packages or `tsgo` as the stable product CLI.
- Do not use blanket `ignoreDeprecations` to conceal configuration problems.
- Change compiler versions only within an explicitly authorized upgrade.

## Verification

The toolchain verifier is part of `verify:workspace-contract`, so existing local
preflight and CI enforce it. Compatibility tests exercise JSONC/TSX parsing with
both API consumers and the actual native compiler's rejection of invalid types.
The guide links current official upstream documentation and the owned checks.

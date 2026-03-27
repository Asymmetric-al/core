# TypeScript future-proofing — Rules

**Name:** `typescript-future-proofing`  
**Purpose:** Keep TypeScript configuration and patterns aligned with official TypeScript 6.0 / 7.0 direction without doing ad-hoc “modernization” that breaks builds.  
**Applies when:** Editing `tsconfig*.json`, shared `@asym/typescript-config`, or adding path aliases, test globals, or side-effect-only imports.  
**Do not use when:** Performing the actual TypeScript version upgrade (that is a separate, tracked effort).

**Canonical long-form guide:** `docs/guides/typescript-6-readiness.md`

## Triggers

- Adding or changing `compilerOptions` in any workspace.
- Introducing `@/*` or other `paths` mappings.
- Tightening module resolution, `types`, or import checking.
- Adding Vitest/Playwright/config files that rely on Node or test globals.

## Workflow steps

1. Read `docs/guides/typescript-6-readiness.md` for current repo policy and deferred work.
2. Prefer **explicit** compiler options when they **freeze TypeScript 5.9 behavior** that TypeScript 6.0 changes by default (see shared `tooling/typescript-config/base.json` and the guide).
3. Do **not** add new `baseUrl` entries; use `paths` only (official TSConfig: `paths` does not require `baseUrl`).
4. Do **not** enable `noUncheckedSideEffectImports` in shared defaults until CSS/asset/side-effect imports are audited project-wide.
5. Do **not** enable `stableTypeOrdering` in normal configs; it is optional for 6↔7 comparison only (official TypeScript 6.0 announcement).
6. After shared config edits, run `bun run typecheck` (or scoped `turbo` typecheck for affected packages).

## Checklist

- [ ] Change is documented in the guide if it establishes a new pattern.
- [ ] No TypeScript version bump in `package.json` unless the task is explicitly an upgrade.
- [ ] No new `baseUrl`; `paths` use relative patterns from the tsconfig location.
- [ ] No repo-wide `types` array in shared base unless every consumer is verified.
- [ ] Side-effect and CSS imports considered before stricter import checks.
- [ ] Validation run recorded for any non-doc change affecting `tsconfig`.

## Common mistakes

- Removing `paths` when removing `baseUrl` (keep `paths`; they work without `baseUrl`).
- Assuming `moduleResolution: "bundler"` should be switched to `nodenext` “because newer” (choose per runtime: bundler for Next/Bun-bundled apps; NodeNext for Node-first emit).
- Enabling TypeScript 6.0 defaults globally without fixing `types`, `rootDir`, and side-effect imports first.
- Using legacy **`import ... assert { }`** instead of **`import ... with { }`** (import attributes) for new code.
- On **TypeScript 6+**, following [Bun’s TypeScript 6 / 7 doc](https://bun.com/docs/typescript-6): add **`@types/bun`** and **`types`** entries where **`Bun`** is referenced—**never** `types: ["bun"]` alone on Next workspaces until **`node`** (and any other required globals) are accounted for.

## Related

- `docs/guides/typescript-6-readiness.md` — audit matrix, examples, checklists.
- `tooling/typescript-config/` — shared presets.
- Official: [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/), [Progress on TypeScript 7 - December 2025](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/), [TSConfig Reference](https://www.typescriptlang.org/tsconfig).
- Bun: [TypeScript 6 and 7](https://bun.com/docs/typescript-6) (`types` + `@types/bun`).

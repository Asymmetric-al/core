# Tailwind + shadcn Modernization Implementation - 2026-05-30

## Summary

Implemented the conservative modernization path from `docs/ai/audits/tailwind-shadcn-modernization-2026-05-29.md`: dependency refresh plus repo guidance updates only.

No product UI, shadcn component source, shared/app CSS, theme tokens, `components.json`, MCP config, package exports, or PostCSS architecture were changed.

## Package Versions

| Package                   | Before                        | After                                                                                                  |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `tailwindcss`             | `4.2.2`                       | `4.3.0`                                                                                                |
| `@tailwindcss/postcss`    | `4.2.2`                       | `4.3.0`                                                                                                |
| `@tailwindcss/node`       | `4.2.2`                       | `4.3.0`                                                                                                |
| `@tailwindcss/oxide`      | `4.2.2`                       | `4.3.0`                                                                                                |
| `@tailwindcss/typography` | `0.5.19`                      | `0.5.19`                                                                                               |
| `tw-animate-css`          | `1.4.0`                       | `1.4.0`                                                                                                |
| `tailwind-merge`          | `3.5.0` locked for `@asym/ui` | `3.6.0` for `@asym/ui` and `@asym/lib`; an older transitive lock entry remains for unchanged consumers |

Manifest changes:

- `package.json`: `@tailwindcss/postcss` and `tailwindcss` now use `^4.3.0`.
- `packages/ui/package.json`: `tailwind-merge` now uses `^3.6.0`.
- No `@tailwindcss/vite` or `shadcn` dependency was added.

## shadcn Metadata

- `bunx --bun shadcn@latest --version`: `4.8.3`.
- `bunx --bun shadcn@latest info --json` hit a Windows Bun cache error (`EBUSY`/`ENOENT`), so the read-only command was retried with `npx --yes shadcn@latest info --json`.
- `bunx --bun shadcn@latest preset resolve --json` hit the same cache issue, so the read-only command was retried with `npx --yes shadcn@latest preset resolve --json`.
- Resolved project config remains `style: base-maia`, `base: base`, `iconLibrary: lucide`, `tailwindVersion: v4`, `tailwindConfig: null`, `tailwindCss: styles/globals.css`.
- Resolved preset code remains `bc5ed0K` with `style: maia`, `baseColor: zinc`, `theme: neutral`, `font: figtree`, and `radius: default`.

## Files Changed

- `package.json`
- `bun.lock`
- `packages/ui/package.json`
- `docs/ai/rules/frontend.md`
- `docs/ai/audits/shadcn-ui-audit-2026-04-21.md`
- `docs/ai/audits/shadcn-ui-quick-fix-checklist.md`
- `.agents/skills/shadcn/**`
- `.cursor/skills/shadcn/**`
- `.agents/skills/tailwind-v4-shadcn/**`
- `.cursor/skills/tailwind-v4-shadcn/**`
- `docs/ai/audits/tailwind-shadcn-modernization-implementation-2026-05-30.md`

## Guidance Updates

- Documented that Bun is the default runner and `shadcn@latest` must stay unpinned.
- Added shadcn workflow requirements: run `info --json` before changes, `docs` before component composition, and `add --diff` or `--dry-run` before component updates.
- Documented that `shadcn apply`, `add --overwrite`, and `add --all` require explicit human approval.
- Corrected Tailwind v4 guidance for this repo: Next apps stay on `@tailwindcss/postcss`; `@tailwindcss/vite` is Vite-only.
- Reaffirmed that `components.json` keeps `tailwind.config: ""`, theme primitives live in `packages/ui/styles/globals.css`, app globals must not duplicate primitives, and repo tokens use OKLCH directly.
- Marked older shadcn audit/checklist notes as historical so their point-in-time CLI versions and npx preference are not treated as current.

## Safe UI or CSS Improvements

None. The audit found no safe first-PR product UI, shadcn component, shared CSS, app CSS, scrollbar utility, or `@source not` change.

## Intentionally Skipped

- shadcn component source updates.
- `components.json` edits.
- Shared/app CSS edits.
- Theme color, font, radius, chart, sidebar, dark mode, and motion token changes.
- Tailwind v4.3 CSS feature adoption.
- `@tailwindcss/vite` migration for Next apps.
- `tailwind.config.ts`.
- MCP config changes.

## Validation

| Command                                                                                                    | Result                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile`                                                                            | Pass                                                                                                                                                                                                                                                     |
| `bun run format:check`                                                                                     | Failed first on this implementation note; fixed with `bunx prettier docs/ai/audits/tailwind-shadcn-modernization-implementation-2026-05-30.md --write`, then passed. A later rerun failed on unrelated dirty mission-control files outside this PR scope |
| `bun run lint`                                                                                             | Pass                                                                                                                                                                                                                                                     |
| `bun run typecheck`                                                                                        | Pass                                                                                                                                                                                                                                                     |
| `bun run test:unit`                                                                                        | Failed with 3 unrelated script-environment test failures                                                                                                                                                                                                 |
| `bun run build`                                                                                            | Pass                                                                                                                                                                                                                                                     |
| `bun run verify:shadcn-diff`                                                                               | Pass                                                                                                                                                                                                                                                     |
| `bun pm ls tailwindcss @tailwindcss/postcss @tailwindcss/typography tw-animate-css tailwind-merge postcss` | Pass; top-level tree shows `tailwindcss@4.3.0`, `@tailwindcss/postcss@4.3.0`, `@tailwindcss/typography@0.5.19`, `tw-animate-css@1.4.0`                                                                                                                   |
| `bun pm ls @tailwindcss/node @tailwindcss/oxide`                                                           | Pass; Bun prints the top-level tree, while `bun.lock` confirms both transitive packages at `4.3.0`                                                                                                                                                       |
| `cd packages/ui && bunx --bun shadcn@latest --version`                                                     | Pass: `4.8.3`                                                                                                                                                                                                                                            |
| `cd packages/ui && bunx --bun shadcn@latest info --json`                                                   | Bun cache failure (`EBUSY`/`ENOENT`); read-only fallback `npx --yes shadcn@latest info --json` passed                                                                                                                                                    |
| `cd packages/ui && bunx --bun shadcn@latest preset resolve --json`                                         | Bun cache failure (`EBUSY`); read-only fallback `npx --yes shadcn@latest preset resolve --json` passed                                                                                                                                                   |
| `bun run verify:shadcn-config`                                                                             | Pass                                                                                                                                                                                                                                                     |
| `bun run verify:shadcn-registries`                                                                         | Pass for `@shadcn/button`; skipped private registries because local env lacks their registry credentials                                                                                                                                                 |
| `bun run verify:shadcn-token-drift`                                                                        | Pass, report-only; existing raw palette hits remain outside this PR                                                                                                                                                                                      |

Unit test failures from `bun run test:unit`:

- `tests/unit/scripts/bun-version.test.ts`: expected `bun@1.3.14` from `packageManager`, but this shell has Bun `1.3.5`.
- `tests/unit/scripts/bun-version.test.ts`: Windows shell path lookup used `which`, which returned no stdout in this environment.
- `tests/unit/scripts/ci-build.test.ts`: Windows Turbo binary candidate assertion expected a `.cmd` path but resolved otherwise.

Final `format:check` rerun after this note update failed on unrelated dirty files:

- `packages/api/src/admin/mission-control-automations/store.ts`
- `tests/unit/packages/api/admin/mission-control-automations.test.ts`

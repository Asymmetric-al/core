# Tailwind + shadcn Modernization Final Hardening - 2026-05-30

## Summary

This pass hardened the conservative Tailwind CSS and shadcn modernization PR by keeping the package refresh, tightening repo guidance, and removing risky or contradictory guidance from mirrored skills.

No product UI, shadcn component source, shared/app CSS, theme tokens, `components.json`, MCP config, package exports, or PostCSS architecture changed.

## Final Package Versions

| Package                   | Final version                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `tailwindcss`             | `4.3.0`                                                                                                         |
| `@tailwindcss/postcss`    | `4.3.0`                                                                                                         |
| `@tailwindcss/node`       | `4.3.0`                                                                                                         |
| `@tailwindcss/oxide`      | `4.3.0`                                                                                                         |
| `@tailwindcss/typography` | `0.5.19`                                                                                                        |
| `tw-animate-css`          | `1.4.0`                                                                                                         |
| `tailwind-merge`          | `3.6.0` for `@asym/ui` and `@asym/lib`; an older unchanged transitive lock entry remains for existing consumers |

Manifest changes remain limited to:

- `package.json`: `@tailwindcss/postcss` and `tailwindcss` use `^4.3.0`.
- `packages/ui/package.json`: `tailwind-merge` uses `^3.6.0`.
- `bun.lock`: lock movement for Tailwind 4.3.0 and `tailwind-merge` 3.6.0.

No `@tailwindcss/vite` or `shadcn` dependency was added.

## shadcn CLI and Config

- `bunx --bun shadcn@latest --version`: `4.8.3`.
- `bunx --bun shadcn@latest info --json`: failed with the known Windows Bun cache `EBUSY` / `ENOENT` issue; read-only fallback `npx --yes shadcn@latest info --json` passed.
- `bunx --bun shadcn@latest preset resolve --json`: failed with the same Bun cache issue; read-only fallback `npx --yes shadcn@latest preset resolve --json` passed.
- Resolved config remains `style: base-maia`, `base: base`, `iconLibrary: lucide`, `tailwindVersion: v4`, `tailwindConfig: null`, `tailwindCss: styles/globals.css`.
- Resolved preset remains `bc5ed0K` with `style: maia`, `baseColor: zinc`, `theme: neutral`, `chartColor: neutral`, `font: figtree`, `radius: default`.

## Final Files Changed

- `package.json`
- `bun.lock`
- `packages/ui/package.json`
- `docs/ai/rules/frontend.md`
- `docs/ai/audits/shadcn-ui-audit-2026-04-21.md`
- `docs/ai/audits/shadcn-ui-quick-fix-checklist.md`
- `docs/ai/audits/tailwind-shadcn-modernization-implementation-2026-05-30.md`
- `docs/ai/audits/tailwind-shadcn-modernization-final-2026-05-30.md`
- `.agents/skills/shadcn/**`
- `.cursor/skills/shadcn/**`
- `.agents/skills/tailwind-v4-shadcn/**`
- `.cursor/skills/tailwind-v4-shadcn/**`

Unrelated Mission Control automation files, local working-set scratch, and unrelated untracked app tests are dirty in the worktree and are intentionally excluded from this PR summary.

## What Improved

- Tailwind ecosystem packages were refreshed within current major versions.
- Repo rules now state that Next apps stay on `@tailwindcss/postcss`, not `@tailwindcss/vite`.
- Mirrored Tailwind/shadcn skills now keep Bun-first usage, `shadcn@latest`, `info --json`, `docs`, `add --diff` / `--dry-run`, and no `apply`, `--overwrite`, or `--all` without explicit human approval.
- Vite-only snippets are labeled as Vite-only and not applicable to the repo's Next apps.
- Repo-applicable guidance now preserves OKLCH tokens in `packages/ui/styles/globals.css` instead of recommending HSL wrapper rewrites.
- Older shadcn audit/checklist notes are marked historical so their point-in-time CLI versions and npx preference are not mistaken for current policy.

## Intentionally Not Touched

- No shadcn component overwrite.
- No full shadcn apply.
- No Tailwind config migration and no `tailwind.config.ts`.
- No Next app migration from `@tailwindcss/postcss` to `@tailwindcss/vite`.
- No design token, font, radius, chart token, sidebar token, dark mode, or motion token rewrite.
- No product UI, shared/app CSS, component API, `@asym/ui` import path, package export, MCP config, or `components.json` change.
- No Tailwind v4.3 UI feature adoption in this PR.

## Local shadcn Forks That Remain

The dry-run shadcn diffs intentionally remain unapplied. They confirm local behavior that should not be overwritten in this conservative PR:

- `button`: local Maia variants, `asChild`, `press-feedback`, `hover-scale-subtle`, and import-path behavior remain.
- `chart`: local Recharts behavior and shared utility import behavior remain.
- `sidebar`: upstream would touch shared primitives such as `button`, `input`, `separator`, `skeleton`, and `tooltip`; local behavior remains.
- `dialog`, `field`, and `input-group`: upstream Base UI/style changes are manual-merge-only, not applied here.
- Files listed in `packages/ui/components/shadcn/CUSTOM.md` remain custom/manual-review-only, including `chart-wrappers.tsx`, `filter-bar.tsx`, `image-upload.tsx`, `image-cropper.tsx`, `map.tsx`, `motion-preset.tsx`, `page-shell.tsx`, `responsive-container.tsx`, `ripple-button.tsx`, `theme-toggle.tsx`, `RichTextEditor.tsx`, `rich-text-editor/`, `data-table/`, `data-grid/`, and `icons/`.

## Validation Results

| Command                                                                                                                                                                                                               | Result                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`                                                                                                                                                                                                  | Pass; confirmed modernization files plus unrelated Mission Control automation, working-set scratch, and unrelated untracked app tests in worktree              |
| `git diff --stat`                                                                                                                                                                                                     | Pass; reviewed blast radius                                                                                                                                    |
| `git diff -- package.json packages/ui/package.json`                                                                                                                                                                   | Pass; only expected package range updates                                                                                                                      |
| `git diff -- bun.lock`                                                                                                                                                                                                | Pass; expected Tailwind 4.3.0 and `tailwind-merge` 3.6.0 lock movement; no shadcn dependency added                                                             |
| `git diff -- packages/ui/styles/globals.css apps/admin/app/globals.css apps/donor/app/globals.css apps/missionary/app/globals.css apps/*/postcss.config.js packages/ui/components.json packages/ui/components/shadcn` | Pass; zero diff                                                                                                                                                |
| `git diff -- docs/ai/audits`                                                                                                                                                                                          | Pass; historical notes and final audit docs only                                                                                                               |
| `bun pm ls tailwindcss @tailwindcss/postcss @tailwindcss/typography tw-animate-css tailwind-merge postcss`                                                                                                            | Pass; top-level tree shows Tailwind 4.3.0, PostCSS plugin 4.3.0, typography 0.5.19, `tw-animate-css` 1.4.0                                                     |
| `bun pm ls @tailwindcss/node @tailwindcss/oxide`                                                                                                                                                                      | Pass; Bun prints top-level tree, while `bun.lock` confirms both at 4.3.0                                                                                       |
| `cd packages/ui && bunx --bun shadcn@latest --version`                                                                                                                                                                | Pass: `4.8.3`                                                                                                                                                  |
| `cd packages/ui && bunx --bun shadcn@latest info --json`                                                                                                                                                              | Bun cache failure; `npx --yes shadcn@latest info --json` fallback passed                                                                                       |
| `cd packages/ui && bunx --bun shadcn@latest preset resolve --json`                                                                                                                                                    | Bun cache failure; `npx --yes shadcn@latest preset resolve --json` fallback passed                                                                             |
| `bun run verify:shadcn-diff`                                                                                                                                                                                          | Pass: no component drift vs registry                                                                                                                           |
| `cd packages/ui && bunx --bun shadcn@latest add button --diff`                                                                                                                                                        | Pass, dry-run only; diff intentionally not applied                                                                                                             |
| `cd packages/ui && bunx --bun shadcn@latest add chart --diff`                                                                                                                                                         | Pass, dry-run only; diff intentionally not applied                                                                                                             |
| `cd packages/ui && bunx --bun shadcn@latest add sidebar --diff`                                                                                                                                                       | Pass, dry-run only; diff intentionally not applied                                                                                                             |
| `cd packages/ui && bunx --bun shadcn@latest add dialog --diff`                                                                                                                                                        | Pass, dry-run only; diff intentionally not applied                                                                                                             |
| `cd packages/ui && bunx --bun shadcn@latest add field --diff`                                                                                                                                                         | Pass, dry-run only; diff intentionally not applied                                                                                                             |
| `cd packages/ui && bunx --bun shadcn@latest add input-group --diff`                                                                                                                                                   | Pass, dry-run only; diff intentionally not applied                                                                                                             |
| `bun install --frozen-lockfile`                                                                                                                                                                                       | Pass                                                                                                                                                           |
| `bun run format:check`                                                                                                                                                                                                | Initially passed after formatting this audit note; later rerun failed on unrelated untracked `tests/unit/apps/admin/app/contributions-main-body.test.tsx`      |
| `bun run lint`                                                                                                                                                                                                        | Pass                                                                                                                                                           |
| `bun run typecheck`                                                                                                                                                                                                   | Pass                                                                                                                                                           |
| `bun run test:unit`                                                                                                                                                                                                   | Failed on unrelated environment / dirty-worktree tests; see below                                                                                              |
| `bun run build`                                                                                                                                                                                                       | Pass                                                                                                                                                           |
| `bun run test:e2e:smoke`                                                                                                                                                                                              | Pass: 26 tests passed; support smoke logged existing dev-server `TypeError: controller[kState].transformAlgorithm is not a function` messages but tests passed |
| `bun run test:a11y`                                                                                                                                                                                                   | Pass: 12 tests passed                                                                                                                                          |
| `bun run verify:shadcn-config`                                                                                                                                                                                        | Pass                                                                                                                                                           |
| `bun run verify:shadcn-registries`                                                                                                                                                                                    | Pass for `@shadcn/button`; private registries skipped because local credentials are absent                                                                     |
| `bun run verify:shadcn-token-drift`                                                                                                                                                                                   | Pass, report-only; existing raw palette hits remain outside this PR                                                                                            |

`bun run test:unit` failures:

- `tests/unit/scripts/bun-version.test.ts`: expected `bun@1.3.14` from `packageManager`, but this shell is `bun@1.3.5`.
- `tests/unit/scripts/bun-version.test.ts`: Windows environment path lookup uses `which`, which returned no stdout here.
- `tests/unit/scripts/ci-build.test.ts`: Windows Turbo binary candidate assertion expected a `.cmd` path.
- `tests/unit/apps/admin/app/automations-page.test.tsx`: untracked unrelated Mission Control automation page test failed with `The URL must be of scheme file`.

Latest `bun run format:check` rerun:

- `tests/unit/apps/admin/app/contributions-main-body.test.tsx`: unrelated untracked app test is not Prettier-formatted. It was not changed because it is outside this modernization PR.

## Visual QA Notes

No manual product visual QA was required for this hardening pass because there is zero diff in product UI source, shared/app CSS, shadcn component source, design tokens, or PostCSS config.

Automated coverage exercised the relevant shells and UI surfaces indirectly:

- `bun run build` built admin, donor, and missionary apps.
- `bun run test:e2e:smoke` covered donor home, donation flow, support hub shell/routes, donor settings avatar upload, upload/crop flows, and backend upload auth rejection.
- `bun run test:a11y` covered homepage, login, register, form labels, color contrast, and mobile navigation across desktop and mobile projects.

The requested manual checklist remains unchanged by this PR: app shells, default/outline/ghost/Maia buttons, dialogs/sheets, sidebar navigation, tables, charts, empty states, dark mode, reduced motion, mobile touch targets, and scrollbars have no source changes in this PR.

## Follow-Up Ideas Outside This PR

- Review shadcn upstream diffs for `button`, `chart`, `sidebar`, `dialog`, `field`, and `input-group` as separate manual-merge PRs.
- Investigate the existing Bun version/test environment mismatch.
- Investigate the existing support smoke dev-server `controller[kState].transformAlgorithm` log noise.
- Continue raw palette cleanup separately using the report-only token drift output.

## Final PR Summary

Title:
Conservative Tailwind and shadcn modernization

Summary:

- Refreshed Tailwind CSS ecosystem packages within the current major version.
- Kept shadcn on @latest and verified current CLI behavior.
- Updated stale Tailwind and shadcn agent guidance.
- Removed risky or contradictory guidance; no product UI/CSS/component changes were kept.
- Preserved local shadcn customizations and design tokens.

Checks:

- `bun install --frozen-lockfile` - passed.
- `bun run format:check` - initially passed after formatting this audit note; later rerun failed on unrelated untracked `tests/unit/apps/admin/app/contributions-main-body.test.tsx`.
- `bun run lint` - passed.
- `bun run typecheck` - passed.
- `bun run test:unit` - failed on unrelated environment / dirty-worktree tests listed above.
- `bun run build` - passed.
- `bun run test:e2e:smoke` - passed.
- `bun run test:a11y` - passed.
- `bun run verify:shadcn-diff` - passed.
- `bun run verify:shadcn-config` - passed.
- `bun run verify:shadcn-registries` - passed for public registry; private registries skipped due missing local credentials.
- `bun run verify:shadcn-token-drift` - passed, report-only.
- shadcn `info` and `preset resolve` used the documented `npx --yes shadcn@latest` fallback after Bun cache failures.

Not changed:

- no shadcn overwrite
- no full shadcn apply
- no Tailwind config migration
- no design token rewrite
- no component rewrite

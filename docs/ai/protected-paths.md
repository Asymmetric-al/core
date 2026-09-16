# Protected Paths

Living repo-visible protection map for `Asymmetric-al/core`. The original
2026-07-13 snapshot remains preserved in `docs/ai/repo-groundtruth.md` and Git
history. This file tracks the current checked-out repository controls. Dated
live GitHub branch-protection evidence lives in `docs/ci.md` and must be
reverified before platform-sensitive decisions.

Protection is reported in four distinct kinds so they are not conflated:

- **Documented** — a repo file states the rule.
- **Repository-enforced** — a repo-owned script/hook/lint rule blocks violations.
- **Platform-enforced** — GitHub/Vercel enforces it (only claimed with direct
  platform evidence).
- **Unknown** — protection plausibly exists but is not observable from this
  environment.

## Ownership

| Path pattern    | Protection                                              | Controlling evidence                                     | Kind                          | Notes                                                                                                           |
| --------------- | ------------------------------------------------------- | -------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `*` (all paths) | Default code owners `@II-ricky-bobby-II` and `@cobmojo` | `.github/CODEOWNERS`, root `CODEOWNERS` (labeled mirror) | Documented + platform routing | CODEOWNERS routes review; the live `develop` rule did not require code-owner review when checked on 2026-08-25. |

## Generated / mirrored files (do not hand-edit)

| Path pattern                                                 | Protection                                                                                       | Controlling evidence                                                                                   | Kind                                                                | Safe procedure                                                                                                                                                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ai/skills/**`                                          | Canonical Core-authored skills                                                                   | root `AGENTS.md`; `scripts/sync-agent-skills.mjs`                                                      | Documented + Repository-enforced                                    | Edit the canonical skill, then run `bun run skills:sync`; `bun run skills:verify` must be clean.                                                                                                                                                     |
| `.agents/skills/**`                                          | Mixed runtime tree: canonical overlays plus ecosystem-origin skills                              | `scripts/sync-agent-skills.mjs`; `docs/ai/rules/agent-skill-routing.md`                                | Documented + Repository-enforced                                    | For a canonical skill, edit `docs/ai/skills/<name>/`. For an ecosystem skill, use its pinned installer or documented refresh procedure in `.agents/skills`, then sync. Do not assume every directory here is generated solely from `docs/ai/skills`. |
| `.claude/skills/**`, `.cursor/skills/**`                     | Generated runtime mirrors of the full `.agents/skills` set, with canonical Core overlays applied | `scripts/sync-agent-skills.mjs`; `skills:verify` = `scripts/verify-skills-sync.mjs`; `.prettierignore` | Documented + Repository-enforced (CI `format` job + `ci:preflight`) | Do not hand-edit. Update the applicable canonical or ecosystem source, run `bun run skills:sync`, and commit the mirror diffs.                                                                                                                       |
| `.claude/commands/**`, `.claude/agents/**`                   | Generated from `.cursor/commands`/`.cursor/agents`; format-checked                               | `scripts/sync-agent-skills.mjs`                                                                        | Documented + Repository-enforced                                    | Edit the canonical `.cursor/` source, then `bun run skills:sync`.                                                                                                                                                                                    |
| `apps/admin/payload-types.ts`                                | Generated Payload types; not formatted                                                           | `.prettierignore`                                                                                      | Documented                                                          | Regenerate via Payload CMS tooling, not by hand.                                                                                                                                                                                                     |
| `.next-docs/**`                                              | Committed generated Next.js fallback docs                                                        | `.prettierignore`; root `AGENTS.md` (Next.js docs source of truth)                                     | Documented                                                          | Regenerate via `bunx @next/codemod@canary agents-md`, then remove any compressed root index and keep the small managed opening block.                                                                                                                |
| `vendor/payload-upstream/**`, `vendor/react-pdf-packages/**` | Vendored upstream; excluded from format                                                          | `.prettierignore`                                                                                      | Documented                                                          | Refresh from the documented upstream source, not by editing in place.                                                                                                                                                                                |

## Import-path protection (data-access boundary)

| Path pattern                 | Protection                                                                                                                | Controlling evidence                                                                                                                                       | Kind                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/*/app/api/**/route.ts` | Must be thin re-exports; must not import `@asym/database/supabase/*`, `@supabase/ssr`, `@supabase/supabase-js` directly   | `docs/guides/architecture/data-access-boundary.md:9-25`; ESLint `no-restricted-imports`; `scripts/verify/data-boundary-check.mjs` (`verify:data-boundary`) | Documented + Repository-enforced (ESLint + CI script) |
| App source (any)             | Must not restore Twenty clients (`packages/api/src/crm/client/*`) or reference `TWENTY_API_KEY` / `TWENTY_WEBHOOK_SECRET` | same as above                                                                                                                                              | Documented + Repository-enforced                      |

Approved exceptions to the Supabase-import rule are enumerated in
`data-access-boundary.md` (auth callback, health endpoints, GraphQL handlers,
audit logger). New exceptions must be added there and, if under `apps/*/app/api/`,
excluded in `data-boundary-check.mjs`.

## Branch / push guards

| Path / target               | Protection                                                                                                                                                                            | Controlling evidence                                                                                                            | Kind                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Local canonical pushes      | Require a registered operator and registered non-platform committers; validate every outgoing commit while preserving attributable external authors                                   | `docs/ops/git-attribution.md`; `scripts/git/trusted-identities.mjs`; `scripts/verify/git-attribution.mjs`; pre-push coordinator | Documented + Repository-enforced (local hook)                      |
| Pull-request attribution    | Validates the complete event `base..head` graph; same-repo unsigned registered claims require the matching immutable actor, while forks or actor mismatches require a matching signer | `.github/workflows/ci.yml`; `docs/ops/git-attribution.md`; `verify:git-attribution --ci`                                        | Documented + Repository-enforced (`format`, which gates `ci-gate`) |
| Protected integration       | Rejects non-fast-forwards; verifies the first-parent GitHub-signed integration spine, exact merged-PR provenance on `develop`, and reachability from `develop` on `production`        | Same as above; live branch settings in `docs/ci.md#branch-protection`                                                           | Repository + platform enforced                                     |
| Direct push to `production` | Blocked unless via `bun run release:production` (or explicit `ASYM_PRODUCTION_PUSH_BYPASS_REASON`)                                                                                    | `docs/ci.md`; `.husky/pre-push`                                                                                                 | Documented + Repository-enforced (local hook)                      |
| `develop` / `production`    | Exact required contexts and branch settings are recorded only in the dated live inventory                                                                                             | `docs/ci.md#branch-protection`                                                                                                  | Platform-enforced                                                  |
| `main` branch               | No branch exists; legacy `main: false` deployment settings are deny-only compatibility configuration                                                                                  | `docs/ci.md`; `apps/*/vercel.json`                                                                                              | Documented                                                         |

## OpenSpec

| Path pattern                               | Protection                                                           | Controlling evidence                                        | Kind       | Notes                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `openspec/specs/**`, `openspec/changes/**` | Product-intent source of truth; changes governed by OpenSpec process | root `AGENTS.md` source-of-truth order; `openspec/` present | Documented | Use a validated active change for durable contract edits; archive completed changes after shipping. |

## Platform evidence limits

- GitHub branch protection was verified through the admin API on 2026-08-25;
  `docs/ci.md#branch-protection` owns the exact dated inventory. Reverify it
  before a platform-sensitive decision.
- Vercel project protection (deployment approvals, protected env scopes) is not
  observable here; only repo-side `vercel.json` gating is confirmed.

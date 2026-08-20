# Protected Paths

Repo-visible protection rules for `Asymmetric-al/core`, anchored to snapshot
`0ebb0cc3494608f630f556c0a6c3a9ffcbbe59e7` (run `20260713T064439Z-0ebb0cc3`).

Protection is reported in four distinct kinds so they are not conflated:

- **Documented** — a repo file states the rule.
- **Repository-enforced** — a repo-owned script/hook/lint rule blocks violations.
- **Platform-enforced** — GitHub/Vercel enforces it (only claimed with direct
  platform evidence).
- **Unknown** — protection plausibly exists but is not observable from this
  environment.

## Ownership

| Path pattern    | Protection                              | Controlling evidence                                     | Kind                                         | Notes                                                                                           |
| --------------- | --------------------------------------- | -------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `*` (all paths) | Default code owner `@II-ricky-bobby-II` | `.github/CODEOWNERS`, root `CODEOWNERS` (labeled mirror) | Documented; platform enforcement **Unknown** | Whether GitHub _requires_ code-owner review is a branch-protection setting not observable here. |

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

| Path / target               | Protection                                                                                                                                                                                          | Controlling evidence                                                                                          | Kind                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Local pushes (any)          | Blocked when Git identity is `Codex <codex@example.com>` or resolves to `abiatarprado`; only `Blake <blake@risencode.org>` / `Blake <116130409+II-ricky-bobby-II@users.noreply.github.com>` allowed | `docs/ci.md:120-124`; `verify:git-attribution` = `scripts/verify/git-attribution.mjs` (via `.husky/pre-push`) | Documented + Repository-enforced (local hook) |
| Direct push to `production` | Blocked unless via `bun run release:production` (or explicit `ASYM_PRODUCTION_PUSH_BYPASS_REASON`)                                                                                                  | `docs/ci.md:127-141`; `.husky/pre-push`                                                                       | Documented + Repository-enforced (local hook) |
| `develop` branch merges     | Required checks `ci-gate`, `integration-gate`, `e2e-smoke-gate` (declared)                                                                                                                          | `docs/ci.md` §Branch protection                                                                               | Documented; platform enforcement **Unknown**  |
| `production` branch merges  | Required checks `release-source-gate`, `ci-gate`, `integration-gate`, `e2e-gate`; source must be `develop`                                                                                          | `docs/ci.md` §Branch protection; `release-source.yml`                                                         | Documented; platform enforcement **Unknown**  |
| `main` branch               | Retired/protected historical branch; Vercel deploys disabled                                                                                                                                        | `docs/ci.md`; `apps/*/vercel.json` (`main: false`)                                                            | Documented (repo config for Vercel gating)    |

## OpenSpec

| Path pattern                               | Protection                                                           | Controlling evidence                                        | Kind       | Notes                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `openspec/specs/**`, `openspec/changes/**` | Product-intent source of truth; changes governed by OpenSpec process | root `AGENTS.md` source-of-truth order; `openspec/` present | Documented | Use a validated active change for durable contract edits; archive completed changes after shipping. |

## Unresolved access limitations

- GitHub branch-protection settings, required status checks, and required
  reviewers/code-owner enforcement are **not** observable from this environment.
  All branch-level entries above are Documented intent; platform enforcement is
  Unknown. Resolving this requires GitHub repo-settings/admin API access.
- Vercel project protection (deployment approvals, protected env scopes) is not
  observable here; only repo-side `vercel.json` gating is confirmed.

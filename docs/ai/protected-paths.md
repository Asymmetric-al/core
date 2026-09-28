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

| Path pattern                                                                                                                  | Protection                                                                                                                                | Controlling evidence                                                                                          | Kind                                                                | Safe procedure                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ai/skills/**`                                                                                                           | Canonical Core-authored skills                                                                                                            | root `AGENTS.md`; `scripts/sync-agent-skills.mjs`                                                             | Documented + Repository-enforced                                    | Edit the canonical skill, then run `bun run skills:sync`; `bun run skills:verify` must be clean.                                                                                                                                                                                                   |
| `.agents/skills/**`                                                                                                           | Mixed runtime tree: canonical overlays plus ecosystem-origin skills                                                                       | `scripts/sync-agent-skills.mjs`; `docs/ai/rules/agent-skill-routing.md`                                       | Documented + Repository-enforced                                    | For a canonical skill, edit `docs/ai/skills/<name>/`. For an ecosystem skill, use its pinned installer or documented refresh procedure in `.agents/skills`, then sync. Do not assume every directory here is generated solely from `docs/ai/skills`.                                               |
| `.claude/skills/**`, `.cursor/skills/**`                                                                                      | Generated runtime mirrors of the full `.agents/skills` set, with canonical Core overlays applied                                          | `scripts/sync-agent-skills.mjs`; `skills:verify` = `scripts/verify-skills-sync.mjs`; `.prettierignore`        | Documented + Repository-enforced (CI `format` job + `ci:preflight`) | Do not hand-edit. Update the applicable canonical or ecosystem source, run `bun run skills:sync`, and commit the mirror diffs.                                                                                                                                                                     |
| `.claude/commands/**`, `.claude/agents/**`                                                                                    | Generated from `.cursor/commands`/`.cursor/agents`; format-checked                                                                        | `scripts/sync-agent-skills.mjs`                                                                               | Documented + Repository-enforced                                    | Edit the canonical `.cursor/` source, then `bun run skills:sync`.                                                                                                                                                                                                                                  |
| `apps/admin/payload-types.ts`                                                                                                 | Generated Payload types; not formatted                                                                                                    | `.prettierignore`                                                                                             | Documented                                                          | Regenerate via Payload CMS tooling, not by hand.                                                                                                                                                                                                                                                   |
| Phase25 `acceptance.md`, main PRD `User Stories` section, and `add-donor-dashboard-depth/specs/donor-dashboard-depth/spec.md` | Generated projections of `docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/traceability.json` stories and final trace mappings | `docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/tools/render-stories.mjs`; `verify:phase25-spec` | Documented + Repository-enforced (CI `format` job + `ci:preflight`) | Edit canonical JSON stories or final trace mappings, then run `node docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/tools/render-stories.mjs --write`. Verify without mutation using `bun run verify:phase25-spec`. Other PRD sections and normative contracts remain hand-maintained. |
| `.next-docs/**`                                                                                                               | Committed generated Next.js fallback docs                                                                                                 | `.prettierignore`; root `AGENTS.md` (Next.js docs source of truth)                                            | Documented                                                          | Regenerate via `bunx @next/codemod@canary agents-md`, then remove any compressed root index and keep the small managed opening block.                                                                                                                                                              |
| `vendor/payload-upstream/**`, `vendor/react-pdf-packages/**`                                                                  | Vendored upstream; excluded from format                                                                                                   | `.prettierignore`                                                                                             | Documented                                                          | Refresh from the documented upstream source, not by editing in place.                                                                                                                                                                                                                              |

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

| Path / target               | Protection                                                                       | Controlling evidence                                 | Kind             |
| --------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------- |
| Local pushes                | Normal CI preflight; no commit identity check                                    | `.husky/pre-push`; `docs/ci.md`                      | Local hook       |
| Direct push to `production` | Allowed only through `bun run release:production` or a reasoned emergency bypass | `.husky/pre-push`; `scripts/git/pre-push-guard.mjs`  | Local hook       |
| `develop` / `production`    | Required checks, reviews, force-push and deletion settings                       | `docs/ci.md#branch-protection`; live GitHub settings | GitHub native    |
| Agent commands              | Active organization member with Core Write+, or approved App identity            | `docs/ops/github-access.md`; Eve GitHub channel      | Webhook boundary |

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

# Repo Groundtruth

Evidence-backed, time-indexed account of `Asymmetric-al/core` as it exists at the
starting snapshot of this run. Produced by the Repo Groundtruth `/loop`.

This document distinguishes four categories on purpose. Do not collapse them:

- **Observed implementation** — what the code/config/scripts actually do.
- **Declared policy** — what a scoped `AGENTS.md`, architecture rule, or CI doc requires.
- **Historical context** — why something changed (PR/commit history).
- **Inference / Unknown** — reasoning not directly proven, or facts not observable here.

## 1. Run metadata and starting snapshot

| Field                           | Value                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `run_id`                        | `20260713T064439Z-0ebb0cc3`                                                   |
| `base_branch` (local checkout)  | `claude/pensive-mclean-311474`                                                |
| `base_commit`                   | `0ebb0cc3494608f630f556c0a6c3a9ffcbbe59e7`                                    |
| `default_branch`                | `develop` (`refs/remotes/origin/HEAD` → `origin/develop`)                     |
| HEAD vs `origin/develop`        | identical — `git rev-list --left-right --count HEAD...origin/develop` = `0 0` |
| `pre_existing_worktree_changes` | none — `git status --porcelain` empty at start                                |
| Full passes performed           | 1 (completion condition met; see §10)                                         |
| Recent-PR window inspected      | 25 merge commits + 30 non-merge subjects reachable from HEAD                  |

Because the local checkout, the remote default branch, and the evidentiary
snapshot all coincide at `0ebb0cc3`, there is no local/remote divergence to
reconcile in this run. All claims below are anchored to `0ebb0cc3` unless labeled
otherwise.

## 2. Scope and source-authority rules

- **What the repo does** was established from manifests, workspace declarations,
  configuration files, workflow files, and `package.json` scripts (executable /
  directly-observable evidence).
- **What policy requires** was established from the root `AGENTS.md`, nested
  `AGENTS.md` files, `docs/ci.md`, `docs/guides/architecture/data-access-boundary.md`,
  and repo-owned verify scripts.
- **Why things changed** used `git log` (merge commits + conventional-commit
  subjects). History does not override the current tree.
- **GitHub platform settings** (branch-protection required reviewers, actual
  required status checks, Vercel project state) were **not** directly observable
  from this environment and are marked Unknown, not asserted.

## 3. Groundtruth summary

- The repo is a **Bun-workspaces + Turborepo monorepo** named `give-hope` in
  root `package.json`, product-branded "Asymmetric.al" in docs.
- **3 deployable apps** (`@asym/admin`, `@asym/donor`, `@asym/missionary-app`)
  and **11 workspace packages** under `packages/*`, plus **2 tooling packages**.
- CI is gated by two always-on workflows (`ci.yml`, `ci-integration.yml`) plus a
  production release-source gate and a PR-signal coordinator; **6 additional
  workflows** exist that `docs/ci.md` does not enumerate.
- Skills are **canonical in `docs/ai/skills/`** and **mirrored** into
  `.agents/skills/`, `.cursor/skills/`, `.claude/skills/`; drift is gated by
  `skills:verify`.
- Two architecture docs **were stale on package count and version numbers** and
  were corrected in this run's follow-up pass (details in §6/§7). `docs/ci.md`,
  `monorepo-architecture.md` package globs,
  `data-access-boundary.md`, `stack-registry.md`, and `README.md` key facts match
  the tree.

## 4. Queue-item findings

### 4.1 App surfaces

**Observed implementation.** Root `package.json#workspaces` =
`["apps/*","packages/*","packages/env","tooling/*"]`. Three app manifests exist:

| Path              | Package name           | Dev port (README/scripts) | Purpose (declared)               |
| ----------------- | ---------------------- | ------------------------- | -------------------------------- |
| `apps/admin`      | `@asym/admin`          | 3030                      | Mission Control / staff-admin UI |
| `apps/donor`      | `@asym/donor`          | 3000                      | Public site + donor dashboard    |
| `apps/missionary` | `@asym/missionary-app` | 4000                      | Missionary dashboard             |

Each app is a separate Next.js App Router surface with its own `vercel.json`
(per-app deployment; see §4.6). Shared auth gating is declared to run through
`createAuthMiddleware` (`packages/auth`) wired via `apps/<app>/proxy.ts`
(`README.md:158`).

**Declared policy.** `apps/*` = deployable surfaces; app-specific routing/UI must
live in `apps/*`, shared runtime in `packages/*` (`monorepo-architecture.md`
Placement Rules; `README.md` Workspace Contract).

**Currency of docs.** `README.md` app table (surfaces, ports, packages) is
accurate. `docs/guides/architecture/overview.md` describes four _route-group
sections_ (Mission Control, Missionary, Donor, Public) mapped onto the three
apps — this is a UX/route decomposition, not a fourth deployable app, and is not
contradicted by the tree.

Classification: **Confirmed** (3 deployable surfaces, names/ports as documented).

### 4.2 Shared packages

**Observed implementation.** 11 directories under `packages/*`, each with an
`@asym/*` manifest:

| Path                  | Package name       |
| --------------------- | ------------------ |
| `packages/api`        | `@asym/api`        |
| `packages/auth`       | `@asym/auth`       |
| `packages/config`     | `@asym/config`     |
| `packages/database`   | `@asym/database`   |
| `packages/email`      | `@asym/email`      |
| `packages/env`        | `@asym/env`        |
| `packages/graphql`    | `@asym/graphql`    |
| `packages/lib`        | `@asym/lib`        |
| `packages/missionary` | `@asym/missionary` |
| `packages/mock-data`  | `@asym/mock-data`  |
| `packages/ui`         | `@asym/ui`         |

Tooling: `tooling/eslint-config` → `@asym/eslint-config`,
`tooling/typescript-config` → `@asym/typescript-config`.

`packages/mock-data` is `private: true` with `exports: { ".": "./index.ts" }`.

**Declared boundary (policy).** `packages/api/src/*` is the single canonical
business-data-access layer. App API route handlers under `apps/*/app/api/` must
be thin re-exports and must not import `@asym/database/supabase/*`,
`@supabase/ssr`, or `@supabase/supabase-js` directly. Twenty CRM is retired
(ADR-0001); remaining dormant Twenty clients must not be imported from app
source and must not be restored. Enforced by ESLint `no-restricted-imports`
plus `scripts/verify/data-boundary-check.mjs` (`data-access-boundary.md:9-25`;
`verify:data-boundary` script present).

Classification: **Confirmed** for the package inventory and the declared boundary.
The `mock-data` package produces a documentation contradiction (§6).

### 4.3 CI and local gates

**Observed implementation.** `.github/workflows/` contains **10** files:
`ci.yml`, `ci-integration.yml`, `release-source.yml`, `pr-signal-coordinator.yml`,
`auto-merge.yml`, `autofix.yml`, `configure-resend-production-webhook.yml`,
`nia-source-check.yml`, `qa-smoke-preview-deploy.yml`,
`sync-vercel-production-env.yml`.

Sampled triggers of the six not covered by `docs/ci.md`:

| Workflow (name)                           | Trigger (observed)                              |
| ----------------------------------------- | ----------------------------------------------- |
| `auto-merge.yml` (Merge coordinator)      | `check_suite`, `schedule`, `workflow_dispatch`  |
| `autofix.yml`                             | `workflow_dispatch`                             |
| `configure-resend-production-webhook.yml` | `workflow_dispatch`                             |
| `nia-source-check.yml`                    | `push` (branch-filtered), `workflow_dispatch`   |
| `qa-smoke-preview-deploy.yml`             | `pull_request` → `develop`, `workflow_dispatch` |
| `sync-vercel-production-env.yml`          | `workflow_dispatch`                             |

Root `package.json` scripts (the four separate claims kept distinct):

- **Script exists:** `ci:preflight` = `node scripts/verify/ci-preflight.mjs`;
  `format:check`, `lint`, `typecheck`, `build` (`node scripts/verify/ci-build.mjs`),
  `test:unit` (`node scripts/verify/unit-tests.mjs`), `skills:verify`,
  `verify:data-boundary`, `verify:workspace-contract`, `verify:eslint`,
  `verify:shadcn-config`, `verify:shadcn-diff`, `check`
  (`lint && typecheck && test:unit`) all present.
- **Workflow invokes it:** `docs/ci.md` maps `ci.yml` job order
  `format → lint → typecheck → build → test-unit` and `ci-integration.yml`
  `migrate → smoke → test-e2e-smoke → test-e2e`. (Job-level invocation asserted
  by the CI doc; the workflow YAML is the source of truth — see Unknowns §8.)
- **Branch protection requires it:** declared required checks are `ci-gate` +
  `integration-gate` (+ `e2e-smoke-gate`) on `develop`, and `release-source-gate`
  - `ci-gate` + `integration-gate` + `e2e-gate` on `production`
    (`docs/ci.md` §Branch protection). Whether GitHub actually enforces these is a
    platform setting → **Unknown** (§8).
- **Contributors instructed to run it:** `README.md` + `docs/ci.md` instruct
  `bun run ci:preflight` (wired into `.husky/pre-push`).

Classification: **Confirmed** for script existence and documented gate order;
branch-protection enforcement **Unknown**.

### 4.4 Protected paths

See the dedicated deliverable `docs/ai/protected-paths.md` for the full table.
Summary of what is repo-visible:

- **Ownership:** `CODEOWNERS` and `.github/CODEOWNERS` both declare
  `* @II-ricky-bobby-II` (root file is a labeled mirror of the `.github` one).
  Whether GitHub _requires_ code-owner review is **Unknown** (platform).
- **Generated/mirrored, do-not-hand-edit:** `.claude/skills/`, `.cursor/skills/`,
  `.agents/skills/` (mirrors of `docs/ai/skills/`), `apps/admin/payload-types.ts`
  (prettier-ignored generated types), `.next-docs/`, `vendor/payload-upstream`,
  `vendor/react-pdf-packages`.
- **Import-path protection:** the data-access boundary (§4.2) is enforced on
  specific import paths by ESLint + `verify:data-boundary`.
- **Push/branch guards (local):** `.husky/pre-push` runs `verify:git-attribution`
  (blocks specific Git identities) and blocks direct `production` pushes unless via
  `bun run release:production`.

### 4.5 Agent skills and mirrors

**Observed + declared (consistent).** Canonical source is `docs/ai/skills/`
(76 top-level entries). Mirrors `.agents/skills/`, `.cursor/skills/`,
`.claude/skills/` each hold 143 entries — a superset, because the sync overlays
extra ecosystem packs on top of the canonical repo skills (`README.md:180-188`,
root `AGENTS.md`). Direction of truth: **`docs/ai/skills/` → mirrors**, never the
reverse. Scripts: `skills:sync` = `scripts/sync-agent-skills.mjs`,
`skills:verify` = `scripts/verify-skills-sync.mjs` (fails on drift or a dirty tree
after sync; runs in CI `format` job and in `ci:preflight`).

`.claude/commands/` (5 entries) and `.claude/agents/` (2 entries) exist and,
per root `AGENTS.md`, are format-checked (not prettier-ignored like the skill
mirrors).

Classification: **Confirmed.** This task did not modify any skill or mirror.

### 4.6 Deployment and release controls

**Observed implementation (repo-visible only).**

- Per-app `vercel.json` for all three apps. All three declare identical branch
  gating: `git.deploymentEnabled = { "*": false, "develop": true, "production": true, "main": false }`.
- Each `vercel.json` builds via `cd ../.. && bun run build:<app>`, installs via
  `bun install --cwd ../.. --frozen-lockfile`, and gates builds with
  `node ../../scripts/vercel/should-ignore-build.mjs <app>`.
- Release controls: `release:production` = `scripts/release/production.mjs`;
  `.husky/pre-push` blocks direct `production` pushes; verify scripts
  `verify:deployment-discipline`, `verify:vercel-build-controls`,
  `verify:vercel-production`, `verify:vercel-env-inventory`,
  `verify:sentry-release`, `verify:backup-restore` all present.
- `main` is repo-config-disabled for Vercel deploys and documented as a
  retired/protected historical branch (`docs/ci.md`).

**Unknown (platform).** Actual Vercel project settings, environment variable
values, live production state, and whether the documented approval gates are
enforced on the hosting platform are not observable here.

Classification: **Confirmed** for repo-visible deployment config; platform state
**Unknown**.

### 4.7 Recent PR patterns

**Historical context (from reachable history at `0ebb0cc3`).** Patterns each
supported by ≥2 examples or an explicit repo rule:

- **Merge-PR-into-`develop` model.** e.g. `Merge pull request #788 from
Asymmetric-al/codex/AL-787-agent-skills`, `Merge pull request #453 from
Asymmetric-al/feature/AL-265-shared-refund-workflow`. Corroborated by the
  `develop`-as-default-branch policy.
- **Conventional commits.** e.g. `fix: converge pending refund lifecycle`,
  `feat(skills): add Emil and unknowns skill packs`, `docs(statement-studio): …`.
  A `commit` skill exists (`docs/ai/skills/commit/`) — convention, and a skill,
  but not proven to be a blocking gate.
- **`AL-###` ticket references in branch names.** `AL-787`, `AL-265` — matches
  the `docs/ai/rules/general.md` AL-### workflow referenced by root `AGENTS.md`.
- **Automated PR-loop sync + OpenSpec-driven change proposals.** Repeated
  `chore(pr-loop): sync PR with develop`, and a large cluster of
  `openspec(eve): add-eve-*` commits (governance/agent change proposals under
  `openspec/changes/`).

Classification: **Confirmed as repeated conventions.** Whether conventional-commit
format or ticket refs are _enforced_ by a gate was not proven → treated as
convention, not rule.

## 5. Claim-to-evidence table (load-bearing claims)

| ID   | Type               | Claim                                                                   | Evidence                                                            | Class                     |
| ---- | ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------- |
| G-01 | Direct observation | 3 deployable apps: `@asym/admin`, `@asym/donor`, `@asym/missionary-app` | `apps/*/package.json` names                                         | Confirmed                 |
| G-02 | Direct observation | 11 packages under `packages/*`, all `@asym/*`                           | `packages/*/package.json` names; `ls -1d packages/*/ \| wc -l` = 11 | Confirmed                 |
| G-03 | Direct observation | Root package name is `give-hope`; Bun pinned `bun@1.3.14`               | root `package.json` `name`, `packageManager`                        | Confirmed                 |
| G-04 | Direct observation | Next.js `16.2.6`, React `19.2.3`; root TS `6.0.3`                       | root + `apps/donor` `package.json`                                  | Confirmed                 |
| G-05 | Direct observation | `apps/donor` declares `typescript: ^5.7.3` (diverges from root `6.0.3`) | `apps/donor/package.json`                                           | Confirmed (see C-03)      |
| G-06 | Direct observation | `packages/mock-data` (`@asym/mock-data`) is a real workspace            | `packages/mock-data/package.json`; matched by `packages/*` glob     | Confirmed                 |
| G-07 | Direct observation | 10 workflow files exist; 6 are not enumerated in `docs/ci.md`           | `.github/workflows/` listing + trigger sampling                     | Confirmed                 |
| G-08 | Repository policy  | `packages/api/src/*` is the sole business data-access layer             | `data-access-boundary.md:9-25`; `verify:data-boundary` script       | Confirmed                 |
| G-09 | Direct observation | Skills canonical in `docs/ai/skills/`; mirrored (superset) to 3 dirs    | dir counts 76 vs 143×3; `README.md:180-188`; sync/verify scripts    | Confirmed                 |
| G-10 | Direct observation | All 3 apps gate Vercel deploys to `develop`/`production` only           | `apps/*/vercel.json` `git.deploymentEnabled`                        | Confirmed                 |
| G-11 | Direct observation | `CODEOWNERS` = `* @II-ricky-bobby-II` (two mirrored files)              | `CODEOWNERS`, `.github/CODEOWNERS`                                  | Confirmed                 |
| G-12 | Direct observation | HEAD == `origin/develop` at snapshot                                    | `git rev-parse`; `rev-list --left-right --count` = `0 0`            | Confirmed                 |
| G-13 | Historical report  | Merge-into-`develop` + conventional commits + `AL-###` branches         | `git log --merges`; `git log --no-merges` subjects                  | Confirmed                 |
| G-14 | Repository policy  | Branch-protection required checks per branch                            | `docs/ci.md` §Branch protection                                     | Policy / platform-Unknown |

## 6. Confirmed contradictions (implementation vs declared docs)

| ID   | Doc claim                                                                          | Implementation observed                                      | Verdict                                               |
| ---- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| C-01 | `overview.md:23,25,76` — "Next.js 16.1", "TypeScript 5.9", "seven shared packages" | Next 16.2.6 (all 3 apps), root TS 6.0.3, 11 packages         | Was stale — corrected this run (§7 S-01)              |
| C-02 | `monorepo-architecture.md:88-107` lists 10 packages under "Current Workspaces"     | 11 packages exist; `packages/mock-data` omitted              | Was stale — corrected this run (§7 S-02)              |
| C-03 | `README.md:369` key-deps table — "TypeScript 6.0.3"                                | Root manifest agrees (6.0.3); `apps/donor` declares `^5.7.3` | Manifest divergence → candidate (see loop-candidates) |

Note on C-03: this is a divergence between the doc/root pin and one app manifest's
declared range, not a proven runtime contradiction. The effective hoisted TS is
not established by manifest inspection alone; routed to `loop-candidates.md`.

## 7. Confirmed stale-document findings

Each passed the skeptical second pass (a removed/renamed path, a non-existent
command, behavior/facts contradicted by the tree, or an omission that makes a
count materially false). The original loop scope did not allow editing these
files; a **follow-up instruction later expanded scope to correct them**, and both
were fixed in this run (see §9).

- **S-01 — `docs/guides/architecture/overview.md` (lines 23, 25, 76 + directory tree).**
  Previously stated "Next.js 16.1", "TypeScript 5.9", and "seven shared packages",
  and its directory tree listed only 7 packages. Tree/manifests show Next 16.2.6
  (all 3 apps), root TS 6.0.3, and 11 packages. **Corrected this run:** version
  rows set to 16.2.6 / 6.0.3, count set to "eleven", and the four omitted packages
  (`api`, `graphql`, `missionary`, `mock-data`) added to the directory tree with
  only verified structure.
- **S-02 — `docs/ai/monorepo-architecture.md` (packages list + workspace tree).**
  "Current Workspaces → Packages" enumerated 10 packages and the tree omitted
  `packages/mock-data`; that package exists and is a live `@asym/mock-data`
  workspace. **Corrected this run:** added `packages/mock-data → @asym/mock-data`
  to both the workspace tree and the Packages list.

Explicitly **not** marked stale (survived challenge):

- `docs/ci.md` — does not claim to enumerate every workflow; the four it names and
  their gate roles are accurate. The other six workflows are recorded as an
  observation (§4.3) and a bounded limitation (§8), not staleness.
- `README.md` app table, workspace contract, key-deps (except C-03 nuance),
  skills flow — all match the tree.
- `data-access-boundary.md`, `stack-registry.md` — match the tree.

## 8. Material unknowns and limitations

- **U-01 (platform).** Actual GitHub branch-protection required checks and
  required-reviewer/code-owner enforcement on `develop`/`production` are not
  observable here. `docs/ci.md` + `CODEOWNERS` state intent; enforcement Unknown.
- **U-02 (platform).** Live Vercel project configuration, env-var values, and
  production/preview state are not observable; only repo-side `vercel.json` and
  verify scripts are.
- **U-03 (workflow internals).** Job-to-script wiring inside the 10 workflow YAMLs
  was sampled (names/triggers), not exhaustively parsed line-by-line. `docs/ci.md`
  is the asserted map; the YAML remains the source of truth for exact steps.
- **U-04 (TS resolution).** The effective resolved TypeScript version given the
  root `6.0.3` pin vs `apps/donor` `^5.7.3` range was not resolved by manifest
  inspection (candidate C-03).
- **Historical-source limitation.** PR "patterns" were derived from local git
  history reachable at `0ebb0cc3`; GitHub PR metadata/review threads were not
  queried (task forbids touching PRs/issues).

## 9. Verification results

Two phases of file changes, both re-verified before finalizing:

1. **Groundtruth pass (original scope).** Created `docs/ai/repo-groundtruth.md`,
   `docs/ai/protected-paths.md`, and `docs/ai/loop-candidates.md`.
2. **Correction pass (scope expanded by follow-up instruction).** Modified two
   pre-existing docs to remove the Confirmed stale findings S-01/S-02:
   `docs/guides/architecture/overview.md` and `docs/ai/monorepo-architecture.md`.
   Only the specific stale facts (version numbers, package count, omitted package)
   were changed; no unrelated content was touched, and no application code,
   manifest, workflow, or generated file was modified.

Verification run on the changed files: `git diff --check` clean; `prettier --check`
passes on every changed file. The repo-wide `format:check` still reports only the
9 pre-existing Windows-CRLF files (`.claude/agents/*`, `.claude/commands/*`,
`.mcp.json`, `CLAUDE.md`) that this run never touched — an environmental
pre-existing condition, not introduced here.

## 10. Final loop status

**`GROUNDTRUTH_READY`.** All seven queue items were checked in one full pass; every
load-bearing claim is Confirmed, marked a platform Unknown, or routed to a precise
follow-up / candidate. Two Confirmed stale-doc findings (S-01, S-02) were first
recorded, then corrected after a follow-up instruction expanded scope to allow the
edits (see §9). Remaining unknowns are platform-gated (U-01, U-02) and bounded
(U-03, U-04); they do not make the published groundtruth misleading. No `Likely`
or `Needs human judgment` item was patched.

# Contributing

Core is public to read. New issues and pull requests are restricted to collaborators with repository access.

## Ground rules

- Be kind and constructive.
- Keep PRs focused. Small PRs review faster.
- Add tests when you change behavior.
- Keep security issues private. Please do not open a public issue for security reports. Contact the maintainers instead.

## Choose your contribution path

- **Internal team developers:** clone `Asymmetric-al/core`, keep `origin/develop`
  current, create a feature branch, and push that branch to the canonical repo.
- **Public readers:** may fork the repository for their own use. Only Core
  collaborators can open issues or pull requests here.

Normal pull requests target `develop`. GitHub access grants work permissions;
commit metadata does not. CODEOWNERS routes reviews but does not grant access.

## Development workflow (short)

The optional [Samson Codex Cloud workflow](docs/guides/development/samson-codex-cloud.md)
uses native role-only assignments, independent acceptance, two reviews and
adjudication when needed before human-authorized merge into `develop`.
Prepare its dependencies and personal native instructions with
`node scripts/factory/setup-cloud.mjs`; use `--verify-only` to detect drift
without repairing it. Setup does not start an issue trial.

- **Base branch:** branch from and open normal pull requests to `develop`.
  `production` is updated only through the intentional release workflow, and
  the canonical repository has no `main` branch; do not create or target one.
- **Package manager:** `bun` pinned via `package.json#packageManager` and `.bun-version` (currently `bun@1.4.2`). `bun run setup` and `scripts/setup/*` call `bun run verify:bun-version` so a mismatched local Bun fails fast with upgrade instructions. Apps still run on Node.js via Next.js; Bun is the package manager and script runner, not a replacement Node runtime. Do not set `bunVersion` in app `vercel.json` files.
- **TypeScript:** application and shared-package checks use local TypeScript 7.
  The root TypeScript 6 package intentionally supplies the JavaScript API for
  ESLint/AST tooling and the legacy editor SDK. Root fixture commands use the
  explicit native alias. See the [compiler ownership guide](docs/guides/typescript-6-readiness.md)
  before changing compiler dependencies or editor settings.
- **Conventions:** `docs/conventions.md` (folder structure, code style, and pre-commit checklist).
- **UI lint:** use `bun run lint:ui <repo-relative-path>` during iteration.
  Follow the [canonical workflow](docs/ai/skills/moai-library-shadcn/references/design-system-lint.md)
  for raw findings, shared-consumer checks, exceptions, and legacy debt.
- **UI audit:** `bun run verify:shadscan` uses the locked scanner across all three
  apps. CI and pre-commit require honest app floors and current reviewed evidence;
  see the [Shadscan guide](docs/guides/development/shadscan.md).
- **Setup (macOS/Linux):** `bun run setup` (creates/validates `.env.local`, installs deps, runs verification).
- **Mission Control in Cursor Cloud:** `bun run setup:mission-control:cloud && bun run dev:mission-control` (writes gitignored dev placeholders only).
- **Access:** organization members developing Core need Write or higher access;
  see `docs/ops/github-access.md`. No Git identity registration is required.
- **GitHub operations:** internal Windows developers may use their authenticated
  Windows `gh` for normal issue, pull-request, review, check, and Actions work;
  see `docs/guides/development/contributing.md`.
- **Required local PR/push-readiness gate:** `bun run ci:preflight` (conditional development compilation; exact stages
  and focused debugging commands are documented in `docs/ci.md`).
- **Font asset changes:** run `bun run verify:fonts:offline` in Linux/WSL with
  Playwright Chromium installed. See [shared font maintenance](packages/ui/fonts/README.md)
  for the exact asset, license, subset and preload contract.
- **Eve build boundary:** web builds and hosted admin previews emit unqualified
  Eve artifacts without sandbox provisioning. Production services retain full
  prewarming; use `bun run --cwd packages/eve-runtime build:full` in the approved
  target environment for full qualification. Follow the
  [build runbook](docs/guides/development/build-runbook.md#eve-artifacts-and-qualification)
  and keep Release Off until the separate launch requirements are met.
- **Production E2E:** `bun run test:e2e:production-gate` is the bounded
  release gate required for `production`; broader `bun run test:e2e` remains useful
  for local feature validation.

## Code review and ownership

- **Default code owners:** `@II-ricky-bobby-II` and `@cobmojo`
- **Owner mapping file:** `/.github/CODEOWNERS` (mirrored in `/CODEOWNERS`)
- **Review/gate policy:** `docs/guides/development/code-review-and-ownership.md`

## License for contributions

By contributing, you agree that we will release your contributions under the same license as this project: AGPL-3.0-only.

## Development-phase build policy

Routine `develop` PRs retain formatting, integrity, lint, type checking, unit tests, migration and smoke feedback. Dependency/build-configuration changes compile affected apps; ordinary source/docs changes may merge without a full release build. Merges into `develop` do not automatically deploy. Request `qa:smoke` for a ready preview; GitHub builds and uploads prebuilt output. Use `bun run ci:preflight -- --full` for full QA. Production releases and production-targeting pushes always require full preflight. See [CI reference](docs/ci.md).

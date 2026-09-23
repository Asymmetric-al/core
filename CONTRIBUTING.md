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

- **Base branch:** branch from and open normal pull requests to `develop`.
  `production` is updated only through the intentional release workflow, and
  the canonical repository has no `main` branch; do not create or target one.
- **Package manager:** `bun` pinned via `package.json#packageManager` (currently `bun@1.3.14`). `bun run setup` and `scripts/setup/*` call `bun run verify:bun-version` so a mismatched local Bun fails fast with upgrade instructions.
- **Conventions:** `docs/conventions.md` (folder structure, code style, and pre-commit checklist).
- **UI lint:** use `bun run lint:ui <repo-relative-path>` during iteration.
  Follow the [canonical workflow](docs/ai/skills/moai-library-shadcn/references/design-system-lint.md)
  for raw findings, shared-consumer checks, exceptions, and legacy debt.
- **Setup (macOS/Linux):** `bun run setup` (creates/validates `.env.local`, installs deps, runs verification).
- **Mission Control in Cursor Cloud:** `bun run setup:mission-control:cloud && bun run dev:mission-control` (writes gitignored dev placeholders only).
- **Access:** organization members developing Core need Write or higher access;
  see `docs/ops/github-access.md`. No Git identity registration is required.
- **GitHub operations:** internal Windows developers may use their authenticated
  Windows `gh` for normal issue, pull-request, review, check, and Actions work;
  see `docs/guides/development/contributing.md`.
- **Required local PR/push-readiness gate:** `bun run ci:preflight` (exact stages
  and focused debugging commands are documented in `docs/ci.md`).
- **Production E2E:** `bun run test:e2e:production-gate` is the bounded
  release gate required for `production`; broader `bun run test:e2e` remains useful
  for local feature validation.

## Code review and ownership

- **Default code owners:** `@II-ricky-bobby-II` and `@cobmojo`
- **Owner mapping file:** `/.github/CODEOWNERS` (mirrored in `/CODEOWNERS`)
- **Review/gate policy:** `docs/guides/development/code-review-and-ownership.md`

## License for contributions

By contributing, you agree that we will release your contributions under the same license as this project: AGPL-3.0-only.

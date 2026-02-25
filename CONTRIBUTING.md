# Contributing

Thanks for contributing to asymmetric.al. We welcome pull requests, bug reports, and improvements.

## Ground rules

- Be kind and constructive.
- Keep PRs focused. Small PRs review faster.
- Add tests when you change behavior.
- Keep security issues private. Please do not open a public issue for security reports. Contact the maintainers instead.

## Development workflow (short)

- **Base branch:** `develop` (open PRs against `develop`; `main` is protected).
- **Package manager:** `bun` (see `package.json#packageManager`).
- **Conventions:** `docs/conventions.md` (folder structure, code style, and pre-commit checklist).
- **Setup (macOS/Linux):** `bun run setup` (creates/validates `.env.local`, installs deps, runs verification).
- **Local PR-readiness gate (matches blocking CI):**
  - `bun run check && bun run typecheck && bun run build && bun run test:unit`
- **Optional:** `bun run test:e2e` (non-blocking in CI; run when changes impact user flows).

## Ultracite + Cursor workflow

- **Primary quality commands (root):**
  - `bun run check` → non-mutating ESLint + Prettier + Stylelint checks via Ultracite
  - `bun run fix` → auto-fixes via Ultracite
- **Pre-commit behavior:** Husky runs `lint-staged`, which runs `bunx ultracite fix` on **staged files only**.
- **Cursor project integration files:**
  - `.cursor/rules/ultracite.mdc` (shared project standards for Cursor)
  - `.cursor/hooks.json` (runs `bunx ultracite fix` after AI file edits)

## Maintainers: enabling Ultracite Cloud

Ultracite Cloud is maintainer-enabled infrastructure for automated PR fixes and scheduled cleanup PRs.

1. Sign in to Ultracite Cloud with GitHub.
2. Install the Ultracite GitHub App on the correct org/personal account.
3. Enable this repository in the Ultracite dashboard.
4. Review and approve the GitHub App permissions requested.
5. Validate setup by creating a test PR and commenting `@ultracite review`.

Cloud behavior:

- On `@ultracite review`, Cloud checks out the PR branch in a sandbox, runs `ultracite fix`, commits fixes back to the PR branch, and comments a summary.
- Cloud can also run a daily cleanup pass on the default branch and open a PR with automated fixes.
- Cloud disables git hooks in its sandbox. Local Husky hooks still run for contributors.
- For PRs from forks, Cloud may not be able to push fixes unless the PR allows maintainer edits.

## Code review and ownership

- **Default code owner:** `@II-ricky-bobby-II`
- **Owner mapping file:** `/.github/CODEOWNERS` (mirrored in `/CODEOWNERS`)
- **Review/gate policy:** `docs/guides/development/code-review-and-ownership.md`

## License for contributions

By contributing, you agree that we will release your contributions under the same license as this project: AGPL-3.0-only.

## Developer Certificate of Origin (DCO)

We use the Developer Certificate of Origin (DCO) version 1.1.

When you sign off a commit, you confirm that you wrote the code or you have the right to submit it, and you agree to the DCO terms.

To sign off a commit, use:

```bash
git commit -s
```

### DCO 1.1 text

Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file, or

(b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file, or

(c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.

(d) I understand and agree that this project and the contribution are public and that a record of the contribution, including all personal information I submit with it, is maintained indefinitely and may be redistributed consistent with this project or the open source license involved.

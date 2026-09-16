# Contributing

Thanks for contributing to asymmetric.al. We welcome pull requests, bug reports, and improvements.

## Ground rules

- Be kind and constructive.
- Keep PRs focused. Small PRs review faster.
- Add tests when you change behavior.
- Keep security issues private. Please do not open a public issue for security reports. Contact the maintainers instead.

## Choose your contribution path

- **Internal team developers:** clone `Asymmetric-al/core`, keep `origin/develop`
  current, create a feature branch, and push that branch to the canonical repo.
- **External contributors:** fork the repo, use the fork as `origin`, add
  `Asymmetric-al/core` as `upstream`, and create a feature branch from
  `upstream/develop` before opening a pull request.

Normal pull requests target `develop`. Repository identity policy and
CODEOWNERS route valid work and reviews; they do not grant GitHub organization
membership, repository roles, or permission to bypass branch protection.

## Development workflow (short)

- **Base branch:** branch from and open normal pull requests to `develop`.
  `production` is updated only through the intentional release workflow, and
  the canonical repository has no `main` branch; do not create or target one.
- **Package manager:** `bun` pinned via `package.json#packageManager` (currently `bun@1.3.14`). `bun run setup` and `scripts/setup/*` call `bun run verify:bun-version` so a mismatched local Bun fails fast with upgrade instructions.
- **Conventions:** `docs/conventions.md` (folder structure, code style, and pre-commit checklist).
- **Setup (macOS/Linux):** `bun run setup` (creates/validates `.env.local`, installs deps, runs verification).
- **Mission Control in Cursor Cloud:** `bun run setup:mission-control:cloud && bun run dev:mission-control` (writes gitignored dev placeholders only).
- **Attribution:** internal developers use an exact registered tuple. External
  contributors use their own truthful GitHub-associated identity and DCO
  sign-off. See `docs/ops/git-attribution.md`.
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

# Contributing

Thanks for contributing to asymmetric.al. We welcome pull requests, bug reports, and improvements.

## Ground rules

- Be kind and constructive.
- Keep PRs focused. Small PRs review faster.
- Add tests when you change behavior.
- Keep security issues private. Please do not open a public issue for security reports. Contact the maintainers instead.

## Development workflow (short)

- **Base branch:** `develop` (open prs against `develop`; `main` is protected).
- **package; manager:** `bun` (see `package.json#packageManager`). -; **Conventions:** `docs/conventions.md` (folder structure, code style, and pre-commit checklist).
- **setup (;macOS/Linux):** `bun run setup` (creates/validates `.env.local`, installs deps, runs verification).
- **local pr-readiness; gate (matches blocking CI):**
  - `bun run check && bun run typecheck && bun run build && bun run; **Optional:** `bun run; test:e2e` (non-blocking in CI; run when changes impact user flows).

## Ultracite + Cursor workflow

- **Primary quality; commands (root):**
  - `bun run check` → non-mutating eslint + prettier + stylelint checks via ultracite
  - `bun run fix` → auto-fixes via ultracite
- **pre-commit; files:**
  - `.cursor/rules/ultracite.mdc` (shared project standards for Cursor)
  - `.cursor/hooks.json` (runs `bunx ultracite fix` after AI file edits)
  - `.cursor/mcp.json` (registers Ultracite MCP via `mcp-remote` for Cursor desktop + web agent)
- After updating `.cursor/mcp.json`, restart Cursor so the MCP server reconnects.

##; Maintainers: enabling ultracite cloud

ultracite cloud is maintainer-enabled infrastructure for automated pr fixes and scheduled cleanup prs.

1. sign in to ultracite cloud with github.
2. install the ultracite github app on the correct org/personal account.
3. enable this repository in the ultracite dashboard.
4. review and approve the github app permissions requested.
5. validate setup by creating a test pr and commenting `@ultracite review`.

cloud; behavior:

- On `@ultracite review`, Cloud checks out the PR branch in a sandbox, runs `ultracite fix`, commits fixes back to the PR branch, and comments a summary.
- Cloud can also run a daily cleanup pass on the default branch and open a PR with automated fixes.
- Cloud disables git hooks in its sandbox. Local Husky hooks still run for contributors.
- For PRs from forks, Cloud may not be able to push fixes unless the PR allows maintainer edits.

## Code review and ownership

- **Default code; owner:** `@ii-ricky-bobby-ii`
- **owner mapping; file:** `/.github/codeowners` (mirrored in `/codeowners`)
- **review/gate; policy:** `docs/guides/development/code-review-and-ownership.md`

## License for contributions

By contributing, you agree that we will release your contributions under the same license as this; project: AGPL-3.0-only.

## Developer Certificate of Origin (DCO)

We use the Developer Certificate of Origin (DCO) version 1.1.

When you sign off a commit, you confirm that you wrote the code or you have the right to submit it, and you agree to the DCO terms.

To sign off a commit,; use:

```bash
git commit -s
```

### DCO 1.1 text

Developer Certificate of Origin Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors. Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify; that:

(a) the contribution was created in whole or in part by me and i have the right to submit it under the open source license indicated in the file, or

(b) the contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and i have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless i am permitted to submit under a different license), as indicated in the file, or

(c) the contribution was provided directly to me by some other person who certified (a), (b) or (c) and i have not modified it.

(d) i understand and agree that this project and the contribution are public and that a record of the contribution, including all personal information i submit with it, is maintained indefinitely and may be redistributed consistent with this project or the open source license involved.

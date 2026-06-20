# Git Attribution Policy

## Purpose

Keep GitHub and Vercel deployment history attributable to Blake's GitHub account
going forward. This avoids new production or development deployments showing the
older `abiatarprado` account that GitHub associates with `codex@example.com`.

## Current Policy

- Future commits must use author and committer name `Blake`.
- Future commits must use either `blake@risencode.org` after GitHub email
  verification, or `116130409+II-ricky-bobby-II@users.noreply.github.com`.
- Future GitHub and Vercel deployment metadata must resolve to
  `II-ricky-bobby-II`.
- Do not use `Codex <codex@example.com>` in this repository.
- Do not invite or rely on `abiatarprado` for deployments. That account is an
  external historical attribution path caused by older `codex@example.com`
  commits and is not a team deployment identity.

## Automation Identity

The long-term target is a team-owned GitHub/Vercel automation identity for
Codex-assisted deploys. Until that account exists and is added to the relevant
teams, use Blake's verified GitHub identity above for commits and deploys rather
than any external account or placeholder email.

When the team-owned automation account is created:

1. Add it to the Asymmetric.al GitHub organization and Vercel team with the
   minimum deployment permissions required.
2. Use a verified, team-controlled email address for Git author/committer
   metadata.
3. Update this file and the repo-local `git config user.name` /
   `git config user.email` values.
4. Re-run `bun run verify:git-attribution` before pushing or deploying.

## Forward-Only History

Historical commits and old Vercel deployment records may still show
`Codex <codex@example.com>` or resolve to `abiatarprado`. That is expected. This
repository intentionally does not rewrite existing Git history or alter old
deployment records for attribution cleanup.

## Operator Checklist

Set local repo attribution before committing:

```bash
git config user.name Blake
git config user.email 116130409+II-ricky-bobby-II@users.noreply.github.com
```

Verify attribution before push:

```bash
git var GIT_AUTHOR_IDENT
git var GIT_COMMITTER_IDENT
bun run verify:git-attribution
```

`bun run ci:preflight` runs the same attribution guard first, and `.husky/pre-push`
runs `ci:preflight` before any push leaves the local checkout.

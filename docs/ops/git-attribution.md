# Git Attribution Policy

## Purpose

Keep GitHub and Vercel deployment history attributable to Blake's GitHub account
going forward. This avoids new production or staging deployments showing the
older `abiatarprado` account that GitHub associates with `codex@example.com`.

## Current Policy

- Future commits must use author and committer name `Blake`.
- Future commits must use either `blake@risencode.org` after GitHub email
  verification, or `116130409+II-ricky-bobby-II@users.noreply.github.com`.
- Future GitHub and Vercel deployment metadata must resolve to
  `II-ricky-bobby-II`.
- Do not use `Codex <codex@example.com>` in this repository.

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

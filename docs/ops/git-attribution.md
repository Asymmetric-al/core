# Git Attribution Policy

## Purpose

Keep GitHub and Vercel deployment history attributable to Blake's GitHub account
going forward. This avoids new production or development deployments showing the
older `abiatarprado` account that GitHub associates with `codex@example.com`.

## Current Policy

- Future ordinary commits must use author and committer name `Blake`.
- Future ordinary commits must use either `blake@risencode.org` after GitHub email
  verification, `116130409+II-ricky-bobby-II@users.noreply.github.com`, or
  `299239962+asymmetric-core-eve[bot]@users.noreply.github.com` for Asymmetric
  Core Eve automation commits.
- Future GitHub and Vercel deployment metadata for ordinary commits must resolve
  to `II-ricky-bobby-II` or `asymmetric-core-eve[bot]`.
- Commit email and GitHub actor metadata must match the same identity: Blake's
  human emails resolve to `II-ricky-bobby-II`, and Eve's bot email resolves to
  `asymmetric-core-eve[bot]`.
- Do not use `Codex <codex@example.com>` in this repository.
- Do not invite or rely on `abiatarprado` for deployments. That account is an
  external historical attribution path caused by older `codex@example.com`
  commits and is not a team deployment identity.

## GitHub-Hosted Integration Merges

The latest commit may be a GitHub-created integration merge already inherited
from `develop` or `production`. Its platform committer is
`GitHub <noreply@github.com>`, associated with `web-flow` account ID `19864447`.
The verifier accepts that identity only when all of these checks pass together:

- The origin identifies canonical `Asymmetric-al/core`, and live GitHub commit
  metadata matches the local full SHA, raw author and committer names/emails,
  and exactly two ordered parent SHAs.
- GitHub reports valid REST verification and a valid GraphQL signature produced
  by GitHub, with signer `web-flow` / `19864447`. A matching committer email or
  account association alone is insufficient.
- The author uses an existing allowed email bound to its expected GitHub login
  and immutable account ID. The author name remains `Blake`, except that
  `ricky` is accepted with exactly
  `116130409+II-ricky-bobby-II@users.noreply.github.com` bound to
  `II-ricky-bobby-II` / `116130409`.
- An associated closed, merged pull request has this exact merge SHA, the first
  parent as its base SHA, and the second parent as its head SHA. Its base is
  canonical `develop` or `production`, currently protected, and its merger
  matches an existing trusted login and immutable account ID.

The merge need not remain the integration branch's current HEAD. This is an
exact provenance check, not a hardcoded historical-commit exemption. It does
not authorize a push, change branch protection, or replace release controls.

Required online evidence that is missing, malformed, unavailable, or mismatched
fails the hosted-merge path. Restore GitHub read access or service availability
and rerun `bun run verify:git-attribution`; do not change identity or skip the
check. Successful responses containing malformed JSON or non-object metadata
also block ordinary commits; unavailable ordinary lookups retain their warning
behavior. Local Git
configuration and effective author/committer identities still use the strict
ordinary policy; the `ricky` and GitHub platform identities are not valid local
configuration.

The broader team workflow in
[PR #1428](https://github.com/Asymmetric-al/core/pull/1428) remains proposed and
is not enabled by this exception. The scoped active contract is
`openspec/changes/fix-github-merge-attribution`.

## Automation Identity

Asymmetric Core Eve is the team-owned GitHub App identity for fleet automation
pushes. It is allowlisted for commit email and GitHub actor metadata, and should
be used for Codex-assisted automation instead of external accounts or placeholder
emails.

When the team-owned automation identity changes:

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

Set Asymmetric Core Eve automation attribution with the same required commit name:

```bash
git config user.name Blake
git config user.email 299239962+asymmetric-core-eve[bot]@users.noreply.github.com
```

Verify attribution before push:

```bash
git var GIT_AUTHOR_IDENT
git var GIT_COMMITTER_IDENT
bun run verify:git-attribution
```

`bun run ci:preflight` runs the same attribution guard first, and `.husky/pre-push`
runs `ci:preflight` before any push leaves the local checkout.

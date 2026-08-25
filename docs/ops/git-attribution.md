# Git Attribution Policy

## Purpose

Keep new Core work attributable to the person or team automation that actually
created it, while preserving reviewed external authors and existing history.

## Registered identities

Approved fields form exact tuples; a trusted name, email, GitHub login, and
immutable numeric account ID may not be mixed across records.

| Role                | Approved Git author/committer tuple                                                      | Bound GitHub account                         |
| ------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| Blake               | `Blake <blake@risencode.org>`                                                            | `II-ricky-bobby-II` / `116130409`            |
| Blake               | `Blake <116130409+II-ricky-bobby-II@users.noreply.github.com>`                           | `II-ricky-bobby-II` / `116130409`            |
| Conrad              | `Conrad O <79217644+cobmojo@users.noreply.github.com>`                                   | `cobmojo` / `79217644`                       |
| Asymmetric Core Eve | `asymmetric-core-eve[bot] <299239962+asymmetric-core-eve[bot]@users.noreply.github.com>` | `asymmetric-core-eve[bot]` / `299239962`     |
| Cursor Agent        | `Cursor Agent <cursoragent@cursor.com>`                                                  | signer `cursoragent` / `199161495`           |
| PR-loop             | `Blake <301899336+asymmetric-core-pr-loop[bot]@users.noreply.github.com>`                | `asymmetric-core-pr-loop[bot]` / `301899336` |

Automation identity is exact; it is not inferred from a familiar display name.
`Blake <299239962+asymmetric-core-eve[bot]@users.noreply.github.com>` is an
obsolete cross-wired tuple and is not registered. Cursor's PR event actor is
`cursor[bot]` / `206951365`, while its tuple and SSH signature belong to
`cursoragent` / `199161495`; those principals are not interchangeable.

PR-loop's direct tuple uses the Git name `Blake`. GitHub-created commits may
emit `asymmetric-core-pr-loop[bot]` as author with the same email; that alias is
accepted only beneath a valid GitHub `web-flow` platform envelope. Blake's
`ricky` alias follows the same platform-only rule for his noreply email.

Conrad's GitHub display name may appear as `Conrad O'`; the exact local and
commit name is `Conrad O` because Git sanitizes a trailing apostrophe in emitted
identity metadata.

`GitHub <noreply@github.com>` is a separate platform envelope. Remote CI accepts
it only when GraphQL reports a valid `web-flow` / `19864447` signature with
`wasSignedByGitHub=true`. It is never accepted as a locally configured
developer.

Do not use `Codex <codex@example.com>` or the forbidden `abiatarprado` GitHub
actor. Those legacy identities remain rejected in every contribution mode.

## Internal and external contribution paths

- **Internal canonical pushes:** the local operator and every non-platform
  committer must use a registered tuple. The hook validates the complete outgoing
  commit set for every pushed ref, not arbitrary inherited `HEAD` history.
- **Carried external authors:** an internal committer may integrate a parseable,
  non-forbidden external author's reviewed work without rewriting its author.
- **External fork pull requests:** authors and committers do not need canonical
  push identities, but remote metadata must remain attributable and
  non-forbidden. A fork that claims a registered tuple must carry a valid
  signature from that registered account.

### External contributor identity

External contributors use their own truthful Git name and an email that GitHub
associates with their account; a GitHub-provided noreply address is suitable.
They sign off their own commits and are not added to the internal registry
solely to open a fork pull request.

Fork CI requires resolvable, non-forbidden author and committer associations. A
claim using a registered internal tuple requires a valid signature from that
account. When an internal developer carries reviewed external work, preserve
the external author and DCO sign-off while the registered internal identity
remains the committer.

FastPR Controller remains installed, but its historical direct repairs used the
unsigned, GitHub-unassociated tuple
`pr-fast <pr-fast@users.noreply.github.com>`. The forward-only baseline preserves
that history, but a new direct repair under that tuple must fail. Before direct
FastPR repairs resume, retire that path or prove and register its configured App
tuple through a reviewed registry-and-tests change. Installation alone is not
proof of a commit envelope.

Use DCO sign-off for contributions. Passing attribution proves identity policy;
it does not grant organization membership, a repository role, direct protected-
branch access, merge authority, force-push authority, or production access.

## Configure a local developer identity

Set the exact tuple for the person making the commit:

```bash
# Blake (choose one registered email)
git config user.name Blake
git config user.email 116130409+II-ricky-bobby-II@users.noreply.github.com

# Conrad
git config user.name "Conrad O"
git config user.email 79217644+cobmojo@users.noreply.github.com
```

Automation configures its exact registered tuple in its controlled environment.
Do not copy automation credentials or configure an automation identity for
interactive work.

### Windows and WSL credentials

Keep the checkout and Git operations in WSL. WSL Git may call the existing
Windows Git Credential Manager, so its managed credential is reused without
copying or exposing a token:

```bash
git config --local credential.helper \
  '/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe'
```

If Git for Windows is installed elsewhere, use that installation's GCM path.
Never paste, print, export, or commit a token, and do not copy credentials between
Windows and WSL files or environment variables.

Use an already-authenticated Windows `gh` for normal issue, pull-request,
review, check, and Actions operations. Pass the repository explicitly so the
commands do not depend on the current PowerShell directory:

```powershell
gh issue list --repo Asymmetric-al/core
gh pr create --repo Asymmetric-al/core --base develop --head feature/AL-123-short-title
gh pr review <number> --repo Asymmetric-al/core
gh pr checks <number> --repo Asymmetric-al/core --watch
gh run list --repo Asymmetric-al/core
```

For a fork pull request, use `<your-login>:feature/AL-123-short-title` as the
`--head` value. Windows `gh` and WSL Git may use their own secure helpers; they
do not need a shared plaintext credential, and these commands do not bypass the
authenticated account's live permissions.

## Enforcement

Local `bun run verify:git-attribution` checks repository configuration and commit
metadata. The pre-push coordinator reads Git's ref-update input once, preserves
the production guard, and supplies the deduplicated outgoing commit set plus a
sanitized repository slug to `bun run ci:preflight`; raw remote URLs are not
propagated. Deletions introduce no commits. Existing refs use the complete
remote-to-local graph; new refs query the actual remote branch/tag tips, fetch
only missing advertised histories without updating refs or `FETCH_HEAD`, and
subtract that remote history. Commits proven ancestral to the immutable
policy baseline remain historical. Existing history is not rewritten.

Remote verification runs before formatting in the fast CI workflow. Ordinary
pull requests validate the complete immutable event `base..head` graph,
including merge parents. A same-repository PR may use the matching immutable
event actor or PR author for an unsigned registered tuple; forks and presenter
mismatches require the registered signer. This lets a bot or coworker update a
PR without reassigning its owner's earlier commits.

Protected pushes reject non-fast-forwards and validate the first-parent
integration spine so the merger or release actor is not retroactively applied
to reviewed side ancestry. Every scanned commit must be a two-parent GitHub
platform merge with a valid GitHub `web-flow` signature. A `develop` integration
must match the exact closed PR, base, and two parents. A `production` promotion
must already be reachable from canonical `develop`. This is defense in depth;
live branch protection remains the authorization boundary and is recorded in
`docs/ci.md#branch-protection`.

Manual dispatch on a protected branch uses the same integration-spine rules. On
another branch it scans the full forward-only range from the immutable baseline
and never grants event-actor proof. GitHub's commit-email association is
consistency metadata, not authentication.

Forbidden IDs and logins are checked independently across event and commit
principals. GraphQL signature metadata is fetched for every checked commit, and
rerun actors are resolved to immutable IDs, so an invalid or forbidden signer
cannot hide behind otherwise-sufficient actor proof. Missing, partial, or
malformed metadata fails closed. The result remains inside the existing
`ci-gate`; attribution does not add or replace a protected check name.

The production release guard is unchanged. Direct `production` pushes still use
`bun run release:production`, and GitHub review/check rules still apply.

## Operator checklist

```bash
git var GIT_AUTHOR_IDENT
git var GIT_COMMITTER_IDENT
bun run verify:git-attribution
bun run ci:preflight
```

Before opening a normal pull request, confirm the base is `develop`, push only a
feature branch, and inspect the outgoing commits. Preserve external authors and
their DCO sign-offs rather than amending them to an internal identity.

Live branch-protection or required-check-name drift is a separate platform
reconciliation task and is intentionally not changed by this policy.

# Daily Developer Workflow

Use this quick reference to take an `AL-###` issue from a current `develop`
checkout to a reviewed pull request.

## Workflow invariants

- Branch from `develop` and open normal pull requests back to `develop`.
- Include the `AL-###` key in the branch and pull request.
- Work on a feature branch; do not commit directly to `develop`.
- Update `production` only through `bun run release:production`. The canonical
  repository has no `main` branch; do not create or target one.
- Passing attribution or appearing in CODEOWNERS does not grant a GitHub role or
  bypass branch protection, required checks, review, or conversation resolution.

## Choose the correct remote model

### Internal team developer

Internal developers with canonical-repository push permission use `origin` for
`Asymmetric-al/core` and push only their feature branch:

```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c feature/AL-123-short-title
git push -u origin feature/AL-123-short-title
```

### External contributor

External contributors use a fork as `origin` and the canonical repo as
`upstream`:

```bash
git clone git@github.com:<your-login>/core.git
cd core
git remote add upstream git@github.com:Asymmetric-al/core.git
git fetch upstream
git switch -c feature/AL-123-short-title upstream/develop
git push -u origin feature/AL-123-short-title
```

Open the fork pull request against `Asymmetric-al/core:develop`. An external
author does not need to be added to the internal identity registry; their
truthful authorship and DCO sign-off are preserved through review. Do not copy a
registered internal tuple: fork claims for a registered identity require that
account's verified commit signature.

## Windows and WSL authentication

Keep source and Git operations in the WSL checkout. WSL Git may reuse Windows
Git Credential Manager, and an authenticated Windows GitHub CLI may handle
issues, pull requests, reviews, checks, and Actions. Follow the canonical setup
and command examples in `docs/ops/git-attribution.md`; never copy a token into
WSL, repository config, shell history, logs, or committed files. GitHub still
enforces the authenticated account's live role and the repository's branch
rules.

## Issue and pull-request lifecycle

1. **Pick or draft an issue.** Confirm scope, acceptance criteria, affected
   areas, and verification. Use an `AL-###` issue with the required labels.
2. **Create a branch.** Start from the latest `develop` using the correct remote
   model above. A draft pull request is useful for early visibility.
3. **Implement in small steps.** Keep the diff focused and run targeted tests
   while working.
4. **Commit truthfully.** Sign off the commit and use a conventional subject:

   ```bash
   git commit -s -m "fix(scope): describe the change" -m "ref AL-123"
   ```

5. **Run the repository gate.** Before marking the pull request ready:

   ```bash
   bun run ci:preflight
   ```

6. **Request review.** Include `Fixes #123` on its own line in the pull-request
   body, using the GitHub issue number. Keep `AL-123` in the branch and PR title;
   the issue key alone is not a GitHub closing reference. Document verification,
   request the applicable code owners, and resolve review threads.
7. **Merge and clean up.** Merge through GitHub after required checks and review
   pass. Delete the feature branch, then refresh local `develop` from `origin`
   (internal) or `upstream` (external).

## Attribution and carried authorship

Canonical-repository pushes require a registered internal operator and
registered non-platform committers. A reviewed external commit may retain its
original, attributable author while an internal developer is recorded as the
committer. Do not rewrite an external author's identity to make a check pass.

The pre-push hook validates the outgoing commit set and runs
`bun run ci:preflight`. Required remote attribution verification runs in the
`format` job, which blocks `ci-gate` through `needs`. Pull requests validate the
full event `base..head` graph. In a
same-repository PR, the matching authenticated event actor or immutable PR
author may present an unsigned registered tuple; a fork or presenter mismatch
requires its matching signer.
Protected pushes instead validate GitHub-signed integration provenance. Commit-
email association alone is not proof, and attribution does not replace GitHub
authorization or review.

## Troubleshooting

- **Wrong base:** rebase or recreate the feature branch from current `develop`.
- **Issue does not close:** use GitHub closing-keyword syntax such as
  `Fixes #123` on its own line. `AL-123` without `#123` does not close the issue.
- **Gate fails:** fix the first failure, rerun its focused command, then rerun
  `bun run ci:preflight`.
- **Push authentication fails in WSL:** verify the local credential-helper path
  and the Windows GCM session. Do not export or copy its stored credential.
- **GitHub operation is denied:** check `gh auth status` in Windows and the
  account's live repository role. Changing docs, CODEOWNERS, or attribution
  policy cannot grant platform permission.

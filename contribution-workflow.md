# Daily Developer Workflow

Use this quick reference to take an `AL-###` issue from a current `develop`
checkout to a reviewed pull request.

## Workflow invariants

- Branch from `develop` and open normal pull requests back to `develop`.
- Include the `AL-###` key in the branch and pull request.
- Work on a feature branch; do not commit directly to `develop`.
- Update `production` only through `bun run release:production`. The canonical
  repository has no `main` branch; do not create or target one.
- GitHub access authorizes developers and approved automation. Commit metadata
  does not grant or deny permission. Branch protection and reviews still apply.

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

### Public reader

Public readers may fork Core, but collaborator-only issue and PR creation is
enabled. An organization owner grants new developers Core Write+ access.

## Windows and WSL authentication

Keep source and Git operations in the WSL checkout. WSL Git may reuse Windows
Git Credential Manager, and an authenticated Windows GitHub CLI may handle
issues, pull requests, reviews, checks, and Actions. Follow the access policy
in `docs/ops/github-access.md`; never copy a token into
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
4. **Commit.** Use a conventional subject:

   ```bash
   git commit -m "fix(scope): describe the change" -m "ref AL-123"
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
   from `origin`.

## Handoffs

A human or approved agent may continue another authorized actor's branch. The
pre-push hook runs normal CI preflight and guards direct production pushes; it
does not inspect commit identity. Eve checks the authenticated GitHub command
sender before privileged work. See `docs/ops/github-access.md`.

## Troubleshooting

- **Wrong base:** rebase or recreate the feature branch from current `develop`.
- **Issue does not close:** use GitHub closing-keyword syntax such as
  `Fixes #123` on its own line. `AL-123` without `#123` does not close the issue.
- **Gate fails:** fix the first failure, rerun its focused command, then rerun
  `bun run ci:preflight`.
- **Push authentication fails in WSL:** verify the local credential-helper path
  and the Windows GCM session. Do not export or copy its stored credential.
- **GitHub operation is denied:** check `gh auth status` in Windows and the
  account's live repository role. Changing docs or CODEOWNERS cannot grant platform permission.

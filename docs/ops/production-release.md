# Production Release Guide

Use this guide when shipping the Asymmetric.al platform to production. The goal
is to keep production releases deliberate and keep Vercel build usage inside the
plan by avoiding debug loops on the production branch.

## Standard path

1. Do local implementation work on a non-production branch.
2. Merge or push validated work to `develop` for development.
3. Verify development behavior on the development URLs.
4. Run the production release command:

   ```bash
   bun run release:production
   ```

5. After Vercel finishes, verify the exact commit:

   ```bash
   bun run verify:vercel-production -- --commit <sha>
   ```

## What the release command enforces

`bun run release:production` is the normal production path. It refuses to ship
unless the repo is in a release-ready state:

- current branch is `develop` or `production`
- working tree is clean
- no open issue carries the `release-blocker` label (checked before the
  preflight and again right before the push; see [Release blockers](#release-blockers))
- deployment discipline verifier passes
- full local `ci:preflight` passes
- release HEAD is already reachable from the fetched `develop` branch
- deployment impact is summarized before pushing `HEAD` to `origin/production`

The command sets an internal release env var so the pre-push hook can tell a
checked production release apart from an accidental direct push.

## Guardrails

- Direct `git push origin production` is blocked by `.husky/pre-push`.
- Non-production pushes still run the normal `ci:preflight` hook.
- Emergency production pushes require a visible reason:

  ```bash
  ASYM_PRODUCTION_PUSH_BYPASS_REASON="restore previous production deploy" git push origin HEAD:production
  ```

  Use this only for urgent recovery. The normal release command is safer.

## Release blockers

An open issue in `Asymmetric-al/core` labeled `release-blocker` means "do not
release to production until this is closed". Apply the label to the issue to
block releases; close the issue or remove the label to lift the block. Pull
requests and closed issues carrying the label are ignored.

`bun run release:production` checks for blockers twice: right after the branch
and clean-worktree checks (before the slow gates), and again right before the
push, so a label applied during the preflight still stops the release. When
blockers exist it prints each issue's number, title and URL and exits non-zero
without pushing. The logic lives in `scripts/release/release-blockers.mjs`.

The check fails closed. It refuses the release when it cannot prove there are
zero blockers: `gh` missing or not authenticated, a network, API or pagination
error, a timeout, unparseable output, or a missing `release-blocker` label.

- **Auth:** the check uses your existing `gh` CLI login. Run `gh auth status`
  before releasing. The repo holds no token and the script never reads one.
- **Dry runs:** `--dry-run` is gated the same way and refuses while a blocker is
  open.
- **No override:** there is no override flag or variable. The only way past a
  blocker is to close the issue or remove the label, both visible in the issue
  timeline.
- **Emergency push:** a direct push with `ASYM_PRODUCTION_PUSH_BYPASS_REASON`
  (see [Guardrails](#guardrails)) is not gated by release blockers. It stays a
  recovery path that does not depend on the GitHub API.

If the label is ever deleted, every release refuses until a maintainer recreates
it:

```bash
gh label create release-blocker --repo Asymmetric-al/core --color B60205 --description "Open issue blocks bun run release:production until closed"
```

## Deployment cost rules

- Do not debug by pushing repeated fix commits to `production`.
- Keep app-only changes app-local when possible so ignored-build gating can skip
  unaffected projects.
- Shared runtime/build changes intentionally build all three projects.
- Run `bun run verify:deployment-discipline` after changing Vercel config,
  branch protection, GitHub workflows, or release scripts.
- Run `bun run verify:vercel-build-controls` after changing Vercel monorepo
  build controls, affected-project settings, or app `vercel.json` commands.
- `vercel promote` is not the build-cost escape hatch for this repo's first
  release model. Use Git-based releases for now; evaluate
  `vercel build --prod` plus `vercel deploy --prebuilt --prod` later if Build
  CPU remains the dominant cost.

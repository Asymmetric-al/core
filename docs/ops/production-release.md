# Production Release Guide

Use this guide when shipping the Asymmetric.al platform to production. The goal
is to keep production releases deliberate and keep Vercel build usage inside the
plan by avoiding debug loops on the production branch.

## Standard path

1. Do local implementation work on a non-production branch.
2. Merge or push validated work to `develop` for staging.
3. Verify staging behavior on the staging URLs.
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

- current branch is `develop` or `epic`
- working tree is clean
- deployment discipline verifier passes
- Git attribution verifier passes
- full local `ci:preflight` passes
- deployment impact is summarized before pushing `HEAD` to `origin/epic`

The command sets an internal release env var so the pre-push hook can tell a
checked production release apart from an accidental direct push.

## Guardrails

- Direct `git push origin epic` is blocked by `.husky/pre-push`.
- Non-production pushes still run the normal `ci:preflight` hook.
- Emergency production pushes require a visible reason:

  ```bash
  ASYM_PRODUCTION_PUSH_BYPASS_REASON="restore previous production deploy" git push origin HEAD:epic
  ```

  Use this only for urgent recovery. The normal release command is safer.

## Deployment cost rules

- Do not debug by pushing repeated fix commits to `epic`.
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

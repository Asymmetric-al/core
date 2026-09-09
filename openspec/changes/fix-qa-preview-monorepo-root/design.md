# QA preview design

## Context

Vercel's admin, donor and missionary projects were inspected on September 9, 2026. Their configured roots are apps/admin, apps/donor and apps/missionary. The existing GitHub Actions token is active and scoped to the correct team.

## Decisions

Run each deployment from the monorepo root, with its existing project ID. Vercel applies the configured application root once. Use `--archive=tgz` because an actual root upload was rejected at 16,094 files against a 15,000-item API limit. Do not remove repository source to fit that limit. Vercel documents archive upload for this case: https://vercel.com/docs/cli/deploy#archive.

## Risks and verification

Archive upload may reduce incremental upload caching. Verify the corrected command reaches an actual preview build, then retain any independent build or runtime failure. This change does not alter existing branch-specific deployment policy or claim full hosted application health.

## Rollback

Revert the workflow commands. No data or configuration migration.

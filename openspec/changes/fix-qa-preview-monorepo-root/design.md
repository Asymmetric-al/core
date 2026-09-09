# QA preview design

## Context

Vercel's admin, donor and missionary projects were inspected on September 9, 2026. Their configured roots are apps/admin, apps/donor and apps/missionary. The existing GitHub Actions token is active and scoped to the correct team.

## Decisions

Run each deployment from the monorepo root, with its existing project ID. Vercel applies the configured application root once. Use `--archive=tgz` because an actual root upload was rejected at 16,094 files against a 15,000-item API limit. Do not remove repository source to fit that limit. Vercel documents archive upload for this case: https://vercel.com/docs/cli/deploy#archive.

## Risks and verification

Archive upload may reduce incremental upload caching. Verify the corrected command reaches an actual preview build, then retain any independent build or runtime failure. This change does not alter existing branch-specific deployment policy or claim full hosted application health.

## Rollback

Revert the workflow commands. No data or configuration migration.

## Recorded validation

The workflow correction at `8e15e8c7a116776bbda037ef2d8961dfeaad16bc` passed 14 focused workflow/scope tests, strict OpenSpec validation and full `bun run ci:preflight`, including all application builds and 3,846 unit tests (four existing skips). Pre-commit and pre-push hooks passed. Both required GitHub gates passed. PR #1562 retains the correction for human review.

Actual authenticated CLI checks used the separate auth candidate `12e2d1dc` in the same monorepo. The app-directory command failed at `apps/admin/apps/admin`; repository-root upload hit the 15,000-file limit; root plus `--archive=tgz` created deployment `dpl_9uBySL96tcspbR7fnmgVeGbf3CYf` and extracted 16,076 files. The hosted build then failed in existing Core Eve sandbox prewarm with `governance_unavailable`. This verifies upload progress, not hosted application success. No governance bypass or skip-prewarm option was used.

The failed prewarm left one temporary sandbox running. Its exact recorded session was stopped and independently listed as stopped. No production alias, credential rotation, purchase or model call occurred. The failed deployment record remains available as evidence. Resolving Core Eve's hosted governance/bootstrap behavior is separate from this upload correction.

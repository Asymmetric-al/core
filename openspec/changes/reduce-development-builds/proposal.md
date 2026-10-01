# Reduce development builds (AL-1921)

## Why

Routine development currently compiles all three apps during PR checks, repeats compilation after merges, and triggers metered Vercel deployments. Blake approved prioritizing development feedback and minimal spend over continuous full release builds.

## What Changes

- Routine development PRs retain correctness gates; dependency/build configuration changes compile affected apps.
- Merges into develop do not automatically compile or deploy apps.
- Explicit QA previews build on GitHub and upload prebuilt output; production keeps full checks.
- Local preflight follows the same policy, with an explicit full QA/release mode.
- Superseded PR CI runs are canceled. Existing required correctness checks remain present.

## Capabilities

### New Capabilities

- `development-build-policy`: conditional compilation and explicit QA checkpoints.

### Modified Capabilities

None.

## Impact

CI workflows, Vercel branch gates, preflight and release scripts, contract tests, and development documentation. Development URLs remain on the last successful deployment until explicitly refreshed. Roll back by reverting this change; no data/schema changes or credential/branch-protection mutations are required.

# Design

## Decisions

Use one tested compilation selector for GitHub CI and local preflight. Production and explicit manual CI require all apps; routine develop PRs compile only dependency/build inputs; develop pushes select no compilation. Missing diff context requires full compilation. The existing ci-gate accepts a skipped build only after a successful no-build plan and successful correctness checks.

Vercel Git gating enables production only. Explicit QA requests preserve existing draft/fork/label safeguards, preview targets, exact PR commit, and sanitized smoke reporting. Compile Vercel-compatible output on the standard GitHub runner and upload with --prebuilt. Keep downloaded environment and build output transient and out of artifacts/logs. Preserve Node Functions and artifact-only Eve build mode.

The release entrypoint explicitly selects full preflight, including when invoked from develop. Required migration and smoke jobs continue running. Instant-navigation compilation runs only for production or explicit QA/manual integration checks.

## Compatibility and rollout

No GitHub branch-protection weakening is needed: existing required contexts continue reporting. Update verifier and preflight contracts with the new desired policy. Merge the PR to activate the source-controlled branch gates. No automatic production deployment is requested.

## Validation

Test policy selection, fail-closed gate behavior, local mode selection, release full-mode wiring, and prebuilt preview sequencing. Run focused contract tests, full unit suite, formatting, lint/type checking, and OpenSpec validation. Vercel-compatible preview building requires a subsequent explicit QA request with existing protected credentials; do not fabricate a hosted build success.

# Issue #2066 — acceptance checklist (reviewer / CI, not fully automated)

Spec: [rev 2 comment](https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304) (approved by Blake, 2026-10-20 7:01 PM PT).

Engineering addendum: [Samson's rulings](https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306633299) (2026-10-20 7:40 PM PT).

Automated acceptance tests in this directory cover DC1–DC7 and the DC8 grep over
this directory. The items below are checked on the implementation PR.

## Minimal test seam (spec §2)

- [ ] The PR description calls out the seam (exported `main` or thin adapter) as the only production-code change.
- [ ] The seam matches the contract in `command-harness.ts`: `runDocumentCutoverCommand(deps)` or `main(deps)` with `deps = { argv, env, detectors?, store? }`, resolving to the exit code; importing the module does not run the command.
- [ ] Addendum item 1: importing the module triggers no detector call, no store write and no change to `process.exitCode` (automated in `no-mutation.acceptance.test.ts`).
- [ ] `bun run cutover:assess:documents` still runs the command when invoked as a script.

## Addendum items 2 and 3

- [ ] DC6 for `failure.message`, `inventoryFindings` and `detectorQuery` is narrowed by [addendum 2](https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306731198): the tests cover only what the existing `redactDiagnosticText()` (`packages/api/src/document-cutover/redaction.ts`) already does in `failure.message`: emails, credential values keyed by `bearer`/`token`/`key`/`secret`/`password`, and query strings. `inventoryFindings` and `detectorQuery` are not redacted today and are not asserted. Everything else (plain-text names, card numbers, bare tokens) is #2162. Reviewers should not ask this PR to change the redactor.
- [ ] `--help` exits 0, calls no detector and records no proof, and is the only exit-0 path that is not a verified clean proof (automated in `command-adapter.acceptance.test.ts` and `no-mutation.acceptance.test.ts`).

## DC8 — reviewer grep over the Builder's new test files

- [ ] Every new test file added by the PR (outside this directory) has no literal `3600000`, `86400000`, `60 * 60 * 1000`, `24 * 60 * 60 * 1000`, `var/document-cutover-proofs`, `FileDocumentCutoverProofStore`, `--approver`, `--allow-non-production-project` or `DOCUMENT_CUTOVER_NON_PRODUCTION_PROJECTS`, and no demo-tenant allowlist or seed manifest.
- [ ] No new test asserts the non-production classification override either way (Resolved decision 2).

## DC9 — runner and credentials

- [ ] `bun run test:unit` passes locally and in the PR's `test-unit` CI job, including every file in this directory.
- [ ] No change to the `vitest.config.ts` `include` list and no new CI job.
- [ ] No test reads a production credential, starts a Supabase stack, or connects to Postgres (all detectors are injected or run against a mocked client).
- [ ] `#2067 verify-env-mismatch` is present as `it.fails` (not skipped) and is reported as an expected failure in the CI run.

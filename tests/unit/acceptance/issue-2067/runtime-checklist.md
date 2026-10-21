# Issue #2067 — acceptance checklist (reviewer / CI, not fully automated)

Spec: [rev 2 comment](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453) (approved by Blake, 2026-10-20 7:01 PM PT), plus [Scope's addendum](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306190263) pinning the allowlist path to `docs/ops/document-cutover/allowlist.json`, plus [spec addendum 2](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306634165) (Samson's engineering rulings, 2026-10-20 7:40 PM PT: allowlist schema, digest rule, schema version from the migrations table, loopback is `non_production`, names/messages).

The automated acceptance tests in this directory cover DC1–DC12. The items below are checked on the implementation PR.

## Dependency on #2066

- [ ] The #2066 acceptance suite (`tests/unit/acceptance/issue-2066/`) and its minimal test seam are on the PR's base. This suite drives the command through that seam.
- [ ] #2066's `#2067 verify-env-mismatch` case is flipped from `it.fails` to `it` and passes (DC8). That flip is the only edit allowed to #2066's acceptance files.

## DC13 — runners and credentials

- [ ] `bun run test:unit` and `bun run typecheck` pass locally and in CI, including every file in this directory and in `tests/unit/acceptance/issue-2066/`.
- [ ] No test uses production credentials or real donor data. Every key in these tests is an obviously fake value, and every Supabase client is the fake from `fake-supabase.ts`, except the DC4 subprocess, which targets an unroutable loopback port.

## Spec items not enforced by code (check on the PR)

- [ ] `.gitignore` no longer carries the old local proof-store entry, and nothing under `docs/ops/document-cutover/proofs/` is ignored (the ignore part is automated).
- [ ] The committed `docs/ops/document-cutover/allowlist.json` has exactly `{ "owners": [{ "id", "role" }], "nonProductionProjects": [ ... ] }` (no other keys; automated by `readAllowlist()`). Per [addendum 3](https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306730671), `nonProductionProjects` entries are unique, non-empty plain strings, and the command's loader rejects objects, empty strings and duplicates (automated in `allowlist-schema.acceptance.test.ts`, which mocks `node:fs` and never writes an allowlist file).
- [ ] The command reads the allowlist through `node:fs` during each run, not through a static JSON import or a value cached at import time; `allowlist-schema.acceptance.test.ts` relies on this.
- [ ] Addendum 3 item 2: proof field names other than `digest`, `recordedBy` and `proofPath` follow these tests (`proofId`, `recordedAt`, `outcome`, `evidence[]`, `environment.*`). If the non-production list is empty, the positive DC11 case is skipped by design; confirm that is intended.
- [ ] The PR does not check Blake's approving review through the GitHub API (that is #961), adds no bypass flag or policy engine, and leaves AC1/AC4/AC5/AC6/AC10 semantics unchanged.
- [ ] Process rule (not enforced by `--verify`): the proof PR is approved and merged within 24h of `recordedAt`.
- [ ] Enabling "require code owner review" is a separate repo-settings change for Blake. It is not part of this PR.

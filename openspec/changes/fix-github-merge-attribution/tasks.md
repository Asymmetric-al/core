## 1. Reconcile accepted upstream authority

- [x] 1.1 Verify PR #1428 is merged at e811fc9f and compare its canonical workflow
      with the earlier branch implementation.
- [x] 1.2 Adopt the merged verifier, registry, hooks, CI proof, and contributor
      documentation; keep identity and authentication configuration unchanged.
- [x] 1.3 Remove superseded helper tests and current claims that the broader
      workflow is still proposed; retain useful parser and sanitization coverage.

## 2. Residual parser hardening

- [x] 2.1 Reproduce default-port and malformed-target failures against the merged
      parser, including original-path normalization and SSH compatibility.
- [x] 2.2 Implement the smallest shared-parser correction and preserve credential
      isolation at pre-push and provider-query boundaries.
- [x] 2.3 Pass focused attribution, outgoing-history, pre-push, and workflow
      contract suites without weakening identity or signature policy.

## 3. Acceptance

- [x] 3.1 Pass focused lint, formatting, and strict OpenSpec validation.
- [ ] 3.2 Pass complete root preflight after reconciliation.
- [ ] 3.3 Publish the resulting branch and verify current-head CI under legitimate
      authenticated identity proof; keep the change active until accepted merge.

## Historical evidence

Before the canonical team workflow merged, this branch's narrow hosted-merge
repair passed its local gates. The September 22 parser/provenance suite passed
90 tests. Those counts describe the superseded implementation, not validation of
the reconciled policy. Current evidence belongs below and in the lint change's
verification record; no historical passing check waives the new CI proof rules.

## Reconciliation evidence — 2026-09-23

The merge of e811fc9f into checkpoint 817a83b resolved the two expected conflicts
by adopting the upstream verifier and policy document. The verifier, CI workflow,
pre-push hook and coordinator remain byte-identical to the incoming canonical
versions. The identity registry differs only in its shared remote parser; no
identity record, authentication configuration, Git history or remote state was
changed. The obsolete 59-test hosted-helper suite was removed with its replaced
implementation.

The targeted RED run against the unchanged merged parser produced 13 expected
failures and 19 passes. It reproduced default-port rejection and malformed path
acceptance, including a query credential copied into the pre-push repository
slug. After the correction, the following focused command passed 271 tests
across 14 files:

```bash
bunx --no-install vitest run tests/unit/scripts/git-attribution tests/unit/scripts/pre-push.test.ts tests/unit/scripts/ci-preflight.contract.test.ts tests/unit/scripts/local-gates.contract.test.ts tests/unit/script-verifiers.test.ts --maxWorkers=2
```

This includes merged actor/signature, forbidden-identity, provider-response,
shallow-history, inherited-history, stale-tip, first-parent and replacement-object
regressions, plus parser, pre-push and workflow contracts. Supported forms retain
SCP and SSH URLs, case-insensitive hosts and default ports. Invalid original
paths fail without normalized-path or encoded-path acceptance.

`bun run verify:git-attribution` passed locally with the unchanged Blake tuple
and checked the two locally outgoing commits 817a83b and 9ae61719. This is local
proof only; it does not establish matching GitHub CI actor or signer proof.
`node --check scripts/git/trusted-identities.mjs` and focused test-file ESLint
with `--max-warnings 0` passed. The repository intentionally ignores this `.mjs`
script in ESLint, so no script ESLint coverage is claimed. Focused formatting,
`git diff --check`, and strict validation of this change, the lint change, and
the merged team-workflow change passed. Full preflight and published-head CI
remain root-task acceptance work.

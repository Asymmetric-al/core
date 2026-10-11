# D7 scoped current-source checks

Run 2026-10-10 at Core `225c02e9499bd6c0d493223cd4b1a4120ff787e3`:
**10 tests passed across four files**. The adjacent JSON report preserves results.

- Four existing CRM identity tests keep identities, money and the retired provider
  distinct.
- One existing command-log test covers current actor/tenant attribution and
  selected secret-key redaction; it is not proof of transactional D7 history or
  comprehensive privacy classification.
- Four existing CRM query tests check current lifecycle-filter/cursor behavior,
  not P27 closed-work filtering.
- One new counterexample calls the actual
  `recordCorrectionApprovalOutcome` helper twice with the same already-decided
  request and distinct controlled clocks. Its task `completed_at` changes to the
  retry time. This contradicts treating its comment's no-op claim as immutable
  completion evidence. Storage is a synthetic dependency; no live table or donor
  was changed. It does not claim D7 has shipped or that every source history is
  mutable.

The current correction-request route can call that helper again for the same
decision; exact citations are in [implementation evidence](../implementation.md).
The D7 prevention is a durable authoritative closure receipt and timestamp that
retries do not rewrite, not copying this helper as a closure command.

Reproduce from the root:

```sh
node node_modules/vitest/vitest.mjs run --config docs/features/donor-development/grill/d7-evidence/source-probe/vitest.config.mjs --reporter=json --outputFile=docs/features/donor-development/grill/d7-evidence/source-probe/results.json
```

This is a scoped evidence harness with the repository's test-only environment
and setup. Runtime remains Node **24.19.0** and installed Vitest **4.1.4**; Bun
is unavailable and the manifest declares Vitest **5.0.3**. The D6 attempt at the
normal repository config failed on an installed Sentry `./config` export; it
was not rerun or repaired for this documentation task. No full-CI, browser,
accessibility, network, live Supabase or D7 implementation pass is claimed.
Earlier D6 checks are prior evidence, not counted as fresh D7 tests.

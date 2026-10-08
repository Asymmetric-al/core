# ReUI stack review — 2026-10-08

This follow-up reviews PRs #1970–#1973 against `develop` at
`21e861c4453bb09778dc8448f78b518d8e702233`. Starting tips were `1decf564a`,
`d8cf325d2`, `dd90c89c2` and `41cdce7ce`. All were conflict-free with passing CI,
but unresolved review conversations blocked three PRs. Original captures retain
their historical scope.

During review, `develop` advanced to
`289c16317eee9807dfcebb412a20ebccbcfcd012`. Its nine documentation changes were
reviewed and merged through all four branches before final preflight. No runtime,
dependency or CI-policy changes were introduced by that base update.

The later approved dependency upgrade in PR #1969 advanced `develop` to
`a7b216d141c17ea2d7f9514fdb28ce4db6f4fb68`. All four stack branches integrate
that source and its API migrations. The records below describe the earlier
dependency epoch; [new-cohort qualification](./new-cohort/README.md) records
fresh checks, captures, reviewed merge resolutions and publication equivalence.
Historical source and image hashes remain unchanged.

## Corrections

- Readiness rejects protected-tree case aliases, inconsistent directory
  spellings in bundles and Core references, credentials leaking from indented
  TOML tables, unusable registry file metadata, and monolithic `radix-ui`.
  Scratch-only staging, credential redaction and Pro access remain intact.
- Canonical guidance uses current Filters signatures and actual shared Number
  Field exports/labeling. Generated mirrors were synchronized and verified.
- Email preview has a centralized fixed-light canvas; deployment progress uses
  existing media tokens; the board restores viewport height and its minimum.
  Exported HTML, sandboxing, data, callbacks, engines and scroll ownership remain.
- The shared-ledger link is clickable. OpenSpec task 4.1 remains open: historical
  Next.js 16.3.8 captures do not complete integrated Next.js 16.4 application
  screenshot verification.

Independent [standards](./standards-review.md), [specification](./spec-review.md)
and [readiness](./readiness-review.md) reviews record their scopes separately.
No additional concrete P0/P1 application regression or scope expansion was found.
A History-column hypothesis was withdrawn after checking the actual controls.

The initial review changed three hash fields for two reviewed source paths. [The proof update](./reviewed-proof-updates.json)
preserves classifications, tests, mappings, coverage and thresholds. Fixes are
forwarded through the existing stack with ordinary merges, preserving prior work.
Recorded source tips identify local validated commits. GitHub publication through
the connected app creates equivalent commits with different identities; exact
tree and source hashes establish their correspondence.

## Verification and limits

[Initial local preflight](./local-preflight.json) passed all 17 stages on the
integrated source, including all three Next.js 16.4 production builds and coverage
with 6,839 unit tests passed and four intentional skips. Motion validation
passed. Token drift is a report-only inventory, not a pass/fail gate.
[Published source equivalence](./publication-equivalence.json)
records exact tree matches and the preserved rebased remote parents. Later
evidence-only metadata receives targeted formatting and source/image checks.

[Final integrated preflight](./final-preflight.json), including the additional
readiness safeguards, again passed all 17 stages: 6,850 unit tests passed, four
intentional skips, all three application build gates passed. Application inputs
are unchanged, so the second run legitimately reused the successful Next.js 16.4
builds. [Final publication equivalence](./final-publication-equivalence.json)
records exact source-tree matches. Hosted results are checked at these later
heads independently of the initial passing CI.

[Readiness](./readiness-verification.json): six suites, 90 tests passed, including
32 refresh and 31 readiness cases; executable fixes have RED/GREEN evidence.
All six live checks passed, including authenticated MCP Pro entitlement and paid
source retrieval. Scoped lint, formatting, mirror nonmutation, syntax and strict
OpenSpec checks passed.

The [additional readiness review](./readiness-follow-up.json) corrected stale
playbook authentication/registry guidance, disabled Codex server acceptance and
unreviewed canonical-manifest acceptance. All 101 focused tests across six suites
and six live Pro checks passed; independent review found no remaining P0/P1 in
the eight-file follow-up. Dated legacy manifests remain supported. The refreshed
verification requires reviewed provenance before any live request.

Fresh shared comments were [reviewed with evidence](./standards-review.md): the
sole settings consumer constructs channel headers and controls from the same
list, with six existing tests passed; the MIT notice remains byte-identical to
its recorded upstream source. Neither warrants a shared-contract migration or
notice reformatting.

The [eight existing component browser suites](./component-check.json) passed all
62 checks on the integrated follow-up source under the preceding dependencies.
Application visual qualification remains separately scoped.

[Browser evidence](./shared-verification.json): 14 matching before/after states,
28 images, exact source/image hashes, zero after page errors. Email contrast is
21:1; progress contrast is 11.17:1 dark and 6.57:1 light for the measured backdrop.
Board heights are 524/500/1,080px for viewports 844/800/1,400px tall. Preview
payload/tabs/mobile width and keyboard create/edit payloads are preserved. Eight
existing tests, scoped lint, format and both affected package typechecks passed.

These actual-component fixtures use labelled synthetic task inputs, inert Next
Image/Link boundaries and canonical public configuration. External images were
blocked: their fallbacks do not qualify photo loading or every photographic
backdrop. These 28 images are separate from the original 638 captures and do not
qualify Next.js application, authenticated provider or production workflows.
[Original provider limitations](../verification.md) remain explicit.

Local results do not infer hosted success at later tips. Current merge/CI status
is reported separately on the four PRs. No merge or deployment was performed.

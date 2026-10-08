# Qualification after the approved dependency upgrade

PR #1969 advanced `develop` to
`a7b216d141c17ea2d7f9514fdb28ce4db6f4fb68` during the stack review. The four
branches preserve that approved migration and Core's Base UI 1.8.0 / exact
`base-maia` configuration. [Integration records](./integration.json) identify
the source tips, installed versions, source hashes and diagnostic hashes.

## Reviewed merge and compatibility corrections

- Chart content retains Recharts 3 types, key fallbacks and legend order, plus
  Core's zero/null handling and geometry. DataGrid retains the accepted manual
  filtering, sorting and pagination flags alongside accessible toolbar/header
  composition. ReactionBar and task columns retain the upstream accessible
  names; the board keeps its restored viewport height and minimum.
- Donor History retains its existing bindings, semantic styling and mobile
  actions, with the accepted numeric tooltip guard.
- Two new stack tests remove the retired table row-model helper and option.
  Their fixtures, stable identities, callbacks and assertions remain intact.
  The inherited grid test now distinguishes its accessible header from data
  rows, checks all 15 records and checks the actual one-record search result.
  Each incompatible setup or assertion was observed failing before correction.
- Vitest guidance and generated mirrors describe the installed 5.0.3 harness
  and current raw V8 coverage limitations. Vendor provenance remains unchanged.
- Reviewed source fingerprints follow the merged sources and an actual shadcn
  preview. Classifications, coverage, thresholds, source mappings and policies
  are unchanged. The approved adapter patch retains its significant context
  whitespace and exact upstream blob.

Independent [shared](./shared-cohort-merged-review.md),
[application](./app-cohort-integration-review.md),
[cross-app](./second-develop-cross-app-review.md) and
[CI integration](./second-develop-integration-review.md) reviews state their
scopes. [Shared results](./shared-cohort-merge-results.json) and
[proof changes](./new-cohort-shadscan-proof-updates.json) give exact evidence.

The initial focused readiness run passed 117 tests across eight suites, and all
six live checks passed, including authenticated MCP Pro entitlement and paid
Base UI source retrieval. Three guidance suites passed 46 tests. Compatibility
checks passed for floating actions, complete grid rows and search, Support Hub
selection, contribution identities, History actions and preference save behavior.

The [initial full preflight](./initial-preflight.json) passed its 16 preceding
stages and all three fresh app builds, then exposed five unit failures. Four
were genuine concurrent CMS draft requests after the FormApi upgrade. Native
submit guards now consult live pending state before calling `handleSubmit`;
the tests await the repeat-submit action and keep their exact one-request,
payload, error and retry assertions. Explicit task count/label names preserve
the original styled-browser names across test and browser layouts.

[Pending-submission verification](./pending-submission-verification.json)
records 22 passing tests, scoped lint/typecheck and normal hooks. Independent
[implementation](./app-pending-names-review.md) and
[correctness](./shared-pending-submission-review.md) reviews found no remaining
blocker. These five production changes receive a separate final full preflight;
the earlier failed result is retained.

A final review found that a transport rejecting `null` or `undefined` was
masked by a TypeError in error reporting. The optional-chaining guard preserves
the original diagnostic and credential redaction. Both selected public-seam
regressions failed before the fix; the complete 44-test readiness suite then
passed, including existing transport and redaction checks.
[Nullable-transport verification](./readiness-nullish-verification.json)
records the exact source, diagnostic hashes and normal commit checks.

[Final full preflight](./final-preflight.json) passed all 17 stages at the
integrated source including that follow-up: 871 unit files and 6,958 tests
passed, with two files and four tests intentionally skipped. All three app
build gates passed using their valid unchanged-source caches. The initial run
freshly built all three apps; the [preceding successful full run](./pre-nullish-preflight.json)
rebuilt admin and missionary after the CMS/task fixes.
[Final source publication equivalence](./publication-equivalence.json) records
exact tree matches and preserved remote/prerequisite parents; the
[preceding publication](./pre-nullish-publication-equivalence.json) remains
explicitly historical. Evidence-only metadata receives scoped formatting and
integrity verification after this runtime gate.

[Component browser checks](./component-check.json) passed all 62 assertions
across eight unchanged suites with the matching Playwright 1.64 Chromium 156
browser. [Fresh shared captures](./shared-verification.json) passed all 14
light/dark and narrow/wide states with zero page errors. Six representative
pairs were visually reviewed against the historical before images, preserving
hierarchy and layout while retaining the three reviewed improvements.

Measured email text contrast is 21:1. Progress contrast is 6.575:1 in light and
11.1654:1 in dark for the measured backdrop. Board heights remain 524/500/1,080px
at viewport heights 844/800/1,400px; horizontal containment, keyboard creation
and editing payloads, preview tabs and mobile width remain correct. Historical
comparisons use the explicitly identified earlier source/dependency epoch.

Representative current captures:

| Surface         | Narrow                                 | Wide                                             |
| --------------- | -------------------------------------- | ------------------------------------------------ |
| Email, dark     | [390px](./after/email-dark-narrow.png) | [1280px](./after/email-dark-wide.png)            |
| Progress, light | [390px](./after/home-light-narrow.png) | [1280px](./after/home-light-wide.png)            |
| Board, dark     | [390px](./after/board-dark-narrow.png) | [1280px, tall](./after/board-dark-wide-tall.png) |

## Evidence boundaries

The earlier 638 application captures and 28 review captures retain their
original source/dependency epochs. New component-fixture verification remains
separate from Next.js application and authenticated-provider qualification.
OpenSpec task 4.1 remains open. Synthetic component inputs and inert Next
Image/Link adapters do not qualify business data, auth, external photographs,
production operations or every possible backdrop.

Token drift is report-only: its zero exit code does not enforce a gate or prove
the absence of raw palette usage. The current inventory reports 275 findings
across 726 scanned files. Design-system lint, Shadscan, reviewed shadcn source
contracts and motion validation remain enabled.

Hosted checks and merge state must be checked on the final published heads.
No merge, deployment, policy waiver or force push is performed by this review.

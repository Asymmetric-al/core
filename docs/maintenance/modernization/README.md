# Repository modernization ledger

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Approved scope, compatibility decisions and acceptance live in
[the active OpenSpec change](../../../openspec/changes/complete-repository-modernization/proposal.md),
[design](../../../openspec/changes/complete-repository-modernization/design.md)
and [tasks](../../../openspec/changes/complete-repository-modernization/tasks.md).

This campaign is **in progress**. Targets are research inputs until exact-version
qualification, current-head CI/review, deployed-preview checks and merge readback
are linked. Production execution is outside delivery. An old hold is not a closed
finding. Each item must close as upgraded, replaced, removed, or a verified
maintained compatibility dependency with a current upstream reason and owner.

## Coverage

- [Dependency inventory](dependencies.json): 134 inventoried external/imported identities, including 130 current
  canonical identities across 23 active manifests (18 workspace/root manifests
  plus five imported PDF packages). Baseline and current declarations retain
  alias names and every imported-package consumer. Internal workspace links are
  recorded separately. Four baseline legacy Dnd identities remain as replacement history and
  separately owned CMS compatibility records. The supported V8 provider and public Payload Sharp
  transformer were introduced after baseline;
  all five private PDF identities point to their owner source and artifact
  manifests rather than a public-registry lookup.
- Locked graph, advisory reachability, overrides/patches, imported artifacts,
  CLI/MCP/Action/image/protocol pins, skills and documentation findings still
  require their complete owned evidence and closure records.
- OpenSpec PR #2172 is merged and reconciled. Self-hosted CI PR #2160
  remains open; reconcile its owned changes before duplicating them. OpenSpec
  #2172 merged as
  `5cf4855dc322eafcccfeca0dd528695ae72832d9` and is incorporated into the
  security checkpoint; #2160 remains a draft owned by its existing branch.

The [owner exclusions](owner-exclusions.json) record the user-requested skip of
the unexecuted, read-only hosted-development Supabase CLI `config diff`
check. This is a check exclusion; it does not waive a vulnerability or authorize
production operations.

## Baseline

Starting develop: `800213405e2c51e07180e86ee8322355e0fdb4eb`.
An untouched isolated WSL checkout passes full preflight, including all three
app builds. Frozen Bun 1.4.3 installation passes. Baseline unit suite: 886 files and 7,179 tests passed, four tests and two
files skipped, one expected failure. Shadscan 0.17.0: pooled 48/100; admin 43,
donor 61, missionary 47. Existing floors remain binding.

## Checkpoints

| Checkpoint             | Exact initial target                                            | Status                          | Qualification                                                                                   |
| ---------------------- | --------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Framework security     | Next family 16.4.2, React/DOM 19.3.1, Node 24.22.1, Bun 1.4.3   | Merged                          | [Checkpoint record](framework-security.md)                                                      |
| Tools / infrastructure | Supported ESLint 10, current tools and reproducible executables | Merged                          | [Tooling record](development-tools.md); [infrastructure record](runtime-infrastructure.md)      |
| Data / workflows / API | Current supported cohorts, GraphQL 17 product / 16 CMS boundary | Merged; post-merge CI passed    | [Data](data-access.md), [GraphQL](graphql.md), [workflows](workflows.md)                        |
| Payload                | Public 4.0.0-beta.3 coherent cohort                             | Merged; production cutover open | [Migration, restore, browser and unit evidence](payload.md)                                     |
| PDF source / artifacts | Current coordinated 0.1.0 artifacts                             | Merged; post-merge CI passed    | [Source, import and verification](pdf-packages.md)                                              |
| UI utilities           | Six direct libraries and four compatible leaves                 | Merged; post-merge CI passed    | [UI release readback](ui-utilities-release-readback.json); [behavior evidence](ui-utilities.md) |
| UI / telemetry / AI    | Remaining families and pre-call governance                      | Pending                         | [Dnd migration](dnd-kit.md); remaining provider and combined qualification required             |
| Payments / legal       | Stripe 23 / Endive; OpenPolicy current + owned Terms            | Pending                         | Sandbox drain/abort and document equality required                                              |
| Nested security / docs | Complete graph, owned exceptions, current active instructions   | Pending                         | Final SBOM/manual reconciliation required                                                       |
| Combined release       | All merged exact versions                                       | Pending                         | Clean install, deployed previews and immutable production package required                      |

The [data access](data-access.md), [product GraphQL](graphql.md) and
[workflow](workflows.md) implementations have merged through their qualified
family PRs. Their earlier committed local records remain dated evidence; the
current merge, CI and preview readbacks are reconciled into the next checkpoint.
The [Payload record](payload.md) retains dated migration, restore and browser
evidence. [Core PR #2185](https://github.com/Asymmetric-al/core/pull/2185) merged
as `c4d36cb029121641b8882237632d0d6da434049e` after full gates, current-head
review/CI and all three deployed previews passed; both post-merge workflows
passed. Shared-development cutover, strict-TLS fallback retirement and the final
production release package remain separate open work.

The [PDF checkpoint](pdf-packages.md) supersedes historical PDF alias and
installation-repair workarounds in dated data-access evidence. Inventory `uses`
retain the baseline; `currentUses` reflects checked-out consuming declarations.
Owner-only build metadata is inventoried separately from Core-installed software.

The [six-library UI release](ui-utilities-release-readback.json) merged through
[PR #2190](https://github.com/Asymmetric-al/core/pull/2190) as
`e29b7c4f4f2e30cab456f7a047944c2998477dca` from qualified head
`3e33a371356bea237d16eaa52209ed57f6a8d23f`. All required PR checks and three
exact-head hosted smoke projects passed. The source-bound post-merge readback
records both Main CI and CI Integration success. This
checkpoint does not close the wider UI or modernization campaign.

The [Dnd API migration](dnd-kit.md) tracks the first-party replacement. Its
recorded local gates remain dated prior-base evidence. Full browser requalification
on the merged UI base passed 299 cases with 5 existing skips. Prepush,
PR/current-head CI/review, hosted previews
and merge remain open. The Payload beta.3 checkpoint remains
dated qualified evidence; newly published beta.4 requires coherent owner
requalification before the combined release freeze.

The [observability and content SDK checkpoint](observability-content-sdks.md)
updates Sentry, sanitization, Resend and browser Stripe.js, while retaining
current React Stripe. Local evidence and remaining publication/provider checks
are bounded in its qualification record; the wider task 7.2 remains open.

The [current qualification of the SDK stack](observability-content-sdks-integration-qualification.json)
records fresh focused tests/types/lint/wiring and strict Doctor/Shadscan checks
on the intended Dnd/Skill50/SDK candidate. The active SDK guide routes to that
successor while retaining the original a45 proofs. Actual develop integration,
full gates, CI, previews, publication and provider and release qualification remain open.

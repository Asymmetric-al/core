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

- [Dependency inventory](dependencies.json): all 130 current canonical external
  and imported identities across 23 active manifests (18 workspace/root manifests
  plus five imported PDF packages). Baseline and current declarations retain
  alias names and every imported-package consumer. Internal workspace links are
  recorded separately. The supported V8 provider and public Payload Sharp
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

| Checkpoint             | Exact initial target                                            | Status                                  | Qualification                                                                              |
| ---------------------- | --------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| Framework security     | Next family 16.4.2, React/DOM 19.3.1, Node 24.22.1, Bun 1.4.3   | Merged                                  | [Checkpoint record](framework-security.md)                                                 |
| Tools / infrastructure | Supported ESLint 10, current tools and reproducible executables | Merged                                  | [Tooling record](development-tools.md); [infrastructure record](runtime-infrastructure.md) |
| Data / workflows / API | Current supported cohorts, GraphQL 17 product / 16 CMS boundary | Merged; post-merge CI passed            | [Data](data-access.md), [GraphQL](graphql.md), [workflows](workflows.md)                   |
| Payload                | Public 4.0.0-beta.3 coherent cohort                             | Implemented; release qualification open | [Migration, restore, browser and unit evidence](payload.md)                                |
| PDF source / artifacts | Recover shipped Phase 47, then modernize in owner repository    | Pending                                 | Source provenance and baseline required                                                    |
| UI / telemetry / AI    | Current compatible families and pre-call governance             | Pending                                 | Behavior/provider checks required                                                          |
| Payments / legal       | Stripe 23 / Endive; OpenPolicy current + owned Terms            | Pending                                 | Sandbox drain/abort and document equality required                                         |
| Nested security / docs | Complete graph, owned exceptions, current active instructions   | Pending                                 | Final SBOM/manual reconciliation required                                                  |
| Combined release       | All merged exact versions                                       | Pending                                 | Clean install, deployed previews and immutable production package required                 |

The [data access](data-access.md), [product GraphQL](graphql.md) and
[workflow](workflows.md) implementations have merged through their qualified
family PRs. Their earlier committed local records remain dated evidence; the
current merge, CI and preview readbacks are reconciled into the next checkpoint.
The [Payload record](payload.md) tracks its migration, restore and actual browser
qualification while complete gates, current-base review and deployed previews remain open.

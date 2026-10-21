# AL-2170 verification evidence

## Reviewed upgrade

OpenSpec 1.14.3 was the published stable release at review. The CLI and all
seven selected skills use the exact v1.14.3 tag at commit
`c794978f4f8845ce59693373c9dd882ee776588c`. The scoped refresh retained Core
overlays, Bun permissions and provenance, then regenerated all mirrors.

The lock retains every pre-existing non-OpenSpec package record and isolates
the reviewed CLI's 56 dependency records. A frozen Bun CI install passed.

## Preservation and focused verification

- Strict validation: 33 durable specs and 42 active changes, all 75 passed.
- Archive audit: all 46 archived changes passed.
- Effective deltas: checked before and after every individual closeout with
  no writes or ignored material warnings; Phase24 authority also passed.
- OpenSpec doctor: healthy local root, no store or reference diagnostics.
- Workflow Studio: all six generated views match their canonical records.
- New regression selection: 39 tests passed across pin/provenance, projection
  merger, binding sections, delta compatibility and refresh transactions.
- Lifecycle source review: 202 focused acceptance tests and eighteen additional
  executable Next.js architecture tests passed.
- Independent content review reconstructed all 1,418 original requirement
  identities, 3,965 scenarios and 505 relocated bodies without loss. It also
  checked all 39 requirements across sixteen spec files in the fourteen new
  archives against their final durable counterparts.

Actual red/green regressions cover wrapper-permission loss, fenced overlay
placement, dropped Purpose/source guidance, discarded delta warnings, omitted,
misspelled, conditional, commented and fenced bindings, exact semantic
whitespace, missing anchors and companion symlink escapes. Check mode and
repeat refresh remain non-mutating and stable.

## Shadscan evidence review

The task baseline and floor are 48/100. The full working-tree scan remains
48/100, with admin43, donor61 and missionary47, preserving existing app floors.
The CLI dev-pin edit changes the root manifest's evidence digest. Review proved
that this was its sole manifest change and that the root remains a workspace
library/tooling owner. Only the eight existing root-library applicability
proofs were refreshed. No rule, finding, fingerprint, rationale, classification,
application source or score floor changed. The repository guard passed after
that targeted proof review.

## PR qualification

Full local `bun run ci:preflight` passed, including formatting, mirrors, owning
generators, OpenSpec, lint, boundary/workspace/lock/UI guardrails, all fifteen
type-check tasks, all three application builds and the full unit suite. The unit
result was 887 passing files, two skipped files, 7,121 passing tests, one expected
failure and four skipped tests. Separate archive audit and Workflow Studio
generation checks also passed.

Exact published-head checks/review reconciliation are recorded in the pull
request after publication. This evidence does not claim
hosted/provider qualification, production activation, or an accepted merge of
this maintenance change. Its OpenSpec change remains active until merge.

# P24-01 — Issue-specific acceptance

Acceptance revision: **p24-01-v2**, approved 2026-10-04.

Blake explicitly approved repository-only contract-check proof for P24-01:
deterministic favorable, adverse, retry and recovery evidence with a CI manifest
bound to the exact tested candidate SHA and contract input identity. The
coordinator relayed that owner approval on 2026-10-04. This amendment resolves
this documentation-validator ticket's tracer proof; it does not remove the
broader Phase 24 requirement for real staff/donor/public HTTP journeys or imply
runtime implementation, database/provider qualification, activation or release.

All original P24-01 authority, exact target, predecessor exclusion, deterministic
validation, completeness, read-only, concurrency, path-confinement and versioned
ownership requirements remain in force. The approved sets remain D1–D18 and
D57–D84, US24-001–US24-120, 73 concrete proof IDs and 18 release IDs. Conflicting
#479/#482/#485–#487 clauses remain excluded; compatible #480 Money and #482
fail-closed/no-Payload contracts remain permitted. Manual-only story validation
is insufficient. The validator remains an offline CI dependency, never product
runtime authority.

## Repository-only proof mode

Use the existing strict local runner:

```bash
node scripts/cms/run-local-e2e.mjs --phase24-contract-check
node scripts/cms/run-local-e2e.mjs --phase24-contract-check --candidate-sha <full-HEAD-SHA>
```

Mode selection precedes runtime imports and environment loading. The special
mode uses repository contracts, Node built-ins and read-only Git identity
checks. It requires no browser, applications, Payload, database, provider or
runtime environment. Normal strict HTTP execution keeps its existing role.

The runner derives actual HEAD from the checkout containing the executed proof
code. Optional `--candidate-sha` asserts that identity; it cannot override it.
Dirty tracked contract inputs or executed proof code and inconsistent supplied
SHAs fail closed. Code from one checkout cannot be labeled with another
checkout's commit. Internal adverse/recovery fixtures are disposable copies;
the canonical checkout and standalone validator remain side-effect-free.

Successful stdout is a stable JSON manifest with schemaVersion 1,
acceptanceRevision `p24-01-v2`, mode `phase24-contract-check`, actual candidateSha,
source inputIdentity, runtimeProof false, outcome passed and evidence containing
actual validator results:

- **favorable:** approved source graph is valid with empty diagnostics.
- **adverse:** one unresolved scenario in a disposable copy is invalid and
  identifies its owning US24-119 row and actionable target.
- **retry:** first and second evaluation of identical adverse bytes agree.
- **recovery:** restored bytes are valid with the favorable input identity.

An invalid source or failed check exits nonzero and emits versioned JSON with
outcome failed and actionable diagnostics. No passing artifact is produced for
a failed proof. Output excludes secrets, timestamps, random identifiers, process
IDs and absolute scratch paths. Repeated/concurrent runs are deterministic;
ordinary success/failure removes internal scratch copies.

## CI binding and acceptance evidence

Preserve the existing merge-ref integrity job. Capture this proof from a
separate checkout of the exact PR head SHA, or the actual push/workflow HEAD as
applicable. Supply that SHA as the assertion and publish the stdout artifact
after success. A default PR merge-ref checkout cannot be relabeled as PR head.

Public-seam tests require clean dependency-free fixture success, real validator
input identity, meaningful adverse/retry/recovery results, repeat/concurrent
stability, no source mutation, rejection of inconsistent SHA and dirty inputs
or executed proof code, and failure for committed invalid contract bytes. The
proof establishes repository graph closure for T24-TRACE/US24-119 only.

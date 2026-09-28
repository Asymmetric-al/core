# Complete the skill catalog integration

## Why

The open catalog successors contain overlapping refresh work, but copying an
older tree into a newer PR omitted later repairs. The current integration must
retain the complete intended catalog while preserving Core-owned instruction
boundaries and recovering safely from filesystem failures.

## What Changes

- Preserve the reviewed Ask Matt and Cursor babysit adapters and restore the
  fail-closed Git hook before generating all runtime mirrors.
- Keep explicit-only discovery specific to the requested skill and platform;
  a greeting-only upstream section must not stall an existing concrete task.
- Use existing Core UI owners in composition, toast, class utility, state and
  motion guidance. Preserve the mobile-web distinction between controls and
  selectable content.
- Treat canonical trees, companion files and lock metadata as one source-group
  refresh transaction. Retain complete recovery data until publication succeeds,
  attempt every rollback, and fail any invocation after incomplete recovery.
- Escape embedded eval data before placing it inside a script element; keep
  scanner markers syntactically valid in code examples and share one annotator.
- Preserve Core's pinned Stripe client and payment-method allowlists in imported
  guidance without changing product payment code or dependency versions.
- Preserve the independently reviewed Eve shared-context correction from #1862:
  schema-validated `relatedClaimIds` are not content to redact. Continue scanning
  all actual content, provenance and evidence and enforcing visible related-claim
  scope. Reject payment-number content even when it has a UUID-shaped value.
- Preserve binary skill assets through Git filters; binary attributes must take
  precedence over mirror-wide text normalization.
- Carry forward the catalog's reviewed obsolete-file removals and regenerate
  mirrors from canonical sources and the persistent Core adapters.

## Impact

This change owns instruction sources, refresh/sync tooling and their tests,
plus the narrow Eve validation correction and its regression tests.
It does not revive retired attribution gates, alter app dependencies, grant
credential-write authority, or change the frozen initial Emil integration
proposal. Eve's UUID correction has scoped review and RED/GREEN tests; it does
not introduce a general UUID-string exemption.

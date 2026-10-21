## 1. Ground the operational setup

- [x] 1.1 Recheck repository authority, implemented Stripe boundaries, canonical destination, and current official product documentation.
- [x] 1.2 Finish the runbook and non-secret source/status record, including costs, additional-source requirements, and connection-specific stopping behavior.

## 2. Make verification repeatable

- [x] 2.1 Use red-green tests to implement bounded read-only verification for target, source, schema, private access, and known-fixture evidence.
- [x] 2.2 Run focused tests, applicable repository checks, strict OpenSpec validation, and delta compatibility; prove the diff adds no application consumers or Core database changes.

## 3. Observe the provider connection when access permits

- [ ] 3.1 Inspect existing pipelines, authorize only the intended sandbox, and record the actual source, schema, selected tables, pipeline identity, and dashboard cost estimate.
- [ ] 3.2 Verify hosted ownership/privacy and a known preexisting synthetic object's backfill.
- [ ] 3.3 Observe a subsequent benign synthetic customer change within a bounded documented latency window.
- [ ] 3.4 When a second independently authorized source is available, verify supported separate-schema setup and known-object separation in both directions.

Provider authorization, configuration, backfill, ongoing sync, and second-source
proof remain pending until actual evidence is recorded. A mock test is not provider proof.

Repository evidence (2026-10-21): focused Vitest 5 suite passed 46 tests;
`bun run ci:preflight` passed, including all three app builds, 87 strict OpenSpec
items, delta compatibility, and 7,060 unit tests (4 skipped). Read-only hosted
catalog and PostgREST configuration checks passed; no managed schema existed.
One identified sandbox source and a metadata-only synthetic customer were
prepared. Native Dashboard state and all ingestion evidence remain pending.

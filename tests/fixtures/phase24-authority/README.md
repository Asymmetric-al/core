# Phase 24 public CLI fixtures

`mutations.json` contains independent invalid examples against the ratified
Markdown contract. Each example names its normative row, cell, and literal
invalid value. Expected identifiers come from the original issue and source
contracts, not validator output.

The CLI tests copy repository-owned documentation inputs into disposable local
directories and mutate only those copies. They use the actual Node CLI without
private-helper mocks, credentials, browser runtimes, or database/provider access.
All fixture directories are removed by the test harness.

Catalog structure-specific manual-only classification and unknown-version
mutations will be added once the new catalog's public schema is declared.
Product HTTP tracer checks require the coordinator's pending scope resolution.

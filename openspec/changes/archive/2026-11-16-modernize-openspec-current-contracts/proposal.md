## Why

Core's OpenSpec CLI and imported workflows lag the current stable release.
Current validation passes despite incomplete lifecycle reconciliation, refresh
permission loss, and generated ownership text that does not survive merging.
AL-2170 updates the tooling while preserving accepted domain contracts.

## What Changes

- Upgrade the exactly pinned CLI and seven selected upstream skills together.
- Preserve Core overlays and Bun permissions through the actual refresh path.
- Preserve canonical source ownership and complete contracts through projection,
  delta validation, synchronization, and archive.
- Adapt requirement presentation to current strict validation without deleting
  normative clauses, identifiers, scenarios, or unresolved owner gates.
- Reconcile every completed-change candidate individually using implementation,
  merge ancestry, later amendments, and applicable qualification evidence.
- Record actual publication/merge facts without claiming unproved acceptance.
- Verify the complete changed surface and prepare a current-head mergeable PR.

## Capabilities

### New Capabilities

- `openspec-contract-maintenance`: reproducible tooling and skill upgrades,
  contract-preserving validation, and evidence-based lifecycle reconciliation.

### Modified Capabilities

Existing product capabilities retain their normative meaning. Presentation-only
restructuring and synchronization of already accepted amendments do not authorize
new product behavior. This change records the maintenance invariants separately.

## Impact

Affected paths include `package.json`, `bun.lock`, the skill refresh/sync
pipeline, OpenSpec validation tests, canonical projection generators, current
OpenSpec artifacts, and generated skill mirrors. Existing authoring declarations
and dated provenance remain authoritative.

No product feature implementation, schema/data mutation, credential changes,
Stores, custom schemas, or wholesale instruction regeneration is included.
The canonical checkout's local work and running processes remain in place;
implementation uses an isolated Ubuntu-24.04 WSL worktree.

Rollback is a revert of this reviewed maintenance packet and dependency lock.
Completed-change reconciliation must retain a trace of its source and disposition.

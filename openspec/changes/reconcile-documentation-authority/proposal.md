# Reconcile documentation authority

## Why

AL-1861 follows Conrad's 2026-09-16 instruction to update Core to credible
current decisions and terminology and retire Twenty CRM. Accepted owner rulings,
durable specs, old feature contexts and newer phase PRs have drifted apart.

## What Changes

- Consolidate ratified Phase 22–26 planning packages with exact source provenance.
- Synchronize accepted CRM retirement and compact-router intent.
- Reconcile legacy contribution terminology/approval defaults and Phase 6/17 ownership.
- Repair active delta applicability, archive criteria and ambiguous ADR references.
- Document semantic authority, writable sources, generated projections and status.
- Include the user-approved PR #1428 workflow prerequisite at `4e2c014afdbea1a2679f71ff3e9f385f6bf755a2`, preserving its existing commits and separate OpenSpec scope.

## Capabilities

### Modified Capabilities

- `agent-instruction-system`: owner-based document authority and generated sources.

### New Capabilities

None. The imported active product changes retain their own capability scope.

## Impact

Documentation, deterministic documentation verification and the existing team
attribution workflow prerequisite. No product feature implementation, provider
mutation, schema migration or activation.
Rollback is the focused documentation/tooling diff; preserve original source
packets and capture hashes. The P22–26 planning source PRs are not merged or
closed by this work. The separately approved PR #1428 prerequisite is included
as existing ancestry, not rewritten or represented as already merged upstream.

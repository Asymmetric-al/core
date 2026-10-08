# ADR-0216: Non-destructive, source-governed replayable donor merge

**Status:** Accepted (Phase 4 A9/G2; Phase 7/9/13/16/18/19 owner amendments).

This records accepted target intent for AL-504, not installed storage,
implementation, qualified Undo or activation evidence.

## Context

Duplicate donor records require deliberate cleanup. Moving every reference or
rewriting issued documents to the survivor confuses current identity with who
legally gave or originally owned a commitment. A useful Undo must preserve
replayable evidence while respecting later source revisions and restrictions.

## Decision

Staff deliberately select same-Tenant duplicates and compose a surviving golden
record field by field. Consent combines to the most restrictive state, including
later restrictions. Keep a `merged_into_donor_id` tombstone and replayable
`merge_operations` evidence for admitted choices, before/after revisions,
mutable repairs and audit. These are target integration decisions, not a claim
that their schema is installed.

Repair only source-approved mutable identity/CRM references. Frozen contribution
and gift-time legal-donor facts, issued receipt/statement facts and exact document
artifacts, posted accounting rows, original commitment-owner snapshots and
provenance remain unchanged. The complete posted-financial-row immutability
floor in ADR-0206 applies; identity merge cannot rewrite historical money truth.
Issued legal donor resolves from canonical frozen source facts, never a live
survivor lookup; no prototype receipt runtime is extended or retained.

A proven same-real-world Party repair may change a current canonical Party
reference only when that owner permits it. For commitments the immutable original
owner snapshot and merge provenance remain. A genuine owner transfer requires
supersession and fresh Party intent/collection authority under the source owner;
it is never a merge consequence and cannot cross Tenants.

Replayable Undo is a governed operation, not an unconditional inverse. It checks
current source revisions and policy, preserves later consent/security restrictions,
and rejects unsafe restoration rather than blindly replaying old pointers.
Unknown references block unsafe repair or purge. An explicit warned shell purge
is available only after a complete source census proves the shell unneeded and
no authoritative reference depends on it. Purge forfeits Undo while retaining
required audit, lineage and frozen history; it never deletes money/documents.

## Trade-offs and rejected alternatives

- **Irreversible merge as the default:** rejected because mistaken duplicate
  decisions need a real recovery path. Explicit completeness-gated unneeded shell
  purge retains a bounded permanent option with its loss of Undo made clear.
- **Destructive history deletion or blanket reattribution:** rejected because
  current identity composition cannot revise gift-time legal, financial,
  document or original commitment facts.
- **Automatic or cross-Tenant merge:** rejected because match confidence is not
  human judgment or same-Tenant source authority.
- **Unconditional inverse Undo:** rejected because later source changes and
  restrictions may make the earlier state unsafe or obsolete.

Per-source census, replay evidence and conflict handling cost more than pointer
replacement. They keep identity repair accountable without making Undo a
historical-authority override.

## Consequences

Future implementation must prove source-approved repairs, frozen-fact invariance,
restrictive consent, source-revision conflicts, later-restriction-safe Undo and
unknown-reference/purge denial. Qualification must distinguish current Party
repair from genuine owner transfer. This record builds no later Party domain,
receipt service, financial correction or privacy/redaction seam.

## Related contracts

- [AL-504 documentation scope](https://github.com/Asymmetric-al/core/issues/504)
- [Current Phase 4 owner PRD](../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md)
- [Phase 25 identity contract](../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/identity.md)
- [Active foundation requirements](../../openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md)
- [Documentation and future implementation tasks](../../openspec/changes/sitestacker-parity/tasks.md#6-phase-4-durable-language--al-504)
- [ADR identity registry](registry.md)
- [Current merge-service tracker AL-512](https://github.com/Asymmetric-al/core/issues/512)
- [Immutable posted financial facts](0206-immutable-posted-financial-facts-and-owner-operational-state.md)

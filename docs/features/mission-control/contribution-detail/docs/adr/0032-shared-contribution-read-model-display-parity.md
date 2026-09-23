# ADR-CD-032: Mission Control CRM and Contributions render the same contribution data

**Status:** Accepted (grill session 2026-05-29)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Mission Control has multiple staff surfaces for the same gift: Contributions Hub and CRM donor gift history. These are not separate systems that need to sync with each other. They read from the same underlying database and should display the same effective contribution data.

The product goal is display parity, not an internal replication or sync workflow.

## Decision

When a correction changes contribution data, Contributions Hub and CRM donor gift history read and display the same updated effective values from the shared database.

Modern practice requirements:

- There is no internal Contributions-to-CRM copy job, queue, pending status, retry task, or escalation.
- CRM donor gift history must query the same effective contribution read model as Contribution Hub/detail for shared fields.
- Shared fields must use one backend contract or shared mapping so labels, amounts, designation summaries, receipt state, correction state, and Phase 13 posting state do not drift between surfaces.
- Existing CRM gift-history row fields should migrate or adapter-map into the shared contribution row contract for overlapping fields.
- CRM donor gift history may show fewer columns than Contributions Hub, and Hub may show operational columns CRM does not need. Any overlapping field must still share the same value, label, formatting, status vocabulary, and effective-state rules.
- Do not reimplement shared field derivation separately in CRM and Hub components. If a field needs different presentation density, derive that presentation from the same shared value.
- Shared filters must use the same backend definitions where contribution state overlaps. CRM can expose fewer filters, but filters such as receipt affected, pending correction, approval state, refund state, Phase 13 posting state, designation issue, recurring gift link, and payment status must mean the same thing across surfaces.
- After a correction succeeds, both Hub and CRM surfaces should show the updated values on normal refetch/cache invalidation from the shared database.
- If a surface shows stale data because of client cache, that is a UI freshness/cache issue, not a CRM data-transfer issue.
- Audit remains attached to the source correction/posting itself, not to a fake internal sync operation.
- External downstream systems, if any, are separate concerns from internal Mission Control CRM display parity.

## Consequences

- Staff see the same contribution values whether they enter from CRM or Contributions Hub.
- Implementation should consolidate read-model logic instead of adding background synchronization.
- The PRD should include shared-row migration/adaptation as an implementation constraint and acceptance criterion, without requiring a step-by-step migration plan.
- The PRD should call out internal display parity as an invariant.
- The PRD should include product-level acceptance tests for display parity, shared filter meaning, and shared query refresh after corrections.

## Alternatives rejected

- **Internal CRM replication workflow:** Adds unnecessary complexity between two surfaces backed by the same database.
- **Separate CRM-specific contribution values:** Creates drift and confusion.
- **Manual update/retry between Hub and CRM:** Treats one database as if it were two systems.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0032-shared-contribution-read-model-display-parity.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.

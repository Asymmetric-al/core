# ADR-CD-011: Designation lines are compact by default and expandable for context

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Multiple designations per gift are first-class and equal. Each designation line must show enough financial truth to reconcile the gift, but giving-destination context can be extensive: missionary/family context, project purpose, campaign goal/dates/progress, donor memo evidence, legal restrictions, and correction history.

## Decision

Contribution detail shows designation lines as equal compact rows by default, with expandable details per line.

Default row:

- Amount and currency
- Fund name
- Fund type
- Fund ID/reference

Expanded line detail:

- Missionary/family context for missionary funds
- Project purpose/context for project funds
- Related campaign effort/attribution context, separate from the giving destination and its money measure
- Donor memo evidence
- Legal/accounting restriction when present
- Line-level correction state and audit references

## Consequences

- The UI can scale to multi-designation gifts without implying a primary line.
- Detail APIs need fund subtype metadata and line-level correction/audit metadata.
- Compact list summaries may be derived, but full detail must preserve equal treatment.

## Alternatives rejected

- **Fund name only:** Too little context for staff to verify donor intent.
- **Rich card for every line by default:** Too noisy for gifts with multiple designations.
- **Separate designation tab:** Risks hiding financial truth behind navigation.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0011-expandable-designation-line-context.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.

# ADR-CD-008: Multiple designations are first-class and equal

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Contribution detail must show donor, fund, missionary, and designation context. Existing tables already include `staged_gift_allocations`, which supports multiple allocation rows for one staged gift. The May 2026 branch code collapsed detail into a single `designation` object, which would hide donor intent for split gifts.

The product owner clarified that all designations should be treated equally and presented as such. Multiple designations per gift are a first-class feature.

## Decision

Contribution detail treats the gift's complete designation set as financial truth:

- A gift can have multiple designations.
- No designation is primary by default.
- All designation lines are shown with equal visual and semantic weight.
- The detail UI must not hide split designations behind technical details or audit-only views.
- The designation set must reconcile to the effective gift amount.
- Designation corrections operate on the designation/allocation set, not on a single top-level fund or missionary field.

## Consequences

- Detail APIs need to return designation lines, not one `designation` object.
- Existing grid/list summaries may derive compact labels, but contribution detail must expose the full equal set.
- Receipt, native CRM projection, reporting, audit, and correction workflows must consume the designation set intentionally.
- Existing code that patches `donations.fund_id` / `donations.missionary_id` for designation changes is not the target product model.

## Alternatives rejected

- **Primary designation plus hidden splits:** Misrepresents donor intent and makes split gifts feel secondary.
- **Technical-only allocation view:** Too easy for staff to miss financial truth.
- **Single designation on donation row:** Inadequate for split giving and correction workflows.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0008-multiple-designations-first-class-equal.md) preserves earlier wording and
rationale. Current owner terminology was amended on 2026-09-16; it is not
backdated into the original founder ruling or evidence of runtime activation.

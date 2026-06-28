# ADR-CD-008: Multiple designations are first-class and equal

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail must show donor, fund, missionary, and designation context. Existing tables already include `staged_gift_allocations`, which supports multiple allocation rows for one staged gift. Current branch code still collapses detail into a single `designation` object, which would hide donor intent for split gifts.

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
- Receipt, CRM post, reporting, audit, and correction workflows must consume the designation set intentionally.
- Existing code that patches `donations.fund_id` / `donations.missionary_id` for designation changes is not the target product model.

## Alternatives rejected

- **Primary designation plus hidden splits:** Misrepresents donor intent and makes split gifts feel secondary.
- **Technical-only allocation view:** Too easy for staff to miss financial truth.
- **Single designation on donation row:** Inadequate for split giving and correction workflows.

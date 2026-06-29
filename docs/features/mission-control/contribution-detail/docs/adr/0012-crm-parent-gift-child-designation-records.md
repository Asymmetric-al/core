# ADR-CD-012: CRM posting uses parent gift plus child designation records

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail treats one donation as one gift identity, while multiple designations per gift are first-class and equal. CRM posting must preserve both facts: staff should see one donor gift, but every designation line must remain explicit for attribution, reporting, and correction.

## Decision

CRM posting uses a parent/child model:

- One CRM parent gift record represents the donation/gift.
- Each designation line posts as a child designation/allocation record under that parent.
- Contribution detail shows CRM post status for the parent and for each child designation record.
- Failures can be parent-level or line-level.
- Retry actions should target the failed scope.
- If a CRM adapter cannot support child designation records, the adapter limitation must be surfaced.
- Later decision ADR-CD-032 clarifies that Mission Control CRM donor history and Contributions Hub read shared database-backed contribution data; there is no internal sync process between those surfaces.

## Consequences

- The CRM link model needs to distinguish parent gift links from child designation links.
- Detail APIs need parent and line-level CRM post state.
- Staff can resolve and retry line-specific CRM/Twenty post failures without reposting unrelated designation lines.
- CRM summaries can still show one gift, but must not collapse or lose designation detail.

## Alternatives rejected

- **One CRM record per donation only:** Hides multi-designation truth unless overstuffed into notes/fields.
- **One CRM record per designation only:** Makes one donor gift look like multiple gifts.
- **Tenant-configurable summary vs line posting:** Too much variation for a core financial contract; adapter limitations should be explicit instead.

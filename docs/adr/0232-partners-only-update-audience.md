# ADR-0232: A partners-only update is readable by donors whose record follows that missionary

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
The rule itself is the plan section 15.1 default ("a donor whose record follows
that missionary"), taken under the implementation record (D-08), not a fresh
owner ruling. The owner may still choose another audience.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

`posts.visibility` can mark an update partners-only, but nothing defines who may
read one: the donor feed returns public posts and the author's own (audit NR-21).
The signed-in media path needs the same answer, because an image on a
partners-only update must be served only to someone who may read the update.

## Decision

1. **A partners-only update is readable by a donor whose donor record follows
   that missionary** (`public.follows`), within the update's tenant, under that
   donor's own donor assignment. It adds that reader to those the update's other
   read policies already admit, such as its author; it widens nothing else.
2. **The rule is written once, as a read policy on `posts`.** The donor feed and
   the signed-in media path both rest on it; neither restates it.
3. **Visibility is read on each request.** Changing an update's visibility needs
   no write to its media uses, and a donor who stops following loses access at the
   next request.

## Consequences

- An image on a partners-only update is served only on the signed-in path, to a
  caller whose token can read the update (ADR-0231).
- Email to followers when an update is approved is deferred with the
  communication history model; until then partners see updates in the portal.

## Source

- [Plan, section 6.6](../audits/core-crm-cms-database-target-architecture.md#66-publishing-preview-versions-and-media)
  ("Media delivery") and [section 15.1](../audits/core-crm-cms-database-target-architecture.md#151-decisions-that-belong-to-the-owner)
- Work package WP7
- Related: [ADR-0230](0230-missionary-updates-and-profile-content-are-operational.md),
  [ADR-0231](0231-core-media-custody-and-derived-live-use.md)

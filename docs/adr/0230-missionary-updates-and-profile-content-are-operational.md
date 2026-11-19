# ADR-0230: Missionary updates and self-edited profile content are operational records, not CMS documents

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
Two choices inside it are plan section 15.1 defaults taken under the
implementation record (D-07, D-08), not fresh owner rulings: a missionary edits
story, photo and display name; and posts published before WP7 start as approved.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Payload's prototype has `ministry-updates` and `missionary-profiles`
collections, while missionaries write updates in the missionary app, which may
not import Payload. Review state and authorship are operational facts, and the
accepted surfaces contract has the public page render the missionary's approved
content through Core's public projection. The plan's decision 4 (section 11.2)
settled ownership, with the seat that had proposed Payload agreeing in
cross-review.

## Decision

1. **Missionary updates are rows in `public.posts` with a review state:** draft,
   in review, published, withdrawn. The missionary drafts and withdraws; a
   reviewer approves or withdraws, through commands. The erase command marks an
   erased worker's updates withdrawn.
2. **A missionary's own story, photo and display name are revision rows on the
   ministry assignment in Core,** held as a candidate revision and an approved
   revision, written from the missionary workspace through commands and reviewed
   under the same tenant rule as updates. They are not copied into `cms`. A
   missionary page is a staff-authored frame that renders the approved revision
   through Core's public projection.
3. **The tenant's review rule is a publication policy in Core:** one row per
   missionary content path (update, profile), either review required or
   automatic, changed by a tenant administrator. With no row, review is required.
   Under automatic, the submit command marks the update or revision approved in
   the same transaction and writes its media uses as an approval does.
4. **Review capabilities.** Approving needs `updates.review`, which every staff
   sub-role holds by default; the author cannot approve their own, and rejecting
   needs a reason. The author may withdraw their own; a reviewer needs
   `updates.review` and a reason to withdraw someone else's.
5. **Payload drops `ministry-updates` and `missionary-profiles`.** Staff-authored
   pages are not a policy path: the tenant's control over pages is the publishing
   capability.

## Consequences

- The donor feed and the public update block read approved rows through Core,
  read on the caller's token on every request; the feed's minutes-long cache goes,
  because a SQL command cannot expire it (WP7).
- An approved operational revision or update is a live media use (ADR-0231).
- A restriction marks the subject's approved profile revision withdrawn; a lift
  restores nothing without a fresh approval (ADR-0119 amendment of 2026-11-17).
- Who may read a partners-only update is ADR-0232. Email to followers when an
  update is approved is deferred with the communication history model.

## Source

- [Plan, section 4](../audits/core-crm-cms-database-target-architecture.md#4-ownership-map),
  [section 6.4](../audits/core-crm-cms-database-target-architecture.md#64-references-to-operational-records),
  [section 6.6](../audits/core-crm-cms-database-target-architecture.md#66-publishing-preview-versions-and-media)
  and decision 4 in [section 11.3](../audits/core-crm-cms-database-target-architecture.md#113-reasoning-on-the-decisions-that-mattered-most)
- Work package WP7
- Related: [ADR-0029](0029-reference-not-copy-cms-operational.md),
  [ADR-0229](0229-per-page-releases-and-two-publish-commands.md),
  [ADR-0232](0232-partners-only-update-audience.md)

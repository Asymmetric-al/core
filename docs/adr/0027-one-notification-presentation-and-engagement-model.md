# ADR-0027: One notification presentation and engagement model

**Status:** Accepted (founder ruling, Phase 17 grill session — D8)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D8).

## Context

System events must sometimes attract attention inside the product even when
email is unavailable or unnecessary. Treating an in-product notification as a
copy of an email or as a new task/business record would create contradictory
truth, duplicate state, and role leaks across Mission Control, Donor Portal,
and Missionary Workspace.

## Decision

The platform owns one Asym/Postgres notification item, grouping, and engagement
model. A notification is a role-safe attention projection over a source-owned
event; it is never the source record, task, workflow, communication delivery
receipt, or business-completion truth.

Availability, presentation, engagement, and source state remain separate:

- the producer decides whether the event is currently relevant and supplies a
  typed, tenant-bound projection;
- Phase 17 resolves the immutable presentation contract and creates or groups
  the item for an exact tenant, Party, role, and surface;
- the viewer may mark an item seen, read or unread, and archived or restored
  under the canonical engagement vocabulary; and
- source resolution or reversal is represented from the producer and is never
  inferred from notification engagement.

Phase 17 launches the full staff bell/inbox and only contextual donor or
missionary notification views required by Live contracts. Broad donor and
missionary notification-center information architecture remains Phases 25 and 28. Email and in-product steps are independently authorized; one channel's
failure or engagement does not silently complete the other.

Every Live in-product step selects exactly one of two code-owned presentation
policies plus one exact source-applicability/end rule:

- `presentation.source_actionable_then_recent_90d@1` keeps current required work
  in **Needs attention** and **All** even after read, omits archive while the
  source remains actionable, then preserves authorized non-unread recent history
  for 90 days after the once-set source-owned presentation end; and
- `presentation.information_30d_then_recent_90d@1` is **All**-only, ends unread
  treatment by the earliest read/archive/correction or day 30, and leaves
  user-facing recent history at day 90.

Active attention, recent user-facing presentation, and durable body-free Phase 6
audit are distinct. Access loss removes active and recent presentation
immediately. Source resolution before first view creates no unread debt and no
fabricated read. Engagement, tenant configuration, worker delay, grouping, retry,
or a later authority assignment cannot extend or revive an old item. A new
meaningful source transition creates a new item and may reopen the group.

## Consequences

- Notification rows and APIs require exact tenant/Party/role predicates and
  server-side source-visibility reproof.
- Grouping reduces noise but preserves item-level provenance and actionable
  state transitions.
- Permission loss, source restriction, Party merge, role change, and tenant
  transfer revoke visibility without rewriting audit evidence.
- The seven initial Live in-product keys declare their exact policy and source-
  end rule in the executable manifest; any future key must do the same. This is
  two policies and key-specific predicates, not a generic retention/rules engine.
- Query paths enforce presentation ceilings before purge completion; purge
  removes preview/search material while independently governed body-free audit
  remains.
- Accessibility, keyboard, screen-reader, non-color state, mobile, pagination,
  grouping, race, and isolation tests are release blockers.

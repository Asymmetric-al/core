# ADR-0121: Tenant-chosen Public Content Review & Release Profile Versions

**Status:** Accepted (founder ruling, Phase 22 grill session - D4)

## Context

Missionary-managed page revisions and Ministry Updates need two legitimate
tenant operating models: staff review before release or contributor-initiated
release without staff review. A universal manual gate would contradict the
tenant-controlled publication contract, while autosave-to-live, mutable Payload
`_status`, broad administrator bypasses, or approval of a moving draft would
make automatic release unsafe and unauditable.

## Decision

Phase 22 defines one prospective immutable Public Content Review & Release
Profile Version for each exact Tenant, Legal Entity, Site, Page Family,
environment, and publication path. The tenant selects either `Review before
publishing` or `Publish after checks`, with a disclosed manual fallback until
deliberate activation and progressive customization only for the page and
Ministry Update paths it uses.

Autosave remains private. `Submit for review` or `Publish changes` freezes one
immutable Public Content Release Candidate pinned to the exact live base,
normalized content and digest, complete semantic diff and public-egress
manifest, actor and contributor assignment, locale, profile/catalog/renderer
generations, media, feed, safety, reach, and managed dependencies. Manual review
binds an append-only decision to that exact candidate. In automatic mode every
contributor-editable candidate that passes current owning-phase and structural
proof may release without an invented human gate, including a first content
release once staff-owned page, route, reach, profile, and safety setup is valid.

Phase 10 remains authoritative: `allowed` follows the tenant's mode,
`needs_review` follows Phase 10's authorized human-resolution path, and
`blocked` cannot release. Unknown public egress or missing, stale,
contradictory, or unavailable non-substitutable proof creates a cause-owned
exception that ordinary review cannot override.

Both modes invoke the applicable sole idempotent compare-and-swap release
command: D2 for an exact Page candidate and immutable Page Release Manifest, or
D11 for an exact canonical Ministry Update candidate, the deliberately selected
audience, its resulting Audience Release Manifest, and projection head. The command re-proves
current actor/system authority, assignment, profile, safety, reach, target head,
selected Update audience where applicable, compatibility generations, and every
dependency before atomically recording the applicable immutable manifest,
advancing only its owner head, and writing the outbox event. Automatic release
is system execution of the tenant's standing Page or Update Release Authority,
not generic contributor permission or AI judgment.

Payload remains authoring substrate. Its `_status`, Admin UI, REST, GraphQL,
Local API, service role, restore, bulk, and scheduler paths cannot create public
release truth. Restore creates a new candidate, scheduling only wakes the same
current-proofed command, policy changes are prospective, and old review
backlogs never become automatic releases.

## Consequences

- Tenants receive a genuine review/no-review choice without an arbitrary
  workflow builder or hidden high-risk editorial rules.
- Missionaries always distinguish private autosave, submission/checking,
  review, publication, and downstream notification outcomes.
- Staff work in one accessible exception-first review surface; healthy
  automatic releases remain quiet, and one-person tenants are not subjected to
  fictional dual control.
- Every public release is reproducible from immutable candidate, policy,
  semantic/public-egress, authority, safety, dependency, and D2 manifest
  evidence.
- Unknown schema or renderer output blocks its affected release generation;
  staff cannot approve around evidence the product cannot construct.
- Existing mutable Payload publication requires manifest-driven migration and
  one D2 reader-authority cutover without dual write or automatic backlog
  release.

## Later Phase 22 D26 qualification

The existing **Submit for review** or **Publish changes** action atomically
freezes the exact candidate and its actual-actor Public Content Sharing
Attestation. It adds no checkbox, second workflow, or contributor release
authority; every current review, safety, and release proof in this ADR remains
independently required.

## Related decisions

- [ADR-0118 - Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 - Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0120 - Family-certified Public Page Presentation Profile Versions](./0120-family-certified-public-page-presentation-profiles.md)
- [ADR-0122 - Simple public-page review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)

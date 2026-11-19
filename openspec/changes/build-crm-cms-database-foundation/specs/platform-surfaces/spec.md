# Delta for Platform Surfaces

## REMOVED Requirements

### Requirement: GraphQL Is A Shared-Record Surface Adapter

**Reason**: The CRM, CMS and database plan retires the donor GraphQL endpoint in
WP4b. No caller of it was found in application code, it is a parallel surface
that carries its own requirements, and it held the role-mutation escalation that
WP0 closes (audit A01, B02). The retirement rests on the plan section 15.1
default "retire", taken under the implementation record (D-07); it is a default
taken, not a fresh owner ruling. If the owner keeps the endpoint, this removal is
withdrawn and its mutations go through the same commands as every other adapter.
**Migration**: Gift begin, Ministry Update reactions and comments keep their
shared commands and their HTTP adapters (`donation-lifecycle`, "Gift Begin Goes
Through The Gift Intake Begin Command", as amended by this change). WP4b removes
the endpoint, its handler and its approved exception in the data-access boundary
guide in the same change.

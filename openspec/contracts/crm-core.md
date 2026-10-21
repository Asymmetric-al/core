# crm-core normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-291c8bb29216536f619f"></a>

## CRM Stays A Native Mission Control Experience

<!-- BEGIN CONTRACT {"id":"291c8bb29216536f619f","name":"CRM Stays A Native Mission Control Experience"} -->

Mission Control MUST remain the primary staff CRM experience. Staff users
SHOULD work through native Asym screens, tables, actions, reports, and
audit-aware flows. Raw vendor UI MUST NOT become the default Mission Control
CRM product experience.

Donor, missionary, and public surfaces MAY receive role-scoped CRM context
only after later work defines those slices. They MUST NOT expose staff-depth
CRM controls or raw CRM vendor UI.

External projections require separate accepted changes and remain
non-authoritative. They MUST NOT restore Twenty as a product dependency.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-eafa0728ea637894cba3"></a>

## Missionary Partner Detail Preserves Readable Metadata and Controls

<!-- BEGIN CONTRACT {"id":"eafa0728ea637894cba3","name":"Missionary Partner Detail Preserves Readable Metadata and Controls"} -->

The extracted Partners interface MUST display the selected partner type and a
meaningful fallback when location is missing. Icon-only actions MUST have
accessible names. Tag and activity choices MUST expose their current state
through the shared Base UI controls, preserving existing saved tags and the
selected activity kind. The interface MUST use Core semantic theme tokens.
Compact layouts MUST keep the partner identity, header actions, activity choices
and submit control reachable without clipping inside their containers.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-434547cc12041936245c"></a>

## Phase 27 role-qualified staff assignment identity

<!-- BEGIN CONTRACT {"id":"434547cc12041936245c","name":"Phase 27 role-qualified staff assignment identity"} -->

For the staff-assignment family only, active logical identity SHALL distinguish Tenant, exact staff/Party endpoints and role-qualified responsibility. Multiple roles per person/Party and multiple assignees per role remain permitted; duplicate active copies of the same role-qualified edge are forbidden. Preserve shared one-primary behavior independently and historical lineage. Portfolios remain derived. P27 policy consumes P9 authoritative transfer commands; manual/unassigned/unknown provenance stays protected and transfer grants no access.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-75cc9ee164f41ae15950"></a>

## CRM Backing Subsystem Stays Behind Asym Server Boundaries

<!-- BEGIN CONTRACT {"id":"75cc9ee164f41ae15950","name":"CRM Backing Subsystem Stays Behind Asym Server Boundaries"} -->

Asym Postgres MUST stay behind Asym-owned server boundaries whenever it stores
CRM records.

Supabase Auth MUST remain the platform identity and session authority. Mission
Control MUST remain the staff operations shell. Asym-owned finance, CMS, care,
public website, donor portal, missionary workspace, and tenant-control
boundaries MUST NOT move into an external CRM vendor by implication.

All CRM reads and writes MUST pass through server-side Asym contracts, with
`packages/api` as the canonical business boundary. Browser code MUST NOT
receive raw CRM vendor API keys, webhook secrets, or direct vendor credentials.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c5a002a5c382689d7fc2"></a>

## Phase25 Newsletter Requests Do Not Enroll External Subscribers

<!-- BEGIN CONTRACT {"id":"c5a002a5c382689d7fc2","name":"Phase25 Newsletter Requests Do Not Enroll External Subscribers"} -->

Before the Q25 consumer is dispatched, the P32 owner SHALL implement and qualify the exact request-only exclusion already required by EX11–EX16. The request occurrence and supplied contact details SHALL NOT cause automatic external contact/list insertion, subscribe/resubscribe, suppression reset, consent creation or consent/export admission. P23 retains the request occurrence, P17 its finite message purpose and local presentation, and P6 its transport evidence. None of those facts establishes external enrollment or verification. Any later external action requires its own independently qualified owner authority; this extension does not authorize or require the entire future newsletter-synchronization feature.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8745c55fd2728ab246d1"></a>

## CRM Identity Concepts Stay Distinct And Linked

<!-- BEGIN CONTRACT {"id":"8745c55fd2728ab246d1","name":"CRM Identity Concepts Stay Distinct And Linked"} -->

The platform MUST keep source identities distinct and connect them through
tenant-scoped link and merge-candidate records instead of collapsing them into
a single vendor record.

Supabase auth users, Asym profiles, tenant memberships, CRM people, donor
profiles, missionary profiles, CMS public entities, Stripe customers, funds or
projects, pledges or relationship commitments, gifts and their donation records,
payments, receipts, refunds, statements, and reconciliation records MUST remain
separate concepts. A CRM record MAY link to one or more of these concepts —
including a gift-to-CRM link that connects a donation to its CRM record — but
each link MUST preserve the source concept, source id, tenant, confidence,
status, verification state, and repair metadata.

Low-confidence duplicate matches MUST become merge candidates for staff review.
They MUST NOT automatically merge, overwrite, or link records. Cross-tenant
matches MUST be ignored or blocked. CRM schema and metadata changes MUST go
through the server-side path rather than a browser or client toolchain.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

# Phase 9 — Full CRM Depth & Relationship Graph

> **Program:** SiteStacker Parity · **Phase:** 9 · **Status:** Groomed
> (grill-with-docs, 2026-07-06) · **Base:** `develop`
> **Predecessors:** Phase 0 (baseline/governance) · Phase 2 (site/locale/
> currency) · Phase 3 (permission & role-scoped projection) · Phase 4 (identity
> & isolation) · Phase 6 (communication events) · Phase 7 (receipt/statement
> rules + party spine, as amended in §C2) · Phase 8 (soft — socket only)
> **Hard dependencies (must ship first):** Phase 4 tenant-isolation plumbing +
> the A9 merge re-point contract · Phase 7 §D/T4 **as amended in §C2** (the
> party spine). **Phase 8 is a SOFT dependency**: CRM writes are plain Asym
> writes with **no provider gate** (ADR-0001 §4 withdrew `crm_write_gates` as a
> Twenty enabler); the only Phase 8 coupling is the Audit-tab ops-indicator
> socket, whose content the re-groomed Phase 8 (#603, pending) owns.
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`,
> `parity-matrix.md`, `phase-map.md` (row 9)
> **Title:** "Full CRM Depth & Relationship Graph" **ratified 2026-07-06**
> (matches the committed phase-map row; alternates consciously declined).

Modern SiteStacker parity — and the missions-CRM depth beyond it — for the
**operational heart of the platform**: a real party model (people, churches,
organizations, households), a real relationship graph (stored + derived edges
with provenance), and a real record surface (one list engine, one record shell,
one timeline) so that **staff can open a person, church, organization, or
household and see a complete operational record without jumping to
donor-specific pages or spreadsheets — and no legacy donor grid, drawer, or
detail routes remain.** The north star (founder, ratified in D3) is **the best
nonprofit CRM for Christian Missions organizations** — missions-specific
capability (support-raising, sending churches, staff assignment, mobilization
seams) over generic-donor-CRM parity. This is a **fresh-build replacement**
phase (D6: no users exist; no continuity ceremony), built directly on Asym
Postgres (ADR-0001: Twenty retired; see the
[Phase 1 ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)),
inheriting Phase 4 isolation plumbing and the Phase 7 party spine as amended.

---

## Problem Statement

The CRM surface today is a donor-only demo shell on a donor-only schema.
Everything Phase 9 needs — parties, edges, party-keyed engagement, a real list
engine, a real search — is missing or wrong in seven concrete ways:

1. **There is no party model — everything is a donor.** `donors` carries
   free-text `type` (`supabase/migrations/20250101000000_init_schema.sql:75`,
   inconsistent casing), free-text `organization` (`init_schema.sql:88`), and
   free-text `spouse` (`init_schema.sql:92`). A church, a household, or a
   non-donor person has **no record at all** — staff keep them in
   spreadsheets, the exact failure this phase's done-when forbids.

2. **There is no relationship graph.** The only "relationship" in the schema
   is the single assigned-missionary column `donors.missionary_id`
   (`init_schema.sql:66`, FK → `profiles.id`), and the derived support list is
   `buildSupportSummary` with a 100-gift truncation and raw `missionary_id`
   grouping — no typed edges, no roles, no time bounds, no sending-church, no
   family, no board membership.

3. **Engagement data is donor-keyed or fake.** `donor_activities` is a
   tenant-less demo relic (`init_schema.sql:222-235`); notes are a scalar
   `donors.notes` previewed in the detail service
   (`packages/api/src/admin/crm/detail/service.ts:464`); the timeline is an
   in-memory, unpaginated merge inside the monolithic detail service
   (`detail/service.ts:414-442`). A church or household has no table to hang a
   note on.

4. **The list/search engine is a demo shell.** List search is unindexed
   `ilike '%term%'` OR-chains (`packages/api/src/admin/crm/service.ts:73`);
   `escapeSearchValue` silently strips `% ( ) ,` from terms
   (`service.ts:33-35`); cursor tie-break values are comma-mutated before
   string interpolation (`service.ts:99`), so keyset boundaries can skip or
   duplicate rows; list state is client-only (no shareable URLs); the global
   Cmd-K is the shadcn-studio `SearchDialog` with **hardcoded fake results**
   (`apps/admin/app/mc-shell.tsx:36,347`); and the virtualized container is
   hardcoded to 720px (`apps/admin/app/crm/page-client.tsx:412`).

5. **Record detail is a Twenty-era monolith.** The donor-only detail service
   still carries `reconciliation.crmWriteMode` (`detail/service.ts:487`) and a
   "queued note placeholder" (`notes/model.ts` `buildQueuedCrmNoteRow`) for a
   provider that ADR-0001 retired; tabs have no shared read contract.

6. **Compliance state is staff-invisible.** `do_not_contact` /
   `do_not_email` and `email_suppressions` exist and gate outbound sends
   fail-closed, but **no staff surface shows them** — a compliance-visibility
   hole on every record.

7. **There is no staff write path and no search backend.** Staff cannot create
   a person, church, or household, manage a relationship, or write a
   party-keyed note; `pg_trgm` is not enabled (`init_schema.sql:5-6`), so no
   indexable typeahead exists.

## Solution

One coherent CRM depth layer — **party spine → relationship graph → record
shell → list engine → search → writes** — replacing the legacy donor surface
outright. Ten moving parts:

1. **A thin `parties` supertype with shared-PK subtyping.** `persons.id =
parties.id` (same for household and org subtype rows); `party_kind ∈
{person, household, org}` with `'group'` reserved-not-built; churches are
   org-kind parties with an `org_type` discriminator. `donors.party_id` ships
   `NOT NULL` with a composite tenant FK **from the first migration**;
   `donors.party_type` is **never created**. (A1–A3.)

2. **A hybrid stored + derived relationship graph.** `crm_relationships` is a
   single canonical edge (never mirrored pairs), typed by a seeded
   `crm_relationship_types` catalog, time-bound and never hard-deleted;
   derived edges (supports-from-ledger, household membership, org contacts)
   are `security_invoker` SQL views, merged with stored edges in **one
   UNION ALL surface** carrying provenance and keyset pagination. "Supports"
   is a named, versioned policy (`supports_policy_v1`). (A4–A6.)

3. **Derived roles, never authorization.** Donor/missionary/board/volunteer/
   staff/partner are **derived display roles** (from the ledger, records, and
   edges) with hard enforcement tiers; `authz.memberships` stays the sole
   authorization source. (A7.)

4. **One record shell for every kind.** A record **header contract** (consent
   badges, status chip, duplicate banner, claim chip, owner chip, tags,
   privacy indicator, reserved action slots) + **eight live tabs** + **eight
   hidden registry sockets**, rendered by one layout-agnostic component in
   both the peek drawer and the full page. (A10–A12.)

5. **One list engine, kind routes as pinned views.** `/crm` + kind routes
   over a single engine: saved views as first-class live-query rows, nested
   AND/OR filter schema, URL-as-state, keyset-only pagination with rebuilt
   parameterized predicates, a server facet endpoint, semantic-table a11y,
   and Next.js 16 layout + Suspense + intercepting `@drawer` routes.
   (A13–A14.)

6. **Cmd-K global search** over a `pg_trgm` GIN UNION ALL surface (parties
   name + donors email/phone), grouped by kind, permission-bound, replacing
   the fake `SearchDialog`. (A15.)

7. **Party-keyed engagement replaces donor-keyed outright.** `crm_notes`
   (Tiptap JSON + plain text, standard/restricted visibility),
   `crm_activity_events` (seeded taxonomy), tags on the party spine, and a
   `'party'` task-link record type; the timeline is **always composed at
   read** from source-truth branches — never persisted. (A16, D.)

8. **Plain Asym writes.** authz capability → zod → `withTenant` → **one
   transaction** (row write + `crm_audit_events` row + activity emission).
   **No provider gate — Phase 9 must not invent one.** (A17.)

9. **Governed CSV export** routed through Phase 3 export governance
   (`csvSafeCell` + consent gate + audit), honoring field policies. (A18.)

10. **Fresh-build discipline.** The legacy donor grid, drawer, `?donor=` state
    machine, and monolithic detail service are **deleted**; genuinely good
    machinery (cursor envelope, virtualization, named-views storage, the #270
    operation shell) is reused on merit; seeds regenerate correct-from-start
    **including synthetic duplicate pairs, merged tombstones per kind, and
    staff-assignment edges**. (§Further Notes, Fresh-build non-negotiables.)

---

## User Stories

### Staff operator (Mission Control CRM)

1. As a **staff operator**, I want to open any person, church, organization,
   or household and see one complete record — overview, contact, relationships,
   giving context, notes, activity, tasks — so that I never need a
   donor-specific page or a spreadsheet.
2. As a **staff operator**, I want to peek at a record in a drawer from any
   list and promote it to the full page without losing my place, so that
   triage stays fast and deep work gets a full screen.
3. As a **staff operator**, I want the record header to show consent badges,
   per-address deliverability, lifecycle status, a duplicate warning, the
   portal/claim state, tags, and who owns the relationship, so that the facts
   that gate my next action are visible before I scroll.
4. As a **staff operator**, I want to create a person, church, organization,
   or household and edit its contact fields, with every write audited, so that
   the CRM is operable, not read-only.
5. As a **staff operator**, I want to add, end, and re-role typed relationships
   (member of church, sending church, family, board member, reports-to), so
   that the relational reality of missions work is in the system.
6. As a **staff operator**, I want derived facts — who supports whom, who
   belongs to which household, who signs for which org — to appear in the same
   relationship list as stored edges, labeled by provenance, so that I see one
   graph, not three.
7. As a **staff operator**, I want to filter and sort any list with nested
   AND/OR conditions and save the result as a named live view, so that my
   working lists are durable instead of rebuilt every morning.
8. As a **staff operator**, I want saved views pinned to kind routes with
   non-deletable system defaults, so that `/crm/churches` opens on the list my
   team actually works from.
9. As a **staff operator**, I want any filtered state — view, filters, sort,
   cursor — captured in the URL, so that I can hand a teammate a link to
   exactly what I see.
10. As a **staff operator**, I want Cmd-K to find any record by name, email,
    or phone with typo tolerance, so that navigation is two keystrokes.
11. As a **staff operator**, I want Cmd-K results grouped by kind with my
    recent records surfaced first, so that the record I touched an hour ago is
    closer than one I have never opened.
12. As a **staff operator**, I want pinned and restricted notes with rich
    text, so that sensitive context is captured once and gated correctly.
13. As a **staff operator**, I want a per-record Tasks tab, so that follow-ups
    live where the records live.
14. As a **staff operator**, I want a `/crm/tasks` work queue spanning my
    tasks and all tasks, so that my day starts from one list instead of a
    record-by-record hunt.
15. As a **staff operator**, I want duplicate candidates flagged on the record
    and routed to the Phase 4 merge workbench, so that cleanup has one home.
16. As a **staff operator**, I want to export the current filtered list as
    CSV, so that an ad-hoc analysis or mail-house handoff does not require an
    engineer.

### Missions leadership / development

17. As a **missions director**, I want a missionary record to show
    support-vs-goal and its supporters (donors, churches, households) through
    the graph, so that support-raising status is one screen.
18. As a **church-relations lead**, I want a church record with key contacts,
    member/attender links, and the missionaries it sends and supports, so that
    church partnership is first-class, not a donor annotation.
19. As a **development lead**, I want N role-qualified staff assignees with one
    primary on any record (donor rep, regional rep, church relations,
    mobilizer), read from assignment edges, so that portfolio ownership is
    data, not tribal knowledge — and ready for Phase 27 portfolios.
20. As a **member-care lead**, I want member-care notes structurally absent
    from CRM notes and timeline (only the permission-gated Overview indicator),
    so that care confidentiality survives every new surface.

### Organization admin

21. As an **organization admin**, I want the relationship-type catalog to be
    seeded, governed data — edited only via migrations until the Phase 11/12
    catalog UI ships — so that relationship semantics stay consistent and no
    app page hard-codes a type.
22. As an **organization admin**, I want saved-view visibility to launch
    private-only with `team`/`everyone` reserved in the schema, so that view
    sharing arrives later as a governed rollout, not a retrofit.
23. As an **organization admin**, I want every CSV export routed through
    Phase 3 export governance and recorded in the audit trail, so that I can
    account for every list that leaves the system.
24. As an **organization admin**, I want flat tags on the party spine now,
    with taxonomy deferred to Phase 11, so that staff can label records today
    without pre-empting the custom-fields model.

### Founder / organization

25. As a **founder**, I want one coherent, people-centered CRM — every person,
    church, organization, and household a first-class party in one engine — so
    that staff operate one product, not a donor module with bolt-ons.
26. As a **founder**, I want the missions differentiators — support-vs-goal on
    missionary records and sending-church relationships as first-class edges —
    so that support-raising, the core loop of a missions organization, is
    native rather than an annotation.
27. As an **organization**, I want church records to carry key contacts and
    the missionaries each church sends and supports, so that church
    partnership — our distinctive over generic donor CRMs — is operational
    data.

### Finance / compliance

28. As **finance**, I want giving-derived edges and giving context to inherit
    FINANCE visibility and respect anonymity, so that the graph never leaks
    money facts to unauthorized staff.
29. As **finance**, I want receipt/statement facts to stay Phase-7-owned and
    only be **linked** from CRM surfaces, so that no tab invents money truth.
30. As **compliance**, I want CSV exports to pass Phase 3 export governance
    and field policies, so that a list screen cannot become a data leak.
31. As **compliance**, I want payment-instrument data limited to read-only
    Stripe metadata, with updates completed by donors through secure links, so
    that staff never key card data into any surface this platform renders and
    SAQ-A stays intact.

### Donor / missionary (privacy — negative stories)

32. As a **donor**, I want CRM internals (notes, tasks, edges, assignments,
    duplicate flags) to never appear in my portal, so that staff working
    context stays invisible to me.
33. As a **household member**, I want my household membership to grant me
    **zero** portal access or visibility by default, so that claiming stays
    Phase 4's explicit, consented flow.
34. As a **missionary**, I want my workspace to never let me browse broad CRM
    records or read staff notes beyond my permitted slice, so that staff-only
    context stays with staff.

### Developer / platform

35. As a **developer**, I want one detail read contract (header read model +
    per-tab keyset endpoints sharing one party-scoped access-check helper), so
    that tabs are forbidden from bespoke truth-fetching.
36. As a **developer**, I want derived roles structurally unusable for
    authorization (CI import gate + negative test), so that the second role
    system can never become an authz source.
37. As a **developer**, I want the edge topology locked (single edge, shared
    PK, seeded catalog, time-bound rows), so that the industry's documented
    expensive mistake — changing party topology after data ships — is
    impossible here.
38. As a **developer**, I want names containing `, % ( )` to round-trip
    through search and page boundaries, so that the old sanitization hacks
    stay dead.
39. As a **developer**, I want every CRM mutation to run capability check →
    zod validation → `withTenant` → one transaction containing the row write,
    the audit event, and the activity emission, so that audit and activity can
    never drift from the data they describe.
40. As a **developer**, I want seeds to generate synthetic duplicate pairs, at
    least one merged tombstone per kind, and staff-assignment edges, so that
    the dedupe queue, merge workbench, duplicate banner, and owner chips are
    demonstrable in every fresh environment.
41. As a **developer**, I want the saved-view definition JSON pinned to a
    versioned schema (nested AND/OR filter groups, sort, columns, viewType),
    so that stored views survive engine evolution without breakage.

---

## Implementation Decisions

### A. Architecture rulings

- **A1 — No generic `crm_records` table; Asym Postgres owns all CRM truth.**
  A generic master table would duplicate `crm_record_links` and the Phase 7
  party spine (the NPSP re-platform lesson). During this grill the founder
  ruled full Twenty retirement
  ([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md));
  the "CRM record" is the **party**. (D1.)

- **A2 — Shared-PK subtyping on a thin `parties` supertype.** `persons.id =
parties.id` (same for household and org subtype rows — every subtype row IS
  its party, same id, composite tenant FK). `party_kind` is TEXT+CHECK over
  `{person, household, org}` with `'group'` reserved-not-built; canonical
  value name is **`person`** (not `individual`). Church is **not** a kind:
  `kind='org'` + `org_type ∈ {church, school, foundation, business,
daf_sponsor, partner, agency, …}` on the org subtype. The dual person/party
  bridge disappears structurally: a person id IS a party id; `missionaries` /
  `profiles` bind via their existing `person_id` (= party id). (D3 R1, D7.3.)

- **A3 — Donor binding is born correct.** `donors.party_id` ships `NOT NULL`
  with an enforced composite `(tenant_id, party_id)` FK **from the first
  migration** (parties created at donor creation; no backfill step).
  `donors.party_type` is **never created**; the Phase 4 person_id-on-donors
  reservation is **superseded** (never created) by `party_id`. Frozen receipt
  snapshots still **copy** the resolved taxonomy at issuance — a frozen copy
  is not a live dual truth. `donors.missionary_id` is **dropped outright**
  (its meaning becomes staff-assignment / derived edges; the differently-owned
  `donations.missionary_id` is Phase 13/14 territory and untouched).
  Free-text `donors.type`, `donors.organization`, and `donors.spouse` are
  never carried (kind lives on parties; org = org-contact link; spouse =
  person-to-person edge). (D3, D7.1.)

- **A4 — Single canonical edge, never mirrored.** `crm_relationships`: ONE row
  per edge (NPSP-style mirrored pairs are a documented bug factory), from/to
  composite tenant FKs → parties, `relationship_type_id`, optional
  `relationship_role`, `started_at`/`ended_at` (**time-bound, never
  hard-deleted**), partial unique on active `(from, to, type)`, indexes
  `(tenant, from)` + `(tenant, to)`. (D2.)

- **A5 — Seeded type catalog; derived kinds structurally blocked from it.**
  `crm_relationship_types` is a seeded data catalog (key, forward/inverse
  labels, allowed endpoint kinds, `is_system`) — the Salesforce NPC
  PartyRoleRelation / CiviCRM relationship_type shape. Derived kinds are
  rejected from the stored catalog by **CHECK + API rejection + test**.
  Relationship types are **never hard-coded in an app page**; in Phase 9 the
  catalog is edited via migrations/seed only (staff-facing catalog UI is
  Phase 11/12). (D2, D7.2.)

- **A6 — Derived edges are views, merged with provenance.** Supports,
  household-membership, and org-contact edges are `security_invoker=true` SQL
  views, **never persisted**, merged with stored edges in ONE UNION ALL
  surface with provenance labels and keyset pagination. Giving-derived edges
  inherit **FINANCE visibility**; anonymity is respected; both are negative-
  tested. The supports policy reads **settled, adjustment-folded facts only**
  and is provider-isolated (Phase 13/14 re-model gift facts behind it); the
  shipped `buildSupportSummary` defects (100-gift truncation, raw
  `missionary_id` grouping) are not carried. (D2.)

- **A7 — Roles are derived, display-only, never authorization.** Donor (from
  the ledger), missionary (from records), board/volunteer/reference (from
  edges), **staff-person derived** from authz/tenant membership joined through
  `person_id` (= party id), **partner derived** from a partner edge/tag (no
  first-class partner type). Stored `party_roles` REJECTED (reserve-seam: the
  derived view's output shape `(party_id, role_key, since/until, provenance)`
  is a frozen contract and the backfill script if ever needed); role-instance
  edges REJECTED outright; classifications REJECTED (Phase 11 collision);
  contact normalization REJECTED-now (Phase 4 `contact_points` reservation
  stands; `donors.email` stays the claiming/consent key). `applicant` is a
  reserved mobilization **domain table**, not a role row. (D3.)

- **A8 — Groups guardrail.** `household` IS a party_kind; `household_members`
  is **grandfathered** for that one kind forever (receipt-compliance
  construct — NOT the template). ALL future group kinds (team, region,
  committee, circle) enter as new party_kind values + ONE shared `groups`
  subtype + ONE `group_memberships` table — **built by Phase 37, not
  before**; the UNION cost of household_members + group_memberships +
  org_contacts is accepted and stated; `support_teams` is legacy noted for
  Phase 37. (D3 R3.)

- **A9 — Merge membership.** `parties`, `crm_relationships`, and the
  party-keyed engagement tables (`crm_notes`, `crm_activity_events`,
  party task links) join the **Phase 4 A9 re-point list**: endpoints
  re-pointed in one transaction, active-edge dedupe against the partial
  unique (survivor kept, loser end-dated with a merge-audit note), self-edges
  eliminated, loser tombstoned via `merged_into_party_id`, edge re-points
  recorded in `merge_operations` for replayable unmerge. (D3 R2.)

- **A10 — The record shell: header contract + 8 live tabs + 8 sockets.**
  **Header (live):** consent badges (`do_not_contact`/`do_not_email` +
  per-address deliverability from `email_suppressions`); lifecycle-status
  chip (`active/inactive/archived/deceased`; `merged` read from the Phase 4
  tombstone); duplicate-warning banner (`crm_merge_candidates` → Phase 4
  #514); portal/claim chip (Phase 4 claimed/unclaimed/invited socket);
  owner/assignment chip (**N role-qualified assignees + ONE primary, reading
  assignment edges only**); tags chips; privacy role-gate indicator; and a
  reserved header **action-slot registry** (print/PDF exports → Phases 18/19;
  Write-a-Message → Phase 17 governed content/sender resolution, then Phase 6
  dispatch/history; "Request payment method update" → A11).
  **Eight live tabs:** Overview, Contact, Relationships, Giving (incl.
  Commitments + the payment-instruments read panel), Notes, Activity, Tasks
  (thin), Audit (thin, permission-gated). **Eight hidden registry sockets:**
  Communications (P6), Custom Fields (P11), Files (P29), Workflows +
  mobilization progress (P34), Events participation (P37), Payment Methods
  staff actions, External IDs / provider links (P30/P31, over
  `crm_record_links`), Donor Development / Portfolio (P27). Overview adds a
  family/household panel (spouse/children/birthdays from edges +
  `household_members`), a support-vs-goal widget on missionary records (thin
  now from `missionaries.funding_goal`/`current_funding`; recomputed on
  Phase 13 facts), a key-contacts strip on church/org records (from
  org-contact edges), and `donors.score` **shown explicitly labeled as
  demo/placeholder data until Phase 27 ships real scoring**; reserved
  Overview sockets: missionary assignment/deployment (P37), cultivation
  stage + next ask (P27). Contact adds the consent & communication-
  preferences section, per-address suppression status, and the reserved
  newsletter-preference seam (Phase 32). **Member-care
  exclusion:** `member_care_private_notes` stays RLS-revoked; only the
  permission-gated Overview indicator references care. (D4.)
  - **Giving-tab reserved columns (the four ratified in D4):** soft-credit
    rows (light up from Phase 14 `contribution_credits` through its governed
    read model); per-gift
    receipt state linked from Phase 7 official facts, acknowledgment state
    linked from Phase 14 purpose/readiness, with the exact Phase 18 artifact,
    Phase 17 content version, and Phase 6 delivery outcome shown separately;
    commitment support health (Phase 16 derived multi-axis lifecycle,
    attention reasons, fulfillment progress, and certainty—not one writable
    `on-track/behind` flag); and
    statement history plus a re-send affordance (Phase 19).
  - **Dated Phase 16 dashboard amendment (2026-07-13):** the missionary
    hierarchy is cash received this month first; automatic recurring outcomes
    this month second; the privacy-safe recurring-support list third; goal
    coverage and a clearly labeled 12-month forecast after that; and a quiet
    “Other commitments” section only when fixed-total pledges actually exist.
    “Next scheduled donation” never implies success. Apply anonymity,
    restricted-ministry policy, and small-cell/coarsening rules before both
    row display and aggregation. Missionaries may filter and view but may not
    mutate donor intent, payment methods, schedules, or authorization.

- **A11 — Payments (D4a): read metadata, never key card data.** Phase 9
  **ships** a read-only "Payment instruments" panel (Giving tab section):
  brand/last4/expiry/default/wallet via the Stripe PaymentMethods API. **Phase
  16 amendment (2026-07-13):** lookup MUST resolve through the exact
  tenant/account/livemode/Commitment-Party/provider-Customer binding and active
  authorization lineage; `donors.stripe_customer_id` is migration evidence,
  never sufficient authority or lookup scope. Stripe classifies these fields as
  non-sensitive/storable; **zero PCI impact, SAQ-A intact**. Phase 9
  **reserves an action socket** (not an edit form): "Request payment method
  update" mints a setup-mode Checkout Session / billing-portal deep link
  (portal sessions already exist in
  `packages/api/src/donor-portal/billing.ts`), resolves governed content,
  sender, and reply purpose through Phase 17, and dispatches via the Phase 6
  seam — lights up only when both downstream contracts are available;
  donor-side completion is Phase 25. **HARD PROGRAM GUARDRAIL (amended
  2026-07-11 by Phase 15 and extended 2026-07-13 by Phase 16): Asym never
  stores, logs, or processes raw card or bank-account details.** A donor or
  authorized staff operator may enter payment details only into a
  provider-owned hosted or embedded field that Asym cannot read. Phase 15's
  native embedded SAQ-A Payment Element + server-confirmed MOTO lane is the
  primary phone-card flow; its hosted secure link is the fallback. Phase 16
  staff service may reuse only a legally supported provider-owned flow after
  independently proving operator authority, the Commitment Party's
  instruction, and collection authorization. Recurring ACH is not silently
  treated as TEL, and no checkbox manufactures a mandate. (D4a.)

- **A12 — Phase 27 reservations (D4b), zero-rework contract.** (a) a
  **staff-assignment edge-type family** seeded in `crm_relationship_types`
  (endpoint kinds staff-person → any-party; `relationship_role` vocabulary
  `donor_rep` / `regional_rep` / `church_relations` / `mobilizer` —
  extensible as data); (b) the header owner-chip contract = N role-qualified
  assignees + ONE primary, **reading edges only**; (c) the Donor-Development
  socket + the cultivation-stage Overview socket; (d) `lastTouchAt` /
  next-action stay **server-computed contract fields**; (e) **GUARDRAILS:
  cultivation stage is NEVER a `lifecycleStatus` value; asks are NEVER edges
  or custom fields.** Portfolios are derived views over active assignment
  edges — no stored portfolio table in Phase 9, ever. (D4b.)

- **A13 — Routes: one engine, kind routes as pinned views.** `/crm` (all
  records + global search) · `/crm/people` · `/crm/churches` (pins
  `org_type='church'`) · `/crm/organizations` · `/crm/households` — one
  engine, kind-pinned, per-route default columns; per-kind detail routes
  render the A10 shell. Work queues: `/crm/relationships`, `/crm/duplicates`
  (links into Phase 4 #514), and `/crm/tasks` (**thin work-queue route in
  P9**: my/all tasks over the same engine). `/crm/activity` is **rejected**
  for P9 (per-record tab covers it; global feeds = Phase 8 ops / Phase 33
  reporting); `/crm/files` deferred to Phase 29; `/crm/settings` deferred to
  Phase 11/12. **No redirects or aliases for pre-Phase-9 URL shapes
  (`?donor=` etc.); the old shapes cease to exist.** (D5, D7.2.)

- **A14 — The list engine (nine binding requirements).** (1) **Saved views =
  first-class rows** (tenant, kind-scope, name, definition JSON, owner,
  visibility `private` now / `team`/`everyone` reserved, pinned order;
  first = route default), **always live queries** (RE NXT static lists
  rejected); view-type discriminator (`table` now, `board` reserved);
  "lists/segments" reserved as a DISTINCT future entity (views = lenses,
  lists = membership containers); 2–3 non-deletable system views per kind
  route. (2) The filter schema supports **nested AND/OR groups from day one**
  (UI may expose one level; the stored shape is never flat). (3) **URL is the
  source of truth** for view+filter+sort+cursor on every `/crm*` list route
  (nuqs urlState; deltas-from-view-defaults; debounced replaceState for
  text); **AC: ANY filtered state is shareable as a URL.** (4)
  **Keyset/cursor only** — reuse the shipped cursor **envelope** (base64url
  `{id, field, direction, value}`, sort whitelist, id tie-break, limit+1) but
  **REBUILD predicate application as parameterized SQL** (RPC / quoted
  filters), deleting `escapeSearchValue` and the comma-mutation; **AC: names
  containing `, % ( )` round-trip through search and page boundaries**;
  server filter/sort/pagination all-or-nothing; count badges (list and tab)
  explicitly budgeted (estimated/capped/cached) or cut; maxPages eviction
  defined; virtualization per the shipped foundation with the 720px container
  fixed. (5) **Server-backed facet-options endpoint** (never derive options
  from loaded rows); `kind` is a proper enum on parties. (6) Cmd-K per A15.
  (7) **A11y:** semantic table + `aria-sort` (`role="grid"` rejected — no
  cell editing); `aria-rowcount`/`rowindex` + `scrollToIndex` focus mgmt
  under virtualization; `DataTableResponsive` as the ONLY grid primitive;
  keyboard navigation enabled; stable party-id row IDs; **every `/crm*` route
  registered in the e2e a11y spec**; drawer focus-return per ADR-CD-023. (8) **Next.js 16 route
  architecture:** `app/crm/layout.tsx` = persistent chrome; each kind route a
  thin server page + Suspense around the searchParams consumer
  (cacheComponents contract, no route-segment config); detail = canonical
  full page `app/crm/<kind>/[id]/page.tsx` + parallel/intercepting `@drawer`
  slot (`(.)` intercepts, `default.tsx` → null, `router.back()` close) —
  replacing the hand-rolled `?donor=` drawer state machine; the A10 shell
  component is layout-agnostic (same component in drawer and full page).
  (9) **Named-views machinery:** keep the shipped storage model (table_id
  rows, user→tenant→system fallback, RPCs, schema versioning); **generalize
  the payload schema** (only gift-history is whitelisted today); register one
  table id per kind route. List surfaces keep the shipped column capabilities
  (`lifecycleStatus`, `lastTouchAt`, `nextTaskSummary`, portal-label columns);
  board/kanban needs are covered by the reserved `board` viewType. (D5, D7.1.)

- **A15 — Cmd-K search, permission-bound.** Cross-kind grouped typeahead +
  recent records (actions/creation deferred), replacing the demo
  `SearchDialog`; a new cross-kind endpoint over parties; cmdk primitives +
  the support-hub palette structure inherited. **Search binds to the same
  permission scope as the detail/list read models; member-care and
  finance-provenance data are excluded from the index AND snippets** —
  negative tests in the safety tier. (D5.6, D7.5.)

- **A16 — Party-keyed engagement replaces donor-keyed outright.** `crm_notes`
  and `crm_activity_events` are party-keyed (composite tenant FKs); tags move
  to the party spine (flat labels; taxonomy stays Phase 11 — this does not
  reopen D3 increment 4); task links gain `record_type='party'`. Legacy
  `donor_activities` and the `donors.notes` scalar **die**; the timeline is
  **always composed at read** (explicit rejection of a persisted
  `crm_record_timeline_items`). (D7.4.)

- **A17 — Plain Asym write path; no provider gate.** Every operation (create
  person/church/household, edit contact fields, add/end relationship,
  add/edit/pin note): authz capability check (Phase 3 role-scoped) →
  zod-validated input → `withTenant` tenant-guard service-role write → **ONE
  transaction** containing (a) the row write, (b) a `crm_audit_events` row,
  (c) the `crm_activity_events` emission. **No fail-closed provider gate, no
  provider-idempotency log, no `crm_write_gates` dependency — CRM writes have
  no Phase 8 prerequisite; the Audit-tab ops-indicator socket reads whatever
  the Phase 8 re-groom defines, and Phase 9 must not invent a gate.**
  `crm_command_logs` stays reserved for future async provider commands only.
  Double-submit protection is client-side + the Phase 4 dedupe scan; the
  donate-path idempotency header stays money-path-only. (D7.4, ADR-0001 §4.)

- **A18 — Exports ship governed; detail reads share one contract.** A minimal
  list CSV export ships in P9, routed through Phase 3 export governance
  (`csvSafeCell` + consent gate + audit) — keeping the phase-map row-9
  "CRM-bound exports" promise; negative test: export honors field policies.
  The detail read contract (the record-tabs-fetch-their-own-truth stop
  condition): **ONE header/overview read
  model + per-tab keyset endpoints sharing a common party-scoped
  access-check helper; tabs are FORBIDDEN from bespoke truth-fetching.**
  (D7.4, D7.5.)

### B. Deep modules (built behind stable interfaces)

- **B1 — Party spine service.** Create/update per subtype; **writes
  `parties.display_name` by the OWNING subtype service on subtype
  create/update (single write-through convention; never edited directly on
  parties)**; lifecycle-status transitions.
- **B2 — Stored-edge service.** Add/end/re-role edges against the catalog's
  allowed endpoint kinds; partial-unique enforcement; never hard-deletes.
- **B3 — Derived-edge views + provenance UNION surface.** Pins
  **`supports_policy_v1` = "a settled (adjustment-folded) gift in the
  trailing 365 days OR eligible current recurring intent OR an explicitly
  qualifying fixed-total pledge"** — named, versioned, and **displayed on the
  edge** with provenance. A fixed pledge or scheduled occurrence never enters
  a cash-received total; unknown/stale provider control is not healthy current
  recurring support. FINANCE-provenance visibility.
- **B4 — Derived-roles view.** Frozen output contract
  `(party_id, role_key, since/until, provenance)`; schema-shape-tested.
- **B5 — Header/overview read model.** The A10 header contract in one query
  surface; server-computed `lastTouchAt` / `nextTaskSummary`.
- **B6 — Party-scoped access-check helper.** The one shared gate every tab
  endpoint calls; Phase 3 projection-aware.
- **B7 — Timeline composer.** ONE UNION ALL SQL surface (crm_activity_events,
  gifts via effective values, tasks via links, notes, + a reserved P6 comms
  branch), keyset over `(occurred_at, kind-prefixed id)` reusing the shipped
  cursor codec; per-branch covering indexes; **no `member_care%` branch,
  structurally**.
- **B8 — Notes service.** Tiptap JSON + `body_text`; standard/restricted
  visibility enforced in the single read path (and the timeline's notes
  branch applies the same predicate); pin/edit/soft-delete.
- **B9 — Activity emitter.** Seeded `event_type` taxonomy (`record_created`,
  `record_updated`, `status_changed`, `assignment_changed`,
  `relationship_added`, `relationship_ended`, `note_added`,
  `merge_completed`); one row per affected endpoint for multi-party events.
- **B10 — List-engine core.** Parameterized predicate builder + the reused
  cursor envelope; sort whitelist; all-or-nothing server filter/sort/page.
- **B11 — Saved-views store.** Generalized named-views machinery; **the
  definition JSON schema is pinned: `{ version, filters: nested
{and:[…]|or:[…]} groups over typed predicates (field, op, value), sort:
[{field, dir}], columns: [ids], viewType: 'table' ('board' reserved) }` —
  deltas-from-defaults stored.**
- **B12 — Facet-options endpoint.** Distinct kinds/tags/statuses per tenant,
  server-computed.
- **B13 — Cross-kind search service.** pg_trgm UNION surface;
  similarity + prefix + recency ranking; min 2 chars, 150–250ms debounce with
  in-flight cancellation, server p95 < 100ms budget; permission-bound (A15).
- **B14 — CSV export.** Through Phase 3 governance (A18).
- **B15 — Write-path command core.** The A17 transaction shape, shared by
  every mutating operation.
- **B16 — Payment-instruments adapter.** Read-only Stripe PaymentMethods fetch
  through the exact tenant/account/livemode/Party/provider-Customer binding;
  metadata fields only. A legacy unscoped `donors.stripe_customer_id` lookup is
  forbidden.

### C. Predecessor plug-ins & amendment ledger

- **C1 — Phase 4 (HARD).** Composite `(tenant_id, id)` keys, ENABLE+FORCE
  RLS, `withTenant` tenant-guard, cross-tenant negative CI tier — inherited,
  never re-invented. **Phase 4 T3 one-line amendment:** the person_id-on-
  donors reservation is superseded — `donors` **never receives** `person_id`;
  `donors.party_id` is created in its place (`person_id` on
  missionaries/profiles unchanged). **Phase 4 A9 amendment:** the re-point
  list gains `parties`, `crm_relationships`, and the party-keyed engagement
  tables (its "expected to grow" clause anticipated this). **Phase 4 §D
  touches (same amendment):** the frozen-snapshot field list carries
  `party_kind` (+ `org_type` for org-kind legal donors) instead of
  `party_type` (Phase 7's §D snapshot copy also drops `org_subtype`); the
  inert-reserved line and A2/acceptance
  wording carry the supersession; §G2 records the clean canonical cutover
  (the prototype `contribution_receipt_snapshots` runtime is removal evidence,
  never an interim authority; Phase 7's `contribution_receipts` freezes the
  party-aware legal-donor facts from first authoritative write, and Phase 18
  D17 removes the prototype before activation). Duplicate/merge UX stays
  Phase-4-owned (#514); Phase 9 surfaces and links.
- **C2 — Phase 7 §D/T4 amendment (the party-spine restructuring).** Phase 7's
  committed flat `party_type ∈ {individual, household, organization, church,
business, daf_sponsor, foundation}` becomes **`party_kind ∈ {person,
household, org}` + reserved `'group'`, with `org_type ∈ {church, school,
foundation, business, daf_sponsor, partner, agency, …}` on the org
  subtype**; the canonical value name is **`person`** (not `individual`);
  frozen receipt snapshots **copy the resolved taxonomy at issuance**
  (frozen copy ≠ live dual truth). Plus: thin `parties` supertype with
  shared-PK subtyping (`persons.id = parties.id`); `donors.party_id` NOT NULL
  composite FK from the first migration (deferred-enforcement language
  dropped); `donors.party_type` **never created**; the
  no-new-inline-contact-columns rule; parties join the merge re-point
  contract. Wording is **never-create**, not drop/supersede, per D7.1.
  **Amendment scope (extended per the 2026-07-06 congruence audit):** the
  restructuring is written into Phase 7 **A9** (the flat-set ruling itself),
  the §D enum list, the §D frozen-snapshot field list (`party_kind` +
  `org_type`), the §D party-spine table list (which gains the `parties`
  supertype line), T4, and the C5/Out-of-Scope handoff-hint wording — not
  §D/T4 alone. **Phase 5 amendment (same date):** its four reserved
  "`party_type` hint (default `individual`)" sites (A8, A11, the
  checkout-handoff resolver, §D) are renamed to a **`party_kind` hint
  (default `person`; org routing carried by `org_type`)** so checkout hands
  off the platform's canonical taxonomy.
- **C3 — Phase 8 (SOFT).** No write gate, no readiness interlock, no
  provider-idempotency machinery touches Phase 9 (withdrawn by ADR-0001 §4).
  The Audit tab reserves an **ops-indicator socket** whose content the
  re-groomed Phase 8 (#603) owns. Phase 9 must not invent a gate.
- **C4 — Phase 3 (inherited seams).** Role-scoped projection chokepoint on
  every read model; export governance on B14; the consent gate (PR #502)
  behind every send-adjacent action.
- **C5 — Phases 17 and 6 (socket-only).** The Communications tab socket and
  the "Request payment method update" / Write-a-Message action slots light up
  only when Phase 17 can resolve the governed content, template, sender, and
  reply purpose and Phase 6 can apply consent-aware scheduling, dispatch,
  provider outcomes, and communication history. Nothing in Phase 9 blocks on
  either downstream product.
- **C6 — Congruence touches.** The C1/C2 amendments and the 2026-07-06
  congruence-audit fixes (45 findings: dependency-graph alignment incl. the
  phase-map row-9 soft-Phase-8 qualification, tracking updates to #602/#603,
  the phase-08 banner corrections, and terminology reconciliation) were
  **applied with this PRD's commit**. Remaining for T1: update the
  parity-matrix Phase 9 row (built-vs-planned per Phase 0) at build time;
  author the OpenSpec delta (platform-boundaries: Asym Postgres owns CRM
  truth; platform-surfaces: `/crm` routes); confirm
  `docs/guides/features/twenty-crm-integration/**` retirement banners remain
  intact when #602 archives the package.
- **C7 — Roadmap v2 renumbering (2026-07-07).** All forward-phase
  references in this PRD were renumbered to Roadmap v2
  ([`roadmap.md`](./roadmap.md) — 41 phases, v1→v2 mapping table there).
  No scope change: every socket, guardrail, and deferral points at the
  same phase _by name_; only the numbers moved (e.g. Custom Fields 10→11,
  Files 25→29, Events/groups 28→37, Workflow engine 31→34, Donor
  Development 33→27).

### D. Data model (all tenant-scoped, composite keys, FORCE RLS posture per repo discipline)

**Party spine (restructures the Phase 7 §D build per C2):**

- `parties` — thin supertype: `party_kind` (TEXT+CHECK, `'group'` reserved),
  `display_name` (write-through, B1), `lifecycle_status` (TEXT + named CHECK
  `active|inactive|archived|deceased`; `merged` read from the tombstone),
  `tags` (flat labels), `merged_into_party_id`, timestamps. **Zero
  denormalized giving/engagement columns — all giving-derived display reads
  through the supports policy or Phase 13 facts.** No new inline contact
  columns, ever (migration lint).
- `persons` / `households` / org subtype — shared-PK subtype rows
  (`id = parties.id`, composite tenant FK); org subtype carries `org_type`.
  `household_members` grandfathered per A8; `org_contacts` kept (receipt/
  legal construct).
- `donors.party_id` — NOT NULL composite FK (A3). Never created:
  `donors.party_type`, `donors.person_id`. Dropped: `donors.missionary_id`,
  `donors.type`, `donors.organization`, `donors.spouse`, `donors.notes`
  scalar, `donor_activities`.

**Graph:** `crm_relationships` + `crm_relationship_types` per A4/A5; seeded
catalog per the disposition table below; derived views per A6.

**Engagement:**

- `crm_notes(id, tenant_id, party_id [composite FK], author_profile_id NULL
ON DELETE SET NULL, author_name_snapshot, body jsonb /*Tiptap*/, body_text
NOT NULL, visibility CHECK (standard|restricted) DEFAULT 'standard',
pinned_at NULL, edited_at NULL, created_at/updated_at, deleted_at NULL)`.
  Indexes: `(tenant_id, party_id, created_at DESC, id)`; partial pinned. NO
  title column (Twenty artifact). Deferred: attachments → P29 (no schema
  reservation); @-mentions → later (zero schema cost — marks live in body
  jsonb; `crm_note_mentions` named as the future fan-out table); edit history
  = the audit event's before/after snapshots (`edited_at` flag only);
  threaded note comments rejected (tasks own discussion).
- `crm_activity_events(id, tenant_id, party_id [composite FK], event_type
CHECK [seeded], actor_profile_id NULL, actor_kind CHECK (human|system)
DEFAULT 'system', subject_type/subject_id [pointer — diffs live in the
audit event, never duplicated], summary NOT NULL [frozen one-liner],
details jsonb, occurred_at DEFAULT now(), created_at)`. Index
  `(tenant_id, party_id, occurred_at DESC, id)`. CiviCRM `activity_contact`
  named as the upgrade if events routinely target many parties (P37).
- `crm_audit_events(id, tenant_id, actor_profile_id, actor_kind, operation,
resource_type CHECK (party|relationship|note), resource_id, source_surface
CHECK (crm_record|crm_list|merge_workbench|api), reason NULL,
before_snapshot/after_snapshot jsonb, created_at)` — feeds the Audit tab
  and IS the notes edit history; follows the per-domain audit-event
  precedent (`contribution_operation_audit_events` vocabulary), **not**
  `crm_command_logs`.
- Saved views per B11 on the generalized named-views storage; task links:
  add `'party'` to `MissionControlLinkedRecordType`, an additive
  `(tenant_id, record_type, record_id)` reverse index, and a tasks-for-party
  read service (`record_id` stays TEXT/un-FK'd — pointer-grade links).
- Search: `CREATE EXTENSION pg_trgm`; GIN `gin_trgm_ops` on parties
  display-name + `donors.email`/`donors.phone`; upgrade triggers named in
  the PRD (notes/comms body search, multi-language stemming, >10^7-row
  tenants → tsvector hybrid or dedicated infra behind the single endpoint
  seam).

**Relationship-type dispositions (all 24 launch types; grouped rows are
annotated with the number of launch types they cover — unannotated rows cover
one each):**

| Launch type(s)                                                                      | Disposition                                                                                                                                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| donor/church/household supports missionary or project (covers 3)                    | **Derived** (`supports_policy_v1` over the ledger)                                                                                               |
| person belongs to household                                                         | **Derived** (`household_members`)                                                                                                                |
| contact/signer for church, org, foundation (covers 3)                               | **Derived** (`org_contacts`)                                                                                                                     |
| person belongs to church (member/attender via `relationship_role`)                  | **Stored seed**                                                                                                                                  |
| missionary ↔ sending church                                                         | **Stored seed**                                                                                                                                  |
| missionary reports-to leader (roles `field_leader`, `regional_leader`)              | **Stored seed**                                                                                                                                  |
| person ↔ person family (spouse/child/parent/sibling roles)                          | **Stored seed** (feeds the Overview family panel)                                                                                                |
| board member of org                                                                 | **Stored seed**                                                                                                                                  |
| volunteer of org                                                                    | **Stored seed** (event-scoped volunteering → P37)                                                                                                |
| staff-assignment family (`donor_rep`/`regional_rep`/`church_relations`/`mobilizer`) | **Stored seed** (A12)                                                                                                                            |
| partner org of tenant                                                               | **Stored edge/tag**; `partner` = derived display role (no kind)                                                                                  |
| missionary belongs to team / region (covers 2)                                      | **Deferred** — P37-gated group kinds                                                                                                             |
| church/volunteer connected to event or trip (covers 2)                              | **Deferred** — P37                                                                                                                               |
| donor connected to advocacy campaign                                                | **Not a P9 edge** — Phase 36 owns advocacy participation                                                                                         |
| applicant reference / applicant coach (covers 2)                                    | **Reserved** with the mobilization phase (domain table, D3)                                                                                      |
| person employed by org                                                              | **Deferred** (no P9 consumer)                                                                                                                    |
| donor recommended DAF gift                                                          | **NOT an edge** — Phase 14 gift-fact/soft-credit territory (guardrail: gift-level facts are never party edges, mirroring "asks are never edges") |

Imported/legacy provenance is a Phase 30 concern carried by
`crm_record_links`, never a party_kind or status; deceased/inactive are the
lifecycle-status model; event registrant is Phase 37.

**Schema-tranche checklist (one reviewable migration unit):** everything
additive against the existing migration chain, with named constraints:

- `pg_trgm` extension plus the trgm GIN indexes
- parties, shared-PK subtypes, and the donor binding (`donors.party_id`) —
  the spine itself ships with Phase 7 T4 as amended (C2); Phase 9's tranche
  adds `lifecycle_status`, `tags`, and `merged_into_party_id` and verifies
  the rest
- graph tables (`crm_relationships`, `crm_relationship_types`) with the
  relationship-type catalog seed
- `crm_notes` with its two indexes
- `crm_activity_events` with its one index
- `crm_audit_events` with its two indexes
- the task-link reverse index
- the saved-views generalization

### E. Contracts & wiring

- **E1 — Route architecture** per A13/A14.8: layout chrome, thin server
  pages + Suspense, canonical detail pages + intercepting `@drawer`, no
  legacy-URL shims.
- **E2 — Detail read contract** per A18: header read model + per-tab keyset
  endpoints through B6; tab count badges follow the same budgeted/capped/cut
  rule as list counts.
- **E3 — Search endpoint** per B13; facet endpoint per B12; export per B14.
- **E4 — Seeds (the fresh-build flip's hidden cost):** demo data
  **deliberately seeds synthetic duplicate pairs, ≥1 merged-tombstone example
  per kind, and staff-assignment edges** — else the dedupe queue, merge
  workbench, duplicate banner, and owner chips are empty and undemonstrable
  in fresh environments.

### F. ADRs

- **F1 — "Party-model topology for CRM depth"** (ONE new ADR, absorbing
  launch candidates 1, 2, 3, 5, 7, 8): shared-PK subtyping; the single-edge
  never-mirrored graph; the seeded type catalog; derived roles/edges never
  authorization; the groups guardrail. Irreversible, surprising without
  context, real trade-offs — locked at zero shipped party data because
  changing party topology after data ships is the industry's documented
  expensive mistake (NPSP→NPC, SAP CVI).
- Launch ADR candidate 11 ("Twenty remains a provider behind Asym
  contracts") is **superseded by ADR-0001** (Twenty retired). Candidates 4,
  6, 9, 10, 12, 13 are below the ADR bar — recorded as PRD rulings and
  inherited seams above.

---

## Testing Decisions

Good tests assert **behavioral invariants and privacy boundaries**, not
implementation details; failures here are silent by design, so assertions are
refusal/absence-shaped. Deepest coverage goes to the pure surfaces (B3
derived edges, B4 roles view, B7 timeline, B10 predicates).

**Permanent negative/safety tier (a failure fails the build):**

- Cross-tenant isolation: no party, edge, note, activity, audit, or search
  row ever crosses a tenant (extends the Phase 4 tier).
- **Derived roles never authorize**: the authz package cannot import the
  roles view (CI dependency gate) + a runtime negative test.
- The roles view's output shape is frozen (schema-shape unit test).
- Derived edge kinds are rejected from the stored catalog (CHECK + API +
  test).
- The composed timeline surface references **no `member_care%` relation**
  (CI assertion) and `member_care_private_notes` stays RLS-revoked.
- A staff-role viewer sees no restricted notes via (a) the Notes tab endpoint
  and (b) the composed timeline.
- **Cross-surface leak bundle (the household-portal-access, staff-note-leak,
  missionary-workspace-browsing, and donor-portal-internals stop
  conditions):** (1) a
  `household_members` row grants **zero** portal visibility; (2) party
  notes/activity never appear in any missionary-workspace projection; (3)
  the missionary workspace cannot enumerate CRM parties beyond its permitted
  slice; (4) donor-portal projections contain no CRM internals (notes,
  tasks, edges, assignments, duplicate flags).
- Giving-derived edges inherit FINANCE visibility; anonymity respected.
- Search: results/snippets never surface fields the caller cannot read;
  member-care and finance-provenance data excluded from index and snippets;
  cross-tenant search returns nothing.
- CSV export honors Phase 3 field policies (negative test).
- Names containing `, % ( )` round-trip through search and page boundaries.
- Stable keyset pagination across a seeded mixed timeline with duplicate
  timestamps.
- Merge re-point: colliding active edges deduped, self-edges eliminated,
  tombstones written, `merge_operations` replayable.

**Structural CI gates:** the authz-import dependency gate; the roles-view
schema-shape test; the no-new-inline-contact-columns migration lint; every
`/crm*` route registered in the e2e a11y spec; the D6 legacy deletion (no
references to the old donor grid/drawer/detail service symbols remain).

**Evidence line:** the evidence file records repo files inspected, external
sources used (CiviCRM schema-design + note-privacy docs; Postgres
textsearch/pg_trgm/GIN references; Stripe PCI/security guide for A11), tests
run, route/API checks, known gaps, stop conditions, and what Phase 9
intentionally did not build.

---

## Out of Scope

Owned elsewhere, linked (never rebuilt) here — with the two deliberate
carve-outs stated: the **payment-instruments read panel** ships in P9 with
its PCI rationale (A11), and the shipped **#270 inline gift-operation shell**
is retained in the Giving tab as a capability-checklist item (D6 reframing):

- Full custom field builder → Phase 11 (socket reserved).
- Full admin permission configuration → Phase 3/12.
- Full giving ledger → Phases 13/14 (Giving tab links source truth).
- Full offline batch entry → Phase 15.
- Full soft-credit / DAF / tribute / matching operations → Phase 14; Phase 7
  consumes proved results only for receipt/statement legal facts.
- Full pledge management → Phase 16 (Commitments section reads contracts).
- Full receipt/PDF template system → Phase 18.
- Full year-end statement operations → Phase 19.
- Accounting Releases, QBO/Xero delivery, processor settlement coverage, and
  bounded Bank Match → Phase 20 (P9 ships governed list CSV only).
- Full public page workflow → Phase 5+/public phases.
- Full Site Planner → its own phase.
- Full donor dashboard depth → Phase 25.
- Full missionary dashboard depth → Phase 28+.
- Full system message editor → Phase 17.
- Full file manager → Phase 29 (socket reserved).
- Full Mailchimp sync → Phase 32.
- Full import tool → Phase 30 (External-IDs socket reserved; provider-link registry pairs with Phase 31).
- Full report builder → Phase 33.
- Full workflow engine → Phase 34 (socket reserved).
- **Destructive duplicate merge — deferred unless explicitly approved**;
  structurally replaced by the Phase 4 non-destructive merge contract
  (tombstone + replayable unmerge), owned by Phase 4 (#514).

---

## Further Notes

### Fresh-build ruling & non-negotiables (D6/D7.1)

The product has **no users**; Phase 9 **replaces** the old donor grid,
drawer, and monolithic detail service outright — old code is raw material
(cursor envelope, virtualization, named-views storage, operation shell are
reused **on merit** — marked so nobody "freshens" them away), not a
constraint. The D4 inventory is a **capability checklist** (nothing
staff-visible today may be missing from the new build), not a migration
gate. No user-continuity ceremony — but fresh-build must NEVER skip: (a)
tenant-isolation plumbing; (b) migration-chain hygiene (additive, named
constraints, seed regeneration; no squash); (c) merge auditability + receipt
integrity through merge; (d) Phase 7's canonical frozen receipt facts + the
three-document wall; (e) consent/suppression gates; (f) RLS discipline
(`security_invoker` views, member-care revocation, FINANCE provenance,
anonymity); (g) the D3 enforcement tiers; (h) the A11 PCI guardrails;
(i) the irreversible graph-topology axes. **"No users" softens nothing about
"100% right the first time" on topology.** Contact normalization (D3
increment 5) stays REJECTED under fresh-build — the reject rests on
committed-PRD coupling (claiming/consent/dedupe key on `donors.email`), not
shipped data. Phase 7 T19's shadow-flag and backfill lines are flagged as
candidates for founder-approved simplification at Phase 7 build time — no
silent edit now.

### Stop conditions (restated from launch, updated)

Phase 9 has failed if: a CRM record is a renamed donor record; a CRM person
is treated as an auth user / donor profile / missionary profile; church/org
is bolted on outside the shared party pattern; household membership grants
portal access; the graph crosses tenants; low-confidence duplicates
auto-merge; destructive merge ships without approval; donor/private staff
notes leak to donor or missionary surfaces; the missionary workspace browses
broad CRM records; the donor portal sees CRM internals; CRM owns
gift/receipt/statement/CMS/communication truth instead of linking;
relationship types are hard-coded in an app page; record tabs fetch their
own inconsistent truth; files/tasks/workflows tabs invent conflicting
models; exports ignore Phase 3 policies; search exposes sensitive data
across permissions; or staff still need spreadsheets or donor-specific
pages. (The launch's raw-Twenty-UI stop condition is superseded — trivially
true post-ADR-0001.)

### Glossary terms (authored with T1 into `CONTEXT.md`)

**party**, **party_kind**, **shared-PK subtype**, **stored vs derived edge**,
**provenance**, **relationship_role**, **supports policy**, **saved view vs
list/segment**, **staff-assignment edge**, **lifecycle status vs cultivation
stage** — plus the keep/redefine/drop mapping of all ~45 launch terms
("CRM record"→party; "record type"→party_kind + derived role; "CRM
group"→org/household kinds + reserved `'group'`; "provider record" /
"source-truth link" redefined post-ADR-0001 for imports/external IDs).

### Best-practice grounding (verified this grill)

Attio objects+views / HubSpot index-page list architecture; Salesforce NPC
PartyRoleRelation + CiviCRM relationship_type (the A′ edge shape); Fowler
Party/Accountability with Silverston's tier-selection method (A′ IS the
canonical pattern — rejected increments are the documented failure modes:
TCA role-instance edges, SAP stored-role drift, NPSP mirrored rows); CiviCRM
note/activity schema (polymorphic FKs rejected); Postgres pg_trgm-vs-tsvector
guidance; Stripe PCI/SAQ-A guidance for A11.

---

## Evidence & Acceptance

**Done when:** _"Staff can open a person, church, organization, or household
and see a complete operational record without jumping to donor-specific pages
or spreadsheets"_ — **and no legacy donor grid, drawer, or detail routes
remain.**

**Launch-AC disposition:** the ~30 launch acceptance criteria are adopted as
restated throughout §A–§F, with these amendments: "PRD decides generic vs
specific vs hybrid" is **DECIDED** (A1/A2 — shared-PK subtyping, no generic
`crm_records`); the migration/defaulting ACs are **dead per D6** (replaced by
the schema tranche + seed regeneration); "Twenty remains a provider behind
Asym contracts" is **superseded by ADR-0001**. New binding ACs from the
grill: any filtered state shareable as a URL (A14.3); the `, % ( )`
round-trip (A14.4); keyset-only + facet endpoint (A14.4–5); every `/crm*`
route in the e2e a11y spec (A14.7); the four cross-surface leak tests; the
seeded duplicates/tombstones/assignment-edges requirement (E4).

**Acceptance artifacts:** the permanent negative/safety tier + structural CI
gates pass; the F1 ADR is authored; the C2/C1 amendment one-liners land on
the Phase 7/Phase 4 PRDs; the C6 congruence touches land (phase-map row-9
qualification, parity-matrix row, OpenSpec delta); the glossary pass lands
in `CONTEXT.md`; and the **evidence file** (Phase 0 Built/Live/Confirmed
discipline, under `docs/ops/phase-evidence/`) records migrations applied,
the full test suite incl. the negative tier, route/API checks, seeded-demo
walkthrough (duplicates queue, merge tombstone, owner chips populated), and
the explicit list of what Phase 9 did **not** build (the sockets and
reserved seams above).

---

## Tracking Issues

_Epic + children created via `/to-issues` after PRD approval. Launch 21-issue
mapping: #1/#2 kept (merged into T1); **#3 obsolete — decided by the grill**
(A1/A2); #4–#18/#20/#21 reshaped below; **#19 dead per D6** (replaced by the
schema tranche + seed regeneration in T2); #14 becomes socket-only (registry
in T8; governed content/sender/reply lights with Phase 17 and
dispatch/outcomes/history with Phase 6)._

> **Final slicing (created 2026-07-06): epic #604 + children #605–#627.**
> The published set refines the first-pass skeleton below (house precedent:
> Phase 4 renumbered at `/to-issues` too): T3 split into **#607**
> (stored graph) + **#608** (derived views/UNION); T5+T6 merged into **#611**
> (list engine + saved views); T7's legacy deletion split out as **#623**;
> T11 split into **#616** (Notes) + **#617** (timeline); a dedicated
> **merge-membership** ticket **#610** was added (extends Phase 4
> #512/#514); the Relationships tab is **#625**, duplicates **#626**, the
> safety-tier assembly **#627**, the evidence file **#624**. Full map:
> #605 docs · #606 spine · #607/#608 graph · #609 roles · #610 merge ·
> #611 engine · #612 routes · #613 shell · #614 Overview/Contact ·
> #615 Giving · #616 Notes · #617 timeline · #618 tasks · #619 search ·
> #620 write path · #621 export · #622 enforcement · #623 legacy deletion ·
> #624 evidence · #625 Relationships tab · #626 duplicates · #627 tier.
> Foundation `status:todo`: #605 only; #606 carries
> `status:blocked-on-Phase-4` + `status:blocked-on-Phase-7-T4`; #610/#626
> carry `status:blocked-on-Phase-4`; the rest are `status:blocked` inside
> the phase. No `ready-for-agent` until dispatch.

- **{{EPIC}}** — Phase 9: Full CRM Depth & Relationship Graph.
- **{{T1}}** — Docs: PRD; the F1 ADR; OpenSpec delta; `CONTEXT.md` glossary;
  Phase 7 §C2 / Phase 4 §C1 amendment one-liners; C6 congruence touches.
  _(foundation)_
- **{{T2}}** — Party spine additions: `lifecycle_status` + `tags` +
  `merged_into_party_id` on the Phase-7-T4-built spine (parties, shared-PK
  subtypes, `org_type`, `donors.party_id` ship with Phase 7 as amended —
  this ticket extends and verifies, never rebuilds); never-created / dropped
  column dispositions; seed regeneration incl. synthetic duplicates, merged
  tombstones, staff-assignment edges (E4). _(prereq: Phase 4 + Phase 7 T4,
  C1/C2)_
- **{{T3}}** — Relationship graph: `crm_relationships` +
  `crm_relationship_types` + catalog seed per the disposition table + derived
  views + the provenance UNION surface + `supports_policy_v1` (B2/B3).
  _(blocked on T2)_
- **{{T4}}** — Derived-roles view (B4) + the D3 enforcement tiers (authz
  import gate, schema-shape test, contact-column migration lint). _(blocked
  on T3)_
- **{{T5}}** — List-engine core: parameterized predicates + cursor-envelope
  rebuild + facet endpoint + count budgets + virtualization fixes (B10, B12).
  _(blocked on T2)_
- **{{T6}}** — Saved views + URL-as-state + generalized named-views payload
  (B11; A14.1–3, 9). _(blocked on T5)_
- **{{T7}}** — Routes + Next 16 architecture: `/crm` layout, kind routes,
  detail pages + `@drawer` interception; **delete** the legacy grid, drawer,
  `?donor=` machinery, and monolithic detail service. _(blocked on T5)_
- **{{T8}}** — Record shell: header contract + tab registry + the eight
  hidden sockets + reserved action slots (A10, B5). _(blocked on T7)_
- **{{T9}}** — Overview + Contact tabs: family panel, support-vs-goal,
  key-contacts strip, labeled `donors.score`, consent & preferences section.
  _(blocked on T8)_
- **{{T10}}** — Relationships tab + relationship-management slice (add / end
  / re-role; provenance display). _(blocked on T3, T8)_
- **{{T11}}** — Notes + Activity + timeline: `crm_notes`,
  `crm_activity_events`, the composed UNION surface + member-care exclusion
  (B7–B9). _(blocked on T8)_
- **{{T12}}** — Giving tab: operation-shell carryover (#270) + Commitments +
  payment-instruments read panel (B16) + the four A10 reserved columns + the
  "request payment update" action socket. _(blocked on T8)_
- **{{T13}}** — Tasks: `'party'` task links + reverse index +
  tasks-for-party service + Tasks tab + `/crm/tasks` route. _(blocked on T8)_
- **{{T14}}** — Write path + Audit: `crm_audit_events`, the A17 transactional
  command core (B15), the Audit tab + Phase 8 ops-indicator socket.
  _(blocked on T2)_
- **{{T15}}** — Cmd-K search: `pg_trgm` + the UNION search surface + endpoint +
  permission binding; replaces the demo SearchDialog (B13). _(blocked on T2)_
- **{{T16}}** — Duplicate visibility: header banner + `/crm/duplicates`
  routing into the Phase 4 merge workbench (#514). _(blocked on T8;
  prereq: Phase 4)_
- **{{T17}}** — Governed CSV export through Phase 3 export governance (B14).
  _(blocked on T5)_
- **{{T18}}** — Permission/projection enforcement + the cross-surface leak
  negative-test bundle. _(blocked on T8–T15)_
- **{{T19}}** — Permanent negative/safety tier + structural CI gates + e2e
  a11y registration of every `/crm*` route. _(blocked on T2–T18)_
- **{{T20}}** — Phase 9 evidence file (Built/Live/Confirmed). _(blocked on
  T19)_

**Related:** program charter + parity matrix + phase map; predecessor epics
Phases 2–8; ADR-0001. **Prerequisites (must land first):** Phase 4 isolation
plumbing + A9 merge contract; Phase 7 §D/T4 as amended (C2). **Soft:**
Phase 8 re-groom (#603) for the Audit-tab socket content; Phase 17 for governed
message content/sender/reply configuration and Phase 6 for consent-aware
dispatch/outcomes/history behind the comms/secure-link sockets.

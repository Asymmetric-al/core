# Design: Build The CRM, CMS And Database Foundation

## Status And Authority

This design summarizes, and points into, the
[CRM, CMS and database plan](../../../docs/audits/core-crm-cms-database-target-architecture.md)
("the plan"). It does not restate the plan and does not replace it: where this
summary and the plan differ, the plan governs, and inside the plan each work
package's acceptance list governs its own behaviour (plan section 12). The
factual baseline is the [audit](../../../docs/audits/core-crm-cms-database-audit.md);
the ratification and its twelve reservations are in
[section C.8 of the council record](../../../docs/audits/core-crm-cms-database-council-record.md#c8-final-review-and-ratification).

The owner's instruction of 17 November 2026 to implement the whole plan is the
ratifying instruction for the dispositions in plan section 14. The owner
decisions of plan section 15.1 are taken at their stated defaults, as the
[implementation record](../../../docs/audits/core-crm-cms-database-implementation-record.md#6-decisions-and-deviations)
records in D-01 to D-08. They are defaults taken, not fresh owner rulings.

Nothing here is implemented. The implementation record is the only place that
says what is implemented, integrated or verified.

## The Ten Decisions (plan section 11.2)

| #   | Decision                           | Adjudicated outcome                                                                                                                                          | Recorded in                               |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| 1   | How the public reads content       | Per-page immutable release rows in Core; one publish may activate several documents in one transaction; whole-Site generations deferred with stated triggers | ADR-0229; ADR-0145, 0027, 0030 amendments |
| 2   | Isolation inside `cms`             | Application-enforced through one factory and two ports, with the runtime role confined to `cms`; a stated exception                                          | ADR-0227, 0225; ADR-0028 amendment        |
| 3   | How human server work reaches data | The caller's token for reads and commands; the service key only for the platform allowlist and for system entries that derive their tenant from stored rows  | ADR-0224                                  |
| 4   | Owner of missionary updates        | Operational `posts` with review state                                                                                                                        | ADR-0230                                  |
| 5   | CMS tenant and Site records        | No `cms.tenants`; `site-presentations` shares the Site's ID as a soft reference                                                                              | ADR-0207 amendment                        |
| 6   | Existing hosted data               | Census with owner sign-off, then rebuild from source; transform only what the owner keeps; production in place or fresh is the owner's call                  | ADR-0226; ADR-0179 amendment              |
| 7   | Identity model depth               | Party, account link and ministry assignment now; households, organizations and the relationship graph later                                                  | ADR-0213 amendment                        |
| 8   | Legal entity and merchant binding  | Created before any real charge; Stripe Connect with tenant-owned accounts                                                                                    | ADR-0234, 0235, 0237                      |
| 9   | Media                              | Private immutable bytes, synchronous metadata stripping, a Core route that checks the asset is live; separate derivative worker deferred                     | ADR-0231; ADR-0126, 0171 amendments       |
| 10  | Block storage                      | JSON blocks if the qualification suite passes, otherwise relational                                                                                          | ADR-0178 amendment                        |

Preserved dissent: decision 1 does not give one Site-wide head, so two separately
cached fragments can disagree briefly (plan section 11.3). What would change the
recommendation, and the smallest test for each, is plan section 11.4.

## Mechanisms In Summary

### Tenant and authorization (plan section 5)

- **Authority** is one live row in `authz.memberships`; tenant administration is a
  flag on a staff row; every other authority is a capability from the code
  registry. Each request acts under exactly one assignment, named in a request
  header beside the tenant header (plan 5.1; ADR-0227, ADR-0210 amendment).
- **The tenant is carried** by the verified domain on every surface: the public site, the donor portal, Mission Control and the missionary workspace are served on the organization's home domain, the dashboards under paths, with only `~<sub-role>` in the address; Web Studio's path-scoped signed cookie carries the chosen membership and is refused when its organization differs from the domain's (plan 5.2; ADR-0227, ADR-0174 amendments; amended 2026-11-24 by change `adopt-tenant-owned-domains`; earlier, the tenant was the first path segment).
- **Enforcement by caller** is the table in plan 5.3; the new
  `identity-and-access` requirement states it.
- **Policies and commands.** One policy pattern (the row's tenant equals the
  request's active tenant), governed tables written only through SQL command
  functions owned by the non-bypass `tenant_guard` role, worker entry points
  reached through tenant-deriving wrappers, platform commands in a `platform`
  schema behind the operator list and MFA, and two named system entries: gift
  intake and publish fulfilment (plan 5.4; ADR-0224, ADR-0228, ADR-0236).
- **Revocation and people.** Membership checks are live on every path; a
  tenant's erasure stops at that tenant; closing an account is the person's own
  act (plan 5.5; ADR-0239).

### Payload (plan section 6)

- Payload owns presentations, pages, navigation, media editorial records, drafts,
  versions and locks, and nothing operational (6.1, 6.2).
- `tenantScoped()`, an actor port and a service port keep content in its tenant
  (6.3). References to Sites, missionaries and funds are soft UUIDs checked at
  save, at publish and at read (6.4). Payload's strategy calls Core's resolver
  (6.5).
- Publishing, preview, versions and media follow the publishing contract and
  media custody (6.6; ADR-0229, ADR-0231). The version line and the
  qualification suite are 6.7 (ADR-0178 amendment).

### Schemas, roles, release (plan section 7)

- One migration owner per schema and one role per runtime (7.1, 7.2; ADR-0225).
- Three stops against a second schema writer (7.3).
- One release job per environment, an environment marker, and repair rather
  than reset (7.4, 7.5; ADR-0226).

### Consistency and lifecycle (plan section 8)

- Each money step is one SQL command with its own effect key; claimed work holds
  a lease; provider retries stop at the provider's window; events are reduced,
  not trusted in order (8.1 to 8.3; ADR-0233).
- Corrections append to write-once posted tables; merges are non-destructive;
  imports are bounded jobs; foreign keys to tenants restrict; a tenant is never
  cascade-deleted (8.4; ADR-0206 amendment).
- Point-in-time recovery for rows, a second store for bytes, and a restore
  rehearsal (8.5).

## Affected Apps, Packages And Stores

- Apps: `apps/admin` (Mission Control, Web Studio, operator area, preview),
  `apps/donor` (public site proxy admission, checkout, donor portal),
  `apps/missionary` (workspace under `/missionary` on the home domain; amended 2026-11-24).
- Packages: `packages/api` (principal resolver, projection resolver,
  `withOperation`, public reader, storage module, Auth admin module, money
  commands' callers), `packages/auth` (capability registry, proxy role check),
  `packages/database` (scoped browser data layer), `packages/ui` (block registry,
  auth screens), `packages/graphql` (retired in WP4b on the D-07 default).
- Database: `public`, `authz`, `tenant_guard`, `platform`, `private` and `cms`
  schemas; new roles `cms_owner` and `cms_runtime`; private media, receipt and
  import buckets.
- Providers: Supabase (Auth, Storage, Data API), Stripe Connect, Vercel, a bot
  challenge provider (Cloudflare Turnstile by default).
- CI and gates: the catalog gate, the service-key gate, the field-policy
  manifest, frozen acceptance suites, and the release and preview workflows each
  change in the package that replaces their seam (plan 7.1).

## Section 14 Dispositions And Where Each Is Recorded

| Section 14 row                                                                                                       | Disposition                                                                                          | Recorded in                                                                              | State                                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `identity-and-access`, `platform-boundaries` specs and contracts                                                     | Add callers requirement and `cms` exception; CMS owns publishing state stored in Core release tables | This change's two spec deltas                                                            | Done; Phase 23's own D1 requirement left as the later target (see below) |
| ADR-0001, 0003, 0012, 0210, 0213, 0214, 0215, 0216                                                                   | Keep; clarify 0213                                                                                   | ADR-0213 amendment                                                                       | Done                                                                     |
| ADR-0124                                                                                                             | Keep; fund ID as interim                                                                             | ADR-0124 amendment; ADR-0237                                                             | Done, on default D-05                                                    |
| ADR-0207                                                                                                             | Amend: `site-presentations`, soft reference                                                          | ADR-0207 amendment                                                                       | Done                                                                     |
| ADR-0174                                                                                                             | Amend: adopt authority clauses, operators and grants, defer diagnostics, record carriers             | ADR-0174 amendment and clause 7                                                          | Done; page address (D-06) superseded 2026-11-24                          |
| ADR-0178                                                                                                             | Keep; add suite contents                                                                             | ADR-0178 amendment                                                                       | Done                                                                     |
| ADR-0179                                                                                                             | Keep; widen census                                                                                   | ADR-0179 amendment                                                                       | Done                                                                     |
| ADR-0027, ADR-0030                                                                                                   | Amend: release-backed reader; no publish signal                                                      | ADR-0027 and ADR-0030 amendments                                                         | Done                                                                     |
| ADR-0028                                                                                                             | Amend its RLS statement                                                                              | ADR-0028 amendment                                                                       | Done                                                                     |
| ADR-0145 and dependent Phase 23 decisions                                                                            | Amend first-release scope                                                                            | ADR-0145 amendment; Phase 23 decision log under D1                                       | Done, on default D-05; `add-web-studio-cms` delta unchanged              |
| ADR-0126, 0171                                                                                                       | Amend first-release media scope                                                                      | ADR-0126 and ADR-0171 amendments                                                         | Done                                                                     |
| ADR-0119                                                                                                             | Keep; two narrowings                                                                                 | ADR-0119 first-release record                                                            | Done                                                                     |
| ADR-0206                                                                                                             | Keep; physical layout                                                                                | ADR-0206 amendment                                                                       | Done                                                                     |
| Phase 13 PRD (D5, D7.a); Phase 20 decision log                                                                       | Keep; interim giving targets                                                                         | ADR-0237                                                                                 | Done; neither source file edited, because the row is Keep                |
| `public-ministry-pages` contract (D14)                                                                               | Record first-release narrowing                                                                       | ADR-0119 first-release record; this design                                               | Partly: the contract states the target and is unchanged                  |
| `add-guest-giving-and-gift-anonymity`                                                                                | Keep                                                                                                 | Nothing                                                                                  | Done                                                                     |
| `donation-lifecycle` spec                                                                                            | Narrow the cart; amend legacy recurring scenarios                                                    | This change's `donation-lifecycle` delta                                                 | Done                                                                     |
| `identity-and-access` contract (processor identifiers; receipt census)                                               | Amend                                                                                                | New contract section bound by the `sitestacker-parity` delta; dated note in its proposal | Done                                                                     |
| ADR-0210                                                                                                             | Keep; add capabilities                                                                               | ADR-0210 amendment                                                                       | Done, names on default D-08                                              |
| ADR-0209                                                                                                             | Keep; manifest                                                                                       | ADR-0209 amendment                                                                       | Done                                                                     |
| Phase 10 PRD; Phase 30, ADR-IM-018                                                                                   | Keep; amend PRD in five places                                                                       | Phase 10 PRD dated amendment and inline notes                                            | Done                                                                     |
| ADR-0003, 0012–0017, roadmap Phases 10, 16, 30                                                                       | Keep; record WP5/WP14, WP12, WP13 against phases                                                     | Roadmap section added 2026-11-17                                                         | Done                                                                     |
| `platform-surfaces` (GraphQL)                                                                                        | Amend if the endpoint is retired                                                                     | This change's `platform-surfaces` and `donation-lifecycle` deltas                        | Done, on default D-07                                                    |
| `docs/security/tenant-guard.md`, `tenant-read-floor.md`, `donor-feed-preferences-rls.md`, data-access boundary guide | Amend with the code                                                                                  | Not here: each package amends them with the code it changes                              | Left to packages                                                         |
| Stripe Connect topology                                                                                              | Write the missing ADR                                                                                | ADR-0234; ADR-0011 note                                                                  | Done                                                                     |
| Financial ADR groups                                                                                                 | Adopt Seat B's release classification                                                                | This design (below); roadmap section                                                     | Done                                                                     |
| New decisions needed                                                                                                 | Write them                                                                                           | ADR-0224 to ADR-0239                                                                     | Done                                                                     |
| Roadmap                                                                                                              | Record target intent, sequence WP0–WP14, place launch items                                          | Roadmap section added 2026-11-17                                                         | Done                                                                     |

## First-Release Narrowings

Each narrowing keeps the accepted target and says what the first release builds.

- One reach default per tenant, not per Legal Entity, Site and page family
  (ADR-0119).
- No redirect when a Listed page changes path; the old path returns 404
  (ADR-0119).
- No search and share manifest, structured data or sitemap; a link-only page
  carries `noindex`; a later sitemap lists Listed heads only and passes admission
  on every request (`public-ministry-pages` D14; ADR-0119, ADR-0030).
- Per-page releases with multi-document activation instead of whole-Site
  generations (ADR-0145; Phase 23 D1).
- In-process decoding within pixel limits with a metadata re-read; sandboxed
  decoding and a malware disposition deferred (ADR-0126, ADR-0171).
- A cart covers one Legal Entity until payment groups are built
  (`donation-lifecycle` delta).
- No Engine Diagnostics Session, governance epochs or decision digests
  (ADR-0174).

## Deltas And Records That Rest On A Default

| Item                                                                                                     | Default (implementation record)                                             | If the owner decides otherwise                                                                                              |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `platform-surfaces` REMOVED GraphQL; `donation-lifecycle` Gift Begin replaced by its HTTP-only successor | Retire the endpoint (D-07)                                                  | Withdraw those deltas and restore the earlier Gift Begin requirement; the endpoint's mutations go through the same commands |
| ADR-0145 and Phase 23 D1 first-release amendment; ADR-0229                                               | No atomic multi-page launch (D-05)                                          | The amendment lapses and decision 1 returns to plan section 11.4                                                            |
| ADR-0124 amendment; ADR-0237 page target                                                                 | Fund ID as interim (D-05)                                                   | The page target waits for Designations                                                                                      |
| ADR-0174 amendment, ADR-0227: the tenant in the page address                                             | Page address (D-06); superseded: the domain                                 | One signed cookie for every staff surface, with a further ADR-0174 amendment                                                |
| ADR-0228 grant limits                                                                                    | 15 minutes, 60-minute ceiling, no care records (D-06)                       | ADR-0228 records the owner's limits                                                                                         |
| ADR-0239 published content on erasure and closure                                                        | One-way withdrawal; closure changes nothing (D-06)                          | ADR-0239 records the owner's rule                                                                                           |
| ADR-0230 editable profile fields; posts start approved                                                   | Story, photo, display name; yes (D-07, D-08)                                | ADR-0230 records the owner's choice                                                                                         |
| ADR-0232 partners-only audience                                                                          | Followers (D-08)                                                            | ADR-0232 records the owner's rule                                                                                           |
| ADR-0210 capability names; ADR-0119 security levels                                                      | As proposed (D-08)                                                          | The records list the owner's names and level behaviour                                                                      |
| ADR-0235 admitted scope; ADR-0236 provider and abandonment period                                        | Cards, one issuer, country and currency; Turnstile; seven days (D-07, D-08) | The records name the owner's choice                                                                                         |

## Financial ADR Release Classification

Plan section 14 adopts Seat B's classification of the financial decision records:

- **Foundations now:** ADR-0002, ADR-0003, ADR-0044, ADR-0108 (assignment
  separation only), ADR-0206, ADR-0207, ADR-0208.
- **With offline giving:** ADR-0007 to ADR-0010.
- **Before recurring giving:** ADR-0012 to ADR-0017.
- **With statements:** ADR-0040 to ADR-0042.
- **The rest:** later roadmap.

The classification sequences delivery. It does not change any of those records'
accepted intent.

## Data Ownership, Security, Compatibility And Migration

- Ownership is the plan's section 4 map. Each fact has one canonical store and
  named writers; CRM wins where CRM and CMS disagree.
- Security boundaries are the `identity-and-access` delta and ADR-0224 to
  ADR-0228. The application-enforced exceptions are stated, not implied.
- Compatibility: each migration is safe for the release already running (expand,
  then contract); hosted data is untouched until the owner signs off the census
  (D-01, D-02). Existing gates and frozen suites move with the package that
  replaces their seam.
- Validation: each package proves its acceptance list on disposable databases
  and CI; the platform proofs of plan section 15.2 run before what depends on
  them, and a failed proof with no named fallback stops its package and returns
  to the owner.
- Rollback is per package and stated in each package; after real data, forward
  only.

## Open Owner Questions And Reservations

- D-01 and D-02: the census decision and the production-named project. Neither
  has a default that permits a reset.
- D-03: proofs that need a disposable hosted project run locally first; their
  hosted run is prepared and recorded as not yet run.
- The council's twelve reservations stand (council record C.8), among them: no
  package is sized; the launch default leaves offline gifts, official statements,
  follower email and accounting export out of the first tenant unless the owner
  chooses them as gates; frozen fund and ministry-assignment IDs need a mapping
  to Designations when Phase 13 lands; restricted workers are exposed to staff on
  fixtures between WP5 and WP14; the release pipeline names no runner for
  scheduled work.

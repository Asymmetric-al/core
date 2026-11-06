# R10 gap-fill G2: the real carrier for source bindings and merge redirects

Research track for the Phase 30 (`imports-migration`) founder grill. Read-only.
Repo: `C:/Users/Conrad/.t3/worktrees/core/t3-73d54b3d` at develop `629cb71dc`.
Access date for all evidence: 2026-10-31 (repo) and 2026-11-01 (repo re-reads and GitHub issues).

Evidence labels used below: **proposed** (draft, not accepted), **ratified owner
intent** (ADR / founder or charter ruling), **published spec** (PRD, roadmap,
owner-constraints, issue body), **integrated source** (in the develop tree),
**implemented** (integrated source that a runtime path actually exercises),
**qualified** (proved by a real-database or acceptance test), **activated**
(live for tenants). Static reading of migrations proves only "integrated
source"; nothing here was run against a database.

## The gap

Earlier tracks disagree:

- r03, r04, r06, r07 (V2) treat `crm_record_links` as a retired Twenty leftover
  that Phase 30 must not reuse.
- The 2026-10-24 ADR-0001 amendment and migration `20261024120000` treat it as a
  live, append-only, lockstep-governed Phase 9 socket.
- r02 and r06 call `donor_merge_redirects` an unused prototype, while the
  integrated #2254 contract reportedly names it the redirect store.

This file resolves which table carries what, with citations.

Status: complete (resumed 2026-11-01 after two interrupted attempts that had
written only the header and gap statement).

## 1. Baseline: what Phase 30 itself asks for

All published spec (roadmap chapter and retained owner obligations), not
implementation.

- `docs/prds/sitestacker-parity/roadmap.md:4363` says: "Preserve external IDs,
  source system, batch identity, occurrence and recorded times ... Reimport
  converges on the same permitted target identity instead of creating another
  copy. Provide per-record lineage and reconciliation against the source
  export."
- `roadmap.md:4371` says reversal "must not delete a real Party after merge,
  erase later staff edits or rewind financial history".
- `roadmap.md:4377` says: "Phase 30 owns transport, staging, mappings, plans and
  import-run evidence ... Phase 4 owns identity/merge".
- `roadmap.md:4409` lists, as open grooming decisions, "whether a target
  supports update, append, merge or reference-only import".
- `docs/prds/program-roadmap/owner-constraints.md:373-377` requires "Stable
  external/source IDs on all importable records: re-import updates instead of
  duplicating"; financial roots also pin "exact Tenant, Legal Entity,
  currency, source system, and stable external ID".
- `owner-constraints.md:378-385` requires batch provenance on created and
  updated records and time-boxed undo; "The undo-after-merge hazard (Planning
  Center documents it deleting real people) is explicitly blocked."
- `owner-constraints.md:481-484` (Phase 31) says the connector registry
  holds "provider links (generalizing `crm_record_links` — this phase co-owns
  the Phase 9 External-IDs socket with imports)".

Neither baseline names a table for Phase 30 source bindings or for merge
redirects. The carrier question is decided upstream (Phase 9, Phase 4,
ADR-0001, the #2254 contract). The sections below cover each one.

## 2. `crm_record_links`: intent, integrated source, implementation

### 2.1 Ratified owner intent: kept as the generalized provider-link table

The founder never ruled `crm_record_links` retired. The earliest ruling keeps
it.

- `docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:3` is a
  founder ruling (Phase 9 grill, 2026-07-06). Decision 3 (`:72-79`) retires the
  Twenty-specific code, then adds: "Reusable Asym-serving pieces are kept:
  `crm_record_links` (generalized provider links), `crm_merge_candidates` +
  duplicate detection (feeds the Phase 4 merge workbench), `crm_command_logs`
  ...". Consequences (`:107-108`) put imports (Phase 30) on "one local
  database".
- Phase 9 PRD (groomed 2026-07-06, `phase-09-full-crm-depth-relationship-graph.md:8-9`):
  - A1 (`:323-328`) says a generic master table "would duplicate
    `crm_record_links`".
  - The hidden record-shell sockets (`:430-434`) include "External IDs /
    provider links (P30/P31, over `crm_record_links`)".
  - The relationship-catalog footnote (`:846-847`) says "Imported/legacy
    provenance is a Phase 30 concern carried by `crm_record_links`, never a
    party_kind or status".
  - Deferrals (`:986`) say "Full import tool → Phase 30 (External-IDs socket
    reserved; provider-link registry pairs with Phase 31)".
- Phase 4 PRD (groomed 2026-07-04, amended by Phase 9):
  - A9 (`phase-04-identity-account-claiming-foundation.md:185`) lists
    `crm_record_links` among the "eligible mutable CRM references" that
    re-point to the survivor on merge.
  - Reuse (`:264`) says "`crm_record_links` (provider links — Stripe now,
    Mailchimp later; the second Stripe customer from a merge lands here)".
  - The reserved seam (`:266`) keeps the enum "for generalized provider links
    only (re-scoped 2026-07-06, ADR-0001)".
- `owner-constraints.md:481-484` says Phase 31 provider links are
  "generalizing `crm_record_links` — this phase co-owns the Phase 9
  External-IDs socket with imports".
- `openspec/contracts/crm-core.md:112-124` says each link "MUST preserve the
  source concept, source id, tenant, confidence, status, verification state,
  and repair metadata".
- `openspec/changes/complete-twenty-crm-retirement/design.md:26-29` (active
  change) says: "Do not drop generalized command/merge/link records or
  reinterpret historical identifiers as live Twenty ownership."
- ADR-0001 amendment 2026-10-24 (`:142-164`): Samson (factory lead), "under
  Blake's charter", ruled that "#570 party rows carry provider links via
  `crm_record_links`" (`:149-150`). The lockstep rule (`:160-164`) covers the
  enum only: "the DB enum, the `CrmIdentityConceptId` union and
  `CRM_IDENTITY_CONCEPTS` change together, append-only ... Any later value
  needs its own consumer and its own amendment here."

**Correction to the gap statement.** "Append-only" in ADR-0001:160-161
governs the enum labels: no rename, reorder or removal. It does not govern the
link rows. The rows are mutable (see 2.3).

### 2.2 Integrated source: the table exists with its Twenty shape

- `supabase/migrations/20260508000413_crm_identity_mapping.sql:73-90` defines
  these columns:
  - `crm_provider TEXT NOT NULL DEFAULT 'twenty'`. The CHECK was dropped by
    `20260818010000_retire_twenty_crm_runtime.sql:21-22`. The column and its
    default remain.
  - `twenty_object_name TEXT NOT NULL` and `twenty_record_id TEXT NOT NULL`.
  - `asym_entity_type crm_link_entity_type NOT NULL`.
  - `asym_entity_id TEXT NOT NULL`. This has no foreign key and no composite
    tenant FK, so the database does not tie a link to a real same-tenant
    target row.
  - `relationship_type`, `link_status` (`active / suspected_duplicate /
merged / archived / rejected`, `:23-30`), `confidence`, `verified_at/by`,
    `last_seen_at` and `metadata`.
- Uniqueness is keyed on Twenty names. `idx_crm_record_links_unique_entity`
  (`:95-103`) is `(tenant_id, crm_provider, asym_entity_type, asym_entity_id,
twenty_object_name) WHERE link_status = 'active'`.
  `idx_crm_record_links_unique_twenty_record` (`:105-113`) is unconditional on
  `(tenant_id, crm_provider, twenty_object_name, twenty_record_id,
asym_entity_type, asym_entity_id)`. Neither index enforces "one Asym target
  per (tenant, source system, source instance, entity kind, source id)", which
  is the shape repeat-import convergence needs (`roadmap.md:4363`). The
  second index lets one source id bind to many targets.
- No column for source _instance_, link _purpose_ (provider execution, import
  provenance or reconciliation), import batch or run exists. No later
  migration adds one (grep of `supabase/` for `crm_record_links`: the only
  later hits are `20260818010000`, `20261024120000` and `20261024163000`).
- The retirement migration keeps the table on purpose: "Keep Asym-owned
  leftover link/audit tables; drop Twenty-only sync tables"
  (`20260818010000:9`). It re-comments it as "Tenant-scoped leftover provider
  links for Asym identity concepts. Historical Twenty record ids may remain as
  retired references; they are not CRM truth" (`:33-34`). It records
  `COUNT(*) = 0` on dev and prod on 2026-08-18 (`:2-8`).
- `20261024120000_crm_link_entity_type_party_values.sql:1-16` appends
  `household` and `organization`. Its header says "no table, trigger or
  link-write path uses the new labels yet" (`:5-7`). #2257 (CLOSED
  2026-10-24) calls the widening "additive and inert". Its done criterion 7
  says "No new table, trigger or link-write code references the new values"
  (gh issue view 2257, 2026-11-01).
- TypeScript lockstep: `packages/api/src/crm/identity/concepts.ts:1-18`
  (union of 17) and `:181-198` (household and organization entries). The
  parity test `tests/unit/packages/api/crm-identity-parity.test.ts` derives
  the enum from the migration chain. Real-stack enum tests are in
  `tests/unit/acceptance/issue-2257/`. These are structural proofs about enum
  labels. They prove nothing about link rows.

### 2.3 The direct staff DML hole is still open on develop

- `20260508000413:200` enables RLS. `:204` says `GRANT SELECT, INSERT, UPDATE
ON TABLE public.crm_record_links TO authenticated`.
- The INSERT and UPDATE policies (`:220-240`) require only
  `authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL)`.
  With `required_staff_roles = NULL`, any active staff membership in the
  tenant qualifies, whatever its staff role
  (`20260226113000_authz_memberships_foundation.sql:181-202`). No capability
  check applies.
- `20261024163000_authz_definer_execute_lockdown.sql:39-41` re-scopes these
  policies `TO authenticated`. Its header says "USING and WITH CHECK are
  untouched" (`:18-22`). `20261025070000_force_rls_tenant_tables.sql:13` says
  "No policy, grant, owner or function is created or changed here". FORCE
  binds the table owner only.
- No migration on develop revokes these grants (grep for `REVOKE` on
  `crm_record_links` and on `ALL TABLES IN SCHEMA` returns nothing).
- **A published fix exists but is not integrated.** #2295 ("[Phase 12] #668
  slice (d1): RLS rewrite to tenant-only on staff tables", OPEN, no Ready
  label) has a "Final spec r2" (2026-10-24T22:21Z). It plans migration
  `20261024234000_rls_tenant_only_staff_tables.sql`, which would run
  `REVOKE ALL ON TABLE <t> FROM PUBLIC, anon, authenticated` on 12 tables,
  including `crm_record_links` and `crm_merge_candidates`. It would also
  recreate their policies in a tenant-only form as a floor. Samson approved
  it at 2026-10-24T22:22Z ("OQ1 (hardening): REVOKE ALL FROM PUBLIC, anon and
  authenticated on all 12 tables, with no grant back"). The approval says it
  is "pending Ready (prep only)" and "Blocked by #2293 and #2294". No PR was
  found (gh search prs "2295" and "rls_tenant_only_staff_tables", both empty,
  2026-11-01). The migration is absent from `supabase/migrations/` at
  `629cb71dc`. The spec's census says "`crm_record_links`: no code reference".
  It also warns that without the revoke, a tenant-only policy would let a
  donor read CRM-identity rows once #2298 lands. So the hole is known to the
  factory, and its closure is specified, approved and blocked.
- Result: any active staff member can INSERT a link pointing at any
  `asym_entity_id` text, or UPDATE an existing link to re-point
  `asym_entity_id`, `link_status` or `confidence`, straight through PostgREST.
  This needs no typed command or audit row. There is no DELETE grant, but
  UPDATE to `link_status = 'archived'` or `'rejected'` has the same effect.
  `crm_merge_candidates` has the identical hole (`:206`, `:251-271`;
  `20261024163000:42-44`).

### 2.4 Implemented, qualified, activated: none

- No TypeScript reads or writes the table. A grep of `apps/`, `packages/`
  and `scripts/` for `crm_record_links` finds only the description string at
  `concepts.ts:65`. The only CRM-identity consumer is a read of
  `crm_merge_candidates` at `packages/api/src/admin/crm/detail/service.ts:295`.
- The party spine has no writer either. #570 is OPEN. Its slice a, #2271
  (OPEN, labelled Ready), lists "`crm_record_links`/enum changes (#569/#2257)"
  and "merge re-pointing (#512)" as out of scope (gh issue view 2271, body
  line 32, 2026-11-01). The #570 body also demotes the dependency: party rows
  carry links "only if/when a generalized provider link actually needs the
  new members" (gh issue view 570, body line 57).
- No row data was checked (no database access). The only row evidence is the
  2026-08-18 `COUNT(*) = 0` comment.

**Verdict for `crm_record_links`:**

| Tier              | Status                                                                                                                                                    | Evidence                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Ratified intent   | It is the generalized provider-link carrier and the Phase 30/31 External-IDs socket.                                                                      | ADR-0001:72-79; P9:433-434, 846-847; P4:185, 264; owner-constraints:481-484 |
| Integrated source | The table, an enum widened to 17 values and lockstep TypeScript exist. The columns and indexes are still Twenty-named and not shaped for import bindings. | Migrations cited in 2.2                                                     |
| Implemented       | No                                                                                                                                                        | No reader or writer                                                         |
| Qualified         | Enum parity only                                                                                                                                          | issue-2257 tests                                                            |
| Activated         | No                                                                                                                                                        | No writer; 0 rows on 2026-08-18                                             |

So "retired Twenty leftover that Phase 30 must not reuse" (r03 M1, r04 §5,
r06 2.5, r07 V2) misstates owner intent. ADR-0001 kept the table. The
CRM-retirement invariant in `AGENTS.md` forbids restoring Twenty clients,
sync, cutover and rollback paths. It does not forbid the Asym-owned link
table. What those tracks got right is narrower: the current _column and
index shape_ is Twenty-named and does not fit import bindings, and nothing
writes the table. "Governed socket, use as-is" is also wrong. Only the enum is
governed. The row model, uniqueness and write path are not governed, not
built, and open to direct staff DML.

## 3. The merge redirect store

### 3.1 Four named mechanisms, at two levels

| Mechanism                                          | Level | Named by                                                                                                                              | Integrated?                                |
| -------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `donors.merged_into_donor_id` column tombstone     | Donor | P4 A9 `:185`, schema `:254`, key `:268`; ADR-0216 `:19`; #512 body lines 16 and 40                                                    | No. Dropped by Q7 (3.2).                   |
| `donor_merge_redirects` table (merged → surviving) | Donor | Migration `20260704140000:77-126`; #2254 Q7; the #2254 contract `identity-email-normalization.md:83-90`; #512 amendment of 2026-10-24 | Yes, as an integrated table with no writer |
| `parties.merged_into_party_id` column tombstone    | Party | P9 `:414-415`, `:762`, `:856`; #606 spec r1 (approved 2026-10-24); slice #2278 (OPEN, not Ready)                                      | No                                         |
| `merge_operations` replayable record               | Both  | P4 `:262`; ADR-0216 `:19-20`; P9 `:415`; #512 body line 17                                                                            | No                                         |

### 3.2 Donor level: Q7 is an explicit later ruling, but the ADR and PRD clauses were never edited

- **Ticket ruling.** On #2254, the "Rulings (Oct 24, 2026)" comment
  (2026-10-24T12:55Z) says: "**Q7**: Keep the existing test ... Redirects stay
  in `donor_merge_redirects`; **drop `donors.merged_into_donor_id`**. **Product
  call**: Samson, under Blake's standing authorization." The approval comment
  (2026-10-24T13:30Z) says: "Q5: Q7 is confirmed." The issue body header
  records the same ruling. It also records that "`donor_merge_candidates`
  replaces `crm_merge_candidates`" (gh issue view 2254, 2026-11-01).
- **Carried into #512.** On #512 (OPEN), the comment "Amendment (Oct 24, 2026,
  Samson's ruling)" (2026-10-24T13:13Z) says:
  - "**Q7:** `donors.merged_into_donor_id` is **not created**. Redirects stay
    in the existing `donor_merge_redirects` (merged → surviving, same-tenant
    composite FKs). The body's 'Tombstone the loser … set
    `donors.merged_into_donor_id = survivorId`' and the matching acceptance
    criterion need restating against `donor_merge_redirects` in this issue's
    spec."
  - "**Q8:** candidates live in `donor_merge_candidates`, not
    `crm_merge_candidates`."
  - The mechanism for merged-donor email "is to be specified here; it isn't
    decided by this amendment" (gh issue view 512, 2026-11-01).
- **Integrated contract.** `docs/security/identity-email-normalization.md:83-90`
  (commit `0b73d8420`, 2026-10-24) restates Q7. The test
  `tests/unit/acceptance/issue-2254/static.acceptance.test.ts:363-364` pins
  the doc text "merged", "donor_merge_redirects" and "#512". The migration
  `20261024140000_identity_email_normalizer_and_donor_keys.sql:19-21` says
  "The email key counts merged donors too (Q7); merge execution (#512) owns
  that case." The test
  `tests/unit/supabase/donor-matching-merge-candidates-migration.test.ts:65-83`
  asserts that redirect metadata stays off the `donors` row shape.
- **Not reconciled.** The last commit to ADR-0216 is `64f14b541`
  (2026-10-07). The last commit to the P4 PRD is `59cad3594` (2026-09-23).
  Both predate Q7, and both still require the column (`ADR-0216:19`;
  `phase-04...md:185, 254, 268`). `docs/ai/document-authority.md:31-35`
  says: "When a current PRD, ADR decision or acceptance clause is
  superseded, edit that clause itself. A banner or owner-map pointer is not a
  substitute." For ADR-0001, a Samson ruling was written into the ADR as an
  amendment (`:142-164`). ADR-0216 has no such amendment. ADR-0216 also says
  outright that its tombstone and `merge_operations` "are target integration
  decisions, not a claim that their schema is installed" (`:21-22`).
- **Implementation.** `donor_merge_redirects` has these columns: `tenant_id`,
  `merged_donor_id` (the PK, so one redirect per merged donor),
  `surviving_donor_id`, `merged_at` and a self-pointer CHECK. It has
  same-tenant composite FKs (`20260704140000:78-118`) and is service-role
  only: `REVOKE ALL ... FROM anon, authenticated` (`:120-123`). There is no
  operation id, actor, unmerge marker or undo state. The migration header
  (`:1-10`) cites "Conrad blocker answers section 2.5-2.6 (2026-07-04)" and
  says redirect metadata "lives in a server-only table so public.donors
  wildcard reads do not expose merge relationships". The pure planner
  `packages/api/src/donate/guest/donor-merge.ts:93-108, 110-163` builds a
  `redirectRecord` of that shape. It is exported (`packages/api/package.json:28`)
  but only `packages/api/tests/unit/donor-merge.test.ts` imports it. No app,
  script or SQL function writes the table.
  `docs/security/rls-deny-by-default-exceptions.json:31` records it as
  "Dormant: no app, script or SQL function references it ... Any drop is a
  separate issue" (reviewed by Samson, 2026-10-24).

**Reconciling r02/r06 with r02's verifier.** Both are partly right. "Unused
prototype" (r02 §7, r06 3.9) is accurate as _implementation_: no writer, and
recorded as dormant. "The integrated contract names it the redirect store"
(r02 verifier M1) is accurate as _intent_: an explicit factory-lead product
call under Blake's standing authorization, carried into #512 as an amendment.
What neither track said is that the later ruling never reached ADR-0216 or
P4, and that #512 has not yet restated its own spec.

### 3.3 Party level: the column tombstone is still the plan

- P9 says: "loser tombstoned via `merged_into_party_id`, edge re-points
  recorded in `merge_operations` for replayable unmerge"
  (`phase-09...md:414-415`; the column list is at `:762`, the tranche at
  `:856`).
- #606's Final spec r1 was approved by Samson on 2026-10-24T15:22Z, about two
  hours after Q7. It adds `parties.merged_into_party_id` with
  `parties_merged_into_fk` and `parties_merged_into_not_self_check`, and says
  "merged = `merged_into_party_id IS NOT NULL`, never a status" (gh issue view
  606 comments, 2026-11-01). Slice #2278 is OPEN and not labelled Ready.
- So on the same day the factory lead chose a server-only redirect _table_
  for donors and a _column_ tombstone for parties. Whether that split is
  deliberate is not recorded anywhere I found. Q7's stated reason, keeping
  merge metadata off a wildcard-readable row, could apply to `parties` too.

### 3.4 What this means for Phase 30 undo-after-merge and re-import

- Phase 30 must find a survivor when a re-import's established binding, or an
  undo, targets a merged-away record (`owner-constraints.md:384-385`;
  `roadmap.md:4371`). Today no survivor-resolution read exists at either
  level. The donor-level store is integrated but unwritten. The party-level
  store is not integrated. `merge_operations`, which ADR-0216 and #512 make
  "the source of truth for un-merge" (#512 body line 17), does not exist.
- `crm_record_links` is in the P4 A9 re-point list (`phase-04...md:185`;
  #512 comment "crm_record_links re-point is data hygiene only"). A binding
  stored there would follow the survivor on merge. Un-merge would then have to
  move it back from the `merge_operations` record. If bindings live somewhere
  else, that store must join the #512 re-point inventory. #512's amended
  criterion requires the inventory to cover all current references ("current
  table presence is verified rather than inferred").
- Because the email key counts merged donors
  (`identity-email-normalization.md:85-90`), a re-import that matches by email
  can hit a merged-away donor row unless #512 clears or rewrites that row's
  email. Matching by an established binding avoids that only if the binding
  was re-pointed to the survivor.

## 4. Reconciled answer: which store carries what

### 4.1 Source bindings (External IDs, repeat-import convergence)

- **Ratified carrier for CRM and Party provenance: `crm_record_links`.**
  ADR-0001 Decision 3 (founder, 2026-07-06, `:72-79`) and P9 (`:433-434`,
  `:846-847`, `:986`) both name it. P1's provider rule (`phase-01...md:106-111`)
  says "a provider ID is a **link, not an identity**". P4 A9 (`:185`) re-points
  it on merge. P31 generalizes it and co-owns the socket
  (`owner-constraints.md:481-484`). No later ruling retires it. The
  2026-08-18 retirement migration kept it on purpose (`20260818010000:9`).
- **Not the carrier for financial or credit roots.** Phase 13 owns "imported
  contribution and posting facts, with immutable legacy external references
  scoped to the exact tenant, connected account, livemode, source object, and
  known Party" (`phase-13...md:723-725`). Phase 14 credits carry their own
  "nullable `external_ref` + `external_source`, with a partial `UNIQUE
(tenant_id, external_ref)` for Phase 30 ... idempotent re-runs"
  (`phase-14...md:331`). Phase 14 also says it "stores no vendor ids outside
  `external_ref`/`external_source`" (`:1876`). Two external-ID patterns exist
  by design, each scoped to its owner. r03 M1 is right on this narrower point:
  `crm_record_links` and `donation_crm_links` are not the financial-root
  import identity.
- **Not usable as-is.** The integrated table cannot hold a trustworthy Phase
  30 binding today, for four reasons:
  1. Its identity columns and unique indexes are Twenty-named, with no
     source-system, source-instance or purpose column (2.2).
  2. Its unconditional unique index lets one source id bind to many targets
     (2.2).
  3. `asym_entity_id` is free text with no tenant FK (2.2).
  4. Any active staff member can INSERT or UPDATE rows directly (2.3). This
     lasts until #2295 lands. #2295 is blocked by #2293 and #2294, and all
     three are OPEN and not Ready (gh, 2026-11-01).
- **Nothing writes it.** No writer exists or is scheduled. #2257 was inert,
  and #2271 excludes it (2.4).

So the stale positions on both sides are wrong. "Retired Twenty leftover,
avoid" contradicts ADR-0001 Decision 3, P9 and P31. "Live governed socket,
use" overstates it: only the enum is governed, and nothing reads or writes the
table.

### 4.2 Merge redirects (survivor lookup for re-import and undo)

- **Donor level:** the latest explicit ruling is Q7 (Samson, under Blake's
  standing authorization, 2026-10-24). It keeps `donor_merge_redirects` and
  drops `donors.merged_into_donor_id`. It is recorded on #2254 and #512 and in
  the integrated #2254 contract. It has not been reconciled into ADR-0216:19 or
  P4:185/254/268, contrary to `document-authority.md:31-35`. #512 has not
  restated its spec. The table exists and is dormant.
- **Party level:** the plan is still the `parties.merged_into_party_id`
  column (P9:414; #606 spec r1 approved 2026-10-24; #2278 OPEN). It is not
  integrated.
- **Replay record:** `merge_operations` is required by every owner document
  and integrated nowhere.

So "unused prototype, avoid" and "the redirect store" describe different
tiers. Both are true. Phase 30 should not bind to either physical store. It
should consume a Phase 4 (#512) survivor-resolution and un-merge read.

## 5. What a trustworthy Phase 30 binding requires, and who owns each step

The gap statement says a Phase 30 binding "needs a further ADR-0001 amendment
and lockstep code changes". That is only partly right.

1. **ADR-0001 amendment: only for a new entity kind.** The lockstep rule
   (`ADR-0001:160-164`) applies only when a new `crm_link_entity_type` value is
   added. The 17 existing values already cover several Phase 30 targets:
   `crm_person`, `household` and `organization` (Parties), `donor_profile`,
   `missionary_profile`, `pledge_or_relationship_commitment`, `fund_or_project`
   and `cms_public_entity` (`concepts.ts:1-18`). Bindings for targets with no
   value need "its own consumer and its own amendment". Those targets include
   relationship edges, notes, tasks, custom-field entities (P11), files (P29),
   events and engagement rows. The binding itself is not an enum change.
2. **A row-model change, owned by P4/P9 with P31.** New columns for source
   system, source instance, purpose and batch or run reference. A uniqueness
   key on (tenant, source system, source instance, entity kind, source id).
   Twenty-named columns renamed or superseded. A tenant-safe target
   reference. ADR-0001 does not govern columns. It only says "generalized
   provider links", which permits this. The retirement design requires that
   "Any remaining compatibility cleanup follows its source-owned migration
   with evidence; it is not an automatic schema rewrite"
   (`complete-twenty-crm-retirement/design.md:28-29`). In practice that means
   a hosted row census before columns change. Phase 30 does not own this
   table (`roadmap.md:4377`: "Phase 4 owns identity/merge").
3. **Close the staff DML hole before bindings count as provenance.** Revoke
   INSERT and UPDATE from `authenticated`, or replace the
   `has_staff_membership(tenant_id, NULL)` policies, and route writes through
   a typed, audited server command. This follows the `donor_merge_*` pattern
   (`20260704140000:122-123`) and the AGENTS.md rule that privileged effects
   stay server-side. The same applies to `crm_merge_candidates`, although Q8
   moves candidates to `donor_merge_candidates`. #2295 already specifies this
   revoke, and Samson approved it on 2026-10-24 (see 2.3). It is not
   integrated, and it is blocked by #2293 and #2294. Phase 30 should name the
   #2295 merge, or an equivalent revoke on develop, as a hard predecessor for
   any binding written to `crm_record_links`. After the revoke, only
   `service_role` reaches the table. That is the right base for a typed,
   audited server command. #2295 does not build that command, and no ticket
   for it was found.
4. **Join the merge re-point inventory.** #512 must restate its tombstone
   criteria against `donor_merge_redirects`. Its re-point inventory must cover
   the binding store, so that bindings follow the survivor on merge and
   return on un-merge through `merge_operations`.
5. **Lockstep TypeScript: only for a new enum value.** Changes to the row
   model need ordinary migration, type-generation and test work, not the
   parity rule.

## 6. Facts, owner actions, and genuine founder choices

### 6.1 Established facts (no ruling needed)

- `crm_record_links` is the ratified carrier for Phase 30 CRM and Party
  source bindings: ADR-0001:72-79 (founder), P9:433-434, 846-847, and
  owner-constraints:481-484. It is not retired.
- The integrated table is not fit for import bindings as it stands (2.2).
  Nothing reads or writes it (2.4). Its direct staff DML hole is open on
  develop (2.3). #2295 specifies a fix that is approved but blocked.
- Financial and credit roots carry their own import identity (P13:723-725;
  P14:331). They do not use `crm_record_links`.
- Donor-level merge redirects: the latest explicit ruling (Q7) keeps
  `donor_merge_redirects` and drops `donors.merged_into_donor_id`. The table
  exists and is dormant.
- Party-level merge redirects: the plan is a column tombstone,
  `parties.merged_into_party_id` (P9; #606/#2278). It is not integrated.
- `merge_operations`, the record un-merge depends on, is integrated nowhere.

### 6.2 Owner or factory actions (researchable or assignable, not founder product choices)

1. **Reconcile ADR-0216:19 and P4:185/254/268 with Q7.** Either edit those
   clauses to name `donor_merge_redirects` as the donor redirect, or reverse
   Q7. Owner: Phase 4 identity, with #512. Under `document-authority.md:31-35`
   the clause itself must change. In the meantime the docs disagree.
2. **Restate #512's tombstone criteria** against `donor_merge_redirects`, as
   #512's own 2026-10-24 amendment requires. Then add the binding store to
   the re-point inventory.
3. **Decide whether the donor/party split is deliberate.** Q7 chose a table
   for donors and #606 chose a column for parties on the same day. Owner:
   Phase 4 and Phase 9 (factory lead). Phase 30 needs one survivor-resolution
   read that spans both.
4. **Generalize the `crm_record_links` row model.** This covers source
   system, instance, purpose, batch or run, the convergence uniqueness key and
   a tenant-safe target reference. It needs a hosted row census first
   (`complete-twenty-crm-retirement/design.md:28-29`). Owner: P4/P9 with P31.
   This is ratified direction, not an open question. Building a separate
   import-binding store instead would contradict P9:846-847 unless an owner
   amends it.
5. **Land #2295, or an equivalent revoke,** and add a typed, audited
   binding-write command before any binding counts as provenance.
6. **Add an ADR-0001 amendment only for new entity kinds.** Phase 30 targets
   that have no existing `crm_link_entity_type` value need one, each with its
   own consumer (section 5, item 1).

### 6.3 Genuine founder product choices exposed by this gap

These are listed in the structured output as open founder questions. The
floor is fixed by owner-constraints:384-385 and ADR-0216:38-44: undo never
deletes a real Party after merge, and un-merge is governed, not
unconditional. The open choices sit above that floor.

- **Re-import after merge.** A source record's binding may have been moved by
  a merge to a survivor whose golden record staff composed. Should a later
  re-import update the survivor's fields, append only, or hold the row for
  review?
- **Undo of a batch whose created record was later merged.** Block undo for
  that record (it stays a manual cleanup), offer a governed un-merge first
  (#512), or detach only the import provenance and leave the merged result?
- **One legacy record, many Asym records.** May one legacy source row (for
  example a SiteStacker household or couple row) bind to several Asym
  records, such as a household Party plus member Parties? This sets the
  binding uniqueness key.
- **Who may repair a binding.** Once direct DML is closed, which staff role
  or capability may re-point, reject or archive a source binding by hand?
  The `crm-core` contract (`:122-124`) requires repair metadata, but no
  repair actor is named.

## Resolution

The gap is resolved on the evidence. Both sides of the contradiction were
partly wrong, because they described different tiers.

- **Source bindings.** `crm_record_links` is the ratified carrier for CRM and
  Party source bindings and imported provenance. The founder kept it in
  ADR-0001 Decision 3 (`:72-79`). P9 assigns imported/legacy provenance to it
  (`:846-847`), and P31 co-owns the socket. "Retired Twenty leftover, do not
  reuse" (r03, r04, r06, r07 V2) is wrong as a statement of intent. It is
  right only that the integrated columns and indexes are Twenty-named and
  unfit for convergence, and that nothing writes the table. "Live,
  append-only, governed socket" overstates it. Append-only and lockstep
  govern only the enum labels (`ADR-0001:160-164`). The rows are mutable, and
  any active staff member can write them directly through RLS on develop. The
  approved but blocked #2295 would revoke that access. Financial roots are
  out of scope for this table (P13/P14 per-table external refs). A Phase 30
  binding needs an ADR-0001 amendment only for a new entity kind. It always
  needs a P4/P9/P31-owned row-model generalization, the #2295 revoke, and a
  typed write command.
- **Merge redirects.** At donor level, the latest explicit ruling is Q7
  (Samson under Blake's standing authorization, 2026-10-24): keep
  `donor_merge_redirects` and drop `merged_into_donor_id`. That ruling is
  integrated in the #2254 contract and carried into #512. It was never
  written back into ADR-0216:19 or P4:185/254/268, so those clauses are stale
  under the repo's own supersession rule, and the table is still dormant. At
  Party level, the plan is still the `parties.merged_into_party_id` column
  (#606/#2278). `merge_operations` does not exist. Phase 30 should depend on a
  Phase 4 (#512) survivor-resolution and un-merge read, not on either
  physical store.
- **What remains open.** Not facts but owner reconciliation (6.2 items 1-3)
  and four founder product choices (6.3). No founder ruling is needed to
  settle which table is the carrier.

## Unverified

- Hosted (dev or prod) row counts or contents of `crm_record_links`,
  `crm_merge_candidates`, `donor_merge_*` and `donation_crm_links` after
  2026-08-18. No database access. The only evidence is the migration comment
  `20260818010000:2-8`.
- Whether hosted catalogs match develop's migrations for these tables'
  grants and policies. #2295's approval notes that "the live production and
  development catalogs have policy names that differ from develop's
  migrations" (from #2312). Not checked.
- The source document "Conrad blocker answers section 2.5-2.6 (2026-07-04)",
  cited by `20260704140000:2` and `donor-merge.ts:3`. It was not found in the
  repo (grep for "blocker answers" finds only those two files), so the
  founder's original redirect-table intent could not be read directly.
- Whether Samson's Q7 ruling, made under Blake's standing authorization, is
  meant as a durable amendment to the Accepted ADR-0216 (`:3`), or only as
  slice scope for #2254. The r00 index lists the authority of relay and
  factory-lead rulings as an open discrepancy. The ADR-0001 precedent shows
  such rulings can be written into an ADR, but ADR-0216 has no such entry.
- Whether the donor-table and party-column redirect split was deliberate. No
  recorded rationale was found.
- Whether any open issue other than #2295 plans a typed `crm_record_links`
  write command or the row-model generalization. Only `gh search issues
"crm_record_links"` was run (24 hits). Of those, only #2295, #668, #2294,
  #613, #602, #570, #2271, #2257, #512 and #569 were read; the other titles
  (Phase 6, 7, 14, 26 and 27 tickets) do not suggest one. #602 (OPEN) keeps
  the table "as a generalized provider-link table" (body line 22) but does
  not generalize it. #613 (OPEN) registers the hidden "External IDs /
  provider links (Phase 30, over `crm_record_links`)" socket only.

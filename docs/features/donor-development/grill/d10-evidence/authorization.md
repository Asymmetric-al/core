# D10 evidence — stage configuration authorization and privacy

2026-10-10. Research for the founder-selected **B: authorized organization configuration may add, retire and reorder stages**. This is an evidence appendix, not ratification, a permission grant, formal specification or implementation. Checkout: `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. No hosted catalog, real constituent, production configuration or recipient was inspected; no code or database was changed.

**Recommendation:** retain B as a bounded catalog capability. Configuration authority, enrollment-stage mutation, impact visibility and historical/export access remain separate. Existing P12 controls can govern them without a new role, personal pipeline, per-stage permission engine or blanket administrative grant.

## Governing evidence and current implementation limits

- `phase27-q10-stage-customization.md:33–40,85–114` permits organization-approved list changes while reserving transition rules, permissions and final presets. Retirement cannot silently move an enrollment; display reorder cannot prove progress. Names/guidance cannot change business meaning, contact restrictions or disclosure. The question's unanswered marker is older than the supplied selection.
- `phase27-d9-recorded-stage-review.md:10–30` preserves the authoritative stage, identity, meaning, provenance and unknown historical dates on reopening; no silent retired-stage remapping. `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484–494,897–908,1277–1318` separates cultivation from Party lifecycle, excludes private notes/activity from missionary projections, and fixes Ministry Assignment Tenant/Legal Entity identity without granting access through participation.
- `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464–1468,1552–1556,2846–2869` requires current principal/context, exact Tenant/entity/source, capability, purpose, field/history floor and epoch at every command/read/job/repair. Entity grants may span several entities within one Tenant; membership alone is insufficient. Service/operator contexts are distinct from human Active Tenant Assignments.
- P12 `:1620–1638` governs protected existence, aliases/location precision, counts/predicates, exports, telemetry, residency and door-declared processing purpose. P27 business purpose is not that processing-purpose authorization. Internal configuration/read does not require an invented blanket contact-opt-in gate.
- `docs/prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:163–181,187–191` provides relevant _precedents_: immutable option identity, presentation-only order, independently governed value migration, labels under classification, safe catalog projections, and input/output/aggregate protection. Stages are P27 business concepts, not automatically P11 custom fields; do not import its entire lifecycle, quotas, merge machinery or old governed-view implementation wording.
- Current `packages/api/src/admin/crm/table-preferences/route.ts:243–302` separately gates gift-history default configuration and delegates; its comments explicitly distinguish that power from contribution operations. `service.ts:170–210` passes a server-computed capability decision to the RPC. This is a useful separation pattern, **not a P27 grant**. `packages/api/src/crm/auth/access.ts:16–62` itself uses coarse roles and carries action labels without proving a distinct P27 configuration permission.
- `supabase/migrations/20260611160000_crm_table_preferences.sql:19–57` has Tenant defaults, audit snapshots, RLS and browser-grant revocation. `20260611170000_crm_table_named_views.sql:5–28,120–170,349–413` has personal-view identities, definer RPCs and service-role execution. Personal views are not stage catalogs; these declarations do not prove D10 authorization or present deployed grants.
- `packages/api/src/admin/crm/reports/export.ts:9–45` has a current coarse-role CSV route. `packages/api/src/crm/commands/log.ts:46–85` redacts credential-like keys, not arbitrary sensitive stage labels/guidance. Reusing either does not qualify D10 disclosure. Existing table-preference/named-view unit tests use Supabase stubs (`tests/unit/packages/api/admin/crm-table-preferences-service.test.ts:45–53`; `crm-named-views.test.ts:29–47`).
- Fresh case-insensitive search for `cultivation`, `pipeline_stage`, `stage_id`, `stage_type`, `stage_order`, `stage_config` in `packages/api/src`, `packages/database`, `supabase/migrations`, `apps/admin` and `apps/missionary` found no match. This bounded absence is not a claim about hidden deployments. No D10 application test was executed here.

## Material findings, exact safeguards and acceptance proofs

Severity describes adopting the failure; likelihood is qualitative, not measured production incidence. No finding asserts a shipped D10 vulnerability.

### A1 — Configuration becomes enrollment-edit or read-all authority

**Critical; plausible.** A person who maintains shared terminology need not be allowed to change individual journeys or read private ministry histories. Conversely, a lead allowed to update one journey cannot thereby retire a stage for the organization. Current role-based CRM access is not enough to establish either boundary.

**Proposed clause:** “Authorize catalog configuration, enrollment-stage updates and each disclosed impact/history projection independently through the existing P12 owner. Neither permission implies the others. Configuration cannot move records, change grants, contactability or source lifecycle. Derive actor and current Tenant Authorization Context server-side; enforce the current capability, processing purpose, source scope, field/history floor and authorization epoch on preview, commit, deferred execution and replay disclosure.”

**Proof:** config-only actor can make a permitted list change without gaining enrollment details or mutation; enrollment editor cannot configure; revocation between preview and commit blocks stale authority; receipt retry after revocation discloses nothing beyond current rights. Background work does not borrow the config author's or lead's identity. No new role or capability spelling is selected by this appendix.

### A2 — Tenant catalog scope is confused with entity-specific records

**Critical; plausible.** A Tenant-level catalog may be used by journeys in multiple Legal Entities. Its administrator's configuration scope and their enrollment read scope are different. Requiring all entity records readable would overgrant; allowing an entity-limited editor to change the whole Tenant catalog without that configuration authority would undercheck.

**Proposed clause:** “Configuration authority covers the full scope of the selected catalog; references preserve exact Tenant and applicable preset/catalog identity. Entity-bearing journeys retain their source Legal Entity and independent access checks. A catalog change never rehomes a stage, preset, journey or historical reference. Tenant-wide configuration authority does not imply cross-entity enrollment visibility.”

**Proof:** cross-Tenant stage IDs, correct-Tenant/wrong-preset references, hostile parent reassignment, entity-limited enrollment reader, and explicitly authorized multi-entity work. Database relationships must prove matching scope, not merely that each UUID exists. Do not add Legal Entity columns to tenant-owned objects solely by analogy; exact catalog applicability is a source design decision, not a reason to invent separate entity catalogs.

### A3 — Labels and guidance become a sensitive-data channel

**Critical for restricted ministries; plausible.** A label such as a named worker's country, or guidance containing care context, can leak through selectors, history, exports and cached catalogs even when every enrollment row is filtered. Stored text can also reach HTML or spreadsheet contexts. “Configuration” is not a low-sensitivity classification.

**Proposed clause:** “Use reusable terminology appropriate for the catalog's admitted audience; case-specific private context belongs at its protected source. Labels/guidance and historical label resolution obey existing classification and surface floors. Configuration does not declassify content or widen missionary/public access. Render content through the qualified text/formatting and export boundaries; guidance is neither executable instructions nor a workflow language.”

**Proof:** sensitive name/location/care phrase in labels, retired labels in history, narrow missionary selector, HTML/script-like text, spreadsheet-formula text and error/telemetry paths. Unauthorized fields remain absent rather than exposed by a labeled empty group. P11's sensitive-token lint is only a supplementary safeguard, not proof that text is safe. Do not build a per-stage ACL system merely to support D10; qualify neutral shared definitions and existing source projections.

### A4 — Impact counts, duplicate errors or reorder reveal hidden data

**Critical; plausible.** “Used by three journeys,” a blocked delete, a duplicate-name response or missing ordinal can reveal protected configuration or constituents. Config permission alone need not grant those facts. Client reorder based on a filtered subset can also unintentionally drop unseen definitions.

**Proposed clause:** “Any impact preview discloses only its independently authorized aggregate/result projection; detail and links require separate source rights. Complete internal validation does not authorize protected counts. Reuse/conflict handling grants no visibility. Where required minimum configuration/result observation is absent, hidden-present/absent cases receive the same safe non-admission outcome. Apply only an authorized exact reorder against the current catalog, never a filtered client list treated as the complete set.”

**Proof:** two worlds differing only in hidden stage/use; privileged configuration actor without enrollment reads; filtered reorder; unique/FK errors; counts/search/CSV timing and revoked preview. An explicitly permitted minimal aggregate may differ within its approved disclosure contract; do not promise impossible indistinguishability for information deliberately authorized. D10 does not require enrollment counts, a universal preview service or an approval queue. Prefer omitting unnecessary counts.

### A5 — Retirement or reorder races create forbidden resulting state

**High integrity, Critical for unauthorized retarget; plausible.** A stale selector can attempt a new assignment after retirement. A stale reorder can overwrite a newer definition. Duplicate labels are not stable identities, and an upsert collision must not become permission to reuse or rewrite an unseen stage.

**Proposed clause:** “Use stable stage identity and current catalog/source revisions. Config and enrollment writers share a proved concurrency boundary for applicability: if retirement wins, reject incompatible new stage selection; if selection wins, retain its lawful historical reference. Reorder changes presentation only. Renaming, retirement or retry cannot change recorded meaning, move enrollments, fabricate assessment timestamps or emit stage-transition effects.”

**Proof:** both retirement/selection orders; two reorder writers; stale configuration after access loss; reopen retaining a retired stage under D9; same label/different identity; lost-response replay; prohibited changes to Tenant/preset/source. Existing references are not invalid new selections. Use the simplest qualified transaction/constraint strategy; no distributed lock service or forced bulk migration follows. Exact reactivation/replacement policy remains separately explicit.

### A6 — RLS, grants or privileged paths bypass the command

**Critical; plausible adoption risk.** Service-role-only storage is a useful boundary but not product authorization. Copying a JSON settings RPC or restoring browser grants to simplify a picker would not prove D10 scope, invariant or field access.

**Proposed clause:** “Admit configuration and enrollment changes only through their qualified source commands. Inventory actual table/column grants, effective policies, views, RPC execution/search paths, service jobs and maintenance writers. Enforce old-row authority and resulting-row scope/identity/invariants on every admitted mutation; privileged paths independently apply the same current source authorization. Expose only qualified catalog/result projections.”

**Proof:** real-role SELECT/INSERT/UPDATE/DELETE/UPSERT/RETURNING and RPC/view tests; allowed old row with forbidden new Tenant/preset; alternate permissive policy; server-trusted actor versus caller field; stale service authority; raw protected reads. Revoked browser grants must remain meaningful. A table/policy name, SQL string assertion or mocked RPC does not qualify the actual catalog.

PostgreSQL precision: `USING` checks existing rows; `WITH CHECK` checks proposed rows. Applicable UPDATE/ALL policies reuse `USING` if `WITH CHECK` is omitted. Permissive policies combine with OR. Grants and RLS are independent; owners normally bypass unless forced, and superuser/BYPASSRLS remains privileged. Definer execution depends on the owner's actual privileges, not an unconditional bypass rule. FK/unique enforcement can expose conflicts despite RLS. Mutable cross-row authorization or active-stage eligibility is not safely modeled by a cross-row `CHECK` alone.

### A7 — Current and historical catalog copies bypass revocation or disposal

**High; plausible.** A label rename can leak old sensitive text from an audit snapshot, cache, export or backup. Conversely, deleting a referenced stage can erase or reinterpret history. Restoring an old catalog can reactivate retired selection or overwrite a newer source meaning.

**Proposed clause:** “Preserve lawful stage identity/meaning and source history without promising permanent private text. Current read/export/history authority and retention govern catalogs, audit, references, search, generated documents and caches. Key/invalidate projections by applicable scope, viewer/purpose, catalog revision and authorization epoch. Before restored readers/writers activate, reconcile current retirement, source revisions, revocation and redaction/expiry; hold affected paths if those fences cannot be recovered.”

**Proof:** retired stage still resolves to permitted historical meaning; former administrator's stale tab/export denied; alias/classification correction propagates; audit contains no unnecessary private guidance; restore predating retirement/revocation/erasure does not revive selection or content. Ordinary retirement is not erasure; lawful disposal is not permission to erase the structural meaning still required. Configuration restoration alone never replays enrollment changes or automation.

## Bounded conclusion and fresh primary references

The required product boundary is narrow: organization-approved stage lists under current configuration authority, with independently governed enrollment operations and result disclosure. Permission names, new roles, extra catalogs, per-stage ACLs, mandatory global impact counts and blanket read grants are not selected. Activation still requires the exact P27/P12 contract and real database/surface proofs; a missed authority or privacy boundary is a blocker, not an acceptable monitored exception.

Official pages were freshly opened on 2026-10-10:

- [PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html): old/new-row rules, omitted-check fallback and combined policies.
- [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): privileged roles, grants, integrity checks and concurrent-policy cautions.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): platform grants, RLS, view and service-role considerations.

Primary PostgreSQL semantics govern over the previously read Supabase skill's blanket omitted-check/definer shortcuts. No default-exposure announcement proves this project's current grants. This appendix does not claim the parent's separately planned database probes or any D10 end-to-end test have passed.

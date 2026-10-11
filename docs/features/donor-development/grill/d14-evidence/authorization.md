# D14 evidence — additional approved lists without additional data authority

2026-10-10. Founder selected **A: allow additional organization-approved stage lists when needed**. **Recommendation: accept A with inherited authorization and source safeguards.** This is a new bounded configuration capability, expressly reserved by D10, not a grant to all staff/missionaries or permission to create personal pipelines. Creating a list, seeing its definitions, assigning it to work and reading its users are different operations.

Research against Core `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Only this appendix is authored here; no product, formal specification, live database, grant or constituent was changed. Severity/likelihood below concern prospective implementation failures, not an asserted deployed P27 vulnerability.

## Exact evidence and limits

- [Q14:35–39,78–92](../phase27-q14-additional-stage-lists.md:35) selects additional approved lists, one applicable list per partnership and shared source meaning. Exact applicability, selection/defaults, list lifecycle and switching remain separate. “Approved” uses existing organization-governed configuration, not an extra approval ceremony. The question's awaiting-answer marker predates the supplied selection.
- [D10 R02–R06:142–191](../phase27-d10-adversarial-review.md:142) requires stable tenant/preset-qualified stage identity, usable lists, preserved history and separation of configuration from journey mutation, aggregate/history access and cross-entity visibility. [D13 R05/R06](../phase27-d13-adversarial-review.md:235) keeps required scope independently valid when stage is absent.
- P12 [1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) owns server-derived discriminated context, current capability/purpose/field/history/residency/epoch and exact Tenant/entity/source scope. It requires least grants, coarse Tenant RLS, complete references and browser-inaccessible raw tables. A relationship, assignment, creator or role name is not authority.
- **Observed configuration precedent:** [table-preferences route:243–302](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:243) independently checks gift-history configuration authority/delegates; comments explicitly deny implied contribution powers. [Service:170–210](../../../../../packages/api/src/admin/crm/table-preferences/service.ts:170) passes server-computed actor/authority into its RPC. This is a useful separation pattern, not a P27 capability or role grant.
- **Observed different feature:** [named-view route:316–373](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:316), [service:20–25,91–153](../../../../../packages/api/src/admin/crm/table-preferences/named-views.ts:20) and [migration:5–28,119–170,349–413](../../../../../supabase/migrations/20260611170000_crm_table_named_views.sql:5) create personal gift-history snapshots, keyed partly by profile/name. The create service has no durable business-intent argument and translates uniqueness to a name conflict. Browser table grants and PUBLIC function execution are revoked; the RPC is service-executable. None proves P27 list creation, current fine-grained authorization, safe retry or a product rule that list names are identities.
- Fresh bounded search across API/database source, migrations and admin/missionary apps for cultivation and stage-identity/configuration terms still found no P27 implementation. No hosted catalog or application runtime was inspected. The separate mechanics researcher owns the new isolated create-list probe; this appendix duplicates no D10–D13 tests.

## Material concerns, exact clauses and acceptance proof

### A14-01 — New configuration power must not absorb journey powers

**Critical; plausible.** An organization-level list author may lack access to protected partnerships or other Legal Entities. Conversely, someone permitted to update a particular journey need not configure choices for everyone. Reusing personal-view CRUD would supply the wrong ownership model.

**Clause:** “Authorize additional-list creation/configuration under the existing P12 owner for its actual organization catalog scope. Independently authorize definition reads, applicability/assignment commands, journey edits and disclosed impact/history. Resolve actor, current human/service/operator context, Tenant, applicable entity/source, capability, processing purpose, fields/history, residency and epoch server-side; validate supplied references. Creator status, responsibility and list membership grant nothing.”

**Proof:** config-only actor can make a permitted list without gaining journey detail/edit/export; journey editor cannot create lists by submitting a guessed reference. Cross-Tenant/entity and forged owner/actor/purpose fail. Queued work preserves its validated originating context where required and does not follow a later Tenant switch. No per-list permission hierarchy or new blanket administrator role is needed.

### A14-02 — Tenant equality alone does not prove list compatibility

**Critical isolation / High integrity; plausible.** Two lists can use identical labels while containing different stage identities/meaning. A stage FK to a global ID or Tenant alone may permit a same-Tenant stage from the wrong list. An unassessed journey can accidentally bypass its required list reference if the only FK includes nullable stage.

**Clause:** “Use stable tenant/list/stage identities and complete compatible references. A journey's present stage must belong to its qualified applicable list; required source/list scope remains independently valid without a stage. Ordinary definition edits cannot reparent a stage, move its Tenant, rewrite event-time meaning or rebind journey scope. Stage/list identity is not label, rank, translation or creator.”

**Proof:** cross-Tenant and same-Tenant wrong-list assignments fail; a valid optional stage does not excuse nonexistent/foreign required scope. Same labels remain distinct identities. History retains event-time list/stage meaning after qualified edits. Tenant-wide catalogs do not require an invented Legal Entity column; entity-bearing journey access still does. Adding a list cannot alter D3's ordinary-journey uniqueness.

### A14-03 — Complete accepted creation needs stable retry identity

**High; likely if existing personal-view create is reused unchanged.** Lost responses or double submission can create multiple lists, while a failure between list/stage/audit writes can expose an unusable approved catalog. Label-based dedupe can also confuse a new creation with a past one.

**Clause:** “Accept a usable additional list and its required definitions, configuration history and durable result atomically. Bind creation identity to command kind, Tenant/scope and normalized intent; retry recovers that same accepted list, preserving original trusted attribution. Different content under the same identity conflicts. Independently deliberate creation is a new intent, subject to its qualified naming rules, never deduplicated merely by label.”

**Proof:** concurrent same-intent deliveries create one complete list and one accepted configuration effect; failure before commit leaves no accepted partial list. Failure after commit uses receipt reconciliation, not compensating deletion. A later rename does not make the historical create receipt overwrite current wording. Invalid empty configuration does not become selectable; an unfinished local form needs no new persisted draft/approval state machine.

### A14-04 — Catalog visibility is not permission to enumerate its users

**Critical; plausible.** A list title, guidance example, “used by N” badge or preview can expose protected ministry context. A name/uniqueness conflict can reveal a hidden list even when its SELECT returned none. Configuration does not require unrestricted constituent scans.

**Clause:** “Keep shared labels/guidance appropriate for their approved audience and apply current classification/disclosure to catalog lists, searches, snippets, counts, filters, exports and result errors. Independently authorize any usage/impact projection before calculating or disclosing it. Where minimum observable create/conflict metadata is not authorized, do not reveal hidden existence or create a workaround duplicate. Definition access never grants access to journeys using it.”

**Proof:** metadata-permitted/journey-denied actor configures without seeing private users or totals; hidden-present/absent cases follow P12 uniformity. No raw unique/FK constraint detail escapes. New-list creation does not require a whole-tenant impact count. P12 [1619–1632](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) governs existence and all egress; P11 [187–189](../../../../prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:187) provides the label-firewall precedent, not a P27 schema or ACL scheme.

### A14-05 — Every database door must enforce old and resulting scope

**Critical; plausible.** Correct create authorization cannot protect a later broad UPDATE, upsert, definer RPC or view that changes list ownership/scope or exposes raw history. A caller-provided “can configure” boolean is not a trusted decision.

**Clause:** “Keep raw source/catalog/history relations browser-inaccessible under P12. Qualify effective table/column/function grants, RLS policies, views and RPC owner/search path, including privileged writers. Constrain permitted existing and resulting rows and independently changed fields. Server-computed authority must remain server-controlled. Couple current authorization/revision checks to acceptance; a detached preflight followed by an unconditional privileged write is insufficient.”

**Proof:** actual nonowner INSERT/UPDATE/UPSERT/DELETE/RETURNING and admitted RPC/view paths reject old-row-visible/new-scope-forbidden transitions. Test extra permissive policies, creator/owner spoofing, revoke-before-acceptance and stale deferred requests. Config-only authority does not inherit source-table grants. Real-role/catalog evidence is required; an owner-only transaction fixture cannot qualify P12.

### A14-06 — Creation does not assign, switch, copy access or create new work

**Critical authority / High integrity; plausible.** A “create list” helper can secretly set a tenant default, retarget journeys, map same-named stages, duplicate ordinary work or copy permissions from a template. Those are separate source actions/product choices.

**Clause:** “Creating an approved list changes configuration only. It does not choose applicability, alter a journey's list/stage/history, admit duplicate work, create work/contact effects, or change grants. Any later selection/switch/mapping uses its separately qualified source contract. If copying definitions is offered, independently authorize the readable source and destination configuration; copy only admitted definition content into new destination identities, not source grants, histories, assignments or runtime work.”

**Proof:** create leaves existing journeys and their work untouched; identical labels cause no cross-list mapping. A restricted definition cannot become public through copying. Current definition/target authority is checked at copy acceptance. This conditional safeguard does not require a clone feature, cross-Tenant copying, list routing or a new publish/approval workflow. D14 does not settle their UX or permissions.

### A14-07 — History, departure and restore preserve identity without perpetual text

**Critical privacy / High integrity; plausible.** Creator departure or deletion cascades can remove approved definitions used by others; cached receipts or backups can resurrect sensitive guidance, obsolete permissions or a consumed create command.

**Clause:** “Keep organization definitions independent of a creator's employment/account lifecycle. Preserve lawful structural identity and configuration history without promising permanent private text. Current read/history/export authority, retention and redaction govern all derived copies. Before restored readers/writers/workers activate, reconcile authoritative catalog/source revisions, current access, retirement, redaction/expiry and consumed-create/effect fences; hold affected paths if those facts cannot be recovered.”

**Proof:** creator departure does not delete/reassign a shared list or confer successor access. Revoked creators cannot fetch old private receipts. Restore predating creation/rename/revocation/erasure cannot duplicate a list, regress newer definitions or expose removed text. [Command-log redaction:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) only recognizes credential-like keys; it is not sufficient protection for sensitive list descriptions. Exact list lifecycle remains a subsequent source decision.

## Fresh database references and recommendation limits

The previously read Supabase skill remains applied with primary PostgreSQL semantics controlling. Fresh official retrieval on 2026-10-10 checked [PG17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html), [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html), [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). Composite references enforce parent compatibility; nullable stage still needs independent required scope. `USING` checks existing rows; `WITH CHECK` checks proposed rows, with UPDATE/ALL fallback to USING when omitted. Permissive policies OR together. Grants remain separate; integrity errors can expose conflicts. Definer/view behavior depends on actual owner/execution privileges and safe function setup, not an unconditional bypass label. These are engine facts, not deployed Core qualification.

The existing Supabase default-grant changelog reviewed in D13 does not prove this project's settings or require opening raw tables. No upgrade, schema migration or new permission is performed here. The separate [D14 probe results](list-creation-probe/results.json) record **14/14 passing** on PostgreSQL 17.11; [metadata](list-creation-probe/run-metadata.json) records the pinned image, network isolation and verified container removal. I inspected its [setup](list-creation-probe/setup.sql:24) and results. The composite-membership rejection, independent-reference counterexample, atomic creation/rollback and one explicitly blocked concurrent retry support A14-02/03. Its `lab_config` role is a nonowner without superuser/BYPASSRLS, with tenant-filtered list SELECT/UPDATE only; a list update succeeds while journey SELECT/UPDATE fail with `42501`. This demonstrates separate grants, not Core P12, catalog creation permission or revocation. The create function runs as the fixture owner; the same-token Tenant-2 result proves receipt namespace separation, not authorization. No lifecycle, switching, copying, production RPC, hidden-existence timing, restore or load guarantee follows.

**Dependent-operation fence:** accept additional approved-list creation under current P12 configuration authority. Before later source use or a list-lifecycle operation is exposed, its applicable owner contract must define and qualify scope, retained references/history, current eligibility and truthful conflict/retry behavior. Until then that dependent operation remains unavailable. This does not choose the lifecycle, a persisted draft/publication model or another approval ceremony.

**Scope disposition:** additional approved-list creation is the founder-selected new capability; the safeguards above are inherited correctness conditions. Exact capability naming, list applicability, defaults, switching, lifecycle, cloning and duplicate-label UX are not silently decided. None requires withholding acceptance of A or adding another routine approval ceremony.

Consolidated review note: [D14 R04/R05](../phase27-d14-adversarial-review.md)
now explicitly state bounded new-list naming validation, independent minimal
availability/conflict disclosure before creation, and authorization/epoch fencing
with acceptance. These clarify the source conditions; exact comparison/scope and
actual P12 implementation still require qualification. No additional grant follows.

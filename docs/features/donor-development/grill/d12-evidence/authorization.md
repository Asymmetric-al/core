# D12 evidence — direct stage movement, authorization and truthful recurrence

2026-10-10. Founder-selected **A: authorized staff select any currently available stage in the partnership's approved list, including skipping or moving back; earlier history remains intact**. Recommendation: **accept A with inherited safeguards**. Direct movement removes a tenant-configured transition restriction; it removes no authorization, identity, stage-eligibility, history or next-action boundary. No new permission, per-stage ACL, approval queue or workflow language is needed.

Research only against checkout `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Only this appendix is authored here. No live catalog, constituent, production grant or database was inspected or changed. Claims below distinguish accepted owner intent, observed source and proposed qualification.

## Governing evidence

- [Q12:28–30,70–84](../phase27-q12-stage-movement.md:28) defines the selected choice and preserves source scope, current eligibility, expected versions and truthful history. Its awaiting-answer marker predates the supplied selection. [D11 R07–R10:214–258](../phase27-d11-adversarial-review.md:214) already requires atomic source acceptance, stable effect identity, truthful unknown-success recovery, separately governed optional context and current receipt disclosure. D12 resolves D11's condition that returning to a previous stage needs a permitted transition contract.
- P12 [1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) own trusted principal/context, exact Tenant/entity/purpose/field/history scope and current epoch. Stage assignment and ministry participation grant no authority. The owner requires coarse tenant RLS, least grants, complete composite keys and private raw tables as defense in depth.
- [ADR-0183:38–100](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:38) keeps source recurrence, applicability and authorization separate from task projections; a genuine recurring source-work occurrence gets a successor, not a revived predecessor. [ADR-0027:23–65](../../../../adr/0027-one-notification-presentation-and-engagement-model.md:23) separates source state, engagement and attention; retry or later access cannot revive an old notification. Neither ADR means every stage visit creates work or a notification.
- P9 [484–494](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484) excludes cultivation from Party lifecycle status. P9 [897–908](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:897) excludes Party private notes/activity from missionary projections. D12 does not resolve the separate P9/P28 permitted-interaction reconciliation or extend sharing.

## Actual source: useful patterns, no qualified D12 path

Fresh bounded search for `cultivation`, `pipeline_stage`, `stage_id`, `stage_type`, `stage_order` and `stage_config` across API/database source, migrations and admin/missionary apps found no match. This establishes a repository search limit, not hidden deployment state.

[Missionary donor API:29–54,174–225](../../../../../packages/api/src/missionary-portal/donor.ts:29) updates a full donor form including `status`/notes, using server-derived profile/Tenant and row constraints, without an expected enrollment revision. It is not a P27 movement endpoint. [CRM access:16–62](../../../../../packages/api/src/crm/auth/access.ts:16) uses coarse staff roles and carries an action label; that label is not a resolved P27 capability.

[Notes service:190–204,224–278](../../../../../packages/api/src/admin/crm/notes/service.ts:190) returns a tenant-keyed duplicate note, inserts a note before a separate log operation and supplies note body/title to the log. [Log redaction:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) recognizes credential-like keys, not arbitrary private text. These patterns must not become D12 receipt, transaction or disclosure contracts by reuse.

[Preferences migration:19–57](../../../../../supabase/migrations/20260611160000_crm_table_preferences.sql:19) shows tenant uniqueness, separate audit and revoked browser grants. [Named-view migration:119–170,349–413](../../../../../supabase/migrations/20260611170000_crm_table_named_views.sql:119) uses supplied scope parameters in a definer function with PUBLIC execution revoked and service execution granted. Those declarations are not proof of caller authority or current deployed catalog behavior. The [data boundary:69–79](../../../../guides/architecture/data-access-boundary.md:69) reserves audit/multi-table business workflows to server commands.

## Material concerns, clauses and falsifiable proofs

Severity and likelihood below describe consequences **if implementation omits the safeguard**, not an observed P27 vulnerability. These clauses preserve A rather than amend its product meaning.

### A12-01 — “Any available stage” is bounded by the authorized journey

**Critical; plausible.** A valid stage UUID is not proof of the right Tenant, approved list or permissible resulting record. A catalog manager need not be a journey editor; an editor need not see private historical explanations.

**Clause:** “Resolve actor, current discriminated Tenant Authorization Context and processing purpose at the trusted server boundary. Independently authorize stage mutation and each returned projection for the exact Tenant, Legal Entity, source, capability, fields/history, residency and epoch. Validate requested identifiers within that context. Configuration, assignment, list position and prior stage visits grant no additional access.”

**Proof:** a permitted editor skips/moves back without configuration authority; config-only and lead-only actors cannot mutate. Client actor/Tenant/purpose spoofing, wrong entity/list, revoked grants and unqualified service contexts fail. A lawful stage editor can update without being forced to read unavailable historical narrative. No new missionary grant is implied.

### A12-02 — Structural references must survive both moves and history

**Critical isolation / high integrity; plausible.** A global-ID foreign key can connect a tenant row to another tenant's stage; nullable key components can evade ordinary composite-FK checks. A history reference tied to the journey's mutable current preset could later misrepresent its event-time meaning.

**Clause:** “Enforce complete, non-null scope identities and tenant-aware references for the journey, applicable stage catalog and history/effect records. Ordinary stage changes cannot rebind Tenant, Legal Entity, supporter, ministry, purpose or preset. Preserve each event's accepted source/catalog identity and historical meaning; do not cascade-delete accepted history when a definition or actor changes.”

**Proof:** foreign Tenant/preset references fail even through a privileged write; null identity components cannot bypass integrity. An accepted event keeps its proper event-time definition after an allowed catalog change. Tenant-wide catalogs need no invented Legal Entity dimension; entity authorization still applies to entity-bearing journeys. Detailed preset switching/correction remains its own contract.

### A12-03 — RLS must constrain both the old row and permitted result

**Critical; plausible.** A read-visible row may be unwritable; an allowed old row does not authorize a changed Tenant or unsafe result. Service-role or definer execution can bypass the database policy layer without replacing application authorization.

**Clause:** “Keep raw source/history relations browser-inaccessible under the P12 contract. Test actual table/column/function grants, effective policies, views and function owner/search path for every admitted door. Enforce permitted existing and resulting states plus current application authority on server, RPC, import/job and repair paths. Restrict ordinary history mutation to its owning append/correction contract.”

**Proof:** real application-role SELECT/INSERT/UPDATE/DELETE/UPSERT/RETURNING and reachable RPC/view tests cover allowed-old/forbidden-new state, an extra permissive policy, table-owner/BYPASSRLS execution and untrusted scope arguments. A missing browser grant is not repaired by granting raw access merely to make the screen work. SQL-string assertions or an owner-only test cannot establish the boundary.

### A12-04 — A→B→A must defeat stale equality checks and lifetime deduplication

**High; likely if simple status or generic idempotency patterns are reused.** After returning to A, a request based on the first A is stale despite equal stage IDs. Conversely, legitimately visiting B again must not be discarded as an old A→B duplicate.

**Clause:** “Use expected authoritative enrollment revision, not stage equality, timestamps or catalog format version, to admit a new movement. Assign distinct identity to each accepted movement. Bind retries to the exact original intent and scope; incompatible reuse conflicts. Atomically accept the new stage, necessary history, receipt and required source effects/intents. Same-value selection creates no fabricated movement.”

**Proof:** A→B→A→B creates three real changes, no intermediate fiction; replay of each effect creates none. An old first-A request fails after A→B→A. Replaying a previously accepted no-op after a later move does not turn it into a new command. Failure between stage/history/receipt writes rolls back acceptance; required local accountability cannot be replaced with an outbox promise alone.

### A12-05 — Retirement and revocation need a common acceptance boundary

**Critical authorization / high integrity; plausible.** Checking permission or stage activity before an unconditional update leaves a race. A row lock on the journey alone does not prove fresh facts in another policy/catalog row.

**Clause:** “Couple current authorization/epoch, applicable target eligibility, expected source revision and mandatory source invariants to one qualified acceptance boundary shared with competing retirement/revocation. Serialize or reject stale decisions; do not rely on a mutable cross-row CHECK or detached preflight. Use consistent lock ordering and bounded retry of aborted transactions.”

**Proof:** deterministic interleavings exercise both orderings. Retirement/revocation accepted first prevents a new move under stale eligibility/authority; movement accepted first remains truthful history, while subsequent disclosure uses current access. Concurrent editors cannot both accept the same source revision. A serialized abort is safe failure, not a guarantee that deadlocks never occur. No organization transition graph or new approval is needed.

### A12-06 — Historical receipts must not become current truth or hidden-state oracles

**Critical privacy / high integrity; plausible.** A late A→B response can overwrite the later accepted A in a cache; a retry key can expose another actor's protected history. Constraint errors may disclose rows the caller cannot read.

**Clause:** “Recover unknown success using the existing effect identity. Separate the original accepted receipt from current authoritative state, and authorize every disclosed field under current context. Delayed success, rejection or rollback cannot overwrite newer accepted revisions or clear a newer safe draft. Return conflict details only within independently permitted observation; otherwise apply P12 denied/hidden/absent uniformity.”

**Proof:** deliver the first A→B success/failure after accepted B→A; current A remains. Retry after revocation reveals no protected receipt, stage or actor. Foreign-key/unique errors do not leak hidden IDs. Transport uncertainty never implies definite failure or permits a blind new business action; no new coordination queue is required.

### A12-07 — Returning to a stage neither resurrects work nor widens disclosure

**Critical privacy / high integrity; plausible.** Reusing a lifetime stage-based work ID can reopen completed tasks or old unread attention; calling a stage “prayer committed” may falsely create participation. More history also increases sensitive label/narrative exposure.

**Clause:** “Record only the real accepted from/to movement, trusted actor and acceptance provenance. Skipped stages have no invented events. A backward movement is a new present assessment, not erasure or backdating. Existing obligations remain governed by their source; no automatic completion, reversal, outreach or copied task follows from stage position. Separately qualified recurring work uses its own occurrence identity and current recipient/disclosure rules.”

**Proof:** no intermediate history, financial/consent fact, automatic message or revival of predecessor task/engagement appears. Independently authorized history/export uses current field floors. Optional reasons retain their existing owner and actual save/retry outcome, never spill into generic logs or task briefs. D12 does not choose stage-specific work rules.

### A12-08 — Preserve lawful history without promising permanent private text

**Critical privacy / high integrity; plausible.** Retirement preserves meaning, but redaction and retention may require removing private text. An old backup can otherwise restore an earlier A or consumed effect and repeat accepted work.

**Clause:** “Ordinary movement preserves accepted history; lawful correction, redaction and disposal remain owner-governed. Minimize historical content and apply current access/retention across receipts, cache, exports and backups. Before restored readers/writers/workers activate, reconcile authoritative source/catalog revisions, current revocation, retirement, redaction/expiry and consumed-effect fences; hold affected paths if recovery cannot prove them.”

**Proof:** restore before a return movement, retirement, revocation or erasure without serving stale truth, exposing removed narrative or replaying a consumed effect. Actor departure does not cascade-delete stage history or retain readable personal detail without a lawful basis. No permanent plaintext snapshot is required.

## Fresh primary database evidence and limits

The [Supabase skill](skill://plugin_asdk_app_69d3e5ee6a708191baa733f7b8931995/supabase/SKILL.md) and official sources were read on 2026-10-10. [Local config:7–34](../../../../../supabase/config.toml:7) specifies exposed API schemas and PG major 17, not the hosted minor or grants. The changelog Markdown index was fetched successfully by HTTP after the web reader rejected its content type; relevant linked entries were then opened.

- [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html): `USING` checks old rows; `WITH CHECK` checks proposed rows. UPDATE/ALL reuses `USING` when `WITH CHECK` is omitted. Permissive policies combine by OR; SELECT policy requirements also affect ordinary filtered/RETURNING updates and upsert paths. Thus omitted explicit `WITH CHECK` is not automatically a reassignment vulnerability.
- [PG17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): integrity checks bypass RLS and can disclose conflicts; policy subqueries can race. Table owners normally bypass unless forced; superuser/BYPASSRLS remains privileged. View/definer effects depend on actual execution privileges, not a blanket bypass label. `row_security=off` detects filtering for backup rather than independently bypassing it.
- [PG17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): composite foreign keys express tenant-aware references; null components need explicit treatment. CHECK is not a dependable cross-row mutable policy. These mechanisms do not prove current authorization or active-stage eligibility by themselves.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) confirms separate grants/policies and the USING fallback. [April 28 exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) changes default grants; it does not establish this project's effective settings or authorize adding grants. [September PG17.11 changes](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) require installed-version/extension qualification when implementing; no hosted upgrade or extension remediation is inferred here.

The separate D12 mechanics researcher was asked to distinguish recurrence, no-op replay, stale revisions, historical receipts and current state in an isolated PostgreSQL lab. Its eventual results are separate evidence and must retain its explicit lack of P12/RLS/revocation coverage. No test result is claimed by this appendix. D10 retirement/RLS probes remain prior synthetic evidence; implementation must qualify its actual source command, roles, catalog, history, jobs, disclosure and recovery paths.

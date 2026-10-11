# D13 evidence — legitimate stage absence without absent authority

2026-10-10. Founder selected **A: an authorized deliberate start may be “Not yet assessed” when the stage is not known**, with appropriate tenant flexibility and clear UX. **Recommendation: accept A with inherited safeguards.** This permits missing assessment, not missing identity, responsibility, permission or work. No new grant, universal catalog stage, transition engine, approval or mandatory assessment timer is needed.

Research against `225c02e9499bd6c0d493223cd4b1a4120ff787e3`; only this appendix is authored here. No application, formal specification, production database, grant or real constituent was changed. “Critical/High” below grades prospective implementation consequences; likelihood is qualitative, not an observed incident rate.

## Governing and current-source evidence

- [Q13:27–31,73–87](../phase27-q13-initial-stage.md:27) allows an appropriate known stage or no recorded stage at deliberate start; preserves responsibility and follow-up; does not authorize clearing an existing assessment, resetting reuse/reopen, choosing defaults or a nullable schema. Its awaiting-answer marker predates the supplied selection.
- [D4:23–61](../phase27-d4-adversarial-review.md:23) requires deliberate human intent, finite reviewed membership, atomic individual admission with required history/receipt and due work or owned exception. Reuse preserves existing stage and obligations. [D3:375–389](../phase27-d3-adversarial-review.md:375) requires independent authority for the minimal observable admission/reuse result; deduplication does not grant access or permit workaround duplicates.
- [D10 R03/R04:156–173](../phase27-d10-adversarial-review.md:156) preserves retired references and usable approved lists; missing assessment does not permit an unusable catalog. [D12 R07/R08:221–252](../phase27-d12-adversarial-review.md:221) distinguishes required scope from separately admitted optional references and preserves revision/intent identity, current authorization and committed outcomes.
- P12 [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1632](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619), [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) governs current principal/context, Tenant/entity, source, purpose, field/history floors, grants, epoch, all egress, counts and protected existence. Stage absence changes none of these.
- **Fresh current source:** [SelectCell:34–51,126–132](../../../../../packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx:34) finds the current value in supplied options, optionally emits `null` on Clear, and shows `N/A` for any unmatched value. [Generic table mutation:75–118](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-mutation.ts:75) directly inserts/updates/upserts browser table data. These are unqualified composition patterns for D13, not a shipped P27 unassessed-state flow.
- [Missionary donor API:29–54,174–225](../../../../../packages/api/src/missionary-portal/donor.ts:29) requires a donor status in a full form and updates without an enrollment revision. [CRM access:16–62](../../../../../packages/api/src/crm/auth/access.ts:16) checks coarse roles and carries an action label. [Notes migration:5–31,39–79](../../../../../supabase/migrations/20260818000000_crm_notes.sql:5) demonstrates tenant identity and explicit RLS/grants, but not P27 admission or fine-grained authority. Fresh bounded searches of API/database/application source and migrations for cultivation/stage identifiers still found no P27 implementation. None establishes deployed catalog state.

## Material concerns and exact inherited safeguards

### A13-01 — Absence of assessment must be a proved source fact

**Critical privacy / High integrity; likely if the generic selector is reused.** Missing options can mean a hidden field, failed lookup, stale cache, retired definition, broken reference or intentional absence. Coalescing them to “Not yet assessed” misstates the source and may reveal a protected assessment through filtering/counts.

**Clause:** “Show ‘Not yet assessed’ only when the authorized source projection proves that no stage has been recorded. Distinguish that fact from omitted/forbidden fields, loading/failure, unavailable definitions, retired recorded values and unknown legacy provenance. Do not manufacture a null source value from a missing join or projection.”

**Proof:** assigned-but-hidden, broken-reference, retired, load-failed and genuinely unassessed fixtures remain semantically distinct. External or existence-sensitive omissions do not gain a new ‘hidden stage’ badge. Reports apply authorization before grouping/counting and do not place policy-omitted assessments into the unassessed bucket. A left join alone is not sufficient proof of absence.

### A13-02 — Optional stage does not make required scope optional

**Critical isolation / High integrity; plausible.** Under ordinary composite-FK null handling, one null component skips that reference check. A nullable stage can therefore accidentally disable the only validation of the preset/Tenant. Conversely, blanket `MATCH FULL` across mandatory Tenant/preset plus optional stage rejects a legitimate unassessed row.

**Clause:** “Keep required journey identity and scope independently non-null and referentially valid. If stage identity is nullable, only the optional stage relationship may be absent; required Tenant, applicable entity/source and catalog relationships remain enforced. A present stage must match its qualified Tenant/catalog. Stage absence never changes the ordinary journey identity or duplicate boundary.”

**Proof:** a valid unassessed journey succeeds; missing/foreign Tenant, entity, ministry or required preset fails. Null stage cannot hide an invalid required preset. Present cross-Tenant/preset stage fails. Concurrent starts preserve the existing single-journey boundary regardless of stage absence. Do not put nullable stage into that identity key or invent entity-specific catalogs. Nullable storage is a candidate, not a founder-selected schema.

### A13-03 — Admission remains atomic, authorized and truthful

**Critical authorization / High integrity; plausible.** “Start now” can be mistaken for permission to create incomplete work, silently choose a default, reset an existing journey or convert a saved query into a growing group.

**Clause:** “Apply D4's exact current-context admission and D3's authorized observable reuse contract whether stage is present or absent. Atomically accept each member's source facts, required history/result and applicable due work or owned exception. Preserve each reviewed member's known-stage or unassessed intent; do not infer a stage from display order or an unqualified tenant default. Omission has only the admitted command's explicit meaning; it cannot reset reused work. Reuse preserves the existing stage.”

**Proof:** admission without an assessment succeeds when all other source conditions hold; absent responsibility/work still fails or follows its qualified owned exception. A reviewed group's permitted partial outcomes remain truthful. An existing hidden assessed journey cannot be discovered or duplicated through unassessed start. A known stage accepted at admission does not fabricate a prior unassessed visit; a genuinely unassessed admission creates no invented stage visit.

### A13-04 — Null is not a permission alternative

**Critical; plausible.** A policy such as “stage is null OR tenant matches” would expose unassessed records across tenants. Reading a stage, admitting a journey and assigning the first stage are also distinct operations; a lead/configurator role name does not authorize all three.

**Clause:** “Resolve actor and the discriminated current P12 context server-side; bind original human admission and applicable deferred context without borrowing authority. Re-prove exact Tenant/entity/source, capability, processing purpose, field/history/result, residency and epoch for every command/read/count/export/replay. Stage absence never relaxes a floor or joins an OR branch that bypasses scope.”

**Proof:** null-stage records in another Tenant/entity remain inaccessible and unwritable. Caller-supplied actor/owner/Tenant/purpose fails. Config-only/lead-only access is insufficient. Revocation before acceptance blocks stale authority; revocation after an accepted start preserves its historical fact but governs later disclosure. No new missionary or donor surface entitlement follows.

### A13-05 — All database doors enforce the allowed transition, including null

**Critical isolation / High integrity; plausible.** Allowing null on creation must not accidentally authorize assessed→null through a generic PATCH, upsert, FK deletion action or service-role path.

**Clause:** “Keep raw P27 source/history tables browser-inaccessible and qualify effective table/column/function grants, RLS, views, RPC owner/search path and privileged writers. Enforce permitted old and resulting states through the source command. D13 permits stage absence at deliberate admission; it does not authorize clearing an existing assessment or turning deleted definitions into unassessed records.”

**Proof:** real nonowner SELECT/INSERT/UPDATE/UPSERT/DELETE/RETURNING and RPC tests include null-stage cross-scope attempts, allowed-old/forbidden-new scope, assessed→null, `ON DELETE SET NULL`, extra permissive policies and privileged writers. Retirement retains the recorded identity. Catalog disappearance cannot erase assessment history. A policy name or service credential proves neither source authorization nor transition correctness.

### A13-06 — First assignment and old null receipts cannot race or erase truth

**High; plausible.** SQL equality with null does not behave like ordinary equality. A start/no-op retry can overwrite a later assignment if treated as a fresh upsert; two first assignments can both appear successful without revision checks.

**Clause:** “Admit the first actual stage assignment using the current authoritative source revision, current target eligibility and authority, atomically with its real history/result. Use explicit null-aware semantics. Preserve command-kind/scope/intent identity and original attribution on retry; changed intent conflicts. Historical unassessed-start or no-op results never clear a later stage, reset dates or repeat admission.”

**Proof:** two first assignments at one revision produce one accepted result and a permitted conflict. First assignment null→A records a genuine event without inventing an earlier catalog stage. Retry the original null start/no-op after A: return only its currently disclosable historical result and separate current state. Retirement/revocation before first assignment prevents stale acceptance; late callbacks cannot restore null over A. Precommit abort rolls back required writes; postcommit response failure invokes reconciliation, not rollback.

### A13-07 — Unassessed is not a privacy exemption or permanent history promise

**Critical privacy / High integrity; plausible.** A visible unassessed queue may disclose protected people, and restoring an old unassessed backup may erase an accepted assessment or revive consumed admission effects.

**Clause:** “Apply current source/field/history authority to unassessed lists, filters, counts, reminders, exports, caches and receipts. Preserve lawful minimal admission/assessment provenance without requiring an explanation or retaining private narrative forever. Before restored readers/writers/workers activate, reconcile authoritative revisions, current permission/retirement/redaction/expiry and consumed-effect fences; hold affected paths if those facts cannot be recovered.”

**Proof:** formerly authorized staff cannot recover private history through an unassessed filter or old receipt. CSV/report totals do not treat hidden records or missing coverage as unassessed/zero. Restore predating first assessment, revocation or erasure neither serves stale null as current truth nor recreates effects or sensitive text. No automatic new assessment task, reminder date, grace period or disclosure grant is inferred.

## Primary database evidence and proof limits

The Supabase skill read earlier in this continuous review remains applied; fresh 2026-10-10 retrieval checked the official pages below and changelog index. [Local config:27–34](../../../../../supabase/config.toml:27) selects PG major 17; it does not prove the hosted minor or effective grants.

- [PG17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): default composite-FK matching allows a reference with a null component to avoid lookup; `MATCH FULL` rejects mixed-null keys. Required scope must therefore be enforced independently of the intentionally optional reference. A CHECK can pass unknown, and ordinary uniqueness allows null distinctions; neither replaces required identity. Deletion actions must fit the source's history contract.
- [PG17 comparison operators](https://www.postgresql.org/docs/17/functions-comparison.html): ordinary null comparison yields unknown; explicit null predicates or `IS [NOT] DISTINCT FROM` provide defined semantics. This is an implementation tool, not permission to clear a stage.
- [PG17 policies](https://www.postgresql.org/docs/17/sql-createpolicy.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): `USING` controls old rows, `WITH CHECK` proposed rows; UPDATE/ALL reuses USING when the latter is omitted. Grants and RLS are independent; effective policies and actual execution roles matter. Do not import the skill's blanket omitted-WITH-CHECK or definer-bypass claims.
- [Supabase exposure changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically): new-table default-grant changes do not remove existing grants or prove this project's settings. They justify explicit catalog verification, not adding browser privileges.

The separate mechanics researcher owns a disposable PostgreSQL null/reference, first-assignment and fixture-RLS probe. Any results prove only the named fixture, not Core P12, hosted grants, Data API, UI or production admission. No result is claimed here and no duplicate probe was run.

**Scope conclusion:** A and appropriate tenant flexibility can coexist with D10's approved stage vocabulary and D11/D12's advisory/direct editing. A tenant switch that forbids the selected unassessed start, assessed→unassessed clearing, automatic defaults, extra grants or mandatory assessment deadlines would be an additional product choice; none is necessary to implement A and none is silently selected here.

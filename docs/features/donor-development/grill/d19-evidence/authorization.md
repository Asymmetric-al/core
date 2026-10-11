# D19 evidence — deliberate destination absence is not missing or denied data

2026-10-10. Founder selected **A: when deliberately changing to another stage list, permit a clearly shown result with no current stage on the destination list**. **Recommendation: accept A with the precise source/permission safeguards below.** This answers D18's stage-policy reservation for a real list change; it does not authorize general same-list clearing. Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Research/documentation only; no database, product, grant or formal specification changed. Severity/likelihood concern prospective failures, not an asserted deployed vulnerability.

## Current owners and observed implementation

- [Q19:25–36,74–94](../phase27-q19-stage-on-list-change.md:25) distinguishes absence **on the destination** from never having been assessed, including return to a previously used list. It requires a clear outcome before the same save and reserves same-list clearing, retrospective correction, defaults, paused/closed operations and bulk/cross-scope changes. The unanswered marker predates the supplied selection.
- [Ratified D18 R03–R08](../phase27-d18-adversarial-review.md:269) requires coherent atomic list/stage/history/result, current source revision, retained historical meaning, minimum permitted effect disclosure and complete references. D19 resolves its optional destination-stage question, not those safeguards. [D13 R05/R06](../phase27-d13-adversarial-review.md:235) already establishes independent required scope with nullable stage and no null-based authorization bypass. [D15 R02](../phase27-d15-adversarial-review.md:182) makes switching back a fresh attachment, not grandfathered use.
- P12 [1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1632](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) own current trusted principal/Tenant context, source/entity/purpose/capability/field/history floors, protected existence and egress. Assignment or service credentials never replace that decision.
- **Observed input precedent:** [table-preferences schema:58–68](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:58) distinguishes absent/clear/value for that feature; [service:115–131](../../../../../packages/api/src/admin/crm/table-preferences/service.ts:115) passes an explicit `is_set` marker alongside nullable value. [Named-view update:174–198](../../../../../packages/api/src/admin/crm/table-preferences/named-views.ts:174) similarly preserves field presence. This is useful decoder discipline, not a selected D19 API or authority to interpret generic null as clearing.
- **Observed other-domain mutations/reads:** [missionary donor update:174–193](../../../../../packages/api/src/missionary-portal/donor.ts:174) filters donor ID/Tenant/missionary/anonymity. [Legacy donor SELECT policy:160–181](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:160) grants authenticated reads under its owner/staff rules. [CRM grid:41–59](../../../../../packages/api/src/admin/crm/model.ts:41) and [cursor mapping:107–125](../../../../../packages/api/src/admin/crm/service.ts:107) use donor status. None is a cultivation stage, Ministry Assignment permission, source-list switch or real D19 RLS qualification.
- Fresh bounded source searches across API/database packages, migrations and admin/missionary apps found no authoritative P27 stage/list command or reader. No hosted effective grants/runtime were inspected. Prior D13 synthetic tests and current source are distinguished below; no new test result is claimed.

## Material concerns, exact clauses and proof

### A19-01 — Normalize an intended outcome, not every missing value

**High; likely with generic nullable PATCH decoding.** Omitted fields, empty UI placeholders, failed option loads or JSON extraction can become null and erase the current assessment accidentally.

**Clause:** “The deliberate list-change command SHALL carry an unambiguous planned destination outcome: a specific eligible stage or intentionally no current stage. Preserve presence/outcome semantics through client, decoder and source command. Missing/malformed input, failed lookup and denied projection SHALL NOT silently normalize to intentional absence. Make the final intended outcome apparent before the ordinary save.”

An explicit null or a discriminated representation can encode the outcome; this does not prescribe schema or add a checkbox. An already-unassessed source need not require pointless extra input when the destination outcome is clear. A stale selected stage that becomes invalid must not be silently converted to absence to make the request succeed.

**Proof:** absent property, explicit planned absence, empty string, unknown/retired/wrong-list ID, malformed value, failed load, old client omitting the new outcome, and source already unassessed. Invalid submissions leave source/history unchanged. D16's visible unsent-draft reset is not an authorization shortcut for saved data.

### A19-02 — Nullable stage cannot weaken required identity or target eligibility

**Critical isolation / High integrity; plausible.** A composite FK containing nullable stage can skip all checks; a no-stage switch can then retain an invalid Tenant/catalog/list reference or bypass withdrawal.

**Clause:** “Require valid non-null Tenant, applicable entity/source, Ministry Assignment/purpose and destination-list relationships independently of optional stage. A present stage belongs to the exact qualified destination list. Intentional absence removes only the current assessment reference; it does not remove source scope, list eligibility, ordinary-journey uniqueness or D15's retained-catalog validity.”

`MATCH SIMPLE` can skip a nullable composite reference, so separate required-scope relationships remain necessary; blanket `MATCH FULL` is not the fix for legitimate mandatory-scope/optional-stage combinations. SQL CHECK unknown handling must be explicit. Lists retained for continued use still require their D15 selectable-stage invariant even if this journey chooses none.

**Proof:** null-stage plus missing/foreign list or scope, same-Tenant wrong-list stage, withdrawn target, return to a previously used withdrawn list, source/target scopes and all-null required references. No null in the ordinary-journey identity may create duplicate same-purpose work. Source withdrawal is not an automatic move or assessment reset.

### A19-03 — Absence does not waive old/new-state authorization

**Critical; plausible.** An `OR stage IS NULL` policy, generic nullable-column grant or privileged RPC could make unassessed rows broadly accessible or turn list-change power into unrestricted clearing.

**Clause:** “Authorize the exact D18 mutation including its planned assessment consequence using current server-derived Principal/context, Tenant, source/entity, purpose, capability, field/history floors, residency and epoch. Validate target IDs/revision as proposals. Stage absence SHALL NOT loosen those floors or permit caller-selected actor, owner, ministry or purpose.”

Same-list input creates no D19 list-change entitlement: it cannot clear an existing assessment through this route. List configuration, record visibility, target discovery and history read remain distinct from mutation/result authority. Preserve least raw-table/function grants, effective nonowner existing/resulting-row RLS, SELECT visibility, views, RPC owners/search paths and privileged-path enforcement.

**Proof:** allowed old row→forbidden new Tenant/target with null stage; foreign old null-stage row; config-only/read-only/revoked actors; extra permissive policies; browser/service/import/repair paths; same-list plus null outcome. Source revocation/target withdrawal effective before acceptance wins through the qualified fence. Null is not a bypass flag.

### A19-04 — Protected labels must not be laundered into a clear-result diff

**Critical; plausible.** The journey may be readable while its previous stage/list metadata or history is restricted. “Cleared stage X” in a success message, audit preview or error can reveal more than the permitted mutation projection.

**Clause:** “Keep authoritative source state separate from projected labels. A hidden/retired/unmatched joined stage does not prove current absence. Authorize the minimum before/after consequence and result under D18 without demanding unrelated private history. Describe only permitted destination facts; no previous label, existence flag or historical detail follows automatically from choosing no current stage.”

If the meaningful minimum operation/result cannot be safely disclosed, use the inherited uniform unavailable outcome. Trusted internal invariant reads are permitted under the owner contract; they do not grant end-user access. No new full-history grant, mandatory disclosure acknowledgment or permission queue is needed.

**Proof:** actual source null versus denied joined label, retired reference, failed/missing join, hidden/nonexistent target and restricted old history. Check choice counts, before/after previews, receipt, route errors and raw FK details. [Command-log redaction:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) only matches credential-like keys; it does not qualify sensitive stage/list prose or arbitrary error text.

### A19-05 — Atomic absence must preserve history and later assessment

**High integrity / Critical replay disclosure; plausible.** Independent list/clear writes can lose the former assessment or expose an invalid intermediate pair. An old no-stage receipt can later erase a new destination assessment.

**Clause:** “Accept destination list, intended stage/absence, relevant source revision, actual history and durable result atomically. Preserve earlier scoped assessment meaning and lawful provenance; no-stage destination is not an assertion that the partnership was never assessed. Exact replay returns only currently permitted historical evidence, separately from current state, without reapplying the absence.”

The normalized submitted intent distinguishes selected-stage and absence outcomes; changed payload under one identity conflicts. A subsequent assessment follows D12's qualified source operation and new occurrence, not mutation of the old switch receipt. Re-entry to an earlier list does not restore its former stage automatically. Precommit failure rolls back; postcommit lost response reconciles accepted truth. No new assessment queue/deadline or task/contact event follows merely from absence.

**Proof:** assessed A→unassessed B→assessed B followed by old-switch retry; A→B→A with no assessment on current return; competing list/stage edits and stale ABA revision; child/history/result failure; revoked replay; same-list no-op. Earlier events remain, newer assessment is not reset, and optional stage never changes journey identity or unrelated obligations.

### A19-06 — Read models and exports must distinguish current uncertainty from history

**Critical disclosure / High reporting integrity; plausible.** Inner joins can drop valid unassessed work; `COALESCE` can label protected/missing stages unassessed; counts can imply zero progress or expose a restricted field.

**Clause:** “Read current absence from the authorized source fact, not label lookup failure. Preserve eligible unassessed journeys in scoped views and offered exports. Apply field/input floors before filtering, sorting, grouping and counts; withheld or incomplete coverage is not an unassessed bucket or measured zero. Keep current-list grouping distinct from historical assessment facts.”

Do not backfill a prior-list stage into the new current field, reuse its stage-entry timestamp as current time-in-stage, or assign a synthetic unassessed-stage identity/rank. Unknown dates and no current assessment remain truthful; exact reported duration rules belong to the qualified source/report owner. Retained sensitive text is governed by current retention/redaction, not “keep history forever.”

**Proof:** authorized absent/assigned/retired/withheld/failed rows, pagination/count reconciliation and export projections; history across repeated list visits; stale caches after new assessment; restored backup before switch/revocation/redaction. Current revisions, access and consumed effects must be reconciled before restored paths activate. Old callbacks/rollback cannot reinstate earlier context or stage absence.

## Primary mechanics and evidence limits

The previously read Supabase skill remains applied. Fresh 2026-10-10 retrieval checked [PG17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html), [JSON operators](https://www.postgresql.org/docs/17/functions-json.html), [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). SQL null, JSON null and missing properties require deliberate decoding; applicable UPDATE/ALL omitted `WITH CHECK` inherits `USING`. Actual grants, policy composition and execution privileges govern protection, not blanket omitted-check/definer claims.

The prior [D13 probe:39–55,57–86](../d13-evidence/initial-assessment-probe/README.md:39) already demonstrates nullable-FK traps, null-based policy widening, a scoped nonowner resulting-row rejection, omitted-versus-null JSON extraction and join/count ambiguity. It is **prior synthetic evidence**, not a D19 run. Its command tests run as owner and concern initial assignment, not saved-list switching; its diagnostic hidden labels are not a proposed user projection. No new SQL/API/browser test or live grant inspection is claimed here.

D19 makes destination absence legitimate for an actual deliberate list change. It adds no same-list clear, automatic mapping/restoration, historical rewrite, new permission scheme or requirement to inspect all private history. Paused/closed, bulk and cross-scope reservations remain unchanged. The targeted command/projection proofs above are required before implementation is called qualified.

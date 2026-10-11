# D11 evidence — advisory stages, authorization and disclosure

2026-10-10. Research for the founder's **A: guidance and authorized staff judgment, without organization-configured information requirements blocking a stage change**. The Q11 question's unanswered marker predates this supplied answer. Recommendation: **accept A with inherited implementation safeguards**. No new role, sharing permission, mandatory reason, approval or rule engine is needed. This appendix does not implement or qualify a live P27 command.

## Evidence and limits

Checkout inspected: `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Repository paths below are exact; line anchors refer to this checkout.

- **Decision boundary:** [Q11:30–41,87–94](../phase27-q11-stage-entry-requirements.md:30) preserves permissions, eligible stages, history and next-action rules. [D9:10–30](../phase27-d9-recorded-stage-review.md:10) retains the latest stage on reopening without compulsory reassessment. P9 [A12:484–494](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484) separates cultivation from Party lifecycle status.
- **Authorization owner:** P12 [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) requires current discriminated principal/context, Tenant/Legal Entity, purpose, projection, field/history floor, capability and epoch for every door. OpenSpec [identity-and-access:14–82](../../../../../openspec/specs/identity-and-access/spec.md:14) requires trusted server context and application checks plus RLS, while explicitly describing today's broader staff MVP posture.
- **Actual writes:** [missionary donor API:29–54,73–101,174–225](../../../../../packages/api/src/missionary-portal/donor.ts:29) requires a full donor form, updates `status` and `notes`, and constrains the update by donor, Tenant, missionary profile and explicit anonymity preference. It has no expected source revision. This is donor maintenance, not a cultivation command. [CRM access:16–62](../../../../../packages/api/src/crm/auth/access.ts:16) checks coarse roles/Tenant and carries an action label; it does not independently prove P27 edit authority.
- **Actual notes:** [notes service:170–285](../../../../../packages/api/src/admin/crm/notes/service.ts:170) checks restricted creation, returns an existing note by Tenant/idempotency key, then separately inserts a note and command log. [Command logging:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) redacts credential-like keys, not arbitrary note text. The note command supplies body/title to that log. [Notes migration:39–79](../../../../../supabase/migrations/20260818000000_crm_notes.sql:39) has restricted-note policies; [command-log migration:31–54](../../../../../supabase/migrations/20260507234343_crm_command_logs.sql:31) declares broader staff-Tenant access. These are incompatible disclosure patterns to inherit blindly, not proof of deployed grants or a P27 exploit.
- **Bounded absence/proof:** a fresh search of API/database/application source and migrations for `cultivation`, `pipeline_stage`, `stage_id`, `stage_type`, `stage_order`, and `stage_config` found no match. Existing [donor mutation tests:18–42](../../../../../tests/unit/packages/api/missionary-portal/donor-mutations.test.ts:18) and [notes tests:34–100](../../../../../tests/unit/packages/api/crm-notes.test.ts:34) use query stubs/in-memory data. They do not prove live RLS, concurrency or P27. No hosted catalog was inspected and no application test was run here. D10's [database mechanics lab](../d10-evidence/stage-catalog-probe/README.md) remains synthetic evidence, not D11 qualification.

## Material concerns and exact safeguards

Grades describe impact and likelihood **if an implementation omits the safeguard**, not an observed P27 defect. Every safeguard below is inherited; none changes A into stage-entry gating.

### A11-01 — Staff judgment cannot become an authorization shortcut

**Critical; plausible.** Stage editing, catalog configuration, private-note access and history/export are separate powers. Shared ministry responsibility and possession of an old screen do not grant them. Current coarse CRM helpers are insufficient evidence of the P12 boundary.

**Clause:** “Resolve actor and current Tenant Authorization Context server-side. Authorize the exact source-stage write and each result projection under current Tenant/Legal Entity, purpose, capability, field/history, residency and epoch constraints. Stage choice or guidance grants no access, consent, contactability or configuration power. Admitted deferred commands use their applicable current service/operator context and validated originating context where required; never substitute a borrowed human or service-role credential for authorization.”

**Acceptance proof:** edit-only/config-only actors remain distinct; changing client Tenant, actor or purpose fails; revocation between opening and acceptance is respected; a former editor's receipt or history request does not recover private fields. No new missionary entitlement is inferred.

### A11-02 — A stage-only update must remain a narrow update

**High; likely if the existing donor form is reused.** Requiring unrelated name/email/notes fields increases friction and stale overwrites. P11 [E3:191](../../../../prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:191) says newly required, untouched fields cannot block unrelated saves. This does not waive existing source invariants.

**Clause:** “A stage-only command changes only the selected stage and its required source history/invariants. No organization-configured reason, checklist, unrelated custom field or private information is required. Absent payload fields remain unchanged. Current authority, source identity, eligible-stage resolution, expected revision and existing next-action obligations remain mandatory; tenant guidance cannot waive them.”

**Acceptance proof:** a legitimate stage update succeeds without optional text or an unrelated missing custom field; a forbidden/retired fresh selection still fails; no Party status, private note, financial state, contact preference or reopen provenance changes. Unchanged stage does not fabricate a fresh assessment.

### A11-03 — Optional text and history have different disclosure boundaries

**Critical for protected text; plausible.** Notes may contain care concerns, missionary location or donor belief information. Calling a reason “history” does not make it universally readable or permanent. P9 [897–908](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:897) excludes Party notes/activity from missionary projections; the existing P9/P28 sharing reconciliation cannot be silently settled here.

**Clause:** “Record the minimum authoritative stage-change facts without requiring narrative. Any optional explanation or note retains its separately qualified source ownership, current disclosure and retention rules. Do not copy private bodies into general history, command logs, telemetry, task briefs or notifications. If an interface accepts both stage and text, expose their actual accepted outcomes truthfully; never silently discard text or report both saved after a partial failure.”

**Acceptance proof:** stage change without note succeeds; note-denied actor gains no text or separately unauthorized note-existence metadata; permitted history contains only its qualified projection. Failure after one accepted effect cannot produce a misleading success or duplicate on retry. D11 need not introduce a combined note feature or a second store.

### A11-04 — Guidance is data, not a rule or unrestricted publication channel

**Critical for sensitive disclosure; plausible.** Shared labels/guidance can encode an exact field location, protected person or case. P12 [1619–1637](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) governs existence, geography, egress and purpose. P11 [E1/E2:187–189](../../../../prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:187) makes labels subject to the same disclosure firewall; lint is supplementary.

**Clause:** “Keep shared stage guidance general and safe for its approved audience. Treat labels, guidance, search/filter inputs, previews, caches and exports as governed content. Guidance is explanatory and never executable, permission-bearing, evidence of supporter agreement, or a hidden save condition.”

**Acceptance proof:** restricted examples never reach a broader option list, error, export or log; output is safely rendered. Missing guidance introduces no tenant-information gate; missing authority or unresolvable stage remains an actual source failure. This does not require per-stage ACLs.

### A11-05 — Concurrent writes and database doors preserve old and new boundaries

**High integrity / critical isolation; plausible.** A preflight followed by an unconditional privileged update is not a current source fence. D10 already treats retirement and selection races; D11 adds no new catalog mechanism.

**Clause:** “All admitted stage writers enforce current authorization, expected source revision and the allowed resulting state at source acceptance. A stale change cannot overwrite a newer assessment, move the journey's Tenant/entity/purpose, restore a retired option or erase closure/reopen history. Keep browser raw-table grants closed and qualify effective policies, RPCs, views and privileged writers.”

**Acceptance proof:** competing stage edits give one accepted revision and a truthful conflict; retirement/revocation races respect their qualified ordering; old-row access does not permit a forbidden new scope. Use real roles/catalog tests at implementation, not SQL-string assertions alone.

PostgreSQL precision from the official [PG17 policy reference](https://www.postgresql.org/docs/17/sql-createpolicy.html), [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), retrieved for D10 on 2026-10-10: `USING` governs existing rows; `WITH CHECK` governs proposed rows, with `USING` fallback for applicable UPDATE/ALL policies when omitted. Grants are independent, permissive policies OR together, and actual owner/BYPASSRLS privileges matter. A definer is not automatically a bypass. Removing tenant information requirements removes none of these controls.

### A11-06 — Recovery and errors must not disclose hidden state

**Critical privacy / high integrity; plausible.** The current note duplicate-return and raw database-error patterns are not a safe P27 receipt contract. A retry after lost success must not create another transition, reveal hidden text or replace newer state.

**Clause:** “Bind a request identity to its exact accepted command; reject incompatible reuse without protected detail. Resolve unknown success through the same durable receipt, with current authority for every disclosed result. Return actionable conflicts only within independently permitted metadata scope; otherwise denied, hidden and absent targets follow P12 uniformity. Preserve the committed historical result separately from today's state.”

**Acceptance proof:** lost response then retry creates one transition/history effect; reused key with changed input cannot return another person's private note; revoked actor learns no hidden stage or receipt. Constraint names/raw SQL errors never expose hidden references. Recovery does not require a new approval queue.

### A11-07 — Retention and restore cannot resurrect permission or private text

**Critical privacy / high integrity; plausible.** Preserved stage history is not perpetual retention of optional reasons. P12 [1637,1642](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1637) distinguishes residency and minimized protected history.

**Clause:** “Retain lawful stage identity, meaning and provenance under current history access and retention; minimize or lawfully remove optional private text across derived copies. Before restored readers or writers activate, reconcile current revocation, redaction/expiry, source/catalog revisions and consumed command receipts. Hold affected paths when those fences cannot be recovered.”

**Acceptance proof:** restoring a pre-revocation/pre-erasure backup neither reveals old notes nor replays a committed stage update; later authoritative stage/history survives reconciliation. Retirement remains distinct from erasure and restore is not a new assessment.

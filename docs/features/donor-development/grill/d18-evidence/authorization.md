# D18 evidence — authorized saved-list change with a valid, private resulting state

2026-10-10. Founder selected **A: deliberately change a saved partnership to another eligible approved list on the same journey, preserving history, for correction or an evolving process**. **Recommendation: accept the capability with inherited safeguards and the explicit release prerequisites below.** Current-stage treatment remains unresolved; A does not permit implementing an arbitrary `list_id` update. Research against Core `225c02e9499bd6c0d493223cd4b1a4120ff787e3`; this appendix changes documentation only. Grades concern prospective implementation failures, not a deployed P27 vulnerability.

## Governing evidence and current source

- [Q18:24–40,75–93](../phase27-q18-changing-saved-list.md:24) keeps supporter, identified ministry, purpose and journey fixed; it reserves stage treatment, paused/closed behavior, bulk changes, cross-scope moves and historical correction. Q18 now records the supplied A selection and completed D18 review. [D15 R01–R03](../phase27-d15-adversarial-review.md:176) distinguishes current retained binding from new attachment: switching away and back needs current target eligibility. [D16 R04–R09](../phase27-d16-adversarial-review.md:220) owns scoped list/stage references, durable submitted intent and all-door enforcement. [D17 R02–R06](../phase27-d17-adversarial-review.md:265) does not let defaults change saved work.
- [ADR-0136:30–59,109–124](../../../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md:30) makes Ministry Assignment a stable Tenant/Legal-Entity source and separates membership, support access and history floors. [D2:284–294](../phase27-d2-adversarial-review.md:284) requires its exact source relationship without inventing Party entity ownership. A catalog change cannot become a ministry/person/couple/team, Legal Entity or Support Assignment transfer.
- P12 [1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1632](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) govern trusted current Principal/context, exact target/purpose/capability/entity/field/history floors, protected existence and every egress/service path. Role, assignment, creator or old access alone grants nothing.
- **Actual different mutation:** [missionary donor API:29–54,174–223](../../../../../packages/api/src/missionary-portal/donor.ts:29) accepts a donor-profile form and updates `donors`, filtering ID/Tenant/missionary profile and explicit anonymity opt-in. That is neither a Ministry Assignment key nor a saved cultivation-list command. [Its tests:17–61,115–150](../../../../../tests/unit/packages/api/missionary-portal/donor-anonymous-mutations.test.ts:17) use a JavaScript query fixture to exercise those filters; they are not real RLS, atomic history/replay or D18 proof.
- [CRM access helper:16–62](../../../../../packages/api/src/crm/auth/access.ts:16) checks coarse staff roles/Tenant context and carries an action label; it does not establish a D18 capability. The [June 25 migration:160–182](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:160) grants legacy donor SELECT and defines its owner/staff policy. Existing legacy policy/grants must not be described as the P12/P27 model. No hosted effective policy catalog was inspected.
- [Command logging:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) redacts credential-like keys but not arbitrary ministry/list names, prior stage text or reason narratives. It is not a safe before/after-history projection by itself. Fresh bounded searches across API/database packages, migrations and admin/missionary apps still found no authoritative P27 list-change implementation; no production-absence claim follows.

## Material concerns and exact requirements

### A18-01 — Old-record mutation, target use and history disclosure are separate

**Critical; plausible.** Permission to read a journey, configure a list or consume a default could be mistaken for permission to change saved work. Conversely, demanding all private history to perform a bounded change would expand access or block valid operators.

**Clause:** “Authorize the specific source operation on the current journey/binding, its allowed resulting state and the target list's current discoverable/use projection. Independently authorize the minimum effect/result explanation and any optional before/after history. Configuration, ordinary record read, initial admission, stage editing and historical-audit access do not imply this mutation or one another. Resolve actual capabilities under P12 without inventing a new broad role or per-list ACL.”

**Proof:** journey-read-only, source-mutation-only with bounded permitted result, target-read-only, configuration-only, history-denied, missionary and revoked actors. Permit no old-row-visible/new-target-forbidden transition. A deliberately limited result need not expose private notes, all stage visits or task content. Target discovery cannot enumerate journeys using that list.

### A18-02 — A readable journey may still have protected current-list metadata

**Critical; plausible.** A missing joined label can be misread as no binding, or a before/after diff, conflict, success body or FK error can reveal protected source facts.

**Clause:** “Keep the authoritative current binding distinct from its permitted projection. Hidden/missing labels never mean no list, Not yet assessed or permission to overwrite. Before a decision/result would reveal protected current/target existence or transition effects, establish independent authority for the required bounded disclosure. If unavailable, give the same permitted unavailable outcome for indistinguishable protected states; do not widen access.”

The owning command may inspect protected facts internally for its invariant check. That does not authorize returning those facts. This clause neither mandates full current-list/history access nor silently selects a blind-switch experience: a meaningful minimum permitted action/result must be qualified before such a context can offer the operation. No new approval queue or permission request is required.

**Proof:** readable journey with denied current label/history; hidden versus nonexistent target; readable target but forbidden source command; target withdrawn but that status protected; denied actor with guessed exact IDs. Check response fields, option/count differences, audit previews, error text and required P12 timing uniformity. Raw unique/FK diagnostics must not escape.

### A18-03 — Target attachment must remain current; history is not grandfathering

**High integrity / Critical authority; plausible.** A journey's existence or previous target use could bypass withdrawal; a saved preview may outlive source or target authority.

**Clause:** “A real switch attaches a new target and must prove its current new-use eligibility under D15. Prior use, history, actor familiarity, copied IDs, a default or backdated reason cannot supply continued-use status. Order target withdrawal/restoration and switch acceptance through the qualified conflicting source fence. Re-prove current authorization/epoch at acceptance, not only at preview.”

Switch accepted first becomes the current retained binding; withdrawal accepted first blocks fresh attachment. Withdrawal of the current source list alone neither forces nor authorizes switching. Retaining an unchanged binding is not fresh attachment and must not fabricate a switch event. A source revision detects concurrent stage/list edits and ABA changes. No list choice may retarget supporter, Ministry Assignment, Tenant/Legal Entity or continuing purpose.

**Proof:** both target-withdrawal race orders, switch away/back, foreign-scope target, source withdrawal, already-current target, concurrent stage edit and revocation. A bare FK or nonconflicting key-share lock does not qualify dynamic eligibility. A new intended switch is distinct from a retry after uncertain success.

### A18-04 — A valid resulting list/stage pair is a hard release prerequisite

**High; certain integrity conflict if an old-list stage is retained unchanged under another list.** Separate valid list/stage IDs do not establish compatibility. Silently nulling the stage abuses D13's initial-absence choice; matching labels/ranks fabricates equivalence.

**Clause:** “Before exposing saved-list change, explicitly settle and qualify its current-stage disposition. Accept the new qualified list and the chosen valid resulting assessment state, required source history and durable result atomically. Until that policy is selected, the switch path remains unavailable. Preserve required Tenant/entity/ministry/purpose scope independently of any nullable stage; any present current stage belongs to the new exact list.”

Do not weaken the composite relationship, leave an observable invalid intermediate row, rewrite historical stage identities or call a migrated label an assessment. Configuration definitions themselves are not reparented. A later owner-qualified stage policy determines the exact current value and effects; this review does not choose mandatory assessment, permitted clearing or a mapping engine.

**Proof gate:** real cross-Tenant and same-Tenant wrong-list rejection, stage-absence scope checks, failure between each required source/history/result write, observer consistency and rollback. Optional null behavior must match the subsequent explicit decision, not whichever schema is easiest. No product release can claim D18 completeness from FK tests alone.

### A18-05 — All mutation paths must preserve source scope and current authority

**Critical; plausible.** A generic PATCH/upsert, service RPC or resulting-row policy can bypass the deliberate source operation or rebind scope along with the list.

**Clause:** “Use a narrow source-owned command. Server-derived Principal/context/Tenant and authoritative current journey determine attribution and scope; submitted IDs/revision are proposals. Allow only this qualified list transition and its expressly required assessment fields, not arbitrary owner/Tenant/ministry/purpose/history changes. Keep P12 raw-table restrictions and qualify effective grants, policies, views, RPC owners/search paths and privileged writers.”

**Proof:** actual nonowner SELECT/UPDATE/UPSERT/RETURNING and other exposed writes; allowed-old/forbidden-new rows; column protections; extra permissive policies; service/import/repair and mixed API versions. An old-row tenant predicate or client mutation schema alone is insufficient. Revocation effective before acceptance prevents the change; after acceptance it limits current result/history disclosure without undoing accepted source truth.

### A18-06 — Uncertain replay and history must not become another mutation or grant

**High integrity / Critical privacy; plausible.** Retrying after a later switch may reapply the old choice, duplicate history, or return protected earlier detail to a now-revoked actor.

**Clause:** “Bind submitted switch intent to operation, exact journey/scope, expected revision, concrete target and its qualified assessment payload. Same-intent replay recovers only the currently permitted original outcome, separately from present state; changed payload conflicts. Keep original attribution. Reconcile uncertain outcome before treating edited input as a new effect. A later inverse change is a newly authorized operation, not replay or historical erasure.”

Precommit abort rolls back required facts; postcommit response/projection failure preserves and reconciles them. Changed process and mistaken-choice correction must retain truthful actual acceptance history; Q18 does not authorize backdated rewriting or an arbitrary historical-correction API. Neither mandatory narrative nor approval is implied.

**Proof:** exact retry, changed target under same key, A→B→A→B distinct occurrences, stale ABA revision, later switch before old receipt arrives, revoked replay, rollback and lost response. Preserve one ordinary journey and independent obligations; do not restart admission, revive ended work or infer outreach.

### A18-07 — Changed projections must not rewrite history or revive disclosure

**Critical privacy / High integrity; plausible.** Caches may retain old private names or apply an old callback to another context; reports can reinterpret earlier stages using the new list; backups can revive a superseded binding.

**Clause:** “Version accepted source binding and update authorized derived reads consistently. Preserve event-time list/stage identity and meaning under current history/retention/redaction floors; keeping history is not retaining private text forever. Invalidate affected cache/export/search/audit projections without widening access. Restore reconciles current binding/revision, authority, target/stage lifecycle, redaction and consumed effects before activation; hold affected paths if unrecoverable.”

**Proof:** same-user Tenant/assignment changes, stale result and rollback, old exports/caches, restricted ministry names in logs, later redaction and backup before switch/revocation. Staff/missionary surfaces share source facts but receive only their permitted fields. Saved-list movement is not donor participation, financial progress, a new stage visit by analogy or permission to read a past private note.

## Primary mechanics and disposition limits

The previously read Supabase skill remains applied. Fresh 2026-10-10 retrieval checked [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html), [RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). `USING` governs existing rows; applicable omitted UPDATE/ALL `WITH CHECK` inherits it. SELECT/RETURNING/upsert requirements, independent grants, permissive-policy composition and actual view/definer execution privileges matter. Integrity checks can expose existence; references enforce membership, not business permission or lifecycle. These are engine facts, not current Core qualification.

No SQL/browser/API test was run for this appendix, and no prior default/read fixture proves D18. Stage treatment is the immediate genuine product dependency. Paused/closed switching, bulk migration, cross-scope moves and historical corrections remain unselected; preserve their owner boundaries and keep unsupported actions absent rather than inventing policy. Accepting A permits deliberate same-journey changes, not those extra capabilities or an unfinished production path.

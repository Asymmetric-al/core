# D16 evidence — staff choice without an extra restriction or permission layer

2026-10-10. Founder selected **A: staff choose the appropriate approved stage list, without additional process-specific applicability restrictions**. **Recommendation: accept A with inherited source and P12 safeguards; no material permission amendment or new role is required.** This review concerns the new choice/discovery seam, not a repeat of every D10–D15 requirement. Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`; only this research appendix is changed. Risks below are prospective, not asserted deployed P27 vulnerabilities.

## Evidence, current reality and intent

- [Q16:31–43,74–94](../phase27-q16-list-applicability.md:31) selects staff judgment within existing source/permission boundaries. It leaves defaults, exact starting-form presentation and later list switching separate. The completed answer is recorded below its preserved pre-answer options. [D4:23–45](../phase27-d4-adversarial-review.md:23) requires deliberate admission, asks only for missing/materially changed information and binds reviewed groups to exact identities and work.
- [Ratified D15 R01–R03](../phase27-d15-adversarial-review.md:175) separates new attachment from current retained binding; historical use is not admission permission. [R06–R10](../phase27-d15-adversarial-review.md:223) owns valid zero-choice treatment, current authority, scoped references, acceptance fences and retry. [D14 R03/R04](../phase27-d14-adversarial-review.md:242) separates configuration from source/data powers and authorizes minimum revealing metadata before the revealing operation. [D3:375–389](../phase27-d3-adversarial-review.md:375) forbids hidden-existing reuse oracles and duplicate workarounds.
- P12 [1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1632](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) own current discriminated context, exact Tenant/entity/purpose/capability/field/history/epoch floors, query inputs, protected existence and all data doors. These are accepted architecture, not proof of implementation.
- **Observed different feature:** [named-view route:316–340](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:316) resolves an actor then reads personal views. [Service:20–25,91–106](../../../../../packages/api/src/admin/crm/table-preferences/named-views.ts:20) describes personal presentation snapshots and filters by Tenant/profile/table, sorted by name. It is not an admission catalog or proof of a chosen default. [Configuration route:243–300](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:243) separately checks configuration authority and explicitly denies implied contribution powers: useful separation, not a P27 grant.
- **Observed cache limits:** [named-view hook:64–70,96–106](../../../../../packages/database/hooks/admin-crm-named-views.ts:64) keys by table ID with a 60-second stale interval. [Preference hook:92–99,141–167](../../../../../packages/database/hooks/admin-crm-table-preferences.ts:92) similarly keys by table and restores a captured snapshot on error. [Session cleanup:64–82](../../../../../packages/auth/client-session.ts:64) clears queries on sign-out or user-ID change. Its [test:129–166](../../../../../tests/unit/auth/client-session.test.ts:129) explicitly keeps the cache on same-user token refresh. These inspected pieces do not establish isolation for same-user Tenant/assignment/epoch changes; this is a qualification gap for reuse, not a proven live disclosure.
- Fresh bounded source searches across API/database packages, migrations and admin/missionary apps still found no authoritative P27 stage-list selection/admission implementation. No hosted role catalog or runtime was inspected. Existing tests were read, not rerun as D16 evidence.

## New seam hazards and permanent clauses

### A16-01 — Readable, admission-eligible and authorized to start are different facts

**Critical; plausible.** “Any approved list” could become a broad Tenant read grant or a permit to start work on an otherwise forbidden Party/ministry. Requiring configuration rights for choice would instead exclude legitimate staff.

**Clause:** “Offer the shared current approved choices that the actor may discover and use through the existing source admission contract. Independently resolve permitted definition projection, current new-use eligibility and authority for the proposed journey. Configuration permission is not required merely to choose, and choosing grants no configuration, journey, history or usage access. Do not add process-kind allowlists, per-list ACLs, new capability names or role-name shortcuts.”

This separates enforcement decisions, not necessarily named capabilities. Existing safety floors may limit the result; they are not D16's rejected process restriction system. Do not infer a missing permission or process mapping from a label such as “Missionary support,” organizational role, team or UI surface.

**Proof:** authorized admission actor without configuration power succeeds; configuration-only, list-read-only, lead-only and revoked actors cannot start unauthorized work. One permitted list does not authorize a foreign entity/ministry. Appropriate existing missionary grants remain governed by P12; A creates none.

### A16-02 — One/many/zero must describe the authorized choice set

**Critical disclosure / High integrity; plausible.** A badge, disabled option, search hit, “only one” shortcut or total fetched before filtering can reveal hidden configuration. A paginated first page or failed join can be mistaken for the full choice set.

**Clause:** “Apply current discovery/use projection before emitting options, search suggestions, filters, counts or availability errors. Describe the declared authorized set with complete coverage; loading, failure, partial pagination, denied access and true empty are not interchangeable. Do not expose a hidden list or its count merely to explain why it is unavailable.”

Zero visible choices does not establish zero lists in the organization. D15's intentionally empty catalog is a distinct source fact, disclosed only when permitted. An individual may receive a safe unavailable/recovery result without a revealing reason. More than one option does not justify an extra approval; one option does not by itself select the yet-unanswered default/auto-selection policy. Keep known valid source context and ask only for missing/materially changed information under D4.

**Proof:** hidden-present/absent paired cases; fully authorized zero/one/many; first page containing one of several results; partial/failed read; withdrawal during search. Neither disabled labels nor count differences reveal protected metadata. No new admission begins with a missing list or a guessed first result.

### A16-03 — A draft choice must remain bound to its actual source context

**Critical; plausible if presentation hooks are reused unchanged.** The same person may change active Tenant, assignment, entity scope, ministry or purpose while options load. An old callback can paint the previous catalog or submit the old selection in a new context.

**Clause:** “Bind choice reads, selection, safe draft state and pending results to trusted principal/context, Tenant and relevant source scope and policy/catalog version. Invalidate or isolate affected data on context/revocation changes; stale results cannot populate the new context. Re-resolve current authority server-side at submission and accepted write. Caller-supplied scope/actor/list references are validated inputs, not authority.”

Exact cache-key representation is an implementation choice: safe scoped providers or invalidation can complement keys. A 60-second UI stale interval is not permission freshness. Current list IDs remain structural identity through a same-meaning rename; ordinary wording changes should not create a needless second ceremony. Materially changed intended source context must be reconciled explicitly. Preserve only currently permitted draft data.

**Proof:** same-user Tenant/assignment/entity/epoch changes, delayed fetch and mutation callbacks, sign-out/in, invalid cached list, restored tab and changed ministry. Cache tests must prove the scope transitions missing from the inspected user-ID-only cleanup; successful server denial alone does not prove the old UI data stayed private.

### A16-04 — List and optional stage form one qualified source selection

**High integrity / Critical cross-scope; plausible.** Changing the list in a starting draft can leave a same-named stage from the previous list. A null initial stage can bypass a poorly constructed composite reference; a read-authorized list can be withdrawn before acceptance.

**Clause:** “Persist the required trusted Tenant/source/list binding independently of optional stage. Any selected stage must belong to that exact qualified list and be currently selectable. Revalidate current list admission eligibility and source authority under D15's acceptance fence. Never repair mismatches by spelling, rank, first-stage substitution, caller dates or silently dropping a proposed stage.”

A starting-form change affects only the draft until its intended source action commits. It does not authorize switching an already existing journey. An invalid proposed pair receives permitted actionable validation without exposing foreign/hidden definitions; no partial journey/stage/work persists.

**Proof:** same-Tenant wrong-list stage, cross-Tenant list, null-stage with invalid list, list withdrawal/reversal and independent stage retirement racing admission, and cleared/replaced draft selections. Existing journeys on withdrawn lists retain D15 behavior; their picker is not the new-admission picker.

### A16-05 — Choice belongs to the durable admission intent, not its transport

**High; likely after uncertain submission if retry is treated as another form save.** A user may choose list B after an A submission times out, or a reviewed group may execute after its choice disappears. Reusing a key with changed input or making a new journey can conceal the original effect.

**Clause:** “Bind each submitted admission intent to its exact source scope and normalized selected list/stage/work payload. A retry reconciles the original effect; a changed payload under the same bound identity conflicts. Do not silently retarget accepted or still-unaccepted members to another list. Re-prove current context and eligibility per consequential acceptance under D4/D15.”

Normal edits to a never-submitted draft need no business history. After uncertain submission, establish the original outcome before treating changed choice as a fresh effect. Reused existing work keeps its own current list/stage and is reported truthfully; a requested different list never becomes an implicit switch. D3's ordinary identity excludes list choice. Before any reuse result can disclose existing work, authorize its minimum revealing metadata equally for present/absent cases; no duplicate workaround or new coordination queue.

**Proof:** lost response followed by changed list, same-key changed stage, concurrent starts selecting different lists for the same ordinary journey, stale group members, old receipt after later authorized change and revoked result disclosure. Historical receipt is not current state. Source admission/history/required work and result remain atomic under the existing contract.

### A16-06 — Simpler applicability does not relax database doors

**Critical; plausible.** Removing a process allowlist must not become a permissive `OR approved` policy, direct browser INSERT or unguarded privileged RPC.

**Clause:** “Keep P12 raw-table restrictions, least table/column/function grants, old-row and resulting-row RLS constraints, safe views/RPCs and authoritative server commands. Verify every admitted write/read path; admission choice cannot mutate configuration, actor, Tenant, current source scope or retained history.”

**Proof:** real nonowner INSERT/UPDATE/UPSERT/RETURNING, effective SELECT policies and extra permissive policies; RPC/import/worker/service paths; forbidden old/new scopes; config-to-admission and admission-to-config escalation. A passing owner-run FK experiment is not permission proof. This preserves D14/D15 controls without building an applicability engine.

## Primary mechanics and disposition

The previously read Supabase skill remains applied. Fresh official retrieval on 2026-10-10 checked [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html), [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). Applicable UPDATE/ALL policies use `USING` for old rows and inherit it as `WITH CHECK` when omitted; SELECT requirements also apply to relevant writes/RETURNING/upserts. Grants are independent, permissive policies OR together, and actual owner/execution privileges determine view/definer behavior. Complete references prove membership, not current permission/eligibility; optional stage must not nullify mandatory scope. Primary engine semantics override blanket skill claims.

No new database probe is needed to select A; actual implementation still needs the targeted tests above. Prior synthetic evidence remains limited to its exact fixtures. D14/D15 history, retention, restore and acceptance fences remain unchanged: restored selection caches cannot revive old eligibility/access or consumed admission intents. D16 rejects an extra process-specific restriction system; it does not choose defaults, mandatory/manual picker frequency or a switching feature. These safeguards make A precise without adding an unapproved grant, extra approval ceremony or general rules framework.

## Consolidated decision status

The [completed D16 review](../phase27-d16-adversarial-review.md) consolidates this
research and records Accept. The founder subsequently explicitly ratified its
exact decision and safeguards on 2026-10-10. Earlier recommendation language is
research provenance; no additional default, sole-option or saved-list correction
policy is inferred. [Q17](../phase27-q17-initial-list-choice.md) is unanswered.

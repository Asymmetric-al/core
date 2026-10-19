# Phase 27 D3 — authorization, privacy and Supabase adversarial review

> Research input, 2026-10-09. The [consolidated D3 review](../phase27-d3-adversarial-review.md)
> reconciles these recommendations and controls decision status. This is
> grooming evidence, not an approved schema, formal specification or proof
> of application/production qualification.

Research-only, 2026-10-09; repository `/workspace/core`, HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. D1 and amended D2 are ratified. Parent reports founder selected D3 A: one ordinary supporter/ministry partnership journey covering financial and prayer participation and particular asks; additional journeys only for genuinely independent continuing purposes. The checked-in Q3 research note still says unanswered; this review uses the founder answer supplied by the parent, not that stale status. This is a proposed decision review, not implementation, PRD, OpenSpec, issue draft or a production security finding. No remote writes, code changes, DB queries, deployments or tests were performed.

## Disposition and exact bounded wording

**Accept D3 with the qualifications below.** Grouping ordinary partnership work is compatible with P9/P12 and avoids artificial prayer/finance copies. It must not become a shared permission container, a global unique key before lifecycle is decided, or a blanket permission to discover and edit somebody else's existing work.

Proposed addition to D3:

> One ordinary partnership journey groups work; it does not combine its permissions. Prayer/financial participation, particular asks, tasks, interactions and source context retain their own admitted meaning and current source permissions. Reusing a journey is an authorized source operation, not permission to discover, edit or disclose all of it. An additional label, representative, visibility preference or new request ID cannot manufacture an independent purpose or evade the ordinary-journey boundary. A genuinely independent continuing purpose keeps its own progress and obligations without copying private history or repeating an already intended effect.
>
> Before admitting creation/reuse, the source owner must authorize the exact operation and the minimum existence/reuse metadata that its result reveals. A context lacking that authority cannot learn whether hidden existing work occupies the ordinary slot; it receives the same bounded unavailable/deferred result before that distinction is disclosed. Do not create a duplicate to bypass denied work. This creates no new permission, coordinator role, approval queue or manager step; exact enrollment admission and its permitted response remain the next owner-qualified decision.
>
> Business relationship purpose is not P12's processing purpose, contact consent, or the source-purpose identity of a task/message effect. Renaming/correcting it grants no access, changes no historical source meaning and cannot replay effects. Shared responsibility does not grant arbitrary stage editing; consequential changes use current action authority and an expected source revision, preserve history and retain existing unfinished obligations.

The first paragraph explains D3 itself. The second is the inherited no-disclosure floor with a genuine remaining admission-contract choice; do not silently ratify minimum existence disclosure by writing the paragraph. The third preserves existing owners and identifies implementation safeguards. No general purpose taxonomy, approval service, ACL, stage enum or table layout is authorized.

## Evidence and limits

All repository paths below are relative to `/workspace/core`.

### Accepted intent (not proof of implementation)

- `docs/features/donor-development/grill/phase27-q3-purpose-boundary.md:102–140`: proposed A covers financial/prayer participation and special asks in ordinary partnership; independent progress/follow-through/ending distinguishes continuing purposes; different representative/currency/annual renewal alone insufficient; exact admission and duplicate handling not settled. Its unanswered status is stale relative to the parent-supplied new founder answer.
- `docs/prds/sitestacker-parity/roadmap.md:4085–4105`: P9 assignments derive portfolios; one shared enrollment primitive with staff/P28 presets and stage history; asks are separate business records; every active enrollment requires next task/due or actionable exception; one source-purpose identity for native/workflow intended effects; P6/P17 own communication eligibility. `:4079` P26 provides **permitted** conversation context.
- P9 `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484–494`: role-qualified N staff-assignment edges and one primary; stage is not Party lifecycle; asks are not edges/custom fields; last touch/next action server computed. `:897–908`: no care timeline, restricted notes excluded, no Party notes/activity missionary projection, no missionary enumeration outside permitted slice. D3 cannot resolve the still-open exact P9/P28 interaction-sharing amendment.
- P9 `:1277–1320` and P12 `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2804–2869`: Ministry Assignment exact Tenant/Legal Entity, zero-many people, no membership/support-binding-as-access, independently authorized responsibilities and source projections. D3 does not create a new ministry ACL or supporter roster.
- P3 `docs/prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:68–74,88–94`: one subtractive field/row/context floor, no merged hats, narrow missionary/donor fields, controlled widening. P11 `phase-11-custom-fields-custom-collections.md:155–184`: new fields classified; filters/sorts/groups obey the same protection. A purpose label and “another journey exists” are data, not harmless UI metadata.
- P12 `:1584–1588`: exact trusted Tenant context, coarse tenant RLS plus authoritative PDP, no superadmin escape, live causal epoch/context verification. `:1597–1615`: field inputs governed and exact independent edit authority; merge tightens classification before repoint; partial permission does not admit partial source mutation.
- P12 `:1636–1638`: processing purpose is mandatory, declared by door rather than caller; consent/legal-basis floor; current fire-time recheck; residency veto plus placement including backups/replicas/embeddings/error systems/CDN; read and decrypt separate. `:1642`: sensitive read audit and non-plaintext access-governing history.
- P26 `docs/prds/sitestacker-parity/phase-26-support-hub-requirements-a.md:2691–2905,3601–3681,3735,3783,3965–3969`: authorize sources jointly before counts/union; useful separately permitted task brief, exact source references and source-purpose effects, no transcript copy/fake touch/task-as-financial-proof. `:4641` expressly applies purge/erasure/restore and source-read authorization to every projection/cache/export/log for its own automatic correspondence lane; that is inherited custody evidence, not permission to transplant P26's whole state machine to P27.
- `openspec/specs/crm-core/spec.md:14–35,46–64,106–126`: CRM server boundary, identity distinctions, cross-Tenant deny, no automatic weak-match linking, sensitive care exclusion and external slices need separate acceptance.

### Current inspected source

- A bounded `rg` across `packages/api/src`, `packages/auth`, `supabase/migrations` found no `MinistryAssignment`, `ministry_assignment`, `cultivation_enrollment`, `cultivationEnrollment`, `verifyEffectiveAccess` or `governance_version` implementation; it finds the pure `resolveProjection` core. Absence in this scope is not a repository-wide/live catalog proof. D3 native admission, uniqueness and stage commands therefore cannot be described as implemented.
- `packages/api/src/projection/types.ts:5–28`: producer evidence explicitly “never a token, caller approval or live verification.” `validation.ts:53–148` checks matching current facts/context/purpose/entity relationship; it does not obtain their authority. `resolver.ts:7–45` is a pure core. A mutually consistent client-supplied `purpose`/revision object is not an admission proof.
- `supabase/migrations/20261005050728_field_policy_foundation.sql:1,19–28`: static ceiling only, actor/row/purpose floors mandatory, tenant overrides dormant. `packages/api/src/field-policies/reader.ts:70–114` rejects bad/duplicate ceiling rows; this is not P27 full authorization adoption.
- `packages/auth/context.ts:240–301,313–337`: actual user resolved through Auth, profile read under caller RLS and active same-Tenant memberships via private RPC; role derivation/demo-superadmin fallback remains legacy. This is useful identity plumbing, not the full accepted exact P12 context/epoch/action contract.
- `packages/api/src/admin/crm/service.ts:164–250`: current tenant-filtered service reader fetches notes and whole-donor total, sorts/pages and constructs DTOs. `:129–160` profile-label lookup. These are not a permission-qualified new purpose inventory or hidden-journey detector.
- `packages/api/src/missionary-portal/donor.ts:29–54,73–101,174–194`: full donor patch includes status/notes and sets `updated_at`; write predicates enforce exact donor/Tenant/profile and explicit non-anonymity. No expected source revision is present. `:104–117` may pass raw DB error messages; `:129–145` activity performs access read then separate insert. These facts make it an unsuitable ready-made D3 shared-stage/reuse command, not evidence of a current D3 exploit. `:196–225` obtains actor IDs from authenticated route context, not payload.
- `apps/admin/app/(app)/crm/kanban-view.tsx:29–35,60–69`: loaded rows grouped/counts by `lifecycleStatus`; no P27 stage mutation. Do not label this as a implemented cultivation pipeline.
- `packages/api/src/admin/mission-control-tasks/service.ts:48–84`: task, links and event await separate dependency calls. Existing owner seam requires qualification for atomic P27 obligation/owned exception; D3 creates no new task engine.
- `supabase/migrations/20260515025814_support_hub_core_modules.sql:546–573`: broad authenticated staff CRUD with `authz.is_super_admin()` alternative. UPDATE **explicitly has USING and WITH CHECK**. This is a checked-in legacy policy, broader than P12/P26 intended source scope; deployed catalog not inspected. `20260526193000_mission_control_tasks.sql:109–131` enables RLS but revokes anon/authenticated access and grants service role; absence of user policy there is not itself a leak.
- `packages/auth/client-session.ts:56–83` clears cache on user switch/signout; not proof of same-user active-context changes. `packages/database/hooks/admin-crm-detail.ts:85–97` cache is prefix+record ID and 30s stale; `:100–121` query mutation scope serializes local note mutations but is not cross-client/Postgres concurrency protection.
- `tests/unit/packages/api/projection/reader-composition.test.ts:20` explicitly synthetic, not live uniqueness/RLS; `tests/unit/packages/api/missionary-portal/donor-mutations.test.ts:18–43,74–113` fluent-query mocks. No real D3 admission, DB policy, duplicate race, backup restore or UI qualification was executed.

### Primary PostgreSQL and Supabase evidence

Official pages read 2026-10-09; earlier D2 files were fetched during the same session.

1. [PostgreSQL17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): PK/unique/FK integrity checks bypass RLS and can form covert channels; superuser/BYPASSRLS always bypass; owner normally bypasses unless FORCE; policy permission subqueries can race under READ COMMITTED. Saved `/workspace/scratch/d2-postgres17-rls.txt`, relevant HTML lines 206,362,422.
2. [PostgreSQL17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html): existing-row USING, proposed-row WITH CHECK; omitted WITH CHECK inherits USING where applicable; permissive policies OR; SELECT policy/privileges apply where required to UPDATE/RETURNING/ON CONFLICT. Saved `/workspace/scratch/d2-postgres17-policy.txt`, lines 214–215,275–286. An UPSERT whose existing row fails its UPDATE USING throws instead of silently skipping.
3. [PostgreSQL17 INSERT](https://www.postgresql.org/docs/17/sql-insert.html): `ON CONFLICT DO UPDATE` is atomic insert-or-update but still an update, not a harmless “get existing”; SELECT privileges for conflict/read/RETURNING columns. `DO NOTHING` is not proof the intended journey exists and is authorized. Saved `/workspace/scratch/d3-postgres17-insert.html`, lines 273–277,342–344.
4. [PostgreSQL17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html): SECURITY DEFINER runs with **owner's** privileges; it is not an unconditional bypass irrespective of owner. Trusted search path, actual schema privileges and EXECUTE grants matter; default PUBLIC execute can be revoked/altered. Create/grant/revoke atomically to avoid exposure window. Saved `/workspace/scratch/d3-postgres17-functions.html`, lines 348–350,483–506.
5. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), fetched as Markdown in `/workspace/scratch/d2-supabase-rls.txt`, and Supabase `search_docs` official [Postgres Roles](https://supabase.com/docs/guides/database/postgres/roles), queried this review: service role elevated/bypasses RLS, grants and RLS distinct, invoker views, user metadata unsafe, JWT claims can be stale. Public key + TO authenticated is not row authorization. No live Supabase metadata was queried.
6. Supabase changelog, including current parent-fetched `/workspace/scratch/phase27-d3-supabase-changelog.md`: Sep25 PostgreSQL15.19/17.11 maintenance qualification warrants deployment-version verification later, not immediate upgrade or new product dependency. Official [Apr28 Data API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), fetched to `/workspace/scratch/d3-supabase-data-api-exposure.txt`, announces opt-in now, new-project default rollout May30 and existing-project rollout Oct30. Its body explicitly says existing objects retain their grants/reachability and changed default privileges affect future objects; RLS is unchanged. Current Core opt-in/catalog state was not inspected. Do not infer current grants or grant authenticated access merely to follow a generic missing-table hint.

The plugin and repository Supabase skill were read. Their blanket “without WITH CHECK a user can reassign ownership” and “SECURITY DEFINER bypasses RLS” statements are not primary PostgreSQL truth; use the qualified semantics above. No upstream skill feedback was submitted because this is research-only with no remote mutation authorization. No skill-prescribed implementation command applies to this review.

## Concern register: concrete trigger, consequence, amendment and proof

Likelihood is conditional on copying the named shortcut; it is not observed incidence. “Critical” concerns restricted disclosure/unauthorized effects; “high” concerns durable authority/history/obligation failures. Findings are design/reuse risks, not current live vulnerabilities.

### A1 — hidden existing ordinary journey becomes an existence oracle

**High; high if create-if-not-visible is copied. Effect: preserve D3; exact admission response needs source-owner qualification.** RLS-filtered SELECT finds nothing, INSERT conflicts with a hidden ordinary journey, and the caller learns it exists. A generic 23505 message still differs from successful creation in the otherwise identical absent-row case. An UPSERT with service privilege might return or overwrite that row.

**Exact amendment:** “Before source admission, independently authorize both the command and minimum metadata its outcome discloses. If the current context lacks that authority, deny/defer equally before testing/disclosing whether a hidden ordinary journey exists. Reuse neither grants access nor bypasses action permission, and denied work is not worked around by a duplicate.” This need not imply the entire journey is hidden: existence/identity may be allowed while purpose label, history or stage editing is denied. Do not grant those metadata rights in D3, invent a coordinator capability, or require every creation to enter a new approval queue.

**Proof:** same actor, Party/ministry and permitted dataset in two fixtures, one without ordinary journey and one with invisible ordinary journey; unauthorized observable response contains no different existence result, IDs, names, counts, owner, redirect or raw constraint detail. Independently authorized metadata-only user may receive exactly the approved reuse result but cannot read content or mutate stage. Direct REST/RPC/GraphQL and service-command conflicts obey the same qualified boundary. Auth lookup may inspect protected facts inside the trusted owner; “authorization before lookup” must not prohibit obtaining trusted evidence internally.

### A2 — one journey is mistaken for one audience or one edit grant

**Critical; high under team-account reuse. Effect: inherited safeguard, no new sharing policy.** Ordinary prayer/financial work is grouped, so shared reps/missionary receive all asks, private context or financial facts; a task assignee edits the stage or changes the purpose simply because the shared row is visible.

**Exact amendment:** “Grouping confers no grant. Read, source association, purpose correction, stage change, ask change, responsibility and task completion use their independently admitted actions and fields; any common header must itself be safe. A permitted task brief does not grant encounter, giving or whole-journey history.” Maintain existing P9 prohibition until exact P27/P28 projection qualification; D3 is not that amendment.

**Proof:** ordinary journey with a shared safe task, restricted ask, finance-only source and private interaction; eligible task recipient gets useful permitted action but no hidden content/counts, edits or full source access. Joining/leaving ministry, staff responsibility or prayer participation changes no independent grants. Former participant with valid independent staff permission is not incorrectly blanket denied.

### A3 — three different meanings of purpose collapse

**Critical; medium if generic string fields are reused. Effect: inherited safeguard.** A user edits “relationship purpose” or extra-purpose label and the server treats it as P12 processing authority, a consent override, or a new workflow source-purpose effect key.

**Exact amendment:** “Business relationship purpose records cultivation meaning. P12 processing purpose is door-declared and current; communication contactability remains source-owned; task/message effect identity records the intended source effect. A relationship label or correction cannot choose a more powerful authorization purpose or create a fresh receipt namespace.” Keep existing resolver/communication owners; no new P27 legal-purpose engine.

**Proof:** modified/forged purpose string cannot reveal fields or send against suppression; alternate generic endpoint/GraphQL/deferred run cannot choose broader egress purpose; allowed read with wrong residency/legal-basis is denied; renamed journey leaves old effect receipt authoritative and creates no new send/task by itself.

### A4 — confidential independent-purpose label leaks via metadata

**Critical for restricted worker/context; medium. Effect: inherited field/source safeguard.** Dropdown, duplicate banner, global search facet, task title, export or “two other purposes” reveals a care/security/financial fact even though detail is hidden. A purpose “reason” becomes a copied private note; privacy needs create false independent journeys.

**Exact amendment:** “Purpose identity/label/reason, existence and derived counts are classified source facts. Reuse permitted minimal labels; do not put private source narrative in a purpose name. Apply current field and source floors before options/filtering/counting/ranking/serialization. Confidentiality alone is not an independent relationship purpose; retain separate permissions inside ordinary work.” Do not categorically ban a genuinely independent confidential purpose; authorize its exact safe representation without manufacturing a shared note body.

**Proof:** a hidden extra purpose added to a fixture does not alter unauthorized list facets, counts, board columns, search suggestions, summary, accessible name, URL or export; approved generic placeholder only if its existence is independently permitted. Restricted alias has no real-name fallback. Task/notification useful content is separately admitted.

### A5 — shared responsibility causes lost stage/next-action edits

**High; medium-high under multiple staff/missionary editors. Effect: engineering safeguard; actual stage semantics remain a product decision.** Two independently permitted users edit from the same revision, a full-object update wipes hidden fields, or finishing one prayer task clears an outstanding financial obligation. A new ask makes shared stage oscillate automatically.

**Exact amendment:** “Each source command authorizes intended changed fields against the current revision. A stale conflicting change has a safe actionable conflict, not silent last-write-wins; omitted/withheld values never mean erase. Completing a particular task/ask does not complete the whole partnership or other obligations. Preserve stage history and active next-task/owned-exception invariant.” Use the existing source transaction/expected version; no global ministry edit lock, second stage engine, mandatory staff-wide meeting or CRDT is implied.

**Proof:** two DB connections for same-stage conflicts and disjoint ask operations; stale masked form cannot blank hidden labels/notes; per-ask completion preserves sibling obligations; concurrent last-task completion/reassignment yields a valid next task or owned exception; stage reversal requires qualified intentional operation and preserves history. Current donor full-PATCH and UI mutation scope are not proof of this behavior.

### A6 — free label or lifecycle state defeats semantic uniqueness

**High; high if a quick UNIQUE(Party,ministry,purpose_text) is chosen. Effect: preserve D3, do not prematurely settle admission/lifetime.** Capitalization, spelling, translated name, different staff or repeated annual labels yield duplicate ordinary journeys; a unique Party/ministry forever key instead blocks later legitimate lifetime or genuine independent purposes. Pausing a row may accidentally free a slot; merging Parties can introduce a collision.

**Exact amendment:** “Enforce the admitted semantic ordinary-journey boundary through authoritative source identity and lifetime, not display labels, profile IDs or request IDs. The exact scope includes source Tenant/Legal Entity and Party compatibility; current lifecycle/concurrency decisions determine the constraint. Do not invent a uniqueness exemption by archiving/pausing or a new purpose merely to pass the constraint.” Once those semantics are ratified, a normal Postgres uniqueness/transaction mechanism is sufficient; no fuzzy-purpose search, tenant-wide ontology or generic identity service is needed.

**Proof:** concurrent two-user ordinary create/retry resolves one admitted journey/obligation; alternate labels/current reps/currencies do not bypass; genuinely independent approved work succeeds; paused/ended/reopen and Party merge scenarios use their then-ratified rules, not an assumed partial-index predicate. Scope defects reject under direct SQL as well as API.

### A7 — purpose correction rewrites history or widens grants

**High; medium. Effect: apply ratified D2 correction boundary.** Editing extra-purpose wording silently changes semantic identity, moves asks or deduplicates two histories with different visibility; changing the purpose revives an old message effect or makes an old ask appear to concern a different relationship.

**Exact amendment:** “Distinguish display correction, mistaken source association and genuinely changed continuing purpose. Use qualified expected-version source correction with original meaning, actor, reason and revision retained under owner retention. Presented/completed effects remain attributable; merge/repoint never unions grants or private histories. A different future purpose requires explicit disposition and, where appropriate, separately admitted linked work.” Do not make draft mistakes unrepairable; no speculative P27 merger subsystem.

**Proof:** typo versus materially changed purpose; correction into an existing ordinary slot; stale simultaneous correction; corrected after presented ask/delivery; Party merge/unmerge; finance fact and original interaction untouched; revocation or purpose correction cannot regenerate effect identity. If target/source cannot be authorized, repair blocks without displaying hidden reason/history.

### A8 — all-door and resulting-row enforcement is skipped for simple Supabase CRUD

**Critical; medium if raw D3 table CRUD is exposed. Effect: inherited technical guardrail.** A safe UI calls a service but browser raw table, legacy staff policy, definer RPC, GraphQL, Storage or job bypasses exact source admission; UPDATE moves a visible extra journey into a forbidden scope; a narrow permissive policy is added next to a broad one.

**Exact amendment:** “Canonical packages/api source commands enforce compound admission and consequential changes; raw grants/RLS/registered collection paths cannot provide a weaker alternative. Inspect grants and all applicable policies, actual definer owner/search path/EXECUTE privileges, views, service-role paths, jobs and outputs. Enforce allowed old and proposed rows, not just a Tenant filter.” RLS remains P12 coarse defense, not a second capability implementation. Data-API grants and RLS are different gates. A revoked browser table can be intentionally service-owned; do not add permission solely to make a client CRUD sample work.

**Proof:** catalog and actual SELECT/INSERT/UPDATE/DELETE/UPSERT/RETURNING against disposable DB; tenant/entity reassignment, target swapping, raw actor fields, ordinary/extra discriminator changes, service context forged IDs, narrow+legacy broad policy composition, RPC EXECUTE and view behavior. Confirm resulting rows and no side effects, not only HTTP status. No security claim from a SQL-text assertion.

### A9 — authorization changes during reuse/edit/fire or same-user cache switch

**Critical; medium under ordinary concurrency. Effect: inherited P12 boundary.** Lookup authorizes existing journey; grant/entity/purpose/assignment then changes; stale browser/API/job still updates or shows a returned row. App cache is user-only and ordinary/detail purpose selectors reuse unscoped keys.

**Exact amendment:** “Resolve current trusted source/context/epoch at the consequential boundary; establish a causal commit order for revocation and the source operation. Re-resolve deferred effects at admission/fire. Scope caches/cursors to exact active context and authority/source generation; cancel/reject late responses and clear newly denied state.” Reuse current owner discipline, not a P27 permission engine or new JWT scheme; do not promise read revocation can recall already downloaded external bytes.

**Proof:** deterministic independent connections: accepted write before revoke vs revoke before admission, current source after old prepared request, task reassignment and visibility narrowing; same logged-in user switches context/entity with late detail/duplicate response. Valid historical receipt retained, no new unauthorized effect. Do not rely on sleep or a cached JWT refresh alone.

### A10 — restore/import resurrects hidden journeys, removed content or completed effects

**High; medium. Effect: inherited migration/custody safeguard.** Import transforms legacy profile/status/tags into ordinary or extra-purpose journeys without source meaning; backup restores old permission, source purpose, unredacted reason or queued follow-up, causing disclosure, duplicates or repeat contact.

**Exact amendment:** “Admit only source-evidenced mapping/meaning; unresolved legacy purpose stays unresolved without fake extra journeys or new effects. Before restoring affected reads/writers/jobs, reconcile current owner retention/erasure/redaction, revocation/suppression, source revisions and accepted effect receipts. Missing current disposition keeps affected output/action unavailable. Preserve only minimum permitted history, and fence incompatible old writers.” No new universal retention period, mandatory full legacy backfill or separate recovery platform.

**Proof:** restore snapshot predating purpose correction, redaction and revocation while viewer still otherwise has a valid grant; hidden/private bytes remain absent; completed task/message not repeated under repaired purpose; imports repeated/interrupted cause zero new outreach/enrollment meaning; legitimate existing obligations retained; exact target ambiguity does not fan out to each ministry.

## Simplicity and adoption boundaries

- Use one existing source model with explicit source-owned commands and normal relational integrity. D3 provides no reason for a bespoke workflow engine, new authorization service, broad team permission, configurable legal-purpose taxonomy or a generic journey merge framework.
- Prefer a narrow admission/mutation transaction once source lifetime and identity are settled. A preflight duplicate search is optional UX and never concurrency authority. An atomic UPSERT is a tool only when its **update semantics and returned projection** are explicitly authorized; it cannot stand in for deduplication policy.
- Do not mandate a new manager step. Ordinary authorized create/reuse can remain direct. The only contexts denied/deferred uniformly are those lacking independently authorized minimum source-admission observability; the later entry decision must define their existing-owner path without inventing data visibility.
- Existing source/context and stage/read history permissions may be narrower than whole-row visibility; tests should cover metadata-visible/content-hidden users, not just all-visible/all-hidden binaries.
- Requirements above qualify the native flow as well as optional workflow consumers. Do not gate all P27 on completing entire future phases; unavailable optional context stays unavailable. Conversely, publication of P12/P9 does not prove executable prerequisites exist.

## Additional authorization review lenses

This is the authorization/privacy contribution to the parent's whole review, not a claim to independently audit UX/finance/performance end to end.

| Category                  | Relevant finding and bounded answer                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1 Architecture            | A2/A3/A8: one source/PDP; grouping not authority.                                                                             |
| 2 Data model/schema       | A6/A7: semantic scope/lifetime before unique key, no display-label identity.                                                  |
| 3 Domain model            | A2/A3/A6: business purpose, processing purpose and effect purpose distinct.                                                   |
| 4 Implementation approach | A1/A5/A8: canonical transactional commands; safe ordinary Postgres primitives.                                                |
| 5 Footguns                | A1/A4/A7: UPSERT existing row, confidential label, correction collision.                                                      |
| 6 Tenant safety           | A6/A8/A9: exact trusted Tenant/entity plus compatible Party; current scope.                                                   |
| 7 Security/privacy        | A1–A4/A8/A9: no disclosure or grants from reuse/membership.                                                                   |
| 8 Concurrency             | A5/A6/A9: same-source conflicts, duplicate create, revoke linearization.                                                      |
| 9 Transactions            | A5/A6/A8: source state plus mandatory obligation/owned exception, no partial privileged admission.                            |
| 10 Idempotency            | A3/A6/A7: intended source effect persists across labels/users/retries; distinct purpose needs evidence.                       |
| 11 Failure/recovery       | A1/A5/A10: safe retry/conflict/unavailable; no hidden mutation or effect replay.                                              |
| 12 Edge/lifecycle cases   | A5–A7/A10: paused/ended, merge, correction, limited metadata authority.                                                       |
| 13 UX                     | A1/A2/A4/A5: useful permitted reuse result, no new approval queue, honest conflict, no sensitive labels.                      |
| 14 Accessibility          | A4/A5: safe accessible labels/error text; full keyboard/AT evaluation belongs to UX reviewer.                                 |
| 15 Simplicity             | Above: normal source commands/constraints, no new permission or workflow engine.                                              |
| 16 Performance            | A4/A6/A9: authorize before count/page; scope index/cache; no full-table client dedupe or per-tenant global lock prescription. |
| 17 Testing                | A1–A10: real roles/catalog/resulting rows/connections, no mocks as runtime proof.                                             |
| 18 Audit/observability    | A4/A7/A10: original actor/revision; minimal reason identifiers; diagnostics not content archive.                              |
| 19 Operational ownership  | A1/A5/A10: existing source owner; explicit eligible work/exception, no invented coordinator.                                  |
| 20 Migration/rollout      | A8/A10: source mapping, incompatible-writer fencing, no automatic stage/purpose backfill.                                     |
| 21 Future compatibility   | A2/A3/A6: P28 narrow projections; same native/workflow effect; no fixed free-text unique key.                                 |
| 22 Other hazards          | A4/A9/A10: backup placement, retained derivatives, hidden metadata and same-user late responses.                              |

## What genuinely remains a product decision

D3 can settle ordinary-versus-independent continuing purpose without deciding exact admission, stage meanings, lifetime reopen, who may edit each action, or the minimum metadata a creator may see. The next entry/admission choice must qualify the actual source command and its disclosure (create when absent, reuse when existing, context insufficient) under P12. Existing no-disclosure floors are not a new founder security questionnaire. Granting new metadata/history visibility **would** be a product/owner amendment and cannot be silently inferred from D3.

A prayer-only ordinary partnership need not be a financial prospect; the authorization review does not mandate a financial goal/stage or derive spiritual commitment from participation. Product/UX peers must make any stage/ask implication explicit before implementation. Hidden or restricted context must never force a false extra-purpose journey merely to preserve confidentiality.

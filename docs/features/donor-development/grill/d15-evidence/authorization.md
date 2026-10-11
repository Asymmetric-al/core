# D15 evidence — withdraw new admission without withdrawing existing authority

2026-10-10. Founder selected **A: withdraw a whole stage list from new partnership admissions while existing work continues choosing its available stages**. **Recommendation: accept A with the explicit edge-policy clarifications below and inherited P12/source safeguards.** Research against Core `225c02e9499bd6c0d493223cd4b1a4120ff787e3`; this appendix changes documentation only. Severity/likelihood describe prospective implementation failures, not a deployed P27 vulnerability.

## Governing intent and actual source

- [Q15:30–45,76–101](../phase27-q15-retiring-stage-lists.md:30) states A and reserves paused/closed returns, defaults, restoration and concurrency. Its unanswered marker predates the supplied selection. [Ratified D14 R03–R08](../phase27-d14-adversarial-review.md:242) separates configuration, admission, stage mutation and disclosure, requires scoped references and atomic, current-authority acceptance. [D14 R14](../phase27-d14-adversarial-review.md:383) requires qualification of whole-list lifecycle without previously choosing it.
- [D10 R03/R04:154–173](../phase27-d10-adversarial-review.md:154) preserves retired **stage** references but prevents fresh selection, keeps lists offered for new work usable and forbids rank-based default repair. It does not itself settle whole-list withdrawal. [D8:15–33](../phase27-d8-reopening-review.md:15) preserves returning journey identity and current authority, without reviving child work. [D13 R05](../phase27-d13-adversarial-review.md:235) requires valid source/list scope despite an absent stage.
- P12 [1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1632](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) own trusted current context, capability and strict disclosure floors, protected existence, query inputs/counts, egress and defense in depth. Assignment, creator status, service role or old grant supplies no independent permission.
- [Platform boundaries:13–27](../../../../../openspec/specs/platform-boundaries/spec.md:13) require shared behavior across surfaces. [The data boundary:10–17,75–79](../../../../../docs/guides/architecture/data-access-boundary.md:10) places business commands in `packages/api`. The active workflow [task 24.3](../../../../../openspec/changes/add-workflow-studio-program-contracts/tasks.md:220) still calls for implementation/qualification of native cultivation consumption; it is not delivered D15 behavior.
- **Observed precedent:** [configuration route:243–300](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:243) checks tenant-default capabilities/delegates separately from contribution powers. Conversely, [coarse CRM access:16–62](../../../../../packages/api/src/crm/auth/access.ts:16) checks staff roles and tenant context; the carried action label does not prove a D15 capability check. Neither qualifies P27 permission enforcement.
- **Unsafe semantic reuse:** [personal-view deletion service:218–251](../../../../../packages/api/src/admin/crm/table-preferences/named-views.ts:218) calls a service RPC; its [SQL:250–345](../../../../../supabase/migrations/20260611170000_crm_table_named_views.sql:250) locks scoped views, deletes the target, rewrites active-view settings and optionally promotes a replacement default. [The table:5–28](../../../../../supabase/migrations/20260611170000_crm_table_named_views.sql:5) is personal, cascades from profile deletion, revokes browser grants and grants service access. Those are source facts about another feature, not permission to delete, transfer or auto-replace an organization stage list.

Fresh bounded searches for cultivation/list/stage source identifiers across API/database packages, migrations and admin/missionary apps found no authoritative P27 lifecycle implementation. No hosted database, actual role catalog or runtime was inspected. No production absence claim follows.

## Material concerns and exact requirements

### A15-01 — Admission eligibility must not become a global access filter

**High; likely if one active-only predicate is reused.** Hiding a withdrawn definition from every read can remove ongoing journeys, mislabel their stage as absent or make normal edits impossible. Conversely, an `OR existing` branch can bypass tenant or disclosure floors.

**Clause:** “Withdrawal changes eligibility for new admission to that list. Existing authorized source journeys retain their qualified list/stage references, definition reads and permitted stage-choice operation. Apply current P12 floors independently; a withdrawn list is neither inaccessible by definition nor an access grant. An independently retired stage remains unavailable for fresh selection. Absent or hidden joined definitions never mean Not yet assessed.”

**Proof:** admitted assessed/unassessed journeys remain usable; denied actors receive no new metadata. Active-only pickers for new work cannot be reused as historical/read filters. Test stage mutation separately from an unchanged retained stage, and count/export coverage after withdrawal. Withdrawal alone creates no closure, assignment, task cancellation, reminder, notification or contact.

### A15-02 — Configuration authority is separate from journey and readiness disclosure

**Critical; plausible.** A configurator can lack visibility into protected ministries or another Legal Entity. Usage/default warnings can disclose them even when no detail page opens.

**Clause:** “Resolve current actor and applicable human/service/operator context, Tenant, catalog scope, capability, purpose, entity/source/field/history floors, residency and epoch server-side. Independently authorize any list read, usage count, dependency/readiness result, history, export or replay. Do not require unrestricted journey access to withdraw a list.”

Withdrawal does not intrinsically require a user count: continuing work is permitted. If a qualified dependency rule needs a bounded ready/not-ready result, authorize that minimal projection **before attempting** the operation, for both existing and absent dependencies. Without authority, return the same permitted unavailable result regardless of hidden references. An internal invariant check may cover protected rows without exposing them; it is not a grant to the actor. No newly invented coordinator role, permission-request queue or complete list of affected journeys is necessary.

**Proof:** config-only/journey-only/lead-only/revoked actors receive exact rights; protected-present/absent dependency cases cannot be distinguished without the relevant minimal projection. Do not return raw FK errors, default names or unauthorized totals. Permission predicates precede disclosed counts, not post-fetch filtering.

### A15-03 — Withdrawal and admission need a shared acceptance fence

**High integrity / Critical if authorization races; plausible.** A valid FK proves existence, not current new-use eligibility. A stale form, queued group member, importer or backdated timestamp can otherwise admit new work after withdrawal.

**Clause:** “Order withdrawal and actual source admission through a conflicting source fence with current eligibility revalidation. If admission is accepted first, it is retained existing work; if withdrawal is accepted first, no fresh admission to that list is accepted. D13's absent stage does not bypass this rule. Trust durable source identity, not caller-provided existing flags, creation dates or UI selection time.”

Current P12 authority/epoch must likewise be coupled to the accepted write. Revocation effective before acceptance prevents the effect; later revocation restricts subsequent reads/replay, without rewriting accepted history. Preserve D4's per-member acceptance semantics for reviewed groups: unsent/unaccepted members do not inherit an earlier member's eligibility. An already accepted journey's permitted reuse is not a new admission; D3's hidden-reuse metadata rule still applies. Qualified historical correction/import does not authorize a fresh operational admission disguised as history.

**Proof:** both race orders, rollback of the prospective winner, deferred and null-stage admission, foreign Tenant/list, same-stage-name substitution and permission change. Use controlled blocking evidence rather than sleeps. No global catalog lock or long network call inside the transaction is needed. Ordinary FK locking or `FOR KEY SHARE` alone is insufficient for a non-key eligibility update.

### A15-04 — Preserve all database and privileged-path boundaries

**Critical; plausible.** Browser APIs, broad update DTOs, upserts, views or service RPCs may bypass a correct lifecycle button or silently change owner/Tenant/list.

**Clause:** “Retain complete tenant/list/stage references and immutable source scope through ordinary lifecycle operations. Keep raw tables browser-inaccessible under P12; qualify effective table/column/function grants, RLS existing/resulting-row policies, views and RPC owners/search paths. Privileged callers enforce the same current source contract. A caller-supplied authority boolean, scope or actor is not trusted.”

**Proof:** actual nonowner/service contexts across INSERT, UPDATE, UPSERT, DELETE, RETURNING, RPC, import, workers and mixed API versions; include extra permissive policies and allowed-old/forbidden-new scope changes. Continued use must never be implemented by weakening RLS for withdrawn rows. A real-role test of table privileges is distinct from an owner-run lifecycle fixture and from Core P12.

### A15-05 — Usability/default checks must not depend on hidden users

**High integrity / Critical disclosure; plausible.** “Allow the last stage to retire only when no visible journeys use it” both misses hidden users and leaks usage through outcome. Auto-promoting another list can silently change meaning; preventing withdrawal of the last admission choice can also become an unselected product restriction.

**Proposed explicit edge policy, not an inherited fact:** require at least one selectable stage in **every** list retained for continued use, independent of counts or whether journeys currently use it. Permit zero lists for new admission intentionally, provided no separately required owner/default dependency is invalidated; new admission is then unavailable with permitted recovery. This allows withdrawn lists to remain usable without promising an always-open admission catalog.

**Clause:** “Preserve qualified required default/reference invariants atomically with withdrawal. Any repair must be explicit and separately authorized at its owning source; no first-list, same-name, order-based or hidden fallback. Do not expose dependency details beyond current permission. A list/option hidden from this actor is not evidence of zero available source choices.”

**Proof:** last selectable stage in withdrawn list, no current users, only hidden users, zero new-admission lists, mandatory/optional default variants, concurrent default change and withdrawal. Apply the A15-02 minimal-readiness rule. The exact default/applicability owner contract remains prerequisite; D15 does not create a required default.

### A15-06 — Return, reversal and replay must remain distinct

**High; plausible.** Reopening can be mistaken for new admission; a retry can retire a restored list again or overwrite later configuration.

**Proposed explicit edge policy:** same-journey resume/reopen continues stage choice on its retained withdrawn list under current permissions; an explicit same-meaning reversal restores new-admission eligibility on the same list identity, with new configuration history. These extend A coherently but are not already selected by D8 or stage-level D10.

**Clause:** “Lifecycle mutations use current expected revision and durable tenant/operation/list/normalized-intent identity. Replay returns only currently permitted evidence of its original effect, separately from current state; it never re-executes an old withdrawal/reversal. Changed payload under one intent conflicts. A new intent after withdrawal/reversal requires the current revision even if the displayed state matches an older state.”

**Proof:** repeated withdrawals/reversals, ABA stale revision, no-op retry after later reversal, concurrent stage editing, lost response and changed actor. Required configuration history/result commit atomically; precommit abort rolls back, postcommit projection/response failure reconciles accepted facts. Preserve original attribution. No new journey or ended child work is resurrected by return/reversal.

### A15-07 — Retention and recovery must not resurrect eligibility or private text

**Critical privacy / High integrity; plausible.** A restored backup, stale worker or old cache can reinstate admission, old permission or erased metadata. Keeping structural history does not authorize permanent narrative retention.

**Clause:** “Retain stable lawful identities and event-time meaning under current history/retention/redaction rules. Withdrawal is not deletion or erasure. Before restored readers, writers or workers activate, reconcile authoritative catalog/source revisions, admission eligibility, applicable stage eligibility/defaults, current access, redaction/expiry and consumed command/effect fences. Hold affected paths if those facts cannot be recovered.”

**Proof:** backups before withdrawal/reversal, permission revocation, redaction or accepted admission; stale cache/receipt and delayed callbacks; creator departure. No private list/guidance text appears in ordinary logs, forbidden exports or stale projections. Recovery cannot fabricate another list, move existing work, resurrect a consumed request or borrow the former actor's authority.

## Fresh primary mechanics and qualification limits

The previously read Supabase skill remains applied; fresh 2026-10-10 retrieval checked [PG17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [locking](https://www.postgresql.org/docs/17/explicit-locking.html), [isolation](https://www.postgresql.org/docs/17/transaction-iso.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). `USING` tests existing rows and applicable omitted UPDATE/ALL `WITH CHECK` inherits it; omission is not an automatic bypass. Grants remain independent; permissive policies combine by OR. Owners normally bypass RLS unless forced, while superuser/BYPASSRLS still bypass. View/definer behavior depends on actual execution/owner privileges. Cross-row policy queries can race, and integrity checks can reveal conflicts. Key-share locks do not block ordinary non-key updates; transaction isolation/recheck behavior must match the chosen fence. These are engine facts, not deployed Core qualification.

The implementation researcher owns the isolated D15 probe; this appendix neither runs nor claims its results. D14's 14 checks did not qualify whole-list withdrawal, admission races, Core authorization, defaults, restore or UI. The smallest permanent solution is the existing shared source/configuration command boundary with distinct admission and continued-use predicates, not another permission hierarchy or lifecycle engine. Edge policies above require explicit recording in the consolidated decision; remaining implementation gates require real source/API/role evidence before release.

## Consolidated review disposition

The [completed D15 review](../phase27-d15-adversarial-review.md) reconciles this
research into an exact amended decision, including return, reversible
availability with saved-list retention, usable retained catalogs and zero-new-list
treatment. The founder explicitly ratified that decision and its safeguards on
2026-10-10. Earlier proposed labels and reservations here record the evidence-stage
scope, not a competing current recommendation. The full
review defines the owner-native dependency, naming-conflict and release-proof
requirements. No product implementation follows from publication of this appendix.

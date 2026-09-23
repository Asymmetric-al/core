# Phase 24 D37 — Complete Tenant Current-Work Cohort Primary Research

**Status:** Primary research supporting the accepted D37 founder direction;
not a runtime, migration, OpenSpec, or Live implementation claim  
**Recommended answer:** Option 1 with the D37 adversarial amendments  
**Research date:** 2026-08-29

## Research question

Should one D36 current-work application adopt a saved D35 Website recovery
policy across the complete compatible Tenant backlog, only work the initiating
person can see, or a selected subset—and what capability and UX make the
Tenant-wide option clear without granting restricted source access?

## Evidence labels

- **Repository fact:** directly verified in current Core source, OpenSpec,
  accepted ADRs, glossary, or Phase 24 records.
- **Verified external fact:** directly supported by linked current official
  documentation.
- **Reasonable inference:** a conclusion from verified facts; not a vendor
  guarantee.
- **Product judgment:** Core's recommended choice after applying repository
  priorities and alternatives.
- **Assumption:** plausible but not established by current Tenant evidence.
- **Repository decision:** D38 now fixes zero-by-default explicit-only grant
  governance; D39 permits typed direct assignment and protected flat Access-
  group sources through one Phase 12 EffectiveAccess model.

## Executive finding

Choose **one complete compatible Tenant cohort under a separate Tenant-wide
Website recovery current-work application capability**.

The modern, repository-consistent design has six separations:

1. D35 policy/cutover own prospective intent.
2. Website source occurrences/heads own the complete current universe.
3. A code-owned producer/version catalog owns compatibility.
4. Prepared evidence and an atomic seal own complete reviewed application
   membership.
5. The D37 capability owns only Tenant-wide application plus the exact minimum
   aggregate impact necessary for consent.
6. D36 per-occurrence commands own routing effects; Tasks Hub, engagement, and
   Inngest remain projection/execution.

“Complete compatible Tenant cohort” belongs in design and diagnostics. Staff
language is **all current Needs assignment work covered by this setting across
the organization**. The capability intentionally discloses exact complete
aggregate item and assignment consequences but no Site, member, source, body,
visible/restricted split, or per-person workload. That is clearer and safer
than a second partial-count mode: anyone not trusted with the aggregate blast
radius should not receive the mutating capability.

## Current repository evidence

| Repository source                                                                                                 | Verified fact                                                                                                                                                                                           | D37 consequence                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [Platform principles](../../../openspec/specs/platform-principles/spec.md)                                        | Tenant/permission correctness outranks convenience; durable system behavior should remove repeated manual glue.                                                                                         | Use one safe complete adoption path, not repeated visible-only work.                                   |
| [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)                                        | Operational truth stays in CRM/source domains; tenant-wide administration belongs in Mission Control; hidden capability must be intentional and clean; AI has the human's authority and approval gates. | Separate action capability, server source truth, quiet unauthorized UI, human confirmation.            |
| [Workflow orchestration](../../../openspec/specs/workflow-orchestration/spec.md)                                  | Product ledger/claims/auth remain authoritative; Inngest is optional identifier-only execution.                                                                                                         | Catalog/census/seal/results cannot live in an event run.                                               |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                  | Engagement is recipient-specific and never business completion.                                                                                                                                         | Complete application still preserves continuing read state and creates unread only for new recipients. |
| [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)                                  | Capability, availability, source authorization, visibility, and policy are distinct.                                                                                                                    | Tenant apply authority grants no source/detail/recipient authority.                                    |
| [ADR-0182](../../adr/0182-one-current-candidate-review-responsibility-lane.md)                                    | Route saves are prospective; current work changes through explicit impact-reviewed differential handoff.                                                                                                | D37 reuses mechanics, not D29 route meaning or membership.                                             |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                | Source owns actionability/end; Tasks Hub is a projection and generic task mutation rejects source work.                                                                                                 | Cohort and routing cannot come from tasks or task bulk APIs.                                           |
| [D35 adversarial review](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md)         | One Tenant-only policy has lane-only or one-to-three members and no Site override; source visibility narrows each recipient.                                                                            | Tenant policy implies one coherent current cohort; apply actor never qualifies coordinators.           |
| [D36 adversarial review](./phase-24-d36-prospective-save-explicit-current-work-application-adversarial-review.md) | Save is prospective; current adoption is distinct, durable, per-occurrence atomic, differential, and resumable.                                                                                         | D37 defines membership/capability without changing D36 source outcomes.                                |
| [Mission Control tasks migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)          | Generic task has mutable assignee/status/dates/comments/reminders and broad paths.                                                                                                                      | It is not a D37 cohort, application, routing, or result authority.                                     |
| [Contribution batch migration](../../../supabase/migrations/20260526202500_contribution_operation_batches.sql)    | Header/items/status demonstrate durable batch vocabulary but persist finance-specific JSON snapshots and broad service grants.                                                                          | Reuse operational lessons only; D37 needs normalized source-owned membership and distinct auth.        |
| [Contribution confirmation](<../../../apps/admin/app/(app)/contributions/main-body.tsx>)                          | Core already uses one Base UI review with a compact semantic impact `dl` and progress wording.                                                                                                          | Reuse visual/interaction vocabulary, not client continuation/finance semantics.                        |
| [Tenant-default dialog](<../../../apps/admin/app/(app)/crm/gift-history-dialogs.tsx>)                             | Core clearly states a Tenant-wide consequence and preserves unrelated personal settings.                                                                                                                | One concise organization-scope explanation fits the product language.                                  |
| [Base Maia config](../../../packages/ui/components.json)                                                          | Core pins Base UI, Maia, Zinc semantic variables, and Lucide.                                                                                                                                           | Use shared primitives/tokens with no local component fork.                                             |

## Current official product and standards evidence

| Official source                                                                                                                                                   | Verified current behavior                                                                                                                                           | Useful precedent                                                                    | Core boundary                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [HubSpot — manual enrollment](https://knowledge.hubspot.com/workflows/manually-enroll-objects-into-workflows)                                                     | Existing-record enrollment requires a separate `Enroll` permission; edit without enroll cannot apply; all-record actions present a count and explicit confirmation. | Separate configuration from current adoption and show exact aggregate blast radius. | No manual filter/list/typed-count/re-enrollment semantics define Core membership. |
| [HubSpot — create workflows](https://knowledge.hubspot.com/workflows/create-workflows)                                                                            | Future trigger enrollment and existing-record enrollment are distinct choices.                                                                                      | Prospective policy and current adoption are separate.                               | Approximate counts are not safe Core consequence authority.                       |
| [Dynamics — routing rules](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/create-rules-automatically-route-cases)                      | Activating routing governs later work; existing cases require deliberate selection and **Apply Routing Rule**.                                                      | Existing routing changes should not hide in policy save.                            | Core does not import selection or mutable case/queue ownership.                   |
| [GitHub — organization rulesets](https://docs.github.com/en/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization) | Organization owners can govern all repositories through an organization-level ruleset.                                                                              | Governance scope can match organization policy scope.                               | D37 does not infer owner/admin or add Site selectors/bypass roles.                |
| [Contentful — bulk actions](https://www.contentful.com/developers/docs/references/content-management-api/bulk-actions/)                                           | Bulk actions are asynchronous/status-addressable, enforce version/permission checks, and use non-enumerating not-found behavior.                                    | Persistent status, version fences, safe errors.                                     | Caller-selected entries, seven-day retention, and vendor limits are not imported. |
| [Contentful — role rules](https://www.contentful.com/help/roles/space-roles-and-permissions/allow-and-deny-rules/)                                                | Read and mutation permissions are explicit actions and deny rules can narrow them.                                                                                  | Action-specific authorization matters.                                              | D37 deliberately authorizes an aggregate operation without source-row read.       |
| [Blackbaud — Altru global change](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/altru/help/content/ADMGlobalChangesPage.html)                        | Nonprofit administrators apply defined changes to a specific group of records.                                                                                      | Nonprofit CRM users recognize deliberate administrative group operations.           | D37's group is code-owned, not query-selected.                                    |
| [Blackbaud — Global Add, Delete & Change](https://webfiles-sc1.blackbaud.com/files/support/guides/re7/global.pdf)                                                 | Preview/control and affected/exception evidence precede/follow global change.                                                                                       | Consequence preview plus durable aggregate exception result.                        | No legacy global field mutation, scheduling, or detailed record report is copied. |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                  | Least privilege, deny-by-default, per-request checks, relationship/attribute context, safe lookup IDs/errors, logs, and authorization tests are recommended.        | Narrow capability and current server reproof across every seam.                     | Capability alone never replaces source/recipient predicates.                      |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                                                           | `USING` and `WITH CHECK` govern different row states; owners/BYPASSRLS bypass normally; policy joins can race.                                                      | Forced RLS, privileged parity, immutable scope, explicit concurrency design.        | RLS is defense in depth rather than product authorization.                        |
| [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)                                                                                 | Modal title/focus/containment/escape/restoration and semantic structured content are explicit requirements.                                                         | One accessible consequence-led review.                                              | Preparation/progress stay nonmodal and persistent; no custom ARIA.                |
| [WCAG status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)                                                                          | Progress/result must be programmatically determinable without forced focus.                                                                                         | Durable status plus polite announcements.                                           | Toast alone is insufficient.                                                      |
| [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                                                                            | Content must reflow without two-dimensional scrolling at narrow equivalent width.                                                                                   | Stacked scope/impact at 320px/400%.                                                 | No wide bulk table.                                                               |
| [RFC 9110 `9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)                                                                                      | Retry after ambiguous failure is safe only with idempotent semantics or known non-application.                                                                      | Receipt lookup and business-effect idempotency.                                     | HTTP method/request ID alone is insufficient.                                     |
| [Inngest — idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                                                                 | Application code should itself be idempotent.                                                                                                                       | Executor may assist, not own, dedupe.                                               | Product Postgres retains permanent semantic receipts.                             |

## Alternatives

### Option 1 — complete compatible Tenant cohort — selected

Best coherence with D35's one Tenant policy, least repeated work, and no need
to grant source detail merely to govern adoption. It requires the strongest
census, action-capability, aggregate-disclosure, seal, and privileged-path
contract.

### Option 2 — actor-visible work only

Simpler disclosure, but it makes source read permission an accidental policy
scope, leaves hidden work on older bases, encourages multiple repeated runs,
and makes “current policy” impossible to explain.

### Option 3 — Site/filter/row selection

Offers apparent control but creates omission and stale-selection risk, a second
task grid, mobile/accessibility burden, and de facto Site/row policy exceptions
D35 rejected.

### Strongest no-build alternative — future only

Prospective save plus the source lane already works without D37. This remains
the safe fallback and should win if representative Tenant evidence shows no
meaningful current-adoption need. It is not the selected permanent answer
because manual per-source repair leaves avoidable mixed policy and glue work.

## Detailed user journey

### Policy editor without application authority

```text
Returned Website work setting saved

The setting applies to new returned work.
Existing work has not changed.
```

No disabled action, hidden count, role name, alert, badge, unread item, or
request-access dead end appears.

### Authorized operator

```text
Update current work

Apply the saved setting to current Needs assignment work across the
organization after reviewing its effect.

[Review current-work impact]
```

### Complete preparation

```text
Checking current work across the organization…

Nothing will change until you review and confirm.
You can leave this page.
```

### Review

```text
Apply this setting to current Needs assignment work?

Scope
Across Hope Ministries — all current Needs assignment work covered by
this setting, including work whose source details you cannot open.

Current Website items                                  12

Personal coordinator assignments
Will be added                                           8
Will stay as they are — no new unread                   6
Will end — Coordinator responsibility changed          2

Already use this setting                                3
No selected coordinator currently qualifies             1
Could not be verified — will not change                  1

Selected coordinators receive tasks only for work they are currently
authorized to access and assign.

Correction owners, content, publishing, Giving, and the public website
will not change. No email, reminder, due date, target date, or SLA is
created.

[Not now]  [Apply setting to current work]
```

### Blocked completeness

```text
We couldn't check all current work

Nothing was started. The saved setting still applies to new work.

[Check again]
```

No **Continue with visible work** appears.

### Accepted and finished

```text
Current-work update started

12 items are being checked. You can leave this page.

[View progress]
```

```text
Current-work update finished

12 checked · 7 updated · 3 already current
· 1 changed before update · 1 could not be verified

8 assignments added · 6 preserved · 2 ended

[Open Needs assignment]  [Done]
```

If projection lags, say **Tasks Hub assignments are still syncing**. Never say
the source work or personal tasks were **Completed**.

## Domain and implementation research synthesis

- Policy head/cutover own prospective target and sequence.
- Source catalog owns exact producer/version compatibility.
- Website occurrence/head index owns current universe and census fence.
- Prepared evidence owns no-effect membership/impact proof.
- Atomic seal owns accepted cohort intent before any claim.
- D37 capability owns one action plus minimum complete aggregates; no detail.
- D35 resolver owns recipient qualification independently of application actor.
- D36 member command owns routing successor/source receipt.
- Tasks Hub and engagement own only recipient projections/read state.
- Inngest may page preparation/claims but owns no domain fact.
- Complete cohort acceptance and partial/resumable execution are compatible:
  every member is accounted for even when some receive no effect.
- Unknown membership blocks the operation; changed member state after seal
  becomes a typed no-effect result and never admits a replacement or widened
  recipient effect.

## Research outcomes

### Decision, validity, and alternatives

- **D37-RA1:** Accept Option 1 with the adversarial amendments.
- **D37-RA2:** The root problem is coherent current adoption of one Tenant
  policy, not a request for a generic bulk editor.
- **D37-RA3:** Future-only is the strongest simpler/no-build alternative.
- **D37-RA4:** D37 application remains optional and never blocks prospective
  policy save.
- **D37-RA5:** Actor-visible application is rejected because read scope must not
  become policy scope.
- **D37-RA6:** Manual Site/filter/row selection is rejected as omission-prone
  de facto policy exceptions.
- **D37-RA7:** One complete Tenant cohort matches D35's no-Site-override scope.
- **D37-RA8:** The source lane remains the complete fallback with no
  application-capability holder.
- **D37-RA9:** D37 creates no broad workflow/bulk-task product.
- **D37-RA10:** Representative ministry research must validate need and
  comprehension before Live activation.

### Cohort vocabulary and universe

- **D37-RA11:** Canonical design term is **Website recovery current-work
  cohort**.
- **D37-RA12:** User-facing scope is **all current Needs assignment work covered
  by this setting across the organization**.
- **D37-RA13:** Cohort scope is exact Tenant, environment, and D35 action
  purpose.
- **D37-RA14:** The authoritative occurrence/head index defines the current
  universe.
- **D37-RA15:** A complete code-owned producer/version catalog defines
  compatibility.
- **D37-RA16:** Known incompatible is an explicit versioned classification.
- **D37-RA17:** Unknown compatibility makes preparation indeterminate.
- **D37-RA18:** Missing partition/page/cursor/head makes preparation
  indeterminate.
- **D37-RA19:** Complete empty and indeterminate are distinct outcomes.
- **D37-RA20:** Visible rows, tasks, CMS, cache, search, analytics, and event
  payloads never define the universe.

### Cutover, current state, and recurrence

- **D37-RA21:** Trusted monotonic cutover/source sequence defines pre-cutover
  membership.
- **D37-RA22:** Wall-clock/display/browser/task timestamps never define
  membership.
- **D37-RA23:** A compatible pre-cutover occurrence current at prepared seal is
  included once.
- **D37-RA24:** An included occurrence already using the target remains
  `already_current`.
- **D37-RA25:** Post-cutover occurrences use the policy prospectively and are
  outside D37.
- **D37-RA26:** Recurrence creates a new occurrence identity.
- **D37-RA27:** Terminal old occurrences never revive.
- **D37-RA28:** Source end before seal excludes through authoritative current
  truth.
- **D37-RA29:** Source end after seal yields a typed no-effect result.
- **D37-RA30:** Archived/transferred/merged Site behavior follows source
  identity/heads rather than display status.

### Preparation, completeness, and sealing

- **D37-RA31:** Preparation is no-effect and may be route-addressable/
  asynchronous.
- **D37-RA32:** Prepared evidence is product-owned and normalized.
- **D37-RA33:** Prepared evidence contains identifiers/heads/count/digest, not
  protected bodies or copied rosters.
- **D37-RA34:** No confirmable review appears until membership completeness is
  proved.
- **D37-RA35:** Cohort uncertainty never falls back to a visible subset.
- **D37-RA36:** Confirmation re-proves complete evidence from trusted server
  state.
- **D37-RA37:** One atomic seal binds exact membership and reviewed meaning.
- **D37-RA38:** Staging/seal failure leaves no accepted or executable cohort.
- **D37-RA39:** No member claim can precede seal.
- **D37-RA40:** A prepared normalized manifest avoids one unbounded
  confirmation transaction while preserving exact seal/conservation.

### Capability and least privilege

- **D37-RA41:** D37 uses a distinct Tenant-wide Website recovery current-work
  application capability.
- **D37-RA42:** Policy editing does not imply application.
- **D37-RA43:** Tenant/Site admin labels do not imply application.
- **D37-RA44:** Coordinator membership, task access, source visibility, and
  source assignment do not imply application.
- **D37-RA45:** Application grants none of those permissions.
- **D37-RA46:** Every operation derives active human/Tenant/environment/purpose/
  time/capability generation server-side.
- **D37-RA47:** Capability remains current before every uncommitted member.
- **D37-RA48:** Revocation stops remaining effects.
- **D37-RA49:** Worker/service authority cannot substitute for product
  authorization.
- **D37-RA50:** D38 defines zero-by-default explicit-only grant/delegation
  governance and forbids inference/backfill; D39 defines typed direct and
  protected flat Access-group sources before activation.

### Aggregate disclosure and privacy

- **D37-RA51:** D37 capability intentionally includes minimum complete
  aggregate blast-radius disclosure.
- **D37-RA52:** The actor sees exact target policy mode and selected coordinator
  identities needed for consent.
- **D37-RA53:** Exact Website-item and personal-assignment effect counts remain
  distinct units.
- **D37-RA54:** Aggregate counts cover add, preserve/no-new-unread, end,
  already-current, proved-zero, and currently unverifiable.
- **D37-RA55:** No Site, locale, member, title, body, D30/D34 context, or
  qualification reason appears.
- **D37-RA56:** No visible/restricted split or partial-count mode exists.
- **D37-RA57:** No per-person workload/coverage or sibling engagement appears.
- **D37-RA58:** Search/export/cache/Realtime/analytics/AI/log/event/support
  surfaces receive no raw membership.
- **D37-RA59:** Current capability loss removes protected aggregate
  presentation without deleting minimized audit.
- **D37-RA60:** A Tenant that cannot trust someone with complete aggregates
  must not grant the mutating capability.

### Review and interaction UX

- **D37-RA61:** Authorized UI remains a calm **Update current work** secondary
  section.
- **D37-RA62:** Trigger remains **Review current-work impact**.
- **D37-RA63:** Title remains **Apply this setting to current Needs assignment
  work?**
- **D37-RA64:** Scope names the organization and complete covered current work.
- **D37-RA65:** Review explicitly says restricted source details are not shown
  and access is not granted.
- **D37-RA66:** Review explains selected coordinators still need exact source
  authorization.
- **D37-RA67:** One semantic description list separates item and assignment
  consequences.
- **D37-RA68:** Review is the only confirmation; no nested/type/remembered/
  destructive-default interaction.
- **D37-RA69:** No grid, selection, Site/locale filter, member row, chart, or
  directory appears.
- **D37-RA70:** Choosing **Not now** writes nothing and creates no alert,
  unread, reminder, or nag.

### UX states, accessibility, and low bandwidth

- **D37-RA71:** Policy editor without application authority sees only quiet
  prospective-save truth and no disabled control/count.
- **D37-RA72:** Complete empty/aligned says current work already uses setting
  and offers no confirmation.
- **D37-RA73:** Indeterminate says nothing started and offers **Check again**,
  never partial apply.
- **D37-RA74:** Widened/stale meaning writes nothing and offers fresh review.
- **D37-RA75:** Accepted/finished status is route-addressable after navigation
  or lost response.
- **D37-RA76:** **Current-work update finished** avoids false task/source
  completion.
- **D37-RA77:** Projection lag is distinct from routing/application finish.
- **D37-RA78:** Base Maia/Base UI/semantic tokens/Lucide are mandatory; no
  app-local primitive fork.
- **D37-RA79:** Focus, keyboard, screen reader, status, 44px, 320px/400%, forced
  colors, reduced motion, RTL/CJK/Unicode/plurals/mobile safe areas are proof
  cases.
- **D37-RA80:** Text-first aggregate payload and receipt refresh work without
  downloading backlog or keeping a connection open.

### Recipient routing and Tasks Hub

- **D37-RA81:** Tenant-wide application authority never qualifies a
  coordinator.
- **D37-RA82:** D35 re-proves each configured Party's active Tenant Assignment,
  exact Site/source visibility, and assignment action.
- **D37-RA83:** A complete qualified subset may receive personal projection.
- **D37-RA84:** Proved zero adopts the target basis with no personal task and
  preserves the lane.
- **D37-RA85:** Indeterminate recipient result releases nobody and changes no
  prior basis.
- **D37-RA86:** Materially widened recipient impact after review makes no
  effect.
- **D37-RA87:** Continuing recipients preserve assignment/engagement/read
  lineage.
- **D37-RA88:** Newly admitted recipients alone receive new assignment/unread.
- **D37-RA89:** Removed responsibility ends with the D36 policy-change reason,
  not source/task completion.
- **D37-RA90:** Generic Tasks Hub mutations cannot apply, alter, complete,
  delete, or define D37 work.

### Execution, concurrency, and idempotency

- **D37-RA91:** Complete cohort acceptance and per-occurrence execution are
  distinct.
- **D37-RA92:** Every member uses exact source/policy/routing/capability/
  recipient heads.
- **D37-RA93:** One member failure never rolls back/corrupts a sibling.
- **D37-RA94:** Same-meaning concurrent confirmation converges to one receipt.
- **D37-RA95:** Changed meaning under one semantic key conflicts.
- **D37-RA96:** Target policy supersession stops uncommitted members.
- **D37-RA97:** Source/current-state change prevents stale projection.
- **D37-RA98:** Retry is bounded to exact sealed member and unchanged heads.
- **D37-RA99:** Terminal members never reactivate or release delayed work.
- **D37-RA100:** Lost-response handling reads receipt before retry; no global
  rollback or misleading Undo exists.

### Database, RLS, integrity, and failure

- **D37-RA101:** Composite same-scope relationships reject every cross-Tenant/
  environment/purpose/policy/application/source/Party/task link.
- **D37-RA102:** Unique application/occurrence and effect keys enforce
  membership/effect idempotency.
- **D37-RA103:** Header/member/result count and terminal conservation are
  server-derived.
- **D37-RA104:** Trusted scope/actor/capability/target/catalog/census/seal/
  terminal fields are immutable.
- **D37-RA105:** Browser authoritative writes are revoked.
- **D37-RA106:** `USING` protects existing rows and `WITH CHECK` protects
  inserted/resulting scope.
- **D37-RA107:** `ENABLE` plus `FORCE RLS`, least grants, safe `search_path`,
  and policy-race tests are mandatory.
- **D37-RA108:** Owner/service/RPC/worker/support/repair/export/cache/Realtime/
  AI paths preserve the same product boundary.
- **D37-RA109:** Source/routing and identifier-only projection intent commit
  atomically per occurrence.
- **D37-RA110:** Census/seal/claim/source/outbox/projection/result failures have
  distinct durable states and safe recovery.

### Scale, dependencies, rollout, and traceability

- **D37-RA111:** Indexed set-based census/preparation and keyset member claims
  avoid N+1/offset/unbounded transactions.
- **D37-RA112:** Tenant-aware fairness prevents one large organization from
  starving others.
- **D37-RA113:** Approved production-shaped budgets—not vendor limits or vague
  “large”—govern activation.
- **D37-RA114:** Inngest may page product commands/claims with identifier-only
  events but owns no fact.
- **D37-RA115:** Inngest outage/removal changes no cohort/auth/routing/result/
  recovery meaning.
- **D37-RA116:** Migration infers/backfills no cohort, application, holder,
  recipient, task, or engagement.
- **D37-RA117:** Catalog/schema/RLS/denials/readers/shadow census precede
  preview, explicit grants, canary writers, and optional executor.
- **D37-RA118:** Kill switches stop new preparation/seal/claims while
  preserving policy, source lane, receipts, and forward repair.
- **D37-RA119:** D37 identifiers trace through glossary, ADR, OpenSpec, design,
  tasks, GitHub tickets, code, tests, canary, and release evidence.
- **D37-RA120:** Broad formatting/link/skill/OpenSpec/lint/type/test/build/diff
  gates remain deferred until Grill completion as directed.

## Evidence limits

- Official products establish current documented behaviors, not measurable
  success for Asym ministries.
- HubSpot's count/confirmation supports aggregate informed consent, but its
  manual selection and typed confirmation are not proof Core should copy them.
- GitHub organization scope is governance precedent, not evidence that broad
  administrator roles are safe in Core.
- Contentful/Blackbaud status and exception patterns do not establish Core's
  schema, retention, numeric limits, or authorization semantics.
- No representative Tenant cohort size, restricted-work distribution,
  frequency of policy changes, capability-holder profile, resolver failure
  rate, low-bandwidth duration, or support cost was available.
- The complete source catalog, authoritative census fence, prepared manifest,
  atomic seal, aggregate disclosure grant, exact UI, and D38 recommendation are
  Core product/design judgments requiring usability, privacy, load, race,
  migration, and canary proof.
- Exact query/transaction/payload/claim/retry budgets and business/audit
  retention follow later measured design and governance; D37 does not invent
  an industry constant.

## D38 recommendation

Choose **explicit Tenant governance grant with zero holders allowed**. A
separately authorized Tenant access administrator grants **Apply Website
recovery settings to current work** through the intended Phase 12
authorization system.
The grant is Tenant-scoped, audited, revocable, and grants no policy edit,
source detail, coordinator qualification, or source assignment. Prospective
save and the Needs assignment lane remain usable with zero holders.

Automatically granting every Tenant administrator over-authorizes unrelated
administrators. Automatically granting every policy editor directly collapses
D36/D37's separation of future configuration from Tenant-wide current-work
mutation.

## D38–D40 authorization resolution

D38 adopted that recommendation with required amendments. Phase 12 owns one
`explicit_only` atom, `permissions.manage_grants` authority is separate from
possession, human grants bind Active Tenant Assignment, EffectiveAccess owns
deduplicated provenance/holder truth, zero is quiet, and final post-change
EffectiveAccess loss fences later uncommitted D37 work without rewriting
committed results. The seed-backed Teams
demo is not the permanent access UI.

See [D38 adversarial review](./phase-24-d38-explicit-tenant-capability-grant-adversarial-review.md),
[D38 primary research](./phase-24-d38-explicit-tenant-capability-grant-primary-research.md),
[D39 adversarial review](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md),
and [D39 primary research](./phase-24-d39-direct-and-group-capability-assignment-primary-research.md).
D39 permits both typed direct and protected governed flat-group sources through
one central EffectiveAccess model.

D40 permits one deliberate separate direct grant while current group-derived
D38 exists, using a current-source-first secondary review, fresh reason,
independent unpreselected duration, exact group-source-set proof, immutable
overlap-creation provenance, and one epoch. Relevant state change conflicts;
later group loss leaves the direct source current; final EffectiveAccess loss
alone fences D37. See the [D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
and [D40 primary research](./phase-24-d40-deliberate-continuity-direct-grant-primary-research.md).

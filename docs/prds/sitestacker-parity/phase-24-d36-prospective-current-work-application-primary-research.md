# Phase 24 D36 — Prospective Save and Current-Work Application Primary Research

**Status:** Primary research supporting the accepted D36 founder direction;
not a runtime, migration, OpenSpec, or Live implementation claim  
**Recommended answer:** Option 1 with the D36 adversarial amendments  
**Research date:** 2026-08-29

## Research question

When a Tenant saves a different **Returned Website work** setting, should that
save also alter recovery-coordinator assignments for work already in Needs
assignment, and if current work changes, what interaction and product boundary
make the effect safe and understandable?

## Evidence labels

- **Repository fact:** directly verified in current Core source, OpenSpec,
  accepted ADRs, glossary, or Phase 24 records.
- **Verified external fact:** directly supported by linked current official
  documentation.
- **Reasonable inference:** a conclusion from verified facts; not a vendor
  guarantee.
- **Product judgment:** Core’s recommended choice after applying repository
  priorities and alternatives.
- **Assumption:** plausible but not established by current Tenant evidence.
- **Repository decision:** D38 fixes explicit-only zero-holder grant governance;
  D39 permits typed direct assignment and protected flat Access-group sources
  through one Phase 12 EffectiveAccess model.

## Executive finding

Choose **prospective save plus a separate explicit current-work application**.

The safe product has four distinct facts:

1. One immutable D35 Tenant policy head and cutover govern later occurrences.
2. Each already-current recovery occurrence retains an explicit applied-policy/
   routing basis.
3. One explicit, product-owned current-work application may move D37’s complete
   compatible pre-cutover Tenant cohort to the saved target policy through
   per-occurrence expected-head successor routing.
4. Tasks Hub and personal engagement remain subordinate projections; source
   Needs assignment and correction ownership never change.

The ordinary save must never hide current effects or force a second step.
Current application needs a distinct capability, fresh privacy-safe impact,
server recomputation, durable receipt, normalized members/results, differential
engagement, bounded replay, and persistent accessible status.

### Exact UX vocabulary

- Settings section: **Update current work**
- Trigger: **Review current-work impact**
- Review title: **Apply this setting to current Needs assignment work?**
- Named-target primary action: **Apply setting to current work**
- Lane-only primary action: **Use Needs assignment only for current work**
- Secondary action: **Not now**

Do not freeze **Apply coordinators to current work** as the canonical label: it
is false when the saved setting removes members or becomes lane-only.

## Current repository evidence

| Repository source                                                                                         | Verified fact                                                                                                                                                                   | D36 consequence                                                           |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Platform principles](../../../openspec/specs/platform-principles/spec.md)                                | Tenant/permission correctness and operational truth outrank convenience; clear system behavior should remove repeated glue work.                                                | Separate capability, fail closed, one safe backlog action.                |
| [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)                                | Core owns operational truth and one shared staff-work model.                                                                                                                    | Website owns application/routing; Tasks Hub is projection.                |
| [Workflow orchestration](../../../openspec/specs/workflow-orchestration/spec.md)                          | Inngest is identifier-only execution; product ledger/claims/auth remain authoritative.                                                                                          | Optional member chunking only.                                            |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                          | Engagement is recipient-specific and not business completion.                                                                                                                   | Preserve continuing read state; new recipients alone get unread.          |
| [ADR-0182](../../adr/0182-one-current-candidate-review-responsibility-lane.md)                            | D29 saves prospectively and changes current episodes only through explicit impact-previewed differential handoff.                                                               | Reuse the safe mechanism, not D29 route meaning/members.                  |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                        | Source work owns actionability/end; shared Tasks Hub receives one task identity plus recipient projections; generic task mutation rejects.                                      | D36 appends routing/projection intent, never task-owned reassignment.     |
| [D29 adversarial record](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md)       | Ordinary save, separate current impact, unchanged engagement, new unread, removed responsibility, stale preview, and CAS behavior are already accepted for a different purpose. | D36 should be coherent but keep D35’s Tenant-only task semantics.         |
| [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md) | Source lane is complete; D35 policy is Tenant-only lane-only or 1–3 named people; current application was left to D36.                                                          | No Site override, broadcast, source mutation, or shared engagement.       |
| [Mission Control task migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)   | Generic task has one mutable assignee, queue/status/dates/comments/events and broad privileged paths.                                                                           | Cannot represent D36 source/routing/engagement invariants.                |
| [Tasks demo](<../../../apps/admin/app/(app)/tasks/tasks-content.tsx>)                                     | Browser can edit/complete/delete the demo task collection.                                                                                                                      | Visual vocabulary only; every generic mutation must reject D36.           |
| [Support bulk actions](../../../apps/admin/features/support-hub/components/table/bulk-actions.tsx)        | Current Support UX loops browser mutations and reports via toast.                                                                                                               | Unsuitable for durable protected application; do not reuse mutation path. |
| [Base Maia config](../../../packages/ui/components.json)                                                  | Core pins Base UI, Maia, Zinc variables, and Lucide.                                                                                                                            | Compose one shared accessible impact/status surface.                      |

## Current official product and standards evidence

| Official source                                                                                                                                             | Verified current behavior                                                                                                 | Useful precedent                                          | Core boundary                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [HubSpot — create workflows](https://knowledge.hubspot.com/workflows/create-workflows)                                                                      | Publication asks whether to enroll existing matching records or only future records; existing count may be estimated.     | Existing versus future effects should be explicit.        | Core separates save/apply and never uses an approximate count to authorize action. |
| [HubSpot — manual enrollment](https://knowledge.hubspot.com/workflows/manually-enroll-objects-into-workflows)                                               | Workflow enrollment is a separately permissioned action.                                                                  | Policy editing need not imply backlog application.        | D36 uses a distinct Tenant operation capability.                                   |
| [Dynamics — apply routing rules](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/create-rules-automatically-route-cases)          | Existing cases require deliberate selection and **Apply Routing Rule**; activating a rule does not silently rewrite them. | Prospective rule plus explicit current adoption.          | Core source/routing generation remains authoritative, not a case field.            |
| [Jira — bulk edit](https://support.atlassian.com/jira-software-cloud/docs/edit-multiple-issues/)                                                            | Select, choose operation, review, confirm, acknowledge; relevant permission is required for affected work.                | Review/confirm and per-member authorization.              | No generic task field mutation; no imported 1,000-item limit.                      |
| [Salesforce — mass transfer](https://help.salesforce.com/s/articleView?id=platform.admin_transfer.htm&language=en_US)                                       | Explicit permissions and read sharing are required for mass transfer of records not owned by the actor.                   | Bulk responsibility change needs separate governance.     | D36 changes coordinator projection, not source owner.                              |
| [Salesforce Nonprofit Cloud — Action Plans](https://help.salesforce.com/s/articleView?id=ind.prog_case_mgmt_prog_mgmt_tasks_docs.htm&language=en_US&type=5) | A template is reusable intent; task instances arise when an Action Plan is assigned to an appropriate record.             | Separate configuration intent from record/task instances. | D35 policy is not a task or workflow template authority.                           |
| [Contentful — Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                                       | Assignment does not prove the assignee can read the entry.                                                                | Re-prove every recipient and source detail.               | Task possession never grants Core access.                                          |
| [Stripe — idempotent requests](https://docs.stripe.com/api/idempotent_requests)                                                                             | Same-key retry returns the original result and parameter mismatch errors; provider retains keys for a bounded time.       | Exact replay versus changed-meaning conflict.             | Core needs permanent business-effect receipts beyond provider windows.             |
| [RFC 9110 `9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)                                                                                | Automatic retry after uncertain failure is safe only for idempotent methods or when non-application is known.             | Lost-response receipt lookup before retry.                | Product semantic idempotency is mandatory.                                         |
| [W3C — confirmation G168](https://www.w3.org/WAI/WCAG21/Techniques/general/G168)                                                                            | Confirmation should identify action and consequence for difficult-to-reverse effects.                                     | Impact review as confirmation.                            | No redundant nested dialog/type phrase.                                            |
| [W3C — status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)                                                                   | Outcome/progress feedback must be programmatically determinable without focus change.                                     | Durable visible/live progress/result.                     | Toast may supplement only.                                                         |
| [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)                                                                     | Dialogs require title, focus containment, escape behavior, and restoration.                                               | Accessible review surface.                                | Use Core’s Base UI primitive, not custom ARIA.                                     |
| [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                                                                      | Content must reflow without two-dimensional scrolling at narrow equivalent width.                                         | Stacked impact summary at 320px/400%.                     | Do not use a wide bulk-results table.                                              |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                            | Least privilege, default deny, validate every request, prefer relationship/attribute checks.                              | Every save/preview/apply/member/result seam reauthorizes. | Route/policy possession is never sufficient.                                       |
| [Inngest — idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                                                           | Application code must be idempotent; event ID dedupe is 24 hours.                                                         | Provider execution may assist retries.                    | Asym Postgres owns durable application/member effects.                             |

## Alternatives

### Option 1 — prospective save plus explicit current application — selected

Best combination of low-surprise settings, one coherent backlog-repair path,
current authorization, durable feedback, and source safety.

### Option 2 — automatically apply every save

Fewer clicks, but one ordinary roster change silently creates/ends private work,
couples save to potentially slow fan-out, and makes lost-response/rollback
ambiguous. Reject.

### Option 3 — future only

Strongest simpler alternative. It eliminates the operation model, but Tenants
configuring coordinators for an existing backlog must repeatedly use the source
lane and current work can remain on old policy bases indefinitely.

## Detailed user journey

### Save

```text
Returned Website work setting saved

Ana and Joel may receive tasks for new eligible returned work.
Existing work has not changed.

[Review current-work impact]  [Done]
```

### Review

```text
Apply this setting to current Needs assignment work?

Current Website items
4 will be checked

Personal coordinator assignments
3 will be added
2 will stay as they are — no new unread
1 will end — Coordinator responsibility changed

Core will recheck source state and authorization before every change.
Correction owners, Website content, publishing, and Giving will not change.
No emails, reminders, due dates, or target dates will be created.

[Not now]  [Apply setting to current work]
```

### Accepted and resumable

```text
Updating current work

The request was accepted. You can leave this page.
2 of 4 permitted items have been checked.
```

### Complete with safe changes

```text
Current work updated

3 applied
1 already used this setting
1 changed before it could be updated
1 could not be verified

Needs assignment remains available for every current source item.

[Review remaining current work]  [Return to Website reviews]
```

### Lane-only target

```text
Use Needs assignment only for current work?

6 personal coordinator assignments will end.
The shared Needs assignment lane and correction work will remain.

[Not now]  [Use Needs assignment only for current work]
```

## Domain and implementation research synthesis

- Policy save owns future intent and cutover only.
- Source occurrence owns Needs assignment and current source heads.
- Applied routing basis explains why current work may differ from newest policy.
- Current-work application owns deliberate bulk intent and result only.
- Differential routing generation owns added/continuing/removed coordinator
  applicability for one occurrence.
- Tasks Hub owns one shared task projection and recipient assignments; personal
  engagement owns read/unread.
- Product dispatch/claims own executor handoff; Inngest owns no fact.
- One user application is cross-occurrence resumable work, while each
  occurrence remains atomic and all-before-any for its admitted recipient set.
- There is no cross-occurrence rollback. New policy plus new application is the
  truthful correction path.
- D37 defines the cohort as complete compatible Tenant scope under a distinct
  action/aggregate-disclosure capability; D38 defines zero-by-default
  explicit-only grants; D39 assignment-source and D40 continuity-source
  governance plus complete proof remain activation blockers.

## Research outcomes

### Decision and scope

- **D36-RA1:** Accept Option 1 with the adversarial amendments.
- **D36-RA2:** Prospective policy save and current-work application are
  separate product decisions, commands, receipts, and UX steps.
- **D36-RA3:** Future-only remains the strongest simpler alternative.
- **D36-RA4:** Automatic retroactivity is rejected as a hidden high-blast-radius
  side effect of settings.
- **D36-RA5:** Current application is optional and never blocks a valid save.
- **D36-RA6:** D36 changes coordinator routing/projections only, not correction
  assignment or source work.
- **D36-RA7:** D36 adds no Site override, filtered policy, or row-level policy.
- **D36-RA8:** D36 adds no generic workflow/bulk-task product.
- **D36-RA9:** D36 adds no external notification channel, time policy, claim,
  or staff performance meaning.
- **D36-RA10:** D37 resolves exact cohort/action/disclosure authority; D38
  resolves zero-by-default explicit-only grant governance; D39 assignment and
  D40 continuity sources must resolve before activation.

### Canonical language and ownership

- **D36-RA11:** **Policy cutover** is the trusted boundary between old-current
  and prospectively governed recovery occurrences.
- **D36-RA12:** **Applied policy basis** is the immutable routing basis used by
  one current recovery occurrence.
- **D36-RA13:** **Current-work policy application** is the explicit product
  operation over a D37-defined cohort.
- **D36-RA14:** **Differential recovery-routing generation** is the per-
  occurrence successor preserving/adding/ending coordinator applicability.
- **D36-RA15:** Policy owns future responsibility intent only.
- **D36-RA16:** Website source owns Needs assignment and correction state.
- **D36-RA17:** Application owns bulk intent, membership, progress, and result.
- **D36-RA18:** Routing owns current coordinator applicability per occurrence.
- **D36-RA19:** Tasks Hub owns subordinate task/recipient projections.
- **D36-RA20:** Engagement owns personal presentation only.

### Save and cutover

- **D36-RA21:** Save writes one immutable revision/head/cutover/receipt.
- **D36-RA22:** Save affects only occurrences entering Needs assignment after
  the trusted cutover.
- **D36-RA23:** Current work remains on its applied basis until explicit apply.
- **D36-RA24:** Recurrence after cutover is a new occurrence using current
  prospective policy.
- **D36-RA25:** Client timestamps cannot classify cutover.
- **D36-RA26:** Save changes no tasks, assignments, engagement, source, or
  current application rows.
- **D36-RA27:** Save result explicitly says future changed/current unchanged.
- **D36-RA28:** Preview/apply failure cannot undo or obscure save success.
- **D36-RA29:** No current-work review auto-opens after save.
- **D36-RA30:** **Not now** creates no alert, unread, reminder, due date, or nag.

### Capability and preview

- **D36-RA31:** Policy-edit and current-work-apply capabilities are separate.
- **D36-RA32:** Offer/relevance, preview, apply, result, and repair are distinct
  authorization operations.
- **D36-RA33:** Preview is server-computed, current, target-head bound, and
  non-authoritative.
- **D36-RA34:** Client-supplied IDs, recipients, counts, and actor facts are not
  trusted.
- **D36-RA35:** Impact is recomputed at confirmation.
- **D36-RA36:** Material impact widening blocks all acceptance.
- **D36-RA37:** Preview separates Website-item from personal-assignment units.
- **D36-RA38:** Hidden counts/details/qualification cannot be inferred.
- **D36-RA39:** Numeric action copy requires exact complete disclosable proof.
- **D36-RA40:** Approximate counts never authorize or label the operation.

### UX copy and interaction

- **D36-RA41:** Settings section is **Update current work**.
- **D36-RA42:** Trigger is **Review current-work impact**.
- **D36-RA43:** Review title is **Apply this setting to current Needs assignment
  work?**
- **D36-RA44:** Named-target primary action is **Apply setting to current
  work**.
- **D36-RA45:** Lane-only primary action is **Use Needs assignment only for
  current work**.
- **D36-RA46:** Secondary action is **Not now**.
- **D36-RA47:** “Apply coordinators” is rejected as the universal label because
  it is false for removals/lane-only.
- **D36-RA48:** The review surface is the confirmation; no nested dialog or
  typed phrase.
- **D36-RA49:** Progress/result are durable in-page states; toast is
  supplementary.
- **D36-RA50:** Lost response enters receipt reconciliation, not blind retry.

### Application model and conservation

- **D36-RA51:** Acceptance writes one immutable application header.
- **D36-RA52:** Membership is normalized and immutable, not JSON/client state.
- **D36-RA53:** Every member references exact source occurrence and expected
  routing/source/policy/auth heads.
- **D36-RA54:** One user operation may be chunked; no giant transaction.
- **D36-RA55:** Every member commits atomically and independently.
- **D36-RA56:** Every accepted member ends in one typed terminal result.
- **D36-RA57:** Header totals conserve accepted member cardinality.
- **D36-RA58:** Progress/claim/retry state is never counted as applied.
- **D36-RA59:** One member failure cannot corrupt another or the lane.
- **D36-RA60:** Preview rows themselves need not become mutation authority.

### Differential recipient effects

- **D36-RA61:** D35 complete/zero/indeterminate resolution applies per member.
- **D36-RA62:** Continuing Party/purpose/action/surface preserves one logical
  assignment and engagement lineage.
- **D36-RA63:** Continuing recipients receive no fresh unread or new history.
- **D36-RA64:** Newly admitted qualified recipients receive one fresh
  assignment/unread.
- **D36-RA65:** Newly selected but unqualified people receive nothing and no
  hidden inference.
- **D36-RA66:** Removed recipients end under
  `coordinator_policy_changed`.
- **D36-RA67:** Removed recipients are not completed, read, dismissed, source-
  resolved, or correction-reassigned.
- **D36-RA68:** Removed then re-added creates a fresh generation and never
  revives engagement.
- **D36-RA69:** Lane-only ends personal applicability while the source lane
  remains.
- **D36-RA70:** Unordered roster reordering is a no-op.

### Database, RLS, authorization, and privacy

- **D36-RA71:** Same-scope composite relationships cover every authoritative
  policy/application/source/routing/Party/task link.
- **D36-RA72:** One semantic key and member/effect uniqueness enforce durable
  idempotency.
- **D36-RA73:** State/result checks make invalid transitions impossible.
- **D36-RA74:** Browser business writes to authoritative D36 rows are revoked.
- **D36-RA75:** `USING` protects existing rows and `WITH CHECK` protects
  resulting scope.
- **D36-RA76:** Actor/Tenant/environment/time/result/end reason are server-
  derived.
- **D36-RA77:** Owner/service/RPC/worker/support/repair/import/export paths
  preserve the same boundary.
- **D36-RA78:** Preview/result query ceilings remove protected presentation on
  access loss.
- **D36-RA79:** D30/D34/source bodies/rosters/hidden impact never enter
  executor/log/channel/search/AI/cache/export payloads.
- **D36-RA80:** Counts and errors are non-enumerating unless exact disclosure is
  independently authorized.

### Concurrency and idempotency

- **D36-RA81:** Same exact save/application replay returns its durable receipt.
- **D36-RA82:** Changed meaning under the same key hard-conflicts.
- **D36-RA83:** Two manager saves have one policy-head winner.
- **D36-RA84:** Two matching applications have at most one routing effect per
  occurrence/target.
- **D36-RA85:** A newer policy stops uncommitted older-target members.
- **D36-RA86:** Old-target work cannot commit after supersession wins the fence.
- **D36-RA87:** Already committed old-target work remains immutable history.
- **D36-RA88:** Source end/assignment before member commit releases no task.
- **D36-RA89:** Post-cutover prospective work is already current and never
  duplicated.
- **D36-RA90:** Recurrence creates a successor identity and no old revival.

### Failure, retry, repair, and dependencies

- **D36-RA91:** Application acceptance and member results are reloadable after
  connection loss/navigation.
- **D36-RA92:** Source/routing commit and identifier-only outbox intent are
  atomic per occurrence.
- **D36-RA93:** Projection delay is reported separately from routing success.
- **D36-RA94:** Retry uses product claims and exact current heads.
- **D36-RA95:** Retry is bounded; terminal members cannot release delayed work.
- **D36-RA96:** Correction is a successor policy/application, never deletion or
  reverse engagement.
- **D36-RA97:** Inngest receives identifiers only and owns no product fact.
- **D36-RA98:** Sync and Inngest execution invoke one product command.
- **D36-RA99:** Provider outage leaves lane, ledger, manual/product recovery,
  and reconciliation valid.
- **D36-RA100:** Direct SQL/provider-dashboard repair is not an accepted
  operational path.

### Accessibility, performance, rollout, and evidence

- **D36-RA101:** Core uses existing Base Maia/Base UI and semantic tokens.
- **D36-RA102:** Review/progress use semantic list/description structure, not a
  wide grid.
- **D36-RA103:** Title, initial focus, tab order, escape/cancel, restoration,
  busy state, and status announcements are explicit.
- **D36-RA104:** 44px targets, 320px/400%, forced colors, reduced motion,
  keyboard/screen reader, RTL/CJK/long names, and pluralization are proof cases.
- **D36-RA105:** Low-bandwidth flow stays text-first and does not download
  protected backlog/content.
- **D36-RA106:** Preview/member claims use indexed set-based keyset paging and
  production-shaped budgets.
- **D36-RA107:** No external product’s numeric bulk limit is imported without
  Core evidence.
- **D36-RA108:** Migration infers/backfills no application/cohort/recipient/
  engagement/result.
- **D36-RA109:** Schema/RLS/denials/readers precede prospective writer, shadow
  preview, canary application, and optional executor.
- **D36-RA110:** Rollback stops new acceptance/claims and rolls projections
  forward; it never deletes committed truth.

### Traceability, humane use, and D37

- **D36-RA111:** D36 identifiers trace through glossary, ADR, OpenSpec, design,
  tickets, code, tests, canary, and release.
- **D36-RA112:** Tests prove user/source outcomes and forbidden effects, not
  just row creation.
- **D36-RA113:** Privileged-path, isolation, race, lost-response, projection,
  migration, accessibility, and scale evidence are release blockers.
- **D36-RA114:** Application metrics never rank or evaluate individual staff.
- **D36-RA115:** Repeated current applications are a product-health signal, not
  proof that more automation is needed.
- **D36-RA116:** No D36 Site/filter/locale subset becomes a policy or saved rule.
- **D36-RA117:** Website policy/cohort/members never flow automatically into
  Mobilize or another source.
- **D36-RA118:** D36 remains Reserved until D37–D39 and complete
  implementation evidence.
- **D36-RA119:** Broad formatting/link/skill/OpenSpec/lint/type/test/build/diff
  gates remain deferred until Grill completion as directed.
- **D36-RA120:** Recommend D37 Option 1: complete compatible Tenant cohort under
  a separate Tenant-wide application capability with permission-safe
  presentation and fail-closed proof.

## Evidence limits

- Official products prove documented interaction/permission behavior, not that
  one pattern improves outcomes for current Asym ministries.
- HubSpot estimates are not sufficient evidence for a Core consequence count.
- Jira’s 1,000-item limit and Salesforce object semantics are product-specific
  and are not imported.
- No representative Tenant backlog size, policy-change frequency, coordinator
  adoption, hidden-work distribution, application duration, support volume, or
  low-bandwidth telemetry was available.
- The operation ledger, typed outcome vocabulary, current UX placement, and
  complete-Tenant D37 recommendation are Core product judgments requiring
  usability, privacy, load, failure, and canary proof.
- Exact query budgets, page/claim size, bounded retry schedule, audit retention,
  and legal/privacy disposition remain later design/governance decisions.

## D37 recommendation

Choose **complete compatible current Tenant scope behind a separate Tenant-wide
application capability**. It keeps one Tenant policy coherent and prevents
hidden islands on old applied bases. The review always says it shows only
authorized information; policy editors without the stronger capability may
save prospectively but cannot apply current work. Visible-only or manual
selection would create mixed policy, omission, repeated work, and a second
bulk-management surface.

## Subsequent D37 resolution

The founder accepted the recommendation with required amendments. D37 now
defines a closed producer/version compatibility catalog, authoritative
pre-cutover current occurrence census, prepared no-effect evidence, atomic
normalized cohort seal, separate Tenant-wide action capability, exact complete
aggregate item/assignment disclosure, no source-detail grant, no
visible/hidden partial mode, no unreviewed widening, and D36 per-occurrence
execution. See the [D37 adversarial review](./phase-24-d37-complete-tenant-current-work-cohort-adversarial-review.md)
and [D37 primary research](./phase-24-d37-complete-tenant-current-work-cohort-primary-research.md).

D38 now defines explicit-only, zero-by-default, active-assignment-bound grant
governance. D39 permits typed direct and protected flat Access-group sources;
D40 permits only a current-source-first deliberate separate direct grant with
exact overlap proof. Activation still requires implementation and proof.

See [D38 adversarial review](./phase-24-d38-explicit-tenant-capability-grant-adversarial-review.md),
[D38 primary research](./phase-24-d38-explicit-tenant-capability-grant-primary-research.md),
[D39 adversarial review](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md),
[D39 primary research](./phase-24-d39-direct-and-group-capability-assignment-primary-research.md),
[D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md),
and [D40 primary research](./phase-24-d40-deliberate-continuity-direct-grant-primary-research.md).

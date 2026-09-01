# Phase 24 D48 — New-Request-Only Cadence Application

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — if a later D47 cadence feature earns
activation, its first non-Off Tenant policy applies only to D43 request episodes
whose authoritative source-creation commit linearizes after that policy's
trusted effective boundary. Every request episode already pending at the
boundary remains excluded, with no catch-up.  
**Scope:** First activation cohort only: behavioral linearization, source
ownership, immutable cohort evidence, retries, concurrency, UX, authorization,
RLS, privacy, scalability, rollout, rollback, repair, and proof. D48 does not
decide later policy-edit effects on already-admitted work, recipient binding
(D49), clock/calendar/lateness (D50), channel/content, or runtime technology.  
**Method:** `/grill-with-docs`, D36/D37/D43–D48 repository review, governing
ADRs/Phase 12/17/OpenSpec/current-code audit, refreshed official IAM/CRM/
database/HTTP/accessibility evidence, and the required 22-category adversarial
pass.  
**Verification note:** Broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, production-build, and `git diff --check`
verification remains deferred until the Grill ends. Only focused structural,
identifier, and semantic checks apply here.

> **Post-D49 historical note (2026-08-29):** Earlier D49 options and statements
> that recipient binding remains open preserve the D48-time record. D49 has
> since selected one source-atomic exact current D44 responsibility cohort, with
> each sealed member bound to recipient generation plus Active Tenant
> Assignment, terminal proved zero, unreleased indeterminate retry on the same
> occurrence, and monotonic narrowing only. No task, key, channel, schema, or
> runtime artifact was added. D50 has since selected one immutable request-
> anchored elapsed eligibility instant from exact seconds and a trusted source-
> created instant captured after this D48 serialization; it is no due date or
> delivery promise. D51 has since added source-fenced Off and prospective re-
> enable; D52 has fixed finite half-open source usefulness and no catch-up; D53
> now keeps every candidate absent until a D47 evidence-qualified proposal later
> passes a separate full activation. D54 local presentation is next. D48–D53
> add no reminder/runtime artifact.

## Final disposition

**Accept with required amendments.**

New-request-only activation is the safest and clearest first policy. It avoids
turning a low-noise source setting into a hidden backlog operation, avoids
immediate reminder storms for old requests, and preserves the existing complete
Access requests/task/in-product recovery paths for pending work. This pattern is
consistent with modern products that distinguish future instances from current
ones rather than silently mutating both: Microsoft Entra separates a current
review from its future series, while HubSpot explicitly asks whether to enroll
existing records or only records meeting triggers after activation and states
that generally only future matches enroll unless existing enrollment is chosen.

The unqualified phrase “requests created after enablement” is nevertheless
unsafe. A timestamp comparison, browser time, projection insertion, cron scan,
or asynchronous policy lookup can classify a request differently under races,
retries, restores, and mixed deployments. D48 is accepted only with these
amendments:

- D48 remains documentation-only. It adds no policy, cohort flag, request field,
  relation, enum, key, event, job, migration, feature flag, or UI placeholder;
- the first successfully committed non-Off policy revision establishes one
  trusted **cadence application boundary** in Phase 12; this is a logical
  ordering fence, not a wall-clock timestamp comparison or schema prescription;
- an exact D43 request episode is admitted only when its authoritative source-
  creation transaction linearizes after that boundary and atomically observes/
  records the applicable policy head and cohort outcome, or conflicts and
  retries before committing;
- a request transaction cannot read the old/Off head, commit logically after
  the new boundary, and remain silently excluded. Policy publication and request
  creation must produce one serializable business order, using any proven
  implementation that satisfies the behavior rather than a frozen lock/table;
- every request episode committed before the boundary remains excluded for that
  episode, regardless of age, later projection, route, notification, task,
  delivery, restore, replay, policy re-save, or worker scan. There is no D48
  current-work application, backfill, catch-up, missed-reminder state, or
  historical enrollment;
- once a D43 request has committed, idempotent duplicate/lost-response replay
  returns the original request, receipt, and original cohort disposition. It never re-evaluates the
  now-current policy or turns a pre-boundary pending request into a new episode;
- a later legitimate D43 successor after a terminal request is a new request
  episode and is evaluated at its own source-creation commit; this is not
  reopening/backfilling the predecessor;
- source `created_at`, policy `effective_at`/`updated_at`, database commit
  timestamp, UUID order, browser submission time, task/item creation time,
  provider/executor time, and query-time age never classify cohort membership;
- future logical cohort evidence is server-derived, immutable, Tenant-scoped,
  and auditable but its storage is deliberately unspecified. It may live in the
  source aggregate/event or a same-transaction adjacent record; no duplicate
  D48 source or generic cohort engine is permitted;
- policy revision is immutable input/audit evidence, not reminder-occurrence
  uniqueness. D48 preserves D47's zero-or-one source occurrence per exact D43
  episode/stable courtesy-reminder class;
- D48 fixes only the first-activation lower boundary. A later decision must
  define Off/On/cadence edits for already-admitted post-boundary work; D49 must
  define recipient binding/route churn; D50 must define time/calendar/lateness;
- any future first-On UX says **Applies only to access review requests created
  after you save. Requests already waiting aren't included. This doesn't set a
  due date or change access.** It shows no backlog action, count requiring a current
  census, disabled apply control, or promise that a channel will deliver; and
- future policy management reuses D44's intended Phase 12 authority boundary:
  current same-Tenant Tenant-wide `permissions.manage_grants` plus registered exact policy-management purpose,
  live scope/ceiling/floor, Active Tenant Assignment, authorization epoch, and
  expected head. D48 creates no capability, and current broad runtime role/
  permission checks are not proof that this future purpose boundary exists.

These amendments turn “new requests only” into an exact source-commit invariant
without freezing a database lock, schema shape, clock, or worker.

## Exact corrected decision

> D48 applies only if a later D47 feature independently satisfies its research,
> temporal-admission, authorization, privacy, UX, and release gates. D48 itself
> creates no cadence capability or runtime artifact. It records that the first
> non-Off D47 Tenant cadence may affect only a genuinely new D43 request episode
> whose authoritative Phase 12 source-creation commit linearizes after the
> first non-Off policy's trusted effective boundary.
>
> Every exact D43 request episode already committed and `pending_review` before
> that boundary remains outside the cadence cohort for its entire episode. Its
> age, persistence after the boundary, coordinator changes, task/item state,
> D45 email outcome, source projection delay, request view, retry, restore,
> import, replay, reconciliation, or later worker run cannot enroll it. D48
> creates no current-work action, automatic age inclusion, historical scan,
> backfill, catch-up, missed-reminder status, manual exception, or per-request
> opt-in. Existing work remains fully recoverable through the complete
> permission-filtered **People & access → Access requests** lane and, for each
> current D44 personal recipient, its source-backed task and required in-product
> attention; D45 remains optional initial email only.
>
> The boundary is a trusted Phase 12 business-order fence produced by the
> successful authoritative first non-Off policy publication. “After” means the
> serialization/linearization order of committed source operations, not a
> comparison of wall-clock values. D48 does not require a specific lock,
> isolation level, table, column, sequence implementation, advisory lock, or
> transaction API. Any implementation is valid only if every concurrent policy-
> publication/request-creation pair has one explainable outcome equivalent to
> executing one complete operation before the other.
>
> The first absent-row Off→On publication and every D43 creation share one
> stable Tenant/environment/cadence-policy-kind serialization namespace that
> exists independently of a persisted policy row or individual grant/request.
> Locking only a missing row, one grant, or one request cannot satisfy D48
> because those operations would not contend on the same business boundary.
> This is a behavioral namespace requirement, not a prescribed lock/key/table.
>
> The authoritative D43 creation transaction reads and proves the applicable
> current policy head through the shared Phase 12 serialization fence, derives
> the cohort disposition, and commits the new request episode, immutable source
> submission/receipt, applicable policy input/head evidence, cohort disposition,
> and identifier-only downstream handoff together—or commits none for a
> transient serialization conflict. If policy
> publication races and the transaction cannot prove whether it is before or
> after the boundary, it conflicts/aborts and safely retries the complete source
> command within a bounded retry policy.
>
> Cadence is optional and cannot strand a valid D43 request. If, after
> concurrency is resolved, cadence proof is persistently missing, unsupported,
> corrupt, or otherwise not completely provable, the authoritative transaction
> still commits the lawful D43 request/receipt/source handoff with a typed safe
> **cadence not admitted** disposition and durable body-free operational
> evidence. It creates no cadence temporal/reminder handoff and never ages into
> admission later. It never commits an ambiguous, stale, caller-supplied, or
> asynchronously patched admitted result.
>
> A request that logically commits before the policy publication sees the old/
> Off posture and remains excluded. A policy publication that logically commits
> first is observable to the later request creation, which records the first
> non-Off applicable head and admitted cohort result. A request transaction that
> began earlier but can commit only after the new policy must either observe the
> new head through the chosen serialization method or fail/retry; transaction
> start time and form-open/submission time do not decide.
>
> No later query classifies requests with `request.created_at >= policy.effective_at`,
> UUID order, commit timestamps, a cached setting, a projection's insertion
> time, task/item age, browser/server time, or an executor/provider timestamp.
> The authoritative cohort fact comes only from the creation transaction's
> recorded policy observation/disposition. List, count, reminder eligibility,
> audit, repair, migration, and replay consume that fact and never reconstruct
> it from temporal heuristics.
>
> D43's existing semantic idempotency remains authoritative. The cadence policy
> head/disposition is server-observed source context, never caller input or part
> of the caller's idempotency key. Before any request commits, a bounded retry
> may legitimately observe the policy head that wins the new serialization
> order. Once one request episode commits, a duplicate click, concurrent tab,
> lost-response retry, API/outbox replay, or repeated pending submission returns
> that same request/receipt/original disposition—even if policy changed between
> attempts. Changed caller-controlled explanation/source locator/expected source
> head under the same command identity follows D43 conflict/current-result rules;
> no caller can force cohort re-evaluation by supplying a policy head.
>
> A terminal D43 request is immutable. If the exact source remains current and a
> later genuine concern creates the D43-authorized linked successor request,
> that successor is a new episode and is evaluated at its own creation
> transaction against the then-applicable policy rules. It receives no identity,
> cohort, reminder, engagement, or history from its predecessor and cannot cause
> another reminder for the predecessor.
>
> Restoration, migration, disaster recovery, replication replay, or import of
> an already-existing historical episode preserves its source identity,
> original cohort disposition, and receipt. A local row inserted or replayed
> after the boundary is not a new source creation. D48 permits no generic import
> command that invents a D43 episode, policy head, boundary, or admission fact.
>
> D48 fixes only first-activation cohort admission. It does not decide what a
> later Off, re-enable, shorter/longer cadence, policy correction, or rollback
> does to already-admitted post-boundary request episodes; that requires its own
> decision and cannot use D48 by analogy. D49 separately decides when/how the
> one future source occurrence binds D44 recipients and how route/eligibility
> churn behaves. D50 separately decides clock origin, duration/calendar,
> timezone, DST, lateness, and outage/catch-up. No recipient or time artifact may
> be implemented from D48.
>
> Future policy management uses D44's intended Phase 12 authority boundary: a
> current same-Tenant actor with Tenant-wide `permissions.manage_grants`, registered
> exact policy-management purpose, live scope/ceiling/floor, Active Tenant
> Assignment, authorization epoch, and expected policy head. D48 adds no
> capability. Current broad runtime role/permission checks are not proof that
> this future registered-purpose boundary is implemented. Coordinator
> membership, D43 decision authority alone, task/item/
> email receipt, D45/System Messages authority, Owner/Admin label, support,
> service role, or original-grantor status grants nothing. The D43 requester
> supplies no policy, boundary, cohort, Tenant, actor, or reminder input; the
> server derives all of it.
>
> Current UX remains unchanged. If the complete future feature is later
> activated, the first-On Access requests source-policy editor states before
> save: **Applies only to access review requests created after you save. Requests
> already waiting aren't included. This doesn't set a due date or change
> access.** Core does not enumerate, count, or reveal the
> pending census. Save produces a durable inline policy receipt and says
> **Saved for future access review requests. Requests already waiting have not
> changed.** It offers no **Apply to existing**, checkbox, backlog count, date,
> countdown, Due/Overdue treatment, channel selector, test-send, or disabled
> placeholder. A stale/unauthorized/indeterminate save creates no boundary.
>
> Phase 12 owns the future policy head, boundary, request episode, cohort
> disposition, and source occurrence. D44 owns recipient responsibility;
> ADR-0183 owns Tasks Hub work; ADR-0027/Phase 17 own presentation/engagement;
> Phase 6 owns channel intents/outcomes; providers own provider evidence; and
> Inngest may later execute only identifier-only product work. None can enroll an
> excluded episode, rewrite the creation disposition, or become a second source.

## Evidence classification and modern-practice resolution

### Verified repository facts

- D43 source creation already requires one semantic pending request per exact
  Tenant/subject/direct-source tuple and returns the same durable request/
  receipt on duplicate or response-loss retry. D48 can preserve, not replace,
  that identity.
- D44's governing future policy-publication contract uses an immutable revision,
  expected head, trusted cutover, durable receipt, and current same-Tenant Tenant-wide
  `permissions.manage_grants` plus a registered policy purpose. A request
  created during a D44 save must resolve exactly old or new, never both.
- D45 deliberately makes Tenant/personal email widening future-only and never
  adds an omitted member to released historical occurrences. This is a useful
  low-noise precedent, not authority for D48 storage or later policy-edit rules.
- D36/D37 provide the strongest alternative: a prospective Website setting plus
  a separate deliberate complete current-work application. D48 intentionally
  chooses the simpler new-only result and adds no Access-request current-work
  operation.
- D46 prohibits all automatic reminders and dormant artifacts until source time
  is separately ratified. D47 admits only a possible default-Off finite cadence,
  at most one source occurrence per request episode, and leaves D48–D50 open.
- ADR-0026/0027/0183 and Phase 17 separate source occurrence, work, presentation,
  delivery, provider evidence, and execution. None may reconstruct cohort
  membership from its own timestamps or engagement.
- Workflow OpenSpec makes product records/authorization/dispatch claims
  authoritative and Inngest replaceable. Current Core has no D48 runtime.

### Verified current external evidence

- Microsoft Entra recurring access reviews separate **Current** and **Series**
  settings; changing Series affects future recurrences. Entra also snapshots
  access/reviewers at each review instance start and reflects later changes in
  a subsequent cycle. This supports explicit instance boundaries and not
  silently rewriting current work.
  [Microsoft Entra access reviews](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
- HubSpot's August 2026 workflow publication explicitly asks whether to enroll
  records that currently meet criteria or only records that meet triggers after
  turning the workflow on; it states that generally only later matches enroll
  unless existing enrollment is selected. HubSpot separates manual enrollment
  behind an additional permission/action. This strongly supports making
  future-only versus current work explicit rather than scanning implicitly.
  [HubSpot create workflows](https://knowledge.hubspot.com/workflows/create-workflows),
  [manual enrollment](https://knowledge.hubspot.com/workflows/manually-enroll-objects-into-workflows)
- HubSpot warns that its displayed existing-record count may be an estimate.
  Because D48 never applies the first policy to already-waiting requests, Core
  needs no numeric count, private census, or bulk confirmation UI.
  [HubSpot create workflows](https://knowledge.hubspot.com/workflows/create-workflows)
- PostgreSQL Serializable behavior provides one serial order or aborts with a
  serialization failure that the application must retry; row locking is another
  tool but adds blocking/deadlock concerns. This supports specifying the
  business outcome while deliberately not freezing a lock/isolation strategy.
  [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html),
  [explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- A transactional outbox avoids unreliable dual writes by committing the
  business record and durable handoff together, then using at-least-once relay
  with idempotent consumers. This supports atomic request/cohort/handoff truth
  and a replaceable later executor.
  [Azure transactional outbox pattern](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos)
- RFC 9110 permits safe automatic retry only where the operation is idempotent
  or the client knows the original did not apply. D48 therefore uses durable
  request/receipt lookup and preserves original cohort disposition rather than
  re-evaluating on retry.
  [RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)
- PostgreSQL RLS distinguishes existing-row `USING` and proposed-row `WITH
CHECK`, while owners/`BYPASSRLS` may bypass unless constrained. OWASP requires
  least privilege, deny by default, and authorization on every request. This
  supports same-Tenant creation/policy evidence and privileged-path parity.
  [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html),
  [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- WCAG 2.2 requires programmatic control semantics, focus, status messages, and
  reflow. A future first-On editor needs persistent plain-language impact and a
  durable result rather than color, icon, hover, or toast-only feedback.
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Product judgments, assumptions, and unresolved unknowns

- **Product judgment:** new-only is proportionate because D43 already has
  durable recovery and the reminder has no deadline/access consequence.
- **Product judgment:** a nonnumeric already-waiting-requests-unchanged statement
  is clearer and safer than enumerating pending requests or showing a count.
- **Product judgment:** exact business linearization is necessary, but requiring
  one database lock/schema today would create needless coupling and debt.
- **Assumption:** ministries will accept that older pending requests receive no
  future cadence reminder. This remains a comprehension/research item, not a
  verified fact.
- **Unknown:** later policy-edit effects on admitted post-boundary episodes;
  D48 must not invent them.
- **Unknown:** D49 recipient binding and D50 time model; no D48 implementation
  may silently choose either.

## Current behavior, intended behavior, and permanent path

| Area                     | Current behavior                             | D48 intended contract                                                                 | Best permanent path                                                            |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Current pending requests | No cadence/reminder state.                   | Always excluded from first-On activation; no catch-up.                                | Keep source lane/task/item; never scan or backfill.                            |
| First non-Off policy     | No runtime policy.                           | Establishes one trusted logical cohort boundary only in a later feature.              | Immutable Phase 12 revision/receipt with implementation-neutral serialization. |
| New D43 creation         | Authoritative idempotent source transaction. | Atomically observes/records applicable policy head and cohort disposition or retries. | Extend the source command/adjacent same-transaction contract; no async patch.  |
| Retry/replay             | Returns existing pending request/receipt.    | Preserves original cohort result.                                                     | Semantic product idempotency beyond transport windows.                         |
| Tasks/items/email        | D44/D45 projections and initial email.       | Never classify/enroll/backfill D48.                                                   | Consume later source truth only; no timestamp inference.                       |
| Recipients               | D44 current generations.                     | Unresolved for reminder; D49 owns.                                                    | No recipient adapter before D49.                                               |
| Clock/calendar           | None for D43 reminder.                       | Unresolved; D50 owns.                                                                 | No `created_at + cadence` calculation before D50.                              |
| Later policy edits       | Unresolved.                                  | Outside D48.                                                                          | Separate decision before activation; no analogy to D45/D36.                    |

## Domain model, ownership, and invariants

### Canonical terms

- **Cadence application boundary:** the trusted logical ordering fence created
  by the first successful non-Off Phase 12 policy publication. It is not user
  vocabulary, a wall-clock comparison, or a prescribed schema field.
- **Source-creation commit:** the authoritative transaction that first creates
  one genuine D43 request episode and immutable receipt.
- **Cohort disposition:** the immutable server-derived answer for one request
  episode under D48: admitted after the boundary, excluded as pre-boundary, or
  safely not admitted because optional cadence proof remained unsupported/
  corrupt/unprovable after concurrency was resolved. Storage shape is not decided here.
- **Existing episode:** a D43 episode whose source creation committed before the
  first non-Off boundary. Persistence after the boundary does not make it new.
- **Successor episode:** a separately valid D43 request created after a terminal
  predecessor. It is evaluated independently at its own creation commit.
- **Behavioral linearization:** every concurrent policy-publication/request-
  creation pair has one result equivalent to one complete operation occurring
  before the other; ambiguous stale commit aborts/retries.
- **Cadence serialization namespace:** one stable Tenant/environment/policy-kind
  coordination identity shared by first absent-row publication and every D43
  creation; it is not a prescribed database lock/key/table.

### Ownership matrix

| Authoritative fact                          | Owner                                | Permitted projections/executors        | Explicit non-owners                      |
| ------------------------------------------- | ------------------------------------ | -------------------------------------- | ---------------------------------------- |
| D43 request episode/source creation/receipt | Phase 12 request aggregate           | source lane, audit, task/item adapters | browser, task, notification, worker      |
| First non-Off policy head/boundary          | Phase 12 Tenant source policy        | permission-filtered settings/receipt   | D44 route, D45 plan, provider, Inngest   |
| Cohort disposition/applicable policy input  | Phase 12 source-creation transaction | later reminder eligibility/audit       | timestamp scan, migration, projection    |
| One reminder source occurrence              | Phase 12 future source contract      | Phase 17/6 descendants                 | cohort row, recipient, channel, executor |
| Current responsibility/recipients           | D44                                  | task/item/future D49 adapter           | D48 cohort logic                         |
| Work and engagement                         | ADR-0183/0027                        | Tasks/Notification Center              | request/cohort/source time               |
| Channel intents/outcomes                    | Phase 17/6/provider owners           | operations evidence                    | D48 application boundary                 |
| Wake/retry                                  | replaceable workflow adapter         | identifier-only claims/traces          | request/cohort truth/idempotency         |

### Invariants

1. D48 creates no current artifact or behavior.
2. Every pre-boundary D43 request episode is excluded for that episode; there
   is no D48 catch-up/current-work operation.
3. Every future admission is decided at genuine source creation, never later by
   timestamp/query/projection/import inference.
4. Policy publication and request creation share one stable Tenant/policy-kind
   serialization namespace and have one unambiguous business order; transient
   ambiguous/stale attempts abort and retry safely.
5. Request, receipt, server-observed applicable policy input, cohort disposition,
   and durable source handoff commit atomically. Persistent cadence-proof failure
   commits the valid D43 request with typed safe non-admission/ops evidence and
   no reminder handoff; cadence never strands source work.
6. Once committed, exact replay returns the original episode/disposition; policy changes never
   reclassify a duplicate submission.
7. A legitimate terminal successor is a new episode and receives a fresh
   source-creation decision without inheriting predecessor cohort/history.
8. Restore/migration/replication of existing history preserves identity and
   disposition; local insertion time creates no admission.
9. Policy/reminder contract versions are immutable inputs, not one-occurrence
   uniqueness; one D43 episode retains zero-or-one courtesy occurrence.
10. D48 does not decide later policy edits, D49 recipients, D50 time, or channels.
11. Only Phase 12 owns boundary/disposition; every downstream system is
    read-only projection or execution.
12. Tenant, environment, request episode, policy input, actor, and audit evidence
    are server-derived and same-scope under constraints/RLS/privileged parity.
13. Excluded/current requests retain complete ordinary recovery and lawful D43
    decision paths; exclusion changes no access or source state.
14. Future first-On UX truthfully says after-save requests only, already-waiting
    requests unchanged/outside the policy, and no-due/no-access effect without a census/count.
15. No new telemetry, age scan, individual score, or notification is authorized.

## Lifecycle, concurrency, idempotency, and failure

### D48 current lifecycle

D48 adds zero persisted states and zero transitions now. A current request may
age indefinitely under D43 with zero D48 effect. The future logical disposition
below is a required behavior, not a schema/state-name prescription.

### Future first-activation behavioral lifecycle

1. D47 evidence and D48–D50/later gates are complete.
2. Authorized first non-Off policy publication validates expected head and
   commits one immutable revision/receipt/boundary or nothing.
3. A genuine D43 source creation resolves through the shared serialization
   fence:
   - logically before boundary → excluded;
   - logically after boundary with applicable non-Off head → admitted;
   - transient ambiguous/stale/conflicting → abort and bounded retry;
   - persistent unsupported/corrupt/unprovable optional cadence proof after
     concurrency resolution → valid D43 request plus typed safe non-admission,
     durable body-free operations evidence, and no cadence/reminder handoff.
4. The source transaction atomically commits the valid request/receipt/source
   handoff and complete admitted/excluded/non-admitted disposition; partial state
   is impossible.
5. Once committed, exact retries return that result and never re-evaluate.
6. D43 terminality ends the episode; a lawful successor repeats step 3 as a new
   episode.
7. Later recipient/time/channel processing cannot change disposition.

### Required race outcomes

| Race/failure                                                                         | Required D48 result                                                                                                                  |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Request source commit completes before first-On boundary                             | Existing episode excluded permanently; later activation does not catch up.                                                           |
| First-On boundary completes before request source commit                             | Request must observe/record the applicable head/disposition or abort/retry; it cannot silently commit as old.                        |
| Transactions overlap with no provable order                                          | One aborts/conflicts/retries; no ambiguous request or partial policy result.                                                         |
| Serialization resolved but cadence proof is persistently missing/unsupported/corrupt | Commit lawful D43 request with typed safe non-admission and durable body-free ops evidence; no reminder handoff and no later age-in. |
| Policy save response lost                                                            | Same semantic save returns original policy receipt/boundary; no second boundary.                                                     |
| Request response lost and retried after first On                                     | Same request/receipt/original disposition; no reclassification/new episode.                                                          |
| Same request command key with changed source/explanation/head                        | D43 conflict/typed current result; never cohort re-evaluation.                                                                       |
| Projection/task/item created after boundary for pre-boundary request                 | Request remains excluded; projection time is irrelevant.                                                                             |
| Historical request restored/imported/replayed after boundary                         | Preserves original identity/disposition; never admitted from local insertion time.                                                   |
| Pre-boundary request ends; valid successor begins after boundary                     | Predecessor stays excluded/terminal; successor is independently evaluated.                                                           |
| Later policy edit races admitted post-boundary work                                  | Outside D48; later decision must define before implementation.                                                                       |
| Route/recipient changes                                                              | Source disposition unchanged; D49 later defines descendants.                                                                         |
| Clock/calendar/lateness dispute                                                      | No executable result until D50; D48 membership alone sends nothing.                                                                  |

## UX/UI contract

### Current UX

- No D48 setting, status, badge, cohort label, timestamp, disabled control,
  **Coming soon**, backlog count, task state, notification, or reminder appears.
- Existing **Access requests**, D44 coordinator settings/tasks/items, D45 email
  controls, and D43 holder/reviewer journeys remain unchanged.

### Future first-On administrator journey, if the complete feature is activated

1. The cadence source editor remains in **People & access → Access requests**.
2. Before save, persistent text immediately below the finite cadence choice says:

   ```text
   Applies only to access review requests created after you save.
   Requests already waiting aren't included.
   This doesn't set a due date or change access.
   ```

3. There is no numeric consequence summary. The editor does not enumerate/count
   pending work, recipients, preferences, contacts, or hidden scopes.
4. The ordinary policy save is the only action. There is no preselected
   **Include existing**, secondary apply link, backlog grid, date picker,
   type-to-confirm, channel selector, or nested confirmation.
5. Save uses expected heads and durable inline result. A stale/unauthorized/
   indeterminate conflict changes nothing and says the setting must be reviewed
   again; lost response resolves receipt before another save.
6. Success says **Saved for future access review requests. Requests already
   waiting have not changed.** It claims no downstream attention outcome because
   D49/D50/channel gates remain separate.

### Coordinator, holder, and public journeys

- Coordinators see no cohort-admission flag, missed-reminder marker, due state,
  or explanation for old-versus-new treatment in ordinary work. Existing and
  new requests remain equally valid D43 work.
- Holders see only D43 status/access truth. They never see policy boundary,
  cohort, recipients, timer, delivery, or staff response data.
- Donors, missionaries, public users, unrelated staff, support without exact
  purpose, and other Tenants see no D48 fact or behavior.

### Accessibility, localization, and field conditions

- Future copy/control/result uses native semantic controls, persistent visible
  labels/descriptions, keyboard/focus/error/status semantics, WCAG 2.2 AA
  contrast/non-color, 320-CSS-pixel/400%-zoom reflow, long localized/RTL text,
  touch, and low-bandwidth reconnect safety.
- **New requests only** is localized as source-episode admission, not “new to
  you,” unread, recent, age, task assignment, or notification delivery.
- No relative date/time is needed in D48 UX, avoiding timezone ambiguity before
  D50. The internal boundary never appears as a user-facing timestamp.

## Normative requirements

1. **D48-R1 — New episodes only.** First non-Off activation may admit only
   genuine D43 source creations linearized after its trusted boundary.
2. **D48-R2 — Existing episodes excluded.** Every pre-boundary pending episode
   remains outside D48 with no current-work apply/backfill/catch-up.
3. **D48-R3 — Trusted logical boundary.** Phase 12 policy publication/request
   creation share one stable Tenant/policy-kind serialization namespace and
   business-order fence; wall-clock timestamps do not classify membership.
4. **D48-R4 — Behavioral linearization.** Every policy-save/request-create race
   yields one old-or-new serial result or abort/retry, never ambiguity.
5. **D48-R5 — Cadence cannot strand D43.** Request creation atomically records
   server-observed policy/disposition with valid source request/receipt/handoff;
   persistent cadence-proof failure safely non-admits rather than blocking or aging in.
6. **D48-R6 — Implementation-neutral concurrency.** D48 freezes no lock,
   isolation level, table, sequence, column, or transaction API.
7. **D48-R7 — No timestamp scan.** Created/updated/effective/commit/projection/
   task/provider/executor times never reconstruct cohort membership.
8. **D48-R8 — Stable committed replay.** Once committed, duplicate/lost-response
   replay returns original request/receipt/disposition despite later policy;
   uncommitted bounded retry may observe the winning server-side head.
9. **D48-R9 — Successor is new.** Only a lawful new D43 successor episode after
   terminality receives a new cohort evaluation.
10. **D48-R10 — Historical identity preserved.** Restore/import/replication/
    migration cannot turn an existing episode into post-boundary creation.
11. **D48-R11 — No artifact now.** D48 adds no schema/config/key/event/job/UI/
    feature-flag/telemetry placeholder.
12. **D48-R12 — Phase 12 source ownership.** Policy, boundary, episode,
    disposition, and one reminder occurrence remain Phase 12 facts.
13. **D48-R13 — Preserve D43.** Cohort changes no request lifecycle, decision,
    holder action, explanation, grant, or EffectiveAccess.
14. **D48-R14 — Preserve D44 recovery.** Existing/new work remains in the
    complete source lane and current task/item routes independently.
15. **D48-R15 — Reuse intended D44 authority.** Future policy save uses the
    intended Phase 12 current same-Tenant Tenant-wide `permissions.manage_grants` plus registered purpose,
    scope/ceiling/floor/assignment/epoch/head; no new capability.
16. **D48-R16 — Trusted server derivation.** Caller/idempotency input controls
    no Tenant, policy head, boundary, disposition, actor, author, recipient,
    time, or audit fact; policy context is observed by the server.
17. **D48-R17 — Policy version is input.** Policy/reminder versions are immutable
    evidence, not source-occurrence uniqueness or replay-reset levers.
18. **D48-R18 — Later policy edits deferred.** D48 makes no rule for Off,
    re-enable, shorter/longer cadence, correction, rollback, or admitted work.
19. **D48-R19 — D49 recipient binding deferred.** Cohort membership chooses no
    coordinator snapshot/current/route-churn/member behavior.
20. **D48-R20 — D50 clock deferred.** Cohort membership chooses no cadence
    arithmetic, timezone, calendar, DST, lateness, or catch-up.
21. **D48-R21 — Channels remain separate.** Cohort admission sends nothing and
    cannot reuse/replay D44/D45/task/item/provider identities.
22. **D48-R22 — Database/RLS safety.** Future persistence uses same-scope
    composite integrity, forced RLS, `USING`/`WITH CHECK`, hardened commands,
    and privileged parity without fixing schema here.
23. **D48-R23 — Durable product idempotency.** Product semantic identity/
    receipts own replay beyond executor/provider windows.
24. **D48-R24 — Atomic handoff/recovery.** Source truth and durable identifier-
    only handoff never dual-write; downstream failure cannot reclassify.
25. **D48-R25 — Quiet exact UX.** Future first-On copy says after-save requests
    only, already-waiting requests unchanged/outside policy, no due date/access
    change, and no channel guarantee—without a numeric count.
26. **D48-R26 — No current-work UI.** No checkbox, apply action, census/count,
    backlog grid, exception, or hidden/disabled current-work control exists.
27. **D48-R27 — Accessible resilient UX.** Native semantics, focus/status/
    reflow/localization/RTL/mobile/low-bandwidth proof are release gates.
28. **D48-R28 — Privacy and humane use.** Cohort evidence/UX/logs/analytics/
    exports/AI expose no protected body, individual behavior, or cross-Tenant fact.
29. **D48-R29 — No scan and measured performance.** Policy save is not a
    current-work census; future creation observes one bounded source head under
    production-shaped budgets, not vague scalability claims.
30. **D48-R30 — Traceable staged release.** D48 requirements/ACs and unresolved
    D49/D50/edit/channel gates trace through every governing/implementation/
    proof artifact before activation.

## Ruthless 22-category adversarial review

Severity describes escaped consequence; likelihood assumes a naïve future
implementation. D48 currently ships no runtime.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                    | Why it matters                                                                                                                                     | Severity | Likelihood                   | Evidence or reasoning                                                                                                  | Decision effect                                                                      | Best permanent fix                                                                                                                          | Exact decision / requirement / acceptance language     |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| New-only excludes legitimately missed existing requests and solves no current backlog. | Staff could expect activation to help work already waiting and lose trust when nothing happens.                                                    | Medium   | High unless copy is explicit | D44 recovery remains complete; D47 reminder has no deadline. HubSpot makes existing-versus-future enrollment explicit. | Narrows Option 1 to truthful zero-current impact, not a claim of universal coverage. | Preserve existing recovery paths and use exact pre/save/post-save copy; require a new founder decision to add any current-work application. | **D48-R1–R2, R14, R25–R27; D48-AC001–010, AC031–040.** |
| Strongest alternative is D36-style deliberate complete current-work application.       | It could cover current need but adds cohort census, preview, application ledger, fanout, repair, and notification-storm risk for a courtesy nudge. | High     | Medium                       | D36/D37 already demonstrate the real complexity; founder selected the simpler policy.                                  | Confirms new-only, while keeping future reconsideration explicit.                    | No current-work action through D48; validate need before changing the decision rather than prebuilding the machinery.                       | **D48-R2, R11, R26, R30; D48-AC001–010, AC091–120.**   |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                         | Why it matters                                                                                                   | Severity | Likelihood          | Evidence or reasoning                                                                                                  | Decision effect                                                   | Best permanent fix                                                                                                   | Exact decision / requirement / acceptance language           |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Cohort is reconstructed by `created_at >= effective_at`, cache state, client time, or projection insertion. | Clock skew, equal timestamps, transaction overlap, restored rows, and lag classify the same request differently. | Critical | High for a shortcut | PostgreSQL concurrency requires explicit serial outcome; D37 already rejects display/wall-clock cohort classification. | Replaces vague timestamp semantics with behavioral linearization. | Source creation atomically observes/records policy head/disposition or conflicts/retries; never query-time classify. | **D48-R3–R7, R22–R24; D48-AC011–030, AC041–060, AC071–080.** |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                                                         | Severity | Likelihood                                    | Evidence or reasoning                                                                | Decision effect                              | Best permanent fix                                                                                                                | Exact decision / requirement / acceptance language           |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| D48 adds nullable `cadence_policy_id`/`is_new`, a generic cohort table, scanner, current-work checkbox, or hard-coded lock before D49/D50/design. | An implementation detail becomes a compatibility contract and duplicates source/application machinery. | High     | High if “future-ready” means placeholder code | D46/D47 explicitly define readiness as documented boundaries, not dormant artifacts. | Makes D48 behavior-only and storage-neutral. | Add nothing now; later choose the smallest same-transaction representation and concurrency primitive proven by repository design. | **D48-R6, R11–R12, R18–R21, R30; D48-AC001–010, AC091–110.** |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                        | Why it matters                                                                                                   | Severity | Likelihood        | Evidence or reasoning                                                                                | Decision effect                                     | Best permanent fix                                                                                                                                 | Exact decision / requirement / acceptance language            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------- | ----------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Request transaction begins before On, commits after On, loses response, retries; a projection appears late; predecessor ends and successor starts; restore inserts history after boundary. | Without exact episode/commit semantics, pre-boundary work can be silently admitted or genuine new work excluded. | Critical | High in aggregate | These are normal distributed/concurrent cases; D43 already has semantic request identity/successors. | Adds closed race outcomes and lineage preservation. | Linearize source commits, preserve original receipts/disposition, evaluate only genuine successor creation, reject local insertion-time inference. | **D48-R3–R10, R23–R24; D48-AC011–030, AC071–080, AC091–100.** |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                                             | Why it matters                                                                                                     | Severity | Likelihood                                                   | Evidence or reasoning                                                                                        | Decision effect                        | Best permanent fix                                                                                        | Exact decision / requirement / acceptance language                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Include existing**, a preselected checkbox, **Apply now**, manual per-row opt-in, support force-enroll, or retry button silently creates a backlog operation. | A low-risk setting save can trigger many reminders and expose sensitive access work without deliberate governance. | Critical | High because workflow products commonly offer these controls | HubSpot explicitly exposes such a choice; D48 deliberately selects No and D36 shows current-work complexity. | Prohibits every D48 current-work path. | Server rejects current-episode enrollment; UI contains only exact new-only copy and ordinary policy save. | **D48-R2, R11, R16, R25–R26; D48-AC001–010, AC031–040, AC091–100.** |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                 | Why it matters                                                                             | Severity | Likelihood                     | Evidence or reasoning                                                                                   | Decision effect                                                   | Best permanent fix                                                                                                         | Exact decision / requirement / acceptance language |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Policy head/boundary from one Tenant/environment is observed by another request, cache, worker, or multi-hat actor. | Cohort membership can disclose or schedule sensitive governance work across organizations. | Critical | Medium without composite scope | D43/D44 use exact Tenant/Active Tenant Assignment; shared workflow infrastructure remains multi-Tenant. | Adds same-scope derivation to policy/request/disposition/handoff. | Composite Tenant/environment relationships, current purpose/assignment proof, no global cache/fallback, privileged parity. | **D48-R12, R15–R16, R22, R28; D48-AC041–060.**     |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                          | Why it matters                                                                                   | Severity | Likelihood            | Evidence or reasoning                                                                                                                                                              | Decision effect                                                                        | Best permanent fix                                                                                                                                                   | Exact decision / requirement / acceptance language       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Caller writes policy/boundary/disposition; bare FKs or incomplete `WITH CHECK` allow a permitted row to be retargeted; service role bypasses RLS.            | An allowed creation/update can forge post-boundary admission or cross-Tenant reminder authority. | Critical | High for generic CRUD | PostgreSQL proposed rows require `WITH CHECK`; owners/`BYPASSRLS` need explicit parity.                                                                                            | Requires hardened source command and database constraints without fixing schema shape. | Revoke base writes; derive trusted facts; same-scope NOT NULL FKs/checks/unique invariants; force RLS; `USING`/`WITH CHECK`; owner/service/support/migration parity. | **D48-R12, R15–R17, R22–R24; D48-AC041–060, AC071–080.** |
| Policy publication and request creation are independently valid but commit with stale observations, especially when the first policy row does not yet exist. | Both can succeed while producing no serial order consistent with D48.                            | Critical | Medium-high           | Read Committed snapshots alone may permit stale reads unless implementation creates conflict; a missing-row or per-grant lock does not make all requests contend with publication. | Makes a shared stable serialization namespace mandatory behavior.                      | Use any verified lock/CAS/Serializable/fence design spanning Tenant/environment/policy kind, with complete retry; test outcome, not mechanism.                       | **D48-R3–R6, R23–R24; D48-AC011–020, AC071–085, AC103.** |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                                    | Why it matters                                                                             | Severity | Likelihood                                                        | Evidence or reasoning                                                      | Decision effect               | Best permanent fix                                                                                                                                    | Exact decision / requirement / acceptance language                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| New-only activation grows a generic cohort/versioning engine, historical application ledger, Site filters, per-row exceptions, calendar scheduler, or workflow canvas. | D48 becomes a reusable automation subsystem before one courtesy cadence is even validated. | High     | High if D36/D37 or HubSpot workflow machinery is copied wholesale | Core needs one binary source boundary; D49/D50 are intentionally separate. | Strictly reduces build scope. | One source-creation observation contract; no current census/application or generic engine; solve later decisions with fixed owner-specific contracts. | **D48-R1–R2, R6, R11, R18–R21, R26, R29; D48-AC001–010, AC081–100.** |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                                    | Why it matters                                                                                                | Severity | Likelihood                      | Evidence or reasoning                                                                                      | Decision effect                                                     | Best permanent fix                                                                                                            | Exact decision / requirement / acceptance language |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Admin assumes On helps existing work; “new” is read as unread/new-to-me; hidden counts or a second confirmation create doubt; toast-only response causes repeat saves. | Staff misunderstand scope, miss current recovery, or duplicate consequential changes under weak connectivity. | High     | High without explicit hierarchy | HubSpot explicitly distinguishes current/future enrollment; Core D36 uses durable consequence copy/status. | Adds exact before/after copy and removes unnecessary census/action. | Persistent exact impact without a number, durable inline receipt, typed conflict recovery, no current-work action/count/grid. | **D48-R25–R27; D48-AC031–040, AC101–110.**         |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                                            | Why it matters                                                                                | Severity | Likelihood                | Evidence or reasoning                                                | Decision effect                                           | Best permanent fix                                                                                                  | Exact decision / requirement / acceptance language |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Analytics age, task/item creation, D45 intent, provider result, worker query, or migration decides cohort instead of Phase 12 source creation. | Multiple systems can disagree and circularly “repair” membership, duplicating reminder truth. | Critical | High without owner matrix | Governing ADRs separate source/work/presentation/delivery/execution. | Centralizes policy/boundary/disposition in Phase 12 only. | Downstream consumes immutable source disposition; never dual-write/reconstruct; constraints block second authority. | **D48-R3–R17, R21–R24; D48-AC011–030, AC051–070.** |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                             | Why it matters                                                                                            | Severity | Likelihood                                 | Evidence or reasoning                                                                                 | Decision effect                                      | Best permanent fix                                                                                                                  | Exact decision / requirement / acceptance language     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| D48 borrows D44 current-work reconciliation, D45 future-only email membership, D36/D37 Website cohorts, generic task dates, UUID ordering, or Inngest run time. | Unrelated policy, projection, delivery, or executor changes alter source admission and block replacement. | High     | High because local precedents look similar | Those domains have different owners/effects; D48's cohort is decided only during D43 source creation. | Forbids convention reuse beyond abstract principles. | One typed Phase 12 source seam and architecture tests rejecting forbidden imports/queries; later adapters consume identifiers only. | **D48-R5–R7, R12, R18–R24; D48-AC051–070, AC101–110.** |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                             | Why it matters                                                                                       | Severity | Likelihood                      | Evidence or reasoning                                                                                                                                             | Decision effect                                                        | Best permanent fix                                                                                                                                          | Exact decision / requirement / acceptance language                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Policy commits but response is lost; request commits but handoff fails; stale request commits after policy; retry sees new head; restore loses disposition.     | Cohort can be lost, duplicated, or reclassified, and downstream effects can contradict source truth. | Critical | High in distributed operation   | Transactional outbox solves dual write; RFC 9110 warns against blind non-idempotent retries.                                                                      | Adds atomic evidence/handoff, receipts, and complete-command retry.    | Product transaction/semantic key first; exact receipt lookup; abort/retry stale source; deterministic restore/reconcile; no blind resubmit.                 | **D48-R3–R10, R23–R24; D48-AC011–030, AC071–100.**                  |
| Optional cadence proof stays missing/unsupported/corrupt after the policy/request order is known, and creation keeps retrying or rejects the valid D43 request. | A courtesy feature would strand the authoritative access-recovery workflow it is supposed to assist. | Critical | Medium without a typed fallback | Cadence is optional; source request validity and cadence admission are different facts. Retrying a persistent proof defect cannot establish a new business order. | Amends atomicity: source validity survives while cadence fails safely. | Commit the lawful D43 request with a typed immutable safe-non-admitted disposition, body-free operations evidence, and no reminder handoff or later age-in. | **D48-R5, R8, R24; D48-AC016–018, AC075–080, AC096, AC102, AC107.** |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                     | Why it matters                                                                      | Severity | Likelihood                           | Evidence or reasoning                                                                                         | Decision effect                                                       | Best permanent fix                                                                                                                  | Exact decision / requirement / acceptance language      |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Request episode, terminal successor, policy revision, duplicate command, and creation/boundary race lack closed identities/transitions. | A pre-boundary episode can be reclassified or one successor/reminder can duplicate. | Critical | High without formal state/race model | D43 has closed episode identity; D47 fixes one occurrence; PostgreSQL serializable order may require retries. | Defines exact logical lifecycle while deferring physical concurrency. | Immutable policy/request/disposition receipts, one source order, D43 successor semantics, product uniqueness, complete retry tests. | **D48-R1–R10, R17, R23–R24; D48-AC011–030, AC071–080.** |
| D48 accidentally defines reminder clock from the cohort boundary.                                                                       | “After activation” could become the cadence timer origin, pre-deciding D50.         | High     | Medium                               | Cohort boundary and reminder time are separate facts.                                                         | Explicitly limits D48.                                                | Use boundary only to classify source episode; D50 alone chooses time origin/arithmetic/lateness.                                    | **D48-R18–R20; D48-AC061–070, AC111–120.**              |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                       | Why it matters                                                                        | Severity | Likelihood  | Evidence or reasoning                                                                      | Decision effect                                                    | Best permanent fix                                                                                                                                     | Exact decision / requirement / acceptance language                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Cohort disposition is nullable/mutable, asynchronously filled, duplicated across request/task tables, or omitted on replay; policy version becomes occurrence uniqueness. | Unknowns get guessed, history drifts, and policy revisions can mint second reminders. | Critical | Medium-high | D47 requires immutable input/hash and one occurrence; async patch creates a partial state. | Requires complete immutable source evidence and no dual ownership. | Future closed disposition with source transaction, restrictive mutation/delete, unique source identity excluding policy version, repair from receipts. | **D48-R5, R8, R10, R12, R17, R22–R24; D48-AC021–030, AC041–060, AC091–100.** |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                           | Why it matters                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                  | Decision effect             | Best permanent fix                                                                                                                          | Exact decision / requirement / acceptance language   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Preview/census, cohort flag, log/event, cache, support/export/AI, timing oracle, or external channel reveals old/current request existence, holder, reason, capability, provenance, coordinator, or behavior. | Access-governance and missionary/member-care facts can leak or become surveillance. | Critical | Medium     | D43 content is protected; D48 needs no current census; event payloads can escape retention boundaries. | Minimizes D48 facts and UX. | No current-work effect or census; identifier-only handoff; field allowlists; purpose/RLS; no person metrics; no current-work timing oracle. | **D48-R16, R22, R25–R29; D48-AC031–060, AC081–090.** |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                  | Why it matters                                                                                | Severity | Likelihood              | Evidence or reasoning                                                                                                        | Decision effect                                                                | Best permanent fix                                                                                                                                                      | Exact decision / requirement / acceptance language     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| First On scans all pending requests, calculates ages, locks a Tenant-wide table too broadly, or makes request creation perform unbounded policy/recipient/time work. | Large Tenants suffer blocking, deadlocks, latency, noisy-neighbor load, and unsafe fallbacks. | High     | Medium for naïve design | D48 current impact is zero; request creation needs only one bounded source-policy observation; exact volumes remain unknown. | Eliminates current scan and bounds creation work without claiming a mechanism. | No census/backfill; one indexed/current head lookup through measured serialization; D49/D50 work outside D48; publish exact benchmark/lock-wait budgets before release. | **D48-R2–R7, R19–R20, R29; D48-AC081–090, AC101–110.** |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                            | Severity | Likelihood | Evidence or reasoning                                                                  | Decision effect                                                        | Best permanent fix                                                                                                          | Exact decision / requirement / acceptance language |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Operators must repair ambiguous boundary rows, rerun scans, classify restores, force cohort membership, or diagnose DB deadlocks with no receipt. | A simple policy needs tribal knowledge/direct SQL and can notify wrongly. | High     | Medium     | Behavior spans policy/request concurrency and disaster recovery; mechanism may evolve. | Requires receipts, typed conflicts, runbook, and no manual membership. | Product-owned audit/receipt/reconciler; consistent transaction ordering; exact restore rules; no force-enroll or broad SQL. | **D48-R3–R10, R22–R24, R29–R30; D48-AC071–100.**   |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                              | Why it matters                                                                                          | Severity | Likelihood                          | Evidence or reasoning                                              | Decision effect                                                      | Best permanent fix                                                                                                                                 | Exact decision / requirement / acceptance language          |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Only logs/executor traces show which policy head a request saw; alternatively D48 adds age/person telemetry now. | Vendor/log retention cannot prove source history; new telemetry expands sensitive scope before runtime. | High     | High absent explicit audit boundary | Product receipts are durable authority; D47 forbids new telemetry. | Adds product audit requirements for future and no-new-telemetry now. | Immutable source receipt/input hash later; current CI/release audits and existing incidents only; no metric/table/job authorized by monitor names. | **D48-R5, R8, R23–R24, R28–R30; D48-AC081–090, AC111–120.** |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                            | Severity | Likelihood  | Evidence or reasoning                                                                  | Decision effect                                     | Best permanent fix                                                                                                                            | Exact decision / requirement / acceptance language     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Database-specific commit timestamps/locks, Inngest ordering, provider/event timestamps, cache consistency, or one ORM transaction behavior becomes the contract. | Platform/library changes alter membership and make executor/database evolution dangerous. | High     | Medium-high | PostgreSQL offers multiple concurrency tools; workflow/provider clocks are downstream. | Keeps contract behavioral and adapters replaceable. | Conformance tests for old/new race outcomes; product semantic receipts; identifier-only handoff; document chosen mechanism later, not in D48. | **D48-R3–R7, R12, R21–R24; D48-AC011–020, AC061–080.** |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                | Why it matters                                                                                  | Severity | Likelihood                    | Evidence or reasoning                                                                             | Decision effect                                            | Best permanent fix                                                                                                                                            | Exact decision / requirement / acceptance language |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- | ----------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Migration derives membership from old timestamps, inserts admitted rows for pending requests, mixed old code omits disposition, feature rollback deletes boundary, or replay reclassifies history. | Existing users receive surprise reminders; old/new nodes disagree; history becomes irreparable. | Critical | High without explicit rollout | No runtime exists; current similar fields are nonprecedent; D48 explicitly excludes pending work. | Adds no-backfill and mixed-version fail-closed sequencing. | Readers/deny before writers; explicit historical exclusion; no timestamp derivation; one compatible writer; immutable boundary/receipts; roll-forward repair. | **D48-R2, R7–R11, R17–R24, R30; D48-AC091–110.**   |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                       | Why it matters                                                                | Severity | Likelihood | Evidence or reasoning                                                                          | Decision effect                                       | Best permanent fix                                                                                                                              | Exact decision / requirement / acceptance language |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Tests assert timestamps/rows rather than user/domain outcomes and miss exact-boundary races, retry reclassification, restore, privileged paths, no-current UX, and D49/D50 non-decisions. | Implementation passes locally while violating cohort or creating hidden debt. | High     | High       | D48 is defined by concurrency behavior across many seams; repository requires traceable proof. | Adds continuous AC IDs and outcome-based test matrix. | Carry D48-R/AC through docs/spec/tickets/code/tests/release; use deterministic concurrency/barrier fixtures and negative architecture/UX tests. | **D48-R1–R30; D48-AC001–120.**                     |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                           | Why it matters                                                                                                              | Severity | Likelihood | Evidence or reasoning                                                       | Decision effect                                                     | Best permanent fix                                                                                                                               | Exact decision / requirement / acceptance language               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Support/AI/manual SQL “fixes” old requests, an experiment enrolls a sample, backup restore changes row times, or analytics treats excluded work as neglected. | Hidden privileged paths bypass founder intent, expose sensitive work, and turn optional cadence into pressure/surveillance. | Critical | Medium     | D48 needs no exceptions; privileged/manual paths are common escape hatches. | Adds uniform no-exception/purpose restrictions and incident repair. | Reject force-enroll/sample cohort; preserve original lineage; no performance label; privileged parity; new founder decision for changed purpose. | **D48-R2, R7–R11, R16, R22, R28–R30; D48-AC041–060, AC081–120.** |

## Acceptance criteria

### Decision scope, current behavior, and first-activation cohort

- **D48-AC001:** D48 is documentation-only and adds no runtime/schema/config/
  registry/API/UI/event/job/provider/feature-flag/telemetry artifact.
- **D48-AC002:** A later first non-Off D47 policy may admit only a genuine D43
  request episode whose authoritative source-creation commit linearizes after
  that policy's trusted effective boundary.
- **D48-AC003:** Every D43 request episode committed before the boundary remains
  excluded for that entire episode, even if it remains `pending_review` for any
  duration after activation.
- **D48-AC004:** D48 creates no current-work application, current-request cohort,
  backfill, catch-up, age enrollment, missed-reminder marker, manual exception,
  per-request opt-in, or support/AI force-enroll path.
- **D48-AC005:** Existing excluded requests remain complete/actionable through
  the Access requests source lane and current D44 task/in-product paths; optional
  D45 initial email remains unchanged and no access/request state changes.
- **D48-AC006:** First-On save changes no current pending request and need not
  enumerate/count/read protected current work to prove that contract fact.
- **D48-AC007:** D48 does not choose the cadence value/time arithmetic, recipient,
  message/channel, delivery, later policy-edit effect, or implementation technology.
- **D48-AC008:** Missing/unknown/incompatible/unproved future D47 policy remains
  Off and establishes no D48 admission boundary through guess/default.
- **D48-AC009:** Policy/reminder contract revision, route/member, task/item,
  channel/provider/executor, retry, or projection identity cannot multiply D47's
  zero-or-one courtesy source occurrence per exact request episode.
- **D48-AC010:** Current deployment requires no migration, seed, backfill,
  secret/provider setup, scheduler registration, dashboard/alert, canary, or
  historical-data read and sends nothing.

### Behavioral linearization and atomic source observation

- **D48-AC011:** Successful first non-Off policy publication commits one
  authoritative Phase 12 policy head/receipt and trusted logical application
  boundary, or commits none. The absent-row first save and request creation use
  one stable Tenant/environment/policy-kind serialization namespace; per-grant/
  request locks or a missing-row lock alone cannot establish this boundary.
- **D48-AC012:** “Before/after” is determined by one serializable business order
  between complete policy-publication and D43 source-creation operations, never
  by comparing timestamps after the fact.
- **D48-AC013:** For every concurrent save/create execution, observable committed
  state is equivalent to exactly one order: request before policy (excluded) or
  policy before request (request observes applicable non-Off head). There is no
  third ambiguous outcome.
- **D48-AC014:** A request transaction that read old/Off policy cannot silently
  commit logically after the new boundary with old cohort result; the chosen
  mechanism must force fresh observation or abort/retry.
- **D48-AC015:** A request transaction that begins or a browser form that opens/
  submits before policy activation but source-commits after the boundary is
  classified only by committed business order, not client/transaction start time.
- **D48-AC016:** Transient stale/conflicting serialization proof aborts and
  boundedly retries the whole source command. After concurrency is resolved,
  persistent missing/unsupported/corrupt cadence proof does not block D43: the
  valid request commits with typed safe non-admission, body-free operational
  evidence, and no cadence/reminder handoff or later age-in.
- **D48-AC017:** Future request creation atomically commits request episode,
  submission event/receipt, applicable policy input/head evidence, server-derived
  admitted/excluded/safe-non-admitted disposition, and identifier-only durable
  source handoff. Partial state never becomes visible or claimable.
- **D48-AC018:** Crash before source commit exposes no request/disposition/
  handoff; crash after commit is recoverable from product records without
  browser cache, worker memory, provider state, or timestamp scan.
- **D48-AC019:** D48 specifies only observable ordering/atomicity. Conformance
  may use locking, expected-head conflict, Serializable retry, sequence/fence,
  or another proven design; no one physical primitive is mandated by D48.
- **D48-AC020:** Any chosen implementation publishes deterministic concurrent
  tests for both serial outcomes, stale observation, serialization/deadlock
  abort, retry exhaustion, lost response, and no partial state.

### Request lifecycle, replay, successors, restore, and source invariants

- **D48-AC021:** Once a request episode commits, exact duplicate click,
  concurrent tab, lost-response retry, API/outbox replay, or repeated pending
  submission returns the same D43 episode/receipt/original disposition. Before
  commit, a bounded complete-command retry may observe the winning policy head.
- **D48-AC022:** A duplicate/replay after first-On activation never re-evaluates
  current policy, changes excluded→admitted, records a new boundary, or creates a
  successor/source occurrence.
- **D48-AC023:** Same semantic command identity with changed explanation, source
  head, subject, Tenant, or request meaning follows D43's changed-input conflict/
  current-result rules. Cadence policy head is server-observed—not caller input
  or an idempotency-key component—and a caller cannot use policy change to
  force cohort evaluation/mutation.
- **D48-AC024:** D43 `pending_review`, `withdrawn`, `resolved_kept`,
  `resolved_removed`, and `no_longer_applicable` remain the only source lifecycle;
  cohort admission/exclusion is not a request status or transition.
- **D48-AC025:** Withdrawal/keep/remove/no-longer-applicable changes no stored
  cohort history; D48 disposition never decides, closes, reopens, extends,
  suspends, removes, or otherwise changes access/request.
- **D48-AC026:** A terminal predecessor remains immutable. A later D43-authorized
  genuine concern may create one linked successor episode, which receives a new
  source-creation cohort evaluation without inheriting predecessor disposition.
- **D48-AC027:** Duplicate submission while the exact request remains pending is
  not a successor merely because policy activated; it returns the old excluded
  episode under D43 uniqueness.
- **D48-AC028:** Restore, disaster recovery, replication replay, migration, or
  import of an already-existing historical episode preserves original source
  identity/receipt/disposition; local insert/apply time never makes it new.
- **D48-AC029:** No generic import/bulk/support/API command can create or alter a
  D43 episode, policy head, boundary, or disposition outside the canonical
  source command and exact D43 rules.
- **D48-AC030:** Policy head/version and cohort disposition are immutable source
  input/audit evidence; policy revision is excluded from reminder-occurrence
  uniqueness and cannot reset/reclassify an episode.

### UX/UI, comprehension, accessibility, localization, and field conditions

- **D48-AC031:** D48 adds no current visible/programmatic control/status, disabled
  placeholder, badge, cohort label, timestamp, task field, notification, or
  **Coming soon** text.
- **D48-AC032:** If later activated, the canonical first-On editor remains in
  **People & access → Access requests**; no new top-level route or duplicate
  editor appears in Tasks, Notifications, System Messages, or workflow UI.
- **D48-AC033:** Before first-On save, persistent copy states **Applies only to
  access review requests created after you save. Requests already waiting aren't
  included. This doesn't set a due date or change access.**
- **D48-AC034:** Localized copy preserves four distinct truths: genuinely new
  source episodes only; existing episodes unchanged; no due/deadline meaning;
  no access/request consequence. “New” never means unread/new-to-me/recent/task-
  assigned/notification-created.
- **D48-AC035:** No numeric consequence summary appears. The editor performs/
  exposes no current census, count, subject, scope, request, recipient,
  preference, contact, or protected detail.
- **D48-AC036:** First-On editor has no **Include existing**, preselected option,
  **Apply to current**, backlog grid, per-row/Site filter, manual exception,
  date/clock, channel/test-send, nested confirmation, or hidden/disabled control.
- **D48-AC037:** Save uses local draft, Cancel, expected-head server validation,
  durable inline receipt/result, and identifiable recoverable errors. Stale/
  unauthorized/indeterminate proof writes no boundary and asks the actor to review.
- **D48-AC038:** Lost policy-save response first resolves the semantic receipt;
  UI does not offer blind repeat. Success says **Saved for future access review
  requests. Requests already waiting have not changed.**
- **D48-AC039:** Success does not claim a reminder was scheduled, sent,
  delivered, read, or will occur at a date because D49/D50/channel decisions
  remain unresolved and source outcome is not provider/human awareness.
- **D48-AC040:** Future affected controls/results pass WCAG 2.2 AA keyboard,
  name/role/value, focus visible/not obscured, error/status announcement,
  contrast/non-color, 320-CSS-pixel/400%-zoom reflow, long localized/RTL text,
  touch, low-bandwidth reconnect, and duplicate-save proof.

### Database, RLS, authorization, and trusted attribution

- **D48-AC041:** Future policy/boundary/request/disposition/handoff persistence,
  whatever its eventual shape, uses exact Tenant/environment/source/request/
  policy relationships; no bare cross-Tenant FK, email/display-name match, or
  nullable ownership fact is accepted.
- **D48-AC042:** Tenant, environment, policy kind/head/boundary, request episode,
  disposition, actor, author, subject, source, timestamps, semantic key, and
  audit attribution are derived from trusted current server context, never
  accepted as caller authority. The cadence policy head is not caller data and
  is not an idempotency-key component.
- **D48-AC043:** Browser/base-table writes are revoked. Exact hardened Phase 12
  commands alone publish policy or create D43 source/disposition; generic CRUD,
  upsert, bulk, import, support, AI, worker, and migration paths cannot mutate them.
- **D48-AC044:** Future constraints or authoritative mutation boundaries make
  invalid same-row/cross-row combinations impossible: wrong Tenant/environment,
  missing request/policy identity, ambiguous disposition, mutable predecessor,
  duplicate episode, or policy version used as occurrence uniqueness.
- **D48-AC045:** Every applicable future table/view/function/RPC/cache/search/
  Realtime path is default deny and uses exact read/write purpose. Mutation
  policies apply `USING` to current rows and `WITH CHECK` to proposed rows so an
  allowed operation cannot retarget scope/owner/source/disposition.
- **D48-AC046:** RLS is forced/equivalent for owner paths; service-role,
  `BYPASSRLS`, background, migration, support, import, AI, and administrative
  execution satisfy the same scope/linearization/idempotency/privacy invariants.
- **D48-AC047:** Future policy management reuses D44's intended Phase 12
  boundary: current same-Tenant Tenant-wide `permissions.manage_grants` plus registered exact policy purpose,
  live scope/ceiling/floor, Active Tenant Assignment, authorization epoch, and
  expected policy head. D48 adds no capability, and current broad runtime role/
  permission checks do not prove this future purpose boundary.
- **D48-AC048:** Coordinator, D43 decision authority alone, task/item/email
  receipt, D45/System Messages authority, Owner/Admin label, support, service
  role, or original-grantor history grants no policy/boundary management.
- **D48-AC049:** The exact holder/requester may submit only D43's already allowed
  untrusted locator/expected head, bounded explanation, and command key; they
  cannot view/select/provide policy, boundary, cohort, actor, Tenant, recipient,
  clock, or reminder state.
- **D48-AC050:** Every enumerate/count/detail/save/create/retry/receipt/audit/
  repair path re-proves current same-Tenant assignment, purpose, field access,
  expected heads, floor/ceiling, and returns uniform non-oracular denials across
  wrong/ended/recreated assignment, stale policy, and hidden source.

### Tenant isolation, privacy, data integrity, and source ownership

- **D48-AC051:** Phase 12 remains sole authority for policy boundary/request/
  disposition. D44, Tasks, Notification Center, D45/Phase 17/6, providers,
  analytics, clients, caches, and Inngest cannot create/rewrite/reconcile it by
  convention.
- **D48-AC052:** No cross-Tenant/environment policy cache, boundary sequence,
  source query, worker batch, claim, audit view, receipt lookup, or repair can
  include/classify another Tenant's episode.
- **D48-AC053:** Durable source/audit/handoff facts contain only necessary opaque
  identifiers, closed codes, heads/hashes, and safe attribution; D43 explanation/
  decision, D40 basis, capability/provenance, person/address/body, location, or
  recipient list never enters the cohort contract.
- **D48-AC054:** No settings preview, log, trace, metric, analytics, export,
  search, cache, AI, provider payload, or timing/error difference reveals the
  count/identity/age of pre-boundary pending requests or protected scopes.
- **D48-AC055:** A pre-boundary request's excluded disposition is not a holder/
  coordinator-visible stigma, error, overdue/missed status, priority, performance
  fact, or reason to hide/deprioritize it in Access requests/Tasks.
- **D48-AC056:** Current requests are never copied into a D48 cohort list/table/
  projection merely to record exclusion; absence of runtime is not converted
  into a privacy-widening census or shadow state.
- **D48-AC057:** Every future admitted, excluded, or typed safe-non-admitted
  disposition is immutable and not asynchronously patched after request
  visibility. Partial source/disposition/handoff state is unclaimable and
  treated as an invariant violation, not guessed/repaired from age.
- **D48-AC058:** Request source identity, D48 disposition, and D47 occurrence
  identity are conserved through projection rebuild, task/item regrouping,
  provider reconciliation, executor replay, restore, and schema upgrade.
- **D48-AC059:** Deletion/anonymization/retention/export/backup rules follow the
  authoritative D43/policy/audit purpose. Cohort evidence cannot outlive or
  broaden protected source history by an unreviewed local retention policy.
- **D48-AC060:** Every future authorized audit explanation distinguishes policy
  publication boundary, request source creation, cohort disposition, downstream
  projection/delivery, and human engagement; no derived read model becomes write
  authority or circular synchronization target.

### D49/D50 boundaries, Tasks, Phase 17/6, channels, and executor

- **D48-AC061:** D48 admission contains no D44 recipient/member snapshot,
  current-set selection, recipient generation, destination, or route-change
  outcome. D49 remains required before any reminder member adapter is Live.
- **D48-AC062:** D49 must choose whether recipient binding occurs at request
  creation, reminder occurrence/plan compilation, or live delivery and must
  define additions/removals/continuing/zero/indeterminate/retry behavior; D48
  supplies no default.
- **D48-AC063:** Whatever D49 selects, D48 cohort disposition remains unchanged
  by coordinator configuration/eligibility and D44 route/member changes cannot
  turn a pre-boundary excluded episode into admitted or create a second source occurrence.
- **D48-AC064:** D48 admission contains no cadence instant, elapsed duration,
  calendar date, timezone, DST, holiday, precision, late-usefulness, outage, or
  catch-up fact. D50 remains required before any temporal calculation/job exists.
- **D48-AC065:** D50 cannot use D48 application boundary as reminder clock merely
  by convention. It must separately choose/justify the source time origin for
  admitted new episodes and every calendar/lateness rule.
- **D48-AC066:** Later policy-edit effects on admitted post-boundary episodes—
  Off, re-enable, shorter/longer cadence, correction, rollback, calculated work,
  committed occurrence, prepared/submitted delivery—remain blocked until a
  separate exact decision; D48 establishes no precedent.
- **D48-AC067:** Existing/admitted D44 source-backed tasks are never duplicated,
  completed, reprioritized, reassigned, reopened, snoozed, or given D48 due/
  reminder fields; task creation/age does not classify the cohort.
- **D48-AC068:** D48 adds no Phase 17 census/catalog/manifest key, fact, producer,
  presentation policy, Delivery Step/profile/plan/preference/content/action or
  D45 resend/rekey; cohort admission alone sends/presents nothing.
- **D48-AC069:** Any later in-product/email/push/Slack/Teams/Google Chat/SMS/
  webhook channel independently proves D47 occurrence, D49 member, destination/
  install, consent/preference/suppression, content/privacy, idempotency,
  outcome/accessibility, rollout/shutdown. D48 authorizes none.
- **D48-AC070:** Inngest may later execute identifier-only product-owned claims
  after source commit but cannot publish policy, establish boundary, create
  request/disposition, decide ordering, reconstruct cohort, own idempotency, or
  change source outcome. Removing it leaves source/repair valid.

### Failure, concurrency, idempotency, and recovery

- **D48-AC071:** Same semantic first-On policy save replay returns the original
  policy head/receipt/boundary; changed value/expected head under the same key
  conflicts and never creates another boundary.
- **D48-AC072:** After one semantic D43 request commits, replay returns that
  original request/disposition/receipt beyond any 24-hour transport/executor/
  provider window; product database identity, not cache/event dedupe, owns this
  effect. Before commit, bounded whole-command retry may observe the policy head
  that wins the server-ordered race.
- **D48-AC073:** Concurrent identical first-On saves converge on one committed
  revision/boundary; concurrent changed saves serialize by expected head and the
  loser refreshes rather than overwriting/in-place mutating.
- **D48-AC074:** Concurrent save/create tests prove request-before-policy and
  policy-before-request outcomes, while a stale/serialization/deadlock conflict
  aborts/retries the complete command with no orphan/ambiguous disposition.
- **D48-AC075:** A finite serialization/deadlock retry policy is operational
  only; exhaustion while business order remains unresolved returns a recoverable
  no-write/current-state outcome. Once ordering is resolved, persistent missing/
  unsupported/corrupt optional cadence proof cannot use retry exhaustion to
  strand D43: the valid request commits with typed safe non-admission and no
  cadence/reminder handoff. Neither path guesses disposition, falls back to
  timestamps, or creates partial state.
- **D48-AC076:** Source transaction, complete admitted/excluded/safe-non-admitted
  disposition, and durable outbox/source handoff commit atomically. Immediate
  dispatch failure is recoverable from product records, and duplicate handoff is
  harmless under product claims/semantic identity; safe non-admission produces
  no cadence/reminder handoff.
- **D48-AC077:** A source request may become visible only with one complete
  committed admitted/excluded/safe-non-admitted disposition when the future
  feature is active. An unreleased/incomplete coordination record is
  unclaimable/alertable and has no force-release path.
- **D48-AC078:** Projection/task/item/email/provider/executor partial success,
  failure, delay, replay, or repair never changes D48 source disposition and
  never causes a pre-boundary episode to be scanned/enrolled.
- **D48-AC079:** If an admitted request becomes D43 terminal before future
  reminder processing, D43 source fences govern; D48 does not reopen/reclassify
  it. Exact descendant behavior awaits D49/D50/channel contracts.
- **D48-AC080:** Disaster recovery validates committed policy/request/
  disposition receipts and source lineage before resuming writers/claims; any
  missing/contradictory committed lineage fails closed and is repaired forward
  without timestamp inference, force-enroll, delete/rewrite history, or blind
  resend. This does not convert optional cadence-proof failure during a new
  source command into a D43 blocker; that command uses AC016/AC075 safe
  non-admission once concurrency is resolved.

### Scalability, performance, operations, and observability

- **D48-AC081:** First-On policy publication performs no current-pending census,
  age calculation, cohort enumeration, recipient fanout, reminder schedule, or
  channel preparation and changes no current work.
- **D48-AC082:** Future D43 creation performs only bounded source-policy/
  serialization/disposition work under indexed same-Tenant access and never
  resolves D49 recipients, D50 calendar, or channels inside D48 by convention.
- **D48-AC083:** No browser/client timer, full-table pending scan, periodic age
  job, per-request policy query loop, unbounded lock, local-midnight herd,
  analytics enrollment, or migration batch implements D48.
- **D48-AC084:** Before runtime, production-shaped benchmarks publish exact
  request-concurrency, policy-save, latency, lock/serialization-retry,
  throughput, Tenant-fairness, database-plan/index, and recovery budgets with
  units/datasets; “fast/scalable” and vendor defaults are insufficient.
- **D48-AC085:** The chosen physical serialization strategy proves that absent-
  row first-On publication and every D43 creation contend through the stable
  Tenant/environment/policy-kind namespace; a missing-row, per-grant, or per-
  request lock alone is insufficient. It documents lock order, contention/
  deadlock/serialization handling, timeout/retry budget, and no long-lived
  user-input transaction; changing strategy requires conformance proof but not
  a D48 semantic change.
- **D48-AC086:** D48 authorizes no new runtime metric/log field/event/table/job/
  snapshot/dashboard/alert/warehouse model or person-level age/response/open/
  click/delivery/workload/performance measure. Monitor names are evidence labels.
- **D48-AC087:** Current assurance uses CI/release artifact/semantic tests and
  already-authorized security/incident/support evidence only. A separately
  approved time-bounded research plan is required for any new product study.
- **D48-AC088:** A future runtime separately registers minimized operational
  evidence for boundary/source/disposition/claim invariants with safe units,
  access, retention, cardinality, and response; D48 does not authorize it now.
- **D48-AC089:** Technical logs/traces/executor/provider history remain
  diagnostic only. Durable product policy/request/disposition/audit receipts
  independently explain the business order even after vendor log expiry.
- **D48-AC090:** Operations require no direct database cohort edit, force-
  enroll, timestamp repair, replay-as-new, provider resend, or cross-Tenant
  query; every repair uses exact product command/receipt/reconciler or blocks.

### Migration, rollout, rollback, kill, and repair

- **D48-AC091:** D48 rollout now changes documentation only and runs focused
  no-artifact/semantic checks; no migration/seed/backfill/shadow timer/feature
  flag/canary/current-work query/provider call exists.
- **D48-AC092:** A future implementation cannot activate before D47 evidence,
  D48, D49, D50, later policy-edit/failure/channel decisions, and reconciled
  ADR/OpenSpec/design/task/ticket/test/release evidence are complete.
- **D48-AC093:** Future deployment stages fail-closed readers/denials before
  writers. Cadence/reminder descendants on absent/old/unknown policy/disposition
  are non-executable, while an otherwise valid new D43 source command follows
  the typed safe-non-admission path once ordering is resolved. Old code cannot
  create/interpret new cohort state by convention.
- **D48-AC094:** Existing pending/terminal D43 requests are explicitly historical
  exclusions under D48 and receive no admitted default row, schedule, occurrence,
  member, notification, migration status, or “missed” flag.
- **D48-AC095:** Migration never derives cohort from `created_at`, policy time,
  UUID/sequence order not authored for this purpose, task/item/provider/event/
  worker time, or insertion/restoration time.
- **D48-AC096:** Writer activation ensures every genuinely new D43 episode under
  the feature commits one complete admitted/excluded/safe-non-admitted policy
  disposition. A valid D43 request is not dropped merely because optional cadence
  proof is persistently unavailable after ordering is resolved. Mixed-version
  deployment cannot allow one node to omit/async-patch disposition.
- **D48-AC097:** Future rollout separately gates policy writer, request cohort
  observation, handoff/claims, D49 member compiler, D50 time producer, each
  channel/provider, and reconciler so one can be killed without disabling D43
  source lane/decisions.
- **D48-AC098:** Rollback preserves immutable policy boundaries, request/
  disposition/receipts, D43 history, tasks/items, communication/provider
  evidence, and access. Unknown generations fail closed; no delete/reclassify/
  reset-engagement/automatic correction occurs.
- **D48-AC099:** Repair identifies exact Tenant/environment/policy head/boundary/
  request episode/semantic command/receipt/disposition/handoff. It quarantines
  invalid unsubmitted work and reconciles from source, never by broad age range.
- **D48-AC100:** If an existing episode was wrongly admitted, stop source/
  downstream production, preserve incident evidence, suppress unsubmitted work
  under later channel fences, assess any disclosure, repair source disposition
  forward, and never change access/send an automatic correction or replacement.

### Testability, traceability, accessibility, and production proof

- **D48-AC101:** D48-R1–R30 and D48-AC001–AC120 retain stable identifiers and
  trace consistently into glossary, ADRs, Phase 12/17, OpenSpec, design, tasks,
  GitHub tickets, implementation, tests, migration, runbooks, and release proof.
- **D48-AC102:** Positive public-seam tests prove: pre-boundary pending remains
  excluded/recoverable; post-boundary genuine creation records applicable head/
  disposition; persistent optional-proof failure commits a valid request with
  typed safe non-admission and no reminder handoff; exact committed replay
  returns the same outcome; terminal successor evaluates fresh.
- **D48-AC103:** Boundary tests deterministically interleave absent-row first-On
  publication and request creation through their stable Tenant/environment/
  policy-kind namespace at before/read/commit points and prove only the two legal
  serial outcomes or complete abort/retry—never per-grant/missing-row-only or
  timing-sleep-based probabilistic tests.
- **D48-AC104:** Negative tests reject every timestamp/UUID/cache/projection/
  task/item/email/provider/executor/import/restore/analytics classification and
  every current-work/manual/support/AI enrollment path.
- **D48-AC105:** Authorization tests cover same/wrong Tenant/environment,
  active/ended/recreated assignments, exact `permissions.manage_grants` plus
  registered policy purpose, scope/ceiling/floor/epoch/heads, requester limits,
  service/owner/support/import/AI paths, and uniform non-oracular denial.
- **D48-AC106:** Database tests cover composite same-scope integrity, invalid/
  null/mutable disposition, duplicate episode, `USING`/`WITH CHECK`, forced RLS,
  security-definer/search-path/grants, privileged parity, transaction rollback,
  and unique identity excluding policy version.
- **D48-AC107:** Replay/recovery tests cover duplicate/lost policy response,
  duplicate/lost request response before/after On, changed semantic input,
  transient serialization retry exhaustion, persistent cadence-proof safe
  non-admission, outbox dispatch failure, crash at every commit boundary,
  restore/replication, and committed replay beyond 24 hours.
- **D48-AC108:** UX/comprehension tests cover authorized manager, manager without
  purpose, coordinator, holder, no-access user, long localized/RTL copy,
  keyboard/screen reader, 320px/400% zoom, touch, low bandwidth, stale/lost save,
  and accurate new-only/no-due/no-access understanding.
- **D48-AC109:** Architecture tests prove no D49 recipient resolver, D50 time
  calculator, Phase 17 key/step, D45 reuse, task due/reminder, Inngest timer,
  current-work API, or generic cohort engine can import/call D48 before its gate.
- **D48-AC110:** Production-shaped proof publishes exact concurrency/load/
  latency/retry/lock/index/fairness budgets and demonstrates mixed-version,
  failover, executor removal, rollback, no-scan policy save, source recovery,
  incident containment, and exact repair outcomes.

### Monitor discipline, evidence quality, and D49 boundary

- **D48-AC111:** Every named monitor below has signal, threshold, owner, and
  response and is an acceptance/release label—not authorization for telemetry,
  table/event/job/dashboard/alert, person tracking, or automatic action.
- **D48-AC112:** No-artifact release audit fails on any D48 runtime/schema/
  config/key/API/UI/event/job/provider/telemetry placeholder and blocks/removes
  it rather than legitimizing it with Off/feature flag.
- **D48-AC113:** Timestamp-classification audit fails on any cohort decision or
  repair using source/policy/commit/UUID/projection/task/item/provider/executor/
  browser time rather than recorded source disposition.
- **D48-AC114:** Existing-episode audit fails on any pre-boundary episode admitted,
  scanned, scheduled, marked missed, current-applied, or caught up through D48;
  any incident is contained/repaired without broad mutation.
- **D48-AC115:** Replay audit fails on any duplicate/lost-response/reconciliation/
  restore changing original request disposition or creating a successor merely
  because current policy differs.
- **D48-AC116:** Authority/privacy audit fails on any invented capability,
  caller-controlled policy/cohort fact, cross-Tenant scope, protected detail,
  current census, timing oracle, individual score, or privileged-path bypass.
- **D48-AC117:** Decision-gate audit fails on any policy-edit rule, D49 recipient
  binding, D50 clock/calendar, channel, or executor behavior implemented/inferred
  through D48 before its decision.
- **D48-AC118:** Research/release evidence labels verified repository/external
  facts, reasonable inference, product judgment, assumption, and unresolved
  unknown separately; vendor behavior is never copied as Core authority.
- **D48-AC119:** D49 is the one next unresolved decision: when one admitted
  reminder occurrence binds D44 recipients and how route/eligibility changes
  before/after that point affect descendants without multiplying source truth.
- **D48-AC120:** D48 succeeds only when first activation is exactly new-source-
  commit-only, existing work is unchanged with no catch-up, concurrency/replay
  outcomes are precise and implementation-neutral, current UX is quiet, and
  D49/D50/edit/channel choices remain visibly gated.

## Named monitors without new telemetry authority

The labels below are release/audit/incident signals, not runtime metric names.
D48 authorizes no telemetry, log field, event, table, job, snapshot, dashboard,
alert, current-work query, person tracking, reminder, or automatic response. CI/
release audits inspect development artifacts; security/support signals use only
existing authorized intake. Any future runtime monitoring requires a separate
reviewed contract after D48–D50 and may only observe product-owned minimized facts.

| Signal                                 | Threshold                                                                                                                                                                                                                          | Owner                               | Required response                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D48-NO-ARTIFACT-RELEASE-AUDIT`        | Any D48 field/table/enum/key/step/plan/preference/flag/API/event/job/provider/UI/telemetry/runtime artifact now                                                                                                                    | Architecture + affected owner       | Block release; remove artifact/compatibility promise; verify no data/work/provider effect; retain docs only.                                                                                                  |
| `D48-TIMESTAMP-CLASSIFIER-AUDIT`       | Any cohort decision/repair using `created_at`, policy/effective/commit time, UUID, insertion/projection/task/item/provider/executor/browser time                                                                                   | Phase 12 + Data Integrity           | Stop writer/query, preserve evidence, restore source-recorded disposition, repair deterministic tests, and remove inferred state.                                                                             |
| `D48-EXISTING-EPISODE-ADMISSION-AUDIT` | Any pre-boundary request enrolled, scanned, scheduled, marked missed, current-applied, caught up, or offered an exception through D48                                                                                              | Access Product + Phase 12           | Fence producer/descendants, quarantine unsubmitted work, assess disclosure, repair exact source disposition, and re-prove no-current invariant.                                                               |
| `D48-NONLINEARIZED-CREATION-GATE`      | Any design allows absent-row first-On save and request creation to avoid one stable Tenant/environment/policy-kind namespace, or to commit without one old/new serial result or complete abort/retry                               | Architecture + Database + Phase 12  | Reject design/writer; choose/prove a serialization mechanism shared beyond a missing row or per-grant/request lock; add deterministic race/rollback tests before reconsideration.                             |
| `D48-CADENCE-PROOF-STRANDS-D43-AUDIT`  | Any otherwise valid D43 request is blocked, dropped, or left retrying after concurrency is resolved solely because optional cadence proof is missing, unsupported, corrupt, or unprovable                                          | Phase 12 + IAM + Data Integrity     | Restore source availability, commit the request through the reviewed typed safe-non-admission path with body-free evidence and no reminder handoff, prevent later age-in, and add exact failure/replay proof. |
| `D48-REPLAY-RECLASSIFICATION-AUDIT`    | Duplicate/lost-response/outbox/restore/reconcile/import changes an episode's original disposition or creates a successor because current policy differs                                                                            | API + Data Integrity + Phase 12     | Disable blind replay, return original receipt, quarantine duplicate work, repair semantic identity/lineage, and add >24h replay proof.                                                                        |
| `D48-SOURCE-HANDOFF-ATOMICITY-GATE`    | Request exists without one complete admitted/excluded/safe-non-admitted disposition and source receipt/handoff, or any handoff exists without its committed request/disposition; safe non-admission has a cadence/reminder handoff | Data Integrity + Workflow Platform  | Stop claims, contain partial data, repair transaction/outbox invariant forward, suppress the invalid reminder handoff, and never force-release or infer from age.                                             |
| `D48-AUTHORITY-DRIFT-AUDIT`            | New capability or policy edit accepted without current same-Tenant `permissions.manage_grants` + registered purpose/scope/ceiling/floor/assignment/epoch/head                                                                      | IAM + Security                      | Block/fence command, audit affected receipts, restore D44 authority boundary, and add privileged-path negative proof.                                                                                         |
| `D48-PRIVACY-CENSUS-AUDIT`             | Any first-On preview/log/timing/export/AI exposes current pending count/identity/age/protected detail or individual performance                                                                                                    | Privacy + Access Product            | Remove query/output, assess exposure, purge derived data where lawful, restore nonnumeric already-waiting-unchanged copy, and prohibit person scoring.                                                        |
| `D48-FALSE-IMPACT-UX-AUDIT`            | Any visible/programmatic copy implies existing requests included, due/overdue/access changed, reminder scheduled/sent, or **new** means unread/new-to-me                                                                           | UX + Accessibility + Access Product | Block surface, correct copy/semantics, run role/locale/accessibility comprehension proof, and do not add a count/action workaround.                                                                           |
| `D48-PREMATURE-D49-GATE`               | Any recipient binding/snapshot/current/route/zero/indeterminate/member behavior implemented or implied before D49                                                                                                                  | IAM + Notifications/Tasks           | Freeze/remove adapter, preserve D44 behavior, ask/record D49, and verify no cohort/source reclassification.                                                                                                   |
| `D48-PREMATURE-D50-GATE`               | Any cadence arithmetic/timezone/calendar/DST/lateness/catch-up job/field inferred from D48 boundary before D50                                                                                                                     | Phase 12 + Data Platform + SRE      | Disable/remove temporal artifact, verify no sends/schedules, ask/record D50, and restore cohort-only semantics.                                                                                               |
| `D48-POLICY-EDIT-EFFECT-GATE`          | Any Off/re-enable/shorter/longer/correction/rollback effect on admitted post-boundary work implemented by analogy to D48                                                                                                           | Access Product + Architecture       | Freeze/remove behavior, preserve immutable inputs, require a separate decision, and re-prove one-occurrence/source ownership.                                                                                 |

## Migration, rollout, rollback, kill, and repair

### D48 rollout now

1. Record D48's exact new-source-commit-only decision, requirements, acceptance
   criteria, category review, monitor discipline, and D49 boundary in the
   decision log/governing docs.
2. Reconcile D43–D48, CONTEXT, ADR-0026/0027/0183/0184, Phase 12/17, and
   workflow OpenSpec so none implies timestamp scans, current-work application,
   schema/lock choice, policy-edit effects, recipient binding, or a clock.
3. Run focused no-artifact/semantic/identifier checks only. D48 activates no
   policy, boundary, migration, cohort, writer, channel, executor, or telemetry.
4. Ask D49 next, then D50; decide later policy-edit/failure/channel semantics
   before executable design.

### Future implementation sequence, only after every gate

1. Close D47 evidence, D48, D49, D50, later policy-edit/failure/channel decisions.
2. Reconcile glossary/ADR/OpenSpec/design/tasks/tickets/tests and choose a
   physical serialization/persistence design that conforms to D48 without
   changing its behavioral contract.
3. Add fail-closed readers/denials and mixed-version compatibility before
   policy/request cohort writers; unknown/absent/incomplete evidence is non-
   executable for cadence/reminder descendants, while valid D43 source creation
   preserves typed safe non-admission after resolved ordering.
4. Add immutable first-On publication/receipt/boundary and canonical D43 source-
   creation policy observation/disposition plus same-transaction durable handoff.
5. Prove both exact race orders, abort/retry, response loss, idempotent replay,
   restore, cross-Tenant denial, and no current census/backfill before enabling writers.
6. Add D49 member compilation, D50 time, and one reviewed Phase 17/6 channel in
   separate stages. None may rewrite D48 source disposition.
7. Complete production-shaped load/contention, accessibility/comprehension,
   privacy/security, outage/recovery, mixed-version, kill/rollback/repair proof.
8. Activate first On only through the exact D44-authorized policy save with
   new-only copy. Existing requests remain unchanged; no canary/backfill send.

### Migration and upgrade rules

- D48 has no current schema/data migration; absence is not a cohort value to seed.
- Existing pending/terminal D43 history is excluded, not admitted/backfilled,
  scheduled, marked missed, or copied to an exclusion table merely for D48.
- Future migration never derives membership from timestamps, UUIDs, row insertion,
  tasks/items/emails/providers/workers, current policy, or an age scan.
- Restored/replicated/imported existing episodes preserve original source identity/
  receipt/disposition; deployment time does not become creation.
- Readers/deny paths precede writers. One compatible source writer is required
  during rollout; old code cannot omit/async-patch the disposition for new requests.
- Policy/reminder version is immutable input/hash evidence, not source occurrence
  uniqueness; upgrades cannot use version changes to mint another occurrence.

### Rollback and kill

- D48 now has no runtime/flag/data to roll back. Documentation rollback cannot
  revive D46-prohibited reminders or current-work enrollment.
- Future kill independently stops policy writer, request cohort observation,
  handoff claims, D49/D50 producers, and each channel while preserving D43 source
  lane/decisions, policy/request/disposition receipts, tasks/items, and access.
- Rollback never reclassifies existing/new episodes, deletes boundary/history,
  resets engagement, fabricates completion/read, changes access, or sends a
  correction/duplicate.
- Later policy-edit behavior follows its separate decision; operators cannot
  improvise re-enable/reschedule/cancel semantics during rollback.
- Provider-accepted messages are non-retractable and recorded honestly; D48
  never authorizes blind replacement.

### Repair

- Identify exact Tenant/environment/policy head/boundary/request episode/semantic
  command/receipt/disposition/handoff; never mutate a broad date/age range.
- Quarantine unsubmitted descendants, preserve immutable/source/incident/provider
  evidence, and rebuild projections only from the authoritative disposition.
- If already-committed authoritative source lineage is absent/contradictory,
  fail closed for descendants and repair forward through a reviewed product
  command/migration; do not guess from time or force-enroll. During a new source
  command, persistent optional cadence-proof failure after resolved ordering
  instead preserves D43 through typed safe non-admission.
- A wrong pre-boundary admission is a data-integrity/security incident, not a
  request to delete/recreate/rekey the episode. Preserve lineage and prevent any
  second occurrence.
- No direct SQL membership edit, support/AI exception, generic import, provider
  resend, fabricated read/completion, or access mutation is a valid repair.

## Ruthless synthesis

### Resolved before D48 is recorded

1. **First activation is future-only.** Existing pending D43 episodes are
   excluded with no catch-up/current-work operation; ordinary recovery remains.
2. **“New” is a source-commit fact.** It is not request age, UI recency,
   notification unread, task assignment, or row insertion after deployment.
3. **The boundary is logical.** Policy publication and request creation must
   share a stable Tenant/environment/policy-kind namespace and yield one serial
   old/new order or abort/retry; D48 freezes no lock/schema.
4. **Cadence never strands D43.** Request/receipt/applicable policy input/
   disposition/durable source handoff commit atomically. After ordering is
   resolved, persistent optional-proof failure commits typed safe non-admission
   with no cadence/reminder handoff or later age-in.
5. **Committed replay is stable.** Duplicate/lost-response/recovery returns the
   original committed episode/disposition even if policy changed; a bounded
   pre-commit retry may observe the winning server policy head.
6. **Lineage survives.** Restore/import/replay preserves historical identity;
   only a lawful terminal successor is a genuinely new episode.
7. **Authority reuses D44.** No D48 capability; same-Tenant Tenant-wide
   `permissions.manage_grants` plus registered policy purpose and current
   scope/ceiling/floor/assignment/epoch/head govern policy save.
8. **No implementation now.** No field/key/UI/job/telemetry/placeholder is
   added before all feature gates.
9. **Unresolved choices remain separate.** Later policy edits, D49 recipients,
   D50 clock, channels, and executor shape are not inferred.
10. **UX is quiet/exact.** Future first-On copy says future requests only,
    already-waiting work unchanged, and no due-date/access effect, without a
    census or current-work control.

### Requirements to carry into specification and design

- D48-R1–R30, D48-AC001–AC120, owner/invariant/lifecycle/race matrices,
  monitor discipline, rollout/rollback/repair, and D49 boundary.
- Behavioral conformance for one serial old/new result without prematurely
  mandating lock/isolation/schema, plus atomic source/handoff and immutable receipt.
- Same-scope DB integrity, default-deny/forced RLS, `USING`/`WITH CHECK`, trusted
  attribution, expected heads, privileged parity, durable semantic idempotency.
- Explicit no timestamp/UUID/projection classification, no current census/
  backfill/action, no new capability, no new telemetry, no D49/D50 artifact.
- User-visible new-only/no-current/no-due/no-access/no-channel truth and complete
  accessibility/comprehension proof.

### Implementation safeguards required now

1. Keep all D48 runtime/schema/config/UI absent.
2. Keep D43 idempotency/source lane and D44/D45 projections independent of age.
3. Reject timestamp/current-policy scans and current-work enrollment proposals.
4. Carry D48 identifiers/gates into governing docs; use CI/release audits only.
5. Block every writer until D49/D50/edit/channel decisions and implementation-
   neutral concurrency proof are complete.

### Risks permitted only under named monitoring

- **Speculative artifact:** `D48-NO-ARTIFACT-RELEASE-AUDIT`; threshold any;
  owner Architecture; response block/remove/re-prove zero.
- **Wrong classifier:** `D48-TIMESTAMP-CLASSIFIER-AUDIT`; threshold any;
  owner Phase 12 + Data Integrity; response stop writer and restore source fact.
- **Existing enrollment:** `D48-EXISTING-EPISODE-ADMISSION-AUDIT`; threshold any;
  owner Access Product + Phase 12; response contain/repair/assess disclosure.
- **Ambiguous concurrency:** `D48-NONLINEARIZED-CREATION-GATE`; threshold any
  design/run without one serial result; owner Architecture + Database + Phase 12;
  response reject/fix/retest before activation.
- **Optional proof strands source work:** `D48-CADENCE-PROOF-STRANDS-D43-AUDIT`;
  threshold any valid D43 request blocked after ordering is resolved; owner
  Phase 12 + IAM + Data Integrity; response commit typed safe non-admission,
  suppress reminder handoff, prevent age-in, and add failure/replay proof.
- **Premature next decision:** `D48-PREMATURE-D49-GATE`,
  `D48-PREMATURE-D50-GATE`, or `D48-POLICY-EDIT-EFFECT-GATE`; threshold any;
  owner named domain; response freeze/remove and ask the exact decision.

## Exact final D48 decision to record

> D48 adopts Option 1 with required safeguards: if a later D47 cadence feature
> earns activation, the first non-Off Tenant policy may admit only a genuinely
> new D43 request episode whose authoritative Phase 12 source-creation commit
> linearizes after the policy's trusted effective boundary. Every request
> episode committed and pending before that boundary remains excluded for that
> episode, with no scan, current-work application, backfill, catch-up, missed-
> reminder state, exception, or later reclassification.
>
> The absent-row first-On publication and every D43 creation share one stable
> Tenant/environment/policy-kind serialization namespace and must have one
> explainable serial business order; a missing-row, per-grant, or per-request
> lock alone is insufficient. The request source transaction atomically observes/
> records the server-owned applicable policy input/cohort disposition and commits
> request/receipt/durable identifier-only source handoff. A transient unresolved
> serialization conflict aborts/retries the whole command and commits nothing.
> No timestamp, UUID, cache, projection, task/item/email/provider/executor time,
> restore, or query-time age decides membership. D48 requires this behavior but
> does not prescribe a lock, isolation level, table, column, or transaction API.
>
> Cadence is optional and cannot strand D43. Once concurrency is resolved,
> persistent missing, unsupported, corrupt, or otherwise unprovable cadence
> evidence commits the lawful request/receipt/source handoff with a typed safe
> **cadence not admitted** disposition and durable body-free operational
> evidence, creates no cadence/reminder handoff, and never ages in later.
>
> The policy head is trusted server-observed context, never caller or idempotency
> input. Before commit, a bounded whole-command retry may observe the head that
> wins the server order. Once one D43 episode commits, semantic replay returns
> its original request/receipt/disposition even if policy later changes.
> Restoration preserves historical lineage.
> A later lawful request after a terminal predecessor is a new episode evaluated
> at its own source commit; it does not reclassify/reopen the predecessor.
>
> D48 creates no runtime/schema/config/key/job/UI/telemetry artifact now and no
> new capability. Future policy management reuses D44's intended Phase 12
> boundary: current same-Tenant Tenant-wide `permissions.manage_grants` plus registered policy-management
> purpose/scope/ceiling/floor/assignment/epoch/head. Existing work remains in
> the complete source lane/task/item paths and D45 remains initial email only.
>
> Future first-On UX says **Applies only to access review requests created after
> you save. Requests already waiting aren't included. This doesn't set a due
> date or change access.** It shows no numeric current census/count,
> checkbox, apply action, backlog grid, date, or channel promise. Success says
> **Saved for future access review requests. Requests already waiting have not
> changed.** Later policy-
> edit effects remain undecided; D49 decides recipient binding/route churn and
> D50 decides clock/calendar/lateness. D48 implements none by implication.

## D49 — When should the one reminder bind its D44 recipients?

### Why this needs a separate decision

Suppose Ana and Ben are the D44 Access request coordinators when a genuinely
new D43 request is created. Before its possible source reminder occurrence,
Ana's assignment ends and Carla becomes a coordinator. D44 already gives Carla
the normal source-backed task and required responsibility-update attention for
the current work. D49 must now decide whether the one courtesy occurrence is
for Ana and Ben, Ben and Carla, or an audience that keeps changing as each
delivery surface acts.

That choice affects whether Core reaches the people who currently own the work,
surprises former staff, duplicates Carla's fresh D44 attention, or lets email,
push, chat, and in-product surfaces disagree. It must be settled once in the
source contract rather than left to a notification provider or executor.

Microsoft Entra demonstrates a defensible snapshot model: a review instance
captures reviewers when the instance begins, and later owner changes apply to a
later instance. SailPoint and Okta likewise expose stable review assignment and
explicit reassignment. Those are useful comparators, but they are not Core's
authority. Core's stronger domain fact is D44's **current responsibility**:
former coordinators must not continue receiving sensitive work, replacements
must be able to act, and D44 already models reassignment attention separately.
The best Core boundary therefore seals one complete current D44 cohort at one
source occurrence, then permits only safety narrowing.

[Microsoft Entra access-review snapshot behavior](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review),
[SailPoint campaign snapshot and reassignment](https://documentation.sailpoint.com/saas/help/certs/starting_campaign.html),
[SailPoint certification reassignment](https://documentation.sailpoint.com/saas/help/certs/config_reassignment.html),
[Okta campaign assignment/reminder notifications](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/create-user-campaign.htm)

Every option below preserves these invariants:

- one source occurrence per exact request episode and no second Tasks Hub task;
- the complete shared Access requests lane and D44 task/current assignment remain
  work truth;
- the requester, former staff, ended/recreated assignments, cross-Tenant people,
  and anyone failing current purpose-bound authorization receive nothing;
- downstream presentation or provider submission may remove/suppress a sealed
  member after fresh checks but may never add, replace, broaden, or reroute one;
- `proved_zero` is a valid terminal empty member result; `indeterminate` is not
  zero, releases nothing, uses no fallback, and may retry only the same product
  occurrence until a separately defined usefulness fence ends it; and
- D49 activates no reminder and chooses no D50 clock behavior or channel.

### Option 1 — seal the current D44 cohort at the source reminder occurrence — recommended

At the one possible source reminder occurrence, Phase 12 resolves and seals one
atomic unordered zero-to-three-member set from the exact then-current D44
responsibility generation. Ana is excluded because her assignment ended; Ben
and Carla may be included because they currently own the work. The source
records the evaluated generation and member evidence once. Each irreversible
presentation or provider submission rechecks current assignment, authorization,
destination, preference/consent, and suppression and may only narrow that set.

If complete proof returns no eligible members, Core seals `proved_zero`; a later
route change cannot resurrect the occurrence. If proof is incomplete or
contradictory, Core records no guessed set, releases nothing, and retries only
the same occurrence. No channel independently re-resolves the route.

**UX/impact:** the courtesy attention follows the people responsible at the
source occurrence, avoids former staff, gives every channel one explainable
audience, and preserves the shared lane when nobody can be safely addressed.
The explicit tradeoff is that Carla may receive both her normal D44
responsibility-update attention and this courtesy occurrence. D49 must
acknowledge that possible duplicate pressure; it does not add another
eligibility rule before the clock decision.

### Option 2 — bind the request-creation D44 cohort, then narrow only

The source preserves the exact D44 generation from D43 request creation. At the
possible occurrence, ended or ineligible original members are suppressed, but
later replacements are never added. In the example, Ana is suppressed, Ben may
remain, and Carla never joins this occurrence even though she now owns the work.

**UX/impact:** this produces the cleanest historical explanation and avoids a
second nudge for Carla. It can also miss the only people currently able to act,
and a request created in lane-only mode can never acquire a reminder recipient.
Mandatory later narrowing prevents messaging former staff, but cannot repair a
stale creation-time audience. This is the strongest alternative.

### Option 3 — continuously re-resolve current responsibility through delivery

Each in-product or external delivery path independently resolves the current
D44 route. Added coordinators may join one channel while removed coordinators
disappear from another.

**UX/impact:** it maximizes route freshness at each attempt but makes one
occurrence mean different audiences, couples source responsibility to provider
timing, and makes audit, privacy, and idempotent recovery brittle. A
provider-accepted message cannot be recalled after a later route change.

### Recommendation and exact question

**My recommendation is Option 1 — seal one atomic current D44 cohort at the
source reminder occurrence, then narrow only.** It best matches Core's
authoritative current-responsibility model while preserving a stable,
cross-channel, auditable audience. It handles former staff and lane-only
recovery safely, distinguishes proved zero from indeterminate, and avoids a
delivery system silently becoming a routing authority. Option 2 is respectable
and quieter after reassignment, but can withhold the reminder from every person
who currently owns the work. Option 3 is too mutable.

Which D49 recipient-binding policy should Core record: **Option 1 — seal the
current D44 cohort at the source reminder occurrence, then narrow only**,
**Option 2 — bind the request-creation D44 cohort, then narrow only**, or
**Option 3 — continuously re-resolve current responsibility through delivery**?
You may amend any option.

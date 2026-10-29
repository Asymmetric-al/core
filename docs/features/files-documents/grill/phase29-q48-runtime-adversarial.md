# Phase 29 Q48 — Independent runtime, data and recovery adversarial review

2026-10-25, Asia/Bangkok. Conrad selected **A: automatic reminders alongside deliberate staff reminders** and requested a full adversarial review. Q01–Q47 are ratified; Q48's amendments below remain proposed until the complete review is ratified. The canonical 28-term glossary is unchanged. Only this work note is authored. No native implementation, repository test run, hosted SQL, private data access, provider configuration, actual message or formal publication is performed.

## Outcome and smallest complete model

Support one ordinary-request reminder purpose with two initiation modes. The ordinary source owns actual recipient work, enrollment, current usefulness and an immutable occurrence/result. A bounded source policy owns automatic timing and its controls; P17/P6 own the qualified material, complete plan release and delivery. A request-level reservation coordinates manual and automatic admission. A worker lease is only transport coordination, never the business identity, source permission or final result.

Do not add a second workflow engine, arbitrary schedules, per-item reminder queues, a separate authorization policy decision point, mandatory Realtime, new provider, generic notification center or timer-driven request completion. The actual existing seams do not yet demonstrate this ordinary capability. In particular, reusing the financial approval sender verbatim would copy the wrong source, recipient and recovery assumptions.

The coordinated policy proposes automatic **Off until deliberate guarded activation**, an interval of **7 calendar days**, a maximum of **3 automatic reminders per issued request**, tenant choices bounded to **1–30 calendar days** and **1–10 automatic reminders**, a local `HH:mm` default of **09:00** in a known source-qualified IANA zone, and **24 elapsed hours between distinct Q48 reminder submissions** across both modes. Email is the first outward channel, with no new bell or SMS. These numbers are proposed product judgments, not vendor limits, empirical optimums or inherited GEN-06/P12 policy. The exact scheduling/counting readback and deterministic illustration below replace the earlier exploratory elapsed-day/refundable-call proposals.

## Current source and technical evidence

Root freshly rechecked live develop at **fdec2ba2f13d23db38a0d0173873507f37ce41bd**, unchanged from the initial Q48 research. This review fetched the critical files at that exact pin. Historical local HEAD **3d85897ebf1515008ef5c676b1c58a15422fb9ab** is not treated as live runtime. No pull/reset occurred. The complete initial source census and founder/owner anchors remain in `work/phase29-q48-runtime-research.md`.

| Evidence                                                                                                                                                                                                            | Fresh read and actual implication                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 `packages/api/src/admin/contribution-operations/approval-notifications.ts:147–191,723–879`, blob `6c4d9841530d3f10ccb879cd53b5d1531e757f83`                                                                     | Actual contribution-correction SLA evaluation uses pending status, created-at/last-reminder elapsed hours and current financial-approver settings. The processor scans the tenant's pending correction rows and computes `round-N`, stamps/plans, then attempts email. This is a financial staff-approval seam, not ordinary recipient work, a bounded Q48 candidate scheduler or P6 native qualification.                                         |
| E02 `supabase/migrations/20260611150000_contribution_approval_notifications.sql:429–563`, blob `2a63fab0df8c178dd2db5c2fa5ade1d6f4c56400`                                                                           | One SQL function locks the exact pending tenant correction request, inserts notification rows using a tenant/dedupe conflict target and stamps reminder/escalation time. Service-only EXECUTE/table grants are explicit. This proves that the existing operation was designed with a one-call atomic boundary; it does not qualify Q48 recipient resolution, original plan/material or every deployed effective role.                              |
| E03 `packages/api/src/admin/contribution-operations/approval-notification-email.ts:155–269`, blob `b103efaee1195104ad902377117e6d35991f9621`                                                                        | Current helper loads tenant email settings, looks up profile emails, and calls `sendEmail` best-effort with approval-specific keys and success/failure counters. It is not a participant/no-Party source resolver, original destination pin, immutable sealed submission or complete P17 outcome classifier. This is a transplant risk, not an assertion that financial-purpose behavior is defective merely because it differs.                   |
| E04 `supabase/migrations/20260526193000_mission_control_tasks.sql:59–66,109–139`, blob `65045c05c4702a7f2b652da9083a4e00e0bcb676`                                                                                   | A task reminder schema has remind-at and pending/sent/cancelled state, RLS enablement and revoked browser writes/service grants. These three labels are insufficient to infer ordinary scheduled, prepared, possibly submitted, unknown and stopped outcomes. No inspected ordinary reminder producer is supplied by this table.                                                                                                                   |
| E05 `packages/api/src/workflows/events.ts:1–94`, blob `7a3de951bdc513c721d64560a20563c7111c468c`                                                                                                                    | Actual strict event envelope carries tenant, workflow/version, subject and limited safe routing metadata; declared producers are smoke, donation recovery, Stripe and inbound email. A transport envelope is not an ordinary reminder meaning or authority. Do not put bodies, private file names or credentials into it.                                                                                                                          |
| E06 `packages/api/src/identity/tenant-guard.ts:1–99`, blob `06133e276392d54dd00f188ae26331f7637e1988`; `supabase/migrations/20261024150000_tenant_guard.sql:1–255`, blob `a1bdb4b2475d1f5ab1ceb9666d5f877d9fca8a35` | Fresh full reads confirm only acquire/release workflow claims are allowlisted. The SQL uses a non-owning, NOLOGIN/NOBYPASSRLS definer role, transaction-local tenant context, coarse policy and restricted invoker wrappers; old unguarded overload is removed. One guarded RPC is atomic. A JavaScript callback with multiple RPCs is not one transaction, and this guard is not the fine-grained P12 decision or adoption of all reminder paths. |
| E07 P17:2368–2424 and the exact three-cause table                                                                                                                                                                   | A committed sealed attempt records `Submission may have begun` before the first external byte. Timeout after that boundary can remain unknown. Only the closed three causes allow at most two follow-up calls after the initial call, total, with unchanged envelope/key and all current fences/deadlines. These are transport calls, not reminder counts.                                                                                         |
| E08 `openspec/specs/platform-boundaries/spec.md:428–453` and active `openspec/changes/sitestacker-parity/specs/platform-boundaries/spec.md:1–59`                                                                    | Guarded activation requires actual `automation:manage`, declarative configuration, stored synthetic preview, non-authoritative test and activity log. Tests cannot create real business communication effects. Governed actions use an exact Live P17 source binding and complete P6 release. The compact source policy must preserve this without making the whole Workflow Studio a prerequisite.                                                |
| E09 P12:1464,1543–1550,1646–1650; Q09/Q46/Q47                                                                                                                                                                       | One fine-grained PDP/current context, prescribed coarse tenant defense and governed-read budget remain binding. Recipient work, requested-by target, access admission, receipt, checking, acceptance and completion remain different facts. No earlier decision selected this reminder program.                                                                                                                                                    |

I reread root/API/Supabase instructions, backend/data-access rules, the Supabase skill and Postgres best-practices skill. The skill's blanket shorthand about omitted `WITH CHECK` and `SECURITY DEFINER` is **not** used as a finding: actual PostgreSQL policy inheritance and effective function role/ownership determine behavior. No new universal FORCE-RLS setting is prescribed; inspect and enforce the exact P12 posture and real deployed privileges.

Current primary documentation was resolved and queried through Context7 for PostgreSQL 17, Supabase and Inngest, with primary-page readbacks:

- [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) and [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html): check effective old-row/new-row predicates, policy composition and actual roles; omitted `WITH CHECK` can inherit `USING`. Owner/BYPASSRLS behavior is role-dependent.
- [PostgreSQL locking](https://www.postgresql.org/docs/17/explicit-locking.html) and [date/time functions](https://www.postgresql.org/docs/17/functions-datetime.html): row serialization is explicit; civil-time conversions and elapsed time differ; transaction-start time is not a fresh post-lock submission timestamp.
- [Supabase query optimization](https://supabase.com/docs/guides/database/query-optimization) and [RLS performance](https://supabase.com/docs/guides/database/postgres/row-level-security-performance): measure actual role/query plans and scanned rows; indexed filters do not themselves prove a performance target or free operation.
- [Inngest idempotency](https://www.inngest.com/docs/durable-execution/guides-and-advanced/idempotency), [cancellation](https://www.inngest.com/docs/durable-execution/guides-and-advanced/cancellation) and [retry behavior](https://www.inngest.com/docs/durable-execution/guides-and-advanced/error-handling/retries): event/function deduplication is finite; a side effect can succeed before its saved step result; cancellation cannot undo an executing side effect. None grants permanent exactly-once business delivery.
- The current [Supabase changelog](https://supabase.com/changelog) was scanned. Its [Postgres minor-version implications](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes), [Realtime schema restrictions](https://supabase.com/changelog/realtime-schema-locked-down-against-modification) and [HTTP TLS transition](https://supabase.com/changelog/cbc-tls-ciphers-deprecated) require ordinary release compatibility checking where applicable. No hosted version, affected extension or client failure was assumed or queried; no new extension, upgrade or Realtime dependency is justified by Q48.

## Exact proposed amendments

### C01 — One reminder meaning and actual remaining recipient work

The first cohort is ordinary issued requests with independently qualified current recipient work and a useful lawful recipient action. Waiting for staff checking, review, acceptance or deferred Q22 completion is not missing recipient work merely because the request is unfinished or Requested by passed. A real correction, addition or withdrawal may change the predicate through its source. Reminding cannot waive, accept, close, reopen or change access. Fix one finite original source work basis per occurrence; current narrowing may preserve usefulness, but later unrelated/new work must not retarget or revive a stopped old occurrence.

### C02 — Guarded, bounded automatic policy and real staff controls

Automatic availability starts Off until an authorized, reviewed activation under the applicable guarded-automation contract. Store exact published policy revision/activation epoch and actual source enrollment. Apply new defaults prospectively to genuinely new eligible requests; older requests require deliberate qualified enrollment, never a backlog scan that guesses On. Authorized manual Send reminder remains available when automatic initiation is Off, subject to its own current source/P12/channel restrictions and shared noise guard. Source/request pause and tenant automatic Off are explicit automatic controls; they do not grant or remove unrelated communication/source authority. The exact recipient may Stop automatic reminders and deliberately allow them again only under the newly qualified request-scoped action/proof; staff/configuration cannot clear that recipient stop, an email scanner GET cannot mutate it, and allowance cannot enroll a plan or override staff/tenant/contact stops. Configuration changes need expected current basis; a stale pre-Off command cannot sneak through after On returns.

### C03 — Explicit time, courtesy anchor and no timer reset loopholes

The program's calendar interval is independent of Requested by and access expiry. Nominal due is the anchor's local civil date plus N days at the captured local `HH:mm` in the captured source-qualified IANA zone. Choose the later occurrence in a fold and the first valid local time at or after the nominal time in a gap. Due must also be at least 24 elapsed hours after a fresh enrollment/resume/new-work anchor and after the latest Q48 possible-provider-call fence; if necessary advance to the next normal daily slot. The automatic opportunity is the half-open interval `[resolved slot, slot + 60 elapsed minutes)`. Slight lateness within it is valid; equality with its end is expired. Initial and permitted follow-up calls must fit that original window and all earlier P6/material/action limits. A missed expired opportunity coalesces to one next future normal daily slot, never enumerated backlog calls. Manual material has a 24-hour class ceiling; automatic material has that ceiling intersected with the earlier one-hour opportunity. Retry cannot extend either.

Use trusted current time after serialization waits, not caller/browser time or transaction-start `now()` carried through a long wait. Missing/unknown zone/time basis is unresolved, not the browser/UTC/default tenant by guess. Partial receipt, target edits and metadata changes do not continually reset remaining work's reminder age. Fresh enrollment, explicit Resume and a genuine no-recipient-work to new-work transition capture a current courtesy anchor without resetting lifetime counts; new work is not immediately chased because the request is old. Every possible-submission call, manual or automatic including an allowed same-envelope follow-up, advances the next automatic waiting anchor under the captured cadence without creating another occurrence or clearing stops. Existing captured request profiles change only through a deliberate authorized Use current tenant settings action, with a fresh anchor and preserved counts/paused/recipient-stop state; new tenant defaults alone do not rewrite them. Preserve original policy/time facts for old occurrences.

### C04 — One shared pending reservation, finite counts and spacing

Manual and automatic initiation serialize on the exact issued request's reminder coordination basis, not only independent mode counters. Reserve capacity atomically before releasing competing work. Count each automatic occurrence once at its first possible external call and **never refund that count after a call**, including a later definite rejection. Reserve pending capacity so concurrent preparations cannot exceed a cap. Only a proved no-call reservation can release capacity without deleting identity/history; a missing response, repaired setting, rejection after a call or lease timeout cannot refund a used count. Distinct reminders observe the shared minimum spacing from the latest actual Q48 possible-provider-call fence. Permitted same-envelope transport calls are not new reminders or new counts and are not themselves blocked by the distinct-occurrence cooldown, but advance the latest-call fact. Neither new item/work episode, pause/resume, policy edit, tenant Off→On, new caller key nor restored backup resets lifetime count/history. A captured maximum increase may authorize only the remaining prospective allowance within the adopted hard maximum of ten. Manual sending after the automatic cap remains possible under current authority and the non-overridable shared spacing.

An old unknown occurrence must not become an infinite lock on all future legitimate reminder actions. After its actual useful/call deadline makes it permanently non-callable, a genuinely later occurrence may qualify under current cadence, cap and spacing; the old possible-send count/outcome remains and its request key is never recycled. This distinction is essential to both bounded noise and permanent operational recovery.

### C05 — Source and policy stops win at every later external call

Recheck current purpose, original work applicability, tenant/source/contact/privacy policy, actual action and material at source admission and every sealed provider-call admission. Source transitions must preserve a cancellation/usefulness generation so a worker that misses Off→On or no-work→new-work cannot revive an old occurrence. Automatic pause/Off blocks new automatic work and every later automatic call; manual work follows its separate current controls. A broader applicable prohibition blocks both. Do not silently transfer another purpose's rules. A real already-committed `Submission may have begun` fact remains possible in flight; later stopping records the truth and permits evidence reconciliation only, not recall or another same-key call after the stop wins.

### C06 — Exact recipient/contact and honest action, minimal content

Qualify the actual original intended recipient binding/contact generation, including a compatible no-Party branch where permitted; current checks can narrow but cannot replace it with a worker-time profile email, watcher or current roster. A changed destination requires a genuinely new reviewed source act, not rewriting sealed mail. The first cohort's action is an actually currently qualified submit/correct/resupply route under its own admission/proof rules; the recipient need not already be online or through the proof exchange. Expired or unknown action authority cannot be replaced with an improvised help-only email variant. Keep actual staff/source access repair available separately. Email does not extend access or create identity. Do not disclose private names, file bodies/filenames, staff notes, submission details or unnecessary target information. Qualified transport carriers/envelopes remain governed by their own contracts rather than a contradictory ban on necessary protected routing. Plain text and images-off content must remain understandable. The initial readable Recent-copy ceiling is **zero**, recording `no_readable_copy`; future reveal expansion requires separate exact source/material qualification.

### C07 — Coherent source occurrence and complete communication release

Commit one source occurrence, actor/mode, original policy/work/recipient basis, reservation, audit/result and durable handoff coherently. The source fact cannot be claimed complete while its authoritative history or required handoff is missing. An optional projection/worker delay after that commit is not a failed source action. Qualification requires one exact Live P17 binding, actual closed material generation and the original tenant-published bounded plan; no direct sender or private child-intent writer. P6 must compile/validate the complete candidate, including exact membership, duplicates, exclusions, limits, one/zero cases, and release no child before the complete release boundary. A proved zero is different from unknown/incomplete original authority. Late infrastructure repair cannot invent an old original cohort or policy. Native request/evidence work survives optional reminder unavailability without duplicate submissions or phantom completion.

### C08 — Recover original semantic outcome before new-command eligibility

Bind a permanent source operation identity to tenant/environment/request, exact action/mode, reviewed input/policy/work basis and intentional occurrence. Matching committed retry recovers the original known result before checking whether a new operation could now be admitted; apply current disclosure controls to the returned result. Same key/different meaning conflicts. New commands, including exact no-op requests, require current authority and expected relevant basis; no-op produces no new reminder/history/effect. A late old response must not overwrite current pause/work/policy state. Provider/Inngest finite keys, a work lease and browser optimistic IDs supplement rather than replace this identity. Privacy retention may end readable content while minimum opaque uniqueness/stop evidence remains governed; if restored stale identity cannot be proved, reject/reconcile rather than re-execute it.

### C09 — Submission and provider ambiguity retain the exact P17 protocol

Seal exact recipient material, membership, UTF-8 request bytes, transport account/key and attempt before external I/O. Commit `Submission may have begun` before the first byte. A crash after that boundary is conservatively indeterminate even if a socket probably never opened. Accepted is not delivered/read; malformed success or mismatched batch membership is not proof. P17 permits at most **two follow-up HTTP calls after the initial call, total per sealed envelope**, only for `concurrent_idempotent_request`, exact typed `provider_5xx`, or `network_or_timeout` with the exact sealed request and no contradictory evidence. Each preserves bytes/key/pins, observes backoff and the earliest material/useful/provider-window deadline, and rechecks current stops. Other indeterminate causes reconcile only. Accepted/indeterminate work is never split/rekeyed/replayed as a repair. A sufficiently proved definite rejection may take only the existing permitted new-attempt transition with fresh fences; never turn an ordinary cadence slot into a transport retry loophole.

### C10 — Small relational invariants and a real atomic boundary

Use the existing source, P6/P17 and current policy owners. The minimum concepts are a versioned policy, source-bound enrollment/coordination state, immutable occurrence/result/history and existing delivery material/attempts; these are not instructions to add one table per concept. Native required, unique and composite same-tenant/environment/source references must prevent foreign policy/work/recipient/child attachment. Preserve immutable original occurrence identity, mode, source target, actor and policy provenance. Current counters/pointers are derivations with serialized updates and recoverable proof, not replacements for immutable facts. Distinct pending-reservation and sealed-call transitions have explicit expected revisions/generations and crash-safe results. Validate before commit and after canonicalization; unsafe cascades or generic delete cannot erase stop/dedup evidence.

Use an actual database transaction or an equivalently proved existing atomic source service for the authoritative transition. Sequential client RPCs—even inside `withTenant`—cannot prove co-commit. Explicitly test unique/constraint conflict, rollback, deadlock retry and concurrent request state/authority changes. An outbox/scheduler callback may wake work but never recreate a business identity based on processing time.

### C11 — One P12 decision, prescribed coarse RLS and every real door

Resolve current actor/source purpose/capability through the single P12 PDP and trusted Tenant Authorization Context; coarse RLS is defense in depth, not a second membership/capability engine. Check actual effective schema/table/sequence/function privileges, exposed schemas, ENABLE/FORCE state, table/function owners, inherited roles, BYPASSRLS and service behavior. Inspect composed permissive/restrictive SELECT/INSERT/UPDATE/DELETE/UPSERT/MERGE/RETURNING predicates, including implicit `WITH CHECK` where applicable. Inspect SECURITY INVOKER/DEFINER effective role, safe search path, EXECUTE grants, overloads, views and trigger writes. Restrict or close alternate raw/API/GraphQL/CMS/collection/import/job/operator/service paths that cannot preserve the source contract. Do not infer a caller tenant or full source authority from a UUID check or profile label.

Governed status, last outcome, next-time, count, actor, reason, history and error/cursor projections must use current viewer authorization and the P12 set-wise read budget. No public cache, shared browser state, diagnostic event, raw provider object or URL may disclose private request existence/content. Temporary inability to read is not proof that an occurrence was unsent or that its counters can reset.

### C12 — Efficient bounded wake/reconciliation and fair operations

Select only bounded due candidates using an indexed current-state/due-time/tenant/key ordering and stable unique pagination. Lease/claim work in finite batches, with current source rechecks and a safe continuation; do not scan every outstanding item per tick or queue indefinitely sleeping full snapshots. Reconciliation repairs a missing wake from actual source state and immutable occurrence history, not replaying all elapsed intervals. Persistent setup/contact/material failure enters its owned blocked/repair state; zero used count must not create a fresh failed occurrence every day forever. Missed-window coalescing can update one next-slot pointer without storing each missed interval. Establish measured per-tenant/global concurrency, candidate/batch/fanout, attempt, delay, retention, lock/statement and backlog bounds before activation. Reuse shared P6 batching rather than per-reminder provider loops. Preserve P12's logical governance budget without pretending it is the entire command/query budget. No claim that built-in SQL or existing infrastructure means unchanged Vercel/Supabase/provider cost.

### C13 — Small usable recovery and protected observability

Show automatic availability, request state, actual last known outcome and next eligible time only when provable. Distinguish paused, exhausted, no recipient work, unresolved setup, queued/prepared, possibly submitted, accepted, definitely failed and unknown. Changing a field does not send. Staff deliberately Send after seeing current source/recipient/consequence; pending refresh/transport loss preserves the original result and lawful input. A failure provides an actual owner-controlled repair/reconcile/pause or current manual/source-help path, not SQL, forced reupload, fabricated Sent or recreating a request to evade limits. No routine modal maze, required rich-text authoring, preview download, full signup, Resolve/read acknowledgment or extra task.

Audit policy/enrollment/change/stop/occurrence/reservation/submission and true actor attribution under the proper protected audience. Minimized operational metrics may show counts, lateness and typed causes, not private reminder/request bodies, address, file names, protected IDs or arbitrary raw provider payloads. Metrics distinguish reservation, possible send, accepted delivery evidence and actual source work. Alert bounded backlog/unknown/stop-fence failure without generating recipient reminder loops.

### C14 — Prospective rollout, retention and restoration

Qualify the actual ordinary source predicate, action, no-Party/contact branch, P17 material and complete delivery lane before Live. Existing schema types, written contracts, code stubs and mocked tests do not qualify them. Inventory all writers and old callbacks before enabling new policy/currentness gates. Use additive source/schema/profile migration and explicit current policy; do not backfill historical reminder eligibility, identities, timestamps, sent state or On from task rows/provider IDs. Test mixed writer/schema/cache/object/job restore, adverse policy/work facts and expired grants; expired/stopped occurrence material cannot be revived. Minimize readable material/history under their actual owners separately from durable opaque identity/count/stop evidence. Scoped disable and roll-forward preserve source work, old outcome recovery and current manual help. No provider changes, credential repairs or direct data corrections are prerequisites to this review.

## Calibrated material risks

| Risk if omitted                                                         | Severity / likelihood            | Evidence and required resolution                                                                                                                 |
| ----------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chase a recipient while all evidence awaits staff                       | High / plausible                 | E01's pending financial status is the wrong ordinary predicate; C01/C05 require actual recipient work and both-order source races.               |
| Automatic/manual double send or cap reset                               | High / plausible                 | Independent jobs/round strings do not serialize shared admission; C03–C05/C08–C10 require reservation, immutable history and source generations. |
| Wrong recipient or private content leaked through old address/CTA       | High / plausible                 | E03 resolves current profile email for a different purpose; C06/C07/C11 require exact original binding/current narrowing and safe material.      |
| Unknown result rekeyed or Off ignored by an executing job               | High / plausible                 | E07 and current Inngest behavior; C05/C08/C09 preserve sealed possible-send facts and block later calls.                                         |
| Multi-call partial commit or privileged alternate writer bypass         | High / plausible                 | E02/E06 are narrow one-call seams; C07/C10/C11 require actual co-commit and real-role/every-door proof.                                          |
| Night send, early DST send, stale restart or indefinite silent dead end | Medium–High / plausible          | C03/C04/C13 require exact schedule interpretation, current bounded wake and permanent repair semantics.                                          |
| Full scans, lock hotspot, retry storm or surprise invoice               | Medium–High / workload-dependent | E01 scan pattern is not Q48 capacity proof; C12 requires real representative plans and budgets.                                                  |
| Current or restored stop/dedup evidence erased by retention/migration   | High / plausible                 | C08/C14 preserve minimal governed identity separately from readable material and reject unverifiable stale execution.                            |

These are risks in the proposed capability or unsafe reuse, not claims of discovered production exploitation or already implemented Q48 defects.

## Prospective native proof groups

All proofs below remain required native work, not tests executed in this review.

| Proof | Required observable result                                                                                                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01   | Exact ordinary source purpose, eligible issued request and actual outstanding recipient work, including partial receipt, Checking, waiting staff review and deferred Q22 completion.                                                                       |
| P02   | Real correction/new requirement/withdrawal/reoffer/staff evidence changes actual work without invented timers, acceptance, waiver, grant or completion.                                                                                                    |
| P03   | System Off, exact known effective policy, management capability, synthetic preview/test/activity log, Live binding and prospective enrollment; unknown policy is not Off or default On.                                                                    |
| P04   | Deliberate manual action independent of automatic Off, current staff capability and tenant/source/channel restrictions; automatic request pause/resume scope explicit.                                                                                     |
| P05   | Exact interval/zone/release/time precision and equality; DST gap/fold/skipped date, no requested-by/browser/session-zone inference or stale pre-lock time.                                                                                                 |
| P06   | Initial enrollment, partial progress, no-work→new-work courtesy interval, target/edit/zone/policy changes and long pause/outage; no count reset, immediate backlog burst or stale old occurrence.                                                          |
| P07   | Finite cap and remaining allowance with deliberately changed captured maximum, no-call reservation release and nonrefundable once-per-occurrence possible-call accounting, including later definite rejection/unknown; no double count of transport calls. |
| P08   | Manual/manual and manual/automatic races both orders under one shared reservation; distinct occurrence spacing and stale-review conflict.                                                                                                                  |
| P09   | Exact finite original work basis and current narrowing; missing/extra/cross-scope basis, all original work ended, new work added, source generation missed by worker.                                                                                      |
| P10   | Tenant/request stop and re-enable, current work end, recipient/privacy changes versus preparation/claim/seal and each later provider call in both orders.                                                                                                  |
| P11   | Independent original recipient/contact/no-Party branch and current action disclosure/admission; no profile-email, shared-mailbox or worker-time retarget.                                                                                                  |
| P12   | Active/expired/revoked/fresh participant access, actual available submit/correct/resupply route, no automatic renewed admission, improvised help-only email or false upload CTA; separate capable staff/source access repair.                              |
| P13   | Original source policy/plan publication and occurrence admission in both orders; reviewed explicit choice cannot change under a new default.                                                                                                               |
| P14   | One authoritative occurrence/reservation/history/result/handoff co-commit; crashes before/after every boundary and optional projection delay after known commit.                                                                                           |
| P15   | Complete P6 candidate validation/release: one/zero, missing/extra/duplicate/stale/cross-tenant/over-limit members, no child before complete release, both sides of release crash.                                                                          |
| P16   | Non-Live/unresolved original setup, proved zero and repair: no guessed old cohort, fake success, delayed historical blast or source-state rollback.                                                                                                        |
| P17   | Matching committed replay before new eligibility; changed key meaning conflicts; full current no-op authority/expected basis; old late result cannot overwrite current state.                                                                              |
| P18   | Permanent identity beyond browser/provider/Inngest windows, worker lease expiry, duplicate wake/callback and true later intentional occurrences.                                                                                                           |
| P19   | Exact sealed envelope/attempt before first byte; crash before/after fence, accepted versus delivered/read, full batch mapping and malformed provider success.                                                                                              |
| P20   | Only three permitted indeterminate causes and at most two total follow-up calls; unchanged keys/bytes/pins, earliest deadlines/backoff/current fences, other causes reconcile only.                                                                        |
| P21   | Definite rejection repair versus indeterminate/accepted no rekey; expired unknown occurrence no further calls but truthful future legitimate reminder under unchanged count/spacing.                                                                       |
| P22   | Native required/unique/same-scope references, immutable source/actor/mode/policy/recipient provenance, state transition checks and safe deletion/cascade behavior.                                                                                         |
| P23   | Real-role grants/ENABLE/FORCE/owner/BYPASSRLS and composed permissive/restrictive SELECT/INSERT/UPDATE/DELETE/UPSERT/MERGE/RETURNING old/new predicates.                                                                                                   |
| P24   | Actual invoker/definer ownership/search path/EXECUTE, overload/view/trigger/raw/GraphQL/CMS/collection/import/operator/service doors; source command or closed path.                                                                                       |
| P25   | Single P12 PDP/current verified context with coarse tenant defense, current status/history/count/cursor/error projection and set-wise governance budget.                                                                                                   |
| P26   | Tenant guard's actual adopted RPC and one-call transaction; no callback-wide transaction, arbitrary tenant authority or full service-path coverage claim.                                                                                                  |
| P27   | Safe minimal material, original action pins, ordinary filename/body privacy and protected carriers; plain text/images-off; initial zero Recent-copy ceiling/no_readable_copy; first-preparation class limit distinct from original occurrence deadline.    |
| P28   | Index/query plans under real roles and representative tenant skew, bounded candidates/unique pagination/fair leases/reconciliation, no N+1 or full-history scan.                                                                                           |
| P29   | Concrete concurrency/queue/material/fanout/time/attempt/retention budgets and boundary/one-over cases, actual database/runtime/provider costs and saturation behavior.                                                                                     |
| P30   | Protected coherent audit versus minimized telemetry; occurrence counts, reservations, possible sends and actual source outcomes cannot be conflated.                                                                                                       |
| P31   | Privacy retention/holds versus minimal opaque count/dedup/stop proof; expired or unverifiable restored work rejects/reconciles rather than resends.                                                                                                        |
| P32   | Old writers, new schema/profile/policy generations, mixed restore and prospective enable/disable/roll-forward preserve adverse facts and original results.                                                                                                 |
| P33   | Actual sender/template/contact/material repair without duplicate source request/evidence or direct-provider workaround; expired-cap/manual remedy honest.                                                                                                  |
| P34   | Composed keyboard/AT/speech/mobile/RTL/long-name/localized-zone/weak-network controls and recipient actions with lawful input/focus and original-result recovery.                                                                                          |
| P35   | Q20/Q26/Q27/Q31/Q32/Q35/Q40 independent coexistence and later Workflow coordination; no alias, universal cadence reset, duplicated native event or blanket suppression.                                                                                    |
| P36   | Native qualification of actual source/P17/P6/contact/time dependencies and current release compatibility; mocks, model output and static inspected SQL never substituted for intended-user/deployed proof.                                                 |

## All 22 adversarial categories

| Category                                   | Finding, calibration and amendment                                                                                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Necessity/alternatives                  | Medium / plausible coordination cost. Selected A retains contextual manual capability and source help; opt-in bounded automation rather than mandatory pursuit. C01–C04.                                       |
| 2. Brittleness                             | High / plausible stale task/round/lease used as source truth. Exact work/policy generation, immutable identity and current fences. C01/C05/C08–C10.                                                            |
| 3. Technical debt                          | Medium / plausible duplicate scheduler/PDP/provider path. Small source-owned policy and existing communication owners. C02/C07/C11/C12.                                                                        |
| 4. Edge cases                              | High / plausible partial/Checking/no-work/new-work, unknown result, expired access, DST and cap transition. C01/C03–C06/C09.                                                                                   |
| 5. Footguns                                | High / plausible enable sends backlog, toggle sends, two staff double-send, Unknown repaired with new key. C02–C05/C08/C13.                                                                                    |
| 6. Tenant safety                           | High / plausible wrong tenant/context/recipient/worker cache. Exact references and current one-PDP authorization, no email/profile inference. C06/C10/C11.                                                     |
| 7. Database/RLS/authorization              | High / plausible effective role/alternate writer/partial transaction bypass. Real old/new/composed policies, constraints and one atomic source boundary. E02/E06/C10/C11.                                      |
| 8. Overengineering                         | Medium / plausible arbitrary calendars/digests/escalations/Realtime/rules builder. Fixed bounded profile and shared seams, no whole Workflow dependency. C02/C03/C07/C12.                                      |
| 9. UX/UI/friction                          | Medium–High / plausible invisible pause/exhaustion, misleading next-time and powerless recovery. Honest compact controls and actual help. C04/C13.                                                             |
| 10. Source truth/invariants                | High / plausible chasing staff backlog or treating mail as receipt/acceptance. Source work independent from transport. C01/C06–C09.                                                                            |
| 11. Hidden coupling                        | High / plausible target/access/change notices reset schedules or manual Off inheritance. Explicit separate clocks, controls and purposes. C02–C06/P35.                                                         |
| 12. Failure modes                          | High / plausible missing reservation/history, late worker after Off, unknown treated unsent. Co-commit, fences and original recovery. C04/C05/C07–C10.                                                         |
| 13. Lifecycle/time/concurrency/idempotency | High / plausible overlapping modes, missed no-work interval, stale re-enable and deadline equality. Explicit policy/source generations, current serialized time and permanent identity. C03–C10.               |
| 14. Data integrity                         | High / plausible foreign child, mutable original policy, stale counter and unsafe cascade. Native same-scope keys and immutable fact/accounting lineage. C07/C08/C10/C14.                                      |
| 15. Security/privacy                       | High / plausible filename, recipient address or wrong-action leak in notices/history/telemetry. Purpose contactability and current disclosure at every door. C06/C11/C13.                                      |
| 16. Scalability/performance                | Medium–High / workload-dependent scans/locks/retries/hot counters. Bounded indexed candidate work, fairness and measured plans. C04/C12.                                                                       |
| 17. Operational burden                     | Medium–High / plausible unknown locks all future work or failed setup forces new request. Finite inert old occurrence and legitimate current remedy, no blind replay. C04/C09/C13.                             |
| 18. Observability/auditability             | High / plausible stamps called Sent, test creates real history, hidden cap refund. Separate protected source/transport evidence and minimized metrics. C02/C04/C07/C13.                                        |
| 19. Dependency/integration                 | Medium / plausible existing finance sender/claim guard/Inngest assumed qualified ordinary lane. Current explicit adoption and provider contract. E01–E09/C07/C09/C11.                                          |
| 20. Migration/rollout/upgrade              | High / plausible guessed On/backfill/old callback/backup causes flood. Prospective enrollment, writer census and retained adverse identity. C08/C14.                                                           |
| 21. Testability/traceability/proof         | High claim risk / plausible static/model result mistaken for native success. P01–P36 remain prospective; actual SQL concurrency/provider/user/scale proof required.                                            |
| 22. Other hazards                          | Medium / plausible source-family/channel/assurance/default expansion. First ordinary purpose only; no new source grants, money policy, recipient channels or numeric provider limit inferred. C01/C02/C06/C14. |

## Finite budgets and operational controls

The program's adopted interval/count/spacing is a product rule; resource and material caps are separate exact qualified profiles, not universal invented quotas. Before Live, record finite bounds for: candidate and reconciliation batches; per-tenant/global concurrency and queued work; source/plan/member cardinality; database statements/lock time/connection occupancy; prepared material and useful deadlines; provider calls/recovery windows; protected readable retention and separate minimal uniqueness/stop evidence; and worker/DB/provider cost under representative load. Demonstrate exact-boundary and one-over behavior with truthful limited/deferred outcomes.

Permanent controls are scoped automatic disable, request pause/resume, current manual/source remedy, original outcome reconciliation, exact failed-configuration repair, bounded due/backlog continuation, protected diagnostics and additive roll-forward. No control resets old identity/cap/history, revives a stopped occurrence, overrides current authority or starts an unreviewed historical blast.

## Review status

Independent source, technical-docs and all-22-category review is complete at the proposal level. Exact coordinated policy is recorded above. The isolated schedule/race illustration follows below; a complete consolidated report/ADR readback remains a later review. This note does not ratify Q48 or claim native qualification.

## Credential-free deterministic illustration — exact code

This Python standard-library illustration is saved only in this note. It runs in memory, has no database/network/provider access, changes no runtime, and is not a benchmark or native proof. Serial order permutations test stated outcomes, not database locking or genuine concurrent execution. The civil-time resolver deliberately uses a small linear minute search to illustrate gap/fold behavior; it is **not** a proposed production implementation or capacity result. Fixtures cover the named zones/dates, not all time-zone history. The miniature state model omits real P12/P17/P6, cryptography, SQL, rendering and delivery.

```python
from datetime import datetime, date, time, timedelta, timezone
from zoneinfo import ZoneInfo
from itertools import permutations

UTC = timezone.utc
DAY = timedelta(hours=24)
WINDOW = timedelta(minutes=60)

def instant(s):
    return datetime.fromisoformat(s).astimezone(UTC)

def local_slot(day, hhmm, zone):
    z = ZoneInfo(zone)
    nominal = datetime.combine(day, time.fromisoformat(hhmm))
    for minute in range(2881):  # fixture bound, not production policy
        naive = nominal + timedelta(minutes=minute)
        candidates = set()
        for fold in (0, 1):
            candidate = naive.replace(tzinfo=z, fold=fold).astimezone(UTC)
            if candidate.astimezone(z).replace(tzinfo=None) == naive:
                candidates.add(candidate)
        if candidates:
            return max(candidates)  # later fold; first valid gap minute
    raise ValueError('fixture resolution bound exceeded')

def next_daily(after, hhmm, zone):
    day = after.astimezone(ZoneInfo(zone)).date()
    for offset in range(5):
        candidate = local_slot(day + timedelta(days=offset), hhmm, zone)
        if candidate > after:
            return candidate
    raise ValueError('fixture daily bound exceeded')

def due(anchor, days, hhmm, zone, last_call=None):
    day = anchor.astimezone(ZoneInfo(zone)).date() + timedelta(days=days)
    candidate = local_slot(day, hhmm, zone)
    lower = max(anchor + DAY, last_call + DAY if last_call else anchor + DAY)
    while candidate < lower:
        candidate = next_daily(candidate, hhmm, zone)
    return candidate

def opportunity(slot, now, hhmm, zone):
    if now < slot:
        return ('waiting', slot)
    if now < slot + WINDOW:
        return ('open', slot)
    return ('coalesced', next_daily(now, hhmm, zone))

class Request:
    def __init__(self, cap=3):
        self.cap, self.used, self.auto_on, self.active = cap, 0, True, True
        self.work, self.epoch, self.work_epoch = True, 0, 0
        self.last_call, self.lane, self.ops = None, None, {}

    def close_expired(self, now):
        if self.lane and now >= self.ops[self.lane]['end']:
            self.ops[self.lane]['closed'] = True
            self.lane = None

    def admit(self, key, mode, now, end):
        if key in self.ops:
            return 'replay' if self.ops[key]['mode'] == mode else 'conflict'
        self.close_expired(now)
        if not self.work or (mode == 'auto' and (not self.auto_on or not self.active)):
            return 'blocked'
        if now >= end:
            return 'expired'
        if self.lane:
            return 'busy'
        if self.last_call is not None and now < self.last_call + DAY:
            return 'spacing'
        if mode == 'auto' and self.used >= self.cap:
            return 'cap'
        self.ops[key] = dict(mode=mode, epoch=self.epoch, work_epoch=self.work_epoch,
                             end=end, calls=0, closed=False)
        self.lane = key
        return 'admitted'

    def call(self, key, now, cause=None):
        op = self.ops[key]
        if op['closed'] or now >= op['end']:
            return 'expired'
        if not self.work or op['work_epoch'] != self.work_epoch:
            return 'stopped'
        if op['mode'] == 'auto' and (not self.auto_on or not self.active or op['epoch'] != self.epoch):
            return 'stopped'
        if op['calls']:
            if op['calls'] >= 3 or cause not in {'concurrent_idempotent_request', 'provider_5xx', 'network_or_timeout'}:
                return 'reconcile_only'
        else:
            if self.last_call is not None and now < self.last_call + DAY:
                return 'spacing'
            if op['mode'] == 'auto':
                self.used += 1
        op['calls'] += 1
        self.last_call = now
        return 'may_have_submitted'

    def stop_auto(self):
        self.auto_on, self.active = False, False
        self.epoch += 1

    def enable_and_resume(self):
        self.auto_on, self.active = True, True

    def no_work(self):
        self.work = False
        self.work_epoch += 1

# Calendar dates preserve 09:00 across spring/fall; not seven elapsed days.
spring = due(instant('2026-03-01T09:00:00-05:00'), 7, '09:00', 'America/New_York')
fall = due(instant('2026-10-25T09:00:00-04:00'), 7, '09:00', 'America/New_York')
assert spring == instant('2026-03-08T09:00:00-04:00')
assert fall == instant('2026-11-01T09:00:00-05:00')
print('calendar_dst_hours', int((spring-instant('2026-03-01T09:00:00-05:00')).total_seconds()/3600), int((fall-instant('2026-10-25T09:00:00-04:00')).total_seconds()/3600))
gap = local_slot(date(2026, 3, 8), '02:30', 'America/New_York')
fold = local_slot(date(2026, 11, 1), '01:30', 'America/New_York')
assert gap == instant('2026-03-08T03:00:00-04:00')
assert fold == instant('2026-11-01T01:30:00-05:00')
assert local_slot(date(2011, 12, 30), '09:00', 'Pacific/Apia') == instant('2011-12-31T00:00:00+14:00')
print('gap_fold_skipped_date', gap.isoformat(), fold.isoformat(), 'passed')
one_day = due(instant('2026-03-07T09:00:00-05:00'), 1, '09:00', 'America/New_York')
assert one_day == instant('2026-03-09T09:00:00-04:00')
print('24h_floor_advances_spring_slot', one_day.isoformat())
t = instant('2026-10-25T09:00:00+00:00')
assert opportunity(t, t+timedelta(seconds=1), '09:00', 'UTC')[0] == 'open'
assert opportunity(t, t+WINDOW-timedelta(microseconds=1), '09:00', 'UTC')[0] == 'open'
assert opportunity(t, t+WINDOW, '09:00', 'UTC') == ('coalesced', t+DAY)
assert opportunity(t, t+timedelta(days=40, hours=2), '09:00', 'UTC')[1] == t+timedelta(days=41)
print('window_edges_and_40_day_coalescing', 'passed')
for order in permutations(('manual', 'auto')):
    r = Request()
    outcomes = [r.admit(mode, mode, t, t+WINDOW) for mode in order]
    assert outcomes == ['admitted', 'busy']
print('manual_auto_serial_orders', 2, 'one_admission_each')
for first in ('stop', 'call'):
    r = Request(); assert r.admit('a', 'auto', t, t+WINDOW) == 'admitted'
    if first == 'stop':
        r.stop_auto(); assert r.call('a', t) == 'stopped'; assert r.used == 0
    else:
        assert r.call('a', t) == 'may_have_submitted'; r.stop_auto()
        assert r.call('a', t+timedelta(seconds=1), 'network_or_timeout') == 'stopped'; assert r.used == 1
    r.enable_and_resume()
    assert r.call('a', t+timedelta(seconds=2), 'network_or_timeout') == 'stopped'
    assert r.admit('a', 'auto', t+DAY, t+DAY+WINDOW) == 'replay'
print('off_call_orders_old_replay_no_revival', 'passed')
r = Request(); r.admit('a', 'auto', t, t+WINDOW); r.no_work(); r.work = True
assert r.call('a', t) == 'stopped'
assert due(t+timedelta(days=50), 7, '09:00', 'UTC') == t+timedelta(days=57)
print('missed_no_work_interval_and_new_work_courtesy', 'passed')
r = Request(); r.admit('a', 'auto', t, t+WINDOW)
assert r.call('a', t) == 'may_have_submitted'
assert r.call('a', t+timedelta(minutes=1), 'network_or_timeout') == 'may_have_submitted'
assert r.call('a', t+timedelta(minutes=2), 'provider_5xx') == 'may_have_submitted'
assert r.call('a', t+timedelta(minutes=3), 'provider_5xx') == 'reconcile_only'
assert r.used == 1
assert r.admit('m', 'manual', t+DAY, t+DAY+DAY) == 'spacing'
assert r.admit('m', 'manual', t+DAY+timedelta(minutes=2), t+2*DAY) == 'admitted'
assert r.call('a', t+DAY, 'network_or_timeout') == 'expired'
print('followup_bound_once_count_latest_call_spacing_unknown_closure', 'passed')
r = Request(cap=1); r.admit('a', 'auto', t, t+WINDOW); r.call('a', t)
r.close_expired(t+WINDOW)  # even definite rejection after a call does not refund
assert r.used == 1
assert r.admit('b', 'auto', t+DAY, t+DAY+WINDOW) == 'cap'
assert r.admit('m', 'manual', t+DAY, t+2*DAY) == 'admitted'
r = Request(cap=1); r.admit('a', 'auto', t, t+WINDOW); r.close_expired(t+WINDOW)
assert r.used == 0 and r.admit('b', 'auto', t+DAY, t+DAY+WINDOW) == 'admitted'
print('nonrefundable_call_cap_manual_after_cap_no_call_release', 'passed')
r = Request(); r.stop_auto()
assert r.admit('m', 'manual', t, t+DAY) == 'admitted'
assert r.call('m', t) == 'may_have_submitted'
assert r.admit('m', 'auto', t, t+WINDOW) == 'conflict'
print('auto_off_manual_independence_identity_conflict', 'passed')
print('RESULT', 'all assertions passed; non-native illustration only')
```

Executed once from the exact saved code using WSL Ubuntu-24.04 **Python 3.12.3**, standard library only. Exit code **0**. Exact stdout:

```text
calendar_dst_hours 167 169
gap_fold_skipped_date 2026-03-08T07:00:00+00:00 2026-11-01T06:30:00+00:00 passed
24h_floor_advances_spring_slot 2026-03-09T13:00:00+00:00
window_edges_and_40_day_coalescing passed
manual_auto_serial_orders 2 one_admission_each
off_call_orders_old_replay_no_revival passed
missed_no_work_interval_and_new_work_courtesy passed
followup_bound_once_count_latest_call_spacing_unknown_closure passed
nonrefundable_call_cap_manual_after_cap_no_call_release passed
auto_off_manual_independence_identity_conflict passed
RESULT all assertions passed; non-native illustration only
```

Observable conclusions are limited to this model: calendar weekly slots can be 167/169 elapsed hours around DST; the one-day spring slot may advance another day to satisfy the separate 24-hour floor; slight lateness is admissible while equality at the hour end expires; a 40-day outage coalesces rather than creating 40 calls; either manual/automatic admission order gets only one lane; Off and no-work generations prevent a missed transient state from reviving the old operation; follow-ups use one count, advance spacing and obey their own call bound; an unknown old closed occurrence remains counted while a genuine later manual act may qualify; no-call reservation expiry releases capacity; automatic Off does not itself disable manual; changed operation meaning conflicts. SQL isolation, real concurrency, P12, source mappings, P17/P6 material/release, exact provider tuples, queue operation, UI/accessibility and production load remain **unproved**.

## Consolidation handoff

The independent note now contains **14 proposed clauses, 36 prospective native proof groups, all 22 adversarial categories**, calibrated risks, bounded operational controls, fresh critical source/official-document readbacks and the exact code/stdout of one credential-free in-memory illustration. The coordinated calendar-day and nonrefundable-first-call policy replaces the initial exploratory elapsed-day/refund suggestions. Awaiting the full root report/ADR for actual whole-package review; there is no pre-approval, ratification or native qualification claim.

## Preliminary complete decision-body review

I read all **24 paragraphs** of `work/phase29-q48-decision-body.md`, SHA-256 **6063f241cdc0f740b88b2db90d909396a52f8f65dec158a696f4fb88632c7ddb**, on 2026-10-25. The body preserves the 14 independent clauses/36 prospective proof groups: purpose/current work (paragraphs 1,11–13), controls/profile/recipient stop (2–7), schedule/lane/count/spacing (8–10), coherent command/replay (14), complete release/provider/material (15–16), native integrity/P12/RLS/performance (17–18), UX/repair/audit (19–21), rollout/proof/publication limits (22–24).

Two material precision findings were sent to root for reconciliation before closure:

1. Recipient **allow again** must, when an already configured plan is otherwise permitted, establish the same fresh full waiting interval as Resume; it must not expose the old overdue slot for immediate sending. It still cannot clear staff/tenant stops or enroll a plan. The body's phrase permitted Resume could otherwise be read as staff-only.
2. After matching committed replay is recovered, an exact **new-command no-op** requires current authority and expected relevant basis. It returns unchanged without new plan/stop generation, waiting anchor, occurrence, history/effect or reset. A stale expected basis must still conflict. This makes repeated Start/Resume/Use current settings controls safe without making an old committed operation run again.

The remaining body aligns. In particular every possible call, not only a manual call, advances the next automatic anchor; count is never refunded after a call; an inert expired unknown result remains counted without locking all future legitimate work; first-cohort mail requires a submit/correct/resupply route; initial readable Recent-copy ceiling is zero; the 24-hour prepared class runs from first immutable preparation while a manual occurrence independently expires within 24 hours of admission, and an automatic call window ends after its original 60 minutes. Own clauses/proofs above were made explicit on these points.

No probe rerun is warranted by this textual review. The executed model verifies its listed calendar and lane/call cases; it does **not** implement every paragraph, recipient preference UX, global profile changes, prepared-material clocks, no-op authorization or the native communication/SQL/security contract. Full consolidated report/ADR review and corrected-body readback remain pending.

### Corrected decision-body readback closure

Read back the corrected recipient-resume paragraph with its adjacent anchor paragraph and the complete authoritative-command/replay/no-op paragraph. The current full-body SHA-256 is **910888cdd0e0a4ebb7bd8023426c5ad2a03cd648d9d860eb126b6a3da6b41aac**. Both findings are resolved: an otherwise eligible configured recipient resume starts a fresh full wait without clearing other stops; an authorized current canonical profile/control no-op preserves all business state while independently required security audit remains, stale expected basis conflicts, and identical message text does not suppress a genuine new deliberate reminder. Matching committed replay remains first.

**No unresolved material decision-body finding remains.** This is corrected-body closure only, not the still-pending whole-report/ADR review or ratification. No additional model run or native proof is claimed.

## Initial whole-package read and exact parity

I independently read the **entire** `work/phase29-q48-adversarial-review.md` (**88,373 LF-normalized characters, 382 lines**, SHA-256 **621bd5b9b3d89eee2491c43d17cb1f0a7f1139f42ec1f96b85fbaafa4062f7db**) and the **entire** `work/0048-tenant-controlled-ordinary-request-reminders.md` (**27,933 characters, 73 lines**, SHA-256 **467a3e8c11f9582be6b0723ece4172c153b4cebd422b0ee85d5ca86af4219c9f**). This included every section, table, all 22 categories, 32 lifecycle rows, 42 journeys, 52 proof groups, nine budget families, ten residual controls, proposed term and evidence/stage limits—not merely the exact body or my contributed rows.

A read-only structural comparison proves the report's unquoted corrected decision equals the ADR Decision section and the saved body: **24 paragraphs, 25,310 stripped LF characters**, normalized-text SHA-256 **1dbadd19729be75449c65bbe8868a6c6dc64d916e2f158af984e97feaf83c436**. The proposed term text is identical in report and ADR (**258 characters excluding its bold label**). C/P/L/J/B/O row counts are **24/52/32/42/9/10**. This is document parity, not implementation verification.

The complete package has no new product-decision contradiction. The two earlier body findings remain fixed. The copied tables preserve the intended calendar/call/count/current-source semantics, the independent model is described only as illustrative, and the new term distinguishes the source plan from message/attempt/access/Requested by. Initial automatic Off, captured request defaults, narrow recipient control, every-call current fences, nonrefundable count, finite unknown closure and future legitimate recurrence all remain coherent. Existing source/P6/P12/P17 and specialized purposes are not presented as native Q48 qualification.

Before full closure, I sent these narrow inherited-proof carry-through findings to root; the owner reviewer independently identified the same principal gaps:

1. **P27:** expressly test source occurrence versus original plan-publication order; complete candidate/hash identity including missing, extra, duplicate, stale, cross-scope, over-limit or disjoint replay; no child before complete release; source/release crashes before and after commit; no appended children when replaying a committed original. These preserve C14–C15 and the existing P6 contract.
2. **P33–P34:** expressly test required SELECT/RETURNING, UPSERT/ON CONFLICT and MERGE; composed permissive/restrictive old/new checks; effective ENABLE/FORCE/owner/BYPASSRLS; actual function EXECUTE/search-path/overloads and trigger writes across real roles. These preserve C17–C18 and the existing P12/PostgreSQL boundary rather than inventing a new RLS setting.
3. **P19:** spell out the three inherited permitted indeterminate causes so the proof cannot silently treat an unknown error as a retry grant. Preserve at most two follow-ups after the initial call, exact pins and all current fences/earliest deadlines.

Root accepted these as proof precision, with the decision body unchanged. During review root also observed a newer live head, **21ae70847cd4569d3d8bdbe3b6cbf64d8022cc39**; the owner researcher is classifying the exact delta. The fdec source reads above remain historical pinned evidence, not an unverified claim that the new head is unchanged. Final corrected proof/freshness readback and final hashes are pending below. No further model run, native test or provider action occurred.

### Final live-delta scope readback

An authenticated read-only GitHub comparison independently returned **fdec2ba2f13d23db38a0d0173873507f37ce41bd → 21ae70847cd4569d3d8bdbe3b6cbf64d8022cc39: six commits ahead, zero behind, 12 paths, every patch present**. The complete path inventory comprises four release-governance documents, two release scripts and six test/checklist paths; no app/package/Supabase/OpenSpec path appears in this complete comparison. The owner separately checked unchanged product subtrees. This note's detailed fdec product-code observations therefore remain relevant, while **21ae708… is the current observed live pin**.

I read both script patches and both complete current scripts at 21ae:

- `scripts/release/production.mjs`, blob **d1f0e6920e7dc7afd28695fd5fdc7cc0dfeedd80**: the normal release command invokes the blocker check after branch/clean-worktree validation and again immediately before the production push. Its dry-run path is also gated.
- `scripts/release/release-blockers.mjs`, blob **3dd30361862d4543ccd3524db3b2ae341949c034**: reads the fixed repository's label and paginated open issues through the releaser's existing `gh` authentication, filters pull requests/closed issues, and refuses ordinary release when blockers exist or the result cannot be verified. It adds no Q48 source predicate, policy, event, recipient or delivery behavior.

The four documentation paths are `docs/agents/triage-labels.md`, `docs/ai/repo-groundtruth.md`, `docs/ai/rules/general.md` and `docs/ops/production-release.md`. The six test/checklist paths are under `tests/unit/acceptance/issue-2277/` plus `tests/unit/scripts/release-blockers.test.ts`. This bounded classification does not claim an exhaustive unrelated release-code audit or passed tests. No release command, dry run, test, script under review, provider action or credential inspection was executed. The new gate remains applicable to eventual normal production release; it does not change the Q48 product decision or supply missing native reminder proof.

## Final whole-package review closure

The final report is `work/phase29-q48-adversarial-review.md`, **90,183 LF-normalized characters**, SHA-256 **2803eeba3b8d4ac22318cd26c038ed65012a353a5a13a15bc8954b254a6b3198**. The completely read ADR remains `work/0048-tenant-controlled-ordinary-request-reminders.md`, SHA-256 **467a3e8c11f9582be6b0723ece4172c153b4cebd422b0ee85d5ca86af4219c9f**. The exact saved body file remains SHA-256 **910888cdd0e0a4ebb7bd8023426c5ad2a03cd648d9d860eb126b6a3da6b41aac**.

I read the full corrected freshness paragraph and all four expanded P19/P27/P33/P34 rows in context. A read-only inverse comparison replaced **exactly these five changed lines** with the previously fully read text and recovered **621bd5b9b3d89eee2491c43d17cb1f0a7f1139f42ec1f96b85fbaafa4062f7db** exactly. Thus the final changed-text readback plus the earlier entire-file read covers the complete final report; no unreviewed intervening edits are assumed away. Rechecked exact report/ADR/body parity remains **24 paragraphs / 25,310 stripped LF characters**, normalized text hash **1dbadd19729be75449c65bbe8868a6c6dc64d916e2f158af984e97feaf83c436**. The proposed term remains identical. The package retains **24 clauses, 52 proof groups, all 22 categories, 32 lifecycle rows, 42 journeys, nine budget families and ten operational controls**.

All material findings are resolved. P27 now covers original source/plan order, complete candidate and command hashes, invalid/disjoint membership, no child before release, both sides of source/preparation/release crashes and no appended children on committed replay. P33/P34 now cover the real DML variants, composed old/new policies and actual effective roles/grants/functions/trigger/alternate-door boundaries without a blanket new FORCE or second PDP. P19 identifies the three inherited causes, exact sealed pins and the two-follow-up limit, with all earlier deadlines and current fences. The corrected freshness statement accurately distinguishes the new ordinary release gate from unchanged Q48 product behavior and native qualification.

### Independent clauses reconciled to the final package

| Independent clause                | Final root clauses / proof coverage          | Resolution                                                                                                            |
| --------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| C01 Source meaning/current work   | C01/C07/C11–C13; P01/P02/P23–P25/P42         | Actual next actor, original finite work basis and independent source decisions are preserved.                         |
| C02 Guarded controls              | C02–C06/C19/C20; P03–P11/P46–P48             | Initial Off, prospective captured defaults, source staff powers and recipient-only stop/allow remain distinct.        |
| C03 Time/anchors                  | C07/C08/C10/C16; P12–P15/P20/P28/P50         | Calendar, zone, fold/gap, fresh waits, every-call anchor and half-open deadlines are concrete and consistent.         |
| C04 Lane/count/spacing            | C09/C10/C21; P16–P21/P43/P47                 | Atomic reservations, nonrefundable once-per-occurrence count and safe later acts after unknown closure are explicit.  |
| C05 Stops/current calls           | C04–C06/C11–C13; P07–P09/P19/P23/P24/P48     | Missed stop generations and current call fences prevent revival without falsely claiming recall.                      |
| C06 Recipient/action/material     | C06/C11/C12/C16/C20; P08/P25–P29/P36/P38/P39 | Exact recipient/proof, currently usable first-cohort action, safe email and zero Recent-copy are explicit.            |
| C07 Coherent occurrence/release   | C14/C15/C17; P17/P22/P27/P32                 | Source identity/handoff and complete parent release have explicit crash and candidate-membership proof.               |
| C08 Replay/no-op                  | C14/C17/C22; P10/P22/P32/P40/P44/P45         | Original committed recovery precedes new eligibility; current canonical no-op and stale basis are distinguished.      |
| C09 Provider protocol             | C09/C10/C13/C15/C16; P18–P21/P28/P30         | Sealed possible submission, current stops, three closed causes and inherited follow-up limits remain intact.          |
| C10 Relational/atomic model       | C09/C14/C17/C18; P17/P22/P27/P31–P35         | Native same-scope keys, immutable facts, short real transaction and every-door proof remain required.                 |
| C11 One PDP/effective roles       | C13/C14/C18; P25/P31/P33–P36/P46             | Single P12 decision, prescribed coarse tenant defense and effective-role/trigger/alternate-path tests are explicit.   |
| C12 Bounded operations            | C18/C21–C23; P15/P35/P41/P50/P52; B03–B09    | Finite measured work/fairness/retention/cost and quiet blocked recovery replace scans or endless retries.             |
| C13 UX/repair/audit               | C19–C23; P30/P31/P36–P41/P47/P51/P52         | Truthful current states, accessible composed actions, protected audit and actual operators remain required.           |
| C14 Prospective rollout/retention | C16–C18/C22–C24; P22/P29/P32/P44–P46/P49–P52 | No guessed backfill, restored stop revival or native-proof overclaim; safe roll-forward and explicit adoption remain. |

### Complete 36-to-52 proof crosswalk

References identify preserved requirements, not tests claimed to have passed.

| Independent proof | Final root proof groups         | Covered obligation                                                                                            |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| P01               | P01/P23/P25                     | Exact ordinary current recipient work versus receipt/check/review/completion states.                          |
| P02               | P02/P12/P23/P24/P42             | Genuine source transitions, optionality and independent effects without fake timers or acceptance.            |
| P03               | P03–P05/P27/P46                 | Known effective policy, guarded activation, actual Live binding and prospective enrollment.                   |
| P04               | P06–P09/P47/P48                 | Actual staff capabilities, layered automatic controls and independently lawful manual action.                 |
| P05               | P12–P15/P28/P39/P50             | Clock/zone/precision, DST and exact early/equality/window boundaries.                                         |
| P06               | P05/P07/P09/P11/P12/P15/P20/P23 | Enrollment, new-work courtesy, partial progress, profile changes and missed-time handling.                    |
| P07               | P03/P17/P18/P43                 | Cap/reservation/used-count semantics, changed totals and no refunds or double counts.                         |
| P08               | P14/P16/P17/P47                 | Both manual/manual and manual/automatic orderings under the shared lane and spacing.                          |
| P09               | P23/P24/P27                     | Original finite work and complete candidate identity, current narrowing and missed ended-work facts.          |
| P10               | P07–P09/P19/P24/P30/P48         | Stop/change versus every actual call, retained intervening epochs and truthful in-flight evidence.            |
| P11               | P08/P25/P26/P30/P31/P36         | Exact recipient/contact/proof, no arbitrary retarget and current disclosure.                                  |
| P12               | P25/P29/P48; C12/C21            | Current submit/correct/resupply access and separate capable repair without improvised help mail or new grant. |
| P13               | P05/P10/P11/P22/P27             | Original plan/source-publication ordering and preserved reviewed policy rather than worker-time defaults.     |
| P14               | P17/P18/P22/P27/P32             | Authoritative co-commit, durable result/handoff and pre/post-boundary crash recovery.                         |
| P15               | P27                             | Complete P6 membership validation, one/zero/unknown and no child before parent release.                       |
| P16               | P27/P41/P45/P46                 | Unbound/non-Live/unresolved original setup is not zero or permission to manufacture historical effects.       |
| P17               | P10/P22/P40                     | Original replay before eligibility, new canonical no-op, stale intent conflict and safe late UI results.      |
| P18               | P19/P21/P22/P30/P45             | Permanent identity beyond transport windows/leases and distinction from true later occurrences.               |
| P19               | P18/P19/P27/P30; C15            | Exact sealed submission and possible-call truth, provider/member evidence and no delivery/read inference.     |
| P20               | P19/P24/P28/P30                 | Closed three-cause follow-up allowance and all current fences/earliest windows.                               |
| P21               | P19/P21/P28/P41                 | Original definite-rejection/unknown recovery, no rekey and later legitimate action after safe closure.        |
| P22               | P31–P34                         | Native required/unique/same-scope provenance, immutable facts and safe deletion/transition constraints.       |
| P23               | P33/P34                         | Real effective grants, all DML variants and composed old/new RLS behavior.                                    |
| P24               | P33/P34/P44/P45                 | Functions, views, triggers, raw/API/GraphQL/CMS/collection/operator/service/import/restore paths.             |
| P25               | P34–P36; C18/B03                | One current P12 decision, set-wise governed reads and authorized status/history/error projection.             |
| P26               | P34/P46                         | Actual narrow tenant guard and one-call atomicity; no universal source-authority claim.                       |
| P27               | P25/P26/P28/P29/P38/P39         | Minimal safe material, exact clocks, truthful action, zero readable copy and plain-text/images-off use.       |
| P28               | P15/P35                         | Bounded indexed due/history work, unique pagination, fair continuation and no per-file/history scan.          |
| P29               | P35/P50/P52; B03–B09            | Concrete operational limits, representative real-role plans/cost and threshold behavior before Live.          |
| P30               | P30/P31/P36/P37/P52             | True actors/outcomes/counts and protected business audit versus minimized telemetry.                          |
| P31               | P22/P29/P32/P44                 | Readable retention versus minimal count/identity/stop evidence and safe stale/restore rejection.              |
| P32               | P44–P46                         | Old-writer/mixed-schema/policy/restore compatibility, scoped disable and roll-forward.                        |
| P33               | P25/P41/P43/P47                 | Permanent sender/contact/material/access repair, manual-after-cap and source continuity.                      |
| P34               | P37–P40/P51                     | Composed accessible/locale/mobile/weak-network journeys and current-context results.                          |
| P35               | P22/P42/P48; C24                | Prior purpose independence and permanent source identity during later owner/Workflow adoption.                |
| P36               | P49–P52; C22–C24                | Actual owner/dependency/native/user/load qualification and evidence-stage discipline.                         |

**No unresolved material runtime/source/database/recovery finding remains in the complete corrected package.** All 22 category outcomes, lifecycle and journey cases, bounded limits and residual controls were reconciled against the decision and independent requirements. No extra calendar engine, source permission, provider, automatic enrollment backfill, duplicate effect or hidden native qualification was introduced by the copy edits. The single executed model retains its exact documented limits; no rerun or new proof is claimed for the added text. This is **whole-package review closure only**, with Q48's complete amendments and proposed term still pending user ratification. Only this assigned note changed during this final closure.

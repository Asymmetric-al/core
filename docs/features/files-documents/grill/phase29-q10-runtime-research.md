# Phase29 Q10 research — settle the initial access boundary's scope before its clock

Read-only research, 20 October 2026. Core checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Parent reports Q09 and its complete amendments ratified. This note selects no Q10 option, number, initial-access renewal rule or new staff editing authority.

Source/configuration examples, owner contracts and public Supabase documentation only. No tests were needed or run. No code/config/schema/provider/auth/dependency changes, private rows, credentials or file bytes. Only this research note was written. Configuration inspection was limited to committed non-secret settings and code references; no live hosted Auth settings were queried.

## Review correction and recommended next one question

The first version of this research recommended an issuance-versus-first-entry clock question with a shared overall access ceiling. That recommendation prematurely assigned cross-completion scope to an initial policy whose scope has not been selected. The evidence supports preserving every genuinely binding limit; it does not make every future unfinished-stage deadline an overall limit. This revision supersedes that framing. It changes research advice only, not any ratified decision.

> **For an ordinary new private document request, should the finite initial deadline bound the unfinished stage, with eligible fulfillment while that access is still valid moving into Q07's completed-read policy; or should the initial deadline remain one overall ceiling that also cuts off completed reading?**

Recommend **A — A prospectively declared finite unfinished-stage boundary, followed on eligible timely fulfillment by the already-declared Q07 completed-read rule.** Every independently binding true source cap and current restriction still applies. This makes Q06/Q07's follow-up useful without quietly discarding a limit previously promised to govern all access.

The strongest alternative is **B — One initial overall source-access ceiling that remains binding through completion.** It gives the whole ordinary journey an initial outer end, but completion near it may leave very little completed-read time. Q07 supplies a maximum, not a guaranteed thirty days under B.

This asks what the boundary governs. It does not choose issuance or first entry, the duration or computation formula, staff date-edit authority, automatic renewal, recovery, or another grant taxonomy. The source policy is declared prospectively; ordinary activity does not slide either policy.

Neither design admits completion after ended recipient authority as a means of reviving it. The existing inspected code does not decide the answer. Both need exact owner adoption and qualification before native activation.

## The missing contract

Q09 makes the ordinary requested due date a target. A person can submit late **only while every other relevant permission remains valid**. That does not establish how long initial recipient authority lasts.

Q07 governs the ordinary completed-read period from normal source fulfillment, preserving earlier binding limits. Q08 permits separately qualified fresh **completed-read** authority after a proved ordinary completed-read admission has expired. Neither supplies an initial active-request lifetime or an unfinished-request renewal procedure.

The native profile still needs:

- When initial source authority becomes available and its exact finite end.
- How entry/proof renewal relates to that existing authority without extending it.
- Which exact recipient/request/revision and allowed actions the initial policy covers.
- How a source-confirmed completion intersects the existing end under Q07.
- What truthful permitted help/recovery exists if access ends while work remains unfinished.

Resolve the initial end's unfinished-stage versus overall meaning first. Clock establishment and actual finite values then become a coherent next decision instead of concealing a lifecycle choice in an anchor answer.

## Actual timing examples inspected

| Mechanism                             | Source evidence                                                                            | What the value governs                                           | Why it cannot decide Q10                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Supabase JWT lifetime                 | `supabase/config.toml:151–152` declares 3600 seconds                                       | Local committed Auth token configuration                         | An access token is an authentication artifact, not a native request permission period. Hosted settings were not read. |
| Refresh-token reuse                   | Same file`:157–161` enables rotation and a 10-second reuse interval                        | Authentication refresh/recovery behavior                         | It is neither user inactivity nor a file-request grace period.                                                        |
| Email OTP lifetime                    | Same file`:208–211` declares six-character OTPs and 3600 seconds                           | Local email proof-code configuration                             | Does not authorize a file or select source-purpose lifetime. Q01 proof freshness/binding still needs qualification.   |
| Session timebox/inactivity examples   | Same file`:248–253` has commented-out 24h/8h examples                                      | Inactive local configuration examples                            | Comments are not active behavior or the source's policy. Neither value is adopted.                                    |
| Demo/E2E bypass token                 | `packages/auth/e2e-auth.ts:76–93,278–285`; `packages/api/src/auth/demo-account.ts:291–307` | A one-hour signed test/demo token and matching cookie            | Not the production request-only identity or permission model; never borrow its role/tenant bypass.                    |
| Product work claim                    | `packages/api/src/workflows/claims.ts:7–38`                                                | Default 300-second technical work lease                          | A runner lease is not recipient eligibility, initial admission or a business due date.                                |
| Replay artifact expiry                | `supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:185–205`               | Category-derived replay/debug retention deadline                 | Custody/retention is separate from private recipient authority.                                                       |
| Replay download URL                   | `packages/api/src/eve/retention/control.ts:157–178`                                        | A separately issued 60-second provider URL after artifact lookup | Provider capability lifetime does not establish native current authorization or immediate source revocation.          |
| Document-purpose qualification expiry | `packages/api/src/generated-documents/purpose-catalog/availability.ts:95–99`               | Validity of purpose-qualification evidence                       | Not a recipient session, original request lifetime or default user access count.                                      |
| Current task due date                 | `packages/api/src/missionary-portal/tasks.ts:30–40,81–98`; `task.ts:25–58`                 | Editable task data                                               | Q09 explicitly prevents treating the ordinary requested target as initial permission expiry by accident.              |

These are useful examples of distinct finite clocks. They do not add up to a qualified native request policy, and no value above is recommended as the initial document-access duration.

Current Supabase documentation distinguishes token refresh, session limits and inactivity settings; configured session limits are evaluated on refresh and do not provide the native source's exact request-time end by themselves. The new source must enforce its own current purpose boundary rather than changing global Auth lifetime to a chosen request duration. [Supabase user sessions](https://supabase.com/docs/guides/auth/sessions)

## Owner contracts to preserve and explicitly reconcile

### Shared protected actions

`docs/adr/0025-producer-owned-protected-actions.md:28–33` puts purpose, resource, issuance, credential, expiry, revocation, completion and audit with the producing source. Its deliberate exchange re-proves current state/authority and separately applies required assurance (`:74–92`). The landing/session cookie cannot outlive the action authority.

Therefore a fixed source end can coexist with short/recoverable browser proof and entry credentials. Reissuing an entry mechanism does not necessarily create or extend the underlying source authority. A scanner GET or successful Auth callback cannot be the source's initial permission clock.

### Exact official-document access

`docs/adr/0037-scanner-safe-exact-artifact-access.md:32–35` separates artifact, recipient authority, access grant/session, communication and records evidence. Its fourteen-day guest grant and thirty-minute document-only session are explicit **Phase18 code-owned defaults**, subject to qualification (`:83–88`).

Those defaults are not mere random examples, and this review must not erase them. They govern their own official-document purpose; they do not automatically govern native collection requests. Q01 explicitly preserves unrelated Phase18 access contracts.

### Workflow's proposed external-task expiry

`docs/prds/workflow-studio/01-product-and-experience.md:65–69` describes a named task-purpose session, expiring/revocable/rotatable entry and a **suggested 14-day standard expiry renewable through reauthorization**. Its normative requirement source says external access is task-purpose scoped, expiring and revocable (`contracts/requirements.json:145–156`).

That suggested standard must be reconciled explicitly with the native source; it must not be silently treated as absent, already selected for Phase29, or a permission for automatic renewal. The document-request recipe remains disabled and has unresolved exact source bindings (`contracts/recipe-catalog.json:495–523`). Its suggested scheduling/reminder defaults are also a different concern.

The proper adoption path is the shared source/P4/P12/Workflow owners, not a second file-specific permission system. Whole Workflow Studio is not a prerequisite for native requests.

### Ratified native decisions

- Q01 requires exact recipient/request-purpose confirmation and current authority, with no donor/staff enrollment fallback (`0001-confirmed-recipient-private-document-requests.md:25–56,66–87`).
- Q06 permits independently authorized source processing after recipient access ends and does not revive the recipient (`0006-bounded-completed-request-access.md:35–45`).
- Q07 resolves the completed end from the prospective source policy and then-binding earlier access ends (`0007-fixed-completed-request-access-end.md:22–40`). It preserves independent current restrictions and separates source-access/intake/session/retention (`:42–66`). It does not assign an as-yet unselected initial deadline's scope. The ratification record preserves initial and subsequent **binding** ends (`:87–94`), not every date regardless of meaning.
- Q08 concerns a new finite **read-only** authority based on a proved prior ordinary completed-view admission; its timing/repetition rules remain unselected.
- Q09 leaves the requested target distinct from initial permission and does not choose an extension or grace interval.

The Q07 question provenance also matters: `grill/phase29-q07-question.md:107–139` describes one prospectively declared source policy whose completion rule resolves once, preserves genuine earlier limits, never revives ended authority, and applies prospectively. Its option C kept the predeclared end instead of introducing a completion maximum (`:141–143`). This supports a scope decision; it does not permit retroactive relabeling of a binding end.

## Why prefer the explicit unfinished-stage transition?

Q06 selected useful bounded completed access and Q07 selected its completion-based maximum. An explicit prospective stage transition lets those decisions do their intended work for a recipient who is still eligible when the source fulfills the request. This is a product recommendation, not a result measured from invitation-open or staff-review data.

The smaller implementation concept is one source-owned lifecycle policy with conditional applicability, not a second permission engine:

- While unfinished, every protected recipient operation is bounded by the finite initial-stage policy and current action permissions.
- Only eligible authoritative normal fulfillment while that authority is still valid can enter the already-declared Q07 completed-read policy.
- After that transition, Q07 has its one immutable completion anchor and admitted end, subject to independently binding true caps and current restrictions.
- Source work completed after recipient expiry remains a valid source outcome where independently authorized, but cannot create recipient admission.

The initial end is not merely an upload cutoff. An upload-only limit would leave unfinished status/history/preview/original access needing a separate finite rule. A must actually bound the unfinished recipient stage, including its reads, and must not conflate Q09's requested target with that authority.

The cost is an explicit transition predicate and truthful wording about the changing phase. Staff review that outlasts initial authority still creates the hard case: an on-time file receipt alone is not Q06 fulfillment, and no completed-read window is created merely to make the journey pleasant. An initial duration/recovery decision must address usefulness without hidden renewal.

## Strongest overall-ceiling alternative

B is coherent and simpler to explain as one overall outer promise: all ordinary access ends by the initial ceiling. Fulfillment changes the permitted actions to read-only but never exceeds that ceiling. It can suit a source with a real overall purpose end; such a true cap also remains binding under A.

B's cost is that delivery, recipient work and staff review all consume the same overall allowance. Eligible fulfillment just before that end leaves little completed-read time even though the Q07 maximum is thirty days. This consequence is neither a code bug nor automatically repaired by Q08.

There is no inspected native runtime or existing owner clause compelling B for every new ordinary request. The protection against discarding a genuine cap cannot be used as evidence that an unchosen stage deadline must be such a cap.

## Deferred clock questions remain useful

Once scope is selected, the earlier clock research remains relevant:

| Candidate                                                                | Assessment                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fixed source-declared end before opening                                 | Coherent later clock option; stable, explainable, no activity-driven extension. Exact derivation/count and applicable stage must be explicit.                                                                                                                                                                                            |
| First qualified entry plus separate finite unused/outer bound            | Coherent later alternative; adds activation state and another limit, may give late starters more working time. A latest-entry deadline and a ceiling on the entire working interval are different rules and must not be conflated.                                                                                                       |
| Activity/inactivity interval inside an absolute source cap               | Can be coherent if deliberately adopted, but needs a precise activity definition, multi-device/retry behavior and re-entry rules. It is not inherently insecure; its complexity and need are not established.                                                                                                                            |
| Every visit/login/upload refreshes a period with no absolute outer bound | Can postpone the effective end indefinitely, even though each computed interval has an end. It would require a deliberate source renewal/lifetime policy that has not been selected; do not mistake a rolling token for a qualified finite-purpose lifecycle. It is a weaker ordinary recommendation than the bounded alternatives here. |
| Requested date plus an unstated grace period                             | Q09 selected a target, not this arithmetic. It conflates the two policies and invents a duration.                                                                                                                                                                                                                                        |
| “Until staff mark complete” with no independent end                      | Source completion can be delayed indefinitely or never happen. It does not supply the required finite bound.                                                                                                                                                                                                                             |
| Provider URL/OTP/session expiry                                          | Technical mechanism; cannot substitute for the source's permission lifecycle.                                                                                                                                                                                                                                                            |
| Retention/deletion or worker lease                                       | Different owner and purpose; not a candidate recipient-access policy.                                                                                                                                                                                                                                                                    |

A request-time finite ceiling is not the same as a session idle timeout. The latter can reduce exposure within the same source authority without extending it or choosing when the source grant ends. Do not make logging back in after a session timeout a new grant.

For any later first-entry design, scanner GETs, prefetch, provider delivery/open tracking, unrelated sign-in and callback retry are not qualified activation. There must be a finite unused-access policy and bounded active authority; no first visit cannot mean indefinite eligibility. None of those clock terms is selected by Q10.

## Exact transition and non-revival constraints

**A genuine overall source-authority ceiling remains binding under Q07 in either option.** Do not describe an admitted limit as an unconditional “all access ends” promise and later discard it to supply a full thirty days. A prospective stage deadline is different only because its phase applicability was part of the admitted policy from the outset.

| Case                                                                                                                   | Required result                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eligible source fulfillment strictly before the applicable unfinished-stage end, with then-current recipient authority | Under A, resolve Q07 from that exact source occurrence and preserve independent true caps. Under B, additionally preserve the initial overall ceiling. Neither requires the recipient's browser to remain open. |
| A file was received before the end but source fulfillment happens at/after it                                          | No completed-view admission from the expired authority. Receipt, scan readiness and requested target do not replace Q06 fulfillment. Independently authorized source work may finish.                           |
| Fulfillment was durably eligible before expiry, but a consumer/reply arrives later                                     | Prove the original effect, policy, eligibility and limits; preserve its original Q07 outcome. Current authority still governs disclosure. Processing-time plus thirty days is forbidden.                        |
| Completion eligibility or historical end scope is unknown                                                              | Do not invent the transition or relabel unknown legacy access. Resolve through the source owner; missing permission cannot mean active.                                                                         |
| Prior genuine access cap/revocation/shortening binds completed reading                                                 | It stays binding under either option. Removal of its cause cannot revive or lengthen ended authority.                                                                                                           |
| Request never acquired ordinary completed-view admission                                                               | Q08 does not supply an automatic recovery. It requires proved prior admission and eligible ordinary expiry. Initial expiry recovery remains a separate unresolved capability.                                   |

The transition must share the qualified source completion/correction/currentness boundary required by Q03/Q06/Q07. Q07 already requires trustworthy occurrence after relevant waits and state checks, historical admission plus current authorization, and preservation across retries. No qualified native implementation of that boundary was found; choosing A does not qualify one.

No existing row/end is reinterpreted by the research. A applies only where that phase meaning is adopted prospectively; any later migration needs explicit owner resolution and cannot revive ended access.

## No new date-editing authority is implied

“Source-declared” means an exact result of an approved owner policy before access is exposed. It does not mean every staff member gets a calendar picker or a permission to extend an existing end.

Potential derivations include an approved bounded source profile or an already-governing program end. This research does not choose between those, define who can set them, or select the anchor used to calculate a duration.

Once an end and its scope are admitted, ordinary visits, proof refresh, resends, target-date edits, uploads, review delay and callbacks must not move it by accident. A genuine source shortening remains binding under Q07. A's already-declared eligible phase transition is not a newly granted staff extension. Any other later widening/new authority must follow an explicitly qualified source decision and preserve history; initial active-access renewal is still open.

Existing earlier restrictions and specialized-source policy remain intact. No default can be inferred from NULL, a missing policy, the local Supabase configuration or an unrelated task timestamp.

## Recommended framing and next dependencies

Keep the next founder decision to **a finite unfinished-stage boundary with an explicit timely Q07 transition versus one overall initial ceiling**. The revised recommendation is A. Make the on-time receipt/late staff fulfillment case visible so the stage model is not misread as access lasting until staff eventually finish.

Do not ask simultaneously for:

- A day count.
- Issuance versus first qualified entry, or another computation anchor.
- Whether every staff member may edit the date.
- A fresh-read duration under Q08.
- An automatic reminder/expiry email.
- Renewal frequency, grace or who may reopen intake.

After that answer, resolve the exact native source timing/anchor and useful finite initial period, then any separately selected amendments/recovery. Under A, label the unfinished-stage end honestly and show the Q07 completed end once validly resolved; do not use unconditional all-access wording for a stage-specific limit. Under B, state the overall cap and disclose that it may truncate completed reading. Both retain current permission checks and independent custody/processing.

A complete enabled profile still needs actual finite values and qualification. This scope choice is not permission to activate indefinite access.

No tests or implementation qualification were performed. Current code supplies examples of separate clocks, but no qualified initial native source-access policy. Parent owns the final founder question and canonical owner reconciliation.

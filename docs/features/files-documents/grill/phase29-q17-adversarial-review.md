# Phase 29 Q17 — fixed fresh-read deadline: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected **A — Fix the fresh read deadline at issuance** and ratified
its full required amendment package on 2026-10-21 (Asia/Bangkok), requesting
excellent UX/UI without overengineering. Q01–Q17 are ratified grooming intent.
No implementation, formal publication or activation follows.

This is one clock-model specialization of Q08, for both Q16 origins. It reuses
the intended source command and completed-request experience. It needs one
durably resolved finite end, not another activation stage, renewal system or
timer service. Numerical duration/calculation and repetition remain distinct
product choices; they are not guessed to make this review look complete.

## Evidence and limits

The [Q17 question](phase29-q17-question.md) preserves both practical options.
Independent [owner](phase29-q17-owner-adversarial.md),
[runtime](phase29-q17-runtime-adversarial.md) and
[UX](phase29-q17-ux-adversarial.md) reviews supplement primary documentation,
current source reads and explicit counterexamples. They are engineering review,
not representative-user research or native runtime qualification.

Local HEAD is `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; live develop was
independently rechecked at `e2761135d2952426e15be7d56c1d9680aa7b8c15`.
There is no new delta since the reviewed document-cutover and CI/acceptance
differences. Local/live are separate snapshots; no pull occurred. Code claims
below describe the named local checkout, not a deployed SQL catalog.

| Evidence class      | Established fact or limit                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ratified intent     | Q08 permits qualified new completed-read decisions; Q16 admits both actual lawful completed origins within exact historical scope and current restrictions. Complete fresh timing and repeat policy remain required.           |
| Ratified Q17 intent | Q17 A fixes the finite read end at this new source issuance and uses it for unused access too. The full amended package was ratified on 2026-10-21.                                                                            |
| Current behavior    | Adjacent approval, auth, timestamp, projection, worker and signed-artifact helpers exist. They do not establish a qualified native Q08 grant or prove this clock end to end.                                                   |
| External facts      | Fixed and first-opening expiry both exist in document products. Current PostgreSQL clock/RLS semantics and accessibility guidance reveal qualification requirements, not an Asym duration or entitlement.                      |
| Product judgment    | One known deadline is the clearer, smaller standard for this scoped read-only recovery. Delayed discovery and technical recovery can consume its useful time. B remains a credible alternative.                                |
| Unresolved evidence | Actual native SQL/roles/concurrency/egress/restore, composed browser/AT and intended-user outcomes remain unproved. The full numerical profile, repeat/overlap policy and exact authority qualification still gate activation. |

### Repository reconciliation

Paths are relative to `/home/conrad/code/core`.

| Source                                                                                                                                         | Governing consequence                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`; `docs/ai/document-authority.md`; `openspec/project.md`; platform principles/boundaries                                            | Preserve source ownership, tenant/permission correctness, shared behavior, explicit supersession and publication/activation distinction. Generated views are not second authors.                                                                                          |
| Feature ADR-0008; Q08-C06/C07/C09/C14/C15/C17 and P14/P17                                                                                      | Timing is open; staff review qualified terms, source resolves the actual end, retries recover original effects, outcomes and usable access are separate, and entry/help must be qualified.                                                                                |
| Feature ADR-0016; Q16-C01–C08/P01–P16                                                                                                          | Both proved completed origins have the same consideration rules; actual completed scope, status-only and partial outcomes, current restrictions and unused timing gates remain.                                                                                           |
| Feature ADR-0011:19–64; ADR-0014:19–31,57–79                                                                                                   | Fixed source-issued models are adopted in the unfinished lane, explicitly without choosing Q08. Reuse the sound pattern, not its numbers, later fulfillment transition or a presumed implementation.                                                                      |
| `docs/adr/0025-producer-owned-protected-actions.md:28–50,60–92`; ADR-0037:44–67,83–88                                                          | Source admission, protected credential, confirmation/session and communication are separate. GET/HEAD/scanners have no business effect. Official-document guest/session settings are purpose-specific, not fresh-read defaults.                                           |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1643–1654,1670–1672`                                              | Exact administration/live assignable ceiling, sole grant-state mutation, current use, egress/audit/budgets and continuing owner dependencies govern. Fixed time does not replace them.                                                                                    |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:43–75`                                                                                   | Effects have semantic identities; source facts/currentness outrank callbacks. Fixed expiry continues during pause; source-owned calendar meanings cannot inherit a Studio default without adoption.                                                                       |
| `packages/api/src/eve/approval-budget/control.ts:124–174`; `supabase/migrations/20260718015747_eve_approval_budget_policy.sql:565–572,617–636` | Adjacent approvals and expiry checks exist. NOW remains transaction-start time even after a lock wait. These paths do not establish fresh-read issuance or current-after-wait authorization. This is a copying/qualification concern, not an observed native Q17 exploit. |
| `packages/api/src/projection/resolver.ts:7–46`; `auth/callback.ts:6–17,28–59`; generated-purpose `admission.ts:14–18,37–66`                    | Pure projection acquires no authority; general account callback and application-time purpose stamp are not the new native admission or clock.                                                                                                                             |
| `packages/api/src/workflows/ledger.ts:117–175`; `workflows/recovery.ts:114–139`; `eve/retention/control.ts:157–178`                            | Dispatch identity, worker recovery and a short signed artifact URL are adjacent mechanisms. None owns the fresh-read end or proves every-door expiry.                                                                                                                     |

Q17 would resolve only the **clock/unused model** in Q08-C06 and specialize
Q08-C07/P17's conditional end-display behavior: successful new source issuance
now resolves the actual finite end. Q08-C14 still distinguishes outcome unknown
and current blocked/ended use. An unreadable or missing required end after a
reported commit is a contract/observation problem, not a valid first-entry
activation state. Q08-P14 still gates missing numerical/repeat/type policy.
Q16-C06's conditional end display and C08's anchor/activation/unused reservation
are specialized by this exact choice; their remaining gates survive. Do not
silently rewrite the original-only glossary
term Document Request Access Issuance to mean this new Q08 act.

### Current primary research

| Source                                                                                                                                                                      | Finding and limit                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Digify expiry](https://help.digify.com/en/articles/749264-setting-files-to-expire), 2026-08-18                                                                             | Documents fixed-time and opening-relative expiry, format limitations and separate notification. Both models are credible; a per-file opening event does not fit a status-only request automatically. No optimal Asym period follows.           |
| [Microsoft Entra lifecycle](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-lifecycle-policy), 2025-11-20                       | Describes finite approval-relative assignments and preserves pending/approved request expiries through policy edits. This supports durable admitted terms; Entra approval, editors and extensions are not Core's source effect or selected UX. |
| [Content Snare export](https://contentsnare.com/help/knowledge-base/can-clients-export-a-request/), 2026-05-20                                                              | Optional completed-request PDF export can have a finite window; email is separately conditional. Its completion anchor and settings do not supply fresh Core timing or original-file rights.                                                   |
| [Foundant applicant guidance](https://support.foundant.com/hc/en-us/articles/4479853059991-GLM-Applicant-Tutorial), 2026-04-22                                              | Distinguishes creation/submission dates, completed/historical work and status-dependent actions. Useful contextual clarity; no evidence for this exact regrant clock or forced account enrollment in Asym.                                     |
| [GOV.UK confirmation](https://design-system.service.gov.uk/patterns/confirmation-pages/); [WCAG timing](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) | Explain actual outcomes/next steps and assess interaction timers and exceptions. A long business period does not automatically qualify short proof/session timers. Neither requires another confirmation or a business-grant extension.        |
| [PostgreSQL date/time](https://www.postgresql.org/docs/17/functions-datetime.html); [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                 | NOW is transaction-start time; other clocks do not certify physical commit. Effective RLS composes and privileged roles may bypass it. Real boundary/path qualification remains necessary. No hosted-version or live-catalog claim.            |

The [comparative research](phase29-q17-comparative-research.md) preserves the
strongest B: finite entry allowance followed by a full finite read interval
after timely qualified entry, subject to genuine independent caps. B can
provide a longer total opportunity for an equal reading interval. A removes
that activation state but consumes time during delayed discovery. No evidence
measures which is optimal for Asym; this is an explicit simplicity/usability
tradeoff, not a vendor checklist or invented ministry fact.

## Adversarial check

### What could go wrong with this answer?

“Issuance” could mean a button, email or stale timestamp; retry could calculate
another end. Bind it to the first qualified durable source effect and recover
that effect before considering a new calculation.

### What hidden assumptions are we making?

That the source can prove the issuance and its finite end, and that the later
chosen profile gives intended users enough useful opportunity. Neither is
proved by an existing helper or a polished success screen.

### How does this affect the whole product?

It specializes one Q08 model for both Q16 origins. Original completion,
historical scope, independent permission, communication and custody remain
owned elsewhere. There is no second completion or automatic extension.

### How does this affect the end-user experience?

One actual date is simpler. Late arrival leaves less time; the UX must make
that clear without blame, artificial urgency or an unnecessary Start timer
step. Technical failure and genuine expiry need different recovery.

### Does this follow modern best practices?

Fixed expiry and preserved admitted terms are established patterns.
Opening-relative expiry also exists; B's finite entry window is a proposed
policy. Helpful confirmation, accessible timers and current authorization
support the refined A, not a universal numeric prescription.

### Does this fit Asym’s existing repo and product direction?

Yes through an explicit Q08 specialization using its source/P12 command and
shared experience. Existing unfinished timing is a precedent, not an automatic
rule or ready native implementation for completed reading.

### Should we adjust the recommendation?

Keep A with durable finite outputs, unchanged unused end, correct scoped limits,
same-effect recovery and truthful UX. Leave the full numerical profile and
repeat rules for their actual decisions; add no new permission/timer platform.

## Corrected decision to record

For the standard Q08 Fresh Completed Request Access profile covering both
Q16 origins, the new qualified source issuance must durably resolve and
preserve one finite read-access end under the adopted calculation policy and
applicable source limits. The same end bounds access that is never used.
First entry does not activate another reading period. The event is the new
Q08 source admission, not original issuance/fulfillment, preliminary approval,
staff click, message delivery, credential issue or first observation.

Preserve the exact original effect's issuance/end and policy/limit provenance.
Recover a matching committed intent before recalculating; bind reviewed
material input separately from server-generated admission outputs. Retries,
new transport attempts, visits, proof/session renewal, notification or preview
repair cannot reset the end. Historical replay may describe an already-ended
grant but must not present it as fresh or currently usable. Missing/unreadable
terms require safe reconciliation, not an open-ended or first-entry-pending
success, a guessed deadline or an automatic new effect.

“Fixed” preserves genuine earlier shortening, revocation and current scope.
One grant end does not guarantee every member/action remains available until
it, and a member-only limit must not automatically end unrelated permitted
work. The predecessor's ordinary ended period is historical, not a current
cap that makes Q08 regrant impossible. Genuine continuing purpose/overall
limits remain binding. Temporary proof/representation failure is not by itself
a permanent shortening. Removing a real shortening cause must not silently
extend the admission. Existing fulfillment, receipts, correction lineage,
retention/disposal and already-delivered copies remain unchanged.

Use Q08's existing Grant read access action and completed-request context.
Staff review stable source-authorized terms and controlling limits, with any
estimate labeled before admission. Show the actual resolved end after a
confirmed result under current disclosure authority. Separate issuance,
present usability, proof, representation, notification and outcome uncertainty.
Late arrival gets the actual remainder, with useful source-owned help and no
promise of another period. No extra account, route/timer selector, routine
second confirmation, reupload, automatic message or offline file archive is
needed. Shared accessible controls and honest recovery are required.

Keep the existing source/P12 current mutation and every-door serving boundaries.
Qualify trusted occurrence, checks after relevant waits, boundary-spanning
operations, races and durable recovery; no timestamp function alone proves
the whole contract. The numerical calculation/units, repeat/overlap/cumulative
policy and native qualification still must be resolved before activation.
Q17 does not silently choose days, a formula, staff date editing, a pause,
grace, scheduled start, automatic renewal or another completed stage.

## Ownership, lifecycle and data invariants

The source owns this deliberate new effect, the qualified occurrence, admitted
end, calculation/limit provenance and preserved history. P12/Auth owns exact
current issuance administration and recipient use; custody owns immutable
originals, qualified renditions and disposition; P6/P17 owns separately
authorized communication. UI clocks, caches, mail/analytics events, worker
leases and provider URLs remain subordinate mechanisms.

The grant has one established finite end; current usability additionally
depends on exact identity, purpose, scope, restrictions and content eligibility.
The same admitted result must survive retries and current-default changes.
Use a trusted temporal representation with explicit supported precision/range,
finite required values and owner-approved interpretation. Reject missing,
invalid or nonfinite terms for a new admission; do not admit already-ended
terms as live access. A legitimate expired historical result can still be
reconciled and safely reported. No particular numeric formula is selected.

Persist the original end plus authoritative later limiting facts without
destructive historical rewriting or a hidden second clock authority. Exact
tenant/environment/source/recipient/admission/member/effect relationships,
semantic uniqueness, legal transitions, delete behavior and actor/approval
attribution must be protected structurally or by the sole trusted mutation
boundary. Clients cannot supply authoritative actor, tenant, issuer, timing,
approval, owner or audit values. Permitted updates cannot retarget an admission,
widen its scope or extend its end through a generic patch or default change.
No money/schema feature is introduced by this decision.

Actual effective grants, SELECT/INSERT/UPDATE/DELETE policy behavior, USING
and WITH CHECK, policy composition, column rights, views, RPC/definer/search
paths, service/job/storage paths and related-parent mutations must preserve
these invariants. Omitted ALL/UPDATE WITH CHECK may inherit USING; absence of
the literal clause is not a finding. Tenant RLS alone does not establish the
recipient/action boundary, and privileged paths need explicit enforcement.
No live database qualification is claimed here.

These are outcome distinctions, not a required new enum/table:

| Situation                                         | Valid behavior / forbidden transition                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Review/draft, not dispatched                      | No new grant. Safe exit does not need a revocation.                                                                       |
| Dispatched, result unknown                        | Reconcile the same intent; do not infer failure, cancellation or permission.                                              |
| Actual new issuance committed                     | Required finite end and provenance are resolved durably; current usability still needs its own predicates.                |
| Proof/representation temporarily unavailable      | Owned recovery preserves original terms; no clock pause, new first-entry stage or false permanent rejection.              |
| Genuine restriction or member disposition changes | Apply the actual scoped effect; preserve unrelated currently allowed work where independently proved.                     |
| End reached or source revocation effective        | Current protected use stops according to existing serving fences. No need for a punctual cleanup job to make expiry true. |
| Same old intent recovered later                   | Return the original effect/history only under current disclosure, distinguishing current ended/blocked state.             |
| Required end missing or inconsistent              | Treat as evidence/contract failure with affected use closed; do not manufacture an end or assume no issuance occurred.    |

Expiry comparisons use the actual exclusive end: authorized time is before
it, not at or after it, under the owner’s supported precision. Re-check current
facts after meaningful waits; NOW taken at transaction start is not fresh just
because the expression appears after a lock. Current eligibility and causal
effect serialization still need proof across policy/member/issuer changes and
deadline-spanning commit/read operations. Require the owning source contract,
not a universal new lock service or a claim of perfect physical commit time.

## User journeys and recovery

| Journey                                                           | Required outcome in the existing experience                                                                                                                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Staff reviews and grants either eligible Q16 origin            | One meaningful review, authorized recipient/scope and adopted timing terms; actual end after source success. No arbitrary date picker or file-body read requirement just to administer access.  |
| 2. Recipient enters promptly or much later                        | Same completed context and actual end. Late entry has the remainder; no full new interval, blame or Start timer ceremony. Current Q01 proof still applies.                                      |
| 3. Recipient never enters, changes device or renews proof         | Unused access ends at the same instant. Compatible proof reuse and recovery follow their owners; device/login/visit events cannot restart it.                                                   |
| 4. Status-only or partially unavailable content                   | Actual allowed actions remain clear. A preview failure or one member's earlier limit does not masquerade as whole-grant expiry, and status-only access never promises files.                    |
| 5. Submission of the grant command or its response fails          | Distinguish not dispatched, not committed and unknown. Recover the same semantic effect; a late historic result cannot overwrite newer current state or count as another period.                |
| 6. Issuance committed but handoff/delivery/proof/rendering fails  | Keep the admitted end; show the specific recoverable problem without claiming ready access or email delivery. An unreadable required end is not first-entry activation pending.                 |
| 7. Expiry or restriction occurs during viewing/reconnect/download | Recheck through inherited metadata/byte/cache/range/stream boundaries; show truthful authorized recovery. No promise to recall bytes already received and no offline expiry bypass.             |
| 8. Support, mistaken issuance or old restored data                | Use source-owned diagnosis/revocation/remediation with attributable history. No direct date patch, copy/clone workaround, broad legacy fallback or promise that another grant will be approved. |

Example copy, adapted only where current disclosure is authorized: **Read-only
access ends [actual date, time and zone]**. When necessary, identify a materially
earlier file/action limit in its own context instead of falsely promising all
content until the grant end. **We’re checking whether access was granted** is
for actual outcome uncertainty. **We can’t confirm the access end right now**
can describe an observation failure after known issuance; it must not imply
an indefinite valid period or that the request's files were deleted.

Use existing Base UI/base-maia semantics, main-content status, keyboard/focus,
touch, reflow/zoom, contrast and useful AT announcements. Localize an unambiguous
date/time/zone without changing the authoritative instant; client wall-clock
display is not permission. Avoid hover-only terms, color/countdown-only meaning,
per-second screen-reader chatter and manufactured urgency. No new name/address
fields or Western formatting assumptions are needed. Preserve safe navigation
context across reauthentication without persisting private files offline.

Qualify the composed journey's proof/session/interaction timers independently
of the business grant. WCAG's applicable exceptions do not supply a numerical
grant policy or a blanket security exemption. A screenshot, long duration or
successful keyboard tab alone is not sufficient accessibility evidence.

## Eight exact required amendments

These grooming clauses were ratified on 2026-10-21. Applicable Q08 and
Q01–Q16 controls/proof are inherited with only the explicit specialization.

| ID      | Exact required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q17-C01 | For the standard Q08 profile across both Q16 origins, qualified fresh source issuance MUST durably resolve and preserve one finite read end with its calculation/limit provenance. The same end MUST bound unused access; no separate first-entry activation/reading clock is selected. The event MUST be the new Q08 admission, not original issuance/fulfillment, a click, preliminary approval, credential, delivery, visit or observation. Q17 selects no numeric duration, units or formula.                                                                                                                                                                                                                                          |
| Q17-C02 | Reviewed material input MUST remain bound to one stable deliberate issuance intent, distinct from source-generated occurrence/end outputs. Recover a matching committed effect before any fresh calculation. Retries, new transport keys, resends, proof/session renewal, visits and representation repair MUST NOT reset the end. Conflicting reuse MUST NOT silently replace intent or terms. Missing/unreadable required timing MUST trigger safe reconciliation, not a guessed end, open-ended success or first-entry-pending state.                                                                                                                                                                                                   |
| Q17-C03 | Preserve the admitted end, original completion/submission history and genuine later limitations with their actual scope. Fixed expiry MUST NOT override current restrictions; a member/action-only limit MUST NOT automatically end unrelated permitted work. The predecessor's ordinary ended period MUST NOT be reused as the new grant's cap, while real continuing overall/purpose limits remain binding. Temporary proof/representation failure MUST NOT alone become permanent shortening, and removal of a genuine shortening cause MUST NOT silently extend the admission. Retention/disposal and delivered copies remain separately owned.                                                                                        |
| Q17-C04 | Use the existing source/P12 mutation and current-use boundaries. Qualify trusted occurrence, current issuer/recipient/purpose/scope/limit checks after relevant waits, exclusive-end behavior, deadline-spanning operations and concurrent adverse changes. Required admission/effect/provenance/audit and authorized follow-up MUST commit coherently or use the existing fail-closed recovery contract. No timestamp, early check, worker lease or provider outcome alone proves this contract; no provider call belongs under the source lock. Historical replay MUST require current disclosure and MUST NOT imply current usability or a new grant.                                                                                   |
| Q17-C05 | Effective data constraints/grants/RLS and every direct/RPC/view/function/definer/service/job/storage path MUST preserve exact tenant/environment/source/recipient/member/effect binding, semantic uniqueness, finite valid terms, trusted attribution and immutable historical meaning. An allowed mutation MUST NOT retarget, widen or extend a grant. Protected metadata and byte-serving paths MUST enforce current scope/end and inherited cache/range/stream fences; expiry MUST NOT depend on a browser, punctual sweep or signed URL lifetime.                                                                                                                                                                                      |
| Q17-C06 | Reuse one Grant read access action and the existing completed context. Review stable terms/known limits and label estimates before issuance; show the actual admitted end and relevant scoped earlier limits after a qualified result. Distinguish issuance, current usability, proof, representation, notification and uncertainty. A known unsupported handoff MUST NOT be called ready; late discovery consumes the fixed period. Preserve accessible, localized and mobile/low-bandwidth recovery without new account, timer/mode selector, routine second confirmation, reupload, automatic message or promise of another grant.                                                                                                      |
| Q17-C07 | Apply the profile prospectively through qualified owners and compatible readers/writers/jobs. Preserve original effects and later restrictions through policy changes, migration and restore; do not backfill timing from tasks/emails or recompute missing historical ends using current defaults. Use bounded indexed current proof, authorized pagination and existing operational budgets. Diagnose timing failures through protected source/business/audit evidence without leaking credentials, file contents or sensitive recipient context. No new timer/permission service or permanent browser archive is required.                                                                                                              |
| Q17-C08 | Explicitly specialize Q08-C06's anchor/activation/unused model, Q08-C07/P17's end-resolution behavior and the corresponding Q16-C06/C08 display/model references: successful new issuance resolves the finite end; observation failure does not create deferred activation. Preserve Q08-C14/P14 and all other applicable gates. The complete numeric/calculation profile, repeat/overlap/cumulative policy and exact native qualification MUST be resolved before activation. Q07/Q14/Q15 values/rules, arbitrary dates, future scheduling, pauses, grace, automatic renewal or another completed stage MUST NOT be inferred. Reconcile current owners and declared projections at authorized publication while preserving dated history. |

## Category-by-category adversarial review

Severity describes the potential consequence if controls are omitted;
likelihood is qualitative plausibility, not observed incidence. These are
prospective design/reuse risks, not twenty-one deployed defects. Each row
gives evidence/reasoning, effect on A, exact permanent prevention and proof.

| #   | Category / material concern                                             | What could go wrong, why it matters and evidence                                                                                                                                                                              | Severity / likelihood      | Effect on A; permanent fix and exact clause/proof                                                                                                                                                         |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, alternatives — **Yes**                     | A is simpler but late discovery/technical recovery consumes useful time. Digify documents B too; no Asym usage study establishes the better profile.                                                                          | Medium / plausible         | Retain A as explicit product judgment, acknowledge cost and qualify intended-user opportunity with the eventual profile; do not grant unnecessarily to repair valid access. C01/C06/C08; P01/P12–P14/P16. |
| 2   | Brittleness — **Yes**                                                   | A timestamp from click, approval, callback or NOW after a wait is assumed to be the real source act. Current helpers do not prove Q08 admission.                                                                              | High / plausible           | Trusted source occurrence and durable resolved output; qualify waits and recovery. C01/C02/C04; P02/P04–P07.                                                                                              |
| 3   | Technical debt — **Yes**                                                | Date calculation is duplicated across apps/mail/jobs or generic defaults rewrite old ends. Shared boundaries and Q08 effects would diverge.                                                                                   | Medium / plausible         | One source-owned result and shared presentation; preserve policy provenance instead of copied arithmetic or a new timer service. C01/C02/C07; P04/P15/P16.                                                |
| 4   | Edge cases — **Yes**                                                    | Never-used/status-only, response-after-expiry, missing end, partial content, DST/precision and zero remaining opportunity are mislabeled. Q08/Q16 already separate these states.                                              | High / plausible           | One unused end, scoped current checks, truthful historic/unknown outputs and explicit future calculation qualification. C01–C04/C06; P03/P05/P07/P08/P12–P14.                                             |
| 5   | Footguns — **Yes**                                                      | Resend or retry creates more time; staff manually edit dates; a recovered old success announces a fresh grant. Q08 stable-effect rules forbid these shortcuts.                                                                | High / plausible           | Recover immutable same-intent outputs and reject conflicting inputs; no general end editor or optimistic success. C02/C04/C06; P04/P05/P12/P13.                                                           |
| 6   | Tenant safety — **Yes, inherited**                                      | Idempotency/cache/end lookup binds the wrong tenant, recipient, request or completed root. Time correctness alone cannot protect private content.                                                                             | Critical / plausible       | Exact trusted relationship and disclosure binding through both origins and all caches/replay paths. C04/C05; P01/P09/P10.                                                                                 |
| 7   | Database, RLS and authorization — **Yes, inherited**                    | A permitted UPDATE moves scope or extends an end; privileged writers bypass ordinary policies; stale clock checks pass after waits. PostgreSQL composition/bypass semantics and adjacent SQL warrant proof.                   | Critical / plausible       | Effective old/new-row policies, protected fields, constraints and sole current mutation boundary, including privileged paths and native races. C04/C05; P06/P07/P09/P10.                                  |
| 8   | Overengineering — **Yes**                                               | One chosen clock becomes a per-staff policy menu, activation service, timer-per-grant system or new portal. No selected behavior needs these.                                                                                 | Medium / plausible         | Reuse Q08 command/context and current checks; no speculative abstraction. C06–C08; P13/P16.                                                                                                               |
| 9   | UX/UI and friction — **Yes**                                            | Late arrival promises a full interval, missing end looks like activation pending, unavailable content is called expired, or countdown-only copy confuses users. Primary UX guidance favors truthful results and next actions. | High / plausible           | One actual date with scoped limits, distinct recovery states and composed accessibility; no extra ceremony. C02/C03/C06; P05/P08/P12–P14.                                                                 |
| 10  | Source of truth, ownership and invariants — **Yes**                     | UI, email or provider URL owns a competing end; the original completed clock is reset. Source owners explicitly separate them.                                                                                                | High / plausible           | Preserve the new effect's trusted end/provenance and previous truth; technical clocks remain subordinate. C01–C05; P02/P04/P10/P11.                                                                       |
| 11  | Hidden coupling — **Yes**                                               | Q14's thirty days, credential/session expiry, worker pause or minimum of unrelated member dates controls the whole grant. Q08 and Q16 reserve numerical policy and scope.                                                     | High / plausible           | Separate grant end, scoped restrictions and mechanisms; no imported duration, full-request cutoff or extra completion. C01/C03/C08; P07/P08/P11/P16.                                                      |
| 12  | Failure modes — **Yes, inherited**                                      | Commit succeeds but reply/audit projection/delivery fails, prompting duplicate issuance; a missing end is silently defaulted. Q08 requires coherent source effects and distinct outcomes.                                     | High / plausible           | Reconcile exact effect, preserve unknown/contract failure, current safe replay and independent secondary recovery. C02/C04/C06/C07; P04–P06/P12/P15.                                                      |
| 13  | Lifecycle, time, concurrency and idempotency — **Yes, inherited**       | Clock/policy/authority changes during waits, a boundary passes before serving, or a new transport key resets history. Application time alone is insufficient proof.                                                           | Critical / plausible       | Source-owned serializable effect/currentness contract, exclusive boundary tests and immutable retry outputs; no activation restart. C01–C05; P03–P10.                                                     |
| 14  | Data integrity — **Yes**                                                | Original end is recomputed after policy change, real shortening is erased, or replay binds a different root. This corrupts historical permission and staff explanations.                                                      | High / plausible           | Preserve original output/limit provenance and trusted same-scope identity; separate current projection from history. C02/C03/C05/C07; P04/P08/P09/P15.                                                    |
| 15  | Security and privacy — **Yes, inherited**                               | Valid date is treated as sufficient permission, protected metadata leaks in error/history, or old URLs keep serving. Q04/Q05/Q08/P12 still govern all doors.                                                                  | Critical / plausible       | Current exact authority, restricted diagnostic disclosure and byte/metadata delivery fences; no retained-copy authorization. C04–C07; P09/P10/P12/P15.                                                    |
| 16  | Scalability and performance — **Yes**                                   | Every read scans grant histories or correctness needs one resident timer per grant and a punctual global sweep. Q08 requires bounded work and source-owned truth.                                                             | Medium to high / plausible | Indexed exact current proof, scoped pagination and existing declared budgets; clock expiry is enforced on use. C05/C07; P10/P16.                                                                          |
| 17  | Operational burden — **Yes**                                            | Support routinely patches dates, reissues unknown outcomes or asks recipients to prove old use. Such repair cannot establish actual source truth.                                                                             | Medium to high / plausible | Source-owned reconciliation/remediation and clear recipient help; missing policy is an activation gate, not a support workaround. C02/C06–C08; P04/P05/P12/P15/P16.                                       |
| 18  | Observability and auditability — **Yes, inherited**                     | Logs collapse admitted end, later limits, current permission and delivery, making incorrect access impossible to diagnose; raw metadata leaks in telemetry.                                                                   | High / plausible           | Minimal durable business/authority evidence, separate communication/technical events and current protected diagnostic views. C02/C04/C07; P04/P12/P15/P16.                                                |
| 19  | Dependencies and integrations — **Yes, inherited**                      | Provider delivery/open/URL clocks become authority or provider retry creates another period. Current comparators expose separate controls, not a native Core contract.                                                        | High / plausible           | Source end remains authoritative; provider events/credentials use inherited owner contracts and exact-effect recovery. C01/C02/C04/C05; P02/P04/P10/P12.                                                  |
| 20  | Migration, rollout and upgrades — **Yes**                               | Legacy null end becomes now-plus-default; older code keeps first-entry behavior; restore loses a later restriction.                                                                                                           | Critical / plausible       | Prospective qualified mapping, compatible versions, evidence-based legacy handling and adverse-state restoration; no broad backfill. C05/C07/C08; P15/P16.                                                |
| 21  | Testability, traceability and proof — **Yes**                           | A source timestamp unit test is sold as native proof, or old optional-activation text remains current beside A. No native Q08 implementation was established.                                                                 | High / plausible           | Exact successor mapping and falsifiable source/role/race/UI/restore proof, with honest evidence levels. C08; P01–P16.                                                                                     |
| 22  | Other development hazards — **No additional independent concern found** | Checked new money precision, payment changes, vendors/packages, international identity fields, public sharing, automatic notification and general-drive scope. This model requires none.                                      | Not applicable             | Preserve exclusions and inherited owners; no added subsystem or numerical limit. C08; P11/P16.                                                                                                            |

## Focused acceptance proof

These future qualification groups supplement Q08/Q16. They are not runtime
tests asserted to have run here.

| ID      | Falsifiable outcome                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q17-P01 | Both Q16 historical origins use the same qualified Q08 source-issued end model within their actual ceiling/current scope; no regression to original-only or widened membership.                                                                                                                                                                                                                     |
| Q17-P02 | Draft/click/preliminary approval, original issuance/fulfillment, credential, generic auth callback, mail acceptance/open, scanner GET/HEAD, first visit/render/download and observation cannot supply or restart the fresh end.                                                                                                                                                                     |
| Q17-P03 | Never-used, promptly-used, late-used, status-only, different-device and repeated-proof cases preserve the same actual end; no first-entry stage, pause or sliding renewal occurs.                                                                                                                                                                                                                   |
| Q17-P04 | Same deliberate intent across clicks, transport keys, retry after current-default change and already-expired historical replay recovers the original occurrence/end/provenance under current disclosure. Changed material input conflicts without replacing intent or recalculating an end.                                                                                                         |
| Q17-P05 | Lost reply, incomplete projection, missing/unreadable required timing and ambiguous commitment are reconciled distinctly. No guessed default, open-ended permission, activation-pending success, false absence or duplicate issuance results.                                                                                                                                                       |
| Q17-P06 | Real source concurrency covers issuer/recipient/purpose/member/policy/restriction changes, lock waits, serialization retries and boundary-spanning commit/read. A transaction-start NOW check is not accepted as proof of fresh currentness. Required effect/audit/follow-up remains coherent; no provider calls under source lock.                                                                 |
| Q17-P07 | The eventual adopted profile proves supported finite values/precision/range, invalid/null/nonfinite/ended-new-admission rejection, applicable calendar/DST/leap boundaries and before/at/after exclusive end. Historical ended-effect recovery remains valid. No numeric formula is inferred from Q17.                                                                                              |
| Q17-P08 | Genuine overall shortening/revocation stays effective; member/action-only limits do not globally expire independently allowed work. Old ordinary expiry does not cap the new period. Technical proof/preview failure is not permanent shortening; clearing a real shortening cause cannot silently extend the same admission.                                                                       |
| Q17-P09 | Actual anon/recipient/staff/delegated/service/job roles and table/RPC/view/definer/storage paths reject forged tenant/actor/approval/end/root and forbidden old-to-new-row transformations. Relationship, uniqueness, finite-state and attribution protection holds through parent changes too.                                                                                                     |
| Q17-P10 | Protected status/history/count/order/replay/cache and preview/original/HEAD/range/conditional/resume/active-stream paths apply current permission and actual end with inherited fences. Stale signed URLs, service workers, cached pages and punctual-worker assumptions cannot bypass authority; already-emitted bytes are not promised recalled.                                                  |
| Q17-P11 | Source fulfillment, previous deadlines, receipts, submitted originals/corrections, acceptance, Q16 scope, retention/holds/disposal and independent rights remain intact. No next completed stage, upload/correction reopening or drive scope appears.                                                                                                                                               |
| Q17-P12 | The eight journeys distinguish issued, current usable/blocked/ended, proof/render/notification failure and unknown. Missing end after issuance is a contract/observation failure; a delayed old success cannot replace current state. Unsupported handoff is not called ready.                                                                                                                      |
| Q17-P13 | Staff review source-authorized stable terms and accurate limits, with labeled estimates then actual end; ordinary unchanged time does not trigger repeated confirmation. Recipients see the real remainder and useful safe help, with no arbitrary date/mode selector, forced account/reupload or assumed repeat approval.                                                                          |
| Q17-P14 | Composed browser/AT testing covers focus/names/status, keyboard/touch/reflow/zoom/contrast, localized date/time/zone and names, low-bandwidth/reordered-response recovery and separate proof/session/UI timer criteria. No countdown-only, hover-only, automatic-download or screenshot-only qualification.                                                                                         |
| Q17-P15 | Prospective activation, old/new reader/writer/job compatibility, missing legacy fields, changed policies, restore and kill/roll-forward preserve real ends and later adverse facts. No first-entry fallback, now-plus-default backfill, historical rewrite or private serving before reconciliation.                                                                                                |
| Q17-P16 | Production-shaped tenant skew/history/concurrency/egress meet declared numeric owner budgets with bounded indexed proof/pagination. Trace clock choice and unchanged gates through owner/OpenSpec/design/tasks/issues/tests/release. Missing calculation/repeat/type qualification still blocks issuance; no duration, quota, new vendor/service or blanket accessibility exemption is smuggled in. |

## What was actually verified

Current source/owner reads, primary-document verification and three independent
engineering reviews tested the decision's assumptions against explicit timing,
scope and recovery counterexamples. Deterministic record checks cover all
categories, clauses/proof groups, preserved prior decisions, links and status.

No new runtime suite, real SQL/RLS/concurrency experiment, provider action or
composed browser/AT/user study was performed. Existing task/projection/approval/
artifact helpers and previous mocked passes are not native Q17 proof. No
private records or credentials were used. The adopted duration and native
capability are not being claimed as complete through a documentation review.

## Synthesis and required order

1. **Ratified decision:** Conrad adopted the new source occurrence/resolved-end
   rule, unused behavior, output-versus-input identity, scoped earlier limits and
   truthful missing-end recovery. The eight clauses complete this model choice.
2. **Remaining product decisions:** choose one complete finite numerical/
   calculation profile, then resolve the remaining fresh-read repeat/overlap/
   cumulative rules. Both Q16 origins use the resulting standard under genuine
   source restrictions. No numerical default is chosen here.
3. **Authorized spec/design integration and before activation:** specialize
   current Q08/Q16 clauses and declared projections; use the existing source/
   P12/shared-UI paths; qualify actual data roles, causal/current checks, serving,
   recovery, migration and intended-user/accessibility journeys. Keep policy
   requirements precise without freezing a speculative schema or timer system.
4. **After activation:** use the existing source/security/UX/operations owners
   and controls below. Timing correctness and tenant safety are release gates,
   not risks accepted solely because monitoring exists.

## Residual operational controls

These use existing responsibilities. Numerical performance/recovery budgets
must be declared and qualified before activation; this model invents no period,
service-level threshold or new telemetry product.

| Signal                                                                                                             | Threshold                                                         | Accountable owner                        | Response                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Same intent yields different occurrence/end, or successful new issuance lacks a valid finite end                   | Any confirmed occurrence                                          | Native source mutation owner             | Contain affected issuance/use; reconcile original effects/provenance without resetting time; add exact regression proof. |
| Cross-tenant/recipient disclosure, serving after actual authority end or ignored current restriction               | Any confirmed occurrence                                          | Authorization/security and source owners | Contain the path, preserve minimal evidence, remediate current grants and requalify every affected door.                 |
| Late-entry full-period promise, missing-end activation label, or one member failure falsely ending the whole grant | Any reproducible material journey defect                          | Product/UX and source owner              | Correct state/scope/copy and retest the real journey without widening rights.                                            |
| Unknown outcome remains unreconciled or notification retry creates another period                                  | Any duplicate effect or adopted recovery-budget breach            | Source operations/runtime owner          | Recover exact semantic effect and separate delivery outcome; stop unsafe reissue/default-date fallback.                  |
| Deadline/current-proof/history/egress operations exceed declared budget                                            | Any adopted numeric budget breach                                 | Runtime/database owner                   | Repair indexed bounded work/currentness and scoped pagination; never bypass proof or invent eligibility quotas.          |
| Missing numerical/repeat policy, incompatible reader/restore or failed critical timer/accessibility case           | Any failed required release case or confirmed critical regression | Release, source and accessibility owners | Gate affected activation; obtain the actual product decision or repair/roll forward, then repeat required qualification. |

## Recorded outcome

Q17 A and the full required amendment package were ratified on 2026-10-21.
**Accept with required amendments** was the review disposition. The corrected
decision, Q17-C01–C08, Q17-P01–P16, eight journeys and six operational controls
are adopted with inherited safeguards and explicit Q08/Q16 clock-model
specialization.

All seventeen glossary terms remain unchanged; no new term is required.
No product code, permission, provider, dependency or retention change is made.
Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.
The complete numerical/repeat policy and Q18 remain unselected. The intended
experience stays one read-access action, one actual finite end and clear recovery.

## Founder ratification — 2026-10-21

Conrad instructed: “Yes, ratify Q17 A with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the complete corrected decision, Q17-C01–C08, Q17-P01–P16,
eight journeys, six operational controls and explicit successor mapping without
substantive change. Evidence limits remain intact: no native implementation or
source/SQL/RLS/race/provider/browser/AT/user qualification follows. Numerical
calculation/profile, repetition and Q18's answer remain separate and unselected.

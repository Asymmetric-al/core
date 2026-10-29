# Phase 29 Q10 — finite unfinished and completed stages: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected and then ratified **A — Separate finite unfinished and
completed stages** with the exact corrected decision and complete required
amendment package on 2026-10-20. Q01–Q09 remain ratified. This is adopted
grooming intent, not formal specification publication, implementation or
activation.

## Evidence and limits

Local Core and live GitHub `develop` were reverified at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The review combines source and
migration inspection, governing owner contracts, current primary documentation,
and independent [owner](phase29-q10-owner-adversarial.md),
[runtime](phase29-q10-runtime-adversarial.md) and
[UX](phase29-q10-ux-adversarial.md) passes.

- **Ratified intent:** exact recipient/current authority, immutable correction
  lineage, qualified own-file reads, finite completed access, the 720-hour
  completed maximum, strict preservation of binding limits and Q09's
  non-authorizing requested target.
- **Current source:** task completion timestamps, workflow ledgers, locks and
  outbox mechanisms provide adjacent implementation evidence. The bounded
  census does not establish a qualified native two-stage request policy.
- **External evidence:** products distinguish collection, completed outputs,
  links, sessions and retention. Their permission models and numbers are not
  Core policy or implementation proof.
- **Product judgment:** a finite period for following up on completed work is
  more useful than only the unused remainder of an unrelated stage deadline.
  A increases possible original access time compared with B; this is a real
  tradeoff, not a claim that A is universally safer.
- **Unknown:** initial duration/anchor, exact native source capability and
  transaction mapping, actual real-role/database/provider behavior, and
  representative recipient/staff usability remain unqualified.

Severity below describes prospective consequence if an omission is implemented.
Likelihood is qualitative engineering judgment, not an observed incident rate.
No production native-stage vulnerability or measured ministry workflow is claimed.

Selected source evidence, relative to `/home/conrad/code/core`:

| Evidence                                                          | Meaning                                                                                                                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ai/document-authority.md:10–48`; `openspec/project.md:6–18` | Ratified owner intent, generated projections, implementation and qualification remain distinct.                                                                |
| Feature ADR-0003:18–51; ADR-0006:22–55                            | Correction admission fences the predecessor; normal fulfillment is source-owned; independent source work can finish without recipient revival.                 |
| Feature ADR-0007:22–66                                            | One original fulfillment anchor, at most 720 elapsed hours, preserved applicable caps, historical eligibility plus current authorization, no implicit restart. |
| Feature ADR-0008:19–39,71–76; ADR-0009:18–64                      | Fresh access needs its actual prior admission; a requested-by target grants no permission and does not rewrite receipt history.                                |
| `docs/adr/0025-producer-owned-protected-actions.md:28–50,74–92`   | Producer owns authority; entry, proof and sessions retain their own current checks and expiry.                                                                 |
| `docs/adr/0037-scanner-safe-exact-artifact-access.md:32–35,55–88` | Official artifact, authority, session and delivery are separate; specialized defaults cannot be transplanted.                                                  |
| `docs/prds/workflow-studio/03-runtime-and-recovery.md:15–59`      | Exact source outcomes, atomic fact/outbox intent, semantic idempotency, lease uncertainty and lost-event reconciliation.                                       |
| `docs/prds/workflow-studio/04-data-and-api-contracts.md:88–102`   | Trusted context, final authorization, replay disclosure, scoped caches and compatible contract evolution.                                                      |
| `packages/api/src/missionary-portal/task.ts:38–58,81–97`          | Current generic task completion can be set/cleared with application time; it is not immutable native fulfillment.                                              |
| `supabase/config.toml:34`                                         | Local PostgreSQL major version is 17; no deployed-version claim.                                                                                               |

The supporting reviews give the broader file census, exact source references,
test details and limitations.

## Adversarial check

### What could go wrong with this answer?

A stage label could be used to evade a real overall expiry. Conversely, an old
unfinished-expiry worker could terminate a valid completed view. Repeated
complete/reopen actions could restart 30 days, or a delayed worker could use its
current time as the completion anchor. A recipient who submitted on time could
lose access while staff reviews, then be falsely told they failed the task.

### What hidden assumptions are we making?

The design needs an exact, trustworthy source fulfillment occurrence and
historical eligibility, not merely a `completed_at` field. It must distinguish
an unfinished-stage limit from independent overall limits from the outset.
It cannot assume the recipient is online at completion, that a short-lived
entry credential lasts as long as the completed authority, or that all source
outcomes qualify as normal fulfillment.

### How does this affect the whole product?

This is one source-owned lifecycle policy, not two permission engines.
The requesting domain owns fulfillment and recipient admission; P4/P12,
custody, Workflow, shared tasks and communications retain their existing roles.
Specialist application, care, financial, official-document and publication
contracts are not replaced by a generic file-request stage.

### How does this affect the end-user experience?

The page must answer who needs to do what, what was received, and what access
remains. The requested target, unfinished access end and actual completed-read
end are different facts, but need not become a technical lecture or three
competing countdowns. Show the current relevant boundary and a concise
explanation of the conditional completed period. Staff need the same factual
context without a new manual approval just to transition stages.

### Does this follow modern best practices?

- [Content Snare's export guide](https://contentsnare.com/help/knowledge-base/can-clients-export-a-request/)
  documents optional request-PDF access after completion. Its
  [older request FAQ](https://contentsnare.com/help/knowledge-base/requests-faq/)
  describes completed requests as inactive with ordinary client access ended.
  These support capability-specific treatment; neither proves general
  original-file reading or Core's exact stage transition.
- [Foundant follow-up logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic)
  distinguishes submission, administrator completion and later viewing.
  It does not select an initial lifetime or authorize reopening.
- [Microsoft sharing settings](https://learn.microsoft.com/en-us/sharepoint/turn-external-sharing-on-or-off)
  distinguishes guest permission expiry, reauthentication and links. These
  reinforce separate authority and credential lifetimes, not an imported
  tenant membership or renewal model.
- [W3C timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
  requires assessment of actual content-set timers and applicable mechanisms
  or exceptions. A 30-day maximum does not prove shorter session/proof flows
  conform, and “security” is not a blanket exemption.
- [PostgreSQL 17 time functions](https://www.postgresql.org/docs/17/functions-datetime.html)
  distinguish transaction-start from actual current time. A lock wait can
  cross a boundary; a timestamp recorded before that wait is not proof that
  the protected transition happened while eligible.

The comparison supports clear source states and bounded rights. It does not
establish a universal stage policy, a measured nonprofit need or an optimal
initial number of days. No extra vendor, editor or scheduling product is needed.

### Does this fit Asym’s existing repo and product direction?

Yes, prospectively and with exact limit scope. Q07 preserves limits that
genuinely bind completed authority; Q10 explicitly chooses the scope of the
previously unselected ordinary unfinished-stage deadline. It does not declare
that an existing overall end was advisory. Current task timestamps, session
TTLs and the unqualified generic document recipe cannot decide this policy.

### Should we adjust the recommendation?

Keep A. B remains a credible simpler overall ceiling with less possible access
and less conditional timing, but it can leave almost no useful completed view.
A must preserve finite unfinished access, exact transition ordering, binding
overall restrictions, truthful expiry-during-review behavior and the lack of
automatic revival. Those are required amendments, not optional hardening.

## Corrected decision to record

For prospectively qualified ordinary Private Document Requests, declare one
source-owned policy with a finite unfinished-recipient stage and the separately
bounded completed read-only stage already defined by Q06/Q07. The unfinished
deadline governs access while the request remains unfinished; it is not also
an overall cap on a validly admitted completed stage merely because it is a date.

Only exact, durable normal source fulfillment occurring while the applicable
unfinished authority remains valid, together with proved policy and recipient
eligibility, SHALL admit the completed stage. Submission, scan success, generic
task completion, browser activity, email, staff intention or a backdated field
SHALL NOT substitute. At or after an exclusive unfinished end, later actual
fulfillment SHALL NOT revive recipient authority. Independently authorized
source work may still finish without a completed-recipient admission.

Resolve the completed end once from the original trustworthy fulfillment
occurrence, using Q07's maximum of 720 elapsed hours and every applicable
independent overall limit. Preserve current restrictions and genuine
cross-stage shortening. Existing/unknown limits SHALL NOT be reclassified to
stage-only; new scope must be declared and proved prospectively. Missing policy
or historical eligibility SHALL NOT imply permission or a full interval.

Durably committed fulfillment whose qualified occurrence and eligibility were
before the unfinished end remains the source of its original transition even
if a consumer runs later. Recovery
SHALL preserve that original occurrence/end and require current authority;
it SHALL NOT use processing-time plus 30 days. Expiry workers, caches and stale
screens SHALL NOT terminate or revive access from an outdated stage projection.

The transition SHALL close ordinary recipient submissions/corrections, preserve
Q03's exact review lineage, and admit only the source-approved recipient,
purpose, current own-submission scope and permitted read actions. Later
invalidation, new work, factual correction or remediation SHALL preserve
history and follow its source; no complete/reopen/complete loop resets the end
or silently restores intake, old bytes or another recipient's rights.

Keep business completion, recipient admission, current authorization, proof/
session validity, file availability and notification outcomes distinct.
The stage transition does not lengthen an entry credential, session or provider
capability. Use qualified re-entry or compatible proof reuse when needed.
No extra recipient confirmation, staff approval, message or new account is
introduced solely to enter the already-authorized completed stage.

Use the same accessible request context with truthful receipt/review status
and the actual applicable end. If staff review outlasts unfinished access,
explain the access consequence without blaming the recipient or inviting
duplicate upload; provide real owned help without promising an unselected
extension. Initial duration/anchor, active-expiry recovery and Q08 fresh timing
remain explicit separate decisions and qualification gates.

## Ownership, time model and invariants

| Fact                                 | Owner and invariant                                                                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy applicability and limit scope | Requesting source with P4/P12. Distinguish the unfinished-stage end from independent overall/purpose/security limits in the original admitted policy.       |
| Submission and correction            | Source/custody boundary under Q03/Q09; exact immutable receipt and lineage remain true across stage changes.                                                |
| Normal fulfillment                   | Source's durable outcome for the exact request/evidence revision, with trusted actor/time; no UI or timer shortcut.                                         |
| Completed admission                  | Source-owned consequence of the declared policy plus exact at-fulfillment eligibility. It is distinct from the business outcome and its later presentation. |
| Actual private reading               | Current Q01/P4/P12 authority plus Q04/Q05 scope and representation eligibility on every protected path.                                                     |
| Task/status/projection               | Shared source-authorized read model; cannot approve, reopen, extend or mint authority.                                                                      |
| Worker/session/entry/delivery        | Supporting mechanisms with their own valid scope and lifetime; none resets a business period.                                                               |
| Retention/holds/disposal             | Existing source/custody owners; neither stage end deletes records or grants access to retained bytes.                                                       |

For explanation, let `U` be the admitted unfinished-stage exclusive end and `F`
the original trustworthy normal-fulfillment occurrence. Eligible transition
requires `F < U` and all other actual predicates; numerical comparison alone is
not authorization. The originally admitted completed end `E` is no later than
`F + 720 elapsed hours` and any independently binding earlier cap. `E <= F`
cannot provide a usable completed admission. Subsequent genuine shortening and
current vetoes remain effective under Q07.

For this original two-stage policy, when no other earlier end applies,
`E <= F + 720 hours < U + 720 hours`. This demonstrates boundedness without
selecting an initial lifetime. It does not bound separately authorized Q08
fresh access or justify an unlimited initial `U`. PostgreSQL infinity,
missing values or an unset first-entry policy cannot silently mean forever.

Preserve every limit's actual applicability. A source action genuinely
changing only an unfinished deadline changes transition eligibility, not an
unrelated completed cap. A true overall/security/purpose shortening survives
the stage transition. Q10 grants no new edit power and cannot guess scope from
a column named `expires_at`, an error code or whichever end is inconvenient.

The transition, receipt/correction/current review set and adverse authority
changes need one relevant serialized source order. Compare current state
after waits and preserve the trusted occurrence. Locking a row does not prove
that other permission rows, absent admission rows or the clock are current.
Use qualified transactions/CAS/constraints and durable source effect intent,
not provider calls while holding a lock or an in-memory worker mutex.

`F` is the qualified authoritative source occurrence/linearization point whose
effect must durably commit. An internal SQL timestamp is not a physical commit
timestamp. The source contract must explicitly qualify a transaction spanning
`U`, including candidate `F < U` with commit after `U`, relevant later waits,
rollback and unknown-commit recovery. It must not select an early internal
timestamp merely to manufacture eligibility. This chooses a required proof
boundary, not a universal database timestamp function.

Preserve required fulfillment, historical admission basis, exact scope,
result/end and audit/effect intent atomically where they share a database,
or through an equivalent recoverable fail-closed owner contract. A missing
optional recipient admission must not block an independently permitted source
completion. Record the business outcome truthfully; deny unsupported reads and
reconcile only from the original evidence. Never manufacture past eligibility.

### Lifecycle and boundary matrix

These are contract examples, not measured ministry events.

| Event or situation                                                        | Required source/recipient result                                                                                                                        |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft/request not yet admitted                                            | No implicit recipient rights or clock from a draft timestamp. Initial activation policy remains separately defined.                                     |
| Unfinished and currently authorized                                       | Exact allowed submission/correction/read actions remain available; Q09 target passage alone changes no authority.                                       |
| Candidate received and awaiting checks/review                             | Preserve receipt and actual next actor; no premature completion or recipient-overdue blame.                                                             |
| Source already permits a valid non-file/manual/waived fulfillment outcome | Use that exact governing predicate and evidence. Do not invent a required file count or universal all-previews-ready gate; no new waiver power follows. |
| Normal fulfillment before U with proved eligibility                       | Close ordinary writes and resolve the one completed admission/end under the declared policy.                                                            |
| Actual fulfillment exactly at or after U                                  | No transition from expired authority; source business work may still finish independently.                                                              |
| Fulfillment before U, event/reply arrives after U                         | Recover the original eligible transition with current authorization; do not use U alone to reject it or processing time to extend it.                   |
| Historical policy/eligibility unprovable                                  | No invented completed admission. Distinguish verification unavailable from known ended permission; preserve independently proved source work.           |
| Independent overall cap before the nominal completed end                  | Preserve that cap, even under A. No guaranteed full 30 days.                                                                                            |
| Expiry worker scheduled under old unfinished state runs after fulfillment | Recheck the authoritative effect/policy/version. A stale command cannot expire the completed stage.                                                     |
| Revocation or real cross-stage shortening races fulfillment               | One lawful source ordering; historical eligibility never defeats a current veto or restores an earlier longer end.                                      |
| Correction races fulfillment                                              | Q03 exact candidate/evidence-set ordering prevents certifying a superseded predecessor. If fulfillment wins, deny ungranted correction.                 |
| Fulfillment response is lost                                              | Recover the same business effect and admission result, with current disclosure checks; never submit “complete” again as a new event.                    |
| Recipient proof expires, completed authority remains valid                | Qualified re-entry can restore allowed current context without extending source time or auto-downloading.                                               |
| Preview unavailable during valid completed access                         | Show file-specific truth and permitted recovery; no extension, substitute file or false whole-request expiry.                                           |
| History fails while current files remain independently authorized         | Preserve the allowed file actions, report history unavailable rather than empty, and recover the projection without changing authority.                 |
| Completed end reached                                                     | Deny affected protected operations under Q04/Q07, even if cleanup/scheduled work is delayed. Preserve source history and custody.                       |
| Completion later invalidated or new evidence needed                       | Use source-owned correction/remediation; no silent reopening or reset. Current reads may narrow through actual owner restrictions.                      |
| Request canceled, rejected or withdrawn without normal fulfillment        | Preserve the actual source outcome. It does not automatically qualify as the completed view selected by Q06.                                            |
| No original completed admission ever existed                              | Q08 cannot be used as a shortcut to invent one. Governed help does not itself grant access.                                                             |

Current authority includes appropriate continuing delegation/issuer dependencies
for the actual grant type; neither routine staff departure nor an online
recipient session is invented as a universal transition requirement.

A stale expiry record that was incorrectly persisted is not permission to
ignore all Expired or Revoked states. Correct the proven derived error through
the source's attributable repair path while preserving history and genuine
adverse state. If its meaning or the original admission cannot be proved,
do not serve protected content or quietly relabel it.

## Recipient, staff and recovery journeys

### 1. Prepare and issue the request

Use the existing source context, qualified recipient and purposeful requested
items. The admitted source policy must already distinguish unfinished-stage
and overall limits. Do not add a “choose your security model” picker for every
sender. Show the material current terms in the existing review, using only
metadata that actor may inspect. This review chooses no initial days, anchor,
staff extension privilege or new communications.

If a known earlier cap means the promised completed journey cannot occur,
the source must identify that cohort/limitation before claiming delivery.
Do not hide it in a tooltip or extend the cap to make a demo work.

### 2. Enter, submit and correct

Keep Q01's qualified request-only entry, exact item scope and Q03's deliberate
submission/correction controls. The requested-by target remains separate from
the real access boundary. Use factual timing in main content; avoid three
competing countdowns and avoid saying “complete this by” when staff controls
normal fulfillment.

Example while unfinished: **“Access while this request is unfinished ends
[date/time]. If the organization completes it before then, we’ll show any
available read-only access and its end here.”** This is illustrative copy, not a
substitute for displaying any actual earlier overall limit.

File transfer progress, receipt, checking and business acceptance remain
distinct. No upload-start grace carries unadmitted work across `U`. Already
received attempts recover under Q09 without duplicate upload or destructive
cleanup. A late correction can remain eligible before actual authority ends;
lateness alone does not add a new approval gate.

### 3. Wait for staff review

Show **“Received — awaiting review”** when that is true. Do not label the
recipient late because the source has not fulfilled the request. Show the
applicable access limit without implying that the recipient must chase staff
or resend a file to keep access alive.

In the existing staff work context, show receipt/review state and the access
consequence where the staff actor may inspect it. Make the accountable source
owner/help route real. Do not add an automatic countdown email, escalation
cadence or mandatory urgency queue through this decision.

If an enabled source cannot normally complete review within its proposed
unfinished period, that period/cohort is not qualified. Choose adequate
prospective terms or resolve a separate legitimate recovery capability; do
not falsify fulfillment, extend rights silently or transfer the burden to a
recipient who already did the work.

### 4. Complete normally while eligible

The source performs its actual business completion with exact current
evidence and permission. The predeclared stage consequence needs no separate
recipient visit, “start my 30 days” button or extra staff grant approval.

After confirmed eligible transition, keep the same request view:
**“Request complete”** and **“Read access available until [actual end]”**.
Keep only currently authorized status/history/file actions. Remove ordinary
submission/correction affordances without automatically navigating away from a
file someone is reading or destroying a pending local draft. A stale attempt
receives a safe current-state explanation; no silent submission replay.

Do not promise that all files are downloadable simply because the request is
complete. The current original/preview must independently qualify. Do not
auto-download, imply the recipient read/saved anything, or require a download
to complete the workflow.

### 5. Finish after unfinished access has ended

Staff can still complete under independent source authority. If no eligible
completed admission exists, source success and recipient access unavailability
must be separate outcomes. Do not report the source action failed merely
because no recipient window opened, or report access granted when it did not.

The recipient's ended-access experience remains neutral where disclosure
authority is absent. A previously authorized screen must not become a durable
private metadata fallback. Offer the real safe help route, without promising
Q08, an extension or delivery by email attachment.

An on-time receipt is still true. Expiry does not mean the organization lost
the document, the recipient was late, the request was rejected or the file was
deleted. Staff-facing explanation must also respect who may see restriction
details; a generic source reviewer is not automatically a grant administrator.

### 6. Recover a delay or unknown outcome

If a durably committed fulfillment has a qualified occurrence and eligibility
before `U` but its projection is late, reconcile that effect. After `U`, a stale page or
expiry job must not conclude that completed access never existed. Conversely,
an asserted completion timestamp without historical eligibility is not enough.

Use **“We’re checking the current status”** for genuine uncertainty. Do not
optimistically show success, invent a new end or call unknown state expired.
Continue independently proved work where safe; deny any protected operation
whose required authority cannot be proved. A temporary representation problem
is not a grant failure.

Expired entry/session credentials may require the existing qualified
re-entry path even while the completed authority remains valid. That is proof
recovery, not a new source grant. If existing proof remains compatible and
fresh, do not force another login merely because the stage changed.

### 7. Return, download and reach the completed end

Render actual remaining access and current permitted own-file/history actions.
A link, provider URL or cached state is not independent authority. Full,
HEAD, range, conditional, resume and ongoing streaming paths retain Q04/P12
checks; stage change cannot weaken them or stretch a separate credential cap.
Use feasible termination and truthful buffering/copy limitations.

At expiry, enforce the actual end without depending on a scheduled sweep.
Do not promise recall of already received copies. Q08 remains a separately
qualified fresh-read capability with its original-admission requirements and
still-unselected timing/repetition policy.

### 8. Invalidation, additional work, support and different surfaces

A completed request can later need a source correction or linked remediation.
Preserve the original fulfillment, read-end history and submission lineage.
Do not toggle Done off/on, change `completed_at`, attach a new file to an old
admission, retarget the recipient or reset 30 days. Any authorized new episode
needs its actual scope/policy; Q10 does not create a generic reopen command.

Mission Control, donor, missionary and qualified request-only entry must share
the same source facts while exposing only their allowed views. General donor
membership, staff support access or a matching email cannot inherit this
request. Public CMS/giving surfaces gain no private document visibility.

### Accessibility and constrained conditions

Preserve Base UI/base-maia, shared semantic tokens and familiar layout.
Keyboard, screen-reader and speech names must identify each item/action; touch
targets, focus restoration, zoom/reflow, RTL, long translated dates/names and
small screens need real testing. Do not add international name/address fields
or split-name assumptions to handle this transition.

Announce material status changes appropriately, not every poll or upload byte.
Use actual error text with safe next actions, not color, transient toast or
hover-only dates. Do not steal focus when background completion arrives.

Assess each actual timer under applicable WCAG criteria. The 720-hour maximum
does not certify short proof challenges, sessions or automatically changing
screens. A short remaining interval is not by itself proof of nonconformance;
the actual mechanism and applicable exception must be evaluated. Preserve
owned accommodation/recovery without inventing permission to extend a true cap.

Poor connectivity may delay observations, not change received facts or clocks.
Keep lightweight status reads and avoid fetching every original to show an end.
Do not claim offline access, persistent browser file selection, background
resumption or a private local archive unless actually supported and qualified.

## Exact required amendments

These are ratified grooming clauses for later authorized canonical publication.

| ID                                     | Required language                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q10-C01 Prospective stage scope        | The ordinary source policy SHALL declare finite unfinished access and its eligible Q06/Q07 transition before admission. The unfinished deadline SHALL NOT cap a validly admitted completed stage solely through its old stage role. Existing or unknown overall limits SHALL NOT be relabeled; specialized owners remain authoritative.                                                                                                      |
| Q10-C02 Complete finite initial policy | Activation SHALL require a finite applicable unfinished end and exact source/recipient/action scope. Q10 selects no initial duration/anchor or extension. Null, infinity, missing policy, absent visit or unfinished review SHALL NOT mean indefinite access.                                                                                                                                                                                |
| Q10-C03 Qualified fulfillment          | Completed admission SHALL require exact durable normal fulfillment strictly before the applicable exclusive unfinished end with proved at-fulfillment policy and recipient eligibility. Receipt, scan, task flag, backdated caller time and processing time SHALL NOT substitute. Source completion may succeed independently without recipient admission.                                                                                   |
| Q10-C04 Preserve true caps             | Every limit SHALL retain its declared action/stage/purpose scope. Q07's original 720-hour maximum, admitted applicable overall caps and later genuine cross-stage shortening SHALL remain effective. Removing a cause SHALL NOT restore a longer end. A stage-only change cannot silently alter a different limit or create new editing power.                                                                                               |
| Q10-C05 Atomic source order            | Fulfillment/admission SHALL share the relevant serialized source order with correction/review-set, recipient, revocation, disposition and policy changes. Required facts/provenance/effect intent SHALL be durable atomically or through an equivalent recoverable fail-closed owner contract. Check current state/time after waits; never call providers under source locks.                                                                |
| Q10-C06 Historical recovery            | Delayed/retried processing SHALL prove the original fulfillment occurrence, policy, exact scope, eligibility and applicable caps, then apply current authority. Recover the original end; never processing-time plus 30 days, current-state fabrication or revival from actual late fulfillment.                                                                                                                                             |
| Q10-C07 Fenced expiry and projections  | Expiry jobs, timers, caches and projections SHALL check current authoritative stage/effect/policy before consequences. A stale unfinished command SHALL NOT end a valid completed admission; lag SHALL NOT extend truly ended authority. A proven derived-expiry error requires attributed owner repair preserving genuine adverse history, not blanket disregard of Expired/Revoked state. Enforce current expiry without sweep dependence. |
| Q10-C08 One durable effect             | One source fulfillment occurrence and recipient-admission consequence SHALL converge across duplicate events, concurrent workers, lost responses and key expiry. Bind exact context/payload; conflicting reuse SHALL fail. Retries cannot reopen, widen scope, alter the original end or leak stored results without current disclosure authority.                                                                                           |
| Q10-C09 Read-only exact scope          | Normal fulfillment SHALL stop ordinary submission/correction. Preserve Q03's predecessor fence and relevant evidence-set ordering. Completed reads SHALL include only the exact eligible recipient/purpose/current own-submission scope and Q04/Q05 actions; no new siblings, historical bytes, recipients or independent uses are added.                                                                                                    |
| Q10-C10 No lifecycle reset             | Later invalidation, new work, reopening requests or factual correction SHALL use the owning domain's explicit procedure with prior evidence retained. They SHALL NOT reset completion/end, revive ordinary intake, restore predecessors or automatically issue Q08 access. Canceled/rejected/withdrawn outcomes do not become normal fulfillment by shorthand.                                                                               |
| Q10-C11 Proof and credentials          | Eligibility for the declared source transition SHALL NOT require the recipient browser to be open. Every protected use still requires current qualified proof and permission. Stage transition SHALL NOT extend invitation/session/provider credentials; reuse compatible valid proof or the existing qualified re-entry path without unselected enrollment or ceremony.                                                                     |
| Q10-C12 Every private delivery         | Current authorization and exact representation eligibility SHALL protect metadata/history/search/counts, originals/previews, replay and all full/HEAD/range/conditional/resume/stream paths. Old tokens/URLs or cached stage state SHALL NOT grant access. Preserve inherited stream expiry, feasible revocation and honest copy limitations.                                                                                                |
| Q10-C13 Truthful independent outcomes  | Business completion, recipient admission, current access, proof/session, file readiness, notification and observer uncertainty SHALL remain distinct. Missing admission does not invalidate independently permitted source completion. Unknown outcome SHALL be reconciled before new effects; preserve independently proved work during partial failures, without fabricated success, expiry, rejection or empty history.                   |
| Q10-C14 Recipient and staff clarity    | Keep the same source task context, truthful Received/Awaiting review/Complete states, current relevant boundary and actual completed-read end. Staff delay SHALL NOT become recipient lateness. Surface the access consequence to the appropriately authorized source owner; do not invent extra approval, reminder cadence, forced download or urgency-driven false completion.                                                             |
| Q10-C15 Accessible temporal journey    | Preserve shared Base UI/base-maia, semantics, keyboard/focus, speech/AT, touch, reflow/RTL/localization and qualified timing behavior. No countdown-only/color-only/toast-only essential information or background focus theft. Actual session and opportunity timers require applicable accessibility proof, not a blanket security exemption.                                                                                              |
| Q10-C16 Database and role enforcement  | Enforce same-tenant/environment/source/recipient/evidence relationships, semantic uniqueness, required finite values, legal states, trusted attribution and deliberate delete behavior. Actual grants, effective USING/WITH CHECK, views/RPC/definer/service/storage paths SHALL prevent forged time/scope/stage and allowed-row updates into forbidden states.                                                                              |
| Q10-C17 Custody and retention          | Stage transition/expiry SHALL NOT alter records retention, holds, independent source uses or disposal authority. Technical checks and qualified representation repair may continue under their own authority without new recipient rights, clock extension, substitute content or recall claims.                                                                                                                                             |
| Q10-C18 Communication boundary         | Transition, notification and entry delivery SHALL remain separate effects. Q10 selects no automatic message or cadence. Any separately authorized communication SHALL use P17/P6, exact source event identity and current eligibility; resend/failure SHALL NOT reset time or attach private files as a bypass.                                                                                                                              |
| Q10-C19 Bounded architecture           | Reuse source/PDP/custody/tasks/worker infrastructure. Use bounded scoped queries, indexed effect/eligibility lookups, appropriate contention boundaries and measured budgets. No new permission engine, workflow service, complete-history scan per read, global lock or provider fan-out is justified.                                                                                                                                      |
| Q10-C20 Durable minimal evidence       | Preserve original policy/limit scope, fulfillment, eligibility basis, admission/end, genuine restriction and remediation provenance under owned records rules. Separate durable business/security history from minimized technical diagnostics. No private filenames/content, recipient addresses, selectors/verifiers or sensitive policy reasons in general telemetry.                                                                     |
| Q10-C21 Prospective compatible rollout | Enable only qualified cohorts and compatible readers/writers/expiry jobs. Do not relabel legacy ends, backfill eligibility from task timestamps or revive access on restore. Kill/rollback/roll-forward SHALL preserve facts and deny unsafe fallback; they cannot reintroduce the obsolete stage cap or reopen submissions.                                                                                                                 |
| Q10-C22 Qualified usefulness and trace | Before activation, prove useful source review timing, exact real-role/race/provider/recipient journeys and an accountable help route. Unfinished-expiry recovery and Q08 fresh policies remain explicit separate capabilities. Trace this choice through glossary/ADR, authorized owner/OpenSpec sources, tasks/tickets and release evidence; adjacent tests are not native qualification.                                                   |

## Category-by-category adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: yes. Severity: medium. Likelihood: medium.**
A can lengthen access without useful follow-up if applied to the wrong purpose.
Q06/Q07 establish the intended follow-up, while B remains a credible overall
ceiling. **Effect on A:** narrow to the qualified ordinary cohort, not every
document. **Permanent fix:** C01/C02/C22 and P01/P29 require explicit finite
scope and usefulness evidence. Neither competitor exports nor a polished
screen proves ministry demand or an ideal initial period.

### 2. Brittleness

**Material concern: yes. Severity: high. Likelihood: high.**
A generic `expires_at`, task flag or pre-wait timestamp can select the wrong
stage or make late fulfillment look timely. Current mutable task completion
and PostgreSQL clock semantics make these concrete reuse hazards.
**Effect:** refine the transition. **Fix:** prove exact source occurrence,
limit scope and post-wait currentness, C03–C07; P02–P08. A timestamp comparison
alone is not historical authorization.

### 3. Technical debt

**Material concern: yes. Severity: medium. Likelihood: high.**
Separate deadline engines or app-local permission booleans would create
divergent donor, missionary and staff behavior. Core's shared boundaries
already reject that architecture. **Effect:** constrain implementation, not A.
**Fix:** one source policy and shared PDP/projections, C01/C07/C19/C21;
P20/P27/P28. No unrelated task-system rewrite is required.

### 4. Edge cases

**Material concern: yes. Severity: high. Likelihood: high.**
Fulfillment exactly at expiry, session absence, zero submitted files under an
already-authorized source outcome, partial preview/history failure and later
invalid evidence can produce false completion or denial. Q03/Q06/Q07 require
more than a two-state screen. **Effect:** refine A. **Fix:** the explicit
lifecycle matrix, C03/C09–C13; P02/P09/P13/P16/P17/P21. Retain the actual source
predicate instead of inventing file-count or preview-readiness requirements.

### 5. Footguns

**Material concern: yes. Severity: high. Likelihood: medium.**
Mark complete, resend, restore or deadline renaming could quietly award another
period; staff might approve deficient evidence to beat expiry. The generic
task PATCH can rewrite completion time, so reuse is unsafe. **Effect:** amend
the command and UX boundary. **Fix:** C03/C08/C10/C14; P03/P09/P15/P29.
Show the consequence without adding an incentive or shortcut to falsify outcome.

### 6. Tenant safety

**Material concern: yes. Severity: critical. Likelihood: medium.**
A transition or replay keyed only by a generic identifier could bind another
recipient, purpose, tenant or request's evidence. Existing transport dedupe is
not proof of exact source relationships. **Effect:** constrain admission and
every projection. **Fix:** trusted relationships, exact effect comparison and
scoped disclosure, C08/C09/C12/C16; P18–P21. A past valid transition does not
freeze permission across tenant or recipient changes.

### 7. Database, RLS, and authorization safety

**Material concern: yes. Severity: critical. Likelihood: medium.**
A privileged completion command could forge historical eligibility, change a
row's scope or require a grant for every business completion. Actual service
clients bypass ordinary browser RLS protections; no native role proof exists.
**Effect:** require source and database qualification. **Fix:** C05/C16/C20;
P06/P10/P18/P19. Enforce relationships, immutable attribution and valid
old-to-new transitions while permitting completed-without-recipient-admission.

Inspect composed policies, column privileges, views, definer ownership/search
paths and storage/service routes. PostgreSQL may inherit `WITH CHECK` from
`USING`; its omission alone is not a bypass. Same-tenant FKs, semantic uniqueness,
finite required values and deliberate delete rules supplement the mutation
boundary; a time-dependent CHECK cannot replace current authorization.
Money precision is unaffected.

### 8. Overengineering

**Material concern: yes. Severity: medium. Likelihood: medium.**
Two stages could become two grant systems, a policy builder, an extra approval
or a general archive. None is necessary; the source already needs exact
fulfillment and read authorization. **Effect:** simplify implementation scope.
**Fix:** C01/C11/C14/C19; P13/P27/P29. Use one prospective policy and the
existing request view, without arbitrary duration pickers or a new portal.

### 9. UX/UI and user friction

**Material concern: yes. Severity: high. Likelihood: high.**
Unconditional “30 days,” three countdowns, an expired banner from stale state,
or blaming a timely submitter can prevent completion and cause duplicate work.
W3C guidance and the source lifecycle support distinct factual states.
**Effect:** amend the journeys. **Fix:** C11–C15/C22; P04/P11/P13/P22/P23/P29.
Show the next actor/action and actual relevant end, preserve focus, and keep
legitimate existing actions available during a partial projection failure.

### 10. Source of truth, ownership, and domain invariants

**Material concern: yes. Severity: high. Likelihood: high.**
A task, scanner, provider event or present-day grant row could become the
authority for past fulfillment and future access. Q06/Q07 and Workflow's
source/outbox contract explicitly reject that substitution. **Effect:** refine
the model. **Fix:** C03–C06/C09/C20; P03/P04/P10/P12/P30. Preserve the source
outcome, admission consequence and current authorization as distinct facts.

### 11. Hidden coupling

**Material concern: yes. Severity: high. Likelihood: medium.**
An entry token expiring at U can wrongly truncate a legitimate completed
stage, or be stretched to bypass its own restrictions. Worker leases,
notification success and preview readiness can similarly acquire unintended
authority. ADR-0025/0037 distinguish those mechanisms. **Effect:** refine
integration. **Fix:** C11/C12/C17/C18; P13/P16/P24/P26. Qualified re-entry
uses current source rights; technical refresh never renews them.

### 12. Failure modes

**Material concern: yes. Severity: high. Likelihood: high.**
A lost completion response or stale expiry job can erase a valid completed
view, issue another interval or trigger destructive compensation. The
inspected handoff/custody mechanisms show why “error means no effect” is not
safe. **Effect:** amend recovery. **Fix:** C05–C08/C13; P04–P08/P11/P25.
Recover the same original effect; distinguish business success, absent
admission and failed projection.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: yes. Severity: high. Likelihood: high.**
Completion, correction, expiry, revocation and recipient changes can each
appear valid on different snapshots; reopen cycles can extend time forever.
Q03/Q06 and Workflow require authoritative ordering. **Effect:** require
exact transition semantics. **Fix:** C03–C10; P02/P06–P09/P14/P15.
Retain one original occurrence/end and test missing-row races as well as
existing-row locks. Current proof and historical eligibility are separate.

### 14. Data integrity risks

**Material concern: yes. Severity: high. Likelihood: medium.**
Overwriting U with E destroys why transition was permitted; copying a “latest”
file expands scope; forcing a grant row can corrupt truthful late completion.
The current mutable task and generic ledger models do not prove those
invariants. **Effect:** refine persistent evidence. **Fix:** C05/C08–C10/C16/C20;
P09/P10/P12/P15/P18/P30. Preserve original deadline scope, exact membership,
source facts and separately attributable corrections.

### 15. Security and privacy risks

**Material concern: yes. Severity: critical. Likelihood: medium.**
Ignoring an overall cap after completion or replaying a private result after
revocation can expose sensitive submitted material and request participation.
Q01/P12 and Q04/Q05 remain binding through both stages. **Effect:** narrow all
paths. **Fix:** C04/C11/C12/C16/C20; P07/P14/P18–P21/P24.
Retained bytes, a help role, a shared email or a cached success are not permission.

### 16. Scalability and performance risks

**Material concern: yes. Severity: medium. Likelihood: medium.**
Reconstructing full permission history for every file row, global expiry scans
or provider calls under a lock can degrade with tenant skew and concurrent
downloads. No workload evidence supports a performance claim yet.
**Effect:** require bounded design, not a new platform. **Fix:** C05/C07/C19;
P27. Use suitable indexes and measured page/query/byte/concurrency budgets;
no invented numerical initial SLA or global serialization.

### 17. Operational burden

**Material concern: yes. Severity: high. Likelihood: medium.**
Requests can expire while staff review remains, producing support dead ends,
manual date repair or pressure to backdate completion. That is a real
consequence of the selected no-revival policy, not a user error.
**Effect:** condition activation on usable source handling. **Fix:** C13/C14/C22;
P10/P22/P29. Require accountable help and cohort qualification; do not invent
automatic extensions, reminders or recovery powers to hide the gap.

### 18. Observability and auditability gaps

**Material concern: yes. Severity: high. Likelihood: medium.**
Without limit scope, original eligibility and source occurrence evidence,
staff cannot explain a short end or distinguish delayed recovery from revival.
Generic traces and mutable timestamps cannot supply that history.
**Effect:** amend evidence. **Fix:** C06/C08/C20; P04/P12/P30.
Separate business/security records from minimized diagnostics and keep private
restriction reasons out of broadly visible support/log views.

### 19. Dependency and integration risks

**Material concern: yes. Severity: high. Likelihood: medium.**
Delayed or reordered workflow events, expired worker claims or provider URLs
could control the stage incorrectly. The inspected ledger protects handoff
recovery, not native authorization or source atomicity. **Effect:** constrain
integration. **Fix:** C05–C08/C11/C18/C19; P04/P11/P24–P26.
Pin exact source effects and treat messages/claims as transport, not permission.

### 20. Migration, rollout, and upgrade risks

**Material concern: yes. Severity: high. Likelihood: medium.**
Old workers may expire every grant at U; new readers may treat legacy absolute
ends as stage-only; restore may omit a later revocation. These mixed semantics
can either expose private data or wrongly remove valid access.
**Effect:** limit adoption and require compatibility. **Fix:** C01/C07/C21;
P01/P07/P28. Migrate only proved meanings, fence old jobs and preserve adverse
history. After new facts exist, rollback cannot simply reinstall old semantics.

### 21. Testability, traceability, and proof

**Material concern: yes. Severity: high. Likelihood: high.**
A formula test, mock handoff or attractive screen could be presented as proof
of real native-stage safety. The census has not established that implementation.
**Effect:** require falsifiable qualification. **Fix:** C22 and P01–P30,
linked through source-owned specification and release evidence. Keep selected,
ratified, implemented and activated states explicit; six adjacent tests cover
only their stated seam.

### 22. Other development hazards

**Material concern: no additional independent concern found.**
Checked financial arithmetic, official-document identity, new dependencies,
public CMS/giving access, storage expansion and publication authority.
This decision adds none of those. Disaster restore, unsafe defaults,
unqualified lifetime values and support ownership already have specific
requirements above. This is not a claim that the unbuilt native feature is safe.

## Proof required before activation

Each proof asserts observable business, permission or user outcomes against
the actual chosen source. Mock formulas and migration-text checks alone cannot
prove these requirements.

| ID      | Falsifiable acceptance proof                                                                                                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q10-P01 | A newly admitted cohort proves finite U and its prospective stage scope. Existing overall, specialized and unknown legacy ends cannot be relabeled. Missing/nonfinite initial policy prevents activation, without borrowing a default from another purpose.                                                                                                              |
| Q10-P02 | Actual eligible fulfillment immediately before, exactly at and after U gives the correct transition/no-transition outcome at authoritative precision. E never exceeds F + 720 elapsed hours or applicable true caps; DST/display changes do not alter it.                                                                                                                |
| Q10-P03 | Upload, clean scan, preview, generic task state, caller/backdated timestamp, email and browser events cannot manufacture normal fulfillment. Already-authorized non-file/manual/waived source outcomes use their actual predicate, without an invented file-count requirement.                                                                                           |
| Q10-P04 | Eligible durable fulfillment before U with processing/reply first arriving after U but before E recovers the same completed admission/end under current authority; it is not denied solely by old U and never becomes processing-time plus 30 days.                                                                                                                      |
| Q10-P05 | The same delayed event arriving at/after E preserves source history but exposes no expired ordinary reading or new interval. A Q08 path, if any, must independently qualify.                                                                                                                                                                                             |
| Q10-P06 | Relevant source/permission locks cross U, including a second wait after an initial time sample. Qualify candidate F before U with physical commit after U under the exact source occurrence/linearization contract, including rollback and unknown-commit recovery; an early SQL timestamp alone cannot establish eligibility. Rollback produces no admitted transition. |
| Q10-P07 | Delayed unfinished-expiry jobs, stale caches and restore workers cannot terminate a proved valid completed stage. Genuine later revocation/overall shortening still denies; uncertain/proven erroneous derived expiry follows its explicit owner repair, not blanket status bypass.                                                                                      |
| Q10-P08 | Concurrent completion commands, duplicate/out-of-order callbacks, transport-key expiry and worker retries converge on one exact fulfillment/admission/end. Conflicting source/recipient/payload reuse fails; a stale runner cannot commit a second effect.                                                                                                               |
| Q10-P09 | Correction admission races acceptance/fulfillment: exact review-set ordering preserves Q03's immediate predecessor fence, siblings and independent uses. When fulfillment wins, a stale ordinary correction is denied without silent retargeting.                                                                                                                        |
| Q10-P10 | Source business completion can persist with no recipient admission, including actual fulfillment after U and absent eligible recipient. On-time receipts and independent staff processing remain true; no automatic Q08 or false source failure.                                                                                                                         |
| Q10-P11 | Lost response after commit, definitely rejected mutation and unresolved outcome produce distinct recoveries. Replay preserves the original effect, requires current disclosure and cannot trigger duplicate work or destructive cleanup.                                                                                                                                 |
| Q10-P12 | Historical policy/recipient/evidence/cap proof is required; current role/email/status or an asserted completion time cannot fabricate it. Missing admission evidence does not corrupt valid source completion.                                                                                                                                                           |
| Q10-P13 | No open recipient browser is needed for an otherwise qualified transition. Compatible existing proof can continue; expired proof requires qualified re-entry, without extra enrollment, timer start, unrequested download or automatic replay.                                                                                                                           |
| Q10-P14 | A genuine overall cap and later cross-stage shortening survive fulfillment and later cause removal. An explicitly stage-only deadline change retains its own applicability and grants no new edit power. Unknown scope is not guessed.                                                                                                                                   |
| Q10-P15 | Complete/open/complete toggles, new items, recipient replacement, factual corrections and later remediation cannot reset E, reopen ordinary writes, expand old scope or revive superseded content.                                                                                                                                                                       |
| Q10-P16 | Valid completed authority with one failed preview/history/download projection preserves independently permitted work and truthful status. Temporary representation repair cannot reset E or substitute another original.                                                                                                                                                 |
| Q10-P17 | Canceled, rejected, withdrawn, unknown and normally fulfilled source outcomes remain distinct. Expiry does not fabricate rejection/completion/deletion; required custody/holds and independent uses remain unchanged.                                                                                                                                                    |
| Q10-P18 | Cross-tenant/environment/source/recipient IDs, caller-supplied actor/time/approval/end/stage and same-email assumptions fail in commands, jobs, replay and projections without protected existence leaks.                                                                                                                                                                |
| Q10-P19 | Real role/grant/column/RLS USING/effective WITH CHECK, views/RPCs/definer/service/storage tests reject valid-old-row to forbidden-new-row transitions and prove same-scope relationships, uniqueness, finite values, historical integrity and delete behavior.                                                                                                           |
| Q10-P20 | Current stage/authority governs metadata/history/counts/search/pagination, response replay, browser/client/CDN/service-worker caches and cross-account return. Stale successful JSON cannot serve private results after true expiry/revocation.                                                                                                                          |
| Q10-P21 | Exact original/preview identity, independent whole-file permission, full/HEAD/range/conditional/resume and streams across transition/U/E preserve Q04/P12 expiry, tiered audit and feasible termination; no source-capability grace or copy-recall claim.                                                                                                                |
| Q10-P22 | Recipient and authorized staff views show correct next actor, received/awaiting-review/completed states and actual relevant end before/after transition. Staff-review expiry does not blame recipients, prompt duplicate upload or encourage unsafe early certification.                                                                                                 |
| Q10-P23 | Keyboard, speech, screen-reader, touch, zoom/reflow, RTL/translated/long dates and actual timing/authentication flows pass the relevant manual/automated criteria. Status changes do not steal focus or depend solely on color/toast/countdown.                                                                                                                          |
| Q10-P24 | An expired verifier/session/provider capability remains expired despite a valid completed source right; the existing qualified entry/delivery route can access still-valid rights safely. Delayed/duplicated provider results cannot set or extend F/E.                                                                                                                  |
| Q10-P25 | Producer crash before handoff, send failure, lost wake, stale lease and failed projection recover from durable source intent without new source effects; source completion/admission and transport success are not conflated.                                                                                                                                            |
| Q10-P26 | Transition alone sends no unselected message. Separately authorized notices preserve producer/currentness/recipient/effect rules; send failure, resend, click and help do not change stage or end, and no private attachment bypass appears.                                                                                                                             |
| Q10-P27 | Production-shaped tenant skew, large member/history sets, concurrent completions/reads and retry bursts remain within declared numeric query/page/lock/byte/latency budgets at limit and excess; no complete-history read or global expiry sweep controls correctness.                                                                                                   |
| Q10-P28 | Prospective migration, mixed readers/writers/expiry jobs, backup restore, feature stop and rollback/roll-forward preserve original policy scope, fulfillment, admission and adverse history without widening access or silently imposing old overall-cap behavior.                                                                                                       |
| Q10-P29 | Representative recipient/reviewer/help journeys understand the conditional stages and actual ends, handle interrupted mobile/low-bandwidth use, and have a workable owned response to expiry during review. Report cohort/sample limits; initial policy must support the claimed journey without hidden extensions.                                                      |
| Q10-P30 | Durable authorized evidence explains why a transition was admitted, absent, restricted or recovered while general diagnostics omit private content/filenames/addresses/credentials and do not claim notification, reading or device saving that was not proved.                                                                                                          |

Fresh bounded evidence this turn: **6 existing tests passed; 17 were
intentionally filtered out across 2 files**, Vitest 5.0.3 on Node 24.21.0,
duration 1.16 seconds. These are different tests from Q09's task-hook run:

- `dispatch-ledger.test.ts`: three selected mocked cases cover preserving
  dispatched state against a concurrent failure, recoverable failed handoff,
  and not resending an already-dispatched request.
- `work-claims-recovery.test.ts`: three selected mocked cases cover acquired
  claims, skipped active claims and tenant-scoped claim calls.

The runtime reviewer ran these with a cleared environment, dummy loopback
values, a read-only repository, masked root env files, temporary storage and
disabled networking. They verify those mocked handoff/recovery seams, not
native stages, actual SQL concurrency/RLS, expiry, providers or browser/AT.
The [runtime note](phase29-q10-runtime-adversarial.md) records the exact filter,
execution conditions and source boundaries. No new test or product code was
written merely to mirror this proposed design.

## Synthesis and sequencing

1. **Ratified decision:** Conrad adopted the exact stage scope, original
   transition evidence, preserved true caps, no-revival rules, stale-expiry
   fencing and truthful staff-review-expiry journey. These fix ambiguities in
   A; they are not optional extras. The founder record below preserves adoption
   of the complete amendment package.
2. **At authorized specification/design work:** map the native source and
   P4/P12 admission/currentness boundary, canonical owner predicates, limit
   applicability, state/error contracts, database relationships, lifecycle
   history and shared UI. Resolve initial anchor/duration and usable source
   cohorts; do not hide those choices in token defaults. Any active-expiry
   recovery and Q08 timing/repetition remain explicit separate capabilities.
3. **Implementation safeguards:** use one source-owned serialized outcome
   with exact evidence, durable intent and independently authorized read
   projections. Fence old expiry jobs and stale consumers, preserve Q03
   corrections, current private serving and safe unknown-outcome recovery.
   No new generic permission/calendar/workflow platform is warranted.
4. **Qualification and rollout:** prove P01–P30 with actual roles, database
   races, failure injection, source clock, mixed versions and real
   recipient/reviewer/help journeys. Establish numeric operational budgets
   and a useful finite initial policy. Activate bounded cohorts only after
   those gates, retaining an effective stop and forward repair path.
5. **Residual operation:** use the named controls below. Monitoring cannot
   replace invariants, create a permission exception or turn every expiry
   into a new staff queue. Known usability gaps require correction before
   broader activation, not optimistic “modern UX” claims.

The exact answer must remain traceable from this grill record to the glossary
and feature ADR, then to the canonical owner requirement/generated OpenSpec,
design/tasks, authorized tickets, implementation and release evidence.
Formal PRD/OpenSpec publication awaits `/to-prd`; tickets await `/to-issues`.
No evidence below makes a selected/ratified document an activated feature.

## Residual operational controls

These are ratified correctness triggers, not observed rates. Any budget named
below must have an actual numeric value and accountable role before activation.

| Signal                                                                                 | Threshold                                                                                               | Owner                                         | Required response                                                                                                                                         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized or post-end private read/admission                                        | Any confirmed occurrence                                                                                | Source authorization owner + security on-call | Stop affected path/cohort, contain disclosure, preserve minimal evidence and requalify.                                                                   |
| Valid completed admission ended by stale unfinished state                              | Any reproducible occurrence                                                                             | Source/runtime owner                          | Reconcile original source effect; correct proved derived error without changing E or bypassing genuine restrictions.                                      |
| Duplicate fulfillment/admission, end growth or superseded acceptance                   | Any invariant violation                                                                                 | Source mutation owner                         | Suspend offending mutation/replay path, preserve history, reconcile exact outcome and regression-test.                                                    |
| Unknown transition cannot be resolved within owner budget                              | Any operation beyond the declared numeric reconciliation bound                                          | Source operations owner                       | Escalate same-effect recovery; no fresh grant, backdate or destructive compensation.                                                                      |
| Staff-review expiry defeats the claimed cohort journey                                 | Any critical qualification failure; production rate exceeds the source's numeric service-plan threshold | Product/source owner                          | Block wider activation or revisit qualified cohort/initial policy through explicit decisions; never certify deficient evidence or silently extend access. |
| Incorrect recipient blame, duplicate-upload prompt or critical accessible task failure | Any reproducible occurrence                                                                             | Product/accessibility owner                   | Correct state/copy/interaction, preserve received facts and re-test affected journeys.                                                                    |
| Query/lock/egress/retry budget breach                                                  | Any configured qualification limit exceeded; production alert at the declared limit                     | API/storage operations owner                  | Bound the affected lane, diagnose hot scope and preserve authorized recovery; do not weaken checks.                                                       |
| Restore/version incompatibility loses caps or source evidence                          | Any failed compatibility/canary check                                                                   | Release/source owner                          | Keep affected cohort closed, reconcile history/adverse state and roll forward safely before serving.                                                      |

## Recorded outcome and remaining proof

Q10 A and its complete required amendment package are ratified by Conrad,
2026-10-20. The reviewed disposition was **Accept with required amendments**;
the exact corrected decision, Q10-C01–C22, Q10-P01–P30, reviewed lifecycle/UX
and all eight operational controls are adopted grooming intent. No initial
duration/anchor, new deadline-edit/extension/recovery power, reminder,
fresh-access setting, implementation or Q11 choice is inferred.

## Founder ratification — 2026-10-20

Conrad instructed: “Yes, ratify Q10 A with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the exact corrected decision, Q10-C01–C22, Q10-P01–P30, reviewed
lifecycle and eight journey groups, and all eight operational controls.
Recording changes status and trace; substantive decision, clauses, proof,
journeys and controls are preserved. No initial clock/duration, new authority,
communication, implementation or formal publication choice is inferred.
